import {mkdir,writeFile} from 'node:fs/promises';
const get=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error(`World Bank ${r.status}`);return r.json();};
const [tourism,countries]=await Promise.all([get('https://api.worldbank.org/v2/country/all/indicator/ST.INT.ARVL?date=2019&format=json&per_page=500'),get('https://api.worldbank.org/v2/country?format=json&per_page=400')]);
const actual=new Map(countries[1].filter(c=>c.region.id!=='NA').map(c=>[c.id,c]));
const rows=tourism[1].filter(r=>actual.has(r.countryiso3code)&&typeof r.value==='number'&&r.value>=0).map(r=>({iso3:r.countryiso3code,iso2:r.country.id,name:r.country.value,arrivals:Math.round(r.value),year:2019}));
await mkdir('data',{recursive:true});await writeFile('data/tourism.json',JSON.stringify({indicator:'ST.INT.ARVL',year:2019,threshold:1000000,source:'https://data.worldbank.org/indicator/ST.INT.ARVL',license:'CC BY 4.0',method:'同じ年で比較するため2019年の国際観光客到着数を使用。現時点の人気・混雑・安全性を表さない。',countries:rows},null,2));console.log('tourism countries',rows.length);
