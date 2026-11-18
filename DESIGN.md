---
name: Dinkwell Pickleball Club
description: A local sports-magazine issue about one Quezon City club, built to get a court reserved.
colors:
  newsprint-paper: "#efe8d8"
  paper-shade: "#e5dcc7"
  court-ink: "#15201a"
  ink-soft: "#46524b"
  ink-faint: "rgb(21 32 26 / 0.35)"
  court-blue: "#1e4ca1"
  court-blue-deep: "#183f87"
  court-blue-hover: "#1b4593"
  ball-yellow: "#e6f14a"
  ball-yellow-deep: "#d6e332"
  on-dark: "#ffffff"
  on-dark-soft: "rgb(255 255 255 / 0.84)"
  error-red: "#a3261b"
typography:
  display-xl:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "158px"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.01em"
  display-lg:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "104px"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.01em"
  display-md:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "64px"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.01em"
  display-sm:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  wordmark:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "34px"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.02em"
  title:
    fontFamily: "Libre Franklin, Segoe UI, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
  lede:
    fontFamily: "Libre Franklin, Segoe UI, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Libre Franklin, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Libre Franklin, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.5
  caption:
    fontFamily: "Libre Franklin, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.02em"
rounded:
  none: "0"
  round: "50%"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  "10": "128px"
components:
  button-ink:
    backgroundColor: "{colors.court-ink}"
    textColor: "{colors.newsprint-paper}"
    rounded: "{rounded.none}"
    padding: "0 28px"
    height: "56px"
  button-ink-hover:
    backgroundColor: "{colors.court-blue}"
    textColor: "{colors.newsprint-paper}"
  button-ink-md:
    backgroundColor: "{colors.court-ink}"
    textColor: "{colors.newsprint-paper}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-ball:
    backgroundColor: "{colors.ball-yellow}"
    textColor: "{colors.court-ink}"
    rounded: "{rounded.none}"
    padding: "0 28px"
    height: "56px"
  button-ball-hover:
    backgroundColor: "{colors.ball-yellow-deep}"
    textColor: "{colors.court-ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.court-ink}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.paper-shade}"
    textColor: "{colors.court-ink}"
  button-ghost-light:
    backgroundColor: "transparent"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.none}"
    padding: "0 28px"
    height: "56px"
  input-field:
    backgroundColor: "{colors.on-dark}"
    textColor: "{colors.court-ink}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
    height: "52px"
  choice-tile:
    backgroundColor: "{colors.on-dark}"
    textColor: "{colors.court-ink}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
    height: "52px"
  choice-tile-selected:
    backgroundColor: "{colors.court-ink}"
    textColor: "{colors.newsprint-paper}"
  slab-cell:
    backgroundColor: "{colors.court-blue-deep}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.none}"
    padding: "14px 20px"
    height: "78px"
  slab-cell-hover:
    backgroundColor: "{colors.court-blue-hover}"
  ticket:
    backgroundColor: "{colors.on-dark}"
    textColor: "{colors.court-ink}"
    rounded: "{rounded.none}"
    padding: "24px"
  rate-card:
    backgroundColor: "{colors.court-ink}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.none}"
    padding: "48px 48px 32px"
  stamp:
    backgroundColor: "{colors.ball-yellow}"
    textColor: "{colors.court-ink}"
    rounded: "{rounded.round}"
    size: "152px"
---

# Design System: Dinkwell Pickleball Club

## Overview

**Creative North Star: "The Club Issue"**

The site reads as one issue of a local sports magazine devoted to a single club. Every section is a spread: it opens on a hard ink rule, sets an oversized condensed caps headline against a short lede, and carries real photographs with credit captions. The ground is warm newsprint, the type is ink, and the two sport colors (court blue and ball yellow) arrive as printed objects: blue as solid slabs, yellow as a highlighter stroke and a round stamp.

Density is editorial, not dashboard. Sections breathe on a 128px vertical rhythm, content sits in a fixed 1200px column, and information is organised by rules and columns rather than by boxed cards. Corners are square everywhere except the two things that are round in the real world: the stamp and the step dots. Motion is short and print-like: headlines wipe up line by line, arrows nudge, underlines draw in.

The world refuses the card-grid SaaS landing page and the dark-overlay sports hero; photos sit next to paper, never under a scrim.

**Key Characteristics:**
- Newsprint paper ground with ink text and 1.5px ink rules as the primary structure.
- Big Shoulders Display caps for every headline, numeral and price; Libre Franklin for everything read.
- Court blue only as full-bleed or boxed slabs; ball yellow only as highlighter, stamp, selection and the action on dark.
- Square, arrowed buttons; one ink primary per spread.
- Real photographs, uncovered, each with a credit caption.

## Colors

A three-ink print palette on warm paper: ink for structure, court blue for slabs, ball yellow for marks.

### Primary
- **Court Ink** (court-ink): text, rules, primary buttons, selected tiles, the About section ground and the rate card. The workhorse; almost every line on the page is this color.

