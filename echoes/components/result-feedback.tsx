'use client';
import { t } from '@/lib/i18n';
import type { Place, Quality } from '@/lib/places';
import {
  feedbackContext,
  shareableFeedback,
  type Judgement,
  type SearchKind,
} from '@/lib/relevance-feedback';
import type { FeedbackSharing } from '@/lib/use-feedback-sharing';
import { useResultFeedback } from '@/lib/use-result-feedback';

const choices: { id: Judgement; label: string }[] = [
  { id: 'similar', label: '似ている' },
  { id: 'different', label: 'あまり似ていない' },
  { id: 'wrong_landscape', label: '地形・風景が違う' },
];

export function ResultFeedback({
  source,
  place,
  preferences,
  searchKind,
  sharing,
}: {
  source: Place;
  place: Place;
  preferences: Quality[];
  searchKind: SearchKind;
  sharing: FeedbackSharing;
}) {
  const { feedback, record, exportFeedback, storageError } = useResultFeedback(
    source.id,
    preferences,
  );
  const context = feedbackContext(source.id, preferences);
  const selected = feedback.find(
    f => f.candidateId === place.id && feedbackContext(f.sourceId, f.preferences) === context,
  )?.judgement;
  const canShare = shareableFeedback(source, place, preferences, 'similar', searchKind) !== null;
  const choose = (judgement: Judgement) => {
    record(place.id, judgement);
    sharing.send(shareableFeedback(source, place, preferences, judgement, searchKind));
  };

  return (
    <section className="result-feedback" aria-label={t('候補の評価')}>
      <h3>{t('探している場所に近いですか')}</h3>
      <div>
        {choices.map(choice => (
          <button
            className="secondary-button"
            key={choice.id}
            aria-pressed={selected === choice.id}
            onClick={() => choose(choice.id)}
          >
            {t(choice.label)}
          </button>
        ))}
      </div>
      <p>
        {t('このブラウザーの次の並び順に反映します。写真は記録しません。')}
        {sharing.enabled ? '' : t('評価はこのブラウザーに保存し、自動では送信しません。')}
      </p>
      {selected && <p role="status">{t('評価を反映しました。')}</p>}
      {storageError && (
        <p role="alert">
          {t('評価を保存できませんでした。ブラウザーの保存設定を確認してください。')}
        </p>
      )}
      {sharing.available && (
        <>
          <label className="feedback-share">
            <input
              type="checkbox"
              checked={sharing.enabled}
              disabled={sharing.busy}
              onChange={event => sharing.setEnabled(event.target.checked)}
            />
            <span>{t('評価を匿名で送って、検索の改善に使う')}</span>
          </label>
          <small>
            {t(
              '送るのは場所の ID、選んだ特徴、評価、検索方法だけです。アカウントや写真は送りません。チェックを外すと、送った評価を削除します。',
            )}
            {sharing.enabled && !canShare
              ? t('この検索は出発点が住所か撮影場所の不明な写真なので、評価を送りません。')
              : ''}
          </small>
          {sharing.error && <p role="alert">{sharing.error}</p>}
        </>
      )}
      {feedback.length > 0 && (
        <button className="text-button" onClick={exportFeedback}>
          {t('評価データを書き出す')}
        </button>
      )}
    </section>
  );
}
