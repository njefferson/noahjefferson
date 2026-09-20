## 339 · A correction to a test's truth is a region, not a box, and it fails four ways

**Enforced by:** GATE Jefferson-Photography-Studio:tools/mask-truth-walk.mjs —
the walk reads `.not-sky`, applies each row as a connected component rather
than as an area, prints every row with what it removed, and fails on a stale
row, a reasonless row, or a row removing more than a tenth of the frame's
truth.
**Enforced by:** CHECKLIST correction-not-exemption — before adding a row to
any declared list, say which of the two it is. An EXEMPTION excuses a finding
the check is right about. A CORRECTION asserts the check's own input is wrong.
They need different guards, and a correction needs the stronger set, because it
changes what "passing" measures rather than what it forgives.

This family runs on declared lists — a backlog file per rule, printed on every
run, checked both ways, able only to shrink. They all excuse findings.

**Then one had to correct a measurement instead**, and the difference turned
out to matter. A photo editor's sky-selection test derives its own idea of sky
per frame, from colour. On one frame that idea is wrong: a branch thrown far
out of focus at the frame's edge keys as sky, and three measurements say
nothing available to the test can tell them apart — brightness puts the branch
inside ordinary sky variation, and texture, the field's standard second
condition, finds it SMOOTHER than sky at one pixel and identical at eight.

So the correction is declared. And a declared correction is a different animal
from a declared exemption, in two ways worth writing down.

## It names a region, never an area

The obvious form is a rectangle: the block is in a corner, draw a box round the
corner. **A box also removes the real sky above it** — and removing real sky
makes the test EASIER, which is the one direction a correction must never move.
An exemption that is slightly too wide forgives a bit extra. A correction that
is slightly too wide silently lowers the bar and then reports a pass.

The right primitive is the component: a point inside the thing, and the test
floods its own connected region from there. Exactly the error, nothing beside
it. The corrected map showed the branch gone and the sky above it still
counted, which a box could not have done.

**And the point has to be INSIDE, which the centroid is not.** These regions
are not convex; a centroid can land in the sky beside the thing it describes.
The instrument now prints a guaranteed-inside point for its largest finding on
every run, and a row is written from that rather than from a centroid.

## Four guards, because otherwise it is a way to buy green

- every row PRINTS on every run, with the amount it removed;
- a row matching nothing FAILS as stale — it cannot rot quietly into a
  permanent exemption for something that has moved;
- a row with no written reason FAILS — the reason has to say what was seen;
- a row removing more than a tenth of that frame's truth FAILS whatever it
  says, because a correction that large is a broken input, not a correction.

All four were watched failing before any of it was trusted.

## The plant that hit ground another row had taken

Two guards were proved together by planting a bogus row and dropping the
ceiling. The third needed a second run: the test row pointed at a component
the real row had already consumed, so it reported STALE rather than
REASONLESS — correct behaviour, useless test. §335 says a plant must not land
in ground the thing under test may overwrite; this is the same rule where the
overwriting is done by another row of the same file.
