# Aurora Design Tokens — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Построить источник истины дизайн-токенов Aurora с валидацией и генераторами в Dart и Figma, плюс Flutter-пакет `aurora_design_system` с темой, переключающейся по паре «бренд × светлая/тёмная».

**Architecture:** Токены лежат в JSON в формате W3C Design Tokens. Примитивный слой (шкалы цвета, отступы, радиусы, типографика, движение) отдельно от семантического (роли, ссылающиеся на примитивы). Бренд — файл с двумя шкалами цвета и метаданными. Небольшой Node-пайплайн разрешает ссылки, валидирует целостность и контраст, затем генерирует `tokens.g.dart` для Flutter и `figma-variables.json` для Figma. Flutter-пакет оборачивает сгенерированное в `ThemeExtension`.

**Tech Stack:** Node 20.20.2 (встроенный `node:test`, без внешних зависимостей), Flutter 3.41.9 / Dart 3.11.5, mise для пиннинга версий.

**Spec:** `docs/superpowers/specs/2026-09-08-aurora-design-system-design.md`

## Global Constraints

Эти правила действуют во всех задачах. Каждое скопировано из спека.

- **Компонент никогда не обращается к примитиву напрямую.** Семантический слой — единственное, что видят компоненты. Валидатор это принуждает (Задача 3).
- **Теней нет.** `elevation`, `boxShadow`, `Material.elevation` в системе не существуют как понятия. Разделение поверхностей — тоном и волосяной границей.
- **Радиусы:** `4 / 8 / 12 / 16 / pill(999)`. Высоты строк: `40 / 52 / 64`. Минимальная зона нажатия `44`.
- **Отступы:** шаг 4, ряд `2, 4, 8, 12, 16, 20, 24, 32, 40, 48`.
- **Шрифт:** Inter на обеих платформах. Арабский — Noto Sans Arabic. Моноширинного нет; числа набираются `tabular-nums` внутри Inter.
- **Статусные цвета фиксированы и одинаковы у всех брендов:** `moving`, `parked`, `warning`, `alarm`, `offline`. Пять, не больше.
- **Бренд меняет ровно четыре вещи:** шкалу `brand`, шкалу `neutral` (через `neutralHue`), `logo`, `wordmark`. Всё остальное едино. Задача 4 — автоматический сторож этого правила.
- **Направление синхронизации: JSON → Figma, не наоборот.** Генератор Figma только пишет; обратного импорта в пайплайне нет и не должно появиться.
- **RTL:** отступы логические (`start`/`end`), не `left`/`right`. В токенах это значит: никаких `paddingLeft`.
- **Сообщения коммитов на английском** (глобальное правило проекта), и каждое заканчивается трейлером:
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  ```
- **Все команды запускаются из `design-system/`**, если в шаге не сказано иначе.

## Структура файлов

```
design-system/
  mise.toml                       пины node 20 и flutter 3.41.9
  package.json                    скрипты test / build, зависимостей нет
  .gitignore                      build/
  tokens/
    primitive/scale.json          отступы, радиусы, высоты строк
    primitive/typography.json     10 типографических ролей
    primitive/motion.json         длительности и кривые
    primitive/status.json         5 статусов × light/dark, общие для брендов
    semantic/color.json           роли → ссылки на примитивы, light/dark
    brands/aurora.json            метаданные + шкалы neutral и brand
    brands/mts.json               то же для МТС
  tools/
    color.js                      разбор hex, смешивание, яркость, контраст
    load.js                       чтение и слияние JSON-токенов
    resolve.js                    разрешение ссылок для пары бренд × тема
    validate.js                   целостность ссылок + контраст WCAG AA
    parity.js                     сторож правила «бренд меняет 4 вещи»
    generate-dart.js              → aurora_design_system/lib/src/tokens/tokens.g.dart
    generate-figma.js             → build/figma-variables.json
    build.js                      запускает валидацию, затем оба генератора
  test/
    color.test.js
    resolve.test.js
    validate.test.js
    parity.test.js
    generate-dart.test.js
    generate-figma.test.js
  aurora_design_system/           Flutter-пакет
    pubspec.yaml
    lib/aurora_design_system.dart
    lib/src/tokens/tokens.g.dart  генерируется, коммитится
    lib/src/theme/aurora_theme.dart
    test/aurora_theme_test.dart
```

Разделение по ответственности: `color.js` не знает про токены, `resolve.js` не знает про Dart, генераторы не знают друг о друге. Каждый файл тестируется отдельно.

---

### Task 1: Цветовая математика

Фундамент для всего остального: смешивание нужно семантическому слою, контраст — валидатору.

**Files:**
- Create: `design-system/mise.toml`
- Create: `design-system/package.json`
- Create: `design-system/.gitignore`
- Create: `design-system/tools/color.js`
- Test: `design-system/test/color.test.js`

**Interfaces:**
- Produces:
  - `parseHex(hex: string) -> {r: number, g: number, b: number}` — компоненты 0–255, бросает на некорректном вводе
  - `toHex({r, g, b}) -> string` — верхний регистр, с `#`
  - `mix(hexA: string, hexB: string, amount: number) -> string` — `amount` 0..1, доля второго цвета
  - `relativeLuminance(hex: string) -> number` — 0..1 по WCAG 2.1
  - `contrastRatio(hexA: string, hexB: string) -> number` — 1..21

- [ ] **Шаг 1: Создать `design-system/mise.toml`**

```toml
[tools]
node = "20"
flutter = "3.41.9"
```

- [ ] **Шаг 2: Создать `design-system/package.json`**

Внешних зависимостей нет намеренно: пайплайн маленький, а `node:test` встроен в Node 20.

```json
{
  "name": "aurora-design-tokens",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "node --test test/",
    "build": "node tools/build.js"
  }
}
```

- [ ] **Шаг 3: Создать `design-system/.gitignore`**

```
build/
node_modules/
```

- [ ] **Шаг 4: Написать падающий тест**

Создать `design-system/test/color.test.js`:

```js
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
  assert.equal(mix('#F4F6FA', '#0066B8', 0.04), '#EAF0F7');
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
```

- [ ] **Шаг 5: Запустить тест и убедиться, что падает**

Выполнить: `npm test`
Ожидается: FAIL — `Cannot find module '../tools/color.js'`

- [ ] **Шаг 6: Реализовать `design-system/tools/color.js`**

