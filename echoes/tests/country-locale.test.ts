import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countryLocale, placeCountryLocale } from '../lib/country-locale.ts';

test('country codes map to main languages and currency', () => {
  assert.deepEqual(countryLocale('JP'), { code: 'JP', languages: ['ja'], currency: 'JPY' });
  assert.deepEqual(countryLocale('ca'), { code: 'CA', languages: ['en', 'fr'], currency: 'CAD' });
  assert.equal(countryLocale('DE')?.currency, 'EUR');
  assert.equal(countryLocale('BG')?.currency, 'EUR');
  assert.equal(countryLocale('ZZ'), null);
  assert.equal(countryLocale(undefined), null);
});

test('places without a country code are matched by country name', () => {
  assert.equal(placeCountryLocale({ country: 'スロベニア' })?.code, 'SI');
  assert.equal(placeCountryLocale({ country: 'United Kingdom' })?.code, 'GB');
  assert.equal(placeCountryLocale({ country: '日本', locationUnknown: true }), null);
});
