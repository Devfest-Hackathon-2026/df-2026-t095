import { googleResolve } from "@/lib/google";
export async function POST(request:Request) {
  if(!process.env.GEMINI_API_KEY) return Response.json({error:"Live place search is not configured. Explore the sample collection instead."},{status:503});
  try {
    const raw=await request.text();
    if(raw.length>1024) return Response.json({error:"Enter a shorter place name."},{status:413});
    const body=JSON.parse(raw);
    if(typeof body?.query!=="string"||body.query.trim().length<2||body.query.length>200) return Response.json({error:"Enter a place name with between 2 and 200 characters."},{status:400});
    const place=await googleResolve(body.query.trim());
    return Response.json({place},{headers:{"Cache-Control":"no-store"}});
  } catch(e) {
    return Response.json({error:e instanceof SyntaxError ? "Enter a valid place search." : e instanceof Error ? e.message : "This place could not be identified. Add a city and try again."},{status:e instanceof SyntaxError?400:502});
  }
}
