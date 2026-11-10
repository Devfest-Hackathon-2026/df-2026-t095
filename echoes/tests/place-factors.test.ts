import { test } from 'node:test';
import assert from 'node:assert/strict';
import { places } from '../lib/places.ts';
import { matchPlaceFactors, enrichPlaceFactors } from '../lib/place-factors.ts';
import { compareFactorEvidence } from '../lib/factor-types.ts';
import { parseSearchFilters } from '../lib/climate-types.ts';
import { filtersFromParams, filtersToParams } from '../lib/search-params.ts';
const source = places[0];
const observation = (value: number, year = 2023) => ({
  value,
  year,
  source: 'https://data.worldbank.org',
  scope: 'country' as const,
  unit: 'test',
});
test('known failures are excluded, unknowns retained after verified matches, and old values are unknown', () => {
  const filters = {
    climate: 'any',
    lessVisited: false,
    population: 'low' as const,
    waterQuality: true,
    lowHomicide: true,
  };
  const verified = {
    ...source,
    factors: {
      populationDensity: observation(50),
      waterQuality: observation(90),
      homicideRate: observation(1),
    },
  };
  const good = matchPlaceFactors(verified, filters)!;
  assert.equal(good.unknown.length, 0);
  const unknown = matchPlaceFactors({ ...source, factors: {} }, filters)!;
  assert.equal(unknown.unknown.length, 3);
  assert.ok(compareFactorEvidence({ factorMatch: good }, { factorMatch: unknown }) < 0);
  assert.equal(
    matchPlaceFactors(
      { ...verified, factors: { ...verified.factors, homicideRate: observation(8) } },
      filters,
    ),
    null,
  );
  assert.equal(
    matchPlaceFactors({ ...source, factors: {} }, { ...filters, unknownData: 'exclude' }),
    null,
  );
  assert.deepEqual(
    matchPlaceFactors(
      { ...source, factors: { waterQuality: observation(99, 2017) } },
      { climate: 'any', lessVisited: false, waterQuality: true },
    )?.unknown,
    ['waterQuality'],
  );
});
test('factor filters validate input and survive shared URL round trips', () => {
  const filters = parseSearchFilters({
    climate: 'Cfa',
    lessVisited: true,
    population: 'low',
    waterQuality: true,
    lowHomicide: true,
    unknownData: 'include',
  });
  assert.deepEqual(filtersFromParams(filtersToParams(new URLSearchParams(), filters)), filters);
  for (const bad of [
    { ...filters, lowHomicide: 'true' },
    { ...filters, population: 'rural' },
    { ...filters, unknownData: 'ignore' },
  ])
    assert.throws(() => parseSearchFilters(bad));
});
test('official country observations retain their dates and unknown locations receive no invented data', async () => {
  const jp = await enrichPlaceFactors({ ...source, countryCode: 'JP' });
  assert.ok(jp.factors?.populationDensity?.value);
  assert.equal(jp.factors?.populationDensity?.scope, 'country');
  assert.ok(jp.factors!.populationDensity!.year >= 2020);
  const unknown = await enrichPlaceFactors({ ...source, locationUnknown: true });
  assert.deepEqual(unknown.factors, {});
});
