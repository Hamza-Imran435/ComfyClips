import AdmZip from 'adm-zip';
import ffmpegStaticPath from 'ffmpeg-static';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import YTDlpWrap from './ytdlp-lib.js';

// On Vercel (and other read-only-filesystem serverless hosts) only /tmp is
// writable, and it isn't guaranteed to survive across invocations — so this
// falls back to os.tmpdir() there instead of the user's home directory.
const CACHE_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'comfyclips-bin')
  : path.join(os.homedir(), '.comfyclips', 'bin');
const YT_DLP_BIN_NAME = os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const CACHED_YT_DLP_PATH = path.join(CACHE_DIR, YT_DLP_BIN_NAME);
const DENO_BIN_NAME = os.platform() === 'win32' ? 'deno.exe' : 'deno';
const CACHED_DENO_PATH = path.join(CACHE_DIR, DENO_BIN_NAME);
const DENO_LATEST_RELEASE_API = 'https://api.github.com/repos/denoland/deno/releases/latest';
const CACHED_COOKIES_PATH = path.join(CACHE_DIR, 'youtube-cookies.txt');

function commandExists(cmd, versionFlag = '--version') {
  const result = spawnSync(cmd, [versionFlag], { stdio: 'ignore' });
  return !result.error && result.status === 0;
}

// Prefer a system ffmpeg if the user already has one on PATH; otherwise fall
// back to the static binary `ffmpeg-static` already fetched via its own npm
// postinstall step, so no separate download step is needed here.
export function resolveFfmpeg() {
  // ffmpeg uses single-dash flags (-version), unlike most CLIs.
  if (commandExists('ffmpeg', '-version')) {
    return { available: true, locationArgs: [] };
  }
  if (ffmpegStaticPath && existsSync(ffmpegStaticPath)) {
    return { available: true, locationArgs: ['--ffmpeg-location', ffmpegStaticPath] };
  }
  return { available: false, locationArgs: [] };
}

function denoAssetName() {
  const platform = os.platform();
  const arch = os.arch() === 'arm64' ? 'aarch64' : 'x86_64';

  if (platform === 'darwin') return `deno-${arch}-apple-darwin.zip`;
  if (platform === 'win32') return `deno-${arch}-pc-windows-msvc.zip`;
  return `deno-${arch}-unknown-linux-gnu.zip`;
}

async function downloadDeno(destPath) {
  const release = await fetch(DENO_LATEST_RELEASE_API).then((res) => {
    if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
    return res.json();
  });

  const assetName = denoAssetName();
  const asset = release.assets?.find((a) => a.name === assetName);
  if (!asset) throw new Error(`No Deno release asset found for ${assetName}`);

  const zipBuffer = await fetch(asset.browser_download_url).then((res) => {
    if (!res.ok) throw new Error(`Download responded with ${res.status}`);
    return res.arrayBuffer();
  });

  const zip = new AdmZip(Buffer.from(zipBuffer));
  const entry = zip.getEntries().find((e) => e.entryName === DENO_BIN_NAME);
  if (!entry) throw new Error(`${DENO_BIN_NAME} not found inside downloaded archive`);

  zip.extractEntryTo(entry, CACHE_DIR, false, true);
  if (os.platform() !== 'win32') chmodSync(destPath, 0o755);
}

// YouTube's extractor needs a JS runtime (Deno) to solve its signature
// challenge; without one, most modern formats silently disappear from the
// list yt-dlp reports. Auto-provision it the same way we do for yt-dlp
// itself, so `npm install` alone is enough — no manual setup step.
export async function resolveJsRuntimeArgs() {
  if (commandExists('deno', '--version')) {
    return [];
  }

  if (existsSync(CACHED_DENO_PATH)) {
    return ['--js-runtimes', `deno:${CACHED_DENO_PATH}`];
  }

  console.log(chalk.yellow('No JS runtime found — required for reliable YouTube downloads.'));
  const spinner = ora('Downloading Deno runtime (one-time setup)...').start();
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    await downloadDeno(CACHED_DENO_PATH);
    spinner.succeed(`Deno downloaded to ${CACHED_DENO_PATH}`);
    return ['--js-runtimes', `deno:${CACHED_DENO_PATH}`];
  } catch (err) {
    spinner.fail(`Failed to download Deno automatically: ${err.message}`);
    rmSync(CACHED_DENO_PATH, { force: true });
    return [];
  }
}

// Client spoofing alone (see downloader.js) doesn't clear YouTube's bot
// check from every datacenter IP range. When it isn't enough, a real
// logged-in session's cookies do — set YT_COOKIES_B64 to the base64 of a
// Netscape-format cookies.txt exported from a YouTube account (e.g. via the
// "Get cookies.txt LOCALLY" browser extension, while signed in). Returns
// `['--cookies', path]` for buildArgs, or [] if the env var isn't set.
export function resolveCookiesArgs() {
  const encoded = process.env.YT_COOKIES_B64;
  if (!encoded) return [];

  if (!existsSync(CACHED_COOKIES_PATH)) {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(CACHED_COOKIES_PATH, Buffer.from(encoded, 'base64'));
  }
  return ['--cookies', CACHED_COOKIES_PATH];
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
