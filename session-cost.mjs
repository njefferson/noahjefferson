#!/usr/bin/env node
/**
 * WHAT A SESSION COST, COUNTED BY EVENT AND NEVER BY MENTION.
 *
 * A figure that goes into a plan was once taken by a search that counted every
 * place a phrase appeared, in a report, a prompt or quoted gate code, and it
 * came out about twice the real number of events (the audit of 1 November,
 * finding 13). This reads each entry of a session transcript and counts only
 * what the entry IS: a message the owner typed, a refusal carried by the entry
 * a hook wrote, a turn a model served with the usage that turn carries, an agent
 * with the usage read from its own transcript, a notification, a compaction, a
 * resume.
 *
 * Usage:  node session-cost.mjs <transcript.jsonl> [<transcript.jsonl> ...]
 *
 * Each argument is a session transcript lying directly in a project folder
 * under /root/.claude/projects/. A session's agents are read through its own
 * subagents folder (the workflow runs below it included) and are never passed
 * as arguments of their own, so none is counted twice; an argument inside a
 * subagents folder is refused with a printed line.
 *
 * Splits: a plan begins at each approved exit from plan mode the transcript
 * records (a tool result opening "User has approved your plan"); what comes
 * before the first is its own part. An approval that carries the same plan
 * title as the one before it is the same plan approved again after an
 * amendment, and is listed under that plan rather than starting another. An agent belongs to the plan in force at
 * its first entry. A model's turn is deduplicated by the message id it carries,
 * because one reply can be written as several entries that repeat its usage.
 *
 * Each plan's heading carries the plan's title line and the first program key of its Item section, read from the plan text the approval
 * result carries, or from the plan file as last written under a plans folder (the Write call's input) when that has the same title.
 * Where none is read the heading says no title read or no item read.
 *
 * Prints counts and nothing else: no owner message, no agent id, no task id.
 * Times are California time.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isOwnerMessage, textOf } from './transcript-tail.mjs';
import { endsWithGoWord } from './hook-dispatch.mjs';

console.log('MADE TO FAIL: the planted transcript holds 3 owner messages (2 ending in a go-word), 1 stop refusal, 2 main-thread turns, 2 approved plans (the first approved 2 times) with their titles and program items, 1 agent and 1 compaction; the counts and the two titles printed next must read the same');
console.log('nothing below is trustworthy unless the planted counts printed next equal those figures');

const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const add = (m, k, n = 1) => m.set(k, (m.get(k) ?? 0) + n);
const sum = (m) => [...m.values()].reduce((a, b) => a + b, 0);
const when = (ts) => {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return 'an unknown time';
  const s = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  return s + ' California time';
};

const newUsage = () => ({ msgs: 0, entries: 0, inT: 0, outT: 0, cr: 0, cc: 0 });
const addUsage = (rec, u, entries) => {
  rec.msgs += 1;
  rec.entries += entries;
  rec.inT += u.inT; rec.outT += u.outT; rec.cr += u.cr; rec.cc += u.cc;
};
const newBucket = () => ({
  approvedAt: null, reapprovedAt: [], title: null, item: null,
  owner: 0, ownerGo: 0, ownerStop: 0,
  stopMeta: 0, stopSummaries: 0, stopMsgs: new Map(), stopByHook: new Map(),
  pre: new Map(), preLoose: 0, blocking: new Map(),
  turns: new Map(),
  agentCount: new Map(), agentUse: new Map(), agentRefusals: new Map(), agentLoose: 0,
  notif: new Set(), notifForms: 0, handbacks: 0,
  compactions: [], resumes: 0, startups: 0, compactHooks: 0,
});

const resultText = (b) => {
  const c = b?.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map((x) => x?.text ?? '').join('\n');
  return '';
};

// The title line and the first program key of a plan's Item section, read from the plan's text. Either is null where the text holds none.
function planIdentity(text) {
  const t = String(text ?? '');
  const title = t.match(/^#\s*([^\n]+)/m)?.[1]?.trim() ?? null;
  const section = /^## Item\b[^\n]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(t)?.[1] ?? '';
  return { title, item: section.match(/\bP-\d+\b/)?.[0] ?? null };
}

// The gate a refusal names in its own text. A refusal whose text names none is counted as unnamed, never guessed.
function gateOf(t) {
  const x = t.replace(/^\[[^\]]*\]:\s*/, '');
  const m = x.match(/([A-Z][A-Z ]*[A-Z]) (GATE|FENCE)\b/);
  if (m) return m[1].toLowerCase() + ' ' + m[2].toLowerCase();
  if (/^CORRECTION\b/.test(x)) return 'correction hold';
  if (/^STOP \(/.test(x)) return 'stop word hold';
  if (/pending-guard/.test(x)) return 'pending-guard';
  if (/reply-guard/.test(x)) return 'reply-guard';
  if (/approved-plan-guard|^This edit would change/.test(x)) return 'approved-plan-guard';
  if (/ended since the owner last got a status/.test(x)) return 'status gate';
  if (/^PLAN MODE\b/.test(x)) return 'plan-guard (plan mode)';
  return 'unnamed in its text';
}
// The opening words of a stop refusal, with the quoted and bracketed parts and the numbers taken out so the same shape groups.
function opening(t) {
  return t.replace(/^\[[^\]]*\]:\s*/, '').replace(/\s+/g, ' ').replace(/\([^)]*\)/g, '').replace(/"[^"]*"/g, '').replace(/\d+/g, 'N').trim().split(' ').slice(0, 9).join(' ');
}

