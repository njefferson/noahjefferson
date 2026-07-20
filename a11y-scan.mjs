import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
const axeSrc = readFileSync('node_modules/axe-core/axe.min.js','utf8');
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
const page = await browser.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
await page.goto(pathToFileURL('public/index.html').href,{waitUntil:'networkidle'});
await page.addScriptTag({content:axeSrc});
const results = await page.evaluate(async () =>
  await axe.run(document,{ runOnly:{ type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] } })
);
const custom = await page.evaluate(() => {
  const inter=[...document.querySelectorAll('a[href],button')];
  const small=inter.filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.width<44||r.height<44);})
    .map(el=>({t:el.textContent.trim().slice(0,28),w:Math.round(el.getBoundingClientRect().width),h:Math.round(el.getBoundingClientRect().height)}));
  return {
    interactive: inter.length,
    smallTargets: small,
    imgsNoAlt:[...document.querySelectorAll('img')].filter(i=>!i.getAttribute('alt')).length,
    linksNoName: inter.filter(el=>!el.textContent.trim()&&!el.getAttribute('aria-label')).length,
    lang: document.documentElement.lang, h1: document.querySelectorAll('h1').length
  };
});
console.log('=== AXE (WCAG 2.1 A/AA + best-practice) ===');
console.log('VIOLATIONS:', results.violations.length);
for (const v of results.violations){
  console.log(`  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
  for (const n of v.nodes.slice(0,4)) console.log('      -', n.target.join(' '));
}
console.log('INCOMPLETE:', results.incomplete.map(i=>i.id).join(', ')||'none');
console.log('passes:', results.passes.length);
console.log('=== CUSTOM ===');
console.log(JSON.stringify(custom,null,2));
console.log('pageerrors:', errs.length, errs.join(' | '));
