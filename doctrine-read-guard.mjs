#!/usr/bin/env node
/**
 * THE WHOLE DOCTRINE IS READ AT EVERY SESSION START AND AFTER EVERY COMPACTION
 * (Doctrine §11e).
 *
 * A compaction replaces the conversation with a summary, and the doctrine
 * carried past one is a paraphrase that drifts. A session that has not read the
 * rules re-derives them, and a rule written into the doctrine by a session that
 * never read it duplicates one already there. So the doctrine is due again at
 * every SessionStart, the harness's post-compaction start included, and the
 * main thread does nothing but read and give the status until it has been read.
 *
 *   node doctrine-read-guard.mjs --due   SessionStart, from hook-dispatch.mjs:
 *                                        writes this session's due marker and
 *                                        prints one line saying so
 *   node doctrine-read-guard.mjs         PreToolUse, from hook-dispatch.mjs:
 *                                        while the marker stands, refuses every
 *                                        main-thread call that is not a read
 *
 * HOW MUCH IS DUE DEPENDS ON THE START (LESSONS §385). A startup is every
 * line. A compaction or a resume is the lines from the heading of §0 up to the
 * heading of §3, which hold the rules the main thread acts on: the whole file
 * read again after each one was a large share of a fresh context, so each
 * compaction came sooner than the one before. The marker records the
 * SessionStart's `source`, the line printed at SessionStart says which lines are
 * due, and a doctrine with no such headings falls back to every line.
 *
 * The marker clears when Read results on the hub's DOCTRINE.md, returned after
 * it was written, cover the lines that are due between them. Only the hub's
 * counts: the DOCTRINE.md beside this file, in the clone every gate runs from.
 * A copy anywhere else — a file written to look like it, beside a file of the
 * gate's name — is not the doctrine. Lines come from the result the harness
 * recorded (`toolUseResult.file`), or from the result text's line numbers when
 * that is absent. Subagents are not held: they are held to the plan instead,
 * by plan-fence.mjs.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { tailEntries } from './transcript-tail.mjs';
import { isRead } from './hook-dispatch.mjs';

const SELF = fileURLToPath(import.meta.url);
// The hub's DOCTRINE.md: the one beside this file.
export const HUB_DOCTRINE = join(dirname(SELF), 'DOCTRINE.md');
const dueFile = (p) => join(process.env.DOCTRINE_DUE_DIR || join(homedir(), '.claude', 'doctrine-due'),
  `${String(p?.session_id || 'no-session').replace(/[^A-Za-z0-9_-]/g, '_')}.json`);

// The SessionStart sources after which only §0 up to §3 is due; any other source,
// a startup and a clear among them, is every line.
export const BOUNDED_SOURCES = ['compact', 'resume'];

/**
 * Which lines of the doctrine a start makes due, when not every line.
 * @param {string} source  the SessionStart's source, as the marker records it.
 * @param {string} [doctrine]  the file whose headings are read; HUB_DOCTRINE by default.
 * @returns {{from: number, to: number}|null} for a compaction or a resume, the
 *   1-based line numbers from the heading of §0 to the line before the heading
 *   of §3. Null for every other source, and null when the file cannot be read
 *   or lacks either heading, because null means every line and a doctrine whose
 *   headings cannot be found must not be read less. The marker is cleared only
 *   by Read results covering `from` to `to` (`readInFull`).
 */
