## 6. Interface

**Enforced by:** GATE hub:a11y-gate.mjs — every page is measured at more than one viewport including the small-phone-at-200%-text case.

**No fixed size may ignore the space available.** A place card had three
hard-coded sizes computed once at creation time from the window, never from the
map. At 200% text on a small phone the card would not open at all; at 150% it
rendered wider than the map and pushed its own close button off-screen. Raising
text size is equivalent to shrinking the viewport — measure at the moment of
opening, from the container that actually exists.
*(photo-pointer, 2026-07-26. Four of five viewport sizes failed before the fix,
zero after.)*

**A floor must never exceed the space available.** The fix's own minimum width of
160 px inside a 160 px map re-broke the same close button. A guard against small
is a fixed size too.
*(photo-pointer, 2026-07-26.)*

**When a feature is invisible, check the label before moving anything.** Tide
times could not be found because they lived inside a collapsed section labelled
"Tonight & light" — a name that never says "tides". The entire fix was one
string. Restructuring the card instead was wrong, and was correctly called out.
*(photo-pointer, 2026-07-26.)*

**Fix exactly what was reported.** The above is the specific case; the general
rule is that a report of "this label is wrong" is a request to change the label.
Widening it into a redesign is not initiative, it is not listening — and it
destroys working behaviour the reporter never complained about.

**Use the accepted pattern instead of inventing one.** An off-state rendered as
strike-through read as *deleted*, not *off*. The standard filter-chip pattern —
filled when selected, outlined when not, with a tick — communicates it without
being explained.
*(photo-pointer, 2026-07-25.
)*

**Meaning must never ride on hue alone**, and at more than a handful of
categories the hues stop being distinguishable anyway. The glyph carries the
meaning; colour reinforces it. See Doctrine §4 — this is a hard gate, not a
preference.

**A format that does not render is not a format.** Markdown tables were used
repeatedly in the owner's chat replies, and then again in a plan file written for
the owner to read — after the owner had already said they do not work. On iPad they do not
display: the reader gets pipes and dashes, and the information inside them is
lost entirely. Every one of those tables was written by a session that could see
it render correctly on its own side, which is the whole failure — the format was
checked against the writer's output instead of the reader's device. **Check the
format against the reader's device, not your own.** The fix costs nothing: a
headed list carries the same content and renders everywhere. Same shape as the
fixed-size place card that would not open at 200% text — it looked fine where it
was built and was unusable where it was read.
*(Hub, 2026-07-29. The rule is Doctrine §2.)*
