## 33 · A registry that cannot see a thing reports it MISSING

**Enforced by:** GATE fauxplane:scripts/a11y-gate.mjs — the contrast registry now
reads a form field's value, and a selector that matched elements but found no
measurable text says so in those words instead of "matched nothing".

fauxplane's contrast registry, 1.16.0. Every foreground/background pair the app
renders is listed, and a selector matching nothing is a hard failure — that is
what makes "a new pair joins the gate in the same commit" mean anything. It
filtered candidates with `n.textContent.trim.length > 0`.

**An `<input>` has no `textContent`.** So the registry was structurally blind to
every text field in the app, and had been since it was written. Registering the
new airport picker's box produced:

 contrast registry selector matched nothing: .radar-centre-input

which reads as *the element is not there* — the message sends you to look for a
missing element or a renamed class. The element was there, painted, with a value
in it. The gate simply could not see it, and its vocabulary had no way to say so.

**The failure is not the blind spot; it is the blind spot reporting as the wrong
diagnosis.** A gate that said "I cannot measure this" would have cost five
minutes. One that said "it is not there" costs however long you spend proving it
is. Any check with a fixed failure message should be asked what ELSE produces it.

**And the second half, which is the part with teeth.** The sampler hides the
registered text, screenshots, and reads the backdrop pixel. `visibility: hidden`
on a `<p>` reveals what is behind it — correct. On an input it takes the field's
own background away too, so the sample reads the card behind the box and the gate
happily measures the field's text against a colour it is not on. **The number
would have been wrong and green.** Blanking the value leaves the box painted and
removes only the ink.

**The general shape: when you teach an instrument to look at a new KIND of
thing, re-derive its method rather than extending its list.** Every step that
assumed "text in a transparent element" has to be asked again.

*(fauxplane, 2026-08-03.)*

---
