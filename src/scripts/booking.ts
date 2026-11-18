/**
 * Booking form: steps, court availability, live total, validation, screenshot preview,
 * and submission to the Google Apps Script endpoint (or demo mode when it is not set).
 * Only ever creates bookings with status "Pending Review".
 *
 * The form owns the booking state (date, start, duration, court). The court map
 * (court-map.ts) writes to the same inputs and re-renders on STATE_EVENT.
 */
import { site, bookingEndpointReady, SHEET_COLUMNS, type BookingStatus, type SheetColumn } from '../data/site-config';
import steps from '../data/booking-steps.json';
import { dateRange, defaultStart, findCourt, groupName, rates, slotTotal, startHours, type Court } from '../utils/slots';
import { AVAILABILITY_EVENT, courtStatus, isPastHour, openCount, STATUS_LABELS } from '../utils/availability';
import { formatHour, formatLongDate, formatPeso, fromIsoDate, fromTimeValue, toIsoDate, toTimeValue } from '../utils/format';
import {
  normalizeGcashRef,
  normalizePhMobile,
  validateEmail,
  validateGcashRef,
  validateName,
  validatePhMobile,
  validateScreenshot,
} from '../utils/validation';
import { createBookingCode } from '../utils/booking-code';
import { PREFILL_EVENT, STATE_EVENT, readPrefill, type BookingPrefill } from './booking-link';

const PENDING_STATUS: BookingStatus = 'Pending Review';
const STEP_IDS = steps.formSteps.map((s) => s.id);
const LAST_FORM_STEP = STEP_IDS.indexOf('proof');

const root = document.querySelector<HTMLElement>('[data-booking]');
if (root) initBooking(root);

