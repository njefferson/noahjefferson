## 38 · Fixing one check can blunt another, and the plants you re-run are the ones you suspect

**Enforced by:** GATE fauxplane:scripts/plant.mjs — run WHOLE. Also the ordering rule it produced: in fauxplane's page sweep the pixel checks run before `checkContrast`, because that pass perturbs the page.

Straight after the sampler fix in §37, four contrast and target plants were
re-run individually — on the explicit reasoning that a fix to an instrument can
quietly blunt it. All four still went red about their own thing.

**They were the wrong four.** The full sweep came back **44/45**, with the
magenta canvas sentinel UNPROVEN: the gate stayed GREEN with its fault planted.

The mechanism is worth stating because nothing about it is guessable. Growing
the viewport fires a `resize`; the app re-reads its canvas colour tokens on one;
and re-reading them HEALS the exact fault that sentinel exists to catch — a
token read taken while the page was hidden and cached as magenta. `checkContrast`
ran before the sentinel in the page loop, so the sentinel was inspecting a page
another check had already repaired. Nothing was wrong in the app.

**The fix is ORDERING, not un-doing the perturbation.** That pass expands scroll
containers, demotes modals, hides text and now resizes the viewport. Any of
those could heal something, and an exemption list would go stale on the next
step added. So: measure what the app produced, then mutate it. Pixel checks
first, contrast last.

**The general shape: a targeted re-run tests the plants you SUSPECT, and that is
reasoning — which is precisely what a fault-injection harness exists to
replace.** The instinct to re-run "the related ones" is the same instinct that
writes a check nobody has watched fail. Run the sweep whole; it is slow, and it
is slow in the way a smoke alarm is annoying.

*(fauxplane, 2026-08-03.)*

---
