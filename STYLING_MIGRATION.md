# Seekie Studios — Style System Migration Plan (v3)

## Context for the AI executing this plan

This is an Astro 4 + Tailwind 3 project. This plan was reviewed by two adversarial agents and has been revised three times. Read it completely before touching any file. Follow every instruction exactly — do not improvise. After completing each numbered step, run `npm run build` before proceeding to the next.

---

## Approach

### The single developer rule

> **Use Tailwind utility classes in component templates for all layout, spacing, colour, typography, border, and shadow styling.**  
> **Open a scoped `<style>` block only for `::before`/`::after` pseudo-elements, multi-property `:hover`/`:focus` state changes, and component-specific `@media` queries.**

### Token architecture

Design tokens live in two locations that must stay in sync:

| Location | Used by |
|---|---|
| `tailwind.config.mjs` | Tailwind utilities in templates (`bg-pink`, `text-grape`, `gap-6`, `shadow-card`) |
| `global.css` `:root` block | Scoped `<style>` blocks and `rgba()` opacity variants (`var(--color-grape)`) |

Both define the same values. `tailwind.config.mjs` is the authoritative source; the `:root` block mirrors it for CSS runtime access.

---

## Files that do NOT change

- `src/components/ui/Button.astro` — correctly uses Tailwind tokens
- `src/components/ui/FormField.astro` — correctly uses Tailwind tokens
- `src/components/ui/SectionHeading.astro` — correctly uses Tailwind tokens
- `src/components/ui/Icon.astro` — no styling
- `src/pages/index.astro` — no styling
- `src/pages/api/contact.ts` — no styling
- `src/layouts/Layout.astro` — no component-level styling

---

## Step 1 — Update `tailwind.config.mjs`

Open `tailwind.config.mjs`. Add the blocks below inside `theme.extend`. Do not remove or rename any existing entry. The existing `colors`, `fontFamily`, and `boxShadow` blocks stay.

```js
// Spacing — mirrors --space-* tokens in :root
// Tailwind's default scale covers most values. Only add what it lacks.
spacing: {
  '4.5': '18px',  // used in form row gaps and perk card padding
  '5.5': '22px',  // used in feed tab margin and event grid gap
},

// Font sizes with default line heights
fontSize: {
  '2xs':  ['11px', { lineHeight: '1.4' }],
  'xs':   ['12px', { lineHeight: '1.4' }],
  'sm':   ['13px', { lineHeight: '1.35' }],
  'tag':  ['14px', { lineHeight: '1.4'  }],
  'body': ['15px', { lineHeight: '1.55' }],
  'md':   ['17px', { lineHeight: '1.55' }],
  'lg':   ['18px', { lineHeight: '1.5'  }],
  'xl':   ['22px', { lineHeight: '1.1'  }],
  '2xl':  ['26px', { lineHeight: '1.05' }],
  '3xl':  ['28px', { lineHeight: '1'    }],
  '4xl':  ['34px', { lineHeight: '1'    }],
  '5xl':  ['48px', { lineHeight: '.95'  }],
},

letterSpacing: {
  normal:  '.04em',
  meta:    '.1em',
  label:   '.16em',
  sub:     '.18em',
  eyebrow: '.22em',
  tag:     '.3em',
},

lineHeight: {
  heading: '.95',
  tight:   '1',
  snug:    '1.25',
  compact: '1.4',
  base:    '1.55',
},

borderRadius: {
  pill:      '9999px',
  circle:    '50%',
  'card-lg': '32px',
  card:      '24px',
  'card-sm': '20px',
  badge:     '16px',
  inner:     '14px',
  input:     '12px',
},

borderWidth: {
  fine:  '1.5px',
  base:  '2px',
  thick: '2.5px',
  rule:  '3px',
},
```

---

## Step 2 — Add CSS custom properties to `global.css`

Open `src/styles/global.css`. At the very top of the existing `@layer base { }` block, before the `*, *::before` reset rule, insert this `:root` block verbatim. Every value here must exactly match its counterpart in `tailwind.config.mjs`.

