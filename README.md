# Dinkwell Pickleball Club: website

The landing page and court-booking flow for Dinkwell Pickleball Club, Quezon City. It's built with [Astro](https://astro.build) as a static site, with a small amount of vanilla TypeScript for the booking form.

The project is a **template**. Every club detail lives in `src/data/`. Values marked `SAMPLE: replace per client` are example data, and values ending in `_TO_FILL` are named placeholders. The build prints any placeholder that is still unfilled.

> Desktop only for now (designed and checked at 1440px). The responsive pass comes later.

## Run it

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve dist/ locally
```

Requires Node 22.12 or newer.

## Project structure

```
/
├── astro.config.mjs        site URL comes from src/data/site-config.ts
├── package.json
├── tsconfig.json
├── .env.example            copy to .env for the booking endpoint
├── public/                 served as-is: favicon.svg, robots.txt, og-image.jpg
└── src/
    ├── assets/images/
    │   ├── courts/         hero and court photos (optimized to WebP at build)
    │   ├── gallery/        gallery photos
    │   ├── payment/        gcash-qr-sample.svg (SAMPLE QR, not scannable)
    │   └── brand/          put logo.svg here (see "Logo" below)
    ├── components/
    │   ├── sections/       Header, Hero, CourtsRates, HowItWorks, Booking, About, Gallery, Location, Footer
    │   └── ui/             Button, SectionHeading, CourtCard, BookingStep, Wordmark
    ├── data/
    │   ├── site-config.ts  club details, links, GCash, policy, section copy, booking data model
    │   ├── courts.json     courts, groups and SAMPLE rates
    │   ├── availability.json  SAMPLE taken slots
    │   ├── booking-steps.json "How booking works" steps and form progress labels
    │   └── photos.ts       every photo with alt text, caption, credit and crop focus
    ├── layouts/BaseLayout.astro  head, meta, Open Graph, schema.org, fonts
    ├── pages/index.astro
    ├── scripts/            booking.ts (form), booking-link.ts (deep links), quickbook.ts (hero strip)
    ├── styles/             tokens.css (design tokens), global.css (reset and base type)
    └── utils/              format, slots (availability and pricing), validation, booking-code
```

## Where to edit

| What | File |
| --- | --- |
| Name, tagline, hero text, address, phone, email, hours | `src/data/site-config.ts` |
| Facebook, Messenger, Google Maps link, production domain | `src/data/site-config.ts` (`RAW` block, the `_TO_FILL` values) |
| GCash account name and number | `src/data/site-config.ts` → `gcash` |
| Cancellation and reschedule policy, confirmation wording | `src/data/site-config.ts` → `policy` |
| Section headlines and intro text | `src/data/site-config.ts` → `sections` |
| Courts, court descriptions, rates and off-peak window | `src/data/courts.json` |
| Taken slots (sample availability) | `src/data/availability.json` |
| "How booking works" steps | `src/data/booking-steps.json` |
| Photos, alt text, captions, credits | `src/data/photos.ts` + files in `src/assets/images/` |
| Colors, type scale, spacing | `src/styles/tokens.css` |
| GCash QR | Replace `src/assets/images/payment/gcash-qr-sample.svg` with the club's QR. To use a PNG instead, update the import in `src/components/sections/Booking.astro`. |

### Logo

Put the club's logo at `src/assets/images/brand/logo.svg`. The header and footer pick it up automatically and use it exactly as supplied. Until it exists, the condensed **DINKWELL** wordmark is shown.

### Photos

All six photos are free-license stand-ins from Unsplash and Pexels (credits are in `src/data/photos.ts`, on the page captions and in `dinkwell-photos/CREDITS.md`). Each one is marked `PLACEHOLDER: replace with the club's real photo`. To swap a photo, replace the file in `src/assets/images/` (or change the import in `photos.ts`) and update its alt text and credit. If you change the share photo, regenerate `public/og-image.jpg` at 1200×630.

## Booking flow

