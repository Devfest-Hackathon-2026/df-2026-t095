'use client';
import { useSyncExternalStore } from 'react';
import { getLocale, subscribeLocale, type Locale } from './i18n';

/** 言語が切り替わったら画面を描き直す。サーバーでの描画は日本語。 */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribeLocale, getLocale, () => 'ja');
}
