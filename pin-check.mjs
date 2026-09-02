// pin-check.mjs — npm supply-chain hygiene (Doctrine §16.1/§16.3, LESSONS §8).
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node pin-check.mjs                  check this repo
//   node pin-check.mjs --repo ../myapp  check a sibling
//
// SCOPE, deliberately narrow. This used to audit GitHub Actions pinning too.
// It no longer does, because **zizmor** already does that far better — on its
// first run it found template injection and credential persistence in
// workflows written the same afternoon this file was, which this file had no
// concept of. Workflow security is `zizmor --offline --strict-collection` in
// regex over `uses:` was reinventing a maintained tool badly.
//
// What is left here is the part zizmor does not cover: npm hygiene. A lockfile
// exists, automation uses `npm ci`, and no script runs on undeclared
// dependencies.
//
// EXITS NON-ZERO on any failure.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { repoFromArgv } from './gate-args.mjs';

const HUB = dirname(fileURLToPath(import.meta.url));
// A BARE PATH IS A TYPO, NOT A TARGET — see gate-args.mjs. A positional path
// used to be discarded, and the gate then reported green for whichever repo it
// was standing in, under that repo's name.
const { REPO, NAME } = repoFromArgv(process.argv.slice(2),
  { gate: 'pin-check.mjs', fallback: HUB });

const failures = [];
const notes = [];
const ok = [];

/* ---------- 1. npm ci, never npm install, in automation ---------- */

const wfDir = join(REPO, '.github', 'workflows');
if (!existsSync(wfDir)) {
  notes.push('no .github/workflows — nothing executes on a runner here');
} else {
  for (const file of readdirSync(wfDir).filter((f) => /\.ya?ml$/.test(f))) {
    const text = readFileSync(join(wfDir, file), 'utf8');
    // §16.1: npm ci, never npm install, in automation.
    text.split('\n').forEach((line, n) => {
      if (/^\s*(?:-\s*run:|\s+)?.*\bnpm\s+install\b/.test(line) && !line.trim().startsWith('#')) {
        failures.push(
          `${file}:${n + 1}: \`npm install\` in automation resolves whatever the registry serves `
          + 'at that moment. Use `npm ci`, which is bound by the lockfile.',
        );
      }
    });

    // §16.2: never put an unpinned fetch next to a secret.
    if (/npx\s+(?!--no-install)/.test(text) && /secrets\./.test(text)) {
      const risky = text.split('\n')
        .map((l, n) => [l, n])
        .filter(([l]) => /npx\s+(?!--no-install)/.test(l) && !l.trim().startsWith('#'));
      for (const [l, n] of risky) {
        notes.push(`${file}:${n + 1}: \`npx\` without --no-install in a workflow that handles secrets — ${l.trim().slice(0, 70)}`);
      }
    }
  }
}

/* ---------- 2. a lockfile exists wherever package.json does ---------- */

if (existsSync(join(REPO, 'package.json'))) {
  if (!existsSync(join(REPO, 'package-lock.json'))) {
    failures.push('package.json with no package-lock.json — `npm ci` cannot run and nothing is reproducible (§16.3).');
  } else {
    ok.push('package-lock.json present');
  }
} else {
  // §16.3: eight .mjs scripts once imported playwright-core with no package.json
  // anywhere. That is not "no dependencies", it is undeclared ones.
  const stray = existsSync(REPO)
    ? readdirSync(REPO).filter((f) => f.endsWith('.mjs'))
    : [];
  if (stray.length) {
    failures.push(
      `${stray.length} .mjs script(s) at the repo root with NO package.json. `
      + 'Undeclared dependencies are not absent dependencies — nothing is reproducible '
      + 'and Dependabot has nothing to read (§16.3).',
    );
  }
}

/* ---------- report ---------- */

console.log(`=== npm hygiene · ${NAME} ===`);
console.log('(GitHub Actions security is zizmor\'s job — run `npm run security`)');
if (ok.length) console.log(`${ok.length} check(s) passed`);
for (const n of notes) console.log(`  · ${n}`);
if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log('\nDoctrine §16.3: undeclared dependencies are not absent dependencies.');
  console.log('Exiting non-zero.');
  process.exit(1);
}
console.log('PASS — lockfile present, no `npm install` in automation, no undeclared deps.');
