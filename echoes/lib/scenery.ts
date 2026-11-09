import type {Place,SourceLink} from './places.ts';
import type {SearchFilters} from './climate-types.ts';
import type {AnalysisPhoto} from './visual-types.ts';

export const seaColorOptions=[['turquoise','ターコイズ'],['blue','青'],['deep_blue','濃い青'],['green','緑'],['gray','灰色'],['brown','茶色']] as const;
export type SeaColor=typeof seaColorOptions[number][0]|'not_sea';
export type SeaColorFilter='any'|'same'|Exclude<SeaColor,'not_sea'>;
export const townscapeOptions=[['historic','歴史ある街並み'],['modern','現代的な街並み'],['residential','低層の住宅街'],['green','緑の多い街並み'],['harbor','港町・海沿い'],['rural','小さな町・集落']] as const;
export type Townscape=typeof townscapeOptions[number][0]|'not_urban';
export type TownscapeFilter='any'|'same'|Exclude<Townscape,'not_urban'>;
export type SceneryKey='seaColor'|'townscape';
export type SceneryObservation<T>={value:T;basis:'photo'|'maps';source?:SourceLink;note:string};
export type Scenery={seaColor?:SceneryObservation<SeaColor>;townscape?:SceneryObservation<Townscape[]>};
export type SceneryMatch={matched:SceneryKey[];unknown:SceneryKey[]};
export function validSeaColorFilter(value:unknown):value is SeaColorFilter{return value==='any'||value==='same'||seaColorOptions.some(([id])=>id===value);}
export function validTownscapeFilter(value:unknown):value is TownscapeFilter{return value==='any'||value==='same'||townscapeOptions.some(([id])=>id===value);}
export const seaColorLabel=(value:SeaColor)=>value==='not_sea'?'海の写り込みなし':seaColorOptions.find(([id])=>id===value)?.[1]||'不明';
export const townscapeLabel=(value:Townscape)=>value==='not_urban'?'街並みの写り込みなし':townscapeOptions.find(([id])=>id===value)?.[1]||'不明';
export function hasSceneryFilters(filters:SearchFilters){return Boolean(filters.seaColor&&filters.seaColor!=='any'||filters.townscape&&filters.townscape!=='any');}
function townscapeObservation(data:Record<string,unknown>,basis:'photo'|'maps',source?:SourceLink):Scenery {
 const values=data.townscape;
 if(!Array.isArray(values)||!values.length||values.length>3||!values.every(value=>value==='not_urban'||townscapeOptions.some(([id])=>id===value))||values.includes('not_urban')&&values.length!==1||typeof data.townscapeNote!=='string'||!data.townscapeNote.trim())return{};
 return{townscape:{value:[...new Set(values)] as Townscape[],basis,source,note:data.townscapeNote.trim().slice(0,300)}};
}
export function sceneryFromMaps(data:Record<string,unknown>,source?:SourceLink):Scenery {
 return source?townscapeObservation(data,'maps',source):{};
}
export function supportsNaturalScenery(photo:AnalysisPhoto){
 return photo.provider==='upload'||!/landsat|sentinel|aster\b|satellite|false[\s_-]*colou?r|multispectral|infrared|衛星|赤外|疑似カラー|擬似カラー/i.test(`${photo.title} ${photo.description}`);
}

/** Observations refer to this particular photo, not current water conditions. */
export function sceneryFromPhoto(data:Record<string,unknown>,photo:AnalysisPhoto,scene?:unknown):Scenery {
 if(!supportsNaturalScenery(photo)||data.naturalColorPhoto!==true)return{};
 const source=photo.provider==='commons'?{title:photo.title,url:photo.sourcePage}:undefined;
 const scenery=townscapeObservation(data,'photo',source);
 const value=data.seaColor;
 if(['flowing_water','inland_water','mountain','plateau','isolated_rock','forest'].includes(String(scene)))return{...scenery,seaColor:{value:'not_sea',basis:'photo',source,note:'写真の主な景観は海ではありません。'}};
 if(value!=='not_sea'&&!seaColorOptions.some(([id])=>id===value))return scenery;
 if(typeof data.seaColorNote!=='string'||!data.seaColorNote.trim())return scenery;
 return{...scenery,seaColor:{value:value as SeaColor,basis:'photo',source,note:data.seaColorNote.trim().slice(0,300)}};
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
 if(filters.townscape&&filters.townscape!=='any'){
  const observation=candidate.scenery?.townscape,reference=source.scenery?.townscape;
  if(observation?.value.includes('not_urban'))return null;
  const targets:Townscape[]|undefined=filters.townscape==='same'?reference?.value.filter(value=>value!=='not_urban'):[filters.townscape];
  if(!observation||!targets?.length)unknown.push('townscape');
  else if(observation.value.some(value=>targets.includes(value)))matched.push('townscape');else return null;
 }
 return unknown.length&&filters.unknownData==='exclude'?null:{matched,unknown};
}
export function filterScenery(source:Place,candidates:Place[],filters:SearchFilters){
 return candidates.flatMap(p=>{const sceneryMatch=matchScenery(source,p,filters);return sceneryMatch?[{...p,sceneryMatch}]:[];});
}
