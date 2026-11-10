'use client';
import { t } from '@/lib/i18n';
import { useState } from 'react';
import type { Account } from '@/lib/firebase-client';

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function Avatar({ account, large = false }: { account: Account; large?: boolean }) {
  const [failedUrl, setFailedUrl] = useState('');
  const initial = (account.name || account.email).charAt(0).toUpperCase();
  const className = `account-avatar ${large ? 'account-avatar-large' : ''}`;
  if (!account.photoUrl || failedUrl === account.photoUrl)
    return (
      <span className={className} aria-hidden="true">
        {initial}
      </span>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      className={className}
      src={account.photoUrl}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailedUrl(account.photoUrl)}
    />
  );
}

export function AccountControl({
  account,
  disabled,
  onSignIn,
  onOpen,
}: {
  account: Account | null;
  disabled: boolean;
  onSignIn: () => void;
  onOpen: () => void;
}) {
  if (account)
    return (
      <button
        className="account-button"
        aria-label={t('アカウント：{v0}', { v0: account.name || account.email })}
        title={account.email}
        onClick={onOpen}
      >
        <Avatar account={account} />
      </button>
    );
  return (
    <button
      className="google-signin"
      aria-label={t('Google でログイン')}
      title={t('Google でログイン')}
      disabled={disabled}
      onClick={onSignIn}
    >
      <GoogleMark />
      <span className="google-signin-label">{t('Google でログイン')}</span>
    </button>
  );
}

export function AccountPanel({
  account,
  busy,
  onSignOut,
}: {
  account: Account;
  busy: boolean;
  onSignOut: () => void;
}) {
  return (
    <div className="info-content account-panel">
      <Avatar account={account} large />
      <h2>{account.name || t('ログイン中')}</h2>
      {account.email && <p className="account-email">{account.email}</p>}
      <p>
        {t(
          '保存した場所と検索条件は、この Google アカウントにひもづいています。別の端末でも、同じアカウントでログインすると使えます。',
        )}
      </p>
      <button className="secondary-button" disabled={busy} onClick={onSignOut}>
        {busy ? t('ログアウトしています…') : t('ログアウト')}
      </button>
    </div>
  );
}
