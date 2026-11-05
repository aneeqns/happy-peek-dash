import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemoWallet, isDemoAmount } from './demo-wallet';

test('demo starting money stays within $100 to $10,000,000', () => {
  assert.equal(isDemoAmount(100), true);
  assert.equal(isDemoAmount(10_000_000), true);
  for (const value of [99, 10_000_001, Infinity, NaN]) {
    assert.equal(isDemoAmount(value), false);
    assert.throws(() => createDemoWallet(value));
  }
});