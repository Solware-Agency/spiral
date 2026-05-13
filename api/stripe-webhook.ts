/* eslint-env node */
/* global Buffer */
import { getStripeClient, getStripeEnv } from '../server/stripe.js';
import { confirmBookingFromSessionId } from './confirm-booking-after-payment.js';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const { secretKey, webhookSecret, missing, debug } = getStripeEnv();
  if (missing.length) {
    return json(res, 500, {
      ok: false,
      error: 'Stripe integration is not configured',
      missing,
      debug,
    });
  }
  if (!webhookSecret) {
    return json(res, 500, {
      ok: false,
      error: 'Missing STRIPE_WEBHOOK_SECRET',
    });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch {
    return json(res, 400, { ok: false, error: 'Invalid webhook body' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') {
    return json(res, 400, { ok: false, error: 'Missing Stripe signature header' });
  }

  const stripe = getStripeClient(secretKey);
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return json(res, 400, {
      ok: false,
      error: 'Invalid Stripe webhook signature',
      details: String(err?.message || err),
    });
  }

  // Only this event should trigger booking confirmation.
  if (event.type !== 'checkout.session.completed') {
    return json(res, 200, { ok: true, received: true, ignored: true, type: event.type });
  }

  const session = event.data?.object;
  const sessionId = String(session?.id || '').trim();
  if (!sessionId) {
    return json(res, 400, { ok: false, error: 'Missing checkout session id in webhook event' });
  }

  try {
    const result = await confirmBookingFromSessionId(sessionId);
    return json(res, 200, { ok: true, received: true, type: event.type, result });
  } catch (e) {
    // Non-retriable validation/business errors -> acknowledge webhook so Stripe won't retry forever.
    if (e?.payload && Number.isFinite(e?.httpStatus) && e.httpStatus < 500) {
      return json(res, 200, {
        ok: true,
        received: true,
        type: event.type,
        handledWithWarning: true,
        warning: e.payload,
      });
    }
    console.error('stripe-webhook: failed to confirm booking', e);
    return json(res, 500, {
      ok: false,
      error: 'Webhook processing failed',
      details: String(e?.message || e),
    });
  }
}

