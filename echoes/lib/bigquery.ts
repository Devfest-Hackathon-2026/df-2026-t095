import {cloudHeaders,googleProject} from './google-auth.ts';
export const bqDataset=()=>process.env.BIGQUERY_DATASET||'elsewhere';
export const bqLocation=()=>process.env.BIGQUERY_LOCATION||'asia-northeast1';
export function bqTable(name:string){const project=googleProject(),dataset=bqDataset();if(!/^[a-z][a-z0-9-]+$/.test(project)||!/^\w+$/.test(dataset)||!/^\w+$/.test(name))throw new Error('BigQuery の設定を確認してください。');return `\`${project}.${dataset}.${name}\``;}
type Parameter={name:string;parameterType:{type:string};parameterValue:{value:string}};
type QueryResult={jobComplete?:boolean;jobReference?:{jobId:string;location?:string};pageToken?:string;rows?:{f:{v:unknown}[]}[];schema?:{fields:{name:string}[]};errors?:unknown[];error?:unknown};
export async function collectQueryRows(first:QueryResult,next:(token:string)=>Promise<QueryResult>){
 const rows=[...(first.rows||[])],seen=new Set<string>();let token=first.pageToken;
 while(token){
  if(seen.has(token)||seen.size>=20)throw new Error('BigQuery のページ数が上限を超えました。条件を絞ってください。');
  seen.add(token);const page=await next(token);
  if(page.error||page.errors?.length)throw new Error('BigQuery の続きのデータを取得できませんでした。');
  rows.push(...page.rows||[]);token=page.pageToken;
 }
 const fields=first.schema?.fields||[];
 return rows.map(row=>Object.fromEntries(fields.map((field,i)=>[field.name,row.f[i]?.v])));
}
export function bqString(name:string,value:string):Parameter{return{name,parameterType:{type:'STRING'},parameterValue:{value}};}
export async function queryBigQuery(sql:string,parameters:Parameter[]=[]){
 const root=`https://bigquery.googleapis.com/bigquery/v2/projects/${googleProject()}`;
 const r=await fetch(root+'/queries',{method:'POST',headers:await cloudHeaders(),body:JSON.stringify({query:sql,useLegacySql:false,location:bqLocation(),timeoutMs:10000,maximumBytesBilled:process.env.BIGQUERY_MAX_BYTES||'100000000',parameterMode:'NAMED',queryParameters:parameters}),signal:AbortSignal.timeout(20000),cache:'no-store'});
 let d=await r.json() as QueryResult;if(!r.ok||d.error||d.errors?.length)throw new Error('BigQuery の候補データを取得できませんでした。');
 for(let attempt=0;!d.jobComplete&&attempt<6;attempt++){if(!d.jobReference)throw new Error('BigQuery の処理を確認できませんでした。');const ref=d.jobReference;const response=await fetch(`${root}/queries/${encodeURIComponent(ref.jobId)}?${new URLSearchParams({location:ref.location||bqLocation(),timeoutMs:'10000',maxResults:'500'})}`,{headers:await cloudHeaders(),signal:AbortSignal.timeout(15000),cache:'no-store'});d=await response.json();if(!response.ok||d.error||d.errors?.length)throw new Error('BigQuery の検索に失敗しました。');}
 if(!d.jobComplete)throw new Error('BigQuery の検索が時間内に完了しませんでした。');const ref=d.jobReference;
 return collectQueryRows(d,async token=>{
  if(!ref)throw new Error('BigQuery の検索の続きを確認できませんでした。');
  const response=await fetch(`${root}/queries/${encodeURIComponent(ref.jobId)}?${new URLSearchParams({location:ref.location||bqLocation(),maxResults:'500',pageToken:token})}`,{headers:await cloudHeaders(),signal:AbortSignal.timeout(15000),cache:'no-store'});
  if(!response.ok)throw new Error('BigQuery の検索の続きを取得できませんでした。');return await response.json() as QueryResult;
 });
}
