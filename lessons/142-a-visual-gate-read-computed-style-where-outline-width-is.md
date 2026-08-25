## 142 · A visual gate read computed style, where `outline-width` is 3px whether or not one of those pixels reaches the screen

**Enforced by:** GATE quietkeep:tools/a11y.mjs — `auditFocusRings` builds the
ring's own rect from the element's border box plus `outline-offset` plus
`outline-width`, and checks it against every clipping ancestor up to and
including the nearest open `<dialog>`. · CHECKLIST is-it-set-or-can-it-be-seen —
for any gate that reads a computed property to decide whether something is
VISIBLE, ask what would have to be true for that property to be set and the
pixels still not arrive. Clipping, occlusion and being scrolled out of view all
leave the property exactly as it was.

**Smell:** a gate reads `getComputedStyle` and reports on appearance. Computed
style is what the cascade RESOLVED, not what the compositor PAINTED. Every step
after the cascade — clipping, stacking, the top layer, scroll position — is
invisible to it, and each of those can take the thing away while leaving the
property that describes it untouched.

An app shipped 142 releases with a focus ring cut off on all four sides of
nearly every control in it, with the accessibility walk green on that exact
control, in both themes, in every colour set, on every release. The walk Tabbed
to each control the way a keyboard user does, read `outline-style`, read
`outline-width`, computed the ring's contrast against the background behind it
and asserted solid, at least 2px, at least 3:1. All true. `#capture` carried
`outline: 3px solid` at `outline-offset: 2px`, so the ring wanted to sit 5px
outside the element, and 5px is exactly what was missing.

**The clip came from a rule about the other axis.** `overflow-y: auto` forces
the used value of `overflow-x` from `visible` to `auto` — the two axes cannot
disagree about whether there is a clip box, so a container written only to cap
its own height clips sideways as a side effect. Three containers in that app
scroll; between them they cut every ring that reached an edge. The one written
to clip horizontally on purpose was full width, so it took both ends off seven
controls on the landing view alone.

**And the rule that reads like the fix is not the fix.** `overflow-x: clip` with
an `overflow-clip-margin` looks purpose-built for this, and beside
`overflow-y: auto` it computes to `hidden` — `overflow-clip-margin` applies only
to `clip`, so it never takes effect. Measured, after being written. What works
is arithmetic: `padding-inline: 6px` with `margin-inline: -6px`, which moves the
clip box out and puts the content back where it was. `scroll-padding` covers the
scrolled positions, where Tab aligns a control flush with the scrollport edge;
a little content padding covers scroll position zero, where there is nothing
above to inset into and `scroll-padding` has nothing to do.

**The gate's first run found ten more nobody had reported**, in the panels,
which is the argument for writing it rather than fixing the one control that was
described.

**It also got two things wrong first, and both are about what a clip box is.**
It reported 62px, 88px and 179px beside the real 5px findings in the same words:
a control BIGGER than its scroller has part of itself outside by arithmetic, and
that is not a clipped ring. Three outcomes per axis, and only one of them is
this defect — the control does not fit, the control fits but is not in view, the
control is in view and its ring is not. Then it walked past an OPEN `<dialog>`,
which renders in the TOP LAYER where nothing outside it clips it however the DOM
nests. Every dialog in that app sits inside the scroller, whose box is smaller
and elsewhere, so three more controls were measured against a box that was not
touching them.

**The general shape, and why it is worth carrying to the siblings.** Every
visual gate in this family asks *is it set*. A target-size check reads a rect: a
44px button clipped to 20px by an ancestor passes it. A contrast check reads two
colours: a foreground painted outside its clip box passes it. The property is
the input in each case, and the property survives the thing going missing.
**"Is it set" and "can it be seen" are different questions**, and until a gate
asks the second one it cannot answer it — which is the useful half of this, more
than the five pixels.
