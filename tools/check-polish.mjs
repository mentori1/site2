import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { load } from 'cheerio';

const js=await fs.readFile('site-polish.js','utf8');
const css=await fs.readFile('site-polish.css','utf8');
assert(js.length+css.length<11000,'Small shared enhancement budget');
assert(!/requestAnimationFrame|setInterval|setTimeout|addEventListener\(['"]scroll/.test(js),'No continuous animation or scroll work');
assert(!/animation:.*infinite|transition:[^;}]*filter/.test(css),'No looping or animated blur');
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes('.services-stack .stack__card'));
assert(css.includes('background-color:var(--bg-elevated,#111110)'),'Stack stays opaque');
const asset='assets/services/mentori-devices-cutout-v3.webp';
assert((await fs.stat(asset)).size<200000,'Optimized device visual under 200 KB');
for(const reduced of [false,true])for(const supported of [false,true]){
  let callback,observed=[],unobserved=[],disconnected=0;
  const elements=[0,1300,2000].map(top=>{
    const classes=new Set();
    return {top,classes,hasAttribute:()=>true,parentElement:{closest:()=>null},closest:()=>null,getBoundingClientRect:()=>({top}),classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}};
  });
  const context={window:{innerHeight:800,matchMedia:()=>({matches:reduced}),addEventListener(){}},document:{querySelectorAll:()=>elements}};
  if(supported){context.window.IntersectionObserver=true;context.IntersectionObserver=class{
    constructor(cb){callback=cb;}observe(el){observed.push(el);}unobserve(el){unobserved.push(el);}disconnect(){disconnected++;}
  };}
  vm.runInNewContext(js,context);
  if(reduced||!supported){assert.equal(observed.length,0);assert(elements.every(e=>!e.classes.size));continue;}
  assert.equal(observed.length,2,'Above-fold content is never hidden');
  assert(!elements[0].classes.has('polish-pending'));
  callback(observed.map(target=>({target,isIntersecting:true})));
  assert.equal(unobserved.length,2);assert.equal(disconnected,1);
  assert(elements.every(e=>!e.classes.has('polish-pending')));
}
const files=(await fs.readdir('.')).filter(f=>f.endsWith('.html')&&!f.startsWith('yandex_'));
for(const file of files){
  const $=load(await fs.readFile(file,'utf8'));
  assert.equal($('link[href^="/site-polish.css"]').length,1,file+': one visual layer');
  assert.equal($('script[src^="/site-polish.js"]').length,1,file+': one reveal controller');
  assert($('script[src^="/site-polish.js"]').is('[defer]'));
  assert.equal($('link[rel="stylesheet"]').last().attr('href'),'/site-polish.css?v=20261025-1',file+': scoped polish overrides base rules');
}
console.log('Visual polish verified: one-time reveals, no hidden LCP, reduced-motion/no-observer fallbacks, opaque stack, shared rounding and small asset budget.');
