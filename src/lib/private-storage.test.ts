import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alertStorageKey } from './private-storage';

test('real accounts and demo never share alert storage', () => {
  assert.equal(alertStorageKey('real', 'alice'), 'uptrend.alerts.v1:real:alice');
  assert.notEqual(alertStorageKey('real', 'alice'), alertStorageKey('real', 'bob'));
  assert.notEqual(alertStorageKey('real', 'alice'), alertStorageKey('demo'));
  assert.equal(alertStorageKey('real'), null);
  assert.equal(alertStorageKey(null), null);
});