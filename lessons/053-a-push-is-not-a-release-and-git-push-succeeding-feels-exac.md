## 53 · A push is not a release, and `git push` succeeding feels exactly like shipping

**Enforced by:** GATE noahjefferson:handoff-check.mjs — the `deploy-green` obligation, which no handoff passes without.

Four fauxplane releases — 1.24.1, 1.25.0, 1.25.1, 1.26.0 — were pushed, reported
as shipped, and **never deployed**. A device in the field stayed on 1.24.0
through all four. It surfaced when a screenshot showed a page missing a button
that one of the four releases should have added.

**Every push was genuinely verified.** §2's rule was followed each time — read
the REMOTE, not the push output; confirm the range line; confirm the SHA. All of
that was true and all of it was about the wrong thing. `git push` succeeding and
the site updating are different facts, and only the first was ever checked.

**What broke them was a CI gate added the same afternoon.** A privacy check,
newly wired, was failing on an ordinary sentence about console warnings. The
pattern read `they are ... diagnosed` as a disclosure about a person. So the deploy stopped,
correctly, on a gate doing exactly what it was told.

**The compounding shape is the lesson.** A session that adds a hard gate to a
pipeline has just added a new way for its own work to silently not arrive — and
it is at its least likely to check, because it has just watched that gate pass
locally. The gate ran on the runner against a file the local run had not yet
seen.

**Two failures, and they need separate remedies.** Misreading a log you opened is
one thing; never opening one is another, and it is the one that hid for four
releases. `deploy-url` already covered the first. `deploy-green` covers the
second: for every branch pushed, check the deploy for **that exact SHA** and see
it CONCLUDE, before saying anything shipped.

**And fix the gate, not the sentence.** The tempting repair was rewording the
release note — the owner would have been unblocked in a minute. It would also
have left the same landmine in a SHARED gate for every repo that adopts it, and
taught the next session that the way past a privacy check is to rephrase. The
pattern now requires `diagnosed with`, which keeps every real disclosure and
releases the engineering sense; both directions were tested on a scratch repo
rather than reasoned about.

**Smell:** any sentence of the form "it's live", "it's on staging", "it shipped" whose evidence is a push, a merge, or a green local gate — rather than a deploy, for that commit, that concluded.

*(fauxplane 1.24.1–1.26.0, 2026-08-04.)*

---
