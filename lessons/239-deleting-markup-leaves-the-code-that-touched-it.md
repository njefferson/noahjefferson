## 239 · Removing markup leaves the line that touched it, and the screen still looks finished

**Enforced by:** GATE unlisted-app:tools/panel-shot.mjs — every route opened in
a browser and asserted to render to the END, plus a named check that one
screen's controls are each wired to something. It found a second broken screen
on its first run. · GATE unlisted-app:public/app.js — the router's catch
reports rather than discarding, which is what makes the failure observable at
all. · CHECKLIST what-else-touched-it — when deleting an element, search the
file for its id before deleting, not after. · JUDGEMENT — whether a shared
wiring function should guard for an element or the caller should stop calling
it.

**Smell:** a release that removes a control. An `innerHTML` render followed by
a run of unguarded `$('#id')` assignments. One guarded lookup sitting among
unguarded ones — somebody has already been bitten and fixed only the instance in
front of them. And the loudest one: `.catch(() => {})` under a comment
explaining why nothing needs to be done.

**Two screens, 2026-09-04.** A release removed a fieldset that had no business
being on that screen. It left behind the one line that filled in a field inside
it. The lookup returned null, assigning to `.value` threw, and every statement
after it stopped running — a list, a second list, and the wiring for all six
controls on the screen.

**The screen rendered perfectly.** Every button was where it belonged. Not one
of them was connected to anything, including the control that three separate
screens send people to when they cannot sign in on a new device. It shipped, and
was found by a reader pressing buttons.

**The gate written for that release checked the PROSE of the change** — that no
instruction still named the removed section. It was a good gate and it was
aimed at the wrong half. Nothing anywhere asked whether the screen still worked.

**And one line was hiding all of it:**

    return busy(dispatch()).catch(() => { /* dispatch and busy have both spoken */ });

True of the failures those two handle. False of everything else, and everything
else is where it mattered. Every half-drawn screen in the application was
discarded there in silence. Making it report cost one word and immediately
exposed a second screen that had been throwing on every single render, because a
shared wiring function wires two controls that only one of its two callers has.

**A render that throws halfway is the worst shape of failure available**: the
markup is already on the screen, so it looks like success, and the part that
did not run is the part that does anything.
