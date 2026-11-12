// The case and plants of third-person-check.mjs (they stood in the plan guard's case file, which went with the plan check). The shape is shape.mjs.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// The third-person pronoun, built from character codes: a string a case writes holds no word the third-person check reads as one.
const PRON = String.fromCharCode(104, 101);

export const cases = [
  {
    name: 'step 158: third-person-check.mjs exports the three patterns it scans with and scans nothing when it is imported, and still scans and fails a repository when it is run',
    guards: ['pg_tp_exports', 'pg_title_main_guard'],
    run(m, dir, h) {
      const imported = spawnSync('node', ['--input-type=module', '-e',
        `import * as t from ${JSON.stringify(pathToFileURL(join(dir, 'third-person-check.mjs')).href)}; console.log('keys:' + Object.keys(t).sort().join(','));`], { encoding: 'utf8', timeout: 30000 });
      const dirty = h.repo({ 'a.md': `${PRON} wrote the note\n` });
      const clean = h.repo({ 'a.md': 'The note was written by the role.\n' });
      const runIt = (r) => spawnSync('node', [join(dir, 'third-person-check.mjs'), '--repo', r.dir], { encoding: 'utf8', timeout: 30000 });
      const ranDirty = runIt(dirty);
      const ranClean = runIt(clean);
      return h.assertAll([
        ['an import exits 0 and prints only the keys', imported.status === 0 && imported.stdout.trim() === 'keys:ATTRIBUTION_G,POSSESSIVE_G,PRONOUN_G', `exit ${imported.status}: ${imported.stdout}${imported.stderr}`],
        ['a run on a repository with a pronoun fails', ranDirty.status === 1 && /third-person reference/.test(ranDirty.stdout), `exit ${ranDirty.status}: ${ranDirty.stdout}${ranDirty.stderr}`],
        ['a run on a clean repository passes', ranClean.status === 0 && /no third-person references/.test(ranClean.stdout), `exit ${ranClean.status}: ${ranClean.stdout}${ranClean.stderr}`],
      ]);
    },
  },
];

export const plants = {
  pg_tp_exports: ['export const PRONOUN_G = /', 'const PRONOUN_G = /', 'third-person-check.mjs'],
  pg_title_main_guard: ['const isMain = !!process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);', 'const isMain = true;', 'third-person-check.mjs'],
};
