export const prerender = false;

import type { APIRoute } from 'astro';
import { createMimeMessage } from 'mimetext';

const REGION_LABELS: Record<string, string> = {
  geelong: 'Geelong',
  'surf-coast': 'Surf Coast',
  bellarine: 'Bellarine',
  other: 'Other',
};

function sanitise(value: unknown): string {
  return String(value ?? '')
    .replace(/[<>"'`]/g, '')
    .trim()
    .slice(0, 500);
}

export const POST: APIRoute = async ({ request, locals }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot — bots fill this field, humans never see it
  if (body.website) return Response.json({ ok: true });

  const name = sanitise(body.name);
  const groupSize = sanitise(body.group_size ?? body.groupSize);
  const email = sanitise(body.email);
  const date = sanitise(body.date);
  const region = sanitise(body.region);
  const theme = sanitise(body.theme ?? body.vibe);

  if (!name || !groupSize || !email || !date || !region) {
    return Response.json({ error: 'Please fill in all required fields.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  const bodyText = [
    'New booking enquiry from Seekie Studios website',
    '',
    `Name:        ${name}`,
    `Group size:  ${groupSize}`,
    `Email:       ${email}`,
    `Date:        ${date}`,
    `Region:      ${REGION_LABELS[region] ?? region}`,
    `Theme/vibe:  ${theme || '(not provided)'}`,
  ].join('\n');

  try {
    const env = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime?.env ?? {};
    const EMAIL = env.EMAIL as { send: (msg: unknown) => Promise<void> } | undefined;

    if (EMAIL) {
      const msg = createMimeMessage();
      msg.setSender({ name: 'Seekie Studios Website', addr: 'contact@seekiestudios.com.au' });
      msg.setRecipient('seekie.studios@gmail.com');
      msg.setSubject(`Booking enquiry — ${name} (${groupSize} people)`);
      msg.addMessage({ contentType: 'text/plain', data: bodyText });

      const { EmailMessage } = await import('cloudflare:email' as string);
      const message = new (EmailMessage as new (from: string, to: string, raw: string) => unknown)(
        'contact@seekiestudios.com.au',
        'seekie.studios@gmail.com',
        msg.asRaw(),
      );

      await EMAIL.send(message);
    } else {
      // Dev fallback — log to console
      console.log('[contact form]', bodyText);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
};
