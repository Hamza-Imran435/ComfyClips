# ComfyClips

Interactive CLI to download video or audio from social media links (YouTube, Instagram, TikTok, Facebook, X/Twitter). Built on top of [yt-dlp](https://github.com/yt-dlp/yt-dlp).

## Requirements

- Node.js >= 18
- [ffmpeg](https://ffmpeg.org/) on your PATH — required to merge separate video/audio streams and to extract/convert audio formats. Without it, downloads may fail or fall back to lower quality.
  - Debian/Ubuntu: `sudo apt-get install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Windows: `choco install ffmpeg` (or download from ffmpeg.org and add it to PATH)
- `yt-dlp` — not required ahead of time. If it isn't found on your PATH, ComfyClips downloads a copy automatically on first run into `~/.comfyclips/bin`.

## Install

```bash
npm install
npm link   # exposes the `comfyclips` command globally
```

## Usage

```bash
comfyclips
```

You'll be prompted to:
1. Select a platform (YouTube, Instagram, TikTok, Facebook, X/Twitter)
2. Paste the video link
3. Choose Video or Audio only
4. Pick a quality (video) or format (audio: mp3/m4a/wav/opus)
5. Choose the destination folder (created automatically if it doesn't exist)

Progress is shown live in the terminal, and the file is saved using its original title as the filename.

## Notes

- Downloading content you don't own or don't have rights to may violate a platform's Terms of Service or copyright law. Use responsibly.
- Platform selection is a light sanity check on the URL's domain; actual extraction is handled by yt-dlp regardless of the platform chosen.
