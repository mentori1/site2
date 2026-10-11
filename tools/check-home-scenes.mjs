import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = await fs.readFile('home-scenes.js', 'utf8');
assert(!source.includes('data-order-demo'), 'The removed hero must not retain its animation controller');
assert(!/setTimeout|requestAnimationFrame/.test(source), 'Scenes must have no continuous timer');

function setup(supportsObserver = true) {
  const observers = [];
  let mutation;
  const cards = [false, true, true, true].map(hidden => ({
    hidden,
    getAttribute() { return String(this.hidden); },
  }));
  const scenes = cards.map(card => ({
    classes: new Set(),
    classList: { add(name) { this.owner.classes.add(name); } },
    closest: () => card,
  }));
  scenes.forEach(scene => { scene.classList.owner = scene; });
  const stack = {};
  const document = {
    querySelector: selector => selector === '[data-stack]' ? stack : null,
    querySelectorAll: selector => selector === '[data-flow-demo]' ? scenes : [],
  };
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.observed = new Set(); observers.push(this); }
    observe(scene) { this.observed.add(scene); }
    unobserve(scene) { this.observed.delete(scene); }
  }
  class MutationObserver {
    constructor(callback) { mutation = callback; }
    observe(target, options) {
      assert.equal(target, stack);
      assert.equal(options.attributeFilter[0], 'aria-hidden');
    }
  }
  vm.runInNewContext(source, { document, window: supportsObserver ? { IntersectionObserver } : {}, IntersectionObserver, MutationObserver });
  return { scenes, cards, observers, changed: () => mutation() };
}

const state = setup();
const observer = state.observers[0];
assert.equal(observer.observed.size, 4);
observer.callback([{ target: state.scenes[0], isIntersecting: false }]);
assert.equal(state.scenes[0].classes.size, 0);
observer.callback(state.scenes.map(target => ({ target, isIntersecting: true })));
assert(state.scenes[0].classes.has('is-visible'));
assert.equal(observer.observed.has(state.scenes[0]), false, 'Visible scenes stop observing after one reveal');
assert.equal(state.scenes[1].classes.size, 0, 'Hidden carousel cards do not animate');
state.cards[0].hidden = true;
state.cards[1].hidden = false;
state.changed();
assert.equal(observer.observed.has(state.scenes[0]), false, 'Completed scenes are not restarted');
observer.callback([{ target: state.scenes[1], isIntersecting: true }]);
assert(state.scenes[1].classes.has('is-visible'));
assert(setup(false).scenes.every(scene => scene.classes.has('is-visible')), 'Fallback shows every scene without observers');
const css = await fs.readFile('home-scenes.css', 'utf8');
assert.match(css,/\.flow-demo__phone\s*\{[^}]*object-fit:contain/,'Phone is never cropped to fill a fixed rectangle');
assert.match(css,/\.services-stack \.flow-demo--inbox\s*\{[^}]*height:auto;[^}]*aspect-ratio:3\/2/,'Inbox keeps the original image ratio at every breakpoint');
assert(/prefers-reduced-motion:reduce/.test(css) && /animation:none!important/.test(css));
console.log('Home scenes verified: no hero timers, one-time reveal, hidden-card guard, observer fallback and reduced-motion CSS.');
