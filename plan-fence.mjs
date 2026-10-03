#!/usr/bin/env node
/**
 * AN AGENT WORKS INSIDE THE PLAN THE OWNER APPROVED, AND NOWHERE ELSE (Doctrine §0e).
 *
 * The main thread may not work (the manager fence in hook-dispatch.mjs), so the
 * work is done by agents, and an agent's reach is what the owner actually
 * approved: the plan's `## Files…` section and its `## Commands` section. An
 * approved plan is a ceiling; this is the ceiling, enforced per call.
 *
 * PreToolUse, run by hook-dispatch.mjs, for EVERY call a subagent makes (a
 * payload carrying `agent_id`). A call passes only as one of five things;
 * anything else is refused:
 *
 *   its own return (SubagentHandback, StructuredOutput)
 *   its own TaskStop, so it can stop what it started (Doctrine §11d)
 *   a read, as plan-guard.mjs classifies one (never an Agent, Task,
 *       SendMessage, Workflow or plan-mode call)
 *   Write, Edit, MultiEdit, NotebookEdit
 *       the target must be under a path the Files section names FOR ITS REPO
 *       (a line's label — "Hub", "JPS" — ties its entries to one repository),
 *       or an absolute entry, or in this session's scratchpad. The live gate
 *       copy at ~/.claude/hub is never written, whatever the plan names.
 *   Bash
 *       the line is split where a new command starts — `&&`, `||`, `;`, `|`,
 *       `&` and newlines, as reply-guard.mjs's `commandsIn` splits it, which
 *       also opens `$( )`, backticks, `sh -c` and `eval`. A segment that is a
 *       `cd` (or `pushd`, `popd`), at any depth, is refused before anything
 *       else is judged: every path is written in full.
 *       `git -C <dir>` in a segment is set aside before matching. Every
 *       segment must then be a reader as plan-guard.mjs classifies one, or begin
 *       with an entry of the Commands section. Every redirect writes a file, so
 *       its target is held to the same rule as a Write; process substitution
 *       runs a command nothing here can classify, and is refused.
 *
 * The plan is the approval marker's, and only while its hash still matches
 * (hook-dispatch.mjs `approvedPlan`); without one, only reads, the return and
 * the scratchpad pass.
 *
 *   node plan-fence.mjs     (payload on stdin; exit 2 refuses, reason on stderr)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join, relative, normalize, isAbsolute } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { approvedPlan, planFiles, planCommands, inScratchpad, planGuardReads, isRead, labelNames, AGENT_RETURN } from './hook-dispatch.mjs';
import { commandsIn, heredocs } from './reply-guard.mjs';

const SELF = fileURLToPath(import.meta.url);
const WRITES = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const HARMLESS = new Set(['/dev/null', '/dev/stdout', '/dev/stderr']);
const HEAD = 'PLAN FENCE (Doctrine §0e): an agent works only inside the approved plan — its Files list, its Commands, readers, and the session scratchpad.';

/**
 * Is a path inside the live gate copy?
 * @param {string} abs  an absolute path.
 * @returns {boolean} true for ~/.claude/hub and anything below it: the clone
 *   every gate runs from, which an agent never writes, so no edit can loosen
 *   the gates that hold it.
 */
export function inLiveHub(abs) {
  const hub = resolve(homedir(), '.claude', 'hub');
  const t = resolve(String(abs));
  return t === hub || t.startsWith(hub + '/');
}

/**
 * The repository a path belongs to.
 * @param {string} path  an absolute path; it need not exist yet.
 * @returns {string|null} the nearest ancestor holding `.git`, or null.
 */
function gitRoot(path) {
  let d = dirname(resolve(path));
  for (;;) {
    if (existsSync(join(d, '.git'))) return d;
    const up = dirname(d);
    if (up === d) return null;
    d = up;
  }
}

/**
 * Is a path one the plan's Files section names?
 * @param {string} target  an absolute path.
 * @param {{repo: string|null, path: string}[]} files  from `planFiles`.
 * @returns {boolean} false for anything in the live gate copy (`inLiveHub`).
 *   Otherwise true when the target equals or lies below a named absolute path,
 *   or when its repository is the one the entry's label names (`labelNames`)
 *   and, relative to that repo's root, the target equals a named file or lies
 *   strictly below a named directory (`src/`). A relative entry with no label,
 *   or a label naming no repo, allows nothing; a path outside every repo
 *   matches only an absolute entry.
 */
export function underFiles(target, files) {
  if (inLiveHub(target)) return false;
  const root = gitRoot(target);
  const rel = root ? relative(root, target) : null;
  return files.some(({ repo, path: f }) => {
    if (isAbsolute(f)) { const r = resolve(f); return f.endsWith('/') ? target.startsWith(r + '/') : target === r; }
    if (rel === null || rel === '' || rel.startsWith('..') || !labelNames(repo, root)) return false;
    const nf = normalize(f);
    return f.endsWith('/') ? rel.startsWith(nf) && rel.length > nf.length : rel === nf;
  });
}

