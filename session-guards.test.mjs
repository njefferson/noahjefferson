#!/usr/bin/env node
/**
 * The guards of LESSONS §376, fed shaped transcripts and real git repositories.
 *
 *   node session-guards.test.mjs           every case; exit 1 on any failure
 *   node session-guards.test.mjs --plants  MADE TO FAIL: for each check, a copy of
 *                                          the guards with that check taken out, and
 *                                          a case naming it must then FAIL
 *
 * Covered: pending-guard.mjs (a message the owner sent and the session has not
 * been given), keep-info-guard.mjs (a commit that takes information back),
 * compact-recall.mjs and its place in hook-dispatch.mjs (the typed messages
 * printed again after a compaction), and the plan-approval deadlock between reply-guard.mjs
 * and plan-guard.mjs. And the manager's gates (Doctrine §0d, §0e, §11, §11e):
 * the manager fence, the dispatch gate and the refusal latch in
 * hook-dispatch.mjs, the latch's way out in stop-guard.mjs, refused names in
 * plan-guard.mjs, plan-fence.mjs, push-guard.mjs and doctrine-read-guard.mjs;
 * the state-claim gate in stop-guard.mjs (rule 15), the report gate that does
 * not latch and demands a status only while an agent or a background task the
 * session started runs, and the agents a status prints in report.mjs, ended
 * ones and each running one's progress note; the choice-first check in
 * stop-guard.mjs, the work pending-guard.mjs holds while an owner message
 * waits, whose refusal does not latch either, and an agent's TaskStop passing
 * plan-guard.mjs in plan mode. And the wait between statuses (report.mjs
 * --wait) with the manager fence passing exactly it, the main thread's
 * TaskStop passing the latch, and an approval pressed in the app recorded by
 * approved-plan-guard.mjs, with plan mode not entered again for it. And a
 * message the harness never delivered (pending-guard.mjs no longer holds work
 * for it once a message typed after it has arrived, and hook-dispatch.mjs prints
 * it once at the top of that prompt's turn), and the stop guard refusing a turn
 * that ends with steps of the approved plan unreturned and no agent running.
 * And the prints after a compaction or a resume (LESSONS §385, §398): the doctrine
 * due in full at a startup, a clear and a compaction, and after a resume only when
 * the transcript since the last compaction does not already hold every line of it
 * as it stands (doctrine-read-guard.mjs), the owner's messages since the previous
 * compaction, newest ten, with the count of the rest and a file under the scratchpad
 * holding every one that the main thread is held to read whole (compact-recall.mjs,
 * `recallGate`; LESSONS §416), the compaction said in the first status, on the page
 * and in the first line of the first reply (`markCompacted`, stop-guard.mjs), and the
 * lessons as a count and a folder (session-brief.mjs). And the judgement before each
 * send in five parts and the reasons for the step in four, in a plan with an Order or
 * without one (`judgedState`, `judgedGate`; LESSONS §407, §417).
 * And the state of the work on one page (report.mjs `managerNotes`, `sortFound`,
 * `statusPage`; the manager fence's write of `status/manager.txt`; the state page
 * gate after a compaction), the finding queue every plan answers line by line
 * (`foundQueue`, `foundAnsweredProblem`, called from plan-guard.mjs), the shared
 * rules a plan points at (agent-rules.md, `rulesProblem` at ExitPlanMode,
 * `rulesGate` at a send), the owner's core asks printed at every start
 * (session-brief.mjs), and the doctrine's pruning rule, whose one check is the
 * case that holds every `*Enforced whole by:*` line to a gate the hub has. And
 * the approval's Goals without their Served by line (report.mjs
 * `goalsWithoutServedBy`, a marker of the old kind still matching), and the
 * choice popup tool refused by plan mode, the manager fence, the plan fence and
 * approved-plan-guard.mjs (LESSONS §397).
 * And the manager's reading and the loop's cost (LESSONS §400 to §405): the saved
 * tool results, IR-SCIENCE.md and the decision records on the record list; a refused
 * read of the record recorded, named by the status and read again before a step goes
 * (`readsGate`); a status that shows what changed and nothing twice (`readSeen`); the
 * status page rewritten at a hand-back (`report.mjs --page`); a plan's own script
 * accepted by `workflowGate` behind a constant that is off, with the script's hash in
 * the approval marker; a latched agent's own report write; and the rules read first
 * (`rulesFirst` in plan-fence.mjs).
 * And the step numbers a plan held at approval (Doctrine §0e rules 2 and 13): the marker's
 * `steps` and `standing` lists written by the tool's approval and by the owner's exit in the
 * app and kept as they were through every amendment (`approvedStepSet`), read back by
 * `approvedPlan`, and the dispatch gate and the review gate holding a send to them
 * (`approvalSetProblem`): a step added after approval needs the owner's button, the Standing
 * line holds the review and a route check and gains no step, and neither refusal latches.
 * And the review step the approval recorded (`review`, beside `steps` and `standing`): kept
 * through every amendment, read back by `approvedPlan`, and held by both gates
 * (`reviewRecordProblem`), which refuse every step, a Standing one included, while no Standing
 * step of the plan names the review file by its full path any more, with a refusal that sends
 * the plan back through plan mode and sets no latch; and the stop guard counting as a step left
 * only a step whose number the marker recorded (`stepsLeft`).
 * And the four changes of LESSONS §424: the plan gate's name check reading the whole transcript through a widening tail and
 * passing a name that exists on disk (a bare name in the session scratchpad or in a repository the plan's Files names, a held
 * name once its file exists); a command line opened as a shell opens it, single quotes never opening a command and the refusal
 * naming the character a command was opened at (`commandsIn`, `plan-fence.mjs`); the doctrine gate's refusal, the plan gate's
 * refusal of a name and the identifier guard's refusal of the approval call setting no latch (`noLatchRepoRefusal`); and the
 * review's staleness narrowed by the After line of a plan's Order (`planAfter`, `reviewState`, `afterProblem`).
 * The whole suite runs under an empty home, so no real approval marker is read.
 *
 * In --plants mode a guard name a case cites with no plant behind it is a
 * failure too, so the map cannot fall behind the cases.
 *
 * The queue records are shaped like the real ones: an `enqueue` carries the
 * message as `content`, a `dequeue` carries nothing, a `remove` carries it.
 */
import { mkdtempSync, writeFileSync, copyFileSync, readFileSync, rmSync, appendFileSync, mkdirSync, existsSync, utimesSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
// CLAUDE.md is copied with the guards: `goalsBlock` in report.mjs reads the
// goals section of the CLAUDE.md beside it, and the plan guard refuses every plan
// that does not quote that block, so a guard copy without it refuses them all.
const FILES = ['pending-guard.mjs', 'keep-info-guard.mjs', 'compact-recall.mjs', 'reply-guard.mjs', 'transcript-tail.mjs',
  'plan-guard.mjs', 'hook-dispatch.mjs', 'report.mjs', 'drive-guard.mjs', 'approved-plan-guard.mjs', 'plan-scope-check.mjs', 'stop-guard.mjs',
  'push-guard.mjs', 'plan-fence.mjs', 'doctrine-read-guard.mjs', 'session-brief.mjs', 'CLAUDE.md', 'agent-rules.md', 'session-guards.test.mjs'];
// The shared rules file the guards read beside themselves: its version, and the pointer line a plan writes for the hub
// copy under test (a pointer may name the hub copy's own file, which is the live clone's in a session).
const RULES_VERSION = Number(/^Rules version:\s*(\d+)\s*$/m.exec(readFileSync(join(HERE, 'agent-rules.md'), 'utf8'))?.[1]);
const rulesLine = (dir, v = RULES_VERSION) => `Rules: ${join(dir, 'agent-rules.md')}, version ${v}.`;
// The standing goals block: the numbered lines of the "Goals every session serves"
// section of the hub CLAUDE.md beside this file, which a plan quotes word for
// word under its own Goals. Every plan fixture below carries it, so the goals
// check passes on the fixture and a refusal in a case is about what the case does.
const GOALS_BLOCK = (() => {
  const md = readFileSync(join(HERE, 'CLAUDE.md'), 'utf8');
  const m = /^## Goals every session serves[^\n]*\n([\s\S]*?)(?=^## |^# |$(?![\s\S]))/m.exec(md);
  return (m ? m[1] : '').split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => /^\d+\.\s/.test(l)).join('\n');
})();
const MADE = [];
const tmp = (p) => { const d = mkdtempSync(join(tmpdir(), p)); MADE.push(d); return d; };
// Every file the guards keep per session lands here, never in the real
// ~/.claude: a latch or a due marker left there by a test binds a real session.
const STATE = mkdtempSync(join(tmpdir(), 'sg-state-'));
process.env.REFUSAL_LATCH_DIR = join(STATE, 'latch');
process.env.DOCTRINE_DUE_DIR = join(STATE, 'due');
process.env.COMPACT_RECALL_DIR = join(STATE, 'recall');
process.env.PLAN_GUARD_NAMES_DIR = join(STATE, 'names');
process.env.HELD_WORK_DIR = join(STATE, 'held');
process.env.OWNER_TURN_DIR = join(STATE, 'owner-turn');
process.env.PAGE_DUE_DIR = join(STATE, 'page-due');
process.env.RECALL_DUE_DIR = join(STATE, 'recall-due');
process.env.COMPACTED_DIR = join(STATE, 'compacted');
process.env.STOP_REFUSED_DIR = join(STATE, 'stop-refused');
process.env.SKIPPED_PRINTED_DIR = join(STATE, 'skipped-printed');
process.env.REFUSED_READS_DIR = join(STATE, 'refused-reads');
process.env.MODEL_TIER_DIR = join(STATE, 'model-tier');
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
const enq = (s, content) => ({ type: 'queue-operation', operation: 'enqueue', timestamp: ts(s), sessionId: 't', content });
const deq = (s) => ({ type: 'queue-operation', operation: 'dequeue', timestamp: ts(s), sessionId: 't' });
const rem = (s, content) => ({ type: 'queue-operation', operation: 'remove', timestamp: ts(s), sessionId: 't', content });
const turn = (s, text) => ({ type: 'user', timestamp: ts(s), origin: { kind: 'human' }, message: { role: 'user', content: text } });
const mid = (s, text, kind = 'human', mode = 'prompt') => ({ type: 'attachment', timestamp: ts(s), attachment: { type: 'queued_command', prompt: text, commandMode: mode, origin: { kind } } });
const tool = (s, id, name, input = {}) => ({ type: 'assistant', timestamp: ts(s), message: { role: 'assistant', content: [{ type: 'tool_use', id, name, input }] } });
const result = (s, id, text, isError = false) => ({ type: 'user', timestamp: ts(s), message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content: text, is_error: isError }] } });
const boundary = (s) => ({ type: 'system', subtype: 'compact_boundary', timestamp: ts(s), compactMetadata: { trigger: 'auto' } });
const summary = (s) => ({ type: 'user', isCompactSummary: true, timestamp: ts(s), message: { role: 'user', content: 'This session is being continued from a previous conversation.' } });
const transcript = (entries) => { const f = join(tmp('sg-tr-'), 't.jsonl'); writeFileSync(f, entries.map((e) => JSON.stringify(e)).join('\n') + '\n'); return f; };
// A transcript whose file name is its own: compact-recall.mjs names the file holding
// every message after it, so two transcripts called t.jsonl would share one.
const namedTranscript = (entries) => { const f = join(tmp('sg-tr-'), `${sid('rc')}.jsonl`); writeFileSync(f, entries.map((e) => JSON.stringify(e)).join('\n') + '\n'); return f; };
// Read results on a file as the harness records them: for each range ([first line, how many, and the
// file's length when it was read if that differs from `total`]) a Read call and its result, a second
// apart from the time `when(0)` names. `when` gives the time of the k-th range: the default is fixed
// seconds after the fixture epoch, long before any marker a case writes, and a case that reads after
// its marker passes `(k) => later(5 + k)`.
let READ_ID = 0;
const fileReads = (file, total, ranges, when = (k) => ts(k + 1)) => ranges.flatMap(([start, count, tot = total], k) => {
  const id = `fr${++READ_ID}`;
  return [
    { type: 'assistant', timestamp: when(k), message: { role: 'assistant', content: [{ type: 'tool_use', id, name: 'Read', input: { file_path: file } }] } },
    { type: 'user', timestamp: when(k), message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content: Array.from({ length: count }, (_, j) => `${start + j}\tline`).join('\n') }] },
      toolUseResult: { type: 'text', file: { filePath: file, content: 'x', startLine: start, numLines: count, totalLines: tot } } },
  ];
});

const ASK = 'Why did the restore skip 069? Answer before anything else.';
const STOPMSG = 'STOP. Nothing more until I answer.';
// Ends with a go-word: held work is sent again in the turn that delivers it, and no
// correction stands once it is the owner's newest message.
const GO = 'Go.';
const NOTE = '<task-notification><task-id>w1</task-id><status>completed</status></task-notification>';

function repo(files, name) {
  const d = name ? join(tmp('sg-repos-'), name) : tmp('sg-repo-');
  if (name) mkdirSync(d);
  const g = (...a) => spawnSync('git', ['-C', d, ...a], { encoding: 'utf8' });
  g('init', '-q'); g('config', 'user.email', 't@example.invalid'); g('config', 'user.name', 't'); g('config', 'commit.gpgsign', 'false');
  for (const [f, c] of Object.entries(files)) writeFileSync(join(d, f), c);
  g('add', '-A'); g('commit', '-q', '-m', 'base');
  return { dir: d, g, write: (f, c) => writeFileSync(join(d, f), c), stage: () => g('add', '-A') };
}
// An invented owner request, and a plan around it (Doctrine §0f).
const OWNER = 'Please move the export button to the left side of the toolbar and nothing else at all.';
const QUOTED = 'Move it: please move the export button to the left side of the toolbar.';
const OWN_WORDS = 'Relocate the export control to the toolbar\'s left edge, with no other change.';
const PLAN = (asked) => ['# Test plan', '',
  '## Goals', '1. The toolbar shows the export button on its left side.', GOALS_BLOCK, 'Served by: step 1 serves goal 1.', '',
  ...(asked === null ? [] : ['## Asked', asked, '']),
  '## Looked up', 'Nothing outside the repository bears on this change at all.', '',
  '## Branches', 'One branch only, because the request names a single control to move.', '',
  '## Call chain', 'The toolbar builder places the button; nothing else reads its position.', '',
  '## Whole app', 'It belongs because it was asked for, and nothing else would change.', '',
  '## Leaves open', 'Nothing is left open by this change, as far as can be seen here.', ''].join('\n');
// A plan in the shape the dispatch gate and the plan fence read.
const STEPS_PLAN = ['# Gate test plan', '',
  '## Goals', '1. The thing is built and read.', GOALS_BLOCK, 'Served by: steps 1 and 2 serve goal 1.', '',
  '## Steps', '1. **Build.** Make the thing.', '2. **Check.** Read the thing.', '',
  '## Commands', '- git status', '- git commit', '- git push', '- node tools/', '- node --check', '- npm ci', '',
  '## Files touched', '- Repo: `keep.mjs`, `src/`, `docs/notes.md`', ''].join('\n');
// The same plan with its Files line labelled for one repository.
const fencePlan = (label) => ({ path: '/plans/gate-test.md', text: STEPS_PLAN.replace('- Repo:', `- ${label}:`) });
// The same plan with an Order section: steps 1 and 2 in order, step 3 Standing. The
// section's prose names a step on a line that is neither Order: nor Standing:, so a
// pointer reading the prose would read it wrong.
const ORDER_PLAN = STEPS_PLAN
  .replace('Served by: steps 1 and 2 serve goal 1.', 'Served by: steps 1, 2 and 3 serve goal 1.')
  .replace('## Steps', '## Order\nOrder: 1 2\nStanding: 3\nStep 9 is never sent, and the first line of a hand-back decides.\n\n## Steps')
  .replace('2. **Check.** Read the thing.', '2. **Check.** Read the thing.\n3. **Timer.** Wait on the thing.')
  .replace('## Files touched', '## Leaves open\n- The thing may need a second read.\n\n## Files touched');
const reply = (s, text) => ({ type: 'assistant', timestamp: ts(s), message: { role: 'assistant', content: [{ type: 'text', text }] } });
// The same plan with a Standing review step: step 3 tells its agent to follow the hub copy's aim-review.md by its
// full path, which is what makes the plan one the review gate enforces (Doctrine §0e rule 2). `dir` is the hub copy under test.
const reviewPlan = (dir) => ORDER_PLAN.replace('3. **Timer.** Wait on the thing.', `3. **Review.** Follow ${join(dir, 'aim-review.md')} for the move named on the status page.`);
// A plan whose first four approved sections all exist: the review plan with an Asked section added (`rulesScopedPlan` adds the last two).
const scopedPlan = (dir) => reviewPlan(dir).replace('## Order', `## Asked\n${OWN_WORDS}\n\n## Order`);
// One end of an agent in the shape stepEnds returns it. Times are small numbers: only their order matters.
const endFor = (step, endAt, startAt, first, how = 'a report') => ({ step, how, at: endAt, startAt, last: `${first}\nThe second line says what happened.` });
// An agent transcript as the harness writes one: its prompt, a command and its result, and the hand-back. `sent`
// and `ended` are seconds from now (negative: in the past), so the review gate's times can be set by hand.
function putAgent(subs, plan, id, n, sent, ended, first, running = false) {
  const body = [at({ type: 'user', message: { role: 'user', content: `${plan} step ${n}` } }, later(sent)),
    at(tool(0, `${id}-b`, 'Bash', { command: 'git status' }), later(sent + 1)), at(result(0, `${id}-b`, 'clean'), later(sent + 2))];
  if (!running) body.push(at(tool(0, `${id}-h`, 'SubagentHandback', { message: `${first}\nThe second line.` }), later(ended)), at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(ended + 1)));
  writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl(body));
  writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step ${n}` }));
}

/**
 * A home with an approved plan, a fresh status stamp and an empty launch
 * directory, and a way to run hook-dispatch.mjs inside it.
 * @param {string} dir  the hub copy under test.
 * @returns {{home: string, plan: string, cwd: string, tr: string, call: (event: string, payload: object, env?: object) => object}}
 *   `call`'s third argument adds to the environment of the one run (a case that needs a scratchpad of its own sets TMPDIR).
 */
function world(dir, entries = [], planText = STEPS_PLAN) {
  const home = tmp('sg-home-');
  mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
  const plan = join(home, '.claude', 'plans', 'gate-test.md');
  writeFileSync(plan, planText);
  writeFileSync(join(home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan, hash: createHash('sha256').update(planText).digest('hex') }));
  writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now(), status: 'Status' }));
  const cwd = tmp('sg-cwd-');
  const tr = transcript(entries);
  const subsDir = join(tr.slice(0, -'.jsonl'.length), 'subagents');
  const call = (event, payload, env = {}) => {
    // The plan fence asks every agent to have read the shared rules first (`rulesFirst`): an agent a case makes a call as,
    // without a transcript of its own, is given one that holds that Read and its hand-back, so the case is about what it names.
    // A transcript the case wrote itself (`putAgent`) is left as it is.
    if (payload.agent_id && !existsSync(join(subsDir, `agent-${payload.agent_id}.jsonl`))) {
      mkdirSync(subsDir, { recursive: true });
      writeFileSync(join(subsDir, `agent-${payload.agent_id}.jsonl`), jsonl(rulesReadEntries(dir, payload.agent_id)));
    }
    // A send of a plan's step by the main thread is held by the judgement gate, in a plan with no Order as in one with an Order,
    // until the manager's notes carry the step's Why line. A case about something else is given the notes; a case that wrote its
    // own (`judgedPad` before the call) keeps them.
    if (event === 'PreToolUse' && !payload.agent_id && /^(?:Agent|Task|SendMessage)$/.test(payload.tool_name ?? '') && payload.session_id) {
      const base = env.TMPDIR ?? tmpdir();
      if (!existsSync(join(base, 'claude-0', '-home-user', payload.session_id, 'scratchpad', 'status', 'manager.txt'))) judgedPad(payload.session_id, {}, 0, MANY_WHYS, base);
    }
    return spawnSync('node', [join(dir, 'hook-dispatch.mjs'), event], {
      input: JSON.stringify({ cwd, transcript_path: tr, hook_event_name: event, ...payload }), encoding: 'utf8',
      env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: cwd, ...env },
    });
  };
  return { home, plan, cwd, tr, call };
}
/**
 * A world whose approved plan has a review step (`reviewPlan`), written an hour
 * ago, with a place for agent transcripts and a way to send a step.
 * @param {string} dir  the hub copy under test.
 * @param {object[]} [entries]  the main transcript's entries.
 * @returns {object} `world`'s fields, and `subs` (the agents' folder), `agent(id, n,
 *   sent, ended, first)` and `running(id, n, sent)` to write one (seconds from now),
 *   `clear()` to remove every agent, and `send(n, s, extra)` to send step n as the
 *   main thread under session id s.
 */
function reviewWorld(dir, entries = [turn(0, GO)], opts = {}) {
  const w = world(dir, entries, reviewPlan(dir));
  const subs = join(w.tr.slice(0, -'.jsonl'.length), 'subagents');
  mkdirSync(subs, { recursive: true });
  const old = (Date.now() - 60 * 60 * 1000) / 1000;
  utimesSync(w.plan, old, old);
  // The agents written so far by id and step: a send finds the manager's notes holding a `Judged N:` line for each end of
  // each step (the judgement gate), unless the case is about that gate and passes `judge: false`.
  const ended = new Map();
  return {
    ...w, subs,
    agent: (id, n, sent, ended_, first) => { ended.set(id, n); putAgent(subs, w.plan, id, n, sent, ended_, first); },
    running: (id, n, sent) => putAgent(subs, w.plan, id, n, sent, 0, '', true),
    clear: () => { ended.clear(); rmSync(subs, { recursive: true, force: true }); mkdirSync(subs, { recursive: true }); },
    judgedLines: () => { const c = {}; for (const n of ended.values()) c[n] = (c[n] ?? 0) + 1; return c; },
    send: (n, s, extra = {}) => {
      if (opts.judge !== false) { const c = {}; for (const k of ended.values()) c[k] = (c[k] ?? 0) + 1; judgedPad(s, c); }
      return w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step ${n}`, subagent_type: 'general-purpose' }, ...extra });
    },
  };
}
// A whole judgement line (five parts, each ten characters or more) and a whole Why line (four parts) as the manager writes them.
const judgedLine = (n, i = 1) => `Judged ${n}: is: the case read hand-back ${i} | why: it ended as the case set it up | route: the plan sends the next step | fails: nowhere the case can see | cheapest: this is the cheapest route here`;
const whyLine = (n, i = 1) => `Why ${n}: now: the case sends this step (${i}) | wrong: nothing the case can see | fails: nowhere the case can see | cheapest: this is the cheapest route here`;
// Enough Why lines for every step a fixture plan has, so a case about the Judged lines is not also about the Why lines.
const MANY_WHYS = Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [n, 4]));
/**
 * A scratchpad for a session, with the manager's notes holding Judged lines and Why lines.
 * @param {string} s  the session id.
 * @param {Record<number, number>} lines  how many whole `Judged N:` lines to write for each step N.
 * @param {number} [ageSeconds]  how long ago the notes file was last written (0: just now).
 * @param {Record<number, number>} [whys]  how many whole `Why N:` lines to write for each step N; four for each of
 *   steps 1 to 9 by default, so the sends of a fixture plan are not refused for them.
 * @param {string} [base]  the temp folder the scratchpad sits under; the suite's own by default, and the folder a case
 *   hands the hook run as TMPDIR otherwise.
 * @returns {string} the notes file's path, under the suite's temp folder, where `scratchpadOf` finds it for a hook run that
 *   inherits the suite's environment. The judgement gate refuses a step until the newest end of a step of the plan has its
 *   line and the step being sent has its Why line.
 */
function judgedPad(s, lines, ageSeconds = 0, whys = MANY_WHYS, base = tmpdir()) {
  return notesPad(s, [...Object.entries(lines).flatMap(([n, c]) => Array.from({ length: c }, (_, i) => judgedLine(n, i + 1))),
    ...Object.entries(whys).flatMap(([n, c]) => Array.from({ length: c }, (_, i) => whyLine(n, i + 1)))].join('\n'), ageSeconds, base);
}
/**
 * A scratchpad for a session, with the manager's notes holding exactly the text given.
 * @param {string} s  the session id.
 * @param {string} text  the notes, one item to a line.
 * @param {number} [ageSeconds]  how long ago the notes file was last written (0: just now).
 * @param {string} [base]  the temp folder the scratchpad sits under; the suite's own by default.
 * @returns {string} the notes file's path, where `scratchpadOf` finds it for a hook run that inherits the suite's environment.
 */
function notesPad(s, text, ageSeconds = 0, base = tmpdir()) {
  const file = join(base, 'claude-0', '-home-user', s, 'scratchpad', 'status', 'manager.txt');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text ? `${text}\n` : '');
  if (ageSeconds) { const t = (Date.now() - ageSeconds * 1000) / 1000; utimesSync(file, t, t); }
  return file;
}
const latched = (s) => existsSync(join(process.env.REFUSAL_LATCH_DIR, `${s}.json`));
// An agent that read the shared rules first, as an agent's own transcript shows it: a prompt that names no step, the Read of the
// hub copy's agent-rules.md and its result, and a hand-back (so the agent is not counted as one still running).
const rulesReadEntries = (dir, id) => [at({ type: 'user', message: { role: 'user', content: 'Read the rules.' } }, later(-300)),
  at(tool(0, `${id}-rules`, 'Read', { file_path: join(dir, 'agent-rules.md') }), later(-299)), at(result(0, `${id}-rules`, '1\tRules version: 1'), later(-298)),
  at(tool(0, `${id}-back`, 'SubagentHandback', { message: 'Rules read.' }), later(-297)), at(result(0, `${id}-back`, 'Report delivered to your caller.'), later(-296))];
// The plan fence's decision with the rules-first check set aside, for the cases that are about something else.
const decideFence = (m, p, opts = {}) => m.fence.decide(p, { rules: () => null, ...opts });
const owner = (t, text) => ({ type: 'user', timestamp: t, origin: { kind: 'human' }, message: { role: 'user', content: text } });
const jsonl = (entries) => entries.map((e) => JSON.stringify(e)).join('\n') + '\n';

/**
 * Run `report.mjs --wait` in the background, the way the main thread runs it.
 * @param {string} dir  the hub copy under test.
 * @param {object} env  what to add to the environment (HOME, the session id, …).
 * @param {number} [killAfter]  ms before it is killed, so a broken wait fails
 *   the case rather than hanging the suite.
 * @returns {Promise<{code: number|null, out: string, ms: number}>} its output
 *   and how long it ran, resolved only once the process has exited, so no case
 *   leaves one running.
 */
const waitRun = (dir, env, killAfter = 15000) => new Promise((res) => {
  const t0 = Date.now();
  const ch = spawn('node', [join(dir, 'report.mjs'), '--wait'], { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  ch.stdout.on('data', (d) => { out += d; });
  ch.stderr.on('data', (d) => { out += d; });
  const timer = setTimeout(() => ch.kill('SIGKILL'), killAfter);
  ch.on('close', (code) => { clearTimeout(timer); res({ code, out, ms: Date.now() - t0 }); });
});
// Long enough for a wait just started to read where things stand first.
const settle = () => new Promise((r) => setTimeout(r, 1500));

// ---- an approval pressed in the app ----
// The shapes the harness writes, measured in a real session on 2026-10-03: the
// session's ExitPlanMode comes back "You are not in plan mode", and a
// plan_mode_exit attachment naming the plan file follows it.
let UID = 0;
const uid = () => `exit-${++UID}-${process.pid}`;
const enterPlan = (secs, id = 'ep') => [at(tool(0, id, 'EnterPlanMode', {}), later(secs)), at(result(0, id, 'Entered plan mode.'), later(secs + 1))];
const planOn = (secs, plan) => ({ type: 'attachment', timestamp: later(secs), attachment: { type: 'plan_mode', reminderType: 'full', isSubAgent: false, planFilePath: plan, planExists: true } });
const exitPlan = (secs, approved, id = 'xp') => [at(tool(0, id, 'ExitPlanMode', { plan: '# Gate test plan' }), later(secs)),
  at(result(0, id, approved ? 'User has approved your plan.' : '<tool_use_error>You are not in plan mode. To enter plan mode, call the EnterPlanMode tool first.</tool_use_error>', !approved), later(secs + 1))];
const exitEntry = (secs, plan, uuid) => ({ type: 'attachment', uuid, timestamp: later(secs), attachment: { type: 'plan_mode_exit', planFilePath: plan, planExists: true } });

/**
 * A home with a plan file written an hour ago, a fresh status stamp and no
 * approval marker, and a way to run approved-plan-guard.mjs inside it.
 * @param {string} dir  the hub copy under test.
 * @returns {{home: string, plan: string, marker: string, judged: string,
 *   guard: (tr: string, payload: object, flag?: string) => object,
 *   mk: () => object|null, outcome: (uuid: string) => string}}
 */
function appHome(dir) {
  const home = tmp('sg-home-');
  mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
  const plan = join(home, '.claude', 'plans', 'gate-test.md');
  writeFileSync(plan, STEPS_PLAN);
  const hourAgo = (Date.now() - 3600000) / 1000;
  utimesSync(plan, hourAgo, hourAgo);
  writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now(), status: 'Status' }));
  const marker = join(home, '.claude', 'APPROVED-PLAN.json');
  const judged = join(home, '.claude', 'APPROVED-PLAN-app-exits.json');
  const guard = (tr, payload, flag) => spawnSync('node', [join(dir, 'approved-plan-guard.mjs'), ...(flag ? [flag] : [])], {
    input: JSON.stringify({ session_id: 'app-test', transcript_path: tr, cwd: home, hook_event_name: 'PreToolUse', permission_mode: 'default', ...payload }),
    encoding: 'utf8', env: { ...process.env, HOME: home },
  });
  const read = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
  return { home, plan, marker, judged, guard, mk: () => read(marker), outcome: (u) => read(judged)?.judged?.[u] ?? '' };
}

const SOURCE_MD = [
  '# Lens', '',
  'Per-channel division is how RawTherapee, darktable, Lightroom and CornerFix',
  'remove such a cast. Adobe\'s page on helpx.adobe.com says shading can carry a',
  'colour cast and offers an option that removes only the cast.', '',
  'The figures below were measured on three frames.', '',
  'Earlier note: the comments feed on blog.kasson.com was read in a browser\'s identity; that reading is withdrawn.', '',
].join('\n');

// ---- fixtures for the shared rules, the finding queue and the state page (Doctrine §0e rules 2 and 13) ----
const PLAN_TALK = 'Here is what is being done and why: the export control moves to the toolbar edge, and nothing else changes.';
// A repository's NOTES.md with a queue of three findings in three forms, prose in the section, and a key outside it.
const QUEUE_NOTES = ['# Notes', '', '## Found queue', 'Prose that is not a finding.', '',
  'Q-QR-1: the first finding, which has some words in it.', '- Q-QR-2: the second finding, in a list.', '- **Q-QR-3** the third finding, in bold.', '',
  '## Something else', 'Q-QR-9: a key that is not in the queue section.', ''].join('\n');
/**
 * Run plan-guard.mjs's ExitPlanMode check on a plan text, as it stands after the talk.
 * @param {string} dir  the hub copy under test.
 * @param {string} planText  the plan.
 * @param {string} projectDir  the launch directory: the repository the plan's Files label names, found from it.
 * @returns {object} the spawnSync result: status 0 to allow, 2 with the reason in stdout.
 */
function exitFor(dir, planText, projectDir, extra = []) {
  const home = tmp('sg-home-');
  mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
  const file = join(home, '.claude', 'plans', 'queue-test.md');
  writeFileSync(file, planText);
  const t = (Date.now() - 1000 * 1000) / 1000;
  utimesSync(file, t, t);
  // `extra`: transcript entries (or a function of the plan file's path that gives them) placed after plan mode was entered and
  // before the talk, such as the plan file's first write and a git log the session read.
  const more = typeof extra === 'function' ? extra(file) : extra;
  return spawnSync('node', [join(dir, 'plan-guard.mjs')], {
    input: JSON.stringify({ session_id: sid('pq'), permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { planFilePath: file },
      transcript_path: transcript([turn(0, OWNER), ...enterPlan(-900), ...more, at(reply(0, PLAN_TALK), later(-500)), owner(later(-400), 'ok')]), cwd: '/' }),
    encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: projectDir },
  });
}
/**
 * A plan that sends agents and passes every check of the plan guard but the ones a case varies.
 * @param {string} dir  the hub copy under test.
 * @param {{rules?: string|null, files?: string|null, answered?: string|null, what?: string|null, roadmap?: string|null, shipped?: string|null}} [o]  the body
 *   of the Rules section (null for none), the body of the Files section (null for none), the body of a Found answered section
 *   (null for none), the bodies of a What is section and a Roadmap section (null for none), and the body of a Shipped check
 *   section (null for none).
 * @returns {string} the plan.
 */
function sendingPlan(dir, { rules = rulesLine(dir), files = null, answered = null, what = null, roadmap = null, shipped = null } = {}) {
  return ['# Sending plan', '',
    '## Goals', '1. The toolbar shows the export button on its left side.', GOALS_BLOCK, 'Served by: steps 1 and 2 serve goal 1.', '',
    '## Asked', OWN_WORDS, '',
    '## Order', 'Order: 1', 'Standing: 2', '',
    ...(rules === null ? [] : ['## Rules', rules, '']),
    '## Steps', '1. **Build.** Make the toolbar change.', `2. **Review.** Follow ${join(dir, 'aim-review.md')} for the move named on the status page.`, '',
    ...(files === null ? [] : ['## Files', files, '']),
    ...(answered === null ? [] : ['## Found answered', answered, '']),
    ...(what === null ? [] : ['## What is', what, '']),
    ...(roadmap === null ? [] : ['## Roadmap', roadmap, '']),
    ...(shipped === null ? [] : ['## Shipped check', shipped, '']),
    '## Looked up', 'Nothing outside the repository bears on this change at all.', '',
    '## Branches', 'One branch only, because the request names a single control to move.', '',
    '## Call chain', 'The toolbar builder places the button; nothing else reads its position.', '',
    '## Whole app', 'It belongs because it was asked for, and nothing else would change.', '',
    '## Leaves open', 'Nothing is left open by this change, as far as can be seen here.', ''].join('\n');
}
// Doctrine lines that say a gate enforces a paragraph whole: `*Enforced whole by:*` and then the gate's file name in backticks.
const wholeGates = (text) => String(text).split('\n').flatMap((l) => {
  const w = /^\s*(?:\d+\.\s+)?\*Enforced whole by:\*\s+(.+)$/.exec(l);
  return w ? [...w[1].matchAll(/`([^`\s]+)`/g)].map((x) => x[1]) : [];
});

// ---- fixtures for a plan's own script (Doctrine §0e rule 13) ----
// A script as a plan carries it: it begins `export const meta`, and each agent is told a plan path and a step number as a string literal.
const SCRIPT = ["export const meta = { name: 'two-steps', description: 'Run the two steps of the plan; each agent is told one step.' }",
  "const one = await agent('/plans/gate-test.md step 1', { label: 'one' })",
  "await agent('/plans/gate-test.md step 2')",
  'return one'].join('\n');
// STEPS_PLAN with a `## Script` section holding `script` in a fenced block.
const scriptPlan = (script = SCRIPT) => STEPS_PLAN.replace('## Commands', `## Script\n\`\`\`js\n${script}\n\`\`\`\n\n## Commands`);
const sha256 = (t) => createHash('sha256').update(t).digest('hex');

// ---- fixtures for the plan gate's name check, the plan fence's opener, the latch and the review's staleness ----
/** The backtick, so a fixture's quoted text can hold a pair of them without a template literal ending. */
const BT = '`';
/**
 * The review plan with an Order of steps 1, 2 and 4, a Standing review step 3 and the After line it is given.
 * @param {string} dir  the hub copy under test.
 * @param {string} [line]  the After line, such as `After: 4 after 1`; none by default.
 * @returns {string} the plan text; `planOrder` reads Order 1 2 4 and Standing 3 from it, and `aimReviewSteps` reads [3].
 */
function afterPlanText(dir, line = '') {
  return reviewPlan(dir).replace('Order: 1 2\nStanding: 3\n', `Order: 1 2 4\nStanding: 3\n${line ? `${line}\n` : ''}`)
    .replace(/(3\. \*\*Review\.\*\*[^\n]*)/, '$1\n4. **Other.** Do another thing.');
}
/**
 * A plan that passes every check of the plan guard, with an Order of steps 1 and 2, a Standing review step 3 and the After line it is given.
 * @param {string} dir  the hub copy under test.
 * @param {string} [line]  the After line; none by default.
 * @returns {string} the plan text.
 */
function afterGatePlan(dir, line = '') {
  return ['# After plan', '',
    '## Goals', '1. The toolbar shows the export button on its left side.', GOALS_BLOCK, 'Served by: steps 1, 2 and 3 serve goal 1.', '',
    '## Asked', OWN_WORDS, '',
    '## Order', 'Order: 1 2', 'Standing: 3', ...(line ? [line] : []), '',
    '## Rules', rulesLine(dir), '',
    '## Steps', '1. **Build.** Make the toolbar change.', '2. **Check.** Read the toolbar change.',
    `3. **Review.** Follow ${join(dir, 'aim-review.md')} for the move named on the status page.`, '',
    '## Looked up', 'Nothing outside the repository bears on this change at all.', '',
    '## Branches', 'One branch only, because the request names a single control to move.', '',
    '## Call chain', 'The toolbar builder places the button; nothing else reads its position.', '',
    '## Whole app', 'It belongs because it was asked for, and nothing else would change.', '',
    '## Leaves open', 'Nothing is left open by this change, as far as can be seen here.', ''].join('\n');
}
/**
 * Put a repository under a world's launch directory whose one PreToolUse hook is the named shim.
 * @param {{cwd: string}} w  a world (`world`).
 * @param {string} shim  the hook's file name under .claude/hooks, such as ident-guard.sh.
 * @param {string|null|false} [refuses]  false to leave the shim unwritten, for plan-guard.sh, which the dispatcher replaces with
 *   the hub's own script; null to write a script that refuses every call; a tool name to write one that refuses that tool's calls only.
 * @param {string} [name]  the repository's folder name under the launch directory.
 * @returns {string} the repository's root. A refusing script prints a fixed sentence naming the shim and exits 2.
 */
function hookRepo(w, shim, refuses = null, name = 'repo') {
  const r = join(w.cwd, name);
  mkdirSync(join(r, '.claude', 'hooks'), { recursive: true });
  spawnSync('git', ['init', '-q', r]);
  writeFileSync(join(r, '.claude', 'settings.json'), JSON.stringify({ hooks: {
    PreToolUse: [{ matcher: '.*', hooks: [{ type: 'command', command: `$CLAUDE_PROJECT_DIR/.claude/hooks/${shim}` }] }],
  } }));
  if (refuses !== false) {
    const say = `echo "planted refusal from ${shim}" >&2\nexit 2\n`;
    const body = refuses === null ? say : `input=$(cat)\ncase "$input" in\n  *'"tool_name":"${refuses}"'*)\n${say};;\nesac\nexit 0\n`;
    writeFileSync(join(r, '.claude', 'hooks', shim), `#!/bin/sh\n${body}`, { mode: 0o755 });
  }
  return r;
}

/** Each case: (m, dir) → true when the guards behaved. `guards` names the plants it must catch. */
// ---- fixtures for step 220: the Rules in the approval's scope, the second press, the release command and the tier line ----
const RULE_OWN = 'No step is sent more than twice.';
// A plan whose six approved sections all exist: the scoped plan with a Rules line and a Rules of this plan section added.
const rulesScopedPlan = (dir) => scopedPlan(dir).replace('## Order', `## Rules\n${rulesLine(dir)}\n\n## Rules of this plan\n- THE METHOD. Every step runs once.\n- ${RULE_OWN}\n\n## Order`);
// The SessionStart entry the harness writes at a resume or after a compaction.
const hookAt = (secs, name) => ({ type: 'attachment', timestamp: later(secs), attachment: { type: 'hook_success', hookName: name, hookEvent: 'SessionStart' } });
// The approval as the tool and the harness leave it in the transcript: the plan mode the planning ran in, the approved call, and the exit entry.
const approvedEntries = (plan) => [turn(0, GO), planOn(-900, plan), ...exitPlan(-700, true), exitEntry(-699, plan, uid())];
const workEntries = (secs, id) => [at(tool(0, id, 'Bash', { command: 'git status' }), later(secs)), at(result(0, id, 'clean'), later(secs + 1))];
// One restart after the approval, then the plan mode the harness began with it: `compaction` (the system boundary and the summary only),
// `hook-compact` (the SessionStart hook entry only) and `resume` (the hook entry, then the message that resumed the session).
const restartOf = (kind, plan, secs = -300) => {
  if (kind === 'compaction') return [at(boundary(0), later(secs)), at(summary(0), later(secs + 1)), planOn(secs + 5, plan)];
  if (kind === 'hook-compact') return [hookAt(secs, 'SessionStart:compact'), planOn(secs + 5, plan)];
  return [hookAt(secs, 'SessionStart:resume'), at(turn(0, 'Go.'), later(secs + 1)), planOn(secs + 5, plan)];
};
// The approval marker as the tool's approval writes it, 698 seconds old.
const approvalMarker = (home, plan, text, extra = {}) => {
  const f = join(home, '.claude', 'APPROVED-PLAN.json');
  writeFileSync(f, JSON.stringify({ plan, hash: createHash('sha256').update(text).digest('hex'), at: new Date(Date.now() - 698 * 1000).toISOString(), ...extra }));
  return f;
};
// A reply of the main thread, with the model that wrote it in the entry's own message.
const modelReply = (secs, text, model) => ({ type: 'assistant', timestamp: later(secs), message: { role: 'assistant', model, content: [{ type: 'text', text }] } });

const CASES = [
  // ---- pending-guard ----
  {
    name: 'an owner message enqueued and not delivered refuses the main thread, verbatim',
    guards: ['enqueue_count', 'verbatim', 'dispatch_pending'],
    run(m) {
      const r = m.pending.decide({ session_id: 't' }, [turn(0, 'start'), enq(10, ASK)]);
      return !!r && r.includes(ASK) && /end this turn/.test(r);
    },
  },
  {
    name: 'a delivered message, as the next prompt or attached mid-turn, refuses nothing',
    run(m) {
      const a = m.pending.decide({ session_id: 't' }, [enq(10, ASK), deq(20), turn(20, ASK)]);
      const b = m.pending.decide({ session_id: 't' }, [enq(10, ASK), deq(20), mid(20, ASK)]);
      return a === null && b === null;
    },
  },
  {
    name: 'a message delivered in other words (a slash command) is released by the queue count',
    guards: ['dequeue_count'],
    run(m) {
      return m.pending.decide({ session_id: 't' }, [enq(10, '/compact keep the plan'), deq(11), turn(11, '<command-name>/compact</command-name>')]) === null;
    },
  },
  {
    name: 'a task notification in the queue is not an owner message',
    guards: ['harness_tag'],
    run(m) {
      return m.pending.decide({ session_id: 't' }, [enq(10, NOTE)]) === null;
    },
  },
  {
    name: 'an agent\'s hand-back in the queue is not an owner message: it holds nothing, and beside an owner message only the owner\'s is printed',
    guards: ['harness_handback', 'harness_bare_handback'],
    run(m) {
      const back = '<agent-message from="a1b2c3">\n[Subagent hand-back] The text below is the final report of a subagent this session delegated to. Step one is built.\n</agent-message>';
      const bare = '[Subagent hand-back] Step two is built and its suite passes.';
      const only = m.pending.decide({ session_id: 't' }, [turn(0, 'start'), enq(10, back), enq(11, bare), enq(12, NOTE)]);
      const bareOnly = m.pending.decide({ session_id: 't' }, [turn(0, 'start'), enq(10, bare)]);
      const both = m.pending.decide({ session_id: 't' }, [turn(0, 'start'), enq(10, back), enq(11, ASK)]);
      const stop = m.pending.decide({ session_id: 't', agent_id: 'a1' }, [enq(10, back)]);
      return only === null && bareOnly === null && !!both && both.includes(ASK) && !both.includes('Step one is built') && stop === null;
    },
  },
  {
    name: 'with a notification and an owner message queued, the one delivered by its words is released',
    guards: ['text_match'],
    run(m) {
      const held = m.pending.decide({ session_id: 't' }, [enq(10, ASK), enq(11, NOTE), deq(12), mid(12, NOTE, 'task', 'task-notification')]);
      const freed = m.pending.decide({ session_id: 't' }, [enq(10, NOTE), enq(11, ASK), deq(12), mid(12, ASK)]);
      return !!held && held.includes(ASK) && freed === null;
    },
  },
  {
    name: 'a removed message is matched by its words, so the other one stays pending',
    guards: ['remove_text'],
    run(m) {
      const r = m.pending.decide({ session_id: 't' }, [enq(10, ASK), enq(11, 'second thought, ignore that'), rem(12, 'second thought, ignore that')]);
      return !!r && r.includes(ASK) && !r.includes('second thought');
    },
  },
  {
    name: 'a subagent runs while an ordinary message waits, and stops for STOP',
    guards: ['subagent_free', 'stop_subagent'],
    run(m) {
      const ord = m.pending.decide({ session_id: 't', agent_id: 'a1' }, [enq(10, ASK)]);
      const stop = m.pending.decide({ session_id: 't', agent_id: 'a1' }, [enq(10, STOPMSG)]);
      return ord === null && !!stop && stop.includes(STOPMSG) && /subagent stops/.test(stop);
    },
  },
  {
    name: 'a queue entry from before this process started is not waited on',
    guards: ['since'],
    run(m) {
      process.env.PENDING_GUARD_DIR = tmp('sg-pg-');
      process.env.PENDING_GUARD_NOW = String(Date.parse(ts(100)));
      m.pending.markStart({ session_id: 'old' });
      delete process.env.PENDING_GUARD_NOW;
      const r = m.pending.decide({ session_id: 'old' }, [enq(10, ASK), turn(150, 'new process')]);
      const fresh = m.pending.decide({ session_id: 'old' }, [enq(10, ASK), enq(160, 'and this one')]);
      delete process.env.PENDING_GUARD_DIR;
      return r === null && !!fresh && fresh.includes('and this one') && !fresh.includes(ASK);
    },
  },
  {
    name: 'hook-dispatch runs pending-guard first and refuses with the message',
    guards: ['dispatch_pending'],
    run(m, dir) {
      const f = transcript([turn(0, 'start'), enq(10, ASK)]);
      const p = { session_id: 't', transcript_path: f, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' }, hook_event_name: 'PreToolUse', cwd: tmp('sg-cwd-') };
      const r = spawnSync('node', [join(dir, 'hook-dispatch.mjs'), 'PreToolUse'], { input: JSON.stringify(p), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: p.cwd } });
      return r.status === 2 && r.stderr.includes(ASK);
    },
  },

  // ---- keep-info-guard ----
  {
    name: 'a commit adding a withdrawal tied to how the source was fetched is refused',
    guards: ['withdraw_re', 'commit_parse'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace('remove such a cast.', 'remove such a cast; Lightroom is named, not read, because Adobe\'s page was fetched in a browser\'s identity and that read is withdrawn.'));
      r.stage();
      const why = m.keep.decide({ tool_name: 'Bash', tool_input: { command: 'git commit -q -m "Notes: tidy"' }, cwd: r.dir }, []);
      return !!why && /takes back information/.test(why) && /lens\.md/.test(why);
    },
  },
  {
    name: 'the six withdrawals written on 2026-10-01 are each refused, from their own text',
    guards: ['withdraw_re', 'fetch_window'],
    run(m) {
      // Before and after, as Jefferson-Photography-Studio e3facbd and 57e9f0d wrote them.
      const pairs = [
        ['partly, 1 not supported at the page it was credited to, and 4 unreachable.\n',
          "partly, 1 not supported at the page it was credited to, and 4 unreachable. One of\nthe 24, Adobe's page on Lightroom's Flat-Field Correction, was confirmed from a\ncopy fetched in a browser's identity, and is withdrawn (2026-10-01): 23 confirmed\nand 1 withdrawn.\n"],
        ["- **Per-channel division is the field's standard.** darktable, Lightroom's Flat-Field Correction and CornerFix (read\n  in source or documentation, confirmed). Adobe's page says shading can carry a\n  colour cast.\n",
          "- **Per-channel division is the field's standard.** darktable and CornerFix (read in source or documentation,\n  confirmed). Lightroom's Flat-Field Correction is named here, not read: the\n  only copy of Adobe's page on it came from a request in a browser's identity\n  after the page had refused this session's own, so that read is withdrawn.\n"],
        ['Per-channel division is how RawTherapee, darktable, Lightroom and CornerFix\nremove such a cast. The field checks the result on neutral things.\n',
          "Per-channel division is how RawTherapee, darktable and CornerFix\nremove such a cast; Lightroom's Flat-Field Correction is named but not read (decision 085 withdraws the only copy). The field checks the result on neutral things.\n"],
        ['**Refused on this topic:** helpx.adobe.com and userguides.dxo.com (403).\n',
          "**Refused on this topic:** helpx.adobe.com (403 to the web fetcher and to a browser-identity curl; its\nflat-field page was then fetched in a browser's identity, a read withdrawn in\ndecision 085), and userguides.dxo.com (403).\n"],
        ['Refused by the site, not blocked by the network. It is the only source likely to measure it.\n',
          "Refused by the site, not blocked by the network. One request to the site's comments feed in a browser's identity, on\n2026-09-30, was answered; nothing here rests on it, and it is withdrawn. It is the only source likely to measure it.\n"],
        ['    GradientCorrection, were not read).\n',
          "    GradientCorrection, were not read). A checking agent read that\n    documentation index in a browser's identity; that reading is withdrawn,\n    and nothing here rests on it.\n"],
      ];
      return pairs.every(([b, a]) => m.keep.findings('x.md', b, a).some((f) => f.kind === 'withdrawal'));
    },
  },
  {
    name: 'a withdrawn measurement that names no fetching passes',
    guards: ['fetch_window'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      // Specific (a name, a page) and withdrawn, but nothing about fetching.
      r.write('lens.md', SOURCE_MD.replace('The figures below were measured on three frames.', "The figures below were measured on three frames. The numbers taken from Kennard's page are withdrawn, because they were read off the wrong frame."));
      r.stage();
      return m.keep.decide({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: r.dir }, []) === null;
    },
  },
  {
    name: 'a commit that drops a domain the file named is refused',
    guards: ['dropped'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace("Adobe's page on helpx.adobe.com says", "Adobe's page says"));
      r.stage();
      const why = m.keep.decide({ tool_name: 'Bash', tool_input: { command: `git -C ${r.dir} commit -m x` }, cwd: '/' }, []);
      return !!why && /no longer names helpx\.adobe\.com/.test(why);
    },
  },
  {
    name: 'an owner message naming the source and asking for removal lifts it; "never remove" does not',
    guards: ['lift', 'negation'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace("Adobe's page on helpx.adobe.com says", "Adobe's page says"));
      r.stage();
      const p = { tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: r.dir };
      const yes = m.keep.decide(p, [{ text: 'Please remove the helpx.adobe.com link from the lens notes.' }]);
      const no = m.keep.decide(p, [{ text: 'Never remove what was read on helpx.adobe.com.' }]);
      const other = m.keep.decide(p, [{ text: 'Remove the duplicate heading in NOTES.' }]);
      return yes === null && !!no && !!other;
    },
  },
  {
    name: 'the owner lift is read from the transcript',
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace("Adobe's page on helpx.adobe.com says", "Adobe's page says"));
      r.stage();
      const f = transcript([turn(0, 'start'), mid(5, 'Take out helpx.adobe.com from lens.md, it is not a source I want.')]);
      return m.keep.decide({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: r.dir, transcript_path: f }) === null;
    },
  },
  {
    name: 'an existing withdrawal re-wrapped is not an addition',
    guards: ['old_sentences'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace("Earlier note: the comments feed on blog.kasson.com was read in a browser's identity; that reading is withdrawn.", "Earlier note: the comments feed on blog.kasson.com was read in a\nbrowser's identity; that reading is withdrawn."));
      r.stage();
      return m.keep.decide({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: r.dir }, []) === null;
    },
  },
  {
    name: 'git commit -am reads the working tree, not only what is staged',
    guards: ['all_mode'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace("Adobe's page on helpx.adobe.com says", "Adobe's page says"));
      const why = m.keep.decide({ tool_name: 'Bash', tool_input: { command: `cd ${r.dir} && git commit -am "x"` }, cwd: '/' }, []);
      return !!why && /helpx\.adobe\.com/.test(why);
    },
  },
  {
    name: 'a command that makes no commit is not read',
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', '');
      r.stage();
      return m.keep.decide({ tool_name: 'Bash', tool_input: { command: 'git log -1 && echo "git commit"' }, cwd: r.dir }, []) === null;
    },
  },

  // ---- compact-recall ----
  {
    name: 'after a compaction, the messages since the previous one come back verbatim',
    guards: ['segment_pick'],
    async run(m) {
      const A = 'first, before any compaction', B = 'second: keep every reading', C = 'third, typed mid-turn';
      const written = transcript([turn(0, A), boundary(10), summary(10), turn(20, B), mid(30, C), boundary(40), summary(40)]);
      const pending = transcript([turn(0, A), boundary(10), summary(10), turn(20, B), mid(30, C)]);
      const none = transcript([turn(0, A), turn(5, B)]);
      const w = await m.recall.messagesSinceCompaction(written);
      const p = await m.recall.messagesSinceCompaction(pending);
      const n = await m.recall.messagesSinceCompaction(none);
      return w.map((x) => x.text).join('|') === `${B}|${C}` && p.map((x) => x.text).join('|') === `${B}|${C}` && n.length === 2;
    },
  },
  {
    name: 'hook-dispatch prints the owner\'s messages first after a compaction',
    guards: ['dispatch_recall'],
    run(m, dir) {
      const B = 'restore 085 before anything else';
      const f = transcript([turn(0, 'start'), boundary(10), summary(10), turn(20, B), tool(25, 'u1', 'Bash', { command: 'ls' }), result(26, 'u1', 'x'), boundary(40), summary(40)]);
      const cwd = tmp('sg-cwd-');
      const r = spawnSync('node', [join(dir, 'hook-dispatch.mjs'), 'SessionStart'], { input: JSON.stringify({ session_id: 't', source: 'compact', transcript_path: f, cwd }), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: cwd } });
      const out = r.stdout ?? '';
      return r.status === 0 && out.indexOf(B) >= 0 && out.indexOf(B) < out.indexOf('AFTER COMPACTION');
    },
  },

  {
    name: 'after a compaction the newest ten of the messages since the previous one come back, oldest first, then the count of the rest and the path of a file holding every one of them, answered or not, whole and in order, named for the compaction whichever side of its boundary the hook ran',
    guards: ['recall_after_reply', 'recall_prefilter', 'recall_cap', 'recall_newest', 'recall_rest', 'recall_file_write', 'recall_file_all', 'recall_file_answered', 'recall_file_name', 'recall_number', 'recall_for', 'segment_pick'],
    async run(m) {
      const answered = 'typed-before-the-reply, answered by it';
      const typed = [...'abcdefghijkl'].map((c) => `typed-${c}-after-the-reply`);
      const after = typed.map((t, i) => (i % 2 ? mid(20 + i, t) : turn(20 + i, t)));
      const written = namedTranscript([turn(0, answered), reply(5, 'Done, anything else?'), ...after, boundary(40), summary(40)]);
      const pending = namedTranscript([turn(0, answered), reply(5, 'Done, anything else?'), ...after]);
      const second = namedTranscript([turn(0, answered), boundary(10), summary(10), turn(20, 'typed-in-the-second-stretch'), boundary(40), summary(40)]);
      // Every message since the previous compaction comes back, which plan-scope-check.mjs prints to its judge; each is tagged.
      const w = await m.recall.stretchSinceCompaction(written);
      const p = await m.recall.stretchSinceCompaction(pending);
      const s2 = await m.recall.stretchSinceCompaction(second);
      const open = (x) => x.filter((y) => y.afterReply).map((y) => y.text).join('|');
      const where = tmp('sg-recall-');
      const file = m.recall.saveRecall(written, w.msgs, { dir: where, n: w.n });
      const block = m.recall.recallBlock(w.msgs, file);
      const filed = file && existsSync(file) ? readFileSync(file, 'utf8') : '';
      const again = m.recall.saveRecall(pending, p.msgs, { dir: where, n: p.n });
      const file2 = m.recall.saveRecall(second, s2.msgs, { dir: where, n: s2.n });
      const order = typed.slice(2).map((t) => block.indexOf(t));
      const filedAt = [answered, ...typed].map((t) => filed.indexOf(t));
      return w.msgs.length === 13 && p.msgs.length === 13 && w.msgs[0].text === answered && !w.msgs[0].afterReply
        && open(w.msgs) === typed.join('|') && open(p.msgs) === typed.join('|')
        && w.n === 1 && p.n === 1 && s2.n === 2 && s2.msgs.length === 1
        && !block.includes(answered) && !block.includes(typed[0]) && !block.includes(typed[1])
        && order.every((i, k) => i >= 0 && (k === 0 || i > order[k - 1]))
        && block.includes('--- 4 of 13') && block.includes('--- 13 of 13') && !block.includes('--- 3 of 13')
        && /Not printed here: 3 older/.test(block) && !!file && block.includes(file)
        && basename(file) === 'compaction-1.txt' && again === file && !!file2 && basename(file2) === 'compaction-2.txt'
        && filedAt.every((i, k) => i >= 0 && (k === 0 || i > filedAt[k - 1])) && filed.includes('--- 1 of 13') && filed.includes('--- 13 of 13')
        && (await m.recall.recallFor(written, where)) === block;
    },
  },
  {
    name: 'a reply is an assistant entry of the main thread that carries text: a tool call alone, blank text and a subagent\'s entry are not one, and a real reply leaves only what follows it',
    guards: ['recall_after_reply', 'recall_prefilter', 'recall_reply_text', 'recall_reply_sidechain'],
    async run(m) {
      const A = 'first, typed before any reply', B = 'second, after a tool call alone', C = 'third, after blank text', D = 'fourth, after a subagent reports', E = 'fifth, after a real reply';
      const blank = { type: 'assistant', timestamp: ts(12), message: { role: 'assistant', content: [{ type: 'text', text: '   ' }] } };
      const sub = { ...reply(18, 'A subagent reports in.'), isSidechain: true };
      // The tool call's input carries a key called text, so the line passes the reader's cheap filter and only the entry's own shape rules it out.
      const none = namedTranscript([turn(0, A), tool(5, 'x1', 'Bash', { command: 'ls', text: 'x' }), result(6, 'x1', 'out'), turn(10, B), blank, turn(14, C), sub, turn(20, D), boundary(30), summary(30)]);
      const one = namedTranscript([turn(0, A), turn(10, B), reply(15, 'Answered.'), turn(20, E)]);
      const open = (x) => x.filter((y) => y.afterReply).map((y) => y.text).join('|');
      const got = await m.recall.messagesSinceCompaction(none);
      const left = await m.recall.messagesSinceCompaction(one);
      return open(got) === [A, B, C, D].join('|') && left.map((x) => x.text).join('|') === [A, B, E].join('|') && open(left) === E;
    },
  },
  {
    name: 'hook-dispatch prints at most ten of the messages since the previous compaction, with the count of the rest and the file that holds them all, before the tool census; with no scratchpad the file is the older default and nothing is held for it',
    guards: ['dispatch_recall', 'recall_for'],
    run(m, dir) {
      const typed = [...'abcdefghijkl'].map((c) => `typed-${c}-after-the-reply`);
      const f = namedTranscript([turn(0, 'start'), reply(5, 'Done.'), ...typed.map((t, i) => turn(10 + i, t)), tool(30, 'u1', 'Bash', { command: 'ls' }), result(31, 'u1', 'x'), boundary(40), summary(40)]);
      const cwd = tmp('sg-cwd-');
      const s = sid('dr');
      const r = spawnSync('node', [join(dir, 'hook-dispatch.mjs'), 'SessionStart'], { input: JSON.stringify({ session_id: s, source: 'compact', transcript_path: f, cwd }), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: cwd } });
      const out = r.stdout ?? '';
      const file = join(process.env.COMPACT_RECALL_DIR, `${basename(f, '.jsonl')}.txt`);
      return r.status === 0 && out.includes('Not printed here: 3 older') && out.includes(file) && existsSync(file) && !existsSync(join(process.env.RECALL_DUE_DIR, `${s}.json`))
        && out.indexOf(typed[11]) >= 0 && out.indexOf(typed[11]) < out.indexOf('AFTER COMPACTION') && !out.includes(typed[1]) && out.includes(typed[2]);
    },
  },

  // ---- the owner's messages are read whole after a compaction, and the compaction is said (LESSONS §416) ----
  {
    name: 'a compaction start with a scratchpad files every message of the stretch under it, named for the compaction, and records the compaction: the main thread is then refused everything but a read, the status and TaskStop, without a latch, until Read results covering the whole file have returned after the start',
    guards: ['recall_scratchpad', 'recall_due_wired', 'recall_due_line', 'recall_gate_wired', 'recall_gate_no_latch', 'compacted_marker_wired'],
    run(m, dir) {
      const temp = tmp('sg-tmp-');
      const env = { TMPDIR: temp };
      const s = sid('rg');
      const pad = join(temp, 'claude-0', '-home-user', s, 'scratchpad');
      mkdirSync(pad, { recursive: true });
      const typed = [...'abcdefghijkl'].map((c) => `typed-${c}-before-the-compaction`);
      // The owner's newest message ends with a go-word, so no correction stands and the only hold is the one under test.
      const w = world(dir, [turn(0, 'start'), ...typed.map((t, i) => turn(1 + i, t)), turn(13, GO), boundary(40), summary(40)]);
      const send = () => w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } }, env);
      const start = w.call('SessionStart', { session_id: s, source: 'compact' }, env);
      const file = join(pad, 'recall', 'compaction-1.txt');
      const filed = existsSync(file) ? readFileSync(file, 'utf8') : '';
      const total = filed.split('\n').length - 1;
      const marker = join(process.env.RECALL_DUE_DIR, `${s}.json`);
      const due = existsSync(marker);
      const stamped = m.report.readCompacted(s);
      // The doctrine's own marker is cleared: this case is about the owner's messages.
      rmSync(join(process.env.DOCTRINE_DUE_DIR, `${s}.json`), { force: true });
      const held = send();
      const notLatched = !latched(s);
      const reading = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: file } }, env);
      const stamp = w.call('PreToolUse', { session_id: s, tool_name: 'Bash', tool_input: { command: `node "${join(dir, 'report.mjs')}" "Status 10:00 — done"` } }, env);
      appendFileSync(w.tr, jsonl(fileReads(file, total, [[1, 10]], (k) => later(2 + k))));
      const partial = send();
      appendFileSync(w.tr, jsonl(fileReads(file, total, [[11, total - 10]], (k) => later(4 + k))));
      const after = send();
      return start.status === 0 && due && total === 28 && ['start', ...typed, GO].every((t) => filed.includes(t))
        && start.stdout.includes('Not printed here: 4 older') && start.stdout.includes(file) && /OWNER'S MESSAGES DUE/.test(start.stdout)
        && !!stamped && Math.abs(stamped.at - Date.now()) < 120000 && !stamped.told
        && held.status === 2 && /RECALL GATE/.test(held.stderr) && held.stderr.includes(file) && notLatched
        && reading.status === 0 && stamp.status === 0
        && partial.status === 2 && /RECALL GATE/.test(partial.stderr)
        && after.status === 0 && !existsSync(marker);
    },
  },
  {
    name: 'the recall gate holds the main thread to reads after a compaction until Read results covering every line of the filed messages have returned after the marker: part of the file, another file, an earlier read and an error each leave it held; no marker, no file yet, a subagent and TaskStop are not held, and the read removes the marker',
    guards: ['recall_gate_marker', 'recall_gate_missing', 'recall_gate_whole', 'recall_gate_after', 'recall_gate_clears', 'recall_gate_agent', 'recall_gate_taskstop', 'recall_gate_read_exempt'],
    run(m) {
      const s = sid('ru');
      const where = tmp('sg-recall-');
      const file = join(where, 'compaction-1.txt');
      writeFileSync(file, '--- 1 of 2 ---\none\n--- 2 of 2 ---\ntwo\n');
      const other = join(where, 'other.txt');
      const marker = join(process.env.RECALL_DUE_DIR, `${s}.json`);
      const call = (extra = {}, entries = [], opts = {}) => m.dispatch.recallGate({ session_id: s, tool_name: 'Agent', tool_input: {}, ...extra }, entries, { file, classify: (q) => q.tool_name === 'Read', ...opts });
      const rd = (id, secs, name, totals = { numLines: 4, totalLines: 4 }, isError = false) => [at(tool(0, id, 'Read', { file_path: name }), later(secs)),
        { ...at(result(0, id, 'x', isError), later(secs + 1)), toolUseResult: { type: 'text', file: { filePath: name, content: 'x', startLine: 1, ...totals } } }];
      const noMarker = call();
      const line = m.dispatch.markRecallDue({ session_id: s }, file);
      const held = call();
      const fileGone = call({}, [], { file: join(where, 'absent.txt') });
      const noFile = call({}, [], { file: null });
      const readCall = call({ tool_name: 'Read', tool_input: { file_path: file } });
      const agent = call({ agent_id: 'a1' });
      const stop = call({ tool_name: 'TaskStop' });
      const partial = call({}, rd('q1', 2, file, { numLines: 2, totalLines: 4 }));
      const elsewhere = call({}, rd('q2', 2, other));
      const early = call({}, rd('q3', -60, file));
      const errored = call({}, rd('q4', 2, file, undefined, true));
      const stillDue = existsSync(marker);
      const cleared = call({}, rd('q5', 2, file));
      const removed = !existsSync(marker);
      // A file too long for one Read is read in parts: parts that together cover every line clear the gate.
      m.dispatch.markRecallDue({ session_id: s }, file);
      const parts = call({}, [...rd('q6', 2, file, { numLines: 2, totalLines: 4 }), ...rd('q7', 4, file, { startLine: 3, numLines: 2, totalLines: 4 })]);
      const partsRemoved = !existsSync(marker);
      const held2 = (r) => typeof r === 'string' && /^RECALL GATE/.test(r) && r.includes(file) && /does not latch/.test(r);
      return noMarker === null && /^OWNER'S MESSAGES DUE/.test(line) && line.includes(file) && line.includes('Read result') && !line.includes('\n')
        && held2(held) && fileGone === null && noFile === null && readCall === null && agent === null && stop === null
        && held2(partial) && held2(elsewhere) && held2(early) && held2(errored) && stillDue
        && cleared === null && removed && parts === null && partsRemoved;
    },
  },
  {
    name: 'the compaction is said: the marker holds its time, the first status after it prints the time in California time once, the status page carries it under its updated line until a later compaction replaces it, and a session with no marker prints and carries nothing',
    guards: ['compacted_marker_time', 'compacted_words_time', 'compacted_status_print', 'compacted_status_once', 'compacted_page_line'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const temp = tmp('sg-tmp-');
      const s = sid('cn');
      const pad = join(temp, 'claude-0', '-home-user', s, 'scratchpad');
      mkdirSync(join(pad, 'status'), { recursive: true });
      const status = () => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the compaction test'], { encoding: 'utf8', env: { ...process.env, HOME: home, TMPDIR: temp, CLAUDE_CODE_SESSION_ID: s } }).stdout ?? '';
      const page = () => { try { return readFileSync(join(pad, 'status', 'fix-run.html'), 'utf8'); } catch { return ''; } };
      const first = status();
      const quiet = !first.includes('Compacted at') && !page().includes('Compacted at') && m.report.readCompacted(s) === null;
      const when = Date.parse('2026-10-20T21:07:00Z');
      const wrote = m.report.markCompacted(s, when);
      const got = m.report.readCompacted(s);
      const words = 'Compacted at 14:07 California time on 2026-10-20.';
      const said = status();
      const again = status();
      const carried = page().includes(`</p>\n<p class="asof">${words}</p>\n<p class="next">`) && page().indexOf('updated ') < page().indexOf(words);
      m.report.markCompacted(s, Date.parse('2026-10-21T01:30:00Z'));
      const next = status();
      return quiet && wrote && !!got && got.at === when && !got.printed && !got.told && m.report.compactedWords(got) === words
        && said.includes(words) && !again.includes('Compacted at') && carried
        && next.includes('Compacted at 18:30 California time on 2026-10-20.') && page().includes('Compacted at 18:30 California time on 2026-10-20.');
    },
  },
  {
    name: 'the first reply after a compaction must open with a line saying so and at what time in California time, read from the marker: a first line without the word, without the time, or with both on a later line is refused once with the words to use; a line that carries both, alone or sharing a stop declaration, passes and the next reply is not held; a follow-up that carries it discharges the marker, and a session with no marker is not held',
    guards: ['compact_stop_check', 'compact_stop_time', 'compact_stop_word', 'compact_stop_first_line', 'compact_stop_told', 'compact_stop_followup'],
    run(m, dir) {
      const when = Date.parse('2026-10-20T21:07:00Z');
      const say = (s, text, extra = {}) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: s, transcript_path: transcript([turn(0, GO), reply(5, text)]), ...extra }), encoding: 'utf8' });
      const refusedFor = (r) => r.status === 2 && /LESSONS §416/.test(r.stderr) && r.stderr.includes('Compacted at 14:07 California time on 2026-10-20.');
      const PLAIN = 'The page lists the open steps.';
      const s = sid('cs');
      const unmarked = say(s, PLAIN);
      m.report.markCompacted(s, when);
      const bare = say(s, PLAIN);
      const lateLine = say(s, `${PLAIN}\n\nCompacted at 14:07 California time.`);
      const noTime = say(s, 'Compacted earlier today.');
      const noWord = say(s, 'At 14:07 the work went on.');
      const stillOpen = m.report.readCompacted(s)?.told === false;
      const ok = say(s, `Compacted at 14:07 California time. ${PLAIN}`);
      const toldNow = m.report.readCompacted(s)?.told === true;
      const next = say(s, PLAIN);
      const s2 = sid('cs');
      m.report.markCompacted(s2, when);
      const declared = say(s2, 'Stopping here: open for you is the choice below. Compacted at 14:07 California time.');
      const s3 = sid('cs');
      m.report.markCompacted(s3, when);
      const followed = say(s3, 'Compacted at 14:07 California time.', { stop_hook_active: true });
      const s4 = sid('cs');
      m.report.markCompacted(s4, when);
      const ignored = say(s4, PLAIN, { stop_hook_active: true });
      return unmarked.status === 0 && refusedFor(bare) && refusedFor(lateLine) && refusedFor(noTime) && refusedFor(noWord) && stillOpen
        && ok.status === 0 && toldNow && next.status === 0
        && declared.status === 0 && m.report.readCompacted(s2)?.told === true
        && followed.status === 0 && m.report.readCompacted(s3)?.told === true
        && ignored.status === 0 && m.report.readCompacted(s4)?.told === false;
    },
  },

  // ---- the plan-approval deadlock ----
  {
    name: 'a rejected ExitPlanMode is not recorded as a failed call, and does not hold the next one',
    guards: ['plan_tool_record', 'plan_tool_catchup', 'plan_tool_repeat'],
    run(m) {
      process.env.REPLY_LEDGER_DIR = tmp('sg-ledger-');
      // The ledger's clock starts before the transcript's entries, or catch-up skips them.
      process.env.REPLY_GUARD_NOW = String(Date.parse(ts(-5)));
      const exit = { session_id: 'd', tool_name: 'ExitPlanMode', tool_input: { plan: 'x' } };
      m.reply.record({ ...exit, tool_use_id: 'e1', error: 'The plan was rejected: answer the question about 069 first.' }, 'PostToolUseFailure');
      const recorded = m.reply.load({ session_id: 'd' }).some((e) => e.kind === 'fail');
      const f = transcript([tool(0, 'e2', 'ExitPlanMode', { plan: 'x' }), result(1, 'e2', 'The plan was rejected, keep planning.', true)]);
      const again = m.reply.decide({ ...exit, transcript_path: f });
      const caught = m.reply.load({ session_id: 'd' }).some((e) => e.kind === 'fail');
      // A ledger written before the fix still holds a failed ExitPlanMode.
      appendFileSync(join(process.env.REPLY_LEDGER_DIR, 'd.jsonl'), JSON.stringify({ kind: 'fail', agent: 'main', tool: 'ExitPlanMode', h: m.reply.callHash('ExitPlanMode', exit.tool_input), id: 'abcd1234', text: 'rejected', t: 0 }) + '\n');
      const legacy = m.reply.decide({ ...exit });
      delete process.env.REPLY_LEDGER_DIR;
      delete process.env.REPLY_GUARD_NOW;
      return !recorded && again === null && !caught && legacy === null;
    },
  },
  {
    name: 'plan mode allows exactly a reply-guard reading, and nothing riding with it',
    guards: ['plan_guard_read'],
    run(m, dir) {
      const pg = (command) => spawnSync('node', [join(dir, 'plan-guard.mjs')], { input: JSON.stringify({ session_id: 't', permission_mode: 'plan', tool_name: 'Bash', tool_input: { command }, cwd: '/' }), encoding: 'utf8' }).status;
      const self = join(dir, 'reply-guard.mjs');
      const ok = pg(`node ${self} --read call:abcd1234 --said "The plan was rejected" --route "answered the question first, then proposed again"`);
      const chained = pg(`node ${self} --read call:abcd1234 --said "The plan was rejected" --route "answered it" && touch /tmp/x`);
      const elsewhere = pg(`node /tmp/reply-guard.mjs --read call:abcd1234 --said "The plan was rejected" --route "answered it first"`);
      return ok === 0 && chained === 2 && elsewhere === 2;
    },
  },
  {
    name: 'in plan mode an agent may stop its own task, through plan-guard and the whole dispatch; the main thread\'s TaskStop is still refused by plan-guard',
    guards: ['plan_agent_taskstop'],
    run(m, dir) {
      const stop = { permission_mode: 'plan', tool_name: 'TaskStop', tool_input: { task_id: 'bxyz789' } };
      const pg = (extra) => spawnSync('node', [join(dir, 'plan-guard.mjs')], { input: JSON.stringify({ session_id: 't', cwd: '/', ...stop, ...extra }), encoding: 'utf8' }).status;
      // The whole chain, with a repo wired the way each session repo is: its
      // plan-guard shim, which hook-dispatch runs as this copy's plan-guard.
      const w = world(dir);
      const r = join(w.cwd, 'repo');
      mkdirSync(join(r, '.claude'), { recursive: true });
      spawnSync('git', ['init', '-q', r]);
      writeFileSync(join(r, '.claude', 'settings.json'), JSON.stringify({ hooks: {
        PreToolUse: [{ matcher: '', hooks: [{ type: 'command', command: '$CLAUDE_PROJECT_DIR/.claude/hooks/plan-guard.sh' }] }],
      } }));
      const s = sid('ps');
      const chain = w.call('PreToolUse', { session_id: s, agent_id: 'a1', ...stop });
      // A scratchpad write passes the plan fence, so only plan-guard refuses it:
      // proof plan-guard ran in the chain the TaskStop passed.
      const pad = join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad', 'note.txt');
      const write = w.call('PreToolUse', { session_id: s, agent_id: 'a1', permission_mode: 'plan', tool_name: 'Write', tool_input: { file_path: pad, content: 'x' } });
      return pg({ agent_id: 'a1' }) === 0 && pg({}) === 2 && chain.status === 0
        && write.status === 2 && /PLAN MODE/.test(write.stderr);
    },
  },
  {
    name: 'a plan with no "## Asked", or one copying the owner\'s words, is refused; one in its own words passes',
    guards: ['plan_guard_asked', 'asked_copy', 'copies_owner'],
    run(m, dir) {
      const f = transcript([turn(0, OWNER)]);
      const exit = (asked) => spawnSync('node', [join(dir, 'plan-guard.mjs')], { input: JSON.stringify({ session_id: 't', permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { plan: PLAN(asked) }, transcript_path: f, cwd: '/' }), encoding: 'utf8' });
      const none = exit(null), quoted = exit(QUOTED), own = exit(OWN_WORDS);
      return none.status === 2 && none.stdout.includes('no \\"## Asked\\" section')
        && quoted.status === 2 && quoted.stdout.includes('copies the owner') && !quoted.stdout.includes('export button')
        && own.status === 0;
    },
  },
  {
    name: 'plan-scope --record refuses a verdict or finding copying the owner\'s words, and records one in the watcher\'s own',
    guards: ['scope_record_copy', 'copies_owner'],
    run(m, dir) {
      const home = tmp('sg-home-');
      mkdirSync(join(home, '.claude', 'projects', 'p'), { recursive: true });
      writeFileSync(join(home, '.claude', 'projects', 'p', 't.jsonl'), JSON.stringify(turn(0, OWNER)) + '\n');
      const plan = join(tmp('sg-plan-'), 'plan.md');
      writeFileSync(plan, PLAN(OWN_WORDS));
      const r = repo({ 'a.txt': 'x\n' });
      mkdirSync(join(r.dir, '.claude'));
      writeFileSync(join(r.dir, '.claude', 'PLAN'), plan + '\n');
      const rec = (verdict, finding) => spawnSync('node', [join(dir, 'plan-scope-check.mjs'), `--repo=${r.dir}`, '--record', `--verdict=${verdict}`],
        { input: finding, encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: 't' } });
      const written = () => existsSync(join(r.dir, '.plan-scope'));
      const inVerdict = rec(`IN-SCOPE: ${QUOTED}`, 'The diff moves one control.');
      const v1 = written();
      const inFinding = rec('IN-SCOPE: one control moved', QUOTED);
      const v2 = written();
      const ownWords = rec('IN-SCOPE: one control moved', 'The diff relocates the export control and changes nothing else.');
      return inVerdict.status === 1 && !v1 && !inVerdict.stderr.includes('export button')
        && inFinding.status === 1 && !v2
        && ownWords.status === 0 && written() && !readFileSync(join(r.dir, '.plan-scope'), 'utf8').includes('export button');
    },
  },
  {
    name: 'a reply asking the owner for the next work, or offering to drop checks to save time, is refused; honest reports pass',
    guards: ['next_work', 'drop_checks'],
    run(m, dir) {
      const say = (text) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ transcript_path: transcript([{ type: 'assistant', timestamp: ts(0), message: { role: 'assistant', content: [{ type: 'text', text }] } }]) }), encoding: 'utf8' }).status;
      const asksNext = say('Send the next thing you want built and I will plan it.');
      const drops = say('I stop the workflow and drop the adversarial-check stage for every group. That roughly halves the remaining time.');
      const top = say('The roadmap\'s top item is 085, and it is being built now.');
      const found = say('The check stage found two defects in the denoise group, and both are fixed.');
      return asksNext === 2 && drops === 2 && top === 0 && found === 0;
    },
  },
  {
    name: 'a stop is refused while a task this session started is still running, declared or not, and allowed once it ends',
    guards: ['running_work', 'running_owed'],
    run(m, dir) {
      const say = (entries) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ transcript_path: transcript(entries) }), encoding: 'utf8' }).status;
      const reply = { type: 'assistant', timestamp: ts(9), message: { role: 'assistant', content: [{ type: 'text', text: 'Stopping here: open for you is nothing new.' }] } };
      const launch = [tool(0, 'w0', 'Workflow', {}), result(1, 'w0', 'Workflow launched in background. Task ID: wabc123')];
      const bash = [tool(2, 'b0', 'Bash', {}), result(3, 'b0', 'Command running in background with ID: bxyz789. Output is being written to: /tmp/x')];
      const done = (id, s) => turn(s, `<task-notification><task-id>${id}</task-id><tool-use-id>t</tool-use-id><output-file>/tmp/o</output-file><status>completed</status></task-notification>`);
      const stopped = [tool(6, 's0', 'TaskStop', {}), result(7, 's0', 'Successfully stopped task: bxyz789')];
      // Launch words that are NOT a launch: in a command's input, and mid-way
      // through a printed file. Neither may hold a stop.
      const notLaunches = [tool(5, 'c0', 'Bash', { command: "echo 'Workflow launched in background. Task ID: wfake01'" }), result(5, 'c0', 'log line 1\nWorkflow launched in background. Task ID: wfake02\n')];
      const runningBoth = say([...launch, ...bash, reply]);
      const oneLeft = say([...launch, ...bash, done('wabc123', 4), reply]);
      const allEnded = say([...launch, ...bash, done('wabc123', 4), ...stopped, reply]);
      const onlyWords = say([...notLaunches, reply]);
      // A message from the owner still in the queue: the stop is what delivers
      // it, so it is allowed even with work running.
      const queued = say([...launch, enq(8, 'Where is the release?'), reply]);
      return runningBoth === 2 && oneLeft === 2 && allEnded === 0 && onlyWords === 0 && queued === 0;
    },
  },
  {
    name: 'a stop passes while an agent this session launched is still running, because the completion notification brings the session back; a background task running beside it still holds the stop',
    guards: ['agents_hold_stop'],
    run(m, dir) {
      // The harness's layout: <dir>/<sid>.jsonl, and its agents in <dir>/<sid>/subagents/.
      const proj = tmp('sg-proj-');
      const s = sid('sa');
      const main = join(proj, `${s}.jsonl`);
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      const said = { type: 'assistant', timestamp: ts(9), message: { role: 'assistant', content: [{ type: 'text', text: 'Stopping here: open for you is nothing new.' }] } };
      writeFileSync(main, jsonl([turn(0, 'start'), said]));
      writeFileSync(join(subs, 'agent-arun01.jsonl'), jsonl([at(tool(0, 'n1', 'Bash', { command: 'node long.mjs' }), later(-10)), at(result(0, 'n1', 'step one of three'), later(-9))]));
      const say = () => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: s, transcript_path: main }), encoding: 'utf8' }).status;
      const agentOnly = say();
      writeFileSync(main, jsonl([turn(0, 'start'), tool(1, 'b0', 'Bash', {}), result(2, 'b0', 'Command running in background with ID: bxyz789. Output is being written to: /tmp/x'), said]));
      const taskToo = say();
      return agentOnly === 0 && taskToo === 2;
    },
  },
  {
    name: 'every refusal says the follow-up is the corrected sentences only; a follow-up that repeats lines of the refused reply is refused once, never again that turn, and corrected sentences, a follow-up with no text, and a repeat from an earlier turn pass',
    guards: ['stop_follow_up', 'stop_repeat', 'stop_repeat_once', 'stop_repeat_record', 'stop_repeat_turn', 'stop_repeat_min'],
    run(m, dir) {
      const FIRST = 'The suite ran and the push gate caught every plant that was tried today.';
      const SECOND = 'The release is waiting on the deploy for that commit, and that is all.';
      const REFUSED = `${FIRST}\n${SECOND}`;
      const FEEDBACK = { type: 'user', isMeta: true, timestamp: ts(6), message: { role: 'user', content: 'Stop hook feedback:\nSTOP REFUSED' } };
      const run1 = (entries) => {
        const tr = transcript(entries);
        const s = sid('sr');
        const stop = (active) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: s, transcript_path: tr, stop_hook_active: active }), encoding: 'utf8' });
        return { tr, stop };
      };
      // 1. The refusal itself carries the follow-up rule.
      const a = run1([turn(0, 'start'), reply(5, REFUSED)]);
      const refused = a.stop(false);
      // 2. A follow-up that sends the reply again is refused, once.
      appendFileSync(a.tr, jsonl([FEEDBACK, reply(8, `${REFUSED}\nOne corrected sentence, now that the deploy has been read.`)]));
      const repeat = a.stop(true);
      const again = a.stop(true);
      // 3. A follow-up of the corrected sentences only passes.
      const b = run1([turn(0, 'start'), reply(5, REFUSED)]);
      b.stop(false);
      appendFileSync(b.tr, jsonl([FEEDBACK, reply(8, 'The deploy for that commit finished green; the earlier line about waiting was wrong.')]));
      const corrected = b.stop(true);
      // 4. A follow-up of tool calls only has no text to repeat.
      const c = run1([turn(0, 'start'), reply(5, REFUSED)]);
      c.stop(false);
      appendFileSync(c.tr, jsonl([FEEDBACK, tool(9, 'g1', 'Bash', { command: 'git log' }), result(10, 'g1', 'b279a08 Stop gate')]));
      const noText = c.stop(true);
      // 5. Short lines recur in any two replies and are not repeats.
      const d = run1([turn(0, 'start'), reply(5, `${REFUSED}\nDone.\nNothing else changed.`)]);
      d.stop(false);
      appendFileSync(d.tr, jsonl([FEEDBACK, reply(8, 'Done.\nNothing else changed.\nThe deploy finished.')]));
      const shortOnes = d.stop(true);
      // 6. A refusal from an earlier turn: the owner has written since, so the record is stale.
      const e = run1([turn(0, 'start'), reply(5, REFUSED)]);
      e.stop(false);
      appendFileSync(e.tr, jsonl([owner(later(30), 'Another message, typed after the refusal.'), reply(40, REFUSED)]));
      const stale = e.stop(true);
      return refused.status === 2 && /the corrected sentences only/.test(refused.stderr) && /Do not send the reply again/.test(refused.stderr)
        && repeat.status === 2 && /sends the refused reply again/.test(repeat.stderr) && /the corrected sentences only|corrected sentences only/.test(repeat.stderr)
        && again.status === 0
        && corrected.status === 0 && noText.status === 0 && shortOnes.status === 0 && stale.status === 0;
    },
  },

  // ---- the manager fence and the dispatch gate (hook-dispatch.mjs) ----
  {
    name: 'the manager fence lets the main thread read the record, send agents, stop a task, publish and write the status page, write its plan and enter and exit plan mode; nothing else, an Artifact quickstart included',
    guards: ['manager_fence', 'fence_artifact', 'fence_plan_file', 'fence_enter_plan', 'fence_status_write', 'fence_quickstart'],
    run(m) {
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const s = sid('mf');
      const reads = (q) => q.tool_name === 'Read' || (q.tool_name === 'Bash' && /^cat /.test(q.tool_input.command));
      const f = (tool_name, tool_input = {}, extra = {}) => m.dispatch.managerFence({ session_id: s, tool_name, tool_input, ...extra }, { plan, classify: reads });
      const page = `/tmp/claude-0/-home-user/${s}/scratchpad/status/fix-run.html`;
      const otherPage = `/tmp/claude-0/-home-user/${s}/scratchpad/status.html`;
      const fenced = (x) => /^MANAGER FENCE/.test(x ?? '');
      return f('Read', { file_path: plan.path }) === null && f('Bash', { command: `cat ${plan.path}` }) === null
        && f('TaskStop', { task_id: 'x' }) === null && f('ExitPlanMode') === null && f('EnterPlanMode') === null
        && f('Agent', { prompt: '/plans/gate-test.md step 1' }) === null
        && f('Artifact', { file_path: page }) === null && f('Artifact', { action: 'read', url: 'u' }) === null
        && f('Artifact', { action: 'list' }) === null && f('Artifact', { action: 'open', url: 'u' }) === null
        && fenced(f('Artifact', { action: 'quickstart', intent: 'other' }))
        && fenced(f('Artifact', { file_path: otherPage })) && fenced(f('Artifact', { file_path: page, files: { 'a.js': 'x' } }))
        && fenced(f('Artifact', { action: 'delete', url: 'u' })) && fenced(f('Artifact', { file_path: '/home/user/noahjefferson/public/index.html' }))
        && fenced(f('Artifact', { file_path: `/tmp/claude-0/-home-user/other/scratchpad/status/fix-run.html` }))
        && f('Write', { file_path: page }) === null && f('Edit', { file_path: page }) === null
        && fenced(f('Write', { file_path: otherPage })) && fenced(f('Write', { file_path: `/tmp/claude-0/-home-user/other/scratchpad/status/fix-run.html` }))
        && f('Write', { file_path: join(homedir(), '.claude', 'plans', 'next.md') }) === null
        && fenced(f('Write', { file_path: '/home/user/noahjefferson/hook-dispatch.mjs' }))
        && fenced(f('Edit', { file_path: join(homedir(), '.claude', 'plans', 'sub', 'x.md') }))
        && fenced(f('Bash', { command: 'touch x' })) && fenced(f('mcp__github__push_files', { branch: 'main' }))
        && f('Write', { file_path: '/anywhere' }, { agent_id: 'a1' }) === null;
    },
  },
  {
    name: 'the dispatch gate passes only the approved plan\'s path and a step it has, sent to a built-in agent type; a workflow and a custom type are refused',
    guards: ['dispatch_prompt', 'dispatch_step', 'dispatch_workflow', 'dispatch_no_plan', 'dispatch_custom'],
    run(m) {
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const f = (tool_name, tool_input, p = plan) => m.dispatch.managerFence({ session_id: 'dg', tool_name, tool_input }, { plan: p, classify: () => false });
      const gate = (x) => /^DISPATCH GATE/.test(x ?? '');
      return f('Agent', { prompt: '/plans/gate-test.md step 2' }) === null && f('Task', { prompt: '  /plans/gate-test.md 1 ' }) === null
        && f('Agent', { prompt: '/plans/gate-test.md step 2', subagent_type: 'general-purpose' }) === null
        && f('Agent', { prompt: '/plans/gate-test.md step 2', subagent_type: 'Explore' }) === null
        && /custom agent type/.test(f('Agent', { prompt: '/plans/gate-test.md step 2', subagent_type: 'house-builder' }) ?? '')
        && /custom agent type/.test(f('Task', { prompt: '/plans/gate-test.md step 1', subagent_type: 'statusline-setup' }) ?? '')
        && f('SendMessage', { to: 'a1', message: '/plans/gate-test.md step 1' }) === null
        && gate(f('Agent', { prompt: '/plans/gate-test.md step 2. Also tidy the README.' }))
        && gate(f('SendMessage', { to: 'a1', message: 'Go back and fix the test.' }))
        && gate(f('Agent', { prompt: '/plans/other.md step 2' }))
        && /no step 9/.test(f('Agent', { prompt: '/plans/gate-test.md step 9' }) ?? '')
        && /workflow is refused/.test(f('Workflow', { script: 'x' }) ?? '')
        && /No approved plan/.test(f('Agent', { prompt: '/plans/gate-test.md step 1' }, null) ?? '');
    },
  },
  {
    name: 'hook-dispatch runs the manager fence and the dispatch gate on the main thread, and lets it enter plan mode; a read of the plan passes, and a read of a source file is refused with the reason to send an agent and sets no latch',
    guards: ['manager_wired', 'fence_enter_plan', 'read_fence', 'fence_no_latch'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('fw');
      const write = w.call('PreToolUse', { session_id: s, tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x' } });
      const s2 = sid('fw');
      const agent = w.call('PreToolUse', { session_id: s2, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const extra = w.call('PreToolUse', { session_id: sid('fw'), tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' } });
      const read = w.call('PreToolUse', { session_id: sid('fw'), tool_name: 'Read', tool_input: { file_path: w.plan } });
      const enter = w.call('PreToolUse', { session_id: sid('fw'), tool_name: 'EnterPlanMode', tool_input: {} });
      // A source file is not of the record: refused with the reason, and the refusal sets no latch (Q-HUB-43, Q-HUB-45).
      const sSrc = sid('fw');
      const src = repo({ 'app.ts': 'export const x = 1;\n' }, 'appfix');
      const source = w.call('PreToolUse', { session_id: sSrc, tool_name: 'Read', tool_input: { file_path: join(src.dir, 'app.ts') } });
      return write.status === 2 && /MANAGER FENCE/.test(write.stderr) && agent.status === 0
        && extra.status === 2 && /DISPATCH GATE/.test(extra.stderr) && read.status === 0 && enter.status === 0
        && source.status === 2 && /MANAGER FENCE/.test(source.stderr) && /Send an agent/.test(source.stderr) && !latched(sSrc);
    },
  },
  {
    name: 'the manager fence passes a read only of the record (the approved plan and the plans folder, the scratchpad, the hub\'s doctrine, lessons and review file, each repo\'s notes and plan pointers, the session\'s transcript); a read of an app\'s source or tool, by Read, Grep, Glob, Bash or the connector, is refused with the reason to send an agent',
    guards: ['read_fence', 'read_fence_pad', 'read_fence_plans', 'read_fence_plan_file', 'read_fence_doctrine', 'read_fence_transcript', 'read_fence_transcript_name',
      'read_fence_repo_files', 'read_fence_hub_files', 'read_fence_aim_review', 'read_fence_read', 'read_fence_grep', 'read_fence_glob', 'read_fence_bash', 'read_fence_bash_dynamic',
      'read_fence_bash_pipe', 'read_fence_bash_nofile', 'read_fence_bash_bare', 'read_fence_bash_flag', 'read_fence_connector'],
    run(m) {
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const s = sid('rf');
      const pad = `/tmp/claude-0/-home-user/${s}/scratchpad`;
      const dot = join(homedir(), '.claude');
      // A hub (its DOCTRINE.md and hook-dispatch.mjs beside it) and a sibling repository, each with an app source file.
      const hub = repo({ 'DOCTRINE.md': 'd', 'hook-dispatch.mjs': 'h', 'app.ts': 'x' }, 'hubfix');
      const sib = repo({ 'NOTES.md': 'n', 'app.ts': 'x' }, 'sibfix');
      for (const d of ['lessons', 'plans']) mkdirSync(join(hub.dir, d));
      // Every call counts as a read for the classifier, so what these judge is the record.
      const f = (tool_name, tool_input, extra = {}) => m.dispatch.managerFence({ session_id: s, tool_name, tool_input, ...extra }, { plan, classify: () => true });
      const passes = (tool_name, tool_input, extra) => f(tool_name, tool_input, extra) === null;
      const refused = (tool_name, tool_input, extra) => { const r = f(tool_name, tool_input, extra) ?? ''; return /^MANAGER FENCE/.test(r) && /Send an agent/.test(r); };
      const read = (file_path, extra) => passes('Read', { file_path }, extra);
      const notRead = (file_path, extra) => refused('Read', { file_path }, extra);
      const bash = (command, extra) => passes('Bash', { command }, extra);
      const notBash = (command, extra) => refused('Bash', { command }, extra);
      const mine = { cwd: sib.dir };
      const thePlan = read(plan.path) && read(join(dot, 'plans', 'next.md')) && passes('Grep', { pattern: 'x', path: join(dot, 'plans') }) && notRead(join(dot, 'plans', 'sub', 'x.md'));
      const thePad = read(`${pad}/progress/step-11.txt`) && read(`${pad}/progress/step-11-report.txt`) && read(`${pad}/step6/final/sheet-1.jpg`)
        && passes('Glob', { pattern: `${pad}/progress/*.txt` })
        && notRead('/tmp/claude-0/-home-user/other/scratchpad/progress/step-11.txt') && notRead(`${pad}/../x.txt`);
      const theDoctrine = read(join(dot, 'hub', 'DOCTRINE.md')) && read(join(hub.dir, 'DOCTRINE.md')) && notRead(join(sib.dir, 'DOCTRINE.md'));
      const theTranscript = read('/elsewhere/t.jsonl', { transcript_path: '/elsewhere/t.jsonl' }) && notRead('/elsewhere/other.jsonl', { transcript_path: '/elsewhere/t.jsonl' });
      const theTranscriptName = read(join(dot, 'projects', '-home-user', `${s}.jsonl`)) && notRead(join(dot, 'projects', '-home-user', 'another-session.jsonl'));
      const theRepoFiles = ['NOTES.md', 'CLAUDE.md', '.plan-scope', '.claude/PLAN', '.branch-guard'].every((n) => read(join(sib.dir, n)))
        && notRead(join(sib.dir, 'app.ts')) && notRead(join(hub.dir, 'app.ts')) && notRead(join(hub.dir, 'hook-dispatch.mjs'));
      const theHubFiles = ['LESSONS.md', 'aim-review.md', 'lessons/385-a-lesson.md', 'plans/a-plan.md'].every((n) => read(join(hub.dir, n))) && passes('Grep', { pattern: 'x', path: join(hub.dir, 'lessons') })
        && notRead(join(sib.dir, 'LESSONS.md')) && notRead(join(sib.dir, 'aim-review.md')) && notRead(join(sib.dir, 'lessons', 'a-lesson.md'));
      const theRead = notRead('/etc/hostname') && refused('Read', {});
      const theGrep = refused('Grep', { pattern: 'x' }, mine) && refused('Grep', { pattern: 'x', path: sib.dir }) && passes('Grep', { pattern: 'x', path: join(sib.dir, 'NOTES.md') });
      const theGlob = refused('Glob', { pattern: '**/*.ts', path: sib.dir }) && refused('Glob', { pattern: `${sib.dir}/**/*.ts` })
        && passes('Glob', { pattern: 'lessons/*.md', path: hub.dir }) && passes('Glob', { pattern: join(sib.dir, 'NOTES.md') });
      const theBash = notBash(`cat ${sib.dir}/app.ts`) && notBash(`git -C ${sib.dir} diff`) && notBash('ls', mine) && notBash(`cat ${sib.dir}/NOTES.md ${sib.dir}/app.ts`)
        && notBash(`cat ${sib.dir}/NOTES.md; cat ${sib.dir}/app.ts`)
        && bash(`cat ${sib.dir}/NOTES.md`) && bash(`ls ${join(dot, 'plans')}`) && bash('cat NOTES.md', mine) && bash(`cat ${pad}/progress/step-1.txt 2>/dev/null`);
      const theBashDynamic = notBash('echo $(date)') && notBash(`cat ${sib.dir}/NOTES.md --label=$X`);
      const theBashPipe = bash(`grep -n foo ${pad}/progress/step-1.txt | head -5`) && notBash(`cat ${sib.dir}/NOTES.md | head -5; head -5`);
      const theBashNoFile = bash('date') && bash('echo done');
      const theBashBare = notBash('cat app.ts', mine);
      const theBashFlag = notBash(`grep --file=${sib.dir}/app.ts foo ${sib.dir}/NOTES.md`);
      const theConnector = refused('mcp__github__get_file_contents', { owner: 'o', repo: 'r', path: 'src/x.ts' }) && refused('mcp__github__search_code', { q: 'x' })
        && passes('ToolSearch', { query: 'x' }) && passes('WebSearch', { query: 'x' }) && passes('mcp__github__actions_list', { owner: 'o', repo: 'r' });
      return thePlan && thePad && theDoctrine && theTranscript && theTranscriptName && theRepoFiles && theHubFiles && theRead && theGrep && theGlob
        && theBash && theBashDynamic && theBashPipe && theBashNoFile && theBashBare && theBashFlag && theConnector
        // A subagent is not held by it: the plan fence holds an agent's reads.
        && passes('Read', { file_path: join(sib.dir, 'app.ts') }, { agent_id: 'a1' });
    },
  },
  {
    name: 'the manager fence passes a SendUserFile of files in the session scratchpad, so a choice between pictures carries its pictures; one naming a file anywhere else, in another session\'s scratchpad, or no file, is refused',
    guards: ['send_file_branch', 'send_file', 'send_file_pad', 'send_file_named'],
    run(m, dir) {
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const s = sid('sf');
      const pad = `/tmp/claude-0/-home-user/${s}/scratchpad`;
      const sheet = (n) => `${pad}/step6/final/sheet-${n}.jpg`;
      // Not a read for the classifier, so a call that is not passed by its own rule is refused as not a read.
      const f = (tool_input, extra = {}) => m.dispatch.managerFence({ session_id: s, tool_name: 'SendUserFile', tool_input, ...extra }, { plan, classify: () => false });
      const fenced = (x) => /^MANAGER FENCE/.test(x ?? '');
      const sent = f({ file_paths: [1, 2, 3, 4, 5].map(sheet) }) === null && f({ file_path: sheet(1), caption: 'Which of these reads better?' }) === null
        && f({ files: [{ path: sheet(2) }, { path: sheet(3) }] }) === null && f({ paths: [sheet(4)] }) === null;
      const refused = fenced(f({ file_paths: ['/etc/hostname'] })) && fenced(f({ file_paths: [sheet(1), '/home/user/x.jpg'] }))
        && fenced(f({ file_path: '/tmp/claude-0/-home-user/other/scratchpad/step6/final/sheet-1.jpg' })) && fenced(f({ file_path: `${pad}/../sheet-1.jpg` }))
        && fenced(f({ file_path: 'sheet-1.jpg' })) && fenced(f({})) && fenced(f({ caption: 'No file here.' }))
        && /not in it/.test(f({ file_paths: [sheet(1), '/home/user/x.jpg'] }) ?? '') && /names no file/.test(f({}) ?? '');
      // Through the whole chain: a scratchpad file goes, another file is refused and sets no latch.
      const w = world(dir);
      const through = w.call('PreToolUse', { session_id: s, tool_name: 'SendUserFile', tool_input: { file_paths: [sheet(1), sheet(2)] } });
      const sOut = sid('sf');
      const outside = w.call('PreToolUse', { session_id: sOut, tool_name: 'SendUserFile', tool_input: { file_paths: ['/etc/hostname'] } });
      return sent && refused && through.status === 0 && outside.status === 2 && /MANAGER FENCE/.test(outside.stderr) && !latched(sOut)
        && f({ file_paths: ['/etc/hostname'] }, { agent_id: 'a1' }) === null;
    },
  },
  {
    name: 'the gates read the approved plan only while its hash matches the approval: an edited plan sends no agent',
    guards: ['plan_hash'],
    run(m, dir) {
      const w = world(dir);
      const send = () => w.call('PreToolUse', { session_id: sid('ph'), tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const before = send();
      appendFileSync(w.plan, '3. **Also.** A step added after approval.\n');
      const after = send();
      return before.status === 0 && after.status === 2 && /DISPATCH GATE[\s\S]*No approved plan/.test(after.stderr);
    },
  },
  {
    name: 'every status prints the approval state read from disk: the marker or none, the plan, hash and time it holds, the plan file\'s hash and last write, and whether they match',
    guards: ['approval_status_print', 'approval_match'],
    run(m, dir) {
      const A = appHome(dir);
      const sha = (t) => createHash('sha256').update(t).digest('hex');
      const status = () => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the approval test'], {
        encoding: 'utf8', env: { ...process.env, HOME: A.home, CLAUDE_CODE_SESSION_ID: '' } }).stdout ?? '';
      const none = status();
      writeFileSync(A.marker, JSON.stringify({ plan: A.plan, hash: sha(STEPS_PLAN), at: new Date().toISOString(), session: 'ap-1', via: 'the test' }));
      const ok = status();
      appendFileSync(A.plan, 'Edited after the approval.\n');
      const changed = status();
      rmSync(A.plan);
      const gone = status();
      writeFileSync(A.marker, '{ not json');
      const unreadable = status();
      const held = sha(STEPS_PLAN).slice(0, 12);
      return /Marker: none/.test(none) && !/Match:/.test(none)
        && ok.includes('Approval state, read from disk now:') && ok.includes(`Plan it names: ${A.plan}`) && ok.includes(`Hash it holds: ${held}`)
        && /Marker: present, recorded \d{4}-\d\d-\d\d \d\d:\d\d \(California\), the test, session ap-1\./.test(ok)
        && new RegExp(`Plan file now: hash ${held}, last written \\d{4}-\\d\\d-\\d\\d \\d\\d:\\d\\d \\(California\\)\\.`).test(ok) && /Match: yes/.test(ok)
        && /Match: NO/.test(changed) && !changed.includes(`Plan file now: hash ${held}`) && changed.includes(`Hash it holds: ${held}`)
        && /Plan file now: cannot be read \(ENOENT\)/.test(gone) && /Match: no\./.test(gone)
        && /cannot be read as an approval/.test(unreadable);
    },
  },
  {
    name: 'every dispatch gate refusal prints the same approval state: a wrong prompt under a matching plan, a plan edited after approval, and no marker at all',
    guards: ['dispatch_approval_state'],
    run(m, dir) {
      const w = world(dir);
      const send = (prompt) => w.call('PreToolUse', { session_id: sid('da'), tool_name: 'Agent', tool_input: { prompt, subagent_type: 'general-purpose' } });
      const wrong = send(`${w.plan} step 1, and tidy up after`);
      appendFileSync(w.plan, '3. **Also.** A step added after approval.\n');
      const edited = send(`${w.plan} step 1`);
      rmSync(join(w.home, '.claude', 'APPROVED-PLAN.json'));
      const none = send(`${w.plan} step 1`);
      return wrong.status === 2 && /DISPATCH GATE[\s\S]*Send exactly[\s\S]*Match: yes/.test(wrong.stderr)
        && edited.status === 2 && /No approved plan[\s\S]*Plan it names:[\s\S]*Match: NO/.test(edited.stderr)
        && none.status === 2 && /No approved plan[\s\S]*Marker: none/.test(none.stderr);
    },
  },
  {
    name: 'the main thread may write and publish the status page source in its scratchpad through hook-dispatch',
    guards: ['fence_status_write', 'fence_artifact'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('sp');
      const page = join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad', 'status', 'fix-run.html');
      const write = w.call('PreToolUse', { session_id: s, tool_name: 'Write', tool_input: { file_path: page, content: '<p>status</p>' } });
      const publish = w.call('PreToolUse', { session_id: s, tool_name: 'Artifact', tool_input: { file_path: page } });
      const other = w.call('PreToolUse', { session_id: sid('sp'), tool_name: 'Write', tool_input: { file_path: join(dirname(page), 'other.html'), content: 'x' } });
      return write.status === 0 && publish.status === 0 && other.status === 2 && /MANAGER FENCE/.test(other.stderr);
    },
  },
  {
    name: 'a status falling due because an agent ended is refused without latching and names the agent; once it is stamped the refused call runs',
    guards: ['report_no_latch', 'report_gate_wired', 'status_gate_ended'],
    run(m, dir) {
      // An agent the session launched handed back a minute ago, five minutes after the last status.
      const w = world(dir);
      const subs = join(w.tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(subs, 'agent-aend01.jsonl'), jsonl([at(tool(0, 'h1', 'SubagentHandback', { message: 'Step one is built.' }), later(-60)),
        at(result(0, 'h1', 'Report delivered to your caller.'), later(-59))]));
      writeFileSync(join(subs, 'agent-aend01.meta.json'), JSON.stringify({ agentType: 'general-purpose', description: 'Plan step for the gate test' }));
      writeFileSync(join(w.home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - 6 * 60000, status: 'Status' }));
      const s = sid('rg');
      const call = () => w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan } });
      const due = call();
      const notLatched = !latched(s);
      const stamp = spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — an agent ended'], { encoding: 'utf8', env: { ...process.env, HOME: w.home, CLAUDE_CODE_SESSION_ID: '' } });
      const again = call();
      return due.status === 2 && /ended since the owner last got a status/.test(due.stderr) && due.stderr.includes('aend01') && /a report/.test(due.stderr) && notLatched
        && stamp.status === 0 && again.status === 0 && !latched(s);
    },
  },
  {
    name: 'a status is due when an agent has ended since the last one and at no other time: a long gap, a running agent, a running background task and an agent that ended before the last status make none due; a session whose agents cannot be found is not read as due',
    guards: ['status_gate_ended', 'status_after_stamp', 'status_mtime_skip', 'status_unreadable'],
    run(m, dir) {
      const home = tmp('sg-home-');
      mkdirSync(join(home, '.claude'), { recursive: true });
      const clock = (msAgo) => writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - msAgo, status: 'Status' }));
      clock(20 * 60000);
      // The harness's layout: <dir>/<sid>.jsonl, and its agents in <dir>/<sid>/subagents/.
      const proj = tmp('sg-proj-');
      const s = sid('si');
      const main = join(proj, `${s}.jsonl`);
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      const lines = (entries) => entries.map((e) => JSON.stringify(e)).join('\n') + '\n';
      const g = (path = main) => spawnSync('node', [join(dir, 'report.mjs'), '--gate'], {
        input: JSON.stringify({ session_id: s, transcript_path: path, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } }),
        encoding: 'utf8', env: { ...process.env, HOME: home },
      });
      const handedBack = (id, secsAgo) => writeFileSync(join(subs, `agent-${id}.jsonl`), lines([at(tool(0, `${id}-h`, 'SubagentHandback', { message: `${id} is built.` }), later(-secsAgo)),
        at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(-secsAgo + 1))]));
      // A long gap and a background command running, and no agent at all.
      writeFileSync(main, lines([turn(0, 'start'), tool(0, 'b0', 'Bash', {}), result(1, 'b0', 'Command running in background with ID: bxyz789. Output is being written to: /tmp/x')]));
      const gapOnly = g();
      // An agent running, and nothing else.
      const running = join(subs, 'agent-arun01.jsonl');
      writeFileSync(running, lines([at(tool(0, 'n1', 'Bash', { command: 'node long.mjs' }), later(-10)), at(result(0, 'n1', 'step one of three'), later(-9))]));
      const agentRuns = g();
      rmSync(running);
      // An agent that ended thirty minutes ago, before the last status (twenty minutes ago).
      handedBack('aold01', 30 * 60);
      const endedBefore = g();
      // An agent that ended a minute ago, after it.
      handedBack('anew02', 60);
      const endedAfter = g();
      // The status is given: the same agent is no longer due.
      clock(0);
      const stamped = g();
      // A file written before the status cannot hold an end after it, and is not read.
      clock(20 * 60000);
      const tenHoursAgo = (Date.now() - 10 * 3600000) / 1000;
      utimesSync(join(subs, 'agent-anew02.jsonl'), tenHoursAgo, tenHoursAgo);
      rmSync(join(subs, 'agent-aold01.jsonl'));
      const notRead = g();
      // A payload naming no transcript, for a session whose files are not found either: nothing is known to be due.
      clock(20 * 60000);
      handedBack('anew03', 60);
      const unreadable = g('');
      const missing = g(join(proj, 'missing.jsonl'));
      return gapOnly.status === 0 && agentRuns.status === 0 && endedBefore.status === 0
        && endedAfter.status === 2 && endedAfter.stderr.includes('anew02') && !endedAfter.stderr.includes('aold01') && /ended since the owner last got a status/.test(endedAfter.stderr)
        && stamped.status === 0 && notRead.status === 0 && unreadable.status === 0 && missing.status === 0;
    },
  },

  // ---- the refusal latch (hook-dispatch.mjs, stop-guard.mjs) ----
  {
    name: 'a refusal latches the session: the next call is refused naming it; the status command and an agent\'s return pass',
    guards: ['latch_write', 'latch_refuse', 'latch_return', 'latch_status'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('lt');
      // A refusal that latches: the dispatch gate's (a send carrying words beyond the plan's path and a step number). The fence's refusal of a call
      // that is not of the record sets no latch, so a Write or a Read outside the record is not the way to latch the session.
      const first = w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' } });
      const read = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      const status = w.call('PreToolUse', { session_id: s, tool_name: 'Bash', tool_input: { command: `node "${join(dir, 'report.mjs')}" "Status 10:00 — a call was refused"` } });
      const ret = w.call('PreToolUse', { session_id: s, agent_id: 'a1', tool_name: 'StructuredOutput', tool_input: { result: 'x' } });
      const back = w.call('PreToolUse', { session_id: s, agent_id: 'a1', tool_name: 'SubagentHandback', tool_input: { message: 'x' } });
      const agentRead = w.call('PreToolUse', { session_id: s, agent_id: 'a1', tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      return first.status === 2 && latched(s)
        && read.status === 2 && /REFUSAL LATCH/.test(read.stderr) && /DISPATCH GATE/.test(read.stderr)
        && status.status === 0 && ret.status === 0 && back.status === 0
        && agentRead.status === 2 && /REFUSAL LATCH/.test(agentRead.stderr);
    },
  },
  {
    name: 'a refusal inside an agent latches that agent only: its next call is refused except its own return, while a second agent, the main thread and the wait pass; a refusal on the main thread latches the main thread as before',
    guards: ['latch_agent_own', 'latch_agent_check', 'latch_return'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('la');
      const agentFile = (id) => join(process.env.REFUSAL_LATCH_DIR, `${s}.agent-${id}.json`);
      const call = (extra) => w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan }, ...extra });
      // Agent a1 writes outside the plan's Files: the plan fence refuses it.
      const refused = call({ agent_id: 'a1', tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'stray.txt'), content: 'x' } });
      const own = existsSync(agentFile('a1')) && !latched(s);
      const next = call({ agent_id: 'a1' });
      const back = call({ agent_id: 'a1', tool_name: 'SubagentHandback', tool_input: { message: 'Refused by the plan fence; nothing was written.' } });
      const second = call({ agent_id: 'a2' });
      const main = call({});
      const agentSend = call({ tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const wait = call({ tool_name: 'Bash', tool_input: { command: `node ${join(dir, 'report.mjs')} --wait` } });
      // The main thread refused by a gate that latches (the dispatch gate): the session's own latch, as before.
      const mainRefused = call({ tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' } });
      const mainNext = call({});
      return refused.status === 2 && own
        && next.status === 2 && /REFUSAL LATCH/.test(next.stderr) && /subagent \(a1\)/.test(next.stderr) && /every later call of it is refused except its own return/.test(next.stderr)
        && back.status === 0 && second.status === 0 && main.status === 0 && agentSend.status === 0 && wait.status === 0
        && mainRefused.status === 2 && latched(s) && mainNext.status === 2 && /REFUSAL LATCH/.test(mainNext.stderr);
    },
  },
  {
    name: 'while latched the main thread\'s TaskStop passes, so it can stop what it started; an agent\'s TaskStop, the wait and every other main-thread call stay refused',
    guards: ['latch_main_taskstop', 'latch_agent_taskstop', 'latch_refuse'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('ls');
      const first = w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' } });
      const stop = w.call('PreToolUse', { session_id: s, tool_name: 'TaskStop', tool_input: { task_id: 'bxyz789' } });
      const agentStop = w.call('PreToolUse', { session_id: s, agent_id: 'a1', tool_name: 'TaskStop', tool_input: { task_id: 'bxyz789' } });
      const read = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      const wait = w.call('PreToolUse', { session_id: s, tool_name: 'Bash', tool_input: { command: `node ${join(dir, 'report.mjs')} --wait` } });
      const quoted = w.call('PreToolUse', { session_id: s, tool_name: 'Bash', tool_input: { command: `node ${join(dir, 'report.mjs')} "--wait"` } });
      return first.status === 2 && latched(s)
        && stop.status === 0
        && agentStop.status === 2 && /REFUSAL LATCH/.test(agentStop.stderr)
        && read.status === 2 && /REFUSAL LATCH/.test(read.stderr) && /main thread's TaskStop/.test(read.stderr)
        && wait.status === 2 && /REFUSAL LATCH/.test(wait.stderr)
        && quoted.status === 2 && /REFUSAL LATCH/.test(quoted.stderr);
    },
  },
  {
    name: 'a repo hook\'s PreToolUse refusal latches too, even when the hook never reads its input; a Stop hook\'s refusal does not latch',
    guards: ['latch_repo', 'latch_stop_event', 'dispatch_epipe'],
    run(m, dir) {
      const w = world(dir);
      const r = join(w.cwd, 'repo');
      mkdirSync(join(r, '.claude'), { recursive: true });
      spawnSync('git', ['init', '-q', r]);
      // Neither hook reads its stdin, and the payload is 256 KB, so writing it
      // breaks the pipe every time (EPIPE): the refusal must still count.
      writeFileSync(join(r, '.claude', 'settings.json'), JSON.stringify({ hooks: {
        PreToolUse: [{ matcher: '.*', hooks: [{ type: 'command', command: 'echo "repo gate says no" >&2; exit 2' }] }],
        Stop: [{ hooks: [{ type: 'command', command: 'echo "repo stop says no" >&2; exit 2' }] }],
      } }));
      const pad = 'x'.repeat(256 * 1024);
      const s = sid('lr');
      const pre = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan }, pad });
      const s2 = sid('lr');
      const stop = w.call('Stop', { session_id: s2, pad });
      return pre.status === 2 && /repo gate says no/.test(pre.stderr) && latched(s)
        && stop.status === 2 && /repo stop says no/.test(stop.stderr) && !latched(s2);
    },
  },
  {
    name: 'only a message the owner typed after the latch clears it; a notification, a scheduled message, a hand-back or an earlier message does not',
    guards: ['latch_clear', 'latch_after'],
    run(m) {
      const s = sid('lc');
      const p = { session_id: s };
      m.dispatch.setLatch({ ...p, tool_name: 'Bash' }, 'refused for the test');
      const note = { type: 'user', timestamp: later(5), origin: { kind: 'task-notification', producer: 'session-task' }, message: { role: 'user', content: NOTE } };
      const sched = { type: 'user', timestamp: later(6), origin: { kind: 'scheduled' }, message: { role: 'user', content: 'Scheduled check: is CI green?' } };
      const peer = { type: 'attachment', timestamp: later(7), attachment: { type: 'queued_command', prompt: '[Subagent hand-back] done', commandMode: 'prompt', origin: { kind: 'peer' } } };
      const before = owner(new Date(Date.now() - 60000).toISOString(), 'carry on');
      const held = [note, sched, peer, before].every((e) => m.dispatch.latchStanding(p, [e]) !== null) && m.dispatch.latchStanding(p, [note, sched, peer, before]) !== null;
      const stillThere = latched(s);
      const typedMid = m.dispatch.latchStanding(p, [note, at(mid(0, 'stop and tell me'), later(9))]);
      const gone = !latched(s);
      m.dispatch.setLatch({ ...p, tool_name: 'Bash' }, 'refused again');
      const typed = m.dispatch.latchStanding(p, [owner(later(10), 'what was refused?')]);
      return held && stillThere && typedMid === null && gone && typed === null && !latched(s);
    },
  },
  {
    name: 'the latch goes by when a message was typed, not when it arrived: one typed before the refusal and delivered after it clears nothing',
    guards: ['latch_typed'],
    run(m) {
      const s = sid('lt');
      const p = { session_id: s };
      m.dispatch.setLatch({ ...p, tool_name: 'Bash' }, 'refused for the test');
      const early = new Date(Date.now() - 60000).toISOString();
      const q = (t, content) => ({ type: 'queue-operation', operation: 'enqueue', timestamp: t, sessionId: 't', content });
      const before = 'Also check the sweep log when you get a chance.';
      const after = 'What was refused? Tell me before anything else.';
      // Typed a minute ago, queued, and handed to the session only now.
      const lateDelivery = [q(early, before), at(mid(0, before), later(5))];
      const held = m.dispatch.latchStanding(p, lateDelivery) !== null && latched(s);
      // The same, as the next turn's prompt.
      const asPrompt = m.dispatch.latchStanding(p, [q(early, before), owner(later(6), before)]) !== null;
      // Typed after the refusal: clears it.
      const cleared = m.dispatch.latchStanding(p, [...lateDelivery, q(later(7), after), at(mid(0, after), later(8))]) === null && !latched(s);
      return held && asPrompt && cleared;
    },
  },
  {
    name: 'an agent\'s own return passes every guard: an owner STOP waiting, plan mode, and a repo hook refusing everything',
    guards: ['latch_return'],
    run(m, dir) {
      const w = world(dir, [turn(0, 'start'), enq(10, STOPMSG)]);
      const r = join(w.cwd, 'repo');
      mkdirSync(join(r, '.claude'), { recursive: true });
      spawnSync('git', ['init', '-q', r]);
      writeFileSync(join(r, '.claude', 'settings.json'), JSON.stringify({ hooks: {
        PreToolUse: [{ matcher: '.*', hooks: [{ type: 'command', command: 'echo "repo gate says no" >&2; exit 2' }] }],
      } }));
      const s = sid('rt');
      const back = w.call('PreToolUse', { session_id: s, agent_id: 'a1', permission_mode: 'plan', tool_name: 'SubagentHandback', tool_input: { message: 'Stopped: the push gate refused git push origin claude/x.' } });
      const out = w.call('PreToolUse', { session_id: s, agent_id: 'a1', permission_mode: 'plan', tool_name: 'StructuredOutput', tool_input: { result: 'x' } });
      const read = w.call('PreToolUse', { session_id: sid('rt'), agent_id: 'a1', tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      return back.status === 0 && out.status === 0 && read.status === 2 && /STOP/.test(read.stderr);
    },
  },
  {
    name: 'a stop passes while latched, even with a task running and no declaration',
    guards: ['latch_stop'],
    run(m, dir) {
      const s = sid('ls');
      const launch = [tool(0, 'w0', 'Workflow', {}), result(1, 'w0', 'Workflow launched in background. Task ID: wabc123')];
      const reply = { type: 'assistant', timestamp: ts(9), message: { role: 'assistant', content: [{ type: 'text', text: 'The push was refused by the push gate; that is what happened.' }] } };
      const tr = transcript([...launch, reply]);
      const say = () => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: s, transcript_path: tr }), encoding: 'utf8' }).status;
      const unlatched = say();
      m.dispatch.setLatch({ session_id: s, transcript_path: tr, tool_name: 'Bash' }, 'refused for the test');
      return unlatched === 2 && say() === 0;
    },
  },

  // ---- refused names (plan-guard.mjs) ----
  {
    name: 'a refused plan name holds ExitPlanMode until a later tool result carries it or its line says (new); dropping it does not clear it',
    guards: ['names_record', 'names_hold', 'names_after', 'names_new'],
    run(m, dir) {
      const r = repo({ 'a.txt': 'x\n' });
      const name = ['zzqx', 'Missing', 'Gadget'].join('');
      const exit = (s, planText, entries) => spawnSync('node', [join(dir, 'plan-guard.mjs')], {
        input: JSON.stringify({ session_id: s, permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { plan: planText }, transcript_path: transcript([turn(0, OWNER), ...entries]), cwd: '/' }),
        encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: r.dir },
      });
      const naming = PLAN(OWN_WORDS) + `\n- The builder calls \`${name}\` once.\n`;
      const dropped = PLAN(OWN_WORDS);
      const s = sid('nm');
      const first = exit(s, naming, []);
      const drop = exit(s, dropped, []);
      const seen = exit(s, dropped, [tool(0, 'g1', 'Grep', {}), at(result(0, 'g1', `src/builder.mjs:12: export function ${name}()`), later(30))]);
      const s2 = sid('nm');
      exit(s2, naming, []);
      const marked = exit(s2, PLAN(OWN_WORDS) + `\n- The builder calls \`${name}\` (new) once.\n`, []);
      // A result from BEFORE the refusal does not release it.
      const s3 = sid('nm');
      mkdirSync(process.env.PLAN_GUARD_NAMES_DIR, { recursive: true });
      writeFileSync(join(process.env.PLAN_GUARD_NAMES_DIR, `${s3}.json`), JSON.stringify([{ name, at: Date.now() + 60000 }]));
      const early = exit(s3, dropped, [tool(0, 'g2', 'Grep', {}), at(result(0, 'g2', `found ${name}`), later(5))]);
      return first.status === 2 && first.stdout.includes('exist in no repo')
        && drop.status === 2 && drop.stdout.includes('stays refused') && drop.stdout.includes(name)
        && seen.status === 0 && marked.status === 0 && early.status === 2;
    },
  },
  {
    name: 'ExitPlanMode needs the newest turn that asked nothing to come after the plan file\'s last write and an owner message after it; a question is not the talk, an older talk is not the talk of an edited plan, and a plan with no plan-mode call is not judged',
    guards: ['talk_after_edit', 'talk_asks_nothing', 'talk_newest', 'talk_owner_after'],
    run(m, dir) {
      const r = repo({ 'a.txt': 'x\n' });
      const TALK = 'Here is what is being done and why: the export control moves to the toolbar edge, and nothing else changes.';
      const TALK2 = 'To be exact about it: only the control moves, and the toolbar keeps every other control where it is.';
      const QUESTION = 'Shall I go ahead and build this plan now, or would you rather change something first?';
      const exit = (entries, writtenSecsAgo) => {
        const home = tmp('sg-home-');
        mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
        const file = join(home, '.claude', 'plans', 'talk-test.md');
        writeFileSync(file, PLAN(OWN_WORDS));
        const t = (Date.now() - writtenSecsAgo * 1000) / 1000;
        utimesSync(file, t, t);
        return spawnSync('node', [join(dir, 'plan-guard.mjs')], {
          input: JSON.stringify({ session_id: sid('tk'), permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { planFilePath: file }, transcript_path: transcript([turn(0, OWNER), ...entries]), cwd: '/' }),
          encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: r.dir },
        });
      };
      const said = (secs, text) => at(reply(0, text), later(secs));
      const entered = enterPlan(-900);
      // The plan was written 1000 s ago, talked through at -500, answered at -400.
      const good = exit([...entered, said(-500, TALK), owner(later(-400), 'ok')], 1000);
      // The plan was edited at -300, after the talk and the answer.
      const edited = exit([...entered, said(-500, TALK), owner(later(-400), 'ok')], 300);
      // A question is not the talk: the only turn is one that asks.
      const asked = exit([...entered, said(-500, QUESTION), owner(later(-400), 'ok')], 1000);
      // A question after the talk neither counts nor displaces it.
      const askedAfter = exit([...entered, said(-500, TALK), said(-450, QUESTION), owner(later(-400), 'ok')], 1000);
      // Two turns that asked nothing: the NEWEST is judged. It is after the edit (-600) although the first is not.
      const newest = exit([...entered, said(-800, TALK), said(-500, TALK2), owner(later(-400), 'ok')], 600);
      // The talk is the last thing said: no owner message follows it, only a tool call.
      const unanswered = exit([...entered, said(-500, TALK), at(tool(0, 'u1', 'Read', { file_path: '/etc/hostname' }), later(-450))], 1000);
      // No plan-mode call in the tail: nothing says what to count from.
      const noAnchor = exit([said(-500, TALK)], 300);
      return good.status === 0
        && edited.status === 2 && /last written at \d\d:\d\d \(California\), after the last chat turn that explained it/.test(edited.stdout)
        && asked.status === 2 && /has not been talked through/.test(asked.stdout)
        && askedAfter.status === 0 && newest.status === 0
        && unanswered.status === 2 && /has not been talked through/.test(unanswered.stdout)
        && noAnchor.status === 0;
    },
  },
  {
    name: 'ExitPlanMode judges the newest turn that asked nothing and ended before the owner\'s newest message: a line written in the call\'s own turn is not a turn, so one after a talk-through turn and an owner message passes, one with no talk-through turn is refused, and a newer talk before a second owner message is the one judged',
    guards: ['talk_owner_after', 'talk_owner_newest'],
    run(m, dir) {
      const r = repo({ 'a.txt': 'x\n' });
      const TALK = 'Here is what is being done and why: the export control moves to the toolbar edge, and nothing else changes.';
      const TALK2 = 'To be exact about it: only the control moves, and the toolbar keeps every other control where it is.';
      // Written in the turn of the call itself: long enough to count as talk, and it asks nothing.
      const LINE = 'The plan is ready, so it goes up for approval in this same turn.';
      const exit = (entries, writtenSecsAgo) => {
        const home = tmp('sg-home-');
        mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
        const file = join(home, '.claude', 'plans', 'talk-test.md');
        writeFileSync(file, PLAN(OWN_WORDS));
        const t = (Date.now() - writtenSecsAgo * 1000) / 1000;
        utimesSync(file, t, t);
        return spawnSync('node', [join(dir, 'plan-guard.mjs')], {
          input: JSON.stringify({ session_id: sid('tc'), permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { planFilePath: file }, transcript_path: transcript([turn(0, OWNER), ...entries]), cwd: '/' }),
          encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: r.dir },
        });
      };
      const said = (secs, text) => at(reply(0, text), later(secs));
      const call = (secs) => at(tool(0, 'xp-call', 'ExitPlanMode', { planFilePath: 'x' }), later(secs));
      const entered = enterPlan(-900);
      // Talked through at -500, answered at -400, then a line in the call's own turn at -300 and the call at -290. The plan was written at -1000.
      const ownTurn = exit([...entered, said(-500, TALK), owner(later(-400), 'ok'), said(-300, LINE), call(-290)], 1000);
      // No talk-through turn at all: the line in the call's own turn is the only text after the last owner turn.
      const noTalk = exit([...entered, owner(later(-400), 'ok'), said(-300, LINE), call(-290)], 1000);
      // Two talks and two answers: the newer talk (-300) is after the plan's last write (-500) and the older (-800) is not,
      // so judging the first owner message instead of the newest would refuse it.
      const newer = exit([...entered, said(-800, TALK), owner(later(-700), 'ok'), said(-300, TALK2), owner(later(-200), 'ok'), said(-100, LINE), call(-90)], 500);
      return ownTurn.status === 0 && noTalk.status === 2 && /has not been talked through/.test(noTalk.stdout) && newer.status === 0;
    },
  },

  // ---- push-guard.mjs ----
  {
    name: 'the push gate passes pushes that land on staging or main and refuses every other branch, deletion and bulk push',
    guards: ['push_dest', 'push_noref', 'push_head', 'push_colon', 'push_nested', 'push_cd'],
    run(m) {
      const r = repo({ 'a.txt': 'x\n' });
      const d = (command, cwd = r.dir) => m.push.decide({ tool_name: 'Bash', tool_input: { command }, cwd });
      r.g('checkout', '-q', '-b', 'staging');
      const onStaging = [d('git push origin staging'), d('git push -u origin main'), d('git push origin HEAD:main'), d('git push origin staging:main'),
        d(`git -C ${r.dir} push origin +HEAD:staging`, '/'), d('git push --force-with-lease origin staging'), d('git push'), d('git push origin HEAD'),
        d(`cd ${r.dir} && git push`, '/'), d('git push origin refs/heads/staging')];
      r.g('checkout', '-q', '-b', 'claude/work');
      const refused = [d('git push origin claude/work'), d('git push'), d('git push origin HEAD'), d('git push origin :staging'),
        d('git push origin main:refs/tags/v1'), d('git push origin $BR'), d('bash -c "git push origin claude/work"'),
        d('git status && git push origin claude/work'), d(`cd ${r.dir} && git push`, '/'), d('echo $(git push origin claude/work)'),
        d('git push origin main claude/work')];
      return onStaging.every((x) => x === null) && refused.every((x) => /^.+Only staging and main reach a remote/.test(x ?? ''))
        && d('git status') === null && d('echo "git push origin claude/work"') === null;
    },
  },
  {
    name: 'the push gate refuses --all, --mirror, --tags, --delete, -d and --prune even onto staging',
    guards: ['push_flags', 'push_short_d'],
    run(m) {
      const r = repo({ 'a.txt': 'x\n' });
      r.g('checkout', '-q', '-b', 'staging');
      const d = (command) => m.push.decide({ tool_name: 'Bash', tool_input: { command }, cwd: r.dir });
      return ['git push --all origin', 'git push --mirror origin', 'git push --tags origin', 'git push origin --delete main',
        'git push -d origin main', 'git push --prune origin', 'git push --branches origin', 'git push --follow-tags origin staging']
        .every((c) => d(c) !== null);
    },
  },
  {
    name: 'the push gate refuses a force-push to main and --no-verify on a push or a commit; a force-push to staging passes',
    guards: ['push_force_main', 'push_no_verify', 'push_commit_n', 'push_commit_nv'],
    run(m) {
      const r = repo({ 'a.txt': 'x\n' });
      r.g('checkout', '-q', '-b', 'main');
      const d = (command) => m.push.decide({ tool_name: 'Bash', tool_input: { command }, cwd: r.dir });
      const refused = ['git push --force origin main', 'git push -f origin main', 'git push -uf origin main', 'git push --force-with-lease origin main',
        'git push --force-with-lease=main:abc123 origin main', 'git push origin +main', 'git push origin +HEAD:main', 'git push -f', 'git push --force origin HEAD',
        'git push --no-verify origin staging', 'git commit --no-verify -m x', 'git commit -n -m x', 'git commit -anm x', `git -C ${r.dir} commit -a --no-verify`,
        'git add -A && git commit -qnm "x"'];
      const passed = ['git push -f origin staging', 'git push origin +HEAD:staging', 'git push --force-with-lease origin staging', 'git push origin main',
        'git commit -m "-n is not a flag here"', 'git commit -am "no verify skipped"', 'git commit -F msg.txt', 'git commit -m x -- notes'];
      const bad = [...refused.filter((c) => !/Only staging and main reach a remote/.test(d(c) ?? '')), ...passed.filter((c) => d(c) !== null)];
      if (bad.length) throw new Error(`wrong on: ${bad.join(' | ')}`);
      return /force-pushes main/.test(d('git push -f origin main') ?? '') && /--no-verify/.test(d('git commit -n -m x') ?? '');
    },
  },
  {
    name: 'the push gate reads a push past its redirect and its pipe: staging with its output redirected and piped passes, and a claude/ branch with the same tail is still refused',
    guards: ['push_redirect'],
    run(m) {
      const r = repo({ 'a.txt': 'x\n' });
      r.g('checkout', '-q', '-b', 'staging');
      const d = (command) => m.push.decide({ tool_name: 'Bash', tool_input: { command }, cwd: r.dir });
      const passes = ['git push origin staging 2>&1 | tail -3', 'git push 2>&1 | tail', 'git push origin HEAD:staging > /tmp/out.txt 2>&1',
        'git push origin staging &>/dev/null', 'git push -u origin staging >/dev/null 2>&1', 'git push origin main >> log.txt', 'git push origin staging 2>&1 | tee push.log | tail -1'];
      const refused = ['git push origin claude/work 2>&1 | tail -3', 'git push origin claude/work > /tmp/out.txt 2>&1', 'git push origin staging claude/work 2>&1',
        'git push origin >staging claude/work', 'git push origin > staging claude/work', 'git push origin staging "|" claude/work', 'git push origin :staging 2>&1 | tail'];
      const bad = [...passes.filter((c) => d(c) !== null), ...refused.filter((c) => !/Only staging and main reach a remote/.test(d(c) ?? ''))];
      if (bad.length) throw new Error(`wrong on: ${bad.join(' | ')}`);
      return true;
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
      const d = (command, cwd = r.dir) => m.push.decide({ tool_name: 'Bash', tool_input: { command }, cwd });
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
      return true;
    },
  },
  {
    name: 'the push gate refuses the connector\'s branch creation and its file writes to any branch but staging and main',
    guards: ['push_connector_create', 'push_connector_write'],
    run(m) {
      const d = (tool_name, tool_input = {}) => m.push.decide({ tool_name, tool_input });
      return d('mcp__github__create_branch', { branch: 'main' }) !== null
        && d('mcp__github__create_or_update_file', { branch: 'claude/x', path: 'a' }) !== null
        && d('mcp__github__push_files', { branch: 'feature' }) !== null && d('mcp__github__delete_file', {}) !== null
        && d('mcp__github__create_or_update_file', { branch: 'main', path: 'a' }) === null && d('mcp__github__push_files', { branch: 'staging' }) === null
        && d('mcp__github__get_file_contents', { branch: 'claude/x' }) === null;
    },
  },
  {
    name: 'the push gate refuses the connector\'s pull-request merge and branch-update tools, whatever branch they name',
    guards: ['push_connector_merge', 'push_connector_update'],
    run(m) {
      const d = (tool_name, tool_input = {}) => m.push.decide({ tool_name, tool_input });
      const said = (x, what) => new RegExp(`${what}, and it is refused\\. Only staging and main reach a remote`).test(x ?? '');
      return said(d('mcp__github__merge_pull_request', { owner: 'o', repo: 'r', pullNumber: 1 }), 'merges a pull request')
        && said(d('mcp__github__merge_pull_request', { owner: 'o', repo: 'r', pullNumber: 1, merge_method: 'rebase' }), 'merges a pull request')
        && said(d('mcp__GitHub__merge_pull_request', { pullNumber: 1 }), 'merges a pull request')
        && said(d('mcp__github__enable_pr_auto_merge', { pullNumber: 1 }), 'merges a pull request')
        && said(d('mcp__github__update_pull_request_branch', { pullNumber: 1 }), 'updates a pull request\'s branch')
        && said(d('mcp__github__update_pull_request_branch', { pullNumber: 1, branch: 'main' }), 'updates a pull request\'s branch')
        && d('mcp__github__pull_request_read', { pullNumber: 1 }) === null && d('mcp__github__disable_pr_auto_merge', { pullNumber: 1 }) === null;
    },
  },
  {
    name: 'hook-dispatch runs the push gate for an agent',
    guards: ['push_wired'],
    run(m, dir) {
      const w = world(dir);
      const o = w.call('PreToolUse', { session_id: sid('pw'), agent_id: 'a1', tool_name: 'Bash', tool_input: { command: 'git push origin claude/work' } });
      return o.status === 2 && /PUSH GATE/.test(o.stderr);
    },
  },

  // ---- plan-fence.mjs ----
  {
    name: 'the plan fence lets an agent write only under the Files list or in the scratchpad',
    guards: ['fence_write', 'fence_scratch'],
    run(m) {
      const r = repo({ 'keep.mjs': 'x\n' });
      const plan = fencePlan(basename(r.dir));
      const s = sid('pf');
      const w = (file_path, extra = {}) => decideFence(m,{ session_id: s, agent_id: 'a1', tool_name: 'Write', tool_input: { file_path }, cwd: r.dir, ...extra }, { plan });
      const fenced = (x) => /^PLAN FENCE/.test(x ?? '');
      return w(join(r.dir, 'keep.mjs')) === null && w(join(r.dir, 'src', 'deep', 'x.ts')) === null && w(join(r.dir, 'docs', 'notes.md')) === null
        && w(`/tmp/claude-0/-home-user/${s}/scratchpad/a.txt`) === null
        && fenced(w(join(r.dir, 'other.mjs'))) && fenced(w(join(r.dir, 'src', '..', 'other.mjs'))) && fenced(w(join(r.dir, 'src')))
        && fenced(w(join(r.dir, 'docs', 'other.md'))) && fenced(w(`/tmp/claude-0/-home-user/someone-else/scratchpad/a.txt`))
        && w(join(r.dir, 'other.mjs'), { agent_id: undefined }) === null
        && fenced(decideFence(m,{ session_id: s, agent_id: 'a1', tool_name: 'Edit', tool_input: { file_path: join(r.dir, 'keep.mjs') }, cwd: r.dir }, { plan: null }));
    },
  },
  {
    name: 'the plan fence splits an agent\'s command and passes only readers and Commands entries, refusing every cd and holding redirects to the Files list',
    guards: ['fence_bash', 'fence_split', 'fence_cd', 'fence_git_c', 'fence_redirect', 'fence_nested', 'fence_dotdot', 'fence_proc'],
    run(m) {
      const r = repo({ 'keep.mjs': 'x\n' });
      mkdirSync(join(r.dir, 'tools'));
      const plan = fencePlan(basename(r.dir));
      const s = sid('pb');
      const scratch = `/tmp/claude-0/-home-user/${s}/scratchpad`;
      const b = (command, cwd = r.dir) => decideFence(m,{ session_id: s, agent_id: 'a1', tool_name: 'Bash', tool_input: { command }, cwd }, { plan });
      const pass = [`git -C ${r.dir} status`, `git -C ${r.dir} commit -m "x; y"`, 'node tools/build.mjs --fast', 'git log --oneline | head -3',
        `node tools/a.mjs > ${scratch}/out.txt`, 'node tools/a.mjs > src/out.txt 2>&1', 'git commit -m "$(cat msg.txt)"', 'npm ci',
        'git push origin staging', `node ${r.dir}/tools/x.mjs`, 'cat keep.mjs 2>/dev/null'].map((c) => [c, b(c)]);
      const cds = [`cd ${r.dir} && git status`, `cd ${r.dir} && node tools/x.mjs`, `(cd ${r.dir} && git status)`, `git status; cd ${r.dir}`,
        'bash -c "cd /tmp"', 'echo $(cd /tmp && pwd)', `pushd ${r.dir}`, 'popd'].map((c) => [c, b(c, '/')]);
      const refuse = ['git reset --hard', 'node tools/../evil.mjs', 'node evil.mjs', 'git status & rm -rf x', 'git log; rm x', 'git status | tee out',
        'node tools/a.mjs > /etc/passwd', 'git commit -m "$(rm -rf x)"', 'cat <(rm x)', `cd /tmp && cd ${r.dir} && git status`,
        `git -C ${r.dir} -c core.hooksPath=/dev/null commit -m x`, 'bash -c "git status"', 'git status\nrm x'].map((c) => [c, b(c)]);
      const bad = [...pass.filter(([, x]) => x !== null), ...refuse.filter(([, x]) => !/^PLAN FENCE/.test(x ?? '')),
        ...cds.filter(([, x]) => !/^PLAN FENCE.* is a (cd|pushd|popd), and a \1 is refused: write every path in full/.test(x ?? ''))];
      if (bad.length) throw new Error(`wrong on: ${bad.map(([c]) => JSON.stringify(c)).join(', ')}`);
      return decideFence(m,{ session_id: s, tool_name: 'Bash', tool_input: { command: 'rm -rf x' }, cwd: r.dir }, { plan }) === null;
    },
  },
  {
    name: 'the plan fence covers every tool an agent calls: only a read, an allowed write or command, its own TaskStop or its own return passes',
    guards: ['fence_every', 'fence_return', 'fence_taskstop'],
    run(m) {
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const s = sid('pe');
      const call = (tool_name, tool_input = {}, reads) => decideFence(m,{ session_id: s, agent_id: 'a1', tool_name, tool_input, cwd: '/' }, { plan, ...(reads ? { reads } : {}) });
      const fenced = (x) => /^PLAN FENCE/.test(x ?? '');
      const no = () => false;
      return call('Read', { file_path: '/etc/hostname' }) === null && call('mcp__github__get_file_contents', { owner: 'o', repo: 'r', path: 'a' }) === null
        && call('SubagentHandback', { message: 'done' }, no) === null && call('StructuredOutput', { result: 'x' }, no) === null
        && fenced(call('Agent', { prompt: 'x', subagent_type: 'Explore' })) && fenced(call('Task', { prompt: 'x', subagent_type: 'Plan' }))
        && call('TaskStop', { task_id: 'x' }, no) === null && fenced(call('Artifact', { file_path: '/tmp/x.html' }))
        && fenced(call('mcp__github__push_files', { branch: 'main' })) && fenced(call('mcp__github__actions_run_trigger', {}))
        && fenced(call('ExitPlanMode', {})) && fenced(call('SomeToolNobodyHasHeardOf', {}))
        && decideFence(m,{ session_id: s, tool_name: 'Agent', tool_input: {} }, { plan }) === null;
    },
  },
  {
    name: 'a Files entry allows a write only in the repo its label names, and nothing ever writes the live gate copy',
    guards: ['fence_label', 'fence_live_hub'],
    run(m) {
      const abg = repo({ 'keep.mjs': 'x\n' }, 'Alpha-Beta-Gamma');
      const oth = repo({ 'keep.mjs': 'x\n' }, 'other-repo');
      const hub = repo({ 'DOCTRINE.md': 'x\n', 'hook-dispatch.mjs': '\n' }, 'notes-home');
      const live = join(homedir(), '.claude', 'hub');
      const plan = { path: '/plans/gate-test.md', text: ['# P', '',
        '## Goals', '1. A write lands only where the plan says.', GOALS_BLOCK, 'Served by: step 1 serves goal 1.', '',
        '## Files touched',
        '- ABG: `keep.mjs`', '- other-repo, changed: `src/`', '- Hub, new: `a.mjs`', '- `free.mjs`', `- Live: \`${live}/\`, \`${live}/hook-dispatch.mjs\``, ''].join('\n') };
      const s = sid('pl');
      const w = (file_path) => decideFence(m,{ session_id: s, agent_id: 'a1', tool_name: 'Write', tool_input: { file_path }, cwd: '/' }, { plan });
      const b = (command) => decideFence(m,{ session_id: s, agent_id: 'a1', tool_name: 'Bash', tool_input: { command }, cwd: abg.dir }, { plan, classify: () => true });
      const fenced = (x) => /^PLAN FENCE/.test(x ?? '');
      return w(join(abg.dir, 'keep.mjs')) === null && fenced(w(join(oth.dir, 'keep.mjs')))
        && w(join(oth.dir, 'src', 'x.ts')) === null && fenced(w(join(abg.dir, 'src', 'x.ts')))
        && w(join(hub.dir, 'a.mjs')) === null && fenced(w(join(abg.dir, 'a.mjs')))
        && fenced(w(join(abg.dir, 'free.mjs')))
        && /live gate copy/.test(w(join(live, 'hook-dispatch.mjs')) ?? '') && fenced(w(join(live, 'x', 'y.mjs')))
        && fenced(b(`cat keep.mjs > ${live}/hook-dispatch.mjs`)) && b(`cat keep.mjs > ${abg.dir}/keep.mjs`) === null;
    },
  },
  // ---- the review step changes nothing outside the scratchpad (step 186, LESSONS §423) ----
  {
    name: 'an agent whose prompt names the plan\'s review step, which the approval marker records, is refused every write outside the session scratchpad whatever the Files list allows: a Write, an Edit, a NotebookEdit, a Bash line with an output redirect and a git command that writes, each with a refusal naming the review step; its writes in the scratchpad, its readers and its reads pass',
    guards: ['review_fence_wired', 'review_fence_record', 'review_fence_step', 'review_fence_files', 'review_fence_notebook', 'review_fence_redirect', 'review_fence_git', 'review_fence_pad', 'review_fence_named', 'review_fence_transcript'],
    run(m, dir) {
      const r = repo({ 'keep.mjs': 'x\n' });
      mkdirSync(join(r.dir, 'tools'));
      // Step 2 is the review step, as the marker recorded it; the Files list allows keep.mjs, src/ and docs/notes.md, and Commands allows git commit, git push and node tools/.
      const plan = { ...fencePlan(basename(r.dir)), review: [2] };
      const s = sid('rv');
      const pad = `/tmp/claude-0/-home-user/${s}/scratchpad`;
      const call = (tool_name, tool_input, step = 2, p = plan) => decideFence(m, { session_id: s, agent_id: 'a1', tool_name, tool_input, cwd: r.dir }, { plan: p, step });
      const named = (x) => /^PLAN FENCE/.test(x ?? '') && /review step/.test(x) && /step 2/.test(x);
      const write = (file_path, step, p) => call('Write', { file_path }, step, p);
      const bash = (command, step, p) => call('Bash', { command }, step, p);
      const refusedForReview = [
        write(join(r.dir, 'keep.mjs')), write(join(r.dir, 'src', 'x.ts')), write(join(r.dir, 'docs', 'notes.md')), write(join(r.dir, 'other.mjs')),
        call('Edit', { file_path: join(r.dir, 'keep.mjs') }), call('MultiEdit', { file_path: join(r.dir, 'src', 'x.ts') }), call('NotebookEdit', { notebook_path: join(r.dir, 'docs', 'notes.md') }),
        bash('node tools/a.mjs > src/out.txt'), bash(`node tools/a.mjs > ${r.dir}/keep.mjs`), bash('node tools/a.mjs >> docs/notes.md 2>&1'),
        bash(`git -C ${r.dir} commit -m x`), bash('git push origin staging'), bash('git commit -m x'), bash('git -c core.hooksPath=/dev/null commit -m x'),
        bash('git status; git push origin staging'), bash('git log | git commit -F -'),
      ];
      const passForReview = [
        write(`${pad}/progress/step-2-report.txt`), write(`${pad}/scratch/owner-messages.mjs`), call('Edit', { file_path: `${pad}/scratch/owner-messages.mjs` }),
        call('NotebookEdit', { notebook_path: `${pad}/scratch/n.ipynb` }),
        bash(`node tools/a.mjs > ${pad}/out.txt`), bash('cat keep.mjs 2>/dev/null'), bash(`git -C ${r.dir} log --oneline`), bash('git status'), bash('git diff'), bash('git log --format=%s -n 5'),
        call('Read', { file_path: join(r.dir, 'keep.mjs') }),
      ];
      const badNamed = refusedForReview.filter((x) => !named(x)).length;
      const badPass = passForReview.filter((x) => x !== null).length;
      // Through the hook, the plan fence finds the review agent by its own transcript: the prompt it was sent names step 3, which the marker recorded as the review step.
      // The Files list allows everything below an absolute folder, so only the review rule can refuse the write.
      const target = tmp('sg-rvt-');
      const planText = reviewPlan(dir).replace('`keep.mjs`, `src/`, `docs/notes.md`', `\`${target}/\``);
      const w = reviewWorld(dir, [turn(0, GO)]);
      writeFileSync(w.plan, planText);
      writeFileSync(join(w.subs, 'agent-rv3.jsonl'), jsonl([at({ type: 'user', message: { role: 'user', content: `${w.plan} step 3` } }, later(-300)),
        at(tool(0, 'rv3-rules', 'Read', { file_path: join(dir, 'agent-rules.md') }), later(-299)), at(result(0, 'rv3-rules', '1\tRules version: 1'), later(-298))]));
      writeFileSync(join(w.home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan: w.plan, hash: sha256(planText), review: [3] }));
      const hooked = (tool_name, tool_input) => w.call('PreToolUse', { session_id: sid('rt'), agent_id: 'rv3', tool_name, tool_input });
      const hookWrite = hooked('Write', { file_path: join(target, 'x.txt'), content: 'x' });
      const hookRedirect = hooked('Bash', { command: `git status > ${target}/out.txt` });
      return badNamed === 0 && badPass === 0
        && hookWrite.status === 2 && /PLAN FENCE/.test(hookWrite.stderr) && /review step/.test(hookWrite.stderr) && /step 3/.test(hookWrite.stderr)
        && hookRedirect.status === 2 && /review step/.test(hookRedirect.stderr);
    },
  },
  {
    name: 'the plan fence is as it was for every agent that is not the review: an agent sent for another step, or any agent when the approval recorded no review step or an empty one, may write under the Files list and run a Commands entry, a write outside the Files list is still refused with the Files wording, and the review agent\'s own reads pass',
    guards: ['review_fence_step', 'review_fence_record'],
    run(m, dir) {
      const r = repo({ 'keep.mjs': 'x\n' });
      mkdirSync(join(r.dir, 'tools'));
      const plan = { ...fencePlan(basename(r.dir)), review: [2] };
      const s = sid('rn');
      const call = (tool_name, tool_input, step, p = plan) => decideFence(m, { session_id: s, agent_id: 'a1', tool_name, tool_input, cwd: r.dir }, { plan: p, step });
      const write = (file_path, step, p) => call('Write', { file_path }, step, p);
      const bash = (command, step, p) => call('Bash', { command }, step, p);
      const asStepOne = [write(join(r.dir, 'keep.mjs'), 1), write(join(r.dir, 'src', 'x.ts'), 1), bash('node tools/a.mjs > src/out.txt', 1), bash('git commit -m x', 1), bash('git push origin staging', 1)];
      const noRecord = [write(join(r.dir, 'keep.mjs'), 2, { ...plan, review: [] }), write(join(r.dir, 'keep.mjs'), 2, { ...plan, review: null }), bash('git commit -m x', 2, fencePlan(basename(r.dir)))];
      const unknownStep = [write(join(r.dir, 'keep.mjs'), null)];
      const reads = [call('Read', { file_path: join(r.dir, 'keep.mjs') }, 2), bash('git status', 2), bash('git diff', 2)];
      // Through the hook: an agent sent for step 1 writes below the folder the Files list names, and with a marker that recorded no review step the agent sent for step 3 does too.
      const target = tmp('sg-rvt-');
      const planText = reviewPlan(dir).replace('`keep.mjs`, `src/`, `docs/notes.md`', `\`${target}/\``);
      const w = reviewWorld(dir, [turn(0, GO)]);
      writeFileSync(w.plan, planText);
      const agentFor = (id, n) => writeFileSync(join(w.subs, `agent-${id}.jsonl`), jsonl([at({ type: 'user', message: { role: 'user', content: `${w.plan} step ${n}` } }, later(-300)),
        at(tool(0, `${id}-rules`, 'Read', { file_path: join(dir, 'agent-rules.md') }), later(-299)), at(result(0, `${id}-rules`, '1\tRules version: 1'), later(-298))]));
      const marker = (extra) => writeFileSync(join(w.home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan: w.plan, hash: sha256(planText), ...extra }));
      const hookWrite = (id) => w.call('PreToolUse', { session_id: sid('rt'), agent_id: id, tool_name: 'Write', tool_input: { file_path: join(target, 'x.txt'), content: 'x' } });
      agentFor('rv3', 3);
      agentFor('bd1', 1);
      marker({ review: [3] });
      const builder = hookWrite('bd1');
      marker({ review: [] });
      const emptyRecord = hookWrite('rv3');
      marker({});
      const oldMarker = hookWrite('rv3');
      return asStepOne.every((x) => x === null) && noRecord.every((x) => x === null) && unknownStep.every((x) => x === null) && reads.every((x) => x === null)
        // A write outside the Files list is still the Files list's refusal for an agent that is not the review.
        && /outside the Files list/.test(write(join(r.dir, 'other.mjs'), 1) ?? '') && /outside the Files list/.test(write(join(r.dir, 'other.mjs'), 2, { ...plan, review: [] }) ?? '')
        && builder.status === 0 && emptyRecord.status === 0 && oldMarker.status === 0;
    },
  },
  {
    name: 'hook-dispatch runs the plan fence for an agent',
    guards: ['fence_wired'],
    run(m, dir) {
      const w = world(dir);
      const o = w.call('PreToolUse', { session_id: sid('fw'), agent_id: 'a1', tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'stray.txt'), content: 'x' } });
      return o.status === 2 && /PLAN FENCE/.test(o.stderr);
    },
  },

  // ---- doctrine-read-guard.mjs ----
  {
    name: 'while the doctrine is due the main thread may only read; Read results on the hub\'s DOCTRINE.md after the marker covering every line clear it, and no other copy does',
    guards: ['doctrine_refuse', 'doctrine_cover', 'doctrine_after', 'doctrine_hub'],
    run(m) {
      const hub = tmp('sg-hub-');
      writeFileSync(join(hub, 'DOCTRINE.md'), 'one\ntwo\nthree\nfour\nfive\n');
      writeFileSync(join(hub, 'hook-dispatch.mjs'), '');
      // A copy shaped like the hub, gate file beside it and all: it is not the hub's.
      const stray = tmp('sg-stray-');
      writeFileSync(join(stray, 'DOCTRINE.md'), 'one\ntwo\nthree\nfour\nfive\n');
      writeFileSync(join(stray, 'hook-dispatch.mjs'), '');
      const s = sid('dr');
      const p = (tool_name, extra = {}) => ({ session_id: s, tool_name, tool_input: {}, ...extra });
      const no = (q) => false, yes = (q) => true;
      const doctrine = join(hub, 'DOCTRINE.md');
      const decide = (q, entries, classify) => m.doctrine.decide(q, entries, { classify, doctrine });
      const read = (id, file, start, n, when, withFile = true) => [
        { type: 'assistant', timestamp: when, message: { role: 'assistant', content: [{ type: 'tool_use', id, name: 'Read', input: { file_path: file } }] } },
        { type: 'user', timestamp: when, message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content: Array.from({ length: n }, (_, k) => `${start + k}\tline`).join('\n') }] },
          ...(withFile ? { toolUseResult: { type: 'text', file: { filePath: file, content: 'x', startLine: start, numLines: n, totalLines: 5 } } } : {}) },
      ];
      const line = m.doctrine.markDue({ session_id: s, source: 'compact' });
      const dueFile = join(process.env.DOCTRINE_DUE_DIR, `${s}.json`);
      const doc = doctrine;
      const refusal = decide(p('Bash'), [], no) ?? '';
      const refusesWrite = /^DOCTRINE GATE/.test(refusal) && refusal.includes(doc);
      const readPasses = decide(p('Read'), [], yes) === null;
      const agentPasses = decide(p('Bash', { agent_id: 'a1' }), [], no) === null;
      const agentToolRefused = /^DOCTRINE GATE/.test(decide(p('Agent'), [], yes) ?? '');
      const partial = decide(p('Bash'), [...read('r1', doc, 1, 3, later(5))], no);
      const old = decide(p('Bash'), [...read('r2', doc, 1, 5, new Date(Date.now() - 60000).toISOString())], no);
      const wrongFile = decide(p('Bash'), [...read('r3', join(stray, 'DOCTRINE.md'), 1, 5, later(5))], no);
      const stillDue = existsSync(dueFile);
      const full = decide(p('Bash'), [...read('r4', doc, 1, 3, later(5)), ...read('r5', doc, 4, 2, later(6), false)], no);
      // The line printed at SessionStart names the hub's own copy.
      const named = /^DOCTRINE DUE/.test(line) && !line.includes('\n') && line.includes(m.doctrine.HUB_DOCTRINE);
      return refusesWrite && readPasses && agentPasses && agentToolRefused && !!partial && !!old && !!wrongFile && stillDue
        && full === null && !existsSync(dueFile) && named;
    },
  },
  {
    name: 'every SessionStart makes the doctrine due and prints one line naming the hub\'s copy, and hook-dispatch holds the main thread to reads until it is read',
    guards: ['doctrine_due', 'doctrine_wired', 'doctrine_line'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('dd');
      const compact = w.call('SessionStart', { session_id: s, source: 'compact' });
      const due = existsSync(join(process.env.DOCTRINE_DUE_DIR, `${s}.json`));
      const read = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan } });
      const agent = w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const startup = w.call('SessionStart', { session_id: sid('dd'), source: 'startup' });
      // Exactly one line about the doctrine, and it names the DOCTRINE.md beside
      // the running gate: the copy under test here, the hub clone in a session.
      const oneLine = (out, how) => {
        const lines = String(out ?? '').split('\n').filter((l) => /DOCTRINE/.test(l));
        return lines.length === 1 && /^DOCTRINE DUE/.test(lines[0]) && lines[0].includes(join(dir, 'DOCTRINE.md')) && lines[0].includes(how);
      };
      return due && read.status === 0 && agent.status === 2 && /DOCTRINE GATE/.test(agent.stderr)
        && compact.status === 0 && oneLine(compact.stdout, 'was compacted') && startup.status === 0 && oneLine(startup.stdout, 'started');
    },
  },

  {
    name: 'a startup, a clear and a compaction make every line of the doctrine due: a part of it clears nothing, a whole read timed before the marker clears nothing, and the line printed and the refusal name the lines and their number, or every line alone where the file cannot be counted',
    guards: ['doctrine_compact_full', 'doctrine_startup_full', 'doctrine_lines_line', 'doctrine_lines_refusal', 'doctrine_marker_source'],
    run(m) {
      const hub = tmp('sg-hub-');
      const doc = join(hub, 'DOCTRINE.md');
      // Twelve lines of text and a final newline: thirteen as the harness records them, the empty text after the newline
      // being the last (the live clone's file has 2549 lines of text and every Read of it recorded 2550). The bound this
      // replaced would have made the middle eight of them due after a compaction.
      writeFileSync(doc, Array.from({ length: 12 }, (_, i) => `line ${i + 1}`).join('\n') + '\n');
      const N = 13;
      const absent = join(hub, 'ABSENT.md');
      const s = sid('db');
      const after = (k) => later(5 + k);
      // The refusal for a Bash call after the given reads of the file, or null once they clear the marker.
      const gate = (source, entries, file = doc) => {
        m.doctrine.markDue({ session_id: s, source }, file);
        return m.doctrine.decide({ session_id: s, tool_name: 'Bash', tool_input: {} }, entries, { classify: () => false, doctrine: file });
      };
      const refused = (r, text) => typeof r === 'string' && /^DOCTRINE GATE/.test(r) && r.includes(text);
      const sources = ['startup', 'clear', 'compact'];
      const cleared = sources.every((src) => gate(src, fileReads(doc, N, [[1, N]], after)) === null && gate(src, fileReads(doc, N, [[1, 7], [8, N - 7]], after)) === null);
      // The old bound's lines, a part short at either end, and the whole file read before the marker.
      const bound = sources.map((src) => gate(src, fileReads(doc, N, [[3, 8]], after)));
      const shortFirst = sources.map((src) => gate(src, fileReads(doc, N, [[2, N - 1]], after)));
      const shortLast = sources.map((src) => gate(src, fileReads(doc, N, [[1, N - 1]], after)));
      const early = sources.map((src) => gate(src, fileReads(doc, N, [[1, N]])));
      const named = (rs) => rs.every((r) => refused(r, `every line (lines 1 to ${N})`) && r.includes(doc));
      const compact = m.doctrine.markDue({ session_id: s, source: 'compact' }, doc);
      const started = m.doctrine.markDue({ session_id: s, source: 'startup' }, doc);
      const resumed = m.doctrine.markDue({ session_id: s, source: 'resume' }, doc);
      const recorded = JSON.parse(readFileSync(join(process.env.DOCTRINE_DUE_DIR, `${s}.json`), 'utf8')).source;
      const printed = (l, how) => /^DOCTRINE DUE/.test(l) && !l.includes('\n') && l.includes(how) && l.includes(`every line (lines 1 to ${N})`) && l.includes(doc);
      // A file whose lines cannot be counted: every line, with no number to give.
      const blind = m.doctrine.markDue({ session_id: s, source: 'compact' }, absent);
      const blindRefusal = gate('compact', [], absent);
      return cleared
        && named(bound) && named(shortFirst) && named(shortLast) && named(early)
        && printed(compact, 'was compacted') && printed(started, 'started') && printed(resumed, 'was resumed') && recorded === 'resume'
        && /^DOCTRINE DUE/.test(blind) && blind.includes('every line') && !blind.includes('lines 1 to')
        && refused(blindRefusal, 'every line') && !blindRefusal.includes('lines 1 to');
    },
  },
  {
    name: 'a resume owes nothing when the Read results since its last compaction cover every line of the doctrine: the line printed says it is held, the first call runs and the marker is gone; a compaction after the same reads is not held',
    guards: ['doctrine_resume_decide', 'doctrine_held_line', 'doctrine_compact_full', 'doctrine_count_convention'],
    run(m) {
      const hub = tmp('sg-hub-');
      const doc = join(hub, 'DOCTRINE.md');
      writeFileSync(doc, Array.from({ length: 12 }, (_, i) => `line ${i + 1}`).join('\n') + '\n');
      const s = sid('rh');
      const marker = join(process.env.DOCTRINE_DUE_DIR, `${s}.json`);
      // Twelve lines of text and a final newline are thirteen lines as the harness records them (see the case above).
      // A startup that read the file, a compaction, and the whole file read again in two parts after it.
      const entries = [...fileReads(doc, 13, [[1, 13]], (k) => ts(1 + k)), boundary(10), summary(11), ...fileReads(doc, 13, [[1, 5], [6, 8]], (k) => ts(12 + k))];
      const tr = transcript(entries);
      const line = m.doctrine.markDue({ session_id: s, source: 'resume', transcript_path: tr }, doc);
      const written = existsSync(marker) && JSON.parse(readFileSync(marker, 'utf8')).source === 'resume';
      const first = m.doctrine.decide({ session_id: s, tool_name: 'Bash', tool_input: {} }, entries, { classify: () => false, doctrine: doc });
      const gone = !existsSync(marker);
      // The same transcript at a compaction: the reads came before the start fired, so every line is still due.
      const compact = m.doctrine.markDue({ session_id: s, source: 'compact', transcript_path: tr }, doc);
      const compacted = m.doctrine.decide({ session_id: s, tool_name: 'Bash', tool_input: {} }, entries, { classify: () => false, doctrine: doc });
      return /^DOCTRINE HELD/.test(line) && !line.includes('\n') && line.includes('none is due') && line.includes('13 lines') && line.includes(doc)
        && written && first === null && gone
        && /^DOCTRINE DUE/.test(compact) && typeof compacted === 'string' && /^DOCTRINE GATE/.test(compacted) && existsSync(marker);
    },
  },
  {
    name: 'a resume after a part read owes every line: the line printed says it is due, the first call is refused naming every line and their number, and reading the rest clears it',
    guards: ['doctrine_held_any', 'doctrine_cover', 'doctrine_lines_refusal'],
    run(m) {
      const hub = tmp('sg-hub-');
      const doc = join(hub, 'DOCTRINE.md');
      writeFileSync(doc, Array.from({ length: 12 }, (_, i) => `line ${i + 1}`).join('\n') + '\n');
      const s = sid('rp');
      const marker = join(process.env.DOCTRINE_DUE_DIR, `${s}.json`);
      // The first seven lines read twice: the same part again covers nothing more. The file counts thirteen lines.
      const part = fileReads(doc, 13, [[1, 7], [1, 7]]);
      const line = m.doctrine.markDue({ session_id: s, source: 'resume', transcript_path: transcript(part) }, doc);
      const call = (entries) => m.doctrine.decide({ session_id: s, tool_name: 'Bash', tool_input: {} }, entries, { classify: () => false, doctrine: doc });
      const refused = call(part);
      const rest = [...part, ...fileReads(doc, 13, [[8, 6]], (k) => ts(10 + k))];
      return /^DOCTRINE DUE/.test(line) && line.includes('was resumed') && line.includes('every line (lines 1 to 13)') && !line.includes('none is due')
        && typeof refused === 'string' && /^DOCTRINE GATE/.test(refused) && refused.includes('every line (lines 1 to 13)') && refused.includes(doc) && existsSync(marker)
        && call(rest) === null && !existsSync(marker);
    },
  },
  {
    name: 'a resume whose only whole read came before the last compaction owes every line, because the compaction replaced that read with a summary; the whole file read after it clears the marker',
    guards: ['doctrine_held_boundary'],
    run(m) {
      const hub = tmp('sg-hub-');
      const doc = join(hub, 'DOCTRINE.md');
      writeFileSync(doc, Array.from({ length: 12 }, (_, i) => `line ${i + 1}`).join('\n') + '\n');
      const s = sid('rb');
      const marker = join(process.env.DOCTRINE_DUE_DIR, `${s}.json`);
      // The whole file read (thirteen lines as the harness counts them), then a compaction, then five lines of it.
      const entries = [...fileReads(doc, 13, [[1, 13]], (k) => ts(1 + k)), boundary(10), summary(11), ...fileReads(doc, 13, [[1, 5]], (k) => ts(12 + k))];
      const line = m.doctrine.markDue({ session_id: s, source: 'resume', transcript_path: transcript(entries) }, doc);
      const call = (list) => m.doctrine.decide({ session_id: s, tool_name: 'Bash', tool_input: {} }, list, { classify: () => false, doctrine: doc });
      const refused = call(entries);
      const whole = [...entries, ...fileReads(doc, 13, [[6, 8]], (k) => ts(20 + k))];
      return /^DOCTRINE DUE/.test(line) && line.includes('every line (lines 1 to 13)')
        && typeof refused === 'string' && /^DOCTRINE GATE/.test(refused) && existsSync(marker)
        && call(whole) === null && !existsSync(marker);
    },
  },
  {
    name: 'a resume holds the doctrine only as it stands: a result recorded when the file had another length counts for nothing, and a file whose lines cannot be counted is due in full',
    guards: ['doctrine_held_current', 'doctrine_uncountable', 'doctrine_count_convention'],
    run(m) {
      const hub = tmp('sg-hub-');
      const doc = join(hub, 'DOCTRINE.md');
      writeFileSync(doc, Array.from({ length: 12 }, (_, i) => `line ${i + 1}`).join('\n') + '\n');
      const absent = join(hub, 'ABSENT.md');
      const resumeLine = (entries, file) => m.doctrine.markDue({ session_id: sid('rc'), source: 'resume', transcript_path: transcript(entries) }, file);
      // Lines 1 to 5 were read when the file had eight lines, lines 6 to 13 after it grew to thirteen (twelve lines of text and
      // a final newline): together they number every line, and the first part is not the text as it stands.
      const stale = [...fileReads(doc, 13, [[1, 5, 8], [6, 8]])];
      const staleLine = resumeLine(stale, doc);
      const fresh = resumeLine([...fileReads(doc, 13, [[1, 5], [6, 8]])], doc);
      // Results that count the twelve lines of text alone, the way the harness does not: they are of another length, and a
      // guard that counted so would find every real result stale.
      const textOnly = resumeLine([...fileReads(doc, 12, [[1, 5], [6, 7]])], doc);
      // Every line of a file that cannot be counted: the reads exist, and the guard cannot say they cover it.
      const blindLine = resumeLine(fileReads(absent, 13, [[1, 13]]), absent);
      return /^DOCTRINE DUE/.test(staleLine) && staleLine.includes('every line (lines 1 to 13)')
        && /^DOCTRINE HELD/.test(fresh) && /^DOCTRINE DUE/.test(textOnly)
        && /^DOCTRINE DUE/.test(blindLine) && blindLine.includes('every line') && !blindLine.includes('lines 1 to');
    },
  },
  {
    name: 'a resumed session makes the doctrine due in one line saying it was resumed, and hook-dispatch holds the main thread to reads until it is read',
    guards: ['doctrine_resumed_word'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('dq');
      const resumed = w.call('SessionStart', { session_id: s, source: 'resume' });
      const lines = String(resumed.stdout ?? '').split('\n').filter((l) => /DOCTRINE/.test(l));
      const agent = w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      return resumed.status === 0 && lines.length === 1 && /^DOCTRINE DUE/.test(lines[0]) && lines[0].includes('was resumed') && lines[0].includes(join(dir, 'DOCTRINE.md'))
        && existsSync(join(process.env.DOCTRINE_DUE_DIR, `${s}.json`)) && agent.status === 2 && /DOCTRINE GATE/.test(agent.stderr);
    },
  },

  // ---- session-brief.mjs: the lessons, by start ----
  {
    name: 'the brief prints every lesson title at a startup, and after a compaction or a resume, or where it cannot read the marker, only the count and the folder with the reason on its own line',
    guards: ['brief_bounded', 'brief_resume', 'brief_unreadable', 'brief_startup_full', 'brief_missing_marker', 'brief_no_payload', 'brief_marker_path',
      'brief_sanitize', 'brief_stdin', 'brief_why', 'brief_folder'],
    run(m, dir) {
      const hub = tmp('sg-brief-');
      copyFileSync(join(dir, 'session-brief.mjs'), join(hub, 'session-brief.mjs'));
      mkdirSync(join(hub, 'lessons'));
      const titles = ['001 · The first fixture lesson', '002 · The second fixture lesson', '003 · The third fixture lesson'];
      titles.forEach((t, i) => writeFileSync(join(hub, 'lessons', `00${i + 1}-fixture.md`), `## ${t}\n\n**Enforced by:** JUDGEMENT\n`));
      const brief = (payload) => spawnSync('node', [join(hub, 'session-brief.mjs'), '--repo', hub], { input: payload === null ? '' : JSON.stringify(payload), encoding: 'utf8', timeout: 20000 });
      // A marker written by the real guard, under a session id with characters its file name drops.
      const marked = (source) => { const id = `${sid('br')}.x:y`; m.doctrine.markDue({ session_id: id, source }, join(hub, 'DOCTRINE.md')); return id; };
      const titled = (o) => o.status === 0 && titles.every((t) => o.stdout.includes(t));
      const countOnly = (o, reason) => o.status === 0 && !titles.some((t) => o.stdout.includes(t)) && o.stdout.includes('LESSONS (3)')
        && o.stdout.includes(`${join(hub, 'lessons')}/`) && o.stdout.split('\n').some((l) => l.startsWith('  Titles are not printed: ') && l.includes(reason));
      const startup = brief({ session_id: marked('startup'), source: 'startup' });
      const cleared = brief({ session_id: marked('clear'), source: 'clear' });
      const compact = brief({ session_id: marked('compact'), source: 'compact' });
      const resume = brief({ session_id: marked('resume'), source: 'resume' });
      const noMarker = brief({ session_id: sid('br') });
      const noPayload = brief(null);
      return titled(startup) && startup.stdout.includes('titles only') && titled(cleared)
        && countOnly(compact, 'was compacted') && countOnly(resume, 'was resumed')
        && countOnly(noMarker, 'is not there') && countOnly(noPayload, 'no SessionStart payload');
    },
  },

  // ---- the state-claim gate (stop-guard.mjs, Doctrine §0e rule 15) ----
  {
    name: 'a reply saying what state something is in is refused when no tool result came back this turn; a read in the turn, or "I think" with the check offered, passes',
    guards: ['claim_refuse', 'claim_read', 'claim_turn', 'claim_hook_result', 'claim_error_result', 'claim_think', 'claim_ask', 'claim_question'],
    run(m, dir) {
      // A real commit id, read with `git log` in the hub on 2026-10-03.
      const SHA = 'b279a08';
      const say = (entries) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: sid('sc'), transcript_path: transcript(entries) }), encoding: 'utf8' });
      const ask = turn(3, 'Where is the hub release?');
      const claim = `Main is at ${SHA}, and step 1's agent has finished.`;
      const read = [tool(4, 'g1', 'Bash', { command: 'git log --oneline -1' }), result(4, 'g1', `${SHA} Stop gate: a queued message from the owner lets the turn end`)];
      const remembered = say([ask, reply(5, claim)]);
      const afterRead = say([ask, ...read, reply(5, claim)]);
      // Read in the turn before: this turn read nothing.
      const lastTurn = say([turn(0, 'Where is it?'), tool(1, 'g0', 'Bash', { command: 'git log --oneline -1' }), result(2, 'g0', `${SHA} Stop gate`), ask, reply(5, claim)]);
      const hookOnly = say([ask, tool(4, 'g2', 'Bash', { command: 'git log' }), result(4, 'g2', 'PreToolUse:Bash hook error: refused for the test'), reply(5, claim)]);
      const errorOnly = say([ask, tool(4, 'g3', 'Bash', { command: 'git log' }), result(4, 'g3', 'fatal: not a git repository', true), reply(5, claim)]);
      const think = say([ask, reply(5, "I think step 1's agent has finished. Shall I read its transcript to check?")]);
      const thinkNoAsk = say([ask, reply(5, "I think step 1's agent has finished.")]);
      const question = say([ask, reply(5, 'Has the workflow finished? Its log is the place to look.')]);
      const conditional = say([ask, reply(5, 'Once the push lands, the deploy follows it.')]);
      const declared = say([ask, reply(5, `Stopping here: open for you is the release.\n${claim}`)]);
      return remembered.status === 2 && remembered.stderr.includes(SHA) && /rule 15/.test(remembered.stderr)
        && afterRead.status === 0 && lastTurn.status === 2 && hookOnly.status === 2 && errorOnly.status === 2
        && think.status === 0 && thinkNoAsk.status === 2 && question.status === 0 && conditional.status === 0 && declared.status === 2;
    },
  },

  // ---- the agents a status prints (report.mjs) ----
  {
    name: 'every status prints each agent that ended since the last one, how it ended and its last entry, once; one still running is read again at the next',
    guards: ['agents_block', 'agents_once', 'agents_interrupt', 'agents_refusal', 'agents_running', 'agents_since'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('ag');
      const proj = join(home, '.claude', 'projects', '-home-user');
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(proj, `${s}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - 10 * 60000, status: 'Status' }));
      const said = (secs, id, name, input) => at(tool(0, id, name, input), later(secs));
      const back = (secs, id, text, err = false) => at(result(0, id, text, err), later(secs));
      const lines = (entries) => entries.map((e) => JSON.stringify(e)).join('\n') + '\n';
      const agent = (id, entries, meta = {}) => {
        writeFileSync(join(subs, `agent-${id}.jsonl`), lines(entries));
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step for ${id}`, ...meta }));
      };
      agent('reported', [said(-300, 'r1', 'Bash', { command: 'git status' }), back(-299, 'r1', 'nothing to commit'),
        said(-298, 'r2', 'SubagentHandback', { message: 'Step two is built and its suite passes.' }), back(-297, 'r2', 'Report delivered to your caller.')]);
      agent('cutoff', [said(-200, 'c1', 'Bash', { command: 'node build.mjs' }),
        at({ type: 'user', message: { role: 'user', content: [{ type: 'text', text: '[Request interrupted by user for tool use]' }] } }, later(-199))], { stoppedByUser: true });
      agent('refused', [said(-150, 'f1', 'Edit', { file_path: '/x' }), back(-149, 'f1', 'PreToolUse:Edit hook error: PLAN FENCE refused the test edit', true),
        said(-148, 'f2', 'SubagentHandback', { message: 'Stopped at a refusal of the edit.' }), back(-147, 'f2', 'Report delivered to your caller.')]);
      agent('running', [said(-10, 'n1', 'Bash', { command: 'node long.mjs' }), back(-9, 'n1', 'step one of three')]);
      agent('older', [said(-1300, 'o1', 'SubagentHandback', { message: 'Ended before the last status.' }), back(-1299, 'o1', 'Report delivered to your caller.')]);
      const status = () => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the agents test'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: s } }).stdout ?? '';
      const item = (out, id) => out.split('\n- ').find((x) => x.startsWith(`${id} `)) ?? '';
      const first = status();
      const second = status();
      // The running agent hands back: the next status prints it, and only it.
      appendFileSync(join(subs, 'agent-running.jsonl'), lines([said(-5, 'n2', 'SubagentHandback', { message: 'The long run is done.' }), back(-4, 'n2', 'Report delivered to your caller.')]));
      const third = status();
      return /by a report\./.test(item(first, 'reported')) && item(first, 'reported').includes('Step two is built')
        && /by an interruption\./.test(item(first, 'cutoff')) && item(first, 'cutoff').includes('node build.mjs')
        && /by a refusal\./.test(item(first, 'refused')) && item(first, 'refused').includes('Stopped at a refusal')
        && item(first, 'running') === '' && item(first, 'older') === ''
        && /Agents ended since the last status: none\./.test(second)
        && /by a report\./.test(item(third, 'running')) && item(third, 'running').includes('The long run is done')
        && item(third, 'reported') === '' && item(third, 'cutoff') === '';
    },
  },
  {
    name: 'every status prints each running agent\'s latest progress note, and flags one older than five minutes or missing; an ended agent is not listed',
    guards: ['progress_block', 'progress_stale', 'progress_latest', 'progress_running', 'progress_missing', 'progress_step'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('pn');
      const proj = join(home, '.claude', 'projects', '-home-user');
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(proj, `${s}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - 4 * 60000, status: 'Status' }));
      // The scratchpad sits where the harness puts it, under the temp directory.
      const temp = tmp('sg-tmp-');
      const notes = join(temp, 'claude-0', '-home-user', s, 'scratchpad', 'progress');
      mkdirSync(notes, { recursive: true });
      const said = (secs, id, name, input) => at(tool(0, id, name, input), later(secs));
      const back = (secs, id, text) => at(result(0, id, text), later(secs));
      const sent = (secs, prompt) => at({ type: 'user', message: { role: 'user', content: prompt } }, later(secs));
      const agent = (id, entries) => {
        writeFileSync(join(subs, `agent-${id}.jsonl`), entries.map((e) => JSON.stringify(e)).join('\n') + '\n');
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step for ${id}` }));
      };
      agent('fresh', [sent(-600, '/plans/gate-test.md step 2'), said(-10, 'p1', 'Bash', { command: 'node build.mjs' }), back(-9, 'p1', 'built')]);
      agent('stale', [sent(-900, '/plans/gate-test.md step 3'), said(-20, 's1', 'Bash', { command: 'node walk.mjs' })]);
      agent('silent', [sent(-300, '/plans/gate-test.md 4'), said(-30, 'q1', 'Read', { file_path: '/etc/hostname' }), back(-29, 'q1', 'host')]);
      agent('done', [sent(-500, '/plans/gate-test.md step 5'), said(-40, 'd1', 'SubagentHandback', { message: 'Step five is built.' }), back(-39, 'd1', 'Report delivered to your caller.')]);
      writeFileSync(join(notes, 'step-2.txt'), '10:01 step 2: reading the gates\n10:04 step 2: suite running, 30 of 58\n');
      writeFileSync(join(notes, 'step-3.txt'), '09:50 step 3: walks started\n');
      const tenAgo = (Date.now() - 10 * 60000) / 1000;
      utimesSync(join(notes, 'step-3.txt'), tenAgo, tenAgo);
      writeFileSync(join(notes, 'step-5.txt'), '10:02 step 5: done\n');
      const out = spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the progress test'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: s, TMPDIR: temp } }).stdout ?? '';
      // The progress block only: the refusals block that follows lists ended agents too.
      const block = out.slice(Math.max(0, out.indexOf('Running agents'))).split("Agents' hook refusals")[0];
      const item = (id) => block.split('\n- ').find((x) => x.startsWith(`agent ${id} `)) ?? '';
      const fresh = item('fresh'), stale = item('stale'), silent = item('silent');
      return out.includes('Running agents, each with the latest line of its progress note:')
        && fresh.includes('step 2: written') && fresh.includes('suite running, 30 of 58') && !fresh.includes('reading the gates') && !/FLAGGED/.test(fresh)
        && /FLAGGED, the note is older than five minutes/.test(stale) && stale.includes('walks started')
        && /FLAGGED, no progress note/.test(silent) && silent.includes('step-4.txt')
        && item('done') === '';
    },
  },
  {
    name: 'every status prints, for each agent running or ended since the last status, every hook refusal it received and its last tool result, read from its own transcript and never from what it said',
    guards: ['reads_block', 'reads_refusal', 'reads_last', 'reads_running', 'reads_ended', 'reads_prose'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('rd');
      const proj = join(home, '.claude', 'projects', '-home-user');
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(proj, `${s}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - 10 * 60000, status: 'Status' }));
      const said = (secs, id, name, input) => at(tool(0, id, name, input), later(secs));
      const back = (secs, id, text, err = false) => at(result(0, id, text, err), later(secs));
      const agent = (id, entries) => {
        writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl(entries));
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step for ${id}` }));
      };
      // Ended, refused twice by hooks, then handed back what it had.
      agent('refusedtwice', [said(-300, 'f1', 'Bash', { command: 'cd /x && git push' }), back(-299, 'f1', 'PreToolUse:Bash hook error: [node hook-dispatch.mjs]: PLAN FENCE refused the cd', true),
        said(-298, 'f2', 'Write', { file_path: '/home/user/stray.txt' }), back(-297, 'f2', 'PreToolUse:Write hook error: [node hook-dispatch.mjs]: PLAN FENCE refused the stray write', true),
        said(-296, 'f3', 'SubagentHandback', { message: 'Stopped at two refusals.' }), back(-295, 'f3', 'Report delivered to your caller.')]);
      // Ended, says in its own words that it was refused, and was not: no tool result carries a refusal.
      agent('onlyprose', [at({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'The push gate refused my push twice, so I stopped.' }] } }, later(-200)),
        said(-199, 'p1', 'Bash', { command: 'git status' }), back(-198, 'p1', 'nothing to commit, working tree clean'),
        said(-197, 'p2', 'SubagentHandback', { message: 'The push gate refused my push twice.' }), back(-196, 'p2', 'Report delivered to your caller.')]);
      // Running, refused once, then ran something that returned.
      agent('stillgoing', [said(-60, 's1', 'Edit', { file_path: '/x' }), back(-59, 's1', 'PreToolUse:Edit hook error: [node hook-dispatch.mjs]: PLAN FENCE refused the edit outside the Files list', true),
        said(-20, 's2', 'Bash', { command: 'node --check hook-dispatch.mjs' }), back(-19, 's2', 'syntax ok')]);
      // Ended before the last status: not listed.
      agent('older', [said(-1300, 'o1', 'SubagentHandback', { message: 'Ended before the last status.' }), back(-1299, 'o1', 'Report delivered to your caller.')]);
      const out = spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the refusals test'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: s } }).stdout ?? '';
      const block = out.slice(Math.max(0, out.indexOf("Agents' hook refusals"))).split('Approval state')[0];
      const item = (id) => block.split('\n- ').find((x) => x.startsWith(`agent ${id} `)) ?? '';
      const twice = item('refusedtwice'), prose = item('onlyprose'), going = item('stillgoing');
      return block.includes("never from what it said")
        && /\(ended by a refusal\): 2 hook refusals\./.test(twice) && twice.includes('PLAN FENCE refused the cd') && twice.includes('PLAN FENCE refused the stray write')
        && /Refused at \d\d:\d\d \(California\), Bash: /.test(twice) && /Refused at \d\d:\d\d \(California\), Write: /.test(twice) && /Last tool result, SubagentHandback/.test(twice) && twice.includes('Report delivered to your caller.')
        && /\(ended by a report\): no hook refusals\./.test(prose) && /Last tool result, SubagentHandback/.test(prose) && !prose.includes('Refused at')
        && /\(running\): 1 hook refusal\./.test(going) && going.includes('refused the edit outside the Files list') && /Last tool result, Bash/.test(going) && going.includes('syntax ok')
        && item('older') === '';
    },
  },

  // ---- the wait between statuses (report.mjs --wait, hook-dispatch.mjs) ----
  {
    name: 'the wait returns when a running agent\'s progress note changes, when an agent ends, or at its limit, and at once when nothing runs; it prints what it saw and records nothing, so the next status still prints the ended agent',
    guards: ['wait_note', 'wait_end', 'wait_limit', 'wait_idle', 'wait_records_nothing'],
    async run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('wt');
      const proj = join(home, '.claude', 'projects', '-home-user');
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(proj, `${s}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      const temp = tmp('sg-tmp-');
      const notes = join(temp, 'claude-0', '-home-user', s, 'scratchpad', 'progress');
      mkdirSync(notes, { recursive: true });
      const said = (secs, id, name, input) => at(tool(0, id, name, input), later(secs));
      const back = (secs, id, text) => at(result(0, id, text), later(secs));
      const sent = (secs, prompt) => at({ type: 'user', message: { role: 'user', content: prompt } }, later(secs));
      const agent = (id, entries) => {
        writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl(entries));
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step for ${id}` }));
      };
      const handBack = (id, text) => appendFileSync(join(subs, `agent-${id}.jsonl`), jsonl([said(-1, `${id}-h`, 'SubagentHandback', { message: text }), back(0, `${id}-h`, 'Report delivered to your caller.')]));
      const env = (limit) => ({ HOME: home, CLAUDE_CODE_SESSION_ID: s, TMPDIR: temp, REPORT_WAIT_MS: String(limit), REPORT_WAIT_POLL_MS: '100' });
      agent('busy', [sent(-60, '/plans/gate-test.md step 2'), said(-10, 'b1', 'Bash', { command: 'node build.mjs' }), back(-9, 'b1', 'built')]);
      writeFileSync(join(notes, 'step-2.txt'), '10:01 step 2: building\n');
      // A progress note changes.
      const pa = waitRun(dir, env(8000));
      await settle();
      appendFileSync(join(notes, 'step-2.txt'), '10:05 step 2: suite running, 12 of 61\n');
      const a = await pa;
      // The agent ends.
      const pb = waitRun(dir, env(8000));
      await settle();
      handBack('busy', 'Step two is built and its suite passes.');
      const b = await pb;
      const status = spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — after the wait'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: s, TMPDIR: temp } }).stdout ?? '';
      // Nothing changes: the wait returns at its limit.
      agent('slow', [sent(-60, '/plans/gate-test.md step 3'), said(-10, 's1', 'Bash', { command: 'node walk.mjs' }), back(-9, 's1', 'walking')]);
      writeFileSync(join(notes, 'step-3.txt'), '10:06 step 3: walks started\n');
      const c = await waitRun(dir, env(1500), 6000);
      // Nothing runs: the wait returns at once.
      handBack('slow', 'Step three is done.');
      const d = await waitRun(dir, env(8000), 6000);
      return a.code === 0 && a.ms < 6000 && a.out.includes('Progress notes written since the wait began')
        && a.out.includes('suite running, 12 of 61') && !a.out.includes('building') && a.out.includes('This wait records nothing')
        && b.code === 0 && b.ms < 6000 && b.out.includes('Ended since the wait began') && /agent busy .*by a report\./.test(b.out)
        && b.out.includes('Step two is built')
        && /- busy .*by a report\./.test(status) && status.includes('Step two is built')
        && c.code === 0 && c.ms >= 1400 && /passed; no running agent's progress note changed and no agent ended/.test(c.out)
        && c.out.includes('walks started')
        && d.code === 0 && d.ms < 3000 && /nothing to wait on/.test(d.out);
    },
  },
  {
    name: 'the wait returns the moment a running agent is refused by a hook, printing the refusal from the agent\'s own transcript, though no note changed and no agent ended',
    guards: ['wait_refused'],
    async run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('wr');
      const proj = join(home, '.claude', 'projects', '-home-user');
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(proj, `${s}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      const temp = tmp('sg-tmp-');
      const notes = join(temp, 'claude-0', '-home-user', s, 'scratchpad', 'progress');
      mkdirSync(notes, { recursive: true });
      const said = (secs, id, name, input) => at(tool(0, id, name, input), later(secs));
      const back = (secs, id, text, err = false) => at(result(0, id, text, err), later(secs));
      const sent = (secs, prompt) => at({ type: 'user', message: { role: 'user', content: prompt } }, later(secs));
      writeFileSync(join(subs, 'agent-busy.jsonl'), jsonl([sent(-60, '/plans/gate-test.md step 2'), said(-10, 'b1', 'Bash', { command: 'node build.mjs' }), back(-9, 'b1', 'built')]));
      writeFileSync(join(subs, 'agent-busy.meta.json'), JSON.stringify({ agentType: 'general-purpose', description: 'Plan step for busy' }));
      writeFileSync(join(notes, 'step-2.txt'), '10:01 step 2: building\n');
      const env = { HOME: home, CLAUDE_CODE_SESSION_ID: s, TMPDIR: temp, REPORT_WAIT_MS: '8000', REPORT_WAIT_POLL_MS: '100' };
      const p = waitRun(dir, env);
      await settle();
      // A hook refuses the agent's next call; the progress note is left alone and the agent keeps running.
      appendFileSync(join(subs, 'agent-busy.jsonl'), jsonl([said(-1, 'b2', 'Bash', { command: 'cd /x && make' }),
        back(0, 'b2', 'PreToolUse:Bash hook error: [node hook-dispatch.mjs]: PLAN FENCE refused a cd in the command', true)]));
      const r = await p;
      return r.code === 0 && r.ms < 6000 && r.out.includes('Refused by a hook since the wait began')
        && r.out.includes('PLAN FENCE refused a cd in the command') && r.out.includes('agent busy') && !r.out.includes('Progress notes written');
    },
  },
  {
    name: 'the manager fence passes the wait, exactly: this hub\'s report.mjs and --wait, nothing chained, never quoted as a status',
    guards: ['fence_wait', 'fence_wait_exact', 'report_no_flag', 'report_no_flag1'],
    run(m, dir) {
      const w = world(dir);
      const bash = (command) => w.call('PreToolUse', { session_id: sid('fwt'), tool_name: 'Bash', tool_input: { command } });
      const r = join(dir, 'report.mjs');
      const plain = bash(`node ${r} --wait`);
      const quotedPath = bash(`node "${r}" --wait`);
      const chained = bash(`node ${r} --wait; touch ${join(w.cwd, 'x')}`);
      const piped = bash(`node ${r} --wait | tee ${join(w.cwd, 'x')}`);
      const other = bash(`node ${join(w.cwd, 'report.mjs')} --wait`);
      const asStatus = bash(`node ${r} "--wait"`);
      const asStatus1 = bash(`node ${r} '--wait'`);
      const fenced = (x) => x.status === 2 && /MANAGER FENCE/.test(x.stderr);
      return plain.status === 0 && quotedPath.status === 0
        && fenced(chained) && fenced(piped) && fenced(other) && fenced(asStatus) && fenced(asStatus1);
    },
  },

  // ---- choice first (stop-guard.mjs) ----
  {
    name: 'a reply whose recommended option sits under other text is refused; one that opens with its choice, or has no marked option, passes',
    guards: ['choice_first', 'choice_marked_only', 'choice_open_lines', 'choice_once'],
    run(m, dir) {
      const say = (text) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: sid('cf'), transcript_path: transcript([turn(0, 'Which way?'), reply(5, text)]) }), encoding: 'utf8' });
      const choice = '1. (Recommended) Land the gates as they are built.\n2. Hold them for a second review.';
      const report = 'The fence gained a check for every cd.\nThe guard gained a test for each plant.\nThe suite covers each check named in the plan.';
      const opens = say(`Open for you, one choice:\n${choice}\n\n${report}`);
      const declared = say(`Stopping here: open for you is one choice.\nWhich comes first?\n1. **Land now (recommended).** The gates go in as built.\n2. **Review first.** A second reviewer reads them.\n\n${report}`);
      const plainList = say(`${report}\n\nWhat changed:\n1. The fence gained a check.\n2. The guard gained a test.`);
      const under = say(`${report}\n\nOpen for you:\n${choice}`);
      const nested = say(`${report}\n\n1. Which comes first?\n   - Land now (recommended).\n   - Review first.`);
      const twice = say(`Open for you:\n${choice}\n\n${report}\n\nThe same choice again:\n${choice}`);
      return opens.status === 0 && declared.status === 0 && plainList.status === 0
        && under.status === 2 && /choice is not the first thing/.test(under.stderr) && under.stderr.includes('Land the gates')
        && nested.status === 2 && twice.status === 2;
    },
  },

  // ---- held work (pending-guard.mjs, hook-dispatch.mjs) ----
  {
    name: 'a call refused while an owner message waits is held, printed at the top of the turn that delivers the message when that message ends with a go-word, and printed once; a message that does not leaves it held',
    guards: ['held_record', 'held_dedup', 'held_owner_only', 'held_clear', 'held_print', 'held_first', 'held_go_only'],
    run(m, dir) {
      const w = world(dir, [turn(0, 'start'), enq(10, GO)]);
      const s = sid('hw');
      const edit = { file_path: w.plan, old_string: 'Make the thing.', new_string: 'Make the thing well.' };
      const refused = w.call('PreToolUse', { session_id: s, tool_name: 'Edit', tool_input: edit });
      const retried = w.call('PreToolUse', { session_id: s, tool_name: 'Edit', tool_input: edit });
      const note = w.call('UserPromptSubmit', { session_id: s, prompt: NOTE });
      // A harness prompt releases nothing and clears nothing, read straight from the guard.
      const harness = m.pending.releaseHeld({ session_id: s, prompt: NOTE });
      // A correction is not a go-word: the held call stays held.
      const correction = w.call('UserPromptSubmit', { session_id: s, prompt: ASK });
      const delivered = w.call('UserPromptSubmit', { session_id: s, prompt: GO });
      // The next message ends with a go-word too, so the held call would be printed
      // again if the file were not cleared after the first delivery.
      const next = w.call('UserPromptSubmit', { session_id: s, prompt: 'One more thing, unrelated to that, so ok.' });
      const out = delivered.stdout ?? '';
      return refused.status === 2 && retried.status === 2 && note.status === 0 && !/HELD WORK/.test(note.stdout ?? '') && harness === ''
        && correction.status === 0 && !/HELD WORK/.test(correction.stdout ?? '') && /OWNER MESSAGE/.test(correction.stdout ?? '')
        && /^HELD WORK/.test(out) && out.includes('Make the thing well.') && /main thread/.test(out)
        && (out.match(/--- held /g) ?? []).length === 1 && out.indexOf('HELD WORK') < out.indexOf('OWNER MESSAGE')
        && next.status === 0 && !/HELD WORK/.test(next.stdout ?? '');
    },
  },
  {
    name: 'a call refused while an owner message waits does not latch: once the message is delivered the held call runs, with no second owner message',
    guards: ['held_no_latch'],
    run(m, dir) {
      const w = world(dir, [turn(0, 'start'), enq(10, GO)]);
      const s = sid('hn');
      const page = join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad', 'status', 'fix-run.html');
      const write = { session_id: s, tool_name: 'Write', tool_input: { file_path: page, content: '<p>status</p>' } };
      const refused = w.call('PreToolUse', write);
      const notLatched = !latched(s);
      // The session ends its turn; the message is delivered as the next prompt.
      appendFileSync(w.tr, [deq(20), turn(20, GO)].map((e) => JSON.stringify(e)).join('\n') + '\n');
      const delivered = w.call('UserPromptSubmit', { session_id: s, prompt: GO });
      const again = w.call('PreToolUse', write);
      return refused.status === 2 && /pending-guard/.test(refused.stderr) && notLatched
        && /^HELD WORK/.test(delivered.stdout ?? '') && again.status === 0 && !latched(s);
    },
  },

  // ---- an approval pressed in the app (approved-plan-guard.mjs, hook-dispatch.mjs) ----
  {
    name: 'the owner\'s exit from plan mode in the app records the approval from its entry, once; a tool-approved exit, an exit with no plan mode before it, or a plan written after the exit records none',
    guards: ['app_mint', 'app_tool_approved', 'app_in_plan', 'app_changed_after', 'app_judged_once', 'app_exits_protect'],
    run(m, dir) {
      const read = { tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } };
      const build = { tool_name: 'Bash', tool_input: { command: 'node tools/build.mjs' } };
      const sha = (t) => createHash('sha256').update(t).digest('hex');
      // In the app, after the session entered plan mode with the tool.
      const A = appHome(dir);
      const ua = uid();
      const trA = transcript([turn(0, 'start'), ...enterPlan(-60), ...exitPlan(-20, false), exitEntry(-19, A.plan, ua)]);
      const readA = A.guard(trA, read);
      const mkA = A.mk();
      const minted = readA.status === 0 && mkA?.appExit === ua && mkA.plan === A.plan && mkA.hash === sha(STEPS_PLAN) && A.outcome(ua) === 'recorded';
      const buildA = A.guard(trA, build);
      // --done ends the approved work, and the same exit does not record it again.
      const done = spawnSync('node', [join(dir, 'approved-plan-guard.mjs'), '--done'], { encoding: 'utf8', env: { ...process.env, HOME: A.home } });
      const readA2 = A.guard(trA, read);
      const buildA2 = A.guard(trA, build);
      // The owner put plan mode on in the app too: a plan_mode entry and no tool call.
      const B = appHome(dir);
      const ub = uid();
      const trB = transcript([turn(0, 'start'), planOn(-60, B.plan), ...exitPlan(-20, false), exitEntry(-19, B.plan, ub)]);
      B.guard(trB, read);
      const mintedB = B.mk()?.appExit === ub;
      // The tool's own approval: --mark records that one, and its exit entry records nothing.
      const C = appHome(dir);
      const uc = uid();
      const trC = transcript([turn(0, 'start'), ...enterPlan(-60), ...exitPlan(-20, true), exitEntry(-19, C.plan, uc)]);
      C.guard(trC, read);
      // An exit with no start of plan mode before it in the transcript.
      const D = appHome(dir);
      const ud = uid();
      const trD = transcript([turn(0, 'start'), ...exitPlan(-20, false), exitEntry(-19, D.plan, ud)]);
      D.guard(trD, read);
      // The plan written after the exit is not the plan the owner left plan mode on.
      const E = appHome(dir);
      const ue = uid();
      const trE = transcript([turn(0, 'start'), ...enterPlan(-60), ...exitPlan(-20, false), exitEntry(-19, E.plan, ue)]);
      writeFileSync(E.plan, `${STEPS_PLAN}\nEdited after the exit.\n`);
      const buildE = E.guard(trE, build);
      // The record of judged exits is the owner's, like the marker.
      const writeJudged = B.guard(trB, { tool_name: 'Write', tool_input: { file_path: B.judged, content: '{"judged":{}}' } });
      return minted && buildA.status === 0
        && done.status === 0 && readA2.status === 0 && !existsSync(A.marker) && buildA2.status === 2
        && mintedB
        && !existsSync(C.marker) && C.outcome(uc) === "not the owner's exit"
        && !existsSync(D.marker) && D.outcome(ud) === "not the owner's exit"
        && !existsSync(E.marker) && E.outcome(ue) === 'changed after' && buildE.status === 2 && /was written after that/.test(buildE.stdout)
        && writeJudged.status === 2 && /written only by the owner's approval/.test(writeJudged.stdout);
    },
  },
  {
    name: 'after an approval pressed in the app the main thread does not enter plan mode again, and the refusal does not latch; once the owner writes again or an agent is sent, it may',
    guards: ['app_reentry', 'app_reentry_no_latch', 'app_release_owner', 'app_release_agent'],
    run(m, dir) {
      const setUp = (after) => {
        const w = world(dir);
        rmSync(join(w.home, '.claude', 'APPROVED-PLAN.json'));
        const hourAgo = (Date.now() - 3600000) / 1000;
        utimesSync(w.plan, hourAgo, hourAgo);
        const u = uid();
        writeFileSync(w.tr, jsonl([turn(0, GO), ...enterPlan(-60), ...exitPlan(-20, false), exitEntry(-19, w.plan, u), ...after(w)]));
        return { ...w, u };
      };
      const enter = (w, s) => w.call('PreToolUse', { session_id: s, tool_name: 'EnterPlanMode', tool_input: {} });
      // Nothing since the exit but a status.
      const w1 = setUp(() => [at(tool(0, 'st', 'Bash', { command: 'node report.mjs "Status"' }), later(-10)), at(result(0, 'st', 'Status 10:00'), later(-9))]);
      const s1 = sid('ax');
      const again = enter(w1, s1);
      const mk1 = (() => { try { return JSON.parse(readFileSync(join(w1.home, '.claude', 'APPROVED-PLAN.json'), 'utf8')); } catch { return null; } })();
      const readAfter = w1.call('PreToolUse', { session_id: s1, tool_name: 'Read', tool_input: { file_path: w1.plan } });
      // The owner wrote again after the exit (a go-word: any other message is a
      // correction, and a correction refuses every main-thread call).
      const w2 = setUp(() => [owner(later(-5), 'ok')]);
      const wrote = enter(w2, sid('ax'));
      // An agent was sent under the plan.
      const w3 = setUp((w) => [at(tool(0, 'ag', 'Agent', { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' }), later(-5))]);
      const sent = enter(w3, sid('ax'));
      return again.status === 2 && /APPROVED IN THE APP/.test(again.stderr) && !latched(s1)
        && mk1?.appExit === w1.u && readAfter.status === 0
        && wrote.status === 0 && sent.status === 0;
    },
  },

  // ---- the dispatcher judges the owner's exit first (hook-dispatch.mjs, approved-plan-guard.mjs) ----
  {
    name: 'an agent sent as the first call after the owner\'s exit from plan mode in the app passes the dispatch gate: the dispatcher judges the exit and records the marker before any gate reads it',
    guards: ['dispatch_judge_exit'],
    run(m, dir) {
      const w = world(dir);
      const marker = join(w.home, '.claude', 'APPROVED-PLAN.json');
      rmSync(marker);
      const hourAgo = (Date.now() - 3600000) / 1000;
      utimesSync(w.plan, hourAgo, hourAgo);
      const u = uid();
      writeFileSync(w.tr, jsonl([turn(0, GO), ...enterPlan(-60), ...exitPlan(-20, false), exitEntry(-19, w.plan, u)]));
      const send = w.call('PreToolUse', { session_id: sid('je'), tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      let mk = null;
      try { mk = JSON.parse(readFileSync(marker, 'utf8')); } catch { mk = null; }
      // The same first call, with the plan written after the exit: no marker, and the gate refuses.
      const x = world(dir);
      rmSync(join(x.home, '.claude', 'APPROVED-PLAN.json'));
      const u2 = uid();
      writeFileSync(x.tr, jsonl([turn(0, GO), ...enterPlan(-60), ...exitPlan(-20, false), exitEntry(-19, x.plan, u2)]));
      const stale = x.call('PreToolUse', { session_id: sid('je'), tool_name: 'Agent', tool_input: { prompt: `${x.plan} step 1`, subagent_type: 'general-purpose' } });
      return send.status === 0 && mk?.appExit === u && mk.plan === w.plan
        && stale.status === 2 && /DISPATCH GATE[\s\S]*No approved plan/.test(stale.stderr) && /Marker: none/.test(stale.stderr);
    },
  },

  // ---- a correction from the owner ends the turn (hook-dispatch.mjs) ----
  {
    name: 'while the owner\'s newest message does not end with a go-word, every main-thread action is refused except the status command and TaskStop, without latching and without quoting it, and the refusal says what passes; a message whose last word is a go-word lifts it, and agents are not held by it',
    guards: ['correction_refuse', 'correction_go', 'correction_status', 'correction_taskstop', 'correction_no_latch', 'correction_agents', 'correction_midturn', 'go_words', 'go_last_word', 'correction_says'],
    run(m, dir) {
      const WRONG = 'That was done wrong, so answer me before anything else.';
      const w = world(dir, [turn(0, GO), turn(5, WRONG)]);
      const s = sid('co');
      const call = (extra) => w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan }, ...extra });
      // An agent sent for the plan's own step: an action the dispatch gate would pass, held by the correction alone.
      // It is the probe for every "is a correction standing" question below, never a read of the plan: a read of
      // the record passes a correction (the next case), so a read cannot tell a standing correction from none.
      const send = { tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } };
      const refused = call(send);
      const write = call({ tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x' } });
      const enter = call({ tool_name: 'EnterPlanMode', tool_input: {} });
      const noLatch = !latched(s);
      const status = call({ tool_name: 'Bash', tool_input: { command: `node "${join(dir, 'report.mjs')}" "Status 10:00 — a correction stands"` } });
      const stop = call({ tool_name: 'TaskStop', tool_input: { task_id: 'bxyz789' } });
      // An agent's read of a file outside the record: held by the correction only if agents were held by it, so it
      // is the probe for "agents are not held". A read of the plan would pass either way, and the plant would be missed.
      const agent = call({ agent_id: 'a1', tool_input: { file_path: '/etc/hostname' } });
      const wait = call({ tool_name: 'Bash', tool_input: { command: `node ${join(dir, 'report.mjs')} --wait` } });
      // A go-word as the next prompt lifts it, with punctuation and case set aside.
      const lift = (text, entry) => { appendFileSync(w.tr, jsonl([entry ?? turn(10, text)])); return call(send).status; };
      const afterGo = lift('Go.');
      // A message delivered between tool calls is the owner's newest message too.
      const midWrong = lift('', mid(12, 'Not that one, the other one.'));
      const midGo = lift('', mid(14, 'continue'));
      // The LAST word decides: "go ahead and do it" ends in "it", and a go-word
      // inside a message is not its last word. Every word of the list is one.
      const goAhead = lift('go ahead and do it');
      const goInside = lift('go and fix the other one too');
      const words = ['go', 'OK!', 'continue', 'Approved.', 'Yes'].map((t) => lift(t));
      // The owner's own go messages carry words before the go-word.
      const longer = ['All of that, go.', 'Fine, approved', 'looks right to me - yes!', 'That reads right, and I agree.\nContinue'].map((t) => lift(t));
      // A task notification, a scheduled message and an agent's hand-back are not the owner's.
      const note = { type: 'user', timestamp: ts(30), origin: { kind: 'task-notification' }, message: { role: 'user', content: 'The long run finished; nothing else is open.' } };
      const sched = { type: 'user', timestamp: ts(31), origin: { kind: 'scheduled' }, message: { role: 'user', content: 'Scheduled check: is the deploy done?' } };
      const peer = mid(32, '[Subagent hand-back] Step one is built.', 'peer');
      const notOwner = lift('', note) === 0 && lift('', sched) === 0 && lift('', peer) === 0;
      const said = refused.stderr ?? '';
      return refused.status === 2 && /CORRECTION \(Doctrine §0e rule 3\)/.test(said) && said.includes('go, ok, continue, approved, yes')
        && /a read of the record \(/.test(said) && /the status command and TaskStop pass/.test(said)
        && !said.includes('done wrong') && !said.includes('answer me before')
        && write.status === 2 && /CORRECTION/.test(write.stderr) && enter.status === 2 && /CORRECTION/.test(enter.stderr) && noLatch
        && status.status === 0 && stop.status === 0 && agent.status === 0 && wait.status === 2 && /CORRECTION/.test(wait.stderr)
        && afterGo === 0 && midWrong === 2 && midGo === 0 && goAhead === 2 && goInside === 2 && words.every((x) => x === 0)
        && longer.every((x) => x === 0) && notOwner;
    },
  },
  {
    name: 'a read of the record passes a standing correction and does not latch, so a question is answered from a file in the turn it is asked; an agent dispatch, a write and a read of anything but the record are refused with the correction\'s words, and the go-word then lifts it',
    guards: ['correction_read', 'correction_read_record', 'correction_read_only'],
    run(m, dir) {
      const WRONG = 'That was done wrong, so answer me before anything else.';
      const w = world(dir, [turn(0, GO), turn(5, WRONG)]);
      const s = sid('cr');
      const src = repo({ 'NOTES.md': 'n', 'app.ts': 'x' }, 'corrfix');
      const pad = `/tmp/claude-0/-home-user/${s}/scratchpad`;
      const call = (extra) => w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan }, ...extra });
      const held = (r) => r.status === 2 && /CORRECTION/.test(r.stderr);
      const send = { tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } };
      // The record: the approved plan, this session's transcript, a scratchpad note, a repository's NOTES.md, a Bash cat of the plan, a Grep of it.
      const reads = [call({}), call({ tool_input: { file_path: w.tr } }), call({ tool_input: { file_path: join(src.dir, 'NOTES.md') } }),
        call({ tool_input: { file_path: `${pad}/progress/step-1.txt` } }), call({ tool_name: 'Bash', tool_input: { command: `cat ${w.plan}` } }),
        call({ tool_name: 'Grep', tool_input: { pattern: 'Build', path: w.plan } })];
      const passed = reads.every((r) => r.status === 0) && !latched(s);
      // Not the record, or not a read: held by the correction, with its words, and the refusal does not latch.
      const refused = [call(send), call({ tool_input: { file_path: join(src.dir, 'app.ts') } }), call({ tool_input: { file_path: '/etc/hostname' } }),
        call({ tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x' } }),
        call({ tool_name: 'Bash', tool_input: { command: `cat ${join(src.dir, 'app.ts')}` } })];
      const held5 = refused.every(held) && !latched(s);
      // The go-word lifts it: the dispatch that was held now passes.
      appendFileSync(w.tr, jsonl([turn(10, GO)]));
      const lifted = call(send).status === 0;
      return passed && held5 && lifted;
    },
  },
  {
    name: 'a correction found in a transcript that cannot be read comes from the record UserPromptSubmit wrote; the record never overrides a readable one, and a harness prompt is not recorded',
    guards: ['correction_fallback', 'correction_record'],
    run(m, dir) {
      const w = world(dir);
      // An agent sent for the plan's own step: an action, which only a correction holds.
      const lost = (s) => w.call('PreToolUse', { session_id: s, transcript_path: join(w.cwd, 'missing.jsonl'), tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } }).status;
      const s1 = sid('cf');
      w.call('UserPromptSubmit', { session_id: s1, prompt: 'That was wrong; explain it.' });
      const wrong = lost(s1);
      const s2 = sid('cf');
      w.call('UserPromptSubmit', { session_id: s2, prompt: 'go' });
      const go = lost(s2);
      const s3 = sid('cf');
      const none = lost(s3);
      // A task notification is not the owner's prompt: nothing is recorded for it.
      const s4 = sid('cf');
      w.call('UserPromptSubmit', { session_id: s4, prompt: NOTE });
      const notified = lost(s4);
      // A readable transcript with no correction in it is not overridden by an older record.
      const s5 = sid('cf');
      w.call('UserPromptSubmit', { session_id: s5, prompt: 'That was wrong; explain it.' });
      const w5 = world(dir, [turn(0, GO)]);
      const readable = w5.call('PreToolUse', { session_id: s5, tool_name: 'Agent', tool_input: { prompt: `${w5.plan} step 1`, subagent_type: 'general-purpose' } }).status;
      return wrong === 2 && go === 0 && none === 0 && notified === 0 && readable === 0;
    },
  },
  {
    name: 'a correction is found however far back the owner\'s newest message sits: a transcript tail that widens finds one written before three megabytes of tool output',
    guards: ['correction_widen'],
    run(m, dir) {
      const big = 'x'.repeat(3 * 1024 * 1024);
      const w = world(dir, [turn(0, GO), turn(5, 'That was done wrong; answer me first.'), tool(6, 'b1', 'Bash', { command: 'cat big' }), result(7, 'b1', big)]);
      const r = w.call('PreToolUse', { session_id: sid('cw'), tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      return r.status === 2 && /CORRECTION/.test(r.stderr);
    },
  },
  {
    name: 'the reminder at an owner message asks for what is being done now, and carries neither what comes next nor a five-minute status line',
    guards: ['reminder_wording'],
    run(m, dir) {
      const w = world(dir);
      const out = w.call('UserPromptSubmit', { session_id: sid('rm'), prompt: 'go' }).stdout ?? '';
      return /First line: what you are doing now\./.test(out) && !/what comes next/i.test(out) && !/five minutes/i.test(out) && /OWNER MESSAGE/.test(out) && /open for the owner/.test(out);
    },
  },

  // ---- a message the harness never delivered (pending-guard.mjs, hook-dispatch.mjs) ----
  {
    name: 'a message the counts call pending stops holding work once an owner message typed AFTER it has arrived, by its enqueue time and not its arrival time; one typed before a delivered message, a harness message and a message nobody delivered yet do not release it',
    guards: ['overtaken_filter', 'overtaken_typed', 'given_enqueue_time', 'given_unenqueued', 'given_owner_only'],
    run(m) {
      const LOST = 'Why was the third walk skipped? Answer before anything else.';
      const LATER = 'Also give me the count of walks that ran, please, in the next reply.';
      const NEXT = 'And one more thing for the record, typed after the second one.';
      const decide = (entries) => m.pending.decide({ session_id: 't' }, entries);
      // The queue lost LOST (its enqueue has no dequeue) while LATER, typed after it, was dequeued and delivered.
      const asPrompt = decide([turn(0, 'start'), enq(10, LOST), enq(20, LATER), deq(30), turn(30, LATER)]);
      const between = decide([turn(0, 'start'), enq(10, LOST), enq(20, LATER), deq(30), mid(30, LATER)]);
      // In order: LOST is delivered, LATER (typed after it) still waits and still holds work.
      const inOrder = decide([turn(0, 'start'), enq(10, LOST), enq(20, LATER), deq(30), turn(30, LOST)]);
      // LATER arrives late, at 90, but was typed at 20: a message typed at 50 is still held behind it.
      const lateArrival = decide([turn(0, 'start'), enq(10, LOST), enq(20, LATER), enq(50, NEXT), deq(90), turn(90, LATER)]);
      // A message nothing enqueued (typed while the queue was idle, or delivered in other words) arrives after LOST was typed.
      const unenqueued = decide([turn(0, 'start'), enq(10, LOST), turn(30, 'A message in other words that nothing in the queue carries.')]);
      // A task notification arriving after it is not a message from the owner and releases nothing.
      const note = { type: 'user', timestamp: ts(30), origin: { kind: 'task-notification' }, message: { role: 'user', content: 'The long run finished; nothing else is open.' } };
      const harness = decide([turn(0, 'start'), enq(10, LOST), note]);
      return asPrompt === null && between === null
        && !!inOrder && inOrder.includes(LATER) && !inOrder.includes(LOST)
        && !!lateArrival && lateArrival.includes(NEXT) && !lateArrival.includes(LOST)
        && unenqueued === null
        && !!harness && harness.includes(LOST);
    },
  },
  {
    name: 'an owner message the harness never delivered is printed word for word at the top of the turn of the prompt that overtook it, once, before the reminder; a prompt that is a waiting message itself, or whose own entry is already in the transcript, prints nothing',
    guards: ['skipped_print', 'skipped_once', 'skipped_virtual', 'skipped_already', 'skipped_typed'],
    run(m, dir) {
      const LOST = 'Why was the third walk skipped? Answer before anything else.';
      const LATER = 'Also give me the count of walks that ran, please, in the next reply.';
      const NEXT = 'And one more thing for the record, typed after the second one.';
      // LATER's prompt is being submitted: its enqueue and dequeue are in the transcript, its own entry is not yet.
      const w = world(dir, [turn(0, 'start'), enq(10, LOST), enq(20, LATER), deq(30)]);
      const s = sid('sk');
      const first = w.call('UserPromptSubmit', { session_id: s, prompt: LATER }).stdout ?? '';
      // The prompt's entry lands in the transcript, and a later prompt arrives: LOST was already printed.
      appendFileSync(w.tr, jsonl([turn(30, LATER)]));
      const again = w.call('UserPromptSubmit', { session_id: s, prompt: 'A third message, which has nothing to do with the others.' }).stdout ?? '';
      const printed = /^MESSAGE THE SESSION WAS NEVER GIVEN/.test(first) && first.includes(LOST) && !first.includes(LATER)
        && /sent \d\d:\d\d \(California\)/.test(first) && first.indexOf(LOST) < first.indexOf('OWNER MESSAGE');
      const once = !/NEVER GIVEN/.test(again) && /OWNER MESSAGE/.test(again);
      // The prompt is the FIRST message itself while the second waits: nothing was passed over.
      const w2 = world(dir, [turn(0, 'start'), enq(10, LOST), enq(20, LATER), deq(30)]);
      const carried = w2.call('UserPromptSubmit', { session_id: sid('sk'), prompt: LOST }).stdout ?? '';
      // The prompt's own entry is already in the transcript, and NEXT, typed after it, still waits.
      const w3 = world(dir, [turn(0, 'start'), enq(10, LATER), enq(20, NEXT), deq(25), turn(25, LATER)]);
      const inTranscript = w3.call('UserPromptSubmit', { session_id: sid('sk'), prompt: LATER }).stdout ?? '';
      // A task notification prompt after the passing-over still shows what was passed over.
      const w4 = world(dir, [turn(0, 'start'), enq(10, LOST), enq(20, LATER), deq(30), turn(30, LATER)]);
      const viaNote = w4.call('UserPromptSubmit', { session_id: sid('sk'), prompt: NOTE }).stdout ?? '';
      return printed && once && !/NEVER GIVEN/.test(carried) && !/NEVER GIVEN/.test(inTranscript)
        && /NEVER GIVEN/.test(viaNote) && viaNote.includes(LOST);
    },
  },

  // ---- a turn that ends with steps left (stop-guard.mjs) ----
  {
    name: 'a turn that ends with steps of the approved plan unreturned and no agent running is refused, naming the steps; a returned step, an agent still running, a waiting owner message, a standing correction, a choice that opens the reply, a declared stop with what is open, and no plan in force let it end',
    guards: ['steps_refuse', 'steps_report_only', 'steps_step_read', 'steps_running', 'steps_queued', 'steps_choice', 'steps_declared', 'steps_declared_open', 'steps_correction', 'steps_plan_in_force'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('sl');
      const proj = tmp('sg-proj-');
      const main = join(proj, `${s}.jsonl`);
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      const sent = (n) => at({ type: 'user', message: { role: 'user', content: `${w.plan} step ${n}` } }, later(-300));
      const agent = (id, entries) => {
        writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl(entries));
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step for ${id}` }));
      };
      const returned = (id, n) => agent(id, [sent(n), at(tool(0, `${id}-b`, 'Bash', { command: 'git status' }), later(-200)), at(result(0, `${id}-b`, 'clean'), later(-199)),
        at(tool(0, `${id}-h`, 'SubagentHandback', { message: `Step ${n} is built.` }), later(-100)), at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(-99))]);
      const refusedAt = (id, n) => agent(id, [sent(n), at(tool(0, `${id}-e`, 'Edit', { file_path: '/x' }), later(-200)),
        at(result(0, `${id}-e`, 'PreToolUse:Edit hook error: PLAN FENCE refused the edit', true), later(-199)),
        at(tool(0, `${id}-h`, 'SubagentHandback', { message: `Stopped at a refusal on step ${n}.` }), later(-100)), at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(-99))]);
      const runningFor = (id, n) => agent(id, [sent(n), at(tool(0, `${id}-b`, 'Bash', { command: 'node build.mjs' }), later(-20)), at(result(0, `${id}-b`, 'built'), later(-19))]);
      const clear = () => { for (const f of [...Array(2)].map((_, i) => i + 1)) for (const x of ['a', 'b']) for (const ext of ['.jsonl', '.meta.json']) rmSync(join(subs, `agent-${x}${f}${ext}`), { force: true }); };
      const REPORT = 'Here is the report of what the gates now do, and what each one refuses.';
      const say = (text, entries, home = w.home) => {
        writeFileSync(main, jsonl([...(entries ?? [turn(0, GO)]), reply(5, text)]));
        return spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: s, transcript_path: main }), encoding: 'utf8', env: { ...process.env, HOME: home } });
      };
      // Nothing returned: both steps of the plan are left.
      const none = say(REPORT);
      // Step 1 returned, step 2 not.
      returned('a1', 1);
      const one = say(REPORT);
      // Only step 2 returned: step 1 is the one named.
      clear(); returned('a2', 2);
      const two = say(REPORT);
      // An agent that ended at a refusal returned nothing: its step is still left.
      clear(); returned('a1', 1); refusedAt('a2', 2);
      const refused = say(REPORT);
      // Both returned: nothing is left.
      clear(); returned('a1', 1); returned('a2', 2);
      const all = say(REPORT);
      // An agent still running holds nothing: its completion brings the session back.
      clear(); returned('a1', 1); runningFor('b2', 2);
      const running = say(REPORT);
      // From here step 2 is open again.
      clear(); returned('a1', 1);
      const choice = say('Open for you, one choice:\n1. (Recommended) Land the gates as they are built.\n2. Hold them for a second review.\n\n' + REPORT);
      const declared = say('Stopping here: open for you is the order of the two remaining changes.\n\n' + REPORT);
      // A declaration that says nothing about what is open is not one.
      const bare = say('Stopping here: open for you\n\n' + REPORT);
      const short = say('Stopping here: open for you is it.\n\n' + REPORT);
      const queued = say(REPORT, [turn(0, GO), enq(2, 'Where is the release?')]);
      const correction = say(REPORT, [turn(0, GO), turn(3, 'That was done wrong, so answer me before anything else.')]);
      // No plan in force: a home with no approval marker.
      const bare0 = tmp('sg-home-'); mkdirSync(join(bare0, '.claude'), { recursive: true });
      const noPlan = say(REPORT, undefined, bare0);
      const err = (r) => r.stderr ?? '';
      return none.status === 2 && /STOP REFUSED/.test(err(none)) && err(none).includes('(1, 2)') && /rule 2/.test(err(none)) && /the corrected sentences only/.test(err(none))
        && one.status === 2 && err(one).includes('(2)') && !err(one).includes('(1, 2)')
        && two.status === 2 && err(two).includes('(1)') && !err(two).includes('(1, 2)')
        && refused.status === 2 && err(refused).includes('(2)')
        && all.status === 0 && running.status === 0
        && choice.status === 0 && declared.status === 0
        && bare.status === 2 && /steps? of the approved plan/.test(err(bare)) && short.status === 2
        && queued.status === 0 && correction.status === 0 && noPlan.status === 0;
    },
  },

  // ---- the pointer: which step is next (report.mjs, hook-dispatch.mjs, stop-guard.mjs) ----
  {
    name: 'the pointer is the first number on the plan\'s Order line with no hand-back opening DONE: a REFUSED, FAILED or other first line, an agent that ended at a refusal or an interruption, and a Standing step all leave it where it is, and it is none once every step in Order is DONE',
    guards: ['pointer_order_read', 'pointer_first', 'pointer_done_only', 'pointer_report_only', 'pointer_standing_not_order'],
    run(m) {
      const back = (step, first, how = 'a report') => ({ step, how, at: 1, last: `${first}\nThe second line says what happened.` });
      const ptr = (ends) => m.report.pointerOf(ORDER_PLAN, ends);
      const both = ptr([back(1, 'DONE'), back(2, 'DONE')]);
      return JSON.stringify(m.report.planOrder(ORDER_PLAN)) === JSON.stringify({ order: [1, 2], standing: [3] }) && m.report.planOrder(STEPS_PLAN) === null
        && ptr([]).next === 1 && ptr([back(1, 'DONE')]).next === 2
        && ptr([back(1, 'REFUSED')]).next === 1 && ptr([back(1, 'FAILED')]).next === 1 && ptr([back(1, 'Built it.')]).next === 1
        && ptr([back(1, 'DONE', 'a refusal')]).next === 1 && ptr([back(1, 'DONE', 'an interruption')]).next === 1 && ptr([back(null, 'DONE')]).next === 1
        && ptr([back(3, 'DONE')]).next === 1 && ptr([back(2, 'DONE')]).next === 1
        && both.next === null && !both.done.has(3) && ptr([back(1, 'REFUSED'), back(1, 'DONE')]).next === 2
        && m.report.pointerOf(STEPS_PLAN, [back(1, 'DONE')]) === null;
    },
  },
  {
    name: 'the dispatch gate sends only step N and a Standing step: any other step is refused with N printed, a Standing step passes at any N, and a plan with no Order is judged as before',
    guards: ['dispatch_pointer', 'dispatch_pointer_none', 'dispatch_pointer_prints', 'dispatch_standing'],
    run(m) {
      const back = (step, first, how = 'a report') => ({ step, how, at: 1, last: `${first}\nSecond.` });
      const send = (n, ends, text = ORDER_PLAN) => {
        const plan = { path: '/plans/gate-test.md', text };
        return m.dispatch.managerFence({ session_id: 'dpt', tool_name: 'Agent', tool_input: { prompt: `${plan.path} step ${n}` } },
          { plan, pointer: m.report.pointerOf(text, ends), classify: () => false });
      };
      const gate = (x) => /^DISPATCH GATE/.test(x ?? '');
      const refusedOne = [back(1, 'REFUSED')], oneDone = [back(1, 'DONE')], bothDone = [back(1, 'DONE'), back(2, 'DONE')];
      return send(1, []) === null && gate(send(2, [])) && /next: step 1\b/.test(send(2, [])) && send(3, []) === null
        && send(1, refusedOne) === null && /next: step 1\b/.test(send(2, refusedOne)) && send(3, refusedOne) === null
        && send(2, oneDone) === null && gate(send(1, oneDone)) && /next: step 2\b/.test(send(1, oneDone)) && send(3, oneDone) === null
        && gate(send(1, bothDone)) && /next: none/.test(send(1, bothDone)) && /next: none/.test(send(2, bothDone)) && send(3, bothDone) === null
        && send(1, [], STEPS_PLAN) === null && send(2, [], STEPS_PLAN) === null;
    },
  },
  {
    name: 'hook-dispatch reads N from the session\'s own agents: with none returned only step 1 and the Standing step go, a REFUSED hand-back leaves step 1 next, a DONE one makes step 2 next and refuses step 1, and once step 2 is DONE only the Standing step goes',
    guards: ['dispatch_pointer_read', 'dispatch_pointer', 'dispatch_standing', 'dispatch_pointer_prints'],
    run(m, dir) {
      const w = world(dir, [], ORDER_PLAN);
      const subs = join(w.tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(subs, { recursive: true });
      const ended = new Map();
      const agent = (id, n, first) => {
        ended.set(id, n);
        writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl([at({ type: 'user', message: { role: 'user', content: `${w.plan} step ${n}` } }, later(-300)),
          at(tool(0, `${id}-b`, 'Bash', { command: 'git status' }), later(-200)), at(result(0, `${id}-b`, 'clean'), later(-199)),
          at(tool(0, `${id}-h`, 'SubagentHandback', { message: `${first}\nThe second line.` }), later(-100)), at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(-99))]));
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step ${n}` }));
      };
      // The judgement gate wants each end judged in the manager's notes; this case is about the pointer, so they are.
      const send = (n) => { const s = sid('dq'); const c = {}; for (const k of ended.values()) c[k] = (c[k] ?? 0) + 1; judgedPad(s, c); return w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step ${n}`, subagent_type: 'general-purpose' } }); };
      const three = () => [send(1), send(2), send(3)];
      const ok = (r) => r.status === 0;
      const refusedWith = (r, n) => r.status === 2 && /DISPATCH GATE/.test(r.stderr) && r.stderr.includes(`next: ${n}`);
      const fresh = three();
      agent('r1', 1, 'REFUSED');
      const afterRefused = three();
      agent('d1', 1, 'DONE');
      const afterOne = three();
      agent('d2', 2, 'DONE');
      const afterBoth = three();
      return ok(fresh[0]) && refusedWith(fresh[1], 'step 1') && ok(fresh[2])
        && ok(afterRefused[0]) && refusedWith(afterRefused[1], 'step 1') && ok(afterRefused[2])
        && refusedWith(afterOne[0], 'step 2') && ok(afterOne[1]) && ok(afterOne[2])
        && refusedWith(afterBoth[0], 'none') && refusedWith(afterBoth[1], 'none') && ok(afterBoth[2]);
    },
  },
  {
    name: 'with an Order in the plan, a turn that ends with the pointer at a step is refused naming it: a REFUSED hand-back leaves that step named, a DONE one moves it on, the Standing step holds nothing, and a running agent, a choice or a declared stop lets the turn end',
    guards: ['stop_pointer', 'stop_pointer_named', 'pointer_standing_not_order'],
    run(m, dir) {
      const w = world(dir, [], ORDER_PLAN);
      const s = sid('sp');
      const proj = tmp('sg-proj-');
      const main = join(proj, `${s}.jsonl`);
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      const sent = (n) => at({ type: 'user', message: { role: 'user', content: `${w.plan} step ${n}` } }, later(-300));
      const agent = (id, entries) => {
        writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl(entries));
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step for ${id}` }));
      };
      const handed = (id, n, first) => agent(id, [sent(n), at(tool(0, `${id}-b`, 'Bash', { command: 'git status' }), later(-200)), at(result(0, `${id}-b`, 'clean'), later(-199)),
        at(tool(0, `${id}-h`, 'SubagentHandback', { message: `${first}\nThe second line.` }), later(-100)), at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(-99))]);
      const REPORT = 'Here is the report of what the gates now do, and what each one refuses.';
      const say = (text) => {
        writeFileSync(main, jsonl([turn(0, GO), reply(5, text)]));
        return spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: s, transcript_path: main }), encoding: 'utf8', env: { ...process.env, HOME: w.home } });
      };
      const err = (r) => r.stderr ?? '';
      const none = say(REPORT);
      handed('r1', 1, 'REFUSED');
      const refused = say(REPORT);
      handed('d1', 1, 'DONE');
      const one = say(REPORT);
      agent('b2', [sent(2), at(tool(0, 'b2-b', 'Bash', { command: 'node build.mjs' }), later(-20)), at(result(0, 'b2-b', 'built'), later(-19))]);
      const running = say(REPORT);
      rmSync(join(subs, 'agent-b2.jsonl')); rmSync(join(subs, 'agent-b2.meta.json'));
      const choice = say('Open for you, one choice:\n1. (Recommended) Land the gates as they are built.\n2. Hold them for a second review.\n\n' + REPORT);
      const declared = say('Stopping here: open for you is the order of the two remaining changes.\n\n' + REPORT);
      handed('d2', 2, 'DONE');
      const both = say(REPORT);
      return none.status === 2 && err(none).includes('next: step 1') && /rule 2/.test(err(none)) && /the corrected sentences only/.test(err(none))
        && refused.status === 2 && err(refused).includes('next: step 1') && !err(refused).includes('next: step 2')
        && one.status === 2 && err(one).includes('next: step 2') && !err(one).includes('next: step 1')
        && running.status === 0 && choice.status === 0 && declared.status === 0
        && both.status === 0;
    },
  },
  {
    name: 'every status prints, after the goals, `next: step N` read from the plan\'s Order and the agents\' hand-backs, each step\'s state, the newest hand-back of each step with its lines and its report file\'s path, and the Found lines of every report file, and writes the status page from the same read',
    guards: ['pointer_print', 'pointer_none', 'pointer_undefined', 'pointer_backs', 'pointer_report_path', 'pointer_found', 'pointer_found_read', 'pointer_page', 'pointer_first', 'pointer_done_only', 'pointer_standing_not_order'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('np');
      const proj = join(home, '.claude', 'projects', '-home-user');
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(proj, `${s}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      const plan = join(home, '.claude', 'plans', 'gate-test.md');
      mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
      const marker = join(home, '.claude', 'APPROVED-PLAN.json');
      const approve = (text) => { writeFileSync(plan, text); writeFileSync(marker, JSON.stringify({ plan, hash: createHash('sha256').update(text).digest('hex'), at: new Date().toISOString() })); };
      approve(ORDER_PLAN);
      writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - 10 * 60000, status: 'Status' }));
      const temp = tmp('sg-tmp-');
      const pad = join(temp, 'claude-0', '-home-user', s, 'scratchpad');
      mkdirSync(join(pad, 'progress'), { recursive: true });
      const handed = (id, n, secs, first, second) => {
        writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl([at({ type: 'user', message: { role: 'user', content: `${plan} step ${n}` } }, later(secs - 300)),
          at(tool(0, `${id}-b`, 'Bash', { command: 'git status' }), later(secs - 20)), at(result(0, `${id}-b`, 'clean'), later(secs - 19)),
          at(tool(0, `${id}-h`, 'SubagentHandback', { message: `${first}\n${second}` }), later(secs)), at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(secs + 1))]));
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step ${n}` }));
      };
      const status = () => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the pointer test'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: s, TMPDIR: temp } }).stdout ?? '';
      const page = () => { try { return readFileSync(join(pad, 'status', 'fix-run.html'), 'utf8'); } catch { return ''; } };
      const at1 = (out, a, b) => out.indexOf(a) >= 0 && out.indexOf(a) < out.indexOf(b);
      // Nothing sent: step 1 is next.
      const first = status(), firstPage = page();
      // Step 1 DONE with a report file carrying Found lines; step 2 REFUSED.
      handed('a1', 1, -100, 'DONE', 'The goals are written.');
      handed('a2', 2, -90, 'REFUSED', 'The fence refused the write.');
      writeFileSync(join(pad, 'progress', 'step-1-report.txt'), 'Everything the agent ran.\nFound: the doc check was not run\nFound: a <b>tag</b> in the report\nnot a found line\n');
      const second = status(), secondPage = page();
      // Step 2 handed back again with DONE: every step in Order is done, and the Standing step was never sent.
      handed('a3', 2, -50, 'DONE', 'The check is read.');
      const third = status(), thirdPage = page();
      // A plan with no Order, then no plan in force.
      approve(STEPS_PLAN);
      const noOrder = status();
      rmSync(marker);
      const noPlan = status();
      return /^next: step 1$/m.test(first) && first.includes("Order, each step's state: 1 not sent; 2 not sent.") && first.includes('Standing, sent at any time: 3 not sent.')
        && first.includes('Hand-backs: no step has one yet.') && first.includes('Found, from the report files: none.')
        && at1(first, 'Goals every session serves', 'next: step 1') && at1(first, 'next: step 1', '— the pointer test')
        && firstPage.includes('<title>Plan run status</title>') && firstPage.includes('next: step 1')
        && firstPage.includes('<h2>1. Build <span class="chip held">held, next to send</span></h2>') && firstPage.includes('<h2>2. Check <span class="chip held">held, after step 1</span></h2>')
        && firstPage.includes('<h2>3. Timer <span class="chip held">held, sent at any time</span></h2>')
        && /^next: step 2$/m.test(second) && second.includes("Order, each step's state: 1 DONE; 2 REFUSED.")
        && second.includes('- step 1, ended') && second.includes('    DONE\n    The goals are written.') && second.includes('    REFUSED\n    The fence refused the write.')
        && second.includes(`${join(pad, 'progress', 'step-1-report.txt')} (written)`) && second.includes(`${join(pad, 'progress', 'step-2-report.txt')} (not written)`)
        && second.includes('- step 1 #1 [unsorted]: Found: the doc check was not run') && second.includes('- step 1 #2 [unsorted]: Found: a <b>tag</b> in the report') && !second.includes('not a found line')
        && second.includes('Found, from the report files (2: 0 fixed, 0 stopping the plan, 0 queued, 2 unsorted):')
        && secondPage.includes('next: step 2') && secondPage.includes('<li>2 Found lines are not sorted yet by the manager; the status print lists each.</li>') && !secondPage.includes('in the report')
        && secondPage.includes('<h2>1. Build <span class="chip done">done</span></h2>') && secondPage.includes('<li>Where it stands: DONE</li>')
        && secondPage.includes('<h2>2. Check <span class="chip open">open</span></h2>') && secondPage.includes('<li>Where it stands: REFUSED</li>')
        && /^next: none$/m.test(third) && third.includes("Order, each step's state: 1 DONE; 2 DONE.") && third.includes('Standing, sent at any time: 3 not sent.')
        && third.includes('The check is read.') && !third.includes('The fence refused the write.')
        && thirdPage.includes('next: none') && thirdPage.includes('the plan has run to its end') && thirdPage.includes('The thing may need a second read.')
        && /^next: not defined \(/m.test(noOrder) && /^next: not read \(no plan is in force/m.test(noPlan);
    },
  },

  // ---- the review: a fresh agent clears every move before it goes (Doctrine §0e rules 2, 3 and 13) ----
  {
    name: 'a verdict is the first line of the reviewer\'s hand-back: ON-AIM or OFF-AIM, then ROUTE-CLEAR or ROUTE-REFUSED, then "step N" and "next M"; the older ON-AIM alone, a lower-case opening and any other line are not a verdict',
    guards: ['review_verdict_parse', 'review_verdict_case'],
    run(m) {
      const v = (t) => m.report.parseVerdict(t);
      const ok = v('ON-AIM ROUTE-CLEAR step 12 next 13');
      return ok?.aim === 'ON-AIM' && ok.route === 'ROUTE-CLEAR' && ok.step === 12 && ok.next === 13
        && v('OFF-AIM ROUTE-REFUSED, step 4, next 5')?.aim === 'OFF-AIM' && v('ON-AIM ROUTE-REFUSED step 4 next 5')?.route === 'ROUTE-REFUSED'
        && v('ON-AIM ROUTE-CLEAR step none next 41')?.step === 'none' && v('ON-AIM ROUTE-CLEAR step 3')?.next === null
        && v('ON-AIM step 12') === null && v('ON-AIM') === null && v('Looks fine to me, go ahead.') === null && v('') === null
        && v('on-aim route-clear step 1 next 2') === null && v('ROUTE-CLEAR ON-AIM step 1 next 2') === null;
    },
  },
  {
    name: 'reviewState clears a move only for a review that BEGAN after the newest end of an agent for a step in Order (a DONE hand-back or not, an interruption too), after the plan\'s last write and after the owner\'s newest message; a step outside Order and a hand-back that is not a report for the review step do not move it, and the newest review is the one read',
    guards: ['review_started', 'review_ref_order', 'review_ref_plan', 'review_ref_after', 'review_order_only', 'review_any_end', 'review_reports_only', 'review_newest', 'review_start_unreadable'],
    run(m, dir) {
      const plan = { path: '/plans/gate-test.md', text: reviewPlan(dir) };
      const CLEAR = 'ON-AIM ROUTE-CLEAR step 1 next 2';
      const st = (ends, o = {}) => m.report.reviewState({ session_id: 'rs' }, plan, { ends, planAt: 10, ...o });
      const kind = (ends, o) => st(ends, o).kind;
      const one = endFor(1, 100, 50, 'DONE');
      const cleared = st([one, endFor(3, 200, 150, CLEAR)]);
      return cleared.kind === 'cleared' && cleared.cleared === 2 && cleared.step === 1 && cleared.refAt === 100
        // Began at or before the end it judges: stale. Equal is not after.
        && kind([one, endFor(3, 200, 90, CLEAR)]) === 'stale' && kind([one, endFor(3, 200, 100, CLEAR)]) === 'stale'
        && kind([one, endFor(3, 200, 101, CLEAR)]) === 'cleared'
        // A later end in Order, a REFUSED hand-back and an interruption each move the reference.
        && kind([one, endFor(3, 200, 150, CLEAR), endFor(2, 300, 250, 'DONE')]) === 'stale'
        && kind([endFor(1, 100, 50, 'REFUSED'), endFor(3, 200, 90, CLEAR)]) === 'stale'
        && kind([endFor(1, 100, 50, 'REFUSED'), endFor(3, 200, 150, 'ON-AIM ROUTE-CLEAR step 1 next 1')]) === 'cleared'
        && kind([endFor(1, 100, 50, 'x', 'an interruption'), endFor(3, 200, 90, CLEAR)]) === 'stale'
        // A step outside Order does not move it; a hand-back that is not a report for the review step is no review.
        && kind([one, endFor(9, 500, 400, 'DONE'), endFor(3, 200, 150, CLEAR)]) === 'cleared'
        && kind([one, endFor(3, 200, 150, CLEAR, 'a refusal')]) === 'missing'
        // The plan's last write and the owner's newest message move it too.
        && kind([one, endFor(3, 200, 150, CLEAR)], { planAt: 160 }) === 'stale' && kind([one, endFor(3, 200, 150, CLEAR)], { planAt: 149 }) === 'cleared'
        && kind([one, endFor(3, 200, 150, CLEAR)], { after: 170 }) === 'stale' && kind([one, endFor(3, 200, 150, CLEAR)], { after: 140 }) === 'cleared'
        // The newest review is the one read.
        && kind([one, endFor(3, 200, 150, CLEAR), endFor(3, 400, 350, 'OFF-AIM ROUTE-REFUSED step 1 next 2')]) === 'off-aim'
        // A start that cannot be read is not after anything.
        && kind([one, endFor(3, 200, NaN, CLEAR)]) === 'stale' && kind([one, { ...endFor(3, 200, 0, CLEAR), startAt: undefined }]) === 'stale';
    },
  },
  {
    name: 'reviewState reads the verdict in the reviewer\'s hand-back: ON-AIM ROUTE-CLEAR names the step it clears; OFF-AIM, a refused route, another step judged, a missing "next", an unreadable first line, no review, a review still running and agents that cannot be read each give their own state, and a plan whose Standing step does not follow the hub\'s aim-review.md by its full path is not enforced',
    guards: ['review_off_aim', 'review_route', 'review_wrong_step', 'review_no_next', 'review_not_read', 'review_running', 'review_full_path', 'review_follow'],
    run(m, dir) {
      const text = reviewPlan(dir);
      const plan = { path: '/plans/gate-test.md', text };
      const one = endFor(1, 100, 50, 'DONE');
      const st = (ends, o = {}, p = plan) => m.report.reviewState({ session_id: 'rs' }, p, { ends, planAt: 10, ...o });
      const rv = (first) => st([one, endFor(3, 200, 150, first)]);
      const step3 = (words) => ({ path: '/plans/gate-test.md', text: ORDER_PLAN.replace('3. **Timer.** Wait on the thing.', `3. **Review.** ${words}`) });
      const bare = step3('Follow aim-review.md for the move named on the status page.');
      const elsewhere = step3('Follow /somewhere/else/aim-review.md for the move named on the status page.');
      const noFollow = step3(`Read ${join(dir, 'aim-review.md')} for the move named on the status page.`);
      const first = endFor(3, 200, 150, 'ON-AIM ROUTE-CLEAR step none next 1');
      return rv('OFF-AIM ROUTE-REFUSED step 1 next 2').kind === 'off-aim' && rv('OFF-AIM ROUTE-CLEAR step 1 next 2').kind === 'off-aim'
        && rv('ON-AIM ROUTE-REFUSED step 1 next 2').kind === 'route-refused'
        && rv('ON-AIM ROUTE-CLEAR step 2 next 2').kind === 'wrong-step' && rv('ON-AIM ROUTE-CLEAR step none next 2').kind === 'wrong-step' && rv('ON-AIM ROUTE-CLEAR next 2').kind === 'wrong-step'
        && rv('ON-AIM ROUTE-CLEAR step 1').kind === 'no-next'
        && rv('ON-AIM step 1').kind === 'unreadable' && rv('All is well.').kind === 'unreadable'
        // With no step of Order ended yet there is nothing the verdict's step could be compared with.
        && st([first]).kind === 'cleared' && st([first]).step === null && st([first]).cleared === 1
        && st([one]).kind === 'missing' && st([one], { runningSteps: new Set([3]) }).kind === 'running'
        && st([one, endFor(3, 200, 150, 'ON-AIM ROUTE-CLEAR step 1 next 2')], { runningSteps: new Set([3]) }).kind === 'cleared'
        && st([one, endFor(3, 200, 50, 'ON-AIM ROUTE-CLEAR step 1 next 2')], { runningSteps: new Set([3]) }).kind === 'running'
        && st(null).kind === 'not-read'
        && st([one], {}, { path: '/plans/gate-test.md', text: ORDER_PLAN }).kind === 'not-enforced' && st([one], {}, null).kind === 'not-enforced'
        && st([one], {}, bare).kind === 'not-enforced' && st([one], {}, elsewhere).kind === 'not-enforced' && st([one], {}, noFollow).kind === 'not-enforced'
        && JSON.stringify(m.report.aimReviewSteps(text)) === '[3]' && JSON.stringify(m.report.aimReviewSteps(STEPS_PLAN)) === '[]';
    },
  },
  {
    name: 'the approval\'s scope is the hashes of Goals, Asked, Files, Commands, Rules and Rules of this plan: an edit to Steps, Order or any other section moves none, an edit to one of the six names it, a section added where there was none is a change, and a record that is not an object changes all six',
    guards: ['scope_sections', 'scope_unknown', 'scope_hashes'],
    run(m, dir) {
      const base = scopedPlan(dir);
      const hashes = m.report.scopeHashes(base);
      const moved = (edit) => m.report.scopeChanged(hashes, edit(base));
      const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const all = ['Goals', 'Asked', 'Files', 'Commands', 'Rules', 'Rules of this plan'];
      return eq(Object.keys(hashes), all) && Object.values(hashes).every((h) => /^[0-9a-f]{64}$/.test(h))
        && eq(moved((t) => t), [])
        && eq(moved((t) => t.replace('1. **Build.** Make the thing.', '1. **Build.** Make the thing, and say what it did.')), [])
        && eq(moved((t) => t.replace('Order: 1 2', 'Order: 2 1')), [])
        && eq(moved((t) => t.replace('- The thing may need a second read.', '- The thing may need a third read.')), [])
        && eq(moved((t) => t.replace('`keep.mjs`', '`keep.mjs`, `more.mjs`')), ['Files'])
        && eq(moved((t) => t.replace('- git push', '- git push\n- git reset')), ['Commands'])
        && eq(moved((t) => t.replace('1. The thing is built and read.', '1. The thing is built.')), ['Goals'])
        && eq(moved((t) => t.replace(OWN_WORDS, 'Do something else.')), ['Asked'])
        && eq(moved((t) => t.replace('- git push', '- git push\n- git reset').replace('`keep.mjs`', '`keep.mjs`, `more.mjs`')), ['Files', 'Commands'])
        && eq(m.report.scopeChanged(hashes, base.replace(`## Asked\n${OWN_WORDS}\n\n`, '')), ['Asked'])
        && eq(m.report.scopeChanged(null, base), all) && eq(m.report.scopeChanged('x', base), all);
    },
  },
  {
    name: 'the approval\'s Goals leave out the Served by line: a step added there, or the line dropped, moves none of the four, an edit of any other Goals line or of a second line that begins the same way is still a change of Goals, and a marker recorded before this change, holding the hash of the whole section, still matches while that section stands and loses Goals on an edit of any of its lines, the Served by line included',
    guards: ['scope_served_by', 'scope_goals_rest', 'scope_served_by_first', 'scope_old_marker'],
    run(m, dir) {
      const base = scopedPlan(dir);
      const hashes = m.report.scopeHashes(base);
      const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const SERVED = 'Served by: steps 1, 2 and 3 serve goal 1.';
      const firstBlockLine = GOALS_BLOCK.split('\n')[0];
      // A marker of the old kind: its Goals entry is the hash of the whole section.
      const old = { ...hashes, Goals: createHash('sha256').update(m.report.planSection(base, 'Goals')).digest('hex') };
      const edits = {
        addStep: (t) => t.replace(SERVED, 'Served by: steps 1, 2, 3 and 4 serve goal 1; step 4 serves goal 2.'),
        dropLine: (t) => t.replace(`${SERVED}\n`, ''),
        ownGoal: (t) => t.replace('1. The thing is built and read.', '1. The thing is built.'),
        blockGoal: (t) => t.replace(firstBlockLine, `${firstBlockLine} And more.`),
        secondLine: (t) => t.replace(`${SERVED}\n`, `${SERVED}\nServed by: step 9 serves goal 1.\n`),
        steps: (t) => t.replace('1. **Build.** Make the thing.', '1. **Build.** Make the thing, and say what it did.'),
      };
      const moved = (then, name) => m.report.scopeChanged(then, edits[name](base));
      // The instrument: every edit changes the text, or an edit that moves nothing could be one never made.
      const changes = Object.keys(edits).every((k) => edits[k](base) !== base);
      return changes && firstBlockLine.length > 20
        && eq(m.report.scopeHashes(edits.addStep(base)), hashes) && eq(m.report.scopeHashes(edits.dropLine(base)), hashes)
        && eq(moved(hashes, 'addStep'), []) && eq(moved(hashes, 'dropLine'), []) && eq(moved(hashes, 'steps'), [])
        && eq(moved(hashes, 'ownGoal'), ['Goals']) && eq(moved(hashes, 'blockGoal'), ['Goals']) && eq(moved(hashes, 'secondLine'), ['Goals'])
        && eq(m.report.scopeChanged(old, base), []) && eq(moved(old, 'steps'), [])
        && eq(moved(old, 'ownGoal'), ['Goals']) && eq(moved(old, 'blockGoal'), ['Goals']) && eq(moved(old, 'addStep'), ['Goals']);
    },
  },
  {
    name: 'through approved-plan-guard, the main thread adds a step on the approved plan\'s Served by line with no new approval while an edit of any other Goals line is refused; a marker of the old kind lets a Steps amendment through and is recorded as the new kind by it, and refuses the Served by line and a Goals line until then',
    guards: ['scope_served_by', 'scope_goals_rest', 'scope_old_marker', 'amend_rescope', 'amend_scope_gate'],
    run(m, dir) {
      const sha = (t) => createHash('sha256').update(t).digest('hex');
      const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const text = scopedPlan(dir);
      const ADD = { old_string: 'Served by: steps 1, 2 and 3 serve goal 1.', new_string: 'Served by: steps 1, 2, 3 and 4 serve goal 1; step 4 serves goal 2.' };
      const GOAL = { old_string: '1. The thing is built and read.', new_string: '1. The thing is built.' };
      const STEP = { old_string: '1. **Build.** Make the thing.', new_string: '1. **Build.** Make the thing, and say what it did.' };
      // The owner's approval through the tool: the marker records the plan's hash and its scope.
      const approve = (A) => {
        writeFileSync(A.plan, text);
        const tr = transcript([turn(0, 'start')]);
        A.guard(tr, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: text, isAgent: false, filePath: A.plan } }, '--mark');
        return tr;
      };
      const call = (A, tr, input, flag) => A.guard(tr, { tool_name: 'Edit', tool_input: { file_path: A.plan, ...input }, ...(flag ? { hook_event_name: 'PostToolUse' } : {}) }, flag);
      const refused = (r, re) => r.status === 2 && re.test(r.stdout);
      const statusOf = (Z) => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the served-by test'], { encoding: 'utf8', env: { ...process.env, HOME: Z.home, CLAUDE_CODE_SESSION_ID: '' } }).stdout ?? '';
      // A marker of the new kind: a step is added on the Served by line, and the marker follows the file.
      const A = appHome(dir);
      const trA = approve(A);
      const scopeA = A.mk()?.scope;
      const addPre = call(A, trA, ADD);
      writeFileSync(A.plan, text.replace(ADD.old_string, ADD.new_string));
      const addPost = call(A, trA, ADD, '--amend');
      const mkA = A.mk();
      const goalA = call(A, trA, GOAL);
      const statusA = statusOf(A);
      // A marker of the old kind, holding the hash of the whole Goals section.
      const B = appHome(dir);
      const trB = approve(B);
      writeFileSync(B.marker, JSON.stringify({ ...B.mk(), scope: { ...B.mk().scope, Goals: sha(m.report.planSection(text, 'Goals')) } }));
      const addOld = call(B, trB, ADD);
      const goalOld = call(B, trB, GOAL);
      const stepOld = call(B, trB, STEP);
      writeFileSync(B.plan, text.replace(STEP.old_string, STEP.new_string));
      call(B, trB, STEP, '--amend');
      const mkB = B.mk();
      const addAfter = call(B, trB, ADD);
      return same(Object.keys(scopeA ?? {}), ['Goals', 'Asked', 'Files', 'Commands', 'Rules', 'Rules of this plan'])
        && addPre.status === 0 && addPost.status === 0 && mkA?.hash === sha(text.replace(ADD.old_string, ADD.new_string)) && same(mkA.scope, scopeA) && mkA.amendments === 1
        && refused(goalA, /Goals/) && /Scope: Goals, Asked, Files, Commands, Rules, Rules of this plan are as approved\./.test(statusA) && /Match: yes/.test(statusA)
        && refused(addOld, /Goals/) && refused(goalOld, /Goals/) && stepOld.status === 0
        && mkB?.hash === sha(text.replace(STEP.old_string, STEP.new_string)) && same(mkB.scope, m.report.scopeHashes(text)) && addAfter.status === 0;
    },
  },
  {
    name: 'the choice popup tool is refused wherever it is called: by plan-guard in plan mode, in an agent as well, by the manager fence on the main thread, by the plan fence in an agent with a plan approved and by approved-plan-guard with none; a read passes each of them',
    guards: ['popup_not_a_read'],
    run(m, dir) {
      const w = world(dir, [turn(0, GO)]);
      const POPUP = { tool_name: 'AskUserQuestion', tool_input: { questions: [{ question: 'Which one?', header: 'Pick', options: [{ label: 'a', description: 'a' }, { label: 'b', description: 'b' }], multiSelect: false }] } };
      const READ = { tool_name: 'Read', tool_input: { file_path: w.plan } };
      const guard = (extra) => spawnSync('node', [join(dir, 'plan-guard.mjs')], {
        input: JSON.stringify({ session_id: sid('pu'), cwd: w.cwd, transcript_path: w.tr, hook_event_name: 'PreToolUse', ...extra }), encoding: 'utf8', env: { ...process.env, HOME: w.home } });
      const refused = (r, re) => r.status === 2 && re.test(`${r.stdout}${r.stderr}`);
      // plan-guard in plan mode, the main thread and an agent; the read is the control.
      const planMain = guard({ permission_mode: 'plan', ...POPUP });
      const planAgent = guard({ permission_mode: 'plan', agent_id: 'a1', ...POPUP });
      const planRead = guard({ permission_mode: 'plan', ...READ });
      // approved-plan-guard outside plan mode with no plan approved.
      const A = appHome(dir);
      const none = A.guard(w.tr, POPUP);
      const noneRead = A.guard(w.tr, READ);
      // The dispatcher, with a plan approved: the main thread outside and inside plan mode, an agent, and a read.
      const main = w.call('PreToolUse', { session_id: sid('pu'), ...POPUP });
      const inPlan = w.call('PreToolUse', { session_id: sid('pu'), permission_mode: 'plan', ...POPUP });
      const agent = w.call('PreToolUse', { session_id: sid('pu'), agent_id: 'a1', ...POPUP });
      const readMain = w.call('PreToolUse', { session_id: sid('pu'), ...READ });
      return refused(planMain, /not known to be read-only/) && refused(planAgent, /not known to be read-only/) && planRead.status === 0
        && refused(none, /No approved plan is in force/) && noneRead.status === 0
        && refused(main, /MANAGER FENCE/) && refused(inPlan, /MANAGER FENCE/) && refused(agent, /PLAN FENCE/) && readMain.status === 0;
    },
  },
  {
    name: 'reviewGate refuses a step of a plan with a review step unless the current review cleared that step, naming the review step wherever a send answers, the amendment for a refused route and plan mode for OFF-AIM; a Standing step, a subagent, a tool that sends no agent, a prompt that is no step and a plan with no review step pass; a state that cannot be read refuses',
    guards: ['review_gate_cleared', 'review_gate_standing', 'review_gate_error', 'review_gate_not_read', 'review_gate_texts'],
    run(m, dir) {
      const plan = { path: '/plans/gate-test.md', text: reviewPlan(dir) };
      const send = (n, extra = {}) => ({ tool_name: 'Agent', tool_input: { prompt: `${plan.path} step ${n}` }, ...extra });
      const base = { reviewers: [3], step: 1, first: 'ON-AIM ROUTE-CLEAR step 1 next 2', review: { path: '/agents/agent-r1.jsonl' }, cleared: null };
      const gate = (n, state, extra, p = plan) => m.dispatch.reviewGate(send(n, extra), p, state);
      const clear = { ...base, kind: 'cleared', cleared: 2 };
      const says = (r, ...re) => typeof r === 'string' && /^REVIEW GATE/.test(r) && re.every((x) => x.test(r));
      return gate(2, clear) === null
        && says(gate(1, clear), /cleared step 2/, /step 3/)
        && gate(3, { ...base, kind: 'missing' }) === null && gate(3, null) === null
        && ['missing', 'running', 'stale', 'unreadable', 'wrong-step', 'no-next'].every((k) => says(gate(2, { ...base, kind: k }), new RegExp(`${plan.path} step 3`), /does not latch/))
        && says(gate(2, { ...base, kind: 'off-aim', first: 'OFF-AIM ROUTE-REFUSED step 1 next 2' }), /Go back to plan mode/, /OFF-AIM/)
        && says(gate(2, { ...base, kind: 'route-refused', first: 'ON-AIM ROUTE-REFUSED step 1 next 2' }), /Amend/, /Steps or Order/)
        && says(gate(2, { ...base, kind: 'not-read' }), /cannot be read/) && says(gate(2, null), /could not be read/)
        && gate(2, { ...base, kind: 'not-enforced' }) === null
        && gate(2, { ...base, kind: 'missing' }, { agent_id: 'a1' }) === null && gate(2, { ...base, kind: 'missing' }, { tool_name: 'Read' }) === null
        && gate(2, { ...base, kind: 'missing' }, {}, { path: plan.path, text: ORDER_PLAN }) === null
        && gate(2, { ...base, kind: 'missing' }, { tool_input: { prompt: 'something else' } }) === null;
    },
  },
  {
    name: 'a correction lets the Standing review step and a step the review cleared go, and nothing else: another step, a review that did not clear, a plan with no review step, an agent and a tool that sends no agent stay held',
    guards: ['correction_lifts_review', 'correction_lifts_cleared', 'correction_lifts_plain'],
    run(m, dir) {
      const plan = { path: '/plans/gate-test.md', text: reviewPlan(dir) };
      const send = (n, extra = {}) => ({ tool_name: 'Agent', tool_input: { prompt: `${plan.path} step ${n}` }, ...extra });
      const lifts = (n, state, extra, p = plan) => m.dispatch.correctionLifts(send(n, extra), { typed: 5 }, p, state);
      const clear = { kind: 'cleared', cleared: 2 };
      return lifts(3, { kind: 'missing' }) === true && lifts(2, clear) === true && lifts(1, clear) === false
        && lifts(2, { kind: 'stale' }) === false && lifts(2, { kind: 'cleared', cleared: null }) === false
        && lifts(2, clear, { agent_id: 'a1' }) === false && lifts(2, clear, { tool_name: 'Write' }) === false
        && lifts(2, clear, {}, { path: plan.path, text: ORDER_PLAN }) === false && lifts(3, clear, {}, { path: plan.path, text: ORDER_PLAN }) === false
        && lifts(2, clear, { tool_input: { prompt: 'something else' } }) === false
        && lifts(2, clear, {}, null) === false;
    },
  },

  // ---- the step numbers the plan held at approval (approved-plan-guard.mjs, hook-dispatch.mjs; Doctrine §0e rules 2 and 13) ----
  {
    name: 'at approval the marker records the step numbers of the plan\'s Steps and those on its Standing line, by the tool\'s approval and by the owner\'s exit in the app; an amendment of a step\'s text, of the Order, and one that adds a step and puts it on the Standing line all keep the approval, move the hash, and leave the recorded numbers as they were',
    guards: ['approved_step_set', 'approval_steps_snapshot', 'approval_steps_mark', 'approval_steps_exit', 'approval_steps_amend_keep'],
    run(m, dir) {
      const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const text = scopedPlan(dir);
      const seen = m.report.approvedStepSet(text);
      // The tool's approval records the lists beside the plan's hash.
      const A = appHome(dir);
      writeFileSync(A.plan, text);
      const trA = transcript([turn(0, 'start')]);
      A.guard(trA, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: text, isAgent: false, filePath: A.plan } }, '--mark');
      const mkA = A.mk();
      // The owner's exit in the app records them too.
      const B = appHome(dir);
      writeFileSync(B.plan, text);
      const hourAgo = (Date.now() - 60 * 60 * 1000) / 1000;
      utimesSync(B.plan, hourAgo, hourAgo);
      const ub = uid();
      const trB = transcript([turn(0, 'start'), ...enterPlan(-60), ...exitPlan(-20, false), exitEntry(-19, B.plan, ub)]);
      B.guard(trB, { tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      const mkB = B.mk();
      // Four amendments in a row, each let through before it is written and carried after: a step's text, the Order, the
      // Standing line, and a new step. None of them moves what was recorded.
      const edit = (input, flag) => A.guard(trA, { tool_name: 'Edit', tool_input: { file_path: A.plan, ...input }, ...(flag ? { hook_event_name: 'PostToolUse' } : {}) }, flag);
      const E1 = { old_string: '1. **Build.** Make the thing.', new_string: '1. **Build.** Make the thing, and say what it did.' };
      const E2 = { old_string: 'Order: 1 2', new_string: 'Order: 2 1' };
      const E3 = { old_string: 'Standing: 3', new_string: 'Standing: 3 4' };
      const E4 = { old_string: 'for the move named on the status page.', new_string: 'for the move named on the status page.\n4. **Extra.** Never sent.' };
      let cur = text;
      const pre = [];
      for (const e of [E1, E2, E3, E4]) {
        pre.push(edit(e).status);
        cur = cur.replace(e.old_string, e.new_string);
        writeFileSync(A.plan, cur);
        edit(e, '--amend');
      }
      const after = A.mk();
      return eq(seen.steps, [1, 2, 3]) && eq(seen.standing, [3])
        && eq(mkA?.steps, seen.steps) && eq(mkA?.standing, seen.standing)
        && mkB?.appExit === ub && eq(mkB?.steps, seen.steps) && eq(mkB?.standing, seen.standing)
        && eq(pre, [0, 0, 0, 0]) && cur !== text && after?.hash === sha256(cur) && after?.amendments === 4
        && eq(after?.steps, seen.steps) && eq(after?.standing, seen.standing);
    },
  },
  {
    name: 'hook-dispatch reads the recorded lists out of the marker: a marker that holds them gives them back, one written before they were recorded gives null for each, and a list that is not whole numbers gives an empty one that no step is in',
    guards: ['approved_plan_lists'],
    run(m, dir) {
      const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const text = reviewPlan(dir);
      const w = world(dir, [turn(0, GO)], text);
      const marker = join(w.home, '.claude', 'APPROVED-PLAN.json');
      const readWith = (lists) => {
        writeFileSync(marker, JSON.stringify({ plan: w.plan, hash: sha256(text), ...lists }));
        const prior = process.env.HOME;
        process.env.HOME = w.home;
        try { return m.dispatch.approvedPlan(); } finally { process.env.HOME = prior; }
      };
      const held = readWith({ steps: [1, 2, 3], standing: [3] });
      const old = readWith({});
      const bad = readWith({ steps: 'all', standing: [3, 'x'] });
      return eq(held?.steps, [1, 2, 3]) && eq(held?.standing, [3])
        && old?.steps === null && old?.standing === null
        && eq(bad?.steps, []) && eq(bad?.standing, []);
    },
  },
  {
    name: 'the dispatch gate refuses a step that was not in the plan\'s Steps at approval, saying it needs the owner\'s button and carrying the mark that sets no latch; a recorded step, an edit of a recorded step\'s text, an edit of the Order of the recorded steps and a marker that recorded no lists pass as before, and a recorded Standing step that is not a review or a route check is refused only where the lists were recorded',
    guards: ['approval_set_steps', 'approval_set_no_latch', 'approval_set_dispatch_wired', 'approval_set_recorded_only'],
    run(m, dir) {
      const base = scopedPlan(dir);
      const withStep = (t, line) => t.replace('for the move named on the status page.', `for the move named on the status page.\n${line}`).replace('Served by: steps 1, 2 and 3 serve goal 1.', 'Served by: steps 1, 2, 3 and 4 serve goal 1.');
      const added = withStep(base, '4. **Extra.** Never sent.');
      const textEdit = base.replace('1. **Build.** Make the thing.', '1. **Build.** Make the thing, and say what it did.');
      const orderEdit = base.replace('Order: 1 2', 'Order: 2 1');
      const plan = (text, extra = {}) => ({ path: '/plans/gate-test.md', text, steps: [1, 2, 3], standing: [3], ...extra });
      const gate = (n, pl) => m.dispatch.dispatchGate({ tool_name: 'Agent', tool_input: { prompt: `/plans/gate-test.md step ${n}` } }, pl, null);
      const none = { steps: null, standing: null };
      const bad = gate(4, plan(added));
      // The instrument: every edit changes the text, so a pass for one is a pass for an edit that was made.
      const changed = [added, textEdit, orderEdit].every((t) => t !== base);
      // A plan with a plain Standing step and no review: judged as before with no lists, refused with them.
      const timer = (extra) => gate(3, { path: '/plans/gate-test.md', text: ORDER_PLAN, ...extra });
      return changed
        && typeof bad === 'string' && /^DISPATCH GATE/.test(bad) && /STEP NOT IN THE PLAN AT APPROVAL/.test(bad) && /owner's button/.test(bad)
        && /step 4 was not in the plan's Steps/.test(bad) && /were 1, 2, 3\)/.test(bad) && bad.includes(m.dispatch.FENCE_NO_LATCH)
        && gate(1, plan(base)) === null && gate(1, plan(textEdit)) === null && gate(2, plan(orderEdit)) === null
        && gate(4, plan(added, none)) === null
        && typeof gate(1, plan(base, { steps: [] })) === 'string' && typeof gate(1, plan(base, { steps: [2, 3] })) === 'string'
        && timer(none) === null && typeof timer({ steps: [1, 2, 3], standing: [3] }) === 'string';
    },
  },
  {
    name: 'the Standing line holds the review and a route check and gains no step after approval: a step put on it after the approval, whether it was in the Steps then or was added, is refused by the review gate and by the dispatch gate with the rule\'s name and no latch; a Standing step recorded at approval that is neither the review nor a route check named in its own first line is refused, and the review step and a route check recorded at approval pass',
    guards: ['approval_set_standing_new', 'approval_set_standing_kind', 'approval_set_first_line', 'approval_set_route_check', 'approval_set_review_gate', 'approval_set_dispatch_wired'],
    run(m, dir) {
      const base = scopedPlan(dir);
      const withStep = (t, line) => t.replace('for the move named on the status page.', `for the move named on the status page.\n${line}`).replace('Served by: steps 1, 2 and 3 serve goal 1.', 'Served by: steps 1, 2, 3 and 4 serve goal 1.').replace('Standing: 3', 'Standing: 3 4');
      const moved = base.replace('Standing: 3', 'Standing: 2 3');
      const added = withStep(base, '4. **Extra.** Never sent.');
      const late = withStep(base, '4. **Extra.** Never sent.\n   - A route check is named only on this second line.');
      const route = withStep(base, '4. **Standing: route check.** Read the route of the next move.');
      const changed = [moved, added, late, route].every((t) => t !== base);
      const lists = (steps, standing) => ({ steps, standing });
      const plan = (text, l) => ({ path: '/plans/gate-test.md', text, ...l });
      const call = (n) => ({ tool_name: 'Agent', tool_input: { prompt: `/plans/gate-test.md step ${n}` } });
      const missing = { kind: 'missing', reviewers: [3], step: null, first: '', review: null, cleared: null };
      const review = (n, pl) => m.dispatch.reviewGate(call(n), pl, missing);
      const dispatch = (n, pl) => m.dispatch.dispatchGate(call(n), pl, null);
      const says = (r, ...re) => typeof r === 'string' && re.every((x) => x.test(r));
      const RULE = /THE STANDING LINE HOLDS THE REVIEW AND A ROUTE CHECK AND GAINS NO STEP AFTER APPROVAL/;
      const MARK = new RegExp(m.dispatch.FENCE_NO_LATCH.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const old = lists([1, 2, 3], [3]);
      const wide = lists([1, 2, 3, 4], [3, 4]);
      return changed
        // Put on the line after approval: a step that was in the Steps, and a step that was added.
        && says(review(2, plan(moved, old)), /^REVIEW GATE/, RULE, /step 2 is on the plan's Standing line now/, /does not latch/)
        && says(dispatch(2, plan(moved, old)), /^DISPATCH GATE/, RULE, /step 2 is on the plan's Standing line now/, MARK)
        && says(review(4, plan(added, old)), RULE, /step 4 is on the plan's Standing line now/)
        && says(dispatch(4, plan(added, old)), RULE, /step 4 is on the plan's Standing line now/, MARK)
        // Recorded on the line at approval, and neither the review nor a route check named in its first line.
        && says(review(4, plan(added, wide)), RULE, /neither the review step/)
        && says(dispatch(4, plan(added, wide)), RULE, /neither the review step/, MARK)
        && says(review(4, plan(late, wide)), RULE, /neither the review step/) && says(dispatch(4, plan(late, wide)), RULE, /neither the review step/, MARK)
        // The review step and a route check recorded at approval go.
        && review(3, plan(base, old)) === null && dispatch(3, plan(base, old)) === null
        && review(4, plan(route, wide)) === null && dispatch(4, plan(route, wide)) === null
        // A marker that recorded no lists is judged as before: a Standing step goes.
        && review(2, plan(moved, lists(null, null))) === null;
    },
  },
  {
    name: 'through hook-dispatch, with a marker that recorded the plan\'s step numbers, a step added after approval and a step put on the Standing line after it are refused without a latch, the first saying the step needs the owner\'s button and the second naming the Standing rule; the recorded review step goes, and a marker that recorded no lists holds neither',
    guards: ['approved_plan_lists', 'approval_set_dispatch_wired', 'approval_set_no_latch', 'approval_set_steps', 'approval_set_standing_new'],
    run(m, dir) {
      const base = scopedPlan(dir);
      const added = base.replace('for the move named on the status page.', 'for the move named on the status page.\n4. **Extra.** Never sent.').replace('Served by: steps 1, 2 and 3 serve goal 1.', 'Served by: steps 1, 2, 3 and 4 serve goal 1.');
      const moved = base.replace('Standing: 3', 'Standing: 2 3');
      const mk = (text, lists) => {
        const w = world(dir, [turn(0, GO)], text);
        writeFileSync(join(w.home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan: w.plan, hash: sha256(text), at: new Date().toISOString(), ...lists }));
        return w;
      };
      const send = (w, n) => { const id = sid('as'); return { r: w.call('PreToolUse', { session_id: id, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step ${n}`, subagent_type: 'general-purpose' } }), id }; };
      const lists = { steps: [1, 2, 3], standing: [3] };
      const newStep = send(mk(added, lists), 4);
      const onLine = send(mk(moved, lists), 2);
      const reviewStep = send(mk(base, lists), 3);
      const noLists = send(mk(added, {}), 4);
      return added !== base && moved !== base
        && newStep.r.status === 2 && /STEP NOT IN THE PLAN AT APPROVAL/.test(newStep.r.stderr) && /owner's button/.test(newStep.r.stderr) && !latched(newStep.id)
        && onLine.r.status === 2 && /THE STANDING LINE HOLDS THE REVIEW AND A ROUTE CHECK/.test(onLine.r.stderr) && !latched(onLine.id)
        && reviewStep.r.status === 0
        && noLists.r.status === 2 && /REVIEW GATE/.test(noLists.r.stderr) && !/STEP NOT IN THE PLAN AT APPROVAL/.test(noLists.r.stderr);
    },
  },

  // ---- the review step the approval recorded (approved-plan-guard.mjs, hook-dispatch.mjs, stop-guard.mjs; Doctrine §0e rules 2 and 13) ----
  {
    name: 'at approval the marker records the plan\'s review steps, those Standing steps whose text names the review file by its full path, by the tool\'s approval and by the owner\'s exit in the app, and a plan with no such step records an empty list; an amendment that edits the review step\'s text until it names no review file is let through, moves the hash, and leaves the record as approved while the plan\'s own reading of its review steps is empty',
    guards: ['approved_step_review', 'approval_steps_snapshot', 'approval_review_mark', 'approval_review_exit', 'approval_review_amend_keep'],
    run(m, dir) {
      const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const text = scopedPlan(dir);
      const seen = m.report.approvedStepSet(text);
      const timer = m.report.approvedStepSet(ORDER_PLAN);
      // The tool's approval records the review list beside the plan's hash.
      const A = appHome(dir);
      writeFileSync(A.plan, text);
      const trA = transcript([turn(0, 'start')]);
      A.guard(trA, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: text, isAgent: false, filePath: A.plan } }, '--mark');
      const mkA = A.mk();
      // The owner's exit in the app records it too.
      const B = appHome(dir);
      writeFileSync(B.plan, text);
      const hourAgo = (Date.now() - 60 * 60 * 1000) / 1000;
      utimesSync(B.plan, hourAgo, hourAgo);
      const ub = uid();
      const trB = transcript([turn(0, 'start'), ...enterPlan(-60), ...exitPlan(-20, false), exitEntry(-19, B.plan, ub)]);
      B.guard(trB, { tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      const mkB = B.mk();
      // A plan whose Standing step is a timer has no review step, and the record says so.
      const C = appHome(dir);
      writeFileSync(C.plan, ORDER_PLAN);
      const trC = transcript([turn(0, 'start')]);
      C.guard(trC, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: ORDER_PLAN, isAgent: false, filePath: C.plan } }, '--mark');
      const mkC = C.mk();
      // The amendment that drops the review file's path from the review step's text.
      const drop = { old_string: `Follow ${join(dir, 'aim-review.md')}`, new_string: 'Follow the review file' };
      const pre = A.guard(trA, { tool_name: 'Edit', tool_input: { file_path: A.plan, ...drop } }).status;
      const edited = text.replace(drop.old_string, drop.new_string);
      writeFileSync(A.plan, edited);
      A.guard(trA, { tool_name: 'Edit', tool_input: { file_path: A.plan, ...drop }, hook_event_name: 'PostToolUse' }, '--amend');
      const after = A.mk();
      return eq(seen.review, [3]) && eq(timer.review, []) && edited !== text && eq(m.report.approvedStepSet(edited).review, [])
        && eq(mkA?.review, [3]) && mkB?.appExit === ub && eq(mkB?.review, [3]) && eq(mkC?.review, [])
        && pre === 0 && after?.hash === sha256(edited) && after?.amendments === 1 && eq(after?.review, [3]) && eq(after?.steps, seen.steps) && eq(after?.standing, seen.standing);
    },
  },
  {
    name: 'hook-dispatch reads the recorded review list out of the marker: a marker that holds it gives it back, one written before it was recorded gives null, an empty list is an empty list, and a list that is not whole numbers gives an empty one',
    guards: ['approved_plan_review'],
    run(m, dir) {
      const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const text = reviewPlan(dir);
      const w = world(dir, [turn(0, GO)], text);
      const marker = join(w.home, '.claude', 'APPROVED-PLAN.json');
      const readWith = (lists) => {
        writeFileSync(marker, JSON.stringify({ plan: w.plan, hash: sha256(text), ...lists }));
        const prior = process.env.HOME;
        process.env.HOME = w.home;
        try { return m.dispatch.approvedPlan(); } finally { process.env.HOME = prior; }
      };
      const held = readWith({ review: [3], steps: [1, 2, 3], standing: [3] });
      const old = readWith({ steps: [1, 2, 3], standing: [3] });
      const empty = readWith({ review: [] });
      const bad = readWith({ review: 'all' });
      const mixed = readWith({ review: [3, 'x'] });
      return eq(held?.review, [3]) && old?.review === null && eq(empty?.review, []) && eq(bad?.review, []) && eq(mixed?.review, []);
    },
  },
  {
    name: 'the dispatch gate and the review gate refuse every step, a Standing one included, while the marker recorded a review step and no Standing step of the plan names the review file by its full path any more, whether its text was edited or it was taken off the Standing line, with the rule\'s name, the words plan mode and no latch; the plan as approved, a marker that recorded no review step, an empty list, no list at all, and a plan that still has a review step under another recorded number are judged as before',
    guards: ['review_record_dispatch_wired', 'review_record_review_gate', 'review_record_array', 'review_record_nonempty', 'review_record_still_there', 'review_record_rule_text', 'review_record_plan_mode', 'review_record_no_latch_dispatch', 'review_record_dispatch_standing', 'review_record_standing_exempt'],
    run(m, dir) {
      const base = scopedPlan(dir);
      const edited = base.replace(`Follow ${join(dir, 'aim-review.md')}`, 'Follow the review file');
      const off = base.replace('Standing: 3', 'Standing:');
      const changed = [edited, off].every((t) => t !== base);
      const plan = (text, review) => ({ path: '/plans/gate-test.md', text, steps: [1, 2, 3], standing: [3], ...(review === undefined ? {} : { review }) });
      const call = (n) => ({ tool_name: 'Agent', tool_input: { prompt: `/plans/gate-test.md step ${n}` } });
      const missing = { kind: 'missing', reviewers: [3], step: null, first: '', review: null, cleared: null };
      const cleared = (n) => ({ kind: 'cleared', reviewers: [3], step: null, first: 'ON-AIM ROUTE-CLEAR', review: null, cleared: n });
      const review = (n, pl, st = missing) => m.dispatch.reviewGate(call(n), pl, st);
      const dispatch = (n, pl) => m.dispatch.dispatchGate(call(n), pl, null);
      const says = (r, ...re) => typeof r === 'string' && re.every((x) => x.test(r));
      const RULE = /THE REVIEW STEP KEEPS THE REVIEW FILE/;
      const MARK = new RegExp(m.dispatch.FENCE_NO_LATCH.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const refusedBoth = (pl, n) => says(dispatch(n, pl), /^DISPATCH GATE/, RULE, /review step 3/, /plan mode/, /Standing step included/, MARK)
        && says(review(n, pl), /^REVIEW GATE/, RULE, /review step 3/, /plan mode/, /does not latch/);
      return changed
        // The plan as approved: the review step names the file, so both gates judge as they did.
        && dispatch(1, plan(base, [3])) === null && review(1, plan(base, [3]), cleared(1)) === null
        && review(3, plan(base, [3]), missing) === null && dispatch(3, plan(base, [3])) === null
        // The review step's text edited until it names no file, and the step taken off the Standing line: every step is refused.
        && [1, 2, 3].every((n) => refusedBoth(plan(edited, [3]), n))
        && [1, 2, 3].every((n) => refusedBoth(plan(off, [3]), n))
        // A marker that recorded no review step, an empty list, or no list at all carries no such check.
        && [undefined, null, []].every((r) => dispatch(1, plan(edited, r)) === null && review(1, plan(edited, r)) === null && review(2, plan(off, r)) === null)
        // The plan still has a review step: the recorded number is not compared, the condition is the gate's own.
        && dispatch(1, plan(base, [5])) === null && review(3, plan(base, [5])) === null
        // Not a main-thread send of a step: an agent's call and a prompt naming no step are not this gate's.
        && review(1, plan(edited, [3]), missing) !== null && m.dispatch.reviewGate({ ...call(1), agent_id: 'a1' }, plan(edited, [3]), missing) === null
        && m.dispatch.reviewGate({ tool_name: 'Agent', tool_input: { prompt: 'something else' } }, plan(edited, [3]), missing) === null
        && m.dispatch.reviewRecordProblem(null) === null && m.dispatch.reviewRecordProblem({ text: edited, review: [3] }) !== null;
    },
  },
  {
    name: 'through hook-dispatch, with a marker that recorded the review step, a step is refused without a latch once the review step\'s text no longer names the review file, the Standing review step itself included, saying the plan goes back through plan mode; the plan as approved still sends its Standing step, and a marker that recorded no review step sends a step as before',
    guards: ['approved_plan_review', 'review_record_dispatch_wired', 'review_record_no_latch_dispatch', 'review_record_dispatch_standing'],
    run(m, dir) {
      const base = scopedPlan(dir);
      const edited = base.replace(`Follow ${join(dir, 'aim-review.md')}`, 'Follow the review file');
      const mk = (text, lists) => {
        const w = world(dir, [turn(0, GO)], text);
        writeFileSync(join(w.home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan: w.plan, hash: sha256(text), at: new Date().toISOString(), ...lists }));
        return w;
      };
      const send = (w, n) => { const id = sid('rr'); return { r: w.call('PreToolUse', { session_id: id, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step ${n}`, subagent_type: 'general-purpose' } }), id }; };
      const lists = { steps: [1, 2, 3], standing: [3] };
      const RULE = /THE REVIEW STEP KEEPS THE REVIEW FILE/;
      const worker = send(mk(edited, { ...lists, review: [3] }), 1);
      const reviewer = send(mk(edited, { ...lists, review: [3] }), 3);
      const asApproved = send(mk(base, { ...lists, review: [3] }), 3);
      const noRecord = send(mk(edited, lists), 1);
      return edited !== base
        && worker.r.status === 2 && RULE.test(worker.r.stderr) && /DISPATCH GATE/.test(worker.r.stderr) && /plan mode/.test(worker.r.stderr) && !latched(worker.id)
        && reviewer.r.status === 2 && RULE.test(reviewer.r.stderr) && !latched(reviewer.id)
        && asApproved.r.status === 0
        && noRecord.r.status === 0;
    },
  },
  {
    name: 'a turn is held only by a step the approval recorded: a step added to the Order after approval is not the step left, so the turn ends once every recorded step is done, a recorded step behind it is still named, and a marker that recorded no step list holds the added step as before; a plan with no Order is counted the same way',
    guards: ['steps_recorded_order', 'steps_recorded_count', 'steps_recorded_old'],
    run(m, dir) {
      // Step 4 is added to the Steps and to the Order, between steps 1 and 2, after the approval recorded steps 1 to 3.
      const addedOrder = ORDER_PLAN.replace('Order: 1 2', 'Order: 1 4 2')
        .replace('3. **Timer.** Wait on the thing.', '3. **Timer.** Wait on the thing.\n4. **Extra.** Never sent.')
        .replace('Served by: steps 1, 2 and 3 serve goal 1.', 'Served by: steps 1, 2, 3 and 4 serve goal 1.');
      // A plan with no Order, and a step 3 added to it.
      const addedPlain = STEPS_PLAN.replace('2. **Check.** Read the thing.', '2. **Check.** Read the thing.\n3. **Extra.** Never sent.')
        .replace('Served by: steps 1 and 2 serve goal 1.', 'Served by: steps 1, 2 and 3 serve goal 1.');
      const REPORT = 'Here is the report of what the gates now do, and what each one refuses.';
      const ending = (planText, lists, done) => {
        const w = world(dir, [], planText);
        writeFileSync(join(w.home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan: w.plan, hash: sha256(planText), at: new Date().toISOString(), ...lists }));
        const s = sid('sr');
        const proj = tmp('sg-proj-');
        const main = join(proj, `${s}.jsonl`);
        const subs = join(proj, s, 'subagents');
        mkdirSync(subs, { recursive: true });
        for (const n of done) {
          const id = `d${n}`;
          writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl([at({ type: 'user', message: { role: 'user', content: `${w.plan} step ${n}` } }, later(-300)),
            at(tool(0, `${id}-b`, 'Bash', { command: 'git status' }), later(-200)), at(result(0, `${id}-b`, 'clean'), later(-199)),
            at(tool(0, `${id}-h`, 'SubagentHandback', { message: 'DONE\nThe second line.' }), later(-100)), at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(-99))]));
          writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step ${n}` }));
        }
        writeFileSync(main, jsonl([turn(0, GO), reply(5, REPORT)]));
        return spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: s, transcript_path: main }), encoding: 'utf8', env: { ...process.env, HOME: w.home } });
      };
      const err = (r) => r.stderr ?? '';
      const lists = { steps: [1, 2, 3], standing: [3] };
      const plainLists = { steps: [1, 2], standing: [] };
      const oneDone = ending(addedOrder, lists, [1]);
      const bothDone = ending(addedOrder, lists, [1, 2]);
      const bothDoneOld = ending(addedOrder, {}, [1, 2]);
      const plainDone = ending(addedPlain, plainLists, [1, 2]);
      const plainDoneOld = ending(addedPlain, {}, [1, 2]);
      const plainOne = ending(addedPlain, plainLists, [1]);
      return addedOrder !== ORDER_PLAN && addedPlain !== STEPS_PLAN
        // With an Order: the added step 4 sits before step 2 and is skipped, so step 2 is the step left; once 1 and 2 are done nothing is left.
        && oneDone.status === 2 && err(oneDone).includes('next: step 2') && !err(oneDone).includes('next: step 4')
        && bothDone.status === 0
        // A marker that recorded no list holds the added step: it is next, as it was.
        && bothDoneOld.status === 2 && err(bothDoneOld).includes('next: step 4')
        // With no Order: the added step 3 is not counted, and a recorded step still is.
        && plainDone.status === 0 && plainOne.status === 2 && err(plainOne).includes('(2)') && !err(plainOne).includes('(3)')
        && plainDoneOld.status === 2 && err(plainDoneOld).includes('(3)');
    },
  },
  {
    name: 'the owner\'s holds are read from the transcript: a message carrying the whole word stop ANYWHERE in it, first, second or last, and no go-word stands until a later message ends with a go-word; a message carrying the word and a go-word is no stop and lifts one; a plain message, a harness message and a stop said again do not lift it, "stopped" and "unstoppable" are not the word, and a correction is the newest message when it does not end with a go-word, with the time it was typed',
    guards: ['stop_anywhere', 'stop_whole_word', 'stop_go_message', 'stop_plain_lift', 'stop_older_go', 'stop_newest', 'hold_typed'],
    run(m) {
      const h = (entries) => m.dispatch.holdsIn(entries);
      const note = { type: 'user', timestamp: ts(40), origin: { kind: 'task-notification' }, message: { role: 'user', content: 'The long run finished; ok, nothing else is open.' } };
      const stands = (entries) => h(entries).stop !== null;
      return stands([turn(0, 'Stop. Nothing more until I answer.')]) && stands([turn(0, '  STOP!')]) && stands([turn(0, '"Stop" means stop.')])
        // The word second, after another word, and later in a message: a first-word rule held none of these.
        && stands([turn(0, 'Please stop.')]) && stands([turn(0, 'Wait, stop everything right now')]) && stands([turn(0, 'This is wrong and you must stop')])
        && stands([turn(0, 'Please do not stop now.')]) && stands([turn(0, 'It is a stop-gap, not a fix')])
        // Not the whole word, no word at all, or a message that carries a go-word.
        && !stands([turn(0, 'The stopped run is fine')]) && !stands([turn(0, 'It is unstoppable')]) && !stands([turn(0, 'Check the stopwatch')])
        && !stands([turn(0, 'The stopped run is fine, go')]) && !stands([turn(0, GO)])
        && !stands([turn(0, 'Stop, then go.')]) && !stands([turn(0, 'Please stop, ok')])
        // Lifted by a later go-word message; a plain message, a harness message and another stop do not lift it.
        && !stands([turn(0, 'stop'), turn(5, 'Go.')]) && !stands([turn(0, 'please stop'), mid(5, 'continue')])
        && stands([turn(0, 'stop'), turn(5, 'That was done wrong; explain it.')]) && stands([turn(0, 'please stop'), note])
        // A message with the word and a go-word is a go message: it lifts an earlier stop.
        && !stands([turn(0, 'stop'), turn(5, 'Stop, ok')])
        // A go-word BEFORE the stop lifts nothing.
        && stands([turn(0, GO), turn(5, 'Now stop that')])
        // The newest stop is the one that counts: lifted once, said again.
        && stands([turn(0, 'stop'), turn(5, 'go'), turn(10, 'please stop again')]) && !stands([turn(0, 'stop'), turn(5, 'go'), turn(10, 'please stop again'), turn(15, 'ok')])
        // A correction is the newest message when it does not end with a go-word, with its delivery time and its TYPED time.
        && h([turn(0, GO), turn(5, 'That was wrong.')]).correction !== null && h([turn(0, GO)]).correction === null && h([turn(0, 'Stop, then go.')]).correction === null
        && (() => { const x = h([turn(0, GO), enq(20, 'Not that one.'), mid(30, 'Not that one.')]).correction; return !!x && x.typed === Date.parse(ts(20)) && x.at === Date.parse(ts(30)); })()
        && h([]).last === null;
    },
  },
  {
    name: 'the hold reads the stop word more widely than the queued-message check, and never less: every message the queued check reads as a stop is a stop for the hold, and a halt message with the word second is a stop for the hold and not for the queued check, which still reads the first word only',
    guards: ['stop_anywhere'],
    run(m) {
      const first = ['stop', 'Stop.', '  STOP! now', '"stop"', 'stop-gap', 'Stop, then do nothing'];
      const second = ['Please stop', 'Wait, stop everything', 'Please do not stop now', 'the stop hook'];
      const neither = ['stopped', 'unstoppable', 'go', 'Check the stopwatch'];
      const queued = (t) => m.pending.decide({ session_id: 'sw', agent_id: 'a1' }, [turn(0, 'start'), enq(10, t)]) !== null;
      const held = (t) => m.dispatch.isStopMessage(t);
      return first.every((t) => queued(t) && held(t)) && second.every((t) => !queued(t) && held(t)) && neither.every((t) => !queued(t) && !held(t))
        && m.dispatch.hasStopWord('stop') && m.dispatch.hasStopWord('Please stop') && !m.dispatch.hasStopWord('go')
        && m.dispatch.isStopMessage('stop') && !m.dispatch.isStopMessage('stop, go') && !m.dispatch.isStopMessage('');
    },
  },
  {
    name: 'through hook-dispatch, a plan with a review step sends a step only when a review that began after everything it judges has cleared that step, any step the review names and not only the pointer\'s; each refusal names the review step and does not latch, and the review step itself always goes',
    guards: ['review_gate_wired', 'review_gate_no_latch', 'dispatch_review_no_pointer', 'review_gate_standing', 'review_gate_cleared'],
    run(m, dir) {
      const w = reviewWorld(dir);
      const go = (n) => { const id = sid('rg'); return { r: w.send(n, id), id }; };
      const refused = ({ r, id }, ...re) => r.status === 2 && /REVIEW GATE/.test(r.stderr) && !latched(id) && re.every((x) => x.test(r.stderr));
      const passes = ({ r }) => r.status === 0;
      const names = new RegExp(`${w.plan.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} step 3`);
      // Nothing has handed back: no step goes but the Standing one, the pointer's step 1 included.
      const fresh = [go(1), go(2), go(3)];
      // Step 1 handed back DONE; a review that began after it clears step 2.
      w.agent('d1', 1, -900, -800, 'DONE');
      w.agent('r1', 3, -700, -600, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const cleared = [go(1), go(2), go(3)];
      // The same review clearing step 1 instead: step 1 goes although the pointer reads next: step 2.
      w.agent('r1', 3, -700, -600, 'ON-AIM ROUTE-CLEAR step 1 next 1');
      const anyStep = [go(1), go(2)];
      // A review that began before step 1 ended judged nothing it was handed.
      w.agent('r1', 3, -850, -600, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const early = go(2);
      // Step 2 ends after the review began: the review is stale again.
      w.agent('r1', 3, -700, -600, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      w.agent('d2', 2, -500, -400, 'DONE');
      const lapsed = [go(1), go(3)];
      // Every other verdict.
      w.clear(); w.agent('d1', 1, -900, -800, 'DONE');
      const said = {};
      for (const [k, first] of Object.entries({ off: 'OFF-AIM ROUTE-REFUSED step 1 next 2', route: 'ON-AIM ROUTE-REFUSED step 1 next 2', other: 'ON-AIM ROUTE-CLEAR step 2 next 2', old: 'ON-AIM step 1', plain: 'Fine.' })) {
        w.agent('r1', 3, -700, -600, first);
        said[k] = go(2);
      }
      // A review still running clears nothing yet.
      w.clear(); w.agent('d1', 1, -900, -800, 'DONE'); w.running('r2', 3, -100);
      const running = go(2);
      // The plan written after the review began makes it stale; a fresh review clears the amended step.
      w.clear(); w.agent('d1', 1, -900, -800, 'DONE'); w.agent('r1', 3, -700, -600, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const before = go(2);
      const edited = (Date.now() - 300 * 1000) / 1000;
      utimesSync(w.plan, edited, edited);
      const amended = go(2);
      w.agent('r3', 3, -200, -100, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const again = go(2);
      return refused(fresh[0], names, /does not latch/) && refused(fresh[1], names) && passes(fresh[2])
        && refused(cleared[0], /cleared step 2/, /another step/) && passes(cleared[1]) && passes(cleared[2])
        && passes(anyStep[0]) && refused(anyStep[1], /cleared step 1/)
        && refused(early, names) && refused(lapsed[0], names) && passes(lapsed[1])
        && refused(said.off, /OFF-AIM/, /plan mode/) && refused(said.route, /ROUTE-REFUSED/, /Amend/) && refused(said.other, names) && refused(said.old, names) && refused(said.plain, names)
        && refused(running, /running/, names)
        && passes(before) && refused(amended, names) && passes(again);
    },
  },
  {
    name: 'while a correction stands in a plan with a review step, the review step goes, and so does a step that a review which began after the message was typed cleared; a step cleared before the message and an OFF-AIM review stay held with the correction\'s words, without latching, and a plan with no review step holds every send',
    guards: ['correction_lifts_wired', 'correction_lifts_after', 'correction_lifts_review', 'correction_lifts_cleared', 'correction_says_review'],
    run(m, dir) {
      const WRONG = 'That was wrong, so explain it before anything else.';
      const w = reviewWorld(dir, [owner(later(-900), GO), owner(later(-200), WRONG)]);
      const go = (n) => { const id = sid('cl'); return { r: w.send(n, id), id }; };
      const held = ({ r, id }) => r.status === 2 && /CORRECTION/.test(r.stderr) && !/REVIEW GATE/.test(r.stderr) && !latched(id) && !r.stderr.includes('explain it');
      const passes = ({ r }) => r.status === 0;
      w.agent('d1', 1, -800, -700, 'DONE');
      // A review that ran BEFORE the message cleared step 2 without having read the message.
      w.agent('r1', 3, -500, -400, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const before = [go(2), go(3)];
      // A review that began after the message: step 2 goes, step 1 (which it did not clear) is refused by the review gate's own rule, and the review step goes.
      w.agent('r2', 3, -100, -50, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const after = [go(2), go(1), go(3)];
      // The same review reading OFF-AIM clears nothing.
      w.agent('r2', 3, -100, -50, 'OFF-AIM ROUTE-CLEAR step 1 next 2');
      const off = go(2);
      // With no review step in the plan every send is held, as before.
      const plain = world(dir, [owner(later(-900), GO), owner(later(-200), WRONG)], ORDER_PLAN);
      const idp = sid('cl');
      const plainSend = plain.call('PreToolUse', { session_id: idp, tool_name: 'Agent', tool_input: { prompt: `${plain.plan} step 1`, subagent_type: 'general-purpose' } });
      return held(before[0]) && /Standing review step and the step that review clears/.test(before[0].r.stderr) && passes(before[1])
        && passes(after[0]) && held(after[1]) && passes(after[2])
        && held(off)
        && plainSend.status === 2 && /CORRECTION/.test(plainSend.stderr) && !/Standing review step/.test(plainSend.stderr) && !latched(idp);
    },
  },
  {
    name: 'a message carrying the whole word stop and no go-word holds the whole session until a go-word, the word first or second: the main thread\'s sends, the review step and a cleared step included, and every call of an agent, with the stop\'s words and without latching; the status command, TaskStop, a read of the record on the main thread and an agent\'s own return still pass; a plain message does not lift it and a go-word does; a message with the word and a go-word is no stop',
    guards: ['stop_hold', 'stop_agents', 'stop_taskstop', 'stop_no_latch', 'stop_record_read', 'stop_anywhere', 'stop_go_message'],
    run(m, dir) {
      const w = reviewWorld(dir, [owner(later(-900), GO), owner(later(-200), 'Stop. Nothing more until I answer.')]);
      w.agent('d1', 1, -800, -700, 'DONE');
      // A review that began after the stop message and cleared step 2: even a cleared step is held.
      w.agent('r1', 3, -100, -50, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const call = (extra) => { const id = sid('sh'); judgedPad(id, w.judgedLines()); return { r: w.call('PreToolUse', { session_id: id, ...extra }), id }; };
      const held = ({ r, id }) => r.status === 2 && /STOP \(Doctrine §0e rule 3\)/.test(r.stderr) && !/CORRECTION/.test(r.stderr) && !latched(id) && !r.stderr.includes('Nothing more until');
      const passes = ({ r }) => r.status === 0;
      const sendStep = (n) => call({ tool_name: 'Agent', tool_input: { prompt: `${w.plan} step ${n}`, subagent_type: 'general-purpose' } });
      const status = call({ tool_name: 'Bash', tool_input: { command: `node "${join(dir, 'report.mjs')}" "Status 10:00 — a stop stands"` } });
      const stands = [sendStep(2), sendStep(3), call({ tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x' } }),
        call({ agent_id: 'a1', tool_name: 'Read', tool_input: { file_path: w.plan } }), call({ agent_id: 'a1', tool_name: 'Bash', tool_input: { command: 'git status' } }),
        call({ tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } })];
      const kept = [status, call({ tool_name: 'TaskStop', tool_input: { task_id: 'bxyz789' } }), call({ agent_id: 'a1', tool_name: 'TaskStop', tool_input: { task_id: 'bxyz789' } }),
        call({ tool_name: 'Read', tool_input: { file_path: w.plan } }), call({ agent_id: 'a1', tool_name: 'SubagentHandback', tool_input: { message: 'Stopped as told.' } })];
      // A plain message typed after the stop does not lift it.
      appendFileSync(w.tr, jsonl([owner(later(-20), 'Another plain message, which is no go-word.')]));
      const plainAfter = [sendStep(2), call({ agent_id: 'a1', tool_name: 'Read', tool_input: { file_path: w.plan } })];
      // A go-word lifts it: the cleared step and the agent's read go.
      appendFileSync(w.tr, jsonl([owner(later(-10), 'Go.')]));
      const lifted = [sendStep(2), call({ agent_id: 'a1', tool_name: 'Read', tool_input: { file_path: w.plan } })];
      // The word SECOND, after another word, holds the same way: the main thread's send and an agent's read.
      const second = reviewWorld(dir, [owner(later(-900), GO), owner(later(-200), 'Please stop everything. Nothing more until I answer.')]);
      second.agent('d1', 1, -800, -700, 'DONE'); second.agent('r1', 3, -100, -50, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const ids = sid('sh');
      const heldSecond = [{ r: second.send(2, ids), id: ids }, { r: second.call('PreToolUse', { session_id: sid('sh'), agent_id: 'a1', tool_name: 'Read', tool_input: { file_path: second.plan } }), id: ids }];
      // A message carrying the word and a go-word is a go message, not a stop: the cleared step goes.
      const both = reviewWorld(dir, [owner(later(-900), GO), owner(later(-200), 'Stop, then go.')]);
      both.agent('d1', 1, -800, -700, 'DONE'); both.agent('r1', 3, -100, -50, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const idb = sid('sh');
      const sentBoth = both.send(2, idb);
      return stands.every(held) && kept.every(passes) && plainAfter.every(held) && lifted.every(passes)
        && heldSecond[0].r.status === 2 && /STOP \(Doctrine §0e rule 3\)/.test(heldSecond[0].r.stderr) && !latched(ids)
        && heldSecond[1].r.status === 2 && /STOP \(Doctrine §0e rule 3\)/.test(heldSecond[1].r.stderr)
        && !heldSecond[0].r.stderr.includes('Nothing more until')
        && sentBoth.status === 0 && !/STOP \(Doctrine/.test(sentBoth.stderr);
    },
  },
  {
    name: 'a stop is found however far back it sits and lifted by a go-word that came after it: a tail that widens finds a stop written before three megabytes of tool output, with a plain message after the output or none, and a go-word after the output lifts it',
    guards: ['hold_settled'],
    run(m, dir) {
      const big = 'x'.repeat(3 * 1024 * 1024);
      const output = [tool(6, 'b1', 'Bash', { command: 'cat big' }), result(7, 'b1', big)];
      const send = (w) => w.call('PreToolUse', { session_id: sid('sw'), tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const STOP = 'Stop. Nothing more until I answer.';
      const stopped = send(world(dir, [turn(0, GO), turn(5, STOP), ...output]));
      // The newest message in the first tail is a plain one: it settles nothing, so the tail has to widen to the stop.
      const plain = send(world(dir, [turn(0, GO), turn(5, STOP), ...output, turn(8, 'Another plain message, which is no go-word.')]));
      const lifted = send(world(dir, [turn(0, GO), turn(5, STOP), ...output, turn(8, 'go')]));
      const held = (r) => r.status === 2 && /STOP \(Doctrine §0e rule 3\)/.test(r.stderr);
      return held(stopped) && held(plain) && lifted.status === 0;
    },
  },
  {
    name: 'a stop found in a transcript that cannot be read comes from the record UserPromptSubmit wrote, the word first or second, which only a go-word replaces and a plain message typed after it does not; a harness prompt is not recorded',
    guards: ['hold_fallback_stop', 'record_stop', 'record_stop_kept', 'stop_anywhere'],
    run(m, dir) {
      const w = world(dir);
      const lost = (s) => w.call('PreToolUse', { session_id: s, transcript_path: join(w.cwd, 'missing.jsonl'), tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const s1 = sid('fs');
      w.call('UserPromptSubmit', { session_id: s1, prompt: 'Stop. Nothing more until I answer.' });
      const stopped = lost(s1);
      w.call('UserPromptSubmit', { session_id: s1, prompt: 'go' });
      const lifted = lost(s1);
      const s2 = sid('fs');
      w.call('UserPromptSubmit', { session_id: s2, prompt: 'Stop. Nothing more until I answer.' });
      w.call('UserPromptSubmit', { session_id: s2, prompt: NOTE });
      const harness = lost(s2);
      // The word second, and a plain message typed after the stop: the stop still stands, and a go-word then lifts it.
      const s3 = sid('fs');
      w.call('UserPromptSubmit', { session_id: s3, prompt: 'Please stop everything now.' });
      const second = lost(s3);
      w.call('UserPromptSubmit', { session_id: s3, prompt: 'That was done wrong; explain it.' });
      const plain = lost(s3);
      w.call('UserPromptSubmit', { session_id: s3, prompt: 'Go.' });
      const liftedLate = lost(s3);
      const says = (r) => r.status === 2 && /STOP \(Doctrine §0e rule 3\)/.test(r.stderr);
      return says(stopped) && lifted.status === 0 && harness.status === 2
        && says(second) && says(plain) && liftedLate.status === 0;
    },
  },
  {
    name: 'ExitPlanMode refuses a plan with an Order whose Standing line names no step that follows the hub\'s aim-review.md by its full path, and passes one that does; a plan with no Order is not judged',
    guards: ['aim_standing_wired', 'review_full_path', 'review_follow'],
    run(m, dir) {
      const r = repo({ 'a.txt': 'x\n' });
      const TALK = 'Here is what is being done and why: the export control moves to the toolbar edge, and nothing else changes.';
      const withStanding = (words) => ['# Order plan', '',
        '## Goals', '1. The toolbar shows the export button on its left side.', GOALS_BLOCK, 'Served by: steps 1 and 2 serve goal 1.', '',
        '## Asked', OWN_WORDS, '',
        '## Order', 'Order: 1', 'Standing: 2', '',
        '## Rules', rulesLine(dir), '',
        '## Steps', '1. **Build.** Make the toolbar change.', `2. **Review.** ${words}`, '',
        '## Looked up', 'Nothing outside the repository bears on this change at all.', '',
        '## Branches', 'One branch only, because the request names a single control to move.', '',
        '## Call chain', 'The toolbar builder places the button; nothing else reads its position.', '',
        '## Whole app', 'It belongs because it was asked for, and nothing else would change.', '',
        '## Leaves open', 'Nothing is left open by this change, as far as can be seen here.', ''].join('\n');
      const exit = (planText) => {
        const home = tmp('sg-home-');
        mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
        const file = join(home, '.claude', 'plans', 'aim-test.md');
        writeFileSync(file, planText);
        const t = (Date.now() - 1000 * 1000) / 1000;
        utimesSync(file, t, t);
        return spawnSync('node', [join(dir, 'plan-guard.mjs')], {
          input: JSON.stringify({ session_id: sid('as'), permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { planFilePath: file },
            transcript_path: transcript([turn(0, OWNER), ...enterPlan(-900), at(reply(0, TALK), later(-500)), owner(later(-400), 'ok')]), cwd: '/' }),
          encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: r.dir },
        });
      };
      const good = exit(withStanding(`Follow ${join(dir, 'aim-review.md')} for the move named on the status page.`));
      const timer = exit(withStanding('Wait on the thing.'));
      const bare = exit(withStanding('Follow aim-review.md for the move named on the status page.'));
      const elsewhere = exit(withStanding('Follow /somewhere/else/aim-review.md for the move named on the status page.'));
      const noFollow = exit(withStanding(`Read ${join(dir, 'aim-review.md')} for the move named on the status page.`));
      const noOrder = exit(PLAN(OWN_WORDS));
      return good.status === 0 && noOrder.status === 0
        && [timer, bare, elsewhere, noFollow].every((x) => x.status === 2 && /AIM REVIEW/.test(x.stdout) && x.stdout.includes('aim-review.md'));
    },
  },
  {
    name: 'the main thread may amend the approved plan\'s Steps or Order with no new approval: the write goes only when Goals, Asked, Files, Commands, Rules and Rules of this plan are unchanged in the text it would leave, and the marker\'s hash then follows the file; an edit to any of the six, an agent\'s edit, an edit that cannot be applied, one under a marker with no scope, one from another session and one on a plan that changed after approval are refused, and a change that got past the check leaves no plan in force and is named by the status',
    guards: ['amend_scope_gate', 'amend_agent', 'amend_no_scope', 'amend_session', 'amend_hash', 'amend_multi', 'amend_ambiguous', 'amend_post', 'amend_rehash', 'amend_post_agent', 'scope_mark', 'scope_app_exit', 'status_scope'],
    run(m, dir) {
      const sha = (t) => createHash('sha256').update(t).digest('hex');
      const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const text = scopedPlan(dir);
      const scope = m.report.scopeHashes(text);
      // The owner's approval through the tool: the marker records the plan's hash and its scope.
      const approve = (A, body = text) => {
        writeFileSync(A.plan, body);
        const tr = transcript([turn(0, 'start')]);
        A.guard(tr, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: body, isAgent: false, filePath: A.plan } }, '--mark');
        return tr;
      };
      const call = (A, tr, name, input, extra = {}, flag) => A.guard(tr, { tool_name: name, tool_input: { file_path: A.plan, ...input }, ...(flag ? { hook_event_name: 'PostToolUse' } : {}), ...extra }, flag);
      const A = appHome(dir);
      const tr = approve(A);
      const mk0 = A.mk();
      const STEP = { old_string: '1. **Build.** Make the thing.', new_string: '1. **Build.** Make the thing, and say what it did.' };
      const STEP2 = { old_string: '2. **Check.** Read the thing.', new_string: '2. **Check.** Read the thing twice.' };
      const FILES = { old_string: '`keep.mjs`', new_string: '`keep.mjs`, `more.mjs`' };
      const refused = (r, ...re) => r.status === 2 && re.every((x) => x.test(r.stdout));
      // Steps and Order may move: the write goes, and once it is made the marker's hash follows the file.
      const steps = call(A, tr, 'Edit', STEP);
      writeFileSync(A.plan, text.replace(STEP.old_string, STEP.new_string));
      const amended = call(A, tr, 'Edit', STEP, {}, '--amend');
      const mk1 = A.mk();
      const order = call(A, tr, 'MultiEdit', { edits: [{ old_string: 'Order: 1 2', new_string: 'Order: 2 1' }, { old_string: 'Step 9 is never sent', new_string: 'Step 9 is never sent here' }] });
      const current = readFileSync(A.plan, 'utf8');
      const whole = call(A, tr, 'Write', { content: current.replace('Make the thing, and', 'Make the thing well, and') });
      // Each of the four is refused, by name, and the refusal says the approval is voided.
      const files = call(A, tr, 'Edit', FILES);
      const commands = call(A, tr, 'Edit', { old_string: '- git push', new_string: '- git push\n- git reset' });
      const goals = call(A, tr, 'Edit', { old_string: '1. The thing is built and read.', new_string: '1. The thing is built.' });
      const asked = call(A, tr, 'Edit', { old_string: OWN_WORDS, new_string: 'Do something else.' });
      const two = call(A, tr, 'MultiEdit', { edits: [STEP2, FILES, { old_string: '- git push', new_string: '- git push\n- git reset' }] });
      const writeGoals = call(A, tr, 'Write', { content: current.replace('1. The thing is built and read.', '1. The thing is built.') });
      // Not the main thread, not this session, no scope recorded, an edit that cannot be applied, a plan changed after approval.
      const agent = call(A, tr, 'Edit', STEP2, { agent_id: 'a1' });
      const other = call(A, tr, 'Edit', STEP2, { session_id: 'another-session' });
      const absent = call(A, tr, 'Edit', { old_string: 'text that is nowhere in the plan', new_string: 'x' });
      const ambiguous = call(A, tr, 'Edit', { old_string: 'the thing', new_string: 'the thing!' });
      const B = appHome(dir);
      const trB = approve(B);
      writeFileSync(B.plan, `${text}\nChanged behind the approval.\n`);
      const moved = call(B, trB, 'Edit', STEP);
      const C = appHome(dir);
      const trC = approve(C);
      const withoutScope = { ...C.mk() }; delete withoutScope.scope;
      writeFileSync(C.marker, JSON.stringify(withoutScope));
      const noScope = call(C, trC, 'Edit', STEP);
      // A change that got past the simulation: the real file's Files differ, so the marker keeps its hash and no plan is in force.
      const D = appHome(dir);
      const trD = approve(D);
      writeFileSync(D.plan, text.replace(FILES.old_string, FILES.new_string));
      const notCarried = call(D, trD, 'Edit', FILES, {}, '--amend');
      const statusOf = (Z) => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the scope test'], { encoding: 'utf8', env: { ...process.env, HOME: Z.home, CLAUDE_CODE_SESSION_ID: '' } }).stdout ?? '';
      const stuck = statusOf(D);
      // An agent's PostToolUse moves nothing; the main thread's does.
      const E = appHome(dir);
      const trE = approve(E);
      writeFileSync(E.plan, text.replace(STEP.old_string, STEP.new_string));
      call(E, trE, 'Edit', STEP, { agent_id: 'a1' }, '--amend');
      const agentLeft = E.mk()?.hash === sha(text);
      call(E, trE, 'Edit', STEP, {}, '--amend');
      const mainMoved = E.mk()?.hash === sha(text.replace(STEP.old_string, STEP.new_string));
      const carried = statusOf(E);
      // The owner's exit from plan mode in the app records the scope too.
      const F = appHome(dir);
      const uf = uid();
      const trF = transcript([turn(0, 'start'), ...enterPlan(-60), ...exitPlan(-20, false), exitEntry(-19, F.plan, uf)]);
      F.guard(trF, { tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      const scopeF = F.mk()?.scope;
      return same(Object.keys(mk0?.scope ?? {}), ['Goals', 'Asked', 'Files', 'Commands', 'Rules', 'Rules of this plan']) && same(mk0.scope, scope) && mk0.hash === sha(text)
        && steps.status === 0 && amended.status === 0 && mk1?.hash === sha(text.replace(STEP.old_string, STEP.new_string)) && same(mk1.scope, scope) && mk1.amendments === 1
        && order.status === 0 && whole.status === 0
        && refused(files, /Files/, /voids the approval/) && !/Commands/.test(files.stdout) && refused(commands, /Commands/) && refused(goals, /Goals/) && refused(asked, /Asked/)
        && refused(two, /Files/, /Commands/) && refused(writeGoals, /Goals/)
        && refused(agent, /voids its approval, and every write after it would be refused/) && refused(other, /another session/)
        && refused(absent, /could not be applied/) && refused(ambiguous, /could not be applied/)
        && refused(moved, /has changed since it was approved/) && refused(noScope, /every write after it would be refused/)
        && notCarried.status === 2 && /Files/.test(notCarried.stderr) && /NOT carried/.test(notCarried.stderr) && D.mk()?.hash === sha(text)
        && /Scope: CHANGED in Files\./.test(stuck) && /Match: NO/.test(stuck)
        && agentLeft && mainMoved && /Scope: Goals, Asked, Files, Commands, Rules, Rules of this plan are as approved\./.test(carried) && /Match: yes/.test(carried) && !/Scope: CHANGED/.test(carried)
        && same(scopeF, m.report.scopeHashes(STEPS_PLAN));
    },
  },
  {
    name: 'through hook-dispatch, an amendment of the approved plan\'s Steps keeps the plan in force for the gates that read it, and the amended step is cleared by a fresh review before it goes; an edit that changes Files is refused, and one that got past leaves no plan in force',
    guards: ['amend_wired', 'amend_rehash'],
    run(m, dir) {
      const sha = (t) => createHash('sha256').update(t).digest('hex');
      const text = reviewPlan(dir);
      const w = reviewWorld(dir);
      writeFileSync(join(w.home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan: w.plan, hash: sha(text), scope: m.report.scopeHashes(text), at: new Date().toISOString() }));
      const mk = () => JSON.parse(readFileSync(join(w.home, '.claude', 'APPROVED-PLAN.json'), 'utf8'));
      const go = (n) => w.send(n, sid('aw'));
      const STEP = { file_path: w.plan, old_string: '2. **Check.** Read the thing.', new_string: '2. **Check.** Read the thing twice.' };
      const FILES = { file_path: w.plan, old_string: '`keep.mjs`', new_string: '`keep.mjs`, `more.mjs`' };
      w.agent('d1', 1, -900, -800, 'DONE');
      w.agent('r1', 3, -700, -600, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const before = go(2);
      // The main thread edits the Steps: the write goes, and once it is made the plan is still the one in force.
      const edit = w.call('PreToolUse', { session_id: sid('aw'), tool_name: 'Edit', tool_input: STEP });
      const amended = text.replace(STEP.old_string, STEP.new_string);
      writeFileSync(w.plan, amended);
      const post = w.call('PostToolUse', { session_id: sid('aw'), tool_name: 'Edit', tool_input: STEP });
      const moved = mk().hash === sha(amended);
      // The plan was written just now, after the review began: the review is stale, not the approval.
      const stale = go(2);
      const written = (Date.now() - 300 * 1000) / 1000;
      utimesSync(w.plan, written, written);
      w.agent('r3', 3, -200, -100, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const cleared = go(2);
      // An edit to Files is refused; one that got past it is not carried to the marker and no plan stands.
      const files = w.call('PreToolUse', { session_id: sid('aw'), tool_name: 'Edit', tool_input: FILES });
      writeFileSync(w.plan, amended.replace(FILES.old_string, FILES.new_string));
      const lost = w.call('PostToolUse', { session_id: sid('aw'), tool_name: 'Edit', tool_input: FILES });
      const none = go(2);
      return before.status === 0 && edit.status === 0 && post.status === 0 && moved
        && stale.status === 2 && /REVIEW GATE/.test(stale.stderr) && !/No approved plan/.test(stale.stderr)
        && cleared.status === 0
        && files.status === 2 && /Files/.test(files.stdout + files.stderr)
        && lost.status === 2 && /NOT carried/.test(lost.stderr) && mk().hash === sha(amended)
        && none.status === 2 && /DISPATCH GATE[\s\S]*No approved plan/.test(none.stderr) && /Scope: CHANGED in Files/.test(none.stderr);
    },
  },
  {
    name: 'with a review step in the plan, a turn that ends with steps left is refused naming the step the current review cleared, or the review step when none is current; a standing correction does not let it end, a standing stop does, and a choice or a declared stop still does',
    guards: ['stop_guard_stop', 'stop_guard_review_corr', 'stop_guard_names_cleared', 'stop_guard_names_review'],
    run(m, dir) {
      const w = reviewWorld(dir);
      const s = sid('sr');
      const REPORT = 'Here is the report of what the gates now do, and what each one refuses.';
      const say = (text, entries = [turn(0, GO)]) => {
        writeFileSync(w.tr, jsonl([...entries, reply(5, text)]));
        return spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: s, transcript_path: w.tr }), encoding: 'utf8', env: { ...process.env, HOME: w.home } });
      };
      const err = (r) => r.stderr ?? '';
      const WRONG = [turn(0, GO), turn(3, 'That was done wrong, so answer me before anything else.')];
      const STOPPED = [turn(0, GO), turn(3, 'Stop. Nothing more until I answer.')];
      // Nothing has handed back: the review step is the move.
      const none = say(REPORT);
      // Step 1 DONE and a review that began after it clears step 2: that step is the move.
      w.agent('d1', 1, -900, -800, 'DONE');
      w.agent('r1', 3, -700, -600, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const cleared = say(REPORT);
      const correction = say(REPORT, WRONG);
      const stopped = say(REPORT, STOPPED);
      const choice = say('Open for you, one choice:\n1. (Recommended) Land the gates as they are built.\n2. Hold them for a second review.\n\n' + REPORT);
      const declared = say('Stopping here: open for you is the order of the two remaining changes.\n\n' + REPORT);
      // Step 2 REFUSED after the review began: the review is stale, so the review step is the move again.
      w.agent('d2', 2, -500, -400, 'REFUSED');
      const stale = say(REPORT);
      // Both steps DONE: nothing is left.
      w.agent('d2', 2, -500, -400, 'DONE');
      const all = say(REPORT);
      return none.status === 2 && err(none).includes('next: step 1') && err(none).includes(`${w.plan} step 3`) && /No review is current \(missing\)/.test(err(none))
        && cleared.status === 2 && /cleared step 2 and no other/.test(err(cleared)) && err(cleared).includes(`${w.plan} step 2`)
        && correction.status === 2 && /cleared step 2 and no other/.test(err(correction))
        && stopped.status === 0 && choice.status === 0 && declared.status === 0
        && stale.status === 2 && /No review is current \(stale\)/.test(err(stale)) && err(stale).includes(`${w.plan} step 3`)
        && all.status === 0;
    },
  },
  {
    name: 'every status prints a Review line under the pointer, read by the function the review gate refuses on: none handed back, a review that clears a step, and a plan whose Standing step does not follow the hub\'s aim-review.md; each state of the line says what to send',
    guards: ['review_status_print', 'review_block_text'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('rv');
      const proj = join(home, '.claude', 'projects', '-home-user');
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(proj, `${s}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
      const plan = join(home, '.claude', 'plans', 'gate-test.md');
      const marker = join(home, '.claude', 'APPROVED-PLAN.json');
      const approve = (body) => { writeFileSync(plan, body); writeFileSync(marker, JSON.stringify({ plan, hash: createHash('sha256').update(body).digest('hex'), at: new Date().toISOString() })); const old = (Date.now() - 60 * 60 * 1000) / 1000; utimesSync(plan, old, old); };
      approve(reviewPlan(dir));
      writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - 10 * 60000, status: 'Status' }));
      const status = () => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the review test'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: s } }).stdout ?? '';
      const first = status();
      putAgent(subs, plan, 'a1', 1, -900, -800, 'DONE');
      putAgent(subs, plan, 'a3', 3, -700, -600, 'ON-AIM ROUTE-CLEAR step 1 next 2');
      const second = status();
      approve(ORDER_PLAN);
      const plain = status();
      const at1 = (out, a, b) => out.indexOf(a) >= 0 && out.indexOf(a) < out.indexOf(b);
      const block = (kind, extra = {}) => m.report.reviewBlock({ kind, reviewers: [3], step: 1, first: 'ON-AIM ROUTE-CLEAR step 1 next 2', review: { at: 200, startAt: 150 }, cleared: 2, ...extra });
      return /^Review: none has handed back; no step in Order has ended yet\. Send Standing step 3\.$/m.test(first) && at1(first, 'next: step 1', 'Review: none') && at1(first, 'Review: none', '— the review test')
        && /^Review: the review that ended .* reads "ON-AIM ROUTE-CLEAR step 1 next 2"; it clears step 2 and no other\.$/m.test(second) && at1(second, 'next: step 2', 'Review: the review')
        && /^Review: not enforced \(/m.test(plain)
        && /not read/.test(block('not-read')) && /Send Standing step 3/.test(block('stale')) && /not a verdict/.test(block('unreadable')) && /off aim/.test(block('off-aim'))
        && /route is refused/.test(block('route-refused')) && /judged another step/.test(block('wrong-step')) && /names no step to send/.test(block('no-next')) && /running/.test(block('running'));
    },
  },

  // ---- the shared rules: a plan points at one file instead of copying it (Doctrine §0e rule 13) ----
  {
    name: 'a plan that sends agents carries the rules or points at them: a Rules section that is the pointer line at the file\'s current version passes (with a list marker or backticks round the path too), and so does a copy of every rule line with rules added; no Rules section, a pointer at another file or at another version, a copy that drops or alters a rule, and a rules file that cannot be read as one are refused; a plan with no Steps is not judged',
    guards: ['rules_steps_only', 'rules_missing', 'rules_pointer_parse', 'rules_pointer_path', 'rules_pointer_version', 'rules_copy_whole', 'rules_unreadable'],
    run(m, dir) {
      const file = join(dir, 'agent-rules.md');
      const text = (rules) => ['# T', '', '## Steps', '1. **Build.** Make it.', '', ...(rules === null ? [] : ['## Rules', rules, '']), '## Files', '- Hub: `a.mjs`', ''].join('\n');
      const problem = (rules, f = file) => m.dispatch.rulesProblem(text(rules), f);
      const refuses = (rules, re, f = file) => { const x = problem(rules, f); return typeof x === 'string' && re.test(x); };
      const block = m.report.agentRules(file).block;
      const broken = join(tmp('sg-rules-'), 'agent-rules.md');
      writeFileSync(broken, '# Rules\n\nThere is no version line here.\n- one rule\n');
      const absent = join(tmp('sg-rules-'), 'absent.md');
      const altered = [block[0].replace('Never', 'Always'), ...block.slice(1)];
      return RULES_VERSION > 0 && block.length >= 5
        && m.dispatch.rulesProblem('# T\n\n## Files\n- Hub: `a.mjs`\n', file) === null
        && problem(rulesLine(dir)) === null && problem(`- ${rulesLine(dir)}`) === null
        && problem(`Rules: \`${file}\`, version ${RULES_VERSION}.`) === null
        && problem(block.join('\n')) === null && problem([...block, '- A rule of the plan\'s own.'].join('\n')) === null
        && refuses(null, /no "## Rules" section/)
        && refuses('Nothing of the kind.', /lacks \d+ of the file's \d+ rule lines/)
        && refuses(`Rules: /somewhere/else/agent-rules.md, version ${RULES_VERSION}.`, /not this hub's rules file/)
        && refuses(rulesLine(dir, RULES_VERSION + 1), new RegExp(`pins version ${RULES_VERSION + 1} and the file now says version ${RULES_VERSION}`))
        && refuses(block.slice(1).join('\n'), /lacks 1 of the file's/)
        && refuses(altered.join('\n'), /lacks 1 of the file's/)
        && refuses(rulesLine(dir), /cannot be read as a rules file/, broken)
        && refuses(rulesLine(dir), /cannot be read as a rules file/, absent);
    },
  },
  {
    name: 'the rules gate sends no step while the version a plan\'s Rules line pins is not the rules file\'s, and does not latch: the Standing review step is held too, and the refusal names the amendment of the Rules line; a prompt that is no step of the plan, a tool that sends no agent, a subagent\'s call, a plan that copies the rules and a plan that pins the current version are not held',
    guards: ['rules_pin_version', 'rules_pin_path', 'rules_pin_none', 'rules_pin_unread', 'rules_gate_step', 'rules_gate_agent', 'rules_gate_wired', 'rules_gate_no_latch'],
    run(m, dir) {
      const file = join(dir, 'agent-rules.md');
      const withRules = (line) => STEPS_PLAN.replace('## Commands', `## Rules\n${line}\n\n## Commands`);
      const planOf = (line) => ({ path: '/plans/gate-test.md', text: withRules(line) });
      const send = (n, extra = {}) => ({ tool_name: 'Agent', tool_input: { prompt: `/plans/gate-test.md step ${n}` }, ...extra });
      const gate = (p, pl) => m.dispatch.rulesGate(p, pl, file);
      const old = rulesLine(dir, RULES_VERSION + 1);
      const stale = gate(send(1), planOf(old));
      const review = gate(send(2), planOf(old));
      const other = gate(send(1), planOf(`Rules: /somewhere/else/agent-rules.md, version ${RULES_VERSION}.`));
      const copies = gate(send(1), { path: '/plans/gate-test.md', text: withRules(m.report.agentRules(file).block.join('\n')) });
      const notStep = gate({ tool_name: 'Agent', tool_input: { prompt: 'do something else entirely' } }, planOf(old));
      const readTool = gate({ tool_name: 'Read', tool_input: { file_path: '/plans/gate-test.md' } }, planOf(old));
      const agent = gate(send(1, { agent_id: 'a1' }), planOf(old));
      const unread = m.dispatch.rulesPinProblem(withRules(rulesLine(dir)), join(tmp('sg-rules-'), 'absent.md'));
      // Wired into the dispatcher: a stale pin refuses the send and writes no latch; the current pin lets it on.
      const s1 = sid('rl'), s2 = sid('rl');
      const sendIn = (w, s) => w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const held = sendIn(world(dir, [turn(0, GO)], withRules(old)), s1);
      const free = sendIn(world(dir, [turn(0, GO)], withRules(rulesLine(dir))), s2);
      return typeof stale === 'string' && /^RULES GATE/.test(stale) && /pins version \d+ and .* now says version \d+/.test(stale) && /amend the Rules line/.test(stale) && /does not latch/.test(stale)
        && typeof review === 'string' && /^RULES GATE/.test(review)
        && typeof other === 'string' && /not this hub's rules file/.test(other)
        && copies === null && notStep === null && readTool === null && agent === null
        && typeof unread === 'string' && /cannot be read as a rules file/.test(unread)
        && held.status === 2 && /RULES GATE/.test(held.stderr) && !latched(s1)
        && free.status === 0 && !latched(s2);
    },
  },
  {
    name: 'ExitPlanMode refuses a plan that sends agents with no Rules section or a pointer at another version, and a plan whose Files names a repository with unanswered queued findings; the same plan with the pointer and a Found answered section passes, and one that names a repository with no queue is not asked',
    guards: ['rules_plan_guard_wired', 'queue_plan_guard_wired'],
    run(m, dir) {
      const A = repo({ 'a.txt': 'x\n', 'NOTES.md': QUEUE_NOTES }, 'queue-repo');
      const C = repo({ 'c.txt': 'a line of text that the plan can quote\n' }, 'quiet-repo');
      const all = 'Q-QR-1: fixed in step 1.\nQ-QR-2: carried to step 2.\nQ-QR-3: dropped, the finding no longer applies here.';
      const files = '- queue-repo: `a.txt`';
      // Every plan that names a repository quotes what it rests on (Doctrine §0e rule 2): a line of a file the repository holds.
      const what = '- "the first finding, which has some words in it" (NOTES.md, the queue section).';
      const said = (r) => `${r.stdout}${r.stderr}`;
      const good = exitFor(dir, sendingPlan(dir, { files, answered: all, what }), A.dir);
      const unanswered = exitFor(dir, sendingPlan(dir, { files, what }), A.dir);
      const noRules = exitFor(dir, sendingPlan(dir, { rules: null, files, answered: all, what }), A.dir);
      const stale = exitFor(dir, sendingPlan(dir, { rules: rulesLine(dir, RULES_VERSION + 1), files, answered: all, what }), A.dir);
      const quiet = exitFor(dir, sendingPlan(dir, { files: '- quiet-repo: `c.txt`', what: '- "a line of text that the plan can quote" (c.txt).' }), C.dir);
      return good.status === 0 && quiet.status === 0
        && unanswered.status === 2 && said(unanswered).includes('FOUND QUEUE') && said(unanswered).includes('Q-QR-2')
        && noRules.status === 2 && said(noRules).includes('SHARED RULES') && said(noRules).includes('Rules')
        && stale.status === 2 && said(stale).includes('SHARED RULES') && said(stale).includes(`version ${RULES_VERSION + 1}`);
    },
  },

  // ---- the finding queue: recorded for the next plan, answered line by line (Doctrine §0e rule 2) ----
  {
    name: 'a plan answers every finding queued for the repositories its Files names, line by line, in a Found answered section: a key is read in three forms of line, only from the queue section; an unanswered key, a verdict with no step or no reason, an answer outside the section and another repository\'s key each leave it unanswered; a repository the plan does not name, one with no queue and a plan whose Files names none are not asked',
    guards: ['queue_section', 'queue_key_forms', 'queue_roots_label', 'queue_verdict_step', 'queue_verdict_reason', 'queue_answered_section', 'queue_listed'],
    run(m) {
      const A = repo({ 'a.txt': 'x\n', 'NOTES.md': QUEUE_NOTES }, 'queue-repo');
      const B = join(dirname(A.dir), 'other-repo');
      mkdirSync(B);
      spawnSync('git', ['-C', B, 'init', '-q']);
      writeFileSync(join(B, 'NOTES.md'), '# Notes\n\n## Found queue\nQ-OT-1: another repository\'s finding, in its own queue.\n');
      const Q = repo({ 'q.txt': 'x\n', 'NOTES.md': '# Notes\n\nNo queue here.\n' }, 'plain-repo');
      // The Leaves open section holds an answer outside the Found answered section, which must count for nothing.
      const plan = (files, answered) => ['# T', '', '## Files', ...files, '', ...(answered === null ? [] : ['## Found answered', ...answered, '']), '## Leaves open', 'Q-QR-1: fixed in step 1. (written outside the answered section)', ''].join('\n');
      const one = ['- queue-repo: `a.txt`'];
      const both = ['- queue-repo: `a.txt`', '- other-repo: `n.txt`'];
      const fine = ['Q-QR-1: fixed in step 4.', '- Q-QR-2: carried to step 7', 'Q-QR-3: still queued, waits on a design choice.'];
      const judge = (files, answered, dir = A.dir) => m.dispatch.foundAnsweredProblem(plan(files, answered), { dir });
      const names = (r, ...keys) => typeof r === 'string' && /^FOUND QUEUE/.test(r) && keys.every((k) => r.includes(k));
      const lacks = (r, ...keys) => keys.every((k) => !r.includes(k));
      const q = m.dispatch.foundQueue(A.dir);
      const none = judge(one, null);
      const withShort = judge(one, [fine[0], fine[1], 'Q-QR-3: dropped, x']);
      const noReason = judge(one, [fine[0], fine[1], 'Q-QR-3: still queued']);
      const noStep = judge(one, ['Q-QR-1: fixed', fine[1], fine[2]]);
      const foreign = judge(one, ['Q-OT-1: fixed in step 1.', fine[1], fine[2]]);
      const twoRepos = judge(both, fine);
      return q.map((x) => x.key).join(',') === 'Q-QR-1,Q-QR-2,Q-QR-3' && q[1].text.startsWith('the second finding') && q[2].text.startsWith('the third finding')
        && names(none, 'Q-QR-1', 'Q-QR-2', 'Q-QR-3', '3 queued findings') && lacks(none, 'Q-QR-9', 'Q-OT-1')
        && judge(one, fine) === null
        && names(withShort, 'Q-QR-3') && lacks(withShort, 'Q-QR-1', 'Q-QR-2')
        && names(noReason, 'Q-QR-3') && lacks(noReason, 'Q-QR-1', 'Q-QR-2')
        && names(noStep, 'Q-QR-1') && lacks(noStep, 'Q-QR-2', 'Q-QR-3')
        && names(foreign, 'Q-QR-1') && names(twoRepos, 'Q-OT-1') && lacks(twoRepos, 'Q-QR-')
        && judge(both, [...fine, 'Q-OT-1: dropped, the plan no longer touches it.']) === null
        && judge(['- plain-repo: `q.txt`'], null, Q.dir) === null
        && judge(['- no-such-repo: `a.txt`'], null) === null
        && m.dispatch.foundAnsweredProblem('# T\n\n## Steps\n1. x\n', { dir: A.dir }) === null
        && m.dispatch.queueRoots(plan(one, null), A.dir).join() === A.dir && m.dispatch.queueRoots(plan(both, null), A.dir).sort().join() === [A.dir, B].sort().join();
    },
  },

  // ---- the state page: the manager's notes, kept where a status cannot rewrite them ----
  {
    name: 'the manager\'s notes survive a status, and the page draws from them the next move and the Found lines not fixed, stopping the plan first, then queued, each tagged in words, with a count of those not sorted yet, while a fixed Found line, an explanation and a decision stay in the notes; the print says the same, a later line for a Found key replaces an earlier one, and everything drawn from the notes is escaped',
    guards: ['mgr_found_key', 'mgr_sort_regex', 'mgr_evidence_split', 'mgr_page_notes', 'mgr_print_tag', 'mgr_print_line', 'mgr_sort_group', 'mgr_step_wildcard', 'mgr_specific_first'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('mp');
      const proj = join(home, '.claude', 'projects', '-home-user');
      mkdirSync(join(proj, s, 'subagents'), { recursive: true });
      writeFileSync(join(proj, `${s}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      const plan = join(home, '.claude', 'plans', 'gate-test.md');
      mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
      writeFileSync(plan, ORDER_PLAN);
      writeFileSync(join(home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan, hash: createHash('sha256').update(ORDER_PLAN).digest('hex'), at: new Date().toISOString() }));
      writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - 10 * 60000, status: 'Status' }));
      const temp = tmp('sg-tmp-');
      const pad = join(temp, 'claude-0', '-home-user', s, 'scratchpad');
      mkdirSync(join(pad, 'progress'), { recursive: true });
      mkdirSync(join(pad, 'status'), { recursive: true });
      writeFileSync(join(pad, 'progress', 'step-1-report.txt'), 'Work done.\nFound: first thing, not fixed here\nFound: second thing, left for later\nFound: third thing, <i>marked</i>\n');
      writeFileSync(join(pad, 'progress', 'step-2-report.txt'), 'Found: the fourth thing blocks the plan\n');
      const status = () => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the notes test'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: s, TMPDIR: temp } }).stdout ?? '';
      const page = () => readFileSync(join(pad, 'status', 'fix-run.html'), 'utf8');
      const before = status(), beforePage = page();
      const notes = ['# the manager\'s notes', 'Outcome: A reader opens the page and sees what was put right, <b>bold</b> or not.',
        'Explanation standing: the gate reads the <u>wrong</u> file | the report names that file',
        'Explanation ruled out: the clock was wrong | the status printed the right time',
        'Decision: build the page first | the other pieces read it',
        'Next: send step 2 once the review clears it',
        'Found 1.1 fixed: put right in step 3', 'Found 1.2 fixed: an earlier line', 'Found 1.2 queued: the later line wins', 'Found 2.1 stopping: it blocks the plan',
        'a line with no label is ignored', ''].join('\n');
      writeFileSync(join(pad, 'status', 'manager.txt'), notes);
      const after = status(), afterPage = page();
      const at1 = (out, a, b) => out.indexOf(a) >= 0 && out.indexOf(a) < out.indexOf(b);
      const parsed = m.report.managerNotes(pad);
      // A whole step sorted at once, with one finding of it kept apart: the line for the finding beats the line for the step.
      const pad2 = join(temp, 'bulk');
      mkdirSync(join(pad2, 'status'), { recursive: true });
      writeFileSync(join(pad2, 'status', 'manager.txt'), 'Found 7.* fixed: all of step 7\nFound 7.2 queued: but this one stays\n');
      const bulk = m.report.sortFound([{ step: 7, n: 1, key: '7.1' }, { step: 7, n: 2, key: '7.2' }, { step: 8, n: 1, key: '8.1' }], m.report.managerNotes(pad2));
      return bulk.fixed.map((x) => x.key).join() === '7.1' && bulk.queued.map((x) => x.key).join() === '7.2' && bulk.unsorted.map((x) => x.key).join() === '8.1' && bulk.fixed[0].note === 'all of step 7'
        && before.includes(`State page: no manager notes at ${join(pad, 'status', 'manager.txt')}`) && before.includes('Found, from the report files (4: 0 fixed, 0 stopping the plan, 0 queued, 4 unsorted):')
        && beforePage.includes('<li>4 Found lines are not sorted yet by the manager; the status print lists each.</li>') && !beforePage.includes('first thing, not fixed here')
        && !beforePage.includes('class="tag">queued<') && !beforePage.includes('class="tag">stopping the plan<')
        && after.includes('State page: manager notes read from') && after.includes('explanations standing 1, ruled out 1; decisions 1; a next move written; 1 of 4 Found lines unsorted.')
        && after.includes('- step 1 #1 [fixed]: Found: first thing, not fixed here (put right in step 3)') && after.includes('- step 1 #2 [queued]: Found: second thing, left for later (the later line wins)')
        && after.includes('- step 2 #1 [stopping]: Found: the fourth thing blocks the plan') && after.includes('- step 1 #3 [unsorted]: Found: third thing, <i>marked</i>')
        && after.includes('Found, from the report files (4: 1 fixed, 1 stopping the plan, 1 queued, 1 unsorted):')
        && !afterPage.includes('A reader opens') && !afterPage.includes('the gate reads') && !afterPage.includes('the clock was wrong') && !afterPage.includes('build the page first')
        && afterPage.includes('The next move: send step 2 once the review clears it')
        && !afterPage.includes('marked') && afterPage.includes('<li>1 Found line is not sorted yet by the manager; the status print lists it.</li>')
        && !afterPage.includes('first thing, not fixed here')
        && at1(afterPage, 'class="tag">stopping the plan<', 'class="tag">queued<')
        && afterPage.includes('<span class="tag">queued</span> Step 1 #2: second thing, left for later') && afterPage.includes('<span class="tag">stopping the plan</span> Step 2 #1: the fourth thing blocks the plan')
        && readFileSync(join(pad, 'status', 'manager.txt'), 'utf8') === notes
        && parsed.read && parsed.standing[0].evidence === 'the report names that file' && parsed.ruledOut.length === 1 && parsed.decisions[0].reason === 'the other pieces read it'
        && parsed.sorts.get('1.2').how === 'queued' && !m.report.managerNotes(join(pad, 'nowhere')).read && !m.report.managerNotes(null).read;
    },
  },
  {
    name: 'the status page is drawn in the shape the owner reads: a heading and an updated line in California time, Versions from the Version lines, one section for each step with its number, its title and a chip in colour and in words (done, running, under review, open, or held with what it waits on), what it is, where it stands and the Why, Next and Counted done lines, one Reviews line with no chip, Open for you from the Open lines, and Found and not fixed in the report\'s own words; a Done line makes a step green whatever its newest end, no Decision, Explanation or fixed Found line is drawn, and the colours are six-digit tokens with a dark pair',
    guards: ['page_notes_version', 'page_notes_open', 'page_notes_what', 'page_notes_why', 'page_notes_nexts', 'page_notes_done', 'page_chip_done_line', 'page_chip_running', 'page_chip_review', 'page_chip_review_only_running',
      'page_chip_open', 'page_chip_held_after', 'page_chip_standing', 'page_chip_words', 'page_review_line', 'page_review_verdict', 'page_review_running', 'page_what_fallback', 'page_where_stands', 'page_why_line', 'page_next_line',
      'page_counted_done', 'page_versions', 'page_escape_versions', 'page_open_lines', 'page_found_stopping', 'page_found_unsorted', 'page_found_queued', 'page_found_fixed_hidden', 'page_no_decisions', 'page_dark_pair',
      'page_tokens_six', 'page_one_per_line', 'page_updated_line', 'page_stands_interrupted', 'page_found_plan_only', 'pointer_escape'],
    run(m) {
      const pad = join(tmp('sg-shape-'), 'pad');
      mkdirSync(join(pad, 'status'), { recursive: true });
      writeFileSync(join(pad, 'status', 'manager.txt'), ['# the notes the page is drawn from',
        'Version: Production carries the first build, <b>marked</b>.', 'Version: Staging carries the second build.',
        'Open: Your device pass on staging.', 'Open: A choice between two pictures.',
        'What 1: Build the first thing.', 'What 1: Build the very first thing.', 'Why 1: The roadmap asks for it.', 'Next 1: The scope verdict.',
        'Done 3: counted done by decision, its change is in the tree', 'Done 11:',
        'Next: step 5, after the review',
        'Explanation standing: an explanation text | its evidence', 'Decision: a decision text | its reason',
        'Found 4.1 fixed: done', 'Found 4.2 queued: later', 'Found 4.3 stopping: blocks', 'Found 99.1 queued: older', ''].join('\n'));
      const notes = m.report.managerNotes(pad);
      const back = (lines, n) => ({ id: `agent-${n}`, how: 'a report', at: n, lines, path: '' });
      const step = (n, state, lines, standing = false, how = 'a report') => ({ step: n, standing, state, back: lines ? { ...back(lines, n), how } : null, report: '', reportWritten: false });
      const st = {
        read: true, why: '', planPath: '/plans/x.md', title: 'A plan about <b>things</b>', goalOne: '', leaves: [], reviewers: [7], manager: notes, managerPath: '',
        titles: new Map([[1, 'Build the thing, then read it'], [2, 'Check'], [3, 'Counted past a refusal, by decision'], [4, 'Mend the fence, then run it'], [5, 'Reviewed next'], [6, 'Held later'], [7, 'Review'], [8, 'Timer'], [9, 'Timer two']]),
        pointer: { order: [1, 2, 3, 4, 5, 6], standing: [7, 8, 9], done: new Set([1]), next: 2 },
        steps: [step(1, 'DONE', ['DONE', 'The second line.']), step(2, 'running', ['error: the tool use was rejected'], false, 'an interruption'), step(3, 'REFUSED', ['REFUSED', 'The second line.']), step(4, 'REFUSED', ['REFUSED', 'The second line.']),
          step(5, 'not sent', null), step(6, 'not sent', null),
          step(7, 'running', ['ON-AIM ROUTE-CLEAR step 2 next 5, then more words that the page must not carry', 'The second line.'], true), step(8, 'not sent', null, true), step(9, 'running', null, true)],
        // Steps 4 and 99: the plan's own step, and a step of an earlier plan whose findings the notes queue already carries.
        found: [{ step: 4, n: 1, key: '4.1', line: 'Found: a fixed thing' }, { step: 4, n: 2, key: '4.2', line: 'Found: a queued <i>thing</i>' },
          { step: 4, n: 3, key: '4.3', line: 'Found: a thing that stops the plan' }, { step: 4, n: 4, key: '4.4', line: 'Found: a thing with no sort yet' },
          { step: 99, n: 1, key: '99.1', line: 'Found: a finding of an earlier plan' }, { step: 99, n: 2, key: '99.2', line: 'Found: an unsorted finding of an earlier plan' }] };
      const now = new Date('2026-10-19T14:15:00Z');
      const page = m.report.statusPage(st, 'Status 07:15 — the shape test', now);
      const at1 = (a, b) => page.indexOf(a) >= 0 && page.indexOf(a) < page.indexOf(b);
      const head = (n, cls, words, title) => `<h2>${n}. ${title} <span class="chip ${cls}">${words}</span></h2>`;
      const h1 = head(1, 'done', 'done', 'Build the thing, then read it'), h3 = head(3, 'done', 'done', 'Counted past a refusal, by decision'), h4 = head(4, 'open', 'open', 'Mend the fence, then run it');
      const h6 = head(6, 'held', 'held, after step 5', 'Held later');
      // The same page when nothing is written, nothing is reviewed and one step is next; and a page whose plan could not be read.
      const bare = { ...st, reviewers: [], manager: m.report.managerNotes(null), found: [], leaves: ['The thing may need a second read.'],
        pointer: { order: [1, 2], standing: [], done: new Set([1]), next: 2 }, steps: [step(1, 'DONE', ['DONE']), step(2, 'not sent', null)] };
      const bare2 = m.report.statusPage(bare, 'x', now);
      const unread = m.report.statusPage({ read: false, why: 'no plan is in force', title: '', titles: new Map(), steps: [], found: [], reviewers: [], pointer: null, goalOne: '', leaves: [], manager: m.report.managerNotes(null) }, 'x', now);
      const noReviewRunning = { ...st, steps: st.steps.map((x) => (x.step === 7 ? { ...x, state: 'ended by a report' } : x)) };
      const checks = [
        ['the keys of the notes', notes.versions.length === 2 && notes.versions[1] === 'Staging carries the second build.' && notes.open.length === 2 && notes.what.get(1) === 'Build the very first thing.'
          && notes.why.get(1) === 'The roadmap asks for it.' && notes.nexts.get(1) === 'The scope verdict.' && notes.next === 'step 5, after the review'
          && (notes.done.get(3) ?? '').startsWith('counted done by decision') && notes.done.has(11) && notes.done.get(11) === '' && !notes.done.has(4) && !notes.what.has(2)],
        ['the heading, the title and the updated line in California time', page.includes('<h1>Plan run status</h1>') && page.includes('<title>Plan run status</title>')
          && page.includes('A plan about &lt;b&gt;things&lt;/b&gt; · updated 2026-10-19 07:15 (California): Status 07:15 — the shape test')],
        ['the next line the reviewer reads', page.includes('<strong>next: step 2</strong>') && page.includes('The next move: step 5, after the review')],
        ['Versions in file order, escaped', at1('<h2>Versions</h2>', 'Production carries the first build, &lt;b&gt;marked&lt;/b&gt;.') && at1('Production carries the first build', 'Staging carries the second build.') && !page.includes('<b>marked</b>')],
        ['a chip for each state, in colour and in words', page.includes(h1) && page.includes(head(2, 'wait', 'running', 'Check')) && page.includes(h3) && page.includes(h4)
          && page.includes(head(5, 'wait', 'under review', 'Reviewed next')) && page.includes(h6) && page.includes(head(8, 'held', 'held, sent at any time', 'Timer')) && page.includes(head(9, 'wait', 'running', 'Timer two'))],
        ['a step counted done by decision shows green and says so, past its refusal', at1(h3, '<li>Counted done: counted done by decision, its change is in the tree</li>') && at1('<li>Counted done: counted done', h4)
          && m.report.stepChip({ ...st, manager: m.report.managerNotes(null) }, st.steps[2]).cls === 'open'],
        ['under review only while a review runs', m.report.stepChip(noReviewRunning, st.steps[4]).words === 'held, after step 4' && m.report.stepChip(st, st.steps[4]).words === 'under review'],
        ['the review step is one Reviews line and no section of its own', !page.includes('7. Review') && page.includes('<h2>Reviews</h2>\n<p>ON-AIM ROUTE-CLEAR step 2 next 5; a review is running</p>') && !page.includes('more words that the page must not carry')],
        ['what it is, from the What line or the title up to its first comma', page.includes('<li>What it is: Build the very first thing.</li>') && page.includes('<li>What it is: Mend the fence</li>') && page.includes('<li>What it is: Check</li>')],
        ['where it stands, from the newest hand-back, or why there is none', page.includes('<li>Where it stands: DONE</li>') && page.includes('<li>Where it stands: running, no hand-back yet</li>')
          && page.includes('<li>Where it stands: REFUSED</li>') && page.includes('<li>Where it stands: not sent</li>')
          && page.includes('<li>Where it stands: ended by an interruption, with no hand-back</li>') && !page.includes('the tool use was rejected')],
        ['the Why and Next lines of a step, and the unnumbered Next on no step', page.includes('<li>Why: The roadmap asks for it.</li>') && page.includes('<li>Next: The scope verdict.</li>') && (page.match(/<li>Next: /g) ?? []).length === 1],
        ['Open for you from the Open lines', at1('<h2>Open for you</h2>', 'Your device pass on staging.') && at1('Your device pass on staging.', 'A choice between two pictures.')],
        ['Found and not fixed: stopping, then queued, tagged in words, and the lines with no sort yet counted and not listed', page.includes('<span class="tag">queued</span> Step 4 #2: a queued &lt;i&gt;thing&lt;/i&gt;')
          && page.includes('<span class="tag">stopping the plan</span> Step 4 #3: a thing that stops the plan') && at1('class="tag">stopping the plan<', 'class="tag">queued<')
          && page.includes('<li>1 Found line is not sorted yet by the manager; the status print lists it.</li>') && !page.includes('a thing with no sort yet')],
        ['only the Found lines of the plan\'s own steps, queued or not', !page.includes('a finding of an earlier plan') && !page.includes('an unsorted finding of an earlier plan')],
        ['a fixed Found line, an explanation and a decision are not drawn', !page.includes('a fixed thing') && !page.includes('an explanation text') && !page.includes('a decision text') && !page.includes('its reason') && !page.includes('its evidence')],
        ['the sections in order', at1('<h2>Versions</h2>', h1) && at1(h1, h6) && at1(h6, '<h2>Reviews</h2>') && at1('<h2>Reviews</h2>', '<h2>Open for you</h2>') && at1('<h2>Open for you</h2>', '<h2>Found and not fixed</h2>')],
        ['one bullet to a line', !page.split('\n').some((l) => (l.match(/<li>/g) ?? []).length > 1)],
        ['no table, and a viewport', !/<table/i.test(page) && page.includes('name="viewport"')],
        ['a dark pair for every colour token', page.includes('prefers-color-scheme: dark') && page.includes(':root[data-theme="dark"]') && ['--done', '--wait', '--held', '--open'].every((t) => (page.match(new RegExp(`${t}:`, 'g')) ?? []).length === 3)],
        ['six-digit colours, never eight', !/#[0-9a-fA-F]{8}(?![0-9a-fA-F])/.test(page) && (page.match(/#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g) ?? []).length >= 24],
        ['with nothing written: a step next to send, the plan\'s own open list, no Reviews, no versions', bare2.includes(head(2, 'held', 'held, next to send', 'Check')) && bare2.includes('Nothing is waiting on the owner: the plan runs to its end, and step 2 is next.')
          && !bare2.includes('<h2>Reviews</h2>') && bare2.includes('<li>none written</li>') && bare2.includes('<li>none</li>')],
        ['a plan that could not be read still draws a page', unread.includes('next: not read (no plan is in force)') && unread.includes('<h2>Steps</h2>')],
      ];
      const failed = checks.filter(([, ok]) => !ok).map(([label]) => label);
      if (failed.length) throw new Error(`the page failed: ${failed.join('; ')}`);
      return true;
    },
  },
  // ---- the steps of a plan with no Order and the time chips of every step (NOTES Q-HUB-42, LESSONS §419) ----
  {
    name: 'the manager\'s notes carry the two keys of the time chips: `Start N: HH:MM` is read as minutes after midnight in California time, a later line for a step replacing an earlier one, and a clock time that is not one (an hour past 23, a minute past 59, words) is not read; `Estimate N: M min` is read as a whole number of minutes above zero with the word min optional; a line with no step number is read as neither',
    guards: ['page_notes_start', 'page_notes_estimate', 'page_notes_start_range', 'page_notes_estimate_positive'],
    run(m) {
      const pad = join(tmp('sg-keys-'), 'pad');
      mkdirSync(join(pad, 'status'), { recursive: true });
      writeFileSync(join(pad, 'status', 'manager.txt'), ['Start 4: 07:15', 'Start 4: 7:20', 'Start 5: 23:59', 'Start 6: 24:00', 'Start 7: 07:60', 'Start 8: soon', 'Start: 08:00',
        'Estimate 4: 25 min', 'Estimate 5: 40', 'Estimate 5: 45 minutes', 'Estimate 6: 0 min', 'Estimate 7: many', 'Estimate: 30 min', ''].join('\n'));
      const n = m.report.managerNotes(pad);
      const none = m.report.managerNotes(null);
      const checks = [
        ['a start is minutes after midnight, and a later line for the step replaces an earlier one', n.starts.get(4) === 7 * 60 + 20 && n.starts.get(5) === 23 * 60 + 59],
        ['a start that is not a clock time is not read, nor one with no step', !n.starts.has(6) && !n.starts.has(7) && !n.starts.has(8) && n.starts.size === 2],
        ['an estimate is whole minutes, with min, minutes or neither after it, and the later line wins', n.estimates.get(4) === 25 && n.estimates.get(5) === 45],
        ['an estimate of zero or in words is not read, nor one with no step', !n.estimates.has(6) && !n.estimates.has(7) && n.estimates.size === 2],
        ['no notes, no keys', none.starts.size === 0 && none.estimates.size === 0],
      ];
      const failed = checks.filter(([, ok]) => !ok).map(([label]) => label);
      if (failed.length) throw new Error(`the keys failed: ${failed.join('; ')}`);
      return true;
    },
  },
  {
    name: 'a plan with no Order line gets the page of one with an Order: a section for every step of its Steps section in the order of the steps, each with the chip and the bullets an Order step gets and the held ones saying what they wait on; a done step shows how long it took, measured to the end of the agent whose hand-back opened DONE however much later another agent ended; and a plan with an Order still draws only the steps in its Order and Standing lines',
    guards: ['page_noorder_steps', 'page_noorder_done', 'page_chip_held_order', 'page_noorder_only_when_none', 'page_done_at', 'page_done_end_is_done'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('no');
      const proj = join(home, '.claude', 'projects', '-home-user');
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(proj, `${s}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      const plan = join(home, '.claude', 'plans', 'gate-test.md');
      mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
      const approve = (text) => { writeFileSync(plan, text); writeFileSync(join(home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan, hash: createHash('sha256').update(text).digest('hex'), at: new Date().toISOString() })); };
      writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - 10 * 60000, status: 'Status' }));
      const temp = tmp('sg-tmp-');
      const pad = join(temp, 'claude-0', '-home-user', s, 'scratchpad');
      mkdirSync(join(pad, 'progress'), { recursive: true });
      mkdirSync(join(pad, 'status'), { recursive: true });
      // An agent that began `begin` seconds after the fixture epoch and handed back at `end`; its last entry is a second later.
      const handed = (id, n, begin, end, first) => {
        writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl([{ type: 'user', timestamp: ts(begin), message: { role: 'user', content: `${plan} step ${n}` } },
          tool(begin + 10, `${id}-b`, 'Bash', { command: 'git status' }), result(begin + 11, `${id}-b`, 'clean'),
          tool(end, `${id}-h`, 'SubagentHandback', { message: `${first}\nThe second line.` }), result(end + 1, `${id}-h`, 'Report delivered to your caller.')]));
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step ${n}` }));
      };
      const status = () => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the no-order test'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: s, TMPDIR: temp } }).stdout ?? '';
      const page = () => { try { return readFileSync(join(pad, 'status', 'fix-run.html'), 'utf8'); } catch { return ''; } };
      const at1 = (out, a, b) => out.indexOf(a) >= 0 && out.indexOf(a) < out.indexOf(b);
      const THREE = STEPS_PLAN.replace('2. **Check.** Read the thing.', '2. **Check.** Read the thing.\n3. **Wait.** Wait on the thing.');
      approve(THREE);
      // Nothing sent: every step is held, each after the one before it.
      const printed0 = status(), page0 = page();
      // Step 1 handed back DONE at 1800 seconds and a later send of it ended REFUSED at 3000; step 2 ended REFUSED. The fixture epoch is 05:00 in California.
      handed('d1', 1, 0, 1800, 'DONE');
      handed('d1b', 1, 1900, 3000, 'REFUSED');
      handed('d2', 2, 3100, 3200, 'REFUSED');
      writeFileSync(join(pad, 'status', 'manager.txt'), ['Start 1: 05:00', 'Estimate 3: 15 min', ''].join('\n'));
      const printed1 = status(), page1 = page();
      // The same steps with an Order of 1 and 2, Standing 3, and a fourth step in neither list.
      approve(THREE.replace('3. **Wait.** Wait on the thing.', '3. **Wait.** Wait on the thing.\n4. **Stray.** Never sent.').replace('## Steps', '## Order\nOrder: 1 2\nStanding: 3\n\n## Steps'));
      status();
      const ordered = page();
      const checks = [
        ['the print still says the plan defines no pointer', /^next: not defined \(/m.test(printed0) && /^next: not defined \(/m.test(printed1)],
        ['a section for every step, in the order of the steps, each held after the one before', page0.includes('<h2>1. Build <span class="chip held">held, next to send</span></h2>')
          && page0.includes('<h2>2. Check <span class="chip held">held, after step 1</span></h2>') && page0.includes('<h2>3. Wait <span class="chip held">held, after step 2</span></h2>')
          && at1(page0, '<h2>1. Build', '<h2>2. Check') && at1(page0, '<h2>2. Check', '<h2>3. Wait')],
        ['the bullets an Order step gets', page0.includes('<li>What it is: Build</li>') && page0.includes('<li>Where it stands: not sent</li>') && page0.includes('next: not defined')],
        ['no time chip and no sentence about estimates while no key is written', !page0.includes('Estimates are the plan') && !/<h2>[^\n]*<\/span><span class="chip/.test(page0)],
        ['a step with a DONE hand-back is green, one that ended REFUSED is open, and the one after it waits on it', page1.includes('<span class="chip done">done</span>') && page1.includes('<h2>2. Check <span class="chip open">open</span></h2>')
          && page1.includes('<li>Where it stands: REFUSED</li>')],
        ['a done step shows how long it took, to the end of the agent whose hand-back opened DONE and not to the later REFUSED one', page1.includes('<h2>1. Build <span class="chip done">done</span><span class="chip done">took 30 min</span></h2>')],
        ['a held step shows its estimate, and the page says estimates are the plan\'s', page1.includes('<h2>3. Wait <span class="chip held">held, after step 2</span><span class="chip held">estimate 15 min</span></h2>')
          && page1.includes('Estimates are the plan\'s and not measurements.')],
        ['a plan with an Order draws its Order steps and its Standing step, with the pointer, and not a step in neither', ordered.includes('<strong>next: step 2</strong>') && ordered.includes('<h2>1. Build') && ordered.includes('<h2>2. Check')
          && ordered.includes('<h2>3. Wait <span class="chip held">held, sent at any time</span>') && !ordered.includes('<h2>4. Stray')],
      ];
      const failed = checks.filter(([, ok]) => !ok).map(([label]) => label);
      if (failed.length) throw new Error(`the page of a plan with no Order failed: ${failed.join('; ')}`);
      return true;
    },
  },
  {
    name: 'the time chips are drawn beside the state chip in its colour from the manager\'s Start and Estimate lines: a running step shows its start and the clock time its estimate ends at, or its estimate alone where no start is written; a held step shows its estimate in minutes; a done step shows how long it took, from its start to the end of the agent that handed back DONE, the start\'s date taken from that end\'s date in California, and nothing where the result is negative or no agent\'s DONE ended it; a step with no line gets no chip, nor does an open step; and the updated line says estimates are the plan\'s and not measurements only when a chip is drawn',
    guards: ['page_chip_started', 'page_chip_ends', 'page_chip_estimate_running', 'page_chip_estimate_held', 'page_chip_held_only', 'page_chip_took', 'page_chip_took_negative', 'page_chip_took_date', 'page_chip_no_key',
      'page_chip_no_estimate_key', 'page_chip_time_style', 'page_estimate_note', 'page_estimate_note_only_when_drawn', 'page_estimate_note_period'],
    run(m) {
      const pad = join(tmp('sg-chips-'), 'pad');
      mkdirSync(join(pad, 'status'), { recursive: true });
      writeFileSync(join(pad, 'status', 'manager.txt'), ['Start 1: 07:15', 'Estimate 1: 20 min', 'Start 2: 08:00', 'Start 3: 20:00', 'Start 5: 07:00', 'Done 5: counted done by decision',
        'Start 6: 09:10', 'Estimate 6: 25 min', 'Start 7: 23:50', 'Estimate 7: 30 min', 'Estimate 8: 40 min', 'Estimate 9: 15 min', 'Start 11: 10:00', 'Start 12: 07:00', 'Estimate 12: 30 min', ''].join('\n'));
      const notes = m.report.managerNotes(pad);
      // Both ends are California days in October, at the offset of daylight time: 14:38:30 UTC is 07:38 on the 19th, 03:30 UTC on the 20th is 20:30 on the 19th.
      const morning = Date.parse('2026-10-19T14:38:30Z'), evening = Date.parse('2026-10-20T03:30:00Z');
      const row = (n, state, extra = {}) => ({ step: n, standing: false, state, back: null, report: '', reportWritten: false, doneAt: null, ...extra });
      const steps = [row(1, 'DONE', { doneAt: morning }), row(2, 'DONE', { doneAt: morning }), row(3, 'DONE', { doneAt: evening }), row(4, 'DONE', { doneAt: morning }), row(5, 'running'), row(6, 'running'), row(7, 'running'),
        row(8, 'running'), row(9, 'not sent'), row(10, 'not sent'), row(11, 'not sent'), row(12, 'REFUSED')];
      const st = { read: true, why: '', planPath: '/plans/x.md', title: 'A plan', goalOne: '', leaves: [], reviewers: [], manager: notes, managerPath: '', found: [],
        titles: new Map(steps.map((x) => [x.step, ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'][x.step]])),
        pointer: { order: steps.map((x) => x.step), standing: [], done: new Set([1, 2, 3, 4]), next: 5 }, steps };
      const now = new Date('2026-10-19T14:15:00Z');
      const page = m.report.statusPage(st, 'Status 07:15 — the chip test', now);
      const dotted = m.report.statusPage(st, 'Status 07:15 — the chip test.', now);
      const bare = m.report.statusPage({ ...st, manager: m.report.managerNotes(null) }, 'Status 07:15 — the chip test', now);
      const head = (n, title, cls, words, chips = []) => `<h2>${n}. ${title} <span class="chip ${cls}">${words}</span>${chips.map((c) => `<span class="chip ${cls}">${c}</span>`).join('')}</h2>`;
      const words = (n) => m.report.stepTimeChips(st, steps[n - 1], m.report.stepChip(st, steps[n - 1])).join(' | ');
      const checks = [
        ['a done step shows how long it took, from its start to the end of the agent that handed back DONE', page.includes(head(1, 'One', 'done', 'done', ['took 23 min'])) && words(1) === 'took 23 min'],
        ['a start later than the end draws no chip', page.includes(head(2, 'Two', 'done', 'done')) && words(2) === ''],
        ['the start\'s date is the end\'s date in California, not in UTC', page.includes(head(3, 'Three', 'done', 'done', ['took 30 min']))],
        ['a done step with no line draws none, nor one counted done by decision whatever its line', page.includes(head(4, 'Four', 'done', 'done')) && page.includes(head(5, 'Five', 'done', 'done')) && words(5) === ''],
        ['a running step shows when it started and when its estimate ends', page.includes(head(6, 'Six', 'wait', 'running', ['started 09:10', 'estimate ends 09:35']))],
        ['the end of an estimate runs past midnight as a clock time', page.includes(head(7, 'Seven', 'wait', 'running', ['started 23:50', 'estimate ends 00:20']))],
        ['a running step with an estimate and no start shows the estimate alone', page.includes(head(8, 'Eight', 'wait', 'running', ['estimate 40 min']))],
        ['a held step shows its estimate in minutes, in the held colour', page.includes(head(9, 'Nine', 'held', 'held, after step 8', ['estimate 15 min']))],
        ['a held step with no line, or with a start only, draws none', page.includes(head(10, 'Ten', 'held', 'held, after step 9')) && page.includes(head(11, 'Eleven', 'held', 'held, after step 10'))],
        ['an open step draws none however many lines it has', page.includes(head(12, 'Twelve', 'open', 'open')) && words(12) === ''],
        ['the updated line says estimates are the plan\'s, with a full stop before it where the status has none', page.includes('Status 07:15 — the chip test. Estimates are the plan\'s and not measurements.</p>')],
        ['and without a second full stop where the status has one', dotted.includes('Status 07:15 — the chip test. Estimates are the plan\'s and not measurements.</p>') && !dotted.includes('chip test.. Estimates')],
        ['with no line written, no chip and no sentence, and the updated line is as it was', bare.includes(head(1, 'One', 'done', 'done')) && !bare.includes('Estimates are the plan') && bare.includes('(California): Status 07:15 — the chip test</p>')],
      ];
      const failed = checks.filter(([, ok]) => !ok).map(([label]) => label);
      if (failed.length) throw new Error(`the time chips failed: ${failed.join('; ')}`);
      return true;
    },
  },
  {
    name: 'the main thread may write status/manager.txt in its own scratchpad, as it writes the status page, and nothing beside it: not another session\'s notes, not a file next to them, not a file that only begins the same way',
    guards: ['fence_manager_write', 'manager_notes_path'],
    run(m) {
      const s = sid('mn');
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const f = (tool_name, file) => m.dispatch.managerFence({ session_id: s, tool_name, tool_input: { file_path: file } }, { plan, classify: () => false });
      const mine = `/tmp/claude-0/-home-user/${s}/scratchpad/status/manager.txt`;
      const fenced = (x) => /^MANAGER FENCE/.test(x ?? '');
      return f('Write', mine) === null && f('Edit', mine) === null && f('MultiEdit', mine) === null
        && m.dispatch.isManagerNotes(mine, s) && !m.dispatch.isManagerNotes(mine, 'someone-else')
        && fenced(f('Write', `/tmp/claude-0/-home-user/other/scratchpad/status/manager.txt`)) && fenced(f('Write', `${mine}.bak`))
        && fenced(f('Write', `/tmp/claude-0/-home-user/${s}/scratchpad/status/other.txt`)) && fenced(f('Write', `/tmp/claude-0/-home-user/${s}/scratchpad/manager.txt`))
        && fenced(f('Write', '/home/user/noahjefferson/status/manager.txt'));
    },
  },
  {
    name: 'the main thread may read the hub\'s agent-rules.md as part of the record, in a hub root and in no other repository, and an agent may read the live copy by its full path under a plan that points at it and never write it',
    guards: ['record_rules'],
    run(m, dir) {
      const hub = repo({ 'DOCTRINE.md': '#\n', 'hook-dispatch.mjs': '//\n', 'agent-rules.md': 'x\n', 'src.mjs': 'x\n' });
      const app = repo({ 'agent-rules.md': 'x\n' });
      const p = { session_id: 'rr' };
      const plan = { path: '/plans/x.md', text: STEPS_PLAN.replace('## Commands', `## Rules\n${rulesLine(dir)}\n\n## Commands`) };
      const live = join(homedir(), '.claude', 'hub', 'agent-rules.md');
      const agentRead = decideFence(m,{ session_id: 's', agent_id: 'a1', tool_name: 'Read', tool_input: { file_path: live } }, { plan, reads: (q) => q.tool_name === 'Read' });
      const agentWrite = decideFence(m,{ session_id: 's', agent_id: 'a1', tool_name: 'Write', tool_input: { file_path: live, content: 'x' } }, { plan });
      return m.dispatch.recordPath(join(hub.dir, 'agent-rules.md'), p) && !m.dispatch.recordPath(join(hub.dir, 'src.mjs'), p) && !m.dispatch.recordPath(join(app.dir, 'agent-rules.md'), p)
        && agentRead === null && typeof agentWrite === 'string' && /live gate copy/.test(agentWrite);
    },
  },

  // ---- the state page is the first read after a compaction (Doctrine §0e rule 2) ----
  {
    name: 'the status page gate holds the main thread to reads after a compaction until a Read result on the whole page has returned after the marker: a part of the page, another file, an earlier read and an error each leave it held; no marker, no page yet, a subagent and TaskStop are not held, and the read removes the marker',
    guards: ['page_gate_marker', 'page_gate_missing', 'page_read_after', 'page_read_partial', 'page_read_parts', 'page_read_same_file', 'page_read_error', 'page_gate_clears', 'page_gate_agent', 'page_gate_taskstop', 'page_gate_read_exempt', 'page_due_line'],
    run(m) {
      const s = sid('pu');
      const where = tmp('sg-page-');
      const page = join(where, 'fix-run.html');
      writeFileSync(page, '<p>state</p>\n');
      const other = join(where, 'other.html');
      const marker = join(process.env.PAGE_DUE_DIR, `${s}.json`);
      const call = (extra = {}, entries = [], opts = {}) => m.dispatch.pageGate({ session_id: s, tool_name: 'Agent', tool_input: {}, ...extra }, entries, { page, classify: (q) => q.tool_name === 'Read', ...opts });
      const rd = (id, secs, file, totals = { numLines: 3, totalLines: 3 }, isError = false) => [at(tool(0, id, 'Read', { file_path: file }), later(secs)),
        { ...at(result(0, id, 'x', isError), later(secs + 1)), toolUseResult: { type: 'text', file: { filePath: file, content: 'x', startLine: 1, ...totals } } }];
      const noMarker = call();
      const line = m.dispatch.markPageDue({ session_id: s, source: 'compact' });
      const held = call();
      const pageGone = call({}, [], { page: join(where, 'absent.html') });
      const noPage = call({}, [], { page: null });
      const readCall = call({ tool_name: 'Read', tool_input: { file_path: page } });
      const agent = call({ agent_id: 'a1' });
      const stop = call({ tool_name: 'TaskStop' });
      const partial = call({}, rd('r1', 2, page, { numLines: 2, totalLines: 3 }));
      const elsewhere = call({}, rd('r2', 2, other));
      const early = call({}, rd('r3', -60, page));
      const errored = call({}, rd('r4', 2, page, undefined, true));
      const stillDue = existsSync(marker);
      const cleared = call({}, rd('r5', 2, page));
      const removed = !existsSync(marker);
      // A page too long for one Read is read in parts: parts that together cover every line clear the gate, and the same part twice does not.
      m.dispatch.markPageDue({ session_id: s, source: 'compact' });
      const same = call({}, [...rd('p1', 2, page, { numLines: 2, totalLines: 3 }), ...rd('p2', 4, page, { numLines: 2, totalLines: 3 })]);
      const parts = call({}, [...rd('p3', 2, page, { numLines: 2, totalLines: 3 }), ...rd('p4', 4, page, { startLine: 3, numLines: 1, totalLines: 3 })]);
      const partsRemoved = !existsSync(marker);
      const held2 = (r) => typeof r === 'string' && /^STATE PAGE GATE/.test(r) && r.includes(page) && /does not latch/.test(r);
      return noMarker === null && /^STATE PAGE DUE/.test(line) && line.includes('was compacted') && line.includes('Read result') && !line.includes('\n')
        && held2(held) && pageGone === null && noPage === null && readCall === null && agent === null && stop === null
        && held2(partial) && held2(elsewhere) && held2(early) && held2(errored) && stillDue
        && cleared === null && removed
        && held2(same) && parts === null && partsRemoved;
    },
  },
  {
    name: 'a compaction makes the status page due: the SessionStart line names it, a session with no page yet is held for nothing, and once the page exists the main thread is refused anything but a read and the status without a latch until a Read of the page has returned, after which the next call runs',
    guards: ['page_due_wired', 'page_gate_wired', 'page_gate_no_latch'],
    run(m, dir) {
      const temp = tmp('sg-tmp-');
      const env = { TMPDIR: temp };
      const s = sid('pg');
      const page = join(temp, 'claude-0', '-home-user', s, 'scratchpad', 'status', 'fix-run.html');
      const w = world(dir, [turn(0, GO)]);
      const send = () => w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } }, env);
      const start = w.call('SessionStart', { session_id: s, source: 'compact' }, env);
      const marker = join(process.env.PAGE_DUE_DIR, `${s}.json`);
      const due = existsSync(marker);
      // The doctrine's own marker is cleared: this case is about the page.
      rmSync(join(process.env.DOCTRINE_DUE_DIR, `${s}.json`), { force: true });
      const early = send();
      mkdirSync(dirname(page), { recursive: true });
      writeFileSync(page, '<p>state</p>\n');
      const held = send();
      const notLatched = !latched(s);
      const reading = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: page } }, env);
      const stamp = w.call('PreToolUse', { session_id: s, tool_name: 'Bash', tool_input: { command: `node "${join(dir, 'report.mjs')}" "Status 10:00 — done"` } }, env);
      appendFileSync(w.tr, jsonl([at(tool(0, 'rp', 'Read', { file_path: page }), later(2)),
        { ...at(result(0, 'rp', '1\t<p>state</p>'), later(3)), toolUseResult: { type: 'text', file: { filePath: page, content: 'x', startLine: 1, numLines: 1, totalLines: 1 } } }]));
      const after = send();
      return start.status === 0 && /STATE PAGE DUE/.test(start.stdout) && start.stdout.includes('fix-run.html') && due
        && early.status === 0 && held.status === 2 && /STATE PAGE GATE/.test(held.stderr) && held.stderr.includes(page) && notLatched
        && reading.status === 0 && stamp.status === 0
        && after.status === 0 && !existsSync(marker);
    },
  },

  // ---- the card: the owner's core asks, one page, at every start (Doctrine §0e, §11e) ----
  {
    name: 'the brief prints the owner\'s core asks at a startup, a clear, a compaction, a resume and a start with no payload: the lines of the hub CLAUDE.md\'s section of that name before the lessons, at most forty with the count of the rest; one line says why when the section or the file is missing',
    guards: ['card_printed', 'card_bounded', 'card_heading', 'card_missing_section', 'card_missing_file', 'card_rest_note'],
    run(m, dir) {
      const hub = tmp('sg-brief-');
      copyFileSync(join(dir, 'session-brief.mjs'), join(hub, 'session-brief.mjs'));
      mkdirSync(join(hub, 'lessons'));
      writeFileSync(join(hub, 'lessons', '001-fixture.md'), '## 001 · The first fixture lesson\n\n**Enforced by:** JUDGEMENT\n');
      const brief = (payload) => spawnSync('node', [join(hub, 'session-brief.mjs'), '--repo', hub], { input: payload === null ? '' : JSON.stringify(payload), encoding: 'utf8', timeout: 20000 });
      const marked = (source) => { const id = `${sid('cd')}.x:y`; m.doctrine.markDue({ session_id: id, source }, join(hub, 'DOCTRINE.md')); return id; };
      const claude = (n) => writeFileSync(join(hub, 'CLAUDE.md'), ['# Hub', '', '## Goals every session serves', '2. A goal.', '', '## The owner\'s core asks, one page', 'Intro line of the page.', '',
        ...Array.from({ length: n }, (_, i) => `- Card line ${i + 1}: an ask that is kept.`), '', '## Start here', 'Not part of the card.', ''].join('\n'));
      const shown = (o) => o.status === 0 && o.stdout.includes('THE OWNER\'S CORE ASKS (one page') && o.stdout.includes('Intro line of the page.') && o.stdout.includes('Card line 3: an ask that is kept.')
        && !o.stdout.includes('Not part of the card.') && o.stdout.indexOf('THE OWNER\'S CORE ASKS') < o.stdout.indexOf('LESSONS (');
      claude(3);
      const starts = ['startup', 'clear', 'compact', 'resume'].map((k) => brief({ session_id: marked(k), source: k }));
      const noPayload = brief(null);
      claude(45);
      const long = brief({ session_id: marked('startup'), source: 'startup' });
      writeFileSync(join(hub, 'CLAUDE.md'), '# Hub\n\n## Start here\nx\n');
      const noSection = brief(null);
      rmSync(join(hub, 'CLAUDE.md'));
      const noFile = brief(null);
      return starts.every(shown) && shown(noPayload)
        && long.status === 0 && long.stdout.includes('Card line 38: an ask that is kept.') && !long.stdout.includes('Card line 39:') && /… 7 more lines in the "The owner's core asks, one page" section/.test(long.stdout)
        && noSection.status === 0 && noSection.stdout.includes('THE OWNER\'S CORE ASKS: not printed (the hub CLAUDE.md has no non-empty "## The owner\'s core asks, one page" section)')
        && noFile.status === 0 && noFile.stdout.includes('THE OWNER\'S CORE ASKS: not printed (no CLAUDE.md beside this brief');
    },
  },

  // ---- the pruning rule: a replacement line names a gate the hub has (lesson 396) ----
  {
    name: 'a line of the doctrine that says a gate enforces a paragraph whole names a gate file the hub has: a fixture naming a missing gate is found first, and the real doctrine passes',
    run() {
      const hubHas = (f) => [join(HERE, f), join(HERE, '.github', 'workflows', f), join(HERE, '.claude', 'hooks', f)].some((x) => existsSync(x));
      const fixture = ['## Fixture', '1. **A rule.** It was pruned.', '   *Enforced whole by:* `no-such-gate.mjs`.', '   *Enforced whole by:* `plan-guard.mjs` and `hook-dispatch.mjs`.', 'A line that only mentions `*Enforced whole by:*` in prose.'].join('\n');
      // The control: the instrument must find the missing gate and only that one before the real doctrine is trusted to pass it.
      const found = wholeGates(fixture);
      const missing = found.filter((f) => !hubHas(f));
      const real = wholeGates(readFileSync(join(HERE, 'DOCTRINE.md'), 'utf8'));
      return found.length === 3 && missing.length === 1 && missing[0] === 'no-such-gate.mjs' && real.every(hubHas);
    },
  },
  {
    name: 'the hub\'s own NOTES.md queues findings under "Found queue", every keyed line of that section read as a finding with a key of the form Q-HUB-N used once',
    run(m) {
      const q = m.dispatch.foundQueue(HERE);
      const notes = readFileSync(join(HERE, 'NOTES.md'), 'utf8');
      const section = (/^## Found queue[^\n]*\n([\s\S]*?)(?=^## |^# |$(?![\s\S]))/m.exec(notes) ?? [, ''])[1];
      const keyed = section.split('\n').filter((l) => /^\s*(?:[-*]\s+)?\**Q-/.test(l));
      const keys = q.map((x) => x.key);
      return q.length > 0 && keyed.length === q.length && keys.every((k) => /^Q-HUB-\d+$/.test(k)) && new Set(keys).size === keys.length && q.every((x) => x.text.length >= 20);
    },
  },

  // ---- the manager reads the saved tool results, the science file and the decision records (step 108) ----
  {
    name: 'the manager fence passes a read of the session\'s own saved tool results, and in every repository its IR-SCIENCE.md and the .md files directly in docs/decisions; another session\'s results, a folder or another type inside docs/decisions and an app\'s source stay outside the record',
    guards: ['record_tool_results', 'record_tool_results_session', 'record_ir_science', 'record_decisions', 'record_decisions_flat', 'record_decisions_md'],
    run(m) {
      const s = sid('tr');
      const dot = join(homedir(), '.claude');
      const proj = join(dot, 'projects', '-home-user');
      const sib = repo({ 'NOTES.md': 'n', 'app.ts': 'x' }, 'sibdec');
      const of = (f) => m.dispatch.recordPath(f, { session_id: s }, () => undefined);
      const results = of(join(proj, s, 'tool-results', 'b07s4b48n.txt')) && of(join(proj, s, 'tool-results')) && of(join(proj, s, 'tool-results', 'sub', 'x.txt'));
      const notResults = !of(join(proj, 'another-session', 'tool-results', 'x.txt')) && !of(join(proj, s, 'subagents', 'agent-x.jsonl')) && !of(join(proj, s))
        && !of(join(proj, s, 'tool-results', '..', 'x.txt')) && !of(join(dot, 'tool-results', 'x.txt'));
      const science = of(join(sib.dir, 'IR-SCIENCE.md'));
      const records = of(join(sib.dir, 'docs', 'decisions', '066-film-model.md')) && of(join(sib.dir, 'docs', 'decisions'));
      const notRecords = !of(join(sib.dir, 'docs', 'decisions', 'sub', '066.md')) && !of(join(sib.dir, 'docs', 'decisions', 'notes.txt'))
        && !of(join(sib.dir, 'docs', 'ARCHITECTURE.md')) && !of(join(sib.dir, 'docs', 'decisions.md')) && !of(join(sib.dir, 'app.ts'));
      // Through the fence, with every call a read for the classifier: a decision record goes, the source is refused with the reason to send an agent.
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const fence = (file_path) => m.dispatch.managerFence({ session_id: s, tool_name: 'Read', tool_input: { file_path } }, { plan, classify: () => true });
      return results && notResults && science && records && notRecords
        && fence(join(sib.dir, 'docs', 'decisions', '066-film-model.md')) === null && fence(join(proj, s, 'tool-results', 'b07s4b48n.txt')) === null
        && /Send an agent/.test(fence(join(sib.dir, 'app.ts')) ?? '') && /IR-SCIENCE\.md and docs\/decisions/.test(fence(join(sib.dir, 'app.ts')) ?? '');
    },
  },

  // ---- a refused read of the record is read again before a step goes (step 108) ----
  {
    name: 'a Read of the record that a hook refuses or that fails is recorded; the status names each such file until a Read has returned on it, the dispatch gate sends no step meanwhile and does not latch, and a refused read outside the record, of a file that is not there, or an agent\'s, is not recorded',
    guards: ['refused_note', 'refused_note_main', 'refused_note_exists', 'refused_note_record', 'refused_failure', 'refused_cleared', 'refused_cleared_error', 'refused_gone', 'reads_gate', 'reads_gate_step', 'reads_gate_tool', 'reads_gate_wired', 'reads_gate_no_latch', 'reads_status_block'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('rg');
      const call = (payload, event = 'PreToolUse') => w.call(event, { session_id: s, ...payload });
      const refusedNow = () => m.report.refusedReads(s).map((x) => x.path);
      // A send the dispatch gate refuses latches (a write outside the record sets no latch); the latch then refuses a Read of the plan, a file of the record that exists.
      call({ tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' } });
      const heldRead = call({ tool_name: 'Read', tool_input: { file_path: w.plan } });
      // Not recorded: a file outside the record, a file of the record that is not there, and an agent's read.
      const source = join(w.cwd, 'app.ts');
      writeFileSync(source, 'export const x = 1;\n');
      call({ tool_name: 'Read', tool_input: { file_path: source } });
      call({ tool_name: 'Read', tool_input: { file_path: join(w.home, '.claude', 'plans', 'not-there.md') } });
      const other = join(w.home, '.claude', 'plans', 'other.md');
      writeFileSync(other, '# another plan\n');
      call({ agent_id: 'a1', tool_name: 'Read', tool_input: { file_path: other } });
      const recorded = refusedNow();
      // The owner writes: the latch is gone, and a step is refused by the reads gate, which does not latch.
      appendFileSync(w.tr, jsonl([owner(later(2), GO)]));
      const send = () => call({ tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const held = send();
      const notLatched = !latched(s);
      // A Read that failed after the refusal does not clear it; one that returned does.
      appendFileSync(w.tr, jsonl([at(tool(0, 'rd0', 'Read', { file_path: w.plan }), later(4)), at(result(0, 'rd0', 'File content exceeds maximum allowed tokens', true), later(5))]));
      const afterError = send();
      appendFileSync(w.tr, jsonl([at(tool(0, 'rd1', 'Read', { file_path: w.plan }), later(6)), at(result(0, 'rd1', '1\tx'), later(7))]));
      const cleared = send();
      // The gate by itself: a Workflow is held, a prompt that is no step of the plan, an agent's call and a Read are not.
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const open = [{ path: '/x/rec.md', at: Date.now(), why: 'refused' }];
      const gate = (tool_name, input, extra = {}) => m.dispatch.readsGate({ session_id: 'rg2', tool_name, tool_input: input, ...extra }, plan, open);
      const unit = /READS GATE/.test(gate('Agent', { prompt: '/plans/gate-test.md step 1' }) ?? '') && /READS GATE/.test(gate('Workflow', { script: 'x' }) ?? '')
        && gate('SendMessage', { message: 'Go back and fix the test.' }) === null && gate('Agent', { prompt: '/plans/gate-test.md step 1' }, { agent_id: 'a1' }) === null
        && gate('Read', { file_path: '/x/rec.md' }) === null && m.dispatch.readsGate({ session_id: 'rg2', tool_name: 'Agent', tool_input: { prompt: '/plans/gate-test.md step 1' } }, plan, []) === null;
      // A Read that FAILED is recorded too (PostToolUseFailure).
      const s3 = sid('rg');
      w.call('PostToolUseFailure', { session_id: s3, tool_name: 'Read', tool_input: { file_path: w.plan }, error: 'File content exceeds maximum allowed tokens' });
      const failedRecorded = m.report.refusedReads(s3).map((x) => x.path).join() === w.plan;
      // The status names the refused read until a Read returns on it, and a file that is gone is not named.
      const s2 = sid('rb');
      const projDir = join(homedir(), '.claude', 'projects', '-home-user');
      mkdirSync(projDir, { recursive: true });
      const main = join(projDir, `${s2}.jsonl`);
      writeFileSync(main, jsonl([turn(0, 'start')]));
      const file = join(tmp('sg-rec-'), 'rec.md');
      writeFileSync(file, 'x');
      m.report.noteRefusedRead(s2, file, 'refused for the test');
      const before = m.report.readsBlock(s2, 0);
      appendFileSync(main, jsonl([at(tool(0, 'q0', 'Read', { file_path: file }), later(3)), at(result(0, 'q0', 'too long', true), later(4))]));
      const still = m.report.readsBlock(s2, 0);
      appendFileSync(main, jsonl([at(tool(0, 'q1', 'Read', { file_path: file }), later(5)), at(result(0, 'q1', '1\tx'), later(6))]));
      const after = m.report.readsBlock(s2, 0);
      m.report.noteRefusedRead(s2, file, 'refused again', Date.now() + 60000);
      const again = m.report.readsBlock(s2, 0);
      rmSync(file);
      const gone = m.report.readsBlock(s2, 0);
      return heldRead.status === 2 && recorded.join() === w.plan
        && held.status === 2 && /READS GATE/.test(held.stderr) && held.stderr.includes(w.plan) && notLatched
        && afterError.status === 2 && /READS GATE/.test(afterError.stderr) && cleared.status === 0 && unit && failedRecorded
        && before.includes('Refused reads of the record NOT read since') && before.includes(file) && before.includes('refused for the test')
        && still.includes(file) && !/not read since: none\./.test(still) && /Refused reads of the record not read since: none\./.test(after) && after.includes('Main thread reads since the last status: 2 (Read 2)')
        && again.includes(file) && /not read since: none\./.test(gone);
    },
  },

  // ---- a status shows what changed and nothing twice (step 108) ----
  {
    name: 'a status prints what changed and nothing twice: the goals once per session, a hand-back once, a Found line when it is new, changed or unsorted, a running agent\'s hook refusal once, the approval state in full only when it changed, the main thread\'s reads since the last status, and no hand-back text a second time under the ended agents; with no session id it prints everything each time',
    guards: ['seen_goals', 'seen_backs', 'seen_found', 'seen_found_unsorted', 'seen_found_changed', 'seen_refusals', 'seen_refusals_new', 'seen_approval', 'seen_agents_dedupe', 'seen_written', 'reads_main_since', 'reads_main_tools', 'reads_main_sidechain', 'reads_print'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('sn');
      const proj = join(home, '.claude', 'projects', '-home-user');
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      const main = join(proj, `${s}.jsonl`);
      const plan = join(home, '.claude', 'plans', 'gate-test.md');
      mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
      writeFileSync(plan, ORDER_PLAN);
      writeFileSync(join(home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan, hash: sha256(ORDER_PLAN), at: new Date().toISOString() }));
      writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - 10 * 60000, status: 'Status' }));
      // The main thread's reads: two since the last status (a Read and a Grep), one before it, a Bash that is no read, and an entry of a sidechain.
      writeFileSync(main, jsonl([turn(0, 'start'), at(tool(0, 'o1', 'Read', { file_path: '/x/older.md' }), later(-1200)),
        at(tool(0, 'm1', 'Read', { file_path: '/x/newer.md' }), later(-120)), at(tool(0, 'm2', 'Grep', { pattern: 'x', path: '/x/dir' }), later(-110)),
        at(tool(0, 'm3', 'Bash', { command: 'git status' }), later(-100)), { ...at(tool(0, 'm4', 'Read', { file_path: '/x/side.md' }), later(-90)), isSidechain: true }]));
      const temp = tmp('sg-tmp-');
      const pad = join(temp, 'claude-0', '-home-user', s, 'scratchpad');
      mkdirSync(join(pad, 'progress'), { recursive: true });
      mkdirSync(join(pad, 'status'), { recursive: true });
      const handed = (id, n, secs, first, second) => {
        writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl([at({ type: 'user', message: { role: 'user', content: `${plan} step ${n}` } }, later(secs - 300)),
          at(tool(0, `${id}-h`, 'SubagentHandback', { message: `${first}\n${second}` }), later(secs)), at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(secs + 1))]));
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step ${n}` }));
      };
      // A running agent that a hook refused once.
      const refusal = (n, text) => [at(tool(0, `r${n}`, 'Bash', { command: 'cd /x' }), later(-60 + n)), at(result(0, `r${n}`, `PreToolUse:Bash hook error: [node hook-dispatch.mjs]: ${text}`, true), later(-59 + n))];
      writeFileSync(join(subs, 'agent-runner.jsonl'), jsonl([at({ type: 'user', message: { role: 'user', content: `${plan} step 3` } }, later(-400)), ...refusal(0, 'PLAN FENCE refused the first cd')]));
      writeFileSync(join(subs, 'agent-runner.meta.json'), JSON.stringify({ agentType: 'general-purpose', description: 'Plan step 3' }));
      handed('a1', 1, -100, 'DONE', 'The goals are written.');
      handed('a2', 2, -90, 'REFUSED', 'The fence refused the write.');
      writeFileSync(join(pad, 'progress', 'step-1-report.txt'), 'Work.\nFound: the doc check was not run\nFound: a second thing, left for later\n');
      const run = (sidEnv) => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the memory test'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: sidEnv, TMPDIR: temp } }).stdout ?? '';
      const count = (text, needle) => text.split(needle).length - 1;
      const first = run(s);
      const second = run(s);
      // A new hand-back, a second refusal of the running agent, and the manager sorting one Found line.
      handed('a3', 2, -5, 'DONE', 'The check is read.');
      appendFileSync(join(subs, 'agent-runner.jsonl'), jsonl(refusal(2, 'PLAN FENCE refused the second cd')));
      writeFileSync(join(pad, 'status', 'manager.txt'), 'Found 1.1 fixed: put right in step 3\n');
      const third = run(s);
      const fourth = run(s);
      const seenFile = join(home, '.claude', 'report-seen', `${s}.json`);
      // No session id: no memory, so the goals and the approval state print again.
      const bare1 = run(''), bare2 = run('');
      return first.includes('Goals every session serves') && first.includes('Hand-backs new since the last status') && first.includes('- step 1, ended') && first.includes('- step 2, ended')
        && count(first, 'The goals are written.') === 1 && first.includes('Last entry: its hand-back, printed above under step 1.')
        && first.includes('- step 1 #1 [unsorted]: Found: the doc check was not run') && first.includes('- step 1 #2 [unsorted]')
        && first.includes('Main thread reads since the last status: 2 (Read 1, Grep 1): /x/newer.md, /x/dir.') && !first.includes('older.md') && !first.includes('side.md')
        && first.includes('Plan it names:') && /\(running\): 1 hook refusal\./.test(first) && first.includes('refused the first cd')
        && !second.includes('Goals every session serves') && second.includes('Hand-backs: none new since the last status') && !second.includes('The goals are written.') && !second.includes('- step 1, ended')
        && second.includes('- step 1 #1 [unsorted]') && second.includes('- step 1 #2 [unsorted]') && second.includes('Approval state, read from disk now: unchanged since the last status')
        && !second.includes('Plan it names:') && second.includes('Agents ended since the last status: none.') && second.includes('Main thread reads since the last status: none.')
        && /no running agent has a hook refusal that an earlier status did not print/.test(second) && !second.includes('refused the first cd')
        && !third.includes('Goals every session serves') && count(third, 'The check is read.') === 1 && third.includes('printed above under step 2')
        && third.includes('- step 1 #1 [fixed]: Found: the doc check was not run (put right in step 3)') && third.includes('- step 1 #2 [unsorted]')
        && /\(running\): 1 hook refusal new since the last status\./.test(third) && third.includes('refused the second cd') && !third.includes('refused the first cd')
        && !fourth.includes('- step 1 #1 [fixed]') && fourth.includes('- step 1 #2 [unsorted]') && /\(1 Found line sorted and printed by an earlier status is not printed again/.test(fourth)
        && existsSync(seenFile) && !existsSync(join(home, '.claude', 'report-seen', '.json'))
        && bare1.includes('Goals every session serves') && bare2.includes('Goals every session serves') && bare1.includes('Plan it names:') && bare2.includes('Plan it names:');
    },
  },

  // ---- the status page at a hand-back (step 108) ----
  {
    name: 'the status page is rewritten, with the last status\'s own header, when the notice of an agent\'s end arrives as a prompt (a task notification with an end marker, or an agent\'s hand-back); report.mjs --page stamps nothing, prints no status and writes no memory, and an owner message or a notice with no end marker writes nothing',
    guards: ['page_handback_wired', 'page_handback_marker', 'page_handback_owner', 'page_flag_no_stamp', 'page_flag_header', 'page_flag_session'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('pg');
      const proj = join(home, '.claude', 'projects', '-home-user');
      mkdirSync(join(proj, s, 'subagents'), { recursive: true });
      const main = join(proj, `${s}.jsonl`);
      writeFileSync(main, jsonl([turn(0, 'start')]));
      const plan = join(home, '.claude', 'plans', 'gate-test.md');
      mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
      writeFileSync(plan, ORDER_PLAN);
      writeFileSync(join(home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan, hash: sha256(ORDER_PLAN), at: new Date().toISOString() }));
      const clockText = JSON.stringify({ at: Date.now() - 7 * 60000, status: 'Status 09:00 — the page test' });
      const clock = join(home, '.claude', 'report-clock.json');
      writeFileSync(clock, clockText);
      const temp = tmp('sg-tmp-');
      const pad = join(temp, 'claude-0', '-home-user', s, 'scratchpad');
      mkdirSync(pad, { recursive: true });
      const page = join(pad, 'status', 'fix-run.html');
      const env = { ...process.env, HOME: home, TMPDIR: temp, CLAUDE_PROJECT_DIR: home };
      const prompt = (text) => spawnSync('node', [join(dir, 'hook-dispatch.mjs'), 'UserPromptSubmit'], {
        input: JSON.stringify({ session_id: s, transcript_path: main, cwd: home, hook_event_name: 'UserPromptSubmit', prompt: text }), encoding: 'utf8', env });
      const written = () => existsSync(page);
      const notice = (status) => `<task-notification>\n<task-id>wabc</task-id>\n<tool-use-id>toolu_1</tool-use-id>\n<output-file>/tmp/o</output-file>\n<status>${status}</status>\n<summary>Agent "Plan step 2" ${status}</summary>\n</task-notification>`;
      const ownerMsg = prompt('Please carry on with the plan. Go.');
      const quiet = prompt(notice('running'));
      const none = !written();
      const ended = prompt(notice('completed'));
      const html = written() ? readFileSync(page, 'utf8') : '';
      const unchanged = readFileSync(clock, 'utf8') === clockText && !existsSync(join(home, '.claude', 'report-seen', `${s}.json`));
      rmSync(page, { force: true });
      const peer = prompt('<agent-message from="a1b2c3">\n[Subagent hand-back] Step one is built.\n</agent-message>');
      const peerWritten = written();
      rmSync(page, { force: true });
      // The flag by itself: the session from the hook's payload, else from the shell's variable.
      const direct = spawnSync('node', [join(dir, 'report.mjs'), '--page'], { input: JSON.stringify({ session_id: s }), encoding: 'utf8', env: { ...env, CLAUDE_CODE_SESSION_ID: '' } });
      const viaPayload = written();
      rmSync(page, { force: true });
      const viaVariable = spawnSync('node', [join(dir, 'report.mjs'), '--page'], { input: '', encoding: 'utf8', env: { ...env, CLAUDE_CODE_SESSION_ID: s } });
      return ownerMsg.status === 0 && quiet.status === 0 && none
        && ended.status === 0 && html.includes('<title>Plan run status</title>') && html.includes('Status 09:00 — the page test') && !/Plan run status/.test(ended.stdout) && !ended.stdout.includes('next: step')
        && unchanged && peer.status === 0 && peerWritten
        && direct.status === 0 && /status page written/.test(direct.stdout) && viaPayload && !/Status 1/.test(direct.stdout)
        && viaVariable.status === 0 && written() && readFileSync(clock, 'utf8') === clockText;
    },
  },

  // ---- a plan's own script may run its steps (step 108) ----
  {
    name: 'a Workflow call is refused while scripts are not accepted, whatever it carries; with them accepted only the approved plan\'s own script goes: passed inline and byte for byte, with the hash the marker recorded, every agent told a literal plan path and a step of its Steps that serves a goal, nothing outside the script\'s own words',
    guards: ['workflow_const', 'workflow_off', 'workflow_no_plan', 'workflow_no_script', 'workflow_hash', 'workflow_inline', 'workflow_equal', 'workflow_problem', 'script_agent_literal', 'script_template_subst', 'script_step_exists', 'script_step_served', 'script_forbidden', 'script_agent_type', 'script_regex', 'script_no_agent', 'script_meta', 'script_planscript_fence', 'script_hash_of'],
    run(m) {
      const planOf = (script) => ({ path: '/plans/gate-test.md', text: scriptPlan(script), scriptHash: sha256(script) });
      const good = planOf(SCRIPT);
      const f = (script, plan = good, o = {}, tool_input = { script }) => m.dispatch.managerFence({ session_id: 'wf', tool_name: 'Workflow', tool_input }, { plan, classify: () => false, ...o });
      const refusedWith = (x, re) => /^DISPATCH GATE/.test(x ?? '') && re.test(x);
      // As shipped scripts are not accepted: the exact script, with its hash, is still refused.
      const off = m.dispatch.WORKFLOW_SCRIPTS_ACCEPTED === false && refusedWith(f(SCRIPT), /workflow is refused, so no script/);
      const on = { scripts: true };
      const bad = (script, re) => { const x = f(script, planOf(script), on); return refusedWith(x, re); };
      const exact = f(SCRIPT, good, on) === null;
      const gate = [
        refusedWith(f(SCRIPT, null, on), /no approved plan is in force/),
        refusedWith(f(SCRIPT, { path: '/plans/gate-test.md', text: STEPS_PLAN, scriptHash: '' }, on), /no "## Script" section/),
        refusedWith(f(SCRIPT, { ...good, scriptHash: null }, on), /does not hold the hash/), refusedWith(f(SCRIPT, { ...good, scriptHash: sha256('another script') }, on), /does not hold the hash/),
        refusedWith(f(SCRIPT, good, on, { script: SCRIPT, scriptPath: '/x.js' }), /inline/), refusedWith(f(SCRIPT, good, on, { scriptPath: '/x.js' }), /inline/),
        refusedWith(f(SCRIPT, good, on, { script: SCRIPT, args: ['a'] }), /inline/), refusedWith(f(`${SCRIPT} `, good, on), /byte for byte/),
        // The approval holds the hash of another script: the section was edited after approval.
        refusedWith(f(SCRIPT, { ...good, text: scriptPlan(SCRIPT.replace('step 2', 'step 1')) }, on), /does not hold the hash/),
      ].every(Boolean);
      const agentLine = (p) => `await agent('${p}')`;
      const head = SCRIPT.split('\n')[0];
      const reads = [
        bad(`${head}\n${agentLine('/plans/gate-test.md step 1 and tidy up')}`, /not exactly \/plans\/gate-test\.md and a step number/),
        bad(`${head}\n${agentLine('/plans/other.md step 1')}`, /not exactly/), bad(`${head}\n${agentLine('/plans/gate-test.md step 9')}`, /Steps do not have/),
        bad(`${head}\nconst p = '/plans/gate-test.md step 1'\nawait agent(p)`, /other than as a call whose first argument is a string literal/),
        bad(`${head}\nconst n = 1\nawait agent(\`/plans/gate-test.md step 1\${n}\`)`, /other than as a call whose first argument is a string literal/),
        bad(`${head}\nconst a = agent\nawait a('/plans/gate-test.md step 1')`, /other than as a call/),
        bad(`${head}\nconst t = \`x \${await agent('/plans/gate-test.md step 9')}\``, /Steps do not have/),
        bad(`${head}\nawait workflow('other')`, /"workflow", which a plan's script may not/), bad(`${head}\neval('1')\n${agentLine('/plans/gate-test.md step 1')}`, /"eval"/),
        bad(`${head}\nawait import('x')\n${agentLine('/plans/gate-test.md step 1')}`, /"import"/), bad(`${head}\nglobalThis.x = 1\n${agentLine('/plans/gate-test.md step 1')}`, /"globalThis"/),
        bad(`${head}\nawait agent('/plans/gate-test.md step 1', { agentType: 'house-builder' })`, /agentType/),
        bad(`${head}\nconst x = ''\nawait agent('/plans/gate-test.md step 1', { agentType: \`general-purpose\${x}\` })`, /agentType/),
        bad(`${head}\nconst r = /x'/\n${agentLine('/plans/gate-test.md step 1')}`, /regular expression/), bad(`${head}\nconst k = 1`, /starts no agent/),
      ].every(Boolean);
      const fine = [
        f(`${head}\nawait agent('/plans/gate-test.md step 1', { agentType: 'general-purpose' })\nconst half = 6 / 3\nlog(\`done \${half}\`) // agent('x') in a comment`, planOf(`${head}\nawait agent('/plans/gate-test.md step 1', { agentType: 'general-purpose' })\nconst half = 6 / 3\nlog(\`done \${half}\`) // agent('x') in a comment`), on) === null,
      ].every(Boolean);
      // A step that serves no goal is not sent, in a script as at the dispatch gate.
      const unserved = (() => {
        const text = scriptPlan().replace('Served by: steps 1 and 2 serve goal 1.', 'Served by: step 1 serves goal 1.');
        return refusedWith(f(SCRIPT, { path: '/plans/gate-test.md', text, scriptHash: sha256(SCRIPT) }, on), /serves no goal/);
      })();
      // What a plan's script is: the first fenced block of its section, else the section, and only when it begins `export const meta`.
      const prose = `${STEPS_PLAN.replace('## Commands', '## Script\nNo script runs in this plan.\n\n## Commands')}`;
      const raw = STEPS_PLAN.replace('## Commands', `## Script\n${SCRIPT}\n\n## Commands`);
      const shape = m.report.planScript(scriptPlan()) === SCRIPT && m.report.planScript(prose) === null && m.report.planScript(raw) === SCRIPT && m.report.planScript(STEPS_PLAN) === null
        && m.report.scriptHashOf(scriptPlan()) === sha256(SCRIPT) && m.report.scriptHashOf(STEPS_PLAN) === '';
      return off && exact && gate && reads && fine && unserved && shape;
    },
  },
  {
    name: 'through hook-dispatch with scripts switched on in a copy of the guards, a Workflow call carrying the approved plan\'s script goes, and one whose marker holds no script hash, another script\'s hash, or a script that differs by a character is refused',
    guards: ['workflow_marker_read'],
    run(m, dir) {
      const copy = tmp('sg-on-');
      for (const f of FILES) copyFileSync(join(dir, f), join(copy, f));
      const flag = 'export const WORKFLOW_SCRIPTS_ACCEPTED = false;';
      const src = readFileSync(join(copy, 'hook-dispatch.mjs'), 'utf8');
      if (!src.includes(flag)) return false;
      writeFileSync(join(copy, 'hook-dispatch.mjs'), src.replace(flag, 'export const WORKFLOW_SCRIPTS_ACCEPTED = true;'));
      // The plan's path is only known once its home exists, so the script is written with it and the plan is rewritten.
      const w = world(copy, [], STEPS_PLAN);
      const script = SCRIPT.split('/plans/gate-test.md').join(w.plan);
      const text = scriptPlan(script);
      writeFileSync(w.plan, text);
      const marker = join(w.home, '.claude', 'APPROVED-PLAN.json');
      const approve = (extra) => writeFileSync(marker, JSON.stringify({ plan: w.plan, hash: sha256(text), ...extra }));
      const send = (body) => w.call('PreToolUse', { session_id: sid('wk'), tool_name: 'Workflow', tool_input: { script: body } });
      approve({ scriptHash: sha256(script) });
      const ok = send(script);
      const changed = send(`${script}\n`);
      approve({});
      const noHash = send(script);
      approve({ scriptHash: sha256('another script') });
      const other = send(script);
      return ok.status === 0 && changed.status === 2 && /byte for byte/.test(changed.stderr) && noHash.status === 2 && /does not hold the hash/.test(noHash.stderr)
        && other.status === 2 && /does not hold the hash/.test(other.stderr);
    },
  },
  {
    name: 'the approval marker records the hash of the plan\'s script when the plan is approved, through the tool and from the owner\'s exit in the app; an amendment of the Steps moves the marker\'s hash and never the script\'s, so a script edited after approval matches nothing',
    guards: ['script_mark', 'script_app_exit', 'script_amend_keeps'],
    run(m, dir) {
      const text = scriptPlan();
      const A = appHome(dir);
      writeFileSync(A.plan, text);
      const tr = transcript([turn(0, 'start')]);
      A.guard(tr, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: text, isAgent: false, filePath: A.plan } }, '--mark');
      const mk0 = A.mk();
      const STEP = { old_string: '1. **Build.** Make the thing.', new_string: '1. **Build.** Make the thing, and say what it did.' };
      writeFileSync(A.plan, text.replace(STEP.old_string, STEP.new_string));
      A.guard(tr, { tool_name: 'Edit', tool_input: { file_path: A.plan, ...STEP }, hook_event_name: 'PostToolUse' }, '--amend');
      const mk1 = A.mk();
      const edited = text.replace(STEP.old_string, STEP.new_string).replace("await agent('/plans/gate-test.md step 2')", "await agent('/plans/gate-test.md step 1')");
      writeFileSync(A.plan, edited);
      A.guard(tr, { tool_name: 'Edit', tool_input: { file_path: A.plan, old_string: 'x', new_string: 'y' }, hook_event_name: 'PostToolUse' }, '--amend');
      const mk2 = A.mk();
      // The owner's exit from plan mode in the app records it too.
      const F = appHome(dir);
      writeFileSync(F.plan, text);
      const hourAgo = (Date.now() - 60 * 60 * 1000) / 1000;
      utimesSync(F.plan, hourAgo, hourAgo);
      const uf = uid();
      const trF = transcript([turn(0, 'start'), ...enterPlan(-60), ...exitPlan(-20, false), exitEntry(-19, F.plan, uf)]);
      F.guard(trF, { tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      return mk0?.scriptHash === sha256(SCRIPT) && mk1?.hash === sha256(text.replace(STEP.old_string, STEP.new_string)) && mk1.scriptHash === sha256(SCRIPT)
        && mk2?.hash === sha256(edited) && mk2.scriptHash === sha256(SCRIPT) && m.report.scriptHashOf(edited) !== mk2.scriptHash
        && F.mk()?.scriptHash === sha256(SCRIPT);
    },
  },

  // ---- a latched agent writes its own report; an agent reads the rules first (step 108) ----
  {
    name: 'a latched agent may write its own progress note and report, step-N.txt and step-N-report.txt directly in progress/ in the scratchpad for the step its prompt names; any other file, another step\'s, another tool and every other call stay refused, and its return passes',
    guards: ['report_write_latch', 'report_write_tool', 'report_write_dir', 'report_write_scratchpad', 'report_write_name', 'report_write_own'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('lw');
      const pad = `/tmp/claude-0/-home-user/${s}/scratchpad`;
      const subs = join(w.tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(subs, { recursive: true });
      // The agent was sent for step 3 and has read the rules.
      writeFileSync(join(subs, 'agent-a1.jsonl'), jsonl([at({ type: 'user', message: { role: 'user', content: `${w.plan} step 3` } }, later(-300)), ...rulesReadEntries(dir, 'a1').slice(1)]));
      const call = (tool_name, tool_input) => w.call('PreToolUse', { session_id: s, agent_id: 'a1', tool_name, tool_input });
      const latch = call('Write', { file_path: join(w.cwd, 'stray.txt'), content: 'x' });
      const held = call('Bash', { command: 'git status' });
      const write = (p, tool_name = 'Write') => call(tool_name, { file_path: p, content: 'x', old_string: 'a', new_string: 'b', edits: [{ old_string: 'a', new_string: 'b' }] });
      const passes = write(`${pad}/progress/step-3-report.txt`).status === 0 && write(`${pad}/progress/step-3.txt`).status === 0
        && write(`${pad}/progress/step-3-report.txt`, 'Edit').status === 0 && write(`${pad}/progress/step-3.txt`, 'MultiEdit').status === 0;
      const stays = [
        write(`${pad}/progress/step-4-report.txt`), write(`${pad}/progress/step-3.txt.bak`), write(`${pad}/progress/notes.txt`), write(`${pad}/progress/sub/step-3.txt`),
        write(`${pad}/status/fix-run.html`), write(`${pad}/step-3.txt`), write(`${pad}/status/step-3.txt`), write(join(w.cwd, 'stray.txt')), write(`/tmp/claude-0/-home-user/another-session/scratchpad/progress/step-3.txt`),
        write(`${pad}/progress/step-3.txt`, 'NotebookEdit'), call('Read', { file_path: `${pad}/progress/step-3-report.txt` }), call('Bash', { command: 'git status' }),
      ].every((r) => r.status === 2 && /REFUSAL LATCH/.test(r.stderr));
      const back = call('SubagentHandback', { message: 'Refused by the plan fence; nothing was written.' });
      return latch.status === 2 && held.status === 2 && /REFUSAL LATCH/.test(held.stderr) && passes && stays && back.status === 0;
    },
  },
  {
    name: 'an agent\'s first call is the Read of the shared rules: every other call is refused until its own transcript holds a Read of agent-rules.md that was not refused; the Read itself, the live clone\'s copy, its return, its TaskStop and a progress note or report in the scratchpad pass; with no transcript of its own the call is refused',
    guards: ['rules_first', 'rules_first_read', 'rules_first_live', 'rules_first_transcript', 'rules_first_head', 'rules_first_error', 'rules_first_other_file', 'rules_first_none', 'rules_first_report', 'rules_first_mark', 'rules_first_second', 'rules_first_skip_latch'],
    run(m, dir) {
      const s = sid('rf');
      const tr = transcript([turn(0, 'start')]);
      const subs = join(tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(subs, { recursive: true });
      const rules = join(dir, 'agent-rules.md');
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      // No `rules` option: the real check runs.
      const decide = (extra = {}, id = 'a1') => m.fence.decide({ session_id: s, agent_id: id, transcript_path: tr, cwd: '/', tool_name: 'Bash', tool_input: { command: 'git status' }, ...extra }, { plan });
      const agent = (id, entries) => writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl(entries));
      const prompt = at({ type: 'user', message: { role: 'user', content: 'Go to step 2.' } }, later(-300));
      const readRules = (id, file = rules, error = null) => [at(tool(0, `${id}-r`, 'Read', { file_path: file }), later(-290)), ...(error === null ? [] : [at(result(0, `${id}-r`, error ? 'File not found' : '1\tRules version: 1', error), later(-289))])];
      const refused = (x, re = /RULES FIRST/) => /^PLAN FENCE/.test(x ?? '') && re.test(x);
      const noFile = refused(decide(), /No transcript of this agent was found/);
      const itself = decide({ tool_name: 'Read', tool_input: { file_path: rules } }) === null
        && decide({ tool_name: 'Read', tool_input: { file_path: join(homedir(), '.claude', 'hub', 'agent-rules.md') } }) === null;
      const otherRead = refused(decide({ tool_name: 'Read', tool_input: { file_path: join(dir, 'CLAUDE.md') } }));
      const returns = decide({ tool_name: 'SubagentHandback', tool_input: { message: 'x' } }) === null && decide({ tool_name: 'TaskStop', tool_input: { task_id: 'bxyz789' } }) === null;
      const report = decide({ tool_name: 'Write', tool_input: { file_path: `/tmp/claude-0/-home-user/${s}/scratchpad/progress/step-2-report.txt`, content: 'x' } }) === null
        && refused(decide({ tool_name: 'Write', tool_input: { file_path: `/tmp/claude-0/-home-user/${s}/scratchpad/progress/notes.txt`, content: 'x' } }));
      agent('a1', [prompt]);
      const emptyAgent = refused(decide(), /holds no Read of that file/);
      agent('a1', [prompt, ...readRules('a1', join(dir, 'CLAUDE.md'), false)]);
      const wrongFile = refused(decide());
      agent('a1', [prompt, ...readRules('a1', rules, true)]);
      const refusedRead = refused(decide());
      agent('a1', [prompt, ...readRules('a1', rules, false)]);
      const ok = decide() === null;
      agent('a1', [prompt, ...readRules('a1')]);
      const issued = decide() === null;
      // The Read sits at the start of the transcript: an agent that has since printed more than the tail a check might read
      // (here five megabytes) is not refused for it.
      agent('a1', [prompt, ...readRules('a1', rules, false), at(tool(0, 'big1', 'Bash', { command: 'git log' }), later(-200)), at(result(0, 'big1', 'x'.repeat(5 * 1024 * 1024)), later(-199))]);
      const afterBig = decide() === null;
      // Through hook-dispatch: the refusal latches that agent alone, and it can still write its report.
      const w = world(dir);
      const sw = sid('rf');
      const sub2 = join(w.tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(sub2, { recursive: true });
      writeFileSync(join(sub2, 'agent-ax.jsonl'), jsonl([at({ type: 'user', message: { role: 'user', content: `${w.plan} step 2` } }, later(-300))]));
      const call = (tool_name, tool_input) => w.call('PreToolUse', { session_id: sw, agent_id: 'ax', tool_name, tool_input });
      const first = call('Bash', { command: 'git status' });
      // The harness records the refused call as an error result in the agent's transcript, before the agent's next call.
      writeFileSync(join(sub2, 'agent-ax.jsonl'), jsonl([at({ type: 'user', message: { role: 'user', content: `${w.plan} step 2` } }, later(-300)), at(tool(0, 'ax-1', 'Bash', { command: 'git status' }), later(-260)), at(result(0, 'ax-1', first.stderr, true), later(-259))]));
      // The first refusal sets no latch; the second refusal latches the agent, which may still write its report and nothing else.
      const next = call('Bash', { command: 'git log' });
      const note = call('Write', { file_path: `/tmp/claude-0/-home-user/${sw}/scratchpad/progress/step-2.txt`, content: 'REFUSED' });
      const after = call('Bash', { command: 'git log' });
      const flow = first.status === 2 && /RULES FIRST, NO LATCH/.test(first.stderr) && !latched(sw)
        && next.status === 2 && /RULES FIRST:/.test(next.stderr) && !/NO LATCH/.test(next.stderr) && note.status === 0
        && after.status === 2 && /REFUSAL LATCH/.test(after.stderr) && !latched(sw);
      return noFile && itself && otherRead && returns && report && emptyAgent && wrongFile && refusedRead && ok && issued && afterBig && flow;
    },
  },

  // ---- the allow rules that keep an agent's commands out of the harness's own judgement (step 108) ----
  {
    name: 'the hub\'s own .claude/settings.json parses, keeps its hooks, and allows only Artifact and rules that each name one command shape: a bare Bash, a wildcard alone and a rule for a whole program are found first in a planted list, before the real file is trusted to pass',
    run() {
      const broad = (list) => list.filter((r) => {
        if (r === 'Artifact') return false;
        const m = /^Bash\((.+)\)$/.exec(r);
        if (!m) return true;
        const body = m[1].replace(/:\*$/, '').trim();
        return !body || body === '*' || /^(?:git|node|npm|npx|python3?|bash|sh|curl|wget|rm|sudo)$/.test(body);
      });
      // The control: the instrument must find these seven and only these before the real file is judged.
      const planted = ['Artifact', 'Bash', 'Bash(*)', 'Bash(:*)', 'Bash(node:*)', 'Bash(git:*)', 'Bash(npm:*)', 'Bash(python3:*)', 'Bash(git status:*)', 'Bash(node --check:*)'];
      const found = broad(planted);
      let real = null;
      try { real = JSON.parse(readFileSync(join(HERE, '.claude', 'settings.json'), 'utf8')); } catch { return false; }
      const allow = real?.permissions?.allow;
      return found.join('|') === 'Bash|Bash(*)|Bash(:*)|Bash(node:*)|Bash(git:*)|Bash(npm:*)|Bash(python3:*)'
        && Array.isArray(allow) && allow.every((r) => typeof r === 'string') && broad(allow).length === 0 && new Set(allow).size === allow.length
        && ['SessionStart', 'Stop', 'PreToolUse'].every((e) => Array.isArray(real.hooks?.[e]) && real.hooks[e].length > 0);
    },
  },

  // ---- the manager's written judgement of each hand-back (step 119) ----
  {
    name: 'the judgement gate sends no step until status/manager.txt holds, written after the newest hand-back of a step of the plan, a line "Judged N:" with all five parts for each end of that step and a line "Why M:" with all four parts for each earlier end of the step being sent and one more: a REFUSED hand-back is judged too, a line for another step judges nothing, a line short of a part or with a part under ten characters judges nothing, a Standing step goes without one, a plan with no Order is gated the same way, and each refusal names the line to write and does not latch',
    guards: ['judged_gate_wired', 'judged_gate_no_latch', 'judged_gate_standing', 'judged_state_after', 'judged_state_count', 'judged_state_step', 'judged_notes_parse', 'judged_parts', 'judged_part_min', 'judged_why_gate', 'judged_why_parts', 'judged_why_count', 'judged_no_order'],
    run(m, dir) {
      const w = world(dir, [], ORDER_PLAN);
      const subs = join(w.tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(subs, { recursive: true });
      const agent = (id, n, first) => putAgent(subs, w.plan, id, n, -300, -100, first);
      const sendTo = (world_, n, pad) => {
        const s = sid('jg');
        pad(s);
        return { s, r: world_.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${world_.plan} step ${n}`, subagent_type: 'general-purpose' } }) };
      };
      const send = (n, lines, age = 0, whys = MANY_WHYS) => sendTo(w, n, (s) => judgedPad(s, lines, age, whys));
      const raw = (n, text) => sendTo(w, n, (s) => notesPad(s, text));
      const owed = (x, re) => x.r.status === 2 && /JUDGEMENT GATE/.test(x.r.stderr) && re.test(x.r.stderr) && !latched(x.s);
      const goes = (x) => x.r.status === 0;
      const manyWhys = Object.entries(MANY_WHYS).map(([n, c]) => Array.from({ length: c }, (_, i) => whyLine(n, i + 1)).join('\n')).join('\n');
      const nothing = send(1, {});
      agent('r1', 1, 'REFUSED');
      const refusedOwed = send(1, {});
      const refusedJudged = send(1, { 1: 1 });
      const otherStep = send(1, { 2: 1 });
      const stale = send(1, { 1: 1 }, 300);
      const standing = send(3, {});
      // A line short of parts, or with a part under ten characters, judges nothing.
      const partial = raw(1, `Judged 1: is: it was whole | why: it ended as set up | route: the plan sends next\n${manyWhys}`);
      const thin = raw(1, `${judgedLine(1).replace('is: the case read hand-back 1', 'is: ok')}\n${manyWhys}`);
      // The step being sent has a Why line for each earlier end of it and one more.
      const whyShort = send(1, { 1: 1 }, 0, { 1: 1 });
      const whyNone = send(1, { 1: 1 }, 0, {});
      const whyPartial = raw(1, `${judgedLine(1)}\nWhy 1: now: sent again | wrong: nothing\n${whyLine(1)}`);
      const whyWhole = send(1, { 1: 1 }, 0, { 1: 2 });
      agent('d1', 1, 'DONE');
      const short = send(2, { 1: 1 });
      const whole = send(2, { 1: 2 });
      // A plan with no Order is gated the same way.
      const w2 = world(dir, [], STEPS_PLAN);
      const subs2 = join(w2.tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(subs2, { recursive: true });
      const free = sendTo(w2, 1, (s) => judgedPad(s, {}));
      const freeWhy = sendTo(w2, 1, (s) => judgedPad(s, {}, 0, {}));
      putAgent(subs2, w2.plan, 'p1', 1, -300, -100, 'DONE');
      const freeOwed = sendTo(w2, 2, (s) => judgedPad(s, {}));
      const freeJudged = sendTo(w2, 2, (s) => judgedPad(s, { 1: 1 }));
      return goes(nothing) && owed(refusedOwed, /"Judged 1:/) && /status\/manager\.txt/.test(refusedOwed.r.stderr) && goes(refusedJudged)
        && owed(otherStep, /no line keyed "Judged 1:"/) && owed(stale, /is not after that end/) && goes(standing)
        && owed(partial, /lack fails, cheapest/) && owed(thin, /lack is /)
        && owed(whyShort, /holds 1 whole line keyed "Why 1:" of the 2 it needs/) && owed(whyNone, /"Why 1:/) && owed(whyPartial, /lacks .*cheapest/) && goes(whyWhole)
        && owed(short, /holds 1 such line for 2 ends of that step/) && goes(whole)
        && goes(free) && owed(freeWhy, /"Why 1:/) && owed(freeOwed, /"Judged 1:/) && goes(freeJudged);
    },
  },
  {
    name: 'the judgement state is read from the notes, the plan\'s steps and the newest end of a step: judged, owed with no line, short of one whole line per end, incomplete when a line lacks a part or carries one under ten characters, stale after a later write, a step outside the plan judges nothing, a plan with no Order is judged by its Steps, the step being sent needs a Why line for each earlier end and one more, a Standing step needs none, the newest end of any step is the one read, and an unreadable session or notes pad is refused and not passed',
    guards: ['judged_state_after', 'judged_state_count', 'judged_state_step', 'judged_state_order', 'judged_state_newest', 'judged_state_unread', 'judged_gate_closed', 'judged_gate_not_read', 'judged_gate_subagent', 'judged_gate_standing', 'judged_notes_parse', 'judged_parts', 'judged_part_min', 'judged_why_gate', 'judged_why_parts', 'judged_why_count', 'judged_no_order'],
    run(m, dir) {
      const padWith = (text) => { const d = tmp('sg-pad-'); mkdirSync(join(d, 'status'), { recursive: true }); writeFileSync(join(d, 'status', 'manager.txt'), `${text}\n`); return d; };
      const pad = padWith(`${judgedLine(1)}\n${whyLine(2)}`);
      const partialPad = padWith('Judged 1: is: it was whole | why: it ended as set up | route: the plan sends next');
      const thinPad = padWith(judgedLine(1).replace('is: the case read hand-back 1', 'is: ok'));
      const whyPartialPad = padWith(`${judgedLine(1)}\nWhy 2: now: sent again | wrong: nothing`);
      const PL = { path: '/plans/gate-test.md', text: ORDER_PLAN };
      const FREE = { path: PL.path, text: STEPS_PLAN };
      const endAt = Date.now() - 60000;
      const st = (ends, o = {}) => m.report.judgedState({ session_id: 'js' }, o.plan ?? PL, { ends, pad: 'pad' in o ? o.pad : pad, send: o.send });
      const P = { session_id: 'js', tool_name: 'Agent', tool_input: { prompt: `${PL.path} step 2` } };
      const owedState = { kind: 'none', step: 1, endAt, ends: 1, have: 0, notesAt: 0, file: '/pad/status/manager.txt' };
      const refuses = (x, re) => typeof x === 'string' && /^JUDGEMENT GATE/.test(x) && re.test(x);
      return st([{ step: 1, at: endAt }]).kind === 'judged'
        && st([{ step: 1, at: Date.now() + 60000 }]).kind === 'stale'
        && st([{ step: 2, at: endAt }]).kind === 'none'
        && st([{ step: 1, at: endAt }, { step: 1, at: endAt - 1000 }]).kind === 'short'
        && st([{ step: 4, at: endAt }]).kind === 'not-enforced' && st([{ step: null, at: endAt }]).kind === 'not-enforced'
        && st([{ step: 1, at: endAt - 5000 }, { step: 2, at: endAt }]).kind === 'none'
        && st([{ step: 1, at: endAt }], { pad: null }).kind === 'no-pad'
        && st(null).kind === 'not-read'
        && st([{ step: 1, at: endAt }], { plan: FREE }).kind === 'judged' && st([{ step: 2, at: endAt }], { plan: FREE }).kind === 'none'
        && st([{ step: 1, at: endAt }], { plan: { path: PL.path, text: PLAN(OWN_WORDS) } }).kind === 'not-enforced'
        && m.report.judgedState({ session_id: 'js' }, null).kind === 'not-enforced'
        && st([{ step: 1, at: endAt }], { pad: partialPad }).kind === 'incomplete' && st([{ step: 1, at: endAt }], { pad: partialPad }).missing.join() === 'fails,cheapest'
        && st([{ step: 1, at: endAt }], { pad: thinPad }).kind === 'incomplete' && st([{ step: 1, at: endAt }], { pad: thinPad }).missing.join() === 'is'
        && st([{ step: 1, at: endAt }], { send: 2 }).kind === 'judged'
        && st([{ step: 1, at: endAt }, { step: 2, at: endAt - 1000 }], { send: 2 }).kind === 'why-short'
        && st([{ step: 1, at: endAt }], { send: 1 }).kind === 'why-none'
        && st([{ step: 1, at: endAt }], { pad: whyPartialPad, send: 2 }).kind === 'why-incomplete' && st([{ step: 1, at: endAt }], { pad: whyPartialPad, send: 2 }).whyMissing.join() === 'wrong,fails,cheapest'
        && st([{ step: 1, at: endAt }], { send: 3 }).kind === 'not-enforced'
        && st([], { send: 2 }).kind === 'judged' && st([], { send: 1 }).kind === 'why-none' && st([]).kind === 'not-enforced'
        && refuses(m.dispatch.judgedGate(P, PL, { kind: 'not-read' }), /cannot be read/) && refuses(m.dispatch.judgedGate(P, PL, null), /could not be read/)
        && refuses(m.dispatch.judgedGate(P, PL, owedState), /Judged 1:/)
        && refuses(m.dispatch.judgedGate(P, PL, { kind: 'why-none', send: 2, whyHave: 0, whyNeed: 1, file: '/pad/status/manager.txt' }), /"Why 2:/)
        && refuses(m.dispatch.judgedGate(P, PL, { ...owedState, kind: 'incomplete', partial: 1, missing: ['fails'] }), /lack fails/)
        && m.dispatch.judgedGate(P, PL, { ...owedState, kind: 'judged' }) === null && m.dispatch.judgedGate(P, PL, { ...owedState, kind: 'not-enforced' }) === null
        && m.dispatch.judgedGate({ ...P, agent_id: 'a1' }, PL, owedState) === null && m.dispatch.judgedGate({ ...P, tool_name: 'Bash' }, PL, owedState) === null
        && m.dispatch.judgedGate({ ...P, tool_input: { prompt: 'something else' } }, PL, owedState) === null
        && m.dispatch.judgedGate({ ...P, tool_input: { prompt: `${PL.path} step 3` } }, PL, owedState) === null
        && refuses(m.dispatch.judgedGate(P, FREE, owedState), /Judged 1:/);
    },
  },
  {
    name: 'every status prints a Judgement line under the Review line, read by the function the judgement gate refuses on: nothing to judge, a hand-back owed its line with the file and the five parts to write, a line short of a part named as such, and a hand-back judged with the step about to go reminded of its own line',
    guards: ['judged_status_print', 'judged_block_text'],
    run(m, dir) {
      const home = tmp('sg-home-');
      const s = sid('jp');
      const proj = join(home, '.claude', 'projects', '-home-user');
      const subs = join(proj, s, 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(proj, `${s}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
      const plan = join(home, '.claude', 'plans', 'gate-test.md');
      writeFileSync(plan, ORDER_PLAN);
      writeFileSync(join(home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan, hash: sha256(ORDER_PLAN), at: new Date().toISOString() }));
      const old = (Date.now() - 60 * 60 * 1000) / 1000;
      utimesSync(plan, old, old);
      writeFileSync(join(home, '.claude', 'report-clock.json'), JSON.stringify({ at: Date.now() - 10 * 60000, status: 'Status' }));
      const temp = tmp('sg-tmp-');
      const pad = join(temp, 'claude-0', '-home-user', s, 'scratchpad');
      mkdirSync(join(pad, 'status'), { recursive: true });
      const status = () => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the judgement test'], { encoding: 'utf8', env: { ...process.env, HOME: home, TMPDIR: temp, CLAUDE_CODE_SESSION_ID: s } }).stdout ?? '';
      const first = status();
      putAgent(subs, plan, 'a1', 1, -900, -800, 'DONE');
      const owedOut = status();
      writeFileSync(join(pad, 'status', 'manager.txt'), 'Judged 1: is: it was whole | why: it ended as set up | route: the plan sends next\n');
      const partialOut = status();
      writeFileSync(join(pad, 'status', 'manager.txt'), `${judgedLine(1)}\n`);
      const judgedOut = status();
      const before = (out, a, b) => out.indexOf(a) >= 0 && out.indexOf(a) < out.indexOf(b);
      return /^Judgement: nothing to judge/m.test(first) && before(first, 'Review:', 'Judgement:')
        && /^Judgement: OWED\. Step 1's newest hand-back ended .*"Judged 1: is: <what the hand-back showed> \| why: <why it ended as it did> \| route: .* \| fails: .* \| cheapest: .*".*no step is sent until it is there\.$/m.test(owedOut)
        && owedOut.includes(join(pad, 'status', 'manager.txt')) && before(owedOut, 'Review:', 'Judgement: OWED')
        && /^Judgement: OWED\..*the newest line held lacks fails, cheapest\)/m.test(partialOut)
        && /^Judgement: step 1's newest hand-back \(ended .*\) is judged in .*"Why <step>: now: … \| wrong: … \| fails: … \| cheapest: …"/m.test(judgedOut) && judgedOut.includes(join(pad, 'status', 'manager.txt'));
    },
  },

  // ---- the stop guard's three managing shapes (step 119) ----
  {
    name: 'the stop guard refuses a reply that names the owner\'s emotion, one that promises future conduct, and one whose open line asks for a go-word while the owner\'s newest message is a correction; a code block quoting those words, an honest report, a go-word asked for on a later line, and the same open line when no correction stands pass',
    guards: ['managing_wired', 'managing_emotion', 'managing_promise', 'managing_go', 'managing_correction', 'managing_correction_read', 'managing_fenced', 'managing_first_line'],
    run(m, dir) {
      const correction = 'The page shows the wrong step and the list is out of date';
      const say = (text, ownerText = GO) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: sid('mg'), transcript_path: transcript([turn(0, ownerText), reply(5, text)]) }), encoding: 'utf8' });
      const refusedAs = (r, re) => r.status === 2 && /LESSONS §406/.test(r.stderr) && re.test(r.stderr);
      const emotion = [say('I understand your frustration with the status page. The list now reads from the notes file.'),
        say('You are clearly annoyed about this, and the record shows why.'), say('The owner is upset by the stale page.')];
      const promise = [say('The fence refused the read. From now on I will read the record first.'), say('This will not happen again.'), say('I promise the record is read.')];
      const goAsk = say('Say go when you want the step sent.', correction);
      const goAskTwo = say('You can type go to continue.', correction);
      const goLater = say('The page lists the open steps.\n\nSay go to continue.', correction);
      const goNoCorrection = say('Say go when you want the step sent.');
      const fenced = say('The refusal said:\n\n```\nFrom now on I will read the record. I understand your frustration.\n```\nThat is all it said.');
      const honest = say('The fence passes the plan read now, and the suite reports its cases.');
      return emotion.every((r) => refusedAs(r, /names the owner's emotion/)) && promise.every((r) => refusedAs(r, /promises future conduct/))
        && refusedAs(goAsk, /opens by asking for a go-word while the owner's newest message is a correction/) && refusedAs(goAskTwo, /go-word/)
        && goLater.status === 0 && goNoCorrection.status === 0 && fenced.status === 0 && honest.status === 0;
    },
  },

  // ---- the stop guard's go-word refusal fires only on an instruction to the owner (step 186, LESSONS §423) ----
  {
    name: 'the stop guard\'s refusal of a reply that asks for a go-word fires only on a sentence that instructs the owner, one whose subject is the owner (you, the owner, or an imperative) and whose verb is say, send, press, type, write or give with a go-word or the word approval as its object: a line opening Stopping here, a sentence stating that a gate holds something until a message carries a word, and a sentence that only describes a go-word or names another verb no longer refuse',
    guards: ['go_instruction', 'go_stopping_here', 'go_gate_hold', 'go_imperative_start', 'go_subject', 'go_verbs', 'go_object'],
    run(m, dir) {
      const correction = 'The page shows the wrong step and the list is out of date';
      const say = (text, ownerText = correction) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: sid('go'), transcript_path: transcript([turn(0, ownerText), reply(5, text)]) }), encoding: 'utf8' });
      // Under a correction these were refused before, on the word go-word or on a verb and a go within fifty characters. None instructs the owner.
      const passes = [
        'Stopping here: open for you is nothing; the review gate holds step 190 until a message ends with a go-word.',
        'Stopping here: open for you is the choice below. You say go and the gate sends the step.',
        'The review gate holds the next step until a message carries a go-word.',
        'The next step stays held by the gate until a message ends with a go-word.',
        'The go-word is a thing the owner gives.', 'A go-word lifts the correction.', 'The step went after the owner gave a go-word.',
        'Reply go when you want the step sent.', 'Answer yes when the choice is clear.', 'Send the report so the step can go.', 'Write the notes, and the step will go on.',
        'The agent will say go in its report.', 'I will send the next step.',
        // A clause stating what a gate holds until, though the clause names the owner and a verb of the list, is not an instruction.
        'The review gate holds step 190 until you send a go-word.', 'The next step is held by the gate until the owner types go.',
      ].map((t) => [t, say(t)]);
      const wrong = passes.filter(([, r]) => r.status !== 0).map(([t, r]) => `${JSON.stringify(t)} exit ${r.status}: ${r.stderr.split('\n')[0].slice(0, 80)}`);
      if (wrong.length) throw new Error(`refused, and should pass: ${wrong.join('; ')}`);
      // An instruction to the owner, in the imperative or with the owner as the subject, still refuses; a hold clause beside it does not excuse it.
      const refuses = [
        'Say go to continue.', 'You can type go when the step should be sent.', 'Please give approval so the plan can run.', 'Send a go-word and the step goes.',
        'The owner can press go to continue.', 'Say go and the gate sends the step; the gate holds nothing until then.', 'The page lists the open steps. Send ok to continue.',
        'Write approved below and the step goes.', 'Give me a yes.', 'Press continue when ready.', 'When you are ready, say go.',
      ].map((t) => [t, say(t)]);
      const unrefused = refuses.filter(([, r]) => !(r.status === 2 && /LESSONS §406/.test(r.stderr) && /opens by asking for a go-word/.test(r.stderr))).map(([t]) => JSON.stringify(t));
      if (unrefused.length) throw new Error(`not refused as a go-word ask: ${unrefused.join('; ')}`);
      return true;
    },
  },
  {
    name: 'the go-word refusal still fires on an instruction to the owner that it refused before (say, send, type and write with a go-word, an ok, an approved or a yes, as an imperative or with you as the subject), on the open line only and under a correction only: the same instruction on a later line, or with no correction standing, passes, and the other two managing shapes are as they were',
    guards: ['managing_go', 'managing_first_line', 'managing_correction'],
    run(m, dir) {
      const correction = 'The page shows the wrong step and the list is out of date';
      const say = (text, ownerText = correction) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: sid('gp'), transcript_path: transcript([turn(0, ownerText), reply(5, text)]) }), encoding: 'utf8' });
      const goRefused = (r) => r.status === 2 && /LESSONS §406/.test(r.stderr) && /opens by asking for a go-word/.test(r.stderr);
      const verbs = ['Say go.', 'Send ok.', 'Type approved.', 'Write yes.', 'Say okay.', 'Send the go-word.', 'You may write go.', 'Give me a yes.', 'You can say continue.'].map((t) => [t, goRefused(say(t))]);
      const missed = verbs.filter(([, ok]) => !ok).map(([t]) => JSON.stringify(t));
      if (missed.length) throw new Error(`not refused: ${missed.join('; ')}`);
      const later = say('The page lists the open steps.\n\nSay go to continue.');
      const noCorrection = say('Say go to continue.', GO);
      const emotion = say('I understand your frustration with the status page. The list now reads from the notes file.');
      const promise = say('This will not happen again.');
      return later.status === 0 && noCorrection.status === 0
        && emotion.status === 2 && /names the owner's emotion/.test(emotion.stderr) && promise.status === 2 && /promises future conduct/.test(promise.stderr);
    },
  },

  // ---- the brief prints each repository's STATE.md (step 119) ----
  {
    name: 'the brief prints each repository\'s STATE.md whole where one exists (the one it is run for, the hub\'s, and every repository beside either), says in one line when none has one, and prints nothing for a folder that is not a repository',
    guards: ['brief_state_whole', 'brief_state_none', 'brief_state_siblings', 'brief_state_git', 'brief_state_hub'],
    run(m, dir) {
      const parent = tmp('sg-state-');
      const hub = join(parent, 'hub');
      mkdirSync(join(hub, 'lessons'), { recursive: true });
      copyFileSync(join(dir, 'session-brief.mjs'), join(hub, 'session-brief.mjs'));
      writeFileSync(join(hub, 'lessons', '001-fixture.md'), '## 001 · A fixture lesson\n\n**Enforced by:** JUDGEMENT\n');
      const brief = (repoDir) => spawnSync('node', [join(hub, 'session-brief.mjs'), '--repo', repoDir], { input: '', encoding: 'utf8', timeout: 20000 });
      const none = brief(hub);
      const mk = (name, git, state) => { const d = join(parent, name); mkdirSync(d); if (git) mkdirSync(join(d, '.git')); if (state !== null) writeFileSync(join(d, 'STATE.md'), state); return d; };
      const alpha = mk('alpha', true, '# Alpha state\n\nThe walk is running.\nThe last line of alpha.\n\n\n');
      mk('beta', true, null);
      mk('gamma', false, 'The gamma state text, which is no repository\'s.\n');
      mk('delta', true, 'The delta state, a repository beside the others.\n');
      writeFileSync(join(hub, 'STATE.md'), 'The hub state: one line.\n');
      const withState = brief(alpha);
      const out = withState.stdout;
      return none.status === 0 && /STATE\.md: none of the 1 repository beside this brief keeps one\./.test(none.stdout)
        && withState.status === 0 && out.includes('STATE.md of alpha') && out.includes('# Alpha state\n\nThe walk is running.\nThe last line of alpha.')
        && out.includes('STATE.md of delta') && out.includes('The delta state, a repository beside the others.')
        && out.includes('STATE.md of hub') && out.includes('The hub state: one line.') && !out.includes('STATE.md of beta')
        && !out.includes('STATE.md of gamma') && !out.includes('The gamma state text') && !/STATE\.md: none of/.test(out)
        && out.indexOf('STATE.md of alpha') < out.indexOf('STATE.md of hub');
    },
  },

  // ---- a plan rests on quoted evidence, accounts for the roadmap, and answers a range of findings in one line (step 119) ----
  {
    name: 'a plan that names a repository and sends agents rests on its "## What is": each bullet quotes, in double quotes, twelve characters or more of a line present in a file it names that a repository the Files names holds, an ellipsis standing for words left out, and every quoted stretch must be there; a bullet with no quote, no file, a file no repository holds, a short quote or a quote the file does not carry is listed, and a plan with no section is refused',
    guards: ['what_is_plan_guard_wired', 'what_is_no_quote', 'what_is_no_file', 'what_is_file_held', 'what_is_quote_held', 'what_is_every_span', 'what_is_short', 'what_is_empty', 'what_is_no_steps', 'what_is_elision'],
    run(m, dir) {
      const NOTES_R = ['# Notes', '', 'The export control lives in the toolbar builder, which places the button.', '',
        '## Next capability release', '- [ ] **Alpha feature moves the button** <!-- decision: 012 -->', '', '## Something else', 'Prose.', ''].join('\n');
      const R = repo({ 'NOTES.md': NOTES_R, 'a.txt': 'x\n' }, 'what-repo');
      const files = '- what-repo: `a.txt`';
      const wi = (what, o = {}) => m.dispatch.whatIsProblem(sendingPlan(dir, { files, what, ...o }), { dir: R.dir });
      const lists = (x, re) => typeof x === 'string' && /^WHAT IS/.test(x) && re.test(x);
      const good = '- "the toolbar builder, which places the button" (NOTES.md, line 3).';
      const curly = '- “The export control lives in the toolbar builder” (NOTES.md).';
      const elided = '- "The export control lives ... which places the button" (NOTES.md).';
      const noQuote = wi('- the button should move (NOTES.md).');
      const noFile = wi('- "the toolbar builder, which places the button" and nothing else.');
      const noRepoFile = wi('- "the toolbar builder, which places the button" (MISSING.md).');
      const notThere = wi('- "a sentence the file does not carry anywhere" (NOTES.md).');
      const oneOfTwo = wi('- "the toolbar builder" and "an absent phrase here that is long" (NOTES.md).');
      const shortQuote = wi('- "the button" (NOTES.md).');
      const several = wi(`${good}\n- the second bullet quotes nothing (NOTES.md).\n- "an absent sentence of some length" (NOTES.md).`);
      // The plan guard refuses ExitPlanMode for it, and passes the same plan once its bullets quote. The item is marked out: this case is
      // about the quotes, and an item marked in is also asked for a read of the commit log and a Shipped check line (LESSONS §423).
      const roadmap = '- 012 out: the plan leaves the first feature alone';
      const exits = (what) => exitFor(dir, sendingPlan(dir, { files, what, roadmap }), R.dir);
      const bad = exits('- the button should move (NOTES.md).');
      const okExit = exits(good);
      const none = exits(null);
      const said = (r) => `${r.stdout}${r.stderr}`;
      // Not judged: no Steps, or a Files that names no repository.
      const noSteps = m.dispatch.whatIsProblem(PLAN(OWN_WORDS), { roots: [R.dir] });
      const noRoots = m.dispatch.whatIsProblem(sendingPlan(dir, { files: null, what: null }), { dir: R.dir });
      return wi(good) === null && wi(curly) === null && wi(elided) === null
        && lists(noQuote, /quotes nothing/) && lists(noFile, /names no file outside the quote/) && lists(noRepoFile, /no repository the Files names holds MISSING\.md/)
        && lists(notThere, /the file does not carry the quote \(NOTES\.md\)/) && lists(oneOfTwo, /does not carry the quote/) && lists(shortQuote, /quotes nothing/)
        && lists(several, /2 of the "## What is" bullets do not quote/) && !/line 3/.test(several)
        && lists(wi(null), /has no "## What is" section with a bullet in it/)
        && bad.status === 2 && /WHAT IS/.test(said(bad)) && okExit.status === 0 && none.status === 2 && /WHAT IS/.test(said(none))
        && noSteps === null && noRoots === null;
    },
  },
  {
    name: 'a plan that names a repository accounts for its roadmap: every open item of the "## Next capability release" section of its NOTES.md (not a done item, a sub-bullet or an item outside the section) has a bullet in the plan\'s "## Roadmap" opening with its decision number or title, then in or out as a word, then a reason of ten characters or more; the items with no such bullet are listed, and a repository with no roadmap is not asked',
    guards: ['roadmap_plan_guard_wired', 'roadmap_items_open', 'roadmap_decision_key', 'roadmap_in_out', 'roadmap_reason', 'roadmap_prefix'],
    run(m, dir) {
      const NOTES_R = ['# Notes', '', 'The export control lives in the toolbar builder.', '', '## Next capability release', '- [ ] **Alpha feature moves the button** <!-- decision: 012 -->', '  - [ ] a sub bullet that is not an item',
        '- [ ] **Beta feature** <!-- decision: 013 -->', '- [x] **Done feature** <!-- decision: 014 -->', '- [ ] **Gamma without a number**', '',
        '## Something else', '- [ ] **Not in the roadmap section** <!-- decision: 099 -->', ''].join('\n');
      const R = repo({ 'NOTES.md': NOTES_R, 'a.txt': 'x\n' }, 'road-repo');
      const quiet = repo({ 'NOTES.md': '# Notes\n\nNo roadmap here.\n', 'a.txt': 'x\n' }, 'plain-repo');
      const what = '- "The export control" (NOTES.md).';
      const files = '- road-repo: `a.txt`';
      const rd = (roadmap) => m.dispatch.roadmapProblem(sendingPlan(dir, { files, what, roadmap }), { dir: R.dir });
      const lists = (x, ...re) => typeof x === 'string' && /^ROADMAP/.test(x) && re.every((r) => r.test(x));
      const none = rd(null);
      const itemsRead = m.dispatch.roadmapItems(R.dir).map((i) => i.key).join('|');
      const all = '- 012 in: the plan builds it this time\n- 013 out: the owner has not asked for it\n- Gamma without a number out: left for the next plan';
      const one = rd('- 012 in: the plan builds it this time');
      const weak = rd('- 012: because of reasons that are long enough\n- 013 in: yes\n- Gamma without a number maybe: a long reason text here');
      const dressed = rd('- **012** in: reason that is long enough\n- decision 013 out: reason long enough here\n- Gamma without a number in: because it is here');
      const prefix = rd('- 0123 in: a different number entirely, with a reason\n- 013 in: the plan builds it this time\n- Gamma without a number in: because it is here');
      const exits = (roadmap) => exitFor(dir, sendingPlan(dir, { files, what, roadmap }), R.dir);
      const refused = exits(null);
      // The same account with the item marked out: an item marked in is also asked for a read of the commit log (LESSONS §423), which a later case covers.
      const passed = exits(all.replace('- 012 in: the plan builds it this time', '- 012 out: the plan leaves it for a later plan'));
      const quietExit = exitFor(dir, sendingPlan(dir, { files: '- plain-repo: `a.txt`', what: '- "No roadmap here." (NOTES.md).', roadmap: null }), quiet.dir);
      const said = (r) => `${r.stdout}${r.stderr}`;
      return itemsRead === '012|013|Gamma without a number'
        && lists(none, /3 open roadmap items, and 3 have no line/, /- 012 \(road-repo\): Alpha feature/, /- 013 \(road-repo\)/, /- Gamma without a number \(road-repo\)/) && !/014|099|sub bullet/.test(none)
        && rd(all) === null && lists(one, /2 have no line/, /- 013 \(/, /- Gamma/) && !/- 012 \(/.test(one)
        && lists(weak, /3 have no line/) && dressed === null && lists(prefix, /1 has no line/, /- 012 \(/) && !/- 013 \(/.test(prefix)
        && refused.status === 2 && /ROADMAP/.test(said(refused)) && passed.status === 0 && quietExit.status === 0
        && m.dispatch.roadmapProblem(PLAN(OWN_WORDS), { roots: [R.dir] }) === null;
    },
  },
  // ---- a plan that marks a roadmap item in has read the app's commit log first (step 186, LESSONS §423) ----
  {
    name: 'a plan whose "## Roadmap" marks an open item in, for a repository whose NOTES.md keeps a roadmap, is refused at ExitPlanMode unless the session read a git log on that repository naming its production and its staging branch after the plan file was first written, and the plan\'s "## Shipped check" has a line for the item saying it is not shipped, read against those branches on a date; a line saying it shipped is refused as work already done, the refusal names the missing read or the missing line, and a plan with no steps is not judged',
    guards: ['ship_wired', 'ship_marked_in', 'ship_read_log', 'ship_read_after_plan', 'ship_read_repo', 'ship_read_both', 'ship_read_result', 'ship_branch_guard',
      'ship_line', 'ship_line_branches', 'ship_shipped_refused', 'ship_no_steps', 'ship_key_exact'],
    run(m, dir) {
      const NOTES_S = ['# Notes', '', 'The export control lives in the toolbar builder.', '', '## Next capability release',
        '- [ ] **Alpha feature moves the button** <!-- decision: 012 -->', '- [ ] **Beta feature** <!-- decision: 013 -->', '- [ ] **Gamma without a number**', '',
        '## Something else', 'Prose.', ''].join('\n');
      const R = repo({ 'NOTES.md': NOTES_S, 'a.txt': 'x\n' }, 'ship-repo');
      // A repository that ships on `prod` and stages on `beta`, as its .branch-guard says.
      const ALT = repo({ 'NOTES.md': NOTES_S, 'a.txt': 'x\n', '.branch-guard': '# where work commits\nwork=beta\npromote=prod\n' }, 'alt-ship');
      const what = '- "The export control lives in the toolbar builder" (NOTES.md).';
      const road = '- 012 in: the plan builds it this time\n- 013 out: the owner has not asked for it\n- Gamma without a number out: left for the next plan';
      const plan = (shipped, files = '- ship-repo: `a.txt`', roadmap = road) => sendingPlan(dir, { files, what, roadmap, shipped });
      const PLAN_FILE = '/plans/ship-test.md';
      const wrote = [tool(0, 'w1', 'Write', { file_path: PLAN_FILE, content: '# plan' }), result(0, 'w1', 'File created')];
      const logged = (id, root, tail, err = false) => [tool(0, id, 'Bash', { command: `git -C ${root} log ${tail}` }), result(0, id, 'Fixed: a thing\nNew: another thing', err)];
      const line = '012: not shipped, read against main and staging on 24 October 2026';
      const altLine = '012: not shipped, read against prod and beta on 24 October 2026';
      const check = (shipped, entries, o = {}) => m.dispatch.shippedCheckProblem(plan(shipped, o.files, o.roadmap), { roots: [o.root ?? R.dir], entries, planFile: PLAN_FILE });
      const says = (x, ...re) => typeof x === 'string' && /^SHIPPED CHECK/.test(x) && re.every((r) => r.test(x));
      const read = [...wrote, ...logged('g1', R.dir, '--format=%s -n 300 origin/main origin/staging')];
      // The read: it has to be a git log on the repository, after the plan file's first write, naming both branches, and not an error.
      const good = check(line, read);
      const noRead = check(line, wrote);
      const readBefore = check(line, [...logged('g2', R.dir, '--format=%s origin/main origin/staging'), ...wrote]);
      const otherRepo = check(line, [...wrote, ...logged('g3', ALT.dir, '--format=%s origin/main origin/staging')]);
      const onlyMain = check(line, [...wrote, ...logged('g4', R.dir, '--format=%s origin/main')]);
      const onlyStaging = check(line, [...wrote, ...logged('g5', R.dir, '--oneline staging')]);
      const failed = check(line, [...wrote, ...logged('g6', R.dir, '--format=%s origin/main origin/staging', true)]);
      const ranges = ['origin/main..origin/staging', 'main...staging', 'refs/remotes/origin/main refs/remotes/origin/staging'].map((t, k) => check(line, [...wrote, ...logged(`r${k}`, R.dir, `--format=%s ${t}`)]));
      const notALog = check(line, [...wrote, tool(0, 'g7', 'Bash', { command: `git -C ${R.dir} show origin/main origin/staging` }), result(0, 'g7', 'x')]);
      // No plan file known to the check: any such read in the transcript counts.
      const noPlanFile = m.dispatch.shippedCheckProblem(plan(line), { roots: [R.dir], entries: logged('g8', R.dir, 'origin/main origin/staging'), planFile: '' });
      // The branches are the repository's own, read from its .branch-guard.
      const altOk = check(altLine, [...wrote, ...logged('a1', ALT.dir, '--format=%s origin/prod origin/beta')], { files: '- alt-ship: `a.txt`', root: ALT.dir });
      const altWrongRead = check(altLine, [...wrote, ...logged('a2', ALT.dir, '--format=%s origin/main origin/staging')], { files: '- alt-ship: `a.txt`', root: ALT.dir });
      const altWrongLine = check(line, [...wrote, ...logged('a3', ALT.dir, '--format=%s origin/prod origin/beta')], { files: '- alt-ship: `a.txt`', root: ALT.dir });
      // The line: one for each item marked in, saying not shipped with the branches read and a date; a line saying shipped is work already done.
      const dressed = check('- **012**: not shipped, read against main and staging on 24 October 2026', read);
      const noLine = check(null, read);
      const noDate = check('012: not shipped, read against main and staging on', read);
      const wrongNames = check('012: not shipped, read against master and develop on 24 October 2026', read);
      const shipped = check('012: shipped on main by "Fixed: a look can be taken off"', read);
      const shippedOnStaging = check('012: shipped on staging by "New: a None button takes a look off"', read);
      const otherKey = check('013: not shipped, read against main and staging on 24 October 2026', read);
      const longerKey = check('0123: not shipped, read against main and staging on 24 October 2026', read);
      const noColon = check('012 not shipped, read against main and staging on 24 October 2026', read);
      const titled = check('Gamma without a number: not shipped, read against main and staging on 24 October 2026', read,
        { roadmap: '- 012 out: the owner has not asked for it\n- 013 out: the owner has not asked for it\n- Gamma without a number in: the plan builds it this time' });
      const twoIn = check(line, read, { roadmap: '- 012 in: the plan builds it this time\n- 013 in: the plan builds this one too\n- Gamma without a number out: left for the next plan' });
      // A plan with no Steps sends no agent and is not judged, though it marks an item in and no log was read.
      const noSteps = m.dispatch.shippedCheckProblem(plan(line).replace('## Steps', '## Notes'), { roots: [R.dir], entries: [] });
      // Through the plan guard at ExitPlanMode: the same plan, with the transcript shaped as the guard reads it.
      const exit = (shipped, extra, o = {}) => exitFor(dir, plan(shipped, o.files, o.roadmap), o.root ?? R.dir, extra);
      const planWrite = (file) => [at(tool(0, 'pw', 'Write', { file_path: file, content: '# plan' }), later(-800)), at(result(0, 'pw', 'File created'), later(-799))];
      const planLog = (id, root, tail) => [at(tool(0, id, 'Bash', { command: `git -C ${root} log ${tail}` }), later(-700)), at(result(0, id, 'Fixed: a thing'), later(-699))];
      const said = (r) => `${r.stdout}${r.stderr}`;
      const exitGood = exit(line, (f) => [...planWrite(f), ...planLog('xl', R.dir, '--format=%s origin/main origin/staging')]);
      const exitNoRead = exit(line, (f) => planWrite(f));
      const exitNoLine = exit(null, (f) => [...planWrite(f), ...planLog('xl', R.dir, '--format=%s origin/main origin/staging')]);
      const exitShipped = exit('012: shipped on main by "Fixed: a look can be taken off"', (f) => [...planWrite(f), ...planLog('xl', R.dir, '--format=%s origin/main origin/staging')]);
      return good === null && says(noRead, /no result of a git log on ship-repo/, /naming main and staging/, /012/) && !/has no line/.test(noRead)
        && says(readBefore, /no result of a git log on ship-repo/) && says(otherRepo, /no result of a git log on ship-repo/)
        && says(onlyMain, /naming main and staging/) && says(onlyStaging, /naming main and staging/) && says(failed, /no result of a git log on ship-repo/)
        && ranges.every((x) => x === null) && says(notALog, /no result of a git log/) && noPlanFile === null
        && altOk === null && says(altWrongRead, /naming prod and beta/) && says(altWrongLine, /reads against main and staging/, /ships on prod and stages on beta/)
        && dressed === null && says(noLine, /has no line for 012/, /not shipped, read against main and staging on/) && !/no result of a git log/.test(noLine)
        && says(noDate, /has no line for 012/) && says(wrongNames, /reads against master and develop/, /ships on main and stages on staging/)
        && says(shipped, /012/, /shipped on main by "Fixed: a look can be taken off"/, /work already done/) && says(shippedOnStaging, /work already done/)
        && says(otherKey, /has no line for 012/) && says(longerKey, /has no line for 012/) && says(noColon, /has no line for 012/)
        && titled === null && says(twoIn, /has no line for 013/) && !/has no line for 012/.test(twoIn)
        && noSteps === null
        && exitGood.status === 0 && exitNoRead.status === 2 && /SHIPPED CHECK/.test(said(exitNoRead)) && /no result of a git log/.test(said(exitNoRead))
        && exitNoLine.status === 2 && /SHIPPED CHECK/.test(said(exitNoLine)) && /has no line for 012/.test(said(exitNoLine))
        && exitShipped.status === 2 && /work already done/.test(said(exitShipped));
    },
  },
  {
    name: 'the roadmap check is unchanged by the shipped check: a plan with an open item that has no Roadmap line is refused for the roadmap, naming the item, whatever the log shows; a plan whose items are all marked out, a plan with every item marked in that has its read and its lines, and a repository that keeps no roadmap are not refused',
    guards: ['ship_after_roadmap', 'ship_out_not_asked'],
    run(m, dir) {
      const NOTES_S = ['# Notes', '', 'The export control lives in the toolbar builder.', '', '## Next capability release',
        '- [ ] **Alpha feature moves the button** <!-- decision: 012 -->', '- [ ] **Beta feature** <!-- decision: 013 -->', '', '## Something else', 'Prose.', ''].join('\n');
      const R = repo({ 'NOTES.md': NOTES_S, 'a.txt': 'x\n' }, 'ship-two');
      const quiet = repo({ 'NOTES.md': '# Notes\n\nNo roadmap here.\n', 'a.txt': 'x\n' }, 'plain-ship');
      const what = '- "The export control lives in the toolbar builder" (NOTES.md).';
      const line = '012: not shipped, read against main and staging on 24 October 2026';
      const planWrite = (file) => [at(tool(0, 'pw', 'Write', { file_path: file, content: '# plan' }), later(-800)), at(result(0, 'pw', 'File created'), later(-799))];
      const planLog = (id, root, tail) => [at(tool(0, id, 'Bash', { command: `git -C ${root} log ${tail}` }), later(-700)), at(result(0, id, 'Fixed: a thing'), later(-699))];
      const withRead = (f) => [...planWrite(f), ...planLog('xl', R.dir, '--format=%s origin/main origin/staging')];
      const said = (r) => `${r.stdout}${r.stderr}`;
      // The old refusal first: 013 has no line in the Roadmap, and 012 is marked in with no log read, which the shipped check would also refuse.
      const missing = exitFor(dir, sendingPlan(dir, { files: '- ship-two: `a.txt`', what, roadmap: '- 012 in: the plan builds it this time', shipped: line }), R.dir, []);
      // Every item out: no read is asked, and none was made.
      const allOut = exitFor(dir, sendingPlan(dir, { files: '- ship-two: `a.txt`', what, roadmap: '- 012 out: the owner has not asked for it\n- 013 out: the owner has not asked for it' }), R.dir, []);
      // Both marked in, with the read and a line each, passes.
      const bothIn = exitFor(dir, sendingPlan(dir, { files: '- ship-two: `a.txt`', what, roadmap: '- 012 in: the plan builds it this time\n- 013 in: the plan builds this one too', shipped: `${line}\n013: not shipped, read against main and staging on 24 October 2026` }), R.dir, withRead);
      const quietExit = exitFor(dir, sendingPlan(dir, { files: '- plain-ship: `a.txt`', what: '- "No roadmap here." (NOTES.md).', roadmap: null }), quiet.dir, []);
      return missing.status === 2 && /ROADMAP/.test(said(missing)) && /- 013 \(ship-two\)/.test(said(missing)) && !/SHIPPED CHECK/.test(said(missing))
        && allOut.status === 0 && bothIn.status === 0 && quietExit.status === 0;
    },
  },
  {
    name: 'a "## Found answered" line may answer a range of queued findings in one line, Q-TAG-1 to Q-TAG-5 still queued with a reason: only "still queued", only the ten-character reason, the lower key first, both ends of one repository\'s tag, and every key between them counting with the ends; a fixed, carried or dropped finding is answered by its own line',
    guards: ['range_ends', 'range_still_queued', 'range_tag', 'range_reason'],
    run(m, dir) {
      const NOTES_Q = ['# Notes', '', '## Found queue', ...[1, 2, 3, 4, 5].map((n) => `Q-RG-${n}: finding number ${n} with some words in it.`), ''].join('\n');
      const A = repo({ 'NOTES.md': NOTES_Q, 'a.txt': 'x\n' }, 'range-repo');
      const files = '- range-repo: `a.txt`';
      const ans = (answered) => m.dispatch.foundAnsweredProblem(sendingPlan(dir, { files, answered }), { roots: [A.dir] });
      const keysOf = (x) => (typeof x === 'string' ? [...x.matchAll(/Q-RG-(\d)/g)].map((k) => k[1]).join('') : null);
      const reason = 'nothing in this plan touches them';
      const whole = ans(`Q-RG-1 to Q-RG-5 still queued: ${reason}`);
      const mixed = ans(`Q-RG-1 through Q-RG-3 still queued: ${reason}\nQ-RG-4: fixed in step 1.\nQ-RG-5: dropped, no longer applies here.`);
      const dash = ans(`Q-RG-1 - Q-RG-4 still queued: ${reason}`);
      const fixed = ans('Q-RG-1 to Q-RG-5 fixed in step 1');
      const short = ans('Q-RG-1 to Q-RG-5 still queued: no');
      const reversed = ans(`Q-RG-5 to Q-RG-1 still queued: ${reason}`);
      const otherTag = ans(`Q-ZZ-1 to Q-ZZ-9 still queued: ${reason}`);
      const mixedTags = ans(`Q-RG-1 to Q-ZZ-9 still queued: ${reason}`);
      const singles = ans([1, 2, 3, 4, 5].map((n) => `Q-RG-${n}: still queued, the plan leaves it alone.`).join('\n'));
      const exitPlan = exitFor(dir, sendingPlan(dir, { files, answered: `Q-RG-1 to Q-RG-5 still queued: ${reason}`, what: '- "finding number 1 with some words" (NOTES.md).' }), A.dir);
      return whole === null && mixed === null && singles === null && keysOf(dash) === '5' && keysOf(fixed) === '12345' && keysOf(short) === '12345'
        && keysOf(reversed) === '12345' && keysOf(otherTag) === '12345' && keysOf(mixedTags) === '12345' && exitPlan.status === 0;
    },
  },

  // ---- the steps file beside an approved plan (step 119) ----
  {
    name: 'the steps file: approving a plan, the owner\'s exit from plan mode in the app and an amendment each write <plan>.steps.md beside the plan, holding only its Rules, Steps and Commands sections (every section whose heading opens with one of the three) and nothing else; the dispatch gate accepts a prompt naming it in the plan\'s place and refuses it when it is missing or is not the plan in force, and the plan guard never takes it for the newest plan',
    guards: ['steps_text_sections', 'steps_mark', 'steps_amend', 'steps_app_exit', 'steps_sent_names', 'steps_problem_wired', 'steps_stale', 'steps_missing', 'steps_not_plan'],
    run(m, dir) {
      const text = scopedPlan(dir).replace('## Steps', '## Rules\nRules: the pointer line of the rules file.\n\n## Rules of this plan\n- One rule of the plan\'s own, kept whole.\n\n## Steps');
      const stepsOf = (plan) => m.report.stepsFilePath(plan);
      const readOr = (f) => { try { return readFileSync(f, 'utf8'); } catch { return null; } };
      const pathOk = stepsOf('/home/x/.claude/plans/a-b-c.md') === '/home/x/.claude/plans/a-b-c.steps.md';
      const body = m.report.stepsFileText(text, '/plans/x.md');
      const sections = ['## Rules', '## Rules of this plan', '## Steps', '## Commands'].every((h) => body.includes(h))
        && body.includes('One rule of the plan\'s own, kept whole.') && body.includes('1. **Build.** Make the thing.') && body.includes('- git status')
        && !body.includes('The thing is built and read.') && !body.includes('keep.mjs') && !body.includes(OWN_WORDS) && !body.includes('## Goals') && !body.includes('## Files')
        && body.startsWith('<!-- Derived from /plans/x.md') && body === m.report.stepsFileText(text, '/plans/x.md')
        && m.report.stepsFileText('# Nothing\n\n## Goals\n1. x\n', '/p.md').trim() === '<!-- Derived from /p.md: only its Rules, Steps and Commands. Rewritten at every approval and amendment; do not edit. -->';
      // Approval through the tool, then an amendment.
      const A = appHome(dir);
      writeFileSync(A.plan, text);
      const trA = transcript([turn(0, 'start')]);
      A.guard(trA, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: text, isAgent: false, filePath: A.plan } }, '--mark');
      const marked = readOr(stepsOf(A.plan));
      const STEP = { old_string: '1. **Build.** Make the thing.', new_string: '1. **Build.** Make the thing, and say what it did.' };
      const amendedText = text.replace(STEP.old_string, STEP.new_string);
      writeFileSync(A.plan, amendedText);
      A.guard(trA, { tool_name: 'Edit', tool_input: { file_path: A.plan, ...STEP }, hook_event_name: 'PostToolUse' }, '--amend');
      const amended = readOr(stepsOf(A.plan));
      // The owner's exit from plan mode in the app.
      const F = appHome(dir);
      const uf = uid();
      const trF = transcript([turn(0, 'start'), ...enterPlan(-60), ...exitPlan(-20, false), exitEntry(-19, F.plan, uf)]);
      F.guard(trF, { tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      const appFile = readOr(stepsOf(F.plan));
      // Through hook-dispatch: the prompt naming the steps file goes while the file is the plan's, and not otherwise.
      const w = world(dir, [], ORDER_PLAN);
      const file = stepsOf(w.plan);
      const go = (prompt) => { const s = sid('sf'); return { s, r: w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt, subagent_type: 'general-purpose' } }) }; };
      const missing = go(`${file} step 1`);
      writeFileSync(file, m.report.stepsFileText(ORDER_PLAN, w.plan));
      const named = go(`${file} step 1`);
      const planNamed = go(`${w.plan} step 1`);
      writeFileSync(file, `${m.report.stepsFileText(ORDER_PLAN, w.plan)}\nAnd one more line that the plan does not have.\n`);
      const stale = go(`${file} step 1`);
      writeFileSync(file, m.report.stepsFileText(ORDER_PLAN, w.plan));
      const otherPath = go(`${join(w.home, 'elsewhere.steps.md')} step 1`);
      const badStep = go(`${file} step 9`);
      // The plan guard picks the newest plan file and never the steps file beside it, even when the steps file is the newer.
      const home = tmp('sg-home-');
      mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
      const sending = sendingPlan(dir);
      const planFile = join(home, '.claude', 'plans', 'sending-test.md');
      writeFileSync(planFile, sending);
      const t0 = (Date.now() - 2000 * 1000) / 1000;
      utimesSync(planFile, t0, t0);
      writeFileSync(join(home, '.claude', 'plans', 'sending-test.steps.md'), m.report.stepsFileText(sending, planFile));
      const t1 = (Date.now() - 1500 * 1000) / 1000;
      utimesSync(join(home, '.claude', 'plans', 'sending-test.steps.md'), t1, t1);
      const picked = spawnSync('node', [join(dir, 'plan-guard.mjs')], {
        input: JSON.stringify({ session_id: sid('pq'), permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: {},
          transcript_path: transcript([turn(0, OWNER), ...enterPlan(-3000), at(reply(0, PLAN_TALK), later(-1000)), owner(later(-900), 'ok')]), cwd: '/' }),
        encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: tmp('sg-cwd-') },
      });
      return pathOk && sections && marked === m.report.stepsFileText(text, A.plan) && amended === m.report.stepsFileText(amendedText, A.plan) && amended.includes('say what it did')
        && appFile === m.report.stepsFileText(STEPS_PLAN, F.plan)
        && missing.r.status === 2 && /DISPATCH GATE/.test(missing.r.stderr) && /cannot be read/.test(missing.r.stderr)
        && named.r.status === 0 && planNamed.r.status === 0
        && stale.r.status === 2 && /not the Rules, Steps and Commands of the plan in force/.test(stale.r.stderr)
        && otherPath.r.status === 2 && /Send exactly/.test(otherPath.r.stderr) && badStep.r.status === 2 && /no step 9/.test(badStep.r.stderr)
        && picked.status === 0;
    },
  },

  // ---- agents a Workflow starts keep their transcripts one level below the subagents folder (step 119) ----
  {
    name: 'an agent a Workflow starts keeps its transcript below subagents/workflows/<run>/, and every reader finds it there: the file list (first of an id kept, a scripts folder skipped, the folder beside the subagents folder read too), the agent\'s own transcript by its payload (a bad id refused), a Workflow agent running or ended in the status reads, the plan fence judging its Read of the rules, and its latch letting it write its own report for the step its prompt names',
    guards: ['agent_files_workflows', 'agent_files_beside', 'agent_files_scripts', 'agent_files_dedupe', 'agent_path_lookup', 'agent_meta_folder', 'agent_report_workflow', 'agent_fence_transcript'],
    run(m, dir) {
      const tr = transcript([turn(0, 'start')]);
      const base = tr.slice(0, -'.jsonl'.length);
      const subs = join(base, 'subagents');
      const run1 = join(subs, 'workflows', 'wf_one');
      const beside = join(base, 'workflows', 'wf_two');
      const scripts = join(subs, 'workflows', 'scripts');
      for (const d of [subs, run1, beside, scripts]) mkdirSync(d, { recursive: true });
      const plan = '/plans/gate-test.md';
      const sentTo = (n) => at({ type: 'user', message: { role: 'user', content: `${plan} step ${n}` } }, later(-300));
      const put = (folder, id, entries, meta) => { writeFileSync(join(folder, `agent-${id}.jsonl`), jsonl(entries)); if (meta) writeFileSync(join(folder, `agent-${id}.meta.json`), JSON.stringify(meta)); };
      const handed = (id) => [at(tool(0, `${id}-h`, 'SubagentHandback', { message: 'DONE\nThe second line.' }), later(-100)), at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(-99))];
      put(subs, 'top', [sentTo(1), ...handed('top')], { description: 'top level' });
      put(run1, 'wfa', [sentTo(2), ...rulesReadEntries(dir, 'wfa').slice(1)], { description: 'workflow ended' });
      put(run1, 'wfb', [sentTo(3), at(tool(0, 'wfb-b', 'Bash', { command: 'git status' }), later(-50))], { description: 'workflow running' });
      put(beside, 'wfc', [sentTo(4), ...handed('wfc')], { description: 'beside' });
      put(scripts, 'bad', [sentTo(5)], null);
      put(run1, 'top', [sentTo(6)], null);
      const found = m.report.agentFiles(subs);
      const ids = found.map((a) => a.id).join(',');
      const topFile = found.find((a) => a.id === 'top')?.file;
      const meta = (id) => m.report.agentMeta(found.find((a) => a.id === id) ?? { id, folder: subs });
      const via = (agent_id, extra = {}) => m.report.agentTranscriptPath({ agent_id, transcript_path: tr, session_id: 'nothing-on-disk', ...extra });
      const lookups = via('wfa') === join(run1, 'agent-wfa.jsonl') && via('wfc') === join(beside, 'agent-wfc.jsonl') && via('top') === join(subs, 'agent-top.jsonl')
        && via('bad') === null && via('../x') === null && via('') === null && m.report.agentTranscriptPath({ transcript_path: tr }) === null;
      const running = m.report.runningAgents('nothing-on-disk', { main: tr, agents: subs }) ?? [];
      const runningIds = running.map((a) => `${a.id}:${a.step}`).sort().join(',');
      const ends = m.report.stepEnds({ transcript_path: tr, session_id: 'nothing-on-disk' });
      const endedIds = (ends?.ends ?? []).map((e) => `${e.id}:${e.step}`).sort().join(',');
      // The plan fence: the workflow agent that read the rules passes; the one that did not is refused for it, not for having no transcript.
      const fenceP = { session_id: 'nothing-on-disk', transcript_path: tr, cwd: '/', tool_name: 'Bash', tool_input: { command: 'git status' } };
      const planInForce = { path: plan, text: STEPS_PLAN };
      const decide = (agent_id) => m.fence.decide({ ...fenceP, agent_id }, { plan: planInForce });
      const readOk = decide('wfa') === null;
      const noRead = /RULES FIRST/.test(decide('wfb') ?? '') && /holds no Read of that file/.test(decide('wfb') ?? '');
      // The latch lets a Workflow agent write its own report: step 2 is its own, step 3 is another's.
      const pad = `/tmp/claude-0/-home-user/${sid('aw')}/scratchpad`;
      const reportP = (agent_id, n) => ({ session_id: pad.split('/')[4], transcript_path: tr, agent_id, tool_name: 'Write', tool_input: { file_path: `${pad}/progress/step-${n}-report.txt`, content: 'x' } });
      const own = m.dispatch.agentReportWrite(reportP('wfa', 2)) === true;
      const other = m.dispatch.agentReportWrite(reportP('wfa', 3)) === false;
      return ids === 'top,wfa,wfb,wfc' && topFile === join(subs, 'agent-top.jsonl') && meta('wfa').description === 'workflow ended' && meta('wfc').description === 'beside'
        && lookups && runningIds === 'wfb:3' && /(?:^|,)wfa:2(?:,|$)/.test(endedIds) && /(?:^|,)wfc:4(?:,|$)/.test(endedIds) && /(?:^|,)top:1(?:,|$)/.test(endedIds)
        && readOk && noRead && own && other;
    },
  },
  {
    name: 'an agent may read the approved plan, or the steps file beside it, before the rules, because the plan is what names them, and nothing else: another file, a write and a command stay refused with the rules named, the rules read stays required for every other call, and with no plan in force the plan\'s path is not special',
    guards: ['rules_first_plan_read', 'rules_first_plan_steps', 'rules_first_plan_only', 'rules_first_plan_passed', 'rules_first_skip_latch'],
    run(m, dir) {
      const s = sid('rp');
      const tr = transcript([turn(0, 'start')]);
      const subs = join(tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(subs, { recursive: true });
      writeFileSync(join(subs, 'agent-a1.jsonl'), jsonl([at({ type: 'user', message: { role: 'user', content: 'Go to step 2.' } }, later(-300))]));
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const decide = (extra = {}, p = plan) => m.fence.decide({ session_id: s, agent_id: 'a1', transcript_path: tr, cwd: '/', tool_name: 'Bash', tool_input: { command: 'git status' }, ...extra }, { plan: p });
      const refused = (x) => /^PLAN FENCE/.test(x ?? '') && /RULES FIRST/.test(x);
      const read = (file_path) => ({ tool_name: 'Read', tool_input: { file_path } });
      const planRead = decide(read('/plans/gate-test.md')) === null;
      const stepsRead = decide(read('/plans/gate-test.steps.md')) === null;
      const otherPlan = refused(decide(read('/plans/other.md'))) && refused(decide(read('/plans/gate-test.steps.md.bak'))) && refused(decide(read(join(dir, 'CLAUDE.md'))));
      const notReads = refused(decide({ tool_name: 'Write', tool_input: { file_path: '/plans/gate-test.md', content: 'x' } })) && refused(decide()) && refused(decide({ tool_name: 'Grep', tool_input: { pattern: 'x', path: '/plans/gate-test.md' } }));
      const noPlan = refused(decide(read('/plans/gate-test.md'), null));
      // Through hook-dispatch the agent that read the plan first is not latched, and the next command is refused and latches.
      const w = world(dir);
      const sw = sid('rp');
      const sub2 = join(w.tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(sub2, { recursive: true });
      writeFileSync(join(sub2, 'agent-ax.jsonl'), jsonl([at({ type: 'user', message: { role: 'user', content: `${w.plan} step 2` } }, later(-300))]));
      const call = (tool_name, tool_input) => w.call('PreToolUse', { session_id: sw, agent_id: 'ax', tool_name, tool_input });
      const first = call('Read', { file_path: w.plan });
      const stillFree = !latched(sw);
      const second = call('Bash', { command: 'git status' });
      const secondNoLatch = !latched(sw) && /RULES FIRST, NO LATCH/.test(second.stderr);
      // The refused call is recorded in the agent's transcript as an error result, as the harness records it.
      writeFileSync(join(sub2, 'agent-ax.jsonl'), jsonl([at({ type: 'user', message: { role: 'user', content: `${w.plan} step 2` } }, later(-300)), at(tool(0, 'ax-2', 'Bash', { command: 'git status' }), later(-260)), at(result(0, 'ax-2', second.stderr, true), later(-259))]));
      // The second refusal latches: the next command is refused, and so is the plan's Read.
      const third = call('Bash', { command: 'git log' });
      const fourth = call('Read', { file_path: w.plan });
      return planRead && stepsRead && otherPlan && notReads && noPlan
        && first.status === 0 && stillFree && second.status === 2 && secondNoLatch && third.status === 2 && /RULES FIRST:/.test(third.stderr) && !/NO LATCH/.test(third.stderr)
        && fourth.status === 2 && /REFUSAL LATCH/.test(fourth.stderr);
    },
  },

  // ---- the plants run narrowed, and the suite leaves the live session alone (step 119) ----
  {
    name: 'the plants run narrowed to the guard files a commit touches: --files= lists only the plants of those files, --touched only the plants of the files git shows changed in the checkout, --dry runs none, and --touched outside a git checkout refuses rather than read "nothing touched"',
    guards: ['plants_files_flag', 'plants_touched_flag', 'plants_dry'],
    run(m, dir) {
      const copy = repo({}, 'plants-copy');
      for (const f of FILES) copyFileSync(join(dir, f), join(copy.dir, f));
      copy.g('add', '-A'); copy.g('commit', '-q', '-m', 'guards');
      const src = readFileSync(join(dir, 'session-guards.test.mjs'), 'utf8');
      // The needle is built, so that this case's own text does not hold it and the first match is the real map.
      const needle = '\nconst PLANTS' + ' = {\n';
      const begin = src.indexOf(needle) + needle.length - 2;
      const block = src.slice(begin, src.indexOf('\n};\n', begin) + 2);
      const plants = new Function(`return (${block})`)();
      const countOf = (...names) => Object.values(plants).filter(([, , f]) => names.includes(f)).length;
      const total = Object.keys(plants).length;
      const run = (where, ...args) => spawnSync('node', [join(where, 'session-guards.test.mjs'), '--plants', '--dry', ...args], { encoding: 'utf8', timeout: 60000 });
      const said = (r) => /^PLANTS TO RUN: (\d+) of (\d+): (.*)$/m.exec(r.stdout) ?? [];
      const one = said(run(copy.dir, '--files=stop-guard.mjs'));
      const two = said(run(copy.dir, '--files=stop-guard.mjs,plan-fence.mjs'));
      const nothing = said(run(copy.dir, '--files=no-such-file.mjs'));
      const all = said(run(copy.dir));
      appendFileSync(join(copy.dir, 'plan-fence.mjs'), '\n// touched\n');
      const touched = said(run(copy.dir, '--touched'));
      const plain = tmp('sg-plain-');
      for (const f of FILES) copyFileSync(join(dir, f), join(plain, f));
      const outside = run(plain, '--touched');
      return Number(one[1]) === countOf('stop-guard.mjs') && Number(one[1]) > 0 && Number(one[2]) === total && one[3].split(', ').every((k) => plants[k]?.[2] === 'stop-guard.mjs')
        && Number(two[1]) === countOf('stop-guard.mjs', 'plan-fence.mjs') && Number(nothing[1]) === 0 && Number(all[1]) === total
        && Number(touched[1]) === countOf('plan-fence.mjs') && touched[3].split(', ').every((k) => plants[k]?.[2] === 'plan-fence.mjs')
        && outside.status === 1 && /needs a git checkout of the guards/.test(outside.stdout);
    },
  },
  {
    name: 'the suite runs under a planted session of its own: the inherited session id is replaced before any case runs, and the planted page and manager notes are compared byte for byte after every case; the comparison finds a rewritten page, a removed note and a real page write for the planted session, and is quiet when nothing touched them',
    run(m, dir) {
      const pad = join(tmp('sg-decoy-'), 'pad');
      plantDecoy(pad);
      const pristine = decoyChanged(pad) === '';
      writeFileSync(join(pad, 'status', 'fix-run.html'), '<html>rewritten</html>\n');
      const rewritten = /fix-run\.html was rewritten/.test(decoyChanged(pad));
      rmSync(join(pad, 'status', 'manager.txt'));
      const gone = /manager\.txt is gone/.test(decoyChanged(pad));
      const planted = process.env.CLAUDE_CODE_SESSION_ID === DECOY && DECOY.startsWith('sg-live-') && process.env.TMPDIR.startsWith(STATE);
      // A real write: the status page for the planted session, made by report.mjs itself, changes the planted page; the comparison finds it, and the pad is put back.
      const quiet = decoyChanged() === '';
      const home = join(STATE, 'home');
      mkdirSync(join(home, '.claude', 'projects', '-home-user', DECOY, 'subagents'), { recursive: true });
      writeFileSync(join(home, '.claude', 'projects', '-home-user', `${DECOY}.jsonl`), JSON.stringify(turn(0, 'start')) + '\n');
      const w = spawnSync('node', [join(dir, 'report.mjs'), '--page'], { input: '', encoding: 'utf8', env: { ...process.env, HOME: home } });
      const real = /fix-run\.html was rewritten/.test(decoyChanged());
      plantDecoy();
      return pristine && rewritten && gone && planted && quiet && w.status === 0 && real && decoyChanged() === '';
    },
  },

  // ---- a main-thread miss stops nothing, the fence reads the whole transcript, and the page can be published again (step 138) ----
  {
    name: 'a main-thread call the manager fence refuses only because it is not of the record (a read outside it, a write, a SendUserFile, an Artifact call, a Bash line, a connector read) sets no latch, and its refusal names what the main thread may use and the check command; the dispatch gate\'s refusal still latches, and the next call after a miss is judged on its own',
    guards: ['fence_no_latch', 'manager_wired', 'fence_dispatch_latches', 'fence_record_marker', 'fence_record_may_use', 'fence_record_check_cmd'],
    run(m, dir) {
      const w = world(dir);
      const call = (s, tool_name, tool_input) => w.call('PreToolUse', { session_id: s, tool_name, tool_input });
      const src = repo({ 'app.ts': 'export const x = 1;\n' }, 'appmiss');
      const misses = [
        ['Read', { file_path: join(src.dir, 'app.ts') }],
        ['Grep', { pattern: 'x', path: src.dir }],
        ['Bash', { command: 'git status' }],
        ['Write', { file_path: join(w.cwd, 'x.txt'), content: 'x' }],
        ['Artifact', { action: 'quickstart', intent: 'other' }],
        ['SendUserFile', { file_paths: ['/etc/hostname'] }],
        ['mcp__github__get_file_contents', { owner: 'o', repo: 'r', path: 'src/x.ts' }],
      ].map(([t, i]) => { const s = sid('nl'); return { t, s, r: call(s, t, i) }; });
      const unlatched = misses.every(({ r, s }) => r.status === 2 && /^MANAGER FENCE/.test(r.stderr) && !latched(s));
      const marked = misses.every(({ r }) => /MANAGER FENCE, NO LATCH:/.test(r.stderr) && /this refusal sets no latch/.test(r.stderr));
      const mayUse = misses.every(({ r }) => /The main thread may use: a read of the record/.test(r.stderr) && /SendUserFile of files in the session scratchpad/.test(r.stderr));
      const checkCmd = misses.every(({ r }) => r.stderr.includes(`node ${join(dir, 'hook-dispatch.mjs')} --can <tool> "<path or command line>"`));
      // The next call after a miss is judged on its own: a read of the plan passes, where a latch would have refused it.
      const s = sid('nl');
      call(s, 'Read', { file_path: join(src.dir, 'app.ts') });
      const next = call(s, 'Read', { file_path: w.plan });
      // The dispatch gate's refusal comes back through the fence without the mark, and latches as before.
      const sd = sid('nl');
      const dispatch = call(sd, 'Agent', { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' });
      const dispatchLatches = dispatch.status === 2 && /DISPATCH GATE/.test(dispatch.stderr) && !/NO LATCH/.test(dispatch.stderr) && latched(sd);
      // A refusal by another guard after the fence has passed latches as before: a repo's own hook.
      const r = join(w.cwd, 'repo');
      mkdirSync(join(r, '.claude'), { recursive: true });
      spawnSync('git', ['init', '-q', r]);
      writeFileSync(join(r, '.claude', 'settings.json'), JSON.stringify({ hooks: { PreToolUse: [{ matcher: '.*', hooks: [{ type: 'command', command: 'echo "repo gate says no" >&2; exit 2' }] }] } }));
      const sr = sid('nl');
      const repoRefused = call(sr, 'Read', { file_path: w.plan });
      const repoLatches = repoRefused.status === 2 && /repo gate says no/.test(repoRefused.stderr) && latched(sr);
      return unlatched && marked && mayUse && checkCmd && next.status === 0 && dispatchLatches && repoLatches;
    },
  },
  {
    name: 'hook-dispatch.mjs --can <tool> <path or command line> prints whether the manager fence and the latch would pass the call on the main thread now, and why, and changes nothing; the main thread\'s gates pass it as they pass the status command, a latch included, and refuse it with anything chained to it or when an agent makes it',
    guards: ['can_cli', 'can_fence', 'can_latch_read', 'can_latch', 'can_readonly', 'can_chained', 'can_agent', 'fence_can_pass'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('cn');
      const src = repo({ 'app.ts': 'x\n' }, 'appcan');
      const hookFile = join(dir, 'hook-dispatch.mjs');
      const can = (tool, arg, env = {}) => spawnSync('node', [hookFile, '--can', tool, arg], { encoding: 'utf8', cwd: w.cwd, env: { ...process.env, HOME: w.home, CLAUDE_CODE_SESSION_ID: s, ...env } });
      const line = (tool, arg) => `node "${hookFile}" --can ${tool} "${arg}"`;
      const hook = (session, command, extra = {}) => w.call('PreToolUse', { session_id: session, tool_name: 'Bash', tool_input: { command }, ...extra });
      // What it says with no latch: a read of the plan would pass, a read of a source file would be refused and the refusal sets no latch.
      const okPlan = can('Read', w.plan);
      const missSrc = can('Read', join(src.dir, 'app.ts'));
      const noLatch = okPlan.status === 0 && /MANAGER FENCE: would pass/.test(okPlan.stdout) && /LATCH: none stands/.test(okPlan.stdout) && /RESULT: the manager fence and the latch would pass this call/.test(okPlan.stdout);
      const refusal = missSrc.status === 0 && /MANAGER FENCE: would refuse/.test(missSrc.stdout) && /app\.ts is not of the record/.test(missSrc.stdout)
        && /RESULT: this call would be refused by the manager fence, whose refusal sets no latch/.test(missSrc.stdout) && /NOT JUDGED HERE/.test(missSrc.stdout);
      const bashMiss = /MANAGER FENCE: would refuse/.test(can('Bash', 'git status').stdout);
      const sendOk = /MANAGER FENCE: would pass/.test(can('Agent', `${w.plan} step 1`).stdout);
      const sendBad = can('Agent', `${w.plan} step 1, and tidy up after`).stdout;
      const dispatchWords = /MANAGER FENCE: would refuse/.test(sendBad) && /whose refusal latches the main thread until the owner writes again/.test(sendBad);
      const unknown = /LATCH: not read, because this shell holds no CLAUDE_CODE_SESSION_ID/.test(can('Read', w.plan, { CLAUDE_CODE_SESSION_ID: '' }).stdout);
      const usage = /^usage: node /.test(spawnSync('node', [hookFile, '--can', 'Read'], { encoding: 'utf8', env: { ...process.env, HOME: w.home } }).stdout);
      const wrote = !latched(s);
      // A latch stands (a dispatch refusal set it): the check says so, the status command, the check and TaskStop pass it, and the check set nothing and removed nothing.
      const latchSet = w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' } });
      const underLatch = can('Read', w.plan);
      const status = can('Bash', `node "${join(dir, 'report.mjs')}" "Status 10:00 — a call was refused"`);
      const stops = can('TaskStop', 'x');
      const standing = latchSet.status === 2 && latched(s)
        && /LATCH: stands \(set at \d\d:\d\d California by a refusal of Agent\)/.test(underLatch.stdout) && /RESULT: this call would be refused by the latch\./.test(underLatch.stdout)
        && /This call passes it/.test(status.stdout) && /RESULT: the manager fence and the latch would pass this call/.test(status.stdout)
        && /This call passes it/.test(stops.stdout) && latched(s);
      // Read only: an owner message after the latch means no latch stands, and the check leaves the file; the real read removes it.
      const p = { session_id: s };
      const cleared = [owner(later(60), 'carry on')];
      const kept = m.dispatch.latchStanding(p, cleared, true) === null && latched(s);
      const removed = m.dispatch.latchStanding(p, cleared) === null && !latched(s);
      // Through the hook: the check passes under a latch, as the status command does; with anything chained to it, or made by an agent, it does not.
      w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' } });
      const latchedAgain = latched(s);
      const passesLatch = hook(s, line('Read', w.plan)).status === 0;
      const chainedLatched = hook(s, `${line('Read', w.plan)}; touch x`).status === 2;
      const fresh = sid('cn');
      const freshPass = hook(fresh, line('Read', w.plan)).status === 0;
      const chained = ['; touch x', ' && touch x', ' | cat', ' > x', ' &'].map((tail) => hook(sid('cn'), line('Read', w.plan) + tail));
      const chainedRefused = chained.every((r) => r.status === 2 && /MANAGER FENCE/.test(r.stderr));
      const agent = hook(sid('cn'), line('Read', w.plan), { agent_id: 'a1' });
      const agentRefused = agent.status === 2 && /PLAN FENCE/.test(agent.stderr) && !/cannot give the owner a status/.test(agent.stderr);
      // The fence itself passes the exact line and no other: a line for another file, one with a second word, one that expands.
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const f = (command) => m.dispatch.managerFence({ session_id: 'cn2', tool_name: 'Bash', tool_input: { command } }, { plan, classify: () => false });
      const fenceLine = f(line('Read', '/plans/gate-test.md')) === null && f(`node ${hookFile} --can Read /plans/gate-test.md`) === null && f(`node ${hookFile} --can Bash 'git status'`) === null;
      const fenceOthers = [`node /tmp/hook-dispatch.mjs --can Read x`, `node ${hookFile} --can Read a b`, `node ${hookFile} --can Read $(date)`, `node ${hookFile} --can Read "$HOME"`, `node ${hookFile} --can`, `node ${hookFile} Read x`,
        `node ${hookFile} --can Read x; touch y`, `node ${hookFile} --can Read x && touch y`].every((c) => /^MANAGER FENCE/.test(f(c) ?? ''));
      const isCan = m.dispatch.isCanCommand(line('Read', 'x')) && !m.dispatch.isCanCommand(`${line('Read', 'x')} ; touch y`) && !m.dispatch.isCanCommand('node report.mjs --can Read x');
      return noLatch && refusal && bashMiss && sendOk && dispatchWords && unknown && usage && wrote && standing && kept && removed
        && latchedAgain && passesLatch && chainedLatched && freshPass && chainedRefused && agentRefused && fenceLine && fenceOthers && isCan;
    },
  },
  // ---- the main thread reads a repository's history, and nothing else of git (step 186, LESSONS §423) ----
  {
    name: 'the manager fence passes a Bash line that is exactly git log, git ls-remote, git branch in list mode or git show-ref on a repository named with -C and a full path, when that repository is one of the session\'s or the hub worktree in the session scratchpad, with arguments only from the subject format, the one-line flag, a count, the double dash, branch names and revision ranges; hook-dispatch.mjs --can prints the same answer, and the hook passes the line without a latch',
    guards: ['hist_branch', 'hist_words', 'hist_trim', 'hist_membership', 'hist_session_repos', 'hist_worktree', 'hist_log_args', 'hist_dash', 'hist_up', 'hist_lsremote', 'hist_branch_list', 'hist_showref', 'hist_subcommands', 'can_fence'],
    run(m, dir) {
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const s = sid('gh');
      // A folder with two repositories and a folder that is none, as the session's launch directory holds them.
      const parent = tmp('sg-hist-');
      for (const n of ['appone', 'apptwo']) mkdirSync(join(parent, n, '.git'), { recursive: true });
      mkdirSync(join(parent, 'plainone'));
      const one = join(parent, 'appone');
      const two = join(parent, 'apptwo');
      // Repositories whose folder names carry shell characters: a line naming one is refused for its words, though the folder is the session's.
      const semi = join(parent, 'semi;touch');
      const dollar = join(parent, 'dollar$HOME');
      for (const d of [semi, dollar]) mkdirSync(join(d, '.git'), { recursive: true });
      // The hub worktree: a repository directly below worktree/ in this session's scratchpad.
      const wt = join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad', 'worktree', 'hub');
      mkdirSync(join(wt, '.git'), { recursive: true });
      const elsewhere = join(tmp('sg-hist-else-'), 'otherapp');
      mkdirSync(join(elsewhere, '.git'), { recursive: true });
      // Not a read for the classifier, so a line passes only by the rule under test.
      const f = (command, extra = {}) => m.dispatch.managerFence({ session_id: s, cwd: parent, tool_name: 'Bash', tool_input: { command }, ...extra }, { plan, classify: () => false });
      const fenced = (x) => /^MANAGER FENCE/.test(x ?? '');
      const passes = [
        `git -C ${one} log --format=%s -n 100 origin/main origin/staging`, `git -C ${one} log --oneline -20 main..staging`, `git -C ${two} log --pretty=format:%s --max-count=50 origin/main...origin/staging --`,
        `git -C ${one} log --oneline -n 5`, `git -C ${one} log`, `  git -C ${one} log --oneline  `, `git -C ${wt} log --format=%s -n 3 origin/main`,
        `git -C ${one} ls-remote --heads origin main staging`, `git -C ${one} ls-remote origin`, `git -C ${one} ls-remote`,
        `git -C ${one} branch`, `git -C ${one} branch -a`, `git -C ${one} branch -r`, `git -C ${one} branch --list -v`, `git -C ${wt} branch -vv`,
        `git -C ${one} show-ref --heads`, `git -C ${one} show-ref --verify refs/heads/main`, `git -C ${two} show-ref -s main`];
      const refused = [
        // Chained, redirected, expanded or quoted: never the exact line.
        `git -C ${one} log --oneline ; touch x`, `git -C ${one} log --oneline && touch x`, `git -C ${one} log --oneline | cat`, `git -C ${one} log --oneline > out.txt`,
        `git -C ${one} log --oneline &`, `git -C ${one} log --oneline 2>&1`, `git -C ${one} log --oneline\ntouch x`, `git -C ${one} log $(date)`, `git -C ${one} log \`date\``,
        `git -C ${semi} log --oneline`, `git -C ${dollar} log --oneline`, `git -C ${semi} branch -a`,
        `git -C ${one} log "origin/main"`, `git -C ${one} log origin/main\tstaging`, `git -C ${one} log --oneline < in.txt`, `git -C ${one} log origin/*`, `git -C ${one} log main:NOTES.md`,
        // Another program, another shape of the line.
        `env git -C ${one} log`, `/usr/bin/git -C ${one} log`, `git log`, `git -C ${one}`, `git -C ${one} -C ${two} log`, `git -c core.pager=cat -C ${one} log`, `git --git-dir=${one}/.git log`,
        `git -C ${one} -c core.pager=x log`, `node -e 1 -C ${one} log`,
        // Another thing of git, the ones that show a file or write.
        `git -C ${one} diff`, `git -C ${one} show origin/main`, `git -C ${one} status`, `git -C ${one} fetch origin`, `git -C ${one} commit -m x`, `git -C ${one} push origin staging`,
        `git -C ${one} checkout main`, `git -C ${one} reset --hard`, `git -C ${one} config user.name x`, `git -C ${one} tag`, `git -C ${one} remote -v`, `git -C ${one} cat-file -p main`,
        `git -C ${one} rev-parse HEAD`, `git -C ${one} ls-files`, `git -C ${one} blame NOTES.md`, `git -C ${one} grep x`, `git -C ${one} branch newbranch`, `git -C ${one} branch -d main`,
        `git -C ${one} branch -D main`, `git -C ${one} branch --list main`, `git -C ${one} branch -m old new`, `git -C ${one} show-ref --head x`, `git -C ${one} ls-remote origin ../x`,
        `git -C ${one} ls-remote https://example.invalid/x`, `git -C ${one} ls-remote --get-url`,
        // Arguments outside the list.
        `git -C ${one} log -p`, `git -C ${one} log --stat`, `git -C ${one} log --all`, `git -C ${one} log --format=%B`, `git -C ${one} log --format=%an`, `git -C ${one} log --name-only`,
        `git -C ${one} log --output=x.txt`, `git -C ${one} log -S foo`, `git -C ${one} log --grep=foo`, `git -C ${one} log -- NOTES.md`, `git -C ${one} log --oneline -- NOTES.md`,
        `git -C ${one} log -n`, `git -C ${one} log -n x`, `git -C ${one} log --max-count=x`, `git -C ${one} log --since=yesterday`, `git -C ${one} log ../x`, `git -C ${one} log /etc/passwd`, `git -C ${one} log main/../x`,
        // The repository: not a session repository, not a full path, not a repository at all, not the path as it resolves.
        `git -C ${elsewhere} log`, `git -C ${parent} log`, `git -C ${join(parent, 'plainone')} log`, `git -C appone log`, `git -C ./appone log`, `git -C ${one}/ log`, `git -C ${one}/../apptwo log`,
        `git -C ${join(one, 'src')} log`, `git -C /home/other log`, `git -C ${wt}/../.. log`, `git -C ~/appone log`];
      const passedAll = passes.filter((c) => f(c) !== null);
      const refusedAll = refused.filter((c) => !fenced(f(c)));
      if (passedAll.length || refusedAll.length) throw new Error(`wrong on: ${[...passedAll.map((c) => `passes? ${JSON.stringify(c)}`), ...refusedAll.map((c) => `refuses? ${JSON.stringify(c)}`)].join(', ')}`);
      // The check prints the same answer, from a shell whose directory is the launch directory.
      const hookFile = join(dir, 'hook-dispatch.mjs');
      const can = (cmd) => spawnSync('node', [hookFile, '--can', 'Bash', cmd], { encoding: 'utf8', cwd: parent, env: { ...process.env, HOME: tmp('sg-home-'), CLAUDE_CODE_SESSION_ID: s } }).stdout;
      const canPasses = /MANAGER FENCE: would pass/.test(can(`git -C ${one} log --format=%s -n 100 origin/main origin/staging`)) && /MANAGER FENCE: would pass/.test(can(`git -C ${wt} show-ref --heads`));
      const canRefuses = /MANAGER FENCE: would refuse/.test(can(`git -C ${one} log --oneline ; touch x`)) && /MANAGER FENCE: would refuse/.test(can(`git -C ${one} diff`)) && /MANAGER FENCE: would refuse/.test(can(`git -C ${elsewhere} log`));
      // Through the hook, on the main thread: the line passes and sets no latch; a chained line is refused by the fence.
      const w = world(dir);
      const sPass = sid('gh');
      const okLine = w.call('PreToolUse', { session_id: sPass, cwd: parent, tool_name: 'Bash', tool_input: { command: `git -C ${one} log --format=%s -n 100 origin/main origin/staging` } });
      const sBad = sid('gh');
      const badLine = w.call('PreToolUse', { session_id: sBad, cwd: parent, tool_name: 'Bash', tool_input: { command: `git -C ${one} log --oneline ; touch x` } });
      return canPasses && canRefuses && okLine.status === 0 && !latched(sPass) && badLine.status === 2 && /MANAGER FENCE/.test(badLine.stderr) && !latched(sBad);
    },
  },
  {
    name: 'the manager fence keeps its other refusals beside the history reads: git diff, show and status on a repository, a cat of its source, a history read with an argument outside the list, one chained to a read of source, and one on a repository that is not the session\'s are refused with the reason to send an agent, a call by an agent is the plan fence\'s as before, and the check command still passes',
    guards: ['hist_membership', 'hist_log_args'],
    run(m, dir) {
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const s = sid('gk');
      const parent = tmp('sg-hist-');
      mkdirSync(join(parent, 'appone', '.git'), { recursive: true });
      writeFileSync(join(parent, 'appone', 'app.ts'), 'x\n');
      const one = join(parent, 'appone');
      const elsewhere = join(tmp('sg-hist-else-'), 'otherapp');
      mkdirSync(join(elsewhere, '.git'), { recursive: true });
      // Every call counts as a read for the classifier, so what refuses these is the record: a repository's files are not of it.
      const f = (command, extra = {}) => m.dispatch.managerFence({ session_id: s, cwd: parent, tool_name: 'Bash', tool_input: { command }, ...extra }, { plan, classify: () => true });
      const sendAgent = (x) => /^MANAGER FENCE/.test(x ?? '') && /Send an agent/.test(x);
      const hookFile = join(dir, 'hook-dispatch.mjs');
      return sendAgent(f(`git -C ${one} diff`)) && sendAgent(f(`git -C ${one} show origin/main`)) && sendAgent(f(`git -C ${one} status`)) && sendAgent(f(`cat ${one}/app.ts`))
        && sendAgent(f(`git -C ${one} log --stat`)) && sendAgent(f(`git -C ${one} log -p origin/main`)) && sendAgent(f(`git -C ${one} log --oneline ; cat ${one}/app.ts`))
        && sendAgent(f(`git -C ${elsewhere} log --oneline`)) && sendAgent(f(`git -C ${elsewhere} show-ref --heads`))
        // A call by an agent is not the fence's: the manager fence returns null for a subagent, as before.
        && f(`git -C ${one} diff`, { agent_id: 'a1' }) === null
        && f(`node ${hookFile} --can Read /plans/gate-test.md`) === null;
    },
  },
  {
    name: 'the rules-first check reads the whole of the agent\'s transcript: an agent whose first message is larger than the start window and whose Read of the rules comes after it is not refused once that Read has returned, and a Read that failed, a Read of another file and a second refusal beyond the window are still judged as before',
    guards: ['rules_first_whole', 'rules_first_whole_size', 'rules_first_head', 'rules_first_transcript'],
    run(m, dir) {
      const s = sid('rw');
      const tr = transcript([turn(0, 'start')]);
      const subs = join(tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(subs, { recursive: true });
      const rules = join(dir, 'agent-rules.md');
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      // No `rules` option: the real check runs, on the next file the agent reads.
      const decide = () => m.fence.decide({ session_id: s, agent_id: 'a1', transcript_path: tr, cwd: '/', tool_name: 'Read', tool_input: { file_path: join(dir, 'aim-review.md') } }, { plan });
      const agent = (entries) => writeFileSync(join(subs, 'agent-a1.jsonl'), jsonl(entries));
      // The harness writes about 400 KB before an agent's first call; this first message is 600 KB, past the 512 KB window of the start.
      const opening = at({ type: 'user', message: { role: 'user', content: `${plan.path} step 138 ${'x'.repeat(600 * 1024)}` } }, later(-300));
      const stepsRead = [at(tool(0, 'a1-s', 'Read', { file_path: '/plans/gate-test.steps.md' }), later(-290)), at(result(0, 'a1-s', '1\tsteps'), later(-289))];
      const rulesRead = (id, error) => [at(tool(0, id, 'Read', { file_path: rules }), later(-280)), at(result(0, id, error ? 'File not found' : '1\tRules version: 1', error), later(-279))];
      const refused = (x) => /^PLAN FENCE/.test(x ?? '') && /RULES FIRST/.test(x);
      agent([opening, ...stepsRead]);
      const stepsOnly = refused(decide());
      agent([opening, ...stepsRead, ...rulesRead('a1-r', false)]);
      const afterRules = decide() === null;
      agent([opening, ...stepsRead, ...rulesRead('a1-r', true)]);
      const failedRead = refused(decide());
      agent([opening, ...stepsRead, at(tool(0, 'a1-o', 'Read', { file_path: join(dir, 'CLAUDE.md') }), later(-280)), at(result(0, 'a1-o', '1\tx'), later(-279))]);
      const otherFile = refused(decide());
      // A first refusal recorded beyond the window is found there: the second refusal is the one that latches.
      agent([opening, ...stepsRead, at(tool(0, 'a1-b', 'Bash', { command: 'git status' }), later(-280)), at(result(0, 'a1-b', 'PLAN FENCE refused. RULES FIRST, NO LATCH: read the rules.', true), later(-279))]);
      const second = decide();
      const secondLatches = refused(second) && !/NO LATCH/.test(second);
      agent([opening, ...stepsRead]);
      const first = decide();
      const firstFree = refused(first) && /RULES FIRST, NO LATCH/.test(first);
      return stepsOnly && afterRules && failedRead && otherFile && secondLatches && firstFree;
    },
  },
  {
    name: 'the reply guard keys a publish of the status page by the page and the hash of the page file\'s content at the call: a publish of a page edited since a failed one is not a repeat, an identical publish of unchanged content after a failure still is, a relabelled one is too, and a failure read back from the transcript is keyed by what the page held at the call',
    guards: ['page_key_content', 'page_key_since', 'page_key_catchup_asof'],
    run(m) {
      process.env.REPLY_LEDGER_DIR = tmp('sg-ledger-');
      process.env.REPLY_GUARD_NOW = String(Date.parse(ts(-5)));
      try {
        const page = join(tmp('sg-page-'), 'status', 'fix-run.html');
        mkdirSync(dirname(page), { recursive: true });
        const input = { file_path: page, icon: 'status', description: 'The state of the work.' };
        const publish = { session_id: 'pg', tool_name: 'Artifact', tool_input: input };
        const repeat = (x) => /call that failed, unchanged/.test(x ?? '');
        writeFileSync(page, '<html>one</html>\n');
        m.reply.record({ ...publish, tool_use_id: 'u1', error: 'Artifact publish failed: an edit sent beside it did not apply' }, 'PostToolUseFailure');
        const recorded = m.reply.load({ session_id: 'pg' }).some((e) => e.kind === 'fail' && e.tool === 'Artifact');
        const identical = repeat(m.reply.decide({ ...publish }));
        const relabelled = repeat(m.reply.decide({ ...publish, tool_input: { ...input, description: 'Another sentence about the same page.' } }));
        writeFileSync(page, '<html>two</html>\n');
        const edited = m.reply.decide({ ...publish }) === null;
        writeFileSync(page, '<html>one</html>\n');
        const restored = repeat(m.reply.decide({ ...publish }));
        // The identity itself: content and path make it; a label does not; no other tool is touched.
        const a = m.reply.callHash('Artifact', input), b = m.reply.callHash('Artifact', { ...input, description: 'x' });
        writeFileSync(page, '<html>three</html>\n');
        const c = m.reply.callHash('Artifact', input);
        const other = m.reply.callHash('Artifact', { ...input, file_path: join(dirname(page), 'other.html') });
        const keyed = a === b && a !== c && a !== other && m.reply.callHash('Artifact', { action: 'list' }) === m.reply.callHash('Artifact', { action: 'list' })
          && m.reply.callHash('Bash', { command: 'ls' }) === m.reply.callHash('Bash', { command: 'ls', description: 'x' }) && m.reply.callHash('Read', { file_path: page }) === m.reply.callHash('Read', { file_path: page });
        // Read back from the transcript, where the hook never ran: unchanged since the call, it is a repeat; edited since, the page at the call is not known and the same path is not a repeat.
        const failedResult = 'Artifact publish failed: an edit sent beside it did not apply';
        const calls = [tool(0, 'c1', 'Artifact', input), result(1, 'c1', failedResult, true)];
        writeFileSync(page, '<html>one</html>\n');
        const old = Date.parse(ts(-50)) / 1000;
        utimesSync(page, old, old);
        const unchangedSince = repeat(m.reply.decide({ session_id: 'pg2', tool_name: 'Artifact', tool_input: input, transcript_path: transcript(calls) }));
        const nowSecs = Date.now() / 1000;
        utimesSync(page, nowSecs, nowSecs);
        const editedSince = m.reply.decide({ session_id: 'pg3', tool_name: 'Artifact', tool_input: input, transcript_path: transcript(calls) }) === null;
        return recorded && identical && relabelled && edited && restored && keyed && unchangedSince && editedSince;
      } finally {
        delete process.env.REPLY_LEDGER_DIR;
        delete process.env.REPLY_GUARD_NOW;
      }
    },
  },

  // ---- the plan gate's name check, the plan fence's opener, the latch and the review's staleness (step 199) ----
  {
    name: 'the plan gate passes a name it can find: one a tool result printed beyond the old tail of sixteen megabytes, a bare file name that exists in the session scratchpad with no result printing it, a held name whose file now exists, and a bare file name that exists in a repository the plan\'s Files names',
    guards: ['names_wide_tail', 'names_exists_pad', 'names_exists_repo', 'names_held_exists'],
    run(m, dir) {
      const r = repo({ 'a.txt': 'x\n' });
      const demo = repo({ 'a.txt': 'x\n' }, 'Demo-Files');
      const padOf = (s) => join(process.env.TMPDIR, 'claude-0', '-home-user', s, 'scratchpad');
      const put = (s, name) => { mkdirSync(padOf(s), { recursive: true }); writeFileSync(join(padOf(s), name), 'x\n'); };
      const exit = (s, planText, entries, project = r.dir) => spawnSync('node', [join(dir, 'plan-guard.mjs')], {
        input: JSON.stringify({ session_id: s, permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { plan: planText }, transcript_path: transcript([turn(0, OWNER), ...entries]), cwd: '/' }),
        encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: project },
      });
      const naming = (name) => `${PLAN(OWN_WORDS)}\n- The builder calls \`${name}\` once.\n`;
      // A name a result printed, then more other entries than the old tail of sixteen megabytes reads.
      const early = ['zzqx', 'Early', 'Gadget'].join('');
      const fill = Array.from({ length: 17 }, () => ({ type: 'system', subtype: 'padding', content: 'x'.repeat(1024 * 1024) }));
      const wide = exit(sid('nm'), naming(early), [tool(0, 'g1', 'Grep', {}), at(result(0, 'g1', `src/builder.mjs:12: export function ${early}()`), later(-30)), ...fill]);
      // A bare file name that exists in this session's scratchpad and that no result printed.
      const padName = 'zzqx-pad-note.txt';
      const s2 = sid('nm');
      put(s2, padName);
      const onPad = exit(s2, naming(padName), []);
      // A name the held record holds, whose file now exists.
      const heldName = 'zzqx-held-note.txt';
      const s3 = sid('nm');
      put(s3, heldName);
      mkdirSync(process.env.PLAN_GUARD_NAMES_DIR, { recursive: true });
      writeFileSync(join(process.env.PLAN_GUARD_NAMES_DIR, `${s3}.json`), JSON.stringify([{ name: heldName, at: Date.now() - 60000 }]));
      const released = exit(s3, PLAN(OWN_WORDS), []);
      const left = JSON.parse(readFileSync(join(process.env.PLAN_GUARD_NAMES_DIR, `${s3}.json`), 'utf8'));
      // A bare file name that exists, untracked, in the repository the plan's Files names.
      const repoName = 'zzqx-untracked-notes.txt';
      writeFileSync(join(demo.dir, repoName), 'x\n');
      const onRepo = exit(sid('nm'), `${PLAN(OWN_WORDS)}\n## Files touched\n- Demo-Files: \`${repoName}\`\n`, [], demo.dir);
      const got = [wide, onPad, released, onRepo].map((x) => x.status);
      if (!(got.every((x) => x === 0) && left.length === 0)) {
        const first = [wide, onPad, released, onRepo].find((x) => x.status !== 0);
        throw new Error(`statuses ${got.join(', ')} (wide tail, scratchpad, held record, repository), held record keeps ${left.length}; first refusal: ${String(first?.stdout ?? '').slice(0, 220)}`);
      }
      return true;
    },
  },
  {
    name: 'the plan gate still refuses a name nothing can find: a made-up name, a path-shaped name that is not on disk, a held name whose file does not exist, and a bare file name that exists only in another session\'s scratchpad',
    guards: ['names_exists_real'],
    run(m, dir) {
      const r = repo({ 'a.txt': 'x\n' });
      const padOf = (s) => join(process.env.TMPDIR, 'claude-0', '-home-user', s, 'scratchpad');
      const exit = (s, planText, entries) => spawnSync('node', [join(dir, 'plan-guard.mjs')], {
        input: JSON.stringify({ session_id: s, permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { plan: planText }, transcript_path: transcript([turn(0, OWNER), ...entries]), cwd: '/' }),
        encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: r.dir },
      });
      const naming = (name) => `${PLAN(OWN_WORDS)}\n- The builder calls \`${name}\` once.\n`;
      const made = exit(sid('nm'), naming(['zzqx', 'Made', 'Gadget'].join('')), []);
      const pathy = exit(sid('nm'), naming('src/zzqx/nothing-here.mjs'), []);
      const s3 = sid('nm');
      mkdirSync(process.env.PLAN_GUARD_NAMES_DIR, { recursive: true });
      writeFileSync(join(process.env.PLAN_GUARD_NAMES_DIR, `${s3}.json`), JSON.stringify([{ name: 'zzqx-nowhere-note.txt', at: Date.now() - 60000 }]));
      const held = exit(s3, PLAN(OWN_WORDS), []);
      const other = sid('nm');
      mkdirSync(padOf(other), { recursive: true });
      writeFileSync(join(padOf(other), 'zzqx-elsewhere-note.txt'), 'x\n');
      const elsewhere = exit(sid('nm'), naming('zzqx-elsewhere-note.txt'), []);
      const all = [made, pathy, held, elsewhere];
      if (!all.every((x) => x.status === 2)) throw new Error(`statuses ${all.map((x) => x.status).join(', ')} (made up, path-shaped, held, another session's scratchpad), every one is 2`);
      return /exist in no repo/.test(made.stdout) && pathy.stdout.includes('src/zzqx/nothing-here.mjs') && /stays refused/.test(held.stdout) && elsewhere.stdout.includes('zzqx-elsewhere-note.txt');
    },
  },
  {
    name: 'a command line is opened as a shell opens it: text in single quotes never opens a command, so a commit message holding a backtick pair or a dollar-parenthesis group and a pattern holding a vertical bar pass the plan fence, and the host check does not read a quoted backtick span as a request; the refusal of a line that does open a command names the character it opened at and says to write the text into a file the script reads',
    guards: ['opener_single_quote', 'opener_named', 'opener_named_cd', 'opener_op', 'opener_sub'],
    run(m) {
      const r = repo({ 'keep.mjs': 'x\n' });
      mkdirSync(join(r.dir, 'tools'));
      const plan = fencePlan(basename(r.dir));
      const s = sid('op');
      const b = (command) => decideFence(m, { session_id: s, agent_id: 'a1', tool_name: 'Bash', tool_input: { command }, cwd: r.dir }, { plan });
      const quoted = [`git commit -m 'Notes: the line holds ${BT}rm x${BT} and more'`, "git commit -m 'Notes: the line holds $(rm x) and more'",
        "git grep -n 'a|b' keep.mjs", "git commit -m 'a; b & c > d'"].map((c) => [c, b(c)]);
      const said = (command, ...res) => { const x = b(command) ?? ''; return /^PLAN FENCE/.test(x) && res.every((re) => re.test(x)); };
      const file = /written into a file in the scratchpad that the script reads/;
      const bad = [...quoted.filter(([, x]) => x !== null).map(([c]) => c)];
      for (const [c, ...res] of [['git log; rm x', /opened this command at a semicolon/], ['git status | tee out', /opened this command at a vertical bar/],
        ['git status & rm -rf x', /opened this command at an ampersand/], ['git status && rm x', /opened this command at a double ampersand/],
        ['git commit -m "$(rm -rf x)"', /opened this command at a dollar sign and an opening parenthesis/],
        [`git commit -m "a ${BT}rm x${BT} b"`, /opened this command at a backtick/], ['git status\nrm x', /opened this command at a new line/],
        ['git status; cd /tmp', /opened this command at a semicolon/]]) if (!said(c, ...res, file)) bad.push(c);
      if (bad.length) throw new Error(`wrong on: ${bad.map((c) => JSON.stringify(c)).join(', ')}`);
      const hosts = (cmd) => [...m.reply.hostsIn(cmd)];
      return hosts(`git commit -m 'see ${BT}curl pixinsight.com/x${BT} now'`).length === 0 && hosts("git commit -m 'see $(curl pixinsight.com/x) now'").length === 0
        && m.reply.commandsIn(`git commit -m 'x ${BT}curl y${BT} z'`).every((x) => x.words[0] !== 'curl');
    },
  },
  {
    name: 'a line that does open a command is still refused: an unquoted vertical bar, semicolon, ampersand or backtick, a dollar-parenthesis group and a backtick pair inside double quotes, a process substitution and a new line each open one, and the host check still reads such a span as a request',
    guards: ['opener_double_quote', 'opener_backtick', 'opener_dollar', 'fence_split'],
    run(m) {
      const r = repo({ 'keep.mjs': 'x\n' });
      mkdirSync(join(r.dir, 'tools'));
      const plan = fencePlan(basename(r.dir));
      const s = sid('oq');
      const b = (command) => decideFence(m, { session_id: s, agent_id: 'a1', tool_name: 'Bash', tool_input: { command }, cwd: r.dir }, { plan });
      const refuse = ['git status | tee out', 'git log; rm x', 'git status & rm -rf x', 'git status && rm x', 'git commit -m "$(rm -rf x)"',
        `git commit -m "a ${BT}rm x${BT} b"`, `echo ${BT}rm x${BT}`, 'echo $(rm x)', 'cat <(rm x)', 'git status\nrm x', 'git status; cd /tmp'].map((c) => [c, b(c)]);
      const bad = refuse.filter(([, x]) => !/^PLAN FENCE/.test(x ?? '')).map(([c]) => c);
      if (bad.length) throw new Error(`not refused: ${bad.map((c) => JSON.stringify(c)).join(', ')}`);
      const hosts = (cmd) => m.reply.hostsIn(cmd).has('pixinsight.com');
      return hosts('curl pixinsight.com/x') && hosts(`echo "see ${BT}curl pixinsight.com/x${BT}"`) && hosts('echo "see $(curl pixinsight.com/x)"') && hosts(`echo ${BT}curl pixinsight.com/x${BT}`);
    },
  },
  {
    name: 'the doctrine gate\'s refusal sets no latch: the Read it asks for passes at once',
    guards: ['latch_doctrine_free'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('ld');
      w.call('SessionStart', { session_id: s, source: 'startup' });
      const first = w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const standing = latched(s);
      const read = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan } });
      if (!(first.status === 2 && /DOCTRINE GATE/.test(first.stderr) && !standing && read.status === 0)) {
        throw new Error(`first ${first.status} (${String(first.stderr).slice(0, 80)}), latch standing ${standing}, read ${read.status} (${String(read.stderr).slice(0, 120)})`);
      }
      return true;
    },
  },
  {
    name: 'the plan gate\'s refusal of the approval call on a name it has not seen sets no latch, so the Read that shows the name passes at once, and the call stays refused until the name is shown or its file exists',
    guards: ['latch_names_free', 'names_marked'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('ln');
      hookRepo(w, 'plan-guard.sh', false);
      const name = ['zzqx', 'Latch', 'Gadget'].join('');
      const planText = `${PLAN(OWN_WORDS)}\n- The builder calls \`${name}\` once.\n`;
      const exit = () => w.call('PreToolUse', { session_id: s, permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { plan: planText } });
      const first = exit();
      const standing = latched(s);
      const read = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan } });
      const again = exit();
      if (!(first.status === 2 && /exist in no repo/.test(first.stderr) && !standing && read.status === 0 && again.status === 2 && /exist in no repo/.test(again.stderr) && !/REFUSAL LATCH/.test(again.stderr))) {
        throw new Error(`first ${first.status} (${String(first.stderr).slice(0, 100)}), latch standing ${standing}, read ${read.status} (${String(read.stderr).slice(0, 120)}), again ${again.status} (${String(again.stderr).slice(0, 100)})`);
      }
      return true;
    },
  },
  {
    name: 'a refusal of the approval call by the app\'s identifier guard sets no latch and still refuses, so the Read that shows the identifier passes at once',
    guards: ['latch_ident_free'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('li');
      hookRepo(w, 'ident-guard.sh', 'ExitPlanMode');
      const first = w.call('PreToolUse', { session_id: s, permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { plan: PLAN(OWN_WORDS) } });
      const standing = latched(s);
      const read = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan } });
      if (!(first.status === 2 && /planted refusal from ident-guard\.sh/.test(first.stderr) && !standing && read.status === 0)) {
        throw new Error(`first ${first.status} (${String(first.stderr).slice(0, 100)}), latch standing ${standing}, read ${read.status} (${String(read.stderr).slice(0, 120)})`);
      }
      return true;
    },
  },
  {
    name: 'the refusals that latch still latch: after the doctrine gate\'s refusal a call that is not a read is refused again, and the plan gate\'s refusal of a plan that is missing its sections, the identifier guard\'s refusal of a call that is not the approval call and another hook\'s refusal of the approval call each set the latch and hold the next call',
    guards: ['doctrine_refuse', 'latch_other_plan', 'latch_ident_exit_only', 'latch_other_shim'],
    run(m, dir) {
      const read = (w, s) => w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan } });
      const held = (r) => r.status === 2 && /REFUSAL LATCH/.test(r.stderr);
      // The doctrine gate: a second call that is not a read is refused by the gate itself, and no latch is behind it.
      const w1 = world(dir);
      const s1 = sid('lk');
      w1.call('SessionStart', { session_id: s1, source: 'startup' });
      const send = () => w1.call('PreToolUse', { session_id: s1, tool_name: 'Agent', tool_input: { prompt: `${w1.plan} step 1`, subagent_type: 'general-purpose' } });
      send();
      const again = send();
      // The plan gate refusing something other than a name.
      const w2 = world(dir);
      const s2 = sid('lk');
      hookRepo(w2, 'plan-guard.sh', false);
      const missing = w2.call('PreToolUse', { session_id: s2, permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { plan: '# A plan with no sections at all.' } });
      const afterMissing = read(w2, s2);
      // The identifier guard refusing a call that is not the approval call.
      const w3 = world(dir);
      const s3 = sid('lk');
      hookRepo(w3, 'ident-guard.sh', 'Read');
      const identRead = read(w3, s3);
      const afterIdent = read(w3, s3);
      // Another hook refusing the approval call.
      const w4 = world(dir);
      const s4 = sid('lk');
      hookRepo(w4, 'other-guard.sh', 'ExitPlanMode');
      const other = w4.call('PreToolUse', { session_id: s4, permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { plan: PLAN(OWN_WORDS) } });
      const afterOther = read(w4, s4);
      if (!(again.status === 2 && missing.status === 2 && /the plan is missing/.test(missing.stderr) && held(afterMissing)
        && identRead.status === 2 && held(afterIdent) && other.status === 2 && held(afterOther))) {
        throw new Error(`doctrine again ${again.status}, missing ${missing.status} then ${afterMissing.status}, ident ${identRead.status} then ${afterIdent.status}, other ${other.status} then ${afterOther.status}`);
      }
      return true;
    },
  },
  {
    name: 'a plan\'s After line, in its Order section, as groups of the form N after M M separated by semicolons: reviewState leaves a review current when a step the cleared step does not follow ended after the review began, and the plan gate refuses an After line that names a step outside Order or is not of that form',
    guards: ['after_parse', 'after_sibling', 'after_wired', 'after_block_text', 'after_plan_guard', 'after_outside_order', 'after_malformed'],
    run(m, dir) {
      const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const st = (line, ends, o = {}) => m.report.reviewState({ session_id: 'rs' }, { path: '/plans/gate-test.md', text: afterPlanText(dir, line) }, { ends, planAt: 10, ...o });
      const one = endFor(1, 100, 50, 'DONE');
      const review = endFor(3, 200, 150, 'ON-AIM ROUTE-CLEAR step 1 next 4');
      // Step 2 ends at 300, after the review began at 150, and step 4 does not follow it.
      const sibling = endFor(2, 300, 250, 'DONE');
      const parsed = m.report.planAfter(afterPlanText(dir, 'After: 4 after 1 2; 2 after 1'));
      const shown = m.report.planAfter('## Order\nOrder: 199, 200, 201, 202, 203, 204\nStanding: 205\nAfter: 202 after 200 201; 203 after 199 202; 204 after 203\n');
      const current = st('After: 4 after 1', [one, review, sibling]);
      const unrelated = st('After: 4 after 1; 2 after 1', [one, review, sibling]);
      // The plan gate.
      const r = repo({ 'a.txt': 'x\n' });
      const gate = (line) => exitFor(dir, afterGatePlan(dir, line), r.dir);
      const good = gate('After: 2 after 1');
      const outside = gate('After: 2 after 9');
      const standing = gate('After: 3 after 1');
      const malformed = gate('After: two after one');
      const none = gate('');
      return m.report.planAfter(afterPlanText(dir)) === null && parsed?.bad.length === 0 && eq([...parsed.follows], [[4, [1, 2]], [2, [1]]])
        && eq([...shown.follows], [[202, [200, 201]], [203, [199, 202]], [204, [203]]])
        && current.kind === 'cleared' && current.cleared === 4 && current.step === 1 && unrelated.kind === 'cleared' && eq(current.ignored, [2])
        && m.report.reviewBlock(current).includes('The plan\'s After line does not tie step 2 to it, so an end of that step after it began leaves it current.')
        && good.status === 0 && none.status === 0
        && [outside, standing, malformed].every((x) => x.status === 2 && /AFTER LINE/.test(x.stdout));
    },
  },
  {
    name: 'a review is still stale when the plan was written after it began, when a correction is newer, when the step it judged or the step it clears ended after it began, or when a step the cleared step follows by the After line did; with no After line any end of a step in Order stales it, and a verdict naming another step than the newest end before the review is the wrong step either way',
    guards: ['review_ref_order', 'review_ref_plan', 'review_ref_after', 'review_wrong_step', 'after_tied', 'after_judged_end', 'after_cleared_end', 'after_follows_end', 'after_follows_valid', 'after_follows_bad'],
    run(m, dir) {
      const st = (line, ends, o = {}) => m.report.reviewState({ session_id: 'rs' }, { path: '/plans/gate-test.md', text: afterPlanText(dir, line) }, { ends, planAt: 10, ...o });
      const kind = (line, ends, o) => st(line, ends, o).kind;
      const one = endFor(1, 100, 50, 'DONE');
      const review = endFor(3, 200, 150, 'ON-AIM ROUTE-CLEAR step 1 next 4');
      const sibling = endFor(2, 300, 250, 'DONE');
      const both = [['no After line', ''], ['an After line that ties step 4 to step 2 only', 'After: 4 after 2']];
      const out = [];
      for (const [label, line] of both) {
        // The step the review judged ended again after it began.
        if (kind(line, [one, review, endFor(1, 400, 350, 'DONE')]) !== 'stale') out.push(`${label}: the judged step's end`);
        // The step it clears ended after it began.
        if (kind(line, [one, review, endFor(4, 500, 450, 'DONE')]) !== 'stale') out.push(`${label}: the cleared step's end`);
        // The plan's last write and the owner's newest message.
        if (kind(line, [one, review], { planAt: 160 }) !== 'stale') out.push(`${label}: the plan's write`);
        if (kind(line, [one, review], { after: 170 }) !== 'stale') out.push(`${label}: the correction's time`);
        // A verdict naming another step than the newest end before the review began.
        if (kind(line, [one, endFor(3, 200, 150, 'ON-AIM ROUTE-CLEAR step 2 next 4')]) !== 'wrong-step') out.push(`${label}: the wrong step`);
        if (kind(line, [one, review]) !== 'cleared') out.push(`${label}: control`);
      }
      // With no After line, a sibling's end stales the review.
      if (kind('', [one, review, sibling]) !== 'stale') out.push('no After line: a sibling\'s end');
      // Under an After line, a step the cleared step follows does.
      if (kind('After: 4 after 2', [one, review, sibling]) !== 'stale') out.push('the After line: an end of a step the cleared step follows');
      if (kind('After: 4 after 2 1', [one, review, endFor(1, 310, 260, 'DONE')]) !== 'stale') out.push('the After line: a second followed step');
      // A line that names a step outside Order, or has a group that is not of the form, is read as no line: a sibling's end stales.
      if (kind('After: 4 after 9', [one, review, sibling]) !== 'stale') out.push('a line that names a step outside Order');
      if (kind('After: 4 after 1; nonsense', [one, review, sibling]) !== 'stale') out.push('a line with a group that is not of the form');
      // A followed step that ended before the review began leaves it current.
      if (kind('After: 4 after 2', [one, endFor(2, 120, 60, 'DONE'), endFor(3, 200, 150, 'ON-AIM ROUTE-CLEAR step 2 next 4')]) !== 'cleared') out.push('the After line: a followed step that ended before it began');
      if (out.length) throw new Error(`wrong on: ${out.join('; ')}`);
      return true;
    },
  },

  // ---- step 220, change 1: the Rules line and the Rules of this plan section are part of the approval's scope (LESSONS §433) ----
  {
    name: 'step220a: the Rules line and the Rules of this plan section are part of the approval\'s scope: both are hashed, an edit of either is named by scopeChanged and refused by approved-plan-guard (naming it), a change that got past the check leaves no plan in force, the Steps still amend, and the review gate and the rules gate say which sections an edit voids; a marker written before the two joined holds no key for them, does not read them as changed, judges an edit of either against the plan file as it stands, records both at its first amendment, and has the approval block say of each that the marker does not record it',
    guards: ['rules_scope_sections', 'rules_scope_old_marker', 'rules_scope_unrecorded', 'rules_block_unrecorded', 'rules_block_recorded', 'rules_amend_before', 'rules_review_text', 'rules_pin_text'],
    run(m, dir) {
      const sha = (t) => createHash('sha256').update(t).digest('hex');
      const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const six = ['Goals', 'Asked', 'Files', 'Commands', 'Rules', 'Rules of this plan'];
      const text = rulesScopedPlan(dir);
      const hashes = m.report.scopeHashes(text);
      const LINE = { old_string: rulesLine(dir), new_string: rulesLine(dir, RULES_VERSION + 1) };
      const OWN = { old_string: RULE_OWN, new_string: 'No step is sent more than three times.' };
      const STEP = { old_string: '1. **Build.** Make the thing.', new_string: '1. **Build.** Make the thing, and say what it did.' };
      const FILES = { old_string: '`keep.mjs`', new_string: '`keep.mjs`, `more.mjs`' };
      const edit = (e) => (t) => t.replace(e.old_string, e.new_string);
      // The instrument: every edit changes the text, or an edit that moves nothing could be one never made.
      const changes = [LINE, OWN, STEP, FILES].every((e) => edit(e)(text) !== text);
      // A marker written before the two joined holds no key for either.
      const old = { ...hashes }; delete old.Rules; delete old['Rules of this plan'];
      const hashed = same(Object.keys(hashes), six) && Object.values(hashes).every((h) => /^[0-9a-f]{64}$/.test(h))
        && same(m.report.scopeChanged(hashes, edit(LINE)(text)), ['Rules']) && same(m.report.scopeChanged(hashes, edit(OWN)(text)), ['Rules of this plan'])
        && same(m.report.scopeChanged(hashes, edit(STEP)(text)), []) && same(m.report.scopeChanged(hashes, text), [])
        && same(m.report.scopeChanged(m.report.scopeHashes(text.replace(/## Rules of this plan[\s\S]*?(?=## Order)/, '')), text), ['Rules of this plan']);
      const oldRead = same(m.report.scopeChanged(old, edit(LINE)(text)), []) && same(m.report.scopeChanged(old, edit(OWN)(text)), [])
        && same(m.report.scopeChanged(old, edit(FILES)(text)), ['Files'])
        && same(m.report.scopeUnrecorded(old), ['Rules', 'Rules of this plan']) && same(m.report.scopeUnrecorded(hashes), []) && same(m.report.scopeUnrecorded(null), []);
      // Through approved-plan-guard: the owner's approval through the tool records the six, and each edit is judged against them.
      const approve = (A, body = text) => {
        writeFileSync(A.plan, body);
        const tr = transcript([turn(0, 'start')]);
        A.guard(tr, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: body, isAgent: false, filePath: A.plan } }, '--mark');
        return tr;
      };
      const call = (A, tr, input, flag) => A.guard(tr, { tool_name: 'Edit', tool_input: { file_path: A.plan, ...input }, ...(flag ? { hook_event_name: 'PostToolUse' } : {}) }, flag);
      const refused = (r, ...re) => r.status === 2 && re.every((x) => x.test(r.stdout));
      const statusOf = (Z) => spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the rules scope test'], { encoding: 'utf8', env: { ...process.env, HOME: Z.home, CLAUDE_CODE_SESSION_ID: '' } }).stdout ?? '';
      const A = appHome(dir);
      const trA = approve(A);
      const mkA = A.mk();
      const lineA = call(A, trA, LINE);
      const ownA = call(A, trA, OWN);
      const stepA = call(A, trA, STEP);
      writeFileSync(A.plan, edit(STEP)(text));
      call(A, trA, STEP, '--amend');
      const amendedA = A.mk();
      // A change that got past the check: the real file's Rules line differs, so the marker keeps its hash and no plan is in force.
      const D = appHome(dir);
      const trD = approve(D);
      writeFileSync(D.plan, edit(LINE)(text));
      const notCarried = call(D, trD, LINE, '--amend');
      const stuck = statusOf(D);
      const newShape = same(Object.keys(mkA?.scope ?? {}), six) && same(mkA.scope, hashes)
        && refused(lineA, /Rules/, /voids the approval/) && !/Rules of this plan/.test(lineA.stdout) && refused(ownA, /Rules of this plan/, /voids the approval/)
        && stepA.status === 0 && amendedA?.hash === sha(edit(STEP)(text)) && same(amendedA.scope, hashes)
        && notCarried.status === 2 && /Rules/.test(notCarried.stderr) && /NOT carried/.test(notCarried.stderr) && D.mk()?.hash === sha(text)
        && /Scope: CHANGED in Rules\./.test(stuck) && /Match: NO/.test(stuck);
      // A marker of the older shape: the Rules edits are judged against the plan file as it stands, and both sections are recorded by the first amendment.
      const B = appHome(dir);
      const trB = approve(B);
      writeFileSync(B.marker, JSON.stringify({ ...B.mk(), scope: old }));
      const lineB = call(B, trB, LINE);
      const ownB = call(B, trB, OWN);
      const stepB = call(B, trB, STEP);
      writeFileSync(B.plan, edit(STEP)(text));
      call(B, trB, STEP, '--amend');
      const amendedB = B.mk();
      const statusB = statusOf(B);
      const C = appHome(dir);
      approve(C);
      writeFileSync(C.marker, JSON.stringify({ ...C.mk(), scope: old }));
      writeFileSync(C.plan, edit(LINE)(text));
      const statusC = statusOf(C);
      const olderShape = refused(lineB, /Rules/, /voids the approval/) && refused(ownB, /Rules of this plan/) && stepB.status === 0
        && same(Object.keys(amendedB?.scope ?? {}), six) && same(amendedB.scope, m.report.scopeHashes(edit(STEP)(text)))
        && /Scope: Goals, Asked, Files, Commands, Rules, Rules of this plan are as approved\./.test(statusB) && !/is not recorded in this marker/.test(statusB)
        && /Scope: Goals, Asked, Files, Commands are as approved\./.test(statusC) && /Scope: Rules is not recorded in this marker/.test(statusC)
        && /Scope: Rules of this plan is not recorded in this marker/.test(statusC) && !/Scope: CHANGED/.test(statusC) && /Match: NO/.test(statusC);
      // The words of the two gates that name what an edit voids.
      const plan = { path: '/plans/gate-test.md', text: reviewPlan(dir) };
      const route = m.dispatch.reviewGate({ tool_name: 'Agent', tool_input: { prompt: `${plan.path} step 2` } }, plan,
        { kind: 'route-refused', reviewers: [3], step: 1, first: 'ON-AIM ROUTE-REFUSED step 1 next 2', review: { path: '/agents/agent-r1.jsonl' }, cleared: null });
      const pin = m.dispatch.rulesPinProblem(`## Rules\n${rulesLine(dir, RULES_VERSION + 1)}\n`);
      const words = typeof route === 'string' && /Goals, Asked, Files, Commands, Rules, Rules of this plan do not/.test(route)
        && typeof pin === 'string' && /pins version \d+/.test(pin) && /amend the Rules line/.test(pin) && /voids the approval/.test(pin) && /plan-mode button/.test(pin) && /does not latch/.test(pin);
      return changes && hashed && oldRead && newShape && olderShape && words;
    },
  },

  // ---- step 220, change 2: a plan mode the harness began at a restart after the approval is not the plan's (LESSONS §432) ----
  {
    name: 'step220b: a plan mode the harness began at a compaction or a resume after the plan was approved is not the plan\'s: plan-guard refuses the approval call, saying the plan is already approved, with the mark that sets no latch, and judges every other call as outside plan mode (approved-plan-guard does the same); where the owner entered plan mode after the approval or the plan mode ended, where the PLAN-LOCK marker exists, the mode is one a caller forced (the classifier\'s own, which must not make every tool a read), the plan file changed or the marker is another session\'s, neither half applies',
    guards: ['restart_compact_boundary', 'restart_hook_resume', 'restart_hook_compact', 'restart_exit_resets', 'restart_no_assistant', 'restart_boundary_after', 'restart_marker_hash', 'restart_session', 'restart_via',
      'restart_exit_refused', 'restart_other_pass', 'restart_lock', 'restart_forced', 'restart_no_latch_mark', 'restart_no_latch_dispatch', 'restart_classifier_dispatch', 'restart_lock_dispatch',
      'restart_apg_standdown', 'restart_apg_forced', 'restart_classifier_apg'],
    run(m, dir) {
      const sha = (t) => createHash('sha256').update(t).digest('hex');
      const A = appHome(dir);
      const text = STEPS_PLAN;
      const base = [...approvedEntries(A.plan), ...workEntries(-650, 'w1')];
      const T = {
        compaction: transcript([...base, ...restartOf('compaction', A.plan)]),
        hookCompact: transcript([...base, ...restartOf('hook-compact', A.plan)]),
        resume: transcript([...base, ...restartOf('resume', A.plan)]),
        // The session worked after the restart, and the owner entered plan mode later: the restart did not begin it.
        ownerAfterWork: transcript([...base, ...restartOf('compaction', A.plan).slice(0, 2), ...workEntries(-280, 'w3'), at(turn(0, 'Go.'), later(-200)), planOn(-199, A.plan)]),
        ownerNoRestart: transcript([...base, at(turn(0, 'Go.'), later(-200)), planOn(-199, A.plan)]),
        // The plan mode began before the approval and no exit entry follows it: the approval was given inside it.
        beganBefore: transcript([turn(0, 'start'), at(boundary(0), later(-1000)), planOn(-999, A.plan), ...exitPlan(-700, true)]),
        ended: transcript([...base, ...restartOf('compaction', A.plan), exitEntry(-200, A.plan, uid())]),
      };
      const marker = approvalMarker(A.home, A.plan, text);
      const rm = (tr, mk = marker) => m.report.restartedPlanMode({ transcript_path: tr, session_id: 'rm' }, mk);
      // The reading of the transcript itself.
      const stales = ['compaction', 'hookCompact', 'resume'].every((k) => rm(T[k]) === A.plan);
      const owners = ['ownerAfterWork', 'ownerNoRestart', 'beganBefore', 'ended'].every((k) => rm(T[k]) === '');
      writeFileSync(A.plan, `${text}\nChanged behind the approval.\n`);
      const changedFile = rm(T.compaction) === '';
      writeFileSync(A.plan, text);
      const otherSession = rm(T.compaction, approvalMarker(A.home, A.plan, text, { session: 'another' })) === '' && rm(T.compaction, approvalMarker(A.home, A.plan, text, { session: 'rm' })) === A.plan;
      // A marker recorded from the owner's exit in the app is dated when the exit was judged, which can be after the restart; the exit's own time is read from it.
      const viaMarker = approvalMarker(A.home, A.plan, text, { at: new Date(Date.now() - 100 * 1000).toISOString(), appExit: 'ex1', via: `the exit from plan mode in the app: entry ex1 at ${new Date(Date.now() - 699 * 1000).toISOString()}` });
      const viaRead = rm(T.compaction, viaMarker) === A.plan && rm(T.compaction, approvalMarker(A.home, A.plan, text, { at: new Date(Date.now() - 100 * 1000).toISOString() })) === '';
      approvalMarker(A.home, A.plan, text);
      // plan-guard itself, with the home that holds the marker.
      const pg = (tr, payload, env = {}) => spawnSync('node', [join(dir, 'plan-guard.mjs')], {
        input: JSON.stringify({ session_id: 'rm', transcript_path: tr, cwd: A.home, permission_mode: 'plan', ...payload }), encoding: 'utf8', env: { ...process.env, HOME: A.home, ...env } });
      const WRITE = { tool_name: 'Write', tool_input: { file_path: join(A.home, 'src.txt'), content: 'x' } };
      const SEND = { tool_name: 'Agent', tool_input: { prompt: `${A.plan} step 1`, subagent_type: 'general-purpose' } };
      const EXIT = { tool_name: 'ExitPlanMode', tool_input: { plan: '# x' } };
      const BASH = { tool_name: 'Bash', tool_input: { command: 'git push origin main' } };
      const approvedText = (r) => r.status === 2 && /PLAN ALREADY APPROVED, NO LATCH:/.test(r.stdout) && /already approved/.test(r.stdout) && !/Say so in plain text/.test(r.stdout);
      const refusedAsPlanMode = (r) => r.status === 2 && /PLAN MODE/.test(r.stdout);
      const halves = ['compaction', 'hookCompact', 'resume'].every((k) => approvedText(pg(T[k], EXIT)) && [WRITE, SEND, BASH].every((c) => pg(T[k], c).status === 0));
      const notHalves = ['ownerAfterWork', 'ownerNoRestart', 'beganBefore', 'ended'].every((k) => {
        const e = pg(T[k], EXIT);
        return e.status === 2 && !/PLAN ALREADY APPROVED/.test(e.stdout) && refusedAsPlanMode(pg(T[k], WRITE)) && pg(T[k], SEND).status === 2;
      });
      // The lock, a forced mode, a changed plan file, another session's marker and no marker at all: neither half applies to the restart's plan mode.
      writeFileSync(join(A.home, '.claude', 'PLAN-LOCK'), 'locked\n');
      const lockedOut = refusedAsPlanMode(pg(T.compaction, WRITE)) && pg(T.compaction, EXIT).status === 2 && !/PLAN ALREADY APPROVED/.test(pg(T.compaction, EXIT).stdout);
      rmSync(join(A.home, '.claude', 'PLAN-LOCK'), { force: true });
      const forcedOut = refusedAsPlanMode(pg(T.compaction, { ...WRITE, plan_mode_forced: true })) && !/PLAN ALREADY APPROVED/.test(pg(T.compaction, { ...EXIT, plan_mode_forced: true }).stdout);
      writeFileSync(A.plan, `${text}\nChanged behind the approval.\n`);
      const fileOut = refusedAsPlanMode(pg(T.compaction, WRITE));
      writeFileSync(A.plan, text);
      approvalMarker(A.home, A.plan, text, { session: 'another' });
      const sessionOut = refusedAsPlanMode(pg(T.compaction, WRITE));
      rmSync(marker, { force: true });
      const noneOut = refusedAsPlanMode(pg(T.compaction, WRITE));
      approvalMarker(A.home, A.plan, text);
      // approved-plan-guard: the restart's plan mode is judged as outside plan mode (a command naming the marker is refused), the owner's is stood down for.
      const NAMES = { tool_name: 'Bash', tool_input: { command: 'echo x > ~/.claude/APPROVED-PLAN.json' } };
      const apgJudges = A.guard(T.compaction, { permission_mode: 'plan', ...NAMES }).status === 2
        && A.guard(T.ownerAfterWork, { permission_mode: 'plan', ...NAMES }).status === 0
        && A.guard(T.compaction, { permission_mode: 'plan', plan_mode_forced: true, ...NAMES }).status === 0;
      // The classifier: a mode the caller forced is never the restart's, so a command that writes stays a write for every gate that asks plan-guard what a read is.
      const apgClassifies = A.guard(T.compaction, { permission_mode: 'default', ...NAMES }).status === 2;
      const home0 = process.env.HOME;
      let classified;
      try {
        process.env.HOME = A.home;
        const at0 = { session_id: 'rm', transcript_path: T.compaction, cwd: A.home };
        classified = m.dispatch.planGuardReads({ ...at0, ...BASH }) === false && m.dispatch.planGuardReads({ ...at0, tool_name: 'Read', tool_input: { file_path: A.plan } }) === true;
      } finally { process.env.HOME = home0; }
      // Through hook-dispatch, with a repository wired the way each session repository is: the refusal sets no latch, a write the manager may make goes, and the lock keeps refusing.
      const planText = PLAN(OWN_WORDS);
      const w = world(dir, [], planText);
      writeFileSync(join(w.home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan: w.plan, hash: sha(planText), at: new Date(Date.now() - 698 * 1000).toISOString() }));
      const r = join(w.cwd, 'repo');
      mkdirSync(join(r, '.claude'), { recursive: true });
      spawnSync('git', ['init', '-q', r]);
      writeFileSync(join(r, '.claude', 'settings.json'), JSON.stringify({ hooks: { PreToolUse: [{ matcher: '', hooks: [{ type: 'command', command: '$CLAUDE_PROJECT_DIR/.claude/hooks/plan-guard.sh' }] }] } }));
      const shape = (kind) => [...approvedEntries(w.plan), ...workEntries(-650, 'w1'), ...(kind === 'restart' ? restartOf('compaction', w.plan) : [at(turn(0, 'Go.'), later(-200)), planOn(-199, w.plan)])];
      const notesOf = (s) => join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad', 'status', 'manager.txt');
      const through = (kind) => {
        writeFileSync(w.tr, jsonl(shape(kind)));
        const s = sid('rs');
        const exit = w.call('PreToolUse', { session_id: s, permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { plan: '# x' } });
        const read = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: w.plan } });
        const s2 = sid('rs');
        const notes = w.call('PreToolUse', { session_id: s2, permission_mode: 'plan', tool_name: 'Write', tool_input: { file_path: notesOf(s2), content: 'Outcome: x\n' } });
        return { exit, read, notes, latched: latched(s) };
      };
      const restart = through('restart');
      const owner = through('owner');
      writeFileSync(join(r, '.claude', 'PLAN-LOCK'), 'locked\n');
      const lockedThrough = through('restart');
      rmSync(join(r, '.claude', 'PLAN-LOCK'), { force: true });
      const dispatched = restart.exit.status === 2 && /PLAN ALREADY APPROVED/.test(restart.exit.stderr) && !restart.latched && restart.read.status === 0 && restart.notes.status === 0
        && owner.exit.status === 2 && !/PLAN ALREADY APPROVED/.test(owner.exit.stderr) && owner.notes.status === 2 && /PLAN MODE/.test(owner.notes.stderr)
        && lockedThrough.notes.status === 2 && /PLAN MODE/.test(lockedThrough.notes.stderr) && !/PLAN ALREADY APPROVED/.test(lockedThrough.exit.stderr);
      return stales && owners && changedFile && otherSession && viaRead && halves && notHalves && lockedOut && forcedOut && fileOut && sessionOut && noneOut
        && apgJudges && apgClassifies && classified && dispatched;
    },
  },

  // ---- step 220, change 3: the reply guard's release command passes the manager fence and the latch, and lifts the latch it set (LESSONS §432) ----
  {
    name: 'step220c: the reply guard\'s release command, node reply-guard.mjs --read as one plain command, passes the manager fence and the latch on the main thread as the status command does, and a release of the call the latch was set by lifts that latch, whose refusal says so: a release of another call, a latch another guard set, an agent\'s own latch and a reading the reply guard refuses lift nothing',
    guards: ['release_parse_bad', 'release_fence', 'release_can', 'release_latch', 'release_lift', 'release_lifts_target', 'release_lifts_origin', 'release_lifts_agent', 'release_note', 'release_message'],
    run(m, dir) {
      const self = join(dir, 'reply-guard.mjs');
      const SAID1 = 'the widget stopped answering today';
      const SAID2 = 'the gadget refused the request today';
      const ROUTE = 'the file is readable again after a restart';
      const rel = (target, said = SAID1, route = ROUTE) => `node ${self} --read ${target} --said "${said}" --route "${route}"`;
      // The command itself: one plain reading and nothing else.
      const parsed = m.dispatch.releaseCommand(rel('call:xray0001'));
      const parse = parsed?.target === 'call:xray0001'
        && m.dispatch.releaseCommand(`${rel('call:xray0001')} && touch /tmp/x`) === null
        && m.dispatch.releaseCommand(rel('call:xray0001', 'the $(whoami) words here')) === null
        && m.dispatch.releaseCommand(`${rel('call:xray0001')} extra`) === null
        && m.dispatch.releaseCommand(rel('call:xray0001').replace(self, '/tmp/reply-guard.mjs')) === null
        && m.dispatch.releaseCommand('git status') === null && m.dispatch.releaseCommand('') === null;
      // The manager fence and the check pass it; the same line with anything chained to it is judged as any command.
      const bash = (command) => ({ tool_name: 'Bash', tool_input: { command }, session_id: 'rl', cwd: '/' });
      const fence = (command) => m.dispatch.managerFence(bash(command), { plan: null, classify: () => false });
      const can = (command) => m.dispatch.canCall(bash(command), { plan: null, classify: () => false });
      const passes = fence(rel('call:xray0001')) === null && typeof fence(`${rel('call:xray0001')} && touch /tmp/x`) === 'string'
        && can(rel('call:xray0001')).passesLatch === true && can(rel('call:xray0001')).fence === null && can('git status').passesLatch === false;
      // What lifts a latch: the main thread's, set by the reply guard, and a release of the call its refusal named.
      const R = 'reply-guard (LESSONS §374): this is the Read call that failed, unchanged, and its error has not been read.';
      const named = (t) => `${R}\n  node ${self} --read ${t} --said "<words>" --route "<what is different now>"`;
      const latchOf = (reason, extra = {}) => ({ at: Date.now(), tool: 'Read', agent: null, reason, ...extra });
      const lifts = (latch, target) => m.dispatch.releaseLifts(latch, { target });
      const table = lifts(latchOf(named('call:xray0001')), 'call:xray0001') === true && lifts(latchOf(named('call:xray0001')), 'call:xray0002') === false
        && lifts(latchOf(named('Example.ORG')), 'www.example.org') === true && lifts(latchOf(named('example.org')), 'other.org') === false
        && lifts(latchOf(R), 'call:xray0009') === true
        && lifts(latchOf('MANAGER FENCE (Doctrine §0e): the main thread does not do that.'), 'call:xray0001') === false
        && lifts(latchOf(named('call:xray0001'), { own: true }), 'call:xray0001') === false
        && lifts(null, 'call:xray0001') === false && m.dispatch.releaseLifts(latchOf(named('call:xray0001')), null) === false;
      const message = m.dispatch.latchMessage(latchOf(named('call:xray0001')));
      const says = /release command/.test(message) && /lifts a latch the reply guard set/.test(message);
      // Through the dispatcher, with a failed Read recorded in the reply ledger as the post-tool hook records one.
      process.env.REPLY_LEDGER_DIR = tmp('sg-ledger-');
      try {
        const w = world(dir, [turn(0, GO)], STEPS_PLAN);
        const first = { tool_name: 'Read', tool_input: { file_path: w.plan } };
        const second = { tool_name: 'Read', tool_input: { file_path: join(dirname(w.plan), 'second.md') } };
        const fail = (s, call, n, error) => m.reply.record({ session_id: s, cwd: w.cwd, ...call, tool_use_id: `u-${s}-${n}`, error }, 'PostToolUseFailure');
        const idOf = (call) => m.reply.callHash('Read', call.tool_input, w.cwd).slice(0, 8);
        const ERR1 = `File content could not be returned because ${SAID1}`;
        const ERR2 = `File content could not be returned because ${SAID2}`;
        const go = (s, call) => w.call('PreToolUse', { session_id: s, ...call });
        const send = (s, command) => go(s, { tool_name: 'Bash', tool_input: { command } });
        // The repeat is refused by the reply guard, which sets the latch; the refusal names the release; the latch holds the next call; the release passes and lifts it.
        const sA = sid('rl');
        fail(sA, first, 1, ERR1);
        const repeat = go(sA, first);
        const setA = latched(sA);
        const held = go(sA, first);
        const released = send(sA, rel(`call:${idOf(first)}`));
        const liftedA = !latched(sA);
        const again = go(sA, first);
        const flowA = repeat.status === 2 && /this is the Read call that failed, unchanged/.test(repeat.stderr) && /passes the manager fence and the refusal latch/.test(repeat.stderr)
          && setA && held.status === 2 && /REFUSAL LATCH/.test(held.stderr) && released.status === 0 && liftedA && again.status === 0;
        // A release of another call passes the latch and lifts nothing; the release of the call its refusal named does.
        const sB = sid('rl');
        fail(sB, first, 1, ERR1);
        fail(sB, second, 2, ERR2);
        go(sB, first);
        const wrong = send(sB, rel(`call:${idOf(second)}`, SAID2));
        const keptB = latched(sB);
        const right = send(sB, rel(`call:${idOf(first)}`));
        const flowB = wrong.status === 0 && keptB && right.status === 0 && !latched(sB);
        // A latch another guard set stands under a release the reply guard accepts.
        const sC = sid('rl');
        fail(sC, first, 1, ERR1);
        mkdirSync(process.env.REFUSAL_LATCH_DIR, { recursive: true });
        writeFileSync(join(process.env.REFUSAL_LATCH_DIR, `${sC}.json`), JSON.stringify({ at: Date.now(), tool: 'Bash', agent: null, reason: 'MANAGER FENCE (Doctrine §0e): the main thread does not do that.' }));
        const other = send(sC, rel(`call:${idOf(first)}`));
        const flowC = other.status === 0 && latched(sC);
        // A reading the reply guard refuses (no failed call is on record under that id) lifts nothing, and its refusal does not pass the latch.
        const sD = sid('rl');
        fail(sD, first, 1, ERR1);
        go(sD, first);
        const refusedReading = send(sD, rel('call:xray0001'));
        const flowD = refusedReading.status === 2 && /no failed call/.test(refusedReading.stderr) && latched(sD);
        return parse && passes && table && says && flowA && flowB && flowC && flowD;
      } finally {
        delete process.env.REPLY_LEDGER_DIR;
      }
    },
  },

  // ---- step 220, change 4: the model serving the main thread, and the line a top tier owes under a plan (LESSONS §434) ----
  {
    name: 'step220d: the model serving the main thread is the model field of the newest main-thread reply, never a key inside a tool\'s input, and a top-tier id is one carrying fable or mythos; the status print names it, and the stop guard refuses the first reply under an approval marker after the serving model changes to a top-tier id unless its first line names the tier and says whether the work needs it, with the words to use, once for each change',
    guards: ['tier_top_ids', 'tier_serving_main', 'tier_serving_field', 'tier_serving_synthetic', 'tier_status_line', 'tier_line_top', 'tier_stop_refuse', 'tier_stop_marker', 'tier_stop_once', 'tier_stop_change',
      'tier_stop_names', 'tier_stop_needs', 'tier_stop_words', 'tier_stop_follow', 'tier_stop_top_only'],
    run(m, dir) {
      const FABLE = 'claude-fable-5-1';
      const OPUS = 'claude-opus-5-5';
      // The id shapes the transcript holds, and the top-tier test on each.
      const tiers = [[FABLE, true], ['claude-mythos-6', true], ['Claude-Fable', true], ['fable', true], [OPUS, false], ['claude-sonnet-5-5', false], ['claude-haiku-5-5', false], ['opus', false], ['sonnet', false], ['haiku', false], ['', false], [null, false], ['<synthetic>', false]];
      const topIds = tiers.every(([id, top]) => m.report.isTopTier(id) === top);
      // The model serving the main thread: the newest main-thread entry's own model field and nothing else.
      const asst = (secs, model, extra = {}) => ({ type: 'assistant', timestamp: later(secs), ...extra, message: { role: 'assistant', ...(model ? { model } : {}), content: [{ type: 'text', text: 'x' }] } });
      const viaInput = { type: 'assistant', timestamp: later(-20), message: { role: 'assistant', content: [{ type: 'tool_use', id: 'ti1', name: 'Agent', input: { model: FABLE, prompt: 'x' } }] } };
      const serving = m.report.servingModel([asst(-30, OPUS), asst(-20, FABLE)]) === FABLE && m.report.servingModel([asst(-30, FABLE), asst(-20, OPUS)]) === OPUS
        && m.report.servingModel([asst(-30, OPUS), viaInput]) === OPUS
        && m.report.servingModel([asst(-30, OPUS), asst(-20, FABLE, { isSidechain: true })]) === OPUS && m.report.servingModel([asst(-30, OPUS), asst(-20, FABLE, { agentId: 'a1' })]) === OPUS
        && m.report.servingModel([asst(-30, OPUS), asst(-20, '<synthetic>')]) === OPUS
        && m.report.servingModel([turn(0, 'x')]) === null && m.report.servingModel([]) === null;
      // The status print names it.
      const statusFor = (entries) => {
        const home = tmp('sg-home-');
        const s = sid('st');
        mkdirSync(join(home, '.claude', 'projects', 'p'), { recursive: true });
        writeFileSync(join(home, '.claude', 'projects', 'p', `${s}.jsonl`), jsonl(entries));
        return spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the tier test'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: s } }).stdout ?? '';
      };
      const top = statusFor([asst(-30, OPUS), asst(-20, FABLE)]);
      const lesser = statusFor([asst(-30, FABLE), asst(-20, OPUS), viaInput]);
      const status = new RegExp(`Serving model: ${FABLE}, the top tier\\.`).test(top) && /need no more than Opus/.test(top)
        && new RegExp(`Serving model: ${OPUS}, not the top tier\\.`).test(lesser) && !new RegExp(`Serving model: ${FABLE}`).test(lesser)
        && /Serving model: not read/.test(statusFor([turn(0, 'x')]));
      // The stop guard, under an approval marker (a plan with no steps, so nothing else holds the turn).
      const w = world(dir, [], PLAN(OWN_WORDS));
      const marker = join(w.home, '.claude', 'APPROVED-PLAN.json');
      const markerText = readFileSync(marker, 'utf8');
      const PLAINLY = 'A short note about the toolbar change, written plainly.';
      const stop = (s, entries, extra = {}) => {
        writeFileSync(w.tr, jsonl(entries));
        return spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: s, transcript_path: w.tr, hook_event_name: 'Stop', ...extra }), encoding: 'utf8', env: { ...process.env, HOME: w.home } });
      };
      const WORDS = m.report.tierWords(FABLE);
      const refused = (r) => r.status === 2 && /STOP REFUSED/.test(r.stderr) && r.stderr.includes(FABLE) && r.stderr.includes(WORDS);
      // 1. The first reply on the top tier, without the line, is refused with the words to use, and the line is owed.
      const s1 = sid('tr');
      const r1 = stop(s1, [modelReply(-10, PLAINLY, FABLE)]);
      const owed = refused(r1) && m.report.readTier(s1)?.model === FABLE && m.report.readTier(s1)?.told === false;
      // 2. A reply whose first line has the words passes and discharges it; a later reply without them is not held again.
      const r2 = stop(s1, [modelReply(-10, PLAINLY, FABLE), modelReply(-5, `${WORDS}\n${PLAINLY}`, FABLE)]);
      const r3 = stop(s1, [modelReply(-10, PLAINLY, FABLE), modelReply(-5, `${WORDS}\n${PLAINLY}`, FABLE), modelReply(-2, PLAINLY, FABLE)]);
      const once = r2.status === 0 && m.report.readTier(s1)?.told === true && r3.status === 0;
      // 3. A change to a lesser tier owes nothing, and a change back to the top tier owes the line again.
      const s3 = sid('tr');
      const r4 = stop(s3, [modelReply(-10, PLAINLY, OPUS)]);
      const lessOwes = r4.status === 0 && m.report.readTier(s3)?.model === OPUS && m.report.readTier(s3)?.told === true;
      const r5 = stop(s3, [modelReply(-10, PLAINLY, OPUS), modelReply(-5, PLAINLY, FABLE)]);
      const changed = refused(r5) && m.report.readTier(s3)?.model === FABLE && m.report.readTier(s3)?.told === false;
      // 4. With no approval marker nothing is owed, though the top tier serves; the first reply once a plan is approved owes it.
      const s4 = sid('tr');
      rmSync(marker, { force: true });
      const r6 = stop(s4, [modelReply(-10, PLAINLY, FABLE)]);
      const noMarker = r6.status === 0 && m.report.readTier(s4)?.told === false;
      writeFileSync(marker, markerText);
      const r7 = stop(s4, [modelReply(-10, PLAINLY, FABLE), modelReply(-5, PLAINLY, FABLE)]);
      const afterButton = refused(r7);
      // 5. The line has to name the tier and say whether the work needs it: naming alone, or needing alone, is not the line; a line that does both, either way, is.
      const tries = (text) => stop(sid('tr'), [modelReply(-10, text, FABLE)]).status;
      const naming = tries(`Serving model: ${FABLE}.\n${PLAINLY}`) === 2 && tries(`The work does not need anything special here.\n${PLAINLY}`) === 2
        && tries(`Serving model: ${FABLE}, the top tier, and the work needs it because the review is a judgement.\n${PLAINLY}`) === 0
        && tries(`Stopping here: open for you is the choice below. The top tier is serving and this work does not need it.\n${PLAINLY}`) === 0;
      // 6. A follow-up that carries the line discharges the record, so the next stop is not held for it again.
      const s6 = sid('tr');
      stop(s6, [modelReply(-10, PLAINLY, FABLE)]);
      const f1 = stop(s6, [modelReply(-10, PLAINLY, FABLE), modelReply(-5, WORDS, FABLE)], { stop_hook_active: true });
      const followUp = f1.status === 0 && m.report.readTier(s6)?.told === true;
      return topIds && serving && status && owed && once && lessOwes && changed && noMarker && afterButton && naming && followUp;
    },
  },
];

const PLANTS = {
  enqueue_count: ['        size++;\n', '\n', 'pending-guard.mjs'],
  dequeue_count: ["      } else if (e.operation === 'dequeue') {\n        size = Math.max(0, size - 1);", "      } else if (e.operation === 'dequeue') {\n", 'pending-guard.mjs'],
  text_match: ['      if (!x.done && x.key && (t.includes(x.key)', '      if (false && !x.done && x.key && (t.includes(x.key)', 'pending-guard.mjs'],
  harness_tag: ['const HARNESS_TAG = /^\\s*<(?:task-notification|', 'const HARNESS_TAG = /^NEVER<(?:task-notification|', 'pending-guard.mjs'],
  harness_handback: ['agent-message\\b|', '', 'pending-guard.mjs'],
  harness_bare_handback: ['|^\\s*\\[Subagent hand-back\\]/i;', '/i;', 'pending-guard.mjs'],
  remove_text: ['        if (c) take((x) => x.key === norm(c));\n', '\n', 'pending-guard.mjs'],
  stop_subagent: ['  if (p.agent_id && !stop) return null;', '  if (p.agent_id) return null;', 'pending-guard.mjs'],
  subagent_free: ['  if (p.agent_id && !stop) return null;', '  if (false && p.agent_id && !stop) return null;', 'pending-guard.mjs'],
  since: ['      if (since && Number.isFinite(at) && at < since) continue;\n', '\n', 'pending-guard.mjs'],
  verbatim: ['---\\n${m.text}`', '---\\n(a message)`', 'pending-guard.mjs'],
  dispatch_pending: ['    if (pg.deny) return refuse(pg.reason, false);\n', '\n', 'hook-dispatch.mjs'],
  withdraw_re: ['    const hits = s.match(WITHDRAW);', '    const hits = null;', 'keep-info-guard.mjs'],
  commit_parse: ["    if (w[k] !== 'commit') continue;", "    if (w[k] !== 'commit-never') continue;", 'keep-info-guard.mjs'],
  fetch_window: ['    if (!fetch || !specific) return;', '    if (!specific) return;', 'keep-info-guard.mjs'],
  dropped: ['    if (kept.has(d)) continue;\n', '    continue;\n', 'keep-info-guard.mjs'],
  lift: ["(?![A-Za-z0-9])`, 'i').test(clause))) return true;", "(?![A-Za-z0-9])`, 'i').test(clause))) return false;", 'keep-info-guard.mjs'],
  negation: ['      if (!REMOVE.test(clause) || NEGATED.test(clause)) continue;', '      if (!REMOVE.test(clause)) continue;', 'keep-info-guard.mjs'],
  old_sentences: ['    if (old.has(s)) return;\n', '\n', 'keep-info-guard.mjs'],
  all_mode: ["if (x.includes('a')) all = true; ", '', 'keep-info-guard.mjs'],
  segment_pick: ['  const seg = last.some((x) => !x.reply) || segs.length < 2 ? last : segs.at(-2);', '  const seg = last;', 'compact-recall.mjs'],
  dispatch_recall: ['    if (recall.block) printed.push(recall.block);\n', '\n', 'hook-dispatch.mjs'],
  // The prints after a compaction are bounded: the newest ten of the messages since the previous compaction, the rest counted and every one filed.
  recall_after_reply: ['  for (let i = seg.length - 1; i >= 0; i--) if (seg[i].reply) { lastReply = i; break; }\n', '\n', 'compact-recall.mjs'],
  recall_prefilter: ['const holdsText = line.includes(\'"assistant"\') && line.includes(\'"text"\');', 'const holdsText = false;', 'compact-recall.mjs'],
  recall_cap: ['export const SHOWN = 10;', 'export const SHOWN = 100;', 'compact-recall.mjs'],
  recall_newest: ['  const shown = msgs.slice(-SHOWN);', '  const shown = msgs.slice(0, SHOWN);', 'compact-recall.mjs'],
  recall_rest: ['    + `Not printed here: ${rest} older (the ${shown.length} printed are the newest). `\n', '\n', 'compact-recall.mjs'],
  recall_file_write: ['    writeFileSync(file, msgs.map(', '    void (file, msgs.map(', 'compact-recall.mjs'],
  recall_file_all: ['writeFileSync(file, msgs.map(', 'writeFileSync(file, msgs.slice(-SHOWN).map(', 'compact-recall.mjs'],
  recall_file_answered: ['writeFileSync(file, msgs.map(', 'writeFileSync(file, msgs.filter((m) => m.afterReply !== false).map(', 'compact-recall.mjs'],
  recall_for: ['  const file = saveRecall(path, msgs, dir ? { dir, n } : {});', "  const file = '';", 'compact-recall.mjs'],
  recall_file_name: ["`compaction-${Number(opts.n) || 1}.txt`", '`compaction-1.txt`', 'compact-recall.mjs'],
  recall_number: ['  return { msgs, n: seg === last ? segs.length : segs.length - 1 };', '  return { msgs, n: segs.length };', 'compact-recall.mjs'],
  // The filed messages are read whole after a compaction (LESSONS §416): where they are written, the marker, the gate and its exits.
  recall_scratchpad: ["pad ? join(pad, 'recall') : ''", "''", 'hook-dispatch.mjs'],
  recall_due_wired: ["      try { printed.push(markRecallDue(p, recall.file)); } catch { /* the print above stands; the gate is lost for this start */ }\n", '\n', 'hook-dispatch.mjs'],
  recall_due_line: ["OWNER'S MESSAGES DUE (Doctrine §0e rule 2): the print above", "OWNER'S WORDS FILED (Doctrine §0e rule 2): the print above", 'hook-dispatch.mjs'],
  recall_gate_wired: ['      if (recall) return refuse(recall, false);\n', '\n', 'hook-dispatch.mjs'],
  recall_gate_no_latch: ['if (recall) return refuse(recall, false);', 'if (recall) return refuse(recall);', 'hook-dispatch.mjs'],
  recall_gate_marker: ["  try { due = JSON.parse(readFileSync(recallDueFile(p), 'utf8')); } catch { return null; }", "  try { due = JSON.parse(readFileSync(recallDueFile(p), 'utf8')); } catch { due = { at: 0 }; }", 'hook-dispatch.mjs'],
  recall_gate_missing: ['  if (!file || !existsSync(file)) return null;', '  if (!file) return null;', 'hook-dispatch.mjs'],
  recall_gate_whole: ['if (pageRead(list, Number(due.at) || 0, file)) { rmSync(recallDueFile(p)', 'if (true) { rmSync(recallDueFile(p)', 'hook-dispatch.mjs'],
  recall_gate_after: ['pageRead(list, Number(due.at) || 0, file)', 'pageRead(list, 0, file)', 'hook-dispatch.mjs'],
  recall_gate_clears: ['{ rmSync(recallDueFile(p), { force: true }); return null; }', '{ return null; }', 'hook-dispatch.mjs'],
  recall_gate_agent: ["  if (p.agent_id || p.tool_name === 'TaskStop') return null;\n  let due;\n  try { due = JSON.parse(readFileSync(recallDueFile(p)", "  if (p.tool_name === 'TaskStop') return null;\n  let due;\n  try { due = JSON.parse(readFileSync(recallDueFile(p)", 'hook-dispatch.mjs'],
  recall_gate_taskstop: ["  if (p.agent_id || p.tool_name === 'TaskStop') return null;\n  let due;\n  try { due = JSON.parse(readFileSync(recallDueFile(p)", "  if (p.agent_id) return null;\n  let due;\n  try { due = JSON.parse(readFileSync(recallDueFile(p)", 'hook-dispatch.mjs'],
  recall_gate_read_exempt: ['  if (isRead(p, opts.classify)) return null;\n  return `RECALL GATE', '  return `RECALL GATE', 'hook-dispatch.mjs'],
  // The compaction is said (LESSONS §416): the marker with its time, the first status, the page, and the first reply.
  compacted_marker_wired: ["    try { markCompacted(String(p.session_id ?? '')); } catch { /* the notice is lost for this start */ }", '    void 0;', 'hook-dispatch.mjs'],
  compacted_marker_time: ['writeFileSync(f, JSON.stringify({ at, printed: false, told: false }));', 'writeFileSync(f, JSON.stringify({ at: 0, printed: false, told: false }));', 'report.mjs'],
  compacted_words_time: ['`Compacted at ${californiaTime(d)} California time', '`Compacted at ${d.toISOString().slice(11, 16)} California time', 'report.mjs'],
  compacted_status_print: ["      console.log(`${compactedWords(compacted)} This session's context was replaced by a summary at that time.`);\n      console.log('');\n", '', 'report.mjs'],
  compacted_status_once: ['      setCompacted(sid, { printed: true });\n', '', 'report.mjs'],
  compacted_page_line: ['${st.compacted ? `<p class="asof">', '${false ? `<p class="asof">', 'report.mjs'],
  compact_stop_check: ['if (compacted && !compacted.told) {', 'if (false && compacted && !compacted.told) {', 'stop-guard.mjs'],
  compact_stop_time: ['if (/compact/i.test(open) && open.includes(time)) {', 'if (/compact/i.test(open) && true) {', 'stop-guard.mjs'],
  compact_stop_word: ['if (/compact/i.test(open) && open.includes(time)) {', 'if (open.includes(time)) {', 'stop-guard.mjs'],
  compact_stop_first_line: ["const open = reply.split('\\n').map((l) => l.trim()).find(Boolean) ?? '';", 'const open = reply;', 'stop-guard.mjs'],
  compact_stop_told: ['    try { setCompacted(payloadSession, { told: true }); } catch { /* held again at the next stop */ }', '    void 0;', 'stop-guard.mjs'],
  compact_stop_followup: ['said.includes(californiaTime(new Date(c.at)))) setCompacted(payloadSession, { told: true });', 'said.includes(californiaTime(new Date(c.at)))) void 0;', 'stop-guard.mjs'],
  recall_reply_text: ["    && e.message.content.some((b) => b?.type === 'text' && String(b.text ?? '').trim());", '    && e.message.content.some(() => true);', 'compact-recall.mjs'],
  recall_reply_sidechain: ['e.isSidechain !== true && ', '', 'compact-recall.mjs'],
  plan_tool_record: ['    if (!PLAN_TOOL.test(tool) && !NOT_A_FAILURE.test(out)', '    if (!NOT_A_FAILURE.test(out)', 'reply-guard.mjs'],
  plan_tool_catchup: ["if (b.is_error && !PLAN_TOOL.test(u.name ?? '') && ", 'if (b.is_error && ', 'reply-guard.mjs'],
  plan_tool_repeat: ['  if (!PLAN_TOOL.test(tool)) for (let i = ev.length - 1;', '  for (let i = ev.length - 1;', 'reply-guard.mjs'],
  plan_guard_read: ['  if (reading && !reading.bad) process.exit(0);', '', 'plan-guard.mjs'],
  plan_guard_asked: ['    if (asked) deny(asked);\n', '\n', 'plan-guard.mjs'],
  plan_agent_taskstop: ["if (tool === 'TaskStop' && p.agent_id) process.exit(0);\n", '\n', 'plan-guard.mjs'],
  asked_copy: ['  if (copiesOwner(m[1], owner)) {', '  if (false) {', 'plan-guard.mjs'],
  scope_record_copy: ['  if (copiesOwner(verdict, owner) || copiesOwner(finding, owner)) {', '  if (false) {', 'plan-scope-check.mjs'],
  copies_owner: ['  if (!runs.size) return false;', '  return false;', 'transcript-tail.mjs'],
  next_work: ['const nextHit = NEXT_WORK.find((re) => re.test(reply));', 'const nextHit = undefined;', 'stop-guard.mjs'],
  drop_checks: ['const dropHit = DROP_CHECKS.find((re) => re.test(reply));', 'const dropHit = undefined;', 'stop-guard.mjs'],
  running_owed: ['if (running.length && !queuedOwner.length) {', 'if (running.length) {', 'stop-guard.mjs'],
  running_work: ["try { running = (runningWork({ session_id: hook.session_id, transcript_path: path }) ?? []).filter(HOLDS_STOP); } catch { running = []; }", 'running = [];', 'stop-guard.mjs'],
  // A running agent does not hold the turn; a refusal's follow-up is the correction only.
  agents_hold_stop: ['const HOLDS_STOP = (x) => !/^agent\\b/.test(x);', 'const HOLDS_STOP = () => true;', 'stop-guard.mjs'],
  stop_follow_up: ['  process.stderr.write(message + FOLLOW_UP);', '  process.stderr.write(message);', 'stop-guard.mjs'],
  stop_repeat: ['      if (again.length) {', '      if (false) {', 'stop-guard.mjs'],
  stop_repeat_once: ['!rec.repeated && ', '', 'stop-guard.mjs'],
  stop_repeat_record: ['writeFileSync(refusedFile(), JSON.stringify({ at: Date.now(), lines, reply, repeated: false }));', 'void 0;', 'stop-guard.mjs'],
  stop_repeat_turn: ['&& Number(rec.at) >= ownerAt) {', '&& true) {', 'stop-guard.mjs'],
  stop_repeat_min: ['const REPEAT_MIN = 30;', 'const REPEAT_MIN = 1;', 'stop-guard.mjs'],

  // The manager fence and the dispatch gate.
  manager_fence: ['  return `${head} It is not a read;', '  return null; // ', 'hook-dispatch.mjs'],
  fence_artifact: ["if (a === 'publish' && plain && isStatusPage(input.file_path, p.session_id)) return null;", "if (a === 'publish') return null;", 'hook-dispatch.mjs'],
  fence_quickstart: ["    if (['read', 'list', 'open'].includes(a)) return null;", "    if (['read', 'list', 'open', 'quickstart'].includes(a)) return null;", 'hook-dispatch.mjs'],
  fence_plan_file: ["if (f && f.endsWith('.md') && dirname(resolve(f)) === resolve(homedir(), '.claude', 'plans')) return null;", "if (f && f.endsWith('.md')) return null;", 'hook-dispatch.mjs'],
  fence_enter_plan: [" || tool === 'EnterPlanMode') return null;", ') return null;', 'hook-dispatch.mjs'],
  fence_status_write: ['    if (f && isStatusPage(f, p.session_id)) return null;\n', '\n', 'hook-dispatch.mjs'],
  manager_wired: ['    const fence = managerFence(p);\n    if (fence) return refuse(fence, !fence.includes(FENCE_NO_LATCH));\n', '\n', 'hook-dispatch.mjs'],
  fence_no_latch: ['    if (fence) return refuse(fence, !fence.includes(FENCE_NO_LATCH));', '    if (fence) return refuse(fence);', 'hook-dispatch.mjs'],
  // The manager fence passes a read only of the record.
  read_fence: ['    return outside === null ? null : ', '    return null; // ', 'hook-dispatch.mjs'],
  read_fence_pad: ["  if (inScratchpad(join(a, '_'), p.session_id)) return true;\n", '', 'hook-dispatch.mjs'],
  read_fence_plans: ["  if (a === join(dot, 'plans') || dirname(a) === join(dot, 'plans')) return true;\n", '', 'hook-dispatch.mjs'],
  read_fence_plan_file: ['  if (plan && a === resolve(String(plan))) return true;\n', '', 'hook-dispatch.mjs'],
  read_fence_doctrine: ["  if (a === join(dot, 'hub', 'DOCTRINE.md') || a === join(HUB, 'DOCTRINE.md')) return true;\n", '', 'hook-dispatch.mjs'],
  read_fence_transcript: ['  if (p.transcript_path && a === resolve(String(p.transcript_path))) return true;\n', '', 'hook-dispatch.mjs'],
  read_fence_transcript_name: ["  if (p.session_id && dirname(dirname(a)) === join(dot, 'projects') && basename(a) === `${p.session_id}.jsonl`) return true;\n", '', 'hook-dispatch.mjs'],
  read_fence_repo_files: ["  if (['CLAUDE.md', 'NOTES.md', '.plan-scope', '.claude/PLAN', '.branch-guard', 'IR-SCIENCE.md', 'docs/decisions'].includes(rel)) return true;\n", '', 'hook-dispatch.mjs'],
  read_fence_hub_files: ["  return rel === 'DOCTRINE.md' || rel === 'LESSONS.md' || rel === AIM_FILE || rel === RULES_FILE || ['lessons', 'plans'].some(", "  return false && ['lessons', 'plans'].some(", 'hook-dispatch.mjs'],
  read_fence_aim_review: ['rel === AIM_FILE || ', '', 'hook-dispatch.mjs'],
  read_fence_read: ["    return f && of(f) ? null : (f ? `${f} is not of the record` : 'a Read names no file');", '    return null;', 'hook-dispatch.mjs'],
  read_fence_grep: ['    return of(f || cwd) ? null : `${f || `the working directory ${cwd}`} is not of the record`;', '    return null;', 'hook-dispatch.mjs'],
  read_fence_glob: ['    return of(target) ? null : `${target} is not of the record`;', '    return null;', 'hook-dispatch.mjs'],
  read_fence_bash: ["  if (tool === 'Bash') return bashOutsideRecord(String(input.command ?? ''), cwd, of);", "  if (tool === 'Bash') return null;", 'hook-dispatch.mjs'],
  read_fence_bash_dynamic: ["    if (c === '$' || c === '`') return", '    if (false) return', 'hook-dispatch.mjs'],
  read_fence_bash_pipe: ['    if (!named && !piped && !READS_NO_FILE.has(ws[0])) return', '    if (!named && !READS_NO_FILE.has(ws[0])) return', 'hook-dispatch.mjs'],
  read_fence_bash_nofile: ['    if (!named && !piped && !READS_NO_FILE.has(ws[0])) return', '    if (!named && !piped) return', 'hook-dispatch.mjs'],
  read_fence_bash_bare: ['      if (there) { if (!of(w)) return `${w} is not of the record`; named++; }', '      if (there) { named++; }', 'hook-dispatch.mjs'],
  read_fence_bash_flag: ["const eq = w.indexOf('='); if (eq < 0) continue; w = w.slice(eq + 1); if (!w) continue; }", 'continue; }', 'hook-dispatch.mjs'],
  read_fence_connector: ['  if (SOURCE_READS.has(tool)) return', '  if (false) return', 'hook-dispatch.mjs'],
  // The manager fence passes a SendUserFile of files in the session scratchpad, and no other.
  send_file_branch: ["  if (tool === 'SendUserFile') {", '  if (false) {', 'hook-dispatch.mjs'],
  send_file: ['    if (named.length && !outside.length) return null;', '    if (true) return null;', 'hook-dispatch.mjs'],
  send_file_pad: ['    const outside = named.filter((f) => !inScratchpad(absOf(f, cwd), p.session_id));', '    const outside = [];', 'hook-dispatch.mjs'],
  send_file_named: ['    if (named.length && !outside.length) return null;', '    if (!outside.length) return null;', 'hook-dispatch.mjs'],
  dispatch_prompt: ['  if (n === null) return refusal(`${head} Send exactly:', '  if (n === null) return null; // ', 'hook-dispatch.mjs'],
  dispatch_step: ['  if (!planSteps(plan.text).includes(n))', '  if (false)', 'hook-dispatch.mjs'],
  dispatch_workflow: ["  if (tool === 'Workflow') return workflowGate(", "  if (false) return workflowGate(", 'hook-dispatch.mjs'],
  dispatch_no_plan: ['  if (!plan) return refusal(`${head} No approved plan', '  if (false) return refusal(`${head} No approved plan', 'hook-dispatch.mjs'],
  dispatch_custom: ['  if (type && !BUILTIN_AGENT_TYPES.has(type)) {', '  if (false) {', 'hook-dispatch.mjs'],
  plan_hash: ["    if (createHash('sha256').update(bytes).digest('hex') !== String(mk.hash)) return null;\n", '\n', 'hook-dispatch.mjs'],
  // The approval state, printed by every status and every dispatch refusal.
  approval_status_print: ['  console.log(approval);\n', '\n', 'report.mjs'],
  approval_match: ['  const match = now === String(mk.hash);', '  const match = true;', 'report.mjs'],
  dispatch_approval_state: ['  const refusal = (t) => `${t}\\n${approvalBlock()}`;', '  const refusal = (t) => t;', 'hook-dispatch.mjs'],
  // The report gate, whose refusal does not latch.
  report_no_latch: ['    if (rg.deny) return refuse(rg.reason, false);', '    if (rg.deny) return refuse(rg.reason);', 'hook-dispatch.mjs'],
  report_gate_wired: ['    if (rg.deny) return refuse(rg.reason, false);\n', '\n', 'hook-dispatch.mjs'],
  // A status is due only while something the session started runs.
  // A status is due when an agent has ended since the last one, and at no other time.
  status_gate_ended: ['  if (!ended || !ended.length) return null;\n', '  return null;\n', 'report.mjs'],
  status_after_stamp: ['    if (end && end.at > stampAt) out.push(', '    if (end) out.push(', 'report.mjs'],
  status_mtime_skip: ['    try { if (statSync(a.file).mtimeMs <= stampAt) continue; } catch { continue; }', '    try { statSync(a.file); } catch { continue; }', 'report.mjs'],
  status_unreadable: ['  if (!f) return null;\n  const found = agentFiles(f.agents);', "  if (!f) return [{ id: 'unknown', description: '', how: 'unreadable', at: Date.now() }];\n  const found = agentFiles(f.agents);", 'report.mjs'],
  // The refusal latch.
  latch_write: ["    if (latch && event === 'PreToolUse') { try { setLatch(p, why); }", '    if (false) { try { setLatch(p, why); }', 'hook-dispatch.mjs'],
  latch_stop_event: ["    if (latch && event === 'PreToolUse') { try {", '    if (latch) { try {', 'hook-dispatch.mjs'],
  latch_refuse: ['    if (latch && !status && !mainStop && !release && !reportWrite) return refuse(latchMessage(latch), false);\n', '\n', 'hook-dispatch.mjs'],
  latch_return: ["    if (p.agent_id && AGENT_RETURN.has(String(p.tool_name ?? ''))) return 0;\n", '\n', 'hook-dispatch.mjs'],
  latch_status: ['    if (latch && !status && !mainStop && !release && !reportWrite) return', '    if (latch && !mainStop && !release && !reportWrite) return', 'hook-dispatch.mjs'],
  latch_repo: ['        if (o.deny) return refuse(o.reason, !noLatchRepoRefusal(shim, p, o.reason));\n', "        if (o.deny) { process.stderr.write(o.reason + '\\n'); return 2; }\n", 'hook-dispatch.mjs'],
  latch_clear: ['if (list.some((e, i) => isOwnerMessage(e) && typedAt(list, i) > at)) {', 'if (list.some((e, i) => typedAt(list, i) > at)) {', 'hook-dispatch.mjs'],
  latch_after: ['isOwnerMessage(e) && typedAt(list, i) > at)', 'isOwnerMessage(e))', 'hook-dispatch.mjs'],
  latch_typed: ['  for (let j = i - 1; t && j >= 0; j--) {', '  for (let j = i - 1; false && j >= 0; j--) {', 'hook-dispatch.mjs'],
  dispatch_epipe: ['  if (r.error && r.status === null) return', '  if (r.error) return', 'hook-dispatch.mjs'],
  latch_stop: ['try { if (latchStanding(hook)) process.exit(0); }', 'try { if (false) process.exit(0); }', 'stop-guard.mjs'],
  // Refused names.
  names_record: ['  recordRefused([...missing]);\n', '\n', 'plan-guard.mjs'],
  names_hold: ['    if (held) deny(held);\n', '\n', 'plan-guard.mjs'],
  names_after: [".filter((e) => Date.parse(e?.timestamp ?? '') > Number(x.at))", '', 'plan-guard.mjs'],
  names_new: [' && !marked(x.name));', ');', 'plan-guard.mjs'],
  // The push gate.
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
  push_wired: ['`node "${join(HUB, \'push-guard.mjs\')}"`, ', '', 'hook-dispatch.mjs'],
  // The plan fence.
  fence_write: ['    return `${HEAD} ${tool} to', '    return null; // ', 'plan-fence.mjs'],
  fence_scratch: ['${esc(sid)}/scratchpad/.', '[^/]+/scratchpad/.', 'hook-dispatch.mjs'],
  fence_bash: ['    return `${HEAD} "${w.join(', '    continue; // ', 'plan-fence.mjs'],
  fence_split: ['  const segs = commandsIn(shell);', '  const segs = [{ words: shell.trim().split(/ +/), depth: 0 }];', 'plan-fence.mjs'],
  fence_cd: ["    if (prog === 'cd' || prog === 'pushd' || prog === 'popd') {", '    if (false) {', 'plan-fence.mjs'],
  fence_git_c: ["    if (w[0] === 'git') while (w[1] === '-C'", "    if (false) while (w[1] === '-C'", 'plan-fence.mjs'],
  fence_redirect: ['    if (!allowedPath(abs)) return `${HEAD} A redirect', '    if (false) return `${HEAD} A redirect', 'plan-fence.mjs'],
  fence_nested: ['  for (const s of segs) {\n    const { words, targets: t }', '  for (const s of segs.filter((x) => x.depth === 0)) {\n    const { words, targets: t }', 'plan-fence.mjs'],
  fence_dotdot: [".some((r) => !r.startsWith('..') && !isAbsolute(r) && r.startsWith(nd) && r.length > nd.length);", '.some(() => String(word).startsWith(nd));', 'plan-fence.mjs'],
  fence_proc: ['  if (red.proc) return', '  if (false) return', 'plan-fence.mjs'],
  fence_every: ['    return `${HEAD} ${tool} is not a read', '    return null; // ', 'plan-fence.mjs'],
  fence_return: ['  if (AGENT_RETURN.has(tool)) return null;\n', '\n', 'plan-fence.mjs'],
  fence_taskstop: ["  if (tool === 'TaskStop') return null;\n", '\n', 'plan-fence.mjs'],
  fence_label: [' || !labelNames(repo, root)) return false;', ') return false;', 'plan-fence.mjs'],
  fence_live_hub: ['  if (inLiveHub(target)) return false;\n', '\n', 'plan-fence.mjs'],
  fence_wired: ['`node "${join(HUB, \'plan-fence.mjs\')}"`, ', '', 'hook-dispatch.mjs'],
  // The doctrine gate.
  doctrine_refuse: ['  return `DOCTRINE GATE', '  return null; // `DOCTRINE GATE', 'doctrine-read-guard.mjs'],
  doctrine_cover: ['if (to > 0 && rec.lines.size >= to && Array.from({ length: to }, (_, k) => k + 1).every((n) => rec.lines.has(n))) return path;', 'if (rec.lines.size > 0) return path;', 'doctrine-read-guard.mjs'],
  // A startup, a clear and a compaction make every line due, and a resume owes the read only when the transcript since its
  // last compaction does not hold the whole file as it stands now (LESSONS §398).
  doctrine_compact_full: ["export const HELD_SOURCES = ['resume'];", "export const HELD_SOURCES = ['resume', 'compact'];", 'doctrine-read-guard.mjs'],
  doctrine_startup_full: ["export const HELD_SOURCES = ['resume'];", "export const HELD_SOURCES = ['resume', 'startup', 'clear'];", 'doctrine-read-guard.mjs'],
  doctrine_lines_line: ['until Read results on ${doctrine} cover ${linesDue(n)}, the main thread', 'until Read results on ${doctrine} cover every line, the main thread', 'doctrine-read-guard.mjs'],
  doctrine_lines_refusal: ['cover ${linesDue(lineCount(doctrine))}, the main thread', 'cover every line, the main thread', 'doctrine-read-guard.mjs'],
  doctrine_resume_decide: ["HELD_SOURCES.includes(due.source ?? '') ? heldNow(list, doctrine)", 'false ? heldNow(list, doctrine)', 'doctrine-read-guard.mjs'],
  doctrine_held_line: ["HELD_SOURCES.includes(p.source ?? '') && heldNow(", 'false && heldNow(', 'doctrine-read-guard.mjs'],
  doctrine_held_any: ['return readInFull(afterLastCompaction(entries), 0, doctrine, n) !== null;', 'return entries.length > 0;', 'doctrine-read-guard.mjs'],
  doctrine_count_convention: ["return text ? text.split('\\n').length : null;", "return text ? text.replace(/\\n$/, '').split('\\n').length : null;", 'doctrine-read-guard.mjs'],
  doctrine_held_boundary: ['  return entries.slice(at + 1);', '  return entries;', 'doctrine-read-guard.mjs'],
  doctrine_held_current: ['if (current !== null && Number(file.totalLines) > 0 && Number(file.totalLines) !== current) continue;', 'if (false) continue;', 'doctrine-read-guard.mjs'],
  doctrine_uncountable: ['if (n === null) return false;', 'if (false) return false;', 'doctrine-read-guard.mjs'],
  doctrine_resumed_word: ["source === 'resume' ? 'was resumed' : 'started'", "'started'", 'doctrine-read-guard.mjs'],
  doctrine_marker_source: ["JSON.stringify({ at: Date.now(), source: p.source ?? '' })", "JSON.stringify({ at: Date.now(), source: '' })", 'doctrine-read-guard.mjs'],
  // The brief prints the lessons' titles at a startup only, and a count and a folder where it cannot tell.
  brief_bounded: ["  const bounded = start.source === null || start.source === 'compact' || start.source === 'resume';", "  const bounded = start.source === null || start.source === 'resume';", 'session-brief.mjs'],
  brief_resume: ["  const bounded = start.source === null || start.source === 'compact' || start.source === 'resume';", "  const bounded = start.source === null || start.source === 'compact';", 'session-brief.mjs'],
  brief_unreadable: ["  const bounded = start.source === null || start.source === 'compact' || start.source === 'resume';", "  const bounded = start.source === 'compact' || start.source === 'resume';", 'session-brief.mjs'],
  brief_startup_full: ["  const bounded = start.source === null || start.source === 'compact' || start.source === 'resume';", '  const bounded = true;', 'session-brief.mjs'],
  brief_missing_marker: ['if (!existsSync(f)) return { source: null, why:', "if (!existsSync(f)) return { source: '', why:", 'session-brief.mjs'],
  brief_no_payload: ['if (!id) return { source: null, why:', "if (!id) return { source: '', why:", 'session-brief.mjs'],
  brief_marker_path: ['`${id}.json`);', '`${id}.txt`);', 'session-brief.mjs'],
  brief_sanitize: ["const id = String(payload?.session_id ?? '').replace(/[^A-Za-z0-9_-]/g, '_');", "const id = String(payload?.session_id ?? '');", 'session-brief.mjs'],
  brief_stdin: ['  if (process.stdin.isTTY) return {};\n', '  return {};\n', 'session-brief.mjs'],
  brief_why: ['${start.source === null ? start.why :', "${start.source === null ? 'unknown' :", 'session-brief.mjs'],
  brief_folder: ['each is its own file in ${lessonDir}/:', 'each is its own file in noahjefferson/lessons/:', 'session-brief.mjs'],
  doctrine_after: ['!(t > since)', '!(t > 0)', 'doctrine-read-guard.mjs'],
  doctrine_hub: ['  const isDoctrine = (f) => resolve(String(f)) === resolve(doctrine);', '  const isDoctrine = (f) => /DOCTRINE\\.md$/.test(String(f));', 'doctrine-read-guard.mjs'],
  doctrine_due: ["  if (event === 'SessionStart' && !p.agent_id) {", '  if (false) {', 'hook-dispatch.mjs'],
  doctrine_wired: ['`node "${join(HUB, \'doctrine-read-guard.mjs\')}"`]', ']', 'hook-dispatch.mjs'],
  doctrine_line: ['  if (dueLine) printed.push(dueLine);\n', '\n', 'hook-dispatch.mjs'],
  // The state-claim gate (rule 15).
  claim_refuse: ['  if (claimed) {', '  if (false) {', 'stop-guard.mjs'],
  claim_read: ['      if (/^PreToolUse:\\S+ hook error/.test(text)) continue;\n      return true;', '      continue;', 'stop-guard.mjs'],
  claim_turn: ['&& !isResult) start = i;', '&& !isResult) start = -1;', 'stop-guard.mjs'],
  claim_hook_result: ['      if (/^PreToolUse:\\S+ hook error/.test(text)) continue;\n', '\n', 'stop-guard.mjs'],
  claim_error_result: ["      if (b?.type !== 'tool_result' || b.is_error) continue;\n      const text", "      if (b?.type !== 'tool_result') continue;\n      const text", 'stop-guard.mjs'],
  claim_think: ['!(THINK.test(s) && asksCheck)', 'true', 'stop-guard.mjs'],
  claim_ask: ['  const asksCheck = ASKS_CHECK.test(reply);', '  const asksCheck = true;', 'stop-guard.mjs'],
  claim_question: ['.find((s) => !NOT_A_STATEMENT.test(s) && CLAIM.test(s)', '.find((s) => CLAIM.test(s)', 'stop-guard.mjs'],
  // The agents a status prints.
  agents_block: ['  console.log(block);\n', '\n', 'report.mjs'],
  agents_once: ['    if (done.has(id)) continue;\n', '\n', 'report.mjs'],
  agents_interrupt: ["  if (meta?.stoppedByUser || interruptedAt > lastAssistant) return { how: 'an interruption'", "  if (false) return { how: 'an interruption'", 'report.mjs'],
  agents_refusal: ["  if (handback && !handback.refused) return { how: lastRefusal ? 'a refusal' : 'a report'", "  if (handback && !handback.refused) return { how: 'a report'", 'report.mjs'],
  agents_running: ['  return null;\n}\n\n/**\n * The agents this session launched', "  return { how: 'a report', at, last: cut(last) };\n}\n\n/**\n * The agents this session launched", 'report.mjs'],
  agents_since: ['    if (!rec && !(end.at > stampAt)) continue;\n', '\n', 'report.mjs'],
  // Each running agent's progress note.
  progress_block: ['  console.log(progress);\n', '\n', 'report.mjs'],
  progress_stale: ['    if (age > INTERVAL_MS) return', '    if (false) return', 'report.mjs'],
  progress_latest: [".filter(Boolean).at(-1) ?? '';", ".filter(Boolean)[0] ?? '';", 'report.mjs'],
  progress_running: ["    if (agentEnd(tailEntries(path, 4 * 1024 * 1024), meta, start, notified.get(id) ?? '')) continue;\n", '\n', 'report.mjs'],
  progress_missing: ['catch { return `${who}, step ${a.step}: FLAGGED, no progress note at ${file}.`; }', 'catch { return `${who}, step ${a.step}: no note yet.`; }', 'report.mjs'],
  progress_step: ['    return m ? Number(m[1]) : null;', '    return m ? 1 : null;', 'report.mjs'],
  // Choice first.
  choice_first: ['if (choiceHit) {', 'if (false) {', 'stop-guard.mjs'],
  choice_marked_only: ['const MARKED = /\\(\\s*recommended\\b[^)\\n]*\\)/i;', 'const MARKED = /./;', 'stop-guard.mjs'],
  choice_open_lines: ['const OPEN_LINES = 2;', 'const OPEN_LINES = 99;', 'stop-guard.mjs'],
  choice_once: [' && marked.length === 1) return null;', ') return null;', 'stop-guard.mjs'],
  // Held work.
  held_record: ['    try { holdCall(p); } catch { /* the refusal stands either way */ }\n', '\n', 'pending-guard.mjs'],
  held_dedup: ["  if (held.split('\\n').some(", "  if (false && held.split('\\n').some(", 'pending-guard.mjs'],
  held_owner_only: ["  if (!prompt.trim() || HARNESS_TAG.test(prompt)) return '';", "  if (!prompt.trim()) return '';", 'pending-guard.mjs'],
  held_clear: ['  rmSync(f, { force: true });\n  if (!rows.length) return', '  if (!rows.length) return', 'pending-guard.mjs'],
  held_print: ['      if (held.out.trim()) printed.push(held.out.trim());\n', '\n', 'hook-dispatch.mjs'],
  held_first: ['    printed.push(REMINDER);', '    printed.unshift(REMINDER);', 'hook-dispatch.mjs'],
  held_no_latch: ['    if (pg.deny) return refuse(pg.reason, false);', '    if (pg.deny) return refuse(pg.reason);', 'hook-dispatch.mjs'],
  held_go_only: ['    if (endsWithGoWord(p.prompt)) {\n      const held = run(', '    if (true) {\n      const held = run(', 'hook-dispatch.mjs'],
  // A refusal inside an agent latches that agent only.
  latch_agent_own: ['  if (p.agent_id) {\n    const own = latchFile(p, p.agent_id);', '  if (false) {\n    const own = latchFile(p, p.agent_id);', 'hook-dispatch.mjs'],
  latch_agent_check: ['  if (p.agent_id) {\n    try {', '  if (false) {\n    try {', 'hook-dispatch.mjs'],
  // The main thread's TaskStop passes the latch; an agent's does not.
  latch_main_taskstop: ["    const mainStop = p.tool_name === 'TaskStop' && !p.agent_id;", '    const mainStop = false;', 'hook-dispatch.mjs'],
  latch_agent_taskstop: ["    const mainStop = p.tool_name === 'TaskStop' && !p.agent_id;", "    const mainStop = p.tool_name === 'TaskStop';", 'hook-dispatch.mjs'],
  // The wait between statuses.
  wait_note: ['    const moved = now.filter((a) => before.has(a.id) && noteSig(pad, a.step) !== before.get(a.id));', '    const moved = [];', 'report.mjs'],
  wait_end: ['    const ended = first.filter((a) => !still.has(a.id));', '    const ended = [];', 'report.mjs'],
  wait_limit: ['    if (waited >= limit) {', '    if (false) {', 'report.mjs'],
  wait_idle: ["  if (!first.length) return 'Wait: no agent", "  if (false) return 'Wait: no agent", 'report.mjs'],
  wait_records_nothing: ['      const e = endOf(sid, f, a.id);', '      const e = (agentEnds(sid, 0) ?? []).find((x) => x.id === a.id) ?? endOf(sid, f, a.id);', 'report.mjs'],
  fence_wait: ["  if (tool === 'Bash' && WAIT.test(String(input.command ?? ''))) return null;\n", '\n', 'hook-dispatch.mjs'],
  fence_wait_exact: ["--wait\\\\s*$');", "--wait');", 'hook-dispatch.mjs'],
  report_no_flag: [String.raw`(?:"(?!-)[^"`, String.raw`(?:"[^"`, 'hook-dispatch.mjs'],
  report_no_flag1: [String.raw`|\'(?!-)[^\']*\')`, String.raw`|\'[^\']*\')`, 'hook-dispatch.mjs'],
  // An approval pressed in the app.
  app_mint: ['try { app = recordAppExit(p); } catch { app = null; }', 'app = null;', 'approved-plan-guard.mjs'],
  app_tool_approved: ["      else if (n === 'ExitPlanMode') approved = true;", '      else if (false) approved = true;', 'approved-plan-guard.mjs'],
  app_in_plan: ['found = inPlan && !approved', 'found = !approved', 'approved-plan-guard.mjs'],
  app_changed_after: ["  else if (statSync(x.plan).mtimeMs > x.at) outcome = 'changed after';\n", '\n', 'approved-plan-guard.mjs'],
  app_judged_once: ['  if (judged[last.uuid]) return { uuid: String(last.uuid), outcome: judged[last.uuid] };\n', '\n', 'approved-plan-guard.mjs'],
  app_exits_protect: ['  if (target === resolve(MARKER) || target === resolve(APP_EXITS)) deny(', '  if (target === resolve(MARKER)) deny(', 'approved-plan-guard.mjs'],
  app_reentry: ['      if (ax.deny) return refuse(ax.reason, false);\n', '\n', 'hook-dispatch.mjs'],
  app_reentry_no_latch: ['      if (ax.deny) return refuse(ax.reason, false);', '      if (ax.deny) return refuse(ax.reason);', 'hook-dispatch.mjs'],
  app_release_owner: ['  const wrote = since.some((e) => isOwnerMessage(e));', '  const wrote = false;', 'approved-plan-guard.mjs'],
  app_release_agent: ["/^(Agent|Task|SendMessage)$/.test(b.name ?? '')", "/^NEVER$/.test(b.name ?? '')", 'approved-plan-guard.mjs'],
  // The dispatcher judges the owner's exit from plan mode before any gate reads the marker.
  dispatch_judge_exit: ["    run(`node \"${join(HUB, 'approved-plan-guard.mjs')}\" --judge-exit`, raw, root);\n", '\n', 'hook-dispatch.mjs'],
  // A correction from the owner ends the turn.
  correction_refuse: ['      if (correction) {\n        let reviewed = false;', '      if (false) {\n        let reviewed = false;', 'hook-dispatch.mjs'],
  correction_go: ['const correction = endsWithGoWord(last.text) ? null : when(idx[idx.length - 1]);', 'const correction = when(idx[idx.length - 1]);', 'hook-dispatch.mjs'],
  go_last_word: ["  return GO_WORDS.includes(words[words.length - 1]);", "  return GO_WORDS.includes(words.join(' '));", 'hook-dispatch.mjs'],
  correction_status: ['    if (status) {\n', '    if (false) {\n', 'hook-dispatch.mjs'],
  correction_taskstop: ['    if (!p.agent_id && !mainStop) {', '    if (!p.agent_id) {', 'hook-dispatch.mjs'],
  correction_agents: ['    if (!p.agent_id && !mainStop) {', '    if (!mainStop) {', 'hook-dispatch.mjs'],
  correction_no_latch: ['        return refuse(correctionMessage(correction, reviewed), false);', '        return refuse(correctionMessage(correction, reviewed));', 'hook-dispatch.mjs'],
  correction_midturn: ['entries.forEach((e, i) => { if (isOwnerMessage(e)) idx.push(i); });', "entries.forEach((e, i) => { if (e?.type === 'user' && isOwnerMessage(e)) idx.push(i); });", 'hook-dispatch.mjs'],
  go_words: ["export const GO_WORDS = ['go', 'ok', 'continue', 'approved', 'yes'];", "export const GO_WORDS = ['go', 'ok', 'continue', 'approved'];", 'hook-dispatch.mjs'],
  correction_fallback: ['correction: r && r.go === false ? { at, typed: at } : null,', 'correction: null,', 'hook-dispatch.mjs'],
  correction_record: ['  if (!prompt.trim() || HARNESS_TAG.test(prompt)) return false;', '  if (!prompt.trim()) return false;', 'hook-dispatch.mjs'],
  correction_widen: ['  else for (const mb of [2, 8, 32]) {', '  else for (const mb of [2]) {', 'hook-dispatch.mjs'],
  // A read of the record passes a correction; an action and a read of anything else do not.
  correction_read: ['      try { if (correction && readOfRecord(p)) correction = null; } catch { /* a read that cannot be judged stays held */ }\n', '\n', 'hook-dispatch.mjs'],
  correction_read_record: ["  return readOutsideRecord(p, () => ('plan' in opts ? opts.plan : approvedPlan())?.path) === null;", '  return true;', 'hook-dispatch.mjs'],
  correction_read_only: ['  if (!isRead(p, opts.classify ?? planGuardReads)) return false;\n  return readOutsideRecord(', '  return readOutsideRecord(', 'hook-dispatch.mjs'],
  correction_says: ['the status command and TaskStop pass; every other call is held', 'every other call is held', 'hook-dispatch.mjs'],
  reminder_wording: ["  'First line: what you are doing now.',\n", "  'First line: what you are doing now and what comes next. A status at least every five minutes',\n", 'hook-dispatch.mjs'],
  // The talk before a plan is judged against the plan file's last write.
  talk_after_edit: ['    if (planWrittenAt && Number.isFinite(at) && at < planWrittenAt) {', '    if (false) {', 'plan-guard.mjs'],
  talk_asks_nothing: ['    if (said.length > 40 && asksNothing(said)) talk = i;', '    if (said.length > 40) talk = i;', 'plan-guard.mjs'],
  talk_newest: ['    if (said.length > 40 && asksNothing(said)) talk = i;', '    if (talk < 0 && said.length > 40 && asksNothing(said)) talk = i;', 'plan-guard.mjs'],
  // The turn judged ended before the owner's newest message: text in the call's own turn is not a turn.
  talk_owner_after: ['  for (let i = anchor + 1; i < ownerAt; i++) {', '  for (let i = anchor + 1; i < entries.length; i++) {', 'plan-guard.mjs'],
  talk_owner_newest: ['  for (let i = entries.length - 1; i > anchor; i--) if (isOwnerMessage(entries[i])) { ownerAt = i; break; }', '  for (let i = anchor + 1; i < entries.length; i++) if (isOwnerMessage(entries[i])) { ownerAt = i; break; }', 'plan-guard.mjs'],
  // Every status prints each agent's hook refusals and last tool result, and the wait returns on a refusal.
  reads_block: ['  console.log(reads);\n', '\n', 'report.mjs'],
  reads_refusal: ['      if (b.is_error && HOOK_REFUSAL.test(text)) refusals.push({ tool, at, text });', '      if (false) refusals.push({ tool, at, text });', 'report.mjs'],
  reads_last: ['      last = { tool, at, error: !!b.is_error, text };', '      last = null;', 'report.mjs'],
  reads_running: ["  const list = [...running.map((a) => ({ id: a.id, description: a.description, path: a.path, state: 'running' })),", "  const list = [...[].map((a) => ({ id: a.id, description: a.description, path: a.path, state: 'running' })),", 'report.mjs'],
  reads_ended: ["    ...(ended ?? []).map((a) => ({ id: a.id, description: a.description, path: a.path, state: `ended by ${a.how}` }))];", '    ];', 'report.mjs'],
  reads_prose: ["      for (const b of c) if (b?.type === 'tool_use') names.set(b.id, b.name ?? '');", "      for (const b of c) { if (b?.type === 'tool_use') names.set(b.id, b.name ?? ''); if (b?.type === 'text' && /refused/i.test(b.text ?? '')) refusals.push({ tool: 'prose', at: NaN, text: String(b.text) }); }", 'report.mjs'],
  wait_refused: ['    if (ended.length || moved.length || refused.length) {', '    if (ended.length || moved.length) {', 'report.mjs'],
  // A message the harness never delivered: no longer held once a later one has arrived, and printed once.
  overtaken_filter: ['  return waiting.filter((x) => x.owner && !given.some((g) => g > x.at)).map((x) => ({ text: x.text, at: x.at }));', '  return waiting.filter((x) => x.owner).map((x) => ({ text: x.text, at: x.at }));', 'pending-guard.mjs'],
  overtaken_typed: ['x.owner && !given.some((g) => g > x.at)', 'x.owner && !given.some((g) => g > 0)', 'pending-guard.mjs'],
  given_enqueue_time: ['        if (x.owner && x.at) given.push(x.at);', '        if (x.owner && x.at) given.push(arrivedAt);', 'pending-guard.mjs'],
  given_unenqueued: ['    if (!hit && byOwner && Number.isFinite(arrivedAt) && arrivedAt > 0) given.push(arrivedAt);', '    void 0;', 'pending-guard.mjs'],
  given_owner_only: ['    deliver(t, at, isOwnerMessage(e) && !HARNESS_TAG.test(textOf(e)));', '    deliver(t, at, true);', 'pending-guard.mjs'],
  skipped_virtual: ['  if (p && !HARNESS_TAG.test(prompt) && !items.some((x) => x.arrived && x.key && p.includes(x.key))) deliver(p, now(), true);', '  void 0;', 'pending-guard.mjs'],
  skipped_already: ['&& !items.some((x) => x.arrived && x.key && p.includes(x.key))) deliver(', ') deliver(', 'pending-guard.mjs'],
  skipped_typed: ['x.owner && given.some((g) => g > x.at)', 'x.owner && given.length > 0', 'pending-guard.mjs'],
  skipped_once: ['  writeFileSync(f, JSON.stringify({ keys: [...seen, ...fresh.map(keyOf)] }));', '  void 0;', 'pending-guard.mjs'],
  skipped_print: ['    if (skipped.out.trim()) printed.push(skipped.out.trim());\n', '\n', 'hook-dispatch.mjs'],
  // A turn that ends with steps of the approved plan left and no agent running is refused.
  steps_refuse: ['if (left.length) {', 'if (false) {', 'stop-guard.mjs'],
  steps_running: ['if (state && !state.running.length && !queuedOwner.length', 'if (state && !queuedOwner.length', 'stop-guard.mjs'],
  steps_queued: ['&& !queuedOwner.length && !opensWithChoice(reply)', '&& !opensWithChoice(reply)', 'stop-guard.mjs'],
  steps_choice: ['&& !opensWithChoice(reply) && !declaresStop(reply)', '&& !declaresStop(reply)', 'stop-guard.mjs'],
  steps_declared: ['&& !declaresStop(reply)\n', '\n', 'stop-guard.mjs'],
  steps_declared_open: ['(\\S[^\\n]{6,})/i;', '(\\S[^\\n]{0,})/i;', 'stop-guard.mjs'],
  steps_correction: ['&& !stopStanding(probe) && (reviewed || !correctionStanding(probe))) left = stepsLeft(state);', '&& !stopStanding(probe)) left = stepsLeft(state);', 'stop-guard.mjs'],
  steps_plan_in_force: ['  const plan = approvedPlan();\n  if (!plan || !state) return [];', "  const plan = { text: '## Steps\\n1. x\\n2. y\\n' };\n  if (!plan || !state) return [];", 'stop-guard.mjs'],
  steps_report_only: ["  for (const e of s.ends) if (e.how === 'a report' && e.step !== null) returned.add(e.step);", '  for (const e of s.ends) if (e.step !== null) returned.add(e.step);', 'report.mjs'],
  steps_step_read: ['    const step = agentStep(path, head);\n    if (!end) {', '    const step = 1;\n    if (!end) {', 'report.mjs'],
  // The pointer: the first step in Order with no DONE hand-back, read by the status, the dispatch gate and the stop guard.
  pointer_order_read: ["    return line ? [...new Set([...line.replace(/^[^:]*:/, '').matchAll(/\\d+/g)].map((x) => Number(x[0])))] : [];", "    return line ? [...new Set([...m[1].matchAll(/\\d+/g)].map((x) => Number(x[0])))] : [];", 'report.mjs'],
  pointer_standing_not_order: ["  return order.length ? { order, standing: numbers('Standing') } : null;", "  return order.length ? { order: [...order, ...numbers('Standing')], standing: numbers('Standing') } : null;", 'report.mjs'],
  pointer_first: ['next: o.order.find((n) => !done.has(n)) ?? null', 'next: [...o.order].reverse().find((n) => !done.has(n)) ?? null', 'report.mjs'],
  pointer_done_only: [' && DONE.test(firstLineOf(e.last))) done.add(e.step);', ') done.add(e.step);', 'report.mjs'],
  pointer_report_only: ["if (e.how === 'a report' && e.step !== null && DONE.test(", 'if (e.step !== null && DONE.test(', 'report.mjs'],
  pointer_print: ['  console.log(pointerBlock(state, seen, mark));\n', '\n', 'report.mjs'],
  pointer_none: ["  const out = [p.next === null ? 'next: none' : `next: step ${p.next}`,", '  const out = [`next: step ${p.next}`,', 'report.mjs'],
  pointer_undefined: ['  if (!st.pointer) return `next: not defined (${st.why}).`;\n', '\n', 'report.mjs'],
  pointer_backs: ["      ...(x.back.lines.length ? x.back.lines.map((l) => `    ${l}`) : ['    (the agent ended with no text)']),\n", '\n', 'report.mjs'],
  pointer_report_path: ["      `  Report file: ${x.report} (${x.reportWritten ? 'written' : 'not written'})`);", '      );', 'report.mjs'],
  pointer_found: ['    for (const f of st.found) {\n      const s = sortOf(st.manager, f);', '    for (const f of []) {\n      const s = sortOf(st.manager, f);', 'report.mjs'],
  mgr_step_wildcard: ["?? notes?.sorts?.get(`${f.step}.*`) ?? null;", '?? null;', 'report.mjs'],
  mgr_specific_first: ["return notes?.sorts?.get(f.key) ?? notes?.sorts?.get(`${f.step}.*`) ?? null;", "return notes?.sorts?.get(`${f.step}.*`) ?? notes?.sorts?.get(f.key) ?? null;", 'report.mjs'],
  pointer_found_read: ["if (/^Found:/.test(l.trim())) { k++;", 'if (true) { k++;', 'report.mjs'],
  pointer_page: ["      writeFileSync(join(pad, 'status', 'fix-run.html'), statusPage(state, status));", '      void 0;', 'report.mjs'],
  pointer_escape: [".replace(/</g, '&lt;')", '', 'report.mjs'],
  // The dispatch gate sends only N and a Standing step, and the stop guard reads N.
  dispatch_pointer: ['  if (ptr && n !== ptr.next && !ptr.standing.includes(n)) {', '  if (false) {', 'hook-dispatch.mjs'],
  dispatch_pointer_none: ['  if (ptr && n !== ptr.next && !ptr.standing', '  if (ptr && ptr.next !== null && n !== ptr.next && !ptr.standing', 'hook-dispatch.mjs'],
  dispatch_standing: [' && !ptr.standing.includes(n)) {', ') {', 'hook-dispatch.mjs'],
  dispatch_pointer_prints: ["'next: none (every step in Order has a DONE hand-back)' : `next: step ${ptr.next}`}", "'next: none (every step in Order has a DONE hand-back)' : 'next: a step'}", 'hook-dispatch.mjs'],
  dispatch_pointer_read: ['  else if (ptr === undefined) { try { ptr = pointerFor(p, plan.text); } catch { ptr = null; } }', '  else if (ptr === undefined) { ptr = null; }', 'hook-dispatch.mjs'],
  stop_pointer: ['  if (planOrder(plan.text)) {', '  if (false) {', 'stop-guard.mjs'],
  stop_pointer_named: ["the plan's pointer at next: step ${left[0]}, ", "the plan's pointer, ", 'stop-guard.mjs'],

  // The review: a fresh agent clears every move before it goes (report.mjs reads the verdict, hook-dispatch.mjs gates on it).
  review_verdict_parse: ['\\s+(ROUTE-CLEAR|ROUTE-REFUSED)\\b(.*)$/', '(?:\\s+(ROUTE-CLEAR|ROUTE-REFUSED)\\b)?(.*)$/', 'report.mjs'],
  review_verdict_case: ['(ROUTE-CLEAR|ROUTE-REFUSED)\\b(.*)$/.exec(', '(ROUTE-CLEAR|ROUTE-REFUSED)\\b(.*)$/i.exec(', 'report.mjs'],
  review_started: ['if (!(review.startAt > refAt)) return', 'if (false) return', 'report.mjs'],
  review_start_unreadable: ['if (!(review.startAt > refAt)) return', 'if (review.startAt <= refAt) return', 'report.mjs'],
  review_ref_order: ['Math.max(judged?.at ?? 0, planAt, Number(opts.after) || 0)', 'Math.max(0, planAt, Number(opts.after) || 0)', 'report.mjs'],
  review_ref_plan: ['Math.max(judged?.at ?? 0, planAt, Number(opts.after) || 0)', 'Math.max(judged?.at ?? 0, 0, Number(opts.after) || 0)', 'report.mjs'],
  review_ref_after: ['Math.max(judged?.at ?? 0, planAt, Number(opts.after) || 0)', 'Math.max(judged?.at ?? 0, planAt, 0)', 'report.mjs'],
  review_order_only: ['if (e.step === null || !order.includes(e.step)) continue;', 'if (e.step === null) continue;', 'report.mjs'],
  review_any_end: ['if (e.step === null || !order.includes(e.step)) continue;', "if (e.step === null || !order.includes(e.step) || e.how !== 'a report') continue;", 'report.mjs'],
  review_reports_only: ["if (!reviewers.includes(e.step) || e.how !== 'a report') continue;", 'if (!reviewers.includes(e.step)) continue;', 'report.mjs'],
  review_newest: ['if (!review || e.at > review.at) review = e;', 'if (!review) review = e;', 'report.mjs'],
  review_off_aim: ["if (v.aim === 'OFF-AIM') return { ...parsed, kind: 'off-aim' };", "if (false) return { ...parsed, kind: 'off-aim' };", 'report.mjs'],
  review_route: ["if (v.route === 'ROUTE-REFUSED') return", 'if (false) return', 'report.mjs'],
  review_wrong_step: ['if (judged && v.step !== judged.step) return', 'if (false) return', 'report.mjs'],
  review_no_next: ["if (v.next === null) return { ...parsed, kind: 'no-next' };", "if (false) return { ...parsed, kind: 'no-next' };", 'report.mjs'],
  review_not_read: ["if (!read?.ends) return { ...hand, kind: 'not-read' };", "if (false) return { ...hand, kind: 'not-read' };", 'report.mjs'],
  review_running: ['const waiting = reviewers.some((n) => read.runningSteps?.has(n));', 'const waiting = false;', 'report.mjs'],
  review_full_path: ['.some((m) => ours.has(m[1]));', '.some((m) => m[1].length > 0);', 'report.mjs'],
  review_follow: ['return namesReviewFile(b) && /\\bfollow/i.test(b); });', 'return namesReviewFile(b); });', 'report.mjs'],
  review_status_print: ['  console.log(review);\n', '\n', 'report.mjs'],
  review_block_text: ["? ` Send Standing step ${st.reviewers[0]}.`", "? ` Send step ${st.reviewers[0]}.`", 'report.mjs'],
  review_gate_wired: ['      if (rv) return refuse(rv, false);\n', '\n', 'hook-dispatch.mjs'],
  review_gate_no_latch: ['      if (rv) return refuse(rv, false);', '      if (rv) return refuse(rv);', 'hook-dispatch.mjs'],
  dispatch_review_no_pointer: ['  if (aimReviewSteps(plan.text).length) ptr = null;\n  else if (ptr === undefined)', '  if (ptr === undefined)', 'hook-dispatch.mjs'],
  review_gate_standing: ['  if (o.standing.includes(n)) {\n    const unread = approvalSetProblem(plan, n);', '  if (false) {\n    const unread = approvalSetProblem(plan, n);', 'hook-dispatch.mjs'],
  // The step numbers the plan held at approval (approved-plan-guard.mjs, hook-dispatch.mjs, report.mjs).
  approved_step_set: ['  return { steps, standing: planOrder(text)?.standing ?? [], review: aimReviewSteps(text) };', '  return { steps, standing: [], review: aimReviewSteps(text) };', 'report.mjs'],
  approved_step_review: ['standing: planOrder(text)?.standing ?? [], review: aimReviewSteps(text) };', 'standing: planOrder(text)?.standing ?? [], review: [] };', 'report.mjs'],
  approval_steps_snapshot: ['script: scriptHashOf(text), ...approvedStepSet(text) };', 'script: scriptHashOf(text) };', 'approved-plan-guard.mjs'],
  approval_steps_mark: ['    steps: snap.steps, standing: snap.standing,\n    via:', '    via:', 'approved-plan-guard.mjs'],
  approval_steps_exit: ['      steps: snap.steps, standing: snap.standing,\n      via:', '      via:', 'approved-plan-guard.mjs'],
  approval_steps_amend_keep: ['{ ...mk, hash: snap.hash, scope: snap.scope, amendedAt:', '{ ...mk, hash: snap.hash, scope: snap.scope, steps: snap.steps, standing: snap.standing, amendedAt:', 'approved-plan-guard.mjs'],
  approved_plan_lists: ['steps: recorded(mk.steps), standing: recorded(mk.standing) };', 'steps: null, standing: null };', 'hook-dispatch.mjs'],
  approval_set_steps: ['  if (Array.isArray(plan.steps) && !plan.steps.includes(n)) {', '  if (false) {', 'hook-dispatch.mjs'],
  approval_set_no_latch: ['${unread} ${FENCE_NO_LATCH} this refusal sets no latch', '${unread} this refusal sets no latch', 'hook-dispatch.mjs'],
  approval_set_dispatch_wired: ['  const unread = approvalSetProblem(plan, n);\n  if (unread) return refusal(', '  const unread = null;\n  if (unread) return refusal(', 'hook-dispatch.mjs'],
  approval_set_recorded_only: ['  if (Array.isArray(plan.standing) && (planOrder(plan.text)?.standing ?? []).includes(n)) {', '  if ((planOrder(plan.text)?.standing ?? []).includes(n)) {', 'hook-dispatch.mjs'],
  approval_set_standing_new: ['    if (!plan.standing.includes(n)) {', '    if (false) {', 'hook-dispatch.mjs'],
  approval_set_standing_kind: ['    if (!aimReviewSteps(plan.text).includes(n) && !ROUTE_CHECK.test(first)) {', '    if (false) {', 'hook-dispatch.mjs'],
  approval_set_first_line: ["    const first = String(stepBody(plan.text, n)).split('\\n')[0] ?? '';", '    const first = String(stepBody(plan.text, n));', 'hook-dispatch.mjs'],
  approval_set_route_check: ['!aimReviewSteps(plan.text).includes(n) && !ROUTE_CHECK.test(first)) {', '!aimReviewSteps(plan.text).includes(n)) {', 'hook-dispatch.mjs'],
  approval_set_review_gate: ['  if (o.standing.includes(n)) {\n    const unread = approvalSetProblem(plan, n);\n    return unread ?', '  if (o.standing.includes(n)) {\n    const unread = null;\n    return unread ?', 'hook-dispatch.mjs'],
  // The review step the approval recorded: kept through every amendment, and a send refused while no Standing step names the review file any more.
  approval_review_mark: ['    review: snap.review,\n    steps: snap.steps, standing: snap.standing,\n    via: `ExitPlanMode', '    steps: snap.steps, standing: snap.standing,\n    via: `ExitPlanMode', 'approved-plan-guard.mjs'],
  approval_review_exit: ['      review: snap.review,\n      steps: snap.steps, standing: snap.standing,\n      via:', '      steps: snap.steps, standing: snap.standing,\n      via:', 'approved-plan-guard.mjs'],
  approval_review_amend_keep: ['{ ...mk, hash: snap.hash, scope: snap.scope, amendedAt:', '{ ...mk, hash: snap.hash, scope: snap.scope, review: snap.review, amendedAt:', 'approved-plan-guard.mjs'],
  approved_plan_review: ['review: recorded(mk.review), ', 'review: null, ', 'hook-dispatch.mjs'],
  review_record_dispatch_wired: ['  const gone = reviewRecordProblem(plan);\n  if (gone) return refusal(', '  const gone = null;\n  if (gone) return refusal(', 'hook-dispatch.mjs'],
  review_record_review_gate: ['  const gone = n === null ? null : reviewRecordProblem(plan);', '  const gone = null;', 'hook-dispatch.mjs'],
  review_record_array: ['!Array.isArray(plan.review) || ', '', 'hook-dispatch.mjs'],
  review_record_nonempty: [' || !plan.review.length) return null;', ') return null;', 'hook-dispatch.mjs'],
  review_record_still_there: ["  if (aimReviewSteps(plan.text).length) return null;\n  return 'THE REVIEW STEP", "  return 'THE REVIEW STEP", 'hook-dispatch.mjs'],
  review_record_rule_text: ['THE REVIEW STEP KEEPS THE REVIEW FILE', 'THE REVIEW FILE', 'hook-dispatch.mjs'],
  review_record_plan_mode: ['the plan goes back through plan mode and', 'the plan goes back and', 'hook-dispatch.mjs'],
  review_record_no_latch_dispatch: ['${gone} ${FENCE_NO_LATCH} this refusal sets no latch', '${gone} this refusal sets no latch', 'hook-dispatch.mjs'],
  review_record_dispatch_standing: ['  const gone = reviewRecordProblem(plan);\n  if (gone) return refusal(', '  const gone = (planOrder(plan.text)?.standing ?? []).includes(n) ? null : reviewRecordProblem(plan);\n  if (gone) return refusal(', 'hook-dispatch.mjs'],
  review_record_standing_exempt: ['  const gone = n === null ? null : reviewRecordProblem(plan);', '  const gone = n === null || (planOrder(plan.text)?.standing ?? []).includes(n) ? null : reviewRecordProblem(plan);', 'hook-dispatch.mjs'],
  // The stop guard counts as a step left only a step whose number the approval recorded.
  steps_recorded_order: ['pointer.order.find((n) => !pointer.done.has(n) && held(n)) ?? null;', 'pointer.order.find((n) => !pointer.done.has(n)) ?? null;', 'stop-guard.mjs'],
  steps_recorded_count: ['!state.returned.has(n) && held(n));', '!state.returned.has(n));', 'stop-guard.mjs'],
  steps_recorded_old: ['const held = (n) => !Array.isArray(plan.steps) || plan.steps.includes(n);', 'const held = (n) => Array.isArray(plan.steps) && plan.steps.includes(n);', 'stop-guard.mjs'],
  review_gate_cleared: ["if (st.kind === 'cleared' && st.cleared === n) return null;", "if (st.kind === 'cleared') return null;", 'hook-dispatch.mjs'],
  review_gate_error: ["if (!st) st = { kind: 'error',", "if (!st) return null; if (false) st = { kind: 'error',", 'hook-dispatch.mjs'],
  review_gate_not_read: ["if (st.kind === 'not-enforced') return null;", "if (st.kind === 'not-enforced' || st.kind === 'not-read') return null;", 'hook-dispatch.mjs'],
  review_gate_texts: ["Go back to plan mode, read the review's hand-back", "Go back, read the review's hand-back", 'hook-dispatch.mjs'],
  aim_standing_wired: ['    if (aim) deny(aim);\n', '\n', 'plan-guard.mjs'],
  // A correction lets the review step and a step cleared by a review begun after the message go; the owner's stop holds everything.
  correction_lifts_review: ['  if (reviewers.includes(n)) return true;\n', '\n', 'hook-dispatch.mjs'],
  correction_lifts_cleared: ["return !!st && st.kind === 'cleared' && st.cleared === n;", "return !!st && st.kind === 'cleared';", 'hook-dispatch.mjs'],
  correction_lifts_plain: ["  if (p.agent_id || !/^(?:Agent|Task|SendMessage)$/.test(String(p.tool_name ?? ''))) return false;\n", '', 'hook-dispatch.mjs'],
  correction_lifts_after: ['reviewState(p, plan, { after: correction?.typed })', 'reviewState(p, plan, {})', 'hook-dispatch.mjs'],
  correction_lifts_wired: ["      try { if (correction && correctionLifts(p, correction)) correction = null; } catch { /* a send that cannot be judged stays held */ }\n", '', 'hook-dispatch.mjs'],
  correction_says_review: [', except the Standing review step and the step that review clears', ', except nothing', 'hook-dispatch.mjs'],
  stop_hold: ['      if (!record) return refuse(stopMessage(holds.stop), false);', '      if (false) return refuse(stopMessage(holds.stop), false);', 'hook-dispatch.mjs'],
  stop_agents: ['try { record = !p.agent_id && readOfRecord(p); }', 'try { record = readOfRecord(p); }', 'hook-dispatch.mjs'],
  stop_taskstop: ["if (holds.stop && p.tool_name !== 'TaskStop') {", 'if (holds.stop) {', 'hook-dispatch.mjs'],
  stop_no_latch: ['if (!record) return refuse(stopMessage(holds.stop), false);', 'if (!record) return refuse(stopMessage(holds.stop));', 'hook-dispatch.mjs'],
  stop_record_read: ['try { record = !p.agent_id && readOfRecord(p); } catch { record = false; }', 'record = false;', 'hook-dispatch.mjs'],
  // The stop word is the whole word stop anywhere in a message that ends with no go-word; each plant takes one of those three parts out.
  stop_anywhere: ["trim().split(' ').includes(STOP_WORD);", "trim().split(' ')[0] === STOP_WORD;", 'hook-dispatch.mjs'],
  stop_whole_word: ["return String(text ?? '').toLowerCase().replace(/[^\\p{L}\\p{N}]+/gu, ' ').trim().split(' ').includes(STOP_WORD);", "return String(text ?? '').toLowerCase().includes(STOP_WORD);", 'hook-dispatch.mjs'],
  stop_go_message: ['return hasStopWord(text) && !endsWithGoWord(text);', 'return hasStopWord(text);', 'hook-dispatch.mjs'],
  stop_plain_lift: ['i > stopAt && endsWithGoWord(words(i))', 'i > stopAt', 'hook-dispatch.mjs'],
  stop_older_go: ['!idx.some((i) => i > stopAt && endsWithGoWord(words(i)))', '!idx.some((i) => endsWithGoWord(words(i)))', 'hook-dispatch.mjs'],
  stop_newest: ['for (let k = idx.length - 1; k >= 0; k--) if (isStopMessage(words(idx[k]))) { stopAt = idx[k]; break; }', 'for (let k = 0; k < idx.length; k++) if (isStopMessage(words(idx[k]))) { stopAt = idx[k]; break; }', 'hook-dispatch.mjs'],
  hold_typed: ['const typed = typedAt(entries, i);', 'const typed = NaN;', 'hook-dispatch.mjs'],
  hold_settled: ['const settled = stopAt >= 0 || idx.some((i) => endsWithGoWord(words(i)));', 'const settled = true;', 'hook-dispatch.mjs'],
  hold_fallback_stop: ['stop: r && r.stop === true ? { at: stopped, typed: stopped } : null };', 'stop: null };', 'hook-dispatch.mjs'],
  record_stop: ['let stop = isStopMessage(prompt);', 'let stop = false;', 'hook-dispatch.mjs'],
  record_stop_kept: ['  if (!stop && !go) {\n    try {', '  if (false) {\n    try {', 'hook-dispatch.mjs'],
  stop_guard_stop: ['&& !stopStanding(probe) && (reviewed', '&& (reviewed', 'stop-guard.mjs'],
  stop_guard_review_corr: ['(reviewed || !correctionStanding(probe))', '(!correctionStanding(probe))', 'stop-guard.mjs'],
  stop_guard_names_cleared: ["? `The plan's review cleared step ${rv.cleared} and no other: send", "? `The plan's review cleared a step: send", 'stop-guard.mjs'],
  stop_guard_names_review: ['send the Standing review step, ${reviewed.path} step ${aimReviewSteps(reviewed.text)[0]}, which', 'send the Standing review step, which', 'stop-guard.mjs'],
  // The approval holds the plan's Goals, Asked, Files, Commands, Rules and Rules of this plan; the Steps and the Order may be amended without coming back.
  scope_sections: ["export const SCOPE_SECTIONS = ['Goals', 'Asked', 'Files', 'Commands', 'Rules', 'Rules of this plan'];", "export const SCOPE_SECTIONS = ['Goals', 'Files', 'Commands', 'Rules', 'Rules of this plan'];", 'report.mjs'],
  scope_unknown: ["const known = then && typeof then === 'object' && !Array.isArray(then);", 'const known = true;', 'report.mjs'],
  scope_hashes: ["out[name] = sha256(name === 'Goals' ? goalsWithoutServedBy(body) : body);", 'out[name] = sha256(String(text));', 'report.mjs'],
  // The Goals the owner approves leave out the Served by line; every other line of them is still hashed.
  scope_served_by: ["out[name] = sha256(name === 'Goals' ? goalsWithoutServedBy(body) : body);", 'out[name] = sha256(body);', 'report.mjs'],
  scope_goals_rest: ["  lines.splice(at, 1);\n  return lines.join('\\n');", "  lines.splice(0, lines.length);\n  return lines.join('\\n');", 'report.mjs'],
  scope_served_by_first: ["  const at = lines.findIndex((l) => /^Served by:/.test(l));\n  if (at < 0) return text;\n  lines.splice(at, 1);", "  const kept = lines.filter((l) => !/^Served by:/.test(l));\n  if (kept.length === lines.length) return text;\n  lines.splice(0, lines.length, ...kept);", 'report.mjs'],
  scope_old_marker: [" && !(n === 'Goals' && then[n] === wholeGoals)", '', 'report.mjs'],
  amend_rescope: ['{ ...mk, hash: snap.hash, scope: snap.scope, amendedAt:', '{ ...mk, hash: snap.hash, scope: mk.scope, amendedAt:', 'approved-plan-guard.mjs'],
  // The choice popup is not a read: take it back onto plan-guard's list and every gate that asks plan-guard passes it.
  popup_not_a_read: ["'TodoWrite', 'ToolSearch',", "'TodoWrite', 'AskUserQuestion', 'ToolSearch',", 'plan-guard.mjs'],
  status_scope: ["const moved = scoped ? scopeChanged(mk.scope, bytes.toString('utf8')) : [];", 'const moved = [];', 'report.mjs'],
  scope_mark: ['    plan, hash: snap.hash, scope: snap.scope, scriptHash: snap.script, at:', '    plan, hash: snap.hash, scriptHash: snap.script, at:', 'approved-plan-guard.mjs'],
  scope_app_exit: ['plan: x.plan, hash: snap.hash, scope: snap.scope, scriptHash: snap.script, at:', 'plan: x.plan, hash: snap.hash, scriptHash: snap.script, at:', 'approved-plan-guard.mjs'],
  amend_scope_gate: ['  if (moved.length) {\n    return `This edit would change', '  if (false) {\n    return `This edit would change', 'approved-plan-guard.mjs'],
  amend_agent: ["if (p.agent_id || !mk.scope || typeof mk.scope !== 'object'", "if (!mk.scope || typeof mk.scope !== 'object'", 'approved-plan-guard.mjs'],
  amend_no_scope: ["!mk.scope || typeof mk.scope !== 'object' || Array.isArray(mk.scope) || ", '', 'approved-plan-guard.mjs'],
  amend_session: ["if (mk.session && p.session_id && mk.session !== p.session_id) return 'The plan in force was approved in another session.';", "if (false) return 'The plan in force was approved in another session.';", 'approved-plan-guard.mjs'],
  amend_hash: ['if (hashOf(mk.plan) !== mk.hash) return `The plan file', 'if (false) return `The plan file', 'approved-plan-guard.mjs'],
  amend_multi: ['for (const e of Array.isArray(input?.edits) ? input.edits : []) {', 'for (const e of Array.isArray(input?.edits) ? input.edits.slice(0, 1) : []) {', 'approved-plan-guard.mjs'],
  amend_ambiguous: ['if (n === 0 || (n > 1 && !e.replace_all)) return null;', 'if (n === 0) return null;', 'approved-plan-guard.mjs'],
  amend_post: ['  if (moved.length) {\n    process.stderr.write(`approved-plan-guard --amend:', '  if (false) {\n    process.stderr.write(`approved-plan-guard --amend:', 'approved-plan-guard.mjs'],
  amend_rehash: ['{ ...mk, hash: snap.hash, scope: snap.scope, amendedAt:', '{ ...mk, hash: mk.hash, scope: snap.scope, amendedAt:', 'approved-plan-guard.mjs'],
  amend_post_agent: ['if (p.agent_id || !AMENDING.includes(tool)) process.exit(0);', 'if (!AMENDING.includes(tool)) process.exit(0);', 'approved-plan-guard.mjs'],
  amend_wired: ["const o = run(`node \"${join(HUB, 'approved-plan-guard.mjs')}\" --amend`, raw, root);", 'const o = { deny: false, status: 0 };', 'hook-dispatch.mjs'],
  // The shared rules: a plan that sends agents carries them or points at them, at the version the file has now.
  rules_steps_only: ["  if (!planSection(text, 'Steps').trim()) return null;\n  const head = 'SHARED RULES (Doctrine §0e rule 13):';", "  const head = 'SHARED RULES (Doctrine §0e rule 13):';", 'hook-dispatch.mjs'],
  rules_missing: ['  if (!section.trim()) {\n    return `${head} the plan sends agents', '  if (false) {\n    return `${head} the plan sends agents', 'hook-dispatch.mjs'],
  rules_pointer_parse: ['(?:[-*]\\s+)?Rules:\\s*', '(?:[-*]\\s+)?Rulez:\\s*', 'hook-dispatch.mjs'],
  rules_pointer_path: ["if (!rulesPaths().has(pointer.path)) return `${head} the plan's Rules line points at ${pointer.path}, which is not this hub's rules file. It names", "if (false) return `${head} the plan's Rules line points at ${pointer.path}, which is not this hub's rules file. It names", 'hook-dispatch.mjs'],
  rules_pointer_version: ["if (pointer.version !== rules.version) return `${head} the plan's Rules line pins version ${pointer.version} and the file now says", "if (false) return `${head} the plan's Rules line pins version ${pointer.version} and the file now says", 'hook-dispatch.mjs'],
  rules_copy_whole: ['  if (lacking.length) {', '  if (false) {', 'hook-dispatch.mjs'],
  rules_unreadable: ['  if (!rules || rules.version === null || !rules.block.length) {', '  if (false) {', 'hook-dispatch.mjs'],
  rules_pin_none: ["  const pointer = rulesPointer(planSection(text, 'Rules'));\n  if (!pointer) return null;", "  const pointer = rulesPointer(planSection(text, 'Rules'));", 'hook-dispatch.mjs'],
  rules_pin_unread: ['  if (!rules || rules.version === null) return `${head} the plan points at', '  if (false) return `${head} the plan points at', 'hook-dispatch.mjs'],
  rules_pin_path: ["if (!rulesPaths().has(pointer.path)) return `${head} the plan's Rules line points at ${pointer.path}, which is not this hub's rules file, so no step", "if (false) return `${head} the plan's Rules line points at ${pointer.path}, which is not this hub's rules file, so no step", 'hook-dispatch.mjs'],
  rules_pin_version: ["  if (pointer.version !== rules.version) {\n    return `${head} the plan's Rules line pins version", "  if (false) {\n    return `${head} the plan's Rules line pins version", 'hook-dispatch.mjs'],
  rules_gate_step: ["  if (!plan || (p.tool_name !== 'Workflow' && sentStep(p, plan) === null)) return null;\n  return rulesPinProblem(plan.text, file);", '  if (!plan) return null;\n  return rulesPinProblem(plan.text, file);', 'hook-dispatch.mjs'],
  rules_gate_agent: ['export function rulesGate(p, plan = approvedPlan(), file = undefined) {\n  if (p.agent_id || ', 'export function rulesGate(p, plan = approvedPlan(), file = undefined) {\n  if (', 'hook-dispatch.mjs'],
  rules_gate_wired: ['      if (rl) return refuse(rl, false);\n', '\n', 'hook-dispatch.mjs'],
  rules_gate_no_latch: ['if (rl) return refuse(rl, false);', 'if (rl) return refuse(rl);', 'hook-dispatch.mjs'],
  rules_plan_guard_wired: ['    if (rules) deny(rules);\n', '\n', 'plan-guard.mjs'],
  queue_plan_guard_wired: ['    if (queued) deny(queued);\n', '\n', 'plan-guard.mjs'],
  // The finding queue: read from the queue section of each named repository's NOTES.md, answered line by line.
  queue_section: ["  for (const l of planSection(text, QUEUE_HEADING).split('\\n')) {", "  for (const l of text.split('\\n')) {", 'hook-dispatch.mjs'],
  queue_key_forms: ['const QUEUE_KEY = /^\\s*(?:[-*]\\s+)?\\**(Q-', 'const QUEUE_KEY = /^\\s*(Q-', 'hook-dispatch.mjs'],
  queue_roots_label: ['    if (labels.some((l) => labelNames(l, r))) roots.push(r);', '    roots.push(r);', 'hook-dispatch.mjs'],
  queue_verdict_step: ['/^(?:fixed in step|carried to step)\\s+\\d+\\b/i.test(v)', '/^(?:fixed|carried)/i.test(v)', 'hook-dispatch.mjs'],
  queue_verdict_reason: ['\\S.{9,}$/i.test(v)', '\\S.{0,}$/i.test(v)', 'hook-dispatch.mjs'],
  queue_answered_section: ["  for (const l of planSection(text, 'Found answered').split('\\n')) {", "  for (const l of text.split('\\n')) {", 'hook-dispatch.mjs'],
  queue_listed: ['`- ${q.key} (${q.repo}):', '`- (${q.repo}):', 'hook-dispatch.mjs'],
  // The state page: the manager's notes, rendered and counted, never rewritten by a status.
  mgr_found_key: ['key: `${step}.${k}`', 'key: `${step}.0`', 'report.mjs'],
  mgr_sort_regex: ['(fixed|stopping|queued)\\s*:?\\s*(.*)$/i.exec(l)', '(fixed|queued)\\s*:?\\s*(.*)$/i.exec(l)', 'report.mjs'],
  mgr_evidence_split: ["const split = (s) => { const i = s.indexOf(' | ');", 'const split = (s) => { const i = -1;', 'report.mjs'],
  mgr_page_notes: ['    manager: managerNotes(managerPad), managerPath:', '    manager: managerNotes(null), managerPath:', 'report.mjs'],
  mgr_print_tag: ["      const how = s ? s.how : 'unsorted';", "      const how = 'unsorted';", 'report.mjs'],
  mgr_print_line: ['  out.push(managerLine(st, groups));\n', '\n', 'report.mjs'],
  mgr_sort_group: ["(s ? out[s.how] ?? out.unsorted : out.unsorted).push({ ...f, note: s?.note ?? '' });", "out.unsorted.push({ ...f, note: s?.note ?? '' });", 'report.mjs'],
  // The manager fence writes the notes and nothing beside them; the record includes the shared rules.
  fence_manager_write: ['    if (f && isManagerNotes(f, p.session_id)) return null;\n', '\n', 'hook-dispatch.mjs'],
  manager_notes_path: ['  return resolve(String(path)).endsWith(`/${sid}/scratchpad/${MANAGER_NOTES}`);', '  return true;', 'hook-dispatch.mjs'],
  record_rules: ['rel === AIM_FILE || rel === RULES_FILE ||', 'rel === AIM_FILE ||', 'hook-dispatch.mjs'],
  // After a compaction the first read is the status page, held the way the doctrine's read is.
  page_gate_marker: ["  try { due = JSON.parse(readFileSync(pageDueFile(p), 'utf8')); } catch { return null; }", "  try { due = JSON.parse(readFileSync(pageDueFile(p), 'utf8')); } catch { due = { at: 0 }; }", 'hook-dispatch.mjs'],
  page_gate_missing: ['  if (!page || !existsSync(page)) return null;', '  if (!page) return null;', 'hook-dispatch.mjs'],
  page_read_after: ['!Array.isArray(c) || !(t > since)) continue;', '!Array.isArray(c)) continue;', 'hook-dispatch.mjs'],
  page_read_error: ["if (b?.type !== 'tool_result' || b.is_error || !asked.has(b.tool_use_id)) continue;", "if (b?.type !== 'tool_result' || !asked.has(b.tool_use_id)) continue;", 'hook-dispatch.mjs'],
  page_read_partial: ['  return total > 0 && Array.from({ length: total }, (_, k) => k + 1).every((n) => lines.has(n));', '  return total > 0;', 'hook-dispatch.mjs'],
  page_read_parts: ['      for (let k = 0; k < file.numLines; k++) lines.add(file.startLine + k);', '      lines.clear();\n      for (let k = 0; k < file.numLines; k++) lines.add(file.startLine + k);', 'hook-dispatch.mjs'],
  page_read_same_file: ['      if (resolve(String(file?.filePath || asked.get(b.tool_use_id))) !== target) continue;\n', '\n', 'hook-dispatch.mjs'],
  page_gate_clears: ["{ rmSync(pageDueFile(p), { force: true }); return null; }", '{ return null; }', 'hook-dispatch.mjs'],
  page_gate_agent: ["  if (p.agent_id || p.tool_name === 'TaskStop') return null;\n  let due;", "  if (p.tool_name === 'TaskStop') return null;\n  let due;", 'hook-dispatch.mjs'],
  page_gate_taskstop: ["  if (p.agent_id || p.tool_name === 'TaskStop') return null;\n  let due;", '  if (p.agent_id) return null;\n  let due;', 'hook-dispatch.mjs'],
  page_gate_read_exempt: ['  if (isRead(p, opts.classify)) return null;\n  return `STATE PAGE GATE', '  return `STATE PAGE GATE', 'hook-dispatch.mjs'],
  page_due_line: ['STATE PAGE DUE (Doctrine §0e rule 2): this session was compacted,', 'STATE PAGE DUE (Doctrine §0e rule 2): this session began,', 'hook-dispatch.mjs'],
  page_due_wired: ["    try { printed.push(markPageDue(p)); } catch { /* the doctrine's own line stands */ }", '    void 0;', 'hook-dispatch.mjs'],
  page_gate_wired: ['      if (page) return refuse(page, false);\n', '\n', 'hook-dispatch.mjs'],
  page_gate_no_latch: ['if (page) return refuse(page, false);', 'if (page) return refuse(page);', 'hook-dispatch.mjs'],
  // The card: one page of the owner's core asks, printed at every start and resume, bounded.
  card_printed: ['for (const l of ownerCard()) say(l);\n', '\n', 'session-brief.mjs'],
  card_bounded: ['const CARD_LINES = 40;', 'const CARD_LINES = 400;', 'session-brief.mjs'],
  card_heading: ["const CARD_HEADING = 'The owner\\'s core asks, one page';", "const CARD_HEADING = 'The owner\\'s core rules, one page';", 'session-brief.mjs'],
  card_missing_section: ['  if (!body.length) return [', '  if (false) return [', 'session-brief.mjs'],
  card_missing_file: ["catch { return [`THE OWNER'S CORE ASKS: not printed (no CLAUDE.md beside this brief, at ${file}).`]; }", 'catch { return []; }', 'session-brief.mjs'],
  card_rest_note: ['...(body.length > shown.length ? [', '...(false ? [', 'session-brief.mjs'],

  // The manager reads the session's saved tool results, IR-SCIENCE.md and the decision records (step 108).
  record_tool_results: ["  if (p.session_id) {\n    const parts = relative(join(dot, 'projects'), a).split('/');", "  if (false) {\n    const parts = relative(join(dot, 'projects'), a).split('/');", 'hook-dispatch.mjs'],
  record_tool_results_session: ['parts[1] === String(p.session_id) && ', '', 'hook-dispatch.mjs'],
  record_ir_science: ["'.branch-guard', 'IR-SCIENCE.md', 'docs/decisions']", "'.branch-guard', 'docs/decisions']", 'hook-dispatch.mjs'],
  record_decisions: ["'IR-SCIENCE.md', 'docs/decisions'].includes(rel)", "'IR-SCIENCE.md'].includes(rel)", 'hook-dispatch.mjs'],
  record_decisions_flat: ['/^docs\\/decisions\\/[^/]+\\.md$/.test(rel)', '/^docs\\/decisions\\/.+\\.md$/.test(rel)', 'hook-dispatch.mjs'],
  record_decisions_md: ['/^docs\\/decisions\\/[^/]+\\.md$/.test(rel)', '/^docs\\/decisions\\/[^/]+$/.test(rel)', 'hook-dispatch.mjs'],
  // A refused read of the record is recorded, named by the status and read again before a step goes.
  refused_note: ["    if (event === 'PreToolUse') { try { noteRefusedReadCall(p, why); }", "    if (false) { try { noteRefusedReadCall(p, why); }", 'hook-dispatch.mjs'],
  refused_note_main: ["if (p.agent_id || p.tool_name !== 'Read' || !p.session_id) return false;", "if (p.tool_name !== 'Read' || !p.session_id) return false;", 'hook-dispatch.mjs'],
  refused_note_exists: ['  try { if (!statSync(abs).isFile()) return false; } catch { return false; }\n  let record = false;', '  let record = false;', 'hook-dispatch.mjs'],
  refused_note_record: ['  return record ? noteRefusedRead(p.session_id, abs, why) : false;', '  return noteRefusedRead(p.session_id, abs, why);', 'hook-dispatch.mjs'],
  refused_failure: ["  if (event === 'PostToolUseFailure') { try { noteRefusedReadCall(", "  if (false) { try { noteRefusedReadCall(", 'hook-dispatch.mjs'],
  refused_cleared: ['    return !((reads.get(resolvePath(x.path)) ?? 0) > Number(x.at));', '    return true;', 'report.mjs'],
  refused_cleared_error: ["if (b?.type !== 'tool_result' || b.is_error || !asked.has(b.tool_use_id)) continue;\n        const p = asked.get(b.tool_use_id);", "if (b?.type !== 'tool_result' || !asked.has(b.tool_use_id)) continue;\n        const p = asked.get(b.tool_use_id);", 'report.mjs'],
  refused_gone: ['    try { if (!statSync(x.path).isFile()) return false; } catch { return false; }\n    return !((reads', '    return !((reads', 'report.mjs'],
  reads_gate: ['  const named = list.slice(0, 10)', '  return null;\n  const named = list.slice(0, 10)', 'hook-dispatch.mjs'],
  reads_gate_step: ["if (p.tool_name !== 'Workflow' && (!plan || sentStep(p, plan) === null)) return null;\n  let list = open;", 'if (false) return null;\n  let list = open;', 'hook-dispatch.mjs'],
  reads_gate_tool: ["if (p.tool_name !== 'Workflow' && (!plan || sentStep(p, plan) === null)) return null;\n  let list = open;", 'if (!plan || sentStep(p, plan) === null) return null;\n  let list = open;', 'hook-dispatch.mjs'],
  reads_gate_wired: ['      if (rr) return refuse(rr, false);\n', '\n', 'hook-dispatch.mjs'],
  reads_gate_no_latch: ['if (rr) return refuse(rr, false);', 'if (rr) return refuse(rr);', 'hook-dispatch.mjs'],
  reads_status_block: ["    lines.push('Refused reads of the record NOT read since (the dispatch gate", "    lines.push('Refused reads of the record are open (the dispatch gate", 'report.mjs'],
  // A status shows what changed and nothing twice.
  seen_goals: ["  if (!seen?.goals) {\n    let goals = '';", "  if (true) {\n    let goals = '';", 'report.mjs'],
  seen_backs: ['  const fresh = backs.filter((x) => !seen || !seen.backs?.[backKey(x)]);', '  const fresh = backs;', 'report.mjs'],
  seen_found: ["      if (seen && seen.found?.[f.key] === stamp && how !== 'unsorted') { held++; continue; }", '      if (false) { held++; continue; }', 'report.mjs'],
  seen_found_unsorted: ["seen.found?.[f.key] === stamp && how !== 'unsorted') { held++; continue; }", 'seen.found?.[f.key] === stamp) { held++; continue; }', 'report.mjs'],
  seen_found_changed: ["      const stamp = `${f.line}|${how}|${s?.note ?? ''}`;", '      const stamp = `${f.line}`;', 'report.mjs'],
  seen_refusals: ["    if (a.state === 'running' && seen && r.refusals.length <= before) continue;", '    if (false) continue;', 'report.mjs'],
  seen_refusals_new: ['    const fresh = r.refusals.slice(before);', '    const fresh = r.refusals;', 'report.mjs'],
  seen_approval: ['    if (seen && seen.approval === mark.approval) {', '    if (false) {', 'report.mjs'],
  seen_agents_dedupe: ['Last entry: ${printed.has(a.id) ?', 'Last entry: ${false ?', 'report.mjs'],
  seen_written: ['  writeSeen(sid, seen, mark);\n}', '  void 0;\n}', 'report.mjs'],
  reads_main_since: ['    if (!Number.isFinite(t) || t <= since) continue;', '    if (!Number.isFinite(t)) continue;', 'report.mjs'],
  reads_main_tools: ["/^(?:Read|Grep|Glob)$/.test(b.name ?? '')) continue;", "/^(?:Read|Grep|Glob|Bash)$/.test(b.name ?? '')) continue;", 'report.mjs'],
  reads_main_sidechain: ["    if (e?.type !== 'assistant' || e.isSidechain || e.agentId) continue;\n    const t = Date.parse", "    if (e?.type !== 'assistant') continue;\n    const t = Date.parse", 'report.mjs'],
  reads_print: ['  console.log(readsLine);\n', '\n', 'report.mjs'],
  // The status page is rewritten at a hand-back and the flag stamps nothing.
  page_handback_wired: ['    if (isHandBackNotice(p.prompt)) { try { run(', '    if (false) { try { run(', 'hook-dispatch.mjs'],
  page_handback_marker: ['(?:completed|failed|killed|stopped|cancelled)<\\/status>/.test(t)', '(?:\\w+)<\\/status>/.test(t)', 'hook-dispatch.mjs'],
  page_handback_owner: ['  return /^\\s*<task-notification\\b', '  return true || /^\\s*<task-notification\\b', 'hook-dispatch.mjs'],
  page_flag_no_stamp: ['    let wrote = null;\n    try { wrote = writeStatusPage(who); }', "    writeFileSync(CLOCK, JSON.stringify({ at: Date.now(), status: 'stamped' }));\n    let wrote = null;\n    try { wrote = writeStatusPage(who); }", 'report.mjs'],
  page_flag_header: ["statusPage(state, clock.status || 'no status has been given yet', clock.at ? new Date(clock.at) : new Date())", "statusPage(state, 'x', new Date())", 'report.mjs'],
  page_flag_session: ["const who = String(hook.session_id || process.env.CLAUDE_CODE_SESSION_ID || '');", "const who = String(process.env.CLAUDE_CODE_SESSION_ID || '');", 'report.mjs'],
  // A plan's own script may run its steps, behind one constant that is off.
  workflow_const: ['export const WORKFLOW_SCRIPTS_ACCEPTED = false;', 'export const WORKFLOW_SCRIPTS_ACCEPTED = true;', 'hook-dispatch.mjs'],
  workflow_off: ["  if (!('scripts' in opts ? opts.scripts : WORKFLOW_SCRIPTS_ACCEPTED)) return off;", '  if (false) return off;', 'hook-dispatch.mjs'],
  workflow_no_plan: ["  if (!plan) return why('because no approved plan is in force.');", "  if (false) return why('because no approved plan is in force.');", 'hook-dispatch.mjs'],
  workflow_no_script: ['  if (want === null) return why(', '  if (false) return why(', 'hook-dispatch.mjs'],
  workflow_hash: ["  if (!plan.scriptHash || plan.scriptHash !== createHash('sha256').update(want).digest('hex')) {", '  if (false) {', 'hook-dispatch.mjs'],
  workflow_inline: ["  if (typeof input.script !== 'string' || Object.keys(input).some((k) => k !== 'script')) {", "  if (typeof input.script !== 'string') {", 'hook-dispatch.mjs'],
  workflow_equal: ['  if (input.script !== want) return why(', '  if (false) return why(', 'hook-dispatch.mjs'],
  workflow_problem: ['  const bad = scriptProblem(want, plan);\n  return bad ?', '  const bad = null;\n  return bad ?', 'hook-dispatch.mjs'],
  workflow_marker_read: ["scriptHash: typeof mk.scriptHash === 'string' ? mk.scriptHash : null", 'scriptHash: null', 'hook-dispatch.mjs'],
  script_agent_literal: ["    if (open?.v !== '(' || lit?.t !== 'str' || lit.subst || !(after?.v === ',' || after?.v === ')')) return", '    if (false) return', 'hook-dispatch.mjs'],
  script_template_subst: ["tokens.push({ t: 'str', v, subst: true }); return { open: true }; }", "tokens.push({ t: 'str', v }); return { open: true }; }", 'hook-dispatch.mjs'],
  script_step_exists: ['    if (!steps.includes(n)) return', '    if (false) return', 'hook-dispatch.mjs'],
  script_step_served: ['    if (!served.get(n)?.length) return', '    if (false) return', 'hook-dispatch.mjs'],
  script_forbidden: ['    if (SCRIPT_FORBIDDEN.has(t.v)) return', '    if (false) return', 'hook-dispatch.mjs'],
  script_agent_type: ["      if (colon?.v !== ':' || lit?.t !== 'str' || lit.subst || !BUILTIN_AGENT_TYPES.has(lit.v)) return", '      if (false) return', 'hook-dispatch.mjs'],
  script_regex: ["return { tokens, problem: 'the script holds a regular expression literal, which the gate does not read' };", 'return { tokens, problem: null };', 'hook-dispatch.mjs'],
  script_no_agent: ["  return calls ? null : 'the script starts no agent';", '  return null;', 'hook-dispatch.mjs'],
  script_meta: ['  return /^export const meta\\b/.test(script) ? script : null;', '  return script;', 'report.mjs'],
  script_planscript_fence: ['  const script = fence ? fence[1] : body.replace', '  const script = body.replace', 'report.mjs'],
  script_hash_of: ["  return s === null ? '' : sha256(s);", '  return sha256(text);', 'report.mjs'],
  script_mark: ['    plan, hash: snap.hash, scope: snap.scope, scriptHash: snap.script, at:', '    plan, hash: snap.hash, scope: snap.scope, at:', 'approved-plan-guard.mjs'],
  script_app_exit: ['plan: x.plan, hash: snap.hash, scope: snap.scope, scriptHash: snap.script, at:', 'plan: x.plan, hash: snap.hash, scope: snap.scope, at:', 'approved-plan-guard.mjs'],
  script_amend_keeps: ['{ ...mk, hash: snap.hash, scope: snap.scope, amendedAt:', '{ ...mk, hash: snap.hash, scope: snap.scope, scriptHash: snap.script, amendedAt:', 'approved-plan-guard.mjs'],
  // A latched agent writes its own report; an agent reads the rules first.
  report_write_latch: ['if (latch && !status && !mainStop && !release && !reportWrite) return refuse(', 'if (latch && !status && !mainStop && !release) return refuse(', 'hook-dispatch.mjs'],
  report_write_tool: ["if (!p.agent_id || !/^(?:Write|Edit|MultiEdit)$/.test(String(p.tool_name ?? ''))) return false;", 'if (!p.agent_id) return false;', 'hook-dispatch.mjs'],
  report_write_dir: ["basename(dirname(abs)) !== 'progress' || ", '', 'hook-dispatch.mjs'],
  report_write_scratchpad: ['if (!inScratchpad(abs, p.session_id) || ', 'if (', 'hook-dispatch.mjs'],
  report_write_name: ['(?:-report)?\\.txt$/.exec(basename(abs));', '(?:-report)?\\.txt/.exec(basename(abs));', 'hook-dispatch.mjs'],
  report_write_own: ['  return own === null || own === Number(m[1]);', '  return true;', 'hook-dispatch.mjs'],
  rules_first: ["  const first = 'rules' in opts ? opts.rules(p) : rulesFirst(p, plan);\n  if (first) return first;", '  const first = null;\n  if (first) return first;', 'plan-fence.mjs'],
  rules_first_read: ["  if (tool === 'Read' && files.has(reads)) return null;", '  if (false) return null;', 'plan-fence.mjs'],
  // The approved plan may be read before the rules, and nothing else may.
  rules_first_plan_read: ["  if (tool === 'Read' && planFiles.has(reads)) return null;", '  if (false) return null;', 'plan-fence.mjs'],
  rules_first_plan_steps: ['new Set([resolve(String(plan.path)), resolve(stepsFilePath(String(plan.path)))])', 'new Set([resolve(String(plan.path))])', 'plan-fence.mjs'],
  rules_first_plan_only: ["  if (tool === 'Read' && planFiles.has(reads)) return null;", "  if (tool === 'Read') return null;", 'plan-fence.mjs'],
  rules_first_plan_passed: ['  const first = \'rules\' in opts ? opts.rules(p) : rulesFirst(p, plan);', '  const first = \'rules\' in opts ? opts.rules(p) : rulesFirst(p);', 'plan-fence.mjs'],
  rules_first_live: ["const files = new Set([resolve(homedir(), '.claude', 'hub', RULES_FILE), resolve(dirname(SELF), RULES_FILE)]);", 'const files = new Set([resolve(dirname(SELF), RULES_FILE)]);', 'plan-fence.mjs'],
  rules_first_transcript: ['  if (f && rulesWereRead(headEntries(f, 512 * 1024), files)) return null;', '  if (f) return null;', 'plan-fence.mjs'],
  // The window of the transcript's start is only the fast path: a window too small to show the Read is refused for it, and the whole read is what finds it past the window (Q-HUB-46).
  rules_first_head: ['  if (f && rulesWereRead(headEntries(f, 512 * 1024), files)) return null;\n  const entries = f ? wholeEntries(f) : [];\n  if (f && rulesWereRead(entries, files)) return null;', '  const entries = f ? headEntries(f, 64) : [];\n  if (f && rulesWereRead(entries, files)) return null;', 'plan-fence.mjs'],
  rules_first_whole: ['  const entries = f ? wholeEntries(f) : [];\n  if (f && rulesWereRead(entries, files)) return null;', '  const entries = f ? headEntries(f, 512 * 1024) : [];\n  if (f && rulesWereRead(entries, files)) return null;', 'plan-fence.mjs'],
  rules_first_whole_size: ['  try { return headEntries(path, statSync(path).size + 1); } catch { return []; }', '  try { return headEntries(path, 512 * 1024); } catch { return []; }', 'plan-fence.mjs'],
  rules_first_error: ["if (e.type === 'user' && b?.type === 'tool_result' && b.is_error) failed.add(b.tool_use_id);", 'if (false) failed.add(b.tool_use_id);', 'plan-fence.mjs'],
  rules_first_other_file: ["b.name === 'Read' && files.has(resolve(String(b.input?.file_path ?? '')))) asked.add(b.id);", "b.name === 'Read') asked.add(b.id);", 'plan-fence.mjs'],
  rules_first_none: ['  return `${HEAD} ${first ? FIRST_REFUSAL : \'RULES FIRST:\'}', '  if (!f) return null;\n  return `${HEAD} ${first ? FIRST_REFUSAL : \'RULES FIRST:\'}', 'plan-fence.mjs'],
  rules_first_report: ['  if (agentReportWrite(p)) return null;\n  const files = new Set(', '  const files = new Set(', 'plan-fence.mjs'],
  // The first refusal sets no latch (lesson 415): the fence marks only the first refusal, and only the second latches.
  rules_first_mark: ['  const first = !!f && !rulesRefusedBefore(entries);', '  const first = !!f;', 'plan-fence.mjs'],
  rules_first_second: ['  const first = !!f && !rulesRefusedBefore(entries);', '  const first = !!f || true;', 'plan-fence.mjs'],
  rules_first_skip_latch: ["refuse(reason, !(g.includes('plan-fence.mjs') && o.reason.includes('RULES FIRST, NO LATCH:')) && !g.includes('doctrine-read-guard.mjs'));", "refuse(reason, !g.includes('doctrine-read-guard.mjs'));", 'hook-dispatch.mjs'],

  // The manager's written judgement of each hand-back (step 119).
  judged_gate_wired: ['      if (jg) return refuse(jg, false);\n', '\n', 'hook-dispatch.mjs'],
  judged_gate_no_latch: ['if (jg) return refuse(jg, false);', 'if (jg) return refuse(jg);', 'hook-dispatch.mjs'],
  judged_gate_standing: ['if (n === null || !sn || sn.standing.includes(n)) return null;', 'if (n === null || !sn) return null;', 'hook-dispatch.mjs'],
  judged_gate_closed: ["  if (!st) return `${head} the manager's judgement could not be read", "  if (!st) return null; void `${head} the manager's judgement could not be read", 'hook-dispatch.mjs'],
  judged_gate_not_read: ["  if (st.kind === 'not-read') return", '  if (false) return', 'hook-dispatch.mjs'],
  judged_gate_subagent: ['export function judgedGate(p, plan = approvedPlan(), state = undefined) {\n  if (p.agent_id || ', 'export function judgedGate(p, plan = approvedPlan(), state = undefined) {\n  if (false || ', 'hook-dispatch.mjs'],
  judged_state_after: ["    if (!(notesAt > newest.at)) return { ...st, kind: 'stale' };\n", '', 'report.mjs'],
  judged_state_count: ['    if (st.have < st.ends) return', '    if (st.have < 1) return', 'report.mjs'],
  judged_state_step: ['const lines = notes?.judged.get(newest.step) ?? [];', 'const lines = [...(notes?.judged.values() ?? [])].flat();', 'report.mjs'],
  judged_state_order: ['    if (e.step === null || !sn.order.includes(e.step)) continue;\n    if (!newest', '    if (e.step === null) continue;\n    if (!newest', 'report.mjs'],
  // The five parts of a Judged line, the four of a Why line, the length of a part, the count of Why lines, and a plan with no Order (LESSONS §417).
  judged_parts: ['have: lines.length - short.length, partial: short.length,', 'have: lines.length, partial: short.length,', 'report.mjs'],
  judged_part_min: ['export const PART_MIN = 10;', 'export const PART_MIN = 0;', 'report.mjs'],
  judged_why_gate: ['  if (send !== null) {\n    const lines = notes.whys.get(send) ?? [];', '  if (false) {\n    const lines = notes.whys.get(send) ?? [];', 'report.mjs'],
  judged_why_parts: ['whyHave: lines.length - short.length,', 'whyHave: lines.length,', 'report.mjs'],
  judged_why_count: ['const need = read.ends.filter((e) => e.step === send).length + 1;', 'const need = 1;', 'report.mjs'],
  judged_no_order: ["  return { order: [...new Set([...planSection(text, 'Steps').matchAll(/^(\\d+)\\.\\s/gm)].map((m) => Number(m[1])))], standing: [] };", '  return { order: [], standing: [] };', 'report.mjs'],
  judged_state_newest: ['    if (!newest || e.at > newest.at) newest = e;', '    if (!newest || e.at < newest.at) newest = e;', 'report.mjs'],
  judged_state_unread: ["  if (!read?.ends) return { ...base, kind: 'not-read' };", '  if (!read?.ends) return base;', 'report.mjs'],
  judged_notes_parse: ['    else if ((m = /^Judged\\s+(\\d+)\\s*:\\s*(\\S.*)$/i.exec(l))) out.judged.set(', '    else if (false) out.judged.set(', 'report.mjs'],
  judged_status_print: ['  console.log(judged);\n', '\n', 'report.mjs'],
  judged_block_text: ['    default: return `Judgement: OWED.', '    default: return `Judgement: fine.', 'report.mjs'],

  // The stop guard's three managing shapes.
  managing_wired: ['if (managing) {\n  const why = {', 'if (false) {\n  const why = {', 'stop-guard.mjs'],
  managing_emotion: ["  for (const re of EMOTION) { const m = re.exec(prose); if (m) return { kind: 'emotion', said: m[0].trim().slice(0, 80) }; }\n", '\n', 'stop-guard.mjs'],
  managing_promise: ["  for (const re of PROMISE) { const m = re.exec(prose); if (m) return { kind: 'promise', said: m[0].trim().slice(0, 80) }; }\n", '\n', 'stop-guard.mjs'],
  managing_go: ["    const m = goInstruction(open);\n    if (m) return { kind: 'go-word', said: m[0].trim().slice(0, 80) };\n", '\n', 'stop-guard.mjs'],
  managing_correction: ['  if (correction) {\n    const open = prose', '  if (true) {\n    const open = prose', 'stop-guard.mjs'],
  managing_correction_read: ['try { correctionNow = correctionStanding({ session_id: hook.session_id, transcript_path: path }); }', 'try { correctionNow = null; }', 'stop-guard.mjs'],
  managing_fenced: ["const prose = String(text).replace(/```[\\s\\S]*?```/g, ' ');", 'const prose = String(text);', 'stop-guard.mjs'],
  managing_first_line: ["    const open = prose.split('\\n').map((l) => l.trim()).find(Boolean) ?? '';", '    const open = prose;', 'stop-guard.mjs'],

  // The brief prints each repository's STATE.md.
  brief_state_whole: ["  say(t.replace(/\\s+$/, ''));", "  say(t.split('\\n')[0]);", 'session-brief.mjs'],
  brief_state_none: ['if (!statesPrinted) { say(', 'if (false) { say(', 'session-brief.mjs'],
  brief_state_siblings: ["    if (!stateRepos.includes(d) && existsSync(join(d, '.git'))) stateRepos.push(d);", '    void d;', 'session-brief.mjs'],
  brief_state_git: ["!stateRepos.includes(d) && existsSync(join(d, '.git'))) stateRepos.push(d);", '!stateRepos.includes(d)) stateRepos.push(d);', 'session-brief.mjs'],
  brief_state_hub: ['for (const d of [repo, hub]) if (!stateRepos.includes(d)) stateRepos.push(d);', 'for (const d of [repo]) if (!stateRepos.includes(d)) stateRepos.push(d);', 'session-brief.mjs'],

  // A plan rests on quoted evidence, accounts for the roadmap, and answers a range of findings in one line.
  what_is_plan_guard_wired: ['    if (what) deny(what);\n', '\n', 'plan-guard.mjs'],
  what_is_no_steps: ["export function whatIsProblem(text, opts = {}) {\n  if (!planSection(text, 'Steps').trim()) return null;", 'export function whatIsProblem(text, opts = {}) {\n  if (false) return null;', 'hook-dispatch.mjs'],
  what_is_empty: ['  if (!lines.length) return `${head} The plan sends agents into', '  if (false) return `${head} The plan sends agents into', 'hook-dispatch.mjs'],
  what_is_no_quote: ['    if (!spans.length) { bad.push(', '    if (false) { bad.push(', 'hook-dispatch.mjs'],
  what_is_no_file: ['    if (!named.length) { bad.push(', '    if (false) { bad.push(', 'hook-dispatch.mjs'],
  what_is_file_held: ['    if (!files.length) { bad.push(', '    if (false) { bad.push(', 'hook-dispatch.mjs'],
  what_is_quote_held: ['    if (!held) bad.push(', '    if (false) bad.push(', 'hook-dispatch.mjs'],
  what_is_every_span: ['return stretches.every((s) => t.includes(s)); });', 'return stretches.some((s) => t.includes(s)); });', 'hook-dispatch.mjs'],
  what_is_short: ['const QUOTED_SPAN = /"([^"\\n]{12,})"|“([^”\\n]{12,})”/g;', 'const QUOTED_SPAN = /"([^"\\n]{1,})"|“([^”\\n]{1,})”/g;', 'hook-dispatch.mjs'],
  what_is_elision: ['s.split(/\\s*(?:\\.{3}|…)\\s*/)', 's.split(/\\s*(?:NEVER_MATCHES_HERE)\\s*/)', 'hook-dispatch.mjs'],
  roadmap_plan_guard_wired: ['    if (road) deny(road);\n', '\n', 'plan-guard.mjs'],
  roadmap_items_open: ['const m = /^- \\[ \\] \\*\\*(.+?)\\*\\*(.*)$/.exec(l);', 'const m = /^- \\[[ x]\\] \\*\\*(.+?)\\*\\*(.*)$/.exec(l);', 'hook-dispatch.mjs'],
  roadmap_decision_key: ['const d = /<!--\\s*decision:\\s*(\\d+)\\s*-->/.exec(m[2]);', 'const d = null;', 'hook-dispatch.mjs'],
  roadmap_in_out: ['(?:in|out)\\b[\\s:,;.-]*\\S.{9,}$/i.test(low.slice(k.length))', '\\w+\\b[\\s:,;.-]*\\S.{9,}$/i.test(low.slice(k.length))', 'hook-dispatch.mjs'],
  roadmap_reason: ['\\S.{9,}$/i.test(low.slice(k.length))', '\\S.{0,}$/i.test(low.slice(k.length))', 'hook-dispatch.mjs'],
  roadmap_prefix: ['return /^[\\s:,;.-]*(?:in|out)', 'return /^\\S*[\\s:,;.-]*(?:in|out)', 'hook-dispatch.mjs'],
  range_ends: ['Number(k[2]) >= lo && Number(k[2]) <= hi', 'Number(k[2]) > lo && Number(k[2]) < hi', 'hook-dispatch.mjs'],
  range_still_queued: ['/^still queued\\b[\\s,:;.-]*\\S.{9,}$/i.test(r[5].trim())', '/^.*$/i.test(r[5].trim())', 'hook-dispatch.mjs'],
  range_reason: ['\\S.{9,}$/i.test(r[5].trim())', '\\S.{0,}$/i.test(r[5].trim())', 'hook-dispatch.mjs'],
  range_tag: ['r[1] === r[3] && lo <= hi && ', 'lo <= hi && ', 'hook-dispatch.mjs'],

  // The steps file beside an approved plan.
  steps_text_sections: ['(## (?:Rules|Steps|Commands)\\b', '(## (?:Steps)\\b', 'report.mjs'],
  steps_mark: ['  writeStepsFile(plan);\n  process.exit(0);', '  process.exit(0);', 'approved-plan-guard.mjs'],
  steps_amend: ['  writeStepsFile(mk.plan);\n  process.exit(0);', '  process.exit(0);', 'approved-plan-guard.mjs'],
  steps_app_exit: ["    writeStepsFile(x.plan);\n    outcome = 'recorded';", "    outcome = 'recorded';", 'approved-plan-guard.mjs'],
  steps_sent_names: ["const names = plan ? [plan.path, stepsFilePath(plan.path)].map(esc).join('|') : '';", "const names = plan ? [plan.path].map(esc).join('|') : '';", 'hook-dispatch.mjs'],
  steps_problem_wired: ['  if (namesStepsFile(p, plan)) {\n    const bad = stepsFileProblem(plan);', '  if (false) {\n    const bad = stepsFileProblem(plan);', 'hook-dispatch.mjs'],
  steps_stale: ['  if (disk !== stepsFileText(plan.text, plan.path)) {', '  if (false) {', 'hook-dispatch.mjs'],
  steps_missing: ["  try { disk = readFileSync(file, 'utf8'); } catch (e) {", "  try { disk = readFileSync(file, 'utf8'); } catch (e) { return null;", 'hook-dispatch.mjs'],
  steps_not_plan: ['|\\.steps\\.md$|-agent-', '|-agent-', 'plan-guard.mjs'],

  // The agents a Workflow starts keep their transcripts one level below the subagents folder.
  agent_files_workflows: ["  for (const r of runs(join(dir, 'workflows'))) take(r);\n", '\n', 'report.mjs'],
  agent_files_beside: ["  for (const r of runs(join(dirname(dir), 'workflows'))) take(r);\n", '\n', 'report.mjs'],
  agent_files_scripts: ["d.isDirectory() && d.name !== 'scripts'", 'd.isDirectory()', 'report.mjs'],
  agent_files_dedupe: ['if (!m || seen.has(m[1])) continue;', 'if (!m) continue;', 'report.mjs'],
  agent_path_lookup: ['    const hit = agentFiles(d).find((a) => a.id === id);', '    const hit = null;', 'report.mjs'],
  agent_meta_folder: ["join(a.folder, `agent-${a.id}.meta.json`)", "join(dirname(a.folder), `agent-${a.id}.meta.json`)", 'report.mjs'],
  agent_report_workflow: ['  try { const file = agentTranscriptPath(p); if (file) own = agentStep(file); } catch { own = null; }', '  own = null;', 'hook-dispatch.mjs'],
  agent_fence_transcript: ['  return agentTranscriptPath(p);', '  return null;', 'plan-fence.mjs'],

  // The plants run narrowed (the plants of the test file itself are written across a line break, so no map entry holds its own target).
  plants_files_flag: ["const todo = Object.entries(PLANTS).filter(([, [, , file]]) => !narrowTo || narrowTo.includes(file));\n  if (process.argv.includes('--dry')) {", "const todo = Object.entries(PLANTS);\n  if (process.argv.includes('--dry')) {", 'session-guards.test.mjs'],
  plants_touched_flag: ["else if (process.argv.includes('--touched')) {\n    narrowTo = touchedFiles();", "else if (process.argv.includes('--touched')) {\n    narrowTo = [];", 'session-guards.test.mjs'],
  plants_dry: ["if (process.argv.includes('--dry')) {\n    console.log(`PLANTS TO RUN", "if (false) {\n    console.log(`PLANTS TO RUN", 'session-guards.test.mjs'],

  // The status page's shape: the six keys of the notes it is drawn from, the chip of each step, and what each section carries.
  page_notes_version: ['out.versions.push(m[1].trim());', 'void 0;', 'report.mjs'],
  page_notes_open: ['out.open.push(m[1].trim());', 'void 0;', 'report.mjs'],
  page_notes_what: ['out.what.set(Number(m[1]), m[2].trim());', 'void 0;', 'report.mjs'],
  page_notes_why: ['out.why.set(Number(m[1]), m[2].trim());', 'void 0;', 'report.mjs'],
  page_notes_nexts: ['out.nexts.set(Number(m[1]), m[2].trim());', 'void 0;', 'report.mjs'],
  page_notes_done: ['out.done.set(Number(m[1]), m[2].trim());', 'void 0;', 'report.mjs'],
  page_chip_done_line: ["if (m.done.has(x.step) || x.state === 'DONE') return { cls: 'done', words: 'done' };", "if (x.state === 'DONE') return { cls: 'done', words: 'done' };", 'report.mjs'],
  page_chip_running: ["  if (x.state === 'running') return { cls: 'wait', words: 'running' };\n", '\n', 'report.mjs'],
  page_chip_review: ["if (reviewing && named && Number(named[1]) === x.step) return { cls: 'wait', words: 'under review' };", "if (false) return { cls: 'wait', words: 'under review' };", 'report.mjs'],
  page_chip_review_only_running: ["const reviewing = (st.steps ?? []).some((y) => (st.reviewers ?? []).includes(y.step) && y.state === 'running');", 'const reviewing = true;', 'report.mjs'],
  page_chip_open: ["  if (x.state !== 'not sent') return { cls: 'open', words: 'open' };\n", '\n', 'report.mjs'],
  page_chip_held_after: ["if (y && y.state !== 'DONE' && !m.done.has(y.step)) after = y.step;", 'if (false) after = y.step;', 'report.mjs'],
  page_chip_standing: ["  if (x.standing) return { cls: 'held', words: 'held, sent at any time' };\n", '\n', 'report.mjs'],
  page_chip_words: ['<span class="chip ${chip.cls}">${escapeHtml(chip.words)}</span>', '<span class="chip ${chip.cls}"></span>', 'report.mjs'],
  page_review_line: ['const reviewsHtml = reviewers.length ?', 'const reviewsHtml = false ?', 'report.mjs'],
  page_review_verdict: ["const first = String(backs[0]?.lines?.[0] ?? '');\n  const v = parseVerdict(first);", "const first = String(backs[0]?.lines?.[0] ?? '');\n  const v = null;", 'report.mjs'],
  page_review_running: ["return mine.some((x) => x.state === 'running') ? `${said}; a review is running` : said;", 'return said;', 'report.mjs'],
  page_what_fallback: ["const what = m.what.get(x.step) ?? name.split(',')[0].trim();", "const what = m.what.get(x.step) ?? '';", 'report.mjs'],
  page_where_stands: ['const stands = !x.back ?', "const stands = true ? 'not sent' : !x.back ?", 'report.mjs'],
  page_stands_interrupted: ["x.back.how !== 'a report' ?", 'false ?', 'report.mjs'],
  page_found_plan_only: ['!inPlan.size || inPlan.has(f.step)', 'true', 'report.mjs'],
  page_why_line: ['...(m.why.has(x.step) ?', '...(false ?', 'report.mjs'],
  page_next_line: ['...(m.nexts.has(x.step) ?', '...(false ?', 'report.mjs'],
  page_counted_done: ['...(m.done.get(x.step) ? [li(', '...(false ? [li(', 'report.mjs'],
  page_versions: ['m.versions.map((v) => li(escapeHtml(v)))', '[]', 'report.mjs'],
  page_escape_versions: ['m.versions.map((v) => li(escapeHtml(v)))', 'm.versions.map((v) => li(v))', 'report.mjs'],
  page_open_lines: ['const open = m.open.length ? m.open : openForOwner(st);', 'const open = openForOwner(st);', 'report.mjs'],
  page_found_stopping: ["...groups.stopping.map((f) => ['stopping the plan', f]), ", '', 'report.mjs'],
  page_found_unsorted: ['const unsortedLine = un ? [li(', 'const unsortedLine = false ? [li(', 'report.mjs'],
  page_found_queued: [", ...groups.queued.map((f) => ['queued', f])]", ']', 'report.mjs'],
  page_found_fixed_hidden: ['const notFixed = [', "const notFixed = [...groups.fixed.map((f) => ['fixed', f]), ", 'report.mjs'],
  page_no_decisions: ['${stepsHtml}\n${reviewsHtml}', "${stepsHtml}\n${m.decisions.map((d) => li(escapeHtml(d.text))).join('')}${reviewsHtml}", 'report.mjs'],
  page_dark_pair: ['@media (prefers-color-scheme: dark)', '@media (prefers-color-scheme: light)', 'report.mjs'],
  // The eight-digit value is built from two pieces so that this file holds no run of the kind the rules forbid.
  page_tokens_six: ['--chip-bg: #e8ece9;', '--chip-bg: #e8ece9' + 'cc;', 'report.mjs'],
  page_one_per_line: ["${bullets.join('\\n')}", "${bullets.join('')}", 'report.mjs'],
  page_updated_line: ['updated ${escapeHtml(californiaStamp(now))}', 'updated ${escapeHtml(now.toISOString())}', 'report.mjs'],

  // The two keys of the time chips, the steps of a plan with no Order, and the chips themselves (Q-HUB-42).
  page_notes_start: ['out.starts.set(Number(m[1]), Number(m[2]) * 60 + Number(m[3]));', 'void 0;', 'report.mjs'],
  page_notes_estimate: ['out.estimates.set(Number(m[1]), Number(m[2]));', 'void 0;', 'report.mjs'],
  page_notes_start_range: [' && Number(m[2]) < 24 && Number(m[3]) < 60) out.starts.set(', ') out.starts.set(', 'report.mjs'],
  page_notes_estimate_positive: [' && Number(m[2]) > 0) out.estimates.set(', ') out.estimates.set(', 'report.mjs'],
  page_noorder_steps: ['steps: s0 ? nums.map((step) => stepRow(step, false, done0, s0, pad)) : [] };', 'steps: [] };', 'report.mjs'],
  page_noorder_done: [', s0.ends).done : null;', ', []).done : null;', 'report.mjs'],
  page_noorder_only_when_none: ['  if (!planOrder(plan.text)) {\n    // No Order line', '  if (true) {\n    // No Order line', 'report.mjs'],
  page_chip_held_order: ['const order = st.pointer?.order ?? (st.steps ?? []).filter((z) => !z.standing).map((z) => z.step);', 'const order = st.pointer?.order ?? [];', 'report.mjs'],
  page_done_at: ["const doneEnd = mine.filter((e) => e.how === 'a report' && DONE.test(firstLineOf(e.last))).at(-1) ?? null;", 'const doneEnd = null;', 'report.mjs'],
  page_done_end_is_done: ["mine.filter((e) => e.how === 'a report' && DONE.test(firstLineOf(e.last))).at(-1)", 'mine.at(-1)', 'report.mjs'],
  page_chip_started: ['if (start !== undefined) out.push(`started ${clock(start)}`);', 'void 0;', 'report.mjs'],
  page_chip_ends: ['if (start !== undefined && estimate !== undefined) out.push(`estimate ends ${clock(start + estimate)}`);', 'if (false) out.push(`estimate ends ${clock(start + estimate)}`);', 'report.mjs'],
  page_chip_estimate_running: ['else if (estimate !== undefined) out.push(`estimate ${estimate} min`);', 'else if (false) void 0;', 'report.mjs'],
  page_chip_estimate_held: ["if (x.state === 'not sent' && estimate !== undefined) out.push(`estimate ${estimate} min`);", 'void 0;', 'report.mjs'],
  page_chip_held_only: ["if (x.state === 'not sent' && estimate !== undefined)", 'if (estimate !== undefined)', 'report.mjs'],
  page_chip_took: ['if (took >= 0) out.push(`took ${took} min`);', 'void 0;', 'report.mjs'],
  page_chip_took_negative: ['if (took >= 0) out.push(', 'if (true) out.push(', 'report.mjs'],
  page_chip_took_date: ['const day = wall(onDay.getTime());', 'const day = onDay.getTime();', 'report.mjs'],
  page_chip_no_key: ['const start = m.starts?.get(x.step);', 'const start = m.starts?.get(x.step) ?? 0;', 'report.mjs'],
  page_chip_no_estimate_key: ['const estimate = m.estimates?.get(x.step);', 'const estimate = m.estimates?.get(x.step) ?? 0;', 'report.mjs'],
  page_chip_time_style: ['<span class="chip ${chip.cls}">${escapeHtml(t)}</span>', '<span class="chip">${escapeHtml(t)}</span>', 'report.mjs'],
  page_estimate_note: ["Estimates are the plan's and not measurements.`", '`', 'report.mjs'],
  page_estimate_note_only_when_drawn: ['const estimateNote = timed ?', 'const estimateNote = true ?', 'report.mjs'],
  page_estimate_note_period: ["/[.!?]\\s*$/.test(given) ? '' : '.'", "false ? '' : '.'", 'report.mjs'],

  // A main-thread miss stops nothing, and the check of a call (step 138): the mark, what may be used, the check command, the dispatch gate still latching.
  fence_dispatch_latches: ['    if (fence) return refuse(fence, !fence.includes(FENCE_NO_LATCH));', '    if (fence) return refuse(fence, false);', 'hook-dispatch.mjs'],
  fence_record_marker: ["export const FENCE_NO_LATCH = 'MANAGER FENCE, NO LATCH:';", "export const FENCE_NO_LATCH = 'MANAGER FENCE, XX:';", 'hook-dispatch.mjs'],
  fence_record_may_use: ['The main thread may use: a read of the record', 'A read of the record', 'hook-dispatch.mjs'],
  fence_record_check_cmd: ['--can <tool> "<path or command line>". It says whether', '<tool> "<path or command line>". It says whether', 'hook-dispatch.mjs'],
  fence_can_pass: ["  if (tool === 'Bash' && CAN.test(String(input.command ?? ''))) return null;", '  void 0;', 'hook-dispatch.mjs'],
  can_cli: ["  if (event === '--can') { console.log(canMain(process.argv.slice(3))); process.exit(0); }", "  if (false) { console.log(canMain(process.argv.slice(3))); process.exit(0); }", 'hook-dispatch.mjs'],
  can_latch: [" || (!p.agent_id && CAN.test(String(p.tool_input?.command ?? '')))", '', 'hook-dispatch.mjs'],
  can_agent: ["(!p.agent_id && CAN.test(String(p.tool_input?.command ?? '')))", "CAN.test(String(p.tool_input?.command ?? ''))", 'hook-dispatch.mjs'],
  can_chained: [' + CAN_ARG + ', " + CAN_ARG + '.*' + ", 'hook-dispatch.mjs'],
  can_fence: ['  const fence = free ? null : managerFence(p, opts);', '  const fence = null;', 'hook-dispatch.mjs'],
  can_latch_read: ['  if (latchKnown) { try { latch = latchStanding(p, opts.entries, true); } catch { latch = null; } }', '  if (latchKnown) { latch = null; }', 'hook-dispatch.mjs'],
  can_readonly: ['    if (!readOnly) rmSync(latchFile(p), { force: true });', '    rmSync(latchFile(p), { force: true });', 'hook-dispatch.mjs'],
  // The reply guard keys a publish of a page by the page's content at the call (step 138).
  page_key_content: ["    if (tool === 'Artifact' && typeof input?.file_path === 'string' && input.file_path) body.pageContent = pageDigest(input.file_path, cwd, asOf);", '    void 0;', 'reply-guard.mjs'],
  page_key_since: ["    if (asOf && statSync(abs).mtimeMs > asOf) return 'changed-since';", '', 'reply-guard.mjs'],
  page_key_catchup_asof: ['        const h = callHash(u.name, u.input, p.cwd, t);', '        const h = callHash(u.name, u.input, p.cwd);', 'reply-guard.mjs'],

  // A plan that marks a roadmap item in has read the app's commit log first, and says what it showed (step 186, LESSONS §423).
  ship_wired: ['    if (shipped) deny(shipped);\n', '\n', 'plan-guard.mjs'],
  ship_after_roadmap: ['    const road = roadmapProblem(top);\n', "    const early = shippedCheckProblem(top, { entries: tailEntries(p.transcript_path ?? '', 16 * 1024 * 1024), planFile });\n    if (early) deny(early);\n    const road = roadmapProblem(top);\n", 'plan-guard.mjs'],
  ship_marked_in: ["  return items.filter((i) => said.some((l) => {\n    const k = String(i.key).toLowerCase();\n    const low = l.toLowerCase().replace(/^decision\\s+/, '');\n    return low.startsWith(k) && /^[\\s:,;.-]*in\\b/.test(low.slice(k.length));",
    "  return items.filter((i) => said.some((l) => {\n    const k = String(i.key).toLowerCase();\n    const low = l.toLowerCase().replace(/^decision\\s+/, '');\n    return false && low.startsWith(k) && /^[\\s:,;.-]*in\\b/.test(low.slice(k.length));", 'hook-dispatch.mjs'],
  ship_out_not_asked: ['/^[\\s:,;.-]*in\\b/.test(low.slice(k.length));', '/^[\\s:,;.-]*(?:in|out)\\b/.test(low.slice(k.length));', 'hook-dispatch.mjs'],
  ship_read_log: ["resolve(dir) !== rootAbs || w[k] !== 'log') return false;", 'resolve(dir) !== rootAbs) return false;', 'hook-dispatch.mjs'],
  ship_read_repo: ["resolve(dir) !== rootAbs || w[k] !== 'log') return false;", "w[k] !== 'log') return false;", 'hook-dispatch.mjs'],
  ship_read_after_plan: ['return calls.some((u) => u.at > planAt && answered.has(u.id) && logNames(u.command));', 'return calls.some((u) => answered.has(u.id) && logNames(u.command));', 'hook-dispatch.mjs'],
  ship_read_result: ['return calls.some((u) => u.at > planAt && answered.has(u.id) && logNames(u.command));', 'return calls.some((u) => u.at > planAt && logNames(u.command));', 'hook-dispatch.mjs'],
  ship_read_both: ['    return want.every((b) => parts.some((x) => x === b || x.endsWith(`/${b}`)));', '    return want.some((b) => parts.some((x) => x === b || x.endsWith(`/${b}`)));', 'hook-dispatch.mjs'],
  ship_branch_guard: ["  return { production: plain(key('promote')) ?? 'main', staging: plain(key('work')) ?? 'staging' };", "  return { production: 'main', staging: 'staging' };", 'hook-dispatch.mjs'],
  ship_line: ['    problems.push(`the plan\'s "## Shipped check" has no line for', '    void (`the plan\'s "## Shipped check" has no line for', 'hook-dispatch.mjs'],
  ship_line_branches: ['    if (notShipped.some((x) => x[1].toLowerCase() === production.toLowerCase() && x[2].toLowerCase() === staging.toLowerCase())) continue;', '    if (notShipped.length) continue;', 'hook-dispatch.mjs'],
  ship_shipped_refused: ['    if (shipped) {\n      problems.push(`${i.key} (${i.repo}): the plan marks it in, and its line', '    if (false) {\n      problems.push(`${i.key} (${i.repo}): the plan marks it in, and its line', 'hook-dispatch.mjs'],
  ship_no_steps: ["export function shippedCheckProblem(text, opts = {}) {\n  if (!planSection(text, 'Steps').trim()) return null;\n", 'export function shippedCheckProblem(text, opts = {}) {\n', 'hook-dispatch.mjs'],
  ship_key_exact: [' && /^\\s*:/.test(l.slice(key.length))', '', 'hook-dispatch.mjs'],

  // The main thread reads a repository's history, and nothing else of git (step 186, LESSONS §423).
  hist_branch: ["  if (tool === 'Bash' && gitHistoryRead(String(input.command ?? ''), p, opts)) return null;\n", '\n', 'hook-dispatch.mjs'],
  hist_words: ['  if (!words.every((w) => GIT_WORD.test(w))) return false;\n', '\n', 'hook-dispatch.mjs'],
  hist_trim: ["  const line = String(command ?? '').trim();", "  const line = String(command ?? '');", 'hook-dispatch.mjs'],
  hist_membership: ['  return gitHistoryRepos(p, opts).includes(path);', '  return true;', 'hook-dispatch.mjs'],
  hist_session_repos: ["  const cands = [at, ...kids(at), ...(existsSync(join(at, '.git')) ? kids(dirname(at)) : [])];", "  const cands = [at, ...(existsSync(join(at, '.git')) ? kids(dirname(at)) : [])];", 'hook-dispatch.mjs'],
  hist_worktree: ["  if (pad) cands.push(...kids(join(pad, 'worktree')));\n", '\n', 'hook-dispatch.mjs'],
  hist_log_args: ["    if (a.startsWith('-') || !GIT_RANGE.test(a) || GIT_UP.test(a)) return false;", '    if (false) return false;', 'hook-dispatch.mjs'],
  hist_up: ["    if (a.startsWith('-') || !GIT_RANGE.test(a) || GIT_UP.test(a)) return false;", "    if (a.startsWith('-') || !GIT_RANGE.test(a)) return false;", 'hook-dispatch.mjs'],
  hist_dash: ["    if (ended) return false;\n    if (a === '--') { ended = true; continue; }", "    if (a === '--') { ended = true; continue; }", 'hook-dispatch.mjs'],
  hist_lsremote: ['      if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(a)) return false;', '      if (false) return false;', 'hook-dispatch.mjs'],
  hist_branch_list: ["const gitBranchArgs = (args) => args.every((a) => ['-a', '-r', '-v', '-vv', '-l', '--list', '--all', '--remotes'].includes(a));", 'const gitBranchArgs = (args) => true;', 'hook-dispatch.mjs'],
  hist_showref: ['|| (GIT_REF.test(a) && !GIT_UP.test(a)));', '|| true);', 'hook-dispatch.mjs'],
  hist_subcommands: ["['show-ref', gitShowRefArgs]]).get(words[3]);", "['show-ref', gitShowRefArgs], ['diff', gitBranchArgs]]).get(words[3]);", 'hook-dispatch.mjs'],

  // The review step changes nothing outside the session scratchpad (step 186, LESSONS §423).
  review_fence_wired: ['  if (review) return review;\n', '\n', 'plan-fence.mjs'],
  review_fence_record: ['if (!p.agent_id || !plan || !Array.isArray(plan.review) || !plan.review.length) return null;', 'if (!p.agent_id || !plan) return null;', 'plan-fence.mjs'],
  review_fence_step: ['if (!Number.isInteger(step) || !plan.review.includes(step)) return null;', 'if (!Number.isInteger(step)) return null;', 'plan-fence.mjs'],
  review_fence_files: ["    return f && inside(resolve(cwd, f)) ? null : `${why} ${tool} to ${f || '(no path)'} is a write outside it.`;", "    return f && (inside(resolve(cwd, f)) || underFiles(resolve(cwd, f), planFiles(plan.text))) ? null : `${why} ${tool} to ${f || '(no path)'} is a write outside it.`;", 'plan-fence.mjs'],
  review_fence_notebook: ["const f = String(p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? '');", "const f = String(p.tool_input?.file_path ?? '');", 'plan-fence.mjs'],
  review_fence_redirect: ['  return out ? `${why} a redirect writes ${out}, outside it.` : null;', '  return null;', 'plan-fence.mjs'],
  review_fence_git: ["    if (w[0] === 'git' && !classify(w.map(quote).join(' '), at)) return `${why}", "    if (false && w[0] === 'git' && !classify(w.map(quote).join(' '), at)) return `${why}", 'plan-fence.mjs'],
  review_fence_pad: ['  const inside = (abs) => HARMLESS.has(abs) || inScratchpad(abs, p.session_id);', '  const inside = (abs) => HARMLESS.has(abs);', 'plan-fence.mjs'],
  review_fence_named: ["which the approval recorded as the plan's review step, and a review changes nothing outside the session scratchpad, whatever the plan's Files list allows;", 'which changes nothing outside the session scratchpad;', 'plan-fence.mjs'],
  review_fence_transcript: ['  try { const f = agentTranscript(p); return f ? agentStep(f) : null; } catch { return null; }', '  return null;', 'plan-fence.mjs'],

  // The go-word refusal fires only on an instruction to the owner (step 186, LESSONS §423).
  go_instruction: ['    for (const re of GO_ASK) { const m = re.exec(said); if (m) return m; }', '    for (const re of GO_ASK) { const m = re.exec(said); if (m) return m; }\n    if (/go-word/i.test(said)) return /go-word/i.exec(said);', 'stop-guard.mjs'],
  go_stopping_here: ['  if (STOPPING_HERE.test(open)) return null;\n', '\n', 'stop-guard.mjs'],
  go_gate_hold: ["    const said = s.replace(GATE_HOLD, ' ').trim();", '    const said = s.trim();', 'stop-guard.mjs'],
  go_imperative_start: ['(?:^|[:;,—]\\s*|\\s-\\s)', '', 'stop-guard.mjs'],
  go_subject: ['\\b(?:you|the owner)\\s+(?:(?:can', '\\b(?:you|the owner|the agent)\\s+(?:(?:can', 'stop-guard.mjs'],
  go_verbs: ['const GO_VERB = String.raw`(?:say|send|press|type|write|give)`;', 'const GO_VERB = String.raw`(?:say|send|press|type|write|give|reply|answer)`;', 'stop-guard.mjs'],
  go_object: ['continue|approved?|approval|yes)', 'continue|approved?|yes)', 'stop-guard.mjs'],

  // The plan gate's name check reads the whole session and the disk (step 199, LESSONS §424).
  names_wide_tail: ['const TAILS = [2, 8, 32, 64].map((mb) => mb * 1024 * 1024);', 'const TAILS = [16].map((mb) => mb * 1024 * 1024);', 'plan-guard.mjs'],
  names_exists_pad: ['    if (inside(ctx.pad, abs) && ctx.inScratchpad(abs, ctx.sid) && existsSync(abs)) return true;', '    if (false) return true;', 'plan-guard.mjs'],
  names_exists_repo: ['  return ctx.roots.some((root) => { const abs = resolve(root, name); return inside(root, abs) && existsSync(abs); });', '  return false;', 'plan-guard.mjs'],
  names_held_exists: ['.includes(x.name) && !onDisk(x.name, ctx) && !marked(x.name));', '.includes(x.name) && !marked(x.name));', 'plan-guard.mjs'],
  names_exists_real: ['function onDisk(name, ctx) {\n', 'function onDisk(name, ctx) {\n  if (name) return true;\n', 'plan-guard.mjs'],
  names_marked: ['  return `${ctx.mark} the plan names ', '  return `the plan names ', 'plan-guard.mjs'],

  // A command line is opened as a shell opens it, and a refusal names the character (step 199, LESSONS §424).
  opener_single_quote: ['    if (c === "\'" && !q) {\n      const j = s.indexOf("\'", i + 1);\n      if (j >= 0) i = j;\n      continue;\n    }\n', '', 'reply-guard.mjs'],
  opener_double_quote: ["    if (c === '\"') { q = !q; continue; }\n", "    if (c === '\"') { const j = s.indexOf('\"', i + 1); if (j >= 0) i = j; continue; }\n", 'reply-guard.mjs'],
  opener_backtick: ["    if (c === '`') {\n      let j = i + 1;", "    if (false) {\n      let j = i + 1;", 'reply-guard.mjs'],
  opener_dollar: ["    if (c === '$' && s[i + 1] === '(') {\n      const end = closeParen(s, i + 2);", "    if (false) {\n      const end = closeParen(s, i + 2);", 'reply-guard.mjs'],
  opener_op: ['out.push({ words, op, opener }); words = []; if (op) opener = op; };', 'out.push({ words, op, opener }); words = []; };', 'reply-guard.mjs'],
  opener_sub: ['commandsIn(str, depth + 1, any, sink).map((x) => (x.opener ? x : { ...x, opener })));', 'commandsIn(str, depth + 1, any, sink));', 'reply-guard.mjs'],
  opener_named: ['  return at ? ` The line opened this command at ${at}:', '  return false ? ` The line opened this command at ${at}:', 'plan-fence.mjs'],
  opener_named_cd: ['is refused: write every path in full.${openedNote(s)}', 'is refused: write every path in full.', 'plan-fence.mjs'],

  // The doctrine gate's refusal, the plan gate's refusal of a name and the identifier guard's refusal of the approval call set no latch (step 199, LESSONS §424).
  latch_doctrine_free: ["      if (o.deny) return refuse(reason, !(g.includes('plan-fence.mjs') && o.reason.includes('RULES FIRST, NO LATCH:')) && !g.includes('doctrine-read-guard.mjs'));", "      if (o.deny) return refuse(reason, !(g.includes('plan-fence.mjs') && o.reason.includes('RULES FIRST, NO LATCH:')));", 'hook-dispatch.mjs'],
  latch_names_free: ["  return shim === 'plan-guard.sh' && (String(reason ?? '').includes(NAMES_NO_LATCH) || String(reason ?? '').includes(APPROVED_NO_LATCH));", '  return false;', 'hook-dispatch.mjs'],
  latch_ident_free: ['  if (IDENT_SHIMS.has(shim)) return true;\n', '\n', 'hook-dispatch.mjs'],
  latch_other_plan: ["  return shim === 'plan-guard.sh' && (String(reason ?? '').includes(NAMES_NO_LATCH) || String(reason ?? '').includes(APPROVED_NO_LATCH));", "  return shim === 'plan-guard.sh';", 'hook-dispatch.mjs'],
  latch_ident_exit_only: ["  if (String(p?.tool_name ?? '') !== 'ExitPlanMode') return false;\n", '\n', 'hook-dispatch.mjs'],
  latch_other_shim: ['  if (IDENT_SHIMS.has(shim)) return true;\n', '  return true;\n', 'hook-dispatch.mjs'],

  // The review's staleness is narrowed by the After line of the plan's Order (step 199, LESSONS §424).
  after_parse: ['const g = /^\\s*(\\d+)\\s+after\\s+(\\d+(?:\\s+\\d+)*)\\s*\\.?\\s*$/i.exec(group);', 'const g = /^\\s*(\\d+)\\s+after\\s+(\\d+)\\s*\\.?\\s*$/i.exec(group);', 'report.mjs'],
  after_wired: ['  const follows = review ? reviewFollows(plan.text) : null;', '  const follows = null;', 'report.mjs'],
  after_sibling: ['  return ends.filter((e) => e.step !== null && order.includes(e.step) && !tied.has(e.step) && !(e.at < review.startAt));', '  return [];', 'report.mjs'],
  after_tied: ['!tied.has(e.step) && !(e.at < review.startAt));', '!(e.at < review.startAt));', 'report.mjs'],
  after_judged_end: ['  if (v && Number.isInteger(v.step)) tied.add(v.step);\n', '\n', 'report.mjs'],
  after_cleared_end: ['tied.add(v.next); for (const n of', 'for (const n of', 'report.mjs'],
  after_follows_end: [' for (const n of follows.get(v.next) ?? []) tied.add(n); }', ' }', 'report.mjs'],
  after_follows_valid: ['  return named.every((n) => o.order.includes(n)) ? a.follows : null;', '  return a.follows;', 'report.mjs'],
  after_follows_bad: ['if (!o || !a || a.bad.length || !a.follows.size) return null;', 'if (!o || !a || !a.follows.size) return null;', 'report.mjs'],
  after_block_text: ["The plan's After line does not tie step", "The plan's After line ties step", 'report.mjs'],
  after_plan_guard: ['    if (after) deny(after);\n', '\n', 'plan-guard.mjs'],
  after_outside_order: ['  if (!a.bad.length && !outside.length) return null;\n', '  if (!a.bad.length) return null;\n', 'hook-dispatch.mjs'],
  after_malformed: ['  if (!a.bad.length && !outside.length) return null;\n', '  if (!outside.length) return null;\n', 'hook-dispatch.mjs'],

  // Step 220, change 1: the Rules line and the Rules of this plan section are part of the approval's scope (LESSONS §433).
  rules_scope_sections: ["export const SCOPE_SECTIONS = ['Goals', 'Asked', 'Files', 'Commands', 'Rules', 'Rules of this plan'];", "export const SCOPE_SECTIONS = ['Goals', 'Asked', 'Files', 'Commands'];", 'report.mjs'],
  rules_scope_old_marker: [' && !(LATER_SCOPE.includes(n) && !Object.hasOwn(then, n))', '', 'report.mjs'],
  rules_scope_unrecorded: ['return known ? LATER_SCOPE.filter((n) => !Object.hasOwn(then, n)) : [];', 'return [];', 'report.mjs'],
  rules_block_unrecorded: ['for (const n of unrecorded) lines.push(', 'for (const n of []) lines.push(', 'report.mjs'],
  rules_block_recorded: ['const recorded = SCOPE_SECTIONS.filter((n) => !unrecorded.includes(n));', 'const recorded = SCOPE_SECTIONS;', 'report.mjs'],
  rules_amend_before: ['for (const n of scopeUnrecorded(mk.scope)) if (was[n] !== now[n]) moved.push(n);', 'void 0;', 'approved-plan-guard.mjs'],
  rules_review_text: ["${SCOPE_SECTIONS.join(', ')} do not), then send the review again.", 'Goals, Asked, Files and Commands do not), then send the review again.', 'hook-dispatch.mjs'],
  rules_pin_text: ['(the Rules line is part of the approved scope, so that edit voids the approval and the plan goes back through plan mode and the plan-mode button). ', '(an edit to it keeps the approval). ', 'hook-dispatch.mjs'],

  // Step 220, change 2: a plan mode the harness began at a compaction or a resume after the approval is not the plan's (LESSONS §432).
  restart_compact_boundary: ["if (e?.type === 'system' && e.subtype === 'compact_boundary') return true;", 'if (false) return true;', 'report.mjs'],
  restart_hook_resume: ['/^SessionStart:(?:resume|compact)$/.test(', '/^SessionStart:compact$/.test(', 'report.mjs'],
  restart_hook_compact: ['/^SessionStart:(?:resume|compact)$/.test(', '/^SessionStart:resume$/.test(', 'report.mjs'],
  restart_exit_resets: ["else if (e.attachment?.type === 'plan_mode_exit') start = -1;", 'else if (false) start = -1;', 'report.mjs'],
  restart_no_assistant: ["if (e?.type === 'assistant') return '';\n    }\n    return '';", "void 0;\n    }\n    return '';", 'report.mjs'],
  restart_boundary_after: ["if (isRestartBoundary(e)) return stamp(e) > since ? String(mk.plan) : '';", 'if (isRestartBoundary(e)) return String(mk.plan);', 'report.mjs'],
  restart_marker_hash: ["if (createHash('sha256').update(readFileSync(mk.plan)).digest('hex') !== String(mk.hash)) return '';", 'void 0;', 'report.mjs'],
  restart_session: ["if (mk.session && p.session_id && mk.session !== p.session_id) return '';", 'void 0;', 'report.mjs'],
  restart_via: ["const since = Date.parse(viaAt ?? mk.at ?? '');", "const since = Date.parse(mk.at ?? '');", 'report.mjs'],
  restart_exit_refused: ["if (tool !== 'ExitPlanMode') process.exit(0);\n    const { APPROVED_NO_LATCH }", 'process.exit(0);\n    const { APPROVED_NO_LATCH }', 'plan-guard.mjs'],
  restart_other_pass: ["if (tool !== 'ExitPlanMode') process.exit(0);\n    const { APPROVED_NO_LATCH }", "if (tool !== 'ExitPlanMode') void 0;\n    const { APPROVED_NO_LATCH }", 'plan-guard.mjs'],
  restart_lock: ['&& !locked && !p.plan_mode_forced', '&& !p.plan_mode_forced', 'plan-guard.mjs'],
  restart_forced: ['&& !locked && !p.plan_mode_forced', '&& !locked', 'plan-guard.mjs'],
  restart_no_latch_mark: ['${APPROVED_NO_LATCH} the plan is already approved', 'the plan is already approved', 'plan-guard.mjs'],
  restart_no_latch_dispatch: [" || String(reason ?? '').includes(APPROVED_NO_LATCH));", ');', 'hook-dispatch.mjs'],
  restart_classifier_dispatch: ["JSON.stringify({ ...p, permission_mode: 'plan', plan_mode_forced: true }), encoding: 'utf8',", "JSON.stringify({ ...p, permission_mode: 'plan' }), encoding: 'utf8',", 'hook-dispatch.mjs'],
  restart_lock_dispatch: ["JSON.stringify({ ...p, permission_mode: 'plan', plan_mode_forced: true }) : raw;", "JSON.stringify({ ...p, permission_mode: 'plan' }) : raw;", 'hook-dispatch.mjs'],
  restart_apg_standdown: ["if (p.permission_mode === 'plan' && !(!p.plan_mode_forced && restartedPlanMode(p))) process.exit(0);", "if (p.permission_mode === 'plan') process.exit(0);", 'approved-plan-guard.mjs'],
  restart_apg_forced: ["if (p.permission_mode === 'plan' && !(!p.plan_mode_forced && restartedPlanMode(p))) process.exit(0);", "if (p.permission_mode === 'plan' && !restartedPlanMode(p)) process.exit(0);", 'approved-plan-guard.mjs'],
  restart_classifier_apg: ["JSON.stringify({ ...p, permission_mode: 'plan', plan_mode_forced: true }), encoding: 'utf8', cwd: p.cwd || process.cwd() });", "JSON.stringify({ ...p, permission_mode: 'plan' }), encoding: 'utf8', cwd: p.cwd || process.cwd() });", 'approved-plan-guard.mjs'],

  // Step 220, change 3: the reply guard's release command passes the manager fence and the latch, and lifts the latch the reply guard set (LESSONS §432).
  release_parse_bad: ['return r && !r.bad ? r : null;', 'return r;', 'hook-dispatch.mjs'],
  release_fence: ["if (tool === 'Bash' && releaseCommand(input.command)) return null;", 'void 0;', 'hook-dispatch.mjs'],
  release_can: [" || (tool === 'Bash' && !!releaseCommand(cmd));", ';', 'hook-dispatch.mjs'],
  release_latch: ['if (latch && !status && !mainStop && !release && !reportWrite) return refuse(latchMessage(latch), false);', 'if (latch && !status && !mainStop && !reportWrite) return refuse(latchMessage(latch), false);', 'hook-dispatch.mjs'],
  release_lift: ['if (release && latch && releaseLifts(latch, release)) {', 'if (false) {', 'hook-dispatch.mjs'],
  release_lifts_target: ["return named.some((t) => (t.startsWith('call:') || want.startsWith('call:') ? t === want : site(t) === site(want)));", 'return true;', 'hook-dispatch.mjs'],
  release_lifts_origin: ["if (!latch || latch.own || !release || !REPLY_GUARD_REFUSAL.test(String(latch.reason ?? ''))) return false;", 'if (!latch || latch.own || !release) return false;', 'hook-dispatch.mjs'],
  release_lifts_agent: ["if (!latch || latch.own || !release || !REPLY_GUARD_REFUSAL.test(String(latch.reason ?? ''))) return false;", "if (!latch || !release || !REPLY_GUARD_REFUSAL.test(String(latch.reason ?? ''))) return false;", 'hook-dispatch.mjs'],
  release_note: ['? o.reason + RELEASE_NOTE : o.reason;', '? o.reason : o.reason;', 'hook-dispatch.mjs'],
  release_message: ["+ 'and the reply guard\\'s release command (node reply-guard.mjs --read, one plain command), which lifts a latch the reply guard set once the reading is recorded. '", "+ ''", 'hook-dispatch.mjs'],

  // Step 220, change 4: the model serving the main thread, and the line a top tier owes under a plan (LESSONS §434).
  tier_top_ids: ["return /fable|mythos/i.test(String(id ?? ''));", "return /fable/i.test(String(id ?? ''));", 'report.mjs'],
  tier_serving_main: ["if (e?.type !== 'assistant' || e.isSidechain || e.agentId) continue;", "if (e?.type !== 'assistant') continue;", 'report.mjs'],
  tier_serving_field: ['const m = e.message?.model;', 'const m = e.message?.model ?? e.message?.content?.find?.((b) => b?.input?.model)?.input?.model;', 'report.mjs'],
  tier_serving_synthetic: [' && !/^<.*>$/.test(m.trim())) return m.trim();', ') return m.trim();', 'report.mjs'],
  tier_status_line: ["  console.log(model);\n  console.log('');\n  console.log(status);", "  console.log('');\n  console.log(status);", 'report.mjs'],
  tier_line_top: ['  return isTopTier(id)\n    ? `Serving model: ${id}, the top tier.', '  return false\n    ? `Serving model: ${id}, the top tier.', 'report.mjs'],
  tier_stop_refuse: ['if (isTopTier(serving) && !tier.told && planInForce) {', 'if (false) {', 'stop-guard.mjs'],
  tier_stop_marker: ['if (isTopTier(serving) && !tier.told && planInForce) {', 'if (isTopTier(serving) && !tier.told) {', 'stop-guard.mjs'],
  tier_stop_once: ['try { setTier(payloadSession, { model: serving, told: true }); } catch { /* held again at the next stop */ }', 'void 0;', 'stop-guard.mjs'],
  tier_stop_change: ['if (!tier || tier.model !== serving) {', 'if (!tier) {', 'stop-guard.mjs'],
  tier_stop_names: ['return names && NEEDS_WORD.test(open);', 'return names;', 'stop-guard.mjs'],
  tier_stop_needs: ['return names && NEEDS_WORD.test(open);', 'return NEEDS_WORD.test(open);', 'stop-guard.mjs'],
  tier_stop_words: ['Open the follow-up with a line in these words: "${tierWords(serving)}" Where the work does need', 'Open the follow-up with a line in these words: "" Where the work does need', 'stop-guard.mjs'],
  tier_stop_follow: ['if (namesTier(said, t.model)) setTier(payloadSession, { model: t.model, told: true });', 'void 0;', 'stop-guard.mjs'],
  tier_stop_top_only: ['tier = { model: serving, told: !isTopTier(serving) };', 'tier = { model: serving, told: false };', 'stop-guard.mjs'],
};

async function runAll(dir, only, filter) {
  const imp = (f) => import(pathToFileURL(join(dir, f)).href + `?v=${Math.random()}`);
  const m = { pending: await imp('pending-guard.mjs'), keep: await imp('keep-info-guard.mjs'), recall: await imp('compact-recall.mjs'), reply: await imp('reply-guard.mjs'),
    report: await imp('report.mjs'), dispatch: await imp('hook-dispatch.mjs'), push: await imp('push-guard.mjs'), fence: await imp('plan-fence.mjs'), doctrine: await imp('doctrine-read-guard.mjs') };
  const results = [];
  for (const c of CASES) {
    if (only && !(c.guards ?? []).includes(only)) continue;
    if (filter && !c.name.includes(filter)) continue;
    let ok = false, err;
    try { ok = await c.run(m, dir); } catch (e) { ok = false; err = e?.message; }
    // EVERY CASE IS HELD TO THE PLANTED LIVE SESSION: a case that changed its page or its notes reached a
    // session through the inherited variable, fails for it, and puts the planted bytes back so the next case is judged alone.
    const leak = decoyChanged();
    if (leak) { ok = false; LEAKS++; err = `${err ? `${err}; ` : ''}LEAK: this case reached the planted live session (${leak})`; plantDecoy(); }
    results.push({ name: c.name, ok, err });
    while (MADE.length) rmSync(MADE.pop(), { recursive: true, force: true });
  }
  return results;
}

// Flags: --case=<words in a case's name> runs only those cases. --plants runs every plant; with --files=a.mjs,b.mjs it runs only
// the plants of those guard files, with --touched only the plants of the files `git status` shows changed in this checkout (the
// gates a commit touches), and with --dry it lists the plants it would run and runs none. A narrowed run is a quick look at what
// an edit can have broken: a case exercises more than one file, so the full run stays the gate.
const argValue = (name) => process.argv.find((x) => x.startsWith(`--${name}=`))?.slice(name.length + 3);
/**
 * The guard files this checkout has changed.
 * @returns {string[]|null} the top-level file names `git status` shows modified, added or untracked in
 *   this directory, or null when git cannot say (not a checkout), which `--touched` refuses to treat as
 *   "nothing touched".
 */
function touchedFiles() {
  const r = spawnSync('git', ['-C', HERE, 'status', '--porcelain', '-uall'], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  return (r.stdout ?? '').split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^.* -> /, '').trim());
}

if (process.argv.includes('--plants')) {
  let bad = 0;
  // Every guard a case cites has a plant behind it: a cited name with none is
  // a check nobody has watched go red.
  for (const g of new Set(CASES.flatMap((c) => c.guards ?? []))) {
    if (!PLANTS[g]) { console.log(`NO PLANT for "${g}": a case cites it, and nothing takes it out`); bad++; }
  }
  let narrowTo = null;
  const filesFlag = argValue('files');
  if (filesFlag !== undefined) narrowTo = filesFlag.split(',').map((s) => s.trim()).filter(Boolean);
  else if (process.argv.includes('--touched')) {
    narrowTo = touchedFiles();
    if (narrowTo === null) { console.log('--touched needs a git checkout of the guards; this directory is not one, so nothing is run.'); process.exit(1); }
  }
  const todo = Object.entries(PLANTS).filter(([, [, , file]]) => !narrowTo || narrowTo.includes(file));
  if (process.argv.includes('--dry')) {
    console.log(`PLANTS TO RUN: ${todo.length} of ${Object.keys(PLANTS).length}: ${todo.map(([k]) => k).join(', ')}`);
    rmSync(STATE, { recursive: true, force: true });
    process.exit(0);
  }
  if (narrowTo) console.log(`NARROWED to ${narrowTo.length ? narrowTo.join(', ') : 'no guard file'}: ${todo.length} of ${Object.keys(PLANTS).length} plants. The plants of the other files were not run; the full run is the gate.`);
  for (const [key, [from, to, file]] of todo) {
    const src = readFileSync(join(HERE, file), 'utf8');
    if (!src.includes(from)) { console.log(`PLANT ${key}: the line to take out is not in ${file} — the plant is stale`); bad++; continue; }
    const dir = mkdtempSync(join(tmpdir(), 'sg-plant-'));
    for (const f of FILES) copyFileSync(join(HERE, f), join(dir, f));
    writeFileSync(join(dir, file), src.replace(from, to));
    const r = await runAll(dir, key, argValue('case'));
    const caught = r.length > 0 && r.some((x) => !x.ok);
    if (!r.length) console.log(`PLANT ${key}: no case names it in its guards`);
    console.log(`${caught ? 'CAUGHT' : 'MISSED'}  plant "${key}" in ${file}${caught ? '' : ' — its cases still passed'}`);
    if (!caught) bad++;
    rmSync(dir, { recursive: true, force: true });
  }
  console.log(LEAKS ? `LEAK: the planted live session was changed in ${LEAKS} case run${LEAKS === 1 ? '' : 's'} of the plants` : 'planted live session unchanged by the plants');
  rmSync(STATE, { recursive: true, force: true });
  process.exit(bad ? 1 : 0);
} else {
  const r = await runAll(HERE, undefined, argValue('case'));
  for (const x of r) console.log(`${x.ok ? 'PASS' : 'FAIL'}  ${x.name}${x.err ? ` (${x.err})` : ''}`);
  const failedN = r.filter((x) => !x.ok).length;
  console.log(`${r.length - failedN}/${r.length} passed`);
  console.log(LEAKS ? `LEAK: the planted live session was changed in ${LEAKS} case${LEAKS === 1 ? '' : 's'} of the run` : 'planted live session unchanged by the run');
  rmSync(STATE, { recursive: true, force: true });
  process.exit(failedN ? 1 : 0);
}
