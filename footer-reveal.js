(() => {
  const frame = document.querySelector('[data-footer-reveal]');
  const image = frame?.querySelector('img');
  if (!image || !('IntersectionObserver' in window)) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let top = 0, height = 1, current = -100, target = -100;
  let active = false, raf = 0, previousTime = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const write = () => { image.style.transform = `translate3d(0,${current.toFixed(3)}%,0)`; };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    previousTime = 0;
    image.style.willChange = '';
  };
  const paint = time => {
    raf = 0;
    const delta = previousTime ? Math.min(64, time - previousTime) : 16;
    previousTime = time;
    // Time-based damping stays consistent across 60/120 Hz displays.
    current += (target - current) * (1 - Math.exp(-delta / 85));
    if (Math.abs(target - current) < .08) current = target;
    write();
    if (current !== target && active && !reduced.matches) raf = requestAnimationFrame(paint);
    else stop();
  };
  const update = () => {
    if (reduced.matches || document.hidden) { stop(); image.style.transform = ''; return; }
    target = -100 * (1 - clamp((window.scrollY + window.innerHeight - top) / height));
    if (!active) { current = target; write(); return; }
    image.style.willChange = 'transform';
    if (!raf) raf = requestAnimationFrame(paint);
  };
  const measure = () => {
    const rect = frame.getBoundingClientRect();
    top = rect.top + window.scrollY;
    height = Math.max(1, rect.height);
    update();
  };
  // Layout is measured only on entry/resize, never inside animation frames.
  const observer = new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
    if (active) { window.addEventListener('scroll', update, {passive:true}); measure(); }
    else { window.removeEventListener('scroll', update); stop(); update(); }
  }, {rootMargin:'160px 0px'});
  measure();
  observer.observe(frame);
  window.addEventListener('resize', measure, {passive:true});
  reduced.addEventListener('change', measure);
  document.addEventListener('visibilitychange', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
})();
