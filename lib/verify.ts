import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify a Stripe webhook signature.
 * Header format: "t=timestamp,v1=signature"
 * Stripe docs: https://stripe.com/docs/webhooks/signatures
 */
export function verifyStripe(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  try {
    const parts = signatureHeader.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
    const signature = parts.find(p => p.startsWith('v1='))?.slice(3);

    if (!timestamp || !signature) return false;

    const payload = `${timestamp}.${rawBody}`;
    const expected = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Verify a GitHub webhook signature.
 * Header format: "sha1=signature"
 * GitHub docs: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
 */
export function verifyGitHub(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  try {
    const signature = signatureHeader.replace('sha1=', '');
    const expected = createHmac('sha1', secret)
      .update(rawBody)
      .digest('hex');

    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}
