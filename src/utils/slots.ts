/** Court selection, sample availability and pricing rules for the booking form. */
import courtsData from '../data/courts.json';
import availability from '../data/availability.json';
import { site } from '../data/site-config';
import { fromIsoDate, toIsoDate } from './format';

export type GroupId = 'indoor' | 'outdoor';
export type Court = (typeof courtsData.courts)[number];

/** Choices in the form: a specific court or "any" court in a group. */
export interface CourtChoice {
  id: string;
  label: string;
  group: GroupId;
  courtIds: string[];
}

export const courts = courtsData.courts;
export const groups = courtsData.groups;
export const rates = courtsData.rates;

export const courtChoices: CourtChoice[] = [
  ...groups.map((g) => ({
    id: `any-${g.id}`,
    label: `Any ${g.name.toLowerCase()}`,
    group: g.id as GroupId,
    courtIds: courts.filter((c) => c.group === g.id).map((c) => c.id),
  })),
  ...courts.map((c) => ({ id: c.id, label: c.name, group: c.group as GroupId, courtIds: [c.id] })),
];

export const findChoice = (id: string): CourtChoice | undefined => courtChoices.find((c) => c.id === id);

/** Start hours customers can pick: opening hour up to one hour before close. */
export const startHours = Array.from(
  { length: site.hours.closeHour - site.hours.openHour },
  (_, i) => site.hours.openHour + i,
);

/** Hourly rate for one hour on a court group, applying off-peak rules. */
export const hourlyRate = (group: GroupId, isoDate: string, hour: number): number => {
  if (group === 'outdoor') return rates.outdoor.standard;
  const date = fromIsoDate(isoDate);
  const off = rates.indoor.offPeak;
  const isOffPeak = !!date && off.days.includes(date.getDay()) && hour >= off.fromHour && hour < off.toHour;
  return isOffPeak ? off.amount : rates.indoor.standard;
};

/** Total for a slot: sum of each hour's rate. */
export const slotTotal = (group: GroupId, isoDate: string, start: number, hours: number): number =>
  Array.from({ length: hours }, (_, i) => hourlyRate(group, isoDate, start + i)).reduce((a, b) => a + b, 0);

/** True when a single court is taken at that hour on that date (sample data + past hours). */
const isTaken = (courtId: string, isoDate: string, hour: number, now: Date): boolean => {
  const date = fromIsoDate(isoDate);
  if (!date) return true;
  if (isoDate === toIsoDate(now) && hour <= now.getHours()) return true;
  const day = date.getDay();
  const weekly = availability.weekly.some((b) => b.court === courtId && b.days.includes(day) && b.hours.includes(hour));
  const dated = (availability.dates as { court: string; date: string; hours: number[] }[]).some(
    (b) => b.court === courtId && b.date === isoDate && b.hours.includes(hour),
  );
  return weekly || dated;
};

/**
 * Courts in a choice that are free for the whole slot [start, start + hours).
 * An empty array means the slot is unavailable.
 */
export const freeCourts = (choice: CourtChoice, isoDate: string, start: number, hours: number, now = new Date()): string[] => {
  if (start + hours > site.hours.closeHour) return [];
  return choice.courtIds.filter((id) =>
    Array.from({ length: hours }, (_, i) => start + i).every((h) => !isTaken(id, isoDate, h, now)),
  );
};

/** Bookable date range: today through the booking window. */
export const dateRange = (now = new Date()): { min: string; max: string } => {
  const max = new Date(now);
  max.setDate(max.getDate() + site.booking.windowDays);
  return { min: toIsoDate(now), max: toIsoDate(max) };
};