```js
const HEX = /^#?([0-9a-fA-F]{6})$/;

export function parseHex(hex) {
  const m = HEX.exec(String(hex).trim());
  if (!m) throw new Error(`Некорректный hex: ${hex}`);
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function toHex({ r, g, b }) {
  const c = (v) => Math.round(Math.min(255, Math.max(0, v)))
    .toString(16).padStart(2, '0').toUpperCase();
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function mix(hexA, hexB, amount) {
  if (amount < 0 || amount > 1) throw new Error(`mix: amount вне 0..1: ${amount}`);
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  return toHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
}

export function relativeLuminance(hex) {
  const { r, g, b } = parseHex(hex);
  const ch = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function contrastRatio(hexA, hexB) {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Шаг 7: Запустить тест и убедиться, что проходит**

Выполнить: `npm test`
Ожидается: PASS, 10 тестов

- [ ] **Шаг 8: Закоммитить**

```bash
git add design-system/
git commit -m "feat(tokens): colour maths for the token pipeline"
```

---

### Task 2: Файлы токенов и разрешение ссылок

**Files:**
- Create: `design-system/tokens/primitive/scale.json`
- Create: `design-system/tokens/primitive/typography.json`
- Create: `design-system/tokens/primitive/motion.json`
- Create: `design-system/tokens/primitive/status.json`
- Create: `design-system/tokens/semantic/color.json`
- Create: `design-system/tokens/brands/aurora.json`
- Create: `design-system/tokens/brands/mts.json`
- Create: `design-system/tools/load.js`
- Create: `design-system/tools/resolve.js`
- Test: `design-system/test/resolve.test.js`

**Interfaces:**
- Consumes: `mix` из `tools/color.js`
- Produces:
  - `loadBrand(id: string) -> object` — содержимое `tokens/brands/<id>.json`
  - `listBrands() -> string[]` — идентификаторы брендов, отсортированные
  - `loadPrimitives() -> object` — слитые файлы из `tokens/primitive/`
  - `loadSemantic() -> object` — содержимое `tokens/semantic/color.json`
  - `resolveColors(brandId: string, theme: 'light'|'dark') -> Record<string, string>` — плоская карта `'surface.content' -> '#FFFFFF'`

Синтаксис ссылок в семантическом слое: `{color.neutral.0}`, `{color.brand.600}`, либо вызов `mix({color.neutral.50}, {color.brand.600}, 0.04)`. Сырые hex в семантическом слое запрещены — это проверяет Задача 3.

- [ ] **Шаг 1: Создать `design-system/tokens/primitive/scale.json`**

```json
{
  "space": { "0": 0, "2": 2, "4": 4, "8": 8, "12": 12, "16": 16, "20": 20, "24": 24, "32": 32, "40": 40, "48": 48 },
  "radius": { "sm": 4, "md": 8, "lg": 12, "xl": 16, "pill": 999 },
  "row": { "compact": 40, "default": 52, "double": 64 },
  "touchTarget": 44,
  "screenPadding": 16,
  "rowPadding": 14,
  "activeBarWidth": 2,
  "hairlineWidth": 1
}
```

- [ ] **Шаг 2: Создать `design-system/tokens/primitive/typography.json`**

Десять ролей из спека §6. `tabular: true` означает `tabular-nums`.

```json
{
  "fontFamily": { "sans": "Inter", "arabic": "Noto Sans Arabic" },
  "role": {
    "display":   { "size": 28, "lineHeight": 34, "weight": 600, "tracking": -0.015, "tabular": false },
    "title":     { "size": 20, "lineHeight": 26, "weight": 600, "tracking": -0.01,  "tabular": false },
    "section":   { "size": 15, "lineHeight": 20, "weight": 600, "tracking": 0,      "tabular": false },
    "body":      { "size": 15, "lineHeight": 22, "weight": 400, "tracking": 0,      "tabular": false },
    "label":     { "size": 13, "lineHeight": 18, "weight": 550, "tracking": 0,      "tabular": false },
    "caption":   { "size": 11, "lineHeight": 15, "weight": 400, "tracking": 0,      "tabular": false },
    "overline":  { "size": 9,  "lineHeight": 12, "weight": 700, "tracking": 0.08,   "tabular": false, "uppercase": true },
    "numberLg":  { "size": 20, "lineHeight": 24, "weight": 600, "tracking": 0,      "tabular": true },
    "numberMd":  { "size": 14, "lineHeight": 18, "weight": 600, "tracking": 0,      "tabular": true },
    "numberSm":  { "size": 11, "lineHeight": 14, "weight": 600, "tracking": 0,      "tabular": true }
  }
}
```

- [ ] **Шаг 3: Создать `design-system/tokens/primitive/motion.json`**

```json
{
  "duration": { "fast": 120, "base": 200, "slow": 320, "dataInterp": 500 },
  "curve": { "enter": "easeOutCubic", "exit": "easeInCubic" }
}
```

- [ ] **Шаг 4: Создать `design-system/tokens/primitive/status.json`**

Общие для всех брендов — см. спек §5.3.

```json
{
  "status": {
    "moving":  { "light": "#12A150", "dark": "#2BD47A" },
    "parked":  { "light": "#6E7480", "dark": "#9CA2AE" },
    "warning": { "light": "#B7791F", "dark": "#F0B429" },
    "alarm":   { "light": "#C7301F", "dark": "#F0554F" },
    "offline": { "light": "#C9CDD6", "dark": "#40444F" }
  }
}
```

- [ ] **Шаг 5: Создать `design-system/tokens/brands/aurora.json`**

Шкалы дословно из спека §5.1 и §5.2. `neutralHue` и `seed` хранятся как метаданные — они нужны, когда для нового бренда генерируется стартовая шкала, но сами шкалы авторские и правятся дизайнером.

```json
{
  "id": "aurora",
  "appName": "Aurora",
  "logo": "aurora.svg",
  "wordmark": "aurora-wordmark.svg",
  "baseUrl": "https://api.aurora-soft.by/",
  "defaultLocale": "en",
  "neutralHue": 232,
  "seed": "#0066B8",
  "color": {
    "neutral": {
      "0": "#FFFFFF", "50": "#F4F6FA", "100": "#EFF1F6", "200": "#E0E3EC",
      "300": "#C4C9D8", "400": "#949AB4", "500": "#666C85", "600": "#4A5069",
      "700": "#343A50", "800": "#292D42", "850": "#20243A", "900": "#191C2E",
      "950": "#141624", "1000": "#101220"
    },
    "brand": {
      "50": "#E8F2FB", "100": "#CBE3F6", "200": "#9BC9EC", "300": "#6BAEE0",
      "400": "#3E9BE0", "500": "#1478C6", "600": "#0066B8", "700": "#005493",
      "800": "#124272", "900": "#143253"
    }
  }
}
```

- [ ] **Шаг 6: Создать `design-system/tokens/brands/mts.json`**

```json
{
  "id": "mts",
  "appName": "MTS Automonitoring",
  "logo": "mts.svg",
  "wordmark": "mts-wordmark.svg",
  "baseUrl": "https://api.aurora.mts.by/",
  "defaultLocale": "ru",
  "neutralHue": 28,
  "seed": "#E30611",
  "color": {
    "neutral": {
      "0": "#FFFFFF", "50": "#F7F6F5", "100": "#F1EFED", "200": "#E6E3E1",
      "300": "#D2CDC9", "400": "#A09B97", "500": "#74706D", "600": "#565250",
      "700": "#3E3B39", "800": "#302D2B", "850": "#272423", "900": "#201E1D",
      "950": "#1B1A19", "1000": "#161514"
    },
    "brand": {
      "50": "#FDEAEA", "100": "#FACFD0", "200": "#F4A2A4", "300": "#EE7175",
      "400": "#FF4D52", "500": "#E30611", "600": "#D0050F", "700": "#A8040C",
      "800": "#7E0A10", "900": "#5A0C10"
    }
  }
}
```

- [ ] **Шаг 7: Создать `design-system/tokens/semantic/color.json`**

Четырнадцать ролей из спека §5.4 плюс пять карточных из §5.5.

```json
{
  "surface.content":   { "light": "{color.neutral.0}",   "dark": "{color.neutral.1000}" },
  "surface.chrome":    { "light": "{color.neutral.50}",  "dark": "{color.neutral.900}" },
  "surface.selected":  { "light": "mix({color.neutral.50}, {color.brand.600}, 0.04)", "dark": "{color.neutral.850}" },
  "surface.overlay":   { "light": "{color.neutral.0}",   "dark": "{color.neutral.900}" },
  "border.hairline":   { "light": "{color.neutral.100}", "dark": "{color.neutral.850}" },
  "border.strong":     { "light": "{color.neutral.200}", "dark": "{color.neutral.800}" },
  "text.primary":      { "light": "{color.neutral.950}", "dark": "{color.neutral.50}" },
  "text.secondary":    { "light": "{color.neutral.500}", "dark": "{color.neutral.400}" },
  "text.disabled":     { "light": "{color.neutral.300}", "dark": "{color.neutral.700}" },
  "text.onBrand":      { "light": "{color.neutral.0}",   "dark": "{color.neutral.1000}" },
  "action.primary":    { "light": "{color.brand.600}",   "dark": "{color.brand.400}" },
  "action.pressed":    { "light": "{color.brand.700}",   "dark": "{color.brand.500}" },
  "action.subtle":     { "light": "{color.brand.50}",    "dark": "{color.brand.900}" },
  "focus.indicator":   { "light": "{color.brand.600}",   "dark": "{color.brand.400}" },
  "status.moving":     { "light": "{status.moving.light}",  "dark": "{status.moving.dark}" },
  "status.parked":     { "light": "{status.parked.light}",  "dark": "{status.parked.dark}" },
  "status.warning":    { "light": "{status.warning.light}", "dark": "{status.warning.dark}" },
  "status.alarm":      { "light": "{status.alarm.light}",   "dark": "{status.alarm.dark}" },
  "status.offline":    { "light": "{status.offline.light}", "dark": "{status.offline.dark}" },
  "map.trackDefault":  { "light": "{color.brand.600}",   "dark": "{color.brand.400}" },
  "map.trackSpeeding": { "light": "{status.alarm.light}","dark": "{status.alarm.dark}" },
  "map.trackSelected": { "light": "{color.neutral.950}", "dark": "{color.neutral.50}" },
  "map.markerFill":    { "light": "{color.neutral.0}",   "dark": "{color.neutral.1000}" },
  "map.markerStroke":  { "light": "{color.neutral.950}", "dark": "{color.neutral.50}" }
}
```

- [ ] **Шаг 8: Написать падающий тест**

Создать `design-system/test/resolve.test.js`:

```js
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
  assert.equal(resolveColors('aurora', 'light')['surface.selected'], '#EAF0F7');
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
```

- [ ] **Шаг 9: Запустить тест и убедиться, что падает**

Выполнить: `npm test`
Ожидается: FAIL — `Cannot find module '../tools/load.js'`

- [ ] **Шаг 10: Реализовать `design-system/tools/load.js`**

```js
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

