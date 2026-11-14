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
//   escape-also=QUIETKEEP_DEFER  optional: env var that DEFERS the `also=` checks
//                                for one commit. Every `also=` check must also be
//                                a CI step, so this moves when, never whether.
//   msg-also=tools/check.sh  optional, repeatable: an executable the commit-msg hook
//                                runs after the hub's own refusals, given the message
//                                file's path; non-zero refuses.
//
// A repo with one branch declares `work=main` and nothing else, and then every
// other branch is refused — which is the same protection pointed the other way.
//
// `work=` MAY NAME A FAMILY rather than one branch: `work=claude/*` is a shell
// glob, and everything outside it is still refused. A repo whose work branch is
// named per session cannot state one name — the photography studio's flow is a
// session branch, pushed to a staging branch, merged to production by pull
// request — and before this it could state nothing at all, so its CI ran this
// gate as step one, failed on the missing declaration, and every gate after it
// never ran. An exact name generates exactly the line it always did: a sibling's
// tracked hook is compared byte for byte against this generator, so a new
// spelling for the common case would turn every one of them red at once.

import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

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

  Optionally, \`msg-also=path/to/check\` (repeatable) names a repo-local executable
  the commit-msg hook runs after the hub's own refusals, given the message file's
  path as its one argument; a non-zero exit refuses the commit.
`);
  process.exit(1);
}

