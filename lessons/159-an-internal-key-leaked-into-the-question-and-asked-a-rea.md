## 159 · An internal key leaked into the question and asked a reader to rearrange an equation for a letter that was not in it

**Enforced by:** GATE solve-ent:test/problem.test.ts — every symbol a relation
names must appear in the relation as WRITTEN, matched on its display form. ·
GATE solve-ent:test/taxonomy.test.ts — every token in a multiple-choice option
must appear in the equation the question shows. · CHECKLIST
identifier-vs-display — when a data table's keys are also shown to a reader, ask
which of the two the display needs, before the first one diverges.

**Smell:** a key with a disambiguating suffix — `ng`, `Vd1`, `Mm` — in a table
whose keys are rendered. The suffix exists to make an identifier unique; the
reader is looking at a page where uniqueness was never the question.

Solve-ent's relations are data: `written: 'PV = nRT'`, plus a `symbols` table
keyed by identifier. Both halves reach a reader — the equation is printed, and
the symbols are printed into the question ("Rearrange it for n"), into the step
("n has to be separated from R and T") and into the multiple-choice options
(`n = m ÷ M`).

Three of the eight relations had keys that were not the letters in their own
equations. `PV = nRT` asked to be rearranged for `ng`. `n × M = m` offered
`n = m ÷ (Mm)`. `T(K) = T(°C) + 273.15` called them `TK` and `TC`.

**Two of the three suffixes were never needed at all.** The table is
per-relation, so `V` and `n` were already unique inside it; three other relations
use a plain `V`. Nothing anywhere keyed off the strings. They had been typed
defensively and then rendered.

The third is the interesting one: `T(K)` cannot be a plain key. So a display form
is genuinely required, and the moment one symbol needs it, EVERY symbol needs to
go through the same lookup — otherwise the file has two ways of naming a thing
and the rule is "remember which".

**It shipped for six releases with every gate green.** Contrast, targets,
landmarks, axe, the collision sweep, an external algebra verifier that
recomputes every answer by hand — none of them read a letter and asked whether
it was in the equation beside it. And one instance was visible in the FIRST
SCREENSHOT ever taken of that app, in a list of three answer options, and was
read as a typo and not chased.

What found it was building a screen that showed that step ON ITS OWN. Inside a
whole question the odd letter is one line of five and the eye slides past it; as
the only thing on the page it is the whole page.

**The general form: a table whose keys are both identifiers and copy will
diverge, and the divergence is invisible to every check that is not looking at
the two together.** The cheap gate is one line — for each row, assert the
rendered name appears in the rendered context — and it is worth writing the day
the table is created rather than the day somebody notices.

**A second defect fell out of the same screen**, and it is worth its own
sentence: the options were built by string concatenation and `V₁ = (P₁) ÷ P₂ ×
V₂` reads as `(P₁ ÷ P₂) × V₂` — a third thing, neither the right answer nor the
misconception the option exists to embody. **In a product whose whole claim is
attributing a wrong answer to a specific misunderstanding, an option a reader
cannot parse attributes nothing.** Brackets belong on a divisor of more than one
factor and nowhere else; the redundant ones were noise and the missing ones were
a wrong question.
