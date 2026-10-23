#!/usr/bin/env node
/**
 * NOTHING RUNS OUTSIDE A PLAN THE OWNER APPROVED (Doctrine §0e, LESSONS §370).
 *
 * `plan-guard.mjs` refuses writes WHILE plan mode is on. It had nothing to say
 * once plan mode was off, and auto mode is the harness default, so a session
 * could plan, get approval, and then go on to edits, downloads, renders and a
 * search of the owner's whole Drive that no plan named, in silence. Measured
 * in one session on 2026-09-28: an edit and a Drive search that no plan named,
 * a test started straight from a chat message, and long runs of tool calls
 * with no words between them.
 *
 * ## The contract
 *
 *   PreToolUse (default): outside plan mode, anything `plan-guard.mjs` would
 *   call a write is refused unless ~/.claude/APPROVED-PLAN.json exists AND the
 *   hash it records still matches the plan file it names, and the session that
 *   approved it is this one. Reads always pass, so a plan can be made. The
 *   classification of "write" is plan-guard's own, run as a child with the mode
 *   forced to plan: one list, never a fork. Only a clean exit 0 from it is a
 *   read — a crash is a write, and the refusal quotes the reason it gave. A
 *   file tool is judged by its TARGET: the marker and the approved plan file
 *   are refused, and content that merely names the marker is not a write to it.
 *   THE ONE EXCEPTION is the main thread amending the plan: a Write, Edit or
 *   MultiEdit on the approved plan passes when the text it would leave has the
 *   Goals, Asked, Files and Commands the marker recorded at approval (`scope`),
 *   so only the Steps and the Order, or sections outside the four, move. The
 *   Goals are taken without their `Served by:` line (`goalsWithoutServedBy` in
 *   report.mjs), which maps steps to goals, so a step added or renumbered keeps
 *   the approval; a marker recorded before that, holding the whole section's
 *   hash, still matches while the whole section stands, and `--amend` records
 *   the new kind at the first amendment. An
 *   edit to any of the four is refused naming them, and goes back through plan
 *   mode and the owner's button; an agent's edit, a marker with no `scope`, and
 *   an edit that cannot be simulated keep the old rule, a refusal.
 *
 *   PostToolUse (--mark): on ExitPlanMode approved by the owner, write the
 *   marker with the plan's path and hash. The path is the result OBJECT's
 *   `filePath`: the hook is handed the tool's result, never the sentence the
 *   session is shown, and that sentence is matched only when a result arrives
 *   as text. A subagent's exit and a teammate's request to its lead write
 *   nothing. A main-session exit that mints nothing says so on stderr and
 *   exits 2, because a silent miss is how the first version went unnoticed.
 *   On EnterPlanMode, remove it. A session cannot write the marker: a command
 *   that names it is refused with no exception, since `--done` never names it.
 *
 *   PostToolUse (--amend): after a main-thread Write, Edit or MultiEdit whose
 *   target is the approved plan, re-read the real file; if its four approved
 *   sections are still the recorded ones, move the marker's hash to the file's
 *   (so the plan stays in force through an amendment of Steps or Order); if not,
 *   leave the marker alone and say so with exit 2, which leaves no plan in force.
 *   The pre-write simulation can be wrong (a quote the tool normalises, a
 *   replace-all); this check on the real file is why that cannot let a changed
 *   scope through.
 *
 *   AN APPROVAL PRESSED IN THE APP COUNTS. Measured 2026-10-03: the owner
 *   approved a plan in the app, which ended plan mode before the session's
 *   ExitPlanMode call was answered; the call came back "You are not in plan
 *   mode", an error the harness raises before any hook runs, so `--mark` never
 *   saw it and no marker was written. The session re-entered plan mode and the
 *   owner approved the same plan twice. What the harness does write is a
 *   `plan_mode_exit` entry ("Exited Plan Mode") naming the plan file. When that
 *   entry has no approved ExitPlanMode result of the session's behind it since
 *   plan mode began, it is the owner's own exit, and the first PreToolUse that
 *   sees it records the marker from it, hashing the plan file at that moment —
 *   and hook-dispatch.mjs makes that first call its own, `--judge-exit`, run
 *   before the latch, the manager fence, the dispatch gate and the plan fence
 *   read the marker, so an agent sent as the first call after the exit is
 *   judged against the marker the exit records —
 *   unless the file changed after the exit, when it is not the plan the owner
 *   left plan mode on. Each exit entry is judged once
 *   (~/.claude/APPROVED-PLAN-app-exits.json), so `--done` is never undone by
 *   an old exit. A "not in plan mode" error beside such an entry is that
 *   approval, and plan mode is not entered again for it: `--app-exit`, run by
 *   hook-dispatch.mjs on the main thread's EnterPlanMode, refuses it while the
 *   marker recorded from that exit stands and nothing has happened since but
 *   reads, until an agent is sent under the plan or the owner writes again.
 *
 *   THE MARKER ALSO HOLDS THE HASH OF THE PLAN'S SCRIPT (`scriptHash`), taken from
 *   its `## Script` section at approval (`scriptHashOf` in report.mjs), by the tool
 *   and from the owner's exit in the app alike. An amendment moves `hash` and
 *   `scope` and keeps `scriptHash`, so a script edited after approval matches
 *   nothing, and a Workflow call is held to the one the owner read
 *   (`workflowGate` in hook-dispatch.mjs).
 *
 *   THE MARKER ALSO HOLDS THE STEP NUMBERS THE PLAN HAD WHEN IT WAS APPROVED (`steps`:
 *   those of its `## Steps` section, `standing`: those on its `Standing:` line,
 *   `approvedStepSet` in report.mjs), by the tool and from the owner's exit in the app
 *   alike. An amendment keeps both exactly as approved, so an edit of a step's text or of
 *   the Order of the approved steps keeps the approval and changes nothing recorded, while
 *   a step added after approval, or put on the Standing line after it, is not in the
 *   recorded set and `approvalSetProblem` in hook-dispatch.mjs refuses to send it: it
 *   needs the owner's button. A marker written before this was recorded holds neither
 *   list and carries no such check.
 *
 *   THE STEPS FILE (`writeStepsFile`). Wherever the marker names a plan or moves its
 *   hash (approval by the tool, the owner's exit in the app, an amendment), this also
 *   writes `<plan>.steps.md` beside the plan, holding only the plan's Rules, Steps and
 *   Commands (`stepsFileText` in report.mjs). The dispatch gate accepts a prompt naming
 *   that file in the plan's place, and refuses it if the file is not what the plan in
 *   force would give, so an agent reads a few hundred lines in place of the whole plan
 *   and can never be sent a stale copy.
 *
 *   `node approved-plan-guard.mjs --done` ends the approved work: the last
 *   step of every plan runs it.
 *
 * What this cannot see is whether each step was announced in chat. That half
 * is the rule, and the refusal prints it.
 */
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync, lstatSync, statSync, openSync, readSync, closeSync, fstatSync } from 'node:fs';
import { join, dirname, isAbsolute, resolve } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tailEntries, isOwnerMessage } from './transcript-tail.mjs';
import { californiaTime, scopeHashes, scopeChanged, SCOPE_SECTIONS, scriptHashOf, stepsFilePath, stepsFileText, approvedStepSet } from './report.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const MARKER = join(homedir(), '.claude', 'APPROVED-PLAN.json');
// Every plan-mode exit entry already judged, so each is judged once.
const APP_EXITS = join(homedir(), '.claude', 'APPROVED-PLAN-app-exits.json');
const RULE = 'PLAN MODE ONLY, AND TALK DURING THE WORK (Doctrine §0e): nothing runs that is not inside a plan the owner approved in plan mode; '
  + 'a request in chat gets a plan, not an action; while executing, say what each step does before it runs and what it showed after.';
