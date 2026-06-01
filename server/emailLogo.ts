import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Mismo color que la cabecera del correo (logo aplanado sin transparencia). */
export const EMAIL_HEADER_BG = '#6f1720';

export const EMAIL_LOGO_CID = 'spiral-logo-email';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMAIL_LOGO_FILE = path.join(__dirname, '..', 'public', 'images', 'email', 'spiral-logo-white.png');

function getPublicSiteOrigin() {
  const raw = String(
    process.env.PUBLIC_SITE_ORIGIN ||
      process.env.VITE_SITE_ORIGIN ||
      process.env.SITE_ORIGIN ||
      'https://spiralmstudio.com'
  ).trim();
  return raw.replace(/\/+$/, '');
}

/** URL pública del PNG para correo (fallback si no hay adjunto inline). */
export function getEmailLogoPublicUrl() {
  const override = String(process.env.RESEND_EMAIL_LOGO_URL || '').trim();
  if (override) return override;
  return `${getPublicSiteOrigin()}/images/email/spiral-logo-white.png`;
}

let cachedInlineAttachment: {
  filename: string;
  content: string;
  contentId: string;
} | null | undefined;

/** Adjunto inline PNG (evita WebP, transparencia → negro, y pixelado en clientes de correo). */
export async function loadEmailLogoInlineAttachment() {
  if (cachedInlineAttachment !== undefined) return cachedInlineAttachment;

  try {
    const buffer = await fs.readFile(EMAIL_LOGO_FILE);
    cachedInlineAttachment = {
      filename: 'spiral-logo-white.png',
      content: buffer.toString('base64'),
      contentId: EMAIL_LOGO_CID,
    };
  } catch {
    cachedInlineAttachment = null;
  }

  return cachedInlineAttachment;
}

export async function resolveEmailLogoForSend() {
  const attachment = await loadEmailLogoInlineAttachment();
  const src = attachment ? `cid:${EMAIL_LOGO_CID}` : getEmailLogoPublicUrl();
  return {
    src,
    attachments: attachment ? [attachment] : [],
  };
}
