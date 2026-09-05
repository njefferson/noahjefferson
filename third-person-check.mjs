#!/usr/bin/env node
// THE PRIVACY RULE'S THIRD HALF: never in the third person either.
//
// The rule was always two halves — never quote the owner, and never attribute
// anything to the owner by name — and both were gated. `privacy-check.mjs`
// anchors every pattern on the NAME or the role; `quote-check.mjs` finds the
// set-apart blockquote. Between them they cleaned four sibling repos.
//
// Then a pass for references carrying NO NAME AT ALL — a pronoun — found 49 more
// sites in one of those repos and 84 in another, in trees where both gates were
// green (LESSONS 112). A design record can be free of somebody's name on every
// page and still be about them on every page.
//
// ## Why this one is a PATTERN, when quote-check is a LIST
//
// The quotation gate is a list because three mechanical rules were measured
// against real violations and flagged 39, 138 and 227 files of honest prose:
// ordinary speech and the product's own voice are the same shape (LESSONS 108).
// **A pronoun has no such ambiguity.** In these repos a third-person masculine
// pronoun has exactly two possible referents — the owner, which is the
// violation this file exists for, and a third party, which the same ruling
// covers. There is no third, legitimate use, so the allow-list is near-empty by
// construction and stays that way.
//
// ## The two rules, and why the second is narrow
//
// RULE 1 — no third-person masculine pronoun, anywhere. 244 sites in Quietkeep
// and 364 in the hub when this was written. Say the ROLE instead. A promote
// made on somebody's say-so and a promote made on the owner's say-so are the
// same governance fact, and only one of them has a person in it. That is the
// whole transformation, and it loses nothing an engineer needed.
//
// RULE 3 — WHO FOUND IT. A finding verb (caught, found, reported, noticed,
// spotted, discovered) bound to a person, plus the two bare spellings that name
// a reporter without naming anyone — a report credited to live use, and a
// report credited back to whoever sent it. The literal forms are in the pattern
// below rather than written out here, because this file scans itself and an
// example of a violation is a violation; that is the gate working.
//
// This is the half of the rule the other two could not see: no name for
// `privacy-check.mjs`, no blockquote for `quote-check.mjs`, no pronoun and no
// possession for rules 1 and 2. Six sites in the hub and thirteen more in a
// sibling, all of them in comments and lesson prose, with every gate green.
//
// MEASURED BEFORE IT SHIPPED, like the possession list. The first draft matched
// governance too — "confirmed by the owner", "on the owner's say-so" — and
// flagged twenty-two sites, sixteen of them the honest provenance for a manual
// step no session can take. METADATA.md's "confirmed by the owner" IS the
// evidence a social preview was applied, because nothing else can confirm it.
// Narrowed to finding verbs, it flags six and every one is real.
//
// RULE 2 — "the owner's <thing>" where the thing is a POSSESSION rather than an
// act. "The owner's word", "the owner's on-device pass" and "the owner's call"
// are governance: they name a step in a process. A possession — a machine, a
// body of data, a stretch of somebody's time — is a fact about a life. Only the
// second class is refused, and it is a short closed list on purpose — a gate that
// flags honest governance prose teaches sessions to route around it, which is
// the failure `privacy-check.mjs` names in its own header.
//
// ## It prints WHERE and never WHAT
//
// Path, line number and the matched word. Never the surrounding sentence. These
// repos are public, so a failing run's Actions log is public, and a gate that
// quotes its find republishes the thing it exists to remove on every failure —
// which is the reasoning `privacy-history-check.mjs` already carries.
//
//   node third-person-check.mjs --repo ../app
//   node third-person-check.mjs --repo ../app --list   (seed for the allow file)

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { BINARY, LOCKFILE } from './binary-files.mjs';

const argv = process.argv.slice(2);
const known = new Set(['--repo', '--list']);
for (const a of argv) {
  if (a.startsWith('--') && !known.has(a.split('=')[0])) {
    console.error(`unknown argument: ${a}`);
    process.exit(2);
  }
}
const repoAt = argv.indexOf('--repo');
const repo = repoAt >= 0 && argv[repoAt + 1] ? argv[repoAt + 1] : '.';
const listing = argv.includes('--list');

/** The marked region, and it is THE FAMILY'S EXISTING SPELLING rather than a
 *  new one. `privacy-patterns.mjs` already exports these two markers and every
 *  gate keying off them skips the region for scanning, because a pattern's
 *  source legitimately carries the token it matches on. A second spelling would
 *  mean a file had to carry two sets of markers to be exempt from two gates,
 *  and the one somebody forgets is the one that matters.
 *
 *  Built by concatenation so these two lines do not themselves open a region. */
const SENTINEL_OPEN = new RegExp('privacy-gate:' + 'patterns-begin');
const SENTINEL_CLOSE = new RegExp('privacy-gate:' + 'patterns-end');