export function listBrands() {
  return readdirSync(path.join(root, 'tokens', 'brands'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

export function loadBrand(id) {
  return readJson(path.join(root, 'tokens', 'brands', `${id}.json`));
}

export function loadPrimitives() {
  const dir = path.join(root, 'tokens', 'primitive');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reduce((acc, f) => Object.assign(acc, readJson(path.join(dir, f))), {});
}

export function loadSemantic() {
  return readJson(path.join(root, 'tokens', 'semantic', 'color.json'));
}

export { root };
```

- [ ] **Шаг 11: Реализовать `design-system/tools/resolve.js`**

```js
import { mix } from './color.js';
import { loadBrand, loadPrimitives, loadSemantic } from './load.js';

const REF = /^\{([a-zA-Z0-9._]+)\}$/;
const MIX = /^mix\(\s*(\{[^}]+\})\s*,\s*(\{[^}]+\})\s*,\s*([0-9.]+)\s*\)$/;

function lookup(pathStr, scope, tokenName) {
  const value = pathStr.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
  if (typeof value !== 'string') {
    throw new Error(`Токен "${tokenName}": не найдена ссылка {${pathStr}}`);
  }
  return value;
}

function resolveValue(raw, scope, tokenName) {
  const m = MIX.exec(raw);
  if (m) {
    const a = resolveValue(m[1], scope, tokenName);
    const b = resolveValue(m[2], scope, tokenName);
    return mix(a, b, Number(m[3]));
  }
  const r = REF.exec(raw);
  if (r) return lookup(r[1], scope, tokenName);
  throw new Error(`Токен "${tokenName}": сырое значение "${raw}" в семантическом слое запрещено`);
}

export function resolveColors(brandId, theme, semanticOverride) {
  const brand = loadBrand(brandId);
  const primitives = loadPrimitives();
  const semantic = semanticOverride ?? loadSemantic();
  const scope = { color: brand.color, status: primitives.status };

  const out = {};
  for (const [name, byTheme] of Object.entries(semantic)) {
    const raw = byTheme[theme];
    if (raw === undefined) throw new Error(`Токен "${name}": нет варианта "${theme}"`);
    out[name] = resolveValue(raw, scope, name);
  }
  return out;
}
```

- [ ] **Шаг 12: Запустить тест и убедиться, что проходит**

Выполнить: `npm test`
Ожидается: PASS, 19 тестов суммарно

- [ ] **Шаг 13: Закоммитить**

```bash
git add design-system/
git commit -m "feat(tokens): token source and reference resolution"
```

---

### Task 3: Валидация — целостность и контраст

Это тот самый автоматический контроль контраста, который спек требует в §12. Он должен ловить проблему до того, как она разъедется по всем брендам.

**Files:**
- Create: `design-system/tools/validate.js`
- Test: `design-system/test/validate.test.js`

**Interfaces:**
- Consumes: `resolveColors` из `tools/resolve.js`, `contrastRatio` из `tools/color.js`, `listBrands` из `tools/load.js`
- Produces:
  - `CONTRAST_PAIRS: Array<{fg: string, bg: string, min: number, note: string}>` — обязательные пары
  - `validateReferences() -> string[]` — список ошибок, пустой при успехе
  - `validateContrast() -> string[]` — список ошибок, пустой при успехе
  - `validateAll() -> string[]` — объединение обоих

Порог: 4.5 для обычного текста, 3.0 для крупного (`display`, `title`, `numberLg`) и для неинтерактивной графики. `text.disabled` в проверку не входит — WCAG выводит недоступные элементы из-под требования.

- [ ] **Шаг 1: Написать падающий тест**

Создать `design-system/test/validate.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReferences, validateContrast, validateAll, CONTRAST_PAIRS } from '../tools/validate.js';

test('все ссылки разрешаются во всех брендах и темах', () => {
  assert.deepEqual(validateReferences(), []);
});

test('набор обязательных пар не пуст', () => {
  assert.ok(CONTRAST_PAIRS.length >= 8);
});

test('text.disabled не проверяется на контраст', () => {
  assert.equal(CONTRAST_PAIRS.some((p) => p.fg === 'text.disabled'), false);
});

test('контраст проходит AA во всех брендах и темах', () => {
  const errors = validateContrast();
  assert.deepEqual(errors, [], `Провалы контраста:\n${errors.join('\n')}`);
});

