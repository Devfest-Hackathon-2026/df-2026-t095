import { test } from 'node:test';
import assert from 'node:assert/strict';
import { places } from '../lib/places.ts';
import {
  cosineSimilarity,
  rankVisualPlaces,
  matchesDestination,
  samePlace,
} from '../lib/visual-ranking.ts';
import {
  eligibleLicense,
  photoMatchesPlace,
  commonsImageBytes,
  samplePhoto,
  acceptedPlacePhoto,
} from '../lib/commons.ts';
import { visualDiscovery, applyMapsFallback } from '../lib/visual-discovery.ts';
import type { CommonsPhoto } from '../lib/visual-types.ts';
const source = places[0],
  seoul = places.find(p => p.id === 'seoul')!,
  munich = places.find(p => p.id === 'munich')!;
const photo: CommonsPhoto = {
  provider: 'commons',
  pageId: 1,
  title: 'File:Kamo River Kyoto.jpg',
  sourcePage: 'https://commons.wikimedia.org/wiki/File:Kamo_River_Kyoto.jpg',
  originalUrl: 'https://upload.wikimedia.org/x.jpg',
  thumbnailUrl: 'https://upload.wikimedia.org/x.jpg',
  sha1: 'known-file',
  mime: 'image/jpeg',
  author: 'Photographer',
  license: 'CC BY-SA 3.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  description: 'Kamo River in Kyoto',
  changes: '縮小',
  verification: 'test',
  verified: true,
};
test('cosine compares direction and rejects mismatched, zero or invalid vectors', () => {
  assert.equal(cosineSimilarity([1, 0], [4, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  assert.equal(cosineSimilarity([1, 0], [-1, 0]), -1);
  assert.throws(() => cosineSimilarity([1], [1, 2]));
  assert.throws(() => cosineSimilarity([0], [1]));
  assert.throws(() => cosineSimilarity([NaN], [1]));
});
test('destination constraints and source identity apply before visual ranking', () => {
  const vectors = new Map([
    [source.id, [1, 0]],
    [seoul.id, [0.5, 0.5]],
    [munich.id, [1, 0]],
  ]);
  const ranked = rankVisualPlaces(
    source,
    [source, seoul, munich],
    vectors,
    [1, 0],
    ['water'],
    'ソウル',
    1,
  );
  assert.deepEqual(
    ranked.map(p => p.id),
    ['seoul'],
  );
  assert.ok(matchesDestination(seoul, 'Seoul'));
  assert.ok(matchesDestination(munich, 'Europe'));
  assert.ok(!matchesDestination(munich, 'Asia'));
  assert.ok(samePlace(source, { ...source, id: 'another-id' }));
  assert.ok(samePlace({ ...source, placeId: 'id1' }, { ...munich, placeId: 'id1' }));
});
test('visual and quality weights can change ranking without displaying probabilities', () => {
  const a = { ...seoul, features: { ...source.features } },
    b = { ...munich, features: { ...source.features, water: 0 } };
  const vectors = new Map([
    [a.id, [0, 1]],
    [b.id, [1, 0]],
  ]);
  assert.equal(
    rankVisualPlaces(source, [a, b], vectors, [1, 0], ['water'], 'world', 1)[0].id,
    b.id,
  );
  assert.equal(
    rankVisualPlaces(source, [a, b], vectors, [1, 0], ['water'], 'world', 0)[0].id,
    a.id,
  );
});
test('photo identity requires place-name evidence; proximity alone and mismatched photos fail', () => {
  assert.ok(photoMatchesPlace(photo, ['Kamo River'], { city: 'Kyoto' }));
  assert.ok(
    !photoMatchesPlace(
      { ...photo, title: 'File:Nearby Cafe.jpg', description: 'A cafe near Kyoto' },
      ['Kamo River'],
      { nearby: true, city: 'Kyoto' },
    ),
  );
  assert.ok(
    !photoMatchesPlace(
      { ...photo, title: 'File:Kamo River.jpg', description: 'Kamo River' },
      ['Kamo River'],
      { city: 'Osaka' },
    ),
  );
});
test('unknown or restricted licenses and non-Commons images are never eligible for embedding', async () => {
  assert.ok(eligibleLicense(photo));
  assert.ok(!eligibleLicense({ ...photo, license: 'All rights reserved' }));
  assert.ok(!eligibleLicense({ ...photo, licenseUrl: 'https://example.com/license' }));
  await assert.rejects(() =>
    commonsImageBytes({ ...photo, thumbnailUrl: 'https://maps.googleapis.com/photo.jpg' }),
  );
  await assert.rejects(() => commonsImageBytes({ ...photo, verified: false }));
});
test('all 12 sample photos have audited reusable licenses and provenance', async () => {
  for (const p of places) {
    const found = await samplePhoto(p);
    assert.ok(found, p.id);
    assert.ok(found.sha1);
    assert.ok(found.sourcePage.startsWith('https://commons.wikimedia.org/wiki/File:'));
    assert.ok(eligibleLicense(found));
  }
});
test('missing source photo preserves text ranking and excludes source', async () => {
  let embedded = false;
  const result = await visualDiscovery(source, ['water'], 'Asia', 0.6, {
    photo: async () => null,
    embed: async () => {
      embedded = true;
      return [1, 0];
    },
  });
  assert.equal(result.visualSearch.mode, 'fallback');
  assert.equal(embedded, false);
  assert.ok(result.places.length > 0);
  assert.ok(result.places.every(p => p.continent === 'Asia' && p.id !== source.id && !p.visual));
});
test('embedding failure is explicitly identified and keeps destination constraints', async () => {
  const result = await visualDiscovery(source, ['water'], 'ソウル', 0.6, {
    photo: async () => photo,
    embed: async () => {
      throw new Error('unavailable');
    },
  });
  assert.equal(result.visualSearch.mode, 'fallback');
  assert.deepEqual(
    result.places.map(p => p.id),
    ['seoul'],
  );
  assert.match(result.visualSearch.reason!, /埋め込み/);
});
test('unavailable candidate photos are omitted and empty destinations do not trigger API calls', async () => {
  let calls = 0;
  const deps = {
    photo: async (p: typeof source) => {
      calls++;
      return p.id === source.id ? photo : null;
    },
    embed: async () => [1, 0],
  };
  const empty = await visualDiscovery(source, ['water'], '存在しない街', 0.6, deps);
  assert.equal(calls, 0);
  assert.deepEqual(empty.places, []);
  const missing = await visualDiscovery(source, ['water'], 'Asia', 0.6, deps);
  assert.equal(missing.visualSearch.mode, 'fallback');
  assert.equal(missing.visualSearch.comparedCount, 0);
});

test('photo fallback reuses Maps discovery and still enforces destination and source exclusion', async () => {
  const base = await visualDiscovery(source, ['water'], 'ソウル', 0.6, {
    photo: async () => null,
    embed: async () => [1, 0],
  });
  const fallback = await applyMapsFallback(base, ['water'], 'ソウル', async () => [
    source,
    seoul,
    munich,
  ]);
  assert.equal(fallback.visualSearch.mode, 'fallback');
  assert.deepEqual(
    fallback.places.map(p => p.id),
    ['seoul'],
  );
  assert.match(fallback.visualSearch.scope, /Google Maps/);
  assert.ok(fallback.places.every(p => !p.visual));
});
test('the source photo is excluded even when its place has a different identifier', async () => {
  const deps = { photo: async () => photo, embed: async () => [1, 0] };
  const result = await visualDiscovery(source, ['water'], 'Asia', 0.6, deps);
  assert.equal(result.visualSearch.comparedCount, 0);
  assert.equal(result.visualSearch.mode, 'fallback');
});
test('visually unrelated candidates are not forced into results when all photo comparisons are weak', async () => {
  const deps = {
    photo: async (p: typeof source) => ({
      ...photo,
      pageId: p.id === source.id ? 1 : 2,
      sha1: p.id,
    }),
    embed: async () => [1, 0],
    explain: async () => ({
      cosine: 1,
      visualWeight: 1,
      observations: ['水面があります。'],
      differences: ['川と環礁で地形が異なります。'],
      inferences: [],
      explanation: 'generated' as const,
      landscapeMatch: 'weak' as const,
      sourcePhoto: photo,
      candidatePhoto: photo,
    }),
  };
  const result = await visualDiscovery(source, ['water'], 'ソウル', 1, deps);
  assert.equal(result.visualSearch.mode, 'visual');
  assert.equal(result.visualSearch.comparedCount, 1);
  assert.equal(result.places.length, 0);
  assert.match(result.visualSearch.reason!, /十分に近い/);
});
test('a place photo must show the scenery the place is known for, not a road inside it', () => {
  const verdict = (extra: object) => ({
    primarySubject: 'landscape',
    depictsIntendedPlace: true,
    mainSubjectIsPlaceOrLandscape: true,
    reason: '環礁の海岸線と礁湖が写っている',
    ...extra,
  });
  assert.ok(acceptedPlacePhoto(verdict({ showsCharacteristicScenery: true })));
  // An atoll's main road is a landscape of the place, but not what the place is known for.
  assert.ok(!acceptedPlacePhoto(verdict({ showsCharacteristicScenery: false })));
  // Answers without the new judgment are not accepted.
  assert.ok(!acceptedPlacePhoto(verdict({})));
  assert.ok(
    !acceptedPlacePhoto(verdict({ primarySubject: 'other', showsCharacteristicScenery: true })),
  );
});
test('fast search keeps the earlier photo rule, which accepts any landscape of the place', () => {
  const road = (extra: object = {}) => ({
    primarySubject: 'landscape',
    depictsIntendedPlace: true,
    mainSubjectIsPlaceOrLandscape: true,
    reason: '環礁の幹線道路が写っている',
    ...extra,
  });
  assert.ok(acceptedPlacePhoto(road(), true));
  assert.ok(!acceptedPlacePhoto(road()));
  assert.ok(!acceptedPlacePhoto(road({ depictsIntendedPlace: false }), true));
});
