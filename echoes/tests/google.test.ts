import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGroundedPlaces, hedgedFetch, generateGoogle, photoCheck } from '../lib/google.ts';
const place = {
  name: 'Example River Park',
  city: 'Kyoto',
  country: 'Japan',
  lat: 35,
  lng: 135,
  features: { water: 5, green: 4, quiet: 3, walk: 5, cafes: 2, history: 1 },
};
test('live results require matching Google Maps grounding evidence', () => {
  const result = {
    candidates: [
      {
        content: { parts: [{ text: JSON.stringify({ places: [place] }) }] },
        groundingMetadata: {
          groundingChunks: [
            {
              maps: {
                title: place.name,
                uri: 'https://maps.google.com/?cid=123',
                placeId: 'places/real-place',
              },
            },
          ],
        },
      },
    ],
  };
  const parsed = parseGroundedPlaces(result);
  assert.equal(parsed[0].placeId, 'real-place');
  assert.equal(parsed[0].sources.length, 1);
});
test('invented or unsafe sources are rejected', () => {
  assert.throws(() =>
    parseGroundedPlaces({
      candidates: [{ content: { parts: [{ text: JSON.stringify({ places: [place] }) }] } }],
    }),
  );
  assert.throws(() =>
    parseGroundedPlaces({
      candidates: [
        {
          content: { parts: [{ text: JSON.stringify({ places: [place] }) }] },
          groundingMetadata: {
            groundingChunks: [{ maps: { title: place.name, uri: 'javascript:alert(1)' } }],
          },
        },
      ],
    }),
  );
});

const wait = (ms: number, signal: AbortSignal, response: Response) =>
  new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => resolve(response), ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('aborted'));
    });
  });
test('a stalled request is sent again and the first answer wins', async () => {
  const signals: AbortSignal[] = [];
  const started = Date.now();
  const r = await hedgedFetch(signal => {
    signals.push(signal);
    // The first copy stalls; the second answers quickly.
    return wait(signals.length === 1 ? 5000 : 20, signal, new Response(`copy ${signals.length}`));
  }, 30);
  assert.equal(await r.text(), 'copy 2');
  assert.ok(Date.now() - started < 1000);
  assert.ok(signals[0].aborted, 'the stalled copy is cancelled');
});
test('a request answered in time is sent only once, even when it fails', async () => {
  let sent = 0;
  const r = await hedgedFetch(signal => {
    sent++;
    return wait(5, signal, new Response('busy', { status: 429 }));
  }, 200);
  assert.equal(r.status, 429);
  assert.equal(sent, 1);
});
test('photo checks ask for light thinking and fall back when the model rejects it', async () => {
  const realFetch = globalThis.fetch,
    env = { ...process.env };
  const bodies: { generationConfig: { thinkingConfig?: unknown } }[] = [];
  process.env.GEMINI_API_KEY = 'test-key';
  delete process.env.GOOGLE_CLOUD_PROJECT;
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    bodies.push(JSON.parse(String(init.body)));
    return bodies.length === 1
      ? new Response('{}', { status: 400 })
      : Response.json({ candidates: [{ content: { parts: [{ text: '{}' }] } }] });
  }) as typeof fetch;
  try {
    await generateGoogle('check', false, undefined, [], photoCheck);
  } finally {
    globalThis.fetch = realFetch;
    process.env = env;
  }
  assert.deepEqual(bodies[0].generationConfig.thinkingConfig, { thinkingLevel: 'low' });
  assert.equal(bodies[1].generationConfig.thinkingConfig, undefined);
});
