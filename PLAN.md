# Seekie Studios — Tech Stack & Launch Plan

## Context

Seekie Studios is a mobile Paint & Sip business (Geelong / Surf Coast / Bellarine, VIC). A high-fidelity HTML prototype already exists (`index.html`) with complete design tokens, layout, and placeholder content. The goal is to migrate this prototype into a production-ready codebase that:

- Is maintainable and componentised
- Lets the client (non-developer) update events, photos, and copy
- Deploys to **Cloudflare Pages** (free, global CDN)
- Wires up the form, social feed, and Humanitix ticket links

> **Domain:** registered at Synergy Wholesale — DNS will be delegated to Cloudflare nameservers (see DNS Migration below). Synergy Wholesale is kept as the registrar only.

---

## Recommended Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| **Framework** | **Astro** (hybrid output) | Ships near-zero JS for static pages; server routes handle the CMS admin and contact API; easy to migrate from existing HTML |
| **Adapter** | **@astrojs/cloudflare** | Required for Keystatic and the contact API Pages Function; targets Cloudflare's `workerd` runtime |
| **Styling** | **Tailwind CSS** | Maps cleanly onto existing CSS custom properties; utility classes speed up component authoring; purges unused CSS at build time |
| **CMS** | **Keystatic** (git-based, Astro-native) | Zero cost (free for up to 3 collaborators); first-class Astro integration; authenticates via GitHub App through Keystatic Cloud — no OAuth proxy needed; content stored as Markdown/YAML in the repo |
| **Forms** | **Cloudflare Pages Function + Email Routing** | Native Cloudflare — no third-party service; `send_email` binding sends via Cloudflare's own infrastructure; completely free |
| **Social Feed** | **TBD — deferred** | Behold.so is the leading candidate but pending further library review before committing |
| **Events** | **Humanitix embed / links** | Already planned in the prototype; use their iframe embed or ticket URL per event |
| **CI/CD** | **Cloudflare Workers Builds** | Connect GitHub repo in the Cloudflare dashboard; auto-builds and deploys on every push to `main` via `npx wrangler deploy` — no SSH, no Actions workflow needed |
| **CMS deploy trigger** | **Keystatic → Git commit → Workers Build** | When client saves in the Keystatic admin UI, it commits to GitHub automatically, triggering the Workers build pipeline |

---

## Architecture Overview

```
Keystatic /keystatic UI (client edits content)
       │ commits Markdown/YAML to GitHub via GitHub App (auth by Keystatic Cloud)
       ▼
Cloudflare Workers Builds CI (triggered automatically on push to main)
  └─ npx astro build && npx wrangler deploy → deploys to global edge
       │
       ▼
Cloudflare Workers (hybrid output — @astrojs/cloudflare adapter)
  ├─ static assets         (HTML/CSS/JS — served from Workers Assets)
  ├─ /keystatic/*          (Worker route — Keystatic admin + API routes)
  └─ /api/contact          (Worker route → Cloudflare Email Routing → client inbox)
```

---

## DNS Migration — Synergy Wholesale → Cloudflare

The domain stays **registered** at Synergy Wholesale but DNS is **delegated** to Cloudflare. This is a one-time setup.

### Steps

1. **Add domain to Cloudflare** (free plan)
   - Log into Cloudflare → Add a site → enter the domain → choose Free plan
   - Cloudflare scans existing DNS records and imports them
   - Cloudflare assigns two nameservers (e.g. `aria.ns.cloudflare.com`, `bob.ns.cloudflare.com`)

2. **Update nameservers at Synergy Wholesale**
   - Log into Synergy Wholesale client portal → Domains → Manage → Nameservers
   - Replace the existing nameservers with the two Cloudflare assigned ones
   - Save — propagation takes up to 24–48h (usually under 2h)

3. **Verify in Cloudflare dashboard**
   - Cloudflare will email when the nameserver change is confirmed
   - Status changes from "Pending" to "Active"

