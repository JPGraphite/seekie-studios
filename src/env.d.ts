/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types" />

interface ContactRateLimit {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
}

type Runtime = import('@astrojs/cloudflare').Runtime<{
  EMAIL: SendEmail;
  CONTACT_RATE_LIMIT: ContactRateLimit;
  TURNSTILE_SECRET_KEY?: string;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