// privacy-gate:patterns-begin
const PRONOUN_G = /\b(?:he|his|him|himself)\b/gi;
// Not prose: an unbroken run no hand ever typed. See the scan loop for the cost
// of the line-length heuristic this replaced.
const MACHINE_RUN = /\S{80,}/;
// A POSSESSION, never an act. Acts are governance and stay.
const POSSESSIONS = [
  'device', 'devices', 'ipad', 'iphone', 'phone', 'mac', 'laptop', 'screen',
  'home screen', 'instance', 'store', 'data', 'export', 'log', 'logs',
  'life', 'day', 'days', 'week', 'habits', 'routine', 'health', 'family',
  'job', 'office', 'diary', 'calendar', 'inbox', 'photos',
];
const POSSESSIVE_G = new RegExp(
  String.raw`\bthe owner['’]s\s+(?:` + POSSESSIONS.join('|') + String.raw`)\b`, 'gi');
// RULE 3 — WHO FOUND IT. A finding verb bound to a person, and the two bare
// spellings that name a reporter without naming anyone. Deliberately excludes
// the governance verbs (confirmed, approved, applied, set, requested) and
// "on the owner's word/say-so/instruction", which record a step only a human
// can take and are the honest provenance for it.
const ATTRIBUTION_G = new RegExp(
  String.raw`\b(?:caught|found|reported|noticed|spotted|discovered)\s+by\s+`
  + String.raw`(?:the\s+owner|him|her)\b`
  + String.raw`|\bReported\s+(?:from\s+live\s+use|here\s+as|back\s+as)\b`
  + String.raw`|\bthe\s+report\s+back\s+was\b`, 'gi');
// privacy-gate:patterns-end

const name = repo.split('/').filter(Boolean).pop() || 'repo';
console.log(`\n=== third-person gate - ${name} ===`);

let files;
try {
  files = execSync('git ls-files', { cwd: repo, encoding: 'utf8' }).split('\n').filter(Boolean);
} catch {
  console.error(`  not a git repository: ${repo}`);
  process.exit(2);
}

/** Binaries carry no prose, and a lockfile's hashes carry word-boundaried
 *  fragments that are not words. Both are noise that would train a reader to
 *  skim this gate's output, which is how a real find gets missed.
 *
 *  THE LIST IS SHARED NOW. This one and privacy-check's were two lists for the
 *  same idea and were not the same list — and neither had `pfb`, so a vendored
 *  font library produced two finds inside Type 1 glyph data here and nothing at
 *  all there. See binary-files.mjs. */
const SKIP = BINARY;
/** The allow file itself. A list of declared exceptions has to NAME the words it
 *  declares, so scanning it means the gate fails on its own list — which it did,
 *  the moment that file was first committed rather than left untracked. Exactly
 *  the shape that caught this gate's own header on its first tracked run. */
const OWN_LIST = /(^|\/)\.third-person-allow$/;
const LOCKS = LOCKFILE;

const found = [];
for (const f of files) {
  if (SKIP.test(f) || LOCKS.test(f) || OWN_LIST.test(f)) continue;
  let text;
  try { text = readFileSync(join(repo, f), 'utf8'); } catch { continue; }

  const lines = text.split('\n');
  // A MARKED REGION, never a whole file. Every gate that matches on these shapes
  // has to contain them, and a per-file exemption would take its HEADER PROSE
  // with it — which is exactly where a real reference hides, because a header
  // explaining the rule is the most natural place to write a sentence about the
  // person the rule is for. `privacy-check.mjs` reached the same conclusion
  // about itself; this is the shared spelling of it.
  let inSentinel = false;
  let openedAt = 0;
  const scannable = [];
  lines.forEach((line, i) => {
    if (SENTINEL_OPEN.test(line)) { inSentinel = true; openedAt = i + 1; return; }
    if (SENTINEL_CLOSE.test(line)) { inSentinel = false; openedAt = 0; return; }
    if (inSentinel) return;
    // A hash or a minified bundle is not prose, and a word boundary inside
    // base64 is not a word. **The test is an unbroken RUN, never the line's
    // length** — this read `line.length > 300` for its first eleven days and
    // that number was measured against nothing. A sibling writes markdown one
    // paragraph per line with soft-wrap off, so 632 of its tracked lines cleared
    // 300 characters as ordinary prose and the pronoun rule never ran on any of
    // them: 12 real references stood in three files, one of them the repo's own
    // source of truth, with this gate reporting the tree clean. Hand-written
    // prose has no 80-character word; a hash, a data URI and a minified bundle
    // are nothing but. Measured over both repos after the change: the same 45
    // and 44 machine lines skipped, and zero prose lines lost.
    if (MACHINE_RUN.test(line)) return;
    for (const m of line.matchAll(PRONOUN_G)) found.push({ f, n: i + 1, w: m[0] });
    scannable.push([i, line]);
  });

  // RULE 2 RUNS OVER THE JOINED TEXT, and that is not tidiness. The possessive
  // is two tokens with whitespace between them, and prose wraps: the role noun
  // can end one line with the possession starting the next. A line-by-line scan
  // cannot see that pair, and the first real one was found by hand in
  // DOCTRINE.md §7f with this gate reporting the file clean.
  //
  // The pronoun rule stays per-line because a pronoun is one word and cannot
  // straddle a break.
  //
  // Sentinel lines and over-long lines are dropped rather than blanked, so a
  // pattern's own source cannot be stitched to the prose after it; the line
  // number carried alongside each line keeps the report honest.
  const joined = scannable.map(([, l]) => l).join('\n');
  const lineOf = (index) => {
    const upto = joined.slice(0, index).split('\n').length - 1;
    return (scannable[upto]?.[0] ?? 0) + 1;
  };
  for (const m of joined.matchAll(POSSESSIVE_G)) {
    found.push({ f, n: lineOf(m.index), w: m[0].replace(/\s+/g, ' ') });
  }
  // Joined, like the possessive rule, because an attribution wraps across a
  // line as readily as anything else and six of these were written that way.
  for (const m of joined.matchAll(ATTRIBUTION_G)) {
    found.push({ f, n: lineOf(m.index), w: m[0].replace(/\s+/g, ' ') });
  }

  // AN UNCLOSED REGION IS A FAILURE, NEVER A SKIP TO END-OF-FILE. A document
  // explaining these markers has to name them, and a sentence naming the
  // opening marker opens a region as surely as the marker itself does —
  // silently swallowing everything after it while the gate reports the tree
  // clean. It is the same shape as the length cap this file already carries a
  // note about: a skip whose condition is wider than the hazard it was written
  // for. Reported as an undeclarable finding rather than a warning, because a
  // warning here is a line of output nobody reads.
  if (openedAt) found.push({ f, n: openedAt, w: 'UNCLOSED SENTINEL REGION' });
}

