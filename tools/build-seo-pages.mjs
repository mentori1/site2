import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { services } from '../src/service-catalog.mjs';
import { servicePages, casePages } from '../src/seo-services.mjs';
import { newArticles } from '../src/seo-articles.mjs';

const origin='https://mentorios.tech', date='2026-10-25';
const css='<link rel="stylesheet" href="/seo-pages.css?v=20261025-1">';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=p=>'/'+p.slug;
const service=id=>servicePages.find(p=>p.id===id);
const project=id=>casePages.find(p=>p.id===id);
const oldArticles=[
  {slug:'blog-yandex-direct-dlya-biznesa',h1:'Яндекс Директ: от кликов к обращениям',description:'Что проверить перед запуском рекламы.',service:'direct'},
  {slug:'blog-seo-prodvizhenie-saita',h1:'Из чего состоит SEO-продвижение',description:'Техническая основа, содержание и поисковые обращения.',service:'seo'},
  {slug:'blog-crm-dlya-stroitelstva',h1:'CRM для строительной компании',description:'Объекты, этапы, документы и оплаты в одном месте.',service:'system'},
  {slug:'blog-crm-dlya-repetitora',h1:'CRM для репетитора',description:'Ученики, расписание, оплаты и абонементы.',service:'studio'}
];
const articles=[...newArticles,...oldArticles];
const organization={'@type':'Organization','@id':origin+'/#organization',name:'MENTORI TECHNOLOGIES',url:origin+'/',telephone:'+79996693419',email:'mentraos@mail.ru',areaServed:{'@type':'Country',name:'Россия'},sameAs:['https://t.me/Mentori_Re']};
const breadcrumb=items=>'<nav class="seo-breadcrumb" aria-label="Хлебные крошки"><a href="/">Главная</a>'+items.map(i=>'<span aria-hidden="true">/</span>'+(i.href?'<a href="'+i.href+'">'+esc(i.name)+'</a>':'<span aria-current="page">'+esc(i.name)+'</span>')).join('')+'</nav>';
const figure=p=>'<figure class="seo-figure'+(p.portrait?' seo-figure--portrait':'')+'"><img src="'+p.image+'" alt="'+esc(p.alt)+'" width="'+(p.portrait?'540':'1200')+'" height="'+(p.portrait?'1056':'800')+'" decoding="async" fetchpriority="high"></figure>';
const renderSections=data=>data.map((s,i)=>'<section id="section-'+(i+1)+'"><h2>'+esc(s.title)+'</h2>'+(s.paragraphs||[]).map(p=>'<p>'+esc(p)+'</p>').join('')+(s.list?'<ul>'+s.list.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>':'')+(s.table?'<div class="seo-table" tabindex="0" role="region" aria-label="'+esc(s.title)+'"><table><thead><tr>'+s.table.headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+s.table.rows.map(row=>'<tr>'+row.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'')+'</section>').join('\n');
const toc=data=>'<nav class="seo-toc" aria-label="Содержание"><span>В этом материале</span>'+data.map((s,i)=>'<a href="#section-'+(i+1)+'">'+esc(s.title)+'</a>').join('')+'</nav>';
const relatedArticles=slugs=>'<section class="seo-related"><h2>Полезно по теме</h2><div>'+slugs.map(slug=>{const a=articles.find(a=>a.slug===slug);if(!a)throw Error('Unknown article: '+slug);return '<a href="'+path(a)+'"><span>Статья</span><h3>'+esc(a.h1)+'</h3><p>'+esc(a.description)+'</p><b>Читать</b></a>';}).join('')+'</div></section>';
const relatedCases=ids=>ids.length?'<section class="seo-related"><h2>Как это выглядит в работе</h2><div>'+ids.map(id=>{const c=project(id);return '<a href="'+path(c)+'"><span>'+(id==='mentori'?'Собственный продукт':'Реальный проект')+'</span><h3>'+esc(c.h1)+'</h3><p>'+esc(c.lead)+'</p><b>Посмотреть кейс</b></a>';}).join('')+'</div></section>':'';
const serviceCta=(s,title='Обсудим вашу задачу?')=>'<section class="seo-contact"><p>Работаем удалённо по всей России</p><h2>'+esc(title)+'</h2><a class="btn btn--primary" href="/contact" data-service="'+esc(s.h1)+'">Связаться</a></section>';
const serviceLink=s=>'<a class="seo-service-link" href="'+path(s)+'"><span>Услуга Mentori</span><strong>'+esc(s.h1)+'</strong><span>Состав, условия и стоимость</span></a>';
function serviceMain(s){
  const offer=services.find(o=>o.id===s.id);
  return '<main class="seo-page seo-service">'+breadcrumb([{name:'Что делаем',href:'/services'},{name:offer?.title||'Автоматизация бизнеса'}])+'<header class="seo-hero"><div><p class="seo-eyebrow">'+(s.id==='system'?'Порядок внутри бизнеса':'Услуга Mentori')+' · Россия</p><h1>'+esc(s.h1)+'</h1><p class="seo-lead">'+esc(s.lead)+'</p><a class="btn btn--primary" href="/contact" data-service="'+esc(s.h1)+'">Обсудить задачу</a></div>'+figure(s)+'</header><section class="seo-outcomes" aria-label="Что вы получите">'+s.result.map((r,i)=>'<div><span>0'+(i+1)+'</span><p>'+esc(r)+'</p></div>').join('')+'</section><div class="seo-reading"><div class="seo-prose">'+renderSections(s.sections)+'</div><aside class="seo-terms"><span>Условия работы</span><strong>'+esc(s.price||offer.price)+'</strong><p>'+esc(s.terms||offer.terms)+'</p><p>Дистанционно по всей России. Состав и сроки фиксируем до начала работы.</p><a href="/contact" data-service="'+esc(s.h1)+'">Обсудить состав</a></aside></div><section class="seo-faq"><h2>Вопросы до начала работы</h2>'+s.faq.map(([q,a])=>'<details><summary>'+esc(q)+'</summary><p>'+esc(a)+'</p></details>').join('')+'</section>'+relatedCases(s.caseIds)+relatedArticles(s.articles)+serviceCta(s)+'</main>';
}
function articleMain(a){
  const count=a.sections.reduce((n,s)=>n+(s.paragraphs||[]).join(' ').split(/\s+/).length,0);
  return '<main class="seo-page seo-article"><article>'+breadcrumb([{name:'Блог',href:'/blog'},{name:a.category.replace(' · бесплатно','')}])+'<header class="seo-article-head"><p class="seo-eyebrow">'+esc(a.category)+' · <time datetime="'+date+'">25 октября 2026</time> · '+Math.max(4,Math.ceil(count/160))+' минут</p><h1>'+esc(a.h1)+'</h1><p class="seo-lead">'+esc(a.lead)+'</p><p class="seo-author">Материал команды MENTORI TECHNOLOGIES</p></header><div class="seo-article-layout">'+toc(a.sections)+'<div class="seo-prose">'+renderSections(a.sections)+(a.sources?'<section class="seo-sources"><h2>Справка и актуальные условия</h2><p>Правила и доступность инструментов могут меняться. Перед изменениями проверяйте условия своего аккаунта.</p><ul>'+a.sources.map(([label,href])=>'<li><a href="'+href+'" target="_blank" rel="noopener">'+esc(label)+'</a></li>').join('')+'</ul></section>':'')+serviceLink(service(a.service))+'</div></div></article>'+relatedCases(a.caseId?[a.caseId]:[])+relatedArticles(a.related)+'</main>';
}
const portfolioSource=load(await fs.readFile('src/portfolio-main.html','utf8'),{},false);
function caseMain(c){
  const full=portfolioSource('#'+c.id).clone().addClass('seo-case-project');
  full.find('.portfolio-project__heading').remove();
  return '<main class="seo-page seo-case">'+breadcrumb([{name:'Портфолио',href:'/portfolio'},{name:c.id==='spektr'?'Спектр Металла':c.id==='studio'?'Студия танцев':'Mentori'}])+'<header class="seo-article-head"><p class="seo-eyebrow">'+(c.id==='mentori'?'Собственный продукт · демонстрационные данные':'Реализованный проект')+'</p><h1>'+esc(c.h1)+'</h1><p class="seo-lead">'+esc(c.lead)+'</p></header>'+portfolioSource.html(full)+'<section class="seo-related"><h2>Направления проекта</h2><div>'+c.services.map(id=>serviceLink(service(id))).join('')+'</div></section>'+relatedArticles(c.articles)+serviceCta(service(c.services[0]),'Нужен похожий результат?')+'</main>';
}
const base=await fs.readFile('blog.html','utf8');
function renderPage(p,kind,main){
  const $=load(base);
  $('title').text(p.title);
  $('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]').attr('content',p.description);
  $('meta[property="og:title"],meta[name="twitter:title"]').attr('content',p.h1);
  $('meta[property="og:url"]').attr('content',origin+path(p));
  $('meta[property="og:type"]').attr('content',kind==='article'?'article':'website');
  $('link[rel="canonical"],link[rel="alternate"][hreflang="ru"]').attr('href',origin+path(p));
  $('meta[name="keywords"],script[type="application/ld+json"],link[href^="/seo-pages.css"],link[href^="/site-polish.css"],script[src^="/site-polish.js"]').remove();
  $('head').append(css);
  const group=kind==='service'?'Что делаем':kind==='case'?'Портфолио':'Блог';
  const groupPath=kind==='service'?'/services':kind==='case'?'/portfolio':'/blog';
  const crumbs=[{name:'Главная',item:origin+'/'},{name:group,item:origin+groupPath},{name:p.h1,item:origin+path(p)}];
  const webpage={'@type':'WebPage','@id':origin+path(p)+'#webpage',url:origin+path(p),name:p.h1,description:p.description,inLanguage:'ru-RU',isPartOf:{'@id':origin+'/#website'},about:{'@id':organization['@id']}};
  const graph=[organization,webpage,{'@type':'BreadcrumbList',itemListElement:crumbs.map((v,i)=>({'@type':'ListItem',position:i+1,...v}))}];
  if(kind==='service'){
    const offer=services.find(o=>o.id===p.id);
    graph.push({'@type':'Service','@id':origin+path(p)+'#service',name:p.h1,description:p.description,url:origin+path(p),provider:{'@id':organization['@id']},areaServed:{'@type':'Country',name:'Россия'},...(offer?{offers:{'@type':'Offer',url:origin+path(p),priceCurrency:'RUB',description:offer.price+'. '+offer.terms,priceSpecification:{'@type':'PriceSpecification',minPrice:Number(offer.priceValue),priceCurrency:'RUB'}}}:{})});
    graph.push({'@type':'FAQPage',mainEntity:p.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});
  }
  if(kind==='article'){
    graph.push({'@type':'BlogPosting','@id':origin+path(p)+'#article',headline:p.h1,description:p.description,datePublished:date,dateModified:date,author:{'@id':organization['@id']},publisher:{'@id':organization['@id']},mainEntityOfPage:{'@id':webpage['@id']},image:origin+p.image,inLanguage:'ru-RU',isAccessibleForFree:true});
    $('head').append('<meta property="article:published_time" content="'+date+'"><meta property="article:modified_time" content="'+date+'">');
  }
  if(kind==='case')graph.push({'@type':'CreativeWork',name:p.h1,description:p.description,url:origin+path(p),creator:{'@id':organization['@id']},image:origin+p.image,inLanguage:'ru-RU'});
  $('head').append('<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':graph},null,2)+'</script>');
  $('main').replaceWith(main);$('body').addClass('surface-soft seo-theme');
  $('.mobile-menu__nav a').removeClass('is-active').filter('[href="'+groupPath+'"]').addClass('is-active');
  return $.html();
}
for(const p of servicePages)await fs.writeFile(p.slug+'.html',renderPage(p,'service',serviceMain(p)));
for(const p of newArticles)await fs.writeFile(p.slug+'.html',renderPage(p,'article',articleMain(p)));
for(const p of casePages)await fs.writeFile(p.slug+'.html',renderPage(p,'case',caseMain(p)));

