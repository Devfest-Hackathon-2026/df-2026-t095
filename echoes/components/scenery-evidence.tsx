import type {Place} from '@/lib/places';
import {seaColorLabel,townscapeLabel,type SceneryKey,type SceneryObservation} from '@/lib/scenery';
export function SceneryEvidence({place,compact=false}:{place:Place;compact?:boolean}){
 const selected=[...place.sceneryMatch?.matched||[],...place.sceneryMatch?.unknown||[]];
 const keys:SceneryKey[]=compact?selected:(['seaColor','townscape'] as const).filter(key=>place.scenery?.[key]||selected.includes(key));
 if(!keys.length)return null;
 return <div className={compact?'factor-tags':'factor-evidence'} aria-label="風景の手がかり">{!compact&&<h3>風景の手がかり</h3>}{keys.map(key=>{
  const observation:SceneryObservation<unknown>|undefined=place.scenery?.[key];
  const label=key==='seaColor'?'海の色':'街の雰囲気';
  const description=key==='seaColor'&&place.scenery?.seaColor?seaColorLabel(place.scenery.seaColor.value):key==='townscape'&&place.scenery?.townscape?place.scenery.townscape.value.map(townscapeLabel).join('・'):'確認できません';
  return <section key={key}><p>{label}：{description}{observation&&(observation.basis==='photo'?'（写真での観察）':'（Maps の資料からの解釈）')}</p>{!compact&&observation&&<><p>{observation.note}</p>{observation.source&&<a href={observation.source.url} target="_blank" rel="noopener noreferrer">{observation.basis==='photo'?'比べた写真の出典':'街並みの参考情報'}</a>}</>}</section>;
 })}{!compact&&<p>撮影時の光や構図、資料による見え方です。現在の水質・混雑・治安は判断しません。</p>}</div>;
}
