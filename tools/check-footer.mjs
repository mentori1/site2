import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await fs.readFile('footer-reveal.js','utf8');
function setup({reduced=false,observer=true,top=900}={}) {
  const classes=new Set();
  const values={};
  const rect={top,height:400};
  const listeners=new Map();
  let visibility,change,queued;
  const el={getBoundingClientRect:()=>rect,style:{setProperty:(k,v)=>values[k]=v},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}};
  const media={matches:reduced,addEventListener:(_,fn)=>{change=fn;}};
  class IntersectionObserver {constructor(fn){visibility=fn;} observe(){}}
  const window={innerHeight:800,matchMedia:()=>media,addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
  if(observer) window.IntersectionObserver=IntersectionObserver;
  vm.runInNewContext(source,{document:{querySelector:()=>el},window,IntersectionObserver,requestAnimationFrame:fn=>{queued=fn;return 1;}});
  const flush=()=>{const fn=queued;queued=null;fn?.();};
  return {classes,values,rect,listeners,media,visibility:visible=>{visibility([{isIntersecting:visible}]);flush();},scroll:()=>{listeners.get('scroll')?.();flush();},change:()=>{change();flush();}};
}
const s=setup();
assert.equal(s.values['--footer-offset'],'-100%');
s.visibility(true);
s.rect.top=600;s.scroll();assert.equal(s.values['--footer-offset'],'-50%');
s.rect.top=400;s.scroll();assert.equal(s.values['--footer-offset'],'0%');
s.visibility(false);assert(!s.listeners.has('scroll'),'Offscreen listener removed');
s.media.matches=true;s.change();assert(!s.classes.has('is-reveal-ready'));
assert.equal(setup({reduced:true}).classes.size,0);
assert.equal(setup({observer:false}).classes.size,0);
console.log('Footer verified: partial/full reveal, offscreen cleanup, reduced motion and no-JS-style fallback.');
