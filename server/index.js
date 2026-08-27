import cors from 'cors';
import express from 'express';
import { createReadStream } from 'node:fs';
import { mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveFfmpeg, resolveJsRuntimeArgs, resolveYtDlpBinaryPath } from '../src/binaries.js';
import { buildArgs } from '../src/downloader.js';
import { PLATFORMS } from '../src/platforms.js';
import YTDlpWrap from '../src/ytdlp-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE_DIST = path.join(__dirname, '..', 'website', 'dist');

const PORT = process.env.PORT || 8787;

// Keep the web feature from becoming a free-for-all scraper: cap how many
// yt-dlp processes run at once, how long one can run, and how often a single
// visitor can trigger one.
const MAX_CONCURRENT_DOWNLOADS = 3;
// Vercel hard-kills the function at maxDuration (60s on Hobby, see
// vercel.json) with no chance to respond; time out a bit earlier ourselves
// so slow downloads get our friendly error instead of a Vercel crash page.
const REQUEST_TIMEOUT_MS = process.env.VERCEL ? 55 * 1000 : 3 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 6;

const VALID_MODES = new Set(['video', 'audio']);
const VALID_QUALITIES = new Set(['best', '1080p', '720p', '480p']);
const VALID_AUDIO_FORMATS = new Set(['mp3', 'm4a', 'wav', 'opus']);

let activeDownloads = 0;
const requestTimestampsByIp = new Map();

function isSupportedUrl(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return false;
  }
  return PLATFORMS.some((platform) => platform.hostPattern.test(hostname));
}

function withinRateLimit(ip) {
  const now = Date.now();
  const recent = (requestTimestampsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  requestTimestampsByIp.set(ip, recent);
  return recent.length <= RATE_LIMIT_MAX_REQUESTS;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/download', async (req, res) => {
  if (!withinRateLimit(req.ip)) {
    res.status(429).json({ error: 'Too many downloads from this address. Try again later.' });
    return;
  }

  const { url, mode, quality = 'best', audioFormat = 'mp3' } = req.body ?? {};

  if (typeof url !== 'string' || !isSupportedUrl(url)) {
    res
      .status(400)
      .json({ error: 'Paste a link from a supported platform (YouTube, TikTok, Instagram, Reddit, Pinterest, Vimeo, Facebook, X, etc.).' });
    return;
  }
  if (!VALID_MODES.has(mode)) {
    res.status(400).json({ error: 'Choose Video or Audio only.' });
    return;
  }
  if (!VALID_QUALITIES.has(quality)) {
    res.status(400).json({ error: 'Unrecognized quality.' });
    return;
  }
  if (!VALID_AUDIO_FORMATS.has(audioFormat)) {
    res.status(400).json({ error: 'Unrecognized audio format.' });
    return;
  }

  if (activeDownloads >= MAX_CONCURRENT_DOWNLOADS) {
    res.status(503).json({ error: 'The server is busy with other downloads. Try again shortly.' });
    return;
  }

  activeDownloads += 1;
  const tempDir = await mkdtemp(path.join(tmpdir(), 'comfyclips-web-'));
  const abortController = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    abortController.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const binaryPath = await resolveYtDlpBinaryPath();
    const { available: ffmpegAvailable, locationArgs: ffmpegLocationArgs } = resolveFfmpeg();
    const jsRuntimeArgs = await resolveJsRuntimeArgs();
    const { args } = buildArgs({
      url,
      mode,
      quality,
      audioFormat,
      outputDir: tempDir,
      ffmpegAvailable,
      jsRuntimeArgs,
      ffmpegLocationArgs,
    });

    const ytDlpWrap = new YTDlpWrap(binaryPath);
    await new Promise((resolve, reject) => {
      ytDlpWrap.exec(args, {}, abortController.signal).on('error', reject).on('close', resolve);
    });

    clearTimeout(timeoutId);
    if (timedOut) {
      throw new Error('Download timed out.');
    }

    const files = await readdir(tempDir);
    if (files.length === 0) {
      throw new Error('No file was produced.');
    }

    const outputPath = path.join(tempDir, files[0]);
    const { size } = await stat(outputPath);

    res.setHeader('Content-Length', String(size));
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(files[0])}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const stream = createReadStream(outputPath);
    stream.pipe(res);
    stream.on('close', () => {
      rm(tempDir, { recursive: true, force: true }).catch(() => {});
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: timedOut ? 'Download timed out.' : 'Download failed. Check the link and try again.' });
    }
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  } finally {
    activeDownloads -= 1;
  }
});

// In production this same service also serves the built website, so one
// deploy + one domain covers both. In local dev the website runs separately
// through Vite (`npm run dev` in website/), which proxies /api here instead.
app.use(express.static(WEBSITE_DIST));
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(WEBSITE_DIST, 'index.html'));
});

// On Vercel, the function is invoked directly per-request — app.listen()
// never runs there. Locally (and in the Docker/Render deploy) it's a normal
// long-running server.
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`ComfyClips listening on http://localhost:${PORT}`);
  });
}

export default app;
