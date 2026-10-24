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
 * payload carrying `agent_id`). THE RULES COME FIRST (`rulesFirst`): until the
 * agent's own transcript holds a Read of the shared rules file that was not
 * refused, nothing runs but that Read, a Read of the approved plan (or of the
 * steps file beside it), which is what names the rules file to an agent sent only
 * the plan's path and a step number, its return, its TaskStop and a progress
 * note or report in the scratchpad (`agentReportWrite`). An agent started by a
 * Workflow keeps its transcript under `subagents/workflows/<run>/`, and is found
 * there as well (`agentTranscriptPath`). Then a call passes
 * only as one of five things; anything else is refused:
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
 * AN AGENT SENT FOR THE PLAN'S REVIEW STEP WRITES IN THE SCRATCHPAD AND NOWHERE ELSE (`reviewWriteProblem`, LESSONS §423).
 * The approval marker records which steps are the plan's review steps; the agent's own transcript says which step it was sent
 * for. For that agent a Write, Edit, MultiEdit or NotebookEdit outside the session scratchpad, a Bash line that redirects output
 * outside it, and a Bash line with a git segment that is not a reader are refused with a refusal naming the review step,
 * whatever the Files list and the Commands list allow.
 *
 *   node plan-fence.mjs     (payload on stdin; exit 2 refuses, reason on stderr)
 */
import { readFileSync, existsSync, openSync, readSync, closeSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative, normalize, isAbsolute } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { approvedPlan, planFiles, planCommands, inScratchpad, planGuardReads, isRead, labelNames, AGENT_RETURN, agentReportWrite } from './hook-dispatch.mjs';
import { commandsIn, heredocs } from './reply-guard.mjs';
import { agentTranscriptPath, agentStep, stepsFilePath, RULES_FILE } from './report.mjs';

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
 * The agent's own transcript.
 * @param {object} p  a subagent's PreToolUse payload.
 * @returns {string|null} `agentTranscriptPath` in report.mjs: `<main transcript without
 *   .jsonl>/subagents/agent-<agent id>.jsonl` when the payload names the main transcript
 *   and the file is there, else the same file found through the session id; in either
 *   place also one level below `workflows/<run>/`, where the agents of a Workflow keep
 *   theirs, so an agent a script starts is judged by its own Read of the rules and not
 *   refused for having no transcript. null when none is found.
 */
function agentTranscript(p) {
  return agentTranscriptPath(p);
}

/**
 * The first entries of an agent's transcript.
 * @param {string} path  the agent's transcript.
 * @param {number} bytes  how much of the file's start to read.
 * @returns {object[]} the entries in the first `bytes` of the file, in file order; a
 *   line cut by the limit or torn is left out; [] when the file cannot be read. The
 *   Read of the rules is an agent's FIRST call, so it sits at the start of its
 *   transcript, and a read of the END of the file (a tail) would lose it as soon as
 *   the agent had printed a few megabytes, which would refuse an agent mid-step.
 */
function headEntries(path, bytes) {
  let fd;
  try {
    fd = openSync(path, 'r');
    const buf = Buffer.alloc(bytes);
    const n = readSync(fd, buf, 0, bytes, 0);
    const lines = buf.toString('utf8', 0, n).split('\n');
    if (n === bytes) lines.pop();
    const out = [];
    for (const l of lines) {
      if (!l) continue;
      try { out.push(JSON.parse(l)); } catch { /* a torn line */ }
    }
    return out;
  } catch { return []; } finally { if (fd !== undefined) closeSync(fd); }
}

/**
 * Every entry of an agent's transcript.
 * @param {string} path  the agent's transcript.
 * @returns {object[]} all the entries in the file, in file order, however large it is; a torn line is
 *   left out; [] when the file cannot be read. THE RULES-FIRST CHECK READS THIS, NOT A WINDOW: the harness
 *   writes about four hundred kilobytes before an agent's first call, so a Read of the rules made after the
 *   agent's first message lands past a window of the file's start, and an agent that had read them was
 *   refused for it (Q-HUB-46, measured on 20 October). The window is kept as the fast path in `rulesFirst`.
 */
function wholeEntries(path) {
  try { return headEntries(path, statSync(path).size + 1); } catch { return []; }
}

/**
 * Has the agent read the shared rules?
 * @param {object[]} entries  the agent's transcript, in file order.
 * @param {Set<string>} files  the rules files that count (absolute paths).
 * @returns {boolean} true when the agent issued a Read of one of `files` whose result,
 *   if one has been written, is not an error. A Read that is refused or fails does not
 *   count, and a call that merely names the file does not either.
 */
export function rulesWereRead(entries, files) {
  const asked = new Set();
  const failed = new Set();
  for (const e of entries ?? []) {
    const c = e?.message?.content;
    if (!Array.isArray(c)) continue;
    for (const b of c) {
      if (e.type === 'assistant' && b?.type === 'tool_use' && b.name === 'Read' && files.has(resolve(String(b.input?.file_path ?? '')))) asked.add(b.id);
      if (e.type === 'user' && b?.type === 'tool_result' && b.is_error) failed.add(b.tool_use_id);
    }
  }
  return [...asked].some((id) => !failed.has(id));
}

