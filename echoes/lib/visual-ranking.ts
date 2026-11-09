import {compareFactorEvidence} from './factor-types.ts';
import type {Place,Quality} from './places.ts';
import {qualitySignal} from './quality-score.ts';
export {qualitySignal} from './quality-score.ts';
const normal=(s:string)=>s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]/gu,'');
const destinationAliases:Record<string,string>={世界中:'world',アジア:'Asia',ヨーロッパ:'Europe',アフリカ:'Africa',北米:'North America',北アメリカ:'North America',南米:'South America',南アメリカ:'South America',オセアニア:'Oceania',seoul:'ソウル',kyoto:'京都',tokyo:'東京',paris:'パリ',london:'ロンドン',osaka:'大阪',japan:'日本',korea:'韓国',germany:'ドイツ',munich:'ミュンヘン',amsterdam:'アムステルダム'};
export function matchesDestination(place:Place,destination:string){
 const canonical=(value:string)=>{const raw=value.trim();return destinationAliases[raw]||destinationAliases[raw.toLowerCase()]||raw;};
 const d=canonical(destination);if(!d||d==='world')return true;
 if([place.city,place.country,place.continent].some(value=>normal(canonical(value))===normal(d)))return true;
 const names=[d,...Object.keys(destinationAliases).filter(name=>normal(canonical(name))===normal(d))];
 return Boolean(place.address&&names.some(name=>normal(name).length>=2&&normal(place.address!).includes(normal(name))));
}
export function samePlace(a:Place,b:Place){return a.id===b.id||Boolean(a.placeId&&b.placeId&&a.placeId===b.placeId)||(normal(a.name)===normal(b.name)&&Math.abs(a.lat-b.lat)<.2&&Math.abs(a.lng-b.lng)<.2);}
export function cosineSimilarity(a:readonly number[],b:readonly number[]){if(!a.length||a.length!==b.length||[...a,...b].some(v=>!Number.isFinite(v)))throw new Error('埋め込みの形式を確認できませんでした。');let dot=0,aa=0,bb=0;for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}if(!aa||!bb)throw new Error('埋め込みを比較できませんでした。');return Math.max(-1,Math.min(1,dot/Math.sqrt(aa*bb)));}
export function evidenceScore(cosine:number,quality:number,weight:number,vision:number|null,match:'strong'|'partial'|'weak'|undefined){
 let total=.55,value=.55*(cosine+1)/2;if(vision!==null){total+=.2;value+=.2*vision;}if(match){total+=.25;value+=.25*({strong:1,partial:.5,weak:0}[match]);}return Math.max(0,Math.min(1,weight))*value/total+(1-Math.max(0,Math.min(1,weight)))*quality;
}
export const photoScenes=['flowing_water','inland_water','coast','reef_lagoon','archipelago','mountain','plateau','isolated_rock','forest','urban','other'] as const;
export function compatiblePhotoScenes(source:unknown,candidate:unknown){
 if(!photoScenes.includes(source as typeof photoScenes[number])||!photoScenes.includes(candidate as typeof photoScenes[number])||source==='other'||candidate==='other')return true;
 if(source===candidate)return true;const coastal=new Set(['coast','reef_lagoon','archipelago']);return coastal.has(String(source))&&coastal.has(String(candidate));
}
export function rankVisualPlaces(source:Place,candidates:Place[],vectors:Map<string,number[]>,sourceVector:number[],preferences:Quality[],destination:string,weight=.6,cosines?:Map<string,number>){const visualWeight=Math.max(0,Math.min(1,weight));return candidates.filter(p=>!samePlace(source,p)&&matchesDestination(p,destination)&&vectors.has(p.id)).map(p=>{const cosine=cosines?.get(p.id)??cosineSimilarity(sourceVector,vectors.get(p.id)!);return{...p,cosine,score:visualWeight*(cosine+1)/2+(1-visualWeight)*qualitySignal(source,p,preferences)};}).sort((a,b)=>compareFactorEvidence(a,b)||b.score-a.score||a.id.localeCompare(b.id));}
