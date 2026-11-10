/**
 * 評価用のケースを、公開中の写真検索と同じ処理で実行し、結果の順位と所要時間を記録します。
 * Google の有料 API を呼びます。`--limit=N` で件数を、`--ids=a,b` で対象のケースを絞れます。
 *
 * Google Maps の情報で代わりに探した結果（fallback）は、Google の利用規約に合わせて
 * 場所の ID を保存しません。写真検索として失敗した回数だけを記録します。
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { localCatalog } from '../lib/catalog.ts';
import { defaultSearchFilters } from '../lib/climate-types.ts';
import { runPhotoSearch } from '../lib/photo-search.ts';
import { searchPolicy } from '../lib/search-policy.ts';

const option = name => process.argv.find(value => value.startsWith(`--${name}=`))?.split('=')[1];
const limit = Number(option('limit') || 0);
const ids = option('ids')?.split(',').filter(Boolean);
const visualWeight = Number(option('weight') || 0.6);
if (!Number.isFinite(visualWeight) || visualWeight < 0 || visualWeight > 1)
  throw new Error('--weight must be between 0 and 1');

const queries = JSON.parse(await readFile('data/discovery-benchmark.json', 'utf8'));
const selected = queries.filter(query => !ids || ids.includes(query.id));
const targets = limit > 0 ? selected.slice(0, limit) : selected;
const catalog = await localCatalog();
const byId = new Map(catalog.map(place => [place.id, place]));
const { saveCosts } = searchPolicy();

const results = [];
for (const query of targets) {
  const source = byId.get(query.sourceId);
  if (!source) {
    console.log(query.id, 'skipped: source is not in the catalog');
    continue;
  }
  const started = performance.now();
  try {
    const result = await runPhotoSearch({
      source,
      preferences: query.preferences,
      destination: query.destination,
      visualWeight,
      filters: { ...defaultSearchFilters },
    });
    const fallback = result.visualSearch.mode !== 'visual';
    results.push({
      queryId: query.id,
      placeIds: fallback ? [] : result.places.map(place => place.id),
      latencyMs: Math.round(performance.now() - started),
      fallback,
      comparedCount: result.visualSearch.comparedCount,
    });
    console.log(query.id, fallback ? 'fallback' : result.places.map(place => place.id).join(','));
  } catch (error) {
    results.push({
      queryId: query.id,
      placeIds: [],
      latencyMs: Math.round(performance.now() - started),
      error: String(error.message).slice(0, 200),
    });
    console.log(query.id, 'error:', String(error.message).slice(0, 120));
  }
}

const recordedAt = new Date().toISOString();
const file = `.cache/evaluations/search-runs-${recordedAt.replace(/[:.]/g, '-')}.json`;
await mkdir('.cache/evaluations', { recursive: true });
await writeFile(file, `${JSON.stringify(results, null, 2)}\n`);
await writeFile(
  '.cache/evaluations/search-runs-latest.json',
  `${JSON.stringify(results, null, 2)}\n`,
);
console.log(
  JSON.stringify(
    {
      recordedAt,
      saveCosts,
      visualWeight,
      runs: results.length,
      fallback: results.filter(r => r.fallback).length,
      errors: results.filter(r => r.error).length,
      file,
      next: 'npm run eval:discovery -- --results=.cache/evaluations/search-runs-latest.json',
    },
    null,
    2,
  ),
);
