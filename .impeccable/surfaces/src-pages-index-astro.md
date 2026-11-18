---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/components/sections/Hero.astro","src/components/sections/Booking.astro"]
---

# Surface: Dinkwell landing page (src/pages/index.astro)

Mode: Persuade, with an Operate island for the booking form. Scope: one long page. Header + hero, Courts & Rates, How Booking Works, Book a Court (#booking, a 6-step form), About, Gallery, Location & Contact, Footer. Desktop 1440 only. Visitor: a QC player who wants a court at a specific time. Action: submit a reservation request with GCash proof. Proof: 6 courts (1–4 indoor, 5–6 covered outdoor), daily 6 AM–11 PM, sample rates, address, phone. Constraints: all content in src/data; never say booked or confirmed before staff review; no invented social proof.

## Direction contract

seed: none (pinned). The client brief pins the world whole: "Use the 'Editorial Sport' version in bakeoff.html only as a visual reference for the hero: recreate it in Astro so it looks the same ... Then build the body in Astro in that same style, so hero and body read as one page. Reuse the hero's Book a Court button wherever a call to action appears."

THESIS: A local sports-magazine issue about one club. Every section is a spread: a condensed caps headline, hard ink rules, real photos. It refuses the card-grid SaaS landing page and the dark-overlay sports hero.
OWN-WORLD: Newsprint cream #EFE8D8, ink #15201A, court blue #1E4CA1 for slabs, and ball-yellow #E6F14A only as a highlighter and stamp. Big Shoulders Display 800–900 caps; Libre Franklin body. 1.5px ink rules. Square-cornered ink buttons with an arrow. Folio lines. Photo captions with credits.
STORY: Play late in QC (hero) → six courts and what they cost (Courts & Rates) → how reserving works and why paid ≠ confirmed (How Booking Works) → do it (Booking) → why the club exists (About) → see it (Gallery) → find it (Contact).
FIRST VIEWPORT: The bakeoff hero, faithfully recreated. A masthead with wordmark, nav, folio trust line and an ink Book a Court button. Left 52%: "DINK / TILL / ELEVEN." at ~158px with a yellow highlight on ELEVEN, the lede, the ink Book a Court button and two underlined links. Right: the full-height lunge photo, cropped on paddle, ball and legs, with a credit caption. A yellow stamp sits on the seam. The blue availability slab straddles the seam at the bottom.
FORM: Editorial Sport (bakeoff winner); position 1 of 1 (pinned).
SIGNATURE: The headline line-wipe on load. In the booking form, the progress rail fills ink step by step as steps slide in. Slot grid toggles with a crisp invert.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
ADAPTATIONS (cited): The per-court "Book Court N" links use the Button component's ghost variant, not the ink fill. Ten competing ink primaries would flatten the hierarchy, so the ink "Book a Court" stays the single primary per spread. The same component and arrow keep it recognisably the hero's button. On ink and court-blue slabs, Book a Court uses the ball variant for contrast. The Booking section keeps the paper ground; the separate --color-paper-light token was removed; white (--color-on-dark) is used for inputs and the receipt.
