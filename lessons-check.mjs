// lessons-check.mjs — makes LESSONS.md enforceable instead of merely readable.
//
// CANONICAL IN THE HUB, like palette-check.mjs and a11y-gate.mjs. Never fork it.
//
//   node lessons-check.mjs                    check the hub's LESSONS.md
//   node lessons-check.mjs --repo ../myapp    also resolve that repo's citations
//   node lessons-check.mjs --checklist        print only the session checklist
//
// WHY THIS EXISTS (Noah, 2026-08-02): "I thought lessons was a good document,
// but you don't do fuck-all with it." He was right. 2400 lines of hard-bought
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

import { readFileSync, existsSync } from 'node:fs';
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
  const tokens = text.split(/\s*·\s*|\s*;\s*/).map((t) => t.trim()).filter(Boolean);
  let recognised = 0;

  for (const tok of tokens) {
    const gate = /^GATE\s+([\w.-]+):(\S+)/.exec(tok);
    const check = /^CHECKLIST\s+(\S+)/.exec(tok);

    if (gate) {
      recognised += 1;
      const [, repo, path] = gate;
      gates.push({ title, repo, path });
      // Resolve what we can, and PRINT what we cannot — never skip silently.
      let base = null;
      if (repo === 'hub') base = HUB;
      else if (repoArg && repoArg.endsWith(repo)) base = repoArg;
      else if (existsSync(join(HUB, '..', repo))) base = join(HUB, '..', repo);

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
      checklist.push({ id: check[1], title, text: firstRule(body) });
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

function firstRule(body) {
  const m = /\*\*(.+?)\*\*/s.exec(body);
  return m ? ' '.repeat(0) + m[1].replace(/\s+/g, ' ').slice(0, 116) : '';
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
