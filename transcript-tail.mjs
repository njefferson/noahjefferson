/**
 * READ THE END OF A SESSION TRANSCRIPT, FAST (LESSONS §370).
 *
 * A session transcript passed 512 MB in one day, which no gate can read on
 * every tool call. Every question the family guards ask of it — when did the
 * owner last speak, what did they say, has this session already SEEN a value
 * in a tool result — is answered by its tail. This is that one reader, so the
 * guards cannot disagree about what "the owner's last message" is.
 *
 * What counts as a genuine owner message was measured on that transcript: a
 * `user` entry that is not `isMeta` (the 160 "Stop hook feedback" entries all
 * are), carries no `tool_result`, is not a compaction summary and is not an
 * interruption marker. Where an `origin` is recorded it must be `human`.
 *
 * A message the owner types while the session is working is not a `user`
 * entry at all: it is an `attachment` of type `queued_command`, with
 * `commandMode: 'prompt'` and origin `human`. Subagent hand-backs arrive the
 * same way with origin `peer`, and task notifications with their own origin
 * and mode. Measured 2026-10-01 on one transcript: 19 owner messages arrived
 * mid-turn and every guard reading this file missed them; one opened thirteen
 * hosts, and the reply guard kept waiting for an answer already given.
 */
import { openSync, readSync, closeSync, fstatSync } from 'node:fs';

/**
 * Parse the last `bytes` of a JSONL transcript.
 * @param {string} path   the transcript (`transcript_path` in a hook payload).
 * @param {number} bytes  how much of the end to read; 8 MB by default.
 * @returns {object[]} the parsed entries in file order; the first, partial
 *   line is dropped, and unreadable lines are skipped. Empty on any failure,
 *   so a caller must treat "nothing found" as "not known", never as "absent".
 */
export function tailEntries(path, bytes = 8 * 1024 * 1024) {
  let fd;
  try {
    fd = openSync(path, 'r');
    const size = fstatSync(fd).size;
    const start = Math.max(0, size - bytes);
    const buf = Buffer.alloc(size - start);
    readSync(fd, buf, 0, buf.length, start);
    const lines = buf.toString('utf8').split('\n');
    if (start > 0) lines.shift();
    const out = [];
    for (const l of lines) {
      if (!l.trim()) continue;
      try { out.push(JSON.parse(l)); } catch { /* a partial or foreign line */ }
    }
    return out;
  } catch {
    return [];
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

/**
 * The text of a user entry, whatever shape its content has.
 * @param {object} e  a transcript entry.
 * @returns {string} its plain text, or a queued message's prompt; tool results
 *   contribute nothing. `isOwnerMessage` and the guards' word checks read it.
 */
export function textOf(e) {
  if (e?.type === 'attachment' && e.attachment?.type === 'queued_command') {
    const q = e.attachment.prompt;
    if (typeof q === 'string') return q;
    return Array.isArray(q) ? q.filter((b) => b?.type === 'text').map((b) => b.text ?? '').join('\n') : '';
  }
  const c = e?.message?.content;
  if (typeof c === 'string') return c;
  if (!Array.isArray(c)) return '';
  return c.filter((b) => b?.type === 'text').map((b) => b.text ?? '').join('\n');
}

/**
 * Is this entry a message the owner actually typed?
 * @param {object} e  a transcript entry.
 * @returns {boolean} true only for a genuine owner message, by the rule in
 *   this file's header; the report clock and the Drive guard both depend on
 *   it never counting hook feedback or a compaction summary as the owner.
 */
export function isOwnerMessage(e) {
  if (e?.type === 'attachment') {
    const a = e.attachment;
    if (a?.type !== 'queued_command' || a.commandMode !== 'prompt' || a.isMeta || e.isMeta) return false;
    if ((a.origin?.kind ?? e.origin?.kind) !== 'human') return false;
    return textOf(e).trim().length > 0;
  }
  if (e?.type !== 'user' || e.isMeta || e.isCompactSummary) return false;
  if (e.origin && e.origin.kind && e.origin.kind !== 'human') return false;
  const c = e.message?.content;
  if (Array.isArray(c) && c.some((b) => b?.type === 'tool_result')) return false;
  const t = textOf(e).trim();
  if (!t) return false;
  if (t.startsWith('[Request interrupted') || t.startsWith('This session is being continued')) return false;
  if (t.startsWith('Stop hook feedback')) return false;
  return true;
}

/**
 * The owner's most recent message in the tail.
 * @param {object[]} entries  from `tailEntries`.
 * @returns {{text: string, at: number} | null} its text and time in ms, or
 *   null when the tail holds none (then the caller does not know, and says so).
 */
export function lastOwnerMessage(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    if (isOwnerMessage(entries[i])) {
      const at = Date.parse(entries[i].timestamp ?? '');
      return { text: textOf(entries[i]), at: Number.isFinite(at) ? at : 0 };
    }
  }
  return null;
}

/**
 * Every owner message later than a given time.
 * @param {string} path    the transcript.
 * @param {number} since   a time in ms, such as when a host declined.
 * @param {number} [cap]   the most of the end to read; 64 MB by default.
 * @returns {{text: string, at: number}[]} the owner's messages after `since`,
 *   oldest first, read from a tail that widens (2, 8, 32, then `cap` MB) until
 *   it reaches back past `since` or the cap, because a fixed 2 MB tail lost an
 *   answer given 2.2 MB earlier while the session kept working. reply-guard's owner route
 *   needs all of them, because the message that answers about one host is
 *   often followed by another about something else.
 */
export function ownerMessagesSince(path, since, cap = 64 * 1024 * 1024) {
  let entries = [];
  for (const mb of [2, 8, 32, cap / (1024 * 1024)]) {
    entries = tailEntries(path, Math.min(mb * 1024 * 1024, cap));
    const first = entries.find((e) => Number.isFinite(Date.parse(e?.timestamp ?? '')));
    if ((first && Date.parse(first.timestamp) <= since) || mb * 1024 * 1024 >= cap) break;
  }
  return entries.filter((e) => isOwnerMessage(e))
    .map((e) => ({ text: textOf(e), at: Date.parse(e.timestamp ?? '') }))
    .filter((m) => Number.isFinite(m.at) && m.at > since);
}

/**
 * Everything this session has READ back from tools in the tail — never what
 * it wrote into a tool's input, which is the thing under suspicion.
 * @param {object[]} entries  from `tailEntries`.
 * @returns {string} the concatenated tool-result text; a value found in it
 *   was seen, not invented (the same rule as `ident-guard.mjs`).
 */
export function seenInResults(entries, tools) {
  // A gate's REFUSAL is not something the session read: it quotes the refused
  // value back, so counting it let the identical retry through (a Drive file
  // id, an invented plan name). Failed results and refusals are skipped, and a
  // caller may count only results of the tools it names.
  const names = new Map();
  if (tools) for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) for (const b of c) if (b?.type === 'tool_use') names.set(b.id, b.name ?? '');
  }
  const parts = [];
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type !== 'user' || !Array.isArray(c) || e.toolDenialKind) continue;
    for (const b of c) {
      if (b?.type !== 'tool_result' || b.is_error) continue;
      if (tools && !tools.test(names.get(b.tool_use_id) ?? '')) continue;
      const text = typeof b.content === 'string' ? b.content
        : Array.isArray(b.content) ? b.content.filter((x) => x?.type === 'text').map((x) => x.text ?? '').join('\n') : '';
      if (/^PreToolUse:\S+ hook error/.test(text)) continue;
      parts.push(text);
    }
  }
  return parts.join('\n');
}
