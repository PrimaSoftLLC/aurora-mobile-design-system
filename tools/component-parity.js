import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { root } from './load.js';
import { listComponents } from './components.js';

const PKG = path.join(root, 'packages', 'aurora_design_system');

// Файлы без виджетов: перечислять их в исключениях честнее, чем угадывать по
// содержимому. Компонент, случайно попавший сюда, виден в диффе.
const NO_WIDGETS = new Set(['status.dart']);

/**
 * Компонент, экспортированный без проверки на четыре комбинации, — это
 * компонент, чья перекраска не проверена никем. Гейт ловит ровно это:
 * файл в `base/` обязан иметь тест, а тест обязан звать `forEachBrandAndTheme`.
 *
 * `pkgDir` — путь к пакету `aurora_design_system` (по умолчанию — настоящий
 * пакет этого репозитория). Параметр существует ради тестов: они подсовывают
 * временную фикстуру вместо реального дерева, не трогая ни его, ни сигнатуру
 * вызова из `tools/build.js`.
 */
export function checkComponentParity({ pkgDir = PKG } = {}) {
  const problems = [];
  const src = path.join(pkgDir, 'lib', 'src', 'base');
  const testDir = path.join(pkgDir, 'test');

  if (!existsSync(src)) {
    // Раньше отсутствие base/ тихо возвращало «проблем нет». Гейт, которому
    // нечего проверить, не то же самое, что гейт, у которого всё в порядке —
    // переименованный каталог, опечатка в пути после рефакторинга или
    // неверный root должны провалить проверку, а не молча пропустить её.
    problems.push(`${src}: каталог не найден — гейту нечего проверять`);
    return problems;
  }

  const barrel = readFileSync(path.join(pkgDir, 'lib', 'aurora_design_system.dart'), 'utf8');

  // Виджеты берём из того же инвентаря, что печатает превью: иначе «что есть
  // в пакете» разбирают два парсера, и первый же разошедшийся ответ окажется
  // либо дырой в гейте, либо враньём в превью.
  const widgetsByFile = {};
  for (const c of listComponents({ pkgDir })) {
    if (c.kind !== 'widget') continue;
    (widgetsByFile[c.file] ??= []).push(c.name);
  }

  for (const file of readdirSync(src).filter((f) => f.endsWith('.dart'))) {
    const name = file.replace(/\.dart$/, '');

    if (!barrel.includes(`export 'src/base/${file}';`)) {
      problems.push(`${file}: лежит в base/, но не экспортирован из aurora_design_system.dart`);
    }

    if (NO_WIDGETS.has(file)) continue;

    const testFile = path.join(testDir, `${name}_test.dart`);
    if (!existsSync(testFile)) {
      problems.push(`${file}: нет теста test/${name}_test.dart`);
      continue;
    }

    const body = readFileSync(testFile, 'utf8');
    if (!body.includes('forEachBrandAndTheme(')) {
      problems.push(`${name}_test.dart: не зовёт forEachBrandAndTheme — компонент проверен не во всех темах`);
    }

    // Файл → тест ловит компонент без теста вообще, но не ловит второй
    // публичный виджет в том же файле: button.dart и chip.dart экспортируют
    // по два виджета каждый, и тест одного не гарантирует тест другого.
    for (const className of widgetsByFile[file] ?? []) {
      // Сверяем по границам слова, а не подстрокой. Подстрока засчитывала
      // `AuroraButtonKind` за `AuroraButton`: тест, где остались одни варианты
      // кнопки, проходил бы гейт без единой проверки самой кнопки.
      if (!new RegExp(`\\b${className}\\b`).test(body)) {
        problems.push(`${file}: виджет ${className} не упомянут в test/${name}_test.dart`);
      }
    }
  }

  return problems;
}
