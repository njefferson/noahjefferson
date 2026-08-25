## 121 · A rule that says "never show X here" is kept by the SHAPE having no X, not by everyone remembering

**Enforced by:** CHECKLIST no-field-no-render — when a rule forbids a surface
from stating something, delete the field that would state it rather than
documenting the prohibition. Then assert the absence in the rendered words too,
because a second definition can always compute it back. · JUDGEMENT

**Smell:** a comment reading *never display this here* above a struct that
carries exactly that value. The comment is doing work the type could do for
free, and it is doing it once per reader for ever.

An app modelled two directions of one relationship: what somebody owes YOU, and
what you have undertaken for THEM. They look symmetric and one rule makes them
not: ageing somebody else's debt is a fact about a date — *"With Sam for three
weeks"* — and the same sentence pointed at yourself is a running record of the
times you did not do your own work, which that app exists specifically not to
keep.

**The obvious build is one shape with a flag, and it is wrong.** One row type
with a `days` field and a "don't render it on this side" rule survives exactly
as long as everybody who touches the surface remembers. Every new call site is
another chance, the failure is silent, and what it silently produces is the one
sentence the product must never say.

**So the two directions got two shapes**, differing by one field that the second
does not have. Nothing to remember: there is no value to render, the compiler
enforces it, and a reader confirms the rule holds by counting the fields.

**And the projection has no ordering by it either**, which is the half that is
easy to miss. Sorting the list oldest-first would rank your own lapses — the
same forbidden statement, made by arrangement instead of by words, and therefore
invisible to any check that reads text. The sort key is the title.

**Then assert it anyway, in the rendered output.** The type stops one route; a
second projection, a template, or a helper that recomputes the value from a
timestamp all remain open. Both browser walks here check the actual words for a
digit or a duration, and that check is cheap and permanent.

**The general form.** Prohibitions about presentation are usually written as
rules and enforced by attention. Ask instead: *what would have to be absent for
this to be impossible?* Often the answer is one field, and removing it converts
a rule everybody must remember into a fact nobody can break.

---