/**
 * Every file a command line redirects into.
 * @param {string} cmd  a Bash line, heredoc bodies already taken out.
 * @returns {{targets: string[], proc: boolean}} the target of every `>`, `>>`,
 *   `>|`, `&>` and `>&file` outside quotes (a `>&2`-style descriptor copy is not
 *   a file), and whether `<(`/`>(` process substitution appears. A redirect
 *   inside a substitution is found by `judge` from that command's own words.
 */
export function redirectTargets(cmd) {
  const s = String(cmd ?? '');
  const targets = [];
  let proc = false;
  const skipDouble = (k) => { k++; while (k < s.length && s[k] !== '"') { if (s[k] === '\\') k++; k++; } return k; };
  const readWord = (j) => {
    let w = '';
    while (j < s.length && (s[j] === ' ' || s[j] === '\t')) j++;
    while (j < s.length && !/[\s;&|<>()]/.test(s[j])) {
      if (s[j] === "'") { const e = s.indexOf("'", j + 1); const k = e < 0 ? s.length : e; w += s.slice(j + 1, k); j = k + 1; continue; }
      if (s[j] === '"') { const k = skipDouble(j); w += s.slice(j + 1, k).replace(/\\(.)/g, '$1'); j = k + 1; continue; }
      if (s[j] === '\\') { w += s[j + 1] ?? ''; j += 2; continue; }
      w += s[j]; j++;
    }
    return [w, j];
  };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') { i++; continue; }
    if (c === "'") { const e = s.indexOf("'", i + 1); i = e < 0 ? s.length : e; continue; }
    if (c === '"') { i = skipDouble(i); continue; }
    if ((c === '<' || c === '>') && s[i + 1] === '(') { proc = true; continue; }
    if (c !== '>') continue;
    let j = i + 1;
    if (s[j] === '>' || s[j] === '|') j++;
    if (s[j] === '&') {
      const m = /^&(\d+|-)/.exec(s.slice(j));
      if (m) { i = j + m[0].length - 1; continue; }
      j++;
    }
    const [w, end] = readWord(j);
    targets.push(w);
    i = Math.max(i, end - 1);
  }
  return { targets, proc };
}

/**
 * Take the redirections out of one command's words.
 * @param {string[]} words  as `commandsIn` gives them, quoting removed.
 * @returns {{words: string[], targets: string[]}} the words that name the
 *   program and its arguments, and every output redirect's target among them.
 *   A quoted argument that reads `>` is taken for a redirect, which refuses
 *   rather than allows.
 */
export function stripRedirects(words) {
  const out = [];
  const targets = [];
  for (let i = 0; i < words.length; i++) {
    const w = String(words[i]);
    const o = /^(?:\d*|&)>(?:>|\|)?(.*)$/.exec(w);
    if (o) {
      let t = o[1];
      if (t === '') t = words[++i] ?? '';
      if (!/^&(\d+|-)$/.test(t)) targets.push(t.replace(/^&/, ''));
      continue;
    }
    const n = /^\d*<(?:<<?|&)?-?(.*)$/.exec(w);
    if (n) { if (n[1] === '') i++; continue; }
    out.push(w);
  }
  return { words: out, targets };
}

