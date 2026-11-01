// hub-gates-local.mjs — run the hub's gates against a repo, from the commit the
// repo pins, the way its CI will.
//
// CANONICAL IN THE HUB. Never fork it: the copies the siblings carry under
// tools/ are superseded by this one.
//
//   node hub-gates-local.mjs --repo ../myapp
//   node hub-gates-local.mjs --repo ../myapp --pwa --mirror --palette-path palettes/x.json
//
// WHY.
//
// A sibling that runs "the hub's gates" locally runs whatever is in the hub
// checkout beside it, which is the moving tip of main. Its CI runs the commit it
// PINS. Those are two different sets of gates, so a local green said nothing
// about the CI run that would follow, and a gate added since the pin was
// "passing" locally and absent in CI. This runs the gates out of a worktree of
// the hub AT THE PIN, which is what hub-gates.yml checks out, and its closing
// line names the commit the gates ran from and never the tree beside it.
//
// It reads the pin the way hub-gates.yml does, from the repo's own workflow
// files (hub-pin-check.mjs holds the reader), requires exactly one, and refuses
// a pin the hub's main does not reach before it runs anything out of it.
//
// A gate the pinned commit does not have is reported as absent from that commit
// and skipped, because CI at that pin would not run it either; saying so is the
// whole difference between a skip and a quiet pass.
//
// The inputs mirror hub-gates.yml: --pwa, --mirror, --no-third-person,
// --no-examples, --docs-path, --palette-path, --textsize-paths. --work names the
// folder the worktree is made under (default: the system temp folder).

import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { repoFromArgv } from './gate-args.mjs';
import { findHub, readPins, judgePin } from './hub-pin-check.mjs';

const argv = process.argv.slice(2);
const FLAGS = ['--hub', '--work', '--docs-path', '--palette-path', '--textsize-paths'];
const { REPO, NAME } = repoFromArgv(argv, { gate: 'hub-gates-local.mjs', flags: FLAGS, fallback: process.cwd() });
const opt = (name) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
const PWA = argv.includes('--pwa');
const MIRROR = argv.includes('--mirror');
const THIRD = !argv.includes('--no-third-person');
const EXAMPLES = !argv.includes('--no-examples');
const DOCS_PATH = opt('--docs-path') ?? '.';
const PALETTE = opt('--palette-path');
const TEXTSIZE = opt('--textsize-paths');
const WORK = opt('--work') ?? tmpdir();

const fail = (msg) => { console.error(`\nhub-gates-local: ${msg}`); process.exit(1); };

console.log(`=== hub gates, run from the pinned commit · ${NAME} ===`);
const { hub, tried } = findHub(REPO, opt('--hub'));
if (!hub) {
  console.log(`  --    SKIPPED: no hub checkout found (looked at ${tried.join(', ')}); no gate ran.`);
  process.exit(0);
}

const pins = readPins(REPO);
const distinct = [...new Set(pins.map((p) => p.ref))];
if (distinct.length !== 1) {
  fail(`${NAME}'s workflows must call the hub at exactly one pin; found ${distinct.length}.`
    + pins.map((p) => `\n  ${p.file}:${p.line} @${p.ref}`).join(''));
}
const PIN = distinct[0];
const why = judgePin(hub, PIN);
if (why) fail(`the pin ${PIN.slice(0, 12)} ${why}. No gate was run out of it.`);

const git = (...a) => execFileSync('git', ['-C', hub, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

const base = mkdtempSync(join(resolve(WORK), 'hub-gates-'));
const WT = join(base, 'hub');
try {
  git('worktree', 'add', '--detach', WT, PIN);
} catch (e) {
  rmSync(base, { recursive: true, force: true });
  fail(`could not make a worktree of the hub at ${PIN.slice(0, 12)}: ${String(e.stderr ?? e.message).trim()}`);
}

let ran = 0;
let failed = 0;
let absent = 0;
try {
  const gate = (label, script, args, cwd = REPO) => {
    if (!existsSync(join(WT, script))) {
      absent++;
      console.log(`  --    ${label}: ${script} is not in the hub at ${PIN.slice(0, 7)}, so CI at this pin does not run it either`);
      return;
    }
    ran++;
    const r = spawnSync(process.execPath, [join(WT, script), ...args], { cwd, encoding: 'utf8' });
    const ok = r.status === 0;
    if (!ok) failed++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}`);
    if (!ok) {
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trimEnd();
      if (out) console.log(out.split('\n').map((l) => `        ${l}`).join('\n'));
    }
  };

  gate('branch guard (artefact only)', 'branch-guard.mjs', ['--repo', REPO, '--artefact']);
  gate('privacy', 'privacy-check.mjs', ['--repo', REPO]);
  if (MIRROR) gate('privacy mirror', 'privacy-mirror-check.mjs', ['--repo', REPO]);
  gate('quotations', 'quote-check.mjs', ['--repo', REPO]);
  if (THIRD) gate('third person', 'third-person-check.mjs', ['--repo', REPO]);
  if (EXAMPLES) gate('examples', 'example-check.mjs', ['--repo', REPO]);
  gate('docs', 'docs-check.mjs', [join(REPO, DOCS_PATH)]);
  gate('npm hygiene', 'pin-check.mjs', ['--repo', REPO]);
  gate('svg', 'svg-check.mjs', ['--repo', REPO]);
  if (PWA) gate('pwa', 'pwa-check.mjs', ['--repo', REPO]);
  if (PALETTE) gate('palette', 'palette-check.mjs', [PALETTE]);
  if (TEXTSIZE) gate('text size', join('scripts', 'check-textsize.mjs'), TEXTSIZE.split(/\s+/).filter(Boolean));
} finally {
  try { git('worktree', 'remove', '--force', WT); } catch { /* reported below */ }
  rmSync(base, { recursive: true, force: true });
  let left = false;
  try { left = git('worktree', 'list', '--porcelain').split('\n').some((l) => l === `worktree ${WT}`); } catch { /* none */ }
  console.log(left ? `  WARN  the worktree ${WT} is still registered with the hub; run git worktree prune there`
    : '  ok    the worktree is removed');
}

console.log(`\n${ran} gate(s) ran, ${failed} failed, ${absent} not in the pinned commit.`);
console.log(`The gates ran from the hub commit ${PIN} (pinned by ${NAME}), not from the hub tree beside it.`);
process.exit(failed ? 1 : 0);