test('validateAll объединяет обе проверки', () => {
  assert.deepEqual(validateAll(), []);
});
```

- [ ] **Шаг 2: Запустить тест и убедиться, что падает**

Выполнить: `npm test`
Ожидается: FAIL — `Cannot find module '../tools/validate.js'`

- [ ] **Шаг 3: Реализовать `design-system/tools/validate.js`**

```js
import { contrastRatio } from './color.js';
import { listBrands } from './load.js';
import { resolveColors } from './resolve.js';

const THEMES = ['light', 'dark'];

export const CONTRAST_PAIRS = [
  { fg: 'text.primary',   bg: 'surface.content', min: 4.5, note: 'основной текст на контенте' },
  { fg: 'text.primary',   bg: 'surface.chrome',  min: 4.5, note: 'основной текст на хроме' },
  { fg: 'text.secondary', bg: 'surface.content', min: 4.5, note: 'вторичный текст на контенте' },
  { fg: 'text.secondary', bg: 'surface.chrome',  min: 4.5, note: 'вторичный текст на хроме' },
  { fg: 'text.onBrand',   bg: 'action.primary',  min: 4.5, note: 'подпись кнопки' },
  { fg: 'action.primary', bg: 'surface.content', min: 3.0, note: 'ссылка и полоса активного' },
  { fg: 'status.moving',  bg: 'surface.content', min: 3.0, note: 'статусная точка' },
  { fg: 'status.warning', bg: 'surface.content', min: 3.0, note: 'статусная точка' },
  { fg: 'status.alarm',   bg: 'surface.content', min: 3.0, note: 'статусная точка' },
  { fg: 'map.trackDefault',  bg: 'surface.content', min: 3.0, note: 'трек на светлой подложке' },
  { fg: 'map.trackSelected', bg: 'surface.content', min: 3.0, note: 'выбранный трек' },
  { fg: 'border.strong',  bg: 'surface.content', min: 1.2, note: 'граница секции различима' },
];

export function validateReferences() {
  const errors = [];
  for (const brand of listBrands()) {
    for (const theme of THEMES) {
      try {
        resolveColors(brand, theme);
      } catch (e) {
        errors.push(`${brand}/${theme}: ${e.message}`);
      }
    }
  }
  return errors;
}

export function validateContrast() {
  const errors = [];
  for (const brand of listBrands()) {
    for (const theme of THEMES) {
      let colors;
      try {
        colors = resolveColors(brand, theme);
      } catch {
        continue; // о таком уже сообщил validateReferences
      }
      for (const { fg, bg, min, note } of CONTRAST_PAIRS) {
        const ratio = contrastRatio(colors[fg], colors[bg]);
        if (ratio < min) {
          errors.push(
            `${brand}/${theme}: ${fg} (${colors[fg]}) на ${bg} (${colors[bg]}) = ` +
            `${ratio.toFixed(2)}, нужно ${min} — ${note}`
          );
        }
      }
    }
  }
  return errors;
}

export function validateAll() {
  return [...validateReferences(), ...validateContrast()];
}
```

- [ ] **Шаг 4: Запустить тест**

Выполнить: `npm test`

Ожидается один из двух исходов:

- **PASS** — шкалы из спека проходят AA, идём дальше.
- **FAIL со списком конкретных пар** — это ожидаемый и полезный результат. Сообщение показывает бренд, тему, оба hex и фактическое отношение.

**Если упало: правится токен, а не порог.** Порядок действий: взять провалившуюся пару, подвинуть ступень шкалы в `tokens/brands/<brand>.json` на одну-две позиции темнее или светлее, перезапустить. Понижать `min` или удалять пару из `CONTRAST_PAIRS` нельзя — это ровно тот компромисс, ради предотвращения которого проверка и написана. Каждое изменение hex записать в спек §5.1/§5.2, чтобы документ и код не разъехались.

- [ ] **Шаг 5: Закоммитить**

```bash
git add design-system/
git commit -m "feat(tokens): reference and WCAG AA contrast validation"
```

---

### Task 4: Сторож брендовой чётности

Правило «бренд меняет ровно четыре вещи» ничего не стоит записать и очень легко нарушить через полгода. Этот тест делает нарушение видимым сразу.

**Files:**
- Create: `design-system/tools/parity.js`
- Test: `design-system/test/parity.test.js`

**Interfaces:**
- Consumes: `listBrands`, `loadBrand` из `tools/load.js`
- Produces:
  - `BRAND_ALLOWED_KEYS: string[]` — ключи, которым разрешено различаться
  - `checkBrandParity() -> string[]` — список нарушений, пустой при успехе

- [ ] **Шаг 1: Написать падающий тест**

Создать `design-system/test/parity.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBrandParity, BRAND_ALLOWED_KEYS } from '../tools/parity.js';
import { resolveColors } from '../tools/resolve.js';

test('бренды различаются только разрешёнными ключами', () => {
  const violations = checkBrandParity();
  assert.deepEqual(violations, [], `Нарушения:\n${violations.join('\n')}`);
});

test('разрешено ровно четыре визуальных оси', () => {
  assert.deepEqual([...BRAND_ALLOWED_KEYS].sort(), ['color', 'logo', 'wordmark'].sort());
});

test('статусные токены совпадают побайтно во всех брендах', () => {
  const statusKeys = ['status.moving', 'status.parked', 'status.warning', 'status.alarm', 'status.offline'];
  for (const theme of ['light', 'dark']) {
    const a = resolveColors('aurora', theme);
    const m = resolveColors('mts', theme);
    for (const k of statusKeys) {
      assert.equal(a[k], m[k], `${k} в теме ${theme} разошёлся между брендами`);
    }
  }
});
```

Примечание к второму тесту: визуальных осей четыре — шкала `brand`, шкала `neutral`, `logo`, `wordmark` — но первые две живут внутри одного ключа `color`, поэтому в списке ключей их три.

- [ ] **Шаг 2: Запустить тест и убедиться, что падает**

Выполнить: `npm test`
Ожидается: FAIL — `Cannot find module '../tools/parity.js'`

- [ ] **Шаг 3: Реализовать `design-system/tools/parity.js`**

```js
import { listBrands, loadBrand } from './load.js';

/** Ключи бренд-файла, которым разрешено различаться визуально. */
export const BRAND_ALLOWED_KEYS = ['color', 'logo', 'wordmark'];

/** Ключи, различие которых визуально нейтрально (метаданные и конфигурация). */
const METADATA_KEYS = ['id', 'appName', 'baseUrl', 'defaultLocale', 'neutralHue', 'seed'];

