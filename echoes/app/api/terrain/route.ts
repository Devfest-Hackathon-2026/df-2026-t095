import {earthEngineStatus,terrainRegionRecords} from '@/lib/earth-engine.mjs';
import {climateInRegion} from '@/lib/climate';
import {regionMetrics,validateRegion} from '@/lib/geo-region';
import {terrainCatalog} from '@/lib/terrain-catalog';
import {candidateCatalog} from '@/lib/catalog';
import {distinctTerrainPlaces,rankTerrainRegions,type TerrainRecord} from '@/lib/terrain-ranking';
import {environmentFilter} from '@/lib/search-filters';
import {parseSearchFilters} from '@/lib/climate-types';
import {matchesDestination} from '@/lib/visual-ranking';
import type {Place} from '@/lib/places';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await earthEngineStatus(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({ready:false,error:'Earth Engine の接続を確認できませんでした。'},{status:503});}}
export async function POST(request:Request){try{
 const raw=await request.text();if(raw.length>4096)return Response.json({error:'解析条件が長すぎます。'},{status:413});const b=JSON.parse(raw);
 if(!b||typeof b.lat!=='number'||!Number.isFinite(b.lat)||Math.abs(b.lat)>80||typeof b.lng!=='number'||!Number.isFinite(b.lng)||Math.abs(b.lng)>180||!['archipelago','lagoon','atoll','mesa','butte'].includes(b.kind))return Response.json({error:'比較元の緯度・経度と地形の種類を確認してください。'},{status:400});
 let region;try{region=b.referenceRegion?validateRegion(b.referenceRegion):undefined;}catch(e){return Response.json({error:e instanceof Error?e.message:'範囲を確認してください。'},{status:400});}
 const filters=parseSearchFilters(b.filters);if(b.destination!==undefined&&(typeof b.destination!=='string'||b.destination.length>100))return Response.json({error:'探す地域を確認してください。'},{status:400});
 const position=region?regionMetrics(region):{lat:b.lat,lng:b.lng};
 const source:Place={id:'terrain-reference',name:'比較元の範囲',city:'',country:'',continent:'',lat:position.lat,lng:position.lng,image:'',description:'',detail:'',difference:'',bestFor:'',features:{water:0,green:0,quiet:0,walk:0,cafes:0,history:0},sources:[]};
 if(region)source.climate=await climateInRegion(region);
 const [collection,stored]=await Promise.all([candidateCatalog(),terrainCatalog()]);
 const pool=distinctTerrainPlaces(source,collection.places,b.kind,region).filter(p=>matchesDestination(p,b.destination||'world'));
 const environment=await environmentFilter(source,pool,filters);
 if(!environment.places.length)return Response.json({candidates:[],year:2024,coverage:null,method:'指定した条件に合う、100 km以上離れた登録地形がありません。',limitation:'地域・気候・国の条件を外すか、別の地形を選んでください。',attribution:'The AlphaEarth Foundations Satellite Embedding dataset is produced by Google and Google DeepMind.',sources:[],catalog:stored.provider},{headers:{'Cache-Control':'no-store'}});
 if(!stored.records.length)return Response.json({error:'別の地形の比較データを準備できていません。サーバーで地形カタログを更新してください。'},{status:503});
 const [reference]=await terrainRegionRecords([{id:source.id,lat:source.lat,lng:source.lng,region}]) as TerrainRecord[];
 if(!reference||!reference.coverage)return Response.json({error:'選んだ範囲に比較できる衛星データがありません。島・沿岸・陸地を含む範囲を選んでください。'},{status:422});
 const candidates=rankTerrainRegions(reference,stored.records,environment.places);
 return Response.json({candidates,sourceClimate:environment.source.climate,coverage:reference.coverage,year:2024,catalog:stored.provider,referenceRegion:region||null,method:'参照範囲から100 km以上離れた、名前のある別の地形と領域同士で比較しています。登録された候補の中で衛星特徴の近い順に表示します。',limitation:'地形の種類は参照用に登録した区分です。衛星データが形の一致や同じ体験を保証するものではありません。全世界の未登録地形を網羅して検索する機能ではありません。',attribution:'The AlphaEarth Foundations Satellite Embedding dataset is produced by Google and Google DeepMind.',sources:[{title:'Satellite Embedding V1',url:'https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_SATELLITE_EMBEDDING_V1_ANNUAL'},{title:'Copernicus DEM GLO-30',url:'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_DEM_GLO30'},{title:'JRC Global Surface Water',url:'https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_4_GlobalSurfaceWater'}]},{headers:{'Cache-Control':'no-store'}});
 }catch(e){const message=e instanceof Error?e.message:'';return Response.json({error:/気候|条件|区分/.test(message)?message:'地形の解析を完了できませんでした。参照範囲を変えてお試しください。'},{status:e instanceof SyntaxError||/気候|条件|区分/.test(message)?400:502});}}
