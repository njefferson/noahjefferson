#!/usr/bin/env node
// A PLAN APPROVED FOR ONE THING IS NOT AUTHORITY FOR WHATEVER THE SESSION DID
// NEXT, AND NOTHING WAS CHECKING THE GAP.
//
// `plan-guard.mjs` refuses a write made OUTSIDE plan mode. It says nothing
// about whether a write made INSIDE it, once the plan is approved and the
// session keeps going, is still the plan that was shown. A session can get
// the nod on three named files and, by the time it commits, have touched
// nine — a new gate committed that the plan said would stay in the
// scratchpad, a `.branch-guard` line added, seven declarations rewritten in
// an allow-list, seven hundred more words of "why" than the plan asked for.
// Each edit is individually reasonable. None of it was re-approved, because
// approval happened once, at the top, and nothing sat at the bottom asking
// whether the diff still matched what was agreed.
//
// THIS DOES NOT JUDGE SCOPE ITSELF. A script comparing text to a diff cannot
// tell "the plan said refactor this function" from "the plan said refactor
// this function, and this is a different function that happens to share a
// name" — that needs a reader, a WATCHER: a second agent or the owner,
// looking at the plan and the actual diff side by side. So this is not a
// judge, it is a LEDGER. It holds one verdict to the exact plan and the exact
// diff it was rendered against, and refuses to let either one move without
// invalidating it.
//
//   node plan-scope-check.mjs --repo=<path>              check (exit 1 on drift)
//   node plan-scope-check.mjs --repo=<path> --record \
//     --verdict="IN-SCOPE: <one line>" < finding.txt      accept a watcher's
//                                                          verdict, reading its
//                                                          full finding from
//                                                          stdin
//
// THE LOAD-BEARING RULE, same shape as preview-version-check's `--proven` and
// handoff-check's `--ack`: an assertion a session can fake is only worth
// having if faking it is not the path of least resistance. A verdict of
// anything but the exact token IN-SCOPE must not be able to mint a passing
// record. Recording refuses and prints exactly what was rejected; nothing is
// written. A gate that could be argued past by writing OUT-OF-SCOPE and
// trying again is not a gate.
//
// WHAT THE DIFF ACTUALLY IS, and why it is three pieces and not one: a
// reviewer merging this branch to the promote branch has not yet seen the
// working tree, the staged index, OR the commits already made on this branch
// that have not reached that branch. All three are "not yet judged", so all
// three are hashed together — see `diffForScope` below, the contract this
// file exists partly to demonstrate.
//
// THE PLAN'S SCOPE PRINTS ON EVERY RUN, PASS OR FAIL — deliberately, the same
// two-exposure design already used for decision records here: no parser tells
// reading a plan from having read it, so the plan is put in front of whoever
// is at the boundary, unasked, every single time.
//
// Wired into `.branch-guard`'s `also=` list like the rest of this family, so
// it runs on every commit while a repo names a plan in force.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const argv = process.argv.slice(2);

// `--repo=<path>`, matching this repo's own tools/*-check.mjs (this file has
// to run standalone from a sibling, same as preview-version-check does from
// inside Jefferson-Photography-Studio) rather than the hub's space-separated
// `--repo <path>` — the exact spelling this gate was asked for.
const repoArgRaw = argv.find((a) => a.startsWith('--repo='));
const GIVEN = repoArgRaw ? repoArgRaw.slice('--repo='.length) : '.';
const REPO = resolve(GIVEN);
const REPO_NAME = REPO.split('/').filter(Boolean).pop() || REPO;

const PLAN_POINTER = join(REPO, '.claude', 'PLAN');
const RECORD = join(REPO, '.plan-scope');
const BRANCH_GUARD = join(REPO, '.branch-guard');

const sha16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

/**
 * The diff a scope verdict has to be judged against: everything on this
 * branch a reviewer merging to the promote branch has not yet seen — the
 * dirty working tree, the staged index, and (when the promote branch exists
 * locally) the commits this branch carries that the promote branch does not.
 *
 * @param {string} repo - Absolute path to the repository's working tree.
 *   The caller resolves any relative or `--repo=` path before calling this;
 *   it is passed straight to `git` as the working directory.
 * @returns {{
 *   hash: string,
 *   promote: string,
 *   promoteFound: boolean,
 * }}
 *   `hash` is the first 16 hex characters of a sha256 over every path git
 *   reports as changed or untracked, sorted, each with the sha256 of what is
 *   on disk now (or the token `deleted`), followed by `git diff
 *   <promote>...HEAD` when `promoteFound` is true.
 *
 *   IT MUST BE INDEPENDENT OF THE INDEX, and that is the invariant every
 *   caller relies on: `git add` must not move it. A pre-commit hook always
 *   sees staged files, so a hash that changes on staging makes every verdict
 *   recorded beforehand void at the moment it is needed. Status CODES are
 *   therefore discarded and only paths and content are hashed. `.plan-scope`
 *   is excluded throughout — it is this gate's own record, written after this
 *   hash is taken, so including it would make every verdict self-invalidating
 *   the moment the file is tracked. `promote` is the branch name this repo's
 *   `.branch-guard` names (its `promote=` line), or `"main"` when that file
 *   or that line is absent. `promoteFound` is false when that branch does not
 *   exist in this local clone, in which case `hash` covers only the working
 *   tree and the index — THE CALLER MUST SAY SO in its own output; this
 *   function prints nothing and makes no judgement about whether that is
 *   acceptable. A caller that records a verdict against this hash is
 *   trusting that the diff named here is the diff the watcher actually read;
 *   calling this function again, the same way, on the same tree, is the only
 *   thing that can confirm that later — it must be pure with respect to
 *   anything other than the working tree, the index and git history.
 */
