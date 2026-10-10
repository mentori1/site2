import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { services } from '../src/service-catalog.mjs';
const page=load(await fs.readFile('services.html','utf8'));
const home=load(await fs.readFile('index.html','utf8'));
assert.equal(page('.offer-card').length,6);
assert.equal(page('.srv,.cost-logic,.connected-services').length,0,'Old repeated module sections removed');
assert.equal(page('main').length,1);
assert.equal(page('#system').length,1);
assert.equal(home('#internal-ops').length,0,'Repeated operations explanation replaced');
assert.equal(home('.home-offer').length,6);
assert.equal(home('[data-stack-card]').length,4,'Approved stack retained');
for(const s of services) {
  assert.equal(page('#'+s.id+' .offer-price strong').text(),s.price);
  assert.equal(page('#'+s.id+' [data-service]').attr('data-service'),s.title);
  assert.equal(page('#'+s.id+' .offer-details').length,1);
  assert.equal(page('#'+s.id+' .offer-details[open]').length,0,'Compact initial state');
  assert.equal(home('a[href="/services#'+s.id+'"]').length,1);
}
const schema=JSON.parse(page('script[type="application/ld+json"]').first().text());
const offers=schema.hasOfferCatalog.itemListElement;
for(const s of services) assert.equal(offers.find(o=>o.name===s.title).price,s.priceValue);
assert(page('#direct .offer-price').text().includes('7 500 ₽ / месяц'));
assert(page('#websites .offer-price').text().includes('от 5 000 ₽'));
const article=load(await fs.readFile('blog-yandex-direct-dlya-biznesa.html','utf8'));
assert(!article('body').text().includes('20 000'),'Old fee removed');
assert(article('#price').text().includes('7 500'));
assert(article('.article-cta').text().includes('7 500'));
const js=await fs.readFile('main.js','utf8');
assert(js.includes('link.dataset.service'),'Named service analytics retained');
assert(js.includes('".connected-service, [data-service]"'));
for(const file of ['index.html','services.html']) {
  const $=load(await fs.readFile(file,'utf8'));
  assert.equal($('link[href^="/service-catalog.css"]').length,1);
  assert.equal($('form').length,0,'Contact-only flow retained');
  const ids=$('[id]').toArray().map(el=>$(el).attr('id'));
  assert.equal(new Set(ids).size,ids.length,'Unique anchor IDs');
}
console.log('Services verified: six offers, prices, schema, article, anchors, disclosure state and preserved homepage stack.');
