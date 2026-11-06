/**
 * Cloudflare Worker in front of the static site. It only handles POST /api/discovery-call;
 * everything else is served straight from the static assets (see wrangler.jsonc).
 *
 * On a valid request it sends two emails through Resend (https://resend.com):
 *   1. a notification to Alex with the client's details
 *   2. a branded confirmation to the client
 * Setup and ownership notes: docs/how-the-forms-work.md
 */

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  RESEND_API_KEY?: string; // secret
  MAIL_FROM: string; // e.g. "Vital Fascia <bookings@vitalfascia.com.au>"
  NOTIFY_TO: string; // where Alex's notifications go
  MAIL_DRY_RUN?: string; // "true" = log emails instead of sending (local testing only)
}

interface EmailCopy {
  subject: string;
  preheader: string;
  greeting: string;
  intro: string;
  stepsHeading: string;
  steps: string[];
  outro: string;
  signOff: string;
  signature: string;
  businessName: string;
  ownerEmail: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Email colours mirror src/styles/tokens.css (CSS variables don't work inside email clients).
const C = { bone: '#f5f1e7', sand: '#eae1cd', olive: '#4a5240', oliveDark: '#3a4033', ink: '#241f1a', muted: '#5c5548', cream: '#f2ecdd', line: '#d8cfba' };
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function shell(preheader: string, businessName: string, inner: string) {
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:${C.bone};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bone};"><tr><td align="center" style="padding:28px 14px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${C.line};">
<tr><td style="background:${C.olive};padding:26px 32px;font-family:${SERIF};font-size:26px;color:${C.cream};letter-spacing:.01em;">${esc(businessName)}</td></tr>
<tr><td style="padding:34px 32px 30px;font-family:${SANS};font-size:16px;line-height:1.65;color:${C.ink};">${inner}</td></tr>
<tr><td style="background:${C.sand};padding:18px 32px;font-family:${SANS};font-size:12.5px;line-height:1.5;color:${C.muted};">${esc(businessName)} &middot; Sydney CBD &amp; Double Bay</td></tr>
</table></td></tr></table></body></html>`;
}

function clientEmail(c: EmailCopy, name: string) {
  const steps = c.steps
    .map(
      (s, i) => `<tr><td valign="top" style="padding:0 14px 12px 0;width:28px;"><div style="width:28px;height:28px;border-radius:14px;background:${C.olive};color:${C.cream};text-align:center;line-height:28px;font-family:${SANS};font-size:13px;font-weight:600;">${i + 1}</div></td><td valign="middle" style="padding:0 0 12px;font-family:${SANS};font-size:16px;color:${C.ink};">${esc(s)}</td></tr>`,
    )
    .join('');
  const html = shell(
    c.preheader,
    c.businessName,
    `<p style="margin:0 0 16px;font-family:${SERIF};font-size:24px;color:${C.ink};">${esc(c.greeting.replace('{name}', name))}</p>
<p style="margin:0 0 26px;">${esc(c.intro)}</p>
<div style="border-top:1px solid ${C.line};padding-top:22px;">
<p style="margin:0 0 14px;font-family:${SANS};font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;color:${C.olive};">${esc(c.stepsHeading)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">${steps}</table></div>
<p style="margin:18px 0 26px;color:${C.muted};">${esc(c.outro)}</p>
<p style="margin:0;">${esc(c.signOff)}<br><span style="font-family:${SERIF};font-size:20px;color:${C.olive};">${esc(c.signature)}</span></p>`,
  );
  const text = [c.greeting.replace('{name}', name), '', c.intro, '', c.stepsHeading.toUpperCase(), ...c.steps.map((s, i) => `${i + 1}. ${s}`), '', c.outro, '', c.signOff, c.signature].join('\n');
  return { html, text };
}

function ownerEmail(c: EmailCopy, d: { name: string; phone: string; email: string }, when: string) {
  const row = (k: string, v: string) => `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.line};width:110px;color:${C.muted};font-size:14px;">${k}</td><td style="padding:10px 0;border-bottom:1px solid ${C.line};font-size:16px;font-weight:600;">${v}</td></tr>`;
  const html = shell(
    `${d.name} would like a call`,
    c.businessName,
    `<p style="margin:0 0 6px;font-family:${SANS};font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;color:${C.olive};">New call request</p>
<p style="margin:0 0 22px;font-family:${SERIF};font-size:24px;">${esc(d.name)} would like a call</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${SANS};">
${row('Name', esc(d.name))}${row('Phone', `<a href="tel:${esc(d.phone.replace(/[^+\d]/g, ''))}" style="color:${C.olive};">${esc(d.phone)}</a>`)}${row('Email', `<a href="mailto:${esc(d.email)}" style="color:${C.olive};">${esc(d.email)}</a>`)}${row('Received', esc(when))}</table>
<p style="margin:22px 0 0;color:${C.muted};font-size:14px;">They've been sent a confirmation email. You can reply to this email to reach them directly.</p>`,
  );
  const text = `New call request\n\nName: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\nReceived: ${when}\n\nThey've been sent a confirmation. Reply to this email to reach them.`;
  return { html, text };
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
    body: JSON.stringify({ from: env.MAIL_FROM, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text, reply_to: msg.replyTo }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function discoveryCall(request: Request, env: Env): Promise<Response> {
  // only accept posts from this site
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'forbidden' }, 403);

  const form = await request.formData();
  if (String(form.get('website') ?? '') !== '') return json({ ok: true }); // honeypot: bots fill this in; pretend success

  const name = String(form.get('name') ?? '').trim().slice(0, 100);
  const phone = String(form.get('phone') ?? '').trim().slice(0, 40);
  const email = String(form.get('email') ?? '').trim().slice(0, 200);
  if (!name || !/^[+\d][\d\s()+-]{5,}$/.test(phone) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    return json({ error: 'invalid' }, 400);
  }

  const copyRes = await env.ASSETS.fetch(new Request(new URL('/email-content.json', request.url)));
  const copy = (await copyRes.json()) as EmailCopy;
  const when = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'full', timeStyle: 'short' });

  try {
    const owner = ownerEmail(copy, { name, phone, email }, when);
    await send(env, { to: env.NOTIFY_TO, subject: `New call request: ${name}`, html: owner.html, text: owner.text, replyTo: email });
    // the client's confirmation is secondary: if it fails, Alex still has the lead
    const client = clientEmail(copy, name.split(' ')[0]);
    await send(env, { to: email, subject: copy.subject, html: client.html, text: client.text, replyTo: env.NOTIFY_TO }).catch((e) => console.error('confirmation failed', e));
  } catch (e) {
    console.error('notification failed', e);
    return json({ error: 'send-failed' }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/discovery-call') {
      if (request.method !== 'POST') return json({ error: 'method' }, 405);
      return discoveryCall(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
