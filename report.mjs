#!/usr/bin/env node
/**
 * A STATUS WHEN AN AGENT HAS ENDED, OR NOTHING ELSE RUNS (LESSONS §370, §384).
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
 *       section of that name, the standing goals), so the goals are in front
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
 *       written from the same read (`statusPage`), whole, at every status, in the
 *       shape the owner reads: a heading and an updated line, Versions, one
 *       section for each step with a chip in colour and in words, Open for you,
 *       and the Found lines not fixed. The manager's part is
 *       written by the main thread in `status/manager.txt` beside it
 *       (`managerNotes`), a file this command never rewrites, so what the manager
 *       writes survives the next status; the Decision, Explanation and fixed Found
 *       lines stay in that file and are not drawn on the page; a Found line it has
 *       not sorted prints as unsorted, tagged on the page and counted in this print. After a
 *       compaction the first read of the main thread is that page (hook-dispatch.mjs
 *       `pageGate`). RIGHT UNDER THE POINTER, ONE
 *       LINE FOR THE REVIEW (`reviewState`, `reviewBlock`): the first line of the
 *       current review's hand-back and the step it cleared, or why no review is
 *       current, read by the same function the dispatcher's review gate refuses on;
 *       the reviewer's own hand-back is the verdict, read from its transcript and
 *       never from a file. The same
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
 *       plan file's hash and last write time, whether they match, and, for a
 *       marker that records the approval's scope, which of Goals, Asked, Files
 *       and Commands changed since (`scopeChanged`). Before
 *       sending the first agent under any approval, the manager gives a status
 *       and reads it; the dispatch gate's refusals print the same lines.
 *       A STATUS SHOWS WHAT CHANGED AND NOTHING TWICE. What the session's
 *       statuses have printed is remembered (`readSeen`, `writeSeen`:
 *       ~/.claude/report-seen/<session>.json), so the goals print once per
 *       session; a hand-back prints once, under the step it is for, and the
 *       ended-agents list does not print its text again; a Found line prints when it
 *       is new, when its text, its sort or the manager's note changed, and while
 *       it is unsorted; a running agent's hook refusal prints once; the approval
 *       state prints in full only when it differs from the last. It adds the main
 *       thread's own reads since the last status as a count and their paths, and
 *       the refused reads of the record that no Read has since returned
 *       (`readsBlock`; the dispatch gate sends no step while one is named). With no
 *       session id there is no memory and everything prints, as it did. The whole
 *       record stays on the status page, which is rewritten whole.
 *   node report.mjs --page
 *       Run by hook-dispatch.mjs when the notice of an agent's end arrives as a
 *       prompt: rewrites the status page from the same read a status makes
 *       (`writeStatusPage`) and does nothing else. It stamps no clock, prints no
 *       status and writes no memory, so the status gate and the page gate are
 *       unchanged. The session is read from the hook's payload on stdin, else
 *       from CLAUDE_CODE_SESSION_ID.
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
import { join, dirname, resolve as resolvePath } from 'node:path';
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
 * An instant given as a California clock time on the California day of another instant.
 * @param {Date} onDay  any instant; only its California date is used, never the date in UTC.
 * @param {number} minutes  minutes after midnight on that California date, 0 to 1439.
 * @returns {number} the instant, in ms, whose California wall clock reads that date and
 *   that time; a whole number of minutes, so a difference between it and the minute an
 *   agent ended in is a whole number of minutes. The wall clock of a guess differs from
 *   the guess by the zone's offset, so the guess is moved by the offset read at the
 *   guess, three times, which settles on either side of a change of the clock. Only
 *   `stepTimeChips` reads it: the day comes from the END of the step's agent and not
 *   from now, so a step that finished just after midnight is measured on its own day.
 */
function californiaInstant(onDay, minutes) {
  const wall = (t) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
      .formatToParts(new Date(t)).map((x) => [x.type, Number(x.value)]));
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  };
  const day = wall(onDay.getTime());
  const wholeDay = 1440 * 60000;
  const target = day - (day % wholeDay) + minutes * 60000;
  let t = target;
  for (let i = 0; i < 3; i++) t = target - (wall(t) - t);
  return t;
}

/**
 * One `## Heading` section of a plan.
 * @param {string} text  the plan.
 * @param {string} name  the heading's first word or words, e.g. "Steps".
 * @returns {string} the section's body up to the next `##` or `#` heading, or '';
 *   the first matching heading wins. THE ONE DEFINITION of a plan's section: the
 *   dispatch gate, the plan fence, the plan guard and the approval's scope hashes
 *   (`scopeHashes`) all read sections through it (hook-dispatch.mjs re-exports
 *   it), so a hash can never cover what the consumers do not parse, nor leave
 *   out what they do.
 */
export function planSection(text, name) {
  const word = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = String(text ?? '').match(new RegExp(`^## ${word}\\b[^\\n]*\\n([\\s\\S]*?)(?=^## |^# |$(?![\\s\\S]))`, 'mi'));
  return m ? m[1] : '';
}

/**
 * The sections of a plan whose edit voids its approval (Doctrine §0e rule 13).
 * The owner approves what the work is for (Goals), what was asked (Asked), what
 * may be touched (Files) and what may be run (Commands); the Steps and the
 * Order are how the approved work is done, and an amendment to them keeps the
 * approval. The Goals the owner approves are the goals themselves and not the
 * `Served by:` line under them (`goalsWithoutServedBy`): that line maps steps to
 * goals, so it moves whenever a step is added or renumbered.
 */
export const SCOPE_SECTIONS = ['Goals', 'Asked', 'Files', 'Commands'];

/**
 * A plan's Goals section without its `Served by:` line.
 * @param {string} section  the body of the `## Goals` section, as `planSection` returns it.
 * @returns {string} the same text with the FIRST line that begins `Served by:`
 *   taken out, which is the one line `servedBy` in hook-dispatch.mjs reads and the
 *   only line left out: every other line, the numbered goals above all, stays as
 *   written, and a second line beginning that way stays too, so it cannot carry
 *   an edit past the approval. The text unchanged when no line begins so. The
 *   Goals hash in `scopeHashes` is taken over this.
 */
export function goalsWithoutServedBy(section) {
  const text = String(section ?? '');
  const lines = text.split('\n');
  const at = lines.findIndex((l) => /^Served by:/.test(l));
  if (at < 0) return text;
  lines.splice(at, 1);
  return lines.join('\n');
}

const sha256 = (text) => createHash('sha256').update(text).digest('hex');

/**
 * The hashes of a plan's approved scope.
 * @param {string} text  the plan.
 * @returns {Record<string, string>} for each of SCOPE_SECTIONS, the sha256 of its
 *   body as `planSection` returns it ('' when the plan has no such section, so
 *   a missing section has a hash too and adding one is a change), except that
 *   Goals is hashed without its `Served by:` line (`goalsWithoutServedBy`), so a
 *   step added or renumbered keeps the approval. The approval marker records this
 *   at approval; `scopeChanged` and the amendment gate in approved-plan-guard.mjs
 *   compare against it.
 */
export function scopeHashes(text) {
  const out = {};
  for (const name of SCOPE_SECTIONS) {
    const body = planSection(text, name);
    out[name] = sha256(name === 'Goals' ? goalsWithoutServedBy(body) : body);
  }
  return out;
}

/**
 * Which of the approved scope's sections a plan text no longer matches.
 * @param {Record<string, string>|null|undefined} then  the hashes the marker holds.
 * @param {string} text  the plan as it stands (or would stand after an edit).
 * @returns {string[]} the names from SCOPE_SECTIONS whose hash differs, in that
 *   order; every name when `then` is not an object, so a missing or damaged
 *   record fails closed. A marker recorded before the `Served by:` line left the
 *   Goals hash holds the hash of the whole Goals section, and its Goals still
 *   match while that whole section is unchanged, so a plan approved before this
 *   change keeps its approval; such a marker is made over by the first amendment
 *   (`--amend` in approved-plan-guard.mjs records `scopeHashes` again).
 */
export function scopeChanged(then, text) {
  const now = scopeHashes(text);
  const known = then && typeof then === 'object' && !Array.isArray(then);
  const wholeGoals = sha256(planSection(text, 'Goals'));
  return SCOPE_SECTIONS.filter((n) => !known || (then[n] !== now[n] && !(n === 'Goals' && then[n] === wholeGoals)));
}

/**
 * The script a plan carries for a Workflow call.
 * @param {string} text  the plan.
 * @returns {string|null} the text of the plan's `## Script` section that a
 *   Workflow call may carry: the content of the first fenced block there when
 *   the section has one, else the section's text with blank lines taken off both
 *   ends. null when the plan has no such section, when it is empty, or when what
 *   it holds does not begin `export const meta`, which every workflow script
 *   must (a section of prose is no script). The dispatch gate accepts a
 *   Workflow call whose `script` is exactly this text (`workflowGate` in
 *   hook-dispatch.mjs), and the approval marker records its hash (`scriptHashOf`)
 *   when the plan is approved.
 */
export function planScript(text) {
  const body = planSection(text, 'Script');
  if (!body.trim()) return null;
  const fence = /^```[^\n]*\n([\s\S]*?)\n```[ \t]*$/m.exec(body);
  const script = fence ? fence[1] : body.replace(/^(?:[ \t]*\n)+/, '').replace(/\s+$/, '');
  return /^export const meta\b/.test(script) ? script : null;
}

/**
 * The hash of a plan's script, as the approval marker records it.
 * @param {string} text  the plan.
 * @returns {string} the sha256 of `planScript(text)`, or '' when the plan has none.
 *   The marker holds it from the moment of approval and an amendment of the Steps
 *   or the Order never moves it, so a script edited after approval no longer
 *   matches and the Workflow call is refused.
 */
export function scriptHashOf(text) {
  const s = planScript(text);
  return s === null ? '' : sha256(s);
}

/**
 * Where the steps file of a plan is written.
 * @param {string} planPath  the plan file's path, `.md`.
 * @returns {string} the same path with `.steps.md` for the `.md`, beside the plan. An
 *   agent can be sent this file in place of the plan (`sentStep`), and read it first
 *   (`rulesFirst`): it holds the plan's Rules, Steps and Commands and nothing else, so an
 *   agent no longer reads the whole plan to learn its step.
 */
export function stepsFilePath(planPath) {
  return String(planPath).replace(/\.md$/i, '') + '.steps.md';
}

/**
 * The text of a plan's steps file.
 * @param {string} text  the plan.
 * @param {string} [planPath]  the plan file's path, named in the file's first line.
 * @returns {string} a first line saying it is derived from the plan and holds only its
 *   Rules, Steps and Commands, then EVERY section of the plan whose heading opens
 *   `## Rules`, `## Steps` or `## Commands` (a plan has `## Rules` and may have
 *   `## Rules of this plan` beside it, and an agent needs both), in the order the
 *   plan has them, each with its heading line and its body as `planSection` reads a
 *   body, trailing space trimmed; a plan with none of them gives the first line alone.
 *   THE INVARIANT its two callers rely on: the file is a pure function of the plan's
 *   text, so approved-plan-guard.mjs writes it at approval and at every amendment, and
 *   the dispatch gate refuses a prompt naming a steps file that is not what this
 *   returns for the plan in force.
 */
