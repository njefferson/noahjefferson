#!/usr/bin/env node
/**
 * A MESSAGE THE OWNER HAS SENT IS ANSWERED BEFORE ANY MORE WORK (LESSONS §376).
 *
 * The transcript records each owner message the moment it is sent, as
 * `{"type":"queue-operation","operation":"enqueue","content":…}`. It reaches
 * the session later: as the next turn's prompt, or as a `queued_command`
 * attachment between tool calls, and the queue logs a `dequeue` (no content)
 * or a `remove` (with content) when it lets go of it. Until then the session
 * cannot see it, and a long run of tool calls is exactly when that wait is
 * longest. Messages sat unanswered through whole runs of work.
 *
 * So, run by hook-dispatch.mjs on every PreToolUse, for every agent:
 *
 *   main thread  any owner message enqueued and not yet delivered refuses the
 *                call, and the refusal prints the message VERBATIM, so the
 *                session can answer it and end its turn, which delivers it
 *   subagent     refused only while a pending message starts with STOP
 *
 *   node pending-guard.mjs --start   (SessionStart, from hook-dispatch) records
 *                when this process began: a queue entry written by an earlier
 *                process is not in this process's queue and is never waited on
 *
 * WHAT COUNTS AS DELIVERED. The dequeue record names nothing, and the queue
 * takes by priority rather than in order, so it cannot say WHICH message left.
 * Two signals are combined. A message is matched to its delivery by its text
 * (a turn's prompt or a queued_command attachment carrying it) or to a
 * `remove` carrying it. And the queue's size is kept from the counts: when
 * every enqueue has been dequeued or removed, nothing is pending, whatever
 * the text matching found — a slash command is delivered as something other
 * than its own words, and a guard that waited on it would refuse forever.
 * When the count says k are still queued, the pending ones are the latest k of
 * those whose text never arrived.
 *
 * A MESSAGE IS GIVEN ONCE A MESSAGE TYPED AFTER IT HAS ARRIVED AS A PROMPT. A
 * queue that takes a later message while an earlier one never comes out leaves
 * the earlier one counted as queued for the rest of the session. Measured
 * 2026-10-04: a message timed 08:32 (California) held every call through three
 * turns that ended to deliver it, while messages typed after it had arrived as
 * prompts; the hold cleared only when the owner sent the same words again. So a
 * message the counts call pending is no longer held when an owner message typed
 * AFTER it (its enqueue time, or, for one that was never enqueued, the time it
 * arrived) has been delivered, as a prompt or between tool calls. The queue
 * does take by priority, so this can release a message that is merely behind
 * another; the safety net is the next paragraph, which puts it in front of the
 * session instead of dropping it.
 *
 *   node pending-guard.mjs --skipped   (UserPromptSubmit, from hook-dispatch)
 *                prints, once each, the owner messages a delivered prompt has
 *                overtaken, word for word, at the top of that prompt's turn, so
 *                they are answered there
 *
 * What is not an owner message: an enqueue whose content is not a string, or
 * that opens with one of the harness's own tags (a task notification, a wake,
 * a webhook payload, a child session's event, an agent's hand-back). Only a
 * message the owner typed holds work: an agent's hand-back never does.
 *
 * Failure direction: a transcript that cannot be read finds nothing pending,
 * and the call goes on. This guard holds work for a message; it must never
 * hold it for a message that does not exist.
 *
 * HELD WORK IS PICKED UP AGAIN, NEVER DROPPED. Every call this refuses is
 * written to a held-work file for the session. When the message from the owner
 * is delivered as a turn's prompt, hook-dispatch.mjs runs
 *
 *   node pending-guard.mjs --held    (UserPromptSubmit) prints the held calls
 *                at the top of that turn, and clears the file
 *
 * so the session sends them again in that turn unless the message says to stop.
 * hook-dispatch does not latch on this guard's refusal, or the held call would
 * be refused again when it is sent: the message that caused the refusal was
 * typed before the latch, so its delivery would clear nothing.
 * Measured 18:34 (California) on 2026-10-02: eleven plan edits were refused when an owner
 * message arrived, and the next turn did not send them again. Held work is
 * printed, not run: sending it again is still the session's act.
 */
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { tailEntries, textOf, isOwnerMessage } from './transcript-tail.mjs';

