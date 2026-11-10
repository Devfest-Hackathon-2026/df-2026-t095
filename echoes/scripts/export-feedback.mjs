/** 利用者が送った匿名の評価を Firestore から読み取り、候補ごとに集計します。 */
import { mkdir, writeFile } from 'node:fs/promises';
import { cloudHeaders, googleProject } from '../lib/google-auth.ts';
import { aggregateFeedback } from '../lib/relevance-feedback.ts';

const url = `https://firestore.googleapis.com/v1/projects/${googleProject()}/databases/(default)/documents/feedback`;
const text = (fields, key) => fields[key]?.stringValue ?? '';
const rows = [];
let pageToken = '';
do {
  const params = new URLSearchParams({ pageSize: '300', ...(pageToken ? { pageToken } : {}) });
  const response = await fetch(`${url}?${params}`, {
    headers: await cloudHeaders(),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Firestore ${response.status}`);
  const data = await response.json();
  for (const { fields } of data.documents ?? []) {
    rows.push({
      sourceId: text(fields, 'sourceId'),
      candidateId: text(fields, 'candidateId'),
      preferences: fields.preferences?.arrayValue?.values?.map(value => value.stringValue) ?? [],
      judgement: text(fields, 'judgement'),
      searchKind: text(fields, 'searchKind'),
    });
  }
  pageToken = data.nextPageToken ?? '';
} while (pageToken);

const summary = aggregateFeedback(rows);
await mkdir('.cache/evaluations', { recursive: true });
await writeFile(
  '.cache/evaluations/feedback.json',
  `${JSON.stringify({ exportedAt: new Date().toISOString(), responses: rows.length, summary }, null, 2)}\n`,
);
console.log(
  JSON.stringify(
    { responses: rows.length, pairs: summary.length, top: summary.slice(0, 10) },
    null,
    2,
  ),
);
