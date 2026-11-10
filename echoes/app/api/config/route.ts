import { preparedPhotoIndex } from '@/lib/photo-index';
import { localCatalog } from '@/lib/catalog';
import { hasGoogleAI, googleProject } from '@/lib/google-auth';
import { hasPlaces } from '@/lib/google-maps';
import { searchPolicy } from '@/lib/search-policy';
export const dynamic = 'force-dynamic';
export async function GET() {
  let firebase = null;
  try {
    const c = JSON.parse(process.env.FIREBASE_WEB_CONFIG || 'null');
    if (c?.apiKey && c?.projectId) firebase = c;
  } catch {}
  const [catalog, index] = await Promise.all([localCatalog(), preparedPhotoIndex()]);
  // 写真検索で比べられる地点の数。準備済みの写真の索引があれば、そちらで数える。
  const photoCount = index
    ? Object.values(index.places).filter(photos => photos.length).length
    : catalog.filter(p => p.image).length;
  const policy = searchPolicy();
  return Response.json(
    {
      candidateCount: catalog.length,
      photoCount,
      saveCosts: policy.saveCosts,
      vision: policy.useVision && Boolean(process.env.GOOGLE_CLOUD_PROJECT),
      bigquery: process.env.BIGQUERY_ENABLED === 'true',
      projectId: googleProject(),
      liveSearch: hasGoogleAI(),
      places: hasPlaces(),
      routes: hasPlaces(),
      translation: Boolean(process.env.GOOGLE_CLOUD_PROJECT),
      mapsKey:
        process.env.GOOGLE_MAPS_BROWSER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      firebase,
      googleSignIn: process.env.FIREBASE_GOOGLE_SIGN_IN === 'true',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
