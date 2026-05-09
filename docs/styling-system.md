# Seekie Studios - Styling System

How colours, spacing, typography, and component styling are organised across the site. Read this before adding a new section, restyling an existing one, or introducing a new design token.

---

## Why this exists

Before the migration, every section had hardcoded hex colours, ad-hoc pixel paddings, repeated font stacks, and box-shadow strings copied verbatim across files. That meant:

- Colour or spacing tweaks required search-and-replace across a dozen files, with no guarantee of catching every occurrence
- The "same" value (e.g. card padding) drifted across components - 22px here, 24px there, 28px somewhere else
- Tailwind utilities and scoped `<style>` blocks each used different magic numbers for the same visual concept
- New developers had no signal about which values were intentional one-offs and which were the canonical scale

The styling system replaces this with a **two-surface token architecture**: every design value is declared once in `tailwind.config.mjs` (for utility classes) and once in `:root` of `global.css` (for scoped CSS). Components consume tokens from whichever surface fits their context.

---

## Architecture at a glance

```
tailwind.config.mjs  ──▶  Utility classes in templates
   theme.extend            (bg-pink, text-grape, shadow-card, gap-6)
        │                              ▲
        │                              │ used by
        │                              │
        ▼                       ui/ components
  src/styles/global.css                ▲
   :root { --tokens }                  │
        │                              │
        │  used by                     │
        ▼                              │
   sections/ components ◀──────────────┘
   (scoped <style> blocks               also pulls global
    using var(--token))                 utility helpers
```

Both surfaces define the same values. `tailwind.config.mjs` is the authoritative source; `:root` mirrors it for runtime CSS access. They must stay in sync.

### The three layers

| Layer | File | Role |
|---|---|---|
| **Tailwind tokens** | `tailwind.config.mjs` | Drives utility classes (`bg-pink`, `p-6`, `text-2xl`, `shadow-card`). Used by `ui/` components and any inline class on a section element. |
| **CSS tokens** | `src/styles/global.css` `:root` | Drives scoped `<style>` blocks via `var(--token)`. Required for `rgba()` opacity variants, `::before`/`::after` pseudo-element styling, and complex `:hover`/`:focus` state changes. |
| **Globals** | `src/styles/global.css` (rest of file) | Base resets, body styling, the `.wrap` container, the `.section-tag` decoration, animation keyframes (`ticker-scroll`, `float`, `reveal`). |

### Where styling lives, by component type

| Component type | Where styling goes | Why |
|---|---|---|
| `src/components/ui/*` (Button, FormField, SectionHeading, Icon) | Tailwind utility classes only, in the template. No `<style>` block. | These are the most-reused primitives. Utilities make their styling self-contained and remixable via `class` props. |
| `src/components/sections/*` (Hero, Nav, Footer, etc.) | Scoped `<style>` block using `var(--token)`. Tailwind utilities allowed for trivial layout (`mb-14`, `gap-8`). | Section components have many descendants with semantic class names (`.feature .icon-circle`, `.event .pricetag`). Scoped CSS keeps that markup readable. |
| `src/layouts/Layout.astro` | No component-level styling. Imports `global.css`. | Pure shell. |
| `src/pages/*` | No styling. Compose sections only. | Pages are routing concerns, not styling concerns. |

---

## Token catalogue

Every token below exists in **both** `tailwind.config.mjs` and `global.css :root`. The Tailwind utility name (e.g. `bg-pink`) and the CSS variable (e.g. `var(--color-pink)`) reference the same hex value.

### Colours

| CSS var | Tailwind class | Hex | Used for |
|---|---|---|---|
| `--color-grape` | `grape` | `#4A1F8C` | Primary brand purple - headings, borders, dark backgrounds |
| `--color-grape-deep` | `grape-deep` | `#2E0F5C` | Footer background, dark card backgrounds |
| `--color-plum` | `plum` | `#7B36C7` | Secondary text, inactive captions |
| `--color-lavender` | `lavender` | `#EFD9FF` | Page background, soft surfaces |
| `--color-lavender-mid` | `lavender-mid` | `#E1BFFF` | Footer text, dashed dividers |
| `--color-cream` | `cream` | `#FFF6E8` | "Light" section background, on-grape text |
| `--color-pink` | `pink` | `#EC3B8E` | Primary CTA, accent dots, hover states |
| `--color-orange` | `orange` | `#F37A2B` | Stat numbers, warm accent |
| `--color-lemon` | `lemon` | `#F5CF3E` | Yellow accents, on-grape text, badges |
| `--color-mint` | `mint` | `#6CD7C2` | Cool accent, decorative blobs |
| `--color-ink` | `ink` | `#2A0F4F` | Body text on light backgrounds |
| `--color-text-muted` | (none) | `#3d2666` | Secondary body text in cards |
| `--color-white` | (none) | `#ffffff` | Card backgrounds |

