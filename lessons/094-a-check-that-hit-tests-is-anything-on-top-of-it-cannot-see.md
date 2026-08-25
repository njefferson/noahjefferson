## 94 · A check that hit-tests "is anything on top of it" cannot see a TRANSPARENT control, and a ratchet applied to a value that rotates will eat the product's copy

**Enforced by:** GATE quietkeep:tools/smoke.mjs — the way-out check measures the scroller's and the button's RECTANGLES on every surface that has one, and asserts the button is not transparent. **CHECKLIST budget-vs-copy** (§62) extended: before raising or trimming to a size budget, ask whether the quantity it bounds ACCUMULATES or ROTATES.

Two defects reported from one device, in one message. Both had been shipping for
as long as the surfaces existed, and the second is the more general lesson.

**The way out was see-through.** The scrolling body carried `margin-bottom:
-1.25rem`, which pulls the painted box 20px past where layout puts it, while the
Close sits 0.9rem below — leaving a band of whatever had been scrolled to painted
underneath the button. The button is `background: transparent`, so it read
straight through.

**The existing check could not see it, and looked like it should.** It scrolled
each surface to the end and asked whether the Close was on screen and whether
anything sat on top of it — `elementFromPoint` at the button's centre. **A
transparent button IS the topmost element there.** The hit test returns the
button and passes. *Something is over it* and *you can see through it* are
different questions and only the first had ever been asked, on six surfaces.

Measure rectangles, and measure the computed background. Both are two lines.

**Then the size gate failed, and the reason it failed is the transferable part.**
The aggregate budget is a deliberate ratchet against sprawl — the panel had once
grown to five thousand words. But the number it bounds includes the CURRENT
release's patch notes, and those **rotate**: the newest release is shown, the
previous one folds away. A ratchet fires on the upswing and locks in the
downswing, so applied to an oscillating value it can only travel one way —
downward, into copy that Doctrine §7d requires.

Measured: the aggregate had **98px of headroom** and an ordinary four-bullet
release note costs **390px**. No release could pass. That is §62's situation to
the pixel, one repo and one gate later.

**The cure is not a bigger number.** It is to ask what the budget is bounding.
Standing prose accumulates and deserves a ratchet; this release's news does not
and deserves its own bound. Splitting them made the ratchet fall from 11,292 to
10,243 against 11,000 — comfortably inside, and now measuring the thing it was
written for.

**Two of my own errors inside the fix, both worth the shape:**

- The new budget was set from a number measured for a DIFFERENT purpose — the
  *delta* between two releases' notes (390px), not the height of the block
  (1,049px). The gate then failed by six pixels. A number reused without
  re-reading what it counted is the same defect as a stale document.
- Copy WAS cut in the end — two bullets — but for §5, not for the budget: they
  were about the test suite rather than about the app. Cutting for the right
  reason and cutting for a budget look identical in the diff, so the reason
  belongs in the commit.
