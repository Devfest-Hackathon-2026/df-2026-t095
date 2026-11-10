'use client';
import { t } from '@/lib/i18n';
import { useState } from 'react';
import {
  activeFilterCount,
  climateClasses,
  type SearchFilters as Filters,
} from '@/lib/climate-types';
import type { Place } from '@/lib/places';
import { SceneryFilters } from './scenery-filters';
import { Icon } from './icons';
type Props = {
  value: Filters;
  onChange: (v: Filters) => void;
  sourceClimate: Place['climate'];
  unknownSource?: boolean;
  searchKind?: string;
};
/** 絞り込みの項目。ふだんは「どんなところが好きですか？」の欄に、特徴の選択と並べて置く。 */
export function SearchFilters({
  value,
  onChange,
  sourceClimate,
  unknownSource,
  searchKind,
}: Props) {
  return (
    <div className="filter-fields">
      {searchKind !== 'terrain' && <SceneryFilters value={value} onChange={onChange} />}
      <div className="filter-field">
        <label htmlFor="climate-filter">{t('気候区分')}</label>
        <div className="select-wrap">
          <select
            id="climate-filter"
            value={value.climate}
            onChange={e => onChange({ ...value, climate: e.target.value })}
          >
            <option value="any">{t('指定しない')}</option>
            <option value="same" disabled={unknownSource}>
              {sourceClimate
                ? t('比較元と同じ（{v0}）', { v0: sourceClimate.code })
                : t('比較元と同じ')}
            </option>
            {climateClasses.map(([code, label]) => (
              <option key={code} value={code}>
                {code} · {t(label)}
              </option>
            ))}
          </select>
          <Icon name="CaretDown" size={18} />
        </div>
        <small>
          {unknownSource
            ? t('撮影場所は未指定です。気候区分は直接選べます。')
            : sourceClimate
              ? t('出発点：{v0} · {v1}{v2}', {
                  v0: sourceClimate.code,
                  v1: t(sourceClimate.label),
                  v2: sourceClimate.nearby ? t('（最寄りの陸地）') : '',
                })
              : t('比較元の分類はデータで確認します。')}
          <a
            href="https://doi.org/10.6084/m9.figshare.21789074"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('1991〜2020年の分類')}
          </a>
        </small>
      </div>
      <div className="filter-field">
        <label htmlFor="population-filter">{t('国の人口密度')}</label>
        <div className="select-wrap">
          <select
            id="population-filter"
            value={value.population || 'any'}
            onChange={e =>
              onChange({ ...value, population: e.target.value as Filters['population'] })
            }
          >
            <option value="any">{t('指定しない')}</option>
            <option value="low">{t('100人/km²未満')}</option>
            <option value="high">{t('500人/km²以上')}</option>
          </select>
          <Icon name="CaretDown" size={18} />
        </div>
        <small>
          {t(
            '2020〜2024年の最新公表値を国単位で比較します。地点の混雑、水の透明度・遊泳可否、旅行の安全性は判断しません。',
          )}
        </small>
      </div>
      <div className="filter-check">
        <label>
          <input
            type="checkbox"
            checked={value.lessVisited}
            onChange={e => onChange({ ...value, lessVisited: e.target.checked })}
          />
          <span>{t('観光客数が少なめの国・地域から探す')}</span>
        </label>
        <small>
          {t('国際観光客数100万人未満。')}
          <a
            href="https://data.worldbank.org/indicator/ST.INT.ARVL"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('世界銀行の2019年統計')}
          </a>
          {t('で比較します。')}
        </small>
      </div>
      <div className="filter-check">
        <label>
          <input
            type="checkbox"
            checked={value.waterQuality || false}
            onChange={e => onChange({ ...value, waterQuality: e.target.checked })}
          />
          <span>{t('良好な水域の割合が80%以上の国')}</span>
        </label>
        <small>
          {t('河川・湖沼・地下水域のうち、水質基準を満たす割合。')}
          <a
            href="https://esgdata.worldbank.org/data/indicators?ind=EN.H2O.BDYS.ZS"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('水質統計の定義')}
          </a>
        </small>
      </div>
      <div className="filter-check">
        <label>
          <input
            type="checkbox"
            checked={value.lowHomicide || false}
            onChange={e => onChange({ ...value, lowHomicide: e.target.checked })}
          />
          <span>{t('殺人発生率が10万人あたり3件未満の国')}</span>
        </label>
        <small>
          {t('治安を考えるための一つの統計です。紛争・盗難・災害は含みません。')}
          <a
            href="https://data.worldbank.org/indicator/VC.IHR.PSRC.P5"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('UNODC・世界銀行')}
          </a>
        </small>
      </div>
      <div className="filter-check filter-unknown">
        <label>
          <input
            type="checkbox"
            checked={value.unknownData !== 'exclude'}
            onChange={e =>
              onChange({ ...value, unknownData: e.target.checked ? 'include' : 'exclude' })
            }
          />
          <span>{t('データ不明の候補も、確認できた候補の後に表示する')}</span>
        </label>
      </div>
    </div>
  );
}
/** 地形検索では「どんなところが好きですか？」の欄を出さないため、結果の上に折りたたんで置く。 */
export function FilterDisclosure(props: Props) {
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(props.value);
  return (
    <details
      className="filter-disclosure"
      open={open}
      onToggle={e => setOpen(e.currentTarget.open)}
    >
      <summary>
        <Icon name="SlidersHorizontal" size={18} />
        <span>{t('条件を追加して絞り込む')}</span>
        {active > 0 && <span className="filter-count">{t('{v0}件選択中', { v0: active })}</span>}
        <Icon name="CaretDown" size={18} />
      </summary>
      <section aria-label={t('候補の絞り込み')}>
        <SearchFilters {...props} />
      </section>
    </details>
  );
}
