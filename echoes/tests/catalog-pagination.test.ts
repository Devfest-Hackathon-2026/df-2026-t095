import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectQueryRows } from '../lib/bigquery.ts';
test('catalog loading retains rows beyond the first BigQuery page', async () => {
  const initial = {
    schema: { fields: [{ name: 'id' }] },
    rows: [{ f: [{ v: 'first' }] }],
    pageToken: 'next',
  };
  const rows = await collectQueryRows(initial, async token => {
    assert.equal(token, 'next');
    return { rows: [{ f: [{ v: 'last' }] }] };
  });
  assert.deepEqual(rows, [{ id: 'first' }, { id: 'last' }]);
  await assert.rejects(
    () => collectQueryRows(initial, async () => ({ pageToken: 'next' })),
    /ページ数/,
  );
  await assert.rejects(
    () => collectQueryRows(initial, async () => ({ error: 'permission denied' })),
    /データ/,
  );
});
