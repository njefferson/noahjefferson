// The cases and plant of docs-check.mjs. The shape is shape.mjs. Two guard files stand behind its count: gate-files.mjs holds the set, quote-check.mjs counts from it too.
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const GRID = '| name | kind |\n|------|------|\n| one  | two  |\n';

export const cases = [
  {
    name: 'docs-check.mjs reads tracked markdown and new markdown that is not ignored: a grid in an unstaged file is refused and naming it, a grid in an ignored file is not read, a deleted tracked file is skipped, and its count of markdown files is the count the quote check prints on the same tree',
    guards: ['docs_check_one_set'],
    run(m, dir, h) {
      const r = h.repo({ 'a.md': 'A clean note.\n', 'gone.md': 'A note that goes.\n', '.gitignore': 'out-ignored/\n' });
      rmSync(join(r.dir, 'gone.md'));
      mkdirSync(join(r.dir, 'out-ignored'));
      writeFileSync(join(r.dir, 'out-ignored', 'grid.md'), GRID);
      r.write('fresh.md', 'A new clean note, not staged.\n');
      const docs = () => spawnSync('node', [join(dir, 'docs-check.mjs'), r.dir], { encoding: 'utf8', timeout: 30000 });
      const quotes = () => spawnSync('node', [join(dir, 'quote-check.mjs'), '--repo', r.dir], { encoding: 'utf8', timeout: 30000 });
      const before = docs();
      const quoteBefore = quotes();
      const docsCount = /no-grid gate: (\d+) markdown file/.exec(before.stdout)?.[1];
      const quoteCount = /read (\d+) markdown file/.exec(quoteBefore.stdout)?.[1];
      r.write('fresh.md', `A new note, not staged, holding a grid.\n${GRID}`);
      const after = docs();
      return h.assertAll([
        ['a tree whose only grid is in an ignored file passes', before.status === 0, `exit ${before.status}: ${before.stdout}${before.stderr}`],
        ['the docs check read the two markdown files that are there', docsCount === '2', `count ${docsCount}: ${before.stdout}`],
        ['the quote check printed the same count on the same tree', quoteCount === docsCount, `docs ${docsCount}, quote ${quoteCount}: ${quoteBefore.stdout}`],
        ['a grid in a new file that is not staged is refused', after.status === 1, `exit ${after.status}: ${after.stdout}${after.stderr}`],
        ['the refusal names the new file and not the ignored one', /fresh\.md:\d+/.test(after.stderr) && !/grid\.md/.test(after.stderr), after.stderr],
      ]);
    },
  },
  {
    name: 'docs-check.mjs still walks a folder that is not a git repository and refuses a grid in it',
    guards: [],
    run(m, dir, h) {
      const plain = h.tmp('docs-plain-');
      writeFileSync(join(plain, 'x.md'), GRID);
      const ran = spawnSync('node', [join(dir, 'docs-check.mjs'), plain], { encoding: 'utf8', timeout: 30000 });
      return h.assertAll([
        ['a grid in a folder that is no repository is refused', ran.status === 1 && /x\.md:\d+/.test(ran.stderr), `exit ${ran.status}: ${ran.stdout}${ran.stderr}`],
      ]);
    },
  },
];

export const plants = {
  docs_check_one_set: ['try { listed = gateMarkdown(root); }', 'try { listed = null; }', 'docs-check.mjs'],
};
