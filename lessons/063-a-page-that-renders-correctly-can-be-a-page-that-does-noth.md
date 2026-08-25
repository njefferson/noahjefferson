## 63 · A page that RENDERS correctly can be a page that DOES nothing, and no rendering check will tell you

**Enforced by:** CHECKLIST press-the-thing — for every control a reader can operate, the gate must press it and assert the STATE CHANGED. "It is legible, it is named, it is 44px and axe is happy" is four statements about a control that may be wired to nothing.

fauxplane's MAP page shipped with a full-screen canvas of aircraft symbols and
**no click handler at all**. It looked exactly like the RADAR page's tappable
scope, which had been tappable for twenty-eight releases. The owner reported it
from an iPad with 275 aircraft on screen: tapping does nothing.

**Every check passed, and every one of them was right.** The contrast registry
measured real pixels. The accessible names were distinct and contained their
visible text. Touch targets cleared 44px. axe was clean across three viewports
and two palettes. Not one of them asks whether pressing a thing does anything,
because rendering and behaviour are different properties and a gate built out of
rendering assertions is structurally blind to the second.

**The near-miss is worse than the miss.** A first attempt at the check tested the
follow banner's text for `/following/i` — and the banner carries the word
FOLLOWING as a **static badge label**, present in the markup whether or not
anything is being followed. So the check passed against a page with no handler,
which is the exact defect it was written to catch. Two plants sat GREEN and the
sweep said `<-- the check does not work`. That is §29 again: a substring
satisfiable by coincidence reports coverage it does not have. The assertion now
names the CALLSIGN of the aircraft the renderer said it tapped, which nothing
else can produce.

**And the geometry has to be shared, not re-derived.** The hit test computed its
own centre — the middle of the box, which is what anyone writes. That is correct
for a centred scope and wrong for a track-up one, where own ship sits near the
bottom, so a re-derived hit test passes on the easy mode and misses on the other.
One `planGeometry` for the renderer and the hit test; the check presses in BOTH
modes so the easy one cannot carry it.

**Smell:** any interactive element whose gate coverage is entirely adjectives —
legible, named, large enough, valid. Ask what STATE it changes and whether
anything asserts the change. Anything a reader can press, press.

*(fauxplane 1.33.0 → 1.35.0, 2026-08-05.)*

---
