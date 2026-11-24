#!/usr/bin/env node
/**
 * THE HUB'S HOOKS ARE ONE SMALL DISPATCHER (plans/native-setup.md, Part D).
 *
 * Three rules keep a hook: where a push may go, nothing personal in a repository, and the check before a push. Everything else a
 * session's hooks once ran is retired. What is left here is the entry for the nine events the family wires:
 *
 *   PreToolUse     the choice popup (AskUserQuestion) is refused in every repository; push-guard.mjs, from this folder, judges the call
 *                  and its refusal is returned (the check before a push is always on); a tool that is not a read is refused when the
 *                  push guard did not run cleanly; then five holds, in this order, each wrapped so that an error inside it passes
 *                  the call and prints one line to the error output, and none of them ever refusing a read (READS):
 *                    0. the read at a start (holdRead): after a start, a clear or a compaction the main thread may only read until the
 *                       short page, doctrine/never.md and doctrine/hub.md have each been read whole, in the hub's copy or in a checkout of
 *                       the hub; after a compaction the file of the typed messages (`fileTypedMessages`, written whole at a start only where it is not
 *                       there and otherwise added to, and kept current by `keepTypedMessages`) is due as well, where it is there, as far as the lines it held at the compaction (`recallDueLines`; due whole where
 *                       no count is recorded), and a resume makes nothing due;
 *                       an agent is not held by it (HOOK_DISPATCH_READ_HOLD=off is its test seam).
 *                    1. the typed word: a newest typed message that is the word stop by itself, or has it as a whole sentence, and has no
 *                       go-word at its end (a sentence ends at a full stop, an exclamation mark, a question mark or a line's end, and
 *                       the word beside another word in its sentence is no stop) holds every call of
 *                       the main thread and of every agent but a read (and TaskStop on the main thread, an agent's own hand-back);
 *                       a newest typed message with no go-word at its end holds the main thread's new starts (Agent, Task,
 *                       SendMessage, Workflow, and a write of a file that is neither directly under ~/.claude/plans/ nor in the
 *                       session scratchpad). A later message ending with go, ok, continue, approved or yes lifts either, and so does
 *                       an approval of a plan at the button (the result of ExitPlanMode opening "User has approved your plan") that
 *                       comes after the message. A task notification, an agent's hand-back, hook feedback, a restart notice, a
 *                       slash command's entry and a system reminder are harness text and set or lift nothing. A typed message still
 *                       waiting in the queue (waitingMessages) holds as a delivered one does, its refusal says a message is waiting and
 *                       prints it, and it lifts nothing.
 *                    2. the latch: a main-thread call the dispatcher refused (the popup, the push guard, a repository's own hook)
 *                       writes a latch file for the session; while it stands the main thread passes only reads and TaskStop, and the
 *                       refusal repeats what was first refused. Only a message typed after the latch clears it. A refusal of hold 1
 *                       or 3, or of an agent's call, writes none.
 *                    3. the manager does no work: on the main thread, a write of a file that is neither directly under
 *                       ~/.claude/plans/ nor in the session scratchpad, a git command that changes a repository, and a Bash line that
 *                       writes a file outside the scratchpad by a redirect, sed -i or tee, are refused. An agent is not held by it.
 *                    4. the approved page (holdPlan): on the main thread, a write of a file under ~/.claude/plans/ passes only in plan
 *                       mode; where the call does not say its mode it passes, as before.
 *                  Then each repository's own hooks run.
 *   Stop           on the main thread, stop-guard.mjs from this folder is run once with the payload on its input and its refusal is
 *                  returned, whether or not a repository's settings carry a shim for it; then each repository's own other hooks.
 *   SessionStart   no agent_id: at a startup or a resume this folder's own copy of the hub, and any hub checkout beneath or beside the
 *                  launch folder, are brought forward from the remote's main (`bringForward`); the lines are printed, then the one
 *                  line naming the short page, then each repository's own hooks and what they print. After the short-page line, at a
 *                  startup or a resume, one more line names the repositories when the launch folder is not itself a repository and two or
 *                  more sit directly beneath it (`moreThanOneRepoLine`); it tells and refuses nothing. Then the typed messages of the session
 *                  are filed in the session scratchpad (`fileTypedMessages`): the file is written whole only where it is not there, and otherwise each
 *                  typed message it does not hold is added to its end, so a record that was cut takes nothing out of it; a compaction's print names
 *                  the file and the count of messages the file holds, and a file that cannot be written is one line that says so.
 *   UserPromptSubmit   the one line, then (main thread) the typed message the prompt carries is added to the end of the file of the typed messages
 *                  (`keepTypedMessages`; before a send of an agent or a workflow passes it adds the typed messages the tail holds as well), then
 *                  each repository's own hooks and what they print.
 *   every other event  each repository's own hooks.
 *
 * `node hook-dispatch.mjs --install` writes the wiring of the nine events into the user-level settings file. It runs from a stable
 * clone (the setup script puts one at ~/.claude/hub), so a broken edit in a working copy cannot refuse its own fix.
 *
 * It cannot block a session by its own fault: an error thrown anywhere outside the push guard's own refusal is printed to the error
 * output and the event exits 0. It imports only node's own modules.
 */
import { existsSync, readFileSync, writeFileSync, appendFileSync, readdirSync, mkdirSync, realpathSync, statSync, rmSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// The readers of a transcript and of a shell line are loaded here and not imported statically, so a copy of the dispatcher without
// them still runs every other decision (push-guard.mjs does the same); a hold that needs one then errors, and an error passes the call.
let tail = null;
let shell = null;
try { tail = await import('./transcript-tail.mjs'); } catch { tail = null; }
try { shell = await import('./shell-words.mjs'); } catch { shell = null; }
// The push guard's reading of a checker's answer serves the walk of a page as well: one reading, held by the push guard's own cases.
let pushGuard = null;
try { pushGuard = await import('./push-guard.mjs'); } catch { pushGuard = null; }

const HUB = dirname(fileURLToPath(import.meta.url));
const EVENTS = ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'Stop', 'PreModelSwitch', 'PostModelSwitch', 'ConfigChange'];
// The model command that puts the main thread a tier lower for a run.
const RUN_TIER_LINE = '/model claude-opus-5-5';
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
// The word stop holds only by itself: a sentence is the word and nothing else. A sentence ends at a full stop, an exclamation mark, a question mark or the end of a line;
// within it only its words are read, so a comma, a quotation mark or a dash counts for nothing. The word beside another word in its sentence (a negative before it, the
// words hook or guard after it, "stopped") is no stop, and the message is read as any other.
/** @returns {boolean} true when a sentence of the text is the word stop and nothing else, in any case, said once or several times. */
export function hasStopWord(text) {
  return String(text ?? '').split(/[.!?\n\r]+/).some((s) => {
    const w = s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
    return w.length > 0 && w.every((x) => x === 'stop');
  });
}
/** @returns {boolean} a stop message: the word stop by itself or as a whole sentence, and no go-word at the end. */
export function isStopMessage(text) { return hasStopWord(text) && !endsWithGoWord(text); }

const WHY_WORD = 'Why: without the hold the work goes on over a message and the message is never answered, and only the one who typed it can say it was answered, which is what the go-word is. ';
const WHY_LATCH = 'Why: another route to the same end puts the session\'s judgement above the control that refused it. ';
const WHY_MANAGER = 'Why: the top tier is paid for judgement, and the cheapest tier that holds the rules does the rest. ';
const STOP_TEXT =`STOP: the newest typed message is the word stop by itself, or has it as a whole sentence, and does not end with a go-word, so every call is held, the main thread's and every agent's. `
  + 'Only reads pass, TaskStop on the main thread, and a write of a plan file directly under ~/.claude/plans/ made in plan mode (an agent may still hand back what it has, and write its own report or progress note, a file directly in progress/ of the session scratchpad). The session\'s own entry to plan mode and the button are refused. '
  + `A later typed message whose last word is one of ${GO_WORDS.join(', ')} lifts it, and so does an approval of a plan at the button given after it. `
  + WHY_WORD
  + 'Say in plain text what was running and that it is stopped, and end the turn.';