4. **Cloudflare Workers custom domain**
   - In the Worker → Settings → Domains & Routes → Add custom domain
   - Cloudflare auto-creates the required DNS record (CNAME to the Worker)

5. **Email Routing setup** (for the contact form — see Form Handling below)
   - Cloudflare dashboard → Email → Email Routing → Enable
   - Add a forwarding address (e.g. `contact@seekiestudios.com.au` → `seekie.studios@gmail.com`)
   - Verify the destination address via the confirmation email

> Synergy Wholesale is kept as the registrar only. All DNS, hosting, and email routing is managed in Cloudflare.

---

## Implementation Plan

### ✅ Phase 1 — Project scaffold
- Astro 6 + `@astrojs/tailwind` installed; `astro build` passes clean
- Design tokens from `index.html` in `tailwind.config.mjs` (`grape`, `plum`, `lavender`, `cream`, `pink`, `orange`, `lemon`, `mint`, `ink`)
- Google Fonts (`Bagel Fat One`, `Caprasimo`, `DM Sans`, `Caveat`) in `src/layouts/Layout.astro`
- Global CSS at `src/styles/global.css` — paper grain, ticker animation, float, reveal-on-scroll
- Content collection config at `src/content.config.ts` (Astro 6 glob loader format)
- Assets copied to `public/assets/`
- ~~Decap CMS scaffolded at `public/admin/`~~ — replaced by Keystatic (Phase 3)

### ✅ Phase 2 — Component migration

#### Primitive components (`src/components/ui/`) — all built

| Component | What was built |
|---|---|
| `Button.astro` | `variant`: `primary` \| `secondary` \| `nav` \| `submit`; `size`: `sm` \| `md` \| `lg`; renders `<a>` or `<button>` |
| `SectionHeading.astro` | `tag`, `title` (HTML), `subtitle`; `align`: `split` \| `left` \| `center`; `tagColor` / `titleColor` overrides |
| `FormField.astro` | `type`: text/email/tel/number/date/textarea/select; label, error state |
| `Icon.astro` | SVG lookup by `name`: `instagram` \| `facebook` \| `email` \| `location` \| `clock` |

#### Section components (`src/components/sections/`) — all built

| Component | Notes |
|---|---|
| `Nav.astro` | Sticky blur nav, logo, `<Button variant="nav">` |
| `Hero.astro` | 2-col grid, stats, polaroid card stack with float animations |
| `Ticker.astro` | Infinite marquee, items array-driven |
| `HowItWorks.astro` | 3-step feature grid + checklist, uses `<SectionHeading>` |
| `Events.astro` | Driven by `astro:content` collection; sorts by `order`; per-variant blob patterns |
| `AstrayBar.astro` | Dark grape section, perks grid, `<AstrayBar>` card |
| `SocialFeed.astro` | Static placeholder grid; feed tab toggle wired; comment marks embed location |
| `BookingForm.astro` | `<FormField>` primitives, honeypot field, `fetch /api/contact`, inline success/error |
| `Footer.astro` | `<Icon>` socials, nav links, legal line |

**Content:** 3 placeholder events in `src/content/events/` (cat-under-the-moon, bells-beach-sunset, bellarine-bloom)

**Form fields built:** name, group size, email, date, region (select), theme/vibe (textarea)

### ✅ Phase 3 — Keystatic CMS setup

Keystatic is the chosen CMS. It requires server-side rendering (for its admin routes and API), so the `@astrojs/cloudflare` adapter must be installed first. Content stays git-based (Markdown/YAML in the repo); the client edits via a clean UI at `/keystatic`.

#### Step 1 — Install adapter + Keystatic packages

```bash
npx astro add cloudflare
npx astro add react markdoc
npm install @keystatic/core @keystatic/astro
```

Update `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'hybrid',          // static by default; server where needed
  adapter: cloudflare(),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    react(),
    markdoc(),
    keystatic(),
  ],
  site: 'https://seekiestudios.com.au',
});
```

