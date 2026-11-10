import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { evaluationReport } from '../lib/discovery-evaluation.ts';
import { localCatalog } from '../lib/catalog.ts';
import { rankPlaces, diverseResults } from '../lib/discovery.ts';
const queries = JSON.parse(await readFile('data/discovery-benchmark.json', 'utf8'));
const argument = process.argv.find(a => a.startsWith('--results='));
let results = [];
if (argument) results = JSON.parse(await readFile(argument.slice('--results='.length), 'utf8'));
else {
  const catalog = await localCatalog();
  results = queries.flatMap(q => {
    const source = catalog.find(p => p.id === q.sourceId);
    if (!source) return [];
    const start = performance.now();
    const ranked = diverseResults(rankPlaces(source, q.preferences, q.destination, catalog));
    return [
      {
        queryId: q.id,
        placeIds: ranked.map(p => p.id),
        latencyMs: performance.now() - start,
        costUsd: 0,
      },
    ];
  });
}
const report = {
  ...evaluationReport(queries, results, process.argv.includes('--include-provisional')),
  pipeline: argument
    ? 'recorded search results'
    : 'offline feature-ranking baseline; no image or live API evaluation',
};
await mkdir('.cache/evaluations', { recursive: true });
await writeFile('.cache/evaluations/discovery.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, rows: undefined }, null, 2));
