import { readFile, writeFile } from 'node:fs/promises';
import { lookupCommonsPhoto } from '../../lib/commons.ts';
import { imageEmbedding } from '../../lib/image-embedding.ts';
import { commonsVision } from '../../lib/vision.ts';
const extras = JSON.parse(await readFile('data/extra-places.json', 'utf8'));
const manifest = JSON.parse(await readFile('data/commons-samples.json', 'utf8'));
for (let i = 0; i < extras.length; i += 2) {
  await Promise.all(
    extras.slice(i, i + 2).map(async p => {
      if (p.commonsPhoto?.verified) return;
      try {
        const photo = await lookupCommonsPhoto(p);
        if (!photo) {
          console.log(p.id, 'no verified photo');
          return;
        }
        manifest.photos[p.id] = photo;
        p.image = photo.thumbnailUrl;
        p.imagePage = photo.sourcePage;
        p.commonsPhoto = photo;
        console.log(p.id, photo.license, photo.title);
        await Promise.all([imageEmbedding(photo), commonsVision(photo).catch(() => null)]);
      } catch (e) {
        console.log(p.id, 'unavailable:', String(e.message).slice(0, 130));
      }
    }),
  );
  await new Promise(r => setTimeout(r, 2000));
  await writeFile('data/commons-samples.json', JSON.stringify(manifest, null, 2) + '\n');
  await writeFile('data/extra-places.json', JSON.stringify(extras, null, 2) + '\n');
}
console.log('verified photos', Object.keys(manifest.photos).length);
