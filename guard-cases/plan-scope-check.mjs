// The cases and plants of plan-scope-check.mjs (Q-HUB-381). The shape is guard-cases/shape.mjs.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

export const cases = [
  {
    name: 'Q-HUB-381: the scope record carries the count of diff lines the judge read: a record with no count, or a count under the diff\'s, is refused and writes nothing, a record of the whole count is written, the check refuses a record whose count is missing or under the diff\'s, and staging does not move the diff\'s count',
    guards: ['scope_lines_required', 'scope_lines_under', 'scope_lines_untracked', 'scope_lines_recorded', 'scope_lines_check_missing', 'scope_lines_check_under'],
    run(m, dir, h) {
      const home = h.tmp('sg-home-');
      mkdirSync(join(home, '.claude', 'projects', 'p'), { recursive: true });
      writeFileSync(join(home, '.claude', 'projects', 'p', 't.jsonl'), JSON.stringify(h.turn(0, h.OWNER)) + '\n');
      const plan = join(h.tmp('sg-plan-'), 'plan.md');
      writeFileSync(plan, h.PLAN(h.OWN_WORDS));
      const r = h.repo({ 'a.txt': 'x\n' });
      mkdirSync(join(r.dir, '.claude'));
      writeFileSync(join(r.dir, '.claude', 'PLAN'), plan + '\n');
      // One untracked file of six lines, and the pointer file of one: the diff holds seven lines.
      r.write('big.txt', 'one\ntwo\nthree\nfour\nfive\nsix\n');
      const run = (...a) => spawnSync('node', [join(dir, 'plan-scope-check.mjs'), `--repo=${r.dir}`, ...a],
        { input: 'The diff adds one new file and nothing else.', encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: 't' } });
      const recordFile = join(r.dir, '.plan-scope');
      const said = (o) => `${o.status} ${o.stdout}${o.stderr}`.slice(-500);
      const countOf = (o) => Number(/the diff holds (\d+) lines/.exec(o.stdout)?.[1] ?? -1);

      const none = run('--record', '--verdict=IN-SCOPE: one new file');
      const wroteNone = existsSync(recordFile);
      const part = run('--record', '--verdict=IN-SCOPE: one new file', '--lines-read=3');
      const wrotePart = existsSync(recordFile);
      const whole = run('--record', '--verdict=IN-SCOPE: one new file', '--lines-read=7');
      const recorded = existsSync(recordFile) ? readFileSync(recordFile, 'utf8') : '';
      const holds = run();
      r.stage();
      const staged = run();
      // A record whose hash still matches but whose count is missing, and one whose count is under the diff's.
      writeFileSync(recordFile, recorded.replace(/^linesread=.*\n/m, ''));
      const noCount = run();
      writeFileSync(recordFile, recorded.replace(/^linesread=.*$/m, 'linesread=3'));
      const underCount = run();
      return h.assertAll([
        ['the run prints the diff\'s line count: the six lines of the new file and the one of the pointer', countOf(holds) === 7, said(holds)],
        ['a record with no count is refused, names the count the diff holds and writes nothing', none.status === 1 && /REFUSED  the record needs --lines-read=<N>.*the diff holds 7\. Nothing was written/.test(none.stderr) && !wroteNone, said(none)],
        ['a record whose count is under the diff\'s is refused, names both counts and writes nothing', part.status === 1 && /REFUSED  the judge read 3 of the diff's 7 lines/.test(part.stderr) && !wrotePart, said(part)],
        ['a record of the whole count is written with both counts in it', whole.status === 0 && /^difflines=7$/m.test(recorded) && /^linesread=7$/m.test(recorded), said(whole) + recorded],
        ['the check holds on a record of the whole count', holds.status === 0, said(holds)],
        ['staging the file does not move the diff\'s count or break the record', countOf(staged) === 7 && staged.status === 0, said(staged)],
        ['the check refuses a record whose hash matches and whose count is missing', noCount.status === 1 && /carries no count of the diff lines the judge read/.test(noCount.stderr), said(noCount)],
        ['the check refuses a record whose count is under the diff\'s', underCount.status === 1 && /the recorded verdict read 3 of the diff's 7 lines/.test(underCount.stderr), said(underCount)],
      ]);
    },
  },
];

export const plants = {
  // Each line is in plan-scope-check.mjs, which the plant takes the line out of.
  scope_lines_required: ['if (!/^\\d+$/.test(readValue)) {', 'if (false) {', 'plan-scope-check.mjs'],
  scope_lines_under: ['if (Number(readValue) < diffLines) {', 'if (false) {', 'plan-scope-check.mjs'],
  scope_lines_untracked: ["lines += text.split('\\n').length - (text.endsWith('\\n') ? 1 : 0);", 'lines += 0;', 'plan-scope-check.mjs'],
  scope_lines_recorded: ['`linesread=${readValue}`,', '`unread=${readValue}`,', 'plan-scope-check.mjs'],
  scope_lines_check_missing: ["if (!/^\\d+$/.test(rec.linesread ?? '')) {", 'if (false) {', 'plan-scope-check.mjs'],
  scope_lines_check_under: ['if (Number(rec.linesread) < diffLines) {', 'if (false) {', 'plan-scope-check.mjs'],
};
