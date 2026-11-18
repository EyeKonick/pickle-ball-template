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
    │   └── ui/             Button, SectionHeading, CourtCard, BookingStep, Wordmark,
    │                       CourtMap, MapLegend, TimeScrubber, CourtSummary (the court map in booking step 1)
    ├── data/
    │   ├── site-config.ts  club details, links, GCash, policy, section copy, booking data model
    │   ├── courts.json     courts, groups, SAMPLE rates and the floor plan for the court map
    │   ├── availability.json  SAMPLE per-court, per-date, per-hour availability (demo only)
    │   ├── booking-steps.json "How booking works" steps and form progress labels
    │   └── photos.ts       every photo with alt text, caption, credit and crop focus
    ├── layouts/BaseLayout.astro  head, meta, Open Graph, schema.org, fonts
    ├── pages/index.astro
    ├── scripts/            booking.ts (form), court-map.ts (court map), booking-link.ts (deep links), quickbook.ts (hero strip)
    ├── styles/             tokens.css (design tokens), global.css (reset and base type)
    └── utils/              format, slots (courts and pricing), availability (court status), validation, booking-code
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
| Court map floor plan (court positions, zones, reception, entrance) | `src/data/courts.json` → `map` and each court's `map` |
| Sample availability (open, pending, booked, closed) | `src/data/availability.json` |
| Live availability URL | `src/data/site-config.ts` → `AVAILABILITY_ENDPOINT_TO_FILL`, or `PUBLIC_AVAILABILITY_ENDPOINT` in `.env` |
| "How booking works" steps | `src/data/booking-steps.json` |
| Photos, alt text, captions, credits | `src/data/photos.ts` + files in `src/assets/images/` |
| Colors, type scale, spacing | `src/styles/tokens.css` |
| GCash QR | Replace `src/assets/images/payment/gcash-qr-sample.svg` with the club's QR. To use a PNG instead, update the import in `src/components/sections/Booking.astro`. |

### Logo

Put the club's logo at `src/assets/images/brand/logo.svg`. The header and footer pick it up automatically and use it exactly as supplied. Until it exists, the condensed **DINKWELL** wordmark is shown.

### Photos

All six photos are free-license stand-ins from Unsplash and Pexels (credits are in `src/data/photos.ts`, on the page captions and in `dinkwell-photos/CREDITS.md`). Each one is marked `PLACEHOLDER: replace with the club's real photo`. To swap a photo, replace the file in `src/assets/images/` (or change the import in `photos.ts`) and update its alt text and credit. If you change the share photo, regenerate `public/og-image.jpg` at 1200×630.

## Booking flow

1. Court & time: date, start time and 1–3 hours, then a court picked on the court map (or in the court list under it). A court is open only if it is free for the whole duration. Past hours today are always unavailable.
2. Your details: name, Philippine mobile number (`09XX…` or `+639…`), email, players, notes.
3. Review: summary, total, policy, and an "I agree" checkbox.
4. Pay via GCash: QR, account name and number, and the exact amount.
5. Proof of payment: a screenshot (image, 5 MB max, previewed) and the 13-digit GCash reference number.
6. Pending review: a booking code `PB-YYYYMMDD-###` and the "not confirmed until staff verify" message.

The site only ever creates bookings with status **Pending Review**. The full status list (`Draft`, `Pending Review`, `Confirmed`, `Rejected`, `Expired`, `Cancelled`) and the Sheet columns (`SHEET_COLUMNS`) are exported from `site-config.ts`. Staff review happens in the Google Sheet, outside this site.

Deep links prefill step 1: `/?court=court-3&date=2026-11-21&time=19:00&hours=2#booking`. The hero strip and the court cards use the same links. The hero strip sends a court type (`court=any-indoor` or `any-outdoor`), which highlights that zone on the map.

## Court map and availability

The top of booking step 1 is a bird's-eye floor plan drawn as inline SVG from `src/data/courts.json`. Each court shows Open, Pending, Booked or Closed for the chosen date, start time and duration. Clicking an open court picks it in the form, and picking a court in the form highlights it on the map. Without JavaScript, a plain table of courts shows instead.

**Edit the layout** in `courts.json`:

- Each court's `map: { "x", "y" }` is the top-left corner of the court on the plan. Units are roughly feet, and every court is drawn `map.court.width` × `map.court.length` (20 × 44, pickleball proportions).
- `map.zones` are the labelled areas. `group` must match a group id, and `covered: true` draws a dashed roof line. The zone label and "Courts 1–4" line come from that group.
- `map.building` is the outer wall, `map.entrance.x` and `width` are the doorway gap in its bottom wall, and `map.reception` is the desk.
- `map.width` and `map.height` are the size of the whole plan. Keep everything inside them.
- To add or remove a court, add or remove it in `courts` (with `group`, `rate` and `map`). The map, legend, scrubber counts and court list all follow.

**Edit the sample availability** in `src/data/availability.json`. Under `dates`, each date lists, per court, the start hours that are *not* available, by status:

```json
"2026-11-21": {
  "court-3": { "booked": [19, 20], "pending": [18], "closed": [6, 7] }
}
```

Any hour not listed is open. `pending` is a request in **Pending Review** (awaiting staff confirmation), `booked` is **Confirmed**, and `closed` means the court isn't open (maintenance, a private event). Dates that aren't listed copy a sample date by weekday through `weekly` (`0` = Sunday), so the demo keeps working after the sample dates. All status logic is in one function, `courtStatus()` in `src/utils/availability.ts`, used by both the map and the form.

> **The sample availability is for the demo only.** Real availability must come from the same place that stores the bookings (the Google Sheet behind the booking endpoint, or whatever replaces it), so two customers can never book the same slot. A static file can't know about a booking made a minute ago.

**Live availability:** set `PUBLIC_AVAILABILITY_ENDPOINT` in `.env` (or replace `AVAILABILITY_ENDPOINT_TO_FILL` in `site-config.ts`) to a URL that returns JSON in the same shape as `availability.json` (at least `dates`). The page fetches it on load. If it is unset, or the request fails, the page uses the sample data, and the map's legend notes that the availability is a sample. For example, an Apps Script `doGet` can read the Sheet and return each future booking's hours, with *Pending Review* rows as `pending` and *Confirmed* rows as `booked`. Even then, the Apps Script that receives a booking should re-check that the slot is still free before it appends the row.

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

- Set `PUBLIC_BOOKING_ENDPOINT` (and `PUBLIC_AVAILABILITY_ENDPOINT` once you have one) in the host's environment variables. They're read at build time.
- Fill in `PRODUCTION_DOMAIN_TO_FILL` in `site-config.ts` so the canonical and Open Graph URLs point to the real domain.

## SEO

`BaseLayout.astro` outputs the meta title and description, canonical URL, Open Graph and Twitter tags (image: `public/og-image.jpg`), and schema.org `SportsActivityLocation` markup with address, phone, email, opening hours (daily 06:00–23:00) and `sameAs` for the Facebook page once its URL is filled. It has no ratings or reviews.
