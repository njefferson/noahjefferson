#!/usr/bin/env node
/**
 * The guards of LESSONS §376, fed shaped transcripts and real git repositories.
 *
 *   node session-guards.test.mjs           every case; exit 1 on any failure
 *   node session-guards.test.mjs --plants  MADE TO FAIL: for each check, a copy of
 *                                          the guards with that check taken out, and
 *                                          a case naming it must then FAIL
 *
 * Covered: pending-guard.mjs (a message the owner sent and the session has not
 * been given), keep-info-guard.mjs (a commit that takes information back),
 * compact-recall.mjs and its place in hook-dispatch.mjs (the typed messages
 * printed again after a compaction), and the plan-approval deadlock between reply-guard.mjs
 * and plan-guard.mjs.
 *
 * The queue records are shaped like the real ones: an `enqueue` carries the
 * message as `content`, a `dequeue` carries nothing, a `remove` carries it.
 */
import { mkdtempSync, writeFileSync, copyFileSync, readFileSync, rmSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const FILES = ['pending-guard.mjs', 'keep-info-guard.mjs', 'compact-recall.mjs', 'reply-guard.mjs', 'transcript-tail.mjs',
  'plan-guard.mjs', 'hook-dispatch.mjs', 'report.mjs', 'drive-guard.mjs', 'approved-plan-guard.mjs'];
const MADE = [];
const tmp = (p) => { const d = mkdtempSync(join(tmpdir(), p)); MADE.push(d); return d; };

const ts = (s) => new Date(Date.parse('2026-10-01T12:00:00Z') + s * 1000).toISOString();
const enq = (s, content) => ({ type: 'queue-operation', operation: 'enqueue', timestamp: ts(s), sessionId: 't', content });
const deq = (s) => ({ type: 'queue-operation', operation: 'dequeue', timestamp: ts(s), sessionId: 't' });
const rem = (s, content) => ({ type: 'queue-operation', operation: 'remove', timestamp: ts(s), sessionId: 't', content });
const turn = (s, text) => ({ type: 'user', timestamp: ts(s), origin: { kind: 'human' }, message: { role: 'user', content: text } });
const mid = (s, text, kind = 'human', mode = 'prompt') => ({ type: 'attachment', timestamp: ts(s), attachment: { type: 'queued_command', prompt: text, commandMode: mode, origin: { kind } } });
const tool = (s, id, name, input = {}) => ({ type: 'assistant', timestamp: ts(s), message: { role: 'assistant', content: [{ type: 'tool_use', id, name, input }] } });
const result = (s, id, text, isError = false) => ({ type: 'user', timestamp: ts(s), message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content: text, is_error: isError }] } });
const boundary = (s) => ({ type: 'system', subtype: 'compact_boundary', timestamp: ts(s), compactMetadata: { trigger: 'auto' } });
const summary = (s) => ({ type: 'user', isCompactSummary: true, timestamp: ts(s), message: { role: 'user', content: 'This session is being continued from a previous conversation.' } });
const transcript = (entries) => { const f = join(tmp('sg-tr-'), 't.jsonl'); writeFileSync(f, entries.map((e) => JSON.stringify(e)).join('\n') + '\n'); return f; };

const ASK = 'Why did the restore skip 069? Answer before anything else.';
const STOPMSG = 'STOP. Nothing more until I answer.';
const NOTE = '<task-notification><task-id>w1</task-id><status>completed</status></task-notification>';

function repo(files) {
  const d = tmp('sg-repo-');
  const g = (...a) => spawnSync('git', ['-C', d, ...a], { encoding: 'utf8' });
  g('init', '-q'); g('config', 'user.email', 't@example.invalid'); g('config', 'user.name', 't'); g('config', 'commit.gpgsign', 'false');
  for (const [f, c] of Object.entries(files)) writeFileSync(join(d, f), c);
  g('add', '-A'); g('commit', '-q', '-m', 'base');
  return { dir: d, g, write: (f, c) => writeFileSync(join(d, f), c), stage: () => g('add', '-A') };
}
const SOURCE_MD = [
  '# Lens', '',
  'Per-channel division is how RawTherapee, darktable, Lightroom and CornerFix',
  'remove such a cast. Adobe\'s page on helpx.adobe.com says shading can carry a',
  'colour cast and offers an option that removes only the cast.', '',
  'The figures below were measured on three frames.', '',
  'Earlier note: the comments feed on blog.kasson.com was read in a browser\'s identity; that reading is withdrawn.', '',
].join('\n');

