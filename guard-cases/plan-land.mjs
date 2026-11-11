// Cases and plants for plan-land.mjs (step 198 of the plan of 10 November: Q-HUB-473, the landing as one command). Shape: guard-cases/shape.mjs.
// Every repository, remote, clone, suite, check and manifest a case needs is written under a temporary folder from `h.tmp`, never into the
// working copy, and the command is run as a child process against them. No case reaches the hub's own remote, suite or checks.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const F = 'plan-land.mjs';
const ENV = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' };
for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_PREFIX']) delete ENV[k];

const sh = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: 60000, env: ENV });
const g = (repo, ...a) => sh('git', ['-C', repo, ...a]);
const out = (repo, ...a) => g(repo, ...a).stdout.trim();

// The planted suite: what it prints depends on suite-mode.txt beside it, so a case changes the mode and runs the command again.
const SUITE = String.raw`import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const modeFile = join(here, 'suite-mode.txt');
const mode = existsSync(modeFile) ? readFileSync(modeFile, 'utf8').trim() : 'green';
const tag = 'TAGPLACE';
const args = process.argv.slice(2);
const val = (n) => { const a = args.find((x) => x.startsWith('--' + n + '=')); return a === undefined ? undefined : a.slice(n.length + 3); };
if (args.includes('--plants') && args.includes('--dry')) {
  const f = val('files');
  if (f === 'session-guards.test.mjs') { console.log('PLANTS TO RUN: 3 of 3: long_a, long_b, long_c'); process.exit(0); }
  if (f === 'bulk.mjs') { const ks = Array.from({ length: 251 }, (_, i) => 'bulk_' + i); console.log('PLANTS TO RUN: 251 of 251: ' + ks.join(', ')); process.exit(0); }
  if (mode === 'stale') {
    console.log('STALE PLANTS BEFORE THE RUN (1): pk_two in ' + f + '. Each is skipped and counted as a failure; re-point its line.');
    console.log('PLANTS TO RUN: 2 of 2: pk_one, pk_two');
    process.exit(1);
  }
  console.log('PLANTS TO RUN: 2 of 2: pk_one, pk_two');
  process.exit(0);
}
if (val('plant-keys') !== undefined) {
  if (mode === 'crash') process.exit(3);
  let bad = 0, leaks = 0;
  for (const k of val('plant-keys').split(',').filter(Boolean)) {
    if (mode === 'noverdict') continue;
    if (mode === 'stalekey' && k === 'pk_manifest') { console.log('PLANT ' + k + ': the line to take out is not in x.mjs — the plant is stale'); bad++; continue; }
    if (mode === 'missed' && k === 'pk_one') { console.log('MISSED  plant "' + k + '" in x.mjs — its cases still passed'); bad++; continue; }
    console.log('CAUGHT  plant "' + k + '" in x.mjs');
  }
  if (mode === 'bad') bad = 1;
  if (mode === 'leak') leaks = 1;
  console.log('CHUNK-END bad=' + bad + ' leaks=' + leaks);
  process.exit(0);
}
const only = val('case');
if (only !== undefined) {
  console.log('NARROWED-RERUN ' + only);
  if (mode === 'red') { console.log('FAIL  ' + only + ' (boom: it broke)'); console.log('0/1 passed'); process.exit(1); }
  console.log('PASS  ' + only); console.log('1/1 passed'); process.exit(0);
}
console.log('SUITE-TAG ' + tag);
if (mode === 'cut') { console.log('PASS  case a'); process.exit(1); }
if (mode === 'red') { console.log('PASS  case a'); console.log('FAIL  case b (boom: it broke)'); console.log('1/2 passed'); process.exit(1); }
console.log('PASS  case a'); console.log('PASS  case b'); console.log('2/2 passed');
process.exit(0);
`;
const suiteText = (tag = 'main') => SUITE.replace('TAGPLACE', tag);

// A planted check prints the arguments it was given and fails when check-fail.txt names it.
const CHECK = String.raw`import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
const me = fileURLToPath(import.meta.url);
console.log('ARGS ' + process.argv.slice(2).join(' '));
const f = join(dirname(me), 'check-fail.txt');
if (existsSync(f) && readFileSync(f, 'utf8').split('\n').includes(basename(me))) { console.log('a find in ' + basename(me)); process.exit(1); }
`;
const CHECK_FILES = ['docs-check.mjs', 'lessons-check.mjs', 'quote-check.mjs', 'privacy-check.mjs', 'third-person-check.mjs', 'example-check.mjs', 'pin-check.mjs'];

/** A planted repository on main with a planted suite, seven planted checks and four tracked files, all committed. */
function plantRepo(h, name, work = 'main') {
  const dir = h.tmp(`land-${name}-`);
  sh('git', ['-C', dir, 'init', '-q', '-b', 'main']);
  g(dir, 'config', 'user.name', 'case');
  g(dir, 'config', 'user.email', 'case@example.invalid');
  writeFileSync(join(dir, '.branch-guard'), `work=${work}\n`);
  writeFileSync(join(dir, 'session-guards.test.mjs'), suiteText('main'));
  for (const c of CHECK_FILES) writeFileSync(join(dir, c), CHECK);
  writeFileSync(join(dir, 'check-fail.txt'), '');
  writeFileSync(join(dir, 'suite-mode.txt'), 'green\n');
  writeFileSync(join(dir, 'a.txt'), 'one\n');
  writeFileSync(join(dir, 'c.txt'), 'tracked\n');
  writeFileSync(join(dir, 'd.txt'), 'steady\n');
  g(dir, 'add', '-A');
  g(dir, 'commit', '-q', '-m', 'planted start');
  return dir;
}

