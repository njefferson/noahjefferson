// The case and plant of quote-check.mjs. The shape is shape.mjs. The count it prints is held to the docs check's in guard-cases/docs-check.mjs.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

// A set-apart quotation: a blockquote whose content is an emphasised quotation.
const QUOTATION = '> *"words set apart in a block, nobody declared"*\n';

export const cases = [
  {
    name: 'quote-check.mjs reads a new markdown file that is not staged: an undeclared set-apart quotation in it fails the run and names the file, and a run on a clean tree passes',
    guards: ['quote_check_one_set'],
    run(m, dir, h) {
      const r = h.repo({ 'a.md': 'A clean note.\n' });
      const runIt = () => spawnSync('node', [join(dir, 'quote-check.mjs'), '--repo', r.dir], { encoding: 'utf8', timeout: 30000 });
      const clean = runIt();
      r.write('fresh.md', `A new note, not staged.\n${QUOTATION}`);
      const dirty = runIt();
      return h.assertAll([
        ['a clean tree passes', clean.status === 0, `exit ${clean.status}: ${clean.stdout}${clean.stderr}`],
        ['an undeclared quotation in a file that is not staged fails', dirty.status === 1, `exit ${dirty.status}: ${dirty.stdout}${dirty.stderr}`],
        ['the failure names the new file', /fresh\.md:\d+/.test(dirty.stdout), dirty.stdout],
        ['the count it prints holds the new file', /read 2 markdown file/.test(dirty.stdout), dirty.stdout],
      ]);
    },
  },
];

export const plants = {
  quote_check_one_set: ['files = gateMarkdown(repo);', "files = execSync('git ls-files', { cwd: repo }).toString().split('\\n').filter((f) => f.endsWith('.md'));", 'quote-check.mjs'],
};
