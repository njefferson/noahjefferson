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
 * gate below reads a marker that is about to change; the refusal latch (a
 * latched agent's own progress note and report, `step-N.txt` and
 * `step-N-report.txt` in the scratchpad's progress folder, pass it:
 * `agentReportWrite`, which finds the agent's transcript where a Workflow's
 * agents keep theirs too, `agentTranscriptPath`); the
 * stop hold (the whole session, agents too: while the newest owner message that
 * carries the whole word stop anywhere and no go-word stands, with no later
 * message carrying a go-word, every call is refused but an agent's own return,
 * TaskStop, the status command
 * and, on the main thread, a read of the record); the correction check (main
 * thread only: while the owner's newest message does not end with a go-word,
 * every call is refused but the status command, TaskStop, a read of the record,
 * the Standing review step, and the sending of a step that a review which BEGAN
 * after that message cleared, so a question is answered from a file in the turn it
 * is asked and approved work goes on after one review; any other action stays
 * held); the recall gate (main thread only, `recallGate`: after a compaction the
 * main thread only reads and gives the status until Read results covering every
 * line of the file of the owner's messages since the previous compaction have
 * returned, LESSONS §416); the state page gate (main thread only, `pageGate`: after a compaction
 * the main thread only reads and gives the status until a Read result on the
 * session's status page has returned, as the doctrine's read is held); the manager
 * fence with its dispatch gate (main thread only),
 * which passes a read only of the record (the plans, the session scratchpad,
 * the doctrine and lessons, each repo's notes, plan pointers, IR-SCIENCE.md and
 * decision records, the session's transcript and the tool results saved beside
 * it), exactly one history read of a session repository or the hub worktree
 * (`gitHistoryRead`, LESSONS §423) and a SendUserFile only of files in the session scratchpad, which
 * also passes the wait between statuses (`report.mjs --wait`), and
 * whose dispatch gate sends a step only when the plan's `Served by:` line names
 * a goal for it (the standing goals in the hub CLAUDE.md) and, where the plan has an `## Order`
 * and no review step, only step N, the pointer, or a Standing step (§0e rule 13);
 * the report gate; the review gate (main thread only, `reviewGate`: where a
 * Standing step follows the hub's aim-review.md, a step of the plan goes only
 * when the newest review hand-back began after the newest end of an agent for a
 * step in Order, after the plan's last write and, under a correction, after the
 * owner's newest message, and reads ON-AIM ROUTE-CLEAR naming that step as next;
 * the verdict is read from the reviewer's own transcript, Doctrine §0e rule 2; a
 * Standing step passes it only when the approval recorded it on the Standing line and it is
 * the review or a route check named in its own first line, and a step the plan did not hold
 * at approval is not sent at all: `approvalSetProblem`, asked by this gate and by the dispatch
 * gate, whose refusals set no latch; and while the approval recorded a review step and no Standing
 * step of the plan now names the review file by its full path, no step is sent at all, a Standing
 * one included: `reviewRecordProblem`, asked by the same two gates, whose refusals set no latch);
 * the rules gate (main thread only, `rulesGate`: where a plan's Rules line points
 * at the hub's agent-rules.md and pins a version, no step is sent while the file's
 * version is another, Doctrine §0e rule 13); the reads gate (main thread only,
 * `readsGate`: a Read of the record that a hook refused or that failed is recorded
 * (`noteRefusedReadCall`), the status names it, and no step, Workflow included, is
 * sent until a Read has returned on that file; it does not latch); for the main thread's
 * EnterPlanMode, the in-app approval check
 * (approved-plan-guard --app-exit); the family guards (drive, approved-plan,
 * reply, keep-info); push-guard; plan-fence (subagents only);
 * doctrine-read-guard (main thread only); then each repo's hooks. EVERY
 * PreToolUse refusal, family or repo, sets a latch, except the
 * report gate's, pending-guard's, the stop hold's, the correction check's, the
 * recall gate's, the state page gate's, the doctrine gate's (the Read it names is its
 * remedy), the in-app approval check's, the review
 * gate's, the rules gate's, the reads gate's, the judgement gate's, the refusal of the
 * ExitPlanMode call on a name the plan gate has not seen (`NAMES_NO_LATCH`), its refusal of
 * that call for a plan already approved, when the harness's plan mode began at a compaction or a
 * resume after the approval (`APPROVED_NO_LATCH`, LESSONS §432) and the
 * app's identifier guard's refusal of that call (`noLatchRepoRefusal`, LESSONS §424), and the manager
 * fence's refusal of a call that is not of the record (`FENCE_NO_LATCH`: it names
 * what the main thread may use and the check, `--can`, which says beforehand whether
 * the fence and the latch would pass a call): a status falling due (an agent has
 * ended) is cleared by giving it, and the refused call may then run; a call
 * held while an owner
 * message waits is sent again once the message is delivered, and a latch would
 * refuse it again; a stop or a correction is lifted by the owner's next message
 * (a go-word, for a stop), which a latch would only wait on a second time; a
 * plan the owner approved in the
 * app is carried on with, which a latch would stop; a move with no current
 * review is cleared by sending the Standing review step, a refused route is
 * answered by amending the plan's Steps, an OFF-AIM verdict is answered by
 * entering plan mode, a stale rules version is answered by amending the Rules
 * line, and the state page is read to clear its gate, none of which a latch would
 * let through. A refusal on the main
 * thread writes the SESSION's latch: while it stands only the status command,
 * the main thread's TaskStop, the reply guard's release command (`releaseCommand`, which
 * also lifts a latch the reply guard set, `releaseLifts`) and a subagent's own return run, until the owner
 * types a message after it, by the time it was typed (Doctrine §0d, §0e). A
 * refusal INSIDE an agent writes that agent's own latch and the session's is
 * left alone: every later call of that agent is refused but its own return,
 * and the main thread and the other agents are not held. Stop refusals never
 * latch. SessionStart makes the
 * doctrine due and prints one line saying so (§11e), and after a compaction makes
 * the status page due and prints a second (`markPageDue`), makes the filed messages
 * due and prints a third (`markRecallDue`), and records the compaction with its
 * time (`markCompacted`). UserPromptSubmit prints,
 * before anything else, each owner message the harness never delivered that a
 * message typed after it has now overtaken (pending-guard --skipped, once
 * each), then, only when the prompt ends with a go-word, the calls
 * pending-guard held while a message from the owner waited, then the goals
 * every session serves (the hub CLAUDE.md's section) ahead of the reminder.
 * When the prompt is the notice that an agent or a task has ended (a task
 * notification with an end marker, or an agent's hand-back: `isHandBackNotice`)
 * the status page is rewritten as well, by `report.mjs --page`, which stamps
 * nothing and prints no status. A Workflow call goes to `workflowGate`, which
 * refuses it unless scripts are accepted (WORKFLOW_SCRIPTS_ACCEPTED, off) and the
 * call carries the approved plan's own script.
 *
 * It runs from a stable clone (the setup script puts one at ~/.claude/hub), so
 * a broken edit in the working copy cannot refuse its own fix.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, createReadStream, rmSync, statSync } from 'node:fs';
import { join, dirname, resolve, basename, relative } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';
import { recallParts } from './compact-recall.mjs';
import { tailEntries, isOwnerMessage, textOf } from './transcript-tail.mjs';
import { californiaTime, approvalBlock, goalsSection, goalsBlock, pointerFor, planOrder, reviewState, aimReviewSteps, AIM_FILE, planSection, RULES_FILE, agentRules, MANAGER_FILE, scratchpadOf,
  planScript, noteRefusedRead, refusedReads, unreadRefusals, agentStep, agentTranscriptPath, stepsFilePath, stepsFileText, judgedState, stepNumbers, stepBody, markCompacted, sessionFiles, JUDGED_PARTS, WHY_PARTS,
  planAfter, SCOPE_SECTIONS } from './report.mjs';
// One definition of a plan's section, in report.mjs, for the approval's scope hashes to share.
export { planSection };
import { HARNESS_TAG } from './pending-guard.mjs';
import { parseRead, site } from './reply-guard.mjs';

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

// The check a main-thread call can be put to before it is made (`canCall`): this hub's hook-dispatch.mjs with
// `--can`, a tool name and ONE argument, which is a word of path characters or a quoted string with nothing in it
// for the shell to expand, and nothing chained. It changes nothing, so the main thread's gates pass it as they
// pass the status command, a latch included, and a line with anything chained to it is not it.
const CAN_ARG = '(?:"[^"`$\\\\]*"|\'[^\']*\'|[^\\s"\'`$\\\\;&|<>(){}*?\\[\\]!#]+)';
const CAN = new RegExp('^\\s*node\\s+"?' + join(HUB, 'hook-dispatch.mjs').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  + '"?\\s+--can\\s+[A-Za-z][A-Za-z0-9_]*\\s+' + CAN_ARG + '\\s*$');

/**
 * Is a Bash line the check of a call (`hook-dispatch.mjs --can`)?
 * @param {string} cmd  a command line.
 * @returns {boolean} true only for this hub's `hook-dispatch.mjs --can <tool> <one argument>`
 *   with nothing chained to it (the same test the latch, the fence and `main` use).
 */
export const isCanCommand = (cmd) => CAN.test(String(cmd ?? ''));

/**
 * The reply guard's release command, when a Bash line is exactly that.
 * @param {string} cmd  a command line.
 * @returns {{target: string, said: string, route: string} | null} what `parseRead` in reply-guard.mjs makes of the line when it is
 *   `node <this hub's reply-guard.mjs> --read <host or call:ID> --said "<words>" --route "<kind>: <how>"` as ONE plain command, with
 *   nothing chained, no `$` and no backtick; null for any other line, and for a line that names the file and is not a reading
 *   (`bad`). It is the command a refusal of the reply guard names as the way on. On the main thread it passes the manager fence
 *   and the refusal latch as the status command does (the other gates judge it as any command), and it lifts the latch the
 *   reply guard set (`releaseLifts`). It writes only the reply guard's own ledger, after the guard has checked the words
 *   against what the server said, so it changes none of the work a latch is there to hold.
 */
export function releaseCommand(cmd) {
  const r = parseRead(String(cmd ?? ''));
  return r && !r.bad ? r : null;
}

// How every refusal of the reply guard opens, and so how a latch it set is told from any other.
const REPLY_GUARD_REFUSAL = /^reply-guard \(LESSONS §374\)/;

/**
 * Does a release lift the latch standing?
 * @param {{reason: string, own?: boolean} | null} latch  the session's latch as `latchStanding` reads it.
 * @param {{target: string} | null} release  `releaseCommand` of the call.
 * @returns {boolean} true only when the latch is the main thread's (never an agent's own), was set by a refusal of the reply guard
 *   (its text opens as every reply-guard refusal does), and the release is of the call that refusal named: the target after
 *   `--read` in the refusal's text, a call id compared as written and a host compared by its site (`site` in reply-guard.mjs).
 *   Where the stored text holds no target (the latch keeps the first 1200 characters of a refusal, and an error excerpt can fill
 *   them), the release is taken as of the call, because the reply guard has already checked the reading it records.
 */
export function releaseLifts(latch, release) {
  if (!latch || latch.own || !release || !REPLY_GUARD_REFUSAL.test(String(latch.reason ?? ''))) return false;
  const named = [...String(latch.reason).matchAll(/ --read (\S+)/g)].map((m) => m[1].toLowerCase());
  if (!named.length) return true;
  const want = String(release.target ?? '').toLowerCase();
  return named.some((t) => (t.startsWith('call:') || want.startsWith('call:') ? t === want : site(t) === site(want)));
}

// What a refusal of the reply guard that names its release command ends with, in the refusal itself and in the latch it sets.
const RELEASE_NOTE = ' On the main thread this command passes the manager fence and the refusal latch as the status command does, and it lifts the latch this refusal set once the reading is recorded.';

// The tools an agent hands its result back with. `StructuredOutput` is the
// plan's name for it; `SubagentHandback` is the name this harness gives the
// same act. Either passes every guard: it writes nothing, and a guard refusing
// it leaves the agent no way to hand back (measured: a handback was refused).
export const AGENT_RETURN = new Set(['StructuredOutput', 'SubagentHandback']);
// The agent types the harness itself defines. Any other type is a custom one,
// whose own definition carries instructions the owner has not read.
export const BUILTIN_AGENT_TYPES = new Set(['general-purpose', 'Explore', 'Plan', 'claude-code-guide']);
// The one page the main thread publishes and writes, in its own scratchpad, and
// the plain-text notes it writes beside it, which report.mjs reads into the page
// and never rewrites (a status rewrites the page whole).
const STATUS_PAGE = 'status/fix-run.html';
const MANAGER_NOTES = MANAGER_FILE;
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
  // `plan_mode_forced` tells plan-guard this mode is the classifier's, never the harness's: its stand-down for a plan mode the
  // harness began at a compaction or a resume after the approval would otherwise make every tool a read here (LESSONS §432).
  const r = spawnSync('node', [join(HUB, 'plan-guard.mjs')], {
    input: JSON.stringify({ ...p, permission_mode: 'plan', plan_mode_forced: true }), encoding: 'utf8',
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
 * Is a path this session's manager notes?
 * @param {string} path  a file path.
 * @param {string|undefined} sid  the session id from the payload.
 * @returns {boolean} true only for `status/manager.txt` directly in this
 *   session's scratchpad. The manager fence lets the main thread write this one
 *   file as well as the page's source (`isStatusPage`): the page is rewritten
 *   whole at every status, so what the manager keeps for it lives here, where
 *   report.mjs reads it and nothing rewrites it (Doctrine §0e rule 2, §7i).
 */
export function isManagerNotes(path, sid) {
  if (!inScratchpad(path, sid)) return false;
  return resolve(String(path)).endsWith(`/${sid}/scratchpad/${MANAGER_NOTES}`);
}

/**
 * The plan the owner approved, as the approval marker names it.
 * @returns {{path: string, text: string, scriptHash: string|null, steps: number[]|null, standing: number[]|null, review: number[]|null} | null}
 *   the plan file and its text, with the hash of its script the marker recorded at approval
 *   (`scriptHash`, null for a marker written before it was recorded), and the step numbers
 *   the plan held at approval: `steps` (its Steps section), `standing` (its Standing
 *   line) and `review` (those Standing steps that named the review file by its full path),
 *   each null for a marker written before they were recorded, which carries no check
 *   on them, and [] for a marker whose field is there and is not a list of whole numbers,
 *   which no step can be in (and which, for `review`, records no review step to keep).
 *   Null when no marker stands, its file cannot be read, or the
 *   file's sha256 is no longer the hash recorded at approval. The dispatch gate and the
 *   plan fence read their steps, Files and Commands out of this, so a null must make both
 *   refuse rather than allow: a plan edited after approval grants nothing.
 */
export function approvedPlan() {
  try {
    const mk = JSON.parse(readFileSync(join(homedir(), '.claude', 'APPROVED-PLAN.json'), 'utf8'));
    if (!mk?.plan || !mk.hash) return null;
    const bytes = readFileSync(mk.plan);
    if (createHash('sha256').update(bytes).digest('hex') !== String(mk.hash)) return null;
    const recorded = (v) => (v === undefined ? null : Array.isArray(v) && v.every((x) => Number.isInteger(x)) ? v : []);
    return { path: String(mk.plan), text: bytes.toString('utf8'), scriptHash: typeof mk.scriptHash === 'string' ? mk.scriptHash : null, review: recorded(mk.review), steps: recorded(mk.steps), standing: recorded(mk.standing) };
  } catch { return null; }
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

/** The words that name a Standing step as a route check, in the step's own first line. */
const ROUTE_CHECK = /\broute[- ]check\b/i;

/**
 * Is this step one the plan held when it was approved, and may a Standing step go?
 * THE STANDING LINE HOLDS THE REVIEW AND A ROUTE CHECK AND GAINS NO STEP AFTER APPROVAL
 * (Doctrine §0e rules 2 and 13): a Standing step passes the review gate and the pointer, so
 * a step edited onto that line after the owner's button would be sent with no review at all.
 * @param {{text: string, steps?: number[]|null, standing?: number[]|null} | null} plan  the plan
 *   in force, with the step numbers its approval recorded (`approvedPlan`).
 * @param {number} n  the step a send names.
 * @returns {string|null} null when nothing is wrong or nothing can be told: no plan, a marker
 *   that recorded no lists (`steps` or `standing` null or absent: written before they were
 *   recorded, and checked against nothing), or a step the record allows. Otherwise the refusal,
 *   three kinds, the Standing ones first. A step on the plan's Standing line now (the part
 *   that needs `standing` recorded) that was not on it at approval; a step on the Standing
 *   line that is neither a review step (`aimReviewSteps`: its text follows the hub's
 *   aim-review.md by its full path) nor a route check, which its own first line names with the
 *   words route check; and a step that was not in the plan's Steps at approval (the part that
 *   needs `steps` recorded), which needs the owner's button. An edit of a recorded step's text
 *   or of the Order of the recorded steps raises none of them. The dispatch gate and the
 *   review gate both call this, so they cannot judge two different sets, and neither of their
 *   refusals latches.
 */
export function approvalSetProblem(plan, n) {
  if (!plan || !Number.isInteger(n)) return null;
  const rule = 'THE STANDING LINE HOLDS THE REVIEW AND A ROUTE CHECK AND GAINS NO STEP AFTER APPROVAL (Doctrine §0e rules 2 and 13):';
  if (Array.isArray(plan.standing) && (planOrder(plan.text)?.standing ?? []).includes(n)) {
    if (!plan.standing.includes(n)) {
      return `${rule} step ${n} is on the plan's Standing line now and was not on it when the plan was approved (the Standing line then held ${plan.standing.join(', ') || 'no step'}), so it is not sent: a Standing step goes with no review, and putting one there after the owner's button is not the owner's approval. `
        + 'A step that needs to go is added in a new plan through plan mode, behind the owner\'s button.';
    }
    const first = String(stepBody(plan.text, n)).split('\n')[0] ?? '';
    if (!aimReviewSteps(plan.text).includes(n) && !ROUTE_CHECK.test(first)) {
      return `${rule} step ${n} is on the Standing line and is neither the review step (its text follows ${join(HUB, AIM_FILE)} by its full path) nor a route check named as one in its own first line, so it is not sent. `
        + 'The Standing line holds those two and nothing else: any other step goes through the Order and the review.';
    }
  }
  if (Array.isArray(plan.steps) && !plan.steps.includes(n)) {
    return `STEP NOT IN THE PLAN AT APPROVAL (Doctrine §0e rule 13): step ${n} was not in the plan's Steps when the plan was approved (the steps then were ${plan.steps.join(', ') || 'none'}), so it is not sent: a step the owner has not read needs the owner's button, in a new plan through plan mode. `
      + 'An edit of a recorded step\'s text, or of the Order of the recorded steps, keeps the approval and needs no button.';
  }
  return null;
}

/**
 * Has the plan's review step been edited away since the approval recorded it?
 * THE REVIEW STEP'S TEXT KEEPS THE REVIEW FILE'S PATH (Doctrine §0e rules 2 and 13): the review gate enforces
 * only where a Standing step names the review file by its full path (`aimReviewSteps`), so editing that step's
 * text until it names no file, or taking it off the Standing line, switched the gate off for every step after the
 * edit, and the dispatch gate fell back on the pointer. An edit of a step's text keeps the approval, by design,
 * so the approval has to say that there was a review.
 * @param {{text: string, review?: number[]|null} | null} plan  the plan in force, with the review step
 *   numbers its approval recorded (`approvedPlan`).
 * @returns {string|null} null when nothing is wrong or nothing can be told: no plan; a marker that recorded no
 *   review list (`review` null or absent: written before it was recorded, and checked against nothing); a marker
 *   that recorded an empty one (the plan had no review step, so there is none to keep); or a plan whose Steps
 *   still carry a Standing step that names the review file by its full path and says follow
 *   (`aimReviewSteps`, the very condition the review gate enforces on). Otherwise the refusal: the marker
 *   records a review step and the plan no longer has one. It names the rule, lists the recorded numbers, and
 *   says the plan goes back through plan mode. It does not depend on the step sent: the dispatch gate and the
 *   review gate both ask it before they judge anything else, a Standing step included, because the review
 *   itself cannot be sent when no step follows the review file. Neither gate's refusal of it latches.
 */
export function reviewRecordProblem(plan) {
  if (!plan || !Array.isArray(plan.review) || !plan.review.length) return null;
  if (aimReviewSteps(plan.text).length) return null;
  return 'THE REVIEW STEP KEEPS THE REVIEW FILE\'S PATH (Doctrine §0e rules 2 and 13): '
    + `the plan recorded review step${plan.review.length === 1 ? '' : 's'} ${plan.review.join(', ')} when it was approved, and no Standing step of the plan now tells its agent to follow ${join(HUB, AIM_FILE)} by its full path, `
    + 'so the review gate would stop gating and every move would go with no review. No step is sent, a Standing step included. '
    + 'Editing the review step\'s text until it names no review file, or taking it off the Standing line, is not the owner\'s approval: the plan goes back through plan mode and the owner\'s button.';
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
 *   refuses on it (the standing goals in the hub CLAUDE.md, under "Goals every
 *   session serves").
 */
export function goalsProblem(text, block = goalsBlock()) {
  const head = 'GOALS (the standing goals in the hub CLAUDE.md):';
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
 * @param {boolean} [readOnly]  true for the check of a call (`canCall`): the answer is the same, but the
 *   file of a latch an owner message has cleared is left where it is, so the check changes nothing.
 */
export function latchStanding(p, entries, readOnly = false) {
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
    if (!readOnly) rmSync(latchFile(p), { force: true });
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
    + 'Until the owner writes again every call is refused except the status command, the main thread\'s TaskStop (so it can stop what it started), a subagent\'s own return '
    + 'and the reply guard\'s release command (node reply-guard.mjs --read, one plain command), which lifts a latch the reply guard set once the reading is recorded. '
    + 'Say in plain text what was refused, and stop. A subagent returns what it has, with the refusal\'s text. '
    + 'Another command, tool or wording for the same end is a second route, not a fresh start.';
}

/**
 * The words the plan gate's refusal of a name opens with (`inventedNames`, `heldNames` in plan-guard.mjs). `noLatchRepoRefusal` reads
 * them as "this refusal sets no latch": the remedy of a refusal for a name the session has not seen is a read that shows it, and a
 * latch refused that read until the owner wrote (LESSONS §424).
 */
export const NAMES_NO_LATCH = 'NAME CHECK, NO LATCH:';
/**
 * The words plan-guard.mjs's refusal of the approval call opens with when the plan is already approved and the harness's plan mode
 * began at a compaction or a resume after it (`restartedPlanMode`, LESSONS §432). `noLatchRepoRefusal` reads them as "this refusal
 * sets no latch": the remedy is to send the plan's next step, and a latch would refuse the send.
 */
export const APPROVED_NO_LATCH = 'PLAN ALREADY APPROVED, NO LATCH:';
// The hook shims of the app's identifier guard, `.claude/hooks/ident-guard.sh` and the script it runs. The guard is a hook of the app
// and not a hub gate, and is not changed here; only the dispatcher's own decision about its refusal is.
const IDENT_SHIMS = new Set(['ident-guard.sh', 'ident-guard.mjs']);

/**
 * Does a refusal by a repository's own hook leave the latch unset?
 * @param {string} shim  the hook command's file name, such as `plan-guard.sh` or `ident-guard.sh`.
 * @param {object} p  the PreToolUse payload of the refused call.
 * @param {string} reason  the refusal's text.
 * @returns {boolean} true only for a refusal of the ExitPlanMode call, and for one of two kinds: any refusal by the app's identifier
 *   guard (an identifier the session has not read, whose remedy is a read of it), and the plan gate's refusal of a name it has not
 *   seen (its text opens with `NAMES_NO_LATCH`), and the plan gate's refusal of the approval call for a plan that is already approved
 *   (`APPROVED_NO_LATCH`: the harness's plan mode began at a compaction or a resume after the approval). The refusal still refuses,
 *   with exit 2; only the latch is not written. Every other
 *   refusal of the approval call, the plan gate's missing sections among them, and every refusal of any other call by any hook, latches
 *   as before. `main` asks this at each repository hook that denied.
 */
export function noLatchRepoRefusal(shim, p, reason) {
  if (String(p?.tool_name ?? '') !== 'ExitPlanMode') return false;
  if (IDENT_SHIMS.has(shim)) return true;
  return shim === 'plan-guard.sh' && (String(reason ?? '').includes(NAMES_NO_LATCH) || String(reason ?? '').includes(APPROVED_NO_LATCH));
}

/**
 * Is this call a latched agent writing its own report?
 * @param {object} p  a PreToolUse payload.
 * @returns {boolean} true only for a subagent's Write, Edit or MultiEdit of a file
 *   directly in `progress/` of this session's scratchpad named `step-N.txt` or
 *   `step-N-report.txt`, where, if the agent's own transcript names the step it was
 *   sent for (`agentStep`), N is that step. The agent's transcript is
 *   `<main transcript without .jsonl>/subagents/agent-<agent id>.jsonl`, or one level
 *   below `subagents/workflows/<run>/` for an agent a Workflow started
 *   (`agentTranscriptPath`); when it
 *   cannot be found or names no step, any N passes. THE INVARIANT main() relies on:
 *   a latched agent can write its progress note and its report and nothing else,
 *   so a refusal does not cost the step its record, and the latch still holds every
 *   other call but the agent's own return.
 */
export function agentReportWrite(p) {
  if (!p.agent_id || !/^(?:Write|Edit|MultiEdit)$/.test(String(p.tool_name ?? ''))) return false;
  const f = String(p.tool_input?.file_path ?? '');
  if (!f) return false;
  const abs = resolve(p.cwd ? String(p.cwd) : process.cwd(), f);
  if (!inScratchpad(abs, p.session_id) || basename(dirname(abs)) !== 'progress' || basename(dirname(dirname(abs))) !== 'scratchpad') return false;
  const m = /^step-(\d+)(?:-report)?\.txt$/.exec(basename(abs));
  if (!m) return false;
  let own = null;
  try { const file = agentTranscriptPath(p); if (file) own = agentStep(file); } catch { own = null; }
  return own === null || own === Number(m[1]);
}

/**
 * Is a prompt the notice that an agent or a background task has ended?
 * @param {string} prompt  the text of a UserPromptSubmit event.
 * @returns {boolean} true when it opens with a task notification that carries an end
 *   marker (`<status>` completed, failed, killed, stopped or cancelled), or with an
 *   agent's hand-back as the harness delivers it (`[Subagent hand-back]`, in an
 *   `<agent-message>` or bare). These are the prompts `recordOwnerTurn` sets aside as
 *   not the owner's; the status page is rewritten when one arrives.
 */
export function isHandBackNotice(prompt) {
  const t = String(prompt ?? '');
  return /^\s*<task-notification\b[\s\S]*?<status>(?:completed|failed|killed|stopped|cancelled)<\/status>/.test(t)
    || /^\s*(?:<agent-message\b[^>]*>\s*)?\[Subagent hand-back\]/i.test(t);
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
 * THE STOP WORD: the whole word stop, ANYWHERE in an owner message, case and
 * punctuation set aside. It is not limited to a message's first word: a halt
 * message puts it second as often as first ("please stop"), and a first-word
 * rule stopped nothing for those. A message carrying it and
 * ending with a go-word is not a stop (`isStopMessage`). It is read from the
 * transcript for as long as it stands, not only while the message is queued;
 * pending-guard.mjs still reads a QUEUED message by its first word, which is
 * narrower, so a queued halt message holds agents only once it is delivered.
 */
export const STOP_WORD = 'stop';

/**
 * Does a message carry the whole word stop?
 * @param {string} text  an owner message.
 * @returns {boolean} true when, with case and punctuation set aside, one of the
 *   message's words is stop ("Stop.", "please stop", "do not stop now" and
 *   "stop-gap" are; "stopped", "stops" and "unstoppable" are not, because the
 *   word is not whole). The words are split the way `endsWithGoWord` splits them.
 */
export function hasStopWord(text) {
  return String(text ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ').includes(STOP_WORD);
}

/**
 * Is a message a stop?
 * @param {string} text  an owner message.
 * @returns {boolean} true when it carries the stop word (`hasStopWord`) and does
 *   not end with a go-word (`endsWithGoWord`): "please stop, then go" carries a
 *   go-word, so it is a go message and not a stop. Only a stop message holds the
 *   session, and only a later message ending with a go-word lifts it.
 */
export function isStopMessage(text) {
  return hasStopWord(text) && !endsWithGoWord(text);
}

/**
 * Record, at UserPromptSubmit, whether the prompt just delivered ends with a go-word.
 * @param {object} p  the UserPromptSubmit payload: `prompt` is what arrived.
 * @returns {boolean} true when a record was written; false for an empty prompt
 *   or one opening with a harness tag (a task notification, an agent's
 *   hand-back), which is not the owner's. The record (the time, whether the
 *   prompt ends with a go-word, whether it is a stop message, and when the
 *   stop standing was said) is `ownerHolds`' fallback for a transcript it
 *   cannot read; it never overrides a readable one. A stop already on record
 *   outlives a plain message typed after it, as it does in the transcript: only
 *   a message ending with a go-word replaces it.
 */
export function recordOwnerTurn(p) {
  const prompt = typeof p.prompt === 'string' ? p.prompt : '';
  if (!prompt.trim() || HARNESS_TAG.test(prompt)) return false;
  const f = ownerTurnFile(p);
  mkdirSync(dirname(f), { recursive: true });
  const now = Date.now();
  const go = endsWithGoWord(prompt);
  let stop = isStopMessage(prompt);
  let stopAt = now;
  if (!stop && !go) {
    try {
      const old = JSON.parse(readFileSync(f, 'utf8'));
      if (old && old.stop === true) { stop = true; stopAt = Number(old.stopAt ?? old.at) || now; }
    } catch { /* no record before this one */ }
  }
  writeFileSync(f, JSON.stringify({ at: now, go, stop, stopAt }));
  return true;
}

/**
 * What the owner's messages hold, read from a transcript's entries.
 * @param {object[]} entries  transcript entries in file order.
 * @returns {{last: {text: string, at: number}|null,
 *   correction: {at: number, typed: number}|null, stop: {at: number, typed: number}|null,
 *   settled: boolean}}
 *   `last`: the newest owner message (`isOwnerMessage`) with its delivered time
 *   in ms. `correction`: `last` with its delivered time `at` and its TYPED time
 *   `typed` (`typedAt`, in ms; the time a review has to have begun after, and
 *   read only for a message that holds something), unless it ends with a
 *   go-word. `stop`: the newest owner message that is a stop message
 *   (`isStopMessage`: it carries the whole word stop anywhere in it and does not
 *   end with a go-word), unless a LATER owner message ends with a go-word, which
 *   lifts it. A message carrying the word and ending with a go-word is not a stop
 *   and lifts an earlier one; a later stop message is itself the newest stop; a
 *   plain correction typed after a stop does not lift it. `settled`: the entries
 *   hold a stop message or a go-word message, so a wider tail could not change
 *   `stop` (a stop in the tail is judged by what follows it; a go-word in the
 *   tail lifts any older stop).
 */
export function holdsIn(entries) {
  const idx = [];
  entries.forEach((e, i) => { if (isOwnerMessage(e)) idx.push(i); });
  if (!idx.length) return { last: null, correction: null, stop: null, settled: false };
  const when = (i) => {
    const at = Date.parse(entries[i].timestamp ?? '');
    const typed = typedAt(entries, i);
    return { at: Number.isFinite(at) ? at : 0, typed: Number.isFinite(typed) ? typed : (Number.isFinite(at) ? at : 0) };
  };
  const words = (i) => textOf(entries[i]);
  const lastAt = Date.parse(entries[idx[idx.length - 1]].timestamp ?? '');
  const last = { text: words(idx[idx.length - 1]), at: Number.isFinite(lastAt) ? lastAt : 0 };
  const correction = endsWithGoWord(last.text) ? null : when(idx[idx.length - 1]);
  let stopAt = -1;
  for (let k = idx.length - 1; k >= 0; k--) if (isStopMessage(words(idx[k]))) { stopAt = idx[k]; break; }
  let stop = null;
  if (stopAt >= 0 && !idx.some((i) => i > stopAt && endsWithGoWord(words(i)))) stop = when(stopAt);
  const settled = stopAt >= 0 || idx.some((i) => endsWithGoWord(words(i)));
  return { last, correction, stop, settled };
}

/**
 * The owner's standing holds for this session: a stop, a correction, or neither.
 * @param {object} p  a PreToolUse payload: `transcript_path` is read.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @returns {{correction: {at: number, typed: number}|null, stop: {at: number, typed: number}|null}}
 *   from `holdsIn`, read from a tail that widens (2, 8, then 32 MB) until it is
 *   settled or the widest has been read. A transcript that cannot be read falls
 *   back to the record UserPromptSubmit wrote (`recordOwnerTurn`); none known is
 *   no hold. A task notification, a scheduled message and an agent's hand-back
 *   are not messages from the owner. A refusal built on this never quotes the
 *   message.
 */
export function ownerHolds(p, entries) {
  let h = { last: null, correction: null, stop: null, settled: false };
  let readable = false;
  if (entries) { readable = entries.length > 0; h = holdsIn(entries); }
  else for (const mb of [2, 8, 32]) {
    const tail = tailEntries(p.transcript_path ?? '', mb * 1024 * 1024);
    readable ||= tail.length > 0;
    h = holdsIn(tail);
    if (h.settled) break;
  }
  if (h.last || readable) return { correction: h.correction, stop: h.stop };
  try {
    const r = JSON.parse(readFileSync(ownerTurnFile(p), 'utf8'));
    const at = Number(r?.at) || 0;
    const stopped = Number(r?.stopAt) || at;
    return { correction: r && r.go === false ? { at, typed: at } : null, stop: r && r.stop === true ? { at: stopped, typed: stopped } : null };
  } catch { return { correction: null, stop: null }; }
}

/**
 * The correction standing for this session, if the owner's newest message is one.
 * @param {object} p  a PreToolUse payload: `transcript_path` is read.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @returns {{at: number, typed: number} | null} the correction, with the time the
 *   message was written and the time it was typed, in ms, or null: `ownerHolds`'
 *   `correction`. It is a correction unless the newest owner message ends with a
 *   go-word (`endsWithGoWord`).
 */
export function correctionStanding(p, entries) {
  return ownerHolds(p, entries).correction;
}

/**
 * The stop standing for this session, if the owner has said stop and not yet go.
 * @param {object} p  a PreToolUse payload: `transcript_path` is read.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @returns {{at: number, typed: number} | null} `ownerHolds`' `stop`.
 */
export function stopStanding(p, entries) {
  return ownerHolds(p, entries).stop;
}

/**
 * The refusal while a correction stands.
 * @param {{at: number}} c  from `correctionStanding`.
 * @param {boolean} [reviewed]  whether the plan in force has a review step, which
 *   changes what passes.
 * @returns {string} names the rule, says to answer in plain text and end the
 *   turn, names what passes (a read of the record, the status command and
 *   TaskStop, and, where the plan has a review step, that step and a step a
 *   review begun after the message cleared) and what is held, and prints the
 *   go-word list. It never quotes what the owner wrote.
 */
export function correctionMessage(c, reviewed = false) {
  return `CORRECTION (Doctrine §0e rule 3): the owner's newest message${c.at ? `, written ${californiaTime(new Date(c.at))} (California),` : ''} does not end with a go-word, so it is a correction, and a correction holds new starts. `
    + 'Answer every point in it in plain text and end the turn. '
    + 'A question is answered from the record in the turn it is asked, so a read of the record (the plans, the session scratchpad, the doctrine and lessons, each repo\'s notes and plan pointers, this session\'s transcript), '
    + `the status command and TaskStop pass; every other call is held, an agent dispatch, a write and a read of an app's source among them${reviewed
      ? ', except the Standing review step and the step that review clears: the review begins after this message and reads it, so a move the correction does not touch goes on after it and a move it touches does not'
      : ''}. `
    + `A message whose last word is one of these lifts it: ${GO_WORDS.join(', ')}. `
    + 'Held work is sent again only in a turn that follows one.';
}

/**
 * The refusal while a stop stands.
 * @param {{at: number}} s  from `stopStanding`.
 * @returns {string} names the rule, says everything is held, the main thread's
 *   agents included, and what still passes, and prints the go-word list. It
 *   never quotes what the owner wrote.
 */
export function stopMessage(s) {
  return `STOP (Doctrine §0e rule 3): a message from the owner${s.at ? `, written ${californiaTime(new Date(s.at))} (California),` : ''} carries the word stop and does not end with a go-word, so everything is held, the main thread and every agent, a step the review cleared included, until the owner writes a message that ends with a go-word. `
    + 'Only the status command, TaskStop, an agent\'s own return and, on the main thread, a read of the record pass. '
    + 'Say in plain text what was running and that it is stopped, answer the message, and end the turn; an agent returns what it has, saying it was stopped. '
    + `A message whose last word is one of these lifts it: ${GO_WORDS.join(', ')}. A plain message typed after the stop does not.`;
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
 *   that step (`servedBy`: a step that serves none is not sent, by the standing
 *   goals in the hub CLAUDE.md). Anything else would carry instructions the owner has not read:
 *   other words in the prompt, or a custom type's own definition.
 *   THE STEPS THE PLAN HELD AT APPROVAL: where the marker recorded them (`approvedPlan`), a
 *   step that was not in the plan's Steps then, a Standing step that was not on the Standing
 *   line then, and a Standing step that is neither the review nor a route check named as one
 *   in its own first line, are refused (`approvalSetProblem`). Those refusals carry the mark
 *   `FENCE_NO_LATCH` and set no latch, because their remedy is the owner's button.
 *   THE REVIEW STEP KEEPS ITS PATH: where the marker recorded a review step, every step, a Standing
 *   one included, is refused while no Standing step of the plan names the review file by its full
 *   path (`reviewRecordProblem`), with the same mark and the same absence of a latch.
 *   THE POINTER: when the plan defines one (an `Order:` line under `## Order`,
 *   report.mjs `planOrder`), the only steps sent are N, the first number in Order
 *   with no DONE hand-back, and the plan's Standing steps; any other step is
 *   refused and the refusal prints N (`next: step N`, or `next: none` once every
 *   step in Order has a DONE hand-back, when only a Standing step may go). A plan
 *   with no `## Order`, and a session whose agents cannot be read, carry no
 *   pointer to enforce, and the checks above are all that apply. So does a plan
 *   whose Standing line has a step following the hub's aim-review.md: any step
 *   of it may pass this gate, and `reviewGate` decides which one goes.
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
  const head = 'DISPATCH GATE (Doctrine §0e): an agent\'s prompt is only the approved plan\'s path and a step number, so everything an agent is told is in the plan the owner read.';
  const refusal = (t) => `${t}\n${approvalBlock()}`;
  const type = p.tool_name === 'SendMessage' ? '' : String(input.subagent_type ?? '');
  if (type && !BUILTIN_AGENT_TYPES.has(type)) {
    return refusal(`${head} "${type}" is a custom agent type, and a custom type carries instructions of its own. Send one of: ${[...BUILTIN_AGENT_TYPES].join(', ')}.`);
  }
  if (!plan) return refusal(`${head} No approved plan is in force, so no agent can be sent.`);
  const n = sentStep(p, plan);
  if (n === null) return refusal(`${head} Send exactly: ${plan.path} step <n>, or ${stepsFilePath(plan.path)} step <n>`);
  if (namesStepsFile(p, plan)) {
    const bad = stepsFileProblem(plan);
    if (bad) return refusal(`${head} ${bad}`);
  }
  if (!planSteps(plan.text).includes(n)) return refusal(`${head} The plan has no step ${n}; its steps are ${planSteps(plan.text).join(', ') || 'none'}.`);
  // NO STEP IS SENT, A STANDING ONE INCLUDED, WHILE THE REVIEW STEP THE APPROVAL RECORDED HAS BEEN EDITED AWAY
  // (`reviewRecordProblem`; Doctrine §0e rules 2 and 13). The review gate enforces only where a Standing step names the
  // review file by its full path, so without this an edit of that step's text, which keeps the approval, switched the
  // review off and let the pointer send every step. The refusal carries the mark that sets no latch: the remedy is the
  // owner's button on the plan, and a latch would only stop the main thread's other calls as well.
  const gone = reviewRecordProblem(plan);
  if (gone) return refusal(`${head} ${gone} ${FENCE_NO_LATCH} this refusal sets no latch, so the next call is judged on its own.`);
  // A STEP THE PLAN DID NOT HOLD AT APPROVAL IS NOT SENT, NOR IS A STANDING STEP THAT IS NOT THE REVIEW OR A ROUTE
  // CHECK (`approvalSetProblem`; Doctrine §0e rules 2 and 13). An edit of the Steps or the Order keeps the approval,
  // so a step added by one, or put on the Standing line by one, is checked here against the numbers the marker
  // recorded at approval. The refusal carries the mark that sets no latch: the remedy is the owner's button, and
  // a latch would only stop the main thread's other calls as well.
  const unread = approvalSetProblem(plan, n);
  if (unread) return refusal(`${head} ${unread} ${FENCE_NO_LATCH} this refusal sets no latch, so the next call is judged on its own.`);
  // A STEP THAT SERVES NO GOAL IS NOT SENT (the standing goals in the hub
  // CLAUDE.md): the plan's "Served by:" line has to name, for this step, a goal its
  // Goals section defines. That line is not part of the Goals the owner approves
  // (`goalsWithoutServedBy` in report.mjs), so a step can be added to it with no new approval.
  if (!servedBy(plan.text).get(n)?.length) {
    return refusal(`${head} The plan's "Served by:" line names no goal for step ${n}, so the step serves none and is not sent. The line is in the plan's "## Goals" section; it may be amended with the Steps, and the approval holds.`);
  }
  // THE POINTER (Doctrine §0e rule 13): only step N and a Standing step are
  // sent. N is read from the agents' own hand-backs, never from the session.
  // A plan with a review step has no pointer to enforce here: the move is
  // chosen from the evidence and cleared by a fresh review (`reviewGate`), any
  // step of the plan and not only N.
  let ptr = pointer;
  if (aimReviewSteps(plan.text).length) ptr = null;
  else if (ptr === undefined) { try { ptr = pointerFor(p, plan.text); } catch { ptr = null; } }
  if (ptr && n !== ptr.next && !ptr.standing.includes(n)) {
    const standing = ptr.standing.length ? `Standing step${ptr.standing.length === 1 ? '' : 's'} ${ptr.standing.join(', ')}` : 'no Standing step';
    return refusal(`${head} The pointer reads ${ptr.next === null ? 'next: none (every step in Order has a DONE hand-back)' : `next: step ${ptr.next}`}. `
      + `Step ${n} is neither that step nor a Standing step, so it is not sent now. ${ptr.next === null ? `Only ${standing} may be sent.` : `Send ${plan.path} step ${ptr.next}, or ${standing}.`} `
      + 'A step becomes next only when an agent hands back for the step before it with DONE as the first line; a REFUSED or FAILED hand-back leaves it where it is.');
  }
  return null;
}

/**
 * The step number a main-thread Agent, Task or SendMessage call is sent for.
 * @param {object} p  the call's payload: `prompt` (`message` for SendMessage).
 * @param {{path: string}|null} plan  the plan in force.
 * @returns {number|null} N when the prompt is exactly `<plan path> step <N>` (the
 *   word "step" optional, case set aside); null for anything else, or with no plan.
 *   The ONE place this regex lives: the dispatch gate, the correction check and
 *   the review gate all read the step here, so they cannot judge two different numbers.
 */
export function sentStep(p, plan) {
  const input = p.tool_input ?? {};
  const said = p.tool_name === 'SendMessage' ? (input.message ?? input.prompt ?? input.content) : input.prompt;
  const names = plan ? [plan.path, stepsFilePath(plan.path)].map(esc).join('|') : '';
  const m = plan && typeof said === 'string' ? new RegExp(`^\\s*(?:${names})\\s+(?:step\\s+)?(\\d+)\\s*$`, 'i').exec(said) : null;
  return m ? Number(m[1]) : null;
}

/**
 * Does a main-thread send name the plan's steps file, and not the plan?
 * @param {object} p  an Agent, Task or SendMessage call.
 * @param {{path: string}|null} plan  the plan in force.
 * @returns {boolean} true only when the prompt (a message, for SendMessage) is exactly
 *   `<steps file path> step <N>` (`stepsFilePath` of the plan's path): the one prompt
 *   `dispatchGate` then holds to `stepsFileProblem` before it sends.
 */
export function namesStepsFile(p, plan) {
  const input = p.tool_input ?? {};
  const said = p.tool_name === 'SendMessage' ? (input.message ?? input.prompt ?? input.content) : input.prompt;
  return !!plan && typeof said === 'string' && new RegExp(`^\\s*${esc(stepsFilePath(plan.path))}\\s+(?:step\\s+)?\\d+\\s*$`, 'i').test(said);
}

/**
 * What is wrong with the steps file of the plan in force.
 * @param {{path: string, text: string}} plan  the plan in force.
 * @param {string} [file]  the steps file; `stepsFilePath` of the plan's path by default.
 * @returns {string|null} null when the file on disk is exactly `stepsFileText` of the
 *   plan's text, the file approved-plan-guard.mjs wrote at approval or at the last
 *   amendment; otherwise a sentence saying it is missing or is not the plan in force.
 *   An agent sent the steps file reads only that, so a file that is not the plan's
 *   Rules, Steps and Commands as they stand now would hand it another plan's work:
 *   the gate fails closed on a file it cannot read and sends no step by it.
 */
export function stepsFileProblem(plan, file = stepsFilePath(plan.path)) {
  let disk;
  try { disk = readFileSync(file, 'utf8'); } catch (e) {
    return `The steps file ${file} cannot be read (${e?.code ?? e?.message ?? e}), so a prompt naming it is not sent. Send the plan's path and the step number, or approve and amend the plan again, which writes the file.`;
  }
  if (disk !== stepsFileText(plan.text, plan.path)) {
    return `The steps file ${file} is not the Rules, Steps and Commands of the plan in force as they stand now, so it is not sent. The approval and every amendment rewrite it; send the plan's path and the step number instead.`;
  }
  return null;
}

/**
 * THE REVIEW GATE (Doctrine §0e rule 2): where a Standing step of the plan
 * follows the hub's aim-review.md, no other step is sent until a fresh agent that
 * wrote neither the plan nor the work has cleared it. The manager chooses the
 * next move from the evidence, any step of the plan and not only the pointer's,
 * and the reviewer reads that move against the owner's aim and the guards' own
 * rules before it goes.
 * @param {object} p  a main-thread Agent, Task or SendMessage call.
 * @param {{path: string, text: string} | null} [plan]  the plan in force.
 * @param {ReturnType<typeof reviewState>|null} [state]  report.mjs `reviewState`'s
 *   answer, passed by the test; read from the session when undefined. null is a
 *   state that could not be read, and refuses.
 * @returns {string|null} the refusal, or null. Null for a subagent's call, for a
 *   tool that sends no agent, for a prompt that is not a plan step (the dispatch
 *   gate judges that), for a plan with no review step (not enforced, unless the
 *   approval recorded one: `reviewRecordProblem` refuses every step of such a plan,
 *   a Standing one included, before this is judged, and that refusal does not
 *   latch), for a
 *   Standing step the approval recorded that is the review or a route check
 *   (the review step is one; any other Standing step is refused by
 *   `approvalSetProblem`, with a refusal that does not latch), and for a step the
 *   current review CLEARED (ON-AIM ROUTE-CLEAR naming that step as next, begun
 *   after the newest end of an agent for a step in Order, after the plan's last
 *   write and after `after`, its "step" the step of that newest end). The other
 *   states refuse: a clearance for another step; 'missing', 'running', 'stale',
 *   'unreadable', 'wrong-step', 'no-next' naming the Standing review step as the
 *   way out, which sending it clears; 'route-refused' naming the amendment of the
 *   plan's Steps or Order that answers it (an edit to them keeps the approval, and
 *   the amended step is reviewed again); 'off-aim' saying the plan is off aim and
 *   goes back to plan mode; and 'not-read', which fails CLOSED: with a review step
 *   in the plan and the session's agents unreadable, no step is sent. A failure
 *   inside the read refuses the same way, because a gate that silently stops
 *   gating is the defect this family keeps recording. NONE of these latches:
 *   main() calls this after the report gate and refuses with latch false, because
 *   the remedy is a send, an amendment or entering plan mode, and a latch would
 *   wait on the owner for nothing.
 */
export function reviewGate(p, plan = approvedPlan(), state = undefined) {
  if (p.agent_id || !/^(?:Agent|Task|SendMessage)$/.test(String(p.tool_name ?? ''))) return null;
  const n = sentStep(p, plan);
  // A REVIEW STEP THAT THE APPROVAL RECORDED AND THE PLAN NO LONGER HAS REFUSES EVERY STEP, A STANDING ONE INCLUDED
  // (`reviewRecordProblem`): without it the next line returns null for a plan whose review step was edited until it
  // names no review file, which is the plan the gate is there to hold. It is asked before anything else is judged.
  const gone = n === null ? null : reviewRecordProblem(plan);
  if (gone) return `REVIEW GATE (Doctrine §0e rule 2): ${gone} This refusal does not latch.`;
  const o = plan ? planOrder(plan.text) : null;
  if (n === null || !o || !aimReviewSteps(plan.text).length) return null;
  // A Standing step passes this gate, which is why the Standing line gains no step after approval: one that was not on
  // it at approval, or that is neither the review nor a route check, is refused here (`approvalSetProblem`).
  if (o.standing.includes(n)) {
    const unread = approvalSetProblem(plan, n);
    return unread ? `REVIEW GATE (Doctrine §0e rule 2): ${unread} This refusal does not latch.` : null;
  }
  let st = state;
  let failure = '';
  if (st === undefined) { try { st = reviewState(p, plan); } catch (e) { st = null; failure = String(e?.message ?? e); } }
  if (!st) st = { kind: 'error', reviewers: aimReviewSteps(plan.text), step: null, first: '', review: null, cleared: null };
  if (st.kind === 'not-enforced') return null;
  if (st.kind === 'cleared' && st.cleared === n) return null;
  const head = 'REVIEW GATE (Doctrine §0e rule 2):';
  const send = `Send the plan's Standing review step: ${plan.path} step ${st.reviewers[0]}. Its agent follows ${join(HUB, AIM_FILE)}, and its hand-back is the verdict, read from its own transcript. This refusal does not latch: sending that step clears it.`;
  if (st.kind === 'off-aim') {
    return `${head} the current review reads OFF-AIM ("${st.first}"), so the plan is aimed at the wrong thing and step ${n} is not sent. `
      + `Go back to plan mode, read the review's hand-back${st.review?.path ? ` (${st.review.path})` : ''} and the report it judged (progress/step-${st.step ?? 'N'}-report.txt in the session scratchpad), and rewrite the plan from them. `
      + 'This refusal does not latch: entering plan mode is the way on.';
  }
  if (st.kind === 'route-refused') {
    return `${head} the current review reads ROUTE-REFUSED ("${st.first}"): a command or write of the step it read would be refused by a guard. Step ${n} is not sent. `
      + `Amend the plan's Steps or Order from the commands the review names (an edit to those keeps the approval; ${SCOPE_SECTIONS.join(', ')} do not), then send the review again. `
      + 'This refusal does not latch: the amendment and a fresh review are the way on.';
  }
  if (st.kind === 'cleared') {
    return `${head} the current review cleared step ${st.cleared} ("${st.first}"), and step ${n} is another step, so it is not sent. Send step ${st.cleared}, or send the review again for step ${n}. ${send}`;
  }
  const why = {
    'not-read': 'the session\'s agents cannot be read, so no review can be read and no step is cleared',
    missing: 'no review of this plan has handed back',
    running: 'a review is running and no current one clears a move; its completion brings the session back',
    stale: 'the newest review began before the newest end of an agent for a step in Order (where the plan\'s Order has an After line, before an end of the step it judged, the step it clears or a step the cleared step follows), before the plan\'s last write, or before the owner\'s newest message, so it did not see what it would clear',
    unreadable: 'the newest review\'s hand-back does not open as a verdict (ON-AIM or OFF-AIM, then ROUTE-CLEAR or ROUTE-REFUSED, then "step N" and "next M")',
    'wrong-step': 'the newest review judged another step than the newest end of an agent for a step in Order',
    'no-next': 'the newest review names no step to send ("next M")',
    error: `the review could not be read (${failure || 'an error'}); the gate refuses rather than stop gating`,
  }[st.kind] ?? `the review is in a state this gate does not know (${st.kind})`;
  return `${head} ${why}, so step ${n} is not sent. ${send}`;
}

/**
 * Does a standing correction let this call through?
 * @param {object} p  a PreToolUse payload.
 * @param {{typed: number}} correction  from `correctionStanding`.
 * @param {{path: string, text: string} | null} [plan]  the plan in force.
 * @param {ReturnType<typeof reviewState>|null|undefined} [state]  `reviewState`'s
 *   answer, passed by the test; read from the session, with the review required to
 *   have begun after the message was typed, when undefined.
 * @returns {boolean} true only for a main-thread Agent, Task or SendMessage whose
 *   prompt is a step of a plan that has a review step, and which is either that
 *   review step (the remedy: its reviewer reads the correction and judges the next
 *   move with it in view) or the step a review that BEGAN AFTER the message from the
 *   owner was typed has cleared. A review that ran before the message cleared the
 *   move without having read it, so it counts for nothing here. Every
 *   other gate still judges the call afterwards; this only lifts the correction.
 */
export function correctionLifts(p, correction, plan = approvedPlan(), state = undefined) {
  if (p.agent_id || !/^(?:Agent|Task|SendMessage)$/.test(String(p.tool_name ?? ''))) return false;
  const n = sentStep(p, plan);
  if (n === null || !plan) return false;
  const reviewers = aimReviewSteps(plan.text);
  if (!reviewers.length) return false;
  if (reviewers.includes(n)) return true;
  let st = state;
  if (st === undefined) { try { st = reviewState(p, plan, { after: correction?.typed }); } catch { st = null; } }
  return !!st && st.kind === 'cleared' && st.cleared === n;
}

/**
 * Does a plan's After line name only steps of its Order?
 * @param {string} text  the plan (its current block).
 * @returns {string|null} the refusal, or null when the plan has no `## Order` or no `After:` line under it, or when every group of
 *   the line (`planAfter`) is of the form `N after M M` and names only steps on the Order line: a Standing step is outside it,
 *   and so is a step the plan does not number. The refusal lists each group that is not of the form and each number outside the
 *   Order. plan-guard.mjs refuses ExitPlanMode on it, because `reviewState` reads such a line as no After line, which is the strict
 *   reading and costs a review for every end of a sibling step; naming the fault at the approval is cheaper than finding it there.
 */
export function afterProblem(text) {
  const o = planOrder(text);
  const a = planAfter(text);
  if (!o || !a) return null;
  const outside = [...new Set([...a.follows.keys(), ...[...a.follows.values()].flat()].filter((n) => !o.order.includes(n)))];
  if (!a.bad.length && !outside.length) return null;
  const faults = [
    ...(a.bad.length ? [`${a.bad.length === 1 ? 'a group is' : 'groups are'} not of the form "N after M M" (${a.bad.map((g) => `"${g}"`).join(', ')})`] : []),
    ...(outside.length ? [`${outside.length === 1 ? 'step' : 'steps'} ${outside.join(', ')} ${outside.length === 1 ? 'is' : 'are'} not on the Order line (${o.order.join(', ')}); a Standing step is not on it`] : []),
  ];
  return `AFTER LINE (Doctrine §0e rule 2): the plan's "After:" line under "## Order" is refused: ${faults.join('; ')}. `
    + 'The line is groups of the form "N after M M" separated by semicolons, each number a step of the Order line, and it narrows what stales a review: '
    + 'a review that cleared step N stays current while a step that N does not follow ends, and is stale when the step it judged, the step it clears or a step N follows ends. '
    + 'A line the review state cannot read is read as no line, and then every end of a step in Order stales every review.';
}

/**
 * Does a plan with an Order carry the review?
 * @param {string} text  the plan (its current block).
 * @returns {string|null} the refusal, or null when the plan has no `## Order`
 *   (it has no pointer and no Standing line, and escapes this as it escapes the
 *   dispatch gate's) or its `Standing:` line names a step whose text names the
 *   hub's `aim-review.md` by its full path and says follow (`aimReviewSteps`). The
 *   refusal says what to add: a Standing step that tells its agent to follow the
 *   live clone's file by its full path. plan-guard.mjs refuses ExitPlanMode on it,
 *   and the review gate enforces only where such a step exists, so a plan can
 *   never reach a run whose gate refuses with no step to name.
 */
export function aimStandingProblem(text) {
  if (!planOrder(text)) return null;
  if (aimReviewSteps(text).length) return null;
  return `AIM REVIEW (Doctrine §0e rule 2): the plan has an "## Order", so its "Standing:" line has to name a step whose text tells its agent to follow ${join(HUB, AIM_FILE)} by that full path (a path, so it is no invented name). `
    + 'Every step of the plan is cleared by the review step\'s hand-back before it is sent: the main thread names the next move, sends the review, and the move goes only when the review reads ON-AIM ROUTE-CLEAR naming it. '
    + 'Add the step, name it on the Standing line, and name a goal it serves in the "Served by:" line.';
}

// ---- the shared rules: a plan points at one file instead of copying it (Doctrine §0e rule 13) ----

/** Where the shared rules file may be named from: this hub's, and the live clone's. */
const rulesPaths = () => new Set([join(HUB, RULES_FILE), join(homedir(), '.claude', 'hub', RULES_FILE)]);

/**
 * The pointer line a plan's Rules section carries.
 * @param {string} section  the body of the plan's `## Rules` section.
 * @returns {{path: string, version: number}|null} the first line there of the form
 *   `Rules: <full path of agent-rules.md>, version N` (a list marker or backticks
 *   round the path allowed), with the path and the number; null when none is.
 *   `rulesProblem` and `rulesPinProblem` both read the pointer here, so a plan the
 *   plan guard accepts is a plan the dispatch gate reads the same way.
 */
export function rulesPointer(section) {
  for (const l of String(section ?? '').split('\n')) {
    const m = /^\s*(?:[-*]\s+)?Rules:\s*`?(\/[^\s,;`'"()]*agent-rules\.md)`?\s*[,;:]?\s*version\s+(\d+)\b/i.exec(l);
    if (m) return { path: m[1], version: Number(m[2]) };
  }
  return null;
}

/**
 * Does a plan that sends agents carry the rules, or point at them?
 * @param {string} text  the plan (its current block).
 * @param {string} [file]  the rules file; this hub's by default.
 * @returns {string|null} the refusal, or null. A plan with no `## Steps` sends no
 *   agent and is not judged. Otherwise its `## Rules` section has to hold either a
 *   pointer line (`rulesPointer`) naming this hub's rules file by a full path and
 *   the version the file now carries, or every rule line of the file (each line
 *   opening `- `), whole; a copy may add rules and may not drop one, so a copy
 *   cannot drift from the file. A rules file that cannot be read as one (no
 *   `Rules version: N` line, no rule lines) refuses every such plan rather than
 *   passing them all. plan-guard.mjs refuses ExitPlanMode on it. The remedy the
 *   refusal names is the pointer, since a pointer cannot drift.
 */
export function rulesProblem(text, file = join(HUB, RULES_FILE)) {
  if (!planSection(text, 'Steps').trim()) return null;
  const head = 'SHARED RULES (Doctrine §0e rule 13):';
  const rules = agentRules(file);
  if (!rules || rules.version === null || !rules.block.length) {
    return `${head} the rules file ${file} cannot be read as a rules file (it needs a "Rules version: N" line and rule lines opening "- "), so no plan that sends agents can be checked against it. Restore it; do not weaken this check.`;
  }
  const line = `Rules: ${join(homedir(), '.claude', 'hub', RULES_FILE)}, version ${rules.version}.`;
  const section = planSection(text, 'Rules');
  if (!section.trim()) {
    return `${head} the plan sends agents (it has a "## Steps") and has no "## Rules" section. Its body is the line "${line}" or every rule line of that file copied whole; the agents read the file by that path.`;
  }
  const pointer = rulesPointer(section);
  if (pointer) {
    if (!rulesPaths().has(pointer.path)) return `${head} the plan's Rules line points at ${pointer.path}, which is not this hub's rules file. It names ${join(homedir(), '.claude', 'hub', RULES_FILE)}: "${line}"`;
    if (pointer.version !== rules.version) return `${head} the plan's Rules line pins version ${pointer.version} and the file now says version ${rules.version}. Read the file and pin the current one: "${line}"`;
    return null;
  }
  const have = new Set(section.split('\n').map((l) => l.trim()));
  const lacking = rules.block.filter((l) => !have.has(l.trim()));
  if (lacking.length) {
    return `${head} the plan's "## Rules" copies the rules and lacks ${lacking.length} of the file's ${rules.block.length} rule lines, the first opening "${lacking[0].slice(0, 70)}". A copy may add rules and may never take one away; point at the file instead, which cannot drift: "${line}"`;
  }
  return null;
}

/**
 * Is the version a plan's Rules line pins the version the file has now?
 * @param {string} text  the plan in force.
 * @param {string} [file]  the rules file; this hub's by default.
 * @returns {string|null} null for a plan whose Rules section is not a pointer (it
 *   copies the rules or sends no agent; `rulesProblem` judged that at ExitPlanMode)
 *   and for a pointer naming this hub's file at its current version; otherwise the
 *   refusal: the file cannot be read, the pointer names another file, or the file
 *   has moved on to another version since the plan was approved. The rules the
 *   agents follow are then not the rules the plan was read with, so no step is sent
 *   until the Rules line is amended after the file has been read. THE RULES LINE IS
 *   PART OF THE APPROVED SCOPE (`SCOPE_SECTIONS` in report.mjs, LESSONS §433): an edit
 *   to it voids the approval, so the plan goes back through plan mode and the
 *   plan-mode button with the current version pinned.
 */
export function rulesPinProblem(text, file = join(HUB, RULES_FILE)) {
  const pointer = rulesPointer(planSection(text, 'Rules'));
  if (!pointer) return null;
  const head = 'RULES GATE (Doctrine §0e rule 13):';
  const rules = agentRules(file);
  if (!rules || rules.version === null) return `${head} the plan points at ${pointer.path}, version ${pointer.version}, and that file cannot be read as a rules file, so no step is sent.`;
  if (!rulesPaths().has(pointer.path)) return `${head} the plan's Rules line points at ${pointer.path}, which is not this hub's rules file, so no step is sent. This refusal does not latch: amend the Rules line to ${join(homedir(), '.claude', 'hub', RULES_FILE)}, version ${rules.version}.`;
  if (pointer.version !== rules.version) {
    return `${head} the plan's Rules line pins version ${pointer.version} and ${join(homedir(), '.claude', 'hub', RULES_FILE)} now says version ${rules.version}, so the agents would follow rules the plan was not read with, and no step is sent. `
      + 'Read the file, then amend the Rules line to the current version (the Rules line is part of the approved scope, so that edit voids the approval and the plan goes back through plan mode and the plan-mode button). '
      + 'This refusal does not latch: the plan approved again with the current version clears it.';
  }
  return null;
}

/**
 * THE RULES GATE: no step is sent while the rules the plan pins are not the rules there are.
 * @param {object} p  a main-thread Agent, Task or SendMessage call.
 * @param {{path: string, text: string} | null} [plan]  the plan in force.
 * @param {string} [file]  the rules file; this hub's by default.
 * @returns {string|null} null for a subagent's call, for a tool that sends no agent,
 *   for a prompt that is not a step of the plan (the dispatch gate judges that),
 *   and for a plan that does not pin a version; else `rulesPinProblem`'s refusal,
 *   the Standing review step included, because the remedy is an amendment and not
 *   an agent. main() calls it with latch false.
 */
export function rulesGate(p, plan = approvedPlan(), file = undefined) {
  if (p.agent_id || !/^(?:Agent|Task|SendMessage|Workflow)$/.test(String(p.tool_name ?? ''))) return null;
  if (!plan || (p.tool_name !== 'Workflow' && sentStep(p, plan) === null)) return null;
  return rulesPinProblem(plan.text, file);
}

// ---- a refused read of the record is read again before a step goes (Doctrine §0e rule 13) ----

/**
 * Record a refused read, when it was a read of the record.
 * @param {object} p  a main-thread payload of a refused call (PreToolUse) or of a
 *   failed one (PostToolUseFailure).
 * @param {string} why  the refusal's or the failure's text.
 * @returns {boolean} true when the refusal was recorded (`noteRefusedRead` in
 *   report.mjs): the call is the main thread's Read, of a regular file that exists, and
 *   `recordPath` says that file is of the record. A refused read of anything
 *   else is the manager fence doing its work and is not recorded, and neither is
 *   a read of a file that is not there, because neither can be read to clear
 *   the record. The status names what is recorded and `readsGate` sends no step
 *   while it stands.
 */
export function noteRefusedReadCall(p, why) {
  if (p.agent_id || p.tool_name !== 'Read' || !p.session_id) return false;
  const f = String(p.tool_input?.file_path ?? '');
  if (!f) return false;
  const abs = absOf(f, p.cwd ? String(p.cwd) : process.cwd());
  try { if (!statSync(abs).isFile()) return false; } catch { return false; }
  let record = false;
  try { record = recordPath(abs, p, () => approvedPlan()?.path); } catch { record = false; }
  return record ? noteRefusedRead(p.session_id, abs, why) : false;
}

/**
 * THE READS GATE: no step is sent while a refused read of the record has not been read.
 * @param {object} p  a main-thread Agent, Task, SendMessage or Workflow call.
 * @param {{path: string, text: string} | null} [plan]  the plan in force.
 * @param {{path: string, at: number, why: string}[]|undefined} [open]  `unreadRefusals`'
 *   answer, passed by the test; read from the session's record and transcript when undefined.
 * @returns {string|null} null for a subagent's call, for a tool that sends no agent, for
 *   a prompt that is not a step of the plan (the dispatch gate judges that), and when
 *   no refused read stands. Otherwise the refusal, which names each path, when it was
 *   refused, and the remedy: Read it. A record that cannot be read does not refuse
 *   (`refusedReads` answers [] for a session with none), and a path that is gone is
 *   not named (`unreadRefusals`), so the gate can always be cleared by reading what
 *   it names. main() calls it with latch false: reading the file is the way out, and a
 *   latch would wait on the owner for nothing.
 */
export function readsGate(p, plan = approvedPlan(), open = undefined) {
  if (p.agent_id || !/^(?:Agent|Task|SendMessage|Workflow)$/.test(String(p.tool_name ?? ''))) return null;
  if (p.tool_name !== 'Workflow' && (!plan || sentStep(p, plan) === null)) return null;
  let list = open;
  if (list === undefined) {
    const refused = refusedReads(p.session_id);
    list = refused.length ? unreadRefusals(refused, tailEntries(p.transcript_path ?? '', 16 * 1024 * 1024)) : [];
  }
  if (!list.length) return null;
  const named = list.slice(0, 10).map((x) => `- ${x.path}, refused at ${californiaTime(new Date(x.at))} (California)`);
  return `READS GATE (Doctrine §0e rule 13): ${list.length === 1 ? 'a read' : `${list.length} reads`} of the record the main thread made ${list.length === 1 ? 'was' : 'were'} refused and no Read has returned since, so the main thread has not read what it needs and no step is sent on it:\n`
    + `${named.join('\n')}${list.length > named.length ? `\n… and ${list.length - named.length} more` : ''}\n`
    + 'Read each file now (a Read with an offset and a limit, as often as it takes), then send the step. This refusal does not latch: reading clears it.';
}

// ---- the manager's written judgement of each hand-back, and its reasons for each send (Doctrine §0e rule 2) ----

/**
 * THE JUDGEMENT GATE (LESSONS §407, §417): no step is sent until the newest hand-back has been
 * judged in writing, in five parts, and the step about to go has its reasons written, in four.
 * @param {object} p  a main-thread Agent, Task or SendMessage call.
 * @param {{path: string, text: string} | null} [plan]  the plan in force.
 * @param {ReturnType<typeof judgedState>|null|undefined} [state]  report.mjs `judgedState`'s
 *   answer, passed by the test; read from the session, with the step being sent, when undefined.
 * @returns {string|null} null for a subagent's call, for a tool that sends no agent, for a
 *   prompt that is not a step of the plan (the dispatch gate judges that), for a Standing
 *   step (the review step is sent between hand-backs and judges them), and for a plan with
 *   no step. The plan's steps are its Order where it has one and its `## Steps` where it has
 *   not (`stepNumbers`), so a plan with no Order is gated too. Otherwise null only when
 *   status/manager.txt in the session scratchpad carries, written after the newest end of an
 *   agent for a step of the plan: a line keyed `Judged N:` (N the step of that newest end,
 *   whatever its first line: a REFUSED or FAILED hand-back is judged too) for every end of
 *   that step, each with the five parts `is`, `why`, `route`, `fails` and `cheapest`
 *   (`JUDGED_PARTS`), each of ten characters or more; and a line keyed `Why M:` (M the step
 *   being sent) for each earlier end of that step and one more for this send, each with the
 *   four parts `now`, `wrong`, `fails` and `cheapest` (`WHY_PARTS`), each of ten characters
 *   or more (`judgedState`), so a line left from an earlier send does not stand for the next
 *   one. Else the refusal, which names the file and the line to write. A state that cannot
 *   be read refuses, as the review gate does: a gate that stops gating in silence is the
 *   defect. main() calls it with latch false: writing the line is the way out, and a latch
 *   would wait on the owner for nothing. It forces each part to be written and cannot judge
 *   that what is written is true.
 */
export function judgedGate(p, plan = approvedPlan(), state = undefined) {
  if (p.agent_id || !/^(?:Agent|Task|SendMessage)$/.test(String(p.tool_name ?? ''))) return null;
  const n = sentStep(p, plan);
  const sn = plan ? stepNumbers(plan.text) : null;
  if (n === null || !sn || sn.standing.includes(n)) return null;
  let st = state;
  let failure = '';
  if (st === undefined) { try { st = judgedState(p, plan, { send: n }); } catch (e) { st = null; failure = String(e?.message ?? e); } }
  const head = 'JUDGEMENT GATE (Doctrine §0e rule 2):';
  if (!st) return `${head} the manager's judgement could not be read (${failure || 'an error'}); the gate refuses rather than stop gating.`;
  if (st.kind === 'not-enforced' || st.kind === 'judged') return null;
  if (st.kind === 'not-read') return `${head} the session's agents cannot be read, so whether the newest hand-back has been judged cannot be told and step ${n} is not sent.`;
  const where = st.file || 'status/manager.txt in the session scratchpad (no scratchpad was found for this session)';
  if (/^why-/.test(st.kind)) {
    const have = st.whyHave ?? 0, need = st.whyNeed ?? 1;
    const found = st.kind === 'why-incomplete' ? `its newest line lacks ${(st.whyMissing ?? []).join(', ') || 'a part'} or carries a part under ten characters` : `the file holds ${have} whole line${have === 1 ? '' : 's'}`;
    return `${head} step ${n} is about to go and ${where} holds ${have} whole line${have === 1 ? '' : 's'} keyed "Why ${n}:" of the ${need} it needs, one for each earlier end of that step and one for this send (${found}). `
      + `Write one line: "Why ${n}: ${WHY_PARTS[0]}: <why it goes now> | ${WHY_PARTS[1]}: <what would make it wrong> | ${WHY_PARTS[2]}: <where it fails next> | ${WHY_PARTS[3]}: <why this is the cheapest route>", each part ten characters or more. `
      + 'This refusal does not latch: writing the line clears it.';
  }
  const found = st.kind === 'no-pad' ? 'no notes file could be read'
    : st.kind === 'none' ? 'the file holds no such line'
      : st.kind === 'short' ? `the file holds ${st.have} such line${st.have === 1 ? '' : 's'} for ${st.ends} ends of that step, so the newest end has none of its own`
        : st.kind === 'incomplete' ? `the file holds ${st.partial ?? 0} line${st.partial === 1 ? '' : 's'} for that step that lack ${(st.missing ?? []).join(', ') || 'a part'} or carry a part under ten characters`
          : `its last write (${st.notesAt ? californiaTime(new Date(st.notesAt)) : 'never'}) is not after that end`;
  return `${head} the newest hand-back of a step of the plan is step ${st.step}'s, ended ${californiaTime(new Date(st.endAt))} (California), and ${where} has no line keyed "Judged ${st.step}:" with all five parts written after it (${found}). `
    + `Read the hand-back and write one line: "Judged ${st.step}: ${JUDGED_PARTS[0]}: <what it showed, read from the transcript and the report> | ${JUDGED_PARTS[1]}: <why it ended as it did> | ${JUDGED_PARTS[2]}: <what that means for the route> | ${JUDGED_PARTS[3]}: <where the route fails next> | ${JUDGED_PARTS[4]}: <the cheapest route from here that holds the owner's rules>", each part ten characters or more. `
    + `Step ${n} is not sent until it is there, and not until a "Why ${n}:" line of four parts is there too. This refusal does not latch: writing the line clears it.`;
}

// ---- the finding queue: findings recorded for the next plan (Doctrine §0e rule 2) ----

/** The heading, in a repository's NOTES.md, of the section that queues findings for the next plan. */
export const QUEUE_HEADING = 'Found queue';
// A queued finding opens with its key, Q-<repo tag>-<number>: the tag is the repo's, so a key in one repo cannot answer another's.
const QUEUE_KEY = /^\s*(?:[-*]\s+)?\**(Q-[A-Za-z0-9]+-\d+)\**\s*[:.]?\s*(.*)$/;
// A range of one repo's keys in a plan's "Found answered": `Q-JPS-1 to Q-JPS-12 still queued: <reason>`.
const QUEUE_RANGE = /^\s*(?:[-*]\s+)?\**Q-([A-Za-z0-9]+)-(\d+)\**\s+(?:to|through|[-–—])\s+\**Q-([A-Za-z0-9]+)-(\d+)\**\s*[:.]?\s*(.*)$/i;

/**
 * The findings a repository has queued.
 * @param {string} root  a repository's root directory.
 * @returns {{key: string, text: string}[]} each line of the `## Found queue`
 *   section of the root's NOTES.md that opens with a key (`Q-HUB-3`), in file order;
 *   [] when the file or the section is not there. Lines of the section that open
 *   with no key are prose and are not findings.
 */
export function foundQueue(root) {
  let text = '';
  try { text = readFileSync(join(root, 'NOTES.md'), 'utf8'); } catch { return []; }
  const out = [];
  for (const l of planSection(text, QUEUE_HEADING).split('\n')) {
    const m = QUEUE_KEY.exec(l);
    if (m) out.push({ key: m[1], text: m[2].trim() });
  }
  return out;
}

/**
 * The repositories a plan touches that can hold a queue.
 * @param {string} text  the plan.
 * @param {string} [dir]  the launch directory; CLAUDE_PROJECT_DIR or the working
 *   directory by default.
 * @returns {string[]} the roots, each once, among this hub, the launch directory,
 *   what is under it and its siblings (those holding a `.git`), that a label of the
 *   plan's `## Files` section names (`labelNames`). [] when Files names no label.
 */
export function queueRoots(text, dir = process.env.CLAUDE_PROJECT_DIR || process.cwd()) {
  const labels = [...new Set(planFiles(text).map((f) => f.repo).filter(Boolean))];
  if (!labels.length) return [];
  const scan = (d) => { try { return readdirSync(d).map((n) => join(d, n)); } catch { return []; } };
  const at = resolve(dir);
  const cands = [HUB, at, ...scan(at), ...(existsSync(join(at, '.git')) ? scan(dirname(at)) : [])];
  const seen = new Set();
  const roots = [];
  for (const d of cands) {
    const r = resolve(d);
    if (seen.has(r)) continue;
    seen.add(r);
    if (r !== HUB && !existsSync(join(r, '.git'))) continue;
    if (labels.some((l) => labelNames(l, r))) roots.push(r);
  }
  return roots;
}

/**
 * Does a plan answer every finding queued for it?
 * @param {string} text  the plan (its current block).
 * @param {{roots?: string[], dir?: string}} [opts]  the repositories to read, and
 *   the launch directory they are found from; found from the plan's Files by default.
 * @returns {string|null} the refusal, or null. Every finding in the `## Found queue`
 *   of the NOTES.md of each repository the plan's Files names (`queueRoots`) has to
 *   be answered in a `## Found answered` section of the plan, one line each,
 *   opening with the finding's key and then `fixed in step N`, `carried to step N`,
 *   `still queued` or `dropped` followed by a reason of at least ten characters. A
 *   key seen in two repositories counts once. The refusal lists each finding that
 *   is unanswered, with its key and the start of its text. A RANGE LINE answers the
 *   keys a plan leaves untouched in one line, `Q-JPS-1 to Q-JPS-12 still queued: <the
 *   reason>` (`to`, `through` or a dash between two keys of one repository's tag, the
 *   lower first, and only the verdict `still queued` with a reason of ten characters or
 *   more): every queued key between them, the ends included, counts as answered. It forces an answer and
 *   cannot judge that it is true. plan-guard.mjs refuses ExitPlanMode on it, so the
 *   next plan in any repository has to answer what the last one left.
 */
export function foundAnsweredProblem(text, opts = {}) {
  const roots = opts.roots ?? queueRoots(text, opts.dir);
  const queued = new Map();
  for (const r of roots) for (const q of foundQueue(r)) if (!queued.has(q.key)) queued.set(q.key, { ...q, repo: basename(r) });
  if (!queued.size) return null;
  const answered = new Set();
  for (const l of planSection(text, 'Found answered').split('\n')) {
    // A RANGE LINE answers the keys a plan leaves untouched in one line:
    // "Q-JPS-1 to Q-JPS-12 still queued: <the reason>" (to, through, or a dash), both ends of
    // one repo's tag, the lower first. Only "still queued" with a reason may take a range:
    // a finding fixed, carried or dropped is answered by its own line.
    const r = QUEUE_RANGE.exec(l);
    if (r) {
      const lo = Number(r[2]), hi = Number(r[4]);
      if (r[1] === r[3] && lo <= hi && /^still queued\b[\s,:;.-]*\S.{9,}$/i.test(r[5].trim())) {
        for (const q of queued.values()) {
          const k = /^Q-([A-Za-z0-9]+)-(\d+)$/.exec(q.key);
          if (k && k[1] === r[1] && Number(k[2]) >= lo && Number(k[2]) <= hi) answered.add(q.key);
        }
      }
      continue;
    }
    const m = QUEUE_KEY.exec(l);
    if (!m) continue;
    const v = m[2].trim();
    if (/^(?:fixed in step|carried to step)\s+\d+\b/i.test(v) || /^(?:still queued|dropped)\b[\s,:;.-]*\S.{9,}$/i.test(v)) answered.add(m[1]);
  }
  const open = [...queued.values()].filter((q) => !answered.has(q.key));
  if (!open.length) return null;
  const shown = open.slice(0, 10).map((q) => `- ${q.key} (${q.repo}): ${q.text.length > 100 ? `${q.text.slice(0, 100)}…` : q.text}`);
  return `FOUND QUEUE (Doctrine §0e rule 2): the repositories this plan's Files names hold ${open.length} queued finding${open.length === 1 ? '' : 's'} the plan does not answer, and what one plan found and left is answered by the next. `
    + 'Add a "## Found answered" section with one line for each, opening with its key and then "fixed in step N", "carried to step N", "still queued, <the reason>" or "dropped, <the reason>":\n'
    + `${shown.join('\n')}${open.length > shown.length ? `\n… and ${open.length - shown.length} more` : ''}`;
}

// ---- a plan is made from quoted evidence and from the whole roadmap (Doctrine §0e rule 2) ----

// A source file named in a line of the plan: a path or a bare file name with an extension a repository holds as text.
const SOURCE_FILE = /(?<![\w./-])((?:\/|[\w.-]+\/)*[\w.-]+\.(?:md|mjs|cjs|js|ts|tsx|json|txt|html|css|sh|yml|yaml|toml))(?![\w-])/g;
// A span a line quotes: between straight or curly double quotes, at least twelve characters.
const QUOTED_SPAN = /"([^"\n]{12,})"|“([^”\n]{12,})”/g;
// What the plan's "What is" and "Roadmap" lines are made of: a bullet or a number, then the words.
const LIST_LINE = /^\s*(?:[-*]|\d+[.)])\s+(\S.*)$/;
const flat = (s) => String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();

/**
 * Where a file a plan line names may be.
 * @param {string} name  as written in the plan: an absolute path, a path, or a bare file name.
 * @param {string[]} roots  the repositories the plan's Files names (`queueRoots`).
 * @returns {string[]} every existing file the name can mean: the path itself if absolute;
 *   else, in each root, the name under the root, and a bare name also under `docs/decisions/`,
 *   `docs/`, `lessons/` and `plans/`. [] when none exists.
 */
function namedFileCandidates(name, roots) {
  const cands = name.startsWith('/') ? [name] : roots.flatMap((r) => [join(r, name),
    ...(name.includes('/') ? [] : ['docs/decisions', 'docs', 'lessons', 'plans'].map((d) => join(r, d, name)))]);
  return [...new Set(cands)].filter((f) => { try { return statSync(f).isFile(); } catch { return false; } });
}

/**
 * Does every "What is" line of a plan quote a line present in a file it names?
 * @param {string} text  the plan (its current block).
 * @param {{roots?: string[], dir?: string}} [opts]  the repositories to search, and the launch
 *   directory they are found from; found from the plan's Files by default (`queueRoots`).
 * @returns {string|null} the refusal, or null. The plan's `## What is` section lists what the
 *   plan rests on, one bullet each, and a bullet is evidence only if it QUOTES: it holds a
 *   span in double quotes (twelve characters or more; `...` or an ellipsis inside it stands
 *   for words left out, and each stretch between them is looked for on its own), and names a
 *   file (`SOURCE_FILE`) outside the quote that some repository the Files names holds
 *   (`namedFileCandidates`), and every stretch of the quote is present in that file, white
 *   space and curly quotes set aside. The refusal lists each bullet that fails and why: no
 *   quote, no file named, a file no repository holds, or a quote the file does not carry.
 *   A plan whose Files names no repository, or with no `## Steps`, is not judged; one that
 *   names a repository and has Steps without the section, or with a section holding no
 *   bullet, is refused. It cannot judge that the line means what the plan says it does.
 *   plan-guard.mjs refuses ExitPlanMode on it.
 */
export function whatIsProblem(text, opts = {}) {
  if (!planSection(text, 'Steps').trim()) return null;
  const roots = opts.roots ?? queueRoots(text, opts.dir);
  if (!roots.length) return null;
  const head = 'WHAT IS (Doctrine §0e rule 2): a plan rests on evidence it can quote.';
  const lines = planSection(text, 'What is').split('\n').map((l) => LIST_LINE.exec(l)?.[1]).filter(Boolean);
  if (!lines.length) return `${head} The plan sends agents into ${roots.map((r) => basename(r)).join(', ')} and has no "## What is" section with a bullet in it. Each bullet quotes, in double quotes, a line of a file it names, such as NOTES.md or IR-SCIENCE.md.`;
  const bad = [];
  for (const line of lines) {
    const spans = [...line.matchAll(QUOTED_SPAN)].map((m) => m[1] ?? m[2]);
    const outside = line.replace(QUOTED_SPAN, ' ');
    const label = `"${line.length > 80 ? `${line.slice(0, 80)}…` : line}"`;
    if (!spans.length) { bad.push(`- ${label}: it quotes nothing (a span in double quotes of twelve characters or more)`); continue; }
    const named = [...outside.matchAll(SOURCE_FILE)].map((m) => m[1]);
    if (!named.length) { bad.push(`- ${label}: it names no file outside the quote`); continue; }
    const files = named.flatMap((n) => namedFileCandidates(n, roots));
    if (!files.length) { bad.push(`- ${label}: no repository the Files names holds ${named.join(' or ')}`); continue; }
    const stretches = spans.flatMap((s) => s.split(/\s*(?:\.{3}|…)\s*/)).map(flat).filter((s) => s.length >= 4);
    const held = files.some((f) => { let t = ''; try { t = flat(readFileSync(f, 'utf8')); } catch { return false; } return stretches.every((s) => t.includes(s)); });
    if (!held) bad.push(`- ${label}: ${files.length === 1 ? 'the file does' : 'none of the files'} not carry${files.length === 1 ? '' : ' it'} the quote (${files.map((f) => basename(f)).join(', ')})`);
  }
  if (!bad.length) return null;
  return `${head} ${bad.length} of the "## What is" bullets ${bad.length === 1 ? 'does' : 'do'} not quote a line present in a file they name:\n${bad.slice(0, 8).join('\n')}${bad.length > 8 ? `\n… and ${bad.length - 8} more` : ''}\n`
    + 'Quote the line itself, in double quotes, and name the file it is in; a sentence from a conversation or a page that is not in a repository is not evidence here.';
}

/**
 * A repository's open roadmap items.
 * @param {string} root  a repository's root directory.
 * @returns {{key: string, title: string}[]} each top-level `- [ ] **Title**` bullet of the
 *   `## Next capability release` section of the root's NOTES.md (the section the app's
 *   in-app roadmap is built from, which holds open items only), in file order; `key` is
 *   the item's decision number from its `<!-- decision: NNN -->` marker, else its title.
 *   [] when the file or the section is not there, as in a repository that keeps no roadmap.
 */
export function roadmapItems(root) {
  let text = '';
  try { text = readFileSync(join(root, 'NOTES.md'), 'utf8'); } catch { return []; }
  const out = [];
  for (const l of planSection(text, 'Next capability release').split('\n')) {
    const m = /^- \[ \] \*\*(.+?)\*\*(.*)$/.exec(l);
    if (!m) continue;
    const d = /<!--\s*decision:\s*(\d+)\s*-->/.exec(m[2]);
    out.push({ key: d ? d[1] : m[1].trim(), title: m[1].trim() });
  }
  return out;
}

/**
 * Does a plan say, for every open roadmap item of the repositories it names, whether it is in and why?
 * @param {string} text  the plan (its current block).
 * @param {{roots?: string[], dir?: string}} [opts]  as `whatIsProblem` takes them.
 * @returns {string|null} the refusal, or null. Each open roadmap item of each repository the
 *   plan's Files names (`roadmapItems`) has a line in the plan's `## Roadmap` section: a
 *   bullet opening with the item's key (its decision number, else its title), then `in` or
 *   `out` as a word, then a reason of at least ten characters. The refusal lists the items
 *   with no such line. A plan with no `## Steps`, or whose Files names no repository that
 *   keeps a roadmap, is not judged. It forces a statement and cannot judge that it is true.
 *   plan-guard.mjs refuses ExitPlanMode on it.
 */
export function roadmapProblem(text, opts = {}) {
  if (!planSection(text, 'Steps').trim()) return null;
  const roots = opts.roots ?? queueRoots(text, opts.dir);
  const items = roots.flatMap((r) => roadmapItems(r).map((i) => ({ ...i, repo: basename(r) })));
  if (!items.length) return null;
  const said = planSection(text, 'Roadmap').split('\n').map((l) => LIST_LINE.exec(l)?.[1]).filter(Boolean).map((l) => l.replace(/^\*+|\*+$/g, '').replace(/\*\*/g, ''));
  const answered = (i) => said.some((l) => {
    const k = String(i.key).toLowerCase();
    const low = l.toLowerCase().replace(/^decision\s+/, '');
    if (!low.startsWith(k)) return false;
    return /^[\s:,;.-]*(?:in|out)\b[\s:,;.-]*\S.{9,}$/i.test(low.slice(k.length));
  });
  const open = items.filter((i) => !answered(i));
  if (!open.length) return null;
  const shown = open.slice(0, 12).map((i) => `- ${i.key} (${i.repo}): ${i.title.length > 90 ? `${i.title.slice(0, 90)}…` : i.title}`);
  return `ROADMAP (Doctrine §0e rule 2): the repositories this plan's Files names hold ${items.length} open roadmap item${items.length === 1 ? '' : 's'}, and ${open.length} ${open.length === 1 ? 'has' : 'have'} no line in the plan. `
    + 'Add a "## Roadmap" section with one bullet for each, opening with its key (the decision number, else the title), then "in" or "out", then why (ten characters or more):\n'
    + `${shown.join('\n')}${open.length > shown.length ? `\n… and ${open.length - shown.length} more` : ''}`;
}

// ---- a plan that marks a roadmap item as work reads the app's commit log first (Doctrine §0e rule 2, LESSONS §423) ----

/**
 * The branches a repository ships on and stages on.
 * @param {string} root  a repository's root directory.
 * @returns {{production: string, staging: string}} `promote=` and `work=` of the root's `.branch-guard`, the file that says
 *   where a repository's work commits and where it is moved to; `main` and `staging` for a name the file does not give or
 *   gives as a pattern (`claude/*`). A repository whose work branch is its production branch (the hub: `work=main`) reads the
 *   same name twice. `commitLogRead` and `shippedCheckProblem` both ask it, so the read a plan needs and the line it writes
 *   name the same two branches.
 */
export function repoBranches(root) {
  let text = '';
  try { text = readFileSync(join(root, '.branch-guard'), 'utf8'); } catch { /* no file: the defaults below */ }
  const key = (k) => new RegExp(`^[ \\t]*${k}[ \\t]*=[ \\t]*([^\\s#]+)`, 'm').exec(text)?.[1];
  const plain = (n) => (n && !/[*?[\]{}]/.test(n) ? n : undefined);
  return { production: plain(key('promote')) ?? 'main', staging: plain(key('work')) ?? 'staging' };
}

/**
 * The open roadmap items a plan marks `in`.
 * @param {string} text  the plan (its current block).
 * @param {{key: string, title: string}[]} items  a repository's open items (`roadmapItems`).
 * @returns {{key: string, title: string}[]} the items whose bullet in the plan's `## Roadmap` opens with the item's key (its
 *   decision number, else its title; a leading "decision" and bold marks set aside) and then the word `in`, read as
 *   `roadmapProblem` reads the same bullet. An item marked `out`, or with no bullet, is not among them.
 */
export function itemsMarkedIn(text, items) {
  const said = planSection(text, 'Roadmap').split('\n').map((l) => LIST_LINE.exec(l)?.[1]).filter(Boolean).map((l) => l.replace(/^\*+|\*+$/g, '').replace(/\*\*/g, ''));
  return items.filter((i) => said.some((l) => {
    const k = String(i.key).toLowerCase();
    const low = l.toLowerCase().replace(/^decision\s+/, '');
    return low.startsWith(k) && /^[\s:,;.-]*in\b/.test(low.slice(k.length));
  }));
}

/**
 * Did the session read a repository's commit log of its production and its staging branch after the plan was first written?
 * @param {object[]} entries  the session's transcript entries (`tailEntries`), in file order.
 * @param {string} root  a repository's root directory.
 * @param {string} [planFile]  the plan file's path; with none, or when `entries` hold no write of it, all of `entries` counts as after.
 * @returns {boolean} true when, after the first Write, Edit or MultiEdit of the plan file in `entries`, a Bash call ran
 *   `git -C <root> log` (the root as a full path; any other global option refuses it) whose arguments name the repository's
 *   production branch and its staging branch (`repoBranches`), each as a whole name or as the last part of a path of refs
 *   (`origin/main`) on either side of a range, and whose result came back and is not an error, a denial or a hook's refusal. THE
 *   INVARIANT `shippedCheckProblem` relies on: the read is a result the session saw, never a command it only wrote.
 */
export function commitLogRead(entries, root, planFile = '') {
  const { production, staging } = repoBranches(root);
  const want = [...new Set([production, staging])];
  const rootAbs = resolve(root);
  const plan = planFile ? resolve(String(planFile)) : '';
  let planAt = -1;
  const calls = [];
  entries.forEach((e, i) => {
    const c = e?.message?.content;
    if (e?.type !== 'assistant' || !Array.isArray(c)) return;
    for (const b of c) {
      if (b?.type !== 'tool_use') continue;
      if (plan && planAt < 0 && /^(?:Write|Edit|MultiEdit)$/.test(String(b.name ?? '')) && b.input?.file_path && resolve(String(b.input.file_path)) === plan) planAt = i;
      if (b.name === 'Bash') calls.push({ id: b.id, at: i, command: String(b.input?.command ?? '') });
    }
  });
  const answered = new Set();
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type !== 'user' || !Array.isArray(c) || e.toolDenialKind) continue;
    for (const b of c) {
      if (b?.type !== 'tool_result' || b.is_error) continue;
      const text = typeof b.content === 'string' ? b.content : Array.isArray(b.content) ? b.content.map((x) => x?.text ?? '').join('\n') : '';
      if (/^PreToolUse:\S+ hook error/.test(text)) continue;
      answered.add(b.tool_use_id);
    }
  }
  const logNames = (command) => {
    const w = command.trim().split(/\s+/);
    if (w[0] !== 'git') return false;
    let k = 1;
    let dir = null;
    while (k < w.length && w[k].startsWith('-')) {
      if (w[k] === '-C' && w[k + 1]) { dir = w[k + 1]; k += 2; continue; }
      return false;
    }
    if (dir === null || !dir.startsWith('/') || resolve(dir) !== rootAbs || w[k] !== 'log') return false;
    const parts = w.slice(k + 1).filter((x) => !x.startsWith('-')).flatMap((x) => x.split(/\.\.\.?/));
    return want.every((b) => parts.some((x) => x === b || x.endsWith(`/${b}`)));
  };
  return calls.some((u) => u.at > planAt && answered.has(u.id) && logNames(u.command));
}

/**
 * Does a plan that marks a roadmap item in rest on a read of the app's commit log?
 * A PLAN IS NOT WRITTEN FROM THE NOTES' ROADMAP ALONE (Doctrine §0e rule 2, LESSONS §423): a line in the notes is not the state of
 * the app, and a plan that names five shipped items as work to build was written from one. So a plan that marks an item in has
 * to rest on a read of the commit log of the repository's production and staging branches, made by the session after the plan
 * file was first written, and has to say what that read showed, item by item.
 * @param {string} text  the plan (its current block).
 * @param {{roots?: string[], dir?: string, entries?: object[], planFile?: string}} [opts]  the repositories to read (found from the
 *   plan's Files by default, as `roadmapProblem` finds them), the launch directory they are found from, the transcript's entries
 *   (`tailEntries`) and the plan file's path.
 * @returns {string|null} the refusal, or null. A plan with no `## Steps`, or that marks no open item of a repository's roadmap in
 *   (`itemsMarkedIn` of `roadmapItems`), is not judged. Otherwise two things are asked: for each such repository, a read
 *   (`commitLogRead`), and for each such item, a line in the plan's `## Shipped check` opening with the item's key and a colon,
 *   then `not shipped, read against <production> and <staging> on <the date>` with the repository's own two branch names
 *   (`repoBranches`), or `shipped on <branch> by "<the commit subject>"`, which is refused as work already done: shipped
 *   work is marked out, not built. The refusal names each missing read and each missing or wrong line. It forces the read and the
 *   statement and cannot judge that either is true: no parser tells a subject that names an item from one that does not, so
 *   the review and the audit judge that. plan-guard.mjs refuses ExitPlanMode on it, after `roadmapProblem`.
 */
export function shippedCheckProblem(text, opts = {}) {
  if (!planSection(text, 'Steps').trim()) return null;
  const roots = opts.roots ?? queueRoots(text, opts.dir);
  const marked = roots.flatMap((r) => itemsMarkedIn(text, roadmapItems(r)).map((i) => ({ ...i, root: r, repo: basename(r) })));
  if (!marked.length) return null;
  const problems = [];
  const entries = opts.entries ?? [];
  for (const root of new Set(marked.map((i) => i.root))) {
    if (commitLogRead(entries, root, opts.planFile ?? '')) continue;
    const { production, staging } = repoBranches(root);
    const both = [...new Set([production, staging])];
    const keys = marked.filter((i) => i.root === root).map((i) => i.key).join(', ');
    problems.push(`no result of a git log on ${basename(root)} (the repository the plan marks ${keys} in) naming ${both.join(' and ')} came back in this session after the plan file was first written. `
      + `Read it from the main thread, for example: git -C ${root} log --format=%s -n 300 ${both.map((b) => `origin/${b}`).join(' ')}`);
  }
  const lines = planSection(text, 'Shipped check').split('\n').map((l) => l.replace(/^\s*(?:[-*]|\d+[.)])\s+/, '').replace(/\*\*/g, '').trim()).filter(Boolean);
  for (const i of marked) {
    const { production, staging } = repoBranches(i.root);
    const key = String(i.key).toLowerCase();
    const mine = lines.filter((l) => l.toLowerCase().startsWith(key) && /^\s*:/.test(l.slice(key.length))).map((l) => l.slice(key.length).replace(/^\s*:?\s*/, ''));
    const shipped = mine.map((b) => /^shipped on\s+(\S+)\s+by\s+"([^"]{4,})"/i.exec(b)).find(Boolean);
    if (shipped) {
      problems.push(`${i.key} (${i.repo}): the plan marks it in, and its line in the Shipped check says it shipped on ${shipped[1]} by "${shipped[2]}". `
        + 'Work that is on a branch is work already done, and a plan does not build it: mark it out in the Roadmap and leave it to the archive.');
      continue;
    }
    const notShipped = mine.map((b) => /^not shipped,\s*read against\s+(\S+)\s+and\s+(\S+)\s+on\s+(\S.{2,})$/i.exec(b)).filter(Boolean);
    if (notShipped.some((x) => x[1].toLowerCase() === production.toLowerCase() && x[2].toLowerCase() === staging.toLowerCase())) continue;
    if (notShipped.length) {
      problems.push(`${i.key} (${i.repo}): its line in the Shipped check reads against ${notShipped[0][1]} and ${notShipped[0][2]}, and this repository ships on ${production} and stages on ${staging}. Write the line against those two.`);
      continue;
    }
    problems.push(`the plan's "## Shipped check" has no line for ${i.key} (${i.repo}), which the plan marks in. Write "${i.key}: not shipped, read against ${production} and ${staging} on <the date>" `
      + `when the log shows it on neither branch, or "${i.key}: shipped on <branch> by \\"<the commit subject>\\"" when it shows it, and then mark the item out: shipped work is not built.`);
  }
  if (!problems.length) return null;
  return 'SHIPPED CHECK (Doctrine §0e rule 2, LESSONS §423): a plan that marks a roadmap item in names it as work to build, and a line in the notes is not the state of the app. '
    + `The commit log of the repository's two branches is, so it is read first and the plan says what it showed, item by item:\n${problems.map((x) => `- ${x}`).join('\n')}`;
}

// ---- the state page is the main thread's first read after a compaction (Doctrine §0e rule 2) ----

const pageDueFile =(p) => join(process.env.PAGE_DUE_DIR || join(homedir(), '.claude', 'page-due'), `${safeId(p)}.json`);

/**
 * Where this session's status page is.
 * @param {string|undefined} sid  the session id.
 * @returns {string|null} `status/fix-run.html` in the session scratchpad
 *   (`scratchpadOf`); null when the id is malformed or the scratchpad is not there.
 *   The file may not exist yet: nothing is held for a page that has not been written.
 */
export function statusPagePath(sid) {
  const pad = scratchpadOf(String(sid ?? ''));
  return pad ? join(pad, STATUS_PAGE) : null;
}

/**
 * Make the status page due for this session: the main thread's first read after a compaction.
 * @param {object} p  the SessionStart payload.
 * @returns {string} the one line printed at SessionStart, naming the page. The
 *   marker records the time, and only a Read result timed after it counts
 *   (`pageGate`), the way the doctrine's marker works (doctrine-read-guard.mjs).
 *   The state of the work is on one page that survives a compaction because a
 *   summary of it is a paraphrase that drifts.
 */
export function markPageDue(p) {
  const f = pageDueFile(p);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify({ at: Date.now(), source: p.source ?? '' }) + '\n');
  const page = statusPagePath(p.session_id);
  return `STATE PAGE DUE (Doctrine §0e rule 2): this session was compacted, and the state of the work is on one page, ${page ?? `${STATUS_PAGE} in the session scratchpad`}. `
    + 'Once that page exists, the main thread may only read and give the status until a Read result on it has returned; a summary of the work, or another copy of the page, is not it.';
}

/**
 * Has the status page been read since a time?
 * @param {object[]} entries  transcript entries (`tailEntries`).
 * @param {number} since  the marker's time in ms.
 * @param {string} page  the page's path.
 * @returns {boolean} true when Read results on exactly that file, each timed after
 *   `since` and not an error, between them returned every line of it: one result
 *   that carries no record of its lines counts as the whole file, and results that
 *   do carry one (`startLine`, `numLines`, `totalLines`) count by the lines they
 *   returned, so a page too long for one Read is read in parts and still counts, and
 *   a part alone counts for nothing. A refusal is not a result, and a read of
 *   another file with the same name is not this page.
 */
export function pageRead(entries, since, page) {
  const target = resolve(String(page));
  const asked = new Map();
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) for (const b of c) {
      if (b?.type === 'tool_use' && b.name === 'Read') asked.set(b.id, String(b.input?.file_path ?? ''));
    }
  }
  const lines = new Set();
  let total = 0;
  for (const e of entries) {
    const t = Date.parse(e?.timestamp ?? '');
    const c = e?.message?.content;
    if (e?.type !== 'user' || !Array.isArray(c) || !(t > since)) continue;
    for (const b of c) {
      if (b?.type !== 'tool_result' || b.is_error || !asked.has(b.tool_use_id)) continue;
      const file = e.toolUseResult?.file;
      if (resolve(String(file?.filePath || asked.get(b.tool_use_id))) !== target) continue;
      if (!file || !(Number(file.totalLines) > 0) || !Number.isFinite(file.startLine) || !Number.isFinite(file.numLines)) return true;
      total = Number(file.totalLines);
      for (let k = 0; k < file.numLines; k++) lines.add(file.startLine + k);
    }
  }
  return total > 0 && Array.from({ length: total }, (_, k) => k + 1).every((n) => lines.has(n));
}