const CORRECTION_TEXT = `NEW STARTS HELD: the newest typed message does not end with a go-word, so the main thread starts nothing new: no Agent, Task, SendMessage or Workflow, and no write of a file other than a plan file directly under ~/.claude/plans/ or a file in the session scratchpad. `
  + 'Reads, Bash, plan mode set in the app and the button pass, and agents already running go on; the session\'s own entry to plan mode is refused. '
  + `A later typed message whose last word is one of ${GO_WORDS.join(', ')} lifts it, and so does an approval of a plan at the button given after it. `
  + WHY_WORD
  + 'Answer the message in plain text first.';
const MANAGER_TEXT = (what) => `MANAGER DOES NO WORK: ${what} is refused on the main thread. The main thread manages and a worker does the step: send a worker with the approved page's path and the step number. `
  + 'Reads, Bash that changes no repository and no file outside the scratchpad, a plan file directly under ~/.claude/plans/ and the session scratchpad pass. '
  + WHY_MANAGER.trimEnd();
const WHY_WAITING = 'Why: a message that waits in the queue while a turn runs is not seen by the session, so without the hold the work goes on over it and it is never answered. ';
const WHY_READ = 'Why: every other rule rests on the standing pages, because a session that has not read the rules cannot follow them. ';
const WHY_PLAN = 'Why: an approved page is changed only by a change that is written and approved, and the button follows only in plan mode, so a write outside it puts work under a page nobody approved. ';
/** The refusal of a message still waiting; it prints each waiting message word for word, so that it can be answered. */
const WAITING_TEXT = (stop, texts) => `MESSAGE WAITING: ${texts.length === 1 ? 'a typed message is' : `${texts.length} typed messages are`} in the queue and not yet delivered to the session, and the session cannot see ${texts.length === 1 ? 'it' : 'them'} until the turn ends. `
  + (stop
    ? 'One is the word stop by itself, or has it as a whole sentence, and does not end with a go-word, so every call is held, the main thread\'s and every agent\'s. Only reads pass, TaskStop on the main thread, and a write of a plan file directly under ~/.claude/plans/ made in plan mode (an agent may still hand back what it has). The session\'s own entry to plan mode and the button are refused. '
    : 'The newest does not end with a go-word, so the main thread starts nothing new: no Agent, Task, SendMessage or Workflow, and no write of a file other than a plan file directly under ~/.claude/plans/ or a file in the session scratchpad. Reads, Bash, plan mode set in the app and the button pass, and agents already running go on; the session\'s own entry to plan mode is refused. ')
  + `A later typed message whose last word is one of ${GO_WORDS.join(', ')} lifts it, and so does an approval of a plan at the button given after it. `
  + WHY_WAITING
  + 'Answer it now in plain text, point by point, and end the turn; ending the turn is what delivers it. '
  + `The waiting message${texts.length === 1 ? '' : 's'}, word for word:\n${texts.map((t, i) => `--- message ${i + 1} of ${texts.length} ---\n${t}`).join('\n')}\n--- end ---`;
const NO_PAGE_TEXT = 'NO PAGE WAS ASKED FOR: the newest typed message does not end with a go-word, and the session\'s own entry to plan mode is refused under it. '
  + 'A page is drawn after a message that ends with a go-word, or when plan mode is set in the app, which is not held. '
  + 'Why: plan mode set in the app is itself the ask for a page, and a page nobody asked for costs a turn of the top tier. '
  + 'Answer the message in plain text.';
const PLAN_TEXT = 'PLAN FILE WRITE OUTSIDE PLAN MODE: a write of a file under ~/.claude/plans/ is refused on the main thread unless the call is made in plan mode, where the button follows. '
  + 'Reads, an agent\'s calls, and every write of a file outside the plans folder are not held by it. '
  + 'Entering plan mode lifts it for the writes made there, and the change is written in full and approved at the button before any work goes on under it. '
  + WHY_PLAN
  + 'Say in plain text what change the page needs, and make it in plan mode.';
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