// A refusal is the tool result a hook's refusal opens, never a mention of one inside a file that was read.
function countRefusals(e, into, tally) {
  const c = e.message?.content;
  if (e.type !== 'user' || !Array.isArray(c)) return;
  for (const b of c) {
    if (b?.type !== 'tool_result') continue;
    const t = resultText(b);
    if (!/hook error/.test(t)) continue;
    tally.loose += 1;
    const head = t.slice(0, 80);
    if (!/^\s*(?:[A-Za-z ]*:\s*)?(?:PreToolUse|PostToolUse)[:A-Za-z_*|-]* hook error/.test(head)) continue;
    const after = t.replace(/^[\s\S]*?hook error:\s*/, '');
    add(into, gateOf(after));
  }
}

function scanMain(lines) {
  const buckets = [newBucket()];
  const approvals = [];
  let seg = 0;
  let bad = 0;
  let lastTitle = null;
  // The plan file as last written under a plans folder, from the Write call's own input, so an approval whose result carries no Item is read against it.
  let lastWrite = { title: null, item: null };
  let lastCost = null;
  let costStates = 0;
  const msgs = new Map();
  const hookTimes = [];
  const loose = { loose: 0 };
  for (const line of lines) {
    if (!line.trim()) continue;
    let e;
    try { e = JSON.parse(line); } catch { bad += 1; continue; }
    const content = e.message?.content;
    if (e.type === 'assistant' && Array.isArray(content)) {
      for (const b of content) {
        if (b?.type === 'tool_use' && b.name === 'Write' && /\/plans\/[^/]+\.md$/.test(String(b.input?.file_path ?? '')) && !/\.steps\.md$/.test(String(b.input?.file_path ?? ''))) {
          lastWrite = planIdentity(b.input?.content);
        }
      }
    }
    if (e.type === 'user' && Array.isArray(content)) {
      for (const b of content) {
        const rt = b?.type === 'tool_result' ? resultText(b) : '';
        if (rt.startsWith('User has approved your plan')) {
          // The same plan approved again after an amendment is one plan, not two: the title the approval carries tells them apart.
          const title = rt.match(/Approved Plan[^\n]*\n#\s*([^\n]+)/)?.[1] ?? null;
          // The plan's title and program item: from the plan text the approval carries, else from the plan file as last written when its title is the same.
          const shown = planIdentity(rt.replace(/^[\s\S]*?Approved Plan[^\n]*\n/, ''));
          const item = shown.item ?? (lastWrite.title && lastWrite.title === (title ?? shown.title) ? lastWrite.item : null);
          if (seg > 0 && title && title === lastTitle) {
            buckets[seg].reapprovedAt.push(e.timestamp);
            if (!buckets[seg].item) buckets[seg].item = item;
          } else {
            seg += 1;
            buckets[seg] = newBucket();
            buckets[seg].approvedAt = e.timestamp;
            buckets[seg].title = title ?? shown.title ?? lastWrite.title;
            buckets[seg].item = item;
            approvals.push(e.timestamp);
          }
          lastTitle = title;
        }
      }
    }
    const bk = buckets[seg];
    if (isOwnerMessage(e)) {
      bk.owner += 1;
      const text = textOf(e);
      if (endsWithGoWord(text)) bk.ownerGo += 1;
      else if (/\bstop\b/i.test(text)) bk.ownerStop += 1;
    }
    if (e.type === 'user' && e.isMeta && typeof content === 'string' && content.startsWith('Stop hook fee')) bk.stopMeta += 1;
    if (e.type === 'user' && e.isMeta && e.origin?.kind === 'peer') bk.handbacks += 1;
    if (e.type === 'user' && e.origin?.kind === 'task-notification') {
      bk.notifForms += 1;
      const t = textOf(e);
      const id = t.match(/<task-id>([^<]+)<\/task-id>/)?.[1];
      if (id) bk.notif.add(id + '|' + (t.match(/<status>([^<]+)<\/status>/)?.[1] ?? ''));
    }
    if (e.type === 'attachment' && e.attachment?.type === 'queued_command' && e.attachment.commandMode === 'task-notification') {
      bk.notifForms += 1;
      const t = typeof e.attachment.prompt === 'string' ? e.attachment.prompt : '';
      const id = t.match(/<task-id>([^<]+)<\/task-id>/)?.[1];
      if (id) bk.notif.add(id + '|' + (t.match(/<status>([^<]+)<\/status>/)?.[1] ?? ''));
    }
    countRefusals(e, bk.pre, loose);
    if (e.type === 'attachment' && e.attachment?.type === 'hook_blocking_error') {
      const be = e.attachment.blockingError;
      const t = typeof be === 'string' ? be : be?.blockingError ?? '';
      add(bk.blocking, String(e.attachment.hookName ?? 'a hook') + ' ' + gateOf(String(t)));
    }
    if (e.type === 'system' && e.subtype === 'stop_hook_summary' && Array.isArray(e.hookErrors) && e.hookErrors.length) {
      bk.stopSummaries += 1;
      for (const h of e.hookErrors) {
        const s = String(h);
        const hook = (s.match(/^\[([^\]]*)\]/)?.[1] ?? 'a hook').split('/').pop();
        add(bk.stopByHook, hook);
        add(bk.stopMsgs, hook + ': ' + opening(s));
      }
    }
    if (e.type === 'system' && e.subtype === 'compact_boundary') {
      bk.compactions.push({ ts: e.timestamp, pre: e.compactMetadata?.preTokens, post: e.compactMetadata?.postTokens, trigger: e.compactMetadata?.trigger });
    }
    if (e.type === 'attachment' && e.attachment?.type === 'hook_success') {
      const hn = e.attachment.hookName;
      if (hn === 'SessionStart:resume' || hn === 'SessionStart:startup' || hn === 'SessionStart:compact') hookTimes.push({ seg, hn, t: Date.parse(e.timestamp) });
    }
    if (e.type === 'cost-state') { lastCost = e; costStates += 1; }
    if (e.type === 'assistant' && e.message) {
      const key = e.message.id ?? e.requestId ?? e.uuid;
      const u = e.message.usage ?? {};
      const cur = { inT: u.input_tokens ?? 0, outT: u.output_tokens ?? 0, cr: u.cache_read_input_tokens ?? 0, cc: u.cache_creation_input_tokens ?? 0 };
      const rec = msgs.get(key);
      if (!rec) msgs.set(key, { seg, model: e.message.model ?? 'unknown', entries: 1, u: cur });
      else {
        rec.entries += 1;
        for (const k of Object.keys(cur)) rec.u[k] = Math.max(rec.u[k], cur[k]);
      }
    }
  }
  for (const rec of msgs.values()) {
    const m = buckets[rec.seg].turns;
    if (!m.has(rec.model)) m.set(rec.model, newUsage());
    addUsage(m.get(rec.model), rec.u, rec.entries);
  }
  // A start, a resume or a compaction runs two hooks; entries of one event lie within two minutes of each other.
  for (const hn of ['SessionStart:resume', 'SessionStart:startup', 'SessionStart:compact']) {
    const ts = hookTimes.filter((h) => h.hn === hn).sort((a, b) => a.t - b.t);
    let last = -Infinity;
    for (const h of ts) {
      if (h.t - last > 120000) {
        if (hn === 'SessionStart:resume') buckets[h.seg].resumes += 1;
        else if (hn === 'SessionStart:startup') buckets[h.seg].startups += 1;
        else buckets[h.seg].compactHooks += 1;
      }
      last = h.t;
    }
  }
  return { buckets, approvals, bad, lastCost, costStates, preLoose: loose.loose };
}

