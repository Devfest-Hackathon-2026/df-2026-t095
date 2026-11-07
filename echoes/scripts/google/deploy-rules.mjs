/** Firestore の保存先を本人の UID に制限するルールを反映します。 */
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
const project='devfest-hackathon-hexagon';
const token=execFileSync('gcloud',['auth','print-access-token','--project',project],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
const source=await readFile('firestore.rules','utf8');
async function api(path,method,body){const r=await fetch(`https://firebaserules.googleapis.com/v1/${path}`,{method,headers,body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error?.message||'ルールを反映できませんでした。');return data;}
const ruleset=await api(`projects/${project}/rulesets`,'POST',{source:{files:[{name:'firestore.rules',content:source}]}});
const releaseName=`projects/${project}/releases/cloud.firestore`;
const check=await fetch(`https://firebaserules.googleapis.com/v1/${releaseName}`,{headers});
if(check.ok)await api(releaseName,'PATCH',{name:releaseName,rulesetName:ruleset.name});
else if(check.status===404)await api(`projects/${project}/releases`,'POST',{name:releaseName,rulesetName:ruleset.name});
else throw new Error('既存のルールを確認できませんでした。');
console.log(JSON.stringify({project,firestoreRules:'本人の保存データのみ読み書き可能。共有は検索条件のみ。',release:releaseName}));
