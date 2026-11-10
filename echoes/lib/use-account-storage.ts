'use client';
import { t } from './i18n';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { FirebaseConfig } from './app-config';
import { signInErrorMessage } from './auth-messages';
import { resolvePlace } from './discovery-api';
import type { Account, FirebaseSession, SavedRef, SearchSettings } from './firebase-client';
import { places, type Place, type Quality } from './places';

type CloudApi = typeof import('./firebase-client');
export type StorageStatus = 'connecting' | 'cloud' | 'local' | 'error';

const refKey = (ref: SavedRef) => (ref.placeId ? `google-${ref.placeId}` : ref.sampleId);
const toRef = (place: Place): SavedRef => ({
  placeId: place.placeId || '',
  sampleId: place.placeId ? '' : place.id,
});

function readLocalRefs(): SavedRef[] | null {
  try {
    const data = JSON.parse(localStorage.getItem('elsewhere:saved-v2') || 'null');
    if (Array.isArray(data))
      return data.filter(r => typeof r?.placeId === 'string' && typeof r?.sampleId === 'string');
    const legacy = JSON.parse(localStorage.getItem('elsewhere:saved') || '[]');
    if (Array.isArray(legacy))
      return legacy
        .filter(id => places.some(p => p.id === id))
        .map(sampleId => ({ placeId: '', sampleId }));
  } catch {}
  return null;
}

function markMigrated(uid: string) {
  try {
    localStorage.setItem(`elsewhere:migrated:${uid}`, '1');
  } catch {}
}

type Options = {
  preferences: Quality[];
  destination: string;
  /** 利用者が特徴か行き先を変えたか。変えるまでは保存せず、既定値を残さない。 */
  settingsChosen: RefObject<boolean>;
  known: RefObject<Map<string, Place>>;
  setToast: (message: string) => void;
  setError: (message: string) => void;
  /** 別の端末で保存した検索条件を画面に反映する。 */
  applySettings: (settings: SearchSettings | null) => void;
  /** ログアウト時に、検索条件と開いている画面を初期状態へ戻す。 */
  resetAfterSignOut: () => void;
};

