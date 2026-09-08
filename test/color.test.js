import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHex, toHex, mix, relativeLuminance, contrastRatio } from '../tools/color.js';

test('parseHex читает шестизначный hex', () => {
  assert.deepEqual(parseHex('#0066B8'), { r: 0, g: 102, b: 184 });
});

test('parseHex принимает нижний регистр и без решётки', () => {
  assert.deepEqual(parseHex('f4f6fa'), { r: 244, g: 246, b: 250 });
});

test('parseHex бросает на мусоре', () => {
  assert.throws(() => parseHex('#12345'), /Некорректный hex/);
});

test('toHex возвращает верхний регистр с решёткой', () => {
  assert.equal(toHex({ r: 0, g: 102, b: 184 }), '#0066B8');
});

test('mix с нулём возвращает первый цвет', () => {
  assert.equal(mix('#F4F6FA', '#0066B8', 0), '#F4F6FA');
});

test('mix с единицей возвращает второй цвет', () => {
  assert.equal(mix('#F4F6FA', '#0066B8', 1), '#0066B8');
});

test('mix 4% даёт подкрашенный фон выделенной строки', () => {
  assert.equal(mix('#FFFFFF', '#0066B8', 0.04), '#F5F9FC');
});

test('relativeLuminance: белый 1, чёрный 0', () => {
  assert.equal(relativeLuminance('#FFFFFF'), 1);
  assert.equal(relativeLuminance('#000000'), 0);
});

test('contrastRatio белого к чёрному равен 21', () => {
  assert.equal(Math.round(contrastRatio('#FFFFFF', '#000000')), 21);
});

test('contrastRatio симметричен', () => {
  const a = contrastRatio('#0066B8', '#FFFFFF');
  const b = contrastRatio('#FFFFFF', '#0066B8');
  assert.equal(a, b);
});
