// Cases and plants for session-brief.mjs, pending-guard.mjs and plan-scope-check.mjs (step 125 of the plan of 8 November: Q-HUB-307,
// Q-HUB-322 and Q-HUB-342). Shape: guard-cases/shape.mjs. Every repository, transcript and state folder a case needs is written under a
// temporary folder from `h`, never into the working copy.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync, readFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

export const cases = [
  {
    name: 'step 152: the brief\'s catch-up names no command that discards work: a stale working copy that is clean and holds nothing the remote lacks is told a fast-forward pull, one with uncommitted changes or one ahead of the remote is told so with the counts and printed no command, and the hub itself prints the block once',
    guards: ['brief_stale_status', 'brief_stale_ahead', 'brief_stale_ff', 'brief_stale_once'],
    run(m, dir, h) {
      const hub = h.tmp('sg-brief-');
      copyFileSync(join(dir, 'session-brief.mjs'), join(hub, 'session-brief.mjs'));
      const origin = h.repo({ 'a.txt': '1\n' });
      const clone = (name) => {
        const d = join(h.tmp('sg-clone-'), name);
        spawnSync('git', ['clone', '-q', origin.dir, d], { encoding: 'utf8' });
        return d;
      };
      const dirty = clone('dirtyrepo');
      const clean = clone('cleanrepo');
      const ahead = clone('aheadrepo');
      const hubClone = clone('hubrepo');
      // The remote moves on after the clones were made, so each is one commit behind.
      origin.write('b.txt', '2\n');
      origin.g('add', '-A');
      origin.g('commit', '-q', '-m', 'the remote moves on');
      writeFileSync(join(dirty, 'wip.txt'), 'work in progress\n');
      writeFileSync(join(ahead, 'mine.txt'), 'a commit the remote lacks\n');
      spawnSync('git', ['-C', ahead, 'add', 'mine.txt'], { encoding: 'utf8' });
      spawnSync('git', ['-C', ahead, '-c', 'user.name=case', '-c', 'user.email=case@example.invalid', 'commit', '-q', '-m', 'a local commit'], { encoding: 'utf8' });
      copyFileSync(join(dir, 'session-brief.mjs'), join(hubClone, 'session-brief.mjs'));
      const brief = (d, script = join(hub, 'session-brief.mjs')) => spawnSync('node', [script, '--repo', d], { input: '', encoding: 'utf8', timeout: 60000 });
      const a = brief(dirty);
      const b = brief(clean);
      const c = brief(ahead);
      const d = brief(hubClone, join(hubClone, 'session-brief.mjs'));
      const ao = `${a.stdout}${a.stderr}`;
      const bo = `${b.stdout}${b.stderr}`;
      const co = `${c.stdout}${c.stderr}`;
      const dout = `${d.stdout}${d.stderr}`;
      const noCommand = (o, at) => !/reset --hard|git -C \S+ (?:pull|fetch|rebase)/.test(o.slice(o.indexOf(at)).split('\n').slice(0, 12).join('\n'));
      return h.assertAll([
        ['the dirty working copy is called stale', /DIRTYREPO IS STALE — 1 commit/.test(ao), ao],
        ['the dirty working copy is offered no reset and no other command', !/reset --hard/.test(ao) && noCommand(ao, 'DIRTYREPO IS STALE'), ao],
        ['the dirty working copy is told the counts of what the remote lacks', /DIRTYREPO HOLDS WORK THE REMOTE LACKS: 1 uncommitted change\(s\) and 0 commit\(s\)/.test(ao), ao],
        ['the working copy ahead of the remote is called stale and offered no command', /AHEADREPO IS STALE — 1 commit/.test(co) && !/reset --hard/.test(co) && noCommand(co, 'AHEADREPO IS STALE'), co],
        ['the working copy ahead of the remote is told the counts', /AHEADREPO HOLDS WORK THE REMOTE LACKS: 0 uncommitted change\(s\) and 1 commit\(s\)/.test(co), co],
        ['the clean stale working copy is told a fast-forward pull and no reset', bo.includes(`git -C ${clean} pull --ff-only origin `) && !/reset --hard/.test(bo), bo],
        ['the clean stale working copy is not told it holds work', !bo.includes('HOLDS WORK THE REMOTE LACKS'), bo],
        ['the hub itself prints the stale block once', (dout.match(/IS STALE/g) ?? []).length === 1, dout],
      ]);
    },
  },
  {
    name: 'step 125: a message the pending guard printed in a refusal is recorded as printed, so the prompt that later overtakes it does not print it a second time as never given; with no refusal before it, it is still printed',
    guards: ['pending_print_record', 'pending_mark_write'],
    run(m, dir, h) {
      const LOST = 'Why was the third walk skipped? Answer before anything else.';
      const LATER = 'Also give me the count of walks that ran, please, in the next reply.';
      const root = h.tmp('sg-printed-');
      const tr = join(root, 't.jsonl');
      writeFileSync(tr, h.jsonl([h.turn(0, 'start'), h.enq(10, LOST)]));
      const env = (name) => ({ ...process.env, SKIPPED_PRINTED_DIR: join(root, name, 'skipped'), HELD_WORK_DIR: join(root, name, 'held'), PENDING_GUARD_DIR: join(root, name, 'start') });
      const call = (name, args, payload) => spawnSync('node', [join(dir, 'pending-guard.mjs'), ...args], { input: JSON.stringify(payload), encoding: 'utf8', env: env(name) });
      const refusedPayload = { session_id: 'sg-printed', transcript_path: tr, tool_name: 'Bash', tool_input: { command: 'ls' } };
      // The refusal prints the message; the turn ends; the queue loses it while a later message is delivered as a prompt.
      const refused = call('after', [], refusedPayload);
      appendFileSync(tr, h.jsonl([h.enq(20, LATER), h.deq(30), h.turn(30, LATER)]));
      const next = call('after', ['--skipped'], { session_id: 'sg-printed', transcript_path: tr, prompt: LATER });
      // The same transcript with no refusal before it: the message was never printed, so the prompt prints it.
      const control = call('control', ['--skipped'], { session_id: 'sg-printed', transcript_path: tr, prompt: LATER });
      return h.assertAll([
        ['the refusal ran and printed the message', refused.status === 2 && refused.stderr.includes(LOST), `${refused.status} ${refused.stderr}`],
        ['the overtaking prompt does not print it again', !/NEVER GIVEN/.test(next.stdout) && !next.stdout.includes(LOST), next.stdout],
        ['without a refusal before it the overtaking prompt prints it', /NEVER GIVEN/.test(control.stdout) && control.stdout.includes(LOST), control.stdout],
      ]);
    },
  },
  {
    name: 'step 125: the plan-scope hash covers each file under an untracked folder by its content, so a verdict recorded before staging holds after staging and fails when a file in the new folder changes',
    guards: ['scope_untracked_listed'],
    run(m, dir, h) {
      const home = h.tmp('sg-home-');
      mkdirSync(join(home, '.claude', 'projects', 'p'), { recursive: true });
      writeFileSync(join(home, '.claude', 'projects', 'p', 't.jsonl'), JSON.stringify(h.turn(0, h.OWNER)) + '\n');
      const plan = join(h.tmp('sg-plan-'), 'plan.md');
      writeFileSync(plan, h.PLAN(h.OWN_WORDS));
      const r = h.repo({ 'a.txt': 'x\n' });
      mkdirSync(join(r.dir, '.claude'));
      writeFileSync(join(r.dir, '.claude', 'PLAN'), plan + '\n');
      mkdirSync(join(r.dir, 'newdir'));
      r.write('newdir/f.txt', 'one\n');
      const run = (...a) => spawnSync('node', [join(dir, 'plan-scope-check.mjs'), `--repo=${r.dir}`, ...a],
        { input: 'The diff adds one new file in a new folder and nothing else.', encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: 't' } });
      const recorded = run('--record', '--verdict=IN-SCOPE: one new file in a new folder', '--lines-read=2');
      const before = run();
      r.stage();
      const staged = run();
      r.write('newdir/f.txt', 'two\n');
      const changed = run();
      const said = (o) => `${o.status} ${o.stdout}${o.stderr}`.slice(-400);
      return h.assertAll([
        ['the verdict was recorded', recorded.status === 0 && readFileSync(join(r.dir, '.plan-scope'), 'utf8').includes('diffhash='), said(recorded)],
        ['the record holds before staging', before.status === 0, said(before)],
        ['the record holds after staging', staged.status === 0, said(staged)],
        ['a change to a file in the new folder voids the record', changed.status === 1 && /work has changed/.test(changed.stderr), said(changed)],
      ]);
    },
  },
];

export const plants = {
  brief_stale_status: ['    if (dirtyCount > 0 || aheadCount > 0) {\n', '    if (false) {\n', 'session-brief.mjs'],
  brief_stale_ahead: ['    if (dirtyCount > 0 || aheadCount > 0) {\n', '    if (dirtyCount > 0) {\n', 'session-brief.mjs'],
  brief_stale_ff: ['pull --ff-only origin ${br}', 'reset --hard origin/${br}', 'session-brief.mjs'],
  brief_stale_once: ['  if (checked.has(resolve(dir))) continue;\n', '', 'session-brief.mjs'],
  pending_print_record: ["\n    try { markPrinted(p); } catch { /* the refusal stands either way */ }\n", "\n", 'pending-guard.mjs'],
  pending_mark_write: ["\n  writeFileSync(f, JSON.stringify({ keys: [...seen, ...add] }));\n", "\n  void add;\n", 'pending-guard.mjs'],
  scope_untracked_listed: ["run('git status --porcelain=v1 -z --untracked-files=all');", "run('git status --porcelain=v1 -z');", 'plan-scope-check.mjs'],
};
