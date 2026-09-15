## 309 · A sweep measures a list of properties, and a defect that is not on the list is invisible however many surfaces it visits

**Enforced by:** GATE `Jefferson-Photography-Studio:tools/a11y-walk.mjs` — two
additions, both from this. Its hit-target sweep now enters EVERY panel tab and
measures inside it, not only the tab the app boots into; and its section 5
asserts that anything which PAINTS a background or a border and holds its own
text has room for it, whether or not anybody can press it. · CHECKLIST
states-differ-by-more-than-colour — a two-state control is rendered in both
states and the two are compared: if taking the colour away leaves them
identical, the state is carried by nothing. This is a CHECKLIST and not a gate
because the REMEDY is copy, and copy is the owner's; the check says the two must
differ, never what they should say.

**Smell:** a sweep that reports on the state the app boots into and never says
which states those were. An element given `pointer-events: none` on purpose. Two
design tokens one step apart (`--txt-2` / `--txt-3`) doing the work of a state.
Any sentence of the form "every control passes", where "control" was the whole
population the instrument could see. And, for the third one below: a diff in
which a measurement and a rewording of reader-facing text arrive in the same
commit.

**Measured 2026-09-15, Jefferson-Photography-Studio.**

An editing panel with twelve tabs. Every accessibility gate it has was green:
axe over every page in both themes, hit areas at two widths, contrast read
composited through translucent ancestors. Three defects were in that panel, and
all three were invisible to all of it. They are not related by cause. They are
related by the shape of the instrument.

**One: the sweep could not see eleven of the twelve tabs.** A tab that is not
selected is `hidden`, so its controls are not rendered and have no geometry.
Entering each tab and re-running the same hit check found **71 controls under the
44px floor**, among them the app's primary action — Export & Save, at 34px,
because 8px of padding round a 0.8125rem line is 34px and that is what the base
button rule produced. Nothing was wrong with the check. The check had never been
given the input. (§306's shape exactly, on a fourth kind of state: a page, a
dialog, a MODE and a TAB are four different things, and the list held two.)

**Two: the thing nothing measures is the thing that is not a control.** Both
panel scroll cues — the "more above" and "more below" arrows — shipped as a flat
10px pill with the triangle drawn OUTSIDE it, underneath, for the entire life of
the feature. The cause is a two-line CSS fact worth knowing on its own: the cue
is `display: flex` with `height: 0` (deliberately, so it floats without taking
space in the flow), and a flex container's default `align-items: stretch` sizes
its item to its CONTAINER. The pill was stretched to zero; all 10px of it was
padding and border. `align-items: flex-start` sizes it from its own content.

That is a rendering error visible at a glance, on a surface swept in two themes
at two widths on every release. It survived because every gate in this family
measures CONTROLS — hit area, accessible name, role, contrast of text — and the
cue is `pointer-events: none` with no role and no name. **Marking something
decorative removes it from the population every instrument samples.**

**Three: nothing checks whether a toggle's two states differ in anything but
colour — and the finding is not the same thing as the fix.** The explanations
toggle wrote `"Explanations"` when on and `"Explanations off"` when off.
`aria-pressed` was correct, so axe was right to pass it. Take the word "off"
away and all that separates the two renderings is `--txt-2` against `--txt-3`:
two greys. The standing rule that colour must never be the only carrier of
meaning had been written years before and applied conscientiously to badges,
rings and chips, and no gate anywhere in the family holds a two-state control to
it. That absence is the finding, and it is real.

**The session then rewrote the labels, and that part was not its to do.** It made
them `"Explanations on"` / `"Explanations off"`, reasoning that a bare noun reads
as a label rather than a control. Defensible, and beside the point: the strings a
reader sees are product copy, the original pair was the owner's, and it was
restored the same day — §307's lesson, arriving again within two days of being
written, on the same repository, from the opposite direction. The first time a
session substituted its taste for a *reader's* and called it a measurement; this
time it substituted its taste for the *owner's* and called it accessibility.

**The tell is that the remedy did not follow from the finding.** "These two
states are separated only by colour" is answered by making them differ in
something that is not colour — and they already did, by one word. Everything
past that point was preference. A measurement that ends in a judgement about
wording has stopped being a measurement, and the giveaway is that the finding
would have been just as true if the fix had been refused.

**What generalises.** Adding surfaces to a sweep widens it along one axis only.
None of these three would have been found by visiting more pages, and two of them
would not have been found by visiting more STATES either. The question a sweep
cannot answer about itself is *what kind of fact am I unable to hold*, and the
cheapest answer available is to look at the thing rendered — which is what found
all three here, in the order: measured, measured, looked at.
