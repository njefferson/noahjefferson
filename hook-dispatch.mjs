#!/usr/bin/env node
/**
 * THE HUB'S HOOKS ARE ONE SMALL DISPATCHER (plans/native-setup.md, Part D).
 *
 * Three rules keep a hook: where a push may go, nothing personal in a repository, and the check before a push. Everything else a
 * session's hooks once ran is retired. What is left here is the entry for the nine events the family wires:
 *
 *   PreToolUse     the choice popup (AskUserQuestion) is refused in every repository; push-guard.mjs, from this folder, judges the call
 *                  and its refusal is returned (the check before a push is always on); a tool that is not a read is refused when the
 *                  push guard did not run cleanly; then each repository's own hooks run.
 *   SessionStart   no agent_id: at a startup or a resume this folder's own copy of the hub, and any hub checkout beneath or beside the
 *                  launch folder, are brought forward from the remote's main (`bringForward`); the lines are printed, then the one
 *                  line naming the short page, then each repository's own hooks and what they print.
 *   UserPromptSubmit   the one line, then each repository's own hooks and what they print.
 *   every other event  each repository's own hooks.
 *
 * `node hook-dispatch.mjs --install` writes the wiring of the nine events into the user-level settings file. It runs from a stable
 * clone (the setup script puts one at ~/.claude/hub), so a broken edit in a working copy cannot refuse its own fix.
 *
 * It cannot block a session by its own fault: an error thrown anywhere outside the push guard's own refusal is printed to the error
 * output and the event exits 0. It imports only node's own modules.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, realpathSync, statSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HUB = dirname(fileURLToPath(import.meta.url));
const EVENTS = ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'Stop', 'PreModelSwitch', 'PostModelSwitch', 'ConfigChange'];
const READS = new Set(['Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'ToolSearch', 'TaskList', 'TaskGet',
  'ListAgents', 'ReadNotifications', 'EnterPlanMode', 'ExitPlanMode', 'Skill']);
// Repo shims that only call a hub script: run once per event, not once per repo, as this folder's script.
const SHARED_SHIMS = new Set(['plan-guard.sh', 'stop-guard.sh']);
// The hook shims of the app's identifier guard. A stop of a task the session itself launched is not put to it.
const IDENT_SHIMS = new Set(['ident-guard.sh', 'ident-guard.mjs']);
// Events the repositories' own hooks are not asked about.
const NO_REPO_HOOKS = new Set(['ConfigChange', 'PreModelSwitch', 'PostModelSwitch']);

/** The one line every start and every prompt prints. */
export const PAGE_LINE = `HOW WORK GOES HERE: the short page, ${HUB}/plans/native/page.md. The procedures and the roles are files under ${HUB}/plans/native/skills and ${HUB}/plans/native/roles. The push guard and the check before a push hold every push of staging and main, and the choice popup is refused.`;

/**
 * Write the user-level wiring.
 * @returns {string} the settings file written. Existing hooks from other sources are kept; any earlier hook-dispatch entry is
 *   replaced, so running it on every session start never stacks duplicates.
 */
export function install() {
  const file = process.env.HOOK_DISPATCH_SETTINGS_FILE || join(homedir(), '.claude', 'settings.json');
  let s = {};
  try { s = JSON.parse(readFileSync(file, 'utf8')); } catch { /* none yet */ }
  s.hooks ??= {};
  for (const ev of EVENTS) {
    const kept = (s.hooks[ev] ?? []).filter((g) => !JSON.stringify(g).includes('hook-dispatch.mjs'));
    kept.push({ matcher: '', hooks: [{ type: 'command', command: `node "${join(HUB, 'hook-dispatch.mjs')}" ${ev}`, timeout: 120 }] });
    s.hooks[ev] = kept;
  }
  // An approval taken with "clear context" is a DENY of ExitPlanMode; it is off by default, and this keeps it off.
  s.showClearContextOnPlanAccept = false;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(s, null, 2) + '\n');
  return file;
}

/**
 * The repos this session can touch.
 * @param {string} root  the launch directory.
 * @returns {string[]} absolute repo roots under it (itself included when it is one) and, launched inside a repo, beside it; minus a
 *   launch-directory repo whose own settings already run.
 */
