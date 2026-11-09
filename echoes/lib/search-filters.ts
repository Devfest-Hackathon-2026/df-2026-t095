import {enrichPlaceFactors,matchPlaceFactors} from './place-factors.ts';
import {compareFactorEvidence} from './factor-types.ts';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Place} from './places.ts';
import {climateAt,climateInRegion} from './climate.ts';
import {regionAround} from './geo-region.ts';
import type {SearchFilters} from './climate-types.ts';
type Tourism={iso2:string;iso3:string;name:string;arrivals:number;year:number};
let tourism:Promise<{countries:Tourism[];source:string}>|undefined;
export const tourismData=():Promise<{countries:Tourism[];source:string}>=>tourism||(tourism=readFile(resolve(process.cwd(),'data/tourism.json'),'utf8').then(text=>JSON.parse(text) as {countries:Tourism[];source:string}));
export async function enrichPlaceEnvironment(place:Place):Promise<Place>{
 const [climate,data]=await Promise.all([place.locationUnknown?Promise.resolve(null):place.climate!==undefined?Promise.resolve(place.climate):place.referenceRegion?climateInRegion(place.referenceRegion):place.landform&&place.referenceHalfKm?climateInRegion(regionAround(place.lat,place.lng,place.referenceHalfKm)):climateAt(place.lat,place.lng),tourismData()]);
 const display=new Intl.DisplayNames(['ja'],{type:'region'});const country=data.countries.find(c=>c.iso2===place.countryCode||display.of(c.iso2)===place.country||c.name.toLowerCase()===place.country.toLowerCase());
 return enrichPlaceFactors({...place,climate,tourism:country?{arrivals:country.arrivals,year:country.year,source:data.source}:null});
}
export async function environmentFilter(source:Place,candidates:Place[],filters:SearchFilters):Promise<{source:Place;places:Place[];filters:SearchFilters}>{
 const enriched=await enrichPlaceEnvironment(source);if(filters.climate==='same'&&!enriched.climate)throw new Error('比較元の気候区分を確認できません。気候区分を直接選ぶか、条件を外してください。');
 const code=filters.climate==='same'?enriched.climate!.code:filters.climate;
 const pool=await Promise.all(candidates.map(enrichPlaceEnvironment));
 const eligible=pool.filter(p=>(code==='any'||p.climate?.code===code)&&(!filters.lessVisited||(typeof p.tourism?.arrivals==='number'&&p.tourism.arrivals<1000000))).flatMap(p=>{const factorMatch=matchPlaceFactors(p,filters);return factorMatch?[{...p,factorMatch}]:[];});
 return{source:enriched,places:eligible.sort(compareFactorEvidence),filters};
}
export async function lessVisitedCountryNames(){const data=await tourismData();const display=new Intl.DisplayNames(['ja'],{type:'region'});return data.countries.filter(c=>c.arrivals<1000000).map(c=>display.of(c.iso2)||c.name);}
