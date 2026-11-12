// Cases and plants for stand-down.mjs and for the asks of the four hook entries that make it true (step 205 of the plan of 11 November).
// Shape: guard-cases/shape.mjs. Every folder, home, transcript and copy of the gates is written under a temporary folder from `h`.
//
// The suite sets HUB_STAND_DOWN_OFF before its first case, and while it is present the question answers no, so a run that does not clear
// it judges the old gates' code. A case that wants the answer yes clears it for the one hook it runs (`on`, `freed`) and names the folder
// the hook is launched in. Since the sixth act the answer is yes for every launch folder: `via: 'own'` for a folder whose own file is in
// force and `via: 'retired'` for any other. A control that names the old gates runs with the off variable present, as the suite does.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DAY = 24 * 60 * 60 * 1000;
/** The California date a number of days from now, year-month-day. */
const dateIn = (days) => new Date(Date.now() + days * DAY).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
/** The file's two lines, with the date given. */
const textFor = (until) => `until: ${until}\ntrial of the harness's own parts, plans/native-setup.md\n`;
/** Put a stand-down file under a folder's configuration folder and return the folder. */
const place = (folder, text) => {
  mkdirSync(join(folder, '.claude'), { recursive: true });
  writeFileSync(join(folder, '.claude', 'STAND-DOWN'), text);
  return folder;
};
/** An environment with the suite's off variable and any launch folder taken out, then `extra` put in. */
const freed = (extra = {}) => {
  const e = { ...process.env };
  delete e.HUB_STAND_DOWN_OFF;
  delete e.HUB_LAUNCH_DIR;
  delete e.CLAUDE_PROJECT_DIR;
  for (const [k, v] of Object.entries(extra)) { if (v === undefined) delete e[k]; else e[k] = v; }
  return e;
};
/** The extra environment of a call that clears the suite's off variable and nothing else (the world's own launch folder stands). */
const on = { HUB_STAND_DOWN_OFF: undefined };
/** Ask the module, in a child process started in `cwd` with `env`, the expression `expr` of its exports `m`. */
const ask = (dir, cwd, env, expr) => {
  const url = pathToFileURL(join(dir, 'stand-down.mjs')).href;
  const r = spawnSync('node', ['--input-type=module', '-e', `import * as m from ${JSON.stringify(url)}; console.log(JSON.stringify(${expr}));`], { cwd, env, encoding: 'utf8' });
  try { return JSON.parse(r.stdout); } catch { return { error: `${r.stdout}${r.stderr}` }; }
};
const said = (r) => `exit ${r.status}: ${r.stdout}${r.stderr}`.slice(0, 500);
const refusedBy = (r, re) => r.status === 2 && re.test(`${r.stdout}${r.stderr}`);
const POPUP_CALL = { tool_name: 'AskUserQuestion', tool_input: { questions: [{ question: 'Which one?', header: 'Pick', options: [{ label: 'a', description: 'a' }, { label: 'b', description: 'b' }], multiSelect: false }] } };
/**
 * Put beneath a launch folder a repository with its own hooks for a start, a prompt and a call, and a checkout of the hub (a repository with
 * the dispatcher's file and the doctrine's index at its top).
 * @param {string} launch  the launch folder.
 * @returns {{under: string, copy: string}} the two folders. The hook for a call refuses a payload that holds the words refuse-this-one.
 */
function beneath(launch) {
  const under = join(launch, 'beneath');
  mkdirSync(join(under, '.claude', 'hooks'), { recursive: true });
  spawnSync('git', ['init', '-q', under]);
  const hook = (event, file) => ({ [event]: [{ matcher: event === 'PreToolUse' ? '.*' : '*', hooks: [{ type: 'command', command: `$CLAUDE_PROJECT_DIR/.claude/hooks/${file}` }] }] });
  writeFileSync(join(under, '.claude', 'settings.json'), JSON.stringify({ hooks: { ...hook('SessionStart', 'hello.sh'), ...hook('UserPromptSubmit', 'prompt.sh'), ...hook('PreToolUse', 'refuse.sh') } }));
  writeFileSync(join(under, '.claude', 'hooks', 'hello.sh'), '#!/bin/sh\ncat > /dev/null\necho "BENEATH SAYS HELLO $HUB_LAUNCH_DIR"\nexit 0\n', { mode: 0o755 });
  writeFileSync(join(under, '.claude', 'hooks', 'prompt.sh'), '#!/bin/sh\ncat > /dev/null\necho "BENEATH PROMPT"\nexit 0\n', { mode: 0o755 });
  writeFileSync(join(under, '.claude', 'hooks', 'refuse.sh'), '#!/bin/sh\nif grep -q \'refuse-this-one\'; then\n  echo "BENEATH REFUSES THIS CALL" >&2\n  exit 2\nfi\nexit 0\n', { mode: 0o755 });
  const copy = join(launch, 'hubcopy');
  mkdirSync(copy, { recursive: true });
  spawnSync('git', ['init', '-q', copy]);
  writeFileSync(join(copy, 'hook-dispatch.mjs'), '// a stand-in for the dispatcher\n');
  writeFileSync(join(copy, 'DOCTRINE.md'), '# a stand-in for the doctrine\n');
  return { under, copy };
}

