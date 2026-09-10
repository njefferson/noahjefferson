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
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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

// Editing the plan is the one thing plan mode is FOR.
const PLANS = '/.claude/plans/';
if (tool === 'Write' || tool === 'Edit' || tool === 'NotebookEdit') {
  const f = String(input.file_path ?? '');
  if (f.includes(PLANS)) process.exit(0);
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

if (tool === 'Bash') {
  const cmd = String(input.command ?? '');

  // A REDIRECT WRITES A FILE. `2>&1`, `>&2` and anything aimed at /dev/null do
  // not, and read commands use them constantly, so they are removed before the
  // test rather than the whole check being abandoned.
  const withoutFdRedirects = cmd
    .replace(/2>&1|>&2|&>\s*\/dev\/null|2?>\s*\/dev\/null/g, '');
  if (withoutFdRedirects.includes('>')) deny('the command redirects to a file.');

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
    'test', '[', 'which', 'type', 'ps', 'df', 'du', 'env', 'git', 'sed',
    'awk', 'node', 'xargs', 'tee',
  ]);

  // Split on every operator that starts a NEW command, INCLUDING command
  // substitution — `cat $(rm -rf x)` is not a read, and a check that only
  // looked at the first word would call it one.
  for (const seg of cmd.split(/;|&&|\|\||\||\$\(|`|\)|\n/)) {
    const words = seg.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    const w = words[0].replace(/^\(+/, '');
    if (!READERS.has(w)) deny(`"${w}" is not a known read-only command.`);

    // Four readers that write when asked to. Named individually because each
    // is genuinely needed for reading and blanket-refusing them would make
    // planning impossible.
    if (w === 'sed' && !words.includes('-n')) deny('sed without -n can write in place.');
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
      // The first non-flag word after `git` — `git -C dir log` is a log.
      const sub = words.slice(1).find(x => !x.startsWith('-') && x !== String(input.cwd));
      const name = String(sub ?? '');
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

// The readers the harness provides, which never needed the gate but are listed
// so the default below can be a refusal rather than a shrug.
if (['Read', 'Glob', 'Grep', 'NotebookRead', 'WebFetch', 'WebSearch',
  'TodoWrite', 'ExitPlanMode', 'AskUserQuestion', 'ToolSearch',
  'ListAgents', 'ReadNotifications', 'Skill'].includes(tool)) process.exit(0);

// DENY BY DEFAULT. A tool this file has never heard of is refused, so adding a
// tool cannot silently widen what plan mode allows.
deny(`${tool} is not known to be read-only.`);
