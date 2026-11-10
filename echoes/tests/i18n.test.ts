import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { t } from '../lib/i18n.ts';
import { en } from '../lib/i18n-en.ts';
import { climateClasses } from '../lib/climate-types.ts';
import { factorLabels } from '../lib/factor-types.ts';
import { places, qualities } from '../lib/places.ts';
import { seaColorOptions, townscapeOptions } from '../lib/scenery.ts';

const clientFiles = [
  'app/page.tsx',
  'app/not-found.tsx',
  ...readdirSync('components').map(file => `components/${file}`),
  ...readdirSync('lib')
    .filter(
      file => /^use-.*\.ts$/.test(file) || ['auth-messages.ts', 'discovery-api.ts'].includes(file),
    )
    .map(file => `lib/${file}`),
];

test('Japanese is returned unchanged and values are filled in', () => {
  assert.equal(t('似た場所を探す', undefined, 'ja'), '似た場所を探す');
  assert.equal(
    t('{v0} 件の場所を保存しています。', { v0: 3 }, 'ja'),
    '3 件の場所を保存しています。',
  );
  assert.equal(t('似た場所を探す', undefined, 'en'), 'Find similar places');
  assert.equal(t('{v0} 件の場所を保存しています。', { v0: 3 }, 'en'), '3 saved places.');
  assert.equal(t('まだ訳していない文', undefined, 'en'), 'まだ訳していない文');
});

test('messages built by the server are matched by their pattern', () => {
  assert.equal(
    t('写真の地形や構図を 6 候補で見比べています。', undefined, 'en'),
    'Terrain and composition were compared for 6 candidates.',
  );
});

test('every t() key in the interface has an English translation', () => {
  const missing: string[] = [];
  for (const file of clientFiles) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\bt\(\s*'((?:\\.|[^'\\])*)'/g)) {
      const key = match[1].replace(/\\'/g, "'");
      if (!(key in en)) missing.push(`${file}: ${key}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('display data defined outside components is translated', () => {
  const texts = [
    ...qualities.flatMap(q => [q.label, q.description]),
    ...climateClasses.map(([, label]) => label),
    ...seaColorOptions.map(([, label]) => label),
    ...townscapeOptions.map(([, label]) => label),
    ...Object.values(factorLabels),
    ...places.flatMap(p => [
      p.name,
      p.city,
      p.country,
      p.description,
      p.detail,
      p.difference,
      p.bestFor,
    ]),
  ];
  assert.deepEqual(
    texts.filter(text => text && !(text in en)),
    [],
  );
});

test('placeholders in translations match the Japanese keys', () => {
  const names = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
  const mismatched = Object.entries(en).filter(
    ([key, value]) =>
      // The tourism figure is given in different units: 万人 in Japanese, millions in English.
      key !== '国際観光客 約{man}万人（{year}年）' && names(key).join() !== names(value).join(),
  );
  assert.deepEqual(mismatched, []);
});
