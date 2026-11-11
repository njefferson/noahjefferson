// Cases and plants for plan-seed.mjs and plans/seed-template.md (step 124 of the plan of 8 November: Q-HUB-278, Q-HUB-282, Q-HUB-286,
// Q-HUB-302, Q-HUB-308, Q-HUB-311, Q-HUB-313, Q-HUB-320, Q-HUB-330, Q-HUB-332, Q-HUB-334 and Q-HUB-336; step 159 of the plan of 9 November: Q-HUB-377,
// Q-HUB-379, Q-HUB-380, Q-HUB-386, Q-HUB-396, Q-HUB-397 and Q-HUB-399). Shape: guard-cases/shape.mjs.
// Every hub, program, marker and repository a case needs is written under a temporary folder from `h`, never into the working copy.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from 'node:fs';
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
        const gates = 'the doctrine gates run for the pushed commit read through the connector for its state alone, its conclusion or that it was still running, and no log of it read';
        has('the gates run is read through the connector for its state alone', gates);
        // The sentence stands in the landing acts of the step that lands the work, read from that step's own line: the take-up of the single print carries the same words, so a check on the whole print passed with the landing's copy gone.
        const landStep = /\n\d+\. \*\*(?:Closed in the program|Landed once)[^\n]*/.exec(t)?.[0] ?? '';
        rows.push([`${mode}: the landing step reads the gates run for its state alone`, landStep.includes(gates), landStep.slice(0, 300)]);
        has('the close reads the remote\'s head before filing','reads the remote\'s head with `git show origin/main:PROGRAM.md`');
        // The whole sentence of the close step, read from that step's line: the Verification line carries the same words, so a check on the whole print passed with the template's sentence gone.
        const closeStep = /\n\d+\. \*\*(?:Closed in the program|Landed once)[^\n]*/.exec(t)?.[0] ?? '';
        rows.push([`${mode}: the close step's report names each key it filed beside the line it came from, key by key and never as a range`,
          closeStep.includes("the step's report naming each key it filed beside the line it came from, key by key and never as a range"), closeStep.slice(0, 300)]);
        has('the close files the findings passed in', 'for each finding listed in the plan\'s section Findings passed in');
      }
      // The word new prints its own take-up step from its own block of the template, which carries the same sentence: a check on the single and batch prints alone passed with that block's copy gone.
      const fresh = out(h.seedRun(dir, hub, ['--item', 'new']));
      const freshStep = (fresh.split(/\n1\. \*\*/)[1] ?? '').split(/\n\d+\. \*\*/)[0];
      rows.push(['new: the take-up step reads the remote\'s head before filing', freshStep.includes('reads the remote\'s head with `git show origin/main:PROGRAM.md`'), freshStep.slice(0, 300)]);
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
      // The checks run in the landing step of the batch (step 131, then step 159 of the plan of 9 November), and not in a file step.
      const step = /\n\d+\. \*\*Landed once[^\n]*/.exec(t)?.[0] ?? '';
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
    name: 'step 131: the batch print groups the findings by file with a seam in both steps, gives a finding that names no file no step and lists its key after the plan\'s end, runs the file steps after the take-up and together, adds one commit step, computes the Cost from the estimates, and carries the standing lines of a parallel batch, the index row of the close and the device line',
    guards: ['batch_after_parallel', 'batch_landing_after', 'batch_order_landing', 'batch_no_file_own', 'batch_seam_out', 'batch_seam_in', 'batch_case_file', 'batch_landing_step', 'batch_parallel_rules', 'batch_cost_agent', 'batch_cost_wall',
      'batch_wave_cap', 'batch_wave_header', 'batch_wave_home', 'batch_wave_switch',
      'tpl_close_index', 'tpl_review_resend', 'tpl_commit_red_case', 'tpl_commit_by_path', 'tpl_rule_no_bg', 'tpl_device_line', 'tpl_push_landing', 'tpl_commit_step_text'],
    run(m, dir, h) {
      const hub = h.batchHub(dir);
      mkdirSync(join(hub, 'guard-cases'), { recursive: true });
      writeFileSync(join(hub, 'guard-cases', 'alpha.mjs'), '// a planted case file of the case\n');
      const r = h.batchRun(dir, hub, []);
      const t = `${r.stdout}${r.stderr}`;
      const step = (n) => (t.split(new RegExp(`\\n${n}\\. \\*\\*`))[1] ?? '').split(/\n\d+\. \*\*/)[0];
      const [alpha, beta, landing] = [2, 3, 4].map(step);
      const afterEnd = t.split('==== THE PLAN ENDS ABOVE THIS LINE ====')[1] ?? '';
      const cost = (t.split('\n## Cost\n\n')[1] ?? '').split('\n')[0];
      const single = `${h.seedRun(dir, h.seedHub(dir), ['--item', 'P-3']).stdout}`;
      const rows = [
        ['the Order and the After line run the two file steps after the take-up and together and the one landing step after both, with no commit step and no close step apart from it', t.includes('\nOrder: 1 2 3 4\n') && t.includes('\nStanding: 5\n')
          && t.includes('\nAfter: 2 after 1; 3 after 1; 4 after 2 3\n') && !t.includes('Committed, proved and landed') && !/\n\d+\. \*\*Closed in the program/.test(t), t.slice(t.indexOf('## Order'), t.indexOf('## Order') + 300)],
        ['the findings are grouped by file, and the finding that names no file has no step, its key and item listed after the plan\'s end as not placed', alpha.startsWith('Put right in `alpha.mjs`: Q-HUB-11, Q-HUB-13, Q-HUB-15.') && beta.startsWith('Put right in `beta.mjs`: Q-HUB-14.')
          && [...t.matchAll(/^\d+\. \*\*Put right in /gm)].length === 2 && /NOT PLACED[^\n]*Q-HUB-12 \(item P-2\)/.test(afterEnd) && !t.split('==== THE PLAN ENDS')[0].includes('NOT PLACED'),
          `${alpha.slice(0, 80)} | ${beta.slice(0, 80)} | ${afterEnd.slice(-300)}`],
        ['the seam of a finding naming a second file is written into the Facts of the step that holds the finding', beta.includes('Q-HUB-14 names `alpha.mjs` too, which step 2 owns, so this step does not touch it'), beta.slice(0, 900)],
        ['the seam is written into the Facts of the step that owns the second file as well', alpha.includes('step 3 takes up Q-HUB-14, whose text names `alpha.mjs`, which this step owns'), alpha.slice(0, 900)],
        ['a guard file has its own case file named for it, new where the folder has none', alpha.includes('its own case file `guard-cases/alpha.mjs`') && !alpha.includes('`guard-cases/alpha.mjs` (new)') && beta.includes('`guard-cases/beta.mjs` (new)'), `${alpha.slice(0, 300)} | ${beta.slice(0, 300)}`],
        ['no file step commits, stages or pushes', [alpha, beta].every((s) => s.includes('commits nothing and stages nothing') && !s.includes('git push origin main')), alpha.slice(0, 400)],
        ['one landing step follows the file steps and names their number, their guard files and one commit for each, and no step is titled as a commit step', t.split('Landed once').length === 2 && landing.startsWith('Landed once')
          && landing.includes('steps 2 to 3 left their edits uncommitted') && landing.includes('the files being `alpha.mjs`, `beta.mjs`') && landing.includes('one entry for each of steps 2 to 3 in that order')
          && landing.includes('makes one commit for each of steps 2 to 3 in that order and refuses, with nothing committed,'), landing.slice(0, 700)],
        ['the landing step writes an index row for each lesson in the shape the index\'s rows hold', landing.includes('one index row for it in `LESSONS.md` in the shape the index\'s rows hold'), landing.slice(0, 200)],
        ['the Cost counts the steps and the pushes, and the forced turns are the file steps plus two', cost.includes('The 4 steps (2 file steps run at the same time') && cost.includes('2 pushes are made, one each by the take-up and the landing step') && cost.includes('4 forced turns of the stop hook'), cost],
        ['the Cost sums the estimates for the agent time', cost.includes('Agent time is the sum of the steps\' estimates, 85 min'), cost],
        ['the Cost takes the wall time as the take-up, the longest file step and the landing step', cost.includes('the longest file step and the landing step, 65 min.'), cost],
      ];
      const lines = [
        ['the file steps run at the same time in the one working copy', 'The file steps, 2 to 3, run at the same time in the one working copy'],
        ['a review for a resend goes only when no agent edits the working copy', 'A review for a resend of a file step is sent only when no agent is editing the working copy'],
        ['the landing step puts an existing case turned red right in the owning step\'s file', 'the landing step puts the code right in the owning step\'s file and keeps the finding\'s fix'],
        ['no run of the plan goes in the background', 'No run of this plan goes in the background'],
        ['a number from the device comes from the test page and never a container render', 'names the app\'s test page as its instrument and never a container render'],
        ['nothing is pushed except by the take-up step and the landing step', 'Nothing is pushed except by the take-up step and by the landing step, which is the close step in a plan for one item'],
      ];
      for (const [label, s] of lines) rows.push([`batch: ${label}`, t.includes(s), s]);
      for (const [label, s] of lines.slice(3)) rows.push([`single: ${label}`, single.includes(s), s]);
      // The landing is made by the landing command's verbs, so the rule on staging a landing's several commits is gone from both prints.
      for (const [mode, text] of [['batch', t], ['single', single]]) {
        rows.push([`${mode}: no rule on staging a landing's several commits`, !text.includes('stages nothing beforehand and names each commit\'s own files after the message') && !text.includes('nothing staged beforehand'), 'staging rule']);
      }
      rows.push(['single: the close step writes the index row too', single.includes('one index row for it in `LESSONS.md` in the shape the index\'s rows hold'), 'index row']);

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
        && w1.split('\n')[1].includes('leaves 1 of the 8 groups') && w1.split('\n')[1].includes('--wave 2') && !w1.includes('Put right in `f8.mjs`') && w1.includes('\nOrder: 1 2 3 4 5 6 7 8 9\n'), w1.split('\n').slice(0, 2).join(' | ')]);
      rows.push(['wave 2 prints the group wave 1 left', titles(w2).join(',') === 'f8' && w2.split('\n')[0].includes('in 1 group step,') && w2.split('\n')[1].includes('leaves 0 of the 8 groups'), w2.split('\n').slice(0, 2).join(' | ')]);
      rows.push(['two groups of one file never share a wave: a size of one leaves the second run of the file for the next wave', titles(sz).filter((x) => x === 'f1').length === 1 && titles(sz).length === 7 && sz.split('\n')[1].includes('leaves 2 of the 9 groups'), `${titles(sz)} ${sz.split('\n')[1]}`]);
      // Findings that name no file get no step, and a batch of nothing else prints no plan and names them.
      const nf = h.seedHub(dir);
      writeFileSync(join(nf, 'PROGRAM.md'), `${head}\n${[1, 2].map(entry).join('\n')}`);
      for (const n of [1, 2]) writeFileSync(join(nf, 'found', `Q-HUB-2${n}.md`), `Q-HUB-2${n}: a planted finding that names no file of the repository.\n`);
      const nfr = h.batchRun(dir, nf, []);
      rows.push(['findings naming no file get no step: a batch of nothing else prints no plan and names them', nfr.status === 1 && !nfr.stdout.includes('PLAN STARTS') && nfr.stdout.includes('is not placed (Q-HUB-21, Q-HUB-22)'), nfr.stdout]);
      return h.assertAll(rows);
    },
  },
  {
    name: 'step 145: the batch print gives no file to two steps: a case file a finding names is merged into the step that owns the guard, a file the plants of a step\'s case file target is that step\'s and a seam to the step that names it first, and no name is owned twice',
    guards: ['part_merge', 'part_case_claim', 'part_plant_owner', 'part_names_dedupe'],
    run(m, dir, h) {
      const hub = plantedHub(h, dir, {
        files: ['seed.mjs', 'fence.mjs', 'other.mjs'],
        caseFiles: {
          'seed.mjs': "// a planted case file of the case\nexport const plants = { p1: ['a', 'b', 'plans/seed-template.md'], };\n",
          'fence.mjs': "// a planted case file of the case\nexport const plants = { p2: ['a', 'b', 'fence.mjs'], };\n",
          'other.mjs': '// a planted case file of the case\n',
        },
        findings: [
          ['Q-HUB-21', 'a planted finding about `fence.mjs` and `plans/seed-template.md`.'],
          ['Q-HUB-22', 'a planted finding about `seed.mjs` and `plans/seed-template.md`.'],
          ['Q-HUB-23', 'a planted finding about `guard-cases/seed.mjs`.'],
          ['Q-HUB-24', 'a planted finding about `other.mjs`.'],
        ],
      });
      const t = `${h.batchRun(dir, hub, []).stdout}`;
      const step = (n) => (t.split(new RegExp(`\\n${n}\\. \\*\\*`))[1] ?? '').split(/\n\d+\. \*\*/)[0];
      const [fence, seed, other] = [2, 3, 4].map(step);
      const names = [2, 3, 4].flatMap((n) => ownedNames(step(n)));
      return h.assertAll([
        ['the finding that names the guard\'s case file is one step with the finding of the guard, the title naming both', seed.startsWith('Put right in `seed.mjs`, `guard-cases/seed.mjs`: Q-HUB-22, Q-HUB-23.') && other.startsWith('Put right in `other.mjs`: Q-HUB-24.'), seed.slice(0, 200)],
        ['the file the plants of the seed step\'s case file target is owned by that step', ownedNames(seed).includes('plans/seed-template.md') && !ownedNames(fence).includes('plans/seed-template.md'), `${ownedNames(seed)} | ${ownedNames(fence)}`],
        ['the step that names the template first holds it as a seam to the step whose file it is, in both steps', fence.includes('Q-HUB-21 names `plans/seed-template.md` too, which step 3 owns, so this step does not touch it')
          && seed.includes('step 2 takes up Q-HUB-21, whose text names `plans/seed-template.md`, which this step owns'), `${fence.slice(0, 700)} | ${seed.slice(0, 700)}`],
        ['no name is owned twice over the three steps, a case file named once as a case file', names.length === new Set(names).size && names.length === 7, names.join(', ')],
        ['the case file of the seed step is named as its own case file and not among the files by name', seed.includes('and its own case file `guard-cases/seed.mjs`') && ownedNames(seed).filter((x) => x === 'guard-cases/seed.mjs').length === 1, seed.slice(0, 400)],
      ]);
    },
  },
  {
    name: 'step 145: the batch print counts a folder a finding names as every file under it and a case file as a file its step owns, so a folder step and the steps whose case files sit in it are one step that names the folder once',
    guards: ['part_folder', 'part_folder_name'],
    run(m, dir, h) {
      const hub = plantedHub(h, dir, {
        files: ['fence.mjs', 'other.mjs'],
        caseFiles: { 'fence.mjs': '// a planted case file of the case\n', 'other.mjs': '// a planted case file of the case\n' },
        findings: [
          ['Q-HUB-21', 'a planted finding about `fence.mjs`.'],
          ['Q-HUB-22', 'a planted finding about the folder `guard-cases/`.'],
          ['Q-HUB-23', 'a planted finding about `other.mjs`.'],
        ],
      });
      const t = `${h.batchRun(dir, hub, []).stdout}`;
      const step = (n) => (t.split(new RegExp(`\\n${n}\\. \\*\\*`))[1] ?? '').split(/\n\d+\. \*\*/)[0];
      const one = step(2);
      return h.assertAll([
        ['the three findings are one file step', t.split('\n')[0].includes('in 1 group step,') && t.includes('\nOrder: 1 2 3\n'), t.split('\n')[0]],
        ['the step\'s title names the three homes', one.startsWith('Put right in `fence.mjs`, `guard-cases/`, `other.mjs`: Q-HUB-21, Q-HUB-22, Q-HUB-23.'), one.slice(0, 200)],
        ['the step owns the folder by its name and each file once, and names no case file beside the folder', ownedNames(one).slice().sort().join(',') === 'fence.mjs,guard-cases/,other.mjs' && !one.includes('its own case file'), `${ownedNames(one)} | ${one.slice(0, 300)}`],
      ]);
    },
  },
  {
    name: 'step 145: the commit step of the batch print runs the plants of every file a plant of the wave\'s case files targets that a finding of the wave names, the seed\'s template among them, and not a target no finding names',
    guards: ['batch_plant_targets', 'batch_plant_named'],
    run(m, dir, h) {
      const hub = plantedHub(h, dir, {
        files: ['seed.mjs', 'other.mjs'],
        caseFiles: {
          'seed.mjs': "// a planted case file of the case\nexport const plants = { p1: ['a', 'b', 'plans/seed-template.md'], p2: ['a', 'b', 'unnamed.md'], };\n",
          'other.mjs': '// a planted case file of the case\n',
        },
        findings: [
          ['Q-HUB-21', 'a planted finding about `seed.mjs` and `plans/seed-template.md`.'],
          ['Q-HUB-22', 'a planted finding about `other.mjs`.'],
        ],
      });
      writeFileSync(join(hub, 'unnamed.md'), 'a planted file no finding names\n');
      const t = `${h.batchRun(dir, hub, []).stdout}`;
      const commit = /\n\d+\. \*\*Landed once[^\n]*/.exec(t)?.[0] ?? '';
      const list = /the files being ([^;]*);/.exec(commit)?.[1] ?? '';
      return h.assertAll([
        ['the files being are the guard files and the template its plants target', list === '`seed.mjs`, `other.mjs`, `plans/seed-template.md`', list],
        ['a plant target no finding names is not run here', !list.includes('unnamed.md'), list],
      ]);
    },
  },
  {
    name: 'step 145: the landing step carries the four orders of a send: a red case or a missed plant is put right at the start of the next send, a check\'s find in a file a file step wrote is put right in that file at the start of the next send, a landing step that edits a gate file runs the whole suite after its last edit and before its first commit, and the stale-plant list comes from the suite\'s own report',
    guards: ['tpl_commit_next_send', 'tpl_commit_find_file', 'tpl_commit_suite_first', 'tpl_commit_stale_report'],
    run(m, dir, h) {
      const t = `${h.batchRun(dir, h.batchHub(dir), []).stdout}`;
      const commit = /\n\d+\. \*\*Landed once[^\n]*/.exec(t)?.[0] ?? '';
      const has = (label, s) => [label, commit.includes(s), s];
      return h.assertAll([
        has('a red case or a missed plant is put right at the start of the next send', 'a red case or a missed plant is put right at the start of the next send and never after a run in the same send'),
        has('a check\'s find in a file a file step wrote is put right in that file at the start of the next send', "a check's find in a file a file step wrote is put right in that file at the start of the next send"),
        has('a landing step that edits a gate file runs the whole suite before its first commit', 'a landing step that edits a gate file runs the whole suite after its last edit and before its first commit'),
        has('the stale-plant list comes from the suite\'s own report', "the stale-plant list comes from the suite's own report before a run"),
      ]);
    },
  },
  {
    name: 'step 159 of the plan of 9 November: a file step points at the six parts of the order the rules give it and names a line it needs in another step\'s file in its report without writing it, and the parallel rules give the order, each case in a run of its own with one case switch to a run, and the same line for another step\'s file',
    guards: ['batch_six_parts', 'batch_other_line', 'tpl_six_order', 'tpl_own_runs', 'tpl_other_line', 'batch_group_kill', 'tpl_case_quote', 'tpl_parallel_repair'],
    run(m, dir, h) {
      const t = `${h.batchRun(dir, h.batchHub(dir), []).stdout}`;
      const group = (/\n2\. \*\*Put right in[^\n]*/.exec(t)?.[0]) ?? '';
      const rules = (/\n- The file steps, [^\n]*/.exec(t)?.[0]) ?? '';
      const other = 'a line a fix needs in a file another step of this plan owns is named in the report with the file, the place and the exact words, for the landing step, and is not written by this step';
      return h.assertAll([
        ['the group step points at the six parts of the order the rules of the plan give a file step', group.includes('then the six parts of the order the rules of this plan give a file step'), group.slice(0, 200)],
        ['the group step names a line it needs in another step\'s file in the report and does not write it', group.includes(other), group.slice(-900)],
        ['the group step\'s Kill ends a second red run of a case of its own FAILED, and leaves the first to the repair the rules give', group.includes('Kill: a second red run of a case of its own, or a cause the rules of this plan do not let the step repair, ends it FAILED with its lines and nothing written after but the report and its progress note'), group.slice(-900)],
        ['the parallel rules give the six parts in their order, from the edits to the dry listing', rules.includes('It works in this order and no other. First, every edit its findings ask for') && rules.includes('Sixth, the suite\'s dry listing'), rules.slice(0, 600)],
        ['the parallel rules run each case in a run of its own with one case switch to a run', rules.includes('Fourth, its own cases, each in a run of its own with one case switch to a run'), rules.slice(0, 900)],
        ['the parallel rules spell the case switch whole inside double quotes', rules.includes('with one case switch to a run, the switch written whole inside double quotes, as "--case=<the case\'s name>". Fifth,'), rules.slice(0, 1200)],
        ['the parallel rules meet a red run of a case of its own with the repair once and not with the fence', rules.includes('A red run of a case of its own is met as the rule on a red check gives: the step repairs it once, in a file it wrote in this send, and a second red run ends the send FAILED with the report naming the fix.') && !rules.includes('the fence refuses every write after it'), rules.slice(-500)],
        ['the rules of the plan name a line in another step\'s file in the report for the landing step', t.includes('A line a fix needs in a file another step owns is named in the report with the file, the place and the exact words, for the landing step, and is not written by the step'), 'rule'],
      ]);
    },
  },
  {
    name: 'step 159 of the plan of 9 November: the batch print\'s take-up only claims, it adds no entry, runs no check, carries no pull and leaves the live clone as it is, finds each entry by its finding key and names the key each carries where it is not the printed one, and says the plan\'s title is written with no phrase the third-person check refuses; the item print\'s take-up carries no pull and says the same of the key and the title',
    guards: ['tpl_takeup_claim', 'tpl_takeup_no_pull', 'tpl_takeup_key_batch', 'tpl_takeup_key_single', 'tpl_takeup_title_batch', 'tpl_takeup_title_single', 'batch_findkeys'],
    run(m, dir, h) {
      const batch = `${h.batchRun(dir, h.batchHub(dir), []).stdout}`;
      const single = `${h.seedRun(dir, h.seedHub(dir), ['--item', 'P-3']).stdout}`;
      const up = (t) => (t.split('\n1. **Taken up')[1] ?? '').split(/\n2\. \*\*/)[0];
      const b = up(batch);
      const s = up(single);
      const keys = /found by their finding keys, (Q-HUB-\d+(?:, Q-HUB-\d+)*)/.exec(b)?.[1] ?? '';
      const left = "the live clone is left as it is, because the plan's last step brings it forward when no other step is running";
      return h.assertAll([
        ['batch: the take-up only claims, adds no entry, runs no check and leaves the live clone as it is', b.includes('it adds no entry, touches no count line, runs no check and leaves the live clone as it is'), b.slice(0, 900)],
        ['batch: the take-up carries no pull of the live clone and no read of its head', !b.includes('pull origin main') && !b.includes('rev-parse HEAD') && b.includes(left), b.slice(-900)],
        ['batch: the take-up names in its report the key each entry carries wherever it is not the printed one', b.includes('so the step names in its report the key each entry carries wherever it is not the printed one'), b.slice(0, 900)],
        ['batch: the take-up finds the entries by the four finding keys', keys.split(', ').sort().join(',') === 'Q-HUB-11,Q-HUB-13,Q-HUB-14,Q-HUB-15', keys],
        ['batch: the take-up says the plan\'s title is written with no phrase the third-person check refuses', b.includes('the plan\'s title is copied whole into each entry, so the title is written with no phrase the third-person check refuses'), b.slice(0, 900)],
        ['single: the take-up carries no pull of the live clone and no read of its head', !s.includes('pull origin main') && !s.includes('rev-parse HEAD') && s.includes(left), s.slice(-900)],
        ['single: the take-up names in its report the key the entry carries wherever it is not the printed one', s.includes('so the step reads the key the entry carries and names it in its report wherever it is not the printed one'), s.slice(0, 900)],
        ['single: the take-up says the plan\'s title is written with no phrase the third-person check refuses', s.includes('the plan\'s title is copied whole into the entry, so the title is written with no phrase the third-person check refuses'), s.slice(0, 900)],
      ]);
    },
  },
  {
    name: 'step 159 of the plan of 9 November: the landing step of the batch print and the close step of the item print carry the marker-and-pin sentence, the pull of the live clone as the last act after the push, and the item\'s key read from the program; the landing step runs the plants of every file the steps edited, a long file\'s new plants by key, and the checks before the first commit and again over the close',
    guards: ['tpl_marker_pin', 'tpl_pull_last', 'tpl_close_pull_last', 'tpl_land_pull_last', 'tpl_key_from_program', 'tpl_land_key_program', 'tpl_land_plants_all', 'tpl_land_long_files', 'tpl_land_checks_twice', 'tpl_land_close_commit'],
    run(m, dir, h) {
      const batch = `${h.batchRun(dir, h.batchHub(dir), []).stdout}`;
      const single = `${h.seedRun(dir, h.seedHub(dir), ['--item', 'P-3']).stdout}`;
      const landing = /\n\d+\. \*\*Landed once[^\n]*/.exec(batch)?.[0] ?? '';
      const close = /\n\d+\. \*\*Closed in the program[^\n]*/.exec(single)?.[0] ?? '';
      const marker = "an app's doctrine marker and the calling workflow's hub pin move together or not at all";
      const pulled = (s) => s.indexOf("the landing command's verb push") > 0 && s.includes('after its clone switch, which fetches main from the remote') && s.includes('reads the remote\'s heads and pulls the live clone')
        && s.indexOf("the pull being the last act that changes anything because it changes the gates under every agent") > s.indexOf("the landing command's verb push");
      return h.assertAll([
        ['batch: the landing step says the marker and the pin move together or not at all', landing.includes(marker), landing.slice(-500)],
        ['single: the close step says the marker and the pin move together or not at all', close.includes(marker), close.slice(-500)],
        ['batch: the landing step pushes once and then pulls the live clone as the last act', pulled(landing), landing.slice(-700)],
        ['single: the close step pushes and then pulls the live clone as the last act', pulled(close), close.slice(-700)],
        ['batch: the landing step says the pull is its last act, when no other step is running', landing.includes("the pull of the live clone is this step's last act, when no other step is running, because it changes the gates under every agent; the remote's main moves under this session. Do: read the reports"), landing.slice(0, 900)],
        ['single: the close step says the pull is its last act, when no other step is running', close.includes("the pull of the live clone is this step's last act, when no other step is running, because it changes the gates under every agent; the remote's main moves under this session, so it is fetched"), close.slice(0, 900)],
        ['batch: the landing step reads each item\'s key from the program and not from the plan\'s text', landing.includes("each item's key is read from the program and not from this plan's text"), landing.slice(0, 1500)],
        ['single: the close step reads the item\'s key from the program at the time of use', close.includes("the item's key is read from the program at the time of use and not from this plan's text"), close.slice(0, 1500)],
        ['batch: the landing step runs the plants of every file the steps edited, the suite file and each doctrine page among them', landing.includes('the plants of every file the steps edited are run here, the suite file and each doctrine page among them'), landing.slice(0, 1500)],
        ['batch: the landing step writes the keys of the new plants into the manifest, those of a long file among them, for the verb prove to run by key', landing.includes('the keys of its new plants, those of a long file among them'), landing.slice(0, 2500)],
        ['batch: the landing step runs the verb prove on the manifest, then the checks alone over the close', landing.includes('run the landing command\'s verb prove on the manifest once, which makes the dry listing and the plants run for each file the reports name as changed, the whole suite and the seven checks')
          && landing.includes('run the landing command\'s verb prove for the checks alone, once, its last line read'), landing.slice(0, 2500)],
        ['batch: the landing step commits the close entry by its label', landing.includes('a reader-facing one-line message saying the wave is closed and the close\'s files, and run the landing command\'s verb commit with the close entry\'s label'), landing.slice(-900)],
      ]);
    },
  },
  {
    name: 'step 159 of the plan of 9 November: the rules of the plan carry no background run, the rule for a string a case writes, the rule for a conflict in the program alone, the rule for the long files and the continue command, in the item print and in the batch print',
    guards: ['tpl_rule_case_string', 'tpl_rule_conflict', 'tpl_rule_long_files', 'tpl_cmd_continue', 'tpl_rule_foreground', 'tpl_repair_four_parts', 'tpl_repair_landing', 'tpl_rule_case_quote', 'tpl_cmd_land', 'tpl_cmd_program', 'tpl_rule_commands'],
    run(m, dir, h) {
      const rows = [];
      const singleHub = h.seedHub(dir);
      const batchHub = h.batchHub(dir);
      for (const [mode, r, hub] of [['single', h.seedRun(dir, singleHub, ['--item', 'P-3']), singleHub], ['batch', h.batchRun(dir, batchHub, []), batchHub]]) {
        const t = `${r.stdout}`;
        const has = (label, s) => rows.push([`${mode}: ${label}`, t.includes(s), s]);
        has('every run of the suite and of a check is made in the foreground', "Every run of the suite and of a check is made in the foreground with the Bash tool's timeout set to ten minutes, and a run that ends on that timeout ends the step EJECT naming it");
        rows.push([`${mode}: no paragraph sends a run to the background and no note is written around one`, !t.includes('A run that may pass ten minutes goes in the background') && !t.includes('then the note written again with the full path the launch printed'), 'background']);
        has('a string a case writes holds no word the third-person check reads as a pronoun', 'A string a case writes holds no word the third-person check reads as a pronoun, whole or as the first part of a word split across a template.');
        has('a conflict in the program alone is resolved so both sessions\' items stand', "Where the last rebase of the landing step stops on a conflict in `PROGRAM.md` alone, the step resolves it with the Edit tool so both sessions' items stand");
        has('a conflict in any other file ends the rebase', 'a conflict in any other file, or in any other rebase of this plan, ends the rebase with `git rebase --abort` and the step ejects with nothing pushed');
        rows.push([`${mode}: the sentence on which plants a landing runs narrowed is gone, since the verb prove runs them`, !t.includes("of a long file only the new plants run, by key, and its other plants are proved by the runner's doctrine gates run after the push"), 'long files']);
        has('the continue command is among the Commands', '- `git rebase --continue`\n- `git push origin main`');
        // The repair (Q-HUB-473): a red check is met once by the agent that wrote the file, and no sentence says any longer that nothing is written after a red check or that the fence refuses every write after it.
        has('the rule on the four parts of a step gives the repair of a red check', "A red check is met as the agent rules give: where its cause is read from the run's own output and lies in a file the agent has itself written in this send, the agent writes into its report what was red and its cause, makes the edit in that file, and makes the red run once more; a second red check, a cause that cannot be read from the output, or a cause in a file the agent has not written in this send ends the step FAILED, with nothing written after but its report and its progress note. No repair removes or loosens an assertion.");
        has('the rule on the landing step meets a red run with the repair', "is met as the rule on a red check gives, a cause in a file another step wrote ending the send FAILED with its report, which names each case, plant or check line to put right and the file each sits in, so the next send puts them right first.");
        rows.push([`${mode}: no sentence withholds the repair or leans on the fence after a red run`, !t.includes('hands back FAILED naming it, and writes nothing after') && !t.includes('the fence refuses an agent\'s write after its own red run') && !t.includes('because the fence refuses every write after it'), 'old words']);
        has('a case switch whose name holds a space is written whole inside double quotes', "- A case switch whose name holds a space is written whole inside double quotes, as \"--case=<the case's name>\", because the suite refuses a name cut at a space.");
        has('the landing, the claim, the filing and the close are each made by a verb of the two commands', "- The landing, the claim, the filing and the close are each made by a command of the Commands: the landing command's verbs prove, commit and push, and the program command's verbs claim, file, done, measure and lesson");
        has('the landing command is among the Commands', `- \`node ${hub}/plan-land.mjs\`\n- \`node ${hub}/program.mjs\`\n`);
      }
      return h.assertAll(rows);
    },
  },
  {
    name: 'step 159 of the plan of 9 November: the batch print gives the plants of the suite file and of a doctrine page the wave\'s steps edit to the landing step, and not a target no finding names (Q-HUB-396)',
    guards: ['batch_suite_targets'],
    run(m, dir, h) {
      const hub = plantedHub(h, dir, {
        files: ['seed.mjs'],
        caseFiles: { 'seed.mjs': '// a planted case file of the case\n' },
        findings: [['Q-HUB-21', 'a planted finding about `seed.mjs`, `session-guards.test.mjs` and `doctrine/plans.md`.']],
      });
      mkdirSync(join(hub, 'doctrine'), { recursive: true });
      writeFileSync(join(hub, 'doctrine', 'plans.md'), 'a planted page of the case\n');
      writeFileSync(join(hub, 'unnamed.md'), 'a planted file no finding names\n');
      writeFileSync(join(hub, 'session-guards.test.mjs'), "// a planted suite file of the case\nconst PLANTS = {\n  p1: ['a', 'b', 'session-guards.test.mjs'],\n  p2: ['a', 'b', 'doctrine/plans.md'],\n  p3: ['a', 'b', 'unnamed.md'],\n};\n");
      const t = `${h.batchRun(dir, hub, []).stdout}`;
      const landing = /\n\d+\. \*\*Landed once[^\n]*/.exec(t)?.[0] ?? '';
      const list = /the files being ([^;]*);/.exec(landing)?.[1] ?? '';
      return h.assertAll([
        ['the files being are the guard file, the suite file and the doctrine page, each a plant targets and a finding names', list === '`seed.mjs`, `session-guards.test.mjs`, `doctrine/plans.md`', list],
        ['a target of the suite file\'s plants that no finding names is not run here', !list.includes('unnamed.md'), list],
      ]);
    },
  },
  {
    name: 'step 159 of the plan of 9 November: a finding whose fix counts a list owns every file it names, so the step that takes it and the step of the list\'s other place are one step (Q-HUB-397)',
    guards: ['batch_counts_list'],
    run(m, dir, h) {
      const hub = plantedHub(h, dir, {
        files: ['hook.mjs', 'plans.md'],
        caseFiles: { 'hook.mjs': '// a planted case file of the case\n' },
        findings: [
          ['Q-HUB-21', 'a planted finding whose fix counts a list in `hook.mjs` and in `plans.md`.'],
          ['Q-HUB-22', 'a planted finding about `plans.md`.'],
        ],
      });
      const t = `${h.batchRun(dir, hub, []).stdout}`;
      const step = (n) => (t.split(new RegExp(`\\n${n}\\. \\*\\*`))[1] ?? '').split(/\n\d+\. \*\*/)[0];
      const one = step(2);
      return h.assertAll([
        ['the two findings are one file step', t.split('\n')[0].includes('in 1 group step,') && t.includes('\nOrder: 1 2 3\n'), t.split('\n')[0]],
        ['the step\'s title names both places of the list and both findings', one.startsWith('Put right in `hook.mjs`, `plans.md`: Q-HUB-21, Q-HUB-22.'), one.slice(0, 200)],
        ['the step owns both places and the guard\'s case file', ownedNames(one).slice().sort().join(',') === 'guard-cases/hook.mjs,hook.mjs,plans.md', `${ownedNames(one)}`],
      ]);
    },
  },
  {
    name: 'step 159 of the plan of 9 November: a case file a finding names goes to the step that owns its guard file and to no other step, and the step left with nothing owns no file by name (Q-HUB-397)',
    guards: ['batch_case_guard_only'],
    run(m, dir, h) {
      const hub = plantedHub(h, dir, {
        files: ['a.mjs', 'b.mjs'],
        caseFiles: { 'a.mjs': '// a planted case file of the case\n', 'b.mjs': '// a planted case file of the case\n' },
        findings: [
          ['Q-HUB-21', 'a planted finding about `a.mjs` and `b.mjs`.'],
          ['Q-HUB-22', 'a planted finding about `guard-cases/b.mjs`.'],
        ],
      });
      const t = `${h.batchRun(dir, hub, []).stdout}`;
      const step = (n) => (t.split(new RegExp(`\\n${n}\\. \\*\\*`))[1] ?? '').split(/\n\d+\. \*\*/)[0];
      const [first, second] = [step(2), step(3)];
      const listed = [...ownedNames(first), ...ownedNames(second)].filter((x) => x === 'guard-cases/b.mjs');
      return h.assertAll([
        ['the case file of b.mjs is named by the step that owns b.mjs', ownedNames(first).includes('guard-cases/b.mjs') && ownedNames(first).includes('b.mjs'), `${ownedNames(first)}`],
        ['the case file of b.mjs is named by no other step', listed.length === 1 && ownedNames(second).length === 0, `${listed} | ${ownedNames(second)} | ${second.slice(0, 300)}`],
      ]);
    },
  },
  {
    name: 'step 166 of the plan of 10 November (Q-HUB-407): the sentences of the item print and of the batch print that name the step that closes name it by its number and its own title, the close step in the print for one item and the landing step in the batch print, and the Cost of the print for one item names its two pushing steps by number',
    guards: ['seed_closer_passed', 'batch_closer_passed', 'seed_closer_keys', 'batch_closer_keys', 'seed_cost_closer'],
    run(m, dir, h) {
      const single = h.seedRun(dir, h.seedHub(dir), ['--item', 'P-3', '--steps', '1']);
      const batch = h.batchRun(dir, h.batchHub(dir), []);
      const body = (r) => `${r.stdout}${r.stderr}`.split('==== THE PLAN STARTS BELOW THIS LINE ====')[1] ?? '';
      const section = (b, name) => new RegExp(`\\n## ${name}\\n\\n([\\s\\S]*?)(?=\\n## |\\n==== THE PLAN ENDS)`).exec(b)?.[1] ?? '';
      const [s, b] = [body(single), body(batch)];
      return h.assertAll([
        ['single: the Findings passed in line names step 3 as the close step', section(s, 'Findings passed in').includes('which step 3, the close step, files in the found folder'), section(s, 'Findings passed in')],
        ['batch: the Findings passed in line names step 4 as the landing step and no close step', section(b, 'Findings passed in').includes('which step 4, the landing step, files in the found folder') && !section(b, 'Findings passed in').includes('close step'), section(b, 'Findings passed in')],
        ['single: the Verification line names step 3 as the close step', section(s, 'Verification').includes('The report of step 3, the close step, names each key it filed beside the line it came from'), section(s, 'Verification')],
        ['batch: the Verification line names step 4 as the landing step and no close step', section(b, 'Verification').includes('The report of step 4, the landing step, names each key it filed beside the line it came from') && !section(b, 'Verification').includes('close step'), section(b, 'Verification')],
        ['single: the Cost names the take-up step and the close step by number', section(s, 'Cost').includes("one by step 1, the take-up step, and one by step 3, the close step, each rebased onto the remote's head"), section(s, 'Cost')],
        ['batch: no step of the print is titled as the close', !/\n\d+\. \*\*Closed in the program/.test(b), b.slice(0, 200)],
      ]);
    },
  },
  {
    name: 'step 166 of the plan of 10 November (Q-HUB-404): the item switch with the word new prints the entry form under the next free program key and a take-up step that adds the entry, and a key that is not in the program is still refused',
    guards: ['seed_new_word', 'seed_new_takeup', 'seed_new_form', 'tpl_takeup_new'],
    run(m, dir, h) {
      const hub = h.seedHub(dir);
      const r = h.seedRun(dir, hub, ['--item', 'new']);
      const t = `${r.stdout}${r.stderr}`;
      const b = t.split('==== THE PLAN STARTS BELOW THIS LINE ====')[1] ?? '';
      const section = (name) => new RegExp(`\\n## ${name}\\n\\n([\\s\\S]*?)(?=\\n## |\\n==== THE PLAN ENDS)`).exec(b)?.[1] ?? '';
      const entry = section('Item entry');
      const step1 = (b.split(/\n1\. \*\*/)[1] ?? '').split(/\n\d+\. \*\*/)[0];
      const known = (h.seedRun(dir, hub, ['--item', 'P-3']).stdout.split(/\n1\. \*\*/)[1] ?? '').split(/\n\d+\. \*\*/)[0];
      const bad = h.seedRun(dir, hub, ['--item', 'P-99']);
      return h.assertAll([
        ['the print is made, with the next free key and the title of work with no entry', r.status === 0 && t.startsWith('PLAN SEED for P-4 (new work with no entry), repository'), t.slice(0, 200)],
        ['the Item entry section says no entry holds the work and gives the form under the next free key', entry.includes('No entry in PROGRAM.md holds this work') && entry.includes("    ### P-4. <the work's title>")
          && entry.includes("State: planned. Plan: <this plan's title>.") && entry.includes('Depends: <the program keys it depends on, or none>.'), entry],
        ['the first step adds the entry under the printed key and raises the items count line', step1.startsWith('Taken up: P-4 entered in the program as planned') && step1.includes('the next free program key when this plan was typed is P-4, so the entry is added under it')
          && step1.includes('the items count line is raised by one'), step1.slice(0, 600)],
        ['the print for an item the program holds still takes that entry up and sets it to planned', known.startsWith('Taken up: P-3 set to planned'), known.slice(0, 200)],
        ['a key that is not in the program is still refused', bad.status === 1 && bad.stdout.includes('the key P-99 is not in PROGRAM.md'), bad.stdout],
      ]);
    },
  },
  {
    name: 'step 166 of the plan of 10 November (Q-HUB-404, the rounds): the batch print with --rounds prints that many waves as rounds of one plan, with one take-up that claims every round\'s items, its own file steps and landing step for each round, numbers that run on through the rounds, each later round after the landing step before it, only the last landing step pulling the live clone, the Cost counting each round, and the one-round print as it was; a value outside one to five or more rounds than waves remain prints no plan; the print of two rounds passes the plan check',
    guards: ['rounds_refuse', 'rounds_waves', 'rounds_loop', 'rounds_after', 'rounds_last_pull', 'rounds_cost', 'rounds_takeup_all', 'rounds_served', 'rounds_order', 'rounds_parallel', 'rounds_note', 'rounds_lines', 'rounds_stepof', 'rounds_review', 'tpl_landing_round_live', 'tpl_landing_round_title'],
    run(m, dir, h) {
      const hub = h.batchHub(dir);
      const r2 = h.batchRun(dir, hub, ['--size', '2', '--rounds', '2']);
      const t = `${r2.stdout}${r2.stderr}`;
      const step = (n) => (t.split(new RegExp(`\\n${n}\\. \\*\\*`))[1] ?? '').split(/\n\d+\. \*\*/)[0];
      const [takeup, alpha1, beta, land1, alpha2, land2] = [1, 2, 3, 4, 5, 6].map(step);
      const plan = (args) => { const x = h.batchRun(dir, hub, args).stdout; return (x.split('==== THE PLAN STARTS BELOW THIS LINE ====')[1] ?? x).split('==== THE PLAN ENDS ABOVE THIS LINE ====')[0]; };
      const base = plan(['--size', '2']);
      const one = plan(['--size', '2', '--rounds', '1']);
      const refused = (args) => h.batchRun(dir, hub, args);
      const bad = ['0', '6', 'x', '2.5'].map((v) => [v, refused(['--size', '2', '--rounds', v])]);
      const few = refused(['--size', '2', '--rounds', '3']);
      const late = refused(['--size', '2', '--wave', '2', '--rounds', '2']);
      const cost = (t.split('\n## Cost\n\n')[1] ?? '').split('\n')[0];
      const served = t.split('\n').find((l) => l.startsWith('Served by:')) ?? '';
      const fa = (t.split('\n## Found answered\n')[1] ?? '').split('\n## ')[0];
      // The print of two rounds, its placeholders filled as the batch print's own case fills them, is put to the plan check from a planted hub.
      const body = t.split('==== THE PLAN STARTS BELOW THIS LINE ====\n')[1]?.split('==== THE PLAN ENDS ABOVE THIS LINE ====')[0] ?? '';
      const filled = body.split('\n').map((l) => {
        if (!/<[^>]+>/.test(l)) return l;
        if (l.startsWith('# ')) return '# The batch of five planted findings in two rounds';
        if (l.startsWith('- <Each bullet quotes')) return '- The line "// a planted file of the case" is in `alpha.mjs`, which is what the plan rests on.';
        if (l.startsWith('- ')) return l.replace(/<[^>]+>/, 'A planted line of the case that is longer than twenty characters.');
        return l.replace(/<[^>]+>/g, 'A planted sentence of the case that is longer than twenty characters, in its own words.');
      }).join('\n');
      const planFile = join(h.tmp('sg-rounds-check-'), 'rounds-check.md');
      writeFileSync(planFile, filled);
      for (const f of h.FILES) if (!existsSync(join(hub, f))) h.copyGuard(join(dir, f), join(hub, f));
      for (const d of ['progress', 'scratch', 'recall']) mkdirSync(join(hub, d), { recursive: true });
      for (const f of ['NOTES.md', 'LESSONS.md']) writeFileSync(join(hub, f), '# planted\n');
      const names = h.repo({ 'names.txt': 'node --format --pretty Next:\n' });
      const checked = spawnSync('node', [join(hub, 'plan-guard.mjs'), '--check', planFile], { encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: names.dir } });
      return h.assertAll([
        ['one take-up claims the items of both rounds and not the item of the finding that names no file', t.split('Taken up: ').length === 2 && ['P-1', 'P-3', 'P-4', 'P-5'].every((i) => takeup.split(' set to planned')[0].includes(i)) && !takeup.split(' set to planned')[0].includes('P-2') && takeup.includes('Q-HUB-15'), takeup.slice(0, 500)],
        ['the Order runs the second round after the landing step of the first, and the Standing step follows both', t.includes('\nOrder: 1 2 3 4 5 6\n') && t.includes('\nStanding: 7\n')
          && t.includes('\nAfter: 2 after 1; 3 after 1; 4 after 2 3; 5 after 4; 6 after 5\n'), t.slice(t.indexOf('## Order'), t.indexOf('## Order') + 300)],
        ['the Served by line names the file steps and the landing step of each round', served.includes('steps 2 to 3 serve goal 1; step 4 serves goals 1, 5 and 6; step 5 serves goal 1; step 6 serves goals 1, 5 and 6; step 7 serves goals 3, 5 and 6.'), served],
        ['each round holds its own file steps and landing step, the numbers running on', alpha1.startsWith('Put right in `alpha.mjs`: Q-HUB-11, Q-HUB-13.') && beta.startsWith('Put right in `beta.mjs`: Q-HUB-14.')
          && alpha2.startsWith('Put right in `alpha.mjs`: Q-HUB-15.') && land1.startsWith('Landed once for its round') && land2.startsWith('Landed once: every edit'), `${alpha1.slice(0, 60)} | ${alpha2.slice(0, 60)} | ${land1.slice(0, 60)} | ${land2.slice(0, 60)}`],
        ['each step names the steps of its own round', alpha1.includes('run at the same time as step 3') && alpha1.includes("The landing step, step 4, lands this step's edits") && alpha2.includes("The landing step, step 6, lands this step's edits")
          && !alpha2.includes('run at the same time as') && land1.includes('steps 2 to 3 left their edits uncommitted') && land2.includes('steps 5 to 5 left their edits uncommitted'), alpha2.slice(0, 300)],
        ['only the last landing step pulls the live clone, and the earlier one says it is left as it is', [takeup, alpha1, beta, land1, alpha2].every((s) => !s.includes('pull origin main') && !s.includes('after its clone switch')) && land2.includes('the live clone\'s path, `/root/.claude/hub`, after its clone switch')
          && land1.includes("the live clone is left as it is, because the plan's last landing step brings it forward when no other step is running"), land1.slice(-500)],
        ['the Found answered section names the step of each round and marks the finding that names no file as no fix of this plan', ['Q-HUB-11 fixed in step 2:', 'Q-HUB-14 fixed in step 3:', 'Q-HUB-15 fixed in step 5:'].every((x) => fa.includes(`- ${x}`)) && !fa.includes('Q-HUB-12 fixed'), fa],
        ['the Cost counts each round and one push for the take-up and one for each round', cost.includes('The 6 steps (3 file steps, run at the same time within their 2 rounds, with the take-up and the 2 landing steps)')
          && cost.includes('round 1 sends its 2 file steps at once and then its landing step, step 4; round 2 sends its 1 file step at once and then its landing step, step 6')
          && cost.includes('3 pushes are made, one by the take-up and one by the landing step of each round') && cost.includes('6 forced turns of the stop hook'), cost],
        ['the rule on the file steps is printed once and names the file steps of each round', t.split('- The file steps, ').length === 2
          && t.includes('- The file steps, 2 to 3 and 5 to 5, run at the same time in the one working copy, the steps of each round together and each round after the landing step of the round before. Each writes'), t.slice(0, 300)],
        ['the Sends priced line counts the six steps, the review and two for each of the two rounds', /\n- Sends priced: 11\. The plan is 6 steps and one review at its first send, and 4 more sends, two for each round, allow a failed step a review and a second send; past 11 sends it stops/.test(t), t.slice(0, 300)],
        ['the header names the rounds and the groups of both', t.split('\n')[0].includes('in 3 group steps') && t.split('\n')[1].includes('This is 2 rounds of one plan, waves 1 to 2 of 2') && t.split('\n')[1].includes('leaves 0 of the 3 groups'), t.split('\n').slice(0, 2).join(' | ')],
        ['with the rounds switch absent or one the print is the print of one wave', one === base && base.includes('\nOrder: 1 2 3 4\n') && !base.includes('Landed once for its round'), base.slice(0, 200)],
        ...bad.map(([v, x]) => [`a rounds value of ${v} prints no plan`, x.status === 1 && x.stdout.includes('--rounds takes a whole number from one to five') && !x.stdout.includes('PLAN STARTS'), x.stdout]),
        ['more rounds than waves print no plan', few.status === 1 && few.stdout.includes('3 rounds are asked for and 2 waves remain from wave 1') && !few.stdout.includes('PLAN STARTS'), few.stdout],
        ['rounds from a later wave print no plan when too few waves remain', late.status === 1 && late.stdout.includes('2 rounds are asked for and 1 wave remains from wave 2'), late.stdout],
        ['the print of two rounds with its placeholders filled passes the plan check', checked.status === 0, `check status ${checked.status}: ${String(checked.stdout).split('\n').filter((l) => /^\d+\. [A-Z]/.test(l)).map((l) => l.slice(0, 260)).join(' // ')}`],
      ]);
    },
  },
  {
    name: 'Q-HUB-434 (the seed\'s half): the seed\'s usage text names every switch the seed reads, the item switch with its three values and the rounds switch with its values among them',
    guards: ['seed_usage_rounds', 'seed_usage_item'],
    run(m, dir, h) {
      const r = spawnSync('node', [join(dir, 'plan-seed.mjs')], { encoding: 'utf8', timeout: 60000, env: { ...process.env, CLAUDE_CODE_SESSION_ID: '' } });
      const u = `${r.stdout}${r.stderr}`;
      const code = readFileSync(join(dir, 'plan-seed.mjs'), 'utf8');
      const read = [...new Set([...code.matchAll(/\bval\('(--[a-z]+)'\)/g)].map((x) => x[1]))];
      const missing = read.filter((s) => !u.includes(s));
      return h.assertAll([
        ['no switch prints the usage and exits 1', r.status === 1 && u.startsWith('usage: node plan-seed.mjs'), u],
        ['the usage names the item switch with its three values', u.includes('--item <P-key | next | new>'), u],
        ['the usage names the rounds switch with its values', u.includes('[--rounds <1 to 5>]'), u],
        ['the usage names each other switch of the batch print', ['--size <n>', '--steps <n>', '--wave <n>', '--repo <full path>', '--plan <path>', '--hub <full path>', '--out <path>'].every((s) => u.includes(`[${s}]`)), u],
        ['every switch the seed reads is named in the usage', read.length >= 8 && missing.length === 0, `read ${read.join(' ')}; missing ${missing.join(' ')}`],
      ]);
    },
  },
  {
    name: 'the four lines of a finding\'s file: the batch print reads the last line that opens with Put right already, Fix in, Not the repository\'s or Not placed, takes the files a Fix in line names first, leaves a finding with the first or the third out of every batch and names it in the header, gives a finding with the fourth or with no file no step and lists its key after the plan\'s end, and prints no plan when nothing else is left',
    guards: ['seed_line_last', 'seed_fixin_files', 'seed_left_out', 'seed_left_header', 'seed_unplaced', 'batch_no_file_own', 'seed_not_placed_list', 'seed_all_left_refused'],
    run(m, dir, h) {
      const keys = ['Q-HUB-21', 'Q-HUB-22', 'Q-HUB-23', 'Q-HUB-24', 'Q-HUB-25', 'Q-HUB-26'];
      const hub = plantedHub(h, dir, { files: ['a.mjs', 'b.mjs', 'c.mjs', 'd.mjs'], caseFiles: {}, findings: keys.map((k) => [k, 'a planted finding']) });
      const texts = {
        'Q-HUB-21': 'a planted finding about `a.mjs`.\n\nFix in: `b.mjs`, `c.mjs`. A planted change.\n',
        'Q-HUB-22': 'a planted finding about `a.mjs`.\n\nPut right already: "a planted line" in `a.mjs`. A planted holder.\n',
        'Q-HUB-23': 'a planted finding about `d.mjs`.\n\nNot the repository\'s: a planted behaviour of the harness.\n',
        'Q-HUB-24': 'a planted finding about `d.mjs`.\n\nNot placed: a planted search found no file.\n',
        'Q-HUB-25': 'a planted finding that names no file at all.\n',
        'Q-HUB-26': 'a planted finding about `a.mjs`.\n\nFix in: `d.mjs`. A first planted change.\nFix in: `a.mjs`. A second planted change.\n',
      };
      for (const [k, v] of Object.entries(texts)) writeFileSync(join(hub, 'found', `${k}.md`), `${k}: ${v}`);
      const r = h.batchRun(dir, hub, []);
      const t = `${r.stdout}${r.stderr}`;
      const step = (n) => (t.split(new RegExp(`\\n${n}\\. \\*\\*`))[1] ?? '').split(/\n\d+\. \*\*/)[0];
      const head = t.split('\n');
      const [takeup, first, second, landing] = [1, 2, 3, 4].map(step);
      const afterEnd = t.split('==== THE PLAN ENDS ABOVE THIS LINE ====')[1] ?? '';
      const body = t.split('==== THE PLAN ENDS ABOVE THIS LINE ====')[0];
      const onlyLeft = plantedHub(h, dir, { files: ['a.mjs'], caseFiles: {}, findings: [['Q-HUB-21', 'x'], ['Q-HUB-22', 'x']] });
      writeFileSync(join(onlyLeft, 'found', 'Q-HUB-21.md'), 'Q-HUB-21: a planted finding about `a.mjs`.\n\nPut right already: "a planted line" in `a.mjs`. A planted holder.\n');
      writeFileSync(join(onlyLeft, 'found', 'Q-HUB-22.md'), 'Q-HUB-22: a planted finding about `a.mjs`.\n\nNot placed: a planted search found no file.\n');
      const none = h.batchRun(dir, onlyLeft, []);
      return h.assertAll([
        ['the print is made', r.status === 0, t.slice(0, 300)],
        ['the Fix in line of the first finding makes its file the home, ahead of the file its text names first', first.startsWith('Put right in `b.mjs`: Q-HUB-21.'), first.slice(0, 200)],
        ['the last of two Fix in lines is the one read', second.startsWith('Put right in `a.mjs`: Q-HUB-26.'), second.slice(0, 200)],
        ['the file steps are the two groups and the landing step follows them', t.includes('\nOrder: 1 2 3 4\n') && landing.startsWith('Landed once'), t.slice(t.indexOf('## Order'), t.indexOf('## Order') + 200)],
        ['the take-up claims the two findings of the two steps and no other', takeup.split(' set to planned')[0] === 'Taken up: P-1, P-6', takeup.slice(0, 200)],
        ['no file step holds a finding left out or given no step', ![22, 23, 24, 25].some((n) => `${first}${second}`.includes(`Q-HUB-${n}`)), `${first.slice(0, 120)} | ${second.slice(0, 120)}`],
        ['the header counts and names the findings left out as put right already or not the repository\'s', head[1].startsWith('This is wave 1 of 1') && head[2].startsWith('2 open findings are left out of every batch') && head[2].includes('Q-HUB-22, Q-HUB-23.'), head.slice(0, 3).join(' | ')],
        ['no finding left out or given no step is marked fixed in this plan', !/- Q-HUB-2[2345] fixed/.test(t), t.slice(t.indexOf('## Found answered'), t.indexOf('## Found answered') + 500)],
        ['the findings with a Not placed line and with no file are listed after the plan\'s end as not placed, and nowhere in the plan', /NOT PLACED[^\n]*Q-HUB-24 \(item P-4\), Q-HUB-25 \(item P-5\)/.test(afterEnd) && !body.includes('NOT PLACED'), afterEnd.slice(-300)],
        ['a batch of findings all left out or not placed prints no plan and names them', none.status === 1 && !none.stdout.includes('PLAN STARTS') && none.stdout.includes('left out of every batch (Q-HUB-21) or is not placed (Q-HUB-22), so there is no batch to print'), none.stdout],
      ]);
    },
  },
  {
    name: 'Q-HUB-435 (the seed\'s half): every print carries the rule that a step changing what a guard refuses or passes searches the suite file and the case files for the cases that hold the old behaviour and names each for the landing step, the landing steps bring each case so named to the fix before the whole suite runs, and the steps that file findings end each file in the found folder with the finding\'s line',
    guards: ['tpl_rule_changed_guard', 'tpl_land_cases_first', 'tpl_found_line'],
    run(m, dir, h) {
      const single = `${h.seedRun(dir, h.seedHub(dir), ['--item', 'P-3']).stdout}`;
      const batch = `${h.batchRun(dir, h.batchHub(dir), []).stdout}`;
      const rounds = `${h.batchRun(dir, h.batchHub(dir), ['--size', '2', '--rounds', '2']).stdout}`;
      const line = (t, re) => re.exec(t)?.[0] ?? '';
      const rule = 'A step that changes what a guard refuses or passes, or what the seed prints, searches `session-guards.test.mjs` and the files under `guard-cases/` with Grep for the words and the status codes the old behaviour produced and for the cases that assert it; a case it finds in a file it owns is brought to the fix there, and one in another file is named in its report, with the file and the exact edit, for the landing step.';
      const brought = 'each case a report names as holding the old behaviour of a guard or a print a step changed brought to the fix there before the whole suite runs';
      const ends = 'each file written in the found folder ends, after one empty line, with one line of the finding\'s own kind, told by its opening words and a colon: Fix in, then the names in code spans of the files of the repository the fix sits in, the guard or the page first and four at most, a full stop and one sentence saying the change; or Not the repository\'s, then one sentence saying whose the behaviour is; or, where the Found line names no file and none can be told, Not placed, then one sentence saying what was searched for';
      const close = line(single, /\n\d+\. \*\*Closed in the program[^\n]*/);
      const land = line(batch, /\n\d+\. \*\*Landed once: every[^\n]*/);
      const round = line(rounds, /\n\d+\. \*\*Landed once for its round[^\n]*/);
      return h.assertAll([
        ['single: the rules of the plan carry the rule on a changed guard', single.includes(rule), single.slice(0, 300)],
        ['batch: the rules of the plan carry the rule on a changed guard', batch.includes(rule), batch.slice(0, 300)],
        ['single: the close step ends each file in the found folder with the finding\'s line', close.includes(ends), close.slice(0, 300)],
        ['batch: the landing step brings each case so named to the fix before the whole suite runs', land.includes(brought), land.slice(0, 300)],
        ['batch: the landing step ends each file in the found folder with the finding\'s line', land.includes(ends), land.slice(0, 300)],
        ['rounds: the landing step of a round brings each case so named to the fix and ends each file in the found folder with the finding\'s line', round.includes(brought) && round.includes(ends), round.slice(0, 300)],
      ]);
    },
  },
  {
    name: 'step 200 of the plan of 10 November (Q-HUB-479): the Sends priced rule line carries the number the seed fills, the steps of the Order, one review and two for each round, in the item print, the batch print and the print of two rounds, and no placeholder stands in the line',
    guards: ['seed_priced', 'batch_priced', 'tpl_priced_line'],
    run(m, dir, h) {
      const line = (t) => /\n- Sends priced:[^\n]*/.exec(t)?.[0] ?? '';
      const one = `${h.seedRun(dir, h.seedHub(dir), ['--item', 'P-3', '--steps', '1']).stdout}`;
      const three = `${h.seedRun(dir, h.seedHub(dir), ['--item', 'P-3', '--steps', '3']).stdout}`;
      const batch = `${h.batchRun(dir, h.batchHub(dir), []).stdout}`;
      const two = `${h.batchRun(dir, h.batchHub(dir), ['--size', '2', '--rounds', '2']).stdout}`;
      const said = (t, price, steps, over) => line(t).startsWith(`\n- Sends priced: ${price}. The plan is ${steps} steps and one review at its first send, and ${over} more sends, two for each round, allow a failed step a review and a second send; past ${price} sends it stops`);
      return h.assertAll([
        ['item print of one step: three steps in the Order, so six sends', said(one, 6, 3, 2), line(one)],
        ['item print of three steps: five steps in the Order, so eight sends', said(three, 8, 5, 2), line(three)],
        ['batch print: four steps in the Order, so seven sends', said(batch, 7, 4, 2), line(batch)],
        ['print of two rounds: six steps in the Order, so eleven sends', said(two, 11, 6, 4), line(two)],
        ['no placeholder stands in the line', [one, three, batch, two].every((t) => !/\{[A-Z]+\}/.test(line(t)) && !/Sends priced: N\b/.test(line(t))), line(one)],
      ]);
    },
  },
  {
    name: 'step 200 of the plan of 10 November (Q-HUB-473): the take-up step claims by the program command\'s verb claim and lands by the landing command\'s verbs commit and push, and the landing step and the close step make the landing, the filing and the close by the verbs prove, commit, push, done, file, lesson and measure, in the item print, the print for new work, the batch print and the print of two rounds',
    guards: ['tpl_takeup_claim_verb', 'tpl_takeup_batch_claim', 'tpl_takeup_commit_verb', 'tpl_takeup_push_verb', 'tpl_land_push_verb', 'tpl_land_prove', 'tpl_land_commit', 'tpl_land_done', 'tpl_land_file', 'tpl_land_lesson', 'tpl_close_measure', 'tpl_close_file', 'tpl_close_done', 'tpl_close_commit_verb'],
    run(m, dir, h) {
      const single = `${h.seedRun(dir, h.seedHub(dir), ['--item', 'P-3']).stdout}`;
      const fresh = `${h.seedRun(dir, h.seedHub(dir), ['--item', 'new']).stdout}`;
      const batch = `${h.batchRun(dir, h.batchHub(dir), []).stdout}`;
      const rounds = `${h.batchRun(dir, h.batchHub(dir), ['--size', '2', '--rounds', '2']).stdout}`;
      const stepOf = (t, re) => re.exec(t)?.[0] ?? '';
      const upSingle = stepOf(single, /\n1\. \*\*Taken up[^\n]*/);
      const upFresh = stepOf(fresh, /\n1\. \*\*Taken up[^\n]*/);
      const upBatch = stepOf(batch, /\n1\. \*\*Taken up[^\n]*/);
      const close = stepOf(single, /\n\d+\. \*\*Closed in the program[^\n]*/);
      const land = stepOf(batch, /\n\d+\. \*\*Landed once: every[^\n]*/);
      const round = stepOf(rounds, /\n\d+\. \*\*Landed once for its round[^\n]*/);
      const push = "the landing command's verb push, run with that number after its expect switch";
      const noGit = (s) => !s.includes('`git add`') && !s.includes('`git commit -m`') && !s.includes('`git push origin main`') && !s.includes('`git ls-remote --heads origin`');
      return h.assertAll([
        ['single take-up: the claim is the program command\'s verb claim with the item and the plan file\'s path', upSingle.includes("run the program command's verb claim with the key of each item the plan names, P-3, and the plan file's path, which will set State to planned and Plan to this plan's title"), upSingle.slice(0, 900)],
        ['single take-up: the commit is the landing command\'s verb commit and the push its verb push with no clone switch', upSingle.includes("run the landing command's verb commit on the manifest; then the landing acts:") && upSingle.includes(`${push} and with no clone switch`) && noGit(upSingle), upSingle.slice(-1200)],
        ['new work: the entry is written by hand and the commit and push are the landing command\'s verbs', upFresh.includes("run the landing command's verb commit on the manifest; then the landing acts:") && upFresh.includes(`${push} and with no clone switch`) && !upFresh.includes('verb claim') && noGit(upFresh), upFresh.slice(-1200)],
        ['batch take-up: the claim is the verb claim with the keys of the items and the commit and push are the landing command\'s verbs', upBatch.includes("run the program command's verb claim with the keys of the items P-") && upBatch.includes("run the landing command's verb commit on the manifest; then the landing acts:") && upBatch.includes(`${push} and with no clone switch`) && noGit(upBatch), upBatch.slice(0, 1500)],
        ['single close step: done, file, lesson, measure, the checks alone, the commit and the push with the live clone are the verbs', ["by the program command's verb done for an item that is done", "run the program command's verb file on that file, which will write one file in the found folder named by its key", "run the program command's verb lesson with its title",
          "run the program command's verb measure on the transcript, which runs the cost instrument", "run the landing command's verb prove for the checks alone, once, its last line read", "run the landing command's verb commit on it", `${push} and the live clone's path, \`/root/.claude/hub\`, after its clone switch`].every((s) => close.includes(s)) && noGit(close), close.slice(0, 1500)],
        ['batch landing step: the manifest, prove, commit, done, file, lesson, measure, the checks alone, the close entry\'s commit and the push are the verbs', ["write the manifest in the session scratchpad with the Write tool from the reports", "run the landing command's verb prove on the manifest once", "run the landing command's verb commit on the manifest, which makes one commit for each of steps",
          "run the program command's verb done for the items", "run the program command's verb file on it, which will write one file in the found folder and one open program item for each", "run the program command's verb lesson with its title", "run the program command's verb measure on the transcript",
          "run the landing command's verb prove for the checks alone, once", `${push} and the live clone's path`].every((s) => land.includes(s)) && noGit(land), land.slice(0, 2500)],
        ['round landing step: the same verbs but the measure and the clone switch, which the last round alone uses', ["run the landing command's verb prove on the manifest once", "run the landing command's verb commit on the manifest, which makes one commit for each of steps", "run the program command's verb done for the items", "run the program command's verb file on it", `${push} and with no clone switch`].every((s) => round.includes(s))
          && !round.includes('verb measure') && noGit(round), round.slice(0, 2500)],
      ]);
    },
  },
];

