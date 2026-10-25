import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

const origin='https://mentorios.tech';
const reportDirectory=process.env.MENTORI_REPORT_DIR||'../reports/seo-expansion-20261025';
const report=reportDirectory+'/live-verification.json';
const sitemap=load(await fs.readFile('sitemap.xml','utf8'),{xmlMode:true});
const routes=sitemap('loc').toArray().map(n=>new URL(sitemap(n).text()).pathname);
const resources=new Set(['/hero-published.css?v=20261025-1','/seo-pages.css?v=20261025-2','/favicon.svg','/assets/mentori-technologies-preview-2026.png','/assets/favicon-512.png']);
const result={checkedAt:new Date().toISOString(),pages:[],resources:[],redirects:[],failures:[]};
const hash=data=>createHash('sha256').update(data).digest('hex');
async function request(url,options={}){
  const response=await fetch(url,{headers:{'Cache-Control':'no-cache','User-Agent':'Mentori-release-verification/20261025'},signal:AbortSignal.timeout(30000),...options});
  return {response,body:Buffer.from(await response.arrayBuffer())};
}
for(const route of routes){
  try{
    const file=route==='/'?'index.html':route.slice(1)+'.html';
    const {response,body}=await request(origin+route),$=load(body.toString('utf8'));
    const row={route,status:response.status,canonical:$('link[rel="canonical"]').attr('href'),title:$('title').text(),h1:$('h1').text(),faq:$('.seo-faq details,.article-faq details,.offer-questions details').length,sha256:hash(body),matchesLocal:hash(body)===hash(await fs.readFile(file))};
    result.pages.push(row);
    assert.equal(response.status,200,route+': HTTP status');
    assert.equal(response.url,origin+route,route+': no unexpected redirect');
    assert.equal(row.canonical,origin+route);
    assert.equal($('h1').length,1);
    assert(row.title.toUpperCase().includes('MENTORI TECHNOLOGIES'));
    assert.equal($('meta[name="description"]').length,1);
    assert.equal($('meta[property="og:image"]').length,1);
    assert.equal($('meta[property="og:image"]').attr('content'),origin+'/assets/mentori-technologies-preview-2026.png');
    assert.equal($('link[rel="icon"][type="image/svg+xml"]').attr('href'),'/favicon.svg');
    $('link[rel="alternate"][hreflang]').each((_,node)=>assert.equal($(node).attr('href'),origin+route));
    const graph=JSON.parse($('script[type="application/ld+json"]').first().text())['@graph'];
    assert(graph.some(node=>node['@type']==='Organization'&&node.name==='MENTORI TECHNOLOGIES'));
    const faq=graph.find(node=>node['@type']==='FAQPage');
    if(faq)assert.equal(faq.mainEntity.length,row.faq,route+': visible FAQ must match schema');
    assert(!/noindex/.test(response.headers.get('x-robots-tag')||''));
    assert(!$('meta[name="robots"]').attr('content')?.includes('noindex'));
    assert(row.matchesLocal,route+': content must match the reviewed release');
    for(const node of $('img[src],script[src],link[rel="stylesheet"][href],link[rel="icon"][href]').toArray()){
      const href=$(node).attr('src')||$(node).attr('href');
      if(href&&!/^(https?:|data:)/.test(href))resources.add(new URL(href,origin+route).pathname+(href.includes('?')?'?'+href.split('?')[1]:''));
    }
  }catch(error){result.failures.push({route,error:error.message});}
}
for(const resource of resources){
  try{
    const {response,body}=await request(origin+resource);
    const row={resource,status:response.status,bytes:body.length,type:response.headers.get('content-type')};
    if(['/hero-published.css','/seo-pages.css','/favicon.svg','/assets/mentori-technologies-preview-2026.png','/assets/favicon-512.png'].includes(resource.split('?')[0]))row.matchesLocal=hash(body)===hash(await fs.readFile(resource.slice(1).split('?')[0]));
    result.resources.push(row);
    assert.equal(response.status,200,resource+': resource status');
    assert(body.length>0,resource+': resource content');
    assert(row.matchesLocal!==false,resource+': exact released CSS');
    if(resource==='/favicon.svg')assert(row.type?.includes('image/svg+xml'),resource+': SVG MIME');
    if(resource.endsWith('.png'))assert(row.type?.includes('image/png'),resource+': PNG MIME');
  }catch(error){result.failures.push({resource,error:error.message});}
}
for(const [from,to] of [['http://mentorios.tech/','https://mentorios.tech/'],['https://www.mentorios.tech/','https://mentorios.tech/'],...routes.filter(r=>r!=='/').map(r=>[origin+r+'.html',origin+r])]){
  try{
    const {response}=await request(from,{redirect:'manual'});
    const location=new URL(response.headers.get('location'),from).href;
    result.redirects.push({from,status:response.status,location});
    assert.equal(response.status,301);assert.equal(location,to);
  }catch(error){result.failures.push({redirect:from,error:error.message});}
}
for(const file of ['sitemap.xml','llms.txt']){
  try{const {response,body}=await request(origin+'/'+file);assert.equal(response.status,200);assert.equal(hash(body),hash(await fs.readFile(file)));}catch(error){result.failures.push({file,error:error.message});}
}
try{const {response}=await request(origin+'/not-a-real-mentori-page-20261025',{redirect:'manual'});assert.equal(response.status,404);}catch(error){result.failures.push({check:'404',error:error.message});}
await fs.mkdir(reportDirectory,{recursive:true});
await fs.writeFile(report,JSON.stringify(result,null,2));
console.log(JSON.stringify({pages:result.pages.length,resources:result.resources.length,redirects:result.redirects.length,failures:result.failures},null,2));
if(result.failures.length)process.exitCode=1;
