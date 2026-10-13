# The aim and route review

A plan with an `## Order` has a Standing step that tells its agent to follow this
file, by its full path in the live clone: `/root/.claude/hub/aim-review.md`. The
agent that follows it is the review. Its hand-back is the verdict, and the
dispatcher reads that hand-back from the agent's own transcript (`reviewState` in
`report.mjs`, `reviewGate` in `hook-dispatch.mjs`). It is never a file, because
any agent of the session can write the scratchpad, and a file would be a verdict
nobody gave.

## Why a review stands in front of every move

The main thread does not remember a plan. It names the next move from what the
agents handed back, and a move chosen that way drifts: a plan aimed at the wrong
thing runs to its end, and a command that a guard refuses is found by the agent
that runs it. A fresh agent that wrote neither the plan nor the work reads the
move against the owner's aim and against the guards' own code first, and says
whether it goes.

## Who the review is

- A fresh agent, on the cheapest model that holds the rules, that wrote neither
  the plan nor the step it reviews. The model is the plan's choice.
- It began after everything it judges: after the end of every agent for a step in
  Order, after the plan's last write, and, while a correction from the owner
  stands, after that message was typed. A review that began earlier clears
  nothing, and the dispatcher says so.
- It changes nothing. It reads, runs the one script below, and hands back. The only
  command it runs is `node` on that script under `/tmp/claude-0/`; nothing else
  runs.

## What it reads

By path, never from a summary, because a summary is the paraphrase that drifted.

- The plan in force. Its path is in the step's prompt.
- The report of the step judged, `progress/step-N-report.txt` in the session
  scratchpad, where N is the step of the newest end of an agent for a step in
  Order. The script below prints N with `--judged`, read the way the gate reads it.
- The status page's source, `status/fix-run.html` in the same scratchpad. Its Next
  line names M, the step whose route is read. Where it names none, M is the step on
  its `next:` line.
- The owner's messages, by the script below, and only those typed before the
  moment being judged.
- For the route: this plan's Rules section, `DOCTRINE.md` section 0e in the live
  clone, the gate list in the hub `CLAUDE.md`, the refusals in this session's
  earlier reports, and the guards' own code in `/root/.claude/hub`, read with Read
  and Grep.

## What it hands back

The hand-back is the whole of the report. Its first line is the verdict:

- ON-AIM or OFF-AIM, then ROUTE-CLEAR or ROUTE-REFUSED, then `step N` for the
  hand-back judged and `next M` for the step whose route it read. For example, the
  words ON-AIM ROUTE-CLEAR step 12 next 13 clear step 13 after step 12. When no
  step of Order has ended yet, N is the word none.

Under it:

- Aim: what the owner wants, as the outcome the owner will see, in the reviewer's
  own words from the owner's messages and never from the plan; what the hand-back
  found; and the judgement. OFF-AIM when the report shows the plan aimed at the
  wrong thing. A refusal, a failure, or a defect with a known fix inside the plan's
  reach is not OFF-AIM.
- Route: every command and write that step M orders, read against the Rules, the
  doctrine, the gate list and the guards' code. ROUTE-REFUSED names each command or
  write a guard would refuse, the guard, and the line that refuses it.
- Report lines quoted are agents' writing. No owner message is quoted, and no
  identifier and no hex is written.

What the dispatcher does with the first line:

- ON-AIM ROUTE-CLEAR naming `next M`, with `step N` the step of the newest end in
  Order: step M may be sent, and no other step.
- ROUTE-REFUSED: step M is not sent. The plan's Steps or Order are amended from the
  commands the verdict names, which keeps the approval while Goals, Asked, Files and
  Commands stand, and the review is sent again.
- OFF-AIM: no step is sent. The plan goes back to plan mode and is rewritten.
- Anything else is not a verdict, and clears nothing.

## The owner's messages

