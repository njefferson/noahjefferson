## 89 · Tests that pin one line each cannot see a seam — drive the thing all the way through, and assert reachability rather than presence

**Enforced by:** GATE quietkeep:test/journeys.test.ts — whole journeys through the real write boundary, asserting after EVERY step that nothing went silent and nothing was stranded. **CHECKLIST:** when a defect is found at a join between two correct components, the fix is not only the join — it is a journey test that would have crossed it.

Three defects reached a real device in one week. Every one was at a JOIN, and
every component either side was correct:

- An item was covered by the write gate and never offered by the work surface.
  Both were right about their own job.
- A cure was written by one file as housekeeping and read by another as somebody
  asking for something.
- A fix that put "when this was written" on one card and not on the other card
  that shows the same thing.

Unit tests pin one line each, so they pass either side of a seam. The gate's
tests said the item was covered. The offer's tests said the offer was correct.
Nothing owned the sentence *and therefore the person sees it*.

**What a journey test is.** Create the thing, then move it: file it under
something, move it to something else, pull it out, have its parent deleted under
it, have the parent restored, put it on a list, take it off, put it down, take it
back up, fold it into another and split it out, finish it. After **every single
step**, assert the invariants. Read the type list from the vocabulary itself, so
a new type without a journey is a failure rather than a silence.

**Assert REACHABILITY, not presence.** The weak version — "the thing still exists
in the store" — is trivially true and was trivially true all the way through the
defect. The strong version is: *is it on a surface that can move it forward?* Any
store has a container that holds everything; counting that as coverage is how a
green check certifies nothing.

**And then the part worth the whole exercise.** The new test flagged something as
stranded. It looked real. Acting on it turned **twelve existing tests red**, and
their names were the argument — one of them was a rule shipped two releases
earlier, undone by the "fix". The candidate was wrong and the old tests proved
it.

So the value is not the new test finding things. It is the pair: **broad tests
propose, narrow tests dispose.** A repo with only narrow tests cannot see seams;
a repo with only broad ones cannot tell a finding from a regression. When a broad
test disagrees with a suite of specific ones, the suite is usually right, and the
names in the failures are the fastest argument you will get.

**The general shape:** ask what owns the sentence *and therefore the person sees
it*. If every test owns a component and none owns the path, the seams are
unguarded — and a component-level green is the reason nobody looks.
