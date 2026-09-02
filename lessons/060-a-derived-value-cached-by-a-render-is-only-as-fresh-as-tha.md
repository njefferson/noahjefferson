## 60 · A derived value CACHED by a render is only as fresh as that render, and a page that does not render it reads whatever was left behind

**Enforced by:** JUDGEMENT — no gate can see it, because the stale value is a perfectly ordinary variable holding a perfectly ordinary object. **Smell:** any `let x = …` assigned inside a `render()`, `draw()` or `update()` and read from outside it. If two surfaces read it and only one writes it, it is already wrong on the other.

fauxplane 1.29.1 added a feed-state flag to the navigation display beside the
horizon, for a stated reason: the same scope, drawn from the same data, said
`NO CONTACT · RETRY 6s` on the RADAR page and was completely silent on the PFD.
A reader on the PFD saw an empty scope and could not tell a quiet sky from a
feed being refused.

**It did not work, and it did not work in exactly the way it was written to
fix.** The flag read `radar.readiness`, a variable assigned inside
`radar.render(snapshot)` — and `render` runs only while RADAR is the visible
page. On the PFD it held whatever RADAR had last left there, and on a fresh load
it held `{ tappable: false }` with no state in it at all. **So the flag was silent
about a refused feed until the reader visited the other page**, which is the
defect, restored by where the value lived rather than by what it computed.

**Nothing about the code looked wrong.** The computation was correct, the
function it called was pure and well tested, the flag rendered, and the RADAR
page — where anyone would check — was right. It was found four releases later
by an unrelated check that asked for the traffic state on a page RADAR had
never rendered.

**The fix is a getter that computes**, so the chip, the tap handler, the flag and
the alerting strip are four READERS of one fact rather than four copies of it.
That is what the function's own header had claimed since it was written: "ONE
computation, read by the chip and by the tap." It was one computation; it was
also one cache, on one page.

**The general shape: a render function is a place, and a cache inside one is
scoped to that place whether or not anybody said so.** Deriving on demand costs
a few microseconds and cannot go stale. Cache only what is measurably expensive,
and when you do, cache it where every reader can see the same one.

*(fauxplane 1.29.1 → 1.31.0, 2026-08-05.)*

---
