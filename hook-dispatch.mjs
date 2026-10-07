#!/usr/bin/env node
/**
 * EVERY GATE RUNS, HOWEVER THE SESSION WAS LAUNCHED (LESSONS §370).
 *
 * Claude Code loads project hooks only from the directory a session starts in.
 * A cloud session with two repos attached starts in their PARENT, which has no
 * settings, so for a whole session of 543 Stop events not one of the owner's
 * hooks ran — plan-guard, stop-guard, ident-guard, harness-guard, the ledger
 * and the session brief were all dead, and every rule rested on memory.
 *
 * This is wired ONCE, at user level, by the cloud environment's setup script:
 *
 *   node hook-dispatch.mjs --install   writes ~/.claude/settings.json so every
 *                                      event below calls this file
 *   node hook-dispatch.mjs <Event>     the hook itself; payload on stdin
 *
 * Per event it runs the hub's family guards, then each TOUCHED repo's own
 * `.claude/settings.json` hooks for that event with CLAUDE_PROJECT_DIR set to
 * that repo, exactly as Claude Code would have if the session had started
 * there. A touched repo is the one holding the path a tool names, or any repo
 * a Bash command names or runs in; when none is named, every repo. The repo
 * that IS the launch directory is skipped, because its hooks already run.
 *
 * The first refusal wins and comes back as exit 2 with its reason on stderr.
 * A crash here refuses everything except reads on PreToolUse: a dispatcher that
 * fails open is the dead-gate state this file exists to end.
 *
 * PreToolUse runs, in order: a subagent's own return, which passes every
 * guard whatever its text names; pending-guard; the judging of the owner's
 * newest exit from plan mode in the app (approved-plan-guard --judge-exit,
 * which records the approval marker from it and never refuses), so that no
 * gate below reads a marker that is about to change; the refusal latch; the
 * correction check (main thread only: while the owner's newest message does
 * not end with a go-word, every call is refused but the status command, TaskStop
 * and a read of the record, so a question is answered from a file in the turn it
 * is asked; an action stays held); the manager fence with its dispatch gate (main thread only),
 * which passes a read only of the record (the plans, the session scratchpad,
 * the doctrine and lessons, each repo's notes and plan pointers, the session's
 * transcript) and a SendUserFile only of files in the session scratchpad, which
 * also passes the wait between statuses (`report.mjs --wait`), and
 * whose dispatch gate sends a step only when the plan's `Served by:` line names
 * a goal for it (Doctrine §0e rule 16) and, where the plan has an `## Order`,
 * only step N, the pointer, or a Standing step (§0e rule 13); the
 * report gate; for the main thread's EnterPlanMode, the in-app approval check
 * (approved-plan-guard --app-exit); the family guards (drive, approved-plan,
 * reply, keep-info); push-guard; plan-fence (subagents only);
 * doctrine-read-guard (main thread only); then each repo's hooks. EVERY
 * PreToolUse refusal, family or repo, sets a latch, except the
 * report gate's, pending-guard's, the correction check's and the in-app
 * approval check's: a status falling due (an agent has ended) is cleared by
 * giving it, and the refused call may then run; a call held while an owner
 * message waits is sent again once the message is delivered, and a latch would
 * refuse it again; a correction is lifted by the owner's next message, which a
 * latch would only wait on a second time; and a plan the owner approved in the
 * app is carried on with, which a latch would stop. A refusal on the main
 * thread writes the SESSION's latch: while it stands only the status command,
 * the main thread's TaskStop and a subagent's own return run, until the owner
 * types a message after it, by the time it was typed (Doctrine §0d, §0e). A
 * refusal INSIDE an agent writes that agent's own latch and the session's is
 * left alone: every later call of that agent is refused but its own return,
 * and the main thread and the other agents are not held. Stop refusals never
 * latch. SessionStart makes the
 * doctrine due and prints one line saying so (§11e). UserPromptSubmit prints,
 * before anything else, each owner message the harness never delivered that a
 * message typed after it has now overtaken (pending-guard --skipped, once
 * each), then, only when the prompt ends with a go-word, the calls
 * pending-guard held while a message from the owner waited, then the goals
 * every session serves (the hub CLAUDE.md's section) ahead of the reminder.
 *
 * It runs from a stable clone (the setup script puts one at ~/.claude/hub), so
 * a broken edit in the working copy cannot refuse its own fix.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, createReadStream, rmSync } from 'node:fs';
import { join, dirname, resolve, basename, relative } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';
import { recallFor } from './compact-recall.mjs';
import { tailEntries, isOwnerMessage, textOf, lastOwnerMessage } from './transcript-tail.mjs';
import { californiaTime, approvalBlock, goalsSection, goalsBlock, pointerFor } from './report.mjs';
import { HARNESS_TAG } from './pending-guard.mjs';

const HUB = dirname(fileURLToPath(import.meta.url));
const EVENTS = ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'Stop'];
const READS = new Set(['Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'ToolSearch', 'TaskList', 'TaskGet',
  'ListAgents', 'ReadNotifications', 'EnterPlanMode', 'ExitPlanMode', 'Skill']);
// Repo shims that only call a hub script: run once per event, not once per repo.
const SHARED_SHIMS = new Set(['plan-guard.sh', 'stop-guard.sh']);
// The status command itself is always allowed, or the report clock could lock
// a session out of the one thing that unlocks it. A single quoted argument, no
// shell expansion, nothing chained — and THIS hub's report.mjs only: the first
// version matched a file of that name in any directory, so a session could
// write its own and run anything past every guard.
const REPORT = new RegExp('^\\s*node\\s+"?' + join(HUB, 'report.mjs').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  + '"?\\s+(?:"(?!-)[^"`$\\\\]*"|\'(?!-)[^\']*\')\\s*$');
// Either quoting is literal to the shell: double quotes with no " ` $ or \
// inside, or single quotes with no ' inside. The first version refused a
// status holding an apostrophe, by the very gate the status was meant to clear.
// A quoted argument starting with "-" is a flag, never a status: quoted, the
// wait below ("--wait") passed as a status, past the latch it does not pass.
// The wait the main thread may make between statuses (report.mjs --wait): this
// hub's report.mjs, that one flag, nothing chained. The manager fence passes
// it; unlike the status command it passes nothing else, the latch included.
const WAIT = new RegExp('^\\s*node\\s+"?' + join(HUB, 'report.mjs').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"?\\s+--wait\\s*$');

/**
 * Is a Bash line the status command?
 * @param {string} cmd  a command line.
 * @returns {boolean} true only for this hub's `report.mjs` with one quoted status
 *   argument and nothing chained (the same test the latch and the fence use).
 */
export const isStatusCommand = (cmd) => REPORT.test(String(cmd ?? ''));
/**
 * Is a Bash line the wait between statuses?
 * @param {string} cmd  a command line.
 * @returns {boolean} true only for this hub's `report.mjs --wait`, nothing chained.
 */
export const isWaitCommand = (cmd) => WAIT.test(String(cmd ?? ''));

// The tools an agent hands its result back with. `StructuredOutput` is the
// plan's name for it; `SubagentHandback` is the name this harness gives the
// same act. Either passes every guard: it writes nothing, and a guard refusing
// it leaves the agent no way to hand back (measured: a handback was refused).
export const AGENT_RETURN = new Set(['StructuredOutput', 'SubagentHandback']);
// The agent types the harness itself defines. Any other type is a custom one,
// whose own definition carries instructions the owner has not read.
export const BUILTIN_AGENT_TYPES = new Set(['general-purpose', 'Explore', 'Plan', 'claude-code-guide']);
// The one page the main thread publishes and writes, in its own scratchpad.
const STATUS_PAGE = 'status/fix-run.html';
const FILE_WRITES = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
// Never reads, whatever plan-guard says of them in plan mode: plan-guard passes
// a read-only agent type and a write to the plans directory, because plan mode
// is FOR those, and the manager fence and the doctrine gate decide them apart.
const NOT_READ = new Set(['Agent', 'Task', 'SendMessage', 'Workflow', 'TaskStop', 'ExitPlanMode', 'EnterPlanMode', ...FILE_WRITES]);
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const safeId = (p) => String(p?.session_id || 'no-session').replace(/[^A-Za-z0-9_-]/g, '_');

/**
 * Is this call a read, as plan-guard.mjs classifies one?
 * @param {object} p  a PreToolUse payload.
 * @returns {boolean} true only when plan-guard.mjs, run with the mode forced to
 *   plan, exits 0 cleanly; a crash, a signal or a refusal is not a read. One
 *   list, never a fork: the manager fence, the plan fence and the doctrine gate
 *   all ask this, and approved-plan-guard.mjs asks plan-guard the same way.
 */
export function planGuardReads(p) {
  const r = spawnSync('node', [join(HUB, 'plan-guard.mjs')], {
    input: JSON.stringify({ ...p, permission_mode: 'plan' }), encoding: 'utf8',
    cwd: p.cwd && existsSync(p.cwd) ? p.cwd : HUB, timeout: 30000,
  });
  return r.status === 0;
}

