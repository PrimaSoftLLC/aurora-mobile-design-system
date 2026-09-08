import { contrastRatio } from './color.js';
import { listBrands } from './load.js';
import { resolveColors } from './resolve.js';

const THEMES = ['light', 'dark'];

export const CONTRAST_PAIRS = [
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
  { fg: 'status.warning', bg: 'surface.content', min: 3.0, note: 'статусная точка' },
  { fg: 'status.alarm',   bg: 'surface.content', min: 3.0, note: 'статусная точка' },
  { fg: 'map.trackDefault',  bg: 'surface.content', min: 3.0, note: 'трек на светлой подложке' },
  { fg: 'map.trackSelected', bg: 'surface.content', min: 3.0, note: 'выбранный трек' },
  { fg: 'border.strong',  bg: 'surface.content', min: 1.2, note: 'граница секции различима' },
];

export function validateReferences() {
  const errors = [];
  for (const brand of listBrands()) {
    for (const theme of THEMES) {
      try {
        resolveColors(brand, theme);
      } catch (e) {
        errors.push(`${brand}/${theme}: ${e.message}`);
      }
    }
  }
  return errors;
}

export function validateContrast() {
  const errors = [];
  for (const brand of listBrands()) {
    for (const theme of THEMES) {
      let colors;
      try {
        colors = resolveColors(brand, theme);
      } catch {
        continue; // о таком уже сообщил validateReferences
      }
      for (const { fg, bg, min, note } of CONTRAST_PAIRS) {
        const ratio = contrastRatio(colors[fg], colors[bg]);
        if (ratio < min) {
          errors.push(
            `${brand}/${theme}: ${fg} (${colors[fg]}) на ${bg} (${colors[bg]}) = ` +
            `${ratio.toFixed(2)}, нужно ${min} — ${note}`
          );
        }
      }
    }
  }
  return errors;
}

export function validateAll() {
  return [...validateReferences(), ...validateContrast()];
}
