import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultSearchFilters } from '../lib/climate-types.ts';
import {
  isReusablePhotoResult,
  photoSearchKey,
  type PhotoSearchInput,
} from '../lib/photo-search.ts';
import { places, type Place } from '../lib/places.ts';
import { createLruCache } from '../lib/search-cache.ts';
import type { VisualSearchSummary } from '../lib/visual-types.ts';

const summary = (mode: 'visual' | 'fallback'): VisualSearchSummary => ({
  mode,
  candidateCount: 1,
  eligibleCount: 1,
  comparedCount: 1,
  model: 'test',
  visualWeight: 0.6,
  scope: '',
});
const input: PhotoSearchInput = {
  source: places[0],
  preferences: ['water', 'green'],
  destination: 'world',
  visualWeight: 0.6,
  filters: { ...defaultSearchFilters },
};
const context = { indexVersion: '2026-11-10', saveCosts: true };

test('the cache expires entries and evicts the least recently used one', () => {
  let now = 0;
  const cache = createLruCache<number>(2, 100, () => now);
  cache.set('a', 1);
  cache.set('b', 2);
  assert.equal(cache.get('a'), 1);
  cache.set('c', 3);
  assert.equal(cache.get('b'), undefined);
  assert.equal(cache.get('a'), 1);
  now = 150;
  assert.equal(cache.get('a'), undefined);
  assert.equal(cache.size, 1);
});

test('identical photo searches share a key; any condition or index change does not', () => {
  const key = photoSearchKey(input, context);
  assert.equal(photoSearchKey({ ...input, preferences: ['green', 'water'] }, context), key);
  assert.equal(photoSearchKey({ ...input, destination: ' World ' }, context), key);
  assert.notEqual(photoSearchKey({ ...input, preferences: ['water'] }, context), key);
  assert.notEqual(photoSearchKey({ ...input, visualWeight: 0.8 }, context), key);
  assert.notEqual(
    photoSearchKey({ ...input, filters: { ...input.filters, lessVisited: true } }, context),
    key,
  );
  assert.notEqual(photoSearchKey(input, { ...context, indexVersion: 'next' }), key);
  assert.notEqual(photoSearchKey(input, { ...context, saveCosts: false }), key);
  assert.notEqual(photoSearchKey({ ...input, fast: true }, context), key);
  assert.equal(photoSearchKey({ ...input, fast: false }, context), key);
});

test('only catalog-only photo results may be reused for other people', () => {
  const catalogPlace: Place = places[1];
  const googlePlace: Place = { ...places[2], id: 'google-x', placeId: 'x' };
  assert.equal(
    isReusablePhotoResult({
      source: places[0],
      places: [catalogPlace],
      visualSearch: summary('visual'),
    }),
    true,
  );
  assert.equal(
    isReusablePhotoResult({
      source: places[0],
      places: [catalogPlace],
      visualSearch: summary('fallback'),
    }),
    false,
  );
  assert.equal(
    isReusablePhotoResult({
      source: places[0],
      places: [catalogPlace, googlePlace],
      visualSearch: summary('visual'),
    }),
    false,
  );
  assert.equal(
    isReusablePhotoResult({
      source: places[0],
      places: [{ ...catalogPlace, googleMapsUri: 'https://maps.google.com' }],
      visualSearch: summary('visual'),
    }),
    false,
  );
  assert.equal(
    isReusablePhotoResult({ source: places[0], places: [], visualSearch: summary('visual') }),
    false,
  );
});
