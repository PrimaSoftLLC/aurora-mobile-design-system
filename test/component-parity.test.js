import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkComponentParity } from '../tools/component-parity.js';

test('каждый компонент проверен в четырёх комбинациях бренд × тема', () => {
  assert.deepEqual(checkComponentParity(), []);
});

// Фикстура: временный псевдо-пакет с lib/src/base и test/, чтобы гонять
// каждую ветку гейта на синтетическом дереве, а не только на настоящем —
// см. идиому в test/parity.test.js (проверки против сфабрикованных данных).
function makeFixture() {
  const pkgDir = mkdtempSync(path.join(os.tmpdir(), 'aurora-component-parity-'));
  mkdirSync(path.join(pkgDir, 'lib', 'src', 'base'), { recursive: true });
  mkdirSync(path.join(pkgDir, 'test'), { recursive: true });
  return pkgDir;
}

function writeComponent(pkgDir, file) {
  writeFileSync(path.join(pkgDir, 'lib', 'src', 'base', file), '// fixture\n');
}

function writeBarrel(pkgDir, exportedFiles) {
  const exports = exportedFiles.map((f) => `export 'src/base/${f}';`).join('\n');
  writeFileSync(path.join(pkgDir, 'lib', 'aurora_design_system.dart'), `library;\n\n${exports}\n`);
}

function writeTest(pkgDir, name, body) {
  writeFileSync(path.join(pkgDir, 'test', `${name}_test.dart`), body);
}

function withFixture(fn) {
  const pkgDir = makeFixture();
  try {
    fn(pkgDir);
  } finally {
    rmSync(pkgDir, { recursive: true, force: true });
  }
}

test('компонент лежит в base/, но не экспортирован из барреля', () => {
  withFixture((pkgDir) => {
    writeComponent(pkgDir, 'foo.dart');
    writeBarrel(pkgDir, []); // foo.dart отсутствует в барреле
    writeTest(pkgDir, 'foo', "void main() { forEachBrandAndTheme((brand, theme) {}); }\n");

    assert.deepEqual(checkComponentParity({ pkgDir }), [
      'foo.dart: лежит в base/, но не экспортирован из aurora_design_system.dart',
    ]);
  });
});

test('компонент экспортирован, но для него нет test/<name>_test.dart', () => {
  withFixture((pkgDir) => {
    writeComponent(pkgDir, 'foo.dart');
    writeBarrel(pkgDir, ['foo.dart']);
    // test/foo_test.dart намеренно не создаём

    assert.deepEqual(checkComponentParity({ pkgDir }), ['foo.dart: нет теста test/foo_test.dart']);
  });
});

test('тест существует, но не зовёт forEachBrandAndTheme', () => {
  withFixture((pkgDir) => {
    writeComponent(pkgDir, 'foo.dart');
    writeBarrel(pkgDir, ['foo.dart']);
    writeTest(pkgDir, 'foo', 'void main() {}\n');

    assert.deepEqual(checkComponentParity({ pkgDir }), [
      'foo_test.dart: не зовёт forEachBrandAndTheme — компонент проверен не во всех темах',
    ]);
  });
});

test('NO_WIDGETS: экспорт всё равно обязателен', () => {
  withFixture((pkgDir) => {
    writeComponent(pkgDir, 'status.dart');
    writeBarrel(pkgDir, []); // status.dart не экспортирован

    assert.deepEqual(checkComponentParity({ pkgDir }), [
      'status.dart: лежит в base/, но не экспортирован из aurora_design_system.dart',
    ]);
  });
});

test('NO_WIDGETS: тест не обязателен', () => {
  withFixture((pkgDir) => {
    writeComponent(pkgDir, 'status.dart');
    writeBarrel(pkgDir, ['status.dart']);
    // test/status_test.dart намеренно не создаём — для NO_WIDGETS это не проблема

    assert.deepEqual(checkComponentParity({ pkgDir }), []);
  });
});

test('lib/src/base отсутствует — гейт проваливается, а не молчит', () => {
  const pkgDir = mkdtempSync(path.join(os.tmpdir(), 'aurora-component-parity-'));
  try {
    // Намеренно не создаём lib/src/base.
    const problems = checkComponentParity({ pkgDir });
    assert.equal(problems.length, 1);
    assert.match(problems[0], /каталог не найден/);
    assert.ok(problems[0].includes(path.join(pkgDir, 'lib', 'src', 'base')));
  } finally {
    rmSync(pkgDir, { recursive: true, force: true });
  }
});
