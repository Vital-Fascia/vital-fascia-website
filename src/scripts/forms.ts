// Progressive enhancement for every <form data-form>. Posts via fetch when an
// endpoint is configured (see src/lib/forms.ts); otherwise explains it isn't connected.
document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
  const status = form.querySelector<HTMLElement>('.form-status');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!status) return;
    const action = form.getAttribute('action');
    if (!action) {
      status.textContent = "This form isn't connected yet (TODO: choose a form service).";
      return;
    }
    status.textContent = 'Sending…';
    try {
      const res = await fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.textContent = form.dataset.success ?? 'Thanks!';
    } catch {
      status.textContent = 'Sorry, something went wrong. Please try again, or email us directly.';
    }
  });
});