There is also a small set of **RGB channel triples** (`--rgb-grape`, `--rgb-pink`, `--rgb-ink`, `--rgb-lemon`, `--rgb-orange`) for `rgba()` opacity variants in scoped CSS:

```css
background: rgba(var(--rgb-grape), .12);
```

### Spacing

The scale is **4px-based with 8px steps**. Half-steps exist only at `14`, `18`, `22` - these are the documented exceptions where neither the step above nor below works.

| CSS var | Tailwind class | Value |
|---|---|---|
| `--space-1` | `p-1`, `gap-1`, etc. | 4px |
| `--space-2` | `p-2` | 8px |
| `--space-3` | `p-3` | 12px |
| `--space-3-5` | `p-3.5` | 14px (half-step) |
| `--space-4` | `p-4` | 16px |
| `--space-4-5` | `p-4.5` | 18px (half-step) |
| `--space-5` | `p-5` | 20px |
| `--space-5-5` | `p-5.5` | 22px (half-step) |
| `--space-6` | `p-6` | 24px |
| `--space-7` | `p-7` | 28px |
| `--space-8` | `p-8` | 32px |
| `--space-10` | `p-10` | 40px |
| `--space-11` | `p-11` | 44px |
| `--space-12` | `p-12` | 48px |
| `--space-14` | `p-14` | 56px |
| `--space-16` | `p-16` | 64px |
| `--space-20` | `p-20` | 80px |
| `--space-24` | `p-24` | 96px |
| `--space-28` | `p-28` | 112px |
| `--space-36` | `p-36` | 144px |

#### Semantic layout spacing

These wrap the raw scale with intent labels. Use these in section roots, not the raw `--space-*` token:

| CSS var | Value | Used for |
|---|---|---|
| `--section-pad` | 112px | Top + bottom padding on standard sections |
| `--section-pad-sm` | 88px | Hero top padding |
| `--section-pad-lg` | 144px | Hero bottom padding |
| `--section-foot-t` | 64px | Footer top padding |
| `--section-foot-b` | 32px | Footer bottom padding |
| `--wrap-x` | 32px | Horizontal padding on `.wrap` |
| `--wrap-x-mobile` | 20px | `.wrap` horizontal padding under 680px |

### Typography

| CSS var | Tailwind class | Value | Used for |
|---|---|---|---|
| `--font-display` | `font-display` | `"Bagel Fat One", "Caprasimo", serif` | h1, h2, large numerals |
| `--font-groove` | `font-groove` | `"Caprasimo", serif` | Eyebrow tags, h3 in cards |
| `--font-body` | `font-body` | `"DM Sans", system-ui, sans-serif` | Body text, buttons |
| `--font-hand` | `font-hand` | `"Caveat", cursive` | Polaroid captions, decorative scribbles |
| `--font-mono` | (none) | `"DM Mono", "Courier New", monospace` | Placeholder photo text |

#### Font sizes

`text-2xs` (11px) → `text-5xl` (48px). Each carries a default `line-height`. Use `clamp()` for fluid hero sizes - those stay hardcoded.

#### Letter spacing

| CSS var | Tailwind class | Value | Used for |
|---|---|---|---|
| `--tracking-normal` | `tracking-normal` | `.04em` | Buttons, ticker |
| `--tracking-meta` | `tracking-meta` | `.1em` | Date/time meta lines |
| `--tracking-label` | `tracking-label` | `.16em` | Form labels, footer brand sub |
| `--tracking-sub` | `tracking-sub` | `.18em` | Nav tagline |
| `--tracking-eyebrow` | `tracking-eyebrow` | `.22em` | Hero eyebrow |
| `--tracking-tag` | `tracking-tag` | `.3em` | Section tags |

#### Line heights

`--leading-heading` (.95) for headlines, through `--leading-base` (1.55) for body copy. See `:root` for the full set.

### Borders

| CSS var | Tailwind class | Value |
|---|---|---|
| `--border-fine` | `border-fine` | 1.5px |
| `--border-base` | `border-base` | 2px |
| `--border-thick` | `border-thick` | 2.5px |
| `--border-rule` | `border-rule` | 3px |

