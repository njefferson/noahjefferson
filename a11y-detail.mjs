import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
const axeSrc = readFileSync('node_modules/axe-core/axe.min.js','utf8');
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
const page = await browser.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
await page.goto(pathToFileURL('public/index.html').href,{waitUntil:'networkidle'});
await page.addScriptTag({content:axeSrc});
const inc = await page.evaluate(async () => {
  const r = await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}});
  return r.incomplete.map(v=>({id:v.id, nodes:v.nodes.map(n=>({t:n.target.join(' '), s:(n.failureSummary||'').replace(/\n/g,' ').slice(0,120)}))}));
});
console.log('INCOMPLETE DETAIL:'); console.log(JSON.stringify(inc,null,2));
// manual contrast for the key text pairs
const contrast = await page.evaluate(() => {
  function lum(c){const[r,g,b]=c.map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b;}
  function ratio(fg,bg){const L1=lum(fg),L2=lum(bg);return ((Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05));}
  const parse=s=>s.match(/\d+/g).map(Number).slice(0,3);
  function bgOf(el){let e=el;while(e){const b=getComputedStyle(e).backgroundColor;if(b&&b!=='rgba(0, 0, 0, 0)'&&b!=='transparent')return parse(b);e=e.parentElement;}return [11,16,32];}
  const sels=['.tag','.foot','.sub','.vchip','.app-name','.app-sub','.go','.group-title','.label'];
  const out={};
  for(const s of sels){const el=document.querySelector(s);if(!el)continue;const cs=getComputedStyle(el);
    out[s]={ratio:+ratio(parse(cs.color),bgOf(el)).toFixed(2), size:cs.fontSize, weight:cs.fontWeight};}
  return out;
});
console.log('MANUAL CONTRAST (fg vs nearest opaque bg):');
for(const[k,v] of Object.entries(contrast)) console.log(`  ${k.padEnd(14)} ${v.ratio}:1  (${v.size} ${v.weight})  ${v.ratio>=4.5?'PASS':(v.ratio>=3?'PASS-large?':'FAIL')}`);
await browser.close();
