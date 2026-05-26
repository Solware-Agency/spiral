import { generateKeyPairSync } from 'node:crypto';

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const pubOneLine = publicKey.trim().replace(/\n/g, '\\n');
const privOneLine = privateKey.trim().replace(/\n/g, '\\n');

console.log('Añade estas variables a .env y a Vercel (Production + Preview):\n');
console.log(`VITE_CHECKOUT_CONTACT_PUBLIC_KEY="${pubOneLine}"`);
console.log(`CHECKOUT_CONTACT_PRIVATE_KEY="${privOneLine}"`);
console.log('\nNo subas la clave privada al repositorio.');
