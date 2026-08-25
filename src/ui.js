import boxen from 'boxen';
import chalk from 'chalk';
import Table from 'cli-table3';
import figlet from 'figlet';

const BRAND = chalk.bold.hex('#00d1b2');
const LABEL = chalk.gray;
const VALUE = chalk.white;

export function printHeader() {
  const logo = figlet.textSync('ComfyClips', { font: 'Small Slant' });
  const title = `${BRAND(logo)}\n${chalk.dim('Social Media Video Downloader')}\n${chalk.dim('Press esc to quit')}`;
  console.log(
    boxen(title, {
      padding: { top: 0, bottom: 0, left: 3, right: 3 },
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: '#00d1b2',
      textAlignment: 'center',
    })
  );
}

function baseTable() {
  return new Table({
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '╭',
      'top-right': '╮',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '╰',
      'bottom-right': '╯',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│',
    },
    style: { head: [], border: ['gray'] },
  });
}

function truncate(value, max = 60) {
  if (typeof value !== 'string' || value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export function printSummaryTable({ platformName, url, mode, quality, audioFormat, outputDir }) {
  const table = baseTable();
  table.push(
    [LABEL('Platform'), VALUE(platformName)],
    [LABEL('Link'), VALUE(truncate(url))],
    [LABEL('Download'), VALUE(mode === 'audio' ? 'Audio only' : 'Video')],
    mode === 'audio'
      ? [LABEL('Audio format'), VALUE(audioFormat.toUpperCase())]
      : [LABEL('Quality'), VALUE(quality === 'best' ? 'Best available' : quality)],
    [LABEL('Save to'), VALUE(truncate(outputDir))]
  );
  console.log(`\n${chalk.bold('Review your selection')}`);
  console.log(table.toString());
}

export function printWarning(message) {
  console.log(chalk.yellow(`⚠ ${message}`));
}

export function printResultTable({ outputFile, fileSize, elapsedSeconds, outputDir }) {
  const table = baseTable();
  table.push(
    [LABEL('File'), VALUE(truncate(outputFile ?? '(unknown — check destination folder)'))],
    [LABEL('Size'), VALUE(fileSize)],
    [LABEL('Time taken'), VALUE(`${elapsedSeconds}s`)],
    [LABEL('Location'), VALUE(truncate(outputDir))]
  );
  console.log(`\n${chalk.bold.green('✔ Download complete')}`);
  console.log(table.toString());
}

export function formatBytes(bytes) {
  if (!bytes || Number.isNaN(bytes)) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
