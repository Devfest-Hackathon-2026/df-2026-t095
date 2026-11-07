import type {Place} from './places.ts';
import {cloudHeaders,googleProject} from './google-auth.ts';
const keys=['description','detail','difference','bestFor'] as const;
export async function translatePlacesIfNeeded(places:Place[]):Promise<Place[]>{
 const texts:{index:number;key:typeof keys[number];text:string}[]=[];
 places.forEach((p,index)=>keys.forEach(key=>{if(p[key]&&p[key].length>8&&!/[ぁ-んァ-ヶ一-龯]/u.test(p[key]))texts.push({index,key,text:p[key]});}));
 if(!texts.length||!process.env.GOOGLE_CLOUD_PROJECT)return places;
 const r=await fetch(`https://translation.googleapis.com/v3/projects/${googleProject()}/locations/global:translateText`,{method:'POST',headers:await cloudHeaders(),body:JSON.stringify({contents:texts.map(t=>t.text),targetLanguageCode:'ja',mimeType:'text/plain'}),signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw new Error('説明を日本語に整えられませんでした。もう一度お試しください。');
 const data=await r.json() as {translations:{translatedText:string}[]};const result=places.map(p=>({...p}));
 texts.forEach((t,i)=>{result[t.index][t.key]=data.translations[i]?.translatedText||t.text;});return result;
}
