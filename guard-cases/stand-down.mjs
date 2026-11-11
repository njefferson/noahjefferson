// Cases and plants for stand-down.mjs and for the asks of the four hook entries that make it true (step 205 of the plan of 11 November).
// Shape: guard-cases/shape.mjs. Every folder, home, transcript and copy of the gates is written under a temporary folder from `h`.
//
// The suite sets HUB_STAND_DOWN_OFF before its first case, so a run that does not clear it judges the gates with no stand-down. A case
// that wants the stand-down in force clears it for the one hook it runs (`on`, `freed`) and names the folder the hook is launched in.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

export const cases = [
  {
    name: 'step 205: the stand-down question is yes only for a file of exactly its two lines, through the end of its date in California, read from the launch folder the hook is given and from no other, and no while the suite\'s off variable is present',
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
      return h.assertAll([
        ['the first line and the second line, with a line end after the second, read as in force until 2026-11-18', withEnd?.until === '2026-11-18' && withEnd?.reason === "trial of the harness's own parts, plans/native-setup.md", JSON.stringify(withEnd)],
        ['the same two lines with no line end after the second read the same', withoutEnd?.until === '2026-11-18' && withoutEnd?.reason === withEnd?.reason, JSON.stringify(withoutEnd)],
        ['three lines are not the file', mod.readLines(`${exact}\nand a third\n`) === null && mod.readLines(`${exact}\n\n`) === null, ''],
        ['a date with no space after the colon, a date that is no day and a blank reason are not the file',
          mod.readLines('until:2026-11-18\nreason') === null && mod.readLines('until: 2026-02-31\nreason') === null && mod.readLines('until: 2026-11-18\n   ') === null, ''],
        ['a file in force under the launch folder is yes, with its date', inLaunch.inForce === true && inLaunch.until === dateIn(30), JSON.stringify(inLaunch)],
        ['a file dated today is yes: it runs through the end of its date', onTheLastDay.inForce === true, JSON.stringify(onTheLastDay)],
        ['a file whose date has passed is no, and names its date', afterIt.inForce === false && afterIt.until === dateIn(-3), JSON.stringify(afterIt)],
        ['a file of other words is no', here(elsewhere, freed({ CLAUDE_PROJECT_DIR: words })).inForce === false, JSON.stringify(here(elsewhere, freed({ CLAUDE_PROJECT_DIR: words })))],
        ['a folder with no file is no', here(elsewhere, freed({ CLAUDE_PROJECT_DIR: empty })).inForce === false, ''],
        ['a hook given no project folder is no even when the folder it runs in holds a file in force', here(launch, freed()).inForce === false, JSON.stringify(here(launch, freed()))],
        ['a file only in the folder the gates sit in frees a launch folder that has none', viaGates(gates, freed({ CLAUDE_PROJECT_DIR: elsewhere })).inForce === false, JSON.stringify(viaGates(gates, freed({ CLAUDE_PROJECT_DIR: elsewhere })))],
        ['a file beneath the launch folder frees the launch folder not at all', here(join(parent, 'beneath'), freed({ CLAUDE_PROJECT_DIR: parent })).inForce === false, ''],
        ['a file in a folder beside the launch folder frees it not at all', here(join(row, 'sibling'), freed({ CLAUDE_PROJECT_DIR: join(row, 'launch') })).inForce === false, ''],
        ['a launch folder the dispatcher names takes the place of the project folder: a project folder with a file is no when the named launch folder has none', here(launch, freed({ CLAUDE_PROJECT_DIR: launch, HUB_LAUNCH_DIR: elsewhere })).inForce === false, JSON.stringify(here(launch, freed({ CLAUDE_PROJECT_DIR: launch, HUB_LAUNCH_DIR: elsewhere })))],
        ['an empty launch folder is no', here(launch, freed({ CLAUDE_PROJECT_DIR: launch, HUB_LAUNCH_DIR: '' })).inForce === false, ''],
        ['a launch folder with a file is yes with no project folder at all', here(elsewhere, freed({ HUB_LAUNCH_DIR: launch })).inForce === true, JSON.stringify(here(elsewhere, freed({ HUB_LAUNCH_DIR: launch })))],
        ['the off variable makes a file in force no', here(elsewhere, freed({ CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: 'suite' })).inForce === false, JSON.stringify(here(elsewhere, freed({ CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: 'suite' })))],
      ]);
    },
  },
  {
    name: 'step 205: with a stand-down in force the dispatcher lets a main-thread read of a source file, an agent sent with free words, a call made while a message waits, a write outside an approved plan and a call after a message with no go-word through and prints nothing, and each is refused without it; a push to another branch and the choice popup are still refused, a prompt prints the one line alone, and a start, a settings change and a model switch print nothing',
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
        ['without the file a main-thread read of a source file is refused by the manager fence', refusedBy(controlRead, /MANAGER FENCE/), said(controlRead)],
        ['with the file the same read passes and prints nothing', standRead.status === 0 && `${standRead.stdout}${standRead.stderr}`.trim() === '', said(standRead)],
        ['without the file an agent sent with free words is refused by the dispatch gate', refusedBy(controlAgent, /DISPATCH GATE/), said(controlAgent)],
        ['with the file the agent sent with free words passes', standAgent.status === 0, said(standAgent)],
        ['without the file a call made while a message waits is held', controlWait.status === 2 && controlWait.stderr.includes(h.ASK), said(controlWait)],
        ['with the file the same call passes', standWait.status === 0 && `${standWait.stdout}${standWait.stderr}`.trim() === '', said(standWait)],
        ['without the file a write after a message with no go-word is refused', controlCorrect.status === 2, said(controlCorrect)],
        ['with the file the same write passes: a message with no go-word holds nothing', standCorrect.status === 0, said(standCorrect)],
        ['without the file the prompt prints the reminder', controlPrompt.status === 0 && /OWNER MESSAGE/.test(controlPrompt.stdout), said(controlPrompt)],
        ['with the file the prompt prints one line and nothing else', standPrompt.status === 0 && standPrompt.stdout.trim().split('\n').length === 1 && standPrompt.stdout.startsWith('STAND-DOWN IN FORCE') && !/OWNER MESSAGE/.test(standPrompt.stdout), said(standPrompt)],
        ['that line names the date it runs to and where the record is', standPrompt.stdout.includes(when) && standPrompt.stdout.includes('plans/native-setup.md'), standPrompt.stdout],
        ['without the file a write with no approved plan is refused', refusedBy(controlBare, /No approved plan is in force/), said(controlBare)],
        ['with the file the same write passes', standBare.status === 0 && `${standBare.stdout}${standBare.stderr}`.trim() === '', said(standBare)],
        ['a push to another branch is still refused by the push guard', refusedBy(standPush, /PUSH GATE/), said(standPush)],
        ['a read-only git command passes beside it', standStatus.status === 0, said(standStatus)],
        ['the choice popup is still refused on the main thread', refusedBy(standPopup, /CHOICE POPUP REFUSED/), said(standPopup)],
        ['the choice popup is still refused in an agent', refusedBy(standAgentPopup, /CHOICE POPUP REFUSED/), said(standAgentPopup)],
        ['a start prints nothing of the dispatcher\'s', standStart.status === 0 && standStart.stdout === '' && standStart.stderr === '', said(standStart)],
        ['a settings change prints nothing', standConfig.status === 0 && standConfig.stdout === '' && standConfig.stderr === '', said(standConfig)],
        ['without the file a model switch prints its cost line, and with the file it prints nothing', /Model switch/.test(controlSwitch.stdout) && standSwitch.stdout === '' && standSwitch.status === 0, `${said(controlSwitch)} | ${said(standSwitch)}`],
        ['the event after a tool call prints nothing', standPost.status === 0 && standPost.stdout === '' && standPost.stderr === '', said(standPost)],
      ]);
    },
  },
  {
    name: 'step 205: every gate stands as it is today with a file whose date has passed, a file of other words, no file, a file only in the folder the gates run from, a file beneath the launch folder, and a file in force under the launch folder while the suite\'s variable is present; the dispatcher tells every child the launch folder',
    guards: ['sd_launch_alone', 'sd_dispatch_launch_dir'],
    run(m, dir, h) {
      const src = h.repo({ 'app.ts': 'export const x = 1;\n' }, 'standfix');
      const SRC = { tool_name: 'Read', tool_input: { file_path: join(src.dir, 'app.ts') } };
      const read = (cw, env) => cw.call('PreToolUse', { session_id: h.sid('sd'), ...SRC }, env);
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
      const fromGates = spawnSync('node', [join(gates, 'hook-dispatch.mjs'), 'PreToolUse'], {
        cwd: gates, input: JSON.stringify({ cwd: lone.cwd, transcript_path: lone.tr, hook_event_name: 'PreToolUse', session_id: h.sid('sd'), ...SRC }),
        encoding: 'utf8', env: freed({ HOME: lone.home, CLAUDE_PROJECT_DIR: lone.cwd }) });
      // A repository beneath the launch folder, wired with a hook that records the launch folder it was told.
      const wl = h.world(dir);
      const under = join(wl.cwd, 'beneath');
      mkdirSync(join(under, '.claude', 'hooks'), { recursive: true });
      spawnSync('git', ['init', '-q', under]);
      writeFileSync(join(under, '.claude', 'settings.json'), JSON.stringify({ hooks: { PreToolUse: [{ matcher: '.*', hooks: [{ type: 'command', command: '$CLAUDE_PROJECT_DIR/.claude/hooks/show-env.sh' }] }] } }));
      writeFileSync(join(under, '.claude', 'hooks', 'show-env.sh'), '#!/bin/sh\ncat > /dev/null\nprintf \'%s\' "$HUB_LAUNCH_DIR" > "$SD_OUT"\nexit 0\n', { mode: 0o755 });
      place(under, textFor(dateIn(30)));
      const seenFile = join(h.tmp('sd-seen-'), 'seen.txt');
      const ran = wl.call('PreToolUse', { session_id: h.sid('sd'), tool_name: 'Read', tool_input: { file_path: wl.plan } }, { ...on, SD_OUT: seenFile });
      let told = null;
      try { told = readFileSync(seenFile, 'utf8'); } catch { told = null; }
      const beneathAgain = read(wl, on);
      return h.assertAll([
        ['control: the file in force under the launch folder lets the read through', read(inForce, on).status === 0, said(read(inForce, on))],
        ['a file whose date has passed leaves the read refused', refusedBy(read(passed, on), /MANAGER FENCE/), said(read(passed, on))],
        ['a file of other words leaves the read refused', refusedBy(read(other, on), /MANAGER FENCE/), said(read(other, on))],
        ['no file leaves the read refused', refusedBy(read(none, on), /MANAGER FENCE/), said(read(none, on))],
        ['a file beneath the launch folder leaves the read refused', refusedBy(read(beneath, on), /MANAGER FENCE/), said(read(beneath, on))],
        ['a file in force while the suite\'s variable is present leaves the read refused', refusedBy(read(present, { HUB_STAND_DOWN_OFF: 'suite' }), /MANAGER FENCE/), said(read(present, { HUB_STAND_DOWN_OFF: 'suite' }))],
        ['a file only in the folder the gates run from leaves the read refused', refusedBy(fromGates, /MANAGER FENCE/), said(fromGates)],
        ['the hook of a repository beneath the launch folder was run on a call that passed', ran.status === 0, said(ran)],
        ['that hook was told the launch folder and not its own', told === wl.cwd, `told ${JSON.stringify(told)}, launch folder ${wl.cwd}`],
        ['a file in a repository beneath the launch folder frees the launch folder not at all', refusedBy(beneathAgain, /MANAGER FENCE/), said(beneathAgain)],
      ]);
    },
  },
  {
    name: 'step 205: the stop guard lets a stop through with a stand-down in force and refuses the same reply without it',
    guards: ['sd_ask_stop_guard'],
    run(m, dir, h) {
      const env = h.underPlanEnv();
      const launch = place(h.tmp('sd-stop-'), textFor(dateIn(30)));
      const noFile = h.tmp('sd-stop-none-');
      const REPLY = 'I am waiting on you for the next decision.';
      const say = (extra) => spawnSync('node', [join(dir, 'stop-guard.mjs')], {
        input: JSON.stringify({ session_id: h.sid('sd'), transcript_path: h.transcript([h.turn(0, h.GO), h.reply(5, REPLY)]) }), encoding: 'utf8', env: { ...env, ...extra } });
      const control = say({ CLAUDE_PROJECT_DIR: noFile, HUB_STAND_DOWN_OFF: undefined });
      const stand = say({ CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: undefined });
      const off = say({ CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: 'suite' });
      return h.assertAll([
        ['without a file the reply is refused as today', refusedBy(control, /waited on or owe something/), said(control)],
        ['with the file the stop passes and prints nothing', stand.status === 0 && stand.stdout === '' && stand.stderr === '', said(stand)],
        ['with the file and the suite\'s variable present the reply is refused', refusedBy(off, /waited on or owe something/), said(off)],
      ]);
    },
  },
  {
    name: 'step 205: the plan guard passes every call with a stand-down in force, the approval call for any plan file and a write in plan mode among them, refuses the choice popup in and out of plan mode, and refuses the same calls without it; its check mode does not stand down',
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
      const noEnv = { CLAUDE_PROJECT_DIR: noFile, HUB_STAND_DOWN_OFF: undefined };
      const clean = (extra) => { const e = { ...process.env, HOME: w.home, CLAUDE_CODE_SESSION_ID: '' }; for (const [k, v] of Object.entries(extra)) { if (v === undefined) delete e[k]; else e[k] = v; } return e; };
      const controlWrite = guard(WRITE, noEnv);
      const standWrite = guard(WRITE, standEnv);
      const controlExit = guard(EXIT, noEnv);
      const standExit = guard(EXIT, standEnv);
      const planPopup = guard({ permission_mode: 'plan', ...POPUP }, standEnv);
      const plainPopup = guard({ permission_mode: 'default', ...POPUP }, standEnv);
      const check = spawnSync('node', [join(dir, 'plan-guard.mjs'), '--check', junk], { encoding: 'utf8', env: clean({ CLAUDE_PROJECT_DIR: launch, HUB_STAND_DOWN_OFF: undefined }) });
      return h.assertAll([
        ['without the file a write in plan mode is refused', refusedBy(controlWrite, /PLAN MODE/), said(controlWrite)],
        ['with the file the same write passes and prints nothing', standWrite.status === 0 && standWrite.stdout === '' && standWrite.stderr === '', said(standWrite)],
        ['without the file the approval call for a file that is no plan is refused', controlExit.status === 2, said(controlExit)],
        ['with the file the approval call for the same file passes', standExit.status === 0 && standExit.stdout === '' && standExit.stderr === '', said(standExit)],
        ['the choice popup is refused in plan mode with the file in force', refusedBy(planPopup, /CHOICE POPUP REFUSED/), said(planPopup)],
        ['the choice popup is refused outside plan mode with the file in force', refusedBy(plainPopup, /CHOICE POPUP REFUSED/), said(plainPopup)],
        ['the check mode still finds the faults of a file that is no plan', check.status === 1, said(check)],
      ]);
    },
  },
  {
    name: 'step 205: with a stand-down in force the session brief prints the line on a stale working copy, the line on the branch and one line saying the stand-down is in force, until which date and where the record is, and nothing else; without it the whole brief prints',
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
      const so = `${stand.stdout}${stand.stderr}`;
      const oo = `${off.stdout}${off.stderr}`;
      return h.assertAll([
        ['the stale working copy is called stale', /CLONED IS STALE — 1 commit/.test(so), so],
        ['the branch line is printed', /^BRANCH: on /m.test(so), so],
        ['the stand-down line is printed with its date and the record', /^STAND-DOWN IN FORCE/m.test(so) && so.includes(when) && so.includes('plans/native-setup.md'), so],
        ['nothing else of the brief is printed', !/LESSONS|REPOS|THE OWNER'S CORE ASKS|THE DOCTRINE|HOW TO WRITE BACK/.test(so), so],
        ['the stand-down line is the last line', so.trim().split('\n').pop().startsWith('STAND-DOWN IN FORCE'), so],
        ['with the suite\'s variable present the whole brief prints and the line does not', /LESSONS/.test(oo) && /THE DOCTRINE/.test(oo) && !/STAND-DOWN IN FORCE/.test(oo), oo],
      ]);
    },
  },
];

export const plants = {
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
