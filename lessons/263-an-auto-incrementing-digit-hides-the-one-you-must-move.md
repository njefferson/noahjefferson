## 263 · The digit that moves by itself hides the digit you have to move, and the version always looks like it changed

**Enforced by:** CHECKLIST capability-bump — before pushing a release that adds
or changes what the app CAN DO, read the version file and decide the middle
number explicitly. A release whose only moving digit is the automatic one is a
release nobody decided the version of. · JUDGEMENT — the failure is silent by
construction, so no amount of looking at the rendered version catches it.

**Smell:** a version scheme where some component is derived (a commit count, a
build number, a date) and some component is declared by hand. Also: several
consecutive releases sharing a declared base while each shipped a feature.

**Infrared Photography Studio, 2026-09-09.** The scheme is identity, then
CAPABILITY, then increment: the major moves on a declared identity change, the
middle number bumps with EVERY capability release and is edited by hand in that
release's own final commit, and the last digit is a commit count the build
computes. Features are never increments; that is written down in the repo's own
instructions.

2.12 was declared by one release. The three releases after it each shipped a
capability — a file-browser entry point added to the app's main chrome, a scroll
fix that came with a new on-screen control, and a guard that changed what a
signature gesture does — and every one of them went out as 2.12.x. All three are
in production under a version that says no capability changed since the release
before them.

**Why it survives the obvious check.** The natural verification is to look at
the version the app is showing and confirm it moved. It always moved: the
commit-count digit changes on every single commit, for free. So the rendered
version is evidence of exactly nothing about the declared part, and reading it
feels like checking. A scheme with no automatic digit would have shipped three
releases all reading 2.12 and someone would have noticed on the first one.

**The general shape.** A derived component and a declared component in the same
string are not equally trustworthy, and the derived one is louder. Anywhere a
value is part computed and part decided — a version, a cache key, a build tag, a
changelog heading — the computed half will mask a stale declared half, and the
check has to read the declared half specifically or it is reading the wrong
thing.

This is the proxy error (§262 and its family) applied to a string: the version
number stands in for "did the release get classified", and it answers a
different question.

**Measured again 2026-09-24, and this time the digit WAS moved and still did
not show.** Jefferson-Photography-Studio bumped `VERSION` to 2.62 in a commit
of its own, after the release's two reader-facing commits. Since 2026-09-22
that repository's patch notes filter out a commit that changes only `VERSION`,
as housekeeping. So the bump commit is invisible, and the two commits that
carry the release read as 2.61 increments, because each displays the base in
force at that commit. The repository's own versioning paragraph still said to
bump in "the release's own final commit" and promised the changelog would read
the new base. Both halves were true when written; the filter made them
disagree.
**The wording that survives the filter is "the release's last READER-FACING
commit".** A rule about which commit carries the bump has to name the property
the display actually keys on.
