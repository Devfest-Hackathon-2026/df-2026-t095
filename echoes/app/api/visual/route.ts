import {applyAtmosphereScenery} from '@/lib/photo-scenery';
import {parseSearchFilters} from '@/lib/climate-types';
import {environmentFilter,lessVisitedCountryNames} from '@/lib/search-filters';
import {googleDiscover} from '@/lib/google';
import {places,type Quality} from '@/lib/places';
import {samePlace} from '@/lib/visual-ranking';
import {isQuality} from '@/lib/discovery';
import {resolveGooglePlace} from '@/lib/google-maps';
import {applyMapsFallback,hydrateVisualResults,visualDiscovery} from '@/lib/visual-discovery';
export const runtime='nodejs';
export async function POST(request:Request){try{
 const raw=await request.text();if(raw.length>8192)return Response.json({error:'検索条件が長すぎます。'},{status:413});const b=JSON.parse(raw);
 if(!b||!Array.isArray(b.preferences)||b.preferences.length<1||b.preferences.length>6||!b.preferences.every(isQuality)||typeof b.destination!=='string'||b.destination.length>100||typeof b.visualWeight!=='number'||!Number.isFinite(b.visualWeight)||b.visualWeight<0||b.visualWeight>1)return Response.json({error:'検索条件を確認してください。'},{status:400});
 let source=places.find(p=>p.id===b.sampleId);if(!source){if(typeof b.placeId!=='string'&&typeof b.source!=='string')return Response.json({error:'出発点を選んでください。'},{status:400});source=await resolveGooglePlace({placeId:typeof b.placeId==='string'?b.placeId:undefined,query:typeof b.source==='string'?b.source.slice(0,200):undefined});}
 const known=places.find(p=>samePlace(source!,p));if(known)source={...source,...known,placeId:source.placeId,googleMapsUri:source.googleMapsUri};
 const filters=parseSearchFilters(b.filters);const result=await visualDiscovery(source,b.preferences as Quality[],b.destination,b.visualWeight,undefined,filters);const fallback=await applyMapsFallback(result,b.preferences as Quality[],b.destination,async(s,p,d)=>{const list=await googleDiscover(s,p,d,{townscape:filters.townscape,seaColor:filters.seaColor,climate:filters.climate==='same'?result.source.climate?.code:filters.climate,countries:filters.lessVisited?await lessVisitedCountryNames():[]});const scenery=await applyAtmosphereScenery(typeof s==='string'?source!:s,list,filters);return(await environmentFilter(scenery.source,scenery.places,filters)).places;});const hydrated=fallback.visualSearch.mode==='visual'?await hydrateVisualResults(fallback):fallback;
 return Response.json(hydrated,{headers:{'Cache-Control':'no-store'}});
 }catch(e){return Response.json({error:e instanceof SyntaxError?'検索条件を読み取れませんでした。':e instanceof Error?e.message:'写真の比較を完了できませんでした。'},{status:e instanceof SyntaxError||e instanceof Error&&/気候|区分|条件/.test(e.message)?400:502});}}