export function checkBrandParity() {
  const brands = listBrands();
  const violations = [];
  const known = new Set([...BRAND_ALLOWED_KEYS, ...METADATA_KEYS]);

  for (const id of brands) {
    const brand = loadBrand(id);

    for (const key of Object.keys(brand)) {
      if (!known.has(key)) {
        violations.push(
          `${id}: ключ "${key}" не входит в разрешённый набор. ` +
          `Бренд меняет только ${BRAND_ALLOWED_KEYS.join(', ')} и метаданные.`
        );
      }
    }

    const scales = Object.keys(brand.color ?? {}).sort();
    if (scales.join(',') !== 'brand,neutral') {
      violations.push(`${id}: color содержит шкалы [${scales}], ожидались brand и neutral`);
    }
  }

  // Шкалы должны иметь одинаковый набор ступеней во всех брендах.
  const [first, ...rest] = brands;
  const reference = loadBrand(first);
  for (const id of rest) {
    const brand = loadBrand(id);
    for (const scale of ['neutral', 'brand']) {
      const a = Object.keys(reference.color[scale]).sort().join(',');
      const b = Object.keys(brand.color[scale]).sort().join(',');
      if (a !== b) {
        violations.push(`${id}: ступени шкалы "${scale}" не совпадают с ${first}`);
      }
    }
  }

  return violations;
}
```

- [ ] **Шаг 4: Запустить тест и убедиться, что проходит**

Выполнить: `npm test`
Ожидается: PASS

- [ ] **Шаг 5: Закоммитить**

```bash
git add design-system/
git commit -m "feat(tokens): brand parity guard"
```

---

### Task 5: Генератор Dart

**Files:**
- Create: `design-system/tools/generate-dart.js`
- Test: `design-system/test/generate-dart.test.js`

**Interfaces:**
- Consumes: `resolveColors`, `listBrands`, `loadBrand`, `loadPrimitives`
- Produces:
  - `camelize(dotted: string) -> string` — `'surface.content'` → `'surfaceContent'`
  - `dartColor(hex: string) -> string` — `'#0066B8'` → `'Color(0xFF0066B8)'`
  - `dartWeight(weight: number) -> string` — `550` → `'FontWeight.w600'`
  - `generateDart() -> string` — полное содержимое `tokens.g.dart`
  - `writeDart() -> void` — пишет результат в `aurora_design_system/lib/src/tokens/tokens.g.dart`

Имена в сгенерированном Dart, на которые опирается Задача 6:
`AuroraColorTokens` (класс со всеми цветовыми полями), `AuroraBrand` (enum: `aurora`, `mts`),
`auroraColorTokens(AuroraBrand brand, Brightness brightness) -> AuroraColorTokens`,
`AuroraDimensions` (отступы, радиусы, высоты строк), `AuroraMotionTokens` (длительности и кривые),
`AuroraTypographyTokens` (десять готовых `TextStyle`).

**Типографика генерируется, а не пишется руками.** Иначе `weight: 550` в JSON и
`FontWeight.w600` в Dart разъедутся молча. Веса округляются к ближайшей сотне —
у Flutter `FontWeight` идёт шагом 100, и 550 в статичном Inter непредставим.

- [ ] **Шаг 1: Написать падающий тест**

Создать `design-system/test/generate-dart.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { camelize, dartColor, generateDart } from '../tools/generate-dart.js';

test('camelize превращает точечное имя в camelCase', () => {
  assert.equal(camelize('surface.content'), 'surfaceContent');
  assert.equal(camelize('map.trackSpeeding'), 'mapTrackSpeeding');
  assert.equal(camelize('text.onBrand'), 'textOnBrand');
});

test('dartColor даёт литерал Color с непрозрачной альфой', () => {
  assert.equal(dartColor('#0066B8'), 'Color(0xFF0066B8)');
});

const dart = generateDart();

test('файл помечен как сгенерированный', () => {
  assert.match(dart, /GENERATED/);
  assert.match(dart, /npm run build/);
});

test('объявлен enum брендов', () => {
  assert.match(dart, /enum AuroraBrand \{ aurora, mts \}/);
});

test('есть по константе на каждую пару бренд × тема', () => {
  for (const name of ['_auroraLight', '_auroraDark', '_mtsLight', '_mtsDark']) {
    assert.match(dart, new RegExp(`const AuroraColorTokens ${name} =`));
  }
});

test('цвета попали в вывод', () => {
  assert.match(dart, /surfaceContent: Color\(0xFFFFFFFF\)/);
  assert.match(dart, /actionPrimary: Color\(0xFF0066B8\)/);
  assert.match(dart, /actionPrimary: Color\(0xFFD0050F\)/);
});

test('размеры и движение вынесены отдельно и не зависят от бренда', () => {
  assert.match(dart, /class AuroraDimensions/);
  assert.match(dart, /static const double radiusLg = 12/);
  assert.match(dart, /static const double rowDefault = 52/);
  assert.match(dart, /static const int durationBase = 200/);
});

test('кривые движения попали в вывод', () => {
  assert.match(dart, /static const Curve curveEnter = Curves\.easeOutCubic;/);
  assert.match(dart, /static const Curve curveExit = Curves\.easeInCubic;/);
});

