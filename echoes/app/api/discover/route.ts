import { googleDiscover } from "@/lib/google";
import { isQuality } from "@/lib/discovery";

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: "Live discovery is not configured. The sample collection is ready to explore." }, { status: 503 });
  try {
    const raw = await request.text();
    if (raw.length > 4096) return Response.json({ error: "Please keep your search under 4,096 characters." }, { status: 413 });
    let body;
    try { body = JSON.parse(raw); } catch { return Response.json({ error: "Please send a valid search." }, { status: 400 }); }
    if (!body || typeof body.source !== "string" || body.source.trim().length < 2 || body.source.length > 200 || !Array.isArray(body.preferences) || !body.preferences.length || body.preferences.length > 6 || !body.preferences.every(isQuality) || typeof body.destination !== "string" || body.destination.length > 100) {
      return Response.json({ error: "Choose a source place, a destination, and at least one quality." }, { status: 400 });
    }
    const places = await googleDiscover(body.source.trim(), [...new Set(body.preferences)] as typeof body.preferences, body.destination);
    return Response.json({ places, mode: "live", note: "AI comparisons based on Google Maps sources. Suggested map positions are approximate." }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discovery could not finish. Please try again.";
    if (error instanceof SyntaxError) return Response.json({ error: "Google returned an incomplete comparison. Please try again." }, { status: 502 });
    return Response.json({ error: message.includes("timed out") || message.includes("aborted") ? "This search took too long. Please try again." : message }, { status: 502 });
  }
}
