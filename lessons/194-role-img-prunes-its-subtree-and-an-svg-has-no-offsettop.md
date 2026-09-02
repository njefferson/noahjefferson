## 194 · A control inside `role="img"` cannot be reached, and an SVG has no `offsetTop`

**Enforced by:** GATE Cv-Thalweg:tools/render-test.mjs — asserts no focusable element or ARIA role lives inside the figure, and that each overlaid control's box lies over the drawn row it acts on. · CHECKLIST controls-outside-the-picture — a chart that is `role="img"` keeps its controls in HTML over it, never as shapes within it. · CHECKLIST measure-against-the-drawing — verify an overlay against the thing it overlays, never against its own geometry.

**Smell:** `role="button"` or `tabindex` on an SVG shape inside a figure that
already has `role="img"`. Also: any overlay positioned with `offsetTop` or
`offsetLeft` on a non-HTML element. Also: a test that clicks an element's own
bounding box and concludes the element is in the right place.

Four river bars across the top of a landing page were the most prominent thing
on the screen and pressing one did nothing. Making them pressable went wrong
twice, and both failures looked correct.

**First: the controls were drawn inside the picture.** Focusable rects with
`role="button"`, an `aria-label` and a `<title>` each — markup that reviews
cleanly. But the figure is `role="img"` with a written description, and
**`role="img"` prunes its entire subtree from the accessibility tree**. Nothing
inside it is exposed, so those four controls did not exist for anyone not using
a mouse. An automated check reported it only as `nested-interactive`, which
undersells it: the cost was not untidy nesting but four invisible controls. The
fix is that a picture stays a picture and the controls are real HTML buttons
positioned over it.

**Second: the overlay was positioned from `offsetTop`.** `offsetTop` and
`offsetLeft` are `HTMLElement` properties. An SVG element has neither, so they
read `undefined`, the style was set to the string `"undefinedpx"`, and the
browser discarded it in silence. Four full-width buttons came to rest three
hundred pixels down the page, on top of an unrelated component.

**And the part worth carrying furthest: three of the four still passed.** The
test found each button, took its bounding box, clicked the middle of it, and
watched the right thing happen — because a button in the wrong place is still a
button. **Driving an element by its own geometry can never tell you the
geometry is wrong.** The property under test was "this control is over the row
it acts on", and only a check comparing the control's box to THE DRAWN ROW
could see it. Whenever a thing's correctness is a relationship between two
objects, a test that touches only one of them proves nothing.

**A silently discarded style is the mechanism to remember.** CSS drops values it
cannot parse without error, so a units bug in a computed style is invisible at
the point of failure and shows up as a layout that looks deliberate. Anything
composing a style string from a property worth doubting should assert the
number before it becomes a string.
