## 254 · A spelling rule is a LIST, and its population is what a reader reads — not what the tree contains

**Enforced by:** GATE quietkeep:tools/spelling-check.mjs · CHECKLIST
measure-the-pattern-first — before shipping a word rule, run it over the tree and
count what it flags that is CORRECT; a rule that fires on honest text gets routed
around. · CHECKLIST reader-facing-extraction — name how each file type's
reader-facing text is separated from its code, and prove the separation on the
identifiers that would otherwise dominate the count. · JUDGEMENT — which
variants are contested enough to leave out entirely.

**Smell:** a release that changed many small strings by hand with nothing
asserting the result. A gate proposal expressed as a suffix rule over English. A
word check whose top hits are attribute names, function names or comments. And
the tell: the release note ANNOUNCING a sweep, caught in the sweep.

**2026-09-09.** A planner converted about forty words from British to American
spelling across the app, its manual, its flowcharts and its release notes, by
hand, and left nothing behind it. Four survivors were found by a cold reader, and
**the first of them was the note announcing the change** — the sweep had
converted its own before-and-after example, so the release that said two words
had changed printed the pair backwards, with a stray possessive. A change that
has to be remembered has already started rotting.

**The obvious rule is `-ise$ -> -ize$` and it is wrong.** Advertise, surprise,
exercise, promise, premise, compromise, franchise, supervise, revise, devise,
expertise, merchandise, improvise, disguise, despise, enterprise and paradise are
all spelled with an s in American English. Same for `-our` if taken loosely, and
for doubled consonants (enrolled, controlled and installed are correct in both).
So the rule is a declared MAP of words to their American forms, inflections
spelled out — the same conclusion three other gates in this family reached by
measurement: pattern rules over prose flagged 39, 138 and 227 files of honest
writing before one of them became a list (§108), and a sibling's number gate
flagged ninety honest lines before it stopped matching the shape of a sentence
(§204).

**The population is the harder half, and it is where the count actually lives.**
Run the word list over the whole tree and the top result is sixty-three hits on
`aria-labelledby`, which is the attribute name in the HTML spec and cannot be
respelled — followed by `normaliseTheme`, `serialiseState`, `sanitisation`, a
CLI flag called `--artefact`, and `totally` caught by a doubled-l rule. None of
those is read by anybody. So each file type is reduced to what a person actually
reads before any word is matched: HTML text nodes plus the values of the
attributes that are spoken (never an attribute NAME); TypeScript string literals
only, never identifiers and never comments; Markdown prose minus fenced blocks
and inline code.

**A hand search found four. The gate found twenty-two on its first run** — in
release notes the app renders, on a hosted thesis page, and in the sample store
a new reader is offered. The four that must stay are DECLARED with their reason
and checked both directions, because the note whose whole job is to name the old
spelling cannot be paraphrased into correctness. Its help pages have a better
route for the same need and it was already there: a per-mention `<span data-was>`
marking a control's former name, exempt by construction rather than by
declaration.