const SELF = fileURLToPath(import.meta.url);
// An agent's hand-back is enqueued as `<agent-message from="…">` with the
// words "[Subagent hand-back]" inside it: model output, never a message the
// owner typed. Measured 2026-10-04 06:15 (California): a status call was held
// for two of them, printed as the owner's messages. The queue record carries
// no origin, so what opens a message is all there is to tell them apart by.
export const HARNESS_TAG = /^\s*<(?:task-notification|agent-message\b|wake\b|webhook-payload|child-session-event|event\b|teammate-message|scheduled|system-reminder|local-command|bash-(?:input|stdout|stderr)|cron|tick\b|command-(?:name|message))|^\s*\[Subagent hand-back\]/i;
const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const now = () => Number(process.env.PENDING_GUARD_NOW || Date.now());

/**
 * Where this process's start time is kept.
 * @param {object} p  a hook payload; its `session_id` names the file.
 * @returns {string} an absolute path under ~/.claude/pending-guard/
 *   (PENDING_GUARD_DIR overrides it, for the test).
 */
function startFile(p) {
  const dir = process.env.PENDING_GUARD_DIR || join(homedir(), '.claude', 'pending-guard');
  return join(dir, `${String(p.session_id || 'no-session').replace(/[^A-Za-z0-9_-]/g, '_')}.json`);
}

/**
 * When this process began, as recorded at SessionStart.
 * @param {object} p  a hook payload.
 * @returns {number} ms since the epoch, or 0 when nothing was recorded, in
 *   which case every queue entry in the tail is counted.
 */
export function startedAt(p) {
  try { return Number(JSON.parse(readFileSync(startFile(p), 'utf8')).start) || 0; } catch { return 0; }
}

/**
 * Record that a process began (SessionStart other than a compaction).
 * @param {object} p  the SessionStart payload.
 * @returns {string} the file written. A compaction does not restart the
 *   process or empty its queue, so the caller does not call this for one.
 */
export function markStart(p) {
  const f = startFile(p);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify({ start: now() }) + '\n');
  return f;
}

/**
 * Read the queue's records and the deliveries that answer them.
 * @param {object[]} entries  transcript entries in file order (`tailEntries`).
 * @param {number} [since]    ignore queue entries written before this time (ms).
 * @param {string} [prompt]   a prompt being delivered this moment, which the
 *   transcript may not hold yet: it counts as one more delivery at the end,
 *   unless an entry already in the transcript carries its words.
 * @returns {{waiting: {text: string|null, key: string, at: number, owner: boolean}[], given: number[]}}
 *   `waiting`: the messages the counts say are still queued, oldest first, the
 *   harness's own enqueues included (an empty list when every enqueue has been
 *   dequeued or removed, whatever the text matching found). `given`: the typed
 *   time, in ms, of every owner message that has ARRIVED, whether as a prompt
 *   or between tool calls: an enqueued one by its enqueue time, one nothing
 *   enqueued by the time it arrived. A harness message, a hook's feedback and a
 *   compaction summary are never in it. `pendingMessages` and `skippedMessages`
 *   both read their answer out of these two lists, so they cannot disagree.
 */
