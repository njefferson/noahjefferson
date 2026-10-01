#!/usr/bin/env node
/**
 * WHAT WAS LEARNED STAYS WRITTEN DOWN (LESSONS §376).
 *
 * A page an ordinary person can read in a normal browser is information
 * however it was fetched. When the method was wrong, the method is fixed and
 * recorded; the reading is not taken back. On 2026-10-01 two documentation
 * commits in Jefferson-Photography-Studio did the opposite: five readings
 * were marked withdrawn, or "named, not read", because of the identity the
 * request was made in, a source was dropped from a list of tools, and a
 * confirmed tally went from 24 to 23. Every gate was green.
 *
 * So, run by hook-dispatch.mjs on every PreToolUse, this refuses a Bash
 * command that makes a git commit when the commit's Markdown changes:
 *
 *   - ADD a sentence that marks a source withdrawn, retracted or "named, not
 *     read", alongside how it was fetched (in that sentence or the one either
 *     side), or that points at another record's withdrawal of it; or
 *   - DROP a web domain the file named before (a deleted file drops all of
 *     its domains).
 *
 * It is lifted for one finding only by a message from the owner, in this
 * session, that names that source (its domain, the domain's own name, or a
 * name in the sentence) and asks for removal in the same clause.
 *
 *   node keep-info-guard.mjs --repo <dir> [--commit <sha>]   the same check
 *        on what is staged there (or on one commit), printed, with no lift:
 *        for testing it against a repository's history
 *
 * KNOWN GAPS. It reads Markdown only. It judges a sentence by its words, so a
 * withdrawal phrased with none of them passes, and a sentence that merely
 * describes this rule in the abstract with a source named in it is refused.
 * It sees a commit made by a Bash command, not one made by another tool.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { commandsIn, heredocs, commandWordIndex } from './reply-guard.mjs';
import { ownerMessagesSince } from './transcript-tail.mjs';

const SELF = fileURLToPath(import.meta.url);
const MD = ['*.md', '*.markdown', '*.mdx'];
const WITHDRAW = /\bwithdraw(?:n|s|ing|al)?\b|\bretract(?:ed|s|ion|ing)?\b|\bnamed(?:\s+here)?,?\s+(?:but\s+)?not\s+read\b/gi;
const WITHDRAW_REF = /\b(?:decision|record)\s+\d{3}\s+withdraws\b|\bwithdrawn\s+in\s+(?:decision|record)\s+\d{3}\b|\bwithdraws\s+the\s+only\s+copy\b/i;
const FETCH = /identity|user[- ]?agent|headless|impersonat|disguis|\bfetch(?:ed|es|ing)?\b|fetch tool|\bcurl\b|\bwget\b|\bheaders?\b|\brequests?\b|\brequested\b|refused this session|read around a refusal/i;
const SPECIFIC = /\b(?:page|copy|read|reading|index|feed|article|post|paper|tutorial|documentation|blog|site)\b/i;
const REMOVE = /\b(?:remove|delete|drop|take\s+(?:it\s+|them\s+|that\s+)?out|cut|strike|withdraw|retract|erase|get\s+rid\s+of)\b/i;
const NEGATED = /\b(?:never|don'?t|do\s+not|no\s+longer|stop)\b/i;
const TLDS = new Set(['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'io', 'dev', 'app', 'info', 'biz', 'ai', 'co', 'me', 'tv',
  'xyz', 'site', 'online', 'tech', 'page', 'blog', 'photography', 'pro', 'science', 'academy', 'news', 'cloud', 'ly', 'us', 'uk',
  'de', 'fr', 'jp', 'nl', 'ca', 'au', 'ch', 'se', 'no', 'fi', 'it', 'es', 'pl', 'cz', 'at', 'be', 'dk', 'ru', 'cn', 'in', 'br',
  'nz', 'ie', 'eu', 'gl', 'gg', 'is', 'pt', 'gr', 'hu', 'kr', 'tw', 'sg', 'za', 'mx', 'ar', 'il', 'tr', 'ua', 'ro', 'sk', 'si',
  'hr', 'lt', 'lv', 'ee', 'lu', 'li', 'museum', 'studio', 'design', 'art', 'gallery', 'camera', 'photo', 'photos', 'space',
  'store', 'shop', 'org.uk', 'co.uk']);
const STOP_WORDS = new Set(['The', 'This', 'That', 'These', 'Those', 'One', 'Two', 'Three', 'A', 'An', 'It', 'Its', 'Asked', 'Read',
  'Named', 'Nothing', 'Every', 'Each', 'Some', 'What', 'Which', 'When', 'Where', 'Why', 'How', 'And', 'But', 'Or', 'If', 'In', 'On',
  'At', 'Of', 'For', 'With', 'From', 'By', 'As', 'To', 'After', 'Before', 'Once', 'Then', 'There', 'Here', 'Kept', 'Refused',
  'Withdrawn', 'Decision', 'Record', 'Section', 'See', 'Note', 'Not', 'No', 'Yes', 'Still', 'Only', 'Both', 'All', 'Any', 'IR', 'CLAUDE']);

const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const git = (repo, args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

/**
 * The web domains a text names.
 * @param {string} text  Markdown.
 * @returns {Set<string>} lower-case domains ending in a real top-level domain,
 *   `www.` taken off, so a file name such as `IR-SCIENCE.md` is never one.
 */
