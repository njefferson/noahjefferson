// doctrine-sync.mjs — what has moved in the hub since this repo last looked.
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node doctrine-sync.mjs --repo ../myapp          what changed since that repo reconciled
//   node doctrine-sync.mjs --repo ../myapp --adopt  record that it has now been read
//   node doctrine-sync.mjs --repo ../myapp --quiet  exit code only, for a hook
//
// WHY.
//
// The sibling repos LINK to this hub's DOCTRINE.md and LESSONS.md rather than
// forking them, which is the right design and has one failure mode: a link is
// only followed if someone remembers to follow it. A session opens a sibling,
// reads its CLAUDE.md, and starts work — and the doctrine it is working under
// may have gained three sections that afternoon. Nothing anywhere says so.
// Every rule in this repo about prose losing to whoever is in a hurry (LESSONS
// §25, §26, §28) applies to the doctrine itself: "re-read the hub each session"
// is exactly the kind of instruction that gets skipped on the busy days.
//
// SO: each sibling records the hub commit it last reconciled with, in a file
// called .doctrine-sync, and this script says what has landed since — which
// files, which commits, and WHICH SECTIONS of DOCTRINE.md, because "DOCTRINE.md
// changed" is not actionable and "§7e and §15 changed" is.
//
// WHAT IT IS NOT. It cannot tell whether a session UNDERSTOOD what changed —
// --adopt is an assertion, like handoff-check's --ack, and can be made falsely.
// What it removes is the failure where nobody knew there was anything to read.
//
// EXITS NON-ZERO when there is unreconciled drift, so it can gate a session
// start rather than merely inform one.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HUB = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const ri = argv.indexOf('--repo');
const REPO = ri >= 0 && argv[ri + 1] ? resolve(argv[ri + 1]) : HUB;
const NAME = REPO.split('/').pop();
const ADOPT = argv.includes('--adopt');
const QUIET = argv.includes('--quiet');
const NO_FETCH = argv.includes('--no-fetch');
const MARKER = join(REPO, '.doctrine-sync');

// What counts as doctrine. Everything a sibling is held to but does not own: the
// rules, the record of what they cost, the palette floors, the security
// baseline, and the shared gates themselves — a gate changing its behaviour is
// as much a change to the contract as a rule changing its wording.
const WATCHED = [
  'DOCTRINE.md', 'LESSONS.md', 'PALETTES.md', 'SECURITY.md', 'METADATA.md',
  'docs-check.mjs', 'lessons-check.mjs', 'pin-check.mjs', 'handoff-check.mjs',
  'palette-check.mjs', 'doctrine-sync.mjs',
  '.github/requirements-ci.txt', '.github/zizmor.yml',
];

const git = (...args) => execFileSync('git', ['-C', HUB, ...args], { encoding: 'utf8' }).trim();
const say = (...a) => { if (!QUIET) console.log(...a); };

// The hub's checkout can itself be behind. Reporting drift against a stale local
// main would be the same defect one level up, so fetch first — and if the
// network is not there, SAY so rather than quietly comparing against yesterday.
let head;
let fetched = true;
if (!NO_FETCH) {
  try { git('fetch', 'origin', 'main', '--quiet'); } catch { fetched = false; }
}
try {
  head = fetched ? git('rev-parse', 'origin/main') : git('rev-parse', 'HEAD');
} catch {
  console.error('doctrine-sync: the hub is not a git checkout, so there is nothing to compare against.');
  process.exit(2);
}

say(`=== doctrine sync · ${NAME} ===`);
if (!fetched) say('  (could not fetch — comparing against the LOCAL hub checkout, which may itself be behind)');

if (!existsSync(MARKER)) {
  if (ADOPT) {
    writeFileSync(MARKER, `${head}\n`);
    say(`\nRecorded ${head.slice(0, 7)} as the doctrine this repo has read.`);
    process.exit(0);
  }
  console.error(
    `\n${NAME} has no .doctrine-sync, so nothing records which doctrine it was written against.`
    + '\nRead DOCTRINE.md and LESSONS.md, then:'
    + `\n  node doctrine-sync.mjs --repo ${argv[ri + 1] ?? '.'} --adopt`,
  );
  process.exit(1);
}

