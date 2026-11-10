import { readFile, readdir, mkdir, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { localCatalog } from '../../lib/catalog.ts';
import { lookupCommonsPhotos, eligibleLicense } from '../../lib/commons.ts';
import { imageEmbedding, embeddingModel } from '../../lib/image-embedding.ts';
import { googleProject } from '../../lib/google-auth.ts';

const refresh = process.argv.includes('--refresh');
const option = name => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
// --below=N は、準備済みの写真が N 枚未満の地点だけを Commons で探し直す（--missing は --below=1）。
const below = process.argv.includes('--missing') ? 1 : Number(option('below') || 0);
const views = Number(option('views') || 3);
// --refresh は Commons・Gemini・埋め込みを呼ぶので件数を抑える。索引の再構築は全地点を対象にする。
const limit = Number(option('limit') || (refresh ? 500 : 5000));
if (!Number.isInteger(limit) || limit < 1 || limit > 5000)
  throw new Error('--limit must be between 1 and 5000');
if (!Number.isInteger(views) || views < 1 || views > 5) throw new Error('--views must be 1-5');
const catalog = await localCatalog();
const manifest = JSON.parse(await readFile('data/commons-samples.json', 'utf8'));
manifest.photoSets ??= {};
// 写真が見つからなかった地点は30日間探し直さない。
manifest.photoChecks ??= {};
const recheckAfterMs = 30 * 86400000;
const photoCount = place =>
  new Set(
    [manifest.photos[place.id], ...(manifest.photoSets[place.id] || [])]
      .filter(Boolean)
      .map(photo => photo.sha1),
  ).size;
const saveManifest = async () => {
  await writeFile('data/commons-samples.json.tmp', JSON.stringify(manifest, null, 2) + '\n');
  await rename('data/commons-samples.json.tmp', 'data/commons-samples.json');
};
if (refresh) {
  const targets = catalog
    .filter(
      place =>
        !below ||
        (photoCount(place) < below &&
          !(Date.now() - Date.parse(manifest.photoChecks[place.id] || '') < recheckAfterMs)),
    )
    .slice(0, limit);
  let checked = 0,
    found = 0,
    throttled = 0;
  // Commons の負荷を抑えるため、地点の間を空ける。HTTP 429 では待ってから同じ地点をやり直す。
  const pace = Number(option('pace') || 2000);
  const sleep = ms => new Promise(done => setTimeout(done, ms));
  for (let i = 0; i < targets.length; i++) {
    const place = targets[i];
    try {
      const photos = await lookupCommonsPhotos(place, views);
      for (const photo of photos) await imageEmbedding(photo);
      if (photos.length) {
        manifest.photoSets[place.id] = photos;
        delete manifest.photoChecks[place.id];
        found++;
      } else manifest.photoChecks[place.id] = new Date().toISOString();
      throttled = 0;
    } catch (error) {
      const message = String(error.message);
      if (/HTTP 429|待機中/.test(message)) {
        if (++throttled > 5) {
          console.log('Stopped after repeated HTTP 429; rerun later to continue.');
          break;
        }
        console.log(`HTTP 429 at ${place.id}; waiting ${throttled * 2} min before retrying.`);
        await saveManifest();
        await sleep(throttled * 120000);
        i--;
        continue;
      }
      console.log(place.id, message.slice(0, 100));
    }
    checked++;
    if (checked % 10 === 0) {
      await saveManifest();
      console.log(JSON.stringify({ checked, of: targets.length, found }));
    }
    await sleep(pace);
  }
  await saveManifest();
  console.log(JSON.stringify({ checked, of: targets.length, found }));
}
const entries = [];
for (const name of await readdir('.cache/commons-embeddings').catch(() => []))
  try {
    const entry = JSON.parse(await readFile(resolve('.cache/commons-embeddings', name), 'utf8'));
    if (
      entry.schema === 1 &&
      entry.model === embeddingModel() &&
      entry.project === googleProject() &&
      entry.dimensions === 768 &&
      entry.values?.length === 768 &&
      entry.values.every(Number.isFinite) &&
      entry.photo?.verified &&
      eligibleLicense(entry.photo)
    )
      entries.push(entry);
  } catch {}
let places = {};
try {
  const previous = JSON.parse(await readFile('.cache/photo-index-v1.json', 'utf8'));
  if (
    previous.schema === 1 &&
    previous.project === googleProject() &&
    previous.model === embeddingModel()
  )
    places = { ...previous.places };
} catch {}
for (const place of catalog) {
  const photos = [manifest.photos[place.id], ...(manifest.photoSets[place.id] || [])].filter(
      Boolean,
    ),
    seen = new Set();
  places[place.id] = photos
    .flatMap(photo => {
      if (seen.has(photo.sha1)) return [];
      seen.add(photo.sha1);
      const entry = entries.find(
        e => e.photo.pageId === photo.pageId && e.photo.sha1 === photo.sha1,
      );
      return entry ? [{ photo, vector: entry.values, bytesSha256: entry.bytesSha256 }] : [];
    })
    .slice(0, 5);
}
await mkdir('.cache', { recursive: true });
const index = {
  schema: 1,
  model: embeddingModel(),
  project: googleProject(),
  dimensions: 768,
  createdAt: new Date().toISOString(),
  places,
};
await writeFile('.cache/photo-index-v1.json.tmp', JSON.stringify(index));
await rename('.cache/photo-index-v1.json.tmp', '.cache/photo-index-v1.json');
console.log(
  JSON.stringify({
    preparedPlaces: Object.values(places).filter(p => p.length).length,
    preparedPhotos: Object.values(places).reduce((sum, p) => sum + p.length, 0),
    refresh,
  }),
);
