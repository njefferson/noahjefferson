## 346 · Marking something decorative removes it from every instrument, so it can be drawn across a control forever

**Enforced by:** GATE Jefferson-Photography-Studio:tools/scroll-cue-walk.mjs —
sweeps every tab at two widths and fails when any floating overlay's drawn box
intersects a control's box. Geometry, which does not care whether a box is
decorative.
**Enforced by:** CHECKLIST who-samples-this — when adding an element that is
`pointer-events: none`, `aria-hidden`, or has no role and no name, name the
instrument that will see it. If the answer is none, that element has no test
and never will until one is written for it by hand.

**The report was "a weird scroll artefact on the export window".** It was not
an artefact and it was not a rendering fault. Two arrow pills floated over a
scrolling panel saying there was more above and below. The upper one sat four
pixels under the pinned heading, which on that tab is exactly where a dropdown
menu begins, so twelve pixels of scroll drew a 44x27 pill across the top-right
corner of the control the reader had opened the tab to use.

**Its own comment said the right-hand corner is "the one place nothing is
written".** That was true of the controls it had been checked against — that
panel's buttons are full width with centred labels. It is false of a `select`,
which draws its chevron in that corner, and false of a slider, whose track runs
the whole width. Swept afterwards across twelve tabs at two widths, both pills
were drawn over menus and slider tracks on most of them.

**The pill had been moved twice before, each time to a corner where nothing was
written for the controls somebody looked at.** That is the tell: a fix that
re-places an overlay is a fix for the instances inspected, and an overlay's
position is a property of the container while what sits under it is a property
of whatever the reader opened.

## Why it was invisible

The app runs an accessibility walk on every release. Hit area, accessible name,
role, contrast, focus, grayscale — six instruments, all green, all of them
sampling **controls**. The cue is `pointer-events: none` with no role and no
name, so it is in none of those populations. Its own repo had already written
down half of this a week earlier: a version of the same cue shipped for its
whole life as a flat pill with the arrow drawn outside it, and the note said it
survived because every gate measures controls.

The half that was missing: this is not an accessibility-gate blind spot, it is
every gate's. Declaring something decorative is a declaration that nothing will
ever check it — and the more carefully a codebase marks its decoration, the
larger the unmeasured surface gets.

## What to do instead

**Measure geometry, not semantics.** A check that asks "does any drawn box
intersect any control's box" needs no role, no name and no opinion about what
the box is for. It is the one instrument that can see an element that has
opted out of all the others.

**And prefer the labelled thing when both exist.** The upper cue said the same
thing as a labelled 44px button that appeared under the identical condition,
one line away in the same function, under a comment warning that two conditions
for one fact is how they come to disagree. What survived is the one with a
name on it. What is below the fold is said by the content being cut off, which
is what a scroller looks like.
