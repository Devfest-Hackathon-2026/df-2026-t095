import { cloudHeaders, googleProject } from './google-auth.ts';
import { en } from './i18n-en.ts';
import { currentLocale } from './request-locale.ts';
import { createLruCache } from './search-cache.ts';

const japanese = /[ぁ-んァ-ヶ一-龯]/u;
// 出典・撮影者・ライセンスは翻訳しない。写真や外部ページの識別子もそのまま返す。
const skipKeys = new Set([
  'id',
  'placeId',
  'catalogId',
  'image',
  'imagePage',
  'googleMapsUri',
  'websiteUri',
  'url',
  'uri',
  'verification',
  'attribution',
  'license',
  'model',
  'code',
  'countryCode',
  'commonsPhoto',
  'sourcePhoto',
  'candidatePhoto',
  'photoAuthors',
  'sources',
  'uploadPhoto',
]);
const translations = createLruCache<string>(20000, 7 * 86400000);

type Json = unknown;
const isRecord = (value: Json): value is Record<string, Json> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** Google Maps の情報を含む場所（placeId がある）は書き換えない。 */
function walk(value: Json, visit: (text: string) => string): Json {
  if (typeof value === 'string') return japanese.test(value) ? visit(value) : value;
  if (Array.isArray(value)) return value.map(item => walk(item, visit));
  if (!isRecord(value) || value.placeId) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, skipKeys.has(key) ? item : walk(item, visit)]),
  );
}

async function translateBatch(texts: string[]) {
  const response = await fetch(
    `https://translation.googleapis.com/v3/projects/${googleProject()}/locations/global:translateText`,
    {
      method: 'POST',
      headers: await cloudHeaders(),
      body: JSON.stringify({
        contents: texts,
        sourceLanguageCode: 'ja',
        targetLanguageCode: 'en',
        mimeType: 'text/plain',
      }),
      signal: AbortSignal.timeout(20000),
    },
  );
  if (!response.ok) throw new Error(`Translation ${response.status}`);
  const data = (await response.json()) as { translations: { translatedText: string }[] };
  texts.forEach((text, i) => {
    const translated = data.translations[i]?.translatedText;
    if (translated) translations.set(text, translated);
  });
}

/**
 * 英語表示のとき、このアプリが用意した文章（登録カタログ、写真の比較、検索の説明）を英語にする。
 * 翻訳できなければ元の日本語を返し、検索自体は止めない。
 */
export async function translateOwnContent<T>(value: T): Promise<T> {
  if (currentLocale() !== 'en' || !process.env.GOOGLE_CLOUD_PROJECT) return value;
  const found = new Set<string>();
  walk(value, text => {
    found.add(text);
    return text;
  });
  // 画面の訳と同じ文は辞書を使い、機械翻訳しない。
  const missing = [...found].filter(text => !(text in en) && translations.get(text) === undefined);
  try {
    for (let i = 0; i < missing.length; i += 100) await translateBatch(missing.slice(i, i + 100));
  } catch (error) {
    console.error('Translation failed', error instanceof Error ? error.message.slice(0, 120) : '');
  }
  return walk(value, text => en[text] ?? translations.get(text) ?? text) as T;
}
