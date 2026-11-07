"use client";
import {getApps,initializeApp,type FirebaseApp} from 'firebase/app';
import {browserLocalPersistence,getAuth,setPersistence,signInAnonymously,type Auth} from 'firebase/auth';
import type {FirebaseConfig} from './app-config';
import type {Quality} from './places';
export type SavedRef={placeId:string;sampleId:string};
export type FirebaseSession={app:FirebaseApp;auth:Auth;uid:string};
export type SearchSettings={preferences:Quality[];destination:string};
export type SharedSearch=SearchSettings&{sourcePlaceId:string;sourceSampleId:string};
type Value={stringValue?:string;arrayValue?:{values?:Value[]}};
type Document={name?:string;fields?:Record<string,Value>};
let initializing:Promise<FirebaseSession>|undefined;
export async function connectFirebase(config:FirebaseConfig):Promise<FirebaseSession>{
 if(initializing)return initializing;
 initializing=(async()=>{const name=`elsewhere-${config.projectId}`;const app=getApps().find(a=>a.name===name)||initializeApp(config,name);const auth=getAuth(app);auth.languageCode='ja';await setPersistence(auth,browserLocalPersistence);await auth.authStateReady();if(!auth.currentUser)await signInAnonymously(auth);if(!auth.currentUser)throw new Error('保存用の認証を確認できませんでした。');return{app,auth,uid:auth.currentUser.uid};})();
 try{return await initializing;}catch(e){initializing=undefined;throw e;}
}
const root=(session:FirebaseSession)=>`projects/${session.app.options.projectId}/databases/(default)/documents`;
const string=(value:string):Value=>({stringValue:value});
const array=(values:string[]):Value=>({arrayValue:{values:values.map(string)}});
const value=(fields:Record<string,Value>|undefined,key:string)=>fields?.[key]?.stringValue||'';
const preferences=(fields:Record<string,Value>|undefined)=>fields?.preferences?.arrayValue?.values?.map(v=>v.stringValue).filter((v):v is Quality=>typeof v==='string')||[];
async function request<T>(session:FirebaseSession,path:string,options:RequestInit={},missing=false):Promise<T|null>{
 const current=session.auth.currentUser;if(!current||current.uid!==session.uid)throw new Error('保存用の認証が変わりました。ページを読み直してください。');
 const token=await current.getIdToken();const response=await fetch(`https://firestore.googleapis.com/v1/${root(session)}${path}`,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...options.headers},cache:'no-store'});
 if(missing&&response.status===404)return null;
 if(!response.ok)throw new Error(response.status===403?'保存先にアクセスできません。ページを読み直してください。':'保存先と通信できませんでした。接続を確認してお試しください。');
 return await response.json() as T;
}
async function commit(session:FirebaseSession,path:string,fields:Record<string,Value>,timestamp:string,createOnly=false){
 await request(session,':commit',{method:'POST',body:JSON.stringify({writes:[{update:{name:`${root(session)}${path}`,fields},updateTransforms:[{fieldPath:timestamp,setToServerValue:'REQUEST_TIME'}],...(createOnly?{currentDocument:{exists:false}}:{})}]})});
}
/** 常時接続を開かず、初回とタブへ戻ったときに保存情報を取り直す。 */
export function listenFavorites(session:FirebaseSession,next:(refs:SavedRef[])=>void,error:(error:Error)=>void){
 let cancelled=false;let pending:AbortController|undefined;
 const refresh=async()=>{pending?.abort();const c=new AbortController();pending=c;try{const data=await request<{documents?:Document[]}>(session,`/users/${session.uid}/favorites?pageSize=1000`,{signal:c.signal});if(!cancelled&&!c.signal.aborted)next((data?.documents||[]).map(d=>({placeId:value(d.fields,'placeId'),sampleId:value(d.fields,'sampleId')})));}catch(e){if(!cancelled&&!c.signal.aborted)error(e instanceof Error?e:new Error('保存した場所を読み込めませんでした。'));}};
 const onFocus=()=>void refresh();void refresh();window.addEventListener('focus',onFocus);
 return()=>{cancelled=true;pending?.abort();window.removeEventListener('focus',onFocus);};
}
export async function saveFavorite(session:FirebaseSession,ref:SavedRef,saved:boolean){
 const id=encodeURIComponent(ref.placeId||`sample-${ref.sampleId}`);const path=`/users/${session.uid}/favorites/${id}`;
 if(saved)await commit(session,path,{placeId:string(ref.placeId),sampleId:string(ref.sampleId)},'savedAt');else await request(session,path,{method:'DELETE'});
}
export async function loadSettings(session:FirebaseSession):Promise<SearchSettings|null>{const data=await request<Document>(session,`/users/${session.uid}/settings/discovery`,{},true);return data?{preferences:preferences(data.fields),destination:value(data.fields,'destination')}:null;}
export async function saveSettings(session:FirebaseSession,settings:SearchSettings){await commit(session,`/users/${session.uid}/settings/discovery`,{preferences:array(settings.preferences),destination:string(settings.destination)},'updatedAt');}
export async function createShare(session:FirebaseSession,search:SharedSearch){const id=crypto.randomUUID().replaceAll('-','');await commit(session,`/shares/${id}`,{sourcePlaceId:string(search.sourcePlaceId),sourceSampleId:string(search.sourceSampleId),preferences:array(search.preferences),destination:string(search.destination),createdBy:string(session.uid)},'createdAt',true);return id;}
export async function loadShare(session:FirebaseSession,id:string):Promise<SharedSearch|null>{if(!/^[A-Za-z0-9]{8,64}$/.test(id))return null;const data=await request<Document>(session,`/shares/${id}`,{},true);return data?{sourcePlaceId:value(data.fields,'sourcePlaceId'),sourceSampleId:value(data.fields,'sourceSampleId'),preferences:preferences(data.fields),destination:value(data.fields,'destination')}:null;}
