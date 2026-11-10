import type { RelevanceQuery } from './discovery-evaluation.ts';

export type ReviewableQuery = RelevanceQuery & { reviewNote?: string; reviewedAt?: string };
type Grade = 0 | 1 | 2;

/** 仮の評価が付いた候補に、現在の順位の上位で未評価の候補を加える。 */
export function reviewCandidateIds(query: RelevanceQuery, rankedIds: string[], extra = 3) {
  const judged = Object.keys(query.judgements);
  const unjudged = rankedIds.filter(id => !(id in query.judgements)).slice(0, extra);
  return [...judged, ...unjudged];
}

/** 画面に出した候補がすべて採点されているときだけ、人による確認済みとして記録する。 */
export function applyReview(
  queries: ReviewableQuery[],
  id: string,
  submitted: Record<string, unknown>,
  shownIds: string[],
  reviewedAt = new Date().toISOString(),
): ReviewableQuery[] {
  const target = queries.find(query => query.id === id);
  if (!target) throw new Error(`ケースが見つかりません: ${id}`);
  const judgements: Record<string, Grade> = { ...target.judgements };
  for (const candidate of shownIds) {
    const grade = submitted[candidate];
    if (grade !== 0 && grade !== 1 && grade !== 2)
      throw new Error(`未評価の候補があります: ${candidate}`);
    judgements[candidate] = grade;
  }
  const reviewed: ReviewableQuery = {
    ...target,
    judgements,
    reviewed: true,
    reviewedAt,
    tags: target.tags.filter(tag => tag !== 'provisional'),
  };
  delete reviewed.reviewNote;
  return queries.map(query => (query.id === id ? reviewed : query));
}
