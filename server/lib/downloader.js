import path from 'node:path';

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
  cookiesArgs = [],
  youtubeExtractorArgs = 'player_client=android,web',
}) {
  const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s');
  const args = [
    url,
    '-o',
    outputTemplate,
    '--no-playlist',
    '--newline',
    // Some platforms (Facebook, Reddit, etc.) use the full post caption as the
    // title, which can blow past the filesystem's filename length limit.
    '--trim-filenames',
    '150',
    // Carries the PO token minted in potoken.js when available (YouTube
    // otherwise answers datacenter IPs with a bot check, or serves a single
    // low-quality stream), else plain client spoofing. No-op for every other
    // platform's extractor.
    '--extractor-args',
    `youtube:${youtubeExtractorArgs}`,
    // Only present when YT_COOKIES_B64 is set (see binaries.js) — a real
    // logged-in session clears the bot check when a token alone doesn't,
    // since the datacenter IP itself is what's flagged.
    ...cookiesArgs,
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
    args.push(
      '-S',
      'vcodec:h264,acodec:aac',
      '-f',
      videoFormatSelector(quality),
      '--merge-output-format',
      'mp4',
      '--postprocessor-args',
      'Merger:-c:a aac -movflags +faststart'
    );
  } else {
    const h = heightCap(quality);
    args.push('-f', `best[ext=mp4]${h}/best${h}`);
    warnings.push(
      'ffmpeg was not found — separate video/audio streams cannot be merged, so quality is limited to a single pre-merged format. Install ffmpeg for full quality and best compatibility.'
    );
  }

  return { args, warnings };
}
