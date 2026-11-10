'use client';
import { localeHeaders, t } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';
import { places, type Place } from '@/lib/places';
import { Icon } from './icons';
type Prediction = { placeId: string; name: string; address: string };
export function SourceSearch({
  query,
  setQuery,
  source,
  live,
  resolving,
  onChoose,
  onPrediction,
}: {
  query: string;
  setQuery: (q: string) => void;
  source: Place;
  live: boolean;
  resolving: boolean;
  onChoose: (p: Place) => void;
  onPrediction: (placeId: string, sessionToken?: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [predictionQuery, setPredictionQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const token = useRef('');
  useEffect(() => {
    token.current = crypto.randomUUID();
  }, []);
  const sample = places.filter(p => `${p.name} ${p.city} ${p.country}`.includes(query)).slice(0, 6);
  const options: ({ kind: 'google'; place: Prediction } | { kind: 'sample'; place: Place })[] = live
    ? (predictionQuery === query ? predictions : []).map(place => ({ kind: 'google', place }))
    : sample.map(place => ({ kind: 'sample', place }));
  useEffect(() => {
    if (!live || !open || query.trim().length < 2) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setBusy(true);
      setError('');
      fetch(
        `/api/search?q=${encodeURIComponent(query)}&sessionToken=${encodeURIComponent(token.current)}`,
        { signal: controller.signal, headers: localeHeaders() },
      )
        .then(async r => {
          const d = (await r.json()) as { suggestions?: Prediction[]; error?: string };
          if (!r.ok) throw new Error(d.error || t('候補を取得できませんでした。'));
          setPredictions(d.suggestions || []);
          setPredictionQuery(query);
          setIndex(0);
        })
        .catch(e => {
          if (!controller.signal.aborted)
            setError(e instanceof Error ? e.message : t('候補を取得できませんでした。'));
        })
        .finally(() => {
          if (!controller.signal.aborted) setBusy(false);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, live]);
  const choose = (i: number) => {
    const item = options[i];
    if (!item) return;
    setOpen(false);
    if (item.kind === 'sample') onChoose(item.place);
    else {
      void onPrediction(item.place.placeId, token.current);
      token.current = crypto.randomUUID();
    }
  };
  return (
    <div className="search-source">
      <Icon name="MapPin" size={23} />
      <div className="field-stack">
        <label htmlFor="source-place">{t('好きな場所・出発点')}</label>
        <input
          id="source-place"
          role="combobox"
          aria-expanded={open}
          aria-controls="source-options"
          aria-autocomplete="list"
          aria-activedescendant={open && options.length ? `source-option-${index}` : undefined}
          autoComplete="off"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            setIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown' && options.length) {
              e.preventDefault();
              setOpen(true);
              setIndex(i => (i + 1) % options.length);
            }
            if (e.key === 'ArrowUp' && options.length) {
              e.preventDefault();
              setIndex(i => (i - 1 + options.length) % options.length);
            }
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'Enter' && open && options.length) {
              e.preventDefault();
              choose(index);
            } else if (e.key === 'Enter') setOpen(false);
          }}
          placeholder={t('例：ニューハウン、コペンハーゲン')}
        />
      </div>
      <span className="source-city">{resolving ? t('場所を確認しています…') : source.city}</span>
      {open && (
        <div
          id="source-options"
          className="source-options"
          role="listbox"
          aria-label={t('出発点の候補')}
        >
          <div className="dropdown-label">
            {live ? t('Google Maps で場所を探す') : t('サンプルの場所から選ぶ')}
          </div>
          {busy && (
            <p className="dropdown-message" role="status">
              {t('候補を探しています…')}
            </p>
          )}
          {!busy && error && <p className="dropdown-message">{t(error)}</p>}
          {!busy && !error && !options.length && (
            <p className="dropdown-message">
              {query.length < 2
                ? t('地名を 2 文字以上で入力してください。')
                : t('候補が見つからない場合は、市区町村名も入れて検索できます。')}
            </p>
          )}
          {options.map((item, i) => (
            <button
              id={`source-option-${i}`}
              key={item.kind === 'google' ? item.place.placeId : item.place.id}
              type="button"
              role="option"
              aria-selected={i === index}
              className={`source-option ${i === index ? 'option-highlight' : ''}`}
              onMouseDown={e => e.preventDefault()}
              onClick={() => choose(i)}
            >
              <Icon name="MapPin" size={18} />
              <span>
                <strong>{item.place.name}</strong>
                <small>
                  {item.kind === 'google'
                    ? item.place.address
                    : `${item.place.city}・${item.place.country}`}
                </small>
              </span>
            </button>
          ))}
          {live && <div className="autocomplete-attribution">Google Maps</div>}
        </div>
      )}
    </div>
  );
}