1. Court & time: a specific court or "Any indoor / Any outdoor", date, start time, 1–3 hours. Taken slots come from `availability.json`; past hours today are always unavailable.
2. Your details: name, Philippine mobile number (`09XX…` or `+639…`), email, players, notes.
3. Review: summary, total, policy, and an "I agree" checkbox.
4. Pay via GCash: QR, account name and number, and the exact amount.
5. Proof of payment: a screenshot (image, 5 MB max, previewed) and the 13-digit GCash reference number.
6. Pending review: a booking code `PB-YYYYMMDD-###` and the "not confirmed until staff verify" message.

The site only ever creates bookings with status **Pending Review**. The full status list (`Draft`, `Pending Review`, `Confirmed`, `Rejected`, `Expired`, `Cancelled`) and the Sheet columns (`SHEET_COLUMNS`) are exported from `site-config.ts`. Staff review happens in the Google Sheet, outside this site.

Deep links prefill step 1: `/?court=court-3&date=2026-11-21&time=19:00&hours=2#booking`. The hero strip and the court cards use the same links.

## Connect the Google Sheet

Bookings are POSTed as JSON (with the screenshot as base64) to a Google Apps Script web app, which saves the screenshot to Drive and appends a row to the Sheet.

1. Create a Google Sheet. In row 1, enter the headers in this order: Booking Code, Submitted At, Customer Name, Mobile, Email, Court, Date, Start, End, Amount, GCash Ref No., Screenshot Link, Status, Reviewed By, Reviewed At, Reject Reason, Notes.
2. In the Sheet, open **Extensions → Apps Script** and paste:

   ```js
   const FOLDER_NAME = 'Dinkwell booking screenshots';

   function doPost(e) {
     try {
       const data = JSON.parse(e.postData.contents);
       const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

       // Reject duplicate booking codes
       const codes = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues().flat();
       if (codes.includes(data.bookingCode)) return json({ ok: false, error: 'duplicate-code' });

       // Save the screenshot to Drive
       const folders = DriveApp.getFoldersByName(FOLDER_NAME);
       const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
       const blob = Utilities.newBlob(
         Utilities.base64Decode(data.screenshot.base64),
         data.screenshot.mimeType,
         `${data.bookingCode}-${data.screenshot.fileName}`,
       );
       const file = folder.createFile(blob);

       // Row arrives in SHEET_COLUMNS order; fill in the screenshot link
       const row = data.row.slice();
       row[data.columns.indexOf('Screenshot Link')] = file.getUrl();
       sheet.appendRow(row);

       return json({ ok: true, bookingCode: data.bookingCode });
     } catch (err) {
       return json({ ok: false, error: String(err) });
     }
   }

   function json(body) {
     return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. **Deploy → New deployment → Web app**. Set "Execute as" to *Me* and "Who has access" to *Anyone*. Copy the web app URL (it ends in `/exec`).
4. Put the URL in a `.env` file at the project root (it's git-ignored):

   ```
   PUBLIC_BOOKING_ENDPOINT=https://script.google.com/macros/s/…/exec
   ```

   Or replace `BOOKING_ENDPOINT_TO_FILL` in `src/data/site-config.ts`. Then rebuild.

While no endpoint is set, the form runs in **demo mode**: it simulates a successful submit, shows the Pending Review screen with a small note that no data was sent, and sends nothing. If a real submit fails, the form shows a retry message and keeps everything the customer entered.

## Deploy

`npm run build` produces a static site in `dist/`. Upload it to any static host: Netlify, Vercel, Cloudflare Pages, GitHub Pages or your own server.

- Set `PUBLIC_BOOKING_ENDPOINT` in the host's environment variables (it's read at build time).
- Fill in `PRODUCTION_DOMAIN_TO_FILL` in `site-config.ts` so the canonical and Open Graph URLs point to the real domain.

## SEO

`BaseLayout.astro` outputs the meta title and description, canonical URL, Open Graph and Twitter tags (image: `public/og-image.jpg`), and schema.org `SportsActivityLocation` markup with address, phone, email, opening hours (daily 06:00–23:00) and `sameAs` for the Facebook page once its URL is filled. It has no ratings or reviews.
