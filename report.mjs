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
 *       stamps the time for this session and prints the status, PRECEDED BY
 *       THE GOALS EVERY SESSION SERVES (`goalsSection`, the hub CLAUDE.md's
 *       section of that name, Doctrine §0e rule 16), so the goals are in front
 *       of the session at every status. THEN THE POINTER (`pointerState`,
 *       `pointerBlock`): `next: step N`, the first number on the approved
 *       plan's `Order:` line (under `## Order`) with no hand-back whose first
 *       line opens DONE, or `next: none` when every one has; a hand-back
 *       opening REFUSED or FAILED leaves N where it is, and a `Standing:` step
 *       is never N. Under it each step's state, the newest hand-back of each
 *       step with every line it carries and the path of its report file
 *       (`progress/step-N-report.txt` in the session scratchpad), and the
 *       `Found:` lines of every report file. The main thread reads its next
 *       move from this print instead of choosing it from memory, and the dispatch
 *       gate and the stop guard read the same pointer (`pointerFor`). The status
 *       page's source, `status/fix-run.html` in the session scratchpad, is
 *       written from the same read (`statusPage`). The same
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
 *       Then, for each agent running or ended since the last status, EVERY
 *       HOOK REFUSAL IT HAS RECEIVED AND ITS LAST TOOL RESULT (`gateReadsBlock`),
 *       read from the agent's own transcript and never from what it said: the
 *       manager learned of each refusal inside an agent from the latch or from
 *       the agent's return, and judged the agent's work from its report.
 *       And last THE APPROVAL STATE, read from disk now (`approvalBlock`): the
 *       marker or none, the plan it names with the hash and time it holds, the
 *       plan file's hash and last write time, and whether they match. Before
 *       sending the first agent under any approval, the manager gives a status
 *       and reads it; the dispatch gate's refusals print the same lines.
 *   node report.mjs --gate
 *       PreToolUse, run by hook-dispatch.mjs: refuses the call when an agent
 *       the session launched has ENDED since the last status (`endedSince`).
 *       There is no clock: a status is the manager's report of what an end
 *       says, so none is due every five minutes, and none while nothing has
 *       ended (Doctrine §0e rule 2). Subagent calls pass (they cannot tell the
 *       owner anything), and so does this command itself (hook-dispatch exempts
 *       it). hook-dispatch does not latch on this refusal: the stamp clears it.
 *   node report.mjs --wait
 *       A WAIT THE MAIN THREAD MAY STILL MAKE (the turn itself now ends while
 *       an agent runs, and the harness's completion notification brings the
 *       session back, so it is no longer the way to wait): it returns when a
 *       running agent's progress note changes, when an agent the session
 *       launched ends, THE MOMENT A RUNNING AGENT IS REFUSED BY A HOOK, or after
 *       four and a half minutes, whichever comes first, and prints what it saw.
 *       A timer is not a wait: measured 2026-10-03 07:05, a
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
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { tailEntries, textOf } from './transcript-tail.mjs';
import { startedAt } from './pending-guard.mjs';

export const INTERVAL_MS = 5 * 60 * 1000;
const CLOCK = join(homedir(), '.claude', 'report-clock.json');
const HUB_DIR = dirname(fileURLToPath(import.meta.url));

/** The heading of the section of the hub CLAUDE.md that holds the standing goals. */
export const GOALS_HEADING = '## Goals every session serves';

/**
 * The goals section of a CLAUDE.md, heading included.
 * @param {string} [file]  the CLAUDE.md to read; the one beside this script by default.
 * @returns {string} the heading and the section's body up to the next `##` or
 *   `#` heading, trailing whitespace trimmed; '' when the file cannot be read or
 *   holds no such section. Every status and the dispatcher's reminder print it
 *   first, and `goalsBlock` is what a plan has to quote; a '' must never be
 *   read as "no goals", only as "not read".
 */
export function goalsSection(file = join(HUB_DIR, 'CLAUDE.md')) {
  let text = '';
  try { text = readFileSync(file, 'utf8'); } catch { return ''; }
  const m = new RegExp(`^${GOALS_HEADING}[^\\n]*\\n([\\s\\S]*?)(?=^## |^# |$(?![\\s\\S]))`, 'm').exec(text);
  return m ? `${GOALS_HEADING}\n${m[1].replace(/\s+$/, '')}` : '';
}

/**
 * The numbered goals in a goals section.
 * @param {string} section  from `goalsSection`.
 * @returns {string[]} each line that opens with a number and a period, trailing
 *   whitespace trimmed, in order. The one definition of "a goal" the plan guard
 *   and the status share, so they cannot disagree about what a plan must quote.
 */
export function goalLines(section) {
  return String(section ?? '').split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => /^\d+\.\s/.test(l));
}

/**
 * The standing goals block a plan has to quote word for word.
 * @param {string} [file]  the CLAUDE.md to read; the one beside this script by default.
 * @returns {string} the numbered goals of the section, one per line; '' when
 *   the section is missing or holds none. `plan-guard.mjs` refuses a plan whose
 *   `## Goals` section does not contain it verbatim.
 */
export function goalsBlock(file = join(HUB_DIR, 'CLAUDE.md')) {
  return goalLines(goalsSection(file)).join('\n');
}

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
 * The date and time in California, for the approval state.
 * @param {number|string|Date} t  an instant (ms, an ISO string or a Date).
 * @returns {string} "YYYY-MM-DD HH:MM (California)", or "an unreadable time"
 *   when `t` is not an instant.
 */
