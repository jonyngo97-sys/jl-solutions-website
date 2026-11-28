/* Studio motion layer for the homepage (DE/EN/VI).
   Scroll reveals via IntersectionObserver, no libraries.
   Progressive enhancement: without JS, or with prefers-reduced-motion,
   every block stays visible. */
(() => {
  'use strict';
  const doc = document;
  const reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  if (reduceQuery.matches || !('IntersectionObserver' in window)) return;

  const groups = [
    ['.ed-section-head > *', 90],
    ['.ed-service-image', 0],
    ['.ed-service-body > *', 80],
    ['.ed-demos .section-head > *', 90],
    ['.ed-demos .solution-studio', 0],
    ['.home-journey > *', 80],
    ['.home-journey li', 90],
    ['.page-faq > *', 70],
    ['.contact > div', 120],
    ['.ed-footer > div', 70]
  ];
  const vh = window.innerHeight || doc.documentElement.clientHeight;
  const targets = [];
  groups.forEach(([selector, step]) => {
    doc.querySelectorAll(selector).forEach((el, i) => {
      if (el.classList.contains('rv')) return;
      if (el.getBoundingClientRect().top < vh * 0.92) return;   // already on screen: never hide
      el.classList.add('rv');
      if (step) el.style.setProperty('--rv-delay', `${Math.min(i, 5) * step}ms`);
      targets.push(el);
    });
  });
  if (!targets.length) return;
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('rv-in');
    io.unobserve(el);
    // once revealed, hand the element back to its normal (hover) transitions
    setTimeout(() => { el.classList.remove('rv', 'rv-in'); el.style.removeProperty('--rv-delay'); }, 1500 + (parseInt(el.style.getPropertyValue('--rv-delay'), 10) || 0));
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(el => io.observe(el));
  // safety net: never leave content hidden if something goes wrong
  window.addEventListener('load', () => setTimeout(() => {
    targets.forEach(el => { if (el.classList.contains('rv') && !el.classList.contains('rv-in') && el.getBoundingClientRect().top < window.innerHeight) el.classList.add('rv-in'); });
  }, 2500));
})();
