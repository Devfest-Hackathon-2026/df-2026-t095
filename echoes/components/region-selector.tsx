"use client";
import {useEffect,useRef,useState} from 'react';
import {loadGoogle} from './map-view';
import {regionMetrics,validateRegion,type GeoRegion} from '@/lib/geo-region';
type Point={lat:number;lng:number};
type Rect={setBounds:(bounds:GeoRegion)=>void;setMap:(map:unknown)=>void};
type MapLike={fitBounds:(bounds:GeoRegion,padding:number)=>void;addListener:(name:string,fn:(e:{latLng?:{lat:()=>number;lng:()=>number};stop?:()=>void})=>void)=>void};
type RegionApi={Map:new(node:HTMLElement,options:object)=>MapLike;Rectangle:new(options:object)=>Rect;event?:{clearInstanceListeners:(target:unknown)=>void}};
export function RegionSelector({mapsKey,region,onChange}:{mapsKey:string;region:GeoRegion;onChange:(r:GeoRegion)=>void}){
 const container=useRef<HTMLDivElement>(null),map=useRef<MapLike|null>(null),rectangle=useRef<Rect|null>(null),callback=useRef(onChange),first=useRef<Point|null>(null),selecting=useRef(false);
 const [drawing,setDrawing]=useState(false),[anchor,setAnchor]=useState<Point|null>(null),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{callback.current=onChange;},[onChange]);
 useEffect(()=>{let disposed=false;let api:RegionApi|undefined;
  if(!mapsKey||!container.current)return;
  loadGoogle(mapsKey).then(raw=>{if(disposed||!container.current)return;api=raw as unknown as RegionApi;
   const m=new api.Map(container.current,{center:{lat:35,lng:135},zoom:8,mapTypeId:'satellite',mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'cooperative'});map.current=m;
   rectangle.current=new api.Rectangle({map:m,strokeColor:'#e8f6c7',strokeWeight:2,fillColor:'#b7d38c',fillOpacity:.15,clickable:false});
   m.addListener('click',e=>{if(!selecting.current||!e.latLng)return;e.stop?.();const p={lat:e.latLng.lat(),lng:e.latLng.lng()};if(!first.current){first.current=p;setAnchor(p);return;}
    const a=first.current;try{const r=validateRegion({north:Math.max(a.lat,p.lat),south:Math.min(a.lat,p.lat),east:Math.max(a.lng,p.lng),west:Math.min(a.lng,p.lng)});callback.current(r);selecting.current=false;first.current=null;setAnchor(null);setDrawing(false);setError('');}catch(error){setError(error instanceof Error?error.message:'範囲を選び直してください。');first.current=null;setAnchor(null);}});setReady(true);
  }).catch(()=>{if(!disposed)setError('航空写真を表示できません。下の緯度・経度でも範囲を指定できます。');});
  return()=>{disposed=true;rectangle.current?.setMap(null);if(map.current)api?.event?.clearInstanceListeners(map.current);map.current=null;rectangle.current=null;};
 },[mapsKey]);
 useEffect(()=>{if(!ready)return;try{validateRegion(region);rectangle.current?.setBounds(region);map.current?.fitBounds(region,36);}catch{}},[region,ready]);
 let validation='';try{validateRegion(region);}catch(e){validation=e instanceof Error?e.message:'範囲を確認してください。';}const metrics=regionMetrics(region);
 const cancel=()=>{first.current=null;selecting.current=false;setDrawing(false);setAnchor(null);setError('');};
 return <section className="region-selector" aria-label="比較する衛星データの範囲"><div className="region-toolbar"><div><h3>比較元の範囲</h3><p>航空写真の対角となる2点を押して、四角い範囲を選びます。</p></div><button type="button" className="secondary-button" disabled={!ready} aria-pressed={drawing} onClick={()=>{if(drawing)cancel();else{first.current=null;selecting.current=true;setDrawing(true);setAnchor(null);setError('');}}}>{drawing?'選択を中止':'地図で範囲を選ぶ'}</button></div><p className="region-step" role="status">{drawing?(anchor?'2点目を押してください。':'1点目を押してください。地図は2本指で移動できます。'):'枠内の衛星特徴を比較します。範囲は下の数値でも変更できます。'}</p><div ref={container} className={`region-map ${drawing?'is-selecting':''}`} role="region" aria-label="範囲を選ぶGoogle衛星表示"/>{error&&<p className="route-error" role="alert">{error}</p>}<div className="region-bounds">{([{key:'north',label:'北端の緯度'},{key:'south',label:'南端の緯度'},{key:'west',label:'西端の経度'},{key:'east',label:'東端の経度'}] as const).map(f=><label key={f.key}>{f.label}<input type="number" step="0.0001" value={Number.isFinite(region[f.key])?Number(region[f.key].toFixed(6)):''} onChange={e=>onChange({...region,[f.key]:e.target.value===''?NaN:Number(e.target.value)})}/></label>)}</div>{validation?<p className="route-error" role="status">{validation}</p>:<p className="terrain-note">約 {metrics.widthKm.toFixed(1)} × {metrics.heightKm.toFixed(1)} km（{metrics.areaKm2.toFixed(1)} km²）を選択。表示はGoogleの航空写真、比較は2024年のEarth Engine衛星観測です。表示画像を取得・解析することはありません。</p>}</section>;
}