/** Is the path a file directly in `progress/` of this session's scratchpad? (an agent's own report and progress note) */
function isProgressFile(a, sid) {
  const d = dirname(a);
  return basename(d) === 'progress' && inScratchpad(a, sid) && inScratchpad(d, sid) && !inScratchpad(dirname(d), sid);
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
// The harness saves a result past a size to a file and records an envelope: `<persisted-output>`, a line that says where the result was
// saved, a line that opens the preview, and then the result's first part.
const APPROVED_SAVED = /^\s*<persisted-output>[^\n]*\n[^\n]*\n(?:\s*\n)?(?:Preview[^\n]*\n)?\s*User has approved your plan/;
const REJECTED = /^\s*(?:<persisted-output>[^\n]*\n[^\n]*\n(?:\s*\n)?(?:Preview[^\n]*\n)?\s*)?(?:The user doesn't want to proceed|User rejected|The user rejected)/;
/**
 * Where, in the entries, the plan was approved at the button.
 * @returns {number[]} the index of each user entry carrying the result of an ExitPlanMode call (found by the call's id, or by the entry's
 *   own `toolUseResult.plan` when the call is not in the entries) whose text opens "User has approved your plan", or, where the harness
 *   saved the result to a file, whose text carries those words after the envelope's opening, or whose own `toolUseResult` holds a plan
 *   and answers an ExitPlanMode call that was not rejected. An agent's entry, an error result, a rejected exit and the same words in
 *   the result of any other tool are no approval.
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
      const name = names.get(b.tool_use_id);
      const hasPlan = !!(e.toolUseResult && typeof e.toolUseResult === 'object' && 'plan' in e.toolUseResult);
      if (name === 'ExitPlanMode' && hasPlan && !REJECTED.test(text) && /^\s*<persisted-output>/.test(text)) { out.push(i); continue; }
      if (!(APPROVED.test(text) || APPROVED_SAVED.test(text))) continue;
      if (name === 'ExitPlanMode' || (name === undefined && hasPlan)) out.push(i);
    }
  });
  return out;
}

const normText = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
/**
 * The typed messages still waiting in the harness's queue (lifted from the retired pending guard's count of the queue).
 * The transcript records a typed message the moment it is sent, as a queue-operation entry with the operation enqueue and the words as
 * `content`; it reaches the session later, as a turn's prompt or as a queued_command attachment, and the queue logs a dequeue (no
 * content) or a remove (with the content) when it lets go. A message counts as delivered when a later user entry or attachment carries
 * its words, or a remove carries them; when every enqueue has been dequeued or removed nothing waits, whatever the words found. The
 * harness's own enqueues (a task notification, an agent's hand-back, and the other tags of HARNESS_TAG) are no typed message and are
 * set aside, so a worker's hand-back never holds anything. A message is let go once a message typed after it has arrived.
 * @returns {{i: number, text: string, at: number}[]} each waiting typed message, oldest first: the index of its enqueue entry, its
 *   words exactly as enqueued, and the time it was typed in ms.
 */
export function waitingMessages(entries) {
  const items = [];
  const given = [];
  let size = 0;
  const deliver = (t, arrivedAt, byOwner) => {
    let hit = false;
    for (const x of items) {
      if (!x.done && x.key && (t.includes(x.key) || (x.key.includes(t) && t.length > 40))) {
        x.done = true; hit = true;
        if (x.owner && x.at) given.push(x.at);
      }
    }
    if (!hit && byOwner && Number.isFinite(arrivedAt) && arrivedAt > 0) given.push(arrivedAt);
  };
  entries.forEach((e, i) => {
    const at = Date.parse(e?.timestamp ?? '');
    if (e?.type === 'queue-operation') {
      const c = typeof e.content === 'string' ? e.content : null;
      if (e.operation === 'enqueue') {
        items.push({ i, text: c, key: normText(c), at: Number.isFinite(at) ? at : 0, owner: !!(c && c.trim() && !tail.HARNESS_TAG.test(c)), done: false });
        size++;
      } else if (e.operation === 'dequeue') {
        size = Math.max(0, size - 1);
      } else if (e.operation === 'remove') {
        size = Math.max(0, size - 1);
        if (c) { const it = items.find((x) => !x.done && x.key === normText(c)); if (it) it.done = true; }
      } else if (/^(?:popAll|clear)$/.test(String(e.operation ?? ''))) {
        size = 0;
      }
      return;
    }
    const delivered = (e?.type === 'user' && !e.isMeta && !e.isCompactSummary) || (e?.type === 'attachment' && e.attachment?.type === 'queued_command');
    if (!delivered) return;
    const t = normText(tail.textOf(e));
    if (t) deliver(t, at, tail.isOwnerMessage(e) && !tail.HARNESS_TAG.test(tail.textOf(e)));
  });
  if (size <= 0) return [];
  return items.filter((x) => !x.done && x.key).slice(-size).filter((x) => x.owner && !given.some((g) => g > x.at)).map((x) => ({ i: x.i, text: x.text, at: x.at }));
}

/**
 * What the typed messages hold, read from transcript entries.
 * @returns {{stop: boolean, correction: boolean, settled: boolean, waiting: string[]}} `stop`: the newest stop message has no later go
 *   message and no approval after it. `correction`: the newest typed message does not end with a go-word, is not a stop and has no
 *   approval after it. `settled`: the entries hold a stop or a go message, so a wider tail could not change `stop`. A message is judged
 *   by `isOwnerMessage` of transcript-tail.mjs, which sets harness text aside. A message still waiting in the queue
 *   (`waitingMessages`) holds as a delivered one does, by the same words, but lifts nothing, because the session has not seen it;
 *   `waiting` is the words of each waiting message, oldest first.
 */
export function holdsIn(entries) {
  const idx = [];
  entries.forEach((e, i) => { if (tail.isOwnerMessage(e)) idx.push(i); });
  const wait = waitingMessages(entries);
  if (!idx.length && !wait.length) return { stop: false, correction: false, settled: false, waiting: [] };
  const approvals = approvalIndexes(entries);
  const text = (i) => tail.textOf(entries[i]);
  const all = [...idx.map((i) => ({ i, text: text(i), waiting: false })), ...wait.map((w) => ({ i: w.i, text: w.text, waiting: true }))].sort((a, b) => a.i - b.i);
  const lifted = (m) => (!m.waiting && idx.some((j) => j > m.i && endsWithGoWord(text(j)))) || approvals.some((a) => a > m.i);
  let stopMsg = null;
  for (let k = all.length - 1; k >= 0; k--) if (isStopMessage(all[k].text)) { stopMsg = all[k]; break; }
  // A waiting go message lifts nothing: the newest message that can hold is the one a correction is read from.
  const holders = all.filter((m) => !(m.waiting && endsWithGoWord(m.text)));
  const last = holders[holders.length - 1];
  const correction = !!last && !endsWithGoWord(last.text) && !isStopMessage(last.text) && !approvals.some((a) => a > last.i);
  return { stop: !!stopMsg && !lifted(stopMsg), correction, settled: !!stopMsg || idx.some((i) => endsWithGoWord(text(i))), waiting: wait.map((w) => w.text) };
}

/** The holds standing for a call, read from the session's transcript through a tail that widens (2, 8, then 32 MB) until it is settled. */
export function ownerHolds(p) {
  const file = mainTranscript(p);
  let h = { stop: false, correction: false, settled: false, waiting: [] };
  for (const mb of [2, 8, 32]) {
    h = holdsIn(tail.tailEntries(file, mb * 1024 * 1024));
    if (h.settled) break;
  }
  return h;
}

/** HOLD 1. @returns {string|null} the refusal, or null. */
function holdWord(p) {
  const tool = String(p.tool_name ?? '');
  const planEntry = !p.agent_id && tool === 'EnterPlanMode' && !/plan/i.test(String(p.permission_mode ?? ''));
  const planExit = !p.agent_id && tool === 'ExitPlanMode';
  if (READS.has(tool) && !planEntry && !planExit) return null;
  const h = ownerHolds(p);
  if (planEntry || planExit) {
    if (h.stop) return h.waiting.length ? WAITING_TEXT(true, h.waiting) : STOP_TEXT;
    return planEntry && h.correction ? NO_PAGE_TEXT : null;
  }
  if (h.stop) {
    if (!p.agent_id && tool === 'TaskStop') return null;
    if (p.agent_id && AGENT_RETURN.test(tool)) return null;
    if (p.agent_id && (tool === 'Write' || tool === 'Edit') && isProgressFile(absPath(p, p.tool_input?.file_path ?? ''), p.session_id)) return null;
    if (!p.agent_id && FILE_WRITES.has(tool) && /plan/i.test(String(p.permission_mode ?? ''))
      && dirname(absPath(p, p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? '')) === join(homedir(), '.claude', 'plans')) return null;
    return h.waiting.length ? WAITING_TEXT(true, h.waiting) : STOP_TEXT;
  }
  if (p.agent_id || !h.correction) return null;
  const text = h.waiting.length ? WAITING_TEXT(false, h.waiting) : CORRECTION_TEXT;
  if (isWalkSend(p)) return null;
  if (NEW_STARTS.has(tool)) return text;
  if (FILE_WRITES.has(tool) && !mayWrite(p, p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? '')) return text;
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

// ---- the read at a start and the approved page ----

/** The three standing pages, each as a path beneath a copy of the hub. */
export const STANDING_PAGES = ['plans/native/page.md', 'doctrine/never.md', 'doctrine/hub.md'];
const canon = (f) => { try { return realpathSync(String(f)); } catch { return resolve(String(f)); } };

/** The copies of the hub whose pages count: this folder, the clone every gate runs from, and any hub checkout beneath or beside the launch folder. */
function hubCopies(p) {
  const out = [HUB, join(homedir(), '.claude', 'hub')];
  try { for (const r of reposUnder(resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd()))) if (isHubCheckout(r)) out.push(r); } catch { /* the other copies stand */ }
  return [...new Set(out.map(canon))];
}

// ---- the typed messages of the session, filed at every start of a main thread: written whole only where the file is not there, and otherwise only added to ----

/** The first line of the file of the typed messages. */
const RECALL_FIRST_LINE = 'Every message typed in this session, whole and in order, for this session to read. It is not copied into any repository.';
/** The end of the refusal that holds the main thread to the file of the typed messages after a compaction. */
const WHY_RECALL = 'Why: a summary loses the intent, and the typed messages are where it is.';

/**
 * The file of the session's typed messages: `recall/typed-messages.md` in the session scratchpad, the folder `<tmp>/claude-<uid>/<project>/<sid>/scratchpad`
 * that `inScratchpad` reads, where `<project>` is the name of the folder that holds the session's record (the payload's `transcript_path`) and
 * `<sid>` is the payload's `session_id`.
 * @returns {string} its path, or '' where the payload names no transcript or no session, or no user id can be read.
 */
export function recallFile(p) {
  const sid = String(p?.session_id ?? '');
  const tr = String(p?.transcript_path ?? '');
  if (!/^[\w-]+$/.test(sid) || !tr || typeof process.getuid !== 'function') return '';
  const project = basename(dirname(resolve(tr)));
  if (!project) return '';
  const file = join(tmpdir(), `claude-${process.getuid()}`, project, sid, 'scratchpad', 'recall', 'typed-messages.md');
  return inScratchpad(file, sid) ? file : '';
}

const CALIFORNIA = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
/** @returns {string} a time in California as the heading of a typed message shows it: the month's first three letters, the day, a comma, and the hour and minute of a 24-hour clock. */
export function californiaStamp(ms) {
  if (!Number.isFinite(ms)) return 'time not known';
  const part = Object.fromEntries(CALIFORNIA.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return `${part.month} ${part.day}, ${part.hour}:${part.minute}`;
}

/**
 * The typed messages of a session, read from its entries.
 * @returns {{text: string, at: number}[]} each message a person typed, delivered as a prompt or from the queue in the middle of a turn, in order,
 *   with its words whole and the time it was typed (`typedAt`). What is a typed message is told by `isOwnerMessage` of transcript-tail.mjs, which
 *   sets aside hook feedback, a task notification, an agent's hand-back, a slash command's entry, a tool result and a compaction's summary.
 */
export function typedMessages(entries) {
  const out = [];
  entries.forEach((e, i) => {
    if (e?.isSidechain || e?.agentId || !tail.isOwnerMessage(e)) return;
    const text = tail.textOf(e);
    const at = typedAt(entries, i);
    const last = out[out.length - 1];
    if (last && last.text === text && last.at === at) return;
    out.push({ text, at });
  });
  return out;
}

/**
 * File the typed messages of the session at `recallFile(p)`, making the folder where it is not there. THE FILE ONLY GROWS. Where it is not there, or holds
 * no message, it is written whole from the record, in order. Otherwise it is never written over: each typed message of the record that it does not hold is
 * added to its end (`addTypedMessages`), so a record that no longer goes back to the session's first message takes none out of the file.
 * @returns {{ok: boolean, file?: string, count?: number, skipped?: boolean, why?: string}} `count` is the number of messages the file holds after the
 *   adding, which is the number in its last heading. `skipped` where the payload names no transcript or no session (there is nothing to file),
 *   `ok: false` with a `why` where the record cannot be read or the file cannot be written. It throws nothing.
 */
export function fileTypedMessages(p) {
  const file = recallFile(p);
  if (!file) return { ok: false, skipped: true, why: 'the start names no transcript or session' };
  try {
    const record = String(p.transcript_path);
    const size = statSync(record).size;
    const entries = tail.tailEntries(record, Math.max(size, 1));
    if (size > 0 && !entries.length) return { ok: false, why: `the session's record ${record} could not be read` };
    const list = typedMessages(entries);
    let held = 0;
    try { held = filedMessages(readFileSync(file, 'utf8')).length; } catch { held = 0; }
    let count = held;
    if (!held) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `${[RECALL_FIRST_LINE, ...list.map((m, k) => entryOf(k + 1, m))].join('\n\n')}\n`);
      // What keeps the file current beside it, and, at a compaction alone, how many lines it holds then. A failure here refuses nothing: with no state
      // the next adding tells the messages the file holds by their time and words, and with no count the file is due whole after a compaction.
      try { writeFileSync(recallBeside(file, 'state'), JSON.stringify({ filed: list.length, anchor: anchorOf(list[list.length - 1]), pending: 0 })); } catch { /* the next adding writes it */ }
      count = list.length;
    } else {
      count = addTypedMessages(file, list, true)?.count ?? held;
    }
    if (p.source === 'compact') { try { writeFileSync(recallBeside(file, 'due'), `${linesOf(file)?.text}\n`); } catch { /* the file is then due whole */ } }
    return { ok: true, file, count };
  } catch (e) {
    return { ok: false, why: `${file} could not be written: ${e?.message ?? e}` };
  }
}

/** A file kept beside the file of the typed messages: its name with the extension `ext` in the place of `.md`. */
const recallBeside = (file, ext) => file.replace(/\.md$/, `.${ext}`);
/** How a filed message is told again in the record: the time it was typed and a hash of its words, kept in `state`. */
const anchorOf = (m) => (m ? { at: String(m.at), hash: createHash('sha1').update(String(m.text)).digest('hex') } : null);
/** The heading and the words of a message as the file shows them. */
const entryOf = (k, m) => `## ${k}. ${californiaStamp(m.at)}\n\n${m.text}`;

/** The words of a message with the line ends at both ends taken off, as a file shows them. */
const trimEnds = (t) => String(t ?? '').replace(/^\n+/, '').replace(/\n+$/, '');
/** How a message is told from the ones a file holds: the time its heading shows and its words. */
const keyOf = (stamp, text) => `${stamp}\n${trimEnds(text)}`;

/**
 * The messages a file of the typed messages holds, in order: each heading `## <n>. <time>` that carries the next number, with the time it shows and the
 * words under it. A line of a message's words that looks like a heading is none unless it carries the next number.
 * @returns {{stamp: string, text: string}[]} its length is the number in the file's last heading.
 */
function filedMessages(text) {
  const lines = String(text).split('\n');
  const found = [];
  let cur = null;
  for (let i = 1; i < lines.length; i++) {
    const m = /^## (\d+)\. (.*)$/.exec(lines[i]);
    if (m && Number(m[1]) === found.length + 1) { cur = { stamp: m[2], body: [] }; found.push(cur); } else if (cur) cur.body.push(lines[i]);
  }
  return found.map((x) => ({ stamp: x.stamp, text: trimEnds(x.body.join('\n')) }));
}

/**
 * THE ONE ROUTINE THAT ADDS TO THE FILE OF THE TYPED MESSAGES, for a start and for the calls between starts. It adds to the file's end each typed message
 * that the file does not hold, numbered on from its last heading, and writes the state beside it. It never takes a message out of the file and never
 * rewrites one. The file's `state` holds how many messages are filed, the last one the record showed (`anchor`) and how many were added at their prompt
 * that the record has not shown yet (`pending`). Which messages of `list` are new:
 *   - with a state that describes the file and whose anchor is in `list`, the messages after the anchor;
 *   - with such a state whose anchor is in no part of the record that was read, and `whole` (the record goes back as far as it goes), the messages typed
 *     after the time the state holds for the anchor: the record was cut, and what stands in the file is left;
 *   - with such a state whose anchor is not in a tail, nothing is added (null): the caller reads a wider tail;
 *   - with no state, or one that does not describe the file, the messages that the file does not hold, told by the time and the words of each as the
 *     file shows them and counted, so that the same words typed twice in one minute are held twice.
 * With a state, the first `pending` new ones are the ones already added at their prompt and are set aside.
 * @param {string} file  the file of the typed messages, where it is.
 * @param {{text: string, at: number}[]} list  the typed messages a read of the record gave, in order.
 * @param {boolean} whole  whether `list` goes back to the first message the record holds, as a read of the whole record does.
 * @param {string|null} [prompt]  the words a UserPromptSubmit carries, added where the record does not hold them yet and `isOwnerMessage` accepts them.
 * @returns {{added: number, count: number}|null} the messages added and the number the file holds after; null, with nothing written, where `list` does not reach.
 */
function addTypedMessages(file, list, whole, prompt = null) {
  let st = null;
  try { st = JSON.parse(readFileSync(recallBeside(file, 'state'), 'utf8')); } catch { st = null; }
  let text = '';
  try { text = readFileSync(file, 'utf8'); } catch { text = ''; }
  const held = filedMessages(text);
  const usable = !!st && Number.isInteger(st.filed) && st.filed === held.length && (held.length === 0 || !!st.anchor);
  let add;
  let waiting = 0;
  let anchor;
  if (usable) {
    let fresh = null;
    if (st.anchor) {
      let at = -1;
      for (let k = list.length - 1; k >= 0 && at < 0; k--) if (String(list[k].at) === st.anchor.at && anchorOf(list[k]).hash === st.anchor.hash) at = k;
      if (at >= 0) fresh = list.slice(at + 1);
      else if (whole) fresh = list.filter((m) => m.at > Number(st.anchor.at));
    } else if (whole) fresh = list;
    if (!fresh) return null;
    const pending = Math.max(0, Number(st.pending) || 0);
    const absorbed = Math.min(pending, fresh.length);
    add = fresh.slice(absorbed);
    waiting = pending - absorbed;
    anchor = fresh.length ? anchorOf(fresh[fresh.length - 1]) : st.anchor;
  } else {
    const counts = new Map();
    for (const x of held) counts.set(keyOf(x.stamp, x.text), (counts.get(keyOf(x.stamp, x.text)) ?? 0) + 1);
    // A read that is a tail reaches when its first message is one the file holds.
    if (!whole && !(list.length && counts.has(keyOf(californiaStamp(list[0].at), list[0].text)))) return null;
    const take = (m) => {
      const key = keyOf(californiaStamp(m.at), m.text);
      const n = counts.get(key) ?? 0;
      if (n > 0) { counts.set(key, n - 1); return true; }
      return false;
    };
    add = list.filter((m) => !take(m));
    anchor = list.length ? anchorOf(list[list.length - 1]) : null;
  }
  if (prompt !== null) {
    const entry = { type: 'user', origin: { kind: 'human' }, message: { role: 'user', content: String(prompt) } };
    const last = add[add.length - 1];
    // The record may hold the prompt already: then the last message it shows that is not filed is this one.
    if (tail.isOwnerMessage(entry) && !(last && normText(last.text) === normText(tail.textOf(entry)))) { add.push({ text: tail.textOf(entry), at: Date.now() }); waiting += 1; }
  }
  let k = held.length;
  if (add.length) appendFileSync(file, add.map((m) => `\n${entryOf(++k, m)}\n`).join(''));
  // A state that cannot be written refuses nothing: with none, the next adding tells what the file holds by the time and the words of each.
  try { writeFileSync(recallBeside(file, 'state'), JSON.stringify({ filed: k, anchor, pending: waiting })); } catch { /* the next adding tells by time and words */ }
  return { added: add.length, count: k };
}

/**
 * Keep the file of the typed messages current between starts, by adding to its end. It never rewrites what is filed and never reads the whole
 * record: it reads the tail that the holds read (2, 8, then 32 MB) until the tail reaches the last message filed (`addTypedMessages` says which
 * messages are new, with a state or without one). Where the file is not there nothing is written and no file is made: the next start writes it whole.
 * Where the last message filed is in no tail, nothing is added.
 * @param {object} p  the payload of a main thread's call.
 * @param {string|null} [prompt]  the words a UserPromptSubmit carries, added where the record does not hold them yet and `isOwnerMessage` accepts them.
 * @returns {{ok: boolean, added?: number, skipped?: boolean, why?: string}} it throws nothing.
 */
export function keepTypedMessages(p, prompt = null) {
  const file = recallFile(p);
  if (!file) return { ok: false, skipped: true, why: 'the payload names no transcript or session' };
  try {
    if (!existsSync(file)) return { ok: false, skipped: true, why: 'the file is not there' };
    const record = String(p.transcript_path);
    const size = statSync(record).size;
    let done = null;
    for (const mb of [2, 8, 32]) {
      const list = typedMessages(tail.tailEntries(record, mb * 1024 * 1024));
      done = addTypedMessages(file, list, size <= mb * 1024 * 1024, prompt);
      if (done) break;
    }
    if (!done) return { ok: false, skipped: true, why: 'the last message filed is not in the record\'s tail' };
    return { ok: true, added: done.added };
  } catch (e) {
    return { ok: false, why: `${file} could not be kept current: ${e?.message ?? e}` };
  }
}

/** @returns {number|null} the lines the file of the typed messages held at the last compaction, as the start recorded them; null where none is recorded. */
function recallDueLines(file) {
  try {
    const n = Number(readFileSync(recallBeside(file, 'due'), 'utf8').trim());
    return Number.isInteger(n) && n >= 0 ? n : null;
  } catch { return null; }
}

/** @returns {{text: number, split: number}|null} the lines of text a file holds and the count the harness records as its total (the empty text after a final newline counted); null when it cannot be read. */
function linesOf(file) {
  try {
    const parts = readFileSync(file, 'utf8').split('\n');
    return { text: parts.length - (parts[parts.length - 1] === '' ? 1 : 0), split: parts.length };
  } catch { return null; }
}

/**
 * Have Read results in these entries covered every line of a file as it stands?
 * @returns {boolean} true when the Read results of the main thread that are not errors, taken together, return every line of the file.
 *   A result comes from the harness's own record (`toolUseResult.file`: its first line, its count of lines and the file's total) or,
 *   where that is absent, from the line numbers in its text. A result recorded with a total that is not the file's now was made of
 *   other text and counts for nothing; a call's offset and limit count for nothing, only the lines returned do.
 *   Where `upTo` is given, only the lines from the first to that count (or to the file's last, where it is shorter) are asked for, and the
 *   rule of the recorded total is not put: that is the file of the typed messages, which only grows.
 */
export function readWhole(entries, file, upTo = null) {
  const n = linesOf(file);
  if (!n) return false;
  // With `upTo` only the lines from the first to that count are asked for, and a result's recorded total is not put to the file: it only grows.
  const total = upTo === null ? n.text : Math.min(upTo, n.text);
  if (total === 0) return true;
  const want = canon(file);
  const asked = new Map();
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type === 'assistant' && !e.isSidechain && !e.agentId && Array.isArray(c)) for (const b of c) if (b?.type === 'tool_use' && b.name === 'Read') asked.set(b.id, String(b.input?.file_path ?? ''));
  }
  const got = new Set();
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type !== 'user' || e.isSidechain || e.agentId || !Array.isArray(c)) continue;
    for (const b of c) {
      if (b?.type !== 'tool_result' || b.is_error || !asked.has(b.tool_use_id)) continue;
      const rec = e.toolUseResult?.file;
      if (canon(rec?.filePath || asked.get(b.tool_use_id)) !== want) continue;
      if (rec && Number.isFinite(rec.startLine) && Number.isFinite(rec.numLines) && typeof rec.content === 'string') {
        if (upTo === null && Number(rec.totalLines) > 0 && Number(rec.totalLines) !== n.text && Number(rec.totalLines) !== n.split) continue;
        for (let k = 0; k < rec.numLines; k++) got.add(rec.startLine + k);
      } else {
        const t = typeof b.content === 'string' ? b.content : Array.isArray(b.content) ? b.content.map((x) => x?.text ?? '').join('\n') : '';
        for (const m of t.matchAll(/^\s*(\d+)\t/gm)) got.add(Number(m[1]));
      }
    }
  }
  for (let k = 1; k <= total; k++) if (!got.has(k)) return false;
  return true;
}

