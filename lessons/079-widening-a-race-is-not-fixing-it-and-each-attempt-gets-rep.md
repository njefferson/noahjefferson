## 79 · Widening a race is not fixing it, and each attempt gets reported as a fix

**Enforced by:** CHECKLIST race-or-window — a fix for a timing failure must remove the question being asked, not enlarge the time available to answer it. If the change reads as "now there is more time", it is not a fix.

One assertion failed in CI and passed locally: a first-run block whose visibility
depended on an async storage read. It took three attempts.

- **First:** stop the panel re-hiding the block on every open. Real, and it fixed
  a different flicker. Shipped and reported as the fix. **Still failed.**
- **Second:** ask the browser the question at boot instead of at open, on the
  reasoning that a person takes seconds to click through the walkthrough. True of
  a person; the automated walk clicks it in milliseconds. Shipped and reported as
  the fix. **Still failed.**
- **Third:** have the handoff say what it is. Somebody arriving from the
  walkthrough has not set storage up — that is what "first run" means — so the
  panel opens in first-run mode and the block is visible on the same tick, with
  no question asked at all. **Fixed.**

**The first two share a shape: they enlarge a window.** A promise cannot resolve
synchronously, so no head start makes it deterministic — it only moves the
failure to a slower machine, which is precisely where CI lives and the developer
does not.

**The reporting failure is as bad as the coding one.** Both attempts went out
described as fixed, to somebody who had no way to check. Two false all-clears on
one defect. When a timing fix ships, the honest sentence is either *"the question
is gone"* or *"this makes it less likely and I could not prove it"* — and the
second is not a fix, it is a mitigation, and should be called one.

---
