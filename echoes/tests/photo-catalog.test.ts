import { test } from 'node:test';
import assert from 'node:assert/strict';
import { places } from '../lib/places.ts';
import { visualDiscovery, uploadedVisualDiscovery } from '../lib/visual-discovery.ts';
import { samplePhoto } from '../lib/commons.ts';
import { searchPolicy } from '../lib/search-policy.ts';
import { matchesDestination } from '../lib/visual-ranking.ts';
import { mergePlaceCatalog, localCatalog } from '../lib/catalog.ts';
const source = places[0],
  seoul = places.find(p => p.id === 'seoul')!,
  munich = places.find(p => p.id === 'munich')!;
const collection = async () => ({ places: [], provider: 'local' as const });
const climate = (code: string) => ({
  code,
  label: code,
  period: '1991–2020',
  source: 'test',
  nearby: false,
});

test('named photo search can compare a live candidate outside an empty prepared collection', async () => {
  const result = await visualDiscovery(source, ['water'], 'Seoul', 1, {
    collection,
    discover: async () => [source, { ...seoul, image: '' }, munich, seoul],
    photo: samplePhoto,
    embed: async () => [1, 0],
  });
  assert.equal(result.visualSearch.mode, 'visual');
  assert.equal(result.visualSearch.discoveredCount, 1);
  assert.equal(result.visualSearch.comparedCount, 1);
  assert.deepEqual(
    result.places.map(p => p.id),
    ['seoul'],
  );
  assert.ok(result.places[0].commonsPhoto?.verified);
});
test('live photo candidates keep exact climate constraints and cannot reuse the source photo', async () => {
  const result = await visualDiscovery(
    { ...source, climate: climate('Cfa') },
    ['water'],
    'world',
    1,
    {
      collection,
      discover: async () => [
        { ...seoul, climate: climate('Cfb') },
        { ...munich, climate: climate('Cfa') },
      ],
      photo: async () => await samplePhoto(source),
      embed: async () => [1, 0],
    },
    { climate: 'same', lessVisited: false },
  );
  assert.equal(result.visualSearch.discoveredCount, 1);
  assert.equal(result.visualSearch.comparedCount, 0);
  assert.equal(result.visualSearch.mode, 'fallback');
});
test('upload can discover new places without identifying or saving its reference location', async () => {
  const bytes = Buffer.from('sanitized upload');
  let received = false;
  const result = await uploadedVisualDiscovery(bytes, ['water'], 'Seoul', 1, {
    collection,
    discover: async (p, _q, _d, _f, image) => {
      assert.equal(p.locationUnknown, true);
      assert.deepEqual(image.data, bytes);
      received = true;
      return [{ ...seoul, image: '' }, munich];
    },
    embed: async () => [1, 0],
    photo: samplePhoto,
    candidateEmbed: async () => [1, 0],
    explain: async () => {
      throw new Error('optional');
    },
  });
  assert.ok(received);
  assert.equal(result.source.locationUnknown, true);
  assert.equal(result.source.placeId, undefined);
  assert.equal(result.visualSearch.discoveredCount, 1);
  assert.deepEqual(
    result.places.map(p => p.id),
    ['seoul'],
  );
});
test('live discovery failure preserves prepared photo comparison and reports its smaller scope', async () => {
  const result = await visualDiscovery(source, ['water'], 'Seoul', 1, {
    collection: async () => ({ places: [seoul], provider: 'local' }),
    discover: async () => {
      throw new Error('rate limited');
    },
    photo: samplePhoto,
    embed: async () => [1, 0],
  });
  assert.equal(result.visualSearch.mode, 'visual');
  assert.match(result.visualSearch.discoveryNote!, /登録写真/);
  assert.equal(result.places[0].id, 'seoul');
});
test('expanded local data cannot be hidden by a stale BigQuery catalog', async () => {
  const expanded = { ...seoul, id: 'new-public-place' };
  const merged = mergePlaceCatalog([source, expanded], [{ ...source, name: 'old' }]);
  assert.equal(merged.length, 2);
  assert.equal(merged.find(p => p.id === source.id)!.name, source.name);
  const catalog = await localCatalog();
  assert.ok(catalog.length >= 90);
  assert.ok(catalog.filter(p => p.landform).length >= 50);
  assert.equal(new Set(catalog.map(p => p.id)).size, catalog.length);
});
test('live city aliases match in either language and within a district address', () => {
  assert.ok(
    matchesDestination({ ...source, city: 'London', country: 'United Kingdom' }, 'ロンドン'),
  );
  assert.ok(matchesDestination({ ...source, city: 'ロンドン', country: 'イギリス' }, 'London'));
  assert.ok(
    matchesDestination(
      {
        ...source,
        city: 'Islington',
        country: 'United Kingdom',
        address: 'London N1, United Kingdom',
      },
      'ロンドン',
    ),
  );
  assert.ok(matchesDestination({ ...source, city: 'Kyoto', country: 'Japan' }, '日本'));
  assert.ok(
    !matchesDestination(
      { ...source, city: 'Paris', country: 'France', address: 'Paris, France' },
      'ロンドン',
    ),
  );
});
test('upload verification goes to the closest photos, not to places with high feature scores', async () => {
  const base = (await samplePhoto(seoul))!,
    budget = searchPolicy().maxVerifications;
  // A well-profiled riverside place whose photo looks unrelated, then unprofiled places whose photos match.
  const profiled = { ...munich, id: 'profiled-river', features: { ...munich.features, water: 5 } };
  const lookalikes = Array.from({ length: budget + 1 }, (_, i) => ({
    ...seoul,
    id: `lookalike-${i}`,
    name: `Lookalike ${i}`,
    profiled: false,
  }));
  const explained: string[] = [];
  const result = await uploadedVisualDiscovery(
    Buffer.from('sanitized upload'),
    ['water'],
    'world',
    0.6,
    {
      collection: async () => ({ places: [profiled, ...lookalikes], provider: 'local' }),
      embed: async () => [1, 0],
      photo: async p => ({ ...base, pageId: p.id.length, sha1: p.id, title: `File:${p.id}.jpg` }),
      candidateEmbed: async photo => (photo.sha1 === profiled.id ? [0.6, 0.8] : [0.95, 0.31]),
      explain: async (_s, candidate, a, b) => {
        explained.push(candidate.id);
        return {
          cosine: 0,
          visualWeight: 0,
          observations: ['水辺'],
          differences: ['岸'],
          inferences: [],
          explanation: 'generated',
          landscapeMatch: candidate.id === profiled.id ? 'weak' : 'strong',
          sourcePhoto: a,
          candidatePhoto: b,
        };
      },
    },
  );
  assert.ok(!explained.includes(profiled.id));
  assert.equal(result.places.length, 3);
  assert.ok(result.places.every(p => p.id.startsWith('lookalike-')));
});
test('named photo search verifies the closest photos, not places that share the source features', async () => {
  const base = (await samplePhoto(seoul))!,
    budget = searchPolicy().maxVerifications;
  // Same features as the source gives the profiled place the top blended score despite its photo.
  const profiled = { ...munich, id: 'profiled-river', features: { ...source.features } };
  const lookalikes = Array.from({ length: budget + 1 }, (_, i) => ({
    ...seoul,
    id: `lookalike-${i}`,
    name: `Lookalike ${i}`,
    profiled: false,
  }));
  const ids = [source.id, profiled.id, ...lookalikes.map(p => p.id)];
  const explained: string[] = [];
  const result = await visualDiscovery(source, ['water'], 'world', 0.6, {
    collection: async () => ({ places: [profiled, ...lookalikes], provider: 'local' }),
    photo: async p => ({ ...base, pageId: 1000 + ids.indexOf(p.id), sha1: p.id }),
    embed: async photo =>
      photo.sha1 === source.id ? [1, 0] : photo.sha1 === profiled.id ? [0.6, 0.8] : [0.95, 0.31],
    explain: async (_s, candidate, a, b) => {
      explained.push(candidate.id);
      return {
        cosine: 0,
        visualWeight: 0,
        observations: ['水辺'],
        differences: ['岸'],
        inferences: [],
        explanation: 'generated',
        landscapeMatch: candidate.id === profiled.id ? 'weak' : 'strong',
        sourcePhoto: a,
        candidatePhoto: b,
      };
    },
  });
  assert.ok(!explained.includes(profiled.id));
  assert.equal(result.places.length, 3);
  assert.ok(result.places.every(p => p.id.startsWith('lookalike-')));
});
test('a starting place picked under another name is not compared with its own catalog entry', async () => {
  const base = (await samplePhoto(seoul))!;
  // Google Maps gives the Japanese name and its own coordinates; the catalog lists the English name nearby.
  const picked = {
    ...seoul,
    id: 'google-place',
    name: 'ソウル特別市',
    placeId: 'google-id',
    lat: seoul.lat + 0.1,
  };
  const others = Array.from({ length: 3 }, (_, i) => ({
    ...munich,
    id: `other-${i}`,
    name: `Other ${i}`,
  }));
  const explained: string[] = [];
  const result = await visualDiscovery(picked, ['water'], 'world', 0.6, {
    collection: async () => ({ places: [seoul, ...others], provider: 'local' }),
    names: async () => [picked.name, seoul.name],
    photo: async p => ({ ...base, pageId: 2000 + p.id.length, sha1: p.id }),
    // Being the same place, its catalog photo is the closest one to the source photo.
    embed: async photo =>
      photo.sha1 === 'google-place' ? [1, 0] : photo.sha1 === seoul.id ? [0.99, 0.14] : [0.9, 0.44],
    explain: async (_s, candidate, a, b) => {
      explained.push(candidate.id);
      return {
        cosine: 0,
        visualWeight: 0,
        observations: ['水辺'],
        differences: ['岸'],
        inferences: [],
        explanation: 'generated',
        landscapeMatch: 'strong',
        sourcePhoto: a,
        candidatePhoto: b,
      };
    },
  });
  assert.ok(!explained.includes(seoul.id));
  assert.ok(!result.places.some(p => p.id === seoul.id));
  assert.equal(result.places.length, 3);
});
test('fast search checks every candidate in one round instead of batches', async () => {
  const base = (await samplePhoto(seoul))!,
    budget = searchPolicy().maxVerifications;
  const candidates = Array.from({ length: budget + 2 }, (_, i) => ({
    ...seoul,
    id: `candidate-${i}`,
    name: `Candidate ${i}`,
  }));
  const run = async (oneRound: boolean) => {
    let inFlight = 0,
      most = 0,
      checked = 0;
    await visualDiscovery(source, ['water'], 'world', 0.6, {
      collection: async () => ({ places: candidates, provider: 'local' }),
      photo: async p => ({ ...base, pageId: 3000 + p.id.length, sha1: p.id }),
      embed: async photo => (photo.sha1 === source.id ? [1, 0] : [0.9, 0.44]),
      oneRound,
      explain: async (_s, _candidate, a, b) => {
        checked++;
        most = Math.max(most, ++inFlight);
        await new Promise(resolve => setTimeout(resolve, 5));
        inFlight--;
        // Weak matches keep a batched search going until the budget is spent.
        return {
          cosine: 0,
          visualWeight: 0,
          observations: ['水辺'],
          differences: ['岸'],
          inferences: [],
          explanation: 'generated',
          landscapeMatch: 'weak',
          sourcePhoto: a,
          candidatePhoto: b,
        };
      },
    });
    return { most, checked };
  };
  const batched = await run(false),
    fast = await run(true);
  assert.equal(batched.most, searchPolicy().verificationBatch);
  assert.equal(fast.most, budget);
  // The same number of checks: fast search spends the budget at once, not more of it.
  assert.equal(fast.checked, batched.checked);
});