export function reposUnder(root) {
  const out = [];
  const scan = (dir) => { try { return readdirSync(dir).map((n) => join(dir, n)); } catch { return []; } };
  const at = resolve(root);
  const cands = [at, ...scan(at)];
  if (existsSync(join(at, '.git'))) cands.push(...scan(dirname(at)));
  for (const d of new Set(cands.map((x) => resolve(x)))) {
    if (!existsSync(join(d, '.git'))) continue;
    if (d === at && existsSync(join(d, '.claude', 'settings.json'))) continue;
    out.push(d);
  }
  return out;
}

/**
 * Does a settings matcher select this event?
 * @returns {boolean} tool events match on tool name, SessionStart on source, every other event always.
 */
function matches(event, m, p) {
  if (!m || m === '*') return true;
  if (event !== 'PreToolUse' && event !== 'PostToolUse' && event !== 'PostToolUseFailure' && event !== 'SessionStart') return true;
  const subject = event === 'SessionStart' ? (p.source ?? '') : (p.tool_name ?? '');
  try { return new RegExp(`^(?:${m})$`).test(subject); } catch { return m === subject; }
}

/**
 * Read one hook run's outcome.
 * @param {object} r  a spawnSync result.
 * @returns {{deny: boolean, reason: string, out: string, status: number|null, err: string}} a refusal is exit 2 or a JSON decision
 *   of deny/block, the two shapes the family's hooks use. `status` is the raw exit code.
 */
function outcome(r) {
  const out = r.stdout ?? '', err = r.stderr ?? '';
  let j = null;
  try { j = JSON.parse(out.trim()); } catch { /* plain text */ }
  const jsonDeny = j?.hookSpecificOutput?.permissionDecision === 'deny' || j?.decision === 'block';
  if (r.status === 2 || jsonDeny) {
    const reason = j?.hookSpecificOutput?.permissionDecisionReason || j?.reason || err.trim() || out.trim() || 'refused';
    return { deny: true, reason, out, status: r.status, err };
  }
  return { deny: false, reason: '', out, status: r.status, err };
}

/**
 * Run one command as a hook.
 * @returns {{deny: boolean, reason: string, out: string, status: number|null}} see `outcome`; `error` is set when it never started.
 */
function run(command, raw, projectDir, timeoutS = 60) {
  const r = spawnSync('bash', ['-c', command], {
    input: raw, cwd: projectDir, encoding: 'utf8', timeout: timeoutS * 1000,
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
  });
  // A hook that exits without reading its stdin breaks the pipe, and spawnSync reports EPIPE although the hook ran and its exit
  // status is there. Only a hook that never produced a status (it could not start, or timed out) is an error.
  if (r.error && r.status === null) return { deny: false, reason: '', out: '', status: null, err: '', error: r.error.message };
  return outcome(r);
}

/**
 * Is the id a main-thread stop names one a launch result of the session printed?
 * @returns {boolean} true only for the main thread's TaskStop whose id (at least six letters, digits, hyphens and underscores) occurs
 *   in a tool result of the transcript; false for every other call and for any transcript that cannot be read.
 */
function idInLaunchResult(p) {
  if (p?.agent_id || p?.tool_name !== 'TaskStop') return false;
  const id = String(p.tool_input?.task_id ?? p.tool_input?.shell_id ?? '').trim();
  if (!/^[A-Za-z0-9_-]{6,}$/.test(id) || !p.transcript_path) return false;
  try {
    const file = String(p.transcript_path);
    if (statSync(file).size > 16 * 1024 * 1024) return false;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      if (!line.includes(id)) continue;
      let e = null;
      try { e = JSON.parse(line); } catch { continue; }
      const c = e?.message?.content;
      if (e?.type !== 'user' || !Array.isArray(c)) continue;
      for (const b of c) {
        if (b?.type !== 'tool_result') continue;
        const t = typeof b.content === 'string' ? b.content : JSON.stringify(b.content ?? '');
        if (t.includes(id)) return true;
      }
    }
  } catch { return false; }
  return false;
}

/**
 * Is a folder a checkout of the hub?
 * @returns {boolean} true when it has a `.git` of its own and holds this dispatcher's file and the doctrine's index at its top.
 */
