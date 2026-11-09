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
//   2. DECLARE THE STOP. Open the reply with "Stopping here: open for you is
//      X" ("waiting on you" is ruled out, LESSONS §370). §11c requires the FIRST line, because "I'll hold" at the end of a
//      long report reads as "I am continuing" — which is exactly how the
//      silences got discovered, by being asked what happened.
//
// Exit 2 blocks the stop and feeds stderr back as the next instruction.
// `stop_hook_active` is honoured so it can never loop.
//
// ## A REFUSAL CANNOT TAKE BACK THE REPLY (Doctrine §11c)
//
// A Stop refusal arrives after the reply was written, and the owner has already
// seen it. All it can do is hand the complaint back, so whatever the session
// writes next arrives as a SECOND reply. Measured 2026-10-04: two refusals, each
// for one sentence, and the whole reply was sent again both times. So every
// refusal here says the follow-up is the corrected sentences only, and when this
// runs again in the same turn (`stop_hook_active`) it refuses a follow-up that
// repeats lines of the refused reply — at most once per turn, so it cannot loop.
//
// ## A TURN THAT ENDS WITH STEPS LEFT IS A RETURN TO THE OWNER (Doctrine §0e rule 2)
//
// With an approved plan in force, a stop is refused when a step of its
// `## Steps` has had no agent hand back for it (an agent ended at a refusal
// returned nothing), no agent the session launched is running, and the reply
// neither opens with a choice for the owner nor declares the stop in its first
// line with what is open. The main thread then sends the next step, or the same
// step again, instead of ending. A waiting owner message, a standing STOP, a
// standing latch, and a standing correction where the plan has no review step,
// let the stop through, because each leaves no other move; where the plan has a
// review step a correction leaves one (the review, then the step it clears), so
// the stop is refused and the refusal names that step. WHERE THE PLAN HAS A
// REVIEW STEP, a plan with an Order is no longer sent in the pointer's order:
// the refusal names the step the current review cleared, or the review step.
//
// ## THE FIRST REPLY AFTER A COMPACTION SAYS SO (Doctrine §0e rule 2, LESSONS §416)
//
// A session that was compacted goes on as though nothing had happened, and the
// owner reads a reply written from a summary without being told it is one. The
// dispatcher records the compaction with its time at the start the compaction
// makes (`markCompacted` in report.mjs). The first reply after it is refused
// unless its FIRST line says that a compaction happened and at what time in
// California time, read from the record: it may share that line with a stop
// declaration. The record's `told` flag is then set, so only that one reply is held.
//
// ## THE FIRST REPLY UNDER A PLAN, ON THE TOP TIER, NAMES THE TIER (Doctrine §11b, LESSONS §434)
//
// The manager's turns sent agents and checked results for four hours on the top tier after a switch,
// and the session never said that the work needed no more. The model serving the main thread is the
// `message.model` of the newest main-thread reply in the transcript (`servingModel` in report.mjs;
// never a model key inside a tool's input), and a top-tier id is one carrying fable or mythos
// (`isTopTier`). While an approval marker is in force and the top tier serves, the first reply after
// the serving model changes is refused unless its FIRST line names the tier and says whether the work
// needs it; the refusal gives the words to use (`tierWords`). The record (`readTier`, `setTier`) is
// kept per session: written when the serving model differs from the recorded one, and its `told`
// flag set when a reply carries the line, so the line is owed once for each change.
//
//   node stop-guard.mjs        (reads the hook payload on stdin)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { pendingMessages, startedAt } from './pending-guard.mjs';
import { tailEntries, lastOwnerMessage } from './transcript-tail.mjs';
import { latchStanding, approvedPlan, planSteps, correctionStanding, stopStanding, foundQueue, queueRoots, planPhase } from './hook-dispatch.mjs';
import { runningWork, stepsReturned, planOrder, pointerOf, reviewState, aimReviewSteps, readCompacted, setCompacted, compactedWords, californiaTime,
  servingModel, isTopTier, readTier, setTier, tierWords, foundLines, managerNotes, sortOf, scratchpadOf, markerApprovalTime, runningForPlanStep } from './report.mjs';

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

/**
 * The text the session wrote after a point in the transcript.
 * @param {string} path  the transcript.
 * @param {number} fromLine  how many non-empty lines it had at that point.
 * @returns {string} every assistant text block written after those lines, joined
 *   by newlines; '' when there is none (a follow-up of tool calls only says
 *   nothing a repeat could be found in).
 */
const textAfter = (path, fromLine) => {
  const parts = [];
  let n = 0;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    if (n++ < fromLine) continue;
    let row;
    try { row = JSON.parse(line); } catch { continue; }
    if (row?.type !== 'assistant') continue;
    const c = row.message?.content;
    if (Array.isArray(c)) for (const b of c) if (b?.type === 'text' && String(b.text ?? '').trim()) parts.push(String(b.text).trim());
  }
  return parts.join('\n');
};

/** The record of the reply just refused, one file per session. */
const refusedFile = () => join(process.env.STOP_REFUSED_DIR || join(homedir(), '.claude', 'stop-refused'),
  `${String(payloadSession || 'no-session').replace(/[^A-Za-z0-9_-]/g, '_')}.json`);
let payloadSession = '';

/** What every refusal ends with: the follow-up is the correction only. */
const FOLLOW_UP = `
The owner has already seen the reply above, and a refusal cannot take it back. What you write next is a follow-up: the corrected sentences only. Do not send the reply again.
`;

/**
 * The shortest line or sentence that counts as repeated. A shorter one ("Done.",
 * a list marker, "Nothing else changed.") recurs in any two replies.
 */
const REPEAT_MIN = 30;

/**
 * The lines and sentences of a text, normalised, that are long enough to count.
 * @param {string} text  a reply.
 * @returns {Set<string>} each line, and each sentence of each line, lowercased
 *   with its whitespace collapsed, of at least REPEAT_MIN characters.
 */
const units = (text, skip = () => false) => {
  const out = new Set();
  const add = (s) => { const t = s.toLowerCase().replace(/\s+/g, ' ').trim(); if (t.length >= REPEAT_MIN) out.add(t); };
  for (const line of String(text).split('\n')) {
    if (skip(line)) continue;
    add(line);
    for (const s of line.split(/(?<=[.!?])\s+/)) add(s);
  }
  return out;
};

/** The faults found in the reply so far, in the order they were found (Q-HUB-338). */
const FAULTS = [];

/**
 * Note a fault of the reply. Nothing is written and nothing exits here: every check runs, and `flushFaults` makes one refusal that
 * lists them all, so a reply with three faults costs one follow-up and not three (Q-HUB-338).
 * @param {string} message  the refusal's own words.
 * @param {string} reply  the reply just refused.
 * @param {string} [kind]  'choice' for the choice-not-first fault, which the repeat check reads.
 * @returns {void} adds the fault to `FAULTS`.
 */
function refuse(message, reply, kind = '') {
  FAULTS.push({ message, reply, kind });
}

/**
 * Refuse the stop for every fault noted, record the reply that was refused, and say the follow-up is the correction only.
 * @returns {void} with no fault noted, returns. With one, writes its message and FOLLOW_UP to stderr and exits 2, the words it always
 *   had; with more, writes one refusal that numbers each fault in its own words, and exits 2. The record (the reply, the transcript's
 *   line count now, the time, and that no repeat has been refused yet) is what a follow-up is judged against; a failure to write it
 *   never costs the refusal.
 */
function flushFaults() {
  if (!FAULTS.length) return;
  const reply = FAULTS[0].reply;
  const kind = FAULTS.some((f) => f.kind === 'choice') ? 'choice' : FAULTS[0].kind;
  try {
    mkdirSync(dirname(refusedFile()), { recursive: true });
    const lines = readFileSync(path, 'utf8').split('\n').filter((l) => l.trim()).length;
    writeFileSync(refusedFile(), JSON.stringify({ at: Date.now(), lines, reply, repeated: false, kind }));
  } catch { /* the refusal stands without a record */ }
  const strip = (m) => m.replace(/^STOP REFUSED — /, '').trimEnd();
  const text = FAULTS.length === 1 ? FAULTS[0].message
    : `STOP REFUSED — this reply has ${FAULTS.length} faults, listed together so one follow-up corrects all of them.\n\n`
      + FAULTS.map((f, i) => `FAULT ${i + 1} of ${FAULTS.length}: ${strip(f.message)}\n`).join('\n');
  process.stderr.write(text + FOLLOW_UP);
  process.exit(2);
}