export function domainsIn(text) {
  const out = new Set();
  for (const m of String(text).matchAll(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}\b/gi)) {
    const d = m[0].toLowerCase().replace(/^www\./, '');
    const parts = d.split('.');
    if (parts.length < 2 || !TLDS.has(parts.at(-1))) continue;
    if (!/[a-z]{2}/.test(parts.at(-2))) continue;
    out.add(d);
  }
  return out;
}

/**
 * Markdown cut into paragraphs of sentences.
 * @param {string} text  a file's content.
 * @returns {string[][]} one array per paragraph or list item, each holding its
 *   sentences with whitespace collapsed, in order. Two versions of a file
 *   compared this way do not differ where only the wrapping moved, and a
 *   sentence's neighbours are never taken from another paragraph.
 */
export function paragraphs(text) {
  const out = [];
  for (const para of String(text).split(/\n\s*\n|\n(?=\s*(?:[-*+]|\d+\.)\s)|\n(?=#)/)) {
    const flat = norm(para);
    if (!flat) continue;
    out.push(flat.split(/(?<=[.!?:;])\s+(?=[A-Z0-9*_(["'`])/).map((x) => x.trim()).filter(Boolean));
  }
  return out;
}

/**
 * Markdown cut into sentences.
 * @param {string} text  a file's content.
 * @returns {string[]} every sentence of `paragraphs`, flattened, in order.
 */
export function sentences(text) {
  return paragraphs(text).flat();
}

/**
 * What a change to one Markdown file takes back.
 * @param {string} file    its path, for the report.
 * @param {string} before  its content before ('' for a new file).
 * @param {string} after   its content after ('' for a deleted file).
 * @returns {{file: string, kind: 'withdrawal'|'dropped-domain', text: string, names: string[]}[]}
 *   one finding per added withdrawal sentence and per dropped domain; `names`
 *   are what an owner message must name to lift that finding.
 */
export function findings(file, before, after) {
  const out = [];
  const old = new Set(sentences(before));
  for (const now of paragraphs(after)) now.forEach((s, i) => {
    if (old.has(s)) return;
    const hits = s.match(WITHDRAW);
    if (!hits) return;
    const rest = s.replace(WITHDRAW, ' ');
    const window = [now[i - 1] ?? '', rest, now[i + 1] ?? ''].join(' ');
    const fetch = FETCH.test(window) || WITHDRAW_REF.test(s);
    const doms = [...domainsIn(s)];
    const caps = [...rest.matchAll(/\b[A-Z][A-Za-z0-9-]{2,}\b/g)].map((m) => m[0]).filter((w, k) => !STOP_WORDS.has(w) && !(k === 0 && rest.trimStart().startsWith(w) && /^[A-Z][a-z]+$/.test(w) && !/[A-Z].*[A-Z]/.test(w)));
    // About a particular source: a domain, a name's possessive ("Adobe's
    // page"), or a word for a thing that is read. A capitalised word alone is
    // not enough: a sentence describing this rule names GATE and Markdown.
    const specific = doms.length > 0 || /\b[A-Z][a-z][A-Za-z-]*'s\b/.test(rest) || SPECIFIC.test(rest);
    if (!fetch || !specific) return;
    const names = [...new Set([...doms, ...doms.map((d) => d.split('.').at(-2)), ...caps])];
    out.push({ file, kind: 'withdrawal', text: s, names });
  });
  const kept = domainsIn(after);
  for (const d of domainsIn(before)) {
    if (kept.has(d)) continue;
    out.push({ file, kind: 'dropped-domain', text: d, names: [d, d.split('.').at(-2)] });
  }
  return out;
}

/**
 * The Markdown changes a commit would make, read from git.
 * @param {string} repo  the repository.
 * @param {{all?: boolean, amend?: boolean, commit?: string}} how  `all` reads
 *   the working tree (git commit -a or with paths); `amend` compares against
 *   HEAD's parent; `commit` checks that commit against its parent.
 * @returns {{file: string, before: string, after: string}[]} one per changed
 *   Markdown file, renames paired, deletions with an empty `after`.
 */
export function changes(repo, how = {}) {
  const base = how.commit ? `${how.commit}^` : how.amend ? 'HEAD^' : 'HEAD';
  const hasBase = git(repo, ['rev-parse', '--verify', '-q', base]).status === 0;
  const range = how.commit ? [base, how.commit] : how.all ? [hasBase ? base : '4b825dc642cb6eb9a060e54bf8d69288fbee4904'] : ['--cached', hasBase ? base : '4b825dc642cb6eb9a060e54bf8d69288fbee4904'];
  const r = git(repo, ['diff', '-M', '--name-status', ...range, '--', ...MD]);
  if (r.status !== 0) return [];
  const show = (spec) => { const x = git(repo, ['show', spec]); return x.status === 0 ? x.stdout : ''; };
  const out = [];
  for (const line of r.stdout.split('\n').filter(Boolean)) {
    const [st, a, b] = line.split('\t');
    const oldPath = a, newPath = st.startsWith('R') || st.startsWith('C') ? b : a;
    const before = st.startsWith('A') || !hasBase ? '' : show(`${base}:${oldPath}`);
    let after = '';
    if (!st.startsWith('D')) {
      if (how.commit) after = show(`${how.commit}:${newPath}`);
      else if (how.all) { try { after = readFileSync(join(repo, newPath), 'utf8'); } catch { after = ''; } }
      else after = show(`:${newPath}`);
    }
    out.push({ file: newPath, before, after });
  }
  return out;
}

/**
 * The git commits a Bash command line makes.
 * @param {string} cmd  the command.
 * @param {string} cwd  where it runs.
 * @returns {{repo: string, all: boolean, amend: boolean}[]} one per `git
 *   commit` in it, with the directory it runs in (`-C`, or a `cd` before it).
 */
export function commitsIn(cmd, cwd) {
  const out = [];
  let dir = resolve(cwd || process.cwd());
  let segs = [];
  try { segs = commandsIn(heredocs(String(cmd)).shell); } catch { segs = []; }
  for (const s of segs) {
    const w = s.words;
    const at = commandWordIndex(w);
    if (at < 0) continue;
    if (basename(w[at]) === 'cd' && w[at + 1]) { dir = resolve(dir, w[at + 1].replace(/^~(?=\/|$)/, process.env.HOME ?? '~')); continue; }
    if (basename(w[at]) !== 'git') continue;
    let repo = dir, k = at + 1;
    for (; k < w.length; k++) {
      if (w[k] === '-C' && w[k + 1]) { repo = resolve(repo, w[++k]); continue; }
      if (['-c', '--git-dir', '--work-tree', '--namespace'].includes(w[k])) { k++; continue; }
      if (w[k].startsWith('-')) continue;
      break;
    }
    if (w[k] !== 'commit') continue;
    const rest = w.slice(k + 1);
    const VALUED = /^(-m|-F|-C|-c|-t|--message|--file|--author|--date|--fixup|--squash|--template|--cleanup|--trailer|--reuse-message|--reedit-message)$/;
    let all = false, amend = false;
    for (let i = 0; i < rest.length; i++) {
      const x = rest[i];
      if (x === '--') { if (rest.length > i + 1) all = true; break; }
      if (VALUED.test(x)) { i++; continue; }
      if (x === '--all' || x === '--include' || x === '--only') { all = true; continue; }
      if (x === '--amend') { amend = true; continue; }
      if (/^-[A-Za-z]+$/.test(x)) { if (x.includes('a')) all = true; if (/[mFCct]$/.test(x)) i++; continue; }
      if (x.startsWith('-')) continue;
      all = true;
    }
    out.push({ repo, all, amend });
  }
  return out;
}

/**
 * Is a finding lifted by the owner?
 * @param {{names: string[]}} f  a finding.
 * @param {{text: string}[]} said  the owner's messages this session.
 * @returns {boolean} true when one clause of one owner message names the
 *   source and asks for removal, and is not a "never remove" sentence.
 */
export function lifted(f, said) {
  const names = f.names.filter((n) => n && n.length >= 3);
  for (const m of said) {
    // Clauses end at punctuation followed by a space, never inside a domain.
    for (const clause of String(m.text).split(/[.;!?:](?=\s|$)|\n+/)) {
      if (!REMOVE.test(clause) || NEGATED.test(clause)) continue;
      if (names.some((n) => new RegExp(`(?<![A-Za-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9])`, 'i').test(clause))) return true;
    }
  }
  return false;
}

/**
 * Decide on one tool call (PreToolUse).
 * @param {object} p  the hook payload.
 * @param {{text: string}[]} [said]  the owner's messages, for the test; read
 *   from the transcript when absent.
 * @returns {string|null} the refusal listing every finding not lifted, or null.
 */
export function decide(p, said) {
  if (p.tool_name !== 'Bash') return null;
  const commits = commitsIn(String(p.tool_input?.command ?? ''), p.cwd);
  if (!commits.length) return null;
  const all = [];
  for (const c of commits) {
    if (!existsSync(c.repo)) continue;
    for (const ch of changes(c.repo, c)) all.push(...findings(ch.file, ch.before, ch.after));
  }
  if (!all.length) return null;
  const msgs = said ?? (p.transcript_path ? ownerMessagesSince(p.transcript_path, 0) : []);
  const open = all.filter((f) => !lifted(f, msgs));
  if (!open.length) return null;
  const lines = open.map((f) => f.kind === 'withdrawal'
    ? `  ${f.file}: adds a withdrawal tied to how the source was fetched:\n    ${f.text.slice(0, 600)}`
    : `  ${f.file}: no longer names ${f.text}, which it named before.`);
  return 'keep-info-guard (LESSONS §376): this commit takes back information. A page an ordinary person can read in a normal browser is information however it was fetched: keep what was read, record how it was fetched as a fact, and fix the method, never the record.\n'
    + lines.join('\n')
    + '\nPut the reading or the domain back. Only a message from the owner that names the source and asks for its removal lifts this.';
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  const argv = process.argv.slice(2);
  if (argv.includes('--repo')) {
    const repo = resolve(argv[argv.indexOf('--repo') + 1] ?? '.');
    const commit = argv.includes('--commit') ? argv[argv.indexOf('--commit') + 1] : undefined;
    const fs = changes(repo, { commit }).flatMap((ch) => findings(ch.file, ch.before, ch.after));
    for (const f of fs) console.log(f.kind === 'withdrawal' ? `WITHDRAWAL ${f.file}: ${f.text.slice(0, 400)}` : `DROPPED ${f.file}: ${f.text}`);
    console.log(`${fs.length} finding(s)${commit ? ` in ${commit}` : ' staged'} in ${repo}`);
    process.exit(fs.length ? 1 : 0);
  }
  let raw = '';
  try { raw = readFileSync(0, 'utf8'); } catch { /* no payload */ }
  let p = {};
  try { p = JSON.parse(raw); } catch { process.exit(0); }
  const why = decide(p);
  if (why) { process.stderr.write(why + '\n'); process.exit(2); }
  process.exit(0);
}
