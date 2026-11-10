import { compareFactorEvidence } from './factor-types.ts';
import type { Place, Quality } from './places.ts';
import { qualitySignal } from './quality-score.ts';
export { qualitySignal } from './quality-score.ts';
const normal = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]/gu, '');
const destinationAliases: Record<string, string> = {
  世界中: 'world',
  アジア: 'Asia',
  ヨーロッパ: 'Europe',
  アフリカ: 'Africa',
  北米: 'North America',
  北アメリカ: 'North America',
  南米: 'South America',
  南アメリカ: 'South America',
  オセアニア: 'Oceania',
  seoul: 'ソウル',
  kyoto: '京都',
  tokyo: '東京',
  paris: 'パリ',
  london: 'ロンドン',
  osaka: '大阪',
  japan: '日本',
  korea: '韓国',
  germany: 'ドイツ',
  munich: 'ミュンヘン',
  amsterdam: 'アムステルダム',
};
export function matchesDestination(place: Place, destination: string) {
  const canonical = (value: string) => {
    const raw = value.trim();
    return destinationAliases[raw] || destinationAliases[raw.toLowerCase()] || raw;
  };
  const d = canonical(destination);
  if (!d || d === 'world') return true;
  if (
    [place.city, place.country, place.continent].some(
      value => normal(canonical(value)) === normal(d),
    )
  )
    return true;
  const names = [
    d,
    ...Object.keys(destinationAliases).filter(name => normal(canonical(name)) === normal(d)),
  ];
  return Boolean(
    place.address &&
    names.some(name => normal(name).length >= 2 && normal(place.address!).includes(normal(name))),
  );
}
export function samePlace(a: Place, b: Place) {
  return (
    a.id === b.id ||
    Boolean(a.placeId && b.placeId && a.placeId === b.placeId) ||
    (normal(a.name) === normal(b.name) &&
      Math.abs(a.lat - b.lat) < 0.2 &&
      Math.abs(a.lng - b.lng) < 0.2)
  );
}
/**
 * samePlace that also knows the source's other names. A place picked on Google Maps arrives as
 * 'マジュロ' while the catalog lists 'Majuro' a few kilometres away, so without the names the
 * source is verified as its own match and only dropped after Google resolves the results.
 */
export function sameAsSource(source: Place, names: readonly string[]) {
  const known = new Set(names.map(normal).filter(Boolean));
  return (p: Place) =>
    samePlace(source, p) ||
    (known.has(normal(p.name)) &&
      Math.abs(source.lat - p.lat) < 0.2 &&
      Math.abs(source.lng - p.lng) < 0.2);
}
export function cosineSimilarity(a: readonly number[], b: readonly number[]) {
  if (!a.length || a.length !== b.length || [...a, ...b].some(v => !Number.isFinite(v)))
    throw new Error('埋め込みの形式を確認できませんでした。');
  let dot = 0,
    aa = 0,
    bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  if (!aa || !bb) throw new Error('埋め込みを比較できませんでした。');
  return Math.max(-1, Math.min(1, dot / Math.sqrt(aa * bb)));
}
export function evidenceScore(
  cosine: number,
  quality: number,
  weight: number,
  vision: number | null,
  match: 'strong' | 'partial' | 'weak' | undefined,
) {
  let total = 0.55,
    value = (0.55 * (cosine + 1)) / 2;
  if (vision !== null) {
    total += 0.2;
    value += 0.2 * vision;
  }
  if (match) {
    total += 0.25;
    value += 0.25 * { strong: 1, partial: 0.5, weak: 0 }[match];
  }
  return (
    (Math.max(0, Math.min(1, weight)) * value) / total +
    (1 - Math.max(0, Math.min(1, weight))) * quality
  );
}
export const photoScenes = [
  'flowing_water',
  'inland_water',
  'coast',
  'reef_lagoon',
  'archipelago',
  'mountain',
  'plateau',
  'isolated_rock',
  'forest',
  'urban',
  'other',
] as const;
export function compatiblePhotoScenes(source: unknown, candidate: unknown) {
  if (
    !photoScenes.includes(source as (typeof photoScenes)[number]) ||
    !photoScenes.includes(candidate as (typeof photoScenes)[number]) ||
    source === 'other' ||
    candidate === 'other'
  )
    return true;
  if (source === candidate) return true;
  const coastal = new Set(['coast', 'reef_lagoon', 'archipelago']);
  return coastal.has(String(source)) && coastal.has(String(candidate));
}
/**
 * Order candidates for photo verification by photo similarity alone. Verification rejects
 * scenes that do not look alike, and embedding cosines sit in a narrow band, so ordering by
 * the blended score lets well-profiled places with high feature scores take the whole
 * verification budget even when their photos are unrelated. The blended score still orders
 * the verified results.
 */
export function verificationOrder<T extends Place & { cosine: number }>(ranked: T[]) {
  return [...ranked].sort(
    (a, b) => compareFactorEvidence(a, b) || b.cosine - a.cosine || a.id.localeCompare(b.id),
  );
}
export function rankVisualPlaces(
  source: Place,
  candidates: Place[],
  vectors: Map<string, number[]>,
  sourceVector: number[],
  preferences: Quality[],
  destination: string,
  weight = 0.6,
  cosines?: Map<string, number>,
) {
  const visualWeight = Math.max(0, Math.min(1, weight));
  return candidates
    .filter(p => !samePlace(source, p) && matchesDestination(p, destination) && vectors.has(p.id))
    .map(p => {
      const cosine = cosines?.get(p.id) ?? cosineSimilarity(sourceVector, vectors.get(p.id)!);
      return {
        ...p,
        cosine,
        score:
          (visualWeight * (cosine + 1)) / 2 +
          (1 - visualWeight) * qualitySignal(source, p, preferences),
      };
    })
    .sort((a, b) => compareFactorEvidence(a, b) || b.score - a.score || a.id.localeCompare(b.id));
}