/**
 * Is this call a read for the main thread's gates?
 * @param {object} p  a PreToolUse payload.
 * @param {(p: object) => boolean} [classify]  the classifier; plan-guard's by default.
 * @returns {boolean} false for every tool in NOT_READ, else the classifier's
 *   answer. The manager fence and the doctrine gate both rely on an agent
 *   dispatch and a plan-file write never counting as a read here.
 */
export function isRead(p, classify = planGuardReads) {
  if (NOT_READ.has(String(p.tool_name ?? ''))) return false;
  return classify(p);
}

/**
 * Is a path inside this session's scratchpad?
 * @param {string} path  a file path.
 * @param {string|undefined} sid  the session id from the payload; a subagent's
 *   payload carries its parent's, which names the same scratchpad.
 * @returns {boolean} true only for a path strictly below
 *   `<tmp>/claude-<uid>/<project>/<sid>/scratchpad/`. The plan fence and the
 *   manager fence's status-page rule both depend on it never matching another
 *   session's scratchpad or the directory itself.
 */
export function inScratchpad(path, sid) {
  if (!sid || !path) return false;
  const t = resolve(String(path));
  const bases = [...new Set(['/tmp', tmpdir()])].map(esc).join('|');
  return new RegExp(`^(?:${bases})/claude-\\d+/[^/]+/${esc(sid)}/scratchpad/.`).test(t);
}

/**
 * Is a path this session's status page source?
 * @param {string} path  a file path.
 * @param {string|undefined} sid  the session id from the payload.
 * @returns {boolean} true only for `status/fix-run.html` directly in this
 *   session's scratchpad. The manager fence lets the main thread write and
 *   publish this one file and no other (Doctrine §7i).
 */
export function isStatusPage(path, sid) {
  if (!inScratchpad(path, sid)) return false;
  return resolve(String(path)).endsWith(`/${sid}/scratchpad/${STATUS_PAGE}`);
}

/**
 * The plan the owner approved, as the approval marker names it.
 * @returns {{path: string, text: string} | null} the plan file and its text,
 *   or null when no marker stands, its file cannot be read, or the file's
 *   sha256 is no longer the hash recorded at approval. The dispatch gate and
 *   the plan fence read their steps, Files and Commands out of this, so a null
 *   must make both refuse rather than allow: a plan edited after approval
 *   grants nothing.
 */
export function approvedPlan() {
  try {
    const mk = JSON.parse(readFileSync(join(homedir(), '.claude', 'APPROVED-PLAN.json'), 'utf8'));
    if (!mk?.plan || !mk.hash) return null;
    const bytes = readFileSync(mk.plan);
    if (createHash('sha256').update(bytes).digest('hex') !== String(mk.hash)) return null;
    return { path: String(mk.plan), text: bytes.toString('utf8') };
  } catch { return null; }
}

/**
 * One `## Heading` section of a plan.
 * @param {string} text  the plan.
 * @param {string} name  the heading's first word or words, e.g. "Steps".
 * @returns {string} the section's body up to the next `##` or `#` heading, or ''.
 */
export function planSection(text, name) {
  const m = String(text ?? '').match(new RegExp(`^## ${esc(name)}\\b[^\\n]*\\n([\\s\\S]*?)(?=^## |^# |$(?![\\s\\S]))`, 'mi'));
  return m ? m[1] : '';
}

/**
 * The step numbers a plan's `## Steps` section defines.
 * @param {string} text  the plan.
 * @returns {number[]} each `N.` that opens a line there; the dispatch gate
 *   refuses a prompt naming a number not in this list.
 */
export function planSteps(text) {
  return [...planSection(text, 'Steps').matchAll(/^(\d+)\.\s/gm)].map((m) => Number(m[1]));
}

/**
 * The goal numbers a plan's `## Goals` section defines.
 * @param {string} text  the plan.
 * @returns {number[]} each `N.` that opens a line of that section; the numbers
 *   a `Served by:` line may name.
 */
export function planGoalNumbers(text) {
  return [...planSection(text, 'Goals').matchAll(/^(\d+)\.\s/gm)].map((m) => Number(m[1]));
}

/**
 * Which goals each step of a plan serves, as its `Served by:` line says.
 * @param {string} text  the plan.
 * @returns {Map<number, number[]>} step number to the goal numbers it serves.
 *   Read from the first line of the `## Goals` section that begins `Served by:`,
 *   as clauses split on `;`, each "step(s) <numbers> serve(s) goal(s) <numbers>",
 *   with `and`, commas and `N to M` ranges between numbers. A goal number the
 *   section does not define is dropped, so a step that names only a goal that
 *   does not exist serves none; a clause of any other shape names nothing. A step
 *   absent from the map, or mapped to [], serves no goal, and the plan guard and
 *   the dispatch gate (`goalsProblem`, `dispatchGate`) refuse it.
 */
export function servedBy(text) {
  const goals = new Set(planGoalNumbers(text));
  const out = new Map();
  const line = planSection(text, 'Goals').split('\n').find((l) => /^Served by:/.test(l));
  if (!line) return out;
  const numbers = (s) => {
    const list = [];
    for (const x of String(s).matchAll(/(\d+)(?:\s*(?:to|-|–)\s*(\d+))?/g)) {
      const a = Number(x[1]), b = x[2] ? Number(x[2]) : a;
      for (let n = a; n <= b && n - a < 500; n++) list.push(n);
    }
    return list;
  };
  for (const clause of line.replace(/^Served by:\s*/, '').replace(/\.\s*$/, '').split(';')) {
    const m = /^\s*steps?\s+(.+?)\s+serves?\s+goals?\s+(.+?)\s*$/i.exec(clause);
    if (!m) continue;
    const served = numbers(m[2]).filter((n) => goals.has(n));
    for (const step of numbers(m[1])) out.set(step, [...new Set([...(out.get(step) ?? []), ...served])]);
  }
  return out;
}

/**
 * Does a plan carry the standing goals, and does every step serve one?
 * @param {string} text  the plan (its current block, not a file of old plans).
 * @param {string} [block]  the standing goals block to find in it; the hub
 *   CLAUDE.md's by default (`goalsBlock`). Passed by the test.
 * @returns {string|null} the refusal, or null when the plan's `## Goals`
 *   section contains the block word for word (trailing spaces on a line set
 *   aside), has a line beginning `Served by:`, and that line names, for every
 *   number in `## Steps`, at least one goal the section defines. The refusal
 *   names what is missing and, for steps, each step that serves none. An empty
 *   `block` is a refusal too: with no standing block to quote, the guard fails
 *   closed rather than passing every plan. The plan guard (ExitPlanMode)
 *   refuses on it (Doctrine §0e rule 16).
 */
export function goalsProblem(text, block = goalsBlock()) {
  const head = 'GOALS (Doctrine §0e rule 16):';
  if (!block) return `${head} the hub CLAUDE.md beside this guard has no "## Goals every session serves" section with numbered goals, so there is no standing block for the plan to quote. Restore the section; do not weaken this check.`;
  const section = planSection(text, 'Goals');
  if (!section.trim()) return `${head} the plan has no "## Goals" section. It quotes the hub CLAUDE.md's goals block word for word, may add goals from the app's own roadmap, and ends with a "Served by:" line naming the goals each step serves.`;
  const tidy = (s) => String(s).replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n');
  if (!tidy(section).includes(tidy(block))) {
    return `${head} the plan's "## Goals" section does not contain the hub CLAUDE.md's standing goals block word for word. Quote this block, whole and unchanged (a goal of the app's own may come before it):\n${block}`;
  }
  if (!/^Served by:/m.test(section)) return `${head} the plan's "## Goals" section has no line beginning "Served by:". It names, for every step, the goals it serves: "Served by: steps 1 and 2 serve goal 1; step 3 serves goals 2 and 3."`;
  const served = servedBy(text);
  const none = planSteps(text).filter((n) => !served.get(n)?.length);
  if (none.length) return `${head} the plan's "Served by:" line names no goal that the Goals section defines for step${none.length === 1 ? '' : 's'} ${none.join(', ')}. A step that serves no goal is not in the plan.`;
  return null;
}

/**
 * The entries of a plan's `## Commands` section.
 * @param {string} text  the plan.
 * @returns {string[]} one entry per `- ` line, trimmed, backticks removed; the
 *   plan fence lets an agent's command segment through when it begins with one.
 */
