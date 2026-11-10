import { requestLocaleFrom, withLocale } from '@/lib/request-locale';
import { computeRoute } from '@/lib/google-maps';
function point(p: unknown): p is { lat: number; lng: number } {
  if (!p || typeof p !== 'object') return false;
  const x = p as { lat: unknown; lng: unknown };
  return (
    typeof x.lat === 'number' &&
    typeof x.lng === 'number' &&
    Number.isFinite(x.lat) &&
    Number.isFinite(x.lng) &&
    Math.abs(x.lat) <= 90 &&
    Math.abs(x.lng) <= 180
  );
}
async function handlePOST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 1024)
      return Response.json({ error: '経路の指定を確認してください。' }, { status: 413 });
    const body = JSON.parse(raw);
    if (!point(body?.origin) || !point(body?.destination) || !['WALK', 'DRIVE'].includes(body.mode))
      return Response.json(
        { error: '出発地、目的地、移動方法を確認してください。' },
        { status: 400 },
      );
    return Response.json(await computeRoute(body.origin, body.destination, body.mode), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : '経路を確認できませんでした。' },
      { status: 502 },
    );
  }
}

export const POST = (request: Request) =>
  withLocale(requestLocaleFrom(request), () => handlePOST(request));
