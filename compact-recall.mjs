#!/usr/bin/env node
/**
 * AFTER A COMPACTION, THE OWNER'S OWN WORDS COME BACK FIRST (LESSONS §376), AND
 * ONLY THE ONES NOT YET ANSWERED, BOUNDED (LESSONS §385).
 *
 * A compaction replaces the conversation with a summary, and a summary is a
 * paraphrase: what an instruction said becomes what the summary says it said,
 * and a message that arrived late in a long run of tool calls can be reduced
 * to a clause or lost. The transcript still holds every message verbatim.
 *
 * hook-dispatch.mjs calls `recallFor` on SessionStart with source `compact` and
 * prints its block FIRST, before the tool census and before any repo's brief:
 * the owner's messages typed after the newest assistant reply before the
 * compaction, oldest first. Everything earlier was answered by that reply, and
 * printing it all again was a large share of the context each compaction was
 * meant to free. At most ten are printed, the newest ten, because a later
 * message overrides an earlier one; the block then says how many are not
 * printed and names the file holding every one of them, which is written beside.
 *
 *   node compact-recall.mjs <transcript.jsonl>   prints the same block and
 *                                                writes the same file
 *
 * "After the previous compaction" still bounds the search: the messages after
 * the last `compact_boundary` that has any after it. The hook may run before or
 * after the new boundary is written; if no owner message follows the newest one,
 * the newest is this compaction's and the one before it is the previous.
 *
 * `messagesSinceCompaction` keeps its older contract, every owner message since
 * the previous compaction, because plan-scope-check.mjs prints them all to the
 * scope judge; it only tags each with whether a reply followed it.
 *
 * The file is `<transcript's name>.txt` in $COMPACT_RECALL_DIR, or
 * ~/.claude/compact-recall; the next compaction of the same session replaces it.
 */
import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve, join, basename, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { isOwnerMessage, textOf } from './transcript-tail.mjs';

const SELF = fileURLToPath(import.meta.url);

// The most messages the block prints; the rest are counted and filed.
export const SHOWN = 10;

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
 * Is this entry an assistant reply the owner's earlier messages were answered by?
 * @param {object} e  a transcript entry.
 * @returns {boolean} true for an assistant entry of the main thread that carries
 *   text. A tool call alone, an entry whose text is blank, a subagent's entry
 *   (`isSidechain`) and the harness's error message are not a reply to the
 *   owner; counting one would hide a message the session never answered.
 */
function isReply(e) {
  return e?.type === 'assistant' && e.isSidechain !== true && e.isApiErrorMessage !== true
    && Array.isArray(e.message?.content)
    && e.message.content.some((b) => b?.type === 'text' && String(b.text ?? '').trim());
}

/**
 * The owner's messages since the previous compaction.
 * @param {string} path  the session transcript.
 * @returns {Promise<{text: string, at: string, afterReply: boolean}[]>} oldest
 *   first, each text exactly as it was sent, with no cap. `afterReply` is true
 *   for a message typed after the newest assistant reply in that stretch, the
 *   ones no reply has answered, and true for every message when no reply
 *   precedes them. Streams the whole file once, parsing only lines that can hold
 *   a message, a reply or a boundary, because a transcript can pass 500 MB.
 *   Empty when the file cannot be read.
 */
export async function messagesSinceCompaction(path) {
  const segs = [[]];
  let lastWasBoundary = false;
  try {
    const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
    for await (const line of rl) {
      const holdsText = line.includes('"assistant"') && line.includes('"text"');
      if (!line.includes('"user"') && !line.includes('queued_command') && !line.includes('compact_boundary') && !holdsText) continue;
      let e; try { e = JSON.parse(line); } catch { continue; }
      if (isBoundary(e)) {
        // The boundary and its summary are one compaction, not two.
        if (!lastWasBoundary) segs.push([]);
        lastWasBoundary = true;
        continue;
      }
      if (isReply(e)) { segs.at(-1).push({ reply: true }); lastWasBoundary = false; continue; }
      if (isOwnerMessage(e)) { segs.at(-1).push({ text: textOf(e), at: e.timestamp ?? '' }); lastWasBoundary = false; }
    }
  } catch { return []; }
  const last = segs.at(-1);
  const seg = last.some((x) => !x.reply) || segs.length < 2 ? last : segs.at(-2);
  let lastReply = -1;
  for (let i = seg.length - 1; i >= 0; i--) if (seg[i].reply) { lastReply = i; break; }
  const out = [];
  seg.forEach((x, i) => { if (!x.reply) out.push({ text: x.text, at: x.at, afterReply: i > lastReply }); });
  return out;
}