function scan(entries, since = 0, prompt = '') {
  const items = [];
  const given = [];
  let size = 0;
  const take = (pred) => { const it = items.find((x) => !x.done && pred(x)); if (it) it.done = true; return it; };
  // A delivery carries the message's words. Several queued messages can arrive
  // joined in one prompt, so each is matched by containment.
  const deliver = (t, arrivedAt, byOwner) => {
    let hit = false;
    for (const x of items) {
      if (!x.done && x.key && (t.includes(x.key) || (x.key.includes(t) && t.length > 40))) {
        x.done = true; x.arrived = true; hit = true;
        if (x.owner && x.at) given.push(x.at);
      }
    }
    if (!hit && byOwner && Number.isFinite(arrivedAt) && arrivedAt > 0) given.push(arrivedAt);
  };
  for (const e of entries) {
    const at = Date.parse(e?.timestamp ?? '');
    if (e?.type === 'queue-operation') {
      if (since && Number.isFinite(at) && at < since) continue;
      const c = typeof e.content === 'string' ? e.content : null;
      if (e.operation === 'enqueue') {
        items.push({ text: c, key: norm(c), at: Number.isFinite(at) ? at : 0, owner: !!(c && c.trim() && !HARNESS_TAG.test(c)), done: false });
        size++;
      } else if (e.operation === 'dequeue') {
        size = Math.max(0, size - 1);
      } else if (e.operation === 'remove') {
        size = Math.max(0, size - 1);
        if (c) take((x) => x.key === norm(c));
      } else if (/^(popAll|clear)$/.test(String(e.operation ?? ''))) {
        size = 0;
      }
      continue;
    }
    // A delivery is a turn's prompt, or a queued command attached between tool calls.
    const delivered = (e?.type === 'user' && !e.isMeta && !e.isCompactSummary)
      || (e?.type === 'attachment' && e.attachment?.type === 'queued_command');
    if (!delivered) continue;
    const t = norm(textOf(e));
    if (!t) continue;
    deliver(t, at, isOwnerMessage(e) && !HARNESS_TAG.test(textOf(e)));
  }
  const p = norm(prompt);
  if (p && !HARNESS_TAG.test(prompt) && !items.some((x) => x.arrived && x.key && p.includes(x.key))) deliver(p, now(), true);
  if (size <= 0) return { waiting: [], given };
  return { waiting: items.filter((x) => !x.done && x.key).slice(-size), given };
}

/**
 * The owner messages waiting in the queue.
 * @param {object[]} entries  transcript entries in file order (`tailEntries`).
 * @param {number} [since]    ignore queue entries written before this time (ms).
 * @returns {{text: string, at: number}[]} each pending owner message, oldest
 *   first, its text exactly as enqueued. Empty when the counts say the queue is
 *   empty, whatever the text matching found, and a message is left out once an
 *   owner message typed AFTER it has arrived (`scan`'s `given`): the queue can
 *   lose a message and keep counting it, and a guard holding work for it would
 *   hold it for the rest of the session. `decide` and the test rely on these
 *   being the only two ways a message stops being held as pending.
 */
export function pendingMessages(entries, since = 0) {
  const { waiting, given } = scan(entries, since);
  return waiting.filter((x) => x.owner && !given.some((g) => g > x.at)).map((x) => ({ text: x.text, at: x.at }));
}

/**
 * The owner messages a delivered prompt has overtaken.
 * @param {object[]} entries  transcript entries in file order (`tailEntries`).
 * @param {number} [since]    ignore queue entries written before this time (ms).
 * @param {string} [prompt]   the prompt being delivered now (UserPromptSubmit).
 * @returns {{text: string, at: number}[]} each owner message the counts call
 *   still queued that an owner message typed after it has now reached the session
 *   over, oldest first, its text exactly as enqueued: the messages
 *   `pendingMessages` no longer holds work for, and which nothing else will put
 *   in front of the session. A prompt that carries a waiting message's own words
 *   is that message arriving, never one overtaking it.
 */
export function skippedMessages(entries, since = 0, prompt = '') {
  const { waiting, given } = scan(entries, since, prompt);
  return waiting.filter((x) => x.owner && given.some((g) => g > x.at)).map((x) => ({ text: x.text, at: x.at }));
}

/**
 * Decide on one tool call (PreToolUse).
 * @param {object} p  the hook payload: `transcript_path` is the main session's
 *   transcript for every agent, `agent_id` is set for a subagent.
 * @param {object[]} [entries]  the transcript's entries, for the test; read
 *   from `p.transcript_path` (the last 16 MB) when absent.
 * @returns {string|null} the refusal, carrying every pending message verbatim,
 *   or null to allow. hook-dispatch turns a refusal into exit 2 on stderr.
 */
export function decide(p, entries) {
  const list = entries ?? (p.transcript_path ? tailEntries(p.transcript_path, 16 * 1024 * 1024) : []);
  const pending = pendingMessages(list, startedAt(p));
  if (!pending.length) return null;
  const stop = pending.some((m) => /^\W*stop\b/i.test(m.text));
  if (p.agent_id && !stop) return null;
  const quoted = pending.map((m, i) => `--- message ${i + 1} of ${pending.length}, sent ${new Date(m.at).toISOString()} ---\n${m.text}`).join('\n');
  if (p.agent_id) {
    return `pending-guard (LESSONS §376): the owner has sent STOP and it has not reached the session yet. This subagent stops: run nothing more, and return what you have now, saying it was stopped.\n${quoted}\n--- end ---`;
  }
  return `pending-guard (LESSONS §376): the owner has sent a message this session has not been given yet. Nothing runs until it is answered. Answer it now, in plain text, point by point, and end this turn; ending the turn is what delivers it. This call is held, not dropped: it is printed at the top of the turn that delivers the message, to be sent again then.\n${quoted}\n--- end ---`;
}

