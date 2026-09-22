## 349 · A count derived from traffic measures how much, not how many — and the week it read exactly right is the dangerous one

**Enforced by:** CHECKLIST two-readings-before-a-control-means-anything — one
reading of a control gives that day's error and nothing else; only a second says
whether the error is a constant. A control used as a correction after a single
reading is a guess wearing a measurement's clothes. · CHECKLIST
a-correct-reading-is-not-a-calibrated-one — when an uncalibrated instrument
agrees with the truth, record the agreement and the prior disagreement in the
same breath, because the agreement standing alone reads as accuracy and there is
nothing in it that says otherwise. · JUDGEMENT — whether a metric tracks the
thing it is named for or tracks the activity that produces it cannot be settled
inside the data; it takes a fact from outside, and then it takes that fact twice.

**Smell:** a metric that moves when the work moves. Also: an instrument whose
error changed by more than the quantity it is measuring. Also: relief at a number
that has finally started looking right.

**The hub, 2026-09-22.** An invite-only app is the control case for the analytics
snapshot, because its headcount is known and nothing else in the dataset can be
checked. It had been measured once, on 2026-09-03: **29 distinct mobile/tablet
devices against an invite list of 3**, a factor of 9.7 on an app with no crawl
surface at all. That reading was recorded as the correction the other apps'
numbers could be read through.

Eighteen days later the same app reported **6 devices against an invite list of
6**. A factor of **1.0**.

The three figures that matter are these:

- **Population: 3 → 6.** It doubled.
- **Measured devices: 29 → 6.** Down 79%.
- **That app's requests: 4,005 → 1,831.** Down 54%.

**The measurement moved with the requests and against the population.** Not noisy
around the truth, not drifting — pointing the other way. The population went up
and the number named for it went down, while the number it actually follows went
down with it.

**And the exactly-right reading is the dangerous half.** An instrument 9.7x over
in early September and precisely correct three weeks later has not become
accurate. It is uncorrelated, and it has landed on the answer once. That is the
single most misleading output an uncalibrated instrument can produce, because
every other kind of wrong announces itself and this one does not — the only
reason this reading is known to be luck is that a disagreeing reading is sitting
next to it in the same file. Had the control been started three weeks later, 1.0
would have been its whole history, and the number would have been trusted.

**The estate-wide view says the same thing without needing the anchor.** Over
those eighteen days total eyeball requests went 22,922 → 66,396, nearly tripling,
while the device upper bound went 150 → 122, falling 19%. The two layers moved in
opposite directions over one window. And a third of all requests — 22,239 of
66,396 — came from one app's production and staging hostnames, which is exactly
where the period's commits went.

**The general form.** A count derived from traffic measures HOW MUCH the thing
was used, not HOW MANY used it. Those two track each other loosely in a product
with strangers in it, and they come apart hardest wherever the builder's own
activity dominates the traffic — which is every app before it has an audience,
which is to say every app at the moment somebody most wants to know the number.

**What two readings support, and what they do not.** Two points say the factor is
not a constant. They do not say what the relationship is, and they are not a
trend. The correct use of this control is not to divide by it. It is to keep
answering the one question the data cannot: is this number moving because the
readership moved, or because the work did.
