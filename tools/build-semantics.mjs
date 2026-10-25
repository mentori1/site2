import fs from 'node:fs/promises';
import { servicePages } from '../src/seo-services.mjs';

const folder='../reports/seo-implementation-20261025';
const raw=JSON.parse(await fs.readFile(folder+'/wordstat-raw.json','utf8'));
const normalize=s=>s.toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();
const sources={
  system:['автоматизация бизнеса','автоматизация малого бизнеса','система учета клиентов','учет клиентов','автоматизация продаж','учет клиентов и заказов'],
  studio:['учет занятий','crm для студии','программа для учета занятий','учет абонементов','программа для студии танцев','учет посещений','программа для студии','автоматизация студии'],
  websites:['разработка сайтов','сайт под ключ','заказать сайт','создание сайта компании','разработка лендинга','создание сайтов'],
  bots:['разработка телеграм ботов','телеграм бот для бизнеса','разработка чат ботов','бот для записи','телеграм бот на заказ','бот для бизнеса','разработка ботов'],
  direct:['настройка яндекс директ','ведение яндекс директ','контекстная реклама'],
  avito:['услуги авитолога','продвижение на авито','скидка на продвижение авито','авитолог','оформление авито'],
  seo:['seo продвижение','seo аудит сайта','услуги seo']
};
const article={system:'blog-perehod-iz-excel-v-sistemu',studio:'blog-uchet-abonementov',websites:'blog-kakoj-sajt-nuzhen-biznesu',bots:'blog-scenarii-telegram-bota',direct:'blog-ekonomiya-yandex-direct',avito:'blog-ekonomiya-avito',seo:'blog-seo-posadochnye-stranicy'};
const generalExclude=/вакан|зарплат|обучен|курсы|курс |диплом|реферат|учебник|лекци|самоучител|скачать|бесплатн|самостоятельно|своими руками|аптек|лекарств|пицц|цветы|подарк|билет|суши|доставка еды|госуслуг|резюме|работа авитологом|как стать|с нуля|работа без опыта|заработ|профессия|кейколлектор|key collector|python|питон|github|css |html |java|тест ответ|нто |вгу |инн |адрес |телефон |eduson|эдюсон|bizlever|бизлевер|автоматизация бизнеса краснодар тургенева|ооо |ао |фортуна|fortuna|сигма |контур|содействие|саб[иы]|saby|тегас|таграс|светлана|елена |сергей |анастасия|иван |дмитрий |александр |михаил |андрей |филин|алексрович|alexrovich|титов|маргарита|михайлов|рейтинг авитолог|инфо torrow/;
function reject(q,id){
  if(generalExclude.test(q))return 'Нерелевантное намерение, обучение или чужой бренд';
  if(id==='studio'&&!/учет занятий|учет индивидуальных занятий|учет посещаемости занятий|учет посещения приложение|приложение учет занятий|crm.*(танц|фитнес)|учет абонементов|программа.*учет.*посещен/.test(q))return 'Не подтверждён запрос на систему учёта занятий';
  if(/twin|barhan|\bmax\b|дикиди|мастерс|masters|^яндекс запись|битрикс|снять.*учета|гибдд|центр автоматизации бизнеса|предназначена для|таблица для учета клиентов в$/.test(q))return 'Навигация к чужому продукту, другой платформе или учебный запрос';
  if(/макет.*сайт|\d+ сайтов для|теги для|заказы на разработку|история создания|как сделать сайт|вордпресс|gpt |гугл сайт|проверка создания|средство для разработки|оквэд|авитолог отзывы|лучший авитолог|продвижение на авито отзывы|франшиз|отзывы о |отзывы на /.test(q))return 'Чужая репутация, поиск инструмента или не покрытая тема';
  if(/учащ|презентаци|преподаван|трансляц|танго|умскул|зачет|написани|где брать заказы|сколько зарабатыва|как отменить|как отключить|инструменты|сервисы seo|seo ru|seo система|система seo|geo seo|шаги создания|способы создания|технология создания|работа по созданию|темы для создания|макет сайта|команды для создания|заказы на создание|программы для разработки|шаблон для создания|редактор для создания|правила создания|основы создания|перед созданием|искусственный интеллект|создание мчд|wordpress|lovable|создание сайта с помощью|ai для создания|что нужно для создания|договор на |план разработки|создание собственного|пример создания|разработка интернет приложений|разработка сайтов приложений/.test(q))return 'Учебная, навигационная или не покрытая страницами тема';
  if(id==='studio'&&/журнал|логопед|школ|доу|техникум|гигтест|долголетие|тренировоч|особенност|практических занятий|учащихся|расписание занятий составляется|спортивн.*подготов|учеб|посещени.*сайт|сайт.*посещени|сотрудник|рабочего времени|студент|психолог|тату|музык|звукозапис|дизайн|репетиц|часы|вокал|визаж|фотостуд|universe|юниверс|альтеж|yclients|dikidi|бьюти|маникюр|салон|парикмах|ногт|барбер|бров|памятк|статус|законч|распечат|картинк|текст|список|отзыв|календарь|без интернета|объявлен|как вести запись|эксель|excel|таблиц|образец|пдф|pdf|скач|самозапис|автомобил|лучшие программы|контроллер/.test(q))return 'Не система записи и учёта занятий студии';
  if(id==='websites'&&!/разработк.*(сайт|лендинг)|создани.*(сайт|лендинг)|сайт.*под ключ|лендинг.*(цен|стоим)|^заказать сайт$|заказать.*(разработ|создан|сайт визитк)/.test(q))return 'Не запрос на разработку сайта';
  if(id==='websites'&&/ии |с ии|нейросет|самому|онлайн|информатик|майнкрафт|мaйнкрафт|класс|блокнот|поддельн|дата создания|конструктор|платформ|тильд|код |html|пром[пт]|сервис.*создани|программ.*создани|приложени.*создани|систем.*создани|хранение данных|православ|яндекс создание|создани.*сайт.*яндекс|динамических/.test(q))return 'Самостоятельная разработка, учебное задание или поиск инструмента';
  if(id==='bots'&&/виз|мфц|емиас|поликлин|больниц|испан|франц|итал|тильд|макс|запис.*(врач|звонк|голос|аудио|виде)|расшифр|бот.*музык|на голос|записать голос|вконтакт|vk |дискорд|discord|игр|ферм|трейд|бирж|схема|техническое задание|библиотек|телебот/.test(q))return 'Готовый сервис, медиа, учебная разработка или другая платформа';
  if(id==='direct'&&/google|гугл|вконтакт|в контакте|vk |яндекс музыка|полина|бондарев|начинающ|менеджер по|отключить контекст|таргетированн/.test(q))return 'Другая платформа, обучение или навигационный запрос';
  if(id==='avito'&&/доставк|работа без|помощник|инструменты авитолог|професс|договор.*(образец|скач)|оформление.*(заказа|посылк)|сертификат|авитолог.*(курс|школ)/.test(q))return 'Не услуга продвижения';
  if(id==='seo'&&/novelit|seotica|kokoc|fortuna|miralinks|rookee|keys so|click ru|кокос|сеотика|новелит/.test(q))return 'Запрос чужого бренда';
  if(id==='system'&&/касс|фискальн|бухгалтер|банк|больниц|туристич|ресторан|каталог.*фирм|пенсион|воинск/.test(q))return 'Не заявленный состав услуги';
  return '';
}
const byQuery=new Map(),excluded=[];
for(const batch of raw.batches){
  const id=Object.entries(sources).find(([,masks])=>masks.includes(batch.seed))?.[0];
  if(!id)continue;
  const period=batch.summary?.match(/за (\d{2}\.\d{2}\.\d{4})\s*[–-]\s*(\d{2}\.\d{2}\.\d{4})/);
  for(const [phrase,count] of batch.rows){
    const q=normalize(phrase),frequency=Number(count.replace(/\D/g,''));
    const reason=reject(q,id);
    if(reason){excluded.push({query:q,seed:batch.seed,reason});continue;}
    if(!frequency||!period)continue;
    const intent=/^(как|что|зачем|почему|какой|когда)| что |пример|скидк|промокод|аудит|сравн|этапы|стоимость.*заявк|что входит/.test(q)?'информационный':'коммерческий';
    const row={query:q,direction:id,intent,frequency,frequencyType:'широкая, без операторов',periodFrom:period[1],periodTo:period[2],region:'Россия',regionId:225,seed:batch.seed,source:batch.url,target:'/'+(intent==='информационный'?article[id]:servicePages.find(s=>s.id===id).slug)};
    const old=byQuery.get(q);if(!old||row.frequency>old.frequency)byQuery.set(q,row);
  }
}
const candidates=[...byQuery.values()].sort((a,b)=>b.frequency-a.frequency||a.query.localeCompare(b.query,'ru'));
const quotas={system:40,studio:20,websites:60,bots:35,direct:60,avito:45,seo:40},selected=[];
for(const [id,limit] of Object.entries(quotas))selected.push(...candidates.filter(q=>q.direction===id).slice(0,limit));
const chosen=new Set(selected.map(r=>r.query));
for(const row of candidates){if(selected.length>=300)break;if(!chosen.has(row.query)){selected.push(row);chosen.add(row.query);}}
selected.sort((a,b)=>a.direction.localeCompare(b.direction)||b.frequency-a.frequency);
const columns=['query','direction','intent','frequency','frequencyType','periodFrom','periodTo','region','target','seed','source'];
const csv=rows=>'\uFEFF'+columns.join(';')+'\n'+rows.map(r=>columns.map(k=>'"'+String(r[k]??'').replace(/"/g,'""')+'"').join(';')).join('\n')+'\n';
await fs.writeFile(folder+'/semantic-core.json',JSON.stringify({collectedAt:raw.collectedAt,region:'Россия',source:raw.source,limitations:raw.limitations,rawRows:raw.batches.reduce((n,b)=>n+b.rows.length,0),candidateCount:candidates.length,selectedCount:selected.length,queries:selected},null,2));
await fs.writeFile(folder+'/semantic-core.csv',csv(selected));
await fs.writeFile(folder+'/semantic-candidates.csv',csv(candidates));
await fs.writeFile(folder+'/excluded-queries.json',JSON.stringify(excluded,null,2));
console.log(JSON.stringify({masks:raw.batches.length,rawRows:raw.batches.reduce((n,b)=>n+b.rows.length,0),candidates:candidates.length,selected:selected.length,byDirection:Object.fromEntries(Object.keys(quotas).map(id=>[id,selected.filter(q=>q.direction===id).length]))},null,2));
