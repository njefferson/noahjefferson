// Cases and plants of the small dispatcher (hook-dispatch.mjs) and of the four shells other repositories call by their paths: plan-guard.mjs,
// stop-guard.mjs, session-brief.mjs and plan-scope-check.mjs. The shape is shape.mjs. Every case runs the real files from `dir`; every
// repository, home, launch folder and transcript is written under a temporary folder from `h`, and nothing is written into the checkout.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const pageLine = (hub) => `HOW WORK GOES HERE: the short page, ${hub}/plans/native/page.md. The procedures and the roles are files under ${hub}/plans/native/skills and ${hub}/plans/native/roles. The push guard and the check before a push hold every push of staging and main, and the choice popup is refused.`;
const said = (r) => `exit ${r.status}: ${r.stdout}${r.stderr}`.slice(0, 600);

/** Run `node <hub>/hook-dispatch.mjs <event>` with a payload on its input, in a launch folder, under a home of its own. */
function disp(h, hub, event, payload = {}, o = {}) {
  const launch = o.launch ?? h.tmp('dp-launch-');
  const env = { ...process.env, HOME: h.tmp('dp-home-'), CLAUDE_PROJECT_DIR: launch, ...(o.env ?? {}) };
  delete env.HUB_LAUNCH_DIR;
  return spawnSync('node', [join(hub, 'hook-dispatch.mjs'), ...(Array.isArray(event) ? event : [event])], {
    input: o.raw ?? JSON.stringify({ hook_event_name: event, cwd: launch, session_id: 'dp-session', ...payload }), encoding: 'utf8', timeout: 60000, env });
}

/** A launch folder holding one repository whose settings name the hooks given (by event). */
function planted(h, hooks, name = 'repo', launch = h.tmp('dp-launch-')) {
  const repo = join(launch, name);
  mkdirSync(join(repo, '.claude', 'hooks'), { recursive: true });
  spawnSync('git', ['init', '-q', repo], { timeout: 60000 });
  writeFileSync(join(repo, '.claude', 'settings.json'), JSON.stringify({ hooks }));
  return { launch, repo };
}
const script = (repo, file, body) => writeFileSync(join(repo, '.claude', 'hooks', file), `#!/bin/sh\n${body}\n`, { mode: 0o755 });
const shim = (file) => ({ type: 'command', command: `$CLAUDE_PROJECT_DIR/.claude/hooks/${file}` });

/** A folder holding the dispatcher and the push guard's files from `dir`, less the files named in `without`, and `extra` written beside them. */
function hubCopy(h, dir, without = [], extra = {}) {
  const out = h.tmp('dp-hub-');
  for (const f of ['hook-dispatch.mjs', 'push-guard.mjs', 'shell-words.mjs', 'agent-read.mjs', 'transcript-tail.mjs']) {
    if (!without.includes(f)) copyFileSync(join(dir, f), join(out, f));
  }
  for (const [f, text] of Object.entries(extra)) writeFileSync(join(out, f), text);
  return out;
}

/** A repository on main with two commits; `first` is the id of the older, `head` of the newer. */
function twoCommits(h) {
  const r = h.repo({ 'a.txt': 'one\n' });
  r.g('checkout', '-q', '-B', 'main');
  const first = r.g('rev-parse', 'HEAD').stdout.trim();
  r.write('a.txt', 'two\n');
  r.g('add', '-A');
  r.g('commit', '-q', '-m', 'second');
  return { dir: r.dir, first, head: r.g('rev-parse', 'HEAD').stdout.trim() };
}

/** A session transcript with one checker beside it whose hand-back opens with `first`. */
function sessionWith(h, first) {
  const tr = h.transcript([h.turn(0, 'Please push the finished work.')]);
  if (first === undefined) return tr;
  const subs = join(tr.slice(0, -'.jsonl'.length), 'subagents');
  mkdirSync(subs, { recursive: true });
  const body = [h.turn(1, 'Check the exact commit and change nothing.'), h.tool(2, 'c-b', 'Bash', { command: 'git status' }), h.result(3, 'c-b', 'clean'),
    h.tool(20, 'c-h', 'SubagentHandback', { message: `${first}\nThe second line says what was read.` }), h.result(21, 'c-h', 'Report delivered to your caller.')];
  writeFileSync(join(subs, 'agent-c1.jsonl'), body.map((e) => JSON.stringify(e)).join('\n') + '\n');
  writeFileSync(join(subs, 'agent-c1.meta.json'), JSON.stringify({ agentType: 'checker', description: 'Check the commit' }));
  return tr;
}