function scanAgent(lines) {
  const msgs = new Map();
  const refusals = new Map();
  const tally = { loose: 0 };
  let firstTs = null;
  let bad = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    let e;
    try { e = JSON.parse(line); } catch { bad += 1; continue; }
    if (e.timestamp && (!firstTs || e.timestamp < firstTs)) firstTs = e.timestamp;
    countRefusals(e, refusals, tally);
    if (e.type === 'assistant' && e.message) {
      const key = e.message.id ?? e.requestId ?? e.uuid;
      const u = e.message.usage ?? {};
      const cur = { inT: u.input_tokens ?? 0, outT: u.output_tokens ?? 0, cr: u.cache_read_input_tokens ?? 0, cc: u.cache_creation_input_tokens ?? 0 };
      const rec = msgs.get(key);
      if (!rec) msgs.set(key, { model: e.message.model ?? 'unknown', entries: 1, u: cur });
      else {
        rec.entries += 1;
        for (const k of Object.keys(cur)) rec.u[k] = Math.max(rec.u[k], cur[k]);
      }
    }
  }
  return { msgs, refusals, firstTs, bad, loose: tally.loose };
}

function agentFiles(sessionDir) {
  const out = [];
  const walk = (d) => {
    let names = [];
    try { names = readdirSync(d); } catch { return; }
    for (const n of names) {
      const p = join(d, n);
      let st;
      try { st = statSync(p); } catch { continue; }
      if (st.isDirectory()) walk(p);
      else if (/^agent-.*\.jsonl$/.test(n)) out.push(p);
    }
  };
  walk(join(sessionDir, 'subagents'));
  return out.sort();
}

