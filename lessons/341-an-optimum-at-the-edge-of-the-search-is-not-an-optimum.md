## 341 · An optimum at the edge of the search space is not an optimum, and an acceptance bar applied only to the winner leaves a floor inside the search

**Enforced by:** CHECKLIST report-the-argmax-position — any search that reports
a chosen parameter reports WHERE in its range the choice fell, and treats an
argmax at either end as a failure to find one rather than as an answer.
**Enforced by:** CHECKLIST bar-inside-the-search — when a search is followed by
a test that rejects some answers, ask whether that test should be filtering the
CANDIDATES instead. A rejected answer that can still win the search is a floor
the real answer has to beat.

A one-dimensional search maximises an objective over 120 samples and returns
the best. Two different failures came out of that in one afternoon, and neither
shows up as an error.

## The argmax at the last sample

The method assumes the objective turns over: its own text says the score is
nearly constant past a certain threshold, so the sweep runs past the peak and
comes back. A photograph with a sky does exactly that — the score rises to
1.13e-8 at the 97th of 120 samples and falls away. A photograph that is 90% one
texture gives a curve that rises MONOTONICALLY to the last sample, because the
best separation available is "call the whole frame one region". The answer
returned is the answer at the boundary, and it is a perfectly ordinary-looking
number.

**The shape of the objective says which case you are in and the answer does
not.** Keeping the whole curve costs 120 doubles and turns "this is wrong and I
do not know why" into "the method does not apply to this photograph", which has
a different remedy: here, falling back to the older heuristic that asks a
different question, and keeping the frame's selection exactly as it had always
been.

## The floor at the first sample

The same search had a second degeneracy at the other end, and it is the subtler
one. At the bottom of the sweep every region above the border collapses to a
few rows of one colour, the term that penalises a varied sky vanishes, and the
score settles at a value that depends only on the WHOLE FRAME. That is not a
hypothesis; it is a floor, and any real answer has to beat it.

The published method has a test for exactly this answer — the border is too
shallow to be a sky — but it applies it to the WINNER, after the search. Applied
only there it arrives too late: on one frame the honest peak at the 108th sample
was beaten by 22% by the floor at the very first, and the frame came back "no
sky found" with 55% of it sky. Moving the same bar INSIDE the search, so a
shallow border is never a candidate, removes the floor and makes the refusal
mean what it should: no threshold anywhere produced a sky-sized region.

The paper's own search starting at 5 rather than 0 is the same guard, one step
weaker — which is the tell. **A search range that starts just off zero usually
means somebody met this and patched it with a constant.**

**Jefferson-Photography-Studio, 2026-09-20**, sky detection by border-position
optimisation.