/** Declared exceptions: `file | reason | the matched word`. Text rather than a
 *  line number, because a line number moves under an edit and a stale number
 *  silently stops covering the thing it was written for. */
const listPath = join(repo, '.third-person-allow');
const allowed = new Set();
const declared = [];
if (existsSync(listPath)) {
  for (const raw of readFileSync(listPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [file, reason, ...rest] = line.split('|').map((s) => s.trim());
    const word = rest.join('|').trim();
    if (!file || !reason || !word) {
      console.log(`  FAIL  malformed line in .third-person-allow: ${line.slice(0, 60)}`);
      process.exit(1);
    }
    allowed.add(`${file} ${word.toLowerCase()}`);
    declared.push({ file, word: word.toLowerCase(), reason });
  }
}

const undeclared = found.filter((h) => !allowed.has(`${h.f} ${h.w.toLowerCase()}`));

if (listing) {
  console.log('\n  Seed for .third-person-allow - CHECK EVERY LINE BEFORE PASTING IT.');
  console.log('  A reference to the OWNER is never declarable. Rewrite it: say the');
  console.log('  ROLE for a governance fact, and for anything else say what was');
  console.log('  wrong and what it measured.\n');
  const seen = new Set();
  for (const h of undeclared) {
    const key = `${h.f} ${h.w.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`${h.f} | REASON | ${h.w}`);
  }
  process.exit(0);
}

let failed = 0;

// BOTH DIRECTIONS. A declaration matching nothing is a rule that has quietly
// stopped applying — which is how a scrub un-covers a file without anybody
// noticing, and it is the defect `plain.mjs` and `quote-check.mjs` both carry a
// second half for.
const live = new Set(found.map((h) => `${h.f} ${h.w.toLowerCase()}`));
const stale = declared.filter((d) => !live.has(`${d.file} ${d.word}`));
if (stale.length) {
  failed = 1;
  console.log(`  FAIL  ${stale.length} declaration(s) in .third-person-allow match nothing any more:`);
  for (const d of stale.slice(0, 12)) console.log(`          ${d.file} | ${d.word}`);
  console.log('        Remove them, or the list stops covering what it says it covers.');
}

if (undeclared.length) {
  failed = 1;
  const byFile = new Map();
  for (const h of undeclared) byFile.set(h.f, (byFile.get(h.f) || 0) + 1);
  const ranked = [...byFile.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`  FAIL  ${undeclared.length} third-person reference(s) in ${byFile.size} file(s).`);
  console.log('        Locations only - this repo is public and so is a failing run log.\n');
  for (const [f, n] of ranked) {
    const where = undeclared.filter((h) => h.f === f).map((h) => h.n);
    const shown = where.slice(0, 14).join(', ');
    console.log(`  ${String(n).padStart(4)}  ${f}`);
    console.log(`        lines ${shown}${where.length > 14 ? `, +${where.length - 14} more` : ''}`);
  }
  console.log('\n        Say the ROLE for a governance fact. For anything else, write');
  console.log('        what was wrong and what it measured - never who reported it,');
  console.log('        and never in what words.');
}

if (!failed) console.log('no third-person references to the owner in tracked files.');
console.log('');
process.exit(failed);
