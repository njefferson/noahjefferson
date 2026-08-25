## 61 · A check that measures, mutates, captures and then samples is invalid on anything that re-renders on a timer

**Enforced by:** CHECKLIST sampler-vs-timer — when a pixel-sampling check reports a ratio of exactly 1.00:1, do not look at the colour. Look for something that moved between the measurement and the capture: a reflow, or a node the app replaced.

A contrast gate that reads real pixels cannot read them from a computed style —
a gradient page reports its background as transparent, and walking up the tree
falls through to a wrong fallback. So it does what fauxplane's does: read each
registered element's box, hide that element, screenshot, sample the pixel where
the box was, and compare against the element's own text colour.

**Every step of that assumes the page holds still.** It did not, twice, and both
times the symptom was a ratio of exactly **1.00:1** — a colour compared against
itself, which is what you get when the pixel sampled for the BACKDROP is the
element's own ink.

- **The first was a reflow.** `screenshot({fullPage: true})` grows the viewport
  to the document height to take the shot, so any layout depending on viewport
  height moves while it does. Coordinates read at 768px were sampled out of an
  image laid out at 1030px. Fixed by growing the viewport first, which makes the
  later capture a no-op.
- **The second was the app itself.** The measured element carried a countdown —
  `NO CONTACT · RETRY 14s` — so the panel rebuilt that row once a second. The
  gate hid a node, and by the time it screenshotted, the app had replaced it with
  an identical, VISIBLE one. Nothing was wrong with the colour, the element, the
  hiding, or the gate's arithmetic.

**The product fix was the right one and was worth having anyway.** The strip now
rebuilds only when the LIST of messages changes and writes text in place, which
also stops it dropping keyboard focus and re-announcing itself every second. A
component that replaces its own DOM on a timer is a problem for a screen reader
before it is a problem for a gate.

**The transferable rule: a measurement pipeline with steps between reading and
sampling is only as valid as the page's stillness across all of them.** Either
freeze the thing being measured, or measure something that does not move — and
when a sampler reports a foreground identical to its backdrop, that is almost
never a colour bug.

*(fauxplane, 2026-08-05.)*
