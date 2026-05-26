import {
  decryptBookingContact,
  isBookingContactEnvelope,
  pemFromEnv,
  type BookingContactPayload,
} from './bookingContactCrypto.js';
import { isValidName, normalizeEmail, normalizeName, normalizePhoneDigits } from '../shared/bookingFields.js';

export function parseCheckoutContactBody(
  body: Record<string, unknown> | null | undefined
): { ok: true; contact: BookingContactPayload } | { ok: false; error: string; status: number } {
  const hasContactField = body != null && typeof body === 'object' && 'contact' in body;

  if (hasContactField) {
    const envelope = body?.contact;
    if (!isBookingContactEnvelope(envelope)) {
      return {
        ok: false,
        status: 400,
        error: 'Formato de contacto cifrado inválido.',
      };
    }

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
      const contact: BookingContactPayload = {
        firstName: normalizeName(decrypted.firstName),
        lastName: normalizeName(decrypted.lastName),
        phone: normalizePhoneDigits(decrypted.phone),
        email: normalizeEmail(decrypted.email),
      };

      if (!contact.firstName || !contact.lastName) {
        console.error('checkout contact decrypt: empty name after normalize', {
          rawFirstLen: String(decrypted.firstName ?? '').length,
          rawLastLen: String(decrypted.lastName ?? '').length,
        });
        return {
          ok: false,
          status: 400,
          error:
            'No se pudieron leer nombre y apellido. Si el problema continúa, el par de claves de cifrado del deploy puede no coincidir (VITE_CHECKOUT_CONTACT_PUBLIC_KEY vs CHECKOUT_CONTACT_PRIVATE_KEY).',
        };
      }

      return { ok: true, contact };
    } catch (err) {
      console.error('checkout contact decrypt failed', err);
      return {
        ok: false,
        status: 400,
        error:
          'No se pudo descifrar el formulario. Verifica en Vercel que las claves pública (build) y privada (runtime) correspondan al mismo par y vuelve a desplegar.',
      };
    }
  }

  const allowPlaintext = String(process.env.CHECKOUT_ALLOW_PLAINTEXT_CONTACT || '') === '1';
  if (allowPlaintext && body && typeof body === 'object') {
    return {
      ok: true,
      contact: {
        firstName: normalizeName(body.firstName),
        lastName: normalizeName(body.lastName),
        phone: normalizePhoneDigits(body.phone),
        email: normalizeEmail(body.email),
      },
    };
  }

  return {
    ok: false,
    status: 400,
    error: 'Missing encrypted contact payload',
  };
}