/** The names a file step's text says it owns: the code spans between "the step owns" and "and writes nothing else", the case file's "(new)" mark left out. */
function ownedNames(stepText) {
  return [...(/Facts: the step owns (.*?) and writes nothing else/.exec(stepText)?.[1] ?? '').matchAll(/`([^`]+)`/g)].map((x) => x[1]);
}

/**
 * A planted hub for the partition cases: the seed hub with the program's open findings, their found files, the files they name at the root and the case files in `guard-cases/`.
 * @param {object} h  the suite's helpers.
 * @param {string} dir  the folder the case was given.
 * @param {{files: string[], caseFiles: Record<string,string>, findings: [string,string][]}} spec  the root files, the case files by name, and the findings by key and text, in rank order.
 * @returns {string} the planted hub's path.
 */
function plantedHub(h, dir, spec) {
  const hub = h.seedHub(dir);
  const entry = (n, key) => [`### P-${n}. ${key}: planted finding ${n}`, '', 'Repository: hub. Goal: 6. State: open. Plan: none.', '', `Acceptance: Planted acceptance ${n}.`, '', 'Depends: none.', ''].join('\n');
  const head = ['# The program', '', 'Intro line of the planted program.', '', '## Thesis', '', 'A planted thesis paragraph of the case, one paragraph only.', '', '## Items', '', `${spec.findings.length} items planted for the case.`, '', '## The harness', ''].join('\n');
  writeFileSync(join(hub, 'PROGRAM.md'), `${head}\n${spec.findings.map(([key], i) => entry(i + 1, key)).join('\n')}`);
  for (const f of spec.files) writeFileSync(join(hub, f), '// a planted file of the case\n');
  mkdirSync(join(hub, 'guard-cases'), { recursive: true });
  for (const [f, text] of Object.entries(spec.caseFiles)) writeFileSync(join(hub, 'guard-cases', f), text);
  for (const [key, text] of spec.findings) writeFileSync(join(hub, 'found', `${key}.md`), `${key}: ${text}\n`);
  return hub;
}

