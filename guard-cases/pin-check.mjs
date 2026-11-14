// The cases and plants of pin-check.mjs (P-72). The shape is guard-cases/shape.mjs.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// A planted app of the files it is given, and the pin check run on it.
function run(h, dir, files) {
  const app = h.tmp('sg-pincheck-app-');
  for (const [f, c] of Object.entries(files)) {
    mkdirSync(join(app, f, '..'), { recursive: true });
    writeFileSync(join(app, f), c);
  }
  return spawnSync('node', [join(dir, 'pin-check.mjs'), '--repo', app], { encoding: 'utf8', timeout: 60000 });
}

export const cases = [
  {
    name: 'P-72: the pin check refuses what its words say and its pass line says no more: a root script with no package.json, an npm install in a workflow, and a package.json with no lockfile',
    guards: ['pin_words_pass', 'pin_stray_script', 'pin_npm_install'],
    run(m, dir, h) {
      const clean = run(h, dir, { 'package.json': '{}\n', 'package-lock.json': '{}\n' });
      const stray = run(h, dir, { 'planted-script.mjs': 'console.log(1);\n' });
      const install = run(h, dir, { 'package.json': '{}\n', 'package-lock.json': '{}\n', '.github/workflows/planted.yml': 'jobs:\n  a:\n    steps:\n      - run: npm install\n' });
      const nolock = run(h, dir, { 'package.json': '{}\n' });
      return h.assertAll([
        ['a clean app exits 0 and the pass line names what is refused and no more', clean.status === 0 && /^PASS — no `npm install` in a workflow, a lockfile beside every package\.json, and no root \.mjs script without a package\.json\.$/m.test(clean.stdout) && !/undeclared deps\./.test(clean.stdout), clean.stdout + clean.stderr],
        ['a root .mjs script with no package.json exits 1 and is named', stray.status === 1 && /1 \.mjs script\(s\) at the repo root with NO package\.json/.test(stray.stdout), stray.stdout + stray.stderr],
        ['an npm install in a workflow exits 1 and names the line', install.status === 1 && /planted\.yml:4: `npm install` in automation/.test(install.stdout), install.stdout + install.stderr],
        ['a package.json with no lockfile exits 1', nolock.status === 1 && /package\.json with no package-lock\.json/.test(nolock.stdout), nolock.stdout + nolock.stderr],
      ]);
    },
  },
];

export const plants = {
  // Each line is in pin-check.mjs, which the plant takes the line out of.
  pin_words_pass: ['and no root .mjs script without a package.json.\');', 'and no undeclared deps.\');', 'pin-check.mjs'],
  pin_stray_script: ['  if (stray.length) {', '  if (false) {', 'pin-check.mjs'],
  pin_npm_install: ["        failures.push(\n          `${file}:${n + 1}: ", "        notes.push(\n          `${file}:${n + 1}: ", 'pin-check.mjs'],
};