export function stepsFileText(text, planPath = '') {
  const parts = [`<!-- Derived from ${planPath || 'the approved plan'}: only its Rules, Steps and Commands. Rewritten at every approval and amendment; do not edit. -->`, ''];
  const re = /^(## (?:Rules|Steps|Commands)\b[^\n]*)\n([\s\S]*?)(?=^## |^# |$(?![\s\S]))/gmi;
  for (const m of String(text ?? '').matchAll(re)) parts.push(m[1], m[2].replace(/\s+$/, ''), '');
  return parts.join('\n');
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
  // A marker that records the approval's scope says WHICH of the four sections
  // changed, and tells an amendment of Steps or Order (the approval holds, and
  // the marker's hash follows the edit) from a change of scope (it does not).
  const scoped = mk.scope && typeof mk.scope === 'object' && !Array.isArray(mk.scope);
  const moved = scoped ? scopeChanged(mk.scope, bytes.toString('utf8')) : [];
  lines.push(`- Plan file now: hash ${now.slice(0, 12)}, last written ${written}.`,
    match ? '- Match: yes. The file is the plan that was approved, so the plan is in force.'
      : '- Match: NO. The file changed after it was approved, so no plan is in force; a changed plan goes back through plan mode.');
  if (scoped) {
    lines.push(moved.length
      ? `- Scope: CHANGED in ${moved.join(', ')}. Those sections are what the owner approved, so an edit to ${moved.length === 1 ? 'it' : 'them'} voids the approval; the plan goes back through plan mode.`
      : `- Scope: ${SCOPE_SECTIONS.join(', ')} are as approved.${match ? '' : ' Only Steps or Order differ, an edit the approval survives but that was not recorded in the marker, so the plan stays out of force until it goes back through plan mode.'}`);
  }
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
  const found = agentFiles(f.agents);
  const start = startedAt({ session_id: sid });
  let notified = null;
  const out = [];
  for (const a of found) {
    try { if (statSync(a.file).mtimeMs <= stampAt) continue; } catch { continue; }
    notified ??= notifiedStatuses(f.main);
    const id = a.id;
    const end = agentEnd(tailEntries(a.file, 4 * 1024 * 1024), agentMeta(a), start, notified.get(id) ?? '');
    if (end && end.at > stampAt) out.push({ id, description: String(agentMeta(a).description ?? ''), how: end.how, at: end.at });
  }
  return out.sort((a, b) => a.at - b.at);
}

/**
 * Every agent transcript of a session, the Workflow agents' included.
 * @param {string} dir  the session's `subagents/` folder (`sessionFiles(...).agents`).
 * @returns {{id: string, name: string, file: string, folder: string}[]} one entry per
 *   `agent-<id>.jsonl` found, sorted by file name, the first of an id kept: those
 *   directly in `dir`, then those one level below `dir/workflows/<run>/`, where the
 *   agents of a Workflow keep theirs (measured on this session's disk: `subagents/
 *   workflows/<run>/agent-<id>.jsonl` and its `.meta.json` beside it), then those in
 *   `<session>/workflows/<run>/` beside the subagents folder, which holds only a
 *   run's script folder (`scripts`) today and is read in case a harness moves the
 *   agents there. `folder` is where its `.meta.json` sits. [] when `dir` cannot be
 *   read. The status, the waits, the pointer, the stop guard and the plan fence all
 *   find an agent here, so a Workflow's agent is seen by each of them or by none.
 */
export function agentFiles(dir) {
  const out = [];
  const seen = new Set();
  const take = (folder) => {
    let names = [];
    try { names = readdirSync(folder); } catch { return; }
    for (const n of names) {
      const m = /^agent-([\w-]+)\.jsonl$/.exec(n);
      if (!m || seen.has(m[1])) continue;
      seen.add(m[1]);
      out.push({ id: m[1], name: n, file: join(folder, n), folder });
    }
  };
  const runs = (parent) => {
    let ds = [];
    try { ds = readdirSync(parent, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'scripts').map((d) => d.name).sort(); } catch { return []; }
    return ds.map((d) => join(parent, d));
  };
  take(dir);
  for (const r of runs(join(dir, 'workflows'))) take(r);
  for (const r of runs(join(dirname(dir), 'workflows'))) take(r);
  return out.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/**
 * A subagent's own transcript, found from the payload of one of its calls.
 * @param {object} p  a subagent's hook payload: `agent_id`, and `transcript_path`
 *   (the session's) or `session_id`.
 * @returns {string|null} the agent's `agent-<id>.jsonl` (`agentFiles`: directly in the
 *   subagents folder, or one level below `workflows/<run>/` where a Workflow's agents
 *   keep theirs), found beside the session transcript the payload names and, failing
 *   that, through the session id (`sessionFiles`); null when the payload names no
 *   agent or neither route holds the file. The plan fence reads the agent's rules
 *   Read from it and the dispatcher reads the step it was sent for, so both look in
 *   the same places.
 */
export function agentTranscriptPath(p) {
  const id = String(p?.agent_id ?? '');
  if (!/^[\w-]+$/.test(id)) return null;
  const tr = String(p?.transcript_path ?? '');
  const dirs = [];
  if (tr.endsWith('.jsonl')) dirs.push(join(tr.slice(0, -'.jsonl'.length), 'subagents'));
  try { const s = sessionFiles(String(p?.session_id ?? '')); if (s) dirs.push(s.agents); } catch { /* not found below */ }
  for (const d of dirs) {
    const hit = agentFiles(d).find((a) => a.id === id);
    if (hit) return hit.file;
  }
  return null;
}

/**
 * One agent's `.meta.json`.
 * @param {{id: string, folder: string}} a  an entry of `agentFiles`.
 * @returns {object} the parsed file beside the agent's transcript, or {} when it is
 *   not there or not JSON; `agentEnd` reads `stoppedByUser` from it and the status
 *   reads `description`.
 */
export function agentMeta(a) {
  try { return JSON.parse(readFileSync(join(a.folder, `agent-${a.id}.meta.json`), 'utf8')) ?? {}; } catch { return {}; }
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
  const out = [];
  for (const a of agentFiles(f.agents)) {
    const id = a.id;
    if (done.has(id)) continue;
    const meta = agentMeta(a);
    const end = agentEnd(tailEntries(a.file, 4 * 1024 * 1024), meta, start, notified.get(id) ?? '');
    if (!end) continue;
    done.add(id);
    if (!rec && !(end.at > stampAt)) continue;
    out.push({ id, description: String(meta.description ?? ''), ...end, path: a.file });
  }
  mkdirSync(dirname(recFile), { recursive: true });
  writeFileSync(recFile, JSON.stringify({ ids: [...done] }, null, 1));
  return out.sort((a, b) => a.at - b.at);
}

// ---- what a status remembers, so that it shows what changed and nothing twice (Doctrine §0e rule 2) ----

const safeKey = (sid) => String(sid ?? '').replace(/[^A-Za-z0-9_-]/g, '_');
const seenFile = (sid) => join(process.env.REPORT_SEEN_DIR || join(homedir(), '.claude', 'report-seen'), `${safeKey(sid)}.json`);

/**
 * What the statuses of a session have already printed.
 * @param {string} sid  the session id, or '' when the shell has none.
 * @returns {{goals?: boolean, backs?: Record<string, number>, found?: Record<string, string>,
 *   refusals?: Record<string, number>, approval?: string} | null} the record the
 *   last status left in ~/.claude/report-seen/<sid>.json: whether the goals were
 *   printed, each hand-back printed (`<agent id>@<time>`), each Found line as it
 *   was printed (its text, its sort and the manager's note), how many hook
 *   refusals of each agent were printed, and the hash of the approval state.
 *   {} when the session has none yet or the file cannot be read, so the first
 *   status prints everything; null when there is no session id, which means a
 *   status with no memory that prints everything and records nothing.
 */
export function readSeen(sid) {
  if (!sid) return null;
  try {
    const j = JSON.parse(readFileSync(seenFile(sid), 'utf8'));
    return j && typeof j === 'object' && !Array.isArray(j) ? j : {};
  } catch { return {}; }
}

/**
 * Record what a status printed.
 * @param {string} sid  the session id; nothing is written without one.
 * @param {object|null} seen  `readSeen`'s answer before the status.
 * @param {{backs: object, found: object, refusals: object, approval: string}} mark  what this status printed.
 * @returns {boolean} true when the record was written. The new record is the old
 *   one with this status's marks laid over it and `goals` set, so a failure to
 *   write costs only a repeat in the next status, never a missing line.
 */
export function writeSeen(sid, seen, mark) {
  if (!sid) return false;
  try {
    const f = seenFile(sid);
    mkdirSync(dirname(f), { recursive: true });
    const keep = (o, n) => Object.fromEntries(Object.entries(o ?? {}).slice(-n));
    writeFileSync(f, JSON.stringify({
      goals: true,
      backs: keep({ ...(seen?.backs ?? {}), ...mark.backs }, 400),
      found: keep({ ...(seen?.found ?? {}), ...mark.found }, 600),
      refusals: { ...(seen?.refusals ?? {}), ...mark.refusals },
      approval: mark.approval || seen?.approval || '',
    }));
    return true;
  } catch { return false; }
}

// ---- the compaction is said, once in a status and once in the first reply (Doctrine §0e rule 2, LESSONS §416) ----

const compactedFile = (sid) => join(process.env.COMPACTED_DIR || join(homedir(), '.claude', 'compacted'), `${safeKey(sid)}.json`);

/**
 * Record that a session was compacted just now.
 * @param {string} sid  the session id; nothing is written without one.
 * @param {number} [at]  the time in ms; now by default.
 * @returns {boolean} true when written. The record, one file for each session that a
 *   later compaction replaces whole, holds the time and two flags: whether a status has
 *   printed the notice (`printed`) and whether the first reply has said it (`told`).
 *   hook-dispatch.mjs writes it at a SessionStart whose source is a compaction.
 */
export function markCompacted(sid, at = Date.now()) {
  if (!sid) return false;
  try {
    const f = compactedFile(sid);
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, JSON.stringify({ at, printed: false, told: false }));
    return true;
  } catch { return false; }
}

/**
 * The compaction a session last had.
 * @param {string} sid  the session id.
 * @returns {{at: number, printed: boolean, told: boolean} | null} the record
 *   `markCompacted` left, null when there is none, it cannot be read, or it holds
 *   no time. The status, the status page and the stop guard all read it here, so
 *   they cannot disagree about when the session was compacted.
 */
export function readCompacted(sid) {
  if (!sid) return null;
  try {
    const j = JSON.parse(readFileSync(compactedFile(sid), 'utf8'));
    return j && Number.isFinite(Number(j.at)) && Number(j.at) > 0 ? { at: Number(j.at), printed: !!j.printed, told: !!j.told } : null;
  } catch { return null; }
}

/**
 * Set a flag of the compaction record.
 * @param {string} sid  the session id.
 * @param {{printed?: boolean, told?: boolean}} patch  the flags to set.
 * @returns {boolean} true when the record existed and was rewritten with the flags laid
 *   over it; false when there is no record, so a flag is never set for a compaction
 *   that was not recorded.
 */
export function setCompacted(sid, patch) {
  const c = readCompacted(sid);
  if (!c) return false;
  try { writeFileSync(compactedFile(sid), JSON.stringify({ ...c, ...patch })); return true; } catch { return false; }
}

/**
 * The words the notice of a compaction uses.
 * @param {{at: number}} c  `readCompacted`'s answer.
 * @returns {string} "Compacted at HH:MM California time on YYYY-MM-DD.", the time read
 *   from the record. The status prints it, the page carries it, and the stop guard
 *   holds the first reply's first line to the same time.
 */
export function compactedWords(c) {
  const d = new Date(c.at);
  return `Compacted at ${californiaTime(d)} California time on ${d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })}.`;
}

const refusedFile = (sid) => join(process.env.REFUSED_READS_DIR || join(homedir(), '.claude', 'refused-reads'), `${safeKey(sid)}.json`);

/**
 * Record that a read of a path of the record was refused.
 * @param {string} sid  the session id; nothing is recorded without one.
 * @param {string} path  the absolute path the refused Read named.
 * @param {string} [why]  the refusal's text, kept to 200 characters.
 * @param {number} [at]  the time in ms; now by default.
 * @returns {boolean} true when written. One entry per path (a later refusal
 *   replaces the earlier), the newest 50 kept. `unreadRefusals` says which of
 *   these have been read since; the status names them and the dispatch gate
 *   sends no step while one is named (`readsGate` in hook-dispatch.mjs).
 */
export function noteRefusedRead(sid, path, why = '', at = Date.now()) {
  if (!sid || !path) return false;
  try {
    const f = refusedFile(sid);
    let list = [];
    try { list = JSON.parse(readFileSync(f, 'utf8')).reads ?? []; } catch { list = []; }
    list = list.filter((x) => x.path !== path);
    list.push({ path: String(path), at, why: String(why).slice(0, 200) });
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, JSON.stringify({ reads: list.slice(-50) }));
    return true;
  } catch { return false; }
}

/**
 * The refused reads recorded for a session.
 * @param {string} sid  the session id.
 * @returns {{path: string, at: number, why: string}[]} oldest first; [] when there are none or the record cannot be read.
 */
export function refusedReads(sid) {
  if (!sid) return [];
  try { const r = JSON.parse(readFileSync(refusedFile(sid), 'utf8')).reads; return Array.isArray(r) ? r : []; } catch { return []; }
}

/**
 * The refused reads that no Read has since returned.
 * @param {{path: string, at: number}[]} list  `refusedReads`' answer.
 * @param {object[]} entries  the main transcript's entries (`tailEntries`).
 * @returns {{path: string, at: number, why: string}[]} each refused read of a file
 *   that still exists with no later Read call of the main thread on exactly that
 *   path whose result was not an error. A file that is gone, or is not a regular
 *   file, cannot be read and is dropped, so a path that was never there cannot
 *   hold the dispatch gate for ever. THE INVARIANT `readsGate` relies on: a path
 *   in this list can be cleared by reading it, and by nothing else.
 */
export function unreadRefusals(list, entries) {
  const asked = new Map();
  const reads = new Map();
  for (const e of entries ?? []) {
    if (e?.isSidechain || e?.agentId) continue;
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) {
      for (const b of c) if (b?.type === 'tool_use' && b.name === 'Read') asked.set(b.id, resolvePath(String(b.input?.file_path ?? '')));
    }
    const t = Date.parse(e?.timestamp ?? '');
    if (e?.type === 'user' && Array.isArray(c) && Number.isFinite(t)) {
      for (const b of c) {
        if (b?.type !== 'tool_result' || b.is_error || !asked.has(b.tool_use_id)) continue;
        const p = asked.get(b.tool_use_id);
        reads.set(p, Math.max(reads.get(p) ?? 0, t));
      }
    }
  }
  return (list ?? []).filter((x) => {
    try { if (!statSync(x.path).isFile()) return false; } catch { return false; }
    return !((reads.get(resolvePath(x.path)) ?? 0) > Number(x.at));
  });
}

