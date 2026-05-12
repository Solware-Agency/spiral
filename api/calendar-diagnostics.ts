import { DateTime } from 'luxon';
import { isAllowedRequestOrigin } from '../server/origin.js';
import { getCalendarClient, getCalendarEnv, validatePrivateKey } from '../server/googleCalendar.js';

const TZ = 'America/New_York';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function getQueryValue(req, key) {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    return url.searchParams.get(key);
  } catch {
    return null;
  }
}

function asBooleanFlag(value) {
  const v = String(value ?? '')
    .trim()
    .toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function getGoogleErrorInfo(err) {
  const status = Number(err?.code || err?.response?.status || 0) || null;
  const message = String(err?.message || 'Unknown Google Calendar error');
  const data = err?.response?.data;
  const reason =
    data?.error?.errors?.[0]?.reason ||
    data?.error?.status ||
    data?.error_description ||
    data?.error ||
    null;
  return {
    status,
    message,
    reason: reason ? String(reason) : null,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  if (!isAllowedRequestOrigin(req)) {
    return json(res, 403, { ok: false, error: 'Forbidden' });
  }

  const checkWrite = asBooleanFlag(getQueryValue(req, 'checkWrite'));
  const { calendarId, clientEmail, privateKey, missing } = getCalendarEnv();

  const diagnostics = {
    env: {
      calendarIdPresent: !!calendarId,
      serviceAccountEmailPresent: !!clientEmail,
      privateKeyPresent: !!privateKey,
      missing,
      // Helps detect a typo in Calendar ID (without leaking full value).
      calendarIdPreview: calendarId ? `${calendarId.slice(0, 4)}...${calendarId.slice(-4)}` : null,
    },
    privateKey: { ok: false, error: null, details: null },
    freebusy: { ok: false, error: null, details: null },
    writeCheck: {
      attempted: checkWrite,
      ok: null,
      createdEventId: null,
      cleanedUp: null,
      error: null,
      details: null,
    },
  };

  if (missing.length) {
    return json(res, 500, {
      ok: false,
      stage: 'env',
      error: 'Calendar integration is not configured',
      diagnostics,
    });
  }

  const keyCheck = validatePrivateKey(privateKey);
  diagnostics.privateKey = {
    ok: keyCheck.ok,
    error: keyCheck.ok ? null : keyCheck.error,
    details: keyCheck.ok ? null : keyCheck.details,
  };
  if (!keyCheck.ok) {
    return json(res, 500, {
      ok: false,
      stage: 'private_key',
      error: 'Invalid GOOGLE_PRIVATE_KEY format',
      diagnostics,
    });
  }

  const calendar = getCalendarClient({ clientEmail, privateKey });
  const now = DateTime.now().setZone(TZ);
  const timeMin = now.startOf('minute');
  const timeMax = timeMin.plus({ minutes: 30 });

  try {
    await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toUTC().toISO(),
        timeMax: timeMax.toUTC().toISO(),
        timeZone: TZ,
        items: [{ id: calendarId }],
      },
    });
    diagnostics.freebusy.ok = true;
  } catch (err) {
    const info = getGoogleErrorInfo(err);
    diagnostics.freebusy = {
      ok: false,
      error: 'Failed to read calendar availability',
      details: info,
    };
    return json(res, 500, {
      ok: false,
      stage: 'calendar_access',
      error: 'No access to calendar for freebusy query',
      diagnostics,
    });
  }

  if (checkWrite) {
    let createdEventId = null;
    try {
      const start = timeMin.plus({ minutes: 2 });
      const end = start.plus({ minutes: 5 });
      const createResp = await calendar.events.insert({
        calendarId,
        sendUpdates: 'none',
        requestBody: {
          summary: '[DIAGNOSTIC] Spiral booking write check',
          description:
            'Evento temporal de diagnostico. Si existe, el endpoint pudo escribir en el calendario del owner.',
          start: { dateTime: start.toISO(), timeZone: TZ },
          end: { dateTime: end.toISO(), timeZone: TZ },
        },
      });
      createdEventId = createResp?.data?.id || null;
      diagnostics.writeCheck.createdEventId = createdEventId;
      diagnostics.writeCheck.ok = true;

      if (createdEventId) {
        await calendar.events.delete({
          calendarId,
          eventId: createdEventId,
          sendUpdates: 'none',
        });
        diagnostics.writeCheck.cleanedUp = true;
      } else {
        diagnostics.writeCheck.cleanedUp = false;
      }
    } catch (err) {
      const info = getGoogleErrorInfo(err);
      diagnostics.writeCheck.ok = false;
      diagnostics.writeCheck.error = 'Failed to create diagnostic event';
      diagnostics.writeCheck.details = info;

      if (createdEventId) {
        try {
          await calendar.events.delete({
            calendarId,
            eventId: createdEventId,
            sendUpdates: 'none',
          });
          diagnostics.writeCheck.cleanedUp = true;
        } catch {
          diagnostics.writeCheck.cleanedUp = false;
        }
      }

      return json(res, 500, {
        ok: false,
        stage: 'write_permission',
        error: 'Service account cannot create events in this calendar',
        diagnostics,
      });
    }
  }

  return json(res, 200, {
    ok: true,
    message: checkWrite
      ? 'Calendar diagnostics passed (read + write).'
      : 'Calendar diagnostics passed (read access). Add ?checkWrite=1 to verify event creation permission.',
    diagnostics,
  });
}

