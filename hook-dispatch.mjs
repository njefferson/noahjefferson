#!/usr/bin/env node
/**
 * THE HUB'S HOOKS ARE ONE SMALL DISPATCHER (plans/native-setup.md, Part D).
 *
 * Three rules keep a hook: where a push may go, nothing personal in a repository, and the check before a push. Everything else a
 * session's hooks once ran is retired. What is left here is the entry for the nine events the family wires:
 *
 *   PreToolUse     the choice popup (AskUserQuestion) is refused in every repository; push-guard.mjs, from this folder, judges the call
 *                  and its refusal is returned (the check before a push is always on); a tool that is not a read is refused when the
 *                  push guard did not run cleanly; then three holds, in this order, each wrapped so that an error inside it passes
 *                  the call and prints one line to the error output, and none of them ever refusing a read (READS):
 *                    1. the typed word: a newest typed message with the whole word stop and no go-word at its end holds every call of
 *                       the main thread and of every agent but a read (and TaskStop on the main thread, an agent's own hand-back);
 *                       a newest typed message with no go-word at its end holds the main thread's new starts (Agent, Task,
 *                       SendMessage, Workflow, and a write of a file that is neither directly under ~/.claude/plans/ nor in the
 *                       session scratchpad). A later message ending with go, ok, continue, approved or yes lifts either, and so does
 *                       an approval of a plan at the button (the result of ExitPlanMode opening "User has approved your plan") that
 *                       comes after the message. A task notification, an agent's hand-back, hook feedback, a restart notice, a
 *                       slash command's entry and a system reminder are harness text and set or lift nothing.
 *                    2. the latch: a main-thread call the dispatcher refused (the popup, the push guard, a repository's own hook)
 *                       writes a latch file for the session; while it stands the main thread passes only reads and TaskStop, and the
 *                       refusal repeats what was first refused. Only a message typed after the latch clears it. A refusal of hold 1
 *                       or 3, or of an agent's call, writes none.
 *                    3. the manager does no work: on the main thread, a write of a file that is neither directly under
 *                       ~/.claude/plans/ nor in the session scratchpad, a git command that changes a repository, and a Bash line that
 *                       writes a file outside the scratchpad by a redirect, sed -i or tee, are refused. An agent is not held by it.
 *                  Then each repository's own hooks run.
 *   Stop           on the main thread, stop-guard.mjs from this folder is run once with the payload on its input and its refusal is
 *                  returned, whether or not a repository's settings carry a shim for it; then each repository's own other hooks.
 *   SessionStart   no agent_id: at a startup or a resume this folder's own copy of the hub, and any hub checkout beneath or beside the
 *                  launch folder, are brought forward from the remote's main (`bringForward`); the lines are printed, then the one
 *                  line naming the short page, then each repository's own hooks and what they print. After the short-page line, at a
 *                  startup or a resume, one more line names the repositories when the launch folder is not itself a repository and two or
 *                  more sit directly beneath it (`moreThanOneRepoLine`); it tells and refuses nothing.
 *   UserPromptSubmit   the one line, then each repository's own hooks and what they print.
 *   every other event  each repository's own hooks.
 *
 * `node hook-dispatch.mjs --install` writes the wiring of the nine events into the user-level settings file. It runs from a stable
 * clone (the setup script puts one at ~/.claude/hub), so a broken edit in a working copy cannot refuse its own fix.
 *
 * It cannot block a session by its own fault: an error thrown anywhere outside the push guard's own refusal is printed to the error
 * output and the event exits 0. It imports only node's own modules.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, realpathSync, statSync, rmSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// The readers of a transcript and of a shell line are loaded here and not imported statically, so a copy of the dispatcher without
// them still runs every other decision (push-guard.mjs does the same); a hold that needs one then errors, and an error passes the call.
let tail = null;
let shell = null;
try { tail = await import('./transcript-tail.mjs'); } catch { tail = null; }
try { shell = await import('./shell-words.mjs'); } catch { shell = null; }

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
 * The one line a start or a resume prints when the session holds more than one repository.
 * @param {object} p  the SessionStart payload: `source`, `agent_id`.
 * @param {string} root  the launch folder.
 * @returns {string} the line (no line break), naming the folders of the repositories beneath the launch folder, when the event has no
 *   agent_id, its source is startup or resume, the launch folder has no `.git` of its own and `reposUnder` finds two or more repositories
 *   directly beneath it; '' in every other case, a launch folder that is itself a repository included. It reads only; it can refuse nothing.
 */
