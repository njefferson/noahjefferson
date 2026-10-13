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
  and Grep; and, where the step works in the Jefferson-Photography-Studio
  repository, that repository's `tools/harness-guard.mjs` and
  `.claude/hooks/ident-guard.mjs`.

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
  wrong thing, which is any one of three things:
  - the cause of what the owner wants put right lies outside what the plan's steps
    may change;
  - a step's premise is shown false;
  - what the plan builds cannot give the outcome the owner wants.

  A refusal, a failure, or a defect with a known fix inside the plan's reach is not
  OFF-AIM: the main thread handles it and the plan goes on. ON-AIM otherwise.
- Route: every command and write that step M orders, read against the Rules, the
  doctrine, the gate list and the guards' code. ROUTE-REFUSED names each command or
  write a guard would refuse, the guard, and the line that refuses it. The guards
  are not only the hub's:
  - In a session with the Jefferson-Photography-Studio repository checked out, an
    agent that runs commands there meets two hooks of that repository's own, which
    are read in that repository and not in the live clone. `tools/harness-guard.mjs`
    refuses a `node` run, or a `node --check`, on a file under the session
    scratchpad that does not print a MADE TO FAIL block in a `console.log` of its
    own, a worktree's tracked files included, so a check of such a file is a child
    process of a scratch script that carries the block. `.claude/hooks/ident-guard.mjs`
    refuses any tool call whose input carries a run of seven or more hexadecimal
    characters that no earlier tool result of the session printed.
  - The harness's permission classifier is a third, and it is visible in no code.
    It refuses a command that destroys local work, a stash drop, a checkout or
    restore of a file, a clean or a reset among them, whatever the plan's Commands
    list says, and no hub gate shows it beforehand. A step that orders such a
    command is ROUTE-REFUSED, naming the classifier, and the amendment takes the
    work out by editing instead.
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
- `--floor "YYYY-MM-DD HH:MM"` goes with `--messages`: a California date and time
  before which nothing is printed, so a review reads the messages from the moment
  its plan's aim began and not the whole session. A message typed at the floor
  itself is printed. A floor written in any other form is said so, and is not
  applied. The control proves the floor before anything is printed: it checks the
  conversion of a California time to an instant on both sides of the change
  between summer and winter time, and that planted messages typed before the floor
  are dropped and those typed from it are kept.
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

// A California date and time, "YYYY-MM-DD HH:MM", as the instant it names; NaN when
// it is not written that way. The offset from UTC is read for the instant itself, so
// a time in summer and a time in winter each get their own.
function californiaMs(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(String(text ?? '').trim());
  if (!m) return NaN;
  const naive = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
  const wall = (ms) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
    return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  };
  const first = naive - (wall(naive) - naive);
  return naive - (wall(first) - first);
}

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

// The floor's control. Three planted messages typed at 12:00, 12:30 and 13:00 UTC on 2026-10-01, which is 05:00, 05:30 and 06:00 in California.
const atMinute = (min) => new Date(Date.UTC(2026, 9, 1, 12, min)).toISOString();
const plantedFloor = [0, 30, 60].map((min, i) => ({ type: 'user', timestamp: atMinute(min), origin: { kind: 'human' }, message: { role: 'user', content: `floor planted prompt ${i + 1}` } }));
const floored = owners(plantedFloor);
const keptFrom = (list, floorText) => list.filter((m) => m.typed >= californiaMs(floorText)).length;
const utcClock = (ms) => new Date(ms).toISOString().slice(11, 16);
console.log('MADE TO FAIL (the floor): the California time 2026-10-01 05:30 is 12:30 UTC and 2026-12-01 04:00 is 12:00 UTC, and of 3 planted messages typed at 12:00, 12:30 and 13:00 UTC a floor of 2026-10-01 05:30 must keep 2 and a floor of 2026-10-01 06:01 must keep 0.');
console.log('nothing below is trustworthy unless the floor control line prints 12:30, 12:00, 2 and 0.');
console.log(`floor control: ${utcClock(californiaMs('2026-10-01 05:30'))} UTC; ${utcClock(californiaMs('2026-12-01 04:00'))} UTC; ${keptFrom(floored, '2026-10-01 05:30')} kept at 05:30; ${keptFrom(floored, '2026-10-01 06:01')} kept at 06:01`);

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
    const floorText = flag('--floor');
    const floor = floorText === undefined ? -Infinity : californiaMs(floorText);
    if (floorText !== undefined && Number.isNaN(floor)) console.log(`the floor "${floorText}" is not written YYYY-MM-DD HH:MM in California time, so no floor was applied`);
    const from = Number.isNaN(floor) ? -Infinity : floor;
    for (const m of owners(entries).filter((x) => x.typed >= from && x.typed < cutoff)) console.log(`[${clock(m.typed)} California]\n${m.text}\n`);
  }
}
process.exit(0);
```
