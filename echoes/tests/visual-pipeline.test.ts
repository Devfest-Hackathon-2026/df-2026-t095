import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyInBatches } from '../lib/visual-verification.ts';
import { matchIndexedPhotos, type IndexedPhoto } from '../lib/photo-index.ts';
import { samplePhoto } from '../lib/commons.ts';
import { places } from '../lib/places.ts';
import { visualDiscovery } from '../lib/visual-discovery.ts';

test('verification reaches a good seventh candidate and stops at its configured budget', async () => {
  const seen: number[] = [];
  const checked = await verifyInBatches(
    Array.from({ length: 20 }, (_, i) => i + 1),
    async n => {
      seen.push(n);
      return { n, good: n > 6 };
    },
    { batchSize: 3, maxChecks: 9, target: 3, verified: r => r.good },
  );
  assert.deepEqual(
    checked.filter(r => r.good).map(r => r.n),
    [7, 8, 9],
  );
  assert.equal(seen.length, 9);
  let calls = 0;
  await verifyInBatches(
    Array(20).fill(0),
    async () => {
      calls++;
      return false;
    },
    { batchSize: 4, maxChecks: 6, target: 3, verified: Boolean },
  );
  assert.equal(calls, 6);
});
test('multiple independent photos support a place match and identical/source photos cannot count twice', async () => {
  const photo = (await samplePhoto(places[0]))!;
  const entry = (id: number, vector: number[]): IndexedPhoto => ({
    photo: { ...photo, pageId: id, sha1: String(id) },
    vector,
    bytesSha256: 'a'.repeat(64),
  });
  const match = matchIndexedPhotos(
    [1, 0],
    [entry(1, [1, 0]), entry(2, [0, 1]), entry(2, [0, 1])],
    3,
  );
  assert.equal(match?.photoCount, 2);
  assert.equal(match?.cosine, 0.5);
  assert.equal(match?.photo.pageId, 1);
  assert.equal(matchIndexedPhotos([1, 0], [entry(1, [1, 0])], 3, entry(1, [1, 0]).photo), null);
});
test('prepared candidate vectors avoid per-candidate embedding and photo lookup calls', async () => {
  const source = places[0],
    candidate = places[1],
    photo = (await samplePhoto(candidate))!,
    sourcePhoto = (await samplePhoto(source))!;
  let lookup = 0,
    embedding = 0;
  const result = await visualDiscovery(source, ['water'], 'world', 1, {
    collection: async () => ({ places: [candidate], provider: 'local' }),
    photo: async () => {
      lookup++;
      return sourcePhoto;
    },
    embed: async () => {
      embedding++;
      return [1, ...Array(767).fill(0)];
    },
    prepared: async () => ({
      schema: 1,
      model: 'gemini-embedding-2',
      project: 'test',
      dimensions: 768,
      places: {
        [candidate.id]: [
          { photo, vector: [1, ...Array(767).fill(0)], bytesSha256: 'a'.repeat(64) },
        ],
      },
    }),
  });
  assert.equal(result.visualSearch.preparedCount, 1);
  assert.equal(result.places[0].id, candidate.id);
  assert.equal(lookup, 1);
  assert.equal(embedding, 1);
});
