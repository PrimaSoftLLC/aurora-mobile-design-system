import { existsSync } from 'node:fs';
import path from 'node:path';
import { hue } from './color.js';
import { listBrands, loadBrand, root } from './load.js';

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
 * Имя файла бренда становится членом Dart-enum `AuroraBrand` и CSS-классом
 * в превью, поэтому оно обязано быть идентификатором. `my-brand.json` дал бы
 * некомпилируемый `tokens.g.dart`, и упало бы это не здесь, а во Flutter.
 */
const BRAND_ID = /^[a-z][a-z0-9]*$/;

/**
 * Допуск для `neutralHue`. У нейтралей насыщенность низкая, и оттенок
 * «плавает» по ступеням на десяток градусов (у МТС от 15° до 30° при
 * заявленных 28°), поэтому мерится одна ступень 500 — самая насыщенная в
 * середине шкалы — и с запасом.
 */
const HUE_TOLERANCE = 15;

/**
 * `id` внутри файла и имя файла — одно и то же в двух местах: Dart-enum и
 * превью берут имя файла, сообщения проверок берут `id`. Расхождение никто
 * не заметил бы, пока бренд не начал бы называться по-разному в коде и в
 * ошибках. Здесь же проверяется, что имя файла годится в идентификаторы.
 */
export function checkBrandId(fileId, brand) {
  const errors = [];
  if (!BRAND_ID.test(fileId)) {
    errors.push(
      `${fileId}: имя файла бренда должно быть идентификатором ([a-z][a-z0-9]*) — ` +
      `оно становится членом enum AuroraBrand в Dart.`,
    );
  }
  if (brand?.id !== fileId) {
    errors.push(`${fileId}: поле "id" (${JSON.stringify(brand?.id)}) не совпадает с именем файла.`);
  }
  return errors;
}

/**
 * `logo` и `wordmark` — две из четырёх визуальных осей бренда, и их легко
 * забыть: новый бренд уехал бы в релиз с чужим знаком. Файлы обязаны лежать
 * в `assets/brand/` под именами из бренд-файла.
 */
export function checkBrandAssets(brand, assetsDir = path.join(root, 'assets', 'brand')) {
  const id = brand?.id ?? '(без id)';
  const errors = [];
  for (const key of ['logo', 'wordmark']) {
    const name = brand?.[key];
    if (typeof name !== 'string' || name === '') {
      errors.push(`${id}: нет поля "${key}" — бренд без знака`);
      continue;
    }
    if (!existsSync(path.join(assetsDir, name))) {
      errors.push(`${id}: ${key} "${name}" не найден в assets/brand/`);
    }
  }
  return errors;
}

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

/**
 * Тот же аргумент, что и у `seed`: `neutralHue` описывает замысел, и чтобы
 * описание не разошлось со шкалой, оттенок ступени `neutral.500` обязан
 * лежать в допуске от заявленного. Серая шкала без оттенка — тоже
 * расхождение: тогда `neutralHue` описывает то, чего нет.
 */
export function checkNeutralHue(brand) {
  const id = brand?.id ?? '(без id)';
  const declared = brand?.neutralHue;
  if (typeof declared !== 'number') {
    return [`${id}: нет числового поля "neutralHue" — метаданные бренда неполны`];
  }
  const mid = brand?.color?.neutral?.['500'];
  if (typeof mid !== 'string') return [`${id}: нет ступени neutral.500, оттенок мерить не на чем`];
  const actual = hue(mid);
  if (actual === null) {
    return [`${id}: neutral.500 (${mid}) — чистый серый без оттенка, а neutralHue заявляет ${declared}°`];
  }
  const diff = Math.abs(((actual - declared + 540) % 360) - 180);
  if (diff <= HUE_TOLERANCE) return [];
  return [
    `${id}: neutralHue ${declared}° расходится с оттенком neutral.500 (${mid}, ${Math.round(actual)}°) ` +
    `больше чем на ${HUE_TOLERANCE}°. Либо шкала не в том оттенке, либо поле врёт.`,
  ];
}

export function checkBrandParity() {
  const violations = [];
  const known = new Set([...BRAND_ALLOWED_KEYS, ...METADATA_KEYS]);

  for (const id of listBrands()) {
    const brand = loadBrand(id);

    violations.push(...checkBrandId(id, brand));

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

    violations.push(...checkBrandAssets(brand));
    violations.push(...checkSeedInOwnRamp(brand));
    violations.push(...checkNeutralHue(brand));

    // Ступени сверяются с эталоном, а не друг с другом: если каждый бренд
    // совпал с эталоном, они совпали и между собой.
    for (const [scale, canonicalSteps] of Object.entries(CANONICAL_STEPS)) {
      const brandSteps = Object.keys(brand.color?.[scale] ?? {});
      const missing = canonicalSteps.filter((s) => !brandSteps.includes(s));
      const unexpected = brandSteps.filter((s) => !canonicalSteps.includes(s));
      if (missing.length > 0 || unexpected.length > 0) {
        const details = [];
        if (missing.length > 0) details.push(`отсутствуют: ${missing.join(', ')}`);
        if (unexpected.length > 0) details.push(`непредвиденные: ${unexpected.join(', ')}`);
        violations.push(`${id}: ступени шкалы "${scale}" не совпадают с эталоном (${details.join('; ')})`);
      }
    }
  }

  return violations;
}
