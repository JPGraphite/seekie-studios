import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Mirror wrangler.jsonc `vars` into process.env so Astro/Vite picks up
// PUBLIC_* values at build time. Keeps wrangler.jsonc as the single
// source of truth for non-secret config across runtime AND build.
try {
  const wranglerPath = fileURLToPath(new URL('./wrangler.jsonc', import.meta.url));
  const raw = readFileSync(wranglerPath, 'utf8');
  const stripped = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,(\s*[}\]])/g, '$1');
  const config = JSON.parse(stripped);
  for (const [key, value] of Object.entries(config.vars ?? {})) {
    if (process.env[key] === undefined) {
      process.env[key] = String(value);
    }
  }
} catch (err) {
  console.warn('[astro.config] Could not load vars from wrangler.jsonc:', err);
}

export default defineConfig({
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
