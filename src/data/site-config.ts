/**
 * Site config: every club detail the site shows lives here.
 * Components read from this file; nothing club-specific is hard-coded elsewhere.
 *
 * Template use: each value marked "SAMPLE: replace per client" is example data.
 * Values ending in _TO_FILL are named placeholders; the build lists any that are
 * still unfilled (see `unfilledPlaceholders` below).
 */

const env = import.meta.env;

/** True when a value is still a named placeholder or empty. */
export const isPlaceholder = (value: string | undefined): boolean =>
  !value || /_TO_FILL$/.test(value);

/** Use `value` when it is filled, otherwise `fallback`. */
const filledOr = (value: string, fallback: string): string => (isPlaceholder(value) ? fallback : value);

// ---------------------------------------------------------------------------
// Raw values: edit these per client
// ---------------------------------------------------------------------------

const RAW = {
  name: 'Dinkwell Pickleball Club', // SAMPLE: replace per client
  shortName: 'Dinkwell', // SAMPLE: replace per client
  wordmark: 'DINKWELL', // SAMPLE: replace per client (text logo used when no logo file exists)

  /** Production domain, e.g. https://www.dinkwellpickleball.ph */
  domain: 'PRODUCTION_DOMAIN_TO_FILL', // SAMPLE: replace per client
  facebookUrl: 'FACEBOOK_URL_TO_FILL', // SAMPLE: replace per client (e.g. https://www.facebook.com/yourpage)
  messengerUrl: 'MESSENGER_URL_TO_FILL', // SAMPLE: replace per client (e.g. https://m.me/yourpage)
  googleMapsUrl: 'GOOGLE_MAPS_URL_TO_FILL', // SAMPLE: replace per client (the club's Google Maps place link)

  /**
   * Google Apps Script web app URL that appends bookings to the Google Sheet.
   * Set PUBLIC_BOOKING_ENDPOINT in .env (preferred), or replace the placeholder.
   * While unfilled, the booking form runs in demo mode and sends nothing.
   */
  bookingEndpoint: env.PUBLIC_BOOKING_ENDPOINT || 'BOOKING_ENDPOINT_TO_FILL', // SAMPLE: replace per client
};

const ADDRESS = {
  street: 'Unit 1, Dinkwell Sports Hub, Tomas Morato Ave.', // SAMPLE: replace per client
  locality: 'Quezon City', // SAMPLE: replace per client
  region: 'Metro Manila', // SAMPLE: replace per client
  postalCode: '1103', // SAMPLE: replace per client
  country: 'PH', // SAMPLE: replace per client
} as const;

/** Full single-line address. */
export const fullAddress = `${ADDRESS.street}, ${ADDRESS.locality} ${ADDRESS.postalCode}`;

// ---------------------------------------------------------------------------
// Club details
// ---------------------------------------------------------------------------

