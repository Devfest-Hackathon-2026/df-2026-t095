import type {Place,SourceLink} from './places.ts';
import type {SearchFilters} from './climate-types.ts';
import type {AnalysisPhoto} from './visual-types.ts';

export const seaColorOptions=[['turquoise','ターコイズ'],['blue','青'],['deep_blue','濃い青'],['green','緑'],['gray','灰色'],['brown','茶色']] as const;
export type SeaColor=typeof seaColorOptions[number][0]|'not_sea';
export type SeaColorFilter='any'|'same'|Exclude<SeaColor,'not_sea'>;
export type SceneryKey='seaColor';
export type SceneryObservation<T>={value:T;basis:'photo'|'maps';source?:SourceLink;note:string};
export type Scenery={seaColor?:SceneryObservation<SeaColor>};
export type SceneryMatch={matched:SceneryKey[];unknown:SceneryKey[]};
export function validSeaColorFilter(value:unknown):value is SeaColorFilter{return value==='any'||value==='same'||seaColorOptions.some(([id])=>id===value);}
export const seaColorLabel=(value:SeaColor)=>value==='not_sea'?'海の写り込みなし':seaColorOptions.find(([id])=>id===value)?.[1]||'不明';
export function hasSceneryFilters(filters:SearchFilters){return Boolean(filters.seaColor&&filters.seaColor!=='any');}

/** Observations refer to this particular photo, not current water conditions. */
export function sceneryFromPhoto(data:Record<string,unknown>,photo:AnalysisPhoto,scene?:unknown):Scenery {
 const source=photo.provider==='commons'?{title:photo.title,url:photo.sourcePage}:undefined;
 const value=data.seaColor;
 if(['flowing_water','inland_water','mountain','plateau','isolated_rock','forest'].includes(String(scene)))return{seaColor:{value:'not_sea',basis:'photo',source,note:'写真の主な景観は海ではありません。'}};
 if(value!=='not_sea'&&!seaColorOptions.some(([id])=>id===value))return{};
 if(typeof data.seaColorNote!=='string'||!data.seaColorNote.trim())return{};
 return{seaColor:{value:value as SeaColor,basis:'photo',source,note:data.seaColorNote.trim().slice(0,300)}};
}
export function matchScenery(source:Place,candidate:Place,filters:SearchFilters):SceneryMatch|null {
 const matched:SceneryKey[]=[],unknown:SceneryKey[]=[];
 if(filters.seaColor&&filters.seaColor!=='any'){
  const candidateColor=candidate.scenery?.seaColor,reference=source.scenery?.seaColor;
  // Sea color cannot be inferred from country, climate, Maps descriptions, or fresh water.
  if(candidateColor?.basis==='photo'&&candidateColor.value==='not_sea')return null;
  const target=filters.seaColor==='same'?(reference?.basis==='photo'&&reference.value!=='not_sea'?reference.value:undefined):filters.seaColor;
  if(!candidateColor||candidateColor.basis!=='photo'||!target)unknown.push('seaColor');
  else if(candidateColor.value===target)matched.push('seaColor');else return null;
 }
 return unknown.length&&filters.unknownData==='exclude'?null:{matched,unknown};
}
export function filterScenery(source:Place,candidates:Place[],filters:SearchFilters){
 return candidates.flatMap(p=>{const sceneryMatch=matchScenery(source,p,filters);return sceneryMatch?[{...p,sceneryMatch}]:[];});
}
