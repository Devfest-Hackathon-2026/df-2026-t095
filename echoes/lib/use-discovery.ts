'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppConfig } from './app-config';
import { defaultSearchFilters, parseSearchFilters, type SearchFilters } from './climate-types';
import { diverseResults, isQuality, rankPlaces, sourceLookupQuery } from './discovery';
import {
  fetchSharedPlaces,
  resolvePlace,
  searchAtmosphere,
  searchPhoto,
  searchUploadedPhoto,
  uploadedSourcePlace,
} from './discovery-api';
import type { SearchSettings } from './firebase-client';
import { defaultPreferences, defaultSource, places, type Place, type Quality } from './places';
import { detectLocale, getLocale, setLocale, subscribeLocale, t } from './i18n';
import { useLocale } from './use-locale';
import { applyFeedback, type SearchKind } from './relevance-feedback';
import { filtersFromParams, filtersToParams } from './search-params.ts';
import { useAccountStorage } from './use-account-storage';
import { useDiscoveryView } from './use-discovery-view';
import { useFeedbackSharing } from './use-feedback-sharing';
import { useResultFeedback } from './use-result-feedback';
import { useRouteEstimate } from './use-route-estimate';
import { useSourceClimate } from './use-source-climate';
import { useToast } from './use-toast';
import { useUploadState } from './use-upload-state';
import type { VisualSearchSummary } from './visual-types';

/** 表示用に、登録データの日本語を画面の言語へ置き換える。検索に使う元のデータは変えない。 */
const localizePlace = (place: Place): Place =>
  getLocale() === 'ja'
    ? place
    : {
        ...place,
        name: t(place.name),
        city: t(place.city),
        country: t(place.country),
        description: t(place.description),
        detail: t(place.detail),
        difference: t(place.difference),
        bestFor: t(place.bestFor),
        climate: place.climate
          ? { ...place.climate, label: t(place.climate.label) }
          : place.climate,
      };
const sampleNames = (p: Place) => [
  p.name,
  `${p.name} ${p.city}`,
  t(p.name, undefined, 'en'),
  `${t(p.name, undefined, 'en')} ${t(p.city, undefined, 'en')}`,
];
/** 入力した地名がサンプルの地点か。日本語名と英語名のどちらでも見つける。 */
const findSample = (query: string) => places.find(p => sampleNames(p).includes(query.trim()));

