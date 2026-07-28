#!/usr/bin/env node
// Does this app honour a reader who enlarges only their DEFAULT TEXT SIZE?
//
// PORTABLE ON PURPOSE. No dependencies, no build step, no assumptions about the
// repo — point it at whatever files hold your CSS:
//
//     node check-textsize.mjs src/styles.css
//     node check-textsize.mjs public/*.html src/**/*.css
//
// WHY THIS EXISTS. Page zoom scales `px`, so a stylesheet written entirely in
// pixels looks fine when you test by zooming — and does NOTHING for a reader who
// instead raises their browser's or phone's default text size. That is a
// different setting and a common one, especially for the people who most need
// it. The failure is invisible unless you go looking.
//
// MEASURED when this was found (photo-pointer, 2026-07-28): 23 of 49 visible
// text elements did not move at all when the root font size went 16px -> 24px.
// The hub's own accessibility statement — the page telling people what these
// apps commit to — was one of the offenders.
//
// THE FIX is mechanical and provably invisible: divide each px value by 16 and
// write rem. At the default root the rendering is byte-identical, so nobody on
// default settings sees any change; only the reader who asked for bigger text
// gets it. Verify that both ways round — identical at 16, scaling at 24 — rather
// than trusting the arithmetic.
//
// WATCH FOR: vendored stylesheets you do not author (Leaflet sizes its zoom
// controls at a fixed 22px in a fixed 30px box). Override them, and scale the
// BOX with the glyph or a bigger symbol overflows its button.

import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: check-textsize.mjs <file> [file...]   (css or html)');
  process.exit(2);
}

let offenders = 0;
let relative = 0;

for (const file of files) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { console.error(`cannot read ${file}`); process.exitCode = 2; continue; }
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/font-size:\s*([0-9.]+)(px|rem|em)/g)) {
      if (m[2] === 'px') {
        // A px line immediately followed by a relative one is the standard
        // progressive-enhancement pair (Leaflet does this) — the relative value
        // wins, so it is not a fault.
        const next = line.slice(m.index + m[0].length);
        if (/^\s*;?\s*font-size:\s*[0-9.]+r?em/.test(next)) { relative++; continue; }
        console.log(`  ${file}:${i + 1}  ${m[0]}   -> ${(Number(m[1]) / 16).toFixed(6).replace(/0+$/, '').replace(/\.$/, '')}rem`);
        offenders++;
      } else relative++;
    }
  });
}

console.log();
if (offenders) {
  console.log(`${offenders} fixed font-size(s) — a reader who enlarges their default text will not see these change.`);
  console.log(`${relative} already relative.`);
  process.exit(1);
}
console.log(`No fixed font sizes. ${relative} relative declaration(s) — text follows the reader's setting.`);
