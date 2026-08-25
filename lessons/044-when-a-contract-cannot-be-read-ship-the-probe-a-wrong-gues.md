## 44 · When a contract cannot be read, ship the probe — a wrong guess that reports itself beats a fourth screenshot

**Enforced by:** JUDGEMENT. The surface it needs is gated: Doctrine §7f requires a text diagnostic in every app, and fauxplane's carries the probe block.

**Smell:** a session about to ask the owner for another screenshot, capture or paste of a document already sent — or about to park a feature as blocked — when the missing fact is one a device on hand could report and yours cannot reach.

fauxplane needed `POST /api/0/routeset` from adsb.lol. Their OpenAPI page names
the request schemas `PlaneList` and `PlaneInstance` and does not expand them in
either capture the owner sent, and the sandbox cannot reach `api.adsb.lol` at all.
Three options:

- Ask for a **fourth screenshot** of a page already screenshotted twice, hoping
 the schema expanded this time.
- **Wait**, and ship nothing.
- **Send the best-reasoned shape and report exactly what came back.**

The third shipped, and it is the one to reach for. The Function sends the shape
the endpoint's lineage uses, and the diagnostics report gained a block carrying
the HTTP status, the top-level keys, the per-entry keys and the **validation
detail**. The endpoint is FastAPI: a body it rejects comes back as a 422 whose
`detail` array names the offending field with `loc`, `msg` and `type`. So the
report says `REJECTED at: body.planes.0.lat says: field required`, and the next
release is a CORRECTION rather than another guess.

**What makes this honest rather than reckless is the failure mode.** A wrong
guess renders as "route unavailable" and never as an invented route — the
no-synthetic-data rule is what allows the guess to be shipped at all. A probe
whose failure mode is a plausible wrong answer is not a probe, it is a bug with
telemetry.

**Two preconditions, and without them this is just guessing:** the app must
already have a §7f text diagnostic the owner can send back, and the release
notes must SAY the feature may not work and why — fauxplane 1.21.0's `broken`
list leads with it, and NOTES tells the next session the shape is unconfirmed.
Shipping a hypothesis silently is how a repo acquires a mystery.

**The general shape: when the blocker is a fact only a device on hand can
observe, build the thing that observes it instead of asking a person to be the
instrument.** The same method settled fauxplane's Mode S crew readouts, built
from published field names without a single real response ever seen. Asking for
one more screenshot is asking a person to do a machine's job, and it was already
established (§36) that the owner had sent the answer once.

*(fauxplane 1.21.0, 2026-08-04.)*
---
