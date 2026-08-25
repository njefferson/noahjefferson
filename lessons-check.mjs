// lessons-check.mjs — makes LESSONS.md enforceable instead of merely readable.
//
// CANONICAL IN THE HUB, like palette-check.mjs and a11y-gate.mjs. Never fork it.
//
//   node lessons-check.mjs                    check the hub's LESSONS.md
//   node lessons-check.mjs --repo ../myapp    also resolve that repo's citations
//   node lessons-check.mjs --checklist        print only the session checklist
//
// WHY THIS EXISTS (
// That was right. 2400 lines of hard-bought
// knowledge that every session reads and then ignores, because reading is all
// the file ever asked for.
//
// THE CONTRACT. Every `## ` section must declare HOW IT IS ENFORCED, on a line
// reading `**Enforced by:** …`, naming one or more of:
//
//   GATE <repo>:<path>   an executable check. The file must EXIST. A cited gate
//                        that does not exist is the exact failure §7g and
//                        Doctrine §4 are both about — a rule that claims
//                        enforcement it never had.
//   CHECKLIST <id>       a session-time step no script can perform. Printed, so
//                        it is read at the moment it matters rather than
//                        discovered afterwards.
//   JUDGEMENT            genuinely not checkable. Must ALSO carry a `**Smell:**`
//                        line — the recognisable signature — so the lesson is
//                        searchable when you are standing in it.
//
// A section with NO declaration FAILS. That is the point: it makes the un-gated
// lessons countable instead of letting them blend in with the gated ones.
//
// EXITS NON-ZERO on any failure.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HUB = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const repoArg = (() => {
  const i = args.indexOf('--repo');
  return i >= 0 && args[i + 1] ? resolve(args[i + 1]) : null;
})();
const CHECKLIST_ONLY = args.includes('--checklist');

const src = readFileSync(join(HUB, 'LESSONS.md'), 'utf8');
const lines = src.split('\n');

let lessonCount = 0;
const failures = [];
const unverified = [];
const checklist = [];
const gates = [];
const judgements = [];

/* ------------------------------------------------------------------ *
 * parse
 * ------------------------------------------------------------------ */

const heads = lines.map((l, i) => [l, i]).filter(([l]) => l.startsWith('## '));
if (!heads.length) {
  console.error('lessons-check: no `## ` sections found — is this the right file?');
  process.exit(1);
}
heads.push(['', lines.length]);

