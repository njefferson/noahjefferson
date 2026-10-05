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
 * And the prints after a compaction or a resume, bounded (LESSONS §385): the
 * doctrine due from the heading of §0 up to the heading of §3 and every line at
 * a startup (doctrine-read-guard.mjs), the owner's messages typed after the last
 * reply, newest ten, with the count of the rest and a file holding all
 * (compact-recall.mjs), and the lessons as a count and a folder (session-brief.mjs).
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
  'push-guard.mjs', 'plan-fence.mjs', 'doctrine-read-guard.mjs', 'session-brief.mjs', 'CLAUDE.md'];
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
process.env.STOP_REFUSED_DIR = join(STATE, 'stop-refused');
process.env.SKIPPED_PRINTED_DIR = join(STATE, 'skipped-printed');
// The stop guard reads the approval marker under the home directory, and a real
// session's marker (a plan in force, steps left, no agent of the test's running)
// would refuse every case that ends a turn with no declaration. The whole suite
// runs under an empty home; a case that needs a plan makes its own (`world`).
process.env.HOME = join(STATE, 'home');
mkdirSync(join(process.env.HOME, '.claude'), { recursive: true });
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

/**
 * A home with an approved plan, a fresh status stamp and an empty launch
 * directory, and a way to run hook-dispatch.mjs inside it.
 * @param {string} dir  the hub copy under test.
 * @returns {{home: string, plan: string, cwd: string, tr: string, call: (event: string, payload: object) => object}}
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
  const call = (event, payload) => spawnSync('node', [join(dir, 'hook-dispatch.mjs'), event], {
    input: JSON.stringify({ cwd, transcript_path: tr, hook_event_name: event, ...payload }), encoding: 'utf8',
    env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: cwd },
  });
  return { home, plan, cwd, tr, call };
}
const latched = (s) => existsSync(join(process.env.REFUSAL_LATCH_DIR, `${s}.json`));
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

/** Each case: (m, dir) → true when the guards behaved. `guards` names the plants it must catch. */
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
    name: 'after a compaction only the messages typed after the last assistant reply come back: the newest ten, oldest first, then the count of the rest and the path of a file holding every one',
    guards: ['recall_after_reply', 'recall_prefilter', 'recall_unanswered', 'recall_cap', 'recall_newest', 'recall_rest', 'recall_file_write', 'recall_file_all', 'recall_file_name', 'segment_pick'],
    async run(m) {
      const answered = 'typed-before-the-reply, answered by it';
      const typed = [...'abcdefghijkl'].map((c) => `typed-${c}-after-the-reply`);
      const after = typed.map((t, i) => (i % 2 ? mid(20 + i, t) : turn(20 + i, t)));
      const written = namedTranscript([turn(0, answered), reply(5, 'Done, anything else?'), ...after, boundary(40), summary(40)]);
      const pending = namedTranscript([turn(0, answered), reply(5, 'Done, anything else?'), ...after]);
      // Every message since the previous compaction still comes back, which plan-scope-check.mjs prints to its judge; each is tagged.
      const w = await m.recall.messagesSinceCompaction(written);
      const p = await m.recall.messagesSinceCompaction(pending);
      const open = (x) => x.filter((y) => y.afterReply).map((y) => y.text).join('|');
      const file = m.recall.saveRecall(written, w);
      const block = m.recall.recallBlock(w, file);
      const filed = file && existsSync(file) ? readFileSync(file, 'utf8') : '';
      const other = m.recall.saveRecall(pending, p);
      const order = typed.slice(2).map((t) => block.indexOf(t));
      return w.length === 13 && p.length === 13 && w[0].text === answered && !w[0].afterReply
        && open(w) === typed.join('|') && open(p) === typed.join('|')
        && !block.includes(answered) && !block.includes(typed[0]) && !block.includes(typed[1])
        && order.every((i, k) => i >= 0 && (k === 0 || i > order[k - 1]))
        && block.includes('--- 3 of 12') && block.includes('--- 12 of 12') && !block.includes('--- 2 of 12')
        && /Not printed here: 2 older/.test(block) && !!file && block.includes(file)
        && basename(file) === `${basename(written, '.jsonl')}.txt` && !!other && other !== file
        && typed.every((t) => filed.includes(t)) && !filed.includes(answered)
        && (await m.recall.recallFor(written)) === block;
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
    name: 'hook-dispatch prints at most ten of the messages after a compaction, with the count of the rest and the file that holds them all, before the tool census',
    guards: ['dispatch_recall', 'recall_for'],
    run(m, dir) {
      const typed = [...'abcdefghijkl'].map((c) => `typed-${c}-after-the-reply`);
      const f = namedTranscript([turn(0, 'start'), reply(5, 'Done.'), ...typed.map((t, i) => turn(10 + i, t)), tool(30, 'u1', 'Bash', { command: 'ls' }), result(31, 'u1', 'x'), boundary(40), summary(40)]);
      const cwd = tmp('sg-cwd-');
      const r = spawnSync('node', [join(dir, 'hook-dispatch.mjs'), 'SessionStart'], { input: JSON.stringify({ session_id: sid('dr'), source: 'compact', transcript_path: f, cwd }), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: cwd } });
      const out = r.stdout ?? '';
      const file = join(process.env.COMPACT_RECALL_DIR, `${basename(f, '.jsonl')}.txt`);
      return r.status === 0 && out.includes('Not printed here: 2 older') && out.includes(file) && existsSync(file)
        && out.indexOf(typed[11]) >= 0 && out.indexOf(typed[11]) < out.indexOf('AFTER COMPACTION') && !out.includes(typed[1]) && out.includes(typed[2]);
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
    name: 'the manager fence lets the main thread read, send agents, stop a task, publish and write the status page, write its plan and enter and exit plan mode; nothing else, an Artifact quickstart included',
    guards: ['manager_fence', 'fence_artifact', 'fence_plan_file', 'fence_enter_plan', 'fence_status_write', 'fence_quickstart'],
    run(m) {
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const s = sid('mf');
      const reads = (q) => q.tool_name === 'Read' || (q.tool_name === 'Bash' && q.tool_input.command === 'git status');
      const f = (tool_name, tool_input = {}, extra = {}) => m.dispatch.managerFence({ session_id: s, tool_name, tool_input, ...extra }, { plan, classify: reads });
      const page = `/tmp/claude-0/-home-user/${s}/scratchpad/status/fix-run.html`;
      const otherPage = `/tmp/claude-0/-home-user/${s}/scratchpad/status.html`;
      const fenced = (x) => /^MANAGER FENCE/.test(x ?? '');
      return f('Read') === null && f('Bash', { command: 'git status' }) === null
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
    name: 'hook-dispatch runs the manager fence and the dispatch gate on the main thread, and lets it enter plan mode',
    guards: ['manager_wired', 'fence_enter_plan'],
    run(m, dir) {
      const w = world(dir);
      const s = sid('fw');
      const write = w.call('PreToolUse', { session_id: s, tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x' } });
      const s2 = sid('fw');
      const agent = w.call('PreToolUse', { session_id: s2, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const extra = w.call('PreToolUse', { session_id: sid('fw'), tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' } });
      const read = w.call('PreToolUse', { session_id: sid('fw'), tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      const enter = w.call('PreToolUse', { session_id: sid('fw'), tool_name: 'EnterPlanMode', tool_input: {} });
      return write.status === 2 && /MANAGER FENCE/.test(write.stderr) && agent.status === 0
        && extra.status === 2 && /DISPATCH GATE/.test(extra.stderr) && read.status === 0 && enter.status === 0;
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
      const call = () => w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
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
      const first = w.call('PreToolUse', { session_id: s, tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x' } });
      const read = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      const status = w.call('PreToolUse', { session_id: s, tool_name: 'Bash', tool_input: { command: `node "${join(dir, 'report.mjs')}" "Status 10:00 — a call was refused"` } });
      const ret = w.call('PreToolUse', { session_id: s, agent_id: 'a1', tool_name: 'StructuredOutput', tool_input: { result: 'x' } });
      const back = w.call('PreToolUse', { session_id: s, agent_id: 'a1', tool_name: 'SubagentHandback', tool_input: { message: 'x' } });
      const agentRead = w.call('PreToolUse', { session_id: s, agent_id: 'a1', tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
      return first.status === 2 && latched(s)
        && read.status === 2 && /REFUSAL LATCH/.test(read.stderr) && /MANAGER FENCE/.test(read.stderr)
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
      const call = (extra) => w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' }, ...extra });
      // Agent a1 writes outside the plan's Files: the plan fence refuses it.
      const refused = call({ agent_id: 'a1', tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'stray.txt'), content: 'x' } });
      const own = existsSync(agentFile('a1')) && !latched(s);
      const next = call({ agent_id: 'a1' });
      const back = call({ agent_id: 'a1', tool_name: 'SubagentHandback', tool_input: { message: 'Refused by the plan fence; nothing was written.' } });
      const second = call({ agent_id: 'a2' });
      const main = call({});
      const agentSend = call({ tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1`, subagent_type: 'general-purpose' } });
      const wait = call({ tool_name: 'Bash', tool_input: { command: `node ${join(dir, 'report.mjs')} --wait` } });
      // The main thread refused: the session's own latch, as before.
      const mainRefused = call({ tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x' } });
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
      const first = w.call('PreToolUse', { session_id: s, tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x' } });
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
      const pre = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' }, pad });
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
      const w = (file_path, extra = {}) => m.fence.decide({ session_id: s, agent_id: 'a1', tool_name: 'Write', tool_input: { file_path }, cwd: r.dir, ...extra }, { plan });
      const fenced = (x) => /^PLAN FENCE/.test(x ?? '');
      return w(join(r.dir, 'keep.mjs')) === null && w(join(r.dir, 'src', 'deep', 'x.ts')) === null && w(join(r.dir, 'docs', 'notes.md')) === null
        && w(`/tmp/claude-0/-home-user/${s}/scratchpad/a.txt`) === null
        && fenced(w(join(r.dir, 'other.mjs'))) && fenced(w(join(r.dir, 'src', '..', 'other.mjs'))) && fenced(w(join(r.dir, 'src')))
        && fenced(w(join(r.dir, 'docs', 'other.md'))) && fenced(w(`/tmp/claude-0/-home-user/someone-else/scratchpad/a.txt`))
        && w(join(r.dir, 'other.mjs'), { agent_id: undefined }) === null
        && fenced(m.fence.decide({ session_id: s, agent_id: 'a1', tool_name: 'Edit', tool_input: { file_path: join(r.dir, 'keep.mjs') }, cwd: r.dir }, { plan: null }));
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
      const b = (command, cwd = r.dir) => m.fence.decide({ session_id: s, agent_id: 'a1', tool_name: 'Bash', tool_input: { command }, cwd }, { plan });
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
      return m.fence.decide({ session_id: s, tool_name: 'Bash', tool_input: { command: 'rm -rf x' }, cwd: r.dir }, { plan }) === null;
    },
  },
  {
    name: 'the plan fence covers every tool an agent calls: only a read, an allowed write or command, its own TaskStop or its own return passes',
    guards: ['fence_every', 'fence_return', 'fence_taskstop'],
    run(m) {
      const plan = { path: '/plans/gate-test.md', text: STEPS_PLAN };
      const s = sid('pe');
      const call = (tool_name, tool_input = {}, reads) => m.fence.decide({ session_id: s, agent_id: 'a1', tool_name, tool_input, cwd: '/' }, { plan, ...(reads ? { reads } : {}) });
      const fenced = (x) => /^PLAN FENCE/.test(x ?? '');
      const no = () => false;
      return call('Read', { file_path: '/etc/hostname' }) === null && call('mcp__github__get_file_contents', { owner: 'o', repo: 'r', path: 'a' }) === null
        && call('SubagentHandback', { message: 'done' }, no) === null && call('StructuredOutput', { result: 'x' }, no) === null
        && fenced(call('Agent', { prompt: 'x', subagent_type: 'Explore' })) && fenced(call('Task', { prompt: 'x', subagent_type: 'Plan' }))
        && call('TaskStop', { task_id: 'x' }, no) === null && fenced(call('Artifact', { file_path: '/tmp/x.html' }))
        && fenced(call('mcp__github__push_files', { branch: 'main' })) && fenced(call('mcp__github__actions_run_trigger', {}))
        && fenced(call('ExitPlanMode', {})) && fenced(call('SomeToolNobodyHasHeardOf', {}))
        && m.fence.decide({ session_id: s, tool_name: 'Agent', tool_input: {} }, { plan }) === null;
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
      const w = (file_path) => m.fence.decide({ session_id: s, agent_id: 'a1', tool_name: 'Write', tool_input: { file_path }, cwd: '/' }, { plan });
      const b = (command) => m.fence.decide({ session_id: s, agent_id: 'a1', tool_name: 'Bash', tool_input: { command }, cwd: abg.dir }, { plan, classify: () => true });
      const fenced = (x) => /^PLAN FENCE/.test(x ?? '');
      return w(join(abg.dir, 'keep.mjs')) === null && fenced(w(join(oth.dir, 'keep.mjs')))
        && w(join(oth.dir, 'src', 'x.ts')) === null && fenced(w(join(abg.dir, 'src', 'x.ts')))
        && w(join(hub.dir, 'a.mjs')) === null && fenced(w(join(abg.dir, 'a.mjs')))
        && fenced(w(join(abg.dir, 'free.mjs')))
        && /live gate copy/.test(w(join(live, 'hook-dispatch.mjs')) ?? '') && fenced(w(join(live, 'x', 'y.mjs')))
        && fenced(b(`cat keep.mjs > ${live}/hook-dispatch.mjs`)) && b(`cat keep.mjs > ${abg.dir}/keep.mjs`) === null;
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
      const read = w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
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
    name: 'after a compaction or a resume the doctrine due is the lines from the heading of §0 up to the heading of §3, at any other start every line, and the line printed and the refusal say which',
    guards: ['doctrine_bounded', 'doctrine_startup_full', 'doctrine_range_from', 'doctrine_range_to', 'doctrine_range_to_after', 'doctrine_range_missing',
      'doctrine_range_read', 'doctrine_range_line', 'doctrine_range_refusal', 'doctrine_resumed_word', 'doctrine_marker_source'],
    run(m) {
      const hub = tmp('sg-hub-');
      const doc = join(hub, 'DOCTRINE.md');
      // The heading of §0 is line 3 and the heading of §3 line 11, so the lines due after a compaction are 3 to 10.
      writeFileSync(doc, ['# Doctrine', 'intro', '## 0. First', 'a', '## 0b. Second', 'b', '## 1. Identity', 'c', '## 2. Audience', 'd', '## 3. Taste', 'e', '## 4. Access', 'f'].join('\n') + '\n');
      // No such headings: nothing says what to read less, so every line is due.
      const bare = join(hub, 'BARE.md');
      writeFileSync(bare, 'one\ntwo\nthree\nfour\nfive\n');
      const s = sid('db');
      let n = 0;
      // Read results for ranges of a file ([first line, how many]), timed after the marker.
      const reads = (file, total, ranges) => ranges.flatMap(([start, count]) => {
        const id = `rr${++n}`;
        const when = later(5 + n);
        return [
          { type: 'assistant', timestamp: when, message: { role: 'assistant', content: [{ type: 'tool_use', id, name: 'Read', input: { file_path: file } }] } },
          { type: 'user', timestamp: when, message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content: Array.from({ length: count }, (_, k) => `${start + k}\tline`).join('\n') }] },
            toolUseResult: { type: 'text', file: { filePath: file, content: 'x', startLine: start, numLines: count, totalLines: total } } },
        ];
      });
      // The refusal for a Bash call after those reads, or null once they clear the marker.
      const gate = (source, file, ...ranges) => {
        m.doctrine.markDue({ session_id: s, source }, file);
        return m.doctrine.decide({ session_id: s, tool_name: 'Bash', tool_input: {} }, reads(file, file === doc ? 14 : 5, ranges), { classify: () => false, doctrine: file });
      };
      const refused = (r, text) => typeof r === 'string' && /^DOCTRINE GATE/.test(r) && r.includes(text);
      const cleared = gate('compact', doc, [3, 8]) === null
        && gate('compact', doc, [3, 4], [7, 4]) === null
        && gate('compact', doc, [3, 9]) === null
        && gate('resume', doc, [3, 8]) === null
        && gate('startup', doc, [1, 14]) === null
        && gate('compact', bare, [1, 5]) === null;
      const missingHeading = gate('compact', doc, [4, 7]);
      const missingLast = gate('compact', doc, [3, 7]);
      const outside = gate('compact', doc, [1, 2], [11, 4]);
      const startup = gate('startup', doc, [3, 8]);
      const cleared2 = gate('clear', doc, [3, 8]);
      const noHeadings = gate('compact', bare, [1, 3]);
      const line = m.doctrine.markDue({ session_id: s, source: 'compact' }, doc);
      const resumed = m.doctrine.markDue({ session_id: s, source: 'resume' }, doc);
      const recorded = JSON.parse(readFileSync(join(process.env.DOCTRINE_DUE_DIR, `${s}.json`), 'utf8')).source;
      const started = m.doctrine.markDue({ session_id: s, source: 'startup' }, doc);
      return cleared
        && refused(missingHeading, 'lines 3 to 10') && refused(missingLast, 'lines 3 to 10') && refused(outside, 'lines 3 to 10')
        && refused(startup, 'every line') && !/lines 3 to 10/.test(startup) && refused(cleared2, 'every line')
        && refused(noHeadings, 'every line')
        && /^DOCTRINE DUE/.test(line) && !line.includes('\n') && line.includes('was compacted') && line.includes('lines 3 to 10') && line.includes(doc)
        && /^DOCTRINE DUE/.test(resumed) && resumed.includes('was resumed') && resumed.includes('lines 3 to 10') && recorded === 'resume'
        && /^DOCTRINE DUE/.test(started) && started.includes('started') && started.includes('every line') && !started.includes('lines 3 to 10');
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
      const readAfter = w1.call('PreToolUse', { session_id: s1, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } });
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
    name: 'while the owner\'s newest message does not end with a go-word, every main-thread call is refused except the status command and TaskStop, without latching and without quoting it; a message whose last word is a go-word lifts it, and agents are not held by it',
    guards: ['correction_refuse', 'correction_go', 'correction_status', 'correction_taskstop', 'correction_no_latch', 'correction_agents', 'correction_midturn', 'go_words', 'go_last_word'],
    run(m, dir) {
      const WRONG = 'That was done wrong, so answer me before anything else.';
      const w = world(dir, [turn(0, GO), turn(5, WRONG)]);
      const s = sid('co');
      const call = (extra) => w.call('PreToolUse', { session_id: s, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' }, ...extra });
      const refused = call({});
      const write = call({ tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x' } });
      const enter = call({ tool_name: 'EnterPlanMode', tool_input: {} });
      const noLatch = !latched(s);
      const status = call({ tool_name: 'Bash', tool_input: { command: `node "${join(dir, 'report.mjs')}" "Status 10:00 — a correction stands"` } });
      const stop = call({ tool_name: 'TaskStop', tool_input: { task_id: 'bxyz789' } });
      const agent = call({ agent_id: 'a1' });
      const wait = call({ tool_name: 'Bash', tool_input: { command: `node ${join(dir, 'report.mjs')} --wait` } });
      // A go-word as the next prompt lifts it, with punctuation and case set aside.
      const lift = (text, entry) => { appendFileSync(w.tr, jsonl([entry ?? turn(10, text)])); return call({}).status; };
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
        && !said.includes('done wrong') && !said.includes('answer me before')
        && write.status === 2 && /CORRECTION/.test(write.stderr) && enter.status === 2 && /CORRECTION/.test(enter.stderr) && noLatch
        && status.status === 0 && stop.status === 0 && agent.status === 0 && wait.status === 2 && /CORRECTION/.test(wait.stderr)
        && afterGo === 0 && midWrong === 2 && midGo === 0 && goAhead === 2 && goInside === 2 && words.every((x) => x === 0)
        && longer.every((x) => x === 0) && notOwner;
    },
  },
  {
    name: 'a correction found in a transcript that cannot be read comes from the record UserPromptSubmit wrote; the record never overrides a readable one, and a harness prompt is not recorded',
    guards: ['correction_fallback', 'correction_record'],
    run(m, dir) {
      const w = world(dir);
      const lost = (s) => w.call('PreToolUse', { session_id: s, transcript_path: join(w.cwd, 'missing.jsonl'), tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } }).status;
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
      const readable = w5.call('PreToolUse', { session_id: s5, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' } }).status;
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
      const agent = (id, n, first) => {
        writeFileSync(join(subs, `agent-${id}.jsonl`), jsonl([at({ type: 'user', message: { role: 'user', content: `${w.plan} step ${n}` } }, later(-300)),
          at(tool(0, `${id}-b`, 'Bash', { command: 'git status' }), later(-200)), at(result(0, `${id}-b`, 'clean'), later(-199)),
          at(tool(0, `${id}-h`, 'SubagentHandback', { message: `${first}\nThe second line.` }), later(-100)), at(result(0, `${id}-h`, 'Report delivered to your caller.'), later(-99))]));
        writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step ${n}` }));
      };
      const send = (n) => w.call('PreToolUse', { session_id: sid('dq'), tool_name: 'Agent', tool_input: { prompt: `${w.plan} step ${n}`, subagent_type: 'general-purpose' } });
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
    guards: ['pointer_print', 'pointer_none', 'pointer_undefined', 'pointer_backs', 'pointer_report_path', 'pointer_found', 'pointer_found_read', 'pointer_page', 'pointer_escape', 'pointer_first', 'pointer_done_only', 'pointer_standing_not_order'],
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
        && /^next: step 2$/m.test(second) && second.includes("Order, each step's state: 1 DONE; 2 REFUSED.")
        && second.includes('- step 1, ended') && second.includes('    DONE\n    The goals are written.') && second.includes('    REFUSED\n    The fence refused the write.')
        && second.includes(`${join(pad, 'progress', 'step-1-report.txt')} (written)`) && second.includes(`${join(pad, 'progress', 'step-2-report.txt')} (not written)`)
        && second.includes('- step 1: Found: the doc check was not run') && second.includes('- step 1: Found: a <b>tag</b> in the report') && !second.includes('not a found line')
        && secondPage.includes('next: step 2') && secondPage.includes('Found: a &lt;b&gt;tag&lt;/b&gt; in the report') && !secondPage.includes('<b>tag</b>')
        && secondPage.includes('<strong>Step 1</strong> Build: <span class="s">DONE</span>') && secondPage.includes('<span class="s">REFUSED</span>')
        && /^next: none$/m.test(third) && third.includes("Order, each step's state: 1 DONE; 2 DONE.") && third.includes('Standing, sent at any time: 3 not sent.')
        && third.includes('The check is read.') && !third.includes('The fence refused the write.')
        && thirdPage.includes('next: none') && thirdPage.includes('the plan has run to its end') && thirdPage.includes('The thing may need a second read.')
        && /^next: not defined \(/m.test(noOrder) && /^next: not read \(no plan is in force/m.test(noPlan);
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
  dispatch_recall: ['    if (recall) printed.push(recall);\n', '\n', 'hook-dispatch.mjs'],
  // The prints after a compaction are bounded: the messages typed after the last reply, the newest ten, the rest counted and filed.
  recall_after_reply: ['  for (let i = seg.length - 1; i >= 0; i--) if (seg[i].reply) { lastReply = i; break; }\n', '\n', 'compact-recall.mjs'],
  recall_prefilter: ['const holdsText = line.includes(\'"assistant"\') && line.includes(\'"text"\');', 'const holdsText = false;', 'compact-recall.mjs'],
  recall_unanswered: ['const unanswered = (msgs) => msgs.filter((m) => m.afterReply !== false);', 'const unanswered = (msgs) => msgs;', 'compact-recall.mjs'],
  recall_cap: ['export const SHOWN = 10;', 'export const SHOWN = 100;', 'compact-recall.mjs'],
  recall_newest: ['  const shown = open.slice(-SHOWN);', '  const shown = open.slice(0, SHOWN);', 'compact-recall.mjs'],
  recall_rest: ['    + `Not printed here: ${rest} older (the ${shown.length} printed are the newest). `\n', '\n', 'compact-recall.mjs'],
  recall_file_write: ['    writeFileSync(file, open.map(', '    void (file, open.map(', 'compact-recall.mjs'],
  recall_file_all: ['writeFileSync(file, open.map(', 'writeFileSync(file, open.slice(-SHOWN).map(', 'compact-recall.mjs'],
  recall_for: ['  return recallBlock(msgs, saveRecall(path, msgs));', '  return recallBlock(msgs);', 'compact-recall.mjs'],
  recall_file_name: ["  const name = basename(String(path), '.jsonl')", "  const name = 'session'; String(path)", 'compact-recall.mjs'],
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
  manager_wired: ['    const fence = managerFence(p);\n    if (fence) return refuse(fence);\n', '\n', 'hook-dispatch.mjs'],
  dispatch_prompt: ['  if (!m) return refusal(`${head} Send exactly:', '  if (!m) return null; // ', 'hook-dispatch.mjs'],
  dispatch_step: ['  if (!planSteps(plan.text).includes(Number(m[1])))', '  if (false)', 'hook-dispatch.mjs'],
  dispatch_workflow: ["  if (tool === 'Workflow') return 'DISPATCH GATE", "  if (false) return 'DISPATCH GATE", 'hook-dispatch.mjs'],
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
  status_mtime_skip: ['    try { if (statSync(file).mtimeMs <= stampAt) continue; } catch { continue; }', '    try { statSync(file); } catch { continue; }', 'report.mjs'],
  status_unreadable: ['  if (!f) return null;\n  let names = [];', "  if (!f) return [{ id: 'unknown', description: '', how: 'unreadable', at: Date.now() }];\n  let names = [];", 'report.mjs'],
  // The refusal latch.
  latch_write: ["    if (latch && event === 'PreToolUse') { try { setLatch(p, why); }", '    if (false) { try { setLatch(p, why); }', 'hook-dispatch.mjs'],
  latch_stop_event: ["    if (latch && event === 'PreToolUse') { try {", '    if (latch) { try {', 'hook-dispatch.mjs'],
  latch_refuse: ['    if (latch && !status && !mainStop) return refuse(latchMessage(latch), false);\n', '\n', 'hook-dispatch.mjs'],
  latch_return: ["    if (p.agent_id && AGENT_RETURN.has(String(p.tool_name ?? ''))) return 0;\n", '\n', 'hook-dispatch.mjs'],
  latch_status: ['    if (latch && !status && !mainStop) return', '    if (latch && !mainStop) return', 'hook-dispatch.mjs'],
  latch_repo: ['        if (o.deny) return refuse(o.reason);\n', "        if (o.deny) { process.stderr.write(o.reason + '\\n'); return 2; }\n", 'hook-dispatch.mjs'],
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
  doctrine_cover: ['if (to >= from && rec.lines.size >= to - from + 1 && Array.from({ length: to - from + 1 }, (_, k) => from + k).every((n) => rec.lines.has(n))) return path;', 'if (rec.lines.size > 0) return path;', 'doctrine-read-guard.mjs'],
  // After a compaction or a resume the lines due are the heading of §0 up to the heading of §3; at a startup, every line.
  doctrine_bounded: ['  if (!BOUNDED_SOURCES.includes(source)) return null;', '  return null;', 'doctrine-read-guard.mjs'],
  doctrine_startup_full: ['  if (!BOUNDED_SOURCES.includes(source)) return null;', '  if (false) return null;', 'doctrine-read-guard.mjs'],
  doctrine_range_from: ['const from = lines.findIndex((l) => /^## 0\\. /.test(l));', 'const from = lines.findIndex((l) => /^## 0b\\. /.test(l));', 'doctrine-read-guard.mjs'],
  doctrine_range_to: ['  return { from: from + 1, to };', '  return { from: from + 1, to: to - 1 };', 'doctrine-read-guard.mjs'],
  doctrine_range_to_after: ['  return { from: from + 1, to };', '  return { from: from + 1, to: to + 1 };', 'doctrine-read-guard.mjs'],
  doctrine_range_missing: ['  if (from < 0 || to <= from) return null;', '  if (from < 0 || to <= from) return { from: 1, to: 1 };', 'doctrine-read-guard.mjs'],
  doctrine_range_read: ['if (readInFull(list, Number(due.at) || 0, doctrine, range)) {', 'if (readInFull(list, Number(due.at) || 0, doctrine)) {', 'doctrine-read-guard.mjs'],
  doctrine_range_line: ["cover ${linesDue(dueRange(p.source ?? '', doctrine))}", 'cover ${linesDue(null)}', 'doctrine-read-guard.mjs'],
  doctrine_range_refusal: ['cover ${linesDue(range)}, the main thread', 'cover ${linesDue(null)}, the main thread', 'doctrine-read-guard.mjs'],
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
  correction_refuse: ['      if (correction) return refuse(correctionMessage(correction), false);', '      if (false) return refuse(correctionMessage(correction), false);', 'hook-dispatch.mjs'],
  correction_go: ['  if (last) return endsWithGoWord(last.text) ? null : { at: last.at };', '  if (last) return { at: last.at };', 'hook-dispatch.mjs'],
  go_last_word: ["  return GO_WORDS.includes(words[words.length - 1]);", "  return GO_WORDS.includes(words.join(' '));", 'hook-dispatch.mjs'],
  correction_status: ['    if (status) {\n', '    if (false) {\n', 'hook-dispatch.mjs'],
  correction_taskstop: ['    if (!p.agent_id && !mainStop) {', '    if (!p.agent_id) {', 'hook-dispatch.mjs'],
  correction_agents: ['    if (!p.agent_id && !mainStop) {', '    if (!mainStop) {', 'hook-dispatch.mjs'],
  correction_no_latch: ['      if (correction) return refuse(correctionMessage(correction), false);', '      if (correction) return refuse(correctionMessage(correction));', 'hook-dispatch.mjs'],
  correction_midturn: ['    last = lastOwnerMessage(tail);\n    if (last) break;', "    last = lastOwnerMessage(tail.filter((e) => e?.type === 'user'));\n    if (last) break;", 'hook-dispatch.mjs'],
  go_words: ["export const GO_WORDS = ['go', 'ok', 'continue', 'approved', 'yes'];", "export const GO_WORDS = ['go', 'ok', 'continue', 'approved'];", 'hook-dispatch.mjs'],
  correction_fallback: ['    return r && r.go === false ? { at: Number(r.at) || 0 } : null;', '    return null;', 'hook-dispatch.mjs'],
  correction_record: ['  if (!prompt.trim() || HARNESS_TAG.test(prompt)) return false;', '  if (!prompt.trim()) return false;', 'hook-dispatch.mjs'],
  correction_widen: ['  else for (const mb of [2, 8, 32]) {', '  else for (const mb of [2]) {', 'hook-dispatch.mjs'],
  reminder_wording: ["  'First line: what you are doing now.',\n", "  'First line: what you are doing now and what comes next. A status at least every five minutes',\n", 'hook-dispatch.mjs'],
  // The talk before a plan is judged against the plan file's last write.
  talk_after_edit: ['    if (planWrittenAt && Number.isFinite(at) && at < planWrittenAt) {', '    if (false) {', 'plan-guard.mjs'],
  talk_asks_nothing: ['    if (said.length > 40 && asksNothing(said)) talk = i;', '    if (said.length > 40) talk = i;', 'plan-guard.mjs'],
  talk_newest: ['    if (said.length > 40 && asksNothing(said)) talk = i;', '    if (talk < 0 && said.length > 40 && asksNothing(said)) talk = i;', 'plan-guard.mjs'],
  talk_owner_after: ['    for (let i = talk + 1; i < entries.length; i++) if (isOwnerMessage(entries[i])) return null;', '    for (let i = talk + 1; i < entries.length; i++) if (true) return null;', 'plan-guard.mjs'],
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
  steps_correction: ['    && !correctionStanding({ session_id: hook.session_id, transcript_path: path })) left = stepsLeft(state);', '    ) left = stepsLeft(state);', 'stop-guard.mjs'],
  steps_plan_in_force: ['  const plan = approvedPlan();\n  if (!plan || !state) return [];', "  const plan = { text: '## Steps\\n1. x\\n2. y\\n' };\n  if (!plan || !state) return [];", 'stop-guard.mjs'],
  steps_report_only: ["  for (const e of s.ends) if (e.how === 'a report' && e.step !== null) returned.add(e.step);", '  for (const e of s.ends) if (e.step !== null) returned.add(e.step);', 'report.mjs'],
  steps_step_read: ['    const step = agentStep(path);\n    if (!end) {', '    const step = 1;\n    if (!end) {', 'report.mjs'],
  // The pointer: the first step in Order with no DONE hand-back, read by the status, the dispatch gate and the stop guard.
  pointer_order_read: ["    return line ? [...new Set([...line.replace(/^[^:]*:/, '').matchAll(/\\d+/g)].map((x) => Number(x[0])))] : [];", "    return line ? [...new Set([...m[1].matchAll(/\\d+/g)].map((x) => Number(x[0])))] : [];", 'report.mjs'],
  pointer_standing_not_order: ["  return order.length ? { order, standing: numbers('Standing') } : null;", "  return order.length ? { order: [...order, ...numbers('Standing')], standing: numbers('Standing') } : null;", 'report.mjs'],
  pointer_first: ['next: o.order.find((n) => !done.has(n)) ?? null', 'next: [...o.order].reverse().find((n) => !done.has(n)) ?? null', 'report.mjs'],
  pointer_done_only: [' && DONE.test(firstLineOf(e.last))) done.add(e.step);', ') done.add(e.step);', 'report.mjs'],
  pointer_report_only: ["if (e.how === 'a report' && e.step !== null && DONE.test(", 'if (e.step !== null && DONE.test(', 'report.mjs'],
  pointer_print: ['  console.log(pointerBlock(state));\n', '\n', 'report.mjs'],
  pointer_none: ["  const out = [p.next === null ? 'next: none' : `next: step ${p.next}`,", '  const out = [`next: step ${p.next}`,', 'report.mjs'],
  pointer_undefined: ['  if (!st.pointer) return `next: not defined (${st.why}).`;\n', '\n', 'report.mjs'],
  pointer_backs: ["      ...(x.back.lines.length ? x.back.lines.map((l) => `    ${l}`) : ['    (the agent ended with no text)']),\n", '\n', 'report.mjs'],
  pointer_report_path: ["      `  Report file: ${x.report} (${x.reportWritten ? 'written' : 'not written'})`);", '      );', 'report.mjs'],
  pointer_found: ['  for (const f of st.found) out.push(', '  for (const f of []) out.push(', 'report.mjs'],
  pointer_found_read: ["if (/^Found:/.test(l.trim())) out.push(", 'if (true) out.push(', 'report.mjs'],
  pointer_page: ["      writeFileSync(join(pad, 'status', 'fix-run.html'), statusPage(state, status));", '      void 0;', 'report.mjs'],
  pointer_escape: [".replace(/</g, '&lt;')", '', 'report.mjs'],
  // The dispatch gate sends only N and a Standing step, and the stop guard reads N.
  dispatch_pointer: ['  if (ptr && Number(m[1]) !== ptr.next && !ptr.standing.includes(Number(m[1]))) {', '  if (false) {', 'hook-dispatch.mjs'],
  dispatch_pointer_none: ['  if (ptr && Number(m[1]) !== ptr.next && !ptr.standing', '  if (ptr && ptr.next !== null && Number(m[1]) !== ptr.next && !ptr.standing', 'hook-dispatch.mjs'],
  dispatch_standing: [' && !ptr.standing.includes(Number(m[1]))) {', ') {', 'hook-dispatch.mjs'],
  dispatch_pointer_prints: ["'next: none (every step in Order has a DONE hand-back)' : `next: step ${ptr.next}`}", "'next: none (every step in Order has a DONE hand-back)' : 'next: a step'}", 'hook-dispatch.mjs'],
  dispatch_pointer_read: ['  if (ptr === undefined) { try { ptr = pointerFor(p, plan.text); } catch { ptr = null; } }', '  if (ptr === undefined) { ptr = null; }', 'hook-dispatch.mjs'],
  stop_pointer: ['  if (planOrder(plan.text)) {', '  if (false) {', 'stop-guard.mjs'],
  stop_pointer_named: ["the plan's pointer at next: step ${left[0]}, ", "the plan's pointer, ", 'stop-guard.mjs'],
};

async function runAll(dir, only) {
  const imp = (f) => import(pathToFileURL(join(dir, f)).href + `?v=${Math.random()}`);
  const m = { pending: await imp('pending-guard.mjs'), keep: await imp('keep-info-guard.mjs'), recall: await imp('compact-recall.mjs'), reply: await imp('reply-guard.mjs'),
    report: await imp('report.mjs'), dispatch: await imp('hook-dispatch.mjs'), push: await imp('push-guard.mjs'), fence: await imp('plan-fence.mjs'), doctrine: await imp('doctrine-read-guard.mjs') };
  const results = [];
  for (const c of CASES) {
    if (only && !(c.guards ?? []).includes(only)) continue;
    let ok = false, err;
    try { ok = await c.run(m, dir); } catch (e) { ok = false; err = e?.message; }
    results.push({ name: c.name, ok, err });
    while (MADE.length) rmSync(MADE.pop(), { recursive: true, force: true });
  }
  return results;
}

if (process.argv.includes('--plants')) {
  let bad = 0;
  // Every guard a case cites has a plant behind it: a cited name with none is
  // a check nobody has watched go red.
  for (const g of new Set(CASES.flatMap((c) => c.guards ?? []))) {
    if (!PLANTS[g]) { console.log(`NO PLANT for "${g}": a case cites it, and nothing takes it out`); bad++; }
  }
  for (const [key, [from, to, file]] of Object.entries(PLANTS)) {
    const src = readFileSync(join(HERE, file), 'utf8');
    if (!src.includes(from)) { console.log(`PLANT ${key}: the line to take out is not in ${file} — the plant is stale`); bad++; continue; }
    const dir = mkdtempSync(join(tmpdir(), 'sg-plant-'));
    for (const f of FILES) copyFileSync(join(HERE, f), join(dir, f));
    writeFileSync(join(dir, file), src.replace(from, to));
    const r = await runAll(dir, key);
    const caught = r.length > 0 && r.some((x) => !x.ok);
    if (!r.length) console.log(`PLANT ${key}: no case names it in its guards`);
    console.log(`${caught ? 'CAUGHT' : 'MISSED'}  plant "${key}" in ${file}${caught ? '' : ' — its cases still passed'}`);
    if (!caught) bad++;
    rmSync(dir, { recursive: true, force: true });
  }
  rmSync(STATE, { recursive: true, force: true });
  process.exit(bad ? 1 : 0);
} else {
  const r = await runAll(HERE);
  for (const x of r) console.log(`${x.ok ? 'PASS' : 'FAIL'}  ${x.name}${x.err ? ` (${x.err})` : ''}`);
  const failedN = r.filter((x) => !x.ok).length;
  console.log(`${r.length - failedN}/${r.length} passed`);
  rmSync(STATE, { recursive: true, force: true });
  process.exit(failedN ? 1 : 0);
}