```css
:root {
  /* ── Colours ──────────────────────────────────────────────── */
  --color-grape:        #4A1F8C;
  --color-grape-deep:   #2E0F5C;
  --color-plum:         #7B36C7;
  --color-lavender:     #EFD9FF;
  --color-lavender-mid: #E1BFFF;
  --color-cream:        #FFF6E8;
  --color-pink:         #EC3B8E;
  --color-orange:       #F37A2B;
  --color-lemon:        #F5CF3E;
  --color-mint:         #6CD7C2;
  --color-ink:          #2A0F4F;
  --color-text-muted:   #3d2666;
  --color-white:        #ffffff;

  /* RGB channel triples — for rgba() in scoped CSS only */
  --rgb-grape:  74, 31, 140;
  --rgb-pink:   236, 59, 142;
  --rgb-ink:    42, 15, 79;
  --rgb-lemon:  245, 207, 62;
  --rgb-orange: 243, 122, 43;

  /* ── Fonts ────────────────────────────────────────────────── */
  --font-display: "Bagel Fat One", "Caprasimo", serif;
  --font-groove:  "Caprasimo", serif;
  --font-body:    "DM Sans", system-ui, sans-serif;
  --font-hand:    "Caveat", cursive;
  --font-mono:    "DM Mono", "Courier New", monospace;

  /* ── Font sizes ───────────────────────────────────────────── */
  --text-2xs:  11px;
  --text-xs:   12px;
  --text-sm:   13px;
  --text-tag:  14px;
  --text-body: 15px;
  --text-md:   17px;
  --text-lg:   18px;
  --text-xl:   22px;
  --text-2xl:  26px;
  --text-3xl:  28px;
  --text-4xl:  34px;
  --text-5xl:  48px;

  /* ── Letter spacing ───────────────────────────────────────── */
  --tracking-normal:  .04em;
  --tracking-meta:    .1em;
  --tracking-label:   .16em;
  --tracking-sub:     .18em;
  --tracking-eyebrow: .22em;
  --tracking-tag:     .3em;

  /* ── Line heights ─────────────────────────────────────────── */
  --leading-heading: .95;
  --leading-tight:   1;
  --leading-snug:    1.25;
  --leading-compact: 1.4;
  --leading-base:    1.55;

  /* ── Spacing scale — 8px base, 4px half-steps ────────────── */
  --space-1:    4px;
  --space-2:    8px;
  --space-3:   12px;
  --space-3-5: 14px;   /* half-step — badge/tag/nav padding only */
  --space-4:   16px;
  --space-4-5: 18px;   /* half-step — form gaps and perk card padding only */
  --space-5:   20px;
  --space-5-5: 22px;   /* half-step — event grid gap and feed tab margin only */
  --space-6:   24px;
  --space-7:   28px;
  --space-8:   32px;
  --space-10:  40px;
  --space-11:  44px;
  --space-12:  48px;
  --space-14:  56px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
  --space-28: 112px;
  --space-36: 144px;

  /* ── Semantic layout spacing ──────────────────────────────── */
  --section-pad:    112px;  /* standard section top and bottom padding */
  --section-pad-sm:  88px;  /* hero top padding */
  --section-pad-lg: 144px;  /* hero bottom padding */
  --section-foot-t:  64px;  /* footer top padding */
  --section-foot-b:  32px;  /* footer bottom padding */
  --wrap-x:          32px;  /* container horizontal padding */
  --wrap-x-mobile:   20px;  /* container horizontal padding on mobile */

  /* ── Border radius ────────────────────────────────────────── */
  --radius-pill:    9999px;
  --radius-circle:  50%;
  --radius-card-lg: 32px;
  --radius-card:    24px;
  --radius-card-sm: 20px;
  --radius-badge:   16px;
  --radius-inner:   14px;
  --radius-input:   12px;

  /* ── Border widths ────────────────────────────────────────── */
  --border-fine:   1.5px;
  --border-base:   2px;
  --border-thick:  2.5px;
  --border-rule:   3px;

  /* ── Shadows ──────────────────────────────────────────────── */
  --shadow-card:          6px 6px 0 var(--color-grape);
  --shadow-card-hover:    9px 9px 0 var(--color-grape);
  --shadow-card-offset:   8px 8px 0 var(--color-grape);
  --shadow-btn:           4px 4px 0 var(--color-grape);
  --shadow-btn-hover:     6px 6px 0 var(--color-grape);
  --shadow-btn-nav:       3px 3px 0 var(--color-pink);
  --shadow-btn-nav-hover: 5px 5px 0 var(--color-pink);
  --shadow-sticker:       3px 3px 0 var(--color-grape);

  /* ── Transitions ──────────────────────────────────────────── */
  --duration-fast:   .15s;
  --duration-base:   .2s;
  --duration-medium: .25s;
  --duration-slow:   .3s;
}
```

