## 175 · A dialog with no focus target of its own opens wherever the engine decides, and the two engines decide differently

**Enforced by:** GATE cv-thalweg:tools/a11y.mjs — `welcomeChecks` asserts
`document.activeElement` by NAME after the dialog opens, that its scrolling
body is at the top, and that the dismiss is on screen and hit-testable both at
the top and scrolled to the very end; it fails on leaving the focus choice to
the browser rather than on one browser's answer. · JUDGEMENT — a
behaviour that differs between engines cannot be measured by a walk that drives
one of them, so the assertion has to be about what the code DECIDED, not about
what the browser did with the absence of a decision.

**Smell:** a `<dialog>` whose content scrolls, with no `autofocus`, no
`tabindex="-1"` heading, and no `.focus()` call after `showModal()`.

Thalweg's first-run panel opened scrolled to its own last line. What the reader
got was a Start button, a couple of lines above it, and no indication that four
screens of orientation — what the app is, what it will not do, how to install
it — were above the fold, upwards.

The cause is in the dialog focusing steps. With no `autofocus` the browser
focuses the first focusable element it finds, and focusing something inside a
scrolling container scrolls that container to it. The first focusable element
was the Start button, at the very end of the body. **So the panel scrolled past
everything it existed to say in order to show the button for dismissing it.**

**Every Chromium walk was green, and would have stayed green.** Chromium makes
a scrollable region focusable in its own right, so it lands on the panel body
at scroll zero and the defect does not appear. WebKit does not, so it takes the
first tabbable element instead. The app is used on an iPad and an iPhone. Two
viewport sizes, axe in every state, no page errors — all measured, all true,
all in the one engine where the bug is invisible.

Planting the original markup back confirmed it: at 1280x900, 390x844 and
320x568 at 200% text, Chromium reported `activeElement` as the panel body and
`scrollTop` as zero every time. The `scrollTop === 0` assertion — the obvious
one, the one that describes the symptom — is exactly the assertion that cannot
fail here.

**So assert the decision, not the outcome.** `activeElement.id === 'welcometitle'`
is false in every engine when nothing set it, because nothing setting it is the
defect. A check written against the symptom is only as good as the engine
running it; a check written against the missing decision holds everywhere.

The same panel had no way out except that Start button at the end, which is
four of Doctrine 7e's six dismiss rules broken at once — nothing visible in the
first frame, nothing reachable from a scrolled position, nothing wired before
the content, and the only exit at the bottom of the thing you are trying to
leave. **A dismiss placed only at the end of a scrolling body is reachable
exactly when the reader does not need it.** Put it in the head, outside the
scrolling element, where no scroll position can move it and no sticky
positioning has to be trusted to keep it.

**It was found by somebody using the app.** §172 was too, on the same app, in
the same week: both were interactions that every gate declared correct and that
the reader could not use. The pattern in both is that the suite asserted the
state of an element and never asked what the person in front of it was looking
at.
