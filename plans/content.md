# CMS Content Migration Plan

## Goal

Move all hardcoded copy off components into Keystatic-managed content using a set of singleton config files. The site already has `site.json` for contact info — extend this pattern with additional singletons, one per logical content area.

No section reordering is required — only content control.

---

## New Keystatic Singletons

Add these to `keystatic.config.ts` alongside the existing `site` singleton:

| Singleton key | File path | Covers |
|---|---|---|
| `nav` | `src/content/settings/nav.json` | Brand name, tagline, nav links (label + href), logo image |
| `hero` | `src/content/settings/hero.json` | Eyebrow, headline, lede, CTA labels + hrefs, stats, polaroid captions + images |
| `ticker` | `src/content/settings/ticker.json` | Ticker item list |
| `howItWorks` | `src/content/settings/how-it-works.json` | Section heading, 3 steps (icon, label, color), 5 perks |
| `astrayBar` | `src/content/settings/astray-bar.json` | Section heading, 4 perk cards, "next session" copy |
| `bookingForm` | `src/content/settings/booking-form.json` | All field labels, placeholders, region options, sidebar copy |
| `footer` | `src/content/settings/footer.json` | Brand description, nav column headings + links, legal line, logo image |
| `seo` | `src/content/settings/seo.json` | Page title, meta description, OG image, favicon |

The existing `site` singleton already has `instagram`, `facebook`, `email` — wire these into Footer and Nav properly rather than duplicating values.

---

## Keystatic Field Patterns

- **Simple text** — `fields.text({ label: '...', defaultValue: '<current hardcoded string>' })`
- **Long copy** (lede, descriptions) — `fields.text({ multiline: true, ... })`
- **Repeated items** (nav links, ticker items, perks, steps) — `fields.array(fields.object({ ... }), { itemLabel: props => props.fields.label.value })`
- **Select** (icon names, accent colors) — `fields.select({ options: [...], defaultValue: '...' })`
- **URLs** (CTA hrefs, nav hrefs) — plain `fields.text`
- **Images** — `fields.image({ label: '...', directory: 'src/assets/settings', publicPath: '/src/assets/settings/' })`

Every field must have a `defaultValue` matching the current hardcoded string exactly so the site renders correctly before any editor makes changes.

Image fields store to `src/assets/settings/` so Astro's `<Image>` component can optimise them. Use the existing `src/assets/events/` pattern as the reference implementation.

---

## Content to Extract Per Component

### Nav.astro
- Brand name: `"Seekie Studios"`
- Tagline: `"Paint · Sip · Geelong"`
- Nav links array: `[{ label, href }]` — What we do, Events, Astray Bar, The Feed, Book
- **Logo image** — currently `public/assets/seekie-studios-logo.svg`, rendered inline via `readFileSync`. Replace with a Keystatic `fields.image` field stored in `src/assets/settings/`. Render with `<Image>` (or `<img>` if SVG). The existing `public/assets/seekie-studios-logo.svg` becomes the initial upload.

### Hero.astro
- Eyebrow: `"Geelong · Surf Coast · Bellarine"`
- Headline: `"Paint, sip, repeat."`
- Lede: `"Private mobile paint & sip parties — we roll up to your house..."`
- Primary CTA: label + href
- Secondary CTA: label + href
- Stats: array of `{ value, label }` — `"2–3h"`, `"BYO"`, `"∞"`
- Polaroid captions + images: array of `{ caption, image }` (4 items) — currently captions are hardcoded strings and images are CSS placeholder boxes. Each polaroid slot should accept an uploaded photo and a caption. `image` field uses `fields.image` stored in `src/assets/settings/`. Images are optional — fall back to the current placeholder box if none uploaded.

### Ticker.astro
- Items: array of strings — BYO drinks, We come to you, Custom themes, etc.

### HowItWorks.astro
- Section heading: `"A paint party, delivered to your door."`
- Steps: array of `{ icon, label, color }` (3 items)
- Perks: array of `{ text }` (5 items)

### AstrayBar.astro
- Section heading: `"Sip with us at Astray Bar."`
- Perks: array of `{ icon, heading, body }` (4 items) — Bottomless, Poutine, The studio, Geelong CBD
- Next session card: `{ label, heading, detail }` — currently hardcoded to "Cat Under the Moon" dates

### BookingForm.astro
- All field labels and placeholders: name, group_size, email, date, region, theme/vibe
- Region options: array of `{ label, value }` — Geelong, Surf Coast, Bellarine, Other
- Sidebar info: contact email display, location blurb, session duration note
- Submit button label

### Footer.astro
- Brand description paragraph
- Nav columns: array of `{ heading, links: [{ label, href }] }`
- Legal line: `"© 2026 Seekie Studios · Made with paint & love on the Bellarine."`
- ABN display (pull value from `site` singleton)
- Social links (pull from `site` singleton — do not duplicate)
- **Footer logo** — currently `<img src="/assets/logo-pink.jpg">` (54×54px). Replace with a Keystatic `fields.image` field in the `footer` singleton, stored in `src/assets/settings/`. The existing `public/assets/logo-pink.jpg` becomes the initial upload.

### Layout.astro (src/layouts/Layout.astro)
- Page `<title>`
- Meta description
- **OG image** — currently hardcoded to `/og-image.jpg` (file does not yet exist). Add as a `fields.image` field in the `seo` singleton, stored in `src/assets/settings/`. Render the resolved URL in the `<meta property="og:image">` tag. Dimensions should be 1200×630px (document this as a hint in the Keystatic field label).
- **Favicon** — currently `<link rel="icon" href="/favicon.svg">`. Add as a `fields.image` field in the `seo` singleton so it can be swapped without a code deploy. Fall back to `/favicon.svg` if not set.

