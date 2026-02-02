// =========================================================================
// SCROLL REVEAL (IntersectionObserver)
// =========================================================================
(() => {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  // если по какой-то причине нет в <head>, добавим тут
  document.documentElement.classList.add('js');

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  if (prefersReduced) {
    items.forEach((el) => el.classList.add('is-inview'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-inview'));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-inview');
        // COMMENT: один раз показали — дальше не анимируем повторно
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px',
    },
  );

  items.forEach((el) => {
    const delay = el.getAttribute('data-reveal-delay');
    if (delay) {
      const ms = Number.parseInt(delay, 10);
      if (!Number.isNaN(ms)) el.style.setProperty('--reveal-delay', `${ms}ms`);
    }
    io.observe(el);
  });
})();
