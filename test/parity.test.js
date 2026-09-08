import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBrandParity, BRAND_ALLOWED_KEYS } from '../tools/parity.js';
import { resolveColors } from '../tools/resolve.js';

test('бренды различаются только разрешёнными ключами', () => {
  const violations = checkBrandParity();
  assert.deepEqual(violations, [], `Нарушения:\n${violations.join('\n')}`);
});

test('разрешено ровно четыре визуальных оси', () => {
  assert.deepEqual([...BRAND_ALLOWED_KEYS].sort(), ['color', 'logo', 'wordmark'].sort());
});

test('статусные токены совпадают побайтно во всех брендах', () => {
  const statusKeys = ['status.moving', 'status.parked', 'status.warning', 'status.alarm', 'status.offline'];
  for (const theme of ['light', 'dark']) {
    const a = resolveColors('aurora', theme);
    const m = resolveColors('mts', theme);
    for (const k of statusKeys) {
      assert.equal(a[k], m[k], `${k} в теме ${theme} разошёлся между брендами`);
    }
  }
});
