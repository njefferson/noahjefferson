## 62 · A height budget that costs the product a sentence every time it binds is measuring a state nobody reads in

**Enforced by:** CHECKLIST budget-vs-copy — when a size gate fails and the first fix that comes to mind is deleting product copy, stop and measure the HEADROOM the gate left before this change. If the answer is a fraction of one feature, the gate is the defect.

Quietkeep's (i) panel is asserted at two sizes: the panel a reader actually
meets, folded, on a 390px phone; and a worst case with all four groups forced
open. The worst case was bounded at 9,000px.

At 1.21.0 it measured **8,907**. Ninety-three pixels of headroom — for every
future release of the app, for ever. A feature that adds a heading, a paragraph,
two buttons, a status line and a caveat cannot fit in 93px, and 1.22.0 arrived
at 9,275.

**What happened next is the lesson.** Five patch-note bullets became three.
Three became shorter. The panel's own explanatory prose was cut twice. Each edit
was rerun against the gate: 9,275 → 9,102 → 9,033 → 9,033 → 9,003. Three pixels
short, with the product's honesty measurably worse and the next release facing
the identical squeeze from a worse starting point.

**The tell was in the file the whole time.** Forty lines below the failing
assertion sits a comment reading, in the repo's own words, that conflating the
expanded worst case with the reading experience *"sent two releases' notes to be
shortened for a budget nobody was near"*, with an ADR recording the correction.
This was the third time. The check that protects the reader — the folded phone
panel, bounded at 3,600 — measured **2,321** throughout: never remotely close.

**Why prose-trimming felt like progress and was not.** Removing whole blocks
moved the number (~85px per bullet); removing words inside a block moved it by
zero, because the paragraph still wrapped to the same line count. Two rounds of
sentence-level cuts bought nothing at all and were kept anyway, because the
number had gone down at some point and the edits were in the same direction.

**The fix is to bound the thing the gate exists to catch.** The real defect was
a panel that rendered every release inline at 17,000–25,000px, putting the way
out far from a thumb. The bound moved to 12,000 — still catching that outright,
proved by planting it (every release inline measured **52,707**) — and the tight
budget stays where a reader actually is.

**Smell:** a gate whose failure is fixed by editing user-visible words rather
than structure. Copy is not slack, and treating it as slack means the honest
sentence — the one saying what is still broken — is always the cheapest thing in
the room to cut.

*(Quietkeep 1.22.0, 2026-08-05.)*

---

---
