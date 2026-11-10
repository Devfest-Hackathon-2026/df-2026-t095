import { numberLocale, t } from '@/lib/i18n';
import type { Place } from '@/lib/places';
import { factorLabels, type FactorKey } from '@/lib/factor-types';

export function PlaceFactors({ place, compact = false }: { place: Place; compact?: boolean }) {
  const selected = [...(place.factorMatch?.matched || []), ...(place.factorMatch?.unknown || [])];
  const keys: FactorKey[] = compact
    ? selected
    : ['populationDensity', 'waterQuality', 'homicideRate'];
  if (!keys.length) return null;
  return (
    <div
      className={compact ? 'factor-tags' : 'factor-evidence'}
      aria-label={t('国・地域の参考統計')}
    >
      {!compact && (
        <>
          <h3>{t('国・地域の参考統計')}</h3>
          <p>
            {t(
              '地点ごとの水質・混雑・安全性を示すものではありません。水質は河川・湖沼・地下水域の統計で、海水浴場の水質ではありません。',
            )}
          </p>
        </>
      )}
      {keys.map(key => {
        const observation = place.factors?.[key];
        return (
          <p key={key}>
            <span>{t('{v0}：', { v0: t(factorLabels[key]) })}</span>
            {observation ? (
              <a href={observation.source} target="_blank" rel="noopener noreferrer">
                {t('{v0} {v1}（{v2}年・国単位）', {
                  v0: observation.value.toLocaleString(numberLocale(), {
                    maximumFractionDigits: 1,
                  }),
                  v1: t(observation.unit),
                  v2: observation.year,
                })}
              </a>
            ) : (
              <span>{t('データ不明')}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}
