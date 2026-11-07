export async function GET() {
  return Response.json({
    liveSearch: Boolean(process.env.GEMINI_API_KEY),
    mapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_BROWSER_KEY || "",
  }, { headers: { "Cache-Control": "no-store" } });
}
