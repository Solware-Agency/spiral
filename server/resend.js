import { Resend } from 'resend';

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

function detailRow(label, value) {
  return `
    <tr>
      <td style="padding:8px 0;color:#6b7280;font-size:12px;letter-spacing:.08em;text-transform:uppercase;vertical-align:top;">
        ${esc(label)}
      </td>
      <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;vertical-align:top;">
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
}) {
  const calendarCta = calendarLink
    ? `
      <tr>
        <td style="padding:20px 28px 4px;">
          <a href="${esc(calendarLink)}"
             style="display:inline-block;background:#6f1720;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;">
            Ver en Google Calendar / View on Google Calendar
          </a>
        </td>
      </tr>
    `
    : '';

  return `
    <div style="margin:0;background:#0b0b0b;padding:24px 12px;font-family:Arial,'Helvetica Neue',sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;border-collapse:collapse;">
        <tr>
          <td style="background:linear-gradient(135deg,#140608 0%,#6f1720 100%);padding:26px 28px;border-radius:14px 14px 0 0;">
            <div style="color:#f3f4f6;font-size:11px;letter-spacing:.16em;text-transform:uppercase;opacity:.9;">${esc(
              eyebrow
            )}</div>
            <div style="margin-top:8px;color:#ffffff;font-size:26px;line-height:1.15;font-weight:700;">${esc(
              title
            )}</div>
            <div style="margin-top:8px;color:#f3f4f6;font-size:13px;line-height:1.5;max-width:42ch;">${esc(
              subtitle
            )}</div>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:18px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <span style="display:inline-block;background:#fef2f2;color:#7f1d1d;border:1px solid #fecaca;border-radius:999px;padding:7px 12px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;">
              ${esc(statusBadge)}
            </span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:4px 28px 10px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              ${detailRow('Cliente / Customer', customerName || '(not provided)')}
              ${detailRow('Email', customerEmail || '(not provided)')}
              ${detailRow('Plan', planLabel)}
              ${detailRow('Duracion / Duration', `${hours} hour(s)`)}
              ${detailRow('Fecha / Date', date)}
              ${detailRow('Hora / Time', time)}
            </table>
          </td>
        </tr>
        ${calendarCta}
        <tr>
          <td style="background:#ffffff;padding:16px 28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 14px 14px;">
            <div style="margin-top:6px;padding-top:14px;border-top:1px solid #ececec;color:#6b7280;font-size:12px;line-height:1.55;">
              SPIRAL M STUDIO · Email de confirmacion / Confirmation email
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function getResendEnv() {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const fromEmail = String(process.env.RESEND_FROM_EMAIL || '').trim();
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
  const statusLine = paidViaStripe
    ? 'Pago confirmado en Stripe / Stripe payment confirmed'
    : 'Reserva creada / Booking created';
  const subjectBase = `Reserva confirmada / Booking confirmed — ${date} ${time}`;
  const detailLines = [
    toListLine('Estado / Status', statusLine),
    toListLine('Plan', planLabel),
    toListLine('Duracion / Duration', `${hours} hour(s)`),
    toListLine('Fecha / Date', date),
    toListLine('Hora / Time', time),
    toListLine('Cliente / Customer', customerName),
    toListLine('Email cliente / Customer email', customerEmail),
    toListLine('Calendario / Calendar', calendarLink || 'N/A'),
  ];
  const detailText = detailLines.join('\n');

  const tasks = [];
  if (ownerEmail) {
    tasks.push(
      resend.emails.send({
        from: fromEmail,
        to: ownerEmail,
        subject: `[OWNER] ${subjectBase}`,
        text: `Nueva reserva confirmada / New booking confirmed.\n\n${detailText}`,
        html: renderEmailTemplate({
          eyebrow: 'Spiral Bookings / Reservas Spiral',
          title: 'Nueva reserva confirmada / New booking confirmed',
          subtitle:
            'Se registro una nueva reserva desde Book Now. / A new booking was submitted from Book Now.',
          statusBadge: statusLine,
          customerName,
          planLabel,
          hours,
          date,
          time,
          customerEmail,
          calendarLink,
        }),
      })
    );
  }

  if (customerEmail) {
    tasks.push(
      resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: `Tu reserva en CASA SPIRAL esta confirmada / Your CASA SPIRAL booking is confirmed`,
        text: `Gracias por tu reserva. / Thank you for your booking.\n\n${detailText}`,
        html: renderEmailTemplate({
          eyebrow: 'Casa Spiral',
          title: 'Tu reserva esta confirmada / Your booking is confirmed',
          subtitle:
            'Gracias por elegir Spiral. Te esperamos en el estudio. / Thanks for choosing Spiral. We look forward to seeing you at the studio.',
          statusBadge: statusLine,
          customerName,
          planLabel,
          hours,
          date,
          time,
          customerEmail,
          calendarLink,
        }),
      })
    );
  }

  if (tasks.length === 0) return { sent: 0, skipped: true };
  const settled = await Promise.allSettled(tasks);
  const sent = settled.filter((r) => r.status === 'fulfilled').length;
  const errors = settled
    .filter((r) => r.status === 'rejected')
    .map((r) => String(r.reason?.message || r.reason));
  return { sent, errors };
}