const hashOf = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

/**
 * The marker's records of a plan file, from ONE read.
 * @param {string} p  the plan file.
 * @returns {{hash: string, scope: Record<string, string>, script: string, steps: number[], standing: number[]}}
 *   the sha256 of the file, the hashes of its approved scope (`scopeHashes`: Goals, Asked, Files,
 *   Commands), the hash of its script (`scriptHashOf`, '' when it has none), and the step
 *   numbers it holds now (`approvedStepSet`): those of its Steps section and those on its
 *   Standing line. The marker holds all of them at approval: the whole-file hash is what every
 *   other gate compares, the scope is what an amendment of the Steps or the Order is allowed to
 *   keep unchanged, the script's hash is what a Workflow call is held to (`workflowGate`), and
 *   the two lists of numbers are what a send is held to (`approvalSetProblem` in
 *   hook-dispatch.mjs). An amendment moves the hash and the scope and never the rest, so a
 *   script edited after approval matches nothing and a step added after it is not one that
 *   was approved.
 */
const snapshotOf = (p) => {
  const bytes = readFileSync(p);
  const text = bytes.toString('utf8');
  return { hash: createHash('sha256').update(bytes).digest('hex'), scope: scopeHashes(text), script: scriptHashOf(text), ...approvedStepSet(text) };
};

