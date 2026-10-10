(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const demo = document.querySelector('[data-order-demo]');
  if (demo) {
    let timer;
    let played = false;
    const select = view => {
      clearTimeout(timer);
      demo.classList.remove('is-crossed');
      demo.dataset.view = view;
      demo.querySelectorAll('[data-order-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.orderView === view)));
      demo.querySelectorAll('[data-order-panel]').forEach(panel => { panel.hidden = panel.dataset.orderPanel !== view; });
    };
    demo.querySelectorAll('[data-order-view]').forEach(button => button.addEventListener('click', () => {
      played = true;
      select(button.dataset.orderView);
    }));
    if ('IntersectionObserver' in window && !reduced.matches) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries[0].isIntersecting;
        clearTimeout(timer);
        if (!visible) { demo.classList.remove('is-crossed'); return; }
        if (played) return;
        timer = setTimeout(() => {
          demo.classList.add('is-crossed');
          timer = setTimeout(() => { played = true; select('after'); }, 850);
        }, 2300);
      }, {threshold: .55});
      observer.observe(demo);
      document.addEventListener('visibilitychange', () => { if (document.hidden) { played = true; select('after'); } });
      reduced.addEventListener('change', () => { if (reduced.matches) { played = true; select('after'); observer.disconnect(); } });
    }
  }
  // Each scene animates once; offscreen cards have no animation loop.
  const scenes = document.querySelectorAll('[data-flow-demo]');
  if ('IntersectionObserver' in window) {
    const seen = new WeakSet();
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target.closest('[data-stack-card]');
      if (card?.getAttribute('aria-hidden') === 'true') return;
      entry.target.classList.add('is-visible');
      seen.add(entry.target);
      observer.unobserve(entry.target);
    }), {threshold: .35});
    scenes.forEach(scene => observer.observe(scene));
    const stack = document.querySelector('[data-stack]');
    if (stack) new MutationObserver(() => {
      scenes.forEach(scene => {
        if (!seen.has(scene) && scene.closest('[data-stack-card]')?.getAttribute('aria-hidden') !== 'true') observer.observe(scene);
      });
    }).observe(stack, {subtree:true, attributes:true, attributeFilter:['aria-hidden']});
  } else scenes.forEach(scene => scene.classList.add('is-visible'));
})();