function analyse(mainLines, agentLineSets) {
  const main = scanMain(mainLines);
  let agentBad = 0;
  let agentLoose = 0;
  for (const lines of agentLineSets) {
    const a = scanAgent(lines);
    agentBad += a.bad;
    agentLoose += a.loose;
    let seg = 0;
    for (const t of main.approvals) if (a.firstTs && t <= a.firstTs) seg += 1;
    const bk = main.buckets[seg];
    const perModel = new Map();
    for (const rec of a.msgs.values()) add(perModel, rec.model);
    const primary = [...perModel].sort((x, y) => y[1] - x[1])[0]?.[0] ?? 'no model turn';
    add(bk.agentCount, primary);
    for (const rec of a.msgs.values()) {
      if (!bk.agentUse.has(rec.model)) bk.agentUse.set(rec.model, newUsage());
      addUsage(bk.agentUse.get(rec.model), rec.u, rec.entries);
    }
    for (const [k, v] of a.refusals) add(bk.agentRefusals, k, v);
  }
  return { ...main, agentBad, agentLoose };
}

function mergeUse(into, from) {
  for (const [k, v] of from) {
    if (!into.has(k)) into.set(k, newUsage());
    const t = into.get(k);
    for (const f of Object.keys(t)) t[f] += v[f];
  }
}
function mergeBucket(into, b) {
  for (const k of ['owner', 'ownerGo', 'ownerStop', 'stopMeta', 'stopSummaries', 'preLoose', 'agentLoose', 'notifForms', 'handbacks', 'resumes', 'startups', 'compactHooks']) into[k] += b[k] ?? 0;
  for (const k of ['stopMsgs', 'stopByHook', 'pre', 'blocking', 'agentCount', 'agentRefusals']) for (const [x, v] of b[k]) add(into[k], x, v);
  mergeUse(into.turns, b.turns);
  mergeUse(into.agentUse, b.agentUse);
  for (const x of b.notif) into.notif.add(x);
  into.compactions.push(...b.compactions);
}

