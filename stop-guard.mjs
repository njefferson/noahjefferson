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
//   node stop-guard.mjs        (reads the hook payload on stdin)

import { readFileSync } from 'node:fs';
import { pendingMessages, startedAt } from './pending-guard.mjs';
import { tailEntries } from './transcript-tail.mjs';
import { latchStanding } from './hook-dispatch.mjs';
import { runningTasks } from './report.mjs';

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

// Already blocked once this turn. Never loop — the session gets one nudge.
if (hook.stop_hook_active) process.exit(0);

const path = hook.transcript_path;
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
 *  A status every five minutes is owed for as long as anything this session
 *  started is still running: a background command, a workflow, a background
 *  agent. report.mjs can only refuse a TOOL CALL, and a session that ends its
 *  turn makes none, so it was never refused. Turns ended under a declared stop
 *  went silent for ninety minutes while two workflows ran. So a stop is refused
 *  while any of them runs, declared or not. Stay in the turn, give the status
 *  every five minutes, and act on each result as it lands. What counts as
 *  running is `runningTasks` in report.mjs, the one definition this and the
 *  status gate share. */
let running = [];
try { running = runningTasks(readFileSync(path, 'utf8')); } catch { running = []; }
// A MESSAGE FROM THE OWNER WAITING IN THE QUEUE wins: pending-guard refuses every
// tool call until the turn ends and delivers it, so refusing the stop as well
// left no move at all. Measured three times in one afternoon, 2026-10-02.
let queuedOwner = [];
try { queuedOwner = pendingMessages(tailEntries(path, 16 * 1024 * 1024), startedAt(hook)); } catch { queuedOwner = []; }
if (running.length && !queuedOwner.length) {
  process.stderr.write(`STOP REFUSED — ${running.length} task(s) this session started are still running (${running.join(', ')}).

Doctrine §0e rule 2, LESSONS §381. A status at least every five minutes is owed
for as long as the work runs, and work running in the background IS the work.
Ending the turn makes no tool call, so nothing else can hold you to it. Do not
end the turn. Stay in it: give the status every five minutes, read from the
clock (report.mjs), and act on each result as it lands. If a task is no longer
wanted, stop it with TaskStop first.
`);
  process.exit(2);
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
    process.stderr.write(`STOP REFUSED — this reply says what state something is in, and no tool result came back this turn:
  "${claimed.slice(0, 240)}"

Doctrine §0e rule 15. A statement of what state a task, an agent, a branch, a
push, a deploy or a file is in is never made from memory. Read it now and say
what the read showed; or, if checking would be a big job, say "I think" in that
sentence and ask whether to run the check.
`);
    process.exit(2);
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
  process.stderr.write(`STOP REFUSED — this reply hands the owner a step ("${(handedIn.match(handed) ?? [''])[0]}").

LESSONS §370, rule 14 in HANDOFF.md. Look at it from the owner's side: never
hand the owner a step a session can do, and never send them to settings, a
menu, a setup script or an install. Try every route first and do it. If only
the owner can do it, ask for exactly that, doable in the app with a tap or a
reply — an approve button, a one-word answer.
`);
  process.exit(2);
}

const owed = OWING.find((re) => re.test(reply));
if (owed) {
  process.stderr.write(`STOP REFUSED — this reply tells the owner they are waited on or owe something ("${(reply.match(owed) ?? [''])[0]}").

LESSONS §370. Never "waiting on you", never "you owe". Name what is open
instead: "Open for you: <the specific decision>". If the work is
unfinished, carry on with it; if it genuinely stops, the first line is
"Stopping here: open for you is <the specific thing>".
`);
  process.exit(2);
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
  process.stderr.write(`STOP REFUSED — this reply asks for a plan's approval in chat ("${(reply.match(asked) ?? [''])[0]}").

LESSONS §370, rule 5 in HANDOFF.md. Approval is only the plan-mode button,
which ExitPlanMode puts in front of the owner. A chat turn before a plan says
what is being done and why, and asks nothing. Remove the request; if the plan
is ready, call ExitPlanMode.
`);
  process.exit(2);
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
  process.stderr.write(nextHit
    ? `STOP REFUSED — this reply asks the owner for the next work ("${said}").

Doctrine §0g, LESSONS §380. The ranked roadmap in the repo's NOTES.md names the
next work. Take it from there, the top items in parallel, and never hand the
owner a question the record already answers.
`
    : `STOP REFUSED — this reply offers to drop verification to save time ("${said}").

Doctrine §0g, LESSONS §380. Speed comes from cutting what is unnecessary, and
verification is not that: it runs ONCE, over the integrated release, before
anything reaches staging. Cut the per-step checks; never the release check.
`);
  process.exit(2);
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
  process.stderr.write(`STOP REFUSED — this reply ${longestRun >= 4 ? `opens ${longestRun} consecutive paragraphs with a bolded lead-in` : `is sectioned under ${headers} bold headers`}.

Doctrine §2: "the bolded lead-in on every paragraph" is a shape that looks like
content and is not — emphasis on everything is emphasis on nothing, and it makes
a reply scannable in appearance and flat in fact. Rewrite it as prose. Keep the
finding and what it costs; cut the shape.
`);
  process.exit(2);
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
function misplacedChoice(text) {
  const lines = String(text).split('\n');
  // A numbered list runs from an item through further items, indented lines
  // and blank lines, and ends at the first other line.
  const lists = [];
  let cur = null;
  lines.forEach((line, i) => {
    if (NUMBERED.test(line)) { if (!cur) { cur = { start: i, marked: [] }; lists.push(cur); } }
    else if (!(cur && (!line.trim() || /^\s+\S/.test(line)))) cur = null;
    if (cur && MARKED.test(line)) cur.marked.push(line.trim());
  });
  const marked = lists.filter((l) => l.marked.length);
  if (!marked.length) return null;
  const before = lines.slice(0, marked[0].start).filter((l) => l.trim()).length;
  if (before <= OPEN_LINES && marked.length === 1) return null;
  const out = before <= OPEN_LINES ? marked[1] : marked[0];
  return { line: out.marked[0], before: lines.slice(0, out.start).filter((l) => l.trim()).length };
}
const choiceHit = misplacedChoice(reply);
if (choiceHit) {
  process.stderr.write(`STOP REFUSED — this reply's choice is not the first thing in it. A numbered option carrying the recommended marker sits under ${choiceHit.before} lines of other text:
  "${choiceHit.line.slice(0, 200)}"

An open choice is the first thing in a reply until it is answered: a choice
placed under a long report was missed. Put the numbered options, recommendation
first, at the top — after a stop declaration and one lead-in line at most — and
the report beneath them. Write the choice once.
`);
  process.exit(2);
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
       Stopping here: open for you is <the specific thing>
     Not at the end. Not "I'll hold". The first line, or it reads as
     "I am continuing" and the silence gets discovered by being asked.

If there is genuinely nothing to wait for and nothing left to do, say what
landed and what is still owed — without a waiting sentence in it.
`);
process.exit(2);
