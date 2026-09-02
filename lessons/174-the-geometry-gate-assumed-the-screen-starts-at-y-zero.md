## 174 · The geometry gate assumed the screen starts at y = 0, and certified something behind the header

**Enforced by:** GATE solve-ent:tools/fold-check.mjs — the usable area is read
off the sticky chrome's own box on the page under test, never assumed. ·
CHECKLIST measure-the-usable-area — any check asking "is this on the screen"
must subtract whatever is fixed OVER the screen: a sticky header, a bottom
action bar, a consent strip, an on-screen keyboard. `y >= 0` is a claim about
the viewport, not about what a person can see.

**This is §172 one step on.** That lesson establishes the distinction — *is it
visible* is a question about computed style, *can it be seen* is a question
about geometry — and says to assert the rectangle against whatever clips it.
This is what happens after you take that advice: **the geometry check itself
carried the same assumption**, because the obvious formulation of "on the
screen" is a comparison against the viewport's raw dimensions, and that is
correct right up until something is pinned over it.

**Smell:** a visibility check whose ceiling is the number zero.

Solve-ent's `fold-check.mjs` was written because two controls had shipped
correct, measured, contrast-checked, target-checked, axe-clean and invisible on
a keyboard-raised phone. Its first run found a third: after a wrong answer the
page scrolls to the diagnosis, taking the chrome with it, putting the
calculator **533px above the top of the screen** — at exactly the moment a
reader has got something wrong and most wants it.

**The fix was a sticky bar, and the sticky bar broke the gate that demanded
it.** An opaque strip now covered the top 65px, and the scroll landed the
diagnosis with its top edge at 8px: passing `y >= 0` with its first 57 pixels
behind the header. **A gate carrying the same blind spot as the defect it hunts
is worse than no gate** — it certifies the exact thing it was built to find, and
its green reads as coverage.

Two things the same investigation turned up:

- **`scroll-margin-top` alone did not fix it.** Declared at 69.6px, the panel
  landed at 43px. `focus()` scrolls with the user agent's `block: nearest`
  heuristic, which stops as soon as the element is *technically* inside the
  viewport and honours the margin only that far. The reliable shape separates
  the halves: `focus({ preventScroll: true })`, then an explicit
  `scrollIntoView({ block: 'start' })`.
- **Raising a value until the number looks better is not debugging.** Two rounds
  moved the failure from 57px to 22px and a third would have "passed". One
  reading of what the browser actually did — computed margin, scroll position,
  maximum scroll, active element — showed the margin was being partly IGNORED
  rather than being too small, which no amount of raising it would have fixed.

**The rule.** A reachability check has a ceiling and a floor, and both are
measured on the page rather than taken from the viewport. Write the ceiling
before there is anything sticky to justify it: the version that assumes zero
passes everything you have until the day it is wrong, and on that day it is
silent.

**On trusting a new gate:** this one is worth trusting only because it failed on
its first run, and again on its first extension. A gate that goes green
immediately has told you nothing about the app and nothing about itself.