/**
 * THE STATE PAGE GATE: after a compaction the main thread reads the page first.
 * @param {object} p  a main-thread PreToolUse payload.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @param {{page?: string|null, classify?: (p: object) => boolean}} [opts]  the page's
 *   path and the read classifier, for the test.
 * @returns {string|null} null for a subagent, for the main thread's TaskStop, when
 *   no marker stands (`markPageDue` writes one at a compaction), while the page does
 *   not exist (there is nothing to read yet), for a read, and once a Read result on
 *   the page has returned after the marker (which removes it). Otherwise the
 *   refusal, naming the page. It does not latch: reading the page is the way out,
 *   and a latch would wait on the owner for nothing. The status command never
 *   reaches this: the dispatcher passes it first.
 */
export function pageGate(p, entries, opts = {}) {
  if (p.agent_id || p.tool_name === 'TaskStop') return null;
  let due;
  try { due = JSON.parse(readFileSync(pageDueFile(p), 'utf8')); } catch { return null; }
  const page = 'page' in opts ? opts.page : statusPagePath(p.session_id);
  if (!page || !existsSync(page)) return null;
  const list = entries ?? tailEntries(p.transcript_path ?? '', 16 * 1024 * 1024);
  if (pageRead(list, Number(due.at) || 0, page)) { rmSync(pageDueFile(p), { force: true }); return null; }
  if (isRead(p, opts.classify)) return null;
  return `STATE PAGE GATE (Doctrine §0e rule 2): this session was compacted and the status page has not been read since. `
    + `Until a Read result on ${page} has returned, the main thread may only read and give the status. `
    + 'Read the whole page now: it holds the outcome, the explanations standing and ruled out, the decisions with their reasons, the next move and every Found line sorted, and a summary of it, or another copy, is not it. '
    + 'This refusal does not latch: reading the page clears it.';
}

