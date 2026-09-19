## 333 · A wait that outlives its subject is not a wasted process, it is the owner sitting there

**Enforced by:** CHECKLIST — no parser can tell a wait that is still needed
from one whose answer is already on disk.

The standing rule about waiting is about PROCESSES: never start one you will
not confirm dead, never poll a process NAME because `pgrep -f "foo"` matches
its own command line, poll a file or an exit code instead. That rule is real
and it is about leaks.

**This is the other half, and it is the expensive one.** The cost of a wait
that cannot end is almost never the memory. It is that somebody is on the other
side of it, watching nothing happen, while the thing they are waiting to hear
is already written down.

## What it cost, 2026-09-19

A tolerance sweep was started as a background script. It wrote its readings to
a log as it went and finished with the line `SWEEP DONE` in that same log. The
session then waited for it with `until ! pgrep -f "<script>"; do sleep 30;
done` — the forbidden form, which can never go false because pgrep matches the
shell running it.

**The sweep finished. Its results were read out of the log. The work continued
and was committed and pushed.** The loop went on cycling for about
twenty-four minutes after the last thing it could have been waiting for, and
was still cycling when the owner asked what was happening.

So the leak was the small half. The large half was that the answer had been in
hand the whole time, and the session had attached "am I finished" to a process
rather than to the answer.

## The rule

**Wait on the ANSWER, never on the messenger.** Before writing any wait, name
the artefact that will contain the result — a log line, a file, an exit code —
and poll that. If no such artefact exists, make the job write one; that is one
line and it is the difference between a wait that ends and a wait that cannot.

**And a wait is not a status.** Having something running is not the same as
having nothing to report. The moment the result exists, it is reportable
whether or not the machinery around it has exited — the loop in this case was
waiting on a script whose every finding had already been read, written up and
pushed.

## Why the existing rule did not catch it

The process rule is written as leak prevention — orphaned browsers, stranded
timers, a `ps` listing that lies. A session obeying it reads its own wait and
asks "will this terminate, and will I confirm the process is gone". Both
questions are about the process. **Neither asks whether anybody is waiting on
the other side of it, or whether what they are waiting for already exists.**
That is the question this adds, and it is the one with a person in it.
