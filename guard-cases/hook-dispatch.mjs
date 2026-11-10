// The cases and plants of hook-dispatch.mjs, plan-guard.mjs and approved-plan-guard.mjs added by step 120 of the plan of 8 November: the seed's batch
// command (Q-HUB-275), the forced-turns count in the Cost (Q-HUB-282), the model switch that counts at once (Q-HUB-288), the reads gate since the
// approval (Q-HUB-290), an id a launch printed (Q-HUB-291), a rule named by number (Q-HUB-309), the wait for an agent paused on its run (Q-HUB-317),
// the approval guard's route (Q-HUB-323), one file for a What is name (Q-HUB-325), the talk check past a refusal (Q-HUB-326), the words of the gates
// that read an earlier call (Q-HUB-327), the check of a call asking both guards (Q-HUB-328), the seed at a resumed plan mode (Q-HUB-336), the
// decisions check (Q-HUB-340) and a Verification read outside the record (Q-HUB-341), and by step 141 of the plan of 9 November: the page
// refresh after the notes (Q-HUB-347), the hook loop's identifier skip (Q-HUB-349), a rule under a sub-heading (Q-HUB-351) and the read in plan
// mode with no plan (Q-HUB-362); and by step 190 of the plan of 10 November: the price of a plan's sends, the print of the sends so far at each
// owner message, the reminder in the form that fits the message, and the hub's copies brought forward at a start. The shape of this file is
// guard-cases/shape.mjs.
import { mkdirSync, writeFileSync, utimesSync, readFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const FABLE = 'claude-fable-1';
const SONNET = 'claude-sonnet-5';

// A git identity for the planted repositories of this file, so a commit made in one needs no configuration of the container.
const GIT_ENV = { ...process.env, GIT_AUTHOR_NAME: 'planted', GIT_AUTHOR_EMAIL: 'planted@example.invalid', GIT_COMMITTER_NAME: 'planted', GIT_COMMITTER_EMAIL: 'planted@example.invalid' };
const gitAt = (d, ...a) => spawnSync('git', ['-C', d, ...a], { encoding: 'utf8', env: GIT_ENV });

/**
 * A planted checkout of the hub with a bare origin, both under a temporary folder.
 * @param {object} h  the suite's helpers.
 * @param {{behind?: number, ahead?: number, branch?: string|null, dirty?: boolean, broken?: boolean}} [o]  `behind` commits are on the origin's main and
 *   not in the checkout; `ahead` commits are in the checkout and not on the origin; `branch` checks out a new branch; `dirty` leaves an untracked
 *   file; `broken` points the origin at a folder that is not a repository.
 * @returns {{dir: string, g: Function, write: Function, origin: string}} the repository `h.repo` gives, with the origin's path.
 */
function hubCheckout(h, o = {}) {
  const origin = h.tmp('sg-origin-');
  gitAt(origin, 'init', '-q', '--bare');
  gitAt(origin, 'symbolic-ref', 'HEAD', 'refs/heads/main');
  const r = h.repo({ 'hook-dispatch.mjs': '// a planted dispatcher\n', 'DOCTRINE.md': '# a planted doctrine\n' }, 'hub');
  r.g('branch', '-M', 'main');
  r.g('remote', 'add', 'origin', origin);
  r.g('push', '-q', 'origin', 'main');
  const behind = o.behind ?? 0;
  for (let i = 1; i <= behind; i++) { r.write(`c${i}.txt`, `change ${i}\n`); r.g('add', '-A'); r.g('commit', '-q', '-m', `change ${i}`); r.g('push', '-q', 'origin', 'main'); }
  if (behind) r.g('reset', '-q', '--hard', `HEAD~${behind}`);
  for (let i = 1; i <= (o.ahead ?? 0); i++) { r.write(`local${i}.txt`, 'a local commit\n'); r.g('add', '-A'); r.g('commit', '-q', '-m', `local ${i}`); }
  if (o.branch) r.g('checkout', '-q', '-b', o.branch);
  if (o.dirty) r.write('dirty.txt', 'not committed\n');
  if (o.broken) r.g('remote', 'set-url', 'origin', join(origin, 'no-such-remote'));
  return { ...r, origin };
}

export const cases = [
  {
    name: 'Q-HUB-275: the manager fence, the check of a call, the plan guard in plan mode and the equality of the two copies pass the plan seed\'s batch command (--batch with the optional size, steps, repo, plan and hub arguments) and refuse it chained, with another flag, with an extra word or with no item or batch',
    guards: ['seed_batch_dispatch', 'seed_batch_planguard'],
    run(m, dir, h) {
      const seed = join(dir, 'plan-seed.mjs');
      const good = [`node ${seed} --batch`, `node ${seed} --batch --size 3 --repo /home/user/x --hub /home/user/y`, `node ${seed} --size 3 --batch`, `node "${seed}" --plan /root/.claude/plans/a.md --batch --steps 4`];
      const bad = [`node ${seed} --batch && touch /tmp/x`, `node ${seed} --size 3`, `node ${seed} --batch --out /tmp/x`, `node ${seed} --batch extra`, `node ${seed} --batch=1`, `node ${seed} --batch $(touch x)`];
      const planMode = (c) => spawnSync('node', [join(dir, 'plan-guard.mjs')], { encoding: 'utf8', env: process.env,
        input: JSON.stringify({ session_id: 'sd', permission_mode: 'plan', tool_name: 'Bash', tool_input: { command: c }, cwd: h.tmp('sg-cwd-') }) }).status;
      const bash = (command) => ({ tool_name: 'Bash', tool_input: { command }, session_id: 'sd', cwd: '/' });
      const opts = { plan: null, classify: () => false, guards: false };
      return h.assertAll([
        ['the dispatcher\'s test passes each batch command', good.every((c) => m.dispatch.isSeedCommand(c)), good.map((c) => m.dispatch.isSeedCommand(c))],
        ['the dispatcher\'s test refuses each other line', bad.every((c) => !m.dispatch.isSeedCommand(c)), bad.map((c) => m.dispatch.isSeedCommand(c))],
        ['the plan guard in plan mode passes each batch command', good.every((c) => planMode(c) === 0), good.map(planMode)],
        ['the plan guard in plan mode refuses each other line', bad.every((c) => planMode(c) === 2), bad.map(planMode)],
        ['the check of a call frees each batch command', good.every((c) => m.dispatch.canCall(bash(c), opts).free === true), good.map((c) => m.dispatch.canCall(bash(c), opts).free)],
      ]);
    },
  },
  {
    name: 'Q-HUB-434: the dispatcher\'s test of the plan seed\'s command and the plan guard\'s copy of it pass the batch print with the rounds switch and one digit from one to five, and refuse a value outside one to five, a value with anything joined to it, no value, a switch spelled another way, and the line chained or with an extra word',
    guards: ['seed_rounds_dispatch_range', 'seed_rounds_dispatch_accepts'],
    run(m, dir, h) {
      const seed = join(dir, 'plan-seed.mjs');
      const good = [`node ${seed} --batch --rounds 1`, `node ${seed} --batch --rounds 5`, `node ${seed} --rounds 3 --batch`, `node "${seed}" --batch --rounds 2 --size 3 --repo /home/user/x --hub /home/user/y`];
      const bad = [`node ${seed} --batch --rounds 6`, `node ${seed} --batch --rounds 0`, `node ${seed} --batch --rounds 35`, `node ${seed} --batch --rounds 3x`, `node ${seed} --batch --rounds=3`,
        `node ${seed} --batch --rounds`, `node ${seed} --batch --rounds three`, `node ${seed} --batch --round 3`, `node ${seed} --rounds 3`, `node ${seed} --batch --rounds 3 extra`,
        `node ${seed} --batch --rounds 3 && touch /tmp/x`, `node ${seed} --batch --rounds $(touch x)`, `node ${seed} --batch --rounds "3 --out /tmp/x"`];
      const planMode = (c) => spawnSync('node', [join(dir, 'plan-guard.mjs')], { encoding: 'utf8', env: process.env,
        input: JSON.stringify({ session_id: 'sd', permission_mode: 'plan', tool_name: 'Bash', tool_input: { command: c }, cwd: h.tmp('sg-cwd-') }) }).status;
      const bash = (command) => ({ tool_name: 'Bash', tool_input: { command }, session_id: 'sd', cwd: '/' });
      const opts = { plan: null, classify: () => false, guards: false };
      return h.assertAll([
        ['the dispatcher\'s test passes each batch command with the rounds switch', good.every((c) => m.dispatch.isSeedCommand(c)), good.map((c) => m.dispatch.isSeedCommand(c))],
        ['the dispatcher\'s test refuses each other line', bad.every((c) => !m.dispatch.isSeedCommand(c)), bad.map((c) => m.dispatch.isSeedCommand(c))],
        ['the plan guard in plan mode passes each batch command with the rounds switch', good.every((c) => planMode(c) === 0), good.map(planMode)],
        ['the plan guard in plan mode refuses each other line', bad.every((c) => planMode(c) === 2), bad.map(planMode)],
        ['the check of a call frees each batch command with the rounds switch', good.every((c) => m.dispatch.canCall(bash(c), opts).free === true), good.map((c) => m.dispatch.canCall(bash(c), opts).free)],
        ['the check of a call does not free any other line', bad.every((c) => m.dispatch.canCall(bash(c), opts).free === false), bad.map((c) => m.dispatch.canCall(bash(c), opts).free)],
      ]);
    },
  },
  {
    name: 'Q-HUB-282: a plan whose Rules hold its commits for a later landing has to count, in its Cost, the turns the environment\'s stop hook forces; a plan that holds none, and a Cost that counts them, pass',
    guards: ['cost_forced_turns'],
    run(m, dir, h) {
      const plan = (rule, cost) => ['# A cost plan', '', '## Rules of this plan', rule, '', '## Steps', '1. **One.** Do it.', '', '## Cost', cost, ''].join('\n');
      const BASE = 'Two pushes. Three agent sends on the sonnet tier.';
      const holds = 'Every step holds its commits for the landing step.';
      const without = m.dispatch.costProblem(plan(holds, BASE));
      const counted = m.dispatch.costProblem(plan(holds, `${BASE} About four forced turns from the stop hook while a commit stands.`));
      const noHold = m.dispatch.costProblem(plan('Every step pushes its own commit.', BASE));
      return h.assertAll([
        ['a plan holding commits with no count is refused for the count', typeof without === 'string' && /stop hook forces/.test(without), without],
        ['a Cost that counts the forced turns passes', counted === null, counted],
        ['a plan that holds no commits is not asked', noHold === null, noHold],
      ]);
    },
  },
  {
    name: 'Q-HUB-288: the tier hold counts a model switch at once: a switch to a top-tier model recorded after the newest main-thread reply holds a send though that reply names a lesser model, and a reply after the switch shows the model itself',
    guards: ['tier_switch_record'],
    run(m, dir, h) {
      const s = h.sid('ts');
      h.notesPad(s, '');
      const plan = { path: '/plans/gate-test.md', text: h.STEPS_PLAN };
      const p = { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${plan.path} step 1`, subagent_type: 'general-purpose' } };
      const before = m.dispatch.dispatchGate(p, plan, null, [h.modelReply(-60, 'Working.', SONNET)]);
      m.dispatch.modelSwitch('PostModelSwitch', { session_id: s, from_model: SONNET, to_model: FABLE });
      const after = m.dispatch.dispatchGate(p, plan, null, [h.modelReply(-60, 'Working.', SONNET)]);
      const replied = m.dispatch.dispatchGate(p, plan, null, [h.modelReply(-60, 'Working.', SONNET), h.modelReply(60, 'Still working.', SONNET)]);
      return h.assertAll([
        ['before any switch the lesser model is not held', !/top tier/.test(String(before)), String(before).slice(0, 200)],
        ['after the switch record a reply that names the lesser model still holds the send', /top tier/.test(String(after)), String(after).slice(0, 200)],
        ['a reply after the switch shows the model and the record yields', !/top tier/.test(String(replied)), String(replied).slice(0, 200)],
      ]);
    },
  },
  {
    name: 'Q-HUB-290: the reads gate holds a send only on a refused read made since the plan in force was approved; a refusal from before the approval holds nothing, and one after it does',
    guards: ['reads_since_approval'],
    run(m, dir, h) {
      const plan = { path: '/plans/gate-test.md', text: h.STEPS_PLAN, approvedAt: Date.now() - 10000 };
      const p = { session_id: h.sid('rg'), tool_name: 'Agent', tool_input: { prompt: `${plan.path} step 1` } };
      const old = m.dispatch.readsGate(p, plan, [{ path: '/x/old.md', at: Date.now() - 86400000, why: 'refused' }]);
      const fresh = m.dispatch.readsGate(p, plan, [{ path: '/x/old.md', at: Date.now() - 86400000, why: 'refused' }, { path: '/x/new.md', at: Date.now() - 100, why: 'refused' }]);
      return h.assertAll([
        ['a refusal from before the approval holds nothing', old === null, old],
        ['a refusal since the approval holds the send and names only it', typeof fresh === 'string' && fresh.includes('/x/new.md') && !fresh.includes('/x/old.md'), fresh],
      ]);
    },
  },
  {
    name: 'Q-HUB-291: an id that a launch result of the session printed counts as read for the main thread\'s stop of that task; an id no result printed, an agent\'s call and another tool do not',
    guards: ['ident_launch_result'],
    run(m, dir, h) {
      const entries = [h.tool(0, 'l1', 'Bash', { command: 'node long.mjs' }), h.result(1, 'l1', 'Command running in background with ID: bk7x3q9zd. Output is being written to a file.')];
      const stop = (id, extra = {}) => ({ tool_name: 'TaskStop', tool_input: { task_id: id }, ...extra });
      return h.assertAll([
        ['the printed id counts', m.dispatch.idInLaunchResult(stop('bk7x3q9zd'), entries) === true, m.dispatch.idInLaunchResult(stop('bk7x3q9zd'), entries)],
        ['an id never printed does not', m.dispatch.idInLaunchResult(stop('zz9zz9zz9'), entries) === false, m.dispatch.idInLaunchResult(stop('zz9zz9zz9'), entries)],
        ['an agent\'s call does not', m.dispatch.idInLaunchResult(stop('bk7x3q9zd', { agent_id: 'a1' }), entries) === false, 'agent'],
        ['another tool does not', m.dispatch.idInLaunchResult({ tool_name: 'Read', tool_input: { task_id: 'bk7x3q9zd' } }, entries) === false, 'Read'],
      ]);
    },
  },
  {
    name: 'Q-HUB-309: a step that names a rule of the plans page by number is read against the page\'s numbering: a number the page does not hold, and a quoted phrase the named rule does not carry, are refused; the right rule, and a mention that does not name the plans page, pass',
    guards: ['rule_number_missing', 'rule_number_quote'],
    run(m, dir, h) {
      const tmp = h.tmp('sg-rules-');
      const page = join(tmp, 'plans.md');
      writeFileSync(page, ['## 0e. PLAN MODE ONLY.', '', '1. **Tell the owner in the first line.** Say what is being done.', '2. **A status when an agent has ended.** The status says what changed.', '3. **Reply to every point.**', '', '## 0g. Next section', ''].join('\n'));
      const plan = (line) => ['# A rule plan', '', '## Steps', `1. **One.** ${line}`, ''].join('\n');
      const missing = m.dispatch.ruleNumberProblem(plan('Put a line under rule 9 of the plans page for the new rule.'), { page });
      const wrong = m.dispatch.ruleNumberProblem(plan('Put a line under rule 2 of the plans page ("the pasted-block rule") for the new rule.'), { page });
      const right = m.dispatch.ruleNumberProblem(plan('Put a line under rule 2 of the plans page ("what changed") for the new rule.'), { page });
      const elsewhere = m.dispatch.ruleNumberProblem(plan('Follow rule 9 of the app\'s own notes for the new rule.'), { page });
      return h.assertAll([
        ['a number the page does not hold is refused', typeof missing === 'string' && /rule 9 is not a rule/.test(missing), missing],
        ['a phrase the rule does not carry is refused', typeof wrong === 'string' && /does not hold "the pasted-block rule"/.test(wrong), wrong],
        ['the right rule passes', right === null, right],
        ['a mention that does not name the plans page passes', elsewhere === null, elsewhere],
      ]);
    },
  },
  {
    name: 'Q-HUB-317: the manager fence passes the wait between statuses while every flagged agent\'s note names an output file written within five minutes, and refuses it when the file is older, when the note names none, or when one flagged agent is not paused',
    guards: ['wait_paused_passes'],
    run(m, dir, h) {
      const s = h.sid('wp');
      const notesFile = h.notesPad(s, '');
      const pad = join(notesFile, '..', '..');
      mkdirSync(join(pad, 'progress'), { recursive: true });
      const out = join(h.tmp('sg-out-'), 'run.output');
      writeFileSync(out, 'line one\nline two\n');
      const note = (n, text) => writeFileSync(join(pad, 'progress', `step-${n}.txt`), text);
      note(3, `label: plants of one file, output ${out}\n`);
      note(4, 'label: a run with no output file named\n');
      const wait = (flagged) => m.dispatch.managerFence({ session_id: s, tool_name: 'Bash', tool_input: { command: `node ${join(dir, 'report.mjs')} --wait` } }, { flagged });
      const paused = wait([{ id: 'x', step: 3 }]);
      const named = wait([{ id: 'y', step: 4 }]);
      const mixed = wait([{ id: 'x', step: 3 }, { id: 'y', step: 4 }]);
      const old = (Date.now() - 20 * 60000) / 1000;
      utimesSync(out, old, old);
      const stale = wait([{ id: 'x', step: 3 }]);
      return h.assertAll([
        ['a paused agent\'s wait passes', paused === null, paused],
        ['a note naming no output file is refused', typeof named === 'string', named],
        ['one agent not paused refuses the wait', typeof mixed === 'string', mixed],
        ['an output file older than five minutes is refused', typeof stale === 'string', stale],
      ]);
    },
  },
  {
    name: 'Q-HUB-323: the approval guard\'s refusal of an edit to an approved section names the session\'s own plan-mode entry as the route and says a restart of the harness may have ended the mode',
    guards: ['amend_route_words'],
    run(m, dir, h) {
      const text = h.scopedPlan(dir);
      const A = h.appHome(dir);
      writeFileSync(A.plan, text);
      const tr = h.transcript([h.turn(0, 'start')]);
      A.guard(tr, { hook_event_name: 'PostToolUse', tool_name: 'ExitPlanMode', tool_response: { plan: text, isAgent: false, filePath: A.plan } }, '--mark');
      const r = A.guard(tr, { tool_name: 'Edit', tool_input: { file_path: A.plan, old_string: '1. The thing is built and read.', new_string: '1. The thing is built.' } });
      return h.assertAll([
        ['the edit is refused', r.status === 2, r.status],
        ['the refusal names EnterPlanMode as the route', /EnterPlanMode/.test(r.stdout), r.stdout],
        ['the refusal says a restart may have ended the mode', /restart of the harness may have ended plan mode/.test(r.stdout), r.stdout],
      ]);
    },
  },
  {
    name: 'Q-HUB-325: a name of the What is section means one file, the first repository\'s, in the quote check and in the read after a compaction alike: a read of the copy in a later repository does not cover it, and a quote only the later copy holds is not found',
    guards: ['named_file_one'],
    run(m, dir, h) {
      const mk = (body) => { const d = h.tmp('sg-root-'); mkdirSync(join(d, 'doctrine'), { recursive: true }); writeFileSync(join(d, 'doctrine', 'plans.md'), body); return d; };
      const first = mk('The first copy of the page says nothing of the quoted line.\n');
      const second = mk('The second copy holds the quoted line of the plan here.\n');
      const plan = ['# A plan', '', '## Steps', '1. **One.** Do it.', '', '## What is', '- "the quoted line of the plan" is in doctrine/plans.md', ''].join('\n');
      const roots = [first, second];
      const quote = m.dispatch.whatIsProblem(plan, { roots });
      const quoteFirst = m.dispatch.whatIsProblem(plan, { roots: [second, first] });
      const boundary = { type: 'system', subtype: 'compact_boundary', timestamp: h.later(-100) };
      const read = (root) => [boundary, h.tool(0, 'r1', 'Read', { file_path: join(root, 'doctrine', 'plans.md') }), h.result(1, 'r1', 'text')];
      const readSecond = m.dispatch.readAfterCompactionProblem(plan, { roots, entries: read(second) });
      const readFirst = m.dispatch.readAfterCompactionProblem(plan, { roots, entries: read(first) });
      return h.assertAll([
        ['the quote the first copy lacks is not found', typeof quote === 'string' && /not carry/.test(quote), quote],
        ['with the roots the other way round the quote is found', quoteFirst === null, quoteFirst],
        ['a read of the later repository\'s copy does not cover the name', typeof readSecond === 'string' && /READ AFTER COMPACTION/.test(readSecond), readSecond],
        ['a read of the first repository\'s copy does', readFirst === null, readFirst],
      ]);
    },
  },
  {
    name: 'Q-HUB-326: the talk check counts only plan-mode calls that were not refused: an exit call refused by a gate with a refusal that sets no latch does not move the point the talk is counted from, and the talk before it still stands',
    guards: ['talk_refusal_marks'],
    run(m, dir, h) {
      const r = h.repo({ 'a.txt': 'x\n' });
      const TALK = 'Here is what is being done and why: the export control moves to the toolbar edge, and nothing else changes.';
      const exit = (entries) => {
        const home = h.tmp('sg-home-');
        mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
        const file = join(home, '.claude', 'plans', 'talk-test.md');
        writeFileSync(file, h.PLAN(h.OWN_WORDS));
        const t = (Date.now() - 1000 * 1000) / 1000;
        utimesSync(file, t, t);
        return spawnSync('node', [join(dir, 'plan-guard.mjs')], {
          input: JSON.stringify({ session_id: h.sid('tk'), permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { planFilePath: file }, transcript_path: h.transcript([h.turn(0, h.OWNER), ...entries]), cwd: '/' }),
          encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: r.dir },
        });
      };
      const said = (secs, text) => h.at(h.reply(0, text), h.later(secs));
      const refusedExit = [h.at(h.tool(0, 'xr1', 'ExitPlanMode', { planFilePath: 'x' }), h.later(-300)),
        h.at(h.result(0, 'xr1', 'PLAN SHAPE, NO LATCH: the plan is missing a section with a real body under it.', true), h.later(-290))];
      const base = [...h.enterPlan(-900), said(-500, TALK), h.owner(h.later(-400), 'ok')];
      const plain = exit(base);
      const afterRefusal = exit([...base, ...refusedExit]);
      return h.assertAll([
        ['the talk before the plan passes with no refused call', plain.status === 0, plain.stdout],
        ['a refused exit that sets no latch does not reset the talk', afterRefusal.status === 0, afterRefusal.stdout],
      ]);
    },
  },
  {
    name: 'Q-HUB-327: the words of the gate that reads an earlier call say that a call the gate must see goes in a turn of its own',
    guards: ['own_turn_words'],
    run(m, dir, h) {
      const root = h.tmp('sg-root-');
      mkdirSync(join(root, 'doctrine'), { recursive: true });
      writeFileSync(join(root, 'doctrine', 'plans.md'), 'A line of the page that the plan quotes in full.\n');
      const plan = ['# A plan', '', '## Steps', '1. **One.** Do it.', '', '## What is', '- "a line of the page that the plan quotes" is in doctrine/plans.md', ''].join('\n');
      const boundary = { type: 'system', subtype: 'compact_boundary', timestamp: h.later(-100) };
      const why = m.dispatch.readAfterCompactionProblem(plan, { roots: [root], entries: [boundary] });
      return h.assertAll([
        ['the read after a compaction is refused', typeof why === 'string', why],
        ['its words end by sending the read alone', /turn of its own/.test(String(why)) && /not yet in the transcript/.test(String(why)), why],
      ]);
    },
  },
  {
    name: 'Q-HUB-328: the check of a call asks the plan guard and the approval guard as the call would meet them, says which would refuse, still passes the fence and the latch for what they alone refuse, and asks neither for the status command',
    guards: ['can_asks_guards'],
    run(m, dir, h) {
      const p = { tool_name: 'Edit', tool_input: { file_path: '/tmp/never-written.txt', old_string: 'a', new_string: 'b' }, session_id: h.sid('cc'), cwd: '/' };
      const guards = { 'plan-guard.mjs': () => null, 'approved-plan-guard.mjs': () => 'This edit would change Goals in the plan. planted refusal.' };
      const r = m.dispatch.canCall(p, { plan: null, classify: () => true, guards });
      const text = m.dispatch.canText(p, r, '/tmp/never-written.txt');
      const none = m.dispatch.canCall(p, { plan: null, classify: () => true, guards: false });
      const status = m.dispatch.canCall({ tool_name: 'Bash', tool_input: { command: `node ${join(dir, 'report.mjs')} "Status 10:00 — a case"` }, session_id: h.sid('cc'), cwd: '/' }, { plan: null, guards });
      return h.assertAll([
        ['the approval guard\'s refusal is carried', r.guards.approval === guards['approved-plan-guard.mjs'](), r.guards],
        ['the plan guard, which passes, is null', r.guards.plan === null, r.guards],
        ['the words say which guard would refuse', /APPROVAL GUARD: would refuse\. This edit would change Goals/.test(text) && /approval guard would refuse it|refused by .*the approval guard/.test(text), text],
        ['with the guards set aside nothing is asked', none.guards.plan === null && none.guards.approval === null, none.guards],
        ['the status command asks neither', status.guards.plan === null && status.guards.approval === null, status.guards],
      ]);
    },
  },
  {
    name: 'Q-HUB-336: a plan mode that the session start carries (a resume restored it) is recorded as seen, so the first prompt in it prints no plan seed, and a plan mode entered after it still gets its one print',
    guards: ['seed_start_mode'],
    run(m, dir, h) {
      const copy = h.tmp('sg-seedcopy-');
      for (const f of h.FILES) h.copyGuard(join(dir, f), join(copy, f));
      writeFileSync(join(copy, 'PROGRAM.md'), h.SEED_PROGRAM);
      const w = h.world(copy, [h.turn(0, h.GO)], h.STEPS_PLAN);
      const s = h.sid('rs');
      h.notesPad(s, '');
      w.call('SessionStart', { session_id: s, source: 'resume', permission_mode: 'plan' });
      const prompt = (mode) => w.call('UserPromptSubmit', { session_id: s, prompt: h.GO, ...(mode ? { permission_mode: mode } : {}) }).stdout ?? '';
      const resumed = prompt('plan');
      prompt('default');
      const entered = prompt('plan');
      return h.assertAll([
        ['the first prompt in the restored plan mode prints no seed', !resumed.includes('PLAN SEED'), resumed.slice(0, 300)],
        ['a plan mode entered afterwards prints the seed', entered.includes('PLAN SEED'), entered.slice(0, 300)],
      ]);
    },
  },
  {
    name: 'Q-HUB-340: a step that names the decision records folder has to name the decisions check; a step that does, and a step that names no such folder, pass',
    guards: ['decisions_check_named'],
    run(m, dir, h) {
      const plan = (a, b) => ['# A plan', '', '## Steps', `1. **One.** ${a}`, `2. **Two.** ${b}`, ''].join('\n');
      const bad = m.dispatch.decisionsCheckProblem(plan('Edit `docs/decisions/0007.md` and say why.', 'Read `NOTES.md`.'));
      const good = m.dispatch.decisionsCheckProblem(plan('Edit `docs/decisions/0007.md` and run the decisions check.', 'Read `NOTES.md`.'));
      return h.assertAll([
        ['the step naming the folder alone is refused and numbered', typeof bad === 'string' && /step 1 of the plan/.test(bad), bad],
        ['naming the check passes', good === null, good],
      ]);
    },
  },
  {
    name: 'Q-HUB-341: a Verification line that promises the main thread a read of a path outside the record is refused, naming the path; a read of the notes or the doctrine, and a line about an agent\'s read, pass',
    guards: ['verification_read'],
    run(m, dir, h) {
      const r = h.repo({ 'NOTES.md': 'notes\n' });
      const plan = (line) => ['# A plan', '', '## Steps', '1. **One.** Do it.', '', '## Verification', line, ''].join('\n');
      const opts = { roots: [r.dir], session_id: h.sid('vr'), planPath: '/root/.claude/plans/a.md' };
      const outside = m.dispatch.verificationReadProblem(plan('The main thread reads `/root/research/digest.md` after the run.'), opts);
      const record = m.dispatch.verificationReadProblem(plan('The main thread reads `NOTES.md` after the run.'), opts);
      const agent = m.dispatch.verificationReadProblem(plan('An agent reads `/root/research/digest.md` after the run.'), opts);
      return h.assertAll([
        ['a path outside the record is refused and named', typeof outside === 'string' && outside.includes('/root/research/digest.md'), outside],
        ['a file of the record passes', record === null, record],
        ['an agent\'s read passes', agent === null, agent],
      ]);
    },
  },
  {
    name: 'Q-HUB-359: the end-of-turn reminder printed at an owner prompt carries the state line in its fixed forms and the stop\'s first-line form, and never lets a pause be written as nothing open',
    guards: ['reminder_state_line', 'reminder_stop_first_line'],
    run(m, dir, h) {
      const copy = h.tmp('sg-remcopy-');
      for (const f of h.FILES) h.copyGuard(join(dir, f), join(copy, f));
      const w = h.world(copy, [h.turn(0, h.GO)], h.STEPS_PLAN);
      const s = h.sid('rm');
      h.notesPad(s, '');
      const out = w.call('UserPromptSubmit', { session_id: s, prompt: h.GO }).stdout ?? '';
      return h.assertAll([
        ['the End line carries the state line in its fixed forms', /state line in its fixed forms: paused, pending what of the owner's; running, what; or finished/.test(out), out.slice(0, 600)],
        ['the End line makes open for the owner decisions only and bars nothing-open for a pause', /open for the owner as decisions only/.test(out) && /never "nothing open" for a pause/.test(out), out.slice(0, 600)],
        ['the first-line sentence gives the stop form', /a stop's first line is "Stopping here", then paused, pending what lifts it, or finished, nothing pending/.test(out), out.slice(0, 600)],
      ]);
    },
  },
  {
    name: 'Q-HUB-347: the dispatcher runs the status page next-line refresh after a main-thread write of the manager notes and before a main-thread send is judged and runs nothing for an agent write or a write of another file or a send by an agent',
    guards: ['page_next_after_notes', 'page_next_before_send'],
    run(m, dir, h) {
      const home = h.tmp('sg-home-');
      mkdirSync(join(home, '.claude'), { recursive: true });
      const s = h.sid('pn');
      const notes = h.notesPad(s, 'Next: the old move');
      const page = join(notes, '..', 'fix-run.html');
      const shown = () => /The next move: ([^<]*)</.exec(readFileSync(page, 'utf8'))?.[1] ?? 'no line';
      const call = (event, payload) => spawnSync('node', [join(dir, 'hook-dispatch.mjs'), event], {
        input: JSON.stringify({ cwd: home, session_id: s, hook_event_name: event, ...payload }), encoding: 'utf8',
        env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: home },
      });
      writeFileSync(page, '<p class="next"><strong>next: none</strong><br>The next move: the old move</p>\n');
      writeFileSync(notes, 'Next: the second move\n');
      call('PostToolUse', { tool_name: 'Write', agent_id: 'a1', tool_input: { file_path: notes, content: 'Next: the second move\n' }, tool_response: {} });
      const agentWrite = shown();
      call('PostToolUse', { tool_name: 'Write', tool_input: { file_path: join(home, 'other.txt'), content: 'text\n' }, tool_response: {} });
      const otherFile = shown();
      call('PostToolUse', { tool_name: 'Write', tool_input: { file_path: notes, content: 'Next: the second move\n' }, tool_response: {} });
      const afterWrite = shown();
      writeFileSync(notes, 'Next: the third move\n');
      call('PreToolUse', { tool_name: 'Agent', agent_id: 'a1', tool_input: { prompt: '/root/.claude/plans/none.md step 1', subagent_type: 'general-purpose' } });
      const agentSend = shown();
      call('PreToolUse', { tool_name: 'Agent', tool_input: { prompt: '/root/.claude/plans/none.md step 1', subagent_type: 'general-purpose' } });
      const beforeSend = shown();
      return h.assertAll([
        ['an agent\'s write of the notes runs no refresh', agentWrite === 'the old move', agentWrite],
        ['a write of another file runs no refresh', otherFile === 'the old move', otherFile],
        ['the main thread\'s write of the notes brings the page to the newest Next line', afterWrite === 'the second move', afterWrite],
        ['a send by an agent runs no refresh', agentSend === 'the second move', agentSend],
        ['a send by the main thread brings the page to the Next line a write did not announce', beforeSend === 'the third move', beforeSend],
      ]);
    },
  },
  {
    name: 'Q-HUB-349: the dispatcher hook loop skips the identifier shim of an app for the main thread TaskStop of an id a launch result printed and runs it for an id no result printed',
    guards: ['ident_skip_loop'],
    run(m, dir, h) {
      const launch = [h.tool(0, 'l1', 'Bash', { command: 'node long.mjs' }), h.result(1, 'l1', 'Command running in background with ID: bk7x3q9zd. Output is being written to a file.')];
      const stop = (id) => {
        const w = h.world(dir, [h.turn(0, h.GO), ...launch]);
        h.hookRepo(w, 'ident-guard.sh', null);
        return w.call('PreToolUse', { session_id: h.sid('is'), tool_name: 'TaskStop', tool_input: { task_id: id } });
      };
      const printed = stop('bk7x3q9zd');
      const unprinted = stop('zz9zz9zz9');
      return h.assertAll([
        ['the shim is not run for an id the launch result printed', !/planted refusal from ident-guard\.sh/.test(printed.stderr), printed.stderr],
        ['the shim is run for an id no result printed, and refuses', unprinted.status === 2 && /planted refusal from ident-guard\.sh/.test(unprinted.stderr), `${unprinted.status} ${unprinted.stderr}`],
      ]);
    },
  },
  {
    name: 'Q-HUB-351: a rule of the plans page named by number is found under the sub-headings of its section at the third level and deeper and a number after the next second-level heading is not found',
    guards: ['rule_number_subheading'],
    run(m, dir, h) {
      const tmp = h.tmp('sg-rules-');
      const page = join(tmp, 'plans.md');
      writeFileSync(page, ['## 0e. PLAN MODE ONLY.', '', '1. **Tell the owner in the first line.** Say what is being done.', '2. **A status when an agent has ended.** The status says what changed.', '',
        '### A sub-section of the rules', '', '3. **Reply to every point.** Answer each of them in the turn it arrives.', '',
        '#### A deeper heading', '', '4. **Hold the plan to the record.** The record is the plan.', '', '## 0g. Next section', '', '5. **Not part of the section.** Outside it.', ''].join('\n'));
      const plan = (line) => ['# A rule plan', '', '## Steps', `1. **One.** ${line}`, ''].join('\n');
      const third = m.dispatch.ruleNumberProblem(plan('Put a line under rule 3 of the plans page ("answer each of them") for the new rule.'), { page });
      const fourth = m.dispatch.ruleNumberProblem(plan('Put a line under rule 4 of the plans page ("the record is the plan") for the new rule.'), { page });
      const wrong = m.dispatch.ruleNumberProblem(plan('Put a line under rule 3 of the plans page ("the record is the plan") for the new rule.'), { page });
      const after = m.dispatch.ruleNumberProblem(plan('Put a line under rule 5 of the plans page for the new rule.'), { page });
      return h.assertAll([
        ['a rule under a third-level heading is found with its quoted phrase', third === null, third],
        ['a rule under a fourth-level heading is found with its quoted phrase', fourth === null, fourth],
        ['a phrase the sub-section\'s rule does not carry is refused', typeof wrong === 'string' && /does not hold "the record is the plan"/.test(wrong), wrong],
        ['a number after the next second-level heading is not found', typeof after === 'string' && /rule 5 is not a rule/.test(after), after],
      ]);
    },
  },
  {
    name: 'Q-HUB-362: in plan mode with no plan in force the manager fence passes the main thread read of a file inside a git repository and still refuses a file outside one and the connector file read and a write and a read outside plan mode and a read while a plan is in force and passes one once the plan has finished',
    guards: ['planmode_read_pass', 'planmode_read_phase', 'planmode_read_mode', 'planmode_read_repo'],
    run(m, dir, h) {
      const r = h.repo({ 'app.js': 'source\n' });
      const loose = join(h.tmp('sg-loose-'), 'loose.txt');
      writeFileSync(loose, 'text\n');
      const p = (extra) => ({ tool_name: 'Read', tool_input: { file_path: join(r.dir, 'app.js') }, session_id: h.sid('pm'), cwd: r.dir, permission_mode: 'plan', ...extra });
      const fence = (call, opts) => m.dispatch.managerFence(call, { classify: () => true, ...opts });
      const plan = { path: '/root/.claude/plans/fence-test.md', text: h.STEPS_PLAN };
      const passed = fence(p(), { plan: null });
      const grepped = fence(p({ tool_name: 'Grep', tool_input: { pattern: 'source', path: r.dir } }), { plan: null });
      const outside = fence(p({ tool_input: { file_path: loose } }), { plan: null });
      const connector = fence(p({ tool_name: 'mcp__github__get_file_contents', tool_input: { path: 'app.js' } }), { plan: null });
      const write = fence(p({ tool_name: 'Edit', tool_input: { file_path: join(r.dir, 'app.js'), old_string: 'source', new_string: 'text' } }), { plan: null });
      const notPlanMode = fence(p({ permission_mode: 'default' }), { plan: null });
      const inForce = fence(p(), { plan, pointer: { next: 1 } });
      const finished = fence(p(), { plan, pointer: { next: null } });
      return h.assertAll([
        ['a read of a repository file passes in plan mode with no plan', passed === null, passed],
        ['a search of a repository passes', grepped === null, grepped],
        ['a file outside any repository is refused', typeof outside === 'string', outside],
        ['the connector\'s file read is refused', typeof connector === 'string', connector],
        ['a write is refused', typeof write === 'string', write],
        ['a read outside plan mode is refused', typeof notPlanMode === 'string', notPlanMode],
        ['a read while a plan is in force is refused', typeof inForce === 'string', inForce],
        ['a read after the plan has finished passes', finished === null, finished],
      ]);
    },
  },
  {
    name: 'Q-HUB-373: in plan mode with no plan in force the manager fence passes the main thread read of an agent transcript under this session\'s own folder, reads only, and still refuses another session\'s folder, a path that steps out of the session\'s folder, a write, a read outside plan mode and a read while a plan is in force',
    guards: ['planmode_transcript_pass', 'planmode_transcript_sid'],
    run(m, dir, h) {
      const s = h.sid('tr');
      const proj = join(homedir(), '.claude', 'projects', '-home-user-fence-test');
      const mine = join(proj, s, 'subagents', 'agent-a1.jsonl');
      const other = join(proj, h.sid('tr-other'), 'subagents', 'agent-a1.jsonl');
      const stepOut = join(proj, s, '..', 'loose.jsonl');
      const p = (extra) => ({ tool_name: 'Read', tool_input: { file_path: mine }, session_id: s, cwd: '/', permission_mode: 'plan', ...extra });
      const fence = (call, opts) => m.dispatch.managerFence(call, { classify: () => true, ...opts });
      const plan = { path: '/root/.claude/plans/fence-test.md', text: h.STEPS_PLAN };
      const read = fence(p(), { plan: null });
      const searched = fence(p({ tool_name: 'Grep', tool_input: { pattern: 'x', path: join(proj, s, 'subagents') } }), { plan: null });
      const shell = fence(p({ tool_name: 'Bash', tool_input: { command: `cat ${mine}` } }), { plan: null });
      const another = fence(p({ tool_input: { file_path: other } }), { plan: null });
      const stepped = fence(p({ tool_input: { file_path: stepOut } }), { plan: null });
      const write = fence(p({ tool_name: 'Edit', tool_input: { file_path: mine, old_string: 'a', new_string: 'b' } }), { plan: null });
      const notPlanMode = fence(p({ permission_mode: 'default' }), { plan: null });
      const inForce = fence(p(), { plan, pointer: { next: 1 } });
      return h.assertAll([
        ['a read of an agent transcript under the session\'s own folder passes in plan mode with no plan', read === null, read],
        ['a search of the agents\' folder passes', searched === null, searched],
        ['a shell read of the transcript passes', shell === null, shell],
        ['another session\'s transcript is refused', typeof another === 'string', another],
        ['a path that steps out of the session\'s folder is refused', typeof stepped === 'string', stepped],
        ['a write of the transcript is refused', typeof write === 'string', write],
        ['a read outside plan mode is refused', typeof notPlanMode === 'string', notPlanMode],
        ['a read while a plan is in force is refused', typeof inForce === 'string', inForce],
      ]);
    },
  },
  {
    name: 'Q-HUB-376: an agent met by the plan fence\'s refusal for a plan file being re-recorded is refused with those words and is not latched, while the generic refusal of the same call once the marker is current still latches it',
    guards: ['rerecord_nolatch', 'rerecord_mark'],
    run(m, dir, h) {
      // The dispatcher runs in a copy of the suite whose plan fence is a stand-in, so the approval guard does not answer first: the stand-in
      // refuses a write of a file named moment.txt with the re-recording words and every other write with generic fence words.
      const stand = "let s = '';\nprocess.stdin.on('data', (d) => { s += d; });\nprocess.stdin.on('end', () => {\n  let f = '';\n  try { f = JSON.parse(s).tool_input.file_path || ''; } catch { f = ''; }\n  process.stderr.write(f.endsWith('moment.txt') ? 'PLAN FILE BEING RE-RECORDED, send the same call again.' : 'PLAN FENCE refuses this call.');\n  process.exit(2);\n});\n";
      const copy = h.suiteCopy(dir, { 'plan-fence.mjs': stand });
      const w = h.world(copy.dir);
      const r = h.repo({ 'keep.mjs': 'x\n' });
      const call = (s, name) => w.call('PreToolUse', { session_id: s, agent_id: 'ax', tool_name: 'Write', tool_input: { file_path: join(r.dir, name), content: 'y\n' }, cwd: r.dir });
      const s1 = h.sid('rr');
      const moment = call(s1, 'moment.txt');
      const s2 = h.sid('rr');
      const generic = call(s2, 'other.txt');
      return h.assertAll([
        ['the call is refused with the re-recording words', moment.status === 2 && /PLAN FILE BEING RE-RECORDED/.test(moment.stderr), moment.stderr],
        ['the agent is not latched by it', !h.latched(`${s1}.agent-ax`), moment.stderr],
        ['the generic refusal of the same call is a refusal', generic.status === 2 && !/PLAN FILE BEING RE-RECORDED/.test(generic.stderr), generic.stderr],
        ['the generic refusal latches the agent', h.latched(`${s2}.agent-ax`), generic.stderr],
      ]);
    },
  },
  {
    name: 'Q-HUB-370: a configuration change with the source skills is recorded as the harness\'s own sync, which the baseline names as a class, and a change of another source to a path the baseline does not name is not',
    guards: ['cfg_harness_sync', 'cfg_harness_field'],
    run(m, dir, h) {
      const record = (source, file_path) => {
        const s = h.sid('hs');
        const pad = join(process.env.TMPDIR, 'claude-0', '-home-user', s, 'scratchpad');
        mkdirSync(pad, { recursive: true });
        const r = spawnSync('node', [join(dir, 'hook-dispatch.mjs'), 'ConfigChange'], { encoding: 'utf8', env: { ...process.env }, input: JSON.stringify({ session_id: s, hook_event_name: 'ConfigChange', source, file_path }) });
        let rec = {};
        try { rec = JSON.parse(readFileSync(join(pad, 'status', 'config-changes.jsonl'), 'utf8').trim().split('\n')[0]); } catch { /* the rows below name it */ }
        return { status: r.status, rec };
      };
      const skill = record('skills', '/planted/skills/planted-browser-reference.md');
      const other = record('user_settings', '/planted/elsewhere/planted-unnamed-file.json');
      return h.assertAll([
        ['a skills change exits zero and is recorded as a harness sync', skill.status === 0 && skill.rec.harnessSync === true, JSON.stringify(skill.rec)],
        ['a skills change reads as named by the baseline', skill.rec.baseline === true, JSON.stringify(skill.rec)],
        ['a change of another source to an unnamed path is no harness sync', other.rec.harnessSync === false, JSON.stringify(other.rec)],
        ['a change of another source to an unnamed path stays unnamed', other.rec.baseline === false, JSON.stringify(other.rec)],
      ]);
    },
  },
  {
    name: 'Q-HUB-370: the status print names a configuration change recorded as the harness\'s sync as the harness\'s own sync of a skill file, and a record without that mark keeps the baseline wording',
    guards: ['cfg_print_harness'],
    run(m, dir, h) {
      const home = mkdtempSync(join(tmpdir(), 'sg-cfgprint-'));
      try {
        const s = h.sid('cp');
        const pad = join(home, 'claude-0', '-home-user', s, 'scratchpad');
        mkdirSync(join(pad, 'status'), { recursive: true });
        mkdirSync(join(home, '.claude'), { recursive: true });
        const rec = (file, harnessSync) => JSON.stringify({ at: Date.now() - 30000, time: 'x', california: '2026-11-05 10:00', source: 'skills', file, baseline: true, harnessSync });
        writeFileSync(join(pad, 'status', 'config-changes.jsonl'), `${rec('/planted/synced-skill.md', true)}\n${rec('/planted/plain-record.md', false)}\n`);
        const out = spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 - the configuration print test'], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: s, TMPDIR: home } }).stdout ?? '';
        const synced = out.split('\n').find((l) => l.includes('/planted/synced-skill.md')) ?? '';
        const plain = out.split('\n').find((l) => l.includes('/planted/plain-record.md')) ?? '';
        return h.assertAll([
          ['a record marked as the harness\'s sync is printed as the harness\'s own sync of a skill file', /harness's own sync of a skill file/.test(synced), synced],
          ['a record without the mark keeps the baseline wording', /the baseline names it\./.test(plain) && !/harness's own sync/.test(plain), plain],
        ]);
      } finally {
        rmSync(home, { recursive: true, force: true });
      }
    },
  },
  {
    name: 'Q-HUB-382: the check of a call carries the permission mode the owner\'s newest message recorded, so in plan mode with no plan in force it asks the fence about a read outside the record and about a history read carrying the stat flag as the dispatcher will, and in another mode it is the conversation skip',
    guards: ['can_mode_read'],
    run(m, dir, h) {
      const s = h.sid('cm');
      const proj = join(process.env.HOME, '.claude', 'projects', '-home-user');
      mkdirSync(proj, { recursive: true });
      const main = join(proj, `${s}.jsonl`);
      const write = (mode) => writeFileSync(main, h.jsonl([{ ...h.turn(-5, 'Go.'), permissionMode: mode }]));
      const r = h.repo({ 'a.txt': 'one\n' });
      const outside = join(h.tmp('sg-cm-'), 'outside.txt');
      writeFileSync(outside, 'x\n');
      const cwd = h.tmp('sg-cmcwd-');
      const check = (cmd) => m.dispatch.canMain(['Bash', cmd], { CLAUDE_CODE_SESSION_ID: s }, cwd);
      const direct = (cmd) => m.dispatch.managerFence({ session_id: s, transcript_path: main, cwd, permission_mode: 'plan', tool_name: 'Bash', tool_input: { command: cmd } });
      const stat = `git -C ${r.dir} log --stat -1`;
      const cat = `cat ${outside}`;
      write('plan');
      const planCat = check(cat);
      const planStat = check(stat);
      write('auto');
      const autoCat = check(cat);
      return h.assertAll([
        ['in plan mode a read outside the record is asked of the fence and would be refused', direct(cat) !== null && /MANAGER FENCE: would refuse\./.test(planCat), planCat],
        ['in plan mode the history read with the stat flag is asked of the fence and gets the fence\'s own answer', !/no plan is in force \(conversation\)/.test(planStat) && (direct(stat) === null) === /MANAGER FENCE: would pass\./.test(planStat), planStat],
        ['in another mode the same read is the conversation skip', /MANAGER FENCE: no plan is in force \(conversation\)/.test(autoCat), autoCat],
      ]);
    },
  },
  {
    name: 'Q-HUB-383: the manager fence reads a grep pattern as a pattern, so a pattern holding a slash names no file, a pattern given by -e likewise, a pattern alone still names no file of the record, and a flag that takes a value leaves the line read as before',
    guards: ['search_pattern_skip', 'search_pattern_flags', 'search_pattern_e'],
    run(m, dir, h) {
      const planFile = join(h.tmp('sg-sp-'), 'plan.md');
      writeFileSync(planFile, '# P\n');
      const plan = { path: planFile, text: h.STEPS_PLAN };
      const fence = (command) => m.dispatch.managerFence({ session_id: h.sid('sp'), cwd: dirname(planFile), tool_name: 'Bash', tool_input: { command } }, { plan, classify: () => true });
      const slash = fence(`grep -n "src/lib/x.mjs" ${planFile}`);
      const viaE = fence(`grep -e "a/b" -e "c/d" ${planFile}`);
      const piped = fence(`cat ${planFile} | grep "a/b"`);
      const other = fence('grep -n "src/lib/x.mjs" /etc/hostname');
      const alone = fence('grep -n "src/lib/x.mjs"');
      const valued = fence(`grep -f /etc/passwd pat ${planFile}`);
      return h.assertAll([
        ['a pattern holding a slash names no file and the file after it is of the record', slash === null, slash],
        ['patterns given by -e name no file', viaE === null, viaE],
        ['a pattern after a pipe names no file', piped === null, piped],
        ['a file outside the record after the pattern is still refused, and named', typeof other === 'string' && other.includes('/etc/hostname'), other],
        ['a pattern alone still reads the working directory and is refused', typeof alone === 'string' && /names no file of the record/.test(alone), alone],
        ['a flag that takes a value leaves the line read as before: the file it names is refused', typeof valued === 'string' && valued.includes('/etc/passwd'), valued],
      ]);
    },
  },
  {
    name: 'Q-HUB-389: the check of a call passes a standing latch exactly as the dispatcher does: the check and the main thread\'s TaskStop pass it, a read does not, and an agent\'s TaskStop and check do not while a latched agent\'s own report does',
    guards: ['can_passes_latch_list', 'latch_passes_report'],
    run(m, dir, h) {
      const w = h.world(dir);
      const s = h.sid('lp');
      const pad = join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad');
      const hookFile = join(dir, 'hook-dispatch.mjs');
      const hook = (extra) => w.call('PreToolUse', { session_id: s, ...extra });
      const checkCall = { tool_name: 'Bash', tool_input: { command: `node "${hookFile}" --can Read "${w.plan}"` } };
      const readCall = { tool_name: 'Read', tool_input: { file_path: w.plan } };
      const mainStop = { tool_name: 'TaskStop', tool_input: { task_id: 'x' } };
      const agentStop = { agent_id: 'a1', ...mainStop };
      const agentCheck = { agent_id: 'a1', ...checkCall };
      const agentNote = { agent_id: 'a1', tool_name: 'Write', tool_input: { file_path: join(pad, 'progress', 'step-1-report.txt'), content: 'x' } };
      const set = hook({ tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' } });
      const standing = set.status === 2 && h.latched(s);
      const hooked = { check: hook(checkCall).status, read: hook(readCall).status, agentStop: hook(agentStop).status, agentCheck: hook(agentCheck).status };
      const can = (extra) => m.dispatch.canCall({ session_id: s, transcript_path: w.tr, cwd: w.cwd, ...extra }, { guards: false });
      const note = can(agentNote);
      return h.assertAll([
        ['a refused send set the latch', standing, set.stderr],
        ['the dispatcher passes the check under the latch and the check says it passes', hooked.check === 0 && can(checkCall).passesLatch === true, JSON.stringify(hooked)],
        ['the dispatcher refuses a read under the latch and the check says the latch refuses it', hooked.read === 2 && can(readCall).passesLatch === false, JSON.stringify(hooked)],
        ['the main thread\'s TaskStop passes the latch', can(mainStop).passesLatch === true, can(mainStop).passesLatch],
        ['an agent\'s TaskStop is refused by the dispatcher and the check says the latch refuses it', hooked.agentStop === 2 && can(agentStop).passesLatch === false, JSON.stringify(hooked)],
        ['an agent\'s check is refused by the dispatcher and the check says the latch refuses it', hooked.agentCheck === 2 && can(agentCheck).passesLatch === false, JSON.stringify(hooked)],
        ['a latched agent\'s own report passes the latch in the check', note.passesLatch === true && m.dispatch.latchPasses({ session_id: s, transcript_path: w.tr, cwd: w.cwd, ...agentNote }, note.latch).reportWrite === true, JSON.stringify(note.latch)],
      ]);
    },
  },
  {
    name: 'Q-HUB-400: the plan check does not ask the Found answered section for a finding whose program item reads done, and still asks for one whose item reads open and for one with no item',
    guards: ['found_done_skip', 'found_done_state'],
    run(m, dir, h) {
      const root = h.tmp('sg-fd-');
      mkdirSync(join(root, 'found'), { recursive: true });
      for (const k of ['Q-ZZ-1', 'Q-ZZ-2', 'Q-ZZ-3']) writeFileSync(join(root, 'found', `${k}.md`), `${k}: a finding of the planted queue with words enough to read.\n`);
      writeFileSync(join(root, 'PROGRAM.md'), ['# Program', '',
        '### P-1. Q-ZZ-1: the planted finding that was put right', '', 'Repository: hub. Goal: 1. State: done. Plan: a plan.', '', 'Acceptance: a thing.', '',
        '### P-2. Q-ZZ-2: the planted finding still open', '', 'Repository: hub. Goal: 1. State: open. Plan: none.', '', 'Acceptance: a thing.', ''].join('\n'));
      const plan = '# T\n\n## Steps\n1. x\n';
      const asked = m.dispatch.foundAnsweredProblem(plan, { roots: [root] });
      const done = [...m.dispatch.doneFindingKeys(root)].join(',');
      writeFileSync(join(root, 'PROGRAM.md'), ['# Program', '', '### P-1. Q-ZZ-1: the planted finding that was put right', '', 'Repository: hub. Goal: 1. State: done. Plan: a plan.', ''].join('\n'));
      for (const k of ['Q-ZZ-2', 'Q-ZZ-3']) writeFileSync(join(root, 'found', `${k}.md`), 'prose that opens with no key\n');
      const allDone = m.dispatch.foundAnsweredProblem(plan, { roots: [root] });
      return h.assertAll([
        ['the finding whose item is done is not asked for', typeof asked === 'string' && !asked.includes('Q-ZZ-1'), asked],
        ['the open one and the one with no item are asked for', typeof asked === 'string' && asked.includes('Q-ZZ-2') && asked.includes('Q-ZZ-3'), asked],
        ['the done keys are the item headings that read done', done === 'Q-ZZ-1', done],
        ['a queue of done findings only asks for nothing', allDone === null, allDone],
      ]);
    },
  },
  {
    name: 'Q-HUB-403: a standing correction lets the main thread\'s entry to plan mode through and, in plan mode, the plan file\'s write and the plan check, and still holds a repository write, the exit from plan mode and an agent\'s entry',
    guards: ['correction_enter_hold', 'correction_enter_unit'],
    run(m, dir, h) {
      const WRONG = 'That was done wrong, so answer me before anything else.';
      const w = h.world(dir, [h.turn(0, h.GO), h.turn(5, WRONG)]);
      const call = (extra) => w.call('PreToolUse', { session_id: h.sid('ce'), ...extra });
      const enter = call({ tool_name: 'EnterPlanMode', tool_input: {} });
      const planFile = join(w.home, '.claude', 'plans', 'new-plan.md');
      const unitPlanFile = join(homedir(), '.claude', 'plans', 'new-plan.md');
      const planWrite = call({ tool_name: 'Write', tool_input: { file_path: planFile, content: '# Plan\n' }, permission_mode: 'plan' });
      const repoWrite = call({ tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x\n' }, permission_mode: 'plan' });
      const exit = call({ tool_name: 'ExitPlanMode', tool_input: { planFilePath: planFile }, permission_mode: 'plan' });
      const unit = (extra, mode) => m.dispatch.correctionPass({ tool_name: 'EnterPlanMode', tool_input: {}, ...extra }, mode);
      return h.assertAll([
        ['the entry to plan mode is not held by the correction', enter.status === 0 && !/CORRECTION/.test(enter.stderr), enter.stderr],
        ['the plan file\'s write in plan mode is not held by the correction', !/CORRECTION/.test(planWrite.stderr), planWrite.stderr],
        ['a repository write in plan mode is held by the correction', repoWrite.status === 2 && /CORRECTION/.test(repoWrite.stderr), repoWrite.stderr],
        ['the exit from plan mode is held by the correction', exit.status === 2 && /CORRECTION/.test(exit.stderr), exit.stderr],
        ['the unit passes the main thread\'s entry in either state', unit({}, false) === true && unit({}, true) === true, [unit({}, false), unit({}, true)]],
        ['the unit refuses an agent\'s entry', unit({ agent_id: 'a1' }, true) === false, unit({ agent_id: 'a1' }, true)],
        ['the unit passes the plan file\'s write in plan mode only', m.dispatch.correctionPass({ tool_name: 'Write', tool_input: { file_path: unitPlanFile } }, true) === true && m.dispatch.correctionPass({ tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt') } }, true) === false, 'write'],
      ]);
    },
  },
  {
    name: 'Q-HUB-405: the check of a call is accepted spelled with the hub\'s full path, quoted or not, and with the tilde spelling where the hub sits below the home folder, and refused with the working copy\'s path, a quoted tilde, a hub outside the home folder, anything chained or another file; the manager fence\'s refusal names the accepted spellings',
    guards: ['can_tilde_spelling', 'can_spellings_words'],
    run(m, dir, h) {
      const below = m.dispatch.canRegex('/home/sample/.claude/hub', '/home/sample');
      const outside = m.dispatch.canRegex('/srv/hub', '/home/sample');
      const spell = m.dispatch.canSpellings('/home/sample/.claude/hub', '/home/sample');
      const none = m.dispatch.canSpellings('/srv/hub', '/home/sample');
      const live = m.dispatch.canSpellings();
      const refusal = m.dispatch.managerFence({ session_id: h.sid('cs'), cwd: '/', tool_name: 'Bash', tool_input: { command: 'node /tmp/elsewhere/hook-dispatch.mjs --can Read x' } }, { plan: null, classify: () => true });
      return h.assertAll([
        ['the full path passes', below.test('node /home/sample/.claude/hub/hook-dispatch.mjs --can Read x'), 'full'],
        ['the quoted full path passes', below.test('node "/home/sample/.claude/hub/hook-dispatch.mjs" --can Bash "git status"'), 'quoted'],
        ['the tilde spelling passes', below.test('node ~/.claude/hub/hook-dispatch.mjs --can Read /tmp/x'), 'tilde'],
        ['a quoted tilde is refused', !below.test('node "~/.claude/hub/hook-dispatch.mjs" --can Read x'), 'quoted tilde'],
        ['the working copy\'s path is refused', !below.test('node /home/sample/noahjefferson/hook-dispatch.mjs --can Read x'), 'working copy'],
        ['a hub outside the home folder has no tilde spelling', !outside.test('node ~/.claude/hub/hook-dispatch.mjs --can Read x') && outside.test('node /srv/hub/hook-dispatch.mjs --can Read x'), 'outside'],
        ['a chained line and another file are refused', !below.test('node ~/.claude/hub/hook-dispatch.mjs --can Read x; touch y') && !below.test('node ~/.claude/hub/report.mjs --can Read x'), 'chained'],
        ['the spellings are the full path and the tilde below the home folder', spell.full === '/home/sample/.claude/hub/hook-dispatch.mjs' && spell.tilde === '~/.claude/hub/hook-dispatch.mjs' && none.tilde === null, JSON.stringify([spell, none])],
        ['the live hub\'s test accepts its own tilde spelling where it has one', live.tilde === null || m.dispatch.isCanCommand(`node ${live.tilde} --can Read x`), JSON.stringify(live)],
        ['the fence\'s refusal of another spelling names the accepted ones', typeof refusal === 'string' && refusal.includes(`node ${live.full}`) && /the working copy's path or a quoted tilde among them/.test(refusal), refusal],
      ]);
    },
  },
  {
    name: 'Q-HUB-410: an agent\'s check of a call is refused with the check\'s own words whatever the family guards before it answer, when the first of them refuses with words of its own and when every one of them passes',
    guards: ['agent_check_before_guards'],
    run(m, dir, h) {
      const PASS = "process.stdin.resume();\nprocess.stdin.on('end', () => process.exit(0));\n";
      const DENY = "process.stdin.resume();\nprocess.stdin.on('end', () => { process.stderr.write('A FAMILY GUARD refuses this call in words of its own.'); process.exit(2); });\n";
      const run = (stands) => {
        const copy = h.suiteCopy(dir, stands);
        const w = h.world(copy.dir);
        const s = h.sid('ac');
        const r = w.call('PreToolUse', { session_id: s, agent_id: 'ax', tool_name: 'Bash', tool_input: { command: `node ${join(copy.dir, 'hook-dispatch.mjs')} --can Read x` } });
        return { r, latched: h.latched(`${s}.agent-ax`) };
      };
      const firstDenies = run({ 'drive-guard.mjs': DENY, 'plan-fence.mjs': PASS });
      const allPass = run({ 'drive-guard.mjs': PASS, 'plan-fence.mjs': PASS });
      const own = (x) => x.r.status === 2 && /the check of a call \(hook-dispatch\.mjs --can\) is the main thread's/.test(x.r.stderr) && !/FAMILY GUARD/.test(x.r.stderr);
      return h.assertAll([
        ['with the first guard refusing in its own words the check\'s words are the refusal', own(firstDenies), firstDenies.r.stderr],
        ['with the guards passing the check is refused with its words', own(allPass), allPass.r.stderr],
        ['the refusal latches that agent only, as before', firstDenies.latched === true && allPass.latched === true, [firstDenies.latched, allPass.latched]],
      ]);
    },
  },
  {
    name: 'Q-HUB-404: the arguments the dispatcher builds for the seed at the entry to plan mode follow the newest Seed item and Seed rounds lines of the manager\'s notes: a program key or the word new names the item, a number from one to five gives the batch print its rounds, any other value is passed over and said, rounds with an item or on a print for one item are said to be passed over, and with neither line the arguments are as before; the case builds the arguments and runs no seed',
    guards: ['seed_wish_item', 'seed_wish_rounds', 'seed_wish_valid_item', 'seed_wish_valid_rounds', 'seed_wish_newest'],
    run(m, dir, h) {
      const hub = h.batchHub(dir);
      const single = h.batchHub(dir);
      writeFileSync(join(single, 'PROGRAM.md'), readFileSync(join(single, 'PROGRAM.md'), 'utf8').replace('### P-1. Q-HUB-11: ', '### P-1. A planted item with no key: '));
      const out = '/planted/seed-print.txt';
      const opts = (hubDir) => ({ hub: hubDir, marker: join(h.tmp('sg-wishmk-'), 'none.json'), plansDir: h.tmp('sg-wishplans-') });
      const args = (lines, hubDir = hub) => {
        const pad = h.tmp('sg-wishpad-');
        mkdirSync(join(pad, 'status'), { recursive: true });
        if (lines) writeFileSync(join(pad, 'status', 'manager.txt'), `${lines.join('\n')}\n`);
        return m.dispatch.seedArguments({ cwd: hubDir }, pad, out, opts(hubDir));
      };
      const flat = (r) => r.args.join(' ');
      const bare = args(null);
      const bareSingle = args(['Version: x'], single);
      const item = args(['Seed item: P-460']);
      const fresh = args(['Seed item: new']);
      const newest = args(['Seed item: P-12', 'Open: nothing', 'Seed item: P-13']);
      const junk = args(['Seed item: banana']);
      const rounds = args(['Seed rounds: 3']);
      const newestRounds = args(['Seed rounds: 2', 'Seed rounds: 4']);
      const high = args(['Seed rounds: 6']);
      const word = args(['Seed rounds: two']);
      const both = args(['Seed item: P-460', 'Seed rounds: 2']);
      const onSingle = args(['Seed rounds: 2'], single);
      const said = (r, re) => r.notes.some((n) => re.test(n));
      return h.assertAll([
        ['with neither line a batch hub gets the batch print as before', bare.args[0] === '--batch' && !flat(bare).includes('--rounds') && bare.notes.length === 0 && flat(bare).endsWith(`--out ${out}`), flat(bare)],
        ['with neither line a hub whose first open item is no finding gets --item next as before', flat(bareSingle).startsWith('--item next') && bareSingle.notes.length === 0, flat(bareSingle)],
        ['a program key is passed as the item', flat(item).startsWith('--item P-460 ') && item.notes.length === 0, flat(item)],
        ['the word new is passed as the item', flat(fresh).startsWith('--item new '), flat(fresh)],
        ['the newest Seed item line is the one used', flat(newest).startsWith('--item P-13 '), flat(newest)],
        ['a value that is neither is passed over and said, and the default stands', flat(junk).startsWith('--batch') && said(junk, /SEED ITEM LINE PASSED OVER: "banana"/), JSON.stringify(junk)],
        ['rounds from one to five go to the batch print', flat(rounds).startsWith('--batch --rounds 3 ') && rounds.notes.length === 0, flat(rounds)],
        ['the newest Seed rounds line is the one used', flat(newestRounds).startsWith('--batch --rounds 4 '), flat(newestRounds)],
        ['a six is passed over and said', !flat(high).includes('--rounds') && said(high, /SEED ROUNDS LINE PASSED OVER: "6"/), JSON.stringify(high)],
        ['a word is passed over and said', !flat(word).includes('--rounds') && said(word, /"two"/), JSON.stringify(word)],
        ['rounds with an item are passed over and said', !flat(both).includes('--rounds') && flat(both).startsWith('--item P-460 ') && said(both, /name an item/), JSON.stringify(both)],
        ['rounds on a print for one item are passed over and said', !flat(onSingle).includes('--rounds') && flat(onSingle).startsWith('--item next') && said(onSingle, /print is for one item/), JSON.stringify(onSingle)],
      ]);
    },
  },
  {
    name: 'Sends priced: the price is read from a rule line of the plan\'s own rules that opens with the words, a colon and a whole number; the count is every agent that ended under the approval and every agent running, the review\'s among them, and the ends other than DONE are counted without the review\'s',
    guards: ['price_parse', 'count_review', 'count_running'],
    run(m, dir, h) {
      const plan = (rule) => ['# A priced plan', '', '## Rules', 'Rules: /root/.claude/hub/agent-rules.md, version 5.', '', '## Rules of this plan', rule, '- Another rule of the plan.', '', '## Steps', '1. **One.** Do it.', ''].join('\n');
      const wrongSection = ['# A plan', '', '## Rules', '- Sends priced: 9.', '', '## Steps', '1. **One.** Sends priced: 8.', ''].join('\n');
      const reviewing = { text: h.reviewPlan(dir) };
      const read = { ends: [h.endFor(1, 10, 1, 'DONE'), h.endFor(1, 20, 11, 'FAILED'), h.endFor(2, 30, 21, 'EJECT'), h.endFor(2, 35, 31, 'x', 'an interruption'), h.endFor(3, 40, 36, 'ON-AIM ROUTE-CLEAR step 2')], running: ['agent r1'] };
      const counted = m.dispatch.sendCounts(read, reviewing);
      return h.assertAll([
        ['a hyphen line with the number and text after it gives the number', m.dispatch.pricedSends(plan('- Sends priced: 12. The plan is seven steps.')) === 12, m.dispatch.pricedSends(plan('- Sends priced: 12. The plan is seven steps.'))],
        ['an asterisk line, a numbered line and a line with no space before the number give the number', m.dispatch.pricedSends(plan('* Sends priced: 7.')) === 7 && m.dispatch.pricedSends(plan('1. Sends priced: 5')) === 5 && m.dispatch.pricedSends(plan('- Sends priced:3 steps')) === 3, 'asterisk, numbered, tight'],
        ['a line with no colon, with a word for the number or with other words first gives nothing', m.dispatch.pricedSends(plan('- Sends priced 12.')) === null && m.dispatch.pricedSends(plan('- Sends priced: many.')) === null && m.dispatch.pricedSends(plan('- The sends priced: 4.')) === null, 'no colon, a word, other words'],
        ['a line outside the plan\'s own rules gives nothing', m.dispatch.pricedSends(wrongSection) === null, m.dispatch.pricedSends(wrongSection)],
        ['the count is the ends and the running agents, the review\'s ends among them', counted?.sent === 6, JSON.stringify(counted)],
        ['the ends other than DONE are the failed, the ejected and the interrupted step, and the review\'s end is left out', counted?.notDone === 3, JSON.stringify(counted)],
        ['a session whose agents cannot be read has no count', m.dispatch.sendCounts(null, reviewing) === null, 'null'],
      ]);
    },
  },
  {
    name: 'Sends priced: the dispatch gate refuses a send once the count has reached the number, saying the count, the number and that the plan goes back through plan mode, with the mark that sets no latch; a count below the number, a plan with no priced line and a count that cannot be read are not refused for it',
    guards: ['price_refuses', 'price_nolatch'],
    run(m, dir, h) {
      const priced = (n) => h.STEPS_PLAN.replace('## Steps', `## Rules of this plan\n- Sends priced: ${n}. The plan stops there.\n\n## Steps`);
      const p = { session_id: h.sid('pg'), tool_name: 'Agent', tool_input: { prompt: '/plans/gate-test.md step 1', subagent_type: 'general-purpose' } };
      const at = (text, sends) => m.dispatch.dispatchGate(p, { path: '/plans/gate-test.md', text }, null, [], sends);
      const reached = String(at(priced(3), { sent: 3, notDone: 1 }));
      const past = String(at(priced(3), { sent: 5, notDone: 2 }));
      const below = String(at(priced(3), { sent: 2, notDone: 0 }));
      const none = String(at(h.STEPS_PLAN, { sent: 99, notDone: 9 }));
      const unread = String(at(priced(3), null));
      const flat = String(at(priced(1), undefined));
      return h.assertAll([
        ['the count at the number is refused and the refusal says the count and the number', /SENDS PRICED/.test(reached) && /at 3, and 3 agents have been sent/.test(reached) && /1 ended other than DONE/.test(reached), reached.slice(0, 500)],
        ['the refusal says the plan goes back through plan mode with the line raised, and that no amendment carries it', /goes back through plan mode/.test(reached) && /raised with the causes of the overrun named/.test(reached) && /no amendment carries it/.test(reached), reached.slice(0, 700)],
        ['the refusal carries the mark that sets no latch', reached.includes(m.dispatch.FENCE_NO_LATCH), reached.slice(0, 700)],
        ['a count past the number is refused too', /SENDS PRICED/.test(past) && /5 agents have been sent/.test(past), past.slice(0, 400)],
        ['a count below the number is not refused for the price', !/SENDS PRICED/.test(below), below.slice(0, 300)],
        ['a plan with no priced line is not refused for it whatever the count', !/SENDS PRICED/.test(none), none.slice(0, 300)],
        ['a count that cannot be read holds nothing', !/SENDS PRICED/.test(unread), unread.slice(0, 300)],
        ['a session with no agents on disk, read for itself, holds nothing', !/SENDS PRICED/.test(flat), flat.slice(0, 300)],
      ]);
    },
  },
  {
    name: 'Sends priced: through the dispatcher, a main-thread send under a plan priced at three is refused once three agents have ended or run under the approval, and the print at each owner message gives the sends so far, the number priced and how many ended other than DONE; a plan with no priced line prints no such line',
    guards: ['price_refuses', 'price_nolatch', 'price_print'],
    run(m, dir, h) {
      const copy = h.tmp('sg-price-');
      for (const f of h.FILES) h.copyGuard(join(dir, f), join(copy, f));
      const planWith = (n) => (n === null ? h.reviewPlan(copy) : h.reviewPlan(copy).replace('## Steps', `## Rules of this plan\n- Sends priced: ${n}. The plan stops there.\n\n## Steps`));
      const world = (n, agents) => {
        const w = h.world(copy, [h.turn(0, h.GO)], planWith(n));
        const subs = join(w.tr.slice(0, -'.jsonl'.length), 'subagents');
        mkdirSync(subs, { recursive: true });
        const old = (Date.now() - 60 * 60 * 1000) / 1000;
        utimesSync(w.plan, old, old);
        for (const [id, step, sent, ended, first] of agents) h.putAgent(subs, w.plan, id, step, sent, ended, first, ended === null);
        return w;
      };
      const send = (w, s) => w.call('PreToolUse', { session_id: s, tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 2`, subagent_type: 'general-purpose' } });
      const three = [['a1', 1, -1500, -1400, 'DONE'], ['a2', 2, -1300, -1200, 'FAILED'], ['a3', 3, -1100, -1000, 'ON-AIM ROUTE-CLEAR step 2']];
      const atPrice = send(world(3, three), h.sid('pw'));
      const withRunning = send(world(3, [three[0], three[1], ['a4', 2, -600, null, '']]), h.sid('pw'));
      const under = send(world(4, three), h.sid('pw'));
      const unpriced = send(world(null, three), h.sid('pw'));
      const prompt = (w) => w.call('UserPromptSubmit', { session_id: h.sid('pp'), prompt: h.GO }).stdout ?? '';
      const printed = prompt(world(12, three));
      const reachedLine = prompt(world(3, three));
      const absent = prompt(world(null, three));
      return h.assertAll([
        ['at the price a send is refused for it', atPrice.status === 2 && /SENDS PRICED/.test(atPrice.stderr), atPrice.stderr.slice(0, 500)],
        ['two ended and one running reach the price', withRunning.status === 2 && /SENDS PRICED/.test(withRunning.stderr), withRunning.stderr.slice(0, 500)],
        ['one under the price is not refused for it', !/SENDS PRICED/.test(under.stderr), under.stderr.slice(0, 300)],
        ['a plan with no priced line is not refused for it', !/SENDS PRICED/.test(unpriced.stderr), unpriced.stderr.slice(0, 300)],
        ['the print at an owner message gives the sent, the price and the ends other than DONE', /SENDS \(Doctrine §0e rule 4\): 3 of 12 priced sent under this approval, 1 ended other than DONE\./.test(printed), printed.slice(-600)],
        ['a price that is reached says no further agent is sent', /3 of 3 priced sent/.test(reachedLine) && /The price is reached/.test(reachedLine), reachedLine.slice(-600)],
        ['a plan with no priced line prints no such line', !/priced sent under this approval/.test(absent), absent.slice(-300)],
      ]);
    },
  },
  {
    name: 'The reminder printed at each owner message says what passes in the form that fits the message: a go-word brings held work, a correction lists what the correction hold passes with the plan written in the same turn, the word stop lists what the stop refusal passes; the two refusals carry the same lists',
    guards: ['reminder_go', 'reminder_stop', 'reminder_correction_list', 'reminder_wired', 'correction_plan_passes', 'stop_message_list'],
    run(m, dir, h) {
      const copy = h.tmp('sg-remforms-');
      for (const f of h.FILES) h.copyGuard(join(dir, f), join(copy, f));
      const w = h.world(copy, [h.turn(0, h.GO)], h.STEPS_PLAN);
      const out = (prompt) => w.call('UserPromptSubmit', { session_id: h.sid('rf'), prompt }).stdout ?? '';
      const go = out('Go.');
      const stop = out('Please stop everything now.');
      const fix = out('That button is in the wrong place, make me a plan for the fix.');
      const STOP_LIST = 'the status command, TaskStop, an agent\'s own return and, on the main thread, a read of the record';
      const PLAN_LIST = 'the entry to plan mode and, in plan mode, a write of the plan file and the plan check';
      const old = /If it says something was done wrong: answer it, and run nothing else this turn\./;
      const inProcess = [m.dispatch.reminderFor('Go.'), m.dispatch.reminderFor('stop'), m.dispatch.reminderFor('that is wrong')];
      return h.assertAll([
        ['after a go-word the line says held work may go and the plan goes on', /It ends with a go-word: work held since the last message may be sent again/.test(go) && !/It does not end with a go-word/.test(go), go.slice(0, 700)],
        ['under a correction the line lists the status, the stop of a task, the read, the entry to plan mode and the plan file and the plan check', /it is a correction/.test(fix) && fix.includes(PLAN_LIST) && /a read of the record/.test(fix), fix.slice(0, 700)],
        ['under a correction a message that asks for a plan gets the plan written in the same turn', /a message that asks for a plan gets the plan written in this turn/.test(fix), fix.slice(0, 700)],
        ['under the word stop with no go-word the line lists what the stop refusal lists and not the plan file', /carries the word stop and does not end with a go-word/.test(stop) && stop.includes(STOP_LIST) && !stop.includes('plan file'), stop.slice(0, 700)],
        ['no form keeps the old line that said to run nothing else for every message', !old.test(go) && !old.test(fix) && !old.test(stop), 'old line'],
        ['the first-line and end lines stay in every form', [go, fix, stop].every((t) => /First line: what you are doing now/.test(t) && /End: done, not done/.test(t)), 'tail'],
        ['the function gives the same three forms in process', /go-word: work held/.test(inProcess[0]) && /carries the word stop/.test(inProcess[1]) && /it is a correction/.test(inProcess[2]), inProcess.map((t) => t.split('\n')[1]).join(' | ')],
        ['the stop refusal carries the list the stop form carries', m.dispatch.stopMessage({ at: 0 }).includes(`Only ${STOP_LIST} pass.`), m.dispatch.stopMessage({ at: 0 }).slice(0, 400)],
        ['the correction refusal lists the entry to plan mode and the plan file and the plan check, and keeps its old words', m.dispatch.correctionMessage({ at: 0 }).includes(PLAN_LIST) && /the status command and TaskStop pass; every other call is held/.test(m.dispatch.correctionMessage({ at: 0 })), m.dispatch.correctionMessage({ at: 0 }).slice(0, 700)],
      ]);
    },
  },
  {
    name: 'The hub\'s copies are brought forward at a start: a clean checkout on main behind the remote is fast-forwarded and said with the count and five subjects at most; one that is current is said so; one with a plan in force, on another branch, with uncommitted changes, with a failing fetch or with history that has diverged is left as it stands and why is said; a compaction, an agent\'s start and a repository that is not the hub are not touched',
    guards: ['bf_ff', 'bf_plan', 'bf_compact', 'bf_branch', 'bf_dirty', 'bf_fetch', 'bf_dedupe', 'bf_subjects'],
    run(m, dir, h) {
      const start = { source: 'startup', session_id: 'bf' };
      const go = (r, extra = {}, p = start) => m.dispatch.bringForward(p, { copy: r.dir, repos: [], inForce: false, ...extra });
      const head = (r) => gitAt(r.dir, 'rev-parse', 'HEAD').stdout.trim();
      const remote = (r) => gitAt(r.dir, 'rev-parse', 'origin/main').stdout.trim();
      const behind = hubCheckout(h, { behind: 7 });
      const forwarded = go(behind).join('\n');
      const current = hubCheckout(h, {});
      const same = go(current).join('\n');
      const planned = hubCheckout(h, { behind: 2 });
      const heldByPlan = go(planned, { inForce: true }).join('\n');
      const other = hubCheckout(h, { behind: 2, branch: 'side' });
      const onOther = go(other).join('\n');
      const dirty = hubCheckout(h, { behind: 2, dirty: true });
      const unclean = go(dirty).join('\n');
      const broken = hubCheckout(h, { behind: 2, broken: true });
      const failed = go(broken).join('\n');
      const diverged = hubCheckout(h, { behind: 2, ahead: 1 });
      const split = go(diverged).join('\n');
      const compacted = hubCheckout(h, { behind: 2 });
      const noneAtCompaction = go(compacted, {}, { source: 'compact', session_id: 'bf' });
      const noneForAgent = go(compacted, {}, { source: 'startup', session_id: 'bf', agent_id: 'a1' });
      const resumed = hubCheckout(h, { behind: 1 });
      const afterResume = go(resumed, {}, { source: 'resume', session_id: 'bf' }).join('\n');
      const twin = hubCheckout(h, { behind: 1 });
      const app = h.repo({ 'a.txt': 'an app\n' });
      const many = m.dispatch.bringForward(start, { copy: twin.dir, repos: [twin.dir, app.dir, twin.dir], inForce: false });
      const notHub = h.tmp('sg-nothub-');
      return h.assertAll([
        ['a clean checkout on main behind the remote is brought forward by the count', /brought forward by 7 commits/.test(forwarded) && head(behind) === remote(behind) && existsSync(join(behind.dir, 'c7.txt')), forwarded],
        ['five subjects at most are given, the newest first', /change 7; change 6; change 5; change 4; change 3\./.test(forwarded) && !/change 2/.test(forwarded), forwarded],
        ['a current checkout is said to be current and is not moved', /already current/.test(same) && head(current) === remote(current), same],
        ['a plan in force leaves the copy as it stands and says how far behind it is', /left as it stands, a plan is in force; 2 commits behind origin main/.test(heldByPlan) && head(planned) !== remote(planned) && !existsSync(join(planned.dir, 'c1.txt')), heldByPlan],
        ['another branch leaves it as it stands and names the branch', /left as it stands, it is on the branch side; 2 commits behind/.test(onOther) && !existsSync(join(other.dir, 'c1.txt')), onOther],
        ['uncommitted changes leave it as it stands', /left as it stands, it has uncommitted changes; 2 commits behind/.test(unclean) && !existsSync(join(dirty.dir, 'c1.txt')), unclean],
        ['a failing fetch leaves it as it stands and says the fetch failed', /left as it stands, the fetch failed/.test(failed) && !existsSync(join(broken.dir, 'c1.txt')), failed],
        ['history that has diverged is left as it stands and never merged', /left as it stands, it cannot be fast-forwarded; 2 commits behind/.test(split) && !existsSync(join(diverged.dir, 'c1.txt')) && existsSync(join(diverged.dir, 'local1.txt')), split],
        ['a compaction touches nothing and prints nothing', noneAtCompaction.length === 0 && !existsSync(join(compacted.dir, 'c1.txt')), JSON.stringify(noneAtCompaction)],
        ['an agent\'s start prints nothing', noneForAgent.length === 0, JSON.stringify(noneForAgent)],
        ['a resume is brought forward', /brought forward by 1 commit\b/.test(afterResume) && existsSync(join(resumed.dir, 'c1.txt')), afterResume],
        ['a copy named twice is one line, and a repository that is not the hub is not looked at', many.length === 1 && /brought forward by 1 commit\b/.test(many[0]) && !many[0].includes(app.dir), JSON.stringify(many)],
        ['a folder that is no checkout gets no line', m.dispatch.bringForward(start, { copy: notHub, repos: [], inForce: false }).length === 0 && m.dispatch.isHubCheckout(notHub) === false, 'no line'],
      ]);
    },
  },
  {
    name: 'The hub\'s copies are brought forward through the dispatcher at a startup and a resume and never at a compaction: the gates\' own copy, a checkout behind the remote, says it was brought forward in the start\'s print',
    guards: ['bf_wire'],
    run(m, dir, h) {
      const c = h.suiteCopy(dir, { 'DOCTRINE.md': '# a planted doctrine\n' });
      c.g('branch', '-M', 'main');
      const origin = h.tmp('sg-origin-');
      gitAt(origin, 'init', '-q', '--bare');
      gitAt(origin, 'symbolic-ref', 'HEAD', 'refs/heads/main');
      c.g('remote', 'add', 'origin', origin);
      c.g('push', '-q', 'origin', 'main');
      c.write('c1.txt', 'change 1\n');
      c.g('add', '-A'); c.g('commit', '-q', '-m', 'change 1'); c.g('push', '-q', 'origin', 'main');
      c.g('reset', '-q', '--hard', 'HEAD~1');
      const home = h.tmp('sg-home-');
      mkdirSync(join(home, '.claude'), { recursive: true });
      const startWith = (payload) => spawnSync('node', [join(c.dir, 'hook-dispatch.mjs'), 'SessionStart'], {
        input: JSON.stringify({ cwd: home, session_id: h.sid('bw'), hook_event_name: 'SessionStart', ...payload }), encoding: 'utf8',
        env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: home },
      });
      const agent = startWith({ source: 'startup', agent_id: 'a1' });
      const forwardedBefore = existsSync(join(c.dir, 'c1.txt'));
      const startup = startWith({ source: 'startup' });
      const movedAfter = existsSync(join(c.dir, 'c1.txt'));
      return h.assertAll([
        ['an agent\'s start leaves the copy where it was', forwardedBefore === false && !/HUB COPY/.test(agent.stdout ?? ''), (agent.stdout ?? '').slice(0, 300)],
        ['a startup prints the gates\' copy as brought forward by one commit', /HUB COPY \(the gates' copy\): brought forward by 1 commit: change 1\./.test(startup.stdout ?? ''), (startup.stdout ?? '').slice(-500)],
        ['the commit is in the copy after the start', movedAfter === true, 'c1.txt'],
      ]);
    },
  },
];

export const plants = {
  reminder_state_line: ['and the state line in its fixed forms: paused, pending what of the owner\\\'s; running, what; or finished.', 'and nothing more.', 'hook-dispatch.mjs'],
  reminder_stop_first_line: ['a stop\\\'s first line is "Stopping here", then paused, pending what lifts it, or finished, nothing pending.', 'what you are doing now.', 'hook-dispatch.mjs'],
  seed_batch_dispatch: [String.raw`--(?:item\\s|batch(?:\\s|$))`, String.raw`--(?:item\\s)`, 'hook-dispatch.mjs'],
  seed_batch_planguard: [String.raw`--(?:item\\s|batch(?:\\s|$))`, String.raw`--(?:item\\s)`, 'plan-guard.mjs'],
  seed_rounds_dispatch_range: [String.raw`|\\s+--rounds\\s+[1-5](?=\\s|$))+\\s*$`, String.raw`|\\s+--rounds\\s+[1-9](?=\\s|$))+\\s*$`, 'hook-dispatch.mjs'],
  seed_rounds_dispatch_accepts: [String.raw`|\\s+--rounds\\s+[1-5](?=\\s|$))+\\s*$`, String.raw`)+\\s*$`, 'hook-dispatch.mjs'],
  cost_forced_turns: ["!holds || forced ? ''", "true ? ''", 'hook-dispatch.mjs'],
  tier_switch_record: ['    serving = switchedModel(p, list) ?? serving;', '    void 0;', 'hook-dispatch.mjs'],
  reads_since_approval: ['if (plan && Number.isFinite(plan.approvedAt)) list = list.filter(', 'if (false) list = list.filter(', 'hook-dispatch.mjs'],
  ident_launch_result: ['        if (t.includes(id)) return true;', '        void 0;', 'hook-dispatch.mjs'],
  rule_number_missing: ['    if (!rules.has(n)) { bad.push(', '    if (false) { bad.push(', 'hook-dispatch.mjs'],
  rule_number_quote: ['    if (span && !flat(rules.get(n))', '    if (false && span && !flat(rules.get(n))', 'hook-dispatch.mjs'],
  wait_paused_passes: ['    if (flagged.every((a) => pausedOnRun(a, pad, opts.now ?? Date.now()))) return null;', '    void 0;', 'hook-dispatch.mjs'],
  amend_route_words: ['The route the session has is its own plan-mode tool: enter plan mode with EnterPlanMode,', 'The route the session has is its own tool: enter it with Enter,', 'approved-plan-guard.mjs'],
  named_file_one: ['  return namedFileCandidates(name, roots).slice(0, 1);', '  return namedFileCandidates(name, roots);', 'hook-dispatch.mjs'],
  talk_refusal_marks: [String.raw`|| /\bNO LATCH:/.test(text)) continue;`, ') continue;', 'plan-guard.mjs'],
  own_turn_words: ['Read each, then put the plan up again.${OWN_TURN}`;', 'Read each, then put the plan up again.`;', 'hook-dispatch.mjs'],
  can_asks_guards: ["    approval: guardRefusal('approved-plan-guard.mjs', p, opts),", '    approval: null,', 'hook-dispatch.mjs'],
  seed_start_mode: ['    if (p.permission_mode && !p.plan_mode_forced) {', '    if (false) {', 'hook-dispatch.mjs'],
  decisions_check_named: ['    if (/decisions?[- ]check|check[- ]decisions?/i.test(b)) continue;', '    void 0;', 'hook-dispatch.mjs'],
  verification_read: ['      if (!ok) bad.push(n);', '      void 0;', 'hook-dispatch.mjs'],
  page_next_after_notes: ['    if (f && isManagerNotes(f, p.session_id)) pageFollowsNext(raw, root);', '    void 0;', 'hook-dispatch.mjs'],
  page_next_before_send: ["    if (!p.agent_id && /^(?:Agent|Task|SendMessage|Workflow)$/.test(String(p.tool_name ?? ''))) pageFollowsNext(raw, root);", '    void 0;', 'hook-dispatch.mjs'],
  ident_skip_loop: ['        if (IDENT_SHIMS.has(shim) && idInLaunchResult(p)) continue;', '        void 0;', 'hook-dispatch.mjs'],
  rule_number_subheading: ['if (/^#{1,2} /.test(l)) break;', 'if (true) break;', 'hook-dispatch.mjs'],
  planmode_read_pass: ['if (outside !== null && planModeNoPlan(p, opts)) outside', 'if (false && outside !== null && planModeNoPlan(p, opts)) outside', 'hook-dispatch.mjs'],
  planmode_read_phase: ["  try { return planPhase(p, given).kind !== 'in force'; } catch { return false; }", '  return true;', 'hook-dispatch.mjs'],
  planmode_read_mode: ["  if (p.agent_id || String(p.permission_mode ?? '') !== 'plan') return false;", '  if (p.agent_id) return false;', 'hook-dispatch.mjs'],
  planmode_read_repo: ["  return existsSync(join(a, '.git')) || repoRootOf(a) !== null;", '  return true;', 'hook-dispatch.mjs'],
  planmode_transcript_pass: ['(a) => inGitRepo(a) || inSessionFolder(a, p.session_id));', 'inGitRepo);', 'hook-dispatch.mjs'],
  planmode_transcript_sid: ["parts[0] !== '..' && parts[1] === String(sid) && !parts.includes('..');", "parts[0] !== '..' && !parts.includes('..');", 'hook-dispatch.mjs'],
  rerecord_nolatch: ["if (o.deny && g.includes('plan-fence.mjs') && o.reason.includes(RERECORD_MARK)) return refuse(reason, false);", 'void 0;', 'hook-dispatch.mjs'],
  rerecord_mark: ["export const RERECORD_MARK = 'PLAN FILE BEING RE-RECORDED';", "export const RERECORD_MARK = 'PLAN FILE BEING REWRITTEN';", 'hook-dispatch.mjs'],
  cfg_harness_sync: ['    if (harnessSync) baseline = true;', '    void 0;', 'hook-dispatch.mjs'],
  cfg_harness_field: ["source: String(p?.source ?? ''), file, baseline, harnessSync };", "source: String(p?.source ?? ''), file, baseline };", 'hook-dispatch.mjs'],
  cfg_print_harness: ["${r.harnessSync ? 'the harness", "${false ? 'the harness", 'report.mjs'],
  can_mode_read: ['  if (files) { try { mode = planModeState(tailEntries(files.main, 16 * 1024 * 1024)).mode; } catch { mode = null; } }', '  if (files) { mode = null; }', 'hook-dispatch.mjs'],
  search_pattern_skip: ['      if (asPattern && !patternSeen) { patternSeen = true; continue; }', '      if (false) { patternSeen = true; continue; }', 'hook-dispatch.mjs'],
  search_pattern_flags: ['.every((x) => SEARCH_FLAG.test(x));', '.every(() => true);', 'hook-dispatch.mjs'],
  search_pattern_e: ['      if (asPattern && SEARCH_E_FLAG.test(raw)) { patternSeen = true; patternNext = true; continue; }', '      void 0;', 'hook-dispatch.mjs'],
  can_passes_latch_list: ['  const passesLatch = latchPasses(p, latch).passes;', "  const passesLatch = free || tool === 'TaskStop';", 'hook-dispatch.mjs'],
  latch_passes_report: ['    try { reportWrite = !!latch && agentReportWrite(p); } catch { reportWrite = false; }', '    reportWrite = false;', 'hook-dispatch.mjs'],
  found_done_skip: ['!queued.has(q.key) && !done.has(q.key)', '!queued.has(q.key)', 'hook-dispatch.mjs'],
  found_done_state: [String.raw`State:\s*done\b/m.test(entry)`, String.raw`State:\s*\w+\b/m.test(entry)`, 'hook-dispatch.mjs'],
  correction_enter_hold: ['      try { if (correction && correctionPass(p, phase.planMode)) correction = null; } catch', '      try { if (false) correction = null; } catch', 'hook-dispatch.mjs'],
  correction_enter_unit: ["  if (String(p.tool_name ?? '') === 'EnterPlanMode') return true;\n  if (!planMode) return false;", '  if (!planMode) return false;', 'hook-dispatch.mjs'],
  can_tilde_spelling: ["return { full, tilde: below ? `~/${join(rel, 'hook-dispatch.mjs')}` : null };", 'return { full, tilde: null };', 'hook-dispatch.mjs'],
  can_spellings_words: ['a check spelled any other way, the working copy\'s path or a quoted tilde among them, is not the check and is refused.', 'a check spelled any other way is refused.', 'hook-dispatch.mjs'],
  agent_check_before_guards: ["    if (p.agent_id && String(p.tool_name ?? '') === 'Bash' && CAN.test(String(p.tool_input?.command ?? ''))) {", '    if (false) {', 'hook-dispatch.mjs'],
  seed_wish_item: ["return { args: ['--item', w.item, ...tail], notes };", "return { args: ['--item', 'next', ...tail], notes };", 'hook-dispatch.mjs'],
  seed_wish_rounds: ["...(w.rounds ? ['--rounds', String(w.rounds)] : [])", '...[]', 'hook-dispatch.mjs'],
  seed_wish_valid_item: ['if (/^(?:P-\\d+|new)$/.test(item)) out.item = item;', 'if (/^.+$/.test(item)) out.item = item;', 'hook-dispatch.mjs'],
  seed_wish_valid_rounds: ['if (/^[1-5]$/.test(rounds)) out.rounds = Number(rounds);', 'if (/^\\d+$/.test(rounds)) out.rounds = Number(rounds);', 'hook-dispatch.mjs'],
  seed_wish_newest: ['if (m) v = m[1]; }', 'if (m && v === null) v = m[1]; }', 'hook-dispatch.mjs'],
  price_parse: [String.raw`Sends priced[ \t]*:[ \t]*(\d+)\b/mi.exec`, String.raw`Sends priced[ \t]*(\d+)\b/mi.exec`, 'hook-dispatch.mjs'],
  count_review: ['    if (reviewers.includes(e.step)) continue;', '    void 0;', 'hook-dispatch.mjs'],
  count_running: ['  return { sent: read.ends.length + (read.running?.length ?? 0), notDone };', '  return { sent: read.ends.length, notDone };', 'hook-dispatch.mjs'],
  price_refuses: ['    if (counts && counts.sent >= price) {', '    if (false) {', 'hook-dispatch.mjs'],
  price_nolatch: ['        + `${FENCE_NO_LATCH} this refusal sets no latch, so the next call is judged on its own.`);', '        + `this refusal sets no latch, so the next call is judged on its own.`);', 'hook-dispatch.mjs'],
  price_print: ['    try { const sends = sendsLine(p); if (sends) printed.push(sends); } catch', '    try { void 0; } catch', 'hook-dispatch.mjs'],
  reminder_go: ['  if (endsWithGoWord(prompt)) form = ', '  if (false) form = ', 'hook-dispatch.mjs'],
  reminder_stop: ['  else if (isStopMessage(prompt)) form = ', '  else if (false) form = ', 'hook-dispatch.mjs'],
  reminder_correction_list: ['answer every point in it in this turn; ${CORRECTION_PASSES} pass,', 'answer every point in it in this turn; nothing else passes,', 'hook-dispatch.mjs'],
  reminder_wired: ['    const REMINDER = reminderFor(p.prompt);', "    const REMINDER = reminderFor('');", 'hook-dispatch.mjs'],
  correction_plan_passes: ['    + `Also passing: ${PLAN_PASSES}, so a message that asks for a plan gets the plan written in the same turn. `', '    + ``', 'hook-dispatch.mjs'],
  stop_message_list: ['    + `Only ${STOP_PASSES} pass. `', '    + `Only the status command and TaskStop pass. `', 'hook-dispatch.mjs'],
  bf_ff: ["const merged = git(dir, ['merge', '--ff-only', 'origin/main']);", "const merged = git(dir, ['reset', '--hard', 'origin/main']);", 'hook-dispatch.mjs'],
  bf_plan: ["    if (inForce) reasons.push('a plan is in force');", '    void 0;', 'hook-dispatch.mjs'],
  bf_compact: ["  if (p?.agent_id || !(p?.source === 'startup' || p?.source === 'resume')) return [];", '  if (p?.agent_id) return [];', 'hook-dispatch.mjs'],
  bf_branch: ["else if (branch.out !== 'main') reasons.push(", 'else if (false) reasons.push(', 'hook-dispatch.mjs'],
  bf_dirty: ["else if (dirty.out) reasons.push('it has uncommitted changes');", "else if (false) reasons.push('it has uncommitted changes');", 'hook-dispatch.mjs'],
  bf_fetch: ['    if (!fetched.ok) {', '    if (false) {', 'hook-dispatch.mjs'],
  bf_dedupe: ['    if (seen.has(key) || !isHubCheckout(dir)) return;', '    if (!isHubCheckout(dir)) return;', 'hook-dispatch.mjs'],
  bf_subjects: ["['log', '--format=%s', '-5', 'HEAD..origin/main']", "['log', '--format=%s', 'HEAD..origin/main']", 'hook-dispatch.mjs'],
  bf_wire: ['    try { printed.push(...bringForward(p, { root })); } catch', '    try { void 0; } catch', 'hook-dispatch.mjs'],
};
