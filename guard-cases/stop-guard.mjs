// The cases and plants of stop-guard.mjs written by step 123 of the plan of 8 November (Q-HUB-338 and Q-HUB-343). The shape is shape.mjs.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

export const cases = [
  {
    name: 'the stop guard lists every fault of a reply in one refusal: a reply that is sectioned under three bold headers, promises future conduct and tells the owner they are waited on gets one refusal naming all three, a declared stop and a reply with no waiting sentence are refused for their faults too, and a reply with one fault gets the one fault\'s own words',
    guards: ['stop_faults_listed', 'stop_faults_before_declared', 'stop_faults_before_end', 'stop_faults_record'],
    run(m, dir, h) {
      const env = h.underPlanEnv();
      const say = (text) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: h.sid('sf'), transcript_path: h.transcript([h.turn(0, h.GO), h.reply(5, text)]) }), encoding: 'utf8', env });
      const many = say('**Result**\nThe record is read.\n\n**Cause**\nThe line was long.\n\n**Fix**\nThe text is shorter.\n\nI promise the text is shorter. I am waiting on you for the next decision.');
      const declared = say('Stopping here: open for you is the choice below.\n\nI am waiting on you for the next decision.');
      const one = say('I am waiting on you for the next decision.');
      const clean = say('The record is read and the text is shorter.');
      // The record of the refusal keeps the choice kind when any fault is the choice not first, because the repeat check reads it.
      const recDir = h.tmp('sf-rec-');
      const recSession = h.sid('sr');
      const rec = spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: recSession, transcript_path: h.transcript([h.turn(0, h.GO), h.reply(5, 'Line one.\n\nLine two.\n\nLine three.\n\n1. Fix it (recommended)\n2. Leave it\n\nI am waiting on you for the next decision.')]) }), encoding: 'utf8', env: { ...env, STOP_REFUSED_DIR: recDir } });
      let recKind = '';
      try { recKind = JSON.parse(readFileSync(join(recDir, `${recSession}.json`), 'utf8')).kind; } catch (e) { recKind = `unreadable: ${e.message}`; }
      return h.assertAll([
        ['a choice fault beside another is listed and recorded as the choice kind', rec.status === 2 && /FAULT \d of 2: this reply's choice is not the first thing in it/.test(rec.stderr) && recKind === 'choice', `exit ${rec.status}, kind ${recKind}: ${rec.stderr}`],
        ['the reply with three faults is refused', many.status === 2, `exit ${many.status}: ${many.stderr}`],
        ['the refusal says how many faults it lists', /has 3 faults/.test(many.stderr), many.stderr],
        ['the bold headers are named', /FAULT \d of 3: this reply is sectioned under 3 bold headers/.test(many.stderr), many.stderr],
        ['the promise is named', /FAULT \d of 3: this reply promises future conduct/.test(many.stderr), many.stderr],
        ['the owing wording is named', /FAULT \d of 3: this reply tells the owner they are waited on or owe something/.test(many.stderr), many.stderr],
        ['the follow-up is stated once', many.stderr.split('a refusal cannot take it back').length === 2, many.stderr],
        ['a declared stop with a fault is refused', declared.status === 2 && /waited on or owe something/.test(declared.stderr), `exit ${declared.status}: ${declared.stderr}`],
        ['a reply with one fault gets its own words and no count', one.status === 2 && /^STOP REFUSED — this reply tells the owner they are waited on/.test(one.stderr) && !/faults, listed together/.test(one.stderr), `exit ${one.status}: ${one.stderr}`],
        ['a reply with no fault passes', clean.status === 0, `exit ${clean.status}: ${clean.stderr}`],
      ]);
    },
  },
  {
    name: 'the stop guard\'s owing refusal does not fire on a sentence that denies the wait (not waiting on you, nothing is waiting on you, you owe nothing) and still fires on the affirmative forms',
    guards: ['owing_waiting_negated', 'owing_owe_negated'],
    run(m, dir, h) {
      const env = h.underPlanEnv();
      const say = (text) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: h.sid('on'), transcript_path: h.transcript([h.turn(0, h.GO), h.reply(5, text)]) }), encoding: 'utf8', env });
      const denied = ['I am not waiting on you.', 'Nothing is waiting on you.', 'The step is not waiting for you.', 'You owe nothing here.', 'You owe no answer.']
        .map((t) => [t, say(t)]);
      const wrong = denied.filter(([, r]) => r.status !== 0).map(([t, r]) => `${JSON.stringify(t)} exit ${r.status}: ${r.stderr.split('\n')[0].slice(0, 100)}`);
      const said = ['I am waiting on you for the answer.', 'The step is waiting for you.', 'You owe me an answer.']
        .map((t) => [t, say(t)]);
      const missed = said.filter(([, r]) => r.status !== 2 || !/waited on or owe something/.test(r.stderr)).map(([t, r]) => `${JSON.stringify(t)} exit ${r.status}: ${r.stderr.split('\n')[0].slice(0, 100)}`);
      return h.assertAll([
        ['each sentence that denies the wait passes', wrong.length === 0, `refused, and should pass: ${wrong.join('; ')}`],
        ['each affirmative form is refused for the owing wording', missed.length === 0, `passed, and should be refused: ${missed.join('; ')}`],
      ]);
    },
  },
  {
    name: 'the stop guard passes the state line\'s forms and refuses the blame shapes: a reply under a standing correction ending with each fixed form passes, and waiting on you, you owe and the owner as the reason a thing stopped are each refused',
    guards: ['stop_state_blame_reason'],
    run(m, dir, h) {
      const env = h.underPlanEnv();
      const fix = 'Why did the restore skip 069? Answer before anything else.';
      const say = (text) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: h.sid('sl'), transcript_path: h.transcript([h.turn(0, fix), h.reply(5, text)]) }), encoding: 'utf8', env });
      const forms = [
        "State: paused, pending the owner's go-word.",
        'State: paused, pending the button on the plan.',
        "State: paused, pending the owner's answer to the choice above.",
        'State: running, step 134, nothing pending from the owner.',
        'State: finished, nothing pending from the owner.',
      ];
      // A finished state is refused while the session is paused, so the four paused and running forms are the passes.
      const passes = forms.slice(0, 4).map((f) => [f, say(`The line is changed.\n\n${f}`)]);
      const wrong = passes.filter(([, r]) => r.status !== 0).map(([f, r]) => `${JSON.stringify(f)} exit ${r.status}: ${r.stderr.split('\n')[0].slice(0, 120)}`);
      const blames = ['I am waiting on you for the answer.', 'You owe me the go-word.', 'The work stopped because of the owner.', 'The step is paused because you have not answered.']
        .map((t) => [t, say(`The line is changed. ${t}\n\n${forms[0]}`)]);
      const missed = blames.filter(([, r]) => r.status !== 2 || !/waited on or owe something/.test(r.stderr)).map(([t, r]) => `${JSON.stringify(t)} exit ${r.status}: ${r.stderr.split('\n')[0].slice(0, 120)}`);
      return h.assertAll([
        ['each fixed state form passes', wrong.length === 0, `refused, and should pass: ${wrong.join('; ')}`],
        ['each blame shape is refused for the owing wording', missed.length === 0, `passed, and should be refused: ${missed.join('; ')}`],
      ]);
    },
  },
  {
    name: 'the stop guard takes the stop declaration\'s new form, Stopping here then paused pending what lifts it, and still takes the older Stopping here open for you is for one release with a note saying so; a reply with neither is refused for its parking sentence',
    guards: ['stop_declared_new', 'stop_declared_old', 'stop_declared_old_note'],
    run(m, dir, h) {
      const env = h.underPlanEnv();
      const tail = 'Let me know if the page reads wrong and I will carry on.';
      const say = (text) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: h.sid('sd'), transcript_path: h.transcript([h.turn(0, h.GO), h.reply(5, text)]) }), encoding: 'utf8', env });
      const fresh = say(`Stopping here, then paused, pending the owner's go-word on the review.\n\nThe page is written.\n\n${tail}`);
      const older = say(`Stopping here: open for you is the choice below.\n\nThe page is written.\n\n${tail}`);
      const none = say(`The page is written.\n\n${tail}`);
      return h.assertAll([
        ['the new declaration passes', fresh.status === 0, `exit ${fresh.status}: ${fresh.stderr}`],
        ['the older declaration passes', older.status === 0, `exit ${older.status}: ${older.stderr}`],
        ['the older declaration passes with a note saying it is the older form', /older form, accepted for one release/.test(older.stderr), older.stderr],
        ['the new declaration carries no such note', !/older form/.test(fresh.stderr), fresh.stderr],
        ['a reply with neither declaration is refused for the parking sentence', none.status === 2 && /hands the turn back for permission/.test(none.stderr), `exit ${none.status}: ${none.stderr}`],
      ]);
    },
  },
  {
    name: 'the stop guard refuses a reply with no state line at its end, or a state that says nothing is pending while paused, or an open-for-you line saying nothing, once and among its other faults, in plan mode with no plan in force and under a standing correction, and does not fire when the state line is present or when the session is not paused on the owner',
    guards: ['stop_state_refusal', 'stop_state_planmode', 'stop_state_correction', 'stop_state_finished', 'stop_state_paused_nothing', 'stop_state_open_none'],
    run(m, dir, h) {
      const fix = 'Why did the restore skip 069? Answer before anything else.';
      const planEnv = h.underPlanEnv();
      const bareEnv = { ...process.env, HOME: h.tmp('sg-home-') };
      const run = (env, mode, entries) => spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: h.sid('ss'), permission_mode: mode, transcript_path: h.transcript(entries) }), encoding: 'utf8', env });
      const STATE = "State: paused, pending the owner's go-word.";
      const body = 'The line is changed.';
      const planNone = run(bareEnv, 'plan', [h.turn(0, h.GO), h.reply(5, body)]);
      const planWith = run(bareEnv, 'plan', [h.turn(0, h.GO), h.reply(5, `${body}\n\n${STATE}`)]);
      const notPlan = run(bareEnv, 'default', [h.turn(0, h.GO), h.reply(5, body)]);
      const corrNone = run(planEnv, 'default', [h.turn(0, fix), h.reply(5, body)]);
      const corrWith = run(planEnv, 'default', [h.turn(0, fix), h.reply(5, `${body}\n\n${STATE}`)]);
      const noCorr = run(planEnv, 'default', [h.turn(0, h.GO), h.reply(5, body)]);
      const finished = run(planEnv, 'default', [h.turn(0, fix), h.reply(5, `${body}\n\nState: finished, nothing pending from the owner.`)]);
      const pausedNothing = run(planEnv, 'default', [h.turn(0, fix), h.reply(5, `${body}\n\nState: paused, pending nothing from the owner.`)]);
      const openNone = run(planEnv, 'default', [h.turn(0, fix), h.reply(5, `${body}\n\nOpen for you: nothing.\n${STATE}`)]);
      const several = run(planEnv, 'default', [h.turn(0, fix), h.reply(5, `${body}\n\nOpen for you: none.\nI am waiting on you for the go-word.`)]);
      return h.assertAll([
        ['plan mode with no plan in force and no state line is refused with the forms named', planNone.status === 2 && /breaks the state line rule/.test(planNone.stderr) && /State: paused, pending the button on the plan/.test(planNone.stderr), `exit ${planNone.status}: ${planNone.stderr}`],
        ['plan mode with no plan in force and the state line passes', planWith.status === 0, `exit ${planWith.status}: ${planWith.stderr}`],
        ['a reply with no state line outside plan mode, with no correction, is not refused for it', notPlan.status === 0, `exit ${notPlan.status}: ${notPlan.stderr}`],
        ['a standing correction and no state line is refused', corrNone.status === 2 && /breaks the state line rule/.test(corrNone.stderr), `exit ${corrNone.status}: ${corrNone.stderr}`],
        ['a standing correction and the state line passes', corrWith.status === 0, `exit ${corrWith.status}: ${corrWith.stderr}`],
        ['no correction under the plan and no state line is not refused for it', noCorr.status === 0, `exit ${noCorr.status}: ${noCorr.stderr}`],
        ['a finished state while a correction stands is refused', finished.status === 2 && /says finished while the session is paused/.test(finished.stderr), `exit ${finished.status}: ${finished.stderr}`],
        ['a paused state saying nothing is pending is refused', pausedNothing.status === 2 && /paused and nothing is pending/.test(pausedNothing.stderr), `exit ${pausedNothing.status}: ${pausedNothing.stderr}`],
        ['an open-for-you line saying nothing is refused', openNone.status === 2 && /open-for-you line says nothing is open/.test(openNone.stderr), `exit ${openNone.status}: ${openNone.stderr}`],
        ['the faults of the reply are listed together in one refusal', several.status === 2 && /has 2 faults/.test(several.stderr) && /FAULT \d of 2: this reply tells the owner they are waited on or owe something/.test(several.stderr), `exit ${several.status}: ${several.stderr}`],
      ]);
    },
  },
];