After inserting the `:root` block, apply these substitutions to the **rest** of `global.css` (not the `:root` block you just inserted):

| Find | Replace |
|---|---|
| `background: #EFD9FF` | `background: var(--color-lavender)` |
| `color: #2A0F4F` | `color: var(--color-ink)` |
| `color: #4A1F8C` | `color: var(--color-grape)` |
| `color: #EC3B8E` | `color: var(--color-pink)` |
| `font-family: "Caprasimo", serif` | `font-family: var(--font-groove)` |
| `font-family: "DM Sans", system-ui, sans-serif` | `font-family: var(--font-body)` |
| `font-size: 14px` | `font-size: var(--text-tag)` |
| `letter-spacing: .3em` | `letter-spacing: var(--tracking-tag)` |
| `padding: 0 32px` | `padding: 0 var(--wrap-x)` |
| `padding: 0 18px` | `padding: 0 var(--wrap-x-mobile)` |

Do not alter `radial-gradient` rgba values in the `body::before` block.

---

## Step 3 — Migrate spacing values in section component `<style>` blocks

The spacing values currently in section components are inconsistent — many are ad-hoc px values that fall off the 8px grid. This step migrates all spacing properties to the scale defined in Step 2. **Some values will change by a few pixels** to meet the grid; this is intentional and correct.

Apply these substitutions to the `<style>` block of every file listed at the end of this step. Only substitute properties in the list below (`padding`, `margin`, `gap`, `top`, `right`, `bottom`, `left` when used for component-internal positioning). Do not substitute values in `transform`, `width`, `height`, `border-radius`, `box-shadow`, `stroke-width`, `font-size`, `letter-spacing`, or `line-height` — those are handled in Step 4.

### Spacing value mapping

Apply in order. Replace the exact string match. Context is `<style>` blocks only.

#### Section padding (vertical rhythm)

| Find | Replace | Note |
|---|---|---|
| `padding: 110px 0` | `padding: var(--section-pad) 0` | Standard sections (+2px) |
| `padding: 90px 0 140px` | `padding: var(--section-pad-sm) 0 var(--section-pad-lg)` | Hero (−2px top, +4px bottom) |
| `padding: 48px 0 180px` | `padding: var(--space-12) 0 var(--section-pad-lg)` | Hero mobile (−0px, −36px → 144px) |
| `padding: 60px 0 32px` | `padding: var(--section-foot-t) 0 var(--section-foot-b)` | Footer (+4px top) |
| `padding: 14px 0` | `padding: var(--space-3-5) 0` | Ticker bar (keep half-step) |

#### Card and component padding

