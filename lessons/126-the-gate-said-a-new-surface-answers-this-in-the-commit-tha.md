## 126 · The gate said "a new surface answers this in the commit that creates it", and the half that could answer at commit time was the half that ran in a browser

**Enforced by:** GATE quietkeep:tools/plain.mjs — the "every region of `<main>`
is declared" direction is now static, and was planted by undeclaring the three
regions that shipped undeclared. · CHECKLIST walks-after-markup — a change that
moves markup runs the walks that DRIVE states, not only the ones that take
pictures.

Quietkeep's "Just one thing" mode strips the work surface to one offer.
`src/plain.ts` declares, region by region, what survives it and what does not,
and its docstring says the gate "walks the rendered header, `<main>` and the
footer and fails on any region in neither — **so a new surface answers 'does
this survive the worst day' in the commit that creates it**, rather than four
releases later when somebody counts."

That sentence is true of the a11y WALK. It was not true of `npm run plain:check`,
which shares its name and its source file.

**The asymmetry was exact.** For the offer card the static gate checked BOTH
directions — every element declared, and every declaration real. For the chrome
it checked only *declared → exists*. The *exists → declared* direction, the one
that catches a region nobody accounted for, ran only in the browser.

**So three regions moved out of a container that had covered them by covering
it, every static gate went green, the release shipped, and CI failed ten minutes
later** on the mode built for the worst day — which had grown a filter asking
*where are you, how long have you got*, two questions to answer before anything
can begin, on the day nobody can answer them.

**The regions of `<main>` are readable from the file.** The static check is not a
smaller copy of the walk — the walk sees runtime-inserted regions this cannot —
but it catches the case that actually happens, which is markup being moved, and
it catches it at the commit.

**The general shape: when a gate exists in a fast form and a slow form, check
which assertions live in which.** A session runs the fast one, reads a docstring
describing the slow one, and concludes correctly from a false premise. The
docstring is not lying; it is describing a sibling.

---
