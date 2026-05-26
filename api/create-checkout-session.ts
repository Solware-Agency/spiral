/* eslint-env node */
/* global Buffer */
import { getRequestOrigin, isAllowedRequestOrigin } from '../server/origin.js';
import { validateCheckoutAccess } from '../server/checkoutAccess.js';
import { parseCheckoutContactBody } from '../server/parseCheckoutContact.js';
import { consumeRateLimit, getClientIp } from '../server/requestSecurity.js';
import { getStripeClient, getStripeEnv } from '../server/stripe.js';

const BOOKING_CLOSE_HOUR = 22; // 10:00 PM
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_ACTION = 'create_checkout_session';

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

function stripNewlines(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ');
}

function normalizeName(value, maxLen = 40) {
  const cleaned = stripNewlines(value)
    .replace(/[^A-Za-z\u00C0-\u024F\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[-']+/, '')
    .replace(/[-']+$/, '');
  return cleaned.slice(0, maxLen);
}

function normalizeEmail(value, maxLen = 254) {
  return stripNewlines(value).replace(/\s+/g, '').slice(0, maxLen);
}

function normalizePhoneDigits(value, maxLenDigits = 15) {
  return stripNewlines(value).replace(/[^\d]/g, '').slice(0, maxLenDigits);
}

function isValidName(value) {
  const v = String(value ?? '').trim();
  if (v.length < 2 || v.length > 40) return false;
  return /[A-Za-z\u00C0-\u024F]/.test(v) && /^[A-Za-z\u00C0-\u024F\s'-]+$/.test(v);
}

function isValidEmailStrict(value) {
  const v = String(value ?? '').trim();
  if (!v || v.length > 254) return false;
  if (/\s/.test(v)) return false;
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v);
}

function isValidPhoneDigits(value) {
  const digits = normalizePhoneDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}

async function verifyTurnstileToken({ token, secret, remoteip }) {
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: remoteip || '',
  });

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await response.json().catch(() => ({}));
  const success = Boolean(data?.success);
  const action = String(data?.action || '').trim();
  return { success, action };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  if (!isAllowedRequestOrigin(req)) {
    return json(res, 403, { ok: false, error: 'Forbidden' });
  }
  try {
    const access = await validateCheckoutAccess(req);
    if (!access.ok) {
      return json(res, access.status || 401, { ok: false, error: access.error || 'Unauthorized' });
    }
  } catch (accessErr) {
    console.error('checkout access validation failed', accessErr);
    return json(res, 500, { ok: false, error: 'Unable to validate request security.' });
  }
  const requestOrigin = getRequestOrigin(req);
  if (!requestOrigin) {
    return json(res, 403, { ok: false, error: 'Missing request origin' });
  }

  const clientIp = getClientIp(req);
  const rateLimit = consumeRateLimit({
    key: `checkout-session:${clientIp}`,
    max: Number(process.env.BOOKING_RATE_LIMIT_MAX || 10),
    windowMs: Number(process.env.BOOKING_RATE_LIMIT_WINDOW_MS || 60_000),
  });
  res.setHeader('X-RateLimit-Limit', String(rateLimit.limit));
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetAt / 1000)));
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return json(res, 429, { ok: false, error: 'Too many requests. Try again shortly.' });
  }

  const { secretKey, siteOrigin, missing, debug } = getStripeEnv();
  if (missing.length) {
    return json(res, 500, {
      ok: false,
      error: 'Stripe integration is not configured',
      missing,
      debug,
    });
  }

  let body;
  try {
    body = await parseBody(req, req.body);
  } catch {
    return json(res, 400, { ok: false, error: 'Invalid JSON' });
  }

  const deployEnv = String(process.env.VERCEL_ENV || process.env.NODE_ENV || '').trim().toLowerCase();
  const isProduction = deployEnv === 'production';

  const hours = Number(body?.hours);
  const date = String(body?.date ?? '').trim();
  const time = String(body?.time ?? '').trim();
  const turnstileToken = String(body?.turnstileToken ?? '').trim();

  const contactResult = parseCheckoutContactBody(
    body,
    { normalizeName, normalizeEmail, normalizePhoneDigits },
    { isProduction }
  );

  if (contactResult.ok === false) {
    return json(res, contactResult.status, { ok: false, error: contactResult.error });
  }

  const { firstName, lastName, phone, email } = contactResult.contact;

  if (!Number.isFinite(hours) || !date || !time) {
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
  if (!isValidName(firstName) || !isValidName(lastName)) {
    return json(res, 400, { ok: false, error: 'Nombre o apellido inválido.' });
  }
  if (!isValidEmailStrict(email)) {
    return json(res, 400, { ok: false, error: 'Email inválido.' });
  }
  if (!isValidPhoneDigits(phone)) {
    return json(res, 400, { ok: false, error: 'Teléfono inválido (10-15 dígitos).' });
  }

  const turnstileSecret = String(process.env.TURNSTILE_SECRET_KEY || '').trim();
  if (isProduction && !turnstileSecret) {
    return json(res, 500, { ok: false, error: 'Security challenge is not configured' });
  }
  if (turnstileSecret) {
    if (!turnstileToken) {
      return json(res, 400, { ok: false, error: 'Completa la verificación de seguridad.' });
    }
    try {
      const challenge = await verifyTurnstileToken({
        token: turnstileToken,
        secret: turnstileSecret,
        remoteip: clientIp,
      });
      if (!challenge.success || (challenge.action && challenge.action !== TURNSTILE_ACTION)) {
        return json(res, 403, { ok: false, error: 'No se pudo validar la verificación de seguridad.' });
      }
    } catch (challengeErr) {
      console.error('turnstile verify failed', challengeErr);
      return json(res, 502, { ok: false, error: 'Security verification unavailable' });
    }
  }

  const dm = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dm) return json(res, 400, { ok: false, error: 'Invalid date' });
  const year = Number(dm[1]);
  const month = Number(dm[2]);
  const day = Number(dm[3]);
  const weekend = isWeekendYMD(year, month, day);
  const plan = weekend ? 'weekend' : 'weekday';

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
    });
  }
}

