import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { load } from 'cheerio';
const source=await fs.readFile('footer-reveal.js','utf8');
const css=await fs.readFile('page-finish.css','utf8');
assert(!/url\s*\(/.test(css),'Page backgrounds must not load any images');
assert(css.includes('body.surface-soft'),'Lighting belongs to the whole page, not individual sections');
for (const page of ['index.html','services.html','portfolio.html']) {
  const $=load(await fs.readFile(page,'utf8'));
  assert($('body').hasClass('surface-soft'));
  assert.equal($('script[src="/footer-reveal.js?v=20261011-2"]').length,1);
  assert.equal($('.foot-signature').length,1);
}
function setup({reduced=false,observer=true}={}) {
  const style={}; const listeners=new Map(); const frames=new Map(); let id=0,clock=0,reads=0,visibility,change;
  const image={style};
  const frame={querySelector:()=>image,getBoundingClientRect:()=>{reads++;return {top:900-window.scrollY,height:400};}};
  const media={matches:reduced,addEventListener:(_,fn)=>{change=fn;}};
  class IntersectionObserver {constructor(fn){visibility=fn;} observe(){}}
  const window={scrollY:0,innerHeight:800,matchMedia:()=>media,addEventListener:(k,fn)=>listeners.set(k,fn),removeEventListener:k=>listeners.delete(k)};
  if(observer) window.IntersectionObserver=IntersectionObserver;
  const document={hidden:false,body:{},querySelector:()=>frame,addEventListener(){}};
  vm.runInNewContext(source,{document,window,IntersectionObserver,requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)});
  const tick=()=>{clock+=16;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(clock));};
  const settle=()=>{for(let i=0;frames.size&&i<100;i++)tick();assert.equal(frames.size,0,'Animation stops when settled');};
  return {style,window,listeners,frames,media,tick,settle,reads:()=>reads,visible:value=>visibility([{isIntersecting:value}]),scroll:()=>listeners.get('scroll')?.(),change:()=>change()};
}
const state=setup();
assert.equal(state.style.transform,'translate3d(0,-100.000%,0)');
state.visible(true);
state.window.scrollY=300;state.scroll();state.tick();
const first=Number(state.style.transform.match(/,(-?[\d.]+)%/)[1]);
assert(first>-100&&first<-50,'Scroll target is eased, not jumped to');
const reads=state.reads();state.settle();assert.equal(state.reads(),reads,'No layout reads in animation loop');
assert.equal(state.style.transform,'translate3d(0,-50.000%,0)');
state.window.scrollY=500;state.scroll();state.settle();assert.equal(state.style.transform,'translate3d(0,0.000%,0)');
state.window.scrollY=300;state.scroll();state.settle();assert.equal(state.style.transform,'translate3d(0,-50.000%,0)','Reverse scrolling works');
state.visible(false);assert(!state.listeners.has('scroll'));
state.media.matches=true;state.change();assert.equal(state.style.transform,'');
assert.equal(setup({reduced:true}).style.transform,'');
assert.equal(setup({observer:false}).style.transform,undefined);
console.log('Page finish verified: image-free continuous background; eased footer, no per-frame layout, idle/offscreen cleanup and accessibility fallback.');
