import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=await fs.readFile('home-scenes.js','utf8');
function setup(reduced=false) {
  const timers=new Map(),events={},observers=[],classes=new Set();
  let next=0;
  const motion={matches:reduced,addEventListener:(_,fn)=>{motion.change=fn;}};
  const buttons=['before','after'].map(view=>({dataset:{orderView:view},setAttribute(key,value){this[key]=value;},addEventListener(_,fn){this.click=fn;}}));
  const panels=['before','after'].map(view=>({dataset:{orderPanel:view},hidden:view==='after'}));
  const demo={dataset:{view:'before'},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},querySelectorAll:selector=>selector==='[data-order-view]'?buttons:panels};
  const document={hidden:false,querySelector:selector=>selector==='[data-order-demo]'?demo:null,querySelectorAll:()=>[],addEventListener:(name,fn)=>{events[name]=fn;}};
  class IntersectionObserver { constructor(fn){this.fn=fn;observers.push(this);} observe(){} unobserve(){} disconnect(){this.disconnected=true;} }
  vm.runInNewContext(source,{document,window:{IntersectionObserver},IntersectionObserver,matchMedia:()=>motion,setTimeout:(fn,delay)=>{timers.set(++next,{fn,delay});return next;},clearTimeout:id=>timers.delete(id)});
  return {demo,buttons,panels,classes,timers,document,events,motion,observers,visible(value){observers[0].fn([{isIntersecting:value}]);},run(delay){for(const [id,timer] of [...timers]) if(timer.delay===delay){timers.delete(id);timer.fn();}}};
}
let s=setup();
s.visible(true);s.run(2300);assert(s.classes.has('is-crossed'));s.run(850);
assert.equal(s.demo.dataset.view,'after');assert(s.panels[0].hidden);assert(!s.panels[1].hidden);
s.visible(false);s.visible(true);assert.equal(s.timers.size,0,'Auto transition only runs once');
s=setup();s.visible(true);s.buttons[0].click();s.run(2300);s.run(850);
assert.equal(s.demo.dataset.view,'before');assert.equal(s.timers.size,0,'Manual selection cancels auto transition');
s.buttons[1].click();assert.equal(s.buttons[1]['aria-pressed'],'true');assert.equal(s.buttons[0]['aria-pressed'],'false');
s=setup();s.visible(true);s.visible(false);assert.equal(s.timers.size,0);s.visible(true);s.run(2300);s.run(850);assert.equal(s.demo.dataset.view,'after');
s=setup(true);assert.equal(s.timers.size,0);assert.equal(s.demo.dataset.view,'before');s.buttons[1].click();assert.equal(s.demo.dataset.view,'after');
s=setup();s.visible(true);s.motion.matches=true;s.motion.change();assert.equal(s.timers.size,0);assert(s.observers[0].disconnected);
s=setup();s.visible(true);s.document.hidden=true;s.events.visibilitychange();assert.equal(s.timers.size,0);assert.equal(s.demo.dataset.view,'after');
console.log('Home demo verified: one-time transition, manual override, visibility cancellation and reduced motion.');
