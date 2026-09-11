import test from 'node:test';
import assert from 'node:assert/strict';
import { checkComponentParity } from '../tools/component-parity.js';

test('каждый компонент проверен в четырёх комбинациях бренд × тема', () => {
  assert.deepEqual(checkComponentParity(), []);
});
