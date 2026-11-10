import { test } from 'node:test';
import assert from 'node:assert/strict';
import { places, type Place } from '../lib/places.ts';
import {
  parseTerrainSearchArea,
  shortlistTerrainSamples,
  terrainDiscovery,
} from '../lib/terrain-discovery.ts';
import {
  terrainSimilarity,
  validTerrainRecord,
  type TerrainRecord,
} from '../lib/terrain-ranking.ts';
import { regionAround, moveRegion, regionMetrics } from '../lib/geo-region.ts';
const source = places[0],
  seoul = places.find(p => p.id === 'seoul')!;
const climate = (code: string) => ({
  code,
  label: code,
  period: '1991–2020',
  source: 'test',
  nearby: false,
});
const record = (id: string, lat = 0, lng = 0): TerrainRecord => ({
  id,
  lat,
  lng,
  vector: [1, ...Array(63).fill(0)],
  coverage: 1,
  elevation: 10,
  slope: 1,
  relief: 10,
  water: 10,
  methodVersion: 3,
  regionKey: JSON.stringify({ radiusMeters: 100 }),
});
test('terrain live-search bounds reject invalid or unbounded requests', () => {
  assert.equal(parseTerrainSearchArea(undefined, source).radiusKm, 500);
  for (const input of [
    null,
    { lat: NaN, lng: 0, radiusKm: 500 },
    { lat: 0, lng: 181, radiusKm: 500 },
    { lat: 0, lng: 0, radiusKm: 149 },
    { lat: 0, lng: 0, radiusKm: 1001 },
  ])
    assert.throws(() => parseTerrainSearchArea(input, source));
});
test('terrain sample shortlist rejects near-source, out-of-area, malformed and adjacent matches', () => {
  const start = { ...source, lat: 0, lng: 0 },
    area = { lat: 0, lng: 0, radiusKm: 500 };
  const feature = (lat: number, lng: number) => ({
    geometry: { coordinates: [lng, lat] },
    properties: { similarity: 0.9 },
  });
  assert.deepEqual(
    shortlistTerrainSamples(
      start,
      [
        feature(0, 0),
        feature(0, 2),
        feature(0, 2.1),
        feature(0, 4),
        feature(0, 20),
        feature(NaN, 0),
      ],
      area,
    ),
    [
      { lat: 0, lng: 2 },
      { lat: 0, lng: 4 },
    ],
  );
});
test('terrain ranking uses spatial layout and available physical measurements', () => {
  const x = [1, ...Array(63).fill(0)],
    y = [0, 1, ...Array(62).fill(0)];
  const a = { ...record('a'), patches: [x, x, x, x, y, x, x, x, x] },
    same = { ...record('same'), patches: [x, x, x, x, y, x, x, x, x] },
    different = {
      ...record('different'),
      patches: [y, y, y, y, x, y, y, y, y],
      water: 100,
      elevation: 2000,
    };
  assert.ok(terrainSimilarity(a, same) > terrainSimilarity(a, different));
  assert.ok(!validTerrainRecord({ ...a, vector: Array(64).fill(0) }));
  assert.ok(!validTerrainRecord({ ...a, coverage: 0 }));
});
test('terrain live discovery works without registered candidates and compares regions before returning them', async () => {
  const start = { ...source, lat: 0, lng: 0, climate: climate('Af') };
  let compared = false;
  const deps = {
    records: async (regions: { id: string; lat: number; lng: number }[]) =>
      regions.map(r => {
        if (r.id.startsWith('satellite-')) compared = true;
        return record(r.id, r.lat, r.lng);
      }),
    search: async () => ({
      features: [{ geometry: { coordinates: [2, 0] }, properties: { similarity: 0.9 } }],
    }),
    locate: async (p: Place) => p,
    filter: async (s: Place, pool: Place[]) => ({
      source: s,
      places: pool,
      filters: { climate: 'any', lessVisited: false },
    }),
  };
  const result = await terrainDiscovery(
    start,
    [],
    [],
    'lagoon',
    'world',
    { climate: 'any', lessVisited: false },
    regionAround(0, 0, 1),
    { lat: 0, lng: 0, radiusKm: 500 },
    deps,
  );
  assert.ok(compared);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].origin, 'live');
  assert.equal(result.candidates[0].vector, undefined);
  assert.equal(result.candidates[0].patches, undefined);
  assert.ok(result.candidates[0].distanceKm >= 100);
});
test('terrain search failure preserves registered results and explicitly reports the fallback', async () => {
  const start = { ...source, lat: 0, lng: 0 },
    candidate = { ...seoul, lat: 0, lng: 2, landform: 'lagoon' };
  const deps = {
    records: async () => [record(start.id)],
    search: async () => {
      throw new Error('timeout');
    },
    locate: async (p: Place) => p,
    filter: async (s: Place, pool: Place[]) => ({
      source: s,
      places: pool,
      filters: { climate: 'any', lessVisited: false },
    }),
  };
  const result = await terrainDiscovery(
    start,
    [candidate],
    [record(candidate.id, 0, 2)],
    'lagoon',
    'world',
    { climate: 'any', lessVisited: false },
    undefined,
    { lat: 0, lng: 0, radiusKm: 500 },
    deps,
  );
  assert.equal(result.candidates[0].origin, 'catalog');
  assert.match(result.liveNote!, /完了できなかった/);
});

