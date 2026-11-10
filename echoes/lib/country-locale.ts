import type { Place } from './places.ts';

// 国・地域（ISO 3166-1）ごとの通貨（ISO 4217）。2026年11月時点。
// ブルガリアは2026年1月からユーロ、キュラソーとシント・マールテンは2025年からカリブ・ギルダー。
const currencyTable =
  'AD:EUR AE:AED AF:AFN AG:XCD AI:XCD AL:ALL AM:AMD AO:AOA AR:ARS AS:USD AT:EUR AU:AUD AW:AWG AX:EUR AZ:AZN ' +
  'BA:BAM BB:BBD BD:BDT BE:EUR BF:XOF BG:EUR BH:BHD BI:BIF BJ:XOF BL:EUR BM:BMD BN:BND BO:BOB BQ:USD BR:BRL BS:BSD BT:BTN BV:NOK BW:BWP BY:BYN BZ:BZD ' +
  'CA:CAD CC:AUD CD:CDF CF:XAF CG:XAF CH:CHF CI:XOF CK:NZD CL:CLP CM:XAF CN:CNY CO:COP CR:CRC CU:CUP CV:CVE CW:XCG CX:AUD CY:EUR CZ:CZK ' +
  'DE:EUR DJ:DJF DK:DKK DM:XCD DO:DOP DZ:DZD EC:USD EE:EUR EG:EGP EH:MAD ER:ERN ES:EUR ET:ETB ' +
  'FI:EUR FJ:FJD FK:FKP FM:USD FO:DKK FR:EUR GA:XAF GB:GBP GD:XCD GE:GEL GF:EUR GG:GBP GH:GHS GI:GIP GL:DKK GM:GMD GN:GNF GP:EUR GQ:XAF GR:EUR GS:GBP GT:GTQ GU:USD GW:XOF GY:GYD ' +
  'HK:HKD HM:AUD HN:HNL HR:EUR HT:HTG HU:HUF ID:IDR IE:EUR IL:ILS IM:GBP IN:INR IO:USD IQ:IQD IR:IRR IS:ISK IT:EUR ' +
  'JE:GBP JM:JMD JO:JOD JP:JPY KE:KES KG:KGS KH:KHR KI:AUD KM:KMF KN:XCD KP:KPW KR:KRW KW:KWD KY:KYD KZ:KZT ' +
  'LA:LAK LB:LBP LC:XCD LI:CHF LK:LKR LR:LRD LS:LSL LT:EUR LU:EUR LV:EUR LY:LYD ' +
  'MA:MAD MC:EUR MD:MDL ME:EUR MF:EUR MG:MGA MH:USD MK:MKD ML:XOF MM:MMK MN:MNT MO:MOP MP:USD MQ:EUR MR:MRU MS:XCD MT:EUR MU:MUR MV:MVR MW:MWK MX:MXN MY:MYR MZ:MZN ' +
  'NA:NAD NC:XPF NE:XOF NF:AUD NG:NGN NI:NIO NL:EUR NO:NOK NP:NPR NR:AUD NU:NZD NZ:NZD OM:OMR ' +
  'PA:PAB PE:PEN PF:XPF PG:PGK PH:PHP PK:PKR PL:PLN PM:EUR PN:NZD PR:USD PS:ILS PT:EUR PW:USD PY:PYG QA:QAR ' +
  'RE:EUR RO:RON RS:RSD RU:RUB RW:RWF SA:SAR SB:SBD SC:SCR SD:SDG SE:SEK SG:SGD SH:SHP SI:EUR SJ:NOK SK:EUR SL:SLE SM:EUR SN:XOF SO:SOS SR:SRD SS:SSP ST:STN SV:USD SX:XCG SY:SYP SZ:SZL ' +
  'TC:USD TD:XAF TF:EUR TG:XOF TH:THB TJ:TJS TK:NZD TL:USD TM:TMT TN:TND TO:TOP TR:TRY TT:TTD TV:AUD TW:TWD TZ:TZS ' +
  'UA:UAH UG:UGX UM:USD US:USD UY:UYU UZ:UZS VA:EUR VC:XCD VE:VES VG:USD VI:USD VN:VND VU:VUV WF:XPF WS:WST XK:EUR YE:YER YT:EUR ZA:ZAR ZM:ZMW ZW:ZWG';
const currencies = new Map(
  currencyTable.split(' ').map(pair => pair.split(':') as [string, string]),
);

