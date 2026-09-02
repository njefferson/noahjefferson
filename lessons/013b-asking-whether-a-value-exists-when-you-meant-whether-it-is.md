## 13b · Asking whether a value EXISTS when you meant whether it is GOOD

**Enforced by:** CHECKLIST quality-vs-existence — for any gate on a computed value, say whether it tests that the value EXISTS or that it is GOOD, and what the user sees if it never becomes true.

An attitude filter published nothing at all until a smoothed residual settled
under two degrees. On a real phone that residual sat at 14.8 and stayed there,
so the artificial horizon showed a red cross for as long as anyone cared to
watch — while the app knew its own attitude to a fraction of a degree the whole
time. Gravity alone gives pitch and roll exactly on a device sitting still;
what the gyro adds is steadiness THROUGH MOTION.

**Convergence was a QUALITY signal being used as an EXISTENCE gate.** Those are
different questions, and conflating them means a good reading is thrown away
because a refinement to it has not settled. The fix was to publish the reading
and carry the caveat as its `reason` — which is what a provenance system is
for, and it was already there.

The general form, worth checking wherever a "ready" flag guards a display:
**if the flag never becomes true, does the user see nothing, or something
honest?** A gate that can fail closed for ever is a gate that will.

*(fauxplane, 2026-08-02.)*
