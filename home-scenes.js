(() => {
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
