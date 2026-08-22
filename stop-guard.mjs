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
// A turn that ENDS while saying it is waiting, without declaring the stop.
//
// That narrow shape is deliberate. Every real incident had the same two halves:
// the reply said something was still running, and the reply did not say
// "stopping here". Both halves are readable in the transcript, so both are
// checkable. A hook that fired on every turn would be noise inside a week, and
// noise gets switched off — which is a worse outcome than no hook.
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

const hit = WAITING.find((re) => re.test(reply));
if (!hit) process.exit(0);

const quote = (reply.match(hit) ?? [''])[0];

process.stderr.write(`STOP REFUSED — this reply says the work is not finished ("${quote}") and does not declare a stop.

Doctrine §11c. Ending a turn while something is still running is the failure
that has now happened four times, twice after it had been ruled out, and the
owner has found out each time by asking what happened.

Two ways forward, and only these two:

  1. WAIT AND CONTINUE — poll the background task or the CI run, read the
     result, act on it, and carry on with the plan's remaining work. This is
     the expected route. An approved plan is authority for all of it.

  2. DECLARE IT — make the FIRST line of your reply, verbatim:
       Stopping here, waiting on you for <the specific thing>
     Not at the end. Not "I'll hold". The first line, or it reads as
     "I am continuing" and the silence gets discovered by being asked.

If there is genuinely nothing to wait for and nothing left to do, say what
landed and what is still owed — without a waiting sentence in it.
`);
process.exit(2);