const since = readFileSync(MARKER, 'utf8').trim().split(/\s+/)[0];
let known = true;
try { git('cat-file', '-e', `${since}^{commit}`); } catch { known = false; }
if (!known) {
  console.error(`\n.doctrine-sync names ${since.slice(0, 7)}, which is not a commit in this hub. Re-adopt after reading.`);
  process.exit(1);
}

if (since === head) {
  say(`\nUp to date — ${NAME} has read the doctrine as of ${head.slice(0, 7)}.`);
  process.exit(0);
}

const range = `${since}..${head}`;
const changed = git('diff', '--name-only', range).split('\n').filter(Boolean);
const relevant = changed.filter(f => WATCHED.includes(f));
const other = changed.filter(f => !WATCHED.includes(f));

if (!relevant.length) {
  say(`\nThe hub moved ${git('rev-list', '--count', range)} commit(s), but nothing this repo is held to changed.`);
  if (other.length) say(`  (untouched by the contract: ${other.slice(0, 6).join(', ')}${other.length > 6 ? ', …' : ''})`);
  if (ADOPT) { writeFileSync(MARKER, `${head}\n`); say(`\nMarker moved to ${head.slice(0, 7)}.`); }
  process.exit(0);
}

// WHICH SECTIONS. "DOCTRINE.md changed" sends someone to re-read 900 lines;
// "§7e changed" sends them to the paragraph. Every touched line is mapped to
// the nearest heading above it in the file it lives in.
const sectionsFor = (file) => {
  let after;
  try { after = git('show', `${head}:${file}`); } catch { return []; }
  const lines = after.split('\n');
  const headingAt = [];
  let current = null;
  for (const l of lines) {
    const m = /^#{2,3} (.+)$/.exec(l);
    if (m) current = m[1].trim();
    headingAt.push(current);
  }
  const hunks = git('diff', '-U0', range, '--', file).split('\n')
    .map(l => /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(l))
    .filter(Boolean);
  const hit = new Set();
  for (const h of hunks) {
    const start = Number(h[1]);
    const count = h[2] === undefined ? 1 : Number(h[2]);
    // A pure deletion reports +start,0 — the change belongs to the section the
    // text was removed from, which is the one now at that line.
    for (let i = start; i < start + Math.max(count, 1); i++) {
      const s = headingAt[i - 1];
      if (s) hit.add(s);
    }
  }
  return [...hit];
};

say(`\n${NAME} last read the doctrine at ${since.slice(0, 7)}. Since then:\n`);
for (const f of relevant) {
  const secs = f.endsWith('.md') ? sectionsFor(f) : [];
  say(`  ${f}`);
  for (const s of secs.slice(0, 12)) say(`      · ${s}`);
  if (secs.length > 12) say(`      · …and ${secs.length - 12} more`);
  if (!secs.length) say('      · (changed — no section headings to name)');
}

say('\nThe commits that did it:');
for (const l of git('log', '--format=  %h %s', range, '--', ...relevant).split('\n').filter(Boolean).slice(0, 15)) {
  say(l);
}

if (ADOPT) {
  writeFileSync(MARKER, `${head}\n`);
  say(`\nMarker moved to ${head.slice(0, 7)}. Adopting is an ASSERTION that the above was read —`);
  say('no script can check that, exactly as with handoff-check\'s --ack.');
  process.exit(0);
}

console.error(
  `\n${relevant.length} file(s) this repo is held to have changed and have not been reconciled.`
  + '\nRead them, apply anything this repo now owes, then:'
  + `\n  node doctrine-sync.mjs --repo ${argv[ri + 1] ?? '.'} --adopt`,
);
process.exit(1);
