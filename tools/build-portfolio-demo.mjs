import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
// Copies UI code only; seed, auth and sync files are deliberately excluded.
const source=process.env.CRM_SOURCE||'/Users/mentori/mentori-crm';
const output=process.env.DEMO_OUTPUT||'/Users/mentori/.codex/visualizations/2026/07/02/019f23c2-2860-7ce1-a7da-f6e10fc458ab/mentori-hero-prototype/public/crm-source';
for(const d of ['js','css','components','pages'])await fs.mkdir(path.join(output,d),{recursive:true});
for(const file of ['js/app.js','js/projects.js','css/projects.css','components/table.js','js/client-view-state.js'])await fs.copyFile(path.join(source,file),path.join(output,file));
await fs.copyFile('tools/portfolio-demo-fixture.js',path.join(output,'portfolio-fixture.js'));
const dashboard=load(await fs.readFile(path.join(output,'pages/dashboard.html'),'utf8'));
const theme=dashboard('head style').toArray().map(n=>dashboard(n).html()).join('\n');
for(const name of ['clients','finance','projects']){
  const $=load(await fs.readFile(path.join(source,`pages/${name}.html`),'utf8'));
  const renderer=$('script:not([src])').last().html();
  $('script,link[rel="icon"],link[rel="apple-touch-icon"],link[rel="manifest"]').remove();
  $('meta[http-equiv="Content-Security-Policy"]').attr('content',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; font-src 'self'; object-src 'none'; form-action 'none'");
  $('body').attr('data-role','owner');
  $('head').append('<meta name="robots" content="noindex">');
  $('head').append(`<style>${theme}\n@media(max-width:700px){.projects-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.projects-layout{grid-template-columns:1fr}.page-title p{font-size:12px}.project-finance-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}</style>`);
  $('body').append('<script src="../js/app.js"></script><script src="../portfolio-fixture.js"></script><script src="../components/sidebar.js"></script><script src="../components/header.js"></script><script src="../components/table.js"></script>');
  if(name==='projects')$('body').append('<script src="../js/projects.js"></script>');
  else {$('body').append($('<script>').text(renderer));if(name==='clients')$('body').append('<script src="../js/client-view-state.js"></script>');}
  await fs.writeFile(path.join(output,`pages/${name}.html`),$.html());
  $('head').append('<style>html{overflow:hidden}body{zoom:1.5}.app,.main{min-height:0}</style>');
  await fs.writeFile(path.join(output,`pages/${name}-capture.html`),$.html());
}
console.log('Read-only synthetic CRM capture pages created outside the public website.');
