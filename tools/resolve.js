import { mix } from './color.js';
import { loadBrand, loadPrimitives, loadSemantic } from './load.js';

const REF = /^\{([a-zA-Z0-9._]+)\}$/;
const MIX = /^mix\(\s*(\{[^}]+\})\s*,\s*(\{[^}]+\})\s*,\s*([0-9.]+)\s*\)$/;

function lookup(pathStr, scope, tokenName) {
  const value = pathStr.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
  if (typeof value !== 'string') {
    throw new Error(`Токен "${tokenName}": не найдена ссылка {${pathStr}}`);
  }
  return value;
}

function resolveValue(raw, scope, tokenName) {
  const m = MIX.exec(raw);
  if (m) {
    const a = resolveValue(m[1], scope, tokenName);
    const b = resolveValue(m[2], scope, tokenName);
    return mix(a, b, Number(m[3]));
  }
  const r = REF.exec(raw);
  if (r) return lookup(r[1], scope, tokenName);
  throw new Error(`Токен "${tokenName}": сырое значение "${raw}" в семантическом слое запрещено`);
}

export function resolveColors(brandId, theme, semanticOverride) {
  const brand = loadBrand(brandId);
  const primitives = loadPrimitives();
  const semantic = semanticOverride ?? loadSemantic();
  const scope = { color: brand.color, status: primitives.status };

  const out = {};
  for (const [name, byTheme] of Object.entries(semantic)) {
    const raw = byTheme[theme];
    if (raw === undefined) throw new Error(`Токен "${name}": нет варианта "${theme}"`);
    out[name] = resolveValue(raw, scope, name);
  }
  return out;
}