export function moreThanOneRepoLine(p, root) {
  if (p?.agent_id || !(p?.source === 'startup' || p?.source === 'resume')) return '';
  const at = resolve(String(root));
  if (existsSync(join(at, '.git'))) return '';
  const names = reposUnder(at).filter((d) => dirname(d) === at).map((d) => basename(d));
  if (names.length < 2) return '';
  return `MORE THAN ONE REPOSITORY IN THIS SESSION: ${names.join(', ')}. None of them loaded its own roles, settings or instruction file. Sessions are started with one repository, the app alone: ${HUB}/plans/native/running.md`;
}

// ---- the three holds at PreToolUse ----

/** The go-words: a typed message whose LAST word is one of these is a go message. The list is fixed. */
export const GO_WORDS = ['go', 'ok', 'continue', 'approved', 'yes'];
const wordsOf = (t) => String(t ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ');
/** @returns {boolean} true when, case and punctuation set aside, the last word of the text is a go-word. */
export function endsWithGoWord(text) { const w = wordsOf(text); return GO_WORDS.includes(w[w.length - 1]); }
/** @returns {boolean} true when the whole word stop is anywhere in the text ("stopped" and "unstoppable" are not it). */
export function hasStopWord(text) { return wordsOf(text).includes('stop'); }
/** @returns {boolean} a stop message: it has the whole word stop and does not end with a go-word. */
export function isStopMessage(text) { return hasStopWord(text) && !endsWithGoWord(text); }

const WHY_WORD = 'Why: without the hold the work goes on over a message and the message is never answered, and only the one who typed it can say it was answered, which is what the go-word is. ';
const WHY_LATCH = 'Why: another route to the same end puts the session\'s judgement above the control that refused it. ';
const WHY_MANAGER = 'Why: the top tier is paid for judgement, and the cheapest tier that holds the rules does the rest. ';
const STOP_TEXT =`STOP: the newest typed message carries the word stop and does not end with a go-word, so every call is held, the main thread's and every agent's. `
  + 'Only reads pass, and TaskStop on the main thread (an agent may still hand back what it has). '
  + `A later typed message whose last word is one of ${GO_WORDS.join(', ')} lifts it, and so does an approval of a plan at the button given after it. `
  + WHY_WORD
  + 'Say in plain text what was running and that it is stopped, and end the turn.';
const CORRECTION_TEXT = `NEW STARTS HELD: the newest typed message does not end with a go-word, so the main thread starts nothing new: no Agent, Task, SendMessage or Workflow, and no write of a file other than a plan file directly under ~/.claude/plans/ or a file in the session scratchpad. `
  + 'Reads, Bash, plan mode and its exit pass, and agents already running go on. '
  + `A later typed message whose last word is one of ${GO_WORDS.join(', ')} lifts it, and so does an approval of a plan at the button given after it. `
  + WHY_WORD
  + 'Answer the message in plain text first.';
const MANAGER_TEXT = (what) => `MANAGER DOES NO WORK: ${what} is refused on the main thread. The main thread manages and a worker does the step: send a worker with the approved page's path and the step number. `
  + 'Reads, Bash that changes no repository and no file outside the scratchpad, a plan file directly under ~/.claude/plans/ and the session scratchpad pass. '
  + WHY_MANAGER.trimEnd();
const NEW_STARTS = new Set(['Agent', 'Task', 'SendMessage', 'Workflow']);
const FILE_WRITES = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);
const AGENT_RETURN = /^(?:SubagentHandback|StructuredOutput)$/;

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const safeId = (p) => String(p?.session_id || 'no-session').replace(/[^A-Za-z0-9_-]/g, '_');
const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/**
 * Is a path inside this session's scratchpad? (lifted from the old dispatcher)
 * @returns {boolean} true only for a path strictly below `<tmp>/claude-<uid>/<project>/<sid>/scratchpad/`.
 */
export function inScratchpad(path, sid) {
  if (!sid || !path) return false;
  const t = resolve(String(path));
  const bases = [...new Set(['/tmp', tmpdir()])].map(esc).join('|');
  return new RegExp(`^(?:${bases})/claude-\\d+/[^/]+/${esc(sid)}/scratchpad/.`).test(t);
}