/**
 * Write the steps file beside a plan.
 * @param {string} plan  the approved plan file, absolute.
 * @returns {string|null} the steps file's path once `stepsFileText` of the plan's text
 *   is written there (`stepsFilePath`: the plan's path with `.steps.md`), null when the
 *   plan cannot be read or the file cannot be written; a failure is not fatal, and the
 *   dispatch gate refuses a prompt naming a steps file that is not the plan's current
 *   one, so a file that is missing or stale is never sent to an agent. Called wherever
 *   the marker names a plan or moves its hash (approval, the owner's exit in the app,
 *   an amendment), so the file is always the plan the marker holds. It holds the plan's
 *   Rules, Steps and Commands only: an agent reads that much instead of the whole plan.
 */
function writeStepsFile(plan) {
  try {
    const file = stepsFilePath(plan);
    writeFileSync(file, stepsFileText(readFileSync(plan, 'utf8'), plan));
    return file;
  } catch { return null; }
}

if (process.argv.includes('--done')) {
  rmSync(MARKER, { force: true });
  console.log('approved work ended: marker removed. The next action needs a new approved plan.');
  process.exit(0);
}

// ONCE. See plan-guard.mjs: a second read of stdin gets nothing.
const raw = readFileSync(0, 'utf8');
let p = {};
try { p = JSON.parse(raw); } catch { /* unparsable: treated as a write below */ }
const tool = p.tool_name ?? '';

/**
 * Is this a plan file a marker may name?
 * @param {*} f  a path.
 * @returns {boolean} true only for an absolute path to a regular `.md` file,
 *   never a link to one; every marker this guard writes names one.
 */
const isPlanFile = (f) => {
  try { return typeof f === 'string' && isAbsolute(f) && f.endsWith('.md') && lstatSync(f).isFile(); } catch { return false; }
};

/**
 * Which plan file an ExitPlanMode result approves.
 *
 * The hook is handed the TOOL'S RESULT, not the text the session reads.
 * Measured in Claude Code 2.1.284 on 2026-09-28: the result is an object,
 * `{plan, isAgent, filePath, hasTaskTool?, planWasEdited?}`, and "approved your
 * plan" and "saved to:" exist only in the sentence mapped from it for the
 * session. The first version matched those two phrases in the stringified
 * object, so it never wrote a marker — two approvals, no marker, every write
 * after them refused — and it matched them inside the plan's OWN words, so a
 * plan quoting that sentence and a path approved whatever file the path named.
 *
 * @param {object} p  the PostToolUse payload of an ExitPlanMode call.
 * @returns {string} the approved plan file, or '' when this result is not the
 *   owner approving this session's plan. A non-empty return is always an
 *   absolute path to a regular `.md` file, never a link to one: `--mark` hashes
 *   it, and PreToolUse refuses every write once that file's hash no longer
 *   matches the marker. Anything unrecognised returns '', which fails closed.
 */
