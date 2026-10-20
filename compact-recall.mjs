#!/usr/bin/env node
/**
 * AFTER A COMPACTION, THE OWNER'S OWN WORDS COME BACK (LESSONS §376), THE NEWEST
 * TEN PRINTED AND EVERY ONE FILED (LESSONS §385, §416).
 *
 * A compaction replaces the conversation with a summary, and a summary is a
 * paraphrase: what an instruction said becomes what the summary says it said,
 * and a message that arrived late in a long run of tool calls can be reduced
 * to a clause or lost. The transcript still holds every message verbatim.
 *
 * hook-dispatch.mjs calls `recallParts` on SessionStart with source `compact`
 * and prints its block FIRST, before the tool census and before any repo's
 * brief: the newest ten of the owner's messages since the previous compaction,
 * oldest first, because a later message overrides an earlier one. The block then
 * says how many are not printed and names the file holding EVERY message of the
 * stretch, whole and in order, which is written under the session's scratchpad
 * and named for the compaction (`compaction-N.txt`). The dispatcher then holds
 * the main thread to reading and the status until a Read result covering that
 * whole file has returned (`recallGate`), because ten messages of a long run is
 * the summary's own mistake again, smaller.
 *
 *   node compact-recall.mjs <transcript.jsonl>   prints the same block and
 *                                                writes the file beside the
 *                                                other recall files
 *
 * "Since the previous compaction" bounds the search: the messages after the last
 * `compact_boundary` that has any after it, or since the session's start where
 * there was none. The hook may run before or after the new boundary is written;
 * if no owner message follows the newest one, the newest is this compaction's
 * and the one before it is the previous.
 *
 * `messagesSinceCompaction` keeps its older contract, every owner message since
 * the previous compaction, because plan-scope-check.mjs prints them all to the
 * scope judge; it only tags each with whether a reply followed it.
 *
 * Without a scratchpad the file is `<transcript's name>.txt` in
 * $COMPACT_RECALL_DIR, or ~/.claude/compact-recall, and no gate holds anything
 * for it. The file is a print of the session's own transcript for the session's
 * own reading; nothing copies it into a repository.
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
 * The owner's messages since the previous compaction, and which compaction this is.
 * @param {string} path  the session transcript.
 * @returns {Promise<{msgs: {text: string, at: string, afterReply: boolean}[], n: number}>}
 *   `msgs`: oldest first, each text exactly as it was sent, with no cap.
 *   `afterReply` is true for a message typed after the newest assistant reply in
 *   that stretch, the ones no reply has answered, and true for every message when
 *   no reply precedes them. `n`: the number of the compaction the stretch ends
 *   at, counted from 1 (the boundaries written, plus this one when the hook runs
 *   before its own boundary is written), so the file named for it is the same
 *   whichever side of the boundary the hook ran. Streams the whole file once,
 *   parsing only lines that can hold a message, a reply or a boundary, because a
 *   transcript can pass 500 MB. `{msgs: [], n: 1}` when the file cannot be read.
 */
export async function stretchSinceCompaction(path) {
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
  } catch { return { msgs: [], n: 1 }; }
  const last = segs.at(-1);
  const seg = last.some((x) => !x.reply) || segs.length < 2 ? last : segs.at(-2);
  let lastReply = -1;
  for (let i = seg.length - 1; i >= 0; i--) if (seg[i].reply) { lastReply = i; break; }
  const msgs = [];
  seg.forEach((x, i) => { if (!x.reply) msgs.push({ text: x.text, at: x.at, afterReply: i > lastReply }); });
  return { msgs, n: seg === last ? segs.length : segs.length - 1 };
}

/**
 * The owner's messages since the previous compaction.
 * @param {string} path  the session transcript.
 * @returns {Promise<{text: string, at: string, afterReply: boolean}[]>} the `msgs`
 *   of `stretchSinceCompaction`: every one, oldest first, each tagged with
 *   whether a reply followed it. plan-scope-check.mjs prints them all to its judge.
 */
export async function messagesSinceCompaction(path) {
  return (await stretchSinceCompaction(path)).msgs;
}

