#!/usr/bin/env node
/**
 * THE NEVER-RULES PAGE IS READ AT EVERY SESSION START AND AFTER EVERY COMPACTION,
 * AND AFTER A RESUME UNLESS THE SESSION ALREADY HOLDS IT; THE PLAN RULES PAGE IS
 * READ AT THE ENTRY TO PLAN MODE (Doctrine §11e).
 *
 * The doctrine is three files in the hub's `doctrine/` folder and `DOCTRINE.md`
 * is their index. What is due is the page that applies: `doctrine/never.md`, the
 * short page of rules that bind every session, at a start; `doctrine/plans.md`,
 * the plan rules, at the entry to plan mode; and nothing by this guard from
 * `doctrine/apps.md`, which a plan's item points at when it applies. The
 * maker's own measure is that adherence falls once an instruction file passes
 * about two hundred lines, so no start reads the whole.
 *
 * A compaction replaces the conversation with a summary, and the rules carried
 * past one are a paraphrase that drifts. So the never page is due again at
 * every SessionStart, the harness's post-compaction start included, and the
 * main thread does nothing but read and give the status until it has been read.
 * A resume keeps the conversation as it was, so what a resume owes is whatever
 * that conversation does not already hold.
 *
 *   node doctrine-read-guard.mjs --due   SessionStart, from hook-dispatch.mjs:
 *                                        writes this session's due marker and
 *                                        prints one line saying what is due
 *   node doctrine-read-guard.mjs         PreToolUse, from hook-dispatch.mjs:
 *                                        while the marker stands, refuses every
 *                                        main-thread call that is not a read;
 *                                        at the entry to plan mode, the same
 *                                        until the plan rules page is read
 *
 * WHAT EACH START MAKES DUE (LESSONS §398, which replaced §385's bound). A
 * startup, a clear and a compaction make EVERY line of the never page due: the
 * read exists to carry the owner's rules word for word across the point where a
 * summary replaces the conversation. A resume makes nothing due when the Read
 * results in the session's transcript since its last startup or compaction
 * cover every line of the page as it stands now, and every line otherwise: a
 * part read, a read made only before the last compaction, and a read of a file
 * that has since changed length all leave the resume owing the whole page. The
 * marker records the SessionStart's `source`, the line printed at SessionStart
 * and the refusal both name the lines due, and a page whose lines cannot be
 * counted is due in full.
 *
 * The marker is written for a resume too, held or not: session-brief.mjs reads
 * its `source` to print the lessons as a count, and the first call after a held
 * resume finds the page read and removes it.
 *
 * The marker clears when Read results on the hub's never page cover every line
 * of it: for a startup, a clear or a compaction those returned after the marker
 * was written, for a resume those returned since the last compaction in the
 * transcript. Only the hub's counts: the page beside this file, in the clone
 * every gate runs from. A copy anywhere else — a file written to look like it,
 * beside a file of the gate's name — is not the page. Lines come from the
 * result the harness recorded (`toolUseResult.file`), or from the result text's
 * line numbers when that is absent. Subagents are not held: they are held to
 * the plan instead, by plan-fence.mjs.
 *
 * THE ENTRY TO PLAN MODE is either the plan-mode tool (`EnterPlanMode`) or any
 * call whose payload is already in plan mode (`permission_mode` plan), so a
 * session the harness put into plan mode is held as one that entered it. The
 * plan rules page is held when Read results on it, returned since the newest
 * compaction and since the newest exit from plan mode the transcript shows (an
 * `ExitPlanMode` whose result is not an error), cover every line. An exit the
 * transcript does not show leaves the page held, so it is read again at a later
 * entry only where the guard can see the exit.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { tailEntries } from './transcript-tail.mjs';
import { isRead } from './hook-dispatch.mjs';

const SELF = fileURLToPath(import.meta.url);
// The hub's never-rules page, due at a start, and its plan rules page, due at the entry to plan mode:
// the ones in the `doctrine/` folder beside this file. `apps.md` beside them is due by no gate.
export const NEVER_PAGE = join(dirname(SELF), 'doctrine', 'never.md');
export const PLANS_PAGE = join(dirname(SELF), 'doctrine', 'plans.md');
const dueFile = (p) => join(process.env.DOCTRINE_DUE_DIR || join(homedir(), '.claude', 'doctrine-due'),
  `${String(p?.session_id || 'no-session').replace(/[^A-Za-z0-9_-]/g, '_')}.json`);

// How much of the end of the transcript the guard reads, for the marker's line and for every call.
const TAIL_BYTES = 16 * 1024 * 1024;

// The SessionStart sources after which the session may already hold the doctrine, because the
// conversation it resumes is the one it had; any other source, a startup, a clear and a
// compaction among them, makes every line due.
export const HELD_SOURCES = ['resume'];

// How a start is put in a sentence, and which lines are due, said the same way
// by the line printed at SessionStart and by the refusal.
const howStarted = (source) => (source === 'compact' ? 'was compacted' : source === 'resume' ? 'was resumed' : 'started');
const linesDue = (n) => (n ? `every line (lines 1 to ${n})` : 'every line');
const whyDue = (source) => (source === 'resume'
  ? 'this session was resumed and the Read results in it since its last startup or compaction do not cover every line of the doctrine as it stands'
  : `this session ${howStarted(source)} and the doctrine has not been read since`);

/**
 * How many lines the doctrine has now, counted the way the harness records them.
 * @param {string} [doctrine]  the file to count; NEVER_PAGE by default.
 * @returns {number|null} the length of the file's text split at its newlines, the
 *   empty text after a final newline counted as a line, because that is what the
 *   harness records as the `totalLines` of every Read result: measured on the live
 *   clone's former single doctrine file, which held 2549 lines of text and was
 *   recorded as 2550 in all sixteen results read. Counting the text lines alone made every real result
 *   look stale to `heldNow`. Null when the file cannot be read or is empty, because
 *   a doctrine whose lines cannot be counted is due in full (`heldNow`, `linesDue`).
 */