/** End the stop as allowed, unless a fault was noted: then refuse for all of them. */
function finish() {
  flushFaults();
  process.exit(0);
}

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
  /\b(?:let me know|tell me|say the word|just say)\b[^.?!]*(?:\bif\b|\bwhen\b|\band I(?:'|\s+wi)ll\b|\bto (?:continue|go on|proceed|carry on)\b)/i,
  /\b(?:want|would you like) me to (?:continue|go on|carry on|proceed|start|keep going|move on)\b/i,
  /\bshall I (?:continue|go on|carry on|proceed|start|keep going|move on)\b/i,
  /\bready (?:when you are|for (?:your|the) (?:go|word|nod))\b/i,
  /\b(?:happy to|I can) (?:continue|carry on|keep going|move on)[^.?!]*(?:if|when|whenever) you\b/i,
  /\bawaiting (?:your|the) (?:go|word|nod|instruction|direction)/i,
];

/** The declaration §11c requires, and it has to be the FIRST line. */
// THE STATE LINE (Q-HUB-359). A stop's first line is "Stopping here, then paused, pending <what lifts it>" or "Stopping here, then finished,
// nothing pending". The older words, "Stopping here: open for you is <X>", are accepted beside it for one release so a session mid-plan on
// the older clone is not refused (`DECLARED_OLD`); a pause is a state and never a decision listed as open.
const DECLARED_NEW = /^\s*(?:[#*_>\s-]*)stopping here[,:]?\s*(?:then\s+)?(?:paused,\s*pending\b|finished,\s*nothing pending\b)/i;
const DECLARED_OLD = /^\s*(?:[#*_>\s-]*)stopping here[,:]?\s*open for you\b/i;
const DECLARED = { test: (text) => DECLARED_NEW.test(text) || DECLARED_OLD.test(text) };

/** 4. OWING. A reply saying the reader is waited on, or owes anything, is
 *  refused (2026-09-28, LESSONS §370): say what is open for them instead. This
 *  is refused even under a declared stop, because the declaration used to BE
 *  "waiting on you" and the rule changed under it. */
// A NEGATED FORM DENIES THE WAIT AND IS NOT THE WAIT (Q-HUB-343): "not waiting on you", "nothing is waiting on you", "you owe nothing".
const OWING = [
  /(?<!\b(?:not|never|no longer|nothing is|nothing was|nobody is|no one is|isn'?t|aren'?t|wasn'?t)\s+)\bwaiting (?:on|for) you\b/i,
  /\byou owe\b(?!\s+(?:nothing|no\b))/i,
  /\b(?:I'?m|I am|we'?re) waiting\b/i,
  // THE OWNER AS THE REASON A THING STOPPED (Q-HUB-359): a pause is a state with what lifts it, never a fault of the owner's.
  /\b(?:stopped|paused|held|blocked|stuck|stalled)\s+(?:because|since)\s+(?:of\s+)?(?:you|the owner)\b/i,
  /\bbecause\s+(?:you|the owner)\s+(?:have not|haven'?t|has not|hasn'?t|did not|didn'?t|not yet)\b/i,
  /\b(?:you|the owner)\s+(?:are|is)\s+the\s+reason\b/i,
];

/** A word saying whether work needs a tier: need, needs, needed, requires, or "no more than". */
const NEEDS_WORD = /\bneed(?:s|ed)?\b|\bno more than\b|\brequires?\b/i;

/**
 * Does a reply's first line name the tier serving and say whether the work needs it? (Doctrine §11b, LESSONS §434)
 * @param {string} open  the reply's first non-blank line.
 * @param {string} model  the serving model's id.
 * @returns {boolean} true only when the line names the tier (the model's id, a word that makes an id top-tier, or "top tier") and
 *   carries a word saying whether the work needs it (`NEEDS_WORD`). Both are asked, so a line that only names the model, or only
 *   says the work needs nothing, is not the line.
 */
function namesTier(open, model) {
  const names = String(open).toLowerCase().includes(String(model).toLowerCase()) || isTopTier(open) || /\btop[- ]tier\b/i.test(open);
  return names && NEEDS_WORD.test(open);
}

let payload = '';
try { payload = readFileSync(0, 'utf8'); } catch { /* no stdin */ }

let hook = {};
try { hook = JSON.parse(payload || '{}'); } catch { /* not JSON */ }

payloadSession = String(hook.session_id ?? '');

const path = hook.transcript_path;

// THE HARNESS'S CAP ON CONSECUTIVE STOP REFUSALS (P-20, LESSONS §381). The harness continues a turn after a Stop hook refuses it, and
// after STOP_CAP continuations in a row it overrides the next refusal and ends the turn in silence, which is the shape this guard exists
// to refuse. The count resets at each tool call, and every Stop hook counts, the environment's own among them. This guard refuses at
// most twice in one chain (the first stop, and the one repeat below), so it holds itself under the cap at that repeat: where the tail
// already shows HOLD_AT refusals since the last tool call it passes the stop and says so, instead of adding the one the harness would
// override. STOP_CAP is the documented eight until the planted run of the plan that serves P-20 sets it from a measurement.
const STOP_CAP = 8;
const HOLD_AT = STOP_CAP - 1;

/**
 * How many Stop-hook refusals the transcript shows since the newest tool call.
 * @param {object[]} entries  the transcript's tail (`tailEntries`).
 * @returns {number} the system entries of subtype stop_hook_summary with a non-empty hookErrors list, counted back from the end until
 *   an assistant entry holding a tool_use block. The refusal being made at this moment is not yet written, so it is not counted.
 */
function stopBlocksSinceTool(entries) {
  let n = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e?.type === 'assistant' && Array.isArray(e.message?.content) && e.message.content.some((b) => b?.type === 'tool_use')) break;
    if (e?.type === 'system' && e.subtype === 'stop_hook_summary' && Array.isArray(e.hookErrors) && e.hookErrors.length) n++;
  }
  return n;
}

// THE PLANT (P-20). A marker file in the session's scratchpad arms a measurement of the cap: while an agent whose prompt names the
// marker's plan and step is running, every stop of the main thread is refused with a line opening PLANT, each call logged in the marker,
// until the log holds the limit. It runs before the loop flag is read, because the measurement has to refuse whatever the flag says, and
// it refuses nothing of its own while armed. A marker that is not JSON (the word spent), an object with no plan and step, a log that
// holds the limit, a session with no scratchpad and a session with no such agent all read as absent.
try {
  const pad = scratchpadOf(payloadSession);
  const file = pad ? join(pad, 'scratch', 'stop-cap-plant.json') : '';
  const mk = file ? JSON.parse(readFileSync(file, 'utf8')) : null;
  const limit = Number(mk?.limit) || 0;
  const log = Array.isArray(mk?.log) ? mk.log : [];
  if (mk && typeof mk.plan === 'string' && mk.plan && Number.isInteger(mk.step) && limit > 0 && path && log.length < limit
    && runningForPlanStep({ session_id: payloadSession, transcript_path: path }, mk.plan, mk.step)) {
    const n = log.length + 1;
    log.push({ call: n, at: new Date().toISOString(), stop_hook_active: !!hook.stop_hook_active });
    writeFileSync(file, JSON.stringify({ ...mk, log }));
    process.stderr.write(`PLANT ${n} of ${limit} — this refusal is the plan's own measurement of the harness's cap on consecutive stop refusals, not a defect of the reply. Answer it with one line that names the measurement (the harness's cap on consecutive stop refusals), says this is refusal ${n} of ${limit}, and says the run ends when the harness overrides a refusal or the limit is reached, and make no tool call, because a tool call resets the count being measured.\n`);
    process.exit(2);
  }
} catch { /* a marker that cannot be read is absent */ }

// THE PROSE REFUSALS RUN ONLY UNDER A PLAN (Doctrine §0e rule 4, Design part 5, LESSONS §376, §384, §395, §406, §428, §434, §456).
// Conversation is the default outside a plan: a reply there is judged by the never-rules and by the shapes that are about what is
// claimed, not about how it is worded. `underPlan` is true while an approval marker is in force whose plan's pointer is not none
// (`planPhase`, hook-dispatch.mjs; a pointer that cannot be read counts as in force). It gates the bolded lead-ins, the headers, a
// feeling named, a promise, a go-word asked for, a repeated follow-up, the tier line, the choice not first, approval asked in chat,
// the next work asked for or checks dropped, and waiting or parking. These run in every mode: a state claim with no read, handing
// the owner a step, the waited-on and owing wording, and the compaction notice; the holds for a background task still running and
// for steps left are unchanged. A failure reading the state keeps the refusals, as every doubt does.
let underPlan = true;
try { underPlan = planPhase({ session_id: hook.session_id, transcript_path: path }).kind === 'in force'; } catch { underPlan = true; }

// Already blocked once this turn. Never loop — the session gets one nudge, and
// one more only for a follow-up that sends the refused reply again (above).
// The follow-up is what was written after the refusal: it repeats the refused
// reply when it carries any of its lines or sentences of REPEAT_MIN characters
// or more. The refusal is made ONCE per turn (`repeated` in the record), so a
// session that keeps repeating is let through on the next stop, never looped.
// A record older than the owner's newest message belongs to an earlier turn.
if (hook.stop_hook_active) {
  // A follow-up that carries the compaction notice discharges it: the refusal for a first line
  // without it asked for exactly that sentence, and the next stop is not held for it again.
  try {
    const c = readCompacted(payloadSession);
    if (c && !c.told && path) {
      const said = lastAssistantText(path);
      if (/compact/i.test(said) && said.includes(californiaTime(new Date(c.at)))) setCompacted(payloadSession, { told: true });
    }
  } catch { /* judged again at the next stop */ }
  // The same for the tier line: the follow-up the refusal asked for carries it, and the next stop is not held for it again.
  try {
    const t = readTier(payloadSession);
    if (t && !t.told && path) {
      const said = lastAssistantText(path).split('\n').map((l) => l.trim()).find(Boolean) ?? '';
      if (namesTier(said, t.model)) setTier(payloadSession, { model: t.model, told: true });
    }
  } catch { /* judged again at the next stop */ }
  try {
    const rec = JSON.parse(readFileSync(refusedFile(), 'utf8'));
    const ownerAt = lastOwnerMessage(tailEntries(path ?? '', 16 * 1024 * 1024))?.at ?? 0;
    if (underPlan && path && rec && !rec.repeated && Number(rec.at) >= ownerAt) {
      // A line that carries an artifact link is never a repeat: Doctrine §7i puts the status page's link in every progress
      // reply. After a refusal for a choice not first, a numbered option line is never one either: that refusal asked for the
      // choice to be moved to the top, which is the same line written once more. Both are left out of what is judged.
      const skipLine = (l) => /claude\.ai\/(?:code\/)?artifact\/\S/i.test(l) || (rec.kind === 'choice' && /^\s{0,3}\d{1,2}[.)]\s+\S/.test(l));
      const refused = units(rec.reply, skipLine);
      const again = [...units(textAfter(path, Number(rec.lines) || 0))].filter((u) => refused.has(u));
      if (again.length) {
        // THE HOLD (P-20): the repeat is the one refusal this guard adds to a chain, so it is the one held under the cap.
        const held = stopBlocksSinceTool(tailEntries(path, 16 * 1024 * 1024));
        if (held >= HOLD_AT) {
          process.stderr.write(`STOP PASSED — the transcript shows ${held} stop refusals since the last tool call, and the harness's cap is ${STOP_CAP}: this guard would have refused the follow-up that repeats "${again[0].slice(0, 120)}", and does not, so the harness never ends the turn in silence.\n`);
          process.exit(0);
        }
        writeFileSync(refusedFile(), JSON.stringify({ ...rec, repeated: true }));
        process.stderr.write(`STOP REFUSED — this follow-up sends the refused reply again: ${again.length} line${again.length === 1 ? '' : 's'} of it repeated, the first being
  "${again[0].slice(0, 200)}"

Doctrine §11c. The owner has already seen that reply; a refusal cannot take it back, and a second copy is a second reply. Write the corrected sentences only: what was wrong, said right, and nothing else.
`);
        process.exit(2);
      }
    }
  } catch { /* no record, or one unreadable: the follow-up passes */ }
  process.exit(0);
}

if (!path) process.exit(0);

// A LATCHED SESSION MAY STOP (Doctrine §0d, §0e). While the refusal latch
// stands every tool call is refused, TaskStop included, so refusing the stop as
// well — for running work, or for a reply's shape — would leave no move at all.
// The latch tells the session to say what was refused and stop; this lets it.
try { if (latchStanding(hook)) process.exit(0); } catch { /* no latch readable: judged below */ }

let reply = '';
try { reply = lastAssistantText(path); } catch { process.exit(0); }
if (!reply) process.exit(0);

/** 00. THE FIRST REPLY AFTER A COMPACTION SAYS THAT ONE HAPPENED, AND WHEN (Doctrine §0e rule 2,
 *  LESSONS §416). The record the dispatcher wrote at the start the compaction made holds its
 *  time (`readCompacted`). While the record's `told` flag is not set, the reply's FIRST line
 *  has to carry the word "compact" and the time in California time (HH:MM, as `compactedWords`
 *  gives it); a reply that does is let through and sets the flag, one that does not is refused
 *  once with the words to use. The line may be shared with a stop declaration. Judged before
 *  every other shape, because it is about the first line and the others read the rest. A
 *  session with no record is not held. */
let compacted = null;
try { compacted = readCompacted(payloadSession); } catch { compacted = null; }
if (compacted && !compacted.told) {
  const time = californiaTime(new Date(compacted.at));
  const open = reply.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  if (/compact/i.test(open) && open.includes(time)) {
    try { setCompacted(payloadSession, { told: true }); } catch { /* held again at the next stop */ }
  } else {
    refuse(`STOP REFUSED — this is the first reply since the session was compacted, and its first line does not say so and when.

Doctrine §0e rule 2, LESSONS §416. The owner reads a reply written from a summary without being told it is one. Open the follow-up with a line in these words: "${compactedWords(compacted)}" It may share its line with a stop declaration. The corrected line is all the follow-up needs.
`, reply);
  }
}

/** 000. THE FIRST REPLY UNDER A PLAN, ON THE TOP TIER, NAMES THE TIER AND SAYS WHETHER THE WORK NEEDS IT (Doctrine §11b,
 *  LESSONS §434). The serving model is the `message.model` of the newest main-thread reply (`servingModel`); the record
 *  (`readTier`) holds the model last seen and whether the line was said for it. When the serving model differs from the
 *  recorded one the record is written again, owing the line only for a top-tier id (`isTopTier`); while an approval marker is in
 *  force (`approvedPlan`) a reply with the line owed is let through when its FIRST line names the tier (the model's id, the word
 *  fable or mythos, or top tier) and carries a word saying whether the work needs it, and the flag is set; any other is refused
 *  once with the words to use (`tierWords`). The line may share its line with a stop declaration or the compaction notice. A session
 *  with no id keeps no record and is not held. (`NEEDS_WORD` and `namesTier` are defined above the payload, because the follow-up
 *  check at the top of the file reads them.) */
let serving = null;
try { serving = payloadSession ? servingModel(tailEntries(path, 16 * 1024 * 1024)) : null; } catch { serving = null; }
if (serving) {
  let tier = null;
  try { tier = readTier(payloadSession); } catch { tier = null; }
  if (!tier || tier.model !== serving) {
    tier = { model: serving, told: !isTopTier(serving) };
    try { setTier(payloadSession, tier); } catch { /* seen as changed again at the next stop */ }
  }
  // The tier line is owed only under a plan in force whose pointer is not none (`underPlan`).
  let planInForce = false;
  try { planInForce = underPlan && !!approvedPlan(); } catch { planInForce = false; }
  if (isTopTier(serving) && !tier.told && planInForce) {
    const open = reply.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
    if (namesTier(open, serving)) {
      try { setTier(payloadSession, { model: serving, told: true }); } catch { /* held again at the next stop */ }
    } else {
      refuse(`STOP REFUSED — the top tier (${serving}) is serving this session under an approved plan, and this reply's first line does not name the tier and say whether the work needs it.

Doctrine §11b, LESSONS §434. The manager's turns send agents and check their results, which need no more than a lesser tier, and a session cannot change its own model, so this line is how the switch gets decided. Open the follow-up with a line in these words: "${tierWords(serving)}" Where the work does need the top tier, say that instead, and why. It may share its line with a stop declaration or the compaction notice. The corrected line is all the follow-up needs.
`, reply);
    }
  }
}

/** 0. GOING QUIET WHILE ITS OWN WORK RUNS (Doctrine §0e rule 2, LESSONS §381).
 *  A background command or a workflow this session started is work the session
 *  must stay with: a turn ended under a declared stop went silent for ninety
 *  minutes while two workflows ran, and nothing but this can hold a session to
 *  it, because a session that ends its turn makes no tool call. So a stop is
 *  refused while one runs, declared or not. Stay in the turn and act on each
 *  result as it lands.
 *
 *  A RUNNING AGENT DOES NOT HOLD THE TURN. The harness's completion
 *  notification brings the session back when an agent ends, and a status is
 *  due then (report.mjs `endedSince`), so ending the turn is how the session
 *  waits on an agent: staying in it waited on a clock the owner never asked for
 *  and cost a turn of the main thread's model per wait. What counts as running
 *  is `runningWork` in report.mjs, the one definition this and the status gate
 *  share, less the agents it lists. */
const HOLDS_STOP = (x) => !/^agent\b/.test(x);
// THE STOP INPUT'S LIST IS READ FIRST (P-19, LESSONS §381, §440). The harness puts `background_tasks` and `session_crons` in the
// Stop hook's input when its task registry is reachable. An entry holds the stop when its type is not subagent (a running agent does
// not hold the turn) and its status is not an ended word. A scheduled task is not work running, so the count of `session_crons` is
// information beside the holding entries and holds nothing. An input without the list as an array reads the transcript lister
// below, exactly as before, so §440's cases are kept for that path.
const ENDED_WORDS = /^(?:completed|failed|killed|stopped|cancelled|canceled|done|finished|error|errored|terminated)$/i;
const holdsByInput = (e) => !!e && typeof e === 'object' && String(e.type ?? '').toLowerCase() !== 'subagent' && !ENDED_WORDS.test(String(e.status ?? ''));
let running = [];
let cronNote = '';
if (Array.isArray(hook.background_tasks)) {
  running = hook.background_tasks.filter(holdsByInput).map((e) => `${String(e.type ?? 'task')}: ${String(e.description ?? e.id ?? '').slice(0, 80)}`);
  if (Array.isArray(hook.session_crons)) cronNote = ` ${hook.session_crons.length} scheduled task(s) stand beside them and hold nothing.`;
} else {
  try { running = (runningWork({ session_id: hook.session_id, transcript_path: path }) ?? []).filter(HOLDS_STOP); } catch { running = []; }
}
// A MESSAGE FROM THE OWNER WAITING IN THE QUEUE wins: pending-guard refuses every
// tool call until the turn ends and delivers it, so refusing the stop as well
// left no move at all. Measured three times in one afternoon, 2026-10-02.
let queuedOwner = [];
try { queuedOwner = pendingMessages(tailEntries(path, 16 * 1024 * 1024), startedAt(hook)); } catch { queuedOwner = []; }
if (running.length && !queuedOwner.length) {
  refuse(`STOP REFUSED — ${running.length} task(s) this session started are still running (${running.join(', ')}).${cronNote}

Doctrine §0e rule 2, LESSONS §381. Work running in the background IS the work.
Ending the turn makes no tool call, so nothing else can hold you to it. Do not
end the turn. Stay in it, read each result as it lands, and act on it. If a
task is no longer wanted, stop it with TaskStop first.
`, reply);
}

/** 8. A STATEMENT OF STATE MADE FROM MEMORY (Doctrine §0e rule 15). A reply
 *  saying what state a task, an agent, a branch, a push, a deploy or a file is
 *  in is refused when no tool result came back in this turn: what it says was
 *  remembered, not read. It passes when the sentence says "I think" and the
 *  reply asks whether to run the check. Narrow on purpose: the subject must be
 *  a definite one ("the agent", "step 1's agent", "main") and the sentence a
 *  statement, so a design sentence about "an agent that has finished" or a
 *  conditional "once the push lands" is not a claim. It cannot tell which read
 *  backs which sentence, and a claim worded in a way it does not know passes.
 *  Judged before the declaration: a declared stop does not excuse a claim. */
const CLAIM_SUBJECT = String.raw`(?:sub)?agents?|tasks?|branch(?:es)?|push(?:es)?|deploy(?:s|ments?)?|files?|workflows?|runs?|commits?|builds?|releases?|CI|pipelines?|worktrees?|working copy|remotes?`;
const CLAIM_STATE = String.raw`(?:(?:is|are|was|were|has been|have been|'s)\s+(?:still\s+|now\s+|not\s+|already\s+|all\s+)*`
  + String.raw`(?:running|finished|done|complete|completed|green|red|failing|failed|passing|passed|merged|pushed|deployed|live|landed|stopped|idle|ended|returned|`
  + String.raw`interrupted|refused|rejected|clean|dirty|committed|uncommitted|ahead|behind|up[ -]to[ -]date|stale|gone|deleted|removed|missing|empty|`
  + String.raw`in progress|queued|waiting|blocked|stuck|dead|alive|built|unchanged|modified|on (?:main|staging)|at [0-9a-f]{7,40})`
  + String.raw`|(?:has|have|had)\s+(?:not\s+|already\s+|just\s+|now\s+)*(?:finished|completed|ended|stopped|returned|landed|failed|passed|deployed|merged|started|moved|run|been (?:pushed|merged|deployed))`
  + String.raw`|(?:finished|completed|ended|stopped|returned|landed|failed|passed|succeeded|deployed|merged|crashed|died|hung)\b)`;
const CLAIM = new RegExp(String.raw`(?<!\b(?:when|if|once|until|unless|after|before|while|whether|so)\s+)`
  + String.raw`(?:\b(?:the|this|that|these|those|its|their|our|my)\s+|\b[\w.-]+'s\s+)(?:[\w./-]+\s+){0,3}?(?:${CLAIM_SUBJECT})\b`
  + String.raw`(?!\s+(?:that|which|who|whose|if|when)\b)[^.;!?]{0,40}?\b${CLAIM_STATE}`
  + String.raw`|\b(?:main|staging)\s+(?:is|was)\s+(?:now\s+)?(?:at [0-9a-f]{7,40}|green|red|deployed|live|ahead|behind|up[ -]to[ -]date)`, 'i');
const NOT_A_STATEMENT = /^\s*(?:[-*>#\d.)\s]*)(?:if|when|whenever|once|until|unless|while|after|before|so that|in case)\b|\?\s*$/i;
const THINK = /\bI think\b/i;
const ASKS_CHECK = /\b(?:shall|should|may|can) I (?:run|check|read|look|verify|confirm)\b[^?\n]*\?|\b(?:want|like) me to (?:run|check|read|look|verify|confirm)\b[^?\n]*\?/i;

/**
 * Did a tool result come back in this turn?
 * @param {object[]} entries  the transcript's tail, in file order.
 * @returns {boolean} true when, after the last prompt that opened a turn (a
 *   user entry that is not hook feedback, a compaction summary or a tool
 *   result), a tool result came back that is not an error and not a hook's
 *   refusal. A refused call read nothing.
 */
function resultInTurn(entries) {
  let start = -1;
  entries.forEach((e, i) => {
    const c = e?.message?.content;
    const isResult = Array.isArray(c) && c.some((b) => b?.type === 'tool_result');
    if (e?.type === 'user' && !e.isMeta && !e.isCompactSummary && !isResult) start = i;
  });
  for (let i = start + 1; i < entries.length; i++) {
    const e = entries[i];
    const c = e?.message?.content;
    if (e?.type !== 'user' || !Array.isArray(c) || e.toolDenialKind) continue;
    for (const b of c) {
      if (b?.type !== 'tool_result' || b.is_error) continue;
      const text = typeof b.content === 'string' ? b.content
        : Array.isArray(b.content) ? b.content.map((x) => x?.text ?? '').join('\n') : '';
      if (/^PreToolUse:\S+ hook error/.test(text)) continue;
      return true;
    }
  }
  return false;
}

let readThisTurn = true;
try { readThisTurn = resultInTurn(tailEntries(path, 16 * 1024 * 1024)); } catch { readThisTurn = true; }
if (!readThisTurn) {
  const asksCheck = ASKS_CHECK.test(reply);
  const claimed = reply.split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean)
    .find((s) => !NOT_A_STATEMENT.test(s) && CLAIM.test(s) && !(THINK.test(s) && asksCheck));
  if (claimed) {
    refuse(`STOP REFUSED — this reply says what state something is in, and no tool result came back this turn:
  "${claimed.slice(0, 240)}"

Doctrine §0e rule 15. A statement of what state a task, an agent, a branch, a
push, a deploy or a file is in is never made from memory. Read it now and say
what the read showed; or, if checking would be a big job, say "I think" in that
sentence and ask whether to run the check.
`, reply);
  }
}

/** 5. HANDING THE OWNER WORK. A session handed the owner the install of its own
 *  gates, twice, as a setup-script edit behind a menu the tablet app does not
 *  show, and tried the install itself only when challenged; the same day it
 *  asked for a Drive sharing change without trying the connector it had
 *  (LESSONS §370). Anything asked of the owner is only what only they can do,
 *  doable in the app with a tap or a reply. "Paste this as the first message"
 *  is deliberately NOT caught: it is how a new session starts. */
const HANDING = [
  /\bsetup script\b/i,
  /\bsettings (?:page|screen|menu)\b/i,
  /\benvironment (?:settings|menu)\b/i,
  /\btitle bar\b/i,
  /\bpermission rule\b/i,
  /\b(?:go to|open|tap|click)\s+(?:the\s+|your\s+)?(?:settings|menu|environment)\b/i,
  /\byou(?:'ll| will)?\s+(?:need|have)\s+to\s+(?:install|configure|enable|set up|add)\b/i,
];

// A reply HANDS the owner a step when the sentence naming the setting speaks to
// the reader. A report that merely mentions a settings screen or a setup script
// — this guard's own history is full of them — is not handing anything over.
const ADDRESSED = /\b(?:you|your|please|go to|open|tap|click|edit|add|paste|set up|configure|enable|install)\b/i;
const sentencesAll = reply.split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
const handedIn = sentencesAll.find((s) => ADDRESSED.test(s) && HANDING.some((re) => re.test(s)));
const handed = handedIn ? HANDING.find((re) => re.test(handedIn)) : undefined;
if (handed) {
  refuse(`STOP REFUSED — this reply hands the owner a step ("${(handedIn.match(handed) ?? [''])[0]}").

LESSONS §370, rule 14 in HANDOFF.md. Look at it from the owner's side: never
hand the owner a step a session can do, and never send them to settings, a
menu, a setup script or an install. Try every route first and do it. If only
the owner can do it, ask for exactly that, doable in the app with a tap or a
reply — an approve button, a one-word answer.
`, reply);
}

const owed = OWING.find((re) => re.test(reply));
if (owed) {
  refuse(`STOP REFUSED — this reply tells the owner they are waited on or owe something ("${(reply.match(owed) ?? [''])[0]}").

LESSONS §370. Never "waiting on you", never "you owe". Name what is open
instead: "Open for you: <the specific decision>". If the work is
unfinished, carry on with it; if it genuinely stops, the first line is
"Stopping here, then paused, pending <what lifts it>" (or "Stopping here,
then finished, nothing pending"), and the end of the reply is the state line,
never a line saying nothing is open while the session is paused.
`, reply);
}

/** 6. ASKING FOR APPROVAL IN CHAT (2026-09-28, LESSONS §370). Approval is the
 *  plan-mode button and nothing else. A reply that asks for it in words got
 *  through because PARKING is skipped under a declared stop, so this is checked
 *  BEFORE the declaration, the way OWING is. A report that says a plan was
 *  approved, or names the approval marker, is not asking and passes. */
const ASKING = [
  /\bapprov(?:e|al)\b[^.!?\n]*\?/i,
  /\b(?:please|kindly|can you|could you|would you)\b[^.!?\n]*\bapprove\b/i,
  /\bopen for you\b[^.!?\n]*\bapprov(?:e|al|ing)\b/i,
  /\b(?:awaiting|await|needs?|wants?|requires?|waiting for)\s+(?:your\s+)?(?:approval|sign-off|go-ahead)\b/i,
  /\b(?:once|if|when|after)\s+you\s+approve\b/i,
  /\bapprove\s+(?:it|this|the (?:first |second )?plan|plan \d)\b/i,
  /\b(?:press|tap|click|hit)\s+(?:the\s+)?approve\b/i,
];
const asked = underPlan ? ASKING.find((re) => re.test(reply)) : undefined;
if (asked) {
  refuse(`STOP REFUSED — this reply asks for a plan's approval in chat ("${(reply.match(asked) ?? [''])[0]}").

LESSONS §370, rule 5 in HANDOFF.md. Approval is only the plan-mode button,
which ExitPlanMode puts in front of the owner. A chat turn before a plan says
what is being done and why, and asks nothing. Remove the request; if the plan
is ready, call ExitPlanMode.
`, reply);
}

/** 6b. THE OWNER'S EMOTION NAMED, A PROMISE OF FUTURE CONDUCT, AND A GO-WORD ASKED FOR
 *  UNDER A CORRECTION (Doctrine §0e rule 3, LESSONS §406). Three shapes a reply takes when
 *  it manages the owner instead of answering:
 *    (a) it NAMES A FEELING OF THE OWNER'S, in the second person or the third (the words are
 *        the FEELING list below). What a person feels is not the session's to say, and
 *        saying it answers nothing the message asked.
 *    (b) it PROMISES FUTURE CONDUCT: "from now on I will", "next time I will", "this will not
 *        happen again", "I promise". A promise is words about a later turn, and the gates
 *        are what hold a later turn; the reply says what was wrong and what was done.
 *    (c) its OPEN LINE (the first line) INSTRUCTS THE OWNER TO GIVE A GO-WORD while the owner's
 *        newest message is a correction: "say go to continue" (`GO_ASK`: the owner as the subject
 *        or the imperative, a verb of say, send, press, type, write or give, a go-word or
 *        approval as its object; a line opening Stopping here and a statement that a gate holds
 *        something until a message carries a word are not it, LESSONS §423). A go-word is the
 *        owner's to give or not; asking for one under a correction parks the turn for a nod,
 *        and the work the correction does not touch goes on without one.
 *  Judged before the declaration, because a declared stop excuses stopping and never the
 *  shape of the reply. Fenced code is set aside, so a reply that QUOTES a pattern in a code
 *  block (this guard's own lessons do) is not refused for it. The patterns sit between the
 *  two marker lines so a scratch run can load exactly these and count what they would have
 *  refused over a session's replies. */
// BEGIN STOP PATTERNS
const FEELING = String.raw`(?:frustrat\w*|annoy\w*|angry|anger|upset|irritat\w*|disappoint\w*|exasperat\w*|fed up|furious|unhappy|impatien\w*|anxious|worried)`;
const EMOTION = [
  new RegExp(String.raw`\b(?:you(?:'re| are| were| must be| seem| sound)|you(?:'ve| have) (?:been|every right to be))\s+(?:\w+ly\s+)?(?:so\s+|very\s+|really\s+|quite\s+|rightly\s+|understandably\s+)?${FEELING}\b`, 'i'),
  new RegExp(String.raw`\byour\s+(?:evident\s+|obvious\s+|clear\s+|understandable\s+|growing\s+)?${FEELING}\b`, 'i'),
  new RegExp(String.raw`\bI\s+(?:can\s+)?(?:see|hear|understand|sense|appreciate|know|realize|realise)\s+(?:that\s+)?(?:you|how)\b[^.!?\n]{0,60}\b${FEELING}\b`, 'i'),
  new RegExp(String.raw`\bthe owner(?:'s|\s+is|\s+was|\s+feels|\s+felt|\s+seems|\s+seemed)\b[^.!?\n]{0,40}\b${FEELING}\b`, 'i'),
  /\bunderstandably\s+(?:upset|annoyed|frustrated|angry|cross)\b/i,
];
const PROMISE = [
  /\bfrom now on,?\s+(?:I|I'll|we|the session|sessions|every session|each session)\b/i,
  /\b(?:next time|in future|going forward)\b[^.!?\n]{0,30}\bI(?:'ll|\s+will|\s+shall)\b/i,
  /\bI\s+(?:promise|swear|guarantee|assure you|give you my word)\b/i,
  /\bI(?:'ll|\s+will|\s+shall)\s+(?:never|always|make sure|be (?:more )?careful|do better|try harder|remember to|keep (?:that|this) in mind|take more care)\b/i,
  /\b(?:this|that|it)\s+(?:will|won't|will not|shall not)\s+(?:happen|occur|be repeated|recur)\s+again\b/i,
  /\bI(?:'ll|\s+will)\s+not\s+(?:do|make|repeat) (?:that|this|it|the same mistake)\s+again\b/i,
  /\bI won't\s+(?:do|make|repeat) (?:that|this|it|the same mistake)\s+again\b/i,
];
// THE GO-WORD SHAPE FIRES ONLY ON A SENTENCE THAT INSTRUCTS THE OWNER (LESSONS §423). It used to fire on the word go-word anywhere on the open line
// and on a verb and a go within fifty characters, so a stop declaration saying what a gate holds ("the review gate holds step 190 until a
// message ends with a go-word") was refused as though it asked for one. An instruction is a sentence whose subject is the owner (you, the owner,
// or the imperative, which has none written) and whose verb is say, send, press, type, write or give, with a go-word or the word approval as its
// object a few words after the verb. A line that opens with Stopping here is not judged for it, and neither is a clause stating that a gate holds
// something until a message carries a word.
const GO_VERB = String.raw`(?:say|send|press|type|write|give)`;
const GO_OBJECT = String.raw`(?:(?:me|us|back|with|the word|a|an|the|one|your|any)\s+){0,4}(?:go[- ]?word|go|okay|ok|continue|approved?|approval|yes)\b`;
const GO_ASK = [
  // The imperative, at the start of a sentence or after a colon, semicolon, comma, dash or "and".
  new RegExp(String.raw`(?:^|[:;,—]\s*|\s-\s)(?:(?:please|just|then|and|simply|now)\s+)*${GO_VERB}\s+${GO_OBJECT}`, 'i'),
  // The owner as the subject.
  new RegExp(String.raw`\b(?:you|the owner)\s+(?:(?:can|may|could|should|must|will|just|then|please|only|simply|now)\s+|(?:need|have)\s+to\s+)*${GO_VERB}\s+${GO_OBJECT}`, 'i'),
];
const STOPPING_HERE = /^[#*_>\s-]*stopping here\b/i;
const GATE_HOLD = /\b(?:holds?|held|holding|refus\w+|blocks?|blocked)\b[^.!?\n]*\buntil\b[^.!?\n]*/gi;
/**
 * The instruction to the owner on a reply's open line, if there is one.
 * @param {string} open  the reply's first non-blank line, with fenced code removed.
 * @returns {RegExpExecArray|null} null for a line that opens with Stopping here (the declaration says what is open and is not judged
 *   for this shape), and for a line none of whose sentences instructs the owner; otherwise the match in the first sentence that does
 *   (`GO_ASK`: the owner as the subject, or the imperative, and a verb of say, send, press, type, write or give with a go-word or the
 *   word approval as its object). A clause stating that a gate holds something until a message carries a word is taken out of its
 *   sentence first (`GATE_HOLD`), so a statement of what a gate does is not an instruction, and an instruction beside it still is.
 */
function goInstruction(open) {
  if (STOPPING_HERE.test(open)) return null;
  for (const s of open.split(/(?<=[.!?])\s+/)) {
    const said = s.replace(GATE_HOLD, ' ').trim();
    for (const re of GO_ASK) { const m = re.exec(said); if (m) return m; }
  }
  return null;
}
/**
 * Which of the three shapes a reply takes.
 * @param {string} text  the reply.
 * @param {boolean} correction  whether the owner's newest message is a correction.
 * @returns {{kind: string, said: string}|null} the first shape found, with the words that
 *   matched, judged on the reply with fenced code removed: 'emotion', 'promise', or
 *   'go-word' (only when `correction` is true, and only on an instruction to the owner
 *   (`goInstruction`) in the reply's first non-blank line); null when none. The words
 *   are the session's own and never the owner's.
 */
function managingShape(text, correction) {
  const prose = String(text).replace(/```[\s\S]*?```/g, ' ');
  for (const re of EMOTION) { const m = re.exec(prose); if (m) return { kind: 'emotion', said: m[0].trim().slice(0, 80) }; }
  for (const re of PROMISE) { const m = re.exec(prose); if (m) return { kind: 'promise', said: m[0].trim().slice(0, 80) }; }
  if (correction) {
    const open = prose.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
    const m = goInstruction(open);
    if (m) return { kind: 'go-word', said: m[0].trim().slice(0, 80) };
  }
  return null;
}
// END STOP PATTERNS
let correctionNow = null;
try { correctionNow = correctionStanding({ session_id: hook.session_id, transcript_path: path }); } catch { correctionNow = null; }
const managing = underPlan ? managingShape(reply, !!correctionNow) : null;
if (managing) {
  const why = {
    emotion: 'names the owner\'s emotion',
    promise: 'promises future conduct',
    'go-word': 'opens by asking for a go-word while the owner\'s newest message is a correction',
  }[managing.kind];
  refuse(`STOP REFUSED — this reply ${why} ("${managing.said}").

Doctrine §0e rule 3, LESSONS §406. ${managing.kind === 'emotion'
    ? 'What the owner feels is never named: answer what the message asked, point by point, and say what was wrong and what was done about it.'
    : managing.kind === 'promise'
      ? 'A promise is words about a later turn, and the gates are what hold a later turn. Say what was wrong and what was done, and stop there.'
      : 'A go-word is the owner\'s to give. While a correction stands, answer every point in it and end the turn; held work is sent again after a go-word, and work the correction does not touch goes on without one.'}
`, reply);
}

/** 7. ASKING FOR THE NEXT WORK, OR OFFERING TO DROP THE CHECKS (Doctrine §0g,
 *  LESSONS §380). Each repo's ranked roadmap names the next work, so a reply
 *  asking the owner what to build next hands back a question the record already
 *  answers. Verification runs once, over the integrated release: never per step
 *  and never not at all, so a reply offering to drop it to save time is offering
 *  to ship unchecked work. Both are checked before the declaration, because a
 *  declared stop excuses neither. */
const NEXT_WORK = [
  /\b(?:send|tell|give|name)\s+(?:me\s+)?(?:the\s+)?next\s+(?:thing|item|task|piece of work)\b/i,
  /\bwhat\s+(?:do you want|would you like|should I)\b[^.!?\n]{0,30}\b(?:build|work on|do|tackle|pick up)\s+next\b/i,
];
const CHECK = String.raw`(?:the\s+)?(?:adversarial[\s-]+)?(?:check|checks|verification|verify stage|review|tests?|testing)\b`;
const DROP = String.raw`\b(?:drop|skip|cut|bypass|forgo)(?:s|ped|ping|ting)?\s+`;
const HASTE = String.raw`\b(?:time|faster|speed|quicker|sooner|hurry|halves|halve)\b`;
const DROP_CHECKS = [
  new RegExp(`${DROP}${CHECK}[^\n]{0,120}${HASTE}`, 'i'),
  new RegExp(`${HASTE}[^\n]{0,120}${DROP}${CHECK}`, 'i'),
];
const nextHit = NEXT_WORK.find((re) => re.test(reply));
const dropHit = DROP_CHECKS.find((re) => re.test(reply));
if (underPlan && (nextHit || dropHit)) {
  const said = (reply.match(nextHit ?? dropHit) ?? [''])[0].trim().slice(0, 80);
  refuse(nextHit
    ? `STOP REFUSED — this reply asks the owner for the next work ("${said}").

Doctrine §0g, LESSONS §380. The ranked roadmap in the repo's NOTES.md names the
next work. Take it from there, the top items in parallel, and never hand the
owner a question the record already answers.
`
    : `STOP REFUSED — this reply offers to drop verification to save time ("${said}").

Doctrine §0g, LESSONS §380. Speed comes from cutting what is unnecessary, and
verification is not that: it runs ONCE, over the integrated release, before
anything reaches staging. Cut the per-step checks; never the release check.
`, reply);
}

/** 3. THE TEMPLATE, judged BEFORE the declaration: a declared stop excuses
 *  stopping, never the shape of the reply. Doctrine §2 names the shapes that
 *  look like content and are not, and one is purely structural: the bolded
 *  lead-in on every paragraph. Four in a row is the tell; three can be a
 *  deliberate emphasis. TWO SHAPES:
 *    (a) the LEAD-IN: "**Denoise works.** On NIR_1480 …" — four in a row.
 *    (b) the FAKE HEADER: a paragraph whose FIRST LINE is only a bold phrase —
 *        three anywhere. Judged on the first line, because the usual shape puts
 *        the section's content on the very next line with no blank between. */
const paras = reply.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
let run = 0, longestRun = 0, headers = 0;
for (const p of paras) {
  const header = /^\*\*[^*\n]{2,}\*\*:?[ \t]*$/.test(p.split('\n')[0]);
  const leadIn = !header && /^\*\*[^*\n]{2,}\*\*\s*\S/.test(p);
  if (header) headers++;
  if (leadIn) { run++; if (run > longestRun) longestRun = run; } else run = 0;
}
if (underPlan && (longestRun >= 4 || headers >= 3)) {
  refuse(`STOP REFUSED — this reply ${longestRun >= 4 ? `opens ${longestRun} consecutive paragraphs with a bolded lead-in` : `is sectioned under ${headers} bold headers`}.

Doctrine §2: "the bolded lead-in on every paragraph" is a shape that looks like
content and is not — emphasis on everything is emphasis on nothing, and it makes
a reply scannable in appearance and flat in fact. Rewrite it as prose. Keep the
finding and what it costs; cut the shape.
`, reply);
}

/** 3c. A HOST LIST ON ONE LINE (Q-HUB-293, Doctrine §2): a list of hosts the owner is meant to paste goes one host to a
 *  line in one fenced block. A line outside a fenced block holding three or more hostnames, or a line inside one holding
 *  two or more, is refused. A hostname is two or more labels of lowercase letters, digits and hyphens joined by dots whose
 *  last label is on HOST_LAST_LABELS, so a file name such as `report.mjs` or `NOTES.md` does not match. */
const HOST_LAST_LABELS = ['com', 'org', 'net', 'gov', 'edu', 'io', 'dev', 'uk', 'science', 'info'];
const HOSTNAME = new RegExp(`\\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:${HOST_LAST_LABELS.join('|')})\\b`, 'g');
let inFence = false;
let crowded = null;
for (const line of reply.split('\n')) {
  if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
  const n = (line.match(HOSTNAME) ?? []).length;
  if (n >= (inFence ? 2 : 3)) { crowded = { n, inFence, line: line.trim().slice(0, 120) }; break; }
}
if (crowded) {
  refuse(`STOP REFUSED — this reply puts ${crowded.n} hostnames on one line ${crowded.inFence ? 'inside a fenced block' : 'of prose'} ("${crowded.line}").

Q-HUB-293, Doctrine §2. A host list is pasted one host per line in one fenced
block with nothing else on the line, so the owner copies it as it stands. Put
each host on its own line inside one fenced block and remove it from the prose.
`, reply);
}

/** 9. AN OPEN CHOICE IS THE FIRST THING IN A REPLY. A reply whose numbered
 *  options carry the recommended marker — "(recommended)", in any case — is
 *  refused unless that list opens the reply: at most OPEN_LINES lines (a stop
 *  declaration and a lead-in) may stand before its first item, and no marked
 *  option may sit in a numbered list further down. A choice placed under a
 *  long report was missed (2026-10-02). Judged before the declaration: a
 *  declared stop excuses the stop, never where the choice sits. A numbered
 *  list with no marker is not read as a choice, and a choice written as prose
 *  passes; this finds a choice only by its marker.
 *  @param {string} text  the reply.
 *  @returns {{line: string, before: number} | null} the first marked option
 *    out of place and how many non-blank lines stand above its list, or null. */
const MARKED = /\(\s*recommended\b[^)\n]*\)/i;
const NUMBERED = /^\s{0,3}\d{1,2}[.)]\s+\S/;
const OPEN_LINES = 2;

/**
 * The numbered lists in a reply that carry the recommended marker.
 * @param {string[]} lines  the reply, split on newlines.
 * @returns {{start: number, marked: string[]}[]} one entry per numbered list with
 *   at least one marked option: the index of its first line and its marked
 *   lines, trimmed. A numbered list runs from an item through further items,
 *   indented lines and blank lines, and ends at the first other line.
 *   `misplacedChoice` and `opensWithChoice` read the same lists, so they cannot
 *   disagree about what a choice is.
 */
function markedLists(lines) {
  const lists = [];
  let cur = null;
  lines.forEach((line, i) => {
    if (NUMBERED.test(line)) { if (!cur) { cur = { start: i, marked: [] }; lists.push(cur); } }
    else if (!(cur && (!line.trim() || /^\s+\S/.test(line)))) cur = null;
    if (cur && MARKED.test(line)) cur.marked.push(line.trim());
  });
  return lists.filter((l) => l.marked.length);
}

/**
 * Does a reply open with a choice for the owner?
 * @param {string} text  the reply.
 * @returns {boolean} true when its first numbered list carrying the recommended
 *   marker starts within OPEN_LINES non-blank lines of the top (a stop
 *   declaration and one lead-in), the same position `misplacedChoice` accepts.
 *   The steps-left check lets such a reply end the turn: a choice only the owner
 *   can settle is a reason to hand the turn back.
 */
function opensWithChoice(text) {
  const lines = String(text).split('\n');
  const first = markedLists(lines)[0];
  return !!first && lines.slice(0, first.start).filter((l) => l.trim()).length <= OPEN_LINES;
}

function misplacedChoice(text) {
  const lines = String(text).split('\n');
  const marked = markedLists(lines);
  if (!marked.length) return null;
  const before = lines.slice(0, marked[0].start).filter((l) => l.trim()).length;
  if (before <= OPEN_LINES && marked.length === 1) return null;
  const out = before <= OPEN_LINES ? marked[1] : marked[0];
  return { line: out.marked[0], before: lines.slice(0, out.start).filter((l) => l.trim()).length };
}
const choiceHit = underPlan ? misplacedChoice(reply) : null;
if (choiceHit) {
  refuse(`STOP REFUSED — this reply's choice is not the first thing in it. A numbered option carrying the recommended marker sits under ${choiceHit.before} lines of other text:
  "${choiceHit.line.slice(0, 200)}"

An open choice is the first thing in a reply until it is answered: a choice
placed under a long report was missed. Put the numbered options, recommendation
first, at the top — after a stop declaration and one lead-in line at most — and
the report beneath them. Write the choice once.
`, reply, 'choice');
}

/** 9b. THE STATE LINE (Q-HUB-359, Doctrine §0e rule 3). Every reply ends with one line of fixed words saying whether the session is paused
 *  and pending what of the owner, running what, or finished: the paused form names the go-word, the button on the plan or the answer to the
 *  choice above as what it is pending; the running form is "State: running, step N, nothing pending from the owner" and the finished form
 *  is "State: finished, nothing pending from the owner". Narrow on purpose: it is owed only while the session is paused on the owner,
 *  that is in plan mode with no plan in force, under a standing correction, or while the reply opens with a choice under a plan in force.
 *  Refused once with the rest of the reply's faults: a reply whose last line is no state line, a state that is paused and says nothing is
 *  pending, a state of finished while the session is paused, and an open-for-you line that says nothing or none is open. */
const STATE_LINE = /^[#*_>\s-]*state\b[:,]?\s*(?:then\s+)?(?:paused,\s*pending\s+\S[^\n]*|running\b[^\n]*\bnothing pending from the owner[^\n]*|finished,\s*nothing pending[^\n]*)$/i;
const STATE_TRAILER = /^(?:<?https?:\/\/\S+>?|\(.*\)|Status\b.*|[-*_]{3,})$/;

/**
 * The faults of a reply's end under the state line rule.
 * @param {string} text  the reply.
 * @returns {string[]} each fault in words: the last line that says something is no state line, a paused state saying nothing is pending, a
 *   finished state (the session is paused here), an open-for-you line saying nothing or none is open; [] when the end is clean.
 */
function stateLineFaults(text) {
  const lines = String(text).split('\n').map((l) => l.trim()).filter(Boolean);
  const end = [...lines].reverse().find((l) => !STATE_TRAILER.test(l) && !/claude\.ai\/(?:code\/)?artifact\/\S/i.test(l)) ?? '';
  const faults = [];
  if (!STATE_LINE.test(end)) faults.push(`the last line of the reply is no state line ("${end.slice(0, 100)}")`);
  else if (/^[#*_>\s-]*state\b[:,]?\s*(?:then\s+)?paused\b[^\n]*(?:\bpending\s+(?:nothing|none)\b|\bnothing\s+(?:is\s+)?(?:open|pending)\b)/i.test(end)) faults.push(`the state line says the session is paused and nothing is pending ("${end.slice(0, 100)}")`);
  else if (/^[#*_>\s-]*state\b[:,]?\s*(?:then\s+)?finished\b/i.test(end)) faults.push(`the state line says finished while the session is paused on the owner ("${end.slice(0, 100)}")`);
  const none = lines.find((l) => /^[#*_>\s-]*open for you\b[^\n]*\b(?:nothing|none)\b/i.test(l));
  if (none) faults.push(`an open-for-you line says nothing is open while the session is paused ("${none.slice(0, 100)}")`);
  return faults;
}

// Owed while paused on the owner: plan mode with no plan in force (the harness reports the mode in the Stop payload), a standing correction
// or a choice open at the top of the reply under a plan in force.
let noPlanInForce = false;
try { noPlanInForce = !approvedPlan(); } catch { noPlanInForce = false; }
const pausedOnOwner = (String(hook.permission_mode ?? '') === 'plan' && noPlanInForce)
  || (underPlan && (!!correctionNow || opensWithChoice(reply)));
const stateFaults = pausedOnOwner ? stateLineFaults(reply) : [];
if (stateFaults.length) {
  refuse(`STOP REFUSED — this reply's end breaks the state line rule: ${stateFaults.join('; ')}.

Q-HUB-359, Doctrine §0e rule 3. The session is paused on the owner here (plan mode with no plan in force, a standing correction, or a choice open), and a pause is a state, never a line saying nothing is open. End the reply with one line of these words: "State: paused, pending the owner's go-word", "State: paused, pending the button on the plan", "State: paused, pending the owner's answer to the choice above", "State: running, step N, nothing pending from the owner" or "State: finished, nothing pending from the owner". Open for you lists decisions only.
`, reply);
}

// 10. A RETURN TO THE OWNER WITH STEPS LEFT (Doctrine §0e rule 2, §11c). A turn
// that ends while an approved plan has a step no agent has handed back for, and
// with no agent of the session running, is the session handing the owner back
// work the plan already gave it: it was done at a phase seam on 2026-10-04, and
// every return went to the owner as a message that restarted the work. So the
// stop is refused, and the main thread sends the next step, or the same step
// again, instead of ending.
//
// What it reads: the approved plan (only a plan whose hash still matches the
// approval counts, as everywhere) and the agents the session sent, each prompt
// naming its step (`stepsReturned`). WHERE THE PLAN HAS AN `## Order` the check
// reads THE POINTER, N: the first number on its `Order:` line with no hand-back
// whose first line opens DONE (`pointerOf` in report.mjs). A stop with N not
// none is refused, and a REFUSED or FAILED hand-back leaves N where it is, so
// the main thread sends the same step again. A plan with no `## Order` keeps the
// older count: its `## Steps` numbers (`planSteps`), and a step is returned when
// an agent sent for it ENDED BY A REPORT; an agent that ended at a refusal or an
// interruption returned nothing, so its step is still left and is sent again.
// Either way only a step whose number the approval recorded counts as left
// (`stepsLeft`): a step added after approval is refused by the dispatch gate, so
// counting it would hold a stop for a move that can never be made. A marker that
// recorded no step list counts every step, as before.
//
// What lets the turn end anyway, each of them a reason a turn must end rather
// than carry on: an agent of the session is running (its completion notice
// brings the session back); a message from the owner is waiting in the queue
// (ending the turn delivers it); a stop from the owner stands, or a correction
// does and the plan has no review step, because rule 3 then refuses every other
// call, so a refused stop would leave no move at all; the reply opens with a choice only
// the owner can settle (`opensWithChoice`); its first line declares the stop
// with what is open (`declaresStop`); or its first line says that a step ejected to
// the plan and what it waits on (`declaresEject`): a hand-back opening EJECT is a
// hand-up (Design part 3), not a step to send again as it stands, and a manager's
// `Eject:` note closes the pointer, so the plan leaves no step at all. A session
// whose agents or plan cannot be read is not refused: this never holds a turn for
// steps it cannot count.

/** The first line's declaration WITH what is open: "Stopping here: open for you
 *  is X", where X is at least a few words on the same line. */
const DECLARED_OPEN_OLD = /^\s*(?:[#*_>\s-]*)stopping here[,:]?\s*open for you\b[ \t]*(?:is|are|:)?[ \t]*(\S[^\n]{6,})/i;
// The new form with what lifts the pause: "Stopping here, then paused, pending <at least seven characters>".
const DECLARED_OPEN_NEW = /^\s*(?:[#*_>\s-]*)stopping here[,:]?\s*(?:then\s+)?paused,\s*pending\b[ \t]*(\S[^\n]{6,})/i;
const DECLARED_OPEN = { test: (text) => DECLARED_OPEN_NEW.test(text) || DECLARED_OPEN_OLD.test(text) };

/**
 * Does a reply declare its stop, saying what is open?
 * @param {string} text  the reply.
 * @returns {boolean} true when its FIRST line is "Stopping here: open for you is
 *   <something>" with at least seven characters after "open for you". The bare
 *   declaration `DECLARED` accepts says a stop and not what it waits on; the
 *   steps-left check needs the second half.
 */
const declaresStop = (text) => DECLARED_OPEN.test(text);

/**
 * The first line's declaration that a step ejected to the plan, WITH what it waits on: "Step 55 ejected, it waits on <what>", where
 *  the what is at least a few words on the same line. The verb is "waits on" and not the present participle, which the waiting
 *  refusal reads as work still running.
 */
const EJECT_DECLARED = /^\s*(?:[#*_>\s-]*)step\s+(\d+)\s+(?:is\s+|was\s+)?ejected\b[^\n]*?\bwaits?\s+on\b[ \t]*(\S[^\n]{6,})/i;

/**
 * Does a reply declare that an ejected step waits on something?
 * @param {string} text  the reply.
 * @param {Set<number>|undefined} ejected  the plan's ejected steps (`pointerOf`'s `ejected`): each step of its Order with no DONE
 *   hand-back whose newest report opens EJECT.
 * @returns {boolean} true when the FIRST line is "Step N ejected, it waits on <something>" with at least seven characters after
 *   "waits on" and N is one of the ejected steps. A step that ejected to the plan is not a step left to send: the plan is rewritten
 *   from the files its hand-back names, which is the owner's button when the rewrite touches an approved section, so the turn may
 *   end on the words. A declaration naming a step that did not eject, or none, is not this.
 */
const declaresEject = (text, ejected) => {
  const m = EJECT_DECLARED.exec(String(text));
  return !!m && !!ejected && ejected.has(Number(m[1]));
};

/**
 * The approved plan's steps no agent has returned for.
 * @param {{returned: Set<number>, running: string[]} | null} state  `stepsReturned`'s answer.
 * @returns {number[]} the plan's `## Steps` numbers, in plan order, that no
 *   agent ended by a report for and that the approval recorded; empty when no
 *   approved plan is in force (none recorded, or its file no longer matches the
 *   hash recorded at approval) or when `state` is null. The refusal below names
 *   exactly these. A step the marker did not record, one added to the Steps or the
 *   Order after the approval, is never left: the dispatch gate refuses to send it
 *   (`approvalSetProblem`), so counting it would hold every stop of the plan with no
 *   move that clears it. A marker that recorded no step list counts as before.
 */
function stepsLeft(state) {
  const plan = approvedPlan();
  if (!plan || !state) return [];
  // THE STEPS THE APPROVAL RECORDED (Doctrine §0e rules 2 and 13): a step the marker does not hold cannot be sent, so it
  // cannot be a step left. A marker written before the lists were recorded (`steps` null) holds every step, as before.
  const held = (n) => !Array.isArray(plan.steps) || plan.steps.includes(n);
  // THE POINTER (Doctrine §0e rule 2): where the plan has an `## Order`, the one
  // step left is N, the first recorded number in Order with no hand-back opening DONE; a
  // REFUSED or FAILED hand-back leaves it where it is. A plan with no Order keeps
  // the older count of steps no agent ended by a report for.
  if (planOrder(plan.text)) {
    const pointer = pointerNow(plan, state);
    // A PLAN THE MANAGER EJECTED TO THE PROGRAM HOLDS NO STEP (`pointerOf`'s `closed`): it closed unfinished, its item went back to open,
    // and the closing check below still asks that every finding of its steps is recorded.
    if (pointer.closed) return [];
    const next = pointer.order.find((n) => !pointer.done.has(n) && held(n)) ?? null;
    return next === null ? [] : [next];
  }
  return planSteps(plan.text).filter((n) => !state.returned.has(n) && held(n));
}

/**
 * The pointer of the plan in force, with the manager's notes read.
 * @param {{text: string, path?: string}} plan  the plan in force, with an Order; its path names the plan an `Eject:` line has to name.
 * @param {{ends: object[]}} state  `stepsReturned`'s answer.
 * @returns {ReturnType<typeof pointerOf>} `pointerOf` over the session's agents and the notes in its scratchpad, so an `Eject:` line
 *   there closes the pointer and a hand-back opening EJECT is in `ejected`. Every doubt about the notes reads as no notes.
 */
function pointerNow(plan, state) {
  let notes = null;
  try { notes = managerNotes(scratchpadOf(String(hook.session_id ?? ''))); } catch { notes = null; }
  return pointerOf(plan.text, state.ends, notes, plan.path);
}

/** Does the approved plan in force define a pointer (an `Order:` line)? */
function hasPointer() {
  const plan = approvedPlan();
  return !!plan && !!planOrder(plan.text);
}

// WHAT LETS A TURN END WITH STEPS LEFT, from the owner: a STOP, which holds every
// call including the review and a cleared step, so a refused stop would leave no
// move at all; and a CORRECTION, but only where the plan has no review step. With
// a review step a correction leaves a move (the review, then the step it clears),
// so the turn that answers the correction does not end the work: the stop is
// refused and the review is sent (Doctrine §0e rules 2 and 3).
let reviewed = null;
let left = [];
// An agent of the session running now (`stepsReturned`'s running list). The doctrine says a running agent does not hold the
// turn and its completion brings the session back, so a reply that says that agent's work is still going is a report of
// state and not a hand-off: the WAITING refusal below passes it (finding 2 of the plan of 1 November, five of eight refusals).
let agentRunning = false;
// The reply's first line declares that an ejected step waits on something (`declaresEject`).
let ejectDeclared = false;
// The steps of the plan in force whose newest report opens EJECT (`pointerOf`'s `ejected`).
let ejectedNow = new Set();
// THE CLOSING STOP (Doctrine §0e rule 2): the Found lines of the plan's own steps that the manager sorted as queued with a
// note that names no key present in the Found queue of a repository the plan's Files names. Read only when the pointer reads
// next none, and only for the steps of the plan in force, so an earlier plan's lines in the manager notes do not hold the close.
let unrecorded = [];
/**
 * The queued Found lines of the plan's steps whose note names no key of a Found queue.
 * @param {{path: string, text: string}} plan  the plan in force.
 * @returns {{key: string, note: string}[]} each Found line of a step of the plan (its Order and Standing steps, read from a
 *   report file written since the approval) that `status/manager.txt` sorts as queued and whose note holds no `Q-TAG-N` key
 *   that the `## Found queue` of a repository the plan's Files names holds; [] when the plan's Files names no repository
 *   with a queue (nothing to check against), or nothing is unrecorded.
 */
function unrecordedFound(plan) {
  const roots = queueRoots(plan.text);
  const keys = new Set();
  for (const r of roots) for (const q of foundQueue(r)) keys.add(q.key);
  if (!keys.size) return [];
  const pad = scratchpadOf(String(hook.session_id ?? ''));
  if (!pad) return [];
  const order = planOrder(plan.text);
  const steps = new Set([...(order?.order ?? []), ...(order?.standing ?? [])]);
  const notes = managerNotes(pad);
  const out = [];
  for (const f of foundLines(pad, markerApprovalTime())) {
    if (!steps.has(f.step)) continue;
    const s = sortOf(notes, f);
    if (!s || s.how !== 'queued') continue;
    const named = String(s.note).match(/Q-[A-Za-z0-9]+-\d+/g) ?? [];
    if (!named.some((k) => keys.has(k))) out.push({ key: f.key, note: s.note });
  }
  return out;
}
try {
  const state = stepsReturned({ session_id: hook.session_id, transcript_path: path });
  agentRunning = !!(state && state.running && state.running.length);
  const plan = approvedPlan();
  reviewed = plan && aimReviewSteps(plan.text).length ? plan : null;
  const probe = { session_id: hook.session_id, transcript_path: path };
  // A STEP THAT EJECTED TO THE PLAN (Design part 3): its newest report opens EJECT, so it is not sent again as it stands. A reply whose
  // first line says the step ejected and what it waits on ends the turn, as a declared stop does.
  const ejectedSteps = plan && state && planOrder(plan.text) ? pointerNow(plan, state).ejected : undefined;
  ejectedNow = ejectedSteps ?? new Set();
  ejectDeclared = declaresEject(reply, ejectedSteps);
  if (state && !state.running.length && !queuedOwner.length && !opensWithChoice(reply) && !declaresStop(reply)
    && !ejectDeclared && !stopStanding(probe) && (reviewed || !correctionStanding(probe))) {
    left = stepsLeft(state);
    if (!left.length && plan && planOrder(plan.text)) unrecorded = unrecordedFound(plan);
  }
} catch { left = []; unrecorded = []; }
if (left.length) {
  const pointed = hasPointer();
  // WHERE THE PLAN HAS A REVIEW STEP, the next move is the review's: the step the
  // current review cleared, or the review itself (`reviewState`, report.mjs).
  let move = '';
  if (reviewed) {
    let rv = null;
    try { rv = reviewState({ session_id: hook.session_id, transcript_path: path }, reviewed, { after: correctionStanding({ session_id: hook.session_id, transcript_path: path })?.typed || 0 }); } catch { rv = null; }
    move = rv?.kind === 'cleared'
      ? `The plan's review cleared step ${rv.cleared} and no other: send ${reviewed.path} step ${rv.cleared}.`
      : `No review is current (${rv?.kind ?? 'unread'}): send the Standing review step, ${reviewed.path} step ${aimReviewSteps(reviewed.text)[0]}, which follows aim-review.md; the step it clears is the next move.`;
  }
  refuse(`STOP REFUSED — this turn ends with ${reviewed ? `the plan's steps not all done (the pointer reads next: step ${left[0]}), ` : pointed ? `the plan's pointer at next: step ${left[0]}, ` : `${left.length} step${left.length === 1 ? '' : 's'} of the approved plan still open (${left.join(', ')}), `}no agent of this session running, and no choice for the owner or declared stop with what is open.

Doctrine §0e rule 2, §11c. An approved plan is the instruction for all of it, and a turn that ends here hands the owner back work the plan already gave you: every return to the owner has restarted the work. Do not end the turn. ${reviewed ? move : pointed ? `Send the step the pointer names, ${left[0]}, with the plan's path and the step's number: it stays next until an agent hands back for it with DONE as the first line, so a REFUSED or FAILED hand-back means sending it again.` : 'Send the next step, or the same step again if its agent ended at a refusal, with the plan\'s path and the step\'s number.'} Give the status at each agent's end. A turn may end only while an agent runs, with a choice only the owner can settle as the first thing in the reply, or declared in the first line: "Stopping here: open for you is <the specific thing>".${ejectedNow.size ? ` Step${ejectedNow.size === 1 ? '' : 's'} ${[...ejectedNow].join(', ')} ejected to the plan: when the plan cannot be rewritten without the owner's button, say so in the first line as "Step N ejected, it waits on <the specific thing>".` : ''}
`, reply);
}

if (unrecorded.length) {
  refuse(`STOP REFUSED — the plan's pointer reads next: none, and ${unrecorded.length} Found line${unrecorded.length === 1 ? '' : 's'} of its steps ${unrecorded.length === 1 ? 'is' : 'are'} sorted as queued in the manager notes with a note that names no key of a Found queue (${unrecorded.slice(0, 6).map((u) => `Found ${u.key}`).join(', ')}).

Doctrine §0e rule 2. A finding is recorded for the next plan in the NOTES.md \`## Found queue\` of a repository the plan's Files names, and that queue is the only record the next plan must answer: a line sorted as queued in the manager notes alone is lost when the session ends. Send an agent to write each into the queue under a new key, write the key into the Found line's note in status/manager.txt, and stop then. If no agent can record it, declare the stop in the first line: "Stopping here: open for you is <the specific thing>".
`, reply);
}

// A declared stop is allowed, and is the whole point of having a way through. So is the declaration that an ejected step waits on
// something: it is a hand-up, and the waiting and parking refusals below judge a turn that is carrying on.
if (DECLARED.test(reply) || ejectDeclared) {
  // The older declaration passes for one release, and the pass says so (Q-HUB-359).
  if (!FAULTS.length && DECLARED_OLD.test(reply) && !DECLARED_NEW.test(reply)) {
    process.stderr.write('STOP PASSED — the declaration "Stopping here: open for you is <X>" is the older form, accepted for one release; the form now is "Stopping here, then paused, pending <what lifts it>" or "Stopping here, then finished, nothing pending".\n');
  }
  finish();
}

// PARKING is judged on the LAST SENTENCE only, and that is not a nicety.
// "Let me know if that placement reads wrong — meanwhile I have started the
// tablet render" is a courtesy inside continuing work; the identical clause as
// the final thing said is a hand-off. A first version tested the last two
// paragraphs and refused that sentence, which is the false positive that
// teaches people to switch a guard off.
const sentences = reply.split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
// The last sentence that SAYS something: a trailing link, status line or
// parenthesis after the question used to hide it.
const tail = [...sentences].reverse().find((s) => !/^(?:<?https?:\/\/\S+>?|\(.*\)|Status\b.*|[-*_]{3,})$/.test(s)) ?? '';

/** …and even in the last sentence it is not a hand-off if the same breath says
 *  work is proceeding. Splitting by sentence was not enough: "Let me know if
 *  that reads wrong — meanwhile I have started the tablet render" is ONE
 *  sentence carrying both halves, and refusing it is the false positive that
 *  gets a guard switched off. Parking means asking for permission with nothing
 *  in flight; if something is in flight, it is a courtesy. */
// Only work that is ALREADY moving counts. "I'll continue" is removed: in "say
// the word and I'll continue" it is the parking offer itself, and it exempted
// the very sentence this guard exists to refuse.
const CONTINUING = /\b(?:meanwhile|in the meantime|meantime|carrying on|moving on|next up I|I(?:'| ha)?ve (?:started|kicked off|begun)|starting (?:on |the )?(?:the )?next|going on with)\b/i;

const waitHit = agentRunning ? undefined : WAITING.find((re) => re.test(reply));
const parkHit = CONTINUING.test(tail) ? undefined : PARKING.find((re) => re.test(tail));

// The template (shape 3) is judged above, before the declaration. The rest of
// §2 — the manufactured next step, the closing reflection, a decision list made
// of things that are not decisions — cannot be told from their honest twins by
// a pattern, and stays CHECKLIST.
if ((!waitHit && !parkHit) || !underPlan) finish();

const hit = waitHit ?? parkHit;
const quote = ((waitHit ? reply : tail).match(hit) ?? [''])[0].trim().slice(0, 80);
const why = waitHit
  ? 'says the work is not finished'
  : 'hands the turn back for permission to continue';

refuse(`STOP REFUSED — this reply ${why} ("${quote}") and does not declare a stop.

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
       Stopping here, then paused, pending <what lifts it>
     (the older "Stopping here: open for you is <the specific thing>" is
     accepted for one release). Not at the end. Not "I'll hold". The first line, or it reads as
     "I am continuing" and the silence gets discovered by being asked.

If there is genuinely nothing to wait for and nothing left to do, say what
landed and what is still owed — without a waiting sentence in it.
`, reply);
flushFaults();
