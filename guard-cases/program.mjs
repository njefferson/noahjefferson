// Cases and plants of program.mjs, the program's acts as five commands (Q-HUB-473, step 199 of the plan of 10 November). The shape is shape.mjs.
// Every program, found folder, lessons folder, index, plan and transcript a case needs is written under a temporary folder, and the command is run
// as a child process against it with the root switch; nothing is written into the working copy.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Words the third-person and privacy checks read, built from parts so that this file holds none of them.
const PRON = String.fromCharCode(104, 101);
const ROLE = ['the', 'owner'].join(' ');
const SAID = `${ROLE} said: "go ahead"`;

/** A program with three items, an entry for a finding, the measure item with one close entry, and the two count lines. */
const programText = (findingKey) => [
  '# The program', '',
  '## Items', '',
  '12 items (P-1 to P-10): 3 built, and 4 findings, one for each key of the Found queue.', '',
  '## Items the redesign plan builds', '',
  '### P-1. First open item', '', 'Repository: hub. Goal: 2. State: open. Plan: none.', '', 'Acceptance: first.', '', 'Depends: none.', '',
  '### P-2. Second open item', '', 'Repository: hub. Goal: 2. State: open. Plan: none.', '', 'Acceptance: second.', '', 'Depends: none.', '',
  '### P-3. Third planned item', '', 'Repository: hub. Goal: 2. State: planned. Plan: an earlier plan.', '', 'Acceptance: third.', '', 'Depends: none.', '',
  `### P-4. Q-HUB-${findingKey}: a finding already filed`, '', 'Repository: hub. Goal: 3. State: open. Plan: none.', '', 'Acceptance: fourth.', '', 'Depends: none.', '',
  '### P-10. The measure', '', 'Repository: hub. Goal: 2. State: done. Plan: the first plan.', '', 'Acceptance: a plan has a close entry.', '',
  'Close entry of an earlier plan:', '- The owner\'s messages: 4.', '- Compactions: 0.', '', 'State: done; landed once.', '',
  '## Parked settings', '', 'Nothing here.', '',
].join('\n');

/**
 * A planted repository root.
 * @param {object} h  the suite's helpers.
 * @param {{found?: number[], key?: number}} [o]  the numbers of the finding files it holds and the finding key the program's entry names.
 * @returns {string} the root's folder.
 */
function makeRoot(h, { found = [4], key = 4 } = {}) {
  const root = h.tmp('prog-root-');
  writeFileSync(join(root, 'PROGRAM.md'), programText(key));
  mkdirSync(join(root, 'found'));
  for (const n of found) writeFileSync(join(root, 'found', `Q-HUB-${n}.md`), `Q-HUB-${n}: an old finding number ${n}.\n\nFix in: \`a.mjs\`. Old.\n`);
  mkdirSync(join(root, 'lessons'));
  writeFileSync(join(root, 'lessons', '001-first-lesson.md'), '## 1 \u00b7 First lesson\n\n**Enforced by:** JUDGEMENT\n');
  writeFileSync(join(root, 'lessons', '002-second-lesson.md'), '## 2 \u00b7 Second lesson\n\n**Enforced by:** JUDGEMENT\n');
  writeFileSync(join(root, 'LESSONS.md'), ['# Lessons', '', '- **\u00a71** \u2014 [First lesson](lessons/001-first-lesson.md)', '- **\u00a72** \u2014 [Second lesson](lessons/002-second-lesson.md)', '', 'A closing line.', ''].join('\n'));
  writeFileSync(join(root, 'gate-x.mjs'), '// a planted gate\n');
  return root;
}

/** The command as a child process against a planted root. */
const run = (dir, root, args) => spawnSync('node', [join(dir, 'program.mjs'), ...args, '--root', root], { encoding: 'utf8', timeout: 120000 });

