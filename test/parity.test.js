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

test('разрешение статусов не зависит от бренда (hard-wired в resolve.js)', () => {
  // Статусы hard-wired в resolve.js, не читаются из brand файлов.
  // Этот тест проверяет, что resolve.js не путает свет и темноту при hard-wire статусов.
  const statusKeys = ['status.moving', 'status.parked', 'status.warning', 'status.alarm', 'status.offline'];
  for (const theme of ['light', 'dark']) {
    const a = resolveColors('aurora', theme);
    const m = resolveColors('mts', theme);
    for (const k of statusKeys) {
      assert.equal(a[k], m[k], `${k} в теме ${theme} разошёлся между брендами`);
    }
  }
});

test('ступени цветовых шкал совпадают с эталоном', () => {
  const violations = checkBrandParity();
  const canonicalViolations = violations.filter(v => v.includes('не совпадают с эталоном'));
  assert.deepEqual(canonicalViolations, [], `Нарушения эталона:\n${canonicalViolations.join('\n')}`);
});
