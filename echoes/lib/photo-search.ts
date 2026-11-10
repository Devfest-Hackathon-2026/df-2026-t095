import { createHash } from 'node:crypto';
import type { SearchFilters } from './climate-types.ts';
import { googleDiscover } from './google.ts';
import { preparedPhotoIndex } from './photo-index.ts';
import { applyAtmosphereScenery } from './photo-scenery.ts';
import type { Place, Quality } from './places.ts';
import { createLruCache } from './search-cache.ts';
import { environmentFilter, lessVisitedCountryNames } from './search-filters.ts';
import { searchPolicy } from './search-policy.ts';
import {
  applyMapsFallback,
  fastDeps,
  visualDiscovery,
  type VisualSearchResult,
} from './visual-discovery.ts';

export type PhotoSearchInput = {
  source: Place;
  preferences: Quality[];
  destination: string;
  visualWeight: number;
  filters: SearchFilters;
  /** Fast search: the earlier, quicker engine steps (see fastDeps). */
  fast?: boolean;
};

/** 写真検索の本体。API と評価用の記録で同じ処理を使う。Google Places での補完は含めない。 */
export async function runPhotoSearch(input: PhotoSearchInput): Promise<VisualSearchResult> {
  const { source, preferences, destination, visualWeight, filters } = input;
  const result = await visualDiscovery(
    source,
    preferences,
    destination,
    visualWeight,
    input.fast ? fastDeps : undefined,
    filters,
  );
  return applyMapsFallback(result, preferences, destination, async (s, p, d) => {
    const list = await googleDiscover(s, p, d, {
      townscape: filters.townscape,
      seaColor: filters.seaColor,
      climate: filters.climate === 'same' ? result.source.climate?.code : filters.climate,
      countries: filters.lessVisited ? await lessVisitedCountryNames() : [],
    });
    const scenery = await applyAtmosphereScenery(typeof s === 'string' ? source : s, list, filters);
    return (await environmentFilter(scenery.source, scenery.places, filters)).places;
  });
}

/**
 * ほかの利用者に再利用してよい結果か。Google Maps の情報を使った結果は、検索した本人にだけ表示する。
 * 登録カタログと Commons の写真だけで作った結果に限る。
 */
export function isReusablePhotoResult(result: VisualSearchResult) {
  return (
    result.visualSearch.mode === 'visual' &&
    result.places.length > 0 &&
    result.places.every(p => !p.placeId && !p.googleMapsUri && !p.id.startsWith('google-'))
  );
}

export function photoSearchKey(
  input: PhotoSearchInput,
  context: { indexVersion: string; saveCosts: boolean },
) {
  const { source } = input;
  return createHash('sha256')
    .update(
      JSON.stringify({
        v: 1,
        source: source.placeId ? `place:${source.placeId}` : `id:${source.id}`,
        preferences: [...new Set(input.preferences)].sort(),
        destination: input.destination.trim().toLowerCase(),
        visualWeight: Math.round(input.visualWeight * 10) / 10,
        filters: input.filters,
        // Only fast searches add the field, so normal searches keep their earlier keys.
        ...(input.fast ? { fast: true } : {}),
        ...context,
      }),
    )
    .digest('hex');
}

const sourceKeys = ['image', 'imagePage', 'commonsPhoto', 'photoAuthors', 'climate'] as const;
type CachedPhotoResult = Pick<VisualSearchResult, 'places' | 'visualSearch'> & {
  source: Partial<Place>;
};
const reusableResults = createLruCache<CachedPhotoResult>(200, 24 * 3600000);

/** 同じ条件の写真検索は、再利用してよい結果に限り24時間使い回す。インスタンスごとのメモリーに置く。 */
export async function cachedPhotoSearch(input: PhotoSearchInput): Promise<VisualSearchResult> {
  const index = await preparedPhotoIndex();
  const key = photoSearchKey(input, {
    indexVersion: index?.createdAt || 'none',
    saveCosts: searchPolicy().saveCosts,
  });
  const hit = reusableResults.get(key);
  if (hit)
    return {
      source: { ...input.source, ...hit.source },
      places: hit.places,
      visualSearch: { ...hit.visualSearch, cached: true },
    };
  const result = await runPhotoSearch(input);
  if (isReusablePhotoResult(result))
    reusableResults.set(key, {
      places: result.places,
      visualSearch: result.visualSearch,
      source: Object.fromEntries(
        sourceKeys.filter(k => result.source[k] !== undefined).map(k => [k, result.source[k]]),
      ),
    });
  return result;
}
