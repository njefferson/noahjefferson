#!/usr/bin/env node
// example-check.mjs — every seeded example on a surface says it was invented.
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node example-check.mjs                     check the hub
//   node example-check.mjs --repo ../app       check a sibling
//   node example-check.mjs --repo ../app --list  print a seed for .example-allow
//
// ## What this is for
//
// A form's example copy — the grey text in an empty field, the one sample row an
// output panel ships so it is not blank — is READ BEFORE ANYTHING ELSE on the
// page. It is also the copy least likely to be re-read after the day it was
// typed: it is not a heading, it never fails a test, and it looks like
// scaffolding rather than something published.
//
// So it is where the nearest real thing ends up. The plan walk on this site
// shipped four examples taken from a live plan of the owner's, because that was
// the plan in front of the session that built the page, and they then loaded
// into a stranger's browser on a public site under the owner's name. Nothing
// caught it: every one is valid markup, honest prose, carries no name, and reads
// exactly like copy somebody wrote on purpose.
//
// The three gates beside this one cannot see it. `privacy-check.mjs` anchors on
// the owner's NAME and there is none in a placeholder. `quote-check.mjs` finds
// the set-apart quotation shape, and a placeholder is not one.
// `third-person-check.mjs` looks for a bare pronoun attributing something, and
// an example attributes nothing — it just quietly IS somebody's real work.
//
// ## Why a declared list, and not a rule about content
//
// No pattern can tell an invented plan from a real one. They are the same
// sentence. What CAN be checked is whether anybody ever stated which it was —
// so every example is declared once, in `.example-allow`, with a word for where
// it came from, and the whole list PRINTS ON EVERY RUN. Same shape as
// `.quote-allow` and Solve-ent's `.copy-allow`, and for the reason LESSONS 103
// gives: the only thing that has ever stopped this class of defect is a check at
// the moment of the change.
//
// Both directions. A declaration matching nothing is a FAILURE, not a skip — a
// scrub that removes an example must remove its line too, or the list slowly
// becomes a record of copy that is no longer there, which is how an allow-list
// stops being read.
//
// ## What it finds, and the honest limits
//
// Two exact shapes, both of which put text on a screen before the reader types:
//
//   1. a placeholder attribute, in any tracked surface file
//   2. an element carrying `data-example`, whose text content is the sample
//
// It does NOT find a default value assigned in script, a sample in a fixture, or
// a scenario written into prose. Shape 2 exists because of that gap: an example
// that lives in markup rather than in an attribute has to be MARKED to be seen,
// and marking it is the same act as declaring it. An unmarked one is invisible
// here and this file will not pretend otherwise.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { repoFromArgv } from './gate-args.mjs';

const { REPO, NAME, GIVEN } = repoFromArgv(process.argv.slice(2), { gate: 'example-check.mjs' });
const LIST = process.argv.includes('--list');

/** Where an example came from. `real` is deliberately absent and never added:
 *  an example taken from somebody's actual work is the defect, not a category. */
const KINDS = new Set(['invented', 'product-copy', 'public-data']);

/** Files that put text in front of a reader. Tooling is not a surface. */
const SURFACE = /\.(html?|jsx?|mjs|tsx?|svelte|vue)$/;

const tracked = execFileSync('git', ['-C', REPO, 'ls-files'], { encoding: 'utf8' })
  .split('\n').filter((f) => f && SURFACE.test(f));

const strip = (html) => html
  .replace(/<[^>]*>/g, ' ')
  .replace(/&mdash;/g, '—').replace(/&rarr;/g, '→')
  .replace(/&rsquo;/g, '’').replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#9432;/g, 'ℹ')
  .replace(/\s+/g, ' ').trim();

/** The text of the element that carries `data-example`, by tag depth rather than
 *  by the next closing tag — a sample row is a list item with spans inside it,
 *  and the first `</span>` is not the end of it. */
