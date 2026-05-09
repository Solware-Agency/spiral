/* eslint-env node */
/* global process, Buffer */
import { google } from 'googleapis';
import { DateTime } from 'luxon';
import { isAllowedRequestOrigin } from '../server/origin.js';
import { getCalendarClient, getCalendarEnv, validatePrivateKey } from '../server/googleCalendar.js';
import {
  getResendClient,
  getResendEnv,
  sendBookingConfirmationEmails,
} from '../server/resend.js';

const TZ = 'America/New_York';
const BOOKING_CLOSE_HOUR = 22; // 10:00 PM

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseTime12hTo24h(timeStr) {
  // Expected: "7:00 AM", "12:30 PM"
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
  // dayOfWeek based on UTC noon to avoid DST edge; weekend definition is calendar day.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  if (!isAllowedRequestOrigin(req)) {
    return json(res, 403, { ok: false, error: 'Forbidden' });
  }

  const { calendarId, clientEmail, privateKey, missing } = getCalendarEnv();

  if (missing.length) {
    console.error('create-booking-event: missing env', missing);
    return json(res, 500, {
      ok: false,
      error: 'Calendar integration is not configured',
      missing,
    });
  }
  const keyCheck = validatePrivateKey(privateKey);
  if (!keyCheck.ok) {
    console.error('create-booking-event: invalid private key', keyCheck.details);
    return json(res, 500, { ok: false, error: keyCheck.error, details: keyCheck.details });
  }

  let body = req.body;
  if (!body) {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      return json(res, 400, { ok: false, error: 'Invalid JSON' });
    }
  }

  const hours = Number(body?.hours);
  const date = String(body?.date ?? '').trim(); // YYYY-MM-DD
  const time = String(body?.time ?? '').trim(); // 7:00 AM

  const firstName = String(body?.firstName ?? '').trim();
  const lastName = String(body?.lastName ?? '').trim();
  const phone = String(body?.phone ?? '').trim();
  const email = String(body?.email ?? '').trim();

  if (!Number.isFinite(hours) || hours < 1 || hours > 12 || !date || !time) {
    return json(res, 400, { ok: false, error: 'Missing or invalid booking fields' });
  }

  const dm = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dm) return json(res, 400, { ok: false, error: 'Invalid date format' });
  const year = Number(dm[1]);
  const month = Number(dm[2]);
  const day = Number(dm[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return json(res, 400, { ok: false, error: 'Invalid date' });
  }

  const t = parseTime12hTo24h(time);
  if (!t) return json(res, 400, { ok: false, error: 'Invalid time format' });

  const weekend = isWeekendYMD(year, month, day);
  const plan = weekend ? 'weekend' : 'weekday';

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
    return json(res, 400, { ok: false, error: 'Invalid date/time' });
  }
  if (end > bookingClose) {
    return json(res, 400, {
      ok: false,
      error: 'La reserva debe finalizar a las 10:00 PM o antes.',
    });
  }

  const calendar = getCalendarClient({ clientEmail, privateKey });

  const planLabel = plan === 'weekend' ? 'Weekend' : 'Weekday';
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const summary = displayName
    ? `Reserva Studio Spiral — ${displayName}`
    : 'Reserva Studio Spiral';
  const descriptionLines = [
    'Booking request from website.',
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
  ];

  try {
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
    if (Array.isArray(busy) && busy.length > 0) {
      return json(res, 409, { ok: false, error: 'Ese horario ya está reservado.' });
    }

    // Service accounts cannot set `attendees` (Calendar invites) without Google
    // Workspace domain-wide delegation. Contact data stays in `description`.
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
    const description = descriptionLines.join('\n');
    const calendarTemplateLink = buildGoogleCalendarTemplateLink({
      summary,
      description,
      start,
      end,
    });
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
        calendarLink: calendarTemplateLink || resp.data.htmlLink || null,
        paidViaStripe: false,
      }).catch((err) => {
        console.error('create-booking-event: resend failed', err);
      });
    }

    return json(res, 200, {
      ok: true,
      eventId: resp.data.id,
      htmlLink: resp.data.htmlLink,
      calendarTemplateLink,
    });
  } catch (e) {
    console.error('create-booking-event: failed', e);
    return json(res, 500, {
      ok: false,
      error: 'Failed to create calendar event',
      details: String(e?.message || e),
    });
  }
}

