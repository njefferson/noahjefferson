#!/usr/bin/env node
// quote-check.mjs — every set-apart quotation says whose words it is.
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node quote-check.mjs                    check the hub
//   node quote-check.mjs --repo ../app      check a sibling
//   node quote-check.mjs --repo ../app --list   print what is undeclared, seed-shaped
//   node quote-check.mjs --repo ../app --sweep  SEARCH source comments (never fails)
//
// ## Why this is a LIST and not a pattern
//
// The rule it serves is the second half of the privacy rule: never quote the
// owner, and never attribute anything to him — "write what was wrong and what it
// measured, never who reported it, and never in what words". `privacy-check.mjs`
// enforces the NAME half and cannot see this one: it anchors every pattern on
// `noah` or `the owner`, and a verbatim sentence of somebody's speech carries
// neither.
//
// Five real violations survived every gate in two repos until they were found by
// hand. Three mechanical rules were tried against them and all three failed, and
// the counts are kept because they are the argument for this design:
//
//   - A SPEECH CUE near a quotation ("settled", "reported", then a quote mark)
//     flagged 39 files. `settled` is a variable name in `work.ts`.
//   - A BLOCK QUOTATION WITH NO SOURCE named in the lines before it flagged 138.
//     Wrapped prose starting with a quote character is everywhere.
//   - A QUOTATION CARRYING A FIRST-PERSON PRONOUN flagged 227. First person is
//     the PRODUCT'S idiom — "what am I waiting on Sam for" is UI copy, and the
//     reader's own voice is quoted on purpose all over these repos.
//
// Every one of those would have been a gate that fires on honest prose, which
// `privacy-check.mjs` records as the one thing a privacy gate cannot afford: a
// false positive teaches sessions to route around it.
//
// So this does not guess. It finds ONE narrow shape — a markdown blockquote whose
// content is an emphasised quotation, `> *"…`, which is the "here is what
// somebody said" construction — and requires each one to be DECLARED. There were
// nineteen in two repos. That is a list a person can read, and a new one forces
// the question at the moment it is written rather than at the next scrub.
//
// Same shape as the a11y contrast registry, `plain.ts`'s two lists and the
// controls manifest, and for the same reason (LESSONS 103): the only thing that
// has ever stopped this class is a check at the moment of the change.
//
// ## What it deliberately does NOT do, and this is the honest half
//
// It reads MARKDOWN only, and it catches ONE shape. Inline quotations are not
// touched: the apps quote their own UI copy constantly and in the reader's voice,
// and a rule reaching those is the third failure above.
//
// **THREE OF THE SEVEN VIOLATIONS WERE IN SOURCE COMMENTS, AND THIS GATE WOULD
// NOT HAVE CAUGHT THEM.** They were found by the `--sweep` below, by hand. Two
// wore the emphasised shape `*"…"*` and one wore a plain `"…"` in a `//`
// comment, so no single narrow rule covers both — and the emphasised shape is a
// LIVE IDIOM here: source comments cite the event vocabulary, product law 4 and
// the app's own strings in exactly that form, twenty-three times in one repo.
// Gating it would demand a declaration for every legitimate citation, which is
// the false positive this file exists to avoid.
//
// So the coverage is: a set-apart quotation in a markdown file, gated. A
// quotation in a code comment, NOT gated — run `--sweep` and read it, which is a
// readable list because it looks for the emphasised shape only.
//
// AND ONE STONE STAYS UNTURNED, NAMED HERE RATHER THAN LEFT IMPLIED: a plain
// `"…"` inside a `//` comment is caught by neither the gate nor the sweep. One of
// the seven wore exactly that, in `tools/smoke.mjs`. Matching it flags 305 lines
// in one repo, and a list nobody reads is the same as no list.
//
// That is a floor, not a ceiling, and saying so here is the point: a gate whose
// description overstates it is how the NAME half came to be described as
// covering both halves of the rule for months.

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
const repoAt = args.indexOf('--repo');
const repo = resolve(repoAt >= 0 ? args[repoAt + 1] : '.');
const LIST = args.includes('--list');

const SWEEP = args.includes('--sweep');

const KNOWN = new Set(['--repo', '--list', '--sweep']);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--repo') { i++; continue; }
  if (args[i].startsWith('-') && !KNOWN.has(args[i])) {
    console.error(`\n  ${args[i]} is not a flag this tool has. Use --repo <path>, --list, --sweep.\n`);
    process.exit(2);
  }
}

const name = repo.split('/').filter(Boolean).pop();
console.log(`\n=== set-apart quotations · ${name} ===\n`);

