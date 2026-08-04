// privacy-check.mjs — nothing personal about the owner lands in any repo.
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node privacy-check.mjs                check the hub
//   node privacy-check.mjs --repo ../app  check a sibling
//
// WHY (Noah, 2026-08-04, verbatim): "Make sure you never record anything in
// the repo that is personal or embarrassing for me. That is a FAIL state."
// Said the same day a session, faithfully recording a design conversation,
// wrote sentences into a PUBLIC repo that linked him personally to a
// neurotype. The repos' product framing and their research about users as a
// population are public on purpose; a sentence attaching a diagnosis, health
// fact, or identity disclosure to the OWNER is the violation, and the anchor
// every pattern requires is exactly that difference: the person, linked by a
// verb, to the term.
//
// NARROW ON PURPOSE. A false positive teaches sessions to route around the
// gate, and the products' own vocabulary ("a planner for neurodivergent
// users") must never trip it. Its first run against a real tree false-fired on
// "Noah's diagnostic" — an app FEATURE — which is why the medical pattern says
// diagnosis|diagnosed and not diagnos\w+. Widen only with the same care.
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

const DISCLOSURE = [
  /\b(?:noah|the owner|he|she|they)\s+(?:is|was|are|were|being|remains)\s+(?:\w+\s+){0,2}?(?:audhd|adhd|autistic|neurodivergent|diagnosed)\b/i,
  /\b(?:audhd|adhd|autistic|neurodivergent)\s+(?:owner|maker|author)\b/i,
  /\bconfirmed\b[^\n]{0,50}\b(?:he|she|they)\s+(?:is|are)\s+neurodivergent\b/i,
  /\b(?:noah|the owner)\b[^\n]{0,30}\b(?:medication|therapy|diagnosis|diagnosed)\b/i,
];

// This gate and its sibling test carry the patterns as source; a pattern is
// not a disclosure.
const SELF = new Set(['privacy-check.mjs', 'test/privacy.test.ts']);

const files = execFileSync('git', ['-C', REPO, 'ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter(f => /\.(md|ts|mjs|js|html|txt)$/.test(f) && !SELF.has(f));

const hits = [];
for (const f of files) {
  let text;
  try { text = readFileSync(`${REPO}/${f}`, 'utf8'); } catch { continue; }
  for (const p of DISCLOSURE) {
    const m = p.exec(text);
    if (m) hits.push(`  ${f}: "${m[0]}"`);
  }
}

console.log(`=== privacy gate · ${NAME} ===`);
if (hits.length) {
  console.error(`\nFAIL STATE — ${hits.length} personal disclosure(s) about the owner:`);
  for (const h of hits) console.error(h);
  console.error('\nRemove the sentence, not the gate. Design statements stay; who he is does not.');
  process.exit(1);
}
console.log('no personal disclosures in tracked files.');
