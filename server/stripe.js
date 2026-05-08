import Stripe from 'stripe';

export function getStripeEnv() {
  const secretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
  const publishableKey = String(process.env.STRIPE_PUBLISHABLE_KEY || '').trim();
  const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  const siteOrigin = String(
    process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_SITE_ORIGIN || process.env.SITE_ORIGIN || ''
  ).trim();

  const missing = [!secretKey ? 'STRIPE_SECRET_KEY' : null].filter(Boolean);
  return { secretKey, publishableKey, webhookSecret, siteOrigin, missing };
}

export function getStripeClient(secretKey) {
  return new Stripe(secretKey);
}

