// Cases and plants of plan-guard.mjs and third-person-check.mjs written by step 158 of the plan of 9 November (the plan-check halves of
// Q-HUB-379 and Q-HUB-386, a plan drawn below the top tier, and the check of a call in plan mode). The shape is shape.mjs.
// Every plan, home, marker and transcript a case needs is written under a temporary folder, never into the working copy. The cases run the
// plan guard from a folder of their own (`hubCopy`): the folder the suite gives holds only the files its list names, and the guard loads
// third-person-check.mjs and binary-files.mjs beside itself, so those two are copied in from the folder given or, where it holds none, from the hub.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, utimesSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// The third-person pronoun, built from character codes: a string a case writes holds no word the third-person check reads as one.
const PRON = String.fromCharCode(104, 101);

/** A folder holding every file of the suite's list and the two files the guard loads for its title check. */
function hubCopy(dir, h) {
  const out = h.tmp('pg-hub-');
  for (const f of [...h.FILES, 'third-person-check.mjs', 'binary-files.mjs']) {
    const from = existsSync(join(dir, f)) ? join(dir, f) : join(h.HERE, f);
    try { mkdirSync(dirname(join(out, f)), { recursive: true }); copyFileSync(from, join(out, f)); } catch { /* not a file of this tree */ }
  }
  return out;
}

/** A write of the plan file by a reply of the main thread, with the model that wrote it (none when `model` is null). */
const writeBy = (h, file, model, secs, id) => ({ type: 'assistant', timestamp: h.later(secs),
  message: { role: 'assistant', ...(model ? { model } : {}), content: [{ type: 'tool_use', id, name: 'Write', input: { file_path: file, content: 'x' } }] } });

/**
 * The approval call on a plan text, as the harness makes it after the talk.
 * @param {string} hub  the folder the guard runs from.
 * @param {object} h  the suite's helpers.
 * @param {string} planText  the plan.
 * @param {string} projectDir  the launch directory.
 * @param {{entries?: (file: string) => object[], marker?: 'open'|'missing'|null}} [o]  transcript entries placed after plan mode was entered and
 *   before the talk (a function of the plan file's path), and the approval marker to leave in the home: 'open' names a plan with an Order,
 *   'missing' names a plan file that does not exist.
 * @returns {import('node:child_process').SpawnSyncReturns<string>} status 0 to allow, 2 with the reason in stdout.
 */
function runExit(hub, h, planText, projectDir, { entries = () => [], marker = null } = {}) {
  const home = h.tmp('pg-home-');
  mkdirSync(join(home, '.claude', 'plans'), { recursive: true });
  const file = join(home, '.claude', 'plans', 'tier-test.md');
  writeFileSync(file, planText);
  const t = (Date.now() - 1000 * 1000) / 1000;
  utimesSync(file, t, t);
  if (marker) {
    const named = marker === 'open' ? join(home, '.claude', 'plans', 'running.md') : join(home, '.claude', 'plans', 'gone.md');
    if (marker === 'open') writeFileSync(named, h.sendingPlan(hub));
    writeFileSync(join(home, '.claude', 'APPROVED-PLAN.json'), JSON.stringify({ plan: named, hash: 'a hash that no file has', at: new Date().toISOString() }));
  }
  return spawnSync('node', [join(hub, 'plan-guard.mjs')], {
    input: JSON.stringify({ session_id: h.sid('pg'), permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { planFilePath: file },
      transcript_path: h.transcript([h.turn(0, h.OWNER), ...h.enterPlan(-900), ...entries(file), h.at(h.reply(0, h.PLAN_TALK), h.later(-500)), h.owner(h.later(-400), 'ok')]), cwd: '/' }),
    encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: projectDir },
  });
}

/** The check mode on a plan text. */
function runCheck(hub, h, planText, projectDir) {
  const home = h.tmp('pg-check-');
  const file = join(home, 'check-test.md');
  writeFileSync(file, planText);
  return spawnSync('node', [join(hub, 'plan-guard.mjs'), '--check', file], { encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: projectDir, CLAUDE_CODE_SESSION_ID: '' } });
}