/** The command run as a child process. */
const land = (codeDir, repo, verb, args = []) => spawnSync('node', [join(codeDir, F), verb, `--repo=${repo}`, ...args], { encoding: 'utf8', timeout: 240000, env: ENV, maxBuffer: 64 * 1024 * 1024 });
const text = (r) => `${r.stdout}${r.stderr}`;

function writeManifest(h, obj) {
  const p = join(h.tmp('land-manifest-'), 'manifest.json');
  writeFileSync(p, JSON.stringify(obj));
  return p;
}

const BASE = { steps: [{ label: 'one', message: 'Change a', changed: ['a.txt'], plants: ['pk_manifest'] }] };
const readOut = (dir, file) => (existsSync(join(dir, file)) ? readFileSync(join(dir, file), 'utf8') : '');

/** A prove run against a planted repository whose suite is in the given mode. */
function proveRun(codeDir, h, { mode = 'green', failing = [], manifest = BASE, extra = [] } = {}) {
  const repo = plantRepo(h, 'prove');
  writeFileSync(join(repo, 'suite-mode.txt'), `${mode}\n`);
  writeFileSync(join(repo, 'check-fail.txt'), failing.map((x) => `${x}\n`).join(''));
  const outDir = join(h.tmp('land-out-'), 'prints');
  const r = land(codeDir, repo, 'prove', [`--manifest=${writeManifest(h, manifest)}`, `--out=${outDir}`, ...extra]);
  return { repo, outDir, r, t: text(r) };
}

