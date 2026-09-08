import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHex, toHex, mix, withAlpha, relativeLuminance, contrastRatio, hue } from '../tools/color.js';

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

test('withAlpha добавляет альфу в конец, как в CSS', () => {
  assert.equal(withAlpha('#FF0000', 0.25), '#FF000040');
  assert.equal(withAlpha('#00FFFF', 0.35), '#00FFFF59');
  assert.equal(withAlpha('#7F7F7F', 1), '#7F7F7FFF');
  assert.equal(withAlpha('#7F7F7F', 0), '#7F7F7F00');
});

test('parseHex не принимает восьмизначный hex — контраст поверх альфы посчитать нельзя', () => {
  assert.throws(() => parseHex('#FF000040'), /Некорректный hex/);
});

// Дыра, из-за которой ошибка вылезала далеко от места: `amount < 0 || amount > 1`
// не отвергал NaN, mix возвращал «#NANNANNAN», и падало это уже в parseHex —
// с сообщением, не называющим ни одного токена.
test('mix отвергает NaN, а не возвращает мусор', () => {
  assert.throws(() => mix('#FFFFFF', '#000000', NaN), /вне 0\.\.1/);
  assert.throws(() => mix('#FFFFFF', '#000000', Number('0.04.5')), /вне 0\.\.1/);
  assert.throws(() => mix('#FFFFFF', '#000000', 1.5), /вне 0\.\.1/);
  assert.throws(() => mix('#FFFFFF', '#000000', -0.1), /вне 0\.\.1/);
});

test('withAlpha отвергает NaN так же', () => {
  assert.throws(() => withAlpha('#FF0000', NaN), /вне 0\.\.1/);
});

test('hue даёт оттенок в градусах, для серого — null', () => {
  assert.equal(hue('#FF0000'), 0);
  assert.equal(hue('#00FF00'), 120);
  assert.equal(hue('#0000FF'), 240);
  assert.equal(Math.round(hue('#666C85')), 228);
  assert.equal(hue('#777777'), null);
  assert.equal(hue('#FFFFFF'), null);
});
