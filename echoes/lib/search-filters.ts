import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Place} from './places.ts';
import {climateAt} from './climate.ts';
import type {SearchFilters} from './climate-types.ts';
type Tourism={iso2:string;iso3:string;name:string;arrivals:number;year:number};
let tourism:Promise<{countries:Tourism[];source:string}>|undefined;
export const tourismData=():Promise<{countries:Tourism[];source:string}>=>tourism||(tourism=readFile(resolve(process.cwd(),'data/tourism.json'),'utf8').then(JSON.parse));
export async function enrichPlaceEnvironment(place:Place):Promise<Place>{
 const [climate,data]=await Promise.all([place.locationUnknown?Promise.resolve(null):climateAt(place.lat,place.lng),tourismData()]);
 const display=new Intl.DisplayNames(['ja'],{type:'region'});const country=data.countries.find(c=>c.iso2===place.countryCode||display.of(c.iso2)===place.country||c.name.toLowerCase()===place.country.toLowerCase());
 return{...place,climate,tourism:country?{arrivals:country.arrivals,year:country.year,source:data.source}:null};
}
export async function environmentFilter(source:Place,candidates:Place[],filters:SearchFilters){
 const enriched=await enrichPlaceEnvironment(source);if(filters.climate==='same'&&!enriched.climate)throw new Error('出発点の気候区分を確認できません。気候区分を直接選ぶか、条件を外してください。');
 const code=filters.climate==='same'?enriched.climate!.code:filters.climate;
 const pool=await Promise.all(candidates.map(enrichPlaceEnvironment));
 return{source:enriched,places:pool.filter(p=>(code==='any'||p.climate?.code===code)&&(!filters.lessVisited||(typeof p.tourism?.arrivals==='number'&&p.tourism.arrivals<1000000))),filters};
}
export async function lessVisitedCountryNames(){const data=await tourismData();const display=new Intl.DisplayNames(['ja'],{type:'region'});return data.countries.filter(c=>c.arrivals<1000000).map(c=>display.of(c.iso2)||c.name);}
