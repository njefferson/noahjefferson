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
source once and recorded what came back. Probed from the deployed Worker
immediately after shipping, the Folsom Chamber answered 200 with thirty
events five times out of eight and dropped three requests entirely — no
status, no refusal, nothing.

**And then the measurement turned out to be about the measuring.** A single
cold request ninety seconds later succeeded. Eight requests in a few minutes
is a burst; the thing being built touches that host ONCE A NIGHT and will
never produce one. So the failure rate under the real cadence was never
measured, and the first version of this lesson — and of the source inventory,
and of a commit message — stated a one-in-three failure rate as a fact about
the site. It was a fact about the probing.

That is the trap worth carrying away, more than the retry: **the cheapest way
to measure a third party is to hit it repeatedly, and that is exactly the one
pattern production never repeats.** A rate measured under a burst is not the
rate, and it reads as hard data because it came from the real host rather
than from a stub.

**Two things had to be true for that to be survivable, and only one of them
was about retrying.**

The retry is the cheap half, and it survives the correction above because it
was never priced against the bad number: one extra request a night, spaced
rather than immediate, spent against an outcome whose real probability is
UNKNOWN and whose downside is a person's day showing nothing with no
explanation. An immediate retry would also have been the same burst that
provoked the drops. It fires only for a request that never *completed*. A refusal is explicitly not retried — a challenge page is a
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
truth right up until it is wrong — while a sample taken as fast as you can
type measures your own impatience. Three rules fall out. Take the reliability
sample at the cadence the job will actually run, or say the rate is unknown. Retry only the outcome
that means the request did not arrive, because that is the only outcome where
a second attempt is asking a different question. And never let a failing run
erase the record of the last one that succeeded — the whole value of source
health is in the comparison, and a single overwritten column throws it away.
