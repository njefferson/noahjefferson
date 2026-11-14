// The cases and plants of stop-guard.mjs, hold 4 of the plan of 14 November. The shape is guard-cases/shape.mjs.
// The sentences for a feeling, a promise and a go-word are the ones the old stop guard's cases refused (commit 4ea3157).
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
const say = (text, extra = []) => ({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text }, ...extra] } });
const ask = { type: 'user', origin: { kind: 'human' }, message: { role: 'user', content: 'A plain message from the planted session.' } };
// The shape a live transcript records for a stop (measured 14 November 2026, no text copied): a harness user entry with isMeta, then a
// system entry of subtype stop_hook_summary whose hookErrors holds "[command hook N]: " and the refusing hook's error output.
const feedback = { type: 'user', isMeta: true, message: { role: 'user', content: 'Stop hook feedback: planted' } };
const summary = (errors) => ({ type: 'system', subtype: 'stop_hook_summary', hookCount: 3, hookErrors: errors, preventedContinuation: false, hookInfos: [{ command: 'command hook 1' }, { command: 'command hook 2' }] });
const ours = summary(['[command hook 2]: STOP REFUSED: this reply has 1 fault.\n- planted fault line']);
const theirs = summary(['[command hook 3]: There are 1 planted unpushed commits']);
const refusal = [feedback, ours];
// Runs the guard on a planted transcript; `entries` null means a path that holds nothing.
function run(h, dir, entries, payload = {}) {
  const path = entries ? h.transcript(entries) : join(h.tmp('sg-stop-'), 'absent.jsonl');
  return spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: JSON.stringify({ session_id: 'planted-session', transcript_path: path, stop_hook_active: false, ...payload }), encoding: 'utf8', timeout: 30000 });
}
const reply = (h, dir, text) => run(h, dir, [ask, say(text)]);
const refused = (r, re) => r.status === 2 && re.test(r.stderr);

