## 298 · A comment that excuses a narrow fix by calling the rest "already measured" is a claim about a measurement nobody made

**Enforced by:** GATE jefferson-photography-studio:tools/surfaces.mjs — the list
of deployed pages and dialogs is checked BOTH WAYS against the build, so a
surface cannot arrive unmeasured and a declaration cannot outlive its surface. ·
CHECKLIST coverage-before-scope — before scoping a fix narrowly on the grounds
that the rest is fine, name the instrument that established it and the run that
printed the number.

**Smell:** "scoped here rather than raised globally". "every other X is a
measured, shipped surface". "not being churned from this change". Any comment
that justifies a narrow fix by asserting the health of everything it did not
touch. A sweep with a hardcoded list of surfaces and a comment asking the next
person to extend it.

**Measured 2026-09-14, Jefferson-Photography-Studio.** A dialog's buttons were
raised to the 44px a finger needs, and the rule was scoped to that one dialog
under a reason written into the stylesheet: *every other dialog's buttons are a
measured, shipped surface and are not being churned from this change.*

The accessibility sweep that would have measured them opened **three of the
fifteen dialogs** in that page, and ran its axe pass on **one of the seven pages
that deploy**. "Measured" described a state nothing had ever checked. Given the
whole list, the sweep found **six buttons at 35px on two decision dialogs** — one
asking the reader what happens to the location written into their photograph, the
other asking them to confirm — on a device used by touch.

**The sweep had asked for help, in writing.** Above its hardcoded list:

    A NEW SURFACE JOINS THIS LIST IN THE SAME COMMIT THAT CREATES IT, or it
    ships unmeasured — which is how .ql-btn stayed 34px for as long as it did.

It even cites its own previous failure. It was obeyed by whoever wrote it and by
nobody after, which is this family's standing result: an instruction in a file
has never once refused the commit it forbade. The list is an assertion now, both
directions, checked against the BUILD rather than the source tree — one page is
generated at build time and a repository-derived list would have been missing a
page that ships, which is the exact failure the list exists to refuse.

**Two of the first full run's findings were the instrument, and correcting them
is not weakening the gate.** A target inline in a sentence is exempt under SC
2.5.8, because enlarging a link mid-paragraph breaks the paragraph — tested
structurally (laid out inline, sharing its parent with real text), since a
`<button>` styled as a link mid-sentence is the same case. And a button labelled
at open time is EMPTY when a harness opens its dialog cold, so it measures its
padding: two came back 41x19 and read as a finding. Seeded with the shortest
label the product actually uses, they measured 77x35 — and that is where the
real shortfall was. **Every exemption prints on every run**, because an exemption
nobody sees is the difference between "the sweep found nothing" and "the sweep
looked at nothing", and only the printed list tells those apart.

**AND THIS IS THE SECOND `tools/surfaces.mjs` IN THE FAMILY.** Quietkeep has
carried one since §119 — the same concept, written for the same reason ("a sheet
shipped unmeasured"), and §119 is the lesson about that gate's own definition
coming out narrow. This one was written without knowing it existed; the name
collided by convergence, which is how sure a shape this is. They are not
interchangeable: Quietkeep's holds `<section>` and `<dialog>` markers to a
hand-written registry in its source tree, and this one holds deployed HTML pages
and their dialogs to a BUILD, because one of its pages is generated at build time
and does not exist as a file. **Recorded rather than merged**, so the next
session writes neither a third copy nor a hasty hoist: the shared version would
have to take the enumeration as an input, and that is its own piece of work.
§119's own closing test applies to hoisting it — measure how many existing things
would newly fail first.

**One number from this run against §119's rule.** That lesson says the thing to
measure before widening a gate's definition is how many existing things newly
fail: zero means the definition was merely narrow, a large number means it was a
real scope decision. Widening this one from three dialogs to fifteen, and from
one page to seven, produced **six failures on two screens** — not zero. The
narrow scope had been carrying real defects, which is the case §119 says to treat
as a separate, bigger piece of work; here it was small enough to finish, and
saying which of the two it was is the point.

**The cheapest version of this lesson:** when a fix is about to be scoped
narrowly because the neighbours are fine, the sentence to write is not "they are
already measured" — it is the name of the run that measured them. If that name
does not exist, the scope is a guess, and widening the instrument costs less than
the release the guess will cost later.
