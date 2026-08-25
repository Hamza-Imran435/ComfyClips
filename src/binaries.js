import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import YTDlpWrap from './ytdlp-lib.js';

const CACHE_DIR = path.join(os.homedir(), '.comfyclips', 'bin');
const YT_DLP_BIN_NAME = os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const CACHED_YT_DLP_PATH = path.join(CACHE_DIR, YT_DLP_BIN_NAME);

function commandExists(cmd, versionFlag = '--version') {
  const result = spawnSync(cmd, [versionFlag], { stdio: 'ignore' });
  return !result.error && result.status === 0;
}

export function isFfmpegAvailable() {
  // ffmpeg uses single-dash flags (-version), unlike most CLIs.
  return commandExists('ffmpeg', '-version');
}

export async function resolveYtDlpBinaryPath() {
  if (commandExists('yt-dlp')) {
    return 'yt-dlp';
  }

  if (existsSync(CACHED_YT_DLP_PATH)) {
    return CACHED_YT_DLP_PATH;
  }

  console.log(chalk.yellow('yt-dlp was not found on your system.'));
  const spinner = ora('Downloading yt-dlp binary (one-time setup)...').start();
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    await YTDlpWrap.downloadFromGithub(CACHED_YT_DLP_PATH);
    spinner.succeed(`yt-dlp downloaded to ${CACHED_YT_DLP_PATH}`);
    return CACHED_YT_DLP_PATH;
  } catch (err) {
    spinner.fail('Failed to download yt-dlp automatically.');
    throw new Error(
      `Could not download yt-dlp: ${err.message}\n` +
        'Please install it manually (https://github.com/yt-dlp/yt-dlp#installation) and ensure it is on your PATH.'
    );
  }
}
