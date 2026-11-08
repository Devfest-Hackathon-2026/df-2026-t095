import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {localCatalog} from './catalog.ts';
import {regionAround} from './geo-region.ts';
import {terrainRegionRecords} from './earth-engine.mjs';
import {bqString,bqTable,queryBigQuery} from './bigquery.ts';
import type {TerrainRecord} from './terrain-ranking.ts';
const path=()=>resolve(process.cwd(),'.cache/terrain-regions-v2.json');
export async function terrainCatalog(){
 if(process.env.BIGQUERY_ENABLED==='true')try{const rows=await queryBigQuery(`SELECT record_json FROM ${bqTable('terrain_regions')} ORDER BY id LIMIT 500`);if(rows.length)return{records:rows.map(r=>JSON.parse(String(r.record_json)) as TerrainRecord),provider:'bigquery' as const};}catch{}
 try{return{records:JSON.parse(await readFile(path(),'utf8')) as TerrainRecord[],provider:'local' as const};}catch{return{records:[] as TerrainRecord[],provider:'local' as const};}
}
export async function refreshTerrainCatalog(){
 const pool=(await localCatalog()).filter(p=>p.landform);const records:TerrainRecord[]=[];
 for(let i=0;i<pool.length;i+=4){const batch=pool.slice(i,i+4).map(p=>({id:p.id,lat:p.lat,lng:p.lng,region:regionAround(p.lat,p.lng,p.referenceHalfKm||2)}));const result=await terrainRegionRecords(batch) as TerrainRecord[];records.push(...result);console.log('terrain regions',records.length,'/',pool.length);}
 await mkdir(resolve(process.cwd(),'.cache'),{recursive:true});await writeFile(path(),JSON.stringify(records));
 if(process.env.BIGQUERY_ENABLED==='true'){
  await queryBigQuery(`CREATE TABLE IF NOT EXISTS ${bqTable('terrain_regions')} (id STRING NOT NULL, record_json STRING, updated_at TIMESTAMP) CLUSTER BY id`);
  await queryBigQuery(`MERGE ${bqTable('terrain_regions')} T USING (SELECT JSON_VALUE(x,'$.id') id,TO_JSON_STRING(x) record_json FROM UNNEST(JSON_QUERY_ARRAY(@records)) x) S ON T.id=S.id WHEN MATCHED THEN UPDATE SET record_json=S.record_json,updated_at=CURRENT_TIMESTAMP() WHEN NOT MATCHED THEN INSERT(id,record_json,updated_at) VALUES(S.id,S.record_json,CURRENT_TIMESTAMP())`,[bqString('records',JSON.stringify(records))]);
 }
 return records;
}
