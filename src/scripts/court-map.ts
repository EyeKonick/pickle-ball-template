/**
 * Court map for Booking step 1: court states, selection, tooltip, hour scrubber, empty state and summary.
 *
 * The booking form owns the state. The map reads the form's date, start, duration and court inputs,
 * writes back to those same inputs (firing "change", so booking.ts runs its checks), and re-renders
 * when booking.ts fires STATE_EVENT. Status comes from courtStatus() in src/utils/availability.ts.
 */
import { site } from '../data/site-config';
import { courts, dateRange, findCourt, groupName, hourlyRate, slotTotal, type Court } from '../utils/slots';
import {
  STATUS_LABELS,
  courtStatus,
  isLive,
  isPastHour,
  loadAvailability,
  nextOpenStart,
  nextOpening,
  openCount,
  type CourtStatus,
} from '../utils/availability';
import { formatHour, formatHourShort, formatLongDate, formatPeso, fromIsoDate, fromTimeValue, toTimeValue } from '../utils/format';
import { STATE_EVENT } from './booking-link';

const root = document.querySelector<HTMLElement>('[data-booking]');
const map = root?.querySelector<HTMLElement>('[data-court-map]');
if (root && map) initCourtMap(root, map);

function initCourtMap(root: HTMLElement, map: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-booking-form]')!;
  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const svg = q<SVGSVGElement>('[data-map-svg]');
  const canvas = q<HTMLElement>('[data-map-canvas]');
  const tip = q<HTMLElement>('[data-tip]');
  const live = q<HTMLElement>('[data-map-live]');
  const empty = q<HTMLElement>('[data-map-empty]');
  const pick = q<HTMLElement>('[data-pick]');
  const courtEls = [...svg.querySelectorAll<SVGGElement>('[data-map-court]')];
  const zoneEls = [...svg.querySelectorAll<SVGGElement>('[data-zone]')];
  const hourEls = [...root.querySelectorAll<HTMLButtonElement>('[data-scrub-hour]')];
  const dateInput = form.elements.namedItem('date') as HTMLInputElement;
  const startSelect = form.elements.namedItem('start') as HTMLSelectElement;
  const courtInputs = [...form.querySelectorAll<HTMLInputElement>('input[name="court"]')];

  let selected = '';
  let firstRender = true;
  let hoverId = '';
  let focusId = '';

  // ---------------------------------------------------------------- reading and writing the form

  const read = () => {
    const data = new FormData(form);
    return {
      date: String(data.get('date') ?? ''),
      start: fromTimeValue(String(data.get('start') ?? '')),
      hours: Number(data.get('hours') ?? 1),
      courtId: String(data.get('court') ?? ''),
    };
  };

  const change = (input: HTMLInputElement | HTMLSelectElement) => input.dispatchEvent(new Event('change', { bubbles: true }));

  /** Pick a court in the form (or clear it with ''). */
  const setCourt = (id: string) => {
    const current = courtInputs.find((i) => i.checked);
    if (id) {
      const input = courtInputs.find((i) => i.value === id);
      if (!input || input.disabled || input === current) return;
      input.checked = true;
      change(input);
    } else if (current) {
      current.checked = false;
      change(current);
    }
  };

  const setStart = (hour: number) => {
    startSelect.value = toTimeValue(hour);
    change(startSelect);
  };

  // ---------------------------------------------------------------- wording

  const span = (start: number, hours: number) => `${formatHourShort(start)} to ${formatHourShort(start + hours)}`;
  const zoneWord = (court: Court) => groupName(court.group).toLowerCase();

  const closedReason = (date: string, start: number, hours: number) => {
    if (isPastHour(date, start)) return 'This time has passed.';
    if (start + hours > site.hours.closeHour) return `Runs past closing at ${formatHourShort(site.hours.closeHour)}.`;
    return 'This court is closed at this time.';
  };

  const reasons: Record<Exclude<CourtStatus, 'available'>, string> = {
    pending: 'Held for another request awaiting staff confirmation.',
    booked: 'Booked by another player.',
    closed: '',
  };

  const rateText = (court: Court, date: string, start: number, hours: number) => {
    const perHour = Array.from({ length: hours }, (_, i) => hourlyRate(court.rate, date, start + i));
    const low = Math.min(...perHour);
    const high = Math.max(...perHour);
    const hourly = low === high ? `${formatPeso(low)} an hour` : `${formatPeso(low)}–${formatPeso(high)} an hour`;
    return `${hourly} · ${formatPeso(slotTotal(court.rate, date, start, hours))} total`;
  };

  const describe = (court: Court) => {
    const { date, start, hours } = read();
    const status = courtStatus(court.id, date, start, hours);
    const next = status === 'available' ? undefined : nextOpenStart(court.id, date, start, hours);
    const reason = status === 'available' ? '' : status === 'closed' ? closedReason(date, start, hours) : reasons[status];
    const nextText = status === 'available' ? '' : next !== undefined ? `Free from ${formatHourShort(next)}.` : 'No open start later this day.';
    const total = slotTotal(court.rate, date, start, hours);
    const label = [
      court.name,
      zoneWord(court),
      span(start, hours),
      status === 'available' ? 'available' : `${STATUS_LABELS[status].toLowerCase()}, can't be selected`,
      ...(nextText ? [nextText.replace(/\.$/, '').replace(/^\w/, (c) => c.toLowerCase())] : []),
      `${total} pesos`,
    ].join(', ');
    return { status, reason, nextText, label };
  };

  // ---------------------------------------------------------------- tooltip

  const showTip = () => {
    const id = hoverId || focusId;
    const court = id ? findCourt(id) : undefined;
    if (!court) return tip.classList.remove('is-on');
    const { date, start, hours } = read();
    const d = describe(court);
    q('[data-tip-name]').textContent = court.name;
    q('[data-tip-zone]').textContent = groupName(court.group);
    const chip = q<HTMLElement>('[data-tip-chip]');
    chip.textContent = STATUS_LABELS[d.status];
    chip.dataset.status = d.status;
    q('[data-tip-time]').textContent = `${span(start, hours)}`;
    q('[data-tip-reason]').textContent = d.status === 'available' ? 'Free for your whole time.' : `${d.reason} ${d.nextText}`.trim();
    q('[data-tip-rate]').textContent = rateText(court, date, start, hours);

    // Beside the court: to its right, or to its left near the right edge
    const el = courtEls.find((c) => c.dataset.mapCourt === id)!;
    const box = el.querySelector('.court__hit')!.getBoundingClientRect();
    const frame = canvas.getBoundingClientRect();
    const gap = 6;
    const right = box.right - frame.left + gap;
    const left = right + tip.offsetWidth > frame.width ? box.left - frame.left - gap - tip.offsetWidth : right;
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(box.top - frame.top)}px)`;
    tip.classList.add('is-on');
  };

  // ---------------------------------------------------------------- render

  const announce = (message: string) => {
    live.textContent = '';
    requestAnimationFrame(() => (live.textContent = message));
  };

  const renderCourts = () => {
    const { courtId } = read();
    for (const el of courtEls) {
      const court = findCourt(el.dataset.mapCourt!)!;
      const d = describe(court);
      const layer = el.querySelector<SVGGElement>(`[data-layer="${d.status}"]`)!;
      if (!layer.classList.contains('is-on')) {
        // The incoming drawing goes on top and fades in; the outgoing one drops away after it
        layer.parentElement!.append(layer);
        el.querySelectorAll('[data-layer]').forEach((l) => l.classList.toggle('is-on', l === layer));
      }
      el.dataset.status = d.status;
      el.setAttribute('aria-disabled', String(d.status !== 'available'));
      el.setAttribute('aria-pressed', String(court.id === courtId));
      el.setAttribute('aria-label', d.label);
      el.classList.toggle('is-picked', court.id === courtId && (el.classList.contains('is-picked') || court.id !== selected));
    }
  };

  const renderSelectionNews = () => {
    const { date, start, hours, courtId } = read();
    if (!firstRender && courtId !== selected) {
      const court = findCourt(courtId);
      const before = findCourt(selected);
      if (court) {
        announce(`${court.name} selected: ${formatLongDate(date)}, ${span(start, hours)}, ${formatPeso(slotTotal(court.rate, date, start, hours))}.`);
      } else if (before && courtStatus(before.id, date, start, hours) !== 'available') {
        announce(`${before.name} is not open for your new time. Pick another court.`);
      } else {
        announce('Court selection cleared.');
      }
    }
    selected = courtId;
  };

  const renderZones = () => {
    for (const zone of zoneEls) zone.classList.toggle('is-focus', zone.dataset.zone === root.dataset.zone);
  };

  const renderScrubber = () => {
    const { date, start, hours } = read();
    const valid = !!fromIsoDate(date);
    for (const el of hourEls) {
      const hour = Number(el.dataset.scrubHour);
      const unusable = !valid || isPastHour(date, hour) || hour + hours > site.hours.closeHour;
      const count = unusable ? 0 : openCount(date, hour, hours);
      el.disabled = unusable;
      el.toggleAttribute('data-in-range', hour >= start && hour < start + hours);
      el.style.setProperty('--v', String(count / courts.length));
      el.querySelector('[data-scrub-count]')!.textContent = unusable ? '–' : String(count);
    }
    q('[data-scrub-for]').textContent = valid
      ? `(for ${hours} ${hours === 1 ? 'hour' : 'hours'} on ${formatLongDate(date)})`
      : '';
  };

  let jumpTo: { date: string; start: number } | undefined;

  const renderOutcome = () => {
    const { date, start, hours, courtId } = read();
    const valid = !!fromIsoDate(date) && Number.isFinite(start);
    const noneOpen = valid && openCount(date, start, hours) === 0;
    empty.hidden = !noneOpen;
    if (noneOpen) {
      const next = nextOpening(date, start, hours, dateRange().max);
      jumpTo = next;
      q('[data-empty-title]').textContent = `No court open from ${span(start, hours)}`;
      const jump = q<HTMLButtonElement>('[data-empty-jump]');
      jump.hidden = !next;
      if (next) {
        const sameDay = next.date === date;
        const when = sameDay ? formatHourShort(next.start) : `${formatLongDate(next.date)}, ${formatHourShort(next.start)}`;
        q('[data-empty-text]').textContent =
          `Every court is booked, pending or closed for part of that time on ${formatLongDate(date)}. ` +
          `The next open start is ${when}, with ${next.count} of ${courts.length} courts free.`;
        q('[data-empty-jump-label]').textContent = sameDay ? `Show ${formatHourShort(next.start)}` : `Show ${when}`;
      } else {
        q('[data-empty-text]').textContent = `No court is open for ${hours} hours in the booking window. Try a shorter duration.`;
      }
    }

    const court = findCourt(courtId);
    pick.hidden = !court || noneOpen;
    if (court) {
      const set = (key: string, value: string) => (q(`[data-pick-field="${key}"]`).textContent = value);
      set('court', court.name);
      set('zone', groupName(court.group));
      set('date', formatLongDate(date));
      set('time', `${formatHour(start)} – ${formatHour(start + hours)}`);
      set('hours', `${hours} ${hours === 1 ? 'hour' : 'hours'}`);
      set('total', formatPeso(slotTotal(court.rate, date, start, hours)));
    }
    q<HTMLElement>('[data-map-source]').hidden = isLive();
  };

  const render = () => {
    renderCourts();
    renderSelectionNews();
    renderZones();
    renderScrubber();
    renderOutcome();
    if (hoverId || focusId) showTip();
    firstRender = false;
  };

  // ---------------------------------------------------------------- interaction

  const activate = (el: SVGGElement) => {
    if (el.getAttribute('aria-disabled') === 'true') {
      focusId = el.dataset.mapCourt!;
      return showTip();
    }
    setCourt(el.dataset.mapCourt!);
  };

  for (const el of courtEls) {
    const id = el.dataset.mapCourt!;
    el.addEventListener('click', () => activate(el));
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(el);
      }
    });
    el.addEventListener('pointerenter', () => {
      hoverId = id;
      showTip();
    });
    el.addEventListener('pointerleave', () => {
      hoverId = '';
      showTip();
    });
    el.addEventListener('focus', () => {
      focusId = id;
      showTip();
    });
    el.addEventListener('blur', () => {
      focusId = '';
      showTip();
    });
  }

  // Escape clears the picked court and closes the tooltip
  map.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    hoverId = '';
    setCourt('');
    tip.classList.remove('is-on');
  });

  for (const el of hourEls) el.addEventListener('click', () => setStart(Number(el.dataset.scrubHour)));

  q('[data-empty-jump]').addEventListener('click', () => {
    if (!jumpTo) return;
    const { date, start } = jumpTo;
    if (date !== dateInput.value) {
      dateInput.value = date;
      change(dateInput);
    }
    setStart(start);
    courtEls.find((el) => el.getAttribute('aria-disabled') === 'false')?.focus();
  });

  // ---------------------------------------------------------------- reveal: courts fade up once, zone by zone

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    svg.setAttribute('data-reveal-pending', '');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
        observer.disconnect();
        requestAnimationFrame(() => svg.removeAttribute('data-reveal-pending'));
      },
      { threshold: 0.25 },
    );
    observer.observe(svg);
  }

  // ---------------------------------------------------------------- start: swap the fallback table for the map

  root.querySelectorAll<HTMLElement>('[data-map-only]').forEach((el) => (el.hidden = false));
  q<HTMLElement>('[data-map-fallback]').hidden = true;
  tip.hidden = false;

  // Size each zone's highlighter band to its label
  for (const zone of zoneEls) {
    const label = zone.querySelector<SVGTextElement>('[data-zone-label]')!.getBBox();
    const band = zone.querySelector<SVGRectElement>('[data-zone-band]')!;
    band.setAttribute('x', String(label.x - 1.5));
    band.setAttribute('width', String(label.width + 3));
  }

  // booking.ts re-checks the form on every change (and when live availability arrives), then fires STATE_EVENT
  root.addEventListener(STATE_EVENT, render);
  render();
  loadAvailability();
}
