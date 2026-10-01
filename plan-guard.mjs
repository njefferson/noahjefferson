#!/usr/bin/env node
/**
 * PLAN MODE IS A REFUSAL NOW, NOT A SENTENCE (Doctrine §0d).
 *
 * ## What happened
 *
 * Plan mode reached a session as PROSE in the context window — "you MUST NOT
 * make any edits… this supercedes any other instructions" — and `Bash`,
 * `git merge` and `git push` all ran normally. Nothing failed. The only thing
 * standing between that paragraph and the `main` branch was compliance.
 *
 * Two failures stacked on 2026-09-10. The harness and the GUI DISAGREED about
 * the mode: `ExitPlanMode` returned "You are not in plan mode" and the harness
 * printed "You have exited plan mode. You can now make edits" while the GUI
 * still showed Plan. Then, on a later turn, the paragraph was simply ABSENT
 * from the context — and its absence was read as permission. A merge and a
 * push went to production.
 *
 * ## Why a hook and not a rule
 *
 * This is the THIRD time this family has escalated a paragraph into a
 * refusal, after `branch-guard.mjs` (refuses the commit) and `stop-guard.mjs`
 * (refuses the turn). `CLAUDE.md` wrote the reason before this gate existed:
 * **an instruction in a file never once refused the commit it forbade.**
 *
 * ## The contract, verified against the documentation before this was written
 *
 * A gate built on a guessed contract is a paragraph with a shebang. So:
 *   - `permission_mode` IS in the `PreToolUse` payload, and `"plan"` is one of
 *     its exact values. The hook reads the harness's LIVE state at the moment
 *     of the call, which is why it cannot desync the way the paragraph did.
 *   - **Exit code 2 blocks unconditionally**, ahead of any JSON. The
 *     `hookSpecificOutput.permissionDecision: "deny"` form carries the REASON.
 *     Both are emitted: the JSON says why, the exit code guarantees the stop.
 *   - Project-level `.claude/settings.json` hooks run with no trust step.
 *
 * ## Two independent triggers, because one cannot be trusted alone
 *
 * The payload's mode is exact. The `.claude/PLAN-LOCK` marker is the OWNER'S,
 * and holds if the field is ever renamed, if the payload shape changes, or if
 * the harness contradicts the GUI again. Either one denies.
 *
 * ## Read stdin ONCE
 *
 * The reference example for this API calls `jq` twice, each reading stdin. The
 * first consumes it; the second gets nothing, the mode check evaluates empty,
 * and the hook never fires — green, and measuring nothing. That is the same
 * class as this repo's spelling plant, which was an identity replace for three
 * releases and could not fail.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tailEntries, isOwnerMessage, seenInResults } from './transcript-tail.mjs';
import { parseRead } from './reply-guard.mjs';
import { homedir } from 'node:os';

// ONCE. See the header — two reads is how this gate would silently never fire.
const raw = readFileSync(0, 'utf8');
let p = {};
try { p = JSON.parse(raw); } catch { /* unparsable: fall through to deny */ }

const tool = p.tool_name ?? '';
const input = p.tool_input ?? {};
const cwd = p.cwd ?? process.cwd();

const planning = p.permission_mode === 'plan'
  || existsSync(join(cwd, '.claude', 'PLAN-LOCK'));
if (!planning) process.exit(0);

/**
 * The refusal SAYS WHY, and says what to do instead.
 *
 * A bare block reads as a transient error and invites a retry with a slightly
 * different command, which is the routing-around this gate exists to stop. It
 * names the rule and the one thing that actually lifts the mode.
 */
const deny = (why) => {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `PLAN MODE. ${why} Say so in plain text and stop (Doctrine §0d). `
        + 'Prose approval does not lift this — the mode does.',
    },
  }));
  process.exit(2);
};

