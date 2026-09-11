import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { root } from '../tools/load.js';

// flutter-action читает версию только из pubspec.yaml, .fvmrc и
// .fvm/fvm_config.json, а pubspec библиотеки обязан держать диапазон, а не пин:
// пин посадил бы каждое приложение-потребителя ровно на эту версию Flutter.
// Поэтому версия в ci.yaml написана числом и может разъехаться с mise.toml
// молча — сборка просто поедет на другом SDK. Этот тест их связывает.
//
// Вхождений два, и оба обязаны совпадать с mise.toml: flutter-action стоит
// в job `test` и в job `release`. Второе появилось не сразу — сначала
// `release` ставил только Node, `npm run build` не находил Flutter, молча
// собирал превью без галереи компонентов, и в релиз 0.2.2 уехал файл на
// 89 КБ вместо 680. matchAll (а не .exec) и явная проверка количества нужны,
// чтобы третий шаг с этим же ключом не проскочил непроверенным, а пропажа
// одного из двух не осталась незамеченной тестом, который смотрит только на
// первое совпадение.
test('пин Flutter в ci.yaml совпадает с mise.toml', () => {
  const mise = readFileSync(path.join(root, 'mise.toml'), 'utf8');
  const ci = readFileSync(path.join(root, '.github', 'workflows', 'ci.yaml'), 'utf8');

  const pinned = /^\s*flutter\s*=\s*"([^"]+)"/m.exec(mise);
  assert.ok(pinned, 'в mise.toml нет строки flutter = "..."');

  const used = [...ci.matchAll(/flutter-version:\s*([0-9][^\s#]*)/g)].map((m) => m[1]);
  assert.equal(
    used.length, 2,
    'ожидалось ровно два вхождения "flutter-version:" в ci.yaml (шаги ' +
    'flutter-action в job test и в job release) — если добавили ещё одно, ' +
    'включите его в эту проверку, а не просто подняли число',
  );

  for (const version of used) {
    assert.equal(
      version, pinned[1],
      'ci.yaml собирает не на той версии Flutter, что стоит в mise.toml — ' +
      'поднимайте обе строки вместе',
    );
  }
});

// setup-node тоже не читает mise.toml напрямую (проверено прогоном: с
// node-version-file: mise.toml он принял строку "[tools]" за версию и упал),
// поэтому мажор Node продублирован числом в ci.yaml — в обеих работах,
// test и release. Разъедься он с mise.toml молча, CI и локальная сборка
// начнут ставить разные Node без единого предупреждения. Этот тест держит
// оба вхождения в узде.
//
// Вхождений ровно два: job `test` ставит Node безусловно, job `release` —
// тем же шагом под условием release == true (перед сборкой build/ для
// gh release create). Явная проверка количества нужна потому, что молчаливое
// удаление шага setup-node из одной из работ (скажем, из release) не тронуло
// бы значение оставшегося пина — цикл по укороченному списку не упал бы сам
// по себе, а работа тихо съехала бы на системный Node раннера.
test('пин Node в ci.yaml совпадает с mise.toml', () => {
  const mise = readFileSync(path.join(root, 'mise.toml'), 'utf8');
  const ci = readFileSync(path.join(root, '.github', 'workflows', 'ci.yaml'), 'utf8');

  const pinned = /^\s*node\s*=\s*"([^"]+)"/m.exec(mise);
  assert.ok(pinned, 'в mise.toml нет строки node = "..."');

  const used = [...ci.matchAll(/node-version:\s*"?([0-9][^\s"#]*)"?/g)].map((m) => m[1]);
  assert.equal(
    used.length, 2,
    'ожидалось ровно два вхождения "node-version:" в ci.yaml (job test и ' +
    'job release) — пропавшее вхождение означает, что одна из работ молча ' +
    'лишилась пина и поедет на системном Node раннера',
  );

  for (const version of used) {
    assert.equal(
      version, pinned[1],
      'ci.yaml собирает не на той версии Node, что стоит в mise.toml — ' +
      'поднимайте все строки node-version: вместе с mise.toml',
    );
  }
});
