import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { services, renderServicePage, renderHomeServices } from '../src/service-catalog.mjs';
import { homeScenes } from '../src/home-scenes.mjs';
import { servicePages } from '../src/seo-services.mjs';

const heroPreview=process.env.MENTORI_HERO_PREVIEW==='1';
const hero = load(await fs.readFile(heroPreview?'src/hero.html':'src/hero-published.html','utf8'),{},false);
if(heroPreview) for (const [id,file] of Object.entries({
  arrow:'arrow-up-right',globe:'globe',home:'house',inbox:'inbox',users:'users',
  layers:'layers',folder:'folder',check:'check',wallet:'wallet',box:'box',
  network:'network',chart:'chart-no-axes-combined',search:'search',bell:'bell',settings:'settings'
})) {
  const icon=load(await fs.readFile(`assets/icons/system/${file}.svg`,'utf8'),{xmlMode:true});
  const symbol=hero('<symbol></symbol>').attr({id:`system-${id}`,viewBox:icon('svg').attr('viewBox')});
  symbol.append(icon('svg').children().toArray());
  hero('[data-system-icons]').append(symbol);
}

// Source offsets keep the existing menu, footer and consent code untouched.
for (const file of ['services.html','index.html']) {
  const html=await fs.readFile(file,'utf8');
  const $=load(html,{sourceCodeLocationInfo:true});
  const edits=[];
  const replace=(node,text)=>{
    const loc=node.sourceCodeLocation;
    edits.push({start:loc.startOffset,end:loc.endOffset,text});
  };
  const css='<link rel="stylesheet" href="/service-catalog.css?v=20261010-5">';
  if ($('link[href^="/service-catalog.css"]').length) replace($('link[href^="/service-catalog.css"]')[0],css);
  else {
    const offset=$('head')[0].sourceCodeLocation.endTag.startOffset;
    edits.push({start:offset,end:offset,text:css+'\n'});
  }
  const version=file==='index.html'?'60':'57';
  $('script[src^="main.min.js"]').each((_,node)=>replace(node,'<script src="main.min.js?v='+version+'" defer></script>'));
  const posters='<link rel="stylesheet" href="/service-posters.css?v=20261010-4">';
  if($('link[href^="/service-posters.css"]').length) replace($('link[href^="/service-posters.css"]')[0],posters);
  else edits.push({start:$('head')[0].sourceCodeLocation.endTag.startOffset,end:$('head')[0].sourceCodeLocation.endTag.startOffset,text:posters+'\n'});
  if(file==='services.html') {
    if($('.offer-page').length) replace($('.offer-page')[0],renderServicePage());
    else {
      const start=$('.page-hero')[0].sourceCodeLocation.startOffset;
      const end=$('.cta')[0].sourceCodeLocation.endOffset;
      edits.push({start,end,text:renderServicePage()});
    }
    const title='Системы, сайты, Telegram-боты и реклама | MENTORI TECHNOLOGIES';
    const description='Порядок в клиентах, заказах и оплатах. Учёт занятий, Telegram-боты, сайты от 5 000 ₽, Яндекс Директ 7 500 ₽ в месяц, Авито и SEO.';
    replace($('title')[0],'<title>'+title+'</title>');
    for(const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]']) {
      const node=$(selector)[0];
      const key=$(node).attr('property')?'property':'name';
      replace(node,'<meta '+key+'="'+$(node).attr(key)+'" content="'+description+'">');
    }
    for(const selector of ['meta[property="og:title"]','meta[name="twitter:title"]']) {
      const node=$(selector)[0];
      const key=$(node).attr('property')?'property':'name';
      replace(node,'<meta '+key+'="'+$(node).attr(key)+'" content="'+title+'">');
    }
    const schema={
      '@context':'https://schema.org','@type':'Service',
      '@id':'https://mentorios.tech/services#service',
      name:'Системы, сайты и боты для бизнеса',
      url:'https://mentorios.tech/services',description,
      provider:{'@id':'https://mentorios.tech/#organization'},
      areaServed:{'@type':'Country',name:'Россия'},
      serviceType:['Системы учёта для бизнеса',...services.map(s=>s.title)],
      hasOfferCatalog:{'@type':'OfferCatalog',name:'Услуги MENTORI TECHNOLOGIES',
        itemListElement:[
          {'@type':'Offer',name:'Система учёта для бизнеса',description:'Индивидуальная стоимость после согласования задачи.'},
          ...services.map(s=>({'@type':'Offer',name:s.title,price:s.priceValue,priceCurrency:'RUB',url:'https://mentorios.tech/'+servicePages.find(p=>p.id===s.id).slug,description:s.price+'. '+s.terms}))
        ]},
      inLanguage:'ru-RU'
    };
    replace($('script[type="application/ld+json"]')[0],'<script type="application/ld+json">'+JSON.stringify(schema,null,2)+'</script>');
  } else {
    const title='MENTORI TECHNOLOGIES — системы, сайты и продвижение бизнеса';
    const description='Сначала наводим порядок в клиентах, заказах и оплатах. Затем подключаем сайты, Telegram-ботов, Яндекс Директ, Авито и SEO. Одна команда для системы и продвижения.';
    replace($('title')[0],'<title>'+title+'</title>');
    for (const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]','meta[property="og:title"]','meta[name="twitter:title"]']) {
      const node=$(selector)[0];
      const key=$(node).attr('property')?'property':'name';
      replace(node,'<meta '+key+'="'+$(node).attr(key)+'" content="'+(selector.includes(':title')?title:description)+'">');
    }
    const schema=JSON.parse($('script[type="application/ld+json"]').first().text());
    for (const entity of schema['@graph']) {
      if (entity['@type']==='WebPage') Object.assign(entity,{name:title,description});
      if (entity['@type']==='Organization') {
        entity.description=description;
        entity.knowsAbout=[...new Set([...entity.knowsAbout,'Разработка сайтов','Яндекс Директ','Продвижение на Авито','SEO-продвижение'])];
      }
    }
    replace($('script[type="application/ld+json"]')[0],'<script type="application/ld+json">'+JSON.stringify(schema,null,2)+'</script>');
    replace($('.home-offers,#internal-ops')[0],renderHomeServices());
    replace($('#hero')[0],hero.root().html().trim());
    if ($('#brandIntro').length) replace($('#brandIntro')[0],'');
    if ($('#production').length) replace($('#production')[0],'');
    $('[data-stack-card] .stack__visual').each((i,node)=>replace(node,'<div class="stack__visual">'+homeScenes[i]+'</div>'));
    const sceneCss='<link rel="stylesheet" href="/home-scenes.css?v=20261010-4">';
    if ($('link[href^="/home-scenes.css"]').length) replace($('link[href^="/home-scenes.css"]')[0],sceneCss);
    else edits.push({start:$('head')[0].sourceCodeLocation.endTag.startOffset,end:$('head')[0].sourceCodeLocation.endTag.startOffset,text:sceneCss+'\n'});
    const heroCss='<link rel="stylesheet" href="/'+(heroPreview?'hero-focus.css?v=20261011-8':'hero-published.css?v=20261025-1')+'">';
    if ($('link[href^="/hero-focus.css"],link[href^="/hero-published.css"]').length) replace($('link[href^="/hero-focus.css"],link[href^="/hero-published.css"]')[0],heroCss);
    else edits.push({start:$('head')[0].sourceCodeLocation.endTag.startOffset,end:$('head')[0].sourceCodeLocation.endTag.startOffset,text:heroCss+'\n'});
    const sceneJs='<script src="/home-scenes.js?v=20261010-2" defer></script>';
    if ($('script[src^="/home-scenes.js"]').length) replace($('script[src^="/home-scenes.js"]')[0],sceneJs);
    else edits.push({start:$('body')[0].sourceCodeLocation.endTag.startOffset,end:$('body')[0].sourceCodeLocation.endTag.startOffset,text:sceneJs+'\n'});
  }
  let result=html;
  for(const edit of edits.sort((a,b)=>b.start-a.start)) result=result.slice(0,edit.start)+edit.text+result.slice(edit.end);
  await fs.writeFile(file,result);
}
// The article quotes the same current management fee, including in its FAQ schema.
const articleFile='blog-yandex-direct-dlya-biznesa.html';
const article=await fs.readFile(articleFile,'utf8');
const articleDom=load(article,{sourceCodeLocationInfo:true});
const articleEdits=[];
const replaceArticle=(node,text)=>{
  const loc=node.sourceCodeLocation;
  articleEdits.push({start:loc.startOffset,end:loc.endOffset,text});
};
const botStatus='Telegram-бот для Яндекс Директа находится в разработке. Планируем отчёты и просмотр статистики, изменение базовых настроек и бюджета, обновление изображений объявлений. Готовность и условия подключения сообщим отдельно.';
replaceArticle(articleDom('#telegram')[0],'<section id="telegram"><h2>Telegram-бот для рекламы: в разработке</h2><p>'+botStatus+'</p><div class="article-feature-grid"><div><span>01</span><b>Отчёты в Telegram</b><p>Планируем автоматические сводки по рекламе и просмотр статистики без перехода в рекламный кабинет.</p></div><div><span>02</span><b>Бюджет и настройки</b><p>Работаем над изменением бюджета и базовых параметров кампаний через бота.</p></div><div><span>03</span><b>Изображения объявлений</b><p>Планируем обновление рекламных изображений прямо из Telegram.</p></div></div><div class="article-callout"><span>Это ещё не готовая услуга</span><p>Сейчас ведение рекламы и отчётность выполняет команда. Возможности бота показаны как планы разработки, а не как доступные функции тарифа.</p></div></section>');
replaceArticle(articleDom('meta[name="description"]')[0],'<meta name="description" content="Что входит в ведение Яндекс Директа за 7 500 рублей в месяц: подготовка, аналитика и отчётность. Telegram-бот для управления рекламой в разработке.">');
replaceArticle(articleDom('.article-cta > p')[0],'<p>Разберём предложение, сайт, аналитику и обработку заявок. Покажем, как устроены ведение рекламы и отчётность.</p>');
replaceArticle(articleDom('#price > p').first()[0],'<p>Ведение Яндекс Директа в MENTORI TECHNOLOGIES стоит <strong>7 500 рублей в месяц</strong>. Стоимость первоначальной настройки согласуем после обсуждения задачи.</p>');
articleDom('#faq details').each((_,node)=>{
  if(articleDom(node).find('summary').text().includes('Telegram-бот')) replaceArticle(articleDom(node).find('p')[0],'<p>'+botStatus+'</p>');
  if(articleDom(node).find('summary').text()==='Сколько стоит ведение Яндекс Директ?') {
    replaceArticle(articleDom(node).find('p')[0],'<p>Ведение стоит 7 500 рублей в месяц. Рекламный бюджет оплачивается отдельно, стоимость первоначальной настройки согласуем.</p>');
  }
});
replaceArticle(articleDom('.article-cta > span')[0],'<span>ведение 7 500 ₽ / месяц</span>');
articleDom('script[type="application/ld+json"]').each((_,node)=>{
  const schema=JSON.parse(articleDom(node).text());
  const walk=value=>{
    if(!value||typeof value!=='object') return;
    if(value['@type']==='BlogPosting') value.description='Ведение Яндекс Директа, аналитика и отчётность. Telegram-бот для управления рекламой находится в разработке.';
    if(value['@type']==='Question'&&value.name?.includes('Telegram-бот')) value.acceptedAnswer.text=botStatus;
    if(value['@type']==='Question'&&value.name==='Сколько стоит ведение Яндекс Директ?')
      value.acceptedAnswer.text='В MENTORI TECHNOLOGIES ведение Яндекс Директа стоит 7 500 рублей в месяц. Рекламный бюджет отдельно, стоимость первоначальной настройки согласуем.';
    Object.values(value).forEach(walk);
  };
  walk(schema);
  replaceArticle(node,'<script type="application/ld+json">'+JSON.stringify(schema,null,2)+'</script>');
});
let updatedArticle=article;
for(const edit of articleEdits.sort((a,b)=>b.start-a.start)) updatedArticle=updatedArticle.slice(0,edit.start)+edit.text+updatedArticle.slice(edit.end);
await fs.writeFile(articleFile,updatedArticle);
const sitemap=load(await fs.readFile('sitemap.xml','utf8'),{xmlMode:true});
sitemap('url').each((_,node)=>{
  if(['https://mentorios.tech/','https://mentorios.tech/services','https://mentorios.tech/blog-yandex-direct-dlya-biznesa'].includes(sitemap(node).find('loc').text()))
    sitemap(node).find('lastmod').text('2026-10-11');
});
await fs.writeFile('sitemap.xml',sitemap.xml());
console.log('Service catalog, homepage service links and current Direct fee generated.');
