"use client";
import type {Place,Quality} from '@/lib/places';
import {feedbackContext,type Judgement} from '@/lib/relevance-feedback';
import {useResultFeedback} from '@/lib/use-result-feedback';
export function ResultFeedback({source,place,preferences}:{source:Place;place:Place;preferences:Quality[]}){
 const {feedback,record,exportFeedback,storageError}=useResultFeedback(source.id,preferences);
 const context=feedbackContext(source.id,preferences),selected=feedback.find(f=>f.candidateId===place.id&&feedbackContext(f.sourceId,f.preferences)===context)?.judgement;
 const choices:{id:Judgement;label:string}[]=[{id:'similar',label:'似ている'},{id:'different',label:'あまり似ていない'},{id:'wrong_landscape',label:'地形・風景が違う'}];
 return <section className="result-feedback" aria-label="候補の評価"><h3>探している場所に近いですか</h3><div>{choices.map(choice=><button className="secondary-button" key={choice.id} aria-pressed={selected===choice.id} onClick={()=>record(place.id,choice.id)}>{choice.label}</button>)}</div><p>このブラウザーの次の並び順に反映します。写真は記録しません。評価は自動送信せず、このブラウザーに保存します。</p>{selected&&<p role="status">評価を反映しました。</p>}{storageError&&<p role="alert">評価を保存できませんでした。ブラウザーの保存設定を確認してください。</p>}{feedback.length>0&&<button className="text-button" onClick={exportFeedback}>評価データを書き出す</button>}</section>;
}
