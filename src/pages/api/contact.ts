export const prerender = false;

import type { APIRoute } from 'astro';
import { createMimeMessage, Mailbox } from 'mimetext';
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

// Strip everything that can't appear unescaped in an RFC 5322 display-name:
// non-printable ASCII, accents/diacritics, and the "specials" set.
// The original (international) name is preserved in the email body.
function headerSafeName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[()<>[\]:;@\\,"`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 64);
}

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtmlBody(opts: {
  name: string;
  groupSize: number;
  email: string;
  formattedDate: string;
  regionLabel: string;
  theme: string;
  notes: string;
  replyMailto: string;
}): string {
  const { name, groupSize, email, formattedDate, regionLabel, theme, notes, replyMailto } = opts;
  const themeHtml = escapeHtml(theme || '(not provided)').replace(/\n/g, '<br>');
  const notesHtml = escapeHtml(notes || '(not provided)').replace(/\n/g, '<br>');
  const labelStyle = 'padding:4px 12px 4px 0;color:#555;white-space:nowrap;vertical-align:top;';
  const valueStyle = 'padding:4px 0;color:#1a1a1a;vertical-align:top;';

  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;line-height:1.5;font-size:14px;">
<p style="margin:0 0 16px;">New booking enquiry from Seekie Studios website</p>
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr><td style="${labelStyle}"><strong>Name</strong></td><td style="${valueStyle}">${escapeHtml(name)}</td></tr>
  <tr><td style="${labelStyle}"><strong>Group size</strong></td><td style="${valueStyle}">${groupSize}</td></tr>
  <tr><td style="${labelStyle}"><strong>Email</strong></td><td style="${valueStyle}"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
  <tr><td style="${labelStyle}"><strong>Date</strong></td><td style="${valueStyle}">${escapeHtml(formattedDate)}</td></tr>
  <tr><td style="${labelStyle}"><strong>Region</strong></td><td style="${valueStyle}">${escapeHtml(regionLabel)}</td></tr>
  <tr><td style="${labelStyle}"><strong>Theme/vibe</strong></td><td style="${valueStyle}">${themeHtml}</td></tr>
  <tr><td style="${labelStyle}"><strong>Notes</strong></td><td style="${valueStyle}">${notesHtml}</td></tr>
</table>
<p style="margin:20px 0 0;"><a href="${escapeHtml(replyMailto)}" style="display:inline-block;padding:8px 16px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">Reply to ${escapeHtml(name)}</a></p>
</body></html>`;
}

async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string,
): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
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
      return Response.json(
        { error: 'Please complete the verification challenge before submitting.' },
        { status: 400 },
      );
    }
    if (!(await verifyTurnstile(token, turnstileSecret, ip))) {
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

  if (!EMAIL_RE.test(email)) {
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
  ].join('\n');

  const regionLabel = REGION_LABELS[region] ?? region;
  const bodyHtml = buildHtmlBody({
    name,
    groupSize,
    email,
    formattedDate,
    regionLabel,
    theme,
    notes,
    replyMailto,
  });

  try {
    const EMAIL = env.EMAIL as { send: (msg: unknown) => Promise<void> } | undefined;

    if (EMAIL) {
      const safeName = headerSafeName(name);
      const safeSubjectName = safeName || 'a guest';

      // mimetext bug: setRecipient(..., {type:'Reply-To'}) sets a Mailbox[]
      // but the Reply-To validator requires a single Mailbox. Construct it
      // ourselves and pass directly to setHeader.
      const replyToMailbox = safeName
        ? new Mailbox({ name: safeName, addr: email })
        : new Mailbox(email);

      const msg = createMimeMessage();
      msg.setSender({ name: 'Seekie Studios Bookings', addr: 'bookings@seekiestudios.com.au' });
      msg.setRecipient('seekie.studios@gmail.com');
      msg.setHeader('Reply-To', replyToMailbox);
      msg.setSubject(`Enquiry - ${safeSubjectName} wants in on a paint date (${formattedDate}) ✿`);
      msg.addMessage({ contentType: 'text/plain', data: bodyText });
      msg.addMessage({ contentType: 'text/html', data: bodyHtml });

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
