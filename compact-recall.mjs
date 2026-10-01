#!/usr/bin/env node
/**
 * AFTER A COMPACTION, THE OWNER'S OWN WORDS COME BACK FIRST (LESSONS §376).
 *
 * A compaction replaces the conversation with a summary, and a summary is a
 * paraphrase: what an instruction said becomes what the summary says it said,
 * and a message that arrived late in a long run of tool calls can be reduced
 * to a clause or lost. The transcript still holds every message verbatim.
 *
 * hook-dispatch.mjs calls this on SessionStart with source `compact` and prints
 * its block FIRST, before the tool census and before any repo's brief: every
 * owner message since the previous compaction, word for word, oldest first.
 *
 *   node compact-recall.mjs <transcript.jsonl>   prints the same block
 *
 * "Since the previous compaction": the messages after the last
 * `compact_boundary` that has any after it. The hook may run before or after
 * the new boundary is written; if no owner message follows the newest one, the
 * newest is this compaction's and the one before it is the previous.
 */
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isOwnerMessage, textOf } from './transcript-tail.mjs';

const SELF = fileURLToPath(import.meta.url);

/**
 * Is this entry a compaction's boundary?
 * @param {object} e  a transcript entry.
 * @returns {boolean} true for the system `compact_boundary` entry and for the
 *   summary that follows it, so either one marks where a compaction fell.
 */
function isBoundary(e) {
  return (e?.type === 'system' && e.subtype === 'compact_boundary') || (e?.type === 'user' && e.isCompactSummary === true);
}

/**
 * The owner's messages since the previous compaction.
 * @param {string} path  the session transcript.
 * @returns {Promise<{text: string, at: string}[]>} oldest first, each text
 *   exactly as it was sent. Streams the whole file once, parsing only lines
 *   that can hold a message or a boundary, because a transcript can pass
 *   500 MB. Empty when the file cannot be read.
 */
export async function messagesSinceCompaction(path) {
  const segs = [[]];
  let lastWasBoundary = false;
  try {
    const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line.includes('"user"') && !line.includes('queued_command') && !line.includes('compact_boundary')) continue;
      let e; try { e = JSON.parse(line); } catch { continue; }
      if (isBoundary(e)) {
        // The boundary and its summary are one compaction, not two.
        if (!lastWasBoundary) segs.push([]);
        lastWasBoundary = true;
        continue;
      }
      if (isOwnerMessage(e)) { segs.at(-1).push({ text: textOf(e), at: e.timestamp ?? '' }); lastWasBoundary = false; }
    }
  } catch { return []; }
  const last = segs.at(-1);
  return last.length || segs.length < 2 ? last : segs.at(-2);
}

/**
 * The block hook-dispatch prints.
 * @param {{text: string, at: string}[]} msgs  from `messagesSinceCompaction`.
 * @returns {string} the messages verbatim under one heading, or '' when there
 *   are none, so the caller prints nothing rather than an empty heading.
 */
export function recallBlock(msgs) {
  if (!msgs.length) return '';
  return `THE OWNER'S MESSAGES SINCE THE PREVIOUS COMPACTION, VERBATIM, OLDEST FIRST (LESSONS §376). These outrank the summary: where the summary differs, these are right.\n`
    + msgs.map((m, i) => `--- ${i + 1} of ${msgs.length}${m.at ? `, ${m.at}` : ''} ---\n${m.text}`).join('\n')
    + '\n--- end of the owner\'s messages ---';
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  const block = recallBlock(await messagesSinceCompaction(process.argv[2] ?? ''));
  if (block) console.log(block);
}
