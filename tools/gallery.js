import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { root } from './load.js';

const PKG = path.join(root, 'packages', 'aurora_design_system');
const DIR = path.join(root, 'build', 'gallery');

/** `AuroraButton-aurora-light.png` → компонент, бренд, тема. */
const NAME = /^(\w+)-(\w+)-(light|dark)\.png$/;

/**
 * Перерисовывает снимки настоящим Flutter'ом. Не golden-тест: ничего не
 * сравнивается, поэтому упасть из-за пикселя нельзя — но и устареть снимок
 * не должен, иначе превью покажет компонент, которого в коде уже нет.
 *
 * Flutter есть не везде, где собирается превью. Если его нет, возвращаем
 * причину, а сборку не валим: превью тогда честно скажет, что снимки не
 * обновлялись, вместо того чтобы молча показать вчерашние.
 */
export function captureGallery() {
  // Два способа позвать Flutter, потому что окружения два. Локально он приходит
  // из mise; в CI — из flutter-action, и никакого mise там нет. Пробуем прямой
  // вызов первым: если он сработал, обёртка не нужна.
  const attempts = [
    ['flutter', ['test', 'test/gallery_capture_test.dart']],
    ['mise', ['exec', '--', 'flutter', 'test', 'test/gallery_capture_test.dart']],
  ];

  const failures = [];
  for (const [cmd, args] of attempts) {
    const run = spawnSync(cmd, args, { cwd: PKG, shell: true, encoding: 'utf8' });

    if (!run.error && run.status === 0) return { ok: true, via: cmd };

    failures.push(
      run.error
        ? `${cmd}: ${run.error.message}`
        : `${cmd} вернул ${run.status}: ${(run.stdout ?? '').trim().split('\n').slice(-2).join(' ')}`,
    );
  }

  return { ok: false, reason: failures.join('; ') };
}

/**
 * Снимки с диска, сгруппированные по компоненту. PNG вшивается в страницу
 * base64: превью остаётся одним файлом, который можно отдать дизайнеру
 * целиком, не собирая к нему папку картинок.
 */
export function loadGallery() {
  if (!existsSync(DIR)) return {};

  const byComponent = {};
  for (const file of readdirSync(DIR).sort()) {
    const m = NAME.exec(file);
    if (!m) continue;
    const [, component, brand, theme] = m;
    const base64 = readFileSync(path.join(DIR, file)).toString('base64');
    (byComponent[component] ??= []).push({ brand, theme, src: `data:image/png;base64,${base64}` });
  }
  return byComponent;
}
