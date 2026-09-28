#!/usr/bin/env node
/**
 * EVERY GATE RUNS, HOWEVER THE SESSION WAS LAUNCHED (LESSONS §370).
 *
 * Claude Code loads project hooks only from the directory a session starts in.
 * A cloud session with two repos attached starts in their PARENT, which has no
 * settings, so for a whole session of 543 Stop events not one of the owner's
 * hooks ran — plan-guard, stop-guard, ident-guard, harness-guard, the ledger
 * and the session brief were all dead, and every rule rested on memory.
 *
 * This is wired ONCE, at user level, by the cloud environment's setup script:
 *
 *   node hook-dispatch.mjs --install   writes ~/.claude/settings.json so every
 *                                      event below calls this file
 *   node hook-dispatch.mjs <Event>     the hook itself; payload on stdin
 *
 * Per event it runs the hub's family guards, then each TOUCHED repo's own
 * `.claude/settings.json` hooks for that event with CLAUDE_PROJECT_DIR set to
 * that repo, exactly as Claude Code would have if the session had started
 * there. A touched repo is the one holding the path a tool names, or any repo
 * a Bash command names or runs in; when none is named, every repo. The repo
 * that IS the launch directory is skipped, because its hooks already run.
 *
 * The first refusal wins and comes back as exit 2 with its reason on stderr.
 * A crash here refuses everything except reads on PreToolUse: a dispatcher that
 * fails open is the dead-gate state this file exists to end.
 *
 * It runs from a stable clone (the setup script puts one at ~/.claude/hub), so
 * a broken edit in the working copy cannot refuse its own fix.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, createReadStream } from 'node:fs';
import { join, dirname, resolve, sep, basename } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const HUB = dirname(fileURLToPath(import.meta.url));
const EVENTS = ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'Stop'];
const READS = new Set(['Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'ToolSearch', 'TaskList', 'TaskGet',
  'ListAgents', 'ReadNotifications', 'EnterPlanMode', 'ExitPlanMode', 'Skill']);
// Repo shims that only call a hub script: run once per event, not once per repo.
const SHARED_SHIMS = new Set(['plan-guard.sh', 'stop-guard.sh']);
// The status command itself is always allowed, or the report clock could lock
// a session out of the one thing that unlocks it. A single quoted argument, no
// shell expansion, nothing chained.
const REPORT = /^\s*node\s+"?[^\s"]*report\.mjs"?\s+(["'])[^"'`$\\]*\1\s*$/;

/**
 * Write the user-level wiring.
 * @returns {string} the settings file written. Existing hooks from other
 *   sources are kept; any earlier hook-dispatch entry is replaced, so running
 *   it on every session start never stacks duplicates.
 */
export function install() {
  const file = join(homedir(), '.claude', 'settings.json');
  let s = {};
  try { s = JSON.parse(readFileSync(file, 'utf8')); } catch { /* none yet */ }
  s.hooks ??= {};
  for (const ev of EVENTS) {
    const kept = (s.hooks[ev] ?? []).filter((g) => !JSON.stringify(g).includes('hook-dispatch.mjs'));
    kept.push({ matcher: '', hooks: [{ type: 'command', command: `node "${join(HUB, 'hook-dispatch.mjs')}" ${ev}`, timeout: 120 }] });
    s.hooks[ev] = kept;
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(s, null, 2) + '\n');
  return file;
}

/**
 * The repos this session can touch.
 * @param {string} root  the launch directory.
 * @returns {string[]} absolute repo roots under it (itself included when it is
 *   one), minus a launch-directory repo whose own settings already run.
 */
export function reposUnder(root) {
  const out = [];
  let names = [];
  try { names = readdirSync(root); } catch { /* unreadable */ }
  for (const d of [root, ...names.map((n) => join(root, n))]) {
    if (!existsSync(join(d, '.git'))) continue;
    if (d === root && existsSync(join(d, '.claude', 'settings.json'))) continue;
    out.push(resolve(d));
  }
  return out;
}

/**
 * Which repos an event touches.
 * @param {string} event  the hook event.
 * @param {object} p      the payload.
 * @param {string[]} all  from `reposUnder`.
 * @returns {string[]} the repos whose hooks run; every repo when the call
 *   names none, so an unplaced call is checked by everything, never nothing.
 */
