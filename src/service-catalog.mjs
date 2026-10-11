// Shared content for the service page, homepage links and structured data.
import { load } from 'cheerio';
const phone = (content, theme = '') => '<div class="offer-phone '+theme+'"><div class="offer-phone__island"></div><div class="offer-phone__screen">'+content+'</div></div>';
const generatedArt = (id, alt, words, caption, logo = '') => '<div class="offer-art offer-art--'+id+' offer-art--generated"><img class="offer-art__image" src="/assets/services/'+({websites:'website',bots:'bot'}[id]||id)+'-device-v2.webp" width="1200" height="800" alt="'+alt+'" loading="lazy" decoding="async">'+(logo?'<img class="offer-art__brand" src="/assets/services/'+logo+'-official.webp" alt="'+(logo==='direct'?'Яндекс Директ':'Авито')+'" width="56" height="56">':'')+(words?'<div class="offer-art__words">'+words+'</div>':'')+'<span class="offer-art__caption">'+caption+'</span></div>';
export const services = [
  {
    id:'studio', title:'Учёт занятий и абонементов', short:'Занятия и студии',
    need:'Когда запись занимает больше времени, чем занятия',
    description:'Ученики записываются через Telegram. Вы видите расписание, оплаты и остаток занятий в одном кабинете.',
    scope:['Танцы, йога, пилатес','Частные преподаватели'],
    price:'15 000 ₽', priceValue:'15000', terms:'Единоразово за готовое решение. Запуск за 10 дней после согласования вашего формата.',
    details:['Клиенты, расписание и история посещений.','Разовые занятия, группы, индивидуальные встречи и абонементы.','Кабинет ученика в Telegram и учёт оплат. Проверка чеков остаётся у преподавателя.'],
    action:'Обсудить студию', caseHref:'/portfolio#studio', caseLabel:'Пример студии',
    visual:'<div class="offer-art offer-art--studio"><span class="offer-art__label">ЗАНЯТИЯ. БЕЗ ПЕРЕПИСОК.</span><div class="offer-art__words">Вы ведёте<br>занятия.<br><em>Не таблицы.</em></div><img class="offer-art__studio-phone" src="/assets/services/studio.webp" width="540" height="1056" alt="Кабинет ученика на телефоне: абонементы и выбор даты занятия" loading="lazy" decoding="async"><span class="offer-art__caption">Реализованный проект · демоданные</span></div>'
  },
  {
    id:'websites', title:'Сайты для бизнеса', short:'Разработка сайтов',
    need:'Когда нужно показать, что вы продаёте',
    description:'Сайт с услугами или каталогом, который удобно открыть с телефона, выбрать предложение и связаться с вами.',
    scope:['Лендинги','Сайты компаний','Каталоги'],
    price:'от 5 000 ₽', priceValue:'5000', terms:'Итоговая стоимость зависит от страниц и функций. Согласуем до начала работы.',
    details:['Структура, тексты, дизайн и разработка.','Мобильная версия, формы и способы связи.','Каталог, фильтры и калькулятор при необходимости. Состав согласуем отдельно.'],
    action:'Обсудить сайт', caseHref:'/portfolio#spektr', caseLabel:'Кейс «Спектр Металла»',
    visual:generatedArt('websites','Каталог Спектра Металла на ноутбуке и iPhone с полноценной строкой состояния','','Визуализация сайта «Спектр Металла»')
  },
  {
    id:'bots', title:'Telegram-боты', short:'Telegram-боты',
    need:'Когда одни и те же вопросы повторяются каждый день',
    description:'Бот отвечает на частые вопросы, помогает записаться, собирает заявки и отправляет уведомления вместо вас.',
    scope:['Заявки','Запись','Уведомления'],
    price:'от 3 000 ₽', priceValue:'3000', terms:'Стоимость зависит от сценария и подключений. Уточняем функции до разработки.',
    details:['Продумываем путь клиента, кнопки и ответы.','Разрабатываем бота, проверяем сценарии и запускаем.','Подключение к вашему учёту и отчёты обсуждаем под задачу.'],
    action:'Обсудить бота',
    visual:generatedArt('bots','iPhone с примером записи через Telegram-бота','Клиент<br>записался.<br><em>Вы не<br>отвлекались.</em>','Демонстрационный сценарий записи')
  },
  {
    id:'direct', title:'Яндекс Директ', short:'Яндекс Директ',
    need:'Когда сайт есть, а о нём ещё не знают',
    description:'Настраиваем рекламу, проверяем запросы и объявления. Вы получаете понятный отчёт: что сделали и что меняем дальше.',
    scope:['Запуск рекламы','Ведение','Отчётность'],
    price:'7 500 ₽ / месяц', priceValue:'7500', terms:'Ведение. Рекламный бюджет отдельно, стоимость первоначальной настройки согласуем.',
    details:['Анализ ниши, запросы, минус-фразы и объявления.','Проверка статистики, тесты и корректировки кампаний.','PDF-отчёт каждые 10 дней. Telegram-бот для отчётности и управления рекламой сейчас в разработке.'],
    extraTitle:'Telegram-бот для рекламы · в разработке', extraText:'Готовим бота, который будет присылать отчёты и показывать, что происходит с рекламой. Планируем базовые настройки, регулировку бюджета и обновление изображений объявлений прямо из Telegram. Подключение обсудим после готовности.',
    action:'Обсудить рекламу', caseHref:'/blog-yandex-direct-dlya-biznesa', caseLabel:'Как ведём рекламу',
    visual:generatedArt('direct','Прототип Telegram-бота для управления рекламой','Куда уходит<br><em>рекламный<br>бюджет?</em>','Концепция бота · в разработке','direct')
  },
  {
    id:'avito', title:'Оформление и ведение Авито', short:'Услуги авитолога',
    need:'Когда объявление есть, а предложение не цепляет',
    description:'Упаковываем ваше предложение: заголовки, тексты и изображения. Публикуем объявления, тестируем подачу и следим за обращениями.',
    scope:['Тексты и визуалы','Ведение','Бот для диалогов'],
    price:'5 800 ₽', priceValue:'5800', terms:'Оформление. Дальнейшее ведение за согласованный процент, расходы площадки отдельно.',
    details:['Изучаем нишу и предложения конкурентов.','Готовим оформление и размещаем согласованное количество объявлений.','Сравниваем заголовки и изображения, корректируем подачу по просмотрам и обращениям.'],
    extraTitle:'Бонус при работе с нами: бот для диалогов', extraText:'Настраиваем бота на основе ваших диалогов с клиентами. Он знает ваши услуги, товары и расценки и отвечает по существу, а не одной заготовленной фразой. Перед запуском согласуем базу знаний и сценарии ответов.',
    action:'Обсудить Авито',
    visual:generatedArt('avito','Демонстрационное объявление Авито на iPhone','Объявление<br>заметили.<br><em>Бот ответил.</em>','Пример оформления объявления','avito')
  },
  {
    id:'seo', title:'SEO-продвижение', short:'SEO-продвижение',
    need:'Когда вас должны находить в поиске',
    description:'Исправляем технические ошибки, продумываем структуру и создаём полезные страницы под запросы ваших клиентов.',
    scope:['Аудит','Страницы услуг','Индексация'],
    price:'от 30 000 ₽', priceValue:'30000', terms:'Объём работ согласуем после аудита. Не обещаем фиксированную позицию в поиске.',
    details:['Проверяем доступность страниц и технические ошибки.','Подбираем запросы и улучшаем страницы услуг и товаров.','Работаем с содержанием, индексацией и аналитикой.'],
    action:'Обсудить SEO', caseHref:'/blog-seo-prodvizhenie-saita', caseLabel:'Что входит в SEO',
    visual:'<div class="offer-art offer-art--seo"><span class="offer-art__label">ВАС ИЩУТ. ПОМОЖЕМ НАЙТИ.</span><div class="offer-art__words">Ближе<br><em>к клиенту.</em></div>'+phone('<div class="phone-search"><span>Поиск</span><div class="phone-search__query">ваша услуга в вашем городе</div><small>ВАШСАЙТ.РУ</small><h4>То, что ищет<br>ваш клиент</h4><p>Понятные услуги, условия и ответы на вопросы.</p><div class="phone-search__links"><span>Услуги</span><span>Примеры работ</span><span>Контакты</span></div><hr><p>Полезная страница вместо набора ключевых слов.</p></div>','offer-phone--light')+'<span class="offer-art__caption">Пример страницы, не обещание позиции</span></div>'
  }
];

