import { readFileSync, writeFileSync } from 'node:fs';
let html = readFileSync('public/index.html', 'utf8');
const imgs = {
  'tiles/frame.png':        ['image/png',  'public/tiles/frame.png'],
  'tiles/photo-pointer.png':['image/png',  'public/tiles/photo-pointer.png'],
  'tiles/photo-studio.jpg': ['image/jpeg', 'public/tiles/photo-studio.jpg'],
};
for (const [ref, [mime, path]] of Object.entries(imgs)) {
  const b64 = readFileSync(path).toString('base64');
  html = html.replaceAll(`"${ref}"`, `"data:${mime};base64,${b64}"`);
}
writeFileSync('dist-standalone/index.html', html);
console.log('standalone KB:', Math.round(html.length/1024), '| leftover tiles/ file refs:', (html.match(/tiles\/[a-z-]+\.(png|jpg)/g)||[]).length);