| CSS var | Tailwind class | Value | Used for |
|---|---|---|---|
| `--radius-pill` | `rounded-pill` | 9999px | Buttons, badges, tickets |
| `--radius-circle` | `rounded-circle` | 50% | Icon circles, avatars |
| `--radius-card-lg` | `rounded-card-lg` | 32px | Booking card |
| `--radius-card` | `rounded-card` | 24px | Event cards, feature cards |
| `--radius-card-sm` | `rounded-card-sm` | 20px | Form panel |
| `--radius-badge` | `rounded-badge` | 16px | Perk cards |
| `--radius-inner` | `rounded-inner` | 14px | Feed posts, list items |
| `--radius-input` | `rounded-input` | 12px | Form inputs |

### Shadows

| CSS var | Tailwind class | Value |
|---|---|---|
| `--shadow-card` | `shadow-card` | `6px 6px 0 var(--color-grape)` |
| `--shadow-card-hover` | `shadow-card-hover` | `9px 9px 0 var(--color-grape)` |
| `--shadow-card-offset` | (none) | `8px 8px 0 var(--color-grape)` |
| `--shadow-btn` | `shadow-btn` | `4px 4px 0 var(--color-grape)` |
| `--shadow-btn-hover` | `shadow-btn-hover` | `6px 6px 0 var(--color-grape)` |
| `--shadow-btn-nav` | `shadow-btn-nav` | `3px 3px 0 var(--color-pink)` |
| `--shadow-btn-nav-hover` | `shadow-btn-nav-hover` | `5px 5px 0 var(--color-pink)` |
| `--shadow-sticker` | (none) | `3px 3px 0 var(--color-grape)` |

### Transitions

`--duration-fast` (.15s), `--duration-base` (.2s), `--duration-medium` (.25s), `--duration-slow` (.3s). Anything longer (e.g. .4s polaroid spring, .9s reveal animation) is intentionally a one-off and stays hardcoded.

---

## Standards

### 1. Choose the right surface

Use this decision tree for any new style:

| You are styling a... | Use |
|---|---|
| `ui/` primitive (Button, FormField, etc.) | Tailwind utility classes only |
| Trivial layout on a section element (margin, gap, flex) | Tailwind utility classes preferred |
| Section internals with descendant selectors | Scoped `<style>` block + `var(--token)` |
| Pseudo-element (`::before`, `::after`) | Scoped `<style>` block + `var(--token)` |
| Multi-property `:hover`/`:focus` state | Scoped `<style>` block + `var(--token)` |
| Component-specific `@media` query | Scoped `<style>` block + `var(--token)` |
| Element rendered via `set:html` (CMS HTML) | Scoped `<style>` block with `:global()` selectors |
| Site-wide reset, base, or shared utility | `global.css` |

### 2. Never write a raw hex in a component

Every colour reference must resolve through a token. The only documented exceptions are:

- `#FFD4DD` in `Nav.astro` `.brand-logo` (logo background tint - one-off, no matching token)
- `rgba(74,31,140,...)` literals in legacy code (do not rewrite; for new code use `rgba(var(--rgb-grape), alpha)`)
- Multi-stop organic blob `border-radius` values (`62% 38% 55% 45%/45% 60% 40% 55%`) - these are shape descriptors, not colour or spacing

### 3. Never write a raw px spacing value

Every `padding`, `margin`, `gap`, and edge-positional `top`/`right`/`bottom`/`left` must resolve to a `var(--space-*)`, `var(--section-*)`, or `var(--wrap-*)` token. Pixel values are reserved for:

- `width` / `height` of fixed-dimension decorative elements (blobs, polaroids, icon circles)
- Decorative absolute positioning (`top: -90px` for blob overflow)
- `stroke-width` on SVGs
- Pixel values inside `clamp()`
- Transform offsets (`translateX(-3px)`, `rotate(8deg)`)
- `max-width` on text containers (content-specific, not rhythmic)

### 4. New tokens require dual updates

Both `tailwind.config.mjs` and `:root` must be edited in the same change. Token name conventions:

