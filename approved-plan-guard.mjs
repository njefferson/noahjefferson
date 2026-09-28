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
 *   `node approved-plan-guard.mjs --done` ends the approved work: the last
 *   step of every plan runs it.
 *
 * What this cannot see is whether each step was announced in chat. That half
 * is the rule, and the refusal prints it.
 */
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync, lstatSync } from 'node:fs';
import { join, dirname, isAbsolute, resolve } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const MARKER = join(homedir(), '.claude', 'APPROVED-PLAN.json');
const RULE = 'PLAN MODE ONLY, AND TALK DURING THE WORK (Doctrine §0e): nothing runs that is not inside a plan the owner approved in plan mode; '
  + 'a request in chat gets a plan, not an action; while executing, say what each step does before it runs and what it showed after.';
const hashOf = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

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
  const isPlanFile = (f) => {
    try { return typeof f === 'string' && isAbsolute(f) && f.endsWith('.md') && lstatSync(f).isFile(); } catch { return false; }
  };
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
  let hash, planMatchesFile;
  try {
    hash = hashOf(plan);
    planMatchesFile = fromObject ? r.plan.trim() === readFileSync(plan, 'utf8').trim() : null;
  } catch { process.exit(0); }                                // the file went between the check and the read: no marker
  mkdirSync(dirname(MARKER), { recursive: true });
  writeFileSync(MARKER, JSON.stringify({
    plan, hash, at: new Date().toISOString(), session: p.session_id ?? null,
    via: `ExitPlanMode approval: result ${fromObject ? 'filePath' : 'text'}`, planMatchesFile,
  }, null, 1));
  process.exit(0);
}

// ---- PreToolUse ----
const deny = (why) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `${why} ${RULE}` } }));
  process.exit(2);
};

if (p.permission_mode === 'plan') process.exit(0);           // plan-guard.mjs owns plan mode
if (tool === 'EnterPlanMode' || tool === 'ExitPlanMode') process.exit(0);

// A FILE TOOL IS JUDGED BY ITS TARGET. Aimed at the marker, refused. Aimed at
// the approved plan, refused: an edit there voids the approval, and every write
// after it would be refused with nobody told why. A file whose content merely
// NAMES the marker is not a write to it, so file tools skip the name check.
const FILE_TOOLS = ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'];
if (FILE_TOOLS.includes(tool)) {
  const target = resolve(String(p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? ''));
  if (target === resolve(MARKER)) deny('The approval marker is written only by the owner\'s approval of a plan.');
  let current = {};
  try { current = JSON.parse(readFileSync(MARKER, 'utf8')); } catch { /* no marker: judged below */ }
  if (current.plan && target === resolve(current.plan)) {
    deny(`Editing ${current.plan} voids its approval, and every write after it would be refused. A changed plan goes back through plan mode.`);
  }
}

// THE MARKER IS THE OWNER'S. A command that names it is refused, with no
// exception: the real `--done` never names it.
const input = FILE_TOOLS.includes(tool) ? '' : JSON.stringify(p.tool_input ?? {});
if (input.includes('APPROVED-PLAN')) {
  // The old exception here passed any command carrying both strings, and a
  // redirect into the marker carries both. Measured 2026-09-28: it wrote one.
  deny('The approval marker is written only by the owner\'s approval of a plan.');
}

// Is it a write? Ask plan-guard.mjs, with the mode forced to plan. A Workflow
// launches writing agents and plan-guard does not name it, so it is a write.
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

if (!existsSync(MARKER)) deny(`No approved plan is in force, and this is not a recognised read: ${why}`);
let mk = {};
try { mk = JSON.parse(readFileSync(MARKER, 'utf8')); } catch { deny('The approval marker is unreadable.'); }
if (!mk.plan || !existsSync(mk.plan)) deny('The approved plan file is gone.');
// A marker from before sessions were recorded carries none, and is honoured.
if (mk.session && p.session_id && mk.session !== p.session_id) deny('The plan in force was approved in another session.');
let now = '';
try { now = hashOf(mk.plan); } catch (e) { deny(`The approved plan file ${mk.plan} cannot be read (${e.code ?? e.message}).`); }
if (now !== mk.hash) deny(`The plan file ${mk.plan} has changed since it was approved; a changed plan needs approving again.`);
process.exit(0);
