(() => {
  const reveal = document.querySelector('[data-footer-reveal]');
  if (!reveal || !('IntersectionObserver' in window)) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  let frame = 0;
  const draw = () => {
    frame = 0;
    if (reduced.matches) {
      reveal.classList.remove('is-reveal-ready');
      return;
    }
    const rect = reveal.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / Math.max(1, rect.height)));
    reveal.style.setProperty('--footer-offset', `${-100 * (1-progress)}%`);
    reveal.classList.add('is-reveal-ready');
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
  // Only listen while the signature is nearby; no continuous render loop.
  const observer = new IntersectionObserver(entries => {
    active = entries[0].isIntersecting;
    if (active) window.addEventListener('scroll', schedule, {passive:true});
    else window.removeEventListener('scroll', schedule);
    schedule();
  }, {rootMargin:'100px 0px'});
  observer.observe(reveal);
  window.addEventListener('resize', schedule, {passive:true});
  reduced.addEventListener('change', schedule);
  draw();
})();
