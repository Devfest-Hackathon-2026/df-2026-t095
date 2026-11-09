import type {Place} from './places.ts';
import type {GeoRegion} from './geo-region.ts';
import type {SearchFilters} from './climate-types.ts';
import {moveRegion,regionMetrics} from './geo-region.ts';
import {distinctTerrainPlaces,rankTerrainRegions,validTerrainRecord,type TerrainRecord} from './terrain-ranking.ts';
import {searchTerrain} from './earth-engine.mjs';
import {cachedTerrainRecords} from './terrain-catalog.ts';
import {cachedPublicData} from './public-cache.ts';
import {environmentFilter} from './search-filters.ts';
import {matchesDestination} from './visual-ranking.ts';
import {distanceKm} from './discovery.ts';
import {reverseGeocode} from './google-maps.ts';

export type TerrainSearchArea={lat:number;lng:number;radiusKm:number};
export function parseTerrainSearchArea(value:unknown,source:{lat:number;lng:number}):TerrainSearchArea{
 if(value===undefined)return{lat:source.lat,lng:source.lng,radiusKm:500};
 const r=value as TerrainSearchArea|null;
 if(!r||typeof r!=='object'||![r.lat,r.lng,r.radiusKm].every(n=>typeof n==='number'&&Number.isFinite(n))||Math.abs(r.lat)>80||Math.abs(r.lng)>180||r.radiusKm<150||r.radiusKm>1000)throw new Error('探索範囲の緯度・経度と半径150〜1,000 kmを確認してください。');
 return{lat:r.lat,lng:r.lng,radiusKm:r.radiusKm};
}
const continents:Record<string,string>={};
for(const [continent,codes] of Object.entries({Asia:'AF AM AZ BH BD BT BN KH CN CY GE IN ID IR IQ IL JP JO KZ KW KG LA LB MY MV MN MM NP KP OM PK PS PH QA SA SG KR LK SY TW TJ TH TL TR TM AE UZ VN YE',Europe:'AL AD AT BY BE BA BG HR CZ DK EE FO FI FR DE GI GR GG VA HU IS IE IM IT JE XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SJ SE CH UA GB AX',Africa:'DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RE RW SH ST SN SC SL SO ZA SS SD TZ TG TN UG EH ZM ZW YT',Oceania:'AS AU CK FJ PF GU KI MH FM NR NC NZ NU NF MP PW PG PN WS SB TK TO TV UM VU WF', 'North America':'AI AG AW BS BB BZ BM BQ CA KY CR CU CW DM DO SV GL GD GP GT HT HN JM MQ MX MS NI PA PR BL KN LC MF PM VC SX TT TC US VG VI','South America':'AR BO BR CL CO EC FK GF GY PY PE SR UY VE'}))for(const code of codes.split(' '))continents[code]=continent;
async function locateTerrain(point:Place):Promise<Place>{
 try{const location=await reverseGeocode(point.lat,point.lng);const components=location.address_components||[];const country=components.find(c=>c.types.includes('country'));return{...point,country:country?.long_name||'',countryCode:country?.short_name,continent:continents[country?.short_name||'']||'',address:location.formatted_address,city:components.find(c=>c.types.includes('locality')||c.types.includes('administrative_area_level_1'))?.long_name||''};}catch{return point;}
}
export function shortlistTerrainSamples(source:Place,features:{geometry?:{coordinates?:number[]};properties?:{similarity?:number}}[],area:TerrainSearchArea){
 const points:{lat:number;lng:number}[]=[];
 for(const f of [...features].sort((a,b)=>(b.properties?.similarity??-1)-(a.properties?.similarity??-1))){
  const [lng,lat]=f.geometry?.coordinates||[];const point={lat,lng};
  if(!Number.isFinite(lat)||Math.abs(lat)>80||!Number.isFinite(lng)||Math.abs(lng)>180||!Number.isFinite(f.properties?.similarity)||distanceKm(source,point)<100||distanceKm(area,point)>area.radiusKm||points.some(p=>distanceKm(p,point)<100))continue;
  points.push(point);if(points.length===8)break;
 }return points;
}
type Dependencies={records:typeof cachedTerrainRecords;search:typeof searchTerrain;locate:(point:Place)=>Promise<Place>;filter:typeof environmentFilter};
const defaults:Dependencies={records:cachedTerrainRecords,search:searchTerrain,locate:locateTerrain,filter:environmentFilter};
export async function terrainDiscovery(source:Place,catalog:Place[],stored:TerrainRecord[],kind:string,destination:string,filters:SearchFilters,region:GeoRegion|undefined,area:TerrainSearchArea|undefined,deps:Dependencies=defaults){
 const pool=distinctTerrainPlaces(source,catalog,kind,region).filter(p=>matchesDestination(p,destination));
 const environment=await deps.filter(source,pool,filters);
 const [reference]=await deps.records([{id:source.id,lat:source.lat,lng:source.lng,region}]);
 if(!validTerrainRecord(reference))throw new Error('選んだ範囲に比較できる衛星データがありません。');
 const windowFor=(p:Place)=>region?moveRegion(region,p.lat,p.lng):undefined;
 const keyFor=(p:Place)=>JSON.stringify(windowFor(p)||{radiusMeters:100});
 const records=stored.filter(r=>validTerrainRecord(r)&&environment.places.some(p=>p.id===r.id&&r.regionKey===keyFor(p)));
 const missing=environment.places.filter(p=>!records.some(r=>r.id===p.id&&r.methodVersion===3));
 let catalogNote:string|undefined;
 for(let i=0;i<missing.length;i+=4)try{const batch=missing.slice(i,i+4).map(p=>({id:p.id,lat:p.lat,lng:p.lng,region:windowFor(p)}));const fresh=await deps.records(batch);for(const r of fresh){const index=records.findIndex(old=>old.id===r.id);if(index>=0)records[index]=r;else records.push(r);}}catch{catalogNote='比較元と同じ広さで確認できなかった登録地形は除外しました。';}
 let livePlaces:Place[]=[],liveNote:string|undefined;
 if(area)try{
  const load=async()=>{
   const sampled=await deps.search({lat:source.lat,lng:source.lng,radiusKm:area.radiusKm,referenceRegion:region,searchCenter:area,referenceVector:reference.vector});
   const points=shortlistTerrainSamples(source,sampled.features||[],area);
   const live:TerrainRecord[]=[];
   for(let i=0;i<points.length;i+=4){const batch=points.slice(i,i+4).flatMap(p=>{try{return[{id:`satellite-${p.lat.toFixed(4)}-${p.lng.toFixed(4)}`,...p,region:region?moveRegion(region,p.lat,p.lng):undefined}];}catch{return[];}});if(batch.length)live.push(...await deps.records(batch));}
   return live;
  };
  const live=deps===defaults?await cachedPublicData<TerrainRecord[]>('terrain-search',JSON.stringify({version:4,source:{lat:source.lat,lng:source.lng},region,area}),load,(v):v is TerrainRecord[]=>Array.isArray(v)&&v.length>0&&v.every(validTerrainRecord),86400000):await load();
  for(const r of live){if(!validTerrainRecord(r)||distanceKm(source,r)<100||distanceKm(area,r)>area.radiusKm)continue;const referenceRegion=region?moveRegion(region,r.lat,r.lng):undefined;records.push(r);livePlaces.push({...source,id:r.id,lat:r.lat,lng:r.lng,name:`衛星候補 ${r.lat.toFixed(3)}, ${r.lng.toFixed(3)}`,country:'',city:'',continent:'',climate:undefined,tourism:undefined,landform:undefined,referenceRegion,referenceHalfKm:region?Math.max(regionMetrics(region).widthKm,regionMetrics(region).heightKm)/2:.1,profiled:false});}
  if(filters.lessVisited||destination!=='world')livePlaces=await Promise.all(livePlaces.map(deps.locate));
  livePlaces=(await deps.filter(environment.source,livePlaces,filters)).places.filter(p=>matchesDestination(p,destination));
 }catch{liveNote='指定範囲の衛星探索を完了できなかったため、取得できた登録地形で比較しました。';}
 const liveIds=new Set(livePlaces.map(p=>p.id));
 const candidates=rankTerrainRegions(reference,records,[...environment.places,...livePlaces]).map(p=>({...p,vector:undefined,patches:undefined,origin:liveIds.has(p.id)?'live' as const:'catalog' as const}));
 return{candidates,sourceClimate:environment.source.climate,coverage:reference.coverage,liveCandidateCount:livePlaces.length,registeredCandidateCount:environment.places.length,...(liveNote?{liveNote}:{}),...(catalogNote?{catalogNote}:{})};
}
