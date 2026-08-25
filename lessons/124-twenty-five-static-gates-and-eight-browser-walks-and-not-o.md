## 124 · Twenty-five static gates and eight browser walks, and not one asked WHERE anything renders — so a filter shipped inside the surface it filters

**Enforced by:** GATE quietkeep:tools/narrows-check.mjs — an element declaring
`data-narrows="#a,#b"` must precede each of them in the document; both
directions, so deleting the attribute cannot un-cover the rule. · CHECKLIST
render-and-look — every release that moves markup gets rendered at phone AND
tablet width and the picture is opened, not counted.

Quietkeep's `#situation-open` is the door to *where you are* and *how long you
have*. Both are inputs to the offer — the app hands them to `setWhereNow` and
`setHowLong` and the offer card reads them. The door shipped **inside
`<section id="held">`, the section it narrows**, 2129px below that offer on a
phone (3.84 screens) and 1983px below it on an iPad, measured. The two lines
that say the list HAS been narrowed were down there with it. You could be
offered something you cannot do where you are standing, with the control to say
so nearly four screenfuls away.

**The release that caused it was the release that fixed the same defect one
level up.** The two choosers had been loose `<select>`s in the pile; they were
moved into a sheet with a door — and the door was put where the choosers had
been, because that is where the diff was.

Every gate passed, for two releases, correctly. They ask whether a thing exists,
is named, is reachable by finger, contrasts in both themes, meets the target
floor, says the right words, and is on the accessibility walk. **Position is not
in that list.** It was found by rendering the page and opening the picture.

**This is the third time in this family with the same shape.** A proof line that
nothing had gone quiet, 2.73 screens below the list it was reassuring somebody
about. A skip link unreachable by finger for 142 releases with every conformance
gate green (§95). Now a filter below its own output. Each was invisible to a
suite measuring conformance, and each was obvious in a picture.

**The fix is a static gate, not another walk.** Document order is a fact about
the file, so it needs no browser and runs in milliseconds on every commit.
Containment fails by the same offset comparison as being below — a child's
offset is greater than its parent's — so no HTML parser is required.

**Two existing gates were found broken by the commit's own prose, not by looking
for them.** `controls.mjs` builds a landmark stack by matching `<section …>` and
does not strip comments, so a `<section id="held">` quoted inside an explanatory
comment pushed a region that never opened and never popped, and every control
after it reported the wrong region. Its own header already confesses two earlier
bugs in that same function, both of which "produced a confident wrong answer
rather than an error"; this is the third. The sibling gate `surfaces.mjs` had
stripped comments since it was written. **The new gate had the identical bug on
its first run and was caught by it immediately** — a gate whose input includes
its own explanation is a shape worth expecting, not a coincidence.

And `controls.mjs` — the gate whose entire job is *the shape moved, tell the
person whose hands have to relearn it* — tracked five controls, and the one
whose placement was the defect was not among them. All it reported was a
neighbouring button drifting one place in the tab order as a side effect. **A
compatibility surface that excludes the control that moved is not covering it.**
