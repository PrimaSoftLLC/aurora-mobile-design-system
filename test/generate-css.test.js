import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCss, cssName } from '../tools/generate-css.js';
import { resolveColors } from '../tools/resolve.js';
import { listBrands, loadSemantic, loadPrimitives } from '../tools/load.js';

const css = generateCss();

test('cssName переводит точки и camelCase в kebab', () => {
  assert.equal(cssName('surface.content'), 'surface-content');
  assert.equal(cssName('map.trackDefault'), 'map-track-default');
  assert.equal(cssName('text.onBrand'), 'text-on-brand');
  assert.equal(cssName('numberLg'), 'number-lg');
  assert.equal(cssName('dataInterp'), 'data-interp');
});

test('файл помечен как сгенерированный', () => {
  assert.match(css, /GENERATED/);
  assert.match(css, /npm run build/);
});

test('каждый семантический токен есть переменной в каждом бренде и теме', () => {
  const [first, ...rest] = listBrands();
  const tokens = Object.keys(loadSemantic());
  const blocks = {
    [`${first}/light`]: /:root \{[^}]*\}/.exec(css)[0],
    [`${first}/dark`]: /:root\[data-theme="dark"\] \{[^}]*\}/.exec(css)[0],
  };
  for (const b of rest) {
    blocks[`${b}/light`] = new RegExp(`:root\\[data-brand="${b}"\\] \\{[^}]*\\}`).exec(css)[0];
    blocks[`${b}/dark`] = new RegExp(`:root\\[data-theme="dark"\\]\\[data-brand="${b}"\\] \\{[^}]*\\}`).exec(css)[0];
  }
  for (const [key, body] of Object.entries(blocks)) {
    const [brand, theme] = key.split('/');
    const colors = resolveColors(brand, theme);
    for (const t of tokens) {
      assert.ok(body.includes(`--${cssName(t)}: ${colors[t]};`), `${key}: нет --${cssName(t)} = ${colors[t]}`);
    }
  }
});

test('тёмная тема покрывает системную настройку и явный выбор', () => {
  assert.match(css, /@media \(prefers-color-scheme: dark\)/);
  assert.match(css, /:root:not\(\[data-theme="light"\]\) \{/);
  assert.match(css, /:root\[data-theme="dark"\] \{/);
});

test('размеры, движение и шрифты лежат в общем блоке с единицами', () => {
  assert.match(css, /--space-16: 16px;/);
  assert.match(css, /--radius-md: 8px;/);
  assert.match(css, /--row-default: 52px;/);
  assert.match(css, /--touch-target: 44px;/);
  assert.match(css, /--duration-base: 200ms;/);
  assert.match(css, /--duration-data-interp: 500ms;/);
  assert.match(css, /--ease-enter: cubic-bezier\(\.215,\.61,\.355,1\);/);
  assert.match(css, /--font-sans: 'Inter'/);
  assert.match(css, /--font-arabic: 'Noto Sans Arabic'/);
});

test('десять ролей типографики — классами, с теми же числами, что в Dart', () => {
  const roles = Object.keys(loadPrimitives().role);
  for (const r of roles) assert.match(css, new RegExp(`\\.type-${cssName(r)} \\{`), r);
  const label = /\.type-label \{[^}]*\}/.exec(css)[0];
  assert.match(label, /font-weight: 600; \/\* авторский 550 \*\//);
  const numberMd = /\.type-number-md \{[^}]*\}/.exec(css)[0];
  assert.match(numberMd, /font-variant-numeric: tabular-nums;/);
  assert.match(numberMd, /line-height: 1\.2857;/);
  const overline = /\.type-overline \{[^}]*\}/.exec(css)[0];
  assert.match(overline, /text-transform: uppercase;/);
  assert.match(overline, /letter-spacing: 0\.7200px;/);
});

test('теней нет и в CSS-токенах', () => {
  assert.equal(/box-shadow|--shadow|--elevation/.test(css), false);
});

test('генерация детерминирована', () => {
  assert.equal(generateCss(), css);
});
