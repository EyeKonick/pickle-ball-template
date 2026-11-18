/** Formatting helpers shared by components and client scripts. */

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

/** 450 -> "₱450" */
export const formatPeso = (amount: number): string => peso.format(amount);

/** 19 -> "7:00 PM", 23 -> "11:00 PM" */
export const formatHour = (hour: number): string => {
  const h = hour % 24;
  return `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;
};

/** 19 -> "7 PM" (compact, for slot buttons) */
export const formatHourShort = (hour: number): string => {
  const h = hour % 24;
  return `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`;
};

/** 19 -> "19:00" */
export const toTimeValue = (hour: number): string => `${String(hour).padStart(2, '0')}:00`;

/** "19:00" -> 19 (NaN when malformed) */
export const fromTimeValue = (value: string): number => (/^\d{2}:00$/.test(value) ? Number(value.slice(0, 2)) : NaN);

/** Date -> "YYYY-MM-DD" in local time */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** "YYYY-MM-DD" -> local Date at midnight (null when malformed) */
export const fromIsoDate = (value: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "2026-11-21" -> "Sat, Nov 21, 2026" */
export const formatLongDate = (value: string): string => {
  const date = fromIsoDate(value);
  return date
    ? date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : value;
};
