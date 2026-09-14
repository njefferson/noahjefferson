## 302 · An instrument under time pressure produces confident wrong numbers, and only a control it cannot pass tells you which ones

**Enforced by:** CHECKLIST control-per-measurement — every measurement carries at
least one assertion that would fail if the instrument were not reaching the thing
it claims to measure: the state was reached, the action took effect, the signal
was strong enough to have the property being measured. · CHECKLIST fail-it-first
— run the negative control and believe it over the reasoning that produced the
setup.

**Smell:** a number that arrives without a control beside it. A metric that
divides by a channel, a count, or a duration that can legitimately be zero. A
selector or id chosen by pattern match rather than named outright. A "tight"
race constructed from an API whose timing was reasoned about rather than
measured. A worst-case that comes from the darkest, smallest or shortest sample
in the set.

**Measured 2026-09-14, Jefferson-Photography-Studio — four in one investigation,
each of which produced a number confident enough to act on.**

- **A distance that divided by zero.** Colour distance as a ratio against green.
  The first real measurement returned **95.7** on a red-flooded infrared frame
  where green was exactly 0. Fixed by using each channel as a fraction of the
  three, which is bounded in 0..1 whatever the channels do.
- **A worst case drawn from the dark.** The same metric then reported **0.548**
  from a patch of near-black canopy, where every channel is a handful of counts
  and the fractions swing on rounding. A screenshot of that exact spot shows
  nothing wrong. Fixed with a brightness floor — and the floor is a control, not
  a filter: it asserts the sample had the property being measured.
- **A race that was not one.** `location.reload()` issued in the same task as the
  action it was meant to beat. Reload only QUEUES a navigation; the document
  keeps running and the write commits. The negative control — the same walk
  against a build with the fix REMOVED — came back **four of four green**.
  Closing the page instead destroys the renderer with the write in flight, which
  is what a discarded tab does, and is the only version that fails.
- **The wrong control driven.** A strength sweep that reported six identical rows
  across six values, because the id was chosen with `.find(/stren/i)` and the
  first match in the document was the macro stacker's `stkMatchStrength`.

**AND A FIFTH THAT COST THE MOST, because it had no control at all.** A walk
compared a healed patch against a ring **1.6-2.6 radii** from its centre while
the code under test matches on **1.05-1.5** — so it measured a neighbourhood the
search never claimed, reported 0.150, and a defect was written up as reproduced.
Two changes went into a pixel pipeline on the strength of it and both were
reverted. Asking the question the code actually answers — how does the app's
pick compare with the best available to it — returned **0.000 to 0.007** with no
gap anywhere: nothing was wrong.

**The pattern across all five: the instrument is written to confirm a theory that
already exists, so it inherits the theory's assumptions and reports them back as
data.** The controls that caught four of them were cheap and dull — did the look
reach the canvas, did the tap create a spot, was the sample bright enough, did
the slider change value. The one with no control is the one that generated work.

**A measurement without a control is a theory wearing a number.** Numbers end
arguments, which is exactly why an uncontrolled one is more dangerous than no
measurement at all.

**A fifth, found the same week and worth its own paragraph because the repair
was the interesting part.** A walk asserted that a step's five named sub-timings
add up to the step. They could not: the step was measured across a whole
function while the five clocks covered only its middle, so the head and tail —
real work, before the first clock and after the last — belonged to no part. On
an idle machine both are fast and the check passed.

**Twice it went red under load, and twice the repair was to the tolerance.**
First a 5% allowance. Then a 4.5% failure that re-ran green, answered with an
absolute 6 ms floor under a comment reasoning carefully about five
whole-millisecond ROUNDINGS. Rounding was never the mechanism. The floor was
fitted to a story rather than derived from the variable that actually moved, so
the next full sweep failed on the same check while standalone runs measured
0 ms, 0 ms and 1 ms.

**A tolerance covering the wrong variable is indistinguishable from a correct
one on an idle machine, and it explains nothing.** The tell is that the comment
justifying it reasons about a mechanism nobody measured — five roundings is a
plausible number with no observation behind it. The fix was to make the parts
partition the whole by construction: a timestamp as the function's first
statement and another as its last, reported as a sixth part. The tolerance is
now six roundings and covers only roundings. Verified with four cores
deliberately loaded: 0 ms, 1 ms, 1 ms.

**And read the smell forward:** re-running a failed check until it passes is not
evidence of flake, it is evidence that nothing has been measured yet. The
question a re-run cannot answer is which variable moved.

**And a sixth, which is the same error made a second time and caught by the same
control.** A check read a tile's text straight after an action and went red only
under load. Diagnosed as "reading state written by a promise nothing waits for"
and fixed by making the check WAIT fifteen seconds for the text to change. It
passed. The next full sweep failed it again, having burned the whole timeout
first — a fast failure turned into a slow one, with the same verdict.

**The text was not late; it was never going to arrive.** The state changed in a
promise, and the element's text is built at render time — nothing redrew it
afterwards. On an idle machine an unrelated repaint usually came along within a
frame or two, which is why it had looked correct for the life of the feature.

**Waiting cannot produce a repaint that nothing schedules**, and the general
form is worth carrying: *a check that has to wait for a repaint is usually
telling you the repaint is missing.* A tolerance and a timeout fail the same
way — both widen until the symptom stops, and neither names a variable.

There is a second half, and it is the one that nearly got away. With the wait
removed the check STILL passed against the unfixed build, because the step
before it opened and closed a dialog — a repaint plus the better part of a
second, long enough to correct the stale element before the check meant to catch
it looked. **A check can be contaminated by the step in front of it**, and the
tell is a negative control that refuses to go red. Reordered so the reading
happens first — which is also what the user sees — it fails on the unfixed build
and passes on the fixed one, on an idle machine, with no load required.