/** Each case: (m, dir) → true when the guards behaved. `guards` names the plants it must catch. */
const CASES = [
  // ---- pending-guard ----
  {
    name: 'an owner message enqueued and not delivered refuses the main thread, verbatim',
    guards: ['enqueue_count', 'verbatim', 'dispatch_pending'],
    run(m) {
      const r = m.pending.decide({ session_id: 't' }, [turn(0, 'start'), enq(10, ASK)]);
      return !!r && r.includes(ASK) && /end this turn/.test(r);
    },
  },
  {
    name: 'a delivered message, as the next prompt or attached mid-turn, refuses nothing',
    run(m) {
      const a = m.pending.decide({ session_id: 't' }, [enq(10, ASK), deq(20), turn(20, ASK)]);
      const b = m.pending.decide({ session_id: 't' }, [enq(10, ASK), deq(20), mid(20, ASK)]);
      return a === null && b === null;
    },
  },
  {
    name: 'a message delivered in other words (a slash command) is released by the queue count',
    guards: ['dequeue_count'],
    run(m) {
      return m.pending.decide({ session_id: 't' }, [enq(10, '/compact keep the plan'), deq(11), turn(11, '<command-name>/compact</command-name>')]) === null;
    },
  },
  {
    name: 'a task notification in the queue is not an owner message',
    guards: ['harness_tag'],
    run(m) {
      return m.pending.decide({ session_id: 't' }, [enq(10, NOTE)]) === null;
    },
  },
  {
    name: 'with a notification and an owner message queued, the one delivered by its words is released',
    guards: ['text_match'],
    run(m) {
      const held = m.pending.decide({ session_id: 't' }, [enq(10, ASK), enq(11, NOTE), deq(12), mid(12, NOTE, 'task', 'task-notification')]);
      const freed = m.pending.decide({ session_id: 't' }, [enq(10, NOTE), enq(11, ASK), deq(12), mid(12, ASK)]);
      return !!held && held.includes(ASK) && freed === null;
    },
  },
  {
    name: 'a removed message is matched by its words, so the other one stays pending',
    guards: ['remove_text'],
    run(m) {
      const r = m.pending.decide({ session_id: 't' }, [enq(10, ASK), enq(11, 'second thought, ignore that'), rem(12, 'second thought, ignore that')]);
      return !!r && r.includes(ASK) && !r.includes('second thought');
    },
  },
  {
    name: 'a subagent runs while an ordinary message waits, and stops for STOP',
    guards: ['subagent_free', 'stop_subagent'],
    run(m) {
      const ord = m.pending.decide({ session_id: 't', agent_id: 'a1' }, [enq(10, ASK)]);
      const stop = m.pending.decide({ session_id: 't', agent_id: 'a1' }, [enq(10, STOPMSG)]);
      return ord === null && !!stop && stop.includes(STOPMSG) && /subagent stops/.test(stop);
    },
  },
  {
    name: 'a queue entry from before this process started is not waited on',
    guards: ['since'],
    run(m) {
      process.env.PENDING_GUARD_DIR = tmp('sg-pg-');
      process.env.PENDING_GUARD_NOW = String(Date.parse(ts(100)));
      m.pending.markStart({ session_id: 'old' });
      delete process.env.PENDING_GUARD_NOW;
      const r = m.pending.decide({ session_id: 'old' }, [enq(10, ASK), turn(150, 'new process')]);
      const fresh = m.pending.decide({ session_id: 'old' }, [enq(10, ASK), enq(160, 'and this one')]);
      delete process.env.PENDING_GUARD_DIR;
      return r === null && !!fresh && fresh.includes('and this one') && !fresh.includes(ASK);
    },
  },
  {
    name: 'hook-dispatch runs pending-guard first and refuses with the message',
    guards: ['dispatch_pending'],
    run(m, dir) {
      const f = transcript([turn(0, 'start'), enq(10, ASK)]);
      const p = { session_id: 't', transcript_path: f, tool_name: 'Read', tool_input: { file_path: '/etc/hostname' }, hook_event_name: 'PreToolUse', cwd: tmp('sg-cwd-') };
      const r = spawnSync('node', [join(dir, 'hook-dispatch.mjs'), 'PreToolUse'], { input: JSON.stringify(p), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: p.cwd } });
      return r.status === 2 && r.stderr.includes(ASK);
    },
  },

  // ---- keep-info-guard ----
  {
    name: 'a commit adding a withdrawal tied to how the source was fetched is refused',
    guards: ['withdraw_re', 'commit_parse'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace('remove such a cast.', 'remove such a cast; Lightroom is named, not read, because Adobe\'s page was fetched in a browser\'s identity and that read is withdrawn.'));
      r.stage();
      const why = m.keep.decide({ tool_name: 'Bash', tool_input: { command: 'git commit -q -m "Notes: tidy"' }, cwd: r.dir }, []);
      return !!why && /takes back information/.test(why) && /lens\.md/.test(why);
    },
  },
  {
    name: 'the six withdrawals written on 2026-10-01 are each refused, from their own text',
    guards: ['withdraw_re', 'fetch_window'],
    run(m) {
      // Before and after, as Jefferson-Photography-Studio e3facbd and 57e9f0d wrote them.
      const pairs = [
        ['partly, 1 not supported at the page it was credited to, and 4 unreachable.\n',
          "partly, 1 not supported at the page it was credited to, and 4 unreachable. One of\nthe 24, Adobe's page on Lightroom's Flat-Field Correction, was confirmed from a\ncopy fetched in a browser's identity, and is withdrawn (2026-10-01): 23 confirmed\nand 1 withdrawn.\n"],
        ["- **Per-channel division is the field's standard.** darktable, Lightroom's Flat-Field Correction and CornerFix (read\n  in source or documentation, confirmed). Adobe's page says shading can carry a\n  colour cast.\n",
          "- **Per-channel division is the field's standard.** darktable and CornerFix (read in source or documentation,\n  confirmed). Lightroom's Flat-Field Correction is named here, not read: the\n  only copy of Adobe's page on it came from a request in a browser's identity\n  after the page had refused this session's own, so that read is withdrawn.\n"],
        ['Per-channel division is how RawTherapee, darktable, Lightroom and CornerFix\nremove such a cast. The field checks the result on neutral things.\n',
          "Per-channel division is how RawTherapee, darktable and CornerFix\nremove such a cast; Lightroom's Flat-Field Correction is named but not read (decision 085 withdraws the only copy). The field checks the result on neutral things.\n"],
        ['**Refused on this topic:** helpx.adobe.com and userguides.dxo.com (403).\n',
          "**Refused on this topic:** helpx.adobe.com (403 to the web fetcher and to a browser-identity curl; its\nflat-field page was then fetched in a browser's identity, a read withdrawn in\ndecision 085), and userguides.dxo.com (403).\n"],
        ['Refused by the site, not blocked by the network. It is the only source likely to measure it.\n',
          "Refused by the site, not blocked by the network. One request to the site's comments feed in a browser's identity, on\n2026-09-30, was answered; nothing here rests on it, and it is withdrawn. It is the only source likely to measure it.\n"],
        ['    GradientCorrection, were not read).\n',
          "    GradientCorrection, were not read). A checking agent read that\n    documentation index in a browser's identity; that reading is withdrawn,\n    and nothing here rests on it.\n"],
      ];
      return pairs.every(([b, a]) => m.keep.findings('x.md', b, a).some((f) => f.kind === 'withdrawal'));
    },
  },
  {
    name: 'a withdrawn measurement that names no fetching passes',
    guards: ['fetch_window'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      // Specific (a name, a page) and withdrawn, but nothing about fetching.
      r.write('lens.md', SOURCE_MD.replace('The figures below were measured on three frames.', "The figures below were measured on three frames. The numbers taken from Kennard's page are withdrawn, because they were read off the wrong frame."));
      r.stage();
      return m.keep.decide({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: r.dir }, []) === null;
    },
  },
  {
    name: 'a commit that drops a domain the file named is refused',
    guards: ['dropped'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace("Adobe's page on helpx.adobe.com says", "Adobe's page says"));
      r.stage();
      const why = m.keep.decide({ tool_name: 'Bash', tool_input: { command: `git -C ${r.dir} commit -m x` }, cwd: '/' }, []);
      return !!why && /no longer names helpx\.adobe\.com/.test(why);
    },
  },
  {
    name: 'an owner message naming the source and asking for removal lifts it; "never remove" does not',
    guards: ['lift', 'negation'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace("Adobe's page on helpx.adobe.com says", "Adobe's page says"));
      r.stage();
      const p = { tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: r.dir };
      const yes = m.keep.decide(p, [{ text: 'Please remove the helpx.adobe.com link from the lens notes.' }]);
      const no = m.keep.decide(p, [{ text: 'Never remove what was read on helpx.adobe.com.' }]);
      const other = m.keep.decide(p, [{ text: 'Remove the duplicate heading in NOTES.' }]);
      return yes === null && !!no && !!other;
    },
  },
  {
    name: 'the owner lift is read from the transcript',
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace("Adobe's page on helpx.adobe.com says", "Adobe's page says"));
      r.stage();
      const f = transcript([turn(0, 'start'), mid(5, 'Take out helpx.adobe.com from lens.md, it is not a source I want.')]);
      return m.keep.decide({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: r.dir, transcript_path: f }) === null;
    },
  },
  {
    name: 'an existing withdrawal re-wrapped is not an addition',
    guards: ['old_sentences'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace("Earlier note: the comments feed on blog.kasson.com was read in a browser's identity; that reading is withdrawn.", "Earlier note: the comments feed on blog.kasson.com was read in a\nbrowser's identity; that reading is withdrawn."));
      r.stage();
      return m.keep.decide({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: r.dir }, []) === null;
    },
  },
  {
    name: 'git commit -am reads the working tree, not only what is staged',
    guards: ['all_mode'],
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', SOURCE_MD.replace("Adobe's page on helpx.adobe.com says", "Adobe's page says"));
      const why = m.keep.decide({ tool_name: 'Bash', tool_input: { command: `cd ${r.dir} && git commit -am "x"` }, cwd: '/' }, []);
      return !!why && /helpx\.adobe\.com/.test(why);
    },
  },
  {
    name: 'a command that makes no commit is not read',
    run(m) {
      const r = repo({ 'lens.md': SOURCE_MD });
      r.write('lens.md', '');
      r.stage();
      return m.keep.decide({ tool_name: 'Bash', tool_input: { command: 'git log -1 && echo "git commit"' }, cwd: r.dir }, []) === null;
    },
  },

  // ---- compact-recall ----
  {
    name: 'after a compaction, the messages since the previous one come back verbatim',
    guards: ['segment_pick'],
    async run(m) {
      const A = 'first, before any compaction', B = 'second: keep every reading', C = 'third, typed mid-turn';
      const written = transcript([turn(0, A), boundary(10), summary(10), turn(20, B), mid(30, C), boundary(40), summary(40)]);
      const pending = transcript([turn(0, A), boundary(10), summary(10), turn(20, B), mid(30, C)]);
      const none = transcript([turn(0, A), turn(5, B)]);
      const w = await m.recall.messagesSinceCompaction(written);
      const p = await m.recall.messagesSinceCompaction(pending);
      const n = await m.recall.messagesSinceCompaction(none);
      return w.map((x) => x.text).join('|') === `${B}|${C}` && p.map((x) => x.text).join('|') === `${B}|${C}` && n.length === 2;
    },
  },
  {
    name: 'hook-dispatch prints the owner\'s messages first after a compaction',
    guards: ['dispatch_recall'],
    run(m, dir) {
      const B = 'restore 085 before anything else';
      const f = transcript([turn(0, 'start'), boundary(10), summary(10), turn(20, B), tool(25, 'u1', 'Bash', { command: 'ls' }), result(26, 'u1', 'x'), boundary(40), summary(40)]);
      const cwd = tmp('sg-cwd-');
      const r = spawnSync('node', [join(dir, 'hook-dispatch.mjs'), 'SessionStart'], { input: JSON.stringify({ session_id: 't', source: 'compact', transcript_path: f, cwd }), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: cwd } });
      const out = r.stdout ?? '';
      return r.status === 0 && out.indexOf(B) >= 0 && out.indexOf(B) < out.indexOf('AFTER COMPACTION');
    },
  },

  // ---- the plan-approval deadlock ----
  {
    name: 'a rejected ExitPlanMode is not recorded as a failed call, and does not hold the next one',
    guards: ['plan_tool_record', 'plan_tool_catchup', 'plan_tool_repeat'],
    run(m) {
      process.env.REPLY_LEDGER_DIR = tmp('sg-ledger-');
      // The ledger's clock starts before the transcript's entries, or catch-up skips them.
      process.env.REPLY_GUARD_NOW = String(Date.parse(ts(-5)));
      const exit = { session_id: 'd', tool_name: 'ExitPlanMode', tool_input: { plan: 'x' } };
      m.reply.record({ ...exit, tool_use_id: 'e1', error: 'The plan was rejected: answer the question about 069 first.' }, 'PostToolUseFailure');
      const recorded = m.reply.load({ session_id: 'd' }).some((e) => e.kind === 'fail');
      const f = transcript([tool(0, 'e2', 'ExitPlanMode', { plan: 'x' }), result(1, 'e2', 'The plan was rejected, keep planning.', true)]);
      const again = m.reply.decide({ ...exit, transcript_path: f });
      const caught = m.reply.load({ session_id: 'd' }).some((e) => e.kind === 'fail');
      // A ledger written before the fix still holds a failed ExitPlanMode.
      appendFileSync(join(process.env.REPLY_LEDGER_DIR, 'd.jsonl'), JSON.stringify({ kind: 'fail', agent: 'main', tool: 'ExitPlanMode', h: m.reply.callHash('ExitPlanMode', exit.tool_input), id: 'abcd1234', text: 'rejected', t: 0 }) + '\n');
      const legacy = m.reply.decide({ ...exit });
      delete process.env.REPLY_LEDGER_DIR;
      delete process.env.REPLY_GUARD_NOW;
      return !recorded && again === null && !caught && legacy === null;
    },
  },
  {
    name: 'plan mode allows exactly a reply-guard reading, and nothing riding with it',
    guards: ['plan_guard_read'],
    run(m, dir) {
      const pg = (command) => spawnSync('node', [join(dir, 'plan-guard.mjs')], { input: JSON.stringify({ session_id: 't', permission_mode: 'plan', tool_name: 'Bash', tool_input: { command }, cwd: '/' }), encoding: 'utf8' }).status;
      const self = join(dir, 'reply-guard.mjs');
      const ok = pg(`node ${self} --read call:abcd1234 --said "The plan was rejected" --route "answered the question first, then proposed again"`);
      const chained = pg(`node ${self} --read call:abcd1234 --said "The plan was rejected" --route "answered it" && touch /tmp/x`);
      const elsewhere = pg(`node /tmp/reply-guard.mjs --read call:abcd1234 --said "The plan was rejected" --route "answered it first"`);
      return ok === 0 && chained === 2 && elsewhere === 2;
    },
  },
];

