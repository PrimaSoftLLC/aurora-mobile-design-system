import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReferences, validateContrast, validateAll, CONTRAST_PAIRS } from '../tools/validate.js';

test('все ссылки разрешаются во всех брендах и темах', () => {
  assert.deepEqual(validateReferences(), []);
});

// Этот тест намеренно хрупкий: он должен падать при любом изменении состава
// пар или порога `min`, чтобы такое изменение всегда было осознанной правкой,
// а не тихим дрейфом. Ослабление порога или удаление пары — ровно то, ради
// предотвращения чего написана эта проверка; ослаблять сам тест нельзя.
const EXPECTED_PAIRS = [
  { fg: 'text.primary',   bg: 'surface.content', min: 4.5, note: 'основной текст на контенте' },
  { fg: 'text.primary',   bg: 'surface.chrome',  min: 4.5, note: 'основной текст на хроме' },
  { fg: 'text.secondary', bg: 'surface.content', min: 4.5, note: 'вторичный текст на контенте' },
  { fg: 'text.secondary', bg: 'surface.chrome',  min: 4.5, note: 'вторичный текст на хроме' },
  { fg: 'text.primary',   bg: 'surface.selected', min: 4.5, note: 'основной текст выбранной строки списка' },
  { fg: 'text.secondary', bg: 'surface.selected', min: 4.5, note: 'вторичный текст выбранной строки списка' },
  { fg: 'text.primary',   bg: 'surface.overlay', min: 4.5, note: 'основной текст листа, диалога и меню' },
  { fg: 'text.secondary', bg: 'surface.overlay', min: 4.5, note: 'вторичный текст листа, диалога и меню' },
  { fg: 'text.onBrand',   bg: 'action.primary',  min: 4.5, note: 'подпись кнопки' },
  { fg: 'action.primary', bg: 'surface.content', min: 3.0, note: 'ссылка и полоса активного' },
  { fg: 'status.moving',  bg: 'surface.content', min: 3.0, note: 'статусная точка' },
  { fg: 'status.parked',  bg: 'surface.content', min: 3.0, note: 'статусная точка' },
  { fg: 'status.warning', bg: 'surface.content', min: 3.0, note: 'статусная точка' },
  { fg: 'status.alarm',   bg: 'surface.content', min: 3.0, note: 'статусная точка' },
  { fg: 'status.offline', bg: 'surface.content', min: 3.0, note: 'статусная точка: «нет связи» — состояние, а не отсутствие состояния' },
  { fg: 'map.trackDefault',  bg: 'surface.content', min: 3.0, note: 'трек на светлой подложке' },
  { fg: 'map.trackSelected', bg: 'surface.content', min: 3.0, note: 'выбранный трек' },
  { fg: 'border.strong',  bg: 'surface.content', min: 1.2, note: 'граница секции различима' },
  // Порог = сегодняшний минимум по брендам и темам, округлённый вниз до сотых.
  // Это храповик: он не даёт шкалам сплющиться дальше. Поднимать его — решение
  // дизайнера, и оно требует правки нейтральных шкал, а не порога.
  { fg: 'border.hairline', bg: 'surface.content', min: 1.13, note: 'волосяная граница строки: без теней это единственный разделитель' },
  { fg: 'border.hairline', bg: 'surface.chrome',  min: 1.04, note: 'волосяная граница внутри хрома: без теней это единственный разделитель' },
  { fg: 'surface.chrome',  bg: 'surface.content', min: 1.07, note: 'ступень тона между хромом и контентом: без теней это единственный разделитель' },
];

test('состав пар и пороги зафиксированы — ослабление порога должно ломать тест', () => {
  assert.deepEqual(CONTRAST_PAIRS, EXPECTED_PAIRS);
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
