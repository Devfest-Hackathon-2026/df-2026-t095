import { requestLocaleFrom, withLocale } from '@/lib/request-locale';
import { candidateCatalog } from '@/lib/catalog';
import { withCommonsPhoto } from '@/lib/commons';
import { preparedPhotoIndex } from '@/lib/photo-index';
import { translateOwnContent } from '@/lib/translate-content';

export const runtime = 'nodejs';

/** 共有された写真検索の結果を、登録カタログの ID から表示する。有料の API は呼ばない。 */
async function handleGET(request: Request) {
  const ids = (new URL(request.url).searchParams.get('ids') || '').split(',').filter(Boolean);
  if (!ids.length || ids.length > 12 || !ids.every(id => /^[A-Za-z0-9_.:-]{1,100}$/.test(id)))
    return Response.json({ error: '共有された結果を確認できませんでした。' }, { status: 400 });
  const [{ places }, index] = await Promise.all([candidateCatalog(), preparedPhotoIndex()]);
  const byId = new Map(places.map(place => [place.id, place]));
  const found = ids.flatMap(id => {
    const place = byId.get(id);
    if (!place) return [];
    const photo = index?.places[id]?.[0]?.photo;
    return [photo && !place.commonsPhoto ? withCommonsPhoto(place, photo) : place];
  });
  return Response.json(
    { places: await translateOwnContent(found) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export const GET = (request: Request) =>
  withLocale(requestLocaleFrom(request), () => handleGET(request));
