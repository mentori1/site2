(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const selector = '[data-reveal], .seo-prose > section, .seo-outcomes > div, .seo-terms, .seo-related > div > a, .seo-faq details, .seo-case-teaser, .offer-card, .home-offer, .blog-feature, .portfolio-project__details > div, .article-feature-grid > div';
  const elements = [...document.querySelectorAll(selector)].filter(el => !el.parentElement.closest(selector) && !el.closest('[data-stack]'));
  const pending = elements.filter(el => el.getBoundingClientRect().top > window.innerHeight - 20);
  if (!pending.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('polish-seen');
      if (el.hasAttribute('data-reveal')) el.classList.add('is-in');
      el.classList.remove('polish-pending');
      observer.unobserve(el);
      if (--remaining === 0) observer.disconnect();
    });
  }, {threshold:0, rootMargin:'0px 0px 36px 0px'});
  let remaining = pending.length;
  pending.forEach(el => {
    el.classList.add('polish-pending');
    observer.observe(el);
  });
  // In-page links must not land on an element still waiting for an observer tick.
  window.addEventListener('hashchange', () => {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    target?.classList.remove('polish-pending');
  });
})();
