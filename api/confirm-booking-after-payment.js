/* eslint-env node */
/* global Buffer */
import { DateTime } from 'luxon';
import { isAllowedRequestOrigin } from '../server/origin.js';
import { getCalendarClient, getCalendarEnv, validatePrivateKey } from '../server/googleCalendar.js';
import {
  getResendClient,
  getResendEnv,
  sendBookingConfirmationEmails,
} from '../server/resend.js';
import { getStripeClient, getStripeEnv } from '../server/stripe.js';

const TZ = 'America/New_York';
const BOOKING_CLOSE_HOUR = 22; // 10:00 PM

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

function isWeekendYMD(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dow = d.getUTCDay(); // 0 Sun..6 Sat
  return dow === 0 || dow === 6;
}

function toGoogleUtcStamp(dt) {
  return dt.toUTC().toFormat("yyyyLLdd'T'HHmmss'Z'");
}

function buildGoogleCalendarTemplateLink({ summary, description, start, end }) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summary,
    details: description,
    dates: `${toGoogleUtcStamp(start)}/${toGoogleUtcStamp(end)}`,
    ctz: TZ,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
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

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

function fail(status, payload) {
  const err = new Error(payload?.error || 'Request failed');
  err.httpStatus = status;
  err.payload = payload;
  throw err;
}

