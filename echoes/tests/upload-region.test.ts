import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { prepareUpload, readLimitedBody, maxUploadBytes } from '../lib/upload-image.ts';
import { regionAround, regionMetrics, validateRegion } from '../lib/geo-region.ts';
import { uploadedVisualDiscovery, applyMapsFallback } from '../lib/visual-discovery.ts';
import { samplePhoto } from '../lib/commons.ts';

test('upload decodes supported images, applies orientation and strips EXIF before Google analysis', async () => {
  for (const format of ['jpeg', 'png', 'webp'] as const) {
    const bytes = await sharp({
      create: { width: 80, height: 40, channels: 3, background: '#3b7c89' },
    })
      .toFormat(format)
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const result = await prepareUpload(bytes, `image/${format}`);
    const meta = await sharp(result.data).metadata();
    assert.equal(result.mime, 'image/jpeg');
    assert.equal(meta.width, 40);
    assert.equal(meta.height, 80);
    assert.equal(meta.exif, undefined);
    assert.equal(meta.orientation, undefined);
  }
});
test('upload rejects MIME spoofing, SVG, damaged files, excessive size, pixels and animation', async () => {
  const jpeg = await sharp({ create: { width: 64, height: 64, channels: 3, background: 'green' } })
    .jpeg()
    .toBuffer();
  await assert.rejects(() => prepareUpload(jpeg, 'image/png'));
  await assert.rejects(() => prepareUpload(Buffer.from('<svg/>'), 'image/svg+xml'));
  await assert.rejects(() => prepareUpload(Buffer.from([255, 216, 0]), 'image/jpeg'));
  await assert.rejects(() => prepareUpload(Buffer.alloc(maxUploadBytes + 1), 'image/jpeg'));
  const huge = await sharp({
    create: { width: 5000, height: 5000, channels: 3, background: 'white' },
  })
    .png()
    .toBuffer();
  await assert.rejects(() => prepareUpload(huge, 'image/png'));
  const animation = await sharp(
    Buffer.concat([Buffer.alloc(64 * 64 * 3, 0), Buffer.alloc(64 * 64 * 3, 255)]),
    { raw: { width: 64, height: 128, channels: 3, pageHeight: 64 } },
  )
    .webp({ loop: 0, delay: [100, 100] })
    .toBuffer();
  await assert.rejects(() => prepareUpload(animation, 'image/webp'));
});
test('streamed upload limit applies even without Content-Length', async () => {
  const request = new Request('http://localhost', {
    method: 'POST',
    body: new ReadableStream({
      start(c) {
        c.enqueue(new Uint8Array(5));
        c.enqueue(new Uint8Array(6));
        c.close();
      },
    }),
    duplex: 'half',
  } as RequestInit);
  await assert.rejects(() => readLimitedBody(request, 10), { status: 413 });
  const bytes = await readLimitedBody(
    new Request('http://localhost', { method: 'POST', body: 'abc' }),
    10,
  );
  assert.equal(bytes.toString(), 'abc');
});
test('satellite reference bounds reject empty, reversed, dateline, nonfinite and oversized regions', () => {
  const region = regionAround(35, 135, 1);
  assert.deepEqual(validateRegion(region), region);
  assert.ok(Math.abs(regionMetrics(region).areaKm2 - 4) < 0.01);
  for (const invalid of [
    null,
    { ...region, north: NaN },
    { ...region, north: region.south },
    { ...region, east: -179, west: 179 },
    regionAround(35, 135, 21),
    regionAround(35, 135, 0.01),
    regionAround(85, 135, 1),
  ])
    assert.throws(() => validateRegion(invalid));
});
test('uploaded photo keeps unknown location, destination filtering and no invented Maps fallback', async () => {
  let calls = 0;
  const deps = {
    embed: async () => [1, 0],
    photo: samplePhoto,
    candidateEmbed: async () => [1, 0],
    explain: async () => {
      throw new Error('explanation unavailable');
    },
  };
  const result = await uploadedVisualDiscovery(Buffer.from('test'), ['water'], 'ソウル', 0.6, deps);
  assert.equal(result.source.locationUnknown, true);
  assert.equal(result.source.image, '');
  assert.equal(result.source.uploadPhoto?.provider, 'upload');
  assert.equal(result.visualSearch.mode, 'visual');
  assert.equal(result.visualSearch.comparedCount, 1);
  assert.deepEqual(
    result.places.map(p => p.city),
    ['ソウル'],
  );
  assert.equal(result.places[0].visual?.explanation, 'unavailable');
  const fallback = await uploadedVisualDiscovery(Buffer.from('test'), ['water'], 'ソウル', 0.6, {
    ...deps,
    embed: async () => {
      throw new Error('unavailable');
    },
  });
  assert.equal(fallback.visualSearch.mode, 'fallback');
  assert.match(fallback.visualSearch.reason!, /特徴だけ/);
  assert.ok(fallback.places.every(p => p.city === 'ソウル' && !p.visual));
  await applyMapsFallback(fallback, ['water'], 'ソウル', async () => {
    calls++;
    return [];
  });
  assert.equal(calls, 0);
  const empty = await uploadedVisualDiscovery(Buffer.from('test'), ['water'], '未知の地域', 0.6, {
    ...deps,
    embed: async () => {
      calls++;
      return [1, 0];
    },
  });
  assert.equal(empty.places.length, 0);
  assert.equal(calls, 0);
  const missing = await uploadedVisualDiscovery(Buffer.from('test'), ['water'], 'ソウル', 0.6, {
    ...deps,
    photo: async () => null,
  });
  assert.equal(missing.visualSearch.mode, 'fallback');
  assert.equal(missing.visualSearch.comparedCount, 0);
});