function approvedPlanPath(p) {
  if (p.agent_id || p.is_error) return '';                    // a subagent's exit, or an error, is not the owner's approval
  const r = p.tool_response;
  if (r && typeof r === 'object' && !Array.isArray(r)) {
    // A subagent's exit, or a teammate's request to its lead, approves nothing;
    // nor does an empty plan ("approved exiting plan mode"). `isAgent` is always
    // a boolean in the measured result, so anything but `false` is refused. An
    // object is never text-matched: it carries the plan's own words.
    if (r.isAgent !== false || r.awaitingLeaderApproval) return '';
    if (typeof r.plan !== 'string' || !r.plan.trim()) return '';
    return isPlanFile(r.filePath) ? r.filePath : '';
  }
  // Fallback, for a result that arrives as text. The measured sentence opens
  // it, and the path is a line of its own BEFORE "## Approved Plan", which is
  // where the plan's own words begin — so only that head is searched.
  const text = typeof r === 'string' ? r
    : Array.isArray(r) ? r.map((b) => (typeof b === 'string' ? b : b?.text ?? '')).join('\n') : '';
  const head = text.split(/\r?\n## Approved Plan/)[0];
  if (!/^User has approved your plan\./.test(head)) return '';
  const m = /^Your plan has been saved to: (.+\.md)\r?$/m.exec(head);
  return m && isPlanFile(m[1]) ? m[1] : '';
}

// ---- an approval pressed in the app ----

// The harness's own exit entry, as a raw JSONL line: unescaped quotes, so a
// tool result or a file that merely quotes the words (escaped in its JSON
// string) is never taken for one.
const EXIT_LINE = /(?<!\\)"type":"plan_mode_exit"/;

/**
 * The newest plan-mode exit entry in the transcript's last 2 MB.
 * @param {string} path  the transcript.
 * @returns {object|null} the parsed `plan_mode_exit` attachment entry, or null
 *   when the tail holds none or cannot be read. Cheap on purpose: it runs on
 *   every PreToolUse, and only an entry not yet judged costs a full read.
 */
function lastExitEntry(path) {
  let fd;
  try {
    fd = openSync(path, 'r');
    const size = fstatSync(fd).size;
    const start = Math.max(0, size - 2 * 1024 * 1024);
    const buf = Buffer.alloc(size - start);
    readSync(fd, buf, 0, buf.length, start);
    const lines = buf.toString('utf8').split('\n');
    for (let i = lines.length - 1; i >= (start > 0 ? 1 : 0); i--) {
      if (!EXIT_LINE.test(lines[i])) continue;
      try {
        const e = JSON.parse(lines[i]);
        if (e?.type === 'attachment' && e.attachment?.type === 'plan_mode_exit') return e;
      } catch { /* a partial line */ }
    }
    return null;
  } catch { return null; } finally { if (fd !== undefined) closeSync(fd); }
}

/**
 * The owner's own exit from plan mode in the app, when the transcript shows it.
 * @param {object[]} entries  the transcript's tail, in file order.
 * @returns {{plan: string, at: number, uuid: string, index: number} | null}
 *   the newest main-thread `plan_mode_exit` entry, its plan file, time and
 *   index, when plan mode began after the exit before it (an EnterPlanMode
 *   result, or a `plan_mode` entry where the owner entered it in the app) and
 *   no ExitPlanMode call of the session's was approved since — which is what
 *   makes it the owner's exit rather than the tool's — and nothing entered plan
 *   mode after it. null otherwise: a tail that does not reach back to the start
 *   of plan mode mints nothing, and neither does the entry that follows the
 *   tool's own approval, which `--mark` already recorded.
 */
function appExit(entries) {
  const names = new Map();
  let inPlan = false, approved = false, found = null;
  entries.forEach((e, i) => {
    if (e?.isSidechain || e?.agentId) return;
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) for (const b of c) if (b?.type === 'tool_use') names.set(b.id, b.name);
    if (e?.type === 'user' && Array.isArray(c)) for (const b of c) {
      if (b?.type !== 'tool_result' || b.is_error) continue;
      const n = names.get(b.tool_use_id);
      if (n === 'EnterPlanMode') { inPlan = true; approved = false; found = null; }
      else if (n === 'ExitPlanMode') approved = true;
    }
    const a = e?.type === 'attachment' ? e.attachment : null;
    if (a?.type === 'plan_mode') { if (!inPlan) { inPlan = true; approved = false; } found = null; }
    if (a?.type === 'plan_mode_exit') {
      const at = Date.parse(e.timestamp ?? '');
      found = inPlan && !approved && a.planExists !== false && typeof a.planFilePath === 'string' && e.uuid && Number.isFinite(at)
        ? { plan: a.planFilePath, at, uuid: String(e.uuid), index: i } : null;
      inPlan = false; approved = false;
    }
  });
  return found;
}

/**
 * The exit entries already judged, and what was decided for each.
 * @returns {Record<string, string>} uuid to outcome; empty when the file is
 *   missing or unreadable, which only means each exit is judged again.
 */
function judgedExits() {
  try { const j = JSON.parse(readFileSync(APP_EXITS, 'utf8')); return j && typeof j === 'object' ? j.judged ?? {} : {}; } catch { return {}; }
}

