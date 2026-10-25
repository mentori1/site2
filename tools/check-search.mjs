import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { servicePages } from '../src/seo-services.mjs';
import { homeFaq } from '../src/home-faq.mjs';

const origin='https://mentorios.tech',brand='MENTORI TECHNOLOGIES';
const preview=origin+'/assets/mentori-technologies-preview-2026.png';
assert.equal(await fs.readFile('favicon.svg','utf8'),await fs.readFile('assets/favicon.svg','utf8'));
assert((await fs.readFile('robots.txt','utf8')).includes('Allow: /'));
for(const file of (await fs.readdir('.')).filter(f=>f.endsWith('.html')&&!f.startsWith('yandex_'))){
  const $=load(await fs.readFile(file,'utf8'));
  const graph=JSON.parse($('script[type="application/ld+json"]').first().text())['@graph'];
  const org=graph.find(n=>n['@type']==='Organization'),site=graph.find(n=>n['@type']==='WebSite');
  assert.equal(org.name,brand);assert.equal(site.name,brand);
  assert(site.alternateName.includes('Mentory Technologies'),'Known transliteration is an alias, not a visible brand rename');
  assert.equal(org.logo.url,origin+'/assets/favicon-512.png');
  assert.equal($('meta[property="og:image"]').length,1);
  assert.equal($('meta[property="og:image"]').attr('content'),preview);
  assert.equal($('meta[property="og:image:secure_url"]').attr('content'),preview);
  assert.equal($('meta[name="twitter:image"]').attr('content'),preview);
  assert.equal($('meta[property="og:site_name"]').attr('content'),brand);
  assert.equal($('link[rel="icon"][type="image/svg+xml"]').attr('sizes'),'any');
  assert.equal($('head > title').length,1);
  assert.equal($('meta[name="description"]').length,1);
  const faq=graph.find(n=>n['@type']==='FAQPage');
  const questions=$('.seo-faq details,.article-faq details,.offer-questions details');
  if(faq||questions.length){
    assert.equal(questions.length,faq.mainEntity.length,file+': visible FAQ and schema count');
    questions.each((i,n)=>{
      assert.equal($(n).find('summary').text().trim(),faq.mainEntity[i].name);
      assert.equal($(n).find('p').text().trim(),faq.mainEntity[i].acceptedAnswer.text);
    });
  }
  if(servicePages.some(p=>p.slug+'.html'===file)){
    assert.equal($('[rel="author"]').length,1);
    assert.equal($('.seo-content-note time').attr('datetime'),'2026-10-25');
    assert(graph.find(n=>n['@type']==='Service').image.startsWith(origin+'/assets/'));
    assert.equal(graph.find(n=>n['@type']==='BreadcrumbList').itemListElement.at(-1).item,origin+'/'+file.slice(0,-5));
  }
}
const home=load(await fs.readFile('index.html','utf8'));
assert.equal(home('#faq details').length,homeFaq.length);
const homeGraph=JSON.parse(home('script[type="application/ld+json"]').first().text())['@graph'];
const homeSchema=homeGraph.find(n=>n['@type']==='FAQPage');
homeFaq.forEach(([q,a],i)=>{assert.equal(homeSchema.mainEntity[i].name,q);assert.equal(homeSchema.mainEntity[i].acceptedAnswer.text,a);});
assert(home('.hero__lead').text().startsWith(brand));
assert.equal(home('#hero .hero__title').length,1);
assert(!/\[(срок|цена|название)\]/i.test(home('main').text()));
console.log('Search verified: brand and aliases, favicon, one approved preview, own URLs, matching FAQ markup, real authorship and no placeholder deadlines.');
