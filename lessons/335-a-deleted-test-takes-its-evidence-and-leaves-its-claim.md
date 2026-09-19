## 335 · A deleted test takes its evidence with it and leaves its claim behind

**Enforced by:** GATE Jefferson-Photography-Studio:tools/look-roundtrip-walk.mjs
— the claim below now has a standing instrument instead of a paragraph.
**Enforced by:** CHECKLIST claim-outlives-instrument — when a test is deleted,
every finding it is the only evidence for is deleted in the same commit, or it
is re-established by something that still exists. A finding whose instrument is
gone cannot be checked, cannot be reproduced and cannot be closed.

Deleting a test that fails for a reason other than the one it names is right,
and this family already says so: a red that means something else trains
everyone to read red as noise. What was got wrong was what happens to the
things that test SAW on the way out.

## What happened

A walk was written to prove a photo editor's Sky selection does not drift with
the grade. It failed on correct code, and so did its own control, so the walk
was deleted — correctly. But while it was failing it had produced a second
finding as a by-product: pressing one look, then another, then the first again
did not render the same photograph. Two framebuffer hashes were written into
NOTES as the evidence, and the item was recorded as an open defect, "not
diagnosed, not chased here".

**So the repository now carried a defect whose only evidence came from an
instrument that no longer existed, and whose diagnosis was going to be somebody
else's first job.** Nothing left in the tree could say whether it was still
true, or had ever been true.

## What it was worth

It was not true. Re-measured the same day through a fresh instrument that reads
the whole framebuffer: seven looks, each pressed, switched away to black and
white, and pressed again — fourteen round trips, counting both with and without
a Sky selection on the frame — every one byte for byte identical. Then twenty
away-and-back cycles on one look: one distinct render and one distinct set of
white-balance values across all twenty.

The mechanism is worth keeping. The function under suspicion strips the
previous look's bias by DIVISION and re-multiplies the new one, and `(w * b) /
b` is not `w` in floating point, so residue should accumulate. It does not,
because every value passes through a STEPPED control on the way past, and a
value already sitting on a step is a fixed point of that quantisation. A
suspicion with real arithmetic behind it was still wrong, and only measuring
said so.

The two recorded hashes match nothing any current reading produces. Whatever
state that walk was in is not reachable now, and the walk is not there to ask.

## The plant that planted nothing

The replacement instrument was proved by planting, and the FIRST plant was
worthless: it moved one slider a single step between the two applications, and
the walk passed with the plant in. Correctly — pressing the look again SETS
that slider, so the second application erased the plant before the reading was
taken.

**A plant in ground the thing under test is entitled to overwrite proves
nothing about the test.** The plant that works makes the second application a
DIFFERENT look, so every row must go red; it did.