| Category | Tailwind key | CSS var |
|---|---|---|
| Colour | `colors.<name>` | `--color-<name>` |
| Spacing | `spacing.<n>` | `--space-<n>` |
| Font | `fontFamily.<name>` | `--font-<name>` |
| Letter spacing | `letterSpacing.<name>` | `--tracking-<name>` |
| Line height | `lineHeight.<name>` | `--leading-<name>` |
| Border radius | `borderRadius.<name>` | `--radius-<name>` |
| Border width | `borderWidth.<name>` | `--border-<name>` |
| Shadow | `boxShadow.<name>` | `--shadow-<name>` |

### 5. Half-steps are gated

Only `--space-3-5`, `--space-4-5`, and `--space-5-5` exist as half-steps. Adding a new half-step (e.g. `--space-2-5` for 10px) requires:

1. Justification: why neither the step above nor below works for the use case
2. The value must be a multiple of 2 (we never go below the 4px micro-grid)
3. A comment in `tailwind.config.mjs` and `global.css` documenting where it is used

If the answer is "the design just feels right at 10px", the answer is to use `--space-2` (8px) or `--space-3` (12px) and adjust the surrounding rhythm.

### 6. Use `rgba()` correctly

Inside scoped CSS:

```css
/* New code */
background: rgba(var(--rgb-grape), .12);

/* Legacy code - leave as-is */
background: rgba(74, 31, 140, .12);
```

If you need an opacity variant of a colour that does not yet have an `--rgb-*` triple, add the triple to `:root` before using it.

In Tailwind utilities, use the slash syntax: `bg-grape/12`, `border-lemon/25`. This compiles to the same `rgba()` output.

### 7. Tailwind arbitrary values

Permitted for one-off layout dimensions and unique sizes:

```astro
<div class="w-[283px] text-[19px]">
```

Not permitted for colours, font families, or shadows - use the named tokens. If a value is appearing in arbitrary syntax twice, it is a candidate for promotion to a named token.

### 8. `set:html` content needs `:global()`

Any markup injected via `set:html` (from CMS HTML, icon registries, etc.) is not Astro-scoped. Style it from the consuming component using `:global()`:

```astro
<h1 class="hero-title" set:html={data.headline} />

<style>
  h1.hero-title :global(.gw)  { color: var(--color-pink); }
  h1.hero-title :global(.amp) { color: var(--color-orange); transform: rotate(-8deg); }
</style>
```

### 9. SVG colour tokens

Inline SVG `stroke=` and `fill=` attributes accept CSS custom properties in all modern browsers we target. Use them rather than hex:

```astro
<path stroke="var(--color-pink)" stroke-width="24" />
```

For colours selected dynamically (e.g. from a CMS string), build a registry that maps the editor-friendly value to a token:

```ts
const colorVar: Record<string, string> = {
  pink:   'var(--color-pink)',
  orange: 'var(--color-orange)',
  mint:   'var(--color-mint)',
};
```

See `HowItWorks.astro` for the canonical example.

### 10. Keep one-off values one-off

Every codebase has a handful of values that genuinely don't fit a scale. Mark them obvious:

```css
font-size: 19px;     /* one-off lede size, between text-lg and text-xl */
font-size: clamp(56px, 9.5vw, 140px);  /* fluid hero - intentional */
```

Do not add a token for a value used in exactly one place. Do add a token the moment it appears in a second.

---

## Cookbook

### Add a new colour token

1. Pick a name. Follow the `<noun>` or `<noun>-<modifier>` convention (`grape`, `grape-deep`, not `dark-purple-2`).
2. Add to `tailwind.config.mjs`:

   ```js
   colors: {
     ...,
     coral: '#FF7A6B',
   },
   ```

3. Add the matching CSS var to `:root` in `global.css`:

   ```css
   --color-coral: #FF7A6B;
   ```

4. If the colour will be used in `rgba()`, also add an RGB triple:

   ```css
   --rgb-coral: 255, 122, 107;
   ```

5. Run `npm run build` to verify Tailwind picks up the new utility (`bg-coral`, `text-coral`, etc.).

### Add a new spacing token

