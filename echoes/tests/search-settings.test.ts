import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultPreferences } from '../lib/places.ts';
import { chosenPreferences, preferencesToStore } from '../lib/search-settings.ts';

test('auto-saved old defaults do not override the current defaults', () => {
  assert.deepEqual(chosenPreferences(['water', 'green', 'quiet']), []);
  assert.deepEqual(chosenPreferences(['history', 'walk']), ['history', 'walk']);
});

test('a stored choice of the same features is kept', () => {
  const stored = preferencesToStore(['water', 'green', 'quiet']);
  assert.deepEqual(stored, ['green', 'quiet', 'water']);
  assert.deepEqual(chosenPreferences(stored), stored);
  assert.deepEqual(chosenPreferences(preferencesToStore(defaultPreferences)), [
    'cafes',
    'history',
    'walk',
  ]);
});
