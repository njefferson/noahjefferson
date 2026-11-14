#!/usr/bin/env node
/**
 * THE STOP GUARD: HOLD 4, THE REPLY.
 *
 * Runs at the Stop event with the event's payload on standard input (session_id, transcript_path, stop_hook_active, and agent_id where the
 * stop is an agent's). It acts on the main thread only: with an agent_id, or with no transcript it can read, it exits 0. It reads the last
 * assistant message of the transcript (the text the owner will see) and refuses it, exit 2 with the reason on the error output, when the
 * reply:
 *   a. runs past 150 words, counted outside fenced code blocks;
 *   b. names a feeling of the owner's;
 *   c. promises conduct for a later turn;
 *   d. asks the owner for a go-word on its open line.
 * Every fault of one reply is listed in one refusal, and the refusal never prints or quotes a message of the owner's. A turn that ended in
 * a tool call, or in no text, has nothing to judge and passes. It can never loop: after two refusals in one chain of stops (the Stop-hook
 * refusals the transcript shows since the newest tool call) it passes with one line saying so. Any error inside it exits 0.
 *
 * Patterns b, c and d are lifted from the stop guard of commit 4ea3157 (FEELING and EMOTION, PROMISE, GO_VERB, GO_OBJECT, GO_ASK,
 * STOPPING_HERE, GATE_HOLD and goInstruction), as narrow as they were there.
 *
 * Other repositories still call this file by this path from their own Stop hooks, so the path stays.
 */
import { readFileSync } from 'node:fs';
import { tailEntries, textOf, isOwnerMessage } from './transcript-tail.mjs';

const WHY = 'Why: the reader wants the end result, not what was done or how, and cannot read a long reply. A feeling is not the session\'s to name, a promise is words about a later turn, and a go-word is for the one who types it to give.';
const WORD_LIMIT = 150;
const CHAIN_LIMIT = 2;

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
const GO_VERB = String.raw`(?:say|send|press|type|write|give)`;
const GO_OBJECT = String.raw`(?:(?:me|us|back|with|the word|a|an|the|one|your|any)\s+){0,4}(?:go[- ]?word|go|okay|ok|continue|approved?|approval|yes)\b`;
const GO_ASK = [
  new RegExp(String.raw`(?:^|[:;,—]\s*|\s-\s)(?:(?:please|just|then|and|simply|now)\s+)*${GO_VERB}\s+${GO_OBJECT}`, 'i'),
  new RegExp(String.raw`\b(?:you|the owner)\s+(?:(?:can|may|could|should|must|will|just|then|please|only|simply|now)\s+|(?:need|have)\s+to\s+)*${GO_VERB}\s+${GO_OBJECT}`, 'i'),
];
const STOPPING_HERE = /^[#*_>\s-]*stopping here\b/i;
const GATE_HOLD = /\b(?:holds?|held|holding|refus\w+|blocks?|blocked)\b[^.!?\n]*\buntil\b[^.!?\n]*/gi;

/** The instruction to the owner on a reply's open line, if there is one (the old `goInstruction`). */
function asksGoWord(open) {
  if (STOPPING_HERE.test(open)) return false;
  for (const s of open.split(/(?<=[.!?])\s+/)) {
    const said = s.replace(GATE_HOLD, ' ').trim();
    for (const re of GO_ASK) if (re.exec(said)) return true;
  }
  return false;
}

// WHAT THE REAL TRANSCRIPT SHOWS (measured 14 November 2026 on a live session's own transcript). Each Stop event that ran hooks is
// recorded as a `system` entry of subtype `stop_hook_summary`, after the harness's `user` entry with isMeta whose text opens "Stop hook
// feedback", and before the assistant's next entry. Its `hookErrors` is a list of strings, one per hook that refused, each opening
// "[<command>]: " and carrying that hook's error output; a stop nothing refused has an empty list. `hookInfos` names the hooks only as
// "command hook N", so the refusals of another hook cannot be told from this guard's by it. They are told by the text: this guard counts a
// summary only when one of its hookErrors holds REFUSED_MARK, the opening of its own refusal. The harness does not write stop_hook_active
// into the transcript; it is read from the payload.
const REFUSED_MARK = 'STOP REFUSED: this reply has';

/** This guard's refusals in the chain of stops the transcript shows: since the newest tool call or the owner's newest message; the refusal being made now is not yet written. */
function refusalsInChain(entries) {
  let n = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e?.type === 'assistant' && Array.isArray(e.message?.content) && e.message.content.some((b) => b?.type === 'tool_use')) break;
    if (isOwnerMessage(e)) break;
    if (e?.type === 'system' && e.subtype === 'stop_hook_summary' && Array.isArray(e.hookErrors)
      && e.hookErrors.some((h) => typeof h === 'string' && h.includes(REFUSED_MARK))) n++;
  }
  return n;
}

try {
  const hook = JSON.parse(readFileSync(0, 'utf8'));
  if (hook.agent_id || !hook.transcript_path) process.exit(0);
  const entries = tailEntries(hook.transcript_path);
  const last = [...entries].reverse().find((e) => e?.type === 'assistant' && !e.isSidechain && !e.agentId);
  if (!last) process.exit(0);
  const content = last.message?.content;
  if (Array.isArray(content) && content.some((b) => b?.type === 'tool_use')) process.exit(0);
  const reply = textOf(last);
  if (!reply.trim()) process.exit(0);

  const held = refusalsInChain(entries);
  const prose = reply.replace(/```[\s\S]*?```/g, ' ');
  const faults = [];
  const words = prose.split(/\s+/).filter(Boolean).length;
  if (words > WORD_LIMIT) faults.push(`it runs to ${words} words, past ${WORD_LIMIT} outside code blocks. Cut the reply to the result and put anything longer in a file.`);
  if (EMOTION.some((re) => re.test(prose))) faults.push('it names a feeling of the owner\'s. What a person feels is not the session\'s to say: answer what was asked and say what was done.');
  if (PROMISE.some((re) => re.test(prose))) faults.push('it promises conduct for a later turn. Say what was wrong and what was done, and stop there.');
  const open = prose.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  if (asksGoWord(open)) faults.push('it asks the owner for a go-word. A go-word is the owner\'s to give: end the turn and let the work that does not depend on it go on.');
  if (!faults.length) process.exit(0);

  // The cap holds whatever the payload says: stop_hook_active true with two of this guard's refusals in the chain is the case it is for,
  // and two refusals with the flag absent are let through as well, so the guard can never lock a session.
  if (held >= CHAIN_LIMIT) {
    process.stderr.write(`STOP PASSED: this chain of stops has already had ${held} refusals by this guard${hook.stop_hook_active ? ' (stop_hook_active is set)' : ''}, so this reply is let through unjudged.\n`);
    process.exit(0);
  }
  process.stderr.write(`${REFUSED_MARK} ${faults.length} fault${faults.length === 1 ? '' : 's'}.\n${faults.map((f) => `- ${f}`).join('\n')}\n${WHY}\n`);
  process.exit(2);
} catch {
  process.exit(0);
}
