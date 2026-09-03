#!/usr/bin/env node
// Essays: markdown in `essays/`, one hosted page each.
//
// `--check` regenerates and diffs against what is committed, so a source edit
// that never reached the page fails rather than shipping a stale essay. That is
// the shape `Quietkeep/tools/thesis.mjs` uses, and it is the only reason this is
// a generator rather than a one-off conversion.
//
// The two malformedness assertions below are that file's, and they matter more
// than the freshness check: a page can be perfectly up to date and unreadable.
// Both signatures are real failures the converter has produced.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { convert, CSS, page } from './doc-page.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'essays');
const OUT = join(ROOT, 'public');
const CHECK = process.argv.includes('--check');

/** WHO WROTE IT, in the reader's words. An essay declares one of these keys and
 *  the byline is DERIVED — there is no free-text byline to copy from the essay
 *  above it, because that is exactly how the first one went wrong: the footer
 *  string came in with the converter from a sibling repo, said the site's owner
 *  wrote the piece, and nobody had to state it, so nobody checked it. A page
 *  published on a person's own site is assumed to be theirs; a byline that is
 *  merely inherited makes that assumption a false claim.
 *
 *  An unknown or missing key is a FAILURE, never a default. There is no
 *  fallback here on purpose: a default byline is the same defect again. */
const BYLINES = {
  owner: 'Written by Noah Jefferson.',
  assistant: 'Written by an AI assistant working in this site\u2019s repository, and published here by Noah Jefferson.',
};

/** Per-essay metadata. An essay with no entry here is a FAILURE, never a skip:
 *  a file in `essays/` that silently does not publish is the same fail-open as
 *  a surface nothing measures. */
const META = {
  'planning-vocabularies': {
    title: 'Three planning vocabularies, and which one owns what',
    description: 'Military planning doctrine and project management practice describe overlapping things in different words. What each owns, what neither holds, and a working order for one person with no staff.',
    // Written in a session, in this repository. The git author of the commit
    // that created `essays/planning-vocabularies.md` is not the site's owner.
    author: 'assistant',
  },
};

/** The foot is the way on, and nothing else. It used to carry the byline too,
 *  which put the authorship where a reader arrives only after deciding to read. */
const FOOTER = '<a href="/">More at noahjefferson.pages.dev</a>';

const sources = readdirSync(SRC).filter((f) => f.endsWith('.md'));
let failed = 0;
const stale = [];

for (const file of sources) {
  const slug = basename(file, '.md');
  const meta = META[slug];
  if (!meta) {
    console.error(`  FAIL  essays/${file} has no entry in META — it would never publish.`);
    failed++;
    continue;
  }
  const byline = BYLINES[meta.author];
  if (!byline) {
    console.error(`  FAIL  ${slug}: author is ${JSON.stringify(meta.author)} — declare one of: ${Object.keys(BYLINES).join(', ')}`);
    failed++;
    continue;
  }
  const md = readFileSync(join(SRC, file), 'utf8');
  const body = convert(md);

  // A surviving `*` means an emphasis span opened and never closed.
  const strays = (body.match(/\*/g) ?? []).length;
  if (strays > 0) {
    console.error(`  FAIL  ${slug}: ${strays} literal asterisk(s) — an emphasis span is unpaired`);
    failed++;
  }
  // A paragraph opening on whitespace is a wrapped list item emitted on its own.
  const stranded = (body.match(/<p>\s/g) ?? []).length;
  if (stranded > 0) {
    console.error(`  FAIL  ${slug}: ${stranded} paragraph(s) begin with whitespace — a wrapped item was stranded`);
    failed++;
  }

  const html = page(body, { ...meta, slug, byline, footer: FOOTER });
  const target = join(OUT, `${slug}.html`);
  if (CHECK) {
    let current = '';
    try { current = readFileSync(target, 'utf8'); } catch { /* missing => differs */ }
    if (current !== html) stale.push(`${slug}.html`);
  } else {
    writeFileSync(target, html);
    console.log(`  wrote public/${slug}.html`);
  }
  // PRINTED ON EVERY RUN, both modes. A byline nobody ever sees stated is a
  // byline nobody ever checks, which is the whole history of this field.
  console.log(`        byline (${meta.author}): ${byline}`);
}

const cssTarget = join(OUT, 'essay.css');
if (CHECK) {
  let currentCss = '';
  try { currentCss = readFileSync(cssTarget, 'utf8'); } catch { /* missing */ }
  if (currentCss !== CSS) stale.push('essay.css');
} else {
  writeFileSync(cssTarget, CSS);
  console.log('  wrote public/essay.css');
}

if (failed > 0) {
  console.error('\nA page that is up to date is not the same claim as a page that is readable.');
  process.exit(1);
}
if (CHECK && stale.length > 0) {
  console.error(`  FAIL  out of date: ${stale.join(', ')} — run \`npm run essays\`.`);
  process.exit(1);
}
console.log(CHECK
  ? `every essay page matches its source (${sources.length})`
  : `${sources.length} essay(s) written`);
