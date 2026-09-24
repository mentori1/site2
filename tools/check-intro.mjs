import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=await fs.readFile('main.js','utf8');
const boot=source.slice(source.indexOf('  const brandIntro ='),source.indexOf('  /* ─── 2a. MOBILE MENU'));
function setup({seen=false,reduced=false,storageBlocked=false,hash=''}={}){
  const events=new Map(),timers=new Map(),classes=new Set();
  const hero={dataset:{}},loader={removed:false,classList:{add(){}},remove(){this.removed=true;}};
  const window={addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n),dispatchEvent:e=>events.get(e.type)?.(e)};
  const document={getElementById:()=>loader,querySelector:()=>hero,body:{classList:{add:n=>classes.add(n),remove:n=>classes.delete(n)}}};
  vm.runInNewContext(boot,{window,document,Event,location:{hash},prefersReducedMotion:reduced,sessionStorage:{getItem(){if(storageBlocked)throw Error('blocked');return seen?'done':null;}},setTimeout:(f,t)=>{timers.set(t,f);return t;},clearTimeout:t=>timers.delete(t)});
  return {hero,loader,classes,events,run(ms){const f=timers.get(ms);timers.delete(ms);f?.();}};
}
let s=setup();s.run(1850);assert(s.classes.has('brand-intro-active'));s.hero.dataset.sceneReady='true';s.events.get('mentori:scene-ready')();assert.equal(s.hero.dataset.bootFinished,'play');assert(!s.classes.has('brand-intro-active'));
s=setup();s.hero.dataset.sceneReady='true';s.events.get('mentori:scene-ready')();assert.equal(s.hero.dataset.bootFinished,undefined);s.run(1850);assert.equal(s.hero.dataset.bootFinished,'play');
for(const options of [{seen:true},{reduced:true},{hash:'#subscription'}]){s=setup(options);assert(s.loader.removed);assert.equal(s.hero.dataset.bootFinished,'skip');assert.equal(s.classes.size,0);}
s=setup({storageBlocked:true});s.run(4500);assert.equal(s.hero.dataset.bootFinished,'skip');assert.equal(s.classes.size,0);
s=setup();s.events.get('keydown')({key:'Escape'});assert.equal(s.hero.dataset.bootFinished,'skip');s.run(4500);assert.equal(s.hero.dataset.bootFinished,'skip');
console.log('Boot checks passed: ready-first, timer-first, repeat visit, reduced motion, anchor, blocked storage, timeout and Escape.');
