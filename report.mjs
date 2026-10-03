#!/usr/bin/env node
/**
 * A STATUS AT LEAST EVERY FIVE MINUTES, OR NOTHING ELSE RUNS (LESSONS §370).
 *
 * The owner's measure of silence is not a pause between tool calls; it is
 * hours of work with no idea when the next report comes. A rule saying so was
 * broken in the session that wrote it, and a hook cannot read chat to check it
 * — a session's text between tool calls reaches the transcript for only some
 * messages (2,253 of 7,400 measured). So the status carries its own stamp.
 *
 *   node report.mjs "Status HH:MM — done: …; running: …; next: …; next status by HH:MM"
 *       stamps the time for this session and prints the status. The same
 *       status is written in chat; this command is the proof it was given.
 *       It then prints EVERY AGENT THE SESSION LAUNCHED THAT HAS ENDED SINCE
 *       THE LAST STATUS — how it ended (a report, a refusal or an
 *       interruption) and its last entry — read from each agent's own
 *       transcript, so an agent that stops without a notification is found at
 *       the next status at the latest. Measured: an agent interrupted at 17:58
 *       sent nothing, and was found at 18:01 only because the owner asked.
 *       And then EACH RUNNING AGENT'S LATEST PROGRESS NOTE, the last line of
 *       `progress/step-N.txt` in the session scratchpad for the step its
 *       prompt names, FLAGGED when it is older than five minutes or missing:
 *       a status is the manager's report, and statuses written as heartbeats
 *       were given while three of four walks had failed.
 *   node report.mjs --gate
 *       PreToolUse, run by hook-dispatch.mjs: refuses the call when more than
 *       five minutes have passed since the later of the last stamp and the
 *       owner's last message AND something the session started is still
 *       running, an agent or a background command. With nothing running no
 *       status is due (Doctrine §0e rule 2). Subagent calls pass (they cannot
 *       tell the owner anything), and so does this command itself
 *       (hook-dispatch exempts it). hook-dispatch does not latch on this
 *       refusal: the stamp clears it.
 *   node report.mjs --wait
 *       THE WAIT THE MAIN THREAD MAY MAKE, between statuses, while an agent
 *       runs: it returns when a running agent's progress note changes, when an
 *       agent the session launched ends, or after four and a half minutes,
 *       whichever comes first, and prints what it saw. The main thread may not
 *       end its turn while an agent runs, none of its other allowed calls can
 *       wait, and a timer is not one of them: measured 2026-10-03 07:05, a
 *       foreground watch on a progress note ran past the Bash time limit and
 *       was moved to the background, where it became one more task of its own.
 *       So it runs in the FOREGROUND, with a Bash `timeout` of at least 280000
 *       ms (the default is 120000, under the four and a half minutes). The
 *       manager fence in hook-dispatch.mjs passes this exact command on the main
 *       thread; the latch and the report gate still apply to it. It records
 *       nothing: an agent it saw end is printed again by the next status.
 *
 * No app notifications, ever (2026-09-28).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { tailEntries, lastOwnerMessage, textOf } from './transcript-tail.mjs';
import { startedAt } from './pending-guard.mjs';

export const INTERVAL_MS = 5 * 60 * 1000;
const CLOCK = join(homedir(), '.claude', 'report-clock.json');

/**
 * The owner's clock: the time in California, as every time a session writes
 * must be (Doctrine §2), in the same HH:MM 24-hour form statuses always had.
 * @param {Date} [d]  the instant; now when omitted.
 * @returns {string} "HH:MM" in America/Los_Angeles whatever the container's
 *   zone, so a UTC machine never stamps a UTC status.
 */