export const plants = {
  seed_passed_in: ["L(findingsPassedIn(`step ${close}, the close step,`));\n  L();\n  L('## Item entry');", "L('- <none>');\n  L();\n  L('## Item entry');", 'plan-seed.mjs'],
  batch_passed_in: ["L(findingsPassedIn(`step ${lastLanding}, the landing step,`));\n  L();\n  L('## Thesis');", "L('- <none>');\n  L();\n  L('## Thesis');", 'plan-seed.mjs'],
  seed_step_report_file: ['(new); ${SEND_REPORT}. Estimate <minutes> min.', '(new). Estimate <minutes> min.', 'plan-seed.mjs'],
  batch_step_report_file: ['(new); ${SEND_REPORT}. Estimate ${groupEst[i]} min.', '(new). Estimate ${groupEst[i]} min.', 'plan-seed.mjs'],
  seed_cost_forced: ["the close step, each rebased onto the remote's head. ${FORCED_TURNS} ", "the close step, each rebased onto the remote's head. ", 'plan-seed.mjs'],
  batch_cost_forced: ['${groups.length + 2} forced turns of the stop hook are spent while a commit stands unpushed, the file steps plus two. ', '', 'plan-seed.mjs'],
  seed_close_keys: ["L(closeKeysLine(`step ${close}, the close step,`));\n  L();\n\n  // ---- the movable", "L();\n\n  // ---- the movable", 'plan-seed.mjs'],
  batch_close_keys: ["L(closeKeysLine(`step ${lastLanding}, the landing step,`));\n  L();\n  L('==== THE PLAN ENDS", "L();\n  L('==== THE PLAN ENDS", 'plan-seed.mjs'],
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
  tpl_landing_red: ['read through the connector for its state alone, its conclusion or that it was still running, and no log of it read', 'read through the connector, its conclusion or that it was still running, and where it has concluded red its failing lines are left', 'plans/seed-template.md'],
  tpl_close_remote: ["reads the remote's head with `git show origin/main:PROGRAM.md`", "reads the remote's head with `git show main:PROGRAM.md`", 'plans/seed-template.md'],
  tpl_close_keys: ['key by key and never as a range', 'as a range', 'plans/seed-template.md'],
  tpl_passed_in: ["for each finding listed in the plan's section Findings passed in", "for each finding listed in the plan's section Notes", 'plans/seed-template.md'],
  // step 131: the batch print's parallel shape
  batch_after_parallel: ['const after = [...gnums.map((n) => `${n} after ${takeup}`),', 'const after = [...gnums.map((n, i) => `${n} after ${i ? gnums[i - 1] : takeup}`),', 'plan-seed.mjs'],
  batch_no_file_own: ['if (f.putRight || f.left || f.unplaced) continue;', 'if (f.putRight || f.left) continue;', 'plan-seed.mjs'],
  batch_seam_out: ['seamsOut[i].add(', 'seamsOut[i].has(', 'plan-seed.mjs'],
  batch_seam_in: ['seamsIn[j].add(', 'seamsIn[j].has(', 'plan-seed.mjs'],
  batch_case_file: ["? `guard-cases/${x}` : '');", "? '' : '');", 'plan-seed.mjs'],
  batch_landing_after: ["`${landing} after ${gnums.length ? gnums.join(' ') : takeup}`", '`${landing} after ${takeup}`', 'plan-seed.mjs'],
  batch_order_landing: ['const order = [takeup, ...gnums, landing, ...later', 'const order = [takeup, ...gnums, landing, landing + 1, ...later', 'plan-seed.mjs'],
  batch_landing_step: ['L(fill(tpl[landingBlock]', 'void (fill(tpl[landingBlock]', 'plan-seed.mjs'],
  batch_parallel_rules: ["if (groups.length) L(fill(tpl['parallel-rules']", "if (false) L(fill(tpl['parallel-rules']", 'plan-seed.mjs'],
  batch_cost_agent: ["Agent time is the sum of the steps' estimates, ${agentMin} min", "Agent time is the sum of the steps' estimates, 0 min", 'plan-seed.mjs'],
  batch_cost_wall: ['and the landing step, ${wallMin} min.', 'and the landing step, 0 min.', 'plan-seed.mjs'],
  batch_wave_cap: ['const WAVE = 7;', 'const WAVE = 99;', 'plan-seed.mjs'],
  batch_wave_header: ['and it leaves ${leaves} of the ${totalGroups} groups', 'and it leaves 0 of the ${totalGroups} groups', 'plan-seed.mjs'],
  batch_wave_home: ['![...g.claims].some((x) => used.has(x))', 'true', 'plan-seed.mjs'],
  batch_wave_switch: ['Math.floor(Number(o.wave) || 1)', '1', 'plan-seed.mjs'],
  tpl_close_index: ['one index row for it in `LESSONS.md` in the shape the index\'s rows hold', 'one row for it', 'plans/seed-template.md'],
  tpl_review_resend: ['A review for a resend of a file step is sent only when no agent is editing the working copy', 'A review for a resend of a file step may be sent while an agent is editing the working copy', 'plans/seed-template.md'],
  tpl_commit_red_case: ["the landing step puts the code right in the owning step's file and keeps the finding's fix", 'the landing step leaves the case red', 'plans/seed-template.md'],
  tpl_commit_by_path: ['- A suite case never writes into the working copy: a case that needs a program', "- A landing step with several commits stages nothing beforehand and names each commit's own files after the message, because the Commands hold no unstage.\n- A suite case never writes into the working copy: a case that needs a program", 'plans/seed-template.md'],
  tpl_rule_no_bg: ['No run of this plan goes in the background.', 'A run of this plan may go in the background.', 'plans/seed-template.md'],
  tpl_device_line: ["names the app's test page as its instrument and never a container render", "names a container render as its instrument", 'plans/seed-template.md'],
  tpl_push_landing: ['Nothing is pushed except by the take-up step and by the landing step, which is the close step in a plan for one item', 'Nothing is pushed except by the take-up step', 'plans/seed-template.md'],
  // step 145: the take-up's partition finding, Q-HUB-363, Q-HUB-364 and Q-HUB-368
  part_merge: ['groups = mergeSharing(groups, claimsOf);', 'void mergeSharing;', 'plan-seed.mjs'],
  part_folder: ['for (const h of g.homes) for (const y of filesUnder(repo, h)) {', 'for (const h of g.homes) for (const y of [h]) {', 'plan-seed.mjs'],
  part_case_claim: ['s.add(y); const c = caseFileOf(y); if (c) s.add(c); }', 's.add(y); }', 'plan-seed.mjs'],
  part_plant_owner: ['if (!existsSync(join(repo, t)) || owner.has(t)) continue;', 'if (!existsSync(join(repo, t)) || true) continue;', 'plan-seed.mjs'],
  part_names_dedupe: ['if (!covered.has(y) && !cases.includes(y)) names.push(y);', 'if (!covered.has(y)) names.push(y);', 'plan-seed.mjs'],
  part_folder_name: ['under.every((y) => mine.has(y))', 'false', 'plan-seed.mjs'],
  batch_plant_targets: ['...caseFiles.flatMap((c) => plantTargets(slurp(join(repo, c))).filter((t) => namedFiles.has(t)))', '', 'plan-seed.mjs'],
  batch_plant_named: ['.filter((t) => namedFiles.has(t))', '', 'plan-seed.mjs'],
  batch_six_parts: ['then the six parts of the order the rules of this plan give a file step; a line a fix needs', 'then run the suite; a line a fix needs', 'plan-seed.mjs'],
  batch_other_line: ['a line a fix needs in a file another step of this plan owns is named in the report with the file, the place and the exact words, for the landing step, and is not written by this step; ', '', 'plan-seed.mjs'],
  tpl_six_order: ['It works in this order and no other. First, every edit its findings ask for', 'It works in any order. First, every edit its findings ask for', 'plans/seed-template.md'],
  tpl_own_runs: ['Fourth, its own cases, each in a run of its own with one case switch to a run', 'Fourth, its own cases, all in one run', 'plans/seed-template.md'],
  tpl_other_line: ['A line a fix needs in a file another step owns is named in the report with the file, the place and the exact words, for the landing step, and is not written by the step', 'A line a fix needs in a file another step owns is written by the step', 'plans/seed-template.md'],
  tpl_commit_next_send: ['is put right at the start of the next send and never after a run in the same send', 'is put right in the same send, after the run', 'plans/seed-template.md'],
  tpl_commit_find_file: ['is put right in that file at the start of the next send', 'is left to the close', 'plans/seed-template.md'],
  tpl_commit_suite_first: ['a landing step that edits a gate file runs the whole suite after its last edit and before its first commit', 'a landing step that edits a gate file runs its own cases', 'plans/seed-template.md'],
  tpl_commit_stale_report: ["the stale-plant list comes from the suite's own report before a run", 'the stale-plant list comes from reading the plants', 'plans/seed-template.md'],
  tpl_commit_step_text: ['one entry for each of steps {FIRSTGROUP} to {LASTGROUP} in that order', 'one entry for all of steps {FIRSTGROUP} to {LASTGROUP}', 'plans/seed-template.md'],
  // step 159 of the plan of 9 November: the shape the last wave ran, Q-HUB-377, Q-HUB-379, Q-HUB-380, Q-HUB-386, Q-HUB-396, Q-HUB-397 and Q-HUB-399
  batch_findkeys: ["takeupVars.FINDKEYS = planned.map((f) => f.key).join(', ');", "takeupVars.FINDKEYS = '';", 'plan-seed.mjs'],
  batch_suite_targets: ['...plantTargets(suiteText).filter((t) => namedFiles.has(t))', '...[]', 'plan-seed.mjs'],
  batch_counts_list: ['g.list.filter((f) => f.counts).flatMap((f) => f.files)', '[]', 'plan-seed.mjs'],
  batch_case_guard_only: ['if (c && owner.has(c) && owner.get(c) !== i) owner.set(c, i); }', 'if (c && owner.has(c) && owner.get(c) !== i) void c; }', 'plan-seed.mjs'],
  tpl_takeup_claim: ['it adds no entry, touches no count line, runs no check and leaves the live clone as it is', 'it adds an entry', 'plans/seed-template.md'],
  tpl_takeup_no_pull: ["the live clone is left as it is, because the plan's last step brings it forward when no other step is running", "`git -C /root/.claude/hub pull origin main` and `git -C /root/.claude/hub rev-parse HEAD`, read equal to the remote's main", 'plans/seed-template.md'],
  tpl_takeup_key_batch: ['so the step names in its report the key each entry carries wherever it is not the printed one', 'so the step writes the key it printed', 'plans/seed-template.md'],
  tpl_takeup_key_single: ['so the step reads the key the entry carries and names it in its report wherever it is not the printed one', 'so the step keeps the key it printed', 'plans/seed-template.md'],
  tpl_takeup_title_batch: ["the plan's title is copied whole into each entry, so the title is written with no phrase the third-person check refuses", "the plan's title is copied whole into each entry", 'plans/seed-template.md'],
  tpl_takeup_title_single: ["the plan's title is copied whole into the entry, so the title is written with no phrase the third-person check refuses", "the plan's title is copied whole into the entry", 'plans/seed-template.md'],
  tpl_marker_pin: ["an app's doctrine marker and the calling workflow's hub pin move together or not at all", "an app's doctrine marker moves", 'plans/seed-template.md'],
  tpl_pull_last: ['the pull being the last act that changes anything because it changes the gates under every agent', 'the pull being one act among others', 'plans/seed-template.md'],
  tpl_close_pull_last: ["the pull of the live clone is this step's last act, when no other step is running, because it changes the gates under every agent; the remote's main moves under this session, so it is fetched", "the remote's main moves under this session, so it is fetched", 'plans/seed-template.md'],
  tpl_land_pull_last: ["the pull of the live clone is this step's last act, when no other step is running, because it changes the gates under every agent; the remote's main moves under this session. Do: read the reports", "the remote's main moves under this session. Do: read the reports", 'plans/seed-template.md'],
  tpl_key_from_program: ["the item's key is read from the program at the time of use and not from this plan's text", "the item's key is read from this plan's text", 'plans/seed-template.md'],
  tpl_land_key_program: ["and each item's key is read from the program and not from this plan's text", "and each item's key is read from this plan's text", 'plans/seed-template.md'],
  tpl_land_plants_all: ['the plants of every file the steps edited are run here, the suite file and each doctrine page among them', 'the plants of the guard files are run here', 'plans/seed-template.md'],
  tpl_land_long_files: ['the keys of its new plants, those of a long file among them', 'the keys of its new plants', 'plans/seed-template.md'],
  tpl_land_checks_twice: ["run the landing command's verb prove for the checks alone, once, its last line read; add the close entry", 'then nothing again; add the close entry', 'plans/seed-template.md'],
  tpl_land_close_commit: ["a reader-facing one-line message saying the wave is closed and the close's files, and run the landing command's verb commit with the close entry's label", "a one-line message and the close's files", 'plans/seed-template.md'],
  tpl_rule_foreground: ["Every run of the suite and of a check is made in the foreground with the Bash tool's timeout set to ten minutes", 'Every run of the suite and of a check may be made in the background', 'plans/seed-template.md'],
  tpl_rule_case_string: ['A string a case writes holds no word the third-person check reads as a pronoun', 'A string a case writes holds any word', 'plans/seed-template.md'],
  tpl_rule_conflict: ['Where the last rebase of the landing step stops on a conflict in `PROGRAM.md` alone', 'Where the last rebase of the landing step stops on a conflict', 'plans/seed-template.md'],
  tpl_rule_long_files: ['- In the landing step every edit of a gate file is made before the run of the whole suite', "- The plants of every edited file run in the landing step narrowed to that file, but of a long file only the new plants run, by key, and its other plants are proved by the runner's doctrine gates run after the push.\n- In the landing step every edit of a gate file is made before the run of the whole suite", 'plans/seed-template.md'],
  tpl_cmd_continue: ['- `git rebase --continue`\n', '', 'plans/seed-template.md'],
  // step 166 of the plan of 10 November: Q-HUB-407, Q-HUB-404 and the rounds
  seed_closer_passed: ['L(findingsPassedIn(`step ${close}, the close step,`));', "L(findingsPassedIn('the close step'));", 'plan-seed.mjs'],
  batch_closer_passed: ['L(findingsPassedIn(`step ${lastLanding}, the landing step,`));', "L(findingsPassedIn('the close step'));", 'plan-seed.mjs'],
  seed_closer_keys: ['L(closeKeysLine(`step ${close}, the close step,`));', "L(closeKeysLine('the close step'));", 'plan-seed.mjs'],
  batch_closer_keys: ['L(closeKeysLine(`step ${lastLanding}, the landing step,`));', "L(closeKeysLine('the close step'));", 'plan-seed.mjs'],
  seed_cost_closer: ['and one by step ${close}, the close step, each rebased', 'and one by the close step, each rebased', 'plan-seed.mjs'],
  seed_new_word: ["const isNew = want === 'new';", 'const isNew = false;', 'plan-seed.mjs'],
  seed_new_takeup: ["tpl[isNew ? 'take-up-new' : 'take-up']", "tpl['take-up']", 'plan-seed.mjs'],
  seed_new_form: ["State: planned. Plan: <this plan's title>.", 'State: open. Plan: none.', 'plan-seed.mjs'],
  tpl_takeup_new: ['and the next free program key when this plan was typed is {ITEM}, so the entry is added under it', 'and the entry is added', 'plans/seed-template.md'],
  rounds_refuse: ['if (!Number.isInteger(asked) || asked < 1 || asked > 5) return', 'if (false) return', 'plan-seed.mjs'],
  rounds_waves: ['if (R > 1 && waves.length - (waveNo - 1) < R) {', 'if (false) {', 'plan-seed.mjs'],
  rounds_loop: ['wave: waveNo + k, part: true', 'wave: waveNo, part: true', 'plan-seed.mjs'],
  rounds_after: ['const before = k === 0 ? landing : later[k - 1].landing;', 'const before = takeup;', 'plan-seed.mjs'],
  rounds_last_pull: ['const lastRound = o.part ? o.lastRound === true : later.length === 0;', 'const lastRound = true;', 'plan-seed.mjs'],
  rounds_cost: ['${R + 1} pushes are made, one by the take-up and one by the landing step of each round', '2 pushes are made, one by the take-up and one by the landing step of each round', 'plan-seed.mjs'],
  rounds_takeup_all: ['const planned = [...plannedHere, ...later.flatMap((p) => p.planned)];', 'const planned = [...plannedHere];', 'plan-seed.mjs'],
  rounds_served: ['...later.flatMap((p) => servedRound(p.gnums, p.landing)),', '', 'plan-seed.mjs'],
  rounds_order: ['const order = [takeup, ...gnums, landing, ...later.flatMap((p) => [...p.gnums, p.landing])];', 'const order = [takeup, ...gnums, landing];', 'plan-seed.mjs'],
  rounds_parallel: ["const filesteps = roundRuns.length > 1 ? `${roundRuns.slice(0, -1).join(', ')} and ${roundRuns[roundRuns.length - 1]}` : roundRuns[0];", 'const filesteps = roundRuns[0];', 'plan-seed.mjs'],
  rounds_note: ["const roundNote = later.length ? ', the steps of each round together and each round after the landing step of the round before' : '';", "const roundNote = '';", 'plan-seed.mjs'],
  rounds_lines: ['for (const p of later) for (const l of p.lines) L(l);', '', 'plan-seed.mjs'],
  rounds_stepof: ['for (const p of later) for (const [k, n] of p.stepOf) stepOf.set(k, n);', '', 'plan-seed.mjs'],
  rounds_review: ['const review = lastLanding + 1;', 'const review = landing + 1;', 'plan-seed.mjs'],
  tpl_landing_round_live: ["the live clone is left as it is, because the plan's last landing step brings it forward when no other step is running, and the measure is recorded there and not here", 'the live clone is pulled', 'plans/seed-template.md'],
  tpl_landing_round_title: ['**Landed once for its round: every edit left', '**Landed once: every edit left', 'plans/seed-template.md'],
  // the four lines of a finding's file, the seed's usage text and the changed-guard rule of the template: Q-HUB-434 and Q-HUB-435
  seed_usage_rounds: ['[--wave <n>] [--rounds <1 to 5>] [--repo <full path>] [--plan <path>] [--hub <full path>] [--out <path>]\\n\');', '[--wave <n>] [--repo <full path>] [--plan <path>] [--hub <full path>] [--out <path>]\\n\');', 'plan-seed.mjs'],
  seed_usage_item: ['--item <P-key | next | new> | --batch', '--item <P-key | next> | --batch', 'plan-seed.mjs'],
  seed_line_last: ['if (m) found = { kind:', 'if (m && !found) found = { kind:', 'plan-seed.mjs'],
  seed_fixin_files: ["if (line?.kind === 'fix-in') for (const m of line.rest.matchAll(", "if (false) for (const m of line.rest.matchAll(", 'plan-seed.mjs'],
  seed_left_out: ["const left = line?.kind === 'put-right' || line?.kind === 'not-repo';", 'const left = false;', 'plan-seed.mjs'],
  seed_left_header: ['if (leftOut.length) L(', 'if (false) L(', 'plan-seed.mjs'],
  seed_unplaced: ["const unplaced = !left && !putRight && (line?.kind === 'not-placed' || files.length === 0);", 'const unplaced = false;', 'plan-seed.mjs'],
  seed_not_placed_list: ['if (notPlaced.length) {\n    L();', 'if (false) {\n    L();', 'plan-seed.mjs'],
  seed_all_left_refused: ['if (!o.part && !groups.length && !putRight.length) {', 'if (false) {', 'plan-seed.mjs'],
  tpl_rule_changed_guard: ['searches `session-guards.test.mjs` and the files under `guard-cases/` with Grep for the words and the status codes the old behaviour produced', 'searches `session-guards.test.mjs` for the words the old behaviour produced', 'plans/seed-template.md'],
  tpl_land_cases_first: ['each case a report names as holding the old behaviour of a guard or a print a step changed brought to the fix there before the whole suite runs', 'nothing else before the whole suite runs', 'plans/seed-template.md'],
  tpl_found_line: ["each file written in the found folder ends, after one empty line, with one line of the finding's own kind", 'each file written in the found folder holds the finding', 'plans/seed-template.md'],
  // step 200 of the plan of 10 November: Q-HUB-473, Q-HUB-479 and Q-HUB-468, and the file steps' rule printed once
  seed_priced: ['PRICED: count + 2 + 1 + 2', 'PRICED: count', 'plan-seed.mjs'],
  batch_priced: ['OVER: 2 * R, PRICED: orderN + 1 + 2 * R', 'OVER: 2 * R, PRICED: orderN', 'plan-seed.mjs'],
  tpl_priced_line: ['Sends priced: {PRICED}. The plan is {ORDERN} steps and one review at its first send, and {OVER} more sends', 'Sends priced: N. The plan is {ORDERN} steps and one review at its first send, and {OVER} more sends', 'plans/seed-template.md'],
  batch_group_kill: ['Kill: a second red run of a case of its own, or a cause the rules of this plan do not let the step repair, ends it FAILED', 'Kill: a red run of a case of its own ends it FAILED', 'plan-seed.mjs'],
  tpl_case_quote: ["with one case switch to a run, the switch written whole inside double quotes, as \"--case=<the case's name>\". Fifth,", 'with one case switch to a run. Fifth,', 'plans/seed-template.md'],
  tpl_parallel_repair: ['A red run of a case of its own is met as the rule on a red check gives: the step repairs it once, in a file it wrote in this send, and a second red run ends', 'A red run of a case of its own ends', 'plans/seed-template.md'],
  tpl_repair_four_parts: ["A red check is met as the agent rules give: where its cause is read from the run's own output", "A red check ends the step: where its cause is read from the run's own output", 'plans/seed-template.md'],
  tpl_repair_landing: ['is met as the rule on a red check gives, a cause in a file another step wrote ending the send FAILED with its report,', 'ends the send FAILED with nothing written after but its report,', 'plans/seed-template.md'],
  tpl_rule_case_quote: ['- A case switch whose name holds a space is written whole inside double quotes', '- A case switch is written', 'plans/seed-template.md'],
  tpl_cmd_land: ['- `node {HUB}/plan-land.mjs`\n', '', 'plans/seed-template.md'],
  tpl_cmd_program: ['- `node {HUB}/program.mjs`\n', '', 'plans/seed-template.md'],
  tpl_rule_commands: ['- The landing, the claim, the filing and the close are each made by a command of the Commands', '- The landing is made by hand, and the claim, the filing and the close are each made by a command of the Commands', 'plans/seed-template.md'],
  tpl_takeup_claim_verb: ["run the program command's verb claim with the key of each item the plan names", 'set State to planned for each item the plan names', 'plans/seed-template.md'],
  tpl_takeup_batch_claim: ["run the program command's verb claim with the keys of the items {ITEM}", 'set State to planned in the items {ITEM}', 'plans/seed-template.md'],
  tpl_takeup_commit_verb: ["run the landing command's verb commit on the manifest; then the landing acts: {TAKEUPLANDING}. Observe: the entry reads State planned", 'make one commit; then the landing acts: {TAKEUPLANDING}. Observe: the entry reads State planned', 'plans/seed-template.md'],
  tpl_takeup_push_verb: ["the landing command's verb push, run with that number after its expect switch and with no clone switch", '`git push origin main`', 'plans/seed-template.md'],
  tpl_land_push_verb: ["the landing command's verb push, run with that number after its expect switch and the live clone's path", "`git push origin main`, and the live clone's path", 'plans/seed-template.md'],
  tpl_land_prove: ["run the landing command's verb prove on the manifest once, which makes", 'run the suite once, which makes', 'plans/seed-template.md'],
  tpl_land_commit: ["run the landing command's verb commit on the manifest, which makes one commit for each of steps", 'make one commit for each of steps', 'plans/seed-template.md'],
  tpl_land_done: ["run the program command's verb done for the items {ITEM} that the take-up set to planned", 'write State done in the entries of the items {ITEM} that the take-up set to planned', 'plans/seed-template.md'],
  tpl_land_file: ["run the program command's verb file on it, which will write one file in the found folder and one open program item for each", 'write one file in the found folder and one open program item for each', 'plans/seed-template.md'],
  tpl_land_lesson: ["run the program command's verb lesson with its title", 'write the lesson with its title', 'plans/seed-template.md'],
  tpl_close_measure: ["run the program command's verb measure on the transcript, which runs the cost instrument", 'run the cost instrument on the transcript', 'plans/seed-template.md'],
  tpl_close_file: ["run the program command's verb file on that file, which will write one file in the found folder named by its key", 'write one file in the found folder named by its key', 'plans/seed-template.md'],
  tpl_close_done: ["by the program command's verb done for an item that is done", 'by hand', 'plans/seed-template.md'],
  tpl_close_commit_verb: ["run the landing command's verb commit on it; then the landing acts: {LANDING}", 'make one commit; then the landing acts: {LANDING}', 'plans/seed-template.md'],
};
