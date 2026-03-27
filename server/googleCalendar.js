import { google } from 'googleapis';
import { createPrivateKey } from 'node:crypto';

function stripWrappingQuotes(s) {
  const str = String(s ?? '').trim();
  if (
    (str.startsWith('"') && str.endsWith('"') && str.length >= 2) ||
    (str.startsWith("'") && str.endsWith("'") && str.length >= 2)
  ) {
    return str.slice(1, -1);
  }
  return str;
}

function maybeExtractFromJson(raw) {
  const s = String(raw ?? '').trim();
  if (!s.startsWith('{') || !s.includes('private_key')) return null;
  try {
    const obj = JSON.parse(s);
    if (obj && typeof obj.private_key === 'string') return obj.private_key;
  } catch {
    // ignore
  }
  return null;
}

function maybeDecodeBase64(raw) {
  const s = String(raw ?? '').trim();
  if (s.includes('BEGIN') || s.includes('PRIVATE KEY')) return null;
  const compact = s.replace(/\s+/g, '');
  if (compact.length < 100) return null;
  if (!/^[A-Za-z0-9+/=]+$/.test(compact)) return null;
  try {
    const decoded = Buffer.from(compact, 'base64').toString('utf8');
    if (decoded.includes('BEGIN') && decoded.includes('PRIVATE KEY')) return decoded;
  } catch {
    // ignore
  }
  return null;
}

/** Remove invisible characters that break OpenSSL PEM parsing after copy-paste. */
function stripInvisibleUtf8(s) {
  return String(s ?? '')
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .replace(/\u00A0/g, ' ');
}

/**
 * Rebuild a PEM so Node's createPrivateKey accepts it.
 * Hosting env vars often flatten newlines or insert spaces inside the base64 body.
 */
function reformatPemPrivateKey(key) {
  const k = String(key ?? '').trim();
  const rsaBegin = '-----BEGIN RSA PRIVATE KEY-----';
  const rsaEnd = '-----END RSA PRIVATE KEY-----';
  const pkBegin = '-----BEGIN PRIVATE KEY-----';
  const pkEnd = '-----END PRIVATE KEY-----';

  let beginMark;
  let endMark;
  if (k.includes(rsaBegin) && k.includes(rsaEnd)) {
    beginMark = rsaBegin;
    endMark = rsaEnd;
  } else if (k.includes(pkBegin) && k.includes(pkEnd)) {
    beginMark = pkBegin;
    endMark = pkEnd;
  } else {
    return key;
  }

  const start = k.indexOf(beginMark);
  const end = k.indexOf(endMark);
  if (start === -1 || end === -1 || end <= start) return key;

  const afterBegin = start + beginMark.length;
  const body = k.slice(afterBegin, end).replace(/\s+/g, '');
  if (!body.length) return key;

  return `${beginMark}\n${body}\n${endMark}\n`;
}

export function normalizeGooglePrivateKey(envValue) {
  let key = stripWrappingQuotes(envValue);

  const fromJson = maybeExtractFromJson(key);
  if (fromJson) key = fromJson;

  const fromB64 = maybeDecodeBase64(key);
  if (fromB64) key = fromB64;

  key = stripInvisibleUtf8(String(key ?? '').trim());

  // Env panels often store "\n" as two chars; hosting may double-escape
  for (let i = 0; i < 4 && key.includes('\\n'); i += 1) {
    key = key.replace(/\\n/g, '\n');
  }
  key = key.replace(/\r\n/g, '\n');

  key = reformatPemPrivateKey(key);
  return key.trim();
}

export function getCalendarEnv() {
  const calendarId = String(process.env.GOOGLE_CALENDAR_ID || '').trim();
  const clientEmail = String(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY || '';
  const privateKey = normalizeGooglePrivateKey(privateKeyRaw);

  const missing = [
    !calendarId ? 'GOOGLE_CALENDAR_ID' : null,
    !clientEmail ? 'GOOGLE_SERVICE_ACCOUNT_EMAIL' : null,
    !privateKey ? 'GOOGLE_PRIVATE_KEY' : null,
  ].filter(Boolean);

  return { calendarId, clientEmail, privateKey, missing };
}

export function validatePrivateKey(privateKey) {
  try {
    createPrivateKey(privateKey);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: 'Invalid GOOGLE_PRIVATE_KEY format',
      details: String(e?.message || e),
    };
  }
}

export function getCalendarClient({ clientEmail, privateKey }) {
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return google.calendar({ version: 'v3', auth });
}

