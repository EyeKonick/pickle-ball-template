/** Hero quick-book strip: sets today's date, greys out past times, deep-links into #booking. */
import { site } from '../data/site-config';
import { dateRange } from '../utils/slots';
import { fromTimeValue, toIsoDate } from '../utils/format';
import { openBooking } from './booking-link';

const form = document.querySelector<HTMLFormElement>('[data-quickbook]');

if (form) {
  const date = form.querySelector<HTMLInputElement>('input[name="date"]')!;
  const time = form.querySelector<HTMLSelectElement>('select[name="time"]')!;
  const lastStart = site.hours.closeHour - 1;

  const now = new Date();
  const { min, max } = dateRange(now);
  date.min = min;
  date.max = max;
  const first = new Date(now);
  if (now.getHours() >= lastStart) first.setDate(first.getDate() + 1);
  date.value = toIsoDate(first);

  const syncTimes = () => {
    const isToday = date.value === toIsoDate(new Date());
    const hourNow = new Date().getHours();
    for (const option of time.options) {
      option.disabled = isToday && fromTimeValue(option.value) <= hourNow;
    }
    if (time.selectedOptions[0]?.disabled) {
      const next = [...time.options].find((o) => !o.disabled);
      if (next) time.value = next.value;
    }
  };
  syncTimes();
  date.addEventListener('change', syncTimes);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    openBooking({
      date: String(data.get('date') || ''),
      time: String(data.get('time') || ''),
      court: String(data.get('court') || ''),
    });
  });
}