// ---- the owner's messages are the main thread's read after a compaction (Doctrine §0e rule 2, LESSONS §416) ----

const recallDueFile = (p) => join(process.env.RECALL_DUE_DIR || join(homedir(), '.claude', 'recall-due'), `${safeId(p)}.json`);

/**
 * Make the filed messages due for this session: the main thread reads them whole.
 * @param {object} p  the SessionStart payload.
 * @param {string} file  the file `compact-recall.mjs` wrote under the session scratchpad,
 *   holding every message the owner typed since the previous compaction.
 * @returns {string} the one line printed at SessionStart, naming the file. The marker
 *   records the time and the file, and only a Read result timed after the time counts
 *   (`recallGate`, which reads it through `pageRead`, so a file too long for one Read
 *   is read in parts and still counts).
 */
export function markRecallDue(p, file) {
  const f = recallDueFile(p);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify({ at: Date.now(), file }) + '\n');
  return `OWNER'S MESSAGES DUE (Doctrine §0e rule 2): the print above is the newest of what the owner typed since the previous compaction, and ${file} holds all of it. `
    + 'The main thread may only read and give the status until a Read result covering that whole file has returned; a summary, or the print above, is not it.';
}

/**
 * THE RECALL GATE: after a compaction the main thread reads every message the owner typed.
 * @param {object} p  a main-thread PreToolUse payload.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @param {{file?: string|null, classify?: (p: object) => boolean}} [opts]  the filed
 *   messages' path and the read classifier, for the test.
 * @returns {string|null} null for a subagent, for the main thread's TaskStop, when no
 *   marker stands (`markRecallDue` writes one at a compaction), while the file does not
 *   exist (there is nothing to read), for a read, and once Read results on exactly that
 *   file, returned after the marker, have between them covered every line of it
 *   (`pageRead`; the marker is then removed). Otherwise the refusal, naming the file. It
 *   does not latch: reading the file is the way out, and a latch would wait on the owner
 *   for nothing. The status command never reaches this: the dispatcher passes it first.
 *   THE INVARIANT it holds: the main thread acts on a compaction's work only after the
 *   owner's own words since the previous compaction have been in front of it, whole,
 *   which the ten the print shows do not guarantee.
 */
