## 325 · A window fitted to a rendering measures that rendering's scale, so a change to the stage in front of it re-cuts the window silently — and the check that would have seen it had been written and not run

**Enforced by:** CHECKLIST run-the-walk-before-a-look-is-done — a walk that
holds a fitted constant to its frame runs on every change to any stage
upstream of that constant, before the change is called done, not at the
next release. · CHECKLIST fit-relative-where-the-scale-can-move — a
threshold on a rendered quantity is expressed relative to the same
rendering's own mean where one exists, and where it cannot be, the record
beside it names the scale it was cut on. · JUDGEMENT — a constant with a
measurement beside it looks finished; the measurement is of a scale, and
nothing in the constant says which.

**Smell:** a threshold on "chroma", "value" or "saturation" with a date and
a frame list beside it, in a pipeline whose upstream stages have changed
since that date; a slider that "does nothing" on every frame while every
gate is green; a walk check in the tree that has never been seen green.

**What happened.** A film look's sky-depth stage keyed once per photograph
on the sky's mean rendered chroma: a window of 0.32–0.42, cut from seven
frames on the day it was built — overcast 0.27, clear skies 0.43–0.57 —
under a look that carried global saturation 3. The same evening the look
moved to global saturation 1 with the sky's colour on a later stage, one the
map is deliberately rendered without. Every sky now read a third of what the
window expected: 0.018 to 0.32, all under 0.32, all keyed to 0. The Sky
depth slider was dead on every photograph and nothing was red. A walk check
for exactly this — "the slider still deepens the sky" — existed in the
tree, written the day before, and had not been run since the look moved. Its
first run read value 0.923 at depth 0 and 0.923 at depth 0.5.

**The second window went the same way, further.** A per-texel grey guard,
0.06–0.14 absolute, cut so a hot-spot centre at 0.27 stayed off it. On the
new scale that centre reads 0.027 and three of five blue skies had their
palest twentieth on the ramp — the block artefact the guard existed to
prevent, produced by the guard.

**The fix is two things, and the second is the lesson.** The key now reads
the chroma as the later stage will show it, and the numbers come off the
app's own report so the re-cut is measured rather than reasoned. And the
guard is RELATIVE — the texel's chroma over its own sky's mean — because a
ratio of two quantities on the same scale does not move when the scale does.
Where a threshold can be expressed that way it should be; where it cannot,
the constant's comment names the scale it was cut on, so the next session
that moves an upstream stage knows it has moved this too.

**The cost.** A shipped-to-branch look with a dead slider, found by a walk
that had been waiting in the tree; two measurement runs and a re-cut of both
windows, about an hour.
