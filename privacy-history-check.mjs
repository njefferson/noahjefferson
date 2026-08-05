// privacy-history-check.mjs — the owner's person is not in the repo's HISTORY.
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node privacy-history-check.mjs                 check the hub
//   node privacy-history-check.mjs --repo ../app   check a sibling
//
// privacy-check.mjs reads the working TREE. This reads every commit reachable
// from every ref: each tracked text blob, and each commit MESSAGE — which no
// later commit can clean, because a message is not a file.
//
// It reports LOCATIONS ONLY: path, short SHA, subject. It never prints the
// matched text. On a public repo the Actions log is public too, so a gate that
// quotes what it found republishes it on every failure — the same shape of
// mistake as a test fixture quoting the sentence it exists to exclude.
//
// NOT WIRED INTO CI, deliberately. History does not change on a push, so a
// per-push run measures nothing new; and the remedy — rewriting published
// history — is the OWNER's call, never a session's or a workflow's. Run it
// when adopting the gate in a new repo, and after any rewrite, to verify.
//
// EXITS NON-ZERO on any hit.

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { DISCLOSURE, REGION_FORBIDDEN, BEGIN, END, isPatternSource } from './privacy-patterns.mjs';

const argv = process.argv.slice(2);
const ri = argv.indexOf('--repo');
const REPO = ri >= 0 && argv[ri + 1] ? resolve(argv[ri + 1]) : process.cwd();
const NAME = REPO.split('/').pop();

const TEXT = /\.(md|ts|mjs|js|html|txt|json|yml|yaml)$/;
const git = args => execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });


// The gate files mark their pattern block with sentinels, and the tree gate
// skips that block. History must skip it the same way or every commit since
// the sentinels landed reports the gate's own synthetic probes as a violation.
// Commits from BEFORE the sentinels existed have no such block, so they are
// read in full — which is the point, because that is where the real fixtures
// were. The region is still held to no-name and no-date, as in the tree gate.

function hit(s) {
  let inside = false;
  for (const l of s.split('\n')) {
    if (l.includes(BEGIN)) { inside = true; continue; }
    if (l.includes(END)) { inside = false; continue; }
    if (inside) {
      if (!isPatternSource(l) && REGION_FORBIDDEN.some(([p]) => p.test(l))) return true;
      continue;
    }
    if (!isPatternSource(l) && DISCLOSURE.some(p => p.test(l))) return true;
  }
  return false;
}

console.log(`=== privacy gate · history · ${NAME} ===`);

let commits;
try {
  commits = git(['rev-list', '--all']).split('\n').filter(Boolean);
} catch {
  console.error('not a git repository, or no commits.');
  process.exit(1);
}

// A blob is identical across every commit that shares it, so scan each blob
// once. Without this the walk is quadratic on a repo with any history at all.
const blobVerdict = new Map();
const files = new Map();   // path -> Set(short sha)
const messages = [];       // short sha only

for (const c of commits) {
  let tree;
  try { tree = git(['ls-tree', '-r', c]).split('\n').filter(Boolean); } catch { continue; }
  for (const row of tree) {
    // "<mode> blob <sha>\t<path>"
    const tab = row.indexOf('\t');
    if (tab < 0) continue;
    const path = row.slice(tab + 1);
    if (!TEXT.test(path)) continue;
    const sha = row.slice(0, tab).split(/\s+/)[2];
    if (!blobVerdict.has(sha)) {
      let text = '';
      try { text = git(['cat-file', '-p', sha]); } catch { /* unreadable */ }
      blobVerdict.set(sha, hit(text));
    }
    if (blobVerdict.get(sha)) {
      if (!files.has(path)) files.set(path, new Set());
      files.get(path).add(c.slice(0, 7));
    }
  }
  if (hit(git(['show', '-s', '--format=%B', c]))) messages.push(c.slice(0, 7));
}

const total = [...files.values()].reduce((n, s) => n + s.size, 0) + messages.length;

if (!total) {
  console.log(`${commits.length} commits, ${blobVerdict.size} distinct blobs — clean.`);
  process.exit(0);
}

console.error(`\nFAIL STATE — personal information about the owner is in this repo's HISTORY.`);
console.error(`Scanned ${commits.length} commits. Locations only; the text is never printed.\n`);

if (files.size) {
  console.error('FILES — path, then the commits whose tree carries it:');
  for (const [path, shas] of files) {
    console.error(`  ${path}`);
    console.error(`    ${[...shas].join(' ')}`);
  }
}
if (messages.length) {
  console.error('\nCOMMIT MESSAGES — a later commit cannot clean these:');
  console.error(`  ${messages.join(' ')}`);
}

console.error(`
Removing this means REWRITING PUBLISHED HISTORY, which is the owner's call and
never a session's. Note also that a force-push does not delete the old commits
from GitHub: they stay reachable by full SHA until GitHub garbage-collects, so
making the repository private is the only step that closes it immediately.`);
process.exit(1);
