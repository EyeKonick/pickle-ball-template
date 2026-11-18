/**
 * Booking codes: PB-YYYYMMDD-###
 * YYYYMMDD is the submission date in Manila time; ### is a random 3-digit suffix.
 * The Apps Script should reject or re-suffix a code that already exists in the Sheet.
 */
export const createBookingCode = (now = new Date(), random = Math.random): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const suffix = String(Math.floor(random() * 1000)).padStart(3, '0');
  return `PB-${get('year')}${get('month')}${get('day')}-${suffix}`;
};
