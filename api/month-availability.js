import { google } from 'googleapis';
import { DateTime } from 'luxon';

const TZ = 'America/New_York';

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

function isWeekendDateTime(dt) {
  // Luxon: weekday 1..7, where 6=Sat, 7=Sun
  return dt.weekday === 6 || dt.weekday === 7;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const origin = req.headers.origin || '';
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return json(res, 403, { ok: false, error: 'Forbidden' });
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!calendarId || !clientEmail || !privateKey) {
    return json(res, 500, { ok: false, error: 'Calendar integration is not configured' });
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

  const ym = String(body?.month ?? '').trim(); // YYYY-MM
  const hours = Number(body?.hours);
  const plan =
    body?.plan === 'weekend' ? 'weekend' : body?.plan === 'weekday' ? 'weekday' : null;

  if (!/^\d{4}-\d{2}$/.test(ym) || !Number.isFinite(hours) || hours <= 0 || hours > 12 || !plan) {
    return json(res, 400, { ok: false, error: 'Missing or invalid month/hours/plan' });
  }

  const monthStart = DateTime.fromISO(`${ym}-01`, { zone: TZ }).startOf('month');
  if (!monthStart.isValid) return json(res, 400, { ok: false, error: 'Invalid month' });
  const monthEndExclusive = monthStart.plus({ months: 1 });

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin: monthStart.toUTC().toISO(),
        timeMax: monthEndExclusive.toUTC().toISO(),
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

    const availability = {};

    for (let day = 0; day < monthStart.daysInMonth; day += 1) {
      const dateStart = monthStart.plus({ days: day }).startOf('day');
      const isWeekend = isWeekendDateTime(dateStart);
      const planOk = plan === 'weekend' ? isWeekend : !isWeekend;
      const ymd = dateStart.toISODate(); // YYYY-MM-DD

      if (!planOk) {
        availability[ymd] = false;
        continue;
      }

      const dateEnd = dateStart.plus({ days: 1 });

      let hasAny = false;
      for (const slot of TIME_SLOTS) {
        const t = parseTime12hTo24h(slot);
        if (!t) continue;
        const start = dateStart.set({ hour: t.hour, minute: t.minute, second: 0, millisecond: 0 });
        const end = start.plus({ hours });
        if (end > dateEnd) continue;

        let blocked = false;
        for (const b of busyIntervals) {
          if (overlaps(start, end, b.start, b.end)) {
            blocked = true;
            break;
          }
        }
        if (!blocked) {
          hasAny = true;
          break;
        }
      }

      availability[ymd] = hasAny;
    }

    return json(res, 200, { ok: true, availability });
  } catch (e) {
    return json(res, 500, {
      ok: false,
      error: 'Failed to read calendar availability',
      details: String(e?.message || e),
    });
  }
}

