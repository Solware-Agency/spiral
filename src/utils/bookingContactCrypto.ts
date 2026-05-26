import type { BookingContactEnvelope, BookingContactPayload } from '../../server/bookingContactCrypto';

export type { BookingContactEnvelope, BookingContactPayload };

function pemFromEnv(raw: string): string {
  return String(raw ?? '')
    .trim()
    .replace(/\\n/g, '\n');
}

function toBase64Url(bytes: Uint8Array | ArrayBuffer): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < view.length; i += 1) {
    binary += String.fromCharCode(view[i]!);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function importRsaPublicKey(pem: string): Promise<CryptoKey> {
  const normalized = pemFromEnv(pem);
  const b64 = normalized.replace(/-----BEGIN PUBLIC KEY-----/g, '').replace(/-----END PUBLIC KEY-----/g, '').replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
}

/** Cifra datos de contacto para el checkout (no viajan en claro en el POST). */
export async function encryptBookingContact(
  publicKeyPem: string,
  contact: BookingContactPayload
): Promise<BookingContactEnvelope> {
  const publicKey = await importRsaPublicKey(publicKeyPem);
  const aesKey = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(contact));

  const aesCryptoKey = await crypto.subtle.importKey('raw', aesKey, 'AES-GCM', false, ['encrypt']);
  const ctBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesCryptoKey, plaintext);
  const ekBuffer = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, aesKey);

  return {
    v: 1,
    ek: toBase64Url(ekBuffer),
    iv: toBase64Url(iv),
    ct: toBase64Url(ctBuffer),
  };
}

export function getCheckoutContactPublicKeyPem(): string {
  return pemFromEnv(String(import.meta.env.VITE_CHECKOUT_CONTACT_PUBLIC_KEY || ''));
}

export function isCheckoutContactEncryptionConfigured(): boolean {
  return getCheckoutContactPublicKeyPem().includes('BEGIN PUBLIC KEY');
}
