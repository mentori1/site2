import fs from 'node:fs/promises';
import { load } from 'cheerio';

const origin='https://mentorios.tech';
const brand='MENTORI TECHNOLOGIES';
const alternateName=['Mentori','Ментори','Mentory Technologies'];
const preview=origin+'/assets/mentori-technologies-preview-2026.png';
const organization={
  '@type':'Organization','@id':origin+'/#organization',name:brand,alternateName,
  url:origin+'/',telephone:'+79996693419',email:'mentraos@mail.ru',
  logo:{'@type':'ImageObject',url:origin+'/assets/favicon-512.png',width:512,height:512,caption:brand},
  areaServed:{'@type':'Country',name:'Россия'},
  sameAs:['https://t.me/Mentori_Re','https://max.ru/u/f9LHodD0cOKBPM0dbjrb5ezQXBmCYH_aXZDfeNXg5-SMxcV_laJVpwlyBO0']
};
const website={'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:brand,alternateName,inLanguage:'ru-RU',publisher:{'@id':organization['@id']}};
await fs.copyFile('assets/favicon.svg','favicon.svg');

for(const file of (await fs.readdir('.')).filter(f=>f.endsWith('.html')&&!f.startsWith('yandex_'))){
  const html=await fs.readFile(file,'utf8'),$=load(html,{sourceCodeLocationInfo:true}),edits=[];
  const replace=(node,text)=>edits.push({start:node.sourceCodeLocation.startOffset,end:node.sourceCodeLocation.endOffset,text});
  const route=file==='index.html'?'/':'/'+file.slice(0,-5),url=origin+route;
  let title=$('head > title').text().trim();
  if(!title.toUpperCase().includes(brand))title=title.replace(/\s*\|\s*(Mentori|Кейс)$/i,'')+' | '+brand;
  const description=$('meta[name="description"]').attr('content');
  const first=$('script[type="application/ld+json"]').first()[0];
  const schema=first?JSON.parse($(first).text()):{'@graph':[]};
  const graph=schema['@graph']||[schema];
  if(!schema['@graph'])delete schema['@context'];
  const questions=$('.seo-faq details,.article-faq details,.offer-questions details').toArray().map(node=>({
    '@type':'Question',name:$(node).find('summary').text().trim(),
    acceptedAnswer:{'@type':'Answer',text:$(node).find('p').text().trim()}
  }));
  if(questions.length){
    const faq=graph.find(node=>node['@type']==='FAQPage');
    if(faq)faq.mainEntity=questions;
    else graph.push({'@type':'FAQPage',mainEntity:questions});
  }
  for(const entity of [organization,website]){
    const index=graph.findIndex(n=>n['@id']===entity['@id']||n['@type']===entity['@type']);
    if(index<0)graph.push(entity);else graph[index]={...graph[index],...entity};
  }
  let webpage=graph.find(n=>n['@type']==='WebPage'||n['@type']==='CollectionPage');
  if(!webpage){webpage={'@type':'WebPage','@id':url+'#webpage'};graph.push(webpage);}
  Object.assign(webpage,{url,name:title,description,inLanguage:'ru-RU',isPartOf:{'@id':website['@id']}});
  const markup='<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':graph},null,2)+'</script>';
  if(first)replace(first,markup);
  else {const end=$('head')[0].sourceCodeLocation.endTag.startOffset;edits.push({start:end,end,text:markup});}
  $('head > title').text(title);replace($('head > title')[0],$.html($('head > title')));
  for(const [selector,attr,value] of [
    ['link[rel="canonical"]','href',url],
    ['link[rel="alternate"][hreflang]','href',url],
    ['link[rel="icon"][type="image/svg+xml"]','href','/favicon.svg']
  ])$(selector).each((_,node)=>{$(node).attr(attr,value);if(selector.includes('image/svg+xml'))$(node).attr('sizes','any');replace(node,$.html(node));});
  const metas=[
    {property:'og:title',content:title},{property:'og:description',content:description},
    {property:'og:url',content:url},{property:'og:site_name',content:brand},
    {property:'og:locale',content:'ru_RU'},
    {property:'og:image',content:preview},{property:'og:image:secure_url',content:preview},
    {property:'og:image:type',content:'image/png'},{property:'og:image:width',content:'1200'},
    {property:'og:image:height',content:'630'},{property:'og:image:alt',content:brand},
    {name:'twitter:card',content:'summary_large_image'},{name:'twitter:title',content:title},
    {name:'twitter:description',content:description},{name:'twitter:image',content:preview},
    {name:'twitter:image:alt',content:brand}
  ];
  for(const meta of metas){
    const key=meta.property?'property':'name',nodes=$(`meta[${key}="${meta[key]}"]`).toArray();
    if(nodes.length){$(nodes[0]).attr('content',meta.content);replace(nodes[0],$.html(nodes[0]));nodes.slice(1).forEach(n=>replace(n,''));}
    else {const end=$('head')[0].sourceCodeLocation.endTag.startOffset;edits.push({start:end,end,text:$.html($('<meta>').attr(meta))});}
  }
  let result=html;
  for(const edit of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,edit.start)+edit.text+result.slice(edit.end);
  await fs.writeFile(file,result.replace(/[\t ]+$/gm,''));
}
console.log('Search metadata: consistent brand, favicon, social preview, canonical and hreflang on every page.');
