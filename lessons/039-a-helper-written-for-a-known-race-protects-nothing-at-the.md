## 39 · A helper written for a known race protects nothing at the call site that skips it

> **Renumbered from 26 on 2026-08-04.** It shared that number with , which DOCTRINE.md, CLAUDE.md,
> `handoff-check.mjs` and `doctrine-sync.mjs` all cite as §26 — so that one kept
> it and this one moved. Nothing cited this lesson by number; its checklist id
> `helper-call-sites` is unchanged and was always the stabler reference.

**Enforced by:** CHECKLIST helper-call-sites — when a helper's docstring describes a failure MODE rather than a convenience, grep for bare calls of the primitive it wraps; every one is a live instance of that failure waiting on timing.

**A helper written for a known race protects nothing at the call site that does
not use it.** Quietkeep's headless walk has a `fillSearch` helper whose own
comment names the failure it exists for: . A section added two
releases later filled the same input with a bare `fill`, immediately after
closing a dialog. The search box kept the previous query, the row the walk was
waiting for never appeared, and it timed out — intermittently, so three CI runs
had already gone green over it.

The race is not fixed by the helper existing; it is fixed per call. When a
helper's docstring describes a failure MODE rather than a convenience, every
bare call of the underlying primitive is a live instance of that failure waiting
on timing — worth grepping for the moment such a helper is written.

Two riders:

- **Instrument before theorising.** The obvious story was "the search predicate
 now excludes this kind" — plausible, wrong, and it would have sent the fix
 into the app instead of the test walk. Dumping the input's actual value on
 failure answered it in one run: it read the PREVIOUS query. One printed fact
 beat three good hypotheses.
- **A green run over a race is one sample, not evidence the race is absent.**
 This passed CI for three releases. The check was not made stronger by passing;
 it was made stronger by being made to fail reproducibly and then fixed — the
 same discipline as the planted-fault rule above.

*(Quietkeep 1.17.4, 2026-08-03.)*

---
