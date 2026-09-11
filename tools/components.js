import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { root } from './load.js';

const PKG = path.join(root, 'packages', 'aurora_design_system');

/**
 * Публичный виджет: класс верхнего уровня без ведущего подчёркивания.
 * `_StateBody` в states.dart так не совпадёт — это внутренняя деталь.
 * Намеренно не требуем префикса `Aurora`: компонент, названный иначе, всё
 * равно остаётся публичным API, и гейт полноты опирается на этот же список.
 */
const WIDGET = /^class ([A-Za-z]\w*) extends/gm;

/** Лист — не класс, а функция верхнего уровня: `Future<bool?> showAuroraConfirmSheet({`. */
const FUNCTION = /^[A-Za-z][^\n=;]*?\b(showAurora\w+)\s*(?:<[^>]*>)?\(/gm;

const ENUM = /^enum ([A-Za-z]\w*)\s*\{([^}]*)\}/gm;

/** `required this.label,` и `required BuildContext context,` — обе формы. */
const REQUIRED = /required\s+(?:this\.(\w+)|[\w<>?,\s]+?\s(\w+))\s*[,}]/g;

/**
 * Блок параметров объявления: от `(` после имени до парной закрывающей скобки.
 * Считаем скобки, а не ищем первую `)`, иначе `Function(int)` в параметрах
 * обрежет блок на середине.
 */
function paramBlock(source, declIndex) {
  const open = source.indexOf('(', declIndex);
  if (open === -1) return '';
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '(') depth += 1;
    else if (source[i] === ')') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i);
    }
  }
  return '';
}

function requiredParams(block) {
  return [...block.matchAll(REQUIRED)].map((m) => m[1] ?? m[2]);
}

/**
 * Конструктор виджета — первый `const <Имя>(` внутри его класса. Берём именно
 * его, а не любой `required` в файле: у states.dart два публичных виджета и
 * один приватный, и их параметры не должны смешаться.
 */
function widgetRequired(source, className) {
  const ctor = source.indexOf(`const ${className}(`);
  return ctor === -1 ? [] : requiredParams(paramBlock(source, ctor));
}

/**
 * Енум принадлежит виджету, если начинается с его имени (`AuroraButtonKind` →
 * `AuroraButton`). Если совпадения нет, а виджет в файле один — енум его:
 * `AuroraRowHeight` в list_row.dart описывает единственный тамошний компонент.
 * Иначе енум остаётся сам по себе, как `AuroraStatus`.
 */
function ownerOf(enumName, widgets) {
  const byPrefix = widgets
    .filter((w) => enumName.startsWith(w))
    .sort((a, b) => b.length - a.length)[0];
  if (byPrefix) return byPrefix;
  return widgets.length === 1 ? widgets[0] : null;
}

/**
 * Инвентарь компонентов пакета: что уже существует, с какими вариантами и
 * какими обязательными параметрами. Читается из исходников при каждой сборке,
 * поэтому разойтись с кодом не может — в отличие от списка, набранного руками.
 *
 * `pkgDir` существует ради тестов и симметричен `checkComponentParity`.
 */
export function listComponents({ pkgDir = PKG } = {}) {
  const src = path.join(pkgDir, 'lib', 'src', 'base');
  if (!existsSync(src)) {
    // Пустой раздел «Компоненты» в превью выглядел бы как «компонентов нет»,
    // а не как «генератор не нашёл, где искать». Падаем, а не умалчиваем.
    throw new Error(`components: каталог ${src} не найден — инвентарь собрать не из чего`);
  }

  const entries = [];

  for (const file of readdirSync(src).filter((f) => f.endsWith('.dart')).sort()) {
    const source = readFileSync(path.join(src, file), 'utf8');

    const widgets = [...source.matchAll(WIDGET)].map((m) => m[1]);
    const functions = [...source.matchAll(FUNCTION)].map((m) => ({ name: m[1], at: m.index }));
    const enums = [...source.matchAll(ENUM)].map((m) => ({
      name: m[1],
      values: m[2].split(',').map((v) => v.trim()).filter(Boolean),
    }));

    const variantsOf = {};
    const orphanEnums = [];
    for (const e of enums) {
      const owner = ownerOf(e.name, widgets);
      if (owner) variantsOf[owner] = e.values;
      else orphanEnums.push(e);
    }

    for (const name of widgets) {
      entries.push({
        name,
        kind: 'widget',
        file,
        required: widgetRequired(source, name),
        variants: variantsOf[name] ?? [],
      });
    }

    for (const fn of functions) {
      entries.push({
        name: fn.name,
        kind: 'function',
        file,
        required: requiredParams(paramBlock(source, fn.at)),
        variants: [],
      });
    }

    for (const e of orphanEnums) {
      entries.push({ name: e.name, kind: 'enum', file, required: [], variants: e.values });
    }
  }

  return entries;
}