/** 検索の条件と実行を扱い、ほかの hook をまとめて画面に渡す。 */
export function useDiscovery() {
  const locale = useLocale();
  const {
    uploadFile,
    setUploadFile,
    uploadPreview,
    setUploadPreview,
    uploadRights,
    setUploadRights,
    beforeUploadRef,
  } = useUploadState();
  const {
    view,
    setView,
    layout,
    setLayout,
    activeId,
    setActiveId,
    detail,
    setDetail,
    modal,
    setModal,
  } = useDiscoveryView();
  const [toast, setToast] = useToast();
  const { route, setRoute, getRoute } = useRouteEstimate();

  const [source, setSource] = useState<Place>(defaultSource);
  const [query, setQuery] = useState(defaultSource.name);
  const [preferences, setPreferences] = useState<Quality[]>(defaultPreferences);
  const [destination, setDestinationState] = useState('world');
  const [filters, setFiltersState] = useState<SearchFilters>(defaultSearchFilters);
  const [searchKind, setSearchKindState] = useState<SearchKind>('atmosphere');
  const [visualWeight, setVisualWeightState] = useState(0.6);
  // Fast search uses the earlier, quicker photo comparison.
  const [fastSearch, setFastSearch] = useState(false);
  const [visualSearch, setVisualSearch] = useState<VisualSearchSummary | null>(null);
  const [livePlaces, setLivePlaces] = useState<Place[]>([]);
  const [liveMode, setLiveMode] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [searchRevision, setSearchRevision] = useState(0);
  // 地形モードで「出発点を更新」が終わった回数。画面側で地形の欄へ移動するのに使う。
  const [sourceRevision, setSourceRevision] = useState(0);
  const [sharedResults, setSharedResults] = useState(false);

  const request = useRef<AbortController | null>(null);
  const sourceRequest = useRef<AbortController | null>(null);
  const known = useRef(new Map(places.map(p => [p.id, p])));
  const userChanged = useRef(false);
  const settingsChosen = useRef(false);

  const sourceClimate = useSourceClimate(source);
  const { feedback } = useResultFeedback(source.id, preferences);

  const applySettings = useCallback((settings: SearchSettings | null) => {
    const valid = settings?.preferences?.filter(isQuality);
    if (valid?.length) setPreferences(valid);
    if (typeof settings?.destination === 'string') setDestinationState(settings.destination);
  }, []);
  const resetAfterSignOut = useCallback(() => {
    settingsChosen.current = false;
    setPreferences(defaultPreferences);
    setDestinationState('world');
    setModal(null);
  }, [setModal]);
  const {
    session,
    account,
    authBusy,
    savedPlaces,
    savingIds,
    storageStatus,
    setStorageStatus,
    isSaved,
    toggleSaved,
    signIn,
    signOutAccount,
    restoreLocalSaved,
    connect,
    activateCloud,
    stopWatching,
  } = useAccountStorage({
    preferences,
    destination,
    settingsChosen,
    known,
    setToast,
    setError,
    applySettings,
    resetAfterSignOut,
  });
  const feedbackSharing = useFeedbackSharing(session, storageStatus === 'cloud');

  const adoptPlace = useCallback((place: Place) => {
    known.current.set(place.id, place);
    setSource(place);
    setQuery(place.name);
  }, []);

  /** 共有リンクに写真検索の結果が含まれていれば、検索し直さずに表示する。 */
  const showSharedResults = useCallback(
    async (ids: string[], isCancelled: () => boolean) => {
      if (!ids.length) return;
      try {
        const list = await fetchSharedPlaces(ids.slice(0, 12));
        if (isCancelled() || !list.length) return;
        list.forEach(place => known.current.set(place.id, place));
        setLivePlaces(list);
        setSharedResults(true);
        setToast(t('共有された検索結果を開きました。'));
      } catch {
        if (!isCancelled())
          setToast(t('共有された結果を読み込めませんでした。検索ボタンで候補を探せます。'));
      }
    },
    [setToast],
  );

  // 言語を切り替えたら、サンプルの地名も同じ言語にそろえる。
  useEffect(
    () =>
      subscribeLocale(() =>
        setQuery(current => {
          const sample = places.find(p => sampleNames(p).includes(current.trim()));
          return sample ? t(sample.name) : current;
        }),
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setLocale(detectLocale());
      const params = new URLSearchParams(window.location.search);
      const initial = places.find(p => p.id === params.get('source'));
      const method = params.get('method');
      if (method === 'visual' || method === 'terrain') setSearchKindState(method);
      const weight = Number(params.get('weight'));
      if (params.has('weight') && Number.isFinite(weight) && weight >= 0 && weight <= 1)
        setVisualWeightState(weight);
      if (initial) {
        setSource(initial);
        setQuery(initial.name);
      }
      const prefs = params.get('qualities')?.split(',').filter(isQuality);
      if (prefs?.length) setPreferences([...new Set(prefs)]);
      try {
        const hasFilters = Object.keys(defaultSearchFilters).some(key => params.has(key));
        const selected = hasFilters
          ? filtersFromParams(params)
          : parseSearchFilters(JSON.parse(localStorage.getItem('elsewhere:filters') || 'null'));
        setFiltersState(
          method === 'terrain' ? { ...selected, seaColor: 'any', townscape: 'any' } : selected,
        );
      } catch {}
      const dest = params.get('destination');
      if (dest && dest.length <= 100) setDestinationState(dest);
      restoreLocalSaved();

      (async () => {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error(t('接続設定を確認できませんでした。'));
        const c = (await response.json()) as AppConfig;
        if (cancelled) return;
        setConfig(c);
        setLiveMode(c.liveSearch && c.places);
        if (c.firebase) {
          try {
            const connection = await connect(c.firebase, () => cancelled);
            if (!connection) return;
            const { cloud, session: s, settings } = connection;
            if (
              settings &&
              !params.has('qualities') &&
              !params.has('share') &&
              !userChanged.current
            )
              applySettings(settings);
            if (cancelled) return;
            activateCloud(cloud, s);
            const shareId = params.get('share');
            if (shareId) {
              const shared = await cloud.loadShare(s, shareId);
              if (!shared) throw new Error(t('共有された検索が見つかりませんでした。'));
              if (!cancelled) {
                setPreferences(shared.preferences.filter(isQuality));
                setDestinationState(shared.destination);
                if (shared.sourcePlaceId) {
                  const place = await resolvePlace({ placeId: shared.sourcePlaceId });
                  if (!cancelled) adoptPlace(place);
                } else {
                  const place = places.find(p => p.id === shared.sourceSampleId);
                  if (place) {
                    setSource(place);
                    setQuery(place.name);
                  }
                }
                setToast(t('共有された検索条件を開きました。検索ボタンで候補を探せます。'));
                await showSharedResults(shared.resultIds || [], () => cancelled);
              }
            }
          } catch (e) {
            if (!cancelled) {
              setStorageStatus('error');
              setError(
                e instanceof Error ? e.message : t('Google への保存を開始できませんでした。'),
              );
            }
          }
        } else setStorageStatus('local');
        const placeId = params.get('placeId');
        if (placeId && c.places) {
          const place = await resolvePlace({ placeId });
          if (!cancelled) adoptPlace(place);
        }
        const resultIds = params.get('results')?.split(',').filter(Boolean) || [];
        if (resultIds.length && c.liveSearch) await showSharedResults(resultIds, () => cancelled);
      })().catch(e => {
        if (!cancelled) {
          setStorageStatus('local');
          setError(e instanceof Error ? e.message : t('Google への接続を確認できませんでした。'));
        }
      });
    });
    return () => {
      cancelled = true;
      stopWatching();
      request.current?.abort();
      sourceRequest.current?.abort();
    };
  }, [
    activateCloud,
    adoptPlace,
    applySettings,
    connect,
    restoreLocalSaved,
    setStorageStatus,
    setToast,
    showSharedResults,
    stopWatching,
  ]);

  const textResults = useMemo(
    () =>
      diverseResults(
        applyFeedback(
          rankPlaces(
            source,
            preferences,
            liveMode ? 'world' : destination,
            liveMode ? livePlaces : places,
          ),
          feedback,
          source.id,
          preferences,
        ),
      ),
    [source, preferences, destination, liveMode, livePlaces, feedback],
  );
  const results = useMemo(
    () =>
      liveMode && searchKind === 'visual'
        ? applyFeedback(livePlaces, feedback, source.id, preferences)
        : textResults,
    [liveMode, searchKind, livePlaces, feedback, source.id, preferences, textResults],
  );
  const displayed = view === 'saved' ? savedPlaces : results;

  const remember = (list: Place[]) => list.forEach(p => known.current.set(p.id, p));

  const selectUpload = (file: File | null) => {
    request.current?.abort();
    setLoading(false);
    setLivePlaces([]);
    setVisualSearch(null);
    setError('');
    setShareUrl('');
    setUploadRights(false);
    if (!file) {
      setUploadFile(null);
      setUploadPreview('');
      if (beforeUploadRef.current) {
        setSource(beforeUploadRef.current);
        setQuery(beforeUploadRef.current.name);
      }
      beforeUploadRef.current = null;
      return;
    }
    if (
      file.size > 8 * 1024 * 1024 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    ) {
      setError(t('8 MB以内のJPEG・PNG・WebPを選んでください。'));
      return;
    }
    if (!source.uploadPhoto) beforeUploadRef.current = source;
    const preview = URL.createObjectURL(file);
    setUploadFile(file);
    setUploadPreview(preview);
    setSource(uploadedSourcePlace(preview));
  };

  const chooseSource = (place: Place) => {
    setUploadFile(null);
    setUploadPreview('');
    beforeUploadRef.current = null;
    setShareUrl('');
    request.current?.abort();
    setLoading(false);
    known.current.set(place.id, place);
    setSource(place);
    setQuery(place.name);
    setLivePlaces([]);
    setSharedResults(false);
    setVisualSearch(null);
    setActiveId(null);
    setError('');
    setView('discover');
    setRoute(null);
  };

  const resolveSource = async (input: object, failure: string, onDone?: () => void) => {
    sourceRequest.current?.abort();
    const controller = new AbortController();
    sourceRequest.current = controller;
    setResolving(true);
    setError('');
    try {
      const place = await resolvePlace(input, controller.signal);
      if (!controller.signal.aborted) {
        chooseSource(place);
        onDone?.();
      }
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : failure);
    } finally {
      if (sourceRequest.current === controller) setResolving(false);
    }
  };
  const choosePlaceId = (placeId: string, sessionToken?: string) =>
    resolveSource({ placeId, sessionToken }, t('場所を確認できませんでした。'));
  const chooseLocation = (location: { lat: number; lng: number }) =>
    resolveSource({ location }, t('この地点を確認できませんでした。'), () =>
      setToast(t('地図で選んだ場所を出発点にしました。')),
    );

  const runUploadSearch = async (file: File, signal: AbortSignal) => {
    const data = await searchUploadedPhoto(
      { file, preferences, destination, visualWeight, filters, fast: fastSearch },
      signal,
    );
    if (signal.aborted) return;
    setSource({ ...data.source, image: uploadPreview });
    setLivePlaces(data.places);
    setVisualSearch(data.visualSearch);
    remember(data.places);
  };

  const runPhotoSearch = async (signal: AbortSignal) => {
    const sample = findSample(query);
    const current =
      sample ||
      (query.trim() === source.name && source.placeId
        ? source
        : await resolvePlace({ query: sourceLookupQuery(query, source) }, signal));
    const data = await searchPhoto(
      {
        sampleId: sample?.id,
        placeId: current.placeId,
        source: query.trim(),
        preferences,
        destination,
        visualWeight,
        filters,
        fast: fastSearch,
      },
      signal,
    );
    if (signal.aborted) return;
    setSource(data.source);
    setQuery(data.source.name);
    setLivePlaces(data.places);
    setVisualSearch(data.visualSearch);
    remember([data.source, ...data.places]);
  };

  const runAtmosphereSearch = async (signal: AbortSignal) => {
    const current =
      query.trim() === source.name && source.placeId
        ? source
        : await resolvePlace({ query: sourceLookupQuery(query, source) }, signal);
    setSource(current);
    known.current.set(current.id, current);
    const data = await searchAtmosphere(
      {
        placeId: current.placeId,
        source: `${current.name} ${current.city}`,
        preferences,
        destination,
        filters,
      },
      signal,
    );
    if (signal.aborted) return;
    setSource(data.source);
    setQuery(data.source.name);
    setLivePlaces(data.places);
    remember([data.source, ...data.places]);
  };

  const search = async () => {
    setError('');
    setSharedResults(false);
    setShareUrl('');
    setVisualSearch(null);
    setView('discover');
    setActiveId(null);
    setRoute(null);
    userChanged.current = true;
    if (!liveMode) {
      const p = findSample(query);
      if (!p) {
        setError(
          t('サンプルから出発点を選んでください。Google 検索では好きな場所を入力できます。'),
        );
        return;
      }
      setSource(p);
      setSearchRevision(n => n + 1);
      return;
    }
    if (!uploadFile && query.trim().length < 2) {
      setError(t('出発点の地名を入れてください。'));
      return;
    }
    if (searchKind === 'terrain') {
      setResolving(true);
      try {
        chooseSource(await resolvePlace({ query: sourceLookupQuery(query, source) }));
        setSourceRevision(n => n + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('出発点を確認できませんでした。'));
      } finally {
        setResolving(false);
      }
      return;
    }
    if (searchKind === 'visual' && uploadFile && !uploadRights) {
      setError(t('画像解析に利用できる写真であることを確認してください。'));
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setLivePlaces([]);
    setSearchRevision(n => n + 1);
    const failure =
      searchKind !== 'visual'
        ? t('検索を完了できませんでした。')
        : uploadFile
          ? t('写真の解析を完了できませんでした。')
          : t('写真の比較を完了できませんでした。');
    try {
      if (searchKind !== 'visual') await runAtmosphereSearch(controller.signal);
      else if (uploadFile) await runUploadSearch(uploadFile, controller.signal);
      else await runPhotoSearch(controller.signal);
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : failure);
    } finally {
      if (request.current === controller) setLoading(false);
    }
  };

  const cancelSearch = () => {
    request.current?.abort();
    setLoading(false);
    setToast(t('検索を中止しました。'));
  };

  const togglePreference = (q: Quality) => {
    setShareUrl('');
    userChanged.current = true;
    settingsChosen.current = true;
    if (searchKind === 'visual') {
      setLivePlaces([]);
      setVisualSearch(null);
    }
    setPreferences(prev =>
      prev.includes(q) ? (prev.length > 1 ? prev.filter(x => x !== q) : prev) : [...prev, q],
    );
    setActiveId(null);
  };

  const setFilters = (value: SearchFilters) => {
    userChanged.current = true;
    request.current?.abort();
    setLoading(false);
    setFiltersState(value);
    try {
      localStorage.setItem('elsewhere:filters', JSON.stringify(value));
    } catch {}
    setShareUrl('');
    setLivePlaces([]);
    setVisualSearch(null);
    setError('');
  };

  const setDestination = (value: string) => {
    setShareUrl('');
    userChanged.current = true;
    settingsChosen.current = true;
    setDestinationState(value);
    setActiveId(null);
    setLivePlaces([]);
  };

  const setSearchKind = (kind: SearchKind) => {
    if (uploadFile && kind !== 'visual') selectUpload(null);
    setShareUrl('');
    request.current?.abort();
    setLoading(false);
    setSearchKindState(kind);
    if (kind === 'terrain')
      setFiltersState(prev => ({ ...prev, seaColor: 'any', townscape: 'any' }));
    setLivePlaces([]);
    setVisualSearch(null);
    setError('');
  };

  const setVisualWeight = (weight: number) => {
    setShareUrl('');
    setVisualWeightState(weight);
    setLivePlaces([]);
    setVisualSearch(null);
  };

  const share = async () => {
    if (source.uploadPhoto) {
      setToast(t('アップロード写真は共有リンクに含めません。地名で選んだ検索を共有してください。'));
      return;
    }
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('method', searchKind);
    filtersToParams(url.searchParams, filters);
    if (searchKind === 'visual') url.searchParams.set('weight', String(visualWeight));
    // 写真検索の結果は登録カタログと Commons だけで作るので、ID を共有リンクに残せる。
    // Google Maps の情報を使った結果は、開いた人が自分で検索する。
    let resultIds =
      searchKind === 'visual' &&
      (visualSearch?.mode === 'visual' || sharedResults) &&
      livePlaces.length > 0 &&
      livePlaces.every(p => p.catalogId || !p.placeId)
        ? livePlaces.map(p => p.catalogId || p.id).slice(0, 12)
        : [];
    try {
      if (session.current) {
        const cloud = await import('./firebase-client');
        const search = {
          sourcePlaceId: source.placeId || '',
          sourceSampleId: source.placeId ? '' : source.id,
          preferences,
          destination,
        };
        // 結果つきの共有を受け付けない古い Firestore ルールでも、条件だけの共有は作れるようにする。
        const shareId = await cloud
          .createShare(session.current, { ...search, resultIds })
          .catch(error => {
            if (!resultIds.length) throw error;
            resultIds = [];
            return cloud.createShare(session.current!, search);
          });
        url.searchParams.set('share', shareId);
      } else {
        url.searchParams.set(source.placeId ? 'placeId' : 'source', source.placeId || source.id);
        url.searchParams.set('qualities', preferences.join(','));
        url.searchParams.set('destination', destination);
        if (resultIds.length) url.searchParams.set('results', resultIds.join(','));
      }
      setShareUrl(url.toString());
      try {
        await navigator.clipboard.writeText(url.toString());
        setToast(
          resultIds.length
            ? t('検索結果つきのリンクをコピーしました。')
            : t('検索のリンクをコピーしました。'),
        );
      } catch {
        window.history.replaceState(null, '', url);
        setToast(t('アドレス欄の URL をコピーして共有できます。'));
      }
    } catch {
      setToast(t('共有リンクを作れませんでした。接続を確認してお試しください。'));
    }
  };

  const localized = useMemo(
    () => ({
      source: localizePlace(source),
      displayed: displayed.map(localizePlace),
      saved: savedPlaces.map(localizePlace),
      detail: detail && localizePlace(detail),
    }),
    // locale を変えたときも訳し直す。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source, displayed, savedPlaces, detail, locale],
  );

  return {
    locale,
    sharedResults: sharedResults && livePlaces.length > 0,
    searchRevision,
    sourceRevision,
    feedbackSharing,
    account,
    authBusy,
    signIn,
    signOutAccount,
    filters,
    setFilters,
    sourceClimate,
    uploadFile,
    uploadPreview,
    uploadRights,
    setUploadRights,
    selectUpload,
    shareUrl,
    searchKind,
    setSearchKind,
    visualWeight,
    setVisualWeight,
    fastSearch,
    setFastSearch,
    visualSearch,
    source: localized.source,
    query,
    setQuery,
    preferences,
    togglePreference,
    destination,
    setDestination,
    view,
    setView,
    layout,
    setLayout,
    activeId,
    setActiveId,
    modal,
    setModal,
    detail: localized.detail,
    setDetail,
    toast,
    error,
    loading,
    resolving,
    mapsKey: config?.mapsKey || '',
    liveAvailable: Boolean(config?.liveSearch && config?.places),
    placesReady: Boolean(config?.places),
    liveMode,
    setLiveMode,
    results,
    displayed: localized.displayed,
    saved: localized.saved,
    isSaved,
    toggleSaved,
    savingIds,
    chooseSource,
    choosePlaceId,
    chooseLocation,
    search,
    cancelSearch,
    share,
    storageStatus,
    route,
    getRoute,
    setRoute,
    config,
  };
}
