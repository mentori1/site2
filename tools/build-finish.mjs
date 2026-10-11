import fs from 'node:fs/promises';
import { load } from 'cheerio';

// Patch only known fragments so unrelated page markup and metadata stay intact.
for (const file of (await fs.readdir('.')).filter(name => name.endsWith('.html'))) {
  const html = await fs.readFile(file, 'utf8');
  const $ = load(html, { sourceCodeLocationInfo: true });
  if (!$('footer.foot').length) continue;
  const edits = [];
  const replace = (node, text) => edits.push({start:node.sourceCodeLocation.startOffset,end:node.sourceCodeLocation.endOffset,text});
  const insert = (node, text) => { const start=node.sourceCodeLocation.endTag.startOffset; edits.push({start,end:start,text}); };
  if (['index.html','services.html','portfolio.html'].includes(file)) {
    const body=$('body');
    body.addClass('surface-soft');
    const loc=body[0].sourceCodeLocation.startTag;
    edits.push({start:loc.startOffset,end:loc.endOffset,text:'<body'+Object.entries(body[0].attribs).map(([key,value])=>' '+key+'="'+value+'"').join('')+'>'});
  }
  const signature = '<div class="foot-signature" data-footer-reveal><img src="/assets/mentori-technologies-wordmark-transparent.avif" width="1170" height="500" alt="MENTORI TECHNOLOGIES" loading="lazy" decoding="async"></div>';
  if ($('[data-footer-reveal]').length) replace($('[data-footer-reveal]')[0], signature);
  else insert($('footer.foot')[0], signature);
  for (const [selector, markup, parent] of [
    ['link[href^="/page-finish.css"]','<link rel="stylesheet" href="/page-finish.css?v=20261011-3">','head'],
    ['script[src^="/footer-reveal.js"]','<script src="/footer-reveal.js?v=20261011-2" defer></script>','body']
  ]) {
    if ($(selector).length) replace($(selector)[0],markup);
    else insert($(parent)[0],markup);
  }
  for (const name of ['home-scenes','hero-focus','service-posters']) {
    const version=name==='service-posters'?'20261011-4':'20261011-3';
    $(`link[href^="/${name}.css"]`).each((_,node)=>replace(node,`<link rel="stylesheet" href="/${name}.css?v=${version}">`));
  }
  let result=html;
  for (const e of edits.sort((a,b)=>b.start-a.start)) result=result.slice(0,e.start)+e.text+result.slice(e.end);
  await fs.writeFile(file,result);
}
console.log('Shared footer and page finishes generated.');