/**
 * The main thread's reads since a time.
 * @param {object[]} entries  the main transcript's entries.
 * @param {number} since  the last status's time in ms (0 for all).
 * @returns {{count: number, tools: Record<string, number>, paths: string[]}} the Read,
 *   Grep and Glob calls the main thread made after `since` (a subagent's entries
 *   are not in this file; a sidechain entry is skipped), how many of each, and the
 *   distinct paths they named (a Read's file, a Grep's path or "the working
 *   directory", a Glob's pattern), in the order first met.
 */
export function mainReadsSince(entries, since) {
  const out = { count: 0, tools: {}, paths: [] };
  for (const e of entries ?? []) {
    if (e?.type !== 'assistant' || e.isSidechain || e.agentId) continue;
    const t = Date.parse(e.timestamp ?? '');
    if (!Number.isFinite(t) || t <= since) continue;
    for (const b of Array.isArray(e.message?.content) ? e.message.content : []) {
      if (b?.type !== 'tool_use' || !/^(?:Read|Grep|Glob)$/.test(b.name ?? '')) continue;
      out.count++;
      out.tools[b.name] = (out.tools[b.name] ?? 0) + 1;
      const i = b.input ?? {};
      const p = String(b.name === 'Read' ? (i.file_path ?? '') : b.name === 'Grep' ? (i.path ?? 'the working directory') : (i.pattern ?? ''));
      if (p && !out.paths.includes(p)) out.paths.push(p);
    }
  }
  return out;
}

/**
 * The reads block a status prints.
 * @param {string} sid  the session id, or '' when the shell has none.
 * @param {number} since  the last status's time in ms.
 * @returns {string} lines, never a table: how many reads the main thread made since
 *   the last status, of which tools, with their paths (at most 30 shown, the rest
 *   counted); then the refused reads of the record not read since, each with its
 *   time, or that there are none. A plain line when the transcript cannot be read.
 */
export function readsBlock(sid, since) {
  const f = sid ? sessionFiles(sid) : null;
  if (!f) return `Main thread reads since the last status: not read (${sid ? `no transcript found for session ${sid}` : 'no CLAUDE_CODE_SESSION_ID in this shell'}).`;
  const entries = tailEntries(f.main, 16 * 1024 * 1024);
  const r = mainReadsSince(entries, since);
  const kinds = Object.entries(r.tools).map(([k, n]) => `${k} ${n}`).join(', ');
  const shown = r.paths.slice(0, 30);
  const lines = [r.count
    ? `Main thread reads since the last status: ${r.count} (${kinds}): ${shown.join(', ')}${r.paths.length > shown.length ? `, and ${r.paths.length - shown.length} more` : ''}.`
    : 'Main thread reads since the last status: none.'];
  const open = unreadRefusals(refusedReads(sid), entries);
  if (!open.length) lines.push('Refused reads of the record not read since: none.');
  else {
    lines.push('Refused reads of the record NOT read since (the dispatch gate sends no step while one is named; reading the file clears it):');
    for (const x of open) lines.push(`- ${x.path}, refused at ${californiaTime(new Date(x.at))} (California)${x.why ? `: ${x.why.replace(/\s+/g, ' ')}` : ''}`);
  }
  return lines.join('\n');
}

/**
 * The agents block a status prints.
 * @param {string} sid  the session id, or '' when the shell has none.
 * @param {number} stampAt  the last status's time in ms.
 * @param {object[]|null} [ended]  the agents `agentEnds` found ended since the last status.
 * @param {Map<string, number>} [printed]  agent id to the plan step whose hand-back this
 *   status printed in full above (`pointerBlock`'s `mark.agents`); such an agent's last
 *   entry is not printed a second time.
 * @returns {string} a headed list, never a table: one item per ended agent with
 *   how it ended, when (California), its transcript and its last entry; "none"
 *   when none ended; and a plain line when the session's files cannot be read,
 *   so the status never implies a read it did not make. An agent whose hand-back
 *   is already above says so in place of the text, so nothing is printed twice.
 */
