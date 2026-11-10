import { en } from './i18n-en.ts';

export type Locale = 'ja' | 'en';
type Vars = Record<string, string | number>;

const storageKey = 'elsewhere:locale';
let current: Locale = 'ja';
// サーバーが入れた日本語の題名。言語を戻すときに使う。
const japaneseTitle = typeof document === 'undefined' ? '' : document.title;
const englishTitle = 'Elsewhere | From a place you love to where you go next';
const listeners = new Set<() => void>();

export const getLocale = () => current;

/** 数値や日付の表記に使う地域。 */
export const numberLocale = () => (current === 'en' ? 'en-US' : 'ja-JP');

export function subscribeLocale(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** html の lang とタブの題名を画面の言語にそろえる。Next.js が題名を入れたあとにも呼ぶ。 */
let watchingTitle = false;
export function syncDocumentLanguage() {
  if (typeof document === 'undefined') return;
  // Next.js は描画のあとで題名を書き戻すことがあるので、英語表示の間は題名を見張る。
  if (!watchingTitle && typeof MutationObserver !== 'undefined') {
    watchingTitle = true;
    new MutationObserver(() => {
      if (current === 'en' && document.title !== englishTitle) document.title = englishTitle;
    }).observe(document.head, { subtree: true, childList: true, characterData: true });
  }
  document.documentElement.lang = current;
  const title = current === 'en' ? englishTitle : japaneseTitle;
  if (title && document.title !== title) document.title = title;
}

export function setLocale(locale: Locale) {
  if (locale === current) return;
  current = locale;
  try {
    localStorage.setItem(storageKey, locale);
  } catch {}
  syncDocumentLanguage();
  listeners.forEach(listener => listener());
}

/** ?lang=、前回の選択、ブラウザーの言語の順に決める。日本語以外のブラウザーは英語にする。 */
export function detectLocale(): Locale {
  try {
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param === 'ja' || param === 'en') return param;
    const saved = localStorage.getItem(storageKey);
    if (saved === 'ja' || saved === 'en') return saved;
  } catch {}
  const languages = typeof navigator === 'undefined' ? [] : navigator.languages || [];
  return languages.length && !languages[0].toLowerCase().startsWith('ja') ? 'en' : 'ja';
}

/** API に画面の言語を伝えるヘッダー。 */
export const localeHeaders = (): Record<string, string> => ({ 'X-Elsewhere-Locale': current });

const fill = (text: string, vars?: Vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (all, key) => (key in vars ? String(vars[key]) : all)) : text;

// サーバーが数値などを埋め込んだ文も訳せるよう、{名前} を含む項目は正規表現でも照合する。
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = Object.entries(en)
  .filter(([key]) => /\{\w+\}/.test(key))
  .map(([key, value]) => {
    const names: string[] = [];
    const source = key
      .split(/(\{\w+\})/)
      .map(part => {
        const name = part.match(/^\{(\w+)\}$/)?.[1];
        if (!name) return escape(part);
        names.push(name);
        return '(.+?)';
      })
      .join('');
    return { regex: new RegExp(`^${source}$`, 's'), names, value };
  });

/**
 * 日本語の文をそのままキーにして、英語表示のときだけ訳を返す。訳がなければ日本語を返す。
 * サーバーから届いた固定の文（エラーなど）にも使える。
 */
export function t(text: string, vars?: Vars, locale: Locale = current): string {
  if (!text || locale === 'ja') return fill(text, vars);
  const exact = en[text];
  if (exact !== undefined) return fill(exact, vars);
  if (!vars)
    for (const pattern of patterns) {
      const match = text.match(pattern.regex);
      if (match)
        return fill(
          pattern.value,
          Object.fromEntries(pattern.names.map((name, i) => [name, match[i + 1]])),
        );
    }
  return fill(text, vars);
}
