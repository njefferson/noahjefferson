// The cases and plants of hook-dispatch.mjs, plan-guard.mjs and approved-plan-guard.mjs added by step 120 of the plan of 8 November: the seed's batch
// command (Q-HUB-275), the forced-turns count in the Cost (Q-HUB-282), the model switch that counts at once (Q-HUB-288), the reads gate since the
// approval (Q-HUB-290), an id a launch printed (Q-HUB-291), a rule named by number (Q-HUB-309), the wait for an agent paused on its run (Q-HUB-317),
// the approval guard's route (Q-HUB-323), one file for a What is name (Q-HUB-325), the talk check past a refusal (Q-HUB-326), the words of the gates
// that read an earlier call (Q-HUB-327), the check of a call asking both guards (Q-HUB-328), the seed at a resumed plan mode (Q-HUB-336), the
// decisions check (Q-HUB-340) and a Verification read outside the record (Q-HUB-341), and by step 141 of the plan of 9 November: the page
// refresh after the notes (Q-HUB-347), the hook loop's identifier skip (Q-HUB-349), a rule under a sub-heading (Q-HUB-351) and the read in plan
// mode with no plan (Q-HUB-362). The shape of this file is guard-cases/shape.mjs.
import { mkdirSync, writeFileSync, utimesSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const FABLE = 'claude-fable-1';
const SONNET = 'claude-sonnet-5';

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
];

export const plants = {
  reminder_state_line: ['and the state line in its fixed forms: paused, pending what of the owner\\\'s; running, what; or finished.', 'and nothing more.', 'hook-dispatch.mjs'],
  reminder_stop_first_line: ['a stop\\\'s first line is "Stopping here", then paused, pending what lifts it, or finished, nothing pending.', 'what you are doing now.', 'hook-dispatch.mjs'],
  seed_batch_dispatch: [String.raw`--(?:item\\s|batch(?:\\s|$))`, String.raw`--(?:item\\s)`, 'hook-dispatch.mjs'],
  seed_batch_planguard: [String.raw`--(?:item\\s|batch(?:\\s|$))`, String.raw`--(?:item\\s)`, 'plan-guard.mjs'],
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
};