const list = (m, indent = '  ') => (m.size ? [...m].sort((a, b) => b[1] - a[1]).map(([k, v]) => indent + '- ' + fmt(v) + '  ' + k).join('\n') : indent + '- none');
const useLines = (m, indent = '  ') => (m.size
  ? [...m].sort((a, b) => b[1].msgs - a[1].msgs).map(([k, v]) => indent + '- ' + k + ': ' + fmt(v.msgs) + ' turns (' + fmt(v.entries) + ' entries), input ' + fmt(v.inT) + ', output ' + fmt(v.outT) + ', cache read ' + fmt(v.cr) + ', cache written ' + fmt(v.cc)).join('\n')
  : indent + '- none');

function printBucket(title, b) {
  const out = [];
  out.push('## ' + title);
  out.push('Owner messages: ' + fmt(b.owner) + ' (ending in a go-word: ' + fmt(b.ownerGo) + '; not ending in one: ' + fmt(b.owner - b.ownerGo) + ', of which carrying the whole word stop: ' + fmt(b.ownerStop) + ')');
  out.push('Stop-hook refusals, from the system entries that sum the stop hooks: ' + fmt(sum(b.stopByHook)) + ' messages in ' + fmt(b.stopSummaries) + ' stops; the user entries that carry the stop-hook message: ' + fmt(b.stopMeta));
  out.push('Stop-hook refusals by hook:\n' + list(b.stopByHook));
  out.push('Stop-hook refusals by opening words:\n' + list(b.stopMsgs));
  out.push('Hook refusals on the main thread, by the gate named in their text: ' + fmt(sum(b.pre)) + '\n' + list(b.pre));
  out.push('Post-tool hook blocking errors on the main thread: ' + fmt(sum(b.blocking)) + '\n' + list(b.blocking));
  out.push('Main-thread turns by serving model:\n' + useLines(b.turns));
  out.push('Agents: ' + fmt(sum(b.agentCount)) + ', by the model that served most of each\n' + list(b.agentCount));
  out.push('Agent usage by model, read from each agent\'s own transcript:\n' + useLines(b.agentUse));
  out.push('Agent hook refusals by the gate named in their text: ' + fmt(sum(b.agentRefusals)) + '\n' + list(b.agentRefusals));
  out.push('Task notifications: ' + fmt(b.notif.size) + ' distinct (' + fmt(b.notifForms) + ' entries carry one); agent hand-backs received: ' + fmt(b.handbacks));
  out.push('Compactions: ' + fmt(b.compactions.length) + (b.compactions.length ? ' (' + b.compactions.map((c) => when(c.ts) + ', ' + (c.trigger ?? 'unknown') + ', context ' + fmt(c.pre) + ' down to ' + fmt(c.post)).join('; ') + ')' : ''));
  out.push('Starts: ' + fmt(b.startups) + '; resumes: ' + fmt(b.resumes) + '; compaction start hooks: ' + fmt(b.compactHooks));
  return out.join('\n');
}

