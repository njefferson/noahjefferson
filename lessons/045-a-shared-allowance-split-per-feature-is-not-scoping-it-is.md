## 45 · A shared allowance split per feature is not scoping, it is a second consumer

**Enforced by:** GATE fauxplane:scripts/plant.mjs — the plant that keys the route feed's stand-off per endpoint; and GATE fauxplane:scripts/route.test.mjs — a test that drives the real handler and reads the key it wrote.

fauxplane asks adsb.lol for aircraft every ten seconds. A release added a second
endpoint on the SAME service for flight routes, and recorded its rate-limit
stand-off under `adsb.lol:route` rather than `adsb.lol`.

That reads like careful scoping. It is the opposite. **The limit is per IP
across their whole API**, so a per-endpoint cooldown is not a cooldown — and it
broke in both directions at once:

- a 429 earned by a ROUTE request never told the AIRCRAFT feed to back off, so
 the aircraft feed kept asking and kept being refused;
- an aircraft feed already standing off still got asked for routes, spending the
 allowance the stand-off existed to protect.

The helper's own docstring said . The
call site ignored it, and the docstring is not a gate.

**The symptom was reported as something else entirely, and that is the part
worth carrying.**e
touch handling was fine — tap-to-follow was driven under real touch emulation,
on three separate controls, and all three worked. What broke was the thing that
puts aircraft on the scope, and **an empty scope has nothing to tap.** The
report was accurate and the words pointed at the wrong layer. Reproduce the
SYMPTOM before believing the NOUN in the bug report.

**The rule: a rate limit belongs to whoever grants it, and the client's model of
it must have the same shape.** One provider, one allowance, one stand-off,
however many endpoints or features consume it. Where two consumers share a
limit, say which one loses — fauxplane's route request is now skipped entirely
while the aircraft feed is failing, because a route is a nicety and the aircraft
ARE the instrument.

**Smell:** a cooldown, quota, token bucket or backoff keyed on anything narrower than the thing that issues the refusal — per endpoint, per feature, per call site — when the issuer counts them together.

*(fauxplane 1.21.0 → 1.21.1, 2026-08-04.)*

---
