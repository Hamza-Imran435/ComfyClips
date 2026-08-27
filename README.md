# ComfyClips

Interactive CLI to download video or audio from social media links (YouTube, Instagram, TikTok, Reddit, Pinterest, Vimeo, Dailymotion, Rumble, LinkedIn, Snapchat, Facebook, X/Twitter). Built on top of [yt-dlp](https://github.com/yt-dlp/yt-dlp).

## Requirements

- Node.js >= 18

That's it — everything else is provisioned automatically:

- **ffmpeg** — used to merge separate video/audio streams and to extract/convert audio formats. If it's not on your PATH, `npm install` fetches a static build for your platform (via `ffmpeg-static`).
- **yt-dlp** — if it isn't found on your PATH, ComfyClips downloads a copy on first run into `~/.comfyclips/bin`.
- **Deno** — YouTube requires a JS runtime to solve its signature challenge. If it isn't found on your PATH, ComfyClips downloads it on first run into `~/.comfyclips/bin`.

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
1. Select a platform (YouTube, TikTok, Reddit, Pinterest, Vimeo, Instagram, X/Twitter, Facebook, etc.)
2. Paste the video link
3. Choose Video or Audio only
4. Pick a quality (video) or format (audio: mp3/m4a/wav/opus)
5. Choose the destination folder (created automatically if it doesn't exist)

Progress is shown live in the terminal, and the file is saved using its original title as the filename.

## Notes

- Downloading content you don't own or don't have rights to may violate a platform's Terms of Service or copyright law. Use responsibly.
- Platform selection is a light sanity check on the URL's domain; actual extraction is handled by yt-dlp regardless of the platform chosen.