/** The last compaction in the entries: the system compact_boundary or the summary that follows it. @returns {number} its index, or -1. */
function lastCompaction(entries) {
  let at = -1;
  entries.forEach((e, i) => { if ((e?.type === 'system' && e.subtype === 'compact_boundary') || (e?.type === 'user' && e.isCompactSummary === true)) at = i; });
  return at;
}

/**
 * HOLD 4: the standing pages are read, whole, before anything else.
 * After a start, a clear or a compaction the main thread may only read until the short page, doctrine/never.md and doctrine/hub.md have
 * each been read whole, in the hub's copy or in a checkout of the hub. The reads are looked for in the session's transcript since its last
 * compaction (all of it where there is none), through a tail that widens (2, 8, then 32 MB). A resume holds the same transcript, so it
 * owes the read only where the transcript since the last start or compaction does not hold it. A transcript that cannot be read, or whose
 * reach cannot be settled, leaves the call through. An agent's call is never held: workers and checkers read their own pages.
 * HOOK_DISPATCH_READ_HOLD=off is the test seam that sets the hold aside, for the cases of the other holds, whose transcripts hold no reads.
 * @returns {string|null} the refusal, or null.
 */
function holdRead(p) {
  if (process.env.HOOK_DISPATCH_READ_HOLD === 'off') return null;
  const tool = String(p.tool_name ?? '');
  if (!p.agent_id && tool === 'TaskStop') return null;
  if (p.agent_id) return null;
  if (READS.has(tool)) return null;
  const file = mainTranscript(p);
  if (!file) return null;
  let size = 0;
  try { size = statSync(file).size; } catch { return null; }
  const copies = hubCopies(p);
  const pages = STANDING_PAGES.map((rel) => ({ rel, files: copies.map((c) => join(c, rel)).filter((f) => existsSync(f)) })).filter((pg) => pg.files.length);
  // After a compaction the file of the typed messages is due as well, where the start filed it: it is read whole after the compaction, or the call is held.
  const recall = recallFile(p);
  const recallHere = !!recall && existsSync(recall);
  if (!pages.length && !recallHere) return null;
  // What was due at the compaction is the lines the file then held, as the start recorded them; lines added later are never due. Where no count is
  // recorded the file is due whole.
  const dueTo = recallHere ? recallDueLines(recall) : null;
  const recallLines = dueTo === null ? `every line, ${linesOf(recall)?.text} lines` : `lines 1 to ${dueTo}, the file as it stood at the compaction`;
  for (const mb of [2, 8, 32]) {
    const entries = tail.tailEntries(file, mb * 1024 * 1024);
    if (!entries.length) return null;
    const cut = lastCompaction(entries);
    const live = entries.slice(cut + 1);
    const unread = pages.filter((pg) => !pg.files.some((f) => readWhole(live, f)));
    const recallDue = recallHere && cut >= 0 && !readWhole(live, recall, dueTo);
    const recallUnsure = recallHere && cut < 0 && size > mb * 1024 * 1024 && !readWhole(entries, recall);
    if (!unread.length && !recallDue && !recallUnsure) return null;
    if (cut >= 0 || size <= mb * 1024 * 1024) {
      const list = [...unread.map((pg) => `${pg.files[0]} (every line, ${linesOf(pg.files[0])?.text} lines)`), ...(recallDue ? [`${recall} (${recallLines})`] : [])].join('; ');
      const due = unread.length + (recallDue ? 1 : 0);
      const what = unread.length ? `${unread.length === 1 ? 'a standing page' : 'the standing pages'}${recallDue ? ' and the file of its typed messages' : ''}` : 'the file of its typed messages';
      return `${unread.length ? 'STANDING PAGES UNREAD' : 'TYPED MESSAGES UNREAD'}: this session ${unread.length ? 'started or was compacted' : 'was compacted'} and has not read ${what} whole since, so the main thread may only read until ${due === 1 ? 'it has' : 'each has'} been read: ${list}. `
        + 'Only reads pass, and TaskStop on the main thread; an agent\'s calls are not held by it, and it sets no latch. '
        + (unread.length ? 'Read each in full, in as many Read calls as it takes, in the hub\'s copy or in a checkout of the hub; a summary or another copy is not the page. ' : 'Read it in full, in as many Read calls as it takes; a summary is not the typed messages. ')
        + 'Read results that between them return every line lift it, and a compaction makes the read due again. '
        + `${unread.length ? WHY_READ : ''}${recallDue ? WHY_RECALL : ''}`.trimEnd();
    }
  }
  return null;
}

