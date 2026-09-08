import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { root } from '../tools/load.js';
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

// Детерминированность ничего не говорит о том, что лежит в репозитории:
// можно поправить JSON, получить зелёный прогон и закоммитить Dart от
// прошлой сборки. Эта проверка читает файл с диска — она и есть гейт против
// расхождения JSON и Dart, ради которого существует весь конвейер.
// eol=lf в design-system/.gitattributes держит файл в LF на любой платформе,
// иначе на свежем клоне под Windows сравнение падало бы на переводах строк.
test('закоммиченный tokens.g.dart совпадает с генерацией — иначе Dart устарел', () => {
  const file = path.join(root, 'aurora_design_system', 'lib', 'src', 'tokens', 'tokens.g.dart');
  const committed = readFileSync(file, 'utf8');
  assert.equal(
    committed, dart,
    'tokens.g.dart в репозитории отличается от генерации. Запустите `npm run build` и закоммитьте результат.',
  );
});
