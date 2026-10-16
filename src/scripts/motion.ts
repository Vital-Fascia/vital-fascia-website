// Small shared motion layer: scroll-reveal, count-up, image-zoom-in.
// Everything is a no-op under prefers-reduced-motion (final state is shown).
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const reveals = document.querySelectorAll<HTMLElement>('[data-reveal], [data-zoom], [data-count]');
reveals.forEach((el) => {
  const delay = el.dataset.revealDelay;
  if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
});

const parse = (text: string) => {
  const m = text.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
  return m ? { pre: m[1], num: parseFloat(m[2]), dec: (m[2].split('.')[1] || '').length, post: m[3] } : null;
};

const countUp = (el: HTMLElement) => {
  const target = parse(el.textContent || '');
  if (!target || reduce) return;
  const dur = 1200;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = target.pre + (target.num * eased).toFixed(target.dec) + target.post;
    if (t < 1) requestAnimationFrame(tick);
  };
  el.textContent = target.pre + (0).toFixed(target.dec) + target.post;
  requestAnimationFrame(tick);
};

if (!('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        el.classList.add('in');
        if (el.hasAttribute('data-count')) countUp(el);
        io.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  reveals.forEach((el) => io.observe(el));
}