function californiaStamp(t) {
  const d = new Date(t);
  if (!Number.isFinite(d.getTime())) return 'an unreadable time';
  return `${d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })} ${californiaTime(d)} (California)`;
}

/**
 * The approval state as it stands on disk, read now, in lines a session can act on.
 * @param {string} [marker]  the approval marker's path; `~/.claude/APPROVED-PLAN.json` by default.
 * @returns {string} a headed list, never a table: the marker or none; the plan
 *   path, the hash and the time it holds; the plan file's hash now and when it
 *   was last written; and whether the two hashes match, which is the one
 *   condition under which `approvedPlan` in hook-dispatch.mjs returns a plan
 *   (the dispatch gate and the plan fence read nothing else). A marker that is
 *   missing, unreadable, naming no plan, or naming a file that cannot be read says
 *   so in its own line. Every status prints it, and so does every dispatch
 *   gate refusal: after the owner pressed approval in the app, the gate
 *   refused with only "no approved plan is in force" and the session could not
 *   see why (measured 2026-10-04).
 */
export function approvalBlock(marker = join(homedir(), '.claude', 'APPROVED-PLAN.json')) {
  const head = 'Approval state, read from disk now:';
  let mk;
  try { mk = JSON.parse(readFileSync(marker, 'utf8')); } catch (e) {
    return e?.code === 'ENOENT'
      ? `${head}\n- Marker: none (${marker} does not exist), so no plan is in force.`
      : `${head}\n- Marker: ${marker} cannot be read as an approval (${e?.code ?? e?.message ?? e}), so no plan is in force.`;
  }
  if (!mk?.plan || !mk.hash) return `${head}\n- Marker: present at ${marker}, but it names no plan and hash, so no plan is in force.`;
  const lines = [head,
    `- Marker: present, recorded ${californiaStamp(mk.at)}${mk.via ? `, ${mk.via}` : ''}${mk.session ? `, session ${mk.session}` : ''}.`,
    `- Plan it names: ${mk.plan}`,
    `- Hash it holds: ${String(mk.hash).slice(0, 12)}`];
  let bytes;
  try { bytes = readFileSync(mk.plan); } catch (e) {
    lines.push(`- Plan file now: cannot be read (${e?.code ?? e?.message ?? e}).`, '- Match: no. The plan file cannot be read, so no plan is in force.');
    return lines.join('\n');
  }
  const now = createHash('sha256').update(bytes).digest('hex');
  let written = 'an unreadable time';
  try { written = californiaStamp(statSync(mk.plan).mtimeMs); } catch { /* the hash was read; the time is not essential */ }
  const match = now === String(mk.hash);
  lines.push(`- Plan file now: hash ${now.slice(0, 12)}, last written ${written}.`,
    match ? '- Match: yes. The file is the plan that was approved, so the plan is in force.'
      : '- Match: NO. The file changed after it was approved, so no plan is in force; a changed plan goes back through plan mode.');
  return lines.join('\n');
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
 * The agents this session launched that have ended since a time.
 * @param {object} p  a PreToolUse payload: `transcript_path` and `session_id`
 *   say where the session's agents are (`<dir>/<sid>.jsonl` with
 *   `<dir>/<sid>/subagents/`, the layout the harness writes), as `runningWork`
 *   finds them.
 * @param {number} stampAt  the last status's time in ms (0 when there is none).
 * @returns {{id: string, description: string, how: string, at: number}[] | null}
 *   every agent `agentEnd` finds ended whose last entry is after `stampAt`,
 *   oldest first; null when the session's files cannot be found, which `gate`
 *   reads as "nothing known to be due". It RECORDS NOTHING (`agentEnds` owns
 *   the record of printed ends), so a status that cannot read the session
 *   still clears the gate by stamping the clock, which is after every end.
 *   An agent file written no later than `stampAt` cannot have ended after it,
 *   and is not read, so the common call costs a stat per agent.
 */
export function endedSince(p, stampAt) {
  const tr = String(p?.transcript_path ?? '');
  const sid = String(p?.session_id ?? '');
  const f = tr.endsWith('.jsonl') ? { main: tr, agents: join(tr.slice(0, -'.jsonl'.length), 'subagents') } : sessionFiles(sid);
  if (!f) return null;
  let names = [];
  try { names = readdirSync(f.agents).filter((n) => /^agent-[\w-]+\.jsonl$/.test(n)); } catch { return []; }
  const start = startedAt({ session_id: sid });
  let notified = null;
  const out = [];
  for (const n of names) {
    const file = join(f.agents, n);
    try { if (statSync(file).mtimeMs <= stampAt) continue; } catch { continue; }
    notified ??= notifiedStatuses(f.main);
    const id = n.slice('agent-'.length, -'.jsonl'.length);
    let meta = {};
    try { meta = JSON.parse(readFileSync(join(f.agents, `agent-${id}.meta.json`), 'utf8')); } catch { meta = {}; }
    const end = agentEnd(tailEntries(file, 4 * 1024 * 1024), meta, start, notified.get(id) ?? '');
    if (end && end.at > stampAt) out.push({ id, description: String(meta.description ?? ''), how: end.how, at: end.at });
  }
  return out.sort((a, b) => a.at - b.at);
}