/**
 * The mark of an agent's FIRST refusal for its first call, which sets no latch (lesson 415).
 * hook-dispatch.mjs skips the latch for a plan-fence refusal carrying it, and only for that one.
 */
export const FIRST_REFUSAL = 'RULES FIRST, NO LATCH:';

/**
 * Has the agent already been refused for the rules-first check?
 * @param {object[]} entries  the agent's transcript, in file order.
 * @returns {boolean} true when a refused call (an error result) names the rules-first
 *   refusal in its text. A plan or a rules file read back as a result is not an error and does not count.
 */
export function rulesRefusedBefore(entries) {
  for (const e of entries ?? []) {
    const c = e?.message?.content;
    if (!Array.isArray(c)) continue;
    for (const b of c) {
      if (e.type === 'user' && b?.type === 'tool_result' && b.is_error && /RULES FIRST/.test(JSON.stringify(b.content ?? ''))) return true;
    }
  }
  return false;
}

/**
 * THE RULES COME FIRST: an agent's first call is the Read of the shared rules file.
 * @param {object} p  a subagent's PreToolUse payload (not its return, not its TaskStop).
 * @param {{path: string}|null} [plan]  the approved plan, by the path the dispatch gate
 *   recorded (`approvedPlan`); read from the approval marker when omitted, and null
 *   when none is in force.
 * @returns {string|null} null for the Read of `agent-rules.md` (the live clone's or this
 *   hub's) itself, for the Read of the approved plan's file or of the steps file written
 *   beside it (`stepsFilePath`), for a latched agent writing its own report
 *   (`agentReportWrite`), and once the agent's own transcript holds a Read of the rules
 *   that was not refused; else the refusal, which names the file to read. With no
 *   transcript to look in the agent has read nothing, so the call is refused: a gate that
 *   cannot find what it checks fails shut and says so, never open.
 *   THE PLAN MAY BE READ BEFORE THE RULES, AND NOTHING ELSE MAY. An agent is sent only the
 *   plan's path and a step number, and the CLAUDE.md it is handed is the checkout's, so
 *   the plan is what names the rules file: every agent of a session read the plan first,
 *   and a fence that refused that Read would have latched each of them at its first call.
 *   The Read of the rules stays required before any other call. Doctrine §0e rule 13.
 */
export function rulesFirst(p, plan = approvedPlan()) {
  if (agentReportWrite(p)) return null;
  const files = new Set([resolve(homedir(), '.claude', 'hub', RULES_FILE), resolve(dirname(SELF), RULES_FILE)]);
  const tool = String(p.tool_name ?? '');
  const reads = tool === 'Read' ? resolve(p.cwd || process.cwd(), String(p.tool_input?.file_path ?? '')) : '';
  if (tool === 'Read' && files.has(reads)) return null;
  const planFiles = plan?.path ? new Set([resolve(String(plan.path)), resolve(stepsFilePath(String(plan.path)))]) : new Set();
  if (tool === 'Read' && planFiles.has(reads)) return null;
  const f = agentTranscript(p);
  // The start of the transcript first, which is where an agent's first call is and costs a small read; a Read of
  // the rules made after the agent's first message can lie past it (the harness writes about four hundred
  // kilobytes before the first call), so when the window does not show it the WHOLE transcript is read (Q-HUB-46).
  if (f && rulesWereRead(headEntries(f, 512 * 1024), files)) return null;
  const entries = f ? wholeEntries(f) : [];
  if (f && rulesWereRead(entries, files)) return null;
  // THE FIRST REFUSAL SETS NO LATCH (lesson 415): only the agent's first refusal of this kind carries
  // FIRST_REFUSAL; one after it does not, and latches as every refusal does.
  const first = !!f && !rulesRefusedBefore(entries);
  const rulesPath = resolve(homedir(), '.claude', 'hub', RULES_FILE);
  return `${HEAD} ${first ? FIRST_REFUSAL : 'RULES FIRST:'} an agent's first call is a Read of ${rulesPath}, and no other call runs before it, so ${tool || 'this call'} is refused. `
    + `${f ? 'Its own transcript holds no Read of that file that was not refused.' : 'No transcript of this agent was found to show that it was read.'} `
    + (first
      ? `This refusal sets no latch, and it is not the refusal the rules' line on refusals means: your next call is the Read tool on ${rulesPath}, and then you do the step with every file read through the Read or Grep tool.`
      : 'Read the file, then do the step; at any refusal, stop and hand back REFUSED.');
}

/**
 * The plan step an agent was sent for.
 * @param {object} p  a subagent's PreToolUse payload.
 * @returns {number|null} the step number in the first prompt of the agent's own transcript (`agentStep` in report.mjs: the plan's
 *   path, or its steps file's, and a step number, the only prompt the dispatch gate lets through); null when the transcript is not
 *   found or the prompt is anything else.
 */