### Secondary
- **Court Blue** (court-blue): solid slabs only: the hero quick-book slab, the "Paid is not confirmed" callout, the pending-review status bar and the Location section. Also the hover fill of the ink button, the focus ring on paper and the underline color of text links.
- **Court Blue Deep** (court-blue-deep) and **Court Blue Hover** (court-blue-hover): field cells inside a blue slab, at rest and on hover.

### Tertiary
- **Ball Yellow** (ball-yellow): the highlighter band behind a headline word ("ELEVEN.", the sixth step numeral), the seam stamp, the "Dink till eleven." sign, the middle rate, the active booking step, text selection, the skip link, the focus ring on dark grounds, and the primary button on blue or ink grounds.
- **Ball Yellow Deep** (ball-yellow-deep): hover of the ball button.

### Neutral
- **Newsprint Paper** (newsprint-paper): the page ground and the text color on ink buttons.
- **Paper Shade** (paper-shade): hover on paper (ghost buttons, tiles) and recessed wells such as the policy box.
- **Ink Soft** (ink-soft): secondary text on paper: ledes in lists, captions, help text, masthead facts.
- **Ink Faint** (ink-faint): thin 1px dividers between list rows and columns.
- **On Dark** (on-dark) and **On Dark Soft** (on-dark-soft): text on ink and blue grounds; white is also the fill of form inputs, choice tiles and the ticket so they read as paper slips laid on newsprint.
- **Error Red** (error-red): invalid field borders, field errors and the submission alert.

### Named Rules
**The Highlighter Rule.** Ball yellow is a mark, not a surface. It appears as a highlighter band, a stamp, a small sign or the action on a dark ground; it never fills a section or a card.

**The Slab Rule.** Court blue appears as a solid, square slab that holds content (a form, a callout, a section). It is not used for body text, icons or decorative tints.

## Typography

**Display Font:** Big Shoulders Display 800 and 900 (with Arial Narrow, sans-serif)
**Body Font:** Libre Franklin 400–700 (with Segoe UI, sans-serif)

**Character:** A tall, condensed sports-poster caps face does all the shouting; a sturdy American grotesque does all the reading. The contrast in width between them is the page's voice.

### Hierarchy
- **Display XL** (800, 158px, 0.8): the hero headline only, one word per line.
- **Display LG** (800, 104px, 0.88): section headlines, the "Paid is not confirmed" callout, rate prices, the payment amount.
- **Display MD** (800, 64px): sub-group headlines (Indoor, Covered Outdoor), court numerals, booking code, the pending status.
- **Display SM** (800, 40px): booking step titles, rate card title, address block, footer tagline.
- **Wordmark** (900, 34px masthead / 72px footer, +0.02em): the DINKWELL wordmark until a logo file is supplied.
- **Title** (700, 24px): emphasised data such as account numbers, the pending lead, hours.
- **Lede** (400, 19px, 1.5): the lede beside every section headline and hero copy; max about 500px.
- **Body** (400, 16px, 1.5): running text.
- **Label** (700, 14px): form labels and legends, column headings in the footer.
- **Caption** (500, 12px): photo credits and small meta.

All display text is uppercase with -0.01em tracking. Numerals in prices, court numbers and steps use tabular figures.

### Named Rules
**The Two Voices Rule.** Display caps are for headlines, numerals and prices; Libre Franklin is for every sentence. A subtitle that sits beside a display headline (for example "Courts 1–4") drops to the body face, sentence case, ink soft.

## Layout

A fixed 1200px centred column on a page with a 1440px minimum width. The site is desktop-only at 1440px for now; no breakpoints exist and the responsive pass is an open item, not a decided behavior.

Spacing follows an 8px rhythm (tokens 4px to 128px). Sections are separated by 128px of vertical padding; the space between a section heading and its content is 64px; sub-groups sit 96px apart.

Every section opens with the same heading device: a 1.5px ink rule across the column, the display headline on the left, and a 440px lede column on the right aligned to the headline's baseline. Content below is set in asymmetric columns (photo 580px against a ruled list, alternating sides), six equal step columns divided by faint rules, or a 4-column photo grid where some items span two.

The hero is a split spread: a paper copy column on the left and a full-height photo bleeding to the right edge, meeting at a seam 740px from the viewport's left. The stamp sits on the seam and the blue quick-book slab straddles it at the bottom. The masthead is sticky, 84px tall, and closed by an ink rule.

## Elevation & Depth

The system is flat. Depth comes from ink rules, from solid ink and blue slabs set against paper, and from white slips (inputs, tiles, the ticket) laid on newsprint. Exactly two soft shadows exist, both for objects that physically sit on top of the hero photograph and seam.

### Shadow Vocabulary
- **Slab drop** (`box-shadow: 0 30px 50px -30px rgb(21 32 26 / 0.7)`): under the hero quick-book slab only.
- **Stamp drop** (`box-shadow: 0 10px 24px -12px rgb(21 32 26 / 0.55)`): under the yellow seam stamp only.

