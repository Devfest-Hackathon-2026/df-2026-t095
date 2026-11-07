/** 指定済みの Google Cloud プロジェクトに、ローカル開発用の接続を設定します。 */
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,chmod} from 'node:fs/promises';
const project='devfest-hackathon-hexagon';
const number='723852363488';
const token=execFileSync('gcloud',['auth','print-access-token','--project',project],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json','x-goog-user-project':project};
async function api(url,method='GET',body,allow=[]) {
 const r=await fetch(url,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(60000)});
 const raw=await r.text();let data;try{data=JSON.parse(raw)}catch{data={}}
 if(!r.ok&&!allow.includes(r.status))throw new Error(`${method} ${new URL(url).hostname}: ${r.status} ${data.error?.message||'設定に失敗しました'}`);
 return {status:r.status,data};
}
async function wait(service,operation){
 if(!operation?.name)return operation;
 for(let i=0;i<50;i++){
  const result=(await api(`https://${service}/${operation.name.startsWith('v1')?'':'v1beta1/'}${operation.name}`)).data;
  if(result.done){if(result.error)throw new Error(result.error.message);return result.response;}
  await new Promise(r=>setTimeout(r,1500));
 }
 throw new Error('Google の設定処理が続いています。少し待ってから再実行してください。');
}
const firebase=`https://firebase.googleapis.com/v1beta1/projects/${project}`;
if((await api(firebase,'GET',undefined,[404])).status===404){
 console.log('既存の Cloud プロジェクトに Firebase を追加しています');
 await wait('firebase.googleapis.com',(await api(`${firebase}:addFirebase`,'POST',{})).data);
}
const dbUrl=`https://firestore.googleapis.com/v1/projects/${project}/databases`;
const dbs=(await api(dbUrl)).data.databases||[];
if(!dbs.some(d=>d.name.endsWith('/(default)'))){
 const op=(await api(`${dbUrl}?databaseId=(default)`,'POST',{locationId:'asia-northeast1',type:'FIRESTORE_NATIVE',concurrencyMode:'OPTIMISTIC',appEngineIntegrationMode:'DISABLED'})).data;
 console.log('東京リージョンに Firestore を作成しています');
 for(let i=0;i<45;i++){const r=(await api(`https://firestore.googleapis.com/v1/${op.name}`)).data;if(r.done){if(r.error)throw new Error(r.error.message);break;}await new Promise(r=>setTimeout(r,1500));}
}
let apps=(await api(`${firebase}/webApps`)).data.apps||[];
let app=apps.find(a=>a.displayName==='Elsewhere ウェブ');
if(!app){
 console.log('Firebase のウェブアプリを登録しています');
 await wait('firebase.googleapis.com',(await api(`${firebase}/webApps`,'POST',{displayName:'Elsewhere ウェブ'})).data);
 apps=(await api(`${firebase}/webApps`)).data.apps||[];app=apps.find(a=>a.displayName==='Elsewhere ウェブ');
}
if(!app)throw new Error('Firebase のウェブアプリを確認できませんでした。');
const webConfig=(await api(`https://firebase.googleapis.com/v1beta1/${app.name}/config`)).data;
const authUrl=`https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`;
if((await api(authUrl,'GET',undefined,[404])).status===404){
 await api(`https://identitytoolkit.googleapis.com/v2/projects/${project}/identityPlatform:initializeAuth`,'POST',{});
}
const authConfig=(await api(authUrl)).data;
await api(`${authUrl}?updateMask=signIn.anonymous.enabled,authorizedDomains`,'PATCH',{
 name:`projects/${project}/config`,signIn:{anonymous:{enabled:true}},
 authorizedDomains:[...new Set([...(authConfig.authorizedDomains||[]),'localhost','127.0.0.1',`${project}.firebaseapp.com`])]
});
const referrers=['http://localhost:5173/*','http://127.0.0.1:5173/*','http://localhost:3000/*','http://127.0.0.1:3000/*',`https://${project}.firebaseapp.com/*`];
const keyBase=`https://apikeys.googleapis.com/v2/projects/${number}/locations/global/keys`;
let keys=(await api(keyBase)).data.keys||[];
async function key(displayName,services,browser){
 let k=keys.find(k=>k.displayName===displayName);
 const restrictions={apiTargets:services.map(service=>({service})),...(browser?{browserKeyRestrictions:{allowedReferrers:referrers}}:{})};
 if(!k){
  const op=(await api(keyBase,'POST',{displayName,restrictions})).data;
  for(let i=0;i<30;i++){const r=(await api(`https://apikeys.googleapis.com/v2/${op.name}`)).data;if(r.done){if(r.error)throw new Error(r.error.message);k=r.response;break;}await new Promise(r=>setTimeout(r,1000));}
  if(!k)throw new Error('API キーの作成が完了していません。');
  keys.push(k);
 } else {
  await api(`https://apikeys.googleapis.com/v2/${k.name}?updateMask=restrictions`,'PATCH',{name:k.name,restrictions});
 }
 const value=(await api(`https://apikeys.googleapis.com/v2/${k.name}/keyString`)).data.keyString;
 if(!value)throw new Error('API キーを取得できませんでした。');return value;
}
console.log('用途とローカルの参照元を制限した API キーを設定しています');
const mapsBrowser=await key('Elsewhere ローカル地図',['maps-backend.googleapis.com'],true);
const mapsServer=await key('Elsewhere サーバー検索',['places.googleapis.com','geocoding-backend.googleapis.com','routes.googleapis.com'],false);
const firebaseKey=await key('Elsewhere ローカル認証',['identitytoolkit.googleapis.com','securetoken.googleapis.com','firestore.googleapis.com'],true);
const secrets=`https://secretmanager.googleapis.com/v1/projects/${project}/secrets`;
const secretId='elsewhere-maps-server-key';
if((await api(`${secrets}/${secretId}`,'GET',undefined,[404])).status===404){
 await api(`${secrets}?secretId=${secretId}`,'POST',{replication:{automatic:{}}});
 await api(`${secrets}/${secretId}:addVersion`,'POST',{payload:{data:Buffer.from(mapsServer).toString('base64')}});
}
const existing=await readFile('.env.local','utf8').catch(()=> '');
const values={GOOGLE_CLOUD_PROJECT:project,GOOGLE_CLOUD_LOCATION:'global',GOOGLE_AUTH_USE_GCLOUD:'true',GEMINI_MODEL:'gemini-3.8-flash',GOOGLE_MAPS_BROWSER_KEY:mapsBrowser,GOOGLE_MAPS_SERVER_KEY:mapsServer,FIREBASE_WEB_CONFIG:JSON.stringify({...webConfig,apiKey:firebaseKey}),NEXT_PUBLIC_SITE_URL:'http://127.0.0.1:5173'};
let env=existing;
for(const [name,value] of Object.entries(values)){
 const line=name==='FIREBASE_WEB_CONFIG'?`${name}='${value}'`:`${name}=${JSON.stringify(value)}`;const regex=new RegExp(`^${name}=.*$`,'m');env=regex.test(env)?env.replace(regex,()=>line):env.replace(/\s*$/,'')+'\n'+line+'\n';
}
await writeFile('.env.local',env,{mode:0o600});await chmod('.env.local',0o600);
await writeFile('.firebaserc',JSON.stringify({projects:{default:project}},null,2)+'\n');
await writeFile('firebase.json',JSON.stringify({firestore:{rules:'firestore.rules',indexes:'firestore.indexes.json'}},null,2)+'\n');
console.log(JSON.stringify({project,firebaseApp:app.appId,firestoreRegion:'asia-northeast1',anonymousAuth:true,localConfig:'.env.local',keys:'用途制限済み。値は出力していません。'},null,2));
