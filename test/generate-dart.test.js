import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { root, loadSemantic, loadPrimitives } from '../tools/load.js';
import { camelize, dartColor, generateDart } from '../tools/generate-dart.js';

test('camelize превращает точечное имя в camelCase', () => {
  assert.equal(camelize('surface.content'), 'surfaceContent');
  assert.equal(camelize('map.trackSpeeding'), 'mapTrackSpeeding');
  assert.equal(camelize('text.onBrand'), 'textOnBrand');
});

test('dartColor даёт литерал Color с непрозрачной альфой', () => {
  assert.equal(dartColor('#0066B8'), 'Color(0xFF0066B8)');
});

test('dartColor переставляет альфу вперёд для восьмизначного hex', () => {
  assert.equal(dartColor('#FF000040'), 'Color(0x40FF0000)');
  assert.throws(() => dartColor('#FFF'), /6 или 8/);
});

const dart = generateDart();

test('геозоны попали в вывод полупрозрачными', () => {
  assert.match(dart, /geofenceRed: Color\(0x40FF0000\)/);
  assert.match(dart, /geofenceRed: Color\(0x59FF0000\)/);
});

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
  assert.match(dart, /static const Duration durationBase = Duration\(milliseconds: 200\);/);
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
// eol=lf в .gitattributes держит файл в LF на любой платформе,
// иначе на свежем клоне под Windows сравнение падало бы на переводах строк.
test('закоммиченный tokens.g.dart совпадает с генерацией — иначе Dart устарел', () => {
  const file = path.join(root, 'packages', 'aurora_design_system', 'lib', 'src', 'tokens', 'tokens.g.dart');
  const committed = readFileSync(file, 'utf8');
  assert.equal(
    committed, dart,
    'tokens.g.dart в репозитории отличается от генерации. Запустите `npm run build` и закоммитьте результат.',
  );
});

// Равенство по значению должно покрывать все поля, а не те, что вспомнил автор:
// забытое поле — это тема, которая считает себя равной другой теме.
test('AuroraColorTokens сравнивается по значению, и в сравнении участвуют все поля', () => {
  const fields = Object.keys(loadSemantic()).map(camelize);
  const body = /class AuroraColorTokens \{([\s\S]*?)\n\}/.exec(dart)[1];
  assert.match(body, /bool operator ==\(Object other\)/);
  assert.match(body, /int get hashCode => Object\.hashAll/);
  const eq = /return other is AuroraColorTokens &&([\s\S]*?);/.exec(body)[1];
  const hash = /Object\.hashAll\(<Object\?>\[([\s\S]*?)\]\)/.exec(body)[1];
  for (const f of fields) {
    assert.ok(eq.includes(`${f} == other.${f}`), `${f} не участвует в operator ==`);
    assert.ok(hash.includes(`\n        ${f},`), `${f} не участвует в hashCode`);
  }
  // runtimeType плюс по одному сравнению на поле — ни больше, ни меньше.
  assert.equal(eq.split('&&').length, fields.length + 1);
  assert.equal(hash.trim().split(/\s*\n\s*/).length, fields.length);
});

// Тот же аргумент, что и для цветов: набор ролей генерируется, и равенство
// генерируется, иначе рукописный класс молча отстаёт от JSON.
test('AuroraTypography сгенерирован из ролей JSON и сравнивается по всем полям', () => {
  const roles = Object.keys(loadPrimitives().role);
  const body = /class AuroraTypography \{([\s\S]*?)\n\}/.exec(dart)[1];
  for (const r of roles) {
    assert.ok(body.includes(`final TextStyle ${r};`), `${r} не является полем AuroraTypography`);
    assert.ok(body.includes(`${r} = AuroraTypographyTokens.${r}`), `${r} не входит в .standard()`);
  }
  const eq = /return other is AuroraTypography &&([\s\S]*?);/.exec(body)[1];
  assert.equal(eq.split('&&').length, roles.length + 1);
});

test('каждая роль несёт арабский фолбэк', () => {
  const styles = dart.match(/static const TextStyle \w+ = TextStyle\([\s\S]*?\);/g);
  assert.equal(styles.length, Object.keys(loadPrimitives().role).length);
  for (const s of styles) assert.match(s, /fontFamilyFallback: fontFamilyFallback,/);
  assert.match(dart, /fontFamilyFallback = <String>\[fontFamilyArabic\]/);
});

test('surface.scrim полупрозрачен и в Dart несёт альфу впереди', () => {
  assert.match(dart, /surfaceScrim: Color\(0x66101220\)/);
  assert.match(dart, /surfaceScrim: Color\(0x99101220\)/);
});
