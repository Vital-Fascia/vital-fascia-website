// Collapsible sections: toggle button, one-at-a-time not required. Opens automatically
// when the page is loaded or navigated to with a #hash that points inside (or at) a section.
const roots = [...document.querySelectorAll<HTMLElement>('[data-collapse]')];

const setOpen = (root: HTMLElement, open: boolean) => {
  const btn = root.querySelector<HTMLButtonElement>('.c-toggle');
  root.classList.toggle('open', open);
  if (!btn) return;
  btn.setAttribute('aria-expanded', String(open));
  const label = btn.querySelector('.c-label');
  if (label) label.textContent = (open ? root.dataset.hide : root.dataset.show) ?? '';
};

roots.forEach((root) => {
  root.querySelector('.c-toggle')?.addEventListener('click', () => setOpen(root, !root.classList.contains('open')));
});

const openForHash = () => {
  if (!location.hash || location.hash.length < 2) return;
  let target: Element | null = null;
  try { target = document.querySelector(decodeURIComponent(location.hash)); } catch { return; }
  if (!target) return;
  const inner = target.closest<HTMLElement>('[data-collapse]');
  const child = target.querySelector<HTMLElement>(':scope > [data-collapse], :scope > * > [data-collapse]');
  const root = inner ?? child;
  if (root && !root.classList.contains('open')) {
    setOpen(root, true);
    // re-align once the section has grown, so the header stays where the link pointed
    setTimeout(() => target!.scrollIntoView(), 80);
  }
};
openForHash();
window.addEventListener('hashchange', openForHash);
