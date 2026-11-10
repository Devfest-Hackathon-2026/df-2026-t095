/** 検証用の匿名ユーザーで、本人の保存とルールの拒否を確認し、検証データを削除する。 */
const config = JSON.parse(process.env.FIREBASE_WEB_CONFIG || 'null');
if (!config?.apiKey) throw new Error('Firebase が未設定です。');
const headers = { 'Content-Type': 'application/json', Referer: 'http://127.0.0.1:5173/' };
const signed = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${config.apiKey}`,
  { method: 'POST', headers, body: JSON.stringify({ returnSecureToken: true }) },
);
const user = await signed.json();
if (!signed.ok) throw new Error(`匿名認証 ${signed.status}`);
const root = `projects/${config.projectId}/databases/(default)/documents`;
const base = `https://firestore.googleapis.com/v1/${root}`;
const auth = { ...headers, Authorization: `Bearer ${user.idToken}` };
const name = `${root}/users/${user.localId}/favorites/verification-only`;
const commit = await fetch(`${base}:commit`, {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({
    writes: [
      {
        update: {
          name,
          fields: { placeId: { stringValue: 'verification-place' }, sampleId: { stringValue: '' } },
        },
        updateTransforms: [{ fieldPath: 'savedAt', setToServerValue: 'REQUEST_TIME' }],
      },
    ],
  }),
});
const own = await fetch(`https://firestore.googleapis.com/v1/${name}`, { headers: auth });
const other = await fetch(`${base}/users/another-user/favorites/verification-only`, {
  headers: auth,
});
const noAuth = await fetch(`https://firestore.googleapis.com/v1/${name}`, { headers });
const bad = await fetch(`${base}:commit`, {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({
    writes: [
      {
        update: {
          name,
          fields: {
            placeId: { stringValue: 'verification-place' },
            sampleId: { stringValue: '' },
            description: { stringValue: '保存対象外' },
          },
        },
        updateTransforms: [{ fieldPath: 'savedAt', setToServerValue: 'REQUEST_TIME' }],
      },
    ],
  }),
});
const shareName = `${root}/shares/verification${crypto.randomUUID().replaceAll('-', '')}`;
const shareWrite = await fetch(`${base}:commit`, {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({
    writes: [
      {
        update: {
          name: shareName,
          fields: {
            sourcePlaceId: { stringValue: '' },
            sourceSampleId: { stringValue: 'kamo' },
            preferences: { arrayValue: { values: [{ stringValue: 'water' }] } },
            destination: { stringValue: 'ソウル' },
            createdBy: { stringValue: user.localId },
          },
        },
        currentDocument: { exists: false },
        updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
      },
    ],
  }),
});
const shareRead = await fetch(`https://firestore.googleapis.com/v1/${shareName}`, { headers });
const shareData = await shareRead.json();
const shareRestored =
  shareData.fields?.destination?.stringValue === 'ソウル' &&
  shareData.fields?.preferences?.arrayValue?.values?.[0]?.stringValue === 'water';
const shareList = await fetch(`${base}/shares`, { headers: auth });
const shareCleanup = await fetch(`https://firestore.googleapis.com/v1/${shareName}`, {
  method: 'DELETE',
  headers: auth,
});
const cleanup = await fetch(`https://firestore.googleapis.com/v1/${name}`, {
  method: 'DELETE',
  headers: auth,
});
const deleteUser = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${config.apiKey}`,
  { method: 'POST', headers, body: JSON.stringify({ idToken: user.idToken }) },
);
const result = {
  anonymousAuth: signed.status,
  ownerWrite: commit.status,
  ownerRead: own.status,
  otherUserRead: other.status,
  unauthenticatedRead: noAuth.status,
  providerContentWrite: bad.status,
  shareWrite: shareWrite.status,
  publicShareRead: shareRead.status,
  shareRestored,
  shareList: shareList.status,
  shareCleanup: shareCleanup.status,
  cleanup: cleanup.status,
  userCleanup: deleteUser.status,
};
console.log(JSON.stringify(result, null, 2));
if (
  result.ownerWrite !== 200 ||
  result.ownerRead !== 200 ||
  [other, noAuth, bad].some(r => r.status !== 403) ||
  !shareWrite.ok ||
  !shareRead.ok ||
  !shareRestored ||
  shareList.status !== 403 ||
  !shareCleanup.ok ||
  !cleanup.ok ||
  !deleteUser.ok
)
  process.exitCode = 1;