const markedExample = (src, at) => {
  const tag = /<([a-zA-Z][\w-]*)/.exec(src.slice(at))?.[1];
  if (!tag) return null;
  const open = new RegExp(`<${tag}\\b`, 'gi');
  const close = new RegExp(`</${tag}\\s*>`, 'gi');
  let depth = 0, i = at;
  while (i < src.length) {
    open.lastIndex = i; close.lastIndex = i;
    const o = open.exec(src); const c = close.exec(src);
    if (!c) return null;
    if (o && o.index < c.index) { depth++; i = o.index + 1; continue; }
    depth--; i = c.index + 1;
    if (depth === 0) return strip(src.slice(at, c.index + c[0].length));
  }
  return null;
};

const found = [];
let failed = 0;
for (const file of tracked) {
  const src = readFileSync(join(REPO, file), 'utf8');
  for (const m of src.matchAll(/placeholder\s*=\s*(["'])([^"']+)\1/g)) {
    found.push({ file, text: strip(m[2]) });
  }
  for (const m of src.matchAll(/data-example\b/g)) {
    // IS IT ACTUALLY IN A START TAG? The marker's own name appears in this
    // gate's source, in a comment and in the regex above, and the first version
    // took each one for markup, failed to close an element that was never
    // opened, and printed FAIL — while exiting 0, because that branch never
    // touched the counter. A gate that says FAIL and returns green is the one
    // failure mode this whole family is written about. Both halves fixed: the
    // containment test below, and the counter.
    const start = src.lastIndexOf('<', m.index);
    const inTag = start !== -1
      && /^<[a-zA-Z][\w-]*[\s>]/.test(src.slice(start, start + 40))
      && !src.slice(start, m.index).includes('>');
    if (!inTag) continue;
    const text = markedExample(src, start);
    if (text) found.push({ file, text });
    else { console.error(`  FAIL  ${file}: data-example on an element this gate could not close`); failed++; }
  }
}

const allowPath = join(REPO, '.example-allow');
const raw = existsSync(allowPath) ? readFileSync(allowPath, 'utf8') : '';
const allow = raw.split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [file, kind, ...rest] = l.split('|').map((s) => s.trim());
    return { file, kind, prefix: rest.join('|'), line: l, used: 0 };
  });

console.log(`=== example gate · ${NAME} ===\n`);

if (LIST) {
  for (const f of found) console.log(`${f.file} | invented | ${f.text.slice(0, 70)}`);
  console.log(`\n${found.length} example(s). Declare each, then re-run without --list.`);
  process.exit(0);
}

for (const f of found) {
  const hit = allow.find((a) => a.file === f.file && f.text.startsWith(a.prefix));
  if (!hit) {
    console.error(`  FAIL  ${f.file}: undeclared example — ${f.text.slice(0, 70)}`);
    failed++;
  } else if (!KINDS.has(hit.kind)) {
    console.error(`  FAIL  ${f.file}: kind ${JSON.stringify(hit.kind)} — one of: ${[...KINDS].join(', ')}`);
    failed++;
    hit.used++;  // it MATCHED; counting it unused too would report one fault twice
  } else {
    hit.used++;
  }
}
for (const a of allow) {
  if (a.used === 0) {
    console.error(`  FAIL  .example-allow declares an example that is not there: ${a.line}`);
    failed++;
  }
}

// THE LIST PRINTS EVERY RUN. A declaration nobody sees is the field this gate
// was written about.
for (const a of allow) if (a.used) console.log(`  ${a.kind.padEnd(12)} ${a.file} — ${a.prefix}`);

if (failed) {
  console.error(`\n${failed} failure(s). Seed the list: node example-check.mjs --repo ${GIVEN} --list`);
  console.error('An example is published copy. Invent the scenario; never reach for the nearest real one.');
  process.exit(1);
}
console.log(`\nevery example on a surface is declared (${found.length}).`);
