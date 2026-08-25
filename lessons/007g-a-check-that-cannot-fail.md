## 7g · A check that cannot fail

**Enforced by:** CHECKLIST plant-the-fault — every gate is made to go RED on purpose before it is trusted, and the mutation is recorded.

**Plant the fault. A check you have never seen go red is not evidence, and it
is indistinguishable from a check that works.** Intersecting Parallels shipped a
roof — inclined planes, a new kind of vanishing point — with a headless check
reading . It had
been green from the moment it was written. Deleting **an entire roof plane** did
not move it: the check counted the TOTAL shaded pixels on the canvas, and the
two walls alone (42,939px) cleared its threshold of 500 without the roof
contributing anything. Planting that deletion is what exposed it, and underneath
it was a real defect that had shipped to `staging` unnoticed — **the roof's
planes were never being drawn at all.** The renderer derived a solid's visible
faces from its top and bottom faces; a roof has neither, so it returned an empty
list every frame. Rewritten to measure the roof's own contribution as a
before-and-after difference, the same check reports 9,081 and 17,944px.

**Then it happened twice more in the same hour, on the check written to cover
the fix.** The rule being asserted was that you only see a roof below your eye
level. Version one compared an overhead house against the wall count measured in
a *different pose* — two poses, so the difference said nothing, and it passed
with the eye-level test removed entirely. Version two fixed the comparison but
put the house so high that the ridge ran off the top of the page, so nothing was
painted whichever way the renderer behaved: it was measuring the edge of the
canvas. Three consecutive versions of one check, none of which could fail, each
written in good faith immediately after the code it was checking.

The distinct failure is not "the test was weak". It is that **a check written
alongside its code inherits the author's framing, so it tends to measure
something ADJACENT to its claim** — total area instead of the new area, one pose
against another, a region that happens to be empty. It then passes forever and
reads, in the log, exactly like proof.

Three things that turn this around, cheap enough to be unconditional:

- **Make it fail on purpose before you believe it.** Break the specific thing it
 names — delete the face, disable the reseat, negate the rule — and watch that
 check and only that check go red. If it stays green, the check is not about
 what its name says.
- **Measure the DIFFERENCE the change makes, not the total afterwards.** A total
 is dominated by whatever was already there. Almost every empty check in this
 family was a total that a pre-existing thing was already satisfying.
- **Assert the fixture, not just the result.** A check whose setup silently puts
 the subject off-screen, off-canvas or out of range proves nothing and says so
 in the same words as a real pass. Make it state that the thing it is about is
 actually there — *every corner above the horizon AND on the page* — so a broken
 fixture fails loudly instead of passing quietly.

This is the practical edge of 7d. Adversarial *reviewers* catch the code the
author's model got wrong; planting catches the **gate** the author's model got
wrong, and it needs no second agent — just the discipline to spend two minutes
breaking your own green.

*(Intersecting Parallels, 2026-08-01 — D54. Also the run where `git checkout
<file>` was used to undo a planted fault on a file whose real work was still
uncommitted, destroying it; the copy taken before planting is what got it back.
Back up before you plant, and never reach for `git checkout` on a dirty file.)*

**The quietest version of this: a correct check, in a walk that never contains
the case.** Quietkeep's headless walk asserts that the coverage list's rows
equal the number the gauge claims — a real check, correctly written, aimed at
the right defect, and it had been green for a year. Then two releases excluded a
kind from the list without excluding it from the number (journal entries in
1.13.0, weights in 1.15.0), and it stayed green through both. Nothing was wrong
with the assertion. **Neither kind existed at the point in the walk where it
ran**, so the two sets it compares were trivially equal, and the surface was
meanwhile rendering every private journal entry as an untitled row in a work
list.

Nothing here is planted-fault-shaped. Planting *would* have caught it — the
check goes red the moment you revert the fix — but only if you thought to plant
it, on a check nobody had touched in a year. What catches it earlier is
cheaper: **when a check compares two sets, ask what is IN the fixture at that
moment, not just what the check asserts.** An equality between two sets that are
empty of everything interesting is the same green as an equality that holds.
The fix was one line of walk — raise the excluded kind before the assertion and
leave it on across it — and it turned a decorative check back into a real one.

*(Quietkeep 1.15.1, 2026-08-02.)*
