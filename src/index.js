#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { isFfmpegAvailable, resolveJsRuntimeArgs, resolveYtDlpBinaryPath } from './binaries.js';
import { downloadMedia } from './downloader.js';
import { PLATFORMS, hostMatchesPlatform } from './platforms.js';
import boxedSelect from './prompts/boxedSelect.js';
import { formatBytes, printHeader, printResultTable, printSummaryTable } from './ui.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const cliArgs = process.argv.slice(2);

if (cliArgs.includes('--version') || cliArgs.includes('-v')) {
  console.log(pkg.version);
  process.exit(0);
}

if (cliArgs.includes('--help') || cliArgs.includes('-h')) {
  console.log(`
ComfyClips ${pkg.version}
${pkg.description}

Usage:
  comfyclips             Start the interactive downloader
  comfyclips --version   Print the version number
  comfyclips --help      Show this help message
`);
  process.exit(0);
}

process.stdin.on('keypress', (_str, key) => {
  if (key?.name === 'escape') {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    console.log(chalk.yellow('\nCancelled.'));
    process.exit(0);
  }
});

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return 'Please enter a valid URL (including https://)';
  }
}

async function main() {
  printHeader();

  const platform = await boxedSelect({
    message: 'Select a social media platform:',
    choices: PLATFORMS,
  });
  const platformName = PLATFORMS.find((p) => p.value === platform).name;

  const { url } = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Paste the video link:',
      validate: isValidUrl,
    },
  ]);

  if (!hostMatchesPlatform(url, platform)) {
    const { proceedAnyway } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceedAnyway',
        message: `That link doesn't look like a ${platformName} URL. Continue anyway?`,
        default: false,
      },
    ]);
    if (!proceedAnyway) {
      console.log(chalk.yellow('Cancelled.'));
      return;
    }
  }

  const mode = await boxedSelect({
    message: 'What do you want to download?',
    choices: [
      { name: 'Video', value: 'video' },
      { name: 'Audio only', value: 'audio' },
    ],
  });

  let quality = 'best';
  let audioFormat = 'mp3';

  if (mode === 'video') {
    quality = await boxedSelect({
      message: 'Select video quality:',
      choices: [
        { name: 'Best available', value: 'best' },
        { name: 'Up to 1080p', value: '1080p' },
        { name: 'Up to 720p', value: '720p' },
        { name: 'Up to 480p', value: '480p' },
      ],
    });
  } else {
    audioFormat = await boxedSelect({
      message: 'Select audio format:',
      choices: ['mp3', 'm4a', 'wav', 'opus'],
    });
  }

  const { outputDir } = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputDir',
      message: 'Where should the file be saved?',
      default: path.join(process.cwd(), 'downloads'),
      filter: (value) => path.resolve(value.trim()),
    },
  ]);

  printSummaryTable({ platformName, url, mode, quality, audioFormat, outputDir });

  const { confirmDownload } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmDownload',
      message: 'Start download?',
      default: true,
    },
  ]);

  if (!confirmDownload) {
    console.log(chalk.yellow('Cancelled.'));
    return;
  }

  try {
    const binaryPath = await resolveYtDlpBinaryPath();
    const ffmpegAvailable = isFfmpegAvailable();
    const jsRuntimeArgs = await resolveJsRuntimeArgs();

    const { outputFile, elapsedSeconds } = await downloadMedia({
      binaryPath,
      url,
      mode,
      quality,
      audioFormat,
      outputDir,
      ffmpegAvailable,
      jsRuntimeArgs,
    });

    let fileSize = 'Unknown';
    if (outputFile) {
      try {
        fileSize = formatBytes(statSync(outputFile).size);
      } catch {
        // File path couldn't be resolved from yt-dlp output; leave as Unknown.
      }
    }

    printResultTable({ outputFile, fileSize, elapsedSeconds, outputDir });
  } catch (err) {
    console.error(chalk.bold.red(`\n✖ Download failed: ${err.message}`));
    process.exitCode = 1;
  }
}

main();
