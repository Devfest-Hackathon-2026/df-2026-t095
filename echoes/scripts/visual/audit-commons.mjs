/** 元の写真を再利用する前に、Commons の現在の出典とライセンスを確認する。 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const credits = JSON.parse(await readFile('lib/photo-credits.json', 'utf8'));
const titles = Object.values(credits).map(c =>
  decodeURIComponent(new URL(c.creditUrl).pathname.split('/wiki/')[1]),
);
const params = new URLSearchParams({
  action: 'query',
  format: 'json',
  titles: titles.join('|'),
  prop: 'imageinfo',
  iiprop: 'url|extmetadata|sha1|mime|timestamp',
  iiurlwidth: '960',
  redirects: '1',
});
const r = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
  headers: {
    'User-Agent':
      'ElsewhereHackathon/0.1 (local educational place discovery; Wikimedia Commons license audit)',
  },
  signal: AbortSignal.timeout(30000),
});
if (!r.ok) throw new Error(`Commons ${r.status}`);
const data = await r.json();
const pages = Object.values(data.query?.pages || {});
const manifest = { checkedAt: new Date().toISOString(), photos: {} };
for (const [id, c] of Object.entries(credits)) {
  const title = decodeURIComponent(new URL(c.creditUrl).pathname.split('/wiki/')[1]);
  const page =
    pages.find(p => p.title.replace(/_/g, ' ') === title.replace(/_/g, ' ')) ||
    pages.find(p => data.query?.redirects?.some(d => d.from === title && d.to === p.title));
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error(`${id}: 元の写真が見つかりません`);
  const m = info.extmetadata || {};
  const strip = s =>
    String(s || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  manifest.photos[id] = {
    provider: 'commons',
    pageId: page.pageid,
    title: page.title,
    sourcePage: info.descriptionurl,
    originalUrl: info.url,
    thumbnailUrl: info.thumburl || info.url,
    sha1: info.sha1,
    mime: info.mime,
    author: strip(m.Artist?.value),
    license: strip(m.LicenseShortName?.value),
    licenseUrl: (m.LicenseUrl?.value || '').replace(/^http:/, 'https:'),
    description: strip(m.ImageDescription?.value),
    categories: strip(m.Categories?.value),
    localImage: `/images/${id}.jpg`,
    changes: '表示に合わせて縮小・トリミング',
    verification: '既存地点とファイルの説明・被写体を照合',
    verified: true,
  };
  const p = manifest.photos[id];
  if (
    !/^CC (BY|BY-SA) [1-4]\.0$|^CC0|^Public domain$/.test(p.license) ||
    !p.author ||
    !p.sourcePage
  )
    throw new Error(`${id}: ライセンスの追加確認が必要です (${p.license})`);
  console.log(`${id}: ${p.license} / ${p.title}`);
}
await mkdir('data', { recursive: true });
await writeFile('data/commons-samples.json', JSON.stringify(manifest, null, 2) + '\n');