const PLANTS = {
  enqueue_count: ['        size++;\n', '\n', 'pending-guard.mjs'],
  dequeue_count: ["      } else if (e.operation === 'dequeue') {\n        size = Math.max(0, size - 1);", "      } else if (e.operation === 'dequeue') {\n", 'pending-guard.mjs'],
  text_match: ['for (const x of items) if (!x.done && x.key && (t.includes(x.key)', 'for (const x of items) if (false && !x.done && x.key && (t.includes(x.key)', 'pending-guard.mjs'],
  harness_tag: ['const HARNESS_TAG = /^\\s*<(?:task-notification|', 'const HARNESS_TAG = /^NEVER<(?:task-notification|', 'pending-guard.mjs'],
  remove_text: ['        if (c) take((x) => x.key === norm(c));\n', '\n', 'pending-guard.mjs'],
  stop_subagent: ['  if (p.agent_id && !stop) return null;', '  if (p.agent_id) return null;', 'pending-guard.mjs'],
  subagent_free: ['  if (p.agent_id && !stop) return null;', '  if (false && p.agent_id && !stop) return null;', 'pending-guard.mjs'],
  since: ['      if (since && Number.isFinite(at) && at < since) continue;\n', '\n', 'pending-guard.mjs'],
  verbatim: ['---\\n${m.text}`', '---\\n(a message)`', 'pending-guard.mjs'],
  dispatch_pending: ["    if (pg.deny) { process.stderr.write(pg.reason + '\\n'); return 2; }\n", '\n', 'hook-dispatch.mjs'],
  withdraw_re: ['    const hits = s.match(WITHDRAW);', '    const hits = null;', 'keep-info-guard.mjs'],
  commit_parse: ["    if (w[k] !== 'commit') continue;", "    if (w[k] !== 'commit-never') continue;", 'keep-info-guard.mjs'],
  fetch_window: ['    if (!fetch || !specific) return;', '    if (!specific) return;', 'keep-info-guard.mjs'],
  dropped: ['    if (kept.has(d)) continue;\n', '    continue;\n', 'keep-info-guard.mjs'],
  lift: ["(?![A-Za-z0-9])`, 'i').test(clause))) return true;", "(?![A-Za-z0-9])`, 'i').test(clause))) return false;", 'keep-info-guard.mjs'],
  negation: ['      if (!REMOVE.test(clause) || NEGATED.test(clause)) continue;', '      if (!REMOVE.test(clause)) continue;', 'keep-info-guard.mjs'],
  old_sentences: ['    if (old.has(s)) return;\n', '\n', 'keep-info-guard.mjs'],
  all_mode: ["if (x.includes('a')) all = true; ", '', 'keep-info-guard.mjs'],
  segment_pick: ['  return last.length || segs.length < 2 ? last : segs.at(-2);', '  return last;', 'compact-recall.mjs'],
  dispatch_recall: ['    if (recall) printed.push(recall);\n', '\n', 'hook-dispatch.mjs'],
  plan_tool_record: ['    if (!PLAN_TOOL.test(tool) && !NOT_A_FAILURE.test(out)', '    if (!NOT_A_FAILURE.test(out)', 'reply-guard.mjs'],
  plan_tool_catchup: ["if (b.is_error && !PLAN_TOOL.test(u.name ?? '') && ", 'if (b.is_error && ', 'reply-guard.mjs'],
  plan_tool_repeat: ['  if (!PLAN_TOOL.test(tool)) for (let i = ev.length - 1;', '  for (let i = ev.length - 1;', 'reply-guard.mjs'],
  plan_guard_read: ['  if (reading && !reading.bad) process.exit(0);', '', 'plan-guard.mjs'],
};

