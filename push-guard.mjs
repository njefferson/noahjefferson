#!/usr/bin/env node
/**
 * ONLY `staging` AND `main` REACH A REMOTE, IN EVERY REPO (Doctrine §11).
 *
 * The harness names a `claude/*` branch in every session, and every session that
 * did as it was told stranded its work on a branch nobody deploys: nineteen were
 * on the hub's remote when it was counted. A paragraph saying "ignore it" did not
 * stop one of them. This refuses the push.
 *
 * PreToolUse, run by hook-dispatch.mjs for the main thread and every agent:
 *
 *   Bash   every `git push` the line runs (inside `$( )`, `sh -c`, `eval` too,
 *          as shell-words.mjs's `commandsIn` opens them) must land on `staging`
 *          or `main`. A push with no refspec, or with `HEAD`, is the repo's
 *          current branch, read from the repo the push runs in (a plain `cd`,
 *          `-C`). A shell redirect on the push (`2>&1`, `> out`) and its target
 *          are not arguments of the push: they are set aside before the
 *          destination is read (`dropRedirects`), and whatever follows a pipe is
 *          judged as a command of its own. `--all`, `--branches`, `--mirror`, `--tags`, `--follow-tags`,
 *          `--delete`, `-d`, `--prune` and a `:ref` deletion are refused, and so
 *          is a force-push to main (`--force`, `-f`, `--force-with-lease`, a
 *          `+` refspec) and `--no-verify` on a push or a commit (`-n` on a
 *          commit). A push this cannot resolve FOR CERTAIN is refused rather
 *          than guessed: a destination in a variable or a glob, a detached
 *          HEAD, a `remote.*.push` or `push.default=matching` configuration, a
 *          git alias, `--git-dir`, `--work-tree`, `-c`, a GIT_DIR-style variable,
 *          `env -C`, `xargs` or `find -exec` running it, and any `cd`, `pushd`
 *          or `popd` it cannot follow (inside a subshell or a substitution, or
 *          to a path written with `$`, `~` or a glob).
 *   GitHub connector   the tools named in BRANCH_CREATE are refused; those in
 *          FILE_WRITES are refused unless their `branch` is staging or main;
 *          those in PR_MERGE and BRANCH_UPDATE are refused whatever they name.
 *
 *   THE CHECK BEFORE A PUSH OF STAGING OR MAIN, ALWAYS (plans/native-setup.md): the connector's FILE_WRITES to staging or main are
 *          refused (they carry no commit a checker could have passed), and a push that lands on staging or main is refused unless a
 *          checker has passed the exact commit it pushes. A
 *          pass is an agent of this session whose hand-back (or, when it ended without that call, its final message, an assistant message of text with no tool call after it) opens
 *          `CHECK PASS` and then the full id of that commit, and whose own
 *          transcript holds no Edit, Write, MultiEdit or NotebookEdit call and no Bash call running git commit, git add or git
 *          push. It is read from the agents' transcripts (agent-read.mjs `agentFiles` and `agentEnd`), never from a file an agent could
 *          write; a transcript that cannot be read is no pass.
 *
 *   node push-guard.mjs     (payload on stdin; exit 2 refuses, reason on stderr)
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { commandsIn, commandWordIndex, heredocs } from './shell-words.mjs';

// The code that reads agents' transcripts is loaded here and not imported statically, so a copy of the guard without it keeps every
// other decision; the check before a push then refuses a push of staging or main, for no pass can be read.
let reportMod = null;
let tailMod = null;
try { reportMod = await import('./agent-read.mjs'); tailMod = await import('./transcript-tail.mjs'); } catch { reportMod = null; tailMod = null; }

const SELF = fileURLToPath(import.meta.url);
const ALLOWED = new Set(['staging', 'main']);
const RULE = 'Only staging and main reach a remote, in every repo (Doctrine §11). The harness may name a claude/* branch; it does not apply.';
// Variables that move which repository, worktree or configuration git reads.
const GIT_ENV = /\bGIT_(?:DIR|WORK_TREE|COMMON_DIR|CONFIG\w*|NAMESPACE|INDEX_FILE)\b/;

// The GitHub connector's tools that create a branch or write files to one, BY
// NAME. Matched on the part after the server name, so a server registered as
// `github` or `GitHub` is the same connector.
export const BRANCH_CREATE = ['mcp__github__create_branch'];
export const FILE_WRITES = ['mcp__github__create_or_update_file', 'mcp__github__push_files', 'mcp__github__delete_file'];
// The connector's tools that merge a pull request, now or once its checks pass,
// and the one that updates a pull request's branch from its base. Each writes
// a branch the call does not name — the base, or the pull request's own head —
// so there is nothing in the call to hold to staging or main. Refused outright.
export const PR_MERGE = ['mcp__github__merge_pull_request', 'mcp__github__enable_pr_auto_merge'];
export const BRANCH_UPDATE = ['mcp__github__update_pull_request_branch'];
const suffix = (t) => String(t).split('__').slice(2).join('__');

const git = (dir, ...args) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });

/**
 * The branch a repo has checked out.
 * @param {string} dir  any directory inside the repo.
 * @returns {string} the branch name, or '' when HEAD is detached or `dir` is
 *   not a repo; '' is never a permitted destination, so it refuses.
 */
