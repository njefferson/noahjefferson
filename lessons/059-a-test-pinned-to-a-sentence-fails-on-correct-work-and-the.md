## 59 · A test pinned to a SENTENCE fails on correct work, and the bill it settles is a release nobody receives

**Enforced by:** CHECKLIST test-holds-the-rule — before pushing a change to any user-visible string, `grep` the string across the test suite; every hit is a test that will go red for a reason that is not a defect, and each one must be re-aimed at the rule rather than have its literal updated.

fauxplane 1.29.2 was pushed, verified against the remote, and **never deployed**.
Its `deploy.yml` run concluded failure on `npm test`. Staging kept serving 1.29.1
for the rest of the day while the branch said otherwise.

**Nothing was broken.** 1.29.2 shortened a status banner from two sentences to
one — which was the entire point of the release, and the change was correct.
Three tests matched the old prose literally:

- `/no broadcast received yet/`
- `/crossed out until one arrives/`
- `/is showing that aircraft's broadcast, not this device/`

All three sentences had stopped existing. The **rule** those tests were written
to hold — that the banner may not claim a broadcast which has not arrived — was
satisfied by the new wording the whole time, and would have been satisfied by a
dozen other wordings too.

**The distinction that matters: does the assertion break when the product lies,
or when the product is merely reworded?** `assert.match(text, /no broadcast/)`
holds the rule. `assert.match(text, /no broadcast received yet\. The panel stays
crossed out until one arrives\./)` holds a draft. The second one looks stricter
and is strictly worse: it is red on correct work and equally silent on a banner
that says "no broadcast received yet" while showing live data.

**Why it is not caught by care.** The session that writes the sentence and the
session that shortens it are months and a hundred files apart, and the shortening
session has no reason to think prose is load-bearing. It runs the gates *before*
the final copy edit, or it runs them and reads "3 failing" as the copy edit
landing wrong rather than as the test being wrong. Either way the push goes out.

**This is §53 a third time, with a third gate** — privacy in 1.24.1–1.26.0, the
unit suite here. The shape never changes: a push that reports success, a remote
that genuinely moved, and a deploy that failed after everyone stopped looking.
§53's `deploy-green` obligation is what caught it, one release late.

**Smell:** any regex in a test containing more than about four consecutive words
of product copy, or a full stop. Any assertion you would have to edit to reword a
sentence that was never wrong.

*(fauxplane 1.29.2 → 1.30.0, 2026-08-05.)*

---
