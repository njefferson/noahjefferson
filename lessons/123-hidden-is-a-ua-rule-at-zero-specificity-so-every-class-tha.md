## 123 · `hidden` is a UA rule at zero specificity, so every class that sets `display` silently outbids it — and one of the three controls this exposed had been on screen for eleven releases

**Enforced by:** GATE 3d-printing-pal:tools/a11y.mjs — it found this twice
without being changed, first as two targets 7px apart in a state where one was
supposed to be absent, then as a contrast selector matching nothing once the fix
landed. · CHECKLIST hidden-wins — a stylesheet that hides anything by attribute
carries `[hidden] { display: none !important }` ONCE, near the top, rather than a
per-class rule added each time somebody meets this.

`<div hidden>` and `element.hidden = true` are honoured by a user-agent rule of
specificity ZERO. Any author rule that sets `display` — `.field { display: flex }`,
`.btn { display: inline-flex }` — wins, and the attribute becomes decoration. The
element stays on screen, the property still reads `true`, and every piece of code
that sets it looks correct.

**A new conditional field made it visible. It had been there far longer.** The app
had `#job-delete.hidden = !job`, so the Add form should have had no Delete button;
`.btn` is `display: inline-flex`, so it had offered to delete a job that did not
exist yet since the form was written. Nobody had reported it and nobody had seen
it, because a Delete button on a form is exactly where a Delete button belongs.

**Four classes in that stylesheet already carried their own `[hidden]` rule** —
`.strip`, `.view`, `.empty`, `.report` — each added by whoever met this next.
**Four independent encounters with one defect, each fixed locally, and the fifth
still cost a shipped bug.** That is the signature of a rule being kept by memory:
it looks handled, because every instance anybody looked at was.

**The fix is one line and it is a SHAPE fix** (§121): the global rule with
`!important`, which is the rare case where `!important` is correct rather than a
smell — `hidden` is a semantic that must beat presentation by definition, and the
cascade has no other way to say so. The four local rules then delete, because a
file with five answers to one question is a file where the next person picks one.

**What made it findable was an accessibility gate measuring geometry rather than
markup.** A checker asking "is this element hidden" would have believed the
attribute. The target-size check asked how far apart two visible controls were,
got 7px, and named a control that should not have been in the layout at all — the
defect appeared as a spacing failure. **Then fixing it broke a second check in the
opposite direction**, a contrast registry entry that no longer matched anything,
which is what surfaced the Delete button. Neither check knows what `hidden` is.

**The general form: an enforcement mechanism whose strength is "lowest priority"
is not an enforcement mechanism.** It is a default, and defaults lose. Anywhere a
platform gives you a zero-specificity guarantee for something that must not be
overridable, restate it at a priority nothing outranks.
