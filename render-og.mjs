import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox']
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2
});
await page.goto(pathToFileURL('/home/user/noahjefferson/og-card.html').href, { waitUntil: 'networkidle' });
await page.screenshot({ path: '/home/user/noahjefferson/og.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('og.png written');