export const systemVisual = '<figure class="system-preview"><img class="system-preview__generated" src="/assets/services/system-device-v2.webp" width="1200" height="800" alt="Система Mentori: проекты и оплаты на ноутбуке и iPhone" decoding="async" fetchpriority="high"><figcaption>Визуализация интерфейса Mentori. Данные демонстрационные.</figcaption></figure>';

const items = arr => arr.map(i=>'<li>'+i+'</li>').join('');
const posterCopy = {
  studio:{heading:'УЧЁТ<br>ЗАНЯТИЙ',accent:'БЕЗ ТАБЛИЦ',facts:'Запись · Абонементы<br>Оплаты · Расписание'},
  websites:{heading:'САЙТЫ<br>ПОД КЛЮЧ',accent:'ВАС ВИДНО',facts:'Лендинг · Каталог<br>Удобно с телефона'},
  bots:{heading:'TELEGRAM<br>БОТЫ',accent:'РУТИНУ БОТУ',facts:'Ответы · Запись<br>Заявки · Уведомления'},
  direct:{heading:'ЯНДЕКС<br>ДИРЕКТ',accent:'ЗАПУСК И ВЕДЕНИЕ',facts:'Настройка · Тесты<br>Аналитика · Отчётность'},
  avito:{heading:'АВИТО<br>ПОД КЛЮЧ',accent:'ИЗ ПОИСКА В ДИАЛОГ',facts:'Упаковка · Ведение<br>Бот для ответов в бонус'},
  seo:{heading:'SEO<br>ПРОДВИЖЕНИЕ',accent:'ВАС УЖЕ ИЩУТ',facts:'Аудит · Страницы<br>Контент · Индексация'}
};
function renderPoster(s) {
  const p=posterCopy[s.id];
  const visual=s.id==='websites'?'<div class="offer-art offer-art--websites offer-art--generated"><img class="offer-poster__device" src="/assets/services/website-phone-v3.webp" width="733" height="1100" alt="iPhone с каталогом Спектра Металла" loading="lazy" decoding="async"><span class="offer-art__caption">Визуализация сайта «Спектр Металла»</span></div>':s.visual;
  return '<div class="offer-poster offer-poster--'+s.id+'">'+visual+'<div class="offer-poster__paper" aria-hidden="true"></div><div class="offer-poster__motif" aria-hidden="true"><i></i><i></i><i></i></div><div class="offer-poster__brand" aria-hidden="true">MENTORI <small>TECH</small></div><div class="offer-poster__copy"><strong class="offer-poster__headline">'+p.heading+'</strong><b class="offer-poster__accent">'+p.accent+'</b><p>'+p.facts+'</p></div></div>';
}
function renderCard(s) {
  return '<article class="offer-card" id="'+s.id+'" aria-labelledby="'+s.id+'-title">'+renderPoster(s)+'<div class="offer-card__copy"><p class="offer-card__need">'+s.need+'</p><h3 id="'+s.id+'-title">'+s.title+'</h3><p class="offer-card__description">'+s.description+'</p><ul class="offer-scope">'+items(s.scope)+'</ul>'+(s.extraTitle?'<aside class="offer-extra"><strong>'+s.extraTitle+'</strong><p>'+s.extraText+'</p></aside>':'')+'<div class="offer-card__decision"><details class="offer-details"><summary>Что входит</summary><ul>'+items(s.details)+'</ul></details><div class="offer-price"><strong>'+s.price+'</strong><p>'+s.terms+'</p></div><div class="offer-actions"><a href="/contact" class="offer-cta" data-service="'+s.title+'">'+s.action+'</a>'+(s.caseHref?'<a class="offer-case" href="'+s.caseHref+'">'+s.caseLabel+'</a>':'')+'</div></div></div></article>';
}
export function renderServicePage() {
  return [
    '<main class="offer-page"><header class="offer-heading"><p class="offer-kicker">Что делаем</p><h1>Системы, сайты и боты<br><em>для вашего бизнеса.</em></h1><p>Наводим порядок в клиентах, заказах и оплатах.<br>А ещё создаём сайты и помогаем привлекать клиентов.</p>',
    '<nav class="offer-index" aria-label="Направления работы"><a href="#system">Порядок в бизнесе</a>'+services.map(s=>'<a href="#'+s.id+'">'+s.short+'</a>').join('')+'</nav></header>',
    '<section class="system-offer" id="system" aria-labelledby="system-title"><div class="system-offer__copy"><p class="offer-kicker">Основное направление</p><h2 id="system-title">Вместо 20 таблиц.<br><em>Одно рабочее место.</em></h2><p>Кому ответить, на каком этапе заказ и кто ещё не оплатил. Собираем эти ответы в одной системе, чтобы не искать их в чатах и файлах.</p><ul><li>Клиенты и история общения</li><li>Заказы, задачи и ответственные</li><li>Оплаты, расходы и отчёты</li></ul><details class="offer-details"><summary>Что будет с моими таблицами?</summary><p>Перенесём нужные данные, уберём согласованные дубли и проверим результат. Подключим нужные сервисы, настроим доступы и покажем команде, как работать. Производство, склад и доставку добавляем, если они нужны вашему процессу.</p></details><div class="offer-actions"><a class="btn btn--primary" href="/contact" data-service="Система учёта для бизнеса">Обсудить мою задачу</a><a href="/portfolio#mentori" class="offer-case">Посмотреть пример</a></div><small class="offer-note">Стоимость индивидуальная: зависит от задач, данных и подключений.</small></div>'+systemVisual+'</section>',
    '<section class="offer-catalog" aria-labelledby="offer-catalog-title"><div class="offer-section-heading"><h2 id="offer-catalog-title">Можно начать<br><em>с одной задачи.</em></h2><p>Не обязательно менять всё сразу.<br>Любую из этих услуг можно заказать отдельно.</p></div><div class="offer-grid">'+services.map(renderCard).join('')+'</div></section>',
    '<section class="offer-questions" aria-labelledby="offer-questions-title"><h2 id="offer-questions-title">До начала работы</h2><div><details class="offer-details"><summary>Не знаю, что мне нужно. С чего начать?</summary><p>Расскажите, что сейчас неудобно: запись в переписке, несколько таблиц, ручные отчёты или отсутствие сайта. Предложим конкретный первый шаг, без обязательства заказывать весь набор услуг.</p></details><details class="offer-details"><summary>Нужно отказаться от всех старых программ?</summary><p>Нет. Полезные инструменты оставим, ненужное дублирование уберём. Возможность подключения 1С, CRM, сайта и других сервисов проверяем до согласования работ.</p></details><details class="offer-details"><summary>Можно посмотреть готовые работы?</summary><p>Да. В <a href="/portfolio">портфолио</a> есть кабинет студии с записью через Telegram, сайт «Спектр Металла» и собственная система Mentori.</p></details><details class="offer-details"><summary>Когда будет понятна итоговая стоимость?</summary><p>До начала разработки: после обсуждения задач, функций и сроков. Для рекламы отдельно согласуем стоимость настройки и рекламный бюджет.</p></details></div></section>',
    '<section class="offer-contact"><h2>Что у вас сейчас<br><em>забирает время?</em></h2><p>Расскажите своими словами. Подберём решение под вашу задачу.</p><a href="/contact" class="btn btn--primary">Связаться</a></section></main>'
  ].join('\n');
}
export function renderHomeServices() {
  const cleanPoster = s => {
    const $ = load(renderPoster(s), null, false);
    $('.offer-art__caption').remove();
    $('.offer-poster').addClass('offer-poster--clean');
    return $.html();
  };
  const links=services.map(s=>[
    '<a class="home-offer" href="/services#'+s.id+'" data-service="'+s.title+'" aria-label="'+s.short+'">',
    '<div aria-hidden="true">'+cleanPoster(s)+'</div>',
    '<span class="home-offer__title">'+s.short+'</span></a>'
  ].join('')).join('');
  return '<section class="home-offers" id="directions" aria-labelledby="home-offers-title"><div class="home-offers__heading"><h2 id="home-offers-title">Что ещё можем<br><em>сделать для вас</em></h2><p>От записи на занятия до сайта и рекламы.<br>Конкретная задача, отдельное решение.</p></div><div class="home-offers__grid">'+links+'</div><a class="offer-case" href="/services">Все услуги и что в них входит</a></section>';
}
