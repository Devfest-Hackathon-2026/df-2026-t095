import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeFilterCount, defaultSearchFilters } from '../lib/climate-types.ts';
import { applyReview, reviewCandidateIds, type ReviewableQuery } from '../lib/benchmark-review.ts';
import { isPublicPlaceType } from '../lib/google-maps.ts';
import { places, type Place } from '../lib/places.ts';
import {
  aggregateFeedback,
  feedbackDocumentId,
  shareableFeedback,
  type SharedFeedback,
} from '../lib/relevance-feedback.ts';

const query: ReviewableQuery = {
  id: 'kamo-1',
  sourceId: 'kamo',
  preferences: ['water'],
  destination: 'world',
  judgements: { munich: 2, seoul: 1 },
  reviewed: false,
  tags: ['provisional', 'water'],
  reviewNote: 'starter',
};

test('filter count ignores defaults and counts each selected condition', () => {
  assert.equal(activeFilterCount(defaultSearchFilters), 0);
  assert.equal(
    activeFilterCount({
      ...defaultSearchFilters,
      climate: 'Cfa',
      lessVisited: true,
      seaColor: 'blue',
      unknownData: 'exclude',
    }),
    4,
  );
});

test('review candidates add unjudged top-ranked places without repeating judged ones', () => {
  assert.deepEqual(reviewCandidateIds(query, ['munich', 'paris', 'london', 'osaka', 'seoul'], 2), [
    'munich',
    'seoul',
    'paris',
    'london',
  ]);
});

test('a case becomes human-reviewed only when every shown candidate has a valid grade', () => {
  const shown = ['munich', 'seoul', 'paris'];
  assert.throws(() => applyReview([query], 'kamo-1', { munich: 2, seoul: 1 }, shown), /paris/);
  assert.throws(
    () => applyReview([query], 'kamo-1', { munich: 2, seoul: 1, paris: 3 }, shown),
    /paris/,
  );
  assert.throws(() => applyReview([query], 'missing', {}, []), /missing/);
  const [reviewed] = applyReview(
    [query],
    'kamo-1',
    { munich: 0, seoul: 1, paris: 2 },
    shown,
    '2026-11-10T00:00:00.000Z',
  );
  assert.deepEqual(reviewed.judgements, { munich: 0, seoul: 1, paris: 2 });
  assert.equal(reviewed.reviewed, true);
  assert.equal(reviewed.reviewedAt, '2026-11-10T00:00:00.000Z');
  assert.deepEqual(reviewed.tags, ['water']);
  assert.equal('reviewNote' in reviewed, false);
  assert.equal(query.reviewed, false);
});

test('address-level or unknown Google place types are not public places', () => {
  assert.equal(isPublicPlaceType('park'), true);
  assert.equal(isPublicPlaceType('street_address'), false);
  assert.equal(isPublicPlaceType('apartment_building'), false);
  assert.equal(isPublicPlaceType(undefined), false);
});

test('shared feedback carries only place ids and excludes private sources', () => {
  const [source, candidate] = places;
  assert.deepEqual(
    Object.keys(shareableFeedback(source, candidate, ['water'], 'similar', 'visual')!).sort(),
    ['candidateId', 'judgement', 'preferences', 'searchKind', 'sourceId'],
  );
  const google = (publicPlace?: boolean): Place => ({
    ...source,
    id: 'google-x',
    placeId: 'x',
    publicPlace,
  });
  assert.ok(shareableFeedback(google(true), candidate, ['water'], 'similar', 'atmosphere'));
  assert.equal(
    shareableFeedback(google(false), candidate, ['water'], 'similar', 'atmosphere'),
    null,
  );
  assert.equal(shareableFeedback(google(), candidate, ['water'], 'similar', 'atmosphere'), null);
  assert.equal(
    shareableFeedback(
      { ...source, locationUnknown: true },
      candidate,
      ['water'],
      'similar',
      'visual',
    ),
    null,
  );
  assert.equal(
    shareableFeedback(
      {
        ...source,
        uploadPhoto: { provider: 'upload', name: 'p', mime: 'image/jpeg', changes: '' },
      },
      candidate,
      ['water'],
      'similar',
      'visual',
    ),
    null,
  );
});

test('feedback ids are stable for one browser, independent of order, and differ between browsers', async () => {
  const first = await feedbackDocumentId('salt-a', 'kamo', 'munich', ['water', 'green']);
  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(first, await feedbackDocumentId('salt-a', 'kamo', 'munich', ['green', 'water']));
  assert.notEqual(first, await feedbackDocumentId('salt-b', 'kamo', 'munich', ['water', 'green']));
});

test('aggregation groups by source, candidate and preferences', () => {
  const row: SharedFeedback = {
    sourceId: 'a',
    candidateId: 'b',
    preferences: ['water', 'green'],
    judgement: 'similar',
    searchKind: 'visual',
  };
  const summary = aggregateFeedback([
    row,
    { ...row, preferences: ['green', 'water'], judgement: 'wrong_landscape' },
    { ...row, candidateId: 'c' },
  ]);
  assert.equal(summary.length, 2);
  assert.deepEqual(
    {
      similar: summary[0].similar,
      wrong_landscape: summary[0].wrong_landscape,
      total: summary[0].total,
    },
    { similar: 1, wrong_landscape: 1, total: 2 },
  );
});
