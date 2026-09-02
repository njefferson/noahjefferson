## 154 · A button class that omits `display` means something else on an `<a>`, and the floor it declares is silently inert

**Enforced by:** GATE MoleBridge:tools/a11y.mjs — every control in every state
is measured against the 44px target floor, which is what found this at 36px. ·
CHECKLIST min-height-needs-a-box — any rule setting `min-height`, `height` or
vertical padding as a TOUCH FLOOR must also set `display`, because the property
is inert on an inline box and half the elements a class gets put on are inline.

**Smell:** a shared class named for a control — `.button`, `.chip`, `.tag`,
`.choice` — that sets a size floor and never says what kind of box it is. It
works on every `<button>` it is tried on, because a button is inline-BLOCK by
default, and the first `<a>` or `<label>` it reaches is inline, where
`min-height` does nothing at all.

MoleBridge's `.button-small` declared `min-height: 2.75rem` with a comment
explaining that 44px is the floor a finger needs and that "small" is about how
loud a control looks rather than how hard it is to hit. On an anchor it rendered
at **36px**: padding plus a line box, with the floor having no effect. Every
`<button>` carrying the class was correct. The link back from one page to
another had been eight pixels under the app's own stated floor for its whole
life.

**It is the second time in the same app.** An earlier release found a 42px row
from `min-height` on an inline `<label>`, and fixed it by giving that one rule a
`display`. The general form was available then and was not taken — the fix was
applied to the rule that was failing rather than to the class of mistake, and
the same defect was waiting in three sibling rules.

**The rule.** A class that says *this is a button* has to make that true of the
ELEMENT, not true of buttons. Declare `display: inline-flex` (or `flex`) with
the alignment, so the class means the same thing wherever it is put.

**Why no amount of reading finds it:** the stylesheet is correct in isolation,
the comment states the right number, and the markup is correct in isolation. The
defect exists only in the pairing, and only a measurement of the rendered box
can see it. This is the same family as a computed-style gate that cannot see
clipping — the cascade resolved the property exactly as written, and the layout
never used it.
