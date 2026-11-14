// The case and plant of privacy-check.mjs. The shape is shape.mjs.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// A session trailer, built in two halves so that this file holds no line the check reads as one.
const TRAILER = 'Claude-' + 'Session: planted\n';

export const cases = [
  {
    name: 'privacy-check.mjs reads a new file that is not staged and not an ignored one: a session trailer in an unstaged file fails the run and names the file by line only, the same line in an ignored file passes, and a clean tree passes',
    guards: ['privacy_check_one_set'],
    run(m, dir, h) {
      const r = h.repo({ 'a.md': 'A clean note.\n', '.gitignore': 'out-ignored/\n' });
      mkdirSync(join(r.dir, 'out-ignored'));
      writeFileSync(join(r.dir, 'out-ignored', 'trailer.txt'), TRAILER);
      const runIt = () => spawnSync('node', [join(dir, 'privacy-check.mjs'), '--repo', r.dir], { encoding: 'utf8', timeout: 30000 });
      const clean = runIt();
      r.write('fresh.txt', `A new file, not staged.\n${TRAILER}`);
      const dirty = runIt();
      return h.assertAll([
        ['a tree whose only trailer is in an ignored file passes', clean.status === 0, `exit ${clean.status}: ${clean.stdout}${clean.stderr}`],
        ['a trailer in a new file that is not staged fails', dirty.status === 1, `exit ${dirty.status}: ${dirty.stdout}${dirty.stderr}`],
        ['the failure names the new file at its line and not the ignored one', /fresh\.txt:2/.test(dirty.stderr) && !/trailer\.txt/.test(dirty.stderr), dirty.stderr],
      ]);
    },
  },
];

export const plants = {
  privacy_check_one_set: ['const files = gateFiles(REPO).filter(f => !BINARY.test(f));', "const files = process.getBuiltinModule('node:child_process').execFileSync('git', ['-C', REPO, 'ls-files'], { encoding: 'utf8' }).split('\\n').filter(f => f && !BINARY.test(f));", 'privacy-check.mjs'],
};