const quote = (w) => (/^[A-Za-z0-9_./:=@%+,-]+$/.test(w) ? w : `'${String(w).replace(/'/g, `'\\''`)}'`);
const nw = (x) => (x.startsWith('-') ? x : normalize(x));

/**
 * Does a command begin with an entry of the plan's Commands section?
 * @param {string[]} words  the command's words, redirections and `git -C` removed.
 * @param {string[]} entries  from `planCommands`.
 * @param {string} cwd  the directory it runs in.
 * @returns {boolean} true when the words open with an entry's words; an entry
 *   whose last word ends in `/` (`node tools/`) takes a file strictly below
 *   that directory, so `tools/../x.mjs` is not under it.
 */
export function beginsWithEntry(words, entries, cwd) {
  const pathUnder = (word, dir) => {
    const target = resolve(cwd, String(word ?? ''));
    if (isAbsolute(dir)) { const d = resolve(dir) + '/'; return target.startsWith(d); }
    const nd = normalize(dir);
    const root = gitRoot(target);
    return [relative(cwd, target), ...(root ? [relative(root, target)] : [])]
      .some((r) => !r.startsWith('..') && !isAbsolute(r) && r.startsWith(nd) && r.length > nd.length);
  };
  return entries.some((e) => {
    const ew = e.split(/\s+/).filter(Boolean);
    if (!ew.length || words.length < ew.length) return false;
    return ew.every((x, k) => (k > 0 && k === ew.length - 1 && x.endsWith('/') ? pathUnder(words[k], x) : nw(String(words[k])) === nw(x)));
  });
}

/**
 * Decide one subagent call.
 * @param {object} p  the PreToolUse payload.
 * @param {{plan?: {path: string, text: string}|null, classify?: (cmd: string, cwd: string) => boolean, reads?: (p: object) => boolean}} [opts]
 *   the approved plan, the Bash reader classifier and the classifier for any
 *   other tool, for the test; by default the approval marker's plan (while its
 *   hash holds) and plan-guard.mjs.
 * @returns {string|null} null for a main-thread call, for the agent's own
 *   return and its TaskStop, for a read, and for a write or Bash line inside
 *   the plan; every other call is refused, a tool this file has never heard of
 *   included, and a Bash line holding a cd at any depth is refused naming the
 *   cd.
 *   hook-dispatch.mjs latches the session on the refusal.
 */
export function decide(p, opts = {}) {
  if (!p.agent_id) return null;
  const tool = String(p.tool_name ?? '');
  if (AGENT_RETURN.has(tool)) return null;
  // AN AGENT STOPS WHAT IT STARTED (Doctrine §11d): a background command or
  // task it launched must not outlive it, and refusing the stop would latch
  // the agent with the process still running.
  if (tool === 'TaskStop') return null;
  const plan = 'plan' in opts ? opts.plan : approvedPlan();
  const where = plan ? `the plan at ${plan.path}` : 'no approved plan (so only readers and the scratchpad)';
  if (!WRITES.has(tool) && tool !== 'Bash') {
    if (isRead(p, opts.reads)) return null;
    return `${HEAD} ${tool} is not a read, a write the Files list allows, a Commands entry or the agent's own return, under ${where}.`;
  }
  const files = plan ? planFiles(plan.text) : [];
  const cmds = plan ? planCommands(plan.text) : [];
  const input = p.tool_input ?? {};
  const allowedPath = (abs) => HARMLESS.has(abs) || inScratchpad(abs, p.session_id) || underFiles(abs, files);

  if (WRITES.has(tool)) {
    const f = String(input.file_path ?? input.notebook_path ?? '');
    const abs = resolve(p.cwd || process.cwd(), f);
    if (f && allowedPath(abs)) return null;
    if (f && inLiveHub(abs)) return `${HEAD} ${tool} to ${f} is in the live gate copy, which an agent never writes.`;
    return `${HEAD} ${tool} to ${f || '(no path)'} is outside the Files list of ${where} for its repo, and outside the scratchpad.`;
  }

  const classify = opts.classify ?? ((cmd, cwd) => planGuardReads({ ...p, tool_name: 'Bash', tool_input: { command: cmd }, cwd }));
  const shell = heredocs(String(input.command ?? '')).shell;
  const cwd = resolve(p.cwd || process.cwd());
  const segs = commandsIn(shell);
  // NO cd, ANYWHERE: every path is written in full, so what a command touches
  // can be read off its own words. Judged over every segment before any other,
  // so a cd inside `sh -c` or `$( )` is refused AS a cd rather than as the
  // command that carries it, which is the refusal that names the remedy.
  for (const s of segs) {
    const words = stripRedirects(s.words).words;
    const prog = String(words[0] ?? '').replace(/^\(+/, '');
    if (prog === 'cd' || prog === 'pushd' || prog === 'popd') {
      return `${HEAD} "${words.join(' ').slice(0, 160)}" is a ${prog}, and a ${prog} is refused: write every path in full.`;
    }
  }
  const red = redirectTargets(shell);
  if (red.proc) return `${HEAD} Process substitution runs a command nothing here can classify.`;
  const targets = [...red.targets];
  for (const s of segs) {
    const { words, targets: t } = stripRedirects(s.words);
    targets.push(...t);
    if (!words.length) continue;
    let w = words;
    let segCwd = cwd;
    if (w[0] === 'git') while (w[1] === '-C' && w[2] != null) { segCwd = resolve(segCwd, w[2]); w = [w[0], ...w.slice(3)]; }
    if (beginsWithEntry(w, cmds, segCwd)) continue;
    if (classify(w.map(quote).join(' '), segCwd)) continue;
    return `${HEAD} "${w.join(' ').slice(0, 160)}" is neither a reader nor an entry of the Commands in ${where}.`;
  }
  for (const t of targets) {
    const abs = resolve(cwd, t);
    if (!allowedPath(abs)) return `${HEAD} A redirect writes ${abs}, which is outside the Files list of ${where}, and outside the scratchpad.`;
  }
  return null;
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  let p = {};
  try { p = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }
  let why = null;
  try { why = decide(p); } catch (e) { process.stderr.write(`plan-fence: ${e?.message ?? e}\n`); process.exit(1); }
  if (why) { process.stderr.write(why + '\n'); process.exit(2); }
  process.exit(0);
}