---

## Imagery

### Current image inventory

| File | Currently used in | Action |
|---|---|---|
| `public/assets/seekie-studios-logo.svg` | Nav.astro (inline via readFileSync) | Move to CMS image field in `nav` singleton |
| `public/assets/logo-pink.jpg` | Footer.astro (`<img>` tag) | Move to CMS image field in `footer` singleton |
| `public/assets/logo-purple.jpg` | Unused | Keep as static asset for now |
| `public/assets/astray-flyer.jpg` | Unused | Keep as static asset for now |
| `public/assets/info-flyer.jpg` | Unused | Keep as static asset for now |
| `public/favicon.svg` | Layout.astro (`<link rel="icon">`) | Move to CMS image field in `seo` singleton |
| `/og-image.jpg` | Layout.astro (OG meta, file missing) | Create and manage via CMS image field in `seo` singleton |
| `src/assets/events/*` | Events.astro (already CMS-managed) | No change needed |
| Hero polaroid slots (×4) | Hero.astro (currently CSS placeholders) | Add `fields.image` per slot in `hero` singleton |

### Image storage convention

All CMS-managed site images (non-event) store to `src/assets/settings/` so Astro's `<Image>` component can process them at build time. Follow the same pattern already used for event covers in `src/assets/events/`.

```typescript
// Keystatic field definition pattern
logo: fields.image({
  label: 'Logo',
  directory: 'src/assets/settings',
  publicPath: '/src/assets/settings/',
})
```

### Rendering CMS images in components

Use Astro's `<Image>` component for optimised output:

```astro
---
import { Image } from 'astro:assets';
import { getEntry } from 'astro:content';
const { data } = await getEntry('settings', 'footer');

// Resolve the image — same glob pattern as event covers
const settingsImages = import.meta.glob('/src/assets/settings/**/*.{jpg,jpeg,png,webp,avif,gif,svg}', { eager: true });
const logoSrc = settingsImages[data.logo] as ImageMetadata;
---

<Image src={logoSrc} alt="Seekie Studios" width={54} height={54} />
```

For the Nav logo (SVG), render as a plain `<img>` tag rather than using `readFileSync` — this removes the Node.js dependency and works with the CMS image path.

### Fallbacks

- Polaroid images: if no image uploaded, render the existing CSS placeholder box (current behaviour preserved)
- Favicon: if no image set in CMS, fall back to `href="/favicon.svg"`
- OG image: if no image set in CMS, omit the OG image tags rather than pointing to a missing file

---

## Component Pattern

Each section component fetches its own singleton — no props drilling:

```astro
---
import { getEntry } from 'astro:content';
const { data } = await getEntry('settings', 'hero');
---

<h1>{data.headline}</h1>
<p>{data.lede}</p>
```

For arrays:

```astro
{data.navLinks.map(link => (
  <a href={link.href}>{link.label}</a>
))}
```

---

## Content Files

Create a `.json` file at each singleton path populated with the current hardcoded defaults. These are editable in the Keystatic UI at `/keystatic`.

Example `src/content/settings/hero.json`:
```json
{
  "eyebrow": "Geelong · Surf Coast · Bellarine",
  "headline": "Paint, sip, repeat.",
  "lede": "Private mobile paint & sip parties — we roll up to your house...",
  "primaryCta": { "label": "Book a private party", "href": "#booking" },
  "secondaryCta": { "label": "See upcoming events", "href": "#events" },
  "stats": [
    { "value": "2–3h", "label": "sessions" },
    { "value": "BYO", "label": "drinks" },
    { "value": "∞", "label": "fun" }
  ],
  "polaroidCaptions": ["happy mess ✿", "starry cat night", "grand opening!", "bellarine birthday"]
}
```

---

## Execution Order

1. Add all singleton schemas to `keystatic.config.ts` (text fields + image fields)
2. Create `src/assets/settings/` directory
3. Copy current static assets into `src/assets/settings/` as the initial CMS uploads:
   - `public/assets/seekie-studios-logo.svg` → `src/assets/settings/logo.svg`
   - `public/assets/logo-pink.jpg` → `src/assets/settings/logo-pink.jpg`
   - `public/favicon.svg` → `src/assets/settings/favicon.svg`
   - Create/source an OG image (1200×630px) → `src/assets/settings/og-image.jpg`
4. Create all `.json` content files with current hardcoded defaults (text values + image paths pointing to the files copied above)
5. Confirm `src/content.config.ts` glob covers `src/content/settings/**`
6. Add `import.meta.glob` for `src/assets/settings/**` (follow the event covers pattern in Events.astro)
7. Update each component to `getEntry` and use `data.*` — one at a time, verify render after each:
   - Layout.astro (title, meta description, OG image, favicon)
   - Nav.astro (brand, tagline, links, logo)
   - Hero.astro (all copy, polaroid captions + images)
   - Ticker.astro (items)
   - HowItWorks.astro (heading, steps, perks)
   - AstrayBar.astro (heading, perks, next session copy)
   - BookingForm.astro (labels, placeholders, region options, sidebar)
   - Footer.astro (description, nav links, legal, logo, social from `site`)
8. Remove all hardcoded strings and static image references from components
9. Verify the Keystatic UI at `/keystatic` — all fields and image uploads editable, saved changes reflect on page

---

## What Stays Hardcoded

- Design tokens (`global.css`, `tailwind.config.mjs`)
- Component structure, layout, Tailwind classes
- Form validation logic and the `/api/contact` endpoint
- Icon SVG paths and animation logic

---

## Out of Scope

- Section reordering
- Social feed integration (separate project)
- Astray Bar "next session" — currently hardcoded copy; a future improvement could link to a CMS event by slug
