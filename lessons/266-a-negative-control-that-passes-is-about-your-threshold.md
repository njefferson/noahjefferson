## 266 · A negative control that passes has told you about your threshold, not about your fix

**Enforced by:** CHECKLIST control-must-fail — a test is not trusted until it has
been run against a build with the defect deliberately restored AND been seen to
fail. Reading the numbers is not enough; the assertion has to reject them. ·
JUDGEMENT — when a control passes, the first suspect is the threshold, then the
instrument, and only then the belief that the defect was real.

**Smell:** an assertion whose bound was chosen to make the good build pass. Any
`if (n && …)` guard, which turns an empty measurement into a silent success. Any
comparison whose bound sits exactly ON a value the bad build can produce.

**Infrared Photography Studio, 2026-09-10, three in one afternoon.**

**One — the guard that skipped.** A walk timed which thumbnails a photo editor
redraws after a look, to prove the visible ones go first. It recorded NOTHING,
because the strip is rebuilt wholesale on every repaint and the observer watched
for attribute mutations that never happen. The assertion was
`if (order.length && hit < …)`, so an empty list skipped the check and the run
printed PASS. That is §250 wearing a guard clause.

**Two — the bound the defect could reach.** Rewritten to poll, the assertion
became `hit < Math.min(seen.length, 2)` — at least two of the first few redrawn
tiles must be on screen. The build with the OLD ordering scored exactly 2 and
passed. The bound had been picked by looking at what the good build produced and
leaving room, which is how a bound ends up sitting on the bad build's score. It
requires ALL of the first-redrawn tiles to be visible now, and the control fails
at 2 of 5.

**Three — resolution that manufactured the answer.** Strict at last, the FIXED
build then failed: the order came out 3,4,5,6,**0**,7. The poll ran every 150 ms
and recorded each interval's changes by ARRAY INDEX, so any two tiles finishing
inside one interval were written down in index order rather than completion
order — the very pattern under test, produced by the clock. At 40 ms it resolves
to 3,4,5,6,7 then 0,1,2.

**A fourth the same day, in a different walk.** A service-worker test asserting
that a new release WAITS passed against a build with `skipWaiting()` restored,
because it read the state immediately after the update appeared — an in-between
moment that looks identical in both builds. It waits for the takeover to have had
time to happen now.

**The shape.** Every one of these is the same error as measuring a proxy
(§262 and its family), turned on the TEST: the threshold, the guard clause and
the sampling rate are each a stand-in for "does this build have the defect", and
each can answer a different question while looking like an answer to that one.
A control is the only thing that asks the real question, and a control that
passes has answered it — just not the way it looks.
