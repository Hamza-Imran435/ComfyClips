import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { buildArgs } from '../src/downloader.js';

describe('Downloader Argument Builder (buildArgs)', () => {
  const baseOptions = {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    mode: 'video',
    quality: 'best',
    audioFormat: 'mp3',
    outputDir: '/downloads',
    ffmpegAvailable: true,
  };

  it('should construct basic arguments with correct output template and no-playlist flag', () => {
    const { args, warnings } = buildArgs(baseOptions);
    assert.strictEqual(args[0], baseOptions.url);
    assert.ok(args.includes('-o'));
    const expectedOutputTemplate = path.join('/downloads', '%(title)s.%(ext)s');
    assert.ok(args.includes(expectedOutputTemplate));
    assert.ok(args.includes('--no-playlist'));
    assert.ok(args.includes('--newline'));
    assert.strictEqual(warnings.length, 0);
  });

  describe('Video mode', () => {
    it('should build format selector for best quality with ffmpeg', () => {
      const { args } = buildArgs({ ...baseOptions, quality: 'best', ffmpegAvailable: true });
      assert.ok(args.includes('-f'));
      const fIndex = args.indexOf('-f');
      assert.ok(args[fIndex + 1].includes('bestvideo[ext=mp4][vcodec^=avc1]'));
      assert.ok(args.includes('--merge-output-format'));
      assert.ok(args.includes('mp4'));
    });

    it('should apply height capping when quality is 1080p, 720p, or 480p', () => {
      const qualities = ['1080p', '720p', '480p'];
      for (const q of qualities) {
        const height = q.replace('p', '');
        const { args } = buildArgs({ ...baseOptions, quality: q, ffmpegAvailable: true });
        const fIndex = args.indexOf('-f');
        const formatStr = args[fIndex + 1];
        assert.ok(
          formatStr.includes(`[height<=${height}]`),
          `Expected format string to contain height cap [height<=${height}]`
        );
      }
    });

    it('should issue a warning and fallback when ffmpeg is unavailable', () => {
      const { args, warnings } = buildArgs({ ...baseOptions, ffmpegAvailable: false });
      assert.ok(warnings.length > 0);
      assert.ok(warnings[0].includes('ffmpeg was not found'));
      const fIndex = args.indexOf('-f');
      assert.ok(args[fIndex + 1].includes('best[ext=mp4]'));
    });
  });

  describe('Audio mode', () => {
    const audioFormats = ['mp3', 'm4a', 'wav', 'opus'];

    for (const format of audioFormats) {
      it(`should configure audio extraction for format ${format}`, () => {
        const { args, warnings } = buildArgs({
          ...baseOptions,
          mode: 'audio',
          audioFormat: format,
          ffmpegAvailable: true,
        });
        assert.ok(args.includes('-x'));
        assert.ok(args.includes('--audio-format'));
        const formatIndex = args.indexOf('--audio-format');
        assert.strictEqual(args[formatIndex + 1], format);
        assert.strictEqual(warnings.length, 0);
      });
    }

    it('should issue a warning when ffmpeg is unavailable in audio mode', () => {
      const { warnings } = buildArgs({
        ...baseOptions,
        mode: 'audio',
        audioFormat: 'mp3',
        ffmpegAvailable: false,
      });
      assert.ok(warnings.length > 0);
      assert.ok(warnings[0].includes('ffmpeg was not found'));
    });
  });

  it('should include jsRuntimeArgs and ffmpegLocationArgs when provided', () => {
    const jsRuntimeArgs = ['--js-runtimes', 'deno:/path/to/deno'];
    const ffmpegLocationArgs = ['--ffmpeg-location', '/path/to/ffmpeg'];
    const { args } = buildArgs({
      ...baseOptions,
      jsRuntimeArgs,
      ffmpegLocationArgs,
    });
    assert.ok(args.includes('--js-runtimes'));
    assert.ok(args.includes('deno:/path/to/deno'));
    assert.ok(args.includes('--ffmpeg-location'));
    assert.ok(args.includes('/path/to/ffmpeg'));
  });
});
