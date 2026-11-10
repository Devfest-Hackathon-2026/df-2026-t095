'use client';
import { useEffect, useState } from 'react';
import type { Place } from './places';

/** 出発点の気候区分。場所のデータに無ければ緯度・経度から取得する。 */
export function useSourceClimate(source: Place): Place['climate'] {
  const [result, setResult] = useState<{ key: string; value: Place['climate'] } | null>(null);
  const key = `${source.id}:${source.lat}:${source.lng}`;

  useEffect(() => {
    if (source.locationUnknown || source.climate !== undefined) return;
    const controller = new AbortController();
    fetch(`/api/environment?lat=${source.lat}&lng=${source.lng}`, { signal: controller.signal })
      .then(async response => (await response.json()) as { climate: Place['climate'] })
      .then(data => {
        if (!controller.signal.aborted) setResult({ key, value: data.climate || null });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [key, source.id, source.lat, source.lng, source.locationUnknown, source.climate]);

  if (source.locationUnknown) return null;
  if (source.climate !== undefined) return source.climate;
  return result?.key === key ? result.value : null;
}
