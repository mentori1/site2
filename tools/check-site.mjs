import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
const pages=(await fs.readdir('.')).filter(n=>n.endsWith('.html')&&!n.startsWith('yandex_'));
let checked=0;
for(const page of pages){
  const $=load(await fs.readFile(page,'utf8'));
  assert.equal($('h1').length,1,`${page}: one H1`);
  assert.equal($('.nav__links [href="/portfolio"]').length,1,`${page}: portfolio nav`);
  assert.equal($('.nav__contacts [href="tel:+79114378585"]').length,1,`${page}: call link`);
  assert($('script[src="main.min.js?v=52"]').length,`${page}: consent/analytics retained`);
  assert($('meta[name="robots"]').attr('content')?.includes('index'),`${page}: indexing`);
  $('script[type="application/ld+json"]').each((_,el)=>JSON.parse($(el).text()));
  for(const el of $('[src],[href]').toArray()){
    let ref=$(el).attr('src')||$(el).attr('href');
    if(!ref||/^(https?:|mailto:|tel:|data:|#)/.test(ref))continue;
    const target=ref.split(/[?#]/)[0].replace(/^\//,'');
    if(!target)continue;
    const file=path.extname(target)?target:target+'.html';
    await fs.access(file).catch(()=>{throw Error(`${page}: missing ${file}`);});checked++;
  }
}
const home=load(await fs.readFile('index.html','utf8'));
assert.equal(home('.air-hero').length,1);
assert(home('h1').text().includes('Порядок вместо'));
assert.equal(home('#services').length,1,'Original homepage sections retained');
assert.equal(home('.project-teaser,.project-preview').length,0,'Projects live only in portfolio');
assert.equal(home('.air-portal').length,1,'Dashboard transition present');
const portfolio=load(await fs.readFile('portfolio.html','utf8'));
assert.equal(portfolio('.portfolio-project').length,3,'All three projects present');
assert(portfolio('a[href="/assets/portfolio/studio-crm-miniapp.pdf"]').length,'Studio presentation linked');
const sitemap=load(await fs.readFile('sitemap.xml','utf8'),{xmlMode:true});
assert(sitemap('loc').toArray().some(n=>sitemap(n).text()==='https://mentorios.tech/portfolio'));
console.log(`${pages.length} pages verified; ${checked} local links/assets exist. Structured data, contacts, portfolio and original sections verified.`);