/**
 * Where the file holding every message of the stretch is written, with no scratchpad.
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
 * Write the file that holds every message of the stretch, uncapped.
 * @param {string} path  the session transcript, which names the file when no
 *   compaction number is given.
 * @param {{text: string, at: string, afterReply?: boolean}[]} msgs  from
 *   `stretchSinceCompaction`.
 * @param {{dir?: string, n?: number}} [opts]  `dir` the folder to write in (the
 *   session scratchpad's `recall`) and `n` the compaction's number, which names
 *   the file `compaction-<n>.txt`; without them the file is `recallFile`'s.
 * @returns {string} the file's path, or '' when there is nothing to write or the
 *   write failed; `recallBlock` then says no file was written rather than
 *   citing one. THE INVARIANT `recallGate` relies on: the file holds EVERY message
 *   of the stretch, answered or not, numbered with its time, exactly as sent and
 *   in order, and replaces any earlier file of the same name.
 */
export function saveRecall(path, msgs, opts = {}) {
  if (!msgs.length) return '';
  const file = opts.dir ? join(opts.dir, `compaction-${Number(opts.n) || 1}.txt`) : recallFile(path);
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, msgs.map((m, i) => `--- ${i + 1} of ${msgs.length}${m.at ? `, ${m.at}` : ''} ---\n${m.text}`).join('\n') + '\n');
    return file;
  } catch { return ''; }
}

/**
 * The block hook-dispatch prints.
 * @param {{text: string, at: string, afterReply?: boolean}[]} msgs  from
 *   `stretchSinceCompaction`.
 * @param {string} [file]  the path `saveRecall` returned, or '' for none.
 * @returns {string} the newest `SHOWN` messages of the stretch verbatim, oldest
 *   first, numbered by their place among all of them, under one heading, then
 *   the count not printed and the path of the file holding all; '' when the
 *   stretch holds none, so the caller prints nothing rather than an empty
 *   heading. The count line is always last, and never cites a file that was not
 *   written.
 */
export function recallBlock(msgs, file = '') {
  if (!msgs.length) return '';
  const shown = msgs.slice(-SHOWN);
  const rest = msgs.length - shown.length;
  return `THE OWNER'S MESSAGES SINCE THE PREVIOUS COMPACTION, THE NEWEST ${shown.length}, VERBATIM, OLDEST FIRST (LESSONS §376, §385, §416). These outrank the summary: where the summary differs, these are right.\n`
    + shown.map((m, i) => `--- ${rest + i + 1} of ${msgs.length}${m.at ? `, ${m.at}` : ''} ---\n${m.text}`).join('\n')
    + '\n--- end of the owner\'s messages ---\n'
    + `Not printed here: ${rest} older (the ${shown.length} printed are the newest). `
    + (file ? `All ${msgs.length} are in the file ${file}.` : `All ${msgs.length} are in the transcript only: the file could not be written.`);
}

/**
 * The whole print for one compaction: read, write the file, build the block.
 * @param {string} path  the session transcript.
 * @param {string} [dir]  the folder the file goes in (the session scratchpad's
 *   `recall`); the older default place when omitted.
 * @returns {Promise<{block: string, file: string, n: number, count: number}>}
 *   `block` is what `recallBlock` builds from the stretch with the file
 *   `saveRecall` wrote ('' when the stretch holds no message); `file` that file's
 *   path ('' when none was written), `n` the compaction's number and `count` how
 *   many messages the file holds. hook-dispatch.mjs prints `block` first after a
 *   compaction and makes the main thread read `file` whole.
 */
export async function recallParts(path, dir = '') {
  const { msgs, n } = await stretchSinceCompaction(path);
  const file = saveRecall(path, msgs, dir ? { dir, n } : {});
  return { block: recallBlock(msgs, file), file, n, count: msgs.length };
}

/**
 * The block of one compaction's print.
 * @param {string} path  the session transcript.
 * @param {string} [dir]  as `recallParts` takes it.
 * @returns {Promise<string>} `recallParts`' `block`; '' when the stretch holds none.
 */
export async function recallFor(path, dir = '') {
  return (await recallParts(path, dir)).block;
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  const block = await recallFor(process.argv[2] ?? '');
  if (block) console.log(block);
}
