import { localeHeaders, t } from './i18n';
import type { SearchFilters } from './climate-types';
import type { Place, Quality } from './places';
import type { VisualSearchSummary } from './visual-types';

type SearchCriteria = {
  preferences: Quality[];
  destination: string;
  filters: SearchFilters;
};
export type VisualSearchResult = {
  source: Place;
  places: Place[];
  visualSearch: VisualSearchSummary;
};

const postJson = (url: string, body: object, signal?: AbortSignal) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...localeHeaders() },
    body: JSON.stringify(body),
    signal,
  });

export async function resolvePlace(input: object, signal?: AbortSignal): Promise<Place> {
  const response = await postJson('/api/resolve', input, signal);
  const data = (await response.json()) as { place?: Place; error?: string };
  if (!response.ok || !data.place) throw new Error(data.error || t('場所を確認できませんでした。'));
  return data.place;
}

/** 共有された写真検索の結果を、登録カタログの ID から読み込む。 */
export async function fetchSharedPlaces(ids: string[]): Promise<Place[]> {
  const response = await fetch(`/api/places?ids=${encodeURIComponent(ids.join(','))}`, {
    headers: localeHeaders(),
  });
  const data = (await response.json()) as { places?: Place[]; error?: string };
  if (!response.ok || !Array.isArray(data.places))
    throw new Error(data.error || t('共有された結果を確認できませんでした。'));
  return data.places;
}

export async function searchUploadedPhoto(
  input: SearchCriteria & { file: File; visualWeight: number; fast?: boolean },
  signal: AbortSignal,
): Promise<VisualSearchResult> {
  const form = new FormData();
  form.set('photo', input.file);
  form.set('rights', 'confirmed');
  form.set('preferences', JSON.stringify(input.preferences));
  form.set('destination', input.destination);
  form.set('visualWeight', String(input.visualWeight));
  form.set('filters', JSON.stringify(input.filters));
  if (input.fast) form.set('fast', 'true');
  const response = await fetch('/api/visual/upload', {
    method: 'POST',
    body: form,
    signal,
    headers: localeHeaders(),
  });
  const data = (await response.json()) as VisualSearchResult & { error?: string };
  if (!response.ok) throw new Error(data.error || t('写真の解析を完了できませんでした。'));
  return data;
}

export async function searchPhoto(
  input: SearchCriteria & {
    sampleId?: string;
    placeId?: string;
    source: string;
    visualWeight: number;
    /** Fast search: the earlier, quicker photo comparison. */
    fast?: boolean;
  },
  signal: AbortSignal,
): Promise<VisualSearchResult> {
  const response = await postJson('/api/visual', input, signal);
  const data = (await response.json()) as VisualSearchResult & { error?: string };
  if (!response.ok) throw new Error(data.error || t('写真の比較を完了できませんでした。'));
  return data;
}

export async function searchAtmosphere(
  input: SearchCriteria & { placeId?: string; source: string },
  signal: AbortSignal,
): Promise<{ source: Place; places: Place[] }> {
  const response = await postJson('/api/discover', input, signal);
  const data = (await response.json()) as { source?: Place; places?: Place[]; error?: string };
  if (!response.ok || !data.source || !Array.isArray(data.places))
    throw new Error(data.error || t('検索結果を取得できませんでした。'));
  return { source: data.source, places: data.places };
}

export async function fetchRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: 'WALK' | 'DRIVE',
) {
  const response = await postJson('/api/route', { origin, destination, mode });
  const data = (await response.json()) as {
    duration?: string;
    distanceMeters?: number;
    error?: string;
  };
  if (!response.ok) throw new Error(data.error || t('経路を確認できませんでした。'));
  return data;
}

/** アップロードした写真を、場所が未指定の出発点として表す。 */
export function uploadedSourcePlace(preview: string): Place {
  return {
    id: 'uploaded-reference',
    name: t('アップロードした写真'),
    city: t('場所は未指定'),
    country: '',
    continent: '',
    lat: 0,
    lng: 0,
    locationUnknown: true,
    image: preview,
    uploadPhoto: {
      provider: 'upload',
      name: t('アップロードした写真'),
      mime: 'image/jpeg',
      changes: t('解析時に位置情報を除去'),
    },
    description: t('写真の風景から候補を探します。場所の特定は行いません。'),
    detail: '',
    difference: '',
    bestFor: '',
    features: { water: 0, green: 0, quiet: 0, walk: 0, cafes: 0, history: 0 },
    profiled: false,
    sources: [],
  };
}