| Find | Replace | Note |
|---|---|---|
| `padding: 64px 56px` | `padding: var(--space-16) var(--space-14)` | Booking card |
| `padding: 40px 28px` | `padding: var(--space-10) var(--space-7)` | Booking card mobile |
| `padding: 32px 28px` | `padding: var(--space-8) var(--space-7)` | HowItWorks feature card |
| `padding: 28px` | `padding: var(--space-7)` | AstrayBar card, booking form |
| `padding: 22px 22px 24px` | `padding: var(--space-6)` | Events card body (normalise to uniform) |
| `padding: 16px 18px` | `padding: var(--space-4) var(--space-4-5)` | AstrayBar perk card |
| `padding: 8px 16px` | `padding: var(--space-2) var(--space-4)` | Hero eyebrow pill |
| `padding: 8px 18px` | `padding: var(--space-2) var(--space-4-5)` | Feed tab buttons |
| `padding: 8px 14px` | `padding: var(--space-2) var(--space-3-5)` | AstrayBar label, Events pricetag |
| `padding: 6px 14px` | `padding: var(--space-1) var(--space-3-5)` | HowItWorks check badge, pricetag |
| `padding: 14px` | `padding: var(--space-3-5)` | Nav row padding |
| `padding: 12px` | `padding: var(--space-3)` | Polaroid image internal |
| `padding: 10px 12px` | `padding: var(--space-2) var(--space-3)` | |
| `padding-top: 14px` | `padding-top: var(--space-3-5)` | Events card foot |
| `padding-top: 22px` | `padding-top: var(--space-6)` | Footer legal (+2px) |

#### Gaps

| Find | Replace | Note |
|---|---|---|
| `gap: 64px` | `gap: var(--space-16)` | AstrayBar grid |
| `gap: 56px` | `gap: var(--space-14)` | Hero grid |
| `gap: 48px` | `gap: var(--space-12)` | Booking inner grid |
| `gap: 40px` | `gap: var(--space-10)` | Footer grid |
| `gap: 32px` | `gap: var(--space-8)` | Social section-head, media query gaps |
| `gap: 28px` | `gap: var(--space-7)` | Hero stats, nav ul |
| `gap: 24px` | `gap: var(--space-6)` | HowItWorks feature grid |
| `gap: 22px` | `gap: var(--space-5-5)` | Events event-grid (keep half-step) |
| `gap: 18px` | `gap: var(--space-4-5)` | Booking form, row2 (keep half-step) |
| `gap: 16px` | `gap: var(--space-4)` | Footer legal |
| `gap: 14px` | `gap: var(--space-3-5)` | AstrayBar perks, nav brand, events foot |
| `gap: 12px` | `gap: var(--space-3)` | Events card body, nav logo |
| `gap: 10px` | `gap: var(--space-2)` | Footer socials, hero eyebrow (+−2px) |
| `gap: 8px` | `gap: var(--space-2)` | Social feed grid, Events meta, hero stat |
| `gap: 6px` | `gap: var(--space-1)` | Footer nav list, events meta sub-gap |
| `gap: 4px` | `gap: var(--space-1)` | Social overlay icon gap |
| `gap: 48px;` followed by media query reducing it | Apply token to both the default and the responsive value |

#### Margins