export function californiaTime(d = new Date()) {
  return d.toLocaleTimeString('en-GB', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

/**
 * Read the stamp. One container runs one session, so there is one clock; a
 * per-session key was tried and the command line cannot know the session id.
 * @returns {{at: number, status: string}} the last status; `at` is 0 when the
 *   file is missing or unreadable, which the gate reads as "no stamp".
 */
function readClock(now = Date.now()) {
  try {
    const c = JSON.parse(readFileSync(CLOCK, 'utf8'));
    const at = Number(c.at);
    // A stamp from the future is no stamp: one dated a year ahead switched the
    // gate off for a year, and one that parsed to Infinity switched it off
    // for good.
    if (!Number.isFinite(at) || at > now + 60 * 1000) return { at: 0, status: '' };
    return { at: at || 0, status: String(c.status ?? '') };
  } catch { return { at: 0, status: '' }; }
}

/**
 * Decide whether a PreToolUse call may run.
 * @param {object} p      the hook payload.
 * @param {number} now    the time in ms (a parameter so a plant can move it).
 * @returns {string | null} the refusal reason, or null to allow. Its caller,
 *   hook-dispatch.mjs, turns a reason into exit 2 with the reason on stderr.
 *   A status is due only while something the session started runs (an agent
 *   or a background command, `runningWork`); with nothing running this
 *   returns null however long it has been. When the transcript cannot be
 *   read it cannot tell, and refuses as before.
 */
export function gate(p, now = Date.now()) {
  if (p.agent_id) return null;
  const stamp = readClock(now).at;
  const owner = lastOwnerMessage(tailEntries(p.transcript_path ?? '', 4 * 1024 * 1024))?.at ?? 0;
  const last = Math.max(stamp, owner);
  if (!last) return null;                       // nothing known yet: a fresh session
  const gap = now - last;
  if (gap <= INTERVAL_MS) return null;
  // NO STATUS WHILE NOTHING IS RUNNING (Doctrine §0e rule 2). A status reports
  // work in progress; with no agent and no background command of the
  // session's running there is none to report, and demanding one made a
  // heartbeat. Read only once a status would otherwise be due, because it reads
  // every agent's transcript.
  const busy = runningWork(p);
  if (busy && !busy.length) return null;
  const mins = Math.floor(gap / 60000);
  const what = busy ? `, and ${busy.join(', ')} ${busy.length === 1 ? 'is' : 'are'} still running`
    : ', and what is running could not be read';
  return `${mins} minutes since the owner last got a status${what}. Give one now, in chat AND as `
    + `node ${join(dirname(new URL(import.meta.url).pathname), 'report.mjs')} "Status HH:MM — done: …; running: …; next: …; next status by HH:MM". `
    + 'The owner is told in the first line, at least every five minutes during the work, and at the end (LESSONS §370). No app notifications.';
}

// An agent's own way of handing back (hook-dispatch.mjs AGENT_RETURN; not
// imported, because hook-dispatch.mjs imports this file).
const AGENT_RETURN = /^(?:SubagentHandback|StructuredOutput)$/;
const LAST_CHARS = 1500;
const resultText = (b) => (typeof b?.content === 'string' ? b.content
  : Array.isArray(b?.content) ? b.content.map((x) => x?.text ?? '').join('\n') : '');

/**
 * Where a session's transcript and its agents' transcripts are.
 * @param {string} sid  the session id (`CLAUDE_CODE_SESSION_ID`).
 * @returns {{main: string, agents: string} | null} the session's JSONL and its
 *   `subagents/` directory under ~/.claude/projects/<dir>/, or null when the id
 *   is malformed or no project directory holds it.
 */
function sessionFiles(sid) {
  if (!/^[\w-]+$/.test(String(sid ?? ''))) return null;
  const projects = join(homedir(), '.claude', 'projects');
  let dirs = [];
  try { dirs = readdirSync(projects); } catch { return null; }
  const dir = dirs.find((d) => existsSync(join(projects, d, `${sid}.jsonl`)) || existsSync(join(projects, d, sid, 'subagents')));
  return dir ? { main: join(projects, dir, `${sid}.jsonl`), agents: join(projects, dir, sid, 'subagents') } : null;
}

/**
 * The status each task notification in the session's transcript gave an agent.
 * @param {string} main  the session's own transcript.
 * @returns {Map<string, string>} agent id to its notified status ("completed",
 *   "killed", …); empty when the transcript cannot be read. `agentEnd` takes
 *   one of these, so `agentEnds` and `runningAgents` judge an end alike.
 */
function notifiedStatuses(main) {
  const notified = new Map();
  for (const e of tailEntries(main, 16 * 1024 * 1024)) {
    const t = textOf(e);
    if (!t.includes('<task-notification>')) continue;
    for (const m of t.matchAll(/<task-id>([\w-]+)<\/task-id>[\s\S]{0,800}?<status>(\w+)<\/status>/g)) notified.set(m[1], m[2]);
  }
  return notified;
}

/**
 * How one agent ended, read from its own transcript.
 * @param {object[]} entries  the agent's transcript (its tail), in file order.
 * @param {object} [meta]  its `.meta.json`; `stoppedByUser` marks an interruption.
 * @param {number} [processStart]  when this session's process began, in ms
 *   (pending-guard's start); an agent whose last entry is older is not running.
 * @param {string} [notified]  the status a task notification gave it, if any.
 * @returns {{how: string, at: number, last: string} | null} null while it is
 *   still running. Otherwise how it ended — "a report" (it handed back), "a
 *   refusal" (it handed back, or was ended, straight after a hook refused it),
 *   "an interruption" (stopped, or cut off by a restart), or "a failure" — its
 *   last entry's time, and its last entry: the hand-back's text, or else the
 *   last thing it said, ran or was answered. `agentEnds` prints these.
 */
export function agentEnd(entries, meta = {}, processStart = 0, notified = '') {
  let at = 0, lastAssistant = -1, interruptedAt = -1;
  let handback = null, lastRefusal = false, last = '';
  entries.forEach((e, i) => {
    const t = Date.parse(e?.timestamp ?? '');
    if (Number.isFinite(t) && t > at) at = t;
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) {
      for (const b of c) {
        if (b?.type === 'text' && String(b.text ?? '').trim()) { last = String(b.text).trim(); lastAssistant = i; }
        if (b?.type !== 'tool_use') continue;
        lastAssistant = i;
        if (AGENT_RETURN.test(b.name ?? '')) handback = { id: b.id, text: String(b.input?.message ?? b.input?.result ?? JSON.stringify(b.input ?? {})), refused: false };
        else { handback = null; last = `${b.name} ${JSON.stringify(b.input ?? {})}`; }
      }
    }
    if (e?.type !== 'user') return;
    const words = typeof c === 'string' ? c : Array.isArray(c) ? c.filter((b) => b?.type === 'text').map((b) => b.text ?? '').join('\n') : '';
    if (/^\s*\[Request interrupted/.test(words)) interruptedAt = i;
    if (Array.isArray(c)) for (const b of c) {
      if (b?.type !== 'tool_result') continue;
      const text = resultText(b);
      if (handback && b.tool_use_id === handback.id) { handback.refused = !!b.is_error; continue; }
      lastRefusal = !!b.is_error && /^(?:Error: )?PreToolUse:\S+ hook error/.test(text);
      last = `${b.is_error ? 'error' : 'result'}: ${text}`;
    }
  });
  const cut = (s) => (s.length > LAST_CHARS ? `${s.slice(0, LAST_CHARS)} … (${s.length} characters; the rest is in its transcript)` : s);
  if (handback && !handback.refused) return { how: lastRefusal ? 'a refusal' : 'a report', at, last: cut(handback.text) };
  if (meta?.stoppedByUser || interruptedAt > lastAssistant) return { how: 'an interruption', at, last: cut(last) };
  if (/^(?:completed)$/.test(notified)) return { how: lastRefusal ? 'a refusal' : 'a report', at, last: cut(last) };
  if (/^(?:killed|stopped|cancelled)$/.test(notified)) return { how: 'an interruption', at, last: cut(last) };
  if (notified === 'failed') return { how: 'a failure', at, last: cut(last) };
  if (processStart && at && at < processStart) return { how: 'an interruption (the session restarted after its last entry)', at, last: cut(last) };
  return null;
}

/**
 * The agents this session launched that have ended since the last status.
 * @param {string} sid  the session id.
 * @param {number} [stampAt]  the last status's time in ms (0 when none).
 * @returns {{id: string, description: string, how: string, at: number, last: string, path: string}[] | null}
 *   each agent whose end has not been printed before, oldest first; null when
 *   the session's files cannot be found. Every agent found ended is recorded
 *   in ~/.claude/report-agents/<sid>.json so it is printed once; the first run
 *   for a session, with no record yet, prints only those ended after the last
 *   status. An agent still running is not recorded and is read again next time.
 */
export function agentEnds(sid, stampAt = 0) {
  const f = sessionFiles(sid);
  if (!f) return null;
  const recFile = join(homedir(), '.claude', 'report-agents', `${sid}.json`);
  let rec = null;
  try { rec = JSON.parse(readFileSync(recFile, 'utf8')); } catch { rec = null; }
  const done = new Set(Array.isArray(rec?.ids) ? rec.ids : []);
  const notified = notifiedStatuses(f.main);
  const start = startedAt({ session_id: sid });
  let names = [];
  try { names = readdirSync(f.agents).filter((n) => /^agent-[\w-]+\.jsonl$/.test(n)); } catch { names = []; }
  const out = [];
  for (const n of names) {
    const id = n.slice('agent-'.length, -'.jsonl'.length);
    if (done.has(id)) continue;
    let meta = {};
    try { meta = JSON.parse(readFileSync(join(f.agents, `agent-${id}.meta.json`), 'utf8')); } catch { meta = {}; }
    const end = agentEnd(tailEntries(join(f.agents, n), 4 * 1024 * 1024), meta, start, notified.get(id) ?? '');
    if (!end) continue;
    done.add(id);
    if (!rec && !(end.at > stampAt)) continue;
    out.push({ id, description: String(meta.description ?? ''), ...end, path: join(f.agents, n) });
  }
  mkdirSync(dirname(recFile), { recursive: true });
  writeFileSync(recFile, JSON.stringify({ ids: [...done] }, null, 1));
  return out.sort((a, b) => a.at - b.at);
}

/**
 * The agents block a status prints.
 * @param {string} sid  the session id, or '' when the shell has none.
 * @param {number} stampAt  the last status's time in ms.
 * @returns {string} a headed list, never a table: one item per ended agent with
 *   how it ended, when (California), its transcript and its last entry; "none"
 *   when none ended; and a plain line when the session's files cannot be read,
 *   so the status never implies a read it did not make.
 */
export function agentsBlock(sid, stampAt) {
  const ended = sid ? agentEnds(sid, stampAt) : null;
  if (!ended) return `Agents ended since the last status: not read (${sid ? `no transcript found for session ${sid}` : 'no CLAUDE_CODE_SESSION_ID in this shell'}).`;
  if (!ended.length) return 'Agents ended since the last status: none.';
  return ['Agents ended since the last status, each read from its own transcript:', ...ended.map((a) =>
    `- ${a.id}${a.description ? ` "${a.description}"` : ''} ended ${a.at ? `at ${californiaTime(new Date(a.at))} (California) ` : ''}by ${a.how}.\n`
    + `  Transcript: ${a.path}\n  Last entry: ${a.last.replace(/\n/g, '\n    ')}`)].join('\n');
}

// ---- running agents' progress notes ----

/**
 * The plan step an agent was sent to do, read from the prompt it was given.
 * @param {string} path  the agent's transcript.
 * @returns {number|null} N when the first user entry in the file's first 64 KB
 *   is a plan path and a step number, the only prompt the dispatch gate lets
 *   through (`<plan> step N` or `<plan> N`); null when the file cannot be read
 *   or the prompt is anything else. `progressBlock` reads `progress/step-N.txt`
 *   by it, so a wrong N prints another agent's note as this one's.
 */
export function agentStep(path) {
  let head = '';
  try {
    const fd = openSync(path, 'r');
    try {
      const b = Buffer.alloc(64 * 1024);
      head = b.toString('utf8', 0, readSync(fd, b, 0, b.length, 0));
    } finally { closeSync(fd); }
  } catch { return null; }
  for (const line of head.split('\n')) {
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    if (e?.type !== 'user') continue;
    const m = /^\s*\S+\s+(?:step\s+)?(\d+)\s*$/i.exec(textOf(e));
    return m ? Number(m[1]) : null;
  }
  return null;
}

/**
 * This session's scratchpad, where agents write their progress notes.
 * @param {string} sid  the session id.
 * @returns {string|null} the first `<base>/claude-<uid>/<project>/<sid>/scratchpad`
 *   that exists, base being /tmp or the OS temp directory — the places
 *   hook-dispatch.mjs `inScratchpad` accepts; null when the id is malformed or
 *   none exists.
 */
export function scratchpadOf(sid) {
  if (!/^[\w-]+$/.test(String(sid ?? ''))) return null;
  for (const base of new Set(['/tmp', tmpdir()])) {
    let users = [];
    try { users = readdirSync(base).filter((n) => /^claude-\d+$/.test(n)); } catch { continue; }
    for (const u of users) {
      let projects = [];
      try { projects = readdirSync(join(base, u)); } catch { continue; }
      for (const pr of projects) {
        const d = join(base, u, pr, sid, 'scratchpad');
        if (existsSync(d)) return d;
      }
    }
  }
  return null;
}

/**
 * The agents this session launched that are still running.
 * @param {string} sid  the session id.
 * @param {{main: string, agents: string} | null} [f]  where the session's
 *   transcript and agents are; found by the id when omitted. The status gate
 *   passes the ones its payload's transcript path names.
 * @returns {{id: string, description: string, step: number|null, path: string}[] | null}
 *   every agent `agentEnd` finds no end for, in file-name order, with the plan
 *   step its prompt names; null when the session's files cannot be found.
 *   Every transcript is read, the ones `agentEnds` has recorded as ended
 *   included, because an agent sent a message runs again in the same file
 *   (measured 2026-10-03: 171 ms for this session's 23 agents).
 */
export function runningAgents(sid, f = sessionFiles(sid)) {
  if (!f) return null;
  const notified = notifiedStatuses(f.main);
  const start = startedAt({ session_id: sid });
  let names = [];
  try { names = readdirSync(f.agents).filter((n) => /^agent-[\w-]+\.jsonl$/.test(n)).sort(); } catch { names = []; }
  const out = [];
  for (const n of names) {
    const id = n.slice('agent-'.length, -'.jsonl'.length);
    let meta = {};
    try { meta = JSON.parse(readFileSync(join(f.agents, `agent-${id}.meta.json`), 'utf8')); } catch { meta = {}; }
    const path = join(f.agents, n);
    if (agentEnd(tailEntries(path, 4 * 1024 * 1024), meta, start, notified.get(id) ?? '')) continue;
    out.push({ id, description: String(meta.description ?? ''), step: agentStep(path), path });
  }
  return out;
}

// ---- what the session started that is still running ----

/**
 * The background tasks the session started that are still running.
 * @param {string} raw  the whole transcript, as JSONL text.
 * @returns {string[]} the ids a tool result OPENS by launching ("Workflow
 *   launched in background. Task ID: x", "Command running in background with
 *   ID: x") with no notification ending them (completed, failed, killed,
 *   stopped) and no "Successfully stopped task: x". The one definition two
 *   gates share: stop-guard.mjs refuses a stop while this is not empty, and
 *   the status gate demands a status only while it, or `runningAgents`, is not.
 */
export function runningTasks(raw) {
  // A launch is the line the harness writes at the very START of a tool result.
  // Matched anywhere, the same words in a command's input or in a file a tool
  // printed registered a task that never existed and would have refused every
  // stop for the rest of the session.
  const LAUNCH = /^(?:Workflow launched in background\. Task ID: |Command running in background with ID: )([a-z0-9]{6,})\b/;
  const launched = new Set();
  const ended = new Set();
  for (const line of raw.split('\n')) {
    if (!line) continue;
    for (const m of line.matchAll(/<task-id>([a-z0-9]{6,})<\/task-id>[\s\S]{0,800}?<status>(?:completed|failed|killed|stopped|cancelled)<\/status>/g)) ended.add(m[1]);
    for (const m of line.matchAll(/Successfully stopped task: ([a-z0-9]{6,})\b/g)) ended.add(m[1]);
    if (!line.includes('tool_result') || !line.includes('background')) continue;
    let e; try { e = JSON.parse(line); } catch { continue; }
    const c = e?.message?.content;
    if (e?.type !== 'user' || !Array.isArray(c)) continue;
    for (const blk of c) {
      if (blk?.type !== 'tool_result') continue;
      const t = typeof blk.content === 'string' ? blk.content
        : Array.isArray(blk.content) ? blk.content.map((x) => (typeof x === 'string' ? x : x?.text ?? '')).join('\n') : '';
      const m = LAUNCH.exec(t.trimStart());
      if (m) launched.add(m[1]);
    }
  }
  return [...launched].filter((id) => !ended.has(id));
}

/**
 * What the session started that is still running, read for the status gate.
 * @param {object} p  a PreToolUse payload: its transcript path and session id.
 * @returns {string[] | null} one entry per running agent ("agent <id>") and
 *   per running background task ("background task <id>"); [] when nothing
 *   runs; null when the transcript cannot be read, which `gate` reads as
 *   "cannot tell" and refuses on. The agents are found beside the transcript,
 *   `<dir>/<sid>.jsonl` with `<dir>/<sid>/subagents/`, the layout the harness
 *   writes and `sessionFiles` searches for.
 */
export function runningWork(p) {
  const tr = String(p?.transcript_path ?? '');
  let raw;
  try { raw = readFileSync(tr, 'utf8'); } catch { return null; }
  const sid = String(p?.session_id ?? '');
  const f = tr.endsWith('.jsonl') ? { main: tr, agents: join(tr.slice(0, -'.jsonl'.length), 'subagents') } : sessionFiles(sid);
  let agents = [];
  try { agents = runningAgents(sid, f) ?? []; } catch { agents = []; }
  return [...agents.map((a) => `agent ${a.id}`), ...runningTasks(raw).map((id) => `background task ${id}`)];
}

/**
 * The running agents' progress block a status prints.
 * @param {string} sid  the session id, or '' when the shell has none.
 * @param {number} [now]  the time in ms (a parameter so a test can move it).
 * @returns {string} a headed list, never a table: one item per running agent
 *   with the latest line of `progress/step-N.txt` in the session scratchpad,
 *   when it was written (California) and how long ago; FLAGGED when the note
 *   is older than five minutes, missing, empty, or the agent's prompt names no
 *   step. "none" when no agent is running, and a plain line when the session's
 *   files cannot be read, so a status never implies a read it did not make.
 */
export function progressBlock(sid, now = Date.now()) {
  const running = sid ? runningAgents(sid) : null;
  if (!running) return `Running agents' progress: not read (${sid ? `no transcript found for session ${sid}` : 'no CLAUDE_CODE_SESSION_ID in this shell'}).`;
  if (!running.length) return 'Running agents: none.';
  const pad = scratchpadOf(sid);
  const items = running.map((a) => {
    const who = `- agent ${a.id}${a.description ? ` "${a.description}"` : ''}`;
    if (a.step === null) return `${who}: FLAGGED, its prompt names no plan step, so it has no progress note to read.`;
    const file = pad ? join(pad, 'progress', `step-${a.step}.txt`) : `progress/step-${a.step}.txt (no scratchpad found for session ${sid})`;
    let text = '', written = 0;
    try { text = readFileSync(file, 'utf8'); written = statSync(file).mtimeMs; } catch { return `${who}, step ${a.step}: FLAGGED, no progress note at ${file}.`; }
    const latest = text.split('\n').map((l) => l.trim()).filter(Boolean).at(-1) ?? '';
    if (!latest) return `${who}, step ${a.step}: FLAGGED, ${file} is empty.`;
    const age = now - written;
    const when = `written ${californiaTime(new Date(written))} (California), ${Math.max(0, Math.floor(age / 60000))} minutes ago`;
    if (age > INTERVAL_MS) return `${who}, step ${a.step}: FLAGGED, the note is older than five minutes (${when}).\n  Latest: ${latest}`;
    return `${who}, step ${a.step}: ${when}.\n  Latest: ${latest}`;
  });
  return ['Running agents, each with the latest line of its progress note:', ...items].join('\n');
}

// ---- the wait the main thread may make ----

export const WAIT_MS = 4.5 * 60 * 1000;
const WAIT_POLL_MS = 5000;

/**
 * Where a running agent's progress note stands.
 * @param {string|null} pad  the session scratchpad (`scratchpadOf`).
 * @param {number|null} step  the plan step the agent's prompt names.
 * @returns {string} "<mtime>:<size>" of `progress/step-N.txt`, "missing" when
 *   it cannot be read, '' when there is no scratchpad or no step. `waitForChange`
 *   compares two of these, so any write to the note, a new line or a rewrite,
 *   reads as a change.
 */
function noteSig(pad, step) {
  if (!pad || step === null || step === undefined) return '';
  try { const s = statSync(join(pad, 'progress', `step-${step}.txt`)); return `${s.mtimeMs}:${s.size}`; } catch { return 'missing'; }
}

/**
 * How one agent ended, read the way `agentEnds` reads it but recording nothing.
 * @param {string} sid  the session id.
 * @param {{main: string, agents: string}} f  the session's files.
 * @param {string} id  the agent's id.
 * @returns {{how: string, at: number, last: string} | null} `agentEnd`'s answer;
 *   null while it runs. The wait prints it; the record of printed ends is left
 *   to the status, so the next status still prints this agent.
 */
function endOf(sid, f, id) {
  let meta = {};
  try { meta = JSON.parse(readFileSync(join(f.agents, `agent-${id}.meta.json`), 'utf8')); } catch { meta = {}; }
  return agentEnd(tailEntries(join(f.agents, `agent-${id}.jsonl`), 4 * 1024 * 1024), meta,
    startedAt({ session_id: sid }), notifiedStatuses(f.main).get(id) ?? '');
}

const span = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60), r = s % 60;
  return [m ? `${m} minute${m === 1 ? '' : 's'}` : '', r || !m ? `${r} second${r === 1 ? '' : 's'}` : ''].filter(Boolean).join(' ');
};

