"use client";
import {getApps,initializeApp,type FirebaseApp} from 'firebase/app';
import {browserLocalPersistence,getAuth,setPersistence,signInAnonymously,type Auth} from 'firebase/auth';
import {addDoc,collection,deleteDoc,doc,getDoc,getFirestore,onSnapshot,serverTimestamp,setDoc,type Firestore} from 'firebase/firestore';
import type {FirebaseConfig} from './app-config';
import type {Quality} from './places';
export type SavedRef={placeId:string;sampleId:string};
export type FirebaseSession={app:FirebaseApp;auth:Auth;db:Firestore;uid:string};
export type SearchSettings={preferences:Quality[];destination:string};
export type SharedSearch=SearchSettings&{sourcePlaceId:string;sourceSampleId:string};
let initializing:Promise<FirebaseSession>|undefined;
export async function connectFirebase(config:FirebaseConfig):Promise<FirebaseSession>{
 if(initializing)return initializing;
 initializing=(async()=>{const name=`elsewhere-${config.projectId}`;const app=getApps().find(a=>a.name===name)||initializeApp(config,name);const auth=getAuth(app);auth.languageCode='ja';await setPersistence(auth,browserLocalPersistence);await auth.authStateReady();if(!auth.currentUser)await signInAnonymously(auth);if(!auth.currentUser)throw new Error('保存用の認証を確認できませんでした。');return{app,auth,db:getFirestore(app),uid:auth.currentUser.uid};})();
 try{return await initializing;}catch(e){initializing=undefined;throw e;}
}
export function listenFavorites(session:FirebaseSession,next:(refs:SavedRef[])=>void,error:(error:Error)=>void){
 return onSnapshot(collection(session.db,'users',session.uid,'favorites'),snap=>next(snap.docs.map(d=>d.data()).filter(d=>typeof d.placeId==='string'&&typeof d.sampleId==='string').map(d=>({placeId:d.placeId,sampleId:d.sampleId}))),error);
}
export async function saveFavorite(session:FirebaseSession,ref:SavedRef,saved:boolean){
 const id=encodeURIComponent(ref.placeId||`sample-${ref.sampleId}`);const target=doc(session.db,'users',session.uid,'favorites',id);
 if(saved)await setDoc(target,{...ref,savedAt:serverTimestamp()});else await deleteDoc(target);
}
export async function loadSettings(session:FirebaseSession):Promise<SearchSettings|null>{const snap=await getDoc(doc(session.db,'users',session.uid,'settings','discovery'));return snap.exists()?snap.data() as SearchSettings:null;}
export async function saveSettings(session:FirebaseSession,settings:SearchSettings){await setDoc(doc(session.db,'users',session.uid,'settings','discovery'),{...settings,updatedAt:serverTimestamp()});}
export async function createShare(session:FirebaseSession,search:SharedSearch){const ref=await addDoc(collection(session.db,'shares'),{...search,createdBy:session.uid,createdAt:serverTimestamp()});return ref.id;}
export async function loadShare(session:FirebaseSession,id:string):Promise<SharedSearch|null>{if(!/^[A-Za-z0-9]{8,64}$/.test(id))return null;const snap=await getDoc(doc(session.db,'shares',id));return snap.exists()?snap.data() as SharedSearch:null;}