// Editing the plan is the one thing plan mode is FOR. The plans directory is
// compared RESOLVED: a substring test passed any path that merely contained it.
const PLANS = resolve(homedir(), '.claude', 'plans');
if (tool === 'Write' || tool === 'Edit' || tool === 'NotebookEdit') {
  const f = String(input.file_path ?? '');
  if (f && dirname(resolve(f)) === PLANS) process.exit(0);
  deny(`${tool} to ${f || '(no path given)'} is a write.`);
}

// A SUBAGENT INHERITS NOTHING FROM THIS GATE. One carrying write tools is a
// hole straight through it — the parent asks, the child writes — so only the
// read-only types pass. `Explore` and `Plan` are read-only by definition;
// `claude-code-guide` carries Glob, Grep, Read, WebFetch and WebSearch.
if (tool === 'Task' || tool === 'Agent') {
  const t = String(input.subagent_type ?? '');
  if (['Explore', 'Plan', 'claude-code-guide'].includes(t)) process.exit(0);
  deny(`a "${t || 'general-purpose'}" subagent can write.`);
}

// MCP tools are NAMED for what they do, and the read verbs are a small closed
// set. Anything else — create, update, delete, merge, push, trigger — is
// refused by not matching, which is the safe direction.
//
// THE VERB SITS AT EITHER END, and the first version of this only looked at
// one. `mcp__github__get_commit` leads with it; `mcp__github__actions_get`,
// `actions_list` and `pull_request_read` trail it. So the read-only half of
// the GitHub server was refused — found by planting the gate rather than by
// reading it, which is the whole reason the plant exists.
//
// Still one-directional: `issue_write` and `actions_run_trigger` match at
// neither end and stay refused.
if (tool.startsWith('mcp__')) {
  const READ = '(get|list|search|read|describe|status|count)';
  const name = tool.split('__').pop() ?? '';
  if (new RegExp(`^${READ}(_|$)`).test(name)) process.exit(0);
  if (new RegExp(`(^|_)${READ}$`).test(name)) process.exit(0);
  deny(`${tool} is not a read.`);
}

/**
 * The commands a Bash line runs, split where bash would start a new one.
 * @param {string} cmd  the command line.
 * @returns {{text: string, bare: string}[]} one entry per command: its text, and
 *   the same with every quoted span emptied, which is what the redirect test
 *   reads. An operator inside single quotes is text; inside double quotes only
 *   `$(` and a backtick still start a command, as they do in bash. Splitting on
 *   every pipe character regardless of quotes refused three reads in one
 *   session (a jq filter, a grep pattern, both with a pipe inside quotes), and
 *   every read-only check below is made on what this returns.
 */
function commands(cmd) {
  const out = [];
  let text = '', bare = '', q = '';
  const cut = () => { out.push({ text, bare }); text = ''; bare = ''; };
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i], two = cmd.slice(i, i + 2);
    if (q === "'") { if (c === "'") q = ''; text += c; continue; }
    if (c === '\\') { text += two; if (!q) bare += two; i++; continue; }
    if (two === '$(') { cut(); i++; continue; }
    if (c === '`') { cut(); continue; }
    if (q === '"') { if (c === '"') q = ''; text += c; continue; }
    if (c === "'" || c === '"') { q = c; text += c; continue; }
    if (two === '&&' || two === '||') { cut(); i++; continue; }
    if (c === ';' || c === '|' || c === '\n' || c === ')') { cut(); continue; }
    text += c; bare += c;
  }
  cut();
  return out;
}

/** Strip one layer of shell quotes from a word. @param {string} w the word.
 *  @returns {string} the word as the program receives it, near enough for the
 *  sed script test, which is its only caller. */
