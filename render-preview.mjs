import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 600, height: 900 }, deviceScaleFactor: 2 });
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto(pathToFileURL('/home/user/noahjefferson/public/index.html').href, { waitUntil: 'networkidle' });
await page.screenshot({ path: '/home/user/noahjefferson/preview.png', fullPage: true });
const stats = await page.evaluate(() => ({
  igLinks: [...document.querySelectorAll('.tile')].map(a => a.querySelector('.label')?.textContent),
  appCards: [...document.querySelectorAll('.approw')].map(a => ({
    name: a.querySelector('.app-name')?.textContent,
    href: a.href,
    imgLoaded: (() => { const i=a.querySelector('img.app-ico'); return i && i.complete && i.naturalWidth>0; })()
  })),
  values: [...document.querySelectorAll('.vchip')].map(v => v.textContent),
}));
console.log(JSON.stringify(stats, null, 2));
console.log('pageerrors:', errs.length, errs.join(' | '));
await browser.close();
