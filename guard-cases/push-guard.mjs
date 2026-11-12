// Cases and plants for the check before a push of main that push-guard.mjs makes while a stand-down is in force (result 4 of the second act
// of plans/native-setup.md). Shape: guard-cases/shape.mjs. Every repository, folder, transcript and agent is written under a temporary
// folder from `h`, and the suite removes those folders; nothing is written into the checkout.
//
// The suite sets HUB_STAND_DOWN_OFF before its first case, so each call below builds its own environment: `inForce` names a launch folder
// that holds a stand-down file with the suite's off variable taken out, and `notInForce` is the same call with no file under the launch
// folder. The guard is run as the hook runs it, as a program that reads the payload on its input.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DAY = 24 * 60 * 60 * 1000;
const dateIn = (days) => new Date(Date.now() + days * DAY).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
const placeStandDown = (folder) => {
  mkdirSync(join(folder, '.claude'), { recursive: true });
  writeFileSync(join(folder, '.claude', 'STAND-DOWN'), `until: ${dateIn(30)}\ntrial of the harness's own parts, plans/native-setup.md\n`);
  return folder;
};
/** The environment of one call: the suite's off variable and any launch folder taken out, `extra` put in. */
const envFor = (extra = {}) => {
  const e = { ...process.env };
  delete e.HUB_STAND_DOWN_OFF;
  delete e.HUB_LAUNCH_DIR;
  delete e.CLAUDE_PROJECT_DIR;
  for (const [k, v] of Object.entries(extra)) { if (v === undefined) delete e[k]; else e[k] = v; }
  return e;
};
const said = (r) => `exit ${r.status}: ${r.stdout}${r.stderr}`.slice(0, 600);
const refused = (r) => r.status === 2 && /PUSH GATE: PUSH CHECK: /.test(r.stderr);

/** A repository on main with two commits; `first` is the id of the older, `head` of the newer. */
function twoCommits(h) {
  const r = h.repo({ 'a.txt': 'one\n' });
  r.g('checkout', '-q', '-B', 'main');
  const first = r.g('rev-parse', 'HEAD').stdout.trim();
  r.write('a.txt', 'two\n');
  r.g('add', '-A');
  r.g('commit', '-q', '-m', 'second');
  const head = r.g('rev-parse', 'HEAD').stdout.trim();
  return { dir: r.dir, first, head };
}

/**
 * A session transcript with agents beside it, as the harness lays them out: `<session>.jsonl` and `<session>/subagents/agent-<id>.jsonl`.
 * @param {object} h  the suite's helpers.
 * @param {{id: string, first: string, extra?: object[]}[]} agents  each agent's id, the first line of its hand-back, and any calls it made.
 * @returns {string} the session transcript's path.
 */
function session(h, agents) {
  const tr = h.transcript([h.turn(0, 'Please push the finished work.')]);
  const subs = join(tr.slice(0, -'.jsonl'.length), 'subagents');
  mkdirSync(subs, { recursive: true });
  for (const a of agents) {
    const body = [h.turn(1, 'Check the exact commit and change nothing.'),
      h.tool(2, `${a.id}-b`, 'Bash', { command: 'git status' }), h.result(3, `${a.id}-b`, 'clean'),
      ...(a.extra ?? []),
      h.tool(20, `${a.id}-h`, 'SubagentHandback', { message: `${a.first}\nThe second line says what was read.` }),
      h.result(21, `${a.id}-h`, 'Report delivered to your caller.')];
    writeFileSync(join(subs, `agent-${a.id}.jsonl`), body.map((e) => JSON.stringify(e)).join('\n') + '\n');
    writeFileSync(join(subs, `agent-${a.id}.meta.json`), JSON.stringify({ agentType: 'checker', description: 'Check the commit' }));
  }
  return tr;
}

/** An agent that ended by writing its last message as text (no hand-back call): `calls` first, then `final` as its last entry when given. */
function endedSession(h, id, calls, final) {
  const tr = h.transcript([h.turn(0, 'Please push the finished work.')]);
  const subs = join(tr.slice(0, -'.jsonl'.length), 'subagents');
  mkdirSync(subs, { recursive: true });
  const body = [h.turn(1, 'Check the exact commit and change nothing.'), ...calls,
    ...(final === undefined ? [] : [{ type: 'assistant', timestamp: new Date(Date.UTC(2026, 0, 1, 0, 0, 30)).toISOString(), message: { role: 'assistant', content: [{ type: 'text', text: final }] } }])];
  writeFileSync(join(subs, `agent-${id}.jsonl`), body.map((e) => JSON.stringify(e)).join('\n') + '\n');
  writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ agentType: 'checker', description: 'Check the commit' }));
  return tr;
}

