export const qualities = [
  { id: "water", label: "By the water", description: "Rivers, canals, and waterside paths", icon: "Waves" },
  { id: "green", label: "A little more green", description: "Trees, gardens, and natural surroundings", icon: "Tree" },
  { id: "quiet", label: "A slower pace", description: "Space to pause and take it all in", icon: "Wind" },
  { id: "walk", label: "Made for wandering", description: "Places best discovered on foot", icon: "Footprints" },
  { id: "cafes", label: "Cafés along the way", description: "A coffee stop is part of the journey", icon: "Coffee" },
  { id: "history", label: "A sense of history", description: "Old streets and stories in the scenery", icon: "Buildings" },
] as const;
export type Quality = (typeof qualities)[number]["id"];
export type SourceLink = { title: string; url: string };
export type Place = {
  id: string; name: string; city: string; country: string; continent: string;
  lat: number; lng: number; image: string; imagePage?: string;
  description: string; detail: string; difference: string; bestFor: string;
  features: Record<Quality, number>; sources: SourceLink[]; placeId?: string;
};
export const defaultPreferences: Quality[] = ["water", "green", "quiet"];
export const places: Place[] = [
  {
    id: "kamo", name: "Kamo River", city: "Kyoto", country: "Japan", continent: "Asia",
    lat: 35.0295, lng: 135.7724, image: "/images/kamo.jpg", imagePage: "https://en.wikipedia.org/wiki/Kamo_River",
    description: "A little nature, right in the heart of Kyoto.",
    detail: "Start near the Kamo and Takano river confluence at Demachiyanagi. Explore the riverside paths and the open banks from there.",
    difference: "An open urban riverbank, with less enclosure than a canal or formal garden.", bestFor: "An unhurried riverside walk",
    features: { water: 5, green: 4, quiet: 4, walk: 5, cafes: 3, history: 3 },
    sources: [{ title: "Japan National Tourism Organization", url: "https://www.japan.travel/en/spot/1183/" }],
  },
  {
    id: "ljubljana", name: "Ljubljanica riverfront", city: "Ljubljana", country: "Slovenia", continent: "Europe",
    lat: 46.0488, lng: 14.5064, image: "/images/ljubljana.jpg", imagePage: "https://en.wikipedia.org/wiki/Ljubljanica",
    description: "Leafy riverbanks meet the rhythm of an old town.",
    detail: "Explore the riverfront around Cobblers' Bridge and continue toward the quieter stretches around Špica. The old town is a natural place to stop along the way.",
    difference: "The central riverfront is more enclosed by historic buildings and café terraces. Quietness varies by stretch and time.", bestFor: "River walks with a coffee stop",
    features: { water: 5, green: 4, quiet: 4, walk: 5, cafes: 5, history: 5 },
    sources: [{ title: "Visit Ljubljana", url: "https://www.visitljubljana.com/en/visitors/" }],
  },
  {
    id: "seoul", name: "Cheonggyecheon", city: "Seoul", country: "South Korea", continent: "Asia",
    lat: 37.5692, lng: 126.9787, image: "/images/seoul.jpg", imagePage: "https://en.wikipedia.org/wiki/Cheonggyecheon",
    description: "A ribbon of water beneath the city streets.",
    detail: "Begin at Cheonggye Plaza and follow the stream east. Bridges, stepping stones, and waterside paths offer a different view of central Seoul.",
    difference: "A narrower, designed stream corridor below street level. Central sections can be busy, so a calm visit is not guaranteed.", bestFor: "Finding water in the city",
    features: { water: 5, green: 3, quiet: 3, walk: 5, cafes: 4, history: 3 },
    sources: [{ title: "Seoul Metropolitan Government", url: "https://english.seoul.go.kr/service/amusement/stream/1-cheonggyecheon/" }],
  },
  {
    id: "paris", name: "Seine riverbanks", city: "Paris", country: "France", continent: "Europe",
    lat: 48.8586, lng: 2.3474, image: "/images/paris.jpg", imagePage: "https://en.wikipedia.org/wiki/Seine",
    description: "The city unfolds one riverside stroll at a time.",
    detail: "Discover the pedestrian riverbanks around the Parc Rives de Seine. Look toward Île de la Cité for bridges and a layered historic cityscape.",
    difference: "More monumental architecture and stone quays, with fewer grassy banks. Visitor numbers vary widely.", bestFor: "History beside the water",
    features: { water: 5, green: 2, quiet: 2, walk: 5, cafes: 4, history: 5 },
    sources: [{ title: "Paris tourism office", url: "https://parisjetaime.com/eng/transport/bords-de-seine-p1977" }],
  },
  {
    id: "munich", name: "Isar riverbanks", city: "Munich", country: "Germany", continent: "Europe",
    lat: 48.1247, lng: 11.5664, image: "/images/munich.jpg", imagePage: "https://en.wikipedia.org/wiki/Isar",
    description: "A wilder edge to everyday city life.",
    detail: "Explore the Isar around Flaucher, where river paths connect wooded banks and gravel landscapes south of the city center.",
    difference: "Broader gravel banks and a more natural river landscape. It is less connected to a historic town center.", bestFor: "A greener escape by the river",
    features: { water: 5, green: 5, quiet: 4, walk: 5, cafes: 2, history: 1 },
    sources: [{ title: "Munich tourism office", url: "https://www.munich.travel/en" }],
  },
  {
    id: "amsterdam", name: "Vondelpark", city: "Amsterdam", country: "Netherlands", continent: "Europe",
    lat: 52.3579, lng: 4.8686, image: "/images/amsterdam.jpg", imagePage: "https://en.wikipedia.org/wiki/Vondelpark",
    description: "Open lawns, winding paths, and room to linger.",
    detail: "Start at the eastern entrance and follow the park's walking paths past ponds and open lawns. Explore beyond the busiest central paths.",
    difference: "An enclosed city park with ponds rather than a continuous riverfront. Shared paths may also carry bicycles.", bestFor: "A wandering afternoon in the green",
    features: { water: 2, green: 5, quiet: 3, walk: 5, cafes: 4, history: 2 },
    sources: [{ title: "I amsterdam", url: "https://www.iamsterdam.com/en/see-and-do/nature-and-active/parks-and-green-spaces/vondelpark" }],
  },
  {
    id: "ueno", name: "Ueno Park", city: "Tokyo", country: "Japan", continent: "Asia",
    lat: 35.7146, lng: 139.7732, image: "/images/ueno.jpg", imagePage: "https://en.wikipedia.org/wiki/Ueno_Park",
    description: "Pondside paths with culture around every corner.",
    detail: "Explore the walking paths around Shinobazu Pond, then continue toward the park's temples and museums.",
    difference: "A cultural park rather than an open riverbank. Festivals and cherry blossom season bring very different crowd levels.", bestFor: "Combining a walk with culture",
    features: { water: 3, green: 5, quiet: 2, walk: 5, cafes: 3, history: 5 },
    sources: [{ title: "GO TOKYO", url: "https://www.gotokyo.org/en/spot/30/index.html" }],
  },
  {
    id: "philosopher", name: "Philosopher's Path", city: "Kyoto", country: "Japan", continent: "Asia",
    lat: 35.0267, lng: 135.7944, image: "/images/philosopher.jpg", imagePage: "https://en.wikipedia.org/wiki/Philosopher%27s_Path",
    description: "A small canal, a leafy path, and no need to hurry.",
    detail: "Follow the canal-side path through Higashiyama between the areas around Ginkaku-ji and Nanzen-ji. Small side streets invite further exploration.",
    difference: "A much narrower canal path with temples nearby. Blossom season can be particularly crowded.", bestFor: "A thoughtful walk through old Kyoto",
    features: { water: 4, green: 5, quiet: 4, walk: 5, cafes: 4, history: 5 },
    sources: [{ title: "Kyoto City official travel guide", url: "https://kyoto.travel/en" }],
  },
  {
    id: "copenhagen", name: "Nyhavn", city: "Copenhagen", country: "Denmark", continent: "Europe",
    lat: 55.6797, lng: 12.5908, image: "/images/copenhagen.jpg", imagePage: "https://en.wikipedia.org/wiki/Nyhavn",
    description: "Colorful old houses reflected in harbor water.",
    detail: "Walk along the canal from Kongens Nytorv toward the harbor. The historic waterfront and moored boats shape the experience.",
    difference: "A lively harbor with restaurants and boat activity, rather than a quiet green river corridor.", bestFor: "A colorful waterfront with café life",
    features: { water: 5, green: 1, quiet: 1, walk: 4, cafes: 5, history: 5 },
    sources: [{ title: "Visit Copenhagen", url: "https://www.visitcopenhagen.com/copenhagen/planning/nyhavn-gdk474735" }],
  },
  {
    id: "london", name: "Regent's Canal", city: "London", country: "United Kingdom", continent: "Europe",
    lat: 51.5356, lng: -0.1693, image: "/images/london.jpg", imagePage: "https://en.wikipedia.org/wiki/Regent%27s_Canal",
    description: "A quieter line through a very busy city.",
    detail: "Explore the towpath around Regent's Park and Little Venice. Canal boats and waterside neighborhoods give each stretch its own character.",
    difference: "A narrow working canal with shared towpaths. Surface, access, and crowd levels vary along the route.", bestFor: "A canal walk away from the main roads",
    features: { water: 5, green: 4, quiet: 4, walk: 4, cafes: 4, history: 4 },
    sources: [{ title: "Canal & River Trust", url: "https://canalrivertrust.org.uk/canals-and-rivers/regents-canal" }],
  },
  {
    id: "singapore", name: "Bishan–Ang Mo Kio Park", city: "Singapore", country: "Singapore", continent: "Asia",
    lat: 1.3622, lng: 103.8463, image: "/images/singapore.jpg", imagePage: "https://en.wikipedia.org/wiki/Bishan-Ang_Mo_Kio_Park",
    description: "A meandering river in a generous patch of green.",
    detail: "Explore the park's river landscape and connecting paths. This is a planted urban park with open lawns and a naturalized waterway.",
    difference: "A tropical park landscape rather than a historic riverside neighborhood. Weather changes the experience considerably.", bestFor: "Nature woven into city life",
    features: { water: 4, green: 5, quiet: 4, walk: 5, cafes: 2, history: 1 },
    sources: [{ title: "Singapore National Parks Board", url: "https://www.nparks.gov.sg/visit/parks/park-detail/bishan-ang-mo-kio-park" }],
  },
  {
    id: "osaka", name: "Nakanoshima Park", city: "Osaka", country: "Japan", continent: "Asia",
    lat: 34.6916, lng: 135.5086, image: "/images/osaka.jpg", imagePage: "https://en.wikipedia.org/wiki/Nakanoshima_Park",
    description: "A garden island between two city rivers.",
    detail: "Explore the eastern end of Nakanoshima around the rose garden. Paths connect river views with the island's civic architecture.",
    difference: "A smaller landscaped island, with a more formal garden and a denser urban setting.", bestFor: "A short green pause in the city",
    features: { water: 5, green: 4, quiet: 3, walk: 5, cafes: 4, history: 4 },
    sources: [{ title: "Osaka official tourism guide", url: "https://osaka-info.jp/en/" }],
  },
];
export const destinationOptions = [
  { value: "world", label: "Anywhere in the world" },
  { value: "Asia", label: "Across Asia" }, { value: "Europe", label: "Across Europe" },
  ...Array.from(new Set(places.map(p => p.city))).sort().map(city => ({ value: city, label: city })),
];
