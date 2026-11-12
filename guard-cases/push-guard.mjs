// Cases and plants for the check before a push, that push-guard.mjs always makes (see plans/native-setup.md). Shape: guard-cases/shape.mjs.
// Every repository, folder, transcript and agent is written under a temporary folder from `h`, and the suite removes those folders; nothing
// is written into the checkout. The guard is run as the hook runs it, as a program that reads the payload on its input.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const said = (r) => `exit ${r.status}: ${r.stdout}${r.stderr}`.slice(0, 600);
const refused = (r) => r.status === 2 && /PUSH GATE: PUSH CHECK: /.test(r.stderr);
const env = { ...process.env };

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
const push = (dir, repoDir, command, tr, sessionId = 'pc-session') => spawnSync('node', [join(dir, 'push-guard.mjs')], {
  input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd: repoDir, session_id: sessionId, ...(tr ? { transcript_path: tr } : {}) }),
  encoding: 'utf8', env });

export const cases = [
  {
    name: 'push check: a push of main with no checker having passed it is refused, in one sentence each: the check holds, which commit, that none has passed it, and that a checker which changes nothing must pass that exact commit first',
    guards: ['pc_commit_named'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const noAgents = push(dir, r.dir, 'git push origin main', session(h, []));
      const unrelated = push(dir, r.dir, 'git push origin main', session(h, [{ id: 'w1', first: `DONE the work is written, commit ${r.head}` }]));
      const headForm = push(dir, r.dir, 'git push origin HEAD:main', session(h, []));
      const other = push(dir, r.dir, 'git push origin claude/work', session(h, []));
      const text = noAgents.stderr;
      return h.assertAll([
        ['a session with no agent is refused', refused(noAgents), said(noAgents)],
        ['the refusal says the check before a push holds', /The check before a push holds\./.test(text) && !/stand-down/i.test(text), text],
        ['the refusal names the commit being pushed in full', text.includes(`The push is of commit ${r.head}.`), text],
        ['the refusal says no checker has passed that commit', /No checker has passed that commit\./.test(text), text],
        ['the refusal says a checker which changes nothing must pass that exact commit first', /A checker which changes nothing must pass that exact commit first/.test(text), text],
        ['an agent whose hand-back opens DONE and names the commit is no pass', refused(unrelated), said(unrelated)],
        ['the same push spelled HEAD:main is refused the same way', refused(headForm) && headForm.stderr.includes(r.head), said(headForm)],
        ['a push to another branch is refused by the branch rule and its words', other.status === 2 && /Only staging and main reach a remote/.test(other.stderr) && !/PUSH CHECK/.test(other.stderr), said(other)],
      ]);
    },
  },
  {
    name: 'push check: a push of main passes when an agent that changed nothing handed back CHECK PASS and the full id of the commit being pushed',
    guards: ['pc_pass_read'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const tr = session(h, [{ id: 'c1', first: `CHECK PASS ${r.head}` }]);
      const viaMain = push(dir, r.dir, 'git push origin main', tr);
      const viaHead = push(dir, r.dir, 'git push origin HEAD:main', tr);
      const viaPath = push(dir, '/', `git -C ${r.dir} push origin main`, tr);
      return h.assertAll([
        ['git push origin main passes and prints nothing', viaMain.status === 0 && viaMain.stderr === '', said(viaMain)],
        ['git push origin HEAD:main passes', viaHead.status === 0 && viaHead.stderr === '', said(viaHead)],
        ['git -C <repo> push origin main passes', viaPath.status === 0 && viaPath.stderr === '', said(viaPath)],
      ]);
    },
  },
  {
    name: 'push check: a pass for a different commit, a pass naming a prefix of the id and a first line that only mentions the commit are no pass',
    guards: ['pc_exact_commit', 'pc_pass_read'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const older = push(dir, r.dir, 'git push origin main', session(h, [{ id: 'c1', first: `CHECK PASS ${r.first}` }]));
      const prefix = push(dir, r.dir, 'git push origin main', session(h, [{ id: 'c1', first: `CHECK PASS ${r.head.slice(0, 12)}` }]));
      const mention = push(dir, r.dir, 'git push origin main', session(h, [{ id: 'c1', first: `The check was a pass for ${r.head}` }]));
      const failed = push(dir, r.dir, 'git push origin main', session(h, [{ id: 'c1', first: `CHECK FAIL ${r.head}` }]));
      return h.assertAll([
        ['a pass for the older commit does not let the newer one go', refused(older) && older.stderr.includes(r.head), said(older)],
        ['a pass naming only the first twelve characters is refused', refused(prefix), said(prefix)],
        ['a first line that only mentions the commit is refused', refused(mention), said(mention)],
        ['CHECK FAIL for the commit is refused', refused(failed), said(failed)],
      ]);
    },
  },
  {
    name: 'push check: a "pass" from an agent that made an Edit, Write or NotebookEdit call, or ran git commit, git add or git push, is no pass',
    guards: ['pc_no_edit', 'pc_git_write'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const first = `CHECK PASS ${r.head}`;
      const call = (name, input) => [h.tool(10, `x-${name}`, name, input), h.result(11, `x-${name}`, 'ok')];
      const tried = (extra) => push(dir, r.dir, 'git push origin main', session(h, [{ id: 'c1', first, extra }]));
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
    name: 'push check: a transcript that cannot be read and a commit that cannot be read are refused, and a push to another branch is as it was',
    guards: ['pc_unreadable_commit', 'pc_pass_read'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const noTranscript = push(dir, r.dir, 'git push origin main', undefined, 'pc-no-such-session');
      const noRef = push(dir, r.dir, 'git push origin nosuchbranch:main', session(h, [{ id: 'c1', first: `CHECK PASS ${r.head}` }]));
      const feature = push(dir, r.dir, 'git push origin claude/work', session(h, []));
      const forced = push(dir, r.dir, 'git push --force origin main', session(h, [{ id: 'c1', first: `CHECK PASS ${r.head}` }]));
      return h.assertAll([
        ['a session whose transcript cannot be found is refused and says so', refused(noTranscript) && /could not be found/.test(noTranscript.stderr), said(noTranscript)],
        ['a source that names no commit is refused by the check', refused(noRef), said(noRef)],
        ['a push to another branch is still refused by the old rule', feature.status === 2 && /Only staging and main reach a remote/.test(feature.stderr), said(feature)],
        ['a force-push to main is still refused by the old rule even with a pass', forced.status === 2 && /force-pushes main/.test(forced.stderr), said(forced)],
      ]);
    },
  },
  {
    name: 'push check: a pass an ended agent wrote as its final message counts for the exact commit, and not from an agent that edited, for another commit, as CHECK FAIL, or from an agent whose last entry is a tool call',
    guards: ['pc_final_text', 'pc_exact_commit', 'pc_no_edit'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const read = [h.tool(2, 'e-b', 'Bash', { command: 'git status' }), h.result(3, 'e-b', 'clean')];
      const edit = [h.tool(4, 'e-e', 'Edit', { file_path: join(r.dir, 'a.txt'), old_string: 'two', new_string: 'three' }), h.result(5, 'e-e', 'ok')];
      const go = (calls, final) => push(dir, r.dir, 'git push origin main', endedSession(h, 'e1', calls, final));
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
  {
    name: 'push check: a push of staging with no checker having passed it is refused naming staging, and one with a pass of that exact commit passes',
    guards: ['pc_staging_held'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const none = push(dir, r.dir, 'git push origin HEAD:staging', session(h, []));
      const headForm = push(dir, r.dir, 'git push origin staging', session(h, []));
      const older = push(dir, r.dir, 'git push origin HEAD:staging', session(h, [{ id: 'c1', first: `CHECK PASS ${r.first}` }]));
      const passed = push(dir, r.dir, 'git push origin HEAD:staging', session(h, [{ id: 'c1', first: `CHECK PASS ${r.head}` }]));
      return h.assertAll([
        ['a push of staging with no checker is refused', refused(none), said(none)],
        ['the refusal names the commit and the branch staging', none.stderr.includes(`The push is of commit ${r.head}.`) && /The push lands on staging\./.test(none.stderr), none.stderr],
        ['a push of the name staging, which names no commit here, is refused too', refused(headForm), said(headForm)],
        ['a pass for the older commit does not let staging go', refused(older), said(older)],
        ['a pass of that exact commit lets the push of staging go and prints nothing', passed.status === 0 && passed.stderr === '', said(passed)],
      ]);
    },
  },
  {
    name: 'push check: the connector\'s file writes to staging and main are refused with the reason, and a write to another branch is refused by the branch rule',
    guards: ['pc_connector_held'],
    run(m, dir, h) {
      const write = (tool, branch) => spawnSync('node', [join(dir, 'push-guard.mjs')], {
        input: JSON.stringify({ tool_name: tool, tool_input: { branch, path: 'a.txt' }, cwd: dir, session_id: 'pc-session' }), encoding: 'utf8', env });
      const staging = write('mcp__github__create_or_update_file', 'staging');
      const main = write('mcp__github__push_files', 'main');
      const del = write('mcp__github__delete_file', 'staging');
      const other = write('mcp__github__create_or_update_file', 'claude/x');
      return h.assertAll([
        ['a connector write to staging is refused', refused(staging), said(staging)],
        ['the refusal says the writes carry no commit a checker could have passed', /carry no commit a checker could have passed/.test(staging.stderr) && !/stand-down/i.test(staging.stderr), staging.stderr],
        ['the refusal says work reaches staging and main by a git push after a checker\'s pass', /by a git push after a checker's pass of that exact commit/.test(staging.stderr), staging.stderr],
        ['a connector write to main is refused', refused(main), said(main)],
        ['a connector delete to staging is refused', refused(del), said(del)],
        ['a write to another branch is refused by the branch rule', other.status === 2 && /only staging and main are written/.test(other.stderr), said(other)],
      ]);
    },
  },
];

export const plants = {
  pc_staging_held: ["      if (dst !== 'main' && dst !== 'staging') continue;\n", "      if (dst !== 'main') continue;\n", 'push-guard.mjs'],
  pc_connector_held: ["      return `${CHECK_PREFIX}${tool} writes to ${b},", "      if (!tool) return `${CHECK_PREFIX}${tool} writes to ${b},", 'push-guard.mjs'],
  pc_commit_named: ["The push is of commit ${commit || '(not readable from this repository)'}. `", "The push is of commit (named elsewhere). `", 'push-guard.mjs'],
  pc_pass_read: ["      if (!text) continue;\n", "      if (!text) continue;\n      return { ok: false };\n", 'push-guard.mjs'],
  pc_exact_commit: ["      if (!m || m[1].toLowerCase() !== commit.toLowerCase()) continue;\n", "      if (!m) continue;\n", 'push-guard.mjs'],
  pc_no_edit: ["      if (changedSomething(entries)) continue;\n", '', 'push-guard.mjs'],
  pc_git_write: ["      if (b.name === 'Bash' && runsGitWrite(b.input?.command)) return", "      if (false) return", 'push-guard.mjs'],
  pc_final_text: ["const text = end?.how === 'a report' ? end.last : finalText(entries);", "const text = end?.how === 'a report' ? end.last : '';", 'push-guard.mjs'],
  pc_unreadable_commit: ["    if (!commit) return checkRefusal('', '', branch);\n", "    if (!commit) return null;\n", 'push-guard.mjs'],
};
