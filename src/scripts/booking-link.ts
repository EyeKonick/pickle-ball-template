/**
 * Deep links into the booking form: ?court=court-3&date=2026-11-21&time=19:00#booking
 * Used by the hero quick-book strip and the court cards. The booking form reads the same
 * parameters on load, so the links also work when opened directly or without this script.
 */

export interface BookingPrefill {
  court?: string;
  date?: string;
  time?: string;
  hours?: string;
}

export const PREFILL_EVENT = 'booking:prefill';
const KEYS: (keyof BookingPrefill)[] = ['court', 'date', 'time', 'hours'];

export const readPrefill = (search: string): BookingPrefill => {
  const params = new URLSearchParams(search);
  return Object.fromEntries(KEYS.filter((k) => params.get(k)).map((k) => [k, params.get(k) as string]));
};

export const openBooking = (prefill: BookingPrefill): void => {
  const params = new URLSearchParams();
  KEYS.forEach((k) => prefill[k] && params.set(k, prefill[k] as string));
  history.pushState(null, '', `${location.pathname}?${params}#booking`);
  document.dispatchEvent(new CustomEvent<BookingPrefill>(PREFILL_EVENT, { detail: prefill }));
  document.getElementById('booking')?.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
};

/** Same-page links like href="?court=court-2#booking" prefill without reloading. */
document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-booking-link]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();
  openBooking(readPrefill(new URL(link.href).search));
});