export const plants = {
  stop_faults_listed: ['  FAULTS.push({ message, reply, kind });\n', '  FAULTS.push({ message, reply, kind });\n  flushFaults();\n', 'stop-guard.mjs'],
  stop_faults_before_declared: ['  finish();\n}\n\n// PARKING is judged', '  process.exit(0);\n}\n\n// PARKING is judged', 'stop-guard.mjs'],
  stop_faults_before_end: ["|| !underPlan) finish();\n", "|| !underPlan) process.exit(0);\n", 'stop-guard.mjs'],
  stop_faults_record: ["const kind = FAULTS.some((f) => f.kind === 'choice') ? 'choice' : FAULTS[0].kind;\n", "const kind = '';\n", 'stop-guard.mjs'],
  owing_waiting_negated: ["/(?<!\\b(?:not|never|no longer|nothing is|nothing was|nobody is|no one is|isn'?t|aren'?t|wasn'?t)\\s+)\\bwaiting (?:on|for) you\\b/i,\n", "/\\bwaiting (?:on|for) you\\b/i,\n", 'stop-guard.mjs'],
  owing_owe_negated: ["/\\byou owe\\b(?!\\s+(?:nothing|no\\b))/i,\n", "/\\byou owe\\b/i,\n", 'stop-guard.mjs'],
  stop_state_blame_reason: ["  /\\b(?:stopped|paused|held|blocked|stuck|stalled)\\s+(?:because|since)\\s+(?:of\\s+)?(?:you|the owner)\\b/i,\n", '', 'stop-guard.mjs'],
  stop_declared_new: ['const DECLARED = { test: (text) => DECLARED_NEW.test(text) || DECLARED_OLD.test(text) };\n', 'const DECLARED = { test: (text) => DECLARED_OLD.test(text) };\n', 'stop-guard.mjs'],
  stop_declared_old: ['const DECLARED = { test: (text) => DECLARED_NEW.test(text) || DECLARED_OLD.test(text) };\n', 'const DECLARED = { test: (text) => DECLARED_NEW.test(text) };\n', 'stop-guard.mjs'],
  stop_declared_old_note: ['is the older form, accepted for one release;', 'is accepted;', 'stop-guard.mjs'],
  stop_state_refusal: ['const stateFaults = pausedOnOwner ? stateLineFaults(reply) : [];\n', 'const stateFaults = [];\n', 'stop-guard.mjs'],
  stop_state_planmode: ["const pausedOnOwner = (String(hook.permission_mode ?? '') === 'plan' && noPlanInForce)\n", "const pausedOnOwner = (false && noPlanInForce)\n", 'stop-guard.mjs'],
  stop_state_correction: ['  || (underPlan && (!!correctionNow || opensWithChoice(reply)));\n', '  || (underPlan && (opensWithChoice(reply)));\n', 'stop-guard.mjs'],
  stop_state_finished: ['else if (/^[#*_>\\s-]*state\\b[:,]?\\s*(?:then\\s+)?finished\\b/i.test(end)) faults.push(', 'else if (false) faults.push(', 'stop-guard.mjs'],
  stop_state_paused_nothing: ['faults.push(`the state line says the session is paused and nothing is pending', 'void (`the state line says the session is paused and nothing is pending', 'stop-guard.mjs'],
  stop_state_open_none: ['if (none) faults.push(', 'if (false) faults.push(', 'stop-guard.mjs'],
};
