import fs from 'node:fs/promises';
import { load } from 'cheerio';

// Source offsets preserve all unrelated HTML and metadata verbatim.
const pages=(await fs.readdir('.')).filter(name=>name.endsWith('.html')&&!name.startsWith('yandex_')&&name!=='portfolio.html');
const hero=await fs.readFile('src/hero.html','utf8');
const shared=load(await fs.readFile('index.html','utf8'));
for(const name of pages){
  const html=await fs.readFile(name,'utf8');
  const $=load(html,{sourceCodeLocationInfo:true});
  const edits=[];
  const replace=(node,text)=>{const l=node.sourceCodeLocation;edits.push({start:l.startOffset,end:l.endOffset,text});};
  const append=(node,text)=>{const l=node.sourceCodeLocation;edits.push({start:l.endTag.startOffset,end:l.endTag.startOffset,text});};
  if(!$('.nav__links').length){
    replace($('.nav')[0],shared('.nav').toString()+shared('#mobileMenu').toString());
    if(!$('.foot').length)append($('body')[0],shared('.foot').toString());
    append($('head')[0],'<script>document.documentElement.dataset.theme="dark";document.documentElement.dataset.themeLock="dark";</script>');
  }
  $('head script:not([src]):not([type])').each((_,node)=>{
    if($(node).text().includes('mentra-theme'))replace(node,'<script>document.documentElement.dataset.theme="dark";document.documentElement.dataset.themeLock="dark";</script>');
  });
  $('meta[name="color-scheme"]').each((_,node)=>replace(node,'<meta name="color-scheme" content="dark">'));
  $('meta[name="theme-color"]').each((i,node)=>replace(node,i===0?'<meta name="theme-color" content="#0b0b0a">':''));
  $('#themeToggle').each((_,node)=>replace(node,''));
  $('.nav__links,.mobile-menu__nav').each((_,node)=>{
    if(!$(node).find('[href="/portfolio"]').length)append(node,'<a href="/portfolio">Портфолио</a>');
  });
  $('.mobile-menu__cta').each((_,node)=>replace(node,`<div class="mobile-menu__socials" aria-label="Связаться с MENTORI">${shared('.nav__contacts').html()}</div>`));
  $('.foot__h').each((_,node)=>{
    if($(node).text()==='Разделы'&&!$(node).parent().find('[href="/portfolio"]').length)append(node.parent,'<a href="/portfolio">Портфолио</a>');
  });
  const refreshStyle='<link rel="stylesheet" href="/site-refresh.css?v=20260925-4">';
  if(!$('link[href^="/site-refresh.css"]').length)append($('head')[0],`\n${refreshStyle}\n`);
  else $('link[href^="/site-refresh.css"]').each((_,node)=>replace(node,refreshStyle));
  $('script[src^="main.min.js"]').each((_,node)=>replace(node,'<script src="main.min.js?v=56" defer></script>'));
  if(name==='index.html'){
    if($('#hero').length)replace($('#hero')[0],hero);
    $('.project-preview').each((_,node)=>replace(node,''));
    $('script[src^="/assets/hero/bundle/"],#brandIntro,[data-stack-controls]').each((_,node)=>replace(node,''));
    $('[data-stack],[data-stack-card]').each((_,node)=>{
      const l=node.sourceCodeLocation.startTag;
      edits.push({start:l.startOffset,end:l.endOffset,text:html.slice(l.startOffset,l.endOffset).replace(/ data-stack(?:-card)?(?=[\s>])/g,'')});
    });
    $('link[rel="preload"][href="/assets/hero/graphite-studio.jpg"]').each((_,node)=>replace(node,''));
  }
  let updated=html;
  for(const edit of edits.sort((a,b)=>b.start-a.start))updated=updated.slice(0,edit.start)+edit.text+updated.slice(edit.end);
  await fs.writeFile(name,updated);
}

const index=load(await fs.readFile('index.html','utf8'));
const title='Портфолио: системы и сайты для бизнеса | MENTORI TECHNOLOGIES';
const description='Наши проекты: система Mentori, CRM и Telegram Mini App для танцевальной студии, сайт производственной компании Спектр Металла.';
const head=index('head').clone();
head.find('link[rel="preload"][as="image"],script[type="application/ld+json"]').remove();
head.find('title').text(title);
head.find('[name="description"],[property="og:description"],[name="twitter:description"]').attr('content',description);
head.find('[property="og:title"],[name="twitter:title"]').attr('content',title);
head.find('link[rel="canonical"],link[rel="alternate"]').attr('href','https://mentorios.tech/portfolio');
head.find('[property="og:url"]').attr('content','https://mentorios.tech/portfolio');
head.find('link[href*="home.min.css"]').attr('href','https://cdn.jsdelivr.net/gh/mentori1/site2@16abbcb/styles.min.css?v=79');
const schema={'@context':'https://schema.org','@type':'CollectionPage',name:title,description,url:'https://mentorios.tech/portfolio',inLanguage:'ru-RU'};
head.append(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
const nav=index('.nav').clone();nav.find('[href="/portfolio"]').addClass('is-active').attr('aria-current','page');
const portfolio=`<!doctype html>\n<html lang="ru">${head.toString()}<body>${nav.toString()}${index('#mobileMenu').toString()}${await fs.readFile('src/portfolio-main.html','utf8')}${index('.foot').toString()}<script src="main.min.js?v=56" defer></script></body></html>\n`;
await fs.writeFile('portfolio.html',portfolio.replace(/[\t ]+$/gm,''));
const xml=load(await fs.readFile('sitemap.xml','utf8'),{xmlMode:true});
xml('url').each((_,node)=>xml(node).find('lastmod').text('2026-09-25'));
if(!xml('loc').toArray().some(node=>xml(node).text()==='https://mentorios.tech/portfolio'))xml('urlset').append('<url><loc>https://mentorios.tech/portfolio</loc><lastmod>2026-09-25</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>');
await fs.writeFile('sitemap.xml',xml.xml());
console.log('Integrated hero, portfolio, sticky contact navigation and shared styling.');
