// Cases and plants for plan-seed.mjs and plans/seed-template.md (step 124 of the plan of 8 November: Q-HUB-278, Q-HUB-282, Q-HUB-286,
// Q-HUB-302, Q-HUB-308, Q-HUB-311, Q-HUB-313, Q-HUB-320, Q-HUB-330, Q-HUB-332, Q-HUB-334 and Q-HUB-336). Shape: guard-cases/shape.mjs.
// Every hub, program, marker and repository a case needs is written under a temporary folder from `h`, never into the working copy.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const git = (cwd, ...args) => spawnSync('git', ['-c', 'user.name=case', '-c', 'user.email=case@example.invalid', ...args], { cwd, encoding: 'utf8', timeout: 30000 });

export const cases = [
  {
    name: 'step 124: the seed\'s standing text carries the launch, the no-amend, the send-report-file, the check-spelling, the every-case, the dispatcher-file, the red-gates-lines, the remote-head-before-filing, the by-key close report and the findings-passed-in rules, in the single print and in the batch print',
    guards: ['tpl_launch', 'tpl_no_amend', 'tpl_resend_file', 'tpl_check_spelling', 'tpl_every_case', 'tpl_dispatcher_file', 'tpl_landing_red', 'tpl_close_remote', 'tpl_close_keys', 'tpl_passed_in'],
    run(m, dir, h) {
      const hub = h.seedHub(dir);
      const single = h.seedRun(dir, hub, ['--item', 'P-3']);
      const batch = h.batchRun(dir, h.batchHub(dir), []);
      const out = (r) => `${r.stdout}${r.stderr}`;
      const rows = [];
      for (const [mode, r] of [['single', single], ['batch', batch]]) {
        const t = out(r);
        const has = (label, s) => rows.push([`${mode}: ${label}`, t.includes(s), t.slice(0, 300)]);
        has('the shell-start sentence says which launch it holds for', 'that holds for a session launched inside the repository, and a session launched at the parent folder');
        has('a commit with a wrong message is never amended', 'A commit with a wrong message is never amended');
        has('a send after the first writes its own report file', 'a hyphen, the send\'s number and then -report.txt');
        has('each hub check is spelled as its usage gives', 'the docs check takes the repository\'s full path bare, and the quote, privacy, third-person, example and pin checks take');
        has('a step editing a guard file runs every case', 'runs every case of the suite, with no case filter, once after its last edit');
        has('a step adding a refusal lists the dispatcher', 'lists `hook-dispatch.mjs` among its files');
        has('a red gates run is read into the report', 'where it has concluded red its failing lines, read from the run\'s log through the connector and written into the report');
        has('the close reads the remote\'s head before filing', 'reads the remote\'s head with `git show origin/main:PROGRAM.md`');
        has('the close report names each key', 'key by key and never as a range');
        has('the close files the findings passed in', 'for each finding listed in the plan\'s section Findings passed in');
      }
      return h.assertAll(rows);
    },
  },
  {
    name: 'step 124: the seed prints a Findings passed in section, a place for the stop hook\'s forced turns in the Cost, the send-report-file sentence on the step shape and the by-key close report in the Verification, in the single print and in the batch print',
    guards: ['seed_passed_in', 'batch_passed_in', 'seed_step_report_file', 'batch_step_report_file', 'seed_cost_forced', 'batch_cost_forced', 'seed_close_keys', 'batch_close_keys'],
    run(m, dir, h) {
      const single = h.seedRun(dir, h.seedHub(dir), ['--item', 'P-3', '--steps', '1']);
      const batch = h.batchRun(dir, h.batchHub(dir), []);
      const rows = [];
      for (const [mode, r] of [['single', single], ['batch', batch]]) {
        const t = `${r.stdout}${r.stderr}`;
        const body = t.split('==== THE PLAN STARTS BELOW THIS LINE ====')[1] ?? '';
        const section = (name) => new RegExp(`\\n## ${name}\\n\\n([\\s\\S]*?)(?=\\n## |\\n==== THE PLAN ENDS)`).exec(body)?.[1] ?? '';
        const passed = section('Findings passed in');
        const cost = section('Cost');
        const verification = section('Verification');
        const placeholder = (s) => (s.match(/<[^<>\n]*>/g) ?? []).length;
        rows.push([`${mode}: the Findings passed in section holds a placeholder for the findings the owner passed in`, /Each finding the owner passed in from another session/.test(passed) && placeholder(passed) === 1, passed]);
        // The single print keeps the placeholder; the batch print computes the number from its file steps (step 131).
        rows.push([`${mode}: the Cost has a place for the forced turns of the stop hook`, mode === 'single'
          ? /the number of turns the environment's stop hook forces while a commit stands unpushed, written as a number beside the words forced turns/.test(cost)
          : /\b\d+ forced turns of the stop hook are spent while a commit stands unpushed/.test(cost), cost]);
        const stepLine = (mode === 'single' ? /\n2\. \*\*<the item's step 2[^\n]*/ : /\n2\. \*\*Put right in[^\n]*/).exec(body)?.[0] ?? '';
        rows.push([`${mode}: the step shape names a report file for each send after the first`, stepLine.includes('(new); a send after the first writes its own file, named for the step number, a hyphen, the send\'s number and -report.txt. Estimate '), stepLine.slice(-300)]);
        rows.push([`${mode}: the Verification names each filed key beside its line`, /key by key and never as a range/.test(verification), verification]);
      }
      return h.assertAll(rows);
    },
  },
  {
    name: 'step 124: the batch print spells each hub check as its own usage gives, the docs check with the path bare, the lessons check with none and the others after the repo flag',
    guards: ['batch_docs_bare', 'batch_repo_flag'],
    run(m, dir, h) {
      const hub = h.batchHub(dir);
      const r = h.batchRun(dir, hub, []);
      const t = `${r.stdout}${r.stderr}`;
      // The checks run once, in the commit step of the batch (step 131), and no longer in a file step.
      const step = /\n\d+\. \*\*Committed, proved and landed[^\n]*/.exec(t)?.[0] ?? '';
      return h.assertAll([
        ['the docs check carries the path bare', step.includes(`\`node ${hub}/docs-check.mjs ${hub}\``), step.slice(-900)],
        ['the quote check carries the repo flag', step.includes(`\`node ${hub}/quote-check.mjs --repo ${hub}\``), step.slice(-900)],
        ['the privacy check carries the repo flag', step.includes(`\`node ${hub}/privacy-check.mjs --repo ${hub}\``), step.slice(-900)],
        ['the pin check carries the repo flag', step.includes(`\`node ${hub}/pin-check.mjs --repo ${hub}\``), step.slice(-900)],
        ['the lessons check carries no path', step.includes(`\`node ${hub}/lessons-check.mjs\``), step.slice(-900)],
      ]);
    },
  },
  {
    name: 'step 124: the numbers the seed prints are the next free ones past the remote\'s main as last fetched, for the found key, the lesson number and the program key, in the single print and in the batch print; a folder with no remote prints the working copy\'s',
    guards: ['seed_remote_read', 'seed_remote_found', 'seed_remote_lesson', 'seed_remote_program', 'batch_remote_found', 'batch_remote_program'],
    run(m, dir, h) {
      const make = (maker) => {
        const hub = maker(dir);
        git(hub, 'init', '-q', '-b', 'main');
        // The remote's main holds what another session landed: found file 50, lesson 60 and program item 40, none of them in the working copy.
        mkdirSync(join(hub, 'found'), { recursive: true });
        mkdirSync(join(hub, 'lessons'), { recursive: true });
        writeFileSync(join(hub, 'found', 'Q-HUB-50.md'), 'Q-HUB-50: a planted finding another session landed.\n');
        writeFileSync(join(hub, 'lessons', '60-a-landed-lesson.md'), '## 60 · A landed lesson\n');
        const programPath = join(hub, 'PROGRAM.md');
        const original = readFileSync(programPath, 'utf8');
        writeFileSync(programPath, `${original}\n### P-40. Landed item\n\nRepository: hub. Goal: 6. State: done. Plan: none.\n\nAcceptance: Landed.\n\nDepends: none.\n`);
        git(hub, 'add', '-A');
        git(hub, 'commit', '-q', '-m', 'the remote moves on');
        git(hub, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
        rmSync(join(hub, 'found', 'Q-HUB-50.md'));
        rmSync(join(hub, 'lessons', '60-a-landed-lesson.md'));
        writeFileSync(programPath, original);
        return hub;
      };
      const singleHub = make(h.seedHub);
      const batchHub = make(h.batchHub);
      const bareHub = h.seedHub(dir);
      const single = h.seedRun(dir, singleHub, ['--item', 'P-3']);
      const batch = h.batchRun(dir, batchHub, []);
      const bare = h.seedRun(dir, bareHub, ['--item', 'P-3']);
      const s = `${single.stdout}${single.stderr}`;
      const b = `${batch.stdout}${batch.stderr}`;
      const n = `${bare.stdout}${bare.stderr}`;
      return h.assertAll([
        ['single: the next free found key is past the remote\'s', s.includes('the next free found key: Q-HUB-51'), s.slice(-700)],
        ['single: the next free lesson number is past the remote\'s', s.includes('the next free lesson number: 61'), s.slice(-700)],
        ['single: the next free program key is past the remote\'s', s.includes('the next free program key: P-41'), s.slice(-700)],
        ['single: the print says what the remote held', s.includes('which holds up to P-40, Q-HUB-50 and lesson 60'), s.slice(-700)],
        ['batch: the next free found key is past the remote\'s', b.includes('the next free found key: Q-HUB-51'), b.slice(-700)],
        ['batch: the next free program key is past the remote\'s', b.includes('the next free program key: P-41'), b.slice(-700)],
        ['a folder with no remote main prints the working copy\'s numbers and no remote note', n.includes('the next free found key: Q-HUB-5\n') && n.includes('the next free program key: P-4\n') && !n.includes('which holds up to'), n.slice(-700)],
      ]);
    },
  },
  {
    name: 'step 124: `--item next` takes the item the session\'s approval marker names when the marker is this session\'s and the item is open or planned, and the program\'s first open item otherwise',
    guards: ['seed_marker_item', 'seed_marker_session', 'seed_marker_state'],
    run(m, dir, h) {
      const hub = h.seedHub(dir);
      const home = h.tmp('sg-seedhome-');
      mkdirSync(join(home, '.claude'), { recursive: true });
      const plans = h.tmp('sg-seedplans-');
      const planFor = (name, title) => {
        const p = join(plans, `${name}.md`);
        writeFileSync(p, `# ${title}\n\n## Goals\n\n1. Planted goal of the case.\n`);
        return p;
      };
      const SID = 'sg-seed-marker-session';
      const run = (marker) => {
        writeFileSync(join(home, '.claude', 'APPROVED-PLAN.json'), `${JSON.stringify(marker)}\n`);
        const r = spawnSync('node', [join(dir, 'plan-seed.mjs'), '--hub', hub, '--repo', hub, '--item', 'next'],
          { encoding: 'utf8', timeout: 60000, env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: SID } });
        return `${r.stdout}${r.stderr}`.split('\n')[0];
      };
      const planned = run({ plan: planFor('a', 'A plan that finishes P-1 and nothing else'), session: SID });
      const viaField = run({ plan: planFor('b', 'A plan with no key in its title'), session: SID, item: 'P-1' });
      const other = run({ plan: planFor('c', 'A plan that finishes P-1 and nothing else'), session: 'another-session' });
      const done = run({ plan: planFor('d', 'A plan that finishes P-2 and nothing else'), session: SID });
      const none = run({ plan: join(plans, 'missing.md'), session: SID });
      return h.assertAll([
        ['a marker of this session naming a planned item in its plan\'s title gives that item', /^PLAN SEED for P-1 /.test(planned), planned],
        ['a marker with an item field gives that item', /^PLAN SEED for P-1 /.test(viaField), viaField],
        ['a marker of another session gives the first open item', /^PLAN SEED for P-3 /.test(other), other],
        ['a marker naming a done item gives the first open item', /^PLAN SEED for P-3 /.test(done), done],
        ['a marker whose plan cannot be read gives the first open item', /^PLAN SEED for P-3 /.test(none), none],
      ]);
    },
  },
  {
    name: 'step 131: the batch print groups the findings by file with a seam in both steps, gives a finding that names no file a step of its own, runs the file steps after the take-up and together, adds one commit step, computes the Cost from the estimates, and carries the standing lines of a parallel batch, the index row of the close and the device line',
    guards: ['batch_after_parallel', 'batch_no_file_own', 'batch_seam_out', 'batch_seam_in', 'batch_case_file', 'batch_commit_step', 'batch_parallel_rules', 'batch_cost_agent', 'batch_cost_wall',
      'batch_wave_cap', 'batch_wave_header', 'batch_wave_home', 'batch_wave_switch',
      'tpl_close_index', 'tpl_review_resend', 'tpl_commit_red_case', 'tpl_commit_by_path', 'tpl_bg_order', 'tpl_device_line', 'tpl_push_landing', 'tpl_commit_step_text'],
    run(m, dir, h) {
      const hub = h.batchHub(dir);
      mkdirSync(join(hub, 'guard-cases'), { recursive: true });
      writeFileSync(join(hub, 'guard-cases', 'alpha.mjs'), '// a planted case file of the case\n');
      const r = h.batchRun(dir, hub, []);
      const t = `${r.stdout}${r.stderr}`;
      const step = (n) => (t.split(new RegExp(`\\n${n}\\. \\*\\*`))[1] ?? '').split(/\n\d+\. \*\*/)[0];
      const [alpha, beta, none, commit, close] = [2, 3, 4, 5, 6].map(step);
      const cost = (t.split('\n## Cost\n\n')[1] ?? '').split('\n')[0];
      const single = `${h.seedRun(dir, h.seedHub(dir), ['--item', 'P-3']).stdout}`;
      const rows = [
        ['the Order and the After line run the three file steps after the take-up and together, the commit step after all three and the close after it', t.includes('\nOrder: 1 2 3 4 5 6\n') && t.includes('\nStanding: 7\n')
          && t.includes('\nAfter: 2 after 1; 3 after 1; 4 after 1; 5 after 2 3 4; 6 after 5\n'), t.slice(t.indexOf('## Order'), t.indexOf('## Order') + 300)],
        ['the findings are grouped by file, and the finding that names no file has a step of its own', alpha.startsWith('Put right in `alpha.mjs`: Q-HUB-11, Q-HUB-13, Q-HUB-15.') && beta.startsWith('Put right in `beta.mjs`: Q-HUB-14.')
          && none.startsWith('Put right in the files each names: Q-HUB-12.'), `${alpha.slice(0, 80)} | ${beta.slice(0, 80)} | ${none.slice(0, 80)}`],
        ['the seam of a finding naming a second file is written into the Facts of the step that holds the finding', beta.includes('Q-HUB-14 names `alpha.mjs` too, which step 2 owns, so this step does not touch it'), beta.slice(0, 900)],
        ['the seam is written into the Facts of the step that owns the second file as well', alpha.includes('step 3 takes up Q-HUB-14, whose text names `alpha.mjs`, which this step owns'), alpha.slice(0, 900)],
        ['the step of the finding that names no file ends EJECT when a file it must edit is another step\'s, in its Facts and in its Kill', none.includes('names no file of the repository') && none.includes('another step of this plan owns ends it EJECT naming the file')
          && (none.split('Kill:')[1] ?? '').includes('a change that needs a line in a file this step does not own ends it EJECT'), none.slice(0, 900)],
        ['a guard file has its own case file named for it, new where the folder has none', alpha.includes('its own case file `guard-cases/alpha.mjs`') && !alpha.includes('`guard-cases/alpha.mjs` (new)') && beta.includes('`guard-cases/beta.mjs` (new)'), `${alpha.slice(0, 300)} | ${beta.slice(0, 300)}`],
        ['no file step commits, stages, pushes or runs a plant or a check', [alpha, beta, none].every((s) => s.includes('commits nothing, stages nothing and runs no plants and no check') && !s.includes('git push origin main')), alpha.slice(0, 400)],
        ['one commit step follows the file steps and names their number, their guard files and one commit for each', t.split('Committed, proved and landed').length === 2 && commit.startsWith('Committed, proved and landed')
          && commit.includes('steps 2 to 4 left their edits uncommitted') && commit.includes('the files being `alpha.mjs`, `beta.mjs`') && commit.includes('one commit for each of steps 2 to 4 in that order, nothing staged beforehand'), commit.slice(0, 700)],
        ['the close step is the one after the commit step and writes an index row for each lesson in the shape the index\'s rows hold', close.startsWith('Closed in the program') && close.includes('add one index row for it in `LESSONS.md` in the shape the index\'s rows hold'), close.slice(0, 200)],
        ['the Cost counts the steps and the pushes, and the forced turns are the file steps plus two', cost.includes('The 6 steps (3 file steps run at the same time') && cost.includes('3 pushes are made') && cost.includes('5 forced turns of the stop hook'), cost],
        ['the Cost sums the estimates for the agent time', cost.includes('Agent time is the sum of the steps\' estimates, 170 min'), cost],
        ['the Cost takes the wall time as the take-up, the longest file step, the commit step and the close', cost.includes('and the close, 130 min.'), cost],
      ];
      const lines = [
        ['the file steps run at the same time in the one working copy', 'The file steps, 2 to 4, run at the same time in the one working copy'],
        ['a review for a resend goes only when no agent edits the working copy', 'A review for a resend of a file step is sent only when no agent is editing the working copy'],
        ['the commit step puts an existing case turned red right in the owning step\'s file', 'the commit step puts the code right in the owning step\'s file and keeps the finding\'s fix'],
        ['commits name their own files after the message with nothing staged beforehand', 'stages nothing beforehand and names each commit\'s own files after the message'],
        ['the second write of the background note is the very next call after the launch', 'as the very next call after the launch and before any other call'],
        ['a number from the device comes from the test page and never a container render', 'names the app\'s test page as its instrument and never a container render'],
        ['nothing is pushed except by the plan\'s landing steps', 'Nothing is pushed except by the plan\'s landing steps, which are the take-up step, a commit step where the plan has one, and the close step'],
      ];
      for (const [label, s] of lines) rows.push([`batch: ${label}`, t.includes(s), s]);
      for (const [label, s] of lines.slice(4)) rows.push([`single: ${label}`, single.includes(s), s]);
      rows.push(['single: the close step writes the index row too', single.includes('add one index row for it in `LESSONS.md` in the shape the index\'s rows hold'), 'index row']);

      // A wave holds up to seven file steps; the groups it leaves are named in the header and printed by the next wave; two groups of one file never share a wave.
      const wv = h.seedHub(dir);
      const entry = (n) => [`### P-${n}. Q-HUB-2${n}: planted finding ${n}`, '', 'Repository: hub. Goal: 6. State: open. Plan: none.', '', `Acceptance: Planted acceptance ${n}.`, '', 'Depends: none.', ''].join('\n');
      const head = ['# The program', '', 'Intro line of the planted program.', '', '## Thesis', '', 'A planted thesis paragraph of the case, one paragraph only.', '', '## Items', '', '9 items planted for the case.', '', '## The harness', ''].join('\n');
      writeFileSync(join(wv, 'PROGRAM.md'), `${head}\n${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(entry).join('\n')}`);
      for (let n = 1; n <= 8; n++) writeFileSync(join(wv, `f${n}.mjs`), '// a planted file of the case\n');
      for (let n = 1; n <= 8; n++) writeFileSync(join(wv, 'found', `Q-HUB-2${n}.md`), `Q-HUB-2${n}: a planted finding about \`f${n}.mjs\`.\n`);
      writeFileSync(join(wv, 'found', 'Q-HUB-29.md'), 'Q-HUB-29: a planted finding about `f1.mjs` and `f2.mjs`.\n');
      const w1 = h.batchRun(dir, wv, []).stdout;
      const w2 = h.batchRun(dir, wv, ['--wave', '2']).stdout;
      const sz = h.batchRun(dir, wv, ['--size', '1']).stdout;
      const titles = (s) => [...s.matchAll(/^\d+\. \*\*Put right in `(f\d)\.mjs`/gm)].map((x) => x[1]);
      rows.push(['wave 1 holds seven file steps at once and the header names the group it leaves and the switch that prints it', titles(w1).length === 7 && w1.split('\n')[0].includes('in 7 group steps')
        && w1.split('\n')[1].includes('leaves 1 of the 8 groups') && w1.split('\n')[1].includes('--wave 2') && !w1.includes('Put right in `f8.mjs`') && w1.includes('\nOrder: 1 2 3 4 5 6 7 8 9 10\n'), w1.split('\n').slice(0, 2).join(' | ')]);
      rows.push(['wave 2 prints the group wave 1 left', titles(w2).join(',') === 'f8' && w2.split('\n')[0].includes('in 1 group step,') && w2.split('\n')[1].includes('leaves 0 of the 8 groups'), w2.split('\n').slice(0, 2).join(' | ')]);
      rows.push(['two groups of one file never share a wave: a size of one leaves the second run of the file for the next wave', titles(sz).filter((x) => x === 'f1').length === 1 && titles(sz).length === 7 && sz.split('\n')[1].includes('leaves 2 of the 9 groups'), `${titles(sz)} ${sz.split('\n')[1]}`]);
      // Two findings that name no file are two steps, never one step that holds both.
      const nf = h.seedHub(dir);
      writeFileSync(join(nf, 'PROGRAM.md'), `${head}\n${[1, 2].map(entry).join('\n')}`);
      for (const n of [1, 2]) writeFileSync(join(nf, 'found', `Q-HUB-2${n}.md`), `Q-HUB-2${n}: a planted finding that names no file of the repository.\n`);
      const nfo = h.batchRun(dir, nf, []).stdout;
      rows.push(['two findings naming no file are two steps of their own', [...nfo.matchAll(/^\d+\. \*\*Put right in the files each names: (Q-HUB-2\d)\./gm)].map((x) => x[1]).join(',') === 'Q-HUB-21,Q-HUB-22', nfo.split('\n')[0]]);
      return h.assertAll(rows);
    },
  },
];

export const plants = {
  seed_passed_in: ["L(FINDINGS_PASSED_IN);\n  L();\n  L('## Item entry');", "L('- <none>');\n  L();\n  L('## Item entry');", 'plan-seed.mjs'],
  batch_passed_in: ["L(FINDINGS_PASSED_IN);\n  L();\n  L('## Thesis');", "L('- <none>');\n  L();\n  L('## Thesis');", 'plan-seed.mjs'],
  seed_step_report_file: ['(new); ${SEND_REPORT}. Estimate <minutes> min.', '(new). Estimate <minutes> min.', 'plan-seed.mjs'],
  batch_step_report_file: ['(new); ${SEND_REPORT}. Estimate ${groupEst[i]} min.', '(new). Estimate ${groupEst[i]} min.', 'plan-seed.mjs'],
  seed_cost_forced: ["one by the close step, each rebased onto the remote's head. ${FORCED_TURNS} ", "one by the close step, each rebased onto the remote's head. ", 'plan-seed.mjs'],
  batch_cost_forced: ['${groups.length + 2} forced turns of the stop hook are spent while a commit stands unpushed, the file steps plus two. ', '', 'plan-seed.mjs'],
  seed_close_keys: ["L(CLOSE_KEYS_LINE);\n  L();\n\n  // ---- the movable", "L();\n\n  // ---- the movable", 'plan-seed.mjs'],
  batch_close_keys: ["L(CLOSE_KEYS_LINE);\n  L();\n  L('==== THE PLAN ENDS", "L();\n  L('==== THE PLAN ENDS", 'plan-seed.mjs'],
  batch_docs_bare: ["c === 'docs-check' ? `${base} ${repo}`", "c === 'docs-check' ? base", 'plan-seed.mjs'],
  batch_repo_flag: [': `${base} --repo ${repo}`}\\`', ': base}\\`', 'plan-seed.mjs'],
  seed_remote_read: ["const f = git(['ls-tree', '--name-only', 'origin/main', 'found/'], hub);", "const f = git(['ls-tree', '--name-only', 'origin/none', 'found/'], hub);", 'plan-seed.mjs'],
  seed_remote_found: ['const hubMax = Math.max(fileMax, remote.found, ', 'const hubMax = Math.max(fileMax, ', 'plan-seed.mjs'],
  seed_remote_lesson: ['let lessonMax = remote.lesson;', 'let lessonMax = 0;', 'plan-seed.mjs'],
  seed_remote_program: ['const nextPk = Math.max(nextP, remote.program + 1);', 'const nextPk = nextP;', 'plan-seed.mjs'],
  batch_remote_found: ["remote.found, ...parts.filter((m) => m[1] === 'HUB').map((m) => Number(m[2])), 0);\n  let lessonMax = remote.lesson;\n  try { for (const n of readdirSync(join(hub, 'lessons'))) { const m = /^(\\d+)-/.exec(n); if (m) lessonMax = Math.max(lessonMax, Number(m[1])); } } catch { /* no folder */ }\n  const nextP =",
    "...parts.filter((m) => m[1] === 'HUB').map((m) => Number(m[2])), 0);\n  let lessonMax = remote.lesson;\n  try { for (const n of readdirSync(join(hub, 'lessons'))) { const m = /^(\\d+)-/.exec(n); if (m) lessonMax = Math.max(lessonMax, Number(m[1])); } } catch { /* no folder */ }\n  const nextP =", 'plan-seed.mjs'],
  batch_remote_program: ['const nextP = Math.max((entries.reduce((m, e) => Math.max(m, e.n), 0)) + 1, remote.program + 1);', 'const nextP = (entries.reduce((m, e) => Math.max(m, e.n), 0)) + 1;', 'plan-seed.mjs'],
  seed_marker_item: ['(entries.find((e) => e.key === markedKey) ?? firstOpen)', 'firstOpen', 'plan-seed.mjs'],
  seed_marker_session: ["if (!sid || mk.session !== sid) return '';", '', 'plan-seed.mjs'],
  seed_marker_state: ["(e.state === 'open' || e.state === 'planned')", 'true', 'plan-seed.mjs'],
  tpl_launch: ['that holds for a session launched inside the repository, and a session launched at the parent folder', 'that holds for a session launched anywhere, and a session launched at the parent folder', 'plans/seed-template.md'],
  tpl_no_amend: ['A commit with a wrong message is never amended', 'A commit with a wrong message may be amended', 'plans/seed-template.md'],
  tpl_resend_file: ["a hyphen, the send's number and then -report.txt", 'and then -report.txt', 'plans/seed-template.md'],
  tpl_check_spelling: ["the docs check takes the repository's full path bare, and the quote, privacy", "the docs check and the quote check take the repository's full path bare, and the privacy", 'plans/seed-template.md'],
  tpl_every_case: ['runs every case of the suite, with no case filter, once after its last edit', 'runs its own cases of the suite, with a case filter, once after its last edit', 'plans/seed-template.md'],
  tpl_dispatcher_file: ['lists `hook-dispatch.mjs` among its files', 'lists `plan-seed.mjs` among its files', 'plans/seed-template.md'],
  tpl_landing_red: ["where it has concluded red its failing lines, read from the run's log through the connector and written into the report", 'where it has concluded red its failing lines are left', 'plans/seed-template.md'],
  tpl_close_remote: ["reads the remote's head with `git show origin/main:PROGRAM.md`", "reads the remote's head with `git show main:PROGRAM.md`", 'plans/seed-template.md'],
  tpl_close_keys: ['key by key and never as a range', 'as a range', 'plans/seed-template.md'],
  tpl_passed_in: ["for each finding listed in the plan's section Findings passed in", "for each finding listed in the plan's section Notes", 'plans/seed-template.md'],
  // step 131: the batch print's parallel shape
  batch_after_parallel: ['const after = [...gnums.map((n) => `${n} after ${takeup}`),', 'const after = [...gnums.map((n, i) => `${n} after ${i ? gnums[i - 1] : takeup}`),', 'plan-seed.mjs'],
  batch_no_file_own: ["if (h === '') { for (const f of fs) groups.push({ home: '', list: [f] }); continue; }", '', 'plan-seed.mjs'],
  batch_seam_out: ['seamsOut[i].add(', 'seamsOut[i].has(', 'plan-seed.mjs'],
  batch_seam_in: ['seamsIn[j].add(', 'seamsIn[j].has(', 'plan-seed.mjs'],
  batch_case_file: ["? `guard-cases/${x}` : '');", "? '' : '');", 'plan-seed.mjs'],
  batch_commit_step: ["if (hasCommit) { L(fill(tpl['commit-step']", "if (false) { L(fill(tpl['commit-step']", 'plan-seed.mjs'],
  batch_parallel_rules: ["if (hasCommit) L(fill(tpl['parallel-rules']", "if (false) L(fill(tpl['parallel-rules']", 'plan-seed.mjs'],
  batch_cost_agent: ["Agent time is the sum of the steps' estimates, ${agentMin} min", "Agent time is the sum of the steps' estimates, 0 min", 'plan-seed.mjs'],
  batch_cost_wall: ['and the close, ${wallMin} min.', 'and the close, 0 min.', 'plan-seed.mjs'],
  batch_wave_cap: ['const WAVE = 7;', 'const WAVE = 99;', 'plan-seed.mjs'],
  batch_wave_header: ['and it leaves ${leaves} of the ${totalGroups} groups', 'and it leaves 0 of the ${totalGroups} groups', 'plan-seed.mjs'],
  batch_wave_home: ['!(g.home && used.has(g.home))', 'true', 'plan-seed.mjs'],
  batch_wave_switch: ['Math.floor(Number(o.wave) || 1)', '1', 'plan-seed.mjs'],
  tpl_close_index: ['add one index row for it in `LESSONS.md` in the shape the index\'s rows hold', 'add one row for it', 'plans/seed-template.md'],
  tpl_review_resend: ['A review for a resend of a file step is sent only when no agent is editing the working copy', 'A review for a resend of a file step may be sent while an agent is editing the working copy', 'plans/seed-template.md'],
  tpl_commit_red_case: ["the commit step puts the code right in the owning step's file and keeps the finding's fix", 'the commit step leaves the case red', 'plans/seed-template.md'],
  tpl_commit_by_path: ["stages nothing beforehand and names each commit's own files after the message", 'stages everything beforehand', 'plans/seed-template.md'],
  tpl_bg_order: ['as the very next call after the launch and before any other call', 'as a later call', 'plans/seed-template.md'],
  tpl_device_line: ["names the app's test page as its instrument and never a container render", "names a container render as its instrument", 'plans/seed-template.md'],
  tpl_push_landing: ["Nothing is pushed except by the plan's landing steps, which are the take-up step, a commit step where the plan has one, and the close step", 'Nothing is pushed except by the take-up step', 'plans/seed-template.md'],
  tpl_commit_step_text: ['one commit for each of steps {FIRSTGROUP} to {LASTGROUP} in that order, nothing staged beforehand', 'one commit for all of steps {FIRSTGROUP} to {LASTGROUP}', 'plans/seed-template.md'],
};