export function lineCount(doctrine = NEVER_PAGE) {
  try {
    const text = readFileSync(doctrine, 'utf8');
    return text ? text.split('\n').length : null;
  } catch { return null; }
}

/**
 * How many newline-ended lines of text the doctrine holds.
 * @param {string} [doctrine]  the file to count; NEVER_PAGE by default.
 * @returns {number} the lines of text, the empty text after a final newline not
 *   counted; 0 when the file cannot be read. The target for Read results that
 *   carry line numbers in their text and no recorded total, a form the harness
 *   may omit, where leniency by one line costs nothing.
 */
function textLines(doctrine) {
  try {
    const ls = readFileSync(doctrine, 'utf8').split('\n');
    if (ls.at(-1) === '') ls.pop();
    return ls.length;
  } catch { return 0; }
}

/**
 * The entries that follow the newest compaction.
 * @param {object[]} entries  transcript entries (`tailEntries`), in file order.
 * @returns {object[]} the entries after the last compaction boundary: the system
 *   `compact_boundary` entry and the summary that follows it are one compaction
 *   (the pair compact-recall.mjs reads). All of the entries when they hold no
 *   boundary, because then the session's last startup is the transcript's start.
 *   A Read result before the boundary is not in what comes back: a compaction
 *   replaced it with a summary, so the session no longer holds it.
 */
export function afterLastCompaction(entries) {
  let at = -1;
  entries.forEach((e, i) => {
    if ((e?.type === 'system' && e.subtype === 'compact_boundary') || (e?.type === 'user' && e.isCompactSummary === true)) at = i;
  });
  return entries.slice(at + 1);
}

/**
 * Have the doctrine's lines been read since a time?
 * @param {object[]} entries  transcript entries (`tailEntries`).
 * @param {number} since      the time in ms a Read result must come after; the marker's
 *   for a startup, a clear or a compaction, 0 for a resume (`heldNow`).
 * @param {string} [doctrine] the one file that counts; NEVER_PAGE by default.
 * @param {number|null} [current]  the file's length now, from `lineCount`, when the
 *   reads may be older than the file: `heldNow` passes it, because a resume's reads
 *   can predate a change to the file. Null, the default, for the reads of a start
 *   that were made after its marker, which are of the file as it is.
 * @returns {string|null} that path once every line has been read, or null: every
 *   line up to `current` when it is given, otherwise up to the total the results
 *   recorded, or for results with no recorded total the lines of text the file
 *   holds now. Only Read results on it timed after `since`, not errors, and only
 *   lines actually returned count: a result's own line numbers, never the call's
 *   offset and limit. With `current` given, a result recorded with another total
 *   was made of other text and counts for nothing.
 */
