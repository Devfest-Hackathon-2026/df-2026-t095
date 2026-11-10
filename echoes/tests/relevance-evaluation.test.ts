import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGroundedPlaces } from '../lib/google.ts';
import { qualitySignal } from '../lib/quality-score.ts';
import { places } from '../lib/places.ts';
import { applyFeedback, type Feedback } from '../lib/relevance-feedback.ts';
import {
  evaluateRanking,
  evaluationReport,
  type RelevanceQuery,
} from '../lib/discovery-evaluation.ts';
test('unknown experience attributes stay unknown rather than creating a perfect zero match', () => {
  const source = places[0],
    unknown = { ...source, profiled: false };
  assert.equal(qualitySignal(unknown, unknown, ['water']), 0.5);
  assert.ok(qualitySignal(source, source, ['water']) > 0.5);
  const p = {
    name: 'Example River',
    city: 'Kyoto',
    country: 'Japan',
    lat: 35,
    lng: 135,
    features: { water: 5, green: null, quiet: null, walk: 5, cafes: 0, history: null },
  };
  const [parsed] = parseGroundedPlaces({
    candidates: [
      {
        content: { parts: [{ text: JSON.stringify({ places: [p] }) }] },
        groundingMetadata: {
          groundingChunks: [{ maps: { title: p.name, uri: 'https://maps.google.com/?cid=123' } }],
        },
      },
    ],
  });
  assert.equal(parsed.featureEvidence?.green?.status, 'unknown');
  assert.equal(parsed.featureEvidence?.cafes?.status, 'known');
  assert.ok(parsed.featureEvidence?.water?.source);
});
test('feedback affects only its search context and cannot put unknown factors ahead of verified matches', () => {
  const [source, a, b] = places;
  const entry: Feedback = {
    sourceId: source.id,
    candidateId: b.id,
    preferences: ['water'],
    judgement: 'similar',
    createdAt: '2026-11-09',
  };
  assert.equal(applyFeedback([a, b], [entry], source.id, ['water'])[0].id, b.id);
  assert.equal(applyFeedback([a, b], [entry], source.id, ['green'])[0].id, a.id);
  const unknown = { ...b, factorMatch: { matched: [], unknown: ['waterQuality' as const] } };
  assert.equal(applyFeedback([a, unknown], [entry], source.id, ['water'])[0].id, a.id);
  assert.deepEqual(
    applyFeedback([a, b], [{ ...entry, judgement: 'wrong_landscape' }], source.id, ['water']).map(
      p => p.id,
    ),
    [a.id],
  );
});
test('evaluation distinguishes provisional cases, duplicate results and missing queries', () => {
  const q: RelevanceQuery = {
    id: 'query',
    sourceId: 'source',
    preferences: ['water'],
    destination: 'world',
    judgements: { a: 2, b: 1, c: 0 },
    reviewed: true,
    tags: [],
  };
  assert.equal(evaluateRanking(q, { queryId: q.id, placeIds: ['a', 'b', 'c'] }).ndcgAt3, 1);
  assert.equal(
    evaluateRanking(q, { queryId: q.id, placeIds: ['a', 'a', 'c'] }).precisionAt3,
    1 / 3,
  );
  const report = evaluationReport([q, { ...q, id: 'pending', reviewed: false }], []);
  assert.equal(report.queryCount, 1);
  assert.equal(report.pendingReview, 1);
  assert.equal(report.coverage, 0);
  assert.equal(evaluationReport([{ ...q, reviewed: false }], []).precisionAt3, null);
});
