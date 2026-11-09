import {mkdir,writeFile,rename} from 'node:fs/promises';

// All measurements describe countries, never individual destinations.
const series={populationDensity:{indicator:'EN.POP.DNST',unit:'人/km²'},waterQuality:{indicator:'EN.H2O.BDYS.ZS',unit:'%'},homicideRate:{indicator:'VC.IHR.PSRC.P5',unit:'件/10万人'}};
const get=async path=>{
 const response=await fetch('https://api.worldbank.org/v2/'+path,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`World Bank HTTP ${response.status}`);
 const json=await response.json();if(!Array.isArray(json[1]))throw new Error('Unexpected World Bank response: '+JSON.stringify(json[0]));
 return json;
};
const [,countryData]=await get('country?format=json&per_page=400');
const countries=countryData.filter(c=>c.region.id!=='NA').map(c=>({iso2:c.iso2Code,iso3:c.id,name:c.name,factors:{}}));
for(const [key,{indicator,unit}] of Object.entries(series)){
 const [meta,rows]=await get(`country/all/indicator/${indicator}?date=2020:2024&format=json&per_page=20000`);
 if(meta.pages!==1)throw new Error('Pagination required; refusing an incomplete statistical snapshot.');
 for(const country of countries){
  const latest=rows.filter(r=>r.countryiso3code===country.iso3&&typeof r.value==='number'&&Number.isFinite(r.value)&&r.value>=0&&(key!=='waterQuality'||r.value<=100)).sort((a,b)=>Number(b.date)-Number(a.date))[0];
  country.factors[key]=latest?{value:latest.value,year:Number(latest.date),unit,scope:'country',source:`https://data.worldbank.org/indicator/${indicator}`} : null;
 }
 console.log(key,countries.filter(c=>c.factors[key]).length,'countries');
}
await mkdir('data',{recursive:true});
const output={retrievedAt:new Date().toISOString(),period:'2020–2024',license:'CC BY 4.0',method:'各系列の2020〜2024年の最新公表値。水質は良好な河川・湖沼・地下水域の割合。人口・犯罪も国単位。地点の混雑、水の透明度・遊泳可否、旅行の安全性は示さない。',series,countries};
const temporary='data/place-factors.json.tmp';await writeFile(temporary,JSON.stringify(output,null,2)+'\n');await rename(temporary,'data/place-factors.json');
