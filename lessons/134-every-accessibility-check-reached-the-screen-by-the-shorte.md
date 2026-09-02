## 134 · Every accessibility check reached the screen by the shortest programmatic path, so the door a finger actually opens had been broken for six releases with every gate green

**Enforced by:** GATE quietkeep:tools/a11y.mjs — the version-stamp route to the
diagnostic is driven and the revealed controls are measured against the panel's
scroller; planted at 156px and 104px out of sight before the fix. · CHECKLIST
drive-the-route — a surface with more than one way in owes an assertion per way
in, not per surface.

Quietkeep's diagnostic report has two doors: a button inside the ⓘ, and the
version stamp in the footer, which §7f asks for by name. The accessibility walk
reached it with `openSurface` then a direct click on the button — five audits,
both themes, all green, release after release.

**The version stamp is a different program.** It opens the panel, presses the
button for you, waits for an ASYNCHRONOUS build, and then scrolls. It scrolled
the report to the top of the panel, which put the heading, the sentence saying
what the report contains, and all three controls above the visible area.

**And the two controls it hid did not exist until it hid them.** *Copy it* and
*Save it as a file* are `hidden` until the report is built, so they were
REVEALED into the region nobody can see. That is worse than a missing control:
a reader who never sees a control appear has no reason to suspect one did, so
the report they were handed had no way out of the app and nothing said so.

**Every audit measured the room and none measured the arrival.** Contrast,
axe, accessible names, target sizes, focus rings — all correct, all about the
state once you are standing in it. Nothing in a suite of that size asked *how
did you get here*, and each route is its own code with its own scroll and focus.

**It was an over-correction of a fix, which is why it reads as deliberate.** An
earlier release had the stamp open the panel and park the reader on a button
they had to work out they were meant to press; the fix moved the landing onto
the report, "because the report is the thing that was asked for". True, and it
bought the right focus with the wrong scroll. **Scroll position and focus are
two decisions**, and `element.focus({ preventScroll: true })` is what lets them
be — without that flag, focusing pulls the scroll back and silently restores
whichever half you just fixed.

The general rule: **a door is not the room.** Count the ways into a surface, and
if a walk reaches it by a path no person takes, it is measuring something nobody
meets.
