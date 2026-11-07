import {autocomplete} from '@/lib/google-maps';
export async function GET(request:Request){
 const url=new URL(request.url);const query=url.searchParams.get('q')?.trim()||'';const session=url.searchParams.get('sessionToken')||undefined;
 if(query.length<2)return Response.json({suggestions:[]},{headers:{'Cache-Control':'no-store'}});
 if(query.length>160||session&&session.length>100)return Response.json({error:'地名を短くして、もう一度お試しください。'},{status:400});
 try{return Response.json({suggestions:await autocomplete(query,session)},{headers:{'Cache-Control':'no-store'}});}
 catch(e){return Response.json({error:e instanceof Error?e.message:'場所の候補を取得できませんでした。'},{status:502});}
}