export function planCommands(text) {
  return [...planSection(text, 'Commands').matchAll(/^\s*-\s+(.+?)\s*$/gm)].map((m) => m[1].replace(/`/g, '').trim()).filter(Boolean);
}

/**
 * The paths a plan's `## Files…` section names, each tied to its repo.
 * @param {string} text  the plan.
 * @returns {{repo: string|null, path: string}[]} every code-formatted span
 *   there with no whitespace in it — a repo-relative file (`hook-dispatch.mjs`),
 *   a directory ending in `/` (`src/`), or an absolute path — with the label
 *   its line opens with (`- Hub, new: …` gives "Hub", `- JPS: …` gives "JPS"),
 *   or null on a line with no label. Prose names nothing. The plan fence lets
 *   an agent write a relative entry only inside the repo its label names, and
 *   an unlabelled relative entry nowhere.
 */
export function planFiles(text) {
  const out = [];
  for (const line of planSection(text, 'Files').split('\n')) {
    const label = /^\s*-\s*([^:`\n]+?)\s*:/.exec(line)?.[1]?.split(',')[0]?.trim() || null;
    for (const m of line.matchAll(/`([^`\s]+)`/g)) out.push({ repo: label, path: m[1] });
  }
  return out;
}

/**
 * Does a Files label name this repository?
 * @param {string|null} label  a Files line's label ("Hub", "JPS", a repo name).
 * @param {string} root  a repository's root directory.
 * @returns {boolean} true when the label, compared case-blind, is the root's
 *   directory name, the initials of its hyphen- or underscore-separated words
 *   (Jefferson-Photography-Studio is JPS), or "hub" for the root that holds
 *   both DOCTRINE.md and hook-dispatch.mjs. The plan fence never asks this of
 *   the live gate copy, which no label opens.
 */
export function labelNames(label, root) {
  if (!label || !root) return false;
  const want = String(label).trim().toLowerCase();
  const name = basename(root);
  const words = name.split(/[-_.\s]+/).filter(Boolean);
  if (want === name.toLowerCase()) return true;
  if (words.length > 1 && want === words.map((w) => w[0]).join('').toLowerCase()) return true;
  return want === 'hub' && existsSync(join(root, 'DOCTRINE.md')) && existsSync(join(root, 'hook-dispatch.mjs'));
}

// ---- the refusal latch (Doctrine §0d, §0e) ----
// The main thread's latch is the session's file; a refusal INSIDE an agent is
// written under that agent's id, so the other agents and the main thread are
// not held by it (measured three times on 2026-10-04: one agent's refused first
// command ended the other agent's run and cost the owner a message).
const latchFile = (p, agent = '') => join(process.env.REFUSAL_LATCH_DIR || join(homedir(), '.claude', 'refusal-latch'),
  `${safeId(p)}${agent ? `.agent-${String(agent).replace(/[^A-Za-z0-9_-]/g, '_')}` : ''}.json`);

const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/**
 * When an owner message was TYPED, which is not when it was delivered.
 * @param {object[]} entries  transcript entries in file order.
 * @param {number} i  the index of an entry `isOwnerMessage` accepts.
 * @returns {number} ms: the time of the latest queue `enqueue` before it whose
 *   words it carries (the harness writes one the moment a message is sent,
 *   and delivers it later, between tool calls or as the next prompt), matched
 *   as pending-guard.mjs matches a delivery; the entry's own time when no
 *   enqueue carries it; NaN when neither is readable. The latch compares this,
 *   so a message typed before a refusal and delivered after it clears nothing.
 */
export function typedAt(entries, i) {
  const t = norm(textOf(entries[i]));
  for (let j = i - 1; t && j >= 0; j--) {
    const e = entries[j];
    if (e?.type !== 'queue-operation' || e.operation !== 'enqueue' || typeof e.content !== 'string') continue;
    const k = norm(e.content);
    if (k && (t.includes(k) || (k.includes(t) && t.length > 40))) return Date.parse(e.timestamp ?? '');
  }
  return Date.parse(entries[i]?.timestamp ?? '');
}

/**
 * The refusal latch standing for this call.
 * @param {object} p  a hook payload: `session_id` names the latch, `agent_id`
 *   (when the call is a subagent's) names its own, and `transcript_path` is
 *   read for the owner's answer to the session's latch.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @returns {{at: number, tool: string, agent: string|null, reason: string, own?: boolean} | null}
 *   the latch, or null when none stands. THE MAIN THREAD'S latch (the session's
 *   file) holds every call, an agent's included, and is cleared ONLY by a
 *   message `isOwnerMessage` accepts whose TYPED time (`typedAt`) is after the
 *   latch's; this removes the file then and returns null. A task notification,
 *   a scheduled message, a subagent's hand-back, a message typed before the
 *   refusal and an unreadable transcript clear nothing. A SUBAGENT'S OWN latch
 *   (`own: true`, the file written under its id after a refusal inside it)
 *   holds that agent alone: the main thread and every other agent pass it, and
 *   nothing clears it, because the agent's one move is its own return, which
 *   passes every guard. stop-guard.mjs relies on this to let a latched session stop.
 */
export function latchStanding(p, entries) {
  if (p.agent_id) {
    try {
      const a = JSON.parse(readFileSync(latchFile(p, p.agent_id), 'utf8'));
      return { at: Number(a?.at) || 0, tool: String(a.tool ?? ''), agent: String(p.agent_id), reason: String(a.reason ?? ''), own: true };
    } catch { /* no latch of its own: the session's is read below */ }
  }
  let l;
  try { l = JSON.parse(readFileSync(latchFile(p), 'utf8')); } catch { return null; }
  const at = Number(l?.at) || 0;
  const list = entries ?? tailEntries(p.transcript_path ?? '', 16 * 1024 * 1024);
  if (list.some((e, i) => isOwnerMessage(e) && typedAt(list, i) > at)) {
    rmSync(latchFile(p), { force: true });
    return null;
  }
  return { at, tool: String(l.tool ?? ''), agent: l.agent ?? null, reason: String(l.reason ?? '') };
}

/**
 * Set the latch after a PreToolUse refusal.
 * @param {object} p  the refused call's payload.
 * @param {string} reason  the refusal's text.
 * @returns {boolean} true when a latch was written; false when one already
 *   stands, which is never moved: a later time would make an owner message
 *   sent between the two fail to clear it. A refusal inside an agent writes
 *   that agent's own latch and never the session's, so the main thread and the
 *   other agents are not held; one on the main thread writes the session's.
 */
export function setLatch(p, reason) {
  if (p.agent_id) {
    const own = latchFile(p, p.agent_id);
    if (existsSync(own)) return false;
    mkdirSync(dirname(own), { recursive: true });
    writeFileSync(own, JSON.stringify({ at: Date.now(), tool: p.tool_name ?? '', agent: String(p.agent_id), reason: String(reason).slice(0, 1200) }, null, 1));
    return true;
  }
  if (latchStanding(p)) return false;
  const f = latchFile(p);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify({ at: Date.now(), tool: p.tool_name ?? '', agent: null, reason: String(reason).slice(0, 1200) }, null, 1));
  return true;
}

/**
 * The latch's own refusal.
 * @param {{at: number, tool: string, agent: string|null, reason: string, own?: boolean}} l  the latch.
 * @returns {string} names the original refusal and says what to do: say what
 *   was refused and stop, or, for an agent's own latch, return with the
 *   refusal's text.
 */
export function latchMessage(l) {
  if (l.own) {
    return `REFUSAL LATCH (Doctrine §0d, §0e): a call of this subagent (${l.agent}) was refused at ${californiaTime(new Date(l.at))} (California), `
      + 'and every later call of it is refused except its own return. The main thread and the other agents are not held.\n'
      + `The original refusal, of ${l.tool || 'a call'}:\n${l.reason}\n`
      + 'Return what you have, with the refusal\'s text. Another command, tool or wording for the same end is a second route, not a fresh start.';
  }
  return `REFUSAL LATCH (Doctrine §0d, §0e): a call was refused at ${californiaTime(new Date(l.at))} (California)`
    + `${l.agent ? ` in subagent ${l.agent}` : ''}, and that route stays closed until the owner's next message.\n`
    + `The original refusal, of ${l.tool || 'a call'}:\n${l.reason}\n`
    + 'Until the owner writes again every call is refused except the status command, the main thread\'s TaskStop (so it can stop what it started) and a subagent\'s own return. '
    + 'Say in plain text what was refused, and stop. A subagent returns what it has, with the refusal\'s text. '
    + 'Another command, tool or wording for the same end is a second route, not a fresh start.';
}

// ---- a correction from the owner ends the turn (Doctrine §0e rule 3) ----

/**
 * The go-words: the declared list of what an owner message may END with and
 * still not be a correction. To start with: go, ok, continue, approved, yes.
 * The list is the owner's to extend; a session never adds to it.
 */
export const GO_WORDS = ['go', 'ok', 'continue', 'approved', 'yes'];

/**
 * Does a message end with a go-word?
 * @param {string} text  an owner message.
 * @returns {boolean} true when, with case and punctuation set aside, the
 *   message's LAST word is an entry of GO_WORDS ("Go.", "OK!", "all of that,
 *   go" and "yes, approved." are; "go ahead", "ok but" and "yes, and also" are
 *   not, because their last word is not one). A first version took the go-word
 *   only as the WHOLE message, and the owner's own go messages carry a word
 *   before it. Everything else is a correction (`correctionStanding`), and held
 *   work is sent again only after a message that ends with a go-word.
 */
export function endsWithGoWord(text) {
  const words = String(text ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ');
  return GO_WORDS.includes(words[words.length - 1]);
}

const ownerTurnFile = (p) => join(process.env.OWNER_TURN_DIR || join(homedir(), '.claude', 'owner-turn'), `${safeId(p)}.json`);

/**
 * Record, at UserPromptSubmit, whether the prompt just delivered ends with a go-word.
 * @param {object} p  the UserPromptSubmit payload: `prompt` is what arrived.
 * @returns {boolean} true when a record was written; false for an empty prompt
 *   or one opening with a harness tag (a task notification, an agent's
 *   hand-back), which is not the owner's. The record is `correctionStanding`'s
 *   fallback for a transcript it cannot read; it never overrides a readable one.
 */
export function recordOwnerTurn(p) {
  const prompt = typeof p.prompt === 'string' ? p.prompt : '';
  if (!prompt.trim() || HARNESS_TAG.test(prompt)) return false;
  const f = ownerTurnFile(p);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify({ at: Date.now(), go: endsWithGoWord(prompt) }));
  return true;
}

/**
 * The correction standing for this session, if the owner's newest message is one.
 * @param {object} p  a PreToolUse payload: `transcript_path` is read.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @returns {{at: number} | null} the correction, with the time the message was
 *   written in ms, or null. The owner's newest message is the newest entry
 *   `isOwnerMessage` accepts (a prompt, or a message delivered between tool
 *   calls, which UserPromptSubmit never sees), read from a tail that widens
 *   (2, 8, then 32 MB) until it holds one. It is a correction unless it ends
 *   with a go-word (`endsWithGoWord`). A transcript that cannot be read falls back to the record
 *   UserPromptSubmit wrote; none known is no correction. A task notification,
 *   a scheduled message and an agent's hand-back are not messages from the owner.
 *   The refusal built on this never quotes the message.
 */
export function correctionStanding(p, entries) {
  let last = null;
  let readable = false;
  if (entries) { readable = entries.length > 0; last = lastOwnerMessage(entries); }
  else for (const mb of [2, 8, 32]) {
    const tail = tailEntries(p.transcript_path ?? '', mb * 1024 * 1024);
    readable ||= tail.length > 0;
    last = lastOwnerMessage(tail);
    if (last) break;
  }
  if (last) return endsWithGoWord(last.text) ? null : { at: last.at };
  if (readable) return null;
  try {
    const r = JSON.parse(readFileSync(ownerTurnFile(p), 'utf8'));
    return r && r.go === false ? { at: Number(r.at) || 0 } : null;
  } catch { return null; }
}

/**
 * The refusal while a correction stands.
 * @param {{at: number}} c  from `correctionStanding`.
 * @returns {string} names the rule, says to answer in plain text and end the
 *   turn, names what passes (a read of the record, the status command and
 *   TaskStop) and what is held, and prints the go-word list. It never quotes
 *   what the owner wrote.
 */
export function correctionMessage(c) {
  return `CORRECTION (Doctrine §0e rule 3): the owner's newest message${c.at ? `, written ${californiaTime(new Date(c.at))} (California),` : ''} does not end with a go-word, so it is a correction, and a correction is a full stop for actions. `
    + 'No action runs on the main thread until the owner writes again: answer every point in it in plain text and end the turn. '
    + 'A question is answered from the record in the turn it is asked, so a read of the record (the plans, the session scratchpad, the doctrine and lessons, each repo\'s notes and plan pointers, this session\'s transcript), '
    + 'the status command and TaskStop pass; every other call is held, an agent dispatch, a write and a read of an app\'s source among them. '
    + `A message whose last word is one of these lifts it: ${GO_WORDS.join(', ')}. `
    + 'Held work is sent again only in a turn that follows one.';
}

// ---- the manager fence and the dispatch gate (Doctrine §0e) ----

/**
 * The dispatch gate: what an agent is told is only a plan path and a step.
 * @param {object} p  a main-thread Agent, Task or SendMessage call.
 * @param {{path: string, text: string} | null} [plan]  the approved plan.
 * @returns {string|null} the refusal, or null when the prompt (a message, for
 *   SendMessage) is exactly the approved plan's path and the number of a step
 *   in its `## Steps`, optionally with the word "step" between them, and the
 *   agent's type, when one is named, is one the harness defines
 *   (BUILTIN_AGENT_TYPES), and the plan's `Served by:` line names a goal for
 *   that step (`servedBy`: a step that serves none is not sent, Doctrine §0e
 *   rule 16). Anything else would carry instructions the owner has not read:
 *   other words in the prompt, or a custom type's own definition.
 *   THE POINTER: when the plan defines one (an `Order:` line under `## Order`,
 *   report.mjs `planOrder`), the only steps sent are N, the first number in Order
 *   with no DONE hand-back, and the plan's Standing steps; any other step is
 *   refused and the refusal prints N (`next: step N`, or `next: none` once every
 *   step in Order has a DONE hand-back, when only a Standing step may go). A plan
 *   with no `## Order`, and a session whose agents cannot be read, carry no
 *   pointer to enforce, and the checks above are all that apply.
 *   EVERY refusal ends with the approval state read from disk now
 *   (`approvalBlock` in report.mjs): the marker or none, the plan, hash and
 *   time it holds, the plan file's hash and last write, and whether they
 *   match. After the owner pressed approval in the app the gate refused with
 *   only "no approved plan is in force", and the session could not see why.
 * @param {object|null|undefined} [pointer]  report.mjs `pointerOf`'s answer, passed
 *   by the test; read from the session's agents (`pointerFor`) when undefined,
 *   and null means no pointer to enforce.
 */
export function dispatchGate(p, plan = approvedPlan(), pointer = undefined) {
  const input = p.tool_input ?? {};
  const said = p.tool_name === 'SendMessage' ? (input.message ?? input.prompt ?? input.content) : input.prompt;
  const head = 'DISPATCH GATE (Doctrine §0e): an agent\'s prompt is only the approved plan\'s path and a step number, so everything an agent is told is in the plan the owner read.';
  const refusal = (t) => `${t}\n${approvalBlock()}`;
  const type = p.tool_name === 'SendMessage' ? '' : String(input.subagent_type ?? '');
  if (type && !BUILTIN_AGENT_TYPES.has(type)) {
    return refusal(`${head} "${type}" is a custom agent type, and a custom type carries instructions of its own. Send one of: ${[...BUILTIN_AGENT_TYPES].join(', ')}.`);
  }
  if (!plan) return refusal(`${head} No approved plan is in force, so no agent can be sent.`);
  const m = typeof said === 'string' ? new RegExp(`^\\s*${esc(plan.path)}\\s+(?:step\\s+)?(\\d+)\\s*$`, 'i').exec(said) : null;
  if (!m) return refusal(`${head} Send exactly: ${plan.path} step <n>`);
  if (!planSteps(plan.text).includes(Number(m[1]))) return refusal(`${head} The plan has no step ${m[1]}; its steps are ${planSteps(plan.text).join(', ') || 'none'}.`);
  // A STEP THAT SERVES NO GOAL IS NOT SENT (Doctrine §0e rule 16): the plan's
  // "Served by:" line has to name, for this step, a goal its Goals section defines.
  if (!servedBy(plan.text).get(Number(m[1]))?.length) {
    return refusal(`${head} The plan's "Served by:" line names no goal for step ${m[1]}, so the step serves none and is not sent. The line is in the plan's "## Goals" section (Doctrine §0e rule 16).`);
  }
  // THE POINTER (Doctrine §0e rule 13): only step N and a Standing step are
  // sent. N is read from the agents' own hand-backs, never from the session.
  let ptr = pointer;
  if (ptr === undefined) { try { ptr = pointerFor(p, plan.text); } catch { ptr = null; } }
  if (ptr && Number(m[1]) !== ptr.next && !ptr.standing.includes(Number(m[1]))) {
    const standing = ptr.standing.length ? `Standing step${ptr.standing.length === 1 ? '' : 's'} ${ptr.standing.join(', ')}` : 'no Standing step';
    return refusal(`${head} The pointer reads ${ptr.next === null ? 'next: none (every step in Order has a DONE hand-back)' : `next: step ${ptr.next}`}. `
      + `Step ${m[1]} is neither that step nor a Standing step, so it is not sent now. ${ptr.next === null ? `Only ${standing} may be sent.` : `Send ${plan.path} step ${ptr.next}, or ${standing}.`} `
      + 'A step becomes next only when an agent hands back for the step before it with DONE as the first line; a REFUSED or FAILED hand-back leaves it where it is.');
  }
  return null;
}

// ---- what a read on the main thread may be of (Doctrine §0e rule 13) ----

// A reader that opens no file of its own: with no file operand it reads nothing.
const READS_NO_FILE = new Set(['date', 'true', 'echo', 'printf', 'pwd', 'test', '[', 'which', 'type']);
// A repository's files through the GitHub connector: a source file by another door.
const SOURCE_READS = new Set(['mcp__github__get_file_contents', 'mcp__github__search_code']);
const GLOB_CHAR = /[*?[\]{}]/;
const pathLike = (w) => /^(?:\/|~|\.\.?(?:\/|$))/.test(w) || w.includes('/');
const absOf = (w, cwd) => resolve(cwd || process.cwd(), /^~(?=\/|$)/.test(w) ? w.replace(/^~/, homedir()) : w);
const READ_FENCE = 'MANAGER FENCE (Doctrine §0e rule 13): the main thread reads only the record: the approved plan and the plans folder, '
  + 'the session scratchpad, the hub\'s DOCTRINE.md, LESSONS.md, lessons/ and plans/, each repo\'s CLAUDE.md, NOTES.md, .plan-scope, '
  + '.claude/PLAN and .branch-guard, this session\'s transcript and the live clone\'s doctrine. ';

/**
 * The git repository a path sits in.
 * @param {string} abs  an absolute path.
 * @returns {string|null} the nearest ancestor directory (the path itself is
 *   not one) holding a `.git`, or null when none does. A repository's own root
 *   directory has no repository above it here, so it is never "of" the record.
 */
function repoRootOf(abs) {
  for (let d = dirname(abs); ; d = dirname(d)) {
    if (existsSync(join(d, '.git'))) return d;
    if (dirname(d) === d) return null;
  }
}

/**
 * Is a path of the record the main thread may read?
 * @param {string} abs  a path; it is resolved, so a `..` cannot step outside.
 * @param {object} p  the payload: `session_id` names the scratchpad and the
 *   transcript, `transcript_path` is this session's own transcript.
 * @param {() => string|undefined} [planPath]  the approved plan's path, asked
 *   only when no other rule has decided.
 * @returns {boolean} true only for: a path in this session's scratchpad (or the
 *   scratchpad itself); a file directly under `~/.claude/plans/` (or the folder)
 *   or the approved plan wherever it is; this hub's DOCTRINE.md or the live
 *   clone's; this session's transcript (`transcript_path`, or
 *   `~/.claude/projects/<project>/<session>.jsonl`); in any repository its
 *   CLAUDE.md, NOTES.md, .plan-scope, .claude/PLAN and .branch-guard; and in a
 *   hub (this one, the live clone, or a root holding DOCTRINE.md and
 *   hook-dispatch.mjs) its DOCTRINE.md, LESSONS.md and everything under
 *   lessons/ and plans/. Everything else, an app's source and tools above all, is false.
 *   The manager fence refuses a read of anything for which this is false.
 */
export function recordPath(abs, p, planPath) {
  const a = resolve(String(abs));
  const dot = join(homedir(), '.claude');
  if (inScratchpad(join(a, '_'), p.session_id)) return true;
  if (a === join(dot, 'plans') || dirname(a) === join(dot, 'plans')) return true;
  const plan = planPath?.();
  if (plan && a === resolve(String(plan))) return true;
  if (a === join(dot, 'hub', 'DOCTRINE.md') || a === join(HUB, 'DOCTRINE.md')) return true;
  if (p.transcript_path && a === resolve(String(p.transcript_path))) return true;
  if (p.session_id && dirname(dirname(a)) === join(dot, 'projects') && basename(a) === `${p.session_id}.jsonl`) return true;
  const root = repoRootOf(a);
  if (!root) return false;
  const rel = relative(root, a);
  if (['CLAUDE.md', 'NOTES.md', '.plan-scope', '.claude/PLAN', '.branch-guard'].includes(rel)) return true;
  const hub = root === HUB || root === join(dot, 'hub') || (existsSync(join(root, 'DOCTRINE.md')) && existsSync(join(root, 'hook-dispatch.mjs')));
  if (!hub) return false;
  return rel === 'DOCTRINE.md' || rel === 'LESSONS.md' || ['lessons', 'plans'].some((d) => rel === d || rel.startsWith(`${d}/`));
}

/**
 * The file a Bash read names that is not of the record.
 * @param {string} command  a Bash line the read classifier already called a read.
 * @param {string} cwd  the directory its relative words resolve against.
 * @param {(w: string) => boolean} of  `recordPath` for a word of the line.
 * @returns {string|null} null when every file the line names is of the record
 *   and each command in it names one (or reads a pipe, or is a reader that
 *   opens no file: date, echo, pwd); otherwise a clause saying what is not of
 *   the record: the first word that is not, or a command that names no file of
 *   it. A word with
 *   a `$` or a backtick cannot be resolved to a file and is refused. A word is a
 *   file when it looks like a path (`/`, `~`, `./`, a slash inside it), the
 *   value of a `--flag=value`, or a bare word that exists under `cwd`.
 */
function bashOutsideRecord(command, cwd, of) {
  const text = command.replace(/2>&1|>&2|&>\s*\/dev\/null|2?>\s*\/dev\/null/g, ' ');
  const segs = [];
  let words = [], cur = '', has = false, q = '', prevPipe = false;
  const endWord = () => { if (has) words.push(cur); cur = ''; has = false; };
  const flush = (op) => { endWord(); if (words.length) segs.push({ words, piped: prevPipe }); words = []; prevPipe = op === '|'; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q === "'") { if (c === "'") q = ''; else { cur += c; has = true; } continue; }
    if (c === '\\') { cur += text[i + 1] ?? ''; has = true; i++; continue; }
    if (c === '$' || c === '`') return 'a command with a $ or a backtick in it cannot be resolved to a file';
    if (q === '"') { if (c === '"') q = ''; else { cur += c; has = true; } continue; }
    if (c === "'" || c === '"') { q = c; has = true; continue; }
    if (c === '\n') { flush(';'); continue; }
    if (/\s/.test(c) || c === '<') { endWord(); continue; }
    if (c === '|') { flush(text[i + 1] === '|' ? ';' : '|'); if (text[i + 1] === '|') i++; continue; }
    if (c === ';' || c === '(' || c === ')' || c === '&') { flush(';'); if (c === '&' && text[i + 1] === '&') i++; continue; }
    cur += c; has = true;
  }
  flush(';');
  for (const { words: ws, piped } of segs) {
    let named = 0;
    for (const raw of ws.slice(1)) {
      let w = raw;
      if (w.startsWith('-')) { const eq = w.indexOf('='); if (eq < 0) continue; w = w.slice(eq + 1); if (!w) continue; }
      if (w === '/dev/null') continue;
      if (pathLike(w)) { if (!of(w)) return `${w} is not of the record`; named++; continue; }
      let there = false;
      try { there = existsSync(absOf(w, cwd)); } catch { there = false; }
      if (there) { if (!of(w)) return `${w} is not of the record`; named++; }
    }
    if (!named && !piped && !READS_NO_FILE.has(ws[0])) return `"${ws[0]}" names no file of the record, so it reads the working directory`;
  }
  return null;
}

/**
 * The target of a read that is not of the record.
 * @param {object} p  a main-thread PreToolUse payload the read classifier called a read.
 * @param {() => string|undefined} [planPath]  the approved plan's path, for `recordPath`.
 * @returns {string|null} null when the call names no file (ToolSearch, TaskList,
 *   Skill, a web read) or every file it names is of the record (`recordPath`);
 *   otherwise a clause saying what is not of it (the path, or that the call
 *   names no file), which `managerFence` puts in the refusal. A Read is judged by its file, a Grep by its path (the working
 *   directory when it gives none), a Glob by the fixed part of its pattern
 *   under its path, a Bash line by each file it names (`bashOutsideRecord`), and
 *   the connector's file contents and code search are never of the record.
 *   `managerFence` refuses on the answer and says to send an agent.
 */
export function readOutsideRecord(p, planPath) {
  const tool = String(p.tool_name ?? '');
  const input = p.tool_input ?? {};
  const cwd = p.cwd ? String(p.cwd) : process.cwd();
  const of = (w) => recordPath(absOf(w, cwd), p, planPath);
  if (SOURCE_READS.has(tool)) return `${tool} reads a repository's file through the connector`;
  if (tool === 'Read') {
    const f = String(input.file_path ?? input.path ?? '');
    return f && of(f) ? null : (f ? `${f} is not of the record` : 'a Read names no file');
  }
  if (tool === 'Grep') {
    const f = String(input.path ?? '');
    return of(f || cwd) ? null : `${f || `the working directory ${cwd}`} is not of the record`;
  }
  if (tool === 'Glob') {
    const pat = String(input.pattern ?? '');
    const fixed = [];
    for (const s of pat.split('/')) { if (GLOB_CHAR.test(s)) break; fixed.push(s); }
    const at = fixed.join('/');
    const target = /^[/~]/.test(pat) ? (at || '/') : join(String(input.path ?? cwd), at);
    return of(target) ? null : `${target} is not of the record`;
  }
  if (tool === 'Bash') return bashOutsideRecord(String(input.command ?? ''), cwd, of);
  return null;
}

/**
 * Is this call a read of the record, the one kind of call a correction lets through?
 * @param {object} p  a main-thread PreToolUse payload.
 * @param {{classify?: (p: object) => boolean, plan?: {path: string}|null}} [opts]  the
 *   read classifier and the approved plan, for the test, as `managerFence` takes them.
 * @returns {boolean} true only when the read classifier calls the call a read
 *   (`isRead`) and nothing it names is outside the record (`readOutsideRecord`
 *   is null): exactly the calls the manager fence passes as reads, so a
 *   correction and the narrowed fence cannot disagree about what a read is. An
 *   agent dispatch, a write, a SendUserFile, plan mode and a read of an app's
 *   source are all false. `hook-dispatch.mjs` lifts a standing correction for a
 *   call this calls true, and for no other.
 */
export function readOfRecord(p, opts = {}) {
  if (!isRead(p, opts.classify ?? planGuardReads)) return false;
  return readOutsideRecord(p, () => ('plan' in opts ? opts.plan : approvedPlan())?.path) === null;
}

/**
 * The files a SendUserFile call names.
 * @param {unknown} v  the tool's input, or a part of it.
 * @param {string} [key]  the key `v` sits under.
 * @param {string[]} [out]  the list built so far.
 * @returns {string[]} every string in the input that sits under a key named
 *   file, files, file_path, file_paths, path, paths or attachments, or that
 *   begins with `/`, `~/`, `./` or `../`, at any depth. The tool's own shape was
 *   not known when this was written, so it reads every shape a path could be in;
 *   `managerFence` passes the call only when this is not empty and every one is
 *   in the session scratchpad.
 */
function filesNamed(v, key = '', out = []) {
  if (typeof v === 'string') {
    if (/^(?:files?|file_?paths?|paths?|attachments?)$/i.test(key) || /^(?:\/|~\/|\.\.?\/)/.test(v)) out.push(v);
  } else if (Array.isArray(v)) {
    for (const x of v) filesNamed(x, key, out);
  } else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) filesNamed(x, k, out);
  }
  return out;
}

/**
 * The manager fence: the main thread plans, sends agents, checks and reports.
 * @param {object} p  a PreToolUse payload.
 * @param {{classify?: (p: object) => boolean, plan?: object|null, pointer?: object|null}} [opts]
 *   the read classifier (plan-guard's), the approved plan and the pointer
 *   (`dispatchGate`'s third argument), for the test.
 * @returns {string|null} null for a subagent's call; on the main thread, null
 *   only for a read OF THE RECORD (`readOutsideRecord`: a read of a file or a
 *   directory passes only where `recordPath` says it is of the record, and a
 *   read of anything else is refused with the reason to send an agent; a read
 *   that names no file, ToolSearch or a web read, passes as before), a
 *   SendUserFile of files that `inScratchpad` places in this session's
 *   scratchpad (one file elsewhere refuses the call), an agent sent through the
 *   dispatch gate, TaskStop, an
 *   Artifact publish of the status page (or a read, list or open; never a
 *   quickstart), a write to
 *   a plan file directly under ~/.claude/plans/ or to the status page's source
 *   (`isStatusPage`), EnterPlanMode or ExitPlanMode, the wait between
 *   statuses, `node <this hub>/report.mjs --wait` exactly (WAIT) — the
 *   status command never reaches this. EnterPlanMode must pass, or no plan could be
 *   amended once the fence stands. Everything else, a Workflow included, is
 *   refused with the reason.
 */
export function managerFence(p, opts = {}) {
  if (p.agent_id) return null;
  const tool = String(p.tool_name ?? '');
  const input = p.tool_input ?? {};
  const head = `MANAGER FENCE (Doctrine §0e): the main thread plans, sends agents, checks their results and reports; it does no work itself. ${tool} is not one of those.`;
  if (tool === 'Agent' || tool === 'Task' || tool === 'SendMessage') return dispatchGate(p, 'plan' in opts ? opts.plan : approvedPlan(), 'pointer' in opts ? opts.pointer : undefined);
  if (tool === 'Workflow') return 'DISPATCH GATE (Doctrine §0e): a workflow is refused, so no script of the session\'s carries instructions the owner has not read. Send an agent with the plan\'s path and a step number.';
  if (tool === 'TaskStop' || tool === 'ExitPlanMode' || tool === 'EnterPlanMode') return null;
  // The main thread may not end its turn while an agent runs, and none of its
  // other calls can wait: this one does, and returns on what it waits for.
  if (tool === 'Bash' && WAIT.test(String(input.command ?? ''))) return null;
  if (tool === 'Artifact') {
    const a = String(input.action ?? 'publish');
    // Never quickstart: neither the plan nor rule 13 names it, and it starts
    // new work rather than reading or publishing the status page.
    if (['read', 'list', 'open'].includes(a)) return null;
    const plain = !input.asset && !input.files && !input.file_paths && !input.type_url && !input.from_url && !input.asset_ids;
    if (a === 'publish' && plain && isStatusPage(input.file_path, p.session_id)) return null;
    return `${head} On the main thread Artifact publishes the status page only, ${STATUS_PAGE} in this session's scratchpad, or reads, lists or opens a page (Doctrine §7i).`;
  }
  if (FILE_WRITES.has(tool)) {
    const f = String(input.file_path ?? input.notebook_path ?? '');
    if (f && f.endsWith('.md') && dirname(resolve(f)) === resolve(homedir(), '.claude', 'plans')) return null;
    if (f && isStatusPage(f, p.session_id)) return null;
    return `${head} The main thread writes only its plan file and the status page's source (${STATUS_PAGE} in the session scratchpad); ${f || 'this file'} is written by an agent sent with a plan step.`;
  }
  // A choice between pictures carries its pictures in the same message as the
  // question (Doctrine §2): the main thread sends the owner files from this
  // session's scratchpad, and no other file.
  if (tool === 'SendUserFile') {
    const cwd = p.cwd ? String(p.cwd) : process.cwd();
    const named = filesNamed(input);
    const outside = named.filter((f) => !inScratchpad(absOf(f, cwd), p.session_id));
    if (named.length && !outside.length) return null;
    return `MANAGER FENCE (Doctrine §2, §0e): the main thread sends the owner files only from this session's scratchpad, so a choice between pictures carries its pictures. `
      + `${named.length ? `${outside[0]} is not in it` : 'This call names no file'}; a file elsewhere is copied into the scratchpad by an agent sent with a plan step.`;
  }
  if (isRead(p, opts.classify ?? planGuardReads)) {
    // A READ PASSES ONLY OF THE RECORD (Doctrine §0e rule 13): the manager reads
    // what it manages by, and diagnosing from an app's source is an agent's work.
    const outside = readOutsideRecord(p, () => ('plan' in opts ? opts.plan : approvedPlan())?.path);
    return outside === null ? null : `${READ_FENCE}${outside}. Send an agent with the approved plan's path and a step number to read it.`;
  }
  return `${head} It is not a read; send an agent with the approved plan's path and a step number.`;
}

/**
 * Write the user-level wiring.
 * @returns {string} the settings file written. Existing hooks from other
 *   sources are kept; any earlier hook-dispatch entry is replaced, so running
 *   it on every session start never stacks duplicates.
 */
export function install() {
  const file = join(homedir(), '.claude', 'settings.json');
  let s = {};
  try { s = JSON.parse(readFileSync(file, 'utf8')); } catch { /* none yet */ }
  s.hooks ??= {};
  for (const ev of EVENTS) {
    const kept = (s.hooks[ev] ?? []).filter((g) => !JSON.stringify(g).includes('hook-dispatch.mjs'));
    kept.push({ matcher: '', hooks: [{ type: 'command', command: `node "${join(HUB, 'hook-dispatch.mjs')}" ${ev}`, timeout: 120 }] });
    s.hooks[ev] = kept;
  }
  // An approval taken with "clear context" is a DENY of ExitPlanMode, so no
  // PostToolUse runs and no marker is written: every write after it would be
  // refused. It is off by default; this keeps it off.
  s.showClearContextOnPlanAccept = false;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(s, null, 2) + '\n');
  return file;
}

