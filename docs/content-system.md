# Seekie Studios - CMS Content System

How copy and imagery flow from Keystatic into the rendered site. Read this before editing the content schema, adding a new section, or wiring up a new field.

---

## Why this exists

Every section's copy and imagery used to be hardcoded in the `.astro` component. That meant:

- The client could not change a single word without a developer edit + git commit
- Image swaps required a developer to drop a file into `public/` and update an `<img>` tag
- Section copy was scattered across many files with no single source of truth

The CMS system replaces this with a set of **Keystatic singletons**, one per logical content area, edited in the `/keystatic` admin UI and surfaced to components via Astro's content collection layer.

---

## Architecture at a glance

```
Keystatic admin UI  ──writes──▶  src/content/settings/<name>.json
                                          │
                                          ▼
                          Astro `settings` content collection
                                          │
                                          ▼
                  Component:  await getEntry('settings', '<name>')
```

Image fields write the uploaded file to `src/assets/settings/` and store the path string in the JSON. Components resolve that string back to an `ImageMetadata` object via the shared `resolveSettingsImage` helper.

### The three layers

| Layer | File | Role |
|---|---|---|
| **Schema** | `keystatic.config.ts` | Defines what fields exist, their types, defaults, validation, image upload directory. Drives the admin UI. |
| **Data** | `src/content/settings/*.json` | The actual content. Editable in `/keystatic` or directly in git. |
| **Glue** | `src/content.config.ts` | Registers the `settings` collection so Astro knows how to load these JSON files. |

### The settings collection

Defined in `src/content.config.ts`:

```ts
const settings = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/settings' }),
  schema: z.object({}).passthrough(),
});
```

We deliberately use a permissive `passthrough` schema. Keystatic already validates the shape of each singleton on save, so a strict Zod schema here would just duplicate that work and force every schema change to be made in two places. **Per-singleton TypeScript interfaces live inline at the top of each component** instead - this is the source of truth for component-side typing.

### Entry IDs

Astro derives the entry id from the JSON filename. So:

| File | `getEntry` call |
|---|---|
| `nav.json` | `getEntry('settings', 'nav')` |
| `how-it-works.json` | `getEntry('settings', 'how-it-works')` |
| `astray-bar.json` | `getEntry('settings', 'astray-bar')` |
| `booking-form.json` | `getEntry('settings', 'booking-form')` |

The Keystatic singleton key (`howItWorks`, `astrayBar`, etc.) is purely a UI label, **not** the entry id. Always use the kebab-case filename slug when calling `getEntry`.

---

## The singletons

| Key | File | What it controls |
|---|---|---|
| `site` | `src/content/settings/site.json` | Email, phone, ABN, Instagram URL, Facebook URL. Source of truth for socials and contact info, used by Footer + BookingForm. |
| `seo` | `src/content/settings/seo.json` | Page title, meta description, OG image, favicon. |
| `nav` | `src/content/settings/nav.json` | Brand name, tagline, logo, nav links, CTA. |
| `hero` | `src/content/settings/hero.json` | Eyebrow, headline (HTML), lede, two CTAs, stats, four polaroid slots (caption + optional image). |
| `ticker` | `src/content/settings/ticker.json` | Items in the marquee. |
| `howItWorks` | `src/content/settings/how-it-works.json` | Section heading, three steps (icon + colour + title + body), five perks. |
| `astrayBar` | `src/content/settings/astray-bar.json` | Section heading, lede, CTA, four perks, "next session" card copy. |
| `bookingForm` | `src/content/settings/booking-form.json` | All field labels, placeholders, region options, sidebar copy, success/error messages. |
| `footer` | `src/content/settings/footer.json` | Logo, brand name + sub-line, description, Explore column, regions line, legal lines. |

Events use a separate **collection** (`src/content/events/*.md`) and are not part of the settings system - that pattern is unchanged.

---

## Standards

### 1. Every field must have a `defaultValue`

Defaults must match the current rendered string exactly. If an editor opens the singleton for the first time, the form should be pre-populated with the live site copy so they can edit in place rather than starting from blank.

```ts
fields.text({ label: 'Tagline', defaultValue: 'Paint · Sip · Geelong' })
```

For arrays, the default value of nested fields covers the "add new item" case in the admin UI.

### 2. JSON files are the source of truth at build time

