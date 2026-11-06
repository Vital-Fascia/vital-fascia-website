/**
 * Email wording, forms and HTML templates. Pure functions with no Cloudflare APIs, so the same code
 * builds the real emails in the Worker (worker/index.ts) and the preview page at
 * /admin/email-previews (src/pages/admin/email-previews.astro).
 */

export interface ConfirmationCopy {
  subject: string;
  preheader: string;
  greeting: string;
  intro: string;
  stepsHeading: string;
  steps: string[];
  outro: string;
  signOff: string;
  signature: string;
}
export interface EmailContent {
  callRequest: ConfirmationCopy;
  contactMessage: ConfirmationCopy;
  waitlist: ConfirmationCopy;
  businessName: string;
  ownerEmail: string;
}

export type Field = { key: string; label: string; formName: string; required: boolean; max: number; kind: 'text' | 'phone' | 'email' | 'message' };
export interface FormType {
  copy: keyof Omit<EmailContent, 'businessName' | 'ownerEmail'>;
  nameField: string;
  fields: Field[];
  ownerHeading: string; // small heading in Alex's email
  ownerTitle: (name: string) => string;
  ownerSubject: (name: string) => string;
  ownerNote: string;
}

export const FORMS: Record<string, FormType> = {
  '/api/discovery-call': {
    copy: 'callRequest',
    nameField: 'name',
    fields: [
      { key: 'name', label: 'Name', formName: 'name', required: true, max: 100, kind: 'text' },
      { key: 'phone', label: 'Phone', formName: 'phone', required: true, max: 40, kind: 'phone' },
      { key: 'email', label: 'Email', formName: 'email', required: true, max: 200, kind: 'email' },
    ],
    ownerHeading: 'New call request',
    ownerTitle: (n) => `${n} would like a call`,
    ownerSubject: (n) => `New call request: ${n}`,
    ownerNote: "They've been sent a confirmation email. You can reply to this email to reach them directly.",
  },
  '/api/contact': {
    copy: 'contactMessage',
    nameField: 'name',
    fields: [
      { key: 'name', label: 'Name', formName: 'name', required: true, max: 100, kind: 'text' },
      { key: 'email', label: 'Email', formName: 'email', required: true, max: 200, kind: 'email' },
      { key: 'phone', label: 'Phone', formName: 'phone', required: false, max: 40, kind: 'phone' },
      { key: 'message', label: 'Message', formName: 'message', required: true, max: 4000, kind: 'message' },
    ],
    ownerHeading: 'New message',
    ownerTitle: (n) => `${n} sent you a message`,
    ownerSubject: (n) => `New website message: ${n}`,
    ownerNote: "They've been sent a confirmation email. You can reply to this email to answer them directly.",
  },
  '/api/waitlist': {
    copy: 'waitlist',
    nameField: 'first_name',
    fields: [
      { key: 'name', label: 'First name', formName: 'first_name', required: true, max: 100, kind: 'text' },
      { key: 'email', label: 'Email', formName: 'email', required: true, max: 200, kind: 'email' },
    ],
    ownerHeading: '8-Week Program waitlist',
    ownerTitle: (n) => `${n} joined the waitlist`,
    ownerSubject: (n) => `New waitlist sign-up: ${n}`,
    ownerNote: "They've been sent a confirmation email. You can reply to this email to reach them directly.",
  },
};

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

export function clientEmail(c: ConfirmationCopy, businessName: string, name: string) {
  const steps = c.steps
    .map(
      (s, i) => `<tr><td valign="top" style="padding:0 14px 12px 0;width:28px;"><div style="width:28px;height:28px;border-radius:14px;background:${C.olive};color:${C.cream};text-align:center;line-height:28px;font-family:${SANS};font-size:13px;font-weight:600;">${i + 1}</div></td><td valign="middle" style="padding:0 0 12px;font-family:${SANS};font-size:16px;color:${C.ink};">${esc(s)}</td></tr>`,
    )
    .join('');
  const html = shell(
    c.preheader,
    businessName,
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

export function ownerEmail(f: FormType, businessName: string, d: Record<string, string>, when: string) {
  const row = (k: string, v: string) => `<tr><td valign="top" style="padding:10px 0;border-bottom:1px solid ${C.line};width:110px;color:${C.muted};font-size:14px;">${k}</td><td style="padding:10px 0;border-bottom:1px solid ${C.line};font-size:16px;">${v}</td></tr>`;
  const value = (fld: Field) => {
    const v = d[fld.key];
    if (fld.kind === 'phone') return `<a href="tel:${esc(v.replace(/[^+\d]/g, ''))}" style="color:${C.olive};">${esc(v)}</a>`;
    if (fld.kind === 'email') return `<a href="mailto:${esc(v)}" style="color:${C.olive};">${esc(v)}</a>`;
    if (fld.kind === 'message') return esc(v).replace(/\n/g, '<br>');
    return `<strong>${esc(v)}</strong>`;
  };
  const filled = f.fields.filter((fld) => d[fld.key]);
  const html = shell(
    f.ownerTitle(d.name),
    businessName,
    `<p style="margin:0 0 6px;font-family:${SANS};font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;color:${C.olive};">${esc(f.ownerHeading)}</p>
<p style="margin:0 0 22px;font-family:${SERIF};font-size:24px;">${esc(f.ownerTitle(d.name))}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${SANS};">
${filled.map((fld) => row(fld.label, value(fld))).join('')}${row('Received', esc(when))}</table>
<p style="margin:22px 0 0;color:${C.muted};font-size:14px;">${esc(f.ownerNote)}</p>`,
  );
  const text = `${f.ownerHeading}\n\n${filled.map((fld) => `${fld.label}: ${d[fld.key]}`).join('\n')}\nReceived: ${when}\n\n${f.ownerNote}`;
  return { html, text };
}