export async function confirmBookingFromSessionId(sessionId) {
  const normalizedSessionId = String(sessionId ?? '').trim();
  if (!normalizedSessionId) {
    fail(400, { ok: false, error: 'Missing Stripe session ID' });
  }

  const stripeEnv = getStripeEnv();
  if (stripeEnv.missing.length) {
    fail(500, {
      ok: false,
      error: 'Stripe integration is not configured',
      missing: stripeEnv.missing,
    });
  }
  const stripe = getStripeClient(stripeEnv.secretKey);

  const { calendarId, clientEmail, privateKey, missing } = getCalendarEnv();
  if (missing.length) {
    fail(500, { ok: false, error: 'Calendar integration is not configured', missing });
  }
  const keyCheck = validatePrivateKey(privateKey);
  if (!keyCheck.ok) {
    fail(500, { ok: false, error: keyCheck.error, details: keyCheck.details });
  }
  const calendar = getCalendarClient({ clientEmail, privateKey });

  const session = await stripe.checkout.sessions.retrieve(normalizedSessionId, {
    expand: ['payment_intent'],
  });
  if (!session || session.mode !== 'payment') {
    fail(400, { ok: false, error: 'Invalid checkout session' });
  }
  if (session.payment_status !== 'paid') {
    fail(402, { ok: false, error: 'El pago no está completado.' });
  }

  const paymentIntent = typeof session.payment_intent === 'string' ? null : session.payment_intent || null;
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null;
  const existingEventId = String(paymentIntent?.metadata?.bookingEventId || '').trim();
  const existingHtmlLink = String(paymentIntent?.metadata?.bookingHtmlLink || '').trim();
  const existingTemplateLink = String(paymentIntent?.metadata?.calendarTemplateLink || '').trim();
  if (existingEventId) {
    return {
      ok: true,
      alreadyProcessed: true,
      eventId: existingEventId,
      htmlLink: existingHtmlLink || null,
      calendarTemplateLink: existingTemplateLink || null,
    };
  }

  const md = paymentIntent?.metadata || session.metadata || {};
  const plan =
    md.bookingPlan === 'weekend' ? 'weekend' : md.bookingPlan === 'weekday' ? 'weekday' : null;
  const hours = Number(md.bookingHours);
  const date = String(md.bookingDate ?? '').trim();
  const time = String(md.bookingTime ?? '').trim();
  const firstName = String(md.bookingFirstName ?? '').trim();
  const lastName = String(md.bookingLastName ?? '').trim();
  const phone = String(md.bookingPhone ?? '').trim();
  const email = String(md.bookingEmail ?? '').trim();

  if (!plan || !Number.isFinite(hours) || hours < 1 || hours > 12 || !date || !time) {
    fail(400, { ok: false, error: 'Booking metadata is invalid in Stripe session' });
  }

  const dm = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dm) fail(400, { ok: false, error: 'Invalid booking date format' });
  const year = Number(dm[1]);
  const month = Number(dm[2]);
  const day = Number(dm[3]);

  const t = parseTime12hTo24h(time);
  if (!t) fail(400, { ok: false, error: 'Invalid booking time format' });

  const weekend = isWeekendYMD(year, month, day);
  if (plan === 'weekend' && !weekend) {
    fail(400, { ok: false, error: 'Selected date is not a weekend' });
  }
  if (plan === 'weekday' && weekend) {
    fail(400, { ok: false, error: 'Selected date is not a weekday' });
  }

  const dayStart = DateTime.fromObject({ year, month, day }, { zone: TZ }).startOf('day');
  const bookingClose = dayStart.set({
    hour: BOOKING_CLOSE_HOUR,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  const start = dayStart.set({ hour: t.hour, minute: t.minute, second: 0, millisecond: 0 });
  const end = start.plus({ hours });
  if (!start.isValid || !end.isValid) {
    fail(400, { ok: false, error: 'Invalid booking date/time' });
  }
  if (end > bookingClose) {
    fail(400, {
      ok: false,
      error: 'La reserva debe finalizar a las 10:00 PM o antes.',
    });
  }

  const planLabel = plan === 'weekend' ? 'Weekend' : 'Weekday';
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const summary = displayName ? `Reserva Studio Spiral — ${displayName}` : 'Reserva Studio Spiral';
  const descriptionLines = [
    'Booking request from website (paid via Stripe).',
    '',
    `Plan: ${planLabel}`,
    `Hours: ${hours}`,
    `Date: ${date}`,
    `Time: ${time}`,
    '',
    'Customer info:',
    `Name: ${displayName || '(not provided)'}`,
    `Email: ${email || '(not provided)'}`,
    `Phone: ${phone || '(not provided)'}`,
    '',
    `Stripe Checkout Session: ${normalizedSessionId}`,
  ];

  // Hard block: don't allow overlaps with existing events.
  const fb = await calendar.freebusy.query({
    requestBody: {
      timeMin: start.toUTC().toISO(),
      timeMax: end.toUTC().toISO(),
      timeZone: TZ,
      items: [{ id: calendarId }],
    },
  });
  const busy = fb.data?.calendars?.[calendarId]?.busy ?? [];
  const hasOverlap = Array.isArray(busy)
    ? busy.some((b) => {
        const s = DateTime.fromISO(b.start).setZone(TZ);
        const e = DateTime.fromISO(b.end).setZone(TZ);
        if (!s.isValid || !e.isValid) return false;
        return overlaps(start, end, s, e);
      })
    : false;
  if (hasOverlap) {
    fail(409, { ok: false, error: 'Ese horario ya está reservado.' });
  }

  const resp = await calendar.events.insert({
    calendarId,
    sendUpdates: 'none',
    requestBody: {
      summary,
      description: descriptionLines.join('\n'),
      start: { dateTime: start.toISO(), timeZone: TZ },
      end: { dateTime: end.toISO(), timeZone: TZ },
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: false,
    },
  });

  const calendarTemplateLink = buildGoogleCalendarTemplateLink({
    summary,
    description: descriptionLines.join('\n'),
    start,
    end,
  });
  const htmlLink = resp?.data?.htmlLink || null;
  const eventId = resp?.data?.id || null;

  const resendEnv = getResendEnv();
  if (!resendEnv.missing.length) {
    const resend = getResendClient(resendEnv.apiKey);
    sendBookingConfirmationEmails({
      resend,
      fromEmail: resendEnv.fromEmail,
      ownerEmail: resendEnv.ownerEmail,
      customerEmail: email,
      customerName: displayName || '(not provided)',
      planLabel,
      hours,
      date,
      time,
      calendarLink: calendarTemplateLink || htmlLink,
      paidViaStripe: true,
    }).catch((err) => {
      console.error('confirm-booking-after-payment: resend failed', err);
    });
  }

  if (paymentIntentId && eventId) {
    try {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          ...(paymentIntent?.metadata || {}),
          bookingEventId: eventId,
          bookingHtmlLink: htmlLink || '',
          calendarTemplateLink,
        },
      });
    } catch (metadataErr) {
      console.error('Unable to persist booking metadata on payment intent', metadataErr);
    }
  }

  return {
    ok: true,
    eventId,
    htmlLink,
    calendarTemplateLink,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  if (!isAllowedRequestOrigin(req)) {
    return json(res, 403, { ok: false, error: 'Forbidden' });
  }

  let body;
  try {
    body = await parseBody(req, req.body);
  } catch {
    return json(res, 400, { ok: false, error: 'Invalid JSON' });
  }

  const sessionId = String(body?.sessionId ?? '').trim();
  try {
    const data = await confirmBookingFromSessionId(sessionId);
    return json(res, 200, data);
  } catch (e) {
    if (e?.payload && Number.isFinite(e?.httpStatus)) {
      return json(res, e.httpStatus, e.payload);
    }
    console.error('confirm-booking-after-payment failed', e);
    return json(res, 500, {
      ok: false,
      error: 'No se pudo confirmar la reserva después del pago.',
      details: String(e?.message || e),
    });
  }
}