export const site = {
  name: RAW.name,
  shortName: RAW.shortName,
  wordmark: RAW.wordmark,

  tagline: 'Dink till eleven.', // SAMPLE: replace per client
  /** Hero headline, one entry per line of the oversized type. */
  headlineLines: ['Dink', 'till', 'eleven.'], // SAMPLE: replace per client
  /** Index of the headline line that gets the highlighter bar. */
  headlineHighlight: 2,
  heroLede:
    "Quezon City's pickleball club, open daily from 6 AM. Four indoor courts, two covered outdoor, from ₱350 an hour.", // SAMPLE: replace per client
  /** Circular stamp on the hero photo seam (keep to ~32 characters). */
  stampText: 'Open till 11 PM · Quezon City · ', // SAMPLE: replace per client
  description:
    'Dinkwell Pickleball Club: six pickleball courts on Tomas Morato Ave., Quezon City. Four indoor, two covered outdoor, open daily 6 AM to 11 PM. Reserve online and pay via GCash.', // SAMPLE: replace per client

  address: ADDRESS,

  phone: {
    display: '0917 555 0142', // SAMPLE: replace per client
    e164: '+639175550142', // SAMPLE: replace per client (used for tel: links and schema)
  },
  email: 'hello@dinkwellpickleball.ph', // SAMPLE: replace per client

  hours: {
    openHour: 6, // SAMPLE: replace per client (24h clock, first bookable start)
    closeHour: 23, // SAMPLE: replace per client (24h clock, courts close)
    opens: '06:00', // SAMPLE: replace per client (schema.org format)
    closes: '23:00', // SAMPLE: replace per client (schema.org format)
    label: 'Daily 6:00 AM - 11:00 PM', // SAMPLE: replace per client
  },

  priceFrom: 350, // SAMPLE: replace per client (lowest hourly rate in courts.json)
  currency: 'PHP',

  /** Plain-text trust details shown in the masthead. No ratings or awards. */
  trust: ['6 courts', 'Indoor & outdoor', 'Open daily 6AM–11PM', 'Pay via GCash'], // SAMPLE: replace per client

  gcash: {
    accountName: 'DINKWELL PICKLEBALL CLUB', // SAMPLE: replace per client
    accountNumber: '0917 555 0142', // SAMPLE: replace per client
  },

  policy: {
    /** Shown on the review step; the customer must agree to it. */
    cancellation:
      'Free reschedule up to 24 hours before your slot, subject to court availability. Requests made less than 24 hours before the slot cannot be rescheduled or refunded.', // SAMPLE: replace per client
    /** Shown wherever we explain that payment is not confirmation. */
    confirmation:
      'Payment received does not mean your booking is confirmed. Our staff verify every GCash payment, then confirm or reject your request by email and SMS. Until then, your slot is not confirmed.', // SAMPLE: replace per client
    reassurance: 'Reserve online. Pay via GCash. We confirm your slot after verifying your payment.', // SAMPLE: replace per client
  },

  booking: {
    /** How many days ahead a slot can be requested. */
    windowDays: 30, // SAMPLE: replace per client
    maxDurationHours: 3, // SAMPLE: replace per client
    maxPlayers: 8, // SAMPLE: replace per client
    maxUploadMB: 5,
    endpoint: RAW.bookingEndpoint,
  },

  /** Unfilled Facebook/Messenger links fall back to a Facebook search for the club so they still work. */
  links: {
    facebook: filledOr(RAW.facebookUrl, `https://www.facebook.com/search/top?q=${encodeURIComponent(RAW.name)}`),
    messenger: filledOr(RAW.messengerUrl, `https://www.facebook.com/search/top?q=${encodeURIComponent(RAW.name)}`),
    /** sameAs for schema.org: only real, filled profile URLs. */
    sameAs: [RAW.facebookUrl].filter((url) => !isPlaceholder(url)),
    /** Falls back to a Google Maps search for the address until the place link is filled. */
    maps: filledOr(
      RAW.googleMapsUrl,
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${RAW.name}, ${fullAddress}`),
    ),
  },

  nav: [
    { label: 'Courts', href: '#courts' },
    { label: 'Rates', href: '#rates' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ],

  /** Section headlines (one entry per line) and ledes. */
  sections: {
    courts: {
      lines: ['Six courts,', 'rain or shine.'], // SAMPLE: replace per client
      lede: 'Four indoor courts out of the weather and two covered outdoor courts with open air. Every court runs 6 AM to 11 PM, every day of the week.', // SAMPLE: replace per client
    },
    rates: {
      title: 'Rates per court, per hour', // SAMPLE: replace per client
      note: 'You see the exact total before you pay. GCash only.', // SAMPLE: replace per client
    },
    how: {
      lines: ['Reserve. Pay.', 'Then we confirm.'], // SAMPLE: replace per client
      lede: 'Booking takes six steps. The last one is ours: a person checks your GCash payment before your slot is confirmed.', // SAMPLE: replace per client
      calloutLines: ['Paid is not', 'confirmed.'], // SAMPLE: replace per client
    },
    booking: {
      lines: ['Book a court.'], // SAMPLE: replace per client
      lede: 'Pick your court and time, pay the exact amount via GCash, and send us the proof. Our staff confirm your slot after verifying the payment.', // SAMPLE: replace per client
    },
    about: {
      lines: ['Why eleven?'], // SAMPLE: replace per client
      paragraphs: [
        "Because Quezon City doesn't stop at six. Work runs late, Tomas Morato traffic runs later, and the best game of the week is often the one that starts at nine. Dinkwell stays open until 11 PM so the after-work crowd gets real court time, not leftovers.",
        'Four of the six courts are indoor, so rainy season and the afternoon sun cancel nothing. Bring your barkada for doubles, come early for a quiet hour before the office, or book the last slot and dink till eleven.',
      ], // SAMPLE: replace per client
    },
    gallery: {
      lines: ['On court.'], // SAMPLE: replace per client
    },
    contact: {
      lines: ['Find us on', 'Tomas Morato.'], // SAMPLE: replace per client
      lede: 'Questions about a slot or a group booking? Call, text, email or message us on Messenger.', // SAMPLE: replace per client
    },
  },

  cta: {
    book: 'Book a Court',
    rates: 'View Courts & Rates',
    how: 'How Booking Works',
    contact: 'Contact & Directions',
    check: 'Check Availability',
    directions: 'Get Directions',
    messenger: 'Message us on Messenger',
  },
} as const;

/**
 * Canonical site URL. Until the production domain is filled, the email domain is used
 * so canonical and Open Graph URLs stay valid.
 */
export const siteUrl = filledOr(RAW.domain, 'https://www.dinkwellpickleball.ph');

/** True when the booking endpoint is a real URL; otherwise the form runs in demo mode. */
export const bookingEndpointReady = /^https:\/\//.test(site.booking.endpoint);

/** Named placeholders that still need real values (printed during the build). */
export const unfilledPlaceholders = Object.entries(RAW)
  .filter(([, value]) => typeof value === 'string' && isPlaceholder(value))
  .map(([key, value]) => `${key}: ${value}`);

// ---------------------------------------------------------------------------
// Booking data model (shared with the Google Sheet)
// ---------------------------------------------------------------------------

/** Booking statuses. This site only ever creates "Pending Review". */
export const BOOKING_STATUSES = ['Draft', 'Pending Review', 'Confirmed', 'Rejected', 'Expired', 'Cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Google Sheet columns, in order. The Apps Script appends rows in this order. */
export const SHEET_COLUMNS = [
  'Booking Code',
  'Submitted At',
  'Customer Name',
  'Mobile',
  'Email',
  'Court',
  'Date',
  'Start',
  'End',
  'Amount',
  'GCash Ref No.',
  'Screenshot Link',
  'Status',
  'Reviewed By',
  'Reviewed At',
  'Reject Reason',
  'Notes',
] as const;
export type SheetColumn = (typeof SHEET_COLUMNS)[number];