/**
 * Wait until there is something for the manager to act on.
 * @param {string} sid  the session id (`CLAUDE_CODE_SESSION_ID`).
 * @param {{limit?: number, poll?: number}} [opts]  the longest wait and the
 *   interval between reads, in ms; WAIT_MS and five seconds by default.
 * @returns {Promise<string>} what it saw, as headed lists, never a table: each
 *   agent running when the wait began that has ended since, with how it ended
 *   and its last entry, and each running agent whose progress note changed,
 *   with its latest line; or, once `limit` has passed with neither, a line
 *   saying so and the running agents' progress block. It returns at once, saying
 *   so, when no agent the session launched is running, because nothing could
 *   then change and a wait would only be a timer; and with a plain line when
 *   the session's files cannot be read. It writes nothing, so the status that
 *   follows still prints every ended agent (`agentEnds` owns that record).
 */
export async function waitForChange(sid, opts = {}) {
  const limit = opts.limit ?? WAIT_MS;
  const poll = opts.poll ?? WAIT_POLL_MS;
  const began = Date.now();
  const f = sid ? sessionFiles(sid) : null;
  if (!f) return `Wait: not read (${sid ? `no transcript found for session ${sid}` : 'no CLAUDE_CODE_SESSION_ID in this shell'}).`;
  const first = runningAgents(sid, f) ?? [];
  if (!first.length) return 'Wait: no agent the session launched is running, so there is nothing to wait on.';
  const pad = scratchpadOf(sid);
  const before = new Map(first.map((a) => [a.id, noteSig(pad, a.step)]));
  for (;;) {
    const waited = Date.now() - began;
    const now = runningAgents(sid, f) ?? [];
    const still = new Set(now.map((a) => a.id));
    const ended = first.filter((a) => !still.has(a.id));
    const moved = now.filter((a) => before.has(a.id) && noteSig(pad, a.step) !== before.get(a.id));
    if (ended.length || moved.length) {
      const out = [`Wait: ${span(waited)} (the limit is ${span(limit)}).`];
      if (ended.length) {
        out.push('Ended since the wait began, each read from its own transcript:');
        for (const a of ended) {
          const e = endOf(sid, f, a.id);
          out.push(`- agent ${a.id}${a.description ? ` "${a.description}"` : ''} ended `
            + `${e?.at ? `at ${californiaTime(new Date(e.at))} (California) ` : ''}by ${e?.how ?? 'an end its transcript does not show'}.\n`
            + `  Last entry: ${String(e?.last ?? '').replace(/\n/g, '\n    ')}`);
        }
      }
      if (moved.length) {
        out.push('Progress notes written since the wait began:');
        for (const a of moved) {
          const file = join(pad, 'progress', `step-${a.step}.txt`);
          let latest = '', written = 0;
          try { latest = readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean).at(-1) ?? ''; written = statSync(file).mtimeMs; } catch { latest = '(the note could not be read)'; }
          out.push(`- agent ${a.id}${a.description ? ` "${a.description}"` : ''}, step ${a.step}${written ? `, written ${californiaTime(new Date(written))} (California)` : ''}.\n  Latest: ${latest}`);
        }
      }
      out.push('This wait records nothing; the next status prints every ended agent.');
      return out.join('\n');
    }
    if (waited >= limit) {
      return `Wait: ${span(waited)} passed; no running agent's progress note changed and no agent ended.\n${progressBlock(sid)}`;
    }
    await new Promise((r) => setTimeout(r, Math.max(10, Math.min(poll, limit - waited))));
  }
}