// The messages no reply has answered; a message with no tag counts as one.
const unanswered = (msgs) => msgs.filter((m) => m.afterReply !== false);

/**
 * Where the file holding every unanswered message is written.
 * @param {string} path  the session transcript.
 * @returns {string} `<transcript's name>.txt` under $COMPACT_RECALL_DIR, or under
 *   ~/.claude/compact-recall, with anything but letters, digits, `_` and `-`
 *   taken out of the name.
 */
function recallFile(path) {
  const name = basename(String(path), '.jsonl').replace(/[^A-Za-z0-9_-]/g, '_') || 'session';
  return join(process.env.COMPACT_RECALL_DIR || join(homedir(), '.claude', 'compact-recall'), `${name}.txt`);
}

/**
 * Write the file that holds every unanswered message, uncapped.
 * @param {string} path  the session transcript, which names the file.
 * @param {{text: string, at: string, afterReply?: boolean}[]} msgs  from
 *   `messagesSinceCompaction`.
 * @returns {string} the file's path, or '' when there is nothing to write or the
 *   write failed; `recallBlock` then says no file was written rather than
 *   citing one. The file holds each message numbered, with its time, exactly as
 *   sent, and replaces any earlier one for the same session.
 */
export function saveRecall(path, msgs) {
  const open = unanswered(msgs);
  if (!open.length) return '';
  const file = recallFile(path);
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, open.map((m, i) => `--- ${i + 1} of ${open.length}${m.at ? `, ${m.at}` : ''} ---\n${m.text}`).join('\n') + '\n');
    return file;
  } catch { return ''; }
}

/**
 * The block hook-dispatch prints.
 * @param {{text: string, at: string, afterReply?: boolean}[]} msgs  from
 *   `messagesSinceCompaction`.
 * @param {string} [file]  the path `saveRecall` returned, or '' for none.
 * @returns {string} the newest `SHOWN` unanswered messages verbatim, oldest
 *   first, numbered by their place among all of them, under one heading, then
 *   the count not printed and the path of the file holding all; '' when no
 *   message is unanswered, so the caller prints nothing rather than an empty
 *   heading. The count line is always last, and never cites a file that was not
 *   written.
 */
export function recallBlock(msgs, file = '') {
  const open = unanswered(msgs);
  if (!open.length) return '';
  const shown = open.slice(-SHOWN);
  const rest = open.length - shown.length;
  return `THE OWNER'S MESSAGES TYPED AFTER THE LAST REPLY BEFORE THE COMPACTION, VERBATIM, OLDEST FIRST (LESSONS §376, §385). These outrank the summary: where the summary differs, these are right.\n`
    + shown.map((m, i) => `--- ${rest + i + 1} of ${open.length}${m.at ? `, ${m.at}` : ''} ---\n${m.text}`).join('\n')
    + '\n--- end of the owner\'s messages ---\n'
    + `Not printed here: ${rest} older (the ${shown.length} printed are the newest). `
    + (file ? `All ${open.length} are in the file ${file}.` : `All ${open.length} are in the transcript only: the file could not be written.`);
}

/**
 * The whole print for one compaction: read, write the file, build the block.
 * @param {string} path  the session transcript.
 * @returns {Promise<string>} the block `recallBlock` builds from the unanswered
 *   messages with the file `saveRecall` wrote; '' when there are none. This is
 *   what hook-dispatch.mjs prints first after a compaction.
 */
export async function recallFor(path) {
  const msgs = await messagesSinceCompaction(path);
  return recallBlock(msgs, saveRecall(path, msgs));
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  const block = await recallFor(process.argv[2] ?? '');
  if (block) console.log(block);
}
