// Progressive enhancement for every <form data-form>:
//  - tidies what people type (names capitalised, phone numbers formatted, emails lower-cased) as they leave each box,
//    so the tidy version is what the CRM tracking script sees too;
//  - checks every field BEFORE anything is sent, with plain-English messages next to the field;
//  - posts via fetch to the Worker (see src/lib/forms.ts).
// The Worker repeats all checks, because a browser can always be bypassed.
import { checkEmail, checkMessage, checkName, checkPhone } from '../lib/clean';

type Checker = (input: HTMLInputElement | HTMLTextAreaElement) => { value: string; error?: string };

const checkers: Record<string, Checker> = {
  name: (el) => checkName(el.value),
  first_name: (el) => checkName(el.value),
  email: (el) => checkEmail(el.value),
  phone: (el) => checkPhone(el.value, el.required),
  message: (el) => checkMessage(el.value),
};

const fieldsOf = (form: HTMLFormElement) =>
  [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[name], textarea[name]')].filter((el) => checkers[el.name]);

function errorBox(el: HTMLElement) {
  const wrap = el.closest('.field') ?? el.parentElement!;
  let box = wrap.querySelector<HTMLElement>('.field-error');
  if (!box) {
    box = document.createElement('span');
    box.className = 'field-error';
    box.id = `${el.id || el.getAttribute('name')}-error`;
    box.setAttribute('role', 'alert');
    wrap.append(box);
  }
  return box;
}

/** Tidy one field in place and show or clear its message. Returns true when the field is fine. */
function checkField(el: HTMLInputElement | HTMLTextAreaElement, silent = false): boolean {
  const { value, error } = checkers[el.name](el);
  if (el.value !== value) el.value = value; // write the tidy version back
  if (!silent) {
    const box = errorBox(el);
    box.textContent = error ?? '';
    if (error) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', box.id); }
    else { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
  }
  return !error;
}

/** Tidy and check everything; focuses the first problem. */
function validate(form: HTMLFormElement): boolean {
  let first: HTMLElement | null = null;
  for (const el of fieldsOf(form)) if (!checkField(el) && !first) first = el;
  first?.focus();
  return !first;
}

document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
  const status = form.querySelector<HTMLElement>('.form-status');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  // when the page loaded: the Worker treats an instant submission as a bot
  const stamp = document.createElement('input');
  stamp.type = 'hidden';
  stamp.name = '_t';
  stamp.value = String(Date.now());
  form.append(stamp);

  fieldsOf(form).forEach((el) => {
    el.addEventListener('blur', () => { if (el.value.trim() || el.required) checkField(el); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') checkField(el, false); });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!status) return;
    if (!validate(form)) { status.textContent = 'Please check the highlighted boxes.'; return; }
    const action = form.getAttribute('action');
    if (!action) { status.textContent = "This form isn't connected yet."; return; }
    status.textContent = 'Sending…';
    if (button) button.disabled = true;
    try {
      const res = await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string; field?: string };
        if (res.status === 400 && body.message) {
          const el = body.field ? form.querySelector<HTMLInputElement>(`[name="${body.field}"]`) : null;
          if (el) { const box = errorBox(el); box.textContent = body.message; el.setAttribute('aria-invalid', 'true'); el.focus(); }
          status.textContent = body.message;
          return;
        }
        throw new Error(String(res.status));
      }
      form.reset();
      fieldsOf(form).forEach((el) => { errorBox(el).textContent = ''; el.removeAttribute('aria-invalid'); });
      stamp.value = String(Date.now());
      status.textContent = form.dataset.success ?? 'Thanks!';
    } catch {
      status.textContent = 'Sorry, something went wrong. Please try again, or email us directly.';
    } finally {
      if (button) button.disabled = false;
    }
  });
});

// Runs before any other click handler on the page (including third-party tracking scripts): a submit click on a
// form with a mistake is stopped here, so the mistake is never sent anywhere.
window.addEventListener(
  'click',
  (event) => {
    const target = event.target as HTMLElement | null;
    const btn = target?.closest<HTMLElement>('form[data-form] button[type="submit"], form[data-form] input[type="submit"]');
    if (!btn) return;
    const form = btn.closest<HTMLFormElement>('form[data-form]')!;
    if (!validate(form)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const status = form.querySelector<HTMLElement>('.form-status');
      if (status) status.textContent = 'Please check the highlighted boxes.';
    }
  },
  true,
);
