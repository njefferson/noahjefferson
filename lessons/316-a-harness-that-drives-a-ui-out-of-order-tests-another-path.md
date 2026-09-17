## 316 · A harness that drives a UI out of order runs a DIFFERENT code path, and the fallback it lands in makes the result look right

**Enforced by:** CHECKLIST harness-follows-the-app's-order — before writing or
trusting a walk that drives a multi-step flow, read the handler for the step that
COMMITS and find what it reads; if it reads state some earlier step was supposed
to set, the walk has to perform the steps in the app's own order, and it has to
assert which branch ran. · JUDGEMENT — a harness that reaches a control directly
is not a shortcut through the flow, it is a different flow.

**Smell:** a walk that writes to a file input, a hidden field or a form control
directly instead of pressing what a person presses. A handler whose first line is
`const x = chosen ?? somethingElse`. Any `??` fallback on state a previous screen
was meant to set — it is silent by construction, and the comment beside it
usually says "shouldn't happen". A walk whose header comment states which mode it
is testing, with nothing in the walk asserting that mode.

**Measured 2026-09-17, Jefferson-Photography-Studio, one defect diagnosed four
times over two days.**

A walk renders one photograph two ways and compares them, and its own comment
said the second way ran "on Auto with no look applied at all". The bulk-develop
flow chooses a grade first — that press stores the choice and THEN opens the file
picker — and the walk handed over the files first. So the picker's handler ran
with nothing chosen and took its fallback, which copies the current edit whenever
a photograph is open. **The walk never once ran the mode it reported, for its
whole life.**

What that cost. Three diagnoses were written up for a 150-degree colour
disagreement, and the record for the defect named one of them — a missing channel
swap — as *measured wrong*, because the fix had been coded, built, and had come
back byte-identical. The fix was correct. It changed the assembly the Auto branch
uses, and the walk was running the look branch, so the changed line never
executed. A right answer was backed out on the strength of a test that could not
reach it, and the record then carried that wrongness forward as evidence for the
next session.

**The tell was there and read as a curiosity rather than a clue.** The record's
own words for it were that a fix changing nothing is "itself unexplained and is
the sharpest clue available". A params edit that produces byte-identical output
has only two explanations — the params do not reach the render, or the edit does
not run — and the second is cheaper to check by an order of magnitude. Printing
the resolved state at the moment the commit handler reads it answered it in one
run.

**And the general shape, which is why this is not just a Playwright note.** Every
UI harness reaches past something. Pressing a label rather than clicking the input
it wraps, opening a dialog rather than calling the function it would have called,
choosing before supplying rather than supplying before choosing — each shortcut
is a hypothesis that the skipped step sets nothing the later step reads. That
hypothesis is worth one line to check and it is invisible when it is wrong,
because the fallback is a real code path that produces a real picture.
