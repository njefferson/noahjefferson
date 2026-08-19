#!/usr/bin/env node
// COMMITTING ON THE WRONG BRANCH LOOKS EXACTLY LIKE COMMITTING ON THE RIGHT ONE.
//
//   node branch-guard.mjs --repo ../quietkeep --install
//   node branch-guard.mjs --repo ../quietkeep            (check, exits non-zero on drift)
//
// ## Why this exists
//
// Every repo here has a branch that work belongs on, and most have a second one
// that is production. A session checks production out to promote, does not switch
// back, and the next release is committed onto production — silently, because
// nothing about the act looks different. The only thing that has ever caught it
// is a push naming the other branch and moving nothing, which is luck wearing the
// costume of a process.
//
// It has happened repeatedly, across sessions, with the rule written plainly in
// CLAUDE.md the whole time. **An instruction in a file that must be read is not a
// guard.** Doctrine §16.8: make it a gate, not an intention.
//
// ## Why it GENERATES a hook rather than being one
//
// Git hooks must be real files inside the repo, so this cannot be run the way the
// other hub gates are — a sibling cannot point `core.hooksPath` at a script that
// may not be checked out at commit time. So the hook is GENERATED from this one
// source, the way CHANGELOG.md is generated: the copy in a sibling is an artefact,
// never a fork, and `--check` fails if one has drifted. A stale guard is not a
// smaller guard, it is a different one (LESSONS §53).
//
// ## And why it is installed into `.git/hooks`, NOT `core.hooksPath`
//
// The first version pointed `core.hooksPath` at the tracked `.githooks/`. It was
// planted and it PASSED — a commit on production went straight through. Checking
// production out had DELETED the hook, because production predates it: a guard
// that lives in the working tree cannot protect a branch whose contents do not
// include it, and the branch most in need of protecting is exactly the one most
// likely to be older.
//
// `.git/` belongs to no branch, so a copy there survives every checkout. The
// tracked `.githooks/pre-commit` stays as the reviewable source of truth; the
// working copy is installed from it, and `--check` compares both.
//
// ## What a repo declares
//
// A `.branch-guard` file, which is the whole configuration:
//
//   work=staging              the branch commits belong on
//   promote=main              optional: the branch that is production
//   escape=QUIETKEEP_PROMOTE  optional: env var that permits a commit there
//
// A repo with one branch declares `work=main` and nothing else, and then every
// other branch is refused — which is the same protection pointed the other way.

import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const repoAt = args.indexOf('--repo');
const repo = resolve(repoAt >= 0 ? args[repoAt + 1] : '.');
const install = args.includes('--install');

// --artefact: CHECK THE TRACKED HOOK ONLY, AND SAY THAT IS WHAT HAPPENED.
//
// This tool checks four things, and only two of them are facts about the REPO:
// that `.githooks/pre-commit` exists, and that it matches what `.branch-guard`
// declares. The other two — that `.git/hooks/pre-commit` exists and matches it —
// are facts about ONE CLONE, and a CI runner is a clone nobody commits from.
// `actions/checkout` leaves `.git/hooks` empty by definition, so those two can
// never hold there.
//
// Without this flag, a CI step running the plain check FAILS EVERY TIME on
// "`.git/hooks/pre-commit` is MISSING". Quietkeep's Spine did exactly that for
// eight consecutive pushes: the step was added, it was watched passing locally —
// where the hook IS installed — and it had never once passed in CI. That is hub
// LESSONS 53's shape precisely, and this is the second time it has been paid
// for: adding a hard gate to a pipeline creates a new way for the work to
// silently not arrive, and the session that adds it is the least likely to look.
//
// NOT solved by having CI run `--install` first. `--install` WRITES the tracked
// file, so a drifted artefact would be repaired on the spot and the check would
// then pass over the one defect it exists to find.
//
// The two skipped checks are PRINTED as skipped rather than dropped. A check
// that quietly stops applying is the fail-open this tool's own history is about.
const artefactOnly = args.includes('--artefact');

