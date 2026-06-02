/**
 * Enlace directo al evento en Google Calendar (no el flujo action=TEMPLATE).
 */
export function resolveBookingCalendarViewLink(htmlLink: unknown): string | null {
  const link = String(htmlLink ?? '').trim();
  if (!link) return null;
  if (/calendar\/render/i.test(link) && /action=TEMPLATE/i.test(link)) return null;
  return link;
}
