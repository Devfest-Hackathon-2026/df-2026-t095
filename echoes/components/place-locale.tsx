'use client';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/use-locale';
import type { Place } from '@/lib/places';
import { placeCountryLocale } from '@/lib/country-locale';
import { Icon } from './icons';

const displays = new Map<string, Intl.DisplayNames>();
function displayName(locale: string, type: 'language' | 'currency', code: string) {
  const key = `${locale}:${type}`;
  let display = displays.get(key);
  if (!display) {
    display = new Intl.DisplayNames([locale], { type, fallback: 'code' });
    displays.set(key, display);
  }
  try {
    return display.of(code) || code;
  } catch {
    return code;
  }
}

/** 候補の国・地域で主に使われる言語と通貨を小さく添える。 */
export function PlaceLocale({ place }: { place: Place }) {
  const locale = useLocale();
  const info = placeCountryLocale(place);
  if (!info || (!info.languages.length && !info.currency)) return null;
  const languages = info.languages.map(code => displayName(locale, 'language', code));
  const currency = info.currency && displayName(locale, 'currency', info.currency);
  return (
    <p
      className="result-locale"
      title={t('国・地域の主な言語と通貨です。地域によって異なる場合があります。')}
    >
      {languages.length > 0 && (
        <span>
          <Icon name="Translate" size={13} />
          <span className="visually-hidden">{t('言語')}</span>
          {languages.join(t('・'))}
        </span>
      )}
      {currency && (
        <span>
          <Icon name="Coins" size={13} />
          <span className="visually-hidden">{t('通貨')}</span>
          {currency === info.currency ? currency : `${currency} (${info.currency})`}
        </span>
      )}
    </p>
  );
}
