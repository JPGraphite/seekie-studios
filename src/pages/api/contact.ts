export const prerender = false;

import type { APIRoute } from 'astro';
import { createMimeMessage } from 'mimetext';
import { EmailMessage } from 'cloudflare:email';

const REGION_LABELS: Record<string, string> = {
  geelong: 'Geelong',
  'surf-coast': 'Surf Coast',
  bellarine: 'Bellarine',
  other: 'Other',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ALLOWED_ORIGINS = [
  'https://seekiestudios.com.au',
  'https://www.seekiestudios.com.au',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
];

// Per-field caps. Theme/notes are deliberately generous - real briefs can be long.
const FIELD_LIMITS = {
  name: 100,
  group_size: 6,
  email: 254,
  date: 10,
  region: 32,
  theme: 5000,
  notes: 5000,
} as const;

// Total request body cap. Comfortably above the sum of FIELD_LIMITS to allow
// for JSON overhead, the Turnstile token, and other form fields.
const MAX_BODY_BYTES = 24_000;

function clean(value: unknown, max: number): string {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);
}

function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, y, m, d] = match;
  const monthIdx = parseInt(m, 10) - 1;
  if (monthIdx < 0 || monthIdx > 11) return value;
  return `${parseInt(d, 10)} ${MONTHS[monthIdx]} ${y}`;
}

function isValidIsoDate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !isNaN(date.getTime());
}

async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string,
): Promise<{ success: boolean; errorCodes: string[] }> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    return {
      success: data.success === true,
      errorCodes: data['error-codes'] ?? [],
    };
  } catch (err) {
    return { success: false, errorCodes: [`fetch-failed:${String(err)}`] };
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime?.env ?? {};
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  // 1. Origin / Referer check - blocks scripted POSTs from outside the site.
  const origin = request.headers.get('origin') ?? '';
  const referer = request.headers.get('referer') ?? '';
  const originOk =
    ALLOWED_ORIGINS.some(a => origin === a || referer.startsWith(a + '/')) ||
    (!origin && !referer && import.meta.env.DEV);

  if (!originOk) {
    return Response.json({ error: 'Forbidden.' }, { status: 403 });
  }

  // 2. Body size cap before parsing.
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: 'Payload too large.' }, { status: 413 });
  }

  // 3. Per-IP rate limit at the edge.
  const rateLimit = env.CONTACT_RATE_LIMIT as
    | { limit: (opts: { key: string }) => Promise<{ success: boolean }> }
    | undefined;
  if (rateLimit) {
    const { success } = await rateLimit.limit({ key: ip });
    if (!success) {
      return Response.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429 },
      );
    }
  }

  // 4. Parse body.
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // 5. Honeypot - silent accept so bots don't learn.
  if (body.website) return Response.json({ ok: true });

  // 6. Turnstile verification - skipped only when no secret is configured (dev).
  const turnstileSecret = env.TURNSTILE_SECRET_KEY as string | undefined;
  if (turnstileSecret) {
    const token = String(body['cf-turnstile-response'] ?? '');
    if (!token) {
      console.warn('[contact] Turnstile token missing from submission');
      return Response.json(
        { error: 'Please complete the verification challenge before submitting.' },
        { status: 400 },
      );
    }
    const verdict = await verifyTurnstile(token, turnstileSecret, ip);
    if (!verdict.success) {
      console.warn('[contact] Turnstile verify failed', { errorCodes: verdict.errorCodes, ip });
      return Response.json(
        { error: 'Verification failed. Please refresh and try again.' },
        { status: 400 },
      );
    }
  }

  // 7. Sanitise + validate.
  const name = clean(body.name, FIELD_LIMITS.name);
  const groupSizeRaw = clean(body.group_size ?? body.groupSize, FIELD_LIMITS.group_size);
  const email = clean(body.email, FIELD_LIMITS.email);
  const date = clean(body.date, FIELD_LIMITS.date);
  const region = clean(body.region, FIELD_LIMITS.region);
  const theme = clean(body.theme ?? body.vibe ?? body.message, FIELD_LIMITS.theme);
  const notes = clean(body.notes, FIELD_LIMITS.notes);

  if (!name || !groupSizeRaw || !email || !date || !region) {
    return Response.json({ error: 'Please fill in all required fields.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  if (!isValidIsoDate(date)) {
    return Response.json({ error: 'Invalid date.' }, { status: 400 });
  }

  const groupSize = parseInt(groupSizeRaw, 10);
  if (!Number.isFinite(groupSize) || groupSize < 1 || groupSize > 200) {
    return Response.json({ error: 'Group size must be between 1 and 200.' }, { status: 400 });
  }

  if (!REGION_LABELS[region]) {
    return Response.json({ error: 'Invalid region.' }, { status: 400 });
  }

  const formattedDate = formatDate(date);
  const userAgent = request.headers.get('user-agent') ?? 'unknown';

  const replyMailto =
    `mailto:${email}` +
    `?subject=${encodeURIComponent('Re: Your paint date enquiry ✿')}` +
    `&body=${encodeURIComponent(`Hi ${name},\n\nThanks so much for reaching out about your paint date - `)}`;

  const bodyText = [
    'New booking enquiry from Seekie Studios website',
    '',
    `Name:        ${name}`,
    `Group size:  ${groupSize}`,
    `Email:       ${email}`,
    `Date:        ${formattedDate}`,
    `Region:      ${REGION_LABELS[region] ?? region}`,
    `Theme/vibe:  ${theme || '(not provided)'}`,
    `Notes:       ${notes || '(not provided)'}`,
    '',
    `Reply to ${name}: ${replyMailto}`,
    '',
    '- Submission metadata -',
    `IP:          ${ip}`,
    `User-Agent:  ${userAgent}`,
  ].join('\n');

  try {
    const EMAIL = env.EMAIL as { send: (msg: unknown) => Promise<void> } | undefined;

    if (EMAIL) {
      const msg = createMimeMessage();
      msg.setSender({ name: 'Seekie Studios Bookings', addr: 'bookings@seekiestudios.com.au' });
      msg.setRecipient('seekie.studios@gmail.com');
      msg.setRecipient({ name, addr: email }, { type: 'Reply-To' });
      msg.setSubject(`Enquiry - ${name} wants in on a paint date (${formattedDate}) ✿`);
      msg.addMessage({ contentType: 'text/plain', data: bodyText });

      const message = new EmailMessage(
        'bookings@seekiestudios.com.au',
        'seekie.studios@gmail.com',
        msg.asRaw(),
      );

      await EMAIL.send(message);
    } else {
      console.log('[contact form]', bodyText);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
};
