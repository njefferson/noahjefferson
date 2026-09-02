## 211 · A once-a-night fetch turns an intermittent host into a dead one, and the record it leaves is a confident lie

**Enforced by:** GATE Jefferson-Line:tools/worker-check.mjs — asserts that a
request which never completed is retried exactly once, that the retry is what
gets recorded, and that a REFUSAL is not retried at all. · JUDGEMENT — which
outcomes deserve a second request is a decision about the other party's
server, and no gate can make it.

**Smell:** any scheduled job that touches a third party exactly once per run
and writes the result down as the state of that third party. The tell is a
health display that can say "unreachable" without also saying when the thing
last worked.

**Jefferson Line 0.3.0, 2026-09-02.** The nightly pass fetched each event
source once and recorded what came back. Measured against the real corridor
immediately after deploying: the Folsom Chamber answered 200 with thirty
events, answered 200 again, and then dropped the third request entirely.
One request per night, and roughly one night in three would have recorded a
perfectly healthy source as unreachable and shown an empty Folsom on
somebody's day — with nothing anywhere saying it had worked the night before.

**Two things had to be true for that to be survivable, and only one of them
was about retrying.**

The retry is the cheap half: one extra request, and only for a request that
never *completed*. A refusal is explicitly not retried — a challenge page is a
stable fact about where the request came from, and asking again is just a
second request the site did not want. Neither is an HTTP error: the host
answered, and it meant it. Retrying everything is how a polite nightly job
becomes a thing that gets blocked.

The expensive half is the record. A per-source health row that a failed run
OVERWRITES cannot tell "this source is broken" from "this source blinked",
because both print the same word. Keeping `last_ok_at` and its count in
columns a failure never touches is what makes the display honest: *refused
this Worker · last good run Tuesday, 30 events* is a different sentence from
*refused this Worker*, and only the first is true. That column pair was
already there for a different reason and is what made the flake diagnosable
rather than merely visible.

**The general form.** A scheduled probe of somebody else's service is a
SAMPLE, not a measurement, and a sample of one is indistinguishable from the
truth right up until it is wrong. Two rules fall out. Retry only the outcome
that means the request did not arrive, because that is the only outcome where
a second attempt is asking a different question. And never let a failing run
erase the record of the last one that succeeded — the whole value of source
health is in the comparison, and a single overwritten column throws it away.
