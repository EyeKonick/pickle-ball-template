/**
 * Court availability: one status function shared by the court map and the booking form.
 *
 * Data comes from src/data/availability.json (SAMPLE, for the demo) or, when
 * AVAILABILITY_ENDPOINT_TO_FILL is set in site-config, from that URL in the same shape.
 * Statuses mirror the booking statuses: Pending Review → "pending", Confirmed → "booked".
 */
import sample from '../data/availability.json';
import { site, availabilityEndpointReady } from '../data/site-config';
import { fromIsoDate, toIsoDate } from './format';
import { courts, startHours } from './slots';

export type CourtStatus = 'available' | 'pending' | 'booked' | 'closed';
type TakenStatus = Exclude<CourtStatus, 'available'>;

/** The label shown for each status on the map, in the legend and in the form. */
export const STATUS_LABELS: Record<CourtStatus, string> = { available: 'Open', pending: 'Pending', booked: 'Booked', closed: 'Closed' };

/** Per court: the start hours that are not available, grouped by status. */
export type DayPlan = Record<string, Partial<Record<TakenStatus, number[]>>>;

export interface AvailabilityData {
  dates: Record<string, DayPlan>;
  /** Weekday (0 = Sunday) → a date in `dates` to copy, for dates that are not listed. */
  weekly?: Record<string, string>;
}

/** Fired on document when live availability replaces the sample data. */
export const AVAILABILITY_EVENT = 'availability:update';

const TAKEN: TakenStatus[] = ['booked', 'pending', 'closed'];

let data: AvailabilityData = sample as unknown as AvailabilityData;
let live = false;

/** True once live data from the endpoint is in use. */
export const isLive = (): boolean => live;

/** True for hours of today that have already started or passed. */
export const isPastHour = (isoDate: string, hour: number, now = new Date()): boolean =>
  isoDate === toIsoDate(now) && hour <= now.getHours();

const dayPlan = (isoDate: string): DayPlan | undefined => {
  if (data.dates[isoDate]) return data.dates[isoDate];
  const weekday = fromIsoDate(isoDate)?.getDay();
  const copy = weekday === undefined ? undefined : data.weekly?.[String(weekday)];
  return copy ? data.dates[copy] : undefined;
};

const hourStatus = (courtId: string, isoDate: string, hour: number, now: Date): CourtStatus => {
  if (hour < site.hours.openHour || hour >= site.hours.closeHour || isPastHour(isoDate, hour, now)) return 'closed';
  const plan = dayPlan(isoDate)?.[courtId];
  return TAKEN.find((status) => plan?.[status]?.includes(hour)) ?? 'available';
};

/**
 * A court's status for a date, start hour and duration. The court is "available" only when
 * every hour in [start, start + hours) is free; otherwise the first taken hour decides the status.
 */
export function courtStatus(courtId: string, isoDate: string, start: number, hours: number, now = new Date()): CourtStatus {
  if (!fromIsoDate(isoDate) || !Number.isFinite(start)) return 'closed';
  for (let h = start; h < start + hours; h++) {
    const status = hourStatus(courtId, isoDate, h, now);
    if (status !== 'available') return status;
  }
  return 'available';
}

/** How many courts are available for the whole slot. */
export const openCount = (isoDate: string, start: number, hours: number, now = new Date()): number =>
  courts.filter((c) => courtStatus(c.id, isoDate, start, hours, now) === 'available').length;

/** The next start hour after `start` on the same date when the court is free for `hours`, if any. */
export const nextOpenStart = (courtId: string, isoDate: string, start: number, hours: number, now = new Date()): number | undefined =>
  startHours.find((h) => h > start && courtStatus(courtId, isoDate, h, hours, now) === 'available');

/** The earliest slot after the given one, on this date or the following days, with at least one open court. */
export const nextOpening = (
  isoDate: string,
  start: number,
  hours: number,
  maxDate: string,
  now = new Date(),
): { date: string; start: number; count: number } | undefined => {
  const day = fromIsoDate(isoDate);
  if (!day) return undefined;
  for (let date = toIsoDate(day); date <= maxDate; day.setDate(day.getDate() + 1), date = toIsoDate(day)) {
    for (const h of startHours) {
      if (date === isoDate && h <= start) continue;
      const count = openCount(date, h, hours, now);
      if (count > 0) return { date, start: h, count };
    }
  }
  return undefined;
};

const isAvailabilityData = (value: unknown): value is AvailabilityData =>
  !!value && typeof value === 'object' && typeof (value as AvailabilityData).dates === 'object';

/**
 * Fetch live availability when the endpoint is set. On any failure the sample data stays in use.
 * Resolves true when live data was loaded.
 */
export const loadAvailability = async (): Promise<boolean> => {
  if (!availabilityEndpointReady) return false;
  try {
    const response = await fetch(site.booking.availabilityEndpoint, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json: unknown = await response.json();
    if (!isAvailabilityData(json)) throw new Error('Unexpected availability format');
    data = json;
    live = true;
    document.dispatchEvent(new CustomEvent(AVAILABILITY_EVENT));
    return true;
  } catch (error) {
    console.warn('Live availability unavailable, using sample data.', error);
    return false;
  }
};
