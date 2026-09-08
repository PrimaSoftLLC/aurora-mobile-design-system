import { listBrands, loadBrand } from './load.js';

/** Ключи бренд-файла, которым разрешено различаться визуально. */
export const BRAND_ALLOWED_KEYS = ['color', 'logo', 'wordmark'];

/** Ключи, различие которых визуально нейтрально (метаданные и конфигурация). */
const METADATA_KEYS = ['id', 'appName', 'baseUrl', 'defaultLocale', 'neutralHue', 'seed'];

/** Абсолютные эталонные ступени цветовых шкал — должны быть одинаковы во всех брендах. */
const CANONICAL_STEPS = {
  neutral: ['0','50','100','200','300','400','500','600','700','800','850','900','950','1000'],
  brand: ['50','100','200','300','400','500','600','700','800','900'],
};

/**
 * `seed` — не генератор шкалы, а запись о том, откуда шкала растёт (§4.1).
 * Раз он ничего не производит, единственное, что удерживает его от превращения
 * в мёртвое поле, — требование, чтобы он буквально встречался в собственной
 * шкале бренда. Ступень при этом не фиксируется: у Aurora seed стоит на 600, у
 * МТС фирменный красный — это 500, а 600 у них затемнённый вариант, который
 * несёт контраст. Требовать одинаковую ступень значило бы сломать МТС.
 */
export function checkSeedInOwnRamp(brand) {
  const id = brand?.id ?? '(без id)';
  const seed = brand?.seed;
  if (typeof seed !== 'string') {
    return [`${id}: нет поля "seed" — метаданные бренда неполны`];
  }
  const ramp = brand?.color?.brand ?? {};
  const hit = Object.entries(ramp).find(([, hex]) => String(hex).toUpperCase() === seed.toUpperCase());
  if (hit) return [];
  return [
    `${id}: seed ${seed} не встречается в собственной шкале brand ` +
    `[${Object.values(ramp).join(', ')}]. Шкалы рисует дизайнер, но seed обязан ` +
    `указывать на одну из её ступеней, иначе он ничего не описывает.`,
  ];
}

export function checkBrandParity() {
  const brands = listBrands();
  const violations = [];
  const known = new Set([...BRAND_ALLOWED_KEYS, ...METADATA_KEYS]);
  const brandsWithMissingScales = new Set();

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
      brandsWithMissingScales.add(id);
    }
  }

  for (const id of brands) {
    violations.push(...checkSeedInOwnRamp(loadBrand(id)));
  }

  // Абсолютная проверка против эталонных ступеней.
  for (const id of brands) {
    const brand = loadBrand(id);
    for (const [scale, canonicalSteps] of Object.entries(CANONICAL_STEPS)) {
      const brandSteps = Object.keys(brand.color?.[scale] ?? {}).sort();
      const canonical = canonicalSteps.sort();

      const missing = canonical.filter(s => !brandSteps.includes(s));
      const unexpected = brandSteps.filter(s => !canonical.includes(s));

      if (missing.length > 0 || unexpected.length > 0) {
        const details = [];
        if (missing.length > 0) details.push(`отсутствуют: ${missing.join(', ')}`);
        if (unexpected.length > 0) details.push(`непредвиденные: ${unexpected.join(', ')}`);
        violations.push(`${id}: ступени шкалы "${scale}" не совпадают с эталоном (${details.join('; ')})`);
      }
    }
  }

  // Шкалы должны иметь одинаковый набор ступеней во всех брендах.
  const [first, ...rest] = brands;
  const reference = loadBrand(first);
  for (const id of rest) {
    const brand = loadBrand(id);
    // Пропускаем сравнение, если у одного из брендов уже обнаружены проблемы со шкалами.
    if (brandsWithMissingScales.has(id) || brandsWithMissingScales.has(first)) {
      continue;
    }
    for (const scale of ['neutral', 'brand']) {
      const a = Object.keys(reference.color?.[scale] ?? {}).sort().join(',');
      const b = Object.keys(brand.color?.[scale] ?? {}).sort().join(',');
      if (a !== b) {
        violations.push(`${id}: ступени шкалы "${scale}" не совпадают с ${first}`);
      }
    }
  }

  return violations;
}
