import {readFile,writeFile,rename} from 'node:fs/promises';
// Candidate generation only. Images remain unavailable until subject and license verification passes.
const target=Number(process.argv.find(a=>a.startsWith('--target='))?.split('=')[1]||600);
if(!Number.isInteger(target)||target<1||target>5000)throw new Error('--target must be between 1 and 5000');
const catalog=JSON.parse(await readFile('data/extra-places.json','utf8'));
const continents={Q15:'Africa',Q18:'South America',Q46:'Europe',Q48:'Asia',Q49:'North America',Q538:'Oceania'};
const types=['Q22698','Q4022','Q23397','Q40080','Q8502','Q23442'];
const display=new Intl.DisplayNames(['ja'],{type:'region'});
let added=0;
for(const type of types){
 if(catalog.length>=target)break;
 const query=`SELECT DISTINCT ?place ?placeLabel ?coord ?iso2 ?continent ?image WHERE { {SELECT ?place ?coord ?country WHERE {
 ?place wdt:P31 wd:${type}; wdt:P625 ?coord; wdt:P17 ?country.
 } LIMIT 180} ?country wdt:P297 ?iso2; wdt:P30 ?continent.
 VALUES ?continent {wd:Q15 wd:Q18 wd:Q46 wd:Q48 wd:Q49 wd:Q538}
 OPTIONAL {?place wdt:P18 ?image.}
 SERVICE wikibase:label {bd:serviceParam wikibase:language "ja,en".}
 } LIMIT 180`;
 const url='https://query.wikidata.org/sparql?'+new URLSearchParams({query,format:'json'});
 const response=await fetch(url,{headers:{'User-Agent':'ElsewhereHackathon/0.1 (public place catalog; provenance retained)','Accept':'application/sparql-results+json'},signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw new Error('Wikidata '+response.status+'; existing catalog has been preserved.');
 const rows=(await response.json()).results?.bindings||[];
 for(const row of rows){
  const id=row.place.value.split('/').pop(),point=/^Point\(([-.\d]+) ([-.\d]+)\)$/.exec(row.coord.value),continent=continents[row.continent.value.split('/').pop()];
  if(!point||!continent||!/^[A-Z]{2}$/.test(row.iso2.value))continue;
  const lat=Number(point[2]),lng=Number(point[1]);if(!Number.isFinite(lat)||Math.abs(lat)>80||!Number.isFinite(lng)||Math.abs(lng)>180)continue;
  if(catalog.some(p=>p.id==='wikidata-'+id||p.provenance?.wikidataId===id||Math.abs(p.lat-lat)<.002&&Math.abs(p.lng-lng)<.002))continue;
  const image=row.image?.value,commonsTitle=image?decodeURIComponent(image.split('/').pop()):undefined;
  catalog.push({id:'wikidata-'+id,name:row.placeLabel.value,city:row.placeLabel.value,country:display.of(row.iso2.value),countryCode:row.iso2.value,continent,lat,lng,image:'',commonsTitle,profiled:false,features:{water:0,green:0,quiet:0,walk:0,cafes:0,history:0},description:'公開地理データから追加した景観の比較候補です。写真と過ごし方の特徴は確認中です。',detail:'所在地と出典を確認してから訪問を検討してください。',difference:'',bestFor:'',sources:[{title:'Wikidata',url:row.place.value.replace('http:','https:')}],provenance:{provider:'Wikidata',wikidataId:id,checkedAt:new Date().toISOString(),type,photoStatus:'pending subject and license verification'}});
  added++;if(catalog.length>=target)break;
 }
 const temporary='data/extra-places.json.tmp';await writeFile(temporary,JSON.stringify(catalog,null,2)+'\n');await rename(temporary,'data/extra-places.json');
 console.log(type,'added',added,'total',catalog.length);
}
console.log(JSON.stringify({added,total:catalog.length,verifiedPhotos:catalog.filter(p=>p.commonsPhoto?.verified).length,note:'Candidate records are not verified photo matches.'}));
