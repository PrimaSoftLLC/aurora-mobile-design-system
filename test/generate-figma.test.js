import test from 'node:test';
import assert from 'node:assert/strict';
import { generateFigma } from '../tools/generate-figma.js';
import { lineHeightRatio, letterSpacingPx } from '../tools/generate-dart.js';

const doc = generateFigma();

test('есть все четыре коллекции и нет component', () => {
  assert.deepEqual(
    Object.keys(doc.collections).sort(),
    ['dimension', 'motion', 'semantic', 'typography'],
  );
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

test('типографика уезжает в Figma целиком, а не только размеры', () => {
  const t = doc.collections.typography;
  assert.equal(t.modes.length, 0);
  assert.equal(t.variables['fontFamily.sans'], 'Inter');
  assert.equal(t.variables['fontFamily.arabic'], 'Noto Sans Arabic');
  for (const role of ['display', 'title', 'section', 'body', 'label', 'caption',
                      'overline', 'numberLg', 'numberMd', 'numberSm']) {
    for (const field of ['size', 'lineHeight', 'lineHeightRatio', 'weight',
                         'weightRendered', 'tracking', 'letterSpacing', 'tabular']) {
      assert.notEqual(t.variables[`role.${role}.${field}`], undefined, `role.${role}.${field}`);
    }
  }
});

// Ради этого расхождения авторский и отрисованный вес и разведены на два поля.
test('вес 550 у label виден в Figma и как 550, и как отрисованные 600', () => {
  const t = doc.collections.typography.variables;
  assert.equal(t['role.label.weight'], 550);
  assert.equal(t['role.label.weightRendered'], 600);
  assert.equal(t['role.body.weight'], 400);
  assert.equal(t['role.body.weightRendered'], 400);
});

test('числа типографики совпадают с теми, что уходят в Dart', () => {
  const t = doc.collections.typography.variables;
  assert.equal(t['role.body.lineHeightRatio'], Number(lineHeightRatio({ size: 15, lineHeight: 22 })));
  assert.equal(t['role.display.letterSpacing'], Number(letterSpacingPx({ size: 28, tracking: -0.015 })));
  assert.equal(t['role.numberMd.tabular'], true);
  assert.equal(t['role.body.tabular'], false);
});

test('движение уезжает в Figma: длительности и кривые', () => {
  const m = doc.collections.motion;
  assert.equal(m.modes.length, 0);
  assert.equal(m.variables['duration.base'], 200);
  assert.equal(m.variables['duration.dataInterp'], 500);
  assert.equal(m.variables['curve.enter'], 'easeOutCubic');
  assert.equal(m.variables['curve.exit'], 'easeInCubic');
});

test('регистр роли уезжает в Figma: overline — капителью, остальные нет', () => {
  const t = doc.collections.typography.variables;
  assert.equal(t['role.overline.uppercase'], true);
  assert.equal(t['role.label.uppercase'], false);
});

test('полупрозрачный scrim приходит в Figma как #RRGGBBAA', () => {
  const v = doc.collections.semantic.variables['surface.scrim'];
  assert.equal(v['aurora/light'], '#10122066');
  assert.equal(v['aurora/dark'], '#10122099');
});
