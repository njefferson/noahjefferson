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
 *       stamps the time for this session and prints the status. The same
 *       status is written in chat; this command is the proof it was given.
 *   node report.mjs --gate
 *       PreToolUse, run by hook-dispatch.mjs: refuses the call when more than
 *       five minutes have passed since the later of the last stamp and the
 *       owner's last message. Subagent calls pass (they cannot tell the owner
 *       anything), and so does this command itself (hook-dispatch exempts it).
 *
 * No app notifications, ever (2026-09-28).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { tailEntries, lastOwnerMessage } from './transcript-tail.mjs';

export const INTERVAL_MS = 5 * 60 * 1000;
const CLOCK = join(homedir(), '.claude', 'report-clock.json');

/**
 * Read the stamp. One container runs one session, so there is one clock; a
 * per-session key was tried and the command line cannot know the session id.
 * @returns {{at: number, status: string}} the last status; `at` is 0 when the
 *   file is missing or unreadable, which the gate reads as "no stamp".
 */
function readClock() {
  try { const c = JSON.parse(readFileSync(CLOCK, 'utf8')); return { at: Number(c.at) || 0, status: String(c.status ?? '') }; }
  catch { return { at: 0, status: '' }; }
}

/**
 * Decide whether a PreToolUse call may run.
 * @param {object} p      the hook payload.
 * @param {number} now    the time in ms (a parameter so a plant can move it).
 * @returns {string | null} the refusal reason, or null to allow. Its caller,
 *   hook-dispatch.mjs, turns a reason into exit 2 with the reason on stderr.
 */
export function gate(p, now = Date.now()) {
  if (p.agent_id) return null;
  const stamp = readClock().at;
  const owner = lastOwnerMessage(tailEntries(p.transcript_path ?? '', 4 * 1024 * 1024))?.at ?? 0;
  const last = Math.max(stamp, owner);
  if (!last) return null;                       // nothing known yet: a fresh session
  const gap = now - last;
  if (gap <= INTERVAL_MS) return null;
  const mins = Math.floor(gap / 60000);
  return `${mins} minutes since the owner last got a status. Give one now, in chat AND as `
    + `node ${join(dirname(new URL(import.meta.url).pathname), 'report.mjs')} "Status HH:MM — done: …; running: …; next: …; next status by HH:MM". `
    + 'The owner is told in the first line, at least every five minutes during the work, and at the end (LESSONS §370). No app notifications.';
}

if (process.argv[1] && process.argv[1].endsWith('report.mjs')) {
  if (process.argv[2] === '--gate') {
    let p = {};
    try { p = JSON.parse(readFileSync(0, 'utf8')); } catch { /* no payload: allow */ }
    const why = gate(p);
    if (why) { process.stderr.write(why + '\n'); process.exit(2); }
    process.exit(0);
  }
  const status = process.argv.slice(2).join(' ').trim();
  if (!status) { console.error('usage: node report.mjs "Status HH:MM — done: …; running: …; next: …; next status by HH:MM"'); process.exit(1); }
  mkdirSync(dirname(CLOCK), { recursive: true });
  writeFileSync(CLOCK, JSON.stringify({ at: Date.now(), status }, null, 1));
  console.log(status);
}
