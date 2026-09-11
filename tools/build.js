import { validateAll } from './validate.js';
import { checkBrandParity } from './parity.js';
import { checkComponentParity } from './component-parity.js';
import { writeDart } from './generate-dart.js';
import { writeFigma } from './generate-figma.js';
import { writePreview } from './generate-preview.js';
import { writeCss } from './generate-css.js';
import { captureGallery } from './gallery.js';

const problems = [...validateAll(), ...checkBrandParity(), ...checkComponentParity()];

if (problems.length > 0) {
  console.error('Сборка остановлена, токены не прошли проверку:\n');
  for (const p of problems) console.error(`  • ${p}`);
  console.error('\nПравьте токены, а не пороги проверок.');
  process.exit(1);
}

// Снимки компонентов рисует Flutter, а не этот скрипт. Если его здесь нет,
// превью соберётся без галереи и скажет об этом прямо — устаревшие снимки
// хуже отсутствующих.
const shots = captureGallery();
console.log(shots.ok ? 'Снимки компонентов перерисованы' : `Снимки не обновлены: ${shots.reason}`);

console.log('Записан:', writeDart());
console.log('Записан:', writeFigma());
console.log('Записан:', writePreview());
console.log('Записан:', writeCss());
