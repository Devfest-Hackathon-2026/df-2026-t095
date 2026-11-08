import {parseSearchFilters} from '@/lib/climate-types';
import {enrichPlaceEnvironment,environmentFilter,lessVisitedCountryNames} from '@/lib/search-filters';
import {googleDiscover,profilePlace} from '@/lib/google';
import {isQuality} from '@/lib/discovery';
import {resolveGooglePlace} from '@/lib/google-maps';
import {hasGoogleAI} from '@/lib/google-auth';
import {translatePlacesIfNeeded} from '@/lib/google-translate';
export async function POST(request:Request){
 if(!hasGoogleAI())return Response.json({error:'Google の AI 接続がまだ設定されていません。'},{status:503});
 try{
  const raw=await request.text();if(raw.length>8192)return Response.json({error:'検索条件を短くしてください。'},{status:413});
  const body=JSON.parse(raw);
  if(!body||!Array.isArray(body.preferences)||body.preferences.length<1||body.preferences.length>6||!body.preferences.every(isQuality)||typeof body.destination!=='string'||body.destination.length>100)return Response.json({error:'出発点と探す地域、残したい特徴を選んでください。'},{status:400});
  if(typeof body.placeId!=='string'&&typeof body.source!=='string')return Response.json({error:'出発点を選んでください。'},{status:400});
  const resolved=await resolveGooglePlace({placeId:typeof body.placeId==='string'?body.placeId:undefined,query:typeof body.source==='string'?body.source.slice(0,200):undefined});
  const filters=parseSearchFilters(body.filters);const enriched=await enrichPlaceEnvironment(resolved);if(filters.climate==='same'&&!enriched.climate)throw new Error('出発点の気候区分を確認できません。条件を外すか、直接選んでください。');
  const [source,candidates]=await Promise.all([profilePlace(resolved),googleDiscover(resolved,[...new Set(body.preferences)] as typeof body.preferences,body.destination,{climate:filters.climate==='same'?enriched.climate?.code:filters.climate,countries:filters.lessVisited?await lessVisitedCountryNames():[]})]);
  const filtered=await environmentFilter(source,candidates,filters);
  const translated=await translatePlacesIfNeeded([filtered.source,...filtered.places]);
  return Response.json({source:translated[0],places:translated.slice(1),mode:'live',note:'Google Maps の情報をもとに、AI が共通点と違いを整理しています。'},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return Response.json({error:e instanceof SyntaxError?'検索結果を読み取れませんでした。もう一度お試しください。':e instanceof Error?e.message:'検索を完了できませんでした。'},{status:e instanceof SyntaxError||e instanceof Error&&/気候|区分|条件/.test(e.message)?400:502});}
}
