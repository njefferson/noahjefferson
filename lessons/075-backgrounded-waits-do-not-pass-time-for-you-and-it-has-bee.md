## 75 · Backgrounded waits do not pass time for you, and "it has been half an hour" is a claim that needs a clock

**Enforced by:** CHECKLIST clock-before-you-conclude — before calling anything slow, stuck or hung, print the actual time and subtract. A launched `sleep` that has not returned is zero seconds of waiting, not N seconds. · CHECKLIST date-before-you-age-it — before calling anything old, stale or behind, read a timestamp. `git log -1 --format=%cd` costs nothing; HOW MUCH CHANGED is not how long it took.

A CI job was declared hung, cancelled, and reported to the owner as a
thirty-minute stall with a stale status field behind it. **The job was healthy.**
It was walking normally, the status was current, and the cancel killed it three
minutes in. The thirty minutes never happened.

**THE SAME RULE HAS A SECOND FACE, AND IT IS THE COMMONER ONE (2026-08-31).**
The first is *how long have I been waiting*. The second is **how old is this
thing**, and it fails the same way: by being estimated from evidence that is not
a clock.

A session's clone reverted to an earlier commit — routine in that container —
and the session reported the working tree as **"four months behind"** and wrote
it into a plan file as an established fact. The real gap was **eleven days**.
The repository was **thirty-four days old**, so four months had never been
possible, and the sentence could have been refused on its face by anybody who
knew when the project started.

**Where the number came from is the part worth keeping.** Nineteen capability
releases separated the two commits. Nineteen releases *feels* like months —
in most projects it would be. In this one the owner ships several a day, so it
was a fortnight. The session converted RELEASE DISTANCE into CALENDAR TIME
without reading a date, and the two have no fixed exchange rate.

**Why it is worse than a wrong number.** It was told to the owner about work he
had done the previous week, which invites the reply that the app is not even
that old — and it is: a session that misdates his own work by an order of
magnitude is a session guessing at the thing he can check fastest. Every other
claim it makes is then worth less.

**The mechanism, which generalises past this one tool:** each wait was started in
the BACKGROUND and then, without waiting for it to return, the next status query
went out. Four such waits were launched and each was mentally banked as though it
had completed — roughly half an hour of imagined elapsed time against about four
real minutes. Every subsequent inference was built on it: nine times the
baseline, therefore stuck; the log 404s, therefore stale bookkeeping; cancel to
recover the log.

**A launched wait is not a completed wait.** The asynchronous version of a thing
looks identical to the synchronous one right up until the moment it matters, and
the failure is silent because nothing anywhere says "0 seconds have passed".

**One real observation survives, and it is smaller than it was told:** a job that
had genuinely failed with a named assertion did report `in_progress` for some
minutes afterwards, proven by fetching its log. So the useful half of this stands
— **status is derived, output is primary; when they disagree, believe the
output** — and it is worth trying the log fetch even when the status implies it
will 404, because a log that comes back proves the status wrong.

**But it was then used as cover.** The second cancellation was justified by
citing this very lesson, on a job whose log had NOT been read and whose status
was not in fact stale. A rule that says "read the log" cannot license an action
taken without reading the log. That inversion is the thing to watch for: a
correct principle, invoked to skip the step it exists to require.

**And the cost lands on somebody else.** Cancelling a run destroys the evidence it
was about to produce and spends the owner's wall-clock re-running it. "Wait
longer" is nearly free; "cancel and re-run" is not, and the asymmetry should push
hard toward waiting — *actually* waiting, with the clock checked.


---