export function isHubCheckout(dir) {
  try { return existsSync(join(dir, '.git')) && existsSync(join(dir, 'hook-dispatch.mjs')) && existsSync(join(dir, 'DOCTRINE.md')); } catch { return false; }
}

/**
 * Bring this folder's own copy of the hub, and each checkout of the hub among the session's repositories, forward from the remote's main.
 * @param {object} p  the SessionStart payload: `source`, `cwd`.
 * @param {{copy?: string, root?: string, repos?: string[], git?: Function, seconds?: number}} [opts]  the copy, the launch folder the
 *   repositories are found under, those repositories, the git runner `(dir, args) => {ok, out}` and the seconds each git call is given.
 * @returns {string[]} one line for each copy: brought forward, by how many commits and with five of their subjects at most; already
 *   current; or left as it stands and why (another branch than main, uncommitted changes, a fetch that failed). [] for a compaction,
 *   an agent's start, or no copy to look at. Any failure is a line, never a thrown error. The only change made is a fast-forward merge
 *   of `origin/main` into a copy on main with nothing uncommitted.
 */
export function bringForward(p, opts = {}) {
  if (p?.agent_id || !(p?.source === 'startup' || p?.source === 'resume')) return [];
  const seconds = opts.seconds ?? 20;
  const git = opts.git ?? ((dir, args) => {
    const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', timeout: seconds * 1000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
    return { ok: r.status === 0 && !r.error, out: String(r.stdout ?? '').trim(), err: String(r.stderr ?? r.error?.message ?? '').trim() };
  });
  const copies = [];
  const seen = new Set();
  const add = (dir, label) => {
    let key = resolve(dir);
    try { key = realpathSync(dir); } catch { /* the path as written */ }
    if (seen.has(key) || !isHubCheckout(dir)) return;
    seen.add(key);
    copies.push({ dir, label });
  };
  add(opts.copy ?? HUB, 'the gates\' copy');
  let repos = opts.repos;
  if (!repos) { try { repos = reposUnder(resolve(String(opts.root || p?.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd()))); } catch { repos = []; } }
  for (const r of repos) add(r, `the hub checkout ${r}`);
  const lines = [];
  for (const { dir, label } of copies) {
    const reasons = [];
    const branch = git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']);
    if (!branch.ok) reasons.push('its branch cannot be read');
    else if (branch.out !== 'main') reasons.push(`it is on the branch ${branch.out}`);
    const dirty = git(dir, ['status', '--porcelain']);
    if (!dirty.ok) reasons.push('its changes cannot be read');
    else if (dirty.out) reasons.push('it has uncommitted changes');
    const fetched = git(dir, ['fetch', 'origin', 'main']);
    if (!fetched.ok) { lines.push(`HUB COPY (${label}): left as it stands, the fetch failed${reasons.length ? ` and ${reasons.join(' and ')}` : ''}.`); continue; }
    const behind = git(dir, ['rev-list', '--count', 'HEAD..origin/main']);
    const n = behind.ok ? Number(behind.out) : NaN;
    if (!Number.isInteger(n)) { lines.push(`HUB COPY (${label}): left as it stands, how far it is behind cannot be read${reasons.length ? ` and ${reasons.join(' and ')}` : ''}.`); continue; }
    if (reasons.length) { lines.push(`HUB COPY (${label}): left as it stands, ${reasons.join(' and ')}; ${n} commit${n === 1 ? '' : 's'} behind origin main.`); continue; }
    if (n === 0) { lines.push(`HUB COPY (${label}): already current.`); continue; }
    const subjects = git(dir, ['log', '--format=%s', '-5', 'HEAD..origin/main']);
    const merged = git(dir, ['merge', '--ff-only', 'origin/main']);
    if (!merged.ok) { lines.push(`HUB COPY (${label}): left as it stands, it cannot be fast-forwarded; ${n} commit${n === 1 ? '' : 's'} behind origin main.`); continue; }
    const list = subjects.ok && subjects.out ? `: ${subjects.out.split('\n').filter(Boolean).join('; ')}` : '';
    lines.push(`HUB COPY (${label}): brought forward by ${n} commit${n === 1 ? '' : 's'}${list}.`);
  }
  return lines;
}

