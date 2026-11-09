"use client";
import {useId,useRef,useState,type DragEvent} from 'react';
import {Icon} from './icons';
export function PhotoUpload({file,confirmed,onFile,onConfirm,candidateCount}:{file:File|null;confirmed:boolean;onFile:(file:File|null)=>void;onConfirm:(value:boolean)=>void;candidateCount:number}){
 const input=useRef<HTMLInputElement>(null),dragDepth=useRef(0),id=useId();
 const [dragActive,setDragActive]=useState(false),[dropError,setDropError]=useState('');
 const hasFiles=(event:DragEvent)=>Array.from(event.dataTransfer.types).includes('Files');
 const resetDrag=()=>{dragDepth.current=0;setDragActive(false);};
 const choose=(files:FileList)=>{setDropError('');if(files.length!==1){setDropError('写真は1枚ずつ追加してください。');return;}onFile(files[0]);if(input.current)input.current.value='';};
 return <details className="photo-upload" onToggle={event=>{if(!event.currentTarget.open)resetDrag();}}><summary>自分の写真から探す</summary><div className="upload-fields"><div><p className="upload-label" id={`${id}-label`}>比較したい写真</p><div
  className={`upload-drop-zone${dragActive?' is-drag-active':''}`}
  role="group" aria-labelledby={`${id}-label`} aria-describedby={`${id}-formats`}
  onDragEnter={event=>{if(!hasFiles(event))return;event.preventDefault();dragDepth.current++;setDragActive(true);}}
  onDragOver={event=>{if(!hasFiles(event))return;event.preventDefault();event.dataTransfer.dropEffect='copy';}}
  onDragLeave={event=>{if(!dragDepth.current)return;event.preventDefault();dragDepth.current=Math.max(0,dragDepth.current-1);if(!dragDepth.current)setDragActive(false);}}
  onDragEnd={resetDrag}
  onDrop={event=>{event.preventDefault();event.stopPropagation();resetDrag();if(hasFiles(event))choose(event.dataTransfer.files);}}
 ><Icon name="Image" size={32}/><div className="upload-drop-copy"><strong>{dragActive?'ここにドロップして写真を選ぶ':file?'別の写真をドロップして差し替える':'写真をここにドラッグ＆ドロップ'}</strong><p>ボタンから選ぶこともできます。</p></div><button type="button" className="secondary-button" onClick={()=>input.current?.click()}>写真を選ぶ</button><span className="upload-file-name" role="status">{file?`選択中：${file.name}`:'写真を選んでいません'}</span></div>{dropError&&<p className="upload-drop-error" role="alert">{dropError}</p>}<input ref={input} hidden id="reference-photo" aria-label="比較したい写真" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{if(e.target.files?.length)choose(e.target.files);}}/><p id={`${id}-formats`}>JPEG・PNG・WebP、8 MB・2,400万画素以内。写真の比較候補は現在{candidateCount}地点です。</p></div><p>検索すると、位置情報などを取り除いた画像を Google に送って解析します。アップロードした写真とその埋め込みは保存しません。</p><label className="upload-consent"><input type="checkbox" checked={confirmed} onChange={e=>onConfirm(e.target.checked)}/><span>自分で撮影した写真、または画像解析に使える権利を持つ写真です。Google Maps / Google Earth の画面画像は使いません。</span></label>{file&&<button className="text-button" type="button" onClick={()=>{resetDrag();setDropError('');onFile(null);if(input.current)input.current.value='';}}>写真を取り消して地名から探す</button>}</div></details>;
}
