#!/usr/bin/env node
// WHAT A SESSION NEEDS TO KNOW BEFORE IT TOUCHES ANYTHING.
//
//   node session-brief.mjs --repo .
//
// ## Why this exists
//
// A session starts with no memory. The only file loaded automatically is
// `CLAUDE.md`. Everything else — the doctrine, 81 lessons, the repo map, what is
// staged, what is owed — has to be OPENED, and nothing ever made a session open
// it. So the knowledge was all written down and none of it was known, and the
// owner became the layer that carried it between sessions by hand.
//
// The hub's own `CLAUDE.md` says "run this FIRST in any sibling session" about
// `doctrine-sync.mjs`. That sentence has been there for weeks. A sentence is not
// a mechanism, and the sessions that wrote it went on not running it. This is
// printed by a SessionStart hook instead, so it arrives whether or not anybody
// thought to ask for it.
//
// ## What it prints, and what it deliberately does not
//
// Only what a session cannot get from `CLAUDE.md`, which is already loaded:
// which branch it is on versus where work belongs, whether the doctrine has
// moved since this repo last reconciled, the repo family, and the LESSONS index
// — titles only, because 5,500 lines is not a briefing and a session that is
// told "there are 81 of these, here are their names" can go and read the four
// that matter.
//
// It states what it could not reach rather than staying quiet about it. A brief
// that silently omits the hub because the hub is not checked out is worse than
// one that says so.

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const at = args.indexOf('--repo');
const repo = resolve(at >= 0 ? args[at + 1] : '.');
const hub = dirname(fileURLToPath(import.meta.url));
const name = repo.split('/').filter(Boolean).pop() ?? 'this repo';

const out = [];
const say = (s = '') => out.push(s);
const sh = (cmd, cwd = repo) => {
  try { return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
};

say(`=== session brief · ${name} ===`);
say();

// --- 0 · IS EITHER CLONE STALE? ---------------------------------------------
//
// Before anything else, because everything else is a claim ABOUT these trees
// and a stale one answers every question confidently and wrongly.
//
// A container re-cloned at a months-old commit three times in one session. The
// tree looks completely normal each time — a real repo, a real branch, tests
// that pass — and simply does not contain the work. Twice it was measured
// against before anybody noticed. Once a merge was built on the stale tip that
// would have rewritten production history had it been pushed.
//
// AND THE HUB IS THE ONE THAT MATTERS MOST, because many sessions write to it
// at once and every sibling reads its doctrine, its lessons and its gates from
// here. A hub clone 45 commits behind produced a LESSONS entry numbered against
// a file that ended twenty-nine entries earlier — authored in full, and caught
// only because somebody else had pushed first and git rejected it. Rejection is
// not a gate; it depends on a race being lost.
//
// The cost of staleness lands when you START WRITING, not when you push. One
// fetch each, before the session has a chance to conclude anything.
for (const [label, dir] of [[name, repo], ['the hub', hub]]) {
  const br = sh('git symbolic-ref --short HEAD', dir);
  if (!br) continue;
  sh(`git fetch --quiet origin ${br}`, dir);
  const behind = parseInt(sh(`git rev-list --count HEAD..origin/${br}`, dir) ?? '0', 10);
  if (behind > 0) {
    say(`*** ${label.toUpperCase()} IS STALE — ${behind} commit(s) behind origin/${br}. ***`);
    say('    The tree looks normal and is not. Do not measure against it, do not');
    say('    build a merge on it, and do not number anything off the end of a file');
    say('    in it. Catch up first:');
    say('');
    say(`      git -C ${dir} reset --hard origin/${br}`);
    say('');
  }
}

// --- 1 · where am I, and where does work belong -----------------------------
//
// First because it is the one that has actually gone wrong repeatedly, and
// because it is the one a session cannot notice being wrong about.
const branch = sh('git symbolic-ref --short HEAD') ?? '(detached)';
const guardPath = join(repo, '.branch-guard');
let work = null; let promote = null; let escape = null;
if (existsSync(guardPath)) {
  for (const line of readFileSync(guardPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim(); const v = t.slice(i + 1).trim();
    if (k === 'work') work = v;
    if (k === 'promote') promote = v;
    if (k === 'escape') escape = v;
  }
}
say(`BRANCH: on '${branch}'.`);
if (work) {
  if (branch === work) say(`  Correct — work in this repo commits to '${work}'.`);
  else if (branch === promote) say(`  This is PRODUCTION. Work belongs on '${work}'. A commit here is refused unless ${escape}=1.`);
  else say(`  Work in this repo commits to '${work}'. A commit here will be refused.`);
} else {
  say('  No .branch-guard — this repo is UNGUARDED. Write one and install:');
  say('    node ../noahjefferson/branch-guard.mjs --repo . --install');
}
const dirty = sh('git status --porcelain');
if (dirty) say(`  ${dirty.split('\n').length} file(s) uncommitted.`);
say();

// --- 2 · has the doctrine moved -------------------------------------------
const syncFile = join(repo, '.doctrine-sync');
if (repo !== hub) {
  if (!existsSync(join(hub, 'DOCTRINE.md'))) {
    say('DOCTRINE: the hub is not checked out beside this repo, so drift CANNOT be checked.');
    say('  Nothing here has verified that this repo is current. Say so rather than assuming it is.');
  } else if (!existsSync(syncFile)) {
    say('DOCTRINE: this repo has never recorded a reconciliation. Run:');
    say('  node ../noahjefferson/doctrine-sync.mjs --repo .');
  } else {
    const readAt = readFileSync(syncFile, 'utf8').trim().slice(0, 7);
    const head = sh('git rev-parse --short HEAD', hub);
    say(readAt === head
      ? `DOCTRINE: current — read as of ${readAt}.`
      : `DOCTRINE: last read at ${readAt}, hub is at ${head}. Run doctrine-sync.mjs --repo . BEFORE working.`);
  }
  say();
}

// --- 3 · the family --------------------------------------------------------
const reposMd = join(hub, 'REPOS.md');
if (existsSync(reposMd)) {
  const names = readFileSync(reposMd, 'utf8')
    .split('\n').filter((l) => l.startsWith('## njefferson/'))
    .map((l) => l.replace('## ', '').split(' —')[0].trim());
  say(`REPOS (${names.length}): ${names.join(', ')}`);
  say('  Full map, branch models and what each still owes: noahjefferson/REPOS.md');
} else {
  say('REPOS: no REPOS.md in the hub — the family is undocumented.');
}
say();

// --- 4 · the lessons, by title only ----------------------------------------
//
// Titles, never bodies. The point is to make a session able to find the four
// that apply, not to read it 5,500 lines it will skim.
const lessons = join(hub, 'LESSONS.md');
if (existsSync(lessons)) {
  // Both heading shapes, and the lettered ones. The first version matched only
  // `## N · ` and reported 64 of 90 — a brief that undercounts is a brief that
  // lies, and it would have quietly hidden the earliest lessons, which are the
  // ones a new session is least likely to know exist.
  const titles = readFileSync(lessons, 'utf8')
    .split('\n').filter((l) => /^## \d+[a-z]?[ .·]/.test(l)).map((l) => l.slice(3).trim());
  say(`LESSONS (${titles.length}) — titles only; read the ones that apply in noahjefferson/LESSONS.md:`);
  for (const t of titles) say(`  ${t}`);
} else {
  say('LESSONS: the hub is not checked out, so the cross-app record is UNAVAILABLE this session.');
}
say();

say('This brief is printed by a SessionStart hook. It exists because every one of');
say('the facts above was already written down and none of it was being read.');

console.log(out.join('\n'));
