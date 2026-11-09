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
      h.assertAll([
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
      return true;
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
      if (wrong.length) throw new Error(`refused, and should pass: ${wrong.join('; ')}`);
      const said = ['I am waiting on you for the answer.', 'The step is waiting for you.', 'You owe me an answer.']
        .map((t) => [t, say(t)]);
      const missed = said.filter(([, r]) => r.status !== 2 || !/waited on or owe something/.test(r.stderr)).map(([t, r]) => `${JSON.stringify(t)} exit ${r.status}: ${r.stderr.split('\n')[0].slice(0, 100)}`);
      if (missed.length) throw new Error(`passed, and should be refused: ${missed.join('; ')}`);
      return true;
    },
  },
];

export const plants = {
  stop_faults_listed: ['  FAULTS.push({ message, reply, kind });\n', '  FAULTS.push({ message, reply, kind });\n  flushFaults();\n', 'stop-guard.mjs'],
  stop_faults_before_declared: ['ejectDeclared) finish();\n', 'ejectDeclared) process.exit(0);\n', 'stop-guard.mjs'],
  stop_faults_before_end: ["|| !underPlan) finish();\n", "|| !underPlan) process.exit(0);\n", 'stop-guard.mjs'],
  stop_faults_record: ["const kind = FAULTS.some((f) => f.kind === 'choice') ? 'choice' : FAULTS[0].kind;\n", "const kind = '';\n", 'stop-guard.mjs'],
  owing_waiting_negated: ["/(?<!\\b(?:not|never|no longer|nothing is|nothing was|nobody is|no one is|isn'?t|aren'?t|wasn'?t)\\s+)\\bwaiting (?:on|for) you\\b/i,\n", "/\\bwaiting (?:on|for) you\\b/i,\n", 'stop-guard.mjs'],
  owing_owe_negated: ["/\\byou owe\\b(?!\\s+(?:nothing|no\\b))/i,\n", "/\\byou owe\\b/i,\n", 'stop-guard.mjs'],
};
