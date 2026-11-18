# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (static output) at the project root, with minimal vanilla TypeScript on the client for the booking form and animations, and no UI framework. Club content lives in `src/data/` (`site-config.ts`, `courts.json`, `availability.json`, `booking-steps.json`). The site is a template: every client fact is marked "SAMPLE: replace per client". Desktop-first at 1440px; the responsive pass comes later (set by the client brief, 2026-11-18).

## Users

Players in and around Quezon City, Metro Manila: after-work and early-morning recreational players, groups of friends (barkada) and regulars. They come to the site for one answer: can I get a court when I want to play, and how do I reserve it?

## Product Purpose

Dinkwell Pickleball Club is a pickleball facility at Unit 1, Dinkwell Sports Hub, Tomas Morato Ave., Quezon City 1103. It has 6 courts: Courts 1–4 indoor and Courts 5–6 covered outdoor. Open daily 6:00 AM–11:00 PM. Courts from ₱350 per hour. The website's job is to get visitors to submit a court reservation. Success is a completed reservation request with GCash proof of payment.

## Positioning

A dedicated pickleball facility (not a tennis club with pickleball lines), with indoor courts for Metro Manila heat and rain, late hours (until 11 PM: "Dink till eleven.") and online reservation paid via GCash.

## Operating Context

- Booking flow: choose court and time → enter details → pay via GCash → upload a screenshot and the 13-digit reference number → submit → wait for confirmation.
- **Payment received does not mean confirmed.** Staff verify the payment, then confirm or reject by email and SMS. Before staff review, copy never says "booked" or "confirmed".
- Booking statuses: Draft, Pending Review, Confirmed, Rejected, Expired, Cancelled. The website creates only Pending Review. Staff review happens outside the site, in a Google Sheet fed by a Google Apps Script web app.
- Booking codes use the format PB-YYYYMMDD-###.

## Capabilities and Constraints

- Contact: phone 0917 555 0142, email hello@dinkwellpickleball.ph. Payment is GCash only.
- Sample rates (to be replaced per client): Indoor ₱450/hour, or ₱350 off-peak (weekdays 6 AM–4 PM). Covered Outdoor ₱350/hour.
- Sample policy: free reschedule up to 24 hours before the slot.
- Not yet provided: Facebook page URL, Messenger link, Google Maps place link, production domain, Apps Script endpoint, the real GCash QR, account name and number, and the logo file (`dinkwell-photos/logo.svg` is absent, so the condensed DINKWELL wordmark is used).

## Brand Commitments

- Name: Dinkwell Pickleball Club. Headline: "Dink till eleven." If the logo file is supplied, use it exactly as provided (never recolored, stretched or redrawn) on a light surface.
- Visual world: the "Editorial Sport" direction chosen in the hero bakeoff (2026-11-18) is binding for this site.
- Voice: specific and local (Quezon City, real hours, real prices), never generic sports slogans.
- Banned: high-five or fist-bump stock photos, mascots, clip-art paddles, neon esports gradients, lens flares, tennis or badminton photos passed off as pickleball, "Join the pickleball revolution!"-style copy, purple gradients, 3D blobs, glass cards over dark photos, and Instagram links.

## Evidence on Hand

- Stand-in photos (free licenses) in `dinkwell-photos/images/`, credited in `dinkwell-photos/CREDITS.md`. None show the actual club.
- No testimonials, reviews, ratings, awards, member counts, founder or coach names, or years open exist. Never invent them.

## Product Principles

1. Booking first: every section moves the visitor toward reserving a court.
2. State facts, not hype: court count, hours, location, price.
3. Honest process: reserve → pay via GCash → staff confirm. Say it plainly, and never imply instant confirmation.
4. Template discipline: client facts live only in `src/data/`, marked as samples.

## Accessibility & Inclusion

WCAG AA contrast (including text over photos), visible focus states, real buttons and links, alt text on every image, and respect for prefers-reduced-motion.