const refusedWith = (x, re) => x.status === 2 && re.test(x.stdout) && /PLAN SHAPE, NO LATCH/.test(x.stdout);

export const cases = [
  {
    name: 'step 158: a plan whose title holds a phrase the third-person check refuses (a pronoun, a possession of the owner, a finding verb bound to a person) is refused at the approval call with the mark that sets no latch and is printed by the check mode, and a title that names a role is not',
    guards: ['pg_title_wired', 'pg_title_possessive', 'pg_title_attribution', 'pg_title_pronoun'],
    run(m, dir, h) {
      const hub = hubCopy(dir, h);
      const r = h.repo({ 'a.txt': 'x\n' });
      const titled = (title) => h.sendingPlan(hub).replace('# Sending plan', `# ${title}`);
      const good = runExit(hub, h, titled('Move the export control to the toolbar edge'), r.dir);
      const pronoun = runExit(hub, h, titled(`Move the export control, as ${PRON} asked`), r.dir);
      const possessive = runExit(hub, h, titled('Move the export control onto the owner' + '\'s ' + 'data screen'), r.dir);
      const attribution = runExit(hub, h, titled('Move the export control that was caught ' + 'by the owner'), r.dir);
      const checked = runCheck(hub, h, titled(`Move the export control, as ${PRON} asked`), r.dir);
      return h.assertAll([
        ['a title that names a role passes', good.status === 0, `exit ${good.status}: ${String(good.stdout).slice(0, 300)}`],
        ['a title with a pronoun is refused with the mark that sets no latch', refusedWith(pronoun, /PLAN TITLE/), `exit ${pronoun.status}: ${pronoun.stdout}`],
        ['a title with a possession of the owner is refused', refusedWith(possessive, /PLAN TITLE/), `exit ${possessive.status}: ${possessive.stdout}`],
        ['a title with a finding verb bound to a person is refused', refusedWith(attribution, /PLAN TITLE/), `exit ${attribution.status}: ${attribution.stdout}`],
        ['the check mode prints the title fault and exits 1', checked.status === 1 && /PLAN TITLE/.test(checked.stdout), `exit ${checked.status}: ${checked.stdout}`],
      ]);
    },
  },
  {
    name: 'step 158: third-person-check.mjs exports the three patterns it scans with and scans nothing when it is imported, and still scans and fails a repository when it is run',
    guards: ['pg_tp_exports', 'pg_title_main_guard'],
    run(m, dir, h) {
      const hub = hubCopy(dir, h);
      const imported = spawnSync('node', ['--input-type=module', '-e',
        `import * as t from ${JSON.stringify(pathToFileURL(join(hub, 'third-person-check.mjs')).href)}; console.log('keys:' + Object.keys(t).sort().join(','));`], { encoding: 'utf8', timeout: 30000 });
      const dirty = h.repo({ 'a.md': `${PRON} wrote the note\n` });
      const clean = h.repo({ 'a.md': 'The note was written by the role.\n' });
      const runIt = (r) => spawnSync('node', [join(hub, 'third-person-check.mjs'), '--repo', r.dir], { encoding: 'utf8', timeout: 30000 });
      const ranDirty = runIt(dirty);
      const ranClean = runIt(clean);
      return h.assertAll([
        ['an import exits 0 and prints only the keys', imported.status === 0 && imported.stdout.trim() === 'keys:ATTRIBUTION_G,POSSESSIVE_G,PRONOUN_G', `exit ${imported.status}: ${imported.stdout}${imported.stderr}`],
        ['a run on a repository with a pronoun fails', ranDirty.status === 1 && /third-person reference/.test(ranDirty.stdout), `exit ${ranDirty.status}: ${ranDirty.stdout}${ranDirty.stderr}`],
        ['a run on a clean repository passes', ranClean.status === 0 && /no third-person references/.test(ranClean.stdout), `exit ${ranClean.status}: ${ranClean.stdout}${ranClean.stderr}`],
      ]);
    },
  },
  {
    name: 'step 158: a plan with a step that pulls the live clone is refused at the approval call and printed by the check mode unless that step follows every other step that writes files, read from the Order and its After line; a pull before or beside a writer is refused, a pull after one passes, and a pull beside steps that only read passes',
    guards: ['pg_pull_wired', 'pg_pull_follows', 'pg_pull_order_sequence', 'pg_pull_writers', 'pg_pull_readonly'],
    run(m, dir, h) {
      const hub = hubCopy(dir, h);
      const r = h.repo({ 'a.txt': 'x\n' });
      const WRITER = 'Edit the toolbar file with the Edit tool.';
      const READER = 'Read the toolbar file and report what it holds.';
      const PULLER = 'Pull the clone with git -C /root/.claude/hub pull origin main as the last act.';
      const landing = (order, after, writer) => h.sendingPlan(hub)
        .replace('Order: 1\nStanding: 2\n', `Order: ${order}\nStanding: 3\n${after ? `${after}\n` : ''}`)
        .replace('Served by: steps 1 and 2 serve goal 1.', 'Served by: steps 1, 2 and 3 serve goal 1.')
        .replace('1. **Build.** Make the toolbar change.', `1. **Build.** ${writer}`)
        .replace(/2\. \*\*Review\.\*\*/, `2. **Land.** ${PULLER}\n${h.LABELS}\n3. **Review.**`);
      const after = runExit(hub, h, landing('1 2', '', WRITER), r.dir);
      const afterLine = runExit(hub, h, landing('1 2', 'After: 2 after 1', WRITER), r.dir);
      const before = runExit(hub, h, landing('2 1', '', WRITER), r.dir);
      const beside = runExit(hub, h, landing('1 2', 'After: 1 after 2', WRITER), r.dir);
      const readers = runExit(hub, h, landing('2 1', '', READER), r.dir);
      const checked = runCheck(hub, h, landing('2 1', '', WRITER), r.dir);
      return h.assertAll([
        ['a pull that stands after the writer in the Order passes', after.status === 0, `exit ${after.status}: ${String(after.stdout).slice(0, 300)}`],
        ['a pull that follows the writer by its After line passes', afterLine.status === 0, `exit ${afterLine.status}: ${String(afterLine.stdout).slice(0, 300)}`],
        ['a pull that stands before the writer in the Order is refused', refusedWith(before, /PULL ORDER/), `exit ${before.status}: ${before.stdout}`],
        ['a pull that the After line does not make follow the writer is refused', refusedWith(beside, /PULL ORDER/), `exit ${beside.status}: ${beside.stdout}`],
        ['a pull before a step that only reads passes', readers.status === 0, `exit ${readers.status}: ${String(readers.stdout).slice(0, 300)}`],
        ['the check mode prints the pull fault and exits 1', checked.status === 1 && /PULL ORDER/.test(checked.stdout), `exit ${checked.status}: ${checked.stdout}`],
      ]);
    },
  },
  {
    name: 'step 158: a plan whose file was last written by a reply served below the top tier is refused at the approval call with the mark that sets no latch, unless an approved plan has a step of its Order open, and a top tier, a model that cannot be read, a write of another file and a newer write by the top tier raise no fault',
    guards: ['pg_tier_wired', 'pg_tier_top', 'pg_tier_open', 'pg_tier_last', 'pg_tier_marker', 'pg_tier_unknown', 'pg_tier_file'],
    run(m, dir, h) {
      const hub = hubCopy(dir, h);
      const r = h.repo({ 'a.txt': 'x\n' });
      const plan = h.sendingPlan(hub);
      const LOW = 'claude-sonnet-5-5';
      const TOP = 'claude-fable-5-1';
      const lowWrite = runExit(hub, h, plan, r.dir, { entries: (f) => [writeBy(h, f, LOW, -800, 'w1')] });
      const topWrite = runExit(hub, h, plan, r.dir, { entries: (f) => [writeBy(h, f, TOP, -800, 'w1')] });
      const lowThenTop = runExit(hub, h, plan, r.dir, { entries: (f) => [writeBy(h, f, LOW, -800, 'w1'), writeBy(h, f, TOP, -700, 'w2')] });
      const topThenLow = runExit(hub, h, plan, r.dir, { entries: (f) => [writeBy(h, f, TOP, -800, 'w1'), writeBy(h, f, LOW, -700, 'w2')] });
      const lowOpen = runExit(hub, h, plan, r.dir, { entries: (f) => [writeBy(h, f, LOW, -800, 'w1')], marker: 'open' });
      const lowMissing = runExit(hub, h, plan, r.dir, { entries: (f) => [writeBy(h, f, LOW, -800, 'w1')], marker: 'missing' });
      const noModel = runExit(hub, h, plan, r.dir, { entries: (f) => [writeBy(h, f, null, -800, 'w1')] });
      const otherFile = runExit(hub, h, plan, r.dir, { entries: (f) => [writeBy(h, join(f, '..', 'other.md'), LOW, -800, 'w1')] });
      const noWrite = runExit(hub, h, plan, r.dir);
      return h.assertAll([
        ['a plan last written by a reply below the top tier is refused with the mark that sets no latch', refusedWith(lowWrite, /PLAN TIER/), `exit ${lowWrite.status}: ${lowWrite.stdout}`],
        ['the refusal names the model', /claude-sonnet-5-5/.test(lowWrite.stdout), lowWrite.stdout],
        ['a plan last written by the top tier passes', topWrite.status === 0, `exit ${topWrite.status}: ${String(topWrite.stdout).slice(0, 300)}`],
        ['a lower write followed by a top-tier write passes: the last write decides', lowThenTop.status === 0, `exit ${lowThenTop.status}: ${String(lowThenTop.stdout).slice(0, 300)}`],
        ['a top-tier write followed by a lower write is refused', refusedWith(topThenLow, /PLAN TIER/), `exit ${topThenLow.status}: ${topThenLow.stdout}`],
        ['an approval marker naming a plan with a step open lets the lower tier amend', lowOpen.status === 0, `exit ${lowOpen.status}: ${String(lowOpen.stdout).slice(0, 300)}`],
        ['a marker naming a plan file that cannot be read is no plan with a step open', refusedWith(lowMissing, /PLAN TIER/), `exit ${lowMissing.status}: ${lowMissing.stdout}`],
        ['a write whose reply names no model raises no fault', noModel.status === 0, `exit ${noModel.status}: ${String(noModel.stdout).slice(0, 300)}`],
        ['a write of another file raises no fault', otherFile.status === 0, `exit ${otherFile.status}: ${String(otherFile.stdout).slice(0, 300)}`],
        ['a transcript with no write of the plan raises no fault', noWrite.status === 0, `exit ${noWrite.status}: ${String(noWrite.stdout).slice(0, 300)}`],
      ]);
    },
  },
  {
    name: 'step 158: in plan mode the plan guard passes the check of a call (hook-dispatch.mjs --can, one tool name and one argument) alone, and refuses it with anything chained to it, with another file\'s flag or with no argument',
    guards: ['pg_can_wired', 'pg_can_chained'],
    run(m, dir, h) {
      const hub = hubCopy(dir, h);
      const home = h.tmp('pg-can-');
      const bash = (command) => spawnSync('node', [join(hub, 'plan-guard.mjs')], {
        input: JSON.stringify({ session_id: h.sid('pc'), permission_mode: 'plan', tool_name: 'Bash', tool_input: { command }, cwd: home }),
        encoding: 'utf8', env: { ...process.env, HOME: home } });
      const line = `node ${join(hub, 'hook-dispatch.mjs')} --can Bash`;
      const alone = bash(`${line} "git status"`);
      const quoted = bash(`${line} 'git status'`);
      const path = bash(`node ${join(hub, 'hook-dispatch.mjs')} --can Read /tmp/some-file.txt`);
      const joined = bash(`${line} "git status" && git status`);
      const semi = bash(`${line} "git status"; ls`);
      const piped = bash(`${line} "git status" | cat`);
      const other = bash(`node ${join(hub, 'report.mjs')} --can Bash "git status"`);
      const bare = bash(`node ${join(hub, 'hook-dispatch.mjs')} --can Bash`);
      return h.assertAll([
        ['the check alone passes in plan mode', alone.status === 0, `exit ${alone.status}: ${alone.stdout}`],
        ['the check with a single-quoted argument passes', quoted.status === 0, `exit ${quoted.status}: ${quoted.stdout}`],
        ['the check of a read with a path passes', path.status === 0, `exit ${path.status}: ${path.stdout}`],
        ['the check joined to a command with && is refused', joined.status === 2, `exit ${joined.status}: ${joined.stdout}`],
        ['the check followed by a semicolon is refused', semi.status === 2, `exit ${semi.status}: ${semi.stdout}`],
        ['the check piped on is refused', piped.status === 2, `exit ${piped.status}: ${piped.stdout}`],
        ['another file given the same flag is refused', other.status === 2, `exit ${other.status}: ${other.stdout}`],
        ['the check with no argument is refused', bare.status === 2, `exit ${bare.status}: ${bare.stdout}`],
      ]);
    },
  },
];

