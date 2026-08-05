// privacy-check.mjs — nothing personal about the owner lands in any repo.
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node privacy-check.mjs                check the hub
//   node privacy-check.mjs --repo ../app  check a sibling
//
// WHY (
//
// The line that decides every case: his design statements are repo material;
// who he is, is not. The products' framing ("a planner for neurodivergent
// users") and research about users as a population are public on purpose. The
// violation is a sentence whose predicate is a diagnosis, a health fact, or an
// identity disclosure and whose subject is the OWNER — and every pattern below
// anchors on exactly that structure, because the same nouns appear legitimately
// a hundred times in honest product and research prose.
//
// NARROW ON PURPOSE. A false positive teaches sessions to route around the
// gate. Two traps found building it, kept so the next widening avoids them:
// the medical pattern says diagnosis|diagnosed and not diagnos\w+, because the
// apps ship a "diagnostic report" feature whose name sits beside the owner's
// constantly; and meta-prose ABOUT the rule reads like the thing the rule
// forbids, so meta-prose names the TERM first and the person second ("a
// diagnosis attached to the owner") while a real disclosure leads with the
// person.
//
// THE FILE MAY NOT EXEMPT ITSELF. An earlier version skipped this file and its
// sibling test whole, on the reasoning that a pattern is not a disclosure. That
// is true of the patterns and false of everything else in the file, and the
// prose around them went unscanned for a day. Only the region between the
// sentinels below is skipped, and that region is itself held to REGION_FORBIDDEN
// so it can never carry a name or a date.
//
// WHAT IT CANNOT DO, stated so nobody mistakes the coverage: git HISTORY.
// A sentence already pushed lives in old commits whether or not the tree is
// clean, and rewriting public history is the owner's call, never a session's.
// This gate keeps the PRESENT clean and makes the next violation loud.
//
// EXITS NON-ZERO on any hit.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { ATTRIBUTION, DISCLOSURE, REGION_FORBIDDEN, split } from './privacy-patterns.mjs';

const argv = process.argv.slice(2);
const ri = argv.indexOf('--repo');
const REPO = ri >= 0 && argv[ri + 1] ? resolve(argv[ri + 1]) : process.cwd();
const NAME = REPO.split('/').pop();

const files = execFileSync('git', ['-C', REPO, 'ls-files'], { encoding: 'utf8' })
  .split('\n')
  // yml/yaml/json ARE IN THIS LIST NOW. The history gate has always scanned
  // them and this one did not, so a workflow comment naming him was invisible
  // to the gate that runs in CI and visible only to the one nobody runs. Two
  // file lists for the same rule is one gate lying about its coverage.
  .filter(f => /\.(md|ts|mjs|js|html|txt|json|yml|yaml)$/.test(f));

const hits = [];
for (const f of files) {
  let text;
  try { text = readFileSync(`${REPO}/${f}`, 'utf8'); } catch { continue; }
  const { body, region } = split(text);
  for (const p of DISCLOSURE) {
    const m = p.exec(body);
    // LOCATION ONLY, never the matched text. On a public repo the Actions log
    // is public, so a gate that quotes what it found republishes it on every
    // failure — which is the same mistake as a fixture quoting the sentence it
    // exists to exclude. The line number is enough to fix it.
    if (m) hits.push(`  ${f}:${body.slice(0, m.index).split('\n').length}`);
  }
  /**
   * ATTRIBUTION IS A SECOND FAIL CLASS, not a lint.
   *
   * The disclosure patterns look for a diagnosis or a health fact attached to
   * the owner. Quoting him does not look like that, so it ran unchecked for the
   * life of these repos — 787 sites across two public repositories, his
   * ordinary speech and his swearing, attributed to him by name, in repos his
   * peers and family read.
   *
   * Same treatment as a disclosure: location only, never the matched text, and
   * a non-zero exit. A gate that prints what it found republishes it.
   */
  for (const p of ATTRIBUTION) {
    const m = p.exec(body);
    if (m) hits.push(`  ${f}:${body.slice(0, m.index).split('\n').length}  (attribution — his words are not repo material)`);
  }
  for (const [p, what] of REGION_FORBIDDEN) {
    if (p.test(region)) hits.push(`  ${f}: the sentinel-skipped region contains ${what}`);
  }
}

console.log(`=== privacy gate · ${NAME} ===`);
if (hits.length) {
  console.error(`\nFAIL STATE — ${hits.length} personal disclosure(s) about the owner.`);
  console.error('Locations only; the matched text is deliberately not printed.\n');
  for (const h of hits) console.error(h);
  console.error('\nRemove the sentence, not the gate. Design statements stay; who he is —');
  console.error('and anything he said — does not. Write what was wrong and what it measured,');
  console.error('never who reported it or in what words.');
  process.exit(1);
}
console.log('no personal disclosures in tracked files.');
