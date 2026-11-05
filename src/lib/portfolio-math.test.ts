import { test } from 'node:test';
import assert from 'node:assert/strict';
import { positionDayChange } from './portfolio-math';

test('daily gains are measured from previous close', () => {
  assert.ok(Math.abs(positionDayChange(2, 110, 10) - 20) < 1e-9);
  assert.ok(Math.abs(positionDayChange(2, 90, -10) + 20) < 1e-9);
  assert.equal(positionDayChange(2, 100, -100), 0);
});