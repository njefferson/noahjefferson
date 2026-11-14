#!/usr/bin/env node
/**
 * HOLD 5, NOTHING LOST.
 *
 *   node rules-keep-check.mjs --repo <path> [--base <commit>]
 *
 * Every non-blank line (compared with its leading and trailing spaces set aside) that stood on any rules page at the base commit must
 * stand on some rules page of the working tree, or be listed as released. A line that moved from one rules page to another passes. A
 * rules page that is new at the working tree and absent at the base loses nothing.
 *
 * Released lines: plans/rules-released.md lists them inside fenced code blocks, each block under a plain line that says the date and why.
 * Every line inside any fenced block of that file counts as released. The file itself is not a rules page.
 *
 * The base is --base where given; else origin/main where it is an ancestor of HEAD and differs from it; else HEAD~1. The base is read with
 * git show and git ls-tree, the working tree from disk. A base that cannot be read is said so and exits 1, never 0. A loss prints each
 * lost line with its old file and line number and exits 1; no loss prints one line with the count of lines held and exits 0.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// THE RULES PAGES: the paths of the repository, where they exist. One constant. `exact` are single paths, `direct` are the .md files
// directly in a folder, `named` are files of one name at any depth under a folder.
const RULES_PAGES = {
  exact: ['CLAUDE.md', 'DOCTRINE.md', 'agent-rules.md', 'aim-review.md', 'plans/seed-template.md', 'plans/native/page.md', 'plans/native/running.md',
    '.claude/skills/landing/SKILL.md', '.claude/skills/piece-of-work/SKILL.md'],
  direct: ['doctrine', 'plans/native/roles', '.claude/agents'],
  named: [['plans/native/skills', 'SKILL.md']],
};
const RELEASED = 'plans/rules-released.md';

const isPage = (p) => p !== RELEASED && (RULES_PAGES.exact.includes(p)
  || RULES_PAGES.direct.some((d) => p.startsWith(`${d}/`) && !p.slice(d.length + 1).includes('/') && p.endsWith('.md'))
  || RULES_PAGES.named.some(([d, n]) => p.startsWith(`${d}/`) && (p === `${d}/${n}` || p.endsWith(`/${n}`))));

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const repo = arg('--repo');
if (!repo) { console.error('usage: node rules-keep-check.mjs --repo <path> [--base <commit>]'); process.exit(1); }
const git = (...a) => spawnSync('git', ['-C', repo, ...a], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 60000 });
const unreadable = (why) => { console.error(`rules-keep-check: the base cannot be read (${why}); nothing is checked and this is not a pass.`); process.exit(1); };

// The base commit.
let base = arg('--base');
let chosen = `--base ${base}`;
if (!base) {
  // The default base, in this order: (1) HEAD, when the working tree or the index differs from HEAD in a rules page or in the released
  // file (a run before a commit); (2) origin/main, when it is an ancestor of HEAD and differs from it (commits not yet pushed, all judged);
  // (3) HEAD~1 (a run on a pushed head).
  const touched = [...git('diff', '--name-only', 'HEAD').stdout.split('\n'), ...git('ls-files', '--others', '--exclude-standard').stdout.split('\n')]
    .filter((p) => p && (isPage(p) || p === RELEASED));
  const origin = git('rev-parse', '--verify', '--quiet', 'origin/main^{commit}');
  const head = git('rev-parse', '--verify', '--quiet', 'HEAD^{commit}');
  const reaches = origin.status === 0 && head.status === 0 && origin.stdout.trim() !== head.stdout.trim()
    && git('merge-base', '--is-ancestor', 'origin/main', 'HEAD').status === 0;
  if (touched.length) { base = 'HEAD'; chosen = 'rule 1: a rules page or the released file differs from HEAD, a run before a commit'; }
  else if (reaches) { base = 'origin/main'; chosen = 'rule 2: origin/main is an ancestor of HEAD and differs from it, commits not yet pushed'; }
  else { base = 'HEAD~1'; chosen = 'rule 3: a pushed head, judged against the commit before it'; }
}
if (git('rev-parse', '--verify', '--quiet', `${base}^{commit}`).status !== 0) unreadable(`no commit named ${base}`);
const short = git('rev-parse', '--short', `${base}^{commit}`).stdout.trim();
const basis = `${base} (${short}; ${chosen})`;
const tree = git('ls-tree', '-r', '--name-only', base);
if (tree.status !== 0) unreadable(`git ls-tree failed for ${base}`);

// The base's rules pages, each line with its file and number.
const old = [];
for (const p of tree.stdout.split('\n').filter((x) => x && isPage(x))) {
  const shown = git('show', `${base}:${p}`);
  if (shown.status !== 0) unreadable(`git show failed for ${p}`);
  shown.stdout.split('\n').forEach((l, i) => { if (l.trim()) old.push({ file: p, n: i + 1, line: l.trim() }); });
}

// The working tree's rules pages, from disk.
function pagesOnDisk() {
  const out = [];
  const walk = (rel) => {
    let items;
    try { items = readdirSync(join(repo, rel), { withFileTypes: true }); } catch { return; }
    for (const e of items) {
      const p = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) { if (rel === '' ? ['doctrine', 'plans', '.claude'].includes(e.name) : e.name !== 'node_modules' && e.name !== '.git') walk(p); }
      else if (isPage(p)) out.push(p);
    }
  };
  walk('');
  return out;
}
const held = new Set();
for (const p of pagesOnDisk()) for (const l of readFileSync(join(repo, p), 'utf8').split('\n')) if (l.trim()) held.add(l.trim());

// The released lines: every line inside any fenced block of the released file.
const released = new Set();
if (existsSync(join(repo, RELEASED))) {
  let inside = false;
  for (const l of readFileSync(join(repo, RELEASED), 'utf8').split('\n')) {
    if (/^\s*```/.test(l)) { inside = !inside; continue; }
    if (inside && l.trim()) released.add(l.trim());
  }
}

const lost = old.filter((o) => !held.has(o.line) && !released.has(o.line));
if (lost.length) {
  console.log(`rules-keep-check: ${lost.length} line${lost.length === 1 ? '' : 's'} of the rules pages at ${basis} no longer stand:`);
  for (const o of lost) console.log(`  ${o.file}:${o.n}: ${o.line}`);
  console.log(`Each lost line must stand on a rules page or be listed in ${RELEASED} with why.`);
  console.log('Why: on 12 November 2026 a rebuild meant to make the hub lighter dropped rules it was meant to keep, and nothing showed it.');
  process.exit(1);
}
console.log(`rules-keep-check: ${new Set(old.map((o) => o.line)).size} lines held against ${basis}.`);
process.exit(0);