/**
 * Each repository's own hooks for an event: the walk over the repositories beside and beneath the launch folder (`reposUnder`), each
 * one's `.claude/settings.json`, `matches` and `run`, with the shared shims plan-guard.sh and stop-guard.sh replaced by this folder's
 * plan-guard.mjs and stop-guard.mjs, each run once.
 * @returns {number} 2 when a hook refuses (its reason is written to the error output), else 0; what a hook prints at a start or a
 *   prompt is written to the output.
 */
function repoHooks(event, raw, p) {
  if (NO_REPO_HOOKS.has(event)) return 0;
  const root = resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd());
  const printed = [];
  const ran = new Set();
  for (const repo of reposUnder(root)) {
    let s = {};
    try { s = JSON.parse(readFileSync(join(repo, '.claude', 'settings.json'), 'utf8')); } catch { continue; }
    for (const g of s.hooks?.[event] ?? []) {
      if (!matches(event, g.matcher, p)) continue;
      for (const h of g.hooks ?? []) {
        if (h.type !== 'command' || !h.command) continue;
        const shim = basename(String(h.command).split(/\s+/)[0]);
        if (IDENT_SHIMS.has(shim) && idInLaunchResult(p)) continue;
        let command = h.command;
        if (SHARED_SHIMS.has(shim)) {
          if (ran.has(shim)) continue;
          ran.add(shim);
          command = `node "${join(HUB, shim.replace(/\.sh$/, '.mjs'))}"`;
        }
        const o = run(command, raw, repo, h.timeout ?? 60);
        if (o.deny) { process.stderr.write(o.reason + '\n'); return 2; }
        if (o.out.trim() && (event === 'SessionStart' || event === 'UserPromptSubmit')) printed.push(o.out.trim());
      }
    }
  }
  if (printed.length) process.stdout.write(printed.join('\n\n') + '\n');
  return 0;
}

/**
 * One event.
 * @returns {Promise<number>} the exit code: 2 for a refusal, 0 otherwise.
 */
async function main(event, raw, p) {
  if (!EVENTS.includes(event)) return 0;
  // Every child started below is told the launch folder.
  process.env.HUB_LAUNCH_DIR = process.env.CLAUDE_PROJECT_DIR ?? '';
  if (event === 'PreToolUse') {
    const tool = String(p.tool_name ?? '');
    if (tool === 'AskUserQuestion') {
      process.stderr.write('CHOICE POPUP REFUSED (Doctrine §0): AskUserQuestion is refused in every repository. Ask in plain text, and only a choice that is the owner\'s.\n');
      return 2;
    }
    const o = run(`node "${join(HUB, 'push-guard.mjs')}"`, raw, resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd()));
    if (o.deny) { process.stderr.write(o.reason + '\n'); return 2; }
    if (o.status !== 0 && !READS.has(tool)) {
      process.stderr.write(`push-guard.mjs did not run cleanly (${o.error ?? `exit ${o.status}`}); only reads run until it is fixed.\n`);
      return 2;
    }
    return repoHooks(event, raw, p);
  }
  if (event === 'SessionStart' && !p.agent_id) {
    const root = resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd());
    let lines = [];
    try { lines = bringForward(p, { root }); } catch { /* the start prints without the lines */ }
    for (const l of lines) process.stdout.write(`${l}\n`);
    process.stdout.write(`${PAGE_LINE}\n`);
  }
  if (event === 'UserPromptSubmit') process.stdout.write(`${PAGE_LINE}\n`);
  return repoHooks(event, raw, p);
}

if (process.argv[1] && process.argv[1].endsWith('hook-dispatch.mjs')) {
  const event = process.argv[2];
  if (event === '--install') { console.log(`hook-dispatch: wired ${EVENTS.join(', ')} in ${install()}`); process.exit(0); }
  let raw = '';
  try { raw = readFileSync(0, 'utf8'); } catch { /* no payload */ }
  let p = {};
  try { p = JSON.parse(raw); } catch { /* treated as empty */ }
  if (!p || typeof p !== 'object') p = {};
  main(event, raw, p).then((code) => process.exit(code), (e) => {
    process.stderr.write(`hook-dispatch.mjs: ${e?.message ?? e}\n`);
    process.exit(0);
  });
}
