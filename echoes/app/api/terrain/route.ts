import {earthEngineStatus,searchTerrain} from '@/lib/earth-engine.mjs';
import {distanceKm} from '@/lib/discovery';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await earthEngineStatus(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({ready:false,error:'Earth Engine の接続を確認できませんでした。'},{status:503});}}
export async function POST(request:Request){try{
 const raw=await request.text();if(raw.length>2048)return Response.json({error:'解析条件が長すぎます。'},{status:413});const b=JSON.parse(raw);
 if(!b||typeof b.lat!=='number'||!Number.isFinite(b.lat)||Math.abs(b.lat)>80||typeof b.lng!=='number'||!Number.isFinite(b.lng)||Math.abs(b.lng)>180||![5,10,20].includes(b.radiusKm)||!['lagoon','mesa','butte'].includes(b.kind))return Response.json({error:'緯度・経度と、5〜20 km の解析範囲を選んでください。レグールの判定は土壌の資料が必要です。'},{status:400});
 const status=await earthEngineStatus();if(!status.ready)return Response.json({error:'Earth Engine の登録を確認できませんでした。Google Cloud で非商用登録を確認してください。',...status},{status:503});
 const rawResult=await searchTerrain(b) as {features?:{geometry?:{coordinates?:number[]};properties?:Record<string,number>}[]};
 const candidates:{lat:number;lng:number;similarity:number;elevation:number;slope:number;relief:number;water:number}[]=[];
 for(const feature of rawResult.features||[]){const c=feature.geometry?.coordinates,p=feature.properties;if(!c||!p||![c[0],c[1],p.similarity,p.elevation,p.slope,p.relief,p.water].every(Number.isFinite))continue;const point={lat:c[1],lng:c[0],similarity:p.similarity,elevation:p.elevation,slope:p.slope,relief:p.relief,water:p.water};if(distanceKm(b,point)<1||candidates.some(x=>distanceKm(x,point)<1))continue;candidates.push(point);if(candidates.length===5)break;}
 return Response.json({candidates,year:2024,radiusKm:b.radiusKm,kind:b.kind,method:'参照地点の周辺100 mの平均衛星埋め込みと、解析範囲から抽出した地点をコサイン類似度で比較しています。',limitation:'周辺を粗く調べる試作です。地形の輪郭や種類を確定するものではありません。標高・傾斜・水域の観測も手がかりに、現地の資料で確認してください。',attribution:'The AlphaEarth Foundations Satellite Embedding dataset is produced by Google and Google DeepMind.',sources:[{title:'Satellite Embedding V1',url:'https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_SATELLITE_EMBEDDING_V1_ANNUAL'},{title:'Copernicus DEM GLO-30',url:'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_DEM_GLO30'},{title:'JRC Global Surface Water',url:'https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_4_GlobalSurfaceWater'}]},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Earth Engine',e instanceof Error?e.message.slice(0,200):'request failed');return Response.json({error:'地形の解析を完了できませんでした。参照地点を陸地や浅い水域に変えるか、範囲を狭めてお試しください。'},{status:502});}}