export function recallGate(p, entries, opts = {}) {
  if (p.agent_id || p.tool_name === 'TaskStop') return null;
  let due;
  try { due = JSON.parse(readFileSync(recallDueFile(p), 'utf8')); } catch { return null; }
  const file = 'file' in opts ? opts.file : due.file;
  if (!file || !existsSync(file)) return null;
  const list = entries ?? tailEntries(p.transcript_path ?? '', 16 * 1024 * 1024);
  if (pageRead(list, Number(due.at) || 0, file)) { rmSync(recallDueFile(p), { force: true }); return null; }
  if (isRead(p, opts.classify)) return null;
  return `RECALL GATE (Doctrine §0e rule 2): this session was compacted and the owner's messages since the previous compaction have not been read whole. `
    + `Until Read results covering every line of ${file} have returned, the main thread may only read and give the status. `
    + 'Read the whole file now, in parts if it is long: a summary of it, or the newest ten the start printed, is not it. '
    + 'This refusal does not latch: reading the file clears it.';
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
  + 'the session scratchpad, the hub\'s DOCTRINE.md, LESSONS.md, aim-review.md, agent-rules.md, lessons/ and plans/, each repo\'s CLAUDE.md, NOTES.md, .plan-scope, '
  + '.claude/PLAN and .branch-guard, IR-SCIENCE.md and docs/decisions/*.md, this session\'s transcript and the tool results saved beside it, and the live clone\'s doctrine. ';

/**
 * The mark of a manager-fence refusal that sets no latch.
 * `main` skips the latch for a refusal of the manager fence that carries it, and only for that one.
 * The refusals that carry it are the fence's refusals of a call that is not of the record, and the dispatch
 * gate's refusals of a step outside the set the approval recorded (`approvalSetProblem`); the dispatch
 * gate's other refusals and the workflow gate's, returned through the fence as well, do not, and latch as before.
 */
export const FENCE_NO_LATCH = 'MANAGER FENCE, NO LATCH:';

/**
 * What a manager-fence refusal of a call that is not of the record ends with.
 * @returns {string} the mark `main` reads (`FENCE_NO_LATCH`), the statement that the refusal sets no
 *   latch, what the main thread may use, and the check command (`hook-dispatch.mjs --can`) that says
 *   beforehand whether a call would pass. The refusal's reader is the main thread, which had no way to
 *   know what passes except by making a call and being refused; every refusal of `managerFence` that
 *   is not the dispatch gate's or the workflow gate's ends with it, and `main` reads the mark.
 */
function notOfRecord() {
  return ` ${FENCE_NO_LATCH} this refusal sets no latch, so the next call is judged on its own. `
    + 'The main thread may use: a read of the record (the plans, the session scratchpad, the doctrine and lessons, each repo\'s notes and plan pointers, this session\'s transcript); '
    + 'a history read of a session repository (git -C <full path> log, ls-remote, branch or show-ref, with the arguments the check lists); '
    + 'an agent sent with the approved plan\'s path and a step number; TaskStop; the status command; the wait between statuses (report.mjs --wait); '
    + 'a write to its plan file under ~/.claude/plans/, to the status page\'s source or to its manager notes; Artifact publishing the status page, or reading, listing or opening a page; '
    + 'SendUserFile of files in the session scratchpad; EnterPlanMode and ExitPlanMode. '
    + `To check a call before making it, run: node ${join(HUB, 'hook-dispatch.mjs')} --can <tool> "<path or command line>". It says whether the manager fence and the latch would pass the call, and changes nothing.`;
}

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
 *   `~/.claude/projects/<project>/<session>.jsonl`) and the files the harness
 *   saved beside it, `~/.claude/projects/<project>/<session>/tool-results/`
 *   (a print too long for the conversation is read whole there, never from its
 *   preview); in any repository its CLAUDE.md, NOTES.md, .plan-scope,
 *   .claude/PLAN and .branch-guard, its IR-SCIENCE.md and its decision records,
 *   the `.md` files directly in `docs/decisions/` (and that folder); and in a
 *   hub (this one, the live clone, or a root holding DOCTRINE.md and
 *   hook-dispatch.mjs) its DOCTRINE.md, LESSONS.md, aim-review.md (the file a
 *   review step follows, which the manager reads to know what it is sending),
 *   agent-rules.md (the rules a plan's Rules line points the agents at, which the
 *   manager reads to know what it holds them to) and
 *   everything under lessons/ and plans/. Everything else, an app's source and
 *   tools above all, is false.
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
  // The session's own saved tool results: <projects>/<project>/<session>/tool-results, the folder and what is below it.
  if (p.session_id) {
    const parts = relative(join(dot, 'projects'), a).split('/');
    if (parts.length >= 3 && parts[0] !== '..' && parts[1] === String(p.session_id) && parts[2] === 'tool-results' && !parts.includes('..')) return true;
  }
  const root = repoRootOf(a);
  if (!root) return false;
  const rel = relative(root, a);
  if (['CLAUDE.md', 'NOTES.md', '.plan-scope', '.claude/PLAN', '.branch-guard', 'IR-SCIENCE.md', 'docs/decisions'].includes(rel)) return true;
  if (/^docs\/decisions\/[^/]+\.md$/.test(rel)) return true;
  const hub = root === HUB || root === join(dot, 'hub') || (existsSync(join(root, 'DOCTRINE.md')) && existsSync(join(root, 'hook-dispatch.mjs')));
  if (!hub) return false;
  return rel === 'DOCTRINE.md' || rel === 'LESSONS.md' || rel === AIM_FILE || rel === RULES_FILE || ['lessons', 'plans'].some((d) => rel === d || rel.startsWith(`${d}/`));
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

