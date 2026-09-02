## 95 · Conformance is defined for input methods in general. Nobody was measuring the one the app is actually used with

**Enforced by:** GATE quietkeep:tools/touch-check.mjs — an interactive element CSS parks off-canvas (the focus-reveal idiom) must name a touch-reachable partner with `data-touch-partner="#id"`; the gate checks the partner exists, is on-canvas, meets the 44px floor, and goes to the same place. **CHECKLIST reference-platform** — for any affordance whose job is to GET somewhere, name the input method that will use it before writing it, and drive it that way in the walk.

Every app in this family is built for a tablet, used by touch. That is written
down and it is not in dispute.

`public/index.html` has carried the textbook WCAG 2.4.1 bypass-blocks pattern
since its first commit:

```
<a class="skip" href="#cards">Skip to what you are holding</a>
```

positioned at `left: -9999px` and revealed on `:focus`. That is the correct
implementation of that pattern and it serves a keyboard.

**In the same commit, `#capture` got `autofocus`** — which places the document's
focus *after* the link. So it was never reachable by tabbing forward either.
Reaching it takes three Shift+Tabs backwards. **It was born unreachable for its
own stated purpose, in the commit that created it, and shipped that way for 142
releases.**

**What it was the only route to.** On a full store the held list begins **3.0
screens down at 820×1180 and 4.9 at 390×844** — measured — behind nine sections
each answering a question the reader did not necessarily arrive with. The app's
one way past that existed, was correct by the standard, and could not be pressed
by a hand.

**Why every gate stayed green, and this is the transferable part.** That repo's
accessibility apparatus is unusually strong: contrast computed per state, focus
rings focused-and-measured rather than assumed, target sizes in both dimensions,
axe per state and at a stressed viewport, both themes. Every one of those asks
**does this conform**. Conformance is specified for input methods in general, so
a keyboard-only route passes all of it — and a strong suite is the *most* likely
place for this to hide, because green is abundant, specific, and looks like
diligence.

**The gates were measuring the standard. Nobody was measuring the user.**

**And the failure has a tell that was visible the whole time:** the affordance
existed. Somebody had already decided the reader would need to get past the
stack. The decision was made, implemented to the convention, and never checked
against the one way it would be used. A feature nobody can reach is worse than a
missing one, because its presence in the source answers the question "have we
handled this" for every future reader.

**The check that would have caught it is one sentence, asked once:** *who reaches
this, with what?* Not "is it accessible" — it was — but which hand takes this
route. Every other gate in that repo can be green while the answer is "nobody".
