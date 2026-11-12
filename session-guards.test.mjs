#!/usr/bin/env node
/**
 * The suite of the hub's hooks and checks, fed shaped transcripts and real git repositories.
 *
 *   node session-guards.test.mjs           every case; exit 1 on any failure
 *   node session-guards.test.mjs --plants  MADE TO FAIL: for each check, a copy of the guards with that check taken out, and a case
 *                                          naming it must then FAIL
 *   node session-guards.test.mjs "--case=a name,another name"
 *                                          only the cases whose names hold one of the substrings. A value with a space is quoted as
 *                                          the WHOLE switch, as shown. A filter that selects more than half of the suite is refused:
 *                                          `--allow-wide` runs it anyway. Every --case= switch of a run is read and the names joined.
 *   --plants --files=a.mjs,b.mjs | --touched | --dry   narrow or list the plants;  --plants --plant-keys=a,b runs those keys
 *
 * CASE FILES. Beside the cases and the plants below, the suite loads every `.mjs` file in `guard-cases/`, one per guard file, named for it.
 * A case file exports `cases` (an array whose `run(m, dir, h)` gets the helpers of this file as its third argument) and `plants` (the shape
 * of `PLANTS`); a case or plant name that is already taken is refused at load. `guard-cases/shape.mjs` is the empty shape to copy.
 *
 * THE RUNNER'S OWN HOLDS. A plain run records the content of every tracked file of its own checkout before the first case and fails the
 * case after which one is rewritten or removed. A plants run puts at most PLANT_CHUNK plants (25 unless the environment says otherwise)
 * in one process and runs the next chunk in a new one. Before it runs, a plants run names every plant whose line to take out its file no
 * longer holds, and its last lines repeat every plant missed or stale.
 *
 * Covered: the push guard and the check before a push, the commit-message hook of the branch guard, the cost instrument, the lessons
 * check, the transcript reader, the program tool, the hub pin check, and the small dispatcher with the four shells (guard-cases/).
 * The whole suite runs under an empty home.
 */
import { mkdtempSync, writeFileSync, copyFileSync, readFileSync, rmSync, appendFileSync, mkdirSync, existsSync, utimesSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const FILES = ['transcript-tail.mjs', 'shell-words.mjs', 'agent-read.mjs', 'push-guard.mjs', 'hook-dispatch.mjs', 'plan-guard.mjs', 'stop-guard.mjs',
  'session-brief.mjs', 'plan-scope-check.mjs', 'session-cost.mjs', 'session-guards.test.mjs', 'privacy-patterns.mjs', 'branch-guard.mjs',
  'lessons-check.mjs', 'hub-pin-check.mjs', 'gate-args.mjs', 'third-person-check.mjs', 'binary-files.mjs', 'program.mjs'];
// Every copy of the guards makes a file's folder before it copies it: the doctrine's three pages sit in doctrine/.
const copyGuard = (from, to) => { mkdirSync(dirname(to), { recursive: true }); copyFileSync(from, to); };
const MADE = [];
const tmp = (p) => { const d = mkdtempSync(join(tmpdir(), p)); MADE.push(d); return d; };
// Every file the guards keep per session lands here, never in the real
const REAL_TMP = tmpdir();
const STATE = mkdtempSync(join(tmpdir(), 'sg-state-'));
// The stop guard reads the approval marker under the home directory, and a real
// session's marker (a plan in force, steps left, no agent of the test's running)
// would refuse every case that ends a turn with no declaration. The whole suite
// runs under an empty home; a case that needs a plan makes its own (`world`).
process.env.HOME = join(STATE, 'home');
mkdirSync(join(process.env.HOME, '.claude'), { recursive: true });
// THE SUITE RUNS IN A SESSION OF ITS OWN, AND THE LIVE SESSION IS NOT REACHABLE FROM IT.
// A suite run inside a session inherits that session's id (CLAUDE_CODE_SESSION_ID) and its
// temp folder, and every guard that falls back on the variable (the status page written at
// a hand-back, a status command) would write the LIVE session's status/fix-run.html: a
// reviewer once read that page's header as a test plan's while the suite ran. So the
// variable is taken out of the environment before any case runs and a planted decoy
// session stands in its place, with a scratchpad of its own under the suite's temp folder
// holding a planted page and planted notes. The live session's files are never read or
// compared, because they change legitimately (a hand-back rewrites the page while the suite
// runs): what is compared, after every case and at the end of the plants, is the decoy's.
// A case that changes them reached a session through the inherited variable.
const DECOY = `sg-live-${process.pid}`;
process.env.TMPDIR = join(STATE, 'tmp');
process.env.CLAUDE_CODE_SESSION_ID = DECOY;
const DECOY_PAD = join(process.env.TMPDIR, 'claude-0', '-home-user', DECOY, 'scratchpad');
const DECOY_FILES = { 'status/fix-run.html': '<html><title>planted live page</title></html>\n', 'status/manager.txt': 'Outcome: planted live notes\n' };
function plantDecoy(pad = DECOY_PAD) {
  for (const [f, text] of Object.entries(DECOY_FILES)) { mkdirSync(dirname(join(pad, f)), { recursive: true }); writeFileSync(join(pad, f), text); }
}
/**
 * Which planted live file a run changed.
 * @param {string} [pad]  the decoy scratchpad; the suite's own by default.
 * @returns {string} '' when both planted files are byte for byte what was planted; else a
 *   sentence naming each one that was changed, rewritten or removed. The control (the
 *   case that reads the planted live files) plants a leak in a temporary pad and must see it.
 */
function decoyChanged(pad = DECOY_PAD) {
  const out = [];
  for (const [f, text] of Object.entries(DECOY_FILES)) {
    let now = null;
    try { now = readFileSync(join(pad, f), 'utf8'); } catch { now = null; }
    if (now !== text) out.push(`${f} ${now === null ? 'is gone' : 'was rewritten'}`);
  }
  return out.join(' and ');
}
plantDecoy();
let LEAKS = 0;
let SID = 0;
const sid = (p) => `${p}-${++SID}-${process.pid}`;

const ts = (s) => new Date(Date.parse('2026-10-01T12:00:00Z') + s * 1000).toISOString();
// Times after "now": a latch, a due marker and a refused name are stamped with
// the real clock, so what must come after them is timed from it.
const later = (s) => new Date(Date.now() + s * 1000).toISOString();
const at = (e, t) => ({ ...e, timestamp: t });
const turn = (s, text) => ({ type: 'user', timestamp: ts(s), origin: { kind: 'human' }, message: { role: 'user', content: text } });
const tool = (s, id, name, input = {}) => ({ type: 'assistant', timestamp: ts(s), message: { role: 'assistant', content: [{ type: 'tool_use', id, name, input }] } });
const result = (s, id, text, isError = false) => ({ type: 'user', timestamp: ts(s), message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content: text, is_error: isError }] } });
const transcript = (entries) => { const f = join(tmp('sg-tr-'), 't.jsonl'); writeFileSync(f, entries.map((e) => JSON.stringify(e)).join('\n') + '\n'); return f; };
function repo(files, name) {
  const d = name ? join(tmp('sg-repos-'), name) : tmp('sg-repo-');
  if (name) mkdirSync(d);
  const g = (...a) => spawnSync('git', ['-C', d, ...a], { encoding: 'utf8' });
  g('init', '-q'); g('config', 'user.email', 't@example.invalid'); g('config', 'user.name', 't'); g('config', 'commit.gpgsign', 'false');
  for (const [f, c] of Object.entries(files)) writeFileSync(join(d, f), c);
  g('add', '-A'); g('commit', '-q', '-m', 'base');
  return { dir: d, g, write: (f, c) => writeFileSync(join(d, f), c), stage: () => g('add', '-A') };
}
const jsonl = (entries) => entries.map((e) => JSON.stringify(e)).join('\n') + '\n';

// The check before a push always acts, so a push that lands on staging or main is refused for want of a checker's pass. The cases that follow are
// about the branch rule, which sets that refusal aside: they read a push of staging or main as passing it.
const branchRule = (why) => (typeof why === 'string' && why.startsWith('PUSH CHECK: ') ? null : why);
// THE CASES THAT MAY STILL END BY RETURNING A BARE BOOLEAN (Q-HUB-346): the first words of each such case's name. A case that returns a
// bare false names no assertion when it turns red, so every case ends through assertAll and this list is empty; the case that reads the
// source fails on any case that ends otherwise and is not named here, and on a name here that no longer ends that way.
const BARE_ENDINGS_DECLARED = [];

