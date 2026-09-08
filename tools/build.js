import { validateAll } from './validate.js';
import { checkBrandParity } from './parity.js';
import { writeDart } from './generate-dart.js';
import { writeFigma } from './generate-figma.js';
import { writePreview } from './generate-preview.js';
import { writeCss } from './generate-css.js';

const problems = [...validateAll(), ...checkBrandParity()];

if (problems.length > 0) {
  console.error('Сборка остановлена, токены не прошли проверку:\n');
  for (const p of problems) console.error(`  • ${p}`);
  console.error('\nПравьте токены, а не пороги проверок.');
  process.exit(1);
}

console.log('Записан:', writeDart());
console.log('Записан:', writeFigma());
console.log('Записан:', writePreview());
console.log('Записан:', writeCss());
