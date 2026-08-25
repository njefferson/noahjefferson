## 42 · A gate on the decision function cannot see the path that never asks it

**Enforced by:** CHECKLIST gate-covers-every-path — when a rule is enforced by a
predicate, grep for every code path that can produce the same outcome WITHOUT
calling it. Each one is an unguarded entrance. Where the surface is a real
runtime behaviour, drive it end to end rather than asserting the predicate.

Doctrine §7h.3 says a newcomer is never told an app has an update. Quietkeep
gated it at the top of `updateIsReady`, and `test/update.test.ts` asserted it
there — with a test written specifically for that clause, which passed on every
run including the ones that shipped the defect.

**A brand-new visitor was told a new version was ready, thirty seconds into
their first-ever visit.** It reached production.

`controllerchange` never calls `updateIsReady`. The service worker's `activate`
calls `clients.claim`, which hands a first-ever visitor its first controller
and fires `controllerchange` exactly like any genuine swap; that handler called
`show` directly. The gate was real, the test was right, and **neither was on
the path that needed them**.

**The shape, and it is general.** When a rule lives in a predicate, the predicate
is only as good as the set of callers. Any other route to the same user-visible
outcome is an unguarded entrance, and it is invisible to every test written
against the predicate — those tests keep passing, which is worse than having no
test, because the green reads as coverage (§4's own history).

**How it was actually found: by driving the real thing.** Doctrine §7h says test
a stale app "with a REAL second worker, not a mocked registration… a mock proves
the mock works." A walk that serves a genuinely different `sw.js` and lets the
browser's own update machinery run found this on its FIRST execution, on a
genuinely fresh browser profile — a state no unit test had, because "nothing has
ever controlled this page" is not a value you pass to a function, it is a
condition of the world.

**Smell:** a test named after a clause of the rule, passing, while the behaviour
the clause describes has never been observed. Ask what else can reach that
outcome, and whether anything has ever watched it happen.

*(Quietkeep 1.18.1 → 1.18.2, 2026-08-04.)*

---