// ---- held work ----
const HELD_CHARS = 4000;

/**
 * Where the calls this guard refused are held.
 * @param {object} p  a hook payload; its `session_id` names the file.
 * @returns {string} an absolute path under ~/.claude/held-work/ (HELD_WORK_DIR
 *   overrides it, for the test). `holdCall` appends to it and `releaseHeld`
 *   reads and removes it; nothing else touches it.
 */
function heldFile(p) {
  const dir = process.env.HELD_WORK_DIR || join(homedir(), '.claude', 'held-work');
  return join(dir, `${String(p.session_id || 'no-session').replace(/[^A-Za-z0-9_-]/g, '_')}.jsonl`);
}

/**
 * Hold a call this guard refused.
 * @param {object} p  the refused PreToolUse payload.
 * @returns {boolean} true when the call was written; false when the same call
 *   (the same agent, tool and input) is already held, so a call refused on
 *   every retry is still printed once. Each line holds the time, the agent
 *   (null for the main thread), the tool and its whole input, which
 *   `releaseHeld` prints back.
 */
export function holdCall(p) {
  const f = heldFile(p);
  const call = { agent: p.agent_id ?? null, tool: String(p.tool_name ?? ''), input: p.tool_input ?? {} };
  const key = createHash('sha256').update(JSON.stringify(call)).digest('hex');
  let held = '';
  try { held = readFileSync(f, 'utf8'); } catch { held = ''; }
  if (held.split('\n').some((line) => { try { return JSON.parse(line).key === key; } catch { return false; } })) return false;
  mkdirSync(dirname(f), { recursive: true });
  appendFileSync(f, JSON.stringify({ at: now(), key, ...call }) + '\n');
  return true;
}

/**
 * The held calls, printed once, when the message from the owner is delivered.
 * @param {object} p  the UserPromptSubmit payload: `prompt` is what arrived.
 * @returns {string} the block hook-dispatch.mjs prints FIRST in that turn —
 *   every held call in the order it was refused, with its tool and its input
 *   (cut at HELD_CHARS characters, saying so) — and the file is removed, so
 *   each call is printed in one turn only. '' when nothing is held, or when the
 *   prompt is not an owner message (empty, or opening with one of the
 *   harness's own tags, as a task notification does): the work waits for the
 *   message it was held for.
 */
