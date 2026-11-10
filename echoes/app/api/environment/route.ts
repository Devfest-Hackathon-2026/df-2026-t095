import { requestLocaleFrom, withLocale } from '@/lib/request-locale';
import { climateAt } from '@/lib/climate';
export const runtime = 'nodejs';
async function handleGET(request: Request) {
  const p = new URL(request.url).searchParams;
  const lat = Number(p.get('lat')),
    lng = Number(p.get('lng'));
  if (
    !p.has('lat') ||
    !p.has('lng') ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  )
    return Response.json({ error: '緯度・経度を確認してください。' }, { status: 400 });
  return Response.json(
    { climate: await climateAt(lat, lng) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export const GET = (request: Request) =>
  withLocale(requestLocaleFrom(request), () => handleGET(request));
