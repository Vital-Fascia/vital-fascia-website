/**
 * Cloudflare Worker in front of the static site. It only handles POST /api/discovery-call,
 * /api/contact and /api/waitlist; everything else is served straight from the static assets
 * (see wrangler.jsonc).
 *
 * On a valid request it sends two emails through Resend (https://resend.com):
 *   1. a notification to Alex with the person's details
 *   2. a branded confirmation to the person (wording is editable in the CMS)
 * The wording and HTML of the emails live in ./emails.ts. Setup and ownership notes: docs/client-guide.md
 */

import { FORMS, clientEmail, ownerEmail } from './emails';
import type { EmailContent, FormType } from './emails';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  RESEND_API_KEY?: string; // secret
  MAIL_FROM: string; // e.g. "Vital Fascia <bookings@vitalfascia.com.au>"
  NOTIFY_TO: string; // where Alex's notifications go
  MAIL_DRY_RUN?: string; // "true" = log emails instead of sending (local testing only)
  // TEST MODE (secrets, set only while testing): when MAIL_TEST_TO is set, EVERY email is sent to that one address
  // instead of the real recipient, from the Resend test sender (works before the domain is verified).
  MAIL_TEST_TO?: string;
  MAIL_TEST_FROM?: string; // optional; defaults to Resend's onboarding@resend.dev sender
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

/** In test mode, redirect to the test address and say who it would really have gone to. */
function envelope(env: Env, msg: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  if (!env.MAIL_TEST_TO) return { from: env.MAIL_FROM, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text, reply_to: msg.replyTo };
  const note = `TEST MODE: this would have gone to ${msg.to}`;
  return {
    from: env.MAIL_TEST_FROM || 'Vital Fascia <onboarding@resend.dev>',
    to: [env.MAIL_TEST_TO],
    subject: `[TEST for ${msg.to}] ${msg.subject}`,
    html: `<p style="font-family:sans-serif;background:#fff3cd;padding:8px 12px;margin:0">${note}</p>${msg.html}`,
    text: `${note}\n\n${msg.text}`,
    reply_to: msg.replyTo,
  };
}

async function send(env: Env, msg: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  if (env.MAIL_DRY_RUN === 'true') {
    console.log(`[dry run] to=${msg.to} subject=${msg.subject}\n${msg.text}\n`);
    return;
  }
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope(env, msg)),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function handleForm(f: FormType, request: Request, env: Env): Promise<Response> {
  // only accept posts from this site
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'forbidden' }, 403);

  const form = await request.formData();
  if (String(form.get('website') ?? '') !== '') return json({ ok: true }); // honeypot: bots fill this in; pretend success

  const d: Record<string, string> = {};
  for (const fld of f.fields) {
    const v = String(form.get(fld.formName) ?? '').trim().slice(0, fld.max);
    if (!v && !fld.required) continue;
    const ok =
      fld.kind === 'email' ? /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v)
      : fld.kind === 'phone' ? /^[+\d][\d\s()+-]{5,}$/.test(v)
      : v.length > 0;
    if (!ok) return json({ error: 'invalid' }, 400);
    d[fld.key] = v;
  }

  const contentRes = await env.ASSETS.fetch(new Request(new URL('/email-content.json', request.url)));
  const content = (await contentRes.json()) as EmailContent;
  const when = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'full', timeStyle: 'short' });

  try {
    const owner = ownerEmail(f, content.businessName, d, when);
    await send(env, { to: env.NOTIFY_TO, subject: f.ownerSubject(d.name), html: owner.html, text: owner.text, replyTo: d.email });
    // the confirmation is secondary: if it fails, Alex still has the details
    const copy = content[f.copy];
    const client = clientEmail(copy, content.businessName, d.name.split(' ')[0]);
    await send(env, { to: d.email, subject: copy.subject, html: client.html, text: client.text, replyTo: env.NOTIFY_TO }).catch((e) => console.error('confirmation failed', e));
  } catch (e) {
    console.error('notification failed', e);
    return json({ error: 'send-failed' }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    const form = FORMS[pathname];
    if (form) {
      if (request.method !== 'POST') return json({ error: 'method' }, 405);
      return handleForm(form, request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
