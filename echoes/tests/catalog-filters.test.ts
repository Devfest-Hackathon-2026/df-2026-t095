import {test} from 'node:test';
import assert from 'node:assert/strict';
import {places} from '../lib/places.ts';
import {distinctTerrainPlaces,rankTerrainRegions,type TerrainRecord} from '../lib/terrain-ranking.ts';
import {environmentFilter} from '../lib/search-filters.ts';
import {parseSearchFilters} from '../lib/climate-types.ts';
import {visionOverlap} from '../lib/vision.ts';
import {evidenceScore} from '../lib/visual-ranking.ts';
const point=places[0];
const climate=(code:string)=>({code,label:code,period:'1991–2020',source:'https://doi.org/10.6084/m9.figshare.21789074',nearby:false});
test('same-climate filtering is exact and unknown climate never silently broadens results',async()=>{
 const source={...point,climate:climate('Cfa')};const a={...point,id:'a',climate:climate('Cfa')},b={...point,id:'b',climate:climate('Cfb')},c={...point,id:'c',climate:null};
 assert.deepEqual((await environmentFilter(source,[a,b,c],{climate:'same',lessVisited:false})).places.map(p=>p.id),['a']);
 assert.deepEqual((await environmentFilter(source,[a,b,c],{climate:'Cfb',lessVisited:false})).places.map(p=>p.id),['b']);
 await assert.rejects(()=>environmentFilter({...point,locationUnknown:true},[a],{climate:'same',lessVisited:false}),/気候区分/);
});
test('less-visited filter uses dated arrivals, excludes missing data and keeps climate constraints',async()=>{
 const source={...point,climate:climate('Af')};const samoa={...point,id:'samoa',country:'サモア',countryCode:'WS',climate:climate('Af')},japan={...point,id:'japan',countryCode:'JP',climate:climate('Af')},unknown={...point,id:'unknown',country:'不明',countryCode:'ZZ',climate:climate('Af')};
 const result=await environmentFilter(source,[samoa,japan,unknown],{climate:'same',lessVisited:true});assert.deepEqual(result.places.map(p=>p.id),['samoa']);assert.equal(result.places[0].tourism?.year,2019);assert.equal(result.places[0].tourism?.arrivals,181000);
});
test('invalid climate and country filters are rejected',()=>{for(const invalid of ['same',{climate:'Cff',lessVisited:false},{climate:'any',lessVisited:'true'}])assert.throws(()=>parseSearchFilters(invalid));assert.deepEqual(parseSearchFilters(undefined),{climate:'any',lessVisited:false});});
test('terrain candidates exclude the source region and all nearby points even when IDs differ',()=>{
 const source={lat:-15,lng:-148.16};const pool=[{...point,id:'same',...source,landform:'atoll'},{...point,id:'near',lat:-15.02,lng:-148.17,landform:'atoll'},{...point,id:'far',lat:-9.4,lng:46.35,landform:'atoll'},{...point,id:'wrong-kind',lat:30,lng:30,landform:'mesa'}];
 assert.deepEqual(distinctTerrainPlaces(source,pool,'atoll',{north:-14.8,south:-15.2,east:-148,west:-148.3}).map(p=>p.id),['far']);
});
test('terrain ranking compares region vectors, preserves named destinations, and deduplicates neighbours',()=>{
 const vector=[1,...Array(63).fill(0)];const record=(id:string,lat:number,lng:number):TerrainRecord=>({id,lat,lng,vector,coverage:1,elevation:null,slope:null,relief:null,water:100});const a=record('a',-9.4,46.35),b=record('b',-9.401,46.351),c=record('c',-8.5,179.2);const pool=[a,b,c].map(p=>({...point,...p,name:p.id,country:p.id,landform:'atoll'}));
 const result=rankTerrainRegions(record('source',-15,-148.16),[a,b,c],pool);assert.deepEqual(result.map(p=>p.id),['a','c']);assert.ok(result.every(p=>p.distanceKm>=100));assert.equal(result[0].elevation,null);
});
test('generic green, sky and water labels do not manufacture visual agreement',()=>{
 const evidence=(names:string[])=>({labels:names.map(name=>({name,score:.9})),landmarks:[]});assert.equal(visionOverlap(evidence(['Water','Tree','Sky']),evidence(['Water','Tree','Sky'])),null);
 assert.ok(visionOverlap(evidence(['River','Canal']),evidence(['River','Canal']))!>visionOverlap(evidence(['River','Canal']),evidence(['Mountain','Forest']))!);
});
test('photo structure evidence reranks candidates and missing optional signals remain comparable',()=>{
 const river=evidenceScore(.7,.8,.8,.8,'strong'),unrelated=evidenceScore(.9,.8,.8,.1,'weak');assert.ok(river>unrelated);assert.equal(evidenceScore(.6,.2,1,null,undefined),.8);assert.equal(evidenceScore(.8,.7,0,.3,'weak'),.7);
});