if (process.argv[1] && process.argv[1].endsWith('report.mjs')) {
  if (process.argv[2] === '--gate') {
    let p = {};
    try { p = JSON.parse(readFileSync(0, 'utf8')); } catch { /* no payload: allow */ }
    const why = gate(p);
    if (why) { process.stderr.write(why + '\n'); process.exit(2); }
    process.exit(0);
  }
  if (process.argv[2] === '--wait') {
    // REPORT_WAIT_MS and REPORT_WAIT_POLL_MS shorten the wait for the suite;
    // the manager fence passes only the bare command, so a session cannot.
    let out;
    try {
      out = await waitForChange(String(process.env.CLAUDE_CODE_SESSION_ID ?? ''),
        { limit: Number(process.env.REPORT_WAIT_MS) || undefined, poll: Number(process.env.REPORT_WAIT_POLL_MS) || undefined });
    } catch (e) { out = `Wait: not read (${e?.message ?? e}).`; }
    console.log(out);
    process.exit(0);
  }
  const given = process.argv.slice(2).join(' ').trim();
  if (!given) { console.error('usage: node report.mjs "Status HH:MM — done: …; running: …; next: …; next status by HH:MM"'); process.exit(1); }
  // The time in a status is the CLOCK's, written here, never the session's
  // estimate: five statuses in a row once carried times forty minutes off.
  // And it is CALIFORNIA time, the owner's (Doctrine §2): the container's clock
  // is UTC, and a status stamped in it was a time the owner had to convert.
  const hhmm = californiaTime();
  const m = /^Status\s+(\d{1,2}:\d{2})\b/.exec(given);
  const status = m ? given.replace(m[0], `Status ${hhmm}`) : `Status ${hhmm} — ${given}`;
  const previous = readClock().at;
  mkdirSync(dirname(CLOCK), { recursive: true });
  writeFileSync(CLOCK, JSON.stringify({ at: Date.now(), status }, null, 1));
  console.log(status);
  if (m && m[1].padStart(5, '0') !== hhmm) console.log(`(the status said ${m[1]}; the clock says ${hhmm}, and that is what was stamped)`);
  // After the stamp, so a failure reading the agents never costs the status.
  let block = '';
  try { block = agentsBlock(String(process.env.CLAUDE_CODE_SESSION_ID ?? ''), previous); } catch (e) { block = `Agents ended since the last status: not read (${e?.message ?? e}).`; }
  console.log(block);
  let progress = '';
  try { progress = progressBlock(String(process.env.CLAUDE_CODE_SESSION_ID ?? '')); } catch (e) { progress = `Running agents' progress: not read (${e?.message ?? e}).`; }
  console.log(progress);
}