| Find | Replace | Note |
|---|---|---|
| `margin-bottom: 56px` | `margin-bottom: var(--space-14)` | Social section-head |
| `margin-bottom: 40px` | `margin-bottom: var(--space-10)` | Footer grid-3 |
| `margin-bottom: 32px` | `margin-bottom: var(--space-8)` | Hero lede |
| `margin-bottom: 26px` | `margin-bottom: var(--space-6)` | BookingForm paragraph (−0px, round to 24px) |
| `margin-bottom: 24px` | `margin-bottom: var(--space-6)` | |
| `margin-bottom: 20px` | `margin-bottom: var(--space-5)` | Hero h1 bottom |
| `margin-bottom: 18px` | `margin-bottom: var(--space-4-5)` | BookingForm h2 |
| `margin-bottom: 14px` | `margin-bottom: var(--space-3-5)` | AstrayBar card h3 |
| `margin-bottom: 10px` | `margin-bottom: var(--space-2)` | Polaroid cap |
| `margin-bottom: 4px` | `margin-bottom: var(--space-1)` | |
| `margin-top: 42px` | `margin-top: var(--space-10)` | Hero stats (−2px) |
| `margin-top: 40px` | `margin-top: var(--space-10)` | |
| `margin-top: 38px` | `margin-top: var(--space-10)` | Humanitix note (−2px → 40px) |
| `margin-top: 32px` | `margin-top: var(--space-8)` | |
| `margin-top: 28px` | `margin-top: var(--space-7)` | AstrayBar perks top |
| `margin-top: 24px` | `margin-top: var(--space-6)` | Hero h1 top |
| `margin-top: 14px` | `margin-top: var(--space-3-5)` | AstrayBar menu list |
| `margin-top: 10px` | `margin-top: var(--space-2)` | Polaroid cap (+−2px) |
| `margin-top: 6px` | `margin-top: var(--space-1)` | Footer socials (−2px) |
| `margin-top: 4px` | `margin-top: var(--space-1)` | |
| `margin-top: 2px` | `margin-top: var(--space-1)` | Footer brand-sub (round up) |
| `margin: 28px 0 32px` | `margin: var(--space-7) 0 var(--space-8)` | AstrayBar perks margin |

#### Absolute positioning values used for layout (not decorative)

Only substitute `top`, `right`, `bottom`, `left` values that control spacing from an edge — not blob shapes or decoration overlaps.

| Find | Replace |
|---|---|
| `top: 14px; right: 14px` (pricetag) | `top: var(--space-3-5); right: var(--space-3-5)` |
| `top: 10px; right: 10px` (video badge) | `top: var(--space-2); right: var(--space-2)` |
| `margin-left: auto` (feed view-all) | keep as-is — not a spacing token |

### Files to process in Step 3

- `src/components/sections/Nav.astro`
- `src/components/sections/Hero.astro`
- `src/components/sections/Ticker.astro`
- `src/components/sections/HowItWorks.astro`
- `src/components/sections/Events.astro`
- `src/components/sections/AstrayBar.astro`
- `src/components/sections/SocialFeed.astro`
- `src/components/sections/BookingForm.astro`
- `src/components/sections/Footer.astro`

Also update `src/styles/global.css`:
- `.wrap { padding: 0 32px; }` → `padding: 0 var(--wrap-x)`
- The mobile `.wrap { padding: 0 18px; }` → `padding: 0 var(--wrap-x-mobile)`

---

## Step 4 — Migrate colour, typography, and structural values in `<style>` blocks

Apply these substitution tables to the same `<style>` blocks as Step 3, in the order listed.

### 4A — Colour

| Find | Replace |
|---|---|
| `#4A1F8C` | `var(--color-grape)` |
| `#2E0F5C` | `var(--color-grape-deep)` |
| `#3a1a6a` | `var(--color-grape-deep)` |
| `#7B36C7` | `var(--color-plum)` |
| `#EFD9FF` | `var(--color-lavender)` |
| `#E1BFFF` | `var(--color-lavender-mid)` |
| `#FFF6E8` | `var(--color-cream)` |
| `#EC3B8E` | `var(--color-pink)` |
| `#F37A2B` | `var(--color-orange)` |
| `#F5CF3E` | `var(--color-lemon)` |
| `#6CD7C2` | `var(--color-mint)` |
| `#2A0F4F` | `var(--color-ink)` |
| `#3d2666` | `var(--color-text-muted)` |
| `#fff`, `#FFF`, `#ffffff`, `#FFFFFF` | `var(--color-white)` |

**rgba() rule:** Do not modify existing `rgba(74,31,140,...)` style values — they are correct as-is. In new code only, write `rgba(var(--rgb-grape), .5)` instead.

### 4B — Font family