/** The one shape: a blockquote line whose content opens with an emphasised quote. */
const BLOCKQUOTE = /^\s*>\s*[*_]{1,2}["“]/;
/** What a declaration may claim, closed so nobody can invent a reason. */
const REASONS = new Set(['document', 'product-copy', 'analysis']);

/** The quotation's opening words, normalised — the key a person can read. */
const gistOf = (line) => line
  .replace(/^\s*>\s*/, '')
  .replace(/[*_"“”]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 60);

let files;
try {
  files = execSync('git ls-files', { cwd: repo }).toString().split('\n').filter((f) => f.endsWith('.md'));
} catch {
  console.error(`  ${name} is not a git repository this tool can read.\n`);
  process.exit(2);
}

const found = [];
for (const f of files) {
  const path = join(repo, f);
  let lines;
  try { lines = readFileSync(path, 'utf8').split('\n'); } catch { continue; }
  lines.forEach((line, i) => {
    if (BLOCKQUOTE.test(line)) found.push({ file: f, line: i + 1, gist: gistOf(line) });
  });
}

// NON-EMPTY FIRST. A repo whose markdown stopped being readable, or a regex that
// stopped matching, would report green about a set it never looked at (hub
// LESSONS 100). Nothing here can distinguish "no quotations" from "found no
// files", so the file count is stated and an empty file list is a failure.
if (files.length === 0) {
  console.error('  no tracked .md files found — this gate cannot run.\n');
  process.exit(2);
}
console.log(`  read ${files.length} tracked markdown file(s)`);

const listPath = join(repo, '.quote-allow');
const declared = [];
if (existsSync(listPath)) {
  for (const raw of readFileSync(listPath, 'utf8').split('\n')) {
    const line = raw.replace(/\s*#.*$/, '').trim();
    if (!line) continue;
    const [file, reason, ...rest] = line.split('|').map((s) => s.trim());
    declared.push({ file, reason, gist: rest.join('|').trim() });
  }
}

// --sweep: A SEARCH, NOT A GATE. Exits 0 whatever it finds.
//
// Every quotation in a source comment, for a person to read. This is how the
// three source-file violations were found, and it is the only thing that finds
// them — see the header for why this cannot be a gate without flagging the
// vocabulary citations that share its shape. Run it in a scrub, not on a push.
if (SWEEP) {
  let src;
  try {
    src = execSync('git ls-files', { cwd: repo }).toString().split('\n')
      .filter((f) => /\.(ts|mjs|js|css|html)$/.test(f));
  } catch { src = []; }
  // The EMPHASISED shape only. A plain `"…"` in a comment was tried and matched
  // 305 lines in one repo — a list nobody reads is the same as no list, and the
  // sweep's whole value is that a person can get through it. One real violation
  // wore exactly that plain shape, in `smoke.mjs`, and it is stated in the header
  // that neither the gate nor this finds it. Saying which stone is unturned beats
  // printing three hundred.
  const QUOTED = /[*_]{1,2}["“][^"”\n]{12,}["”][*_]{1,2}/;
  let n = 0;
  console.log('  A SWEEP, NOT A GATE — nothing here fails. Read each one and ask');
  console.log('  whose words it is. A person\'s words are the violation; the event');
  console.log('  vocabulary, a product law and the app\'s own strings are not.\n');
  for (const f of src) {
    let lines;
    try { lines = readFileSync(join(repo, f), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((l, i) => {
      if (QUOTED.test(l)) { n++; console.log(`  ${f}:${i + 1}  ${l.trim().slice(0, 96)}`); }
    });
  }
  console.log(`\n  ${n} quotation(s) in source comments across ${src.length} file(s).\n`);
  process.exit(0);
}

if (LIST) {
  console.log('\n  Seed for .quote-allow — CHECK EVERY LINE BEFORE PASTING IT.\n');
  console.log('  A quotation of a person is NOT declarable. Rewrite it as what was');
  console.log('  wrong and what it measured, and delete the line.\n');
  for (const q of found) console.log(`${q.file} | document | ${q.gist}`);
  console.log('');
  process.exit(0);
}

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

const badReason = declared.filter((d) => !REASONS.has(d.reason));
if (badReason.length === 0) {
  ok(`${declared.length} declaration(s), each claiming a reason from the closed set`);
} else {
  fail(`${badReason.length} declaration(s) with a reason that is not one of ${[...REASONS].join(', ')}:`);
  for (const b of badReason) console.log(`          ${b.file} | ${b.reason}`);
}

const matches = (q, d) => d.file === q.file && d.gist && q.gist.startsWith(d.gist.slice(0, 40));
const undeclared = found.filter((q) => !declared.some((d) => matches(q, d)));
if (undeclared.length === 0) {
  ok(`all ${found.length} set-apart quotation(s) are declared`);
} else {
  fail(`${undeclared.length} set-apart quotation(s) not declared in .quote-allow:`);
  for (const u of undeclared) console.log(`          ${u.file}:${u.line}  ${u.gist}`);
  console.log('\n        A quotation of a PERSON is not declarable. Write what was wrong');
  console.log('        and what it measured — never who reported it, never in what words.');
  console.log('        A quotation of a DOCUMENT, of the app\'s own copy, or of a prior');
  console.log('        analysis is declarable: add it with document | product-copy | analysis.');
}

// BOTH DIRECTIONS. A declaration naming a quotation that is no longer there is a
// rule that has quietly stopped applying — the same failure `plain.mjs` checks
// for, and the reason a scrub can silently un-cover a file.
const stale = declared.filter((d) => d.gist && !found.some((q) => matches(q, d)));
if (stale.length === 0) {
  ok('no declaration names a quotation that is not there');
} else {
  fail(`${stale.length} declaration(s) naming a quotation that no longer exists:`);
  for (const s of stale) console.log(`          ${s.file} | ${s.gist}`);
}

if (failed > 0) {
  console.error(`\n${failed} problem(s).`);
  console.error('\nThe rule: never quote the owner, and never attribute anything to him.');
  console.error('Write what was wrong and what it measured. Five sentences of his own');
  console.error('speech survived every other gate in two repos before this existed.\n');
  process.exit(1);
}
console.log('\nEvery set-apart quotation says whose words it is.\n');
