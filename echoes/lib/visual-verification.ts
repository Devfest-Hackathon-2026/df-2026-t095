/** Expand past rejected early matches while respecting the server's request budget. */
export async function verifyInBatches<T, R>(
  candidates: T[],
  verify: (candidate: T) => Promise<R>,
  options: {
    batchSize: number;
    maxChecks: number;
    target: number;
    verified: (result: R) => boolean;
  },
) {
  const result: R[] = [];
  for (
    let offset = 0;
    offset < Math.min(candidates.length, options.maxChecks);
    offset += options.batchSize
  ) {
    const batch = candidates.slice(offset, Math.min(offset + options.batchSize, options.maxChecks));
    result.push(...(await Promise.all(batch.map(verify))));
    if (result.filter(options.verified).length >= options.target) break;
  }
  return result;
}
