import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signInErrorMessage } from '../lib/auth-messages.ts';
test('closing the Google window is not reported as an error', () => {
  for (const code of [
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
    'auth/user-cancelled',
  ])
    assert.equal(signInErrorMessage(code), null);
});
test('known sign-in failures explain what to do', () => {
  assert.match(signInErrorMessage('auth/popup-blocked') ?? '', /ポップアップ/);
  assert.match(signInErrorMessage('auth/operation-not-allowed') ?? '', /有効/);
});
test('unknown sign-in failures still show a message', () => {
  assert.ok(signInErrorMessage('auth/something-new'));
});
