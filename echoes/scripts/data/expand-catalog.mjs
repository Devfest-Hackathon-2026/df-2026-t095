import {readFile,writeFile,rename} from 'node:fs/promises';
const writeJson=async(path,value)=>{const temporary=path+'.'+process.pid+'.tmp';await writeFile(temporary,JSON.stringify(value,null,2)+'\n');await rename(temporary,path);};
const seeds=JSON.parse(await readFile('data/catalog-seeds.json','utf8'));
const catalog=JSON.parse(await readFile('data/extra-places.json','utf8'));
const headers={'User-Agent':'ElsewhereHackathon/0.1 (public geographic catalog; provenance retained)'};
const display=new Intl.DisplayNames(['ja'],{type:'region'});
let added=0;
for(let offset=0;offset<seeds.length;offset+=10){
 const batch=seeds.slice(offset,offset+10).filter(s=>!catalog.some(p=>p.id===s.id));if(!batch.length)continue;
 const params=new URLSearchParams({action:'query',format:'json',redirects:'1',prop:'coordinates|pageprops',titles:batch.map(s=>s.title).join('|'),colimit:'max'});
 const response=await fetch('https://en.wikipedia.org/w/api.php?'+params,{headers,signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error('Wikipedia '+response.status);
 const data=await response.json();const redirects=new Map((data.query?.redirects||[]).map(r=>[r.from,r.to]));
 for(const seed of batch){
  const page=Object.values(data.query?.pages||{}).find(p=>p.title===(redirects.get(seed.title)||seed.title));const point=page?.coordinates?.[0];
  if(!point||!page.pageprops?.wikibase_item||point.globe!=='earth'||Math.abs(point.lat)>80){console.log('skipped (no verified coordinates)',seed.title);continue;}
  const country=display.of(seed.countryCode)||seed.countryCode;
  catalog.push({id:seed.id,name:seed.name||page.title,aliases:[page.title,seed.title],city:seed.city||page.title,country,countryCode:seed.countryCode,continent:seed.continent,lat:point.lat,lng:point.lon,image:'',commonsTitle:page.pageprops.page_image_free||undefined,description:`${country}にある、風景を比べるための参照地点です。`,detail:'地図と出典で場所の情報を確認できます。',difference:'',bestFor:'',profiled:false,features:{water:seed.water||0,green:seed.green||0,quiet:0,walk:0,cafes:0,history:0},sources:[{title:page.title,url:'https://en.wikipedia.org/wiki/'+encodeURIComponent(page.title.replaceAll(' ','_'))}],...(seed.landform?{landform:seed.landform,referenceHalfKm:seed.halfKm||2}:{}),provenance:{provider:'Wikipedia / Wikidata',wikidataId:page.pageprops.wikibase_item,description:page.pageprops['wikibase-shortdesc']||'',checkedAt:new Date().toISOString(),representativeImage:page.pageprops.page_image_free||null}});
  added++;console.log('added',seed.id,point.lat,point.lon);
 }
 await writeJson('data/extra-places.json',catalog);
}
console.log(JSON.stringify({added,extraPlaces:catalog.length,terrainPlaces:catalog.filter(p=>p.landform).length}));