/**
 * Record the approval from the owner's own exit from plan mode in the app.
 * @param {object} p  a PreToolUse payload: its transcript, session and mode.
 * @returns {{uuid: string, outcome: string, plan?: string, at?: number, index?: number} | null}
 *   null in plan mode or when the transcript holds no exit entry; otherwise the
 *   newest exit entry and its outcome, judged once and kept in APP_EXITS:
 *   "recorded" (the marker was written from it, hashing the plan file now),
 *   "changed after" (the plan file was written after the exit, so no marker),
 *   "no plan file", or "not the owner's exit". A "recorded" exit has written a
 *   marker the PreToolUse check below then honours like any other, and `--done`
 *   is not undone by it, because it is never judged twice.
 */
function recordAppExit(p) {
  if (p.permission_mode === 'plan' || !p.transcript_path) return null;
  const last = lastExitEntry(p.transcript_path);
  if (!last?.uuid) return null;
  const judged = judgedExits();
  if (judged[last.uuid]) return { uuid: String(last.uuid), outcome: judged[last.uuid] };
  const x = appExit(tailEntries(p.transcript_path, 8 * 1024 * 1024));
  let outcome;
  if (!x || x.uuid !== last.uuid) outcome = "not the owner's exit";
  else if (!isPlanFile(x.plan)) outcome = 'no plan file';
  else if (statSync(x.plan).mtimeMs > x.at) outcome = 'changed after';
  else {
    mkdirSync(dirname(MARKER), { recursive: true });
    const snap = snapshotOf(x.plan);
    writeFileSync(MARKER, JSON.stringify({
      plan: x.plan, hash: snap.hash, scope: snap.scope, scriptHash: snap.script, at: new Date().toISOString(), session: p.session_id ?? null,
      steps: snap.steps, standing: snap.standing,
      via: `the owner's exit from plan mode in the app: entry ${x.uuid} at ${new Date(x.at).toISOString()}`, planMatchesFile: null, appExit: x.uuid,
    }, null, 1));
    writeStepsFile(x.plan);
    outcome = 'recorded';
  }
  const keep = Object.entries(judged).slice(-99);
  mkdirSync(dirname(APP_EXITS), { recursive: true });
  writeFileSync(APP_EXITS, JSON.stringify({ judged: Object.fromEntries([...keep, [String(last.uuid), outcome]]) }, null, 1));
  return { uuid: String(last.uuid), outcome, ...(x && x.uuid === last.uuid ? x : {}) };
}

if (process.argv.includes('--judge-exit')) {
  // hook-dispatch.mjs runs this FIRST on every PreToolUse, before the latch, the
  // manager fence, the dispatch gate or the plan fence reads the marker. It only
  // judges the newest plan-mode exit entry and records the marker when that
  // entry is the owner's; it never refuses. Without it, when the first call
  // after the owner's exit was sending an agent, the dispatch gate refused on
  // the old marker and the exit was never judged (measured 2026-10-04 05:12).
  try { recordAppExit(p); } catch { /* records nothing; the checks that follow judge the call as before */ }
  process.exit(0);
}

if (process.argv.includes('--app-exit')) {
  // hook-dispatch.mjs runs this on the main thread's EnterPlanMode only, and
  // does not latch on its refusal.
  if (p.agent_id || tool !== 'EnterPlanMode') process.exit(0);
  let r = null;
  try { r = recordAppExit(p); } catch { r = null; }
  if (r?.outcome !== 'recorded') process.exit(0);
  let mk = {};
  try { mk = JSON.parse(readFileSync(MARKER, 'utf8')); } catch { process.exit(0); }
  let same = false;
  try { same = mk.appExit === r.uuid && hashOf(mk.plan) === mk.hash; } catch { same = false; }
  if (!same) process.exit(0);
  // Released once anything but reading has happened under the approval: an
  // agent sent, or a message the owner wrote after the exit. Amending a plan
  // after work under it began is what EnterPlanMode is for.
  const entries = tailEntries(p.transcript_path, 8 * 1024 * 1024);
  const i = entries.findIndex((e) => String(e?.uuid ?? '') === r.uuid);
  if (i < 0) process.exit(0);
  const since = entries.slice(i + 1);
  const sent = since.some((e) => e?.type === 'assistant' && !e.isSidechain && Array.isArray(e.message?.content)
    && e.message.content.some((b) => b?.type === 'tool_use' && /^(Agent|Task|SendMessage)$/.test(b.name ?? '')));
  const wrote = since.some((e) => isOwnerMessage(e));
  if (sent || wrote) process.exit(0);
  const when = Number.isFinite(Date.parse(entries[i].timestamp ?? '')) ? californiaTime(new Date(entries[i].timestamp)) : 'an earlier time';
  process.stderr.write(`APPROVED IN THE APP: the owner left plan mode in the app at ${when} (California), and that is the approval of ${mk.plan}. `
    + 'The approval marker is recorded from it, hashed from the plan file as it stood then. A "You are not in plan mode" error from ExitPlanMode beside it is that '
    + 'approval, not a refusal. Plan mode is not entered again for the same plan: carry on with it. Once an agent has been sent under it, or the owner '
    + 'writes again, plan mode can be entered to amend it.\n');
  process.exit(2);
}

