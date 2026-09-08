import { listBrands, loadBrand } from './load.js';

/** Ключи бренд-файла, которым разрешено различаться визуально. */
export const BRAND_ALLOWED_KEYS = ['color', 'logo', 'wordmark'];

/** Ключи, различие которых визуально нейтрально (метаданные и конфигурация). */
const METADATA_KEYS = ['id', 'appName', 'baseUrl', 'defaultLocale', 'neutralHue', 'seed'];

export function checkBrandParity() {
  const brands = listBrands();
  const violations = [];
  const known = new Set([...BRAND_ALLOWED_KEYS, ...METADATA_KEYS]);

  for (const id of brands) {
    const brand = loadBrand(id);

    for (const key of Object.keys(brand)) {
      if (!known.has(key)) {
        violations.push(
          `${id}: ключ "${key}" не входит в разрешённый набор. ` +
          `Бренд меняет только ${BRAND_ALLOWED_KEYS.join(', ')} и метаданные.`
        );
      }
    }

    const scales = Object.keys(brand.color ?? {}).sort();
    if (scales.join(',') !== 'brand,neutral') {
      violations.push(`${id}: color содержит шкалы [${scales}], ожидались brand и neutral`);
    }
  }

  // Шкалы должны иметь одинаковый набор ступеней во всех брендах.
  const [first, ...rest] = brands;
  const reference = loadBrand(first);
  for (const id of rest) {
    const brand = loadBrand(id);
    for (const scale of ['neutral', 'brand']) {
      const a = Object.keys(reference.color[scale]).sort().join(',');
      const b = Object.keys(brand.color[scale]).sort().join(',');
      if (a !== b) {
        violations.push(`${id}: ступени шкалы "${scale}" не совпадают с ${first}`);
      }
    }
  }

  return violations;
}