export function releaseHeld(p) {
  const prompt = typeof p.prompt === 'string' ? p.prompt : '';
  if (!prompt.trim() || HARNESS_TAG.test(prompt)) return '';
  const f = heldFile(p);
  let rows = [];
  try { rows = readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return ''; }
  rmSync(f, { force: true });
  if (!rows.length) return '';
  const when = (t) => new Date(Number(t) || 0).toLocaleTimeString('en-GB', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  return [`HELD WORK (pending-guard, LESSONS §376): ${rows.length} call${rows.length === 1 ? ' was' : 's were'} refused while a message from the owner waited. `
    + 'It is held here, not dropped. Send each again in this turn, in this order, unless the message says to stop.',
  ...rows.map((r, i) => {
    let input = JSON.stringify(r.input ?? {});
    if (input.length > HELD_CHARS) input = `${input.slice(0, HELD_CHARS)} … (${input.length} characters; cut here)`;
    return `--- held ${i + 1} of ${rows.length}, refused at ${when(r.at)} (California), ${r.agent ? `subagent ${r.agent}` : 'main thread'} ---\n${r.tool} ${input}`;
  }), '--- end of held work ---'].join('\n');
}

// ---- messages the harness never delivered ----

/**
 * Where the overtaken messages already printed are recorded.
 * @param {object} p  a hook payload; its `session_id` names the file.
 * @returns {string} an absolute path under ~/.claude/skipped-printed/
 *   (SKIPPED_PRINTED_DIR overrides it, for the test). `releaseSkipped` reads and
 *   rewrites it; nothing else touches it.
 */
function skippedFile(p) {
  const dir = process.env.SKIPPED_PRINTED_DIR || join(homedir(), '.claude', 'skipped-printed');
  return join(dir, `${String(p.session_id || 'no-session').replace(/[^A-Za-z0-9_-]/g, '_')}.json`);
}

/**
 * The messages the harness never delivered, printed once, when a later one arrives.
 * @param {object} p  the UserPromptSubmit payload: `prompt` is what arrived and
 *   `transcript_path` is read for the queue (the last 16 MB), unless `entries`
 *   is given, for the test.
 * @param {object[]} [entries]  the transcript's entries, for the test.
 * @returns {string} the block hook-dispatch.mjs prints FIRST in that turn: every
 *   owner message the prompt has overtaken (`skippedMessages`) that an earlier
 *   turn has not already printed, word for word, each with the time it was
 *   sent in California time, and the instruction to answer every point in it
 *   before anything else. Each message is recorded as printed, so it appears in
 *   one turn only. '' when nothing was overtaken or everything was printed
 *   already. Any prompt prints them, a task notification's included: the message
 *   was overtaken when a later one arrived, and the first prompt after that is
 *   the first turn that can show it. Only an owner's prompt counts as the
 *   message doing the overtaking (`scan`), never a harness message.
 */
export function releaseSkipped(p, entries) {
  const prompt = typeof p.prompt === 'string' ? p.prompt : '';
  const list = entries ?? (p.transcript_path ? tailEntries(p.transcript_path, 16 * 1024 * 1024) : []);
  const skipped = skippedMessages(list, startedAt(p), prompt);
  if (!skipped.length) return '';
  const f = skippedFile(p);
  let seen = [];
  try { const r = JSON.parse(readFileSync(f, 'utf8')); seen = Array.isArray(r?.keys) ? r.keys : []; } catch { seen = []; }
  const keyOf = (m) => createHash('sha256').update(`${m.at}:${norm(m.text)}`).digest('hex');
  const fresh = skipped.filter((m) => !seen.includes(keyOf(m)));
  if (!fresh.length) return '';
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify({ keys: [...seen, ...fresh.map(keyOf)] }));
  const when = (t) => new Date(Number(t) || 0).toLocaleTimeString('en-GB', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const many = fresh.length > 1;
  return [`MESSAGE${many ? 'S' : ''} THE SESSION WAS NEVER GIVEN (pending-guard, LESSONS §376): ${many ? `${fresh.length} messages` : 'a message'} from the owner never reached this session as a prompt, `
    + `and a message typed after ${many ? 'them' : 'it'} has, so the harness is not going to deliver ${many ? 'them' : 'it'}. ${many ? 'They are' : 'It is'} printed here, once, word for word, `
    + 'so that each is answered in this turn: answer every point in each of them before anything else, and if one says something was done wrong, answer it and run nothing else this turn.',
  ...fresh.map((m, i) => `--- message ${i + 1} of ${fresh.length}, sent ${when(m.at)} (California) ---\n${m.text}`), '--- end of the messages never given ---'].join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  let raw = '';
  try { raw = readFileSync(0, 'utf8'); } catch { /* no payload */ }
  let p = {};
  try { p = JSON.parse(raw); } catch { process.exit(0); }
  if (process.argv.includes('--start')) {
    if (p.source !== 'compact') markStart(p);
    process.exit(0);
  }
  if (process.argv.includes('--skipped')) {
    let out = '';
    // A queue that cannot be read finds nothing: this must never print a
    // message that does not exist.
    try { out = releaseSkipped(p); } catch { out = ''; }
    if (out) process.stdout.write(out + '\n');
    process.exit(0);
  }
  if (process.argv.includes('--held')) {
    let out = '';
    try { out = releaseHeld(p); } catch (e) { out = `HELD WORK: the held-work file could not be read (${e?.message ?? e}).`; }
    if (out) process.stdout.write(out + '\n');
    process.exit(0);
  }
  let why = null;
  try { why = decide(p); } catch (e) { process.stderr.write(`pending-guard: ${e?.message ?? e}\n`); process.exit(1); }
  if (why) {
    try { holdCall(p); } catch { /* the refusal stands either way */ }
    process.stderr.write(why + '\n');
    process.exit(2);
  }
  process.exit(0);
}
