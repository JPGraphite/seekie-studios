import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

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