export function readInFull(entries, since, doctrine = NEVER_PAGE, current = null) {
  const isDoctrine = (f) => resolve(String(f)) === resolve(doctrine);
  const asked = new Map();
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) for (const b of c) {
      if (b?.type === 'tool_use' && b.name === 'Read') asked.set(b.id, String(b.input?.file_path ?? ''));
    }
  }
  const seen = new Map();
  for (const e of entries) {
    const t = Date.parse(e?.timestamp ?? '');
    const c = e?.message?.content;
    if (e?.type !== 'user' || !Array.isArray(c) || !(t > since)) continue;
    for (const b of c) {
      if (b?.type !== 'tool_result' || b.is_error || !asked.has(b.tool_use_id)) continue;
      const file = e.toolUseResult?.file;
      const path = resolve(String(file?.filePath || asked.get(b.tool_use_id)));
      if (!isDoctrine(path)) continue;
      const rec = seen.get(path) ?? { lines: new Set(), total: 0 };
      if (file && Number.isFinite(file.startLine) && Number.isFinite(file.numLines) && typeof file.content === 'string') {
        if (current !== null && Number(file.totalLines) > 0 && Number(file.totalLines) !== current) continue;
        for (let k = 0; k < file.numLines; k++) rec.lines.add(file.startLine + k);
        if (Number(file.totalLines) > 0) rec.total = Number(file.totalLines);
      } else {
        const text = typeof b.content === 'string' ? b.content
          : Array.isArray(b.content) ? b.content.map((x) => x?.text ?? '').join('\n') : '';
        for (const m of text.matchAll(/^\s*(\d+)\t/gm)) rec.lines.add(Number(m[1]));
      }
      seen.set(path, rec);
    }
  }
  for (const [path, rec] of seen) {
    const to = current ?? (rec.total || textLines(path));
    if (to > 0 && rec.lines.size >= to && Array.from({ length: to }, (_, k) => k + 1).every((n) => rec.lines.has(n))) return path;
  }
  return null;
}

/**
 * Does the session already hold the doctrine's whole current text?
 * @param {object[]} entries  transcript entries (`tailEntries`).
 * @param {string} [doctrine] the one file that counts; NEVER_PAGE by default.
 * @returns {boolean} true when Read results on it, returned since the newest
 *   compaction in the entries (or in all of them, where there is none), cover
 *   every line of the file as it stands now. False when they cover less, when
 *   the only whole read came before the last compaction, and when the file's
 *   lines cannot be counted. A resume owes the read exactly when this is false;
 *   `markDue` says which, and `decide` clears the marker on it.
 */
export function heldNow(entries, doctrine = NEVER_PAGE) {
  const n = lineCount(doctrine);
  if (n === null) return false;
  return readInFull(afterLastCompaction(entries), 0, doctrine, n) !== null;
}

/**
 * Make the doctrine due for this session.
 * @param {object} p  the SessionStart payload.
 * @param {string} [doctrine]  the file named and counted; NEVER_PAGE
 *   by default, a fixture in the test.
 * @returns {string} the one line hook-dispatch.mjs prints at SessionStart. For a
 *   resume whose transcript already holds the whole current text (`heldNow`) it
 *   begins DOCTRINE HELD and says none is due. Otherwise it begins DOCTRINE DUE,
 *   names the file to read, how the session started and the lines due: every
 *   line, with their number when the file can be counted. The marker is written
 *   either way, with the start's source and its time; for a startup, a clear and
 *   a compaction that time is what every later Read result must come after.
 */
export function markDue(p, doctrine = NEVER_PAGE) {
  const f = dueFile(p);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify({ at: Date.now(), source: p.source ?? '' }) + '\n');
  const n = lineCount(doctrine);
  if (HELD_SOURCES.includes(p.source ?? '') && heldNow(tailEntries(p.transcript_path ?? '', TAIL_BYTES), doctrine)) {
    return `DOCTRINE HELD (Doctrine §11e): this session was resumed, and the Read results in it since its last startup or compaction cover every line of ${doctrine} as it stands (${n} lines), so none is due.`;
  }
  return `DOCTRINE DUE (Doctrine §11e): this session ${howStarted(p.source)}; until Read results on ${doctrine} cover ${linesDue(n)}, the main thread may only read and give the status.`;
}

/**
 * The start's half of one PreToolUse call: is the never page still due?
 * @param {object} p  the payload.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @param {{classify?: (p: object) => boolean, doctrine?: string}} [opts]  the
 *   read classifier and the file that counts, for the test.
 * @returns {string|null} null for a subagent, when nothing is due, or for a
 *   read; null too once the page is held for this start, which removes the
 *   marker: read since the marker for a startup, a clear or a compaction, read
 *   since the last compaction for a resume (`heldNow`). Otherwise the refusal,
 *   naming the file to read and the lines of it that are due.
 */
function startGate(p, entries, opts = {}) {
  if (p.agent_id) return null;
  let due;
  try { due = JSON.parse(readFileSync(dueFile(p), 'utf8')); } catch { return null; }
  const doctrine = opts.doctrine ?? NEVER_PAGE;
  const list = entries ?? tailEntries(p.transcript_path ?? '', TAIL_BYTES);
  const held = HELD_SOURCES.includes(due.source ?? '') ? heldNow(list, doctrine) : readInFull(list, Number(due.at) || 0, doctrine) !== null;
  if (held) { rmSync(dueFile(p), { force: true }); return null; }
  if (isRead(p, opts.classify)) return null;
  return `DOCTRINE GATE (Doctrine §11e): ${whyDue(due.source)}. `
    + `Until the Read results on ${doctrine} cover ${linesDue(lineCount(doctrine))}, the main thread may only read and give the status. `
    + 'Read it in full now, in as many Read calls as it takes; a summary of it, or another copy of it, is not it.';
}

