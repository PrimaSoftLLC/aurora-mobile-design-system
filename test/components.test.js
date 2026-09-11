import test from 'node:test';
import assert from 'node:assert/strict';
import { listComponents } from '../tools/components.js';

const byName = () => Object.fromEntries(listComponents().map((c) => [c.name, c]));

test('виджет попадает в инвентарь с обязательными параметрами', () => {
  const button = byName().AuroraButton;
  assert.equal(button.kind, 'widget');
  assert.equal(button.file, 'button.dart');
  assert.deepEqual(button.required, ['label', 'onPressed']);
});

test('енум достаётся своему виджету по имени', () => {
  assert.deepEqual(byName().AuroraButton.variants, ['primary', 'secondary', 'ghost', 'danger']);
});

test('единственный виджет файла забирает енум файла, даже без совпадения имён', () => {
  assert.deepEqual(byName().AuroraListRow.variants, ['compact', 'standard', 'tall']);
});

test('второй виджет файла не наследует чужие варианты', () => {
  const icon = byName().AuroraIconButton;
  assert.deepEqual(icon.required, ['icon', 'semanticLabel', 'onPressed']);
  assert.deepEqual(icon.variants, []);
});

test('приватные классы в инвентарь не попадают', () => {
  // `_StateBody` — внутренняя деталь states.dart. Попади она в инвентарь,
  // дизайнер увидел бы компонент, которого не может позвать.
  assert.equal(listComponents().some((c) => c.name.startsWith('_')), false);
});

test('лист подтверждения попадает как функция, а не теряется', () => {
  const sheet = byName().showAuroraConfirmSheet;
  assert.equal(sheet.kind, 'function');
  assert.deepEqual(sheet.required, ['context', 'title', 'message', 'confirmLabel', 'cancelLabel']);
});

test('енум без собственного виджета остаётся отдельной строкой', () => {
  const status = byName().AuroraStatus;
  assert.equal(status.kind, 'enum');
  assert.deepEqual(status.variants, ['moving', 'parked', 'warning', 'alarm', 'offline']);
});

test('инвентарь покрывает все шесть файлов с компонентами', () => {
  const files = new Set(listComponents().map((c) => c.file));
  assert.deepEqual(
    [...files].sort(),
    ['banner.dart', 'button.dart', 'chip.dart', 'list_row.dart', 'sheet.dart', 'states.dart', 'status.dart'],
  );
});

test('пустой инвентарь падает громко, а не возвращает пустоту', () => {
  // Тот же урок, что у гейта полноты: «нечего показать» и «показывать нечего»
  // — разные вещи, и молча отрендерить пустой раздел хуже, чем упасть.
  assert.throws(() => listComponents({ pkgDir: 'нет-такого-каталога' }));
});
