import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PLATFORMS, hostMatchesPlatform } from '../src/platforms.js';

describe('Platforms Configuration & Matching', () => {
  it('should include all 12 supported platforms', () => {
    assert.strictEqual(PLATFORMS.length, 12);
    const platformValues = PLATFORMS.map((p) => p.value);
    const expected = [
      'youtube',
      'instagram',
      'tiktok',
      'reddit',
      'pinterest',
      'twitter',
      'facebook',
      'vimeo',
      'dailymotion',
      'rumble',
      'linkedin',
      'snapchat',
    ];
    for (const exp of expected) {
      assert.ok(platformValues.includes(exp), `Missing platform: ${exp}`);
    }
  });

  describe('URL matching for each platform', () => {
    const testCases = [
      {
        platform: 'youtube',
        validUrls: [
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          'https://youtube.com/watch?v=dQw4w9WgXcQ',
          'https://youtu.be/dQw4w9WgXcQ',
          'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
        ],
        invalidUrls: ['https://notyoutube.com/video', 'https://vimeo.com/123'],
      },
      {
        platform: 'instagram',
        validUrls: [
          'https://www.instagram.com/reel/C3_abc123/',
          'https://instagram.com/p/C3_abc123/',
        ],
        invalidUrls: ['https://fakeinstagram.com/reel/123'],
      },
      {
        platform: 'tiktok',
        validUrls: [
          'https://www.tiktok.com/@user/video/1234567890',
          'https://tiktok.com/@user/video/1234567890',
          'https://vm.tiktok.com/ZM8abc123/',
        ],
        invalidUrls: ['https://tiktokclone.com/video/123'],
      },
      {
        platform: 'reddit',
        validUrls: [
          'https://www.reddit.com/r/funny/comments/123/video_title/',
          'https://old.reddit.com/r/videos/comments/123/',
          'https://v.redd.it/abcdef123',
          'https://redd.it/123456',
        ],
        invalidUrls: ['https://redditmedia.org/v/123'],
      },
      {
        platform: 'pinterest',
        validUrls: [
          'https://www.pinterest.com/pin/1234567890/',
          'https://pinterest.co.uk/pin/1234567890/',
          'https://pin.it/7abc123',
        ],
        invalidUrls: ['https://mypinterest.net/pin/123'],
      },
      {
        platform: 'twitter',
        validUrls: [
          'https://twitter.com/user/status/1234567890',
          'https://x.com/user/status/1234567890',
          'https://mobile.twitter.com/user/status/1234567890',
        ],
        invalidUrls: ['https://not-x.com/user/status/123'],
      },
      {
        platform: 'facebook',
        validUrls: [
          'https://www.facebook.com/watch/?v=1234567890',
          'https://facebook.com/user/videos/1234567890/',
          'https://fb.watch/abc12345/',
        ],
        invalidUrls: ['https://facebooklogin.com/video/123'],
      },
      {
        platform: 'vimeo',
        validUrls: [
          'https://vimeo.com/123456789',
          'https://player.vimeo.com/video/123456789',
        ],
        invalidUrls: ['https://vimeovideo.org/123'],
      },
      {
        platform: 'dailymotion',
        validUrls: [
          'https://www.dailymotion.com/video/x8abc12',
          'https://dai.ly/x8abc12',
        ],
        invalidUrls: ['https://dailymotion.net/video'],
      },
      {
        platform: 'rumble',
        validUrls: [
          'https://rumble.com/v123abc-video-title.html',
          'https://www.rumble.com/v123abc.html',
        ],
        invalidUrls: ['https://rumblevideo.net/123'],
      },
      {
        platform: 'linkedin',
        validUrls: [
          'https://www.linkedin.com/posts/activity-1234567890',
          'https://linkedin.com/feed/update/urn:li:activity:1234567890',
          'https://lnkd.in/abc1234',
        ],
        invalidUrls: ['https://linkedin-jobs.com/post/123'],
      },
      {
        platform: 'snapchat',
        validUrls: [
          'https://www.snapchat.com/spotlight/W7_EDnXWTBiXAEEniNoMPwAAYabc',
          'https://story.snapchat.com/s/username',
        ],
        invalidUrls: ['https://snapchat-stories.com/123'],
      },
    ];

    for (const { platform, validUrls, invalidUrls } of testCases) {
      it(`should match valid ${platform} URLs and reject non-${platform} URLs`, () => {
        for (const url of validUrls) {
          assert.strictEqual(
            hostMatchesPlatform(url, platform),
            true,
            `Expected ${url} to match platform ${platform}`
          );
        }
        for (const url of invalidUrls) {
          assert.strictEqual(
            hostMatchesPlatform(url, platform),
            false,
            `Expected ${url} to NOT match platform ${platform}`
          );
        }
      });
    }
  });

  it('should gracefully handle malformed URLs', () => {
    assert.strictEqual(hostMatchesPlatform('not-a-valid-url', 'youtube'), false);
    assert.strictEqual(hostMatchesPlatform('', 'youtube'), false);
  });

  it('should return true if platformValue is unknown (fallback behavior)', () => {
    assert.strictEqual(hostMatchesPlatform('https://any-site.com', 'unknown_platform'), true);
  });
});
