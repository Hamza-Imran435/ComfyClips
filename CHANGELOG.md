# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Website: a "Service Unavailable" notice on the download form for platforms (currently YouTube) that are hitting hosting-provider IP blocks, pointing users to the CLI as a working alternative while the fix is in progress.

### Changed
- Website: the terminal demo's platform picker now lists all platforms the CLI actually supports (previously stuck at the original five), matching the 1.3.0 platform additions.

## [1.3.0] - 2026-08-31

### Added
- Platform support for Reddit, Pinterest, Vimeo, Dailymotion, Rumble, LinkedIn, and Snapchat, in both the CLI and the website.
- Website: friendlier, more specific error messages for age-restricted/private/login-required content, missing videos, and unsupported URLs.
- Website: quality-of-life polish — animated platform strip and features section, download progress stages, and richer platform icons.

### Changed
- Video downloads now prefer H.264/AAC streams with faststart muxing for broader QuickTime and mobile playback compatibility.
- Server download errors surface the underlying yt-dlp message instead of a generic failure when available.

## [1.2.0] - 2026-08-27

### Added
- Auto-download ffmpeg (via `ffmpeg-static`) when it isn't found on PATH, for both the CLI and the server — no manual install step needed anymore.
- Website: a Troubleshooting section covering the errors users are most likely to hit (missing ffmpeg, missing JS runtime, unsupported URLs, PATH issues, network-restricted environments, private/region-locked videos).

### Changed
- Dockerfile no longer installs ffmpeg via `apt-get` — it's now provisioned by `npm ci` through `ffmpeg-static`, which also shrank the built image (~1.09GB → ~744MB).
- Website install/footer copy updated to reflect that ffmpeg, yt-dlp, and the JS runtime all self-install now.

## [1.1.0] - 2026-08-27

### Added
- Auto-download the Deno JS runtime when it isn't found on PATH. YouTube requires a JS runtime to solve its signature challenge; without one, yt-dlp silently drops most modern formats and downloads fail with "Requested format is not available."
- Dockerfile now bakes Deno into the website's image at build time, so deployed containers never have to fetch it at request time.

## [1.0.0] - Initial release

### Added
- Interactive CLI to download video or audio from YouTube, Instagram, TikTok, Facebook, and X/Twitter, built on yt-dlp.
- Auto-download of the yt-dlp binary on first run when it isn't found on PATH.
- Companion website with install instructions and platform overview.
