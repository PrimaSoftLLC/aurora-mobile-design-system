import { mix, withAlpha } from './color.js';
import { loadBrand, loadPrimitives, loadSemantic } from './load.js';

const REF = /^\{([a-zA-Z0-9._]+)\}$/;
const MIX = /^mix\(\s*(\{[^}]+\})\s*,\s*(\{[^}]+\})\s*,\s*([0-9.]+)\s*\)$/;
const ALPHA = /^alpha\(\s*(\{[^}]+\})\s*,\s*(\d*\.?\d+)\s*\)$/;

/** Префикс ссылки на другой токен того же семантического слоя. */
const SEMANTIC = 'semantic.';

function lookup(pathStr, scope, tokenName) {
  const value = pathStr.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
  if (typeof value !== 'string') {
    throw new Error(`Токен "${tokenName}": не найдена ссылка {${pathStr}}`);
  }
  return value;
}

/**
 * `ctx.semanticRef(name, from)` разворачивает `{semantic.<name>}`. Без него
 * алиасы из спека (`focus.indicator` = `action.primary`, треки карты) пришлось
 * бы расплющивать в примитивы — и они переставали бы быть алиасами: сдвиг
 * `action.primary` молча не доезжал бы до фокусного кольца.
 */
function resolveValue(raw, ctx, tokenName) {
  const m = MIX.exec(raw);
  if (m) {
    return mix(
      resolveValue(m[1], ctx, tokenName),
      resolveValue(m[2], ctx, tokenName),
      Number(m[3]),
    );
  }
  const a = ALPHA.exec(raw);
  if (a) return withAlpha(resolveValue(a[1], ctx, tokenName), Number(a[2]));

  const r = REF.exec(raw);
  if (r) {
    const target = r[1];
    if (target.startsWith(SEMANTIC)) return ctx.semanticRef(target.slice(SEMANTIC.length), tokenName);
    return lookup(target, ctx.scope, tokenName);
  }
  throw new Error(`Токен "${tokenName}": сырое значение "${raw}" в семантическом слое запрещено`);
}

export function resolveColors(brandId, theme, semanticOverride) {
  const brand = loadBrand(brandId);
  const primitives = loadPrimitives();
  const semantic = semanticOverride ?? loadSemantic();
  const scope = {
    color: brand.color,
    status: primitives.status,
    geofence: primitives.geofence,
  };

  const out = {};
  // Цепочка разворачиваемых прямо сейчас токенов. Циклов в семантическом файле
  // нет, но следующий человек их напишет, и падать он должен с именами, а не
  // переполнением стека.
  const chain = [];
  const ctx = {
    scope,
    semanticRef(name, from) {
      if (Object.prototype.hasOwnProperty.call(out, name)) return out[name];
      if (chain.includes(name)) {
        throw new Error(
          `Токен "${from}": цикл ссылок в семантическом слое — ${[...chain, name].join(' → ')}`,
        );
      }
      if (semantic[name] === undefined) {
        throw new Error(`Токен "${from}": не найдена ссылка {${SEMANTIC}${name}}`);
      }
      return resolveToken(name);
    },
  };

  function resolveToken(name) {
    const byTheme = semantic[name];
    const raw = byTheme[theme];
    if (raw === undefined) throw new Error(`Токен "${name}": нет варианта "${theme}"`);
    chain.push(name);
    try {
      const value = resolveValue(raw, ctx, name);
      out[name] = value;
      return value;
    } finally {
      chain.pop();
    }
  }

  for (const name of Object.keys(semantic)) {
    if (!Object.prototype.hasOwnProperty.call(out, name)) resolveToken(name);
  }
  return out;
}
