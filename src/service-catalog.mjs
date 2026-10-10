// Shared content for the service page, homepage links and structured data.
const phone = (content, theme = '') => '<div class="offer-phone '+theme+'"><div class="offer-phone__island"></div><div class="offer-phone__screen">'+content+'</div></div>';
const telegramHeader = '<div class="phone-app-head"><img src="/assets/icons/telegram.svg" alt="" width="28" height="28"><span>Помощник<br><small>Telegram-бот</small></span></div>';
export const services = [
  {
    id:'studio', title:'Учёт занятий и абонементов', short:'Занятия и студии',
    need:'Когда запись занимает больше времени, чем занятия',
    description:'Ученики записываются через Telegram. Вы видите расписание, оплаты и остаток занятий в одном кабинете.',
    scope:['Танцы, йога, пилатес','Частные преподаватели'],
    price:'15 000 ₽', priceValue:'15000', terms:'Единоразово за готовое решение. Запуск за 10 дней после согласования вашего формата.',
    details:['Клиенты, расписание и история посещений.','Разовые занятия, группы, индивидуальные встречи и абонементы.','Кабинет ученика в Telegram и учёт оплат. Проверка чеков остаётся у преподавателя.'],
    action:'Обсудить студию', caseHref:'/portfolio#studio', caseLabel:'Пример студии',
    visual:'<div class="offer-art offer-art--studio"><span class="offer-art__label">ЗАНЯТИЯ. БЕЗ ПЕРЕПИСОК.</span><div class="offer-art__words">Ваша студия.<br><em>Всё на месте.</em></div><img class="offer-art__studio-phone" src="/assets/services/studio.webp" width="540" height="1056" alt="Кабинет ученика на телефоне: абонементы и выбор даты занятия" loading="lazy" decoding="async"><span class="offer-art__caption">Реализованный проект · демоданные</span></div>'
  },
  {
    id:'websites', title:'Сайты для бизнеса', short:'Разработка сайтов',
    need:'Когда нужно показать, что вы продаёте',
    description:'Сайт с услугами или каталогом, который удобно открыть с телефона, выбрать предложение и связаться с вами.',
    scope:['Лендинги','Сайты компаний','Каталоги'],
    price:'от 5 000 ₽', priceValue:'5000', terms:'Итоговая стоимость зависит от страниц и функций. Согласуем до начала работы.',
    details:['Структура, тексты, дизайн и разработка.','Мобильная версия, формы и способы связи.','Каталог, фильтры и калькулятор при необходимости. Состав согласуем отдельно.'],
    action:'Обсудить сайт', caseHref:'/portfolio#spektr', caseLabel:'Кейс «Спектр Металла»',
    visual:'<div class="offer-art offer-art--websites"><span class="offer-art__label">УДОБНО ВЫБРАТЬ. ПРОСТО ЗАКАЗАТЬ.</span><div class="offer-browser"><div class="offer-browser__bar">metallomsk.ru</div><img src="/assets/services/catalog.webp" width="960" height="667" alt="Каталог Спектра Металла: товары, фильтры и цвета" loading="lazy" decoding="async"></div>'+phone('<img src="/assets/services/cart.webp" width="390" height="844" alt="Корзина заказа на телефоне" loading="lazy" decoding="async">','offer-phone--website')+'<span class="offer-art__caption">Реализованный проект · Спектр Металла</span></div>'
  },
  {
    id:'bots', title:'Telegram-боты', short:'Telegram-боты',
    need:'Когда одни и те же вопросы повторяются каждый день',
    description:'Бот отвечает на частые вопросы, помогает записаться, собирает заявки и отправляет уведомления вместо вас.',
    scope:['Заявки','Запись','Уведомления'],
    price:'от 3 000 ₽', priceValue:'3000', terms:'Стоимость зависит от сценария и подключений. Уточняем функции до разработки.',
    details:['Продумываем путь клиента, кнопки и ответы.','Разрабатываем бота, проверяем сценарии и запускаем.','Подключение к вашему учёту и отчёты обсуждаем под задачу.'],
    action:'Обсудить бота',
    visual:'<div class="offer-art offer-art--bots"><span class="offer-art__label">ОТ ВОПРОСА ДО ЗАЯВКИ</span><div class="offer-art__words">Рутину<br><em>берёт бот.</em></div>'+phone(telegramHeader+'<div class="phone-chat"><p>Здравствуйте! Чем можем помочь?</p><span class="phone-chat__choice">Записаться на встречу</span><p>Выберите удобное время</p><div class="phone-times"><span>10:00</span><span>12:30</span><span>15:00</span></div><span class="phone-chat__choice">12:30</span><p class="phone-chat__success">Вы записаны.<br>Напомним перед встречей.</p></div>')+'<span class="offer-art__caption">Пример сценария бота</span></div>'
  },
  {
    id:'direct', title:'Яндекс Директ', short:'Яндекс Директ',
    need:'Когда сайт есть, а о нём ещё не знают',
    description:'Настраиваем рекламу, проверяем запросы и объявления. Вы получаете понятный отчёт: что сделали и что меняем дальше.',
    scope:['Запуск рекламы','Ведение','Отчётность'],
    price:'7 500 ₽ / месяц', priceValue:'7500', terms:'Ведение. Рекламный бюджет отдельно, стоимость первоначальной настройки согласуем.',
    details:['Анализ ниши, запросы, минус-фразы и объявления.','Проверка статистики, тесты и корректировки кампаний.','PDF-отчёт каждые 10 дней. Дополнительно подключаем Telegram-бота со статистикой рекламы.'],
    action:'Обсудить рекламу', caseHref:'/blog-yandex-direct-dlya-biznesa', caseLabel:'Как ведём рекламу',
    visual:'<div class="offer-art offer-art--direct"><span class="offer-art__label">РЕКЛАМА С ПОНЯТНЫМ ОТЧЁТОМ</span><div class="offer-art__words">Не просто<br><em>клики.</em></div>'+phone(telegramHeader+'<div class="phone-report"><small>ОТЧЁТ ПО РЕКЛАМЕ</small><h4>Что происходит<br>с рекламой</h4><div class="phone-report__chart" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><p><b>Что сделали</b>Проверили поисковые запросы</p><p><b>Что узнали</b>Сравнили варианты объявлений</p><p><b>Следующий шаг</b>Тестируем новые тексты</p></div>','offer-phone--light')+'<span class="offer-art__caption">Пример отчёта, не показатели клиента</span></div>'
  },
  {
    id:'avito', title:'Оформление и ведение Авито', short:'Услуги авитолога',
    need:'Когда объявление есть, а предложение не цепляет',
    description:'Упаковываем ваше предложение: заголовки, тексты и изображения. Публикуем объявления, тестируем подачу и следим за обращениями.',
    scope:['Тексты и визуалы','Публикация','Ведение'],
    price:'5 800 ₽', priceValue:'5800', terms:'Оформление. Дальнейшее ведение за согласованный процент, расходы площадки отдельно.',
    details:['Изучаем нишу и предложения конкурентов.','Готовим оформление и размещаем согласованное количество объявлений.','Сравниваем заголовки и изображения, корректируем подачу по просмотрам и обращениям.'],
    action:'Обсудить Авито',
    visual:'<div class="offer-art offer-art--avito"><span class="offer-art__label">ВАШЕ ПРЕДЛОЖЕНИЕ. НА ВИДУ.</span><div class="offer-art__words">Ваше дело.<br><em>На виду.</em></div>'+phone('<div class="phone-listing"><div class="phone-listing__head">Объявление</div><img src="/assets/services/catalog.webp" width="960" height="667" alt="Пример изображения сайта для объявления о разработке" loading="lazy" decoding="async"><h4>Сайт для вашего бизнеса</h4><strong>от 5 000 ₽</strong><p>Услуги, каталог и заявки.<br>Удобно с телефона.</p><span class="phone-listing__message">Написать</span><small>Пример оформления</small></div>','offer-phone--light')+'<span class="offer-art__caption">Демонстрационное объявление</span></div>'
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

export const systemVisual = '<figure class="system-preview"><div class="system-preview__screens"><div class="system-preview__desktop"><div class="offer-browser__bar">MENTORI · рабочее место команды</div><img src="/assets/services/projects.webp" alt="Mentori: проекты, этапы и следующий шаг по каждому заказу" width="1200" height="750" decoding="async" fetchpriority="high"></div>'+phone('<img src="/assets/services/projects-phone.webp" width="390" height="844" alt="Те же проекты на телефоне" decoding="async">','offer-phone--system')+'</div><figcaption>Настоящий интерфейс Mentori. На экранах вымышленные данные.</figcaption></figure>';

const items = arr => arr.map(i=>'<li>'+i+'</li>').join('');
function renderCard(s) {
  return '<article class="offer-card" id="'+s.id+'" aria-labelledby="'+s.id+'-title">'+s.visual+'<div class="offer-card__copy"><p class="offer-card__need">'+s.need+'</p><h3 id="'+s.id+'-title">'+s.title+'</h3><p class="offer-card__description">'+s.description+'</p><ul class="offer-scope">'+items(s.scope)+'</ul><details class="offer-details"><summary>Что входит</summary><ul>'+items(s.details)+'</ul></details><div class="offer-price"><strong>'+s.price+'</strong><p>'+s.terms+'</p></div><div class="offer-actions"><a href="/contact" class="offer-cta" data-service="'+s.title+'">'+s.action+'</a>'+(s.caseHref?'<a class="offer-case" href="'+s.caseHref+'">'+s.caseLabel+'</a>':'')+'</div></div></article>';
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
  const links=services.map(s=>[
    '<a class="home-offer" href="/services#'+s.id+'" data-service="'+s.title+'" aria-label="'+s.short+', '+s.price+'">',
    '<div aria-hidden="true">'+s.visual+'</div>',
    '<span class="home-offer__title">'+s.short+'</span><span class="home-offer__price">'+s.price+'</span></a>'
  ].join('')).join('');
  return '<section class="home-offers" id="directions" aria-labelledby="home-offers-title"><div class="home-offers__heading"><h2 id="home-offers-title">Что ещё можем<br><em>сделать для вас</em></h2><p>От записи на занятия до сайта и рекламы.<br>Конкретная задача, отдельное решение.</p></div><div class="home-offers__grid">'+links+'</div><a class="offer-case" href="/services">Все услуги и что в них входит</a></section>';
}