const bash = (command, cwd, tr) => ({ tool_name: 'Bash', tool_input: { command }, cwd, ...(tr ? { transcript_path: tr } : {}) });

export const cases = [
  {
    name: 'dispatch: a main-thread Bash read passes with nothing printed, and the choice popup is refused',
    guards: ['dp_pass_through', 'dp_popup'],
    run(m, dir, h) {
      const read = disp(h, dir, 'PreToolUse', bash('git status', dir));
      const popup = disp(h, dir, 'PreToolUse', { tool_name: 'AskUserQuestion', tool_input: { questions: [] } });
      return h.assertAll([
        ['a read exits 0 and prints nothing', read.status === 0 && read.stdout === '' && read.stderr === '', said(read)],
        ['the choice popup is refused with exit 2 and the words', popup.status === 2 && /CHOICE POPUP REFUSED/.test(popup.stderr), said(popup)],
      ]);
    },
  },
  {
    name: 'dispatch: it returns the push guard\'s refusal of a push to another branch and of a push of staging with no checker\'s pass, and lets a push of main through when an agent\'s transcript holds the pass of that exact commit',
    guards: ['dp_push_refusal'],
    run(m, dir, h) {
      const r = twoCommits(h);
      const other = disp(h, dir, 'PreToolUse', bash('git push origin claude/work', r.dir, sessionWith(h)));
      const staging = disp(h, dir, 'PreToolUse', bash('git push origin HEAD:staging', r.dir, sessionWith(h)));
      const older = disp(h, dir, 'PreToolUse', bash('git push origin main', r.dir, sessionWith(h, `CHECK PASS ${r.first}`)));
      const passed = disp(h, dir, 'PreToolUse', bash('git push origin main', r.dir, sessionWith(h, `CHECK PASS ${r.head}`)));
      return h.assertAll([
        ['a push to another branch is refused with the branch rule', other.status === 2 && /PUSH GATE: .*Only staging and main reach a remote/.test(other.stderr), said(other)],
        ['a push of staging with no pass is refused by the check', staging.status === 2 && /PUSH GATE: PUSH CHECK: /.test(staging.stderr), said(staging)],
        ['a pass for the older commit is no pass', older.status === 2 && /PUSH CHECK/.test(older.stderr), said(older)],
        ['a push of main with the pass of that exact commit goes through and prints nothing', passed.status === 0 && passed.stdout === '' && passed.stderr === '', said(passed)],
      ]);
    },
  },
  {
    name: 'dispatch: when the push guard cannot be loaded a tool that is not a read is refused with the words, and a read still passes',
    guards: ['dp_unclean'],
    run(m, dir, h) {
      const hub = hubCopy(h, dir, ['shell-words.mjs']);
      const bashCall = disp(h, hub, 'PreToolUse', bash('git status', dir));
      const edit = disp(h, hub, 'PreToolUse', { tool_name: 'Write', tool_input: { file_path: '/x', content: 'y' } });
      const read = disp(h, hub, 'PreToolUse', { tool_name: 'Read', tool_input: { file_path: '/x' } });
      return h.assertAll([
        ['a Bash call is refused and the words say push-guard.mjs did not run cleanly', bashCall.status === 2 && /push-guard\.mjs did not run cleanly .*only reads run until it is fixed/.test(bashCall.stderr), said(bashCall)],
        ['a Write is refused', edit.status === 2, said(edit)],
        ['a Read passes', read.status === 0 && read.stdout === '', said(read)],
      ]);
    },
  },
  {
    name: 'dispatch: it prints the one line at a prompt and at a main-thread start, and prints nothing at an agent\'s start',
    guards: ['dp_page_prompt', 'dp_page_start', 'dp_start_main_only'],
    run(m, dir, h) {
      const prompt = disp(h, dir, 'UserPromptSubmit', { prompt: 'Hello' });
      const start = disp(h, dir, 'SessionStart', { source: 'startup' });
      const compact = disp(h, dir, 'SessionStart', { source: 'compact' });
      const agent = disp(h, dir, 'SessionStart', { source: 'startup', agent_id: 'a1' });
      const line = `${pageLine(dir)}\n`;
      return h.assertAll([
        ['a prompt prints the one line and nothing else', prompt.status === 0 && prompt.stdout === line, said(prompt)],
        ['a start prints the one line and nothing else when no hub copy stands by', start.status === 0 && start.stdout === line, said(start)],
        ['a compaction start prints the one line', compact.status === 0 && compact.stdout === line, said(compact)],
        ['an agent\'s start prints nothing', agent.status === 0 && agent.stdout === '', said(agent)],
      ]);
    },
  },
  {
    name: 'dispatch: at a start it brings a planted hub checkout beneath the launch folder forward and prints its line before the one line, and at a compaction it leaves it',
    guards: ['dp_bring_merge', 'dp_bring_source'],
    run(m, dir, h) {
      const work = h.repo({ 'DOCTRINE.md': 'planted\n', 'hook-dispatch.mjs': 'planted\n' }, 'origin-hub');
      work.g('checkout', '-q', '-B', 'main');
      const launch = h.tmp('dp-launch-');
      const clone = join(launch, 'hubcopy');
      spawnSync('git', ['clone', '-q', work.dir, clone], { timeout: 60000 });
      work.write('a.txt', 'a later commit\n');
      work.stage();
      work.g('commit', '-q', '-m', 'a later commit on main');
      const head = work.g('rev-parse', 'HEAD').stdout.trim();
      const cloneHead = () => spawnSync('git', ['-C', clone, 'rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 60000 }).stdout.trim();
      const before = cloneHead();
      const compact = disp(h, dir, 'SessionStart', { source: 'compact' }, { launch });
      const afterCompact = cloneHead();
      const start = disp(h, dir, 'SessionStart', { source: 'startup' }, { launch });
      const lines = start.stdout.split('\n');
      return h.assertAll([
        ['the clone was behind', before !== head, before],
        ['a compaction start brings nothing forward', afterCompact === before && !/HUB COPY/.test(compact.stdout), said(compact)],
        ['a startup brings the clone forward to the remote\'s main', cloneHead() === head, said(start)],
        ['its line says so, by one commit with its subject', /^HUB COPY \(the hub checkout .*hubcopy\): brought forward by 1 commit: a later commit on main\.$/.test(lines[0]), start.stdout],
        ['the one line follows it', lines[1] === pageLine(dir), start.stdout],
      ]);
    },
  },
  {
    name: 'dispatch: it runs a planted repository\'s own start and prompt hooks and prints what they print, in a start after the one line',
    guards: ['dp_repo_print'],
    run(m, dir, h) {
      const { launch, repo } = planted(h, {
        SessionStart: [{ matcher: '', hooks: [shim('start.sh')] }],
        UserPromptSubmit: [{ matcher: '', hooks: [shim('prompt.sh')] }],
        PostToolUse: [{ matcher: '', hooks: [shim('post.sh')] }],
      });
      script(repo, 'start.sh', 'echo "the repository start line"');
      script(repo, 'prompt.sh', 'echo "the repository prompt line"');
      script(repo, 'post.sh', 'echo "printed after a tool"');
      const start = disp(h, dir, 'SessionStart', { source: 'startup' }, { launch });
      const prompt = disp(h, dir, 'UserPromptSubmit', { prompt: 'Hello' }, { launch });
      const post = disp(h, dir, 'PostToolUse', { tool_name: 'Bash', tool_input: { command: 'ls' } }, { launch });
      return h.assertAll([
        ['a start prints the one line, then the repository\'s line', start.stdout === `${pageLine(dir)}\nthe repository start line\n`, said(start)],
        ['a prompt prints the one line, then the repository\'s line', prompt.stdout === `${pageLine(dir)}\nthe repository prompt line\n`, said(prompt)],
        ['what a hook prints at another event is not printed', post.status === 0 && post.stdout === '', said(post)],
      ]);
    },
  },
  {
    name: 'dispatch: it returns a repository\'s own refusal, both when its hook exits 2 and when it prints a written deny',
    guards: ['dp_repo_refuse', 'dp_exit2', 'dp_json_deny'],
    run(m, dir, h) {
      const a = planted(h, { PreToolUse: [{ matcher: '.*', hooks: [shim('exit2.sh')] }] });
      script(a.repo, 'exit2.sh', 'echo "planted refusal by exit code" >&2\nexit 2');
      const b = planted(h, { PreToolUse: [{ matcher: '.*', hooks: [shim('deny.sh')] }] });
      script(b.repo, 'deny.sh', `echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"planted written deny"}}'`);
      const c = planted(h, { PreToolUse: [{ matcher: '.*', hooks: [shim('quiet.sh')] }] });
      script(c.repo, 'quiet.sh', 'exit 0');
      const call = bash('git status', dir);
      const byCode = disp(h, dir, 'PreToolUse', call, { launch: a.launch });
      const byJson = disp(h, dir, 'PreToolUse', call, { launch: b.launch });
      const quiet = disp(h, dir, 'PreToolUse', call, { launch: c.launch });
      return h.assertAll([
        ['an exit 2 is returned as exit 2 with the hook\'s words', byCode.status === 2 && /planted refusal by exit code/.test(byCode.stderr), said(byCode)],
        ['a written deny is returned as exit 2 with its reason', byJson.status === 2 && /planted written deny/.test(byJson.stderr), said(byJson)],
        ['a hook that passes leaves the call through', quiet.status === 0 && quiet.stderr === '', said(quiet)],
      ]);
    },
  },
  {
    name: 'dispatch: where a repository\'s settings name the plan-guard.sh shim it runs this folder\'s plan-guard.mjs, once, however many times the settings name it',
    guards: ['dp_shim_swap', 'dp_shim_once'],
    run(m, dir, h) {
      const log = join(h.tmp('dp-log-'), 'runs.txt');
      const hub = hubCopy(h, dir, [], { 'plan-guard.mjs': `import { appendFileSync, readFileSync } from 'node:fs';\nreadFileSync(0);\nappendFileSync(${JSON.stringify(log)}, 'run\\n');\n` });
      const launch = h.tmp('dp-launch-');
      const hooks = { PreToolUse: [{ matcher: '.*', hooks: [shim('plan-guard.sh'), shim('plan-guard.sh')] }] };
      planted(h, hooks, 'one', launch);
      planted(h, hooks, 'two', launch);
      const r = disp(h, hub, 'PreToolUse', bash('git status', dir), { launch });
      const runs = existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter(Boolean).length : 0;
      return h.assertAll([
        ['the call passes', r.status === 0, said(r)],
        ['this folder\'s plan-guard.mjs ran exactly once for four mentions of the shim', runs === 1, String(runs)],
      ]);
    },
  },
  {
    name: 'Q-HUB-349: the dispatcher hook loop skips the identifier shim of an app for the main thread TaskStop of an id a launch result printed and runs it for an id no result printed',
    guards: ['ident_skip_loop'],
    run(m, dir, h) {
      const launchResult = [h.tool(0, 'l1', 'Bash', { command: 'node long.mjs' }), h.result(1, 'l1', 'Command running in background with ID: bk7x3q9zd. Output is being written to a file.')];
      const stop = (id) => {
        const p = planted(h, { PreToolUse: [{ matcher: '.*', hooks: [shim('ident-guard.sh')] }] });
        script(p.repo, 'ident-guard.sh', 'echo "planted refusal from ident-guard.sh" >&2\nexit 2');
        return disp(h, dir, 'PreToolUse', { tool_name: 'TaskStop', tool_input: { task_id: id }, transcript_path: h.transcript([h.turn(0, 'Go.'), ...launchResult]) }, { launch: p.launch });
      };
      const printed = stop('bk7x3q9zd');
      const unprinted = stop('zz9zz9zz9');
      return h.assertAll([
        ['the shim is not run for an id the launch result printed', !/planted refusal from ident-guard\.sh/.test(printed.stderr) && printed.status === 0, said(printed)],
        ['the shim is run for an id no result printed, and refuses', unprinted.status === 2 && /planted refusal from ident-guard\.sh/.test(unprinted.stderr), said(unprinted)],
      ]);
    },
  },
  {
    name: 'dispatch: an event name it does not know exits 0 and runs nothing',
    guards: ['dp_unknown'],
    run(m, dir, h) {
      const p = planted(h, { NoSuchEvent: [{ matcher: '', hooks: [shim('refuse.sh')] }] });
      script(p.repo, 'refuse.sh', 'echo "ran for an unknown event" >&2\nexit 2');
      const r = disp(h, dir, 'NoSuchEvent', {}, { launch: p.launch });
      return h.assertAll([['it exits 0 with nothing printed', r.status === 0 && r.stdout === '' && r.stderr === '', said(r)]]);
    },
  },
  {
    name: 'dispatch: --install wires the nine events into a planted settings file, keeps a hook of another source, and does not double them on a second run',
    guards: ['dp_install_events', 'dp_install_dedupe'],
    run(m, dir, h) {
      const file = join(h.tmp('dp-settings-'), 'settings.json');
      writeFileSync(file, JSON.stringify({ hooks: { Stop: [{ matcher: '', hooks: [{ type: 'command', command: 'echo foreign' }] }] }, other: 1 }));
      const go = () => spawnSync('node', [join(dir, 'hook-dispatch.mjs'), '--install'], { encoding: 'utf8', timeout: 60000, env: { ...process.env, HOOK_DISPATCH_SETTINGS_FILE: file } });
      const first = go();
      const second = go();
      const s = JSON.parse(readFileSync(file, 'utf8'));
      const EVENTS = ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'Stop', 'PreModelSwitch', 'PostModelSwitch', 'ConfigChange'];
      const ours = (ev) => (s.hooks[ev] ?? []).filter((g) => JSON.stringify(g).includes('hook-dispatch.mjs'));
      return h.assertAll([
        ['both runs exit 0', first.status === 0 && second.status === 0, said(first) + said(second)],
        ['each of the nine events holds the dispatcher exactly once after two runs', EVENTS.every((ev) => ours(ev).length === 1), JSON.stringify(EVENTS.map((ev) => [ev, ours(ev).length]))],
        ['the command names this folder\'s file and the event', ours('PreToolUse')[0]?.hooks?.[0]?.command === `node "${join(dir, 'hook-dispatch.mjs')}" PreToolUse`, JSON.stringify(ours('PreToolUse'))],
        ['a hook of another source and another key are kept', (s.hooks.Stop ?? []).some((g) => JSON.stringify(g).includes('echo foreign')) && s.other === 1, JSON.stringify(s.hooks.Stop)],
        ['the clear-context switch is written off', s.showClearContextOnPlanAccept === false, String(s.showClearContextOnPlanAccept)],
      ]);
    },
  },
  {
    name: 'shell plan-guard.mjs: it refuses the choice popup in the form the hook has always used, passes a Write in plan mode with nothing printed, and says in one line that the plan check is retired',
    guards: ['pgs_popup', 'pgs_plan_passes', 'pgs_check_line'],
    run(m, dir, h) {
      const run = (payload, args = []) => spawnSync('node', [join(dir, 'plan-guard.mjs'), ...args], { input: JSON.stringify(payload), encoding: 'utf8', timeout: 30000 });
      const popup = run({ tool_name: 'AskUserQuestion', tool_input: {}, permission_mode: 'default' });
      const popupPlan = run({ tool_name: 'AskUserQuestion', tool_input: {}, permission_mode: 'plan' });
      const write = run({ tool_name: 'Write', tool_input: { file_path: '/x', content: 'y' }, permission_mode: 'plan' });
      const exit = run({ tool_name: 'ExitPlanMode', tool_input: {}, permission_mode: 'plan' });
      const check = run({}, ['--check', '/some/plan.md']);
      let j = null;
      try { j = JSON.parse(popup.stdout); } catch { /* checked below */ }
      return h.assertAll([
        ['the popup is refused with exit 2 and a written deny that says to ask in plain text', popup.status === 2 && j?.hookSpecificOutput?.permissionDecision === 'deny' && /refused in every repository/.test(j.hookSpecificOutput.permissionDecisionReason) && /plain text/.test(j.hookSpecificOutput.permissionDecisionReason), said(popup)],
        ['it is refused in plan mode too', popupPlan.status === 2, said(popupPlan)],
        ['a Write in plan mode exits 0 and prints nothing', write.status === 0 && write.stdout === '' && write.stderr === '', said(write)],
        ['an ExitPlanMode call exits 0 and prints nothing', exit.status === 0 && exit.stdout === '', said(exit)],
        ['--check with a path prints one line saying the plan check is retired and exits 0', check.status === 0 && check.stdout.trim().split('\n').length === 1 && /plan check is retired/.test(check.stdout), said(check)],
      ]);
    },
  },
  {
    name: 'shell stop-guard.mjs: it reads its input, prints nothing and exits 0',
    guards: ['sgs_exit'],
    run(m, dir, h) {
      const r = spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ hook_event_name: 'Stop', transcript_path: '/nowhere' }), encoding: 'utf8', timeout: 30000 });
      return h.assertAll([['it exits 0 with nothing printed', r.status === 0 && r.stdout === '' && r.stderr === '', said(r)]]);
    },
  },
  {
    name: 'shell session-brief.mjs: it prints the heading, the branch lines and the one line, and nothing else',
    guards: ['sb_heading', 'sb_branch', 'sb_work', 'sb_page'],
    run(m, dir, h) {
      const r = h.repo({ '.branch-guard': 'work=staging\npromote=main\nescape=ALLOW_MAIN\n', 'a.txt': 'x\n' }, 'planted-app');
      r.g('checkout', '-q', '-B', 'staging');
      const out = spawnSync('node', [join(dir, 'session-brief.mjs'), '--repo', r.dir], { encoding: 'utf8', timeout: 30000 });
      const lines = out.stdout.split('\n').filter((l) => l !== '');
      return h.assertAll([
        ['it exits 0', out.status === 0, said(out)],
        ['the heading line names the repository', lines[0] === '=== session brief · planted-app ===', out.stdout],
        ['the branch line says which branch this is', lines[1] === "BRANCH: on 'staging'.", out.stdout],
        ['the next line says where work commits', lines[2] === "  Correct — work in this repo commits to 'staging'.", out.stdout],
        ['the one line closes it, with this folder as the hub', lines[3] === pageLine(dir), out.stdout],
        ['nothing else is printed', lines.length === 4, out.stdout],
      ]);
    },
  },
  {
    name: 'shell plan-scope-check.mjs: for any arguments, --record included, it prints one line saying the check was retired on 12 November 2026 and exits 0',
    guards: ['psc_line', 'psc_exit'],
    run(m, dir, h) {
      const bare = spawnSync('node', [join(dir, 'plan-scope-check.mjs')], { encoding: 'utf8', timeout: 30000 });
      const rec = spawnSync('node', [join(dir, 'plan-scope-check.mjs'), '--record', '--verdict=IN-SCOPE: x', '--lines-read=1'], { input: 'a finding', encoding: 'utf8', timeout: 30000 });
      const one = (r) => r.status === 0 && r.stdout.trim().split('\n').length === 1 && /plan-scope check was retired on 12 November 2026/.test(r.stdout);
      return h.assertAll([
        ['with no arguments it passes with its one line', one(bare), said(bare)],
        ['with --record it passes with its one line', one(rec), said(rec)],
      ]);
    },
  },
];