export function agentSentStep(p) {
  try { const f = agentTranscript(p); return f ? agentStep(f) : null; } catch { return null; }
}

/**
 * THE REVIEW STEP CHANGES NOTHING OUTSIDE THE SESSION SCRATCHPAD (Doctrine §0e rule 2, LESSONS §423).
 * The review follows aim-review.md and "changes nothing": its hand-back is the verdict and the one script it runs prints the
 * owner's messages. An agent's reach is the plan's Files and Commands, so nothing stopped a review agent whose step the Files list
 * happened to cover from writing in a repository; the sentence in the file was the only fence. The approval marker records which
 * steps are the plan's review steps (`review`, from `aimReviewSteps` at approval), and this reads which step an agent was sent for.
 * @param {object} p  a subagent's PreToolUse payload.
 * @param {{review?: number[]|null}|null} plan  the plan in force, with the review step numbers its approval recorded.
 * @param {{step?: number|null, classify?: (cmd: string, cwd: string) => boolean}} [opts]  the step the agent was sent for in place of
 *   reading it from the agent's transcript, and the Bash reader classifier, for the test.
 * @returns {string|null} null for a main-thread call, for a plan whose approval recorded no review step, for an agent not sent for
 *   a recorded review step (or whose step cannot be read), and for a call that is not a write or a Bash line. Otherwise the
 *   refusal, which names the review step, for: a Write, Edit, MultiEdit or NotebookEdit whose target is not in this session's
 *   scratchpad; a Bash line that redirects output to a file outside it, or runs process substitution; and a Bash line with a git
 *   segment plan-guard does not classify as a reader (a commit, a push, an add, a fetch, a checkout: a git command that writes).
 *   The Files list and the Commands list are not consulted: whatever the plan allows, the review writes in the scratchpad only. THE
 *   INVARIANT `decide` relies on: a review agent's reads, its scratchpad writes (its progress note, its report, its owner-messages
 *   script) and its readers pass, so the review can do the one job its file gives it.
 */
export function reviewWriteProblem(p, plan, opts = {}) {
  if (!p.agent_id || !plan || !Array.isArray(plan.review) || !plan.review.length) return null;
  const tool = String(p.tool_name ?? '');
  if (!WRITES.has(tool) && tool !== 'Bash') return null;
  const step = 'step' in opts ? opts.step : agentSentStep(p);
  if (!Number.isInteger(step) || !plan.review.includes(step)) return null;
  const why = `${HEAD} REVIEW STEP: this agent was sent for step ${step}, which the approval recorded as the plan's review step, and a review changes nothing outside the session scratchpad, whatever the plan's Files list allows;`;
  const cwd = resolve(p.cwd || process.cwd());
  const inside = (abs) => HARMLESS.has(abs) || inScratchpad(abs, p.session_id);
  if (WRITES.has(tool)) {
    const f = String(p.tool_input?.file_path ?? p.tool_input?.notebook_path ?? '');
    return f && inside(resolve(cwd, f)) ? null : `${why} ${tool} to ${f || '(no path)'} is a write outside it.`;
  }
  const shell = heredocs(String(p.tool_input?.command ?? '')).shell;
  const red = redirectTargets(shell);
  if (red.proc === true) return `${why} process substitution runs a command nothing here can classify.`;
  const classify = opts.classify ?? ((cmd, at) => planGuardReads({ ...p, tool_name: 'Bash', tool_input: { command: cmd }, cwd: at }));
  const targets = [...red.targets];
  for (const s of commandsIn(shell)) {
    const { words, targets: t } = stripRedirects(s.words);
    targets.push(...t);
    let w = words;
    let at = cwd;
    while (w[0] === 'git' && w[1] === '-C' && w[2] != null) { at = resolve(at, w[2]); w = [w[0], ...w.slice(3)]; }
    if (w[0] === 'git' && !classify(w.map(quote).join(' '), at)) return `${why} "${w.join(' ').slice(0, 160)}" is a git command that writes.`;
  }
  const out = targets.map((t) => resolve(cwd, t)).find((abs) => !inside(abs));
  return out ? `${why} a redirect writes ${out}, outside it.` : null;
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
  // THE RULES COME FIRST: until the agent has read the shared rules, nothing else runs.
  const plan = 'plan' in opts ? opts.plan : approvedPlan();
  const first = 'rules' in opts ? opts.rules(p) : rulesFirst(p, plan);
  if (first) return first;
  // THE REVIEW STEP WRITES IN THE SCRATCHPAD AND NOWHERE ELSE, whatever the Files list allows (`reviewWriteProblem`; LESSONS §423).
  const review = reviewWriteProblem(p, plan, { ...('step' in opts ? { step: opts.step } : {}), ...(opts.classify ? { classify: opts.classify } : {}) });
  if (review) return review;
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
