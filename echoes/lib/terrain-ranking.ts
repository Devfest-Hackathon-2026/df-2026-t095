import type {Place} from './places.ts';
import type {GeoRegion} from './geo-region.ts';
import {distanceKm} from './discovery.ts';
import {cosineSimilarity} from './visual-ranking.ts';
export type TerrainRecord={id:string;lat:number;lng:number;vector:number[];patches?:(number[]|null)[];regionKey?:string;methodVersion?:number;coverage:number;elevation:number|null;slope:number|null;relief:number|null;water:number|null};
export function validTerrainRecord(value:unknown):value is TerrainRecord{const r=value as TerrainRecord|undefined;return Boolean(r&&typeof r.id==='string'&&Number.isFinite(r.lat)&&Math.abs(r.lat)<=80&&Number.isFinite(r.lng)&&Math.abs(r.lng)<=180&&Array.isArray(r.vector)&&r.vector.length===64&&r.vector.every(Number.isFinite)&&r.vector.some(v=>v!==0)&&Number.isFinite(r.coverage)&&r.coverage>0&&r.coverage<=1);}
export function terrainSimilarity(a:TerrainRecord,b:TerrainRecord){
 const base=cosineSimilarity(a.vector,b.vector);let value=base,weight=1;
 if(a.patches?.length===9&&b.patches?.length===9){
  const arrangements:number[]=[];
  // Compare the same layout under four rotations and their reflections.
  for(let flip=0;flip<2;flip++)for(let rotation=0;rotation<4;rotation++){
   const signals:number[]=[];for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    let y=row,x=flip?2-col:col;for(let i=0;i<rotation;i++){const next=x;x=2-y;y=next;}
    const p=a.patches[row*3+col],q=b.patches[y*3+x];if(p?.length===64&&q?.length===64&&p.every(Number.isFinite)&&q.every(Number.isFinite)&&p.some(v=>v!==0)&&q.some(v=>v!==0))signals.push(cosineSimilarity(p,q));
   }if(signals.length>=5)arrangements.push(signals.reduce((sum,n)=>sum+n,0)/signals.length);
  }
  if(arrangements.length){value+=.3*Math.max(...arrangements);weight+=.3;}
 }
 const physical: number[]=[];
 for(const [key,scale] of [['water',100],['elevation',1500],['slope',30],['relief',1000]] as const){const x=a[key],y=b[key];if(typeof x==='number'&&Number.isFinite(x)&&typeof y==='number'&&Number.isFinite(y))physical.push(1-2*Math.min(1,Math.abs(x-y)/scale));}
 if(physical.length){value+=.15*physical.reduce((sum,n)=>sum+n,0)/physical.length;weight+=.15;}
 return value/weight;
}
export function distinctTerrainPlaces(source:{lat:number;lng:number},pool:Place[],kind:string,region?:GeoRegion){
 return pool.filter(p=>p.landform===kind&&distanceKm(source,p)>=100&&!(region&&p.lat>=region.south&&p.lat<=region.north&&p.lng>=region.west&&p.lng<=region.east));
}
export function rankTerrainRegions(reference:TerrainRecord,candidates:TerrainRecord[],pool:Place[]){
 const named=new Map(pool.map(p=>[p.id,p]));const ranked=candidates.filter(p=>validTerrainRecord(p)&&named.has(p.id)&&distanceKm(reference,p)>=100).map(p=>({...p,name:named.get(p.id)!.name,country:named.get(p.id)!.country,referenceHalfKm:named.get(p.id)!.referenceHalfKm,climate:named.get(p.id)!.climate,tourism:named.get(p.id)!.tourism,similarity:terrainSimilarity(reference,p),distanceKm:distanceKm(reference,p)})).sort((a,b)=>b.similarity-a.similarity||a.id.localeCompare(b.id));
 const result:typeof ranked=[];for(const p of ranked){if(result.some(x=>distanceKm(x,p)<100))continue;result.push(p);if(result.length===5)break;}return result;
}
