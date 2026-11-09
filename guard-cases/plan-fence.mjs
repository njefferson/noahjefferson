// The cases and plants of plan-fence.mjs added by step 122 of the plan of 8 November: Q-HUB-284, Q-HUB-311, Q-HUB-318 and the fence's half
// of the sixth finding of the take-up. Shape: guard-cases/shape.mjs.
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdirSync, writeFileSync } from 'node:fs';

const SUITE = 'node /home/user/noahjefferson/session-guards.test.mjs';

export const cases = [
  {
    name: 'Q-HUB-284: the plan fence refuses an agent\'s write of a file outside the scratchpad once its own transcript holds a red run of the suite, whatever the Files list allows, and passes the scratchpad writes, a green run, a run of something else and a send with no run',
    guards: ['fence_red_write', 'fence_red_wired', 'fence_red_result', 'fence_red_notice'],
    run(m, dir, h) {
      const r = h.repo({ 'keep.mjs': 'x\n' });
      const plan = h.fencePlan(basename(r.dir));
      const s = h.sid('red');
      const pad = join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad');
      const call = (tool_name, tool_input, entries) => h.decideFence(m, { session_id: s, agent_id: 'a1', tool_name, tool_input, cwd: r.dir }, { plan, entries });
      const edit = { file_path: join(r.dir, 'keep.mjs'), old_string: 'x', new_string: 'y' };
      const report = { file_path: join(pad, 'progress', 'step-122-report.txt'), content: 'FAILED\n' };
      const redByError = [h.tool(0, 'r1', 'Bash', { command: `${SUITE} --case=Q-HUB-284` }), h.result(0, 'r1', 'case failed: wrong on x', true)];
      const redByExit = [h.tool(0, 'r2', 'Bash', { command: SUITE }), h.result(0, 'r2', 'Exit code 1\n2 cases failed')];
      const redByNotice = [h.tool(0, 'r3', 'Bash', { command: SUITE, run_in_background: true }), h.result(0, 'r3', 'Command running in background'),
        h.turn(5, `<task-notification><status>failed</status><summary>Background command "${SUITE}" failed with exit code 1</summary></task-notification>`)];
      const green = [h.tool(0, 'g1', 'Bash', { command: SUITE }), h.result(0, 'g1', 'all 400 cases passed')];
      const other = [h.tool(0, 'o1', 'Bash', { command: 'git status' }), h.result(0, 'o1', 'Exit code 1\nfatal', true)];
      const said = (x) => typeof x === 'string' && /^PLAN FENCE/.test(x) && x.includes('RED RUN, NOTHING WRITTEN AFTER');
      const got = {
        error: call('Edit', edit, redByError),
        exit: call('Write', { file_path: join(r.dir, 'keep.mjs'), content: 'y\n' }, redByExit),
        notice: call('Edit', edit, redByNotice),
        report: call('Write', report, redByError),
        green: call('Edit', edit, green),
        other: call('Edit', edit, other),
        none: call('Edit', edit, []),
        bash: call('Bash', { command: 'git status' }, redByError),
      };
      return h.assertAll([
        ['a red run by error result refuses the write', said(got.error), got.error],
        ['a red run by exit code refuses the write', said(got.exit), got.exit],
        ['a failed task notice naming the suite refuses the write', said(got.notice), got.notice],
        ['the report in the scratchpad still passes after a red run', got.report === null, got.report],
        ['a green run leaves the write allowed', got.green === null, got.green],
        ['a red run of another command leaves the write allowed', got.other === null, got.other],
        ['a send with no run leaves the write allowed', got.none === null, got.none],
        ['a reader after a red run passes', got.bash === null, got.bash],
      ]);
    },
  },
  {
    name: 'Q-HUB-311: the plan fence refuses an agent\'s git commit after it edited a guard file beside the suite unless a run of the whole suite with no switch, not an error, came after the last edit, and holds no landing step, no case file and no file of a folder without the suite',
    guards: ['fence_suite_commit', 'fence_suite_wired', 'fence_suite_flag', 'fence_suite_after', 'fence_suite_cases', 'fence_suite_dir', 'fence_suite_error'],
    run(m, dir, h) {
      const r = h.repo({ 'session-guards.test.mjs': 'x\n', 'report.mjs': 'x\n', 'keep.mjs': 'x\n' });
      const o = h.repo({ 'report.mjs': 'x\n', 'keep.mjs': 'x\n' });
      // The folder of the case files holds a suite file too, so that only the case-file exclusion keeps an edit there from being held.
      mkdirSync(join(r.dir, 'guard-cases'));
      writeFileSync(join(r.dir, 'guard-cases', 'session-guards.test.mjs'), 'x\n');
      const plan = h.fencePlan(basename(r.dir));
      const plan2 = h.fencePlan(basename(o.dir));
      const s = h.sid('suite');
      const commit = { command: 'git commit -m "put right"' };
      const call = (repoDir, pl, tool_input, entries) => h.decideFence(m, { session_id: s, agent_id: 'a1', tool_name: 'Bash', tool_input, cwd: repoDir }, { plan: pl, entries });
      const edited = (id, file) => h.tool(0, id, 'Edit', { file_path: file, old_string: 'x', new_string: 'y' });
      const ran = (id, command, isError = false) => [h.tool(0, id, 'Bash', { command }), h.result(0, id, isError ? 'Exit code 1' : 'all passed', isError)];
      const said = (x) => typeof x === 'string' && /^PLAN FENCE/.test(x) && x.includes('WHOLE SUITE BEFORE A GUARD COMMIT') && x.includes('report.mjs');
      const guard = join(r.dir, 'report.mjs');
      const got = {
        noRun: call(r.dir, plan, commit, [edited('e1', guard)]),
        byName: call(r.dir, plan, commit, [edited('e2', guard), ...ran('b1', `${SUITE} --case=Q-HUB-311`)]),
        plants: call(r.dir, plan, commit, [edited('e3', guard), ...ran('b2', `${SUITE} --plants --files=report.mjs`)]),
        whole: call(r.dir, plan, commit, [edited('e4', guard), ...ran('b3', SUITE)]),
        before: call(r.dir, plan, commit, [...ran('b4', SUITE), edited('e5', guard)]),
        red: call(r.dir, plan, commit, [edited('e6', guard), ...ran('b5', SUITE, true)]),
        again: call(r.dir, plan, commit, [edited('e7', guard), ...ran('b6', `${SUITE} --case=x`), edited('e8', guard), ...ran('b7', SUITE)]),
        noEdit: call(r.dir, plan, commit, []),
        caseFile: call(r.dir, plan, commit, [edited('e9', join(r.dir, 'guard-cases', 'report.mjs'))]),
        otherFile: call(r.dir, plan, commit, [edited('e10', join(r.dir, 'keep.mjs'))]),
        noSuiteDir: call(o.dir, plan2, commit, [edited('e11', join(o.dir, 'report.mjs'))]),
        notCommit: call(r.dir, plan, { command: 'git status' }, [edited('e12', guard)]),
      };
      return h.assertAll([
        ['a commit after an edit and no run is refused', said(got.noRun), got.noRun],
        ['a run narrowed by a case filter does not count', said(got.byName), got.byName],
        ['a plants run does not count', said(got.plants), got.plants],
        ['a run of the whole suite after the edit passes', got.whole === null, got.whole],
        ['a run before the last edit does not count', said(got.before), got.before],
        ['a run that was an error does not count', said(got.red), got.red],
        ['a whole run after the last of two edits passes', got.again === null, got.again],
        ['a send that edited no guard file is not held', got.noEdit === null, got.noEdit],
        ['an edit of a case file is not an edit of a guard file', got.caseFile === null, got.caseFile],
        ['an edit of a file that is no guard file is not held', got.otherFile === null, got.otherFile],
        ['a guard-named file in a folder with no suite is not held', got.noSuiteDir === null, got.noSuiteDir],
        ['a line that is no commit is not held', got.notCommit === null, got.notCommit],
      ]);
    },
  },
  {
    name: 'Q-HUB-318: the background gate\'s two refusals and the rules-first refusal each say that a call a gate must see goes in a turn of its own, and the background ones that the note, the launch and the note\'s second write each stand alone',
    guards: ['fence_own_turn_second', 'fence_own_turn_announce', 'fence_own_turn_rules'],
    run(m, dir, h) {
      const r = h.repo({ 'keep.mjs': 'x\n' });
      const plan = h.fencePlan(basename(r.dir));
      const s = h.sid('own');
      const pad = join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad');
      const note = join(pad, 'progress', 'step-2.txt');
      const printed = '/tmp/claude-0/tasks/suite-run.output';
      const base = { session_id: s, agent_id: 'a1', cwd: r.dir };
      const announce = h.decideFence(m, { ...base, tool_name: 'Bash', tool_input: { command: 'git status', run_in_background: true } }, { plan, entries: [] });
      const launched = [h.tool(0, 'w7', 'Write', { file_path: note, content: 'label: the suite run' }), h.tool(0, 'L1', 'Bash', { command: 'git status', run_in_background: true }),
        h.result(0, 'L1', `Command running in background. Output is being written to: ${printed}`)];
      const second = h.decideFence(m, { ...base, tool_name: 'Bash', tool_input: { command: 'git status' } }, { plan, entries: launched });
      const rules = m.fence.rulesFirst({ ...base, tool_name: 'Bash', tool_input: { command: 'git status' } }, plan);
      const turn = /goes in a turn of its own/;
      const alone = /note, the launch and the note's second write each stand alone in their turns/;
      return h.assertAll([
        ['the announced-first refusal says a call a gate must see goes in a turn of its own', typeof announce === 'string' && turn.test(announce), announce],
        ['the announced-first refusal says the note, the launch and the second write each stand alone', typeof announce === 'string' && alone.test(announce), announce],
        ['the second-write refusal says a call a gate must see goes in a turn of its own', typeof second === 'string' && turn.test(second), second],
        ['the second-write refusal says the note, the launch and the second write each stand alone', typeof second === 'string' && alone.test(second), second],
        ['the rules-first refusal says a call a gate must see goes in a turn of its own', typeof rules === 'string' && turn.test(rules), rules],
      ]);
    },
  },
];

