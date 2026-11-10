import type { Place, Quality } from './places.ts';
import { compareFactorEvidence } from './factor-types.ts';
export type Judgement = 'similar' | 'different' | 'wrong_landscape';
export type Feedback = {
  sourceId: string;
  candidateId: string;
  preferences: Quality[];
  judgement: Judgement;
  createdAt: string;
};
export function validFeedback(value: unknown): value is Feedback {
  const x = value as Feedback | undefined;
  return Boolean(
    x &&
    typeof x.sourceId === 'string' &&
    x.sourceId.length <= 300 &&
    typeof x.candidateId === 'string' &&
    x.candidateId.length <= 300 &&
    Array.isArray(x.preferences) &&
    x.preferences.every(q => ['water', 'green', 'quiet', 'walk', 'cafes', 'history'].includes(q)) &&
    ['similar', 'different', 'wrong_landscape'].includes(x.judgement) &&
    typeof x.createdAt === 'string',
  );
}
export const feedbackContext = (sourceId: string, preferences: Quality[]) =>
  JSON.stringify([sourceId, [...preferences].sort()]);
export type SearchKind = 'atmosphere' | 'visual' | 'terrain';
export type SharedFeedback = {
  sourceId: string;
  candidateId: string;
  preferences: Quality[];
  judgement: Judgement;
  searchKind: SearchKind;
};
/** 共有してよい評価だけを返す。住所や住宅、撮影場所が不明な写真を出発点にした評価は送らない。 */
export function shareableFeedback(
  source: Place,
  candidate: Place,
  preferences: Quality[],
  judgement: Judgement,
  searchKind: SearchKind,
): SharedFeedback | null {
  if (source.uploadPhoto || source.locationUnknown || candidate.uploadPhoto) return null;
  if (source.placeId && !source.publicPlace) return null;
  return {
    sourceId: source.id,
    candidateId: candidate.id,
    preferences: [...new Set(preferences)].sort(),
    judgement,
    searchKind,
  };
}
/** ブラウザーごとのランダムな値から作る ID。同じ評価を上書きでき、Firebase のユーザーとは結びつかない。 */
export async function feedbackDocumentId(
  salt: string,
  sourceId: string,
  candidateId: string,
  preferences: Quality[],
) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(
      JSON.stringify([salt, candidateId, feedbackContext(sourceId, preferences)]),
    ),
  );
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export type FeedbackSummary = {
  sourceId: string;
  candidateId: string;
  preferences: Quality[];
  similar: number;
  different: number;
  wrong_landscape: number;
  total: number;
};
export function aggregateFeedback(rows: SharedFeedback[]): FeedbackSummary[] {
  const summary = new Map<string, FeedbackSummary>();
  for (const row of rows) {
    const preferences = [...row.preferences].sort(),
      key = JSON.stringify([row.sourceId, row.candidateId, preferences]);
    const entry = summary.get(key) || {
      sourceId: row.sourceId,
      candidateId: row.candidateId,
      preferences,
      similar: 0,
      different: 0,
      wrong_landscape: 0,
      total: 0,
    };
    entry[row.judgement]++;
    entry.total++;
    summary.set(key, entry);
  }
  return [...summary.values()].sort((a, b) => b.total - a.total);
}
export function applyFeedback<T extends Place>(
  places: T[],
  feedback: Feedback[],
  sourceId: string,
  preferences: Quality[],
): T[] {
  const context = feedbackContext(sourceId, preferences),
    latest = new Map(
      feedback
        .filter(f => feedbackContext(f.sourceId, f.preferences) === context)
        .map(f => [f.candidateId, f.judgement]),
    );
  const preference = (p: Place) =>
    latest.get(p.id) === 'similar' ? 1 : latest.get(p.id) === 'different' ? -1 : 0;
  return places
    .filter(p => latest.get(p.id) !== 'wrong_landscape')
    .map((p, i) => ({ p, i }))
    .sort(
      (a, b) => compareFactorEvidence(a.p, b.p) || preference(b.p) - preference(a.p) || a.i - b.i,
    )
    .map(({ p }) => p);
}