export function diffForScope(repo) {
  const bg = existsSync(join(repo, '.branch-guard'))
    ? readFileSync(join(repo, '.branch-guard'), 'utf8')
    : '';
  // `work=` is read too, per this gate's own contract with the rest of the
  // family — declared here even though only `promote=` feeds the hash, so a
  // `.branch-guard` missing `promote=` entirely still reads as one repo's
  // config rather than as two separate lookups.
  const workMatch = /^\s*work\s*=\s*(.+?)\s*$/m.exec(bg);
  const promoteMatch = /^\s*promote\s*=\s*(.+?)\s*$/m.exec(bg);
  void workMatch;
  const promote = promoteMatch ? promoteMatch[1] : 'main';

  let promoteFound = false;
  try {
    execSync(`git rev-parse --verify --quiet ${JSON.stringify(`refs/heads/${promote}`)}`, {
      cwd: repo,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    promoteFound = true;
  } catch {
    promoteFound = false;
  }

  const run = (cmd) => {
    try {
      return execSync(cmd, { cwd: repo, encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });
    } catch (e) {
      // `git diff` on a bad ref or a repo with no HEAD yet exits non-zero.
      // Whatever it managed to print is still real diff text; anything less
      // than that is empty, never a crash.
      return typeof e.stdout === 'string' ? e.stdout : '';
    }
  };

  // INDEX-INDEPENDENT, AND THAT IS THE WHOLE DIFFICULTY. The first version
  // hashed `git diff HEAD` and `git diff --cached` as separate labelled
  // sections. Staging moves content from one to the other, so `git add`
  // changed the hash without changing one byte of work — and a pre-commit hook
  // ALWAYS sees staged files, so a verdict recorded before the add could never
  // survive to the commit. Found by using it: the gate refused the very commit
  // that installed it.
  //
  // So this hashes the WORKING TREE against HEAD by content, never the index:
  // every path git reports as changed or untracked, sorted, each with the
  // sha256 of what is on disk now (or the token `deleted`). Status CODES are
  // discarded deliberately — `?? foo` becomes `A  foo` on staging, and reading
  // the code back in would reintroduce exactly the instability being removed.
  //
  // THE RECORD IS NOT WORK, AND EXCLUDING IT IS LOAD-BEARING. `--record`
  // computes this hash BEFORE it writes `.plan-scope`. Once that file is
  // tracked — which it must be, so the verdict travels with the commit it
  // covers — including it would make every recorded verdict self-invalidating.
  const status = run('git status --porcelain=v1 -z');
  const paths = new Set();
  for (const rec of status.split('\0')) {
    if (!rec) continue;
    // "XY path". A rename's origin follows as its own NUL-separated record,
    // which this loop picks up on the next turn as a bare path.
    const path = rec.length > 3 && /^[ MADRCU?!]{2} /.test(rec) ? rec.slice(3) : rec;
    if (path && path !== '.plan-scope') paths.add(path);
  }

  const h = createHash('sha256');
  for (const path of [...paths].sort()) {
    h.update('path\n').update(path).update('\n');
    try {
      h.update(createHash('sha256').update(readFileSync(join(repo, path))).digest('hex'));
    } catch {
      h.update('deleted');
    }
    h.update('\n');
  }
  // The commits this branch carries that the promote branch does not. Already
  // index-independent; excluded path kept for the same reason as above.
  const branchOnly = promoteFound
    ? run(`git diff ${JSON.stringify(`${promote}...HEAD`)} -- . ':(exclude).plan-scope'`)
    : '';
  h.update('branch\n').update(branchOnly);

  return { hash: h.digest('hex').slice(0, 16), promote, promoteFound };
}

/**
 * The plan's own scope, verbatim where the plan states it — never a
 * paraphrase, because a paraphrase is exactly the drift this gate exists to
 * catch one layer up.
 *
 * @param {string} planText - The plan markdown file's full contents.
 * @returns {string} Either the `## What to build` and/or `## Files` sections
 *   (whichever are present, each including its own heading, in document
 *   order) with trailing blank lines trimmed, or — when NEITHER section is
 *   present — the first 40 lines of the plan unmodified. Never empty for a
 *   non-empty plan.
 */
function planScope(planText) {
  const section = (name) => {
    const re = new RegExp(`^##\\s+${name}\\s*$`, 'mi');
    const m = re.exec(planText);
    if (!m) return null;
    const from = m.index;
    const rest = planText.slice(from + m[0].length);
    const next = /\n##\s+\S/.exec(rest);
    const body = next ? rest.slice(0, next.index) : rest;
    return (m[0] + body).replace(/\s+$/, '');
  };

  const what = section('What to build');
  const files = section('Files');
  if (what || files) return [what, files].filter(Boolean).join('\n\n');
  return planText.split('\n').slice(0, 40).join('\n');
}

console.log(`=== plan scope · ${REPO_NAME} ===\n`);

if (!existsSync(PLAN_POINTER)) {
  console.log('ok    no .claude/PLAN in force — work outside plan mode is not what this gates');
  process.exit(0);
}

const planPathRaw = readFileSync(PLAN_POINTER, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .find(Boolean);

if (!planPathRaw) {
  console.error('FAIL  .claude/PLAN is present and empty.');
  console.error('      It must hold one line: the absolute path to the approved plan file.');
  process.exit(1);
}

if (!existsSync(planPathRaw)) {
  console.error(`FAIL  .claude/PLAN names ${planPathRaw}, and that file does not exist.`);
  console.error('      A pointer to a missing plan is a failure here, not a skip — the repo');
  console.error('      claims a plan is in force and there is nothing left to hold it to.');
  console.error('      Fix: restore the plan file, or point .claude/PLAN somewhere real.');
  process.exit(1);
}

const planText = readFileSync(planPathRaw, 'utf8');
const planhash = sha16(planText);

console.log(`plan: ${planPathRaw}\n`);
console.log(planScope(planText));
console.log('');

const { hash: diffhash, promote, promoteFound } = diffForScope(REPO);
if (!promoteFound) {
  console.log(`  · promote branch "${promote}" not found locally — hashing the working tree`);
  console.log('    and the index only, not this branch\'s unmerged commits\n');
}

const fixCommand = (verdictHint) =>
  `      node plan-scope-check.mjs --repo=${GIVEN} --record --verdict="${verdictHint}" < finding.txt`;

/* -------------------------------------------------------------------- *
 * --record: accept a watcher's verdict
 * -------------------------------------------------------------------- */

if (argv.includes('--record')) {
  const verdictArg = argv.find((a) => a.startsWith('--verdict='));
  const verdict = verdictArg ? verdictArg.slice('--verdict='.length) : '';

  if (!verdict) {
    console.error('FAIL  --record needs --verdict="<one line>" — nothing to accept.');
    process.exit(2);
  }

  let finding = '';
  try {
    finding = readFileSync(0, 'utf8');
  } catch {
    finding = '';
  }

  if (!verdict.startsWith('IN-SCOPE')) {
    console.error('REFUSED  the verdict does not start with IN-SCOPE. Rejected, not recorded:\n');
    console.error(`    ${verdict}\n`);
    console.error('  Nothing was written. A verdict that is not IN-SCOPE must not be able to');
    console.error('  mint a passing record — that is the one rule this gate will not bend on.');
    process.exit(1);
  }

  const findingLines = finding.split('\n');
  while (findingLines.length && findingLines[findingLines.length - 1].trim() === '') {
    findingLines.pop();
  }

  const record = [
    '# Written by plan-scope-check.mjs --record. Not hand-edited.',
    `plan=${planPathRaw}`,
    `planhash=${planhash}`,
    `diffhash=${diffhash}`,
    `verdict=${verdict}`,
    ...(findingLines.length ? findingLines.map((l) => `# ${l}`) : []),
  ];
  writeFileSync(RECORD, `${record.join('\n')}\n`);
  console.log(`ok    recorded "${verdict}" at plan ${planhash}, diff ${diffhash}`);
  process.exit(0);
}

/* -------------------------------------------------------------------- *
 * check (default)
 * -------------------------------------------------------------------- */

if (!existsSync(RECORD)) {
  console.error('FAIL  no .plan-scope recorded — this diff has never been judged against the plan.');
  console.error('      Fix: have a watcher read the plan and this diff, then record its verdict —');
  console.error(fixCommand('IN-SCOPE: <why>'));
  process.exit(1);
}

const recordText = readFileSync(RECORD, 'utf8');
const rec = {};
for (const line of recordText.split('\n')) {
  const m = /^(\w+)=(.*)$/.exec(line);
  if (m) rec[m[1]] = m[2];
}

if (rec.planhash !== planhash) {
  console.error(`FAIL  the plan file has changed since the recorded verdict (${rec.planhash || '(none)'} -> ${planhash}).`);
  console.error('      The verdict was rendered against a plan that no longer exists as written.');
  console.error('      Fix: have a watcher re-read the changed plan and this diff, then —');
  console.error(fixCommand('IN-SCOPE: <why>'));
  process.exit(1);
}

if (rec.diffhash !== diffhash) {
  console.error(`FAIL  the work has changed since the recorded verdict (${rec.diffhash || '(none)'} -> ${diffhash}).`);
  console.error('      The verdict covers a diff this commit no longer matches.');
  console.error('      Fix: have a watcher re-read the plan and the current diff, then —');
  console.error(fixCommand('IN-SCOPE: <why>'));
  process.exit(1);
}

console.log(`ok    plan scope holds — verdict "${rec.verdict}" still covers this plan and this diff`);
process.exit(0);