function planted() {
  const L = (o) => JSON.stringify(o);
  const owner = (text, ts) => L({ type: 'user', timestamp: ts, origin: { kind: 'human' }, message: { role: 'user', content: text } });
  const asst = (id, model, ts, u) => L({ type: 'assistant', timestamp: ts, message: { id, role: 'assistant', model, usage: { input_tokens: u, output_tokens: u * 2, cache_read_input_tokens: u * 10, cache_creation_input_tokens: u * 5 } } });
  const main = [
    owner('please do the thing, go', '2026-11-01T01:00:00.000Z'),
    asst('plant-one', 'model-a', '2026-11-01T01:01:00.000Z', 10),
    asst('plant-one', 'model-a', '2026-11-01T01:01:01.000Z', 10),
    L({ type: 'system', subtype: 'stop_hook_summary', timestamp: '2026-11-01T01:02:00.000Z', hookErrors: ['[$CLAUDE_PROJECT_DIR/.claude/hooks/stop-guard.sh]: STOP REFUSED this reply says the work is not finished ("still running")'] }),
    L({ type: 'user', timestamp: '2026-11-01T01:03:00.000Z', message: { role: 'user', content: [{ type: 'tool_result', content: 'User has approved your plan. You can now start.\n\n## Approved Plan:\n# A planted title\n\n## Item\n\nP-99 of the planted program.\n\n## Asked\n\nnothing' }] } }),
    owner('stop everything now', '2026-11-01T01:04:00.000Z'),
    L({ type: 'user', timestamp: '2026-11-01T01:04:10.000Z', message: { role: 'user', content: [{ type: 'tool_result', content: 'User has approved your plan. You can now start.\n\n## Approved Plan:\n# A planted title' }] } }),
    L({ type: 'attachment', timestamp: '2026-11-01T01:05:00.000Z', attachment: { type: 'queued_command', commandMode: 'prompt', origin: { kind: 'human' }, prompt: 'ok' } }),
    asst('plant-two', 'model-b', '2026-11-01T01:06:00.000Z', 20),
    L({ type: 'user', timestamp: '2026-11-01T01:07:00.000Z', message: { role: 'user', content: [{ type: 'tool_result', is_error: true, content: 'PreToolUse:Bash hook error: [node "x"]: PLAN FENCE (Doctrine): an agent works only inside the plan' }] } }),
    L({ type: 'user', timestamp: '2026-11-01T01:08:00.000Z', message: { role: 'user', content: [{ type: 'tool_result', content: 'a file that quotes PreToolUse:Bash hook error: [node "x"]: PLAN FENCE as a mention' }] } }),
    L({ type: 'user', timestamp: '2026-11-01T01:09:00.000Z', origin: { kind: 'task-notification' }, message: { role: 'user', content: '<task-notification><task-id>plant-task</task-id><status>completed</status></task-notification>' } }),
    L({ type: 'attachment', timestamp: '2026-11-01T01:09:01.000Z', attachment: { type: 'queued_command', commandMode: 'task-notification', prompt: '<task-notification><task-id>plant-task</task-id><status>completed</status></task-notification>' } }),
    L({ type: 'system', subtype: 'compact_boundary', timestamp: '2026-11-01T01:10:00.000Z', compactMetadata: { trigger: 'auto', preTokens: 900, postTokens: 20 } }),
    // A second plan: its file written under a plans folder (the same message as plant-two, so no turn is added), then approved with a result that carries only the title.
    L({ type: 'assistant', timestamp: '2026-11-01T01:10:30.000Z', message: { id: 'plant-two', role: 'assistant', model: 'model-b', usage: { input_tokens: 20, output_tokens: 40, cache_read_input_tokens: 200, cache_creation_input_tokens: 100 }, content: [{ type: 'tool_use', name: 'Write', input: { file_path: '/root/.claude/plans/planted-two.md', content: '# A second planted title\n\n## Item\n\nP-98 of the planted program.\n\n## Asked\n\nnothing' } }] } }),
    L({ type: 'user', timestamp: '2026-11-01T01:11:00.000Z', message: { role: 'user', content: [{ type: 'tool_result', content: 'User has approved your plan. You can now start.\n\n## Approved Plan:\n# A second planted title' }] } }),
  ];
  const agent = [
    asst('plant-agent-one', 'model-c', '2026-11-01T01:04:30.000Z', 5),
    asst('plant-agent-two', 'model-c', '2026-11-01T01:04:40.000Z', 5),
  ];
  return analyse(main, [agent]);
}

