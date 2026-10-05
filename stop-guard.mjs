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
// step again, instead of ending. A waiting owner message, a standing correction
// and a standing latch let the stop through, because each leaves no other move.
//
//   node stop-guard.mjs        (reads the hook payload on stdin)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { pendingMessages, startedAt } from './pending-guard.mjs';
import { tailEntries, lastOwnerMessage } from './transcript-tail.mjs';
import { latchStanding, approvedPlan, planSteps, correctionStanding } from './hook-dispatch.mjs';
import { runningWork, stepsReturned, planOrder, pointerOf } from './report.mjs';

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
const units = (text) => {
  const out = new Set();
  const add = (s) => { const t = s.toLowerCase().replace(/\s+/g, ' ').trim(); if (t.length >= REPEAT_MIN) out.add(t); };
  for (const line of String(text).split('\n')) {
    add(line);
    for (const s of line.split(/(?<=[.!?])\s+/)) add(s);
  }
  return out;
};

/**
 * Refuse the stop, record the reply that was refused, and say the follow-up is the correction only.
 * @param {string} message  the refusal's own words.
 * @param {string} reply  the reply just refused.
 * @returns {never} writes the message and FOLLOW_UP to stderr and exits 2. The
 *   record (the reply, the transcript's line count now, the time, and that no
 *   repeat has been refused yet) is what a follow-up is judged against; a
 *   failure to write it never costs the refusal.
 */
