import {test} from 'node:test';
import assert from 'node:assert/strict';
import {places} from '../lib/places.ts';
import {visualDiscovery,uploadedVisualDiscovery} from '../lib/visual-discovery.ts';
import {samplePhoto} from '../lib/commons.ts';
import {matchesDestination} from '../lib/visual-ranking.ts';
import {mergePlaceCatalog,localCatalog} from '../lib/catalog.ts';
const source=places[0],seoul=places.find(p=>p.id==='seoul')!,munich=places.find(p=>p.id==='munich')!;
const collection=async()=>({places:[],provider:'local' as const});
const climate=(code:string)=>({code,label:code,period:'1991–2020',source:'test',nearby:false});

test('named photo search can compare a live candidate outside an empty prepared collection',async()=>{
 const result=await visualDiscovery(source,['water'],'Seoul',1,{collection,discover:async()=>[source,{...seoul,image:''},munich,seoul],photo:samplePhoto,embed:async()=>[1,0]});
 assert.equal(result.visualSearch.mode,'visual');assert.equal(result.visualSearch.discoveredCount,1);assert.equal(result.visualSearch.comparedCount,1);assert.deepEqual(result.places.map(p=>p.id),['seoul']);assert.ok(result.places[0].commonsPhoto?.verified);
});
test('live photo candidates keep exact climate constraints and cannot reuse the source photo',async()=>{
 const result=await visualDiscovery({...source,climate:climate('Cfa')},['water'],'world',1,{collection,discover:async()=>[{...seoul,climate:climate('Cfb')},{...munich,climate:climate('Cfa')}],photo:async()=>await samplePhoto(source),embed:async()=>[1,0]}, {climate:'same',lessVisited:false});
 assert.equal(result.visualSearch.discoveredCount,1);assert.equal(result.visualSearch.comparedCount,0);assert.equal(result.visualSearch.mode,'fallback');
});
test('upload can discover new places without identifying or saving its reference location',async()=>{
 const bytes=Buffer.from('sanitized upload');let received=false;
 const result=await uploadedVisualDiscovery(bytes,['water'],'Seoul',1,{collection,discover:async(p,_q,_d,_f,image)=>{assert.equal(p.locationUnknown,true);assert.deepEqual(image.data,bytes);received=true;return[{...seoul,image:''},munich];},embed:async()=>[1,0],photo:samplePhoto,candidateEmbed:async()=>[1,0],explain:async()=>{throw new Error('optional');}});
 assert.ok(received);assert.equal(result.source.locationUnknown,true);assert.equal(result.source.placeId,undefined);assert.equal(result.visualSearch.discoveredCount,1);assert.deepEqual(result.places.map(p=>p.id),['seoul']);
});
test('live discovery failure preserves prepared photo comparison and reports its smaller scope',async()=>{
 const result=await visualDiscovery(source,['water'],'Seoul',1,{collection:async()=>({places:[seoul],provider:'local'}),discover:async()=>{throw new Error('rate limited');},photo:samplePhoto,embed:async()=>[1,0]});
 assert.equal(result.visualSearch.mode,'visual');assert.match(result.visualSearch.discoveryNote!,/登録写真/);assert.equal(result.places[0].id,'seoul');
});
test('expanded local data cannot be hidden by a stale BigQuery catalog',async()=>{
 const expanded={...seoul,id:'new-public-place'};const merged=mergePlaceCatalog([source,expanded],[{...source,name:'old'}]);assert.equal(merged.length,2);assert.equal(merged.find(p=>p.id===source.id)!.name,source.name);
 const catalog=await localCatalog();assert.ok(catalog.length>=90);assert.ok(catalog.filter(p=>p.landform).length>=50);assert.equal(new Set(catalog.map(p=>p.id)).size,catalog.length);
});
test('live city aliases match in either language and within a district address',()=>{
 assert.ok(matchesDestination({...source,city:'London',country:'United Kingdom'},'ロンドン'));
 assert.ok(matchesDestination({...source,city:'ロンドン',country:'イギリス'},'London'));
 assert.ok(matchesDestination({...source,city:'Islington',country:'United Kingdom',address:'London N1, United Kingdom'},'ロンドン'));
 assert.ok(matchesDestination({...source,city:'Kyoto',country:'Japan'},'日本'));
 assert.ok(!matchesDestination({...source,city:'Paris',country:'France',address:'Paris, France'},'ロンドン'));
});