/** Run the guard on one Bash line in `repoDir`, as the hook does. */
const push = (dir, repoDir, command, tr, env, sessionId = 'pc-session') => spawnSync('node', [join(dir, 'push-guard.mjs')], {
  input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd: repoDir, session_id: sessionId, ...(tr ? { transcript_path: tr } : {}) }),
  encoding: 'utf8', env });

export const cases = [
  {
    name: 'push check: with no stand-down in force a push of main passes as it did, with or without a checker, and a push to another branch is refused as it was',
    guards: ['pc_standing_asked'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const bare = session(h, []);
      const launchFile = placeStandDown(h.tmp('pc-launch-'));
      const launchNone = h.tmp('pc-none-');
      const noFile = push(dir, r.dir, 'git push origin main', bare, envFor({ CLAUDE_PROJECT_DIR: launchNone }));
      const offVar = push(dir, r.dir, 'git push origin main', bare, envFor({ CLAUDE_PROJECT_DIR: launchFile, HUB_STAND_DOWN_OFF: 'suite' }));
      const noPayloadSession = push(dir, r.dir, 'git push origin HEAD', undefined, envFor({ CLAUDE_PROJECT_DIR: launchNone }));
      const other = push(dir, r.dir, 'git push origin claude/work', bare, envFor({ CLAUDE_PROJECT_DIR: launchNone }));
      return h.assertAll([
        ['with no file the push of main passes and prints nothing', noFile.status === 0 && noFile.stderr === '' && noFile.stdout === '', said(noFile)],
        ['with a file in force but the suite\'s off variable present the push of main passes', offVar.status === 0 && offVar.stderr === '', said(offVar)],
        ['with no file and no transcript at all a push of HEAD on main passes', noPayloadSession.status === 0 && noPayloadSession.stderr === '', said(noPayloadSession)],
        ['a push to another branch is refused by the old rule and its old words', other.status === 2 && /Only staging and main reach a remote/.test(other.stderr) && !/PUSH CHECK/.test(other.stderr), said(other)],
      ]);
    },
  },
  {
    name: 'push check: under a stand-down a push of main with no checker having passed it is refused, in one sentence each: the check holds, which commit, that none has passed it, and that a checker which changes nothing must pass that exact commit first',
    guards: ['pc_standing_asked', 'pc_commit_named'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const launch = placeStandDown(h.tmp('pc-launch-'));
      const env = envFor({ CLAUDE_PROJECT_DIR: launch });
      const noAgents = push(dir, r.dir, 'git push origin main', session(h, []), env);
      const unrelated = push(dir, r.dir, 'git push origin main', session(h, [{ id: 'w1', first: `DONE the work is written, commit ${r.head}` }]), env);
      const headForm = push(dir, r.dir, 'git push origin HEAD:main', session(h, []), env);
      const text = noAgents.stderr;
      return h.assertAll([
        ['a session with no agent is refused', refused(noAgents), said(noAgents)],
        ['the refusal says the stand-down\'s check before a push holds', /The stand-down's check before a push holds\./.test(text), text],
        ['the refusal names the commit being pushed in full', text.includes(`The push is of commit ${r.head}.`), text],
        ['the refusal says no checker has passed that commit', /No checker has passed that commit\./.test(text), text],
        ['the refusal says a checker which changes nothing must pass that exact commit first', /A checker which changes nothing must pass that exact commit first/.test(text), text],
        ['an agent whose hand-back opens DONE and names the commit is no pass', refused(unrelated), said(unrelated)],
        ['the same push spelled HEAD:main is refused the same way', refused(headForm) && headForm.stderr.includes(r.head), said(headForm)],
      ]);
    },
  },
  {
    name: 'push check: under a stand-down a push of main passes when an agent that changed nothing handed back CHECK PASS and the full id of the commit being pushed',
    guards: ['pc_standing_asked', 'pc_pass_read'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const launch = placeStandDown(h.tmp('pc-launch-'));
      const env = envFor({ CLAUDE_PROJECT_DIR: launch });
      const tr = session(h, [{ id: 'c1', first: `CHECK PASS ${r.head}` }]);
      const viaMain = push(dir, r.dir, 'git push origin main', tr, env);
      const viaHead = push(dir, r.dir, 'git push origin HEAD:main', tr, env);
      const viaPath = push(dir, '/', `git -C ${r.dir} push origin main`, tr, env);
      return h.assertAll([
        ['git push origin main passes and prints nothing', viaMain.status === 0 && viaMain.stderr === '', said(viaMain)],
        ['git push origin HEAD:main passes', viaHead.status === 0 && viaHead.stderr === '', said(viaHead)],
        ['git -C <repo> push origin main passes', viaPath.status === 0 && viaPath.stderr === '', said(viaPath)],
      ]);
    },
  },
  {
    name: 'push check: under a stand-down a pass for a different commit, a pass naming a prefix of the id and a first line that only mentions the commit are no pass',
    guards: ['pc_exact_commit', 'pc_pass_read'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const launch = placeStandDown(h.tmp('pc-launch-'));
      const env = envFor({ CLAUDE_PROJECT_DIR: launch });
      const older = push(dir, r.dir, 'git push origin main', session(h, [{ id: 'c1', first: `CHECK PASS ${r.first}` }]), env);
      const prefix = push(dir, r.dir, 'git push origin main', session(h, [{ id: 'c1', first: `CHECK PASS ${r.head.slice(0, 12)}` }]), env);
      const mention = push(dir, r.dir, 'git push origin main', session(h, [{ id: 'c1', first: `The check was a pass for ${r.head}` }]), env);
      const failed = push(dir, r.dir, 'git push origin main', session(h, [{ id: 'c1', first: `CHECK FAIL ${r.head}` }]), env);
      return h.assertAll([
        ['a pass for the older commit does not let the newer one go', refused(older) && older.stderr.includes(r.head), said(older)],
        ['a pass naming only the first twelve characters is refused', refused(prefix), said(prefix)],
        ['a first line that only mentions the commit is refused', refused(mention), said(mention)],
        ['CHECK FAIL for the commit is refused', refused(failed), said(failed)],
      ]);
    },
  },
  {
    name: 'push check: under a stand-down a "pass" from an agent that made an Edit, Write or NotebookEdit call, or ran git commit, git add or git push, is no pass',
    guards: ['pc_no_edit', 'pc_git_write'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const launch = placeStandDown(h.tmp('pc-launch-'));
      const env = envFor({ CLAUDE_PROJECT_DIR: launch });
      const first = `CHECK PASS ${r.head}`;
      const call = (name, input) => [h.tool(10, `x-${name}`, name, input), h.result(11, `x-${name}`, 'ok')];
      const tried = (extra) => push(dir, r.dir, 'git push origin main', session(h, [{ id: 'c1', first, extra }]), env);
      const control = tried([]);
      const edit = tried(call('Edit', { file_path: join(r.dir, 'a.txt'), old_string: 'two', new_string: 'three' }));
      const write = tried(call('Write', { file_path: join(r.dir, 'b.txt'), content: 'x' }));
      const notebook = tried(call('NotebookEdit', { notebook_path: join(r.dir, 'n.ipynb'), new_source: 'x' }));
      const commit = tried(call('Bash', { command: 'git commit -a -m "tidy"' }));
      const add = tried(call('Bash', { command: `git -C ${r.dir} add -A` }));
      const pushed = tried(call('Bash', { command: 'git status && git push origin staging' }));
      const nested = tried(call('Bash', { command: 'sh -c "git commit --allow-empty -m x"' }));
      return h.assertAll([
        ['control: the same hand-back from an agent that only read passes', control.status === 0, said(control)],
        ['an Edit call makes the pass no pass', refused(edit), said(edit)],
        ['a Write call makes the pass no pass', refused(write), said(write)],
        ['a NotebookEdit call makes the pass no pass', refused(notebook), said(notebook)],
        ['a Bash call running git commit makes the pass no pass', refused(commit), said(commit)],
        ['a Bash call running git add through -C makes the pass no pass', refused(add), said(add)],
        ['a Bash call running git push makes the pass no pass', refused(pushed), said(pushed)],
        ['a git commit inside sh -c makes the pass no pass', refused(nested), said(nested)],
      ]);
    },
  },
  {
    name: 'push check: under a stand-down a transcript that cannot be read and a commit that cannot be read are refused, and a push of staging and a push to another branch are as they were',
    guards: ['pc_unreadable_commit', 'pc_pass_read'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const launch = placeStandDown(h.tmp('pc-launch-'));
      const env = envFor({ CLAUDE_PROJECT_DIR: launch });
      const noTranscript = push(dir, r.dir, 'git push origin main', undefined, env, 'pc-no-such-session');
      const noRef = push(dir, r.dir, 'git push origin nosuchbranch:main', session(h, [{ id: 'c1', first: `CHECK PASS ${r.head}` }]), env);
      const staging = push(dir, r.dir, 'git push origin staging', session(h, []), env);
      const feature = push(dir, r.dir, 'git push origin claude/work', session(h, []), env);
      const forced = push(dir, r.dir, 'git push --force origin main', session(h, [{ id: 'c1', first: `CHECK PASS ${r.head}` }]), env);
      return h.assertAll([
        ['a session whose transcript cannot be found is refused and says so', refused(noTranscript) && /could not be found/.test(noTranscript.stderr), said(noTranscript)],
        ['a source that names no commit is refused by the check', refused(noRef), said(noRef)],
        ['a push of staging passes with no checker', staging.status === 0 && staging.stderr === '', said(staging)],
        ['a push to another branch is still refused by the old rule', feature.status === 2 && /Only staging and main reach a remote/.test(feature.stderr), said(feature)],
        ['a force-push to main is still refused by the old rule even with a pass', forced.status === 2 && /force-pushes main/.test(forced.stderr), said(forced)],
      ]);
    },
  },
  {
    name: 'push check: under a stand-down a pass an ended agent wrote as its final message counts for the exact commit, and not from an agent that edited, for another commit, as CHECK FAIL, or from an agent whose last entry is a tool call',
    guards: ['pc_final_text', 'pc_exact_commit', 'pc_no_edit'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const launch = placeStandDown(h.tmp('pc-launch-'));
      const env = envFor({ CLAUDE_PROJECT_DIR: launch });
      const read = [h.tool(2, 'e-b', 'Bash', { command: 'git status' }), h.result(3, 'e-b', 'clean')];
      const edit = [h.tool(4, 'e-e', 'Edit', { file_path: join(r.dir, 'a.txt'), old_string: 'two', new_string: 'three' }), h.result(5, 'e-e', 'ok')];
      const go = (calls, final) => push(dir, r.dir, 'git push origin main', endedSession(h, 'e1', calls, final), env);
      const text = `CHECK PASS ${r.head}\nThe second line says what was read.`;
      const passed = go(read, text);
      const blankFirst = go(read, `\n  \nCHECK PASS ${r.head}`);
      const edited = go([...read, ...edit], text);
      const other = go(read, `CHECK PASS ${r.first}\nThe second line.`);
      const failed = go(read, `CHECK FAIL ${r.head}\nThe second line.`);
      const running = go([...read, h.tool(6, 'e-r', 'Bash', { command: 'git log' })], undefined);
      const resultLast = go(read, undefined);
      return h.assertAll([
        ['a pass in an ended agent\'s final text for this exact commit passes and prints nothing', passed.status === 0 && passed.stderr === '', said(passed)],
        ['blank lines before the pass line do not matter', blankFirst.status === 0, said(blankFirst)],
        ['the same text from an agent that made an Edit call is refused', refused(edited), said(edited)],
        ['the same text for a different commit is refused', refused(other), said(other)],
        ['final text opening CHECK FAIL is refused', refused(failed), said(failed)],
        ['an agent whose last entry is a tool call is refused', refused(running), said(running)],
        ['an agent whose last entry is a tool result is refused', refused(resultLast), said(resultLast)],
      ]);
    },
  },
];

export const plants = {
  pc_standing_asked: ["  if (onMain) {\n    for (const spec of specs) {", "  if (false) {\n    for (const spec of specs) {", 'push-guard.mjs'],
  pc_commit_named: ["The push is of commit ${commit || '(not readable from this repository)'}. `", "The push is of commit (named elsewhere). `", 'push-guard.mjs'],
  pc_pass_read: ["      if (!text) continue;\n", "      if (!text) continue;\n      return { ok: false };\n", 'push-guard.mjs'],
  pc_exact_commit: ["      if (!m || m[1].toLowerCase() !== commit.toLowerCase()) continue;\n", "      if (!m) continue;\n", 'push-guard.mjs'],
  pc_no_edit: ["      if (changedSomething(entries)) continue;\n", '', 'push-guard.mjs'],
  pc_git_write: ["      if (b.name === 'Bash' && runsGitWrite(b.input?.command)) return", "      if (false) return", 'push-guard.mjs'],
  pc_final_text: ["const text = end?.how === 'a report' ? end.last : finalText(entries);", "const text = end?.how === 'a report' ? end.last : '';", 'push-guard.mjs'],
  pc_unreadable_commit: ["      if (!commit) return checkRefusal('');\n", "      if (!commit) return null;\n", 'push-guard.mjs'],
};
