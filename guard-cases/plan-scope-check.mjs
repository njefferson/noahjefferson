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
  {
    name: 'Q-HUB-437: where the work branch differs from the promote branch the diff is counted against the remote\'s work branch, so an unpromoted run already on the remote is not counted; with the same branch for both, or no remote-tracking ref, it is counted against the promote branch as before',
    guards: ['scope_base_remote', 'scope_base_differs', 'scope_base_ref_exists'],
    run(m, dir, h) {
      const home = h.tmp('sg-home-');
      mkdirSync(join(home, '.claude', 'projects', 'p'), { recursive: true });
      writeFileSync(join(home, '.claude', 'projects', 'p', 't.jsonl'), JSON.stringify(h.turn(0, h.OWNER)) + '\n');
      const plan = join(h.tmp('sg-plan-'), 'plan.md');
      writeFileSync(plan, h.PLAN(h.OWN_WORDS));
      const lines = (n) => Array.from({ length: n }, (_, i) => `line ${i}\n`).join('');
      // A repository on main with a branch guard file; the one untracked file of six lines and the pointer of one make seven.
      const make = (guard) => {
        const r = h.repo({ 'a.txt': 'x\n', '.branch-guard': guard });
        r.g('branch', '-M', 'main');
        return r;
      };
      // The pointer is written after the commits so that it stays an untracked line.
      const run = (r) => (mkdirSync(join(r.dir, '.claude'), { recursive: true }), writeFileSync(join(r.dir, '.claude', 'PLAN'), plan + '\n'), spawnSync('node', [join(dir, 'plan-scope-check.mjs'), `--repo=${r.dir}`],
        { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: 't' } }));
      const countOf = (o) => Number(/the diff holds (\d+) lines/.exec(o.stdout)?.[1] ?? -1);
      const said = (o) => `${o.status} ${o.stdout}${o.stderr}`.slice(-600);
      // Work branch staging above main: a run of fifty lines already on the remote, then three lines not yet pushed.
      const staged = (remote) => {
        const r = make('work=staging\npromote=main\n');
        r.g('checkout', '-q', '-b', 'staging');
        r.write('run.txt', lines(50));
        r.g('add', '-A'); r.g('commit', '-q', '-m', 'run');
        if (remote) r.g('update-ref', 'refs/remotes/origin/staging', 'HEAD');
        r.write('tail.txt', lines(3));
        r.g('add', '-A'); r.g('commit', '-q', '-m', 'tail');
        r.write('big.txt', lines(6));
        return r;
      };
      const a = staged(true);
      const withRemote = run(a);
      const b = staged(false);
      const noRemote = run(b);
      // The same branch for both: a remote-tracking ref one commit back must not move the count.
      const c = make('work=main\npromote=main\n');
      c.write('older.txt', lines(10));
      c.g('add', '-A'); c.g('commit', '-q', '-m', 'older');
      c.g('update-ref', 'refs/remotes/origin/main', 'HEAD~1');
      c.write('big.txt', lines(6));
      const same = run(c);
      return h.assertAll([
        ['with the remote\'s work branch present, the fifty-line run on it is not counted: the three unpushed lines, the six untracked and the pointer make ten', countOf(withRemote) === 10, said(withRemote)],
        ['the run says the count is against the remote\'s work branch', /against the remote's "staging"/.test(withRemote.stdout), said(withRemote)],
        ['with no remote-tracking ref the count is against the promote branch as before: fifty-three lines of commits and seven of the tree make sixty', countOf(noRemote) === 60, said(noRemote)],
        ['with one branch for both, a remote-tracking ref behind HEAD does not move the count: the six untracked lines and the pointer make seven', countOf(same) === 7, said(same)],
      ]);
    },
  },
];

export const plants = {
  scope_base_remote: ['const base = remoteBase ? `refs/remotes/origin/${work}` : (promoteFound ? promote : null);', 'const base = promoteFound ? promote : null;', 'plan-scope-check.mjs'],
  scope_base_differs: ['const remoteBase = work && work !== promote && refExists(', 'const remoteBase = work && refExists(', 'plan-scope-check.mjs'],
  scope_base_ref_exists: ['work !== promote && refExists(`refs/remotes/origin/${work}`);', 'work !== promote && true;', 'plan-scope-check.mjs'],
  // Each line is in plan-scope-check.mjs, which the plant takes the line out of.
  scope_lines_required: ['if (!/^\\d+$/.test(readValue)) {', 'if (false) {', 'plan-scope-check.mjs'],
  scope_lines_under: ['if (Number(readValue) < diffLines) {', 'if (false) {', 'plan-scope-check.mjs'],
  scope_lines_untracked: ["lines += text.split('\\n').length - (text.endsWith('\\n') ? 1 : 0);", 'lines += 0;', 'plan-scope-check.mjs'],
  scope_lines_recorded: ['`linesread=${readValue}`,', '`unread=${readValue}`,', 'plan-scope-check.mjs'],
  scope_lines_check_missing: ["if (!/^\\d+$/.test(rec.linesread ?? '')) {", 'if (false) {', 'plan-scope-check.mjs'],
  scope_lines_check_under: ['if (Number(rec.linesread) < diffLines) {', 'if (false) {', 'plan-scope-check.mjs'],
};
