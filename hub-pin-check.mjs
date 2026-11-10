// hub-pin-check.mjs — every pin on this hub is a commit the hub's main reaches.
//
// CANONICAL IN THE HUB. Never fork it: a sibling runs this copy with --repo, and
// the copies the siblings carry under tools/ are superseded by it.
//
//   node hub-pin-check.mjs --repo ../myapp
//   node hub-pin-check.mjs --repo ../myapp --hub /root/.claude/hub
//   node hub-pin-check.mjs --repo ../myapp --no-fetch
//
// WHY.
//
// The hub's history was rewritten once to take the chat-session trailers out of
// every commit message, which gave every commit a new SHA. A workflow pinned to
// a pre-rewrite commit KEEPS WORKING: GitHub serves a commit no ref reaches, so
// actions/checkout fetches it and the gates run green out of a tree frozen
// before the rewrite — one that can never contain a gate added since. Nothing
// fails, so nothing is found. A pin that is on no branch of the hub is the one
// failure here with no failing signal to find it by (LESSONS §334).
//
// WHAT IT READS. Every workflow under .github/workflows for a `uses:` line that
// names this hub, and the repo's .doctrine-sync marker.
//
// WHAT IT REFUSES.
//   - a pin that is not a full 40-character commit (a branch or a tag resolves
//     to gates nobody chose, in a run that reports success);
//   - a pin that is not a commit the hub has;
//   - a pin the hub's main does not reach, read with `git merge-base
//     --is-ancestor` against the hub checkout;
//   - a .doctrine-sync marker naming a commit the hub does not have.
//
// WHERE THE HUB IS. A checkout named by --hub, else the one beside the repo
// (../noahjefferson), else /root/.claude/hub. Where none is found it SKIPS and
// says so, because a check that cannot look must not be read as a check that
// looked and found nothing.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { repoFromArgv } from './gate-args.mjs';

export const HUB_REPO = 'njefferson/noahjefferson';