export const cases = [
  {
    name: 'stop guard: a reply of 151 words is refused with its count and the way to cut it, one of 150 passes, and 400 words inside a fenced block with 20 outside pass',
    guards: ['stop_word_limit', 'stop_fence_set_aside'],
    run(m, dir, h) {
      const over = reply(h, dir, words(151));
      const exact = reply(h, dir, words(150));
      const fenced = reply(h, dir, `${words(20)}\n\n\`\`\`\n${words(400)}\n\`\`\`\n`);
      return h.assertAll([
        ['151 words is refused with its count', refused(over, /runs to 151 words, past 150/) && /put anything longer in a file/.test(over.stderr), over.status + over.stderr],
        ['150 words passes', exact.status === 0, exact.status + exact.stderr],
        ['400 words in a fence with 20 outside passes', fenced.status === 0, fenced.status + fenced.stderr],
      ]);
    },
  },
  {
    name: 'stop guard: a reply naming a feeling of the owner is refused and a plain sentence near it passes',
    guards: ['stop_feeling'],
    run(m, dir, h) {
      const sentences = ['I understand your frustration with the status page. The list now reads from the notes file.', 'You are clearly annoyed about this, and the record shows why.', 'The owner is upset by the stale page.'];
      const bad = sentences.map((s) => reply(h, dir, s));
      const plain = reply(h, dir, 'The list now reads from the notes file, and the status page shows it.');
      const quoted = reply(h, dir, 'The refusal said:\n\n```\nI understand your frustration.\n```\nThat is all it said.');
      return h.assertAll([
        ['each feeling sentence is refused as a feeling', bad.every((r) => refused(r, /names a feeling of the owner/)), bad.map((r) => r.status + r.stderr).join(' | ')],
        ['a plain sentence passes', plain.status === 0, plain.status + plain.stderr],
        ['the same words inside a fence pass', quoted.status === 0, quoted.status + quoted.stderr],
      ]);
    },
  },
  {
    name: 'stop guard: a reply promising conduct for a later turn is refused and a plain sentence near it passes',
    guards: ['stop_promise'],
    run(m, dir, h) {
      const sentences = ['The fence refused the read. From now on I will read the record first.', 'This will not happen again.', 'I promise the record is read.'];
      const bad = sentences.map((s) => reply(h, dir, s));
      const plain = reply(h, dir, 'The fence refused the read, and the record was read first this time.');
      return h.assertAll([
        ['each promise is refused as a promise', bad.every((r) => refused(r, /promises conduct for a later turn/)), bad.map((r) => r.status + r.stderr).join(' | ')],
        ['a plain sentence passes', plain.status === 0, plain.status + plain.stderr],
      ]);
    },
  },
  {
    name: 'stop guard: a reply whose open line asks for a go-word is refused and a sentence that only names one passes',
    guards: ['stop_go_word'],
    run(m, dir, h) {
      const bad = ['Say go to continue.', 'You can type go when the step should be sent.', 'Please give approval so the plan can run.', 'Send a go-word and the step goes.'].map((s) => reply(h, dir, s));
      const plain = ['The go-word is a thing the owner gives.', 'The review gate holds the next step until a message carries a go-word.', 'Stopping here, then paused; you say go and the gate sends the step.'].map((s) => reply(h, dir, s));
      const later = reply(h, dir, 'The page lists the open steps.\n\nSay go to continue.');
      return h.assertAll([
        ['each ask is refused as a go-word ask', bad.every((r) => refused(r, /asks the owner for a go-word/)), bad.map((r) => r.status + r.stderr).join(' | ')],
        ['sentences that only name a go-word pass', plain.every((r) => r.status === 0), plain.map((r) => r.status + r.stderr).join(' | ')],
        ['an ask on a later line is not the open line and passes', later.status === 0, later.status + later.stderr],
      ]);
    },
  },
  {
    name: 'stop guard: every fault of one reply is listed together in one refusal, and the refusal does not print the reply',
    guards: ['stop_word_limit', 'stop_feeling', 'stop_promise', 'stop_go_word'],
    run(m, dir, h) {
      const r = reply(h, dir, `Say go to continue. I understand your frustration. This will not happen again. ${words(160)}`);
      return h.assertAll([
        ['exit 2', r.status === 2, r.status],
        ['all four faults are named', /words, past 150/.test(r.stderr) && /feeling of the owner/.test(r.stderr) && /promises conduct/.test(r.stderr) && /go-word/.test(r.stderr), r.stderr],
        ['the refusal does not quote the reply', !/frustration|w100/.test(r.stderr), r.stderr],
      ]);
    },
  },
  {
    name: 'stop guard: an agent\'s stop passes whatever its reply says',
    guards: ['stop_agent'],
    run(m, dir, h) {
      const r = run(h, dir, [ask, say(words(300))], { agent_id: 'planted-agent' });
      return h.assertAll([['an agent\'s stop passes', r.status === 0, r.status + r.stderr]]);
    },
  },
  {
    name: 'stop guard: a turn that ended with a tool call has nothing to judge and passes',
    guards: ['stop_tool_call'],
    run(m, dir, h) {
      const call = { type: 'tool_use', id: 'planted-call', name: 'ExitPlanMode', input: {} };
      const r = run(h, dir, [ask, say(words(300), [call])]);
      const bare = run(h, dir, [ask, { type: 'assistant', message: { role: 'assistant', content: [call] } }]);
      return h.assertAll([
        ['a long text ending in a tool call passes', r.status === 0, r.status + r.stderr],
        ['a tool call with no text passes', bare.status === 0, bare.status + bare.stderr],
      ]);
    },
  },
  {
    name: 'stop guard: it refuses at most twice in one chain of stops, and the third stop passes with one line saying so',
    guards: ['stop_chain_cap', 'stop_own_refusals', 'stop_chain_owner'],
    run(m, dir, h) {
      const first = run(h, dir, [ask, say(words(200))]);
      const second = run(h, dir, [ask, say(words(200)), ...refusal, say(words(200))], { stop_hook_active: true });
      const third = run(h, dir, [ask, say(words(200)), ...refusal, say(words(200)), ...refusal, say(words(200))], { stop_hook_active: true });
      const noFlag = run(h, dir, [ask, say(words(200)), ...refusal, say(words(200)), ...refusal, say(words(200))]);
      // Another hook's refusals are not this guard's: two of them in the chain leave this guard free to refuse.
      const others = run(h, dir, [ask, say(words(200)), feedback, theirs, say(words(200)), feedback, theirs, say(words(200))], { stop_hook_active: true });
      // Two refusals of an earlier turn, then the owner wrote again: a new chain.
      const newTurn = run(h, dir, [ask, say(words(200)), ...refusal, say(words(200)), ...refusal, ask, say(words(200))]);
      return h.assertAll([
        ['the first stop is refused', first.status === 2, first.status + first.stderr],
        ['the second stop is refused', second.status === 2, second.status + second.stderr],
        ['the third stop passes and says why in one line', third.status === 0 && /^STOP PASSED: .*\n$/.test(third.stderr), third.status + third.stderr],
        ['two refusals with stop_hook_active absent pass too', noFlag.status === 0, noFlag.status + noFlag.stderr],
        ['another hook\'s two refusals are not counted, so this guard still refuses', others.status === 2, others.status + others.stderr],
        ['an owner message starts a new chain', newTurn.status === 2, newTurn.status + newTurn.stderr],
      ]);
    },
  },
  {
    name: 'stop guard: every refusal ends with the Why sentence, in plain English',
    guards: ['stop_why'],
    run(m, dir, h) {
      const rs = [words(151), 'This will not happen again.', 'Say go to continue.', 'I understand your frustration.'].map((t) => reply(h, dir, t));
      const why = 'Why: the reader wants the end result, not what was done or how, and cannot read a long reply. A feeling is not the session\'s to name, a promise is words about a later turn, and a go-word is for the one who types it to give.';
      return h.assertAll([
        ['each refusal ends with the Why sentence as its last line', rs.every((r) => r.status === 2 && r.stderr.trimEnd().split('\n').pop() === why), rs.map((r) => r.stderr).join(' | ')],
      ]);
    },
  },
  {
    name: 'stop guard: a transcript that cannot be read passes, and so does input that is not a payload',
    guards: ['stop_unreadable'],
    run(m, dir, h) {
      const absent = run(h, dir, null);
      const junk = spawnSync('node', [join(dir, 'stop-guard.mjs')], { input: 'not json', encoding: 'utf8', timeout: 30000 });
      return h.assertAll([
        ['a missing transcript passes', absent.status === 0, absent.status + absent.stderr],
        ['input that is not JSON passes', junk.status === 0, junk.status + junk.stderr],
      ]);
    },
  },
];

