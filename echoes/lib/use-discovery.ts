"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {defaultPreferences,places,type Place,type Quality} from './places';
import {diverseResults,isQuality,rankPlaces} from './discovery';
import type {VisualSearchSummary} from './visual-types';
import type {AppConfig} from './app-config';
import type {FirebaseSession,SavedRef} from './firebase-client';
const refKey=(ref:SavedRef)=>ref.placeId?`google-${ref.placeId}`:ref.sampleId;
const toRef=(place:Place):SavedRef=>({placeId:place.placeId||'',sampleId:place.placeId?'':place.id});
async function resolve(input:object,signal?:AbortSignal):Promise<Place>{const r=await fetch('/api/resolve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal});const data=await r.json() as {place?:Place;error?:string};if(!r.ok||!data.place)throw new Error(data.error||'場所を確認できませんでした。');return data.place;}
export function useDiscovery(){
 const [source,setSource]=useState<Place>(places[0]);const [query,setQuery]=useState(places[0].name);
 const [preferences,setPreferences]=useState<Quality[]>(defaultPreferences);const [destination,setDestinationState]=useState('world');
 const [view,setView]=useState<'discover'|'saved'>('discover');const [layout,setLayout]=useState<'map'|'list'>('map');
 const [activeId,setActiveId]=useState<string|null>(null);const [detail,setDetail]=useState<Place|null>(null);
 const [modal,setModal]=useState<'how'|'privacy'|'terms'|'credits'|null>(null);
 const [shareUrl,setShareUrl]=useState('');const [toast,setToast]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(false);const [resolving,setResolving]=useState(false);
 const [config,setConfig]=useState<AppConfig|null>(null);const [liveMode,setLiveMode]=useState(false);const [livePlaces,setLivePlaces]=useState<Place[]>([]);
 const [savedRefs,setSavedRefs]=useState<SavedRef[]>([]);const [savedPlaces,setSavedPlaces]=useState<Place[]>([]);const [savingIds,setSavingIds]=useState<string[]>([]);
 const [storageStatus,setStorageStatus]=useState<'connecting'|'cloud'|'local'|'error'>('connecting');
 const [searchKind,setSearchKindState]=useState<'atmosphere'|'visual'|'terrain'>('atmosphere');const [visualWeight,setVisualWeightState]=useState(.6);const [visualSearch,setVisualSearch]=useState<VisualSearchSummary|null>(null);
 const [route,setRoute]=useState<{loading:boolean;text?:string;error?:string;href?:string}|null>(null);
 const request=useRef<AbortController|null>(null);const sourceRequest=useRef<AbortController|null>(null);
 const session=useRef<FirebaseSession|null>(null);const cloudReady=useRef(false);const restored=useRef(false);const known=useRef(new Map(places.map(p=>[p.id,p])));
 const localRefs=useRef<SavedRef[]>([]);
 const pendingSaves=useRef(new Set<string>());const userChanged=useRef(false);
 useEffect(()=>{
  let cancelled=false;let unsubscribe:(()=>void)|undefined;
  void Promise.resolve().then(()=>{if(cancelled)return;
  const params=new URLSearchParams(window.location.search);const initial=places.find(p=>p.id===params.get('source'));const method=params.get('method');if(method==='visual'||method==='terrain')setSearchKindState(method);const weight=Number(params.get('weight'));if(params.has('weight')&&Number.isFinite(weight)&&weight>=0&&weight<=1)setVisualWeightState(weight);
  if(initial){setSource(initial);setQuery(initial.name);}
  const prefs=params.get('qualities')?.split(',').filter(isQuality);if(prefs?.length)setPreferences([...new Set(prefs)]);
  const dest=params.get('destination');if(dest&&dest.length<=100)setDestinationState(dest);
  try{const data=JSON.parse(localStorage.getItem('elsewhere:saved-v2')||'null');if(Array.isArray(data))setSavedRefs(data.filter(r=>typeof r?.placeId==='string'&&typeof r?.sampleId==='string'));else{const legacy=JSON.parse(localStorage.getItem('elsewhere:saved')||'[]');if(Array.isArray(legacy))setSavedRefs(legacy.filter(id=>places.some(p=>p.id===id)).map(sampleId=>({placeId:'',sampleId})));}}catch{}
  try{const previous=JSON.parse(localStorage.getItem('elsewhere:saved-v2')||'null');if(Array.isArray(previous))localRefs.current=previous.filter(r=>typeof r?.placeId==='string'&&typeof r?.sampleId==='string');else{const legacy=JSON.parse(localStorage.getItem('elsewhere:saved')||'[]');if(Array.isArray(legacy))localRefs.current=legacy.filter(id=>places.some(p=>p.id===id)).map(sampleId=>({placeId:'',sampleId}));}}catch{}
  restored.current=true;
  (async()=>{
   const response=await fetch('/api/config');if(!response.ok)throw new Error('接続設定を確認できませんでした。');const c=await response.json() as AppConfig;if(cancelled)return;setConfig(c);setLiveMode(c.liveSearch&&c.places);
   if(c.firebase){
    try{
     const cloud=await import('./firebase-client');const s=await cloud.connectFirebase(c.firebase);if(cancelled)return;session.current=s;
     const migrationKey=`elsewhere:migrated:${s.uid}`;if(!localStorage.getItem(migrationKey)){await Promise.all(localRefs.current.map(ref=>cloud.saveFavorite(s,ref,true)));localStorage.setItem(migrationKey,'1');}
     const settings=await cloud.loadSettings(s);
     if(settings&&!params.has('qualities')&&!params.has('share')&&!userChanged.current){const valid=settings.preferences?.filter(isQuality);if(valid?.length)setPreferences(valid);if(typeof settings.destination==='string')setDestinationState(settings.destination);}
     if(cancelled)return;cloudReady.current=true;setStorageStatus('cloud');
     unsubscribe=cloud.listenFavorites(s,refs=>{if(!cancelled){setSavedRefs(refs);setStorageStatus('cloud');}},()=>{if(!cancelled){setStorageStatus('error');setToast('保存した場所を読み込めませんでした。接続を確認してください。');}});
     const shareId=params.get('share');if(shareId){const shared=await cloud.loadShare(s,shareId);if(!shared)throw new Error('共有された検索が見つかりませんでした。');if(!cancelled){setPreferences(shared.preferences.filter(isQuality));setDestinationState(shared.destination);if(shared.sourcePlaceId){const p=await resolve({placeId:shared.sourcePlaceId});if(!cancelled){known.current.set(p.id,p);setSource(p);setQuery(p.name);}}else{const p=places.find(p=>p.id===shared.sourceSampleId);if(p){setSource(p);setQuery(p.name);}}setToast('共有された検索条件を開きました。検索ボタンで候補を探せます。');}}
    }catch(e){if(!cancelled){setStorageStatus('error');setError(e instanceof Error?e.message:'Google への保存を開始できませんでした。');}}
   }else setStorageStatus('local');
   const placeId=params.get('placeId');if(placeId&&c.places){const p=await resolve({placeId});if(!cancelled){known.current.set(p.id,p);setSource(p);setQuery(p.name);}}
  })().catch(e=>{if(!cancelled){setStorageStatus('local');setError(e instanceof Error?e.message:'Google への接続を確認できませんでした。');}});
  });
  return()=>{cancelled=true;unsubscribe?.();request.current?.abort();sourceRequest.current?.abort();};
 },[]);
 useEffect(()=>{if(!restored.current)return;try{localStorage.setItem('elsewhere:saved-v2',JSON.stringify(savedRefs));}catch{queueMicrotask(()=>setToast('このブラウザーでは保存情報を保持できません。'));}},[savedRefs]);
 useEffect(()=>{
  let cancelled=false;
  (async()=>{const data=await Promise.all(savedRefs.map(async ref=>{const key=refKey(ref);const cached=known.current.get(key);if(cached)return cached;if(!ref.placeId)return places.find(p=>p.id===ref.sampleId)||null;try{const p=await resolve({placeId:ref.placeId});known.current.set(p.id,p);return p;}catch{return null;}}));if(!cancelled)setSavedPlaces(data.filter((p):p is Place=>Boolean(p)));})();
  return()=>{cancelled=true;};
 },[savedRefs]);
 useEffect(()=>{if(!cloudReady.current||!session.current||storageStatus!=='cloud')return;const timer=setTimeout(()=>{import('./firebase-client').then(c=>c.saveSettings(session.current!,{preferences,destination})).catch(()=>setToast('検索条件を保存できませんでした。'));},700);return()=>clearTimeout(timer);},[preferences,destination,storageStatus]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),4200);return()=>clearTimeout(t);},[toast]);
 const textResults=useMemo(()=>diverseResults(rankPlaces(source,preferences,liveMode?'world':destination,liveMode?livePlaces:places)),[source,preferences,destination,liveMode,livePlaces]);
 const results=liveMode&&searchKind==='visual'?livePlaces:textResults;
 const displayed=view==='saved'?savedPlaces:results;
 const isSaved=useCallback((p:Place)=>savedRefs.some(r=>refKey(r)===p.id||(r.placeId&&r.placeId===p.placeId)),[savedRefs]);
 const toggleSaved=async(p:Place)=>{
  if(pendingSaves.current.has(p.id))return;pendingSaves.current.add(p.id);setSavingIds(ids=>[...ids,p.id]);const ref=toRef(p),wasSaved=isSaved(p),before=savedRefs;known.current.set(p.id,p);
  setSavedRefs(prev=>wasSaved?prev.filter(r=>refKey(r)!==p.id):[...prev,ref]);
  try{if(session.current){const cloud=await import('./firebase-client');await cloud.saveFavorite(session.current,ref,!wasSaved);}setToast(wasSaved?'保存した場所から削除しました。':storageStatus==='cloud'?'気になる場所を保存しました。':'このブラウザーに保存しました。');}
  catch{setSavedRefs(before);setToast('保存を変更できませんでした。接続を確認して、もう一度お試しください。');}
  finally{pendingSaves.current.delete(p.id);setSavingIds(ids=>ids.filter(id=>id!==p.id));}
 };
 const chooseSource=(p:Place)=>{setShareUrl('');request.current?.abort();setLoading(false);known.current.set(p.id,p);setSource(p);setQuery(p.name);setLivePlaces([]);setVisualSearch(null);setActiveId(null);setError('');setView('discover');setRoute(null);};
 const choosePlaceId=async(placeId:string,sessionToken?:string)=>{sourceRequest.current?.abort();const c=new AbortController();sourceRequest.current=c;setResolving(true);setError('');try{const p=await resolve({placeId,sessionToken},c.signal);if(!c.signal.aborted)chooseSource(p);}catch(e){if(!c.signal.aborted)setError(e instanceof Error?e.message:'場所を確認できませんでした。');}finally{if(sourceRequest.current===c)setResolving(false);}};
 const chooseLocation=async(location:{lat:number;lng:number})=>{sourceRequest.current?.abort();const c=new AbortController();sourceRequest.current=c;setResolving(true);setError('');try{const p=await resolve({location},c.signal);if(!c.signal.aborted){chooseSource(p);setToast('地図で選んだ場所を出発点にしました。');}}catch(e){if(!c.signal.aborted)setError(e instanceof Error?e.message:'この地点を確認できませんでした。');}finally{if(sourceRequest.current===c)setResolving(false);}};
 const search=async()=>{
  setError('');setShareUrl('');setVisualSearch(null);setView('discover');setActiveId(null);setRoute(null);userChanged.current=true;
  if(!liveMode){const p=places.find(p=>p.name===query.trim()||`${p.name} ${p.city}`===query.trim());if(!p){setError('サンプルから出発点を選んでください。Google 検索では好きな場所を入力できます。');return;}setSource(p);return;}
  if(query.trim().length<2){setError('出発点の地名を入れてください。');return;}
  if(searchKind==='terrain'){setResolving(true);try{chooseSource(await resolve({query:query.trim()}));}catch(e){setError(e instanceof Error?e.message:'出発点を確認できませんでした。');}finally{setResolving(false);}return;}
  request.current?.abort();const c=new AbortController();request.current=c;setLoading(true);setLivePlaces([]);
  if(searchKind==='visual'){
   try{const sample=places.find(p=>p.name===query.trim());const current=sample||(query.trim()===source.name&&source.placeId?source:await resolve({query:query.trim()},c.signal));
    const r=await fetch('/api/visual',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sampleId:sample?.id,placeId:current.placeId,source:query.trim(),preferences,destination,visualWeight}),signal:c.signal});const data=await r.json() as {source:Place;places:Place[];visualSearch:VisualSearchSummary;error?:string};if(!r.ok)throw new Error(data.error||'写真の比較を完了できませんでした。');if(c.signal.aborted)return;setSource(data.source);setQuery(data.source.name);setLivePlaces(data.places);setVisualSearch(data.visualSearch);[data.source,...data.places].forEach(p=>known.current.set(p.id,p));
   }catch(e){if(!c.signal.aborted)setError(e instanceof Error?e.message:'写真の比較を完了できませんでした。');}finally{if(request.current===c)setLoading(false);}return;
  }
  try{const current=query.trim()===source.name&&source.placeId?source:await resolve({query:query.trim()},c.signal);setSource(current);known.current.set(current.id,current);
   const r=await fetch('/api/discover',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeId:current.placeId,source:`${current.name} ${current.city}`,preferences,destination}),signal:c.signal});const data=await r.json() as {source?:Place;places?:Place[];error?:string};if(!r.ok||!data.source||!Array.isArray(data.places))throw new Error(data.error||'検索結果を取得できませんでした。');if(c.signal.aborted)return;setSource(data.source);setQuery(data.source.name);setLivePlaces(data.places);[data.source,...data.places].forEach(p=>known.current.set(p.id,p));
  }catch(e){if(!c.signal.aborted)setError(e instanceof Error?e.message:'検索を完了できませんでした。');}finally{if(request.current===c)setLoading(false);}
 };
 const cancelSearch=()=>{request.current?.abort();setLoading(false);setToast('検索を中止しました。');};
 const togglePreference=(q:Quality)=>{setShareUrl('');userChanged.current=true;if(searchKind==='visual'){setLivePlaces([]);setVisualSearch(null);}setPreferences(prev=>prev.includes(q)?prev.length>1?prev.filter(x=>x!==q):prev:[...prev,q]);setActiveId(null);};
 const setDestination=(value:string)=>{setShareUrl('');userChanged.current=true;setDestinationState(value);setActiveId(null);setLivePlaces([]);};
 const setSearchKind=(kind:'atmosphere'|'visual'|'terrain')=>{setShareUrl('');request.current?.abort();setLoading(false);setSearchKindState(kind);setLivePlaces([]);setVisualSearch(null);setError('');};
 const setVisualWeight=(weight:number)=>{setShareUrl('');setVisualWeightState(weight);setLivePlaces([]);setVisualSearch(null);};
 const share=async()=>{
  const url=new URL(window.location.origin+window.location.pathname);url.searchParams.set('method',searchKind);if(searchKind==='visual')url.searchParams.set('weight',String(visualWeight));
  try{if(session.current){const cloud=await import('./firebase-client');url.searchParams.set('share',await cloud.createShare(session.current,{sourcePlaceId:source.placeId||'',sourceSampleId:source.placeId?'':source.id,preferences,destination}));}else{url.searchParams.set(source.placeId?'placeId':'source',source.placeId||source.id);url.searchParams.set('qualities',preferences.join(','));url.searchParams.set('destination',destination);}setShareUrl(url.toString());try{await navigator.clipboard.writeText(url.toString());setToast('検索のリンクをコピーしました。');}catch{window.history.replaceState(null,'',url);setToast('アドレス欄の URL をコピーして共有できます。');}}
  catch{setToast('共有リンクを作れませんでした。接続を確認してお試しください。');}
 };
 const getRoute=async(p:Place)=>{
  if(!navigator.geolocation){setRoute({loading:false,error:'このブラウザーでは現在地を取得できません。Google Maps で行き方を確認できます。'});return;}
  setRoute({loading:true});
  try{const position=await new Promise<GeolocationPosition>((ok,ng)=>navigator.geolocation.getCurrentPosition(ok,ng,{enableHighAccuracy:false,timeout:15000,maximumAge:60000}));const origin={lat:position.coords.latitude,lng:position.coords.longitude};const mode=Math.abs(origin.lat-p.lat)+Math.abs(origin.lng-p.lng)<0.2?'WALK':'DRIVE';const r=await fetch('/api/route',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination:{lat:p.lat,lng:p.lng},mode})});const data=await r.json() as {duration?:string;distanceMeters?:number;error?:string};if(!r.ok)throw new Error(data.error||'経路を確認できませんでした。');const minutes=Math.ceil(parseFloat(data.duration||'0')/60);const distance=(Number(data.distanceMeters||0)/1000).toLocaleString('ja-JP',{maximumFractionDigits:1});setRoute({loading:false,text:`${mode==='WALK'?'徒歩':'車'}で約 ${minutes} 分・${distance} km`});}
  catch(e){setRoute({loading:false,error:e&&typeof e==='object'&&'code' in e?'現在地を取得できませんでした。位置情報の許可を確認してください。':e instanceof Error?e.message:'経路を確認できませんでした。'});}
 };
 return {shareUrl,searchKind,setSearchKind,visualWeight,setVisualWeight,visualSearch,source,query,setQuery,preferences,togglePreference,destination,setDestination,view,setView,layout,setLayout,activeId,setActiveId,modal,setModal,detail,setDetail,toast,error,loading,resolving,mapsKey:config?.mapsKey||'',liveAvailable:Boolean(config?.liveSearch&&config?.places),placesReady:Boolean(config?.places),liveMode,setLiveMode,results,displayed,saved:savedPlaces,isSaved,toggleSaved,savingIds,chooseSource,choosePlaceId,chooseLocation,search,cancelSearch,share,storageStatus,route,getRoute,setRoute,config};
}
