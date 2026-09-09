## 256 · A poll count is not a duration, and a field that does not change is not evidence of a thing that is not changing

**Enforced by:** CHECKLIST read-the-clock — any claim about how long something
has taken is read from `date`, never inferred from how many times it was
checked, how many messages have passed, or how long it felt. · CHECKLIST
a-backgrounded-sleep-is-not-a-wait — when a harness moves a long command to the
background, the command that follows runs immediately; wait for the completion
signal before acting on what the wait was for. · CHECKLIST
progress-has-its-own-endpoint — before calling a job stuck, read the thing that
reports steps, not the summary object. · JUDGEMENT — when to cancel a long
external run at all.

**Smell:** "this has been running for an hour" with no timestamp behind it.
A loop of *sleep, then immediately check*. A staleness argument resting on a
timestamp field rather than on progress. Any sentence converting a COUNT into a
DURATION. And the tell: the remedy being considered is cancel, retry, or force.

**2026-09-09.** A CI run was cancelled as wedged. It was thirteen minutes into a
fourteen-minute job. Nothing was lost but the minutes and a re-dispatch — which
ran on the same head commit and came back green, proving the run that was killed
would have too.

**Two independent misreads stacked, and either alone would have been harmless.**

The first: the harness moves a long `sleep` to the background almost
immediately, so the next command runs seconds later, not minutes later. Twelve
rounds of *wait, then poll* therefore covered about four minutes of wall clock
while feeling like an hour, because the felt duration came from the number of
rounds. **The number of times something was checked is not a duration.** This is
the same conversion error as reading nineteen releases as four months of
calendar time (§75), and it has the same one-line remedy: `date -u` costs
nothing and the poll count can never substitute for it.

The second: the run summary's `updated_at` sat frozen at the run's first second
and was read as proof it had stopped moving. It had not. That field does not
advance while a run is in progress — verified afterwards on a healthy run and on
a cancelled one, from two different endpoints. **A field that does not change is
not evidence of a thing that is not changing.** Progress was visible the whole
time on the jobs endpoint, which lists each step and when it started.

**The general shape.** Both errors substitute a cheap proxy for a measurement
that was one call away, and both proxies fail in the direction of alarm — they
make a working thing look stopped. That is the dangerous direction, because the
remedy it suggests is destructive: cancel, retry, force. Before acting on
"nothing is happening", establish what the clock says and what the progress
endpoint says. If neither has been read, "nothing is happening" is a feeling.