export const plants = {
  stop_word_limit: ['if (words > WORD_LIMIT)', 'if (false)', 'stop-guard.mjs'],
  stop_fence_set_aside: ["const prose = reply.replace(/```[\\s\\S]*?```/g, ' ');", 'const prose = reply;', 'stop-guard.mjs'],
  stop_feeling: ['if (EMOTION.some((re) => re.test(prose)))', 'if (false)', 'stop-guard.mjs'],
  stop_promise: ['if (PROMISE.some((re) => re.test(prose)))', 'if (false)', 'stop-guard.mjs'],
  stop_go_word: ['if (asksGoWord(open))', 'if (false)', 'stop-guard.mjs'],
  stop_agent: ['hook.agent_id || ', '', 'stop-guard.mjs'],
  stop_tool_call: ['if (Array.isArray(content) && content.some(', 'if (false && content.some(', 'stop-guard.mjs'],
  stop_chain_cap: ['if (held >= CHAIN_LIMIT)', 'if (false)', 'stop-guard.mjs'],
  stop_why: ['}\\n${WHY}\\n`);', '}\\n`);', 'stop-guard.mjs'],
  stop_own_refusals: ["typeof h === 'string' && h.includes(REFUSED_MARK)", "typeof h === 'string'", 'stop-guard.mjs'],
  stop_chain_owner: ['    if (isOwnerMessage(e)) break;\n', '', 'stop-guard.mjs'],
  stop_unreadable: ['if (!last) process.exit(0);', 'if (!last) process.exit(2);', 'stop-guard.mjs'],
};
