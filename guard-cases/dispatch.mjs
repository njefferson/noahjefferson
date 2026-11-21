// Cases and plants of the small dispatcher (hook-dispatch.mjs) and of the four shells other repositories call by their paths: plan-guard.mjs,
// stop-guard.mjs, session-brief.mjs and plan-scope-check.mjs. The shape is shape.mjs. Every case runs the real files from `dir`; every
// repository, home, launch folder and transcript is written under a temporary folder from `h`, and nothing is written into the checkout.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, utimesSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const pageLine = (hub) => `HOW WORK GOES HERE: the short page, ${hub}/plans/native/page.md. The procedures and the roles are files under ${hub}/plans/native/skills and ${hub}/plans/native/roles. The push guard and the check before a push hold every push of staging and main, and the choice popup is refused.`;
const said = (r) => `exit ${r.status}: ${r.stdout}${r.stderr}`.slice(0, 600);

/**
 * Run `node <hub>/hook-dispatch.mjs <event>` with a payload on its input, in a launch folder, under a home of its own.
 * The read at a start is set aside (HOOK_DISPATCH_READ_HOLD=off) unless a case turns it on: the transcripts of the other holds' cases hold no reads.
 */
function disp(h, hub, event, payload = {}, o = {}) {
  const launch = o.launch ?? h.tmp('dp-launch-');
  const env = { ...process.env, HOME: h.tmp('dp-home-'), CLAUDE_PROJECT_DIR: launch, HOOK_DISPATCH_READ_HOLD: 'off', ...(o.env ?? {}) };
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

// ---- the holds: a home, a latch folder and a launch folder of their own, and planted transcripts ----
const SCRATCH = '/tmp/claude-0/dp-proj/dp-session/scratchpad';
function world(h) {
  const home = h.tmp('dp-home-');
  const latch = h.tmp('dp-latch-');
  const launch = h.tmp('dp-launch-');
  const run = (hub, payload, env = {}, event = 'PreToolUse') => disp(h, hub, event, { session_id: 'dp-session', ...payload }, { launch, env: { HOME: home, REFUSAL_LATCH_DIR: latch, ...env } });
  return { home, latch, launch, run, plan: join(home, '.claude', 'plans', 'p.md'), scratch: `${SCRATCH}/n.txt`, repoFile: join(launch, 'repo', 'a.txt') };
}
/** An approval at the button as the transcript records it: the ExitPlanMode call and its result. */
const approval = (h, s, id) => [h.tool(s, id, 'ExitPlanMode', { plan: 'a plan' }), h.result(s + 1, id, 'User has approved your plan. You can now start coding. Start with updating your todo list if applicable')];
const typed = (h, s, text) => h.turn(s, text);
/** A reply of the main thread, as the transcript records it: an assistant entry with no agent id that carries the model's id. */
const modelReply = (h, s, model) => ({ type: 'assistant', timestamp: h.ts(s), message: { role: 'assistant', model, content: [{ type: 'text', text: 'Done.' }] } });
/** What a model command leaves: a user entry whose text holds "Set model to" and the id between backticks. */
const modelCommand = (h, s, id) => ({ type: 'user', timestamp: h.ts(s), message: { role: 'user', content: `<local-command-stdout>Set model to \`${id}\`</local-command-stdout>` } });
/** An agent's hand-back as the harness enqueues it: the words of an agent-message tag, "[Subagent hand-back]" inside it, on an entry that carries a human origin. */
const handBack = (h, s, text) => ({ type: 'user', timestamp: h.ts(s), origin: { kind: 'human' }, message: { role: 'user', content: `<agent-message from="worker-one">\n[Subagent hand-back] ${text}\n</agent-message>` } });
const call = (tool_name, tool_input, tr, extra = {}) => ({ tool_name, tool_input, ...(tr ? { transcript_path: tr } : {}), ...extra });
const held = (r, re) => r.status === 2 && re.test(r.stderr);
const passes = (r) => r.status === 0 && r.stdout === '' && r.stderr === '';
const gaveNoMessage = (r, words) => !new RegExp(words, 'i').test(r.stderr);

// ---- the read at a start: a hub copy with three planted pages, and the Read results the harness records ----
const STANDING = ['plans/native/page.md', 'doctrine/never.md', 'doctrine/hub.md'];
const PAGE_LINES = { 'plans/native/page.md': 4, 'doctrine/never.md': 6, 'doctrine/hub.md': 9 };
const pageRows = (rel) => Array.from({ length: PAGE_LINES[rel] }, (_, k) => `${rel} planted line ${k + 1}`);
/** A copy of the hub's dispatcher files with the three standing pages planted in it, each ending in a newline. */
function pagedHub(h, dir) {
  const hub = hubCopy(h, dir);
  for (const rel of STANDING) { mkdirSync(join(hub, rel, '..'), { recursive: true }); writeFileSync(join(hub, rel), pageRows(rel).join('\n') + '\n'); }
  return hub;
}
/**
 * A Read call and its result as the harness records them: lines `from` to `to` of a page whose total the harness counts as one more than
 * its lines of text (the empty text after the final newline). `form` is 'file' for the harness's own record, 'text' for line numbers in the text only.
 */
function readOf(h, s, id, file, rel, from, to, { form = 'file', total, isError = false } = {}) {
  const rows = [...pageRows(rel), ''];
  const raw = rows.slice(from - 1, to).join('\n');
  const text = rows.slice(from - 1, to).map((l, k) => `${from + k}\t${l}`).join('\n');
  const rec = { ...h.result(s + 1, id, text, isError) };
  if (form === 'file') rec.toolUseResult = { type: 'text', file: { filePath: file, content: raw, numLines: to - from + 1, startLine: from, totalLines: total ?? rows.length } };
  return [h.tool(s, id, 'Read', { file_path: file }), rec];
}
/** The whole of one page read in one call. */
const readAll = (h, s, id, hub, rel, o) => readOf(h, s, id, join(hub, rel), rel, 1, PAGE_LINES[rel] + 1, o);
/** All three pages read whole, from the step number `s`. */
const readAllThree = (h, s, hub, o) => STANDING.flatMap((rel, k) => readAll(h, s + k * 2, `rd${s}-${k}`, hub, rel, o));
// ---- a typed message still waiting in the queue, as the harness records it ----
const enqueue = (h, s, text) => ({ type: 'queue-operation', operation: 'enqueue', timestamp: h.ts(s), content: text });
const dequeue = (h, s) => ({ type: 'queue-operation', operation: 'dequeue', timestamp: h.ts(s) });
const removed = (h, s, text) => ({ type: 'queue-operation', operation: 'remove', timestamp: h.ts(s), content: text, reason: 'absorbed_mid_turn' });
/** A queued message delivered between tool calls, as the attachment the harness writes. */
const absorbed = (h, s, text) => ({ type: 'attachment', timestamp: h.ts(s), attachment: { type: 'queued_command', prompt: text, commandMode: 'prompt', origin: { kind: 'human' }, timestamp: h.ts(s) } });
const reading = (w, hub, payload) => w.run(hub, payload, { HOOK_DISPATCH_READ_HOLD: 'on' });
const compaction = (h, s) => [{ type: 'system', subtype: 'compact_boundary', timestamp: h.ts(s) }, { type: 'user', timestamp: h.ts(s + 1), isCompactSummary: true, message: { role: 'user', content: 'This session is being continued from a previous conversation. Summary: planted.' } }];

// ---- the typed messages of the session, filed whole at every start (fileTypedMessages in hook-dispatch.mjs) ----
const RECALL_FIRST = 'Every message typed in this session, whole and in order, for this session to read. It is not copied into any repository.';
const RECALL_WHY = 'Why: a summary loses the intent, and the typed messages are where it is.';
const RECALL_LINES = ['Planted typed messages file', '', '## 1. Oct 1, 05:00', '', 'planted words'];
/** Where the dispatcher files the typed messages of a session whose record is `record`, when the temp folder is `tmpRoot`. */
const recallPath = (tmpRoot, record, sid = 'dp-session') => join(tmpRoot, `claude-${process.getuid()}`, basename(dirname(record)), sid, 'scratchpad', 'recall', 'typed-messages.md');
/**
 * A session record in a project folder of its own, so that the file of the typed messages has a path known beforehand. `build(file)` returns
 * the entries, and `file` is that path. Where `filed` is true the file is written there with `lines`, as a start would have left it.
 */
function recallSession(h, tmpRoot, build, { filed = true, lines = RECALL_LINES, sid = 'dp-session' } = {}) {
  const record = join(h.tmp('dp-proj-'), 't.jsonl');
  const file = recallPath(tmpRoot, record, sid);
  writeFileSync(record, build(file).map((e) => JSON.stringify(e)).join('\n') + '\n');
  if (filed) { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, lines.join('\n') + '\n'); }
  return { record, file };
}
/** A Read call of a file whose text is `lines` and its result as the harness records them: lines `from` to `to` of a file whose total is one more than its lines. */
function readFileOf(h, s, id, file, lines, { from = 1, to = lines.length + 1 } = {}) {
  const rows = [...lines, ''];
  const raw = rows.slice(from - 1, to).join('\n');
  const text = rows.slice(from - 1, to).map((l, k) => `${from + k}\t${l}`).join('\n');
  return [h.tool(s, id, 'Read', { file_path: file }), { ...h.result(s + 1, id, text), toolUseResult: { type: 'text', file: { filePath: file, content: raw, numLines: to - from + 1, startLine: from, totalLines: rows.length } } }];
}
const readingIn = (w, hub, payload, tmpRoot) => w.run(hub, payload, { HOOK_DISPATCH_READ_HOLD: 'on', TMPDIR: tmpRoot });

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
      // The pushes come from a worker: the main thread's own push is refused by the manager hold, which the cases of hold 3 test.
      const push = (command, tr) => disp(h, dir, 'PreToolUse', { ...bash(command, r.dir, tr), agent_id: 'push-worker' });
      const other = push('git push origin claude/work', sessionWith(h));
      const staging = push('git push origin HEAD:staging', sessionWith(h));
      const older = push('git push origin main', sessionWith(h, `CHECK PASS ${r.first}`));
      const passed = push('git push origin main', sessionWith(h, `CHECK PASS ${r.head}`));
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
    name: 'dispatch: the seconds each git call of the start is given is a value bringForward takes, and one second ends a planted fetch that sleeps for six',
    guards: ['dp_bring_limit', 'dp_bring_default'],
    async run(m, dir, h) {
      const work = h.repo({ 'DOCTRINE.md': 'planted\n', 'hook-dispatch.mjs': 'planted\n' }, 'origin-hub');
      work.g('checkout', '-q', '-B', 'main');
      const clone = join(h.tmp('dp-launch-'), 'hubcopy');
      spawnSync('git', ['clone', '-q', work.dir, clone], { timeout: 60000 });
      const realGit = spawnSync('sh', ['-c', 'command -v git'], { encoding: 'utf8', timeout: 60000 }).stdout.trim();
      const bin = h.tmp('dp-bin-');
      writeFileSync(join(bin, 'git'), `#!/bin/sh\nfor a in "$@"; do\n  if [ "$a" = fetch ]; then exec sleep 6; fi\ndone\nexec ${realGit} "$@"\n`, { mode: 0o755 });
      const mod = await import(`${pathToFileURL(join(dir, 'hook-dispatch.mjs')).href}?v=${Math.random()}`);
      const savedPath = process.env.PATH;
      let lines = [];
      let took = Infinity;
      try {
        process.env.PATH = `${bin}:${savedPath}`;
        const t0 = Date.now();
        lines = mod.bringForward({ source: 'startup' }, { copy: clone, repos: [], seconds: 1 });
        took = Date.now() - t0;
      } finally { process.env.PATH = savedPath; }
      return h.assertAll([
        ['the planted fetch was ended at the one second given, long before its six', took < 4500, `took ${took} ms`],
        ['the start printed the line for a failed fetch and no other', lines.length === 1 && /^HUB COPY \(the gates' copy\): left as it stands, the fetch failed\.$/.test(lines[0]), JSON.stringify(lines)],
        ['the function states the default of twenty seconds a call and gives the limit to the call', /const seconds = opts\.seconds \?\? 20;/.test(readFileSync(join(dir, 'hook-dispatch.mjs'), 'utf8')) && /timeout: seconds \* 1000/.test(readFileSync(join(dir, 'hook-dispatch.mjs'), 'utf8')), 'source'],
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
  {
    name: 'dispatch: a planted launch folder that is not a repository and holds two repositories gets the line naming both and the running page, after the bring-forward line and the one line, at a start and at a resume, and the start exits 0',
    guards: ['dp_more_print'],
    run(m, dir, h) {
      const work = h.repo({ 'DOCTRINE.md': 'planted\n', 'hook-dispatch.mjs': 'planted\n' }, 'origin-hub');
      work.g('checkout', '-q', '-B', 'main');
      const launch = h.tmp('dp-launch-');
      spawnSync('git', ['clone', '-q', work.dir, join(launch, 'hubcopy')], { timeout: 60000 });
      work.write('a.txt', 'a later commit\n');
      work.stage();
      work.g('commit', '-q', '-m', 'a later commit on main');
      planted(h, {}, 'beta', launch);
      const start = disp(h, dir, 'SessionStart', { source: 'startup' }, { launch });
      const lines = start.stdout.split('\n');
      const resume = disp(h, dir, 'SessionStart', { source: 'resume' }, { launch });
      const more = lines[2] ?? '';
      return h.assertAll([
        ['the start exits 0', start.status === 0, said(start)],
        ['the bring-forward line comes first', /^HUB COPY \(the hub checkout .*hubcopy\): brought forward by 1 commit/.test(lines[0]), start.stdout],
        ['the one line comes second', lines[1] === pageLine(dir), start.stdout],
        ['the new line comes third, begins MORE THAN ONE REPOSITORY IN THIS SESSION, names both folders and the running page', more.startsWith('MORE THAN ONE REPOSITORY IN THIS SESSION') && /\bhubcopy\b/.test(more) && /\bbeta\b/.test(more) && more.includes(`${dir}/plans/native/running.md`), start.stdout],
        ['nothing else is printed', lines.length === 4 && lines[3] === '', start.stdout],
        ['a resume prints the line too and exits 0', resume.status === 0 && /^MORE THAN ONE REPOSITORY IN THIS SESSION: /m.test(resume.stdout), said(resume)],
      ]);
    },
  },
  {
    name: 'dispatch: a launch folder that is itself one repository gets no line about repositories, also when another repository sits beside it or two sit inside it',
    guards: ['dp_more_launch_repo'],
    run(m, dir, h) {
      const parent = h.tmp('dp-parent-');
      const app = planted(h, {}, 'app', parent);
      planted(h, {}, 'side', parent);
      const alone = disp(h, dir, 'SessionStart', { source: 'startup' }, { launch: app.repo });
      planted(h, {}, 'in-one', app.repo);
      planted(h, {}, 'in-two', app.repo);
      const nested = disp(h, dir, 'SessionStart', { source: 'resume' }, { launch: app.repo });
      return h.assertAll([
        ['a repository with another beside it prints the one line and nothing else', alone.status === 0 && alone.stdout === `${pageLine(dir)}\n`, said(alone)],
        ['a repository with two inside it prints the one line and nothing else', nested.status === 0 && nested.stdout === `${pageLine(dir)}\n`, said(nested)],
      ]);
    },
  },
  {
    name: 'dispatch: a planted launch folder that is not a repository and holds one repository gets no line about repositories, another folder beside the repository included',
    guards: ['dp_more_two'],
    run(m, dir, h) {
      const p = planted(h, {});
      mkdirSync(join(p.launch, 'notes'), { recursive: true });
      const start = disp(h, dir, 'SessionStart', { source: 'startup' }, { launch: p.launch });
      const resume = disp(h, dir, 'SessionStart', { source: 'resume' }, { launch: p.launch });
      return h.assertAll([
        ['a start prints the one line and nothing else', start.status === 0 && start.stdout === `${pageLine(dir)}\n`, said(start)],
        ['a resume prints the one line and nothing else', resume.status === 0 && resume.stdout === `${pageLine(dir)}\n`, said(resume)],
      ]);
    },
  },
  {
    name: 'dispatch: two planted repositories under the launch folder get no line about repositories in an agent\'s start, and none in a start whose source is neither startup nor resume',
    guards: ['dp_more_source'],
    run(m, dir, h) {
      const a = planted(h, {}, 'one');
      planted(h, {}, 'two', a.launch);
      const agent = disp(h, dir, 'SessionStart', { source: 'startup', agent_id: 'a1' }, { launch: a.launch });
      const agentResume = disp(h, dir, 'SessionStart', { source: 'resume', agent_id: 'a1' }, { launch: a.launch });
      const compact = disp(h, dir, 'SessionStart', { source: 'compact' }, { launch: a.launch });
      const clear = disp(h, dir, 'SessionStart', { source: 'clear' }, { launch: a.launch });
      return h.assertAll([
        ['an agent\'s start prints nothing', agent.status === 0 && agent.stdout === '', said(agent)],
        ['an agent\'s resume prints nothing', agentResume.status === 0 && agentResume.stdout === '', said(agentResume)],
        ['a compaction prints the one line and nothing else', compact.status === 0 && compact.stdout === `${pageLine(dir)}\n`, said(compact)],
        ['a clear prints the one line and nothing else', clear.status === 0 && clear.stdout === `${pageLine(dir)}\n`, said(clear)],
      ]);
    },
  },
  {
    name: 'hold 1 (stop): a typed stop message holds a main-thread Bash and an agent\'s Edit and every other call but a read and the main thread\'s TaskStop, quotes nothing, sets no latch, and a message that only has the letters of the word inside another word is no stop',
    guards: ['hy_stop', 'hw_stop_hold','hw_stop_agents', 'hw_reads', 'hw_word_whole', 'hw_no_latch', 'hw_main_tr'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Please stop everything right now.')]);
      const mainBash = w.run(dir, call('Bash', { command: 'ls' }, tr));
      const agentEdit = w.run(dir, call('Edit', { file_path: '/x/y.txt', old_string: 'a', new_string: 'b' }, tr, { agent_id: 'ag1' }));
      const read = w.run(dir, call('Read', { file_path: '/x/y.txt' }, tr));
      const agentRead = w.run(dir, call('Read', { file_path: '/x/y.txt' }, tr, { agent_id: 'ag1' }));
      const exitPlan = w.run(dir, call('ExitPlanMode', {}, tr));
      const stopMain = w.run(dir, call('TaskStop', { task_id: 'bk7x3q9zd' }, tr));
      const stopAgent = w.run(dir, call('TaskStop', { task_id: 'bk7x3q9zd' }, tr, { agent_id: 'ag1' }));
      const send = w.run(dir, call('Agent', { prompt: 'x' }, tr));
      // an agent's payload may carry its own transcript beneath <session>/subagents/; the session's is the file beside that folder
      const base = h.tmp('dp-sess-');
      mkdirSync(join(base, 'sess1', 'subagents'), { recursive: true });
      writeFileSync(join(base, 'sess1.jsonl'), JSON.stringify(typed(h, 0, 'Please stop everything right now.')) + '\n');
      writeFileSync(join(base, 'sess1', 'subagents', 'agent-ag1.jsonl'), JSON.stringify(h.tool(0, 'q', 'Bash', { command: 'ls' })) + '\n');
      const own = w.run(dir, call('Edit', { file_path: '/x/y.txt', old_string: 'a', new_string: 'b' }, join(base, 'sess1', 'subagents', 'agent-ag1.jsonl'), { agent_id: 'ag1' }));
      const inWord = h.transcript([typed(h, 0, 'The job stopped by itself, tell me why.')]);
      const notStop = w.run(dir, call('Bash', { command: 'ls' }, inWord));
      return h.assertAll([
        ['a main-thread Bash is refused with the stop words, what passes and what lifts it', held(mainBash, /STOP: .*Only reads pass, TaskStop.*go, ok, continue, approved, yes.*approval of a plan at the button/s), said(mainBash)],
        ['the refusal quotes nothing of the message', gaveNoMessage(mainBash, 'everything right now'), said(mainBash)],
        ['the stop refusal carries its Why sentence', /Why: without the hold the work goes on over a message and the message is never answered, and only the one who typed it can say it was answered, which is what the go-word is\./.test(mainBash.stderr), said(mainBash)],
        ['an agent\'s Edit is refused', held(agentEdit, /STOP: /), said(agentEdit)],
        ['an agent whose payload carries its own transcript is held by the session\'s', held(own, /STOP: /), said(own)],
        ['a main-thread Agent send is refused', held(send, /STOP: /), said(send)],
        ['a Read passes, an agent\'s too', passes(read) && passes(agentRead), said(read) + said(agentRead)],
        ['ExitPlanMode is refused under the word stop', held(exitPlan, /STOP: /), said(exitPlan)],
        ['the main thread\'s TaskStop passes', passes(stopMain), said(stopMain)],
        ['an agent\'s TaskStop is refused', held(stopAgent, /STOP: /), said(stopAgent)],
        ['a message with stopped inside it is no stop: a Bash passes', passes(notStop), said(notStop)],
        ['no refusal of the hold wrote a latch', readdirSync(w.latch).length === 0, readdirSync(w.latch).join(',')],
      ]);
    },
  },
  {
    name: 'hold 1 (stop, report): under the word stop an agent\'s Write or Edit of a file directly in progress/ of the session scratchpad passes, any other write is refused, an agent\'s Bash is refused, and the main thread\'s Write of that file is refused',
    guards: ['hw_progress_pass', 'hw_progress_dir', 'hw_progress_agent', 'hw_progress_direct'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Please stop everything right now.')]);
      const report = `${SCRATCH}/progress/step-2-report.txt`;
      const agentWrite = w.run(dir, call('Write', { file_path: report, content: 'x' }, tr, { agent_id: 'ag1' }));
      const agentEdit = w.run(dir, call('Edit', { file_path: report, old_string: 'a', new_string: 'b' }, tr, { agent_id: 'ag1' }));
      const agentOther = w.run(dir, call('Write', { file_path: `${SCRATCH}/other.txt`, content: 'x' }, tr, { agent_id: 'ag1' }));
      const agentSibling = w.run(dir, call('Write', { file_path: `${SCRATCH}/notes/step-2-report.txt`, content: 'x' }, tr, { agent_id: 'ag1' }));
      const agentDeep = w.run(dir, call('Write', { file_path: `${SCRATCH}/sub/progress/step-2-report.txt`, content: 'x' }, tr, { agent_id: 'ag1' }));
      const agentBelow = w.run(dir, call('Write', { file_path: `${SCRATCH}/progress/sub/step-2-report.txt`, content: 'x' }, tr, { agent_id: 'ag1' }));
      const agentRepo = w.run(dir, call('Write', { file_path: w.repoFile, content: 'x' }, tr, { agent_id: 'ag1' }));
      const agentBash = w.run(dir, call('Bash', { command: 'ls' }, tr, { agent_id: 'ag1' }));
      const mainWrite = w.run(dir, call('Write', { file_path: report, content: 'x' }, tr));
      return h.assertAll([
        ['an agent\'s Write of a file in progress/ of the scratchpad passes', passes(agentWrite), said(agentWrite)],
        ['an agent\'s Edit of a file in progress/ of the scratchpad passes', passes(agentEdit), said(agentEdit)],
        ['an agent\'s Write of another scratchpad file is refused', held(agentOther, /^STOP: /), said(agentOther)],
        ['an agent\'s Write of a file in another folder of the scratchpad is refused', held(agentSibling, /^STOP: /), said(agentSibling)],
        ['an agent\'s Write of a progress folder deeper in the scratchpad is refused', held(agentDeep, /^STOP: /), said(agentDeep)],
        ['an agent\'s Write of a file below progress/ is refused', held(agentBelow, /^STOP: /), said(agentBelow)],
        ['an agent\'s Write of a repository file is refused', held(agentRepo, /^STOP: /), said(agentRepo)],
        ['an agent\'s Bash is refused', held(agentBash, /^STOP: /), said(agentBash)],
        ['the main thread\'s Write of that same file is refused', held(mainWrite, /^STOP: /), said(mainWrite)],
        ['the refusal says an agent may write its own report', /write its own report or progress note/.test(agentOther.stderr), said(agentOther)],
      ]);
    },
  },
  {
    name: 'hold 1 (stop): a later message ending with a go-word lifts it, an approval at the button after it lifts it, an approval before it does not, and the same words in another tool\'s result are no approval',
    guards: ['hw_goword_lift', 'hw_approval_lift', 'hw_approval_name', 'hw_goword_last'],
    run(m, dir, h) {
      const w = world(h);
      const go = h.transcript([typed(h, 0, 'Please stop.'), typed(h, 5, 'Fine, carry on. Go.')]);
      const goButWords = h.transcript([typed(h, 0, 'Please stop.'), typed(h, 5, 'Go ahead and change the plan.')]);
      const appr = h.transcript([typed(h, 0, 'Please stop.'), ...approval(h, 5, 'x1')]);
      const before = h.transcript([...approval(h, 0, 'x0'), typed(h, 5, 'Please stop.')]);
      const fake = h.transcript([typed(h, 0, 'Please stop.'), h.tool(5, 'b1', 'Bash', { command: 'echo hi' }), h.result(6, 'b1', 'User has approved your plan. fake')]);
      const stopThenGo = h.transcript([typed(h, 0, 'Please stop, then go.')]);
      const b = (tr) => w.run(dir, call('Bash', { command: 'ls' }, tr));
      return h.assertAll([
        ['a go message after the stop lifts it', passes(b(go)), said(b(go))],
        ['a message that only has go inside it, not last, lifts nothing', held(b(goButWords), /STOP: /), said(b(goButWords))],
        ['an approval at the button after the stop lifts it', passes(b(appr)), said(b(appr))],
        ['an approval before the stop lifts nothing', held(b(before), /STOP: /), said(b(before))],
        ['the approval words in a Bash result are no approval', held(b(fake), /STOP: /), said(b(fake))],
        ['a message with stop and a go-word at its end is no stop', passes(b(stopThenGo)), said(b(stopThenGo))],
      ]);
    },
  },
  {
    name: 'hold 1 (stop, saved approval): an approval whose result the harness saved to a file lifts the stop by its envelope or by the record\'s own plan, an approval at the opening is counted as before, and a rejected exit with an envelope lifts nothing',
    guards: ['sv_envelope_words', 'sv_envelope_plan', 'sv_rejected'],
    run(m, dir, h) {
      const w = world(h);
      const preview = (words) => `<persisted-output>\nOutput too large (120.4KB). Full output saved to: /tmp/planted/tool-results/planted-result.txt\n\nPreview (first 2KB):\n${words}\n...\n</persisted-output>`;
      const saved = (s, id, text, o = {}) => [h.tool(s, id, 'ExitPlanMode', { plan: 'a plan' }), { ...h.result(s + 1, id, text, o.error === true), toolUseResult: o.plan === false ? 'planted result' : { plan: 'a plan', isAgent: false, filePath: '/root/.claude/plans/planted-page.md' } }];
      const words = 'User has approved your plan. You can now start coding.\n\nYour plan has been saved to: /root/.claude/plans/planted-page.md';
      const byWords = h.transcript([typed(h, 0, 'Please stop.'), ...saved(5, 'e1', preview(words), { plan: false })]);
      const byPlan = h.transcript([typed(h, 0, 'Please stop.'), ...saved(5, 'e2', preview('The first part of a long page, with no approval words in it.'))]);
      const plain = h.transcript([typed(h, 0, 'Please stop.'), ...approval(h, 5, 'e3')]);
      const rejected = h.transcript([typed(h, 0, 'Please stop.'), ...saved(5, 'e4', preview("The user doesn't want to proceed with this tool use. The tool use was rejected."), { error: true })]);
      const rejectedQuiet = h.transcript([typed(h, 0, 'Please stop.'), ...saved(5, 'e5', preview("The user doesn't want to proceed with this tool use. The tool use was rejected."))]);
      const otherTool = h.transcript([typed(h, 0, 'Please stop.'), h.tool(5, 'e6', 'Bash', { command: 'echo hi' }), { ...h.result(6, 'e6', preview(words)), toolUseResult: { stdout: 'planted' } }]);
      const b = (tr) => w.run(dir, call('Bash', { command: 'ls' }, tr));
      return h.assertAll([
        ['an approval saved to a file, with its words after the envelope, lifts the stop', passes(b(byWords)), said(b(byWords))],
        ['an approval saved to a file, counted from the record\'s own plan, lifts the stop', passes(b(byPlan)), said(b(byPlan))],
        ['an approval at the opening of the text is counted as before', passes(b(plain)), said(b(plain))],
        ['a rejected exit with an envelope lifts nothing', held(b(rejected), /STOP: /), said(b(rejected))],
        ['a rejected exit with an envelope and no error flag lifts nothing', held(b(rejectedQuiet), /STOP: /), said(b(rejectedQuiet))],
        ['an envelope in the result of another tool is no approval', held(b(otherTool), /STOP: /), said(b(otherTool))],
      ]);
    },
  },
  {
    name: 'hold 1 (stop, negative): not, never or a word ending in n\'t (either apostrophe, or none) directly before the word stop makes it no stop, and a stop with anything else before it is a stop',
    guards: ['hw_neg_not', 'hw_neg_never', 'hw_neg_apos', 'hw_neg_plain', 'hw_neg_prev', 'hw_neg_direct', 'hw_word_whole'],
    run(m, dir, h) {
      const w = world(h);
      const bashUnder = (text) => w.run(dir, call('Bash', { command: 'ls' }, h.transcript([typed(h, 0, text)])));
      const noStop = ['do not stop', 'don\'t stop working', 'don’t stop working', 'dont stop', 'never stop', 'you must not stop', 'you cant stop now', 'I wouldn\'t stop'];
      const isStop = ['stop', 'please stop now', 'do not go on, stop', 'not now, stop'];
      const rows = [];
      for (const t of noStop) { const r = bashUnder(t); rows.push([`"${t}" is no stop: a Bash passes`, passes(r), said(r)]); }
      for (const t of isStop) { const r = bashUnder(t); rows.push([`"${t}" is a stop: a Bash is refused`, held(r, /STOP: /), said(r)]); }
      return h.assertAll(rows);
    },
  },
  {
    name: 'hold 1 (harness text): hook feedback, a task notification, an agent\'s hand-back, a restart notice, a system reminder and a slash command, each with the word stop, hold nothing',
    guards: ['hw_harness'],
    run(m, dir, h) {
      const w = world(h);
      const entries = [
        typed(h, 0, 'Go.'),
        { type: 'user', timestamp: h.ts(5), message: { role: 'user', content: 'Stop hook feedback:\n- please stop and review' } },
        { type: 'user', timestamp: h.ts(6), origin: { kind: 'task-notification' }, message: { role: 'user', content: '<task-notification> the task was stopped, stop </task-notification>' } },
        { type: 'attachment', timestamp: h.ts(7), attachment: { type: 'queued_command', commandMode: 'prompt', origin: { kind: 'peer' }, prompt: '<agent-message from="a1"> [Subagent hand-back] stop' } },
        { type: 'user', timestamp: h.ts(8), isMeta: true, message: { role: 'user', content: 'This session\'s worker process was restarted; stop anything running' } },
        { type: 'user', timestamp: h.ts(9), isMeta: true, message: { role: 'user', content: '<system-reminder>stop</system-reminder>' } },
        { type: 'user', timestamp: h.ts(10), message: { role: 'user', content: '<command-name>/stop</command-name> <command-message>stop</command-message>' } },
        { type: 'user', timestamp: h.ts(11), origin: { kind: 'peer' }, message: { role: 'user', content: 'Another Claude session says stop' } },
      ];
      const tr = h.transcript(entries);
      const bashR = w.run(dir, call('Bash', { command: 'ls' }, tr));
      const send = w.run(dir, call('Agent', { prompt: 'x' }, tr));
      const edit = w.run(dir, call('Write', { file_path: w.plan, content: 'x' }, tr));
      return h.assertAll([
        ['a Bash passes', passes(bashR), said(bashR)],
        ['an Agent send passes, so none of them set a correction either', passes(send), said(send)],
        ['a write of a plan file passes', passes(edit), said(edit)],
      ]);
    },
  },
  {
    name: 'hold 1 (correction): a newest message with no go-word holds an Agent send and a repository Edit and passes Bash, a plan-file Write, a scratchpad Write and ExitPlanMode; an agent is not held; it quotes nothing and sets no latch',
    guards: ['hy_new', 'hw_correction_new','hw_correction_write', 'hw_plan_pass', 'hw_agent_free'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Ok but change the plan first.')]);
      const send = w.run(dir, call('Agent', { prompt: 'x' }, tr));
      const sendMsg = w.run(dir, call('SendMessage', { to: 'a1', message: 'x' }, tr));
      const flow = w.run(dir, call('Workflow', { name: 'x' }, tr));
      const edit = w.run(dir, call('Edit', { file_path: w.repoFile, old_string: 'a', new_string: 'b' }, tr));
      const bashR = w.run(dir, call('Bash', { command: 'ls' }, tr));
      const planW = w.run(dir, call('Write', { file_path: w.plan, content: 'x' }, tr));
      const scratchW = w.run(dir, call('Write', { file_path: w.scratch, content: 'x' }, tr));
      const exitPlan = w.run(dir, call('ExitPlanMode', {}, tr));
      const enterPlan = w.run(dir, call('EnterPlanMode', {}, tr));
      const agentSend = w.run(dir, call('Agent', { prompt: 'x' }, tr, { agent_id: 'ag1' }));
      return h.assertAll([
        ['an Agent send is refused with what is held, what passes and what lifts it', held(send, /NEW STARTS HELD: .*Reads, Bash, plan mode set in the app and the button pass.*go, ok, continue, approved, yes.*approval of a plan at the button/s), said(send)],
        ['it quotes nothing', gaveNoMessage(send, 'change the plan first'), said(send)],
        ['the new-starts refusal carries its Why sentence', /Why: without the hold the work goes on over a message and the message is never answered, and only the one who typed it can say it was answered, which is what the go-word is\./.test(send.stderr), said(send)],
        ['a SendMessage and a Workflow are refused', held(sendMsg, /NEW STARTS HELD/) && held(flow, /NEW STARTS HELD/), said(sendMsg) + said(flow)],
        ['a repository Edit is refused by this hold', held(edit, /NEW STARTS HELD/), said(edit)],
        ['a Bash passes', passes(bashR), said(bashR)],
        ['a Write of a plan file directly under the plans folder passes', passes(planW), said(planW)],
        ['a Write in the session scratchpad passes', passes(scratchW), said(scratchW)],
        ['ExitPlanMode passes, and the session\'s own EnterPlanMode is refused with NO PAGE WAS ASKED FOR', passes(exitPlan) && held(enterPlan, /^NO PAGE WAS ASKED FOR: /), said(exitPlan) + said(enterPlan)],
        ['an agent already running is not held', passes(agentSend), said(agentSend)],
        ['no latch was written', readdirSync(w.latch).length === 0, readdirSync(w.latch).join(',')],
      ]);
    },
  },
  {
    name: 'hold 1 (correction): an approval at the button after the message lifts it, one before does not, a message ending with a go-word holds nothing, and a message with stop and a go-word at its end holds nothing',
    guards: ['hw_correction_approval_before', 'hw_correction_lift'],
    run(m, dir, h) {
      const w = world(h);
      const send = (tr) => w.run(dir, call('Agent', { prompt: 'x' }, tr));
      const after = h.transcript([typed(h, 0, 'Change the plan first.'), ...approval(h, 5, 'x1')]);
      const before = h.transcript([...approval(h, 0, 'x0'), typed(h, 5, 'Change the plan first.')]);
      const goMsg = h.transcript([typed(h, 0, 'Yes, do the next step. Go.')]);
      const goThenPlain = h.transcript([typed(h, 0, 'Go.'), typed(h, 5, 'One more thing about the page.')]);
      const goLater = h.transcript([typed(h, 0, 'Change the plan first.'), typed(h, 5, 'All of that, ok.')]);
      return h.assertAll([
        ['an approval after the message lifts the hold', passes(send(after)), said(send(after))],
        ['an approval before the message does not', held(send(before), /NEW STARTS HELD/), said(send(before))],
        ['a message ending with a go-word holds nothing', passes(send(goMsg)), said(send(goMsg))],
        ['a plain message after a go message is held again', held(send(goThenPlain), /NEW STARTS HELD/), said(send(goThenPlain))],
        ['a go message after the correction lifts it', passes(send(goLater)), said(send(goLater))],
      ]);
    },
  },
  {
    name: 'hold 1 (correction): P-126: a Bash git log of a repository passes under a standing correction, in the plain form and with -C and a pipe, while an Agent send is still held',
    guards: ['cr_git_log_read'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Ok but change the plan first.')]);
      const repoDir = join(w.launch, 'repo');
      const log = (command) => w.run(dir, call('Bash', { command }, tr, { cwd: repoDir }));
      const plain = log('git log --oneline -5');
      const dashC = log(`git -C ${repoDir} log -3 --stat`);
      const piped = log('git log --format=%s | head -20');
      const send = w.run(dir, call('Agent', { prompt: 'x' }, tr));
      return h.assertAll([
        ['the correction stands: an Agent send is refused as a new start', held(send, /NEW STARTS HELD/), said(send)],
        ['a plain git log passes with nothing printed', passes(plain), said(plain)],
        ['a git log with -C passes', passes(dashC), said(dashC)],
        ['a git log piped to head passes', passes(piped), said(piped)],
        ['no latch was written', readdirSync(w.latch).length === 0, readdirSync(w.latch).join(',')],
      ]);
    },
  },
  {
    name: 'hold 1 (correction): P-492: when the newest message is a pasted test report the plan file and the scratchpad can still be written, and the first refusal of a new start says so',
    guards: ['cr_pasted_report_plan'],
    run(m, dir, h) {
      const w = world(h);
      const report = 'Test report from the last run:\nRED CASES: none\n312 of 312 passed\nPLANTS NOT RUN: this run ran the cases only';
      const tr = h.transcript([typed(h, 0, 'Go.'), h.tool(1, 'r1', 'Bash', { command: 'git status' }), h.result(2, 'r1', 'clean'), typed(h, 5, report)]);
      // A plan file is written in plan mode, the only mode in which the approved page's hold lets it through.
      const planW = w.run(dir, call('Write', { file_path: w.plan, content: 'x' }, tr, { permission_mode: 'plan' }));
      const planE = w.run(dir, call('Edit', { file_path: w.plan, old_string: 'a', new_string: 'b' }, tr, { permission_mode: 'plan' }));
      const scratchW = w.run(dir, call('Write', { file_path: w.scratch, content: 'x' }, tr));
      const send = w.run(dir, call('Agent', { prompt: 'x' }, tr));
      const repoW = w.run(dir, call('Write', { file_path: w.repoFile, content: 'x' }, tr));
      return h.assertAll([
        ['a Write of the plan file in plan mode passes with nothing printed', passes(planW), said(planW)],
        ['an Edit of the plan file in plan mode passes', passes(planE), said(planE)],
        ['a Write in the scratchpad passes', passes(scratchW), said(scratchW)],
        ['an Agent send is refused, and the refusal says a plan file directly under the plans folder may be written meanwhile', held(send, /NEW STARTS HELD: .*no write of a file other than a plan file directly under ~\/\.claude\/plans\/ or a file in the session scratchpad/s), said(send)],
        ['a repository Write is refused by the same hold', held(repoW, /NEW STARTS HELD/), said(repoW)],
        ['no latch was written', readdirSync(w.latch).length === 0, readdirSync(w.latch).join(',')],
      ]);
    },
  },
  {
    name: 'hold 1 (correction): P-519: a message ending with a go-word that arrives between two writes of the plan file releases the hold, so the second write and an Agent send pass, and before it an Agent send is held',
    guards: ['cr_go_between_writes'],
    run(m, dir, h) {
      const w = world(h);
      const firstWrite = [h.tool(1, 'w1', 'Write', { file_path: w.plan, content: 'one' }), h.result(2, 'w1', 'File created')];
      const before = h.transcript([typed(h, 0, 'Ok but change the plan first.'), ...firstWrite]);
      const after = h.transcript([typed(h, 0, 'Ok but change the plan first.'), ...firstWrite, typed(h, 10, 'Fine, carry on with the plan. Go.')]);
      const send = (tr) => w.run(dir, call('Agent', { prompt: 'x' }, tr));
      // Both writes are made in plan mode, where a plan file may be written.
      const write = (tr) => w.run(dir, call('Write', { file_path: w.plan, content: 'two' }, tr, { permission_mode: 'plan' }));
      return h.assertAll([
        ['before the go message the first write of the plan file in plan mode passes', passes(write(before)), said(write(before))],
        ['before the go message an Agent send is held', held(send(before), /NEW STARTS HELD/), said(send(before))],
        ['after the go message the second write of the plan file in plan mode passes', passes(write(after)), said(write(after))],
        ['after the go message an Agent send passes: the hold is released', passes(send(after)), said(send(after))],
      ]);
    },
  },
  {
    name: 'hold 1 (stop): P-541: an agent\'s hand-back that names stop-guard.mjs is no word stop and no correction: nothing is held and the prompt prints the one line only, while a typed stop still holds',
    guards: ['hb_names_stop_file'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Go.'), handBack(h, 5, 'DONE\nThe stop guard file stop-guard.mjs was read and nothing in it was changed.')]);
      const typedStop = h.transcript([typed(h, 0, 'Please stop.')]);
      const bashR = w.run(dir, call('Bash', { command: 'ls' }, tr));
      const send = w.run(dir, call('Agent', { prompt: 'x' }, tr));
      const edit = w.run(dir, call('Write', { file_path: w.plan, content: 'x' }, tr));
      const prompt = disp(h, dir, 'UserPromptSubmit', { prompt: 'Hello', transcript_path: tr });
      const live = w.run(dir, call('Bash', { command: 'ls' }, typedStop));
      return h.assertAll([
        ['a Bash passes with nothing printed', passes(bashR), said(bashR)],
        ['an Agent send passes, so the hand-back set no correction either', passes(send), said(send)],
        ['a write of the plan file passes', passes(edit), said(edit)],
        ['the prompt prints the one line and names no stop and no correction', prompt.status === 0 && prompt.stdout === `${pageLine(dir)}\n` && !/stop|correction/i.test(prompt.stdout.replace(pageLine(dir), '')), said(prompt)],
        ['the hold is live: a typed stop holds a Bash', held(live, /STOP: /), said(live)],
      ]);
    },
  },
  {
    name: 'hold 1 (stop): P-564: an agent\'s hand-back that closes a step, and one whose report holds the word stop, are no typed message: nothing is held and the prompt prints the one line only',
    guards: ['hb_closes_step'],
    run(m, dir, h) {
      const w = world(h);
      const closes = h.transcript([typed(h, 0, 'Go.'), handBack(h, 5, 'DONE\nThe step is closed: the case file was written and the run passed.')]);
      const wordStop = h.transcript([typed(h, 0, 'Go.'), handBack(h, 5, 'REFUSED\nThe hook said stop and the step ended there.')]);
      const seen = [];
      for (const [label, tr] of [['a hand-back that closes a step', closes], ['a hand-back whose report holds the word stop', wordStop]]) {
        const bashR = w.run(dir, call('Bash', { command: 'ls' }, tr));
        const send = w.run(dir, call('Agent', { prompt: 'x' }, tr));
        const prompt = disp(h, dir, 'UserPromptSubmit', { prompt: 'Hello', transcript_path: tr });
        seen.push([`${label}: a Bash passes with nothing printed`, passes(bashR), said(bashR)]);
        seen.push([`${label}: an Agent send passes, so it set no correction`, passes(send), said(send)]);
        seen.push([`${label}: the prompt prints the one line and names no stop and no correction`, prompt.status === 0 && prompt.stdout === `${pageLine(dir)}\n`, said(prompt)]);
      }
      return h.assertAll(seen);
    },
  },
  {
    name: 'hold 2 (latch): P-113: two WebFetch calls to one host in one message write no latch, for the main thread and for an agent, and a Bash after them passes',
    guards: ['wf_two_fetches'],
    run(m, dir, h) {
      const w = world(h);
      const fetchOne = [h.tool(1, 'f1', 'WebFetch', { url: 'https://example.org/one', prompt: 'Read it' }), h.result(2, 'f1', 'page one')];
      const first = h.transcript([typed(h, 0, 'Go and read both pages.')]);
      const second = h.transcript([typed(h, 0, 'Go and read both pages.'), ...fetchOne]);
      const a = w.run(dir, call('WebFetch', { url: 'https://example.org/one', prompt: 'Read it' }, first));
      const b = w.run(dir, call('WebFetch', { url: 'https://example.org/two', prompt: 'Read it' }, second));
      const agentA = w.run(dir, call('WebFetch', { url: 'https://example.org/one', prompt: 'Read it' }, first, { agent_id: 'ag1' }));
      const agentB = w.run(dir, call('WebFetch', { url: 'https://example.org/two', prompt: 'Read it' }, second, { agent_id: 'ag1' }));
      const files = readdirSync(w.latch);
      const next = w.run(dir, call('Bash', { command: 'ls' }, second));
      return h.assertAll([
        ['the first fetch passes with nothing printed', passes(a), said(a)],
        ['the second fetch to the same host passes with nothing printed', passes(b), said(b)],
        ['an agent\'s two fetches pass', passes(agentA) && passes(agentB), said(agentA) + said(agentB)],
        ['no latch file was written', files.length === 0, files.join(',')],
        ['a main-thread Bash after them passes', passes(next), said(next)],
      ]);
    },
  },
  {
    name: 'hold 2 (latch): P-488: with a latch standing an agent writes its own report file in the progress folder, and writes it a second time, and both pass while the main thread stays held',
    guards: ['lg_report_again'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Do the next thing. Go.')]);
      const popup = w.run(dir, call('AskUserQuestion', { questions: [] }, tr));
      const report = `${SCRATCH}/progress/step-1-report.txt`;
      const write = () => w.run(dir, call('Write', { file_path: report, content: 'DONE\nThe wall line.' }, tr, { agent_id: 'ag1' }));
      const once = write();
      const again = write();
      const edit = w.run(dir, call('Edit', { file_path: report, old_string: 'a', new_string: 'b' }, tr, { agent_id: 'ag1' }));
      const files = readdirSync(w.latch);
      const main = w.run(dir, call('Bash', { command: 'ls' }, tr));
      return h.assertAll([
        ['the latch was written by the popup refusal and stands', popup.status === 2 && files.length === 1, said(popup) + files.join(',')],
        ['the main thread is held by it', held(main, /REFUSAL LATCH: /), said(main)],
        ['the agent\'s write of its report passes with nothing printed', passes(once), said(once)],
        ['its second write of the same report passes', passes(again), said(again)],
        ['an edit of the report passes', passes(edit), said(edit)],
        ['the latch still stands', readdirSync(w.latch).length === 1, readdirSync(w.latch).join(',')],
      ]);
    },
  },
  {
    name: 'hold 2 (latch): P-536: with a latch standing an agent writes the report of a first, a second and a third send, named for the step, the send\'s number and -report.txt, and every write passes',
    guards: ['lg_report_second_send'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Do the next thing. Go.')]);
      const popup = w.run(dir, call('AskUserQuestion', { questions: [] }, tr));
      const write = (name) => w.run(dir, call('Write', { file_path: `${SCRATCH}/progress/${name}`, content: 'DONE\nThe wall line.' }, tr, { agent_id: 'ag1' }));
      const first = write('step-1-report.txt');
      const second = write('step-1-2-report.txt');
      const third = write('step-1-3-report.txt');
      const note = write('step-1-2.txt');
      return h.assertAll([
        ['the latch stands', popup.status === 2 && readdirSync(w.latch).length === 1, said(popup)],
        ['the report of the first send passes', passes(first), said(first)],
        ['the report of the second send passes', passes(second), said(second)],
        ['the report of the third send passes', passes(third), said(third)],
        ['the progress note of the second send passes', passes(note), said(note)],
      ]);
    },
  },
  {
    name: 'hold 2 (latch): P-491: a call to enter plan mode passes with nothing printed and no latch when the permission mode the harness reports is already plan, under a go message and under a correction',
    guards: ['pm_enter_plan'],
    run(m, dir, h) {
      const w = world(h);
      const goTr = h.transcript([typed(h, 0, 'Do the next thing. Go.')]);
      const corrTr = h.transcript([typed(h, 0, 'Ok but change the plan first.')]);
      const inPlanGo = w.run(dir, call('EnterPlanMode', {}, goTr, { permission_mode: 'plan' }));
      const inPlanCorr = w.run(dir, call('EnterPlanMode', {}, corrTr, { permission_mode: 'plan' }));
      const inPlanTwice = w.run(dir, call('EnterPlanMode', {}, goTr, { permission_mode: 'plan' }));
      const files = readdirSync(w.latch);
      const next = w.run(dir, call('Bash', { command: 'ls' }, goTr));
      return h.assertAll([
        ['an entry in plan mode under a go message passes with nothing printed', passes(inPlanGo), said(inPlanGo)],
        ['an entry in plan mode under a correction passes', passes(inPlanCorr), said(inPlanCorr)],
        ['a second entry in plan mode passes', passes(inPlanTwice), said(inPlanTwice)],
        ['no latch file was written', files.length === 0, files.join(',')],
        ['a main-thread Bash after them passes', passes(next), said(next)],
      ]);
    },
  },
  {
    name: 'hold 3 (manager): P-158: a read-only Bash of a run in progress passes on the main thread: a tail of its output, a cat, a listing, a process list, a wait and a tail, a git log, and a read of its task output',
    guards: ['mg_check_in'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Go.')]);
      const out = '/tmp/claude-0/dp-proj/tasks/bk7x3q9zd.output';
      const main = (command) => w.run(dir, call('Bash', { command }, tr, { cwd: join(w.launch, 'repo') }));
      const rows = [
        ['a tail of the output file', main(`tail -n 40 ${out}`)],
        ['a tail of a file in the scratchpad', main(`tail -n 40 ${SCRATCH}/run.out`)],
        ['a cat piped to a count', main(`cat ${out} | wc -l`)],
        ['a listing of the task folder', main('ls -la /tmp/claude-0/dp-proj/tasks')],
        ['a process list searched', main('ps -ef | grep session-guards')],
        ['a wait and a tail', main(`sleep 30 && tail -n 5 ${out}`)],
        ['a git log of the repository', main('git log --oneline -3')],
        ['a stderr merged into the output', main(`tail -n 5 ${out} 2>&1`)],
      ];
      const taskOut = w.run(dir, call('TaskOutput', { task_id: 'bk7x3q9zd', block: false }, tr));
      const taskList = w.run(dir, call('TaskList', {}, tr));
      return h.assertAll([
        ...rows.map(([k, r]) => [`${k} passes`, passes(r), said(r)]),
        ['a read of the task output passes', passes(taskOut), said(taskOut)],
        ['a task list passes', passes(taskList), said(taskList)],
        ['the hold is live: a redirect into the repository is still refused', held(w.run(dir, call('Bash', { command: 'echo hi > out.txt' }, tr, { cwd: join(w.launch, 'repo') })), /MANAGER DOES NO WORK/), 'redirect'],
      ]);
    },
  },
  {
    name: 'hold 3 (manager): P-581: the main thread\'s read of the hub\'s configuration, code and cost record passes the manager hold, by Read, Grep, Glob and Bash',
    guards: ['mg_reads_of_record'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Go.')]);
      const settings = join(w.home, '.claude', 'settings.json');
      const code = join(dir, 'hook-dispatch.mjs');
      const cost = join(w.home, '.claude', 'projects', 'dp-proj', 'dp-session.jsonl');
      const main = (command) => w.run(dir, call('Bash', { command }, tr, { cwd: w.launch }));
      const rows = [
        ['a Read of the configuration', w.run(dir, call('Read', { file_path: settings }, tr))],
        ['a Read of the code', w.run(dir, call('Read', { file_path: code }, tr))],
        ['a Read of the cost record', w.run(dir, call('Read', { file_path: cost }, tr))],
        ['a Grep over the code', w.run(dir, call('Grep', { pattern: 'holdManager', path: dir }, tr))],
        ['a Grep over the cost record', w.run(dir, call('Grep', { pattern: 'usage', path: cost }, tr))],
        ['a Glob of the code folder', w.run(dir, call('Glob', { pattern: '*.mjs', path: dir }, tr))],
        ['a Bash cat of the configuration', main(`cat ${settings}`)],
        ['a Bash grep of the code', main(`grep -n holdManager ${code}`)],
        ['a Bash read of the cost record by the cost script', main(`node ${join(dir, 'session-cost.mjs')} ${cost}`)],
        ['a Bash head of the cost record', main(`head -c 400 ${cost}`)],
      ];
      return h.assertAll(rows.map(([k, r]) => [`${k} passes with nothing printed`, passes(r), said(r)]));
    },
  },
  {
    name: 'hold 2 (latch): a popup refusal latches, a later main-thread Bash is refused with the first refusal repeated, a read and TaskStop pass, an agent is not held, and a message typed after it clears it',
    guards: ['hy_latch', 'hl_popup','hl_repeat', 'hl_reads', 'hl_clear', 'hl_agent_free'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Do the next thing. Go.')]);
      const popup = w.run(dir, call('AskUserQuestion', { questions: [] }, tr));
      const files = readdirSync(w.latch);
      const next = w.run(dir, call('Bash', { command: 'ls' }, tr));
      const read = w.run(dir, call('Read', { file_path: '/x' }, tr));
      const stopTask = w.run(dir, call('TaskStop', { task_id: 'bk7x3q9zd' }, tr));
      const agent = w.run(dir, call('Bash', { command: 'ls' }, tr, { agent_id: 'ag1' }));
      const cleared = h.transcript([typed(h, 0, 'Do the next thing. Go.'), h.at(typed(h, 1, 'Ok, carry on with the plan.'), h.later(120))]);
      const after = w.run(dir, call('Bash', { command: 'ls' }, cleared));
      return h.assertAll([
        ['the popup is refused and a latch file is written', popup.status === 2 && files.length === 1, said(popup) + files.join(',')],
        ['a later Bash is refused as the latch, repeating the first refusal and saying the next message lifts it', held(next, /REFUSAL LATCH: .*until the next typed message.*CHOICE POPUP REFUSED/s), said(next)],
        ['the latch refusal carries its Why sentence', /Why: another route to the same end puts the session's judgement above the control that refused it\./.test(next.stderr), said(next)],
        ['a Read and the main thread\'s TaskStop pass', passes(read) && passes(stopTask), said(read) + said(stopTask)],
        ['an agent\'s Bash is not held by the main thread\'s latch', passes(agent), said(agent)],
        ['a message typed after the latch clears it and the call passes', passes(after), said(after)],
        ['the latch file is gone', readdirSync(w.latch).length === 0, readdirSync(w.latch).join(',')],
      ]);
    },
  },
  {
    name: 'hold 2 (latch): a push guard denial latches the main thread, a repository hook\'s refusal latches it, an agent\'s refusal latches nothing, and a refusal of hold 1 or hold 3 latches nothing',
    guards: ['hl_push', 'hl_repo', 'hl_agent_none', 'hl_hold_none'],
    run(m, dir, h) {
      const tr = h.transcript([typed(h, 0, 'Do the next thing. Go.')]);
      const stopTr = h.transcript([typed(h, 0, 'Please stop.')]);
      const a = world(h);
      const push = a.run(dir, { ...bash('git push origin claude/work', a.launch, tr), session_id: 'dp-session' });
      const afterPush = a.run(dir, call('Bash', { command: 'ls' }, tr));
      const b = world(h);
      const p = planted(h, { PreToolUse: [{ matcher: '.*', hooks: [shim('refuse.sh')] }] }, 'repo', b.launch);
      script(p.repo, 'refuse.sh', 'echo "planted repository refusal" >&2\nexit 2');
      const repo = b.run(dir, call('Bash', { command: 'ls' }, tr));
      const afterRepoBash = b.run(dir, call('Bash', { command: 'ls' }, tr));
      const c = world(h);
      const agentPopup = c.run(dir, call('AskUserQuestion', { questions: [] }, tr, { agent_id: 'ag1' }));
      const agentPush = c.run(dir, { ...bash('git push origin claude/work', c.launch, tr), agent_id: 'ag1' });
      const afterAgent = c.run(dir, call('Bash', { command: 'ls' }, tr));
      const d = world(h);
      const byStop = d.run(dir, call('Bash', { command: 'ls' }, stopTr));
      const byMgr = d.run(dir, call('Bash', { command: 'git commit -m x' }, tr));
      const afterHolds = d.run(dir, call('Bash', { command: 'ls' }, tr));
      return h.assertAll([
        ['the push guard\'s denial is returned', push.status === 2 && /PUSH GATE/.test(push.stderr), said(push)],
        ['and the next main-thread Bash is refused by the latch, with the push refusal repeated', held(afterPush, /REFUSAL LATCH: .*PUSH GATE/s), said(afterPush)],
        ['a repository hook\'s refusal is returned', held(repo, /planted repository refusal/), said(repo)],
        ['and the latch holds the next Bash and repeats it', held(afterRepoBash, /REFUSAL LATCH: .*planted repository refusal/s), said(afterRepoBash)],
        ['an agent\'s popup and push refusals are returned', agentPopup.status === 2 && agentPush.status === 2, said(agentPopup) + said(agentPush)],
        ['and write no latch: the main thread\'s Bash passes', passes(afterAgent) && readdirSync(c.latch).length === 0, said(afterAgent) + readdirSync(c.latch).join(',')],
        ['a stop refusal and a manager refusal are returned', byStop.status === 2 && byMgr.status === 2, said(byStop) + said(byMgr)],
        ['and write no latch: a later Bash passes', passes(afterHolds) && readdirSync(d.latch).length === 0, said(afterHolds) + readdirSync(d.latch).join(',')],
      ]);
    },
  },
  {
    name: 'hold 3 (manager): the main thread\'s Edit of a repository file, git commit, a redirect into the repository, sed -i and tee are refused, and the same three from an agent pass',
    guards: ['hy_manager', 'hm_edit','hm_git', 'hm_redirect', 'hm_sedtee', 'hm_agent'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Go.')]);
      const repoDir = join(w.launch, 'repo');
      const main = (command) => w.run(dir, call('Bash', { command }, tr, { cwd: repoDir }));
      const agent = (command) => w.run(dir, call('Bash', { command }, tr, { cwd: repoDir, agent_id: 'ag1' }));
      const edit = w.run(dir, call('Edit', { file_path: w.repoFile, old_string: 'a', new_string: 'b' }, tr));
      const write = w.run(dir, call('Write', { file_path: w.repoFile, content: 'x' }, tr));
      const multi = w.run(dir, call('MultiEdit', { file_path: w.repoFile, edits: [] }, tr));
      const nb = w.run(dir, call('NotebookEdit', { notebook_path: join(repoDir, 'n.ipynb'), new_source: 'x' }, tr));
      const commit = main('git commit -m done');
      const addC = main('git -C /somewhere/else add .');
      const chained = main('ls && echo ok | git rebase main');
      const nested = main('bash -c "git reset --hard"');
      const subst = main('echo $(git stash)');
      const branchNew = main('git branch newname');
      const branchDel = main('git branch -D oldname');
      const redirect = main('echo hi > out.txt');
      const redirectAbs = main(`echo hi >> ${repoDir}/out.txt`);
      const redirectAmp = main('ls &> out.txt');
      const redirectFd = main('echo hi 2> err.txt');
      const sed = main('sed -i s/a/b/ file.txt');
      const sedE = main('sed -i.bak -e s/a/b/ file.txt');
      const tee = main('echo hi | tee out.txt');
      const edits = { edit, write, multi, nb };
      const ok = Object.entries(edits).every(([, r]) => held(r, /MANAGER DOES NO WORK: .*main thread manages and a worker does the step/));
      const bashHeld = { commit, addC, chained, nested, subst, branchNew, branchDel, redirect, redirectAbs, redirectAmp, redirectFd, sed, sedE, tee };
      const agentEdit = w.run(dir, call('Edit', { file_path: w.repoFile, old_string: 'a', new_string: 'b' }, tr, { agent_id: 'ag1' }));
      const agentCommit = agent('git commit -m done');
      const agentRedirect = agent('echo hi > out.txt');
      return h.assertAll([
        ['Edit, Write, MultiEdit and NotebookEdit of a repository file are refused with the words', ok, Object.entries(edits).map(([k, r]) => `${k}:${r.status}:${r.stderr.slice(0, 60)}`).join(' | ')],
        ...Object.entries(bashHeld).map(([k, r]) => [`the main thread's ${k} is refused`, held(r, /MANAGER DOES NO WORK: /), said(r)]),
        ['the refusal names the git subcommand', /git commit/.test(commit.stderr), said(commit)],
        ['the manager refusal carries its Why sentence', /Why: the top tier is paid for judgement, and the cheapest tier that holds the rules does the rest\./.test(commit.stderr), said(commit)],
        ['an agent\'s Edit of a repository file passes', passes(agentEdit), said(agentEdit)],
        ['an agent\'s git commit passes', passes(agentCommit), said(agentCommit)],
        ['an agent\'s redirect into the repository passes', passes(agentRedirect), said(agentRedirect)],
      ]);
    },
  },
  {
    name: 'hold 3 (manager): what passes on the main thread: reads, git reads, listings, /dev/null, a file descriptor, the scratchpad, a plan file',
    guards: ['hm_devnull', 'hm_scratch', 'hm_listing', 'hm_plan'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Go.')]);
      const main = (command) => w.run(dir, call('Bash', { command }, tr, { cwd: w.launch }));
      const rows = [
        ['git status', main('git status')], ['git log -3', main('git log -3 --oneline')], ['git diff', main('git diff --stat')],
        ['git stash list', main('git stash list')], ['git branch', main('git branch')], ['git branch -a', main('git branch -a')], ['git tag -l', main('git tag -l')],
        ['dev null', main('echo x > /dev/null')], ['fd', main('node -v 2>&1')], ['fd to stderr', main('echo x >&2')],
        ['scratchpad redirect', main(`echo hi > ${w.scratch}`)], ['scratchpad tee', main(`echo hi | tee ${w.scratch}`)], ['scratchpad sed', main(`sed -i s/a/b/ ${w.scratch}`)],
        ['a quoted arrow', main('echo "a > b"')], ['node code with a comparison', main('node -e "console.log(2 > 1)"')], ['a commit message naming git commit', main('echo "git commit is held" | wc -w')],
        ['git as an argument', main('echo git commit')],
      ];
      const planW = w.run(dir, call('Write', { file_path: w.plan, content: 'x' }, tr));
      const scratchW = w.run(dir, call('Edit', { file_path: w.scratch, old_string: 'a', new_string: 'b' }, tr));
      const nested = w.run(dir, call('Write', { file_path: join(w.home, '.claude', 'plans', 'sub', 'p.md'), content: 'x' }, tr));
      return h.assertAll([
        ...rows.map(([k, r]) => [`${k} passes`, passes(r), said(r)]),
        ['a plan file directly under the plans folder passes', passes(planW), said(planW)],
        ['a file in the scratchpad passes', passes(scratchW), said(scratchW)],
        ['a file in a folder below the plans folder is refused', held(nested, /MANAGER DOES NO WORK/), said(nested)],
      ]);
    },
  },
  {
    name: 'holds: a hold that throws passes the call and prints one line to the error output, and does not stop the other holds',
    guards: ['hx_catch'],
    run(m, dir, h) {
      const w = world(h);
      const stopTr = h.transcript([typed(h, 0, 'Please stop.')]);
      const goTr = h.transcript([typed(h, 0, 'Go.')]);
      const lines = (r) => r.stderr.split('\n').filter(Boolean);
      const word = w.run(dir, call('Bash', { command: 'ls' }, stopTr), { HOOK_DISPATCH_THROW: 'word' });
      const wordMgr = w.run(dir, call('Bash', { command: 'git commit -m x' }, stopTr), { HOOK_DISPATCH_THROW: 'word' });
      const w2 = world(h);
      w2.run(dir, call('AskUserQuestion', { questions: [] }, goTr));
      const latch = w2.run(dir, call('Bash', { command: 'ls' }, goTr), { HOOK_DISPATCH_THROW: 'latch' });
      const mgr = w.run(dir, call('Bash', { command: 'git commit -m x' }, goTr), { HOOK_DISPATCH_THROW: 'manager' });
      const mgrRead = w.run(dir, call('Read', { file_path: '/x' }, goTr), { HOOK_DISPATCH_THROW: 'manager' });
      return h.assertAll([
        ['a stop hold that throws lets the Bash pass with one line', word.status === 0 && lines(word).length === 1 && /the typed word hold failed and let the call pass/.test(word.stderr), said(word)],
        ['and the manager hold still judges the call', held(wordMgr, /MANAGER DOES NO WORK/), said(wordMgr)],
        ['a latch hold that throws lets the Bash pass with one line', latch.status === 0 && lines(latch).length === 1 && /the latch hold failed and let the call pass/.test(latch.stderr), said(latch)],
        ['a manager hold that throws lets the git commit pass with one line', mgr.status === 0 && lines(mgr).length === 1 && /the manager hold failed and let the call pass/.test(mgr.stderr), said(mgr)],
        ['a read is never refused', mgrRead.status === 0, said(mgrRead)],
      ]);
    },
  },
  {
    name: 'dispatch Stop: on the main thread stop-guard.mjs of this folder runs exactly once with the payload on its input, with no shim in any repository and with two, and its refusal is returned; an agent\'s Stop does not run it',
    guards: ['hs_run', 'hs_once', 'hs_refuse'],
    run(m, dir, h) {
      const log = join(h.tmp('dp-log-'), 'runs.txt');
      const stub = (code) => `import { appendFileSync, readFileSync } from 'node:fs';\nconst p = JSON.parse(readFileSync(0, 'utf8'));\nappendFileSync(${JSON.stringify(log)}, p.hook_event_name + '\\n');\n${code}\n`;
      const runs = () => (existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter(Boolean).length : 0);
      const refusing = hubCopy(h, dir, [], { 'stop-guard.mjs': stub("process.stderr.write('planted stop refusal\\n'); process.exit(2);") });
      const none = disp(h, refusing, 'Stop', { transcript_path: '/nowhere' });
      const afterNone = runs();
      const hooks = { Stop: [{ matcher: '', hooks: [shim('stop-guard.sh'), shim('stop-guard.sh')] }] };
      const launch = h.tmp('dp-launch-');
      planted(h, hooks, 'one', launch);
      planted(h, hooks, 'two', launch);
      const two = disp(h, refusing, 'Stop', { transcript_path: '/nowhere' }, { launch });
      const afterTwo = runs();
      const agent = disp(h, refusing, 'Stop', { transcript_path: '/nowhere', agent_id: 'ag1' });
      const afterAgent = runs();
      const clean = hubCopy(h, dir, [], { 'stop-guard.mjs': stub('process.exit(0);') });
      const quiet = disp(h, clean, 'Stop', { transcript_path: '/nowhere' }, { launch });
      const afterQuiet = runs();
      return h.assertAll([
        ['with no shim anywhere it ran once, with the Stop payload, and its refusal came back as exit 2 with its words', none.status === 2 && /planted stop refusal/.test(none.stderr) && afterNone === 1, said(none) + afterNone],
        ['with two repositories naming the shim four times it ran once more and its refusal came back', two.status === 2 && /planted stop refusal/.test(two.stderr) && afterTwo - afterNone === 1, said(two) + (afterTwo - afterNone)],
        ['an agent\'s Stop does not run it from here', agent.status === 0 && afterAgent === afterTwo, said(agent)],
        ['a stop guard that passes, with the shim named four times, ran once, not twice or five times, and leaves the stop through with nothing printed', passes(quiet) && afterQuiet - afterAgent === 1, said(quiet) + (afterQuiet - afterAgent)],
      ]);
    },
  },
  {
    name: 'hold 0 (read): a start whose transcript holds no read of the three standing pages refuses a main-thread Bash, Edit and Agent send with the pages named, passes reads, an agent, and sets no latch; reading all three whole lifts it',
    guards: ['rd_hold', 'rd_agent', 'rd_reads', 'rd_why', 'rd_no_latch', 'rd_lift', 'rd_taskstop'],
    run(m, dir, h) {
      const w = world(h);
      const hub = pagedHub(h, dir);
      const start = h.transcript([typed(h, 0, 'Do the next thing. Go.')]);
      const bashR = reading(w, hub, call('Bash', { command: 'ls' }, start));
      const edit = reading(w, hub, call('Write', { file_path: w.scratch, content: 'x' }, start));
      const send = reading(w, hub, call('Agent', { prompt: 'x' }, start));
      const read = reading(w, hub, call('Read', { file_path: join(hub, STANDING[0]) }, start));
      const grep = reading(w, hub, call('Grep', { pattern: 'x', path: hub }, start));
      const agentBash = reading(w, hub, call('Bash', { command: 'ls' }, start, { agent_id: 'ag1' }));
      const stopMain = reading(w, hub, call('TaskStop', { task_id: 'bk7x3q9zd' }, start));
      const files = readdirSync(w.latch);
      const read3 = h.transcript([typed(h, 0, 'Do the next thing. Go.'), ...readAllThree(h, 1, hub)]);
      const lifted = reading(w, hub, call('Bash', { command: 'ls' }, read3));
      const lines = (r) => r.stderr.split('\n').filter(Boolean).length;
      return h.assertAll([
        ['a main-thread Bash is refused with the name in capitals, what passes, and what lifts it', held(bashR, /^STANDING PAGES UNREAD: .*may only read.*Only reads pass, and TaskStop on the main thread; an agent's calls are not held.*Read each in full.*lift/s), said(bashR)],
        ['the refusal names each of the three pages with its path in the hub copy and its lines', STANDING.every((rel) => bashR.stderr.includes(`${hub}/${rel} (every line, ${PAGE_LINES[rel]} lines)`)), said(bashR)],
        ['the refusal carries its Why sentence', /Why: every other rule rests on the standing pages, because a session that has not read the rules cannot follow them\./.test(bashR.stderr), said(bashR)],
        ['a write and an Agent send are refused by it too', held(edit, /STANDING PAGES UNREAD/) && held(send, /STANDING PAGES UNREAD/), said(edit) + said(send)],
        ['a Read and a Grep pass with nothing printed', passes(read) && passes(grep), said(read) + said(grep)],
        ['an agent\'s Bash is not held by it', passes(agentBash), said(agentBash)],
        ['the main thread\'s TaskStop passes with nothing printed, so a session can always stop what it started', passes(stopMain), said(stopMain)],
        ['no latch was written', files.length === 0 && lines(bashR) === 1, files.join(',')],
        ['after the three pages are read whole a Bash passes with nothing printed', passes(lifted), said(lifted)],
      ]);
    },
  },
  {
    name: 'hold 0 (read): what counts as read whole: parts that between them cover every line, the line numbers in the text alone, a read in a hub checkout beneath the launch folder; and what counts for nothing: part of a page, an errored result, a total from other text, a copy that is not the hub\'s',
    guards: ['rd_partial', 'rd_stale', 'rd_error', 'rd_other_copy', 'rd_numlines', 'rd_text_form', 'rd_checkout'],
    run(m, dir, h) {
      const w = world(h);
      const hub = pagedHub(h, dir);
      const base = [typed(h, 0, 'Go.')];
      const [pg, nv, hb] = STANDING;
      const last = (rel) => PAGE_LINES[rel] + 1;
      const others = (skip) => STANDING.flatMap((rel, k) => (rel === skip ? [] : readAll(h, 10 + k * 2, `o${k}`, hub, rel)));
      const check = (extra) => reading(w, hub, call('Bash', { command: 'ls' }, h.transcript([...base, ...extra])));
      const parts = check([...readOf(h, 1, 'a1', join(hub, hb), hb, 1, 3), ...readOf(h, 3, 'a2', join(hub, hb), hb, 4, last(hb)), ...others(hb)]);
      const textOnly = check(STANDING.flatMap((rel, k) => readAll(h, 1 + k * 2, `t${k}`, hub, rel, { form: 'text' })));
      const partial = check([...readOf(h, 1, 'p1', join(hub, nv), nv, 1, 3), ...others(nv)]);
      const stale = check([...readAll(h, 1, 's1', hub, nv, { total: 40 }), ...others(nv)]);
      const errored = check([...readAll(h, 1, 'e1', hub, pg, { isError: true }), ...others(pg)]);
      const elsewhere = h.tmp('dp-else-');
      mkdirSync(join(elsewhere, 'plans', 'native'), { recursive: true });
      writeFileSync(join(elsewhere, pg), pageRows(pg).join('\n') + '\n');
      const copyRead = check([...readAll(h, 1, 'c1', elsewhere, pg), ...others(pg)]);
      // A hub checkout beneath the launch folder: a folder with its own .git and the dispatcher's file and the doctrine's index.
      const launch = h.tmp('dp-launch-');
      const co = join(launch, 'hubcopy');
      mkdirSync(join(co, '.git'), { recursive: true });
      mkdirSync(join(co, 'plans', 'native'), { recursive: true });
      mkdirSync(join(co, 'doctrine'), { recursive: true });
      for (const f of ['hook-dispatch.mjs', 'DOCTRINE.md']) writeFileSync(join(co, f), 'planted\n');
      for (const rel of STANDING) writeFileSync(join(co, rel), pageRows(rel).join('\n') + '\n');
      const atCheckout = disp(h, hub, 'PreToolUse', call('Bash', { command: 'ls' }, h.transcript([...base, ...readAllThree(h, 1, co)])), { launch, env: { HOOK_DISPATCH_READ_HOLD: 'on' } });
      return h.assertAll([
        ['a page read in two parts that between them cover every line counts', passes(parts), said(parts)],
        ['a result with line numbers in its text and no record of its own counts', passes(textOnly), said(textOnly)],
        ['part of a page leaves it due, and the refusal names that page alone', held(partial, /STANDING PAGES UNREAD: .*never\.md/s) && !/page\.md|doctrine\/hub\.md/.test(partial.stderr), said(partial)],
        ['a result whose total is not the page\'s now counts for nothing', held(stale, /STANDING PAGES UNREAD: .*never\.md/s), said(stale)],
        ['an errored result counts for nothing', held(errored, /STANDING PAGES UNREAD: .*page\.md/s), said(errored)],
        ['a copy of a page that is not in a hub counts for nothing', held(copyRead, /STANDING PAGES UNREAD: .*page\.md/s), said(copyRead)],
        ['a read of the pages in a hub checkout beneath the launch folder counts', passes(atCheckout), said(atCheckout)],
      ]);
    },
  },
  {
    name: 'hold 0 (read): the read is due again after a compaction, a read after it lifts it again, a resumed transcript is judged by the same reads since its last start or compaction, and a transcript that cannot be read or whose pages cannot be found leaves the call through',
    guards: ['rd_compaction', 'rd_unknown'],
    run(m, dir, h) {
      const w = world(h);
      const hub = pagedHub(h, dir);
      const before = h.transcript([typed(h, 0, 'Go.'), ...readAllThree(h, 1, hub)]);
      const after = h.transcript([typed(h, 0, 'Go.'), ...readAllThree(h, 1, hub), ...compaction(h, 20), typed(h, 22, 'Carry on. Go.')]);
      const again = h.transcript([typed(h, 0, 'Go.'), ...readAllThree(h, 1, hub), ...compaction(h, 20), typed(h, 22, 'Carry on. Go.'), ...readAllThree(h, 30, hub)]);
      const call1 = (tr) => reading(w, hub, call('Bash', { command: 'ls' }, tr));
      const resumed = call1(before);
      const compacted = call1(after);
      const lifted = call1(again);
      const noFile = call1(join(h.tmp('dp-nofile-'), 'nothing.jsonl'));
      const bare = reading(w, hub, { tool_name: 'Bash', tool_input: { command: 'ls' } });
      const bareHub = hubCopy(h, dir);
      const noPages = reading(w, bareHub, call('Bash', { command: 'ls' }, after));
      return h.assertAll([
        ['a transcript with the three reads since its start passes, a resumed one too', passes(resumed), said(resumed)],
        ['after a compaction the pages are due again and a Bash is refused', held(compacted, /STANDING PAGES UNREAD/), said(compacted)],
        ['reading them after the compaction lifts it', passes(lifted), said(lifted)],
        ['a transcript file that does not exist leaves the call through, with nothing printed', passes(noFile), said(noFile)],
        ['a call with no transcript leaves the call through', passes(bare), said(bare)],
        ['a hub copy that holds none of the pages leaves the call through', passes(noPages), said(noPages)],
      ]);
    },
  },
  {
    name: 'hold 1 (waiting): a typed message with the word stop still waiting in the queue holds a main-thread Bash and an agent\'s Edit, the refusal says a message is waiting and prints it word for word, reads and the main thread\'s TaskStop pass, and no latch is set',
    guards: ['wq_hold', 'wq_stop_text', 'wq_print', 'wq_why'],
    run(m, dir, h) {
      const w = world(h);
      const said1 = 'Please stop the build now, and wait for me.';
      const tr = h.transcript([typed(h, 0, 'Go.'), h.tool(1, 'b1', 'Bash', { command: 'ls' }), h.result(2, 'b1', 'clean'), enqueue(h, 5, said1)]);
      const bashR = w.run(dir, call('Bash', { command: 'ls' }, tr));
      const agentEdit = w.run(dir, call('Edit', { file_path: '/x/y.txt', old_string: 'a', new_string: 'b' }, tr, { agent_id: 'ag1' }));
      const read = w.run(dir, call('Read', { file_path: '/x/y.txt' }, tr));
      const stopTask = w.run(dir, call('TaskStop', { task_id: 'bk7x3q9zd' }, tr));
      const exitPlan = w.run(dir, call('ExitPlanMode', {}, tr));
      return h.assertAll([
        ['a main-thread Bash is refused, opening MESSAGE WAITING, with what passes and what lifts it', held(bashR, /^MESSAGE WAITING: .*not yet delivered.*Only reads pass, TaskStop.*go, ok, continue, approved, yes.*approval of a plan at the button/s), said(bashR)],
        ['the refusal prints the waiting message word for word', bashR.stderr.includes(`--- message 1 of 1 ---\n${said1}\n--- end ---`), said(bashR)],
        ['the refusal carries its Why sentence', /Why: a message that waits in the queue while a turn runs is not seen by the session, so without the hold the work goes on over it and it is never answered\./.test(bashR.stderr), said(bashR)],
        ['an agent\'s Edit is refused by it too', held(agentEdit, /MESSAGE WAITING/), said(agentEdit)],
        ['a Read and the main thread\'s TaskStop pass, and ExitPlanMode is refused', passes(read) && passes(stopTask) && held(exitPlan, /MESSAGE WAITING/), said(read) + said(exitPlan) + said(stopTask)],
        ['no latch was written', readdirSync(w.latch).length === 0, readdirSync(w.latch).join(',')],
      ]);
    },
  },
  {
    name: 'hold 1 (waiting): a typed message with no go-word still waiting in the queue holds new starts as a delivered one does, prints itself, and passes Bash, a plan file in plan mode and the scratchpad; an agent is not held; and a waiting go message lifts nothing',
    guards: ['wq_correction', 'wq_new_text', 'wq_nolift', 'hw_agent_free'],
    run(m, dir, h) {
      const w = world(h);
      const said1 = 'Change the plan first, and drop the third step.';
      const tr = h.transcript([typed(h, 0, 'Go.'), enqueue(h, 5, said1)]);
      const send = w.run(dir, call('Agent', { prompt: 'x' }, tr));
      const edit = w.run(dir, call('Edit', { file_path: w.repoFile, old_string: 'a', new_string: 'b' }, tr));
      const bashR = w.run(dir, call('Bash', { command: 'ls' }, tr));
      const planW = w.run(dir, call('Write', { file_path: w.plan, content: 'x' }, tr, { permission_mode: 'plan' }));
      const scratchW = w.run(dir, call('Write', { file_path: w.scratch, content: 'x' }, tr));
      const agentSend = w.run(dir, call('Agent', { prompt: 'x' }, tr, { agent_id: 'ag1' }));
      // a delivered correction, then a go message that is still waiting: the session has not seen the go, so the correction stands
      const goWaits = h.transcript([typed(h, 0, 'Ok but change the plan first.'), enqueue(h, 5, 'Fine, carry on with it. Go.')]);
      const stillHeld = w.run(dir, call('Agent', { prompt: 'x' }, goWaits));
      const stopThenGo = h.transcript([typed(h, 0, 'Please stop.'), enqueue(h, 5, 'Fine, ok')]);
      const stopHeld = w.run(dir, call('Bash', { command: 'ls' }, stopThenGo));
      return h.assertAll([
        ['an Agent send is refused, opening MESSAGE WAITING, with what is held, what passes and what lifts it', held(send, /^MESSAGE WAITING: .*not yet delivered.*starts nothing new.*Reads, Bash, plan mode set in the app and the button pass.*go, ok, continue, approved, yes.*approval of a plan at the button/s), said(send)],
        ['it prints the waiting message word for word', send.stderr.includes(`--- message 1 of 1 ---\n${said1}\n--- end ---`), said(send)],
        ['a repository Edit is refused by it', held(edit, /MESSAGE WAITING/), said(edit)],
        ['a Bash passes', passes(bashR), said(bashR)],
        ['a plan file written in plan mode and a scratchpad file pass', passes(planW) && passes(scratchW), said(planW) + said(scratchW)],
        ['an agent already running is not held', passes(agentSend), said(agentSend)],
        ['a go message still waiting lifts no correction: the Agent send is held, and the refusal prints the go message', held(stillHeld, /MESSAGE WAITING/) && stillHeld.stderr.includes('Fine, carry on with it. Go.'), said(stillHeld)],
        ['a go message still waiting lifts no stop: a Bash is held', held(stopHeld, /MESSAGE WAITING/), said(stopHeld)],
        ['no latch was written', readdirSync(w.latch).length === 0, readdirSync(w.latch).join(',')],
      ]);
    },
  },
  {
    name: 'hold 1 (waiting): a message the session has been given, one the queue let go of, a worker\'s hand-back and a task notification waiting in the queue, one overtaken by a message typed after it that arrived, and a waiting go message alone hold nothing',
    guards: ['wq_delivered', 'wq_count', 'wq_harness', 'wq_given', 'hw_correction_lift'],
    run(m, dir, h) {
      const w = world(h);
      const stopText = 'Please stop the build now.';
      const run1 = (entries, tool = 'Bash') => w.run(dir, call(tool, tool === 'Agent' ? { prompt: 'x' } : { command: 'ls' }, h.transcript(entries)));
      // delivered between tool calls: its words arrive as the attachment and the queue removes it; the delivered stop holds, as a delivered one, not as a waiting one
      const absorbedStop = run1([typed(h, 0, 'Go.'), enqueue(h, 5, stopText), absorbed(h, 6, stopText), removed(h, 6, stopText)]);
      // delivered, and the queue never logged its release: the count says it still waits, and its words say it arrived
      const arrivedNoLog = run1([typed(h, 0, 'Go.'), enqueue(h, 5, stopText), absorbed(h, 5, stopText)]);
      // the queue let go of it (a dequeue) and no delivery carries its words, as a slash command is delivered
      const letGo = run1([typed(h, 0, 'Go.'), enqueue(h, 5, stopText), dequeue(h, 6)]);
      const handBackQ = run1([typed(h, 0, 'Go.'), enqueue(h, 5, '<agent-message from="worker-one">\n[Subagent hand-back] DONE\nThe hook said stop and the step ended there.\n</agent-message>')]);
      const noticeQ = run1([typed(h, 0, 'Go.'), enqueue(h, 5, '<task-notification> the task was stopped, stop </task-notification>')]);
      // a waiting stop that a later-typed message, delivered, has overtaken
      const overtaken = run1([typed(h, 0, 'Go.'), enqueue(h, 5, 'Please stop the work.'), enqueue(h, 6, 'Fine, ok'), dequeue(h, 7), typed(h, 8, 'Fine, ok')]);
      // a go message waiting alone, after a delivered go: no correction, nothing to hold
      const goAlone = run1([typed(h, 0, 'Go.'), enqueue(h, 5, 'Carry on with the next one. Go.')], 'Agent');
      const empty = run1([typed(h, 0, 'Go.'), enqueue(h, 5, '   ')]);
      return h.assertAll([
        ['a stop delivered as an attachment and removed from the queue holds as a delivered stop, not as a waiting message', held(absorbedStop, /^STOP: /) && !/MESSAGE WAITING/.test(absorbedStop.stderr), said(absorbedStop)],
        ['a stop whose words arrived while the queue still counts it holds as a delivered stop, not as a waiting message', held(arrivedNoLog, /^STOP: /) && !/MESSAGE WAITING/.test(arrivedNoLog.stderr), said(arrivedNoLog)],
        ['an enqueue the queue let go of with a dequeue holds nothing', passes(letGo), said(letGo)],
        ['a worker\'s hand-back waiting in the queue holds nothing, though it carries the word stop', passes(handBackQ), said(handBackQ)],
        ['a task notification waiting in the queue holds nothing', passes(noticeQ), said(noticeQ)],
        ['a waiting stop overtaken by a later message that arrived holds nothing', passes(overtaken), said(overtaken)],
        ['a go message waiting alone starts no hold', passes(goAlone), said(goAlone)],
        ['an empty message waiting holds nothing', passes(empty), said(empty)],
      ]);
    },
  },
  {
    name: 'hold 4 (approved page): a write of a plan file on the main thread outside plan mode is refused with the words, in plan mode it passes, and where the call does not say its mode, for an agent, for a read and for a file outside the plans folder it is not held by this hold',
    guards: ['pl_hold', 'pl_plan_mode', 'pl_unknown', 'pl_agent', 'pl_why', 'pl_scope', 'pl_no_latch'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Go.')]);
      const outside = (tool, input, mode, extra = {}) => w.run(dir, call(tool, input, tr, { permission_mode: mode, ...extra }));
      const write = outside('Write', { file_path: w.plan, content: 'x' }, 'default');
      const edit = outside('Edit', { file_path: w.plan, old_string: 'a', new_string: 'b' }, 'auto');
      const multi = outside('MultiEdit', { file_path: w.plan, edits: [] }, 'acceptEdits');
      const nb = outside('NotebookEdit', { notebook_path: w.plan, new_source: 'x' }, 'bypassPermissions');
      const tilde = outside('Write', { file_path: '~/.claude/plans/p.md', content: 'x' }, 'default');
      const files = readdirSync(w.latch);
      const inPlan = outside('Write', { file_path: w.plan, content: 'x' }, 'plan');
      const inPlanEdit = outside('Edit', { file_path: w.plan, old_string: 'a', new_string: 'b' }, 'plan');
      const noMode = w.run(dir, call('Write', { file_path: w.plan, content: 'x' }, tr));
      const emptyMode = outside('Write', { file_path: w.plan, content: 'x' }, '');
      const agent = outside('Write', { file_path: w.plan, content: 'x' }, 'default', { agent_id: 'ag1' });
      const read = outside('Read', { file_path: w.plan }, 'default');
      const scratch = outside('Write', { file_path: w.scratch, content: 'x' }, 'default');
      const repoOutside = outside('Write', { file_path: w.repoFile, content: 'x' }, 'default');
      const repoInPlan = outside('Write', { file_path: w.repoFile, content: 'x' }, 'plan');
      const thrown = w.run(dir, call('Write', { file_path: w.plan, content: 'x' }, tr, { permission_mode: 'default' }), { HOOK_DISPATCH_THROW: 'plan' });
      return h.assertAll([
        ['a Write of a plan file outside plan mode is refused, opening its name, with what passes and what lifts it', held(write, /^PLAN FILE WRITE OUTSIDE PLAN MODE: .*unless the call is made in plan mode, where the button follows.*Reads, an agent's calls.*Entering plan mode lifts it/s), said(write)],
        ['the refusal carries its Why sentence', /Why: an approved page is changed only by a change that is written and approved, and the button follows only in plan mode, so a write outside it puts work under a page nobody approved\./.test(write.stderr), said(write)],
        ['an Edit, a MultiEdit and a NotebookEdit of a plan file outside plan mode are refused too, in each mode the harness has', held(edit, /PLAN FILE WRITE OUTSIDE PLAN MODE/) && held(multi, /PLAN FILE WRITE OUTSIDE PLAN MODE/) && held(nb, /PLAN FILE WRITE OUTSIDE PLAN MODE/), said(edit) + said(multi) + said(nb)],
        ['a path written with the tilde is the same folder', held(tilde, /PLAN FILE WRITE OUTSIDE PLAN MODE/), said(tilde)],
        ['no latch was written', files.length === 0, files.join(',')],
        ['in plan mode a Write and an Edit of a plan file pass with nothing printed', passes(inPlan) && passes(inPlanEdit), said(inPlan) + said(inPlanEdit)],
        ['where the call does not say its mode the write passes, as before (the harness has not told the mode)', passes(noMode) && passes(emptyMode), said(noMode) + said(emptyMode)],
        ['an agent\'s write of a plan file passes', passes(agent), said(agent)],
        ['a Read of a plan file passes', passes(read), said(read)],
        ['a write in the scratchpad outside plan mode passes', passes(scratch), said(scratch)],
        ['a repository file is still refused by the manager hold, in plan mode and outside it', held(repoOutside, /MANAGER DOES NO WORK/) && held(repoInPlan, /MANAGER DOES NO WORK/), said(repoOutside) + said(repoInPlan)],
        ['a plan file hold that throws passes the write with one line to the error output', thrown.status === 0 && thrown.stdout === '' && thrown.stderr.split('\n').filter(Boolean).length === 1 && /the plan file hold failed and let the call pass/.test(thrown.stderr), said(thrown)],
      ]);
    },
  },
  {
    name: 'hold 6 (run tier): on the main thread a send is refused while a top-tier model serves, with the line that puts the thread a tier lower; a model command after the newest reply is read; an agent, a read and an unknown model pass',
    guards: ['rt_hold', 'rt_agent', 'rt_command', 'rt_line', 'rt_no_latch'],
    run(m, dir, h) {
      const w = world(h);
      const send = (entries, extra = {}, tool = 'Agent') => w.run(dir, call(tool, { prompt: 'x', description: 'x' }, h.transcript(entries), extra));
      const fableTr = h.transcript([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-fable-5-2')]);
      const fable = w.run(dir, call('Agent', { prompt: 'x', description: 'x' }, fableTr));
      const afterRefusal = w.run(dir, call('Bash', { command: 'ls' }, fableTr));
      const files = readdirSync(w.latch);
      const opus = send([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-opus-5-5')]);
      const fableThenOpus = send([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-fable-5-2'), modelCommand(h, 2, 'claude-opus-5-5')]);
      const opusThenFable = send([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-opus-5-5'), modelCommand(h, 2, 'claude-fable-5-2')]);
      const agent = w.run(dir, call('Agent', { prompt: 'x', description: 'x' }, fableTr, { agent_id: 'ag1' }));
      const read = w.run(dir, call('Read', { file_path: '/x' }, fableTr));
      const none = send([typed(h, 0, 'Go.')]);
      const synthetic = send([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-fable-5-2'), modelReply(h, 2, '<synthetic>')]);
      return h.assertAll([
        ['with the newest reply from a fable model an Agent send exits 2 with RUN WAITS FOR ITS TIER, the model and the line', held(fable, /^RUN WAITS FOR ITS TIER: .*claude-fable-5-2.*newest reply.*\/model claude-opus-5-5/s), said(fable)],
        ['a Bash read after the refusal passes, so no latch was set', passes(afterRefusal) && files.length === 0, said(afterRefusal) + files.join(',')],
        ['with an opus reply the send passes', passes(opus), said(opus)],
        ['with a fable reply and a model command to opus after it the send passes', passes(fableThenOpus), said(fableThenOpus)],
        ['with an opus reply and a model command to fable after it the send is refused', held(opusThenFable, /RUN WAITS FOR ITS TIER/), said(opusThenFable)],
        ['an agent\'s own call passes', passes(agent), said(agent)],
        ['a Read passes', passes(read), said(read)],
        ['a transcript with no reply passes', passes(none), said(none)],
        ['a synthetic reply is skipped, so the fable reply before it still serves', held(synthetic, /RUN WAITS FOR ITS TIER/), said(synthetic)],
      ]);
    },
  },
  {
    name: 'hold 8 (send tier): on the main thread an Agent or Task send naming a model above sonnet is refused, and one naming sonnet, haiku or none passes',
    guards: ['st_hold', 'st_sonnet', 'st_task', 'st_agent'],
    run(m, dir, h) {
      const w = world(h);
      const tr = h.transcript([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-opus-5-5')]);
      const named = (tool, model, extra = {}) => w.run(dir, call(tool, { prompt: 'x', description: 'x', ...(model === undefined ? {} : { model }) }, tr, extra));
      const opus = named('Agent', 'opus');
      const afterRefusal = w.run(dir, call('Bash', { command: 'ls' }, tr));
      const files = readdirSync(w.latch);
      const fable = named('Agent', 'claude-fable-5-2');
      const taskOpus = named('Task', 'opus');
      const sonnet = named('Agent', 'sonnet');
      const haiku = named('Agent', 'haiku');
      const none = named('Agent', undefined);
      const agent = named('Agent', 'opus', { agent_id: 'ag1' });
      return h.assertAll([
        ['an Agent send naming opus exits 2 with SEND NAMES A HIGHER TIER and says the roles carry their tier', held(opus, /^SEND NAMES A HIGHER TIER: .*roles carry their tier.*no model named/s), said(opus)],
        ['a Bash read after the refusal passes, so no latch was set', passes(afterRefusal) && files.length === 0, said(afterRefusal) + files.join(',')],
        ['one naming fable is refused', held(fable, /SEND NAMES A HIGHER TIER/), said(fable)],
        ['a Task send naming opus is refused', held(taskOpus, /SEND NAMES A HIGHER TIER/), said(taskOpus)],
        ['one naming sonnet passes', passes(sonnet), said(sonnet)],
        ['one naming haiku passes', passes(haiku), said(haiku)],
        ['one naming no model passes', passes(none), said(none)],
        ['an agent\'s own call passes', passes(agent), said(agent)],
      ]);
    },
  },
  {
    name: 'hold 9 (eject): after a hand-back that opens EJECT a send is refused with the record\'s words until an approval later than the record; DONE, FAILED and REFUSED hold nothing; an agent is not held',
    guards: ['ej_record', 'ej_mark', 'ej_hold', 'ej_lift', 'ej_agent'],
    run(m, dir, h) {
      const base = Date.parse('2026-10-01T12:00:00Z');
      const record = (w, atMs, text) => {
        mkdirSync(join(w.home, '.claude', 'eject'), { recursive: true });
        writeFileSync(join(w.home, '.claude', 'eject', 'dp-session.json'), JSON.stringify({ at: atMs, text }));
      };
      const recordPath = (w) => join(w.home, '.claude', 'eject', 'dp-session.json');
      const opusTr = h.transcript([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-opus-5-5')]);
      const send = (w, tr, extra = {}) => w.run(dir, call('Agent', { prompt: 'x', description: 'x' }, tr, extra));
      const handBackCall = (w, message) => w.run(dir, call('SubagentHandback', { message }, opusTr, { agent_id: 'ag1' }));
      const wStop = world(h);
      const backStop = handBackCall(wStop, 'EJECT. The step met a file it did not name.');
      const sentStop = send(wStop, opusTr);
      const afterRefusal = wStop.run(dir, call('Bash', { command: 'ls' }, opusTr));
      const filesStop = readdirSync(wStop.latch);
      const wBare = world(h);
      handBackCall(wBare, 'EJECT\nThe step met another thing.');
      const sentBare = send(wBare, opusTr);
      const quiet = ['DONE', 'FAILED', 'REFUSED'].map((word) => { const w = world(h); const b = handBackCall(w, `${word}\nAll as asked.`); return { b, sent: send(w, opusTr), there: existsSync(recordPath(w)) }; });
      const wLater = world(h);
      record(wLater, base + 5000, 'EJECT. Planted record.');
      const laterTr = h.transcript([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-opus-5-5'), ...approval(h, 10, 'ap1')]);
      const sentLater = send(wLater, laterTr);
      const wEarlier = world(h);
      record(wEarlier, base + 50000, 'EJECT. Planted record.');
      const earlierTr = h.transcript([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-opus-5-5'), ...approval(h, 3, 'ap1')]);
      const sentEarlier = send(wEarlier, earlierTr);
      const wAgent = world(h);
      record(wAgent, base + 5000, 'EJECT. Planted record.');
      const agentSend = send(wAgent, opusTr, { agent_id: 'ag1' });
      return h.assertAll([
        ['a hand-back that opens EJECT and a full stop passes unchanged and writes the session\'s record', passes(backStop) && existsSync(recordPath(wStop)), said(backStop)],
        ['then a main-thread Agent send exits 2 with A STEP EJECTED and the record\'s words, and names no model command', held(sentStop, /^A STEP EJECTED: EJECT\. The step met a file it did not name\..*plan mode.*button/s) && !/\/model/.test(sentStop.stderr), said(sentStop)],
        ['a Bash read after the refusal passes, so no latch was set', passes(afterRefusal) && filesStop.length === 0, said(afterRefusal) + filesStop.join(',')],
        ['a hand-back that opens EJECT with no mark after it holds the next send too', held(sentBare, /^A STEP EJECTED: EJECT\nThe step met another thing/), said(sentBare)],
        ...quiet.map((q, k) => [`a hand-back that opens ${['DONE', 'FAILED', 'REFUSED'][k]} writes no record and holds nothing`, passes(q.b) && passes(q.sent) && !q.there, said(q.b) + said(q.sent)]),
        ['with an approval later than the record the send passes and the record is gone', passes(sentLater) && !existsSync(recordPath(wLater)), said(sentLater)],
        ['with an approval earlier than the record the send is still refused', held(sentEarlier, /A STEP EJECTED/) && existsSync(recordPath(wEarlier)), said(sentEarlier)],
        ['the agent that ejected is not held by its own record', passes(agentSend), said(agentSend)],
      ]);
    },
  },
  {
    name: 'hold 9 (eject, the button): with a record standing ExitPlanMode is refused where the newest plan file lacks the part, and passes where it holds it; with none standing it passes',
    guards: ['ej_page', 'ej_page_all', 'ej_newest', 'ej_page_scope'],
    run(m, dir, h) {
      const base = Date.parse('2026-10-01T12:00:00Z');
      const GOOD = '# A page\n\n## Why it stopped\n\n- What was met. A thing.\n- Why the page was drawn that way. A reason.\n- How far it reaches. Far.\n';
      const GOOD_PLAIN = '# A page\n\n## Why it stopped\n\nWhat was met: a thing.\nWhy the page was drawn that way: a reason.\nHow far it reaches: far.\n';
      const tr = h.transcript([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-fable-5-2')]);
      const exit = (standing, files) => {
        const w = world(h);
        mkdirSync(join(w.home, '.claude', 'plans'), { recursive: true });
        if (standing) { mkdirSync(join(w.home, '.claude', 'eject'), { recursive: true }); writeFileSync(join(w.home, '.claude', 'eject', 'dp-session.json'), JSON.stringify({ at: base + 5000, text: 'EJECT. Planted.' })); }
        let t = 1000;
        for (const [name, body] of files) { const f = join(w.home, '.claude', 'plans', name); writeFileSync(f, body); utimesSync(f, new Date(Date.UTC(2026, 9, 1) + (t += 1000)), new Date(Date.UTC(2026, 9, 1) + t)); }
        const r = w.run(dir, call('ExitPlanMode', { plan: 'x' }, tr, { permission_mode: 'plan' }));
        return { r, after: w.run(dir, call('Bash', { command: 'ls' }, tr)), latch: readdirSync(w.latch) };
      };
      const lacks = exit(true, [['p.md', '# A page\n\nNothing about a cause.\n']]);
      const good = exit(true, [['p.md', GOOD]]);
      const plain = exit(true, [['p.md', GOOD_PLAIN]]);
      const none = exit(false, [['p.md', '# A page\n\nNothing about a cause.\n']]);
      const noHeading = exit(true, [['p.md', '# A page\n\n- What was met. a\n- Why the page was drawn that way. b\n- How far it reaches. c\n']]);
      const onlyOne = exit(true, [['p.md', '# A page\n\n## Why it stopped\n\n- What was met. a\n']]);
      const newestLacks = exit(true, [['z.md', GOOD], ['a.md', '# Newest\n\nNo cause here.\n']]);
      const newestGood = exit(true, [['z.md', '# Older\n\nNo cause here.\n'], ['a.md', GOOD]]);
      return h.assertAll([
        ['with a record standing and a plan file lacking the part ExitPlanMode exits 2 with THE PAGE DOES NOT OPEN WITH ITS CAUSE, the heading and the three openings', held(lacks.r, /^THE PAGE DOES NOT OPEN WITH ITS CAUSE: .*Why it stopped.*What was met.*Why the page was drawn that way.*How far it reaches/s), said(lacks.r)],
        ['a Bash read after the refusal passes, so no latch was set', passes(lacks.after) && lacks.latch.length === 0, said(lacks.after) + lacks.latch.join(',')],
        ['where the file holds the heading and the three openings with a hyphen it passes', passes(good.r), said(good.r)],
        ['where the openings stand without a hyphen it passes', passes(plain.r), said(plain.r)],
        ['with no record standing it passes whatever the file holds', passes(none.r), said(none.r)],
        ['a file with the three openings and no heading is refused', held(noHeading.r, /THE PAGE DOES NOT OPEN WITH ITS CAUSE/), said(noHeading.r)],
        ['a file with the heading and one opening is refused', held(onlyOne.r, /THE PAGE DOES NOT OPEN WITH ITS CAUSE/), said(onlyOne.r)],
        ['the newest file counts: where it lacks the part the button is refused though an older file holds it', held(newestLacks.r, /THE PAGE DOES NOT OPEN WITH ITS CAUSE/), said(newestLacks.r)],
        ['where the newest file holds the part the button passes though an older one lacks it', passes(newestGood.r), said(newestGood.r)],
      ]);
    },
  },
  {
    name: 'hold 10 (walk): where the checker\'s role says what a walk is, the button waits for a checker that walked the page as it stands, and on the top tier the checker sent a page\'s path and the word walk passes in plan mode',
    guards: ['wk_hold', 'wk_scope', 'wk_scope_text', 'wk_word', 'wk_agent', 'wk_send', 'wk_send_word', 'wk_send_eject', 'wk_send_type', 'wk_send_mode', 'wk_send_place'],
    run(m, dir, h) {
      const PAGE = '# A page\n\nOne step.\n';
      const base = Date.parse('2026-10-01T12:00:00Z');
      const idOf = (file) => spawnSync('git', ['hash-object', file], { encoding: 'utf8', timeout: 60000 }).stdout.trim();
      const walked = (typedText, first, final = false) => {
        const tr = h.transcript([typed(h, 0, typedText), modelReply(h, 1, 'claude-fable-5-2')]);
        if (first === undefined) return tr;
        const subs = join(tr.slice(0, -'.jsonl'.length), 'subagents');
        mkdirSync(subs, { recursive: true });
        const end = final
          ? [{ type: 'assistant', timestamp: h.ts(30), message: { role: 'assistant', content: [{ type: 'text', text: `${first}\nNo gap was met.` }] } }]
          : [h.tool(20, 'k-h', 'SubagentHandback', { message: `${first}\nNo gap was met.` }), h.result(21, 'k-h', 'Report delivered to your caller.')];
        const body = [h.turn(1, 'Walk the page.'), h.tool(2, 'k-b', 'Bash', { command: 'git hash-object /x/p.md' }), h.result(3, 'k-b', 'printed'), ...end];
        writeFileSync(join(subs, 'agent-k1.jsonl'), body.map((e) => JSON.stringify(e)).join('\n') + '\n');
        writeFileSync(join(subs, 'agent-k1.meta.json'), JSON.stringify({ agentType: 'checker', description: 'Walk the page' }));
        return tr;
      };
      const press = (o = {}) => {
        const w = world(h);
        mkdirSync(join(w.home, '.claude', 'plans'), { recursive: true });
        writeFileSync(w.plan, PAGE);
        utimesSync(w.plan, new Date(Date.UTC(2026, 9, 1)), new Date(Date.UTC(2026, 9, 1)));
        if (o.role !== false) { mkdirSync(join(w.launch, '.claude', 'agents'), { recursive: true }); writeFileSync(join(w.launch, '.claude', 'agents', 'checker.md'), o.role === 'plain' ? 'A planted role that speaks of no such send.\n' : 'A planted role: where the words sent are a page\'s path and the word walk, the page is walked.\n'); }
        const id = idOf(w.plan);
        const tr = walked(o.typed ?? 'Draw the page. Go.', o.first === undefined ? undefined : o.first.replace('ID', id), o.final);
        const r = w.run(dir, call('ExitPlanMode', { plan: 'x' }, tr, { permission_mode: 'plan', ...(o.extra ?? {}) }));
        return { r, id, after: w.run(dir, call('Bash', { command: 'ls' }, tr)), latch: readdirSync(w.latch) };
      };
      const none = press();
      const clear = press({ first: 'CHECK PASS ID' });
      const finalText = press({ first: 'CHECK PASS ID', final: true });
      const other = press({ first: `CHECK PASS ${'0'.repeat(40)}` });
      const failed = press({ first: 'CHECK FAIL ID' });
      const noRole = press({ role: false });
      const plainRole = press({ role: 'plain' });
      const word = press({ typed: 'Put the page up without a walk. Go.' });
      const agent = press({ extra: { agent_id: 'ag1' } });
      const goTr = h.transcript([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-fable-5-2')]);
      const corrTr = h.transcript([typed(h, 0, 'Draw the page.'), modelReply(h, 1, 'claude-fable-5-2')]);
      const w = world(h);
      const send = (input, tr = goTr, mode = 'plan', wd = w) => wd.run(dir, call('Agent', { description: 'x', ...input }, tr, { permission_mode: mode }));
      const walk = { subagent_type: 'checker', prompt: `${w.plan} walk` };
      const walkGo = send(walk);
      const walkCorr = send(walk, corrTr);
      const worker = send({ subagent_type: 'worker', prompt: `${w.plan} walk` });
      const noWord = send({ subagent_type: 'checker', prompt: `${w.plan} step 1` });
      const elsewhere = send({ subagent_type: 'checker', prompt: `${w.repoFile} walk` });
      const notPlan = send(walk, goTr, 'auto');
      const wE = world(h);
      mkdirSync(join(wE.home, '.claude', 'eject'), { recursive: true });
      writeFileSync(join(wE.home, '.claude', 'eject', 'dp-session.json'), JSON.stringify({ at: base + 5000, text: 'EJECT. Planted.' }));
      const walkEject = send({ subagent_type: 'checker', prompt: `${wE.plan} walk` }, goTr, 'plan', wE);
      const workerEject = send({ subagent_type: 'worker', prompt: `${wE.plan} step 1` }, goTr, 'plan', wE);
      return h.assertAll([
        ['with no walk the button exits 2 with THE PAGE HAS NOT BEEN WALKED, the page\'s content id and the words of the send', held(none.r, /^THE PAGE HAS NOT BEEN WALKED: /) && none.r.stderr.includes(none.id) && /p\.md walk/.test(none.r.stderr), said(none.r)],
        ['a Bash read after the refusal passes, so no latch was set', passes(none.after) && none.latch.length === 0, said(none.after) + none.latch.join(',')],
        ['after a checker\'s hand-back that opens CHECK PASS and the id of the page as it stands the button passes', passes(clear.r), said(clear.r)],
        ['the same words as the final message of a checker that ended without a hand-back pass too', passes(finalText.r), said(finalText.r)],
        ['a pass that names another id is refused', held(other.r, /THE PAGE HAS NOT BEEN WALKED/), said(other.r)],
        ['CHECK FAIL for the page is refused', held(failed.r, /THE PAGE HAS NOT BEEN WALKED/), said(failed.r)],
        ['in a launch folder that holds no checker role the button passes', passes(noRole.r), said(noRole.r)],
        ['in a launch folder whose checker\'s role does not speak of a walk the button passes', passes(plainRole.r), said(plainRole.r)],
        ['where the newest typed message carries the words without a walk the button passes', passes(word.r), said(word.r)],
        ['an agent\'s own call passes', passes(agent.r), said(agent.r)],
        ['on the top tier in plan mode, after a go message, the checker sent a page\'s path and the word walk passes', passes(walkGo), said(walkGo)],
        ['the same send passes under a typed message with no go-word', passes(walkCorr), said(walkCorr)],
        ['the same words sent to another role are refused', held(worker, /RUN WAITS FOR ITS TIER/), said(worker)],
        ['the checker sent a page\'s path and other words is refused', held(noWord, /RUN WAITS FOR ITS TIER/), said(noWord)],
        ['the checker sent a path outside the plans folder is refused', held(elsewhere, /RUN WAITS FOR ITS TIER/), said(elsewhere)],
        ['outside plan mode the same send is refused', held(notPlan, /RUN WAITS FOR ITS TIER/), said(notPlan)],
        ['with an eject standing the walk still passes, and a worker\'s send is refused', passes(walkEject) && held(workerEject, /A STEP EJECTED/), said(walkEject) + said(workerEject)],
      ]);
    },
  },
  {
    name: 'hold 11 (decision): the button is refused with NO DECISION ON THIS PAGE unless the newest typed message ends with a go-word and was typed after the page\'s last write; a page written again after the go-word, a later message with no go-word and no typed message at all are refused; an agent, a folder with no page and another tool pass; no latch is set',
    guards: ['dc_listed', 'dc_agent', 'dc_tool', 'dc_nopage', 'dc_go', 'dc_after'],
    run(m, dir, h) {
      const DEC = /^NO DECISION ON THIS PAGE: no typed message that ends with a go-word has come after the page's last write, so nothing has been decided on the page as it stands\. Brief it: end this turn with one reply that says what the page does and why and asks nothing\. The button passes once a typed message that ends with a go-word has come after the page's last write\. Why: the decision is made on a brief of the page as it stands, and a go-word given before the page was written decided nothing about it\.\n?$/;
      const base = Date.parse('2026-10-01T12:00:00Z');
      const press = (o = {}) => {
        const w = world(h);
        mkdirSync(join(w.home, '.claude', 'plans'), { recursive: true });
        if (o.page !== false) {
          writeFileSync(w.plan, '# A page\n\nOne step.\n');
          if (o.again) { utimesSync(w.plan, new Date(base - 600000), new Date(base - 600000)); writeFileSync(w.plan, '# A page\n\nOne step, changed.\n'); }
          const at = new Date(base + (o.pageAt ?? -600) * 1000);
          utimesSync(w.plan, at, at);
        }
        const tr = h.transcript(o.entries ?? [typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-fable-5-2')]);
        const r = w.run(dir, call(o.tool ?? 'ExitPlanMode', o.tool === 'Bash' ? { command: 'ls' } : { plan: 'x' }, tr, { permission_mode: 'plan', ...(o.extra ?? {}) }));
        return { r, after: w.run(dir, call('Bash', { command: 'ls' }, tr)), latch: readdirSync(w.latch) };
      };
      const before = press({ pageAt: 500 });
      const after = press();
      const later = press({ entries: [typed(h, 0, 'Go.'), typed(h, 5, 'Draw it differently.'), modelReply(h, 6, 'claude-fable-5-2')] });
      const again = press({ again: true, pageAt: 500 });
      const goLast = press({ entries: [typed(h, 0, 'Draw it differently.'), typed(h, 5, 'Yes.'), modelReply(h, 6, 'claude-fable-5-2')] });
      const none = press({ entries: [modelReply(h, 1, 'claude-fable-5-2')] });
      const agent = press({ pageAt: 500, extra: { agent_id: 'ag1' } });
      const noPage = press({ page: false });
      const other = press({ pageAt: 500, tool: 'Bash' });
      return h.assertAll([
        ['where the page was written after the newest go-word the button exits 2 with block G1 word for word', held(before.r, DEC), said(before.r)],
        ['a Bash read after that refusal passes, so no latch was set', passes(before.after) && before.latch.length === 0, said(before.after) + before.latch.join(',')],
        ['where a go-word was typed after the page\'s last write the button passes', passes(after.r), said(after.r)],
        ['where a later typed message ends with no go-word the button is refused', held(later.r, DEC), said(later.r)],
        ['where the page was written again after the go-word the button is refused', held(again.r, DEC), said(again.r)],
        ['a go-word typed after an earlier message with none passes', passes(goLast.r), said(goLast.r)],
        ['with no typed message at all the button is refused', held(none.r, DEC), said(none.r)],
        ['an agent\'s own call passes', passes(agent.r), said(agent.r)],
        ['in a folder with no page the button passes', passes(noPage.r), said(noPage.r)],
        ['a call of another tool passes though the page is newer than the go-word', passes(other.r), said(other.r)],
      ]);
    },
  },
  {
    name: 'hold 6 (run tier, the top tier\'s run): on the top tier the hub\'s run script launched for a page that stands as it was approved passes, and a worker or a checker sent that page\'s path and a step passes only once the script has been launched for it; another script, a changed script, a page changed since its approval, no approval, plan mode and a path elsewhere are refused',
    guards: ['rn_send', 'rn_mode', 'rn_script', 'rn_script_same', 'rn_place', 'rn_text', 'rn_approval', 'rn_step_role', 'rn_step_words', 'rn_step_first', 'rn_step_after', 'rn_step_page', 'rn_what'],
    run(m, dir, h) {
      const PAGE = '# A page\n\nOne step.\n';
      const SCRIPT = 'planted run script\n';
      const hub = hubCopy(h, dir);
      mkdirSync(join(hub, 'plans', 'native'), { recursive: true });
      writeFileSync(join(hub, 'plans', 'native', 'run-page.js'), SCRIPT);
      const approved = (s, id, file, text) => [h.tool(s, id, 'ExitPlanMode', { plan: text }), { ...h.result(s + 1, id, 'User has approved your plan. You can now start coding. Start with updating your todo list if applicable'), toolUseResult: { plan: text, isAgent: false, filePath: file } }];
      const launchedFor = (s, id, scriptPath, page) => [h.tool(s, id, 'Workflow', { scriptPath, args: { page, steps: [{ n: 1, role: 'worker' }] } }), h.result(s + 1, id, 'Workflow launched in background.')];
      const make = (o = {}) => {
        const w = world(h);
        mkdirSync(join(w.home, '.claude', 'plans'), { recursive: true });
        if (o.missing !== true) writeFileSync(w.plan, o.now ?? PAGE);
        const other = join(w.home, '.claude', 'plans', 'q.md');
        writeFileSync(other, PAGE);
        const outside = join(w.launch, 'outside.md');
        writeFileSync(outside, PAGE);
        mkdirSync(join(w.launch, 'plans', 'native'), { recursive: true });
        const script = join(w.launch, 'plans', 'native', 'run-page.js');
        if (o.script !== false) writeFileSync(script, o.script ?? SCRIPT);
        const elsewhere = join(w.launch, 'another.js');
        writeFileSync(elsewhere, SCRIPT);
        const model = o.model ?? 'claude-fable-5-2';
        const entries = [typed(h, 0, 'Go.'), modelReply(h, 1, model),
          ...(o.before ? launchedFor(2, 'r0', script, w.plan) : []),
          ...(o.approval === false ? [] : approved(4, 'ap1', o.approvedFile === 'outside' ? outside : w.plan, PAGE)),
          ...(o.after ? launchedFor(6, 'r1', o.afterScript === 'elsewhere' ? elsewhere : script, o.afterFor === 'other' ? other : w.plan) : []),
          modelReply(h, 8, model)];
        const tr = h.transcript(entries);
        const launch = (input, mode = 'auto') => w.run(hub, call('Workflow', input, tr, { permission_mode: mode }));
        const send = (input, mode = 'auto') => w.run(hub, call('Agent', { description: 'x', ...input }, tr, { permission_mode: mode }));
        const args = (page) => ({ page, steps: [{ n: 1, role: 'worker' }] });
        return { w, launch, send, other, outside, script, elsewhere, args, tr };
      };
      const a = make();
      const run = a.launch({ scriptPath: a.script, args: a.args(a.w.plan) });
      const runFrom = a.launch({ scriptPath: a.script, args: { ...a.args(a.w.plan), from: 3 } });
      const runNoMode = a.w.run(hub, call('Workflow', { scriptPath: a.script, args: a.args(a.w.plan) }, a.tr));
      const runPlanMode = a.launch({ scriptPath: a.script, args: a.args(a.w.plan) }, 'plan');
      const runInline = a.launch({ script: 'export const meta = {}', args: a.args(a.w.plan) });
      const runElsewhere = a.launch({ scriptPath: a.elsewhere, args: a.args(a.w.plan) });
      const runNoPage = a.launch({ scriptPath: a.script, args: { steps: [] } });
      const runOther = a.launch({ scriptPath: a.script, args: a.args(a.other) });
      const stepFirst = a.send({ subagent_type: 'worker', prompt: `${a.w.plan} step 1` });
      const afterRefusal = a.w.run(hub, call('Bash', { command: 'ls' }, h.transcript([typed(h, 0, 'Go.'), modelReply(h, 1, 'claude-fable-5-2')])));
      const latch = readdirSync(a.w.latch);
      const changedScript = make({ script: 'another text\n' });
      const runChangedScript = changedScript.launch({ scriptPath: changedScript.script, args: changedScript.args(changedScript.w.plan) });
      const noScript = make({ script: false });
      const runNoScript = noScript.launch({ scriptPath: noScript.script, args: noScript.args(noScript.w.plan) });
      const out = make({ approvedFile: 'outside' });
      const runOutside = out.launch({ scriptPath: out.script, args: out.args(out.outside) });
      const changed = make({ now: PAGE + 'One more line.\n' });
      const runChanged = changed.launch({ scriptPath: changed.script, args: changed.args(changed.w.plan) });
      const none = make({ approval: false });
      const runNone = none.launch({ scriptPath: none.script, args: none.args(none.w.plan) });
      const gone = make({ missing: true });
      const runGone = gone.launch({ scriptPath: gone.script, args: gone.args(gone.w.plan) });
      const b = make({ after: true });
      const stepWorker = b.send({ subagent_type: 'worker', prompt: `${b.w.plan} step 1` });
      const stepChecker = b.send({ subagent_type: 'checker', prompt: `${b.w.plan} step 3` });
      const stepOtherRole = b.send({ subagent_type: 'general-purpose', prompt: `${b.w.plan} step 1` });
      const stepWords = b.send({ subagent_type: 'worker', prompt: `${b.w.plan} step 1 and more` });
      const stepPlanMode = b.send({ subagent_type: 'worker', prompt: `${b.w.plan} step 1` }, 'plan');
      const before = make({ before: true });
      const stepBefore = before.send({ subagent_type: 'worker', prompt: `${before.w.plan} step 1` });
      const forOther = make({ after: true, afterFor: 'other' });
      const stepForOther = forOther.send({ subagent_type: 'worker', prompt: `${forOther.w.plan} step 1` });
      const byOther = make({ after: true, afterScript: 'elsewhere' });
      const stepByOther = byOther.send({ subagent_type: 'worker', prompt: `${byOther.w.plan} step 1` });
      const opus = make({ model: 'claude-opus-5-5', approval: false });
      const opusAny = opus.launch({ script: 'x' });
      const refused = (r) => held(r, /^RUN WAITS FOR ITS TIER: /);
      return h.assertAll([
        ['on the top tier, outside plan mode, the hub\'s run script launched for a page that stands as it was approved passes', passes(run), said(run)],
        ['a launch from a later step passes too', passes(runFrom), said(runFrom)],
        ['where the call does not say its mode the launch passes', passes(runNoMode), said(runNoMode)],
        ['in plan mode the launch is refused', refused(runPlanMode), said(runPlanMode)],
        ['a script passed inline is refused, and the refusal names the three calls that pass', refused(runInline) && /Three calls pass on the top tier: in plan mode, the checker sent a page\'s path and the word walk; outside plan mode, the hub\'s run script launched with the Workflow tool for a page that stands as it was approved; and, once that script has been launched for the page, a worker or a checker sent the page\'s path, the word step and the step\'s number\./.test(runInline.stderr), said(runInline)],
        ['a Bash read after the refusal passes, so no latch was set', passes(afterRefusal) && latch.length === 0, said(afterRefusal) + latch.join(',')],
        ['another file with the same text is not the run script', refused(runElsewhere), said(runElsewhere)],
        ['a launch that names no page is refused', refused(runNoPage), said(runNoPage)],
        ['a page with no approval of its own is refused, though another page of the folder was approved', refused(runOther), said(runOther)],
        ['a run script whose text is not the live copy\'s launches nothing, and neither does a missing one', refused(runChangedScript) && refused(runNoScript), said(runChangedScript) + said(runNoScript)],
        ['a file outside the plans folder is refused though the transcript holds an approval of it', refused(runOutside), said(runOutside)],
        ['a page changed since its approval is refused', refused(runChanged), said(runChanged)],
        ['with no approval in the transcript the launch is refused', refused(runNone), said(runNone)],
        ['a page that is not there is refused', refused(runGone), said(runGone)],
        ['a step is refused while the script has not been launched for the page', refused(stepFirst), said(stepFirst)],
        ['once the script has been launched for the page, a worker and a checker sent its path and a step pass', passes(stepWorker) && passes(stepChecker), said(stepWorker) + said(stepChecker)],
        ['a step sent to another role, and one with words after its number, are refused', refused(stepOtherRole) && refused(stepWords), said(stepOtherRole) + said(stepWords)],
        ['a step in plan mode is refused', refused(stepPlanMode), said(stepPlanMode)],
        ['a launch before the newest approval does not count', refused(stepBefore), said(stepBefore)],
        ['a launch for another page does not count', refused(stepForOther), said(stepForOther)],
        ['a launch of another script does not count', refused(stepByOther), said(stepByOther)],
        ['a tier below the top is not held, whatever it launches', passes(opusAny), said(opusAny)],
      ]);
    },
  },
  {
    name: 'the run script (plans/native/run-page.js): it sends each step in order to the role named, on the sonnet tier, sends a FAILED step once more, stops at the first step that does not end as it should, and returns each step, what stopped it and every Found line',
    guards: [],
    async run(m, dir, h) {
      const src = readFileSync(join(dir, 'plans', 'native', 'run-page.js'), 'utf8');
      const body = src.slice(src.indexOf('phase(\'Run\')'));
      const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
      const S = [{ n: 1, role: 'worker' }, { n: 2, role: 'worker' }, { n: 3, role: 'checker' }];
      const go = async (answers, extra = {}) => {
        const calls = [];
        const agent = async (prompt, opts) => { calls.push({ prompt, opts }); const x = answers[calls.length - 1]; return x === undefined ? null : x; };
        const r = await new AsyncFunction('agent', 'phase', 'args', body)(agent, () => {}, { page: '/p.md', steps: S, ...extra });
        return { r, sent: calls.map((c) => `${c.prompt}|${c.opts.agentType}|${c.opts.model}`).join(' ; ') };
      };
      const done = await go(['DONE\nall', 'DONE\nFound: a thing left', 'CHECK PASS abc']);
      const again = await go(['FAILED\nred', 'DONE', 'DONE', 'CHECK PASS x']);
      const twice = await go(['FAILED\nred', 'FAILED\nred again', 'DONE']);
      const eject = await go(['DONE', 'EJECT\nnot foreseen', 'CHECK PASS x']);
      const checkFail = await go(['DONE', 'DONE', 'CHECK FAIL x\nfault']);
      const workerPass = await go(['CHECK PASS x']);
      const none = await go(['DONE', undefined]);
      const from = await go(['CHECK PASS x'], { from: 3 });
      const noWord = await go(['All good.']);
      const longer = await go(['DONEISH']);
      const stop = (x) => (x.r.stopped ? `${x.r.stopped.step}:${x.r.stopped.word}` : 'none');
      return h.assertAll([
        ['three steps that end as they should are sent in order, each to its role on the sonnet tier, and the run ends done', done.r.ended === 'done' && done.sent === '/p.md step 1|worker|sonnet ; /p.md step 2|worker|sonnet ; /p.md step 3|checker|sonnet', JSON.stringify(done)],
        ['a line an answer opens with Found is returned with its step', JSON.stringify(done.r.found) === JSON.stringify(['step 2: Found: a thing left']), JSON.stringify(done.r.found)],
        ['each step is returned with its word and its first line', JSON.stringify(done.r.steps[2]) === JSON.stringify({ step: 3, role: 'checker', word: 'CHECK PASS', first: 'CHECK PASS abc' }), JSON.stringify(done.r.steps)],
        ['a step that hands back FAILED is sent once more, and the run goes on where it then ends DONE', again.r.ended === 'done' && again.sent.split(' ; ').length === 4 && again.sent.startsWith('/p.md step 1|worker|sonnet ; /p.md step 1|worker|sonnet'), again.sent],
        ['a second FAILED stops the run at that step, with its whole answer', stop(twice) === '1:FAILED' && twice.sent.split(' ; ').length === 2 && twice.r.stopped.answer === 'FAILED\nred again', JSON.stringify(twice)],
        ['EJECT stops the run and nothing more is sent', stop(eject) === '2:EJECT' && eject.sent.split(' ; ').length === 2, JSON.stringify(eject)],
        ['CHECK FAIL stops the run', stop(checkFail) === '3:CHECK FAIL', JSON.stringify(checkFail)],
        ['CHECK PASS from a worker is not DONE and stops the run', stop(workerPass) === '1:CHECK PASS', JSON.stringify(workerPass)],
        ['no answer stops the run', stop(none) === '2:NO ANSWER', JSON.stringify(none)],
        ['a launch from step 3 sends only step 3', from.r.ended === 'done' && from.sent === '/p.md step 3|checker|sonnet', from.sent],
        ['an answer that opens with no word, or with a longer word, stops the run', stop(noWord) === '1:NO WORD' && stop(longer) === '1:NO WORD', JSON.stringify(noWord) + JSON.stringify(longer)],
      ]);
    },
  },
  {
    name: 'hold 1 (plan mode entry): the session\'s own EnterPlanMode is refused under a message with no go-word and under the word stop, passes after a go message and when the mode is already plan; ExitPlanMode is refused under the word stop and passes under no go-word; no latch is set',
    guards: ['wp_enter_none', 'wp_enter_mode', 'wp_enter_stop', 'wp_exit_stop'],
    run(m, dir, h) {
      const w = world(h);
      const corr = h.transcript([typed(h, 0, 'Ok but change the plan first.')]);
      const go = h.transcript([typed(h, 0, 'Draw the page now. Go.')]);
      const stop = h.transcript([typed(h, 0, 'Please stop everything right now.')]);
      const enterCorr = w.run(dir, call('EnterPlanMode', {}, corr, { permission_mode: 'auto' }));
      const enterCorrPlan = w.run(dir, call('EnterPlanMode', {}, corr, { permission_mode: 'plan' }));
      const enterGo = w.run(dir, call('EnterPlanMode', {}, go, { permission_mode: 'auto' }));
      const enterStop = w.run(dir, call('EnterPlanMode', {}, stop, { permission_mode: 'auto' }));
      const exitStop = w.run(dir, call('ExitPlanMode', {}, stop, { permission_mode: 'plan' }));
      const exitCorr = w.run(dir, call('ExitPlanMode', {}, corr, { permission_mode: 'plan' }));
      const bashAfter = w.run(dir, call('Bash', { command: 'ls' }, corr));
      return h.assertAll([
        ['under a message with no go-word EnterPlanMode with the mode auto exits 2 with NO PAGE WAS ASKED FOR', held(enterCorr, /^NO PAGE WAS ASKED FOR: .*go-word.*set in the app.*plain text/s), said(enterCorr)],
        ['with the mode plan it passes', passes(enterCorrPlan), said(enterCorrPlan)],
        ['after a message that ends with a go-word it passes', passes(enterGo), said(enterGo)],
        ['under the word stop it is refused with the stop text', held(enterStop, /^STOP: /), said(enterStop)],
        ['under the word stop ExitPlanMode is refused', held(exitStop, /^STOP: /), said(exitStop)],
        ['under a message with no go-word ExitPlanMode passes', passes(exitCorr), said(exitCorr)],
        ['a Bash after the refusals passes and no latch was written', passes(bashAfter) && readdirSync(w.latch).length === 0, said(bashAfter) + readdirSync(w.latch).join(',')],
      ]);
    },
  },
  {
    name: 'hold 1 (stop, plan file): under the word stop a Write of a plan file with the mode plan passes, the same with the mode auto is refused, and a Write of a repository file with the mode plan is refused',
    guards: ['wp_write_mode', 'wp_write_dir'],
    run(m, dir, h) {
      const w = world(h);
      const stop = h.transcript([typed(h, 0, 'Please stop everything right now.')]);
      const planOk = w.run(dir, call('Write', { file_path: w.plan, content: 'x' }, stop, { permission_mode: 'plan' }));
      const planAuto = w.run(dir, call('Write', { file_path: w.plan, content: 'x' }, stop, { permission_mode: 'auto' }));
      const repoPlan = w.run(dir, call('Write', { file_path: w.repoFile, content: 'x' }, stop, { permission_mode: 'plan' }));
      return h.assertAll([
        ['a Write of a plan file with the mode plan passes', passes(planOk), said(planOk)],
        ['the same Write with the mode auto is refused', held(planAuto, /^STOP: /), said(planAuto)],
        ['a Write of a repository file with the mode plan is refused', held(repoPlan, /^STOP: /), said(repoPlan)],
      ]);
    },
  },
  {
    name: 'hold 1 (stop, names): a message that says the stop hook, the stop hooks or stop-guard sets no stop and holds as a message with no go-word does; the word alone sets it, and so does a full stop between the word and the word hook',
    guards: ['wp_name_hook', 'wp_name_hooks', 'wp_name_guard'],
    run(m, dir, h) {
      const w = world(h);
      const run = (text, tool, input) => w.run(dir, call(tool, input, h.transcript([typed(h, 0, text)])));
      const hook = run('Please look at the stop hook.', 'Bash', { command: 'ls' });
      const hookSend = run('Please look at the stop hook.', 'Agent', { prompt: 'x' });
      const hooks = run('The stop hooks are odd.', 'Bash', { command: 'ls' });
      const guard = run('Read stop-guard.mjs for me.', 'Bash', { command: 'ls' });
      const alone = run('Stop', 'Bash', { command: 'ls' });
      const dotted = run('Stop. Hook it up later.', 'Bash', { command: 'ls' });
      return h.assertAll([
        ['the stop hook sets no stop: a Bash passes', passes(hook), said(hook)],
        ['it holds as a message with no go-word does: an Agent send is refused with NEW STARTS HELD', held(hookSend, /^NEW STARTS HELD/), said(hookSend)],
        ['the stop hooks sets no stop', passes(hooks), said(hooks)],
        ['stop-guard sets no stop', passes(guard), said(guard)],
        ['the word alone sets the stop', held(alone, /^STOP: /), said(alone)],
        ['a full stop between the word and the word hook sets the stop', held(dotted, /^STOP: /), said(dotted)],
      ]);
    },
  },
  {
    name: 'hold 0 (read): a read hold that throws passes the call with one line to the error output, and the other holds still judge it',
    guards: ['hx_catch'],
    run(m, dir, h) {
      const w = world(h);
      const hub = pagedHub(h, dir);
      const start = h.transcript([typed(h, 0, 'Please stop.')]);
      const plain = reading(w, hub, call('Bash', { command: 'ls' }, start));
      const thrown = w.run(hub, call('Bash', { command: 'ls' }, start), { HOOK_DISPATCH_READ_HOLD: 'on', HOOK_DISPATCH_THROW: 'read' });
      const lines = thrown.stderr.split('\n').filter(Boolean);
      return h.assertAll([
        ['with the read due and a stop standing the read hold speaks first', held(plain, /STANDING PAGES UNREAD/), said(plain)],
        ['with the read hold thrown the call is still held, by the stop, and one line says the read hold failed', held(thrown, /STOP: /) && lines.filter((l) => /the read hold failed and let the call pass/.test(l)).length === 1, said(thrown)],
      ]);
    },
  },
  {
    name: 'typed messages (filed): a start files every typed message whole under its heading with its California time, a prompt and one from the queue, and none of hook feedback, a notification, a hand-back, a slash command, a tool result or a compaction\'s summary; a compaction\'s print names the file and its count; an agent\'s start files none; a file that cannot be written is one line and no refusal',
    guards: ['rc_first', 'rc_whole', 'rc_typed', 'rc_queue', 'rc_time', 'rc_mkdir', 'rc_path', 'rc_print', 'rc_failline', 'rc_skipped'],
    run(m, dir, h) {
      const first = 'Plant first message.\nIts second line holds a ## mark that is no heading.';
      const queued = 'Plant queued message typed in the middle of a turn.';
      const third = 'Plant third message.';
      const fourth = 'Plant fourth message. Go.';
      const tmpRoot = h.tmp('dp-tmp-');
      const { record, file } = recallSession(h, tmpRoot, () => [
        typed(h, 0, first),
        h.turn(100, 'Stop hook feedback: planted feedback words'),
        handBack(h, 200, 'planted hand-back words'),
        modelCommand(h, 300, 'planted-model'),
        h.tool(500, 'rc-t', 'Bash', { command: 'ls' }), h.result(501, 'rc-t', 'planted tool result words'),
        { type: 'user', timestamp: h.ts(600), message: { role: 'user', content: '<task-notification>planted notification words</task-notification>' } },
        ...compaction(h, 700),
        enqueue(h, 3600, queued), absorbed(h, 3660, queued),
        typed(h, 51300, third),
        typed(h, 68400, fourth),
      ], { filed: false, sid: 'rc-session' });
      const payload = (source, extra = {}) => ({ source, transcript_path: record, session_id: 'rc-session', ...extra });
      const env = { env: { TMPDIR: tmpRoot } };
      const start = disp(h, dir, 'SessionStart', payload('startup'), env);
      const got = existsSync(file) ? readFileSync(file, 'utf8') : null;
      const expected = [RECALL_FIRST, '', '## 1. Oct 1, 05:00', '', first, '', '## 2. Oct 1, 06:00', '', queued, '', '## 3. Oct 1, 19:15', '', third, '', '## 4. Oct 2, 00:00', '', fourth, ''].join('\n');
      const compact = disp(h, dir, 'SessionStart', payload('compact'), env);
      const resume = disp(h, dir, 'SessionStart', payload('resume'), env);
      const agentRoot = h.tmp('dp-tmp-');
      const agentRec = recallSession(h, agentRoot, () => [typed(h, 0, first)], { filed: false, sid: 'rc-session' });
      const agent = disp(h, dir, 'SessionStart', { source: 'startup', transcript_path: agentRec.record, session_id: 'rc-session', agent_id: 'a1' }, { env: { TMPDIR: agentRoot } });
      const bareRoot = h.tmp('dp-tmp-');
      const bare = disp(h, dir, 'SessionStart', { source: 'compact', session_id: 'rc-session' }, { env: { TMPDIR: bareRoot } });
      const blocked = join(h.tmp('dp-tmp-'), 'not-a-folder');
      writeFileSync(blocked, 'a file where a folder is needed\n');
      const blockedRec = recallSession(h, blocked, () => [typed(h, 0, first)], { filed: false, sid: 'rc-session' });
      const failed = disp(h, dir, 'SessionStart', { source: 'compact', transcript_path: blockedRec.record, session_id: 'rc-session' }, { env: { TMPDIR: blocked } });
      const failLines = failed.stdout.split('\n').filter((l) => /^TYPED MESSAGES NOT FILED: /.test(l));
      return h.assertAll([
        ['a start with a transcript prints the one line and nothing else', start.status === 0 && start.stdout === `${pageLine(dir)}\n`, said(start)],
        ['the file stands in the session scratchpad and holds block A1, then each typed message whole under its heading with its California time', got === expected, `${file}\n${got}`],
        ['no hook feedback, notification, hand-back, slash command, tool result or summary is in it', got !== null && !/planted/.test(got), String(got)],
        ['a compaction start prints the one line, then one line that names the file by its full path and the count of messages', compact.status === 0 && compact.stdout.startsWith(`${pageLine(dir)}\n`) && compact.stdout.includes(`TYPED MESSAGES FILED: ${file} holds the 4 typed messages`) && compact.stdout.split('\n').filter(Boolean).length === 2, said(compact)],
        ['a resume prints the one line only', resume.status === 0 && resume.stdout === `${pageLine(dir)}\n`, said(resume)],
        ['an agent\'s start files nothing and prints nothing', agent.status === 0 && agent.stdout === '' && !existsSync(recallPath(agentRoot, agentRec.record, 'rc-session')), said(agent)],
        ['a start with no transcript prints the one line only and makes no folder', bare.status === 0 && bare.stdout === `${pageLine(dir)}\n` && readdirSync(bareRoot).length === 0, said(bare)],
        ['a file that cannot be written is one line that says so and why, with the one line before it, and the start exits 0', failed.status === 0 && failed.stdout.startsWith(`${pageLine(dir)}\n`) && failLines.length === 1 && /could not be written/.test(failLines[0]), said(failed)],
      ]);
    },
  },
  {
    name: 'hold 0 (read): after a compaction a main-thread call is refused until the file of the typed messages has been read whole, the refusal names its path and ends with its Why; a Read of it passes; nothing is held where the file is not there, with no compaction since, for an agent, or once it has been read after the compaction',
    guards: ['rc_hold', 'rc_live', 'rc_resume', 'rc_absent', 'rc_why_recall', 'rc_list', 'rc_head'],
    run(m, dir, h) {
      const w = world(h);
      const hub = pagedHub(h, dir);
      const tmpRoot = h.tmp('dp-tmp-');
      const pages = (s) => readAllThree(h, s, hub);
      const after = (more) => (file) => [typed(h, 0, 'Go.'), ...pages(1), ...compaction(h, 20), typed(h, 22, 'Carry on. Go.'), ...pages(30), ...more(file)];
      const bashOf = (s, extra = {}) => readingIn(w, hub, call('Bash', { command: 'ls' }, s.record, extra), tmpRoot);
      const due = recallSession(h, tmpRoot, after(() => []));
      const unread = bashOf(due);
      const readIt = readingIn(w, hub, call('Read', { file_path: due.file }, due.record), tmpRoot);
      const partial = recallSession(h, tmpRoot, after((f) => readFileOf(h, 40, 'rc-p', f, RECALL_LINES, { from: 1, to: 3 })));
      const whole = recallSession(h, tmpRoot, after((f) => readFileOf(h, 40, 'rc-w', f, RECALL_LINES)));
      const early = recallSession(h, tmpRoot, (f) => [typed(h, 0, 'Go.'), ...pages(1), ...readFileOf(h, 15, 'rc-e', f, RECALL_LINES), ...compaction(h, 20), typed(h, 22, 'Carry on. Go.'), ...pages(30)]);
      const resumed = recallSession(h, tmpRoot, () => [typed(h, 0, 'Go.'), ...pages(1)]);
      const absent = recallSession(h, tmpRoot, after(() => []), { filed: false });
      const both = recallSession(h, tmpRoot, () => [typed(h, 0, 'Go.'), ...compaction(h, 20), typed(h, 22, 'Carry on. Go.')]);
      const bothR = bashOf(both);
      return h.assertAll([
        ['with the pages read after a compaction and the file not, a Bash is refused with the name in capitals and what passes', held(unread, /^TYPED MESSAGES UNREAD: .*may only read.*Only reads pass, and TaskStop on the main thread; an agent's calls are not held.*lift/s) && !/STANDING PAGES UNREAD/.test(unread.stderr), said(unread)],
        ['the refusal names the file by its full path with its lines', unread.stderr.includes(`${due.file} (every line, ${RECALL_LINES.length} lines)`), said(unread)],
        ['the refusal ends with the Why of block A2', unread.stderr.trim().endsWith(RECALL_WHY), said(unread)],
        ['a Read of the file passes with nothing printed, and no latch was written', passes(readIt) && readdirSync(w.latch).length === 0, said(readIt) + readdirSync(w.latch).join(',')],
        ['part of the file read after the compaction leaves it due', held(bashOf(partial), /^TYPED MESSAGES UNREAD/), said(bashOf(partial))],
        ['the whole of it read after the compaction lifts it', passes(bashOf(whole)), said(bashOf(whole))],
        ['a read of it before the compaction counts for nothing', held(bashOf(early), /^TYPED MESSAGES UNREAD/), said(bashOf(early))],
        ['with no compaction since, as at a resume, nothing is held for the file', passes(bashOf(resumed)), said(bashOf(resumed))],
        ['where the file is not there nothing is held', passes(bashOf(absent)), said(bashOf(absent))],
        ['an agent\'s Bash is not held by it', passes(bashOf(due, { agent_id: 'ag1' })), said(bashOf(due, { agent_id: 'ag1' }))],
        ['with the pages unread as well the one refusal names the pages and the file, and ends with block A2', held(bothR, /^STANDING PAGES UNREAD: .*the standing pages and the file of its typed messages/s) && bothR.stderr.includes(`${both.file} (every line, ${RECALL_LINES.length} lines)`) && bothR.stderr.trim().endsWith(RECALL_WHY), said(bothR)],
      ]);
    },
  },
  {
    name: 'hold 0 (read): after a compaction more than two megabytes back the file of the typed messages is still due, and a whole read of it lifts it',
    guards: ['rc_unsure'],
    run(m, dir, h) {
      const w = world(h);
      const hub = pagedHub(h, dir);
      const tmpRoot = h.tmp('dp-tmp-');
      const big = (more) => (file) => [typed(h, 0, 'Go.'), ...compaction(h, 20), typed(h, 22, 'Carry on. Go.'), h.result(25, 'rc-big', 'x'.repeat(3 * 1024 * 1024)), ...readAllThree(h, 30, hub), ...more(file)];
      const bashOf = (s) => readingIn(w, hub, call('Bash', { command: 'ls' }, s.record), tmpRoot);
      const unread = recallSession(h, tmpRoot, big(() => []));
      const read = recallSession(h, tmpRoot, big((f) => readFileOf(h, 40, 'rc-bw', f, RECALL_LINES)));
      return h.assertAll([
        ['with the compaction beyond the first tail and the file unread a Bash is refused for the file', held(bashOf(unread), /^TYPED MESSAGES UNREAD/), said(bashOf(unread))],
        ['with the file read whole after it a Bash passes', passes(bashOf(read)), said(bashOf(read))],
      ]);
    },
  },
];

export const plants = {
  dp_pass_through: ["    return repoHooks(event, raw, p, new Set(), (why) => latchAfter(p, why));\n  }\n", "    process.stdout.write('printed');\n    return repoHooks(event, raw, p, new Set(), (why) => latchAfter(p, why));\n  }\n", 'hook-dispatch.mjs'],
  dp_popup: ["    if (tool === 'AskUserQuestion') {", '    if (false) {', 'hook-dispatch.mjs'],
  dp_push_refusal: ["    if (o.deny) { process.stderr.write(o.reason + '\\n'); latchAfter(p, o.reason); return 2; }\n    if (o.status !== 0", "    if (false) { process.stderr.write(o.reason + '\\n'); return 2; }\n    if (o.status !== 0", 'hook-dispatch.mjs'],
  dp_unclean: ['    if (o.status !== 0 && !READS.has(tool)) {', '    if (false) {', 'hook-dispatch.mjs'],
  dp_page_prompt: ["  if (event === 'UserPromptSubmit') process.stdout.write(`${PAGE_LINE}\\n`);", "  if (false) process.stdout.write(`${PAGE_LINE}\\n`);", 'hook-dispatch.mjs'],
  dp_page_start: ["    process.stdout.write(`${PAGE_LINE}\\n`);\n    try { const more = moreThanOneRepoLine(p, root);", "    void 0;\n    try { const more = moreThanOneRepoLine(p, root);", 'hook-dispatch.mjs'],
  dp_start_main_only: ["  if (event === 'SessionStart' && !p.agent_id) {\n    const root", "  if (event === 'SessionStart') {\n    const root", 'hook-dispatch.mjs'],
  dp_bring_merge: ["    const merged = git(dir, ['merge', '--ff-only', 'origin/main']);", "    const merged = git(dir, ['status']);", 'hook-dispatch.mjs'],
  dp_bring_source: ["  if (p?.agent_id || !(p?.source === 'startup' || p?.source === 'resume')) return [];", '  if (p?.agent_id) return [];', 'hook-dispatch.mjs'],
  dp_bring_limit: ["timeout: seconds * 1000, env: { ...process.env, GIT_TERMINAL_PROMPT", "timeout: 20000, env: { ...process.env, GIT_TERMINAL_PROMPT", 'hook-dispatch.mjs'],
  dp_bring_default: ['  const seconds = opts.seconds ?? 20;', '  const seconds = opts.seconds ?? 99;', 'hook-dispatch.mjs'],
  dp_repo_print: ["        if (o.out.trim() && (event === 'SessionStart' || event === 'UserPromptSubmit')) printed.push(o.out.trim());", '        if (false) printed.push(o.out.trim());', 'hook-dispatch.mjs'],
  dp_repo_refuse: ["        if (o.deny) { process.stderr.write(o.reason + '\\n'); if (onRefuse) onRefuse(o.reason); return 2; }\n        if (o.out.trim()", "        void 0;\n        if (o.out.trim()", 'hook-dispatch.mjs'],
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
  sb_heading: ["out.push(`=== session brief · ${name} ===`);", "out.push('=== brief ===');", 'session-brief.mjs'],
  sb_branch: ["out.push(`BRANCH: on '${branch}'.`);", "out.push('');", 'session-brief.mjs'],
  sb_work: ["  if (branch === work) out.push(", '  if (false) out.push(', 'session-brief.mjs'],
  sb_page: ['out.push(`HOW WORK GOES HERE:', 'out.push(`HOW WORK GOES ELSEWHERE:', 'session-brief.mjs'],
  psc_line: ["console.log('The plan-scope check was retired on 12 November 2026; this passes.');", "console.log('The plan-scope check passes.');", 'plan-scope-check.mjs'],
  psc_exit: ["this passes.');\nprocess.exit(0);", "this passes.');\nprocess.exit(1);", 'plan-scope-check.mjs'],
  dp_more_print: ['if (more) process.stdout.write(`${more}\\n`);', 'if (false) process.stdout.write(`${more}\\n`);', 'hook-dispatch.mjs'],
  dp_more_two: ["  if (names.length < 2) return '';", "  if (names.length < 1) return '';", 'hook-dispatch.mjs'],
  dp_more_launch_repo: ["  if (existsSync(join(at, '.git'))) return '';\n  const names", "  const names", 'hook-dispatch.mjs'],
  dp_more_source: ["  if (p?.agent_id || !(p?.source === 'startup' || p?.source === 'resume')) return '';", '  if (p?.agent_id) return \'\';', 'hook-dispatch.mjs'],
  hy_stop: ["  + WHY_WORD\n  + 'Say in plain text what was running", "  + 'Say in plain text what was running", 'hook-dispatch.mjs'],
  hy_new: ["  + WHY_WORD\n  + 'Answer the message", "  + 'Answer the message", 'hook-dispatch.mjs'],
  hy_latch: ['    + WHY_LATCH\n', '', 'hook-dispatch.mjs'],
  hy_manager: ['  + WHY_MANAGER.trimEnd();', "  + '';", 'hook-dispatch.mjs'],
  hw_stop_hold: ['    return h.waiting.length ? WAITING_TEXT(true, h.waiting) : STOP_TEXT;\n', '    return null;\n', 'hook-dispatch.mjs'],
  hw_stop_agents: ["    if (!p.agent_id && tool === 'TaskStop') return null;", "    if (tool === 'TaskStop') return null;", 'hook-dispatch.mjs'],
  hw_progress_pass: ["    if (p.agent_id && (tool === 'Write' || tool === 'Edit') && isProgressFile(absPath(p, p.tool_input?.file_path ?? ''), p.session_id)) return null;\n", '', 'hook-dispatch.mjs'],
  hw_progress_dir: ["return basename(d) === 'progress' && inScratchpad(a, sid)", 'return inScratchpad(a, sid)', 'hook-dispatch.mjs'],
  hw_progress_agent: ["    if (p.agent_id && (tool === 'Write' || tool === 'Edit') && isProgress", "    if ((tool === 'Write' || tool === 'Edit') && isProgress", 'hook-dispatch.mjs'],
  hw_progress_direct: ["inScratchpad(d, sid) && !inScratchpad(dirname(d), sid);", "inScratchpad(d, sid);", 'hook-dispatch.mjs'],
  hw_reads: ['  if (READS.has(tool) && !planEntry && !planExit) return null;\n  const h = ownerHolds(p);', '  const h = ownerHolds(p);', 'hook-dispatch.mjs'],
  hw_word_whole: ["w.some((x, i) => x === 'stop' && ", "w.some((x, i) => x.includes('stop') && ", 'hook-dispatch.mjs'],
  hw_neg_not: ['(?:not|never|', '(?:never|', 'hook-dispatch.mjs'],
  hw_neg_never: ['not|never|', 'not|', 'hook-dispatch.mjs'],
  hw_neg_apos: ["n['’]t|(?:do|", '(?:do|', 'hook-dispatch.mjs'],
  hw_neg_plain: ['|(?:do|does|did|is|are|was|were|has|have|had|should|would|could|must|might|need|dare|ought|ca|wo|sha|ai)nt)$/u', ')$/u', 'hook-dispatch.mjs'],
  hw_neg_prev: ['NEGATIVE_BEFORE_STOP.test(w[i - 1])', 'NEGATIVE_BEFORE_STOP.test(w[i])', 'hook-dispatch.mjs'],
  hw_neg_direct: ['test(w[i - 1])', 'test(w[0])', 'hook-dispatch.mjs'],
  hw_no_latch: ["    if (held) { process.stderr.write(held + '\\n'); return 2; }", "    if (held) { process.stderr.write(held + '\\n'); latchAfter(p, held); return 2; }", 'hook-dispatch.mjs'],
  hw_main_tr: ['  if (m) return `${m[1]}.jsonl`;', '  void 0;', 'hook-dispatch.mjs'],
  hw_goword_lift: ['const lifted = (m) => (!m.waiting && idx.some((j) => j > m.i && endsWithGoWord(text(j)))) || approvals', 'const lifted = (m) => false || approvals', 'hook-dispatch.mjs'],
  hw_approval_lift: ['|| approvals.some((a) => a > m.i);', '|| false;', 'hook-dispatch.mjs'],
  hw_approval_name: ["if (name === 'ExitPlanMode' ||", 'if (true ||', 'hook-dispatch.mjs'],
  sv_envelope_words: ['if (!(APPROVED.test(text) || APPROVED_SAVED.test(text))) continue;', 'if (!(APPROVED.test(text))) continue;', 'hook-dispatch.mjs'],
  sv_envelope_plan: ["if (name === 'ExitPlanMode' && hasPlan && !REJECTED.test(text) &&", "if (false && hasPlan && !REJECTED.test(text) &&", 'hook-dispatch.mjs'],
  sv_rejected: ["if (name === 'ExitPlanMode' && hasPlan && !REJECTED.test(text) &&", "if (name === 'ExitPlanMode' && hasPlan &&", 'hook-dispatch.mjs'],
  hw_goword_last: ['GO_WORDS.includes(w[w.length - 1])', 'w.some((x) => GO_WORDS.includes(x))', 'hook-dispatch.mjs'],
  hw_harness: ['  entries.forEach((e, i) => { if (tail.isOwnerMessage(e)) idx.push(i); });', '  entries.forEach((e, i) => { if (tail.isOwnerMessage(e) || /^Stop hook feedback/.test(tail.textOf(e))) idx.push(i); });', 'hook-dispatch.mjs'],
  hw_correction_new: ['  if (NEW_STARTS.has(tool)) return text;', '  if (false) return text;', 'hook-dispatch.mjs'],
  hw_correction_write: ["  if (FILE_WRITES.has(tool) && !mayWrite(p, p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? '')) return text;", '  void 0;', 'hook-dispatch.mjs'],
  hw_plan_pass: ["  return dirname(a) === join(homedir(), '.claude', 'plans') || inScratchpad(a, p.session_id);", '  return inScratchpad(a, p.session_id);', 'hook-dispatch.mjs'],
  hw_agent_free: ['  if (p.agent_id || !h.correction) return null;', '  if (!h.correction) return null;', 'hook-dispatch.mjs'],
  hw_correction_approval_before: ['!approvals.some((a) => a > last.i)', '!approvals.some((a) => a > -1)', 'hook-dispatch.mjs'],
  hw_correction_lift: ['const correction = !!last && !endsWithGoWord(last.text) &&', 'const correction = !!last &&', 'hook-dispatch.mjs'],
  hl_popup: ['      latchAfter(p, why);\n      return 2;', '      return 2;', 'hook-dispatch.mjs'],
  hl_repeat: ['What was first refused: ${l.reason}', 'What was first refused: none', 'hook-dispatch.mjs'],
  hl_reads: ["  if (p.agent_id || READS.has(tool) || tool === 'TaskStop') return null;", "  if (p.agent_id || tool === 'TaskStop') return null;", 'hook-dispatch.mjs'],
  hl_clear: ['if (list.some((e, i) => tail.isOwnerMessage(e) && typedAt(list, i) > at))', 'if (false)', 'hook-dispatch.mjs'],
  hl_agent_free: ["  if (p.agent_id || READS.has(tool) || tool === 'TaskStop') return null;", "  if (READS.has(tool) || tool === 'TaskStop') return null;", 'hook-dispatch.mjs'],
  hl_push: ['latchAfter(p, o.reason); ', '', 'hook-dispatch.mjs'],
  hl_repo: ['(why) => latchAfter(p, why)', 'null', 'hook-dispatch.mjs'],
  hl_agent_none: ['  if (p.agent_id || latchStanding(p)) return false;', '  if (latchStanding(p)) return false;', 'hook-dispatch.mjs'],
  hl_hold_none: ['    const held = holds(p);', '    const held = holds(p); if (held) latchAfter(p, held);', 'hook-dispatch.mjs'],
  hm_edit: ['  if (FILE_WRITES.has(tool)) {\n    return mayWrite(', '  if (FILE_WRITES.has(tool) && false) {\n    return mayWrite(', 'hook-dispatch.mjs'],
  hm_git: ['    if (g && gitChanges(g)) return', '    if (false) return', 'hook-dispatch.mjs'],
  hm_redirect: ['    if (redirectTargets(seg.words).some(', '    if (false && redirectTargets(seg.words).some(', 'hook-dispatch.mjs'],
  hm_sedtee: ['    if (writtenFiles(seg.words).some(', '    if (false && writtenFiles(seg.words).some(', 'hook-dispatch.mjs'],
  hm_agent: ["  if (p.agent_id || READS.has(tool)) return null;\n  if (FILE_WRITES.has(tool)) {", "  if (READS.has(tool)) return null;\n  if (FILE_WRITES.has(tool)) {", 'hook-dispatch.mjs'],
  hm_devnull: ['const NOT_FILES = /^(?:\\/dev\\/(?:null|', 'const NOT_FILES = /^(?:\\/dev\\/(?:nothing|', 'hook-dispatch.mjs'],
  hm_scratch: ['  return !inScratchpad(absPath(p, t), p.session_id);', '  return true;', 'hook-dispatch.mjs'],
  hm_listing: ["  if (sub === 'stash') return !['list', 'show'].includes(rest[0]);", "  if (sub === 'stash') return true;", 'hook-dispatch.mjs'],
  hm_plan: ["  return dirname(a) === join(homedir(), '.claude', 'plans') ||", "  return a.startsWith(join(homedir(), '.claude', 'plans')) ||", 'hook-dispatch.mjs'],
  cr_git_log_read: ["  if (NEW_STARTS.has(tool)) return text;\n  if (FILE_WRITES.has(tool) && !mayWrite(", "  if (NEW_STARTS.has(tool)) return text;\n  if (tool === 'Bash' && /\\bgit\\s+(?:-C\\s+\\S+\\s+)?log\\b/.test(String(p.tool_input?.command ?? ''))) return text;\n  if (FILE_WRITES.has(tool) && !mayWrite(", 'hook-dispatch.mjs'],
  cr_pasted_report_plan: ["if (FILE_WRITES.has(tool) && !mayWrite(p, p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? '')) return text;", 'if (FILE_WRITES.has(tool)) return text;', 'hook-dispatch.mjs'],
  cr_go_between_writes: ['export function endsWithGoWord(text) { const w = wordsOf(text); return GO_WORDS.includes(w[w.length - 1]); }', 'export function endsWithGoWord(text) { const w = wordsOf(text); return false; }', 'hook-dispatch.mjs'],
  hb_names_stop_file: ['  entries.forEach((e, i) => { if (tail.isOwnerMessage(e)) idx.push(i); });', '  entries.forEach((e, i) => { if (tail.isOwnerMessage(e) || /stop-guard\\.mjs/.test(tail.textOf(e))) idx.push(i); });', 'hook-dispatch.mjs'],
  hb_closes_step: ['  entries.forEach((e, i) => { if (tail.isOwnerMessage(e)) idx.push(i); });', '  entries.forEach((e, i) => { if (tail.isOwnerMessage(e) || /\\[Subagent hand-back\\]/.test(tail.textOf(e))) idx.push(i); });', 'hook-dispatch.mjs'],
  wf_two_fetches: ['    const held = holds(p);\n    if (held) {', "    if (tool === 'WebFetch') latchAfter(p, 'planted refusal of a fetch');\n    const held = holds(p);\n    if (held) {", 'hook-dispatch.mjs'],
  pm_enter_plan: ['    const held = holds(p);\n    if (held) {', "    if (tool === 'EnterPlanMode' && p.permission_mode === 'plan') { const why = 'planted refusal of an entry to plan mode'; process.stderr.write(why + '\\n'); latchAfter(p, why); return 2; }\n    const held = holds(p);\n    if (held) {", 'hook-dispatch.mjs'],
  lg_report_again: ["  if (p.agent_id || READS.has(tool) || tool === 'TaskStop') return null;\n  const l = latchStanding(p);", "  if (READS.has(tool) || tool === 'TaskStop') return null;\n  const l = latchStanding(p);", 'hook-dispatch.mjs'],
  lg_report_second_send: ["  if (p.agent_id || READS.has(tool) || tool === 'TaskStop') return null;\n  const l = latchStanding(p);", "  if (READS.has(tool) || tool === 'TaskStop') return null;\n  if (p.agent_id && !/step-\\d+-report\\.txt$/.test(String(p.tool_input?.file_path ?? ''))) return null;\n  const l = latchStanding(p);", 'hook-dispatch.mjs'],
  mg_check_in: ["  if (tool !== 'Bash') return null;\n  const { shell: line }", "  if (tool !== 'Bash') return null;\n  if (/\\b(?:tail|cat|ps|sleep|ls)\\b/.test(String(p.tool_input?.command ?? ''))) return MANAGER_TEXT('a check-in on a run');\n  const { shell: line }", 'hook-dispatch.mjs'],
  mg_reads_of_record: ['  if (p.agent_id || READS.has(tool)) return null;', "  if (p.agent_id) return null;\n  if (READS.has(tool)) return MANAGER_TEXT('a read outside the plans folder and the scratchpad');", 'hook-dispatch.mjs'],
  hx_catch: ['    } catch (e) {\n      process.stderr.write(`hook-dispatch.mjs: ${name} failed', '    } catch (e) {\n      throw e;\n      process.stderr.write(`hook-dispatch.mjs: ${name} failed', 'hook-dispatch.mjs'],
  hs_run: ["  if (event === 'Stop' && !p.agent_id) {", '  if (false) {', 'hook-dispatch.mjs'],
  hs_once: ["    return repoHooks(event, raw, p, new Set(['stop-guard.sh']));", '    return repoHooks(event, raw, p, new Set());', 'hook-dispatch.mjs'],
  hs_refuse: ["    if (s.deny) { process.stderr.write(s.reason + '\\n'); return 2; }", "    if (false) { process.stderr.write(s.reason + '\\n'); return 2; }", 'hook-dispatch.mjs'],
  rd_hold: ['    if (!unread.length && !recallDue && !recallUnsure) return null;\n    if (cut >= 0', '    return null;\n    if (cut >= 0', 'hook-dispatch.mjs'],
  rd_agent: ['  if (p.agent_id) return null;\n  if (READS.has(tool)) return null;\n  const file = mainTranscript(p);', '  if (READS.has(tool)) return null;\n  const file = mainTranscript(p);', 'hook-dispatch.mjs'],
  rd_reads: ['  if (p.agent_id) return null;\n  if (READS.has(tool)) return null;\n  const file = mainTranscript(p);', '  if (p.agent_id) return null;\n  const file = mainTranscript(p);', 'hook-dispatch.mjs'],
  rd_taskstop: ["  if (!p.agent_id && tool === 'TaskStop') return null;\n  if (p.agent_id) return null;", '  if (p.agent_id) return null;', 'hook-dispatch.mjs'],
  rd_why: ["        + `${unread.length ? WHY_READ : ''}${recallDue ? WHY_RECALL : ''}`.trimEnd();", "        + '';", 'hook-dispatch.mjs'],
  rd_no_latch: ['    if (cut >= 0 || size <= mb * 1024 * 1024) {\n', "    if (cut >= 0 || size <= mb * 1024 * 1024) {\n      latchAfter(p, 'planted read refusal');\n", 'hook-dispatch.mjs'],
  rd_lift: ['    const unread = pages.filter((pg) => !pg.files.some((f) => readWhole(live, f)));', '    const unread = pages;', 'hook-dispatch.mjs'],
  rd_partial: ['for (let k = 1; k <= n.text; k++) if (!got.has(k)) return false;', 'for (let k = 1; k <= 1; k++) if (!got.has(k)) return false;', 'hook-dispatch.mjs'],
  rd_stale: ['if (Number(rec.totalLines) > 0 && Number(rec.totalLines) !== n.text && Number(rec.totalLines) !== n.split) continue;', 'void 0;', 'hook-dispatch.mjs'],
  rd_error: ["if (b?.type !== 'tool_result' || b.is_error || !asked.has(b.tool_use_id)) continue;\n      const rec", "if (b?.type !== 'tool_result' || !asked.has(b.tool_use_id)) continue;\n      const rec", 'hook-dispatch.mjs'],
  rd_other_copy: ['if (canon(rec?.filePath || asked.get(b.tool_use_id)) !== want) continue;', 'void 0;', 'hook-dispatch.mjs'],
  rd_numlines: ['for (let k = 0; k < rec.numLines; k++) got.add(rec.startLine + k);', 'for (let k = 0; k < 1; k++) got.add(rec.startLine + k);', 'hook-dispatch.mjs'],
  rd_text_form: ['        for (const m of t.matchAll(/^\\s*(\\d+)\\t/gm)) got.add(Number(m[1]));', '        void 0;', 'hook-dispatch.mjs'],
  rd_checkout: ['if (isHubCheckout(r)) out.push(r);', 'void 0;', 'hook-dispatch.mjs'],
  rd_compaction: ['    const live = entries.slice(cut + 1);', '    const live = entries;', 'hook-dispatch.mjs'],
  rd_unknown: ['try { size = statSync(file).size; } catch { return null; }', 'size = statSync(file).size;', 'hook-dispatch.mjs'],
  wq_hold: ['  const wait = waitingMessages(entries);\n', '  const wait = [];\n', 'hook-dispatch.mjs'],
  wq_stop_text: ['WAITING_TEXT(true, h.waiting) : STOP_TEXT', 'STOP_TEXT : STOP_TEXT', 'hook-dispatch.mjs'],
  wq_new_text: ['const text = h.waiting.length ? WAITING_TEXT(false, h.waiting) : CORRECTION_TEXT;', 'const text = CORRECTION_TEXT;', 'hook-dispatch.mjs'],
  wq_print: ['`--- message ${i + 1} of ${texts.length} ---\\n${t}`', '`--- message ${i + 1} of ${texts.length} ---\\n`', 'hook-dispatch.mjs'],
  wq_why: ["  + WHY_WAITING\n  + 'Answer it now", "  + 'Answer it now", 'hook-dispatch.mjs'],
  wq_correction: ['  const holders = all.filter(', '  if (wait.length) return { stop: false, correction: false, settled: false, waiting: [] };\n  const holders = all.filter(', 'hook-dispatch.mjs'],
  wq_nolift: ['const holders = all.filter((m) => !(m.waiting && endsWithGoWord(m.text)));', 'const holders = all;', 'hook-dispatch.mjs'],
  wq_delivered: ['if (!x.done && x.key && (t.includes(x.key)', 'if (false && x.key && (t.includes(x.key)', 'hook-dispatch.mjs'],
  wq_count: ['  if (size <= 0) return [];\n  return items', '  return items', 'hook-dispatch.mjs'],
  wq_harness: ['owner: !!(c && c.trim() && !tail.HARNESS_TAG.test(c))', 'owner: !!(c && c.trim())', 'hook-dispatch.mjs'],
  wq_given: ['.filter((x) => x.owner && !given.some((g) => g > x.at))', '.filter((x) => x.owner)', 'hook-dispatch.mjs'],
  pl_hold: ["  return a.startsWith(root + '/') ? PLAN_TEXT : null;", '  return null;', 'hook-dispatch.mjs'],
  pl_plan_mode: ["if (typeof mode !== 'string' || !mode.trim() || /plan/i.test(mode)) return null;", "if (typeof mode !== 'string' || !mode.trim()) return null;", 'hook-dispatch.mjs'],
  pl_unknown: ["if (typeof mode !== 'string' || !mode.trim() || /plan/i.test(mode)) return null;", 'if (/plan/i.test(mode)) return null;', 'hook-dispatch.mjs'],
  pl_agent: ['  if (p.agent_id || !FILE_WRITES.has(tool)) return null;\n  const mode', '  if (!FILE_WRITES.has(tool)) return null;\n  const mode', 'hook-dispatch.mjs'],
  pl_why: ['  + WHY_PLAN\n', '', 'hook-dispatch.mjs'],
  pl_scope: ["  return a.startsWith(root + '/') ? PLAN_TEXT : null;", '  return PLAN_TEXT;', 'hook-dispatch.mjs'],
  rt_hold: ["  if (!id || !isTopTier(id)) return null;\n  return tierRefusal('RUN WAITS", "  return null;\n  return tierRefusal('RUN WAITS", 'hook-dispatch.mjs'],
  rt_agent: ["  if (p.agent_id || !NEW_STARTS.has(String(p.tool_name ?? ''))) return null;\n  const id", "  if (!NEW_STARTS.has(String(p.tool_name ?? ''))) return null;\n  const id", 'hook-dispatch.mjs'],
  rt_command: ["const m = /Set model to[^`]*`([^`]*)`/.exec(tail.textOf(e));", 'const m = null;', 'hook-dispatch.mjs'],
  rt_line: ["const RUN_TIER_LINE = '/model claude-opus-5-5';", "const RUN_TIER_LINE = '/model planted';", 'hook-dispatch.mjs'],
  rt_no_latch: ["  if (!id || !isTopTier(id)) return null;\n  return tierRefusal('RUN WAITS", "  if (!id || !isTopTier(id)) return null;\n  latchAfter(p, 'planted run tier refusal');\n  return tierRefusal('RUN WAITS", 'hook-dispatch.mjs'],
  st_hold: ["  if (typeof m !== 'string' || /sonnet|haiku/i.test(m)) return null;", '  return null;', 'hook-dispatch.mjs'],
  st_sonnet: ["/sonnet|haiku/i.test(m)", '/sonnet/i.test(m)', 'hook-dispatch.mjs'],
  st_task: ['/^(?:Agent|Task)$/.test(String(p.tool_name ?? \'\'))', '/^Agent$/.test(String(p.tool_name ?? \'\'))', 'hook-dispatch.mjs'],
  st_agent: ["  if (p.agent_id || !/^(?:Agent|Task)$/", "  if (!/^(?:Agent|Task)$/", 'hook-dispatch.mjs'],
  ej_record: ['    if (!EJECT_OPENING.test(message)) return;', '    if (false) return;', 'hook-dispatch.mjs'],
  ej_mark: ['const EJECT_OPENING = /^\\s*EJECT(?![A-Za-z0-9])/;', 'const EJECT_OPENING = /^\\s*EJECT$/m;', 'hook-dispatch.mjs'],
  ej_hold: ['  if (!rec) return null;\n  if (tool === \'ExitPlanMode\') {', '  return null;\n  if (tool === \'ExitPlanMode\') {', 'hook-dispatch.mjs'],
  ej_lift: ["entries[i]?.timestamp ?? '') > at)) { rmSync", "entries[i]?.timestamp ?? '') > Infinity)) { rmSync", 'hook-dispatch.mjs'],
  ej_agent: ["  if (p.agent_id || !(NEW_STARTS.has(tool) || tool === 'ExitPlanMode')) return null;", "  if (!(NEW_STARTS.has(tool) || tool === 'ExitPlanMode')) return null;", 'hook-dispatch.mjs'],
  ej_page: ['    if (pageHasCause(text)) return null;\n', '    return null;\n', 'hook-dispatch.mjs'],
  ej_page_all: ['return PAGE_CAUSE.every((w) => after.some(', 'return PAGE_CAUSE.some((w) => after.some(', 'hook-dispatch.mjs'],
  ej_page_scope: ["const h = lines.findIndex((l) => /^## Why it stopped\\s*$/.test(l));\n  if (h < 0) return false;", "const h = lines.findIndex((l) => /^## Why it stopped\\s*$/.test(l));\n  if (h < 0) return PAGE_CAUSE.every((w) => lines.some((l) => l.includes(w)));", 'hook-dispatch.mjs'],
  ej_newest: ['m.mtimeMs > best)', 'true)', 'hook-dispatch.mjs'],
  wk_hold: ["  if (pushGuard.checkerPassed(p, id).ok) return null;\n", "  return null;\n", 'hook-dispatch.mjs'],
  wk_scope: ["  if (!roleWalks(resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd()))) return null;\n", '', 'hook-dispatch.mjs'],
  wk_scope_text: ["/\\bthe word walk\\b/.test(readFileSync(join(root, '.claude', 'agents', 'checker.md'), 'utf8'))", "!!readFileSync(join(root, '.claude', 'agents', 'checker.md'), 'utf8')", 'hook-dispatch.mjs'],
  wk_word: ["  if (/\\bwithout a walk\\b/i.test(lastTyped(p))) return null;\n", '', 'hook-dispatch.mjs'],
  wk_agent: ["  if (p.agent_id || String(p.tool_name ?? '') !== 'ExitPlanMode') return null;", "  if (String(p.tool_name ?? '') !== 'ExitPlanMode') return null;", 'hook-dispatch.mjs'],
  dc_listed: ["['walk', 'the walk hold', holdWalk], ['decision', 'the decision hold', holdDecision], ", "['walk', 'the walk hold', holdWalk], ", 'hook-dispatch.mjs'],
  dc_agent: ["  if (p.agent_id) return null;\n  if (String(p.tool_name ?? '') !== 'ExitPlanMode') return null;\n  const decided", "  if (String(p.tool_name ?? '') !== 'ExitPlanMode') return null;\n  const decided", 'hook-dispatch.mjs'],
  dc_tool: ["  if (String(p.tool_name ?? '') !== 'ExitPlanMode') return null;\n  const decided", '  const decided', 'hook-dispatch.mjs'],
  dc_nopage: ['  if (!decided) return null;\n', '  if (!decided) return DECISION_TEXT;\n', 'hook-dispatch.mjs'],
  dc_go: ['  if (last < 0 || !endsWithGoWord(tail.textOf(list[last]))) return DECISION_TEXT;\n', '', 'hook-dispatch.mjs'],
  dc_after: ['  if (!(typedAt(list, last) > wrote)) return DECISION_TEXT;\n', '', 'hook-dispatch.mjs'],
  wk_send: ["  if (isWalkSend(p)) return null;\n  if (isRunSend(p, id)) return null;", "  if (isRunSend(p, id)) return null;", 'hook-dispatch.mjs'],
  wk_send_word: ["  if (isWalkSend(p)) return null;\n  if (NEW_STARTS.has(tool)) return text;", "  if (NEW_STARTS.has(tool)) return text;", 'hook-dispatch.mjs'],
  wk_send_eject: ["  if (isWalkSend(p)) return null;\n  return `A STEP EJECTED:", "  return `A STEP EJECTED:", 'hook-dispatch.mjs'],
  wk_send_type: ["  if (String(p.tool_input?.subagent_type ?? '') !== 'checker') return false;\n", '', 'hook-dispatch.mjs'],
  wk_send_mode: [" || !/plan/i.test(String(p.permission_mode ?? ''))) return false;", ") return false;", 'hook-dispatch.mjs'],
  wk_send_place: ["dirname(absPath(p, m[1])) === join(homedir(), '.claude', 'plans')", 'true', 'hook-dispatch.mjs'],
  rn_send: ["  if (isRunSend(p, id)) return null;\n", '', 'hook-dispatch.mjs'],
  rn_mode: ["  if (!isTopTier(id) || /plan/i.test(String(p.permission_mode ?? ''))) return false;", "  if (!isTopTier(id)) return false;", 'hook-dispatch.mjs'],
  rn_script: ["script && canon(absPath(p, String(input?.scriptPath ?? ''))) === canon(script) && ", "script && ", 'hook-dispatch.mjs'],
  rn_script_same: ["readFileSync(mine, 'utf8') === readFileSync(join(HUB, 'plans', 'native', 'run-page.js'), 'utf8') ? mine : ''", "readFileSync(mine, 'utf8') ? mine : ''", 'hook-dispatch.mjs'],
  rn_place: ["  if (dirname(page) !== join(homedir(), '.claude', 'plans')) return null;\n", '', 'hook-dispatch.mjs'],
  rn_text: ['  return ok && ok.text.trim() === now.trim() ? ok : null;', '  return ok || null;', 'hook-dispatch.mjs'],
  rn_approval: ['  return ok && ok.text.trim() === now.trim() ? ok : null;', '  return !ok || ok.text.trim() === now.trim() ? (ok || { entries: [], at: -1 }) : null;', 'hook-dispatch.mjs'],
  rn_step_role: ["  if (!m || !(role === 'worker' || role === 'checker')) return false;", '  if (!m) return false;', 'hook-dispatch.mjs'],
  rn_step_words: ["const m = /^(\\S+) step \\d+$/.exec(String(p.tool_input?.prompt ?? '').trim());", "const m = /^(\\S+) step \\d+/.exec(String(p.tool_input?.prompt ?? '').trim());", 'hook-dispatch.mjs'],
  rn_step_first: ['  return ok.entries.slice(ok.at + 1).some(', '  return true || ok.entries.slice(ok.at + 1).some(', 'hook-dispatch.mjs'],
  rn_step_after: ['ok.entries.slice(ok.at + 1).some(', 'ok.entries.some(', 'hook-dispatch.mjs'],
  rn_step_page: ['&& launched(b.input) === page));', '&& !!launched(b.input)));', 'hook-dispatch.mjs'],
  rn_what: ["return tierRefusal('RUN WAITS FOR ITS TIER:', id, RUN_TIER_WHAT, RUN_TIER_LINE);", "return tierRefusal('RUN WAITS FOR ITS TIER:', id, 'A run is made a tier lower.', RUN_TIER_LINE);", 'hook-dispatch.mjs'],
  wp_enter_none: ['    return planEntry && h.correction ? NO_PAGE_TEXT : null;', '    return null;', 'hook-dispatch.mjs'],
  wp_enter_mode: ["tool === 'EnterPlanMode' && !/plan/i.test(String(p.permission_mode ?? ''));", "tool === 'EnterPlanMode';", 'hook-dispatch.mjs'],
  wp_enter_stop: ['    if (h.stop) return h.waiting.length ? WAITING_TEXT(true, h.waiting) : STOP_TEXT;\n    return planEntry', '    if (h.stop && planExit) return h.waiting.length ? WAITING_TEXT(true, h.waiting) : STOP_TEXT;\n    return planEntry', 'hook-dispatch.mjs'],
  wp_exit_stop: ['    if (h.stop) return h.waiting.length ? WAITING_TEXT(true, h.waiting) : STOP_TEXT;\n    return planEntry', '    if (h.stop && planEntry) return h.waiting.length ? WAITING_TEXT(true, h.waiting) : STOP_TEXT;\n    return planEntry', 'hook-dispatch.mjs'],
  wp_write_mode: ["    if (!p.agent_id && FILE_WRITES.has(tool) && /plan/i.test(String(p.permission_mode ?? ''))\n", "    if (!p.agent_id && FILE_WRITES.has(tool) && true\n", 'hook-dispatch.mjs'],
  wp_write_dir: ["=== join(homedir(), '.claude', 'plans')) return null;\n    return h.waiting", "=== join(homedir(), '.claude', 'plans') || true) return null;\n    return h.waiting", 'hook-dispatch.mjs'],
  wp_name_hook: ['\\bstop[ -](?:hooks?|guard)\\b', '\\bstop[ -](?:guard)\\b', 'hook-dispatch.mjs'],
  wp_name_hooks: ['\\bstop[ -](?:hooks?|guard)\\b', '\\bstop[ -](?:hook|guard)\\b', 'hook-dispatch.mjs'],
  wp_name_guard: ['\\bstop[ -](?:hooks?|guard)\\b', '\\bstop[ -](?:hooks?)\\b', 'hook-dispatch.mjs'],
  rc_first: ['[RECALL_FIRST_LINE, ...list.map', '[...list.map', 'hook-dispatch.mjs'],
  rc_whole: ['${californiaStamp(m.at)}\\n\\n${m.text}', "${californiaStamp(m.at)}\\n\\n${m.text.split('\\n')[0]}", 'hook-dispatch.mjs'],
  rc_typed: ['if (e?.isSidechain || e?.agentId || !tail.isOwnerMessage(e)) return;', "if (e?.isSidechain || e?.agentId || (e?.type !== 'user' && e?.type !== 'attachment')) return;", 'hook-dispatch.mjs'],
  rc_queue: ['if (e?.isSidechain || e?.agentId || !tail.isOwnerMessage(e)) return;', "if (e?.isSidechain || e?.agentId || e?.type !== 'user' || !tail.isOwnerMessage(e)) return;", 'hook-dispatch.mjs'],
  rc_time: ["timeZone: 'America/Los_Angeles'", "timeZone: 'UTC'", 'hook-dispatch.mjs'],
  rc_mkdir: ['    mkdirSync(dirname(file), { recursive: true });\n    writeFileSync(file, `', '    writeFileSync(file, `', 'hook-dispatch.mjs'],
  rc_path: ["'scratchpad', 'recall', 'typed-messages.md')", "'recall', 'typed-messages.md')", 'hook-dispatch.mjs'],
  rc_print: ["{ if (p.source === 'compact') process.stdout.write(", '{ if (false) process.stdout.write(', 'hook-dispatch.mjs'],
  rc_failline: ['else if (!filed.skipped) process.stdout.write(', 'else if (false) process.stdout.write(', 'hook-dispatch.mjs'],
  rc_skipped: ['else if (!filed.skipped) process.stdout.write(', 'else process.stdout.write(', 'hook-dispatch.mjs'],
  rc_hold: ['const recallDue = recallHere && cut >= 0 && !readWhole(live, recall);', 'const recallDue = false;', 'hook-dispatch.mjs'],
  rc_live: ['const recallDue = recallHere && cut >= 0 && !readWhole(live, recall);', 'const recallDue = recallHere && cut >= 0 && !readWhole(entries, recall);', 'hook-dispatch.mjs'],
  rc_resume: ['const recallDue = recallHere && cut >= 0 && !readWhole(live, recall);', 'const recallDue = recallHere && !readWhole(live, recall);', 'hook-dispatch.mjs'],
  rc_absent: ['const recallHere = !!recall && existsSync(recall);', 'const recallHere = !!recall;', 'hook-dispatch.mjs'],
  rc_why_recall: ["${recallDue ? WHY_RECALL : ''}", '', 'hook-dispatch.mjs'],
  rc_list: ['...(recallDue ? [`${recall} (every line, ${linesOf(recall)?.text} lines)`] : [])', '...[]', 'hook-dispatch.mjs'],
  rc_head: ["${unread.length ? 'STANDING PAGES UNREAD' : 'TYPED MESSAGES UNREAD'}", 'STANDING PAGES UNREAD', 'hook-dispatch.mjs'],
  rc_unsure: ['const recallUnsure = recallHere && cut < 0 && size > mb * 1024 * 1024 && !readWhole(entries, recall);', 'const recallUnsure = false;', 'hook-dispatch.mjs'],
  pl_no_latch: ["  return a.startsWith(root + '/') ? PLAN_TEXT : null;", "  if (a.startsWith(root + '/')) { latchAfter(p, 'planted plan file refusal'); return PLAN_TEXT; }\n  return null;", 'hook-dispatch.mjs'],
};
