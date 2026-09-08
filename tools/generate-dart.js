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