/**
 * Decide whether a PreToolUse call may run.
 * @param {object} p      the hook payload.
 * @param {number} now    the time in ms (a parameter so a plant can move it).
 * @returns {string | null} the refusal reason, or null to allow. Its caller,
 *   hook-dispatch.mjs, turns a reason into exit 2 with the reason on stderr.
 *   A STATUS IS DUE WHEN AN AGENT HAS ENDED SINCE THE LAST ONE (`endedSince`),
 *   and at no other time: not every five minutes, and not while an agent merely
 *   runs. A status is the manager's report of what an end says, and one given
 *   on a clock was a heartbeat (Doctrine §0e rule 2). A subagent's call, and a
 *   session whose agents cannot be found, pass. The refusal names each agent
 *   and how it ended; the stamp clears it.
 */
export function gate(p, now = Date.now()) {
  if (p.agent_id) return null;
  const ended = endedSince(p, readClock(now).at);
  if (!ended || !ended.length) return null;
  const names = ended.map((a) => `${a.id}${a.description ? ` "${a.description}"` : ''} (${a.how}, ${californiaTime(new Date(a.at))} California)`);
  return `${ended.length === 1 ? 'An agent has' : `${ended.length} agents have`} ended since the owner last got a status: ${names.join('; ')}. `
    + `Give one now, in chat AND as node ${join(dirname(new URL(import.meta.url).pathname), 'report.mjs')} "Status HH:MM — what changed and what it means; what was done about it; time remaining". `
    + 'The status prints how each agent ended, its last entry, every refusal it received and its last tool result; read those, and act on what they show. No app notifications.';
}

// An agent's own way of handing back (hook-dispatch.mjs AGENT_RETURN; not
// imported, because hook-dispatch.mjs imports this file).
const AGENT_RETURN = /^(?:SubagentHandback|StructuredOutput)$/;
// A hook's refusal of a call, as a tool result carries it (is_error true): the
// call never ran. The one pattern `agentEnd` and `agentReads` share.
export const HOOK_REFUSAL = /^(?:Error: )?PreToolUse:\S+ hook error/;
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
export function sessionFiles(sid) {
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
      lastRefusal = !!b.is_error && HOOK_REFUSAL.test(text);
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
export function agentsBlock(sid, stampAt, ended = undefined) {
  if (ended === undefined) ended = sid ? agentEnds(sid, stampAt) : null;
  if (!ended) return `Agents ended since the last status: not read (${sid ? `no transcript found for session ${sid}` : 'no CLAUDE_CODE_SESSION_ID in this shell'}).`;
  if (!ended.length) return 'Agents ended since the last status: none.';
  return ['Agents ended since the last status, each read from its own transcript:', ...ended.map((a) =>
    `- ${a.id}${a.description ? ` "${a.description}"` : ''} ended ${a.at ? `at ${californiaTime(new Date(a.at))} (California) ` : ''}by ${a.how}.\n`
    + `  Transcript: ${a.path}\n  Last entry: ${a.last.replace(/\n/g, '\n    ')}`)].join('\n');
}

// ---- what an agent's own transcript says of its gates ----

const REFUSALS_SHOWN = 8;
const RESULT_CHARS = 700;
const clip = (s) => {
  const t = String(s ?? '').replace(/\s+$/, '');
  return t.length > RESULT_CHARS ? `${t.slice(0, RESULT_CHARS)} … (${t.length} characters; the rest is in its transcript)` : t;
};

/**
 * The hook refusals an agent received, and its last tool result.
 * @param {object[]} entries  the agent's transcript (its tail), in file order.
 * @returns {{refusals: {tool: string, at: number, text: string}[], last: {tool: string, at: number, error: boolean, text: string} | null}}
 *   `refusals`: every tool result that is an error opening with a PreToolUse
 *   hook error (a call a hook refused, which never ran), oldest first, with the
 *   tool it answered and its time in ms (NaN when unreadable). `last`: the last
 *   tool result of any kind, or null when there is none. ONLY tool_result
 *   blocks are read, never the agent's own words: the manager learned of each
 *   refusal inside an agent from the latch or from the agent's return, and
 *   judged its work from a report, which says what the agent believes happened.
 */
export function agentReads(entries) {
  const names = new Map();
  const refusals = [];
  let last = null;
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) {
      for (const b of c) if (b?.type === 'tool_use') names.set(b.id, b.name ?? '');
    }
    if (e?.type !== 'user' || !Array.isArray(c)) continue;
    for (const b of c) {
      if (b?.type !== 'tool_result') continue;
      const text = resultText(b);
      const tool = names.get(b.tool_use_id) ?? '';
      const at = Date.parse(e.timestamp ?? '');
      if (b.is_error && HOOK_REFUSAL.test(text)) refusals.push({ tool, at, text });
      last = { tool, at, error: !!b.is_error, text };
    }
  }
  return { refusals, last };
}

/**
 * The refusals-and-last-result block a status prints.
 * @param {string} sid  the session id, or '' when the shell has none.
 * @param {{id: string, description: string, how: string, path: string}[]} [ended]
 *   the agents `agentEnds` found ended since the last status.
 * @returns {string} a headed list, never a table: for each agent running or
 *   ended since the last status, every hook refusal it received (the newest
 *   eight in full, the rest counted) and its last tool result, each read from
 *   the agent's own transcript by `agentReads`; "none" when there is no such
 *   agent; and a plain line when the session's files cannot be read, so a
 *   status never implies a read it did not make.
 */
