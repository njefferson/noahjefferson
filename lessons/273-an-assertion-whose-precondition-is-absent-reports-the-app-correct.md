## 273 · An assertion whose precondition is absent reports the app correct, in the same words as a pass

**Enforced by:** CHECKLIST assert-the-precondition — an assertion about a STATE
first asserts that the state is present, by name, and fails if it is not. A count
of zero is never allowed to satisfy a check about the zero case. · JUDGEMENT —
before writing the assertion, ask what would have to be in the store for the
defect to be possible, then put it there on purpose rather than hoping the
fixture already has it.

**Smell:** `is(matching.length === 0, true)` about a defect that manifests as a
row. Any assertion of the form "nothing says the wrong thing" over a population
that may be empty. A check that passes on a fresh store. A fixture inherited from
whatever the walk happened to have done by that line.

**Quietkeep 3.23.29, 2026-09-11 — three attempts, all of them reporting green
over a store where the defect could not occur.** The defect: a coverage sheet
filed a node under *with a day they come back to you* when the only clock on it
was one the app had written so that nothing goes silent. The assertion needed one
node the reader had never dated.

- **In the existing gauge block**: nine rows, four naming a return, and NOT ONE
  undated — every node by that point in the walk is dated, on the Menu, or
  finished. The check reported the state absent, which prints identically to the
  app being right.
- **On a fresh capture**, which looked correct and was worse. The gate cures a
  captured item with `gate:capture.recorded`, deliberately EXCLUDED from the
  no-intent set because typing something in is an act — so a captured thing
  honestly carries today, both screens already agree about it, and the assertion
  was measuring agreement it could not disturb.
- **On a first step named on a sheet**: that node has a parent under a clock, so
  the gate never needs to cure it. It carried no clock at all and came back
  covered by its parent — a different, true answer.

**A container made through the place picker** is the node that carries a bare
`gate:node.created`, and it is also the shape a reader who has just filed
something into a new place is actually holding. Planted against the old code, the
assertion goes red.

**The shape.** §268 is a measurement taken at the wrong viewport; §266 is a
control whose threshold the defect can reach. This is the third member: the
apparatus is right, the bound is right, and the SUBJECT is missing. All three
produce the same line of output, and that line is the reason none of them gets
questioned. The fixture is part of the assertion, and an assertion that does not
say what must be present has left its most important half to chance.

**AND THE SAME DAY, IN ANOTHER APP, TWICE — Infrared Photography Studio,
2026-09-12.** Recorded here rather than as its own lesson: two independent
sessions reached this from opposite ends within hours, which is the strongest
evidence the rule has. Both cases add a mechanism this entry did not name — the
missing subject was not an empty population but an inert one.

**A comparison of two implementations agrees perfectly when neither is doing
anything.** A parity check opens a photograph, expects a measured lens profile to
match it, and compares the on-screen render against the exported file to within
1.5 of 255. A store change began refusing every profile that carried a brightness
curve, so nothing matched, so both sides were uncorrected — and they agreed to
0.32 of 255, the tightest agreement that check had ever printed. Its output was
one failing claim, "the profile matched", followed by "GPU and CPU agree"
passing. **That reads as one flaky assertion in a passing suite.** It was a
correction that had silently vanished for every photograph. The fix is two lines:
stop the run when no profile matched, and separately assert that the curve is
changing the picture at all.

**A regex that must not match passes on an empty string.** Another check asserted
that one frame's row carries a sentence and another frame's row does not. It read
the rows with `innerText` from a collapsed panel — which returns nothing for
content the browser considers hidden — and then took the shortest element
mentioning a filename, which is the filename cell. Both strings came back empty,
and two of its four claims passed on nothing at all, including the one asserting
a sentence was absent.

**So the family has a fourth member: the subject is present but inert.** A
population of zero is the version this entry already describes. A comparison
where both sides are switched off, and a string that arrived empty from a DOM
read, are the same failure with a full fixture — and `!/pattern/.test(s)` is
where it hides, because absence is what it is looking for.
