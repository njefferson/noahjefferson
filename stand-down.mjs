#!/usr/bin/env node
/**
 * THE STAND-DOWN SWITCH: one question, asked first by every hook that runs for a session.
 *
 * ## What it is
 *
 * A file named STAND-DOWN in a repository's own configuration folder holds two lines: the word until, a colon, a space and a date
 * written year-month-day, then one line of reason. It frees a session of that repository from the hub's gates through the end of that date
 * in California. The file is placed and removed by the owner's hand; no step of a plan writes it. Deleting it, or the passing of its
 * date, brings every gate back, and so does a file that does not read as those two lines.
 *
 * ## Which folder
 *
 * A session of a repository is one launched in that repository's own folder. The folder is the one the harness gives each hook as its
 * project folder (CLAUDE_PROJECT_DIR). The question reads the file from the configuration folder directly under that folder and from
 * nowhere else: never from the folder this file sits in (every container with the hub in it holds the hub's copy of the file, and that
 * copy frees nothing), and never from a repository that sits beside or beneath the launch folder. Where a hook is given no project folder
 * the answer is no.
 *
 * The dispatcher sets HUB_LAUNCH_DIR to the launch folder before it starts a child, so a child it starts for a repository beside or
 * beneath the launch folder is asked about the launch folder and not about its own project folder. A set HUB_LAUNCH_DIR, empty or not,
 * takes the place of CLAUDE_PROJECT_DIR.
 *
 * ## The off variable
 *
 * While HUB_STAND_DOWN_OFF is present in the environment the answer is no. The suite sets it before its first case, so it judges the
 * gates as they stand with no stand-down whether or not the hub's file stands in the checkout it runs in. It can only bring the gates
 * back and frees nothing.
 *
 * ## What it exports
 *
 *   standDown(folder, now)    the question for one folder at one moment: { inForce, until, reason }
 *   standDownHere(env, now)   the question for the folder the environment names, with the off variable and the launch folder applied
 *   standDownLine(sd)         the one line that says the stand-down is in force, until which date, and where the record is
 *
 * A missing file, a date that has passed, and a file that does not read as the two lines are each no stand-down.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const OFF_VARIABLE = 'HUB_STAND_DOWN_OFF';
export const LAUNCH_VARIABLE = 'HUB_LAUNCH_DIR';
export const RECORD = 'plans/native-setup.md';

const NO = { inForce: false, until: null, reason: '' };

/**
 * Today's date in California.
 * @param {Date|number} [now]  the moment, the clock when absent.
 * @returns {string} the date as year-month-day.
 */
export function californiaDate(now = new Date()) {
  return new Date(now).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

/**
 * Read the two lines of a stand-down file.
 * @param {string} text  the file's text.
 * @returns {{until: string, reason: string}|null} the date and the reason, or null when the text is not exactly two lines: `until: `
 *   and a real calendar date, then a reason that is not blank. One line end after the second line is allowed.
 */
export function readLines(text) {
  const lines = String(text).replace(/\r?\n$/, '').split(/\r?\n/);
  if (lines.length !== 2) return null;
  const m = /^until: (\d{4})-(\d{2})-(\d{2})\s*$/.exec(lines[0]);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const real = new Date(Date.UTC(y, mo - 1, d));
  if (real.getUTCFullYear() !== y || real.getUTCMonth() !== mo - 1 || real.getUTCDate() !== d) return null;
  const reason = lines[1].trim();
  if (!reason) return null;
  return { until: `${m[1]}-${m[2]}-${m[3]}`, reason };
}

/**
 * Is a stand-down in force for a folder at a moment?
 * @param {string} folder  the launch folder; the file is read from `.claude/STAND-DOWN` directly under it and nowhere else.
 * @param {Date|number} [now]  the moment, the clock when absent.
 * @returns {{inForce: boolean, until: string|null, reason: string}} in force through the end of the file's date in California;
 *   `until` is the date the file names even when it has passed; a missing folder, a missing file or a file of other words is no.
 */
export function standDown(folder, now = new Date()) {
  if (typeof folder !== 'string' || !folder) return NO;
  let text = '';
  try { text = readFileSync(join(folder, '.claude', 'STAND-DOWN'), 'utf8'); } catch { return NO; }
  const rec = readLines(text);
  if (!rec) return NO;
  return { inForce: californiaDate(now) <= rec.until, until: rec.until, reason: rec.reason };
}

/**
 * Is a stand-down in force for the session this process belongs to?
 * @param {Record<string, string|undefined>} [env]  the environment, this process's when absent.
 * @param {Date|number} [now]  the moment, the clock when absent.
 * @returns {{inForce: boolean, until: string|null, reason: string}} no while the off variable is present; otherwise the answer
 *   for the folder HUB_LAUNCH_DIR names when that is set, else for CLAUDE_PROJECT_DIR. Never throws.
 */
export function standDownHere(env = process.env, now = new Date()) {
  try {
    if (env[OFF_VARIABLE] !== undefined) return NO;
    const folder = env[LAUNCH_VARIABLE] !== undefined ? env[LAUNCH_VARIABLE] : env.CLAUDE_PROJECT_DIR;
    return standDown(folder ?? '', now);
  } catch { return NO; }
}

/**
 * The line a session is told while a stand-down is in force.
 * @param {{until: string, reason: string}} sd  the answer of `standDown`.
 * @returns {string} one line: that the hub's gates stand down for this session, through which date, the file's reason, where the record
 *   is, and the way back.
 */
export function standDownLine(sd) {
  return `STAND-DOWN IN FORCE: the hub's gates stand down for this session through the end of ${sd.until} (California); reason: ${sd.reason}. `
    + `The record of the design is ${RECORD} in the hub. Deleting .claude/STAND-DOWN brings every gate back; the push guard and the refusal of the choice popup stay throughout.`;
}
