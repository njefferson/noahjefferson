## 51 · "Run the whole suite" is a rule about the MEASURING INSTRUMENT, not about every change

**Enforced by:** GATE fauxplane:scripts/plant.mjs — `--changed=<ref>` selects plants from git rather than from judgement, escalates to the whole sweep on any file that can blunt an unrelated plant, and PRINTS what it did not run.

The arithmetic is the interesting part. Measured on fauxplane:

- the unit suite — **1.2 s** for all 366 tests
- the palette gate — **0.2 s**
- the docs gate — **0.2 s**
- the accessibility gate — a few minutes
- **the plant sweep — ~45 minutes**, of which 24 browser-driven plants are ~95%

So "re-running everything" was almost entirely one thing. Four whole sweeps ran
in a day; two were justified and two spent forty minutes each proving that a
plant about a build stamp's contrast still worked after an edit to a countdown.

**The justification was a real lesson, applied too widely.** §38 says a targeted
re-run tests the plants you SUSPECT — which is the reasoning a fault-injection
harness exists to replace — and concludes "run the sweep whole". That is
correct, and it came from a case where **the gate itself changed**: fixing a
contrast sampler silently blunted a canvas sentinel, four targeted re-runs came
back green, and only the whole sweep found 44/45.

**The refinement is knowing when that argument applies: when the thing doing the
measuring moves, not when a leaf module does.** A change to a renderer, a store,
a shared stylesheet or a gate can blunt a check that never names it. A change to
one feed parser cannot.

**What makes a selective run safe is that it is MECHANICAL.** Choosing "the
related ones" by hand is the exact habit §38 warns against. So the selector asks
git which files moved, maps them to the plants that target them, and escalates
to everything on a deliberately generous list — the gates, the store, the
provenance core, the renderers, the global stylesheet, the root document.

**And it says what it skipped.** A partial run that closes with the same line as
a full one is a silent cap, and reads as "everything is covered" when it is not.

**Two honest limits, stated because a tool's blind spot belongs next to the
tool.** The harness file is itself on the escalation list, so any release that
adds a plant still sweeps whole until the plant DATA is split from the harness
CODE. And a promote is not the place to economise: before shipping to
production the sweep runs whole regardless, because that is the one moment the
cost is obviously worth it.

**Smell:** a verification step whose runtime is dominated by one component, re-run in full after a change that provably cannot reach that component — and a session defending it with a rule written about a different situation.

*(fauxplane, 2026-08-04. The numbers are fauxplane's; the shape is not.)*

---
