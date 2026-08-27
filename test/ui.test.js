import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatBytes } from '../src/ui.js';

describe('UI Utilities', () => {
  describe('formatBytes', () => {
    it('should format bytes accurately', () => {
      assert.strictEqual(formatBytes(500), '500.0 B');
      assert.strictEqual(formatBytes(1024), '1.0 KB');
      assert.strictEqual(formatBytes(1024 * 1024), '1.0 MB');
      assert.strictEqual(formatBytes(1024 * 1024 * 1024), '1.0 GB');
      assert.strictEqual(formatBytes(15.5 * 1024 * 1024), '15.5 MB');
    });

    it('should handle zero, null, undefined, and NaN gracefully', () => {
      assert.strictEqual(formatBytes(0), 'Unknown');
      assert.strictEqual(formatBytes(null), 'Unknown');
      assert.strictEqual(formatBytes(undefined), 'Unknown');
      assert.strictEqual(formatBytes(NaN), 'Unknown');
    });
  });
});
