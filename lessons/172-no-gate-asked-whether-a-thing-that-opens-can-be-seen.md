## 172 · Every gate agreed the label was there, visible and correctly styled, and on a phone it opened outside the frame

**Enforced by:** CHECKLIST opened-things-are-measured — for anything that
appears on demand — a map label, a menu, a popover, a toast — assert its
rectangle against the rectangle of whatever clips it, from the position where
it has least room, on the narrowest supported screen. · JUDGEMENT — "is it
visible" is a question about computed style; "can it be seen" is a question
about geometry, and only the second one is what a reader experiences.

**Smell:** a control that opens something, and a test suite whose strongest
assertion about it is that the element exists or that axe found no violation.

Thalweg drew every map label as a Leaflet tooltip. A tooltip is placed beside
its marker and left there: it is not panned into view, and `direction:'auto'`
only chooses left or right, never up or down. So a pin near the top of the map
opened its label ABOVE the top of the map, where the container's overflow
removed it. **Tapping the pin appeared to do nothing at all.**

On a phone the map is under half a screen tall, so most pins are near an edge.
Reproduced at 390 by 844: a marker eight pixels below the top of the map,
tapped, produced a label whose top edge was eight pixels above the map's.

**Everything green.** axe-core found nothing, in every panel state, on desktop
and phone. The element was in the DOM. `getComputedStyle` said
`visibility: visible`, `display: block`, `opacity: 1` — because all of that was
true. It was a correctly rendered, fully styled, entirely accessible label,
positioned outside the box that shows it.

The fix is a popup rather than a tooltip, which pans the map until the whole
label fits. That part is a Leaflet fact and it is written in that app's NOTES.

**The part worth carrying: none of the gates were asking the right question.**
They asked whether the label existed, whether it was styled, and whether it
passed an audit. None asked *where it was*. A gate that measures the rectangle
of the thing against the rectangle of its container would have caught this on
the first run, and the same gate catches a dropdown that opens off the bottom
of a panel, a toast under a keyboard, and a tooltip clipped by an
`overflow: hidden` ancestor.

**It was found by somebody using the app**, on the first day, on the first
screen anyone would tap. The cost was not the fix, which took minutes; it was
that a first release went out with its principal interaction broken on the
device the app is for. §158 is the same family — a stylesheet block that never
landed, passing every check because none of them asked where the words were.
Existence and appearance are cheap to assert and are not what a reader gets.
