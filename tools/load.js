import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

export function listBrands() {
  return readdirSync(path.join(root, 'tokens', 'brands'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

export function loadBrand(id) {
  return readJson(path.join(root, 'tokens', 'brands', `${id}.json`));
}

export function loadPrimitives() {
  const dir = path.join(root, 'tokens', 'primitive');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reduce((acc, f) => Object.assign(acc, readJson(path.join(dir, f))), {});
}

export function loadSemantic() {
  return readJson(path.join(root, 'tokens', 'semantic', 'color.json'));
}

export { root };
