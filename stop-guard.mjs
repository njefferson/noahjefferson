#!/usr/bin/env node
// GOING QUIET IS A THING THE HARNESS CAN REFUSE. — 2026-08-22
//
// A session ended its turn saying it was waiting on something. Then it did it
// again. Then Doctrine §11c was written to forbid it and indexed in two
// CLAUDE.md files — and it happened a third time, in the same session that
// wrote the rule, on the sentence "I'm waiting on it".
//
// So this is not a fourth paragraph. §11c is words a session has to remember at
// the end of four hours; this is a `Stop` hook, which the harness runs whether
// anything was remembered or not. That distinction is the whole point, and it is
// the same one `branch-guard.mjs` is built on: a rule in a file never once
// stopped the commit it forbade.
//
// ## What it refuses
//
// TWO shapes, because the first version caught only one and would have lost the
// requirement behind the mechanism (LESSONS §96 — the defect where a need is
// answered as the thing somebody built for it).
//
//   1. WAITING. The turn ends saying something is still running.
//   2. PARKING. The turn ends asking to be told to continue — "let me know",
//      "want me to", "ready when you are". This is the ORIGINAL §11c incident:
//      phase four of eight finished, reported, and handed back for a nod. It
//      contains no waiting sentence at all, so shape 1 sails straight past it.
//
// Both are narrow by design: each needs its tell AND the absence of the
// declaration. A hook that fired on every turn would be noise inside a week,
// and noise gets switched off — which is a worse outcome than no hook.
//
// The way past it is either of the two honest things:
//
//   1. WAIT AND CONTINUE. The thing being waited on is a background task or a
//      CI run — poll it, read it, act on the result, and keep going. This is
//      what an approved plan means (§11c) and it is the expected route.
//   2. DECLARE THE STOP. Open the reply with "Stopping here, waiting on you for
//      X". §11c requires the FIRST line, because "I'll hold" at the end of a
//      long report reads as "I am continuing" — which is exactly how the
//      silences got discovered, by being asked what happened.
//
// Exit 2 blocks the stop and feeds stderr back as the next instruction.
// `stop_hook_active` is honoured so it can never loop.
//
//   node stop-guard.mjs        (reads the hook payload on stdin)

import { readFileSync } from 'node:fs';

/** The transcript is JSONL; the last assistant text is the reply just written. */
const lastAssistantText = (path) => {
  let text = '';
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let row;
    try { row = JSON.parse(line); } catch { continue; }
    const msg = row?.message;
    if (row?.type !== 'assistant' || !msg) continue;
    const parts = Array.isArray(msg.content) ? msg.content : [];
    const said = parts.filter((p) => p?.type === 'text').map((p) => p.text).join('\n').trim();
    if (said) text = said;           // keep the LAST one, not the first
  }
  return text;
};

/** Saying the work is not finished. Present tense only — "I waited for CI and
 *  it passed" is a report, not a hand-off, and must not be caught. */
const WAITING = [
  /\bwaiting (?:on|for)\b(?!\s+you\b)/i,
  /\b(?:still|currently) (?:running|going|in progress|queued|building|deploying)\b/i,
  /\bin flight\b/i,
  /\bI'?ll (?:check|read|look at|confirm|report|pick (?:it|this) up)\b/i,
  /\b(?:once|when|after) (?:it|that|the run|the spine|the deploy|CI) (?:finishes|completes|lands|goes green|is done)\b/i,
  /\bhas not (?:been read|finished|completed)\b/i,
  /\bwill (?:report|confirm|check) back\b/i,
];

/** Handing the turn back for permission. The original §11c shape: the work is
 *  not blocked on anything, it is just being parked for a nod. Anchored to the
 *  END of the reply, because "let me know if that reads wrong" mid-report is a
 *  courtesy and the same words as the last sentence are a hand-off. */
