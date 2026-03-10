import { google } from 'googleapis';
import { DateTime } from 'luxon';

const TZ = 'America/New_York';

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

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
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
  const studioNotificationEmail =
    (process.env.STUDIO_NOTIFICATION_EMAIL || '').trim() || 'andrea@spiralmstudio.com';

  if (!calendarId || !clientEmail || !privateKey) {
    return json(res, 500, {
      ok: false,
      error: 'Calendar integration is not configured',
    });
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

  const plan = body?.plan === 'weekend' ? 'weekend' : body?.plan === 'weekday' ? 'weekday' : null;
  const hours = Number(body?.hours);
  const date = String(body?.date ?? '').trim(); // YYYY-MM-DD
  const time = String(body?.time ?? '').trim(); // 7:00 AM

  const firstName = String(body?.firstName ?? '').trim();
  const lastName = String(body?.lastName ?? '').trim();
  const phone = String(body?.phone ?? '').trim();
  const email = String(body?.email ?? '').trim();

  if (!plan || !Number.isFinite(hours) || hours < 1 || hours > 12 || !date || !time) {
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
  if (plan === 'weekend' && !weekend) {
    return json(res, 400, { ok: false, error: 'Selected date is not a weekend' });
  }
  if (plan === 'weekday' && weekend) {
    return json(res, 400, { ok: false, error: 'Selected date is not a weekday' });
  }

  const dayStart = DateTime.fromObject({ year, month, day }, { zone: TZ }).startOf('day');
  const start = dayStart.set({ hour: t.hour, minute: t.minute, second: 0, millisecond: 0 });
  const end = start.plus({ hours });
  if (!start.isValid || !end.isValid) {
    return json(res, 400, { ok: false, error: 'Invalid date/time' });
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const calendar = google.calendar({ version: 'v3', auth });

  const planLabel = plan === 'weekend' ? 'Weekend' : 'Weekday';
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const summary = `Studio Rental (${planLabel})${displayName ? ` - ${displayName}` : ''}`;
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

    const attendees = [
      ...(email ? [{ email }] : []),
      ...(studioNotificationEmail ? [{ email: studioNotificationEmail }] : []),
    ];

    const resp = await calendar.events.insert({
      calendarId,
      sendUpdates: 'all',
      requestBody: {
        summary,
        description: descriptionLines.join('\n'),
        start: { dateTime: start.toISO(), timeZone: TZ },
        end: { dateTime: end.toISO(), timeZone: TZ },
        attendees,
        guestsCanInviteOthers: false,
        guestsCanModify: false,
        guestsCanSeeOtherGuests: false,
      },
    });

    return json(res, 200, {
      ok: true,
      eventId: resp.data.id,
      htmlLink: resp.data.htmlLink,
    });
  } catch (e) {
    return json(res, 500, {
      ok: false,
      error: 'Failed to create calendar event',
      details: String(e?.message || e),
    });
  }
}