export const plants = {
  dp_pass_through: ["    return repoHooks(event, raw, p);\n  }\n  if (event === 'SessionStart' && !p.agent_id) {", "    process.stdout.write('printed');\n    return repoHooks(event, raw, p);\n  }\n  if (event === 'SessionStart' && !p.agent_id) {", 'hook-dispatch.mjs'],
  dp_popup: ["    if (tool === 'AskUserQuestion') {", '    if (false) {', 'hook-dispatch.mjs'],
  dp_push_refusal: ["    if (o.deny) { process.stderr.write(o.reason + '\\n'); return 2; }\n    if (o.status !== 0", "    if (false) { process.stderr.write(o.reason + '\\n'); return 2; }\n    if (o.status !== 0", 'hook-dispatch.mjs'],
  dp_unclean: ['    if (o.status !== 0 && !READS.has(tool)) {', '    if (false) {', 'hook-dispatch.mjs'],
  dp_page_prompt: ["  if (event === 'UserPromptSubmit') process.stdout.write(`${PAGE_LINE}\\n`);", "  if (false) process.stdout.write(`${PAGE_LINE}\\n`);", 'hook-dispatch.mjs'],
  dp_page_start: ["    process.stdout.write(`${PAGE_LINE}\\n`);\n  }\n  if (event === 'UserPromptSubmit')", "    void 0;\n  }\n  if (event === 'UserPromptSubmit')", 'hook-dispatch.mjs'],
  dp_start_main_only: ["  if (event === 'SessionStart' && !p.agent_id) {\n    const root", "  if (event === 'SessionStart') {\n    const root", 'hook-dispatch.mjs'],
  dp_bring_merge: ["    const merged = git(dir, ['merge', '--ff-only', 'origin/main']);", "    const merged = git(dir, ['status']);", 'hook-dispatch.mjs'],
  dp_bring_source: ["  if (p?.agent_id || !(p?.source === 'startup' || p?.source === 'resume')) return [];", '  if (p?.agent_id) return [];', 'hook-dispatch.mjs'],
  dp_repo_print: ["        if (o.out.trim() && (event === 'SessionStart' || event === 'UserPromptSubmit')) printed.push(o.out.trim());", '        if (false) printed.push(o.out.trim());', 'hook-dispatch.mjs'],
  dp_repo_refuse: ["        if (o.deny) { process.stderr.write(o.reason + '\\n'); return 2; }\n        if (o.out.trim()", "        void 0;\n        if (o.out.trim()", 'hook-dispatch.mjs'],
  dp_exit2: ['  if (r.status === 2 || jsonDeny) {', '  if (jsonDeny) {', 'hook-dispatch.mjs'],
  dp_json_deny: ["  const jsonDeny = j?.hookSpecificOutput?.permissionDecision === 'deny' || j?.decision === 'block';", '  const jsonDeny = false;', 'hook-dispatch.mjs'],
  dp_shim_swap: ["          command = `node \"${join(HUB, shim.replace(/\\.sh$/, '.mjs'))}\"`;", '          void 0;', 'hook-dispatch.mjs'],
  dp_shim_once: ['          if (ran.has(shim)) continue;', '          void 0;', 'hook-dispatch.mjs'],
  ident_skip_loop: ['        if (IDENT_SHIMS.has(shim) && idInLaunchResult(p)) continue;', '        void 0;', 'hook-dispatch.mjs'],
  dp_unknown: ['  if (!EVENTS.includes(event)) return 0;', '  if (false) return 0;', 'hook-dispatch.mjs'],
  dp_install_events: ['  for (const ev of EVENTS) {\n    const kept', '  for (const ev of EVENTS.slice(1)) {\n    const kept', 'hook-dispatch.mjs'],
  dp_install_dedupe: ["(s.hooks[ev] ?? []).filter((g) => !JSON.stringify(g).includes('hook-dispatch.mjs'))", '(s.hooks[ev] ?? [])', 'hook-dispatch.mjs'],
  pgs_popup: ["if (String(p?.tool_name ?? '') === 'AskUserQuestion') {", 'if (false) {', 'plan-guard.mjs'],
  pgs_plan_passes: ['  process.exit(2);\n}\nprocess.exit(0);\n', "  process.exit(2);\n}\nif (p?.permission_mode === 'plan') process.exit(2);\nprocess.exit(0);\n", 'plan-guard.mjs'],
  pgs_check_line: ["console.log('The plan check is retired:", "console.log('The plan check is ready:", 'plan-guard.mjs'],
  sgs_exit: ['} catch { /* no input is the same as input discarded */ }\nprocess.exit(0);', '} catch { /* no input is the same as input discarded */ }\nprocess.exit(2);', 'stop-guard.mjs'],
  sb_heading: ["out.push(`=== session brief · ${name} ===`);", "out.push('=== brief ===');", 'session-brief.mjs'],
  sb_branch: ["out.push(`BRANCH: on '${branch}'.`);", "out.push('');", 'session-brief.mjs'],
  sb_work: ["  if (branch === work) out.push(", '  if (false) out.push(', 'session-brief.mjs'],
  sb_page: ['out.push(`HOW WORK GOES HERE:', 'out.push(`HOW WORK GOES ELSEWHERE:', 'session-brief.mjs'],
  psc_line: ["console.log('The plan-scope check was retired on 12 November 2026; this passes.');", "console.log('The plan-scope check passes.');", 'plan-scope-check.mjs'],
  psc_exit: ["this passes.');\nprocess.exit(0);", "this passes.');\nprocess.exit(1);", 'plan-scope-check.mjs'],
};
