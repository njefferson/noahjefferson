## 283 · A shorthand property later in the same rule silently kills the longhand above it, and a browser's own default can hide that for years

**Enforced by:** CHECKLIST shorthand-after-longhand — in any CSS rule that sets
both, the shorthand goes FIRST or the longhand's value goes inside it. Grep a
stylesheet for a `font`, `background`, `border`, `margin`, `padding`, `flex`,
`grid`, `transition` or `animation` shorthand and check what longhand sits above
it in the same block. · CHECKLIST measure-the-rendered-box — no stylesheet gate
catches this, because the CSS is valid; what catches it is a harness that reads
each control's rendered box against its own text node, which is how the 23px was
found. · JUDGEMENT — the tell is a declaration whose effect you cannot point to
on screen.

**Smell:** `line-height` above `font`. `background-color` above `background`.
`border-radius` above `border`. Also: a control that looks right in one element
type and wrong in another, with one class on both.

**Infrared Photography Studio, 2026-09-12.** One rule styled every button in the
diagnostics panels. It set `line-height: 44px` to centre the text in a 44px
control, and nine lines later `font: 500 0.9375rem var(--ui)`. The `font`
shorthand resets every part it omits, so the line height went back to `normal`
and **the 44px was dead from the day it was written.**

It was invisible for the life of the rule because a browser centres a `<button>`
element's own text for you. The two controls in that panel which are `<label>`
elements — the only way a file input can be styled at all — get no such help, so
their text sat 1px from the top of the control with 24px beneath it.

**Measured rather than eyeballed, which is what turned a vague report into a
one-line cause.** A harness read each control's box and the box of its own text
node: 23.0px off centre on both labels, 0.0px on the two real buttons beside them
in the same row. That pattern — two element types, one class, one right and one
wrong — is what says the rule is relying on a UA default rather than doing the
work.

**The fix is not to re-add the longhand.** Flex centring cannot be undone by a
shorthand, holds when the text wraps to two lines, and treats the label and the
button identically. The line height now lives inside the shorthand, so there is
one declaration of it instead of two with the loser first.

**And the part worth sitting with.** Four lines above the dead declaration, in
the same rule, is a comment explaining that a `<label>` silently opts out of a
tag-keyed `width` rule. The class then silently opted its own centring out by
shorthand. **A comment explaining one instance of a trap is not protection
against the next instance of it** — only a measurement of the rendered result is.
