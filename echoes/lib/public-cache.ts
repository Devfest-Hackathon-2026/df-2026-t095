import {createHash} from 'node:crypto';
import {mkdir,readFile,rename,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

// Only reusable Commons metadata and public Earth Engine records belong here.
// Never pass user uploads, upload descriptions, or Google Maps content.
const pending=new Map<string,Promise<unknown>>();
export async function cachedPublicData<T>(namespace:string,key:string,load:()=>Promise<T>,valid:(value:unknown)=>value is T,ttlMs=7*86400000):Promise<T>{
 if(!/^[a-z0-9-]+$/.test(namespace))throw new Error('Invalid public cache namespace');
 const digest=createHash('sha256').update(key).digest('hex');
 const dir=resolve(process.cwd(),'.cache',namespace),file=resolve(dir,digest+'.json');
 const identity=namespace+':'+digest;
 const existing=pending.get(identity);if(existing)return existing as Promise<T>;
 const task=(async()=>{
  try{const entry=JSON.parse(await readFile(file,'utf8'));if(entry.schema===1&&entry.expiresAt>Date.now()&&valid(entry.value))return entry.value;}catch{}
  const value=await load();if(!valid(value))return value;
  try{await mkdir(dir,{recursive:true});const temporary=file+'.'+crypto.randomUUID()+'.tmp';await writeFile(temporary,JSON.stringify({schema:1,expiresAt:Date.now()+ttlMs,value}));await rename(temporary,file);}catch{}
  return value;
 })();pending.set(identity,task);
 try{return await task;}finally{pending.delete(identity);}
}
