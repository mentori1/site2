import fs from 'node:fs/promises';
import { servicePages } from '../src/seo-services.mjs';

const folder='../reports/seo-expansion-20261025';
const previous=JSON.parse(await fs.readFile('../reports/seo-implementation-20261025/semantic-core.json','utf8'));
const original=JSON.parse(await fs.readFile('../reports/seo-implementation-20261025/wordstat-raw.json','utf8'));
const extra=JSON.parse(await fs.readFile(folder+'/wordstat-expansion.json','utf8'));
const normalize=s=>s.toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();
const route=id=>'/'+servicePages.find(p=>p.id===id).slug;
const routeRules={
  system:[['construction',/строит/],['manufacturing',/производств/],['customer-orders',/учет.*клиент|клиент.*учет|учет.*заказ/],['sales-automation',/автоматизац.*продаж|отдела продаж|воронки/]],
  studio:[['tutor',/репетитор/]],
  websites:[['landing',/лендинг|одностраничн/],['corporate-site',/корпоратив|сайт.*компани|сайт.*организац/],['catalog-site',/сайт.*каталог|каталог.*сайт/]],
  bots:[['mini-app',/mini app|мини.прилож/],['booking-bot',/запис|расписан|бронир/],['lead-bot',/заяв|лид/]],
  direct:[['direct-audit',/аудит/],['direct-management',/ведени/],['direct-setup',/настройк|запуск|создани.*реклам/]],
  avito:[['avito-packaging',/оформлен|упаковк/],['avito-management',/ведени/]],
  seo:[['seo-audit',/аудит/],['technical-seo',/технич/]]
};
const rows=new Map(previous.queries.map(q=>{
  const match=q.intent==='коммерческий'&&routeRules[q.direction]?.find(([,re])=>re.test(q.query));
  return [q.query,{...q,target:match?route(match[0]):q.target,evidenceType:'таблица Вордстата'}];
}));
const reviewed={
  construction:['crm для строительства','crm система для строительства'],
  manufacturing:['crm для производства','crm для мебельного производства','crm система для мебельного производства'],
  'corporate-site':['корпоративный сайт','разработка корпоративного сайта','разработка корпоративного сайта цена','разработка корпоративного сайта под ключ'],
  'catalog-site':['разработка сайта каталога'],
  landing:['разработка лендинга','разработка лендинга цена','разработка лендинга под ключ'],
  'booking-bot':['бот для записи клиентов','телеграм бот для записи клиентов','бот для записи клиентов в телеграмм'],
  'lead-bot':['бот для приема заявок','телеграм бот для заявок','чат бот для приема заявок','бот для принятия заявок в тг','бот для автоприема заявок в тг','бот для приема заявок в telegram'],
  'mini-app':['telegram mini app','разработка mini app','разработка telegram mini app'],
  'direct-setup':['настройка яндекс директ','заказать настройку яндекс директ'],
  'direct-management':['ведение яндекс директ','ведение контекстной рекламы яндекс директ','цена ведения яндекс директ'],
  'direct-audit':['аудит яндекс директ','аудит рекламы яндекс директ','аудит рекламной кампании яндекс директ'],
  'avito-packaging':['оформление объявления на авито','оформление авито профиля'],
  'avito-management':['ведение авито','ведение аккаунта авито','ведение авито стоимость'],
  'seo-audit':['seo аудит сайта','seo аудит сайта цена','seo аудит сайта услуги'],
  'technical-seo':['техническая оптимизация сайта'],
  tutor:['crm для репетитора']
};
const accepted=new Map(Object.entries(reviewed).flatMap(([id,queries])=>queries.map(q=>[q,id])));
for(const batch of [...original.batches,...extra.batches]){
  if(!batch.url?.includes('region=225')||!normalize(batch.summary||'').includes(normalize(batch.seed)))continue;
  const period=batch.summary.match(/за (\d{2}\.\d{2}\.\d{4})\s*[–-]\s*(\d{2}\.\d{2}\.\d{4})/);
  if(!period)continue;
  const details=batch.rows.map(([phrase,count])=>({query:normalize(phrase),frequency:Number(count.replace(/\D/g,'')),evidenceType:'таблица Вордстата'}));
  const seed=normalize(batch.seed),summaryCount=batch.summary.match(/:\s*([\d\s]+)(?:\n|$)/);
  if(accepted.has(seed)&&!details.some(r=>r.query===seed)&&summaryCount)details.push({query:seed,frequency:Number(summaryCount[1].replace(/\D/g,'')),evidenceType:'итог маски, без подробной выдачи'});
  for(const item of details){
    const id=accepted.get(item.query);
    if(!id||!item.frequency)continue;
    const page=servicePages.find(p=>p.id===id);
    rows.set(item.query,{...item,direction:page.parent,intent:'коммерческий',frequencyType:'широкая, без операторов',periodFrom:period[1],periodTo:period[2],region:'Россия',regionId:225,seed:batch.seed,source:batch.url,target:route(id)});
  }
}
const queries=[...rows.values()].sort((a,b)=>a.target.localeCompare(b.target)||b.frequency-a.frequency);
const columns=['query','direction','intent','frequency','frequencyType','periodFrom','periodTo','region','target','evidenceType','seed','source'];
const csv='\uFEFF'+columns.join(';')+'\n'+queries.map(q=>columns.map(k=>'"'+String(q[k]??'').replace(/"/g,'""')+'"').join(';')).join('\n')+'\n';
const coverage=servicePages.map(p=>({id:p.id,label:p.label||p.h1,url:route(p.id),parent:p.parent||null,queries:queries.filter(q=>q.target===route(p.id)).length}));
if(coverage.some(c=>!c.queries))throw Error('No verified query evidence: '+coverage.filter(c=>!c.queries).map(c=>c.id).join(', '));
await fs.writeFile(folder+'/semantic-routing.csv',csv);
await fs.writeFile(folder+'/semantic-routing.json',JSON.stringify({collectedAt:'2026-10-25',limitations:extra.limitations,originalQueries:previous.selectedCount,selectedCount:queries.length,coverage,queries},null,2));
console.log(JSON.stringify({queries:queries.length,landings:coverage.length,withoutEvidence:coverage.filter(c=>!c.queries)},null,2));
