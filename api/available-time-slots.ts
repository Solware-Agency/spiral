import { google } from 'googleapis';
import { DateTime } from 'luxon';
import { isAllowedRequestOrigin } from '../server/origin.js';
import { getCalendarClient, getCalendarEnv, validatePrivateKey } from '../server/googleCalendar.js';

const TZ = 'America/New_York';
const BOOKING_CLOSE_HOUR = 22; // 10:00 PM

const TIME_SLOTS = [
  '7:00 AM',
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
  '10:00 PM',
];

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

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
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
    console.error('available-time-slots: missing env', missing);
    return json(res, 500, { ok: false, error: 'Calendar integration is not configured', missing });
  }
  const keyCheck = validatePrivateKey(privateKey);
  if (!keyCheck.ok) {
    console.error('available-time-slots: invalid private key', keyCheck.details);
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

  const date = String(body?.date ?? '').trim(); // YYYY-MM-DD
  const hours = Number(body?.hours);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(hours) || hours <= 0 || hours > 12) {
    return json(res, 400, { ok: false, error: 'Missing or invalid date/hours' });
  }

  const dayStart = DateTime.fromISO(date, { zone: TZ }).startOf('day');
  const todayStart = DateTime.now().setZone(TZ).startOf('day');
  if (dayStart < todayStart) {
    return json(res, 200, { ok: true, available: [] });
  }
  const dayEnd = dayStart.plus({ days: 1 });
  const bookingClose = dayStart.set({ hour: BOOKING_CLOSE_HOUR, minute: 0, second: 0, millisecond: 0 });

  const calendar = getCalendarClient({ clientEmail, privateKey });

  try {
    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin: dayStart.toUTC().toISO(),
        timeMax: dayEnd.toUTC().toISO(),
        timeZone: TZ,
        items: [{ id: calendarId }],
      },
    });

    const busy = fb.data?.calendars?.[calendarId]?.busy ?? [];
    const busyIntervals = busy
      .map((b) => {
        const s = DateTime.fromISO(b.start).setZone(TZ);
        const e = DateTime.fromISO(b.end).setZone(TZ);
        if (!s.isValid || !e.isValid) return null;
        return { start: s, end: e };
      })
      .filter(Boolean);

    const available = TIME_SLOTS.filter((slot) => {
      const t = parseTime12hTo24h(slot);
      if (!t) return false;
      const start = dayStart.set({ hour: t.hour, minute: t.minute, second: 0, millisecond: 0 });
      const end = start.plus({ hours });
      if (end > dayEnd) return false;
      if (end > bookingClose) return false;
      for (const b of busyIntervals) {
        if (overlaps(start, end, b.start, b.end)) return false;
      }
      return true;
    });

    return json(res, 200, { ok: true, available });
  } catch (e) {
    console.error('available-time-slots: failed', e);
    return json(res, 500, {
      ok: false,
      error: 'Failed to read calendar availability',
      details: String(e?.message || e),
    });
  }
}

