# Handoff: Seekie Studios — Single-Page Marketing Site

## Overview
A single-page marketing website for **Seekie Studios**, a mobile Paint & Sip business operating across Geelong, the Surf Coast, and the Bellarine (Victoria, Australia). The site introduces the service, lists upcoming public events (ticketed via Humanitix), spotlights the partnership with Astray Bar, surfaces an Instagram/Facebook social feed, and provides an enquiry form for private bookings.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes that show the intended look, layout, type system, and motion. They are **not** production code to ship as-is.

The task is to **recreate this design in the target codebase's environment** using its existing patterns, component library, and tooling. If no codebase exists yet, the recommended starting point is a static-friendly framework such as **Astro** or **Next.js (App Router, static export)** — the site is mostly static content with one interactive form and one feed-tab toggle, so SSG is a natural fit.

## Fidelity
**High-fidelity (hifi).** Pixel-perfect mockup with final colours, typography, spacing, motion, and component states. Recreate the UI pixel-perfectly. Photo placeholders (striped/solid blocks with monospace labels) are intentional — they mark spots where the client will drop in real photography.

---

## Brand & Aesthetic Direction

70s groovy revival meets paint-and-sip. Bubble-letter display type, multi-stroke rainbow ribbons, polaroid-pinned photography, bold organic blob shapes. Pulled directly from Seekie's existing Instagram brand assets (logo, ad flyers).

---

## Design Tokens

### Colours
| Token | Hex | Usage |
|---|---|---|
| `--grape` | `#4A1F8C` | Primary brand purple — headlines, nav, CTAs, footer accents |
| `--grape-deep` | `#2E0F5C` | Footer background, deepest text |
| `--plum` | `#7B36C7` | Secondary purple — body text accents, sub-labels |
| `--lavender` | `#EFD9FF` | Page background |
| `--lavender-mid` | `#E1BFFF` | List backgrounds, inactive states |
| `--cream` | `#FFF6E8` | "What we do" section bg, button text on dark |
| `--pink` | `#EC3B8E` | Primary accent — main CTA, "sip" highlight |
| `--orange` | `#F37A2B` | Secondary accent — stats numbers, ampersand |
| `--lemon` | `#F5CF3E` | Highlight accent — eyebrow dot, sticker fills, footer headings |
| `--mint` | `#6CD7C2` | Quaternary accent — feature icons, blob fills |
| `--ink` | `#2A0F4F` | Body text |