if (process.argv.includes('--mark')) {
  if (tool === 'EnterPlanMode') { rmSync(MARKER, { force: true }); process.exit(0); }
  if (tool !== 'ExitPlanMode') process.exit(0);
  const plan = approvedPlanPath(p);
  const r = p.tool_response;
  if (!plan) {
    // Not this session's plan approved: no marker. A subagent's exit is meant
    // to mint nothing; anything else is said out loud, on the one channel a
    // PostToolUse hook has to the session.
    if (p.agent_id) process.exit(0);
    const shape = r && typeof r === 'object' && !Array.isArray(r)
      ? `an object with ${Object.keys(r).join(', ') || 'no fields'}` : typeof r;
    process.stderr.write(`approved-plan-guard --mark: ExitPlanMode returned and no approval marker was written; the result was ${shape}. `
      + 'Every write stays refused until a plan is approved in a shape this guard recognises.\n');
    process.exit(2);
  }
  const fromObject = r !== null && typeof r === 'object' && !Array.isArray(r);
  // Whether the approved text is the file that gets hashed. Recorded, never
  // refused on: an edit made in the approval dialog should reach the file
  // before this runs, and this is how a real approval shows whether it did.
  let snap, planMatchesFile;
  try {
    snap = snapshotOf(plan);
    planMatchesFile = fromObject ? r.plan.trim() === readFileSync(plan, 'utf8').trim() : null;
  } catch { process.exit(0); }                                // the file went between the check and the read: no marker
  mkdirSync(dirname(MARKER), { recursive: true });
  writeFileSync(MARKER, JSON.stringify({
    plan, hash: snap.hash, scope: snap.scope, scriptHash: snap.script, at: new Date().toISOString(), session: p.session_id ?? null,
    steps: snap.steps, standing: snap.standing,
    via: `ExitPlanMode approval: result ${fromObject ? 'filePath' : 'text'}`, planMatchesFile,
  }, null, 1));
  writeStepsFile(plan);
  process.exit(0);
}

// ---- an amendment keeps the approval while the approved scope stands ----

const AMENDING = ['Write', 'Edit', 'MultiEdit'];

/**
 * The plan file as an edit would leave it.
 * @param {string} name  the tool: Write, Edit or MultiEdit.
 * @param {object} input  the tool's input.
 * @param {string} before  the plan file now.
 * @returns {string|null} the text after the edit, or null when it cannot be told:
 *   a tool that is none of the three; an edit with no old text, with old text the
 *   file does not hold, or holding it more than once without replace_all (the
 *   tool itself would refuse those, but this guard must not guess). A Write is
 *   its content.
 */
function afterEdit(name, input, before) {
  const apply = (text, e) => {
    const from = e?.old_string, to = e?.new_string;
    if (typeof from !== 'string' || typeof to !== 'string' || !from) return null;
    const n = text.split(from).length - 1;
    if (n === 0 || (n > 1 && !e.replace_all)) return null;
    return e.replace_all ? text.split(from).join(to) : text.replace(from, () => to);
  };
  if (name === 'Write') return typeof input?.content === 'string' ? input.content : null;
  if (name === 'Edit') return apply(before, input);
  if (name === 'MultiEdit') {
    let text = before;
    for (const e of Array.isArray(input?.edits) ? input.edits : []) { text = apply(text, e); if (text === null) return null; }
    return text;
  }
  return null;
}