// ---- a plan's own script may run its steps (Doctrine §0e rule 13) ----

/**
 * WHETHER A PLAN'S SCRIPT IS ACCEPTED AT ALL. Off until the probe of the plan that
 * built the script gate shows that the plan fence holds an agent a workflow runs: an
 * agent started inside a script has to be refused a command outside its step's
 * Commands, as one sent by the manager is. While this is false every Workflow call is
 * refused, whatever the plan holds, exactly as before the gate existed.
 */
export const WORKFLOW_SCRIPTS_ACCEPTED = false;

// Words a script may not use at all: each reaches outside the plan's own steps or builds code the owner did not read.
const SCRIPT_FORBIDDEN = new Set(['workflow', 'eval', 'Function', 'require', 'import', 'process', 'globalThis', 'constructor', '__proto__']);

/**
 * The tokens of a workflow script that the dispatch gate reads.
 * @param {string} src  the script.
 * @returns {{tokens: {t: string, v: string, subst?: boolean}[], problem: string|null}} identifiers
 *   (`id`), strings and template literals (`str`, with `subst` when a template holds
 *   `${`), and the punctuation characters (`p`), with comments and white space left
 *   out; a template's substitutions are lexed as code, so an `agent(` inside one is
 *   met. `problem` is set, and the tokens are not to be trusted, when the script holds
 *   a regular expression literal (a `/` where a division cannot be), which this lexer
 *   does not read: it refuses rather than guess where such a literal ends.
 */
