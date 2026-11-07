/** キーを出力せず、公開の地名を使って Google 接続を確かめます。 */
import {execFileSync} from 'node:child_process';
const project=process.env.GOOGLE_CLOUD_PROJECT;
if(!project)throw new Error('Google Cloud プロジェクトが未設定です。');
const token=execFileSync('gcloud',['auth','print-access-token','--project',project],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const model=process.env.GEMINI_MODEL||'gemini-3.8-flash';
const r=await fetch(`https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}:generateContent`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','x-goog-user-project':project},body:JSON.stringify({contents:[{role:'user',parts:[{text:'Google Maps を参照し、京都の鴨川で散歩できる具体的な場所を一つ、日本語で簡潔に教えてください。'}]}],tools:[{googleMaps:{}}],generationConfig:{temperature:0.2,maxOutputTokens:1000}}),signal:AbortSignal.timeout(60000)});
const data=await r.json();
if(!r.ok){console.log(JSON.stringify({service:'Vertex AI + Google Maps',status:r.status,error:data.error?.message}));process.exitCode=1;}
else{console.log(JSON.stringify({service:'Vertex AI + Google Maps',status:r.status,model,answer:data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').slice(0,180),sources:data.candidates?.[0]?.groundingMetadata?.groundingChunks?.length||0},null,2));}
