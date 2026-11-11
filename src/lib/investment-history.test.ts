import { test } from 'node:test';
import assert from 'node:assert/strict';
import { investmentDays } from './investment-history';

test('each day counts demo buys and real saved holdings separately and together', () => {
  const days = investmentDays([
    { day: '2026-11-10', real_holdings: 2, demo_buys: 3 },
    { day: '2026-11-11', real_holdings: 1, demo_buys: 4 },
  ], '2026-11-10', '2026-11-11');
  assert.deepEqual(days, [
    { day: '2026-11-10', real: 2, demo: 3, total: 5 },
    { day: '2026-11-11', real: 1, demo: 4, total: 5 },
  ]);
});

test('days without investments retain zero totals across UTC month boundaries', () => {
  assert.deepEqual(investmentDays([], '2026-10-31', '2026-11-01'), [
    { day: '2026-10-31', real: 0, demo: 0, total: 0 },
    { day: '2026-11-01', real: 0, demo: 0, total: 0 },
  ]);
});