export function gateReadsBlock(sid, ended = []) {
  const running = sid ? runningAgents(sid) : null;
  if (!running) return `Agents' hook refusals and last tool results: not read (${sid ? `no transcript found for session ${sid}` : 'no CLAUDE_CODE_SESSION_ID in this shell'}).`;
  const list = [...running.map((a) => ({ id: a.id, description: a.description, path: a.path, state: 'running' })),
    ...(ended ?? []).map((a) => ({ id: a.id, description: a.description, path: a.path, state: `ended by ${a.how}` }))];
  if (!list.length) return 'Agents\' hook refusals and last tool results: no agent is running and none has ended since the last status.';
  const items = list.map((a) => {
    const who = `- agent ${a.id}${a.description ? ` "${a.description}"` : ''} (${a.state})`;
    const r = agentReads(tailEntries(a.path, 16 * 1024 * 1024));
    const when = (t) => (Number.isFinite(t) ? `${californiaTime(new Date(t))} (California)` : 'an unreadable time');
    const shown = r.refusals.slice(-REFUSALS_SHOWN);
    const head = r.refusals.length ? `${r.refusals.length} hook refusal${r.refusals.length === 1 ? '' : 's'}${r.refusals.length > shown.length ? `, the newest ${shown.length} below` : ''}.` : 'no hook refusals.';
    const lines = [`${who}: ${head}`,
      ...shown.map((f) => `  Refused at ${when(f.at)}, ${f.tool || 'a call'}: ${clip(f.text).replace(/\n/g, '\n    ')}`),
      r.last ? `  Last tool result, ${r.last.tool || 'a call'}, ${when(r.last.at)}${r.last.error ? ', an error' : ''}: ${clip(r.last.text).replace(/\n/g, '\n    ')}`
        : '  Last tool result: none yet.'];
    return lines.join('\n');
  });
  return ['Agents\' hook refusals and last tool results, each read from the agent\'s own transcript, never from what it said:', ...items].join('\n');
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
 * Every agent the session launched, by the plan step its prompt names.
 * @param {object} p  a Stop or PreToolUse payload: `transcript_path` and
 *   `session_id` say where the session's agents are, as `runningWork` finds them.
 * @returns {{ends: {id: string, step: number|null, how: string, at: number, last: string, path: string}[],
 *   running: string[], runningSteps: Set<number>} | null} `ends`: each agent
 *   `agentEnd` finds ended, in file-name order, with the plan step its prompt
 *   names (`agentStep`; null when the prompt names none), how it ended, when, its
 *   last entry (the hand-back's text when it handed back) and its transcript.
 *   `running`: "agent <id>" for each agent with no end, and `runningSteps` the
 *   steps those prompts name. null when the session's files cannot be found,
 *   which every caller reads as "cannot tell". An agent file that cannot be
 *   read is skipped, never counted as anything. The one read the pointer
 *   (`pointerOf`), the stop guard and the dispatch gate share, so they cannot
 *   disagree about what an agent handed back.
 */
export function stepEnds(p) {
  const tr = String(p?.transcript_path ?? '');
  const sid = String(p?.session_id ?? '');
  const f = tr.endsWith('.jsonl') ? { main: tr, agents: join(tr.slice(0, -'.jsonl'.length), 'subagents') } : sessionFiles(sid);
  if (!f) return null;
  let names = [];
  try { names = readdirSync(f.agents).filter((n) => /^agent-[\w-]+\.jsonl$/.test(n)).sort(); } catch { names = []; }
  const notified = notifiedStatuses(f.main);
  const start = startedAt({ session_id: sid });
  const ends = [];
  const running = [];
  const runningSteps = new Set();
  for (const n of names) {
    const id = n.slice('agent-'.length, -'.jsonl'.length);
    const path = join(f.agents, n);
    let meta = {};
    try { meta = JSON.parse(readFileSync(join(f.agents, `agent-${id}.meta.json`), 'utf8')); } catch { meta = {}; }
    let end;
    try { end = agentEnd(tailEntries(path, 4 * 1024 * 1024), meta, start, notified.get(id) ?? ''); } catch { continue; }
    const step = agentStep(path);
    if (!end) { running.push(`agent ${id}`); if (step !== null) runningSteps.add(step); continue; }
    ends.push({ id, step, how: end.how, at: end.at, last: end.last, path });
  }
  return { ends, running, runningSteps };
}

/**
 * The plan steps an agent has handed back for, and the agents still running.
 * @param {object} p  a Stop or PreToolUse payload, as `stepEnds` reads it.
 * @returns {{returned: Set<number>, running: string[], ends: object[]} | null}
 *   `returned`: the plan step of every agent that ENDED BY A REPORT
 *   (`agentEnd`): it handed back and no hook refusal was the last thing it was
 *   answered. An agent that ended at a refusal, an interruption or a failure
 *   returned nothing the plan can count, so its step stays open and the main
 *   thread sends it again. `running`: "agent <id>" for each agent with no end.
 *   `ends`: `stepEnds`' list, for the pointer. null when the session's files
 *   cannot be found, which the stop guard reads as "cannot tell". The stop
 *   guard's steps-left check (Doctrine §0e rule 2) asks this for a plan with no
 *   `## Order`, and for the agents still running.
 */
export function stepsReturned(p) {
  const s = stepEnds(p);
  if (!s) return null;
  const returned = new Set();
  for (const e of s.ends) if (e.how === 'a report' && e.step !== null) returned.add(e.step);
  return { returned, running: s.running, ends: s.ends };
}

// ---- the pointer: which step of the approved plan is next ----

/** A hand-back counts as done when its first line opens with this word. */
const DONE = /^DONE\b/;
const firstLineOf = (t) => String(t ?? '').split('\n').map((l) => l.trim()).find(Boolean) ?? '';

/**
 * The step order a plan declares.
 * @param {string} text  the plan.
 * @returns {{order: number[], standing: number[]} | null} the numbers on the
 *   `Order:` line and on the `Standing:` line (empty when there is none) under
 *   the plan's `## Order` heading, in the order written and with repeats
 *   dropped; null when the plan has no such heading or its `Order:` line holds
 *   no number, which means the plan defines no pointer. Only a line that BEGINS
 *   `Order:` or `Standing:` is read, so the prose of the section never counts.
 *   `pointerOf`, the dispatch gate and the stop guard read the order here.
 */
export function planOrder(text) {
  const m = /^## Order\b[^\n]*\n([\s\S]*?)(?=^## |^# |$(?![\s\S]))/mi.exec(String(text ?? ''));
  if (!m) return null;
  const numbers = (label) => {
    const line = m[1].split('\n').find((l) => new RegExp(`^\\s*${label}:`, 'i').test(l));
    return line ? [...new Set([...line.replace(/^[^:]*:/, '').matchAll(/\d+/g)].map((x) => Number(x[0])))] : [];
  };
  const order = numbers('Order');
  return order.length ? { order, standing: numbers('Standing') } : null;
}

/**
 * The step titles of a plan.
 * @param {string} text  the plan.
 * @returns {Map<number, string>} step number to the bold lead of its `## Steps`
 *   line ("**Finish what is built.**" gives "Finish what is built"); a step with
 *   no bold lead is absent. The status page prints them beside the states.
 */
export function stepTitles(text) {
  const out = new Map();
  const m = /^## Steps\b[^\n]*\n([\s\S]*?)(?=^## |^# |$(?![\s\S]))/mi.exec(String(text ?? ''));
  for (const x of (m ? m[1] : '').matchAll(/^(\d+)\.\s+\*\*(.+?)\*\*/gm)) out.set(Number(x[1]), x[2].replace(/\.\s*$/, ''));
  return out;
}

/**
 * Which step is next, as the plan's Order and the agents' hand-backs say.
 * @param {string} text  the plan.
 * @param {{step: number|null, how: string, last: string}[]} ends  `stepEnds`' `ends`.
 * @returns {{order: number[], standing: number[], done: Set<number>, next: number|null} | null}
 *   null when the plan defines no pointer (`planOrder`). `done`: every step
 *   some agent ENDED BY A REPORT for, whose hand-back's first line opens DONE;
 *   a hand-back opening REFUSED or FAILED, or anything else, counts nothing, and
 *   neither does an agent that ended at a refusal, an interruption or a failure.
 *   `next`: the first number in Order that is not in `done`, or null when every
 *   one is. A Standing step is never `next` and never holds it. The invariant:
 *   `next` advances past a step on a DONE hand-back and on nothing else.
 */
export function pointerOf(text, ends) {
  const o = planOrder(text);
  if (!o) return null;
  const done = new Set();
  for (const e of ends ?? []) if (e.how === 'a report' && e.step !== null && DONE.test(firstLineOf(e.last))) done.add(e.step);
  return { order: o.order, standing: o.standing, done, next: o.order.find((n) => !done.has(n)) ?? null };
}

/**
 * The pointer for a session, read from its own transcripts.
 * @param {object} p  a PreToolUse or Stop payload, as `stepEnds` reads it.
 * @param {string} text  the approved plan's text.
 * @returns {ReturnType<typeof pointerOf>} the pointer; null when the plan defines
 *   none or the session's agents cannot be read, which the dispatch gate and the
 *   stop guard read as "no pointer to enforce" and fall back on what they did
 *   before it: the dispatch gate's other checks, and the steps-left check.
 */
export function pointerFor(p, text) {
  if (!planOrder(text)) return null;
  const s = stepEnds(p);
  return s ? pointerOf(text, s.ends) : null;
}

/**
 * The plan in force, read the way `approvedPlan` in hook-dispatch.mjs reads it.
 * @param {string} [marker]  the approval marker's path; `~/.claude/APPROVED-PLAN.json` by default.
 * @returns {{path: string, text: string} | null} the plan file and its text only
 *   while its sha256 is the hash recorded at approval; null otherwise. Copied
 *   rather than imported, because hook-dispatch.mjs imports this file.
 */
function planInForce(marker = join(homedir(), '.claude', 'APPROVED-PLAN.json')) {
  try {
    const mk = JSON.parse(readFileSync(marker, 'utf8'));
    if (!mk?.plan || !mk.hash) return null;
    const bytes = readFileSync(mk.plan);
    if (createHash('sha256').update(bytes).digest('hex') !== String(mk.hash)) return null;
    return { path: String(mk.plan), text: bytes.toString('utf8') };
  } catch { return null; }
}

/**
 * The `Found:` lines of every step's report file in a scratchpad.
 * @param {string|null} pad  the session scratchpad (`scratchpadOf`).
 * @returns {{step: number, file: string, line: string}[]} each line beginning
 *   `Found:` in `progress/step-N-report.txt`, by step then file order, trimmed;
 *   [] when there is no scratchpad or no such file.
 */
export function foundLines(pad) {
  if (!pad) return [];
  const dir = join(pad, 'progress');
  let names = [];
  try { names = readdirSync(dir).filter((n) => /^step-\d+-report\.txt$/.test(n)); } catch { return []; }
  const out = [];
  for (const n of names.sort((a, b) => parseInt(a.slice(5), 10) - parseInt(b.slice(5), 10))) {
    let text = '';
    try { text = readFileSync(join(dir, n), 'utf8'); } catch { continue; }
    for (const l of text.split('\n')) if (/^Found:/.test(l.trim())) out.push({ step: parseInt(n.slice(5), 10), file: join(dir, n), line: clip(l.trim()) });
  }
  return out;
}

/**
 * Everything the pointer and the hand-back print says, read once.
 * @param {string} sid  the session id, or '' when the shell has none.
 * @param {{path: string, text: string} | null} [plan]  the plan in force; read
 *   from the marker when omitted.
 * @returns {{read: boolean, why: string, planPath: string, pointer: object|null,
 *   steps: {step: number, standing: boolean, state: string, back: object|null, report: string, reportWritten: boolean}[],
 *   found: object[], title: string, titles: Map<number, string>, leaves: string[]}}
 *   `read` is false, with `why`, when no plan is in force or its agents cannot be
 *   read; `pointer` is null when the plan defines none. Each of `steps` is a
 *   number of the plan's Order, then its Standing ones, with its state: DONE, a
 *   hand-back's first line (REFUSED, FAILED or anything else), "ended by <how>",
 *   "running" or "not sent"; `back` is the newest ended agent for it, with the
 *   hand-back's lines, and `report` the path its report file is written to.
 *   The console print and the status page both come from this, so they cannot
 *   disagree.
 */
export function pointerState(sid, plan = planInForce()) {
  const blank = { read: false, why: '', planPath: '', pointer: null, steps: [], found: [], title: '', titles: new Map(), leaves: [] };
  if (!plan) return { ...blank, why: 'no plan is in force, and the approval state printed below says why' };
  const title = (/^#\s+(.+)$/m.exec(plan.text) ?? [])[1] ?? '';
  const leaves = [...(/^## Leaves open\b[^\n]*\n([\s\S]*?)(?=^## |^# |$(?![\s\S]))/mi.exec(plan.text) ?? [, ''])[1].matchAll(/^\s*-\s+(.+?)\s*$/gm)].map((x) => x[1]);
  const base = { ...blank, planPath: plan.path, title, titles: stepTitles(plan.text), leaves };
  if (!planOrder(plan.text)) return { ...base, read: true, why: 'the plan in force has no "## Order" section with an "Order:" line' };
  const s = sid ? stepEnds({ session_id: sid }) : null;
  if (!s) return { ...base, why: `no transcript was found for the session${sid ? ` ${sid}` : ' (no CLAUDE_CODE_SESSION_ID in this shell)'}` };
  const pointer = pointerOf(plan.text, s.ends);
  const pad = scratchpadOf(sid);
  const steps = [...pointer.order.map((step) => ({ step, standing: false })), ...pointer.standing.filter((n) => !pointer.order.includes(n)).map((step) => ({ step, standing: true }))].map(({ step, standing }) => {
    const mine = s.ends.filter((e) => e.step === step).sort((a, b) => a.at - b.at);
    const newest = mine.at(-1) ?? null;
    const lines = newest ? String(newest.last ?? '').split('\n').map((l) => l.trim()).filter(Boolean) : [];
    const back = newest ? { id: newest.id, how: newest.how, at: newest.at, lines, path: newest.path } : null;
    const state = pointer.done.has(step) ? 'DONE'
      : s.runningSteps.has(step) ? 'running'
        : !newest ? 'not sent'
          : newest.how !== 'a report' ? `ended by ${newest.how}, no hand-back to count`
            : /^(?:REFUSED|FAILED)\b/.test(lines[0] ?? '') ? lines[0].match(/^(?:REFUSED|FAILED)/)[0]
              : `hand-back opens "${clip(lines[0] ?? '').slice(0, 40)}", not DONE`;
    const report = pad ? join(pad, 'progress', `step-${step}-report.txt`) : `progress/step-${step}-report.txt (no scratchpad found)`;
    let reportWritten = false;
    try { reportWritten = !!pad && statSync(report).isFile(); } catch { reportWritten = false; }
    return { step, standing, state, back, report, reportWritten };
  });
  return { ...base, read: true, pointer, steps, found: foundLines(pad) };
}

/**
 * What is open for the owner, in sentences.
 * @param {ReturnType<typeof pointerState>} st  `pointerState`'s answer.
 * @returns {string[]} one line per thing: why the pointer is not read, that the
 *   plan runs on through its next step, or, once every step in Order has a DONE
 *   hand-back, what the plan's own `## Leaves open` section lists. The page
 *   prints these under "Open for the owner".
 */
export function openForOwner(st) {
  if (!st.read) return [`The pointer is not read: ${st.why}.`];
  if (!st.pointer) return [`There is no pointer: ${st.why}.`];
  if (st.pointer.next !== null) return [`Nothing is waiting on the owner: the plan runs to its end, and step ${st.pointer.next} is next.`];
  return ['Every step in Order has a DONE hand-back: the plan has run to its end.', ...(st.leaves.length ? ['What the plan itself leaves open:', ...st.leaves.map((l) => `  ${l}`)] : [])];
}

/**
 * The pointer and hand-back block a status prints, after the goals.
 * @param {ReturnType<typeof pointerState>} st  `pointerState`'s answer.
 * @returns {string} a headed list, never a table. Its FIRST line is `next: step N`,
 *   `next: none` when every step in Order has a DONE hand-back, `next: not defined`
 *   when the plan has no Order and `next: not read` when it could not be read;
 *   then each step in Order with its state, the Standing steps, the newest
 *   hand-back of each step with every line it carries and the path of its
 *   report file, and the `Found:` lines of every report file. A hand-back has two
 *   lines by rule and the print shows however many it finds.
 */
export function pointerBlock(st) {
  if (!st.read) return `next: not read (${st.why}).`;
  if (!st.pointer) return `next: not defined (${st.why}).`;
  const p = st.pointer;
  const out = [p.next === null ? 'next: none' : `next: step ${p.next}`,
    `Order, each step's state: ${st.steps.filter((x) => !x.standing).map((x) => `${x.step} ${x.state}`).join('; ')}.`,
    ...(st.steps.some((x) => x.standing) ? [`Standing, sent at any time: ${st.steps.filter((x) => x.standing).map((x) => `${x.step} ${x.state}`).join('; ')}.`] : [])];
  const backs = st.steps.filter((x) => x.back);
  out.push(backs.length ? 'Hand-backs, the newest for each step, each read from the agent\'s own transcript:' : 'Hand-backs: no step has one yet.');
  for (const x of backs) {
    out.push(`- step ${x.step}, ended ${x.back.at ? `${californiaTime(new Date(x.back.at))} (California) ` : ''}by ${x.back.how}:`,
      ...(x.back.lines.length ? x.back.lines.map((l) => `    ${l}`) : ['    (the agent ended with no text)']),
      `  Report file: ${x.report} (${x.reportWritten ? 'written' : 'not written'})`);
  }
  out.push(st.found.length ? 'Found, from the report files:' : 'Found, from the report files: none.');
  for (const f of st.found) out.push(`- step ${f.step}: ${f.line}`);
  return out.join('\n');
}

const escapeHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The status page, as plain HTML from the same state the print comes from.
 * @param {ReturnType<typeof pointerState>} st  `pointerState`'s answer.
 * @param {string} given  the status the session wrote, as stamped.
 * @param {Date} [now]  the time of the status; now when omitted.
 * @returns {string} a complete HTML document with a title, colour tokens for both
 *   themes and no table: each step in Order with its state, the Standing steps,
 *   the last status time in California time, the `Found:` lines, and what is open
 *   for the owner. Every string from a report file or a hand-back is escaped.
 */
export function statusPage(st, given, now = new Date()) {
  const li = (s) => `<li>${s}</li>`;
  const stepItem = (x) => li(`<strong>Step ${x.step}</strong>${st.titles.get(x.step) ? ` ${escapeHtml(st.titles.get(x.step))}` : ''}: <span class="s">${escapeHtml(x.state)}</span>`
    + (x.back ? `<br><span class="m">${escapeHtml(x.back.lines.slice(0, 2).join(' | '))}</span>` : ''));
  const next = !st.read ? `not read (${st.why})` : !st.pointer ? `not defined (${st.why})` : st.pointer.next === null ? 'none' : `step ${st.pointer.next}`;
  const open = openForOwner(st);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Plan run status</title>
<style>
:root { --bg: #ffffff; --txt: #1b1f24; --txt-2: #4a5360; --line: #c9ced6; --card: #f4f6f8; --ok: #0b6b3a; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #14171b; --txt: #e8ebef; --txt-2: #aab2bd; --line: #3a414b; --card: #1d2228; --ok: #6fd39b; } }
:root[data-theme="dark"] { --bg: #14171b; --txt: #e8ebef; --txt-2: #aab2bd; --line: #3a414b; --card: #1d2228; --ok: #6fd39b; }
body { margin: 0; padding: 16px; background: var(--bg); color: var(--txt); font: 16px/1.5 system-ui, sans-serif; overflow-wrap: anywhere; }
main { max-width: 42rem; margin: 0 auto; }
h1 { font-size: 1.4rem; margin: 0 0 .25rem; }
h2 { font-size: 1.05rem; margin: 1.5rem 0 .5rem; }
p, li { margin: .25rem 0; }
ul { padding-left: 1.25rem; }
.m { color: var(--txt-2); font-size: .9rem; }
.s { font-weight: 600; }
.next { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: .75rem 1rem; }
</style>
</head>
<body>
<main>
<h1>Plan run status</h1>
<p class="m">${escapeHtml(st.title)}</p>
<p class="m">Last status ${escapeHtml(californiaStamp(now))}: ${escapeHtml(given)}</p>
<p class="next"><strong>next: ${escapeHtml(next)}</strong></p>
<h2>Steps in Order</h2>
<ul>${st.steps.filter((x) => !x.standing).map(stepItem).join('') || li('none')}</ul>
<h2>Standing steps</h2>
<ul>${st.steps.filter((x) => x.standing).map(stepItem).join('') || li('none')}</ul>
<h2>Found and not fixed</h2>
<ul>${st.found.map((f) => li(`Step ${f.step}: ${escapeHtml(f.line)}`)).join('') || li('none')}</ul>
<h2>Open for the owner</h2>
<ul>${open.map((o) => li(escapeHtml(o))).join('')}</ul>
</main>
</body>
</html>
`;
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
 *   and its last entry, each running agent whose progress note changed, with
 *   its latest line, and each agent a hook has REFUSED since the wait began,
 *   with the refusal's text from its own transcript (it returns at once on
 *   that); or, once `limit` has passed with none of them, a line
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
  // How many hook refusals each agent had when the wait began, and how big its
  // transcript was then: the file is read again only when it has grown.
  const sizeOf = (path) => { try { return statSync(path).size; } catch { return -1; } };
  const refusalsOf = (path) => agentReads(tailEntries(path, 16 * 1024 * 1024)).refusals;
  const seen = new Map(first.map((a) => [a.id, { size: sizeOf(a.path), n: refusalsOf(a.path).length }]));
  for (;;) {
    const waited = Date.now() - began;
    const now = runningAgents(sid, f) ?? [];
    const still = new Set(now.map((a) => a.id));
    const ended = first.filter((a) => !still.has(a.id));
    const moved = now.filter((a) => before.has(a.id) && noteSig(pad, a.step) !== before.get(a.id));
    // THE MOMENT AN AGENT IS REFUSED BY A HOOK the wait returns, the agents
    // that ended in the meantime included: the manager reads the refusal from
    // the agent's own transcript when it happens, not at the agent's return.
    const refused = [];
    for (const a of first) {
      const s = seen.get(a.id);
      const size = sizeOf(a.path);
      if (size === s.size) continue;
      s.size = size;
      const r = refusalsOf(a.path);
      if (r.length > s.n) { refused.push({ a, fresh: r.slice(s.n) }); s.n = r.length; }
    }
    if (ended.length || moved.length || refused.length) {
      const out = [`Wait: ${span(waited)} (the limit is ${span(limit)}).`];
      if (refused.length) {
        out.push('Refused by a hook since the wait began, each read from the agent\'s own transcript:');
        for (const { a, fresh } of refused) {
          for (const x of fresh) {
            out.push(`- agent ${a.id}${a.description ? ` "${a.description}"` : ''}, step ${a.step ?? 'unknown'}: refused `
              + `${Number.isFinite(x.at) ? `at ${californiaTime(new Date(x.at))} (California) ` : ''}on ${x.tool || 'a call'}.\n  ${clip(x.text).replace(/\n/g, '\n    ')}`);
          }
        }
      }
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
  // THE GOALS COME FIRST (Doctrine §0e rule 16): the stamp is already written,
  // so reading them can never cost the status. A section that cannot be read is
  // said so, never printed as an empty one.
  let goals = '';
  try { goals = goalsSection(); } catch { goals = ''; }
  console.log(goals || `${GOALS_HEADING}: not read (no such section in the CLAUDE.md beside report.mjs).`);
  console.log('');
  // THE POINTER COMES NEXT, after the goals: `next: step N`, read from the plan's
  // Order and the agents' hand-backs, then each hand-back and the Found lines of
  // every report file. The status page's source is written from the same read.
  // After the stamp, so a failure reading any of it never costs the status.
  const sid = String(process.env.CLAUDE_CODE_SESSION_ID ?? '');
  let state = null;
  try { state = pointerState(sid); } catch (e) { state = { read: false, why: `the read failed (${e?.message ?? e})`, pointer: null, steps: [], found: [], title: '', titles: new Map(), leaves: [] }; }
  console.log(pointerBlock(state));
  console.log('');
  console.log(status);
  if (m && m[1].padStart(5, '0') !== hhmm) console.log(`(the status said ${m[1]}; the clock says ${hhmm}, and that is what was stamped)`);
  try {
    const pad = sid ? scratchpadOf(sid) : null;
    if (pad) {
      mkdirSync(join(pad, 'status'), { recursive: true });
      writeFileSync(join(pad, 'status', 'fix-run.html'), statusPage(state, status));
    }
  } catch { /* the page is a convenience; the print above is the status */ }
  let ended;
  try { ended = sid ? agentEnds(sid, previous) : null; } catch { ended = null; }
  let block = '';
  try { block = agentsBlock(sid, previous, ended); } catch (e) { block = `Agents ended since the last status: not read (${e?.message ?? e}).`; }
  console.log(block);
  let progress = '';
  try { progress = progressBlock(sid); } catch (e) { progress = `Running agents' progress: not read (${e?.message ?? e}).`; }
  console.log(progress);
  // Every refusal each agent received and its last tool result, from its own
  // transcript: the manager judges an agent's work from these, not its report.
  let reads = '';
  try { reads = gateReadsBlock(sid, ended ?? []); } catch (e) { reads = `Agents' hook refusals and last tool results: not read (${e?.message ?? e}).`; }
  console.log(reads);
  // The approval state, read from disk: before sending the first agent under
  // any approval the manager gives a status and reads this.
  let approval = '';
  try { approval = approvalBlock(); } catch (e) { approval = `Approval state: not read (${e?.message ?? e}).`; }
  console.log(approval);
}