/**
 * Would this write to the approved plan leave the approved scope as approved?
 * @param {object} mk  the approval marker.
 * @returns {string|null} null when the write may go: the main thread's Write,
 *   Edit or MultiEdit, in the session that approved the plan, on a plan file that
 *   still matches the marker's hash, whose marker records the approval's scope,
 *   and whose text after the edit has the same Goals, Asked, Files and Commands
 *   (`scopeChanged`), so only the Steps, the Order or other sections move.
 *   Otherwise the refusal. An agent never amends the plan; a marker from before
 *   the scope was recorded keeps the whole-file rule; an edit that cannot be
 *   simulated is refused. THE INVARIANT the PostToolUse `--amend` relies on: a
 *   write let through here changes none of the four approved sections as far as
 *   this simulation can tell, and `--amend` checks the real file again.
 */
function amendProblem(mk) {
  const voids = `Editing ${mk.plan} voids its approval, and every write after it would be refused. A changed plan goes back through plan mode.`;
  if (p.agent_id || !mk.scope || typeof mk.scope !== 'object' || Array.isArray(mk.scope) || !AMENDING.includes(tool)) return voids;
  if (mk.session && p.session_id && mk.session !== p.session_id) return 'The plan in force was approved in another session.';
  let before;
  try { before = readFileSync(mk.plan, 'utf8'); if (hashOf(mk.plan) !== mk.hash) return `The plan file ${mk.plan} has changed since it was approved; a changed plan needs approving again.`; } catch { return voids; }
  const after = afterEdit(tool, p.tool_input ?? {}, before);
  if (after === null) return `${voids} (This edit could not be applied to the plan as it stands, so whether it leaves ${SCOPE_SECTIONS.join(', ')} as approved cannot be told, and nothing is written.)`;
  const moved = scopeChanged(mk.scope, after);
  if (moved.length) {
    return `This edit would change ${moved.join(', ')} in ${mk.plan}. ${moved.length === 1 ? 'That section is' : 'Those sections are'} what the owner approved, and an edit to ${moved.length === 1 ? 'it' : 'them'} voids the approval: `
      + 'the plan goes back through plan mode and the owner\'s button. An edit to the Steps or the Order keeps the approval.';
  }
  return null;
}

if (process.argv.includes('--amend')) {
  // hook-dispatch.mjs runs this at PostToolUse of a Write, Edit or MultiEdit on
  // the main thread. If the file just written is the approved plan, the real
  // text is read again; when its Goals, Asked, Files and Commands are still the
  // approved ones, the marker's hash moves to the file's, which keeps the plan in
  // force through an amendment of the Steps or the Order. When they are not, or
  // this does not run, the marker keeps its old hash and the plan is out of
  // force, so every gate refuses: it fails closed.
  if (p.agent_id || !AMENDING.includes(tool)) process.exit(0);
  let mk = {};
  try { mk = JSON.parse(readFileSync(MARKER, 'utf8')); } catch { process.exit(0); }
  if (!mk.plan || resolve(String(p.tool_input?.file_path ?? '')) !== resolve(mk.plan)) process.exit(0);
  if (mk.session && p.session_id && mk.session !== p.session_id) process.exit(0);
  let snap;
  try { snap = snapshotOf(mk.plan); } catch { process.exit(0); }
  if (snap.hash === mk.hash) process.exit(0);
  const moved = mk.scope && typeof mk.scope === 'object' && !Array.isArray(mk.scope) ? scopeChanged(mk.scope, readFileSync(mk.plan, 'utf8')) : [...SCOPE_SECTIONS];
  if (moved.length) {
    process.stderr.write(`approved-plan-guard --amend: ${mk.plan} now differs from the approved plan in ${moved.join(', ')}, so the approval was NOT carried to it and no plan is in force. `
      + 'A changed plan goes back through plan mode.\n');
    process.exit(2);
  }
  writeFileSync(MARKER, JSON.stringify({ ...mk, hash: snap.hash, scope: snap.scope, amendedAt: new Date().toISOString(), amendments: (Number(mk.amendments) || 0) + 1 }, null, 1));
  writeStepsFile(mk.plan);
  process.exit(0);
}

// ---- PreToolUse ----
const deny = (why) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `${why} ${RULE}` } }));
  process.exit(2);
};

if (p.permission_mode === 'plan') process.exit(0);           // plan-guard.mjs owns plan mode
// The owner's exit from plan mode in the app, recorded by the first call to see
// it — a read included, so the marker is written before anything can change
// the plan file. Never fatal: a failure here records nothing, and the checks
// below then judge the call as before.
let app = null;
try { app = recordAppExit(p); } catch { app = null; }
if (tool === 'EnterPlanMode' || tool === 'ExitPlanMode') process.exit(0);

