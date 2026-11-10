import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { places, type Place } from './places.ts';
import { bqTable, queryBigQuery } from './bigquery.ts';
let pending: Promise<{ places: Place[]; provider: 'bigquery' | 'local' }> | undefined;
let cached:
  { until: number; value: { places: Place[]; provider: 'bigquery' | 'local' } } | undefined;
export function mergePlaceCatalog(local: Place[], remote: Place[]) {
  return [...new Map([...remote, ...local].map(p => [p.id, p])).values()];
}
export async function localCatalog() {
  let extra: Place[] = [];
  try {
    extra = JSON.parse(await readFile(resolve(process.cwd(), 'data/extra-places.json'), 'utf8'));
  } catch {}
  return [...places, ...extra];
}
export async function candidateCatalog() {
  if (process.env.BIGQUERY_ENABLED !== 'true')
    return { places: await localCatalog(), provider: 'local' as const };
  if (cached && cached.until > Date.now()) return cached.value;
  if (pending) return pending;
  pending = (async () => {
    try {
      const rows = await queryBigQuery(
        `SELECT id,place_json FROM ${bqTable('places')} ORDER BY id LIMIT 5000`,
      );
      const parsed = rows
        .map(r => JSON.parse(String(r.place_json)) as Place)
        .filter(
          p =>
            p.id &&
            p.name &&
            Number.isFinite(p.lat) &&
            Number.isFinite(p.lng) &&
            !p.placeId &&
            typeof p.image === 'string' &&
            !p.image.includes('googleapis.com'),
        );
      if (!parsed.length) throw new Error('empty catalog');
      const value = {
        places: mergePlaceCatalog(await localCatalog(), parsed),
        provider: 'bigquery' as const,
      };
      cached = { until: Date.now() + 60000, value };
      return value;
    } catch {
      const value = { places: await localCatalog(), provider: 'local' as const };
      cached = { until: Date.now() + 15000, value };
      return value;
    }
  })();
  try {
    return await pending;
  } finally {
    pending = undefined;
  }
}