const unquote = (w) => w.replace(/^(['"])([\s\S]*)\1$/, '$2');

// A sed script that only prints, substitutes without a w or e flag, or moves
// text between its own buffers. Anything else — above all a w command, which
// writes a file — is refused. A LIST of what reads, never a list of what writes.
const SED_ADDR = String.raw`(?:\d+|\$|/(?:\\.|[^/\\])*/)`;
const SED_READ = new RegExp(String.raw`^(?:${SED_ADDR}(?:,${SED_ADDR})?!?)?\s*(?:[p=lqQdnNPDhHgGx]`
  + String.raw`|s(.)(?:\\.|(?!\1).)*\1(?:\\.|(?!\1).)*\1[gpiIm0-9]*`
  + String.raw`|y(.)(?:\\.|(?!\2).)*\2(?:\\.|(?!\2).)*\2)?$`);

if (tool === 'Bash') {
  const cmd = String(input.command ?? '');
  // A reading for reply-guard, and nothing else: exactly `node <this hub's
  // reply-guard.mjs> --read … --said … --route …`, one plain command, as
  // reply-guard's own parser accepts it. Refused here, it deadlocked plan
  // approval: a rejected ExitPlanMode was recorded as a failed call, its
  // repeat waited for a reading, and plan mode refused the reading (LESSONS §376).
  const reading = parseRead(cmd);
  if (reading && !reading.bad) process.exit(0);
  const parts = commands(cmd);

  // A REDIRECT WRITES A FILE. `2>&1`, `>&2` and anything aimed at /dev/null do
  // not, and read commands use them constantly, so they are removed before the
  // test rather than the whole check being abandoned. Only a `>` OUTSIDE quotes
  // is a redirect: `grep '->'` is a read.
  for (const { bare } of parts) {
    const withoutFdRedirects = bare.replace(/2>&1|>&2|&>\s*\/dev\/null|2?>\s*\/dev\/null/g, '');
    if (withoutFdRedirects.includes('>')) deny('the command redirects to a file.');
  }

  // AN ALLOW-LIST OF READERS, NEVER A DENY-LIST OF WRITERS. A deny-list has to
  // be extended every time a tool appears, by somebody who remembers this gate
  // exists — which is `binary-files.mjs`'s lesson (§243) and the reason that
  // one is a deny-list of BINARIES rather than an allow-list of text.
  //
  // Bash cannot simply be refused wholesale: plan mode permits reading and
  // `cat` is a read. A guard whose trigger is wider than its purpose is the
  // guard people switch off, which is what retired `tour-fresh`.
  const READERS = new Set([
    'cat', 'ls', 'head', 'tail', 'wc', 'sort', 'uniq', 'cut', 'tr', 'grep',
    'rg', 'egrep', 'fgrep', 'find', 'jq', 'echo', 'printf', 'pwd', 'basename',
    'dirname', 'realpath', 'stat', 'file', 'diff', 'column', 'date', 'true',
    'test', '[', 'which', 'type', 'ps', 'df', 'du', 'git', 'sed',
    'awk', 'node', 'xargs', 'tee',
  ]);
  // `env` is not here: it runs whatever follows it, and `env` with a command
  // wrote the approval marker when it was measured.

  // Split on every operator that starts a NEW command, INCLUDING command
  // substitution — `cat $(rm -rf x)` is not a read, and a check that only
  // looked at the first word would call it one. Quotes are respected.
  for (const { text: seg } of parts) {
    const words = seg.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    const w = words[0].replace(/^\(+/, '');
    if (!READERS.has(w)) deny(`"${w}" is not a known read-only command.`);

    // Four readers that write when asked to. Named individually because each
    // is genuinely needed for reading and blanket-refusing them would make
    // planning impossible.
    if (w === 'sed' && !words.includes('-n')) deny('sed without -n can write in place.');
    if (w === 'sed' && words.some((x) => /^-[a-zA-Z]*i|^--in-place/.test(x))) deny('sed -i writes in place.');
    if (w === 'sed') {
      const scripts = words.includes('-e')
        ? words.flatMap((x, k) => (words[k - 1] === '-e' ? [x] : []))
        : [words.slice(1).find((x) => !x.startsWith('-')) ?? ''];
      for (const s of scripts) for (const part of unquote(s).split(/[;\n]/)) {
        if (!SED_READ.test(part.trim())) deny(`the sed command "${part.trim()}" is not a print-only one (a w command writes a file).`);
      }
    }
    if (w === 'find' && words.some((x) => /^-(exec|execdir|ok|okdir|delete|fprint|fprint0|fprintf|fls)$/.test(x))) deny('find with an action that runs or writes.');
    if (w === 'sort' && words.some((x) => /^-[a-zA-Z]*o|^--output/.test(x))) deny('sort -o writes a file.');
    if (w === 'node' && !words.includes('--check')) deny('node runs arbitrary code.');
    if (w === 'awk' && />/.test(seg)) deny('awk can redirect.');
    if (w === 'tee') deny('tee writes.');
    if (w === 'xargs') deny('xargs runs an unchecked command.');
    if (w === 'git') {
      const READ_GIT = new Set([
        'log', 'status', 'diff', 'show', 'rev-parse', 'rev-list', 'ls-files',
        'ls-tree', 'cat-file', 'merge-base', 'describe', 'blame', 'shortlog',
        'grep', 'count-objects', 'var', 'help', 'branch', 'tag', 'remote',
      ]);
      // The first non-flag word after `git`, skipping the argument of a flag
      // that takes one — `git -C dir log` is a log. The first version compared
      // against a cwd field the payload never carries, so it read the
      // directory as the subcommand and refused the log.
      let sub = '';
      for (let k = 1; k < words.length; k++) {
        if (['-C', '-c', '--git-dir', '--work-tree', '--namespace'].includes(words[k])) { k++; continue; }
        if (words[k].startsWith('-')) continue;
        sub = words[k]; break;
      }
      const name = String(sub);
      if (!READ_GIT.has(name)) deny(`"git ${name}" is not read-only.`);
      // `branch`, `tag` and `remote` READ bare and WRITE with an argument.
      if (['branch', 'tag', 'remote'].includes(name)) {
        const after = words.slice(words.indexOf(name) + 1)
          .filter(x => !['-v', '-vv', '-a', '-l', '--list', '--all', 'show'].includes(x));
        if (after.length > 0) deny(`"git ${name} ${after[0]}" can write.`);
      }
    }
  }
  process.exit(0);
}

/**
 * A PLAN IS REFUSED UNTIL IT HAS DONE THE THINKING (Doctrine §11e, §11f).
 *
 * Plan mode forced a written plan before code, and the plan still went wrong
 * in the same three ways on the same evening: it named one approach and never
 * the branches not taken; it traced no call chain and worked from two functions
 * read in isolation; it looked nothing up and derived what a field had settled.
 * Each of those is a SECTION a plan can be made to carry, and the shape is not
 * invented here — it is the RFC template (Prior art, Rationale and alternatives,
 * Unresolved questions) and the ADR's "alternatives considered", which exist
 * because every engineering culture that wrote plans hit this exact failure.
 *
 * So `ExitPlanMode` is refused unless the plan's top block carries all five,
 * each with at least a line of body under it — a heading alone is a slot:
 *
 *   ## Looked up     what was researched outside this repo and what it said,
 *                    or why nothing outside bears on this (§11e)
 *   ## Branches      the ways this could go and why this one; a single branch
 *                    needs a stated reason there is only one
 *   ## Call chain    the actual functions on the path, traced — implementation
 *                    altitude, not "~line 1244"
 *   ## Whole app     the return trip: why this belongs in the app, what it
 *                    costs the system, what would make it the wrong thing (§11f)
 *   ## Leaves open   every branch not taken to completion, each with WHERE it
 *                    now lives (a NOTES roadmap line, an issue) — or "nothing"
 *
 * The plan file is the newest in ~/.claude/plans/; the payload does not name
 * it. The TOP block only — plan files accumulate superseded plans under
 * horizontal rules, and those were checked when they were current.
 */
/**
 * TALK THE PLAN THROUGH BEFORE PROPOSING IT (LESSONS §370).
 * A plan proposed with no discussion is not approved, and a session kept
 * re-proposing after each rejection instead of answering. So since the last
 * plan-mode call (EnterPlanMode, or any ExitPlanMode that was answered), there
 * must be a turn of the session's in plain text AND a message from the owner
 * after it. Measured shapes: a rejection is an ExitPlanMode tool_result with
 * is_error; "not in plan mode" errors and cancelled approvals are not answers.
 * @param {string|undefined} path  the transcript.
 * @returns {string|null} the refusal reason, or null to allow; null when the
 *   tail holds no plan-mode call at all, since nothing then says what to count from.
 */
function talkedThrough(path) {
  const entries = tailEntries(path ?? '', 16 * 1024 * 1024);
  const planIds = new Map();
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c)) for (const b of c) {
      if (b?.type === 'tool_use' && /^(Enter|Exit)PlanMode$/.test(b.name ?? '')) planIds.set(b.id, b.name);
    }
  }
  let anchor = -1;
  entries.forEach((e, i) => {
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c) && c.some((b) => b?.type === 'tool_use' && b.name === 'EnterPlanMode')) anchor = i;
    if (e?.type === 'user' && Array.isArray(c)) for (const b of c) {
      if (b?.type !== 'tool_result' || planIds.get(b.tool_use_id) !== 'ExitPlanMode') continue;
      const text = typeof b.content === 'string' ? b.content : JSON.stringify(b.content ?? '');
      if (/not in plan mode/i.test(text) || e.toolDenialKind === 'cancelled' || /Tool call not completed/.test(text)) continue;
      // A GATE'S refusal is not the owner's answer. Measured 2026-09-28: it is
      // recorded with the same toolDenialKind as the owner's own rejection
      // ("permission-rule"), so only its content tells them apart. Counting it
      // made every gate refusal cost the owner a message.
      if (/PreToolUse:ExitPlanMode hook error: \[/.test(text)) continue;
      anchor = i;
    }
  });
  if (anchor < 0) return null;
  let spoke = false;
  for (let i = anchor + 1; i < entries.length; i++) {
    const e = entries[i];
    const c = e?.message?.content;
    if (e?.type === 'assistant' && Array.isArray(c) && c.some((b) => b?.type === 'text' && (b.text ?? '').trim().length > 40)) spoke = true;
    if (spoke && isOwnerMessage(e)) return null;
  }
  return 'this plan has not been talked through. Since the last plan-mode call, write the plan out in chat as a turn of its own, '
    + 'let the owner answer it, and only then propose it (LESSONS §370). Re-proposing after a rejection without answering it is the failure this refuses.';
}

