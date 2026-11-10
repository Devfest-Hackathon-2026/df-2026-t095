import { requestLocaleFrom, withLocale } from '@/lib/request-locale';
import { parseSearchFilters } from '@/lib/climate-types';
import { isQuality } from '@/lib/discovery';
import {
  uploadedVisualDiscovery,
  hydrateVisualResults,
  fastUploadDeps,
} from '@/lib/visual-discovery';
import { InputError, maxUploadBytes, prepareUpload, readLimitedBody } from '@/lib/upload-image';
import type { Quality } from '@/lib/places';
import { translateOwnContent } from '@/lib/translate-content';
export const runtime = 'nodejs';
let active = 0;
async function handlePOST(request: Request) {
  if (active >= 2)
    return Response.json(
      { error: '写真の解析が混み合っています。少し待ってお試しください。' },
      { status: 429 },
    );
  active++;
  try {
    const origin = request.headers.get('origin');
    const allowedOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin;
    if (origin && origin !== allowedOrigin)
      throw new InputError('このアプリの画面から写真を選び直してください。', 403);
    if (!request.headers.get('content-type')?.startsWith('multipart/form-data'))
      throw new InputError('写真を選んでください。');
    const raw = await readLimitedBody(request, maxUploadBytes + 65536);
    let form: FormData;
    try {
      form = await new Request(request.url, {
        method: 'POST',
        headers: { 'Content-Type': request.headers.get('content-type')! },
        body: new Uint8Array(raw),
      }).formData();
    } catch {
      throw new InputError('写真の送信内容を読み込めませんでした。選び直してください。');
    }
    const file = form.get('photo');
    if (!(file instanceof File)) throw new InputError('写真を選んでください。');
    if (form.get('rights') !== 'confirmed')
      throw new InputError('画像解析に利用できる写真を選び、確認欄にチェックしてください。');
    let preferences: unknown;
    try {
      preferences = JSON.parse(String(form.get('preferences') || ''));
    } catch {
      throw new InputError('好きな特徴を選んでください。');
    }
    const destination = form.get('destination'),
      weight = Number(form.get('visualWeight'));
    if (
      !Array.isArray(preferences) ||
      !preferences.length ||
      preferences.length > 6 ||
      !preferences.every(isQuality) ||
      typeof destination !== 'string' ||
      destination.length > 100 ||
      form.get('visualWeight') === null ||
      !Number.isFinite(weight) ||
      weight < 0 ||
      weight > 1
    )
      throw new InputError('検索条件を確認してください。');
    let filters;
    try {
      filters = parseSearchFilters(JSON.parse(String(form.get('filters') || 'null')));
    } catch (e) {
      throw new InputError(e instanceof Error ? e.message : '絞り込み条件を確認してください。');
    }
    const prepared = await prepareUpload(Buffer.from(await file.arrayBuffer()), file.type);
    const result = await translateOwnContent(
      await uploadedVisualDiscovery(
        prepared.data,
        preferences as Quality[],
        destination,
        weight,
        form.get('fast') === 'true' ? fastUploadDeps : undefined,
        filters,
      ),
    );
    const hydrated =
      result.visualSearch.mode === 'visual' ? await hydrateVisualResults(result) : result;
    return Response.json(hydrated, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof InputError
            ? e.message
            : e instanceof Error && /気候区分/.test(e.message)
              ? e.message
              : '写真の解析を完了できませんでした。もう一度お試しください。',
      },
      {
        status:
          e instanceof InputError
            ? e.status
            : e instanceof Error && /気候区分/.test(e.message)
              ? 400
              : 502,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } finally {
    active--;
  }
}

export const POST = (request: Request) =>
  withLocale(requestLocaleFrom(request), () => handlePOST(request));
