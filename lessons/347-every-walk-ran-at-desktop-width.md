## 347 · A width visited by ONE instrument reads as covered, so a layout defect lived at phone width with nothing looking for it

**Enforced by:** GATE Jefferson-Photography-Studio:tools/start-screen-walk.mjs —
runs at the reported 402x812 and fails when the editor drawer is on screen
behind the start card, or when the card gets less room than a cold start gives
it.
**Enforced by:** CHECKLIST what-width — a walk that measures LAYOUT states the
width it runs at and why that width. A responsive app has a different truth on
each side of a breakpoint, so a walk that does not say which side it is on has
measured one arm of an `if` and reported it as the answer.

**Reported from an iPhone: pressing Home after editing did not dismiss the
menu.** The start card arrived squeezed into a third of the screen, clipped
mid-sentence with its scroll cue showing, and the whole editor drawer — twelve
tab buttons and the open section — was stacked underneath it.

**It had been true for as long as the start card has existed**, and forty-one
browser walks had never seen it.

## Why it was invisible

**THE FIRST VERSION OF THIS LESSON GOT THIS WRONG, AND THE WRONG VERSION WAS
PUSHED.** It said the narrowest viewport any walk used was 900px, from a grep
for `viewport: { width: <literal> }`. Two walks set width from a LOOP and the
grep could not see them: the accessibility walk re-opens every page and every
dialog at **430 and 900**, and the scroll-cue walk loops **1180 and 420**. A
third sets no viewport at all and inherits the driver's 1280x720 default.

**Counted properly: 42 walks, and about twelve of them are ones where the
viewport is LOAD-BEARING** — the walks about layout, or about the position and
reachability of controls, as opposed to pixel correctness, export bytes or
timing. **Of those twelve, exactly one runs at phone size.** Two others sample
a narrow width, and each measures exactly one property there: hit-area size,
and whether a scroll cue lands on a control. The remaining nine assert control
layout and reachability on a 1280x950 desktop window with no touch, no mobile
flag and device pixel ratio 1 — while every report they exist to answer arrives
from a 402px phone or a tablet.

**So the real shape is worse than "nobody went there", and the correction is
the lesson.** Ask "do the walks test phone width?" and the honest answer is
yes. Two of them do. That answer is what kept anybody from looking again — one
instrument standing at a width makes the width read as measured, and the nine
walks that would have seen this defect were all somewhere else.

The layout is responsive, and that is the whole mechanism. Above the breakpoint
the drawer is a side COLUMN: leaving it on screen costs the stage nothing, the
start card keeps its height and there is no defect to find. Below it the drawer
is a bottom sheet in one column, so the same code path takes two thirds of the
window away from the stage — and the card is positioned inside the stage at
`max-height: 92%`, so it can only ever be as tall as what is left. One cause,
visible at one width, and every instrument stood on the other side of it.

**A viewport is not a detail of a harness; it is an input to the thing under
test.** Nothing in forty-one files was wrong. They were all measuring the same
arm of the same branch, and nothing said so, because a width is the one
parameter a walk sets once at the top and never mentions again.

## What the app's own diagnostic did

**The report carried the cause before anything was read.** The §7f text report
pasted beside the screenshot said `window 402x812` and `inside a stage of
402x272`, which is the defect stated as two numbers: the stage had a third of
the window, and the card lives inside the stage. The screenshot showed the
symptom; the diagnostic localised it. That is the argument for §7f in one
report — a picture says something is wrong, and a text report says where.

## What to do instead

**Pick the width from who holds the device, not from the machine writing the
walk.** A walk inherits its viewport from whatever the last one used, and the
last one inherited it from a desktop browser window. Name the reader's widths
once and make the layout walks run there. A walk that sets no viewport at all
is the same defect one level down: it is running at a number nobody chose.

**AND COUNT COVERAGE BY PROPERTY, NOT BY PRESENCE.** "Is this width tested" is
the question that returns a misleading yes. The question that does not is
"which properties are asserted at this width" — here it was two, out of every
property those twelve walks check between them.

**And when a defect is reported at a width nothing measures, fix the blind spot
in the same commit as the defect** — otherwise the next one arrives the same
way. The repair here was one function; the instrument was the work.

**The general shape: a parameter every test shares is a parameter no test is
testing.** Viewport is the obvious one. The same holds for the theme the walk
runs in, the file it opens, the core count, and the device pixel ratio — any
setting that sits at the top of every harness and is the same in all of them.
