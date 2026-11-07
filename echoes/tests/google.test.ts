import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGroundedPlaces } from "../lib/google.ts";
const place = { name: "Example River Park", city: "Kyoto", country: "Japan", lat: 35, lng: 135, features: { water: 5, green: 4, quiet: 3, walk: 5, cafes: 2, history: 1 } };
test("live results require matching Google Maps grounding evidence", () => {
  const result = { candidates: [{ content: { parts: [{ text: JSON.stringify({ places: [place] }) }] }, groundingMetadata: { groundingChunks: [{ maps: { title: place.name, uri: "https://maps.google.com/?cid=123", placeId: "places/real-place" } }] } }] };
  const parsed = parseGroundedPlaces(result);
  assert.equal(parsed[0].placeId, "real-place");
  assert.equal(parsed[0].sources.length, 1);
});
test("invented or unsafe sources are rejected", () => {
  assert.throws(() => parseGroundedPlaces({ candidates: [{ content: { parts: [{ text: JSON.stringify({ places: [place] }) }] } }] }));
  assert.throws(() => parseGroundedPlaces({ candidates: [{ content: { parts: [{ text: JSON.stringify({ places: [place] }) }] }, groundingMetadata: { groundingChunks: [{ maps: { title: place.name, uri: "javascript:alert(1)" } }] } }] }));
});
