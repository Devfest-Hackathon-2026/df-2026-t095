'use client';
import { t } from '@/lib/i18n';
import type { SearchFilters } from '@/lib/climate-types';
import { seaColorOptions, townscapeOptions } from '@/lib/scenery';
import { Icon } from './icons';
export function SceneryFilters({
  value,
  onChange,
}: {
  value: SearchFilters;
  onChange: (value: SearchFilters) => void;
}) {
  return (
    <>
      <div className="filter-field">
        <label htmlFor="sea-color-filter">{t('海の色')}</label>
        <div className="select-wrap">
          <select
            id="sea-color-filter"
            value={value.seaColor || 'any'}
            onChange={e =>
              onChange({ ...value, seaColor: e.target.value as SearchFilters['seaColor'] })
            }
          >
            <option value="any">{t('指定しない')}</option>
            <option value="same">{t('比較元の写真に近い色')}</option>
            {seaColorOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {t(label)}
              </option>
            ))}
          </select>
          <Icon name="CaretDown" size={18} />
        </div>
        <small>
          {t(
            '確認済みの写真に写る色で比べます。天候・光・撮影方法で変わり、水質や遊泳可否は示しません。',
          )}
        </small>
      </div>
      <div className="filter-field">
        <label htmlFor="townscape-filter">{t('街の雰囲気')}</label>
        <div className="select-wrap">
          <select
            id="townscape-filter"
            value={value.townscape || 'any'}
            onChange={e =>
              onChange({ ...value, townscape: e.target.value as SearchFilters['townscape'] })
            }
          >
            <option value="any">{t('指定しない')}</option>
            <option value="same">{t('比較元の街並みに近い')}</option>
            {townscapeOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {t(label)}
              </option>
            ))}
          </select>
          <Icon name="CaretDown" size={18} />
        </div>
        <small>
          {t(
            '写真に見える建物・緑・街路、または Maps の参照情報から整理します。静かさ・混雑・治安は判断しません。',
          )}
        </small>
      </div>
    </>
  );
}
