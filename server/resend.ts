import { Resend } from 'resend';
import { resolveEmailLogoForSend } from './emailLogo.js';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toListLine(label, value) {
  return `${label}: ${value || '(not provided)'}`;
}

function formatHours(hours) {
  const n = Number(hours);
  if (!Number.isFinite(n) || n < 1) return `${hours} hour(s)`;
  return n === 1 ? '1 hour' : `${n} hours`;
}

function detailRow(label, value) {
  return `
    <tr>
      <td style="padding:8px 0;color:#6b6b6b;font-size:12px;letter-spacing:.08em;text-transform:uppercase;vertical-align:top;">
        ${esc(label)}
      </td>
      <td style="padding:8px 0;color:#3d3d3d;font-size:14px;font-weight:600;text-align:right;vertical-align:top;">
        ${esc(value || 'N/A')}
      </td>
    </tr>
  `;
}

function renderEmailTemplate({
  eyebrow,
  title,
  subtitle,
  statusBadge,
  customerName,
  planLabel,
  hours,
  date,
  time,
  customerEmail,
  calendarLink,
  logoSrc,
}) {
  const durationLabel = formatHours(hours);
  const calendarCta = calendarLink
    ? `
      <tr>
        <td style="padding:20px 28px 4px;background:#ffffff;border-left:1px solid #d1d1d1;border-right:1px solid #d1d1d1;">
          <a href="${esc(calendarLink)}"
            style="display:inline-block;background:#6f1720;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;">
            View on Google Calendar
          </a>
        </td>
      </tr>
    `
    : '';

  return `
    <div style="margin:0;background:#e3e3e3;padding:28px 16px;font-family:Arial,'Helvetica Neue',sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;border-collapse:collapse;border:1px solid #d1d1d1;">
        <tr>
          <td style="background:#6f1720;padding:28px 28px 22px;border-radius:0;">
            <img src="${esc(logoSrc)}" alt="Spiral" width="192" style="display:block;width:192px;max-width:192px;height:auto;border:0;outline:none;text-decoration:none;margin:0 0 18px 0;-ms-interpolation-mode:bicubic;" />
            <div style="color:#f0e6e8;font-size:11px;letter-spacing:.16em;text-transform:uppercase;">${esc(
              eyebrow
            )}</div>
            <div style="margin-top:10px;color:#ffffff;font-size:26px;line-height:1.15;font-weight:700;">${esc(
              title
            )}</div>
            <div style="margin-top:10px;color:#f0e6e8;font-size:13px;line-height:1.55;max-width:42ch;">${esc(
              subtitle
            )}</div>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:18px 28px;border-left:1px solid #d1d1d1;border-right:1px solid #d1d1d1;">
            <span style="display:inline-block;background:#faf5f5;color:#6f1720;border:1px solid #e8c4c8;border-radius:0;padding:7px 12px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;">
              ${esc(statusBadge)}
            </span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:4px 28px 10px;border-left:1px solid #d1d1d1;border-right:1px solid #d1d1d1;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              ${detailRow('Customer', customerName || '(not provided)')}
              ${detailRow('Email', customerEmail || '(not provided)')}
              ${detailRow('Plan', planLabel)}
              ${detailRow('Duration', durationLabel)}
              ${detailRow('Date', date)}
              ${detailRow('Time', time)}
            </table>
          </td>
        </tr>
        ${calendarCta}
        <tr>
          <td style="background:#f7f7f7;padding:16px 28px 24px;border:1px solid #d1d1d1;border-top:1px solid #e0e0e0;border-radius:0;">
            <div style="color:#7a7a7a;font-size:12px;line-height:1.55;">
              Spiral · Booking confirmation
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

/** Extrae la dirección si RESEND_FROM_EMAIL viene como `Nombre <correo@dominio>`. */
function extractEmailAddress(rawFrom) {
  const raw = String(rawFrom ?? '').trim();
  if (!raw) return '';
  const bracketed = raw.match(/<([^>]+)>/);
  return (bracketed?.[1] ?? raw).trim();
}

/** Nombre visible en la bandeja (Gmail, etc.). Por defecto: Spiral. */
export function buildResendFromAddress() {
  const email = extractEmailAddress(process.env.RESEND_FROM_EMAIL);
  if (!email) return '';
  const displayName =
    String(process.env.RESEND_FROM_NAME || 'Spiral').trim().replace(/[<>]/g, '') || 'Spiral';
  return `${displayName} <${email}>`;
}

export function getResendEnv() {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const fromEmail = buildResendFromAddress();
  const ownerEmail = String(
    process.env.STUDIO_NOTIFICATION_EMAIL || process.env.BOOKING_OWNER_EMAIL || ''
  ).trim();
  const missing = [!apiKey ? 'RESEND_API_KEY' : null, !fromEmail ? 'RESEND_FROM_EMAIL' : null].filter(
    Boolean
  );
  return { apiKey, fromEmail, ownerEmail, missing };
}

export function getResendClient(apiKey) {
  return new Resend(apiKey);
}

export async function sendBookingConfirmationEmails({
  resend,
  fromEmail,
  ownerEmail,
  customerEmail,
  customerName,
  planLabel,
  hours,
  date,
  time,
  calendarLink,
  paidViaStripe,
}) {
  const statusLine = paidViaStripe ? 'Stripe payment confirmed' : 'Booking created';
  const subjectBase = `Booking confirmed — ${date} ${time}`;
  const durationLabel = formatHours(hours);
  const detailLines = [
    toListLine('Status', statusLine),
    toListLine('Plan', planLabel),
    toListLine('Duration', durationLabel),
    toListLine('Date', date),
    toListLine('Time', time),
    toListLine('Customer', customerName),
    toListLine('Customer email', customerEmail),
    toListLine('Calendar', calendarLink || 'N/A'),
  ];
  const detailText = detailLines.join('\n');
  const { src: logoSrc, attachments } = await resolveEmailLogoForSend();

  const tasks = [];
  if (ownerEmail) {
    tasks.push(
      resend.emails.send({
        from: fromEmail,
        to: ownerEmail,
        subject: `[OWNER] ${subjectBase}`,
        text: `New booking confirmed.\n\n${detailText}`,
        html: renderEmailTemplate({
          eyebrow: 'Spiral Bookings',
          title: 'New booking confirmed',
          subtitle: 'A new booking was submitted from Book Now.',
          statusBadge: statusLine,
          customerName,
          planLabel,
          hours,
          date,
          time,
          customerEmail,
          calendarLink,
          logoSrc,
        }),
        attachments: attachments.length ? attachments : undefined,
      })
    );
  }

  if (customerEmail) {
    tasks.push(
      resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: 'Your CASA SPIRAL booking is confirmed',
        text: `Thank you for your booking.\n\n${detailText}`,
        html: renderEmailTemplate({
          eyebrow: 'Casa Spiral',
          title: 'Your booking is confirmed',
          subtitle:
            'Thanks for choosing Spiral. We look forward to seeing you at the studio.',
          statusBadge: statusLine,
          customerName,
          planLabel,
          hours,
          date,
          time,
          customerEmail,
          calendarLink,
          logoSrc,
        }),
        attachments: attachments.length ? attachments : undefined,
      })
    );
  }

  if (tasks.length === 0) return { sent: 0, skipped: true };
  const results = await Promise.all(tasks);

  let sent = 0;
  const errors = [];

  for (const res of results) {
    if (res.error) {
      errors.push(String(res.error.message || res.error));
    } else if (res.data) {
      sent++;
    }
  }

  return { sent, errors };
}
