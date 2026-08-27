import { mkdirSync } from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import YTDlpWrap from './ytdlp-lib.js';
import { printWarning } from './ui.js';

function heightCap(quality) {
  if (quality === 'best') return '';
  const height = parseInt(quality, 10);
  return Number.isNaN(height) ? '' : `[height<=${height}]`;
}

// Prefer H.264/AAC streams in an mp4 container first — the only combination
// virtually every player (Windows Media Player, QuickTime, phones, smart TVs)
// can decode. Only fall back to VP9/AV1+Opus (remuxed into .mp4) when no
// compatible stream exists at all, since some players choke on that.
function videoFormatSelector(quality) {
  const h = heightCap(quality);
  return [
    `bestvideo[ext=mp4][vcodec^=avc1]${h}+bestaudio[ext=m4a]`,
    `bestvideo[ext=mp4]${h}+bestaudio[ext=m4a]`,
    `best[ext=mp4]${h}`,
    `bestvideo${h}+bestaudio`,
    `best${h}`,
  ].join('/');
}

export function buildArgs({
  url,
  mode,
  quality,
  audioFormat,
  outputDir,
  ffmpegAvailable,
  jsRuntimeArgs = [],
  ffmpegLocationArgs = [],
}) {
  const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s');
  const args = [
    url,
    '-o',
    outputTemplate,
    '--no-playlist',
    '--newline',
    ...jsRuntimeArgs,
    ...ffmpegLocationArgs,
  ];
  const warnings = [];

  if (mode === 'audio') {
    args.push('-x', '--audio-format', audioFormat, '-f', 'bestaudio/best');
    if (!ffmpegAvailable) {
      warnings.push(
        'ffmpeg was not found — audio extraction may fail or the file may keep its original codec.'
      );
    }
  } else if (ffmpegAvailable) {
    args.push('-f', videoFormatSelector(quality), '--merge-output-format', 'mp4');
  } else {
    const h = heightCap(quality);
    args.push('-f', `best[ext=mp4]${h}/best${h}`);
    warnings.push(
      'ffmpeg was not found — separate video/audio streams cannot be merged, so quality is limited to a single pre-merged format. Install ffmpeg for full quality and best compatibility.'
    );
  }

  return { args, warnings };
}

const DESTINATION_PATTERNS = [/Destination:\s*(.+)$/, /Merging formats into "(.+)"$/];

export async function downloadMedia({
  binaryPath,
  url,
  mode,
  quality,
  audioFormat,
  outputDir,
  ffmpegAvailable,
  jsRuntimeArgs,
  ffmpegLocationArgs,
}) {
  mkdirSync(outputDir, { recursive: true });

  const ytDlpWrap = new YTDlpWrap(binaryPath);
  const { args, warnings } = buildArgs({
    url,
    mode,
    quality,
    audioFormat,
    outputDir,
    ffmpegAvailable,
    jsRuntimeArgs,
    ffmpegLocationArgs,
  });
  warnings.forEach(printWarning);

  const bar = new cliProgress.SingleBar(
    {
      format: `${chalk.cyan('{bar}')} {percentage}% | {sizeStr} | {speedStr} | ETA {etaStr}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      clearOnComplete: false,
    },
    cliProgress.Presets.shades_classic
  );
  bar.start(100, 0, { sizeStr: '--', speedStr: '--', etaStr: '--' });

  let outputFile;
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    ytDlpWrap
      .exec(args)
      .on('progress', (progress) => {
        bar.update(progress.percent ?? 0, {
          sizeStr: progress.totalSize ?? '--',
          speedStr: progress.currentSpeed ?? '--',
          etaStr: progress.eta ?? '--',
        });
      })
      .on('ytDlpEvent', (eventType, eventData) => {
        for (const pattern of DESTINATION_PATTERNS) {
          const match = eventData.match(pattern);
          if (match) outputFile = match[1];
        }
      })
      .on('error', (error) => {
        bar.stop();
        console.error(chalk.bold.red('✖ Download failed'));
        reject(error);
      })
      .on('close', () => {
        bar.update(100);
        bar.stop();
        console.log(chalk.bold.green('✔ Download finished'));
        resolve({ outputFile, elapsedSeconds: ((Date.now() - startedAt) / 1000).toFixed(1) });
      });
  });
}
