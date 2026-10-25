import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { servicePages, casePages } from '../src/seo-services.mjs';
import { newArticles } from '../src/seo-articles.mjs';

const origin='https://mentorios.tech';
const files=(await fs.readdir('.')).filter(f=>f.endsWith('.html')&&!f.startsWith('yandex_'));
const pages=new Map();
for(const file of files)pages.set(file==='index.html'?'/':'/'+file.slice(0,-5),load(await fs.readFile(file,'utf8')));
const sitemap=load(await fs.readFile('sitemap.xml','utf8'),{xmlMode:true});
const urls=sitemap('loc').toArray().map(n=>sitemap(n).text());
assert.equal(urls.length,48);
assert.equal(new Set(urls).size,48,'No duplicate sitemap entries');
assert.equal(servicePages.length,25,'Seven directions and eighteen specific service landings');
assert.equal(servicePages.filter(p=>p.parent).length,18);
const titles=new Set(),descriptions=new Set(),inbound=new Map();
for(const [route,$] of pages){
  assert(urls.includes(origin+route),route+': present in sitemap');
  const title=$('title').text().trim(),description=$('meta[name="description"]').attr('content');
  assert(title.length>12&&description?.length>40,route+': meaningful metadata');
  assert(!titles.has(title),route+': unique title');titles.add(title);
  assert(!descriptions.has(description),route+': unique description');descriptions.add(description);
  assert.equal($('link[rel="canonical"]').attr('href'),origin+route,route+': canonical');
  assert.equal($('meta[property="og:url"]').attr('content'),origin+route,route+': social URL');
  $('link[rel="alternate"][hreflang]').each((_,n)=>assert.equal($(n).attr('href'),origin+route,route+': own language URL'));
  assert.equal($('link[rel="icon"][type="image/svg+xml"]').attr('href'),'/favicon.svg');
  assert(title.includes('MENTORI TECHNOLOGIES'),route+': visible search brand');
  assert.equal($('h1').length,1);
  assert.equal($('form').length,0,'No lead forms or content gates');
  assert(!$('body').text().includes('undefined'),route+': no missing content');
  const ids=$('[id]').toArray().map(n=>$(n).attr('id'));
  assert.equal(ids.length,new Set(ids).size,route+': unique IDs');
  for(const el of $('a[href]').toArray()){
    const href=$(el).attr('href');
    if(!href.startsWith('/')&&!href.startsWith('#'))continue;
    const u=new URL(href,origin+route);
    const target=pages.get(u.pathname);
    if(!target)continue;
    if(u.hash)assert(target('[id]').toArray().some(n=>target(n).attr('id')===decodeURIComponent(u.hash.slice(1))),`${route}: broken anchor ${href}`);
    if(u.pathname!==route)inbound.set(u.pathname,(inbound.get(u.pathname)||0)+1);
  }
}
for(const p of [...servicePages,...casePages,...newArticles]){
  const route='/'+p.slug,$=pages.get(route);
  assert(inbound.get(route)>0,route+': not an orphan');
  assert.equal($('link[href^="/seo-pages.css"]').length,1);
  const graph=JSON.parse($('script[type="application/ld+json"]').first().text())['@graph'];
  assert(graph.some(n=>n['@type']==='BreadcrumbList'));
  assert(graph.some(n=>n['@type']==='Organization'&&n.areaServed.name==='Россия'));
  assert(!graph.some(n=>n.aggregateRating||n.review),'No invented ratings');
}
for(const p of servicePages){
  const $=pages.get('/'+p.slug),graph=JSON.parse($('script[type="application/ld+json"]').first().text())['@graph'];
  const entity=graph.find(n=>n['@type']==='Service');
  assert.equal(entity.areaServed.name,'Россия');
  assert(graph.some(n=>n['@type']==='FAQPage'&&n.mainEntity.length===p.faq.length));
  assert.equal($('.seo-terms').length,1);
  assert.equal($('.seo-faq details').length,p.faq.length);
  assert.equal(p.sections.length,4,'Every service has its own complete explanation');
  assert($('.seo-prose').text().split(/\s+/).length>190,p.slug+': substantial service content');
  if(p.parent){
    assert(inbound.get('/'+p.slug)>=2,p.slug+': linked from directory and parent');
    assert($('.seo-breadcrumb a[href="/'+servicePages.find(s=>s.id===p.parent).slug+'"]').length,p.slug+': parent breadcrumb');
    assert(pages.get('/services')('#service-directions a[href="/'+p.slug+'"]').length,p.slug+': service directory');
    const paragraphs=p.sections.flatMap(s=>s.paragraphs||[]);
    const parentParagraphs=servicePages.find(s=>s.id===p.parent).sections.flatMap(s=>s.paragraphs||[]);
    assert(paragraphs.every(text=>!parentParagraphs.includes(text)),p.slug+': no copied parent paragraphs');
    if(p.priceValue===undefined)assert.equal(entity.offers.priceSpecification,undefined,p.slug+': no invented numeric price');
  }
}
for(const p of newArticles){
  const $=pages.get('/'+p.slug);
  assert($('.seo-prose').text().split(/\s+/).length>300,p.slug+': substantial article');
  assert.equal($('.seo-toc a').length,p.sections.length);
  assert.equal($('main a[href$=".pdf"]').length,0,'New guides are web articles, not PDF downloads');
  assert.equal($('article .seo-author').text(),'Материал команды MENTORI TECHNOLOGIES');
}
assert.equal(pages.get('/blog')('.seo-blog-card').length,11);
assert(pages.get('/yandex-direct')('main').text().includes('7 500'));
assert(pages.get('/yandex-direct')('main').text().includes('в разработке'));
assert(pages.get('/razrabotka-sajtov')('main').text().includes('5 000'));
assert(pages.get('/uchet-zanyatij')('main').text().includes('15 000'));
assert(pages.get('/uslugi-avitologa')('main').text().includes('бонус'));
assert(pages.get('/case-crm-studii-tancev')('main').text().includes('Полтора месяца'));
for(const route of ['/about','/contact'])assert(pages.get(route)('#geography').text().includes('по всей России'));
console.log('SEO verified: 25 service landings, 48 indexable pages, unique metadata, sitemap, anchors, parent links, real cases, pricing and free guides.');
