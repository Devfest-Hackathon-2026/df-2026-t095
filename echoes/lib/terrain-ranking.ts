import type {Place} from './places.ts';
import type {GeoRegion} from './geo-region.ts';
import {distanceKm} from './discovery.ts';
import {cosineSimilarity} from './visual-ranking.ts';
export type TerrainRecord={id:string;lat:number;lng:number;vector:number[];coverage:number;elevation:number|null;slope:number|null;relief:number|null;water:number|null};
export function distinctTerrainPlaces(source:{lat:number;lng:number},pool:Place[],kind:string,region?:GeoRegion){
 return pool.filter(p=>p.landform===kind&&distanceKm(source,p)>=100&&!(region&&p.lat>=region.south&&p.lat<=region.north&&p.lng>=region.west&&p.lng<=region.east));
}
export function rankTerrainRegions(reference:TerrainRecord,candidates:TerrainRecord[],pool:Place[]){
 const named=new Map(pool.map(p=>[p.id,p]));const ranked=candidates.filter(p=>p.vector.length===64&&p.coverage>0&&named.has(p.id)).map(p=>({...p,name:named.get(p.id)!.name,country:named.get(p.id)!.country,climate:named.get(p.id)!.climate,tourism:named.get(p.id)!.tourism,similarity:cosineSimilarity(reference.vector,p.vector),distanceKm:distanceKm(reference,p)})).sort((a,b)=>b.similarity-a.similarity);
 const result:typeof ranked=[];for(const p of ranked){if(result.some(x=>distanceKm(x,p)<100))continue;result.push(p);if(result.length===5)break;}return result;
}
