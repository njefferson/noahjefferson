## 210 · A gate that refused to run is an open question, and it reads as harmless precisely when you caused the refusal

**Enforced by:** CHECKLIST refused-gate-reruns — at the end of any gate chain,
every step that REFUSED to run (a staleness guard, a missing tool, a skipped
dependency) is listed as distinct from every step that passed, and each is
re-run on a clean tree before the release is called verified; a refusal is not
a verdict. · JUDGEMENT — no script can know that the person reading "REFUSED:
stale build" also caused the staleness and is therefore the least likely
reader to go back.

**Smell:** "that red is just my in-progress edits"; a chain summary read as
green-except-for-reasons-I-know; and, after any fix, re-running a hand-picked
list of "affected" gates rather than the whole suite.

Quietkeep, 2026-09-01, twice in one afternoon. A release was pushed and its
verification chain started; mid-chain source edits (for the NEXT release)
tripped the build-staleness guards, so the smoke walk REFUSED to run rather
than measure the previous bundle — the guard doing its exact job. The refusal
was read as self-inflicted and harmless, and the release was treated as
verified because the one walk that had completed was green. The smoke suite
had never actually measured that tree, and it carried a real defect (HTML
entities printing literally in the notes panel — a pin that suite has held
since 1.7.1). CI found it a release later.

Hours after that was fixed, a one-line markup fix was verified by re-running
the gates judged "affected". The release-integrity gate was not judged
affected, was not run, and was red: the fixed bytes sat behind an unmoved
service-worker cache name, published and unable to arrive for any installed
reader. CI found that one too.

The two failures are one failure. §139 already says the set of gates a session
thinks of is exactly where the omission lives — that is why the Spine runs the
workflow's own list. What this adds is the asymmetry: **a gate that fails
demands attention; a gate that refuses to run produces a line that explains
itself away.** The person who caused the staleness knows why the guard fired,
and that knowledge is what converts "this tree was never measured" into "fine".
The refusal message is truthful, the reasoning about it is truthful, and the
conclusion — verified — is false.

So the checklist above: refusals are collected, not excused, and each is
re-run clean before the word "verified" is used. And after any fix, however
small, the re-run set is the whole suite — choosing "affected" gates is the
§139 hand-assembled list wearing a smaller coat.
