## 192 · A legend drawn outside its own picture answers "have we explained this" for everyone after

**Enforced by:** GATE Cv-Thalweg:tools/render-test.mjs — walks every drawn element's bounding box and fails if any part of it falls outside the figure's own width and height. · CHECKLIST place-from-the-same-edge — when two things
are positioned against the bottom (or right) of a drawing, compute both from
that edge, never one as an offset from the other. · JUDGEMENT — no accessibility
or contrast check asks whether a thing that exists is inside the frame.

**Smell:** a coordinate written as `otherThing.y + N` where `otherThing` was
itself placed as `edge - M`. Also: a legend, caption, or axis label that no
screenshot in the repo happens to show. Also: a reader reporting that something
has no key, when the source plainly contains one.

A figure encoded two things in colour: a temperature ramp, and a wash over part
of each bar marking how far up the river the tide reaches. Both had a swatch.
The ramp was placed 26 px above the bottom edge of the drawing. The tide swatch
was placed 26 px below the ramp — which is exactly the bottom edge, so it was
drawn on the boundary of the viewBox and clipped away entirely.

It had never once been visible, on any screen, since the day it was written.

**The report was that the colour band had no legend, and that was exactly
right.** The band read as decoration, or as the bar simply being a gradient,
because nothing on screen said otherwise.

**Why this is worse than never having built it.** The swatch was in the source,
with a comment above it explaining why a colour that means something needs a
key as much as the ramp does. Any session opening that file — and every review
after — got the answer "yes, that is handled" from code that had never drawn a
pixel a reader could see. **A feature nobody can perceive is not a feature that
is merely missing; it is a feature that actively defends its own absence.**
This is the same shape as a skip link that is correct, conformant, and
unreachable by the only input method the app is used with.

**The positioning mistake generalises.** Two elements were anchored to the same
edge, but only one of them said so: the first was `edge - 26`, the second was
`first + 26`, and the arithmetic quietly cancelled to `edge`. Anything laid out
against a boundary should be measured from that boundary, so that a change to
one does not silently push another through it.

**The gate that catches it is cheap and general.** Ask the drawing for every
element's bounding box and require it inside the drawing's declared width and
height. That is a handful of lines, it runs on the real rendered geometry
rather than the source, and it cannot be satisfied by an element that is
present but unseen — which is the entire failure mode.
