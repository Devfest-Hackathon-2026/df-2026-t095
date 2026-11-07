import { test } from "node:test";
import assert from "node:assert/strict";
import { rankPlaces, diverseResults, distanceKm, safeUrl, mapsUrl } from "../lib/discovery.ts";
import { places } from "../lib/places.ts";

test("changing the user's priorities changes the recommendations", () => {
  const water = rankPlaces(places[0], ["water", "quiet"]);
  const history = rankPlaces(places[0], ["history", "cafes"]);
  assert.notEqual(water[0].id, history[0].id);
  assert.ok(!water.some(p => p.id === places[0].id));
});
test("destination constraints apply before ranking", () => {
  assert.ok(rankPlaces(places[0], ["water"], "Asia").every(p => p.continent === "Asia"));
  assert.equal(rankPlaces(places[0], ["water"], "ソウル")[0].id, "seoul");
  assert.deepEqual(rankPlaces(places[0], [], "world"), []);
  assert.deepEqual(rankPlaces(places[0], ["water"], "Atlantis"), []);
});
test("three results are unique and favor different countries", () => {
  const result = diverseResults(rankPlaces(places[0], ["green", "water"]));
  assert.equal(result.length, 3);
  assert.equal(new Set(result.map(p => p.country)).size, 3);
});
test("unsafe model-provided URLs cannot become links", () => {
  assert.equal(safeUrl("javascript:alert(1)"), null);
  assert.equal(safeUrl("http://example.com"), null);
  assert.equal(safeUrl("https://example.com/source"), "https://example.com/source");
});
test("distance is symmetric and map links encode place names", () => {
  assert.equal(distanceKm(places[0], places[0]), 0);
  assert.equal(distanceKm(places[0], places[1]), distanceKm(places[1], places[0]));
  assert.equal(new URL(mapsUrl(places[0])).searchParams.get("query"), "鴨川, 京都");
});