#### Step 2 — Create `keystatic.config.ts`

Define the `events` and `settings` collections to match the existing content schema:

```ts
import { config, collection, singleton, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: { owner: 'JPGraphite', name: 'seekie-studios' },
  },
  collections: {
    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'src/content/events/*',
      format: { contentField: 'description' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Date' }),
        location: fields.text({ label: 'Location' }),
        region: fields.select({
          label: 'Region',
          options: [
            { label: 'Geelong', value: 'geelong' },
            { label: 'Surf Coast', value: 'surf-coast' },
            { label: 'Bellarine', value: 'bellarine' },
          ],
          defaultValue: 'geelong',
        }),
        ticketUrl: fields.url({ label: 'Humanitix ticket URL' }),
        order: fields.integer({ label: 'Display order' }),
        description: fields.markdoc({ label: 'Description' }),
      },
    }),
  },
  singletons: {
    settings: singleton({
      label: 'Site settings',
      path: 'src/content/settings/site',
      schema: {
        siteName: fields.text({ label: 'Site name' }),
        contactEmail: fields.text({ label: 'Contact email' }),
        instagramUrl: fields.url({ label: 'Instagram URL' }),
        facebookUrl: fields.url({ label: 'Facebook URL' }),
      },
    }),
  },
});
```

#### Step 3 — Add Keystatic route pages

Keystatic needs two catch-all route files:

**`src/pages/keystatic/[...params].astro`**
```astro
---
export { getStaticPaths } from '@keystatic/astro/route'
import { makePage } from '@keystatic/astro/ui'
import keystaticConfig from '../../../keystatic.config'
const Page = makePage(keystaticConfig)
---
<Page />
```

**`src/pages/api/keystatic/[...params].ts`**
```ts
import { makeHandler } from '@keystatic/astro/api'
import keystaticConfig from '../../../keystatic.config'
export const all = makeHandler({ config: keystaticConfig })
```

#### Step 4 — GitHub App + Keystatic Cloud (production auth)

Keystatic Cloud handles the GitHub OAuth flow — no proxy Worker needed.

1. Push the project to GitHub and deploy once to Cloudflare Pages
2. Visit `https://seekiestudios.com.au/keystatic` → click **"Connect to GitHub"**
3. Follow the wizard: it creates a GitHub App on your account and generates credentials
4. Add the generated env vars to the Cloudflare Pages project settings:

| Variable | Where |
|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | Cloudflare Pages → Settings → Environment variables |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Cloudflare Pages → Settings → Environment variables |
| `KEYSTATIC_SECRET` | Cloudflare Pages → Settings → Environment variables |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Cloudflare Pages → Settings → Environment variables |

5. Invite the client as a **GitHub collaborator** with write access on the repo — that's all the permission model Keystatic uses
6. Verify: client logs into `/keystatic`, publishes a new event → commit appears in GitHub → Cloudflare Pages rebuilds (~1–2 min)

#### Remove Decap artefacts
- Delete `public/admin/` (Decap config + index)

### ✅ Phase 4 — CI/CD pipeline
Cloudflare Workers Builds handles this natively — no GitHub Actions workflow or SSH keys needed.

**Setup steps:**
1. Cloudflare dashboard → Workers & Pages → Create → Workers → Connect to Git → select the GitHub repo
2. Set build settings:
   - Build command: `npm run build && npx wrangler deploy`
   - (Workers Builds runs `wrangler deploy` automatically if a `wrangler.jsonc` is present — confirm in dashboard)
3. Add all environment variables in the Worker settings (Keystatic vars from Phase 3 + contact API vars from Phase 5)
4. Push to `main` — Cloudflare builds and deploys automatically
5. Add custom domain: Worker → Settings → Domains & Routes → Add custom domain

> The `.github/workflows/deploy.yml` SSH workflow is no longer needed and can be deleted.