/**
 * The repos this session can touch.
 * @param {string} root  the launch directory.
 * @returns {string[]} absolute repo roots under it (itself included when it is
 *   one), minus a launch-directory repo whose own settings already run.
 */
export function reposUnder(root) {
  const out = [];
  const scan = (dir) => { try { return readdirSync(dir).map((n) => join(dir, n)); } catch { return []; } };
  const at = resolve(root);
  // Launched INSIDE a repo, its siblings are session repos too: the first
  // version looked only below the launch directory, so a session started in
  // the hub never ran JPS's hooks on a write into JPS.
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
 * Which repos an event touches.
 * @param {string} event  the hook event.
 * @param {object} p      the payload.
 * @param {string[]} all  from `reposUnder`.
 * @returns {string[]} every repo, for every event: what a session launched in
 *   each repo would have run. The first version narrowed PreToolUse to the
 *   repos a call NAMED, and a call naming one repo while writing another (a
 *   redirect, a cwd, a `cd`) skipped the written repo's own guards entirely.
 *   Callers rely on this never being empty while a repo exists.
 */
export function touched(event, p, all) {
  return all;
}

/**
 * Does a settings matcher select this event?
 * @param {string} event  the hook event.
 * @param {string|undefined} m  the group's matcher.
 * @param {object} p      the payload.
 * @returns {boolean} tool events match on tool name, SessionStart on source.
 */
function matches(event, m, p) {
  if (!m || m === '*') return true;
  const subject = event === 'SessionStart' ? (p.source ?? '') : (p.tool_name ?? '');
  if (event !== 'PreToolUse' && event !== 'PostToolUse' && event !== 'PostToolUseFailure' && event !== 'SessionStart') return true;
  try { return new RegExp(`^(?:${m})$`).test(subject); } catch { return m === subject; }
}

/**
 * Read one hook run's outcome.
 * @param {object} r  a spawnSync result.
 * @returns {{deny: boolean, reason: string, out: string, status: number|null, err: string}}
 *   a refusal is exit 2 or a JSON decision of deny/block, the two shapes the
 *   family's hooks use. `status` is the raw exit code, so a caller can tell a
 *   pass (0) from a crash (anything else that is not a refusal).
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
 * @returns {{deny: boolean, reason: string, out: string}} see `outcome`.
 */
function run(command, raw, projectDir, timeoutS = 60) {
  const r = spawnSync('bash', ['-c', command], {
    input: raw, cwd: projectDir, encoding: 'utf8', timeout: timeoutS * 1000,
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
  });
  // A hook that exits without reading its stdin breaks the pipe, and spawnSync
  // reports EPIPE although the hook ran and its exit status is there. Read as
  // an error, its refusal was dropped: measured 2026-10-03, a hook refusing
  // without reading stdin got EPIPE in 16 of 200 runs on a small payload and
  // 200 of 200 on a 256 KB one, with status 2 every time. Only a hook that
  // never produced a status (it could not start, or timed out) is an error.
  if (r.error && r.status === null) return { deny: false, reason: '', out: '', status: null, err: '', error: r.error.message };
  return outcome(r);
}

/**
 * Every tool name used earlier in the session, with counts — printed after a
 * compaction, because a summary dropped the Drive connector's download and the
 * session then told the owner a folder could not be read.
 * @param {string} path  the transcript.
 * @returns {Promise<string>} one line per tool, most used first.
 */
async function toolCensus(path) {
  const counts = new Map();
  const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.includes('"tool_use"')) continue;
    for (const m of line.matchAll(/"type":"tool_use","id":"[^"]*","name":"([^"]+)"/g)) counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]).map(([n, c]) => `  ${n} x${c}`).join('\n');
}