// One case for each way the suite, the plants or a check can show red, each answering for the plant that takes its item out.
const PROVE_MODES = [
  ['stale', 'pl_prove_dry_stale', 'pk_two in a.txt', /a\.txt holds stale plants/],
  ['missed', 'pl_prove_missed', 'a plant the run read as MISSED', /plant pk_one was MISSED/],
  ['stalekey', 'pl_prove_stale_key', 'a plant stale at its run', /plant pk_manifest is stale/],
  ['bad', 'pl_prove_nobad', 'a chunk that counted one bad with no line of its own', /the suite counted 1 bad in /],
  ['leak', 'pl_prove_leak', 'a chunk that reported a leak', /reported a LEAK of the planted session/],
  ['noverdict', 'pl_prove_verdict', 'a key with no verdict', /plant pk_one has no verdict/],
  ['crash', 'pl_prove_early', 'a chunk process that ended before its last line', /ended early \(exit 3\)/],
  ['cut', 'pl_prove_cut', 'a suite print with no passed line', /the suite's print was cut: no passed line/],
];
const proveModeCases = PROVE_MODES.map(([mode, key, what, re]) => ({
  name: `step 198: plan-land prove names ${what} and goes on to the later stages (${mode})`,
  guards: [key],
  run(m, dir, h) {
    const p = proveRun(dir, h, { mode });
    return h.assertAll([
      ['the run exits non-zero', p.r.status !== 0, p.t],
      ['the item is named', re.test(p.t), p.t],
      ['the later stage still ran after the earlier one showed red', /^PASS {2}the seven checks$/m.test(p.t) || /^FAIL {2}the seven checks$/m.test(p.t), p.t],
      ['the closing line says FAIL', /^PROVE FAIL \(4 stages, [1-3] failed\)$/m.test(p.t), p.t],
    ]);
  },
}));

const REFUSALS = [
  ['pl_commit_multiline', 'One\nTwo', /one: the message is more than one line/],
  ['pl_commit_link', 'See https://example.invalid/x', /one: the message holds a link/],
  ['pl_commit_model', 'Reworked with Sonnet', /one: the message names a model/],
  ['pl_commit_trailer', 'Fix a\n\nCo-Authored-By: Someone <s@example.invalid>', /one: the message holds a trailer line/],
  ['pl_commit_empty_msg', '   ', /one: the message is empty/],
];
const commitRefusalCases = REFUSALS.map(([key, message, re]) => ({
  name: `step 198: plan-land commit refuses a bad message with nothing committed (${key})`,
  guards: [key],
  run(m, dir, h) {
    const repo = plantRepo(h, 'refuse');
    writeFileSync(join(repo, 'a.txt'), 'changed\n');
    writeFileSync(join(repo, 'c.txt'), 'changed too\n');
    const before = out(repo, 'rev-parse', 'HEAD');
    const man = writeManifest(h, { steps: [{ label: 'good', message: 'Change c', changed: ['c.txt'] }, { label: 'one', message, changed: ['a.txt'] }] });
    const r = land(dir, repo, 'commit', [`--manifest=${man}`]);
    return h.assertAll([
      ['the run exits non-zero', r.status !== 0, text(r)],
      ['the print says nothing was committed', /^COMMIT REFUSED, nothing committed/m.test(r.stdout), text(r)],
      ['the cause is named', re.test(r.stdout), text(r)],
      ['the valid entry before it was not committed either', out(repo, 'rev-parse', 'HEAD') === before, out(repo, 'rev-parse', 'HEAD')],
    ]);
  },
}));

export const cases = [
  {
    name: 'step 198: plan-land prove passes on a green planted repository, runs each stage, writes each stage\'s print under the out folder, runs the manifest\'s plants and the non-long files\' plants by key and no long file\'s, and edits nothing',
    guards: ['pl_prove_long_names', 'pl_prove_long_count', 'pl_prove_manifest_keys', 'pl_prove_out', 'pl_prove_final', 'pl_prove_stage_line', 'pl_prove_exit'],
    run(m, dir, h) {
      const manifest = { steps: [
        { label: 'one', message: 'Change a', changed: ['a.txt'], plants: ['pk_manifest'] },
        { label: 'long', message: 'Change the suite', changed: ['session-guards.test.mjs'] },
        { label: 'bulk', message: 'Add the bulk case file', added: ['guard-cases/bulk.mjs'] },
      ] };
      const p = proveRun(dir, h, { manifest });
      const files = existsSync(p.outDir) ? readdirSync(p.outDir).sort() : [];
      const plantsPrint = readOut(p.outDir, '03-the-plants-3-by-key-.txt');
      return h.assertAll([
        ['the run exits 0', p.r.status === 0, p.t],
        ['each of the four stages passed', /^PASS {2}the dry listing$/m.test(p.t) && /^PASS {2}the whole suite$/m.test(p.t) && /^PASS {2}the plants \(3 by key\)$/m.test(p.t) && /^PASS {2}the seven checks$/m.test(p.t), p.t],
        ['the closing line says PROVE PASS with the count', /^PROVE PASS \(4 stages, 0 failed\)$/m.test(p.t), p.t],
        ['one print file for each stage stands under the out folder', files.length === 4 && files[0].startsWith('01-') && files[3].startsWith('04-'), files.join(', ')],
        ['the plants stage ran the manifest\'s key and the two keys of the file that is not long', /plant "pk_manifest"/.test(plantsPrint) && /plant "pk_one"/.test(plantsPrint) && /plant "pk_two"/.test(plantsPrint), plantsPrint],
        ['no plant of a long file ran, by name or by count', !/long_a|bulk_0/.test(plantsPrint), plantsPrint.slice(0, 400)],
        ['the whole suite stage holds the suite\'s own print', /2\/2 passed/.test(readOut(p.outDir, '02-the-whole-suite.txt')), readOut(p.outDir, '02-the-whole-suite.txt')],
        ['the command edited nothing in the repository', out(p.repo, 'status', '--porcelain') === '', out(p.repo, 'status', '--porcelain')],
      ]);
    },
  },
  {
    name: 'step 198: plan-land prove with a red case and a failing check in one run names both, runs the red case again narrowed to its own name, and exits non-zero',
    guards: ['pl_prove_red', 'pl_prove_narrow', 'pl_prove_check_fail', 'pl_prove_exit', 'pl_prove_final', 'pl_prove_stage_line'],
    run(m, dir, h) {
      const p = proveRun(dir, h, { mode: 'red', failing: ['quote-check.mjs'] });
      const whole = readOut(p.outDir, '02-the-whole-suite.txt');
      return h.assertAll([
        ['the run exits non-zero', p.r.status !== 0, p.t],
        ['the red case is named in full', /red case: case b \(boom: it broke\)/.test(p.t), p.t],
        ['the stage line says FAIL for the suite', /^FAIL {2}the whole suite$/m.test(p.t), p.t],
        ['the failing check is named with its exit code', /the quote check exited 1: ARGS --repo .* \/ a find in quote-check\.mjs/.test(p.t), p.t],
        ['the stages before and between still ran', /^PASS {2}the dry listing$/m.test(p.t) && /^FAIL {2}the seven checks$/m.test(p.t), p.t],
        ['the closing line counts two failed stages', /^PROVE FAIL \(4 stages, 2 failed\)$/m.test(p.t), p.t],
        ['the red case was run again narrowed to its own name and that print is kept', /NARROWED-RERUN case b/.test(whole), whole],
      ]);
    },
  },
  {
    name: 'step 198: plan-land prove with the checks switch runs the seven checks alone, each as its usage spells it, and nothing else',
    guards: ['pl_prove_checks_only', 'pl_prove_docs_args', 'pl_prove_lessons_args', 'pl_prove_quote_args'],
    run(m, dir, h) {
      const p = proveRun(dir, h, { extra: ['--checks-only'] });
      const prints = readOut(p.outDir, '01-the-seven-checks.txt');
      return h.assertAll([
        ['the run exits 0', p.r.status === 0, p.t],
        ['only the checks stage stands', /^PASS {2}the seven checks$/m.test(p.t) && !/the whole suite|the dry listing|the plants/.test(p.t), p.t],
        ['the docs check was given the repository path bare', prints.includes(`== docs check, exit 0\nARGS ${p.repo}\n`), prints],
        ['the lessons check was given no path', prints.includes('== lessons check, exit 0\nARGS \n'), prints],
        ['the quote check was given the repo flag and the path', prints.includes(`== quote check, exit 0\nARGS --repo ${p.repo}\n`), prints],
        ['the closing line counts one stage', /^PROVE PASS \(1 stage, 0 failed\)$/m.test(p.t), p.t],
      ]);
    },
  },
  {
    name: 'step 198: plan-land prove runs the suite and the checks the manifest names in place of the repository\'s own',
    guards: ['pl_prove_override_suite', 'pl_prove_override_check'],
    run(m, dir, h) {
      const alt = h.tmp('land-alt-');
      writeFileSync(join(alt, 'alt-suite.mjs'), suiteText('alternative'));
      writeFileSync(join(alt, 'alt-docs.mjs'), "console.log('ALT-DOCS'); process.exit(0);\n");
      const manifest = { ...BASE, suite: join(alt, 'alt-suite.mjs'), checks: { docs: join(alt, 'alt-docs.mjs') } };
      const p = proveRun(dir, h, { manifest });
      return h.assertAll([
        ['the run exits 0', p.r.status === 0, p.t],
        ['the named suite ran', /SUITE-TAG alternative/.test(readOut(p.outDir, '02-the-whole-suite.txt')), readOut(p.outDir, '02-the-whole-suite.txt')],
        ['the repository\'s own suite did not', !/SUITE-TAG main/.test(readOut(p.outDir, '02-the-whole-suite.txt')), readOut(p.outDir, '02-the-whole-suite.txt')],
        ['the named docs check ran', /ALT-DOCS/.test(readOut(p.outDir, '04-the-seven-checks.txt')), readOut(p.outDir, '04-the-seven-checks.txt')],
      ]);
    },
  },
  {
    name: 'step 198: plan-land refuses an unknown verb and an unknown switch with exit 2, naming the switch',
    guards: ['pl_args', 'pl_verb'],
    run(m, dir, h) {
      const repo = plantRepo(h, 'args');
      const bad = land(dir, repo, 'prove', ['--bogus']);
      const verb = land(dir, repo, 'launch');
      return h.assertAll([
        ['an unknown switch exits 2 and is named', bad.status === 2 && /prove takes no argument "--bogus"/.test(text(bad)), text(bad)],
        ['an unknown verb exits 2 and the verbs are named', verb.status === 2 && /the first argument is a verb: prove, commit or push/.test(text(verb)), text(verb)],
      ]);
    },
  },
  ...proveModeCases,
  {
    name: 'step 198: plan-land commit makes one commit for each entry in order, each with only its files, and prints each commit\'s id and subject',
    guards: ['pl_commit_add', 'pl_commit_prints'],
    run(m, dir, h) {
      const repo = plantRepo(h, 'commit');
      writeFileSync(join(repo, 'a.txt'), 'changed\n');
      writeFileSync(join(repo, 'b.txt'), 'brand new\n');
      const start = Number(out(repo, 'rev-list', '--count', 'HEAD'));
      const man = writeManifest(h, { steps: [{ label: 'one', message: 'Change a', changed: ['a.txt'] }, { label: 'two', message: 'Add b', added: ['b.txt'] }] });
      const r = land(dir, repo, 'commit', [`--manifest=${man}`]);
      const files = (rev) => out(repo, 'diff-tree', '--no-commit-id', '--name-only', '-r', rev);
      return h.assertAll([
        ['the run exits 0', r.status === 0, text(r)],
        ['two commits were made', Number(out(repo, 'rev-list', '--count', 'HEAD')) === start + 2, out(repo, 'log', '--oneline', '-4')],
        ['the first holds only a.txt and the second only b.txt', files('HEAD~1') === 'a.txt' && files('HEAD') === 'b.txt', `${files('HEAD~1')} / ${files('HEAD')}`],
        ['each commit\'s subject is the entry\'s message', out(repo, 'log', '-2', '--pretty=%s') === 'Add b\nChange a', out(repo, 'log', '-2', '--pretty=%s')],
        ['each commit is printed with its id and subject', new RegExp(`^COMMIT one: ${out(repo, 'rev-parse', 'HEAD~1')} Change a$`, 'm').test(r.stdout) && new RegExp(`^COMMIT two: ${out(repo, 'rev-parse', 'HEAD')} Add b$`, 'm').test(r.stdout), r.stdout],
        ['the working copy is clean afterwards', out(repo, 'status', '--porcelain') === '', out(repo, 'status', '--porcelain')],
      ]);
    },
  },
  {
    name: 'step 198: plan-land commit with a label commits that entry alone, with only its files, and leaves the check for unlisted files out',
    guards: ['pl_commit_label', 'pl_commit_files', 'pl_commit_label_skip'],
    run(m, dir, h) {
      const repo = plantRepo(h, 'label');
      writeFileSync(join(repo, 'a.txt'), 'changed\n');
      writeFileSync(join(repo, 'c.txt'), 'changed too\n');
      writeFileSync(join(repo, 'd.txt'), 'left alone\n');
      const start = Number(out(repo, 'rev-list', '--count', 'HEAD'));
      const man = writeManifest(h, { steps: [{ label: 'one', message: 'Change a', changed: ['a.txt'] }, { label: 'two', message: 'Change c', changed: ['c.txt'] }] });
      const r = land(dir, repo, 'commit', [`--manifest=${man}`, '--label=two']);
      return h.assertAll([
        ['the run exits 0', r.status === 0, text(r)],
        ['one commit was made', Number(out(repo, 'rev-list', '--count', 'HEAD')) === start + 1, out(repo, 'log', '--oneline', '-3')],
        ['it holds only c.txt', out(repo, 'diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD') === 'c.txt', out(repo, 'diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD')],
        ['the other changes stand uncommitted', g(repo, 'status', '--porcelain').stdout === ' M a.txt\n M d.txt\n', g(repo, 'status', '--porcelain').stdout],
      ]);
    },
  },
  {
    name: 'step 198: plan-land commit refuses, with nothing committed, a listed file with no change, an entry listing no file, a file listed as added that is not there, and a changed file no entry lists',
    guards: ['pl_commit_nochange', 'pl_commit_nofile', 'pl_commit_added_missing', 'pl_commit_unlisted'],
    run(m, dir, h) {
      const repo = plantRepo(h, 'unlisted');
      writeFileSync(join(repo, 'a.txt'), 'changed\n');
      writeFileSync(join(repo, 'c.txt'), 'changed too\n');
      const before = out(repo, 'rev-parse', 'HEAD');
      const man = writeManifest(h, { steps: [
        { label: 'one', message: 'Change a', changed: ['a.txt', 'd.txt'] },
        { label: 'empty', message: 'Change nothing' },
        { label: 'ghost', message: 'Add a ghost', added: ['ghost.txt'] },
      ] });
      const r = land(dir, repo, 'commit', [`--manifest=${man}`]);
      return h.assertAll([
        ['the run exits non-zero', r.status !== 0, text(r)],
        ['nothing was committed', /^COMMIT REFUSED, nothing committed/m.test(r.stdout) && out(repo, 'rev-parse', 'HEAD') === before, text(r)],
        ['the file with no change is named', /one: d\.txt is listed and has no change/.test(r.stdout), r.stdout],
        ['the entry with no file is named', /empty: the entry lists no file/.test(r.stdout), r.stdout],
        ['the added file that is not there is named', /ghost: ghost\.txt is listed as added and is not there/.test(r.stdout), r.stdout],
        ['the unlisted changed file is named', /c\.txt is changed or untracked and no entry lists it/.test(r.stdout), r.stdout],
      ]);
    },
  },
  ...commitRefusalCases,
  {
    name: 'step 198: plan-land push lands the work branch as a fast-forward over a remote that moved, reads the remote\'s head back and pulls the clone to the same commit',
    guards: ['pl_push_fetch', 'pl_push_rebase', 'pl_push_pushes', 'pl_push_clone'],
    run(m, dir, h) {
      const w = pushWorld(h, 'lands');
      // The remote moves first, with a commit that touches another file, so the fetch and the rebase do real work.
      writeFileSync(join(w.other, 'e.txt'), 'from the remote\n');
      g(w.other, 'add', '-A'); g(w.other, 'commit', '-q', '-m', 'Remote e'); g(w.other, 'push', '-q', 'origin', 'main');
      const r = land(dir, w.repo, 'push', ['--expect=1', `--clone=${w.clone}`]);
      const remoteHead = out(w.remote, 'rev-parse', 'refs/heads/main');
      return h.assertAll([
        ['the run exits 0', r.status === 0, text(r)],
        ['each stage is printed', /^FETCHED origin main$/m.test(r.stdout) && /^REBASED onto origin\/main$/m.test(r.stdout) && /^COUNTED 1 ahead of origin\/main$/m.test(r.stdout) && /^PUSHED main to origin$/m.test(r.stdout), r.stdout],
        ['the remote\'s main is the local head', remoteHead === out(w.repo, 'rev-parse', 'HEAD') && /^READ the remote: main is /m.test(r.stdout), `${remoteHead} / ${out(w.repo, 'rev-parse', 'HEAD')}`],
        ['the remote\'s own commit stands under the pushed one', out(w.repo, 'log', '-2', '--pretty=%s') === 'Local a\nRemote e', out(w.repo, 'log', '-2', '--pretty=%s')],
        ['the clone was pulled to the same commit', out(w.clone, 'rev-parse', 'HEAD') === remoteHead && /^PULLED the clone /m.test(r.stdout), `${out(w.clone, 'rev-parse', 'HEAD')} / ${remoteHead}`],
        ['the final state of the working copy is printed', /^the working copy now reads:$/m.test(r.stdout), r.stdout],
      ]);
    },
  },
  {
    name: 'step 198: plan-land push refuses a count that differs from the one expected, and a missing count, with nothing pushed',
    guards: ['pl_push_expect', 'pl_push_expect_needed'],
    run(m, dir, h) {
      const w = pushWorld(h, 'count');
      const before = out(w.remote, 'rev-parse', 'refs/heads/main');
      const wrong = land(dir, w.repo, 'push', ['--expect=2']);
      const none = land(dir, w.repo, 'push');
      return h.assertAll([
        ['a wrong count exits non-zero and names both counts', wrong.status !== 0 && /1 commits stand ahead of origin\/main and 2 were expected/.test(wrong.stdout), text(wrong)],
        ['a missing count exits non-zero and says what is needed', none.status !== 0 && /--expect=<the number of commits to push> is needed/.test(none.stdout), text(none)],
        ['nothing reached the remote', out(w.remote, 'rev-parse', 'refs/heads/main') === before, out(w.remote, 'rev-parse', 'refs/heads/main')],
      ]);
    },
  },
  {
    name: 'step 198: plan-land push ends a conflicting rebase, names the files, leaves the repository on its own commit and pushes nothing',
    guards: ['pl_push_conflict', 'pl_push_abort'],
    run(m, dir, h) {
      const w = pushWorld(h, 'conflict');
      writeFileSync(join(w.other, 'a.txt'), 'the remote\'s version\n');
      g(w.other, 'add', '-A'); g(w.other, 'commit', '-q', '-m', 'Remote a'); g(w.other, 'push', '-q', 'origin', 'main');
      const remoteBefore = out(w.remote, 'rev-parse', 'refs/heads/main');
      const localBefore = out(w.repo, 'rev-parse', 'HEAD');
      const r = land(dir, w.repo, 'push', ['--expect=1']);
      return h.assertAll([
        ['the run exits non-zero and names the file', r.status !== 0 && /^PUSH REFUSED, nothing pushed: the rebase onto origin\/main stopped on a conflict in a\.txt; the rebase was ended$/m.test(r.stdout), text(r)],
        ['the remote did not move', out(w.remote, 'rev-parse', 'refs/heads/main') === remoteBefore, out(w.remote, 'rev-parse', 'refs/heads/main')],
        ['no rebase is left running and the head is the local commit', !existsSync(join(w.repo, '.git', 'rebase-merge')) && !existsSync(join(w.repo, '.git', 'rebase-apply')) && out(w.repo, 'rev-parse', 'HEAD') === localBefore, out(w.repo, 'status', '--short', '--branch')],
      ]);
    },
  },
  {
    name: 'step 198: plan-land push refuses another checked-out branch, a work branch other than main and staging, and a repository with no branch guard file, each with nothing pushed',
    guards: ['pl_push_wrongbranch', 'pl_push_onlymain', 'pl_push_noguard'],
    run(m, dir, h) {
      const w = pushWorld(h, 'branch');
      const before = out(w.remote, 'rev-parse', 'refs/heads/main');
      g(w.repo, 'checkout', '-q', '-b', 'other');
      const other = land(dir, w.repo, 'push', ['--expect=1']);
      g(w.repo, 'checkout', '-q', 'main');
      writeFileSync(join(w.repo, '.branch-guard'), 'work=feature\n');
      const feature = land(dir, w.repo, 'push', ['--expect=1']);
      writeFileSync(join(w.repo, '.branch-guard'), '');
      const blank = land(dir, w.repo, 'push', ['--expect=1']);
      return h.assertAll([
        ['another checked-out branch is refused and named', other.status !== 0 && /the checked-out branch is "other" and the branch guard names "main"/.test(other.stdout), text(other)],
        ['a work branch that is not main or staging is refused', feature.status !== 0 && /the work branch is "feature", and only main and staging reach a remote/.test(feature.stdout), text(feature)],
        ['a branch guard file naming no work branch is refused', blank.status !== 0 && /the repository has no \.branch-guard file naming a work branch/.test(blank.stdout), text(blank)],
        ['nothing reached the remote', out(w.remote, 'rev-parse', 'refs/heads/main') === before, out(w.remote, 'rev-parse', 'refs/heads/main')],
      ]);
    },
  },
  {
    name: 'step 198: plan-land push refuses a clone path that is not there before it pushes anything',
    guards: ['pl_push_clone_missing'],
    run(m, dir, h) {
      const w = pushWorld(h, 'noclone');
      const before = out(w.remote, 'rev-parse', 'refs/heads/main');
      const r = land(dir, w.repo, 'push', ['--expect=1', `--clone=${join(w.base, 'not-there')}`]);
      return h.assertAll([
        ['the run exits non-zero and names the clone', r.status !== 0 && /the clone .*not-there is not there/.test(r.stdout), text(r)],
        ['nothing reached the remote', out(w.remote, 'rev-parse', 'refs/heads/main') === before, out(w.remote, 'rev-parse', 'refs/heads/main')],
      ]);
    },
  },
  {
    name: 'step 198: plan-land push exits non-zero when the remote refuses the push, when the remote\'s head is not the local head after it, and when the clone does not end at the head',
    guards: ['pl_push_pushfail', 'pl_push_readback', 'pl_push_clone_check'],
    run(m, dir, h) {
      const rejecting = pushWorld(h, 'reject');
      writeFileSync(join(rejecting.remote, 'hooks', 'pre-receive'), '#!/bin/sh\necho "no pushes here" >&2\nexit 1\n', { mode: 0o755 });
      const rejected = land(dir, rejecting.repo, 'push', ['--expect=1']);
      const rewinding = pushWorld(h, 'rewind');
      writeFileSync(join(rewinding.remote, 'hooks', 'post-receive'), '#!/bin/sh\nwhile read old new ref; do git update-ref "$ref" "$old"; done\n', { mode: 0o755 });
      const rewound = land(dir, rewinding.repo, 'push', ['--expect=1']);
      const elsewhere = pushWorld(h, 'elsewhere');
      const strange = join(elsewhere.base, 'strange');
      sh('git', ['clone', '-q', elsewhere.far, strange]);
      const off = land(dir, elsewhere.repo, 'push', ['--expect=1', `--clone=${strange}`]);
      return h.assertAll([
        ['a refused push says it failed', rejected.status !== 0 && /^PUSH FAILED: exit /m.test(rejected.stdout), text(rejected)],
        ['a push the remote did not keep says it was not read back', rewound.status !== 0 && /^PUSH NOT READ BACK: /m.test(rewound.stdout), text(rewound)],
        ['a clone that does not end at the head says so', off.status !== 0 && /^CLONE NOT AT THE HEAD: /m.test(off.stdout), text(off)],
      ]);
    },
  },
  {
    name: 'step 198: the source of plan-land holds no force flag, no deletion of a ref, no amend, no skipping of a hook, no push of anything but the named branch and no shell string',
    guards: [],
    run(m, dir, h) {
      const src = readFileSync(join(dir, F), 'utf8');
      const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
      return h.assertAll([
        ['no force flag', !/--force|--force-with-lease|\+refs|'-f'/.test(code), 'force'],
        ['no deletion of a ref', !/--delete|'-d'|--prune|--mirror/.test(code), 'delete'],
        ['no amend and no skipping of a hook', !/--amend|--no-verify|'-n'/.test(code), 'amend'],
        ['no shell string', !/shell:\s*true|execSync|(^|[^.\w])exec\(|execFile\(/.test(code), 'shell'],
        ['the only push names origin and the work branch', (code.match(/git\('push'/g) ?? []).length === 1 && /git\('push', 'origin', work\)/.test(code), 'push'],
        ['the command writes no file of the repository itself', !/writeFileSync\(join\(REPO/.test(code) && !/rmSync|unlinkSync/.test(code), 'writes'],
      ]);
    },
  },
];

/**
 * A planted remote with a clone of it, the planted repository pushed to it and holding one commit ahead of it, and a second clone for
 * the commits that arrive on the remote meanwhile. The remote and the repository are under one temporary folder.
 */
function pushWorld(h, name) {
  const base = h.tmp(`land-push-${name}-`);
  const remote = join(base, 'remote.git');
  const far = join(base, 'far.git');
  sh('git', ['init', '-q', '--bare', '-b', 'main', remote]);
  sh('git', ['init', '-q', '--bare', '-b', 'main', far]);
  const repo = plantRepo(h, `push-${name}`);
  g(repo, 'remote', 'add', 'origin', remote);
  g(repo, 'push', '-q', 'origin', 'main');
  const clone = join(base, 'clone');
  const other = join(base, 'other');
  for (const d of [clone, other]) { sh('git', ['clone', '-q', remote, d]); g(d, 'config', 'user.name', 'case'); g(d, 'config', 'user.email', 'case@example.invalid'); }
  // The far remote holds a history of its own, for a clone that points elsewhere.
  const seed = join(base, 'seed');
  mkdirSync(seed);
  sh('git', ['init', '-q', '-b', 'main', seed]);
  g(seed, 'config', 'user.name', 'case'); g(seed, 'config', 'user.email', 'case@example.invalid');
  writeFileSync(join(seed, 'z.txt'), 'elsewhere\n');
  g(seed, 'add', '-A'); g(seed, 'commit', '-q', '-m', 'Elsewhere');
  g(seed, 'push', '-q', far, 'main');
  writeFileSync(join(repo, 'a.txt'), 'local\n');
  g(repo, 'add', '-A'); g(repo, 'commit', '-q', '-m', 'Local a');
  return { base, remote, far, repo, clone, other };
}

export const plants = {
  pl_args: ['if (!name || !KNOWN[verb].includes(name)) die(', 'if (false) die(', F],
  pl_verb: ['if (!KNOWN[verb]) die(', 'if (false) die(', F],

  pl_prove_dry_stale: ['if (staleLine) items.push(`${f} holds stale plants: ${staleLine[1]}`);', 'if (false) items.push(`${f} holds stale plants: ${staleLine[1]}`);', F],
  pl_prove_red: ['for (const l of red) items.push(`red case: ${l.slice(6)}`);', 'for (const l of red) void l;', F],
  pl_prove_narrow: ['if (!sub) continue;', 'continue;', F],
  pl_prove_cut: ['if (!/^\\d+\\/\\d+ passed$/m.test(whole.stdout)) items.push(', 'if (false) items.push(', F],
  pl_prove_missed: ["if (v[1] === 'MISSED') items.push(`plant ${v[2]} was MISSED`);", "if (v[1] === 'MISSED') void v;", F],
  pl_prove_stale_key: ['const s = /^PLANT (\\S+): .*stale/.exec(l);', 'const s = null;', F],
  pl_prove_nobad: ['if (Number(end[1])) items.push(', 'if (false) items.push(', F],
  pl_prove_leak: ['if (Number(end[2])) items.push(', 'if (false) items.push(', F],
  pl_prove_early: ['if (!end) items.push(', 'if (false) items.push(', F],
  pl_prove_verdict: ['if (!seen.has(k)) items.push(', 'if (false) items.push(', F],
  pl_prove_long_names: ['const long = LONG.has(basename(f)) || Number(listed[1]) > LONG_COUNT;', 'const long = Number(listed[1]) > LONG_COUNT;', F],
  pl_prove_long_count: ['const long = LONG.has(basename(f)) || Number(listed[1]) > LONG_COUNT;', 'const long = LONG.has(basename(f));', F],
  pl_prove_manifest_keys: ['const keys = new Set(m.all.flatMap((e) => e.plants));', 'const keys = new Set();', F],
  pl_prove_checks_only: ["if (has('checks-only')) checks();", "if (false) checks();", F],
  pl_prove_docs_args: ["['docs', 'docs-check.mjs', (r) => [r]],", "['docs', 'docs-check.mjs', (r) => ['--repo', r]],", F],
  pl_prove_lessons_args: ["['lessons', 'lessons-check.mjs', () => []],", "['lessons', 'lessons-check.mjs', (r) => [r]],", F],
  pl_prove_quote_args: ["['quote', 'quote-check.mjs', (r) => ['--repo', r]],", "['quote', 'quote-check.mjs', (r) => [r]],", F],
  pl_prove_override_suite: ["const suite = m.suite ?? join(REPO, 'session-guards.test.mjs');", "const suite = join(REPO, 'session-guards.test.mjs');", F],
  pl_prove_override_check: ['m.checks[name] ?? join(REPO, file)', 'join(REPO, file)', F],
  pl_prove_exit: ['process.exit(failed ? 1 : 0);', 'process.exit(0);', F],
  pl_prove_out: ['writeFileSync(join(out, `${String(stages.length)', 'void (join(out, `${String(stages.length)', F],
  pl_prove_final: ["say(`PROVE ${failed ? 'FAIL' : 'PASS'}", "say(`PRV ${failed ? 'FAIL' : 'PASS'}", F],
  pl_prove_stage_line: ["say(`${items.length ? 'FAIL' : 'PASS'}  ${name}`);", 'say(`PASS  ${name}`);', F],
  pl_prove_check_fail: ['if (r.status !== 0) items.push(`the ${name} check exited', 'if (false) items.push(`the ${name} check exited', F],

  pl_commit_multiline: ["if (msg.includes('\\n')) causes.push(", 'if (false) causes.push(', F],
  pl_commit_link: ['if (LINK.test(msg)) causes.push(', 'if (false) causes.push(', F],
  pl_commit_model: ['if (NAMES_MODEL.test(msg)) causes.push(', 'if (false) causes.push(', F],
  pl_commit_trailer: ['if (TRAILER.test(e.message)) causes.push(', 'if (false) causes.push(', F],
  pl_commit_empty_msg: ['if (!msg) causes.push(', 'if (false) causes.push(', F],
  pl_commit_nofile: ['if (e.changed.length + e.added.length === 0) causes.push(', 'if (false) causes.push(', F],
  pl_commit_nochange: ["=== '') causes.push(`${e.label}: ${f} is listed and has no change`)", "=== 'zz') causes.push(`${e.label}: ${f} is listed and has no change`)", F],
  pl_commit_added_missing: ['if (!existsSync(join(REPO, f))) causes.push(', 'if (false) causes.push(', F],
  pl_commit_unlisted: ['if (!listed.has(p)) causes.push(', 'if (false) causes.push(', F],
  pl_commit_label_skip: ['if (label === undefined) {', 'if (true) {', F],
  pl_commit_label: ['m.all.filter((e) => e.label === label)', 'm.all', F],
  pl_commit_files: ["const c = git('commit', '-m', e.message.trim(), '--', ...e.changed, ...e.added);", "const c = git('commit', '-a', '-m', e.message.trim());", F],
  pl_commit_add: ["const a = git('add', '--', ...e.added);", "const a = { status: 0, out: '' };", F],
  pl_commit_prints: ['say(`COMMIT ${e.label}: ', 'say(`DONE ${e.label}: ', F],

  pl_push_noguard: ['if (!work) refuse(', 'if (false) refuse(', F],
  pl_push_onlymain: ["if (!['main', 'staging'].includes(work)) refuse(", 'if (false) refuse(', F],
  pl_push_wrongbranch: ['if (here !== work) refuse(', 'if (false) refuse(', F],
  pl_push_expect_needed: ["if (!/^\\d+$/.test(expectRaw ?? '')) refuse(", 'if (false) refuse(', F],
  pl_push_clone_missing: ['if (clone !== undefined && !existsSync(resolve(clone))) refuse(', 'if (false) refuse(', F],
  pl_push_fetch: ["const f = git('fetch', 'origin', work);", 'const f = { status: 0 };', F],
  pl_push_rebase: ["const rb = git('rebase', `origin/${work}`);", 'const rb = { status: 0 };', F],
  pl_push_conflict: ['if (rb.status !== 0) {', 'if (false) {', F],
  pl_push_abort: ["git('rebase', '--abort');", 'void 0;', F],
  pl_push_expect: ['if (ahead !== expectRaw) refuse(', 'if (false) refuse(', F],
  pl_push_pushes: ["const p = git('push', 'origin', work);", "const p = git('status');", F],
  pl_push_pushfail: ['if (p.status !== 0) { say(`PUSH FAILED', 'if (false) { say(`PUSH FAILED', F],
  pl_push_readback: ['if (remote !== head) {', 'if (false) {', F],
  pl_push_clone: ["const pl = gitIn(resolve(clone), 'pull', 'origin', work);", 'const pl = { status: 0 };', F],
  pl_push_clone_check: ['if (pl.status !== 0 || there !== head) {', 'if (false) {', F],
};
