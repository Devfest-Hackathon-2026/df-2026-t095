import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { SearchFilters } from './climate-types.ts';
import type { Place } from './places.ts';
import type { PlaceFactors, FactorKey, FactorMatch } from './factor-types.ts';

type Country = { iso2: string; name: string; factors: PlaceFactors };
let dataset: Promise<{ countries: Country[] }> | undefined;
async function countries(): Promise<{ countries: Country[] }> {
  return (dataset ??= readFile(resolve(process.cwd(), 'data/place-factors.json'), 'utf8')
    .then(JSON.parse)
    .catch(() => ({ countries: [] })));
}
export async function enrichPlaceFactors(place: Place): Promise<Place> {
  if (place.locationUnknown) return { ...place, factors: {} };
  const data = await countries();
  const display = new Intl.DisplayNames(['ja'], { type: 'region' });
  const country = data.countries.find(c =>
    place.countryCode
      ? c.iso2 === place.countryCode
      : display.of(c.iso2) === place.country ||
        c.name.toLowerCase() === place.country.toLowerCase(),
  );
  return { ...place, factors: country?.factors || {} };
}
export function matchPlaceFactors(place: Place, filters: SearchFilters): FactorMatch | null {
  const selected: FactorKey[] = [];
  if (filters.population && filters.population !== 'any') selected.push('populationDensity');
  if (filters.waterQuality) selected.push('waterQuality');
  if (filters.lowHomicide) selected.push('homicideRate');
  const matched: FactorKey[] = [],
    unknown: FactorKey[] = [];
  for (const key of selected) {
    const observation = place.factors?.[key];
    if (!observation || !Number.isFinite(observation.value) || observation.year < 2020) {
      unknown.push(key);
      continue;
    }
    const n = observation.value;
    const fits =
      key === 'populationDensity'
        ? filters.population === 'low'
          ? n < 100
          : n >= 500
        : key === 'waterQuality'
          ? n >= 80
          : n < 3;
    if (!fits) return null;
    matched.push(key);
  }
  if (unknown.length && filters.unknownData === 'exclude') return null;
  return { matched, unknown };
}
