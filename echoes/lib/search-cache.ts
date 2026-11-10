/** 件数と期限のあるメモリー上のキャッシュ。古いものから捨てる。 */
export function createLruCache<T>(maxEntries: number, ttlMs: number, now = () => Date.now()) {
  const entries = new Map<string, { value: T; expiresAt: number }>();
  return {
    get(key: string): T | undefined {
      const entry = entries.get(key);
      if (!entry) return undefined;
      entries.delete(key);
      if (entry.expiresAt <= now()) return undefined;
      entries.set(key, entry);
      return entry.value;
    },
    set(key: string, value: T) {
      entries.delete(key);
      entries.set(key, { value, expiresAt: now() + ttlMs });
      while (entries.size > maxEntries) entries.delete(entries.keys().next().value as string);
    },
    get size() {
      return entries.size;
    },
  };
}