### Typography
| Family | Source | Usage | Weights |
|---|---|---|---|
| **Bagel Fat One** | Google Fonts | Display headings, button text, brand name | 400 |
| **Caprasimo** | Google Fonts | Sub-display (feature h3, event h3, tags) | 400 |
| **DM Sans** | Google Fonts | Body, nav, form, micro | 400 / 500 / 600 / 700 |
| **Caveat** | Google Fonts | Polaroid captions ("happy mess ✿") | 500 / 700 |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Caprasimo&family=DM+Sans:wght@400;500;600;700&family=Caveat:wght@500;700&display=swap
```

### Type scale (key sizes)
- Hero h1: `clamp(56px, 9.5vw, 140px)` — Bagel Fat One, line-height .95
- Section h2: `clamp(44px, 6vw, 80px)` — Bagel Fat One, line-height .95
- Feature h3: 26px Caprasimo
- Body lede: 20px DM Sans
- Body default: 15–17px DM Sans, line-height 1.55
- Eyebrow / micro: 12–13px DM Sans, letter-spacing .18–.22em, uppercase

### Spacing & Radii
- Section padding (vertical): `110px`
- Container max-width: `1280px` with 32px horizontal padding
- Card border radius: `24px` (events, features, what-img); `32px` (book card)
- Pill border radius: `999px`
- Border weight on cards: `2.5px solid var(--grape)`
- Shadow on cards: `6px 6px 0 var(--grape)` (hard shadow, no blur — offset hover to `9px 9px 0`)
- Book card lift shadow: `0 24px 60px -10px rgba(74,31,140,.4)`

### Motion
- Reveal on scroll: opacity 0→1, translateY 30px→0, 900ms `cubic-bezier(.2,.7,.2,1)`. Stagger via `.reveal-d2/d3/d4` (12ms × n delay).
- Float anim: 6–7s ease-in-out infinite, 12px Y-axis bob.
- Card hover: `translate(-3px,-3px)` + shadow grows 6→9px.
- Ticker: 40s linear infinite scroll on duplicated track.
- Form submit: synchronous `.is-sent` class swap, no real submission wired.

---

## Page Sections (top → bottom)

### 1. Sticky Nav
- 14px vertical padding, lavender bg @ 78% opacity + `backdrop-filter: blur(8px)`, 2px grape bottom border.
- Brand: 54px circular logo (`assets/logo-pink.jpg`) + "Seekie Studios" Bagel Fat One 22px / "PAINT · SIP · GEELONG" 11px tracked uppercase.
- Inline links (DM Sans 600, 15px, grape): What we do · Events · Astray Bar · The Feed · Book — hide below 820px.
- CTA pill: grape bg, lemon text, Bagel Fat One 15px, 3px hard pink shadow → grows on hover with `translate(-2px,-2px)`.

### 2. Hero
- Full-width, padding 90px / 140px.
- Solid lavender background.
- **Decorative organic blobs** (`<div class="hero-blob">`) — 3 absolutely-positioned shapes with morph `border-radius` (e.g. `62% 38% 55% 45%/45% 60% 40% 55%`):
  - `b1` lemon, top-right, 360px
  - `b2` mint, bottom-left, 320px
  - `b3` pink @ .55 opacity, mid-right, 120px
- **Two rainbow ribbon SVGs** (`.hero-squiggle`, `.hero-squiggle-2`) — width `120vw`, viewBox `0 0 1600 200/220`, `preserveAspectRatio="none"`. Each has 4 stacked stroked cubic-Bézier paths in pink/orange/lemon/mint (top) and purple/pink/orange/lemon (bottom). Strokes range 24px → 6px, all `stroke-linecap="round"`. Paths start at `x=-100` and end at `x=1800` so they enter and exit cleanly off-screen.
- **2-column grid** (1.05 / .95) collapsing at 1024px:
  - Left: rotated eyebrow pill ("GEELONG · SURF COAST · BELLARINE") · h1 `Paint, & sip, repeat.` (with rotated orange ampersand, pink "sip", purple "repeat" with lemon underline ellipse) · 20px lede · two CTAs (pink primary w/ hard grape shadow + grape outline secondary) · 3 hero stats ("2–3h" / "BYO" / "∞").
  - Right: `.stage` 680px-tall holding 4 absolutely-positioned `.polaroid` cards at varying rotations (-7°, 4°, -3°, 8°). Each is white, 14px padded, with hard purple shadow, image area `aspect-ratio:3/4`, and a Caveat handwritten caption. The starry-cat polaroid uses a solid `#3a1a6a` bg + a `::before` lemon circle (the moon).

### 3. Marquee Ticker
- Full-bleed grape bar with 3px ink top/bottom borders, 14px vertical padding.
- Bagel Fat One 28px lemon text, pink `✺` star separators, content duplicated for seamless 40s linear loop.
- Items: BYO drinks · We come to you · Custom themes · Hens · birthdays · book club · just because · Mocktails welcome · No skills required.

### 4. "How it works" (`#what`)
- Cream background, 110px padding.
- Section head: 2-column with section-tag (`❋ HOW IT WORKS ❋`, pink, Caprasimo 14px tracked), h2 ("A paint party, delivered to your door."), and a 17px plum paragraph on the right.
- 3-column feature grid: each card is white, 2.5px grape border, 24px radius, hard 6px grape shadow, 32×28 padding. Top-right `.num` badge (lemon, grape border, 46×46). 64×64 icon-circle in pink/orange/mint with white SVG glyph. Caprasimo 26px h3 + body copy.
  - 01 Pick a painting · 02 We bring it all · 03 BYO & sip
- Below the grid: 2-column row — bullet checklist (5 items, lavender bg pills with grape circle check marks) + `.what-img` placeholder (orange bg with pink `::before` blob, 4:5 ratio, 8px hard shadow, lemon "small/groups/welcome!" sticker rotated -8°).

### 5. Upcoming Events (`#events`)
- Lavender background.
- 3-column event grid (collapsing 980→680→1col).
- Each event card:
  - 5:4 cover with solid colour + `.blob-shape` divs (organic shapes via `border-radius` morph) — no gradients.
    - Event 1 (Cat Under the Moon @ Astray): grape bg + lemon circle "moon"
    - Event 2 (Bells Beach Sunset): orange bg + pink + lemon overlapping blobs
    - Event 3 (Bellarine Bloom): grape bg + mint + pink stacked blobs
  - Pricetag pill (lemon, grape border) top-right.
  - Body: pink `WHEN` row · Caprasimo 26px h3 · meta rows with inline SVGs (location pin, clock) · dashed-divider footer with seat count + "Humanitix →" pill.
