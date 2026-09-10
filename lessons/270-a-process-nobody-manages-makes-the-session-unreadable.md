## 270 · A process nobody is managing is not free because it is quiet — it makes the session unreadable from outside

**Enforced by:** CHECKLIST own-what-you-start — every background command,
watcher, poll loop, browser and subagent is owned until CONFIRMED dead, and any
turn reporting on long-running work first counts what is alive with
`ps -eo etimes,args` and kills what is finished. · JUDGEMENT — before starting a
background wait, ask what it buys over checking the thing next turn; the honest
answer is usually nothing.

**Smell:** `until ! pgrep -f "<name>"`. A `sleep` whose only job is to wait for a
remote you could query directly. `chromium.launch()` with no `finally`. Any
reply containing "still running" written without having looked.

**Across this family, 2026-09-10, and it had to be said twice in one day.**

The first time, seven waiters were found stranded. The second time the owner
asked "you have three running tasks?" and the count was: one legitimate timer,
one waiter that had been stuck for **four hours**, and **eleven orphaned
Chromium processes**, eighty-two minutes old, reparented to init with nothing
driving them.

**THE COST IS NOT THE MEMORY.** Eleven browsers were about 800MB and the
container had fifteen gigabytes free. The cost is that **the owner cannot tell
a working walk from a dead timer.** From outside, three running tasks looks
like three things happening. The only way to find out is to ask — and being
asked is the signal the rule was already broken, because the answer should have
been swept and reported before the question arose.

**Three mechanisms, each of which actually produced one of these.**

**One — the self-matching poll.** `pgrep -f "smoke.mjs"` matches the command
line of the very shell running it, so `until ! pgrep -f "smoke.mjs"; do sleep 30;
done` can NEVER terminate. It is written because it reads correctly. It stranded
seven processes the first time and one for four hours the second, in the same
session, by the same session. **Poll a FILE or an exit code, never a process
name.**

**Two — the browser with no `finally`.** A walk that throws between `launch()`
and `close()` leaves Chromium parented to init. Nothing reaps it, and it does
not care that the script that made it is gone. Eleven survived here from
subagents that had already delivered their reports.

**Three — the subagent that outlives its own answer.** One reported in full,
then notified AGAIN an hour later because a measurement script inside it was
missing `process.exit(0)`. A subagent is a process; delivering a result is not
the same as exiting.

**The repair is a habit, not a tool.** Prefer not starting one: a sleep polling
a remote buys nothing over checking it next turn, and the instinct to reach for
a wait is usually the instinct to look busy. When one is genuinely needed, own
it — and any turn that reports on long-running work counts what is alive and
kills what is finished, in that turn, before writing the report.

**And when asked, answer honestly by kind.** Say which are real and which are
junk, kill the junk in the same turn, and never let a count of running tasks
stand as if it were a count of things happening.

**Related.** §11b — the credit is the owner's money, and a session that cannot
be read from outside cannot be judged for what it is spending.
