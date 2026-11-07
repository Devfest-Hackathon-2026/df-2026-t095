"use client";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import type { Place } from "@/lib/places";
import { Icon } from "./icons";

type MapClick = {placeId?:string;latLng?:{lat:()=>number;lng:()=>number};stop?:()=>void};
type GMap = { addListener:(event:string,handler:(event:MapClick)=>void)=>void;setMapTypeId:(type:string)=>void;fitBounds: (b: GBounds, padding?: number) => void; getZoom: () => number | undefined; setZoom: (v: number) => void };
type GBounds = { extend: (p: {lat:number;lng:number}) => void };
type GItem = { setMap: (m: GMap | null) => void; addListener?: (event: string, handler: () => void) => void };
type GoogleApi = { Map: new (el: HTMLElement, options: object) => GMap; Marker: new (options: object) => GItem; Polyline: new (options: object) => GItem; LatLngBounds: new () => GBounds };
let googlePromise: Promise<GoogleApi> | null = null;
function loadGoogle(key: string) {
  if (googlePromise) return googlePromise;
  googlePromise = new Promise<GoogleApi>((resolve, reject) => {
    const w = window as unknown as {google?: {maps: GoogleApi}; elsewhereMapReady?: () => void};
    if (w.google?.maps) { resolve(w.google.maps); return; }
    w.elsewhereMapReady = () => w.google ? resolve(w.google.maps) : reject(new Error("Google Maps を表示できませんでした。"));
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=elsewhereMapReady&loading=async&language=ja&region=JP`;
    script.async = true; script.onerror = () => { googlePromise = null; reject(new Error("Google Maps を表示できませんでした。キーと参照元の設定を確認してください。")); };
    document.head.appendChild(script);
  });
  return googlePromise;
}
function escapeHtml(v: string) { return v.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!)); }

export function MapView({ source, places, activeId, onSelect, mapsKey, live, onPickLocation, onPickPlace, busy=false }: { source: Place; places: Place[]; activeId: string | null; onSelect: (id: string) => void; mapsKey: string; live: boolean; onPickLocation?:(point:{lat:number;lng:number})=>void; onPickPlace?:(placeId:string)=>void; busy?:boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const leaf = useRef<{ L: typeof Leaflet; map: Leaflet.Map; layers: Leaflet.Layer[] } | null>(null);
  const google = useRef<{ api: GoogleApi; map: GMap; layers: GItem[] } | null>(null);
  const select = useRef(onSelect); select.current = onSelect;
  const [ready, setReady] = useState(0);
  const [satellite,setSatellite]=useState(false);
  const pickLocation=useRef(onPickLocation);pickLocation.current=onPickLocation;
  const pickPlace=useRef(onPickPlace);pickPlace.current=onPickPlace;
  const [error, setError] = useState("");
  const bounds = useRef<() => void>(() => {});
  const fittedGeometry = useRef("");
  useEffect(() => {
    if (!container.current || (live && !mapsKey)) return;
    let cancelled = false; setError(""); setReady(0); fittedGeometry.current="";
    if (mapsKey) {
      loadGoogle(mapsKey).then(api => {
        if (cancelled || !container.current) return;
        const map = new api.Map(container.current, { center: {lat: 39, lng: 65}, zoom: 2, disableDefaultUI: true, streetViewControl:true, gestureHandling: "cooperative", styles: [
          { featureType: "water", elementType: "geometry", stylers: [{color: "#c8dfe0"}] },
          { featureType: "landscape", elementType: "geometry", stylers: [{color: "#edf0e8"}] },
          { featureType: "poi", stylers: [{visibility: "off"}] }, { featureType: "road", stylers: [{visibility: "off"}] },
          { featureType: "administrative", elementType: "labels.text.fill", stylers: [{color: "#6c837a"}] },
        ] });
        map.addListener('click',event=>{event.stop?.();if(event.placeId)pickPlace.current?.(event.placeId);else if(event.latLng)pickLocation.current?.({lat:event.latLng.lat(),lng:event.latLng.lng()});});
        google.current = { api, map, layers: [] }; setReady(1);
      }).catch(e => { if (!cancelled) setError(e.message); });
    } else {
      import("leaflet").then(L => {
        if (cancelled || !container.current) return;
        const map = L.map(container.current, { center: [39,65], zoom: 2, minZoom: 1, maxZoom: 17, zoomControl: false, scrollWheelZoom: false, worldCopyJump: false, attributionControl: true });
        let failed = 0;
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' }).on("tileerror", () => { if (++failed > 6 && !cancelled) setError("地図を読み込めませんでした。下の一覧から場所を確認できます。"); }).addTo(map);
        leaf.current = { L, map, layers: [] }; setReady(1);
      }).catch(() => { if (!cancelled) setError("地図を表示できませんでした。下の一覧から場所を確認できます。"); });
    }
    return () => { cancelled = true; leaf.current?.map.remove(); leaf.current = null; google.current?.layers.forEach(l => l.setMap(null)); google.current = null; };
  }, [mapsKey, live]);
  useEffect(() => {
    const points = [source, ...places];
    if (leaf.current) {
      const { L, map, layers } = leaf.current; layers.forEach(l => l.remove()); layers.length = 0;
      for (const [index,p] of points.entries()) {
        const isSource = index === 0, active = p.id === activeId;
        const html = `<span class="place-pin ${isSource ? "source-pin" : ""} ${active ? "active-pin" : ""}"><span class="pin-dot">${isSource ? "" : index}</span><span class="pin-label">${escapeHtml(p.city)}</span></span>`;
        const marker = L.marker([p.lat, p.lng], { title:p.name, keyboard:!isSource, interactive:!isSource, icon: L.divIcon({ className: "map-marker", html, iconSize: [120,40], iconAnchor:[16,20] }), zIndexOffset: active ? 1000 : isSource ? 500 : 100 });
        if (!isSource) marker.on("click", () => select.current(p.id));
        marker.addTo(map); marker.getElement()?.setAttribute("aria-label", `${isSource ? "出発点：" : "場所を選ぶ："}${p.name}`); layers.push(marker);
        if (!isSource) { const line = L.polyline([[source.lat, source.lng], [p.lat,p.lng]], { color: active ? "#244f3c" : "#6a9582", weight: active ? 2 : 1.5, opacity: active ? 0.8 : 0.48, dashArray: "4 7", interactive: false }).addTo(map); layers.push(line); }
      }
      bounds.current = () => { if (points.length > 1) map.fitBounds(L.latLngBounds(points.map(p => [p.lat,p.lng] as [number,number])), { padding: [48,48], maxZoom: 11, animate: false }); else map.setView([source.lat,source.lng], 6, {animate:false}); };
      const geometry=JSON.stringify(points.map(p=>[p.id,p.lat,p.lng]));
      if(fittedGeometry.current!==geometry){bounds.current();fittedGeometry.current=geometry;}
    }
    if (google.current) {
      const { api,map,layers } = google.current; layers.forEach(l => l.setMap(null)); layers.length=0;
      points.forEach((p,index) => {
        const marker = new api.Marker({ map, position: {lat:p.lat,lng:p.lng}, title: p.name, label: {text: index === 0 ? "出" : String(index), color: "white",fontWeight:"600"}, icon: {path: "M 0 0 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0", fillColor: index === 0 ? "#748f75" : "#285c46", fillOpacity:1, strokeColor: "#ffffff", strokeWeight:3, scale:1}, zIndex: p.id === activeId ? 100 : 10 });
        if (index > 0) marker.addListener?.("click", () => select.current(p.id)); layers.push(marker);
        if (index > 0) layers.push(new api.Polyline({ map, path:[{lat:source.lat,lng:source.lng},{lat:p.lat,lng:p.lng}], geodesic:true, strokeColor: "#477f64", strokeOpacity:0.5, strokeWeight:1.5 }));
      });
      bounds.current = () => { const b = new api.LatLngBounds(); points.forEach(p => b.extend({lat:p.lat,lng:p.lng})); map.fitBounds(b,48); }; const geometry=JSON.stringify(points.map(p=>[p.id,p.lat,p.lng]));if(fittedGeometry.current!==geometry){bounds.current();fittedGeometry.current=geometry;}
    }
  }, [source, places, activeId, ready]);
  useEffect(() => {
    if(!container.current) return;
    const observer=new ResizeObserver(()=>{
      if(leaf.current){leaf.current.map.invalidateSize({animate:false});bounds.current();}
      if(google.current) bounds.current();
    });
    observer.observe(container.current);
    return ()=>observer.disconnect();
  }, [ready]);
  useEffect(()=>{google.current?.map.setMapTypeId(satellite?'satellite':'roadmap');},[satellite,ready]);
  const zoom = (delta:number) => { if(leaf.current) leaf.current.map.setZoom(leaf.current.map.getZoom()+delta); if(google.current) google.current.map.setZoom((google.current.map.getZoom() || 2)+delta); };
  return <section className="map-shell" aria-label="出発点と候補の場所"><div ref={container} className="map-canvas" role="region" aria-label={mapsKey ? "Google Maps" : "サンプルの地図"} /><div className="map-label"><span className="status-dot" /> 地図を押して出発点を選ぶ</div><div className="map-buttons">{mapsKey&&<button className="map-type-button" type="button" aria-pressed={satellite} onClick={()=>setSatellite(x=>!x)}>{satellite?"地図":"航空写真"}</button>}<button className="icon-button" aria-label="すべての場所が見えるようにする" onClick={() => bounds.current()}><Icon name="Crosshair" /></button><div className="zoom-group"><button className="icon-button" aria-label="地図を拡大" onClick={() => zoom(1)}><Icon name="Plus" /></button><button className="icon-button" aria-label="地図を縮小" onClick={() => zoom(-1)}><Icon name="Minus" /></button></div></div>{busy&&<div className="map-busy" role="status">この場所を確認しています…</div>}<div className="map-key"><span className="key-source" /> 出発点 <span className="key-result" /> 候補の場所</div>{(!ready && !error && !(live && !mapsKey)) && <div className="map-loading">地図を読み込んでいます…</div>}{(error || (live && !mapsKey)) && <div className="map-message"><Icon name="MapTrifold" size={30} /><p>{error || "Google Maps の接続を確認してください。各候補のリンクからも場所を開けます。"}</p></div>}</section>;
}
