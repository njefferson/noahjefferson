## 168 · An author `display` rule silently disables the `hidden` attribute, and the element paints beside the sentence explaining it is not being offered

**Enforced by:** GATE solve-ent:tools/walk.mjs — the walk asserts the control is
not visible on the step where it is withheld, which is a rendered-box question
rather than an attribute question. · CHECKLIST hidden-needs-a-reset — any
stylesheet that sets `display` on a shared control class owes
`[hidden] { display: none !important; }` once, at the top, or the `hidden`
attribute is inert on every element that class reaches.

**Smell:** code that hides something by setting `el.hidden = true` in an app
whose stylesheet gives that element's class a `display`. Both halves are
correct and idiomatic. The attribute is the platform's own way to say *not
now*; the class is the ordinary way to lay a control out.

The user agent hides the attribute with `[hidden] { display: none }` **from its
own stylesheet**, and every author declaration beats every user-agent one
regardless of specificity. So `.ghost { display: inline-flex }` — one line
written to give a button a touch floor — makes `hidden` do nothing on every
ghost button in the application, for as long as the class exists.

Solve-ent's calculator withholds its *put this in the answer* control on a step
that asks the reader to choose between rearrangements, because there is no box
to put a number in, and prints a sentence saying so. The control was set
`hidden`, the sentence was shown, and **both rendered at once**: an offer to put
a number somewhere, directly above a line explaining there was nowhere to put
one. `hasAttribute('hidden')` was `true` and `getComputedStyle().display` was
`flex` in the same reading.

**Two gates were green over it.** The accessibility sweep opened the panel in
both modes and measured the button's contrast and its target size — it was
asked whether what is rendered is legible, never whether it should be rendered.
And the walk's own check for this case sat inside a guard that only selected
steps of the OTHER kind, so the assertion never executed; a check that never
runs reports the same green as one that passes. It was found by looking at a
screenshot.

**The rule.** `[hidden] { display: none !important; }` once, near the top of the
sheet, in any app that hides anything by attribute. `!important` is correct
here rather than sloppy: this is the one declaration that must outrank every
layout rule in the file, and the alternative is remembering, at every new
control, that hiding it needs a class as well as an attribute.

**MOLEBRIDGE FOUND THIS FIRST, and it is written in their stylesheet.** Their
`.update-strip { display: flex }` had been showing the stale-app strip on every
load — the one element whose entire purpose is to appear only when a new version
is genuinely waiting — and their fix is the same declaration in the same place,
with a comment ending *caught by looking at the screen; nothing else would have*.
Solve-ent re-derived it months later. **This lesson is a second occurrence, not
a discovery**, and the reason it was second is §164: a defect a sibling app has
already found is one this app probably has, and reading their MARKUP is not
reading their repository. Their stylesheet had the answer and their NOTES had
the reasoning.

**Why no amount of reading finds it:** the stylesheet is right, the markup is
right, and the code that sets the attribute is right. Nothing is wrong in any
file. The defect lives in the cascade between a rule and an attribute written
months apart, and only a rendered box can show it — which is the same family as
§154, where a `min-height` floor was inert on an inline element, and §158,
where a stylesheet block that never landed passed every accessibility check.