const p = planted();
const pTotal = newBucket();
for (const b of p.buckets) mergeBucket(pTotal, b);
const got = {
  owner: pTotal.owner, go: pTotal.ownerGo, stop: sum(pTotal.stopByHook), turns: sum(new Map([...pTotal.turns].map(([k, v]) => [k, v.msgs]))),
  plans: p.approvals.length, reapprovals: p.buckets.reduce((n, b) => n + b.reapprovedAt.length, 0), agents: sum(pTotal.agentCount), compactions: pTotal.compactions.length,
  refusals: sum(pTotal.pre), mentions: p.preLoose, notifications: pTotal.notif.size,
  titles: p.buckets.slice(1).map((b) => (b.item ?? 'no item read') + ': ' + (b.title ?? 'no title read')).join('; '),
};
console.log('planted counts: ' + JSON.stringify(got));
const want = { owner: 3, go: 2, stop: 1, turns: 2, plans: 2, reapprovals: 1, agents: 1, compactions: 1, refusals: 1, mentions: 2, notifications: 1, titles: 'P-99: A planted title; P-98: A second planted title' };
if (JSON.stringify(got) !== JSON.stringify(want)) {
  console.log('PLANTED COUNTS DO NOT MATCH ' + JSON.stringify(want) + '; nothing below is trustworthy and the run stops');
  process.exit(1);
}
console.log('planted counts match the known figures; reading the transcripts named');

const args = process.argv.slice(2);
if (!args.length) {
  console.log('usage: node session-cost.mjs <session transcript>...');
  process.exit(0);
}
const grand = newBucket();
let planCount = 0;
let any = false;
for (const path of args) {
  if (path.includes('/subagents/')) {
    console.log('REFUSED ' + path + ': an agent transcript is read through its own session and is never passed as an argument, so no agent is counted twice');
    continue;
  }
  if (!existsSync(path) || !path.endsWith('.jsonl')) {
    console.log('SKIPPED ' + path + ': not a session transcript that exists');
    continue;
  }
  any = true;
  const sessionDir = path.replace(/\.jsonl$/, '');
  const files = agentFiles(sessionDir);
  const r = analyse(readFileSync(path, 'utf8').split('\n'), files.map((f) => readFileSync(f, 'utf8').split('\n')));
  console.log('\n# One session transcript: ' + fmt(files.length) + ' agent transcripts found below it, ' + fmt(r.bad) + ' unreadable lines in it and ' + fmt(r.agentBad) + ' in the agents\'');
  console.log('Refusal-shaped tool results that were mentions of a refusal and not one, left out: main thread ' + fmt(r.preLoose - sum(r.buckets.reduce((m, b) => { for (const [k, v] of b.pre) add(m, k, v); return m; }, new Map()))) + ', agents ' + fmt(r.agentLoose - sum(r.buckets.reduce((m, b) => { for (const [k, v] of b.agentRefusals) add(m, k, v); return m; }, new Map()))));
  r.buckets.forEach((b, i) => {
    const again = b.reapprovedAt.length ? ', approved again after an amendment at ' + b.reapprovedAt.map(when).join(' and ') : '';
    console.log('\n' + printBucket(i === 0 ? 'Before the first approved plan' : 'Plan ' + i + ' (' + (b.item ?? 'no item read') + ': ' + (b.title ?? 'no title read') + '), approved ' + when(b.approvedAt) + again, b));
    mergeBucket(grand, b);
  });
  planCount += r.approvals.length;
  if (r.lastCost) {
    const c = r.lastCost;
    console.log('\nThe harness\'s own running cost entry, the last of ' + fmt(r.costStates) + ': total ' + (c.totalCostUSD ?? 'unknown') + ' dollars; it carries the models: ' + Object.keys(c.modelUsage ?? {}).join(', '));
    for (const [m, v] of Object.entries(c.modelUsage ?? {})) console.log('  - ' + m + ': input ' + fmt(v.inputTokens) + ', output ' + fmt(v.outputTokens) + ', cache read ' + fmt(v.cacheReadInputTokens) + ', cache written ' + fmt(v.cacheCreationInputTokens));
  }
}
if (any) console.log('\n' + printBucket('Total over every transcript named (' + fmt(planCount) + ' approved plans)', grand));
process.exit(0);
