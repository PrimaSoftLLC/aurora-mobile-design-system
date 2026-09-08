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

/**
 * Принимает `#RRGGBB` и `#RRGGBBAA`; Dart хочет ARGB, поэтому альфа
 * переезжает вперёд. Полупрозрачны только цвета геозон — это
 * пользовательские данные поверх карты, а не оформление.
 */
export function dartColor(hex) {
  const h = hex.replace('#', '').toUpperCase();
  if (h.length === 8) return `Color(0x${h.slice(6, 8)}${h.slice(0, 6)})`;
  if (h.length === 6) return `Color(0xFF${h})`;
  throw new Error(`dartColor: ожидался hex из 6 или 8 знаков, получено "${hex}"`);
}

/**
 * У Flutter FontWeight идёт шагом 100, поэтому 550 из спека непредставим
 * в статичном Inter и округляется к ближайшей сотне — до 600. Дизайнер,
 * рисующий 550, обязан видеть, что код нарисует 600, поэтому округление
 * вынесено отдельно: тот же расчёт уезжает и в Figma-документ.
 */
export function renderedWeight(weight) {
  return Math.round(weight / 100) * 100;
}

export function dartWeight(weight) {
  return `FontWeight.w${renderedWeight(weight)}`;
}

/**
 * Строки, а не числа: Dart и Figma обязаны получить ровно одну и ту же
 * округлённую величину, а `toFixed` — единственное место, где она берётся.
 */
export function lineHeightRatio(role) {
  return (role.lineHeight / role.size).toFixed(4);
}

export function letterSpacingPx(role) {
  return (role.tracking * role.size).toFixed(4);
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
  lines.push('');
  // ThemeData.== сравнивает extensions по значению. Без этого две структурно
  // одинаковые темы не равны, MaterialApp(theme: auroraThemeData(...)) внутри
  // build выдаёт на каждой перестройке новый ThemeData, и перерисовывается
  // каждый Theme.of-зависимый виджет на экране. Поля генерируются, поэтому и
  // равенство генерируется: рукописное разъехалось бы с первым новым токеном.
  lines.push('  @override');
  lines.push('  bool operator ==(Object other) {');
  lines.push('    if (identical(this, other)) return true;');
  lines.push('    return other is AuroraColorTokens &&');
  lines.push('        runtimeType == other.runtimeType &&');
  for (const [i, f] of fields.entries()) {
    lines.push(`        ${f} == other.${f}${i === fields.length - 1 ? ';' : ' &&'}`);
  }
  lines.push('  }');
  lines.push('');
  lines.push('  @override');
  lines.push('  int get hashCode => Object.hashAll(<Object?>[');
  for (const f of fields) lines.push(`        ${f},`);
  lines.push('      ]);');
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
    lines.push(`    height: ${lineHeightRatio(r)},`);
    lines.push(`    fontWeight: ${dartWeight(r.weight)},`);
    lines.push(`    letterSpacing: ${letterSpacingPx(r)},`);
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
