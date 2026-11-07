import { places, qualities, type Place, type Quality } from "./places.ts";

export type RankedPlace = Place & { shared: Quality[]; score: number };
export function isQuality(value: unknown): value is Quality {
  return typeof value === "string" && qualities.some(q => q.id === value);
}
export function rankPlaces(source: Place, preferences: Quality[], destination = "world", collection = places): RankedPlace[] {
  const selected = [...new Set(preferences.filter(isQuality))];
  if (!selected.length) return [];
  const pool = destination === "world" && collection.filter(p => p.country !== source.country).length >= 3 ? collection.filter(p => p.country !== source.country) : collection;
  return pool
    .filter(p => p.id !== source.id && (destination === "world" || p.continent === destination || p.city === destination))
    .map(p => {
      const score = selected.reduce((sum, q) => sum + (5 - Math.abs(source.features[q] - p.features[q])) + p.features[q] * 0.25, 0) / selected.length;
      const shared = selected.filter(q => source.features[q] >= 3 && p.features[q] >= 3);
      return { ...p, score, shared };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
export function diverseResults(ranked: RankedPlace[], limit = 3): RankedPlace[] {
  const result: RankedPlace[] = [];
  const countries = new Set<string>();
  const continents = new Map<string, number>();
  for (const p of ranked) {
    if (!countries.has(p.country) && (continents.get(p.continent) || 0) < 2) { result.push(p); countries.add(p.country); continents.set(p.continent, (continents.get(p.continent) || 0) + 1); }
    if (result.length === limit) break;
  }
  if (result.length < limit) {
    for (const p of ranked) {
      if (!result.some(r => r.id === p.id)) result.push(p);
      if (result.length === limit) break;
    }
  }
  return result;
}
export function mapsUrl(place: Pick<Place, "name" | "city" | "lat" | "lng" | "placeId">) {
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", `${place.name}, ${place.city}`);
  if (place.placeId) url.searchParams.set("query_place_id", place.placeId);
  return url.toString();
}
export function distanceKm(a: Pick<Place, "lat" | "lng">, b: Pick<Place, "lat" | "lng">) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}
export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try { const u = new URL(value); return u.protocol === "https:" ? u.toString() : null; } catch { return null; }
}
