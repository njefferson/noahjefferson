## 267 · A defect invisible in some cases is reported as being about the cases where it shows, and the report names the wrong thing

**Enforced by:** CHECKLIST widen-before-fixing — when a report names ONE option,
preset or input that misbehaves, list what actually differs between it and the
ones said to work BEFORE looking at code. If the working cases differ from the
broken ones by which term carries their identity, the fault is in a shared term,
not in the named case. · JUDGEMENT — the reporter's scope is evidence about
visibility, never about extent.

**Smell:** a bug report whose title is a proper noun — this look, that preset,
this file type. Also: a fix that would touch only the named case, when the code
has one shared path.

**Infrared Photography Studio, 2026-09-10.** Reported: the strip thumbnails
always render as Aerochrome, not Goldie when Goldie is selected.

The fault was not about Goldie and not about Aerochrome. `applyLook` bakes a
look's white-balance bias INTO the live params; the thumbnail builder then
replaced that white balance wholesale with the photo's own gray-world value,
dropping the bias for EVERY look. One line, one shared path, all seven looks.

**What made it look like a Goldie problem** is the looks table. `aero`, `goldie`
and `red` carry identical `swapRB` and `hue` — they are separated almost
entirely by `wbBias`. Remove the bias and those three become the same picture,
and since aero has no bias at all, that picture IS Aerochrome. The other four
looks differ by swap, saturation or tint, all of which survived, so their tiles
did change and the defect presented as "the false-colour looks don't work"
rather than "white balance is being discarded".

**Measured:** across Aerochrome to Goldie the main view moves 38 and the
thumbnails move 5 with the bias dropped, 213 with it carried.

**Why this matters beyond one bug.** Fixing what was reported would have meant
special-casing Goldie — plausible, small, and wrong, leaving the same hole for
every future look and for saved looks. The two minutes spent reading the table
that defines the options is what turned a proper noun into a shared term. **The
question is never "why is this one broken" but "what do the working ones have
that this one does not" — and when the answer is "nothing structural, only which
field carries the difference", the fault is upstream of all of them.**
