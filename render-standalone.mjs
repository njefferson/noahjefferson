import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 600, height: 900 }, deviceScaleFactor: 2 });
const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
await page.goto(pathToFileURL('/home/user/noahjefferson/dist-standalone/index.html').href, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'dist-standalone/preview.png', fullPage: true });
const r = await page.evaluate(()=>({
  imgs:[...document.querySelectorAll('img.shot')].map(i=>i.complete&&i.naturalWidth>0 && i.src.startsWith('data:')),
  names:[...document.querySelectorAll('.app-name')].map(n=>n.textContent),
}));
console.log(JSON.stringify(r), 'pageerrors:', errs.length);
await browser.close();