| Find | Replace |
|---|---|
| `font-family: "Bagel Fat One", serif` | `font-family: var(--font-display)` |
| `font-family: "Bagel Fat One", "Caprasimo", serif` | `font-family: var(--font-display)` |
| `font-family: "Caprasimo", serif` | `font-family: var(--font-groove)` |
| `font-family: "DM Sans", sans-serif` | `font-family: var(--font-body)` |
| `font-family: "DM Sans", system-ui, sans-serif` | `font-family: var(--font-body)` |
| `font-family: "Caveat", cursive` | `font-family: var(--font-hand)` |
| `font-family: "DM Mono", "Courier New", monospace` | `font-family: var(--font-mono)` |

### 4C — Font size

Only substitute values in the table. Leave `clamp()` expressions, `19px`, `20px`, and any unique one-off size as hardcoded.

| Find | Replace |
|---|---|
| `font-size: 11px` | `font-size: var(--text-2xs)` |
| `font-size: 12px` | `font-size: var(--text-xs)` |
| `font-size: 13px` | `font-size: var(--text-sm)` |
| `font-size: 14px` | `font-size: var(--text-tag)` |
| `font-size: 15px` | `font-size: var(--text-body)` |
| `font-size: 17px` | `font-size: var(--text-md)` |
| `font-size: 18px` | `font-size: var(--text-lg)` |
| `font-size: 22px` | `font-size: var(--text-xl)` |
| `font-size: 26px` | `font-size: var(--text-2xl)` |
| `font-size: 28px` | `font-size: var(--text-3xl)` |
| `font-size: 34px` | `font-size: var(--text-4xl)` |
| `font-size: 48px` | `font-size: var(--text-5xl)` |

### 4D — Letter spacing

| Find | Replace |
|---|---|
| `letter-spacing: .04em` | `letter-spacing: var(--tracking-normal)` |
| `letter-spacing: .1em` | `letter-spacing: var(--tracking-meta)` |
| `letter-spacing: .16em` | `letter-spacing: var(--tracking-label)` |
| `letter-spacing: .18em` | `letter-spacing: var(--tracking-sub)` |
| `letter-spacing: .22em` | `letter-spacing: var(--tracking-eyebrow)` |
| `letter-spacing: .3em` | `letter-spacing: var(--tracking-tag)` |

Leave `.01em`, `.06em`, `.08em` as hardcoded — they are one-off values.

### 4E — Line height

| Find | Replace |
|---|---|
| `line-height: .95` | `line-height: var(--leading-heading)` |
| `line-height: 1` | `line-height: var(--leading-tight)` |
| `line-height: 1.05` | `line-height: var(--leading-tight)` |
| `line-height: 1.25` | `line-height: var(--leading-snug)` |
| `line-height: 1.4` | `line-height: var(--leading-compact)` |
| `line-height: 1.5` | `line-height: var(--leading-base)` |
| `line-height: 1.55` | `line-height: var(--leading-base)` |

Note: `1.05` maps to `--leading-tight` (1) — this is a ±0.05 rounding, imperceptible at any font size.

### 4F — Border radius

Substitute semantic radii only. Do not substitute multi-value blob patterns like `62% 38% 55% 45%/45% 60% 40% 55%`.

| Find | Replace |
|---|---|
| `border-radius: 9999px` | `border-radius: var(--radius-pill)` |
| `border-radius: 999px` | `border-radius: var(--radius-pill)` |
| `border-radius: 50%` | `border-radius: var(--radius-circle)` |
| `border-radius: 32px` | `border-radius: var(--radius-card-lg)` |
| `border-radius: 24px` | `border-radius: var(--radius-card)` |
| `border-radius: 20px` | `border-radius: var(--radius-card-sm)` |
| `border-radius: 16px` | `border-radius: var(--radius-badge)` |
| `border-radius: 14px` | `border-radius: var(--radius-inner)` |
| `border-radius: 12px` | `border-radius: var(--radius-input)` |
| `border-radius: 2px` | keep as-is (polaroid frame edge — intentional one-off) |
| `border-radius: 1px` | keep as-is (polaroid image edge — intentional one-off) |

### 4G — Border width

