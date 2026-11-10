import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchPolicy } from '../lib/search-policy.ts';

test('economy mode defaults on and bounds optional external work', () => {
  const economical = searchPolicy({}),
    full = searchPolicy({ ELSEWHERE_SAVE_COSTS: 'false' });
  assert.equal(economical.saveCosts, true);
  assert.equal(economical.liveDiscovery, false);
  assert.equal(full.liveDiscovery, true);
  assert.equal(full.useVision, true);
  assert.ok(economical.maxVerifications < full.maxVerifications);
  assert.ok(economical.photosPerPlace < full.photosPerPlace);
  assert.throws(() => searchPolicy({ ELSEWHERE_SAVE_COSTS: 'yes' }), /true.*false/);
});
