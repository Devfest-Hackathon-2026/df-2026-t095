import type { CommonsPhoto, VisualEvidence, UploadPhoto } from './visual-types.ts';
import type { PlaceFactors, FactorMatch } from './factor-types.ts';
import type { Scenery, SceneryMatch } from './scenery.ts';
export const qualities = [
  {
    id: 'water',
    label: '水辺を歩きたい',
    description: '川や運河に沿って歩けること',
    icon: 'Waves',
  },
  {
    id: 'green',
    label: '緑に囲まれたい',
    description: '木々や庭園など、緑が身近にあること',
    icon: 'Tree',
  },
  {
    id: 'quiet',
    label: 'のんびり過ごしたい',
    description: '立ち止まったり、ゆっくり眺めたりできること',
    icon: 'Wind',
  },
  {
    id: 'walk',
    label: '街歩きを楽しみたい',
    description: '歩いて景色や街並みを楽しめること',
    icon: 'Footprints',
  },
  {
    id: 'cafes',
    label: 'カフェに立ち寄りたい',
    description: '散歩の途中にひと息つけること',
    icon: 'Coffee',
  },
  {
    id: 'history',
    label: '歴史を感じたい',
    description: '古い街並みや建物が残っていること',
    icon: 'Buildings',
  },
] as const;
export type Quality = (typeof qualities)[number]['id'];
export type SourceLink = { title: string; url: string };
export type Place = {
  id: string;
  name: string;
  city: string;
  country: string;
  continent: string;
  lat: number;
  lng: number;
  image: string;
  imagePage?: string;
  commonsTitle?: string;
  description: string;
  detail: string;
  difference: string;
  bestFor: string;
  features: Record<Quality, number>;
  sources: SourceLink[];
  placeId?: string;
  photoAuthors?: { name: string; url: string }[];
  googleMapsUri?: string;
  websiteUri?: string;
  address?: string;
  profiled?: boolean;
  publicPlace?: boolean;
  catalogId?: string;
  locationUnknown?: boolean;
  uploadPhoto?: UploadPhoto;
  commonsPhoto?: CommonsPhoto;
  visual?: VisualEvidence;
  viewRange?: number;
  viewExtent?: { widthKm: number; heightKm: number };
  aliases?: string[];
  countryCode?: string;
  landform?: string | null;
  referenceHalfKm?: number;
  referenceRegion?: { north: number; south: number; east: number; west: number };
  climate?: { code: string; label: string; period: string; source: string; nearby: boolean } | null;
  tourism?: { arrivals: number; year: number; source: string } | null;
  factors?: PlaceFactors;
  factorMatch?: FactorMatch;
  featureEvidence?: Partial<Record<Quality, { status: 'known' | 'unknown'; source?: SourceLink }>>;
  scenery?: Scenery;
  sceneryMatch?: SceneryMatch;
};
export const defaultPreferences: Quality[] = ['walk', 'cafes', 'history'];
export const places: Place[] = [
  {
    id: 'kamo',
    name: '鴨川',
    city: '京都',
    country: '日本',
    continent: 'Asia',
    lat: 35.0295,
    lng: 135.7724,
    image: '/images/kamo.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Kamo_River',
    description: '京都の街なかで、水と緑を身近に感じられる場所です。',
    detail: '出町柳の鴨川と高野川が合流するあたりから、川沿いの道を歩いてみてください。',
    difference: '運河や庭園よりも視界が開けた、街なかの河川敷です。',
    bestFor: '川沿いをゆっくり散歩するのに向いています',
    features: { water: 5, green: 4, quiet: 4, walk: 5, cafes: 3, history: 3 },
    sources: [
      {
        title: 'Japan National Tourism Organization',
        url: 'https://www.japan.travel/en/spot/1183/',
      },
    ],
  },
  {
    id: 'ljubljana',
    name: 'リュブリャニツァ川沿い',
    city: 'リュブリャナ',
    country: 'スロベニア',
    continent: 'Europe',
    lat: 46.0488,
    lng: 14.5064,
    image: '/images/ljubljana.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Ljubljanica',
    description: '川沿いの緑と旧市街の街並みを、一緒に楽しめます。',
    detail: '靴屋橋の周辺から川沿いを歩き、シュピツァのあたりへ。途中で旧市街にも立ち寄れます。',
    difference:
      '中心部は古い建物やカフェのテラスが川に近く、街並みを身近に感じます。静かさは場所や時間帯で変わります。',
    bestFor: 'カフェに寄りながら川沿いを歩けます',
    features: { water: 5, green: 4, quiet: 4, walk: 5, cafes: 5, history: 5 },
    sources: [{ title: 'Visit Ljubljana', url: 'https://www.visitljubljana.com/en/visitors/' }],
  },
  {
    id: 'seoul',
    name: '清渓川',
    city: 'ソウル',
    country: '韓国',
    continent: 'Asia',
    lat: 37.5692,
    lng: 126.9787,
    image: '/images/seoul.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Cheonggyecheon',
    description: 'ソウルの街路より一段低いところを、小さな川が流れています。',
    detail: '清渓広場から川に沿って東へ。橋や飛び石、水辺の道から、ソウルの街を眺められます。',
    difference: '川幅が狭く、街路の下に整備された水辺です。中心部は人が多いこともあります。',
    bestFor: '街なかで水辺の散歩を楽しめます',
    features: { water: 5, green: 3, quiet: 3, walk: 5, cafes: 4, history: 3 },
    sources: [
      {
        title: 'Seoul Metropolitan Government',
        url: 'https://english.seoul.go.kr/service/amusement/stream/1-cheonggyecheon/',
      },
    ],
  },
  {
    id: 'paris',
    name: 'セーヌ川沿い',
    city: 'パリ',
    country: 'フランス',
    continent: 'Europe',
    lat: 48.8586,
    lng: 2.3474,
    image: '/images/paris.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Seine',
    description: '川沿いを歩くたびに、パリの街並みが見えてきます。',
    detail: 'パルク・リヴ・ド・セーヌの遊歩道から、シテ島や橋のある景色を眺めてみてください。',
    difference:
      '大きな建物や石造りの護岸が目立ち、芝生の河川敷は少なめです。混雑は場所や時間帯で変わります。',
    bestFor: '水辺で歴史ある街並みを楽しめます',
    features: { water: 5, green: 2, quiet: 2, walk: 5, cafes: 4, history: 5 },
    sources: [
      {
        title: 'Paris tourism office',
        url: 'https://parisjetaime.com/eng/transport/bords-de-seine-p1977',
      },
    ],
  },
  {
    id: 'munich',
    name: 'イザール川沿い',
    city: 'ミュンヘン',
    country: 'ドイツ',
    continent: 'Europe',
    lat: 48.1247,
    lng: 11.5664,
    image: '/images/munich.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Isar',
    description: '街の暮らしのすぐそばに、自然の川辺が広がります。',
    detail: '中心部の南にあるフラウヒャー周辺へ。川沿いの道から、木々や砂利の河原を楽しめます。',
    difference:
      '砂利の河原が広く、自然の川に近い景色です。旧市街の散策とは少し離れた過ごし方になります。',
    bestFor: '緑の多い川辺で過ごせます',
    features: { water: 5, green: 5, quiet: 4, walk: 5, cafes: 2, history: 1 },
    sources: [{ title: 'Munich tourism office', url: 'https://www.munich.travel/en' }],
  },
  {
    id: 'amsterdam',
    name: 'フォンデル公園',
    city: 'アムステルダム',
    country: 'オランダ',
    continent: 'Europe',
    lat: 52.3579,
    lng: 4.8686,
    image: '/images/amsterdam.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Vondelpark',
    description: '芝生や曲がりくねった道があり、ゆっくり過ごせる公園です。',
    detail: '東側の入口から、池や芝生をつなぐ道へ。中央の道だけでなく、脇道も歩いてみてください。',
    difference:
      '川沿いではなく、池のある都市公園です。歩行者と自転車が同じ道を使う場所もあります。',
    bestFor: '緑の中で気ままに散歩できます',
    features: { water: 2, green: 5, quiet: 3, walk: 5, cafes: 4, history: 2 },
    sources: [
      {
        title: 'I amsterdam',
        url: 'https://www.iamsterdam.com/en/see-and-do/nature-and-active/parks-and-green-spaces/vondelpark',
      },
    ],
  },
  {
    id: 'ueno',
    name: '上野公園',
    city: '東京',
    country: '日本',
    continent: 'Asia',
    lat: 35.7146,
    lng: 139.7732,
    image: '/images/ueno.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Ueno_Park',
    description: '池の周りを歩きながら、お寺や博物館にも立ち寄れます。',
    detail: '不忍池の周りを散歩してから、公園内のお寺や博物館へ足を延ばせます。',
    difference: '広い河川敷とは違い、文化施設が集まる公園です。催しや桜の時季には混み合います。',
    bestFor: '散歩と文化施設巡りを楽しめます',
    features: { water: 3, green: 5, quiet: 2, walk: 5, cafes: 3, history: 5 },
    sources: [{ title: 'GO TOKYO', url: 'https://www.gotokyo.org/en/spot/30/index.html' }],
  },
  {
    id: 'philosopher',
    name: '哲学の道',
    city: '京都',
    country: '日本',
    continent: 'Asia',
    lat: 35.0267,
    lng: 135.7944,
    image: '/images/philosopher.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Philosopher%27s_Path',
    description: '小さな水路と木々に沿って、ゆっくり歩ける道です。',
    detail:
      '銀閣寺から南禅寺にかけて、水路沿いの道を歩けます。周辺の小道にも立ち寄ってみてください。',
    difference: '道も水路も幅が狭く、お寺が近くにあります。桜の時季は特に混み合います。',
    bestFor: '京都の古い街並みをゆっくり歩けます',
    features: { water: 4, green: 5, quiet: 4, walk: 5, cafes: 4, history: 5 },
    sources: [{ title: 'Kyoto City official travel guide', url: 'https://kyoto.travel/en' }],
  },
  {
    id: 'copenhagen',
    name: 'ニューハウン',
    city: 'コペンハーゲン',
    country: 'デンマーク',
    continent: 'Europe',
    lat: 55.6797,
    lng: 12.5908,
    image: '/images/copenhagen.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Nyhavn',
    description: '色とりどりの古い建物が、港の水面に映ります。',
    detail:
      'コンゲンス・ニュートー広場から運河沿いを港の方へ。古い街並みや係留された船を眺められます。',
    difference:
      '飲食店や船の往来がある、にぎやかな港です。緑の中で静かに過ごす川辺とは雰囲気が異なります。',
    bestFor: 'カフェと色鮮やかな水辺の景色を楽しめます',
    features: { water: 5, green: 1, quiet: 1, walk: 4, cafes: 5, history: 5 },
    sources: [
      {
        title: 'Visit Copenhagen',
        url: 'https://www.visitcopenhagen.com/copenhagen/planning/nyhavn-gdk474735',
      },
    ],
  },
  {
    id: 'london',
    name: 'リージェンツ運河',
    city: 'ロンドン',
    country: 'イギリス',
    continent: 'Europe',
    lat: 51.5356,
    lng: -0.1693,
    image: '/images/london.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Regent%27s_Canal',
    description: 'にぎやかなロンドンの中で、運河沿いの道を歩けます。',
    detail:
      'リージェンツ・パークやリトル・ベニス周辺の運河沿いへ。船や水辺の街並みは、歩く区間によって変わります。',
    difference:
      '船も通る細い運河で、道は歩行者などが共用しています。路面や入りやすさ、混雑は区間によって異なります。',
    bestFor: '大通りを離れて運河沿いを散歩できます',
    features: { water: 5, green: 4, quiet: 4, walk: 4, cafes: 4, history: 4 },
    sources: [
      {
        title: 'Canal & River Trust',
        url: 'https://canalrivertrust.org.uk/canals-and-rivers/regents-canal',
      },
    ],
  },
  {
    id: 'singapore',
    name: 'ビシャン・アンモキオ公園',
    city: 'シンガポール',
    country: 'シンガポール',
    continent: 'Asia',
    lat: 1.3622,
    lng: 103.8463,
    image: '/images/singapore.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Bishan-Ang_Mo_Kio_Park',
    description: '広い緑地の中を、川がゆるやかに曲がって流れています。',
    detail: '川沿いの道や芝生を歩けます。自然に近い川の形を取り入れた都市公園です。',
    difference:
      '古い街並みのある川辺とは違い、熱帯の公園の景色が広がります。天候によって過ごしやすさが変わります。',
    bestFor: '街の中で自然を身近に感じられます',
    features: { water: 4, green: 5, quiet: 4, walk: 5, cafes: 2, history: 1 },
    sources: [
      {
        title: 'Singapore National Parks Board',
        url: 'https://www.nparks.gov.sg/visit/parks/park-detail/bishan-ang-mo-kio-park',
      },
    ],
  },
  {
    id: 'osaka',
    name: '中之島公園',
    city: '大阪',
    country: '日本',
    continent: 'Asia',
    lat: 34.6916,
    lng: 135.5086,
    image: '/images/osaka.jpg',
    imagePage: 'https://en.wikipedia.org/wiki/Nakanoshima_Park',
    description: '二つの川に挟まれた中之島で、庭園と水辺を楽しめます。',
    detail:
      '中之島の東側、バラ園の周辺から散歩できます。川の景色と歴史ある公共建築を眺められます。',
    difference: '広い河川敷ではなく、整えられた庭園と都市の建物が近くにあります。',
    bestFor: '街歩きの途中に、緑の中でひと息つけます',
    features: { water: 5, green: 4, quiet: 3, walk: 5, cafes: 4, history: 4 },
    sources: [{ title: 'Osaka official tourism guide', url: 'https://osaka-info.jp/en/' }],
  },
];
/** 最初に表示する出発点のサンプル。 */
export const defaultSource = places.find(p => p.id === 'copenhagen')!;
export const destinationOptions = [
  { value: 'world', label: '世界中から探す' },
  { value: 'Asia', label: 'アジア' },
  { value: 'Europe', label: 'ヨーロッパ' },
  ...Array.from(new Set(places.map(p => p.city)))
    .sort()
    .map(city => ({ value: city, label: city })),
];
