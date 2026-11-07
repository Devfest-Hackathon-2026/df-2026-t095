import {type Place,type Quality} from './places.ts';
import {safeUrl} from './discovery.ts';
export type GooglePlace={id:string;displayName?:{text:string};formattedAddress?:string;location?:{latitude:number;longitude:number};addressComponents?:{longText:string;shortText:string;types:string[]}[];googleMapsUri?:string;websiteUri?:string;photos?:{name:string;authorAttributions?:{displayName:string;uri:string}[]}[];editorialSummary?:{text:string};primaryType?:string;rating?:number;};
const fields='id,displayName,formattedAddress,location,addressComponents,googleMapsUri,photos,primaryType,websiteUri';
const serverKey=()=>process.env.GOOGLE_MAPS_SERVER_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
export function hasPlaces(){return Boolean(serverKey());}
async function mapsJson<T>(path:string,body?:object,fieldMask?:string):Promise<T>{
 const key=serverKey();if(!key)throw new Error('場所の検索がまだ設定されていません。Google Maps のサーバーキーを確認してください。');
 const r=await fetch(`https://places.googleapis.com/v1/${path}`,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,...(fieldMask?{'X-Goog-FieldMask':fieldMask}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000),cache:'no-store'});
 if(!r.ok){console.error('Places API',r.status);throw new Error(r.status===429?'場所の検索が混み合っています。少し待ってからお試しください。':'場所の情報を取得できませんでした。地名を詳しくして、もう一度お試しください。');}
 return await r.json() as T;
}
export async function autocomplete(query:string,sessionToken?:string){
 const r=await mapsJson<{suggestions?:{placePrediction?:{placeId:string;text?:{text:string};structuredFormat?:{mainText?:{text:string};secondaryText?:{text:string}}}}[]}>('places:autocomplete',{input:query,languageCode:'ja',...(sessionToken?{sessionToken}: {})});
 return (r.suggestions||[]).flatMap(x=>x.placePrediction?[{placeId:x.placePrediction.placeId,name:x.placePrediction.structuredFormat?.mainText?.text || x.placePrediction.text?.text || '',address:x.placePrediction.structuredFormat?.secondaryText?.text || ''}]:[]).slice(0,6);
}
export async function textSearch(query:string,location?:{lat:number;lng:number},limit=4){
 const r=await mapsJson<{places?:GooglePlace[]}>('places:searchText',{textQuery:query,languageCode:'ja',pageSize:limit,...(location?{locationBias:{circle:{center:{latitude:location.lat,longitude:location.lng},radius:1500}}}:{})},fields.split(',').map(f=>`places.${f}`).join(','));
 return r.places||[];
}
export async function placeDetails(placeId:string,sessionToken?:string){
 if(!/^[A-Za-z0-9_-]{5,256}$/.test(placeId))throw new Error('場所を選び直してください。');
 return mapsJson<GooglePlace>(`places/${encodeURIComponent(placeId)}?languageCode=ja${sessionToken?`&sessionToken=${encodeURIComponent(sessionToken)}`:''}`,undefined,fields);
}
export async function reverseGeocode(lat:number,lng:number){
 const key=serverKey();if(!key)throw new Error('地図からの場所検索がまだ設定されていません。');
 const u=new URL('https://maps.googleapis.com/maps/api/geocode/json');u.searchParams.set('latlng',`${lat},${lng}`);u.searchParams.set('language','ja');u.searchParams.set('key',key);
 const r=await fetch(u,{signal:AbortSignal.timeout(15000),cache:'no-store'});const data=await r.json() as {status:string;results?:{place_id:string;formatted_address:string}[]};
 if(data.status!=='OK'||!data.results?.length)throw new Error('この地点の情報が見つかりません。近くの公園や街の中を選んでみてください。');
 return data.results[0];
}
export function toPlace(p:GooglePlace,profile?:Partial<Place>):Place{
 if(!p.location||!p.id)throw new Error('場所の位置情報を確認できませんでした。');
 const components=p.addressComponents||[];
 const city=components.find(c=>c.types.includes('locality'))?.longText || components.find(c=>c.types.includes('administrative_area_level_1'))?.longText || '';
 const country=components.find(c=>c.types.includes('country'))?.longText || '';
 const photos=p.photos?.[0];
 return {...profile,id:`google-${p.id}`,placeId:p.id,name:p.displayName?.text || profile?.name || p.formattedAddress || '地図で選んだ場所',city,country,continent:profile?.continent || '',lat:p.location.latitude,lng:p.location.longitude,
 image:photos?`/api/photo?name=${encodeURIComponent(photos.name)}`:'',photoAuthors:photos?.authorAttributions?.flatMap(a=>safeUrl(a.uri)?[{name:a.displayName,url:a.uri}]:[])||[],
 googleMapsUri:safeUrl(p.googleMapsUri)||undefined,websiteUri:safeUrl(p.websiteUri)||undefined,address:p.formattedAddress||'',
 description:profile?.description||p.formattedAddress||'Google Maps で確認できる場所です。',detail:profile?.detail||'詳しい情報や行き方は Google Maps で確認できます。',difference:profile?.difference||'',bestFor:profile?.bestFor||'',
 features:profile?.features||{water:0,green:0,quiet:0,walk:0,cafes:0,history:0},profiled:Boolean(profile?.features),
 sources:[...(profile?.sources||[]),...(p.googleMapsUri?[{title:p.displayName?.text||'Google Maps',url:p.googleMapsUri}]:[])].filter((s,i,a)=>a.findIndex(x=>x.url===s.url)===i),
 };
}
export async function resolveGooglePlace(input:{query?:string;placeId?:string;location?:{lat:number;lng:number};sessionToken?:string}){
 if(input.placeId)return toPlace(await placeDetails(input.placeId,input.sessionToken));
 if(input.location){const r=await reverseGeocode(input.location.lat,input.location.lng);try{return toPlace(await placeDetails(r.place_id));}catch{const nearby=await textSearch(r.formatted_address,input.location,1);if(nearby[0])return toPlace(nearby[0]);throw new Error('近くの公園や施設を選んでみてください。');}}
 const matches=await textSearch(input.query||'',undefined,1);if(!matches[0])throw new Error('場所が見つかりません。市区町村の名前も入れてみてください。');return toPlace(matches[0]);
}
export async function photoUrl(name:string){
 if(!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(name)||name.length>2500)throw new Error('写真の指定を確認できません。');
 const r=await fetch(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=960&skipHttpRedirect=true`,{headers:{'X-Goog-Api-Key':serverKey()},signal:AbortSignal.timeout(15000),cache:'no-store'});
 const body=await r.json() as {photoUri?:string};const url=safeUrl(body.photoUri);if(!r.ok||!url)throw new Error('写真を表示できませんでした。');
 const host=new URL(url).hostname;if(!host.endsWith('.googleusercontent.com')&&!host.endsWith('.google.com'))throw new Error('写真の配信元を確認できません。');return url;
}
export async function computeRoute(origin:{lat:number;lng:number},destination:{lat:number;lng:number},mode:'WALK'|'DRIVE'){
 const r=await fetch('https://routes.googleapis.com/directions/v2:computeRoutes',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':serverKey(),'X-Goog-FieldMask':'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline'},body:JSON.stringify({origin:{location:{latLng:{latitude:origin.lat,longitude:origin.lng}}},destination:{location:{latLng:{latitude:destination.lat,longitude:destination.lng}}},travelMode:mode,languageCode:'ja',units:'METRIC'}),signal:AbortSignal.timeout(20000)});
 const data=await r.json() as {routes?:{distanceMeters:number;duration:string;polyline?:{encodedPolyline:string}}[]};
 if(!r.ok||!data.routes?.[0])throw new Error('この区間の経路は見つかりませんでした。Google Maps で別の移動方法を確認できます。');
 return data.routes[0];
}
