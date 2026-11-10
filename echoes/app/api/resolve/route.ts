import { requestLocaleFrom, withLocale } from '@/lib/request-locale';
import { localCatalog } from '@/lib/catalog';
import { translateOwnContent } from '@/lib/translate-content';
import { resolveGooglePlace } from '@/lib/google-maps';
import { profilePlace } from '@/lib/google';
async function handlePOST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 2048)
      return Response.json({ error: '場所の指定が長すぎます。' }, { status: 413 });
    const body = JSON.parse(raw);
    if (typeof body?.sampleId === 'string') {
      const sample = (await localCatalog()).find(p => p.id === body.sampleId);
      if (!sample)
        return Response.json({ error: '登録地点が見つかりませんでした。' }, { status: 404 });
      return Response.json(
        { place: await translateOwnContent(sample) },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const query = typeof body?.query === 'string' ? body.query.trim() : undefined;
    const placeId = typeof body?.placeId === 'string' ? body.placeId : undefined;
    const point = body?.location;
    const location =
      point &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      Math.abs(point.lat) <= 90 &&
      Math.abs(point.lng) <= 180
        ? { lat: Number(point.lat), lng: Number(point.lng) }
        : undefined;
    if (
      !(query && query.length >= 2 && query.length <= 200) &&
      !(placeId && /^[A-Za-z0-9_-]{5,256}$/.test(placeId)) &&
      !location
    )
      return Response.json(
        { error: '場所の名前を入れるか、地図から地点を選んでください。' },
        { status: 400 },
      );
    const place = await resolveGooglePlace({
      query,
      placeId,
      location,
      sessionToken:
        typeof body.sessionToken === 'string' ? body.sessionToken.slice(0, 100) : undefined,
    });
    return Response.json(
      { place: body.profile === true ? await profilePlace(place) : place },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof SyntaxError
            ? '場所の指定を読み取れませんでした。'
            : e instanceof Error
              ? e.message
              : '場所を確認できませんでした。',
      },
      { status: e instanceof SyntaxError ? 400 : 502 },
    );
  }
}

export const POST = (request: Request) =>
  withLocale(requestLocaleFrom(request), () => handlePOST(request));
