import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { listBrands, loadPrimitives, loadSemantic, root } from './load.js';
import { resolveColors } from './resolve.js';
import { renderedWeight, lineHeightRatio, letterSpacingPx } from './generate-dart.js';
import { cssCurve } from './curves.js';

const THEMES = ['light', 'dark'];

/** `map.trackDefault` → `map-track-default`, `text.onBrand` → `text-on-brand`. */
export function cssName(dotted) {
  return dotted
    .replace(/\./g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function block(selector, entries) {
  return `${selector} {\n${entries.map((e) => `  ${e}`).join('\n')}\n}`;
}

function colorEntries(colors) {
  return Object.entries(colors).map(([token, hex]) => `--${cssName(token)}: ${hex};`);
}

/**
 * Токены как CSS-переменные — то, что инструменты дизайна (Claude Design,
 * другие агенты, верстальщик прототипа) читают напрямую. Та же схема
 * переключения, что в превью: светлая тема первого бренда в голом `:root`,
 * бренд через `data-brand`, тема через системную настройку или `data-theme`.
 */
export function generateCss() {
  const brands = listBrands();
  const [first, ...rest] = brands;
  const p = loadPrimitives();
  const semanticCount = Object.keys(loadSemantic()).length;
  const colors = {};
  for (const b of brands) {
    colors[b] = {};
    for (const t of THEMES) colors[b][t] = resolveColors(b, t);
  }

  const out = [];
  out.push('/* GENERATED — не редактировать руками.');
  out.push(' * Источник: tokens/. Пересобрать: npm run build');
  out.push(' *');
  out.push(` * Бренды: ${brands.join(', ')}. Темы: light, dark. Семантических цветов: ${semanticCount}.`);
  out.push(' * Переключение: <html data-brand="mts" data-theme="dark">; без data-theme тема');
  out.push(` * следует за prefers-color-scheme; без data-brand действует ${first}.`);
  out.push(' * Компонент обращается только к этим переменным, к ступеням шкал — никогда (§4.4 спека).');
  out.push(' */');
  out.push('');
  out.push('@import url("https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap");');
  out.push('');

  out.push(`/* ── Цвет · ${first}, светлая ─────────────────────────── */`);
  out.push(block(':root', ['color-scheme: light dark;', ...colorEntries(colors[first].light)]));
  for (const b of rest) {
    out.push('');
    out.push(`/* ── Цвет · ${b}, светлая ─────────────────────────── */`);
    out.push(block(`:root[data-brand="${b}"]`, colorEntries(colors[b].light)));
  }
  out.push('');
  out.push('/* ── Цвет · тёмная, по системной настройке ───────── */');
  out.push('@media (prefers-color-scheme: dark) {');
  out.push(block(':root:not([data-theme="light"])', colorEntries(colors[first].dark)).replace(/^/gm, '  '));
  for (const b of rest) {
    out.push(block(`:root:not([data-theme="light"])[data-brand="${b}"]`, colorEntries(colors[b].dark)).replace(/^/gm, '  '));
  }
  out.push('}');
  out.push('');
  out.push('/* ── Цвет · тёмная, выбранная явно ───────────────── */');
  out.push(block(':root[data-theme="dark"]', colorEntries(colors[first].dark)));
  for (const b of rest) {
    out.push(block(`:root[data-theme="dark"][data-brand="${b}"]`, colorEntries(colors[b].dark)));
  }
  out.push('');

  const dims = [];
  for (const [k, v] of Object.entries(p.space)) dims.push(`--space-${k}: ${v}px;`);
  for (const [k, v] of Object.entries(p.radius)) dims.push(`--radius-${k}: ${v}px;`);
  for (const [k, v] of Object.entries(p.row)) dims.push(`--row-${k}: ${v}px;`);
  dims.push(`--touch-target: ${p.touchTarget}px;`);
  dims.push(`--screen-padding: ${p.screenPadding}px;`);
  dims.push(`--row-padding: ${p.rowPadding}px;`);
  dims.push(`--active-bar-width: ${p.activeBarWidth}px;`);
  dims.push(`--hairline-width: ${p.hairlineWidth}px;`);
  out.push('/* ── Размеры и движение · одни для всех брендов и тем ── */');
  const motion = [];
  for (const [k, v] of Object.entries(p.duration)) motion.push(`--duration-${cssName(k)}: ${v}ms;`);
  for (const [k, v] of Object.entries(p.curve)) motion.push(`--ease-${k}: ${cssCurve(v)};`);
  const fonts = [
    `--font-sans: '${p.fontFamily.sans}', system-ui, sans-serif;`,
    `--font-mono: '${p.fontFamily.mono}', monospace;`,
    `--font-arabic: '${p.fontFamily.arabic}', system-ui, sans-serif;`,
  ];
  out.push(block(':root', [...dims, ...motion, ...fonts]));
  out.push('');

  out.push('/* ── Типографика · общие веб-роли и мобильные числовые роли ── */');
  for (const [name, r] of Object.entries(p.role)) {
    const entries = [
      `font-family: var(--font-${r.family ?? 'sans'});`,
      `font-size: ${r.size}px;`,
      `line-height: ${lineHeightRatio(r)};`,
      `font-weight: ${renderedWeight(r.weight)};${r.weight !== renderedWeight(r.weight) ? ` /* авторский ${r.weight} */` : ''}`,
      `letter-spacing: ${letterSpacingPx(r)}px;`,
    ];
    if (r.tabular) entries.push('font-variant-numeric: tabular-nums;');
    if (r.uppercase) entries.push('text-transform: uppercase;');
    out.push(block(`.type-${cssName(name)}`, entries));
  }
  out.push('');
  out.push('/* Правила, которые переменными не выражаются:');
  out.push(' * — теней нет нигде: поверхности разделяются тоном (surface.*) и волосяной границей (border.hairline);');
  out.push(' * — выделение активного: полоса --active-bar-width слева цветом --action-primary плюс --surface-selected, один выделитель на экране;');
  out.push(' * — минимальная зона нажатия --touch-target независимо от видимого размера;');
  out.push(' * — RTL: все отступы логические (inline-start/end), карта, графики и числа не зеркалятся. */');
  out.push('');
  return out.join('\n');
}

export function writeCss() {
  const out = path.join(root, 'build', 'design-system.css');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, generateCss(), 'utf8');
  return out;
}