const KNOWN = new Set(['--repo', '--install', '--artefact']);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--repo') { i++; continue; }
  if (args[i].startsWith('-') && !KNOWN.has(args[i])) {
    console.error(`\n  ${args[i]} is not a flag this tool has. Use --repo <path>, --install, --artefact.\n`);
    process.exit(2);
  }
}

const name = repo.split('/').filter(Boolean).pop();

console.log(`\n=== branch guard · ${name} ===`);

const declPath = join(repo, '.branch-guard');
if (!existsSync(declPath)) {
  console.error(`
  No .branch-guard in ${name}.

  Write one — it is three lines at most, and it is the whole configuration:

      work=staging
      promote=main
      escape=${(name ?? 'REPO').toUpperCase().replace(/[^A-Z0-9]/g, '_')}_PROMOTE

  A repo with a single branch declares only \`work=main\`.

  Optionally, \`also=path/to/check\` (repeatable) names a repo-local executable
  the hook runs before the branch rule, on every commit including a promote.
`);
  process.exit(1);
}

const decl = {};
/** `also=` may appear more than once — every other key is single-valued. */
const also = [];
for (const line of readFileSync(declPath, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i <= 0) continue;
  const key = t.slice(0, i).trim();
  const value = t.slice(i + 1).trim();
  if (key === 'also') { if (value) also.push(value); continue; }
  decl[key] = value;
}
if (!decl.work) {
  console.error('  .branch-guard names no `work=` branch, which is the one thing it must say.\n');
  process.exit(1);
}
if (decl.promote && !decl.escape) {
  console.error('  .branch-guard names a `promote=` branch but no `escape=` variable.');
  console.error('  A production branch with no declared way in is a guard nobody can get past.\n');
  process.exit(1);
}

/** The hook, built from the declaration. Plain sh: it runs on every commit, in
 *  every environment, and must not depend on node being resolvable. */
const hook = () => {
  const L = [];
  L.push('#!/bin/sh');
  L.push('# GENERATED by noahjefferson/branch-guard.mjs — do not edit here.');
  L.push('# Change .branch-guard and re-run:  node ../noahjefferson/branch-guard.mjs --repo . --install');
  L.push('#');
  L.push('# Committing on the wrong branch looks exactly like committing on the right');
  L.push('# one, which is why an instruction in a file never caught it and this does.');
  L.push('');
  // REPO-LOCAL CHECKS FIRST, declared with `also=` — one per line, each a path
  // to an executable in the repo. They run on EVERY commit including a promote,
  // because they are about what is being committed rather than about where.
  //
  // They exist because the branch rule is not the only thing that an instruction
  // in a file has failed to enforce. Quietkeep's walkthrough ships photographs
  // of its own UI, and a picture of a version that no longer exists is worse
  // than no picture at all — that has to be caught at the moment the UI changes,
  // which is here, not in a review nobody does.
  //
  // A MISSING OR NON-EXECUTABLE `also` SCRIPT IS A FAILURE, not a skip. A hook
  // that quietly stops running one of its checks is the fail-open this whole
  // file exists to avoid: the first version of the guard itself pointed at
  // `core.hooksPath` and vanished on an older checkout.
  for (const path of also) {
    L.push(`if [ ! -x "${path}" ]; then`);
    L.push(`  echo "" >&2`);
    L.push(`  echo "  REFUSED — .branch-guard declares also=${path} and it is missing or not executable." >&2`);
    L.push(`  echo "  A declared check that silently stops running is worse than no check." >&2`);
    L.push(`  echo "" >&2`);
    L.push('  exit 1');
    L.push('fi');
    L.push(`"${path}" || exit 1`);
    L.push('');
  }
  L.push("branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo '')");
  L.push('');
  L.push(`if [ "$branch" = "${decl.work}" ]; then exit 0; fi`);
  if (decl.promote) {
    L.push(`if [ "$branch" = "${decl.promote}" ] && [ -n "$${decl.escape}" ]; then exit 0; fi`);
  }
  L.push('');
  L.push('echo "" >&2');
  L.push(`echo "  REFUSED — you are on '$branch'. Work in this repo commits to '${decl.work}'." >&2`);
  L.push('echo "" >&2');
  if (decl.promote) {
    L.push(`echo "  If you meant to promote to ${decl.promote}, say so out loud:" >&2`);
    L.push('echo "" >&2');
    L.push(`echo "      ${decl.escape}=1 git commit ..." >&2`);
    L.push('echo "" >&2');
  }
  L.push('echo "  To move what you have written and keep it:" >&2');
  L.push('echo "" >&2');
  L.push(`echo "      git stash -u && git checkout ${decl.work} && git stash pop" >&2`);
  L.push('echo "" >&2');
  L.push('exit 1');
  L.push('');
  return L.join('\n');
};

