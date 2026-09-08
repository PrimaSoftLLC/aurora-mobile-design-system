import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { checkBrandParity, checkSeedInOwnRamp, checkBrandId, checkNeutralHue, checkBrandAssets, BRAND_ALLOWED_KEYS } from '../tools/parity.js';
import { resolveColors } from '../tools/resolve.js';
import { listBrands, loadBrand, root } from '../tools/load.js';

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

test('id бренда совпадает с именем файла и годится в идентификаторы', () => {
  for (const id of listBrands()) {
    assert.deepEqual(checkBrandId(id, loadBrand(id)), []);
  }
  assert.match(checkBrandId('mts', { id: 'aurora' })[0], /не совпадает с именем файла/);
  assert.match(checkBrandId('my-brand', { id: 'my-brand' })[0], /идентификатором/);
  assert.match(checkBrandId('Mts', { id: 'Mts' })[0], /идентификатором/);
});

test('neutralHue каждого бренда совпадает с оттенком его neutral.500', () => {
  for (const id of listBrands()) {
    assert.deepEqual(checkNeutralHue(loadBrand(id)), [], `${id}: neutralHue оторвался от шкалы`);
  }
});

test('оторвавшийся neutralHue ловится, серая шкала тоже', () => {
  const cold = { id: 'x', neutralHue: 232, color: { neutral: { 500: '#666C85' } } };
  assert.deepEqual(checkNeutralHue(cold), []);
  const wrong = { ...cold, neutralHue: 28 };
  assert.match(checkNeutralHue(wrong)[0], /расходится/);
  const grey = { ...cold, color: { neutral: { 500: '#777777' } } };
  assert.match(checkNeutralHue(grey)[0], /без оттенка/);
  // Допуск считается по кругу: 358° и 2° — соседи, а не противоположности.
  const wrap = { id: 'x', neutralHue: 358, color: { neutral: { 500: '#FF0008' } } };
  assert.deepEqual(checkNeutralHue(wrap), []);
  assert.match(checkNeutralHue({ id: 'x', color: { neutral: { 500: '#666C85' } } })[0], /neutralHue/);
});

test('логотип и вордмарк каждого бренда лежат в assets/brand', () => {
  for (const id of listBrands()) {
    assert.deepEqual(checkBrandAssets(loadBrand(id)), [], `${id}: знак не найден`);
  }
});

test('бренд без знака или с несуществующим файлом ловится', () => {
  const dir = path.join(root, 'assets', 'brand');
  assert.match(checkBrandAssets({ id: 'x', logo: 'nope.svg', wordmark: 'aurora-wordmark.svg' }, dir)[0], /nope\.svg/);
  assert.match(checkBrandAssets({ id: 'x', logo: 'aurora.svg' }, dir)[0], /"wordmark"/);
  assert.deepEqual(checkBrandAssets({ id: 'x', logo: 'aurora.svg', wordmark: 'aurora-wordmark.svg' }, dir), []);
});