1. Confirm the value is a multiple of 4. If you need a half-step at a new position, see [Standard 5](#5-half-steps-are-gated).
2. Add to `tailwind.config.mjs` `theme.extend.spacing`:

   ```js
   spacing: {
     '4.5': '18px',
     '6.5': '26px',  // new
   },
   ```

3. Add to `:root`:

   ```css
   --space-6-5: 26px;  /* used for: <document why> */
   ```

4. Use in scoped CSS: `padding: var(--space-6-5)` or in templates: `p-6.5`.

### Style a new section component

1. Create `src/components/sections/MySection.astro`.
2. Use Tailwind utilities for the outer wrapper layout when sufficient:

   ```astro
   <section class="bg-cream py-28 relative z-[2]">
     <div class="wrap">
       ...
     </div>
   </section>
   ```

3. Drop into a scoped `<style>` block as soon as you have descendant selectors, pseudo-elements, or multi-property hover states:

   ```astro
   <style>
     .my-card {
       background: var(--color-white);
       border: var(--border-thick) solid var(--color-grape);
       border-radius: var(--radius-card);
       padding: var(--space-8) var(--space-7);
       box-shadow: var(--shadow-card);
       transition: var(--duration-slow);
     }
     .my-card:hover {
       transform: translate(-3px, -3px);
       box-shadow: var(--shadow-card-hover);
     }
   </style>
   ```

4. Standard section vertical rhythm: `padding: var(--section-pad) 0` on the section root.

### Add a hover transform pattern

The site uses a consistent "lift on hover" pattern - copy it rather than inventing a new one:

```css
.thing {
  transition: var(--duration-slow);
  box-shadow: var(--shadow-card);
}
.thing:hover {
  transform: translate(-3px, -3px);
  box-shadow: var(--shadow-card-hover);
}
```

The translate offset matches the difference between `--shadow-card` (6px) and `--shadow-card-hover` (9px), so the shadow stays anchored visually as the element lifts.

### Style content rendered via `set:html`

The content system documents which CMS fields support inline HTML (see `docs/content-system.md` § 6). For each, expose styles via `:global()`:

```astro
<h2 class="bf-heading" set:html={data.heading} />

<style>
  .bf-heading :global(.pink) { color: var(--color-pink); }
  .bf-heading :global(br)    { display: block; margin-top: var(--space-2); }
</style>
```

### Add an opacity variant of a token colour

Two paths depending on context:

**In a Tailwind utility:**

```astro
<div class="bg-grape/12 border-lemon/25">
```

**In scoped CSS:**

1. Make sure the `--rgb-<name>` triple exists in `:root`. If not, add it.
2. Use `rgba()`:

   ```css
   background: rgba(var(--rgb-grape), .12);
   ```

---

## Gotchas

- **Tailwind config and `:root` can drift.** They are two surfaces, not one. CI does not yet enforce parity. Every PR that adds a token must touch both files.
- **Half-step Tailwind classes.** Tailwind exposes `4.5` and `5.5` because we registered them under `theme.extend.spacing`. The corresponding CSS vars use hyphenated names: `--space-4-5`, `--space-5-5`. Don't confuse the two when search-and-replacing.
- **`box-shadow` tokens reference colour vars.** A shadow like `var(--shadow-card)` expands to `6px 6px 0 var(--color-grape)`. Changing the grape hex updates every card shadow automatically. Don't redeclare a literal shadow string in a component.
- **`rgba()` literals in legacy code.** Step 4A of the migration deliberately did **not** rewrite existing `rgba(74,31,140,.x)` calls because they were already correct. New code uses the `--rgb-*` triples. Don't bulk-rewrite the legacy ones - it adds churn without changing output.
- **`clamp()` font sizes are hardcoded by design.** Hero h1, booking-card h2, and the social-feed h2 use `clamp()` for fluid sizing. Do not try to tokenise these; the math depends on the specific viewport range.
- **`font-size: 19px` and `20px` exist on purpose.** Two lede paragraphs sit between `text-lg` (18px) and `text-xl` (22px). Promoting them to a token would mean adding an off-grid size used in exactly two places. They are documented one-offs.
- **`#FFD4DD` in `Nav.astro` is a documented exception.** It tints the brand logo's transparent background; no other element uses it. Don't add it to the palette unless a second use case appears.
- **Scoped styles and `:global()`.** Astro scopes class selectors to the component by default, but selectors on elements that come from `set:html` (or `<slot />` content) won't match unless wrapped in `:global()`. If a style "isn't applying", check this first.
- **`global.css` `@layer` order matters.** `@layer base` defines the `:root` block and base resets; `@layer utilities` defines `.wrap`, `.font-groove`, `.section-tag`. Tailwind's reset (`@tailwind base`) runs before `@layer base` because of layer ordering, so our `:root` overrides stay authoritative.
- **The `.section-tag` decoration is global.** It is used identically across Hero, AstrayBar, HowItWorks, Events, Footer, and SocialFeed. Don't redeclare it in a component - extend the global rule if you need a variant.