/** Firebase の接続、ログイン、保存した場所をまとめて扱う。 */
export function useAccountStorage({
  preferences,
  destination,
  settingsChosen,
  known,
  setToast,
  setError,
  applySettings,
  resetAfterSignOut,
}: Options) {
  const [savedRefs, setSavedRefs] = useState<SavedRef[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>('connecting');
  const [account, setAccount] = useState<Account | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const session = useRef<FirebaseSession | null>(null);
  const cloudApi = useRef<CloudApi | null>(null);
  const cloudReady = useRef(false);
  const restored = useRef(false);
  const localRefs = useRef<SavedRef[]>([]);
  const pendingSaves = useRef(new Set<string>());
  const stopFavorites = useRef<(() => void) | null>(null);

  const stopWatching = useCallback(() => {
    stopFavorites.current?.();
  }, []);

  const watchFavorites = useCallback(
    (cloud: CloudApi, s: FirebaseSession) => {
      stopFavorites.current?.();
      stopFavorites.current = cloud.listenFavorites(
        s,
        refs => {
          setSavedRefs(refs);
          setStorageStatus('cloud');
        },
        () => {
          setStorageStatus('error');
          setToast(t('保存した場所を読み込めませんでした。接続を確認してください。'));
        },
      );
    },
    [setToast],
  );

  const restoreLocalSaved = useCallback(() => {
    const refs = readLocalRefs();
    if (refs) {
      setSavedRefs(refs);
      localRefs.current = refs;
    }
    restored.current = true;
  }, []);

  /** 接続して、このブラウザーの保存を移したあと、保存済みの検索条件を返す。 */
  const connect = useCallback(async (config: FirebaseConfig, isCancelled: () => boolean) => {
    const cloud = await import('./firebase-client');
    const s = await cloud.connectFirebase(config);
    if (isCancelled()) return null;
    session.current = s;
    cloudApi.current = cloud;
    setAccount(cloud.accountOf(s));
    const migrationKey = `elsewhere:migrated:${s.uid}`;
    if (!localStorage.getItem(migrationKey)) {
      await Promise.all(localRefs.current.map(ref => cloud.saveFavorite(s, ref, true)));
      localStorage.setItem(migrationKey, '1');
    }
    return { cloud, session: s, settings: await cloud.loadSettings(s) };
  }, []);

  const activateCloud = useCallback(
    (cloud: CloudApi, s: FirebaseSession) => {
      cloudReady.current = true;
      setStorageStatus('cloud');
      watchFavorites(cloud, s);
    },
    [watchFavorites],
  );

  useEffect(() => {
    if (!restored.current) return;
    try {
      localStorage.setItem('elsewhere:saved-v2', JSON.stringify(savedRefs));
    } catch {
      queueMicrotask(() => setToast(t('このブラウザーでは保存情報を保持できません。')));
    }
  }, [savedRefs, setToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await Promise.all(
        savedRefs.map(async ref => {
          const cached = known.current.get(refKey(ref));
          if (cached) return cached;
          if (!ref.placeId) {
            const sample = places.find(p => p.id === ref.sampleId);
            if (sample) return sample;
            try {
              return await resolvePlace({ sampleId: ref.sampleId });
            } catch {
              return null;
            }
          }
          try {
            const place = await resolvePlace({ placeId: ref.placeId });
            known.current.set(place.id, place);
            return place;
          } catch {
            return null;
          }
        }),
      );
      if (!cancelled) setSavedPlaces(data.filter((p): p is Place => Boolean(p)));
    })();
    return () => {
      cancelled = true;
    };
  }, [savedRefs, known]);

  useEffect(() => {
    if (!cloudReady.current || !session.current || storageStatus !== 'cloud') return;
    if (!settingsChosen.current) return;
    const timer = setTimeout(() => {
      import('./firebase-client')
        .then(cloud => cloud.saveSettings(session.current!, { preferences, destination }))
        .catch(() => setToast(t('検索条件を保存できませんでした。')));
    }, 700);
    return () => clearTimeout(timer);
  }, [preferences, destination, storageStatus, settingsChosen, setToast]);

  const isSaved = useCallback(
    (p: Place) => savedRefs.some(r => refKey(r) === p.id || (r.placeId && r.placeId === p.placeId)),
    [savedRefs],
  );

  const toggleSaved = async (p: Place) => {
    if (pendingSaves.current.has(p.id)) return;
    pendingSaves.current.add(p.id);
    setSavingIds(ids => [...ids, p.id]);
    const ref = toRef(p);
    const wasSaved = isSaved(p);
    const before = savedRefs;
    known.current.set(p.id, p);
    setSavedRefs(prev => (wasSaved ? prev.filter(r => refKey(r) !== p.id) : [...prev, ref]));
    try {
      if (session.current) {
        const cloud = await import('./firebase-client');
        await cloud.saveFavorite(session.current, ref, !wasSaved);
      }
      setToast(
        wasSaved
          ? t('保存した場所から削除しました。')
          : storageStatus === 'cloud'
            ? t('気になる場所を保存しました。')
            : t('このブラウザーに保存しました。'),
      );
    } catch {
      setSavedRefs(before);
      setToast(t('保存を変更できませんでした。接続を確認して、もう一度お試しください。'));
    } finally {
      pendingSaves.current.delete(p.id);
      setSavingIds(ids => ids.filter(id => id !== p.id));
    }
  };

  /** ポップアップを止められないよう、クリックから同じ流れで呼び出す。閉じたときの focus で取得が走らないよう監視は止めておく。 */
  const signIn = async () => {
    if (authBusy) return;
    const cloud = cloudApi.current;
    const s = session.current;
    if (!cloud || !s) {
      setError(t('Google への接続を確認できませんでした。ページを読み直してください。'));
      return;
    }
    setAuthBusy(true);
    setError('');
    setStorageStatus('connecting');
    stopFavorites.current?.();
    stopFavorites.current = null;
    try {
      const result = await cloud.signInWithGoogle(s);
      session.current = result.session;
      if (result.switched) {
        markMigrated(result.session.uid);
        applySettings(await cloud.loadSettings(result.session).catch(() => null));
      }
      setAccount(cloud.accountOf(result.session));
      setToast(
        result.carryFailed
          ? t('ログインしました。このブラウザーの保存の一部を移せませんでした。')
          : t('Google アカウントでログインしました。'),
      );
    } catch (e) {
      const message = signInErrorMessage((e as { code?: string }).code || '');
      if (message) setError(message);
    } finally {
      watchFavorites(cloud, session.current || s);
      setAuthBusy(false);
    }
  };

  /** 共有端末に前の人の保存が残らないよう、画面とブラウザー内の保存情報も消す。 */
  const signOutAccount = async () => {
    if (authBusy) return;
    const cloud = cloudApi.current;
    const s = session.current;
    if (!cloud || !s) return;
    setAuthBusy(true);
    setStorageStatus('connecting');
    stopFavorites.current?.();
    stopFavorites.current = null;
    setAccount(null);
    setSavedRefs([]);
    localRefs.current = [];
    resetAfterSignOut();
    try {
      const next = await cloud.signOutToAnonymous(s);
      session.current = next;
      markMigrated(next.uid);
      watchFavorites(cloud, next);
      setToast(t('ログアウトしました。保存した場所は Google アカウントに残っています。'));
    } catch {
      setStorageStatus('error');
      setError(t('ログアウトしましたが、保存先に接続できません。ページを読み直してください。'));
    } finally {
      setAuthBusy(false);
    }
  };

  return {
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
  };
}
