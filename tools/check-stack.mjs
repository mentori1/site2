import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = await fs.readFile('main.js', 'utf8');
const start = source.indexOf('  const initScrollStack =');
const end = source.indexOf('  const loadMotionScript =', start);
assert(start > 0 && end > start, 'Scroll-stack initializer exists');
const init = source.slice(start, end) + '\ninitScrollStack();';
const cards = [{}, {}, {}, {}];

for (const { desktop, reduced } of [
  { desktop: true, reduced: false },
  { desktop: false, reduced: false },
  { desktop: true, reduced: true },
]) {
  const calls = [];
  const gsap = { registerPlugin() {}, to(card, options) { calls.push({ card, options }); } };
  const ScrollTrigger = {};
  vm.runInNewContext(init, {
    prefersReducedMotion: reduced,
    gsap, ScrollTrigger,
    window: { gsap, ScrollTrigger, matchMedia: () => ({ matches: desktop }) },
    document: { querySelectorAll: () => cards },
  });
  assert.equal(calls.length, desktop && !reduced ? 3 : 0);
  calls.forEach(({ card, options }, i) => {
    assert.equal(card, cards[i]);
    assert.equal(options.scale, 0.94, 'Stack scaling is preserved');
    assert.equal(options.scrollTrigger.trigger, cards[i + 1]);
    assert.equal(options.opacity, undefined, 'Whole cards must never fade through');
  });
}
const css = await fs.readFile('site-refresh.css', 'utf8');
assert(css.includes('.services-stack .stack__card { background-color: var(--bg-elevated, #111110);'), 'Stack has an opaque base');
console.log('Stack checks passed: desktop scaling retained, no opacity animation, opaque base, mobile and reduced-motion guards.');