function currentBranch(dir) {
  const r = git(dir, 'symbolic-ref', '--short', '-q', 'HEAD');
  return r.status === 0 ? r.stdout.trim() : '';
}

/**
 * Where one refspec lands.
 * @param {string} spec  a refspec as given on the command line.
 * @param {string} dir   the repo it is pushed from.
 * @returns {{dst?: string, bad?: string}} the destination branch with any
 *   `refs/heads/` removed, or why it cannot be allowed: a deletion, or a
 *   destination that cannot be read without running the shell.
 */
export function destination(spec, dir) {
  const s = String(spec).replace(/^\+/, '');
  if (s.startsWith(':')) return { bad: `"${spec}" deletes a remote branch` };
  const at = s.indexOf(':');
  const src = at < 0 ? s : s.slice(0, at);
  let dst = at < 0 || at === s.length - 1 ? src : s.slice(at + 1);
  if (/[$`*?[\]{}]/.test(dst)) return { bad: `the destination of "${spec}" cannot be read without running the shell` };
  if (dst === 'HEAD' || dst === '@') {
    if (at >= 0 && at < s.length - 1) return { bad: `"${spec}" names HEAD as a remote destination` };
    dst = currentBranch(dir);
    if (!dst) return { bad: `"${spec}" is HEAD, and ${dir} has no branch checked out` };
  }
  return { dst: dst.replace(/^refs\/heads\//, '') };
}

// git's own subcommands. An alias can never shadow one of these, so only a
// word outside this list is looked up as an alias.
const BUILTIN = new Set(('add am annotate apply archive bisect blame branch bundle cat-file check-attr check-ignore checkout '
  + 'cherry cherry-pick clean clone commit commit-tree config count-objects describe diff diff-files diff-index diff-tree '
  + 'fetch for-each-ref format-patch fsck gc grep hash-object help init log ls-files ls-remote ls-tree maintenance merge '
  + 'merge-base merge-tree mktree mv name-rev notes prune pull push range-diff read-tree rebase reflog remote repack '
  + 'replace reset restore rev-list rev-parse revert rm shortlog show show-ref sparse-checkout stash status submodule '
  + 'switch symbolic-ref tag update-index update-ref var verify-commit version whatchanged worktree write-tree').split(' '));

/**
 * Is a word a git alias where it runs?
 * @param {string} dir  the directory git runs in.
 * @param {string} sub  the word in git's subcommand position.
 * @returns {boolean} true when `git config --get alias.<sub>` answers there; an
 *   alias can run anything, including a push, so the caller refuses it.
 */
function isAlias(dir, sub) {
  if (!/^[A-Za-z0-9][\w.-]*$/.test(sub) || BUILTIN.has(sub)) return false;
  return spawnSync('git', ['config', '--get', `alias.${sub}`], { cwd: existsSync(dir) ? dir : '/', encoding: 'utf8' }).status === 0;
}

/**
 * The arguments git receives, with the shell's redirects taken away.
 * @param {string[]} args  the words after the subcommand, quoting removed.
 * @returns {string[]} the same words without each redirect (`2>&1`, `>&2`,
 *   `>out`, `>> out`, `&>out`, `<in`, `<<< text`) and, when the operator stands
 *   alone, the one word after it, which is its target. Bash never hands a
 *   redirect to the program, so reading `2>&1` as a branch refused a push to
 *   staging whose output was redirected and piped (measured 2026-10-04). A pipe
 *   needs nothing here: `commandsIn` already ends a command at it, so what
 *   follows a pipe is judged as a command of its own. A lone `|` word is NOT
 *   treated as a pipe: after `commandsIn` has stripped quotes, a quoted `|` is
 *   an argument git receives, and dropping the words after it would hide a
 *   branch from the destination check. Every other word is kept, in order, so
 *   a push to any branch but staging or main is still refused with its tail.
 */
export function dropRedirects(args) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    const m = /^(?:\d*|&)(?:>>|>\||>&|>|<<<|<<-?|<&|<>|<)(.*)$/.exec(String(args[i]));
    if (!m) { out.push(args[i]); continue; }
    // `2>&1` and `>out` carry their target; a lone `>` takes the next word.
    if (m[1] === '' && i + 1 < args.length) i++;
  }
  return out;
}

/**
 * Does a `git commit` skip its hooks?
 * @param {string[]} args  the words after `commit`.
 * @returns {boolean} true for `--no-verify`, or `-n` alone or in a cluster of
 *   short options (`-anm`), reading past the value of an option that takes one
 *   so a message reading "-n" is not taken for the flag.
 */
export function commitSkipsHooks(args) {
  for (let i = 0; i < args.length; i++) {
    const a = String(args[i]);
    if (a === '--') break;
    if (a === '--no-verify') return true;
    if (/^--(message|file|reuse-message|reedit-message|author|date|cleanup|template|trailer|fixup|squash|pathspec-from-file)$/.test(a)) { i++; continue; }
    if (a.startsWith('--') || !/^-[A-Za-z]/.test(a)) continue;
    for (let j = 1; j < a.length; j++) {
      if (a[j] === 'n') return true;
      if ('mFcCt'.includes(a[j])) { if (j === a.length - 1) i++; break; }
      if ('Su'.includes(a[j])) break;
    }
  }
  return false;
}

const CHECK_PREFIX = 'PUSH CHECK: ';
const CHECK_READ_BYTES = 64 * 1024 * 1024;
const MUTATING_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);
const MUTATING_GIT = /\bgit\b(?:\s+(?:-C\s+\S+|-c\s+\S+|--[\w-]+(?:=\S*)?))*\s+(?:commit|add|push)\b/;

/**
 * Does a Bash line run git commit, git add or git push?
 * @param {string} command  the line.
 * @returns {boolean} true when any simple command in it (nested ones included) is one, or the text reads like one.
 */
export function runsGitWrite(command) {
  const cmd = heredocs(String(command ?? '')).shell;
  if (MUTATING_GIT.test(cmd)) return true;
  const simple = commandsIn(cmd);
  for (const s of simple) {
    const w = s.words.map(String);
    const at = commandWordIndex(w);
    if (at < 0 || basename(w[at]) !== 'git') continue;
    let k = at + 1;
    while (k < w.length && w[k].startsWith('-')) k += /^(-C|-c|--git-dir|--work-tree|--namespace)$/.test(w[k]) ? 2 : 1;
    if (['commit', 'add', 'push'].includes(w[k] ?? '')) return true;
  }
  return false;
}

/**
 * What an agent's own transcript shows it changed.
 * @param {object[]} entries  the agent's whole transcript.
 * @returns {string} '' when it holds no call of Edit, Write, MultiEdit or NotebookEdit and no Bash call running git commit, git add
 *   or git push; otherwise the first such call, named.
 */
export function changedSomething(entries) {
  for (const e of entries) {
    const c = e?.message?.content;
    if (e?.type !== 'assistant' || !Array.isArray(c)) continue;
    for (const b of c) {
      if (b?.type !== 'tool_use') continue;
      if (MUTATING_TOOLS.has(String(b.name))) return `a call of ${b.name}`;
      if (b.name === 'Bash' && runsGitWrite(b.input?.command)) return 'a Bash call running git commit, git add or git push';
    }
  }
  return '';
}

/**
 * What an ended agent wrote as its final message.
 * @param {object[]} entries  the agent's whole transcript.
 * @returns {string} the text of the transcript's last message when that is an assistant message with text and no tool call; '' when the
 *   last message is a tool call, a tool result or a user message (the agent is still running or was cut off).
 */
export function finalText(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e?.type !== 'assistant' && e?.type !== 'user') continue;
    const c = e?.message?.content;
    if (e.type !== 'assistant') return '';
    if (typeof c === 'string') return c.trim();
    if (!Array.isArray(c) || c.some((b) => b?.type === 'tool_use')) return '';
    const texts = c.filter((b) => b?.type === 'text' && String(b.text ?? '').trim());
    return texts.length ? String(texts[texts.length - 1].text).trim() : '';
  }
  return '';
}

/**
 * Has a checker passed this commit?
 * @param {object} p  the PreToolUse payload (`transcript_path`, `session_id`).
 * @param {string} commit  the full id of the commit being pushed.
 * @returns {{ok: boolean, unread?: string}} ok when an agent of the session handed back with a first line of CHECK PASS and exactly that
 *   id and its transcript shows nothing changed; `unread` says why the agents could not be read, which is no pass.
 */
export function checkerPassed(p, commit) {
  if (!reportMod || !tailMod) return { ok: false, unread: 'the code that reads the agents could not be loaded' };
  const tr = String(p?.transcript_path ?? '');
  let dir = '';
  if (tr.endsWith('.jsonl')) dir = join(tr.slice(0, -'.jsonl'.length), 'subagents');
  else { try { dir = reportMod.sessionFiles(String(p?.session_id ?? ''))?.agents ?? ''; } catch { dir = ''; } }
  if (!dir) return { ok: false, unread: 'the session\'s transcript could not be found' };
  let files = [];
  try { files = reportMod.agentFiles(dir); } catch { return { ok: false, unread: 'the session\'s agents could not be listed' }; }
  for (const a of files) {
    try {
      if (statSync(a.file).size > CHECK_READ_BYTES) continue;
      const entries = tailMod.tailEntries(a.file, CHECK_READ_BYTES);
      if (!entries.length) continue;
      const end = reportMod.agentEnd(entries, reportMod.agentMeta(a), 0, '');
      // The pass is the hand-back call's text, or else the final message of an agent that ended by writing it (the checker's tools hold no
      // hand-back call, and an agent under a restored plan mode ends without one): a transcript whose last entry is an assistant message of text.
      const text = end?.how === 'a report' ? end.last : finalText(entries);
      if (!text) continue;
      const first = String(text).split('\n').map((l) => l.trim()).find(Boolean) ?? '';
      const m = /^CHECK PASS\s+([0-9a-f]{40,64})\b/i.exec(first);
      if (!m || m[1].toLowerCase() !== commit.toLowerCase()) continue;
      if (changedSomething(entries)) continue;
      return { ok: true };
    } catch { /* an agent that cannot be read is no pass */ }
  }
  return { ok: false };
}

/** The commit a refspec pushes, in full, or '' when it cannot be read. */
function commitOf(spec, dir) {
  const s = String(spec).replace(/^\+/, '');
  const at = s.indexOf(':');
  const src = at < 0 ? s : s.slice(0, at);
  const r = git(dir, 'rev-parse', '--verify', '-q', `${!src || src === '@' ? 'HEAD' : src}^{commit}`);
  return r.status === 0 ? r.stdout.trim() : '';
}

/**
 * The refusal of a push of staging or main that no checker has passed.
 * @param {string} commit  the full id being pushed, or '' when it cannot be read.
 * @param {string} [unread]  why the agents could not be read, when they could not.
 * @param {string} [branch]  the branch the push lands on, named in the refusal.
 * @returns {string} five plain sentences.
 */
function checkRefusal(commit, unread = '', branch = 'main') {
  return `${CHECK_PREFIX}The check before a push holds. The push is of commit ${commit || '(not readable from this repository)'}. `
    + `The push lands on ${branch}. `
    + `No checker has passed that commit${unread ? `, and ${unread}` : ''}. `
    + 'A checker which changes nothing must pass that exact commit first, by handing back CHECK PASS and the full commit id on its first line.';
}

/**
 * Judge one `git …` simple command.
 * @param {string[]} words  the command's words from `git` on, quoting removed.
 * @param {string} cwd      the directory the shell runs it in.
 * @param {string} [unsure] why the repo it runs in cannot be known for
 *   certain (a cd this cannot follow, a GIT_DIR-style variable, xargs), or ''.
 * @returns {string|null} the refusal, or null when it is neither a push, a
 *   commit skipping its hooks nor an alias, or when it is a push this can
 *   resolve and every branch it updates is staging or main without forcing main.
 */
export function judgeGit(words, cwd, unsure = '', heldPush = null) {
  let dir = cwd;
  let k = 1;
  let dirOpt = '';
  let config = '';
  for (; k < words.length && String(words[k]).startsWith('-'); k++) {
    const o = String(words[k]);
    if (o === '-C') {
      const d = String(words[k + 1] ?? '');
      if (!d || /[$`*?[\]{}~]/.test(d)) dirOpt = `-C ${d || '(nothing)'}`;
      dir = resolve(dir, d); k++; continue;
    }
    if (o === '-c' || o === '--config-env') {
      const v = String(words[k + 1] ?? '');
      if (/^alias\./i.test(v)) return `git ${o} ${v} defines an alias on the command line, which this cannot resolve for certain; write the command out.`;
      config ||= `${o} ${v}`; k++; continue;
    }
    if (/^--config-env=/.test(o)) {
      if (/^--config-env=alias\./i.test(o)) return `git ${o} defines an alias, which this cannot resolve for certain; write the command out.`;
      config ||= o; continue;
    }
    if (o === '--git-dir' || o === '--work-tree') { dirOpt = o; k++; continue; }
    if (/^--(git-dir|work-tree)=/.test(o)) { dirOpt = o.split('=')[0]; continue; }
    if (['--namespace', '--super-prefix'].includes(o)) k++;
  }
  const sub = String(words[k] ?? '');
  if (sub === 'commit') {
    return commitSkipsHooks(words.slice(k + 1)) ? 'git commit --no-verify (or -n) is refused: it skips the hooks that check what is committed.' : null;
  }
  if (sub !== 'push') {
    if (sub && !BUILTIN.has(sub) && (unsure || dirOpt)) return `"git ${sub}" may be an alias, and where it runs cannot be resolved for certain (${unsure || dirOpt}).`;
    if (isAlias(dir, sub)) return `"git ${sub}" is a git alias, which this cannot resolve for certain; write the command out.`;
    return null;
  }
  if (dirOpt) return `git push with ${dirOpt} names a repository this cannot resolve for certain; run it in the repo, with -C and a written-out path.`;
  if (config) return `git push with ${config} can change where it pushes, which this cannot resolve for certain.`;
  if (unsure) return `git push after ${unsure} runs in a repository this cannot resolve for certain; write every path in full, with git -C.`;
  const args = dropRedirects(words.slice(k + 1));
  const pos = [];
  let force = false;
  for (let i = 0; i < args.length; i++) {
    const a = String(args[i]);
    if (a === '--') { pos.push(...args.slice(i + 1)); break; }
    if (/^--(all|branches|mirror|tags|follow-tags|delete|prune)(=|$)/.test(a)) return `git push ${a} is refused: it updates or deletes branches other than staging and main.`;
    if (a === '--no-verify') return 'git push --no-verify is refused: it skips the hooks that check what is pushed.';
    if (/^--force(-with-lease)?(=|$)/.test(a)) { force = true; continue; }
    if (/^--(repo|push-option|receive-pack|exec)$/.test(a)) { i++; continue; }
    if (a.startsWith('--')) continue;
    if (/^-[A-Za-z0-9]+$/.test(a)) {
      if (a.includes('d')) return `git push ${a} is refused: -d deletes a remote branch.`;
      if (a.includes('f')) force = true;
      if (a.endsWith('o')) i++;
      continue;
    }
    pos.push(a);
  }
  const remote = pos[0];
  let specs = pos.slice(1);
  if (!specs.length) {
    // No refspec: the current branch, unless configuration says otherwise.
    const conf = remote ? git(dir, 'config', '--get-all', `remote.${remote}.push`).stdout.trim() : '';
    const mode = git(dir, 'config', '--get', 'push.default').stdout.trim();
    if (conf) return `git push ${remote} uses the refspecs configured in remote.${remote}.push, which this cannot judge; name the branch: git push ${remote} HEAD:staging.`;
    if (mode === 'matching') return 'git push with push.default=matching pushes every matching branch; name the branch.';
    specs = ['HEAD'];
  }
  for (const spec of specs) {
    const d = destination(spec, dir);
    if (d.bad) return `git push refused: ${d.bad}.`;
    if (!ALLOWED.has(d.dst)) return `git push to "${d.dst}" is refused: only staging and main reach a remote.`;
    if (d.dst === 'main' && (force || String(spec).startsWith('+'))) return `git push "${spec}" force-pushes main, and a force-push to main is refused.`;
  }
  // A push that lands on staging or main waits for a checker's pass of that exact commit (`heldPush` is null only for a caller that asks no check).
  if (heldPush) {
    for (const spec of specs) {
      const dst = destination(spec, dir).dst;
      if (dst !== 'main' && dst !== 'staging') continue;
      const why = heldPush(commitOf(spec, dir), dst);
      if (why) return why;
    }
  }
  return null;
}

