import {cloudHeaders,googleProject} from './google-auth.ts';
export const bqDataset=()=>process.env.BIGQUERY_DATASET||'elsewhere';
export const bqLocation=()=>process.env.BIGQUERY_LOCATION||'asia-northeast1';
export function bqTable(name:string){const project=googleProject(),dataset=bqDataset();if(!/^[a-z][a-z0-9-]+$/.test(project)||!/^\w+$/.test(dataset)||!/^\w+$/.test(name))throw new Error('BigQuery の設定を確認してください。');return `\`${project}.${dataset}.${name}\``;}
type Parameter={name:string;parameterType:{type:string};parameterValue:{value:string}};
export function bqString(name:string,value:string):Parameter{return{name,parameterType:{type:'STRING'},parameterValue:{value}};}
export async function queryBigQuery(sql:string,parameters:Parameter[]=[]){
 const root=`https://bigquery.googleapis.com/bigquery/v2/projects/${googleProject()}`;
 const r=await fetch(root+'/queries',{method:'POST',headers:await cloudHeaders(),body:JSON.stringify({query:sql,useLegacySql:false,location:bqLocation(),timeoutMs:10000,maximumBytesBilled:process.env.BIGQUERY_MAX_BYTES||'100000000',parameterMode:'NAMED',queryParameters:parameters}),signal:AbortSignal.timeout(20000),cache:'no-store'});
 let d=await r.json() as {jobComplete?:boolean;jobReference?:{jobId:string;location?:string};rows?:{f:{v:unknown}[]}[];schema?:{fields:{name:string}[]};errors?:unknown[];error?:unknown};if(!r.ok||d.error||d.errors?.length)throw new Error('BigQuery の候補データを取得できませんでした。');
 for(let attempt=0;!d.jobComplete&&attempt<6;attempt++){if(!d.jobReference)throw new Error('BigQuery の処理を確認できませんでした。');const ref=d.jobReference;const response=await fetch(`${root}/queries/${encodeURIComponent(ref.jobId)}?${new URLSearchParams({location:ref.location||bqLocation(),timeoutMs:'10000',maxResults:'500'})}`,{headers:await cloudHeaders(),signal:AbortSignal.timeout(15000),cache:'no-store'});d=await response.json();if(!response.ok||d.error||d.errors?.length)throw new Error('BigQuery の検索に失敗しました。');}
 if(!d.jobComplete)throw new Error('BigQuery の検索が時間内に完了しませんでした。');const fields=d.schema?.fields||[];
 return(d.rows||[]).map(row=>Object.fromEntries(fields.map((field,i)=>[field.name,row.f[i]?.v])));
}