### ✅ Phase 5 — Production wiring
- **Contact API:** replace `server/` with a Pages Function at `src/pages/api/contact.ts` — see Form Handling below
- **`wrangler.jsonc`:** (new Cloudflare config format) Workers config — includes static assets dir and `send_email` binding:
  ```jsonc
  {
    "name": "seekie-studios",
    "compatibility_date": "2025-01-01",
    "main": "./dist/_worker.js",
    "assets": { "directory": "./dist" },
    "send_email": [
      { "name": "EMAIL", "destination_address": "seekie.studios@gmail.com" }
    ]
  }
  ```
- **OG tags:** `og:title`, `og:description`, `og:image`, `og:url`, Twitter card added to `Layout.astro` ✅
- **Favicon:** `public/favicon.svg` created (placeholder — replace with final brand asset) ✅
- **Sitemap:** `@astrojs/sitemap` integrated; `sitemap-index.xml` generated at build ✅
- **Social feed:** wire up once library chosen (Behold.so is leading candidate)
- **Humanitix:** swap `ticketUrl: "#"` in each event markdown with real ticket URLs

> `server/contact.js`, `server/index.js`, and `ecosystem.config.cjs` are no longer needed and can be deleted.

---

## Form Handling — Cloudflare Pages Function + Email Routing

**Approach:** A Cloudflare Pages Function at `src/pages/api/contact.ts` handles `POST /api/contact`. It validates the body, checks the honeypot, and sends the enquiry email via the `send_email` binding — Cloudflare's own email infrastructure, completely free.

**`wrangler.toml` addition:**
```toml
[[send_email]]
name = "EMAIL"
destination_address = "seekie.studios@gmail.com"
```

**Pages Function skeleton:**
```ts
// src/pages/api/contact.ts
import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

export async function onRequestPost({ request, env }) {
  const body = await request.json();

  // honeypot
  if (body.website) return new Response(null, { status: 400 });

  const msg = createMimeMessage();
  msg.setSender({ name: "Seekie Studios Website", addr: "contact@seekiestudios.com.au" });
  msg.setRecipient("seekie.studios@gmail.com");
  msg.setSubject(`New Enquiry — ${body.name}`);
  msg.addMessage({ contentType: "text/plain", data: formatBody(body) });

  const message = new EmailMessage(
    "contact@seekiestudios.com.au",
    "seekie.studios@gmail.com",
    msg.asRaw()
  );

  await env.EMAIL.send(message);
  return Response.json({ ok: true });
}
```

**Dependencies:** `mimetext` (npm) — small, maintained; needed to construct the raw MIME message the binding requires.

**Form fields (built):**
- Name (text, required)
- Group size (number, required)
- Email (email, required)
- Date (date, required)
- Region (select: Geelong / Surf Coast / Bellarine / Other, required)
- Theme / vibe (textarea, optional)

**Validation:** server-side only (client hints via `required`/`type` are a UX aid, not security). Sanitise all inputs before constructing the email body.

### Spam protection — layered approach

**Layer 1 — Honeypot field (zero cost, zero friction)**
Hidden `<input name="website" tabindex="-1" autocomplete="off">` in the form. Bots fill every field; humans never see it. Function rejects any submission where this field is non-empty.

**Layer 2 — Cloudflare rate limiting**
Cloudflare's free plan includes basic rate limiting at the edge — no configuration needed. For stricter limits, add a Cloudflare Rate Limiting rule in the dashboard (free tier: 1 rule).

**What this covers:**
| Threat | Layer that stops it |
|---|---|
| Dumb form-filling bots | Honeypot |
| Repeated submissions | Cloudflare edge rate limiting |
| Spam from real humans | Rate limiting (partial) |

**Post-launch option:** Add **Cloudflare Turnstile** (free, auto-solves for most users) as a third layer — the Pages Function just needs a `siteverify` fetch added before processing.

---

## Key Files