function refuse(message, reply) {
  try {
    mkdirSync(dirname(refusedFile()), { recursive: true });
    const lines = readFileSync(path, 'utf8').split('\n').filter((l) => l.trim()).length;
    writeFileSync(refusedFile(), JSON.stringify({ at: Date.now(), lines, reply, repeated: false }));
  } catch { /* the refusal stands without a record */ }
  process.stderr.write(message + FOLLOW_UP);
  process.exit(2);
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
const DECLARED = /^\s*(?:[#*_>\s-]*)stopping here[,:]?\s*open for you\b/i;

/** 4. OWING. A reply saying the reader is waited on, or owes anything, is
 *  refused (2026-09-28, LESSONS §370): say what is open for them instead. This
 *  is refused even under a declared stop, because the declaration used to BE
 *  "waiting on you" and the rule changed under it. */
const OWING = [
  /\bwaiting (?:on|for) you\b/i,
  /\byou owe\b/i,
  /\b(?:I'?m|I am|we'?re) waiting\b/i,
];

let payload = '';
try { payload = readFileSync(0, 'utf8'); } catch { /* no stdin */ }

let hook = {};
try { hook = JSON.parse(payload || '{}'); } catch { /* not JSON */ }

payloadSession = String(hook.session_id ?? '');

const path = hook.transcript_path;

// Already blocked once this turn. Never loop — the session gets one nudge, and
// one more only for a follow-up that sends the refused reply again (above).
// The follow-up is what was written after the refusal: it repeats the refused
// reply when it carries any of its lines or sentences of REPEAT_MIN characters
// or more. The refusal is made ONCE per turn (`repeated` in the record), so a
// session that keeps repeating is let through on the next stop, never looped.
// A record older than the owner's newest message belongs to an earlier turn.
if (hook.stop_hook_active) {
  try {
    const rec = JSON.parse(readFileSync(refusedFile(), 'utf8'));
    const ownerAt = lastOwnerMessage(tailEntries(path ?? '', 16 * 1024 * 1024))?.at ?? 0;
    if (path && rec && !rec.repeated && Number(rec.at) >= ownerAt) {
      const refused = units(rec.reply);
      const again = [...units(textAfter(path, Number(rec.lines) || 0))].filter((u) => refused.has(u));
      if (again.length) {
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
let running = [];
try { running = (runningWork({ session_id: hook.session_id, transcript_path: path }) ?? []).filter(HOLDS_STOP); } catch { running = []; }
// A MESSAGE FROM THE OWNER WAITING IN THE QUEUE wins: pending-guard refuses every
// tool call until the turn ends and delivers it, so refusing the stop as well
// left no move at all. Measured three times in one afternoon, 2026-10-02.
let queuedOwner = [];
try { queuedOwner = pendingMessages(tailEntries(path, 16 * 1024 * 1024), startedAt(hook)); } catch { queuedOwner = []; }
if (running.length && !queuedOwner.length) {
  refuse(`STOP REFUSED — ${running.length} task(s) this session started are still running (${running.join(', ')}).

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
"Stopping here: open for you is <the specific thing>".
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
const asked = ASKING.find((re) => re.test(reply));
if (asked) {
  refuse(`STOP REFUSED — this reply asks for a plan's approval in chat ("${(reply.match(asked) ?? [''])[0]}").

LESSONS §370, rule 5 in HANDOFF.md. Approval is only the plan-mode button,
which ExitPlanMode puts in front of the owner. A chat turn before a plan says
what is being done and why, and asks nothing. Remove the request; if the plan
is ready, call ExitPlanMode.
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
if (nextHit || dropHit) {
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
if (longestRun >= 4 || headers >= 3) {
  refuse(`STOP REFUSED — this reply ${longestRun >= 4 ? `opens ${longestRun} consecutive paragraphs with a bolded lead-in` : `is sectioned under ${headers} bold headers`}.

Doctrine §2: "the bolded lead-in on every paragraph" is a shape that looks like
content and is not — emphasis on everything is emphasis on nothing, and it makes
a reply scannable in appearance and flat in fact. Rewrite it as prose. Keep the
finding and what it costs; cut the shape.
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
const choiceHit = misplacedChoice(reply);
if (choiceHit) {
  refuse(`STOP REFUSED — this reply's choice is not the first thing in it. A numbered option carrying the recommended marker sits under ${choiceHit.before} lines of other text:
  "${choiceHit.line.slice(0, 200)}"

An open choice is the first thing in a reply until it is answered: a choice
placed under a long report was missed. Put the numbered options, recommendation
first, at the top — after a stop declaration and one lead-in line at most — and
the report beneath them. Write the choice once.
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
//
// What lets the turn end anyway, each of them a reason a turn must end rather
// than carry on: an agent of the session is running (its completion notice
// brings the session back); a message from the owner is waiting in the queue
// (ending the turn delivers it); a correction from the owner stands, because
// rule 3 makes answering it the whole turn and refuses every other call, so a
// refused stop would leave no move at all; the reply opens with a choice only
// the owner can settle (`opensWithChoice`); or its first line declares the stop
// with what is open (`declaresStop`). A session whose agents or plan cannot be
// read is not refused: this never holds a turn for steps it cannot count.

/** The first line's declaration WITH what is open: "Stopping here: open for you
 *  is X", where X is at least a few words on the same line. */
const DECLARED_OPEN = /^\s*(?:[#*_>\s-]*)stopping here[,:]?\s*open for you\b[ \t]*(?:is|are|:)?[ \t]*(\S[^\n]{6,})/i;

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
 * The approved plan's steps no agent has returned for.
 * @param {{returned: Set<number>, running: string[]} | null} state  `stepsReturned`'s answer.
 * @returns {number[]} the plan's `## Steps` numbers, in plan order, that no
 *   agent ended by a report for; empty when no approved plan is in force (none
 *   recorded, or its file no longer matches the hash recorded at approval) or
 *   when `state` is null. The refusal below names exactly these.
 */
function stepsLeft(state) {
  const plan = approvedPlan();
  if (!plan || !state) return [];
  // THE POINTER (Doctrine §0e rule 2): where the plan has an `## Order`, the one
  // step left is N, the first number in Order with no hand-back opening DONE; a
  // REFUSED or FAILED hand-back leaves it where it is. A plan with no Order keeps
  // the older count of steps no agent ended by a report for.
  if (planOrder(plan.text)) {
    const next = pointerOf(plan.text, state.ends).next;
    return next === null ? [] : [next];
  }
  return planSteps(plan.text).filter((n) => !state.returned.has(n));
}

/** Does the approved plan in force define a pointer (an `Order:` line)? */
function hasPointer() {
  const plan = approvedPlan();
  return !!plan && !!planOrder(plan.text);
}

let left = [];
try {
  const state = stepsReturned({ session_id: hook.session_id, transcript_path: path });
  if (state && !state.running.length && !queuedOwner.length && !opensWithChoice(reply) && !declaresStop(reply)
    && !correctionStanding({ session_id: hook.session_id, transcript_path: path })) left = stepsLeft(state);
} catch { left = []; }
if (left.length) {
  const pointed = hasPointer();
  refuse(`STOP REFUSED — this turn ends with ${pointed ? `the plan's pointer at next: step ${left[0]}, ` : `${left.length} step${left.length === 1 ? '' : 's'} of the approved plan still open (${left.join(', ')}), `}no agent of this session running, and no choice for the owner or declared stop with what is open.

Doctrine §0e rule 2, §11c. An approved plan is the instruction for all of it, and a turn that ends here hands the owner back work the plan already gave you: every return to the owner has restarted the work. Do not end the turn. ${pointed ? `Send the step the pointer names, ${left[0]}, with the plan's path and the step's number: it stays next until an agent hands back for it with DONE as the first line, so a REFUSED or FAILED hand-back means sending it again.` : 'Send the next step, or the same step again if its agent ended at a refusal, with the plan\'s path and the step\'s number.'} Give the status at each agent's end. A turn may end only while an agent runs, with a choice only the owner can settle as the first thing in the reply, or declared in the first line: "Stopping here: open for you is <the specific thing>".
`, reply);
}

// A declared stop is allowed, and is the whole point of having a way through.
if (DECLARED.test(reply)) process.exit(0);

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

const waitHit = WAITING.find((re) => re.test(reply));
const parkHit = CONTINUING.test(tail) ? undefined : PARKING.find((re) => re.test(tail));

// The template (shape 3) is judged above, before the declaration. The rest of
// §2 — the manufactured next step, the closing reflection, a decision list made
// of things that are not decisions — cannot be told from their honest twins by
// a pattern, and stays CHECKLIST.
if (!waitHit && !parkHit) process.exit(0);

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
       Stopping here: open for you is <the specific thing>
     Not at the end. Not "I'll hold". The first line, or it reads as
     "I am continuing" and the silence gets discovered by being asked.

If there is genuinely nothing to wait for and nothing left to do, say what
landed and what is still owed — without a waiting sentence in it.
`, reply);