Defaults in `keystatic.config.ts` are only applied when an editor adds a new field via the UI. The build reads the JSON file directly. **If you add a new field to the schema, you must also add it to the existing JSON file** or components will see `undefined`. Either:

- Edit the JSON file by hand, or
- Open `/keystatic`, save the singleton (Keystatic re-writes the file with all current defaults filled in)

### 3. Components own their typing

Each component declares an inline interface for the data shape it expects, then casts the result of `getEntry`:

```astro
---
import { getEntry } from 'astro:content';

const entry = await getEntry('settings', 'hero');
const data = (entry?.data ?? {}) as {
  eyebrow: string;
  headline: string;
  stats: Array<{ value: string; label: string }>;
};
---
```

The `?? {}` fallback guards against the file being missing during a transient state (e.g. mid-rebuild after a git pull). It is not a substitute for the file actually existing.

### 4. Image storage convention

All CMS-managed images go to `src/assets/settings/`. This mirrors the existing `src/assets/events/` pattern for event covers, which means Astro's `<Image>` component can process them at build time (hashing, format conversion, responsive sizing).

```ts
fields.image({
  label: 'Logo',
  directory: 'src/assets/settings',
  publicPath: '/src/assets/settings/',
  validation: { isRequired: false },
})
```

The `settingsImage()` helper at the top of `keystatic.config.ts` enforces this consistently - prefer it over hand-rolling new `fields.image()` calls.

**Never store CMS-managed images in `public/`.** Files in `public/` are served as-is with no optimisation, no hashing, and no Astro `<Image>` integration. The only image still in `public/` is `favicon.svg` as the Layout's documented fallback.

### 5. Resolving image paths in components

Use `resolveSettingsImage()` from `src/lib/settings-images.ts`. It returns an `ImageMetadata` (or `null` if the path is empty / unknown):

```astro
---
import { Image } from 'astro:assets';
import { resolveSettingsImage } from '../../lib/settings-images';

const logo = await resolveSettingsImage(data.logo);
---
{logo && <Image src={logo} alt={data.brandName} width={108} height={108} />}
```

For URLs in `<meta>` or `<link>` tags (e.g. OG image, favicon), use `getImage()` from `astro:assets` to get the optimised URL string - see `Layout.astro` for the canonical example.

### 6. HTML in text fields

A handful of fields render via `set:html` so editors can keep inline styling:

| Field | Used HTML |
|---|---|
| `hero.headline` | `<br>`, `<span class="gw">`, `<em>` |
| `hero.lede` | plain text |
| `howItWorks.title` | `<br>` |
| `howItWorks.perks[]` | `<b>` |
| `astrayBar.title` | `<br>` |
| `astrayBar.lede` | `<b>` |
| `bookingForm.heading` | `<br>`, `<span class="pink">` |

Keep this list short. New fields should default to plain text rendering. If a field genuinely needs HTML, document the allowed tags in the field's `description` so editors know what they can use.

The CSS for these inline classes lives in the consuming component's scoped `<style>` block under `:global()` selectors (e.g. `h1.hero-title :global(.gw)`) because `set:html` content is not scoped by Astro.

### 7. Don't duplicate the `site` singleton

Email, phone, ABN, Instagram, and Facebook live in `site.json` only. Footer and BookingForm pull these from `site` rather than redeclaring them. If you find yourself adding an `email` or `instagram` field to a new singleton, stop and reuse `site` instead.

### 8. Static visual assets stay hardcoded

Decorative SVGs (squiggles, blobs, ribbons), CSS pseudo-element art, icons in `Icon.astro`, and the placeholder text on empty polaroid slots are **not** CMS-managed. They are part of the design system, not content. Only swap them via a code change.

### 9. Hardcoded fallbacks are intentional

- **Polaroid placeholder text** in `Hero.astro` (`[ photo ]<br>painters at easels...`) - shown only when no image uploaded.
- **Favicon fallback** to `/favicon.svg` in `Layout.astro` - shown when `seo.favicon` is empty.
- **OG meta tags** are omitted entirely when `seo.ogImage` is empty rather than pointing at a missing file.

These fallbacks are documented in `keystatic.config.ts` field descriptions so editors know what happens when they leave a field blank.

---

## Cookbook

### Add a new editable text field to an existing singleton

1. Add the field to `keystatic.config.ts` under the relevant singleton's `schema`:
   ```ts
   newField: fields.text({ label: 'New field', defaultValue: 'Current copy' }),
   ```