function scriptTokens(src) {
  const tokens = [];
  const stack = []; // each open template substitution: the brace depth inside it
  let i = 0;
  let prev = '';
  const n = src.length;
  const readString = (q) => {
    let v = '';
    i++;
    while (i < n && src[i] !== q) { if (src[i] === '\\') { v += src[i + 1] ?? ''; i += 2; } else { v += src[i++]; } }
    i++;
    return v;
  };
  // Reads a template from just after its opening backtick (or after the `}` ending a substitution) up to the closing backtick or the next `${`.
  const readTemplate = () => {
    let v = '';
    let subst = false;
    while (i < n && src[i] !== '`') {
      if (src[i] === '\\') { v += src[i + 1] ?? ''; i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') { subst = true; i += 2; stack.push(0); tokens.push({ t: 'str', v, subst: true }); return { open: true }; }
      v += src[i++];
    }
    i++;
    tokens.push({ t: 'str', v, subst });
    return { open: false };
  };
  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === '"' || c === "'") { tokens.push({ t: 'str', v: readString(c) }); prev = 'v'; continue; }
    if (c === '`') { i++; readTemplate(); prev = 'v'; continue; }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < n && /[\w$]/.test(src[j])) j++;
      const word = src.slice(i, j);
      tokens.push({ t: 'id', v: word });
      i = j;
      // A keyword that takes an expression is followed by a regular expression, not a division.
      prev = /^(?:return|typeof|case|in|of|throw|delete|void|new|else|do|instanceof|yield|await)$/.test(word) ? 'k' : 'v';
      continue;
    }
    if (/[0-9]/.test(c)) { let j = i; while (j < n && /[\w.]/.test(src[j])) j++; tokens.push({ t: 'p', v: 'num' }); i = j; prev = 'v'; continue; }
    if (c === '/') {
      // A division follows a value or a closing bracket; anywhere else it opens a regular expression, which is not read.
      if (prev === 'v') { tokens.push({ t: 'p', v: '/' }); i++; prev = '/'; continue; }
      return { tokens, problem: 'the script holds a regular expression literal, which the gate does not read' };
    }
    if (stack.length && c === '{') { stack[stack.length - 1]++; }
    if (stack.length && c === '}') {
      if (stack[stack.length - 1] === 0) { stack.pop(); i++; readTemplate(); prev = 'v'; continue; }
      stack[stack.length - 1]--;
    }
    tokens.push({ t: 'p', v: c });
    prev = c === ')' || c === ']' ? 'v' : c;
    i++;
  }
  return { tokens, problem: stack.length ? 'the script holds a template literal that is never closed' : null };
}

/**
 * What is wrong with an accepted-looking workflow script, read against the plan.
 * @param {string} script  the plan's script (`planScript`), which the call must carry exactly.
 * @param {{path: string, text: string}} plan  the plan in force.
 * @returns {string|null} null when every agent the script starts is told a string literal
 *   that is exactly the plan's path and the number of a step in its `## Steps` that
 *   serves a goal (`sentStep`, `servedBy`), every `agentType` is a built-in one, and the
 *   script uses none of SCRIPT_FORBIDDEN; else the first thing found. Each use of the
 *   word `agent` has to be a call whose first argument is such a literal: the word
 *   used any other way (passed on, renamed, called through a property) is refused. A
 *   template literal with a substitution is not a literal. This reads the script the
 *   owner approved, byte for byte, so it is a second lock: the first is the equality
 *   `workflowGate` demands.
 */
export function scriptProblem(script, plan) {
  const { tokens, problem } = scriptTokens(script);
  if (problem) return problem;
  const steps = planSteps(plan.text);
  const served = servedBy(plan.text);
  let calls = 0;
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k];
    if (t.t !== 'id') continue;
    if (SCRIPT_FORBIDDEN.has(t.v)) return `the script uses "${t.v}", which a plan's script may not`;
    if (t.v === 'agentType') {
      const colon = tokens[k + 1], lit = tokens[k + 2];
      if (colon?.v !== ':' || lit?.t !== 'str' || lit.subst || !BUILTIN_AGENT_TYPES.has(lit.v)) return `the script names an agentType that is not a literal built-in type (${[...BUILTIN_AGENT_TYPES].join(', ')})`;
    }
    if (t.v !== 'agent') continue;
    const open = tokens[k + 1], lit = tokens[k + 2], after = tokens[k + 3];
    if (open?.v !== '(' || lit?.t !== 'str' || lit.subst || !(after?.v === ',' || after?.v === ')')) return 'the script uses "agent" other than as a call whose first argument is a string literal';
    const n = sentStep({ tool_name: 'Agent', tool_input: { prompt: lit.v } }, plan);
    if (n === null) return `an agent in the script is told "${lit.v.slice(0, 80)}", which is not exactly ${plan.path} and a step number`;
    if (!steps.includes(n)) return `an agent in the script is sent for step ${n}, which the plan's Steps do not have`;
    if (!served.get(n)?.length) return `an agent in the script is sent for step ${n}, which serves no goal in the plan's "Served by:" line`;
    calls++;
  }
  return calls ? null : 'the script starts no agent';
}

/**
 * The dispatch gate's answer to a Workflow call.
 * @param {object} p  a main-thread Workflow call.
 * @param {{path: string, text: string, scriptHash?: string|null}|null} [plan]  the plan
 *   in force, with the hash of its script as the approval marker recorded it.
 * @param {{scripts?: boolean}} [opts]  `scripts` replaces `WORKFLOW_SCRIPTS_ACCEPTED`, for the test.
 * @returns {string|null} null only when scripts are accepted and the call carries the
 *   plan's `## Script` section byte for byte as its inline `script` (and no other
 *   input: no path to a script file, no resume, no arguments), that text hashes to
 *   the value the marker recorded when the plan was approved (an edit to the section
 *   after approval therefore matches nothing), and `scriptProblem` finds nothing.
 *   Otherwise the refusal. While scripts are not accepted the refusal is the one
 *   every workflow had before this gate: no script of the session's carries
 *   instructions the owner has not read. THE INVARIANT the caller relies on: a
 *   Workflow that passes is the one script the owner read in the plan that was approved.
 */
