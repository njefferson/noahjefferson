## 255 · A tool that reads a called workflow by hand carries the copy it exists to prevent — and the regex that reads it can be silently rewritten by its own quoting

**Enforced by:** GATE quietkeep:tools/spine.mjs — the hub gates are derived from
the hub's own `hub-gates.yml`, not from a list in the reader. · CHECKLIST
count-before-and-after — any change to a parser or matcher prints how many things
it found before and after; a matcher that silently finds fewer is the failure
shape here, and it has no error to notice. · CHECKLIST
escaping-crosses-two-languages — for every regex written in one language and
executed in another (a template literal holding Python, a shell heredoc, a JSON
config, a YAML `run:`), write down what the inner language RECEIVES, not what
the outer one shows. · JUDGEMENT — whether deriving from a local sibling
checkout, which may be ahead of the pin, is a superset worth having.

**Smell:** a "runs everything CI runs" tool with an array of step names in it. A
called or reusable workflow whose steps are restated anywhere. A regex inside a
template literal, a heredoc, or a YAML scalar. A character class that still
compiles after losing a backslash. And the tell: a step count that changed and
nothing failed.

**2026-09-09.** A repo's Spine reads its CI workflow and runs every step locally,
so that a session cannot forget a gate. Its doctrine gates come from the hub as a
single reusable-workflow call, which has no steps to read — so the tool
synthesised them back from a hand-written list of five gates plus three
conditionals. Two gates were later added to the hub's workflow. They ran in CI
from the day the pin moved and were never added to that list, so `npm run spine`
went green and CI went red on an undeclared placeholder. **The one promise the
tool exists to make was broken by the tool's own source, in exactly the shape it
was written to stop.**

**The fix is to read the hub's workflow off the sibling checkout** and evaluate
each step's `if: inputs.x` against the caller's `with:` over the workflow's own
declared input defaults. It reads the LOCAL hub rather than the pinned commit,
which is a superset rather than a gap — a gate the pin does not carry yet simply
runs early — and the pin has its own check.

**The bug inside that fix is the transferable half.** The reader is Python
embedded in a JavaScript template literal, so every backslash is processed once
on the way in. Written in the file as `[\w.-]`, Python receives `[w.-]`: a
character class matching a literal *w*, a dot and a dash. **It is still a valid
regex. It still compiles. It matches nothing** — and the tool reported 45 steps
where there were 55, with no exception, no warning and no red. The same trap
takes `\.` to `.`, `\s` to `s`, and `\b` to a backspace character.

**What catches it is counting, not testing.** A unit test over the matcher would
have used the same literal and the same quoting. What actually found it was
noticing the step count had dropped by exactly the number of gates being
derived. So any change to a matcher prints its find count before and after, and a
matcher whose count moves without an intended reason is broken even when
everything is green.
