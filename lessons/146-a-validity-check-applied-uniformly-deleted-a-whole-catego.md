## 146 · A validity check applied uniformly across categories silently DELETED a whole category, and the surface it emptied looked healthy

**Enforced by:** GATE MoleBridge:test/problem.test.ts — the generator sweep
asserts that every problem KIND actually appears in ten thousand draws, not
merely that every draw is valid. · CHECKLIST every-category-appears — any filter
applied across kinds owes a test that each kind survives it.

MoleBridge's problem generator draws a candidate and rejects it if it breaks any
generation guarantee. One guarantee keeps quantities physical: nothing smaller
than a milligram, nothing larger than ten thousand, because a classroom balance
cannot show either. It was applied to every value the solution computes.

One problem kind asks how many PARTICLES the reaction makes. The answer is about
1.4e24, which is the correct answer to the question rather than an absurd one,
and the guarantee rejected every single one. **Two thousand five hundred draws
in that tier produced two thousand five hundred problems and not one of that
kind.** The tier generated cleanly, every problem in it was valid, every test
passed, and a fifth of the product's coverage was gone.

**What makes this shape hard to see is that the survivors are all correct.** A
filter that is too strict does not produce bad output; it produces less output,
all of it good. Nothing is malformed, nothing throws, no assertion fails. The
only visible symptom is a count nobody was counting.

**It is the same shape as a11y surface lists** (LESSONS 28): a check that runs
over a LIST silently covers only what is on the list, and a check that
FILTERS a stream silently drops whatever the filter did not anticipate. Both
report success about the things they saw.

**The rule.** When one rule is applied across categories that differ in kind —
units, ranges, shapes — assert that each category still comes out the other
side. The assertion is one line and it is not the same as asserting the output
is valid. "Everything that got through is correct" and "everything that should
have got through did" are different claims, and only the first one is free.

