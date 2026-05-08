/* eslint-env node */
/* global Buffer */
import { isAllowedRequestOrigin } from '../server/origin.js';
import { getStripeClient, getStripeEnv } from '../server/stripe.js';

const BOOKING_CLOSE_HOUR = 22; // 10:00 PM

const RATE_TABLE = {
  weekday: { 2: 160, 3: 240, 4: 320, 5: 390, 6: 460, 7: 530, 8: 600 },
  weekend: { 2: 170, 3: 245, 4: 330, 5: 395, 6: 465, 7: 530, 8: 600 },
};

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseTime12hTo24h(timeStr) {
  const s = String(timeStr ?? '').trim().toUpperCase();
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = m[3];
  if (h < 1 || h > 12 || min < 0 || min > 59) return null;
  if (ap === 'AM') {
    if (h === 12) h = 0;
  } else if (ap === 'PM') {
    if (h !== 12) h += 12;
  }
  return { hour: h, minute: min };
}

function endsBeforeClose(timeStr, durationHours) {
  const t = parseTime12hTo24h(timeStr);
  if (!t || !Number.isFinite(durationHours) || durationHours <= 0) return false;
  const endMinutes = (t.hour + durationHours) * 60 + t.minute;
  return endMinutes <= BOOKING_CLOSE_HOUR * 60;
}

function isWeekendYMD(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dow = d.getUTCDay(); // 0 Sun..6 Sat
  return dow === 0 || dow === 6;
}

function normalizeOrigin(origin) {
  try {
    const u = new URL(String(origin));
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}

function getRequestBaseOrigin(req, envOrigin) {
  const fromHeader = normalizeOrigin(req?.headers?.origin || '');
  if (fromHeader) return fromHeader;
  const fromEnv = normalizeOrigin(envOrigin || '');
  return fromEnv;
}

function parseBody(req, fallbackBody) {
  if (fallbackBody) return Promise.resolve(fallbackBody);
  return new Promise(async (resolve, reject) => {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    } catch (err) {
      reject(err);
    }
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  if (!isAllowedRequestOrigin(req)) {
    return json(res, 403, { ok: false, error: 'Forbidden' });
  }

  const { secretKey, siteOrigin, missing } = getStripeEnv();
  if (missing.length) {
    return json(res, 500, {
      ok: false,
      error: 'Stripe integration is not configured',
      missing,
    });
  }

  let body;
  try {
    body = await parseBody(req, req.body);
  } catch {
    return json(res, 400, { ok: false, error: 'Invalid JSON' });
  }

  const plan = body?.plan === 'weekend' ? 'weekend' : body?.plan === 'weekday' ? 'weekday' : null;
  const hours = Number(body?.hours);
  const date = String(body?.date ?? '').trim();
  const time = String(body?.time ?? '').trim();
  const firstName = String(body?.firstName ?? '').trim();
  const lastName = String(body?.lastName ?? '').trim();
  const phone = String(body?.phone ?? '').trim();
  const email = String(body?.email ?? '').trim();

  if (!plan || !Number.isFinite(hours) || !date || !time) {
    return json(res, 400, { ok: false, error: 'Missing booking fields' });
  }
  if (!Number.isInteger(hours) || hours < 2 || hours > 8) {
    return json(res, 400, { ok: false, error: 'Invalid hours' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json(res, 400, { ok: false, error: 'Invalid date format' });
  }
  if (!parseTime12hTo24h(time)) {
    return json(res, 400, { ok: false, error: 'Invalid time format' });
  }
  if (!endsBeforeClose(time, hours)) {
    return json(res, 400, { ok: false, error: 'La reserva debe finalizar a las 10:00 PM o antes.' });
  }

  const dm = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dm) return json(res, 400, { ok: false, error: 'Invalid date' });
  const year = Number(dm[1]);
  const month = Number(dm[2]);
  const day = Number(dm[3]);
  const weekend = isWeekendYMD(year, month, day);
  if (plan === 'weekend' && !weekend) {
    return json(res, 400, { ok: false, error: 'Selected date is not a weekend' });
  }
  if (plan === 'weekday' && weekend) {
    return json(res, 400, { ok: false, error: 'Selected date is not a weekday' });
  }

  const amount = RATE_TABLE[plan]?.[hours];
  if (!Number.isFinite(amount)) {
    return json(res, 400, { ok: false, error: 'Invalid plan/hours combination' });
  }

  const baseOrigin = getRequestBaseOrigin(req, siteOrigin);
  if (!baseOrigin) {
    return json(res, 500, {
      ok: false,
      error: 'Site origin is not configured for Stripe redirects',
    });
  }

  try {
    const stripe = getStripeClient(secretKey);
    const planLabel = plan === 'weekend' ? 'WEEKEND' : 'WEEKDAY';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${baseOrigin}/book-now?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseOrigin}/book-now?payment=cancelled`,
      customer_email: email || undefined,
      billing_address_collection: 'auto',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `CASA STUDIO ${planLabel} (${hours} HOURS)`,
              description: `${date} at ${time}`,
            },
          },
        },
      ],
      payment_intent_data: {
        metadata: {
          bookingPlan: plan,
          bookingHours: String(hours),
          bookingDate: date,
          bookingTime: time,
          bookingFirstName: firstName,
          bookingLastName: lastName,
          bookingPhone: phone,
          bookingEmail: email,
        },
      },
      metadata: {
        bookingPlan: plan,
        bookingHours: String(hours),
        bookingDate: date,
        bookingTime: time,
      },
    });

    return json(res, 200, { ok: true, id: session.id, url: session.url });
  } catch (e) {
    console.error('create-checkout-session failed', e);
    return json(res, 500, {
      ok: false,
      error: 'No se pudo iniciar el pago con Stripe.',
      details: String(e?.message || e),
    });
  }
}

