import { readFile, writeFile, rename } from 'node:fs/promises';
import { verifyCommonsPages } from '../../lib/commons.ts';
import { imageEmbedding } from '../../lib/image-embedding.ts';
import { commonsVision } from '../../lib/vision.ts';
const writeJson = async (path, value) => {
  const temporary = path + '.' + process.pid + '.tmp';
  await writeFile(temporary, JSON.stringify(value, null, 2) + '\n');
  await rename(temporary, path);
};
const extras = JSON.parse(await readFile('data/extra-places.json', 'utf8'));
const manifest = JSON.parse(await readFile('data/commons-samples.json', 'utf8'));
const limit = Number(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || 60);
const pool = extras
  .filter(p => p.commonsTitle && !manifest.photos[p.id])
  .sort((a, b) => Number(Boolean(a.landform)) - Number(Boolean(b.landform)))
  .slice(0, limit);
const normalize = s => s.replaceAll('_', ' ').normalize('NFC');
let added = 0;
for (let offset = 0; offset < pool.length; offset += 20) {
  const batch = pool.slice(offset, offset + 20);
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: batch.map(p => 'File:' + p.commonsTitle).join('|'),
    prop: 'imageinfo|coordinates',
    iiprop: 'url|extmetadata|sha1|mime',
    iiurlwidth: '960',
    colimit: 'max',
  });
  const response = await fetch('https://commons.wikimedia.org/w/api.php?' + params, {
    headers: {
      'User-Agent': 'ElsewhereHackathon/0.1 (public geographic catalog; provenance retained)',
    },
    signal: AbortSignal.timeout(20000),
  });
  if (response.status === 429) {
    console.log('Stopped after HTTP 429; rerun after the Wikimedia cooldown.');
    break;
  }
  if (!response.ok) throw new Error('Commons ' + response.status);
  const pages = Object.values((await response.json()).query?.pages || {});
  for (let index = 0; index < batch.length; index += 2) {
    await Promise.all(
      batch.slice(index, index + 2).map(async p => {
        try {
          const photo = await verifyCommonsPages(
            p,
            pages.filter(page => normalize(page.title) === normalize('File:' + p.commonsTitle)),
          );
          if (!photo) {
            console.log(p.id, 'no verified photo');
            return;
          }
          await imageEmbedding(photo);
          await commonsVision(photo).catch(() => null);
          manifest.photos[p.id] = photo;
          Object.assign(p, {
            image: photo.thumbnailUrl,
            imagePage: photo.sourcePage,
            commonsPhoto: photo,
          });
          added++;
          console.log(p.id, photo.license, photo.title);
        } catch (e) {
          console.log(p.id, 'unavailable:', String(e.message).slice(0, 130));
        }
      }),
    );
    manifest.checkedAt = new Date().toISOString();
    await writeJson('data/commons-samples.json', manifest);
    await writeJson('data/extra-places.json', extras);
  }
}
console.log(JSON.stringify({ added, verifiedPhotos: Object.keys(manifest.photos).length }));
