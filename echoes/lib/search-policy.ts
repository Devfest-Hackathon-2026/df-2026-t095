export type SearchPolicy = {
  saveCosts: boolean;
  liveDiscovery: boolean;
  useVision: boolean;
  maxPhotoCandidates: number;
  maxVerifications: number;
  verificationBatch: number;
  photosPerPlace: number;
  maxOutputTokens: number;
};

/** Server-only policy: request parameters cannot increase the configured budget. */
export function searchPolicy(env: Record<string, string | undefined> = process.env): SearchPolicy {
  const value = env.ELSEWHERE_SAVE_COSTS ?? 'true';
  if (value !== 'true' && value !== 'false')
    throw new Error('ELSEWHERE_SAVE_COSTS は true または false を指定してください。');
  const saveCosts = value === 'true';
  return {
    saveCosts,
    liveDiscovery: !saveCosts,
    useVision: !saveCosts,
    maxPhotoCandidates: saveCosts ? 250 : 1500,
    maxVerifications: saveCosts ? 6 : 18,
    verificationBatch: saveCosts ? 3 : 6,
    photosPerPlace: saveCosts ? 1 : 3,
    maxOutputTokens: saveCosts ? 8192 : 12000,
  };
}
