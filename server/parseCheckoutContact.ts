import {
  decryptBookingContact,
  isBookingContactEnvelope,
  pemFromEnv,
  type BookingContactPayload,
} from './bookingContactCrypto.js';

type NormalizeFns = {
  normalizeName: (value: unknown, maxLen?: number) => string;
  normalizeEmail: (value: unknown, maxLen?: number) => string;
  normalizePhoneDigits: (value: unknown, maxLenDigits?: number) => string;
};

export function parseCheckoutContactBody(
  body: Record<string, unknown> | null | undefined,
  normalize: NormalizeFns,
  options: { isProduction: boolean }
): { ok: true; contact: BookingContactPayload } | { ok: false; error: string; status: number } {
  const envelope = body?.contact;

  if (isBookingContactEnvelope(envelope)) {
    const privateKeyPem = pemFromEnv(String(process.env.CHECKOUT_CONTACT_PRIVATE_KEY || ''));
    if (!privateKeyPem.includes('BEGIN PRIVATE KEY')) {
      return {
        ok: false,
        status: 500,
        error: 'Contact encryption is not configured on the server',
      };
    }
    try {
      const decrypted = decryptBookingContact(privateKeyPem, envelope);
      return {
        ok: true,
        contact: {
          firstName: normalize.normalizeName(decrypted.firstName),
          lastName: normalize.normalizeName(decrypted.lastName),
          phone: normalize.normalizePhoneDigits(decrypted.phone),
          email: normalize.normalizeEmail(decrypted.email),
        },
      };
    } catch (err) {
      console.error('checkout contact decrypt failed', err);
      return { ok: false, status: 400, error: 'Invalid encrypted contact payload' };
    }
  }

  const allowPlaintext =
    !options.isProduction || String(process.env.CHECKOUT_ALLOW_PLAINTEXT_CONTACT || '') === '1';

  if (allowPlaintext && body && typeof body === 'object') {
    return {
      ok: true,
      contact: {
        firstName: normalize.normalizeName(body.firstName),
        lastName: normalize.normalizeName(body.lastName),
        phone: normalize.normalizePhoneDigits(body.phone),
        email: normalize.normalizeEmail(body.email),
      },
    };
  }

  return {
    ok: false,
    status: 400,
    error: 'Missing encrypted contact payload',
  };
}