export function dueRange(source, doctrine = HUB_DOCTRINE) {
  if (!BOUNDED_SOURCES.includes(source)) return null;
  let lines;
  try { lines = readFileSync(doctrine, 'utf8').split('\n'); } catch { return null; }
  const from = lines.findIndex((l) => /^## 0\. /.test(l));
  const to = lines.findIndex((l) => /^## 3\. /.test(l));
  if (from < 0 || to <= from) return null;
  return { from: from + 1, to };
}

// How a start is put in a sentence, and which lines are due, said the same way
// by the line printed at SessionStart and by the refusal.
const howStarted = (source) => (source === 'compact' ? 'was compacted' : source === 'resume' ? 'was resumed' : 'started');
const linesDue = (range) => (range
  ? `lines ${range.from} to ${range.to} (the heading of §0 up to the heading of §3, which hold the rules the main thread acts on)`
  : 'every line');

/**
 * Make the doctrine due for this session.
 * @param {object} p  the SessionStart payload.
 * @param {string} [doctrine]  the file named and read for its headings; HUB_DOCTRINE
 *   by default, a fixture in the test.
 * @returns {string} the one line hook-dispatch.mjs prints at SessionStart,
 *   naming the file to read and saying which lines of it are due: every line at
 *   a startup, `dueRange`'s lines at a compaction or a resume. The marker's time
 *   is what every later Read result must come after to count.
 */
export function markDue(p, doctrine = HUB_DOCTRINE) {
  const f = dueFile(p);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify({ at: Date.now(), source: p.source ?? '' }) + '\n');
  return `DOCTRINE DUE (Doctrine §11e): this session ${howStarted(p.source)}; until Read results on ${doctrine} cover ${linesDue(dueRange(p.source ?? '', doctrine))}, the main thread may only read and give the status.`;
}

/**
 * Have the doctrine's due lines been read since a time?
 * @param {object[]} entries  transcript entries (`tailEntries`).
 * @param {number} since      the marker's time in ms.
 * @param {string} [doctrine] the one file that counts; HUB_DOCTRINE by default.
 * @param {{from: number, to: number}|null} [range]  the 1-based lines due, from
 *   `dueRange`; null, the default, is every line of the file.
 * @returns {string|null} that path once every due line has been read, or null.
 *   Only Read results on it timed after `since`, not errors, and only lines
 *   actually returned count: a result's own line numbers, never the call's
 *   offset and limit. Lines outside the range count for nothing, and a range
 *   short by one line at either end is not covered.
 */
export function readInFull(entries, since, doctrine = HUB_DOCTRINE, range = null) {
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
    let from = 1, to = rec.total;
    if (range) { from = range.from; to = range.to; }
    else if (!to) {
      try { const ls = readFileSync(path, 'utf8').split('\n'); if (ls.at(-1) === '') ls.pop(); to = ls.length; } catch { continue; }
    }
    if (to >= from && rec.lines.size >= to - from + 1 && Array.from({ length: to - from + 1 }, (_, k) => from + k).every((n) => rec.lines.has(n))) return path;
  }
  return null;
}

/**
 * Decide one PreToolUse call.
 * @param {object} p  the payload.
 * @param {object[]} [entries]  transcript entries, for the test.
 * @param {{classify?: (p: object) => boolean, doctrine?: string}} [opts]  the
 *   read classifier and the file that counts, for the test.
 * @returns {string|null} null for a subagent, when nothing is due, or for a
 *   read; null too once the lines due for this start (`dueRange` for its
 *   source, every line otherwise) have been read, which removes the marker.
 *   Otherwise the refusal, naming the file to read and the lines of it that are
 *   due. The status command never reaches this: hook-dispatch.mjs passes it first.
 */
export function decide(p, entries, opts = {}) {
  if (p.agent_id) return null;
  let due;
  try { due = JSON.parse(readFileSync(dueFile(p), 'utf8')); } catch { return null; }
  const doctrine = opts.doctrine ?? HUB_DOCTRINE;
  const range = dueRange(due.source ?? '', doctrine);
  const list = entries ?? tailEntries(p.transcript_path ?? '', 16 * 1024 * 1024);
  if (readInFull(list, Number(due.at) || 0, doctrine, range)) { rmSync(dueFile(p), { force: true }); return null; }
  if (isRead(p, opts.classify)) return null;
  return `DOCTRINE GATE (Doctrine §11e): this session ${howStarted(due.source)} and the doctrine has not been read since. `
    + `Until the Read results on ${doctrine} cover ${linesDue(range)}, the main thread may only read and give the status. `
    + (range
      ? `Read those lines now (offset ${range.from}, in as many Read calls as it takes); a summary of them, or another copy, is not them.`
      : 'Read it in full now, in as many Read calls as it takes; a summary of it, or another copy of it, is not it.');
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