export function touched(event, p, all) {
  if (event !== 'PreToolUse') return all;          // PostToolUse: every repo's ledger records every result
  const ti = p.tool_input ?? {};
  const paths = [ti.file_path, ti.path, ti.notebook_path].filter((x) => typeof x === 'string' && x);
  if (p.tool_name === 'Bash') {
    if (p.cwd) paths.push(p.cwd);
    for (const m of String(ti.command ?? '').matchAll(/(?:^|[\s'"=(])(\/[^\s'";|&)]+)/g)) paths.push(m[1]);
  }
  const hit = all.filter((r) => paths.some((x) => { const a = resolve(x); return a === r || a.startsWith(r + sep); }));
  return hit.length ? hit : all;
}

/**
 * Does a settings matcher select this event?
 * @param {string} event  the hook event.
 * @param {string|undefined} m  the group's matcher.
 * @param {object} p      the payload.
 * @returns {boolean} tool events match on tool name, SessionStart on source.
 */
function matches(event, m, p) {
  if (!m || m === '*') return true;
  const subject = event === 'SessionStart' ? (p.source ?? '') : (p.tool_name ?? '');
  if (event !== 'PreToolUse' && event !== 'PostToolUse' && event !== 'SessionStart') return true;
  try { return new RegExp(`^(?:${m})$`).test(subject); } catch { return m === subject; }
}

/**
 * Read one hook run's outcome.
 * @param {object} r  a spawnSync result.
 * @returns {{deny: boolean, reason: string, out: string}} a refusal is exit 2
 *   or a JSON decision of deny/block, the two shapes the family's hooks use.
 */
function outcome(r) {
  const out = r.stdout ?? '', err = r.stderr ?? '';
  let j = null;
  try { j = JSON.parse(out.trim()); } catch { /* plain text */ }
  const jsonDeny = j?.hookSpecificOutput?.permissionDecision === 'deny' || j?.decision === 'block';
  if (r.status === 2 || jsonDeny) {
    const reason = j?.hookSpecificOutput?.permissionDecisionReason || j?.reason || err.trim() || out.trim() || 'refused';
    return { deny: true, reason, out };
  }
  return { deny: false, reason: '', out };
}

/**
 * Run one command as a hook.
 * @returns {{deny: boolean, reason: string, out: string}} see `outcome`.
 */
function run(command, raw, projectDir, timeoutS = 60) {
  const r = spawnSync('bash', ['-c', command], {
    input: raw, cwd: projectDir, encoding: 'utf8', timeout: timeoutS * 1000,
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
  });
  if (r.error) return { deny: false, reason: '', out: '', error: r.error.message };
  return outcome(r);
}

/**
 * Every tool name used earlier in the session, with counts — printed after a
 * compaction, because a summary dropped the Drive connector's download and the
 * session then told the owner a folder could not be read.
 * @param {string} path  the transcript.
 * @returns {Promise<string>} one line per tool, most used first.
 */
async function toolCensus(path) {
  const counts = new Map();
  const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.includes('"tool_use"')) continue;
    for (const m of line.matchAll(/"type":"tool_use","id":"[^"]*","name":"([^"]+)"/g)) counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]).map(([n, c]) => `  ${n} x${c}`).join('\n');
}

const REMINDER = [
  'OWNER MESSAGE (LESSONS §370). Before any tool call, reply to EVERY point in it.',
  'If it says something was done wrong: answer it, and run nothing else this turn.',
  'First line: what you are doing now and what comes next. A status at least every five minutes',
  `(done, running, next, next status time), in chat AND via node ${join(HUB, 'report.mjs')} "...".`,
  'End: done, not done, found and not fixed, open for the owner. Never "waiting on you". No app notifications.',
].join('\n');

async function main(event, raw, p) {
  const root = resolve(process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd());
  const printed = [];

  // ---- family guards ----
  if (event === 'PreToolUse') {
    if (p.tool_name === 'Bash' && REPORT.test(String(p.tool_input?.command ?? ''))) return 0;
    for (const g of [`node "${join(HUB, 'report.mjs')}" --gate`, `node "${join(HUB, 'drive-guard.mjs')}" "${root}"`,
      `node "${join(HUB, 'approved-plan-guard.mjs')}"`]) {
      const o = run(g, raw, root);
      if (o.deny) { process.stderr.write(o.reason + '\n'); return 2; }
    }
  }
  if (event === 'PostToolUse' && /PlanMode$/.test(p.tool_name ?? '')) run(`node "${join(HUB, 'approved-plan-guard.mjs')}" --mark`, raw, root);
  if (event === 'UserPromptSubmit') printed.push(REMINDER);
  if (event === 'SessionStart' && p.source === 'compact' && p.transcript_path) {
    printed.push('AFTER COMPACTION: every tool used earlier in this session still exists. Try each route before reporting a limit (LESSONS §370).\n'
      + await toolCensus(p.transcript_path));
  }

  // ---- each touched repo's own hooks ----
  const ran = new Set();
  for (const repo of touched(event, p, reposUnder(root))) {
    let s = {};
    try { s = JSON.parse(readFileSync(join(repo, '.claude', 'settings.json'), 'utf8')); } catch { continue; }
    for (const g of s.hooks?.[event] ?? []) {
      if (!matches(event, g.matcher, p)) continue;
      for (const h of g.hooks ?? []) {
        if (h.type !== 'command' || !h.command) continue;
        const shim = basename(String(h.command).split(/\s+/)[0]);
        let command = h.command;
        if (SHARED_SHIMS.has(shim)) {
          // Run the hub's canonical script, never a repo's copy of the shim: a
          // repo branch can carry a stale shim (JPS main's piped into `exec`
          // and refused every plan-mode call), and the hub clone is current.
          if (ran.has(shim)) continue;
          ran.add(shim);
          command = `node "${join(HUB, shim.replace(/\.sh$/, '.mjs'))}"`;
        }
        const o = run(command, raw, repo, h.timeout ?? 60);
        if (o.deny) { process.stderr.write(o.reason + '\n'); return 2; }
        if (o.out.trim() && (event === 'SessionStart' || event === 'UserPromptSubmit')) printed.push(o.out.trim());
      }
    }
  }
  if (printed.length) process.stdout.write(printed.join('\n\n') + '\n');
  return 0;
}

if (process.argv[1] && process.argv[1].endsWith('hook-dispatch.mjs')) {
  const event = process.argv[2];
  if (event === '--install') { console.log(`hook-dispatch: wired ${EVENTS.join(', ')} in ${install()}`); process.exit(0); }
  let raw = '';
  try { raw = readFileSync(0, 'utf8'); } catch { /* no payload */ }
  let p = {};
  try { p = JSON.parse(raw); } catch { /* treated below */ }
  main(event, raw, p).then((code) => process.exit(code), (e) => {
    if (event === 'PreToolUse' && !READS.has(p.tool_name ?? '')) {
      process.stderr.write(`hook-dispatch.mjs failed (${e?.message ?? e}); only reads run until it is fixed.\n`);
      process.exit(2);
    }
    process.stderr.write(`hook-dispatch.mjs: ${e?.message ?? e}\n`);
    process.exit(0);
  });
}