async function patch(file,fn){
  const html=await fs.readFile(file,'utf8'),$=load(html,{sourceCodeLocationInfo:true}),edits=[];
  const replace=(node,text)=>{if(!node)throw Error('Missing fragment: '+file);const l=node.sourceCodeLocation;edits.push({start:l.startOffset,end:l.endOffset,text});};
  const append=(node,text)=>{const start=node.sourceCodeLocation.endTag.startOffset;edits.push({start,end:start,text});};
  await fn($,replace,append);let result=html;
  for(const e of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,e.start)+e.text+result.slice(e.end);
  await fs.writeFile(file,result);
}
const addCss=($,replace,append)=>{const links=$('link[href^="/seo-pages.css"]').toArray();if(!links.length)append($('head')[0],css);else {replace(links[0],css);links.slice(1).forEach(n=>replace(n,''));}};
const blogCard=a=>'<a class="blog-feature seo-blog-card" href="'+path(a)+'"><div class="seo-blog-image"><img src="'+(a.image||service(a.service).image)+'" alt="" width="1200" height="800" loading="lazy" decoding="async"></div><div class="blog-feature__body"><div class="blog-feature__meta"><span>'+esc(a.category||service(a.service).h1)+'</span></div><h2>'+esc(a.h1)+'</h2><p>'+esc(a.description)+'</p><span class="blog-feature__read"><i>Читать</i></span></div></a>';
await patch('blog.html',($,replace,append)=>{
  const ordered=[...newArticles.filter(a=>a.guide),...newArticles.filter(a=>!a.guide),...oldArticles];
  replace($('.blog-index__grid')[0],'<div class="blog-index__grid">'+ordered.map(blogCard).join('')+'</div>');addCss($,replace,append);
  const schema=JSON.parse($('script[type="application/ld+json"]').first().text());
  schema.mainEntity={...schema.mainEntity,numberOfItems:articles.length,itemListElement:ordered.map((a,i)=>({'@type':'ListItem',position:i+1,url:origin+path(a)}))};
  replace($('script[type="application/ld+json"]')[0],'<script type="application/ld+json">'+JSON.stringify(schema,null,2)+'</script>');
});
await patch('portfolio.html',($,replace,append)=>{
  replace($('main')[0],'<main class="seo-page seo-portfolio">'+breadcrumb([{name:'Портфолио'}])+'<header class="seo-article-head"><p class="seo-eyebrow">Реальные проекты</p><h1>То, что можно посмотреть</h1><p class="seo-lead">Задача, решение и работающий интерфейс. В каждом проекте отдельно показываем, что сделано и какие данные на экранах демонстрационные.</p></header>'+casePages.map(c=>'<article class="seo-case-teaser portfolio-project" id="'+c.id+'"><a class="seo-case-teaser__image" href="'+path(c)+'"><img src="'+c.image+'" alt="'+esc(c.h1)+'" width="1200" height="800" loading="lazy" decoding="async"></a><div><p class="seo-eyebrow">'+(c.id==='mentori'?'Собственный продукт':'Реализованный проект')+'</p><h2><a href="'+path(c)+'">'+esc(c.h1)+'</a></h2><p>'+esc(c.lead)+'</p><a class="air-secondary" href="'+path(c)+'">Посмотреть кейс</a></div></article>').join('')+'</main>');addCss($,replace,append);
  replace($('script[type="application/ld+json"]').first()[0],'<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',url:origin+'/portfolio',name:'Портфолио MENTORI TECHNOLOGIES',mainEntity:{'@type':'ItemList',numberOfItems:3,itemListElement:casePages.map((c,i)=>({'@type':'ListItem',position:i+1,url:origin+path(c),name:c.h1}))}},null,2)+'</script>');
});
for(const file of ['about.html','contact.html'])await patch(file,($,replace,append)=>{
  const geo='<section class="seo-geography" id="geography"><h2>Работаем по всей России</h2><p>Разрабатываем системы, сайты и ботов, помогаем с рекламой и поисковым продвижением удалённо. Обсуждение, согласование и показ результата проходят онлайн. Физическое присутствие клиента в одном городе с нами не требуется.</p><a href="/services">Направления работы</a></section>';
  if($('#geography').length)replace($('#geography')[0],geo);
  else if($('main').length)append($('main')[0],geo);
  else replace($('footer.foot')[0],geo+'\n'+$.html($('footer.foot')));
  addCss($,replace,append);
});
for(const a of oldArticles)await patch(a.slug+'.html',($,replace,append)=>{
  const block='<section class="seo-old-related" data-seo-related>'+serviceLink(service(a.service))+relatedArticles(service(a.service).articles.filter(slug=>slug!==a.slug))+'</section>';
  if($('[data-seo-related]').length)replace($('[data-seo-related]')[0],block);else append($('main')[0],block);addCss($,replace,append);
});
await patch('index.html',($,replace)=>$('script[type="application/ld+json"]').each((_,n)=>{
  const schema=JSON.parse($(n).text());for(const entity of schema['@graph']||[])if(entity['@type']==='Organization')entity.areaServed={'@type':'Country',name:'Россия'};
  replace(n,'<script type="application/ld+json">'+JSON.stringify(schema,null,2)+'</script>');
}));
const sitemap=load(await fs.readFile('sitemap.xml','utf8'),{xmlMode:true});
const changed=['/','/services','/blog','/portfolio','/about','/contact',...articles.map(path),...servicePages.map(path),...casePages.map(path)];
for(const route of changed){let node=sitemap('url').filter((_,n)=>sitemap(n).find('loc').text()===origin+route);if(!node.length){node=sitemap('<url><loc></loc><lastmod></lastmod></url>');node.find('loc').text(origin+route);sitemap('urlset').append(node);}node.find('lastmod').text(date);}
await fs.writeFile('sitemap.xml',sitemap.xml());
const llms=await fs.readFile('llms.txt','utf8'),marker='## Направления и материалы, 25 октября 2026';
const extra='\n'+marker+'\n\nРаботаем удалённо по всей России.\n'+[...servicePages,...casePages,...newArticles].map(p=>'- '+p.h1+': '+origin+path(p)).join('\n')+'\n';
await fs.writeFile('llms.txt',(llms.includes(marker)?llms.slice(0,llms.indexOf(marker)).trimEnd():llms.trimEnd())+'\n'+extra);
console.log('SEO: 7 service pages, 3 case pages, 7 articles; internal links, Russia and sitemap updated.');
