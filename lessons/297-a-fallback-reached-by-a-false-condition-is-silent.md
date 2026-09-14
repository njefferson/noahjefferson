## 297 · A fallback reached by a false condition instead of by an exception is silent by construction, and the `catch` beside it documents a path nothing took

**Enforced by:** CHECKLIST name-the-fallback — every fallback branch says which
condition reached it, and a branch reachable two ways (a thrown error, a value
that failed a test) either distinguishes them or is split. · JUDGEMENT — when a
fallback is producing output in a case it was not written for, look at the guard,
not at the error handling.

**Smell:** `if (n > 0) return good;` followed by a `catch { /* fall through */ }`
and a default return. A "pre-X" or "legacy" branch that recent data keeps landing
in. A comment explaining a fallback that names only the exceptional case.

**Measured 2026-09-14, Jefferson-Photography-Studio.** A build derives a version
number per commit: the declared base from a VERSION file, plus the count of
commits since the base was declared. Before the base existed there is a fallback
scheme, `0.<total commits>`, and a `catch` sits above it labelled *fall through to
the 0.N scheme*.

The base and the commit that declared it were resolved ONCE, at HEAD, and passed
in for every entry. For any commit OLDER than the last bump, the count of commits
between them is 0 — an ancestor has nothing after it — so the `since > 0` test
failed, nothing was thrown, and execution reached the pre-VERSION fallback by
falling off the end of a passing function. Three of the five releases the app
displays to readers were labelled `v0.257`.

**Two things made it invisible.** The `catch` answers "why is there a fallback
here" for everybody who reads the function, and its answer is about an exception
that never happened — a comment claiming the fix, one level down. And the
fallback's output is a well-formed version-shaped string, so nothing downstream
could tell it apart from an answer.

**It was found by comparing two builds of one commit.** Verifying that a deployed
bundle was the code that had been tested, the runner's and the container's
differed: same length, sixteen bytes apart, all of them inside those version
strings — `0.540` against `0.257`. That is the other half of the lesson. **A
number derived from a commit count is a fact about a clone, not about a release**:
one clone was shallow at 259 commits and the other full at 540, so the same
source labelled the same release two different ways. Any identifier that must be
stable has to come from content, a declaration, or a hash — never from counting
what happens to be reachable.

**And the comparison is worth keeping as a practice.** Fetching the deployed
asset and diffing it against a local build of the same commit answers "is the
thing I tested the thing that shipped" directly, where reading a green deploy row
only answers "did the job exit zero". Here it happened to answer a different
question as well.
