import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { listBrands, loadBrand, loadPrimitives, loadSemantic, root } from './load.js';
import { resolveColors } from './resolve.js';
import { contrastRatio } from './color.js';
import { CONTRAST_PAIRS } from './validate.js';

const THEMES = ['light', 'dark'];
const BRAND_LABEL = { aurora: 'Aurora', mts: 'МТС', irissoft: 'Irissoft' };

/** Экранирование для текстовых узлов и значений атрибутов. */
export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Двузначное округление без экспоненты — для коэффициентов контраста. */
export function ratio(a, b) {
  return contrastRatio(a, b).toFixed(2);
}

/** Собирает всё, что нужно странице, из того же источника, что Dart и Figma. */
export function collect() {
  const brands = listBrands();
  const primitives = loadPrimitives();
  const semanticKeys = Object.keys(loadSemantic());

  const data = { brands, primitives, semanticKeys, byBrand: {} };

  for (const id of brands) {
    const brand = loadBrand(id);
    const colors = {};
    for (const theme of THEMES) colors[theme] = resolveColors(id, theme);

    const pairs = CONTRAST_PAIRS.map((p) => ({
      ...p,
      light: contrastRatio(colors.light[p.fg], colors.light[p.bg]),
      dark: contrastRatio(colors.dark[p.fg], colors.dark[p.bg]),
    }));

    data.byBrand[id] = { meta: brand, colors, pairs };
  }
  return data;
}

// ─────────────────────────────────────────────────────────────── CSS

/** Токены страницы. Страница собрана из той же системы, которую показывает. */
function themeVars(c) {
  return [
    `--content:${c['surface.content']}`,
    `--chrome:${c['surface.chrome']}`,
    `--selected:${c['surface.selected']}`,
    `--overlay:${c['surface.overlay']}`,
    `--hairline:${c['border.hairline']}`,
    `--strong:${c['border.strong']}`,
    `--fg:${c['text.primary']}`,
    `--muted:${c['text.secondary']}`,
    `--disabled:${c['text.disabled']}`,
    `--on-brand:${c['text.onBrand']}`,
    `--accent:${c['action.primary']}`,
    `--accent-pressed:${c['action.pressed']}`,
    `--accent-subtle:${c['action.subtle']}`,
    `--moving:${c['status.moving']}`,
    `--parked:${c['status.parked']}`,
    `--warning:${c['status.warning']}`,
    `--alarm:${c['status.alarm']}`,
    `--offline:${c['status.offline']}`,
    `--track:${c['map.trackDefault']}`,
    `--track-selected:${c['map.trackSelected']}`,
  ].join(';');
}

function paletteCss(data) {
  const [first, ...rest] = data.brands;
  const L = (id) => themeVars(data.byBrand[id].colors.light);
  const D = (id) => themeVars(data.byBrand[id].colors.dark);

  const out = [];
  // Светлая по умолчанию — полный набор токенов живёт в голом :root.
  out.push(`:root{${L(first)}}`);
  for (const id of rest) out.push(`:root[data-brand="${id}"]{${L(id)}}`);

  // Системная тёмная. Явный выбор светлой темы у зрителя должен побеждать.
  out.push('@media (prefers-color-scheme: dark){');
  out.push(`:root:not([data-theme="light"]){${D(first)}}`);
  for (const id of rest) out.push(`:root:not([data-theme="light"])[data-brand="${id}"]{${D(id)}}`);
  out.push('}');

  // Явно выбранная тёмная — побеждает в другую сторону.
  out.push(`:root[data-theme="dark"]{${D(first)}}`);
  for (const id of rest) out.push(`:root[data-theme="dark"][data-brand="${id}"]{${D(id)}}`);

  return out.join('\n');
}

