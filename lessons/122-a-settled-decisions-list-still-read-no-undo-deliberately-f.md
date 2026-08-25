## 122 · A settled-decisions list still read "no undo, deliberately, for now" three days after undo shipped, and this is where §120's documents get their wrong content

**Enforced by:** CHECKLIST close-the-limitation — a release that removes an item
from CHANGELOG's *Still not right* removes it from every OTHER list that states
it, in the same commit. The lists that need visiting are named per repo in NOTES,
because a session cannot grep for a sentence it does not know is there. ·
JUDGEMENT

An app shipped undo, and reordering a column without a drag. Both were real, both
were gated, both were in the release notes. Three days later, that repo's NOTES
still carried *"No undo, deliberately, for now — recorded here as owed, not as
done"* under **Settled decisions**, and *"No reordering of cards within a column
by the Move button"* under **What it cannot do now**.

**Neither list is decoration. They are the two a later session reads first**, and
the file says so in its own first line.

**§120 is the same defect one step downstream, and it is worth saying that out
loud.** That entry is about a plan written from documents naming five built things
as missing. This is where a document acquires that content: not by being wrong
when written, but by being right when written and never revisited by the release
that falsified it. Writing the plan is where the cost lands; writing the release is
where the cause is.

**Why the release note is not enough.** CHANGELOG gets updated because the release
cannot ship without it — the version gate holds it to the version constant. NOTES
has no such coupling, so it drifts in exactly one direction: it accumulates
limitations and never sheds them. Every entry that says *cannot* is load-bearing
in a way an entry that says *does* is not, because *cannot* is what stops the next
session building the thing.

**A gate is tempting here and does not work.** The obvious one compares
CHANGELOG's *Still not right* bullets against the cannot-do list, and both are
prose written for a reader — matching them needs a judgement about whether two
sentences describe the same limitation, which is the part that cannot be
mechanised. What CAN be mechanised is smaller and worth having: the release
checklist naming the lists by path, so the step is *visit these three headings*
rather than *remember that documents exist*.

**Found by an unrelated read.** A later feature touched the same file and the
stale paragraphs were on screen. Nothing looked for them, nothing would have, and
the next thing that would have used them is a plan.

---
