import {createHash} from 'node:crypto';
import {mkdir,readFile,rename,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {cloudHeaders,googleProject} from './google-auth.ts';
import {commonsImageBytes} from './commons.ts';
import type {CommonsPhoto} from './visual-types.ts';
export const embeddingModel=()=>process.env.GOOGLE_EMBEDDING_MODEL||'gemini-embedding-2';
const dimensions=768;
type CacheEntry={schema:1;model:string;dimensions:number;project:string;bytesSha256:string;createdAt:string;photo:CommonsPhoto;values:number[]};
const inflight=new Map<string,Promise<number[]>>();
export async function imageEmbedding(photo:CommonsPhoto):Promise<number[]>{
 // 入力を Commons 型に限定し、Google Places の写真 URL を受け取らない。
 const bytes=await commonsImageBytes(photo);const model=embeddingModel();if(model!=='gemini-embedding-2')throw new Error('画像埋め込みのモデルを確認してください。');
 const project=googleProject(),bytesSha256=createHash('sha256').update(bytes).digest('hex');
 const identity=JSON.stringify({schema:1,model,dimensions,project,bytesSha256,pageId:photo.pageId,sha1:photo.sha1,license:photo.license,licenseUrl:photo.licenseUrl,sourcePage:photo.sourcePage});
 const key=createHash('sha256').update(identity).digest('hex');const existing=inflight.get(key);if(existing)return existing;
 const task=(async()=>{
  const dir=resolve(process.cwd(),'.cache/commons-embeddings');const file=resolve(dir,`${key}.json`);
  try{const cached=JSON.parse(await readFile(file,'utf8')) as CacheEntry;if(cached.schema===1&&cached.model===model&&cached.project===project&&cached.bytesSha256===bytesSha256&&cached.values.length===dimensions&&cached.values.every(Number.isFinite))return cached.values;}catch{}
  const values=await embedImageBytes(bytes,photo.mime);
  const record:CacheEntry={schema:1,model,dimensions,project,bytesSha256,createdAt:new Date().toISOString(),photo,values};
  try{await mkdir(dir,{recursive:true});const temp=`${file}.${crypto.randomUUID()}.tmp`;await writeFile(temp,JSON.stringify(record));await rename(temp,file);}catch{/* 書き込みできない環境では、このリクエストのメモリー内で再利用する。 */}
  return values;
 })();inflight.set(key,task);try{return await task;}finally{inflight.delete(key);}
}

/** 利用者の画像はこの関数だけで処理し、キャッシュへ書き込まない。 */
export async function embedImageBytes(bytes:Buffer,mimeType:string):Promise<number[]>{
 const model=embeddingModel(),project=googleProject();if(model!=='gemini-embedding-2')throw new Error('画像埋め込みのモデルを確認してください。');
  const location=process.env.GOOGLE_EMBEDDING_LOCATION||'us';if(!['us','eu'].includes(location))throw new Error('画像埋め込みのリージョンを確認してください。');
  const response=await fetch(`https://aiplatform.${location}.rep.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:embedContent`,{method:'POST',headers:await cloudHeaders(),body:JSON.stringify({content:{parts:[{inlineData:{mimeType,data:bytes.toString('base64')}}]},outputDimensionality:dimensions}),signal:AbortSignal.timeout(60000),cache:'no-store'});
  const data=await response.json() as {embedding?:{values:number[]};error?:{message?:string}};if(!response.ok){console.error('Embedding API',response.status,data.error?.message?.slice(0,240));throw new Error(response.status===429?'画像解析の利用枠に達しました。':'Google の画像埋め込みを利用できませんでした。');}
  const values=data.embedding?.values as number[];if(!Array.isArray(values)||values.length!==dimensions||!values.every(Number.isFinite)||!values.some(v=>v!==0))throw new Error('画像埋め込みの結果を確認できませんでした。');
 return values;
}