const BASE_CSS = String.raw`
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0;background:var(--content);color:var(--fg);
  font:400 15px/1.55 Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  font-feature-settings:'cv05','ss01';
}
code,.mono,.hex{font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-numeric:tabular-nums}
a{color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px}

/* ── шапка ─────────────────────────────────────────────── */
.top{
  position:sticky;top:0;z-index:10;background:var(--chrome);
  border-bottom:1px solid var(--strong);
}
.top-in{
  max-width:1180px;margin:0 auto;padding:12px 24px;
  display:flex;align-items:center;gap:16px;flex-wrap:wrap;
}
.mark{display:flex;align-items:center;gap:10px;font-weight:600;letter-spacing:-.01em}
.mark-dot{width:20px;height:20px;border-radius:6px;background:var(--accent);flex:none}
.top-note{color:var(--muted);font-size:12px}
.switch{margin-left:auto;display:flex;gap:4px;padding:3px;background:var(--content);border:1px solid var(--strong);border-radius:10px}
.switch button{
  font:inherit;font-size:12.5px;font-weight:550;padding:6px 14px;border:0;border-radius:7px;
  background:transparent;color:var(--muted);cursor:pointer;
}
.switch button[aria-pressed="true"]{background:var(--accent);color:var(--on-brand)}

/* ── каркас ────────────────────────────────────────────── */
.wrap{max-width:1180px;margin:0 auto;padding:0 24px 96px}
.lede{max-width:64ch;padding:48px 0 8px;display:flex;flex-direction:column;gap:16px}
h1{font-size:34px;line-height:1.15;letter-spacing:-.025em;font-weight:600;margin:0;text-wrap:balance}
.lede p{margin:0;color:var(--muted);font-size:16px;line-height:1.6}
.lede strong{color:var(--fg);font-weight:550}

section{padding:56px 0 0;display:flex;flex-direction:column;gap:20px}
section>header{display:flex;flex-direction:column;gap:8px;max-width:64ch}
h2{
  font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  color:var(--muted);margin:0;padding-bottom:10px;border-bottom:1px solid var(--strong);
}
h2 span{color:var(--accent)}
h3{font-size:19px;font-weight:600;letter-spacing:-.012em;margin:0;text-wrap:balance}
section>header p,.note{margin:0;color:var(--muted);font-size:14px;line-height:1.6;max-width:64ch}
.note strong{color:var(--fg);font-weight:550}

/* ── таблицы ───────────────────────────────────────────── */
.scroll{overflow-x:auto;border:1px solid var(--strong);border-radius:12px;background:var(--content)}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{text-align:left;padding:9px 14px;border-bottom:1px solid var(--hairline);white-space:nowrap;vertical-align:middle}
thead th{
  background:var(--chrome);color:var(--muted);font-size:9px;font-weight:700;
  letter-spacing:.09em;text-transform:uppercase;border-bottom:1px solid var(--strong);
  position:sticky;top:0;
}
tbody tr:last-child td{border-bottom:0}
td.num,th.num{text-align:right;font-family:'JetBrains Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums}
.tok{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px}
.hex{font-size:11.5px;color:var(--muted);text-transform:uppercase}
.chip{display:inline-flex;align-items:center;gap:9px}
.sw{width:22px;height:22px;border-radius:6px;border:1px solid var(--strong);flex:none}
.sw-wide{width:52px}
.grp td{background:var(--chrome);font-size:9px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--muted)}

/* ── шкалы ─────────────────────────────────────────────── */
.ramp{display:flex;border:1px solid var(--strong);border-radius:12px;overflow:hidden}
.ramp div{flex:1;min-width:0;height:64px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px}
.ramp span{font:600 9px/1 'JetBrains Mono',monospace}
.ramp-legend{display:flex;justify-content:space-between;font-size:11px;color:var(--muted)}

/* ── типографика ───────────────────────────────────────── */
.type-row{
  display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px 24px;align-items:baseline;
  padding:16px 0;border-bottom:1px solid var(--hairline);
}
.type-row:last-child{border-bottom:0}
.type-spec{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;color:var(--muted);white-space:nowrap;font-variant-numeric:tabular-nums}
.type-name{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;color:var(--accent);display:block;margin-bottom:6px;letter-spacing:.04em}

/* ── форма и движение ──────────────────────────────────── */
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:12px}
.tile{border:1px solid var(--strong);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px;background:var(--content)}
.tile-label{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;color:var(--muted)}
.tile-val{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:17px;font-weight:600;font-variant-numeric:tabular-nums}
.radius-demo{height:46px;background:var(--accent-subtle);border:1px solid var(--accent)}
.space-demo{height:14px;background:var(--accent);border-radius:3px}
.row-demo{background:var(--accent-subtle);border:1px solid var(--accent);border-radius:8px}

.motion{display:flex;flex-direction:column;gap:10px}
.motion-track{
  position:relative;height:34px;border:1px solid var(--strong);border-radius:10px;
  background:var(--chrome);overflow:hidden;
}
.motion-dot{
  position:absolute;top:6px;left:6px;width:20px;height:20px;border-radius:6px;background:var(--accent);
  transform:translateX(0);
}
.motion-track.go .motion-dot{transform:translateX(calc(100% + 100px))}
@media (prefers-reduced-motion:reduce){.motion-dot{transition:none!important}}

/* ── живые компоненты ──────────────────────────────────── */
.demo{border:1px solid var(--strong);border-radius:16px;overflow:hidden;background:var(--content)}
.demo-bar{
  display:flex;align-items:center;gap:10px;padding:12px 14px;
  background:var(--content);border-bottom:1px solid var(--strong);
}
.demo-title{font-weight:600;font-size:15px;letter-spacing:-.01em}
.demo-count{margin-left:auto;font-size:11px;color:var(--muted);border:1px solid var(--strong);padding:3px 9px;border-radius:8px}
.demo-sec{
  display:flex;align-items:center;padding:7px 14px;background:var(--chrome);
  border-bottom:1px solid var(--strong);border-top:1px solid var(--strong);
  font-size:9px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);
}
.demo-sec .num{margin-left:auto;letter-spacing:0;font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums}
.demo-row{display:flex;align-items:center;gap:11px;padding:10px 14px;border-bottom:1px solid var(--hairline)}
.demo-row:last-child{border-bottom:0}
.demo-row.on{background:var(--selected);box-shadow:inset 2px 0 0 var(--accent)}
.dot{width:8px;height:8px;border-radius:50%;flex:none}
.plate{font-weight:600;font-size:13px;letter-spacing:.01em}
.sub{color:var(--muted);font-size:11px;margin-top:2px}
.metric{margin-left:auto;text-align:right}
.metric b{display:block;font:600 14px/1 'JetBrains Mono',monospace;font-variant-numeric:tabular-nums}
.metric i{display:block;font-style:normal;color:var(--muted);font-size:9px;margin-top:3px}
.demo-total{display:flex;align-items:center;padding:11px 14px;background:var(--chrome);border-top:1px solid var(--strong);font-size:12px;font-weight:600}
.demo-total .num{margin-left:auto;font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums}

.hud{position:relative;height:150px;background:var(--chrome)}
.hud svg{position:absolute;inset:0;width:100%;height:100%}
.hud-card{
  position:absolute;left:14px;right:14px;bottom:14px;background:var(--overlay);
  border:1px solid var(--strong);border-radius:12px;padding:11px 13px;display:flex;align-items:center;gap:12px;
}
.hud-speed{margin-left:auto;text-align:right}
.hud-speed b{display:block;font:600 24px/1 'JetBrains Mono',monospace;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.hud-speed i{display:block;font-style:normal;color:var(--muted);font-size:9px;margin-top:4px}

/* ── контраст ──────────────────────────────────────────── */
.pass{color:var(--moving);font-weight:600}
.tight{color:var(--warning);font-weight:600}
td.slack{font-size:11px;color:var(--muted)}

/* ── открытые вопросы ──────────────────────────────────── */
.open{display:grid;gap:14px}
.open-item{border:1px solid var(--strong);border-left:3px solid var(--warning);border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;gap:8px;background:var(--content)}
.open-item h3{font-size:15px}
.open-item p{margin:0;color:var(--muted);font-size:13.5px;line-height:1.6}

.foot{margin-top:64px;padding-top:20px;border-top:1px solid var(--strong);color:var(--muted);font-size:12px;display:flex;flex-direction:column;gap:6px}

.brand-only{display:none}
@media (max-width:720px){
  .wrap,.top-in{padding-left:16px;padding-right:16px}
  h1{font-size:27px}
  .type-row{grid-template-columns:minmax(0,1fr)}
}
`;