export function workflowGate(p, plan = approvedPlan(), opts = {}) {
  const off = 'DISPATCH GATE (Doctrine §0e): a workflow is refused, so no script of the session\'s carries instructions the owner has not read. Send an agent with the plan\'s path and a step number.';
  if (!('scripts' in opts ? opts.scripts : WORKFLOW_SCRIPTS_ACCEPTED)) return off;
  const why = (t) => `DISPATCH GATE (Doctrine §0e): a workflow is refused, ${t}\n${approvalBlock()}`;
  if (!plan) return why('because no approved plan is in force.');
  const want = planScript(plan.text);
  if (want === null) return why('because the approved plan has no "## Script" section holding a script that begins `export const meta`.');
  if (!plan.scriptHash || plan.scriptHash !== createHash('sha256').update(want).digest('hex')) {
    return why('because the approval marker does not hold the hash of this plan\'s script (the script was added or changed after the plan was approved, or the plan was approved before scripts were recorded), so it is not the script the owner read.');
  }
  const input = p.tool_input ?? {};
  if (typeof input.script !== 'string' || Object.keys(input).some((k) => k !== 'script')) {
    return why('because a plan\'s script is passed inline as `script` and nothing else: no file path, no resume of a run, no arguments.');
  }
  if (input.script !== want) return why('because the call\'s script is not, byte for byte, the plan\'s "## Script" section.');
  const bad = scriptProblem(want, plan);
  return bad ? why(`because ${bad}.`) : null;
}

// ---- the main thread reads a repository's history, and nothing else of git (Doctrine §0e rule 13, LESSONS §423) ----

// What a word of such a line may be made of: no quote, space, `$`, backtick, `;`, `&`, `|`, `<`, `>`, parenthesis, brace, `*`, `?`,
// bracket, `!`, `#` or backslash, so a line made only of these words expands nothing and chains nothing in a shell.
const GIT_WORD = /^[A-Za-z0-9._\/@^~%=+,:-]+$/;
// A name on a remote or a branch: it opens with a letter or a digit, so it is never a flag, an absolute path or a tilde.
const GIT_REF = /^[A-Za-z0-9][A-Za-z0-9._\/@^~-]*$/;
// A revision, or a range of two (`a..b`, `a...b`), each written as a GIT_REF.
const GIT_RANGE = /^[A-Za-z0-9][A-Za-z0-9._\/@^~-]*?(?:\.\.\.?[A-Za-z0-9][A-Za-z0-9._\/@^~-]*)?$/;
// A path that steps up out of its place.
const GIT_UP = /(^|\/)\.\.(\/|$)/;

/**
 * Are these the arguments of a git log the main thread may run?
 * @param {string[]} args  the words after `log`.
 * @returns {boolean} true only for the subject format (`--format=%s`, `--pretty=format:%s`), `--oneline`, a count (`-N`, `-n N` or
 *   `--max-count=N`, N of up to five digits), branch names and revision ranges (`GIT_RANGE`, never a path that steps up), and the
 *   double dash as the last word. Anything else is false, a path after the double dash and every other flag included.
 */
function gitLogArgs(args) {
  let ended = false;
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    if (ended) return false;
    if (a === '--') { ended = true; continue; }
    if (a === '--oneline' || a === '--format=%s' || a === '--pretty=format:%s') continue;
    if (/^-\d{1,5}$/.test(a) || /^--max-count=\d{1,5}$/.test(a)) continue;
    if (a === '-n' && /^\d{1,5}$/.test(args[k + 1] ?? '')) { k++; continue; }
    if (a.startsWith('-') || !GIT_RANGE.test(a) || GIT_UP.test(a)) return false;
  }
  return true;
}

/**
 * Are these the arguments of a git ls-remote the main thread may run?
 * @param {string[]} args  the words after `ls-remote`.
 * @returns {boolean} true only for `--heads`, then at most one remote's name (a bare word, never a URL or a path) and branch names.
 */
function gitLsRemoteArgs(args) {
  let remote = false;
  for (const a of args) {
    if (a === '--heads') continue;
    if (!remote) {
      if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(a)) return false;
      remote = true;
    } else if (!GIT_REF.test(a) || GIT_UP.test(a)) return false;
  }
  return true;
}

/**
 * Are these the arguments of a git branch in list mode?
 * @param {string[]} args  the words after `branch`.
 * @returns {boolean} true only for list flags and no name at all: with a name and no list flag git creates a branch.
 */
const gitBranchArgs = (args) => args.every((a) => ['-a', '-r', '-v', '-vv', '-l', '--list', '--all', '--remotes'].includes(a));

/**
 * Are these the arguments of a git show-ref the main thread may run?
 * @param {string[]} args  the words after `show-ref`.
 * @returns {boolean} true only for `--heads`, `-s`, `--hash` and `--verify`, and branch or ref names.
 */
const gitShowRefArgs = (args) => args.every((a) => ['--heads', '-s', '--hash', '--verify'].includes(a) || (GIT_REF.test(a) && !GIT_UP.test(a)));

/**
 * The repositories a main-thread history read may name.
 * @param {object} p  a PreToolUse payload: `cwd` is the launch directory and `session_id` names the scratchpad.
 * @param {{repos?: string[]}} [opts]  the list itself, for the test.
 * @returns {string[]} absolute, normal-form paths: the repositories (directories holding a `.git`) that are the launch directory,
 *   directly below it, or, when it is one itself, directly beside it; and the repositories directly below `worktree/` in this
 *   session's scratchpad, which is where the hub worktree is. Nothing else is the session's: the live gate clone and a path
 *   anywhere else are not.
 */
export function gitHistoryRepos(p, opts = {}) {
  if (opts.repos) return opts.repos.map((r) => resolve(String(r)));
  const kids = (d) => { try { return readdirSync(d).map((n) => join(d, n)); } catch { return []; } };
  const at = resolve(p.cwd ? String(p.cwd) : process.cwd());
  const cands = [at, ...kids(at), ...(existsSync(join(at, '.git')) ? kids(dirname(at)) : [])];
  const pad = p.session_id ? scratchpadOf(String(p.session_id)) : null;
  if (pad) cands.push(...kids(join(pad, 'worktree')));
  return [...new Set(cands.map((d) => resolve(d)))].filter((d) => existsSync(join(d, '.git')));
}

/**
 * Is a Bash line exactly one read of a session repository's history?
 * @param {string} command  the line.
 * @param {object} p  the payload, for `gitHistoryRepos`.
 * @param {{repos?: string[]}} [opts]  as `gitHistoryRepos` takes it.
 * @returns {boolean} true only when, trimmed, the line is `git -C <full path> <log, ls-remote, branch or show-ref> <arguments>`
 *   made of `GIT_WORD` words split on spaces (so no tab, newline, quote, `$`, chaining or redirect can be in it, not even in the name of
 *   a repository's folder), the path is, as written, one of `gitHistoryRepos` (so absolute, with no `..` and no trailing slash), and the arguments are that subcommand's own
 *   list (`gitLogArgs`, `gitLsRemoteArgs`, `gitBranchArgs`, `gitShowRefArgs`). Nothing else of git: no diff, show, status, fetch, tag,
 *   remote, config, rev-parse, cat-file, grep or blame, and no `-c` or `--git-dir`. THE INVARIANT `managerFence` relies on: a line this
 *   accepts shows the names and ids of commits and refs and their subjects and no file of the repository, and writes nothing. It
 *   is not a read of the record, which is why the fence asks it before the read check.
 */
export function gitHistoryRead(command, p, opts = {}) {
  const line = String(command ?? '').trim();
  if (!line || /[\r\n\t]/.test(line)) return false;
  const words = line.split(/ +/);
  if (!words.every((w) => GIT_WORD.test(w))) return false;
  if (words[0] !== 'git' || words[1] !== '-C' || !words[2] || !words[3]) return false;
  const path = words[2];
  const args = words.slice(4);
  const fine = new Map([['log', gitLogArgs], ['ls-remote', gitLsRemoteArgs], ['branch', gitBranchArgs], ['show-ref', gitShowRefArgs]]).get(words[3]);
  if (!fine || !fine(args)) return false;
  return gitHistoryRepos(p, opts).includes(path);
}

/**
 * The manager fence: the main thread plans, sends agents, checks and reports.
 * @param {object} p  a PreToolUse payload.
 * @param {{classify?: (p: object) => boolean, plan?: object|null, pointer?: object|null, repos?: string[]}} [opts]
 *   the read classifier (plan-guard's), the approved plan, the pointer
 *   (`dispatchGate`'s third argument) and the session's repositories (`gitHistoryRepos`), for the test.
 * @returns {string|null} null for a subagent's call; on the main thread, null
 *   only for a read OF THE RECORD (`readOutsideRecord`: a read of a file or a
 *   directory passes only where `recordPath` says it is of the record, and a
 *   read of anything else is refused with the reason to send an agent; a read
 *   that names no file, ToolSearch or a web read, passes as before), a
 *   history read of a session repository or the hub worktree (`gitHistoryRead`: exactly
 *   `git -C <full path>` and log, ls-remote, branch in list mode or show-ref, with the arguments
 *   it lists, and nothing else of git), a
 *   SendUserFile of files that `inScratchpad` places in this session's
 *   scratchpad (one file elsewhere refuses the call), an agent sent through the
 *   dispatch gate, TaskStop, an
 *   Artifact publish of the status page (or a read, list or open; never a
 *   quickstart), a write to
 *   a plan file directly under ~/.claude/plans/, to the status page's source
 *   (`isStatusPage`) or to the manager's notes for it (`isManagerNotes`),
 *   EnterPlanMode or ExitPlanMode, the wait between
 *   statuses, `node <this hub>/report.mjs --wait` exactly (WAIT) — the
 *   status command never reaches this. EnterPlanMode must pass, or no plan could be
 *   amended once the fence stands. A Workflow goes to `workflowGate`: refused,
 *   unless scripts are accepted (WORKFLOW_SCRIPTS_ACCEPTED) and the call carries
 *   the approved plan's own script. Everything else is refused with the reason.
 *   A refusal of a call that is not of the record (a read outside it, a write, a
 *   SendUserFile, an Artifact call or a tool the fence does not pass) ends with
 *   `notOfRecord()`: the mark `FENCE_NO_LATCH`, which `main` reads to set no latch,
 *   what the main thread may use, and the check command (`canCall`). The dispatch
 *   gate's refusals of a step outside the set the approval recorded carry the mark
 *   and set no latch; its other refusals and the workflow gate's, returned through
 *   here, do not carry it and latch as before.
 */
export function managerFence(p, opts = {}) {
  if (p.agent_id) return null;
  const tool = String(p.tool_name ?? '');
  const input = p.tool_input ?? {};
  const head = `MANAGER FENCE (Doctrine §0e): the main thread plans, sends agents, checks their results and reports; it does no work itself. ${tool} is not one of those.`;
  if (tool === 'Agent' || tool === 'Task' || tool === 'SendMessage') return dispatchGate(p, 'plan' in opts ? opts.plan : approvedPlan(), 'pointer' in opts ? opts.pointer : undefined);
  if (tool === 'Workflow') return workflowGate(p, 'plan' in opts ? opts.plan : approvedPlan(), opts);
  if (tool === 'TaskStop' || tool === 'ExitPlanMode' || tool === 'EnterPlanMode') return null;
  // The main thread may not end its turn while an agent runs, and none of its
  // other calls can wait: this one does, and returns on what it waits for.
  if (tool === 'Bash' && WAIT.test(String(input.command ?? ''))) return null;
  // The check of a call changes nothing and is how the main thread learns what passes (`canCall`).
  if (tool === 'Bash' && CAN.test(String(input.command ?? ''))) return null;
  // THE REPLY GUARD'S RELEASE COMMAND PASSES AS THE STATUS COMMAND DOES (`releaseCommand`, LESSONS §432): a refusal of the reply guard
  // names it as the way on, and a fence that refused it left that refusal with no way out. The other gates still judge it.
  if (tool === 'Bash' && releaseCommand(input.command)) return null;
  // THE MAIN THREAD READS A REPOSITORY'S HISTORY (LESSONS §423): `git -C <full path> log`, `ls-remote`, `branch` in list mode or
  // `show-ref` on a repository of the session or the hub worktree, with the arguments `gitHistoryRead` lists, and nothing else of git.
  // It is asked before the read check because it is not a read of the record, and plan-guard's own list of readers carries neither
  // ls-remote nor show-ref. A plan that marks a roadmap item in rests on this read (`shippedCheckProblem`), so the main thread has to
  // be able to make it.
  if (tool === 'Bash' && gitHistoryRead(String(input.command ?? ''), p, opts)) return null;
  if (tool === 'Artifact') {
    const a = String(input.action ?? 'publish');
    // Never quickstart: neither the plan nor rule 13 names it, and it starts
    // new work rather than reading or publishing the status page.
    if (['read', 'list', 'open'].includes(a)) return null;
    const plain = !input.asset && !input.files && !input.file_paths && !input.type_url && !input.from_url && !input.asset_ids;
    if (a === 'publish' && plain && isStatusPage(input.file_path, p.session_id)) return null;
    return `${head} On the main thread Artifact publishes the status page only, ${STATUS_PAGE} in this session's scratchpad, or reads, lists or opens a page (Doctrine §7i).${notOfRecord()}`;
  }
  if (FILE_WRITES.has(tool)) {
    const f = String(input.file_path ?? input.notebook_path ?? '');
    if (f && f.endsWith('.md') && dirname(resolve(f)) === resolve(homedir(), '.claude', 'plans')) return null;
    if (f && isStatusPage(f, p.session_id)) return null;
    if (f && isManagerNotes(f, p.session_id)) return null;
    return `${head} The main thread writes only its plan file, the status page's source (${STATUS_PAGE}) and its own notes for the page (${MANAGER_NOTES}), the last two in the session scratchpad; ${f || 'this file'} is written by an agent sent with a plan step.${notOfRecord()}`;
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
      + `${named.length ? `${outside[0]} is not in it` : 'This call names no file'}; a file elsewhere is copied into the scratchpad by an agent sent with a plan step.${notOfRecord()}`;
  }
  if (isRead(p, opts.classify ?? planGuardReads)) {
    // A READ PASSES ONLY OF THE RECORD (Doctrine §0e rule 13): the manager reads
    // what it manages by, and diagnosing from an app's source is an agent's work.
    const outside = readOutsideRecord(p, () => ('plan' in opts ? opts.plan : approvedPlan())?.path);
    return outside === null ? null : `${READ_FENCE}${outside}. Send an agent with the approved plan's path and a step number to read it.${notOfRecord()}`;
  }
  return `${head} It is not a read; send an agent with the approved plan's path and a step number.${notOfRecord()}`;
}

/**
 * Put a main-thread call to the check before it is made.
 * @param {object} p  a payload shaped like a main-thread PreToolUse payload: `tool_name`, `tool_input`, `cwd`,
 *   and `session_id` and `transcript_path` when the session is known (no `agent_id`: the check is the main thread's).
 * @param {{classify?: (p: object) => boolean, plan?: object|null, pointer?: object|null, entries?: object[]}} [opts]
 *   what `managerFence` takes, and the transcript's entries for `latchStanding`, for the test.
 * @returns {{free: boolean, fence: string|null, noLatch: boolean, latch: object|null, latchKnown: boolean, passesLatch: boolean, passes: boolean}}
 *   `free` is true for the status command and the check itself, which `main` passes before the latch is
 *   looked at and before the fence is asked, so `fence` is null for them; otherwise `fence` is the manager
 *   fence's refusal or null, and `noLatch` is true when that refusal carries `FENCE_NO_LATCH`; `latch` is the
 *   session's latch as `latchStanding` reads it without removing the file (null when none stands), `latchKnown`
 *   is false when the payload names no session; `passesLatch` is true for `free` calls and TaskStop;
 *   `passes` is true only when the fence would pass the call and no latch would stop it. It writes and removes
 *   nothing, and its answer for the fence and the latch is the one `main` reaches, because it calls the same
 *   two functions; the gates it does not ask are named by `canText`.
 */
export function canCall(p, opts = {}) {
  const tool = String(p.tool_name ?? '');
  const cmd = String(p.tool_input?.command ?? '');
  const free = tool === 'Bash' && (REPORT.test(cmd) || CAN.test(cmd));
  const passesLatch = free || tool === 'TaskStop' || (tool === 'Bash' && !!releaseCommand(cmd));
  const fence = free ? null : managerFence(p, opts);
  const latchKnown = !!p.session_id;
  let latch = null;
  if (latchKnown) { try { latch = latchStanding(p, opts.entries, true); } catch { latch = null; } }
  return { free, fence, noLatch: !!fence && fence.includes(FENCE_NO_LATCH), latch, latchKnown, passesLatch, passes: !fence && (passesLatch || !latch) };
}

/**
 * The words of the check.
 * @param {object} p  the payload `canCall` was given.
 * @param {ReturnType<typeof canCall>} r  its answer.
 * @param {string} [shown]  the argument as the caller gave it, for the first line.
 * @returns {string} lines saying what the manager fence would do with the call and whether the refusal latches,
 *   what the latch would do, the result, and the gates the check does not ask. The fence's own refusal is
 *   printed whole, as the main thread would have met it.
 */
export function canText(p, r, shown = '') {
  const lines = [`CHECK ONLY, NOTHING WAS RUN OR CHANGED: ${p.tool_name} ${shown}, as the main thread of ${p.session_id ? `session ${p.session_id}` : 'an unknown session'} would make it now.`];
  if (r.free) lines.push('MANAGER FENCE: not asked. The status command and this check pass every gate of the main thread before the fence, the latch included.');
  else lines.push(r.fence === null ? 'MANAGER FENCE: would pass.' : `MANAGER FENCE: would refuse. ${r.fence}`);
  if (!r.latchKnown) lines.push('LATCH: not read, because this shell holds no CLAUDE_CODE_SESSION_ID; the session is unknown, so the latch is not judged and a path in the session scratchpad cannot be told from one outside it.');
  else if (!r.latch) lines.push('LATCH: none stands.');
  else lines.push(`LATCH: stands (set at ${californiaTime(new Date(r.latch.at))} California by a refusal of ${r.latch.tool || 'a call'}). `
    + (r.passesLatch ? 'This call passes it: the status command, this check, the main thread\'s TaskStop and the reply guard\'s release command pass a latch.'
      : 'Every call but the status command, this check, the main thread\'s TaskStop, the reply guard\'s release command and an agent\'s own return is refused until the owner writes again.'));
  if (r.passes) lines.push('RESULT: the manager fence and the latch would pass this call.');
  else {
    const by = [];
    if (r.latch && !r.passesLatch) by.push('the latch');
    if (r.fence) by.push(`the manager fence, whose refusal ${r.noLatch ? 'sets no latch' : 'latches the main thread until the owner writes again'}`);
    lines.push(`RESULT: this call would be refused by ${by.join(' and ')}.`);
  }
  lines.push('NOT JUDGED HERE: the stop and correction holds, the recall and page gates, the report gate, the review, rules, reads and judgement gates that hold a step, plan mode, and the family guards (reply, keep-info, push, doctrine-read); a call this check passes can still be refused by one of them.');
  return lines.join('\n');
}

/**
 * The tool input a check builds from a tool name and one argument.
 * @param {string} tool  the tool's name.
 * @param {string} arg  a path, a pattern, a prompt or a command line.
 * @returns {object} the tool's input with the argument under the key the tool reads it from: `command` for Bash,
 *   `file_path` for Read, Write, Edit and MultiEdit, `notebook_path` for NotebookEdit, `path` for Grep, `pattern` for Glob,
 *   `file_paths` for SendUserFile, `prompt` for Agent and Task, `message` for SendMessage, and for Artifact an
 *   `action` when the argument is one of read, list, open, quickstart, delete, pin or unpin, else a publish of that
 *   file; any other tool gets `path`. `managerFence` judges these keys exactly as it judges a real call's.
 */
export function inputFor(tool, arg) {
  if (tool === 'Bash') return { command: arg };
  if (['Read', 'Write', 'Edit', 'MultiEdit'].includes(tool)) return { file_path: arg };
  if (tool === 'NotebookEdit') return { notebook_path: arg };
  if (tool === 'Grep') return { pattern: 'x', path: arg };
  if (tool === 'Glob') return { pattern: arg };
  if (tool === 'SendUserFile') return { file_paths: [arg] };
  if (tool === 'Artifact') return /^(?:read|list|open|quickstart|delete|pin|unpin)$/.test(arg) ? { action: arg, url: 'u' } : { action: 'publish', file_path: arg };
  if (tool === 'Agent' || tool === 'Task') return { prompt: arg };
  if (tool === 'SendMessage') return { message: arg };
  return { path: arg };
}

