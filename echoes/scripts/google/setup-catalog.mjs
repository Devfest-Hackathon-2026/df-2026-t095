import { cloudHeaders, googleProject } from '../../lib/google-auth.ts';
import { bqDataset, bqLocation, bqTable, queryBigQuery, bqString } from '../../lib/bigquery.ts';
import { places } from '../../lib/places.ts';
import { readFile, readdir } from 'node:fs/promises';
const root = `https://bigquery.googleapis.com/bigquery/v2/projects/${googleProject()}`;
const response = await fetch(root + '/datasets', {
  method: 'POST',
  headers: await cloudHeaders(),
  body: JSON.stringify({
    datasetReference: { projectId: googleProject(), datasetId: bqDataset() },
    location: bqLocation(),
    description:
      'Elsewhere: reusable public geographic catalog and licensed Commons embeddings. No user uploads or Google Maps content.',
  }),
});
if (!response.ok && response.status !== 409) throw new Error(`BigQuery dataset ${response.status}`);
await queryBigQuery(
  `CREATE TABLE IF NOT EXISTS ${bqTable('places')} (id STRING NOT NULL, place_json STRING NOT NULL, updated_at TIMESTAMP) CLUSTER BY id`,
);
await queryBigQuery(
  `CREATE TABLE IF NOT EXISTS ${bqTable('commons_embeddings')} (id STRING NOT NULL, place_id STRING, model STRING, image_sha1 STRING, bytes_sha256 STRING, embedding ARRAY<FLOAT64>, photo_json STRING, updated_at TIMESTAMP) CLUSTER BY place_id, model`,
);
let extras = [];
try {
  extras = JSON.parse(await readFile('data/extra-places.json', 'utf8'));
} catch {}
const catalog = [...places, ...extras];
const records = catalog.map(p => ({ id: p.id, place_json: JSON.stringify(p) }));
await queryBigQuery(
  `MERGE ${bqTable('places')} T USING (SELECT JSON_VALUE(x,'$.id') id,JSON_VALUE(x,'$.place_json') place_json FROM UNNEST(JSON_QUERY_ARRAY(@records)) x) S ON T.id=S.id WHEN MATCHED THEN UPDATE SET place_json=S.place_json,updated_at=CURRENT_TIMESTAMP() WHEN NOT MATCHED THEN INSERT (id,place_json,updated_at) VALUES(S.id,S.place_json,CURRENT_TIMESTAMP())`,
  [bqString('records', JSON.stringify(records))],
);
const samples = JSON.parse(await readFile('data/commons-samples.json', 'utf8')).photos;
let count = 0;
for (const file of await readdir('.cache/commons-embeddings')) {
  if (!file.endsWith('.json')) continue;
  const data = JSON.parse(await readFile('.cache/commons-embeddings/' + file, 'utf8'));
  const photo = data.photo;
  if (
    photo?.provider !== 'commons' ||
    !photo.verified ||
    !Array.isArray(data.values) ||
    data.values.length !== 768
  )
    continue;
  const match = Object.entries(samples).find(([, p]) => p.pageId === photo.pageId);
  const record = {
    id: file.slice(0, -5),
    place_id: match?.[0] || `commons-${photo.pageId}`,
    model: data.model,
    image_sha1: photo.sha1,
    bytes_sha256: data.bytesSha256,
    embedding: data.values,
    photo_json: JSON.stringify(photo),
  };
  await queryBigQuery(
    `MERGE ${bqTable('commons_embeddings')} T USING (SELECT JSON_VALUE(@record,'$.id') id) S ON T.id=S.id WHEN NOT MATCHED THEN INSERT (id,place_id,model,image_sha1,bytes_sha256,embedding,photo_json,updated_at) VALUES(S.id,JSON_VALUE(@record,'$.place_id'),JSON_VALUE(@record,'$.model'),JSON_VALUE(@record,'$.image_sha1'),JSON_VALUE(@record,'$.bytes_sha256'),ARRAY(SELECT CAST(x AS FLOAT64) FROM UNNEST(JSON_VALUE_ARRAY(@record,'$.embedding')) x),JSON_VALUE(@record,'$.photo_json'),CURRENT_TIMESTAMP())`,
    [bqString('record', JSON.stringify(record))],
  );
  count++;
}
console.log(
  JSON.stringify({
    dataset: `${googleProject()}.${bqDataset()}`,
    location: bqLocation(),
    places: records.length,
    commonsEmbeddings: count,
  }),
);
