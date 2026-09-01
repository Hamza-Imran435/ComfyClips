import cors from 'cors';
import express from 'express';
import { createReadStream, existsSync } from 'node:fs';
import { mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  resolveCookiesArgs,
  resolveFfmpeg,
  resolveJsRuntimeArgs,
  resolvePotPluginArgs,
  resolveYtDlpBinaryPath,
} from './lib/binaries.js';
import { buildArgs } from './lib/downloader.js';
import { PLATFORMS } from './lib/platforms.js';
import YTDlpWrap from './lib/ytdlp-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Present only in the combined Docker/Render deploy, where the website is
// built and copied alongside the server in the same image. Absent when this
// server is deployed standalone (e.g. its own Vercel project) — in that case
// this is purely an API and skips serving any static site.
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
    const cookiesArgs = resolveCookiesArgs();
    // Loaded lazily and defensively: PO token minting pulls in jsdom, whose
    // dynamic requires don't always survive a serverless bundler. It's an
    // enhancement (better formats, fewer bot checks), never a hard dependency,
    // so failing to load it must not take the API down with it.
    let youtubeExtractorArgs;
    try {
      const { resolveYoutubeExtractorArgs } = await import('./lib/potoken.js');
      youtubeExtractorArgs = await resolveYoutubeExtractorArgs(url);
    } catch (err) {
      // Leaving it undefined makes buildArgs use its own default.
      console.error('[potoken] unavailable, using fallback client:', err.message);
    }
    const { args } = buildArgs({
      url,
      mode,
      quality,
      audioFormat,
      outputDir: tempDir,
      ffmpegAvailable,
      jsRuntimeArgs,
      ffmpegLocationArgs,
      cookiesArgs,
      potPluginArgs,
    });

    let stderrOutput = '';
    const ytDlpWrap = new YTDlpWrap(binaryPath);
    await new Promise((resolve, reject) => {
      const emitter = ytDlpWrap.exec(args, {}, abortController.signal);
      emitter.on('ytDlpEvent', (type, data) => {
        if (type === 'error' || type === 'youtube' || type === 'instagram') {
          stderrOutput += ` ${data}`;
        }
      });
      emitter.on('error', (err) => {
        reject(new Error(err.message || stderrOutput));
      });
      emitter.on('close', resolve);
    });

    clearTimeout(timeoutId);
    if (timedOut) {
      throw new Error('Download timed out.');
    }

    const files = await readdir(tempDir);
    if (files.length === 0) {
      throw new Error(stderrOutput || 'No file was produced.');
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
    // The client only ever sees a sanitized message below — log the raw
    // yt-dlp failure so it's visible in the platform's runtime logs.
    console.error('[download] yt-dlp failed:', err.message);
    const msg = (err.message || '').toLowerCase();
    let userFriendlyError = 'Download failed. Check the link and try again.';

    if (timedOut) {
      userFriendlyError = 'Download timed out. Try a shorter clip or lower resolution.';
    } else if (
      msg.includes('available to everyone') ||
      msg.includes('certain audiences') ||
      msg.includes('login required') ||
      msg.includes('sign in') ||
      msg.includes('private') ||
      msg.includes('age-restricted') ||
      msg.includes('cookies')
    ) {
      userFriendlyError =
        'This post is age-restricted, private, or requires an Instagram login. Only public videos can be extracted.';
    } else if (msg.includes('not found') || msg.includes('404') || msg.includes('does not exist')) {
      userFriendlyError = 'The requested video was not found or has been deleted.';
    } else if (msg.includes('unsupported url')) {
      userFriendlyError = 'Unsupported URL format. Please paste a direct post or video link.';
    }

    if (!res.headersSent) {
      // Diagnostics: the sanitized message above hides which failure actually
      // occurred, which makes remote debugging guesswork. When DEBUG_TOKEN is
      // set and the caller presents it, pass the raw yt-dlp error through too.
      const debugToken = process.env.DEBUG_TOKEN;
      const rawError =
        debugToken && req.get('x-debug-token') === debugToken ? { rawError: err.message } : {};
      res.status(500).json({ error: userFriendlyError, ...rawError });
    }
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  } finally {
    activeDownloads -= 1;
  }
});

if (existsSync(WEBSITE_DIST)) {
  app.use(express.static(WEBSITE_DIST));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(WEBSITE_DIST, 'index.html'));
  });
}

// On Vercel, the function is invoked directly per-request — app.listen()
// never runs there. Locally (and in the Docker/Render deploy) it's a normal
// long-running server.
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`ComfyClips listening on http://localhost:${PORT}`);
  });
}

export default app;
