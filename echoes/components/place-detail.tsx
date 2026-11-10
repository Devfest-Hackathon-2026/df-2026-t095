'use client';
import { t } from '@/lib/i18n';
import type { Place, Quality } from '@/lib/places';
import { qualities } from '@/lib/places';
import type { SearchKind } from '@/lib/relevance-feedback';
import type { FeedbackSharing } from '@/lib/use-feedback-sharing';
import { mapsUrl } from '@/lib/discovery';
import { Dialog } from './dialog';
import { Icon } from './icons';
import { CommonsCredit } from './commons-credit';
import { ResultFeedback } from './result-feedback';
import { SceneryEvidence } from './scenery-evidence';
import { PlaceFactors } from './place-factors';
import { PlaceImage } from './place-image';
import { PlaceLocale } from './place-locale';
import { revealSection } from '@/lib/reveal-section';
import { useEffect, useRef } from 'react';
export function PlaceDetail({
  place,
  source,
  preferences,
  searchKind,
  feedbackSharing,
  saved,
  saving,
  onSave,
  onClose,
  route,
  onRoute,
}: {
  place: Place;
  source: Place;
  preferences: Quality[];
  searchKind: SearchKind;
  feedbackSharing: FeedbackSharing;
  saved: boolean;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  route: { loading: boolean; text?: string; error?: string } | null;
  onRoute: () => void;
}) {
  const shared = preferences.filter(q => place.features[q] >= 3 && source.features[q] >= 3);
  // 経路を調べ終えたら、結果（または失敗の理由）を画面に入れる。ダイアログの下端に出て隠れやすいため。
  const routeMessage = useRef<HTMLParagraphElement>(null);
  const routeOutcome = route?.text || route?.error;
  useEffect(() => {
    if (routeOutcome) revealSection(routeMessage.current, { focus: null, block: 'nearest' });
  }, [routeOutcome]);
  return (
    <Dialog title={t('{v0}の詳しい情報', { v0: place.name })} wide onClose={onClose}>
      <div className="detail-image">
        <PlaceImage place={place} />
      </div>
      <div className="detail-content">
        <p className="result-location">
          <Icon name="MapPin" size={15} />
          {[place.city, place.country].filter(Boolean).join(t('・'))}
        </p>
        <h2>{place.name}</h2>
        <PlaceLocale place={place} />
        <p className="detail-description">{place.description}</p>
        {place.commonsPhoto && <CommonsCredit photo={place.commonsPhoto} />}
        {place.visual && (
          <div className="visual-evidence">
            <section>
              <h3>{t('写真に写っている共通点')}</h3>
              {place.visual.observations.length ? (
                <ul>
                  {place.visual.observations.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : (
                <p>
                  {t(
                    '写真の埋め込みで順位を付けました。写真の共通点を説明する処理は利用できませんでした。',
                  )}
                </p>
              )}
            </section>
            <section>
              <h3>{t('写真で見える違い')}</h3>
              <ul>
                {place.visual.differences.map(x => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>{t('写真だけでは分からないこと')}</h3>
              <p>
                {t(
                  '静かさや混雑、歩きやすさは、写真だけでは判断できません。下の特徴は紹介用の資料をもとにした解釈です。',
                )}
              </p>
              {place.visual.inferences.map(x => (
                <p key={x}>{x}</p>
              ))}
            </section>
            <section>
              <h3>{t('比べた写真の出典')}</h3>
              <p>{t('出発点：{v0}', { v0: source.name })}</p>
              {place.visual.sourcePhoto.provider === 'commons' ? (
                <CommonsCredit photo={place.visual.sourcePhoto} />
              ) : (
                <p>{t('利用者がアップロードした写真。元の画像と埋め込みは保存しません。')}</p>
              )}
              <p>{t('候補：{v0}', { v0: place.name })}</p>
              <CommonsCredit photo={place.visual.candidatePhoto} />
              <p>
                {t(
                  '写真の近さ {v0}：選んだ特徴 {v1}。順位を決める手がかりで、一致率ではありません。',
                  {
                    v0: Math.round(place.visual.visualWeight * 10),
                    v1: 10 - Math.round(place.visual.visualWeight * 10),
                  },
                )}
              </p>
            </section>
          </div>
        )}
        {place.profiled !== false && (
          <div className="detail-section">
            <h3>
              <Icon name="Heart" size={19} />
              {source.locationUnknown
                ? t('候補の過ごし方（資料からの解釈）')
                : place.visual
                  ? t('過ごし方の共通点（資料からの解釈）')
                  : t('似ているところ')}
            </h3>
            <p>
              {place.bestFor}
              {place.bestFor && !place.bestFor.endsWith('。') ? '。' : ''}
            </p>
            {shared.length > 0 && (
              <ul className="shared-list">
                {shared.map(q => (
                  <li key={q}>{t(qualities.find(x => x.id === q)!.description)}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {place.difference && !place.visual && !source.locationUnknown && (
          <div className="detail-section difference-section">
            <h3>
              <Icon name="Compass" size={19} />
              {t('ひと味違うところ')}
            </h3>
            <p>{place.difference}</p>
          </div>
        )}
        {place.featureEvidence &&
          Object.values(place.featureEvidence).some(e => e.status === 'unknown') && (
            <p>{t('根拠を確認できなかった過ごし方の特徴は、不明として扱っています。')}</p>
          )}
        <div className="detail-section">
          <h3>
            <Icon name="NavigationArrow" size={19} />
            {t('訪ねるなら、このあたりから')}
          </h3>
          <p>{place.detail}</p>
        </div>
        <ResultFeedback
          source={source}
          place={place}
          preferences={preferences}
          searchKind={searchKind}
          sharing={feedbackSharing}
        />
        <SceneryEvidence place={place} />
        <PlaceFactors place={place} />
        <div className="evidence">
          <span>{place.placeId ? t('Google Maps の参照元') : t('場所の参考情報')}</span>
          {place.sources.map(s => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title}
              <Icon name="ArrowUpRight" size={13} />
            </a>
          ))}
          <p>
            {place.visual
              ? t(
                  '写真の共通点と違いは、比較した写真をもとに AI が整理しています。過ごし方の特徴には、紹介用の資料をもとにした解釈が含まれます。',
                )
              : place.placeId
                ? t(
                    '共通点や雰囲気は、Google Maps の情報をもとに AI が整理したものです。静かさや混雑は、時間帯や季節によって変わります。',
                  )
                : t(
                    'サンプルの特徴と比較は、紹介用に整理したものです。現地の混雑や天候を示す情報ではありません。',
                  )}
          </p>
          {place.imagePage && (
            <a
              className="photo-credit"
              href={place.imagePage}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('写真の出典・利用条件')}
              <Icon name="ArrowUpRight" size={12} />
            </a>
          )}
        </div>
        <div className="detail-actions">
          <a
            className="primary-button"
            href={mapsUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Google Maps で開く')}
            <Icon name="ArrowUpRight" size={18} />
          </a>
          <button className="secondary-button" disabled={saving} onClick={onSave}>
            <Icon name="BookmarkSimple" size={18} weight={saved ? 'fill' : 'regular'} />
            {saving ? t('保存しています…') : saved ? t('保存を取り消す') : t('この場所を保存')}
          </button>
        </div>
        {place.placeId && (
          <div className="route-section">
            <h3>{t('現在地からの行き方')}</h3>
            <p>{t('現在地を取得して Google の経路検索に送ります。位置情報は保存しません。')}</p>
            <button className="secondary-button" disabled={route?.loading} onClick={onRoute}>
              <Icon name="NavigationArrow" size={17} />
              {route?.loading ? t('経路を調べています…') : t('現在地から調べる')}
            </button>
            {route?.text && (
              <p ref={routeMessage} className="route-result" role="status">
                {route.text}
              </p>
            )}
            {route?.error && (
              <p ref={routeMessage} className="route-error" role="status">
                {t(route.error)}
              </p>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
