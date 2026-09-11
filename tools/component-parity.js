import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { root } from './load.js';

const PKG = path.join(root, 'packages', 'aurora_design_system');
const SRC = path.join(PKG, 'lib', 'src', 'base');
const TEST = path.join(PKG, 'test');

// Файлы без виджетов: перечислять их в исключениях честнее, чем угадывать по
// содержимому. Компонент, случайно попавший сюда, виден в диффе.
const NO_WIDGETS = new Set(['status.dart']);

/**
 * Компонент, экспортированный без проверки на четыре комбинации, — это
 * компонент, чья перекраска не проверена никем. Гейт ловит ровно это:
 * файл в `base/` обязан иметь тест, а тест обязан звать `forEachBrandAndTheme`.
 */
export function checkComponentParity() {
  const problems = [];
  if (!existsSync(SRC)) return problems;

  const barrel = readFileSync(path.join(PKG, 'lib', 'aurora_design_system.dart'), 'utf8');

  for (const file of readdirSync(SRC).filter((f) => f.endsWith('.dart'))) {
    const name = file.replace(/\.dart$/, '');

    if (!barrel.includes(`export 'src/base/${file}';`)) {
      problems.push(`${file}: лежит в base/, но не экспортирован из aurora_design_system.dart`);
    }

    if (NO_WIDGETS.has(file)) continue;

    const testFile = path.join(TEST, `${name}_test.dart`);
    if (!existsSync(testFile)) {
      problems.push(`${file}: нет теста test/${name}_test.dart`);
      continue;
    }

    const body = readFileSync(testFile, 'utf8');
    if (!body.includes('forEachBrandAndTheme(')) {
      problems.push(`${name}_test.dart: не зовёт forEachBrandAndTheme — компонент проверен не во всех темах`);
    }
  }

  return problems;
}