/**
 * HOLD 5: the approved page is changed only in plan mode.
 * A write of a file under ~/.claude/plans/ passes on the main thread only in plan mode, where the button follows. The mode is the
 * harness's own word on the call (`permission_mode`); where the call does not say one, the harness has not told which mode the call is
 * made in, and the write passes as it did before this hold. An agent's call is not held by it.
 * @returns {string|null} the refusal, or null.
 */
function holdPlan(p) {
  const tool = String(p.tool_name ?? '');
  if (p.agent_id || !FILE_WRITES.has(tool)) return null;
  const mode = p.permission_mode;
  if (typeof mode !== 'string' || !mode.trim() || /plan/i.test(mode)) return null;
  const root = join(homedir(), '.claude', 'plans');
  const a = absPath(p, p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? '');
  return a.startsWith(root + '/') ? PLAN_TEXT : null;
}

/**
 * The model that serves the main thread, read from entries.
 * @returns {string|null} the id named by the newest reply of the main thread (an assistant entry with no agent id that carries
 *   `message.model`), or by a model command entry (a user entry whose text holds "Set model to" and then the id between backticks) that
 *   comes after that reply; an empty id and `<synthetic>` are skipped. Null where there is none.
 */
export function servingModel(entries) {
  let id = null;
  for (const e of entries ?? []) {
    if (!e || e.isSidechain || e.agentId) continue;
    if (e.type === 'assistant') {
      const m = e.message?.model;
      if (typeof m === 'string' && m.trim() && m.trim() !== '<synthetic>') id = m.trim();
    } else if (e.type === 'user') {
      const m = /Set model to[^`]*`([^`]*)`/.exec(tail.textOf(e));
      if (m && m[1].trim() && m[1].trim() !== '<synthetic>') id = m[1].trim();
    }
  }
  return id;
}
/** Is the model id a top-tier one? @returns {boolean} true where the id carries fable or mythos. */
export function isTopTier(id) { return /fable|mythos/i.test(String(id ?? '')); }

// What the run tier's refusal says of the sends that pass on the top tier.
const RUN_TIER_WHAT = 'A run is made on the cheapest tier, because the top tier is paid for judgement and a run needs none. '
  + 'Three calls pass on the top tier: in plan mode, the checker sent a page\'s path and the word walk; outside plan mode, the hub\'s run script launched with the Workflow tool for a page that stands as it was approved; '
  + 'and, once that script has been launched for the page, a worker or a checker sent the page\'s path, the word step and the step\'s number. For any other send the thread is put a tier lower.';
const tierRefusal = (head, id, what, line) => `${head} the main thread is served by ${id}, read from the newest reply of the thread or from a model command after it. ${what} `
  + `Type ${line} alone while the thread is idle. Say so in one plain line and end the turn.`;

/**
 * HOLD 6: the run waits for its tier. On the main thread a new start is refused while a top-tier model serves, but for the walk of a page
 * (`isWalkSend`) and for the hub's run script launched for an approved page, or a step of that page once the script has been launched (`isRunSend`).
 * @returns {string|null} the refusal, or null. An agent's call, a read and an unknown model pass; no latch is set.
 */
function holdRunTier(p) {
  if (p.agent_id || !NEW_STARTS.has(String(p.tool_name ?? ''))) return null;
  const id = servingModel(tail.tailEntries(mainTranscript(p), 2 * 1024 * 1024));
  if (isWalkSend(p)) return null;
  if (isRunSend(p, id)) return null;
  if (!id || !isTopTier(id)) return null;
  return tierRefusal('RUN WAITS FOR ITS TIER:', id, RUN_TIER_WHAT, RUN_TIER_LINE);
}

/**
 * HOLD 8: the tier of a send. On the main thread an Agent or Task call that names a model carrying neither sonnet nor haiku is refused.
 * @returns {string|null} the refusal, or null. A send naming no model, an agent's call and any other tool pass; no latch is set.
 */
function holdSendTier(p) {
  if (p.agent_id || !/^(?:Agent|Task)$/.test(String(p.tool_name ?? ''))) return null;
  const m = p.tool_input?.model;
  if (typeof m !== 'string' || /sonnet|haiku/i.test(m)) return null;
  return `SEND NAMES A HIGHER TIER: the send names the model "${m}", which is above the sonnet tier. The roles carry their tier, so the send goes again with no model named.`;
}

// ---- the eject: a worker's hand-back that opens EJECT stops the run until a plan is approved at the button ----
const ejectFile = (p) => join(homedir(), '.claude', 'eject', `${safeId(p)}.json`);
const EJECT_OPENING = /^\s*EJECT(?![A-Za-z0-9])/;
const PAGE_CAUSE = ['What was met', 'Why the page was drawn that way', 'How far it reaches'];

/** Write the session's eject record for an agent's hand-back that opens with EJECT. Never refuses; a failure is one line on the error output. */
function recordEject(p) {
  try {
    if (!p.agent_id || String(p.tool_name ?? '') !== 'SubagentHandback') return;
    const message = String(p.tool_input?.message ?? '');
    if (!EJECT_OPENING.test(message)) return;
    mkdirSync(dirname(ejectFile(p)), { recursive: true });
    writeFileSync(ejectFile(p), JSON.stringify({ at: Date.now(), text: message.slice(0, 300) }, null, 1));
  } catch (e) { process.stderr.write(`hook-dispatch.mjs: the eject record was not written: ${e?.message ?? e}\n`); }
}

/**
 * The eject record standing for the main thread, or null. An approval at the button whose entry time is later than the record's removes it.
 * @returns {{at: number, text: string}|null}
 */
export function ejectStanding(p) {
  let r;
  try { r = JSON.parse(readFileSync(ejectFile(p), 'utf8')); } catch { return null; }
  const at = Number(r?.at) || 0;
  const entries = tail.tailEntries(mainTranscript(p), 16 * 1024 * 1024);
  if (approvalIndexes(entries).some((i) => Date.parse(entries[i]?.timestamp ?? '') > at)) { rmSync(ejectFile(p), { force: true }); return null; }
  return { at, text: String(r?.text ?? '') };
}

/** Does the page open with its cause: the heading Why it stopped and, after it, the three openings? */
function pageHasCause(text) {
  const lines = String(text).split('\n');
  const h = lines.findIndex((l) => /^## Why it stopped\s*$/.test(l));
  if (h < 0) return false;
  const after = lines.slice(h + 1);
  return PAGE_CAUSE.every((w) => after.some((l) => new RegExp(`^\\s*(?:- )?${esc(w)}`).test(l)));
}

/**
 * HOLD 9: an eject is held. While a record stands, on the main thread a new start is refused, and the button is refused while the newest
 * file directly under ~/.claude/plans/ does not open with its cause.
 * @returns {string|null} the refusal, or null. An agent's call and any other tool pass; no latch is set.
 */
function holdEject(p) {
  const tool = String(p.tool_name ?? '');
  if (p.agent_id || !(NEW_STARTS.has(tool) || tool === 'ExitPlanMode')) return null;
  const rec = ejectStanding(p);
  if (!rec) return null;
  if (tool === 'ExitPlanMode') {
    const root = join(homedir(), '.claude', 'plans');
    let newest = '';
    let best = -1;
    try { for (const f of readdirSync(root)) { const m = statSync(join(root, f)); if (m.isFile() && m.mtimeMs > best) { best = m.mtimeMs; newest = join(root, f); } } } catch { /* none */ }
    let text = '';
    try { text = newest ? readFileSync(newest, 'utf8') : ''; } catch { /* none */ }
    if (pageHasCause(text)) return null;
    return `THE PAGE DOES NOT OPEN WITH ITS CAUSE: a step ejected, and the page is not approved until the newest page under ~/.claude/plans/ holds the heading "## Why it stopped" and, after it, three lines that open with "${PAGE_CAUSE[0]}", "${PAGE_CAUSE[1]}" and "${PAGE_CAUSE[2]}".`;
  }
  if (isWalkSend(p)) return null;
  return `A STEP EJECTED: ${rec.text} The run is stopped. The cause is found before the page is changed, and the page is changed in plan mode and approved at the button before anything more is sent.`;
}

// ---- the walk and the run: a page is walked by a fresh reader before the button, and the run is the hub's script, launched after it ----
/** The id git gives a file's content. @returns {string} forty characters. */
const contentId = (buf) => createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');

/** The newest file directly under ~/.claude/plans/, or '' where there is none. */
function newestPage() {
  const root = join(homedir(), '.claude', 'plans');
  let newest = '';
  let best = -1;
  try { for (const f of readdirSync(root)) { const s = statSync(join(root, f)); if (s.isFile() && s.mtimeMs > best) { best = s.mtimeMs; newest = join(root, f); } } } catch { /* none */ }
  return newest;
}

/** The words of the newest message the owner typed, or '' where there is none. */
function lastTyped(p) {
  let text = '';
  for (const e of tail.tailEntries(mainTranscript(p), 2 * 1024 * 1024)) if (tail.isOwnerMessage(e)) text = tail.textOf(e);
  return text;
}

/**
 * Is the call the walk of a page: in plan mode, the checker sent a page's path and the word walk?
 * @returns {boolean} true only for an Agent call in plan mode whose agent type is checker and whose prompt is the path of a file directly
 *   under ~/.claude/plans/, a space and the word walk.
 */
function isWalkSend(p) {
  if (String(p.tool_name ?? '') !== 'Agent' || !/plan/i.test(String(p.permission_mode ?? ''))) return false;
  if (String(p.tool_input?.subagent_type ?? '') !== 'checker') return false;
  const m = /^(\S+) walk$/.exec(String(p.tool_input?.prompt ?? '').trim());
  return !!m && dirname(absPath(p, m[1])) === join(homedir(), '.claude', 'plans');
}

/**
 * The text approved at the newest approval of a page: what that approval's own entry in the session's transcript carries for the file.
 * @returns {{text: string, at: number, entries: object[]}|null} the approved text, the index of the approval's entry and the entries read;
 *   null where the transcript holds no approval of that file. It is read from the harness's record and never from a file an agent could write.
 */
function approvedPage(p, page) {
  const entries = tail.tailEntries(mainTranscript(p), 16 * 1024 * 1024);
  let found = null;
  for (const i of approvalIndexes(entries)) {
    const r = entries[i]?.toolUseResult;
    if (r && typeof r.plan === 'string' && r.filePath && canon(String(r.filePath)) === canon(page)) found = { text: r.plan, at: i, entries };
  }
  return found;
}

/** The hub's run script: the launch folder's own file, where its content is the live copy's, so a script changed in a working copy launches nothing. @returns {string} its path, or ''. */
function runScript(p) {
  const mine = join(resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd()), 'plans', 'native', 'run-page.js');
  try { return readFileSync(mine, 'utf8') === readFileSync(join(HUB, 'plans', 'native', 'run-page.js'), 'utf8') ? mine : ''; } catch { return ''; }
}

/** Does a page directly under ~/.claude/plans/ stand as it was approved? @returns {object|null} the approval (`approvedPage`), or null. */
function approvedAsItStands(p, page) {
  if (dirname(page) !== join(homedir(), '.claude', 'plans')) return null;
  let now = '';
  try { now = readFileSync(page, 'utf8'); } catch { return null; }
  const ok = approvedPage(p, page);
  return ok && ok.text.trim() === now.trim() ? ok : null;
}

/**
 * Is the call one the top tier may make for the run of an approved page?
 * Outside plan mode: a Workflow call whose scriptPath is the hub's run script (`runScript`) and whose args.page is a page that stands as
 * it was approved; or an Agent call to a worker or a checker whose prompt is such a page's path, the word step and a number, where the
 * transcript holds, after that approval, a launch of the run script for the page. The script goes first, and the top tier sends a step
 * itself only where the script could not.
 * @param {object} p  the call.
 * @param {string|null} id  the model serving the main thread; a model below the top tier is not judged here.
 * @returns {boolean}
 */
function isRunSend(p, id) {
  if (!isTopTier(id) || /plan/i.test(String(p.permission_mode ?? ''))) return false;
  const tool = String(p.tool_name ?? '');
  const script = runScript(p);
  const launched = (input) => (script && canon(absPath(p, String(input?.scriptPath ?? ''))) === canon(script) && typeof input?.args?.page === 'string' ? absPath(p, input.args.page) : '');
  if (tool === 'Workflow') { const page = launched(p.tool_input); return !!page && !!approvedAsItStands(p, page); }
  if (tool !== 'Agent') return false;
  const m = /^(\S+) step \d+$/.exec(String(p.tool_input?.prompt ?? '').trim());
  const role = String(p.tool_input?.subagent_type ?? '');
  if (!m || !(role === 'worker' || role === 'checker')) return false;
  const page = absPath(p, m[1]);
  const ok = approvedAsItStands(p, page);
  if (!ok) return false;
  return ok.entries.slice(ok.at + 1).some((e) => e?.type === 'assistant' && !e.isSidechain && !e.agentId && Array.isArray(e.message?.content)
    && e.message.content.some((b) => b?.type === 'tool_use' && b.name === 'Workflow' && launched(b.input) === page));
}

/** Does the launch folder hold a checker's role that says what a walk is? A repository whose checker was never told of a walk is not held to one. */
function roleWalks(root) {
  try { return /\bthe word walk\b/.test(readFileSync(join(root, '.claude', 'agents', 'checker.md'), 'utf8')); } catch { return false; }
}

/**
 * HOLD 10: the button waits for a walk. On the main thread, in a repository whose checker's role says what a walk is, ExitPlanMode is refused until a
 * checker that changed nothing has answered CHECK PASS and the content id of the newest page under ~/.claude/plans/ as it stands, read by
 * the push guard's `checkerPassed`. The newest message the owner typed lifts it for that page where it carries the words without a walk.
 * @returns {string|null} the refusal, or null. An agent's call, a repository whose checker's role does not speak of a walk and a folder with no page pass; no latch is set.
 */
function holdWalk(p) {
  if (p.agent_id || String(p.tool_name ?? '') !== 'ExitPlanMode') return null;
  if (!roleWalks(resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd()))) return null;
  const page = newestPage();
  if (!page) return null;
  const id = contentId(readFileSync(page));
  if (pushGuard.checkerPassed(p, id).ok) return null;
  if (/\bwithout a walk\b/i.test(lastTyped(p))) return null;
  return `THE PAGE HAS NOT BEEN WALKED: the button waits until a checker that changed nothing has walked the page as it stands and answered CHECK PASS with the page's content id, ${id}. `
    + `Send the checker with the words "${page} walk", put right every gap it names, and walk the page again after any change. `
    + 'Why: a page\'s writer does not find what its worker finds, and a defect met in the middle of a run costs a return. '
    + 'A typed message that carries the words without a walk lifts this for one page.';
}

const DECISION_TEXT = 'NO DECISION ON THIS PAGE: no typed message that ends with a go-word has come after the page\'s last write, so nothing has been decided on the page as it stands. Brief it: end this turn with one reply that says what the page does and why and asks nothing. The button passes once a typed message that ends with a go-word has come after the page\'s last write. Why: the decision is made on a brief of the page as it stands, and a go-word given before the page was written decided nothing about it.';

/**
 * HOLD 11: a decision before the button. On the main thread ExitPlanMode is refused unless the newest typed message ends with a go-word and
 * was typed (as `typedAt` reads it) after the last write of the newest page under ~/.claude/plans/. Nothing typed lifts it but such a go-word.
 * @returns {string|null} the refusal, or null. An agent's call and a folder with no page pass; no latch is set.
 */
function holdDecision(p) {
  if (p.agent_id) return null;
  if (String(p.tool_name ?? '') !== 'ExitPlanMode') return null;
  const decided = newestPage();
  if (!decided) return null;
  const wrote = statSync(decided).mtimeMs;
  const list = tail.tailEntries(mainTranscript(p), 16 * 1024 * 1024);
  let last = -1;
  list.forEach((e, i) => { if (tail.isOwnerMessage(e)) last = i; });
  if (last < 0 || !endsWithGoWord(tail.textOf(list[last]))) return DECISION_TEXT;
  if (!(typedAt(list, last) > wrote)) return DECISION_TEXT;
  return null;
}

/**
 * Run the holds on a call.
 * @returns {string|null} the first refusal. A hold that throws is set aside, one line goes to the error output and the call passes it.
 */
function holds(p) {
  for (const [key, name, hold] of [['read', 'the read hold', holdRead], ['word', 'the typed word hold', holdWord], ['latch', 'the latch hold', holdLatch], ['manager', 'the manager hold', holdManager], ['plan', 'the plan file hold', holdPlan], ['eject', 'the eject hold', holdEject], ['walk', 'the walk hold', holdWalk], ['decision', 'the decision hold', holdDecision], ['runtier', 'the run tier hold', holdRunTier], ['sendtier', 'the send tier hold', holdSendTier]]) {
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
    recordEject(p);
    const o = run(`node "${join(HUB, 'push-guard.mjs')}"`, raw, resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd()));
    if (o.deny) { process.stderr.write(o.reason + '\n'); latchAfter(p, o.reason); return 2; }
    if (o.status !== 0 && !READS.has(tool)) {
      process.stderr.write(`push-guard.mjs did not run cleanly (${o.error ?? `exit ${o.status}`}); only reads run until it is fixed.\n`);
      return 2;
    }
    const held = holds(p);
    if (held) { process.stderr.write(held + '\n'); return 2; }
    // Before a send of an agent or a workflow passes, the typed messages the tail holds are filed, so that a checker reads every one typed up to its send.
    if (!p.agent_id && NEW_STARTS.has(tool)) {
      try { keepTypedMessages(p); } catch (e) { process.stderr.write(`hook-dispatch.mjs: the typed messages were not kept current: ${e?.message ?? e}\n`); }
    }
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
    // The typed messages are filed at every start: the file is written whole only where it is not there, and otherwise added to. A file that cannot be written refuses nothing: the start says so, in one line.
    try {
      const filed = fileTypedMessages(p);
      if (filed.ok) { if (p.source === 'compact') process.stdout.write(`TYPED MESSAGES FILED: ${filed.file} holds the ${filed.count} typed message${filed.count === 1 ? '' : 's'} of this session, whole and in order. After a compaction the main thread may only read until it has been read whole.\n`); }
      else if (!filed.skipped) process.stdout.write(`TYPED MESSAGES NOT FILED: ${filed.why}. Nothing is refused for it.\n`);
    } catch (e) { process.stdout.write(`TYPED MESSAGES NOT FILED: ${e?.message ?? e}. Nothing is refused for it.\n`); }
  }
  if (event === 'UserPromptSubmit') {
    process.stdout.write(`${PAGE_LINE}\n`);
    // The message this prompt carries is added to the file of the typed messages. A file that cannot be kept current refuses nothing and prints nothing.
    if (!p.agent_id) {
      try { keepTypedMessages(p, typeof p.prompt === 'string' ? p.prompt : null); } catch (e) { process.stderr.write(`hook-dispatch.mjs: the typed messages were not kept current: ${e?.message ?? e}\n`); }
    }
  }
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
