import {test} from 'node:test';
import assert from 'node:assert/strict';
import {places} from '../lib/places.ts';
import {matchScenery,sceneryFromPhoto,sceneryFromMaps,filterScenery,type SeaColor,type Townscape} from '../lib/scenery.ts';
import {parseGroundedPlaces} from '../lib/google.ts';
import {compareFactorEvidence} from '../lib/factor-types.ts';
import {parseSearchFilters} from '../lib/climate-types.ts';
import {filtersFromParams,filtersToParams} from '../lib/search-params.ts';
import {samplePhoto} from '../lib/commons.ts';
import {visualDiscovery,uploadedVisualDiscovery} from '../lib/visual-discovery.ts';
import {searchPolicy} from '../lib/search-policy.ts';
import {applyAtmosphereScenery} from '../lib/photo-scenery.ts';
const source=places[0],candidate=places[1];
const sea=(value:SeaColor)=>({seaColor:{value,basis:'photo' as const,note:'写真の水面に見える色です。'}});
const filters={climate:'any',lessVisited:false,seaColor:'blue' as const,unknownData:'include' as const};
const town=(...value:Townscape[])=>({townscape:{value,basis:'photo' as const,note:'建物と街路の構成を確認しました。'}});
test('sea color filters use observed seawater, distinguish fresh water, and retain unknowns last',async()=>{
 const blue={...candidate,scenery:sea('blue')},green={...candidate,id:'green',scenery:sea('green')},unknown={...candidate,id:'unknown'};
 assert.deepEqual(matchScenery(source,blue,filters),{matched:['seaColor'],unknown:[]});assert.equal(matchScenery(source,green,filters),null);
 assert.equal(matchScenery(source,{...candidate,scenery:sea('not_sea')},filters),null);
 assert.deepEqual(matchScenery(source,unknown,filters)?.unknown,['seaColor']);assert.equal(matchScenery(source,unknown,{...filters,unknownData:'exclude'}),null);
 assert.equal(filterScenery(source,[unknown,blue,green],filters).sort(compareFactorEvidence)[0].id,blue.id);
 const photo=(await samplePhoto(source))!;
 assert.equal(sceneryFromPhoto({seaColor:'blue',seaColorNote:'青い水'},photo,'flowing_water').seaColor?.value,'not_sea');
 assert.deepEqual(sceneryFromPhoto({seaColor:'invented',seaColorNote:'blue'},photo,'coast'),{});
 assert.deepEqual(sceneryFromPhoto({seaColor:'blue'},photo,'coast'),{});
 assert.deepEqual(matchScenery(source,{...candidate,scenery:{seaColor:{value:'blue',basis:'maps',note:'not a photo'}}},filters)?.unknown,['seaColor']);
});
test('same-color search supports a location-unknown reference photo and survives shared links',()=>{
 const reference={...source,locationUnknown:true,scenery:sea('turquoise')};
 assert.deepEqual(matchScenery(reference,{...candidate,scenery:sea('turquoise')},{...filters,seaColor:'same'}),{matched:['seaColor'],unknown:[]});
 const selected=parseSearchFilters({...filters,seaColor:'same'});assert.deepEqual(filtersFromParams(filtersToParams(new URLSearchParams(),selected)),selected);
 assert.throws(()=>parseSearchFilters({...filters,seaColor:'not_sea'}),/海の色/);assert.throws(()=>parseSearchFilters({...filters,seaColor:1}),/海の色/);
});
test('photo verification continues past wrong colors and does not force them into results',async()=>{
 const photo=(await samplePhoto(source))!,pool=Array.from({length:8},(_,i)=>({...candidate,id:'candidate-'+i}));let attempts=0;
 const result=await visualDiscovery(source,['water'],'world',1,{
  collection:async()=>({places:pool,provider:'local'}),photo:async p=>({...photo,pageId:p.id===source.id?1:2+pool.findIndex(x=>x.id===p.id),sha1:p.id}),embed:async()=>[1,0],
  explain:async(_source,p)=>{attempts++;return{cosine:1,visualWeight:1,observations:['海が見えます。'],differences:['色が違います。'],inferences:[],explanation:'generated',landscapeMatch:'strong',sourcePhoto:photo,candidatePhoto:photo,candidateScenery:sea(p.id==='candidate-4'?'blue':'green')};},
 },filters);
 assert.equal(attempts,Math.min(8,searchPolicy().maxVerifications));assert.deepEqual(result.places.map(p=>p.id),['candidate-4']);assert.deepEqual(result.places[0].sceneryMatch?.matched,['seaColor']);
});
test('uploaded source observations stay within the comparison and strict unavailable evidence returns no match',async()=>{
 const photo=(await samplePhoto(candidate))!;
 const result=await uploadedVisualDiscovery(Buffer.from('sanitized'),['water'],'world',1,{
  collection:async()=>({places:[candidate],provider:'local'}),embed:async()=>[1,0],photo:async()=>photo,candidateEmbed:async()=>[1,0],
  explain:async()=>({cosine:1,visualWeight:1,observations:['海'],differences:['岸'],inferences:[],explanation:'generated',landscapeMatch:'strong',sourcePhoto:{provider:'upload',name:'写真',mime:'image/jpeg',changes:'位置情報なし'},candidatePhoto:photo,sourceScenery:sea('blue'),candidateScenery:sea('blue')}),
 },{...filters,seaColor:'same',unknownData:'exclude'});
 assert.equal(result.source.locationUnknown,true);assert.equal(result.places.length,1);
 const unavailable=await visualDiscovery(source,['water'],'world',1,{collection:async()=>({places:[candidate],provider:'local'}),photo:async()=>null,embed:async()=>[1,0]},{...filters,unknownData:'exclude'});
 assert.deepEqual(unavailable.places,[]);
});
test('atmosphere searches analyze only reusable photos and honor the cost budget',async()=>{
 const photo=(await samplePhoto(candidate))!;let analyzed=0;
 const pool=Array.from({length:12},(_,i)=>({...candidate,id:String(i)}));
 const deps={photo:async()=>photo,analyze:async()=>{analyzed++;return sea('blue');}};
 const result=await applyAtmosphereScenery(source,pool,filters,deps);assert.equal(analyzed,Math.min(pool.length,searchPolicy().maxVerifications));assert.equal(result.places.length,12);assert.equal(result.places[0].sceneryMatch?.unknown.length,0);if(analyzed<pool.length)assert.equal(result.places[11].sceneryMatch?.unknown.length,1);
 analyzed=0;await applyAtmosphereScenery(source,pool,{...filters,seaColor:'any'},deps);assert.equal(analyzed,0);
});
test('townscape accepts multiple supported styles, excludes nonurban scenes, and preserves same-style matching',()=>{
 const selected={...filters,seaColor:'any' as const,townscape:'historic' as const};
 assert.deepEqual(matchScenery(source,{...candidate,scenery:town('historic','harbor')},selected)?.matched,['townscape']);
 assert.equal(matchScenery(source,{...candidate,scenery:town('modern')},selected),null);
 assert.equal(matchScenery(source,{...candidate,scenery:town('not_urban')},selected),null);
 assert.deepEqual(matchScenery(source,candidate,selected)?.unknown,['townscape']);
 assert.deepEqual(matchScenery({...source,scenery:town('historic','harbor')},{...candidate,scenery:town('harbor')},{...selected,townscape:'same'})?.matched,['townscape']);
 const both={...filters,townscape:'historic' as const};
 assert.equal(matchScenery(source,{...candidate,scenery:{...sea('green'),...town('historic')}},both),null);
 assert.deepEqual(matchScenery(source,{...candidate,scenery:{...sea('blue'),...town('historic')}},both)?.matched,['seaColor','townscape']);
 const parsed=parseSearchFilters(both);assert.deepEqual(filtersFromParams(filtersToParams(new URLSearchParams(),parsed)),parsed);
 assert.throws(()=>parseSearchFilters({...both,townscape:'safe'}),/街の雰囲気/);
});
test('Maps townscape interpretations require grounding and never manufacture sea color',()=>{
 const raw={name:'Example Old Town',city:'Kyoto',country:'Japan',lat:35,lng:135,features:{...source.features},townscape:['historic'],townscapeNote:'石造りの建物と歩行者街路があるという資料。',seaColor:'blue',seaColorNote:'blue'};
 const [parsed]=parseGroundedPlaces({candidates:[{content:{parts:[{text:JSON.stringify({places:[raw]})}]},groundingMetadata:{groundingChunks:[{maps:{title:raw.name,uri:'https://maps.google.com/?cid=123'}}]}}]});
 assert.equal(parsed.scenery?.townscape?.basis,'maps');assert.ok(parsed.scenery?.townscape?.source);assert.equal(parsed.scenery?.seaColor,undefined);
 assert.deepEqual(sceneryFromMaps(raw),{});
 assert.deepEqual(sceneryFromMaps({...raw,townscape:['historic','safe']},{title:'Maps',url:'https://maps.google.com'}),{});
});
test('a townscape-only atmosphere search reuses grounded profiles without any photo analysis',async()=>{
 let calls=0;
 const historic={...candidate,scenery:{townscape:{value:['historic'] as Townscape[],basis:'maps' as const,note:'建物の資料',source:{title:'Maps',url:'https://maps.google.com'}}}};
 const result=await applyAtmosphereScenery({...source,scenery:historic.scenery},[historic],{...filters,seaColor:'any',townscape:'same'}, {photo:async()=>{calls++;return null;},analyze:async()=>{calls++;return{};}});
 assert.equal(calls,0);assert.deepEqual(result.places[0].sceneryMatch?.matched,['townscape']);
});
test('photo streetscape evidence retains its source and does not erase non-sea classification',async()=>{
 const photo=(await samplePhoto(candidate))!;
 const scenery=sceneryFromPhoto({seaColor:'blue',seaColorNote:'水面',townscape:['historic','green'],townscapeNote:'古い建物と並木が見えます。'},photo,'flowing_water');
 assert.equal(scenery.seaColor?.value,'not_sea');assert.deepEqual(scenery.townscape?.value,['historic','green']);assert.equal(scenery.townscape?.source?.url,photo.sourcePage);
 assert.equal(sceneryFromPhoto({townscape:['not_urban','modern'],townscapeNote:'混在'},photo).townscape,undefined);
});
