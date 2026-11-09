import {earthEngineStatus} from '@/lib/earth-engine.mjs';
import {climateInRegion} from '@/lib/climate';
import {regionMetrics,validateRegion} from '@/lib/geo-region';
import {terrainCatalog} from '@/lib/terrain-catalog';
import {candidateCatalog} from '@/lib/catalog';
import {parseSearchFilters} from '@/lib/climate-types';
import {parseTerrainSearchArea,terrainDiscovery} from '@/lib/terrain-discovery';
import type {Place} from '@/lib/places';
import {searchPolicy} from '@/lib/search-policy';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await earthEngineStatus(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({ready:false,error:'Earth Engine の接続を確認できませんでした。'},{status:503});}}
export async function POST(request:Request){try{
 const raw=await request.text();if(raw.length>4096)return Response.json({error:'解析条件が長すぎます。'},{status:413});const b=JSON.parse(raw);
 if(!b||typeof b.lat!=='number'||!Number.isFinite(b.lat)||Math.abs(b.lat)>80||typeof b.lng!=='number'||!Number.isFinite(b.lng)||Math.abs(b.lng)>180||!['archipelago','lagoon','atoll','mesa','butte'].includes(b.kind))return Response.json({error:'比較元の緯度・経度と地形の種類を確認してください。'},{status:400});
 let region;try{region=b.referenceRegion?validateRegion(b.referenceRegion):undefined;}catch(e){return Response.json({error:e instanceof Error?e.message:'範囲を確認してください。'},{status:400});}
 const filters=parseSearchFilters(b.filters);if(filters.seaColor&&filters.seaColor!=='any'||filters.townscape&&filters.townscape!=='any')return Response.json({error:'海の色と街の雰囲気は写真・雰囲気検索の条件です。地形検索では条件を外してください。'},{status:400});if(b.destination!==undefined&&(typeof b.destination!=='string'||b.destination.length>100)||b.searchMode!==undefined&&!['hybrid','catalog'].includes(b.searchMode))return Response.json({error:'探索の条件を確認してください。'},{status:400});
 const position=region?regionMetrics(region):{lat:b.lat,lng:b.lng};let area;
 const policy=searchPolicy();
 try{const requested=b.searchMode==='catalog'?undefined:parseTerrainSearchArea(b.searchArea,position);area=policy.liveDiscovery?requested:undefined;}catch(e){return Response.json({error:e instanceof Error?e.message:'探索範囲を確認してください。'},{status:400});}
 const source:Place={id:'terrain-reference',name:'比較元の範囲',city:'',country:'',continent:'',lat:position.lat,lng:position.lng,image:'',description:'',detail:'',difference:'',bestFor:'',features:{water:0,green:0,quiet:0,walk:0,cafes:0,history:0},sources:[]};
 if(region)source.climate=await climateInRegion(region);
 const [collection,stored]=await Promise.all([candidateCatalog(),terrainCatalog()]);
 const result=await terrainDiscovery(source,collection.places,stored.records,b.kind,b.destination||'world',filters,region,area);
 return Response.json({...result,...(policy.saveCosts?{liveNote:'節約モードのため、登録地形だけを比較しています。'}:{}),year:2024,catalog:stored.provider,referenceRegion:region||null,searchArea:area||null,method:area&&!result.liveNote&&result.liveCandidateCount?`登録地形と、緯度${area.lat.toFixed(2)}・経度${area.lng.toFixed(2)}を中心とする半径${area.radiusKm} kmの衛星候補を比較しました。比較元から100 km以内を除外し、領域の平均特徴・3×3の配置・標高や水域を比べます。`:'比較元から100 km以上離れた登録地形を、領域の平均特徴・3×3の配置・標高や水域で比較しました。',limitation:'衛星候補は未分類です。選んだ地形の種類や輪郭の一致を保証しません。指定範囲内で標本を取り、候補の周辺領域を再比較しています。全世界や指定範囲の全地点を網羅する検索ではありません。',attribution:'The AlphaEarth Foundations Satellite Embedding dataset is produced by Google and Google DeepMind.',sources:[{title:'Satellite Embedding V1',url:'https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_SATELLITE_EMBEDDING_V1_ANNUAL'},{title:'Copernicus DEM GLO-30',url:'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_DEM_GLO30'},{title:'JRC Global Surface Water',url:'https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_4_GlobalSurfaceWater'}]},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Terrain comparison failed',e instanceof Error?e.message.slice(0,180):'request error');const message=e instanceof Error?e.message:'';return Response.json({error:/気候|条件|区分|衛星データがありません/.test(message)?message:'地形の解析を完了できませんでした。参照範囲を変えてお試しください。'},{status:e instanceof SyntaxError||/気候|条件|区分/.test(message)?400:/衛星データがありません/.test(message)?422:502});}}
