import { AsyncLocalStorage } from 'node:async_hooks';

export type Locale = 'ja' | 'en';

const storage = new AsyncLocalStorage<Locale>();

export const parseLocale = (value: unknown): Locale => (value === 'en' ? 'en' : 'ja');

/** 画面の言語は X-Elsewhere-Locale ヘッダーで受け取る。指定がなければ日本語。 */
export const requestLocaleFrom = (request: Request): Locale =>
  parseLocale(request.headers.get('x-elsewhere-locale'));

/** API の処理中に、利用者が選んだ言語を返す。 */
export const currentLocale = (): Locale => storage.getStore() ?? 'ja';

export function withLocale<T>(locale: Locale, run: () => T): T {
  return storage.run(locale, run);
}
