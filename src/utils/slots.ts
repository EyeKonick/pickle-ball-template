/** Courts, groups, opening hours and pricing rules shared by the page, the court map and the booking form. */
import courtsData from '../data/courts.json';
import { site } from '../data/site-config';
import { fromIsoDate, toIsoDate } from './format';

export type GroupId = 'indoor' | 'outdoor';
export type Court = (typeof courtsData.courts)[number];

interface RatePlan {
  standard: number;
  offPeak?: { amount: number; days: number[]; fromHour: number; toHour: number };
}

export const courts = courtsData.courts;
export const groups = courtsData.groups;
export const rates = courtsData.rates;
export const floorPlan = courtsData.map;

export const findCourt = (id: string): Court | undefined => courts.find((c) => c.id === id);
export const groupName = (id: string): string => groups.find((g) => g.id === id)?.name ?? '';

/** Start hours customers can pick: opening hour up to one hour before close. */
export const startHours = Array.from(
  { length: site.hours.closeHour - site.hours.openHour },
  (_, i) => site.hours.openHour + i,
);

/** Hourly rate for one hour on a rate plan (a key of `rates` in courts.json), applying off-peak rules. */
export const hourlyRate = (planId: string, isoDate: string, hour: number): number => {
  const plan = (rates as unknown as Record<string, RatePlan>)[planId];
  if (!plan) return 0;
  const off = plan.offPeak;
  const day = fromIsoDate(isoDate)?.getDay();
  const isOffPeak = !!off && day !== undefined && off.days.includes(day) && hour >= off.fromHour && hour < off.toHour;
  return isOffPeak ? off.amount : plan.standard;
};

/** Total for a slot: sum of each hour's rate. */
export const slotTotal = (planId: string, isoDate: string, start: number, hours: number): number =>
  Array.from({ length: hours }, (_, i) => hourlyRate(planId, isoDate, start + i)).reduce((a, b) => a + b, 0);

/** Bookable date range: today through the booking window. */
export const dateRange = (now = new Date()): { min: string; max: string } => {
  const max = new Date(now);
  max.setDate(max.getDate() + site.booking.windowDays);
  return { min: toIsoDate(now), max: toIsoDate(max) };
};

/** Default start: 7 PM, or the next hour if that has passed today. */
export const defaultStart = (isoDate: string, now = new Date()): number => {
  const preferred = 19;
  if (isoDate !== toIsoDate(now)) return preferred;
  return Math.min(Math.max(preferred, now.getHours() + 1, site.hours.openHour), site.hours.closeHour - 1);
};
