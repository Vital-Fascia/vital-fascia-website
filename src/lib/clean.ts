/**
 * Cleaning and checking of what people type into the website forms.
 * ONE source of truth: used in the browser (src/scripts/forms.ts) so tidy values are what the visitor
 * and the CRM tracking script see, and again on the server (worker/index.ts) because the browser can be bypassed.
 */

export interface Checked { value: string; error?: string }

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/** Names: tidy spaces; any word typed all lower or all UPPER case gets capitalised ("anna-marie o'brien" -> "Anna-Marie O'Brien"). Words with mixed case are respected ("McDonald"). */
export function cleanName(input: string): string {
  const s = (input ?? '').replace(CONTROL, ' ').replace(/\s+/g, ' ').trim();
  return s
    .split(' ')
    .map((w) => (w === w.toLowerCase() || w === w.toUpperCase() ? w.toLowerCase().replace(/(^|['’-])(\p{L})/gu, (_m, p: string, c: string) => p + c.toUpperCase()) : w))
    .join(' ');
}

export function checkName(input: string): Checked {
  const value = cleanName(input);
  if (!value) return { value, error: 'Please enter your name.' };
  if (value.length < 2) return { value, error: 'Please enter your name.' };
  if (value.length > 100) return { value, error: 'That name is too long.' };
  if (!/^\p{L}[\p{L}\p{M}'’.\- ]*$/u.test(value)) return { value, error: 'Please use letters only in your name.' };
  return { value };
}

const TYPO_DOMAINS: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com',
  'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'yaho.com': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'outlok.com': 'outlook.com', 'outlook.con': 'outlook.com', 'icloud.con': 'icloud.com', 'iclod.com': 'icloud.com',
};
const THROWAWAY = new Set(['mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getnada.com', 'throwawaymail.com']);

export function cleanEmail(input: string): string {
  return (input ?? '').replace(CONTROL, '').replace(/\s+/g, '').trim().toLowerCase();
}

export function checkEmail(input: string): Checked {
  const value = cleanEmail(input);
  if (!value) return { value, error: 'Please enter your email address.' };
  if (value.length > 254) return { value, error: 'That email address is too long.' };
  const ok = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(value)
    && !value.includes('..') && /\.[a-z]{2,}$/.test(value);
  if (!ok) return { value, error: 'Please enter a valid email address, like name@example.com.' };
  const domain = value.split('@')[1];
  if (TYPO_DOMAINS[domain]) return { value, error: `Did you mean ${value.split('@')[0]}@${TYPO_DOMAINS[domain]}?` };
  if (THROWAWAY.has(domain)) return { value, error: 'Please use a permanent email address so we can reach you.' };
  return { value };
}

/** Phones: Australian numbers are tidied to "0412 345 678" / "02 1234 5678"; +61 numbers become local; other international numbers keep their +. */
export function checkPhone(input: string, required: boolean): Checked {
  const raw = (input ?? '').replace(CONTROL, '').trim();
  if (!raw) return required ? { value: '', error: 'Please enter a phone number we can call.' } : { value: '' };
  if (/[^\d\s()+.\-]/.test(raw)) return { value: raw, error: 'Please enter a valid phone number, like 0412 345 678.' };
  const plus = raw.startsWith('+');
  let d = raw.replace(/\D/g, '');
  if (plus && d.startsWith('61')) d = '0' + d.slice(2); // +61 4.. -> 04..
  else if (d.startsWith('0061')) d = '0' + d.slice(4);
  else if (!plus && d.length === 11 && d.startsWith('61')) d = '0' + d.slice(2);
  else if (!plus && /^4\d{8}$/.test(d)) d = '0' + d; // mobile typed without the leading 0
  if (/^04\d{8}$/.test(d)) return { value: `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` };
  if (/^0[2378]\d{8}$/.test(d)) return { value: `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}` };
  if (/^1[38]00\d{6}$/.test(d)) return { value: `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` };
  if (/^13\d{4}$/.test(d)) return { value: d };
  if (plus && d.length >= 8 && d.length <= 15 && !d.startsWith('0')) return { value: `+${d}` };
  return { value: raw, error: 'Please enter a valid phone number, like 0412 345 678.' };
}

export function cleanMessage(input: string): string {
  return (input ?? '').replace(/\r\n?/g, '\n').replace(CONTROL, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function checkMessage(input: string): Checked {
  const value = cleanMessage(input);
  if (value.length < 5) return { value, error: 'Please tell us a little about what you need.' };
  if (value.length > 4000) return { value, error: 'That message is too long (4000 characters at most).' };
  return { value };
}

/** Obvious spam signals. Used on the server only (the browser never says "spam"). */
export function looksLikeSpam(fields: { name?: string; message?: string }): boolean {
  const links = ((fields.message ?? '').match(/https?:\/\/|www\./gi) ?? []).length;
  if (links > 2) return true;
  if (/<\s*(script|a\s|iframe|img)/i.test(fields.message ?? '')) return true;
  if (/https?:\/\/|www\.|@|<|>/i.test(fields.name ?? '')) return true;
  return false;
}