const gitIn = (hub, ...args) => execFileSync('git', ['-C', hub, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const gitOk = (hub, ...args) => {
  try { execFileSync('git', ['-C', hub, ...args], { stdio: 'ignore' }); return true; } catch { return false; }
};

// The subject line of a commit, as ` ("subject")`, or '' where the hub has no such commit (Q-HUB-378). Every commit this check prints
// carries its subject beside it, because a log that masks long runs of hex characters blanks a bare id and leaves nothing to say which
// commit is meant. Only a hex id of seven to forty characters is looked up, so a ref that is a branch word or an option is never handed to git.
const subjectOf = (hub, ref) => {
  if (!/^[0-9a-f]{7,40}$/.test(ref)) return '';
  try {
    const s = gitIn(hub, 'log', '-1', '--format=%s', ref, '--');
    return s ? ` ("${s}")` : '';
  } catch { return ''; }
};

// A hub checkout is a git work tree that holds this file's siblings.
const isHub = (p) => !!p && existsSync(join(p, 'DOCTRINE.md')) && existsSync(join(p, 'branch-guard.mjs'))
  && gitOk(p, 'rev-parse', '--git-dir');

export const findHub = (repo, given) => {
  const tried = [];
  // A hub that is NAMED is the only one looked at: falling through to another
  // checkout when the named one is wrong would compare against a hub nobody
  // chose.
  const candidates = given
    ? [resolve(given)]
    : [resolve(repo, '..', 'noahjefferson'), '/root/.claude/hub'];
  for (const c of candidates) {
    // The repo under test is never its own hub.
    if (resolve(c) === resolve(repo)) { tried.push(`${c} (is the repo itself)`); continue; }
    if (isHub(c)) return { hub: c, tried };
    tried.push(c);
  }
  return { hub: null, tried };
};

// Every `uses:` line naming this hub, in every workflow. The ref is read up to
// whitespace or a comment, exactly as the line is written.
export const readPins = (repo) => {
  const dir = join(repo, '.github', 'workflows');
  const pins = [];
  if (!existsSync(dir)) return pins;
  const re = new RegExp(`^\\s*(?:-\\s*)?uses:\\s*['"]?${HUB_REPO.replace('/', '\\/')}\\/\\S*?@([^\\s'"#]+)`, 'i');
  for (const f of readdirSync(dir).filter((n) => /\.ya?ml$/i.test(n)).sort()) {
    readFileSync(join(dir, f), 'utf8').split('\n').forEach((line, i) => {
      const m = re.exec(line);
      if (m) pins.push({ file: `.github/workflows/${f}`, line: i + 1, ref: m[1] });
    });
  }
  return pins;
};

// The ref of the hub's main as this checkout knows it.
export const mainRef = (hub) => (gitOk(hub, 'rev-parse', '--verify', '--quiet', 'refs/remotes/origin/main') ? 'origin/main' : 'main');

// Judge one pin. Returns null when it is good, else the sentence that says why not.
export const judgePin = (hub, ref) => {
  if (!/^[0-9a-f]{40}$/.test(ref)) {
    return `is "${ref}", not a full 40-character commit; a branch or a tag resolves to gates nobody chose`;
  }
  if (!gitOk(hub, 'cat-file', '-e', `${ref}^{commit}`)) {
    return 'is not a commit this hub has';
  }
  if (!gitOk(hub, 'merge-base', '--is-ancestor', ref, mainRef(hub))) {
    return `is on no line of the hub's ${mainRef(hub)}: GitHub still serves it, so the gates run green out of a tree no branch reaches`;
  }
  return null;
};

const main = () => {
  const argv = process.argv.slice(2);
  const { REPO, NAME } = repoFromArgv(argv, { gate: 'hub-pin-check.mjs', flags: ['--hub'], fallback: process.cwd() });
  const hi = argv.indexOf('--hub');
  const given = hi >= 0 ? argv[hi + 1] : null;
  const NO_FETCH = argv.includes('--no-fetch');

  console.log(`=== hub pin check · ${NAME} ===`);
  const { hub, tried } = findHub(REPO, given);
  if (!hub) {
    console.log(`  --    SKIPPED: no hub checkout found (looked at ${tried.join(', ')}); nothing was checked.`);
    console.log('        This is a skip and not a pass: a pin was not compared with anything.');
    process.exit(0);
  }
  console.log(`  hub checkout: ${hub}`);

  if (!NO_FETCH) {
    try { gitIn(hub, 'fetch', 'origin', 'main', '--quiet'); } catch {
      console.log('  --    could not fetch: comparing against the hub checkout as it stands, which may be behind.');
    }
  }

  let bad = 0;
  const pins = readPins(REPO);
  if (!pins.length) console.log('  --    no workflow of this repo names the hub, so there is no pin to read.');
  for (const p of pins) {
    const why = judgePin(hub, p.ref);
    if (why) { bad++; console.log(`  FAIL  ${p.file}:${p.line} pin ${p.ref.slice(0, 12)}${subjectOf(hub, p.ref)} ${why}`); }
    else console.log(`  ok    ${p.file}:${p.line} pin ${p.ref}${subjectOf(hub, p.ref)} is a commit the hub's ${mainRef(hub)} reaches`);
  }

  const marker = join(REPO, '.doctrine-sync');
  if (existsSync(marker)) {
    const since = readFileSync(marker, 'utf8').trim().split(/\s+/)[0] ?? '';
    if (!since || !gitOk(hub, 'cat-file', '-e', `${since}^{commit}`)) {
      bad++;
      console.log(`  FAIL  .doctrine-sync names ${since.slice(0, 12) || '(nothing)'}${subjectOf(hub, since)}, which is not a commit this hub has; the drift since it cannot be listed`);
      console.log('        read the doctrine whole, then: node doctrine-sync.mjs --repo <this repo> --adopt');
    } else {
      console.log(`  ok    .doctrine-sync names ${since.slice(0, 7)}${subjectOf(hub, since)}, a commit the hub has`);
    }
  } else {
    console.log('  --    no .doctrine-sync marker in this repo.');
  }

  if (bad) {
    console.error(`\n${bad} fault(s). A pin is re-pinned to a commit on the hub's main; a marker is re-adopted after the doctrine is read.`);
    process.exit(1);
  }
  console.log('\nevery pin and marker names a commit the hub has and its main reaches.');
  process.exit(0);
};

// Run only as a script: hub-gates-local.mjs imports the readers above.
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
