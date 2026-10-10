import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { services, renderServicePage, renderHomeServices } from '../src/service-catalog.mjs';

// Source offsets keep the existing menu, footer and consent code untouched.
for (const file of ['services.html','index.html']) {
  const html=await fs.readFile(file,'utf8');
  const $=load(html,{sourceCodeLocationInfo:true});
  const edits=[];
  const replace=(node,text)=>{
    const loc=node.sourceCodeLocation;
    edits.push({start:loc.startOffset,end:loc.endOffset,text});
  };
  const css='<link rel="stylesheet" href="/service-catalog.css?v=20261010-2">';
  if ($('link[href^="/service-catalog.css"]').length) replace($('link[href^="/service-catalog.css"]')[0],css);
  else {
    const offset=$('head')[0].sourceCodeLocation.endTag.startOffset;
    edits.push({start:offset,end:offset,text:css+'\n'});
  }
  const version=file==='index.html'?'59':'57';
  $('script[src^="main.min.js"]').each((_,node)=>replace(node,'<script src="main.min.js?v='+version+'" defer></script>'));
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
      serviceType:['Системы учёта для бизнеса',...services.map(s=>s.title)],
      hasOfferCatalog:{'@type':'OfferCatalog',name:'Услуги MENTORI TECHNOLOGIES',
        itemListElement:[
          {'@type':'Offer',name:'Система учёта для бизнеса',description:'Индивидуальная стоимость после согласования задачи.'},
          ...services.map(s=>({'@type':'Offer',name:s.title,price:s.priceValue,priceCurrency:'RUB',url:'https://mentorios.tech/services#'+s.id,description:s.price+'. '+s.terms}))
        ]},
      inLanguage:'ru-RU'
    };
    replace($('script[type="application/ld+json"]')[0],'<script type="application/ld+json">'+JSON.stringify(schema,null,2)+'</script>');
  } else {
    replace($('.home-offers,#internal-ops')[0],renderHomeServices());
    replace($('#hero')[0],(await fs.readFile('src/hero.html','utf8')).trim());
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
replaceArticle(articleDom('#price > p').first()[0],'<p>Ведение Яндекс Директа в MENTORI TECHNOLOGIES стоит <strong>7 500 рублей в месяц</strong>. Стоимость первоначальной настройки согласуем после обсуждения задачи.</p>');
articleDom('#faq details').each((_,node)=>{
  if(articleDom(node).find('summary').text()==='Сколько стоит ведение Яндекс Директ?') {
    replaceArticle(articleDom(node).find('p')[0],'<p>Ведение стоит 7 500 рублей в месяц. Рекламный бюджет оплачивается отдельно, стоимость первоначальной настройки согласуем.</p>');
  }
});
replaceArticle(articleDom('.article-cta > span')[0],'<span>ведение 7 500 ₽ / месяц</span>');
articleDom('script[type="application/ld+json"]').each((_,node)=>{
  const schema=JSON.parse(articleDom(node).text());
  const walk=value=>{
    if(!value||typeof value!=='object') return;
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
    sitemap(node).find('lastmod').text('2026-10-10');
});
await fs.writeFile('sitemap.xml',sitemap.xml());
console.log('Service catalog, homepage service links and current Direct fee generated.');
