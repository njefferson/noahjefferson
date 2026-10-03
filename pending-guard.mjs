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
 * What is not an owner message: an enqueue whose content is not a string, or
 * that opens with one of the harness's own tags (a task notification, a wake,
 * a webhook payload, a child session's event).
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
import { tailEntries, textOf } from './transcript-tail.mjs';

const SELF = fileURLToPath(import.meta.url);
const HARNESS_TAG = /^\s*<(?:task-notification|wake\b|webhook-payload|child-session-event|event\b|teammate-message|scheduled|system-reminder|local-command|bash-(?:input|stdout|stderr)|cron|tick\b|command-(?:name|message))/i;
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
 * The owner messages waiting in the queue.
 * @param {object[]} entries  transcript entries in file order (`tailEntries`).
 * @param {number} [since]    ignore queue entries written before this time (ms).
 * @returns {{text: string, at: number}[]} each pending owner message, oldest
 *   first, its text exactly as enqueued. Empty when the counts say the queue is
 *   empty, whatever the text matching found; `decide` and the test rely on
 *   that being the only way a message is held to be pending.
 */
export function pendingMessages(entries, since = 0) {
  const items = [];
  let size = 0;
  const take = (pred) => { const it = items.find((x) => !x.done && pred(x)); if (it) it.done = true; return it; };
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
    // A delivery carries the message's words: a turn's prompt, or a queued
    // command attached between tool calls. Several queued messages can arrive
    // joined in one prompt, so each is matched by containment.
    const delivered = (e?.type === 'user' && !e.isMeta && !e.isCompactSummary)
      || (e?.type === 'attachment' && e.attachment?.type === 'queued_command');
    if (!delivered) continue;
    const t = norm(textOf(e));
    if (!t) continue;
    for (const x of items) if (!x.done && x.key && (t.includes(x.key) || (x.key.includes(t) && t.length > 40))) x.done = true;
  }
  if (size <= 0) return [];
  const unmatched = items.filter((x) => !x.done && x.key);
  return unmatched.slice(-size).filter((x) => x.owner).map((x) => ({ text: x.text, at: x.at }));
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

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  let raw = '';
  try { raw = readFileSync(0, 'utf8'); } catch { /* no payload */ }
  let p = {};
  try { p = JSON.parse(raw); } catch { process.exit(0); }
  if (process.argv.includes('--start')) {
    if (p.source !== 'compact') markStart(p);
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