export function agentsBlock(sid, stampAt, ended = undefined, printed = new Map()) {
  if (ended === undefined) ended = sid ? agentEnds(sid, stampAt) : null;
  if (!ended) return `Agents ended since the last status: not read (${sid ? `no transcript found for session ${sid}` : 'no CLAUDE_CODE_SESSION_ID in this shell'}).`;
  if (!ended.length) return 'Agents ended since the last status: none.';
  return ['Agents ended since the last status, each read from its own transcript:', ...ended.map((a) =>
    `- ${a.id}${a.description ? ` "${a.description}"` : ''} ended ${a.at ? `at ${californiaTime(new Date(a.at))} (California) ` : ''}by ${a.how}.\n`
    + `  Transcript: ${a.path}\n  Last entry: ${printed.has(a.id) ? `its hand-back, printed above under step ${printed.get(a.id)}.` : a.last.replace(/\n/g, '\n    ')}`)].join('\n');
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
 *   status never implies a read it did not make. With a memory (`seen`, from
 *   `readSeen`) an agent that is still running is listed only when it has hook
 *   refusals no earlier status printed, and then only those, so a refusal is
 *   shown once; an agent that ended since the last status is listed in full.
 *   `mark.refusals` is filled with each agent's refusal count for `writeSeen`.
 */
export function gateReadsBlock(sid, ended = [], seen = null, mark = null) {
  const running = sid ? runningAgents(sid) : null;
  if (!running) return `Agents' hook refusals and last tool results: not read (${sid ? `no transcript found for session ${sid}` : 'no CLAUDE_CODE_SESSION_ID in this shell'}).`;
  const list = [...running.map((a) => ({ id: a.id, description: a.description, path: a.path, state: 'running' })),
    ...(ended ?? []).map((a) => ({ id: a.id, description: a.description, path: a.path, state: `ended by ${a.how}` }))];
  if (!list.length) return 'Agents\' hook refusals and last tool results: no agent is running and none has ended since the last status.';
  const items = [];
  for (const a of list) {
    const who = `- agent ${a.id}${a.description ? ` "${a.description}"` : ''} (${a.state})`;
    const r = agentReads(tailEntries(a.path, 16 * 1024 * 1024));
    const before = a.state === 'running' && seen ? Number(seen.refusals?.[a.id]) || 0 : 0;
    if (mark) mark.refusals[a.id] = r.refusals.length;
    if (a.state === 'running' && seen && r.refusals.length <= before) continue;
    const when = (t) => (Number.isFinite(t) ? `${californiaTime(new Date(t))} (California)` : 'an unreadable time');
    const fresh = r.refusals.slice(before);
    const shown = fresh.slice(-REFUSALS_SHOWN);
    const head = fresh.length
      ? `${fresh.length} hook refusal${fresh.length === 1 ? '' : 's'}${before ? ' new since the last status' : ''}${fresh.length > shown.length ? `, the newest ${shown.length} below` : ''}.`
      : 'no hook refusals.';
    items.push([`${who}: ${head}`,
      ...shown.map((f) => `  Refused at ${when(f.at)}, ${f.tool || 'a call'}: ${clip(f.text).replace(/\n/g, '\n    ')}`),
      r.last ? `  Last tool result, ${r.last.tool || 'a call'}, ${when(r.last.at)}${r.last.error ? ', an error' : ''}: ${clip(r.last.text).replace(/\n/g, '\n    ')}`
        : '  Last tool result: none yet.'].join('\n'));
  }
  if (!items.length) return 'Agents\' hook refusals and last tool results: no running agent has a hook refusal that an earlier status did not print, and none has ended since.';
  return ['Agents\' hook refusals and last tool results, each read from the agent\'s own transcript, never from what it said:', ...items].join('\n');
}

// ---- running agents' progress notes ----

/**
 * The plan step an agent was sent to do, read from the prompt it was given.
 * @param {string} path  the agent's transcript.
 * @param {string} [head]  its first 64 KB, when the caller already read it.
 * @returns {number|null} N when the first user entry in the file's first 64 KB
 *   is a plan path and a step number, the only prompt the dispatch gate lets
 *   through (`<plan> step N` or `<plan> N`); null when the file cannot be read
 *   or the prompt is anything else. `progressBlock` reads `progress/step-N.txt`
 *   by it, so a wrong N prints another agent's note as this one's.
 */
export function agentStep(path, head = agentHead(path)) {
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
 * The first 64 KB of an agent's transcript.
 * @param {string} path  the agent's transcript.
 * @returns {string} the text of the file's first 64 KB, or '' when it cannot be
 *   read. `agentStep` and `agentStart` both read the start of the file, so
 *   `stepEnds` reads it once per agent and hands it to both.
 */
function agentHead(path) {
  try {
    const fd = openSync(path, 'r');
    try {
      const b = Buffer.alloc(64 * 1024);
      return b.toString('utf8', 0, readSync(fd, b, 0, b.length, 0));
    } finally { closeSync(fd); }
  } catch { return ''; }
}

/**
 * When an agent began.
 * @param {string} path  the agent's transcript.
 * @param {string} [head]  its first 64 KB, when the caller already read it.
 * @returns {number} the time in ms of the first entry in the file's first 64 KB
 *   that carries a readable timestamp, or NaN when none does. The review gate
 *   requires a reviewer to have STARTED after what it judges (an end time would
 *   let a reviewer that began before a hand-back pass it), and reads NaN as not
 *   after anything, so an unreadable start fails closed.
 */
export function agentStart(path, head = agentHead(path)) {
  for (const line of head.split('\n')) {
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    const t = Date.parse(e?.timestamp ?? '');
    if (Number.isFinite(t)) return t;
  }
  return NaN;
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
  const out = [];
  for (const a of agentFiles(f.agents)) {
    const id = a.id;
    const meta = agentMeta(a);
    const path = a.file;
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
 * @returns {{ends: {id: string, step: number|null, how: string, at: number, startAt: number, last: string, path: string}[],
 *   running: string[], runningSteps: Set<number>} | null} `ends`: each agent
 *   `agentEnd` finds ended, in file-name order, with the plan step its prompt
 *   names (`agentStep`; null when the prompt names none), how it ended, when,
 *   when it began (`agentStart`; NaN when unreadable, which the review gate
 *   reads as not after anything), its
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
  const notified = notifiedStatuses(f.main);
  const start = startedAt({ session_id: sid });
  const ends = [];
  const running = [];
  const runningSteps = new Set();
  for (const a of agentFiles(f.agents)) {
    const id = a.id;
    const path = a.file;
    const meta = agentMeta(a);
    let end;
    try { end = agentEnd(tailEntries(path, 4 * 1024 * 1024), meta, start, notified.get(id) ?? ''); } catch { continue; }
    const head = agentHead(path);
    const step = agentStep(path, head);
    if (!end) { running.push(`agent ${id}`); if (step !== null) runningSteps.add(step); continue; }
    ends.push({ id, step, how: end.how, at: end.at, startAt: agentStart(path, head), last: end.last, path });
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
 * The step numbers a plan sends, and which of them are Standing.
 * @param {string} text  the plan.
 * @returns {{order: number[], standing: number[]}} where the plan has an `## Order`,
 *   the numbers `planOrder` reads, in the order written, and its Standing ones;
 *   otherwise the numbers that open a line of its `## Steps` section (each `N.`),
 *   in plan order and without repeats, and no Standing step. Both empty when the
 *   plan has neither. THE ONE LIST the judgement gate and the judgement state
 *   share, so a plan with no Order is judged before each send the way a plan with
 *   one is.
 */
export function stepNumbers(text) {
  const o = planOrder(text);
  if (o) return { order: o.order, standing: o.standing };
  return { order: [...new Set([...planSection(text, 'Steps').matchAll(/^(\d+)\.\s/gm)].map((m) => Number(m[1])))], standing: [] };
}

/**
 * The step numbers a plan holds, as the approval records them.
 * @param {string} text  the plan at the moment of approval.
 * @returns {{steps: number[], standing: number[]}} `steps`: each number that opens a line of the
 *   `## Steps` section (each `N.`), in plan order and without repeats; `standing`: the numbers on the
 *   `Standing:` line under `## Order` (`planOrder`), in the order written, [] when the plan has no
 *   Order. THE ONE READING of what a plan held when it was approved: approved-plan-guard.mjs writes
 *   both lists into the marker at approval and an amendment never moves them, and the dispatch gate
 *   and the review gate (`approvalSetProblem` in hook-dispatch.mjs) hold a send to them, so a step
 *   added to the Steps, or put on the Standing line, after the approval is not a step that was read.
 */
export function approvedStepSet(text) {
  const steps = [...new Set([...planSection(text, 'Steps').matchAll(/^(\d+)\.\s/gm)].map((m) => Number(m[1])))];
  return { steps, standing: planOrder(text)?.standing ?? [] };
}

/** The parts of a `Judged N:` line, in the order the manager writes them (Doctrine §0e rule 2). */
export const JUDGED_PARTS = ['is', 'why', 'route', 'fails', 'cheapest'];
/** The parts of a `Why N:` line: the reasons for the step about to go. */
export const WHY_PARTS = ['now', 'wrong', 'fails', 'cheapest'];
/** The fewest characters a part must carry for the line to count as written. */
export const PART_MIN = 10;

/**
 * Which parts of a judgement line are missing.
 * @param {string} text  a notes line after its key, e.g. everything after `Judged 41:`.
 * @param {string[]} parts  the labels it must carry (`JUDGED_PARTS` or `WHY_PARTS`).
 * @returns {string[]} each label of `parts` the line does not carry, or carries with
 *   fewer than `PART_MIN` characters after it, in the order of `parts`; [] when the
 *   line is whole. A part opens a segment of the line split on ` | ` with its label
 *   and a colon (`is: …`); a segment that opens with no label belongs to the part
 *   before it, so a bar inside a part's own words does not cut it short. A label
 *   that appears twice counts once, the first. It forces each part to be written
 *   and cannot judge that what is written is true.
 */
export function missingParts(text, parts) {
  const got = new Map();
  let last = '';
  for (const seg of String(text ?? '').split(' | ')) {
    const m = /^\s*(is|why|route|fails|cheapest|now|wrong)\s*:\s*([\s\S]*)$/i.exec(seg);
    if (m && !got.has(m[1].toLowerCase())) { last = m[1].toLowerCase(); got.set(last, m[2]); }
    else if (last) got.set(last, `${got.get(last)} | ${seg}`);
  }
  return parts.filter((l) => String(got.get(l) ?? '').trim().length < PART_MIN);
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

// ---- the review: a fresh agent clears every move before it goes ----

/**
 * The file a Standing step has to tell its agent to follow, at the hub's root.
 * The reviewer's hand-back is the verdict. It is read from the reviewer's own
 * transcript, never from a file: any agent of the session can write the
 * scratchpad, and a file would be a verdict nobody gave.
 */
export const AIM_FILE = 'aim-review.md';

/**
 * The hub's shared rules for every agent, at the hub's root. A plan's `## Rules`
 * section points at it by full path and version instead of copying it
 * (`rulesProblem` in hook-dispatch.mjs), and the agents read it by that path.
 */
export const RULES_FILE = 'agent-rules.md';

/**
 * The shared rules file, read.
 * @param {string} [file]  the file; the one beside this script by default.
 * @returns {{version: number|null, block: string[], text: string}|null} null when
 *   the file cannot be read. `version` is the number on the line `Rules version: N`
 *   (null when it has none, which every caller treats as unreadable and refuses
 *   on), `block` the rule lines, each line of the file that opens `- `, trailing
 *   space trimmed, in order. The pointer a plan carries is pinned to `version`, and
 *   a plan that copies the rules instead has to hold every line of `block`.
 */
export function agentRules(file = join(HUB_DIR, RULES_FILE)) {
  let text = '';
  try { text = readFileSync(file, 'utf8'); } catch { return null; }
  const v = /^Rules version:\s*(\d+)\s*$/m.exec(text);
  return { version: v ? Number(v[1]) : null, block: text.split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => /^- /.test(l)), text };
}

/**
 * The text of one step of a plan.
 * @param {string} text  the plan.
 * @param {number} n  a step number.
 * @returns {string} the step's line in `## Steps` from its number up to the line
 *   before the next step's, sub-bullets included; '' when the plan has no such step.
 *   `aimReviewSteps` reads a Standing step's instructions from it.
 */
export function stepBody(text, n) {
  const m = /^## Steps\b[^\n]*\n([\s\S]*?)(?=^## |^# |$(?![\s\S]))/mi.exec(String(text ?? ''));
  if (!m) return '';
  return m[1].split(/^(?=\d+\.\s)/m).find((s) => new RegExp(`^${Number(n)}\\.\\s`).test(s)) ?? '';
}

/**
 * Does a step's text name the hub's review file by its full path?
 * @param {string} body  a step's text (`stepBody`).
 * @returns {boolean} true when it holds an absolute path ending in `aim-review.md`
 *   that is this hub's file or the live clone's, `~/.claude/hub/aim-review.md`.
 *   A bare file name could be any file in any folder, and the agent that follows
 *   it would read whatever it found; a full path is the one file the owner can read.
 */
function namesReviewFile(body) {
  const ours = new Set([join(HUB_DIR, AIM_FILE), join(homedir(), '.claude', 'hub', AIM_FILE)]);
  return [...String(body ?? '').matchAll(/(?:^|[\s`'"(])(\/[^\s`'"()]*\/aim-review\.md)(?![\w.-])/g)].some((m) => ours.has(m[1]));
}

/**
 * The Standing steps of a plan that tell their agent to follow the review file.
 * @param {string} text  the plan.
 * @returns {number[]} each step on the `Standing:` line whose text names the
 *   hub's `aim-review.md` by its full path and says follow; [] when the plan has
 *   no `## Order` or no such step. The review gate enforces only where this is
 *   not empty, because its refusal names one of these steps as the way out, and
 *   plan-guard.mjs refuses to let a plan with an Order go up without one.
 */
export function aimReviewSteps(text) {
  const o = planOrder(text);
  if (!o) return [];
  return o.standing.filter((n) => { const b = stepBody(text, n); return namesReviewFile(b) && /\bfollow/i.test(b); });
}

/**
 * A review's verdict, parsed from the first line of the reviewer's hand-back.
 * @param {string} first  the hand-back's first line.
 * @returns {{aim: string, route: string, step: number|null|'none', next: number|null}|null}
 *   null unless the line opens with ON-AIM or OFF-AIM and then ROUTE-CLEAR or
 *   ROUTE-REFUSED, as words. `step` is the number after the word "step" (the
 *   hand-back judged; 'none' when it says so, null when it says nothing), and
 *   `next` the number after the word "next" (the step whose route it read; null
 *   when absent). Any other opening, the older ON-AIM alone included, is not a
 *   verdict.
 */
export function parseVerdict(first) {
  const m = /^(ON-AIM|OFF-AIM)\s+(ROUTE-CLEAR|ROUTE-REFUSED)\b(.*)$/.exec(String(first ?? '').trim());
  if (!m) return null;
  const step = /\bstep\s+(\d+|none)\b/i.exec(m[3]);
  const next = /\bnext\s+(\d+)\b/i.exec(m[3]);
  return { aim: m[1], route: m[2], step: step ? (/^none$/i.test(step[1]) ? 'none' : Number(step[1])) : null, next: next ? Number(next[1]) : null };
}

/**
 * Where the review of the plan in force stands: the one reader the review gate
 * (hook-dispatch.mjs `reviewGate`) and the status (`reviewBlock`) share, so they
 * cannot disagree. Every move of the plan is cleared by a fresh agent that wrote
 * none of the work, whose hand-back is the verdict, read from its transcript.
 * @param {object} p  a PreToolUse payload or `{session_id}`, as `stepEnds` reads it.
 * @param {{path: string, text: string} | null} plan  the plan in force.
 * @param {{ends?: object[]|null, runningSteps?: Set<number>, planAt?: number, after?: number}} [opts]
 *   `ends` and `runningSteps` in place of `stepEnds`' (the test passes them);
 *   `planAt` the plan file's last write in ms (read from the file when omitted);
 *   `after` a time in ms the review must also have STARTED after, which a
 *   standing correction sets to the time the owner's newest message was typed.
 * @returns {{kind: string, reviewers: number[], order: number[], step: number|null,
 *   refAt: number, review: object|null, first: string, aim: string, route: string,
 *   cleared: number|null}}
 *   `kind` is: 'not-enforced' (no plan, or no Standing step follows aim-review.md);
 *   'not-read' (the session's agents cannot be read: the gate fails CLOSED here);
 *   'missing' (no review has handed back); 'running' (a review is running and no
 *   current one clears a move); 'stale' (the newest review STARTED no later than
 *   the newest end of an agent for a step in Order, the plan file's last write, or
 *   `after`); 'unreadable' (a current hand-back that is not a verdict);
 *   'off-aim'; 'route-refused'; 'wrong-step' (a current ON-AIM ROUTE-CLEAR whose
 *   "step" is not the step of the newest end of an Order agent); 'no-next' (a
 *   clearance naming no step to send); 'cleared' (ON-AIM ROUTE-CLEAR, current,
 *   naming the step it read the route of, `cleared`).
 *   THE REFERENCE: `refAt` is the latest of the end of any agent for a step in the
 *   plan's ORDER (a DONE hand-back or not: a refused one is what the next move
 *   answers), the plan file's last write and `after`. A Standing step never
 *   counts, because the reviewer's own hand-back ends after the verdict it gave
 *   and would otherwise make every verdict stale the moment it returned. `step`
 *   is the step of that newest end, or null when no Order step has ended; with
 *   none, the verdict's "step" is not compared. Whoever calls this relies on the
 *   one invariant: a move is cleared only by a review that began after
 *   everything it judges, so nothing it never saw can be cleared by it.
 */
export function reviewState(p, plan, opts = {}) {
  const base = { kind: 'not-enforced', reviewers: [], order: [], step: null, refAt: 0, review: null, first: '', aim: '', route: '', cleared: null };
  if (!plan) return base;
  const reviewers = aimReviewSteps(plan.text);
  if (!reviewers.length) return base;
  const order = planOrder(plan.text).order;
  const read = 'ends' in opts ? { ends: opts.ends, runningSteps: opts.runningSteps ?? new Set() } : stepEnds(p);
  const hand = { ...base, reviewers, order };
  if (!read?.ends) return { ...hand, kind: 'not-read' };
  let judged = null;
  for (const e of read.ends) {
    if (e.step === null || !order.includes(e.step)) continue;
    if (!judged || e.at > judged.at) judged = e;
  }
  let planAt = 0;
  if ('planAt' in opts) planAt = Number(opts.planAt) || 0;
  else { try { planAt = statSync(plan.path).mtimeMs; } catch { planAt = 0; } }
  const refAt = Math.max(judged?.at ?? 0, planAt, Number(opts.after) || 0);
  const seen = { ...hand, step: judged?.step ?? null, refAt };
  let review = null;
  for (const e of read.ends) {
    if (!reviewers.includes(e.step) || e.how !== 'a report') continue;
    if (!review || e.at > review.at) review = e;
  }
  const waiting = reviewers.some((n) => read.runningSteps?.has(n));
  if (!review) return { ...seen, kind: waiting ? 'running' : 'missing' };
  const first = firstLineOf(review.last);
  const lined = { ...seen, review, first };
  if (!(review.startAt > refAt)) return { ...lined, kind: waiting ? 'running' : 'stale' };
  const v = parseVerdict(first);
  if (!v) return { ...lined, kind: 'unreadable' };
  const parsed = { ...lined, aim: v.aim, route: v.route };
  if (v.aim === 'OFF-AIM') return { ...parsed, kind: 'off-aim' };
  if (v.route === 'ROUTE-REFUSED') return { ...parsed, kind: 'route-refused' };
  if (judged && v.step !== judged.step) return { ...parsed, kind: 'wrong-step' };
  if (v.next === null) return { ...parsed, kind: 'no-next' };
  return { ...parsed, kind: 'cleared', cleared: v.next };
}

/**
 * The review line a status prints, under the pointer.
 * @param {ReturnType<typeof reviewState>} st  `reviewState`'s answer.
 * @returns {string} one line, never a table: what the review clears and the first
 *   line of its hand-back, or why no review is current and the Standing step that
 *   makes one; or that the review is not enforced, not read, or running. The text
 *   never carries more of the hand-back than its first line.
 */
export function reviewBlock(st) {
  const send = st.reviewers.length ? ` Send Standing step ${st.reviewers[0]}.` : '';
  const when = st.review ? `the review that ended ${californiaStamp(st.review.at)} (it began ${californiaStamp(st.review.startAt)})` : 'no review';
  const judged = st.step === null ? 'no step in Order has ended yet' : `the newest end of a step in Order is step ${st.step}`;
  switch (st.kind) {
    case 'not-enforced': return 'Review: not enforced (no Standing step of the plan in force follows the hub\'s aim-review.md by its full path).';
    case 'not-read': return 'Review: not read (the session\'s agents cannot be read), so no step of the plan is cleared.';
    case 'missing': return `Review: none has handed back; ${judged}.${send}`;
    case 'running': return `Review: a review is running and none current clears a move; ${judged}. Its completion brings the session back.`;
    case 'stale': return `Review: ${when} began before something it did not judge (${judged}, or the plan's last write, or the owner's newest message), so it clears nothing.${send}`;
    case 'unreadable': return `Review: ${when} handed back "${st.first}", which is not a verdict; the first line is ON-AIM or OFF-AIM, then ROUTE-CLEAR or ROUTE-REFUSED, then "step N" and "next M".${send}`;
    case 'off-aim': return `Review: ${when} reads "${st.first}". The plan is off aim; it goes back to plan mode.`;
    case 'route-refused': return `Review: ${when} reads "${st.first}". The route is refused; the step is amended in the plan's Steps or Order, then reviewed again.${send}`;
    case 'wrong-step': return `Review: ${when} reads "${st.first}", and judged another step than the newest end in Order (${judged}).${send}`;
    case 'no-next': return `Review: ${when} reads "${st.first}", and names no step to send.${send}`;
    default: return `Review: ${when} reads "${st.first}"; it clears step ${st.cleared} and no other.`;
  }
}

/**
 * Where the manager's written judgement of the newest hand-back stands: the one reader
 * the dispatcher's judgement gate (`judgedGate`) and the status (`judgedBlock`) share.
 * @param {object} p  a PreToolUse payload or `{session_id}`, as `stepEnds` reads it.
 * @param {{path: string, text: string} | null} plan  the plan in force.
 * @param {{ends?: object[]|null, pad?: string|null, send?: number|null}} [opts]  `ends` in
 *   place of `stepEnds`' (the test passes them), `pad` the scratchpad (found from the session
 *   id when omitted) and `send` the step about to be sent, which the dispatcher's gate
 *   passes and a status does not.
 * @returns {{kind: string, step: number|null, endAt: number, ends: number, have: number,
 *   partial: number, missing: string[], notesAt: number, file: string, send: number|null,
 *   whyHave: number, whyNeed: number, whyMissing: string[]}} `kind` is: 'not-enforced' (no
 *   plan, no step in it, or no agent has ended for a step of it and none is being sent);
 *   'not-read' (the session's agents cannot be read: the gate fails CLOSED here); 'judged';
 *   or one of the ways it is not: 'no-pad' (no scratchpad, so no notes file), 'none' (no
 *   `Judged N:` line for the step), 'short' (fewer whole lines than ends of that step, so
 *   the newest end has none of its own), 'incomplete' (a line is there and lacks a part, or
 *   carries it with fewer than `PART_MIN` characters: `missing` says which), 'stale' (the
 *   file's last write is not after the newest end), and, for the step being sent, 'why-none',
 *   'why-short' and 'why-incomplete' (its `Why <send>:` lines, counted against the sends of
 *   that step, one for each earlier end and one for this send). The plan's steps are its
 *   Order where it has one and its `## Steps` where it has not (`stepNumbers`); a Standing
 *   step being sent is not enforced. `step` is the step of the newest end of an agent for a
 *   step of the plan, however it ended (a refusal and an interruption are judged too),
 *   `endAt` its time, `ends` how many ends that step has, `have` how many of its
 *   `Judged <step>:` lines carry all five parts (`JUDGED_PARTS`), `partial` how many do not,
 *   `notesAt` the notes file's last write in ms and `file` its path. `whyHave` and
 *   `whyNeed` count whole `Why` lines (`WHY_PARTS`) against the need. THE INVARIANT: 'judged'
 *   only when `have >= ends`, `notesAt > endAt` and, for a step being sent, `whyHave >=
 *   whyNeed`, so a line left by an earlier send of the same step, with the file written to
 *   since for another reason, is not the newest judgement.
 */
export function judgedState(p, plan, opts = {}) {
  const base = { kind: 'not-enforced', step: null, endAt: 0, ends: 0, have: 0, partial: 0, missing: [], notesAt: 0, file: '', send: null, whyHave: 0, whyNeed: 0, whyMissing: [] };
  if (!plan) return base;
  const sn = stepNumbers(plan.text);
  if (!sn.order.length) return base;
  const send = Number.isInteger(opts.send) ? opts.send : null;
  if (send !== null && sn.standing.includes(send)) return base;
  const read = 'ends' in opts ? { ends: opts.ends } : stepEnds(p);
  if (!read?.ends) return { ...base, kind: 'not-read' };
  let newest = null;
  for (const e of read.ends) {
    if (e.step === null || !sn.order.includes(e.step)) continue;
    if (!newest || e.at > newest.at) newest = e;
  }
  if (!newest && send === null) return base;
  const pad = 'pad' in opts ? opts.pad : (p?.session_id ? scratchpadOf(String(p.session_id)) : null);
  const file = pad ? join(pad, MANAGER_FILE) : '';
  const notes = file ? managerNotes(pad) : null;
  let notesAt = 0;
  if (file) { try { notesAt = statSync(file).mtimeMs; } catch { notesAt = 0; } }
  const st = { ...base, send, file, notesAt };
  if (newest) {
    const lines = notes?.judged.get(newest.step) ?? [];
    const short = lines.filter((l) => missingParts(l, JUDGED_PARTS).length);
    Object.assign(st, { step: newest.step, endAt: newest.at, ends: read.ends.filter((e) => e.step === newest.step).length,
      have: lines.length - short.length, partial: short.length, missing: short.length ? missingParts(short.at(-1), JUDGED_PARTS) : [] });
  }
  if (!file) return { ...st, kind: 'no-pad' };
  if (newest) {
    if (st.have < st.ends) return { ...st, kind: st.partial > 0 ? 'incomplete' : st.have === 0 ? 'none' : 'short' };
    if (!(notesAt > newest.at)) return { ...st, kind: 'stale' };
  }
  if (send !== null) {
    const lines = notes.whys.get(send) ?? [];
    const short = lines.filter((l) => missingParts(l, WHY_PARTS).length);
    const need = read.ends.filter((e) => e.step === send).length + 1;
    Object.assign(st, { whyHave: lines.length - short.length, whyNeed: need, whyMissing: short.length ? missingParts(short.at(-1), WHY_PARTS) : [] });
    if (st.whyHave < need) return { ...st, kind: short.length ? 'why-incomplete' : st.whyHave === 0 ? 'why-none' : 'why-short' };
  }
  return { ...st, kind: 'judged' };
}

/**
 * The judgement line a status prints, under the review line.
 * @param {ReturnType<typeof judgedState>} st  `judgedState`'s answer.
 * @returns {string} one line, never a table: whether the newest end of a step of the plan
 *   has its `Judged N:` line with the five parts, or why the dispatcher's judgement gate
 *   holds the next step; the judged line also says the step about to go needs its own
 *   `Why` line. The OWED line names the file and the whole form to write.
 */
export function judgedBlock(st) {
  const at = st.endAt ? californiaStamp(st.endAt) : '';
  const where = st.file || 'status/manager.txt (no scratchpad found)';
  switch (st.kind) {
    case 'not-enforced': return 'Judgement: nothing to judge (no agent has ended for a step of the plan, or the plan has no steps).';
    case 'not-read': return 'Judgement: not read (the session\'s agents cannot be read), so no step is sent.';
    case 'judged': return `Judgement: step ${st.step}'s newest hand-back (ended ${at}) is judged in ${st.file}; the step about to go needs its own "Why <step>: now: … | wrong: … | fails: … | cheapest: …" line there.`;
    case 'why-none':
    case 'why-short':
    case 'why-incomplete': return `Judgement: OWED. Step ${st.send} is about to go and ${where} holds ${st.whyHave} whole "Why ${st.send}:" line${st.whyHave === 1 ? '' : 's'} of the ${st.whyNeed} it needs (now, wrong, fails, cheapest, each ten characters or more), and no step is sent until it is there.`;
    default: return `Judgement: OWED. Step ${st.step}'s newest hand-back ended ${at}; ${where} needs a line "Judged ${st.step}: is: <what the hand-back showed> | why: <why it ended as it did> | route: <what that means for the route> | fails: <where the route fails next> | cheapest: <the cheapest route from here that holds the owner's rules>" written after it, each part ten characters or more (${st.have} whole line${st.have === 1 ? '' : 's'} for ${st.ends} end${st.ends === 1 ? '' : 's'}${(st.missing ?? []).length ? `; the newest line held lacks ${st.missing.join(', ')}` : ''}), and no step is sent until it is there.`;
  }
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
 * @returns {{step: number, n: number, key: string, file: string, line: string}[]} each
 *   line beginning `Found:` in `progress/step-N-report.txt`, by step then file
 *   order, trimmed; [] when there is no scratchpad or no such file. `n` is the
 *   line's place among that file's Found lines, counted from 1, and `key` is
 *   `<step>.<n>` ("41.3", the third Found line of step 41's report): the name the
 *   manager sorts it by in `status/manager.txt` (`managerNotes`), and the name the
 *   status prints it under. A report file rewritten with its Found lines in another
 *   order renames them, so the manager sorts a step's lines once its report is final.
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
    const step = parseInt(n.slice(5), 10);
    let k = 0;
    for (const l of text.split('\n')) if (/^Found:/.test(l.trim())) { k++; out.push({ step, n: k, key: `${step}.${k}`, file: join(dir, n), line: clip(l.trim()) }); }
  }
  return out;
}

/** The manager's own notes, a plain-text file in the session scratchpad that `report.mjs` never rewrites. */
export const MANAGER_FILE = 'status/manager.txt';

/**
 * The manager's notes for the status page: what the status page carries that no
 * agent's report holds.
 * @param {string|null} pad  the session scratchpad (`scratchpadOf`).
 * @returns {{read: boolean, outcome: string, standing: {text: string, evidence: string}[],
 *   ruledOut: {text: string, evidence: string}[], decisions: {text: string, reason: string}[],
 *   next: string, sorts: Map<string, {how: string, note: string}>}}
 *   `read` is false, with every list empty, when there is no scratchpad or no such
 *   file. The file is plain text, one item to a line, blank lines and lines opening
 *   with `#` ignored, the label case-blind: `Outcome: <what the owner will see when
 *   the plan is done, in the owner's terms>`; `Explanation standing: <the
 *   explanation> | <the evidence for it>`; `Explanation ruled out: <the explanation>
 *   | <the evidence against it>`; `Decision: <what was decided> | <the reason>`;
 *   `Next: <the next move>`; `Judged <step>: is: … | why: … | route: … | fails: … |
 *   cheapest: …`, one line for each end of that step, which the dispatcher's judgement
 *   gate reads (`judgedState`; `judged` maps a step to its lines, in file order, whole or
 *   not: `missingParts` says which parts a line lacks); the six keys the status page's
 *   shape is drawn from
 *   (`statusPage`): `Version: <one line of what production, staging or the hub carries>`
 *   (`versions`, in file order), `Open: <one thing waiting on the owner>` (`open`, in
 *   file order), and the four that carry a step number, `What <step>: <what the step is>`,
 *   `Why <step>: now: … | wrong: … | fails: … | cheapest: …`, `Next <step>: <what follows
 *   it>` (`what`, `why` and `nexts` map a step to its newest line, a later line for the
 *   same step replacing an earlier one; `whys` maps a step to every `Why` line in file
 *   order, which the judgement gate counts against the sends of the step) and `Done
 *   <step>: <why the step counts as done>` (`done` maps a step to its
 *   text, which may be empty: the main thread counts a step done by decision, whatever
 *   its newest hand-back says); and the two that carry the time chips, `Start <step>: HH:MM`
 *   (`starts` maps a step to the minutes after midnight, California time, at which the manager
 *   sent it; an hour past 23 or a minute past 59 is not read, and a later line for the same step
 *   replaces an earlier one) and `Estimate <step>: <M> min` (`estimates` maps a step to the
 *   plan's estimate in minutes, a whole number above zero, the word min optional). Neither is a
 *   measurement the renderer takes: `stepTimeChips` draws what the manager wrote.
 *   `Next: ...` with no step number is the unnumbered key above
 *   and `Next 119: ...` is the numbered one; neither reads the other's line.
 *   Also `Found <step>.<n> fixed|stopping|queued: <note>`,
 *   which sorts the nth `Found:` line of that step's report (`foundLines`) as put
 *   right, stopping the plan, or recorded for the next plan; `Found <step>.*` sorts
 *   every Found line of that step at once, and a line for one `<step>.<n>` beats it
 *   (`sortOf`). The text before the
 *   first ` | ` is the item and the rest its evidence or reason; a later line for
 *   the same Found key replaces an earlier one. Any other line is ignored. The
 *   status page is rewritten whole at every status, so a line the manager keeps
 *   goes here and not into the page's source; nothing in this file is run or
 *   trusted as markup (`statusPage` escapes it).
 */
export function managerNotes(pad) {
  const out = { read: false, outcome: '', standing: [], ruledOut: [], decisions: [], next: '', sorts: new Map(), judged: new Map(),
    versions: [], open: [], what: new Map(), why: new Map(), whys: new Map(), nexts: new Map(), done: new Map(), starts: new Map(), estimates: new Map() };
  if (!pad) return out;
  let text = '';
  try { text = readFileSync(join(pad, MANAGER_FILE), 'utf8'); } catch { return out; }
  out.read = true;
  const split = (s) => { const i = s.indexOf(' | '); return i < 0 ? [s.trim(), ''] : [s.slice(0, i).trim(), s.slice(i + 3).trim()]; };
  for (const raw of text.split('\n')) {
    const l = raw.trim();
    if (!l || l.startsWith('#')) continue;
    let m;
    if ((m = /^Outcome\s*:\s*(.+)$/i.exec(l))) out.outcome = m[1].trim();
    else if ((m = /^Explanation standing\s*:\s*(.+)$/i.exec(l))) { const [t, e] = split(m[1]); out.standing.push({ text: t, evidence: e }); }
    else if ((m = /^Explanation ruled out\s*:\s*(.+)$/i.exec(l))) { const [t, e] = split(m[1]); out.ruledOut.push({ text: t, evidence: e }); }
    else if ((m = /^Decision\s*:\s*(.+)$/i.exec(l))) { const [t, r] = split(m[1]); out.decisions.push({ text: t, reason: r }); }
    else if ((m = /^Next\s*:\s*(.+)$/i.exec(l))) out.next = m[1].trim();
    else if ((m = /^Judged\s+(\d+)\s*:\s*(\S.*)$/i.exec(l))) out.judged.set(Number(m[1]), [...(out.judged.get(Number(m[1])) ?? []), m[2].trim()]);
    else if ((m = /^Version\s*:\s*(\S.*)$/i.exec(l))) out.versions.push(m[1].trim());
    else if ((m = /^Open\s*:\s*(\S.*)$/i.exec(l))) out.open.push(m[1].trim());
    else if ((m = /^What\s+(\d+)\s*:\s*(\S.*)$/i.exec(l))) out.what.set(Number(m[1]), m[2].trim());
    else if ((m = /^Why\s+(\d+)\s*:\s*(\S.*)$/i.exec(l))) {
      out.why.set(Number(m[1]), m[2].trim());
      out.whys.set(Number(m[1]), [...(out.whys.get(Number(m[1])) ?? []), m[2].trim()]);
    }
    else if ((m = /^Next\s+(\d+)\s*:\s*(\S.*)$/i.exec(l))) out.nexts.set(Number(m[1]), m[2].trim());
    else if ((m = /^Done\s+(\d+)\s*:\s*(.*)$/i.exec(l))) out.done.set(Number(m[1]), m[2].trim());
    else if ((m = /^Start\s+(\d+)\s*:\s*(\d{1,2}):(\d{2})\s*$/i.exec(l)) && Number(m[2]) < 24 && Number(m[3]) < 60) out.starts.set(Number(m[1]), Number(m[2]) * 60 + Number(m[3]));
    else if ((m = /^Estimate\s+(\d+)\s*:\s*(\d+)\s*(?:min(?:ute)?s?)?\s*$/i.exec(l)) && Number(m[2]) > 0) out.estimates.set(Number(m[1]), Number(m[2]));
    else if ((m = /^Found\s+(\d+)\.(\d+|\*)\s+(fixed|stopping|queued)\s*:?\s*(.*)$/i.exec(l))) out.sorts.set(`${Number(m[1])}.${m[2] === '*' ? '*' : Number(m[2])}`, { how: m[3].toLowerCase(), note: m[4].trim() });
  }
  return out;
}

/**
 * How the manager sorted one Found line.
 * @param {{sorts?: Map<string, {how: string, note: string}>}|null|undefined} notes  `managerNotes`' answer.
 * @param {{step: number, key: string}} f  a Found line (`foundLines`).
 * @returns {{how: string, note: string}|null} the sort for its own key (`41.3`), else the
 *   sort for its whole step (`41.*`), else null: a line for one Found line beats the
 *   line for its step, so a step can be put right in bulk and one finding in it kept.
 *   The print and the page both read the sort here, so they cannot disagree.
 */
export function sortOf(notes, f) {
  return notes?.sorts?.get(f.key) ?? notes?.sorts?.get(`${f.step}.*`) ?? null;
}

/**
 * Every Found line, placed.
 * @param {{key: string}[]} found  `foundLines`' answer.
 * @param {{sorts: Map<string, {how: string, note: string}>}|null|undefined} notes  `managerNotes`' answer.
 * @returns {{fixed: object[], stopping: object[], queued: object[], unsorted: object[]}} each
 *   Found line in the group the manager sorted it into (`sortOf`), with its `note`, in the
 *   order `foundLines` gave them; a line the manager has not sorted, or every line
 *   when there are no notes, is `unsorted`. The four lists together hold every
 *   Found line exactly once, which the status and the page both count from.
 */
export function sortFound(found, notes) {
  const out = { fixed: [], stopping: [], queued: [], unsorted: [] };
  for (const f of found ?? []) {
    const s = sortOf(notes, f);
    (s ? out[s.how] ?? out.unsorted : out.unsorted).push({ ...f, note: s?.note ?? '' });
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
 *   found: object[], title: string, titles: Map<number, string>, leaves: string[],
 *   goalOne: string, reviewers: number[], manager: ReturnType<typeof managerNotes>, managerPath: string}}
 *   `reviewers` are the Standing steps that follow the hub's review file
 *   (`aimReviewSteps`), [] when none does or no plan is in force: the status page draws
 *   them as one Reviews line and not as steps with a chip.
 *   `read` is false, with `why`, when no plan is in force or its agents cannot be
 *   read; `pointer` is null when the plan defines none. Each of `steps` is a
 *   number of the plan's Order, then its Standing ones, with its state: DONE, a
 *   hand-back's first line (REFUSED, FAILED or anything else), "ended by <how>",
 *   "running" or "not sent"; `back` is the newest ended agent for it, with the
 *   hand-back's lines, and `report` the path its report file is written to
 *   (`stepRow` builds each row, `doneAt` included). A plan with no Order line has
 *   no pointer, and its `steps` are still one row for each number that opens a
 *   line of its `## Steps` section (`stepNumbers`), in the order of the steps and
 *   none Standing, read the way an Order step is, so the page draws a section for
 *   every step; they are `[]` when its agents cannot be read, and its `found` is `[]`.
 *   `goalOne` is the first numbered goal of the plan's own Goals section, the
 *   outcome the page falls back on when the manager has written none; `manager` is
 *   `managerNotes` of the session scratchpad and `managerPath` where the manager
 *   writes them. The console print and the status page both come from this, so
 *   they cannot disagree.
 */
export function pointerState(sid, plan = planInForce()) {
  // The manager's notes do not depend on a plan being in force: after a plan is
  // out of force they are still what the page should show.
  const managerPad = sid ? scratchpadOf(sid) : null;
  const blank = { read: false, why: '', planPath: '', pointer: null, steps: [], found: [], title: '', titles: new Map(), leaves: [], goalOne: '', reviewers: [],
    manager: managerNotes(managerPad), managerPath: managerPad ? join(managerPad, MANAGER_FILE) : `${MANAGER_FILE} (no scratchpad found)`,
    compacted: sid ? readCompacted(sid) : null };
  if (!plan) return { ...blank, why: 'no plan is in force, and the approval state printed below says why' };
  const title = (/^#\s+(.+)$/m.exec(plan.text) ?? [])[1] ?? '';
  const leaves = [...(/^## Leaves open\b[^\n]*\n([\s\S]*?)(?=^## |^# |$(?![\s\S]))/mi.exec(plan.text) ?? [, ''])[1].matchAll(/^\s*-\s+(.+?)\s*$/gm)].map((x) => x[1]);
  const goalOne = (planSection(plan.text, 'Goals').split('\n').find((l) => /^\d+\.\s/.test(l)) ?? '').replace(/^\d+\.\s*/, '').trim();
  const base = { ...blank, planPath: plan.path, title, titles: stepTitles(plan.text), leaves, goalOne, reviewers: aimReviewSteps(plan.text) };
  const pad = managerPad;
  if (!planOrder(plan.text)) {
    // No Order line: no pointer, and still a section for every step of the plan's Steps section, in the order of the steps.
    // The steps' DONE hand-backs are read by `pointerOf`, the one definition of DONE, over an Order line made from those numbers.
    const nums = stepNumbers(plan.text).order;
    const s0 = sid && nums.length ? stepEnds({ session_id: sid }) : null;
    const done0 = s0 ? pointerOf(`## Order\nOrder: ${nums.join(' ')}\n`, s0.ends).done : null;
    return { ...base, read: true, why: 'the plan in force has no "## Order" section with an "Order:" line', steps: s0 ? nums.map((step) => stepRow(step, false, done0, s0, pad)) : [] };
  }
  const s = sid ? stepEnds({ session_id: sid }) : null;
  if (!s) return { ...base, why: `no transcript was found for the session${sid ? ` ${sid}` : ' (no CLAUDE_CODE_SESSION_ID in this shell)'}` };
  const pointer = pointerOf(plan.text, s.ends);
  const steps = [...pointer.order.map((step) => ({ step, standing: false })), ...pointer.standing.filter((n) => !pointer.order.includes(n)).map((step) => ({ step, standing: true }))]
    .map(({ step, standing }) => stepRow(step, standing, pointer.done, s, pad));
  return { ...base, read: true, pointer, steps, found: foundLines(pad) };
}

/**
 * One step of a plan as the print and the page read it.
 * @param {number} step  the step's number.
 * @param {boolean} standing  whether the plan lists it as a Standing step.
 * @param {Set<number>} done  the steps with a DONE hand-back (`pointerOf`'s `done`).
 * @param {{ends: object[], runningSteps: Set<number>}} s  `stepEnds`' answer, not null.
 * @param {string|null} pad  the session scratchpad, null when there is none.
 * @returns {{step: number, standing: boolean, state: string, back: object|null, report: string, reportWritten: boolean, doneAt: number|null}}
 *   `state` is DONE, a hand-back's first line (REFUSED, FAILED or anything else), "ended by
 *   <how>", "running" or "not sent", as `pointerState` documents; `back` the newest ended
 *   agent for the step; `doneAt` the end, in ms, of the newest agent whose hand-back opened
 *   DONE (the very end `stepEnds` read for it), null when no agent's did. The invariant
 *   `stepTimeChips` relies on: `doneAt` is the end of an agent that handed back DONE and of no
 *   other, so a duration measured to it is the duration of the work that was counted done.
 */
function stepRow(step, standing, done, s, pad) {
  const mine = s.ends.filter((e) => e.step === step).sort((a, b) => a.at - b.at);
  const newest = mine.at(-1) ?? null;
  const lines = newest ? String(newest.last ?? '').split('\n').map((l) => l.trim()).filter(Boolean) : [];
  const back = newest ? { id: newest.id, how: newest.how, at: newest.at, lines, path: newest.path } : null;
  const state = done.has(step) ? 'DONE'
    : s.runningSteps.has(step) ? 'running'
      : !newest ? 'not sent'
        : newest.how !== 'a report' ? `ended by ${newest.how}, no hand-back to count`
          : /^(?:REFUSED|FAILED)\b/.test(lines[0] ?? '') ? lines[0].match(/^(?:REFUSED|FAILED)/)[0]
            : `hand-back opens "${clip(lines[0] ?? '').slice(0, 40)}", not DONE`;
  const report = pad ? join(pad, 'progress', `step-${step}-report.txt`) : `progress/step-${step}-report.txt (no scratchpad found)`;
  let reportWritten = false;
  try { reportWritten = !!pad && statSync(report).isFile(); } catch { reportWritten = false; }
  const doneEnd = mine.filter((e) => e.how === 'a report' && DONE.test(firstLineOf(e.last))).at(-1) ?? null;
  return { step, standing, state, back, report, reportWritten, doneAt: doneEnd ? doneEnd.at : null };
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
 *   report file, and the `Found:` lines of every report file, each under its key
 *   (`step 41 #3`) and the group the manager sorted it into or `unsorted`, with the
 *   counts of the four groups in the heading line; then one line saying whether the
 *   manager's notes (`managerNotes`) are written and what they hold. A hand-back has
 *   two lines by rule and the print shows however many it finds.
 *   WHAT CHANGED AND NOTHING TWICE: with a memory (`seen`, from `readSeen`) a
 *   hand-back is printed once, the status that first meets it, and a Found line is
 *   printed when it is new, when its text or its sort or the manager's note changed,
 *   or while it is unsorted; a sorted line an earlier status printed is counted and
 *   left to the status page. With no memory (`seen` null) everything prints, as it
 *   did. `mark` (when given) is filled with what this print showed, for `writeSeen`:
 *   `backs` (`<agent id>@<time>`), `found` (key to the stamp printed), and `agents`,
 *   a Map of agent id to step for `agentsBlock`, which must not print those again.
 */
export function pointerBlock(st, seen = null, mark = null) {
  if (!st.read) return `next: not read (${st.why}).`;
  if (!st.pointer) return `next: not defined (${st.why}).`;
  const p = st.pointer;
  const out = [p.next === null ? 'next: none' : `next: step ${p.next}`,
    `Order, each step's state: ${st.steps.filter((x) => !x.standing).map((x) => `${x.step} ${x.state}`).join('; ')}.`,
    ...(st.steps.some((x) => x.standing) ? [`Standing, sent at any time: ${st.steps.filter((x) => x.standing).map((x) => `${x.step} ${x.state}`).join('; ')}.`] : [])];
  const backs = st.steps.filter((x) => x.back);
  const backKey = (x) => `${x.back.id}@${x.back.at}`;
  const fresh = backs.filter((x) => !seen || !seen.backs?.[backKey(x)]);
  if (!backs.length) out.push('Hand-backs: no step has one yet.');
  else if (!fresh.length) out.push('Hand-backs: none new since the last status; the status page carries each one.');
  else out.push('Hand-backs new since the last status, the newest for each step, each read from the agent\'s own transcript:');
  for (const x of fresh) {
    out.push(`- step ${x.step}, ended ${x.back.at ? `${californiaTime(new Date(x.back.at))} (California) ` : ''}by ${x.back.how}:`,
      ...(x.back.lines.length ? x.back.lines.map((l) => `    ${l}`) : ['    (the agent ended with no text)']),
      `  Report file: ${x.report} (${x.reportWritten ? 'written' : 'not written'})`);
    if (mark) { mark.backs[backKey(x)] = 1; mark.agents.set(x.back.id, x.step); }
  }
  const groups = sortFound(st.found, st.manager);
  if (!st.found.length) out.push('Found, from the report files: none.');
  else {
    out.push(`Found, from the report files (${st.found.length}: ${groups.fixed.length} fixed, ${groups.stopping.length} stopping the plan, ${groups.queued.length} queued, ${groups.unsorted.length} unsorted):`);
    let held = 0;
    for (const f of st.found) {
      const s = sortOf(st.manager, f);
      const how = s ? s.how : 'unsorted';
      const stamp = `${f.line}|${how}|${s?.note ?? ''}`;
      if (seen && seen.found?.[f.key] === stamp && how !== 'unsorted') { held++; continue; }
      out.push(`- step ${f.step} #${f.n} [${how}]: ${f.line}${s?.note ? ` (${s.note})` : ''}`);
      if (mark) mark.found[f.key] = stamp;
    }
    if (held) out.push(`(${held} Found line${held === 1 ? '' : 's'} sorted and printed by an earlier status ${held === 1 ? 'is' : 'are'} not printed again; the status page carries ${held === 1 ? 'it' : 'them'}.)`);
  }
  out.push(managerLine(st, groups));
  return out.join('\n');
}

/**
 * The one line of a status that says whether the manager's notes are written.
 * @param {ReturnType<typeof pointerState>} st  `pointerState`'s answer.
 * @param {ReturnType<typeof sortFound>} groups  `sortFound` of its Found lines.
 * @returns {string} with no notes file, where to write it and the line shapes it
 *   reads; with one, the counts of what it holds and how many Found lines are
 *   still unsorted. The status page is built from the same notes, so a status that
 *   says they are missing is a page that says so too.
 */
function managerLine(st, groups) {
  const m = st.manager;
  if (!m?.read) {
    return `State page: no manager notes at ${st.managerPath}. The page carries only the pointer and the Found lines until they are written there, as plain text, one item to a line: `
      + '"Outcome: …", "Explanation standing: … | evidence", "Explanation ruled out: … | evidence", "Decision: … | reason", "Next: …", "Judged 41: …" and "Found 41.3 fixed|stopping|queued: note" ("Found 41.* …" sorts a whole step at once); '
      + 'the page itself is drawn from "Version: …", "Open: …", "What 41: …", "Why 41: …", "Next 41: …", "Done 41: …", "Start 41: HH:MM" and "Estimate 41: M min".';
  }
  return `State page: manager notes read from ${st.managerPath}: ${m.outcome ? 'an outcome written' : 'no outcome written'}; `
    + `explanations standing ${m.standing.length}, ruled out ${m.ruledOut.length}; decisions ${m.decisions.length}; ${m.next ? 'a next move written' : 'no next move written'}; `
    + `${groups.unsorted.length} of ${st.found.length} Found lines unsorted. Page lines: ${m.versions.length} version, ${m.open.length} open, what ${m.what.size}, why ${m.why.size}, next ${m.nexts.size}, done ${m.done.size}.`;
}

const escapeHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * How one step shows on the status page: its chip's colour and its words.
 * @param {ReturnType<typeof pointerState>} st  `pointerState`'s answer.
 * @param {{step: number, standing: boolean, state: string}} x  one of its `steps`.
 * @returns {{cls: 'done'|'wait'|'held'|'open', words: string}} `cls` picks the chip's
 *   colour token and `words` is what the chip says, so the state never rests on colour
 *   alone. In this order: `done` (green) for a hand-back opening DONE and for a step the
 *   manager's notes name on a `Done N:` line whatever its newest end, because the main
 *   thread counts a step done by decision; `running` (amber) for a step an agent is
 *   running; `under review` (amber) for the step the notes' unnumbered `Next:` line names
 *   first while a review step is running; `open` (red) for a step whose newest end is a
 *   refusal, a failure, an interruption or any hand-back that does not open DONE; and
 *   `held` (purple) for a step not sent, with what it waits on: `after step K`, K the
 *   nearest step before it in Order that is not done, `next to send` where none is, and
 *   `sent at any time` for a Standing step. A plan with no Order line has no pointer, and
 *   its held words are taken from the order of its steps instead (`st.steps`, the steps
 *   that are not Standing), so the same words read the same way. THE INVARIANT `statusPage` relies on: each
 *   step gets exactly one chip and the order above is the precedence, so a step counted
 *   done by decision never shows red for the refusal it was counted past, and a step is
 *   never both running and held.
 */
export function stepChip(st, x) {
  const m = st.manager ?? managerNotes(null);
  if (m.done.has(x.step) || x.state === 'DONE') return { cls: 'done', words: 'done' };
  if (x.state === 'running') return { cls: 'wait', words: 'running' };
  const reviewing = (st.steps ?? []).some((y) => (st.reviewers ?? []).includes(y.step) && y.state === 'running');
  const named = /\b(\d+)\b/.exec(m.next);
  if (reviewing && named && Number(named[1]) === x.step) return { cls: 'wait', words: 'under review' };
  if (x.state !== 'not sent') return { cls: 'open', words: 'open' };
  if (x.standing) return { cls: 'held', words: 'held, sent at any time' };
  const order = st.pointer?.order ?? (st.steps ?? []).filter((z) => !z.standing).map((z) => z.step);
  let after = null;
  for (let i = order.indexOf(x.step) - 1; i >= 0 && after === null; i--) {
    const y = (st.steps ?? []).find((z) => z.step === order[i]);
    if (y && y.state !== 'DONE' && !m.done.has(y.step)) after = y.step;
  }
  return { cls: 'held', words: after === null ? 'held, next to send' : `held, after step ${after}` };
}

/**
 * The time chips of one step, drawn beside its state chip.
 * @param {ReturnType<typeof pointerState>} st  `pointerState`'s answer; its `manager` holds the
 *   `Start N:` and `Estimate N:` lines (`managerNotes`).
 * @param {{step: number, state: string, doneAt?: number|null}} x  one of its `steps`.
 * @param {{cls: string, words: string}} chip  `stepChip`'s answer for the same step.
 * @returns {string[]} the words of each chip, in the order they are drawn, [] for none.
 *   A done step (`chip.cls` done) shows `took M min`: from its Start line to the end of the
 *   agent whose hand-back opened DONE (`doneAt`, as `stepEnds` read it), the Start line's
 *   date taken from that end's date in California (`californiaInstant`) and both cut to the
 *   minute, and nothing when it has no Start line, when no agent's DONE ended it (it was
 *   counted done by decision), or when the result is negative. A running step shows
 *   `started HH:MM` and, with an estimate, `estimate ends HH:MM`, the Start line plus the
 *   estimate as a clock time in California; with an estimate and no Start line it shows
 *   `estimate M min`. A step not sent, held or under review, shows `estimate M min`. Every
 *   other step, an open one included, and any step with no line to read, shows none: its Start
 *   line belongs to a send that has ended. The invariant `statusPage` relies on: every figure
 *   here is the manager's own line or the difference of two clock times, never a reading of the
 *   clock now, and the words say `estimate` wherever the figure is the plan's and not a measurement.
 */
export function stepTimeChips(st, x, chip) {
  const m = st.manager ?? managerNotes(null);
  const start = m.starts?.get(x.step);
  const estimate = m.estimates?.get(x.step);
  const clock = (min) => `${String(Math.floor((min % 1440) / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  const out = [];
  if (chip.cls === 'done') {
    if (start !== undefined && Number.isFinite(x.doneAt)) {
      const took = Math.floor(x.doneAt / 60000) - californiaInstant(new Date(x.doneAt), start) / 60000;
      if (took >= 0) out.push(`took ${took} min`);
    }
    return out;
  }
  if (x.state === 'running') {
    if (start !== undefined) out.push(`started ${clock(start)}`);
    if (start !== undefined && estimate !== undefined) out.push(`estimate ends ${clock(start + estimate)}`);
    else if (estimate !== undefined) out.push(`estimate ${estimate} min`);
    return out;
  }
  if (x.state === 'not sent' && estimate !== undefined) out.push(`estimate ${estimate} min`);
  return out;
}

/**
 * The one line under the status page's Reviews heading.
 * @param {ReturnType<typeof pointerState>} st  `pointerState`'s answer.
 * @returns {string} the first words of the newest verdict among the review steps'
 *   hand-backs (`st.reviewers`): `ON-AIM ROUTE-CLEAR step 117 next 119` when the first line
 *   parses as a verdict (`parseVerdict`), else the first twelve words of that line;
 *   `none has handed back` when no review step has a hand-back; with `; a review is
 *   running` after it while one runs. It never carries more than the first line of a
 *   hand-back, so the page cannot carry a reviewer's report.
 */
export function reviewWords(st) {
  const mine = (st.steps ?? []).filter((x) => (st.reviewers ?? []).includes(x.step));
  const backs = mine.map((x) => x.back).filter(Boolean).sort((a, b) => b.at - a.at);
  const first = String(backs[0]?.lines?.[0] ?? '');
  const v = parseVerdict(first);
  const said = !backs.length ? 'none has handed back'
    : v ? `${v.aim} ${v.route}${v.step === null ? '' : ` step ${v.step}`}${v.next === null ? '' : ` next ${v.next}`}`
      : first.split(/\s+/).filter(Boolean).slice(0, 12).join(' ') || '(no text)';
  return mine.some((x) => x.state === 'running') ? `${said}; a review is running` : said;
}

/**
 * The status page, as plain HTML from the same state the print comes from, in the shape
 * the owner reads: a heading, an updated line, Versions, one section for each step in Order
 * and each Standing step, Open for you, and Found and not fixed.
 * @param {ReturnType<typeof pointerState>} st  `pointerState`'s answer.
 * @param {string} given  the status the session wrote, as stamped.
 * @param {Date} [now]  the time of the status; now when omitted.
 * @returns {string} a complete HTML document with a title, colour tokens for both
 *   themes (six-digit values, a dark pair for each), no table and a layout that reads at
 *   phone width. In order: the heading; the updated line, the plan's title and the last
 *   status's time in California time with the status; under it, where the session was
 *   compacted (`st.compacted`, read from the marker), one line saying so and at what time
 *   in California time (`compactedWords`), which stays until a later compaction; the `next: step N` line and the
 *   manager's unnumbered `Next:` line, which the reviewer's file names as the line it reads;
 *   the Versions section, one bullet for each `Version:` line of the manager's notes; then
 *   one section for each step in Order and for each Standing step that is not a review (for
 *   a plan with no Order line, one for every step of its Steps section, in the order of the
 *   steps): its heading the step's number and its title from the plan, its chip (`stepChip`)
 *   in colour and in words, then its time chips (`stepTimeChips`, in the same colour, drawn only
 *   for a step with a `Start N:` or `Estimate N:` line to read; when any is drawn the updated line
 *   ends with the sentence that estimates are the plan's and not measurements, and otherwise it
 *   is as it was), and bullets, each on a line of its own: what it is (the `What N:` line,
 *   else the title up to its first comma), where it stands (the first line of its newest
 *   hand-back; `ended by <how>, with no hand-back` when its newest end was a refusal or an
 *   interruption, whose last text is a tool result and not a hand-back; `running, no
 *   hand-back yet`; or `not sent`), a `Counted done:` bullet where the notes carry a `Done N:`
 *   text, and the `Why N:` and `Next N:` lines where there are some; one Reviews section with
 *   one line (`reviewWords`) and no chip where the plan has a review step; Open for you, from
 *   the `Open:` lines, or from what the plan itself leaves open (`openForOwner`) where none
 *   is written; and Found and not fixed, of the Found lines of this plan's own steps (a
 *   session's older reports hold the findings of earlier plans, which the notes queue
 *   carries) every one the manager sorted as queued and, before them, those sorted as
 *   stopping the plan, which is not fixed either, each tagged in words, in the report's
 *   own words, then one line counting the Found lines with no sort yet (counted and not
 *   listed, since the status print lists them). No Decision, Explanation or fixed Found line is
 *   drawn: those stay in the manager's notes.
 *   Every string from a report file, a hand-back or the notes is escaped.
 */
export function statusPage(st, given, now = new Date()) {
  const li = (s) => `<li>${s}</li>`;
  const next = !st.read ? `not read (${st.why})` : !st.pointer ? `not defined (${st.why})` : st.pointer.next === null ? 'none' : `step ${st.pointer.next}`;
  const m = st.manager ?? managerNotes(null);
  // Only the Found lines of this plan's own steps: a session's older reports hold the findings of earlier plans, which the notes queue already carries.
  const inPlan = new Set(st.steps.map((x) => x.step));
  const groups = sortFound(st.found.filter((f) => !inPlan.size || inPlan.has(f.step)), m);
  const reviewers = st.reviewers ?? [];
  let timed = 0;
  const stepSection = (x) => {
    const chip = stepChip(st, x);
    const times = stepTimeChips(st, x, chip);
    timed += times.length;
    const timeHtml = times.map((t) => `<span class="chip ${chip.cls}">${escapeHtml(t)}</span>`).join('');
    const name = st.titles.get(x.step) ?? '';
    const what = m.what.get(x.step) ?? name.split(',')[0].trim();
    const stands = !x.back ? (x.state === 'running' ? 'running, no hand-back yet' : 'not sent')
      : x.back.how !== 'a report' ? `ended by ${x.back.how}, with no hand-back` : (x.back.lines[0] ?? 'a hand-back with no text');
    const bullets = [li(`What it is: ${escapeHtml(what || 'not described')}`), li(`Where it stands: ${escapeHtml(stands)}`),
      ...(m.done.get(x.step) ? [li(`Counted done: ${escapeHtml(m.done.get(x.step))}`)] : []),
      ...(m.why.has(x.step) ? [li(`Why: ${escapeHtml(m.why.get(x.step))}`)] : []),
      ...(m.nexts.has(x.step) ? [li(`Next: ${escapeHtml(m.nexts.get(x.step))}`)] : [])];
    return `<section>\n<h2>${x.step}. ${escapeHtml(name || `Step ${x.step}`)} <span class="chip ${chip.cls}">${escapeHtml(chip.words)}</span>${timeHtml}</h2>\n<ul>\n${bullets.join('\n')}\n</ul>\n</section>`;
  };
  const steps = st.steps.filter((x) => !reviewers.includes(x.step));
  const stepsHtml = steps.map(stepSection).join('\n') || `<section>\n<h2>Steps</h2>\n<ul>\n${li('none')}\n</ul>\n</section>`;
  const estimateNote = timed ? `${/[.!?]\s*$/.test(given) ? '' : '.'} Estimates are the plan's and not measurements.` : '';
  const reviewsHtml = reviewers.length ? `<section>\n<h2>Reviews</h2>\n<p>${escapeHtml(reviewWords(st))}</p>\n</section>\n` : '';
  const foundItem = ([tag, f]) => li(`<span class="tag">${tag}</span> Step ${f.step} #${f.n}: ${escapeHtml(f.line.replace(/^Found:\s*/, ''))}`);
  const notFixed = [...groups.stopping.map((f) => ['stopping the plan', f]), ...groups.queued.map((f) => ['queued', f])];
  const un = groups.unsorted.length;
  const unsortedLine = un ? [li(`${un} Found line${un === 1 ? ' is' : 's are'} not sorted yet by the manager; the status print lists ${un === 1 ? 'it' : 'each'}.`)] : [];
  const open = m.open.length ? m.open : openForOwner(st);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Plan run status</title>
<style>
/* One reading column; each step a block with a state chip in colour and in words, then its bullets. */
:root {
  --bg: #f6f7f5; --fg: #1d2420; --muted: #56615b; --line: #d5dbd6; --chip-bg: #e8ece9;
  --done: #1f6b3a; --wait: #8a5a00; --held: #6b3fa0; --open: #9b2c2c;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #141917; --fg: #e3e8e4; --muted: #a3ada6; --line: #2e3833; --chip-bg: #222a26;
  --done: #6fcf8f; --wait: #e8b24a; --held: #c4a3f0; --open: #f08a8a; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #141917; --fg: #e3e8e4; --muted: #a3ada6; --line: #2e3833; --chip-bg: #222a26;
  --done: #6fcf8f; --wait: #e8b24a; --held: #c4a3f0; --open: #f08a8a; color-scheme: dark; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; overflow-wrap: anywhere; }
main { max-width: 44rem; margin: 0 auto; padding: 24px 16px 48px; }
h1 { font-size: 1.6rem; margin: 0 0 4px; text-wrap: balance; }
.asof { color: var(--muted); font-size: .9rem; margin: 0 0 8px; }
.next { margin: 0 0 24px; }
section { border-top: 1px solid var(--line); padding-block: 16px; }
h2 { font-size: 1.1rem; margin: 0 0 8px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.chip { font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; background: var(--chip-bg); font-weight: 600; }
.tag { font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; font-weight: 600; color: var(--muted); }
.done { color: var(--done); } .wait { color: var(--wait); } .held { color: var(--held); } .open { color: var(--open); }
ul { margin: 0; padding-left: 1.2rem; display: grid; gap: 6px; }
p { margin: 0 0 8px; }
</style>
</head>
<body>
<main>
<h1>Plan run status</h1>
<p class="asof">${escapeHtml(st.title)}${st.title ? ' · ' : ''}updated ${escapeHtml(californiaStamp(now))}: ${escapeHtml(given)}${escapeHtml(estimateNote)}</p>
${st.compacted ? `<p class="asof">${escapeHtml(compactedWords(st.compacted))}</p>\n` : ''}<p class="next"><strong>next: ${escapeHtml(next)}</strong>${m.next ? `<br>The next move: ${escapeHtml(m.next)}` : ''}</p>
<section>
<h2>Versions</h2>
<ul>
${m.versions.map((v) => li(escapeHtml(v))).join('\n') || li('none written')}
</ul>
</section>
${stepsHtml}
${reviewsHtml}<section>
<h2>Open for you</h2>
<ul>
${open.map((o) => li(escapeHtml(o))).join('\n')}
</ul>
</section>
<section>
<h2>Found and not fixed</h2>
<ul>
${[...notFixed.map(foundItem), ...unsortedLine].join('\n') || li('none')}
</ul>
</section>
</main>
</body>
</html>
`;
}

/**
 * Write the status page without giving a status.
 * @param {string} sid  the session id.
 * @param {{at: number, status: string}} [clock]  the last status as the clock holds it; read when omitted.
 * @returns {string|null} the page's path after it was rewritten from `pointerState`,
 *   the same read a status makes, with the LAST status's text and time in its header;
 *   null when the session has no scratchpad. THE INVARIANT its caller relies on
 *   (hook-dispatch.mjs, at an agent's hand-back): it writes the page and only the
 *   page. It does not stamp the clock, print a status, or touch the status memory
 *   (`writeSeen`), so the status gate and the page gate cannot tell that it ran.
 */
export function writeStatusPage(sid, clock = readClock()) {
  const pad = sid ? scratchpadOf(sid) : null;
  if (!pad) return null;
  const state = pointerState(sid);
  mkdirSync(join(pad, 'status'), { recursive: true });
  const file = join(pad, 'status', 'fix-run.html');
  writeFileSync(file, statusPage(state, clock.status || 'no status has been given yet', clock.at ? new Date(clock.at) : new Date()));
  return file;
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
  const a = agentFiles(f.agents).find((x) => x.id === id) ?? { id, folder: f.agents, file: join(f.agents, `agent-${id}.jsonl`) };
  return agentEnd(tailEntries(a.file, 4 * 1024 * 1024), agentMeta(a),
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
  if (process.argv[2] === '--page') {
    // THE STATUS PAGE AT A HAND-BACK (hook-dispatch.mjs runs this when the
    // notification of an agent's end arrives as a prompt): the page is rewritten
    // from the same read a status makes, and NOTHING ELSE happens. The clock is
    // not stamped, no status is printed and no memory is written, so the status
    // gate and the page gate are exactly what they were. The session is read from
    // the payload on stdin (the hook's own), else from the shell's variable.
    let hook = {};
    try { hook = JSON.parse(readFileSync(0, 'utf8')); } catch { /* no payload: the variable below */ }
    const who = String(hook.session_id || process.env.CLAUDE_CODE_SESSION_ID || '');
    let wrote = null;
    try { wrote = writeStatusPage(who); } catch (e) { console.log(`status page: not written (${e?.message ?? e})`); process.exit(0); }
    console.log(wrote ? `status page written: ${wrote}` : 'status page: not written (no scratchpad found for the session)');
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
  // WHAT THE STATUSES OF THIS SESSION HAVE PRINTED is read first (`readSeen`):
  // a status shows what changed and nothing twice (Doctrine §0e rule 2). With no
  // session id there is no memory, and everything prints.
  const sid = String(process.env.CLAUDE_CODE_SESSION_ID ?? '');
  const seen = readSeen(sid);
  const mark = { backs: {}, found: {}, refusals: {}, approval: '', agents: new Map() };
  // THE GOALS COME FIRST, ONCE PER SESSION (the standing goals in the hub CLAUDE.md):
  // the stamp is already written, so reading them can never cost the status. A
  // section that cannot be read is said so, never printed as an empty one. Every
  // owner message prints them again (hook-dispatch.mjs), so a later status leaves them out.
  if (!seen?.goals) {
    let goals = '';
    try { goals = goalsSection(); } catch { goals = ''; }
    console.log(goals || `${GOALS_HEADING}: not read (no such section in the CLAUDE.md beside report.mjs).`);
    console.log('');
  }
  // THE COMPACTION IS SAID IN THE FIRST STATUS AFTER IT (LESSONS §416), read from the marker the
  // dispatcher wrote at the start the compaction made: when it was, in California time. Once
  // only: the flag is set as the line prints, and the status page carries the line until the
  // next compaction. A marker that cannot be read costs the line, never the status.
  try {
    const compacted = sid ? readCompacted(sid) : null;
    if (compacted && !compacted.printed) {
      console.log(`${compactedWords(compacted)} This session's context was replaced by a summary at that time.`);
      console.log('');
      setCompacted(sid, { printed: true });
    }
  } catch { /* the status stands without the line */ }
  // THE POINTER COMES NEXT, after the goals: `next: step N`, read from the plan's
  // Order and the agents' hand-backs, then each new hand-back and the Found lines
  // new or unsorted. The status page's source is written from the same read.
  // After the stamp, so a failure reading any of it never costs the status.
  let state = null;
  try { state = pointerState(sid); } catch (e) { state = { read: false, why: `the read failed (${e?.message ?? e})`, pointer: null, steps: [], found: [], title: '', titles: new Map(), leaves: [] }; }
  console.log(pointerBlock(state, seen, mark));
  // THE REVIEW, right under the pointer and never inside pointerBlock, whose
  // first line has to stay `next: step N`. The same `reviewState` the dispatcher's
  // review gate refuses on. A failure reading it is printed, never skipped.
  let review = '';
  try { review = reviewBlock(reviewState({ session_id: sid }, planInForce())); } catch (e) { review = `Review: not read (${e?.message ?? e}).`; }
  console.log(review);
  // THE JUDGEMENT, under the review: whether the newest hand-back has its written line,
  // the same `judgedState` the dispatcher's judgement gate refuses on.
  let judged = '';
  try { judged = judgedBlock(judgedState({ session_id: sid }, planInForce())); } catch (e) { judged = `Judgement: not read (${e?.message ?? e}).`; }
  console.log(judged);
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
  // The main thread's own reads since the last status, as a count and their paths,
  // and the refused reads of the record that no Read has since returned: the
  // dispatch gate sends no step while one is named (`readsGate`).
  let readsLine = '';
  try { readsLine = readsBlock(sid, previous); } catch (e) { readsLine = `Main thread reads since the last status: not read (${e?.message ?? e}).`; }
  console.log(readsLine);
  let ended;
  try { ended = sid ? agentEnds(sid, previous) : null; } catch { ended = null; }
  let block = '';
  try { block = agentsBlock(sid, previous, ended, mark.agents); } catch (e) { block = `Agents ended since the last status: not read (${e?.message ?? e}).`; }
  console.log(block);
  let progress = '';
  try { progress = progressBlock(sid); } catch (e) { progress = `Running agents' progress: not read (${e?.message ?? e}).`; }
  console.log(progress);
  // Every refusal each agent received and its last tool result, from its own
  // transcript: the manager judges an agent's work from these, not its report.
  let reads = '';
  try { reads = gateReadsBlock(sid, ended ?? [], seen, mark); } catch (e) { reads = `Agents' hook refusals and last tool results: not read (${e?.message ?? e}).`; }
  console.log(reads);
  // The approval state, read from disk: before sending the first agent under
  // any approval the manager gives a status and reads this. Printed in full when
  // it is not what the last status printed, else as one line.
  let approval = '';
  try {
    approval = approvalBlock();
    mark.approval = sha256(approval);
    if (seen && seen.approval === mark.approval) {
      approval = `Approval state, read from disk now: unchanged since the last status (${/- Match: yes/.test(approval) ? 'the plan file is the plan that was approved, so the plan is in force' : 'no plan is in force; the status that printed it said why'}).`;
    }
  } catch (e) { approval = `Approval state: not read (${e?.message ?? e}).`; }
  console.log(approval);
  // What this status printed is remembered, so the next one leaves it out.
  writeSeen(sid, seen, mark);
}
