'use client';
import { t } from './i18n';
import { useCallback, useEffect, useState, type RefObject } from 'react';
import type { FirebaseSession } from './firebase-client';
import { feedbackDocumentId, type SharedFeedback } from './relevance-feedback';
import { read as readStoredFeedback } from './use-result-feedback';

const storageKey = 'elsewhere:feedback-sharing';

function readSalt(): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export type FeedbackSharing = {
  available: boolean;
  enabled: boolean;
  busy: boolean;
  error: string;
  setEnabled: (enabled: boolean) => void;
  send: (entry: SharedFeedback | null) => void;
};

/** 利用者が選んだときだけ、評価を Firestore に送る。 */
export function useFeedbackSharing(
  session: RefObject<FirebaseSession | null>,
  available: boolean,
): FeedbackSharing {
  const [salt, setSalt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const refresh = () => setSalt(readSalt());
    refresh();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const send = useCallback(
    (entry: SharedFeedback | null) => {
      const current = session.current;
      if (!salt || !entry || !current) return;
      void (async () => {
        try {
          const cloud = await import('./firebase-client');
          const id = await feedbackDocumentId(
            salt,
            entry.sourceId,
            entry.candidateId,
            entry.preferences,
          );
          await cloud.sendFeedback(current, id, entry);
          setError('');
        } catch {
          setError(t('評価を送信できませんでした。このブラウザーには保存しています。'));
        }
      })();
    },
    [salt, session],
  );

  const setEnabled = useCallback(
    (enabled: boolean) => {
      setError('');
      if (enabled) {
        try {
          const next = crypto.randomUUID();
          localStorage.setItem(storageKey, next);
          setSalt(next);
        } catch {
          setError(t('このブラウザーでは設定を保存できません。'));
        }
        return;
      }
      const current = session.current;
      if (!salt || !current) return;
      setBusy(true);
      void (async () => {
        try {
          const cloud = await import('./firebase-client');
          const ids = await Promise.all(
            readStoredFeedback().map(entry =>
              feedbackDocumentId(salt, entry.sourceId, entry.candidateId, entry.preferences),
            ),
          );
          await cloud.deleteFeedback(current, ids);
          localStorage.removeItem(storageKey);
          setSalt(null);
        } catch {
          setError(t('送信した評価を削除できませんでした。時間をおいてもう一度お試しください。'));
        } finally {
          setBusy(false);
        }
      })();
    },
    [salt, session],
  );

  return { available, enabled: Boolean(salt), busy, error, setEnabled, send };
}
