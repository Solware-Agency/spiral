import { createDecipheriv, createPrivateKey, privateDecrypt, constants } from 'node:crypto';

export type BookingContactPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type BookingContactEnvelope = {
  v: 1;
  ek: string;
  iv: string;
  ct: string;
};

export function pemFromEnv(raw: string): string {
  return String(raw ?? '')
    .trim()
    .replace(/\\n/g, '\n');
}

export function isBookingContactEnvelope(value: unknown): value is BookingContactEnvelope {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return o.v === 1 && typeof o.ek === 'string' && typeof o.iv === 'string' && typeof o.ct === 'string';
}

export function decryptBookingContact(
  privateKeyPem: string,
  envelope: BookingContactEnvelope
): BookingContactPayload {
  const privateKey = createPrivateKey(pemFromEnv(privateKeyPem));
  const encryptedKey = Buffer.from(envelope.ek, 'base64url');
  const iv = Buffer.from(envelope.iv, 'base64url');
  const combined = Buffer.from(envelope.ct, 'base64url');

  if (iv.length !== 12) {
    throw new Error('Invalid contact envelope IV');
  }
  if (combined.length < 17) {
    throw new Error('Invalid contact envelope ciphertext');
  }

  const aesKey = privateDecrypt(
    {
      key: privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    encryptedKey
  );

  if (aesKey.length !== 32) {
    throw new Error('Invalid contact envelope key length');
  }

  const authTag = combined.subarray(combined.length - 16);
  const ciphertext = combined.subarray(0, combined.length - 16);

  const decipher = createDecipheriv('aes-256-gcm', aesKey, iv);
  decipher.setAuthTag(authTag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const parsed = JSON.parse(plain.toString('utf8')) as Record<string, unknown>;

  return {
    firstName: String(parsed.firstName ?? ''),
    lastName: String(parsed.lastName ?? ''),
    phone: String(parsed.phone ?? ''),
    email: String(parsed.email ?? ''),
  };
}
