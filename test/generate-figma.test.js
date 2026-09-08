import test from 'node:test';
import assert from 'node:assert/strict';
import { generateFigma } from '../tools/generate-figma.js';

const doc = generateFigma();

test('есть обе коллекции', () => {
  assert.deepEqual(Object.keys(doc.collections).sort(), ['dimension', 'semantic']);
});

test('семантическая коллекция имеет четыре мода', () => {
  assert.deepEqual(doc.collections.semantic.modes.sort(), [
    'aurora/dark', 'aurora/light', 'mts/dark', 'mts/light',
  ]);
});

test('каждая семантическая переменная определена во всех четырёх модах', () => {
  const modes = doc.collections.semantic.modes;
  for (const [name, byMode] of Object.entries(doc.collections.semantic.variables)) {
    assert.deepEqual(
      Object.keys(byMode).sort(), [...modes].sort(),
      `Переменная ${name} определена не во всех модах`,
    );
  }
});

test('цвета отдаются как hex', () => {
  const v = doc.collections.semantic.variables['surface.content'];
  assert.equal(v['aurora/light'], '#FFFFFF');
  assert.equal(v['mts/dark'], '#161514');
});

test('размеры лежат в коллекции без модов', () => {
  assert.equal(doc.collections.dimension.modes.length, 0);
  assert.equal(doc.collections.dimension.variables['radius.lg'], 12);
  assert.equal(doc.collections.dimension.variables['row.default'], 52);
});

test('направление синхронизации зафиксировано в документе', () => {
  assert.match(doc.$meta.direction, /JSON → Figma/);
});
