import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {cloudHeaders} from './google-auth.ts';
import {commonsImageBytes} from './commons.ts';
import type {CommonsPhoto} from './visual-types.ts';
export type VisionLabel={name:string;score:number};
export type VisionEvidence={labels:VisionLabel[];landmarks:{name:string;score:number}[]};
export async function analyzeImage(bytes:Buffer):Promise<VisionEvidence>{
 const r=await fetch('https://vision.googleapis.com/v1/images:annotate',{method:'POST',headers:await cloudHeaders(),body:JSON.stringify({requests:[{image:{content:bytes.toString('base64')},features:[{type:'LABEL_DETECTION',maxResults:20},{type:'LANDMARK_DETECTION',maxResults:3}]}]}),signal:AbortSignal.timeout(25000),cache:'no-store'});
 const d=await r.json() as {responses?:{labelAnnotations?:{description?:string;score?:number}[];landmarkAnnotations?:{description?:string;score?:number}[];error?:unknown}[]};
 if(!r.ok||!d.responses?.[0]||d.responses[0].error)throw new Error('Vision API の画像確認を利用できませんでした。');
 const labels=(items:{description?:string;score?:number}[]|undefined)=> (items||[]).filter(x=>typeof x.description==='string'&&typeof x.score==='number'&&x.score>=.65).map(x=>({name:x.description!,score:x.score!}));
 return{labels:labels(d.responses[0].labelAnnotations),landmarks:labels(d.responses[0].landmarkAnnotations)};
}
export async function commonsVision(photo:CommonsPhoto){
 const bytes=await commonsImageBytes(photo);const hash=createHash('sha256').update(bytes).digest('hex');const dir=resolve(process.cwd(),'.cache/commons-vision'),path=resolve(dir,`${hash}.json`);
 try{const d=JSON.parse(await readFile(path,'utf8'));if(d.schema===1&&d.photo.sha1===photo.sha1&&Array.isArray(d.evidence.labels))return {labels:d.evidence.labels.filter((l:VisionLabel)=>l.score>=.65),landmarks:d.evidence.landmarks} as VisionEvidence;}catch{}
 const evidence=await analyzeImage(bytes);await mkdir(dir,{recursive:true});await writeFile(path,JSON.stringify({schema:1,photo,evidence}));return evidence;
}
const generic=new Set(['water','sky','plant','cloud','tree','daytime','nature','natural landscape','landscape','outdoor','outdoors','blue','green','photograph','ecoregion','world']);
/** 一般的すぎるラベルは除き、川・海岸・市街地などの違いを補助信号にする。 */
export function visionOverlap(a:VisionEvidence,b:VisionEvidence){
 const normalize=(labels:VisionLabel[])=>new Map(labels.filter(x=>!generic.has(x.name.toLowerCase())).map(x=>[x.name.toLowerCase(),x.score]));const x=normalize(a.labels),y=normalize(b.labels);const all=new Set([...x.keys(),...y.keys()]);let shared=0,total=0;for(const key of all){shared+=Math.min(x.get(key)||0,y.get(key)||0);total+=Math.max(x.get(key)||0,y.get(key)||0);}return total?shared/total:null;
}