- Footnote: "Tickets powered by **Humanitix** · also bookable via our Facebook event pages."

### 6. Astray Bar partnership (`#astray`)
- Grape background, cream foreground, decorative SVG ribbon top-right at .5 opacity.
- 2-column grid (collapsing at 1024px).
- Left: mint section-tag ("IN PARTNERSHIP WITH"), lemon h2 ("Sip with us at Astray Bar."), 19px lede, 2×2 perk grid (translucent white cards with lemon Caprasimo h4 + 14px body), pink CTA.
- Right: `.astray-card` — 4:5, deep grape bg, 3px lemon border, 24px radius. `::before` pink organic blob top-right, `::after` lemon circle bottom-left. Lemon "Next session ✺" label, 48px h3 with lemon inline span, dashed menu list, meta row with lemon `<b>` highlights.

### 7. Social Feed (`#feed`)
- Cream background.
- Tab buttons (Instagram active by default / Facebook) — 8 posts each, swap via body class `feed-ig` / `feed-fb`.
- 4-col grid (3 @ 1024px, 2 @ 680px) with white card chrome (2.5px grape border, 24px radius, 6px hard grape shadow), 8px inner gap, 14px tile radius.
- Each `.post`: 1:1 ratio, solid colour bg + `::before` organic shape (no gradients). Hidden monospace placeholder label fades in via `.overlay` gradient on hover with engagement counts. `.video` posts get a corner play badge.

### 8. Book / Contact (`#book`)
- Lavender background.
- `.book-card`: grape bg, 32px radius, 64×56 padding, large drop shadow, decorative lemon + mint blobs at .18 opacity.
- 2-column inner: copy (lemon h2 with pink span, 18px lede, contact list) + glassy form (translucent white bg, lemon labels, lemon submit button → cream on hover, success state swaps to "Thanks — we'll be in touch within 24h ✿").
- Form fields: name, group size, email, date, region (select: Geelong / Surf Coast / Bellarine / Other), theme textarea.

### 9. Footer
- Deep grape bg, 3px lemon top border.
- 3-column: brand (logo + 14px description + 3 socials — Instagram / Facebook / mail, 40px circles with lemon border) · Explore links · Get in touch links.
- Legal row: "© 2026 Seekie Studios · Made with paint & love on the Bellarine." + ABN placeholder.

---

## Interactive Behaviour
- **Reveal-on-scroll:** `IntersectionObserver` adds `.in` class on `.reveal` elements at 12% threshold; CSS handles the fade + lift.
- **Feed tab toggle:** clicking IG/FB button swaps `.active` class and toggles `body.feed-ig` / `body.feed-fb`. Posts use `.fb-post` modifier; CSS hides the inactive set.
- **Form:** `event.preventDefault()` + adds `.is-sent` to swap content. Wire to real backend (Formspree / Mailgun / serverless) in production.
- **Ticker:** pure CSS infinite scroll on duplicated track.

## State Management
For a React/Vue port:
- `feedTab: 'ig' | 'fb'`
- `formState: { name, email, groupSize, date, region, theme }`
- `formStatus: 'idle' | 'submitting' | 'sent' | 'error'`
- No routing needed — single page, anchor links only.

## Real Wiring TODOs
- Humanitix event ticket URLs on each event card's "Humanitix →" link
- Real Instagram / Facebook handles + actual social-feed integration (Instagram Basic Display API or a third-party widget like SnapWidget / EmbedSocial — note Instagram feed embedding is non-trivial; many sites use a build-time fetch + cache pattern)
- Real photography to replace striped/solid placeholder blocks (search `.ph` and `[ event hero ]` markers in the HTML)
- Form backend (Formspree / Netlify Forms / custom API route)
- ABN in footer
- Domain + favicon + OG meta tags

## Assets included in this bundle
- `assets/logo-pink.jpg` — primary brand logo on pink ground (used in nav + footer)
- `assets/logo-purple.jpg` — alternate purple logo
- `assets/astray-flyer.jpg` — original Astray event flyer (reference only)
- `assets/info-flyer.jpg` — original "Private Paint & Sip Parties" info flyer (reference only — copy was lifted from this)

## Files
- `index.html` — the full single-page design (HTML + inline CSS + minimal JS).