// The owner says what is next, so the reminder asks for what is being done now
// and nothing about what comes next; a status is due when an agent has ended
// (report.mjs), not on a clock, so it carries no five-minute line.
const REMINDER = [
  'OWNER MESSAGE (LESSONS §370). Before any tool call, reply to EVERY point in it.',
  'If it says something was done wrong: answer it, and run nothing else this turn.',
  'First line: what you are doing now.',
  'End: done, not done, found and not fixed, open for the owner. Never "waiting on you". No app notifications.',
].join('\n');

async function main(event, raw, p) {
  const root = resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd());
  const printed = [];
  // EVERY PreToolUse refusal, by any guard, family or repo, sets the latch
  // (Doctrine §0d, §0e). Only five do not: the latch's own, so it can never
  // move the time an owner message has to come after; the report gate's;
  // pending-guard's; the correction check's; and the in-app approval check's.
  // Stop and the other events never latch.
  const refuse = (why, latch = true) => {
    process.stderr.write(why + '\n');
    if (latch && event === 'PreToolUse') { try { setLatch(p, why); } catch { /* the refusal stands either way */ } }
    return 2;
  };

  // ---- family guards ----
  if (event === 'PreToolUse') {
    // AN AGENT'S OWN RETURN PASSES EVERY GUARD, whatever its text names: it
    // writes nothing, and a guard refusing it — pending-guard telling it to
    // return, the latch, plan mode, a reply guard reading its words — leaves
    // the agent no way to hand back. Measured: a SubagentHandback was refused.
    if (p.agent_id && AGENT_RETURN.has(String(p.tool_name ?? ''))) return 0;
    // An owner message waiting in the queue comes before everything, the
    // status command included: the session answers it and ends its turn,
    // which is what delivers it (LESSONS §376).
    // ITS REFUSAL DOES NOT LATCH. The call is held, and is printed when the
    // message is delivered to be sent again then; a latch would refuse it
    // again, because the message that caused it was typed before the latch and
    // clears nothing. Measured 2026-10-03: held work printed on delivery was
    // refused by the latch until a second owner message.
    const pg = run(`node "${join(HUB, 'pending-guard.mjs')}"`, raw, root);
    if (pg.deny) return refuse(pg.reason, false);
    if (pg.status !== 0 && !READS.has(p.tool_name ?? '')) {
      return refuse(`pending-guard.mjs did not run cleanly (${pg.error ?? `exit ${pg.status}`}${pg.err ? `: ${pg.err.trim().split('\n')[0]}` : ''}); only reads run until it is fixed.`);
    }
    // THE OWNER'S EXIT FROM PLAN MODE IN THE APP IS JUDGED BEFORE ANY GATE READS
    // THE MARKER: the latch, the manager fence, the dispatch gate and the plan
    // fence all read what approved-plan-guard.mjs records from that exit, and
    // judged only inside the family guards below it came too late for the first
    // call after the exit being sending an agent — the dispatch gate refused on
    // the old marker and the exit was never judged (measured 2026-10-04 05:12).
    // It never refuses: a crash records nothing, and the checks below then
    // judge the call as before.
    run(`node "${join(HUB, 'approved-plan-guard.mjs')}" --judge-exit`, raw, root);
    // THE LATCH. While it stands nothing runs but the status command, the main
    // thread's TaskStop (and an agent's own return, which passed above).
    // TASKSTOP PASSES ON THE MAIN THREAD: stopping a task changes none of the
    // owner's work, and the session owns what it started until it is dead
    // (Doctrine §11d). Measured: while latched, the main thread could not stop
    // two watchers it had started, and they ran to their time limits. An
    // agent's TaskStop stays latched; the agent returns instead.
    const status = p.tool_name === 'Bash' && REPORT.test(String(p.tool_input?.command ?? ''));
    const mainStop = p.tool_name === 'TaskStop' && !p.agent_id;
    const latch = latchStanding(p);
    if (latch && !status && !mainStop) return refuse(latchMessage(latch), false);
    if (status) {
      // A subagent cannot tell the owner anything, so its stamp would unlock
      // the main thread with no status given.
      if (p.agent_id) return refuse('a subagent cannot give the owner a status; the main thread stamps the report clock.');
      return 0;
    }
    // A CORRECTION FROM THE OWNER ENDS THE TURN, BY REFUSAL (Doctrine §0e rule
    // 3). While the owner's newest message does not end with a go-word, every
    // ACTION on the main thread is refused; the status command (passed above),
    // TaskStop and a READ OF THE RECORD pass, and the refusal does not latch: the
    // next message from the owner is what lifts it, and a latch would only add a
    // second wait. Rule 3 had nothing behind it and was broken four times on
    // 2026-10-04. A read passes because a question one file answers cost a
    // refusal, a doctrine re-read and a go-word (measured 2026-10-06): a read
    // changes nothing, and the narrowed manager fence already limits what a read
    // may be of. A read that cannot be judged stays held. Agents are not held by
    // it; they are held by the plan fence. A failure in finding the correction
    // lets the call on.
    if (!p.agent_id && !mainStop) {
      let correction = null;
      try { correction = correctionStanding(p); } catch { correction = null; }
      try { if (correction && readOfRecord(p)) correction = null; } catch { /* a read that cannot be judged stays held */ }
      if (correction) return refuse(correctionMessage(correction), false);
    }
    const fence = managerFence(p);
    if (fence) return refuse(fence);
    // A STATUS FALLING DUE NEVER STOPS THE WORK. The report gate's refusal does
    // not latch: giving the status stamps the clock, and the refused call may
    // then run. Latched, the session stopped on it (measured 17:54).
    const rg = run(`node "${join(HUB, 'report.mjs')}" --gate`, raw, root);
    if (rg.deny) return refuse(rg.reason, false);
    if (rg.status !== 0 && !READS.has(p.tool_name ?? '')) {
      return refuse(`report.mjs did not run cleanly (${rg.error ?? `exit ${rg.status}`}${rg.err ? `: ${rg.err.trim().split('\n')[0]}` : ''}); only reads run until it is fixed.`);
    }
    // AN APPROVAL PRESSED IN THE APP COUNTS. When the owner's own exit from
    // plan mode in the app has been recorded as the approval of the plan, plan
    // mode is not entered again for it (approved-plan-guard.mjs --app-exit says
    // when). Measured 2026-10-03: the session re-entered plan mode after such
    // an exit, and the owner approved the same plan twice. The refusal does not
    // latch: what it asks is that the approved plan be carried on with.
    if (!p.agent_id && p.tool_name === 'EnterPlanMode') {
      const ax = run(`node "${join(HUB, 'approved-plan-guard.mjs')}" --app-exit`, raw, root);
      if (ax.deny) return refuse(ax.reason, false);
    }
    for (const g of [`node "${join(HUB, 'drive-guard.mjs')}" "${root}"`,
      `node "${join(HUB, 'approved-plan-guard.mjs')}"`, `node "${join(HUB, 'reply-guard.mjs')}"`, `node "${join(HUB, 'keep-info-guard.mjs')}"`,
      `node "${join(HUB, 'push-guard.mjs')}"`, `node "${join(HUB, 'plan-fence.mjs')}"`, `node "${join(HUB, 'doctrine-read-guard.mjs')}"`]) {
      const o = run(g, raw, root);
      if (o.deny) return refuse(o.reason);
      // A family guard that crashed or timed out has not said yes. The header's
      // promise — a crash refuses everything but reads — held only for a crash
      // of THIS file; a guard exiting 1 was read as a pass.
      if (o.status !== 0 && !READS.has(p.tool_name ?? '')) {
        return refuse(`${g.split('"')[1] ?? g} did not run cleanly (${o.error ?? `exit ${o.status}`}${o.err ? `: ${o.err.trim().split('\n')[0]}` : ''}); only reads run until it is fixed.`);
      }
    }
  }
  // --mark's outcome is carried, never discarded: a missed mark went unnoticed
  // for two approvals because this line threw it away. Reported after the
  // repos' own hooks, so the ledger still records the result.
  let markFail = '';
  if (event === 'PostToolUse' && /PlanMode$/.test(p.tool_name ?? '')) {
    const o = run(`node "${join(HUB, 'approved-plan-guard.mjs')}" --mark`, raw, root);
    if (o.deny || o.status !== 0) markFail = o.reason || o.err.trim() || o.error || `--mark exited ${o.status}`;
  }
  // What a call returned goes to reply-guard's ledger: a declining reply or a
  // failed call (LESSONS §374). A declining reply comes back as exit 2 so its
  // words are put in front of the session now, after the repos' own hooks,
  // like --mark's outcome.
  let replyNote = '';
  if ((event === 'PostToolUse' && /^(Bash|WebFetch)$/.test(p.tool_name ?? '')) || event === 'PostToolUseFailure') {
    const o = run(`node "${join(HUB, 'reply-guard.mjs')}" --record ${event}`, raw, root);
    if (o.deny) replyNote = o.reason;
  }
  if (event === 'UserPromptSubmit') {
    // Whether this prompt ends with a go-word is recorded here: it is
    // `correctionStanding`'s fallback when the transcript cannot be read.
    try { recordOwnerTurn(p); } catch { /* the transcript is the verdict's source */ }
    // A MESSAGE THE HARNESS NEVER DELIVERED IS PRINTED AT THE TOP OF THE TURN
    // THAT SHOWS IT WAS PASSED OVER, in any turn, go-word or not: it is what
    // the owner wrote and nothing here sends it again, so the session answers
    // it in this turn. pending-guard.mjs no longer holds work for it once a message
    // typed after it has arrived, and prints it here once (measured 2026-10-04:
    // a message timed 08:32 held every call through three turns).
    const skipped = run(`node "${join(HUB, 'pending-guard.mjs')}" --skipped`, raw, root);
    if (skipped.out.trim()) printed.push(skipped.out.trim());
    // HELD WORK NEXT, AND ONLY IN A GO-WORD TURN: every call pending-guard
    // refused while this message waited is printed at the top of the turn that
    // delivers it, once, so it is sent again rather than dropped (LESSONS
    // §376). A message that does not end with a go-word is a correction, and
    // every main-thread call is refused while it stands, so the held calls
    // stay held, in their file, until a turn that follows a go-word.
    if (endsWithGoWord(p.prompt)) {
      const held = run(`node "${join(HUB, 'pending-guard.mjs')}" --held`, raw, root);
      if (held.out.trim()) printed.push(held.out.trim());
    }
    // THE GOALS EVERY SESSION SERVES COME FIRST IN THE REMINDER (Doctrine §0e
    // rule 16): the section of the hub CLAUDE.md, printed at every owner message
    // so they are in front of the session whatever it has been reading. A
    // section that cannot be read is said so, never printed as an empty one.
    let goals = '';
    try { goals = goalsSection(); } catch { goals = ''; }
    printed.push(goals || 'The goals every session serves: not read (no such section in the CLAUDE.md beside hook-dispatch.mjs).');
    printed.push(REMINDER);
  }
  // A new process starts with an empty queue; pending-guard waits only on what
  // this one was given.
  if (event === 'SessionStart' && p.source !== 'compact') run(`node "${join(HUB, 'pending-guard.mjs')}" --start`, raw, root);
  // Every session start, the one after a compaction included, makes the whole
  // doctrine due again and prints one line saying so (Doctrine §11e), after
  // the recalled messages, which come before anything else.
  let dueLine = '';
  if (event === 'SessionStart' && !p.agent_id) {
    const due = run(`node "${join(HUB, 'doctrine-read-guard.mjs')}" --due`, raw, root);
    dueLine = due.out.trim().split('\n')[0] ?? '';
  }
  if (event === 'SessionStart' && p.source === 'compact' && p.transcript_path) {
    // The messages typed after the last reply before the compaction, the newest
    // ten, verbatim, before anything else is printed, with the count of the rest
    // and the file holding all: a summary is a paraphrase, and these are what it
    // paraphrased (LESSONS §376, §385).
    const recall = await recallFor(p.transcript_path);
    if (recall) printed.push(recall);
    printed.push('AFTER COMPACTION: every tool used earlier in this session still exists. Try each route before reporting a limit (LESSONS §370).\n'
      + await toolCensus(p.transcript_path));
  }
  if (dueLine) printed.push(dueLine);

  // ---- each touched repo's own hooks ----
  const ran = new Set();
  const repos = touched(event, p, reposUnder(root));
  // The owner's PLAN-LOCK in ANY session repo holds plan mode: plan-guard reads
  // it from the payload's cwd, which under a parent launch is the parent, so a
  // lock inside a repo was never seen. The one shared plan-guard run is told.
  const locked = event === 'PreToolUse' && repos.some((r) => existsSync(join(r, '.claude', 'PLAN-LOCK')));
  for (const repo of repos) {
    let s = {};
    try { s = JSON.parse(readFileSync(join(repo, '.claude', 'settings.json'), 'utf8')); } catch { continue; }
    for (const g of s.hooks?.[event] ?? []) {
      if (!matches(event, g.matcher, p)) continue;
      for (const h of g.hooks ?? []) {
        if (h.type !== 'command' || !h.command) continue;
        const shim = basename(String(h.command).split(/\s+/)[0]);
        let command = h.command;
        if (SHARED_SHIMS.has(shim)) {
          // Run the hub's canonical script, never a repo's copy of the shim: a
          // repo branch can carry a stale shim (JPS main's piped into `exec`
          // and refused every plan-mode call), and the hub clone is current.
          if (ran.has(shim)) continue;
          ran.add(shim);
          command = `node "${join(HUB, shim.replace(/\.sh$/, '.mjs'))}"`;
        }
        const input = locked && shim === 'plan-guard.sh' ? JSON.stringify({ ...p, permission_mode: 'plan' }) : raw;
        const o = run(command, input, repo, h.timeout ?? 60);
        if (o.deny) return refuse(o.reason);
        if (o.out.trim() && (event === 'SessionStart' || event === 'UserPromptSubmit')) printed.push(o.out.trim());
      }
    }
  }
  if (printed.length) process.stdout.write(printed.join('\n\n') + '\n');
  const post = [markFail, replyNote].filter(Boolean).join('\n');
  if (post) { process.stderr.write(post + '\n'); return 2; }
  return 0;
}

if (process.argv[1] && process.argv[1].endsWith('hook-dispatch.mjs')) {
  const event = process.argv[2];
  if (event === '--install') { console.log(`hook-dispatch: wired ${EVENTS.join(', ')} in ${install()}`); process.exit(0); }
  let raw = '';
  try { raw = readFileSync(0, 'utf8'); } catch { /* no payload */ }
  let p = {};
  try { p = JSON.parse(raw); } catch { /* treated below */ }
  main(event, raw, p).then((code) => process.exit(code), (e) => {
    if (event === 'PreToolUse' && !READS.has(p.tool_name ?? '')) {
      const why = `hook-dispatch.mjs failed (${e?.message ?? e}); only reads run until it is fixed.`;
      process.stderr.write(why + '\n');
      try { setLatch(p, why); } catch { /* the refusal stands either way */ }
      process.exit(2);
    }
    process.stderr.write(`hook-dispatch.mjs: ${e?.message ?? e}\n`);
    process.exit(0);
  });
}
