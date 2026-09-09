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
test('пин Flutter в ci.yaml совпадает с mise.toml', () => {
  const mise = readFileSync(path.join(root, 'mise.toml'), 'utf8');
  const ci = readFileSync(path.join(root, '.github', 'workflows', 'ci.yaml'), 'utf8');

  const pinned = /^\s*flutter\s*=\s*"([^"]+)"/m.exec(mise);
  assert.ok(pinned, 'в mise.toml нет строки flutter = "..."');

  const used = /flutter-version:\s*([0-9][^\s#]*)/.exec(ci);
  assert.ok(used, 'в ci.yaml нет строки flutter-version:');

  assert.equal(
    used[1], pinned[1],
    'ci.yaml собирает не на той версии Flutter, что стоит в mise.toml — ' +
    'поднимайте обе строки вместе',
  );
});
