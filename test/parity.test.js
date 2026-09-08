import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBrandParity, checkSeedInOwnRamp, BRAND_ALLOWED_KEYS } from '../tools/parity.js';
import { resolveColors } from '../tools/resolve.js';
import { listBrands, loadBrand } from '../tools/load.js';

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

test('seed каждого бренда встречается в его собственной шкале brand', () => {
  for (const id of listBrands()) {
    assert.deepEqual(checkSeedInOwnRamp(loadBrand(id)), [], `${id}: seed оторвался от шкалы`);
  }
});

test('ступень seed не обязана совпадать между брендами', () => {
  const step = (id) => {
    const b = loadBrand(id);
    return Object.entries(b.color.brand).find(([, hex]) => hex === b.seed)[0];
  };
  // Aurora держит seed на 600, МТС — на 500: фирменный красный МТС это 500,
  // а 600 у них затемнённый вариант, который берёт контраст. Расхождение
  // законно, и проверка не должна его запрещать.
  assert.equal(step('aurora'), '600');
  assert.equal(step('mts'), '500');
  assert.deepEqual(checkBrandParity(), []);
});

test('оторвавшийся seed ловится', () => {
  const broken = {
    id: 'ghost',
    seed: '#123456',
    color: { brand: { 500: '#E30611', 600: '#D0050F' } },
  };
  assert.equal(checkSeedInOwnRamp(broken).length, 1);
  assert.match(checkSeedInOwnRamp(broken)[0], /#123456/);
  assert.equal(checkSeedInOwnRamp({ id: 'ghost', color: { brand: {} } }).length, 1);
});
