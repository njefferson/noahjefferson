## 347 · Every walk ran at desktop width, so the app's own reader was the only instrument at phone width

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

Counted in that repository on the day it was found: **42 walks, 41 of which
declare a viewport. Thirty-three run at 1280px wide, four at 1100, three at
1000, one at 1400 and one at 900. The narrowest was 900. The app's reader is on
a 402px phone and a tablet.**

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
once and make the layout walks run there.

**And when a defect is reported at a width nothing measures, fix the blind spot
in the same commit as the defect** — otherwise the next one arrives the same
way. The repair here was one function; the instrument was the work.

**The general shape: a parameter every test shares is a parameter no test is
testing.** Viewport is the obvious one. The same holds for the theme the walk
runs in, the file it opens, the core count, and the device pixel ratio — any
setting that sits at the top of every harness and is the same in all of them.