### Named Rules
**The Flat Paper Rule.** Surfaces on paper never cast shadows. A shadow is allowed only where an object overlaps the photo seam.

## Shapes

Square corners (0) on every button, field, tile, slab, card and photo. Round (50%) is reserved for the seam stamp and the booking progress dots. Lines carry the structure: a 1.5px ink rule for section and list tops, a 1px faint ink rule between rows and columns, a 1.5px ink stroke around inputs and tiles, and a 1.5px dashed ink line for "tear-off" edges (the ticket heading, the upload drop zone). On dark grounds the same rules turn white (1.5px solid, then 1px at 30–35% opacity).

## Components

### Buttons
Square, confident, and always the same object: label plus a square-capped arrow that nudges 3px right on hover.
- **Shape:** square corners (0); 56px tall with 28px side padding (large) or 48px with 22px (medium); Libre Franklin 600.
- **Ink (primary on paper):** court ink fill, newsprint text; hovers to court blue. One per spread.
- **Ball (primary on blue or ink):** ball yellow fill, ink text; hovers to ball yellow deep.
- **Ghost (secondary on paper):** transparent with a 1.5px inset ink stroke; hovers to paper shade. Used for repeated per-item actions such as "Book Court N".
- **Ghost Light (secondary on dark):** transparent with a 1.5px inset white stroke at 84%; hovers to full white stroke with a faint white wash.
- **Focus:** 3px court blue outline offset 3px on paper; 3px ball yellow on dark grounds.
- **Disabled / busy:** 45% / 70% opacity.

### Text Links
Libre Franklin 600 with a 2px court-blue underline offset 6px; the text turns court blue on hover. On blue slabs the underline is white at 50% and turns ball yellow on hover.

### Inputs / Fields
- **Style:** white fill, 1.5px ink stroke, square, 52px minimum height, 17px text; custom ink chevron on selects.
- **Focus:** the global 3px court blue outline.
- **Error:** border and an inner 1px ring in error red, with a 14px 600 error line below.

### Choice Tiles
- **Style:** white slips with a 1.5px ink stroke, square, 52px tall (68px for courts); 15px 700 main line, 12px ink-soft sub line.
- **State:** hover to paper shade; selected inverts crisply to ink fill and paper text; disabled slots are struck through on a faint diagonal hatch.

### Quick-Book Slab (signature)
A court-blue slab holding a row of court-blue-deep cells separated by 2px gaps; small 12px labels over 19px 600 white values; cells hover lighter and show a 2px ball-yellow inset ring when focused. Court-type choices are outlined white pills of square shape that invert to white with blue text. Ends in the ball button.

### Section Heading
1.5px ink rule, display LG caps headline on the left, 19px lede in a 440px right column. On ink or blue grounds the rule turns white and the lede turns on-dark soft.

### Ruled List (Courts)
Rows of display-MD numeral, bold name, ink-soft description and a ghost button, separated by faint rules with a full ink rule on top.

### Rate Card and Callout
Square ink (rate card) or court-blue (callout) panels with 48px padding, white display numerals, white rules dividing columns; one value may be marked in ball yellow.

### Booking Progress Rail and Ticket
A vertical 2px faint track that fills ink as steps complete; 32px round dots outlined in ink, filled ink when done, filled ball yellow when current. The ticket is a sticky white slip with a 1.5px ink border, a dashed rule under its display-caps title, faint-ruled rows and a 56px display total.

### Navigation
Masthead links in Libre Franklin 500 at 15px; a 2px ink underline draws in from the left on hover. Club facts follow as plain ink-soft text divided by faint vertical rules, then a medium ink button without arrow.

### Seam Stamp (signature)
A 152px ball-yellow disc with circular uppercase text (13px 700, +0.14em) rotated -24deg and a display-900 price at its centre.

### Photo Captions
Every photo carries a 12px credit caption beneath it (or over its bottom-right corner in the hero). In the gallery the caption sits under a 1.5px ink rule, with the credit as an underlined ink-soft link.

## Do's and Don'ts

### Do:
- **Do** open every section with the ink rule, display LG caps headline and 440px lede.
- **Do** use the shared Button with its arrow for every call to action, keeping one ink primary per spread and ghost for repeated items.
- **Do** switch to the ball button and the yellow focus ring on ink or court-blue grounds.
- **Do** credit every photograph in a caption directly beneath it.
- **Do** set prices, court numbers and step numbers in display caps with tabular figures.
- **Do** honor prefers-reduced-motion: the line wipe, step slide and arrow nudge collapse to instant.

### Don't:
- **Don't** round corners on anything except the stamp and progress dots.
- **Don't** fill a surface with ball yellow; it stays a highlighter, stamp, sign or button on dark.
- **Don't** put a dark scrim or glass card over a photograph; photos sit beside paper or slabs.
- **Don't** add shadows to elements on paper; only the hero slab and stamp carry one.
- **Don't** box content into card grids; use rules, columns and slabs.
