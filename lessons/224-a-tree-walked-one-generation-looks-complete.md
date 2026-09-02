## 224 · A tree walked one generation deep looks complete, because the level you stopped at is a valid node — and the first gate written for it was aimed at the symptom's shape

**Enforced by:** GATE Cv-Thalweg:tools/fetch-regs.mjs — the bake follows each
requested section's subtree to closure rather than to depth one, records the
SOURCE's own child count on every part, and `--check` fails when a part has
fewer descendants in the file than the source gave it. · GATE
Cv-Thalweg:tools/render-test.mjs — asserts that no rule's words point at a
subsection the app does not carry, which is the general form and catches the
next one before anybody reads it. · CHECKLIST plant-the-real-defect — plant the
bug that actually shipped, not one shaped like your idea of it; a gate that
fires on your reconstruction and not on the original is a gate for a bug nobody
had. · JUDGEMENT — no gate can tell you how deep a source nests before you look.

**Smell:** any fetch that pulls "children" once — `WHERE ParentCode IN (…)`,
`?parent=`, a single `expand`, `depth=1` — over a source whose depth you have
not enumerated. A record that carries `parts`, `items`, `children` and is
checked only for `.length`. A leaf whose text is a PLACE, a DATE or a NAME
rather than a statement: those are the nodes that read as complete and are not.
Also: a gate written after a defect that tests the wording of that one instance.

An app quotes a state's fishing regulations verbatim, by section number. The
bake asked for each wanted section plus its direct children. The regulations are
three levels deep in places.

**The section that shipped wrong was a closure.** Its own text is the title;
its only child is *"Sacramento River from Keswick Dam to the Highway 162
Bridge."* — a place; and the three things that are unlawful there live one level
further down. So a reader saw a named closure, a reach of river, and **nothing
forbidden in it**. The regulation says: take no sturgeon, use no wire leaders,
use no lamprey or shrimp as bait. None of that reached the screen.

**Every check was green and each one was reasonable.** The section had a part.
The part had words. The words were not a heading, were not a table, carried no
markup, and were over the minimum length. There was no assertion anywhere that
a part might have children of its own, because at the time the bake was written
nothing in the wanted list went that deep — and when a section later did, the
file simply came back smaller and nothing had a way to notice.

**Then the gate written to catch it did not catch it.** The obvious rule is "a
part that is a heading with nothing under it is a section number in front of
nothing", so that was written, and it fires correctly on `"Open season:"` with
an empty subtree. Planting the defect that actually shipped, it passed
without a murmur: a place name is not a heading. Two more plants passed too.
**The gate was aimed at the shape of the symptom that had been noticed, not at
the invariant.**

The invariant is a count, and the count has to come from the source, because
nothing about the text of a truncated node distinguishes it from a complete one.
So the bake now writes each part's own child count into the file, and the check
compares. A place name with three missing prohibitions fails. So does a heading.
So does a file written by a bake that went one generation deep, because it
cannot produce the counts at all.

**And the general form was cheaper than any of it.** Two of the striped bass
rules read *"except in waters listed in (d) below"*, and (d) had never been
asked for — so a limit and a minimum size each pointed at an exception the
reader could not reach. A single check that every cross-reference in the text
resolves to something the app carries would have found that on the day it
shipped, and it holds for every section added afterwards.

**What to do**

- Walk to closure, not to a depth. Keep asking until a round returns nothing
  new; a depth number is a fact about today's data that nobody will revisit.
- Write the source's own cardinality into the artifact — how many children it
  said this node has. Completeness is then countable offline instead of
  inferred from how finished the text sounds.
- Plant the defect that shipped, in the form it shipped in. If your plant is a
  tidier version of the bug, you are testing your explanation of it.
- Prefer the check on the invariant over the check on the instance: "every
  reference resolves" outlives "this section has that subsection", and covers
  the ones not yet added.