/**
 * Does a command line open a subshell?
 * @param {string} cmd  a Bash line, heredoc bodies taken out.
 * @returns {boolean} true for a `(` outside quotes that is not `$(`, `<(` or
 *   `>(`: a cd inside one does not carry past its `)`, so a push beside it
 *   cannot be placed for certain.
 */
export function hasSubshell(cmd) {
  const s = String(cmd ?? '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') { i++; continue; }
    if (c === "'") { const e = s.indexOf("'", i + 1); i = e < 0 ? s.length : e; continue; }
    if (c === '"') { i++; while (i < s.length && s[i] !== '"') { if (s[i] === '\\') i++; i++; } continue; }
    if (c === '(' && !/[$<>]/.test(s[i - 1] ?? '')) return true;
  }
  return false;
}

/**
 * Decide one tool call.
 * @param {object} p  the PreToolUse payload.
 * @returns {string|null} the refusal with the rule, or null to allow. Every
 *   `git` command in a Bash line is judged, wherever it sits (inside `$( )`,
 *   `sh -c`, `eval`, behind `xargs` or `find -exec`); a push whose repository
 *   cannot be placed for certain is refused. hook-dispatch.mjs turns a reason
 *   into exit 2.
 */
export function decide(p) {
  const tool = String(p.tool_name ?? '');
  const input = p.tool_input ?? {};
  if (tool.startsWith('mcp__') && /github/i.test(tool.split('__')[1] ?? '')) {
    const name = suffix(tool);
    if (BRANCH_CREATE.some((t) => suffix(t) === name)) return `${tool} creates a branch, and it is refused. ${RULE}`;
    if (PR_MERGE.some((t) => suffix(t) === name)) return `${tool} merges a pull request, and it is refused. ${RULE}`;
    if (BRANCH_UPDATE.some((t) => suffix(t) === name)) return `${tool} updates a pull request's branch, and it is refused. ${RULE}`;
    if (FILE_WRITES.some((t) => suffix(t) === name)) {
      const b = String(input.branch ?? '').replace(/^refs\/heads\//, '');
      if (!ALLOWED.has(b)) return `${tool} writes to branch "${b || '(none named)'}", and only staging and main are written. ${RULE}`;
      // The connector's writes carry no commit a checker could have passed.
      return `${CHECK_PREFIX}${tool} writes to ${b}, and the connector's writes carry no commit a checker could have passed. Work reaches staging and main by a git push after a checker's pass of that exact commit.`;
    }
    return null;
  }
  if (tool !== 'Bash') return null;
  const cmd = heredocs(String(input.command ?? '')).shell;
  let cwd = resolve(p.cwd || process.cwd());
  // What cannot be followed for certain anywhere in the line makes every push
  // in it unresolvable: a variable that moves the repository, a subshell, a cd
  // with a path the shell would expand.
  let unsure = GIT_ENV.test(cmd) || process.env.GIT_DIR || process.env.GIT_WORK_TREE ? 'a GIT_DIR-style variable' : '';
  const sub = hasSubshell(cmd);
  let anyCd = false;
  const gits = [];
  for (const s of commandsIn(cmd)) {
    const w = s.words;
    const at = commandWordIndex(w);
    if (at < 0) continue;
    const raw = String(w[at]);
    const prog = basename(raw.replace(/^(<\(|\()+/, ''));
    if (prog === 'cd' || prog === 'pushd' || prog === 'popd') {
      anyCd = true;
      const args = w.slice(at + 1).map(String).filter((x) => !/^\d*[<>]/.test(x));
      const plain = prog === 'cd' && s.depth === 0 && at === 0 && raw === 'cd' && !sub
        && args.length === 1 && /^[^$`*?[\]{}~]+$/.test(args[0]) && args[0] !== '-';
      if (plain) cwd = resolve(cwd, args[0]);
      else unsure ||= `a ${prog} it cannot follow (${w.slice(at).join(' ').slice(0, 60)})`;
      continue;
    }
    // A nested command (in `$( )`, `sh -c`) is listed after the whole outer
    // line, so a cd anywhere in the line may or may not precede it.
    const nested = s.depth > 0 && anyCd ? 'a cd in a line whose nested command cannot be placed after or before it' : '';
    const pre = w.slice(0, at).map(String);
    const via = pre.some((x) => basename(x) === 'xargs') ? 'xargs, which adds words of its own'
      : pre.some((x) => /^(-C|--chdir|-D)$|^--chdir=/.test(x)) ? 'a wrapper that changes directory' : nested;
    if (prog === 'git') { gits.push({ w: w.slice(at), cwd, via }); continue; }
    if (prog === 'find') {
      for (let i = at + 1; i < w.length; i++) {
        if (/^-(exec|execdir|ok|okdir)$/.test(w[i]) && basename(String(w[i + 1] ?? '')) === 'git') gits.push({ w: w.slice(i + 1), cwd, via: `find ${w[i]}` });
      }
    }
  }
  const heldPush = (commit, branch) => {
    if (!commit) return checkRefusal('', '', branch);
    const r = checkerPassed(p, commit);
    return r.ok ? null : checkRefusal(commit, r.unread, branch);
  };
  for (const g of gits) {
    const why = judgeGit(g.w, g.cwd, g.via || unsure, heldPush);
    if (why) return why.startsWith(CHECK_PREFIX) ? why : `${why} ${RULE}`;
  }
  return null;
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  let p = {};
  try { p = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }
  let why = null;
  try { why = decide(p); } catch (e) { process.stderr.write(`push-guard: ${e?.message ?? e}\n`); process.exit(1); }
  if (why) { process.stderr.write(`PUSH GATE: ${why}\n`); process.exit(2); }
  process.exit(0);
}
