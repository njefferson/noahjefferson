## 49 · A reason string is a value, and inventing one is the same defect as inventing a number

**Enforced by:** GATE fauxplane:scripts/plant.mjs — the plant that reports a quiet compass as a device without one, and the plant that makes the follow banner claim a broadcast that never arrived. Both are `tests` plants over pure wording functions.

fauxplane forbids synthetic data: every number traces to a sensor or a feed, and
a missing reading is FAIL with a reason. **The reasons were not held to the same
rule**, and one diagnostics report contained two fabricated ones.

** Twenty lines below, the same
report: `webkitCompassHeading 278.3`. The phone has a compass and was reporting
278.3°; it had stopped SENDING while the page was backgrounded. The filter's
`hasHeading` goes false for two unrelated reasons — no heading at all, and a
heading too old to use — and one sentence was printed for both.

** — printed
from the instant FOLLOW was pressed, while every followed field read and the feed was rate limited. It was showing nothing.

**Why this is worse than a bad number, not better.** A wrong number looks wrong;
a reader distrusts it and checks. A confident wrong sentence is believed, and
these two were specific enough to act on — one sends the reader off to replace
working hardware, the other tells them data is present on a screen that has
none. And the second sat at the top of a wall of red crosses, which is exactly
what made the owner report the panel as "broken without any data": **the app was
arguing with itself, and the prose was the part that was lying.**

**The fix is structural, not editorial.** Both wordings became PURE FUNCTIONS —
`headingReason` on the filter, `followBannerText` beside the feed — with every
branch unit-tested and a plant proving the test fails. Prose that states a fact
about the reader's hardware or about what is on screen is program output, and it
gets the same gate as a number.

**Smell:** a `fail`/error path whose message asserts a CAPABILITY ("this device has no…", "not supported", "unavailable on this platform") on a code path that is also reachable by a timeout, a stale reading, or a permission that has not been asked for yet.

*(fauxplane 1.22.1, 2026-08-04.)*

---
