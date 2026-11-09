export type RelevanceQuery={id:string;sourceId:string;preferences:string[];destination:string;judgements:Record<string,0|1|2>;reviewed:boolean;tags:string[]};
export type RecordedResult={queryId:string;placeIds:string[];latencyMs?:number;costUsd?:number;fallback?:boolean};
export function evaluateRanking(query:RelevanceQuery,result:RecordedResult,k=3){
 const ids=[...new Set(result.placeIds)].slice(0,k),grades=ids.map(id=>query.judgements[id]??0);
 const dcg=(values:number[])=>values.reduce((sum,grade,i)=>sum+(2**grade-1)/Math.log2(i+2),0);
 const ideal=Object.values(query.judgements).sort((a,b)=>b-a).slice(0,k),idcg=dcg(ideal);
 return{precisionAt3:grades.filter(n=>n>0).length/k,ndcgAt3:idcg?dcg(grades)/idcg:0,unjudged:ids.filter(id=>!(id in query.judgements)).length,returned:ids.length};
}
export function evaluationReport(queries:RelevanceQuery[],results:RecordedResult[],includeProvisional=false){
 const eligible=queries.filter(q=>q.reviewed||includeProvisional),lookup=new Map(results.map(r=>[r.queryId,r]));
 const rows=eligible.map(q=>({queryId:q.id,...evaluateRanking(q,lookup.get(q.id)||{queryId:q.id,placeIds:[]})}));
 const mean=(key:'precisionAt3'|'ndcgAt3')=>rows.length?rows.reduce((sum,row)=>sum+row[key],0)/rows.length:null;
 const latency=eligible.flatMap(q=>{const n=lookup.get(q.id)?.latencyMs;return typeof n==='number'&&Number.isFinite(n)?[n]:[];}).sort((a,b)=>a-b);
 const costs=eligible.flatMap(q=>{const n=lookup.get(q.id)?.costUsd;return typeof n==='number'&&Number.isFinite(n)&&n>=0?[n]:[];});
 const fallbacks=eligible.flatMap(q=>{const r=lookup.get(q.id);return typeof r?.fallback==='boolean'?[Number(r.fallback)]:[];});
 return{status:includeProvisional?'provisional':'human-reviewed',queryCount:rows.length,pendingReview:queries.filter(q=>!q.reviewed).length,precisionAt3:mean('precisionAt3'),ndcgAt3:mean('ndcgAt3'),coverage:rows.length?rows.filter(r=>r.returned>0).length/rows.length:null,unjudgedResults:rows.reduce((sum,row)=>sum+row.unjudged,0),p95LatencyMs:latency.length?latency[Math.ceil(latency.length*.95)-1]:null,meanRecordedCostUsd:costs.length?costs.reduce((sum,n)=>sum+n,0)/costs.length:null,fallbackRate:fallbacks.length?fallbacks.reduce((sum,n)=>sum+n,0)/fallbacks.length:null,rows};
}