const CASES = [
  {
    name: 'the push gate passes pushes that land on staging or main and refuses every other branch, deletion and bulk push',
    guards: ['push_dest', 'push_noref', 'push_head', 'push_colon', 'push_nested', 'push_cd'],
    run(m) {
      const r = repo({ 'a.txt': 'x\n' });
      const d = (command, cwd = r.dir) => branchRule(m.push.decide({ tool_name: 'Bash', tool_input: { command }, cwd }));
      r.g('checkout', '-q', '-b', 'staging');
      const onStaging = [d('git push origin staging'), d('git push -u origin main'), d('git push origin HEAD:main'), d('git push origin staging:main'),
        d(`git -C ${r.dir} push origin +HEAD:staging`, '/'), d('git push --force-with-lease origin staging'), d('git push'), d('git push origin HEAD'),
        d(`cd ${r.dir} && git push`, '/'), d('git push origin refs/heads/staging')];
      r.g('checkout', '-q', '-b', 'claude/work');
      const refused = [d('git push origin claude/work'), d('git push'), d('git push origin HEAD'), d('git push origin :staging'),
        d('git push origin main:refs/tags/v1'), d('git push origin $BR'), d('bash -c "git push origin claude/work"'),
        d('git status && git push origin claude/work'), d(`cd ${r.dir} && git push`, '/'), d('echo $(git push origin claude/work)'),
        d('git push origin main claude/work')];
      const held_rows = [['onStaging.every((x) => x === null)', (onStaging.every((x) => x === null))]];
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['refused.every((x) => /^.+Only staging and main reach a remote/.test(x ?? \'\'))', (refused.every((x) => /^.+Only staging and main reach a remote/.test(x ?? '')))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['d(\'git status\') === null', (d('git status') === null)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['d(\'echo "git push origin claude/work"\') === null', (d('echo "git push origin claude/work"') === null)]);
      return assertAll(held_rows);
    },
  },
  {
    name: 'the push gate refuses --all, --mirror, --tags, --delete, -d and --prune even onto staging',
    guards: ['push_flags', 'push_short_d'],
    run(m) {
      const r = repo({ 'a.txt': 'x\n' });
      r.g('checkout', '-q', '-b', 'staging');
      const d = (command) => branchRule(m.push.decide({ tool_name: 'Bash', tool_input: { command }, cwd: r.dir }));
      return assertAll([['[\'git push --all origin\', \'git push --mirror origin\', \'git push --tags origin\', \'git push origin --delete main\', \'git push -d origin main\', \'git push --prune origin\', \'git push --branches origin\', \'git push --follow-tags origin staging\'] .every((c) => d(c) !== null)', (['git push --all origin', 'git push --mirror origin', 'git push --tags origin', 'git push origin --delete main',
        'git push -d origin main', 'git push --prune origin', 'git push --branches origin', 'git push --follow-tags origin staging']
        .every((c) => d(c) !== null))]]);
    },
  },
  {
    name: 'the push gate refuses a force-push to main and --no-verify on a push or a commit; a force-push to staging passes',
    guards: ['push_force_main', 'push_no_verify', 'push_commit_n', 'push_commit_nv'],
    run(m) {
      const r = repo({ 'a.txt': 'x\n' });
      r.g('checkout', '-q', '-b', 'main');
      const d = (command) => branchRule(m.push.decide({ tool_name: 'Bash', tool_input: { command }, cwd: r.dir }));
      const refused = ['git push --force origin main', 'git push -f origin main', 'git push -uf origin main', 'git push --force-with-lease origin main',
        'git push --force-with-lease=main:abc123 origin main', 'git push origin +main', 'git push origin +HEAD:main', 'git push -f', 'git push --force origin HEAD',
        'git push --no-verify origin staging', 'git commit --no-verify -m x', 'git commit -n -m x', 'git commit -anm x', `git -C ${r.dir} commit -a --no-verify`,
        'git add -A && git commit -qnm "x"'];
      const passed = ['git push -f origin staging', 'git push origin +HEAD:staging', 'git push --force-with-lease origin staging', 'git push origin main',
        'git commit -m "-n is not a flag here"', 'git commit -am "no verify skipped"', 'git commit -F msg.txt', 'git commit -m x -- notes'];
      const bad = [...refused.filter((c) => !/Only staging and main reach a remote/.test(d(c) ?? '')), ...passed.filter((c) => d(c) !== null)];
      if (bad.length) throw new Error(`wrong on: ${bad.join(' | ')}`);
      const held_rows = [['/force-pushes main/.test(d(\'git push -f origin main\') ?? \'\')', (/force-pushes main/.test(d('git push -f origin main') ?? ''))]];
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['/--no-verify/.test(d(\'git commit -n -m x\') ?? \'\')', (/--no-verify/.test(d('git commit -n -m x') ?? ''))]);
      return assertAll(held_rows);
    },
  },
  {
    name: 'the push gate reads a push past its redirect and its pipe: staging with its output redirected and piped passes, and a claude/ branch with the same tail is still refused',
    guards: ['push_redirect'],
    run(m) {
      const r = repo({ 'a.txt': 'x\n' });
      r.g('checkout', '-q', '-b', 'staging');
      const d = (command) => branchRule(m.push.decide({ tool_name: 'Bash', tool_input: { command }, cwd: r.dir }));
      const passes = ['git push origin staging 2>&1 | tail -3', 'git push 2>&1 | tail', 'git push origin HEAD:staging > /tmp/out.txt 2>&1',
        'git push origin staging &>/dev/null', 'git push -u origin staging >/dev/null 2>&1', 'git push origin main >> log.txt', 'git push origin staging 2>&1 | tee push.log | tail -1'];
      const refused = ['git push origin claude/work 2>&1 | tail -3', 'git push origin claude/work > /tmp/out.txt 2>&1', 'git push origin staging claude/work 2>&1',
        'git push origin >staging claude/work', 'git push origin > staging claude/work', 'git push origin staging "|" claude/work', 'git push origin :staging 2>&1 | tail'];
      const bad = [...passes.filter((c) => d(c) !== null), ...refused.filter((c) => !/Only staging and main reach a remote/.test(d(c) ?? ''))];
      if (bad.length) throw new Error(`wrong on: ${bad.join(' | ')}`);
      return assertAll([]);
    },
  },
  {
    name: 'the push gate refuses a push it cannot resolve for certain: an alias, --git-dir, a GIT_DIR-style variable, -c, a cd in a subshell (one-line or multi-line) or substitution, env -C, xargs, find -exec',
    guards: ['push_alias', 'push_alias_conf', 'push_gitdir', 'push_env', 'push_subshell', 'push_config', 'push_xargs', 'push_find'],
    run(m) {
      const r = repo({ 'a.txt': 'x\n' });
      r.g('checkout', '-q', '-b', 'staging');
      r.g('config', 'alias.pp', 'push');
      const other = repo({ 'b.txt': 'y\n' });
      other.g('checkout', '-q', '-b', 'claude/x');
      const d = (command, cwd = r.dir) => branchRule(m.push.decide({ tool_name: 'Bash', tool_input: { command }, cwd }));
      const refused = ['git pp origin staging', 'git -c alias.x=push x origin staging', `git --git-dir=${other.dir}/.git push`, `git --work-tree ${other.dir} push`,
        `GIT_DIR=${other.dir}/.git git push`, `export GIT_DIR=${other.dir}/.git; git push`, 'git -c push.default=matching push', 'git -c remote.origin.push=refs/heads/x push origin',
        `(cd ${other.dir} && git push)`, `cd ${r.dir} && (cd ${other.dir}; git push)`, `echo $(cd ${other.dir} && git push)`, `cd ${other.dir}; echo $(git push)`,
        `cd ~/${basename(other.dir)} && git push`, 'cd "$REPO" && git push', `pushd ${other.dir} && git push`, `env -C ${other.dir} git push`,
        'echo claude/x | xargs git push origin', `find ${other.dir} -maxdepth 0 -execdir git push \\;`];
      const passed = ['git status', `cd ${r.dir} && git push origin staging`, 'git push origin staging', `git -C ${r.dir} push`, 'git log --oneline -3',
        'git commit -m "names GIT_DIR in the message"'];
      // Run from the claude/x repo: a cd on its own line inside a subshell does
      // not outlive the ")", so the push after it is claude/x, not staging.
      const fromOther = [`(\ncd ${r.dir}\n)\ngit push`, `( true\ncd ${r.dir}\n) && git push`];
      const bad = [...refused.filter((c) => !/Only staging and main reach a remote/.test(d(c) ?? '')), ...passed.filter((c) => d(c, c.startsWith('cd ') ? '/' : r.dir) !== null),
        ...fromOther.filter((c) => !/Only staging and main reach a remote/.test(d(c, other.dir) ?? ''))];
      if (bad.length) throw new Error(`wrong on: ${bad.join(' | ')}`);
      return assertAll([]);
    },
  },
  {
    name: 'the push gate refuses the connector\'s branch creation and its file writes to any branch but staging and main',
    guards: ['push_connector_create', 'push_connector_write'],
    run(m) {
      const d = (tool_name, tool_input = {}) => m.push.decide({ tool_name, tool_input });
      const held_rows = [['d(\'mcp__github__create_branch\', { branch: \'main\' }) !== null', (d('mcp__github__create_branch', { branch: 'main' }) !== null)]];
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['d(\'mcp__github__create_or_update_file\', { branch: \'claude/x\', path: \'a\' }) !== null', (d('mcp__github__create_or_update_file', { branch: 'claude/x', path: 'a' }) !== null)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['d(\'mcp__github__push_files\', { branch: \'feature\' }) !== null', (d('mcp__github__push_files', { branch: 'feature' }) !== null)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['d(\'mcp__github__delete_file\', {}) !== null', (d('mcp__github__delete_file', {}) !== null)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['connector file writes to main and to staging are refused, with the reason', ['main', 'staging'].every((b) => /writes to .*carry no commit a checker could have passed.*by a git push after a checker's pass of that exact commit/.test(d('mcp__github__create_or_update_file', { branch: b, path: 'a' }) ?? '') && /carry no commit a checker could have passed/.test(d('mcp__github__push_files', { branch: b }) ?? ''))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['a write to another branch is refused by the branch rule and its words', /only staging and main are written/.test(d('mcp__github__create_or_update_file', { branch: 'claude/x', path: 'a' }) ?? '')]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['d(\'mcp__github__get_file_contents\', { branch: \'claude/x\' }) === null', (d('mcp__github__get_file_contents', { branch: 'claude/x' }) === null)]);
      return assertAll(held_rows);
    },
  },
  {
    name: 'the push gate refuses the connector\'s pull-request merge and branch-update tools, whatever branch they name',
    guards: ['push_connector_merge', 'push_connector_update'],
    run(m) {
      const d = (tool_name, tool_input = {}) => m.push.decide({ tool_name, tool_input });
      const said = (x, what) => new RegExp(`${what}, and it is refused\\. Only staging and main reach a remote`).test(x ?? '');
      const held_rows = [['said(d(\'mcp__github__merge_pull_request\', { owner: \'o\', repo: \'r\', pullNumber: 1 }), \'merges a pull request\')', (said(d('mcp__github__merge_pull_request', { owner: 'o', repo: 'r', pullNumber: 1 }), 'merges a pull request'))]];
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['said(d(\'mcp__github__merge_pull_request\', { owner: \'o\', repo: \'r\', pullNumber: 1, merge_method: \'rebase\' }), \'merges a pull request\')', (said(d('mcp__github__merge_pull_request', { owner: 'o', repo: 'r', pullNumber: 1, merge_method: 'rebase' }), 'merges a pull request'))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['said(d(\'mcp__GitHub__merge_pull_request\', { pullNumber: 1 }), \'merges a pull request\')', (said(d('mcp__GitHub__merge_pull_request', { pullNumber: 1 }), 'merges a pull request'))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['said(d(\'mcp__github__enable_pr_auto_merge\', { pullNumber: 1 }), \'merges a pull request\')', (said(d('mcp__github__enable_pr_auto_merge', { pullNumber: 1 }), 'merges a pull request'))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['said(d(\'mcp__github__update_pull_request_branch\', { pullNumber: 1 }), \'updates a pull request\\\'s branch\')', (said(d('mcp__github__update_pull_request_branch', { pullNumber: 1 }), 'updates a pull request\'s branch'))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['said(d(\'mcp__github__update_pull_request_branch\', { pullNumber: 1, branch: \'main\' }), \'updates a pull request\\\'s branch\')', (said(d('mcp__github__update_pull_request_branch', { pullNumber: 1, branch: 'main' }), 'updates a pull request\'s branch'))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['d(\'mcp__github__pull_request_read\', { pullNumber: 1 }) === null', (d('mcp__github__pull_request_read', { pullNumber: 1 }) === null)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['d(\'mcp__github__disable_pr_auto_merge\', { pullNumber: 1 }) === null', (d('mcp__github__disable_pr_auto_merge', { pullNumber: 1 }) === null)]);
      return assertAll(held_rows);
    },
  },
  {
    name: 'step114: the commit-msg hook that branch-guard.mjs installs refuses a message holding a trailer, a chat link or a model\'s name, printing the line it refused on, and passes a plain one, in a temporary repository; the tracked copy is held to what the generator writes',
    guards: ['commit_msg_hook_trailer', 'commit_msg_hook_link', 'commit_msg_hook_model', 'commit_msg_hook_install', 'commit_msg_hook_line'],
    run(m, dir) {
      const t = tmp('sg-cmh-');
      const g = (...a) => spawnSync('git', ['-C', t, ...a], { encoding: 'utf8' });
      g('init', '-q', '-b', 'main'); g('config', 'user.email', 't@example.invalid'); g('config', 'user.name', 't'); g('config', 'commit.gpgsign', 'false');
      writeFileSync(join(t, '.branch-guard'), 'work=main\n');
      const inst = spawnSync('node', [join(dir, 'branch-guard.mjs'), '--repo', t, '--install'], { encoding: 'utf8', timeout: 60000 });
      const hook = join(t, '.git', 'hooks', 'commit-msg');
      if (inst.status !== 0 || !existsSync(hook) || !existsSync(join(t, '.githooks', 'commit-msg'))) throw new Error(`install: ${inst.status} ${inst.stdout} ${inst.stderr}`);
      writeFileSync(join(t, 'a.txt'), 'a\n'); g('add', '-A');
      const link = 'claude.ai/code/' + 'session_x';
      const trailer = 'Co-Authored-' + 'By: Someone <a@example.invalid>';
      const commit = (msg) => { writeFileSync(join(t, 'msg.txt'), msg); return g('commit', '-q', '-F', join(t, 'msg.txt')); };
      const refuse = (msg, line) => { const r = commit(msg); return r.status !== 0 && /plain and reader-facing/.test(r.stderr) && r.stderr.includes(line); };
      const trailerOk = refuse(`Fix\n\n${trailer}\n`, 'Co-Authored-');
      const linkOk = refuse(`Fix\n\nsee ${link}\n`, 'session_x');
      const modelOk = refuse('Fix\n\nTuned by Sonnet 5\n', 'Tuned by Sonnet 5') && refuse('Fix\n\nclaude-opus-5 wrote it\n', 'claude-opus-5');
      const plain = commit('Fix the toolbar\n\nMove the folder opus/ and the file notes-sonnet.md\n');
      const check = spawnSync('node', [join(dir, 'branch-guard.mjs'), '--repo', t], { encoding: 'utf8', timeout: 60000 });
      const held_rows = [['trailerOk', (trailerOk)]];
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['linkOk', (linkOk)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['modelOk', (modelOk)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['plain.status === 0', (plain.status === 0)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['check.status === 0', (check.status === 0)]);
      return assertAll(held_rows);
    },
  },
  {
    name: 'the plants run narrowed to the guard files a commit touches: --files= lists only the plants of those files, --touched only the plants of the files git shows changed in the checkout, --dry runs none, and --touched outside a git checkout refuses rather than read "nothing touched"',
    guards: ['plants_files_flag', 'plants_touched_flag', 'plants_dry'],
    async run(m, dir) {
      const copy = repo({}, 'plants-copy');
      for (const f of FILES) copyGuard(join(dir, f), join(copy.dir, f));
      copy.g('add', '-A'); copy.g('commit', '-q', '-m', 'guards');
      const src = readFileSync(join(dir, 'session-guards.test.mjs'), 'utf8');
      // The needle is built, so that this case's own text does not hold it and the first match is the real map.
      const needle = '\nconst PLANTS' + ' = {\n';
      const begin = src.indexOf(needle) + needle.length - 2;
      const block = src.slice(begin, src.indexOf('\n};\n', begin) + 2);
      const plants = new Function(`return (${block})`)();
      // The plants the case files under guard-cases/ write count too: the suite merges them into the one map.
      const caseFolder = join(dir, 'guard-cases');
      if (existsSync(caseFolder)) for (const f of readdirSync(caseFolder).filter((x) => x.endsWith('.mjs')).sort()) Object.assign(plants, (await import(`${pathToFileURL(join(caseFolder, f)).href}?v=${Math.random()}`)).plants ?? {});
      const countOf = (...names) => Object.values(plants).filter(([, , f]) => names.includes(f)).length;
      const total = Object.keys(plants).length;
      const run = (where, ...args) => spawnSync('node', [join(where, 'session-guards.test.mjs'), '--plants', '--dry', ...args], { encoding: 'utf8', timeout: 60000 });
      const said = (r) => /^PLANTS TO RUN: (\d+) of (\d+): (.*)$/m.exec(r.stdout) ?? [];
      const one = said(run(copy.dir, '--files=branch-guard.mjs'));
      const two = said(run(copy.dir, '--files=branch-guard.mjs,push-guard.mjs'));
      const nothing = said(run(copy.dir, '--files=no-such-file.mjs'));
      const all = said(run(copy.dir));
      appendFileSync(join(copy.dir, 'push-guard.mjs'), '\n// touched\n');
      const touched = said(run(copy.dir, '--touched'));
      const plain = tmp('sg-plain-');
      for (const f of FILES) copyGuard(join(dir, f), join(plain, f));
      const outside = run(plain, '--touched');
      const held_rows = [['Number(one[1]) === countOf(\'branch-guard.mjs\')', (Number(one[1]) === countOf('branch-guard.mjs'))]];
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['Number(one[1]) > 0', (Number(one[1]) > 0)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['Number(one[2]) === total', (Number(one[2]) === total)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['one[3].split(\', \').every((k) => plants[k]?.[2] === \'branch-guard.mjs\')', (one[3].split(', ').every((k) => plants[k]?.[2] === 'branch-guard.mjs'))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['Number(two[1]) === countOf(\'branch-guard.mjs\', \'push-guard.mjs\')', (Number(two[1]) === countOf('branch-guard.mjs', 'push-guard.mjs'))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['Number(nothing[1]) === 0', (Number(nothing[1]) === 0)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['Number(all[1]) === total', (Number(all[1]) === total)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['Number(touched[1]) === countOf(\'push-guard.mjs\')', (Number(touched[1]) === countOf('push-guard.mjs'))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['touched[3].split(\', \').every((k) => plants[k]?.[2] === \'push-guard.mjs\')', (touched[3].split(', ').every((k) => plants[k]?.[2] === 'push-guard.mjs'))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['outside.status === 1', (outside.status === 1)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['/needs a git checkout of the guards/.test(outside.stdout)', (/needs a git checkout of the guards/.test(outside.stdout))]);
      return assertAll(held_rows);
    },
  },
  {
    name: 'finding 16: a run of the cases ends with a line saying the plants were not run and how many there are, and a run of plants narrowed to some guard files ends with a line giving the count it ran beside the total, so the by-file runs can be added up',
    guards: ['run_plants_not_run', 'run_plants_counted'],
    run(m, dir) {
      const cases = spawnSync('node', [join(dir, 'session-guards.test.mjs'), '--case=no-such-case-name-at-all'], { encoding: 'utf8', timeout: 120000 });
      const plants = spawnSync('node', [join(dir, 'session-guards.test.mjs'), '--plants', '--files=no-such-file.mjs'], { encoding: 'utf8', timeout: 120000 });
      const held_rows = [['/PLANTS NOT RUN: this run ran the cases only; the \\d+ plants run with --plants/.test(cases.stdout)', (/PLANTS NOT RUN: this run ran the cases only; the \d+ plants run with --plants/.test(cases.stdout))]];
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['/PLANTS RUN: 0 of \\d+ \\(the plants of no-such-file\\.mjs; add the counts of the by-file runs against the total of \\d+\\)/.test(plants.stdout)', (/PLANTS RUN: 0 of \d+ \(the plants of no-such-file\.mjs; add the counts of the by-file runs against the total of \d+\)/.test(plants.stdout))]);
      return assertAll(held_rows);
    },
  },
  {
    name: 'Q-HUB-245/269: --case= takes a comma-separated list of substrings, a case runs when any one is in its name, a single substring matches as before, and the head line names each substring with its count',
    guards: ['case_split', 'case_count'],
    run(m, dir) {
      // The head line is read from a real filtered run; the run that matches this case runs it nested, and a nested run passes at once.
      if (process.env.CASE_FILTER_NESTED) return true;
      const head = (arg) => spawnSync('node', [join(dir, 'session-guards.test.mjs'), `--case=${arg}`], { encoding: 'utf8', timeout: 300000, env: { ...process.env, CASE_FILTER_NESTED: '1' } }).stdout ?? '';
      const parse = (out) => {
        const mm = /CASE FILTER: (\d+) substrings?: (.*); (\d+) of (\d+) cases selected\./.exec(out);
        return mm ? { n: Number(mm[1]), each: [...mm[2].matchAll(/"([^"]*)" matched (\d+)/g)].map((x) => [x[1], Number(x[2])]), total: Number(mm[3]), all: Number(mm[4]) } : null;
      };
      const a = parse(head('Q-HUB-245/269:'));
      const b = parse(head('finding 16:'));
      const both = parse(head('Q-HUB-245/269:,finding 16:'));
      const none = parse(head('no-such-case-a,no-such-case-b'));
      if (!a || !b || !both || !none) return false;
      const held_rows = [['a.n === 1', (a.n === 1)]];
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['a.each[0][1] === 1', (a.each[0][1] === 1)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['a.total === 1', (a.total === 1)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['b.n === 1', (b.n === 1)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['b.each[0][1] >= 1', (b.each[0][1] >= 1)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['b.total === b.each[0][1]', (b.total === b.each[0][1])]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['both.n === 2', (both.n === 2)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['both.each.length === 2', (both.each.length === 2)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['both.each[0][1] === a.each[0][1]', (both.each[0][1] === a.each[0][1])]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['both.each[1][1] === b.each[0][1]', (both.each[1][1] === b.each[0][1])]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['both.total === a.total + b.total', (both.total === a.total + b.total)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['both.total < both.all', (both.total < both.all)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['none.n === 2', (none.n === 2)]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['none.each.every((x) => x[1] === 0)', (none.each.every((x) => x[1] === 0))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['none.total === 0', (none.total === 0)]);
      return assertAll(held_rows);
    },
  },
  {
    name: 'the cost instrument prints each plan\'s title and program item beside its number: its planted transcript holds two plan files written and two plans approved, one approval carrying the Item in its result and the other read from the plan file as last written, and the run is green only when both are read in order',
    guards: ['cost_item_read', 'cost_write_read'],
    run(m, dir) {
      const r = spawnSync('node', [join(dir, 'session-cost.mjs')], { encoding: 'utf8', timeout: 120000 });
      const held_rows = [['r.status === 0', (r.status === 0)]];
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['/planted counts match the known figures/.test(r.stdout)', (/planted counts match the known figures/.test(r.stdout))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['r.stdout.includes(\'"titles":"P-99: A planted title; P-98: A second planted title; P-97: A third planted title"\')', (r.stdout.includes('"titles":"P-99: A planted title; P-98: A second planted title; P-97: A third planted title"'))]);
      return assertAll(held_rows);
    },
  },
  {
    name: 'the cost instrument reads an approval the harness saved as a large-output file: its planted transcript holds a third approval whose result is the wrapper with a preview carrying only the title, a saved file beside it carrying the Item, and the plan is numbered with its title and its item read from the saved file',
    guards: ['cost_saved_read'],
    run(m, dir) {
      const r = spawnSync('node', [join(dir, 'session-cost.mjs')], { encoding: 'utf8', timeout: 120000 });
      const held_rows = [['r.status === 0', (r.status === 0)]];
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['/"plans":3/.test(r.stdout)', (/"plans":3/.test(r.stdout))]);
      if (held_rows.every(([, ok]) => ok)) held_rows.push(['r.stdout.includes(\'P-97: A third planted title\')', (r.stdout.includes('P-97: A third planted title'))]);
      return assertAll(held_rows);
    },
  },
  {
    name: 'step 119: the suite loads every file under guard-cases/ and runs its cases with the suite\'s helpers as the third argument, names no assertion for a case that returns false, refuses a case or a plant whose name is taken, merges the plants of a case file into the one map, and counts a touched case file as a touch of the guard file it is named for',
    guards: ['case_files_load', 'case_files_helpers', 'case_files_dup_case', 'case_files_dup_plant', 'case_files_plants_merge', 'touched_case_file', 'no_assertion_text'],
    run(m, dir, h) {
      const c = h.suiteCopy(dir, { 'planted-target.mjs': PLANTED_TARGET, 'guard-cases/planted.mjs': PLANTED_CASE_FILE, 'guard-cases/branch-guard.mjs': 'export const cases = [];\nexport const plants = {};\n' });
      const pass = c.run(['--case=planted-caught-case']);
      const fail = c.run(['--case=planted-failing-case']);
      const dry = c.run(['--plants', '--dry', '--files=planted-target.mjs']);
      appendFileSync(join(c.dir, 'guard-cases', 'branch-guard.mjs'), '\n// touched\n');
      const touched = c.run(['--plants', '--dry', '--touched']);
      const viaFiles = c.run(['--plants', '--dry', '--files=branch-guard.mjs']);
      const countOf = (r) => Number(/^PLANTS TO RUN: (\d+) of/m.exec(r.stdout)?.[1] ?? -1);
      const dupCase = h.suiteCopy(dir, { 'guard-cases/planted.mjs': PLANTED_CASE_FILE, 'guard-cases/planted-two.mjs': PLANTED_CASE_FILE.replace(/planted_/g, 'planted_two_') }).run(['--case=planted-caught-case']);
      const dupPlant = h.suiteCopy(dir, { 'guard-cases/planted.mjs': PLANTED_CASE_FILE, 'guard-cases/planted-two.mjs': 'export const cases = [];\n' + PLANTED_CASE_FILE.slice(PLANTED_CASE_FILE.indexOf('export const plants')) }).run(['--case=planted-caught-case']);
      return h.assertAll([
        ['a case of a case file runs, receives the helpers and passes', pass.status === 0 && /^PASS  planted-caught-case$/m.test(pass.stdout) && /^1\/1 passed$/m.test(pass.stdout), pass.stdout + pass.stderr],
        ['a case that returns false is a FAIL naming no assertion in so many words', fail.status === 1 && /^FAIL  planted-failing-case \(the case returned false and threw nothing, so it names no assertion/m.test(fail.stdout), fail.stdout + fail.stderr],
        ['the plants of the case file are in the map the files flag narrows', countOf(dry) === 3 && /^PLANTS TO RUN: 3 of \d+: planted_caught, planted_missed, planted_stale$/m.test(dry.stdout), dry.stdout + dry.stderr],
        ['a touched case file counts as a touch of its guard file', countOf(touched) > 0 && countOf(touched) === countOf(viaFiles), `${touched.stdout} | ${viaFiles.stdout}`],
        ['a second case of a taken name is refused when the suite loads', dupCase.status !== 0 && /a case named "planted-caught-case" already stands/.test(dupCase.stdout + dupCase.stderr), dupCase.stdout + dupCase.stderr],
        ['a second plant of a taken name is refused when the suite loads', dupPlant.status !== 0 && /a plant named "planted_caught" already stands/.test(dupPlant.stdout + dupPlant.stderr), dupPlant.stdout + dupPlant.stderr],
      ]);
    },
  },
  {
    name: 'step 119: a plain run compares the tracked files of its checkout after every case and fails the case after which one is rewritten or removed, naming the file, while a case that writes the bytes a file already holds, and a case that writes nothing, pass',
    guards: ['tracked_watch', 'tracked_watch_fail'],
    run(m, dir, h) {
      const body = [
        "  { name: 'planted-writer', run(m, d) { writeFileSync(join(d, 'binary-files.mjs'), 'planted words\\n'); return true; } },",
        "  { name: 'planted-remover', run(m, d) { rmSync(join(d, 'guard-cases'), { recursive: true, force: true }); return true; } },",
        "  { name: 'planted-same-bytes', run(m, d) { writeFileSync(join(d, 'binary-files.mjs'), readFileSync(join(d, 'binary-files.mjs'), 'utf8')); return true; } },",
        "  { name: 'planted-quiet', run() { return true; } },",
      ].join('\n');
      const c = h.suiteCopy(dir, { 'guard-cases/planted-writes.mjs': `import { writeFileSync, readFileSync, rmSync } from 'node:fs';\nimport { join } from 'node:path';\nexport const cases = [\n${body}\n];\n` });
      const quiet = c.run(['--case=planted-quiet']);
      const same = c.run(['--case=planted-same-bytes']);
      const writer = c.run(['--case=planted-writer']);
      const remover = c.run(['--case=planted-remover']);
      return h.assertAll([
        ['a case that writes nothing passes and the run says how many files it watched', quiet.status === 0 && /^PASS  planted-quiet$/m.test(quiet.stdout) && /^TRACKED FILES: \d+ watched; no case changed one$/m.test(quiet.stdout), quiet.stdout + quiet.stderr],
        ['a case that writes the bytes a file already holds passes', same.status === 0 && /^PASS  planted-same-bytes$/m.test(same.stdout), same.stdout + same.stderr],
        ['a case that rewrites a tracked file fails and names it', writer.status === 1 && /^FAIL  planted-writer .*WROTE INTO THE WORKING COPY \(1\): binary-files\.mjs was rewritten/m.test(writer.stdout) && /1 case wrote into the working copy/.test(writer.stdout), writer.stdout + writer.stderr],
        ['a case that removes tracked files fails and names one', remover.status === 1 && /^FAIL  planted-remover .*WROTE INTO THE WORKING COPY \(\d+\): guard-cases\/\S+ was removed/m.test(remover.stdout), remover.stdout + remover.stderr],
      ]);
    },
  },
  {
    name: 'step 140: a plain run copies the checkout when it starts and runs the cases in the copy, so an edit of the working copy during a case is not read as that case\'s write, while a case that writes into the folder it was given still fails',
    guards: ['run_in_copy'],
    run(m, dir, h) {
      const body = [
        "  { name: 'planted-edits-working-copy', run(m, d, h) { writeFileSync(join(h.HERE, 'binary-files.mjs'), 'edited by another step while the run goes on\\n'); return true; } },",
        "  { name: 'planted-writes-own-folder', run(m, d) { writeFileSync(join(d, 'binary-files.mjs'), 'written by the case\\n'); return true; } },",
      ].join('\n');
      const c = h.suiteCopy(dir, { 'guard-cases/planted-edits.mjs': `import { writeFileSync } from 'node:fs';\nimport { join } from 'node:path';\nexport const cases = [\n${body}\n];\n` });
      const edits = c.run(['--case=planted-edits-working-copy']);
      const own = c.run(['--case=planted-writes-own-folder']);
      return h.assertAll([
        ['an edit of the working copy during a case passes and the run says it ran in a copy', edits.status === 0 && /^PASS  planted-edits-working-copy$/m.test(edits.stdout) && /^RUN IN A COPY: the cases ran against a copy of \d+ files/m.test(edits.stdout) && /^TRACKED FILES: \d+ watched; no case changed one$/m.test(edits.stdout), edits.stdout + edits.stderr],
        ['a case that writes into the folder it was given still fails and names the file', own.status === 1 && /^FAIL  planted-writes-own-folder .*WROTE INTO THE WORKING COPY \(1\): binary-files\.mjs was rewritten/m.test(own.stdout), own.stdout + own.stderr],
      ]);
    },
  },
  {
    name: 'step 140: the run counts the cases that end in a bare true and --bare-list names each, while a case that ends in assertAll is not counted',
    guards: ['bare_detect', 'bare_list', 'asserted_mark'],
    run(m, dir, h) {
      const body = [
        "  { name: 'planted-bare-true', run() { return true; } },",
        "  { name: 'planted-labelled-rows', run(m, d, h) { return h.assertAll([['a row that holds', true, 'x']]); } },",
      ].join('\n');
      const c = h.suiteCopy(dir, { 'guard-cases/planted-bare.mjs': `export const cases = [\n${body}\n];\n` });
      const plain = c.run(['--case=planted-bare-true,planted-labelled-rows']);
      const listed = c.run(['--case=planted-bare-true,planted-labelled-rows', '--bare-list']);
      return h.assertAll([
        ['both planted cases pass', plain.status === 0 && /^2\/2 passed$/m.test(plain.stdout), plain.stdout + plain.stderr],
        ['the count is one of two', /^BARE BOOLEAN CASES: 1 of 2 cases ended in a bare true/m.test(plain.stdout), plain.stdout],
        ['a plain run names no case', !/^BARE BOOLEAN CASE: /m.test(plain.stdout), plain.stdout],
        ['--bare-list names the bare case', /^BARE BOOLEAN CASE: planted-bare-true$/m.test(listed.stdout), listed.stdout],
        ['--bare-list does not name the case that ends in assertAll', !/^BARE BOOLEAN CASE: planted-labelled-rows$/m.test(listed.stdout), listed.stdout],
      ]);
    },
  },
  {
    name: 'Q-HUB-346: no case of the suite or of the files under guard-cases/ ends by returning a bare boolean: the last return of each case body goes through assertAll, a case named on the declared list is let through, and a declared name that no longer ends that way is named',
    guards: ['bare_source_read'],
    run(m, dir, h) {
      // The reading of one file's text: how many cases it holds and where each one that does not end through assertAll ends.
      const readEndings = (text) => {
        const lines = text.split('\n');
        const out = { cases: 0, bare: [] };
        for (let i = 0; i < lines.length; i++) {
          if (!/^ {4}(async )?run\([^)]*\) \{$/.test(lines[i])) continue;
          out.cases++;
          let end = i + 1;
          while (end < lines.length && !/^ {4}\},?$/.test(lines[end])) end++;
          let name = lines[i].trim();
          for (let k = i - 1; k >= Math.max(0, i - 6); k--) if (/^ {4}name: /.test(lines[k])) { name = lines[k].trim().slice(6).replace(/\\'/g, "'").replace(/^['"`]/, '').replace(/['"`],?$/, ''); break; }
          let last = -1;
          for (let k = i + 1; k < end; k++) if (/^ {6,8}return\b/.test(lines[k])) last = k;
          if (last < 0 || /^ {6,8}return (await )?([A-Za-z_$][\w$]*\.)?assertAll\(/.test(lines[last])) continue;
          out.bare.push({ line: last + 1, name });
        }
        return out;
      };
      // The reading is tried on a planted text first: one case that ends in a bare return and one that ends through the helper.
      const planted = readEndings(['  {', "    name: 'planted bare',", '    run(m) {', '      const a = 1;', '      return a === 1;', '    },', '  },', '  {', "    name: 'planted labelled',", '    run(m, dir, h) {',
        "      return h.assertAll([['a is one', true]]);", '    },', '  },', ''].join('\n'));
      const files = ['session-guards.test.mjs', ...readdirSync(join(dir, 'guard-cases')).filter((f) => f.endsWith('.mjs')).sort().map((f) => `guard-cases/${f}`)];
      let cases = 0;
      const bare = [], stillBare = new Set();
      for (const f of files) {
        const r = readEndings(readFileSync(join(dir, f), 'utf8'));
        cases += r.cases;
        for (const b of r.bare) {
          const declared = BARE_ENDINGS_DECLARED.find((d) => b.name.startsWith(d));
          if (declared !== undefined) stillBare.add(declared);
          else bare.push(`${f}:${b.line} (${b.name.slice(0, 70)})`);
        }
      }
      return h.assertAll([
        ['the reading finds the planted case that ends in a bare return and not the one that ends through the helper', planted.cases === 2 && planted.bare.length === 1 && planted.bare[0].name === 'planted bare', JSON.stringify(planted)],
        ['the reading found the cases of the suite and of the case files', cases > 40, `${cases} cases read`],
        ['no case ends by returning a bare boolean unless it is declared', bare.length === 0, bare.slice(0, 12).join(' | ')],
        ['every declared name is a case that still ends that way', BARE_ENDINGS_DECLARED.every((d) => stillBare.has(d)), BARE_ENDINGS_DECLARED.filter((d) => !stillBare.has(d)).join(' | ')],
      ]);
    },
  },
  {
    name: 'step 119: the lessons check prints its failures first and nothing long after them when it is red, exits 1, and prints every list of passes when it is green',
    guards: ['lessons_red_first'],
    run(m, dir, h) {
      const hub = (extra) => {
        const d = h.tmp('sg-lessons-');
        copyFileSync(join(dir, 'lessons-check.mjs'), join(d, 'lessons-check.mjs'));
        mkdirSync(join(d, 'lessons'));
        const good = '## 1 · A planted lesson\n\n**Enforced by:** JUDGEMENT\n\n**Smell:** a planted smell of the case.\n';
        writeFileSync(join(d, 'lessons', '1-a-planted-lesson.md'), good);
        let index = '# Lessons\n\nPlanted prose of the case.\n\n- **§1** — [A planted lesson](lessons/1-a-planted-lesson.md)\n';
        if (extra) {
          writeFileSync(join(d, 'lessons', '2-an-undeclared-lesson.md'), '## 2 · An undeclared lesson\n\nThis one declares nothing.\n');
          index += '- **§2** — [An undeclared lesson](lessons/2-an-undeclared-lesson.md)\n';
        }
        writeFileSync(join(d, 'LESSONS.md'), index);
        return spawnSync('node', [join(d, 'lessons-check.mjs')], { encoding: 'utf8', timeout: 60000 });
      };
      const red = hub(true);
      const green = hub(false);
      const failuresAt = red.stdout.indexOf('FAILURES (1):');
      return h.assertAll([
        ['a red run exits 1 and its first line says it is red', red.status === 1 && red.stdout.split('\n')[0] === '=== lessons gate: RED, 1 failure ===', red.stdout + red.stderr],
        ['the failures come before anything else and name the lesson', failuresAt > 0 && failuresAt < 80 && /An undeclared lesson.*no "\*\*Enforced by:\*\*" line/.test(red.stdout), red.stdout],
        ['a red run prints none of the lists of passes', !/JUDGEMENT — not checkable|GATED —|CHECKLIST —/.test(red.stdout), red.stdout],
        ['a green run exits 0, prints the lists of passes and the closing line', green.status === 0 && /JUDGEMENT — not checkable/.test(green.stdout) && /^PASS — every lesson declares/m.test(green.stdout), green.stdout + green.stderr],
      ]);
    },
  },
  {
    name: 'the lessons check prints a citation of a retired gate file as retired and passes, and fails a missing gate file that is not on the retired list',
    guards: ['lessons_retired_listed'],
    run(m, dir, h) {
      const hub = (gate) => {
        const d = h.tmp('sg-lessons-retired-');
        copyFileSync(join(dir, 'lessons-check.mjs'), join(d, 'lessons-check.mjs'));
        mkdirSync(join(d, 'lessons'));
        mkdirSync(join(d, 'archive'));
        writeFileSync(join(d, 'archive', 'RETIRED-FILES.txt'), '# Planted: the retired gate files of the case.\n\nplanted-retired-gate.mjs\n');
        writeFileSync(join(d, 'lessons', '1-a-planted-lesson.md'), `## 1 · A planted lesson\n\n**Enforced by:** GATE hub:${gate} the planted gate that is cited.\n`);
        writeFileSync(join(d, 'LESSONS.md'), '# Lessons\n\nPlanted prose of the case.\n\n- **§1** — [A planted lesson](lessons/1-a-planted-lesson.md)\n');
        return spawnSync('node', [join(d, 'lessons-check.mjs')], { encoding: 'utf8', timeout: 60000 });
      };
      const listed = hub('planted-retired-gate.mjs');
      const other = hub('planted-other-gate.mjs');
      return h.assertAll([
        ['a missing gate file that is on the list passes and is printed as retired', listed.status === 0 && /^RETIRED \(1\)/m.test(listed.stdout) && /planted-retired-gate\.mjs, a gate file this repository retired/.test(listed.stdout) && /^PASS/m.test(listed.stdout), listed.stdout + listed.stderr],
        ['a missing gate file that is not on the list fails as it did', other.status === 1 && /planted-other-gate\.mjs, which DOES NOT EXIST/.test(other.stdout) && !/RETIRED \(/.test(other.stdout), other.stdout + other.stderr],
      ]);
    },
  },
  {
    name: 'step 119: a case filter cut at a space is refused, as stray words among the arguments and as a filter that selects more than half of the suite, --allow-wide runs the wide one on purpose, and a quoted value with a space is read whole',
    guards: ['case_filter_stray', 'case_filter_wide'],
    run(m, dir, h) {
      const c = h.suiteCopy(dir);
      const stray = c.run(['--case=the', 'dispatch', 'gate']);
      const wide = c.run(['--case=a']);
      const allowed = c.run(['--case=a', '--allow-wide', '--plants', '--dry', '--files=no-such-file.mjs']);
      const quoted = c.run(['--case=no-such case name at all']);
      return h.assertAll([
        ['stray words are refused with exit 2, each named', stray.status === 2 && /CASE FILTER REFUSED: 2 words stand among the arguments that is no switch \("dispatch", "gate"\)/.test(stray.stdout) && !/passed$/m.test(stray.stdout), stray.stdout + stray.stderr],
        ['a filter that selects more than half the suite is refused with exit 2', wide.status === 2 && /CASE FILTER REFUSED: it selects \d+ of \d+ cases, more than half of the suite/.test(wide.stdout) && !/passed$/m.test(wide.stdout), wide.stdout + wide.stderr],
        ['--allow-wide lets the wide filter through', allowed.status === 0 && /^CASE FILTER: 1 substring: "a" matched \d+/m.test(allowed.stdout) && !/REFUSED/.test(allowed.stdout), allowed.stdout + allowed.stderr],
        ['a quoted value with spaces is one substring and selects nothing here', quoted.status === 0 && /CASE FILTER: 1 substring: "no-such case name at all" matched 0; 0 of \d+ cases selected/.test(quoted.stdout), quoted.stdout + quoted.stderr],
      ]);
    },
  },
  {
    name: 'Q-HUB-401: a run that names two --case= switches runs the cases of both, the filter line counts two substrings, and a run with one switch is read as before',
    guards: ['case_switches_all'],
    run(m, dir, h) {
      const c = h.suiteCopy(dir, { 'planted-target.mjs': PLANTED_TARGET, 'guard-cases/planted.mjs': PLANTED_CASE_FILE });
      const two = c.run(['--case=planted-caught-case', '--case=planted-failing-case']);
      const one = c.run(['--case=planted-caught-case']);
      const commas = c.run(['--case=planted-caught-case,planted-failing-case']);
      return h.assertAll([
        ['both named cases ran: the first passed and the second failed', /^PASS  planted-caught-case$/m.test(two.stdout) && /^FAIL  planted-failing-case /m.test(two.stdout) && /^1\/2 passed$/m.test(two.stdout), two.stdout + two.stderr],
        ['the filter line counts two substrings', /^CASE FILTER: 2 substrings: "planted-caught-case" matched 1, "planted-failing-case" matched 1; 2 of \d+ cases selected\./m.test(two.stdout), two.stdout],
        ['the run with two switches reads as the run with one comma-joined switch', /^1\/2 passed$/m.test(commas.stdout) && /^CASE FILTER: 2 substrings:/m.test(commas.stdout), commas.stdout],
        ['a single switch still selects one case', one.status === 0 && /^1\/1 passed$/m.test(one.stdout) && !/planted-failing-case/.test(one.stdout.replace(/^CASE FILTER:.*$/m, '')), one.stdout + one.stderr],
      ]);
    },
  },
  {
    name: 'Q-HUB-476: a case file that cannot be loaded is named on a NOT LOADED line and the other files still run: a run narrowed to a loaded case passes, a narrowed run that selects nothing and a whole plants run exit non-zero, and a plants run prints the line once',
    guards: ['nl_loader', 'nl_print', 'nl_cases_exit', 'nl_plants_whole', 'nl_plants_narrow', 'nl_chunk_filter', 'nl_chunk_keys'],
    run(m, dir, h) {
      const good = [
        "import { readFileSync } from 'node:fs';",
        "import { join } from 'node:path';",
        'export const cases = [',
        "  { name: 'planted-loaded-case', guards: ['planted_ok'], run(m, d, h) { return h.assertAll([['the target holds its first line', readFileSync(join(d, 'planted-target.mjs'), 'utf8').includes('alpha-line'), '']]); } },",
        '];',
        'export const plants = {',
        "  planted_ok: ['alpha-line', 'beta-line', 'planted-target.mjs'],",
        '};',
        '',
      ].join('\n');
      const c = h.suiteCopy(dir, { 'planted-target.mjs': PLANTED_TARGET, 'guard-cases/planted-good.mjs': good, 'guard-cases/planted-broken.mjs': 'export const cases = [ {\n' });
      const named = /^NOT LOADED guard-cases\/planted-broken\.mjs: \S/m;
      const narrowed = c.run(['--case=planted-loaded-case']);
      const unheld = c.run(['--case=no-such-case-name-at-all']);
      const dryWhole = c.run(['--plants', '--dry']);
      const dryNarrow = c.run(['--plants', '--dry', '--files=planted-target.mjs']);
      const drySelectsNone = c.run(['--plants', '--dry', '--files=no-such-file.mjs']);
      const planted = c.run(['--plants', '--files=planted-target.mjs']);
      const keyed = c.run(['--plants', '--plant-keys=no_such_plant_key']);
      const count = (s) => (s.match(/^NOT LOADED /gm) ?? []).length;
      return h.assertAll([
        ['a run narrowed to a case of a loaded file passes, with the broken file named', narrowed.status === 0 && /^PASS  planted-loaded-case$/m.test(narrowed.stdout) && /^1\/1 passed$/m.test(narrowed.stdout) && named.test(narrowed.stdout), narrowed.stdout + narrowed.stderr],
        ['the file is named once, with the load error on its line', count(narrowed.stdout) === 1, narrowed.stdout],
        ['a case run narrowed to a name no loaded file holds exits non-zero and names the file', unheld.status !== 0 && /^NOTHING SELECTED among the files that loaded; not loaded: guard-cases\/planted-broken\.mjs$/m.test(unheld.stdout) && named.test(unheld.stdout), unheld.stdout + unheld.stderr],
        ['a whole plants run says the file fails it', dryWhole.status !== 0 && /^NOT LOADED FAILS THIS RUN \(no narrowing\): guard-cases\/planted-broken\.mjs$/m.test(dryWhole.stdout), dryWhole.stdout],
        ['a plants run narrowed to a loaded file exits by that file alone', dryNarrow.status === 0 && named.test(dryNarrow.stdout) && !/NOT LOADED FAILS/.test(dryNarrow.stdout) && /^PLANTS TO RUN: 1 of /m.test(dryNarrow.stdout), dryNarrow.stdout],
        ['a plants run narrowed to a file that selects nothing exits non-zero naming the file', drySelectsNone.status !== 0 && /^NOT LOADED FAILS THIS RUN \(nothing was selected/m.test(drySelectsNone.stdout), drySelectsNone.stdout],
        ['a plants run prints the NOT LOADED line once, not once for each chunk process, and catches the loaded file\'s plant', count(planted.stdout) === 1 && /^CAUGHT  plant "planted_ok" in planted-target\.mjs/m.test(planted.stdout), planted.stdout],
        ['a plant-keys run of a key no loaded file holds exits non-zero and names the file', keyed.status !== 0 && named.test(keyed.stdout) && /no plant of that name stands/.test(keyed.stdout), keyed.stdout + keyed.stderr],
      ]);
    },
  },
  {
    name: 'step 119: a plants run names every stale plant before it runs any, runs its plants in chunks of PLANT_CHUNK each in a new process, and ends with lines that repeat every plant missed and every plant stale',
    guards: ['plants_stale_before', 'plants_chunk', 'plants_closing_missed', 'plants_closing_stale'],
    run(m, dir, h) {
      const c = h.suiteCopy(dir, { 'planted-target.mjs': PLANTED_TARGET, 'guard-cases/planted.mjs': PLANTED_CASE_FILE });
      const one = c.run(['--plants', '--files=planted-target.mjs'], { PLANT_CHUNK: '1' });
      const whole = c.run(['--plants', '--files=planted-target.mjs']);
      const lines = one.stdout.split('\n');
      const tail = lines.slice(-9).join('\n');
      return h.assertAll([
        ['the run fails, since one plant is missed and one is stale', one.status === 1 && whole.status === 1, `${one.status} ${whole.status}`],
        ['the stale plant is named before any plant is run', /^STALE PLANTS BEFORE THE RUN \(1\): planted_stale in planted-target\.mjs\./m.test(one.stdout) && one.stdout.indexOf('STALE PLANTS BEFORE THE RUN') < one.stdout.indexOf('CAUGHT  plant'), one.stdout + one.stderr],
        ['a chunk of one plant is a process of its own: two processes for two plants', /^PLANT PROCESSES: 2 of at most 1 plants each/m.test(one.stdout) && /PLANT PROCESSES: 1 of at most 25 plants each/.test(whole.stdout), `${one.stdout} | ${whole.stdout}`],
        ['the chunks print their verdicts and none of their own end lines', /^CAUGHT  plant "planted_caught" in planted-target\.mjs$/m.test(one.stdout) && /^MISSED  plant "planted_missed" in planted-target\.mjs — its cases still passed$/m.test(one.stdout) && !/CHUNK-END/.test(one.stdout), one.stdout + one.stderr],
        ['the count line still reads as before', /^PLANTS RUN: 3 of \d+ \(the plants of planted-target\.mjs; add the counts of the by-file runs against the total of \d+\)\.$/m.test(one.stdout), one.stdout],
        ['the last lines repeat the plant missed and the plant stale', /^MISSED PLANTS \(1\): planted_missed$/m.test(tail) && /^STALE PLANTS \(1\): planted_stale$/m.test(tail), tail],
      ]);
    },
  },
  {
    name: 'step 119: the plants of every guard file, counted by file in the run\'s own line, add up to the total, and a run narrowed to each file lists exactly that many',
    guards: ['plants_by_file'],
    run(m, dir, h) {
      const dry = (...args) => spawnSync('node', [join(dir, 'session-guards.test.mjs'), '--plants', '--dry', ...args], { encoding: 'utf8', timeout: 120000 });
      const full = dry();
      const line = /^PLANTS BY FILE: (.*); (\d+) in all$/m.exec(full.stdout);
      const perFile = line ? line[1].split(', ').map((x) => [x.slice(0, x.lastIndexOf(' ')), Number(x.slice(x.lastIndexOf(' ') + 1))]) : [];
      const narrowed = perFile.map(([f, n]) => [f, n, Number(/^PLANTS TO RUN: (\d+) of/m.exec(dry(`--files=${f}`).stdout)?.[1] ?? -1)]);
      const total = line ? Number(line[2]) : -1;
      return h.assertAll([
        ['the run prints its by-file line', Boolean(line) && perFile.length > 0, full.stdout],
        ['the by-file counts add up to the total, which is the size of the plants map', perFile.reduce((s, [, n]) => s + n, 0) === total && total === Object.keys(PLANTS).length, `${total} ${Object.keys(PLANTS).length}`],
        ['a run narrowed to each file lists the count the line gave', narrowed.length > 0 && narrowed.every(([, n, got]) => n === got) && narrowed.reduce((s, [, , got]) => s + got, 0) === total, JSON.stringify(narrowed.filter(([, n, got]) => n !== got))],
      ]);
    },
  },
];

const PLANTS = {
  cost_item_read: ['item: section.match(/\\bP-\\d+\\b/)?.[0] ?? null };', 'item: null };', 'session-cost.mjs'],
  cost_saved_read: ['if (file && existsSync(file)) return', 'if (false && file && existsSync(file)) return', 'session-cost.mjs'],
  cost_write_read: ['lastWrite = planIdentity(b.input?.content);', 'lastWrite = { title: null, item: null };', 'session-cost.mjs'],
  owner_mode: ['const m = e.permissionMode ?? e.attachment?.permissionMode;', 'const m = null;', 'transcript-tail.mjs'],
  harness_tag: ['export const HARNESS_TAG = /^\\s*<(?:task-notification|', 'export const HARNESS_TAG = /^NEVER<(?:task-notification|', 'transcript-tail.mjs'],
  owner_slash_tags: ['  if (HARNESS_TAG.test(t)) return false;\n  return true;', '  return true;', 'transcript-tail.mjs'],
  owner_slash_shared: ['|command-(?:name|message))', '|command-NEVER)', 'transcript-tail.mjs'],
  harness_handback: ['agent-message\\b|', '', 'transcript-tail.mjs'],
  harness_bare_handback: ['|^\\s*\\[Subagent hand-back\\]/i;', '/i;', 'transcript-tail.mjs'],
  copies_owner: ['  if (!runs.size) return false;', '  return false;', 'transcript-tail.mjs'],
  push_dest: ['    if (!ALLOWED.has(d.dst)) return', '    if (false) return', 'push-guard.mjs'],
  push_noref: ["    specs = ['HEAD'];", '    specs = [];', 'push-guard.mjs'],
  push_head: ["  if (dst === 'HEAD' || dst === '@') {", '  if (false) {', 'push-guard.mjs'],
  push_colon: ["  if (s.startsWith(':')) return { bad", '  if (false) return { bad', 'push-guard.mjs'],
  push_nested: ['  for (const s of commandsIn(cmd)) {', '  for (const s of commandsIn(cmd).filter((x) => x.depth === 0)) {', 'push-guard.mjs'],
  push_cd: ['      if (plain) cwd = resolve(cwd, args[0]);', '      if (plain) { /* not followed */ }', 'push-guard.mjs'],
  push_flags: ['    if (/^--(all|branches|mirror|tags|follow-tags|delete|prune)(=|$)/.test(a)) return', '    if (false) return', 'push-guard.mjs'],
  push_short_d: ["      if (a.includes('d')) return", '      if (false) return', 'push-guard.mjs'],
  push_force_main: ["    if (d.dst === 'main' && (force || String(spec).startsWith('+'))) return", '    if (false) return', 'push-guard.mjs'],
  push_no_verify: ["    if (a === '--no-verify') return 'git push --no-verify", "    if (false) return 'git push --no-verify", 'push-guard.mjs'],
  push_commit_n: ["      if (a[j] === 'n') return true;", '      if (false) return true;', 'push-guard.mjs'],
  push_commit_nv: ["    if (a === '--no-verify') return true;", '    if (false) return true;', 'push-guard.mjs'],
  push_alias: ['    if (isAlias(dir, sub)) return', '    if (false) return', 'push-guard.mjs'],
  push_alias_conf: ['      if (/^alias\\./i.test(v)) return', '      if (false) return', 'push-guard.mjs'],
  push_gitdir: ["{ dirOpt = o.split('=')[0]; continue; }", '{ continue; }', 'push-guard.mjs'],
  push_env: ["  let unsure = GIT_ENV.test(cmd) || process.env.GIT_DIR || process.env.GIT_WORK_TREE ? 'a GIT_DIR-style variable' : '';", "  let unsure = '';", 'push-guard.mjs'],
  push_subshell: ['  const sub = hasSubshell(cmd);', '  const sub = false;', 'push-guard.mjs'],
  push_config: ['  if (config) return `git push with ${config}', '  if (false) return `git push with ${config}', 'push-guard.mjs'],
  push_xargs: ["pre.some((x) => basename(x) === 'xargs') ? 'xargs, which adds words of its own'", "false ? 'xargs, which adds words of its own'", 'push-guard.mjs'],
  push_find: ["    if (prog === 'find') {", '    if (false) {', 'push-guard.mjs'],
  push_connector_create: ['    if (BRANCH_CREATE.some(', '    if (false && BRANCH_CREATE.some(', 'push-guard.mjs'],
  push_connector_write: ['      if (!ALLOWED.has(b)) return', '      if (false) return', 'push-guard.mjs'],
  push_connector_merge: ['    if (PR_MERGE.some(', '    if (false && PR_MERGE.some(', 'push-guard.mjs'],
  push_connector_update: ['    if (BRANCH_UPDATE.some(', '    if (false && BRANCH_UPDATE.some(', 'push-guard.mjs'],
  push_redirect: ['  const args = dropRedirects(words.slice(k + 1));', '  const args = words.slice(k + 1);', 'push-guard.mjs'],
  commit_msg_hook_trailer: ['Co-Authored-By:|Claude-Session:', 'Nosuchtrailerwords:', 'branch-guard.mjs'],
  commit_msg_hook_link: ['.ai/code/session_', '.ai/code/nolink_', 'branch-guard.mjs'],
  commit_msg_hook_model: ['(Sonnet|Opus|Haiku|Fable|Mythos)', '(Nosuchmodelname)', 'branch-guard.mjs'],
  commit_msg_hook_install: ['  writeFileSync(cmLivePath, cmWant);\n', '\n', 'branch-guard.mjs'],
  commit_msg_hook_line: ['echo "      $2" >&2', 'echo "      " >&2', 'branch-guard.mjs'],
  plants_files_flag: ["const todo = Object.entries(PLANTS).filter(([, [, , file]]) => !narrowTo || narrowTo.includes(file));\n  // EVERY PLANT WHOSE LINE", "const todo = Object.entries(PLANTS);\n  // EVERY PLANT WHOSE LINE", 'session-guards.test.mjs'],
  plants_touched_flag: ["else if (process.argv.includes('--touched')) {\n    narrowTo = touchedFiles();", "else if (process.argv.includes('--touched')) {\n    narrowTo = [];", 'session-guards.test.mjs'],
  plants_dry: ["if (process.argv.includes('--dry')) {\n    console.log(`PLANTS TO RUN", "if (false) {\n    console.log(`PLANTS TO RUN", 'session-guards.test.mjs'],
  nl_loader: ["continue; }\n  const cs = mod.cases ?? [];", "throw new Error('planted'); }\n  const cs = mod.cases ?? [];", 'session-guards.test.mjs'],
  nl_print: ["for (const n of NOT_LOADED) console.log(`NOT LOADED ${n.file}: ${n.err}`);\n// Whether a run", "// Whether a run", 'session-guards.test.mjs'],
  nl_cases_exit: ["  rmSync(STATE, { recursive: true, force: true });\n  process.exit(failedN || (NOT_LOADED.length && (!caseList || nothingSelected)) ? 1 : 0);", "  rmSync(STATE, { recursive: true, force: true });\n  process.exit(failedN || (NOT_LOADED.length && !caseList) ? 1 : 0);", 'session-guards.test.mjs'],
  nl_plants_whole: ["((!narrowTo && !caseList) || todo.length === 0);\n  if (notLoadedFails)", "(todo.length === 0);\n  if (notLoadedFails)", 'session-guards.test.mjs'],
  nl_plants_narrow: ["((!narrowTo && !caseList) || todo.length === 0);\n  if (notLoadedFails)", "(true);\n  if (notLoadedFails)", 'session-guards.test.mjs'],
  nl_chunk_filter: ["if (!line || line.startsWith('NOT LOADED ')) continue;\n      const e = /^CHUNK-END", "if (!line) continue;\n      const e = /^CHUNK-END", 'session-guards.test.mjs'],
  nl_chunk_keys: ["  rmSync(STATE, { recursive: true, force: true });\n  process.exit(NOT_LOADED.length && !ran ? 1 : 0);", "  rmSync(STATE, { recursive: true, force: true });\n  process.exit(0);", 'session-guards.test.mjs'],
  run_plants_not_run: ['  // suite for nine hours, and the plants are the other half of it.\n  console.log(`PLANTS NOT RUN:', '  // suite for nine hours, and the plants are the other half of it.\n  console.log(`PLANTS:', 'session-guards.test.mjs'],
  case_split: ["  const words = v === undefined ? [] : v.split(',').map((s) => s.trim()).filter(Boolean);\n", "  const words = v === undefined ? [] : [v];\n", 'session-guards.test.mjs'],
  case_count: ["const counts = words.map((w) => CASES.filter((c) => c.name.includes(w)).length);\n", "const counts = words.map(() => 0);\n", 'session-guards.test.mjs'],
  bare_source_read: ["      return h.assertAll([\n        ['an edit of the working copy during a case passes", "      return ([\n        ['an edit of the working copy during a case passes", 'session-guards.test.mjs'],
  run_plants_counted: ['  }\n  console.log(`PLANTS RUN: ${todo.length} of', '  }\n  console.log(`PLANTS: ${todo.length} of', 'session-guards.test.mjs'],
  case_files_load: ['    CASES.push(c);\n  }\n  for (const [k, v] of Object.entries(ps)) {', '    void c;\n  }\n  for (const [k, v] of Object.entries(ps)) {', 'session-guards.test.mjs'],
  case_files_helpers: ['let ok = false, err, bare = false;\n    try { ok = await c.run(m, dir, H); }', 'let ok = false, err, bare = false;\n    try { ok = await c.run(m, dir); }', 'session-guards.test.mjs'],
  case_files_dup_case: ['\n    if (CASES.some((x) => x.name === c.name)) throw', '\n    if (false) throw', 'session-guards.test.mjs'],
  case_files_dup_plant: ['\n    if (PLANTS[k]) throw', '\n    if (false) throw', 'session-guards.test.mjs'],
  case_files_plants_merge: ['    PLANTS[k] = v;\n  }\n}', '    void v;\n  }\n}', 'session-guards.test.mjs'],
  touched_case_file: ['\n  return [...paths, ...paths.filter(', '\n  return [...paths, ...[].filter(', 'session-guards.test.mjs'],
  no_assertion_text: ["\n    if (!ok && !err) err = 'the case returned false", "\n    if (false) err = 'the case returned false", 'session-guards.test.mjs'],
  tracked_watch: ['\n        if (h !== b.sum) out.push(', '\n        if (false) out.push(', 'session-guards.test.mjs'],
  tracked_watch_fail: ['\n    if (wrote.length) { ok = false; WROTE++;', '\n    if (false) { ok = false; WROTE++;', 'session-guards.test.mjs'],
  lessons_red_first: ['\nif (failures.length) {\n  console.log(`=== lessons gate: RED', '\nif (false) {\n  console.log(`=== lessons gate: RED', 'lessons-check.mjs'],
  lessons_retired_listed: ['\n      } else if (!existsSync(join(base, path)) && base === HUB && retiredFiles().has(path)) {', '\n      } else if (!existsSync(join(base, path)) && base === HUB && false && retiredFiles().has(path)) {', 'lessons-check.mjs'],
  case_filter_stray: ['\nif (strayWords.length) {\n', '\nif (false) {\n', 'session-guards.test.mjs'],
  case_filter_wide: ["\n  if (selected * 2 > CASES.length && !process.argv.includes('--allow-wide')) {", '\n  if (false) {', 'session-guards.test.mjs'],
  case_switches_all: ["\nconst caseList = caseWords(argValues('case').join(','));", "\nconst caseList = caseWords(argValue('case'));", 'session-guards.test.mjs'],
  plants_stale_before: ['\n  if (stale.length) console.log(`STALE PLANTS BEFORE THE RUN', '\n  if (false) console.log(`STALE PLANTS BEFORE THE RUN', 'session-guards.test.mjs'],
  plants_chunk: ['\nconst PLANT_CHUNK = Math.max(1, Math.floor(Number(process.env.PLANT_CHUNK)) || 25);', '\nconst PLANT_CHUNK = 25;', 'session-guards.test.mjs'],
  plants_closing_missed: ['\n  console.log(missed.length ? `MISSED PLANTS (', '\n  console.log(false ? `MISSED PLANTS (', 'session-guards.test.mjs'],
  plants_closing_stale: ['\n  console.log(stale.length ? `STALE PLANTS (', '\n  console.log(false ? `STALE PLANTS (', 'session-guards.test.mjs'],
  plants_by_file: ['\n    console.log(plantsByFile());\n    rmSync(STATE', '\n    rmSync(STATE', 'session-guards.test.mjs'],
  run_in_copy: ['\n  const copy = checkoutCopy(HERE);\n', '\n  const copy = null;\n', 'session-guards.test.mjs'],
  bare_detect: ['\n    else if (ok === true) bare = true;\n', '\n', 'session-guards.test.mjs'],
  bare_list: ["\n  if (process.argv.includes('--bare-list')) for", "\n  if (false) for", 'session-guards.test.mjs'],
  asserted_mark: ['\n  return ASSERTED;\n};', '\n  return true;\n};', 'session-guards.test.mjs'],
};

/**
 * What `assertAll` returns when every row held. It is a mark of its own and not the boolean `true`, so the runner can tell a case
 * that ended in `assertAll` from one that ends in a bare `return true` (Q-HUB-346); the runner turns it into a pass.
 */
const ASSERTED = Symbol('assertAll: every row held');

/**
 * Fail a case with every failed assertion named and the text the call returned beside it (Q-HUB-319): a case that
 * ends in `return a && b && c` names nothing when it is red, and one red run could not be read.
 * @param {Array<[string, boolean, unknown]>} rows label, whether it held, and what the call returned
 * @returns {symbol} the mark `ASSERTED` when every row held; else it throws
 */
const assertAll = (rows) => {
  const failed = rows.filter(([, ok]) => !ok);
  if (failed.length) throw new Error(failed.map(([label, , got]) => `${label}: got ${JSON.stringify(String(got ?? '').slice(0, 600))}`).join(' | '));
  return ASSERTED;
};

/**
 * A copy of the suite and its guards as a git checkout under a temporary folder, with more files written into it
 * (the case files and plants a case plants), for a case that runs the suite on a changed suite.
 * @param {string} dir the folder the case was given
 * @param {Record<string,string>} [extra] path in the copy -> text
 * @returns {{dir: string, g: Function, write: Function, run: (args: string[], env?: object) => import('node:child_process').SpawnSyncReturns<string>}}
 */
function suiteCopy(dir, extra = {}) {
  const c = repo({}, 'suite-copy');
  for (const f of FILES) copyGuard(join(dir, f), join(c.dir, f));
  for (const [f, text] of Object.entries(extra)) { mkdirSync(dirname(join(c.dir, f)), { recursive: true }); writeFileSync(join(c.dir, f), text); }
  c.g('add', '-A'); c.g('commit', '-q', '-m', 'guards');
  const run = (args, env = {}) => spawnSync('node', [join(c.dir, 'session-guards.test.mjs'), ...args], { encoding: 'utf8', timeout: 600000, maxBuffer: 256 * 1024 * 1024, env: { ...process.env, TMPDIR: REAL_TMP, ...env } });
  return { ...c, run };
}

// A case file the step-119 cases plant in a copy of the suite, and the file its plants target. Three plants: one a case catches, one
// whose case asserts too little (missed), one whose line the target no longer holds (stale).
const PLANTED_TARGET = 'alpha-line\nsecond-line\nthird-line\n';
const PLANTED_CASE_FILE = [
  "import { readFileSync } from 'node:fs';",
  "import { join } from 'node:path';",
  'export const cases = [',
  "  { name: 'planted-caught-case', guards: ['planted_caught'], run(m, dir, h) { return typeof h.tmp === 'function' && readFileSync(join(dir, 'planted-target.mjs'), 'utf8').includes('alpha-line'); } },",
  "  { name: 'planted-missed-case', guards: ['planted_missed'], run() { return true; } },",
  "  { name: 'planted-failing-case', run() { return false; } },",
  '];',
  'export const plants = {',
  "  planted_caught: ['alpha-line', 'beta-line', 'planted-target.mjs'],",
  "  planted_missed: ['second-line', 'other-line', 'planted-target.mjs'],",
  "  planted_stale: ['no-such-text-anywhere', 'x', 'planted-target.mjs'],",
  '};',
  '',
].join('\n');

// ---- the case files under guard-cases/ (step 119 of the plan of 8 November) ----
// Every `.mjs` file in the folder beside this one is loaded and its cases and plants join the ones above, so seven steps can write cases
// at once, each in a file of its own. The helpers of this file reach a case file as the third argument of `run`.
const H = { HERE, FILES, copyGuard, tmp, STATE, DECOY, DECOY_PAD, plantDecoy, decoyChanged, sid, ts, later, at, turn, tool, result, transcript, repo, jsonl, assertAll, suiteCopy };
const NOT_LOADED = [];
const CASE_DIR = join(HERE, 'guard-cases');
const CASE_FILE_NAMES = existsSync(CASE_DIR) ? readdirSync(CASE_DIR).filter((f) => f.endsWith('.mjs')).sort() : [];
for (const f of CASE_FILE_NAMES) {
  FILES.push(`guard-cases/${f}`);
  let mod;
  // A CASE FILE THAT CANNOT BE LOADED IS NAMED, NOT FATAL (Q-HUB-476): six steps writing at once left one file unparsed for a moment and
  // every other step's run went red before any case ran. The file is listed, its cases are not run, and the exits below say so.
  try { mod = await import(pathToFileURL(join(CASE_DIR, f)).href); } catch (e) { NOT_LOADED.push({ file: `guard-cases/${f}`, err: String(e?.message ?? e).split('\n')[0] }); continue; }
  const cs = mod.cases ?? [];
  const ps = mod.plants ?? {};
  if (!Array.isArray(cs) || typeof ps !== 'object' || ps === null || Array.isArray(ps)) throw new Error(`guard-cases/${f} must export cases (an array) and plants (an object)`);
  for (const c of cs) {
    if (typeof c?.name !== 'string' || typeof c?.run !== 'function') throw new Error(`guard-cases/${f} holds a case with no name or no run function`);
    if (CASES.some((x) => x.name === c.name)) throw new Error(`guard-cases/${f}: a case named "${c.name}" already stands; case names are unique across the suite`);
    CASES.push(c);
  }
  for (const [k, v] of Object.entries(ps)) {
    if (!Array.isArray(v) || v.length !== 3 || !v.every((x) => typeof x === 'string')) throw new Error(`guard-cases/${f}: plant "${k}" must be [the line to take out, what replaces it, the guard file]`);
    if (PLANTS[k]) throw new Error(`guard-cases/${f}: a plant named "${k}" already stands; plant names are unique across the suite`);
    PLANTS[k] = v;
  }
}

/**
 * The tracked files of a checkout, watched for a rewrite or a removal by a case (Q-HUB-266, Q-HUB-319).
 * @param {string} dir the checkout, or the copy of one
 * @param {string[]} [list] the files to watch, for a copy that holds no git directory; else git names the tracked files of `dir`
 * @returns {{count: number, changed: () => string[]}|null} null when `dir` is not a git checkout and no list is given; `changed()` names each
 *   file whose content differs from what it held at the last call (or at this one), once.
 */
function trackedWatch(dir, list = null) {
  let files = list;
  if (!files) {
    const ls = spawnSync('git', ['-C', dir, 'ls-files', '-z'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    if (ls.status !== 0) return null;
    files = (ls.stdout ?? '').split('\0').filter(Boolean);
  }
  const stat = (f) => { try { const s = statSync(join(dir, f)); return `${s.size}:${s.mtimeMs}`; } catch { return null; } };
  const sum = (f) => { try { return createHash('sha256').update(readFileSync(join(dir, f))).digest('hex'); } catch { return null; } };
  const base = new Map(files.map((f) => [f, { stat: stat(f), sum: sum(f) }]));
  return {
    count: files.length,
    changed() {
      const out = [];
      for (const [f, b] of base) {
        const s = stat(f);
        if (s === b.stat) continue;
        const h = s === null ? null : sum(f);
        if (h !== b.sum) out.push(`${f} ${h === null ? 'was removed' : b.sum === null ? 'was created' : 'was rewritten'}`);
        b.stat = s; b.sum = h;
      }
      return out;
    },
  };
}
let WROTE = 0;

/**
 * A copy of the checkout made when a plain run starts (Q-HUB-345): the tracked files and the untracked files git does not ignore.
 * The cases run in the copy and the watch compares the copy, so a file another step edits in the working copy during the run is
 * not read as a case's write.
 * @param {string} dir the checkout
 * @returns {{dir: string, files: string[]}|null} null when `dir` is not a git checkout; else the copy's folder and the files in it
 */
function checkoutCopy(dir) {
  const ls = spawnSync('git', ['-C', dir, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (ls.status !== 0) return null;
  const copy = mkdtempSync(join(REAL_TMP, 'sg-run-'));
  const files = [];
  for (const f of new Set((ls.stdout ?? '').split('\0').filter(Boolean))) {
    // A file another step removed while the copy was made is not in the copy.
    try { copyGuard(join(dir, f), join(copy, f)); files.push(f); } catch { /* not copied */ }
  }
  return { dir: copy, files };
}

async function runAll(dir, only, filter, watch = null) {
  const imp = (f) => import(pathToFileURL(join(dir, f)).href + `?v=${Math.random()}`);
  const m = { push: await imp('push-guard.mjs') };
  const results = [];
  for (const c of CASES) {
    if (only && !(c.guards ?? []).includes(only)) continue;
    if (filter && !filter.some((w) => c.name.includes(w))) continue;
    let ok = false, err, bare = false;
    try { ok = await c.run(m, dir, H); } catch (e) { ok = false; err = e?.message; }
    // A CASE THAT ENDS IN A BARE `return true` NAMES NO ASSERTION WHEN IT TURNS RED (Q-HUB-346): the mark assertAll returns is a pass,
    // and a bare true is a pass the run lists as a case still to change.
    if (ok === ASSERTED) ok = true;
    else if (ok === true) bare = true;
    if (!ok && !err) err = 'the case returned false and threw nothing, so it names no assertion; its conditions are read in order';
    // A CASE NEVER WRITES INTO THE WORKING COPY: the tracked files of the checkout are compared after every case of a plain run.
    const wrote = watch ? watch.changed() : [];
    if (wrote.length) { ok = false; WROTE++; err = `${err ? `${err}; ` : ''}WROTE INTO THE WORKING COPY (${wrote.length}): ${wrote.slice(0, 6).join(', ')}${wrote.length > 6 ? ', ...' : ''}`; }
    // EVERY CASE IS HELD TO THE PLANTED LIVE SESSION: a case that changed its page or its notes reached a
    // session through the inherited variable, fails for it, and puts the planted bytes back so the next case is judged alone.
    const leak = decoyChanged();
    if (leak) { ok = false; LEAKS++; err = `${err ? `${err}; ` : ''}LEAK: this case reached the planted live session (${leak})`; plantDecoy(); }
    results.push({ name: c.name, ok, err, bare });
    while (MADE.length) rmSync(MADE.pop(), { recursive: true, force: true });
  }
  return results;
}

// Flags: --case=<words in a case's name> runs only those cases. --plants runs every plant; with --files=a.mjs,b.mjs it runs only
// the plants of those guard files, with --touched only the plants of the files `git status` shows changed in this checkout (the
// gates a commit touches), and with --dry it lists the plants it would run and runs none. A narrowed run is a quick look at what
// an edit can have broken: a case exercises more than one file, so the full run stays the gate.
const argValue = (name) => process.argv.find((x) => x.startsWith(`--${name}=`))?.slice(name.length + 3);
// --case= takes a comma-separated list of substrings with no space in the value (a space is cut by the shell at its first word,
// Q-HUB-245, Q-HUB-269); a case runs when any one of them is in its name. An empty value is no filter.
const caseWords = (v) => {
  const words = v === undefined ? [] : v.split(',').map((s) => s.trim()).filter(Boolean);
  return words.length ? words : null;
};
/**
 * The line a filtered run opens with, so a filter that matched the whole suite says so.
 * @param {string[]} words the substrings given to --case=
 * @returns {string} the substrings with how many cases each matched, and how many cases the list selects in all
 */
function caseFilterHead(words) {
  const counts = words.map((w) => CASES.filter((c) => c.name.includes(w)).length);
  const total = CASES.filter((c) => words.some((w) => c.name.includes(w))).length;
  return `CASE FILTER: ${words.length} substring${words.length === 1 ? '' : 's'}: ${words.map((w, i) => `"${w}" matched ${counts[i]}`).join(', ')}; ${total} of ${CASES.length} cases selected.${total === CASES.length ? ' THE FILTER MATCHED EVERY CASE: this is the whole suite.' : ''}`;
}
// EVERY --case= SWITCH OF A RUN IS READ (Q-HUB-401): `argValue` returns the first switch only, so a run naming two cases dropped the second
// without a word. The values of all the switches are joined with the comma that separates names inside one switch.
const argValues = (name) => process.argv.filter((x) => x.startsWith(`--${name}=`)).map((x) => x.slice(name.length + 3));
const caseList = caseWords(argValues('case').join(','));
// A FILTER CUT AT A SPACE IS REFUSED, NOT RUN (Q-HUB-312). An unquoted `--case=a name` reaches the suite as `--case=a` and a stray word
// `name`, and a one-word substring such as `a` selected 281 of 293 cases in a run meant for one. The refusal names both faces: words that
// stand after the switch, and a filter that selects more than half of the suite (`--allow-wide` runs that on purpose).
const strayWords = process.argv.slice(2).filter((a) => !a.startsWith('--'));
for (const n of NOT_LOADED) console.log(`NOT LOADED ${n.file}: ${n.err}`);
// Whether a run is narrowed decides what a file that did not load costs: a whole run exits non-zero for it; a narrowed run exits by
// what it selected from the files that loaded, and non-zero only where it selected nothing.
const notLoadedNames = () => NOT_LOADED.map((n) => n.file).join(', ');
if (strayWords.length) {
  console.log(`CASE FILTER REFUSED: ${strayWords.length === 1 ? 'a word stands' : `${strayWords.length} words stand`} among the arguments that is no switch (${strayWords.map((w) => `"${w}"`).join(', ')}). A value with a space was cut at the space: quote the whole switch, as "--case=a name", or separate several names with commas and no space.`);
  process.exit(2);
}
if (caseList) {
  console.log(caseFilterHead(caseList));
  const selected = CASES.filter((c) => caseList.some((w) => c.name.includes(w))).length;
  if (selected * 2 > CASES.length && !process.argv.includes('--allow-wide')) {
    console.log(`CASE FILTER REFUSED: it selects ${selected} of ${CASES.length} cases, more than half of the suite, where a name selects one. A value cut at a space does this; add --allow-wide to run so many on purpose.`);
    process.exit(2);
  }
}
/**
 * The guard files this checkout has changed.
 * @returns {string[]|null} the top-level file names `git status` shows modified, added or untracked in
 *   this directory, or null when git cannot say (not a checkout), which `--touched` refuses to treat as
 *   "nothing touched".
 */
function touchedFiles() {
  const r = spawnSync('git', ['-C', HERE, 'status', '--porcelain', '-uall'], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  const paths = (r.stdout ?? '').split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^.* -> /, '').trim());
  // A case file is named for the guard file it covers: touching guard-cases/X.mjs touches X.mjs for the plants.
  return [...paths, ...paths.filter((p) => /^guard-cases\/[^/]+\.mjs$/.test(p)).map((p) => p.slice('guard-cases/'.length))];
}

// THE HEAP OF A PLANTS RUN (Q-HUB-315): every plant imports a fresh copy of nine guard modules, and a module stays in the process's
// heap for good, so one process over three guard files passed two gigabytes near plant 680 and aborted. The plants run in chunks, each
// chunk in a new process of its own, and the parent prints what the chunks print and adds up their verdicts.
const PLANT_CHUNK = Math.max(1, Math.floor(Number(process.env.PLANT_CHUNK)) || 25);
const plantsByFile = () => {
  const n = new Map();
  for (const [, , f] of Object.values(PLANTS)) n.set(f, (n.get(f) ?? 0) + 1);
  return `PLANTS BY FILE: ${[...n].map(([f, c]) => `${f} ${c}`).join(', ')}; ${Object.keys(PLANTS).length} in all`;
};
/**
 * Run one plant: the guards with its line taken out, and the cases that cite it.
 * @param {string} key the plant's name
 * @returns {Promise<'caught'|'missed'|'stale'>} stale when the file no longer holds the line to take out
 */
async function runPlant(key) {
  const [from, to, file] = PLANTS[key];
  const src = readFileSync(join(HERE, file), 'utf8');
  if (!src.includes(from)) { console.log(`PLANT ${key}: the line to take out is not in ${file} — the plant is stale`); return 'stale'; }
  const dir = mkdtempSync(join(tmpdir(), 'sg-plant-'));
  for (const f of FILES) copyGuard(join(HERE, f), join(dir, f));
  writeFileSync(join(dir, file), src.replace(from, to));
  const r = await runAll(dir, key, caseList);
  const caught = r.length > 0 && r.some((x) => !x.ok);
  if (!r.length) console.log(`PLANT ${key}: no case names it in its guards`);
  console.log(`${caught ? 'CAUGHT' : 'MISSED'}  plant "${key}" in ${file}${caught ? '' : ' — its cases still passed'}`);
  rmSync(dir, { recursive: true, force: true });
  return caught ? 'caught' : 'missed';
}

if (process.argv.includes('--plants') && argValue('plant-keys') !== undefined) {
  // One chunk of a parent's run: run the plants named, print their lines, and end with the one line the parent reads.
  let badInChunk = 0, ran = 0;
  for (const key of argValue('plant-keys').split(',').filter(Boolean)) {
    // A key held by a case file that did not load is named and counted, and the keys that are held run.
    if (!PLANTS[key] && NOT_LOADED.length) { console.log(`PLANT ${key}: no plant of that name stands among the files that loaded; not loaded: ${notLoadedNames()}`); badInChunk++; continue; }
    ran++;
    if ((await runPlant(key)) !== 'caught') badInChunk++;
  }
  console.log(`CHUNK-END bad=${badInChunk} leaks=${LEAKS}`);
  rmSync(STATE, { recursive: true, force: true });
  process.exit(NOT_LOADED.length && !ran ? 1 : 0);
} else if (process.argv.includes('--plants')) {
  let bad = 0;
  const noPlant = [], missed = [], caughtKeys = new Set();
  // Every guard a case cites has a plant behind it: a cited name with none is
  // a check nobody has watched go red.
  for (const g of new Set(CASES.flatMap((c) => c.guards ?? []))) {
    if (!PLANTS[g]) { console.log(`NO PLANT for "${g}": a case cites it, and nothing takes it out`); noPlant.push(g); bad++; }
  }
  let narrowTo = null;
  const filesFlag = argValue('files');
  if (filesFlag !== undefined) narrowTo = filesFlag.split(',').map((s) => s.trim()).filter(Boolean);
  else if (process.argv.includes('--touched')) {
    narrowTo = touchedFiles();
    if (narrowTo === null) { console.log('--touched needs a git checkout of the guards; this directory is not one, so nothing is run.'); process.exit(1); }
  }
  const todo = Object.entries(PLANTS).filter(([, [, , file]]) => !narrowTo || narrowTo.includes(file));
  // EVERY PLANT WHOSE LINE ITS FILE NO LONGER HOLDS IS NAMED BEFORE ANY IS RUN (Q-HUB-285): an edit that moves a plant's line is found
  // here, in one line, where it used to be found one plant at a time in the middle of a long run.
  const sources = new Map();
  const sourceOf = (file) => { if (!sources.has(file)) sources.set(file, existsSync(join(HERE, file)) ? readFileSync(join(HERE, file), 'utf8') : null); return sources.get(file); };
  const stale = todo.filter(([, [from, , file]]) => !(sourceOf(file) ?? '').includes(from)).map(([k]) => k);
  if (stale.length) console.log(`STALE PLANTS BEFORE THE RUN (${stale.length}): ${stale.map((k) => `${k} in ${PLANTS[k][2]}`).join(', ')}. Each is skipped and counted as a failure; re-point its line to where the edit moved it.`);
  // A FILE THAT DID NOT LOAD FAILS A WHOLE PLANTS RUN, AND A NARROWED ONE ONLY WHERE IT SELECTED NOTHING (Q-HUB-476).
  const notLoadedFails = NOT_LOADED.length > 0 && ((!narrowTo && !caseList) || todo.length === 0);
  if (notLoadedFails) console.log(`NOT LOADED FAILS THIS RUN (${todo.length === 0 ? 'nothing was selected among the files that loaded' : 'no narrowing'}): ${notLoadedNames()}`);
  if (process.argv.includes('--dry')) {
    console.log(`PLANTS TO RUN: ${todo.length} of ${Object.keys(PLANTS).length}: ${todo.map(([k]) => k).join(', ')}`);
    console.log(plantsByFile());
    rmSync(STATE, { recursive: true, force: true });
    process.exit(stale.length || noPlant.length || notLoadedFails ? 1 : 0);
  }
  if (narrowTo) console.log(`NARROWED to ${narrowTo.length ? narrowTo.join(', ') : 'no guard file'}: ${todo.length} of ${Object.keys(PLANTS).length} plants. The plants of the other files were not run; the full run is the gate.`);
  bad += stale.length;
  for (const k of stale) console.log(`PLANT ${k}: the line to take out is not in ${PLANTS[k][2]} — the plant is stale`);
  const keys = todo.map(([k]) => k).filter((k) => !stale.includes(k));
  const passThrough = process.argv.slice(2).filter((a) => a.startsWith('--case=') || a === '--allow-wide');
  if (keys.length) console.log(`PLANT PROCESSES: ${Math.ceil(keys.length / PLANT_CHUNK)} of at most ${PLANT_CHUNK} plants each, a new process for each (Q-HUB-315).`);
  let leaks = 0;
  for (let i = 0; i < keys.length; i += PLANT_CHUNK) {
    const chunk = keys.slice(i, i + PLANT_CHUNK);
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--plants', `--plant-keys=${chunk.join(',')}`, ...passThrough],
      { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, env: { ...process.env, TMPDIR: REAL_TMP } });
    let end = null;
    const reported = new Set();
    for (const line of (r.stdout ?? '').split('\n')) {
      if (!line || line.startsWith('NOT LOADED ')) continue;
      const e = /^CHUNK-END bad=(\d+) leaks=(\d+)$/.exec(line);
      if (e) { end = e; continue; }
      console.log(line);
      const verdict = /^(CAUGHT|MISSED)  plant "(.+?)" in /.exec(line);
      if (verdict) { reported.add(verdict[2]); if (verdict[1] === 'MISSED') missed.push(verdict[2]); else caughtKeys.add(verdict[2]); }
    }
    if (r.stderr) process.stderr.write(r.stderr);
    if (end) { bad += Number(end[1]); leaks += Number(end[2]); continue; }
    const lost = chunk.filter((k) => !reported.has(k));
    console.log(`PLANT CHUNK ENDED EARLY: the process for ${chunk[0]} to ${chunk[chunk.length - 1]} ended with status ${r.status}${r.signal ? ` and signal ${r.signal}` : ''}${r.error ? ` (${r.error.message})` : ''} before its last line; ${lost.length} of its ${chunk.length} plants have no verdict and count as missed.`);
    missed.push(...lost.map((k) => `${k} (no verdict)`));
    bad += lost.length;
  }
  console.log(`PLANTS RUN: ${todo.length} of ${Object.keys(PLANTS).length}${narrowTo ? ` (the plants of ${narrowTo.join(', ') || 'no guard file'}; add the counts of the by-file runs against the total of ${Object.keys(PLANTS).length})` : ' (all of them)'}.`);
  console.log(plantsByFile());
  // THE LAST LINES REPEAT EVERY PLANT MISSED OR STALE (Q-HUB-330): one missed plant in a long log took six searches to find.
  console.log(missed.length ? `MISSED PLANTS (${missed.length}): ${missed.join(', ')}` : 'MISSED PLANTS: none');
  console.log(stale.length ? `STALE PLANTS (${stale.length}): ${stale.join(', ')}` : 'STALE PLANTS: none');
  if (noPlant.length) console.log(`CITED WITH NO PLANT (${noPlant.length}): ${noPlant.join(', ')}`);
  console.log(leaks ? `LEAK: the planted live session was changed in ${leaks} case run${leaks === 1 ? '' : 's'} of the plants` : 'planted live session unchanged by the plants');
  rmSync(STATE, { recursive: true, force: true });
  process.exit(bad || notLoadedFails ? 1 : 0);
} else {
  const copy = checkoutCopy(HERE);
  const watch = trackedWatch(copy ? copy.dir : HERE, copy ? copy.files : null);
  const r = await runAll(copy ? copy.dir : HERE, undefined, caseList, watch);
  for (const x of r) console.log(`${x.ok ? 'PASS' : 'FAIL'}  ${x.name}${x.err ? ` (${x.err})` : ''}`);
  const failedN = r.filter((x) => !x.ok).length;
  console.log(`${r.length - failedN}/${r.length} passed`);
  console.log(copy ? `RUN IN A COPY: the cases ran against a copy of ${copy.files.length} files made when the run started; an edit of the working copy during the run is not read as a case's write` : 'RUN IN THE WORKING COPY: this folder is not a git checkout, so no copy was made');
  console.log(`BARE BOOLEAN CASES: ${r.filter((x) => x.bare).length} of ${r.length} cases ended in a bare true and name no assertion if they turn red; each is changed to end in h.assertAll, and --bare-list names them`);
  if (process.argv.includes('--bare-list')) for (const x of r.filter((y) => y.bare)) console.log(`BARE BOOLEAN CASE: ${x.name}`);
  if (copy) rmSync(copy.dir, { recursive: true, force: true });
  console.log(watch ? (WROTE ? `TRACKED FILES: ${watch.count} watched; ${WROTE} case${WROTE === 1 ? '' : 's'} wrote into the working copy` : `TRACKED FILES: ${watch.count} watched; no case changed one`) : 'TRACKED FILES: not watched, this folder is not a git checkout');
  // A RUN OF THE CASES SAYS THE PLANTS WERE NOT RUN (finding 16 of the plan of 1 November): a green line here was reported as the whole
  // suite for nine hours, and the plants are the other half of it.
  console.log(`PLANTS NOT RUN: this run ran the cases only; the ${Object.keys(PLANTS).length} plants run with --plants, by guard file (--files=a.mjs), and the full suite is the cases and every plant.`);
  console.log(LEAKS ? `LEAK: the planted live session was changed in ${LEAKS} case${LEAKS === 1 ? '' : 's'} of the run` : 'planted live session unchanged by the run');
  // A FILE THAT DID NOT LOAD FAILS A WHOLE RUN, AND A RUN NARROWED BY --case= ONLY WHERE IT SELECTED NOTHING (Q-HUB-476).
  const nothingSelected = r.length === 0;
  if (NOT_LOADED.length && nothingSelected) console.log(`NOTHING SELECTED among the files that loaded; not loaded: ${notLoadedNames()}`);
  else if (NOT_LOADED.length && !caseList) console.log(`CASES NOT RUN: every case of ${notLoadedNames()} (not loaded); the run exits non-zero for it.`);
  rmSync(STATE, { recursive: true, force: true });
  process.exit(failedN || (NOT_LOADED.length && (!caseList || nothingSelected)) ? 1 : 0);
}
