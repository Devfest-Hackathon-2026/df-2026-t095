import { t } from './i18n.ts';
const messages: Record<string, string> = {
  'auth/popup-blocked':
    'ログイン用のウィンドウがブロックされました。ポップアップを許可して、もう一度お試しください。',
  'auth/operation-not-allowed':
    'Google ログインがまだ有効になっていません。Firebase の Authentication で Google を有効にしてください。',
  'auth/unauthorized-domain':
    'このアドレスからは Google ログインを使えません。Firebase の承認済みドメインを確認してください。',
  'auth/network-request-failed':
    'Google と通信できませんでした。接続を確認して、もう一度お試しください。',
};
const cancelled = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
]);
/** 利用者が自分で閉じた場合は、エラーとして見せないので null を返す。 */
export function signInErrorMessage(code: string): string | null {
  if (cancelled.has(code)) return null;
  return t(
    messages[code] || 'Google でログインできませんでした。少し待ってから、もう一度お試しください。',
  );
}
