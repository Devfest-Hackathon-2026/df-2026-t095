import {defaultSearchFilters,parseSearchFilters,type SearchFilters} from './climate-types.ts';
export function filtersFromParams(params:URLSearchParams):SearchFilters {
 return parseSearchFilters({climate:params.get('climate')||'any',lessVisited:params.get('lessVisited')==='true',population:params.get('population')||'any',waterQuality:params.get('waterQuality')==='true',lowHomicide:params.get('lowHomicide')==='true',unknownData:params.get('unknownData')||'include'});
}
export function filtersToParams(params:URLSearchParams,filters:SearchFilters){
 for(const [key,value] of Object.entries({...defaultSearchFilters,...filters}))params.set(key,String(value));
 return params;
}
