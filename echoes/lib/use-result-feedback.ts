"use client";
import {useEffect,useState,useCallback} from 'react';
import {validFeedback,feedbackContext,type Feedback,type Judgement} from './relevance-feedback';
import type {Quality} from './places';
const key='elsewhere:relevance-feedback';
const read=():Feedback[]=>{try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data.filter(validFeedback).slice(-300):[];}catch{return[];}};
export function useResultFeedback(sourceId:string,preferences:Quality[]){
 const [feedback,setFeedback]=useState<Feedback[]>([]),[storageError,setStorageError]=useState(false);
 const context=feedbackContext(sourceId,preferences);
 useEffect(()=>{const refresh=()=>setFeedback(read());refresh();window.addEventListener('elsewhere:feedback',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('elsewhere:feedback',refresh);window.removeEventListener('storage',refresh);};},[]);
 const record=useCallback((candidateId:string,judgement:Judgement)=>{
  const entries=read().filter(f=>feedbackContext(f.sourceId,f.preferences)!==context||f.candidateId!==candidateId);
  entries.push({sourceId,candidateId,preferences:[...preferences],judgement,createdAt:new Date().toISOString()});
  try{localStorage.setItem(key,JSON.stringify(entries.slice(-300)));setStorageError(false);window.dispatchEvent(new Event('elsewhere:feedback'));}catch{setStorageError(true);}
 },[context,sourceId,preferences]);
 const exportFeedback=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({schema:1,feedback},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='elsewhere-feedback.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return{feedback,record,exportFeedback,storageError};
}