/**
 * The entries after the newest exit from plan mode the transcript shows.
 * @param {object[]} entries  transcript entries (`tailEntries`), in file order.
 * @returns {object[]} the entries after the newest `ExitPlanMode` tool call whose
 *   result is not an error: a refused or declined exit leaves the session in plan
 *   mode, so it is no exit. All of the entries when they show no exit, because an
 *   exit the guard cannot see leaves the page held. A Read result before the exit
 *   is not in what comes back: the session left plan mode, and its next entry owes
 *   the page again.
 */
export function afterLastExit(entries) {
  const asked = new Set();
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) for (const b of c) {
      if (b?.type === 'tool_use' && b.name === 'ExitPlanMode') asked.add(b.id);
    }
  }
  let at = -1;
  entries.forEach((e, i) => {
    const c = e?.message?.content;
    if (e?.type === 'user' && Array.isArray(c)) for (const b of c) {
      if (b?.type === 'tool_result' && asked.has(b.tool_use_id) && !b.is_error) at = i;
    }
  });
  return entries.slice(at + 1);
}

/**
 * Does the session already hold the plan rules page's whole current text?
 * @param {object[]} entries  transcript entries (`tailEntries`).
 * @param {string} [plans]  the page that counts; PLANS_PAGE by default.
 * @returns {boolean} true when Read results on it, returned since the newest
 *   compaction and since the newest exit from plan mode the entries show
 *   (`afterLastExit`), cover every line of the file as it stands now. False when
 *   they cover less, and when the file's lines cannot be counted.
 */
export function plansHeld(entries, plans = PLANS_PAGE) {
  const n = lineCount(plans);
  if (n === null) return false;
  return readInFull(afterLastExit(afterLastCompaction(entries)), 0, plans, n) !== null;
}

/**
 * Is this call the entry to plan mode?
 * @param {object} p  the payload.
 * @returns {boolean} true for the plan-mode tool and for any call whose payload is
 *   already in plan mode, so a session the harness put into plan mode is held as
 *   one that entered it. A mode a caller forced (`plan_mode_forced`) is the
 *   classifier's and not the session's, and is not an entry.
 */
export function planEntry(p) {
  if (p.plan_mode_forced) return false;
  return p.tool_name === 'EnterPlanMode' || String(p.permission_mode ?? '') === 'plan';
}

/**
 * The plan rules page's half of one PreToolUse call.
 * @param {object} p  the payload.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @param {{classify?: (p: object) => boolean, plans?: string}} [opts]  the read
 *   classifier and the page that counts, for the test.
 * @returns {string|null} null for a subagent, for a call that is not the entry
 *   to plan mode, when the page is held (`plansHeld`) and for a read; otherwise
 *   the refusal, naming the page and its lines. The refusal sets no latch: the
 *   Read it names is its remedy (hook-dispatch.mjs skips the latch for this guard).
 */
function planGate(p, entries, opts = {}) {
  if (p.agent_id || !planEntry(p)) return null;
  const plans = opts.plans ?? PLANS_PAGE;
  const list = entries ?? tailEntries(p.transcript_path ?? '', TAIL_BYTES);
  if (plansHeld(list, plans)) return null;
  if (isRead(p, opts.classify)) return null;
  return `PLAN RULES GATE (Doctrine §11e): this call enters plan mode or is made in it, and the plan rules page has not been read since this session started, was compacted or left plan mode. `
    + `Until the Read results on ${plans} cover ${linesDue(lineCount(plans))}, the main thread may only read and give the status. `
    + 'Read it in full now, in as many Read calls as it takes; a summary of it, or another copy of it, is not it. This refusal does not latch: reading the page clears it.';
}

/**
 * Decide one PreToolUse call.
 * @param {object} p  the payload.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @param {{classify?: (p: object) => boolean, doctrine?: string, plans?: string}} [opts]
 *   the read classifier and the two files that count, for the test.
 * @returns {string|null} the start's refusal (`startGate`) while the never page is
 *   due, else the plan rules refusal (`planGate`) at the entry to plan mode while
 *   its page is unread, else null. The status command never reaches this:
 *   hook-dispatch.mjs passes it first.
 */
export function decide(p, entries, opts = {}) {
  return startGate(p, entries, opts) ?? planGate(p, entries, opts);
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  let p = {};
  try { p = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }
  if (process.argv.includes('--due')) { if (!p.agent_id) console.log(markDue(p)); process.exit(0); }
  let why = null;
  try { why = decide(p); } catch (e) { process.stderr.write(`doctrine-read-guard: ${e?.message ?? e}\n`); process.exit(1); }
  if (why) { process.stderr.write(why + '\n'); process.exit(2); }
  process.exit(0);
}