test('типографика сгенерирована, а не написана руками', () => {
  assert.match(dart, /class AuroraTypographyTokens/);
  assert.match(dart, /static const TextStyle body = TextStyle\(/);
  assert.match(dart, /static const TextStyle numberMd = TextStyle\(/);
});

test('вес 550 округляется к представимому во Flutter', () => {
  const label = /static const TextStyle label = TextStyle\(([^)]*)\)/.exec(dart)[1];
  assert.match(label, /fontWeight: FontWeight\.w600/);
});

test('табличные цифры только у числовых ролей', () => {
  const numberMd = /static const TextStyle numberMd = TextStyle\(([^;]*?)\);/s.exec(dart)[1];
  const body = /static const TextStyle body = TextStyle\(([^;]*?)\);/s.exec(dart)[1];
  assert.match(numberMd, /FontFeature\.tabularFigures\(\)/);
  assert.equal(/FontFeature/.test(body), false);
});

test('генерация детерминирована', () => {
  assert.equal(generateDart(), dart);
});
```

- [ ] **Шаг 2: Запустить тест и убедиться, что падает**

Выполнить: `npm test`
Ожидается: FAIL — `Cannot find module '../tools/generate-dart.js'`

- [ ] **Шаг 3: Реализовать `design-system/tools/generate-dart.js`**

```js
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { listBrands, loadPrimitives, loadSemantic, root } from './load.js';
import { resolveColors } from './resolve.js';

export function camelize(dotted) {
  return dotted
    .split('.')
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('');
}

export function dartColor(hex) {
  return `Color(0xFF${hex.replace('#', '').toUpperCase()})`;
}

/**
 * У Flutter FontWeight идёт шагом 100, поэтому 550 из спека непредставим
 * в статичном Inter и округляется к ближайшей сотне — до w600.
 */
export function dartWeight(weight) {
  return `FontWeight.w${Math.round(weight / 100) * 100}`;
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

export function generateDart() {
  const brands = listBrands();
  const primitives = loadPrimitives();
  const fields = Object.keys(loadSemantic()).map(camelize);

  const lines = [];
  lines.push('// GENERATED — не редактировать руками.');
  lines.push('// Источник: design-system/tokens/. Пересобрать: npm run build');
  lines.push('');
  lines.push("import 'dart:ui' show Brightness, Color, FontFeature, FontWeight;");
  lines.push("import 'package:flutter/animation.dart' show Curve, Curves;");
  lines.push("import 'package:flutter/painting.dart' show TextStyle;");
  lines.push('');
  lines.push(`enum AuroraBrand { ${brands.join(', ')} }`);
  lines.push('');

  // Класс цветовых токенов
  lines.push('class AuroraColorTokens {');
  for (const f of fields) lines.push(`  final Color ${f};`);
  lines.push('');
  lines.push('  const AuroraColorTokens({');
  for (const f of fields) lines.push(`    required this.${f},`);
  lines.push('  });');
  lines.push('}');
  lines.push('');

  // Константы на каждую пару бренд × тема
  const constNames = {};
  for (const brand of brands) {
    for (const theme of ['light', 'dark']) {
      const colors = resolveColors(brand, theme);
      const name = `_${brand}${capitalize(theme)}`;
      constNames[`${brand}.${theme}`] = name;
      lines.push(`const AuroraColorTokens ${name} = AuroraColorTokens(`);
      for (const [token, hex] of Object.entries(colors)) {
        lines.push(`  ${camelize(token)}: ${dartColor(hex)},`);
      }
      lines.push(');');
      lines.push('');
    }
  }

  // Функция выбора
  lines.push('AuroraColorTokens auroraColorTokens(AuroraBrand brand, Brightness brightness) {');
  lines.push('  final isDark = brightness == Brightness.dark;');
  lines.push('  switch (brand) {');
  for (const brand of brands) {
    lines.push(`    case AuroraBrand.${brand}:`);
    lines.push(`      return isDark ? ${constNames[`${brand}.dark`]} : ${constNames[`${brand}.light`]};`);
  }
  lines.push('  }');
  lines.push('}');
  lines.push('');

  // Размеры — общие для всех брендов
  lines.push('class AuroraDimensions {');
  lines.push('  const AuroraDimensions._();');
  for (const [k, v] of Object.entries(primitives.space)) {
    lines.push(`  static const double space${k} = ${v};`);
  }
  for (const [k, v] of Object.entries(primitives.radius)) {
    lines.push(`  static const double radius${capitalize(k)} = ${v};`);
  }
  for (const [k, v] of Object.entries(primitives.row)) {
    lines.push(`  static const double row${capitalize(k)} = ${v};`);
  }
  lines.push(`  static const double touchTarget = ${primitives.touchTarget};`);
  lines.push(`  static const double screenPadding = ${primitives.screenPadding};`);
  lines.push(`  static const double rowPadding = ${primitives.rowPadding};`);
  lines.push(`  static const double activeBarWidth = ${primitives.activeBarWidth};`);
  lines.push(`  static const double hairlineWidth = ${primitives.hairlineWidth};`);
  lines.push('}');
  lines.push('');

  // Движение
  lines.push('class AuroraMotionTokens {');
  lines.push('  const AuroraMotionTokens._();');
  for (const [k, v] of Object.entries(primitives.duration)) {
    lines.push(`  static const int duration${capitalize(k)} = ${v};`);
  }
  for (const [k, v] of Object.entries(primitives.curve)) {
    lines.push(`  static const Curve curve${capitalize(k)} = Curves.${v};`);
  }
  lines.push('}');
  lines.push('');

  // Типографика. Генерируется, чтобы JSON и Dart не разъехались.
  lines.push('class AuroraTypographyTokens {');
  lines.push('  const AuroraTypographyTokens._();');
  lines.push(`  static const String fontFamilySans = '${primitives.fontFamily.sans}';`);
  lines.push(`  static const String fontFamilyArabic = '${primitives.fontFamily.arabic}';`);
  for (const [name, r] of Object.entries(primitives.role)) {
    lines.push(`  static const TextStyle ${name} = TextStyle(`);
    lines.push(`    fontFamily: fontFamilySans,`);
    lines.push(`    fontSize: ${r.size},`);
    lines.push(`    height: ${(r.lineHeight / r.size).toFixed(4)},`);
    lines.push(`    fontWeight: ${dartWeight(r.weight)},`);
    lines.push(`    letterSpacing: ${(r.tracking * r.size).toFixed(4)},`);
    if (r.tabular) {
      lines.push(`    fontFeatures: <FontFeature>[FontFeature.tabularFigures()],`);
    }
    lines.push('  );');
  }
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

export function writeDart() {
  const out = path.join(root, 'aurora_design_system', 'lib', 'src', 'tokens', 'tokens.g.dart');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, generateDart(), 'utf8');
  return out;
}
```

- [ ] **Шаг 4: Запустить тест и убедиться, что проходит**

Выполнить: `npm test`
Ожидается: PASS

- [ ] **Шаг 5: Закоммитить**

```bash
git add design-system/
git commit -m "feat(tokens): Dart token generator"
```

---

### Task 6: Flutter-пакет и AuroraTheme

**Files:**
- Create: `design-system/aurora_design_system/pubspec.yaml`
- Create: `design-system/aurora_design_system/analysis_options.yaml`
- Create: `design-system/aurora_design_system/lib/aurora_design_system.dart`
- Create: `design-system/aurora_design_system/lib/src/theme/aurora_theme.dart`
- Generated: `design-system/aurora_design_system/lib/src/tokens/tokens.g.dart`
- Test: `design-system/aurora_design_system/test/aurora_theme_test.dart`

**Interfaces:**
- Consumes: `AuroraBrand`, `AuroraColorTokens`, `auroraColorTokens`, `AuroraDimensions`, `AuroraMotionTokens` из `tokens.g.dart`
- Produces:
  - `AuroraTheme extends ThemeExtension<AuroraTheme>` с полями `brand`, `colors`, `typography`
  - `AuroraTheme.of(BuildContext) -> AuroraTheme`
  - `auroraThemeData(AuroraBrand brand, Brightness brightness) -> ThemeData`
  - `AuroraTypography` с полями `display`, `title`, `section`, `body`, `label`, `caption`, `overline`, `numberLg`, `numberMd`, `numberSm` типа `TextStyle`

- [ ] **Шаг 1: Сгенерировать Dart-токены**

Выполнить из `design-system/`:

```bash
node -e "import('./tools/generate-dart.js').then(m => console.log('Записан:', m.writeDart()))"
```

Ожидается: `Записан: .../aurora_design_system/lib/src/tokens/tokens.g.dart`

- [ ] **Шаг 2: Создать `design-system/aurora_design_system/pubspec.yaml`**

```yaml
name: aurora_design_system
description: Дизайн-система Aurora — токены, темы и компоненты.
version: 0.1.0
publish_to: none

environment:
  sdk: ">=3.11.0 <4.0.0"
  flutter: ">=3.41.0"

dependencies:
  flutter:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^6.0.0

flutter:
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
          weight: 400
        - asset: assets/fonts/Inter-Medium.ttf
          weight: 500
        - asset: assets/fonts/Inter-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700
```

Файлы шрифтов кладутся в `aurora_design_system/assets/fonts/`. Начертание 550 из спека получается из веса 500 через `fontVariations` переменного Inter либо округляется до 600 в статичном — решение принимает дизайнер при передаче шрифтов, до тех пор `label` использует 600.

- [ ] **Шаг 3: Создать `design-system/aurora_design_system/analysis_options.yaml`**

```yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - prefer_const_constructors
    - prefer_final_fields
```

- [ ] **Шаг 4: Написать падающий тест**

Создать `design-system/aurora_design_system/test/aurora_theme_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';

void main() {
  test('Aurora светлая берёт белый контент и синее действие', () {
    final t = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light);
    expect(t.colors.surfaceContent, const Color(0xFFFFFFFF));
    expect(t.colors.actionPrimary, const Color(0xFF0066B8));
  });

  test('Aurora тёмная берёт индиговый контент', () {
    final t = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.dark);
    expect(t.colors.surfaceContent, const Color(0xFF101220));
    expect(t.colors.actionPrimary, const Color(0xFF3E9BE0));
  });

  test('МТС берёт свою шкалу', () {
    final t = AuroraTheme.forBrand(AuroraBrand.mts, Brightness.light);
    expect(t.colors.actionPrimary, const Color(0xFFD0050F));
    expect(t.colors.surfaceChrome, const Color(0xFFF7F6F5));
  });

  test('статусы одинаковы у обоих брендов', () {
    final a = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light);
    final m = AuroraTheme.forBrand(AuroraBrand.mts, Brightness.light);
    expect(a.colors.statusAlarm, m.colors.statusAlarm);
    expect(a.colors.statusMoving, m.colors.statusMoving);
  });

  test('числовые роли включают табличные цифры', () {
    final t = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light);
    expect(t.typography.numberMd.fontFeatures, contains(const FontFeature.tabularFigures()));
    expect(t.typography.body.fontFeatures ?? const [], isNot(contains(const FontFeature.tabularFigures())));
  });

  test('lerp возвращает валидную тему на границах', () {
    final a = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light);
    final b = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.dark);
    expect(a.lerp(b, 0).colors.surfaceContent, a.colors.surfaceContent);
    expect(a.lerp(b, 1).colors.surfaceContent, b.colors.surfaceContent);
  });

  testWidgets('AuroraTheme.of достаёт тему из контекста', (tester) async {
    late AuroraTheme found;
    await tester.pumpWidget(MaterialApp(
      theme: auroraThemeData(AuroraBrand.mts, Brightness.light),
      home: Builder(builder: (context) {
        found = AuroraTheme.of(context);
        return const SizedBox();
      }),
    ));
    expect(found.brand, AuroraBrand.mts);
    expect(found.colors.actionPrimary, const Color(0xFFD0050F));
  });

  testWidgets('в ThemeData нет теней', (tester) async {
    final data = auroraThemeData(AuroraBrand.aurora, Brightness.light);
    expect(data.cardTheme.elevation, 0);
    expect(data.appBarTheme.elevation, 0);
    expect(data.appBarTheme.scrolledUnderElevation, 0);
  });
}
```

- [ ] **Шаг 5: Запустить тест и убедиться, что падает**

Выполнить из `design-system/aurora_design_system/`:

```bash
flutter pub get
flutter test
```

Ожидается: FAIL — `Target of URI doesn't exist: 'package:aurora_design_system/aurora_design_system.dart'`