| Find | Replace |
|---|---|
| `border: 2.5px solid` | `border: var(--border-thick) solid` |
| `border: 2px solid` | `border: var(--border-base) solid` |
| `border: 1.5px solid` | `border: var(--border-fine) solid` |
| `border: 3px solid` | `border: var(--border-rule) solid` |
| `border-bottom: 2px solid` | `border-bottom: var(--border-base) solid` |
| `border-bottom: 3px solid` | `border-bottom: var(--border-rule) solid` |
| `border-top: 3px solid` | `border-top: var(--border-rule) solid` |
| `border-top: 1.5px solid` | `border-top: var(--border-fine) solid` |
| `var(--border-fine) dashed` | (result of prior substitution on `1.5px dashed` lines) |

### 4H — Shadows

Run after 4A (colour must already be substituted before shadows are matched).

| Find | Replace |
|---|---|
| `box-shadow: 6px 6px 0 var(--color-grape)` | `box-shadow: var(--shadow-card)` |
| `box-shadow: 9px 9px 0 var(--color-grape)` | `box-shadow: var(--shadow-card-hover)` |
| `box-shadow: 8px 8px 0 var(--color-grape)` | `box-shadow: var(--shadow-card-offset)` |
| `box-shadow: 3px 3px 0 var(--color-grape)` | `box-shadow: var(--shadow-sticker)` |

### 4I — Transitions

| Find | Replace |
|---|---|
| `transition: .15s` | `transition: var(--duration-fast)` |
| `transition: .2s` | `transition: var(--duration-base)` |
| `transition: .25s` | `transition: var(--duration-medium)` |
| `transition: .3s` | `transition: var(--duration-slow)` |
| `transition: all .2s` | `transition: all var(--duration-base)` |
| `transition: border-color .15s, background .15s` | `transition: border-color var(--duration-fast), background var(--duration-fast)` |
| `transition: .4s` | keep as-is — polaroid animation, intentional unique timing |
| `transition: opacity .9s ease, transform .9s cubic-bezier(.2,.7,.2,1)` | keep as-is — reveal animation |

---

## Step 5 — Update inline SVG attributes in templates

These components contain inline `<svg>` elements with hardcoded hex in presentation attributes. CSS custom properties are valid in inline SVG in all modern browsers.

### `src/components/sections/Hero.astro` — decorative squiggle SVGs

| Find | Replace |
|---|---|
| `stroke="#EC3B8E"` | `stroke="var(--color-pink)"` |
| `stroke="#F37A2B"` | `stroke="var(--color-orange)"` |
| `stroke="#F5CF3E"` | `stroke="var(--color-lemon)"` |
| `stroke="#6CD7C2"` | `stroke="var(--color-mint)"` |
| `stroke="#7B36C7"` | `stroke="var(--color-plum)"` |

### `src/components/sections/AstrayBar.astro` — decorative SVG

| Find | Replace |
|---|---|
| `stroke="#F5CF3E"` | `stroke="var(--color-lemon)"` |
| `stroke="#EC3B8E"` | `stroke="var(--color-pink)"` |

### `src/components/sections/HowItWorks.astro` — icon SVG strings and inline style

In the `steps` array in the frontmatter, the `icon` strings contain SVG path data with fill attributes. Update:

| Find | Replace |
|---|---|
| `fill="#FFF6E8"` | `fill="var(--color-cream)"` |

In the template, the `icon-circle` div has `style={`background:${step.color}`}`. Update the `color` values in the `steps` array:

| Old value | Replace |
|---|---|
| `'#EC3B8E'` | `'var(--color-pink)'` |
| `'#F37A2B'` | `'var(--color-orange)'` |
| `'#6CD7C2'` | `'var(--color-mint)'` |

### `src/components/sections/Events.astro` — cover style object

In the `coverStyles` object in the frontmatter:

| Find | Replace |
|---|---|
| `'background:#3a1a6a'` | `'background:var(--color-grape-deep)'` |
| `'background:#F37A2B'` | `'background:var(--color-orange)'` |
| `'background:#4A1F8C'` | `'background:var(--color-grape)'` |

