"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import type {Place} from '@/lib/places';
import {loadGoogle} from './map-view';
import {Icon} from './icons';
type Camera={center:{lat:number;lng:number;altitude:number};range:number;tilt:number;heading:number};
type Globe=HTMLElement&Camera&{flyCameraTo:(o:{endCamera:Camera;durationMillis:number})=>void;stopCameraAnimation:()=>void};
type Api={Map3DElement:new(o:object)=>Globe;MarkerInteractiveElement?:new(o:object)=>HTMLElement;Marker3DInteractiveElement?:new(o:object)=>HTMLElement};
const motionQuery='(prefers-reduced-motion: reduce)';
const motionSubscribe=(onChange:()=>void)=>{const mq=matchMedia(motionQuery);mq.addEventListener('change',onChange);return()=>mq.removeEventListener('change',onChange);};
export function GlobeView({source,places,activeId,onSelect,mapsKey}:{source:Place;places:Place[];activeId:string|null;onSelect:(id:string)=>void;mapsKey:string}){
 const container=useRef<HTMLDivElement>(null),map=useRef<Globe|null>(null),api=useRef<Api|null>(null),markers=useRef<HTMLElement[]>([]),select=useRef(onSelect),previousSource=useRef(source.id);
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[flying,setFlying]=useState(false);const reduced=useSyncExternalStore(motionSubscribe,()=>matchMedia(motionQuery).matches,()=>false);const flightTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{select.current=onSelect;},[onSelect]);

 useEffect(()=>{let disposed=false;if(!mapsKey)return;
  loadGoogle(mapsKey).then(async raw=>{const loader=raw as unknown as {importLibrary:(name:string)=>Promise<Api>};const lib=await loader.importLibrary('maps3d');if(disposed||!container.current)return;api.current=lib;const globe=new lib.Map3DElement({center:{lat:20,lng:135,altitude:0},range:20000000,tilt:0,heading:0,mode:'HYBRID',defaultUIHidden:true});globe.setAttribute('aria-label','Googleの3D地球儀');globe.addEventListener('gmp-error',()=>{if(!disposed)setError('3D表示を利用できません。上の「地図」に切り替えてください。');});globe.addEventListener('gmp-animationend',()=>{if(!disposed)setFlying(false);});map.current=globe;container.current.replaceChildren(globe);setReady(true);}).catch(()=>{if(!disposed)setError('3D地球儀を読み込めません。「地図」でも候補を確認できます。');});
  return()=>{disposed=true;map.current?.stopCameraAnimation();map.current?.remove();map.current=null;if(flightTimer.current)clearTimeout(flightTimer.current);};
 },[mapsKey]);
 const fly=(place:Place|null)=>{const globe=map.current;if(!globe)return;globe.stopCameraAnimation();const endCamera:Camera=place?{center:{lat:place.lat,lng:place.lng,altitude:0},range:place.viewRange||12000,tilt:place.landform?25:50,heading:0}:{center:{lat:20,lng:135,altitude:0},range:20000000,tilt:0,heading:0};if(flightTimer.current)clearTimeout(flightTimer.current);if(reduced){Object.assign(globe,endCamera);setFlying(false);}else{setFlying(true);globe.flyCameraTo({endCamera,durationMillis:2200});flightTimer.current=setTimeout(()=>setFlying(false),3500);}};
 const flyRef=useRef(fly);useEffect(()=>{flyRef.current=fly;});
 useEffect(()=>{if(!ready||!map.current||!api.current)return;markers.current.forEach(m=>m.remove());markers.current=[];const Marker=api.current.MarkerInteractiveElement||api.current.Marker3DInteractiveElement;if(!Marker)return;
  for(const p of source.locationUnknown?places:[source,...places]){const marker=new Marker({position:{lat:p.lat,lng:p.lng,altitude:0},title:p.name});marker.addEventListener('gmp-click',()=>{if(p.id!==source.id)select.current(p.id);else flyRef.current(p);});map.current.appendChild(marker);markers.current.push(marker);}
 },[source,places,ready]);
 useEffect(()=>{if(!ready||!activeId)return;const p=places.find(p=>p.id===activeId);if(p)flyRef.current(p);},[activeId,places,ready]);
 useEffect(()=>{if(previousSource.current!==source.id){previousSource.current=source.id;if(!source.locationUnknown)flyRef.current(source);}},[source]);
 return <section className="globe-shell" aria-label="3D地球儀で場所を比べる"><div className="globe-toolbar"><span><Icon name="GlobeHemisphereWest" size={20}/>地球から、好きな場所へ</span><div><button type="button" className="secondary-button" disabled={!ready} onClick={()=>fly(null)}>地球全体</button><button type="button" className="primary-button" disabled={!ready||source.locationUnknown} title={source.locationUnknown?'写真の撮影場所は未指定です':undefined} onClick={()=>fly(source)}>出発点へ近づく<Icon name="ArrowRight" size={16}/></button></div></div><div ref={container} className="globe-canvas"/>{!ready&&!error&&<p className="globe-loading" role="status">3D地球儀を読み込んでいます…</p>}{error&&<p className="error-message" role="alert">{error}</p>}<div className="globe-status" role="status">{flying?'選んだ場所へ移動しています…':reduced?'動きを減らす設定で表示しています。':'場所を選ぶと、地球儀から風景へ近づきます。'}</div>{places.length>0&&<div className="globe-destinations" aria-label="地球儀で移動する候補">{places.map((p,i)=><button key={p.id} type="button" aria-pressed={activeId===p.id} onClick={()=>{onSelect(p.id);fly(p);}}><span>{i+1}</span>{p.name}<Icon name="ArrowUpRight" size={16}/></button>)}</div>}</section>;
}