export const plants = {
  fence_red_write: ['  if (afterRed) return afterRed;', '  if (afterRed) return null;', 'plan-fence.mjs'],
  fence_red_wired: ["  const red = redSuiteRun(callEvents(p, opts));\n  if (!red) return null;", "  const red = null;\n  if (!red) return null;", 'plan-fence.mjs'],
  fence_red_result: ['if (x.result && ran.has(x.result.tool_use_id) && (x.result.is_error === true || ', 'if (x.result && ran.has(x.result.tool_use_id) && (', 'plan-fence.mjs'],
  fence_red_notice: ['if (x.note === true && SUITE_RUN.test(x.text) && ', 'if (false && x.note === true && SUITE_RUN.test(x.text) && ', 'plan-fence.mjs'],
  fence_suite_commit: ['  if (editAt < 0) return null;', '  if (true) return null;', 'plan-fence.mjs'],
  fence_suite_wired: ['  if (suite) return suite;', '  if (suite) return null;', 'plan-fence.mjs'],
  fence_suite_flag: ['/\\s--[A-Za-z]/.test(c.slice(at))', 'false', 'plan-fence.mjs'],
  fence_suite_after: ["if (i <= editAt || x.use?.name !== 'Bash') return false;", "if (x.use?.name !== 'Bash') return false;", 'plan-fence.mjs'],
  fence_suite_cases: [' || /\\/guard-cases\\//.test(abs)', '', 'plan-fence.mjs'],
  fence_suite_dir: [' || !existsSync(join(dirname(abs), SUITE_FILE))', '', 'plan-fence.mjs'],
  fence_suite_error: ['    return !(r && r.result.is_error === true);', '    return true;', 'plan-fence.mjs'],
  fence_own_turn_second: ["The note, the launch and the note's second write each stand alone in their turns, one call in each, and so does any report written after the run ends.", '', 'plan-fence.mjs'],
  fence_own_turn_announce: ["The note, the launch and the note's second write each stand alone in their turns, one call in each, so the note is the one call of this turn and the launch is the one call of the next.", '', 'plan-fence.mjs'],
  fence_own_turn_rules: ['    + ` ${OWN_TURN}`;', '    ;', 'plan-fence.mjs'],
};