function initBooking(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-booking-form]')!;
  const progress = root.querySelector<HTMLOListElement>('.progress')!;
  const field = <T extends Element>(name: string) => form.elements.namedItem(name) as unknown as T;
  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;

  const dateInput = field<HTMLInputElement>('date');
  const startSelect = field<HTMLSelectElement>('start');
  const courtInputs = [...form.querySelectorAll<HTMLInputElement>('input[name="court"]')];
  const courtFieldset = courtInputs[0].closest('fieldset')!;
  const courtError = q<HTMLElement>('#bk-court-error');
  const shotInput = field<HTMLInputElement>('screenshot');
  const preview = q<HTMLElement>('[data-upload-preview]');
  const uploadPrompt = q<HTMLElement>('[data-upload-prompt]');
  const submitButton = q<HTMLButtonElement>('[data-submit]');
  const submitError = q<HTMLElement>('[data-submit-error]');

  let current = 0;
  let screenshot: { file: File; dataUrl: string } | null = null;

  // ---------------------------------------------------------------- state

  const selection = () => {
    const data = new FormData(form);
    const court = findCourt(String(data.get('court') ?? ''));
    const date = String(data.get('date') ?? '');
    const start = fromTimeValue(String(data.get('start') ?? ''));
    const hours = Number(data.get('hours') ?? 1);
    return { court, date, start, hours, hasSlot: !!court && !!fromIsoDate(date) && Number.isFinite(start) };
  };

  const courtLabel = (court: Court) => `${court.name} (${groupName(court.group)})`;

  const rateNote = (court: Court) =>
    court.rate === 'indoor'
      ? `Indoor ${formatPeso(rates.indoor.standard)}/hour, ${formatPeso(rates.indoor.offPeak.amount)} off-peak (${rates.indoor.offPeak.label}).`
      : `Covered outdoor ${formatPeso(rates.outdoor.standard)}/hour.`;

  const total = () => {
    const s = selection();
    return s.hasSlot && s.court ? slotTotal(s.court.rate, s.date, s.start, s.hours) : 0;
  };

  /** Tell the court map the state has settled. */
  const emitState = () => root.dispatchEvent(new CustomEvent(STATE_EVENT));

  // ---------------------------------------------------------------- errors

  const setError = (control: Element, errorEl: HTMLElement, message: string) => {
    control.setAttribute('aria-invalid', message ? 'true' : 'false');
    errorEl.textContent = message;
  };

  const check = (name: string, message: string) => {
    const control = field<HTMLInputElement>(name);
    setError(control, q<HTMLElement>(`#${control.getAttribute('aria-describedby')?.split(' ').pop()}`), message);
    return !message;
  };

  // ---------------------------------------------------------------- starts, courts and summary

  const setDateDefaults = () => {
    const now = new Date();
    const { min, max } = dateRange(now);
    dateInput.min = min;
    dateInput.max = max;
    const first = new Date(now);
    if (now.getHours() >= site.hours.closeHour - 1) first.setDate(first.getDate() + 1);
    dateInput.value = toIsoDate(first);
    startSelect.value = toTimeValue(defaultStart(dateInput.value, now));
  };

  /** Start options: past starts and starts that run past closing are disabled; the rest show their open-court count. */
  const renderStarts = () => {
    const { date, hours } = selection();
    const now = new Date();
    const validDate = !!fromIsoDate(date);
    for (const option of startSelect.options) {
      const hour = fromTimeValue(option.value);
      const unusable = isPastHour(date, hour, now) || hour + hours > site.hours.closeHour;
      option.disabled = unusable;
      option.textContent =
        unusable || !validDate
          ? `${formatHour(hour)}${unusable ? ' (unavailable)' : ''}`
          : `${formatHour(hour)} · ${openCount(date, hour, hours, now)} open`;
    }
    if (startSelect.selectedOptions[0]?.disabled) {
      const usable = [...startSelect.options].filter((o) => !o.disabled);
      const fallback = usable.find((o) => o.value > startSelect.value) ?? usable[usable.length - 1];
      if (fallback) startSelect.value = fallback.value;
    }
  };

  /** Court tiles: only courts open for the whole slot can be picked. Returns the name of a picked court that stopped being open. */
  const renderCourts = (): string => {
    const { date, start, hours } = selection();
    const now = new Date();
    let released = '';
    for (const input of courtInputs) {
      const court = findCourt(input.value)!;
      const status = courtStatus(court.id, date, start, hours, now);
      input.disabled = status !== 'available';
      if (input.disabled && input.checked) {
        input.checked = false;
        released = court.name;
      }
      q<HTMLElement>(`[data-tile-status="${court.id}"]`).textContent = `${groupName(court.group)} · ${STATUS_LABELS[status]}`;
    }
    return released;
  };

  /** Re-check starts and courts after the date, start, duration or availability changed. */
  const renderSlot = () => {
    renderStarts();
    const released = renderCourts();
    if (released) {
      setError(courtFieldset, courtError, `${released} is not open for the whole of your new time. Pick another open court.`);
    } else if (selection().court) {
      setError(courtFieldset, courtError, '');
    }
    renderSummary();
    emitState();
  };

  const setSummary = (key: string, value: string) => {
    q<HTMLElement>(`[data-sum="${key}"]`).textContent = value;
  };

  const renderSummary = () => {
    const s = selection();
    setSummary('court', s.court ? courtLabel(s.court) : '–');
    setSummary('date', fromIsoDate(s.date) ? formatLongDate(s.date) : '–');
    setSummary('time', s.hasSlot ? `${formatHour(s.start)} – ${formatHour(s.start + s.hours)}` : 'Pick a court');
    setSummary('hours', `${s.hours} ${s.hours === 1 ? 'hour' : 'hours'}`);
    setSummary('total', s.hasSlot ? formatPeso(total()) : '–');
    setSummary('rate', s.court ? rateNote(s.court) : '');
    q<HTMLElement>('[data-amount]').textContent = formatPeso(total());
  };

  const reviewRows = (): [string, string][] => {
    const s = selection();
    const data = new FormData(form);
    const notes = String(data.get('notes') ?? '').trim();
    return [
      ['Court', s.court ? courtLabel(s.court) : ''],
      ['Date', formatLongDate(s.date)],
      ['Time', `${formatHour(s.start)} – ${formatHour(s.start + s.hours)}`],
      ['Duration', `${s.hours} ${s.hours === 1 ? 'hour' : 'hours'}`],
      ['Name', String(data.get('name') ?? '').trim()],
      ['Mobile', String(data.get('mobile') ?? '').trim()],
      ['Email', String(data.get('email') ?? '').trim()],
      ['Players', String(data.get('players') ?? '')],
      ...(notes ? ([['Notes', notes]] as [string, string][]) : []),
      ['Total', formatPeso(total())],
    ];
  };

  const renderReview = (target: HTMLElement) => {
    target.replaceChildren(
      ...reviewRows().map(([label, value]) => {
        const row = document.createElement('div');
        if (label === 'Total') row.className = 'review__total';
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = label;
        dd.textContent = value;
        row.append(dt, dd);
        return row;
      }),
    );
  };

  // ---------------------------------------------------------------- validation per step

  const validators: Record<string, () => boolean> = {
    slot: () => {
      const s = selection();
      const { min, max } = dateRange();
      const dateOk = check('date', !fromIsoDate(s.date) || s.date < min || s.date > max ? `Pick a date from today to ${formatLongDate(max)}.` : '');
      const courtOk = s.hasSlot && courtStatus(s.court!.id, s.date, s.start, s.hours) === 'available';
      if (!courtOk && dateOk) {
        setError(courtFieldset, courtError, courtError.textContent || 'Pick an open court on the map or in the list to continue.');
      }
      return dateOk && courtOk;
    },
    details: () =>
      [
        check('name', validateName(field<HTMLInputElement>('name').value)),
        check('mobile', validatePhMobile(field<HTMLInputElement>('mobile').value)),
        check('email', validateEmail(field<HTMLInputElement>('email').value)),
      ].every(Boolean),
    review: () =>
      check('agree', field<HTMLInputElement>('agree').checked ? '' : 'Tick the box to agree to the policy before you pay.'),
    payment: () => true,
    proof: () =>
      [
        check('screenshot', validateScreenshot(shotInput.files?.[0], site.booking.maxUploadMB)),
        check('gcashRef', validateGcashRef(field<HTMLInputElement>('gcashRef').value)),
      ].every(Boolean),
  };

  const focusFirstInvalid = () => {
    const step = root.querySelector<HTMLElement>(`[data-step="${STEP_IDS[current]}"]`);
    const invalid = step?.querySelector<HTMLElement>('[aria-invalid="true"]:not(fieldset)');
    if (invalid) return invalid.focus();
    if (STEP_IDS[current] === 'slot' && !selection().hasSlot) {
      // The first open court on the map, or in the list when the map isn't running
      const onMap = root.querySelector<HTMLElement>('[data-map-court][aria-disabled="false"]');
      (onMap?.getClientRects().length ? onMap : courtInputs.find((i) => !i.disabled))?.focus();
    }
  };

  // ---------------------------------------------------------------- navigation

  const goTo = (index: number) => {
    current = index;
    const id = STEP_IDS[index];
    STEP_IDS.forEach((stepId, i) => {
      root.querySelector<HTMLElement>(`[data-step="${stepId}"]`)!.hidden = i !== index;
      const item = progress.querySelector<HTMLElement>(`[data-progress="${stepId}"]`)!;
      item.toggleAttribute('data-done', i < index || (index === STEP_IDS.length - 1 && i === index));
      if (i === index) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    progress.style.setProperty('--fill', (index / (STEP_IDS.length - 1)).toFixed(3)); // 0–1, scales the rail fill
    root.dataset.step = id; // step 1 widens the form for the court map (see Booking.astro)
    form.hidden = index === STEP_IDS.length - 1;
    q<HTMLElement>('[data-ticket]').hidden = index === STEP_IDS.length - 1;

    if (id === 'review') renderReview(q<HTMLElement>('[data-review]'));
    const heading = root.querySelector<HTMLElement>(`[data-step="${id}"] h3`)!;
    if (root.getBoundingClientRect().top < 0) root.scrollIntoView({ block: 'start' });
    heading.focus({ preventScroll: true });
  };

  const next = () => {
    if (!validators[STEP_IDS[current]]()) {
      focusFirstInvalid();
      return;
    }
    goTo(current + 1);
  };

  form.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (target.closest('[data-next]')) next();
    if (target.closest('[data-back]')) goTo(Math.max(0, current - 1));
  });

  // ---------------------------------------------------------------- live updates

  form.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.name === 'date') check('date', '');
    if (['date', 'start', 'hours'].includes(target.name)) renderSlot();
    if (target.name === 'court') {
      delete root.dataset.zone; // a picked court replaces the zone highlight from the hero strip
      setError(courtFieldset, courtError, '');
      renderSummary();
      emitState();
    }
    if (target.name === 'agree' && target.checked) check('agree', '');
  });

  // Clear an error as soon as the field becomes valid
  form.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.getAttribute('aria-invalid') !== 'true') return;
    const rules: Record<string, (v: string) => string> = {
      name: validateName,
      mobile: validatePhMobile,
      email: validateEmail,
      gcashRef: validateGcashRef,
    };
    if (rules[target.name] && !rules[target.name](target.value)) check(target.name, '');
  });

  shotInput.addEventListener('change', () => {
    const file = shotInput.files?.[0];
    const error = validateScreenshot(file, site.booking.maxUploadMB);
    check('screenshot', error);
    screenshot = null;
    preview.replaceChildren();
    preview.hidden = true;
    uploadPrompt.hidden = false;
    if (error || !file) return;
    const reader = new FileReader();
    reader.onload = () => {
      screenshot = { file, dataUrl: String(reader.result) };
      const img = new Image();
      img.src = screenshot.dataUrl;
      img.alt = `Preview of ${file.name}`;
      preview.replaceChildren(img);
      preview.hidden = false;
      uploadPrompt.hidden = true;
    };
    reader.readAsDataURL(file);
  });

  // ---------------------------------------------------------------- submit

  const buildPayload = (bookingCode: string) => {
    const s = selection();
    const data = new FormData(form);
    const court = s.court!;
    const amount = total();
    const players = String(data.get('players') ?? '');
    const notes = String(data.get('notes') ?? '').trim();
    const submittedAt = new Date().toISOString();
    const values = {
      name: String(data.get('name') ?? '').trim(),
      mobile: normalizePhMobile(String(data.get('mobile') ?? '')),
      email: String(data.get('email') ?? '').trim(),
      gcashRef: normalizeGcashRef(String(data.get('gcashRef') ?? '')),
    };
    const row: Record<SheetColumn, string | number> = {
      'Booking Code': bookingCode,
      'Submitted At': submittedAt,
      'Customer Name': values.name,
      Mobile: values.mobile,
      Email: values.email,
      Court: courtLabel(court),
      Date: s.date,
      Start: toTimeValue(s.start),
      End: toTimeValue(s.start + s.hours),
      Amount: amount,
      'GCash Ref No.': values.gcashRef,
      'Screenshot Link': '', // filled by the Apps Script after it saves the image to Drive
      Status: PENDING_STATUS,
      'Reviewed By': '',
      'Reviewed At': '',
      'Reject Reason': '',
      Notes: [`Players: ${players}`, notes].filter(Boolean).join(' · '),
    };
    return {
      bookingCode,
      submittedAt,
      status: PENDING_STATUS,
      customer: { name: values.name, mobile: values.mobile, email: values.email, players: Number(players) },
      court: { id: court.id, label: courtLabel(court) },
      date: s.date,
      start: toTimeValue(s.start),
      end: toTimeValue(s.start + s.hours),
      durationHours: s.hours,
      amount,
      currency: site.currency,
      gcashRef: values.gcashRef,
      notes,
      screenshot: {
        fileName: screenshot!.file.name,
        mimeType: screenshot!.file.type,
        base64: screenshot!.dataUrl.split(',')[1] ?? '',
      },
      columns: SHEET_COLUMNS,
      row: SHEET_COLUMNS.map((c) => row[c]),
    };
  };

  const send = async (payload: ReturnType<typeof buildPayload>) => {
    if (!bookingEndpointReady) {
      await new Promise((resolve) => setTimeout(resolve, 900));
      return { demo: true };
    }
    // text/plain keeps this a "simple" request, which Google Apps Script web apps accept cross-origin.
    const response = await fetch(site.booking.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json().catch(() => ({}));
    if (result && result.ok === false) throw new Error(result.error || 'Rejected by endpoint');
    return { demo: false };
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    // Enter in an earlier step acts as "Next"
    if (current !== LAST_FORM_STEP) return next();
    if (!validators.proof() || !screenshot) return focusFirstInvalid();

    submitError.hidden = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.disabled = true;
    const bookingCode = createBookingCode();
    try {
      const { demo } = await send(buildPayload(bookingCode));
      q<HTMLElement>('[data-code]').textContent = bookingCode;
      renderReview(q<HTMLElement>('[data-pending-review]'));
      q<HTMLElement>('[data-demo-note]').hidden = !demo;
      goTo(STEP_IDS.length - 1);
    } catch {
      submitError.hidden = false;
      q<HTMLElement>('[data-submit-label]').textContent = 'Try again';
      submitError.focus();
    } finally {
      submitButton.removeAttribute('aria-busy');
      submitButton.disabled = false;
    }
  });

  q<HTMLElement>('[data-restart]').addEventListener('click', () => {
    form.reset();
    screenshot = null;
    preview.replaceChildren();
    preview.hidden = true;
    uploadPrompt.hidden = false;
    q<HTMLElement>('[data-submit-label]').textContent = 'Submit request';
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.setAttribute('aria-invalid', 'false'));
    form.querySelectorAll('.field__error').forEach((el) => (el.textContent = ''));
    delete root.dataset.zone;
    setDateDefaults();
    renderSlot();
    goTo(0);
  });

  // ---------------------------------------------------------------- prefill (hero strip, court cards, URL)

  /**
   * `court` is a court id (court cards) or "any-<zone>" (the hero strip's court type), which highlights
   * that zone on the map. A court that isn't open stays unpicked, with a note, and its zone is highlighted.
   */
  const applyPrefill = (prefill: BookingPrefill, fromUser: boolean) => {
    const { min, max } = dateRange();
    if (prefill.date && fromIsoDate(prefill.date) && prefill.date >= min && prefill.date <= max) {
      dateInput.value = prefill.date;
    }
    const hours = Number(prefill.hours);
    if (hours >= 1 && hours <= site.booking.maxDurationHours) {
      form.querySelector<HTMLInputElement>(`input[name="hours"][value="${hours}"]`)!.checked = true;
    }
    if (prefill.time && startHours.includes(fromTimeValue(prefill.time))) startSelect.value = prefill.time;
    renderStarts();

    const court = prefill.court ? findCourt(prefill.court) : undefined;
    const zone = prefill.court?.startsWith('any-') ? prefill.court.slice(4) : court?.group;
    if (zone) root.dataset.zone = zone;
    if (fromUser || court) courtInputs.forEach((i) => (i.checked = false));
    renderCourts();
    setError(courtFieldset, courtError, '');
    if (court) {
      const input = courtInputs.find((i) => i.value === court.id)!;
      if (!input.disabled) {
        input.checked = true;
        delete root.dataset.zone;
      } else {
        const s = selection();
        setError(
          courtFieldset,
          courtError,
          `${court.name} is not open from ${formatHour(s.start)} to ${formatHour(s.start + s.hours)} on ${formatLongDate(s.date)}. Pick another time, or another open court.`,
        );
      }
    }
    renderSummary();
    emitState();
    if (fromUser && current !== 0) goTo(0);
  };

  document.addEventListener(PREFILL_EVENT, (event) => applyPrefill((event as CustomEvent<BookingPrefill>).detail, true));
  document.addEventListener(AVAILABILITY_EVENT, renderSlot);

  // ---------------------------------------------------------------- start

  setDateDefaults();
  renderSlot();
  applyPrefill(readPrefill(location.search), false);
}
