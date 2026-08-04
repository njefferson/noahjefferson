// privacy-check.mjs — nothing personal about the owner lands in any repo.
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node privacy-check.mjs                check the hub
//   node privacy-check.mjs --repo ../app  check a sibling
//
// WHY (Noah, 2026-08-04, verbatim): "Make sure you never record anything in the
// repo that is personal or embarrassing for me. That is a FAIL state."
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

const argv = process.argv.slice(2);
const ri = argv.indexOf('--repo');
const REPO = ri >= 0 && argv[ri + 1] ? resolve(argv[ri + 1]) : process.cwd();
const NAME = REPO.split('/').pop();

// privacy-gate:patterns-begin
const DISCLOSURE = [
  /\b(?:noah|the owner|he|she|they)\s+(?:is|was|are|were|being|remains)\s+(?:\w+\s+){0,2}?(?:audhd|adhd|autistic|neurodivergent)\b/i,
  // `diagnosed` only counts as a disclosure when something is diagnosed WITH
  // something. Bare "diagnosed" is ordinary engineering English about a FAULT,
  // and this pattern used to swallow it: fauxplane's release note "they are
  // still not diagnosed, only absent" — about console warnings — failed the
  // gate and blocked FOUR consecutive deploys before anyone noticed, because
  // "they are ... diagnosed" matched. Four releases sat on a branch, reported
  // as shipped, while the owner's device stayed on the last one that deployed.
  //
  // Requiring "with" keeps every real disclosure ("he was diagnosed with X")
  // and releases the technical sense outright. A gate that fires on ordinary
  // prose is a gate people learn to route around, which is the one failure a
  // privacy check cannot afford.
  /\b(?:noah|the owner|he|she|they)\s+(?:is|was|are|were|being|remains)\s+(?:\w+\s+){0,2}?diagnosed\s+with\b/i,
  /\b(?:audhd|adhd|autistic|neurodivergent)\s+(?:owner|maker|author)\b/i,
  /\bconfirmed\b[^\n]{0,50}\b(?:he|she|they)\s+(?:is|are)\s+neurodivergent\b/i,
  /\b(?:noah|the owner)\b[^\n]{0,30}\b(?:medication|therapy|diagnosis|diagnosed)\b/i,
];
// privacy-gate:patterns-end

// What the skipped region may never contain, once its regex literals are set
// aside. A pattern's source legitimately names the owner token — that IS the
// anchor it matches on — so the guard reads the region's PROSE and probes: the
// comments and string literals, which are the only places a real sentence could
// hide. Neither needs a proper name or a date.
const REGION_FORBIDDEN = [
  [/\bnoah\b/i, 'the owner’s name outside a pattern'],
  [/\b20\d\d-\d\d-\d\d\b/, 'a date'],
];

// A line that opens with `/` but not `//` is a regex literal, not prose.
const isPatternSource = line => /^\s*\/(?!\/)/.test(line);

const BEGIN = 'privacy-gate:patterns-begin';
const END = 'privacy-gate:patterns-end';

// Split a file into the lines the disclosure patterns read, and the lines the
// sentinels exclude. Blanking rather than dropping keeps line numbers honest.
function split(text) {
  const body = [];
  const region = [];
  let inside = false;
  for (const line of text.split('\n')) {
    if (line.includes(BEGIN)) { inside = true; body.push(''); continue; }
    if (line.includes(END)) { inside = false; body.push(''); continue; }
    if (inside) {
      if (!isPatternSource(line)) region.push(line);
      body.push('');
    } else { body.push(line); }
  }
  return { body: body.join('\n'), region: region.join('\n') };
}

const files = execFileSync('git', ['-C', REPO, 'ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter(f => /\.(md|ts|mjs|js|html|txt)$/.test(f));

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
  for (const [p, what] of REGION_FORBIDDEN) {
    if (p.test(region)) hits.push(`  ${f}: the sentinel-skipped region contains ${what}`);
  }
}

console.log(`=== privacy gate · ${NAME} ===`);
if (hits.length) {
  console.error(`\nFAIL STATE — ${hits.length} personal disclosure(s) about the owner.`);
  console.error('Locations only; the matched text is deliberately not printed.\n');
  for (const h of hits) console.error(h);
  console.error('\nRemove the sentence, not the gate. Design statements stay; who he is does not.');
  process.exit(1);
}
console.log('no personal disclosures in tracked files.');
