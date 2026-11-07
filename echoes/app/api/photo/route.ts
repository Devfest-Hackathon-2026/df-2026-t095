import {photoUrl} from '@/lib/google-maps';
export async function GET(request:Request){
 const name=new URL(request.url).searchParams.get('name')||'';
 try{return new Response(null,{status:302,headers:{Location:await photoUrl(name),'Cache-Control':'no-store'}});}
 catch{return new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});}
}
