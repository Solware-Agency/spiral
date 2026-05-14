/* eslint-env node */
import { isAllowedRequestOrigin } from '../server/origin.js';
import { getStripeEnv } from '../server/stripe.js';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  if (!isAllowedRequestOrigin(req)) {
    return json(res, 403, { ok: false, error: 'Forbidden' });
  }

  const { secretKey, publishableKey, webhookSecret, siteOrigin, missing, debug } = getStripeEnv();

  return json(res, 200, {
    ok: missing.length === 0,
    vercel: {
      env: String(process.env.VERCEL_ENV || '').trim() || null,
      url: String(process.env.VERCEL_URL || '').trim() || null,
      gitCommitRef: String(process.env.VERCEL_GIT_COMMIT_REF || '').trim() || null,
    },
    stripe: {
      secretKeyPresent: !!secretKey,
      publishableKeyPresent: !!publishableKey,
      webhookSecretPresent: !!webhookSecret,
      siteOriginPresent: !!siteOrigin,
      missing,
      debug,
    },
  });
}
