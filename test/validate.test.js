import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReferences, validateContrast, validateAll, CONTRAST_PAIRS } from '../tools/validate.js';

test('все ссылки разрешаются во всех брендах и темах', () => {
  assert.deepEqual(validateReferences(), []);
});

test('набор обязательных пар не пуст', () => {
  assert.ok(CONTRAST_PAIRS.length >= 8);
});

test('text.disabled не проверяется на контраст', () => {
  assert.equal(CONTRAST_PAIRS.some((p) => p.fg === 'text.disabled'), false);
});

test('контраст проходит AA во всех брендах и темах', () => {
  const errors = validateContrast();
  assert.deepEqual(errors, [], `Провалы контраста:\n${errors.join('\n')}`);
});

test('validateAll объединяет обе проверки', () => {
  assert.deepEqual(validateAll(), []);
});