// 公用語が複数ある国や、CLDR の推定（最も話者の多い言語）だけでは足りない国。
const languageOverrides: Record<string, string[]> = {
  AF: ['ps', 'prs'],
  AS: ['sm', 'en'],
  AW: ['nl', 'pap'],
  BA: ['bs', 'hr', 'sr'],
  BE: ['nl', 'fr', 'de'],
  BI: ['rn', 'fr'],
  BQ: ['nl', 'pap'],
  BY: ['be', 'ru'],
  CA: ['en', 'fr'],
  CF: ['fr', 'sg'],
  CH: ['de', 'fr', 'it'],
  CK: ['en', 'rar'],
  CM: ['fr', 'en'],
  CW: ['pap', 'nl', 'en'],
  CY: ['el', 'tr'],
  DJ: ['fr', 'ar'],
  FI: ['fi', 'sv'],
  FJ: ['en', 'fj'],
  GH: ['en', 'ak'],
  GL: ['kl', 'da'],
  GU: ['en', 'ch'],
  HK: ['zh', 'en'],
  HT: ['ht', 'fr'],
  IE: ['en', 'ga'],
  IL: ['he', 'ar'],
  IN: ['hi', 'en'],
  IQ: ['ar', 'ku'],
  KE: ['sw', 'en'],
  KG: ['ky', 'ru'],
  KI: ['en', 'gil'],
  KZ: ['kk', 'ru'],
  LK: ['si', 'ta'],
  LS: ['st', 'en'],
  LU: ['lb', 'fr', 'de'],
  MG: ['mg', 'fr'],
  MH: ['mh', 'en'],
  ML: ['bm', 'fr'],
  MO: ['zh', 'pt'],
  MP: ['en', 'ch'],
  MT: ['mt', 'en'],
  MU: ['en', 'fr'],
  NA: ['en', 'af'],
  NE: ['ha', 'fr'],
  NO: ['no'],
  NR: ['na', 'en'],
  NZ: ['en', 'mi'],
  PE: ['es', 'qu'],
  PG: ['tpi', 'en'],
  PH: ['fil', 'en'],
  PK: ['ur', 'en'],
  PR: ['es', 'en'],
  PW: ['pau', 'en'],
  PY: ['es', 'gn'],
  RW: ['rw', 'en', 'fr'],
  SC: ['crs', 'en', 'fr'],
  SG: ['en', 'zh', 'ms', 'ta'],
  SJ: ['no'],
  SN: ['fr', 'wo'],
  SS: ['en', 'ar'],
  SX: ['en', 'nl'],
  SZ: ['en', 'ss'],
  TD: ['fr', 'ar'],
  TK: ['tkl', 'en'],
  TL: ['tet', 'pt'],
  TO: ['to', 'en'],
  TV: ['tvl', 'en'],
  TZ: ['sw', 'en'],
  UG: ['en', 'sw'],
  VU: ['bi', 'en', 'fr'],
  WS: ['sm', 'en'],
  ZA: ['en', 'zu', 'xh', 'af'],
  ZW: ['en', 'sn', 'nd'],
};

export type CountryLocale = { code: string; languages: string[]; currency?: string };

/** 国・地域の主な言語と通貨。国単位の目安で、地域ごとの違いは扱わない。 */
export function countryLocale(code: string | undefined): CountryLocale | null {
  const region = code?.trim().toUpperCase();
  if (!region || !/^[A-Z]{2}$/.test(region) || !currencies.has(region)) return null;
  let languages = languageOverrides[region];
  if (!languages) {
    try {
      const likely = new Intl.Locale(`und-${region}`).maximize().language;
      languages = likely && likely !== 'und' ? [likely] : [];
    } catch {
      languages = [];
    }
  }
  return { code: region, languages, currency: currencies.get(region) };
}

let names: Map<string, string> | undefined;
/** 国名（日本語・英語）から国コードを引く。国コードのない紹介用データで使う。 */
function codeFromName(country: string) {
  if (!names) {
    names = new Map();
    for (const lang of ['ja', 'en']) {
      const display = new Intl.DisplayNames([lang], { type: 'region' });
      for (const code of currencies.keys()) {
        const name = display.of(code);
        if (name && name !== code) names.set(name.toLowerCase(), code);
      }
    }
  }
  return names.get(country.trim().toLowerCase());
}

export function placeCountryLocale(
  place: Pick<Place, 'countryCode' | 'country' | 'locationUnknown'>,
): CountryLocale | null {
  if (place.locationUnknown) return null;
  return countryLocale(place.countryCode || (place.country ? codeFromName(place.country) : ''));
}
