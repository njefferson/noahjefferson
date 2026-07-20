import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
const svg = readFileSync('icon.svg','utf8');
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
const sizes = { 'favicon-32.png':32, 'apple-touch-icon.png':180, 'public/icon-192.png':192, 'public/icon-512.png':512, 'public/favicon-32.png':32, 'public/apple-touch-icon.png':180 };
for (const [file,s] of Object.entries(sizes)) {
  const page = await browser.newPage({ viewport:{width:s,height:s}, deviceScaleFactor:1 });
  await page.setContent(`<style>*{margin:0}html,body{width:${s}px;height:${s}px}svg{display:block;width:${s}px;height:${s}px}</style>${svg}`, {waitUntil:'networkidle'});
  await page.screenshot({ path:file, clip:{x:0,y:0,width:s,height:s}, omitBackground:false });
  await page.close();
}
await browser.close();
console.log('icons rendered');