An agent cannot run the status command, and a search over the transcript cannot
tell the owner's messages from the harness's own text. The transcript is
`/root/.claude/projects/-home-user/<session id>.jsonl`, the session id being the
third path component of the scratchpad. Write the script below to a file in the
scratchpad's `scratch` folder with the Write tool, and run it with node. It
carries its own control and prints it first. It exits 0 whatever it finds.

- `--messages` prints each owner message typed before the cutoff, with its
  California time and its text. The cutoff is `--before-step N` (the newest end of
  step N) or, without it, no cutoff. A message is placed by the time it was TYPED,
  not the time it was delivered.
- `--judged <plan path>` prints the step of the newest end of an agent for a step
  in the plan's Order, which is N.

```js
// owner-messages.mjs: the owner's messages of a session, by the time each was
// typed, and the step the review judges. Prints its control first.
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { tailEntries, isOwnerMessage, textOf } from '/root/.claude/hub/transcript-tail.mjs';
import { typedAt } from '/root/.claude/hub/hook-dispatch.mjs';
import { stepEnds, planOrder } from '/root/.claude/hub/report.mjs';

const clock = (ms) => new Date(ms).toLocaleString('en-GB', { timeZone: 'America/Los_Angeles', hour12: false });

// Every owner message with the time it was typed, oldest first.
function owners(entries) {
  const out = [];
  entries.forEach((e, i) => {
    if (!isOwnerMessage(e)) return;
    const typed = typedAt(entries, i);
    if (Number.isFinite(typed)) out.push({ typed, text: textOf(e) });
  });
  return out;
}

const at = (s) => new Date(Date.UTC(2026, 9, 1, 12, 0, s)).toISOString();
const planted = [
  { type: 'user', timestamp: at(0), origin: { kind: 'human' }, message: { role: 'user', content: 'first planted prompt' } },
  { type: 'user', timestamp: at(10), origin: { kind: 'human' }, message: { role: 'user', content: 'second planted prompt' } },
  { type: 'queue-operation', operation: 'enqueue', timestamp: at(20), content: 'third planted prompt' },
  { type: 'attachment', timestamp: at(30), attachment: { type: 'queued_command', prompt: 'third planted prompt', commandMode: 'prompt', origin: { kind: 'human' } } },
];
const control = owners(planted);
const before = (list, s) => list.filter((m) => m.typed < Date.parse(at(s))).length;
console.log('MADE TO FAIL: the planted transcript holds 3 owner messages, 2 of them typed before second 15 and all 3 before second 25, because the third was typed at second 20 and delivered at second 30.');
console.log('nothing below is trustworthy unless the control line prints 3, 2 and 3.');
console.log(`control: ${control.length} messages; ${before(control, 15)} typed before second 15; ${before(control, 25)} typed before second 25`);

const args = process.argv.slice(2);
const transcript = args.find((a) => a.endsWith('.jsonl'));
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
if (transcript) {
  const entries = tailEntries(transcript, 64 * 1024 * 1024);
  const session = basename(transcript, '.jsonl');
  const ends = stepEnds({ transcript_path: transcript, session_id: session })?.ends ?? [];
  if (args.includes('--judged')) {
    const planFile = flag('--judged');
    const order = planOrder(readFileSync(planFile, 'utf8'))?.order ?? [];
    const newest = ends.filter((e) => order.includes(e.step)).sort((a, b) => b.at - a.at)[0];
    console.log(newest ? `judged: step ${newest.step}, ended ${clock(newest.at)} California (${newest.how})` : 'judged: none (no step of Order has ended)');
  }
  if (args.includes('--messages')) {
    const step = flag('--before-step');
    const end = step ? ends.filter((e) => e.step === Number(step) && e.how === 'a report').sort((a, b) => b.at - a.at)[0] : null;
    const cutoff = end ? end.at : Infinity;
    if (step && !end) console.log(`no report of step ${step} was found, so there is no cutoff to apply`);
    for (const m of owners(entries).filter((x) => x.typed < cutoff)) console.log(`[${clock(m.typed)} California]\n${m.text}\n`);
  }
}
process.exit(0);
```