const want = hook();
const hookPath = join(repo, '.githooks', 'pre-commit');
const livePath = join(repo, '.git', 'hooks', 'pre-commit');
const have = existsSync(hookPath) ? readFileSync(hookPath, 'utf8') : null;
const live = existsSync(livePath) ? readFileSync(livePath, 'utf8') : null;

if (install) {
  mkdirSync(join(repo, '.githooks'), { recursive: true });
  writeFileSync(hookPath, want);
  chmodSync(hookPath, 0o755);
  // And into .git/hooks, which no branch owns and no checkout can remove.
  mkdirSync(join(repo, '.git', 'hooks'), { recursive: true });
  writeFileSync(livePath, want);
  chmodSync(livePath, 0o755);
  console.log(`  wrote .githooks/pre-commit (tracked) and .git/hooks/pre-commit (live)`);
  console.log(`  commits allowed on '${decl.work}'${decl.promote ? `, and on '${decl.promote}' with ${decl.escape}=1` : ' and nowhere else'}`);
  console.log(`
  A fresh clone has no .git/hooks and no memory of this, so the install has to
  run on setup. Put it in whatever this repo already runs — an npm \`prepare\`
  script if it has a package.json, which runs on every \`npm ci\` and therefore
  on every session and every CI job:

      "prepare": "node ../noahjefferson/branch-guard.mjs --repo . --install || true"

  Do NOT set core.hooksPath at the tracked directory. That was the first attempt
  and it failed open: checking out an older branch deletes the hook with it.
`);
  process.exit(0);
}

if (have === null) {
  console.error('  No .githooks/pre-commit. Install it:  --install\n');
  process.exit(1);
}
if (have !== want) {
  console.error('  .githooks/pre-commit has DRIFTED from what .branch-guard declares.');
  console.error('  A stale guard is not a smaller guard, it is a different one. Re-run with --install.\n');
  process.exit(1);
}
if (artefactOnly) {
  console.log('  ok    .githooks/pre-commit matches what .branch-guard declares');
  console.log('  --    .git/hooks/pre-commit NOT checked (--artefact): whether a hook is');
  console.log('        installed is a fact about one clone, and this is not the clone');
  console.log('        anybody commits from. Every developer clone still gets both checks.');
  console.log(`\nThe tracked guard is current — commits on '${decl.work}'${decl.promote ? `, promote on '${decl.promote}' via ${decl.escape}` : ''}.\n`);
  process.exit(0);
}
if (live === null) {
  console.error('  .git/hooks/pre-commit is MISSING — the tracked copy is not the one git runs.');
  console.error('  Nothing is guarded. Re-run with --install.');
  console.error('  (In CI there is no clone to guard — use --artefact, which checks the');
  console.error('   tracked hook against .branch-guard and says which checks it skipped.)\n');
  process.exit(1);
}
if (live !== want) {
  console.error('  .git/hooks/pre-commit has drifted from the tracked copy — git is running the OLD rule.\n');
  process.exit(1);
}
console.log(`  ok    the hook matches .branch-guard — commits on '${decl.work}'${decl.promote ? `, promote on '${decl.promote}' via ${decl.escape}` : ''}`);
console.log('\nThe guard is installed and current.\n');