/**
 * The check as the command line makes it: `hook-dispatch.mjs --can <tool> <path or command line>`.
 * @param {string[]} args  the words after `--can`: the tool name, then the argument (more than one word is joined by spaces).
 * @param {object} [env]  the environment; `CLAUDE_CODE_SESSION_ID` names the session whose latch and scratchpad are judged.
 * @param {string} [cwd]  the directory a relative path is resolved against.
 * @returns {string} `canText` of the call as the main thread of that session would make it, or a usage line
 *   when there is no tool name or no argument. Nothing is written, removed or run.
 */
export function canMain(args, env = process.env, cwd = process.cwd()) {
  const tool = String(args[0] ?? '');
  const arg = args.slice(1).join(' ');
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(tool) || !arg) return `usage: node ${join(HUB, 'hook-dispatch.mjs')} --can <tool name> "<path or command line>"`;
  const sid = String(env.CLAUDE_CODE_SESSION_ID ?? '').trim();
  const files = sid ? sessionFiles(sid) : null;
  const p = { ...(sid ? { session_id: sid } : {}), ...(files ? { transcript_path: files.main } : {}), cwd, tool_name: tool, tool_input: inputFor(tool, arg) };
  return canText(p, canCall(p), arg);
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
  // (Doctrine §0d, §0e). Only these do not, each passing latch = false below, and the doctrine
  // gate's, the plan gate's refusal of a name and the app's identifier guard's refusal of the
  // approval call among them since LESSONS §424: the manager
  // fence's refusal of a call that is not of the record (`FENCE_NO_LATCH`); the
  // latch's own, so it can never move the time an owner message has to come
  // after; pending-guard's; the stop hold's; the correction check's; the state
  // page gate's; the report gate's; the review gate's (a move with no current
  // review, a refused route, an OFF-AIM verdict); the rules gate's; and the
  // in-app approval check's. A Stop event and the other events never latch.
  const refuse = (why, latch = true) => {
    process.stderr.write(why + '\n');
    // A refused Read of a file of the record is recorded, so it is read again before a step goes (`readsGate`).
    if (event === 'PreToolUse') { try { noteRefusedReadCall(p, why); } catch { /* the refusal stands either way */ } }
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
    // THE CHECK OF A CALL (`hook-dispatch.mjs --can`) PASSES AS THE STATUS COMMAND DOES, on the main thread: it
    // changes nothing, and a latched main thread is the one that most needs to ask what would pass. An agent's
    // is not exempt; the plan fence judges it.
    const status = p.tool_name === 'Bash' && (REPORT.test(String(p.tool_input?.command ?? '')) || (!p.agent_id && CAN.test(String(p.tool_input?.command ?? ''))));
    const mainStop = p.tool_name === 'TaskStop' && !p.agent_id;
    // THE REPLY GUARD'S RELEASE COMMAND PASSES THE LATCH ON THE MAIN THREAD (`releaseCommand`, LESSONS §432): a refusal of the reply
    // guard names it as the way on, and the latch that refusal set refused the way on with it. Only the latch is passed here: the
    // stop hold, the correction check and every later gate judge it as any command, and it lifts the latch after the guards pass it.
    const release = !p.agent_id && p.tool_name === 'Bash' ? releaseCommand(p.tool_input?.command) : null;
    const latch = latchStanding(p);
    // A LATCHED AGENT WRITES ITS OWN REPORT: its progress note and report file in the
    // scratchpad pass the latch, so a refusal does not cost its step the record of what
    // it did. Every other call of it is still refused but its own return.
    let reportWrite = false;
    try { reportWrite = !!latch && agentReportWrite(p); } catch { reportWrite = false; }
    if (latch && !status && !mainStop && !release && !reportWrite) return refuse(latchMessage(latch), false);
    if (status) {
      // A subagent cannot tell the owner anything, so its stamp would unlock
      // the main thread with no status given.
      if (p.agent_id) return refuse('a subagent cannot give the owner a status; the main thread stamps the report clock.');
      return 0;
    }
    // THE OWNER'S STOP HOLDS EVERYTHING (Doctrine §0e rule 3). While the newest
    // owner message that carries the whole word stop anywhere in it and no
    // go-word stands, with no later message ending in a go-word, every call is
    // refused, the main thread's and every
    // agent's, a step a review cleared included. What passes is the status
    // command (passed above), an agent's own return (passed before pending-guard),
    // TaskStop and, on the main thread, a READ OF THE RECORD. The refusal does
    // not latch: a go-word from the owner is what lifts it, and a latch would
    // only add a second wait. Before this, a stop word stopped agents only while
    // its message was still queued (pending-guard.mjs), and nothing held them
    // once it had been delivered. A failure in finding the hold lets the call on.
    let holds = { correction: null, stop: null };
    try { holds = ownerHolds(p); } catch { holds = { correction: null, stop: null }; }
    if (holds.stop && p.tool_name !== 'TaskStop') {
      let record = false;
      try { record = !p.agent_id && readOfRecord(p); } catch { record = false; }
      if (!record) return refuse(stopMessage(holds.stop), false);
    }
    // A CORRECTION FROM THE OWNER HOLDS NEW STARTS, BY REFUSAL (Doctrine §0e rule
    // 3). While the owner's newest message does not end with a go-word, every
    // ACTION on the main thread is refused; the status command (passed above),
    // TaskStop and a READ OF THE RECORD pass, and so do the Standing review step
    // and the step a review cleared that BEGAN AFTER the message was typed
    // (`correctionLifts`): the review reads the correction and judges the next
    // move with it in view, so approved work a correction does not touch goes on
    // and a move it touches does not. The refusal does not latch: the next
    // message from the owner is what lifts it, and a latch would only add a
    // second wait. Rule 3 had nothing behind it and was broken four times on
    // 2026-10-04. A read passes because a question one file answers cost a
    // refusal, a doctrine re-read and a go-word (measured 2026-10-06): a read
    // changes nothing, and the narrowed manager fence already limits what a read
    // may be of. A read that cannot be judged stays held. Agents are not held by
    // it; they are held by the plan fence. A failure in finding the correction
    // lets the call on.
    if (!p.agent_id && !mainStop) {
      let correction = holds.correction;
      try { if (correction && readOfRecord(p)) correction = null; } catch { /* a read that cannot be judged stays held */ }
      try { if (correction && correctionLifts(p, correction)) correction = null; } catch { /* a send that cannot be judged stays held */ }
      if (correction) {
        let reviewed = false;
        try { const plan = approvedPlan(); reviewed = !!plan && aimReviewSteps(plan.text).length > 0; } catch { reviewed = false; }
        return refuse(correctionMessage(correction, reviewed), false);
      }
    }
    // AFTER A COMPACTION THE FIRST READ IS THE STATE PAGE (Doctrine §0e rule 2),
    // held the way the doctrine's read is: until a Read result on the page returns
    // after the compaction, the main thread reads and gives the status. It does not
    // latch (reading the page is the way out). A gate that fails to run refuses
    // what is not a read, as every family guard does: it has not said yes.
    // THE OWNER'S OWN WORDS COME BEFORE THE PAGE (LESSONS §416): the messages filed at the
    // compaction are read whole first, held the same way and for the same reason, and the
    // refusal does not latch either.
    if (!p.agent_id && !mainStop) {
      let recall = null;
      try { recall = recallGate(p); } catch (e) {
        recall = READS.has(p.tool_name ?? '') ? null : `RECALL GATE (Doctrine §0e rule 2): the gate could not run (${e?.message ?? e}); only reads run until it is fixed.`;
      }
      if (recall) return refuse(recall, false);
      let page = null;
      try { page = pageGate(p); } catch (e) {
        page = READS.has(p.tool_name ?? '') ? null : `STATE PAGE GATE (Doctrine §0e rule 2): the gate could not run (${e?.message ?? e}); only reads run until it is fixed.`;
      }
      if (page) return refuse(page, false);
    }
    // A REFUSAL OF A CALL THAT IS NOT OF THE RECORD SETS NO LATCH: the refusal carries `FENCE_NO_LATCH`, says what
    // the main thread may use and names the check command. The dispatch gate's refusals of a step outside the set
    // the approval recorded carry it and set no latch; its other refusals and the workflow gate's come back
    // through the fence without the mark and latch as before.
    const fence = managerFence(p);
    if (fence) return refuse(fence, !fence.includes(FENCE_NO_LATCH));
    // A STATUS FALLING DUE NEVER STOPS THE WORK. The report gate's refusal does
    // not latch: giving the status stamps the clock, and the refused call may
    // then run. Latched, the session stopped on it (measured 17:54).
    const rg = run(`node "${join(HUB, 'report.mjs')}" --gate`, raw, root);
    if (rg.deny) return refuse(rg.reason, false);
    if (rg.status !== 0 && !READS.has(p.tool_name ?? '')) {
      return refuse(`report.mjs did not run cleanly (${rg.error ?? `exit ${rg.status}`}${rg.err ? `: ${rg.err.trim().split('\n')[0]}` : ''}); only reads run until it is fixed.`);
    }
    // EVERY MOVE IS CLEARED BY A FRESH REVIEW BEFORE IT GOES (Doctrine §0e rule
    // 2). After the dispatch gate (inside managerFence above) has passed a step,
    // this refuses it unless a review that began after everything it judges has
    // cleared that step. It is its own call, outside managerFence, because every
    // refusal that comes back through the manager fence latches, and none of
    // these may: sending the review step clears a missing or stale review, an
    // amendment of the plan's Steps answers a refused route, and entering plan
    // mode is the remedy for an OFF-AIM verdict. A Standing step passes. A failure
    // reading the review refuses: a gate that stops gating in silence is the defect.
    if (!p.agent_id && /^(?:Agent|Task|SendMessage|Workflow)$/.test(String(p.tool_name ?? ''))) {
      let rv = null;
      try { rv = reviewGate(p); } catch (e) {
        rv = `REVIEW GATE (Doctrine §0e rule 2): the review could not be read (${e?.message ?? e}); the gate refuses rather than stop gating.`;
      }
      if (rv) return refuse(rv, false);
      // THE RULES THE PLAN POINTS AT ARE THE RULES THE PLAN WAS READ WITH (Doctrine
      // §0e rule 13): while its pinned version is not the file's, no step is sent.
      // Its own call and not latched: the remedy is the Rules line pinned again, which is part of the approved scope and so goes back through plan mode (LESSONS §433).
      let rl = null;
      try { rl = rulesGate(p); } catch (e) {
        rl = `RULES GATE (Doctrine §0e rule 13): the rules file could not be read (${e?.message ?? e}); the gate refuses rather than stop gating.`;
      }
      if (rl) return refuse(rl, false);
      // A REFUSED READ OF THE RECORD IS READ BEFORE A STEP GOES (Doctrine §0e rule 13):
      // while a read of the record the main thread made was refused and no Read has
      // returned on it since, no step is sent. Its own call and not latched: reading
      // the file clears it, and a latch would wait on the owner for nothing. A failure
      // reading the record refuses, as the gates above do.
      let rr = null;
      try { rr = readsGate(p); } catch (e) {
        rr = `READS GATE (Doctrine §0e rule 13): the refused reads could not be read (${e?.message ?? e}); the gate refuses rather than stop gating.`;
      }
      if (rr) return refuse(rr, false);
      // THE NEWEST HAND-BACK IS JUDGED IN WRITING BEFORE THE NEXT STEP GOES (Doctrine
      // §0e rule 2): status/manager.txt carries a line keyed "Judged N:" for the newest
      // end of an agent for a step in Order, written after that end. A Standing step
      // passes. Its own call and not latched: writing the line is the way out.
      let jg = null;
      try { jg = judgedGate(p); } catch (e) {
        jg = `JUDGEMENT GATE (Doctrine §0e rule 2): the judgement could not be read (${e?.message ?? e}); the gate refuses rather than stop gating.`;
      }
      if (jg) return refuse(jg, false);
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
      // A RULES FIRST refusal of an agent's first call sets no latch (lesson 415): only the plan
      // fence writes the mark (FIRST_REFUSAL in plan-fence.mjs), and every other refusal latches.
      // THE DOCTRINE GATE'S REFUSAL SETS NO LATCH either (LESSONS §424): the Read it names is its remedy, the recall gate's and the
      // page gate's refusals are free for the same reason, and a latch refused that Read until the owner wrote.
      // A REFUSAL OF THE REPLY GUARD THAT NAMES ITS RELEASE COMMAND SAYS WHAT THAT COMMAND DOES (`RELEASE_NOTE`, LESSONS §432).
      const reason = g.includes('reply-guard.mjs') && / --read /.test(o.reason) ? o.reason + RELEASE_NOTE : o.reason;
      if (o.deny) return refuse(reason, !(g.includes('plan-fence.mjs') && o.reason.includes('RULES FIRST, NO LATCH:')) && !g.includes('doctrine-read-guard.mjs'));
      // A family guard that crashed or timed out has not said yes. The header's
      // promise — a crash refuses everything but reads — held only for a crash
      // of THIS file; a guard exiting 1 was read as a pass.
      if (o.status !== 0 && !READS.has(p.tool_name ?? '')) {
        return refuse(`${g.split('"')[1] ?? g} did not run cleanly (${o.error ?? `exit ${o.status}`}${o.err ? `: ${o.err.trim().split('\n')[0]}` : ''}); only reads run until it is fixed.`);
      }
    }
    // A RELEASE OF THE CALL THE LATCH WAS SET BY LIFTS THE LATCH (`releaseLifts`, LESSONS §432): the reply guard has just checked the
    // reading and recorded it, so the repeat of the call it refused is no longer a repeat. Only a latch the reply guard set is lifted,
    // and only by a release naming the call its refusal named; any other latch stands for the owner's next message.
    if (release && latch && releaseLifts(latch, release)) {
      try { rmSync(latchFile(p), { force: true }); } catch { /* the latch stands */ }
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
  // AN AMENDMENT OF THE APPROVED PLAN'S STEPS OR ORDER KEEPS THE APPROVAL
  // (Doctrine §0e rule 13). The write itself was let through only because the
  // six approved sections (Goals without its Served by line, Asked, Files,
  // Commands, Rules, Rules of this plan) stood unchanged in the
  // text it would produce; this re-reads the REAL file, checks the six again,
  // and only then moves the marker's hash to the file's. If the real file's six
  // sections differ from what was simulated, or this does not run, the marker
  // keeps the old hash and the plan is out of force, which every gate refuses on:
  // it fails closed. Main thread only; an agent never amends the plan.
  if (event === 'PostToolUse' && FILE_WRITES.has(String(p.tool_name ?? '')) && !p.agent_id) {
    const o = run(`node "${join(HUB, 'approved-plan-guard.mjs')}" --amend`, raw, root);
    if (o.deny || o.status !== 0) markFail = [markFail, o.reason || o.err.trim() || o.error || `--amend exited ${o.status}`].filter(Boolean).join('\n');
  }
  // What a call returned goes to reply-guard's ledger: a declining reply or a
  // failed call (LESSONS §374). A declining reply comes back as exit 2 so its
  // words are put in front of the session now, after the repos' own hooks,
  // like --mark's outcome.
  let replyNote = '';
  // A Read of a file of the record that FAILED (the file was too long to return, or the harness refused it) is a
  // refused read too: it is recorded, and read again before a step goes (`readsGate`).
  if (event === 'PostToolUseFailure') { try { noteRefusedReadCall(p, String(p.error ?? p.tool_response ?? 'the Read failed')); } catch { /* recorded or not, the failure stands */ } }
  if ((event === 'PostToolUse' && /^(Bash|WebFetch)$/.test(p.tool_name ?? '')) || event === 'PostToolUseFailure') {
    const o = run(`node "${join(HUB, 'reply-guard.mjs')}" --record ${event}`, raw, root);
    if (o.deny) replyNote = o.reason;
  }
  if (event === 'UserPromptSubmit') {
    // Whether this prompt ends with a go-word is recorded here: it is
    // `correctionStanding`'s fallback when the transcript cannot be read.
    try { recordOwnerTurn(p); } catch { /* the transcript is the verdict's source */ }
    // THE STATUS PAGE AT A HAND-BACK: the notice that an agent has ended arrives as a
    // prompt, and the page is rewritten from the same read a status makes (report.mjs
    // --page), at that event and no other. It stamps nothing and prints nothing, so the
    // status gate and the page gate are as they were. The event is one the dispatcher
    // already receives, so no settings file wires anything new.
    if (isHandBackNotice(p.prompt)) { try { run(`node "${join(HUB, 'report.mjs')}" --page`, raw, root, 30); } catch { /* the page is a convenience */ } }
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
    // THE GOALS EVERY SESSION SERVES COME FIRST IN THE REMINDER (the standing
    // goals in the hub CLAUDE.md): the section of that file, printed at every owner message
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
  // the recalled messages, which come before anything else. A resume whose
  // transcript already holds every line of the doctrine as it stands, read since
  // the last compaction, owes nothing, and the line says so (LESSONS §398).
  let dueLine = '';
  if (event === 'SessionStart' && !p.agent_id) {
    const due = run(`node "${join(HUB, 'doctrine-read-guard.mjs')}" --due`, raw, root);
    dueLine = due.out.trim().split('\n')[0] ?? '';
  }
  if (event === 'SessionStart' && p.source === 'compact' && p.transcript_path) {
    // The newest ten of the messages typed since the previous compaction, verbatim,
    // before anything else is printed, with the count of the rest and the file holding
    // every one, written under the session's scratchpad: a summary is a paraphrase, and
    // these are what it paraphrased (LESSONS §376, §385, §416). The main thread is then
    // held to reading that file whole (`recallGate`); with no scratchpad there is no
    // file the fence lets it read, so nothing is held.
    const pad = scratchpadOf(String(p.session_id ?? ''));
    const recall = await recallParts(p.transcript_path, pad ? join(pad, 'recall') : '');
    if (recall.block) printed.push(recall.block);
    if (pad && recall.file && !p.agent_id) {
      try { printed.push(markRecallDue(p, recall.file)); } catch { /* the print above stands; the gate is lost for this start */ }
    }
    printed.push('AFTER COMPACTION: every tool used earlier in this session still exists. Try each route before reporting a limit (LESSONS §370).\n'
      + await toolCensus(p.transcript_path));
  }
  if (dueLine) printed.push(dueLine);
  // A compaction also makes the state page due: it is the first thing the main
  // thread reads afterwards (Doctrine §0e rule 2). A failure writing the marker
  // costs the line and the gate, never the start.
  if (event === 'SessionStart' && p.source === 'compact' && !p.agent_id) {
    try { printed.push(markPageDue(p)); } catch { /* the doctrine's own line stands */ }
    // The compaction is recorded with its time, so the first status prints it, the page
    // carries it and the first reply opens with it (LESSONS §416). A failure costs the
    // notice, never the start.
    try { markCompacted(String(p.session_id ?? '')); } catch { /* the notice is lost for this start */ }
  }

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
        // The lock's forced mode is never a plan mode the harness began at a restart: the lock keeps refusing on its own (LESSONS §432).
        const input = locked && shim === 'plan-guard.sh' ? JSON.stringify({ ...p, permission_mode: 'plan', plan_mode_forced: true }) : raw;
        const o = run(command, input, repo, h.timeout ?? 60);
        // A REFUSAL OF THE APPROVAL CALL THAT ONLY A READ ANSWERS SETS NO LATCH (`noLatchRepoRefusal`, LESSONS §424).
        if (o.deny) return refuse(o.reason, !noLatchRepoRefusal(shim, p, o.reason));
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
  // The check of a call: prints what the manager fence and the latch would do, changes nothing, exits 0 whatever it finds.
  if (event === '--can') { console.log(canMain(process.argv.slice(3))); process.exit(0); }
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
