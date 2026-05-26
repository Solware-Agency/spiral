/** Normalización y validación compartida (cliente + API de checkout). */

const NAME_CHARS = "A-Za-z\\u00C0-\\u024F\\s'\\u2018\\u2019\\u201B-";
const NAME_LETTER = /[A-Za-z\u00C0-\u024F]/;
const NAME_FULL = new RegExp(`^[${NAME_CHARS}]+$`);

export function stripNewlines(value: unknown): string {
  return String(value ?? '').replace(/[\r\n]+/g, ' ');
}

export function normalizeName(value: unknown, maxLen = 40): string {
  const cleaned = stripNewlines(value)
    .normalize('NFC')
    .replace(new RegExp(`[^${NAME_CHARS}]`, 'g'), '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[-'\u2018\u2019\u201B]+/, '')
    .replace(/[-'\u2018\u2019\u201B]+$/, '');
  return cleaned.slice(0, maxLen);
}

export function normalizeEmail(value: unknown, maxLen = 254): string {
  return stripNewlines(value).replace(/\s+/g, '').slice(0, maxLen);
}

export function normalizePhoneDigits(value: unknown, maxLenDigits = 15): string {
  return stripNewlines(value).replace(/[^\d]/g, '').slice(0, maxLenDigits);
}

export function isValidName(value: unknown): boolean {
  const v = String(value ?? '')
    .normalize('NFC')
    .trim();
  if (v.length < 2 || v.length > 40) return false;
  return NAME_LETTER.test(v) && NAME_FULL.test(v);
}

export function isValidEmailStrict(value: unknown): boolean {
  const v = String(value ?? '').trim();
  if (!v || v.length > 254) return false;
  if (/\s/.test(v)) return false;
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v);
}

export function isValidPhoneDigits(value: unknown): boolean {
  const digits = normalizePhoneDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}
