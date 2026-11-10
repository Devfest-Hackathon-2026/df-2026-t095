'use client';
import { t } from '@/lib/i18n';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Place } from '@/lib/places';
import { loadGoogle } from './map-view';
import { Icon } from './icons';
import { globeRangeForExtent } from '@/lib/globe-camera';
type Camera = {
  center: { lat: number; lng: number; altitude: number };
  range: number;
  tilt: number;
  heading: number;
};
type Globe = HTMLElement &
  Camera & {
    flyCameraTo: (o: { endCamera: Camera; durationMillis: number }) => void;
    stopCameraAnimation: () => void;
  };
type Api = {
  Map3DElement: new (o: object) => Globe;
  MarkerInteractiveElement?: new (o: object) => HTMLElement;
  Marker3DInteractiveElement?: new (o: object) => HTMLElement;
};
const motionQuery = '(prefers-reduced-motion: reduce)';
const motionSubscribe = (onChange: () => void) => {
  const mq = matchMedia(motionQuery);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};
export function GlobeView({
  source,
  places,
  activeId,
  onSelect,
  mapsKey,
}: {
  source: Place;
  places: Place[];
  activeId: string | null;
  onSelect: (id: string) => void;
  mapsKey: string;
}) {
  const container = useRef<HTMLDivElement>(null),
    map = useRef<Globe | null>(null),
    api = useRef<Api | null>(null),
    markers = useRef<HTMLElement[]>([]),
    select = useRef(onSelect),
    previousSource = useRef(source.id);
  const [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [flying, setFlying] = useState(false);
  const reduced = useSyncExternalStore(
    motionSubscribe,
    () => matchMedia(motionQuery).matches,
    () => false,
  );
  const flightTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    focusedPlace = useRef<Place | null>(null);
  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let disposed = false;
    if (!mapsKey) return;
    loadGoogle(mapsKey)
      .then(async raw => {
        const loader = raw as unknown as { importLibrary: (name: string) => Promise<Api> };
        const lib = await loader.importLibrary('maps3d');
        if (disposed || !container.current) return;
        api.current = lib;
        const globe = new lib.Map3DElement({
          center: { lat: 20, lng: 135, altitude: 0 },
          range: 20000000,
          tilt: 0,
          heading: 0,
          mode: 'HYBRID',
          defaultUIHidden: true,
        });
        globe.setAttribute('aria-label', t('Googleの3D地球儀'));
        globe.addEventListener('gmp-error', () => {
          if (!disposed) setError(t('3D表示を利用できません。上の「地図」に切り替えてください。'));
        });
        globe.addEventListener('gmp-animationend', () => {
          if (!disposed) setFlying(false);
        });
        map.current = globe;
        container.current.replaceChildren(globe);
        setReady(true);
      })
      .catch(() => {
        if (!disposed) setError(t('3D地球儀を読み込めません。「地図」でも候補を確認できます。'));
      });
    return () => {
      disposed = true;
      map.current?.stopCameraAnimation();
      map.current?.remove();
      map.current = null;
      if (flightTimer.current) clearTimeout(flightTimer.current);
    };
  }, [mapsKey]);
  const fly = (place: Place | null, animate = true) => {
    const globe = map.current;
    if (!globe) return;
    focusedPlace.current = place;
    globe.stopCameraAnimation();
    const range = place?.viewExtent
      ? globeRangeForExtent(place.viewExtent, {
          width: container.current?.clientWidth || 400,
          height: container.current?.clientHeight || 400,
        })
      : place?.viewRange || 12000;
    const endCamera: Camera = place
      ? {
          center: { lat: place.lat, lng: place.lng, altitude: 0 },
          range,
          tilt: place.landform ? 0 : 50,
          heading: 0,
        }
      : { center: { lat: 20, lng: 135, altitude: 0 }, range: 20000000, tilt: 0, heading: 0 };
    if (flightTimer.current) clearTimeout(flightTimer.current);
    if (reduced || !animate) {
      Object.assign(globe, endCamera);
      setFlying(false);
    } else {
      setFlying(true);
      globe.flyCameraTo({ endCamera, durationMillis: 2200 });
      flightTimer.current = setTimeout(() => setFlying(false), 3500);
    }
  };
  const flyRef = useRef(fly);
  useEffect(() => {
    flyRef.current = fly;
  });
  useEffect(() => {
    if (!ready || !container.current) return;
    const observer = new ResizeObserver(() => {
      if (focusedPlace.current?.viewExtent) flyRef.current(focusedPlace.current, false);
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [ready]);
  useEffect(() => {
    if (!ready || !map.current || !api.current) return;
    markers.current.forEach(m => m.remove());
    markers.current = [];
    const Marker = api.current.MarkerInteractiveElement || api.current.Marker3DInteractiveElement;
    if (!Marker) return;
    for (const p of source.locationUnknown ? places : [source, ...places]) {
      const marker = new Marker({
        position: { lat: p.lat, lng: p.lng, altitude: 0 },
        title: p.name,
      });
      marker.addEventListener('gmp-click', () => {
        if (p.id !== source.id) select.current(p.id);
        else flyRef.current(p);
      });
      map.current.appendChild(marker);
      markers.current.push(marker);
    }
  }, [source, places, ready]);
  useEffect(() => {
    if (!ready || !activeId) return;
    const p = places.find(p => p.id === activeId);
    if (p) flyRef.current(p);
  }, [activeId, places, ready]);
  useEffect(() => {
    if (previousSource.current !== source.id) {
      previousSource.current = source.id;
      if (!source.locationUnknown) flyRef.current(source);
    }
  }, [source]);
  return (
    <section className="globe-shell" aria-label={t('3D地球儀で場所を比べる')}>
      <div className="globe-toolbar">
        <span>
          <Icon name="GlobeHemisphereWest" size={20} />
          {t('地球から、好きな場所へ')}
        </span>
        <div>
          <button
            type="button"
            className="secondary-button"
            disabled={!ready}
            onClick={() => fly(null)}
          >
            {t('地球全体')}
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={!ready || source.locationUnknown}
            title={source.locationUnknown ? t('写真の撮影場所は未指定です') : undefined}
            onClick={() => fly(source)}
          >
            {t('出発点へ近づく')}
            <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      </div>
      <div ref={container} className="globe-canvas" />
      {!ready && !error && (
        <p className="globe-loading" role="status">
          {t('3D地球儀を読み込んでいます…')}
        </p>
      )}
      {error && (
        <p className="error-message" role="alert">
          {t(error)}
        </p>
      )}
      <div className="globe-status" role="status">
        {flying
          ? t('選んだ場所へ移動しています…')
          : reduced
            ? t('動きを減らす設定で表示しています。')
            : t('場所を選ぶと、地球儀から風景へ近づきます。')}
      </div>
      {places.length > 0 && (
        <div className="globe-destinations" aria-label={t('地球儀で移動する候補')}>
          {places.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={activeId === p.id}
              onClick={() => {
                onSelect(p.id);
                fly(p);
              }}
            >
              <span>{i + 1}</span>
              {p.name}
              <Icon name="ArrowUpRight" size={16} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