---

## Step 6 — Verify

### 6A — Zero raw hex values remaining

Search all `.astro` files for `#[0-9A-Fa-f]{3,6}` — the only permitted remaining instances are:

- Multi-value organic border-radius strings (blob shapes — contain no hex)
- `rgba(...)` values — intentionally kept per 4A rules
- `#FFD4DD` in Nav — logo background tint, one documented exception with no matching token

### 6B — Zero off-scale spacing values

Search `<style>` blocks for `padding`, `margin`, `gap` properties containing raw pixel values. Every value must either be a `var(--space-*)` or `var(--section-*)` token, OR appear in the explicit exception list below.

**Permitted remaining hardcoded spacing values** (one-off, documented, do not need tokens):
- Section-specific `height` and `width` values for decorative elements (blobs, polaroids, stage)
- `top`, `right`, `bottom`, `left` values for decorative absolutely-positioned blobs and overlapping shapes
- `stroke-width` on SVG elements
- Pixel values inside `clamp()` expressions
- `18px` in `.wrap` mobile — maintained as `var(--wrap-x-mobile)` (structural, 20px after rounding)

### 6C — tailwind.config.mjs parity

Every colour in `tailwind.config.mjs` `theme.extend.colors` must have a matching `--color-*` variable in the `global.css` `:root` block with the same hex value.

### 6D — Build

`npm run build` must complete with zero errors.

### 6E — Visual check

Run `npm run dev`. Verify every section. Spacing changes will be subtle (±4px in most cases) — check that no element looks broken or disproportionate. Pay particular attention to:

- Section vertical rhythm: all standard sections should feel equally spaced (they all now use `--section-pad: 112px`)
- Card internal padding: feature cards, event cards, booking form should feel consistent
- Gaps in grids: event grid, feed grid, feature grid should feel consistent
- Hero proportions: the hero top/bottom split changed slightly (88px top, 144px bottom)

---

## Half-step values — allowed exceptions

The following off-grid values are allowed and are tokenised as half-steps:

| Token | Value | Why it exists |
|---|---|---|
| `--space-3-5` | 14px | Badge/tag/nav padding — the 16px base feels too chunky; 12px too tight. Used consistently across all badge-like elements. |
| `--space-4-5` | 18px | Form gaps and perk card padding — sits between 16px (tight) and 20px (loose) for medium density inputs. |
| `--space-5-5` | 22px | Event grid gap and feed tab margin — 24px grid gap is slightly loose for the 3-column card layout. |

Any NEW value added to the codebase that is not a multiple of 4, or not on this list, is a bug.

---

## Values that are not part of the spacing system

Do not attempt to tokenise these — they are geometric, not rhythmic:

- Blob `border-radius` shape values (`62% 38% 55%...`)
- Decorative absolute positions (`top: -90px`, `right: -60px` for blob overflow)
- Transform values (`translateX(-3px)`, `rotate(8deg)`)
- Animation keyframe values
- SVG `stroke-width` values
- `width` and `height` for fixed-dimension decorative elements (blob shapes, polaroids, icon circles)
- `max-width` on text containers (these are content-specific, not rhythmic spacing)

---

## Forward-looking rules for new code

1. **All new spacing** must use a `var(--space-*)` token or a Tailwind spacing utility (`gap-6`, `p-4`, `py-28`). Never write a raw `px` spacing value directly.
2. **New half-steps** require a comment justifying why neither the step above nor below works.
3. **New colours** must be added to both `tailwind.config.mjs` and the `global.css` `:root` block simultaneously.
4. **`rgba()` usage** — write `rgba(var(--rgb-*), alpha)`. Never write `rgba(74,31,140, alpha)` directly.
5. **Tailwind arbitrary values** (`w-[283px]`, `text-[19px]`) are permitted for layout dimensions and one-off sizes. They are not permitted for colours, font families, or shadows — use the named tokens.
