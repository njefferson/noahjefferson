#!/usr/bin/env node
/**
 * NOTHING RUNS OUTSIDE A PLAN THE OWNER APPROVED (Doctrine §0e, LESSONS §370).
 *
 * `plan-guard.mjs` refuses writes WHILE plan mode is on. It had nothing to say
 * once plan mode was off, and auto mode is the harness default, so a session
 * could plan, get approval, and then go on to edits, downloads, renders and a
 * search of the owner's whole Drive that no plan named, in silence. Measured
 * in one session on 2026-09-28: an edit and a Drive search that no plan named,
 * a test started straight from a chat message, and long runs of tool calls
 * with no words between them.
 *
 * ## The contract
 *
 *   PreToolUse (default): outside plan mode, anything `plan-guard.mjs` would
 *   call a write is refused unless ~/.claude/APPROVED-PLAN.json exists AND the
 *   hash it records still matches the plan file it names. Reads always pass,
 *   so a plan can be made. The classification of "write" is plan-guard's own,
 *   run as a child with the mode forced to plan: one list, never a fork.
 *
 *   PostToolUse (--mark): on ExitPlanMode whose result says the owner approved,
 *   write the marker with the plan's path and hash. On EnterPlanMode, remove
 *   it. A session cannot write the marker: any tool input that names it is
 *   refused, except `--done`, which only REMOVES it (always the safe way).
 *
 *   `node approved-plan-guard.mjs --done` ends the approved work: the last
 *   step of every plan runs it.
 *
 * What this cannot see is whether each step was announced in chat. That half
 * is the rule, and the refusal prints it.
 */
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const MARKER = join(homedir(), '.claude', 'APPROVED-PLAN.json');
const RULE = 'PLAN MODE ONLY, AND TALK DURING THE WORK (Doctrine §0e): nothing runs that is not inside a plan the owner approved in plan mode; '
  + 'a request in chat gets a plan, not an action; while executing, say what each step does before it runs and what it showed after.';
const hashOf = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

if (process.argv.includes('--done')) {
  rmSync(MARKER, { force: true });
  console.log('approved work ended: marker removed. The next action needs a new approved plan.');
  process.exit(0);
}

// ONCE. See plan-guard.mjs: a second read of stdin gets nothing.
const raw = readFileSync(0, 'utf8');
let p = {};
try { p = JSON.parse(raw); } catch { /* unparsable: treated as a write below */ }
const tool = p.tool_name ?? '';

if (process.argv.includes('--mark')) {
  if (tool === 'EnterPlanMode') { rmSync(MARKER, { force: true }); process.exit(0); }
  if (tool !== 'ExitPlanMode') process.exit(0);
  const text = typeof p.tool_response === 'string' ? p.tool_response : JSON.stringify(p.tool_response ?? '');
  if (!/approved your plan/i.test(text)) process.exit(0);
  const m = /saved to:\s*(\S+?\.md)/.exec(text);
  const plan = m ? m[1].replace(/\\n.*$/, '') : '';
  if (!plan || !existsSync(plan)) process.exit(0);          // no plan file named: no marker
  mkdirSync(dirname(MARKER), { recursive: true });
  writeFileSync(MARKER, JSON.stringify({ plan, hash: hashOf(plan), at: new Date().toISOString(), via: 'ExitPlanMode approval' }, null, 1));
  process.exit(0);
}

// ---- PreToolUse ----
const deny = (why) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `${why} ${RULE}` } }));
  process.exit(2);
};

if (p.permission_mode === 'plan') process.exit(0);           // plan-guard.mjs owns plan mode
if (tool === 'EnterPlanMode' || tool === 'ExitPlanMode') process.exit(0);

// THE MARKER IS THE OWNER'S. Naming it anywhere in a tool's input is refused,
// except the command that removes it.
const input = JSON.stringify(p.tool_input ?? {});
if (input.includes('APPROVED-PLAN')) {
  const cmd = String(p.tool_input?.command ?? '');
  if (!(tool === 'Bash' && /approved-plan-guard\.mjs\s+--done\b/.test(cmd) && !/[;&|`$]/.test(cmd.replace(/approved-plan-guard\.mjs\s+--done/, '')))) {
    deny('The approval marker is written only by the owner\'s approval of a plan.');
  }
  process.exit(0);
}

// Is it a write? Ask plan-guard.mjs, with the mode forced to plan. A Workflow
// launches writing agents and plan-guard does not name it, so it is a write.
let write = tool === 'Workflow';
if (!write) {
  const pg = join(HERE, 'plan-guard.mjs');
  const r = spawnSync('node', [pg], { input: JSON.stringify({ ...p, permission_mode: 'plan' }), encoding: 'utf8', cwd: p.cwd || process.cwd() });
  write = r.status === 2 || r.error !== undefined;
}
if (!write) process.exit(0);

if (!existsSync(MARKER)) deny('No approved plan is in force, and this action changes something.');
let mk = {};
try { mk = JSON.parse(readFileSync(MARKER, 'utf8')); } catch { deny('The approval marker is unreadable.'); }
if (!mk.plan || !existsSync(mk.plan)) deny('The approved plan file is gone.');
if (hashOf(mk.plan) !== mk.hash) deny(`The plan file ${mk.plan} has changed since it was approved; a changed plan needs approving again.`);
process.exit(0);
