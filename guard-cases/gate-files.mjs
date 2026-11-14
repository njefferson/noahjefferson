// The case and plant of gate-files.mjs, the one set of files the docs, quote, privacy and third-person checks read. The shape is shape.mjs.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const GRID = '| name | kind |\n|------|------|\n| one  | two  |\n';

export const cases = [
  {
    name: 'gate-files.mjs lists tracked files and new files that are not ignored, and leaves out an ignored file and a nested repository: the docs check refuses a grid in a new file and passes a grid in an ignored folder and in a nested repository',
    guards: ['gate_files_others'],
    run(m, dir, h) {
      const r = h.repo({ 'a.md': 'A clean note.\n', '.gitignore': 'out-ignored/\n' });
      mkdirSync(join(r.dir, 'out-ignored'));
      writeFileSync(join(r.dir, 'out-ignored', 'grid.md'), GRID);
      const nested = join(r.dir, 'nested-checkout');
      mkdirSync(nested);
      spawnSync('git', ['-C', nested, 'init', '-q'], { encoding: 'utf8', timeout: 30000 });
      writeFileSync(join(nested, 'grid.md'), GRID);
      const docs = () => spawnSync('node', [join(dir, 'docs-check.mjs'), r.dir], { encoding: 'utf8', timeout: 30000 });
      const before = docs();
      r.write('fresh.md', GRID);
      const after = docs();
      return h.assertAll([
        ['a grid in an ignored folder and in a nested repository is not read', before.status === 0 && /no-grid gate: 1 markdown file/.test(before.stdout), `exit ${before.status}: ${before.stdout}${before.stderr}`],
        ['a grid in a new file that is not staged is read', after.status === 1 && /fresh\.md:\d+/.test(after.stderr), `exit ${after.status}: ${after.stdout}${after.stderr}`],
      ]);
    },
  },
];

export const plants = {
  gate_files_others: ["'--cached', '--others', '--exclude-standard'", "'--cached', '--exclude-standard'", 'gate-files.mjs'],
};