- [ ] **Шаг 6: Создать `design-system/aurora_design_system/lib/src/theme/aurora_theme.dart`**

```dart
import 'package:flutter/material.dart';

import '../tokens/tokens.g.dart';

export '../tokens/tokens.g.dart'
    show AuroraBrand, AuroraColorTokens, AuroraDimensions, AuroraMotionTokens, AuroraTypographyTokens;

/// Типографические роли из спека §6. Моноширинного шрифта нет:
/// числовые роли — тот же Inter с табличными цифрами.
@immutable
class AuroraTypography {
  final TextStyle display;
  final TextStyle title;
  final TextStyle section;
  final TextStyle body;
  final TextStyle label;
  final TextStyle caption;
  final TextStyle overline;
  final TextStyle numberLg;
  final TextStyle numberMd;
  final TextStyle numberSm;

  const AuroraTypography({
    required this.display,
    required this.title,
    required this.section,
    required this.body,
    required this.label,
    required this.caption,
    required this.overline,
    required this.numberLg,
    required this.numberMd,
    required this.numberSm,
  });

  /// Значения приходят из сгенерированного `tokens.g.dart`. Руками здесь
  /// ничего не задаётся: иначе шкала в JSON и шкала в коде разъедутся.
  ///
  /// Роль `overline` в спеке набирается капителью, но у Flutter нет
  /// text-transform — верхний регистр применяет компонент
  /// (`Text(value.toUpperCase())`), а не токен.
  const AuroraTypography.standard()
      : display = AuroraTypographyTokens.display,
        title = AuroraTypographyTokens.title,
        section = AuroraTypographyTokens.section,
        body = AuroraTypographyTokens.body,
        label = AuroraTypographyTokens.label,
        caption = AuroraTypographyTokens.caption,
        overline = AuroraTypographyTokens.overline,
        numberLg = AuroraTypographyTokens.numberLg,
        numberMd = AuroraTypographyTokens.numberMd,
        numberSm = AuroraTypographyTokens.numberSm;
}

@immutable
class AuroraTheme extends ThemeExtension<AuroraTheme> {
  final AuroraBrand brand;
  final AuroraColorTokens colors;
  final AuroraTypography typography;

  const AuroraTheme({
    required this.brand,
    required this.colors,
    required this.typography,
  });

  factory AuroraTheme.forBrand(AuroraBrand brand, Brightness brightness) => AuroraTheme(
        brand: brand,
        colors: auroraColorTokens(brand, brightness),
        typography: const AuroraTypography.standard(),
      );

  static AuroraTheme of(BuildContext context) {
    final ext = Theme.of(context).extension<AuroraTheme>();
    assert(ext != null, 'AuroraTheme не найдена. Используйте auroraThemeData() при сборке ThemeData.');
    return ext!;
  }

  @override
  AuroraTheme copyWith({
    AuroraBrand? brand,
    AuroraColorTokens? colors,
    AuroraTypography? typography,
  }) =>
      AuroraTheme(
        brand: brand ?? this.brand,
        colors: colors ?? this.colors,
        typography: typography ?? this.typography,
      );

  /// Токены дискретны: на середине переход считается завершённым.
  /// Плавно анимировать смену бренда или темы система не обещает.
  @override
  AuroraTheme lerp(ThemeExtension<AuroraTheme>? other, double t) {
    if (other is! AuroraTheme) return this;
    return t < 0.5 ? this : other;
  }
}

/// Собирает [ThemeData] так, чтобы Material-компоненты подчинялись токенам.
/// Теней нет нигде — это принцип системы, а не настройка.
ThemeData auroraThemeData(AuroraBrand brand, Brightness brightness) {
  final aurora = AuroraTheme.forBrand(brand, brightness);
  final c = aurora.colors;

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    fontFamily: 'Inter',
    scaffoldBackgroundColor: c.surfaceContent,
    colorScheme: ColorScheme(
      brightness: brightness,
      primary: c.actionPrimary,
      onPrimary: c.textOnBrand,
      secondary: c.actionSubtle,
      onSecondary: c.textPrimary,
      surface: c.surfaceContent,
      onSurface: c.textPrimary,
      error: c.statusAlarm,
      onError: c.textOnBrand,
    ),
    dividerTheme: DividerThemeData(
      color: c.borderHairline,
      thickness: AuroraDimensions.hairlineWidth,
      space: AuroraDimensions.hairlineWidth,
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: c.surfaceContent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AuroraDimensions.radiusLg),
        side: BorderSide(color: c.borderStrong, width: AuroraDimensions.hairlineWidth),
      ),
    ),
    appBarTheme: AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: c.surfaceContent,
      foregroundColor: c.textPrimary,
    ),
    extensions: <ThemeExtension<dynamic>>[aurora],
  );
}
```

- [ ] **Шаг 7: Создать `design-system/aurora_design_system/lib/aurora_design_system.dart`**

```dart
/// Дизайн-система Aurora.
///
/// Токены генерируются из `design-system/tokens/`. Не редактируйте
/// `src/tokens/tokens.g.dart` руками — правьте JSON и запускайте `npm run build`.
library aurora_design_system;

export 'src/theme/aurora_theme.dart';
```