test('live terrain candidates retain climate and country filters instead of broadening after discovery', async () => {
  const start = { ...source, lat: 0, lng: 0, climate: climate('Af') };
  let located = false,
    hasRegion = false;
  const deps = {
    records: async (regions: { id: string; lat: number; lng: number }[]) =>
      regions.map(r => record(r.id, r.lat, r.lng)),
    search: async () => ({
      features: [{ geometry: { coordinates: [2, 0] }, properties: { similarity: 0.9 } }],
    }),
    locate: async (p: Place) => {
      located = true;
      return { ...p, country: '日本', countryCode: 'JP', climate: climate('Cfa') };
    },
    filter: async (s: Place, pool: Place[], filters: { climate: string; lessVisited: boolean }) => {
      if (pool.some(p => p.id.startsWith('satellite-')))
        hasRegion = Boolean(pool[0].referenceRegion);
      return {
        source: s,
        places: pool.filter(p => p.climate?.code === 'Af' && p.countryCode !== 'JP'),
        filters,
      };
    },
  };
  const result = await terrainDiscovery(
    start,
    [],
    [],
    'atoll',
    'world',
    { climate: 'same', lessVisited: true },
    regionAround(0, 0, 1),
    { lat: 0, lng: 0, radiusKm: 500 },
    deps,
  );
  assert.ok(located);
  assert.ok(hasRegion);
  assert.equal(result.candidates.length, 0);
  assert.equal(result.liveCandidateCount, 0);
});

test('terrain candidate windows preserve both physical dimensions when moved to another latitude', () => {
  const original = { north: 35.05, south: 34.95, east: 135.15, west: 134.85 };
  const a = regionMetrics(original),
    b = regionMetrics(moveRegion(original, 60, 15));
  assert.ok(Math.abs(a.widthKm - b.widthKm) < 1e-7);
  assert.ok(Math.abs(a.heightKm - b.heightKm) < 1e-7);
  assert.throws(() => moveRegion(original, 35, 179.99));
});

test('registered terrain is recomputed at the reference extent instead of mixing region sizes', async () => {
  const start = { ...source, lat: 0, lng: 0 },
    candidate = { ...seoul, lat: 20, lng: 2, landform: 'lagoon' };
  const reference = regionAround(0, 0, 4);
  let matched = false;
  const deps = {
    records: async (
      regions: { id: string; lat: number; lng: number; region?: ReturnType<typeof regionAround> }[],
    ) =>
      regions.map(r => {
        if (r.id === candidate.id) {
          matched = true;
          const extent = regionMetrics(r.region!);
          assert.ok(Math.abs(extent.widthKm - regionMetrics(reference).widthKm) < 1e-6);
        }
        return record(r.id, r.lat, r.lng);
      }),
    search: async () => ({ features: [] }),
    locate: async (p: Place) => p,
    filter: async (s: Place, pool: Place[]) => ({
      source: s,
      places: pool,
      filters: { climate: 'any', lessVisited: false },
    }),
  };
  await terrainDiscovery(
    start,
    [candidate],
    [record(candidate.id, 20, 2)],
    'lagoon',
    'world',
    { climate: 'any', lessVisited: false },
    reference,
    undefined,
    deps,
  );
  assert.ok(matched);
});
