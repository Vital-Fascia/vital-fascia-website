// Keeps the single visible "I agree to receive offers & updates" tick-box in step with the two hidden radio buttons
// that carry the value the form actually sends ("Consent" / "No consent"), and remembers the visitor's choice in
// their browser (localStorage) so it stays ticked across every form, every page and after a reload.
export {}; // makes this file its own module (no clash with other scripts' variable names)

const KEY = 'vf-marketing-consent';
const read = (): string | null => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* private mode: just don't remember */ } };

const roots = [...document.querySelectorAll<HTMLElement>('[data-consent]')];

function apply(root: HTMLElement, on: boolean) {
  root.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked = on;
  root.querySelector<HTMLInputElement>('input[value="Consent"]')!.checked = on;
  root.querySelector<HTMLInputElement>('input[value="No consent"]')!.checked = !on;
}

/** The remembered choice if there is one (and remembering is on), otherwise the default set in the editor. */
function startingValue(root: HTMLElement): boolean {
  if (root.dataset.remember === 'true') {
    const saved = read();
    if (saved !== null) return saved === '1';
  }
  return root.dataset.preticked === 'true';
}

roots.forEach((root) => {
  apply(root, startingValue(root));
  const box = root.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  box.addEventListener('change', () => {
    if (root.dataset.remember === 'true') write(box.checked ? '1' : '0');
    roots.forEach((r) => apply(r, box.checked)); // every consent box on the page follows
  });
  // after a successful send the form is reset: put the remembered choice back
  root.closest('form')?.addEventListener('reset', () => setTimeout(() => apply(root, startingValue(root)), 0));
});

// another tab changed it
window.addEventListener('storage', (e) => {
  if (e.key === KEY) roots.forEach((r) => r.dataset.remember === 'true' && apply(r, e.newValue === '1'));
});
