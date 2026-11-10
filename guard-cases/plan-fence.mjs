// The cases and plants of plan-fence.mjs added by step 122 of the plan of 8 November: Q-HUB-284, Q-HUB-311, Q-HUB-318 and the fence's half
// of the sixth finding of the take-up. Shape: guard-cases/shape.mjs.
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdirSync, writeFileSync, mkdtempSync, rmSync, utimesSync } from 'node:fs';
import { createHash } from 'node:crypto';

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
    name: 'Step 189: after the first red run of the suite a write passes where its target is a file the agent itself wrote earlier in the send without a refusal, is refused for any other file, and is refused again after a second red run; with no red run a write passes as before',
    guards: ['fence_red_own', 'fence_red_other', 'fence_red_second', 'fence_own_refused', 'fence_red_wired'],
    run(m, dir, h) {
      const r = h.repo({ 'keep.mjs': 'x\n', 'rw.mjs': 'x\n' });
      const plan = h.fencePlan(basename(r.dir));
      const s = h.sid('redown');
      const call = (tool_name, tool_input, entries) => h.decideFence(m, { session_id: s, agent_id: 'a1', tool_name, tool_input, cwd: r.dir }, { plan, entries });
      const edit = (name) => ({ file_path: join(r.dir, name), old_string: 'x', new_string: 'y' });
      const wrote = (id, name, bad) => [h.tool(0, id, 'Write', { file_path: join(r.dir, name), content: 'x\n' }), h.result(0, id, bad ? 'refused by the fence' : 'File created', bad === true)];
      const red = (id) => [h.tool(0, id, 'Bash', { command: SUITE }), h.result(0, id, 'Exit code 1\n2 cases failed')];
      const said = (x) => typeof x === 'string' && /^PLAN FENCE/.test(x) && x.includes('RED RUN, NOTHING WRITTEN AFTER');
      const got = {
        own: call('Edit', edit('keep.mjs'), [...wrote('w1', 'keep.mjs'), ...red('r1')]),
        ownBefore: call('Edit', edit('keep.mjs'), [...red('r1'), ...wrote('w1', 'keep.mjs')]),
        other: call('Edit', edit('rw.mjs'), [...wrote('w1', 'keep.mjs'), ...red('r1')]),
        twice: call('Edit', edit('keep.mjs'), [...wrote('w1', 'keep.mjs'), ...red('r1'), ...red('r2')]),
        refusedWrite: call('Edit', edit('keep.mjs'), [...wrote('w1', 'keep.mjs', true), ...red('r1')]),
        noRed: call('Edit', edit('keep.mjs'), wrote('w1', 'keep.mjs')),
        noRedNone: call('Edit', edit('keep.mjs'), []),
      };
      return h.assertAll([
        ['a red run and then an edit of a file the agent wrote earlier passes', got.own === null, got.own],
        ['a file written after the red run counts too', got.ownBefore === null, got.ownBefore],
        ['a red run and then an edit of a file the agent did not write is refused', said(got.other), got.other],
        ['two red runs and then an edit of its own file is refused', said(got.twice), got.twice],
        ['an earlier write that was refused does not count as written', said(got.refusedWrite), got.refusedWrite],
        ['with no red run a write passes as before', got.noRed === null && got.noRedNone === null, [got.noRed, got.noRedNone]],
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
  {
    name: 'Q-HUB-352: the plan fence refuses a write between a write of the plan file and its re-recording with words saying the plan file is being re-recorded and the call goes again, and gives the generic refusal when the hash holds or the marker is the newer file, and passes the scratchpad',
    guards: ['fence_rerecord_words', 'fence_rerecord_mtime', 'fence_rerecord_wired'],
    run(m, dir, h) {
      const r = h.repo({ 'keep.mjs': 'x\n' });
      const s = h.sid('rerec');
      const pad = join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad');
      const tmp = mkdtempSync(join(tmpdir(), 'fence-rerec-'));
      try {
        const planFile = join(tmp, 'plan.md');
        const marker = join(tmp, 'marker.json');
        const oldText = 'old plan\n';
        writeFileSync(planFile, oldText);
        writeFileSync(marker, JSON.stringify({ plan: planFile, hash: createHash('sha256').update(oldText).digest('hex') }));
        const call = (file_path) => h.decideFence(m, { session_id: s, agent_id: 'a1', tool_name: 'Write', tool_input: { file_path, content: 'y\n' }, cwd: r.dir }, { plan: null, marker });
        const target = join(r.dir, 'keep.mjs');
        const settled = call(target);
        const mtime = (f, sec) => utimesSync(f, sec, sec);
        // The plan file is written after the marker: its hash is stale by one write.
        writeFileSync(planFile, 'new plan\n');
        mtime(marker, 1000);
        mtime(planFile, 2000);
        const stale = call(target);
        const scratch = call(join(pad, 'progress', 'step-1.txt'));
        // The marker is the newer file: the re-recording happened and the plan was edited since, so the generic refusal stands.
        mtime(marker, 3000);
        const edited = call(target);
        const said = (x) => typeof x === 'string' && /^PLAN FENCE/.test(x) && x.includes('being re-recorded') && x.includes('send the same call again');
        const generic = (x) => typeof x === 'string' && /^PLAN FENCE/.test(x) && !x.includes('being re-recorded') && x.includes('outside the Files list');
        // The hash holds (the plan text is back to the recorded one): no plan is in force for another reason.
        writeFileSync(planFile, oldText);
        mtime(marker, 1000);
        mtime(planFile, 2000);
        const holds = call(target);
        return h.assertAll([
          ['a plan file newer than the marker, with a stale hash, is refused with the re-recording words', said(stale), stale],
          ['the scratchpad write passes while the plan file is being re-recorded', scratch === null, scratch],
          ['a marker newer than the plan file gets the generic refusal', generic(edited), edited],
          ['a hash that holds gets the generic refusal', generic(holds), holds],
          ['a hash that holds before any write gets the generic refusal', generic(settled), settled],
        ]);
      } finally { rmSync(tmp, { recursive: true, force: true }); }
    },
  },
  {
    name: 'Q-HUB-355: the second-write refusal says the second write is the first call after the launch and that the read of the run\'s output comes after it',
    guards: ['fence_second_write_words'],
    run(m, dir, h) {
      const r = h.repo({ 'keep.mjs': 'x\n' });
      const plan = h.fencePlan(basename(r.dir));
      const s = h.sid('second');
      const pad = join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad');
      const note = join(pad, 'progress', 'step-2.txt');
      const printed = '/tmp/claude-0/tasks/suite-run.output';
      const launched = [h.tool(0, 'w9', 'Write', { file_path: note, content: 'label: the suite run' }), h.tool(0, 'L2', 'Bash', { command: 'git status', run_in_background: true }),
        h.result(0, 'L2', `Command running in background. Output is being written to: ${printed}`)];
      const read = h.decideFence(m, { session_id: s, agent_id: 'a1', tool_name: 'Read', tool_input: { file_path: printed }, cwd: r.dir }, { plan, entries: launched });
      return h.assertAll([
        ['the refusal says the second write is the first call after the launch', typeof read === 'string' && /second write is the first call after the launch/.test(read), read],
        ['the refusal says the read of the output comes after the second write', typeof read === 'string' && /read of the run's output comes after it/.test(read), read],
      ]);
    },
  },
  {
    name: 'the background gate\'s two refusals each name the progress note file for the step the agent was sent and say that every send of the step writes that one file, and name a generic step-N file where the step cannot be read',
    guards: ['fence_note_sentence_announce', 'fence_note_sentence_second'],
    run(m, dir, h) {
      const r = h.repo({ 'keep.mjs': 'x\n' });
      const plan = h.fencePlan(basename(r.dir));
      const s = h.sid('notefile');
      const pad = join(tmpdir(), 'claude-0', '-home-user', s, 'scratchpad');
      const printed = '/tmp/claude-0/tasks/suite-run.output';
      const base = { session_id: s, agent_id: 'a1', cwd: r.dir };
      const announce = h.decideFence(m, { ...base, tool_name: 'Bash', tool_input: { command: 'git status', run_in_background: true } }, { plan, entries: [], step: 152 });
      const launched = [h.tool(0, 'n7', 'Write', { file_path: join(pad, 'progress', 'step-152.txt'), content: 'label: the suite run' }), h.tool(0, 'N1', 'Bash', { command: 'git status', run_in_background: true }),
        h.result(0, 'N1', `Command running in background. Output is being written to: ${printed}`)];
      const second = h.decideFence(m, { ...base, tool_name: 'Bash', tool_input: { command: 'git status' } }, { plan, entries: launched, step: 152 });
      const unread = h.decideFence(m, { ...base, tool_name: 'Bash', tool_input: { command: 'git status', run_in_background: true } }, { plan, entries: [], step: null });
      const words = /every send of the step writes that one file/;
      const opens = (x, re) => typeof x === 'string' && /^PLAN FENCE/.test(x) && re.test(x);
      return h.assertAll([
        ['the announced-first refusal keeps its opening words and names the note for the step', opens(announce, /BACKGROUND RUN ANNOUNCED FIRST \(Q-HUB-295\)/) && announce.includes('progress/step-152.txt in the session scratchpad, and every send'), announce],
        ['the announced-first refusal says every send writes that one file', opens(announce, words), announce],
        ['the second-write refusal keeps its opening words and names the note for the step', opens(second, /BACKGROUND RUN, SECOND WRITE \(Q-HUB-295\)/) && second.includes('progress/step-152.txt in the session scratchpad, and every send'), second],
        ['the second-write refusal says every send writes that one file', opens(second, words), second],
        ['a step that cannot be read gets the generic note name', opens(unread, words) && unread.includes('progress/step-N.txt (N is the step number this agent was sent)'), unread],
      ]);
    },
  },
  {
    name: 'Q-HUB-365 and Q-HUB-366: the plan fence does not read the dry listing of stale plants (exit 1 under the dry switch) or the suite\'s usage refusal (exit 2) as a red run, and still reads exit 1 of any other run and a failed notice of exit 1 as red',
    guards: ['fence_dry_exit', 'fence_usage_exit', 'fence_notred_wired', 'fence_notred_notice'],
    run(m, dir, h) {
      const r = h.repo({ 'keep.mjs': 'x\n' });
      const plan = h.fencePlan(basename(r.dir));
      const s = h.sid('notred');
      const edit = { file_path: join(r.dir, 'keep.mjs'), old_string: 'x', new_string: 'y' };
      const call = (entries) => h.decideFence(m, { session_id: s, agent_id: 'a1', tool_name: 'Edit', tool_input: edit, cwd: r.dir }, { plan, entries });
      const ran = (id, command, text) => [h.tool(0, id, 'Bash', { command }), h.result(0, id, text, true)];
      const notice = (command, code) => [h.tool(0, 'n1', 'Bash', { command, run_in_background: true }), h.result(0, 'n1', 'Command running in background'),
        h.turn(5, `<task-notification><status>failed</status><summary>Background command "${command}" failed with exit code ${code}</summary></task-notification>`)];
      const red = (x) => typeof x === 'string' && x.includes('RED RUN, NOTHING WRITTEN AFTER');
      const dry = `${SUITE} --plants --dry`;
      const got = {
        dry: call(ran('d1', dry, 'Exit code 1\nstale plant: x')),
        dryFiles: call(ran('d2', `${SUITE} --plants --dry --files=report.mjs`, 'Exit code 1\nstale plant: x')),
        usage: call(ran('u1', `${SUITE} --case=Q-HUB-1`, 'Exit code 2\nusage: quote the filter')),
        one: call(ran('o1', `${SUITE} --case='Q-HUB-1'`, 'Exit code 1\n2 cases failed')),
        plants: call(ran('p1', `${SUITE} --plants`, 'Exit code 1\nplant missed')),
        dryTwo: call(ran('d3', dry, 'Exit code 3\nbroken')),
        noticeDry: call(notice(dry, 1)),
        noticeUsage: call(notice(`${SUITE} --case=x`, 2)),
        noticeOne: call(notice(SUITE, 1)),
      };
      return h.assertAll([
        ['the dry listing at exit 1 is not a red run', got.dry === null, got.dry],
        ['the dry listing narrowed to a file at exit 1 is not a red run', got.dryFiles === null, got.dryFiles],
        ['the usage refusal at exit 2 is not a red run', got.usage === null, got.usage],
        ['exit 1 of a case run is a red run', red(got.one), got.one],
        ['exit 1 of a plants run without the dry switch is a red run', red(got.plants), got.plants],
        ['another exit of the dry listing is a red run', red(got.dryTwo), got.dryTwo],
        ['a failed notice of the dry listing at exit 1 is not a red run', got.noticeDry === null, got.noticeDry],
        ['a failed notice of exit 2 is not a red run', got.noticeUsage === null, got.noticeUsage],
        ['a failed notice of exit 1 of the suite is a red run', red(got.noticeOne), got.noticeOne],
      ]);
    },
  },
  {
    name: 'Q-HUB-367: the plan fence holds an agent off the files of a Files line worded read only, and leaves the other lines of the same Files section writable',
    guards: ['fence_readonly_words', 'fence_readonly_wired'],
    run(m, dir, h) {
      const r = h.repo({ 'keep.mjs': 'x\n', 'ro.mjs': 'x\n', 'ro2.mjs': 'x\n', 'rw.mjs': 'x\n' });
      const label = basename(r.dir);
      const base = h.fencePlan(label);
      const plan = { ...base, text: `${base.text}- ${label}, read only: \`ro.mjs\`\n- ${label}: \`ro2.mjs\` (Read-Only)\n- ${label}: \`rw.mjs\`\n` };
      const s = h.sid('readonly');
      const w = (name) => h.decideFence(m, { session_id: s, agent_id: 'a1', tool_name: 'Edit', tool_input: { file_path: join(r.dir, name), old_string: 'x', new_string: 'y' }, cwd: r.dir }, { plan });
      const refused = (x) => typeof x === 'string' && x.includes('outside the Files list');
      const got = { ro: w('ro.mjs'), ro2: w('ro2.mjs'), rw: w('rw.mjs'), keep: w('keep.mjs') };
      return h.assertAll([
        ['a file of a line worded read only is refused', refused(got.ro), got.ro],
        ['a file of a line with read-only worded after it is refused', refused(got.ro2), got.ro2],
        ['a file of a plain line of the same section is writable', got.rw === null, got.rw],
        ['a file of the first line of the section is writable', got.keep === null, got.keep],
      ]);
    },
  },
];

export const plants = {
  fence_red_write: ['  if (afterRed) return afterRed;', '  if (afterRed) return null;', 'plan-fence.mjs'],
  fence_red_wired: ["  const red = reds[0];\n  if (!red) return null;", "  const red = null;\n  if (!red) return null;", 'plan-fence.mjs'],
  fence_red_own: ['  if (reds.length < 2 && wroteEarlier(events, abs, p.cwd || process.cwd())) return null;\n', '', 'plan-fence.mjs'],
  fence_red_other: ['reds.length < 2 && wroteEarlier(events, abs, p.cwd || process.cwd())', 'reds.length < 2 && true', 'plan-fence.mjs'],
  fence_red_second: ['reds.length < 2 && wroteEarlier(', 'wroteEarlier(', 'plan-fence.mjs'],
  fence_own_refused: [' || failed.has(x.use.id)', '', 'plan-fence.mjs'],
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
  fence_rerecord_words: ['    if (rerecording) return `', '    if (false) return `', 'plan-fence.mjs'],
  fence_rerecord_mtime: ['return statSync(mk.plan).mtimeMs >= statSync(file).mtimeMs ? String(mk.plan) : null;', 'return String(mk.plan);', 'plan-fence.mjs'],
  fence_rerecord_wired: ["const rerecording = !plan && (!('plan' in opts) || opts.marker) ? rerecordingPlan(opts.marker ? { marker: opts.marker } : {}) : null;", 'const rerecording = null;', 'plan-fence.mjs'],
  fence_second_write_words: ["The second write is the first call after the launch, and the read of the run's output comes after it, never before. ", '', 'plan-fence.mjs'],
  fence_dry_exit: ["return Number(code) === 1 && /\\s--dry(?:\\s|=|$)/.test(String(command ?? ''));", 'return false;', 'plan-fence.mjs'],
  fence_usage_exit: ['  if (Number(code) === 2) return true;', '  if (Number(code) === 2) return false;', 'plan-fence.mjs'],
  fence_notred_wired: [' && !notRedSuiteExit(ran.get(x.result.tool_use_id), x.text)', '', 'plan-fence.mjs'],
  fence_notred_notice: ["\n      && !notRedSuiteExit([...ran.values()].at(-1) ?? '', x.text)) {", ') {', 'plan-fence.mjs'],
  fence_note_sentence_announce: ["so the note is the one call of this turn and the launch is the one call of the next.${NOTE_SENTENCE}`;", "so the note is the one call of this turn and the launch is the one call of the next.`;", 'plan-fence.mjs'],
  fence_note_sentence_second: ["and so does any report written after the run ends.${NOTE_SENTENCE}`;", 'and so does any report written after the run ends.`;', 'plan-fence.mjs'],
  fence_readonly_words: ['    if (/\\bread[- ]only\\b/i.test(line)) continue;\n', '', 'plan-fence.mjs'],
  fence_readonly_wired: ['const files = plan ? writableFiles(plan.text) : [];', 'const files = plan ? planFiles(plan.text) : [];', 'plan-fence.mjs'],
};
