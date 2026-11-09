import type {Place} from '@/lib/places';
import {seaColorLabel} from '@/lib/scenery';
export function SceneryEvidence({place,compact=false}:{place:Place;compact?:boolean}){
 const observation=place.scenery?.seaColor;
 if(compact&&!place.sceneryMatch?.matched.includes('seaColor')&&!place.sceneryMatch?.unknown.includes('seaColor'))return null;
 if(!compact&&!observation&&!place.sceneryMatch?.unknown.length)return null;
 return <div className={compact?'factor-tags':'factor-evidence'} aria-label="風景の手がかり">{!compact&&<h3>風景の手がかり</h3>}<p>海の色：{observation?seaColorLabel(observation.value):'写真では確認できません'}{observation&&'（写真での観察）'}</p>{!compact&&observation&&<><p>{observation.note}</p>{observation.source&&<a href={observation.source.url} target="_blank" rel="noopener noreferrer">比べた写真の出典</a>}<p>撮影時の光や天候で変わる見え方です。現在の水質や遊泳可否は判断しません。</p></>}</div>;
}
