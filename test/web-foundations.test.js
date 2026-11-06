import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadPrimitives } from '../tools/load.js';
import { resolveColors } from '../tools/resolve.js';
import { mix, toHex } from '../tools/color.js';
import { generateDart } from '../tools/generate-dart.js';
import { generateCss } from '../tools/generate-css.js';
import { generateFigma } from '../tools/generate-figma.js';

const reference = JSON.parse(readFileSync(new URL('./fixtures/web-foundations.json', import.meta.url)));

// Веб-воши в мобильной системе фиксируются на surface.content.
function opaque(value, surface) {
  if (value.startsWith('#')) return value.toUpperCase();
  const [r, g, b, a] = value.match(/[\d.]+/g).map(Number);
  return mix(surface, toHex({ r, g, b }), a);
}

for (const theme of ['light', 'dark']) {
  test(`Aurora: основы совпадают с веб-эталоном (${theme})`, () => {
    const colors = resolveColors('aurora', theme);
    for (const [name, value] of Object.entries(reference.colors)) {
      assert.equal(colors[name], opaque(value[theme], colors['surface.content']), `${name} ← ${value.web}`);
    }
  });
}

test('типографика соответствует веб-ролям, числовые роли остаются мобильными', () => {
  const p = loadPrimitives();
  assert.equal(p.fontFamily.sans, 'Inter Tight');
  assert.equal(p.fontFamily.mono, 'JetBrains Mono');
  for (const [name, expected] of Object.entries(reference.typography)) {
    for (const field of ['size', 'lineHeight', 'weight', 'tracking']) {
      assert.equal(p.role[name]?.[field], expected[field], `${name}.${field}`);
    }
    assert.equal(p.role[name].family ?? 'sans', expected.family);
  }
  assert.equal(p.role.numberLg.size, 20);
  assert.equal(p.role.numberMd.tabular, true);
});

test('общая шкала радиусов и движения сохраняет мобильные зоны нажатия', () => {
  const p = loadPrimitives();
  assert.deepEqual(p.radius, reference.radius);
  assert.equal(p.duration.base, 180);
  assert.equal(p.touchTarget, 44);
  assert.deepEqual(p.row, { compact: 40, default: 52, double: 64 });
});

test('телеметрия получает моноширинное семейство во всех форматах', () => {
  assert.match(generateDart(), /TextStyle mono = TextStyle\(\s+fontFamily: fontFamilyMono,/);
  assert.match(generateCss(), /\.type-mono \{\s+font-family: var\(--font-mono\);/);
  assert.equal(generateFigma().collections.typography.variables['role.mono.fontFamily'], 'JetBrains Mono');
});

test('Flutter поставляет исходные шрифты веб-системы и регистрирует семейства', () => {
  const packageUrl = new URL('../packages/aurora_design_system/', import.meta.url);
  const pubspec = readFileSync(new URL('pubspec.yaml', packageUrl), 'utf8');
  const fonts = [
    ['Inter Tight', 'InterTightVariable.ttf', 'b81b73dcb64df3c230cabade7df6c5773bf863233f24c9ee51087519f1f88b6f'],
    ['JetBrains Mono', 'JetBrainsMonoVariable.ttf', '48715a42ec242c21e9f02692891e147d022299a52e48d5e413e1a942193ffeda'],
  ];
  for (const [family, file, hash] of fonts) {
    assert.ok(pubspec.includes(`family: ${family}\n      fonts:\n        - asset: assets/fonts/${file}`));
    const bytes = readFileSync(new URL(`assets/fonts/${file}`, packageUrl));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, file);
  }
});