// ─────────────────────────────────────────────────────── фрагменты

function brandGate(id, first) {
  // Блоки конкретного бренда показываются по data-brand на :root.
  return id === first
    ? `:root:not([data-brand]) .b-${id},:root[data-brand="${id}"] .b-${id}{display:revert}`
    : `:root[data-brand="${id}"] .b-${id}{display:revert}`;
}

function semanticTable(d) {
  const groups = [
    ['Поверхности', ['surface.content', 'surface.chrome', 'surface.selected', 'surface.overlay']],
    ['Границы', ['border.hairline', 'border.strong']],
    ['Текст', ['text.primary', 'text.secondary', 'text.disabled', 'text.onBrand']],
    ['Действие', ['action.primary', 'action.pressed', 'action.subtle', 'focus.indicator']],
    ['Статусы', ['status.moving', 'status.parked', 'status.warning', 'status.alarm', 'status.offline']],
    ['Карта', ['map.trackDefault', 'map.trackSpeeding', 'map.trackSelected', 'map.markerFill', 'map.markerStroke', 'map.clusterFill', 'map.clusterText']],
  ];
  const rows = [];
  for (const [title, keys] of groups) {
    rows.push(`<tr class="grp"><td colspan="3">${esc(title)}</td></tr>`);
    for (const k of keys) {
      if (!d.colors.light[k]) continue;
      const l = d.colors.light[k];
      const dk = d.colors.dark[k];
      rows.push(
        `<tr><td class="tok">${esc(k)}</td>` +
        `<td><span class="chip"><span class="sw" style="background:${esc(l)}"></span><span class="hex">${esc(l)}</span></span></td>` +
        `<td><span class="chip"><span class="sw" style="background:${esc(dk)}"></span><span class="hex">${esc(dk)}</span></span></td></tr>`
      );
    }
  }
  return `<div class="scroll"><table><thead><tr><th>токен</th><th>светлая</th><th>тёмная</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

function rampBlock(title, scale) {
  const steps = Object.entries(scale);
  const cells = steps.map(([step, hex]) => {
    // Подпись читаемым цветом: тёмный текст на светлой ступени и наоборот.
    const n = parseInt(hex.slice(1), 16);
    const lum = (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255;
    const ink = lum > 0.6 ? '#00000099' : '#FFFFFFCC';
    return `<div style="background:${esc(hex)}"><span style="color:${ink}">${esc(step)}</span></div>`;
  }).join('');
  const legend = steps.map(([s, h]) => `<span class="hex">${esc(s)} ${esc(h)}</span>`).join('');
  return `<div style="display:flex;flex-direction:column;gap:10px">
    <h3>${esc(title)}</h3>
    <div class="ramp">${cells}</div>
    <div class="scroll" style="border:0;background:transparent"><div style="display:flex;gap:14px;padding-top:2px">${legend}</div></div>
  </div>`;
}

function contrastTable(d) {
  const rows = d.pairs.map((p) => {
    const cls = (v) => (v - p.min < 0.06 ? 'tight' : 'pass');
    return `<tr>
      <td class="tok">${esc(p.fg)}</td>
      <td class="tok" style="color:var(--muted)">${esc(p.bg)}</td>
      <td class="num">${p.min.toFixed(2)}</td>
      <td class="num ${cls(p.light)}">${p.light.toFixed(2)}</td>
      <td class="num ${cls(p.dark)}">${p.dark.toFixed(2)}</td>
      <td class="slack">${esc(p.note)}</td>
    </tr>`;
  }).join('');
  return `<div class="scroll"><table><thead><tr>
    <th>цвет</th><th>на фоне</th><th class="num">порог</th><th class="num">светлая</th><th class="num">тёмная</th><th>где</th>
  </tr></thead><tbody>${rows}</tbody></table></div>`;
}

function typographyBlock(role) {
  const sample = {
    display: 'Расход топлива',
    title: 'Поездки за неделю',
    section: 'Пн, 8 сентября',
    body: 'Объект вышел за границу геозоны «Склад №3» и вернулся через 42 минуты.',
    label: 'Склад №3 → Заводская',
    caption: 'обновлено 2 минуты назад',
    overline: 'Хронология',
    numberLg: '64',
    numberMd: '126.3',
    numberSm: '07:42–08:16',
  };
  return Object.entries(role).map(([name, r]) => {
    const style = [
      `font-size:${r.size}px`,
      `line-height:${(r.lineHeight / r.size).toFixed(4)}`,
      `font-weight:${Math.round(r.weight / 100) * 100}`,
      `letter-spacing:${(r.tracking * r.size).toFixed(3)}px`,
      r.tabular ? 'font-variant-numeric:tabular-nums' : '',
      r.uppercase ? 'text-transform:uppercase' : '',
    ].filter(Boolean).join(';');
    const rounded = Math.round(r.weight / 100) * 100;
    const weightNote = rounded === r.weight ? `${r.weight}` : `${r.weight}→${rounded}`;
    return `<div class="type-row">
      <div><span class="type-name">${esc(name)}</span><span style="${style}">${esc(sample[name] ?? name)}</span></div>
      <div class="type-spec">${r.size}/${r.lineHeight} · w${esc(weightNote)}${r.tracking ? ` · ${r.tracking > 0 ? '+' : ''}${(r.tracking * 100).toFixed(1)}%` : ''}${r.tabular ? ' · tnum' : ''}</div>
    </div>`;
  }).join('');
}

function componentsBlock(c) {
  const row = (dot, plate, sub, val, unit, on) =>
    `<div class="demo-row${on ? ' on' : ''}">
      <span class="dot" style="background:${esc(dot)}"></span>
      <div><div class="plate">${esc(plate)}</div><div class="sub">${esc(sub)}</div></div>
      <div class="metric"><b>${esc(val)}</b><i>${esc(unit)}</i></div>
    </div>`;

  return `<div class="demo">
    <div class="demo-bar"><span class="demo-title">Поездки</span><span class="demo-count">24 / 31</span></div>
    <div class="hud">
      <svg viewBox="0 0 800 150" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 116 L120 96 L240 106 L360 60 L480 70 L640 30 L800 44" fill="none"
              stroke="${esc(c['map.trackDefault'])}" stroke-width="3" stroke-linecap="round"/>
        <circle cx="360" cy="60" r="11" fill="${esc(c['map.markerFill'])}" stroke="${esc(c['map.markerStroke'])}" stroke-width="3"/>
        <circle cx="640" cy="30" r="6" fill="${esc(c['status.moving'])}"/>
        <circle cx="120" cy="96" r="6" fill="${esc(c['status.alarm'])}"/>
      </svg>
      <div class="hud-card">
        <div><div class="plate">AB 4721-7</div><div class="sub mono">53.9158, 27.5629</div></div>
        <div class="hud-speed"><b>64</b><i>км/ч</i></div>
      </div>
    </div>
    <div class="demo-sec"><span>Пн, 8 сентября</span><span class="num">72.3 км</span></div>
    ${row(c['status.moving'], 'Склад №3 → Заводская', '07:42–08:16 · 34 мин · 2 остановки', '18.4', 'км', true)}
    ${row(c['status.parked'], 'Заводская → Кольцевая', '09:03–09:31 · 28 мин', '122.7', 'км', false)}
    ${row(c['status.alarm'], 'Кольцевая → Склад №3', '11:15–12:04 · превышение скорости', '31.2', 'км', false)}
    ${row(c['status.offline'], 'Промзона → Склад №3', '13:20 · нет связи 2 ч', '—', 'км', false)}
    <div class="demo-total"><span>Итого за период</span><span class="num">126.3 км</span></div>
  </div>`;
}

function geofenceBlock(c) {
  const names = Object.keys(c).filter((k) => k.startsWith('geofence.'));
  const cells = names.map((k) => {
    const light = c[k];
    return `<div class="tile">
      <div style="height:44px;border-radius:8px;border:1px solid var(--strong);background:${esc(light)}"></div>
      <div class="tile-label">${esc(k.replace('geofence.', ''))}</div>
      <div class="hex">${esc(light)}</div>
    </div>`;
  }).join('');
  return `<div class="tiles">${cells}</div>`;
}

// ─────────────────────────────────────────────────────── страница

export function generatePreview() {
  const d = collect();
  const p = d.primitives;
  const [first] = d.brands;

  const brandSections = d.brands.map((id) =>
    `<div class="brand-only b-${id}">${semanticTable(d.byBrand[id])}</div>`
  ).join('');

  const rampSections = d.brands.map((id) => {
    const b = d.byBrand[id];
    return `<div class="brand-only b-${id}">
      <div style="display:flex;flex-direction:column;gap:28px">
        ${rampBlock(`Нейтральная шкала · hue ${b.meta.neutralHue}°`, b.meta.color.neutral)}
        ${rampBlock(`Брендовая шкала · seed ${b.meta.seed}`, b.meta.color.brand)}
      </div>
    </div>`;
  }).join('');

  const contrastSections = d.brands.map((id) =>
    `<div class="brand-only b-${id}">${contrastTable(d.byBrand[id])}</div>`
  ).join('');

  const componentSections = d.brands.map((id) =>
    `<div class="brand-only b-${id}">${componentsBlock(d.byBrand[id].colors.light)}</div>`
  ).join('');

  const geofenceSections = d.brands.map((id) =>
    `<div class="brand-only b-${id}">${geofenceBlock(d.byBrand[id].colors.light)}</div>`
  ).join('');

  const gates = d.brands.map((id) => brandGate(id, first)).join('\n');

  const switchButtons = d.brands.map((id, i) =>
    `<button type="button" data-set-brand="${esc(id)}" aria-pressed="${i === 0 ? 'true' : 'false'}">${esc(BRAND_LABEL[id] ?? id)}</button>`
  ).join('');

  const radiusTiles = Object.entries(p.radius).map(([k, v]) =>
    `<div class="tile"><div class="radius-demo" style="border-radius:${v}px"></div><div class="tile-label">radius.${esc(k)}</div><div class="tile-val">${v === 999 ? 'pill' : v}</div></div>`
  ).join('');

  const rowTiles = Object.entries(p.row).map(([k, v]) =>
    `<div class="tile"><div class="row-demo" style="height:${v}px"></div><div class="tile-label">row.${esc(k)}</div><div class="tile-val">${v}</div></div>`
  ).join('');

  const spaceTiles = Object.entries(p.space).filter(([k]) => k !== '0').map(([k, v]) =>
    `<div class="tile"><div class="space-demo" style="width:${v}px"></div><div class="tile-label">space.${esc(k)}</div><div class="tile-val">${v}</div></div>`
  ).join('');

  const motionRows = Object.entries(p.duration).map(([k, v]) =>
    `<div class="motion">
      <div class="motion-track" data-play="${v}"><div class="motion-dot" style="transition:transform ${v}ms cubic-bezier(.215,.61,.355,1)"></div></div>
      <div class="ramp-legend"><span class="tile-label">duration.${esc(k)}</span><span class="tile-val" style="font-size:13px">${v} мс</span></div>
    </div>`
  ).join('');

  return `<title>Дизайн-система Aurora</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap">
<style>
${paletteCss(d)}
${gates}
${BASE_CSS}
</style>

<header class="top">
  <div class="top-in">
    <span class="mark"><span class="mark-dot"></span>Дизайн-система Aurora</span>
    <span class="top-note">собрано из токенов · <span class="mono">npm run build</span></span>
    <div class="switch" role="group" aria-label="Бренд">${switchButtons}</div>
  </div>
</header>

<div class="wrap">

  <div class="lede">
    <h1>Палитра, шкалы и форма — как они выглядят на самом деле</h1>
    <p>Эта страница <strong>собрана из тех же токенов</strong>, что и приложение: те же цвета, те же радиусы, та же типографика, то же отсутствие теней. Ничего здесь не набрано руками, поэтому разойтись с кодом она не может.</p>
    <p>Переключатель в шапке меняет бренд <strong>целиком</strong> — это и есть проверка white-label: если Aurora и МТС различимы, но читаются как одна платформа, система работает. Светлая и тёмная тема следуют за настройкой вашей системы.</p>
  </div>

  <section>
    <header>
      <h2>Основа <span>·</span> четыре решения</h2>
      <p>Индивидуальность живёт в форме и поведении, а не в цвете — потому что цвет бренд заменяет целиком. Интерфейс нейтральный, цветными остаются только данные. Разделение поверхностей идёт тоном и волосяной границей: <strong>теней в системе нет вообще</strong>. Шрифт один на обеих платформах, числа набираются табличными цифрами внутри него, отдельной моноширинной гарнитуры нет.</p>
      <p class="note">Моноширинный шрифт на этой странице — голос документации: им набраны имена токенов и hex-коды. В самом приложении его нет.</p>
    </header>
  </section>

  <section>
    <header>
      <h2>Цвет <span>·</span> семантические токены</h2>
      <p>Компоненты видят только этот слой. К ступеням шкал они не обращаются никогда — именно так ломается тёмная тема, когда в вёрстке стоит «белый» вместо «поверхность контента».</p>
    </header>
    ${brandSections}
  </section>

  <section>
    <header>
      <h2>Цвет <span>·</span> шкалы</h2>
      <p>Их рисует дизайнер, а не генератор. <span class="mono">neutralHue</span> и <span class="mono">seed</span> записывают замысел: холодные нейтрали у Aurora, тёплые у МТС. Набор ступеней менять нельзя — за этим следит автоматика. Ступень <span class="mono">850</span> выглядит лишней ровно до того момента, когда её уберут: без неё тёмная волосяная граница сливается с фоном панели.</p>
    </header>
    ${rampSections}
  </section>

  <section>
    <header>
      <h2>Контраст <span>·</span> измеренный, не обещанный</h2>
      <p>Каждая пара проверяется на каждой сборке. Значения ниже — не цель, а факт: если правка шкалы уронит любую из них ниже порога, сборка не пройдёт. Жёлтым отмечены пары с запасом меньше 0.06 — это те, что сломаются первыми.</p>
    </header>
    ${contrastSections}
  </section>

  <section>
    <header>
      <h2>Типографика <span>·</span> десять ролей</h2>
      <p>Показано в реальном размере. Вес <span class="mono">550</span> у роли <span class="mono">label</span> округляется до 600 — у Flutter начертания идут шагом 100, и это стоит знать заранее, чтобы не рисовать то, чего код не отрисует.</p>
    </header>
    <div>${typographyBlock(p.role)}</div>
  </section>

  <section>
    <header><h2>Форма <span>·</span> радиусы</h2></header>
    <div class="tiles">${radiusTiles}</div>
    <header style="padding-top:12px"><h3>Высоты строк</h3><p class="note">Минимальная зона нажатия — ${p.touchTarget} независимо от видимого размера.</p></header>
    <div class="tiles">${rowTiles}</div>
    <header style="padding-top:12px"><h3>Отступы</h3><p class="note">Шаг 4. Горизонтальный отступ экрана ${p.screenPadding}, внутренний отступ строки ${p.rowPadding}.</p></header>
    <div class="tiles">${spaceTiles}</div>
  </section>

  <section>
    <header>
      <h2>Движение <span>·</span> четыре длительности</h2>
      <p>Наведите на дорожку. Вход — <span class="mono">${esc(p.curve.enter)}</span>, выход — <span class="mono">${esc(p.curve.exit)}</span>. Самая долгая, <span class="mono">dataInterp</span>, не для интерфейса: за неё объект на карте переезжает в новую точку, вместо того чтобы телепортироваться. Мигающий интерфейс читается как сломанный.</p>
    </header>
    <div class="tiles" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${motionRows}</div>
  </section>

  <section>
    <header>
      <h2>Геозоны <span>·</span> данные, а не оформление</h2>
      <p>Эти восемь цветов назначает оператор, а не дизайнер. Они одинаковы у всех брендов и перекраске не подлежат — иначе у клиента «красная зона» перестанет быть красной. Показаны с альфой для светлой темы.</p>
    </header>
    ${geofenceSections}
  </section>

  <section>
    <header>
      <h2>В деле <span>·</span> экран из этих токенов</h2>
      <p>Ни одного цвета, набранного руками. Выделенная строка — полоса 2 px слева плюс подсветка фоном; больше одного выделителя на экране не бывает.</p>
    </header>
    ${componentSections}
  </section>

  <section>
    <header>
      <h2>Открыто <span>·</span> ждёт вашего решения</h2>
      <p>Две вещи нашлись при финальной проверке и намеренно не тронуты: обе меняют цвет, подобранный человеком.</p>
    </header>
    <div class="open">
      <div class="open-item">
        <h3>Подсветка выбранной строки стала слабее</h3>
        <p>Чтобы текст на выделенной строке взял AA, её фон пересобрали от белого. Побочный эффект: сама подсветка сблизилась с фоном — тональный шаг упал с 1.147 до <strong>1.059</strong> у Aurora и с 1.161 до <strong>1.074</strong> у МТС. В системе без теней тон — единственный разделитель, и этот шаг сейчас самый слабый из всех. Либо зафиксировать как есть, либо усилить подсветку.</p>
      </div>
      <div class="open-item">
        <h3>Порог волосяной границы держится на 0.00006</h3>
        <p>Он выставлен ровно по сегодняшнему значению, то есть фактически закрепляет два светлых серых Aurora. Как защита от сплющивания шкалы это работает, но первый, кто тронет эти серые по другому поводу, увидит падение сборки и прочтёт его как «я что-то сломал».</p>
      </div>
    </div>
  </section>

  <div class="foot">
    <span>Источник: <span class="mono">design-system/tokens/</span> · страница пересобирается командой <span class="mono">npm run build</span></span>
    <span>Если страница и код разошлись — верен код.</span>
  </div>

</div>

<script>
(function () {
  var root = document.documentElement;
  var KEY = 'aurora-preview-brand';
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-set-brand]'));

  function apply(id) {
    root.setAttribute('data-brand', id);
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-brand') === id));
    });
    try { localStorage.setItem(KEY, id); } catch (e) {}
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { apply(b.getAttribute('data-set-brand')); });
  });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  apply(saved && buttons.some(function (b) { return b.getAttribute('data-set-brand') === saved; })
    ? saved
    : buttons[0].getAttribute('data-set-brand'));

  Array.prototype.forEach.call(document.querySelectorAll('.motion-track'), function (t) {
    function run() {
      if (t.classList.contains('go')) return;
      t.classList.add('go');
      setTimeout(function () { t.classList.remove('go'); }, Number(t.getAttribute('data-play')) + 220);
    }
    t.addEventListener('mouseenter', run);
    t.addEventListener('click', run);
  });
})();
</script>`;
}

export function writePreview() {
  const out = path.join(root, 'build', 'preview.html');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, generatePreview(), 'utf8');
  return out;
}
