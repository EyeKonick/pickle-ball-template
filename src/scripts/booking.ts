/**
 * Booking form: steps, sample availability, live total, validation, screenshot preview,
 * and submission to the Google Apps Script endpoint (or demo mode when it is not set).
 * Only ever creates bookings with status "Pending Review".
 */
import { site, bookingEndpointReady, SHEET_COLUMNS, type BookingStatus, type SheetColumn } from '../data/site-config';
import steps from '../data/booking-steps.json';
import { dateRange, findChoice, freeCourts, groups, rates, slotTotal, type CourtChoice } from '../utils/slots';
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
import { PREFILL_EVENT, readPrefill, type BookingPrefill } from './booking-link';

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
  const slotInputs = [...form.querySelectorAll<HTMLInputElement>('input[name="start"]')];
  const slotError = q<HTMLElement>('#bk-slot-error');
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
    const choice = findChoice(String(data.get('court') ?? ''));
    const date = String(data.get('date') ?? '');
    const start = fromTimeValue(String(data.get('start') ?? ''));
    const hours = Number(data.get('hours') ?? 1);
    return { choice, date, start, hours, hasSlot: !!choice && !!fromIsoDate(date) && Number.isFinite(start) };
  };

  const courtLabel = (choice: CourtChoice) => {
    const group = groups.find((g) => g.id === choice.group);
    return choice.courtIds.length > 1 && group ? `${choice.label} (${group.courtsLabel})` : choice.label;
  };

  const rateNote = (choice: CourtChoice) =>
    choice.group === 'indoor'
      ? `Indoor ${formatPeso(rates.indoor.standard)}/hour, ${formatPeso(rates.indoor.offPeak.amount)} off-peak (${rates.indoor.offPeak.label}).`
      : `Covered outdoor ${formatPeso(rates.outdoor.standard)}/hour.`;

  const total = () => {
    const s = selection();
    return s.hasSlot && s.choice ? slotTotal(s.choice.group, s.date, s.start, s.hours) : 0;
  };

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

  // ---------------------------------------------------------------- slots and summary

  const setDateDefaults = () => {
    const now = new Date();
    const { min, max } = dateRange(now);
    dateInput.min = min;
    dateInput.max = max;
    const first = new Date(now);
    if (now.getHours() >= site.hours.closeHour - 1) first.setDate(first.getDate() + 1);
    dateInput.value = toIsoDate(first);
  };

  const renderSlots = () => {
    const { choice, date, hours } = selection();
    const now = new Date();
    let anyFree = false;
    let lostSelection = false;
    for (const input of slotInputs) {
      const hour = fromTimeValue(input.value);
      const free = !!choice && !!fromIsoDate(date) && freeCourts(choice, date, hour, hours, now).length > 0;
      input.disabled = !free;
      input.setAttribute('aria-label', `${formatHour(hour)}${free ? '' : ', unavailable'}`);
      if (free) anyFree = true;
      if (!free && input.checked) {
        input.checked = false;
        lostSelection = true;
      }
    }
    const fieldset = slotInputs[0].closest('fieldset')!;
    if (!anyFree) {
      setError(fieldset, slotError, 'No free start times on this date for this court and duration. Try another day, fewer hours, or any indoor or outdoor court.');
    } else if (lostSelection) {
      setError(fieldset, slotError, 'Your start time is not free for this court and duration. Pick another time.');
    } else {
      setError(fieldset, slotError, '');
    }
    renderSummary();
  };

  const setSummary = (key: string, value: string) => {
    q<HTMLElement>(`[data-sum="${key}"]`).textContent = value;
  };

  const renderSummary = () => {
    const s = selection();
    setSummary('court', s.choice ? courtLabel(s.choice) : '–');
    setSummary('date', fromIsoDate(s.date) ? formatLongDate(s.date) : '–');
    setSummary('time', s.hasSlot ? `${formatHour(s.start)} – ${formatHour(s.start + s.hours)}` : 'Pick a start time');
    setSummary('hours', `${s.hours} ${s.hours === 1 ? 'hour' : 'hours'}`);
    setSummary('total', s.hasSlot ? formatPeso(total()) : '–');
    setSummary('rate', s.choice ? rateNote(s.choice) : '');
    q<HTMLElement>('[data-amount]').textContent = formatPeso(total());
  };

  const reviewRows = (): [string, string][] => {
    const s = selection();
    const data = new FormData(form);
    const notes = String(data.get('notes') ?? '').trim();
    return [
      ['Court', s.choice ? courtLabel(s.choice) : ''],
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
      const fieldset = slotInputs[0].closest('fieldset')!;
      const slotOk = s.hasSlot;
      if (!slotOk && dateOk) setError(fieldset, slotError, slotError.textContent || 'Pick a start time.');
      return dateOk && slotOk;
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
    step?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    if (STEP_IDS[current] === 'slot' && !selection().hasSlot) slotInputs.find((i) => !i.disabled)?.focus();
  };

  // ---------------------------------------------------------------- navigation

  const goTo = (index: number) => {
    current = index;
    STEP_IDS.forEach((id, i) => {
      root.querySelector<HTMLElement>(`[data-step="${id}"]`)!.hidden = i !== index;
      const item = progress.querySelector<HTMLElement>(`[data-progress="${id}"]`)!;
      item.toggleAttribute('data-done', i < index || (index === STEP_IDS.length - 1 && i === index));
      if (i === index) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    progress.style.setProperty('--fill', (index / (STEP_IDS.length - 1)).toFixed(3)); // 0–1, scales the rail fill
    form.hidden = index === STEP_IDS.length - 1;
    q<HTMLElement>('[data-ticket]').hidden = index === STEP_IDS.length - 1;

    const id = STEP_IDS[index];
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
    if (['court', 'date', 'hours'].includes(target.name)) renderSlots();
    if (target.name === 'start') {
      setError(slotInputs[0].closest('fieldset')!, slotError, '');
      renderSummary();
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
    const choice = s.choice!;
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
      Court: courtLabel(choice),
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
      court: { choice: choice.id, label: courtLabel(choice), freeCourts: freeCourts(choice, s.date, s.start, s.hours) },
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
    setDateDefaults();
    renderSlots();
    goTo(0);
  });

  // ---------------------------------------------------------------- prefill (hero strip, court cards, URL)

  const applyPrefill = (prefill: BookingPrefill, fromUser: boolean) => {
    if (prefill.court && findChoice(prefill.court)) {
      form.querySelector<HTMLInputElement>(`input[name="court"][value="${prefill.court}"]`)!.checked = true;
    }
    const { min, max } = dateRange();
    if (prefill.date && fromIsoDate(prefill.date) && prefill.date >= min && prefill.date <= max) {
      dateInput.value = prefill.date;
    }
    const hours = Number(prefill.hours);
    if (hours >= 1 && hours <= site.booking.maxDurationHours) {
      form.querySelector<HTMLInputElement>(`input[name="hours"][value="${hours}"]`)!.checked = true;
    }
    renderSlots();
    if (prefill.time) {
      const slot = slotInputs.find((i) => i.value === prefill.time);
      if (slot && !slot.disabled) {
        slot.checked = true;
        renderSummary();
      } else if (slot) {
        setError(slotInputs[0].closest('fieldset')!, slotError, `${formatHour(fromTimeValue(prefill.time))} is taken for this court. Pick another time, or try any indoor or outdoor court.`);
      }
    }
    if (fromUser && current !== 0) goTo(0);
  };

  document.addEventListener(PREFILL_EVENT, (event) => applyPrefill((event as CustomEvent<BookingPrefill>).detail, true));

  // ---------------------------------------------------------------- start

  setDateDefaults();
  renderSlots();
  applyPrefill(readPrefill(location.search), false);
}
