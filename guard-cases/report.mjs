// The cases and plants of report.mjs added by step 121 of the plan of 8 November: the status print's plan-mode line (Q-HUB-329), the status page's
// newest Version and Open lines (Q-HUB-331), every send's report and a Found line keyed by its text (Q-HUB-332, Q-HUB-333), the pointer across an
// amendment's approval (Q-HUB-344), the page following the manager's Next line (Q-HUB-289) and the wait's read of a paused agent (Q-HUB-317).
// The shape of this file is the one guard-cases/shape.mjs describes.
import { mkdirSync, writeFileSync, rmSync, utimesSync, appendFileSync, readFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

// A scratchpad where `scratchpadOf` finds it for this process (the suite's TMPDIR), and a main transcript where `sessionFiles` finds it.
function session(h, prefix, entries = []) {
  const s = h.sid(prefix);
  const pad = join(process.env.TMPDIR, 'claude-0', '-home-user', s, 'scratchpad');
  mkdirSync(join(pad, 'progress'), { recursive: true });
  mkdirSync(join(pad, 'status'), { recursive: true });
  const proj = join(process.env.HOME, '.claude', 'projects', '-home-user');
  mkdirSync(join(proj, s, 'subagents'), { recursive: true });
  const main = join(proj, `${s}.jsonl`);
  writeFileSync(main, h.jsonl(entries.length ? entries : [h.turn(0, 'start')]));
  return { s, pad, main, subs: join(proj, s, 'subagents') };
}

const ORDER_TEXT = '# Found test plan\n\n## Goals\n1. A goal.\n\n## Steps\n5. **Five.** Do it.\n\n## Order\nOrder: 5\n';

export const cases = [
  {
    name: 'Q-HUB-329: the status print gives the plan mode the owner\'s newest message carried and, in plan mode, whether the gates read it as the owner\'s or as a restart\'s; off, unknown and a missing transcript are said as such',
    guards: ['mode_line_restart', 'mode_line_off', 'mode_line_unknown', 'mode_line_owner'],
    run(m, dir, h) {
      const plan = join(h.tmp('sg-mode-'), 'plan.md');
      writeFileSync(plan, '# A plan\n');
      const marker = join(dirname(plan), 'marker.json');
      writeFileSync(marker, JSON.stringify({ plan, hash: h.sha256('# A plan\n'), at: h.ts(-10) }));
      const line = (entries, mk = marker) => { const x = session(h, 'md', entries); return m.report.modeLine(x.s, mk); };
      const planTurn = { ...h.turn(-5, 'Go.'), permissionMode: 'plan' };
      const owners = line([h.turn(-20, 'start'), planTurn, h.planOn(1, plan)]);
      const restart = line([h.turn(-20, 'start'), planTurn, h.boundary(10), h.planOn(11, plan)]);
      const off = line([{ ...h.turn(-5, 'Go.'), permissionMode: 'auto' }]);
      const unknown = line([h.turn(-5, 'Go.')]);
      const none = m.report.modeLine('no-such-session-anywhere', marker);
      return h.assertAll([
        ['plan mode entered by the owner reads as the owner\'s', /Plan mode: on, and the gates read it as the owner's/.test(owners), owners],
        ['a plan mode that came with a compaction after the approval reads as a restart\'s', /Plan mode: on, and the gates read it as a restart's/.test(restart) && restart.includes(plan), restart],
        ['a mode other than plan is off and names the mode', /^Plan mode: off\./.test(off) && off.includes('permission mode auto'), off],
        ['a message that records no mode is unknown', /^Plan mode: unknown/.test(unknown), unknown],
        ['no transcript is not read', /^Plan mode: not read/.test(none), none],
      ]);
    },
  },
  {
    name: 'Q-HUB-385: the status print reads the plan mode from the newest approval or entry call and takes a typed message\'s mode only where no later approval stands; an approval followed by a typed message gives that message\'s mode, an error result counts for neither call, and a plan mode entered after an approval reads as on',
    guards: ['mode_state_approval', 'mode_state_order', 'mode_state_enter'],
    run(m, dir, h) {
      const plan = join(h.tmp('sg-mode-'), 'plan.md');
      writeFileSync(plan, '# A plan\n');
      const marker = join(dirname(plan), 'marker.json');
      const line = (entries) => { const x = session(h, 'ms', entries); return m.report.modeLine(x.s, marker); };
      const planTurn = { ...h.turn(-90, 'Go.'), permissionMode: 'plan' };
      const approved = line([h.turn(-100, 'start'), planTurn, ...h.enterPlan(-80), ...h.exitPlan(-60, true)]);
      const typed = line([h.turn(-100, 'start'), planTurn, ...h.enterPlan(-80), ...h.exitPlan(-60, true), { ...h.turn(-40, 'Next.'), permissionMode: 'auto' }]);
      const refused = line([h.turn(-100, 'start'), planTurn, ...h.exitPlan(-60, false)]);
      const entered = line([h.turn(-100, 'start'), { ...planTurn, permissionMode: 'auto' }, ...h.enterPlan(-80)]);
      const again = line([h.turn(-100, 'start'), planTurn, ...h.enterPlan(-80), ...h.exitPlan(-60, true), ...h.enterPlan(-30, 'ep2')]);
      return h.assertAll([
        ['an approval after the plan-mode message ends plan mode in the print', /^Plan mode: off\. The newest approval/.test(approved), approved],
        ['a message typed after the approval gives its own mode', /^Plan mode: off\./.test(typed) && typed.includes('permission mode auto'), typed],
        ['an exit that was not an approval leaves the typed message\'s plan mode', /^Plan mode: on/.test(refused), refused],
        ['an entry call answered after a message typed under auto reads as plan mode, the session\'s', /^Plan mode: on/.test(entered) && entered.includes('EnterPlanMode'), entered],
        ['a plan mode entered after an approval reads as on', /^Plan mode: on/.test(again), again],
      ]);
    },
  },
  {
    name: 'Q-HUB-329: report.mjs prints the plan-mode line in a status, under the serving model',
    guards: ['mode_line_printed'],
    run(m, dir, h) {
      const x = session(h, 'mp', [{ ...h.turn(-5, 'Go.'), permissionMode: 'auto' }]);
      const out = spawnSync('node', [join(dir, 'report.mjs'), 'Status 10:00 — the plan mode test'], { encoding: 'utf8', env: { ...process.env, CLAUDE_CODE_SESSION_ID: x.s } }).stdout ?? '';
      const at = out.indexOf('Plan mode: off.');
      return h.assertAll([
        ['the status prints the plan-mode line', at >= 0, out.slice(0, 600)],
        ['it comes after the serving model line', out.indexOf('Serving model:') >= 0 && out.indexOf('Serving model:') < at, out.slice(0, 600)],
      ]);
    },
  },
  {
    name: 'Q-HUB-331: the status page shows the newest Version line and the newest Open line and folds the earlier ones, and a single line is shown plain',
    guards: ['page_folded_version', 'page_folded_open', 'page_folded_count'],
    run(m, dir, h) {
      const pad = h.tmp('sg-fold-');
      mkdirSync(join(pad, 'status'), { recursive: true });
      writeFileSync(join(pad, 'status', 'manager.txt'), 'Version: staging old one\nVersion: staging middle two\nVersion: staging newest three\nOpen: nothing at all\nOpen: still nothing\nOpen: one choice for the owner\n');
      const st = (notes) => ({ read: false, why: 'no plan', pointer: null, steps: [], found: [], title: '', titles: new Map(), reviewers: [], manager: notes });
      const page = m.report.statusPage(st(m.report.managerNotes(pad)), 'Status 10:00 — fold test');
      const shown = (html) => html.split('<details>')[0];
      const folded = (html) => html.slice(html.indexOf('<details>'));
      const lastDetails = page.slice(page.lastIndexOf('<details>'));
      writeFileSync(join(pad, 'status', 'manager.txt'), 'Version: only one\nOpen: only open\n');
      const plain = m.report.statusPage(st(m.report.managerNotes(pad)), 'Status 10:00 — fold test');
      return h.assertAll([
        ['the newest Version is shown outside any disclosure', shown(page).includes('staging newest three') && !shown(page).includes('staging old one'), shown(page)],
        ['the earlier Versions sit inside a disclosure, newest of them first', folded(page).includes('staging middle two') && folded(page).indexOf('middle two') < folded(page).indexOf('old one'), folded(page)],
        ['the disclosure counts the earlier Version lines', page.includes('2 earlier Version lines'), page],
        ['the newest Open line is shown and the earlier ones are folded', page.includes('one choice for the owner') && lastDetails.includes('still nothing') && lastDetails.includes('nothing at all') && !page.slice(0, page.lastIndexOf('<details>')).split('<h2>Open for you</h2>')[1]?.includes('still nothing'), lastDetails],
        ['the disclosure counts the earlier Open lines', page.includes('2 earlier Open lines'), page],
        ['one Version and one Open are shown with no disclosure', !plain.includes('<details>') && plain.includes('only one') && plain.includes('only open'), plain],
      ]);
    },
  },
  {
    name: 'Q-HUB-332 and Q-HUB-333: every send\'s report of a step is read, a Found line is the same finding when its text repeats so a resend renumbers nothing, a line saying there is nothing new is no finding, and the status points at the newest send\'s report',
    guards: ['found_sends', 'found_dedupe', 'found_none', 'found_report_path'],
    run(m, dir, h) {
      const x = session(h, 'fd');
      const w = (name, text) => writeFileSync(join(x.pad, 'progress', name), text);
      w('step-5-report.txt', 'DONE\nwall line\nFound: alpha defect in the first file.\nFound: none new.\nFound: beta defect in the second file.\n');
      w('step-5-2-report.txt', 'DONE\nwall line\nFound: alpha defect in the first file.\nFound: beta defect in the second file.\nFound: gamma defect added by the resend.\nFound: none of the plants caught the edit.\n');
      w('step-6-report.txt', 'DONE\nwall line\nFound: no new finding.\nFound: nothing new.\nFound: None.\nFound: none found\n');
      w('step-7-report.txt', 'DONE\nwall line\nFound: delta defect.\n');
      w('step-5-review-1.txt', 'ON-AIM\nFound: not a report file.\n');
      const found = m.report.foundLines(x.pad);
      const keys = found.map((f) => `${f.key}=${f.line.replace(/^Found:\s*/, '').split(' ')[0]}`).join(',');
      const sorted = m.report.sortFound(found, { sorts: new Map([['5.2', { how: 'queued', note: 'beta is kept' }]]) });
      const files = m.report.reportFiles(x.pad).map((r) => `${r.step}.${r.send}`).join(',');
      const ps = m.report.pointerState(x.s, { path: join(x.pad, 'plan.md'), text: ORDER_TEXT });
      const row = ps.steps.find((r) => r.step === 5);
      return h.assertAll([
        ['both sends are read and the repeated lines keep their first numbers', keys === '5.1=alpha,5.2=beta,5.3=gamma,5.4=none,7.1=delta', keys],
        ['a line that only begins with none is a finding', found.some((f) => f.key === '5.4' && /none of the plants/.test(f.line)), keys],
        ['lines that say there is nothing new count as none', !found.some((f) => f.step === 6), keys],
        ['a sort keyed to a number holds after the resend added a line', sorted.queued.length === 1 && /beta defect/.test(sorted.queued[0].line) && sorted.unsorted.length === 4, JSON.stringify(sorted.queued)],
        ['the report files list sends in order and leave review notes out', files === '5.1,5.2,6.1,7.1', files],
        ['the step\'s report path is its newest send\'s', !!row && row.report.endsWith('step-5-2-report.txt') && row.reportWritten === true, row?.report],
      ]);
    },
  },
  {
    name: 'Q-HUB-344: a send made before an amendment was approved at the button still counts when its prompt names the plan in force and its step is one the marker records; a marker with no steps list, another plan\'s path and a step the marker does not record keep the earlier-approval rule',
    guards: ['pointer_amended_steps', 'pointer_plan_identity', 'pointer_identity_missing'],
    run(m, dir, h) {
      const marker = join(process.env.HOME, '.claude', 'APPROVED-PLAN.json');
      mkdirSync(dirname(marker), { recursive: true });
      const tr = h.transcript([h.turn(0, 'start')]);
      const subs = join(tr.slice(0, -'.jsonl'.length), 'subagents');
      mkdirSync(subs, { recursive: true });
      const sentTo = (prompt, s) => h.at({ type: 'user', message: { role: 'user', content: prompt } }, h.later(s));
      const handed = (id, s) => [h.at(h.tool(0, `${id}-h`, 'SubagentHandback', { message: 'DONE\nThe second line.' }), h.later(s)), h.at(h.result(0, `${id}-h`, 'Report delivered to your caller.'), h.later(s + 1))];
      const put = (id, prompt, s) => writeFileSync(join(subs, `agent-${id}.jsonl`), h.jsonl([sentTo(prompt, s), ...handed(id, s + 10)]));
      put('before5', '/plans/amend-plan.md step 5', -600);
      put('before6', '/plans/amend-plan.md step 6', -600);
      put('other5', '/plans/other-plan.md step 5', -600);
      put('after5', '/plans/amend-plan.md step 5', -100);
      const ids = () => (m.report.stepEnds({ transcript_path: tr, session_id: 'nothing-on-disk' })?.ends ?? []).map((e) => `${e.id}:${e.step}`).sort().join(',');
      try {
        const base = { plan: '/plans/amend-plan.md', hash: 'not-this-plan-file', at: h.later(-50), approvedAt: h.later(-300) };
        // Q-HUB-348: the identity the approval guard records, the plan's first approval time and its title line.
        const same = { firstApprovedAt: h.later(-700), title: '# The amended plan' };
        writeFileSync(marker, JSON.stringify({ ...base, ...same, steps: [5] }));
        const withSteps = ids();
        writeFileSync(marker, JSON.stringify({ ...base, ...same }));
        const noSteps = ids();
        // Two plans written to one path: the second was first approved at -300, after the first plan's agents handed back, so its marker
        // carries the same steps and a later first approval time. It must not count the first plan's DONE.
        writeFileSync(marker, JSON.stringify({ ...base, firstApprovedAt: h.later(-300), title: '# A different plan', steps: [5] }));
        const otherPlan = ids();
        writeFileSync(marker, JSON.stringify({ ...base, steps: [5] }));
        const noIdentity = ids();
        writeFileSync(marker, JSON.stringify({ ...base, firstApprovedAt: h.later(-700), steps: [5] }));
        const noTitle = ids();
        return h.assertAll([
          ['a send of a recorded step before the approval counts', withSteps === 'after5:5,before5:5', withSteps],
          ['a marker with no steps list drops every send before the approval', noSteps === 'after5:5', noSteps],
          ['a different plan written to the same path drops the earlier plan\'s sends of the same step', otherPlan === 'after5:5', otherPlan],
          ['a marker that records no identity keeps no send before the approval', noIdentity === 'after5:5', noIdentity],
          ['a marker that records no title keeps no send before the approval', noTitle === 'after5:5', noTitle],
        ]);
      } finally { rmSync(marker, { force: true }); }
    },
  },
  {
    name: 'Q-HUB-289: the status page is rewritten when the manager notes\' newest unnumbered Next line differs from the one the page carries, and only then; a session with no page gets none',
    guards: ['page_next_refresh', 'page_next_unchanged', 'page_next_cli'],
    run(m, dir, h) {
      const x = session(h, 'nx');
      const notes = join(x.pad, 'status', 'manager.txt');
      const page = join(x.pad, 'status', 'fix-run.html');
      const clock = { at: Date.now(), status: 'Status 10:00 — the next test' };
      const none = m.report.refreshPageForNext(x.s, clock);
      writeFileSync(notes, 'Next: the first move\n');
      m.report.writeStatusPage(x.s, clock);
      const first = readFileSync(page, 'utf8');
      const same = m.report.refreshPageForNext(x.s, clock);
      appendFileSync(notes, 'Next 3: a numbered line is not the page\'s\n');
      const numbered = m.report.refreshPageForNext(x.s, clock);
      appendFileSync(notes, 'Next: the second move\n');
      const changed = m.report.refreshPageForNext(x.s, clock);
      const second = readFileSync(page, 'utf8');
      appendFileSync(notes, 'Next: the third move\n');
      const cli = spawnSync('node', [join(dir, 'report.mjs'), '--page-next'], { encoding: 'utf8', input: JSON.stringify({ session_id: x.s }), env: { ...process.env, CLAUDE_CODE_SESSION_ID: '' } });
      const third = readFileSync(page, 'utf8');
      return h.assertAll([
        ['a session with no page gets none', none === null, none],
        ['the page carried the first Next line', first.includes('The next move: the first move'), first],
        ['an unchanged Next line rewrites nothing', same === null && numbered === null, `${same} ${numbered}`],
        ['a changed Next line rewrites the page', changed === page && second.includes('The next move: the second move') && !second.includes('first move'), second],
        ['the plain command does the same', /status page written/.test(cli.stdout) && third.includes('The next move: the third move'), cli.stdout + cli.stderr],
      ]);
    },
  },
  {
    name: 'Q-HUB-317: when the wait returns it prints, for a running agent whose note has gone stale, the last line of the output file its note names and its last tool result',
    guards: ['wait_flagged_read'],
    async run(m, dir, h) {
      const x = session(h, 'wp');
      const said = (secs, id, name, input) => h.at(h.tool(0, id, name, input), h.later(secs));
      const back = (secs, id, text) => h.at(h.result(0, id, text), h.later(secs));
      const sent = (secs, prompt) => h.at({ type: 'user', message: { role: 'user', content: prompt } }, h.later(secs));
      const agent = (id, entries) => {
        writeFileSync(join(x.subs, `agent-${id}.jsonl`), h.jsonl(entries));
        writeFileSync(join(x.subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step for ${id}` }));
      };
      const outFile = join(x.pad, 'scratch', 'paused-run.txt');
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, 'run at case 40 of 90\nrun at case 41 of 90\n');
      agent('paused', [sent(-3000, '/plans/gate-test.md step 3'), said(-10, 'p1', 'Bash', { command: 'node suite.mjs' }), back(-9, 'p1', 'suite: 41 of 90 cases passed so far')]);
      writeFileSync(join(x.pad, 'progress', 'step-3.txt'), `10:02 step 3: label: suite run, output ${outFile}\n`);
      const old = (Date.now() - 20 * 60000) / 1000;
      utimesSync(join(x.pad, 'progress', 'step-3.txt'), old, old);
      agent('moving', [sent(-60, '/plans/gate-test.md step 2'), said(-10, 'm1', 'Bash', { command: 'node build.mjs' }), back(-9, 'm1', 'built')]);
      writeFileSync(join(x.pad, 'progress', 'step-2.txt'), '10:01 step 2: building\n');
      const env = { CLAUDE_CODE_SESSION_ID: x.s, REPORT_WAIT_MS: '8000', REPORT_WAIT_POLL_MS: '100' };
      const run = h.waitRun(dir, env);
      await h.settle();
      appendFileSync(join(x.pad, 'progress', 'step-2.txt'), '10:05 step 2: the build moved\n');
      const out = await run;
      return h.assertAll([
        ['the wait returned for the note that moved', out.code === 0 && out.out.includes('the build moved'), out.out],
        ['it names the paused agent as flagged', out.out.includes('Running agents whose note is flagged') && out.out.includes('agent paused') && out.out.includes('FLAGGED'), out.out],
        ['it prints the last line of the output file the note names', out.out.includes(`last line of ${outFile}: run at case 41 of 90`), out.out],
        ['it prints the agent\'s last tool result', /Its last tool result, Bash: suite: 41 of 90 cases passed so far/.test(out.out), out.out],
      ]);
    },
  },
  {
    name: 'Q-HUB-384: the status print and the reads gate read one list of refused reads: a recall file refused before the session\'s newest compaction is on neither, a refusal after it is on both, a refusal before the plan\'s approval is dropped, and with no compaction the refusal stands',
    guards: ['refusals_compaction', 'refusals_approval', 'refusals_hook_form', 'refusals_shared_status', 'refusals_shared_gate'],
    run(m, dir, h) {
      const files = h.tmp('sg-refused-');
      const recall = join(files, 'recall.md');
      const after = join(files, 'after.md');
      writeFileSync(recall, 'x\n');
      writeFileSync(after, 'x\n');
      const plan = { path: '/plans/gate-test.md', text: h.STEPS_PLAN };
      const bySystem = h.at(h.boundary(0), h.later(-300));
      const byHook = { type: 'attachment', timestamp: h.later(-300), attachment: { type: 'hook_success', hookEvent: 'SessionStart', hookName: 'SessionStart:compact' } };
      const world = (extra, only) => {
        const x = session(h, 'rf', [h.turn(0, 'start'), ...extra]);
        if (only !== 'after') m.report.noteRefusedRead(x.s, recall, 'refused before the compaction', Date.now() - 3600 * 1000);
        if (only !== 'recall') m.report.noteRefusedRead(x.s, after, 'refused after the compaction', Date.now() - 100 * 1000);
        const entries = [h.turn(0, 'start'), ...extra];
        const gate = m.dispatch.readsGate({ session_id: x.s, transcript_path: x.main, tool_name: 'Agent', tool_input: { prompt: `${plan.path} step 1` } }, plan);
        return { x, entries, gate: String(gate ?? ''), status: m.report.readsBlock(x.s, 0), stand: m.report.standingRefusals(m.report.refusedReads(x.s), entries).map((r) => r.path) };
      };
      const sys = world([bySystem]);
      const hook = world([byHook]);
      const none = world([]);
      const recallOnly = world([bySystem], 'recall');
      const before = m.report.standingRefusals([{ path: after, at: Date.now() - 100 * 1000, why: 'x' }], [], Date.now() - 50 * 1000).length;
      return h.assertAll([
        ['with a compaction the recall file refused before it stands in neither list', !sys.status.includes(recall) && !sys.gate.includes(recall) && !sys.stand.includes(recall), `${sys.status} | ${sys.gate}`],
        ['the refusal made after the compaction stands in both lists', sys.status.includes(after) && sys.gate.includes(after) && sys.stand.includes(after), `${sys.status} | ${sys.gate}`],
        ['a compaction recorded as the session start hook\'s entry counts the same', !hook.status.includes(recall) && hook.status.includes(after) && !hook.gate.includes(recall), hook.status],
        ['with no compaction in the transcript the refusal stands in both', none.status.includes(recall) && none.gate.includes(recall), none.status],
        ['a session whose only refusal came before the compaction is told none and its send is not held', /not read since: none\./.test(recallOnly.status) && recallOnly.gate === '', `${recallOnly.status} | ${recallOnly.gate}`],
        ['a refusal made before the plan was approved is dropped by the shared list', before === 0, before],
      ]);
    },
  },
  {
    name: 'step 191: the pointer counts a step done by decision where the manager notes hold a Done line for a step of the Order whose newest end is a hand-back that does not open DONE or an interruption, and counts none for a step no agent was sent for, a step with an agent running, a step outside the Order or a step with no Done line; the status line of states says done by decision',
    guards: ['decided_count', 'decided_running', 'decided_state', 'decided_order'],
    run(m, dir, h) {
      const text = '# Decided plan\n\n## Steps\n1. **One.** x\n2. **Two.** y\n3. **Three.** z\n\n## Order\nOrder: 1 2 3\n';
      const end = (step, how, last, at) => ({ id: `e${step}-${at}`, step, how, last, at });
      const ends = [end(1, 'a report', 'FAILED\nwall', 100), end(2, 'an interruption', '', 100), end(9, 'a report', 'FAILED\nwall', 100)];
      const notes = (...steps) => ({ done: new Map(steps.map((n) => [n, 'counted'])) });
      const decided = m.report.pointerOf(text, ends, notes(1, 2, 3, 9));
      const plain = m.report.pointerOf(text, ends, null);
      const running = m.report.pointerOf(text, ends, notes(1, 2), null, new Set([1]));
      const win = m.report.pointerOf(text, [end(1, 'a report', 'DONE\nwall', 100), end(1, 'a report', 'FAILED\nwall', 200)], notes(1));
      const noLine = m.report.pointerOf(text, ends, notes());
      // The status's line of states, read for a session from its agents and its notes.
      const x = session(h, 'dd');
      const planPath = join(x.pad, 'plan.md');
      const sent = (prompt, s) => h.at({ type: 'user', message: { role: 'user', content: prompt } }, h.later(s));
      const handed = (id, s, word) => [h.at(h.tool(0, `${id}-h`, 'SubagentHandback', { message: `${word}\nThe second line.` }), h.later(s)), h.at(h.result(0, `${id}-h`, 'Report delivered to your caller.'), h.later(s + 1))];
      writeFileSync(join(x.subs, 'agent-dd1.jsonl'), h.jsonl([sent(`${planPath} step 1`, -300), ...handed('dd1', -200, 'FAILED')]));
      writeFileSync(join(x.subs, 'agent-dd1.meta.json'), JSON.stringify({ agentType: 'general-purpose', description: 'Plan step 1' }));
      writeFileSync(join(x.pad, 'status', 'manager.txt'), 'Done 1: counted by decision\n');
      const st = m.report.pointerState(x.s, { path: planPath, text });
      const row = st.steps.find((r) => r.step === 1);
      const printed = m.report.pointerBlock(st);
      return h.assertAll([
        ['steps 1 and 2 are done by decision and step 3, with no agent sent, is not', decided.done.has(1) && decided.done.has(2) && !decided.done.has(3) && decided.next === 3 && [...decided.decided].join(',') === '1,2', JSON.stringify([...decided.done])],
        ['without the notes the same ends count nothing', plain.done.size === 0 && plain.next === 1 && plain.decided.size === 0, JSON.stringify([...plain.done])],
        ['a step with an agent running is not counted, and the other still is', !running.done.has(1) && running.done.has(2) && running.next === 1, JSON.stringify([...running.done])],
        ['a step outside the Order is not counted', !decided.done.has(9) && !decided.decided.has(9), JSON.stringify([...decided.done])],
        ['a step with a DONE hand-back is done and not by decision', win.done.has(1) && win.decided.size === 0, JSON.stringify([...win.decided])],
        ['a Done line for no step leaves the pointer as it was', noLine.done.size === 0 && noLine.next === 1, JSON.stringify([...noLine.done])],
        ['the status row says done by decision and the pointer moves past it', row?.state === 'done by decision' && st.pointer.next === 2, JSON.stringify(row)],
        ['the printed line of states says it', /Order, each step's state: 1 done by decision; 2 not sent; 3 not sent\./.test(printed) && /^next: step 2$/m.test(printed), printed],
      ]);
    },
  },
  {
    name: 'step 191: a plan mode the harness began at a restart is not the plan\'s once the manager notes count every step that ended other than DONE by a Done line, and not once they hold an Eject line naming the plan\'s file; with a step left it still is',
    guards: ['decided_finished', 'decided_restart_notes'],
    run(m, dir, h) {
      const base = h.tmp('sg-dec-');
      const plan = join(base, 'ordered-plan.md');
      const text = '# An ordered plan\n\n## Steps\n1. **One.** x\n2. **Two.** y\n\n## Order\nOrder: 1 2\n';
      writeFileSync(plan, text);
      const marker = join(base, 'marker.json');
      writeFileSync(marker, JSON.stringify({ plan, hash: h.sha256(text), at: h.ts(-10) }));
      const planTurn = { ...h.turn(-5, 'Go.'), permissionMode: 'plan' };
      const x = session(h, 'df', [h.turn(-20, 'start'), planTurn, h.boundary(10), h.planOn(11, plan)]);
      const sent = (prompt, s) => h.at({ type: 'user', message: { role: 'user', content: prompt } }, h.later(s));
      const handed = (id, s, word) => [h.at(h.tool(0, `${id}-h`, 'SubagentHandback', { message: `${word}\nThe second line.` }), h.later(s)), h.at(h.result(0, `${id}-h`, 'Report delivered to your caller.'), h.later(s + 1))];
      const put = (id, step, s, word) => {
        writeFileSync(join(x.subs, `agent-${id}.jsonl`), h.jsonl([sent(`${plan} step ${step}`, s), ...handed(id, s + 100, word)]));
        writeFileSync(join(x.subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step ${step}` }));
      };
      put('df1', 1, -600, 'REFUSED');
      put('df2', 2, -500, 'DONE');
      const rm = () => m.report.restartedPlanMode({ transcript_path: x.main, session_id: x.s }, marker);
      const notes = (t) => writeFileSync(join(x.pad, 'status', 'manager.txt'), t);
      const open = rm();
      notes('Done 2: not the step that ended other than DONE\n');
      const wrongStep = rm();
      notes('Done 1: counted by decision\n');
      const decided = rm();
      // A resend of step 1 is running: the step no longer counts as done by decision, so the restart's plan mode is the plan's again.
      writeFileSync(join(x.subs, 'agent-df1b.jsonl'), h.jsonl([sent(`${plan} step 1`, -50)]));
      writeFileSync(join(x.subs, 'agent-df1b.meta.json'), JSON.stringify({ agentType: 'general-purpose', description: 'Plan step 1' }));
      const runningAgain = rm();
      rmSync(join(x.subs, 'agent-df1b.jsonl'), { force: true });
      notes('Eject: P-12 an-earlier-plan.md a stale line\n');
      const stale = rm();
      notes(`Eject: P-12 ${basename(plan)} the plan went to the program\n`);
      const ejected = rm();
      return h.assertAll([
        ['with a step ended other than DONE and no line the plan mode is the restart\'s', open === plan, open],
        ['a Done line for another step changes nothing', wrongStep === plan, wrongStep],
        ['a Done line for the step that ended other than DONE reads the plan as finished', decided === '', decided],
        ['a step with a resend running is not counted done by decision, so the plan mode is the plan\'s', runningAgain === plan, runningAgain],
        ['an Eject line naming another plan changes nothing', stale === plan, stale],
        ['an Eject line naming this plan\'s file reads it as finished', ejected === '', ejected],
      ]);
    },
  },
  {
    name: 'step 191: where the status prints the plan mode as a restart\'s and the plan stands, the line names the way forward: the next step, the Done line for each step that ended other than DONE, and the Eject line naming the plan\'s file, after which the session\'s own entry call makes the mode its own',
    guards: ['way_forward_line', 'way_forward_steps'],
    run(m, dir, h) {
      const base = h.tmp('sg-way-');
      const plan = join(base, 'way-plan.md');
      const text = '# A way plan\n\n## Steps\n1. **One.** x\n2. **Two.** y\n3. **Three.** z\n\n## Order\nOrder: 1 2 3\n';
      writeFileSync(plan, text);
      const marker = join(base, 'marker.json');
      writeFileSync(marker, JSON.stringify({ plan, hash: h.sha256(text), at: h.ts(-10) }));
      const planTurn = { ...h.turn(-5, 'Go.'), permissionMode: 'plan' };
      const x = session(h, 'wf', [h.turn(-20, 'start'), planTurn, h.boundary(10), h.planOn(11, plan)]);
      const sent = (prompt, s) => h.at({ type: 'user', message: { role: 'user', content: prompt } }, h.later(s));
      const handed = (id, s, word) => [h.at(h.tool(0, `${id}-h`, 'SubagentHandback', { message: `${word}\nThe second line.` }), h.later(s)), h.at(h.result(0, `${id}-h`, 'Report delivered to your caller.'), h.later(s + 1))];
      const put = (id, step, s, word) => {
        writeFileSync(join(x.subs, `agent-${id}.jsonl`), h.jsonl([sent(`${plan} step ${step}`, s), ...handed(id, s + 100, word)]));
        writeFileSync(join(x.subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'general-purpose', description: `Plan step ${step}` }));
      };
      put('wf1', 1, -600, 'DONE');
      put('wf2', 2, -500, 'REFUSED');
      const line = m.report.modeLine(x.s, marker);
      put('wf3', 3, -400, 'FAILED');
      const two = m.report.modeLine(x.s, marker);
      return h.assertAll([
        ['the line still says the mode is a restart\'s', /Plan mode: on, and the gates read it as a restart's/.test(line), line],
        ['it names the next step', /The way forward: step 2 is next;/.test(line), line],
        ['it names the Done line for the one step that ended other than DONE', /a Done line for each of step 2 \(ended other than DONE\)/.test(line), line],
        ['it names the Eject line with the plan\'s file', line.includes('an Eject line naming way-plan.md') && /after which the session's own entry call makes the mode its own\.$/.test(line), line],
        ['two such steps are named together', /a Done line for each of steps 2, 3 \(ended other than DONE\)/.test(two), two],
      ]);
    },
  },
];

export const plants = {
  decided_count: ['    if ((ends ?? []).some((e) => e.step === step)) { done.add(step); decided.add(step); }', '    { done.add(step); decided.add(step); }', 'report.mjs'],
  decided_running: ['if (!o.order.includes(step) || done.has(step) || running?.has?.(step)) continue;', 'if (!o.order.includes(step) || done.has(step)) continue;', 'report.mjs'],
  decided_order: ['if (!o.order.includes(step) || done.has(step) ||', 'if (done.has(step) ||', 'report.mjs'],
  decided_state: ["const state = decided?.has(step) ? 'done by decision'", "const state = false ? 'done by decision'", 'report.mjs'],
  decided_finished: ['managerNotes(scratchpadOf(String(p?.session_id ?? \'\'))), planPath, s.runningSteps) : null;', 'managerNotes(scratchpadOf(String(p?.session_id ?? \'\'))), planPath, null) : null;', 'report.mjs'],
  decided_restart_notes: ["managerNotes(scratchpadOf(String(p?.session_id ?? ''))), planPath, s.runningSteps) : null;", "null, planPath, s.runningSteps) : null;", 'report.mjs'],
  way_forward_line: ["so the plan stands and the mode is not the plan's. ${restartWay(sid, f.main, restart)}`", "so the plan stands and the mode is not the plan's.`", 'report.mjs'],
  way_forward_steps: ["const ended = ptr.order.filter((n) => !ptr.done.has(n) && s.ends.some((e) => e.step === n));", "const ended = [];", 'report.mjs'],
  mode_line_restart: ["  const restart = restartedPlanMode({ transcript_path: f.main, session_id: sid }, marker);\n", "  const restart = '';\n", 'report.mjs'],
  mode_line_off: ["  if (mode !== 'plan') return `Plan mode: off.", "  if (false) return `Plan mode: off.", 'report.mjs'],
  mode_line_unknown: ['  if (!mode) return "Plan mode: unknown', '  if (false) return "Plan mode: unknown', 'report.mjs'],
  mode_line_owner: ['    : "Plan mode: on, and the gates read it as the owner\'s:', '    : "Plan mode: on, and the gates read it as nobody\'s:', 'report.mjs'],
  mode_state_approval: ["else if (n === 'ExitPlanMode') { call = i; kind = 'approval'; }", "else if (n === 'ExitPlanMode') { /* planted */ }", 'report.mjs'],
  mode_state_order: ['if (call > msg) return', 'if (false) return', 'report.mjs'],
  mode_state_enter: ["if (n === 'EnterPlanMode') { call = i; kind = 'enter'; }", "if (n === 'EnterPlanMode') { /* planted */ }", 'report.mjs'],
  mode_line_printed:['  console.log(planMode);\n', '', 'report.mjs'],
  page_folded_version: ['    if (lines.length < 2) return lines.map((v) => li(escapeHtml(v)))', '    if (true) return lines.map((v) => li(escapeHtml(v)))', 'report.mjs'],
  page_folded_open: ["newestAndFolded(m.open, 'Open')", "m.open.map((o) => li(escapeHtml(o))).join(' ')", 'report.mjs'],
  page_folded_count: ['    const older = lines.slice(0, -1);\n', '    const older = lines.slice(1);\n', 'report.mjs'],
  found_sends: ['/^step-(\\d+)(?:-(\\d+))?-report\\.txt$/', '/^step-(\\d+)()-report\\.txt$/', 'report.mjs'],
  found_dedupe: ['        if (seen.has(line)) continue;\n', '', 'report.mjs'],
  found_none: ["if (!/^Found:/.test(t) || NO_FINDING.test(t)) continue;", "if (!/^Found:/.test(t)) continue;", 'report.mjs'],
  found_report_path: ['(sends.at(-1)?.file ??', '(', 'report.mjs'],
  pointer_amended_steps: ['&& !(step !== null && approvedSteps?.has(step))', '', 'report.mjs'],
  pointer_plan_identity: ['    if (end && ours && Number.isFinite(startAt) && startAt < identityFrom) continue;\n', '', 'report.mjs'],
  pointer_identity_missing: ['  const approvedSteps = Number.isFinite(identityFrom) ? approvedStepNumbers() : null;\n', '  const approvedSteps = approvedStepNumbers();\n', 'report.mjs'],
  page_next_refresh: ["  if (shown === escapeHtml(next)) return null;\n", "  if (true) return null;\n", 'report.mjs'],
  page_next_unchanged: ["  if (shown === escapeHtml(next)) return null;\n", "  if (false) return null;\n", 'report.mjs'],
  page_next_cli: ["  if (process.argv[2] === '--page-next') {", "  if (process.argv[2] === '--page-next-off') {", 'report.mjs'],
  wait_flagged_read: ["      if (stale.length) out.push('Running agents whose note is flagged", "      if (false) out.push('Running agents whose note is flagged", 'report.mjs'],
  refusals_compaction: ['Number.isFinite(compacted) ? compacted : 0);', '0);', 'report.mjs'],
  refusals_approval: ['Math.max(Number.isFinite(approvedAt) ? approvedAt : 0, ', 'Math.max(0, ', 'report.mjs'],
  refusals_hook_form: ["a.hookName === 'SessionStart:compact');", 'false);', 'report.mjs'],
  refusals_shared_status: ['  const open = standingRefusals(refusedReads(sid), entries, markerApprovalTime());', '  const open = unreadRefusals(refusedReads(sid), entries);', 'report.mjs'],
  refusals_shared_gate: ["standingRefusals(refused, tailEntries(p.transcript_path ?? '', 16 * 1024 * 1024), plan?.approvedAt)", "unreadRefusals(refused, tailEntries(p.transcript_path ?? '', 16 * 1024 * 1024))", 'hook-dispatch.mjs'],
};