- [ ] **Шаг 8: Запустить тест и убедиться, что проходит**

Выполнить из `design-system/aurora_design_system/`:

```bash
flutter test
```

Ожидается: PASS, 8 тестов

- [ ] **Шаг 9: Закоммитить**

```bash
git add design-system/
git commit -m "feat(design-system): Flutter package with AuroraTheme"
```

---

### Task 7: Генератор Figma и сборка

**Files:**
- Create: `design-system/tools/generate-figma.js`
- Create: `design-system/tools/build.js`
- Create: `design-system/README.md`
- Test: `design-system/test/generate-figma.test.js`

**Interfaces:**
- Consumes: `resolveColors`, `listBrands`, `loadPrimitives`, `validateAll`, `checkBrandParity`, `writeDart`
- Produces:
  - `generateFigma() -> object` — структура переменных Figma
  - `writeFigma() -> string` — путь к записанному `build/figma-variables.json`

Формат вывода — коллекции с модами. Коллекция `semantic` имеет по моду на каждую пару бренд × тема (`aurora/light`, `aurora/dark`, `mts/light`, `mts/dark`). Коллекция `dimension` мода не имеет: размеры едины.

- [ ] **Шаг 1: Написать падающий тест**

Создать `design-system/test/generate-figma.test.js`:

```js
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
```

- [ ] **Шаг 2: Запустить тест и убедиться, что падает**

Выполнить: `npm test`
Ожидается: FAIL — `Cannot find module '../tools/generate-figma.js'`

- [ ] **Шаг 3: Реализовать `design-system/tools/generate-figma.js`**

```js
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { listBrands, loadPrimitives, loadSemantic, root } from './load.js';
import { resolveColors } from './resolve.js';

export function generateFigma() {
  const brands = listBrands();
  const themes = ['light', 'dark'];
  const modes = brands.flatMap((b) => themes.map((t) => `${b}/${t}`));

  const semanticVars = {};
  for (const name of Object.keys(loadSemantic())) semanticVars[name] = {};
  for (const brand of brands) {
    for (const theme of themes) {
      const colors = resolveColors(brand, theme);
      for (const [name, hex] of Object.entries(colors)) {
        semanticVars[name][`${brand}/${theme}`] = hex;
      }
    }
  }

  const p = loadPrimitives();
  const dimensionVars = {};
  for (const [k, v] of Object.entries(p.space)) dimensionVars[`space.${k}`] = v;
  for (const [k, v] of Object.entries(p.radius)) dimensionVars[`radius.${k}`] = v;
  for (const [k, v] of Object.entries(p.row)) dimensionVars[`row.${k}`] = v;
  dimensionVars['touchTarget'] = p.touchTarget;
  dimensionVars['screenPadding'] = p.screenPadding;
  dimensionVars['rowPadding'] = p.rowPadding;
  dimensionVars['activeBarWidth'] = p.activeBarWidth;
  dimensionVars['hairlineWidth'] = p.hairlineWidth;

  return {
    $meta: {
      generatedBy: 'design-system/tools/generate-figma.js',
      direction: 'JSON → Figma. Обратный импорт не поддерживается намеренно.',
    },
    collections: {
      semantic: { modes, variables: semanticVars },
      dimension: { modes: [], variables: dimensionVars },
    },
  };
}

export function writeFigma() {
  const out = path.join(root, 'build', 'figma-variables.json');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(generateFigma(), null, 2)}\n`, 'utf8');
  return out;
}
```

- [ ] **Шаг 4: Реализовать `design-system/tools/build.js`**

Сборка сначала валидирует и падает при ошибке — иначе битые токены доедут до Dart и Figma.

```js
import { validateAll } from './validate.js';
import { checkBrandParity } from './parity.js';
import { writeDart } from './generate-dart.js';
import { writeFigma } from './generate-figma.js';

const problems = [...validateAll(), ...checkBrandParity()];

if (problems.length > 0) {
  console.error('Сборка остановлена, токены не прошли проверку:\n');
  for (const p of problems) console.error(`  • ${p}`);
  console.error('\nПравьте токены, а не пороги проверок.');
  process.exit(1);
}

console.log('Записан:', writeDart());
console.log('Записан:', writeFigma());
```

- [ ] **Шаг 5: Запустить тесты и сборку**

Выполнить: `npm test`
Ожидается: PASS

Выполнить: `npm run build`
Ожидается: два сообщения `Записан:` — `tokens.g.dart` и `build/figma-variables.json`

- [ ] **Шаг 6: Создать `design-system/README.md`**

```markdown
# Дизайн-система Aurora — токены

Источник истины: `tokens/`. Всё остальное генерируется.

## Команды

    npm test        проверки: ссылки, контраст WCAG AA, брендовая чётность
    npm run build   валидация, затем генерация Dart и Figma

Flutter-пакет:

    cd aurora_design_system && flutter test

## Как что-то поменять

Цвет, отступ, радиус — правится в `tokens/`, затем `npm run build`.
`aurora_design_system/lib/src/tokens/tokens.g.dart` руками не редактируется.

## Как добавить бренд

Скопировать `tokens/brands/aurora.json`, поменять `id`, метаданные и две
шкалы цвета. Больше ничего: радиусы, отступы, типографика, движение и
статусные цвета едины для всех брендов, и `npm test` это стережёт.

## Куда идёт Figma

`build/figma-variables.json` импортируется в Figma. Направление
синхронизации одностороннее: JSON → Figma. Правки цветов внутри Figma
теряются при следующей сборке — это сделано намеренно.

## Спек

`docs/superpowers/specs/2026-09-08-aurora-design-system-design.md`
```

- [ ] **Шаг 7: Закоммитить**

```bash
git add design-system/
git commit -m "feat(tokens): Figma generator, build script and README"
```

---

## Что остаётся за рамками этого плана

- **Figma-библиотека** — работа дизайнера. Начинается после Задачи 7: `build/figma-variables.json` импортируется, дальше рисуются компоненты.
- **Базовые компоненты** (спек §9.1) — отдельный план, после того как дизайнер отрисует их в Figma.
- **Доменные компоненты** (спек §9.2) — отдельный план, самая содержательная часть.
- **Шрифты.** `pubspec.yaml` объявляет Inter, но сами `.ttf` в репозиторий должен положить дизайнер вместе с решением про начертание 550 (переменный Inter или округление до 600).
- **Проверки из спека §12,** которые нельзя автоматизировать: покрытие глифов Inter для белорусского, украинского и греческого; стыковка с Noto Sans Arabic; читаемость трека на спутниковой подложке. Контраст автоматизирован в Задаче 3.
- **Бренд Irissoft.** Спек называет его третьим брендом, но палитры для него не
  задаёт. Файл `tokens/brands/irissoft.json` заводится, когда дизайнер выдаст
  две шкалы; сторож чётности из Задачи 4 подхватит его автоматически.
- **`baseUrl`, `defaultLocale`, `appName` не попадают в Dart-пакет.** Они лежат
  в бренд-файле, потому что это часть описания бренда, но дизайн-система не
  должна знать про адреса API. Читать их будет приложение — отдельным
  генератором в своём цикле.
- **CI.** В репозитории сейчас нет ни одного workflow. Заводить его для подпапки — отдельное решение, за рамками этого плана.
