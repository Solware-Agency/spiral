import Stripe from 'stripe';

function firstNonEmptyEnv(names) {
  for (const name of names) {
    const value = String(process.env[name] || '').trim();
    if (value) return { value, source: name };
  }
  return { value: '', source: null };
}

export function getStripeEnv() {
  const secretKeyResult = firstNonEmptyEnv([
    'STRIPE_SECRET_KEY',
    'STRIPE_API_KEY',
    'STRIPE_SECRETKEY',
    'secretKey',
  ]);
  const publishableKey = String(process.env.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLIC_KEY || '').trim();
  const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  const siteOrigin = String(
    process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_SITE_ORIGIN || process.env.SITE_ORIGIN || ''
  ).trim();
  const secretKey = secretKeyResult.value;

  const missing = [!secretKey ? 'STRIPE_SECRET_KEY' : null].filter(Boolean);
  return {
    secretKey,
    publishableKey,
    webhookSecret,
    siteOrigin,
    missing,
    debug: {
      secretKeySource: secretKeyResult.source,
      triedSecretKeyEnvNames: ['STRIPE_SECRET_KEY', 'STRIPE_API_KEY', 'STRIPE_SECRETKEY', 'secretKey'],
    },
  };
}

export function getStripeClient(secretKey) {
  return new Stripe(secretKey);
}

