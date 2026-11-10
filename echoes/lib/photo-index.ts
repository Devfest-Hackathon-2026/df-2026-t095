import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { eligibleLicense } from './commons.ts';
import { cosineSimilarity } from './visual-ranking.ts';
import { embeddingModel } from './image-embedding.ts';
import { googleProject } from './google-auth.ts';
import type { CommonsPhoto } from './visual-types.ts';
export type IndexedPhoto = { photo: CommonsPhoto; vector: number[]; bytesSha256: string };
export type PhotoIndex = {
  schema: 1;
  model: string;
  project: string;
  dimensions: 768;
  createdAt?: string;
  places: Record<string, IndexedPhoto[]>;
};
let cached: { mtime: number; expiresAt: number; value: PhotoIndex } | undefined;
export async function preparedPhotoIndex(): Promise<PhotoIndex | null> {
  try {
    const file = resolve(process.cwd(), '.cache/photo-index-v1.json'),
      meta = await stat(file);
    if (cached?.mtime === meta.mtimeMs && cached.expiresAt > Date.now()) return cached.value;
    const data = JSON.parse(await readFile(file, 'utf8')) as PhotoIndex;
    const expiresAt = Date.parse(data.createdAt || '') + 7 * 86400000;
    if (
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now() ||
      data.schema !== 1 ||
      data.model !== embeddingModel() ||
      data.project !== googleProject() ||
      data.dimensions !== 768 ||
      !data.places
    )
      return null;
    const places: PhotoIndex['places'] = {};
    for (const [id, photos] of Object.entries(data.places)) {
      if (!Array.isArray(photos)) continue;
      places[id] = photos.filter(
        p =>
          p?.photo?.provider === 'commons' &&
          p.photo.verified &&
          eligibleLicense(p.photo) &&
          /^[a-f0-9]{64}$/.test(p.bytesSha256) &&
          p.vector?.length === 768 &&
          p.vector.every(Number.isFinite) &&
          p.vector.some(v => v !== 0),
      );
    }
    const value = { ...data, places };
    cached = { mtime: meta.mtimeMs, expiresAt, value };
    return value;
  } catch {
    return null;
  }
}
export function matchIndexedPhotos(
  vector: number[],
  photos: IndexedPhoto[],
  limit: number,
  exclude?: CommonsPhoto,
) {
  const seen = new Set<string>();
  const ranked = photos
    .filter(p => {
      if (
        (exclude && (p.photo.pageId === exclude.pageId || p.photo.sha1 === exclude.sha1)) ||
        seen.has(p.photo.sha1)
      )
        return false;
      seen.add(p.photo.sha1);
      return p.vector.length === vector.length;
    })
    .slice(0, limit)
    .map(p => ({ ...p, cosine: cosineSimilarity(vector, p.vector) }))
    .sort((a, b) => b.cosine - a.cosine);
  if (!ranked.length) return null;
  // Require support from a second view when available; do not average vectors into a fictitious photo.
  const support = ranked.slice(0, 2);
  return {
    ...ranked[0],
    cosine: support.reduce((sum, p) => sum + p.cosine, 0) / support.length,
    photoCount: ranked.length,
  };
}
