import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { listBrands, loadPrimitives, loadSemantic, root } from './load.js';
import { resolveColors } from './resolve.js';
import { renderedWeight, lineHeightRatio, letterSpacingPx } from './generate-dart.js';

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

  // Типографика и движение — те же числа, что уезжают в Dart. Без них
  // дизайнер набивает текстовые стили в Figma руками из таблицы
  // спека, то есть воспроизводит на стороне Figma ровно то расхождение,
  // ради предотвращения которого типографика вообще генерируется.
  const typographyVars = {
    'fontFamily.sans': p.fontFamily.sans,
    'fontFamily.mono': p.fontFamily.mono,
    'fontFamily.arabic': p.fontFamily.arabic,
  };
  for (const [name, r] of Object.entries(p.role)) {
    typographyVars[`role.${name}.fontFamily`] = p.fontFamily[r.family ?? 'sans'];
    typographyVars[`role.${name}.size`] = r.size;
    typographyVars[`role.${name}.lineHeight`] = r.lineHeight;
    typographyVars[`role.${name}.lineHeightRatio`] = Number(lineHeightRatio(r));
    // Исходное и платформенное начертание для потребителей Figma.
    typographyVars[`role.${name}.weight`] = r.weight;
    typographyVars[`role.${name}.weightRendered`] = renderedWeight(r.weight);
    typographyVars[`role.${name}.tracking`] = r.tracking;
    typographyVars[`role.${name}.letterSpacing`] = Number(letterSpacingPx(r));
    typographyVars[`role.${name}.tabular`] = r.tabular === true;
    // Верхний регистр — часть роли (overline), а не оформление конкретного
    // текста: без флага дизайнер нарисует overline строчными.
    typographyVars[`role.${name}.uppercase`] = r.uppercase === true;
  }

  const motionVars = {};
  for (const [k, v] of Object.entries(p.duration)) motionVars[`duration.${k}`] = v;
  for (const [k, v] of Object.entries(p.curve)) motionVars[`curve.${k}`] = v;

  return {
    $meta: {
      generatedBy: 'tools/generate-figma.js',
      direction: 'JSON → Figma. Обратный импорт не поддерживается намеренно.',
      note:
        'Коллекции component нет намеренно: §4.3 спека запрещает заводить этот ' +
        'слой на всякий случай. Полупрозрачные цвета (геозоны, surface.scrim) ' +
        'приходят как #RRGGBBAA.',
    },
    collections: {
      semantic: { modes, variables: semanticVars },
      dimension: { modes: [], variables: dimensionVars },
      typography: { modes: [], variables: typographyVars },
      motion: { modes: [], variables: motionVars },
    },
  };
}

export function writeFigma() {
  const out = path.join(root, 'build', 'figma-variables.json');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(generateFigma(), null, 2)}\n`, 'utf8');
  return out;
}