// EVERY LESSON NUMBER IS UNIQUE, because the number IS the citation.
//
// This file is cited by number from everywhere: DOCTRINE.md, both CLAUDE.mds,
// the gates' own source, sibling NOTES and ADRs, and commit messages that can
// never be edited. "LESSONS §31" has to resolve to one lesson or the citation
// is decoration.
//
// It went wrong the ordinary way and nothing noticed: sessions append
// concurrently, each takes "the next number" off the copy it read, and both are
// right at the moment they look. Found with six lessons sharing three numbers —
// §26, §30 and §31 — while §26 was cited four times from DOCTRINE.md,
// CLAUDE.md and handoff-check.mjs, all meaning only one of them.
//
// The rule when it happens: the lesson the existing citations resolve to KEEPS
// the number, and the other takes a fresh one off the end. Renumbering the
// cited one silently rewrites history that has already been read.
const byNumber = new Map();
for (const [head] of heads) {
  const n = /^##\s*(\d+[a-z]?)\b/.exec(head)?.[1];
  if (!n) continue;
  if (!byNumber.has(n)) byNumber.set(n, []);
  byNumber.get(n).push(head.replace(/^##\s*/, '').trim());
}
// AND A GAP IS THE SAME FAULT WEARING THE OTHER FACE (2026-08-25).
//
// Two sessions writing 141 collide and are caught above. A session working from
// a STALE CLONE does not collide — it writes 141 while the file it cannot see
// ends at 139, and nothing is ambiguous afterwards. What is wrong is that §140
// now resolves to nothing, and a citation to it reads as a lesson that was
// never learned rather than one that was never fetched.
//
// This happened: a clone 45 commits behind produced an entry numbered against a
// months-old file. Git rejected the push, which is the only reason it surfaced.
// Rejection is not a gate — it depends on somebody else having pushed first.
//
// A DELIBERATELY RETIRED LESSON KEEPS ITS HEADING and says it is retired. A
// citation must always land somewhere: "this was withdrawn, and why" is an
// answer, and silence is not.
const nums = [...byNumber.keys()].map((n) => parseInt(n, 10)).filter(Number.isFinite);
if (nums.length > 1) {
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  const missing = [];
  for (let n = sorted[0]; n < sorted[sorted.length - 1]; n += 1) {
    if (!sorted.includes(n)) missing.push(n);
  }
  if (missing.length) {
    failures.push(
      `LESSONS.md skips ${missing.length === 1 ? 'lesson' : 'lessons'} ${missing.join(', ')}, `
      + `between ${sorted[0]} and ${sorted[sorted.length - 1]}. A citation to §${missing[0]} `
      + 'resolves to nothing.\n'
      + '      A gap usually means the entry was written against a clone that had not\n'
      + '      been fetched — the number was chosen from a file that was already behind.\n'
      + '      Fetch, renumber off the real end, and check the entry still says something\n'
      + '      the newer lessons have not already said.\n'
      + '      If a lesson was RETIRED, keep its heading and say so there. A citation has\n'
      + '      to land somewhere; "withdrawn, and why" is an answer and silence is not.',
    );
  }
}

for (const [n, titles] of byNumber) {
  if (titles.length < 2) continue;
  failures.push(
    `LESSONS.md has ${titles.length} lessons numbered ${n}, so a citation to §${n} is ambiguous:\n`
    + titles.map(t => `        · ${t.slice(0, 66)}`).join('\n')
    + '\n      The one existing citations resolve to keeps the number; the other takes a fresh one.',
  );
}

for (let k = 0; k < heads.length - 1; k++) {
  const [head, at] = heads[k];
  const body = lines.slice(at + 1, heads[k + 1][1]).join('\n');
  const title = head.replace(/^##\s*/, '').trim();
  // Only NUMBERED sections are lessons. The file also carries prose sections
  // (the contract explainer at the top), and one of those necessarily quotes
  // the words "Enforced by" while describing the rule — which made it pass as
  // a lesson enforcing itself. Suspect the instrument first (PALETTES.md §7).
  if (!/^\d/.test(title)) continue;
  lessonCount += 1;
  const where = `LESSONS.md "${title.slice(0, 52)}"`;

  const decl = /\*\*Enforced by:\*\*\s*(.+)/.exec(body);
  if (!decl) {
    failures.push(
      `${where}: no "**Enforced by:**" line. Every lesson must say how it is `
      + 'enforced — GATE, CHECKLIST or JUDGEMENT. A lesson that declares nothing '
      + 'is a lesson nobody is accountable for.',
    );
    continue;
  }

  const text = decl[1].trim();
  // `·` is the separator between declarations; a semicolon is PUNCTUATION.
  // Splitting on `;` too meant any declaration whose description contained one
  // was cut in half — the surplus fragment was silently dropped as an
  // unrecognised token, and the checklist printed the truncated rule. Four
  // declarations were affected, §8's among them.
  const tokens = text.split(/\s*·\s*/).map((t) => t.trim()).filter(Boolean);
  let recognised = 0;

  for (const tok of tokens) {
    const gate = /^GATE\s+([\w.-]+):(\S+)/.exec(tok);
    const check = /^CHECKLIST\s+(\S+)/.exec(tok);

    if (gate) {
      recognised += 1;
      const [, repo, path] = gate;
      gates.push({ title, repo, path });
      // Resolve what we can, and PRINT what we cannot — never skip silently.
      //
      // CASE-INSENSITIVELY, because a citation is written in prose and a clone
      // is named by whoever cloned it. Three real citations to a sibling read
      // UNVERIFIED for as long as this compared exactly: the lessons say
      // `quietkeep:` and the working copy beside the hub is `Quietkeep`. An
      // unverifiable citation is the weaker form of the hazard this check
      // exists for — a gate named in a lesson reads as coverage whether or not
      // anybody could confirm it is there.
      const eq = (a, b) => a.toLowerCase() === b.toLowerCase();
      let base = null;
      if (repo === 'hub') base = HUB;
      else if (repoArg && eq(repoArg.split('/').filter(Boolean).pop() || '', repo)) base = repoArg;
      else {
        const siblings = join(HUB, '..');
        const match = existsSync(siblings)
          ? readdirSync(siblings, { withFileTypes: true })
            .filter((e) => e.isDirectory()).map((e) => e.name).find((n) => eq(n, repo))
          : undefined;
        if (match) base = join(siblings, match);
      }

      if (!base) {
        unverified.push(`${where}: cites GATE ${repo}:${path} — ${repo} is not checked out here, so its existence is UNVERIFIED.`);
      } else if (!existsSync(join(base, path))) {
        failures.push(
          `${where}: cites GATE ${repo}:${path}, which DOES NOT EXIST. `
          + 'A cited gate that is not there is worse than no citation — it reads as coverage (§7g).',
        );
      }
    } else if (check) {
      recognised += 1;
      // Prefer the rule written INTO the declaration, after the em-dash — it
      // was authored to be the one-line statement of the lesson. firstRule()
      // scrapes the first bold run in the prose, which is a good guess and
      // sometimes lands mid-sentence: the checklist printed "of the
      // limitation" and "changed nothing and the gate stayed green." as if
      // they were rules. This is the part of LESSONS meant to be READ before a
      // handoff, so a fragment here is a lesson that does not land.
      const stated = /—\s*(.+)$/s.exec(tok.slice(check[0].length));
      const text = stated ? stated[1].replace(/\s+/g, ' ').trim() : firstRule(body);
      checklist.push({ id: check[1], title, text });
    } else if (/^JUDGEMENT\b/.test(tok)) {
      recognised += 1;
      const smell = /\*\*Smell:\*\*\s*(.+)/.exec(body);
      if (!smell) {
        failures.push(
          `${where}: declares JUDGEMENT but carries no "**Smell:**" line. `
          + 'An unautomatable lesson still has to be recognisable, or it is just prose.',
        );
      } else {
        judgements.push({ title, smell: smell[1].trim() });
      }
    }
  }

  if (!recognised) {
    failures.push(`${where}: "**Enforced by:** ${text.slice(0, 60)}" matches no known form (GATE / CHECKLIST / JUDGEMENT).`);
  }
}

// The lesson's own shout-across-a-room rule — NOT the declaration line, which
// now sits first in every section and made every checklist entry read
// "Enforced by:". A checklist that does not say what to do is decoration.
function firstRule(body) {
  for (const m of body.matchAll(/\*\*(.+?)\*\*/gs)) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (/^(Enforced by|Smell)\s*:/.test(t)) continue;
    if (t.length < 12) continue;                 // skip inline emphasis
    return t.slice(0, 116);
  }
  return '';
}

/* ------------------------------------------------------------------ *
 * report
 * ------------------------------------------------------------------ */

if (CHECKLIST_ONLY) {
  console.log('=== LESSONS checklist — steps no script can perform for you ===\n');
  for (const c of checklist) {
    console.log(`  [${c.id}]  ${c.title}`);
    if (c.text) console.log(`         ${c.text}`);
  }
  process.exit(0);
}

console.log('=== lessons gate ===');
console.log(`${lessonCount} lessons · ${gates.length} gated · ${checklist.length} checklist · ${judgements.length} judgement`);

if (gates.length) {
  console.log('\nGATED — a named check stands behind these:');
  for (const g of gates) console.log(`  ✓ ${g.repo}:${g.path}  ← ${g.title.slice(0, 58)}`);
}
if (checklist.length) {
  console.log('\nCHECKLIST — no script can do these. Run `--checklist` at handoff time:');
  for (const c of checklist) console.log(`  · [${c.id}] ${c.title.slice(0, 62)}`);
}
if (judgements.length) {
  console.log('\nJUDGEMENT — not checkable. Recognise the smell:');
  for (const j of judgements) console.log(`  · ${j.title.slice(0, 40)} — ${j.smell.slice(0, 90)}`);
}
if (unverified.length) {
  // §4's rule: exemptions are PRINTED, never silent.
  console.log(`\nUNVERIFIED HERE (${unverified.length}) — reported, never skipped:`);
  for (const u of unverified) console.log(`  ? ${u}`);
}

if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log('\nA lesson that declares no enforcement is a lesson that will be ignored');
  console.log('again. Doctrine §16.8: make it a gate, not an intention. Exiting non-zero.');
  process.exit(1);
}
console.log('\nPASS — every lesson declares how it is enforced, and every cited gate exists.');
