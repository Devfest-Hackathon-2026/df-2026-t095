'use client';
import { t } from '@/lib/i18n';
import { useId, useRef, useState } from 'react';
import { Icon } from './icons';
const options = [
  '世界中',
  'アジア',
  'ヨーロッパ',
  'アフリカ',
  '北アメリカ',
  '南アメリカ',
  'オセアニア',
  '日本',
  '北海道',
  'ソウル',
  '東京',
  '京都',
  'サモア',
  'パラオ',
  'セーシェル',
];
export function DestinationSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(0);
  const id = useId(),
    input = useRef<HTMLInputElement>(null);
  // 候補は日本語の正式名で渡し、表示だけを訳す。英語で入力しても候補を絞り込める。
  const query = value.trim().toLowerCase();
  const shown = options
    .filter(
      o =>
        !query ||
        value === '世界中' ||
        value === t('世界中') ||
        o.includes(value) ||
        t(o).toLowerCase().includes(query),
    )
    .slice(0, 15);
  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
    input.current?.focus();
  };
  return (
    <div className="search-destination destination-search">
      <Icon name="GlobeHemisphereWest" size={24} />
      <div className="field-stack">
        <label htmlFor="destination">{t('探す地域・街')}</label>
        <input
          ref={input}
          id="destination"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={id}
          aria-autocomplete="list"
          aria-activedescendant={open && shown.length ? `${id}-${active}` : undefined}
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              setOpen(true);
              setActive(
                i =>
                  (i + (e.key === 'ArrowDown' ? 1 : -1) + Math.max(shown.length, 1)) %
                  Math.max(shown.length, 1),
              );
            }
            if (e.key === 'Enter' && open && shown.length) {
              e.preventDefault();
              choose(shown[active]);
            }
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={t('世界中、北海道、ソウルなど')}
          maxLength={100}
        />
      </div>
      <button
        className="destination-toggle"
        type="button"
        aria-label={open ? t('地域の候補を閉じる') : t('地域の候補を開く')}
        aria-expanded={open}
        onMouseDown={e => e.preventDefault()}
        onClick={() => {
          setOpen(x => !x);
          setActive(0);
          input.current?.focus();
        }}
      >
        <Icon name="CaretDown" size={18} />
      </button>
      {open && (
        <div
          id={id}
          className="destination-options"
          role="listbox"
          aria-label={t('探す地域の候補')}
        >
          {shown.length ? (
            shown.map((o, i) => (
              <button
                id={`${id}-${i}`}
                key={o}
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseDown={e => e.preventDefault()}
                onClick={() => choose(o)}
              >
                {t(o)}
                {(value === o || value === t(o)) && <Icon name="Check" size={16} />}
              </button>
            ))
          ) : (
            <p>{t('入力した地名で検索できます。')}</p>
          )}
        </div>
      )}
    </div>
  );
}