export const cases = [
  {
    name: 'step 205: the stand-down question answers via own only for a file of exactly its two lines, through the end of its date in California, read from the launch folder the hook is given and from no other; every other folder is via retired, and the suite\'s off variable makes it no',
    guards: ['sd_missing_folder', 'sd_date_end', 'sd_two_lines', 'sd_launch_alone', 'sd_launch_var', 'sd_off_variable'],
    async run(m, dir, h) {
      const mod = await import(pathToFileURL(join(dir, 'stand-down.mjs')).href + `?v=${Math.random()}`);
      const exact = "until: 2026-11-18\ntrial of the harness's own parts, plans/native-setup.md";
      const withEnd = mod.readLines(`${exact}\n`);
      const withoutEnd = mod.readLines(exact);
      const launch = place(h.tmp('sd-launch-'), textFor(dateIn(30)));
      const today = place(h.tmp('sd-today-'), textFor(dateIn(0)));
      const past = place(h.tmp('sd-past-'), textFor(dateIn(-3)));
      const words = place(h.tmp('sd-words-'), 'stand down please\nfor the trial\n');
      const empty = h.tmp('sd-empty-');
      const elsewhere = h.tmp('sd-elsewhere-');
      // The gates' own folder holds a file in force and the launch folder holds none: the copy of the hub in a container frees nothing.
      const gates = place(h.tmp('sd-gates-'), textFor(dateIn(30)));
      copyFileSync(join(dir, 'stand-down.mjs'), join(gates, 'stand-down.mjs'));
      // A file beneath the launch folder and one beside it free the launch folder not at all.
      const parent = h.tmp('sd-parent-');
      place(join(parent, 'beneath'), textFor(dateIn(30)));
      const row = h.tmp('sd-row-');
      mkdirSync(join(row, 'launch'));
      place(join(row, 'sibling'), textFor(dateIn(30)));
      const here = (cwd, env) => ask(dir, cwd, env, 'm.standDownHere()');
      const viaGates = (cwd, env) => ask(gates, cwd, env, 'm.standDownHere()');
      const inLaunch = here(elsewhere, freed({ CLAUDE_PROJECT_DIR: launch }));
      const onTheLastDay = here(elsewhere, freed({ CLAUDE_PROJECT_DIR: today }));
      const afterIt = here(elsewhere, freed({ CLAUDE_PROJECT_DIR: past }));
      /** The file of the launch folder is the answer. */
      const own = (r) => r?.inForce === true && r?.via === 'own';
      /** The old gates are retired and no file is the answer. */
      const retired = (r) => r?.inForce === true && r?.via === 'retired' && r?.until === null;
      return h.assertAll([
        ['the first line and the second line, with a line end after the second, read as in force until 2026-11-18', withEnd?.until === '2026-11-18' && withEnd?.reason === "trial of the harness's own parts, plans/native-setup.md", JSON.stringify(withEnd)],
        ['the same two lines with no line end after the second read the same', withoutEnd?.until === '2026-11-18' && withoutEnd?.reason === withEnd?.reason, JSON.stringify(withoutEnd)],
        ['three lines are not the file', mod.readLines(`${exact}\nand a third\n`) === null && mod.readLines(`${exact}\n\n`) === null, ''],
        ['a date with no space after the colon, a date that is no day and a blank reason are not the file',
          mod.readLines('until:2026-11-18\nreason') === null && mod.readLines('until: 2026-02-31\nreason') === null && mod.readLines('until: 2026-11-18\n   ') === null, ''],
        ['a file in force under the launch folder is via own, with its date', own(inLaunch) && inLaunch.until === dateIn(30), JSON.stringify(inLaunch)],
        ['a file dated today is via own: it runs through the end of its date', own(onTheLastDay), JSON.stringify(onTheLastDay)],
        ['a file whose date has passed is via retired, with no date', retired(afterIt), JSON.stringify(afterIt)],
        ['a file of other words is via retired', retired(here(elsewhere, freed({ CLAUDE_PROJECT_DIR: words }))), JSON.stringify(here(elsewhere, freed({ CLAUDE_PROJECT_DIR: words })))],
        ['a folder with no file is via retired, and the reason names the record', retired(here(elsewhere, freed({ CLAUDE_PROJECT_DIR: empty }))) && here(elsewhere, freed({ CLAUDE_PROJECT_DIR: empty })).reason === 'the old gates are retired (plans/native-setup.md)', JSON.stringify(here(elsewhere, freed({ CLAUDE_PROJECT_DIR: empty })))],
        ['a hook given no project folder is via retired even when the folder it runs in holds a file in force', retired(here(launch, freed())), JSON.stringify(here(launch, freed()))],
        ['a file only in the folder the gates sit in is not the launch folder\'s own', retired(viaGates(gates, freed({ CLAUDE_PROJECT_DIR: elsewhere }))), JSON.stringify(viaGates(gates, freed({ CLAUDE_PROJECT_DIR: elsewhere })))],
        ['a file beneath the launch folder is not the launch folder\'s own', retired(here(join(parent, 'beneath'), freed({ CLAUDE_PROJECT_DIR: parent }))), JSON.stringify(here(join(parent, 'beneath'), freed({ CLAUDE_PROJECT_DIR: parent })))],
        ['a file in a folder beside the launch folder is not the launch folder\'s own', retired(here(join(row, 'sibling'), freed({ CLAUDE_PROJECT_DIR: join(row, 'launch') }))), JSON.stringify(here(join(row, 'sibling'), freed({ CLAUDE_PROJECT_DIR: join(row, 'launch') })))],
        ['a launch folder the dispatcher names takes the place of the project folder: a project folder with a file is via retired when the named launch folder has none', retired(here(launch, freed({ CLAUDE_PROJECT_DIR: launch, HUB_LAUNCH_DIR: elsewhere }))), JSON.stringify(here(launch, freed({ CLAUDE_PROJECT_DIR: launch, HUB_LAUNCH_DIR: elsewhere })))],
        ['an empty launch folder is via retired', retired(here(launch, freed({ CLAUDE_PROJECT_DIR: launch, HUB_LAUNCH_DIR: '' }))), JSON.stringify(here(launch, freed({ CLAUDE_PROJECT_DIR: launch, HUB_LAUNCH_DIR: '' })))],
        ['a launch folder with a file is via own with no project folder at all', own(here(elsewhere, freed({ HUB_LAUNCH_DIR: launch }))), JSON.stringify(here(elsewhere, freed({ HUB_LAUNCH_DIR: launch })))],
        ['the off variable makes a file in force no', here(elsewhere, freed({ CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: 'suite' })).inForce === false, JSON.stringify(here(elsewhere, freed({ CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: 'suite' })))],
        ['the off variable makes a folder with no file no', here(elsewhere, freed({ CLAUDE_PROJECT_DIR: empty, HUB_STAND_DOWN_OFF: 'suite' })).inForce === false, JSON.stringify(here(elsewhere, freed({ CLAUDE_PROJECT_DIR: empty, HUB_STAND_DOWN_OFF: 'suite' })))],
      ]);
    },
  },
  {
    name: 'step 205: with a stand-down in force the dispatcher lets a main-thread read of a source file, an agent sent with free words, a call made while a message waits, a write outside an approved plan and a call after a message with no go-word through and prints nothing, and each is refused with the off variable present; a push to another branch and the choice popup are still refused, a prompt prints the one line alone, and a start, a settings change and a model switch print nothing',
    guards: ['sd_ask_dispatch', 'sd_stand_push', 'sd_stand_popup', 'sd_stand_line'],
    run(m, dir, h) {
      const when = dateIn(30);
      const w = h.world(dir);
      place(w.cwd, textFor(when));
      const src = h.repo({ 'app.ts': 'export const x = 1;\n' }, 'standfix');
      const probe = (cw, extra, env) => cw.call('PreToolUse', { session_id: h.sid('sd'), ...extra }, env);
      const SRC = { tool_name: 'Read', tool_input: { file_path: join(src.dir, 'app.ts') } };
      const FREE = { tool_name: 'Agent', tool_input: { prompt: `${w.plan} step 1, and tidy up after`, subagent_type: 'general-purpose' } };
      const controlRead = probe(w, SRC);
      const standRead = probe(w, SRC, on);
      const controlAgent = probe(w, FREE);
      const standAgent = probe(w, FREE, on);
      // A message waits in the queue.
      const waiting = h.world(dir, [h.turn(0, h.GO), h.enq(10, h.ASK)]);
      place(waiting.cwd, textFor(when));
      const PLANREAD = { tool_name: 'Read', tool_input: { file_path: waiting.plan } };
      const controlWait = probe(waiting, PLANREAD);
      const standWait = probe(waiting, PLANREAD, on);
      // The newest message the session was given ends with no go-word.
      const NOGO = 'Please change the toolbar colour to blue.';
      const corrected = h.world(dir, [h.turn(0, NOGO)]);
      place(corrected.cwd, textFor(when));
      const WRITE = { tool_name: 'Write', tool_input: { file_path: join(corrected.cwd, 'x.txt'), content: 'x' } };
      const controlCorrect = probe(corrected, WRITE);
      const standCorrect = probe(corrected, WRITE, on);
      const controlPrompt = corrected.call('UserPromptSubmit', { session_id: h.sid('sd'), prompt: NOGO });
      const standPrompt = corrected.call('UserPromptSubmit', { session_id: h.sid('sd'), prompt: NOGO }, on);
      // A write with no approved plan in the home.
      const home = h.tmp('sd-home-');
      mkdirSync(join(home, '.claude'), { recursive: true });
      const launchB = place(h.tmp('sd-launch-'), textFor(when));
      const bare = (event, payload, env = {}) => spawnSync('node', [join(dir, 'hook-dispatch.mjs'), event], {
        input: JSON.stringify({ cwd: launchB, transcript_path: h.transcript([h.turn(0, h.GO)]), hook_event_name: event, session_id: h.sid('sd'), ...payload }),
        encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: launchB, ...env } });
      const BARE_WRITE = { tool_name: 'Write', tool_input: { file_path: join(launchB, 'x.txt'), content: 'x' } };
      const controlBare = bare('PreToolUse', BARE_WRITE);
      const standBare = bare('PreToolUse', BARE_WRITE, on);
      // A push to another branch, a push to the branch that deploys, and the popup.
      const PUSH = { tool_name: 'Bash', tool_input: { command: 'git push origin feature-x' } };
      const POPUP = { tool_name: 'AskUserQuestion', tool_input: { questions: [{ question: 'Which one?', header: 'Pick', options: [{ label: 'a', description: 'a' }, { label: 'b', description: 'b' }], multiSelect: false }] } };
      const standPush = bare('PreToolUse', PUSH, on);
      const standStatus = bare('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'git status' } }, on);
      const standPopup = bare('PreToolUse', POPUP, on);
      const standAgentPopup = bare('PreToolUse', { agent_id: 'a1', ...POPUP }, on);
      // The start, a settings change and a model switch.
      const standStart = bare('SessionStart', { source: 'startup' }, on);
      const standConfig = bare('ConfigChange', { source: 'user_settings' }, on);
      const standSwitch = bare('PreModelSwitch', { from_model: 'one-model', to_model: 'another-model' }, on);
      const controlSwitch = bare('PreModelSwitch', { from_model: 'one-model', to_model: 'another-model' });
      const standPost = bare('PostToolUse', { tool_name: 'Bash', tool_input: { command: 'git status' }, tool_response: { stdout: '' } }, on);
      return h.assertAll([
        ['with the off variable present, a main-thread read of a source file is refused by the manager fence', refusedBy(controlRead, /MANAGER FENCE/), said(controlRead)],
        ['with the file the same read passes and prints nothing', standRead.status === 0 && `${standRead.stdout}${standRead.stderr}`.trim() === '', said(standRead)],
        ['with the off variable present, an agent sent with free words is refused by the dispatch gate', refusedBy(controlAgent, /DISPATCH GATE/), said(controlAgent)],
        ['with the file the agent sent with free words passes', standAgent.status === 0, said(standAgent)],
        ['with the off variable present, a call made while a message waits is held', controlWait.status === 2 && controlWait.stderr.includes(h.ASK), said(controlWait)],
        ['with the file the same call passes', standWait.status === 0 && `${standWait.stdout}${standWait.stderr}`.trim() === '', said(standWait)],
        ['with the off variable present, a write after a message with no go-word is refused', controlCorrect.status === 2, said(controlCorrect)],
        ['with the file the same write passes: a message with no go-word holds nothing', standCorrect.status === 0, said(standCorrect)],
        ['with the off variable present, the prompt prints the reminder', controlPrompt.status === 0 && /OWNER MESSAGE/.test(controlPrompt.stdout), said(controlPrompt)],
        ['with the file the prompt prints one line and nothing else', standPrompt.status === 0 && standPrompt.stdout.trim().split('\n').length === 1 && standPrompt.stdout.startsWith('STAND-DOWN IN FORCE') && !/OWNER MESSAGE/.test(standPrompt.stdout), said(standPrompt)],
        ['that line names the date it runs to and where the record is', standPrompt.stdout.includes(when) && standPrompt.stdout.includes('plans/native-setup.md'), standPrompt.stdout],
        ['with the off variable present, a write with no approved plan is refused', refusedBy(controlBare, /No approved plan is in force/), said(controlBare)],
        ['with the file the same write passes', standBare.status === 0 && `${standBare.stdout}${standBare.stderr}`.trim() === '', said(standBare)],
        ['a push to another branch is still refused by the push guard', refusedBy(standPush, /PUSH GATE/), said(standPush)],
        ['a read-only git command passes beside it', standStatus.status === 0, said(standStatus)],
        ['the choice popup is still refused on the main thread', refusedBy(standPopup, /CHOICE POPUP REFUSED/), said(standPopup)],
        ['the choice popup is still refused in an agent', refusedBy(standAgentPopup, /CHOICE POPUP REFUSED/), said(standAgentPopup)],
        ['a start prints nothing of the dispatcher\'s', standStart.status === 0 && standStart.stdout === '' && standStart.stderr === '', said(standStart)],
        ['a settings change prints nothing', standConfig.status === 0 && standConfig.stdout === '' && standConfig.stderr === '', said(standConfig)],
        ['with the off variable present, a model switch prints its cost line, and with the file it prints nothing', /Model switch/.test(controlSwitch.stdout) && standSwitch.stdout === '' && standSwitch.status === 0, `${said(controlSwitch)} | ${said(standSwitch)}`],
        ['the event after a tool call prints nothing', standPost.status === 0 && standPost.stdout === '' && standPost.stderr === '', said(standPost)],
      ]);
    },
  },
  {
    name: 'step 205: a file whose date has passed, a file of other words, no file, a file only in the folder the gates run from and a file beneath the launch folder each leave the session retired and not stood down, and the old gates refuse the same read while the suite\'s variable is present, a file in force or not; the dispatcher tells every child the launch folder',
    guards: ['sd_launch_alone', 'sd_dispatch_launch_dir'],
    run(m, dir, h) {
      const src = h.repo({ 'app.ts': 'export const x = 1;\n' }, 'standfix');
      const SRC = { tool_name: 'Read', tool_input: { file_path: join(src.dir, 'app.ts') } };
      const read = (cw, env) => cw.call('PreToolUse', { session_id: h.sid('sd'), ...SRC }, env);
      const prompt = (cw, env) => cw.call('UserPromptSubmit', { session_id: h.sid('sd'), prompt: 'Please look at the toolbar.' }, env);
      const RETIRED = /^THE HUB'S OLD GATES ARE RETIRED\./;
      const isRetired = (r) => r.status === 0 && RETIRED.test(r.stdout) && !/STAND-DOWN IN FORCE/.test(r.stdout) && r.stdout.trim().split('\n').length === 1;
      const inForce = h.world(dir);
      place(inForce.cwd, textFor(dateIn(30)));
      const passed = h.world(dir);
      place(passed.cwd, textFor(dateIn(-3)));
      const other = h.world(dir);
      place(other.cwd, 'stand down please\nfor the trial\n');
      const none = h.world(dir);
      const beneath = h.world(dir);
      place(join(beneath.cwd, 'inner'), textFor(dateIn(30)));
      const present = h.world(dir);
      place(present.cwd, textFor(dateIn(30)));
      // The folder the gates run from holds a file in force; the launch folder holds none.
      const gates = h.tmp('sd-gates-');
      for (const f of h.FILES) { if (!f.startsWith('guard-cases/')) h.copyGuard(join(dir, f), join(gates, f)); }
      place(gates, textFor(dateIn(30)));
      const lone = h.world(dir);
      const fromGatesOn = (event, extra) => spawnSync('node', [join(gates, 'hook-dispatch.mjs'), event], {
        cwd: gates, input: JSON.stringify({ cwd: lone.cwd, transcript_path: lone.tr, hook_event_name: event, session_id: h.sid('sd'), ...extra }),
        encoding: 'utf8', env: freed({ HOME: lone.home, CLAUDE_PROJECT_DIR: lone.cwd }) });
      const fromGates = fromGatesOn('PreToolUse', SRC);
      const fromGatesPrompt = fromGatesOn('UserPromptSubmit', { prompt: 'Please look at the toolbar.' });
      const fromGatesOff = spawnSync('node', [join(gates, 'hook-dispatch.mjs'), 'PreToolUse'], {
        cwd: gates, input: JSON.stringify({ cwd: lone.cwd, transcript_path: lone.tr, hook_event_name: 'PreToolUse', session_id: h.sid('sd'), ...SRC }),
        encoding: 'utf8', env: freed({ HOME: lone.home, CLAUDE_PROJECT_DIR: lone.cwd, HUB_STAND_DOWN_OFF: 'suite' }) });
      // A repository beneath the launch folder, wired with a hook that records the launch folder it was told.
      const wl = h.world(dir);
      const under = join(wl.cwd, 'beneath');
      mkdirSync(join(under, '.claude', 'hooks'), { recursive: true });
      spawnSync('git', ['init', '-q', under]);
      writeFileSync(join(under, '.claude', 'settings.json'), JSON.stringify({ hooks: { PreToolUse: [{ matcher: '.*', hooks: [{ type: 'command', command: '$CLAUDE_PROJECT_DIR/.claude/hooks/show-env.sh' }] }] } }));
      writeFileSync(join(under, '.claude', 'hooks', 'show-env.sh'), '#!/bin/sh\ncat > /dev/null\nprintf \'%s\' "$HUB_LAUNCH_DIR" > "$SD_OUT"\nexit 0\n', { mode: 0o755 });
      place(under, textFor(dateIn(30)));
      const seenFile = join(h.tmp('sd-seen-'), 'seen.txt');
      // The suite's variable stays present for this run, so the old gates' dispatcher runs and tells its children the launch folder.
      const ran = wl.call('PreToolUse', { session_id: h.sid('sd'), tool_name: 'Read', tool_input: { file_path: wl.plan } }, { SD_OUT: seenFile });
      let told = null;
      try { told = readFileSync(seenFile, 'utf8'); } catch { told = null; }
      const beneathAgain = read(wl, on);
      const quiet = (r) => r.status === 0 && `${r.stdout}${r.stderr}`.trim() === '';
      return h.assertAll([
        ['control: the file in force under the launch folder lets the read through and the prompt prints the stand-down\'s line', quiet(read(inForce, on)) && prompt(inForce, on).stdout.startsWith('STAND-DOWN IN FORCE'), `${said(read(inForce, on))} | ${said(prompt(inForce, on))}`],
        ['a file whose date has passed leaves the session retired: the read passes and the prompt prints the retired line alone', quiet(read(passed, on)) && isRetired(prompt(passed, on)), `${said(read(passed, on))} | ${said(prompt(passed, on))}`],
        ['a file of other words leaves the session retired', quiet(read(other, on)) && isRetired(prompt(other, on)), `${said(read(other, on))} | ${said(prompt(other, on))}`],
        ['no file leaves the session retired', quiet(read(none, on)) && isRetired(prompt(none, on)), `${said(read(none, on))} | ${said(prompt(none, on))}`],
        ['a file beneath the launch folder leaves the session retired', quiet(read(beneath, on)) && isRetired(prompt(beneath, on)), `${said(read(beneath, on))} | ${said(prompt(beneath, on))}`],
        ['a file in force while the suite\'s variable is present leaves the read refused by the old gates', refusedBy(read(present, { HUB_STAND_DOWN_OFF: 'suite' }), /MANAGER FENCE/), said(read(present, { HUB_STAND_DOWN_OFF: 'suite' }))],
        ['with no file the suite\'s variable leaves the read refused by the old gates', refusedBy(read(none, { HUB_STAND_DOWN_OFF: 'suite' }), /MANAGER FENCE/), said(read(none, { HUB_STAND_DOWN_OFF: 'suite' }))],
        ['a file only in the folder the gates run from leaves the session retired, not stood down', quiet(fromGates) && isRetired(fromGatesPrompt), `${said(fromGates)} | ${said(fromGatesPrompt)}`],
        ['a file only in the folder the gates run from leaves the read refused by the old gates while the suite\'s variable is present', refusedBy(fromGatesOff, /MANAGER FENCE/), said(fromGatesOff)],
        ['the hook of a repository beneath the launch folder was run on a call that passed', ran.status === 0, said(ran)],
        ['that hook was told the launch folder and not its own', told === wl.cwd, `told ${JSON.stringify(told)}, launch folder ${wl.cwd}`],
        ['a file in a repository beneath the launch folder frees the launch folder not at all: the session is retired', quiet(beneathAgain), said(beneathAgain)],
      ]);
    },
  },
  {
    name: 'step 205: the stop guard lets a stop through with a stand-down in force and for a folder with no file, and refuses the same reply while the suite\'s off variable is present',
    guards: ['sd_ask_stop_guard'],
    run(m, dir, h) {
      const env = h.underPlanEnv();
      const launch = place(h.tmp('sd-stop-'), textFor(dateIn(30)));
      const noFile = h.tmp('sd-stop-none-');
      const REPLY = 'I am waiting on you for the next decision.';
      const say = (extra) => spawnSync('node', [join(dir, 'stop-guard.mjs')], {
        input: JSON.stringify({ session_id: h.sid('sd'), transcript_path: h.transcript([h.turn(0, h.GO), h.reply(5, REPLY)]) }), encoding: 'utf8', env: { ...env, ...extra } });
      const control = say({ CLAUDE_PROJECT_DIR: noFile, HUB_STAND_DOWN_OFF: 'suite' });
      const retired = say({ CLAUDE_PROJECT_DIR: noFile, HUB_STAND_DOWN_OFF: undefined });
      const stand = say({ CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: undefined });
      const off = say({ CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: 'suite' });
      return h.assertAll([
        ['with the off variable present and no file the reply is refused as before', refusedBy(control, /waited on or owe something/), said(control)],
        ['with no file the stop passes and prints nothing: the old gates are retired', retired.status === 0 && retired.stdout === '' && retired.stderr === '', said(retired)],
        ['with the file the stop passes and prints nothing', stand.status === 0 && stand.stdout === '' && stand.stderr === '', said(stand)],
        ['with the file and the suite\'s variable present the reply is refused', refusedBy(off, /waited on or owe something/), said(off)],
      ]);
    },
  },
  {
    name: 'step 205: the plan guard passes every call with a stand-down in force, the approval call for any plan file and a write in plan mode among them, refuses the choice popup in and out of plan mode, passes the same calls for a folder with no file, and refuses them while the suite\'s off variable is present; its check mode does not stand down',
    guards: ['sd_ask_plan_guard', 'sd_plan_popup'],
    run(m, dir, h) {
      const w = h.world(dir, [h.turn(0, h.GO)]);
      const launch = place(h.tmp('sd-plan-'), textFor(dateIn(30)));
      const noFile = h.tmp('sd-plan-none-');
      const junk = join(h.tmp('sd-junk-'), 'junk.md');
      writeFileSync(junk, '# Junk\n\nNothing here is a plan at all.\n');
      const guard = (extra, env = {}) => spawnSync('node', [join(dir, 'plan-guard.mjs')], {
        input: JSON.stringify({ session_id: h.sid('sd'), cwd: w.cwd, transcript_path: w.tr, hook_event_name: 'PreToolUse', ...extra }),
        encoding: 'utf8', env: { ...process.env, HOME: w.home, ...env } });
      const WRITE = { permission_mode: 'plan', tool_name: 'Write', tool_input: { file_path: join(w.cwd, 'x.txt'), content: 'x' } };
      const EXIT = { permission_mode: 'plan', tool_name: 'ExitPlanMode', tool_input: { planFilePath: junk } };
      const POPUP = { tool_name: 'AskUserQuestion', tool_input: { questions: [{ question: 'Which one?', header: 'Pick', options: [{ label: 'a', description: 'a' }, { label: 'b', description: 'b' }], multiSelect: false }] } };
      const standEnv = { CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: undefined };
      const noEnv = { CLAUDE_PROJECT_DIR: noFile, HUB_STAND_DOWN_OFF: 'suite' };
      const retiredEnv = { CLAUDE_PROJECT_DIR: noFile, HUB_STAND_DOWN_OFF: undefined };
      const clean = (extra) => { const e = { ...process.env, HOME: w.home, CLAUDE_CODE_SESSION_ID: '' }; for (const [k, v] of Object.entries(extra)) { if (v === undefined) delete e[k]; else e[k] = v; } return e; };
      const controlWrite = guard(WRITE, noEnv);
      const standWrite = guard(WRITE, standEnv);
      const controlExit = guard(EXIT, noEnv);
      const standExit = guard(EXIT, standEnv);
      const retiredWrite = guard(WRITE, retiredEnv);
      const retiredExit = guard(EXIT, retiredEnv);
      const retiredPopup = guard({ permission_mode: 'plan', ...POPUP }, retiredEnv);
      const planPopup = guard({ permission_mode: 'plan', ...POPUP }, standEnv);
      const plainPopup = guard({ permission_mode: 'default', ...POPUP }, standEnv);
      const check = spawnSync('node', [join(dir, 'plan-guard.mjs'), '--check', junk], { encoding: 'utf8', env: clean({ CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: undefined }) });
      return h.assertAll([
        ['with the off variable present, a write in plan mode is refused', refusedBy(controlWrite, /PLAN MODE/), said(controlWrite)],
        ['with the file the same write passes and prints nothing', standWrite.status === 0 && standWrite.stdout === '' && standWrite.stderr === '', said(standWrite)],
        ['with the off variable present, the approval call for a file that is no plan is refused', controlExit.status === 2, said(controlExit)],
        ['with the file the approval call for the same file passes', standExit.status === 0 && standExit.stdout === '' && standExit.stderr === '', said(standExit)],
        ['for a folder with no file the same write passes and prints nothing: the old gates are retired', retiredWrite.status === 0 && retiredWrite.stdout === '' && retiredWrite.stderr === '', said(retiredWrite)],
        ['for a folder with no file the approval call for the same file passes', retiredExit.status === 0 && retiredExit.stdout === '' && retiredExit.stderr === '', said(retiredExit)],
        ['for a folder with no file the choice popup is refused in plan mode', refusedBy(retiredPopup, /CHOICE POPUP REFUSED/), said(retiredPopup)],
        ['the choice popup is refused in plan mode with the file in force',refusedBy(planPopup, /CHOICE POPUP REFUSED/), said(planPopup)],
        ['the choice popup is refused outside plan mode with the file in force', refusedBy(plainPopup, /CHOICE POPUP REFUSED/), said(plainPopup)],
        ['the check mode still finds the faults of a file that is no plan', check.status === 1, said(check)],
      ]);
    },
  },
  {
    name: 'step 205: with a stand-down in force the session brief prints the line on a stale working copy, the line on the branch and one line saying the stand-down is in force, until which date and where the record is, and nothing else; for a folder with no file it prints the branch lines and the retirement\'s line and nothing else; with the suite\'s off variable present the whole brief prints',
    guards: ['sd_ask_session_brief'],
    run(m, dir, h) {
      const hub = h.tmp('sd-brief-hub-');
      copyFileSync(join(dir, 'session-brief.mjs'), join(hub, 'session-brief.mjs'));
      copyFileSync(join(dir, 'stand-down.mjs'), join(hub, 'stand-down.mjs'));
      const origin = h.repo({ 'a.txt': '1\n' });
      const clone = join(h.tmp('sd-brief-clone-'), 'cloned');
      spawnSync('git', ['clone', '-q', origin.dir, clone], { encoding: 'utf8' });
      origin.write('b.txt', '2\n');
      origin.g('add', '-A');
      origin.g('commit', '-q', '-m', 'the remote moves on');
      const when = dateIn(30);
      const run = (env) => spawnSync('node', [join(hub, 'session-brief.mjs'), '--repo', clone], { cwd: clone, input: '', encoding: 'utf8', timeout: 60000, env });
      place(clone, textFor(when));
      const stand = run(freed({ CLAUDE_PROJECT_DIR: clone }));
      const off = run(freed({ CLAUDE_PROJECT_DIR: clone, HUB_STAND_DOWN_OFF: 'suite' }));
      const nofile = run(freed({ CLAUDE_PROJECT_DIR: h.tmp('sd-brief-none-') }));
      const so = `${stand.stdout}${stand.stderr}`;
      const oo = `${off.stdout}${off.stderr}`;
      const no = `${nofile.stdout}${nofile.stderr}`;
      return h.assertAll([
        ['the stale working copy is called stale', /CLONED IS STALE — 1 commit/.test(so), so],
        ['the branch line is printed', /^BRANCH: on /m.test(so), so],
        ['the stand-down line is printed with its date and the record', /^STAND-DOWN IN FORCE/m.test(so) && so.includes(when) && so.includes('plans/native-setup.md'), so],
        ['nothing else of the brief is printed', !/LESSONS|REPOS|THE OWNER'S CORE ASKS|THE DOCTRINE|HOW TO WRITE BACK/.test(so), so],
        ['the stand-down line is the last line', so.trim().split('\n').pop().startsWith('STAND-DOWN IN FORCE'), so],
        ['for a folder with no file the stale working copy and the branch are printed and the retirement\'s line is the last line', /CLONED IS STALE — 1 commit/.test(no) && /^BRANCH: on /m.test(no) && no.trim().split('\n').pop().startsWith('THE HUB\'S OLD GATES ARE RETIRED.') && !/STAND-DOWN IN FORCE/.test(no), no],
        ['for a folder with no file nothing else of the brief is printed', !/LESSONS|REPOS|THE OWNER'S CORE ASKS|THE DOCTRINE|HOW TO WRITE BACK/.test(no), no],
        ['with the suite\'s variable present the whole brief prints and the line does not', /LESSONS/.test(oo) && /THE DOCTRINE/.test(oo) && !/STAND-DOWN IN FORCE/.test(oo) && !/OLD GATES ARE RETIRED/.test(oo), oo],
      ]);
    },
  },
  {
    name: 'sixth act: the stand-down question answers yes via retired for a folder with no file, via own with the old line word for word for a folder whose own file is in force, and no with the off variable; the retired line names the short page, the procedures and the roles under the folder the module sits in',
    guards: ['sd_retired_answer', 'sd_retired_line', 'sd_retired_dispatch'],
    run(m, dir, h) {
      const empty = h.tmp('sd6-empty-');
      const elsewhere = h.tmp('sd6-elsewhere-');
      const when = dateIn(30);
      const launch = place(h.tmp('sd6-launch-'), textFor(when));
      const hub = realpathSync(dir);
      const none = ask(dir, elsewhere, freed({ CLAUDE_PROJECT_DIR: empty }), 'm.standDownHere()');
      const noneLine = ask(dir, elsewhere, freed({ CLAUDE_PROJECT_DIR: empty }), 'm.standDownLine(m.standDownHere())');
      const own = ask(dir, elsewhere, freed({ CLAUDE_PROJECT_DIR: launch }), 'm.standDownHere()');
      const ownLine = ask(dir, elsewhere, freed({ CLAUDE_PROJECT_DIR: launch }), 'm.standDownLine(m.standDownHere())');
      const off = ask(dir, elsewhere, freed({ CLAUDE_PROJECT_DIR: empty, HUB_STAND_DOWN_OFF: 'suite' }), 'm.standDownHere()');
      const bare = ask(dir, elsewhere, freed(), 'm.standDownLine({ until: "2026-12-01", reason: "a reason" })');
      const RETIRED_LINE = `THE HUB'S OLD GATES ARE RETIRED. Work goes as the short page says: ${hub}/plans/native/page.md. `
        + `The procedures and the roles are files under ${hub}/plans/native/skills and ${hub}/plans/native/roles. `
        + 'The push guard, the check before a push and the refusal of the choice popup stay.';
      const OWN_LINE = `STAND-DOWN IN FORCE: the hub's gates stand down for this session through the end of ${when} (California); reason: trial of the harness's own parts, plans/native-setup.md. `
        + 'The record of the design is plans/native-setup.md in the hub. Deleting .claude/STAND-DOWN brings every gate back; the push guard and the refusal of the choice popup stay throughout.';
      return h.assertAll([
        ['a folder with no file is yes via retired, with no date and the reason naming the record', JSON.stringify(none) === JSON.stringify({ inForce: true, until: null, reason: 'the old gates are retired (plans/native-setup.md)', via: 'retired' }), JSON.stringify(none)],
        ['the retired line is the one line, word for word', noneLine === RETIRED_LINE, JSON.stringify(noneLine)],
        ['the retired line names the short page, the procedures and the roles', typeof noneLine === 'string' && noneLine.includes(`${hub}/plans/native/page.md`) && noneLine.includes(`${hub}/plans/native/skills`) && noneLine.includes(`${hub}/plans/native/roles`) && !noneLine.includes('\n'), JSON.stringify(noneLine)],
        ['a folder whose own file is in force is yes via own, with its date and reason', own.inForce === true && own.via === 'own' && own.until === when && own.reason === "trial of the harness's own parts, plans/native-setup.md", JSON.stringify(own)],
        ['the line for that answer is the stand-down\'s, word for word', ownLine === OWN_LINE, JSON.stringify(ownLine)],
        ['an answer that is not via retired keeps the stand-down\'s line', typeof bare === 'string' && bare.startsWith('STAND-DOWN IN FORCE: ') && bare.includes('2026-12-01'), JSON.stringify(bare)],
        ['the off variable answers no for a folder with no file', off.inForce === false, JSON.stringify(off)],
      ]);
    },
  },
  {
    name: 'sixth act: for a launch folder with no stand-down file the dispatcher passes a main-thread Bash read and prints nothing, refuses the choice popup, refuses a push to a branch other than staging and main and a push of staging with no checker\'s pass, and prints the retired line alone at a prompt and at a start of the main thread',
    guards: ['sd_retired_answer', 'sd_retired_line', 'sd_retired_dispatch', 'sd_ask_dispatch'],
    run(m, dir, h) {
      const w = h.world(dir);
      const sid = h.sid('sd6');
      const pre = (extra) => w.call('PreToolUse', { session_id: sid, ...extra }, on);
      const r = h.repo({ 'a.txt': '1\n' });
      r.g('checkout', '-q', '-B', 'main');
      const read = pre({ tool_name: 'Bash', tool_input: { command: 'git status' } });
      const popup = pre(POPUP_CALL);
      const other = pre({ tool_name: 'Bash', tool_input: { command: 'git push origin feature-x' } });
      const staging = pre({ tool_name: 'Bash', tool_input: { command: 'git push origin HEAD:staging' }, cwd: r.dir });
      const prompt = w.call('UserPromptSubmit', { session_id: sid, prompt: 'Please look at the toolbar.' }, on);
      const start = w.call('SessionStart', { session_id: sid, source: 'startup' }, on);
      const agentStart = w.call('SessionStart', { session_id: sid, source: 'startup', agent_id: 'a1' }, on);
      const lines = (s) => s.trim().split('\n');
      return h.assertAll([
        ['a main-thread Bash read passes and prints nothing', read.status === 0 && `${read.stdout}${read.stderr}`.trim() === '', said(read)],
        ['the choice popup is refused', refusedBy(popup, /CHOICE POPUP REFUSED/), said(popup)],
        ['a push to a branch other than staging and main is refused by the push guard', refusedBy(other, /PUSH GATE/) && /Only staging and main reach a remote/.test(other.stderr), said(other)],
        ['a push of staging with no checker\'s pass is refused by the check before a push', refusedBy(staging, /PUSH GATE: PUSH CHECK: /) && staging.stderr.includes('No checker has passed that commit'), said(staging)],
        ['a prompt prints the retired line alone', prompt.status === 0 && lines(prompt.stdout).length === 1 && prompt.stdout.startsWith("THE HUB'S OLD GATES ARE RETIRED. Work goes as the short page says: "), said(prompt)],
        ['that line holds no reminder of an owner message', !/OWNER MESSAGE/.test(prompt.stdout), prompt.stdout],
        ['a start of the main thread prints the retired line', start.status === 0 && lines(start.stdout).pop().startsWith("THE HUB'S OLD GATES ARE RETIRED. "), said(start)],
        ['a start of an agent prints nothing', agentStart.status === 0 && agentStart.stdout === '' && agentStart.stderr === '', said(agentStart)],
      ]);
    },
  },
  {
    name: 'sixth act: for a launch folder with no stand-down file the dispatcher runs the own hooks of a repository beneath it, so a start prints what its start hook prints and a prompt what its prompt hook prints, a call its pre-call hook refuses is refused, and the hook is told the launch folder; a start brings forward a hub checkout beneath it',
    guards: ['sd_retired_own_hooks', 'sd_retired_bring_forward', 'sd_retired_launch_dir', 'sd_retired_dispatch'],
    run(m, dir, h) {
      const wl = h.world(dir);
      const { copy } = beneath(wl.cwd);
      const sid = h.sid('sd6');
      const start = wl.call('SessionStart', { session_id: sid, source: 'startup' }, on);
      const passed = wl.call('PreToolUse', { session_id: sid, tool_name: 'Bash', tool_input: { command: 'echo fine' } }, on);
      const refused = wl.call('PreToolUse', { session_id: sid, tool_name: 'Bash', tool_input: { command: 'echo refuse-this-one' } }, on);
      const prompt = wl.call('UserPromptSubmit', { session_id: sid, prompt: 'Please look at the toolbar.' }, on);
      const out = start.stdout;
      return h.assertAll([
        ['the start succeeds', start.status === 0, said(start)],
        ['the start hook of the repository beneath printed its words', out.includes('BENEATH SAYS HELLO'), said(start)],
        ['that hook was told the launch folder and not its own', out.includes(`BENEATH SAYS HELLO ${wl.cwd}`), said(start)],
        ['the retired line is printed', out.includes("THE HUB'S OLD GATES ARE RETIRED. "), said(start)],
        ['the copy of the hub beneath the launch folder was brought forward or looked at, and a line says so', out.includes(`HUB COPY (the hub checkout ${copy}):`), said(start)],
        ['the bring-forward line comes before the retired line', out.indexOf('HUB COPY') >= 0 && out.indexOf('HUB COPY') < out.indexOf('THE HUB\'S OLD GATES ARE RETIRED.'), said(start)],
        ['a call the repository\'s pre-call hook does not refuse passes', passed.status === 0 && passed.stderr === '', said(passed)],
        ['a call its pre-call hook refuses is refused with its words', refusedBy(refused, /BENEATH REFUSES/), said(refused)],
        ['a prompt prints the retired line and the words of the repository\'s prompt hook after it', prompt.status === 0 && prompt.stdout.includes("THE HUB'S OLD GATES ARE RETIRED. ") && prompt.stdout.includes('BENEATH PROMPT') && prompt.stdout.indexOf('BENEATH PROMPT') > prompt.stdout.indexOf('THE HUB\'S OLD GATES'), said(prompt)],
      ]);
    },
  },
  {
    name: 'sixth act: for a launch folder whose own stand-down file is in force the dispatcher runs none of the new behaviour: a start prints nothing, a repository beneath has no hook run and a call its hook would refuse passes, and a prompt prints the stand-down\'s line',
    guards: ['sd_retired_dispatch', 'sd_retired_own_hooks', 'sd_retired_bring_forward'],
    run(m, dir, h) {
      const wl = h.world(dir);
      place(wl.cwd, textFor(dateIn(30)));
      beneath(wl.cwd);
      const sid = h.sid('sd6');
      const start = wl.call('SessionStart', { session_id: sid, source: 'startup' }, on);
      const refusable = wl.call('PreToolUse', { session_id: sid, tool_name: 'Bash', tool_input: { command: 'echo refuse-this-one' } }, on);
      const prompt = wl.call('UserPromptSubmit', { session_id: sid, prompt: 'Please look at the toolbar.' }, on);
      return h.assertAll([
        ['a start prints nothing', start.status === 0 && start.stdout === '' && start.stderr === '', said(start)],
        ['a call the repository beneath would refuse passes: its hook is not run', refusable.status === 0 && refusable.stderr === '', said(refusable)],
        ['a prompt prints the stand-down\'s line alone', prompt.status === 0 && prompt.stdout.trim().split('\n').length === 1 && prompt.stdout.startsWith('STAND-DOWN IN FORCE'), said(prompt)],
      ]);
    },
  },
];

export const plants = {
  sd_retired_answer: ["  return { inForce: true, until: null, reason: 'the old gates are retired (plans/native-setup.md)', via: 'retired' };\n", '  return NO;\n', 'stand-down.mjs'],
  sd_retired_line: ["  if (sd?.via === 'retired') {\n", '  if (false) {\n', 'stand-down.mjs'],
  sd_retired_dispatch: ["  const retired = sd?.via === 'retired';\n", '  const retired = false;\n', 'hook-dispatch.mjs'],
  sd_retired_launch_dir: ["  if (retired) process.env.HUB_LAUNCH_DIR = process.env.CLAUDE_PROJECT_DIR ?? '';\n", '', 'hook-dispatch.mjs'],
  sd_retired_own_hooks: ["  const repos = touched(event, p, reposUnder(root));\n  const locked = event === 'PreToolUse' && repos.some((r) => existsSync(join(r, '.claude', 'PLAN-LOCK')));\n  const printed = [];", "  const repos = [];\n  const locked = event === 'PreToolUse' && repos.some((r) => existsSync(join(r, '.claude', 'PLAN-LOCK')));\n  const printed = [];", 'hook-dispatch.mjs'],
  sd_retired_bring_forward: ["    try { lines = bringForward(p, { root }); } catch { /* the start prints without the lines */ }\n", '', 'hook-dispatch.mjs'],
  sd_missing_folder: ["  if (typeof folder !== 'string' || !folder) return NO;\n", '', 'stand-down.mjs'],
  sd_date_end: ['return { inForce: californiaDate(now) <= rec.until, until: rec.until, reason: rec.reason };', 'return { inForce: californiaDate(now) < rec.until, until: rec.until, reason: rec.reason };', 'stand-down.mjs'],
  sd_two_lines: ["const lines = String(text).replace(/\\r?\\n$/, '').split(/\\r?\\n/);", 'const lines = String(text).split(/\\r?\\n/);', 'stand-down.mjs'],
  sd_launch_alone: ["try { text = readFileSync(join(folder, '.claude', 'STAND-DOWN'), 'utf8'); } catch { return NO; }", "try { text = readFileSync(join(process.cwd(), '.claude', 'STAND-DOWN'), 'utf8'); } catch { return NO; }", 'stand-down.mjs'],
  sd_launch_var: ['const folder = env[LAUNCH_VARIABLE] !== undefined ? env[LAUNCH_VARIABLE] : env.CLAUDE_PROJECT_DIR;', 'const folder = env.CLAUDE_PROJECT_DIR;', 'stand-down.mjs'],
  sd_off_variable: ['    if (env[OFF_VARIABLE] !== undefined) return NO;\n', '', 'stand-down.mjs'],
  sd_ask_dispatch: ['  if (standing.inForce) return standDownMain(event, raw, p, standing);\n', '', 'hook-dispatch.mjs'],
  sd_dispatch_launch_dir: ["  process.env.HUB_LAUNCH_DIR = process.env.CLAUDE_PROJECT_DIR ?? '';\n", '', 'hook-dispatch.mjs'],
  sd_stand_push: ["    if (o.deny) { process.stderr.write(o.reason + '\\n'); return 2; }\n    if (o.status !== 0 && !READS.has(tool)) {", "    if (false) { process.stderr.write(o.reason + '\\n'); return 2; }\n    if (o.status !== 0 && !READS.has(tool)) {", 'hook-dispatch.mjs'],
  sd_stand_popup: ["    if (tool === 'AskUserQuestion') {\n      process.stderr.write('CHOICE POPUP REFUSED", "    if (false) {\n      process.stderr.write('CHOICE POPUP REFUSED", 'hook-dispatch.mjs'],
  sd_stand_line: ["    const { standDownLine } = await import('./stand-down.mjs');\n", "    const standDownLine = () => '';\n", 'hook-dispatch.mjs'],
  sd_ask_plan_guard: ["  if (standing.inForce) {\n    if (tool === 'AskUserQuestion') {", "  if (false) {\n    if (tool === 'AskUserQuestion') {", 'plan-guard.mjs'],
  sd_plan_popup: ["    if (tool === 'AskUserQuestion') {\n      process.stdout.write(JSON.stringify({", "    if (false) {\n      process.stdout.write(JSON.stringify({", 'plan-guard.mjs'],
  sd_ask_stop_guard: [".inForce) process.exit(0);\n\nlet payload = '';", ".inForce) void 0;\n\nlet payload = '';", 'stop-guard.mjs'],
  sd_ask_session_brief: ['if (standing?.sd.inForce) {', 'if (false) {', 'session-brief.mjs'],
};
