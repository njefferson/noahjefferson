// privacy-mirror-check.mjs — an offline COPY of the patterns may not drift.
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node privacy-mirror-check.mjs --repo ../app
//
// A sibling that must fail `npm test` with no hub present has to carry its own
// copy of the disclosure patterns. That copy is a liability the moment the
// canon moves, and it moved: a narrowing fix landed in the hub and reached
// exactly one of three copies. The stale ones kept the over-broad pattern that
// had already blocked four consecutive deploys (LESSONS §53).
//
// So a mirror is allowed, and drift is a FAILURE. This compares the regex
// literals inside the repo's sentinel region against the hub's canonical list
// and exits non-zero on any difference — extra, missing, or altered.
//
// Wire it into the sibling's CI beside the privacy gate, in the job that
// already checks the hub out. A repo with no mirror passes trivially.
//
// EXITS NON-ZERO on drift.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BEGIN, END, isPatternSource } from './privacy-patterns.mjs';

const argv = process.argv.slice(2);
const ri = argv.indexOf('--repo');
const REPO = ri >= 0 && argv[ri + 1] ? resolve(argv[ri + 1]) : process.cwd();
const NAME = REPO.split('/').pop();
const HUB = dirname(fileURLToPath(import.meta.url));

// The canon read as TEXT, not as imported objects: a mirror is a copy of the
// source lines, and comparing sources is what catches an altered flag or a
// silently reordered alternation that still compiles.
function patternLines(text) {
  const out = [];
  let inside = false;
  for (const line of text.split('\n')) {
    if (line.includes(BEGIN)) { inside = true; continue; }
    if (line.includes(END)) { inside = false; continue; }
    if (inside && isPatternSource(line)) out.push(line.trim().replace(/,$/, ''));
  }
  return out;
}

const canon = patternLines(readFileSync(join(HUB, 'privacy-patterns.mjs'), 'utf8'));

const files = execFileSync('git', ['-C', REPO, 'ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter(f => /\.(ts|mjs|js)$/.test(f));

console.log(`=== privacy mirror gate · ${NAME} ===`);

if (!canon.length) {
  console.error('the hub carries no patterns — refusing to certify anything against an empty canon.');
  process.exit(1);
}

const mirrors = [];
for (const f of files) {
  let text;
  try { text = readFileSync(`${REPO}/${f}`, 'utf8'); } catch { continue; }
  if (!text.includes(BEGIN)) continue;
  mirrors.push([f, patternLines(text)]);
}

if (!mirrors.length) {
  console.log('no mirrored pattern block in this repo — nothing to drift.');
  process.exit(0);
}

let bad = 0;
for (const [f, lines] of mirrors) {
  const missing = canon.filter(c => !lines.includes(c));
  const extra = lines.filter(l => !canon.includes(l));
  if (!missing.length && !extra.length) {
    console.log(`  ${f}: ${lines.length} pattern(s), identical to the hub.`);
    continue;
  }
  bad++;
  console.error(`\nDRIFT — ${f} does not match the hub's canonical patterns.`);
  // The patterns are public source, not disclosures, so printing them is safe
  // and is the only way to make the fix obvious.
  for (const m of missing) console.error(`  MISSING from the mirror: ${m}`);
  for (const e of extra) console.error(`  NOT IN THE HUB:          ${e}`);
}

if (bad) {
  console.error(`
Copy the hub's block verbatim — privacy-patterns.mjs, between the sentinels.
A stale mirror is not a smaller gate, it is a DIFFERENT one: it can block
deploys the canon has already released, or pass what the canon now catches.`);
  process.exit(1);
}
process.exit(0);
