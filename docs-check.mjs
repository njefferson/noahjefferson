#!/usr/bin/env node
/**
 * docs-check.mjs — the no-grid gate (Doctrine §3).
 *
 * Markdown tables do not display on Noah's iPad. They arrive as pipe-and-dash
 * noise with the right-hand columns simply gone, so the content inside them is
 * lost — not degraded, LOST, and silently, because the prose around them reads
 * fine. The doctrine has banned them since the beginning and they kept coming
 * back: a session reads the rule at the start of a long session and then writes
 * a table four hours later because a comparison felt tabular. Three documents
 * had accumulated 62 rows between them, including `NOTES.md`, the file its own
 * CLAUDE.md says to read first every session.
 *
 * A rule nothing enforces is a preference. This is the same argument as
 * §16.8 — declare it so it is a gate and not an intention.
 *
 * Lives in the hub because the rule is doctrine-wide; sibling repos run it from
 * here rather than forking it, exactly like `palette-check.mjs`.
 *
 *   node ../noahjefferson/docs-check.mjs .
 *   node docs-check.mjs .            # from the hub
 *
 * Exits non-zero, naming file and line, with the offending text.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/** Directories never worth walking. */
// `.hub` is a sibling repo's CI checkout of THIS repo, vendored so it can run
// these gates without forking them. Auditing it from the sibling means auditing
// the hub's docs twice, from a repo that cannot fix them — and the sibling's
// build goes red for a file it does not own. The hub audits itself.
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.wrangler', '.hub']);

/**
 * A GFM table is only a table if it has a DELIMITER row — `|---|---|`. A line
 * of pipes on its own is prose, or a code sample, or a diagram. Keying on the
 * delimiter is what makes this precise enough to leave switched on.
 */
const DELIMITER = /^\s*\|?(?:\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?\s*$/;

/** HTML grids are the same problem wearing different syntax. */
const HTML_GRID = /<table[\s>]/i;

/**
 * Find every grid in one markdown source.
 *
 * Fenced code is checked TOO, not skipped. A table inside a fence still renders
 * as a horizontally-scrolling monospace block on a phone, which is the exact
 * failure this exists to stop — the fence changes the font, not the legibility.
 */
export function findGrids(source) {
  const lines = source.split('\n');
  const hits = [];

  lines.forEach((line, i) => {
    if (DELIMITER.test(line) && line.includes('|')) {
      // The header above it is the readable part; report that, not the dashes.
      const header = i > 0 ? lines[i - 1].trim() : '';
      hits.push({
        line: i + 1,
        kind: 'markdown table',
        text: header || line.trim(),
      });
      return;
    }
    // INLINE CODE IS STRIPPED FIRST. A sentence that NAMES the element —
    // "avoid a `<table>` for the cross-tab" — is prose about the rule, not a
    // breach of it, and backticked markup renders as literal text rather than a
    // grid. The lesson explaining this rule tripped it, which is the clearest
    // possible sign the check was wrong: a gate that fires on its own
    // documentation is one people learn to work around.
    //
    // Fenced blocks stay in scope (see above) — that is deliberate and
    // different: a real table in a fence still renders as a scrolling block.
    if (HTML_GRID.test(line.replace(/`[^`]*`/g, ''))) {
      hits.push({ line: i + 1, kind: '<table> element', text: line.trim() });
    }
  });

  return hits;
}

/** Every .md under a root, minus the directories nobody edits by hand. */
function markdownFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.md')) out.push(full);
    }
  };
  walk(root);
  return out.sort();
}

const roots = process.argv.slice(2);
if (!roots.length) {
  console.error('usage: docs-check.mjs <dir> [dir...]');
  process.exit(2);
}

let failures = 0;
let scanned = 0;

for (const rootArg of roots) {
  const root = resolve(rootArg);
  for (const file of markdownFiles(root)) {
    scanned += 1;
    const hits = findGrids(readFileSync(file, 'utf8'));
    for (const hit of hits) {
      failures += 1;
      console.error(`${relative(process.cwd(), file)}:${hit.line}  ${hit.kind}`);
      console.error(`    ${hit.text}`);
    }
  }
}

if (failures) {
  console.error(
    `\nNO-GRID GATE FAILED — ${failures} grid${failures === 1 ? '' : 's'} in ${scanned} file${scanned === 1 ? '' : 's'}.`,
  );
  console.error(
    'Tables do not display on the reader\'s device; the columns are lost, not squeezed.',
  );
  console.error(
    'Rewrite each as a headed list — one item per heading, its facts on their own lines.',
  );
  process.exit(1);
}

console.log(`no-grid gate: ${scanned} markdown file${scanned === 1 ? '' : 's'}, no grids.`);
