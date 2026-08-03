#!/usr/bin/env node
/**
 * docs-check.mjs — the no-grid gate (Doctrine §2).
 *
 * THE TEST IS HOW A TABLE ARRIVES, NOT WHERE IT LIVES.
 *
 * In chat and in `git log`, markdown is delivered RAW. A table reaches Noah as
 * pipe-and-dash noise he has to scroll far to the right to read, and the
 * right-hand columns are effectively lost while the prose around them looks
 * fine. Inside an `.md` file it is a different object entirely: GitHub renders
 * it as a real table on his device, and it is not a problem.
 *
 * So this gate reads COMMIT MESSAGES. It used to walk every tracked `.md`,
 * which was the 2026-07-29 reading of the rule; Noah narrowed it on 2026-08-03
 * ("If they display correctly, leave them alone") and the file sweep went with
 * it. Nine tables in Frame's docs are standing on that ruling — do not point
 * this at `.md` files again without him saying so.
 *
 * Commit messages stay in scope because he reads them in `git log` and in
 * narrow commit views, and in some apps the last commits ARE the in-app patch
 * notes (Doctrine §5).
 *
 * A rule nothing enforces is a preference (§16.8). But note the honest limit:
 * THE GATE CANNOT SEE A CHAT REPLY, and chat is the surface that actually keeps
 * breaking. That half is on the session, which is why it is also one line in
 * the hub's `CLAUDE.md` — the file the harness injects rather than the file a
 * session must remember to open.
 *
 * Lives in the hub because the rule is doctrine-wide; sibling repos run it from
 * here rather than forking it, exactly like `palette-check.mjs`.
 *
 *   node docs-check.mjs                      # this repo, unpushed commits
 *   node ../noahjefferson/docs-check.mjs .   # from a sibling repo
 *   node docs-check.mjs . -n 50              # the last 50 commits
 *   node docs-check.mjs . origin/main..HEAD  # an explicit range
 *   node docs-check.mjs . --all              # all of history (expect old hits)
 *
 * Exits non-zero, naming the commit and the line inside its message.
 */

import { execFileSync } from 'node:child_process';

/**
 * A GFM table is only a table if it has a DELIMITER row — `|---|---|`. A line
 * of pipes on its own is prose, or a code sample, or a diagram. Keying on the
 * delimiter is what makes this precise enough to leave switched on.
 */
const DELIMITER = /^\s*\|?(?:\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?\s*$/;

/**
 * HTML grids are the same problem wearing different syntax.
 *
 * But `<table` ALONE is not evidence of one, and this took two goes to get
 * right — both caught by running the gate rather than by reading it.
 *
 * 1. It flagged the commit that INTRODUCED this gate, whose message says
 *    "fails on a GFM delimiter row or a <table> element". Prose about the rule.
 *    So: require a row tag somewhere in the message, since a real table has
 *    rows.
 * 2. It then flagged the commit that added THAT fix, whose message explains the
 *    fix and therefore mentions `<table>` and `<tr>/<td>` in the same breath.
 *    A whole-message test cannot separate markup from prose about markup.
 *
 * The discriminator that holds: MARKUP STARTS A LINE, prose mentions a tag
 * mid-sentence. A table pasted into a message begins its line with `<table`;
 * a sentence about one does not. This under-reports a table opened mid-line
 * after a colon, which nobody writes and which the GFM check catches anyway —
 * the right trade against a gate that cries wolf every time the rule is
 * discussed, because that gate gets switched off.
 */
const HTML_GRID = /^\s*<table[\s>]/i;
const HTML_ROW = /<(?:tr|td|th)[\s>/]/i;

/**
 * Find every grid in one message body.
 *
 * Fenced code is checked TOO, not skipped. Nothing renders a fence in `git log`
 * — the backticks arrive as backticks — so a table inside one is the same wide
 * unreadable block, wearing three extra characters.
 */
export function findGrids(source) {
  const lines = source.split('\n');
  const hits = [];
  const hasRows = HTML_ROW.test(source);

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
    if (hasRows && HTML_GRID.test(line)) {
      hits.push({ line: i + 1, kind: 'HTML table', text: line.trim() });
    }
  });

  return hits;
}

const git = (repo, args, quiet = false) =>
  execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    // The upstream probe is EXPECTED to fail on a fresh branch. Letting git's
    // own `fatal:` reach the terminal makes a normal run look broken.
    stdio: quiet ? ['ignore', 'pipe', 'ignore'] : undefined,
  });

/**
 * Which commits to read.
 *
 * The default is what this session has not pushed yet — the set you can still
 * amend. Scanning all history by default would fail on commits nobody can fix,
 * and a gate that is red for reasons outside your control is a gate people
 * learn to ignore.
 */
function resolveRange(repo, argv) {
  const explicit = argv.find((a) => a.includes('..'));
  if (explicit) return { range: [explicit], label: explicit };

  if (argv.includes('--all')) return { range: [], label: 'all history' };

  const nAt = argv.indexOf('-n');
  if (nAt !== -1 && argv[nAt + 1]) {
    return { range: ['-n', argv[nAt + 1]], label: `last ${argv[nAt + 1]} commits` };
  }

  try {
    const upstream = git(repo, [
      'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}',
    ], true).trim();
    return { range: [`${upstream}..HEAD`], label: `${upstream}..HEAD (unpushed)` };
  } catch {
    // No upstream: a fresh branch, or a detached head. Read something useful
    // rather than nothing — silence here would look exactly like a pass.
    return { range: ['-n', '20'], label: 'last 20 commits (no upstream set)' };
  }
}

/** %H, %s and %B per commit, with separators no commit message can contain. */
function readCommits(repo, range) {
  const raw = git(repo, [
    'log', '--no-merges', '--format=%H%x00%s%x00%B%x1e', ...range,
  ]);
  return raw
    .split('\x1e')
    .map((rec) => rec.replace(/^\n/, ''))
    .filter((rec) => rec.trim())
    .map((rec) => {
      const [sha, subject, body] = rec.split('\x00');
      return { sha, subject, body: body ?? '' };
    });
}

const argv = process.argv.slice(2);
const repo = argv.find((a) => !a.startsWith('-') && !a.includes('..')) ?? '.';
const { range, label } = resolveRange(repo, argv);

let failures = 0;
const commits = readCommits(repo, range);

for (const { sha, subject, body } of commits) {
  for (const hit of findGrids(body)) {
    failures += 1;
    console.error(`${sha.slice(0, 7)}  "${subject}"  message line ${hit.line}  ${hit.kind}`);
    console.error(`    ${hit.text}`);
  }
}

const n = commits.length;
if (failures) {
  console.error(
    `\nNO-GRID GATE FAILED — ${failures} grid${failures === 1 ? '' : 's'} in ${n} commit message${n === 1 ? '' : 's'} (${label}).`,
  );
  console.error(
    'A commit message is delivered RAW — the reader scrolls right and the columns are lost.',
  );
  console.error(
    'Rewrite each as a headed list — one item per heading, its facts on their own lines.',
  );
  console.error(
    'Unpushed commits can be amended or reworded; pushed ones stay as history.',
  );
  process.exit(1);
}

console.log(
  `no-grid gate: ${n} commit message${n === 1 ? '' : 's'} (${label}), no grids.`,
);