const PARKING = [
  /\b(?:let me know|tell me|say the word|just say)\b[^.?!]*(?:\bif\b|\bwhen\b|\band I(?:'| w)ll\b|\bto (?:continue|go on|proceed|carry on)\b)/i,
  /\b(?:want|would you like) me to (?:continue|go on|carry on|proceed|start|keep going|move on)\b/i,
  /\bshall I (?:continue|go on|carry on|proceed|start|keep going|move on)\b/i,
  /\bready (?:when you are|for (?:your|the) (?:go|word|nod))\b/i,
  /\b(?:happy to|I can) (?:continue|carry on|keep going|move on)[^.?!]*(?:if|when|whenever) you\b/i,
  /\bawaiting (?:your|the) (?:go|word|nod|instruction|direction)/i,
];

/** The declaration §11c requires, and it has to be the FIRST line. */
const DECLARED = /^\s*(?:[#*_>\s-]*)stopping here[,:]?\s*waiting on you\b/i;

let payload = '';
try { payload = readFileSync(0, 'utf8'); } catch { /* no stdin */ }

let hook = {};
try { hook = JSON.parse(payload || '{}'); } catch { /* not JSON */ }

// Already blocked once this turn. Never loop — the session gets one nudge.
if (hook.stop_hook_active) process.exit(0);

const path = hook.transcript_path;
if (!path) process.exit(0);

let reply = '';
try { reply = lastAssistantText(path); } catch { process.exit(0); }
if (!reply) process.exit(0);

// A declared stop is allowed, and is the whole point of having a way through.
if (DECLARED.test(reply)) process.exit(0);

// PARKING is judged on the LAST SENTENCE only, and that is not a nicety.
// "Let me know if that placement reads wrong — meanwhile I have started the
// tablet render" is a courtesy inside continuing work; the identical clause as
// the final thing said is a hand-off. A first version tested the last two
// paragraphs and refused that sentence, which is the false positive that
// teaches people to switch a guard off.
const sentences = reply.split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
const tail = sentences[sentences.length - 1] ?? '';

/** …and even in the last sentence it is not a hand-off if the same breath says
 *  work is proceeding. Splitting by sentence was not enough: "Let me know if
 *  that reads wrong — meanwhile I have started the tablet render" is ONE
 *  sentence carrying both halves, and refusing it is the false positive that
 *  gets a guard switched off. Parking means asking for permission with nothing
 *  in flight; if something is in flight, it is a courtesy. */
const CONTINUING = /\b(?:meanwhile|in the meantime|meantime|carrying on|moving on|next up I|I(?:'| ha)?ve (?:started|kicked off|begun)|I(?:'| wi)?ll (?:fold|carry on|keep going|continue|start|move on)|starting (?:on |the )?(?:the )?next|going on with)\b/i;

const waitHit = WAITING.find((re) => re.test(reply));
const parkHit = CONTINUING.test(tail) ? undefined : PARKING.find((re) => re.test(tail));
if (!waitHit && !parkHit) process.exit(0);

const hit = waitHit ?? parkHit;
const quote = ((waitHit ? reply : tail).match(hit) ?? [''])[0].trim().slice(0, 80);
const why = waitHit
  ? 'says the work is not finished'
  : 'hands the turn back for permission to continue';

process.stderr.write(`STOP REFUSED — this reply ${why} ("${quote}") and does not declare a stop.

Doctrine §11c. Ending a turn while the work is unfinished — still running, or
parked for a nod — is the failure that has now happened four times, twice after
it had been ruled out, and the owner has found out each time by asking what
happened.

Two ways forward, and only these two:

  1. CONTINUE. If something is running, poll it, read it, act on the result.
     If nothing is running, start the next piece. An approved plan is authority
     for ALL of its phases; a phase boundary is a seam in the work, not a
     checkpoint in the permission. This is the expected route and it is what
     was wanted in the first place.

  2. DECLARE IT — make the FIRST line of your reply, verbatim:
       Stopping here, waiting on you for <the specific thing>
     Not at the end. Not "I'll hold". The first line, or it reads as
     "I am continuing" and the silence gets discovered by being asked.

If there is genuinely nothing to wait for and nothing left to do, say what
landed and what is still owed — without a waiting sentence in it.
`);
process.exit(2);
