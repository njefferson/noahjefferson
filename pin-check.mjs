// pin-check.mjs — supply-chain pinning, enforced (Doctrine §16.1, LESSONS §8).
//
// CANONICAL IN THE HUB. Never fork it.
//
//   node pin-check.mjs                  check this repo
//   node pin-check.mjs --repo ../myapp  check a sibling
//
// §16.1 has said "PIN WHAT EXECUTES" since it was written, and §8 records what
// it cost to learn. Neither had anything behind it: a tag could drift back into
// a workflow at any time and nothing would notice. This is that check.
//
// EXITS NON-ZERO on any failure.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HUB = dirname(fileURLToPath(import.meta.url));
const i = process.argv.indexOf('--repo');
const REPO = i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : HUB;
const NAME = REPO.split('/').pop();

const failures = [];
const notes = [];
const ok = [];

/* ---------- 1. every `uses:` is pinned to a 40-char SHA ---------- */

const wfDir = join(REPO, '.github', 'workflows');
if (!existsSync(wfDir)) {
  notes.push('no .github/workflows — nothing executes on a runner here');
} else {
  for (const file of readdirSync(wfDir).filter((f) => /\.ya?ml$/.test(f))) {
    const text = readFileSync(join(wfDir, file), 'utf8');
    text.split('\n').forEach((line, n) => {
      const m = /^\s*(?:-\s*)?uses:\s*(\S+)/.exec(line);
      if (!m) return;
      const ref = m[1].replace(/['"]/g, '');
      // A local action or a reusable workflow in this repo is not a
      // third-party pin — it moves only when this repo moves.
      if (ref.startsWith('./') || ref.startsWith('.\\')) { ok.push(`${file}:${n + 1} local ${ref}`); return; }
      const at = ref.lastIndexOf('@');
      if (at < 0) {
        failures.push(`${file}:${n + 1}: \`uses: ${ref}\` has no version at all.`);
        return;
      }
      const version = ref.slice(at + 1);
      if (/^[0-9a-f]{40}$/.test(version)) { ok.push(`${file}:${n + 1} ${ref.slice(0, at)}`); return; }
      failures.push(
        `${file}:${n + 1}: \`uses: ${ref}\` is pinned to "${version}", which is a MUTABLE POINTER `
        + 'someone else controls. Pin the 40-character commit SHA and put the tag in a trailing comment.',
      );
    });

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

console.log(`=== pin gate · ${NAME} ===`);
if (ok.length) console.log(`${ok.length} pinned reference(s) / lockfile checks passed`);
for (const n of notes) console.log(`  · ${n}`);
if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log('\nDoctrine §16.1: a tag is a mutable pointer someone else controls, and these');
  console.log('steps execute holding live credentials. Exiting non-zero.');
  process.exit(1);
}
console.log('PASS — everything that executes is pinned to something that cannot move.');
