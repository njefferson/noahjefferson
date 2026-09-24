## 352 · A checklist gate refuses the tidy mistake and cannot see the hurried one — the item marked done and left in place, never the item left unmarked and already finished

**Enforced by:** CHECKLIST both-shapes — when a gate refuses one way of leaving a
list wrong, write down the OTHER way before trusting it. A list has two failure
modes, marked-but-not-moved and moved-in-spirit-but-not-marked, and a gate built
after the first one bit somebody sees only that one. Name the shape it cannot
see in the gate's own header, or the green will be read as covering both.
**Enforced by:** CHECKLIST fix-and-file-in-one-commit — a commit that both
records an item and completes it must archive it in the same commit. A defect
small enough to fix the day it is found is exactly the one whose bullet gets
written and then immediately becomes false.
**Enforced by:** JUDGEMENT — `git cherry` answers by patch-id, so any commit
whose conflict was resolved on the way in reads as NOT contained in the branch
that now carries it. A rule written around that test gives the wrong answer
after every resolution; check by CONTENT before acting on it.

**Smell:** a gate written after one failure whose header names only the shape that failure took. Also: a single commit that both adds a roadmap bullet and fixes what the bullet describes.

**Measured 2026-09-22 in Jefferson-Photography-Studio.** One commit fixed a
defect in the public release-notes page AND added the roadmap bullet describing
that defect, as an open item. It went to staging and passed an on-device review
in that state: the built page listed the newest changes correctly, while the
roadmap beside it told every reader that a page listing the oldest changes was
still coming.

**The repository had a gate for exactly this section and it could not fire.** It
refuses a TICKED checkbox left in the open roadmap — an item somebody remembered
to mark done and forgot to move. What happened was the mirror: an UNTICKED
checkbox whose work had already landed. Both leave the same wrong list in front
of a reader. Only one has a shape a parser was told to look for.

**And the shape it cannot see is the likelier one.** The tidy mistake needs
somebody to mark an item done, which is a deliberate act at the end of a piece
of work. The hurried one needs only that the fix and the bullet arrive together,
which is the normal order when a defect is small enough to be fixed the hour it
is found — and small defects are most of them.

## The generalisation

A gate written after a failure encodes that failure's shape. That is its
strength on the day it is written and its blind spot for the rest of its life,
because everyone afterwards reads its green as covering the rule rather than
covering the one case. **The remedy is cheap and belongs in the gate's own
header: state which shape it refuses and which it does not.** The gate need not
grow; the claim it makes has to shrink to the truth.

## The second finding, from the same promotion

**`git cherry` is a patch-id test and a resolved conflict changes the patch.**
The branch's own release rule said to confirm, before resetting the staging
branch, that every commit on it was already contained in the trunk — and
`git cherry` reported the promoted commit as NOT contained, because resolving a
conflict on the way in gave it a different patch. The work was in the trunk. The
test could not say so.

Checking by content answered it in one command: the two code files the commit
changed did not appear in a diff between the branches at all, so they were
byte-identical, and everything else that differed was the trunk being ahead.
**A containment rule written around an identity test needs a content check
behind it**, or the first real merge conflict turns a safety rule into a stop.

**Measured again 2026-09-24 in Jefferson-Photography-Studio, twice in one day.**
First, a session branch's fix was reported by `git cherry` as missing from the
trunk. The trunk carried it as a different commit, because merging a pull request
by REBASE rewrites every commit, so the identity test cannot match it at all.
Second, before a staging push, `git log main..staging` listed seven staging
commits "not in main". A content diff over every shipped path showed staging
and main identical except for one status page on which main was newer. **In a
repository that merges by rebase, every identity test between branches is wrong
after every merge, not only after a conflict.** Only a content check answers
"is this already there".