const decl = {};
/** `also=` may appear more than once — every other key is single-valued. */
const also = [];
/** `msg-also=` too, in its own list: the commit-msg hook's checks. */
const msgAlso = [];
for (const line of readFileSync(declPath, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i <= 0) continue;
  const key = t.slice(0, i).trim();
  const value = t.slice(i + 1).trim();
  if (key === 'also') { if (value) also.push(value); continue; }
  if (key === 'msg-also') { if (value) msgAlso.push(value); continue; }
  decl[key] = value;
}
if (!decl.work) {
  console.error('  .branch-guard names no `work=` branch, which is the one thing it must say.\n');
  process.exit(1);
}
// `escape-also=` IS A DIFFERENT PERMISSION FROM `escape=` and the difference is
// the point. `escape=` says WHERE a commit may land; this says the repo-local
// checks may be deferred on THIS commit. Deferring is not skipping: every
// `also=` check named here is also a CI step, so what the override buys is the
// order the work happens in, never whether it happens.
//
// IT EXISTS BECAUSE THE ALTERNATIVE IS `--no-verify`, WHICH IS WORSE. Without a
// named way past a four-minute check, the way past it is git's own bypass — and
// that switches off the BRANCH rule too, which is the thing this file was
// written for. An override that names what it defers and prints it is strictly
// safer than one that silently defers everything. A guard with no door has one
// anyway; it is just not one you can see from the outside.
if (decl['escape-also'] && also.length === 0) {
  console.error('  .branch-guard names `escape-also=` but declares no `also=` checks for it to defer.');
  console.error('  An override for nothing is a door in a wall with no room behind it.\n');
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
  // The override is read ONCE, before the loop, and SAYS SO when it fires. A
  // deferral nobody can see in the terminal is indistinguishable from a check
  // that quietly stopped running, which is the fail-open this file exists for.
  if (decl['escape-also'] && also.length > 0) {
    L.push(`if [ -n "$${decl['escape-also']}" ]; then`);
    L.push('  echo "" >&2');
    L.push(`  echo "  ${decl['escape-also']} is set — deferring ${also.length} repo-local check(s):" >&2`);
    for (const path of also) L.push(`  echo "      ${path}" >&2`);
    L.push('  echo "" >&2');
    L.push('  echo "  DEFERRED, NOT SKIPPED. Every one of these is also a CI step," >&2');
    L.push('  echo "  so this changes when the work happens and never whether." >&2');
    L.push('  echo "" >&2');
    L.push('else');
  }
  for (const declared of also) {
    // ANCHORED TO THE REPO, NEVER TO $PATH. `sh` resolves a bare word against
    // $PATH, so `also=example-check.mjs` looked for a command of that name and
    // refused every commit with "missing or not executable" while the file sat
    // in the working tree, executable. It failed CLOSED, which is why it is a
    // trap rather than a hole: the first repo to declare a check at its root
    // gets a refusal that names the wrong cause. Every sibling declares
    // `tools/...`, which contains a slash and has always worked.
    const path = /^[./]/.test(declared) ? declared : `./${declared}`;
    L.push(`if [ ! -x "${path}" ]; then`);
    L.push(`  echo "" >&2`);
    L.push(`  echo "  REFUSED — .branch-guard declares also=${declared} and it is missing or not executable." >&2`);
    L.push(`  echo "  A declared check that silently stops running is worse than no check." >&2`);
    L.push(`  echo "" >&2`);
    L.push('  exit 1');
    L.push('fi');
    L.push(`"${path}" || exit 1`);
    L.push('');
  }
  if (decl['escape-also'] && also.length > 0) {
    L.push('fi');
    L.push('');
  }
  L.push("branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo '')");
  // A COMMIT MADE INSIDE A REBASE (a `git rebase --exec "git commit --amend"`, a
  // reworded or split commit) happens with HEAD detached, so the line above
  // reads nothing and every such commit was refused whatever branch was being
  // rebased. Git records the branch under rebase in `head-name`; read it back
  // and judge THAT branch by the same rules below. A rebase of any other
  // branch still falls through to the refusal, and a rebase of a detached HEAD
  // records the words "detached HEAD", which match no declared branch.
  L.push('if [ -z "$branch" ]; then');
  L.push('  for d in rebase-merge rebase-apply; do');
  L.push('    f=$(git rev-parse --git-path "$d/head-name" 2>/dev/null)');
  L.push('    if [ -n "$f" ] && [ -f "$f" ]; then');
  L.push("      branch=$(sed -n '1s#^refs/heads/##p' \"$f\")");
  L.push('      break');
  L.push('    fi');
  L.push('  done');
  L.push('fi');
  L.push('');
  // Exact names keep the exact line they have always generated — see the note
  // on families above. `case` is the only portable shell glob match.
  L.push(decl.work.includes('*')
    ? `case "$branch" in ${decl.work}) exit 0 ;; esac`
    : `if [ "$branch" = "${decl.work}" ]; then exit 0; fi`);
  if (decl.promote) {
    L.push(decl.promote.includes('*')
      ? `case "$branch" in ${decl.promote}) [ -n "$${decl.escape}" ] && exit 0 ;; esac`
      : `if [ "$branch" = "${decl.promote}" ] && [ -n "$${decl.escape}" ]; then exit 0; fi`);
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
  L.push(decl.work.includes('*')
    ? `echo "      git stash -u && git checkout -b ${decl.work.replace('*', '<name>')} && git stash pop" >&2`
    : `echo "      git stash -u && git checkout ${decl.work} && git stash pop" >&2`);
  L.push('echo "" >&2');
  L.push('exit 1');
  L.push('');
  return L.join('\n');
};

/** The commit-message hook (Doctrine 9b): a commit message is plain and reader-facing, so a chat link, an attribution trailer or a model's
 *  name in it is refused AT the commit, from any thread. Plain sh, and the patterns are the ones plan-fence.mjs holds for a command line;
 *  a case builds a temporary repository and holds the two to the same verdicts. It prints the line it refused on. */
const commitMsgHook = () => {
  const out = [
  '#!/bin/sh',
  '# GENERATED by noahjefferson/branch-guard.mjs — do not edit here.',
  '# Change branch-guard.mjs and re-run:  node ../noahjefferson/branch-guard.mjs --repo . --install',
  '#',
  '# A commit message is plain and reader-facing (Doctrine 9b): no chat link, no attribution trailer, no model named.',
  'msg="$1"',
  '[ -f "$msg" ] || exit 0',
  'body=$(grep -v "^#" "$msg")',
  'refuse() {',
  '  echo "" >&2',
  '  echo "  REFUSED — a commit message is plain and reader-facing, with no trailer, no chat link and no model\'s name ($1)." >&2',
  '  echo "  The line it refused on:" >&2',
  '  echo "      $2" >&2',
  '  echo "" >&2',
  '  exit 1',
  '}',
  'hit=$(printf \'%s\\n\' "$body" | grep -n -i -E \'claude\\.ai/code/session_\' | head -n 1)',
  '[ -n "$hit" ] && refuse "a chat link" "$hit"',
  'hit=$(printf \'%s\\n\' "$body" | grep -n -i -E \'Co-Authored-By:|Claude-Session:\' | head -n 1)',
  '[ -n "$hit" ] && refuse "an attribution trailer" "$hit"',
  'hit=$(printf \'%s\\n\' "$body" | grep -n -i -E \'claude-(sonnet|opus|haiku)\' | head -n 1)',
  '[ -n "$hit" ] && refuse "a model\'s name" "$hit"',
  'hit=$(printf \'%s\\n\' "$body" | grep -n -E \'(^|[^A-Za-z0-9_./-])(Sonnet|Opus|Haiku|Fable|Mythos)([^A-Za-z0-9_/-]|$)\' | head -n 1)',
  '[ -n "$hit" ] && refuse "a model\'s name" "$hit"',
  ];
  if (msgAlso.length === 0) { out.push('exit 0'); out.push(''); return out.join('\n'); }
  // Declared checks replace the final `exit 0`: each runs after the hub's own refusals, anchored as `also=` is, given the message file.
  for (const declared of msgAlso) {
    const path = /^[./]/.test(declared) ? declared : `./${declared}`;
    out.push(`if [ ! -x "${path}" ]; then`);
    out.push('  echo "" >&2');
    out.push(`  echo "  REFUSED — .branch-guard declares msg-also=${declared} and it is missing or not executable." >&2`);
    out.push('  echo "" >&2');
    out.push('  exit 1');
    out.push('fi');
    out.push(`"${path}" "$msg" || exit 1`);
  }
  out.push('exit 0');
  out.push('');
  return out.join('\n');
};

const want = hook();
const cmWant = commitMsgHook();
const cmPath = join(repo, '.githooks', 'commit-msg');
const hookPath = join(repo, '.githooks', 'pre-commit');
// WHERE GIT ACTUALLY LOOKS FOR HOOKS, asked of git rather than assumed. In a
// linked worktree `.git` is a FILE naming the real git directory, so
// `repo/.git/hooks` does not exist and cannot be made: --install died on
// ENOTDIR in the first worktree it met, on 2026-09-25. Every worktree of a
// repository runs the ONE hooks directory git names here, so the hook in force
// is whichever tree installed last; the drift checks below are what catch a
// tree committing under another tree's rules. The join is the fallback only
// where git cannot answer.
const liveDir = (() => {
  try {
    const p = execFileSync('git', ['-C', repo, 'rev-parse', '--path-format=absolute', '--git-path', 'hooks'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (p) return p;
  } catch { /* not a git checkout, or git too old for --path-format: fall back */ }
  return join(repo, '.git', 'hooks');
})();
const livePath = join(liveDir, 'pre-commit');
const have = existsSync(hookPath) ? readFileSync(hookPath, 'utf8') : null;
const live = existsSync(livePath) ? readFileSync(livePath, 'utf8') : null;
const cmLivePath = join(liveDir, 'commit-msg');
const cmHave = existsSync(cmPath) ? readFileSync(cmPath, 'utf8') : null;
const cmLive = existsSync(cmLivePath) ? readFileSync(cmLivePath, 'utf8') : null;

if (install) {
  mkdirSync(join(repo, '.githooks'), { recursive: true });
  writeFileSync(hookPath, want);
  chmodSync(hookPath, 0o755);
  writeFileSync(cmPath, cmWant);
  chmodSync(cmPath, 0o755);
  mkdirSync(liveDir, { recursive: true });
  writeFileSync(cmLivePath, cmWant);
  chmodSync(cmLivePath, 0o755);
  console.log(`  wrote .githooks/commit-msg (tracked) and ${cmLivePath} (live)`);
  if (msgAlso.length > 0) console.log(`  msg-also= runs ${msgAlso.length} declared check(s) after the hub's refusals, each given the message file's path: ${msgAlso.join(', ')}`);
  // And into .git/hooks, which no branch owns and no checkout can remove.
  mkdirSync(liveDir, { recursive: true });
  writeFileSync(livePath, want);
  chmodSync(livePath, 0o755);
  console.log(`  wrote .githooks/pre-commit (tracked) and ${livePath} (live)`);
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
// The commit-message hook: a tracked copy that exists must be current; a repository that has not installed it yet is told so, not failed.
if (cmHave !== null && cmHave !== cmWant) {
  console.error('  .githooks/commit-msg has DRIFTED from what branch-guard.mjs generates. Re-run with --install.\n');
  process.exit(1);
}
if (cmHave === null) console.log('  --    .githooks/commit-msg is not installed in this repository (re-run with --install to refuse a chat link, a trailer or a model name in a message)');
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
if (cmHave !== null && cmLive !== cmWant) {
  console.error('  .git/hooks/commit-msg is missing or has drifted from the tracked copy — git is not running the message rule. Re-run with --install.\n');
  process.exit(1);
}
console.log(`  ok    the hook matches .branch-guard — commits on '${decl.work}'${decl.promote ? `, promote on '${decl.promote}' via ${decl.escape}` : ''}`);
console.log('\nThe guard is installed and current.\n');