export const plants = {
  pg_title_wired: ['  if (titled) fault(titled);\n', '\n', 'plan-guard.mjs'],
  pg_title_possessive: ['[patterns.PRONOUN_G, patterns.POSSESSIVE_G, patterns.ATTRIBUTION_G]', '[patterns.PRONOUN_G, patterns.ATTRIBUTION_G]', 'plan-guard.mjs'],
  pg_title_attribution: ['[patterns.PRONOUN_G, patterns.POSSESSIVE_G, patterns.ATTRIBUTION_G]', '[patterns.PRONOUN_G, patterns.POSSESSIVE_G]', 'plan-guard.mjs'],
  pg_title_pronoun: ['[patterns.PRONOUN_G, patterns.POSSESSIVE_G, patterns.ATTRIBUTION_G]', '[patterns.POSSESSIVE_G, patterns.ATTRIBUTION_G]', 'plan-guard.mjs'],
  pg_tp_exports: ['export const PRONOUN_G = /', 'const PRONOUN_G = /', 'third-person-check.mjs'],
  pg_title_main_guard: ['const isMain = !!process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);', 'const isMain = true;', 'third-person-check.mjs'],
  pg_pull_wired: ['  if (pulled) fault(pulled);\n', '\n', 'plan-guard.mjs'],
  pg_pull_follows: ['if (y === w) return true;', 'if (false) return true;', 'plan-guard.mjs'],
  pg_pull_order_sequence: ['return o.order.indexOf(w) < o.order.indexOf(p);', 'return true;', 'plan-guard.mjs'],
  pg_pull_writers: ['const WRITES = /\\b(?:Edit tool|Write tool|edits?|edited|git add|git commit)\\b/i;', 'const WRITES = /\\b(?:never matched here)\\b/i;', 'plan-guard.mjs'],
  pg_pull_readonly: ['!pullers.includes(n) && WRITES.test(body(n)))', '!pullers.includes(n))', 'plan-guard.mjs'],
  pg_tier_wired: ['  if (tiered) fault(tiered);\n', '\n', 'plan-guard.mjs'],
  pg_tier_top: ['if (!model || isTopTier(model) || open) return null;', 'if (!model || open) return null;', 'plan-guard.mjs'],
  pg_tier_open: ['if (!model || isTopTier(model) || open) return null;', 'if (!model || isTopTier(model)) return null;', 'plan-guard.mjs'],
  pg_tier_last: ['model = e.message?.model ?? null;', 'model = model ?? e.message?.model ?? null;', 'plan-guard.mjs'],
  pg_tier_marker: ['return !pointer || pointer.next !== null;', 'return false;', 'plan-guard.mjs'],
  pg_tier_unknown: ["return typeof model === 'string' && model.trim() && !/^<.*>$/.test(model.trim()) ? model.trim() : null;", "return model ?? 'a model nobody named';", 'plan-guard.mjs'],
  pg_tier_file: ['resolve(b.input.file_path) === want', 'true', 'plan-guard.mjs'],
  pg_can_wired: ['    if (isCanCommand(cmd)) process.exit(0);\n', '\n', 'plan-guard.mjs'],
  pg_can_chained: ['if (isCanCommand(cmd)) process.exit(0);', 'process.exit(0);', 'plan-guard.mjs'],
};