/** A path as a call writes it: `~` opened, a relative path taken from the call's folder. */
function absPath(p, path) {
  const s = String(path);
  const home = s === '~' || s.startsWith('~/') ? join(homedir(), s.slice(1)) : s;
  return resolve(String(p.cwd || process.cwd()), home);
}
/** Is the file one the main thread may write: directly under ~/.claude/plans/ or in the session scratchpad? */
function mayWrite(p, path) {
  const a = absPath(p, path);
  return dirname(a) === join(homedir(), '.claude', 'plans') || inScratchpad(a, p.session_id);
}

/**
 * The main session's transcript for a call. An agent's payload may carry its own transcript, beneath `<session>/subagents/`; the
 * session's is then the file of that name beside the folder, or else the session's file found under ~/.claude/projects.
 */
export function mainTranscript(p) {
  const t = String(p.transcript_path ?? '');
  const m = t.match(/^(.*?)\/subagents\//);
  if (m) return `${m[1]}.jsonl`;
  if (t) return t;
  const sid = String(p.session_id ?? '');
  if (/^[\w-]+$/.test(sid)) {
    const projects = join(homedir(), '.claude', 'projects');
    try { for (const d of readdirSync(projects)) if (existsSync(join(projects, d, `${sid}.jsonl`))) return join(projects, d, `${sid}.jsonl`); } catch { /* none */ }
  }
  return '';
}

const APPROVED = /^\s*User has approved your plan/;
/**
 * Where, in the entries, the plan was approved at the button.
 * @returns {number[]} the index of each user entry carrying the result of an ExitPlanMode call (found by the call's id, or by the entry's
 *   own `toolUseResult.plan` when the call is not in the entries) whose text opens "User has approved your plan". An agent's entry, an
 *   error result and the same words in the result of any other tool are no approval.
 */
export function approvalIndexes(entries) {
  const out = [];
  const names = new Map();
  entries.forEach((e, i) => {
    const c = e?.message?.content;
    if (!Array.isArray(c)) return;
    if (e.type === 'assistant') for (const b of c) if (b?.type === 'tool_use') names.set(b.id, b.name);
    if (e.type !== 'user' || e.isSidechain || e.agentId) return;
    for (const b of c) {
      if (b?.type !== 'tool_result' || b.is_error) continue;
      const text = typeof b.content === 'string' ? b.content : Array.isArray(b.content) ? b.content.map((x) => x?.text ?? '').join('\n') : '';
      if (!APPROVED.test(text)) continue;
      const name = names.get(b.tool_use_id);
      if (name === 'ExitPlanMode' || (name === undefined && e.toolUseResult && typeof e.toolUseResult === 'object' && 'plan' in e.toolUseResult)) out.push(i);
    }
  });
  return out;
}

/**
 * What the typed messages hold, read from transcript entries.
 * @returns {{stop: boolean, correction: boolean, settled: boolean}} `stop`: the newest stop message has no later go message and no
 *   approval after it. `correction`: the newest typed message does not end with a go-word, is not a stop and has no approval after it.
 *   `settled`: the entries hold a stop or a go message, so a wider tail could not change `stop`. A message is judged by
 *   `isOwnerMessage` of transcript-tail.mjs, which sets harness text aside.
 */
export function holdsIn(entries) {
  const idx = [];
  entries.forEach((e, i) => { if (tail.isOwnerMessage(e)) idx.push(i); });
  if (!idx.length) return { stop: false, correction: false, settled: false };
  const approvals = approvalIndexes(entries);
  const text = (i) => tail.textOf(entries[i]);
  const lifted = (i) => idx.some((j) => j > i && endsWithGoWord(text(j))) || approvals.some((a) => a > i);
  let stopAt = -1;
  for (let k = idx.length - 1; k >= 0; k--) if (isStopMessage(text(idx[k]))) { stopAt = idx[k]; break; }
  const last = idx[idx.length - 1];
  const correction = !endsWithGoWord(text(last)) && !isStopMessage(text(last)) && !approvals.some((a) => a > last);
  return { stop: stopAt >= 0 && !lifted(stopAt), correction, settled: stopAt >= 0 || idx.some((i) => endsWithGoWord(text(i))) };
}

/** The holds standing for a call, read from the session's transcript through a tail that widens (2, 8, then 32 MB) until it is settled. */
export function ownerHolds(p) {
  const file = mainTranscript(p);
  let h = { stop: false, correction: false, settled: false };
  for (const mb of [2, 8, 32]) {
    h = holdsIn(tail.tailEntries(file, mb * 1024 * 1024));
    if (h.settled) break;
  }
  return h;
}

/** HOLD 1. @returns {string|null} the refusal, or null. */
function holdWord(p) {
  const tool = String(p.tool_name ?? '');
  if (READS.has(tool)) return null;
  const h = ownerHolds(p);
  if (h.stop) {
    if (!p.agent_id && tool === 'TaskStop') return null;
    if (p.agent_id && AGENT_RETURN.test(tool)) return null;
    return STOP_TEXT;
  }
  if (p.agent_id || !h.correction) return null;
  if (NEW_STARTS.has(tool)) return CORRECTION_TEXT;
  if (FILE_WRITES.has(tool) && !mayWrite(p, p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? '')) return CORRECTION_TEXT;
  return null;
}

// The main thread's latch is the session's file; an agent's refusal writes none.
const latchFile = (p) => join(process.env.REFUSAL_LATCH_DIR || join(homedir(), '.claude', 'refusal-latch'), `${safeId(p)}.json`);

/**
 * The time a typed message was typed (lifted from the old dispatcher): the time of the latest queue enqueue before it carrying its words,
 * else its own time, so a message typed before a refusal and delivered after it clears nothing.
 */
export function typedAt(entries, i) {
  const t = norm(tail.textOf(entries[i]));
  for (let j = i - 1; t && j >= 0; j--) {
    const e = entries[j];
    if (e?.type !== 'queue-operation' || e.operation !== 'enqueue' || typeof e.content !== 'string') continue;
    const k = norm(e.content);
    if (k && (t.includes(k) || (k.includes(t) && t.length > 40))) return Date.parse(e.timestamp ?? '');
  }
  return Date.parse(entries[i]?.timestamp ?? '');
}

/** The latch standing for the main thread, or null. A typed message whose typed time is after the latch's removes it. */
export function latchStanding(p) {
  let l;
  try { l = JSON.parse(readFileSync(latchFile(p), 'utf8')); } catch { return null; }
  const at = Number(l?.at) || 0;
  const list = tail.tailEntries(mainTranscript(p), 16 * 1024 * 1024);
  if (list.some((e, i) => tail.isOwnerMessage(e) && typedAt(list, i) > at)) { rmSync(latchFile(p), { force: true }); return null; }
  return { at, tool: String(l.tool ?? ''), reason: String(l.reason ?? '') };
}

/** Record the latch after a refusal of a main-thread call; one that stands is never moved. An agent's call writes none. */
export function setLatch(p, reason) {
  if (p.agent_id || latchStanding(p)) return false;
  mkdirSync(dirname(latchFile(p)), { recursive: true });
  writeFileSync(latchFile(p), JSON.stringify({ at: Date.now(), tool: p.tool_name ?? '', reason: String(reason).slice(0, 1200) }, null, 1));
  return true;
}

/** Set the latch for a refusal, and never let a failure to write it change the refusal. */
function latchAfter(p, reason) {
  try { setLatch(p, reason); } catch (e) { process.stderr.write(`hook-dispatch.mjs: the latch was not written: ${e?.message ?? e}\n`); }
}

/** HOLD 2. @returns {string|null} the refusal, or null. */
function holdLatch(p) {
  const tool = String(p.tool_name ?? '');
  if (p.agent_id || READS.has(tool) || tool === 'TaskStop') return null;
  const l = latchStanding(p);
  if (!l) return null;
  return `REFUSAL LATCH: an earlier call of the main thread (${l.tool || 'a call'}) was refused, and that route stays closed until the next typed message. `
    + `Until then only reads and TaskStop pass. What was first refused: ${l.reason}\n`
    + WHY_LATCH
    + 'Say in plain text what was refused and end the turn. Another command, tool or wording for the same end is a second route, not a fresh start.';
}

/** Program words after a git command's own options: the subcommand and what follows it. */
function gitCall(words) {
  const at = shell.commandWordIndex(words);
  if (at < 0 || basename(String(words[at])) !== 'git') return null;
  let i = at + 1;
  while (i < words.length && String(words[i]).startsWith('-')) i += /^(?:-C|-c|--git-dir|--work-tree|--namespace|--exec-path)$/.test(words[i]) ? 2 : 1;
  return words[i] === undefined ? null : { sub: String(words[i]), rest: words.slice(i + 1).map(String) };
}
const GIT_CHANGES = new Set(['add', 'commit', 'push', 'rebase', 'merge', 'cherry-pick', 'revert', 'reset', 'restore', 'checkout', 'switch', 'stash', 'rm', 'mv', 'apply', 'am', 'tag', 'branch']);
/** Does `git <sub> <rest>` change a repository? Every subcommand of GIT_CHANGES does, but a listing (stash list or show, branch or tag with a listing flag or nothing). */
function gitChanges({ sub, rest }) {
  if (!GIT_CHANGES.has(sub)) return false;
  const flags = rest.filter((w) => w.startsWith('-'));
  const plain = rest.filter((w) => !w.startsWith('-'));
  if (sub === 'stash') return !['list', 'show'].includes(rest[0]);
  if (sub === 'branch') {
    if (flags.some((f) => /^--(?:delete|move|copy|force|set-upstream-to|unset-upstream|edit-description)/.test(f) || /^-[A-Za-z]*[dDmMcCfu]/.test(f))) return true;
    if (flags.some((f) => /^--(?:list|contains|no-contains|merged|no-merged|points-at|show-current)/.test(f) || /^-[A-Za-z]*l/.test(f))) return false;
    return plain.length > 0;
  }
  if (sub === 'tag') {
    if (flags.some((f) => /^--(?:list|contains|no-contains|merged|no-merged|points-at|verify)/.test(f) || /^-[A-Za-z]*[lnv]/.test(f))) return false;
    return plain.length > 0 || flags.length > 0;
  }
  return true;
}

const NOT_FILES = /^(?:\/dev\/(?:null|stdout|stderr|tty|fd\/\d+)|&\d*-?)$/;
/** Is a written target outside the scratchpad? A target the line has not resolved (`$`, a backtick, a process substitution) is not judged. */
function outsideScratch(p, target) {
  const t = String(target);
  if (!t || NOT_FILES.test(t) || /[$`(]/.test(t)) return false;
  return !inScratchpad(absPath(p, t), p.session_id);
}
/** @returns {string[]} the files a simple command's redirects write: `>`, `>>`, `>|`, `&>`, `&>>` and `N>` forms, a file descriptor excluded. */
function redirectTargets(words) {
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const m = String(words[i]).match(/^(?:\d*|&)>(?:>|\|)?(.*)$/);
    if (!m) continue;
    out.push(m[1] === '' ? String(words[i + 1] ?? '') : m[1]);
  }
  return out;
}
/** @returns {string[]} the file arguments of `sed -i` and `tee` in a simple command; [] for any other command. */
function writtenFiles(words) {
  const at = shell.commandWordIndex(words);
  if (at < 0) return [];
  const prog = basename(String(words[at]));
  const args = words.slice(at + 1).map(String);
  if (prog === 'tee') return args.filter((w) => !w.startsWith('-'));
  if (prog === 'sed' && args.some((w) => /^--in-place/.test(w) || /^-[A-Za-z]*i/.test(w))) {
    const takesScript = (w) => /^(?:--expression|--file)$/.test(w) || /^-[A-Za-z]*[ef]$/.test(w);
    let needScript = !args.some(takesScript);
    const files = [];
    for (let k = 0; k < args.length; k++) {
      if (takesScript(args[k])) { k++; continue; }
      if (args[k].startsWith('-')) continue;
      if (needScript) { needScript = false; continue; }
      files.push(args[k]);
    }
    return files;
  }
  return [];
}

/** HOLD 3. @returns {string|null} the refusal, or null. */
function holdManager(p) {
  const tool = String(p.tool_name ?? '');
  if (p.agent_id || READS.has(tool)) return null;
  if (FILE_WRITES.has(tool)) {
    return mayWrite(p, p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? '') ? null : MANAGER_TEXT('a write of a file that is not a plan file and not in the session scratchpad');
  }
  if (tool !== 'Bash') return null;
  const { shell: line } = shell.heredocs(String(p.tool_input?.command ?? ''));
  for (const seg of shell.commandsIn(line)) {
    if (seg.any === 'code') continue;
    const g = gitCall(seg.words);
    if (g && gitChanges(g)) return MANAGER_TEXT(`git ${g.sub}, which changes a repository,`);
    if (redirectTargets(seg.words).some((t) => outsideScratch(p, t))) return MANAGER_TEXT('a redirect that writes a file outside the session scratchpad');
    if (writtenFiles(seg.words).some((t) => outsideScratch(p, t))) return MANAGER_TEXT('a command that writes a file outside the session scratchpad');
  }
  return null;
}

/**
 * Run the three holds on a call.
 * @returns {string|null} the first refusal. A hold that throws is set aside, one line goes to the error output and the call passes it.
 */
function holds(p) {
  for (const [key, name, hold] of [['word', 'the typed word hold', holdWord], ['latch', 'the latch hold', holdLatch], ['manager', 'the manager hold', holdManager]]) {
    try {
      if (process.env.HOOK_DISPATCH_THROW === key) throw new Error('planted fault');
      const why = hold(p);
      if (why) return why;
    } catch (e) {
      process.stderr.write(`hook-dispatch.mjs: ${name} failed and let the call pass: ${e?.message ?? e}\n`);
    }
  }
  return null;
}

/**
 * Each repository's own hooks for an event: the walk over the repositories beside and beneath the launch folder (`reposUnder`), each
 * one's `.claude/settings.json`, `matches` and `run`, with the shared shims plan-guard.sh and stop-guard.sh replaced by this folder's
 * plan-guard.mjs and stop-guard.mjs, each run once.
 * @returns {number} 2 when a hook refuses (its reason is written to the error output), else 0; what a hook prints at a start or a
 *   prompt is written to the output.
 */
function repoHooks(event, raw, p, ran = new Set(), onRefuse = null) {
  if (NO_REPO_HOOKS.has(event)) return 0;
  const root = resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd());
  const printed = [];
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
        if (o.deny) { process.stderr.write(o.reason + '\n'); if (onRefuse) onRefuse(o.reason); return 2; }
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
      const why = 'CHOICE POPUP REFUSED (Doctrine §0): AskUserQuestion is refused in every repository. Ask in plain text, and only a choice that is the owner\'s.';
      process.stderr.write(why + '\n');
      latchAfter(p, why);
      return 2;
    }
    const o = run(`node "${join(HUB, 'push-guard.mjs')}"`, raw, resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd()));
    if (o.deny) { process.stderr.write(o.reason + '\n'); latchAfter(p, o.reason); return 2; }
    if (o.status !== 0 && !READS.has(tool)) {
      process.stderr.write(`push-guard.mjs did not run cleanly (${o.error ?? `exit ${o.status}`}); only reads run until it is fixed.\n`);
      return 2;
    }
    const held = holds(p);
    if (held) { process.stderr.write(held + '\n'); return 2; }
    return repoHooks(event, raw, p, new Set(), (why) => latchAfter(p, why));
  }
  if (event === 'Stop' && !p.agent_id) {
    // The stop guard runs once, from this folder, whether or not a repository carries a shim for it; the shim is then marked as run.
    const s = run(`node "${join(HUB, 'stop-guard.mjs')}"`, raw, resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd()));
    if (s.deny) { process.stderr.write(s.reason + '\n'); return 2; }
    if (s.status !== 0) process.stderr.write(`hook-dispatch.mjs: stop-guard.mjs did not run cleanly (${s.error ?? `exit ${s.status}`}); the stop goes on.\n`);
    return repoHooks(event, raw, p, new Set(['stop-guard.sh']));
  }
  if (event === 'SessionStart' && !p.agent_id) {
    const root = resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd());
    let lines = [];
    try { lines = bringForward(p, { root }); } catch { /* the start prints without the lines */ }
    for (const l of lines) process.stdout.write(`${l}\n`);
    process.stdout.write(`${PAGE_LINE}\n`);
    try { const more = moreThanOneRepoLine(p, root); if (more) process.stdout.write(`${more}\n`); } catch { /* the start prints without the line */ }
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
