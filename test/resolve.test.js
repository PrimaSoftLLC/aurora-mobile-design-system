import test from 'node:test';
import assert from 'node:assert/strict';
import { listBrands, loadBrand, loadPrimitives } from '../tools/load.js';
import { resolveColors } from '../tools/resolve.js';

test('listBrands находит оба бренда', () => {
  assert.deepEqual(listBrands(), ['aurora', 'mts']);
});

test('loadBrand читает метаданные', () => {
  assert.equal(loadBrand('aurora').neutralHue, 232);
  assert.equal(loadBrand('mts').defaultLocale, 'ru');
});

test('loadPrimitives сливает все файлы примитивов', () => {
  const p = loadPrimitives();
  assert.equal(p.radius.lg, 12);
  assert.equal(p.role.body.size, 15);
  assert.equal(p.duration.base, 200);
  assert.equal(p.status.alarm.light, '#C7301F');
});

test('resolveColors разворачивает прямую ссылку', () => {
  const c = resolveColors('aurora', 'light');
  assert.equal(c['surface.content'], '#FFFFFF');
  assert.equal(c['action.primary'], '#0066B8');
});

test('resolveColors разворачивает тёмную тему', () => {
  const c = resolveColors('aurora', 'dark');
  assert.equal(c['surface.content'], '#101220');
  assert.equal(c['action.primary'], '#3E9BE0');
  assert.equal(c['border.hairline'], '#20243A');
});

test('resolveColors разворачивает mix()', () => {
  // Выделенная строка подмешивается к surface.content (neutral.0), а не к хрому:
  // выбранная строка — это та же строка списка с подсветкой, и она обязана
  // остаться светлее хрома, иначе вторичный текст на ней уходит под AA.
  assert.equal(resolveColors('aurora', 'light')['surface.selected'], '#F5F9FC');
  assert.equal(resolveColors('mts', 'light')['surface.selected'], '#FDF5F5');
});

test('resolveColors берёт шкалу бренда, а не Aurora', () => {
  const c = resolveColors('mts', 'light');
  assert.equal(c['action.primary'], '#D0050F');
  assert.equal(c['surface.chrome'], '#F7F6F5');
});

test('статусы одинаковы у обоих брендов', () => {
  const a = resolveColors('aurora', 'light');
  const m = resolveColors('mts', 'light');
  assert.equal(a['status.alarm'], m['status.alarm']);
  assert.equal(a['status.moving'], m['status.moving']);
});

test('неизвестная ссылка бросает с указанием токена', () => {
  assert.throws(
    () => resolveColors('aurora', 'light', { 'bad.token': { light: '{color.neutral.999}', dark: '{color.neutral.0}' } }),
    /bad\.token/
  );
});