/**
 * A PLAN NAMES ONLY THINGS THAT EXIST (LESSONS §370).
 * A function that exists nowhere in the code reached a plan after a context
 * compaction. Every code-formatted name in the plan must be found in a repo
 * beside this session, or in a tool RESULT this session read, or be marked
 * "(new)" on its line. Paths outside the repos, and spans with spaces, are
 * skipped: they are commands and environment, not names.
 * @param {string} plan  the whole plan file.
 * @param {string} top   its top block (unused; the whole plan is checked).
 * @returns {string|null} the refusal naming each missing name, or null.
 */
function inventedNames(plan, top) {
  const dir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  let repos = [dir];
  try { repos = [dir, ...readdirSync(dirname(dir)).map((d) => join(dirname(dir), d))].filter((d) => existsSync(join(d, '.git'))); } catch { /* one repo */ }
  const seen = seenInResults(tailEntries(p.transcript_path ?? '', 16 * 1024 * 1024));
  const missing = new Set();
  for (const line of plan.split('\n')) {
    for (const m of line.matchAll(/`([^`\n]+)`/g)) {
      const span = m[1].trim();
      // A call is looked up by its name: `touched()` was refused while
      // `touched` existed. The span itself is what "(new)" is matched against.
      const t = span.replace(/\([^()]*\)$/, '');
      if (t.length < 3 || /\s|^[\/~$<"]|^[\d.,:%x-]+$/.test(t)) continue;
      if (new RegExp(`\`${span.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\`[^\`]*\\(new\\)`).test(line)) continue;
      if (seen.includes(t)) continue;
      // Code only: a name the docs merely MENTION is not a name that exists —
      // a first version passed a name only because a lesson quoted it.
      const found = repos.some((r) => spawnSync('git', ['-C', r, 'grep', '-qF', '--', t, '--', ':!*.md'], { encoding: 'utf8' }).status === 0
        || (spawnSync('git', ['-C', r, 'ls-files'], { encoding: 'utf8' }).stdout ?? '').split('\n').some((f) => f === t || f.endsWith('/' + t)));
      if (!found) missing.add(t);
    }
  }
  if (!missing.size) return null;
  return `the plan names ${[...missing].map((x) => `\`${x}\``).join(', ')}, which exist in no repo and in no tool result this session read. `
    + 'Correct the name, or mark it "(new)" on its line if the plan creates it (LESSONS §370).';
}

if (tool === 'ExitPlanMode') {
  const dir = join(homedir(), '.claude', 'plans');
  let plan = '';
  // The plan checked is the plan the harness is about to show: the file it
  // names, or the text it passes. Only without either is the newest file in the
  // directory used, and never one of the harness's side files (a workshop
  // copy, a subagent's plan, an ultraplan), which can be newer than the plan.
  try {
    if (typeof input.planFilePath === 'string' && existsSync(input.planFilePath)) plan = readFileSync(input.planFilePath, 'utf8');
    else if (typeof input.plan === 'string' && input.plan.trim()) plan = input.plan;
    else {
      const newest = readdirSync(dir).filter((f) => f.endsWith('.md') && !/\.workshop\.md$|-agent-[^/]*\.md$|ultraplan\.md$/.test(f))
        .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t)[0];
      if (newest) plan = readFileSync(join(dir, newest.f), 'utf8');
    }
  } catch { /* no plans dir: fall through with an empty plan, which is refused */ }
  const top = plan.split(/^(?:---\s*|# .*)$/m).find((b) => b.trim()) ?? plan;
  const REQUIRED = ['Looked up', 'Branches', 'Call chain', 'Whole app', 'Leaves open'];
  const missing = REQUIRED.filter((h) => {
    const m = top.match(new RegExp(`^## ${h}\\b[^\\n]*\\n([\\s\\S]*?)(?=^## |^# |$(?![\\s\\S]))`, 'mi'));
    return !m || !m[1].split('\n').some((l) => l.trim().length > 20);
  });
  if (missing.length === 0) {
    const talk = talkedThrough(p.transcript_path);
    if (talk) deny(talk);
    const names = inventedNames(plan, top);
    if (names) deny(names);
    process.exit(0);
  }
  deny(`the plan is missing ${missing.map((m) => `"## ${m}"`).join(', ')} with a real body under each. `
    + 'Looked up: what was researched and what it said, or why nothing outside this repo bears on it. '
    + 'Branches: the ways this could go and why this one. '
    + 'Call chain: the actual functions on the path, traced. '
    + 'Whole app: why this belongs in the app and what would make it the wrong thing. '
    + 'Leaves open: every branch not taken to completion and where it now lives. '
    + 'Doctrine §11e/§11f; the RFC template is the shape.');
}

// The readers the harness provides, which never needed the gate but are listed
// so the default below can be a refusal rather than a shrug.
// The harness's discovery tools read and list and nothing else. Missing from
// this list, they were refused whenever no plan was in force, through
// approved-plan-guard, which asks this file what a read is.
if (['Read', 'Glob', 'Grep', 'NotebookRead', 'WebFetch', 'WebSearch',
  'TodoWrite', 'AskUserQuestion', 'ToolSearch',
  'ListAgents', 'ReadNotifications', 'Skill',
  'TaskList', 'TaskGet', 'TaskOutput', 'ListMcpResourcesTool', 'ReadMcpResourceTool', 'ReadMcpResourceDirTool',
  'ListConnectors', 'ListSkills', 'SearchSkills', 'ListPlugins', 'SearchPlugins', 'SearchMcpRegistry'].includes(tool)) process.exit(0);

// DENY BY DEFAULT. A tool this file has never heard of is refused, so adding a
// tool cannot silently widen what plan mode allows.
deny(`${tool} is not known to be read-only.`);
