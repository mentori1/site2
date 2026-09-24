// Synthetic data only. This file runs in an isolated capture site, never production CRM.
const clients = ['Мастерская мебели','Студия движения','Сервис доставки','Проектное бюро','Школа музыки','Производство окон'].map((name,i)=>({
  id:`demo-client-${i}`,name,code:`demo${i+1}`,platform:'Разработка CRM',tariff:'Индивидуальный проект',
  ordered:12,done:0,manualDone:i+2,paid:60000+i*5000,total:120000+i*5000,remain:60000,
  date:'2026-09-01',deadline:'2026-10-20',status:'active',manager:'Менеджер',state:'active',customer:name
}));
const projects = [
  ['Система заказов','Мастерская мебели','development','active','ok','Показать учёт заказов и производства'],
  ['Запись на занятия','Студия движения','testing','active','ok','Проверить запись через Telegram'],
  ['Сайт и каталог','Сервис доставки','prototype','waiting_client','attention','Согласовать структуру каталога'],
  ['Личный кабинет','Проектное бюро','analysis','active','ok','Собрать права доступа команды'],
  ['Учёт абонементов','Школа музыки','launch','active','ok','Передать систему администратору']
].map(([name,client_name,stage,status,health,next_action],i)=>({id:`demo-project-${i}`,name,client_name,stage,status,health,next_action,contract_amount:120000+i*20000,received_amount:60000,expense_amount:18000,start_date:'2026-09-01',deadline:'2026-10-20',next_action_date:'2026-09-28',description:'Заказы, оплаты, ответственные и сроки в одной рабочей системе. Демонстрационный проект.'}));
const income = clients.map((c,i)=>({id:`demo-income-${i}`,date:`2026-09-${24-i}`,client:c.name,accountId:c.id,service:i%2?'Разработка сайта':'Разработка CRM',amount:60000+i*5000,comment:i%2?'Первый этап проекта':'Разработка и настройка'}));
const expenses = ['Разработка','Дизайн','Серверы','Реклама'].map((comment,i)=>({id:`demo-expense-${i}`,date:'2026-09-20',category:i===3?'Прочее':'Софт',amount:18000+i*7000,comment,personal:false}));
window.App.Store.state = {initialized:true,version:2,clients,income,expenses,employees:[],subscriptions:[],mentors:[],reviews:[],profiles:[],profileStatuses:[],accounts:[],ips:[],phones:[],tasks:[],links:[],nicheConfig:[],paymentSettings:{}};
window.App.Store.load = function(){return this.state;};
window.App.Store.save = ()=>{};
const tables = {development_projects:projects,development_project_activity:[],development_project_resources:[],development_project_income_links:[]};
const denyWrite = ()=>{throw Error('Read-only portfolio demonstration');};
window.Supabase = {Tbl:{select:async(name)=>tables[name]||[],insert:denyWrite,update:denyWrite,upsert:denyWrite,remove:denyWrite},rest:async()=>[]};
window.addEventListener('load',()=>{
  document.querySelectorAll('.sidebar a').forEach(a=>{if(/(?:ips|phones|reviews)\.html/.test(a.href))a.remove();});
  document.querySelectorAll('.status-dot').forEach(n=>n.parentElement.textContent='Демонстрация');
});
