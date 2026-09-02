## 167 · A `value` or `placeholder` attribute is copy, and no proofread of the prose reaches it

**Enforced by:** GATE molebridge:tools/language-check.mjs — the word gate scans
the whole surface file, attributes included, rather than a extracted prose. ·
GATE molebridge:tools/walk.mjs — reads pre-filled defaults back out of the
rendered field with `inputValue()`. · CHECKLIST list-the-attribute-copy — when
auditing a screen's words, enumerate `value`, `placeholder`, `alt`, `title`,
`aria-label`, and every hard-typed `<option>`, and read each as a sentence
addressed to the reader.

**Smell:** any audit, review or gate whose unit is "the prose". Ask where the
strings live that a reader sees and a reader of the SOURCE does not read as
prose.

A stoichiometry trainer has a hard gate against copy that tells a reader the app
was built for somebody else — it forbids specific phrases by name and prints the
replacement for each. It had been running for five releases and had cleaned up
every screen.

**One field arrived pre-filled with a day of the school week.** `value="MONDAY"`,
under a label reading *A word for today*, with the same word plus a digit as the
hint's first example. Both had been there since the feature shipped. The feature
existed because of a real weekly warm-up, which the comment above the block
explains correctly and which the gate reads past on purpose — the room may be
explained, it may not be addressed. Nobody chose the placeholder as copy; it is
where the room came out when nobody was writing.

**A pre-filled default teaches harder than the hint above it.** It is the example
somebody reads before they have decided what kind of thing belongs in the field,
so it sets the shape of the answer more forcefully than the sentence explaining
the field does. Two examples in the very next line named the subject matter
instead and did not carry the timetable — so the field's own strongest signal was
the one contradicting them.

**And it is the string least likely to be reviewed.** A `value` attribute does
not look like a sentence in the source. It sits inside a tag among `autocomplete`
and `spellcheck`, reads as configuration, and survives every pass that a person
makes over "the words on this screen".

**The transferable form: enumerate the attribute copy as copy.** `value`,
`placeholder`, `alt`, `title`, `aria-label`, hard-typed `<option>` text, empty
states, and the first row of any example list. Point the word gate at whole
files rather than at extracted prose, and have the browser check read defaults
back out of the rendered control — that is the one place they unambiguously ARE
what the reader sees.

**Two details worth copying.** Forbid the whole class, not the instance: all
seven day names went in, because the route around a word gate is a synonym that
excludes exactly as much, and the gate was planted red on a different day than
the one that was there. And stop at the class that is actually wrong — *today*
was deliberately left legal, since it is true for anybody sitting down to the
task, whatever day it is; a day of the week presumes a timetable, today presumes
only that somebody is doing it now. A false positive teaches sessions to route
around the gate, which costs more than the phrase did.

**Then the gate caught the release note announcing the fix**, which had quoted
the old default twice. That case was already decided in the gate's own header —
describe the room rather than quote the sentence — and the rewrite was better
prose than the quotation.