| File | Role |
|---|---|
| `index.html` | Original prototype — reference for design only, no longer the source of truth |
| `astro.config.mjs` | Astro config — must include `cloudflare()` adapter, `react()`, `markdoc()`, `keystatic()` |
| `keystatic.config.ts` | Keystatic collection + singleton schema |
| `src/content.config.ts` | Astro 6 content collection schema (events) |
| `src/content/events/*.md` | Placeholder events — edit or replace via Keystatic `/keystatic` |
| `src/pages/keystatic/[...params].astro` | Keystatic admin UI route |
| `src/pages/api/keystatic/[...params].ts` | Keystatic API handler route |
| `tailwind.config.mjs` | All design tokens as Tailwind theme values |
| `src/styles/global.css` | Base styles, animations, reveal classes |
| `src/pages/api/contact.ts` | Cloudflare Pages Function — contact form handler |
| `wrangler.jsonc` | Cloudflare Pages config — `send_email` binding |
| `README.md` | Full design spec, component states, motion system |

**Files to delete:**
- `public/admin/` — Decap CMS artefact, replaced by Keystatic
- `server/contact.js`, `server/index.js`, `ecosystem.config.cjs` — cPanel artefacts
- `.github/workflows/deploy.yml` — SSH deploy workflow, replaced by Cloudflare Pages Git integration

---

## Production TODOs Checklist

### Content
- [ ] Real photography for all placeholder blocks (hero polaroids, event covers, what-we-do image)
- [ ] Humanitix ticket URLs in `src/content/events/*.md`
- [ ] ABN in `Footer.astro` (line `ABN xx xxx xxx xxx`)
- [ ] Confirm contact email — currently `seekie.studios@gmail.com` throughout

### Infrastructure
- [ ] DNS migration — update nameservers at Synergy Wholesale to Cloudflare's (see DNS Migration above)
- [ ] Cloudflare Workers — connect GitHub repo via Workers Builds, set build command + confirm `wrangler.jsonc`
- [ ] Cloudflare Email Routing — enable, add forwarding rule, verify destination address
- [x] Phase 3: install `@astrojs/cloudflare` + Keystatic packages; `keystatic.config.ts` created; `public/admin/` deleted
- [ ] Phase 3: set up GitHub App via Keystatic Cloud wizard; add 4 env vars to Cloudflare Worker settings
- [x] Phase 5: `src/pages/api/contact.ts` + `wrangler.jsonc` with `send_email` binding; `server/` deleted

### Launch checklist
- [x] Favicon — `public/favicon.svg` (placeholder; replace with final brand asset)
- [x] OG tags + `<meta og:image>` in `Layout.astro`
- [ ] OG image file — create `public/og-image.jpg` at `1200×630` with brand design
- [x] `@astrojs/sitemap` integration
- [ ] Social feed — choose library (Behold.so), wire into `SocialFeed.astro`
- [ ] Google Analytics or Plausible snippet in `Layout.astro`
- [ ] Lighthouse audit — target ≥ 90 Performance, 100 SEO on mobile

---

## Verification

| Check | Status |
|---|---|
| `astro build` completes with no errors | ✅ passing (will change output shape once adapter is added) |
| `dist/` contains Worker bundle + static assets | ⏳ after Phase 3 adapter install |
| `dist/sitemap-index.xml` generated | ✅ confirmed |
| Nameservers updated at Synergy Wholesale → Cloudflare Active | ⏳ DNS migration |
| Cloudflare Workers connected to GitHub (Workers Builds) → auto-deploy on push | ⏳ Phase 4 |
| Custom domain live on Cloudflare Workers | ⏳ Phase 4 |
| Submit enquiry form → email in client inbox | ⏳ Phase 5 |
| Keystatic `/keystatic` → commit → rebuild → event live in ~2 min | ⏳ Phase 3 |
| Social feed renders correctly | ⏳ deferred |
| Lighthouse ≥ 90 Performance, 100 SEO on mobile | ⏳ pre-launch |
