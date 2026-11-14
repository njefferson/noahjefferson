// The cases and plants of doctrine-sync.mjs (P-248). The shape is guard-cases/shape.mjs.
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// A planted hub (a git work tree holding the tool and a doctrine page of two sections), a planted app marked at the hub's first commit,
// and a second commit that changes the file it is given. The tool is run against the app.
function run(h, dir, changed) {
  const hub = h.repo({ 'DOCTRINE.md': 'planted index\n' });
  mkdirSync(join(hub.dir, 'doctrine'), { recursive: true });
  hub.write('doctrine/never.md', '# Planted page\n\n## The first section\n\nplanted old words\n\n## The second section\n\nplanted old words\n');
  hub.write('notes-of-the-case.txt', 'planted old words\n');
  hub.stage();
  hub.g('commit', '-q', '-m', 'planted base with the page');
  const base = hub.g('rev-parse', 'HEAD').stdout.trim();
  for (const f of ['doctrine-sync.mjs', 'gate-args.mjs']) copyFileSync(join(dir, f), join(hub.dir, f));
  const app = h.tmp('sg-sync-app-');
  writeFileSync(join(app, '.doctrine-sync'), `${base}\n`);
  if (changed === 'doctrine/never.md') hub.write(changed, '# Planted page\n\n## The first section\n\nplanted old words\n\n## The second section\n\nplanted new words\n');
  else hub.write(changed, 'planted new words\n');
  hub.g('add', changed);
  hub.g('commit', '-q', '-m', 'planted change');
  return spawnSync('node', [join(hub.dir, 'doctrine-sync.mjs'), '--repo', app, '--no-fetch'], { encoding: 'utf8', timeout: 60000 });
}

export const cases = [
  {
    name: 'P-248: the sibling drift tool lists a changed file under doctrine/ with the headings of its changed sections, and says nothing is held to for a file outside the list',
    guards: ['sync_watches_doctrine_folder'],
    run(m, dir, h) {
      const page = run(h, dir, 'doctrine/never.md');
      const other = run(h, dir, 'notes-of-the-case.txt');
      return h.assertAll([
        ['a change under doctrine/ exits 1 and the file is listed', page.status === 1 && /^ {2}doctrine\/never\.md$/m.test(page.stdout), page.stdout + page.stderr],
        ['the heading of the changed section is listed', /· The second section/.test(page.stdout), page.stdout],
        ['the heading of the section that did not change is not listed', !/· The first section/.test(page.stdout), page.stdout],
        ['a change to a file outside the list exits 0 and says nothing held changed', other.status === 0 && /nothing this repo is held to changed/.test(other.stdout) && !/doctrine\/never/.test(other.stdout), other.stdout + other.stderr],
      ]);
    },
  },
];

export const plants = {
  // The line is in doctrine-sync.mjs, which the plant takes the folder out of.
  sync_watches_doctrine_folder: ["'DOCTRINE.md', 'doctrine/', 'LESSONS.md'", "'DOCTRINE.md', 'LESSONS.md'", 'doctrine-sync.mjs'],
};
