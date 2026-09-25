## 363 · A YAML list has two spellings, and a gate that reads one passes the other by not looking

**Enforced by:** GATE hub:handoff-check.mjs — reads a staging branch in either list spelling, and says aloud when it cannot find a version to check. · CHECKLIST both-spellings — when a gate reads YAML with a pattern, feed it the flow form and the block form of what it looks for and see both found before trusting it.

**Smell:** a gate's informational line about a repo ("production-only", "nothing to record") that contradicts what the repo plainly does.

**Measured 2026-09-25 in Jefferson-Photography-Studio.** `handoff-check.mjs`
decided whether a repo stages by matching `branches: [ ... staging ... ]`, the
flow form the hub's own workflows use. That repo writes the block form, one
`- staging` per line, and deploys every product change to staging first. So
the gate printed "deploy.yml has no staging branch — production-only repo, no
candidate to record" and skipped the one check it exists for, that a staged
build is recorded in NOTES with its address. It had never checked it there. It
was found only because the line was read at a handoff where a build had just
been staged.

**Why it happens.** The pattern was written against the files at hand, which
all used one spelling, and a miss produced a plausible note rather than an
error. The same week's version lookup had the same shape: when no source it
reads carries a version, it checked nothing and said nothing.

**The fix, and the rule.** Both spellings are read; a missing version source
prints a line saying the version was not checked. A gate that reads structured
text with a pattern states what it did not find, because a skipped check and a
passed one print the same nothing.
