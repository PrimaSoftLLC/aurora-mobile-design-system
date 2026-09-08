import test from 'node:test';
import assert from 'node:assert/strict';
import { listBrands, loadBrand, loadPrimitives, loadSemantic } from '../tools/load.js';
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

// Алиас обязан быть ссылкой, а не совпадением. Проверка «focus.indicator
// равен action.primary» на плоских значениях проходит вхолостую: она
// одинаково зелена и когда алиас работает, и когда оба токена независимо
// указывают на brand.600. Поэтому семантическая карта подменяется так, чтобы
// цель алиаса разошлась с исходным примитивом — если ссылку не разворачивают,
// focus.indicator останется на brand.600 и тест упадёт.
test('focus.indicator идёт по ссылке на action.primary, а не дублирует его', () => {
  const override = {
    ...loadSemantic(),
    'action.primary': { light: '{color.brand.900}', dark: '{color.brand.50}' },
  };
  const c = resolveColors('aurora', 'light', override);
  assert.equal(c['action.primary'], '#143253');
  assert.equal(c['focus.indicator'], '#143253');
  assert.notEqual(c['focus.indicator'], '#0066B8');
});

test('треки и маркер карты тоже алиасы, а не копии', () => {
  const override = {
    ...loadSemantic(),
    'action.primary': { light: '{color.brand.900}', dark: '{color.brand.50}' },
    'text.primary': { light: '{color.neutral.600}', dark: '{color.neutral.0}' },
    'surface.overlay': { light: '{color.neutral.300}', dark: '{color.neutral.0}' },
  };
  const c = resolveColors('aurora', 'light', override);
  assert.equal(c['map.trackDefault'], '#143253');
  assert.equal(c['map.trackSelected'], '#4A5069');
  assert.equal(c['map.markerStroke'], '#4A5069');
  assert.equal(c['map.clusterText'], '#4A5069');
  assert.equal(c['map.clusterFill'], '#C4C9D8');
});

test('цикл в семантическом слое бросает с именем токена, а не зацикливается', () => {
  assert.throws(
    () => resolveColors('aurora', 'light', {
      'a.one': { light: '{semantic.b.two}', dark: '{color.neutral.0}' },
      'b.two': { light: '{semantic.a.one}', dark: '{color.neutral.0}' },
    }),
    /цикл.*a\.one|a\.one.*цикл/,
  );
});

test('ссылка на несуществующий семантический токен бросает', () => {
  assert.throws(
    () => resolveColors('aurora', 'light', {
      'a.one': { light: '{semantic.nope.here}', dark: '{color.neutral.0}' },
    }),
    /nope\.here/,
  );
});

test('геозоны — общая палитра из восьми с альфой, разной по темам', () => {
  const names = ['aqua', 'blue', 'gray', 'green', 'orange', 'purple', 'red', 'yellow'];
  for (const brand of ['aurora', 'mts']) {
    const light = resolveColors(brand, 'light');
    const dark = resolveColors(brand, 'dark');
    for (const n of names) {
      assert.match(light[`geofence.${n}`], /^#[0-9A-F]{8}$/, `geofence.${n} должен нести альфу`);
      assert.equal(light[`geofence.${n}`].slice(0, 7), dark[`geofence.${n}`].slice(0, 7));
      assert.notEqual(light[`geofence.${n}`], dark[`geofence.${n}`]);
    }
    assert.equal(light['geofence.red'], '#FF000040');
  }
  assert.equal(
    resolveColors('aurora', 'light')['geofence.blue'],
    resolveColors('mts', 'light')['geofence.blue'],
    'геозоны — пользовательские данные, они не перекрашиваются брендом',
  );
});
