'use client';
import { numberLocale, t } from './i18n';
import { useState } from 'react';
import { fetchRoute } from './discovery-api';
import type { Place } from './places';

type RouteEstimate = { loading: boolean; text?: string; error?: string; href?: string };

export function useRouteEstimate() {
  const [route, setRoute] = useState<RouteEstimate | null>(null);

  const getRoute = async (place: Place) => {
    if (!navigator.geolocation) {
      setRoute({
        loading: false,
        error: t('このブラウザーでは現在地を取得できません。Google Maps で行き方を確認できます。'),
      });
      return;
    }
    setRoute({ loading: true });
    try {
      const position = await new Promise<GeolocationPosition>((ok, ng) =>
        navigator.geolocation.getCurrentPosition(ok, ng, {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        }),
      );
      const origin = { lat: position.coords.latitude, lng: position.coords.longitude };
      const mode =
        Math.abs(origin.lat - place.lat) + Math.abs(origin.lng - place.lng) < 0.2
          ? 'WALK'
          : 'DRIVE';
      const data = await fetchRoute(origin, { lat: place.lat, lng: place.lng }, mode);
      const minutes = Math.ceil(parseFloat(data.duration || '0') / 60);
      const distance = (Number(data.distanceMeters || 0) / 1000).toLocaleString(numberLocale(), {
        maximumFractionDigits: 1,
      });
      setRoute({
        loading: false,
        text: t('{v0}で約 {v1} 分・{v2} km', {
          v0: mode === 'WALK' ? t('徒歩') : t('車'),
          v1: minutes,
          v2: distance,
        }),
      });
    } catch (e) {
      setRoute({
        loading: false,
        error:
          e && typeof e === 'object' && 'code' in e
            ? t('現在地を取得できませんでした。位置情報の許可を確認してください。')
            : e instanceof Error
              ? e.message
              : t('経路を確認できませんでした。'),
      });
    }
  };

  return { route, setRoute, getRoute };
}
