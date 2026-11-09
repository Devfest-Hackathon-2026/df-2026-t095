import {readFile,readdir,mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {localCatalog} from '../../lib/catalog.ts';
import {lookupCommonsPhotos,eligibleLicense} from '../../lib/commons.ts';
import {imageEmbedding,embeddingModel} from '../../lib/image-embedding.ts';
import {googleProject} from '../../lib/google-auth.ts';

const refresh=process.argv.includes('--refresh');
const limit=Number(process.argv.find(a=>a.startsWith('--limit='))?.split('=')[1]||500);
if(!Number.isInteger(limit)||limit<1||limit>5000)throw new Error('--limit must be between 1 and 5000');
const catalog=(await localCatalog()).slice(0,limit);
const manifest=JSON.parse(await readFile('data/commons-samples.json','utf8'));
manifest.photoSets??={};
if(refresh)for(const place of catalog){
 try{const photos=await lookupCommonsPhotos(place,3);for(const photo of photos)await imageEmbedding(photo);if(photos.length)manifest.photoSets[place.id]=photos;}catch(error){console.log(place.id,String(error.message).slice(0,100));}
}
const entries=[];
for(const name of await readdir('.cache/commons-embeddings').catch(()=>[]))try{
 const entry=JSON.parse(await readFile(resolve('.cache/commons-embeddings',name),'utf8'));
 if(entry.schema===1&&entry.model===embeddingModel()&&entry.project===googleProject()&&entry.dimensions===768&&entry.values?.length===768&&entry.values.every(Number.isFinite)&&entry.photo?.verified&&eligibleLicense(entry.photo))entries.push(entry);
}catch{}
const places={};
for(const place of catalog){
 const photos=[manifest.photos[place.id],...(manifest.photoSets[place.id]||[])].filter(Boolean),seen=new Set();
 places[place.id]=photos.flatMap(photo=>{
  if(seen.has(photo.sha1))return[];seen.add(photo.sha1);
  const entry=entries.find(e=>e.photo.pageId===photo.pageId&&e.photo.sha1===photo.sha1);
  return entry?[{photo,vector:entry.values,bytesSha256:entry.bytesSha256}]:[];
 }).slice(0,5);
}
await mkdir('.cache',{recursive:true});
const index={schema:1,model:embeddingModel(),project:googleProject(),dimensions:768,createdAt:new Date().toISOString(),places};
await writeFile('.cache/photo-index-v1.json.tmp',JSON.stringify(index));await rename('.cache/photo-index-v1.json.tmp','.cache/photo-index-v1.json');
if(refresh){await writeFile('data/commons-samples.json.tmp',JSON.stringify(manifest,null,2)+'\n');await rename('data/commons-samples.json.tmp','data/commons-samples.json');}
console.log(JSON.stringify({preparedPlaces:Object.values(places).filter(p=>p.length).length,preparedPhotos:Object.values(places).reduce((sum,p)=>sum+p.length,0),refresh}));