/** Everything a verb may write, as one string, so that two states can be compared. */
function snap(root) {
  const list = (d) => (existsSync(join(root, d)) ? readdirSync(join(root, d)).sort().map((n) => `${d}/${n}\n${readFileSync(join(root, d, n), 'utf8')}`).join('\n--\n') : '');
  return [readFileSync(join(root, 'PROGRAM.md'), 'utf8'), readFileSync(join(root, 'LESSONS.md'), 'utf8'), list('found'), list('lessons')].join('\n====\n');
}

/** The text of one entry of the program, from its heading to the next. */
const entryOf = (root, key) => new RegExp(`### ${key}\\. [\\s\\S]*?(?=\\n### |\\n## |$)`).exec(readFileSync(join(root, 'PROGRAM.md'), 'utf8'))?.[0] ?? '';

const out = (r) => `exit ${r.status}: ${String(r.stdout)}${String(r.stderr).slice(0, 400)}`;

export const cases = [
  {
    name: 'step 199: the claim verb sets each named open item planned with the plan\'s title on its plan line, leaves the others, refuses an item that is not open or not held with nothing written, and an unknown verb exits 2',
    guards: ['prog_claim_sets', 'prog_claim_not_open', 'prog_claim_unheld', 'prog_refuse_exit', 'prog_usage'],
    run(m, dir, h) {
      const root = makeRoot(h);
      const plan = join(h.tmp('prog-plan-'), 'plan.md');
      writeFileSync(plan, '# A planted plan title\n\n## Goals\n\nnothing\n');
      const ok = run(dir, root, ['claim', 'P-1', 'P-2', '--plan', plan]);
      const after = snap(root);
      const again = run(dir, root, ['claim', 'P-1', '--plan', plan]);
      const bad = run(dir, root, ['claim', 'P-3', 'P-99', '--plan', plan]);
      const verb = spawnSync('node', [join(dir, 'program.mjs'), 'bogus'], { encoding: 'utf8', timeout: 60000 });
      return h.assertAll([
        ['two open items are claimed', ok.status === 0 && /P-1 is planned/.test(ok.stdout) && /P-2 is planned/.test(ok.stdout), out(ok)],
        ['each claimed item carries the state and the title', ['P-1', 'P-2'].every((k) => entryOf(root, k).includes('State: planned. Plan: A planted plan title.')), entryOf(root, 'P-1')],
        ['an item not named is left as it was', entryOf(root, 'P-3').includes('State: planned. Plan: an earlier plan.') && entryOf(root, 'P-10').includes('State: done.'), entryOf(root, 'P-3')],
        ['a claim of an item already planned is refused with nothing written', again.status === 1 && /P-1 is planned and not open/.test(again.stdout) && snap(root) === after, out(again)],
        ['an item that is not open and one the program does not hold are both named', bad.status === 1 && /P-3 is planned and not open/.test(bad.stdout) && /P-99 is not an item of the program/.test(bad.stdout) && snap(root) === after, out(bad)],
        ['an unknown verb exits 2 with the usage', verb.status === 2 && /usage:/.test(verb.stdout), out(verb)],
      ]);
    },
  },
  {
    name: 'step 199: the done verb sets each named item done with its sentence under the repository line, edits two items without moving either, and refuses an item the program does not hold and a sentence that attributes a message to a person, with nothing written',
    guards: ['prog_done_sets', 'prog_done_sentence', 'prog_done_unheld', 'prog_done_text', 'prog_refuse_exit'],
    run(m, dir, h) {
      const root = makeRoot(h);
      const ok = run(dir, root, ['done', '--item', 'P-3=A planted sentence.', '--item', 'P-1=Another planted sentence.']);
      const after = snap(root);
      const unheld = run(dir, root, ['done', '--item', 'P-99=Nothing.']);
      const attributed = run(dir, root, ['done', '--item', `P-2=${SAID}`]);
      return h.assertAll([
        ['two items are set done', ok.status === 0 && /P-3 is done/.test(ok.stdout) && /P-1 is done/.test(ok.stdout), out(ok)],
        ['each item holds the state and its own sentence', entryOf(root, 'P-3').includes('State: done.') && entryOf(root, 'P-3').includes('Done: A planted sentence.')
          && entryOf(root, 'P-1').includes('State: done.') && entryOf(root, 'P-1').includes('Done: Another planted sentence.'), `${entryOf(root, 'P-1')} | ${entryOf(root, 'P-3')}`],
        ['the sentence stands under the repository line', /Plan: none\.\n\nDone: Another planted sentence\.\n\nAcceptance: first\./.test(entryOf(root, 'P-1')), entryOf(root, 'P-1')],
        ['an item not named is left open', entryOf(root, 'P-2').includes('State: open.') && !entryOf(root, 'P-2').includes('Done:'), entryOf(root, 'P-2')],
        ['an item the program does not hold is refused with nothing written', unheld.status === 1 && /P-99 is not an item of the program/.test(unheld.stdout) && snap(root) === after, out(unheld)],
        ['a sentence that attributes a message to a person is refused with nothing written and without quoting it', attributed.status === 1 && /the sentence of P-2 matches /.test(attributed.stdout) && !/go ahead/.test(attributed.stdout) && snap(root) === after, out(attributed)],
      ]);
    },
  },
  {
    name: 'step 199: the file verb gives each finding the next free key past the found folder and past the program, writes its file ending with its last line and its item in the program, raises both counts, and files nothing twice',
    guards: ['prog_file_found_folder', 'prog_file_items', 'prog_file_counts_items', 'prog_file_counts_findings', 'prog_file_last_line', 'prog_file_twice', 'prog_refuse_exit'],
    run(m, dir, h) {
      const root = makeRoot(h, { found: [4, 8], key: 5 });
      const file = join(h.tmp('prog-find-'), 'findings.json');
      writeFileSync(file, JSON.stringify([
        { text: 'the planted finding reads a thing it should not. More words follow.', kind: 'Fix in', files: ['a.mjs', 'b/c.md'], sentence: 'Read the thing as it is.', goal: 3, acceptance: 'the planted acceptance.' },
        { text: 'a second planted finding with no place', kind: 'not-placed', sentence: 'No file names it.', goal: 6, acceptance: 'a second acceptance.' },
      ]));
      const first = run(dir, root, ['file', file]);
      const after = snap(root);
      const prog = readFileSync(join(root, 'PROGRAM.md'), 'utf8');
      const f9 = existsSync(join(root, 'found', 'Q-HUB-9.md')) ? readFileSync(join(root, 'found', 'Q-HUB-9.md'), 'utf8') : '';
      const f10 = existsSync(join(root, 'found', 'Q-HUB-10.md')) ? readFileSync(join(root, 'found', 'Q-HUB-10.md'), 'utf8') : '';
      const second = run(dir, root, ['file', file]);
      return h.assertAll([
        ['the run files two findings', first.status === 0 && /Q-HUB-9, P-11, the planted finding/.test(first.stdout) && /Q-HUB-10, P-12, a second planted finding/.test(first.stdout), out(first)],
        ['the first key is past the found folder, which holds a higher number than the program', f9.startsWith('Q-HUB-9: the planted finding reads a thing it should not. More words follow.\n\n'), f9],
        ['a finding with files ends with its kind, its files as code spans and its sentence', f9.endsWith('\n\nFix in: `a.mjs`, `b/c.md`. Read the thing as it is.\n'), f9],
        ['a finding with no files ends with its kind and its sentence', f10 === 'Q-HUB-10: a second planted finding with no place\n\nNot placed: No file names it.\n', f10],
        ['each item is appended with the next free program key, its goal and its acceptance', prog.includes('### P-11. Q-HUB-9: the planted finding reads a thing it should not\n\nRepository: hub. Goal: 3. State: open. Plan: none.\n\nAcceptance: the planted acceptance.\n\nDepends: none.\n')
          && prog.includes('### P-12. Q-HUB-10: a second planted finding with no place\n\nRepository: hub. Goal: 6. State: open. Plan: none.'), prog.slice(-700)],
        ['the items count is raised by two', /^14 items \(/m.test(prog), prog.slice(prog.indexOf('## Items'), prog.indexOf('## Items') + 140)],
        ['the findings count is raised by two', /and 6 findings, one for each key/.test(prog), prog.slice(prog.indexOf('## Items'), prog.indexOf('## Items') + 140)],
        ['a second run files nothing, names both as already filed and writes nothing', second.status === 0 && /already filed as Q-HUB-9/.test(second.stdout) && /already filed as Q-HUB-10/.test(second.stdout)
          && /0 filed/.test(second.stdout) && snap(root) === after && !existsSync(join(root, 'found', 'Q-HUB-11.md')), out(second)],
      ]);
    },
  },
  {
    name: 'step 199: the file verb reads the next free key from the program\'s own titles as well as from the found folder',
    guards: ['prog_file_program_titles'],
    run(m, dir, h) {
      const root = makeRoot(h, { found: [3], key: 7 });
      const file = join(h.tmp('prog-find-'), 'findings.json');
      writeFileSync(file, JSON.stringify({ findings: [{ text: 'a planted finding for the second root', kind: 'Not the repository\'s', sentence: 'Nothing here to change.', goal: 4, acceptance: 'an acceptance.' }] }));
      const r = run(dir, root, ['file', file]);
      return h.assertAll([
        ['the key is past the program\'s highest finding key', r.status === 0 && existsSync(join(root, 'found', 'Q-HUB-8.md')) && !existsSync(join(root, 'found', 'Q-HUB-4.md')), out(r)],
        ['the last line is of the kind named', readFileSync(join(root, 'found', 'Q-HUB-8.md'), 'utf8').endsWith('\n\nNot the repository\'s: Nothing here to change.\n'), readFileSync(join(root, 'found', 'Q-HUB-8.md'), 'utf8')],
      ]);
    },
  },
  {
    name: 'step 199: the file verb refuses the whole file, naming each entry and the class of each match and never quoting one, when an entry attributes a message to a person, carries a pronoun, or has a kind that is none of the four, and writes nothing',
    guards: ['prog_file_text_refusal', 'prog_text_privacy', 'prog_text_third', 'prog_refuse_exit'],
    run(m, dir, h) {
      const root = makeRoot(h);
      const before = snap(root);
      const file = join(h.tmp('prog-find-'), 'findings.json');
      writeFileSync(file, JSON.stringify([
        { text: `a finding where ${SAID}`, kind: 'Fix in', files: ['a.mjs'], sentence: 'Fix it.', goal: 3, acceptance: 'fixed.' },
        { text: 'a clean finding text', kind: 'Fix in', files: ['a.mjs'], sentence: `Fix it as ${PRON} asked.`, goal: 3, acceptance: 'fixed.' },
        { text: 'a third clean finding text', kind: 'bogus', sentence: 'Fix it.', goal: 3, acceptance: 'fixed.' },
      ]));
      const r = run(dir, root, ['file', file]);
      return h.assertAll([
        ['the run is refused', r.status === 1 && /nothing written/.test(r.stdout), out(r)],
        ['the attributing entry is named with the class of its match', /entry 1 \(a finding where\): text matches attribution pattern/.test(r.stdout), out(r)],
        ['the entry with a pronoun is named', /entry 2 \(a clean finding\): sentence matches third person pattern/.test(r.stdout), out(r)],
        ['the entry with an unknown kind is named', /entry 3 \(a third clean\) has a kind that is none of the four/.test(r.stdout), out(r)],
        ['no matched word is printed', !/go ahead/.test(r.stdout) && !/ asked/.test(r.stdout), r.stdout],
        ['nothing was written', snap(root) === before, out(r)],
      ]);
    },
  },
  {
    name: 'step 199: the measure verb writes one close entry under P-10 after the entries already there, with every figure copied from the cost instrument\'s print for the transcript, and refuses a transcript the instrument will not read, with nothing written',
    guards: ['prog_measure_writes', 'prog_measure_figures', 'prog_measure_turns', 'prog_measure_refuses', 'prog_refuse_exit'],
    run(m, dir, h) {
      const root = makeRoot(h);
      const L = (o) => JSON.stringify(o);
      const transcript = join(h.tmp('prog-ts-'), 'session.jsonl');
      writeFileSync(transcript, [
        L({ type: 'user', timestamp: '2026-11-01T01:03:00.000Z', message: { role: 'user', content: [{ type: 'tool_result', content: 'User has approved your plan. You can now start.\n\n## Approved Plan:\n# A close plan title\n\n## Item\n\nP-1 of the planted program.\n\n## Asked\n\nnothing' }] } }),
        L({ type: 'user', timestamp: '2026-11-01T01:04:00.000Z', origin: { kind: 'human' }, message: { role: 'user', content: 'carry on, go' } }),
        L({ type: 'assistant', timestamp: '2026-11-01T01:05:00.000Z', message: { id: 'plant-turn', role: 'assistant', model: 'model-x', usage: { input_tokens: 20, output_tokens: 40, cache_read_input_tokens: 200, cache_creation_input_tokens: 100 } } }),
      ].join('\n') + '\n');
      const printed = spawnSync('node', [join(dir, 'session-cost.mjs'), transcript], { encoding: 'utf8', timeout: 120000, maxBuffer: 64 * 1024 * 1024 });
      const before = snap(root);
      const r = run(dir, root, ['measure', transcript]);
      const p10 = entryOf(root, 'P-10');
      const gone = run(dir, root, ['measure', join(h.tmp('prog-gone-'), 'none.jsonl')]);
      const afterFirst = snap(root);
      return h.assertAll([
        ['the instrument prints the plant as one plan with one owner message and one turn of 40 output tokens', printed.status === 0 && /## Plan 1 \(P-1: A close plan title\)/.test(printed.stdout) && /Owner messages: 1 \(ending in a go-word: 1;/.test(printed.stdout) && /model-x: 1 turns \(1 entries\), input 20, output 40,/.test(printed.stdout), printed.stdout.slice(-1500)],
        ['the run writes the entry', r.status === 0 && /wrote the close entry of plan 1 under P-10/.test(r.stdout) && before !== afterFirst, out(r)],
        ['the entry opens with the plan\'s item and title', p10.includes('Close entry of the plan (P-1: A close plan title), from the cost instrument'), p10],
        ['the owner figures are the instrument\'s', p10.includes('- The owner\'s messages: 1 in the plan, of which 1 end in a go-word and 0 do not; none carries the whole word stop.'), p10],
        ['the turn figure is the instrument\'s output tokens', p10.includes('- Main-thread turns: 1 on model-x with 40 output tokens.'), p10],
        ['the entry stands after the earlier entry and before the item\'s closing line', p10.indexOf('- Compactions: 0.') < p10.indexOf('Close entry of the plan (') && p10.indexOf('Close entry of the plan (') < p10.indexOf('State: done; landed once.'), p10],
        ['a transcript the instrument will not read is refused with nothing written', gone.status === 1 && /the cost instrument refused the transcript/.test(gone.stdout) && snap(root) === afterFirst, out(gone)],
      ]);
    },
  },
  {
    name: 'step 199: the lesson verb writes the next lesson\'s file under its number and its row after the last row of the index, and refuses a gate file the hub does not hold, a judgement with no smell line and a body that attributes a message to a person, with nothing written',
    guards: ['prog_lesson_writes', 'prog_lesson_row', 'prog_lesson_gate', 'prog_lesson_number', 'prog_lesson_slug', 'prog_lesson_text', 'prog_refuse_exit'],
    run(m, dir, h) {
      const root = makeRoot(h);
      const bodyDir = h.tmp('prog-body-');
      const body = join(bodyDir, 'body.md');
      writeFileSync(body, '**Smell:** a planted smell.\n\n**What happened.** A planted account.\n');
      const badBody = join(bodyDir, 'bad.md');
      writeFileSync(badBody, `**Smell:** a planted smell.\n\n**What happened.** ${SAID}\n`);
      const noSmell = join(bodyDir, 'nosmell.md');
      writeFileSync(noSmell, '**What happened.** A planted account.\n');
      const ok = run(dir, root, ['lesson', '--title', 'A planted lesson\'s title', '--declaration', 'GATE hub:gate-x.mjs \u2014 a planted gate', '--body', body]);
      const file = join(root, 'lessons', '003-a-planted-lessons-title.md');
      const text = existsSync(file) ? readFileSync(file, 'utf8') : '';
      const index = readFileSync(join(root, 'LESSONS.md'), 'utf8');
      const after = snap(root);
      const noGate = run(dir, root, ['lesson', '--title', 'Another title', '--declaration', 'GATE hub:no-such-gate.mjs \u2014 none', '--body', body]);
      const judged = run(dir, root, ['lesson', '--title', 'Another title', '--declaration', 'JUDGEMENT', '--body', noSmell]);
      const attributed = run(dir, root, ['lesson', '--title', 'Another title', '--declaration', 'JUDGEMENT', '--body', badBody]);
      return h.assertAll([
        ['the run writes lesson 3', ok.status === 0 && /wrote lesson 3/.test(ok.stdout), out(ok)],
        ['the file is named by its padded number and its title without the apostrophe', existsSync(file), readdirSync(join(root, 'lessons')).join(', ')],
        ['the file opens with its heading, its declaration and its body', text === '## 3 \u00b7 A planted lesson\'s title\n\n**Enforced by:** GATE hub:gate-x.mjs \u2014 a planted gate\n\n**Smell:** a planted smell.\n\n**What happened.** A planted account.\n', text],
        ['the row stands directly after the last row and before the closing line', index.includes('- **\u00a72** \u2014 [Second lesson](lessons/002-second-lesson.md)\n- **\u00a73** \u2014 [A planted lesson\'s title](lessons/003-a-planted-lessons-title.md)\n\nA closing line.'), index],
        ['a gate file the hub does not hold is refused with nothing written', noGate.status === 1 && /no-such-gate\.mjs, a gate file the hub does not hold/.test(noGate.stdout) && snap(root) === after, out(noGate)],
        ['a judgement with no smell line is refused', judged.status === 1 && /needs a Smell line/.test(judged.stdout) && snap(root) === after, out(judged)],
        ['a body that attributes a message to a person is refused without quoting it', attributed.status === 1 && /the body matches /.test(attributed.stdout) && !/go ahead/.test(attributed.stdout) && snap(root) === after, out(attributed)],
      ]);
    },
  },
];

export const plants = {
  prog_claim_sets: ['=> `State: planned. Plan: ${title}.`', '=> `State: open. Plan: ${title}.`', 'program.mjs'],
  prog_claim_not_open: ['else if (e.state !== \'open\') causes.push(', 'else if (false) causes.push(', 'program.mjs'],
  prog_claim_unheld: ['if (!e) causes.push(`${k} is not an item of the program`);\n    else if (e.state', 'if (false) causes.push(`${k} is not an item of the program`);\n    else if (e?.state', 'program.mjs'],
  prog_usage: ['if (!verbs[verb]) {', 'if (false) {', 'program.mjs'],
  prog_refuse_exit: ['nothing written\\n`);\n  process.exit(1);', 'nothing written\\n`);\n  process.exit(0);', 'program.mjs'],
  prog_done_sets: ['lines[r] = lines[r].replace(/State:\\s*[\\w-]+\\./, \'State: done.\');', 'lines[r] = lines[r];', 'program.mjs'],
  prog_done_sentence: ['else lines.splice(r + 1, 0, \'\', `Done: ${s}`);', 'else lines.splice(r + 1, 0, \'\');', 'program.mjs'],
  prog_done_unheld: ['else if (!entries.some((e) => e.key === k)) causes.push(', 'else if (false) causes.push(', 'program.mjs'],
  prog_done_text: ['for (const f of textFaults(s)) causes.push(`the sentence of', 'for (const f of []) causes.push(`the sentence of', 'program.mjs'],
  prog_file_found_folder: ['for (const e of existing) nextFound = Math.max(nextFound, Number(e.key.slice(TAG.length + 1)));', '', 'program.mjs'],
  prog_file_program_titles: ['for (const m of progText.matchAll(/^### P-\\d+\\.\\s*Q-HUB-(\\d+)\\b/gm)) nextFound = Math.max(nextFound, Number(m[1]));', '', 'program.mjs'],
  prog_file_items: ['nextItem = Math.max(nextItem, e.n);', 'nextItem = 0;', 'program.mjs'],
  prog_file_counts_items: ['`${Number(n) + filed} items`', '`${Number(n)} items`', 'program.mjs'],
  prog_file_counts_findings: ['`${Number(n) + filed} findings`', '`${Number(n)} findings`', 'program.mjs'],
  prog_file_last_line: ['const last = `${label}: ${files ? `${files}. ` : \'\'}${f.sentence.trim()}`;', 'const last = `${label}: ${f.sentence.trim()}`;', 'program.mjs'],
  prog_file_twice: ['if (dup) { lines.push(', 'if (false) { lines.push(', 'program.mjs'],
  prog_file_text_refusal: ['for (const field of [\'text\', \'sentence\', \'acceptance\', \'title\'])', 'for (const field of [])', 'program.mjs'],
  prog_text_privacy: ['const classes = [[\'disclosure\', DISCLOSURE], [\'attribution\', ATTRIBUTION], [\'life\', OWNER_LIFE], [\'session link\', SESSION_LINKS], ', 'const classes = [', 'program.mjs'],
  prog_text_third: ['[\'third person\', [PRONOUN_G, POSSESSIVE_G, ATTRIBUTION_G]]', '[\'third person\', []]', 'program.mjs'],
  prog_measure_writes: ['lines.splice(at + 1, 0, \'\', ...entry);', 'lines.splice(at + 1, 0, \'\');', 'program.mjs'],
  prog_measure_figures: ['of which ${own[1]} end in a go-word', 'of which ${own[2]} end in a go-word', 'program.mjs'],
  prog_measure_turns: ['return m ? `${m[2]} on ${m[1]} with ${m[3]} output tokens` : x;', 'return m ? `${m[2]} on ${m[1]} with ${m[2]} output tokens` : x;', 'program.mjs'],
  prog_measure_refuses: ['/PLANTED COUNTS DO NOT MATCH|SKIPPED|REFUSED/.test(out)) causes.push(\'the cost instrument refused', '/PLANTED COUNTS DO NOT MATCH/.test(out)) causes.push(\'the cost instrument did not refuse', 'program.mjs'],
  prog_lesson_writes: ['write(root, join(P.lessons, name), text, wrote);', 'wrote.push(name);', 'program.mjs'],
  prog_lesson_row: ['rows.splice(lastRow + 1, 0, ', 'rows.splice(0, 0, ', 'program.mjs'],
  prog_lesson_gate: ['else if (g[1] === \'hub\' && !existsSync(join(root, g[2])))', 'else if (false)', 'program.mjs'],
  prog_lesson_number: ['const n = top + 1;', 'const n = 1;', 'program.mjs'],
  prog_lesson_slug: [".replace(/['’]/g, '')", '', 'program.mjs'],
  prog_lesson_text: ['for (const f of textFaults(s)) causes.push(`the ${n} matches ${f}`);', 'for (const f of []) causes.push(`the ${n} matches ${f}`);', 'program.mjs'],
};
