## 7d · Green is not a synonym for correct

**Enforced by:** CHECKLIST adversarial-pass — before a boundary widens, run reviewers told to REFUTE one invariant each and write the repro, not the risk.

**A fully green tree is where the worst defects hide, not where they are
absent.** Quietkeep had 18 passing tests, a green CI pipeline with a
type-check, a headless walk of the built app, an accessibility gate, a
contrast gate and a changelog gate — every one passing — and a documentation
set that read as thorough. Five adversarial reviewers, each told to *refute*
one specific claim rather than confirm it, found roughly **35 real code
defects** (including the core event-fold mutating its own base state, so a
rejected write corrupted memory; the no-silent-nodes invariant defeatable
five different ways; and a service worker serving a 503 error page over the
cached app) and **22 false or stale documentation claims** (gates described
in the present tense that did not exist — the same shape as a fake CI gate
found earlier the same day). Nothing here was exotic; all of it was reachable
by ordinary use.

Why the green tree hid it: **tests written by the author encode the author's
model, and the author's model is exactly where the bug lives.** The property
test for "no silent nodes" folded events one at a time — the same wrong mental
model as the gate it was testing — so both agreed, and both were wrong. A test
suite proves the code does what its author expected; it cannot prove the
expectation was right.

The move that worked, and is worth repeating on anything load-bearing before
it ships: **spawn independent reviewers, give each ONE invariant, and tell
them to break it — write the repro, not describe the risk.** Adversarial
framing ("refute this") finds what confirmatory framing ("check this") cannot,
because the second is satisfied by the first passing example and the first is
not satisfied until it has genuinely failed to break the claim. Cost was real
(five agents, deep work) and it was cheap against shipping any one of the
severe findings to the person the app is for.

Corollary, learned the same run: **do the audit at the right moment.** It was
gated to run after the write-path was built and *before* the first public
input surface (a URL capture endpoint) shipped — so the fixes landed on the
last safe tree rather than being retrofitted under a live attack surface. An
audit is worth most just before a boundary widens, not after.

*(Quietkeep, 2026-07-28 — every finding reproduced with a runnable script
before it was believed, and pinned with a regression test before it was
called fixed.)*
