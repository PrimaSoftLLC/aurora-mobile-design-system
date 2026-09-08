import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { listBrands, loadPrimitives, loadSemantic, root } from './load.js';
import { resolveColors } from './resolve.js';

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

  return {
    $meta: {
      generatedBy: 'design-system/tools/generate-figma.js',
      direction: 'JSON → Figma. Обратный импорт не поддерживается намеренно.',
    },
    collections: {
      semantic: { modes, variables: semanticVars },
      dimension: { modes: [], variables: dimensionVars },
    },
  };
}

export function writeFigma() {
  const out = path.join(root, 'build', 'figma-variables.json');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(generateFigma(), null, 2)}\n`, 'utf8');
  return out;
}