async function runAll(dir, only) {
  const imp = (f) => import(pathToFileURL(join(dir, f)).href + `?v=${Math.random()}`);
  const m = { pending: await imp('pending-guard.mjs'), keep: await imp('keep-info-guard.mjs'), recall: await imp('compact-recall.mjs'), reply: await imp('reply-guard.mjs') };
  const results = [];
  for (const c of CASES) {
    if (only && !(c.guards ?? []).includes(only)) continue;
    let ok = false, err;
    try { ok = await c.run(m, dir); } catch (e) { ok = false; err = e?.message; }
    results.push({ name: c.name, ok, err });
    while (MADE.length) rmSync(MADE.pop(), { recursive: true, force: true });
  }
  return results;
}

if (process.argv.includes('--plants')) {
  let bad = 0;
  for (const [key, [from, to, file]] of Object.entries(PLANTS)) {
    const src = readFileSync(join(HERE, file), 'utf8');
    if (!src.includes(from)) { console.log(`PLANT ${key}: the line to take out is not in ${file} — the plant is stale`); bad++; continue; }
    const dir = mkdtempSync(join(tmpdir(), 'sg-plant-'));
    for (const f of FILES) copyFileSync(join(HERE, f), join(dir, f));
    writeFileSync(join(dir, file), src.replace(from, to));
    const r = await runAll(dir, key);
    const caught = r.length > 0 && r.some((x) => !x.ok);
    if (!r.length) console.log(`PLANT ${key}: no case names it in its guards`);
    console.log(`${caught ? 'CAUGHT' : 'MISSED'}  plant "${key}" in ${file}${caught ? '' : ' — its cases still passed'}`);
    if (!caught) bad++;
    rmSync(dir, { recursive: true, force: true });
  }
  process.exit(bad ? 1 : 0);
} else {
  const r = await runAll(HERE);
  for (const x of r) console.log(`${x.ok ? 'PASS' : 'FAIL'}  ${x.name}${x.err ? ` (${x.err})` : ''}`);
  const failedN = r.filter((x) => !x.ok).length;
  console.log(`${r.length - failedN}/${r.length} passed`);
  process.exit(failedN ? 1 : 0);
}
