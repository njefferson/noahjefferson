## 47 · A freshness limit belongs to whoever WRITES the field, not to what the field measures

**Enforced by:** GATE fauxplane:scripts/plant.mjs — the plant that ages a followed aircraft's fields on the registry's sensor windows; and GATE fauxplane:scripts/traffic-pacing.test.mjs, which asserts the RELATIONSHIP between the poll and the windows rather than the numbers.

fauxplane's field registry gives every value a window: past `freshMs` it reads
STALE, past `staleMs` it reads FAIL and the digits are removed. The registry's
own comment states the rule it was built on:

> Windows are chosen from how fast the underlying quantity actually changes, not
> from how often we happen to poll.

That is right for a sensor the device reads at 25 Hz. It is wrong the moment a
different source owns the same field.

Heading's limit is 5 s, because a magnetometer updates many times a second.
**Following an aircraft fills that same field from a feed polled every 10 s.**
The limit was half the cadence, so the field could never be anything but FAIL —
and the owner photographed a panel with every instrument crossed out at once,
power on, feed working, and wrote

**The correction is not to loosen the limits.** Provenance describes the
OBSERVATION, and **an observation cannot arrive faster than the thing observing
it reports.** So the writer declares the window and the registry becomes the
default rather than the authority. In an app whose model already said , ownership now moves the freshness window
with it — the fix was making the code agree with the design it already had.

**Two things made it invisible for six releases.** The cadence lived in one file
and the window in another, so nothing ever read them together; and the failure
looked exactly like the app's own honest failure mode. A panel built to cross
out what it cannot verify, crossing itself out, reads as working correctly.

**The test asserts the RELATIONSHIP, never the numbers** — `freshMs >= 2 polls`,
`staleMs >= 6 polls` — so changing the poll cannot quietly re-create it. Pinning
the constants would have passed forever while meaning nothing.

**Smell:** a staleness, timeout or retry threshold in one file and the cadence it must survive in another — especially when a second source can take over writing the same value.

*(fauxplane 1.22.0, 2026-08-04.)*

---