// A FILE TOOL IS JUDGED BY ITS TARGET. Aimed at the marker, refused. Aimed at
// the approved plan, refused unless it is the main thread amending the plan and
// the text it would leave has the approved Goals, Asked, Files and Commands
// (`amendProblem`): an edit to those voids the approval, and every write after
// it would be refused with nobody told why. An edit to the Steps or the Order
// keeps the approval, and the PostToolUse `--amend` moves the marker's hash to
// the file's. A file whose content merely NAMES the marker is not a write to
// it, so file tools skip the name check.
const FILE_TOOLS = ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'];
if (FILE_TOOLS.includes(tool)) {
  const target = resolve(String(p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? ''));
  if (target === resolve(MARKER) || target === resolve(APP_EXITS)) deny('The approval marker is written only by the owner\'s approval of a plan.');
  let current = {};
  try { current = JSON.parse(readFileSync(MARKER, 'utf8')); } catch { /* no marker: judged below */ }
  if (current.plan && target === resolve(current.plan)) {
    const bar = amendProblem(current);
    if (bar) deny(bar);
    process.exit(0);
  }
}

// Is it a write? Ask plan-guard.mjs, with the mode forced to plan. A Workflow
// launches writing agents and plan-guard does not name it, so it is a write.
// Asked FIRST: a read that merely names the marker (a grep, a cat) is a read.
let write = tool === 'Workflow';
let why = write ? 'a Workflow launches agents that can write.' : '';
if (!write) {
  const pg = join(HERE, 'plan-guard.mjs');
  const r = spawnSync('node', [pg], { input: JSON.stringify({ ...p, permission_mode: 'plan' }), encoding: 'utf8', cwd: p.cwd || process.cwd() });
  // Only a clean 0 is a read. A crash, a signal or a spawn failure is a write:
  // the first version passed a classifier that exited 1 as a read.
  write = r.status !== 0;
  if (write) {
    try { why = JSON.parse(r.stdout).hookSpecificOutput.permissionDecisionReason; } catch { why = `the classifier exited ${r.status ?? r.signal ?? r.error?.code}.`; }
    why = String(why).replace(/^PLAN MODE\.\s*/, '').replace(/\s*Say so in plain text and stop[\s\S]*$/, '');
  }
}
if (!write) process.exit(0);

// THE MARKER IS THE OWNER'S. A command that names it and writes is refused,
// with no exception: the real `--done` never names it. A string check cannot
// stop a name assembled from pieces inside the shell (measured: a variable
// holding half the name, joined in a redirect, rewrote it under an approved
// plan); that half rests on the rule, Doctrine §0e.
const input = FILE_TOOLS.includes(tool) ? '' : JSON.stringify(p.tool_input ?? {});
if (input.includes('APPROVED-PLAN')) {
  // The old exception here passed any command carrying both strings, and a
  // redirect into the marker carries both. Measured 2026-09-28: it wrote one.
  deny('The approval marker is written only by the owner\'s approval of a plan.');
}

// Said when the newest exit from plan mode was the owner's and recorded nothing.
const appNote = app?.outcome === 'changed after' ? ` The owner left plan mode in the app${app.at ? ` at ${californiaTime(new Date(app.at))} (California)` : ''}, but ${app.plan ?? 'the plan file'} was written after that, so it is not the plan approved.`
  : app?.outcome === 'no plan file' ? ' The owner left plan mode in the app, and the plan file that exit names is gone.' : '';
if (!existsSync(MARKER)) deny(`No approved plan is in force, and this is not a recognised read: ${why}${appNote}`);
let mk = {};
try { mk = JSON.parse(readFileSync(MARKER, 'utf8')); } catch { deny('The approval marker is unreadable.'); }
if (!mk.plan || !existsSync(mk.plan)) deny('The approved plan file is gone.');
// A marker from before sessions were recorded carries none, and is honoured.
if (mk.session && p.session_id && mk.session !== p.session_id) deny('The plan in force was approved in another session.');
let now = '';
try { now = hashOf(mk.plan); } catch (e) { deny(`The approved plan file ${mk.plan} cannot be read (${e.code ?? e.message}).`); }
if (now !== mk.hash) deny(`The plan file ${mk.plan} has changed since it was approved; a changed plan needs approving again.`);
process.exit(0);