2. Add the same key + value to the corresponding JSON file in `src/content/settings/`.
3. Add the field to the inline TypeScript interface in the consuming component.
4. Reference it as `data.newField` in the template.

### Add a new editable image field

1. Add the field using the `settingsImage` helper in `keystatic.config.ts`:
   ```ts
   newImage: settingsImage('New image', 'Optional. Used in the hero.'),
   ```
2. Add the field to the JSON file with `null` (or a path string if there's an initial upload at `src/assets/settings/<file>`).
3. In the component:
   ```astro
   const newImage = await resolveSettingsImage(data.newImage);
   ...
   {newImage && <Image src={newImage} alt="..." width={...} height={...} />}
   ```

### Add a new repeated item type (array of objects)

```ts
items: fields.array(
  fields.object({
    label: fields.text({ label: 'Label' }),
    href: fields.text({ label: 'Href' }),
  }),
  {
    label: 'Items',
    itemLabel: (props) => props.fields.label.value,
  },
),
```

The `itemLabel` callback controls how each item appears in the admin UI's collapsed list. Always provide one, otherwise editors see anonymous "Item 1, Item 2" rows.

### Add a whole new singleton (e.g. for a new section component)

1. **Schema** - add to `keystatic.config.ts` under `singletons:`:
   ```ts
   newSection: singleton({
     label: 'New section',
     path: 'src/content/settings/new-section',
     format: { data: 'json' },
     schema: { ... },
   }),
   ```
   Note: `path` does **not** include `.json` - Keystatic appends the extension based on `format`.
2. **Data** - create `src/content/settings/new-section.json` with all defaults pre-filled.
3. **Component** - call `getEntry('settings', 'new-section')` (kebab-case filename, not the singleton key).

No `content.config.ts` change is needed - the glob loader picks up any `*.json` in `src/content/settings/`.

### Add a select field with predefined options

For things like icon names or accent colours, define the options inline:

```ts
icon: fields.select({
  label: 'Icon',
  options: [
    { label: 'Palette', value: 'palette' },
    { label: 'Easel', value: 'easel' },
    { label: 'Glass', value: 'glass' },
  ],
  defaultValue: 'palette',
}),
```

In the component, map the value to the actual implementation via a registry object:

```astro
const iconPaths: Record<string, string> = {
  palette: `<path .../>`,
  easel: `<path .../>`,
  glass: `<path .../>`,
};
...
<svg set:html={iconPaths[step.icon] ?? iconPaths.palette} />
```

This pattern keeps SVG markup and design-system colour tokens out of the CMS while still letting editors pick from a curated set.

### Pass server-rendered text into a client `<script>` block

The `<script>` block in an Astro component runs in the browser with no access to Astro frontmatter variables. Use `data-*` attributes on the element to bridge:

```astro
<form id="bookForm" data-success={data.successMessage} data-error={data.errorMessage}>
```

```ts
const form = document.getElementById('bookForm') as HTMLFormElement | null;
const successMessage = form?.dataset.success ?? 'Fallback';
```

See `BookingForm.astro` for the canonical example.

---

## Gotchas

- **Singleton key vs entry id.** The Keystatic key (`howItWorks`) is for the admin UI. The Astro entry id (`how-it-works`) is the JSON filename. They are not the same. Always pass the filename slug to `getEntry`.
- **Editor must save once after schema additions.** When you add a new field with a `defaultValue`, the default does not back-fill into existing JSON files automatically. Either edit the JSON by hand or open the singleton in `/keystatic` and hit save - Keystatic will re-write the file with the new field populated.
- **Image fields can be `null` or omitted in JSON.** `resolveSettingsImage` handles both. Components must guard with `{image && <Image .../>}` or render a fallback.
- **`set:html` content is not Astro-scoped.** Styles for HTML rendered via `set:html` must use `:global()` selectors inside the parent component's `<style>` block, or live in `global.css`.
- **Hot reload during dev.** Editing JSON files locally reloads the page automatically via Astro's content layer. Editing `keystatic.config.ts` requires a dev server restart.
- **Build-time only.** Settings JSON is read at build time. After a Keystatic edit, the site must rebuild (Cloudflare Workers Builds does this automatically on git push) before the new content is live.
- **Don't put CMS images in `public/`.** They will not be hashed, optimised, or processed by `<Image>`. Always use `src/assets/settings/` and `resolveSettingsImage`.
