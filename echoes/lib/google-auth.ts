import {GoogleAuth} from 'google-auth-library';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});
let cached:{token:string;until:number}|undefined;
let pending:Promise<string>|undefined;
export const googleProject=()=>process.env.GOOGLE_CLOUD_PROJECT || 'devfest-hackathon-hexagon';
export function hasGoogleAI(){return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_PROJECT);}
export async function googleAccessToken():Promise<string>{
 if(cached&&cached.until>Date.now())return cached.token;
 if(pending)return pending;
 pending=(async()=>{
  let token:string|null|undefined;
  try{token=await auth.getAccessToken();}catch(error){
   if(process.env.GOOGLE_AUTH_USE_GCLOUD!=='true')throw error;
   const result=await exec(process.env.GCLOUD_COMMAND || 'gcloud',['auth','print-access-token','--project',googleProject(),'--quiet'],{timeout:20000,maxBuffer:1024*1024});
   token=result.stdout.trim();
  }
  if(!token)throw new Error('Google の認証を確認できません。開発環境で gcloud auth login を実行してください。');
  cached={token,until:Date.now()+40*60*1000};return token;
 })();
 try{return await pending;}finally{pending=undefined;}
}
export async function cloudHeaders(){return {'Authorization':`Bearer ${await googleAccessToken()}`,'Content-Type':'application/json','x-goog-user-project':googleProject()};}
