import test from 'node:test';
import assert from 'node:assert';
import { createHmac } from 'crypto';
import { verifyStripe, verifyGitHub } from '../lib/verify';

// ─── Stripe Verification ──────────────────────────────────────────

test('verifyStripe: valid signature returns true', () => {
  const secret = 'whsec_test_secret_key_123';
  const body = '{"type":"checkout.session.completed","id":"evt_123"}';
  const timestamp = '1686000000';

  const payload = `${timestamp}.${body}`;
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  const header = `t=${timestamp},v1=${signature}`;

  assert.strictEqual(verifyStripe(body, header, secret), true);
});

test('verifyStripe: tampered body returns false', () => {
  const secret = 'whsec_test_secret_key_123';
  const body = '{"type":"checkout.session.completed","id":"evt_123"}';
  const timestamp = '1686000000';

  const payload = `${timestamp}.${body}`;
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  const header = `t=${timestamp},v1=${signature}`;

  const tamperedBody = '{"type":"checkout.session.completed","id":"evt_HACKED"}';
  assert.strictEqual(verifyStripe(tamperedBody, header, secret), false);
});

test('verifyStripe: missing timestamp returns false', () => {
  const secret = 'whsec_test_secret_key_123';
  const body = '{"test": true}';
  const header = 'v1=abc123';
  assert.strictEqual(verifyStripe(body, header, secret), false);
});

test('verifyStripe: missing signature returns false', () => {
  const secret = 'whsec_test_secret_key_123';
  const body = '{"test": true}';
  const header = 't=1686000000';
  assert.strictEqual(verifyStripe(body, header, secret), false);
});

test('verifyStripe: wrong secret returns false', () => {
  const secret = 'whsec_correct_secret';
  const wrongSecret = 'whsec_wrong_secret';
  const body = '{"test": true}';
  const timestamp = '1686000000';

  const payload = `${timestamp}.${body}`;
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  const header = `t=${timestamp},v1=${signature}`;

  assert.strictEqual(verifyStripe(body, header, wrongSecret), false);
});

test('verifyStripe: empty header returns false (no crash)', () => {
  assert.strictEqual(verifyStripe('body', '', 'secret'), false);
});

// ─── GitHub Verification ──────────────────────────────────────────

test('verifyGitHub: valid signature returns true', () => {
  const secret = 'github_webhook_secret_123';
  const body = '{"action":"push","ref":"refs/heads/main"}';
  const signature = createHmac('sha1', secret).update(body).digest('hex');
  const header = `sha1=${signature}`;

  assert.strictEqual(verifyGitHub(body, header, secret), true);
});

test('verifyGitHub: tampered body returns false', () => {
  const secret = 'github_webhook_secret_123';
  const body = '{"action":"push","ref":"refs/heads/main"}';
  const signature = createHmac('sha1', secret).update(body).digest('hex');
  const header = `sha1=${signature}`;

  const tampered = '{"action":"push","ref":"refs/heads/evil"}';
  assert.strictEqual(verifyGitHub(tampered, header, secret), false);
});

test('verifyGitHub: wrong secret returns false', () => {
  const secret = 'correct_secret';
  const body = '{"test": true}';
  const signature = createHmac('sha1', secret).update(body).digest('hex');
  const header = `sha1=${signature}`;

  assert.strictEqual(verifyGitHub(body, header, 'wrong_secret'), false);
});

test('verifyGitHub: invalid hex in signature returns false (no crash)', () => {
  assert.strictEqual(verifyGitHub('body', 'sha1=not_valid_hex_zzzz', 'secret'), false);
});

test('verifyGitHub: empty inputs return false (no crash)', () => {
  assert.strictEqual(verifyGitHub('', '', ''), false);
});
