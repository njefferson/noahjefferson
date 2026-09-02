// Render social-card.html to social-preview.png (1280x640 @2x, GitHub's
// recommended social-preview size). Upload it manually at:
// GitHub repo -> Settings -> General -> Social preview.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox']
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 640 },
  deviceScaleFactor: 2
});
await page.goto(pathToFileURL('/home/user/noahjefferson/social-card.html').href, { waitUntil: 'networkidle' });
await page.screenshot({ path: '/home/user/noahjefferson/social-preview.png', clip: { x: 0, y: 0, width: 1280, height: 640 } });
await browser.close();
console.log('social-preview.png written');
