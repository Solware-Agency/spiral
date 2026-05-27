export function buildBookingCalendarSummary(displayName: string): string {
  const name = String(displayName ?? '').trim();
  return name ? `CASA SPIRAL Booking — ${name}` : 'CASA SPIRAL Booking';
}

export function formatBookingHours(hours: number): string {
  const n = Number(hours);
  if (!Number.isFinite(n) || n < 1) return `${hours} hour(s)`;
  return n === 1 ? '1 hour' : `${n} hours`;
}

type BookingCalendarDescriptionInput = {
  planLabel: string;
  hours: number;
  date: string;
  time: string;
  displayName: string;
  email: string;
  phone: string;
  paidViaStripe?: boolean;
  stripeSessionId?: string | null;
};

export function buildBookingCalendarDescription(input: BookingCalendarDescriptionInput): string {
  const {
    planLabel,
    hours,
    date,
    time,
    displayName,
    email,
    phone,
    paidViaStripe = false,
    stripeSessionId,
  } = input;

  const lines = [
    paidViaStripe ? 'Booking from website (paid via Stripe).' : 'Booking from website.',
    '',
    `Plan: ${planLabel}`,
    `Duration: ${formatBookingHours(hours)}`,
    `Date: ${date}`,
    `Time: ${time}`,
    '',
    'Customer:',
    `Name: ${displayName || '(not provided)'}`,
    `Email: ${email || '(not provided)'}`,
    `Phone: ${phone || '(not provided)'}`,
  ];

  if (stripeSessionId) {
    lines.push('', `Stripe Checkout Session: ${stripeSessionId}`);
  }

  return lines.join('\n');
}
