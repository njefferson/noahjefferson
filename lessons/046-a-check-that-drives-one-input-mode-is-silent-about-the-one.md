## 46 · A check that drives one input mode is silent about the one your reader has

**Enforced by:** GATE fauxplane:scripts/a11y-gate.mjs — `checkRadarTap` runs under both mouse and touch, and the label says which.

fauxplane's accessibility gate had a check built precisely because an
interaction defect had shipped: `hitTestAircraft` was used and never imported,
so every tap on the radar threw, for seven releases, while the gate asserted
"no console errors" and had never CLICKED anything.

The check that fixed it used `page.mouse.click`. **The device this app exists
for is an iPad. It has no mouse.**

Nothing was broken by that, this time — but for as long as the check existed it
could only ever have proven the path the reader does not use. A mouse click and
a touch tap are different event sequences, and the gap was invisible because the
check was green and specific and *about the right feature*.

It runs both modes now, labelled `radar-tap/mouse` and `radar-tap/touch`, so a
failure names which one.

**The general shape: an emulated interaction is a claim about ONE input path,
and green says nothing about the others.** The same applies to keyboard versus
pointer, to portrait versus landscape, and to hover-dependent affordances (see
§43 — a `title` attribute, which no touch device can reach). When a check drives
an input, ask which input the READER has, and whether anything drives that one.

*(fauxplane 1.21.1, 2026-08-04.)*

---
