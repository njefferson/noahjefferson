## 35 · The facts that prove a manual step impossible are usually already in your own notes

**Enforced by:** CHECKLIST — before handing over any manual step, name the
surface it needs and confirm the RELEASE THAT SHIPPED IT is on the branch the
person will be standing on. `handoff-check.mjs --ack=manual-steps` asserts this
was done; it cannot check it, which is exactly how it was asserted falsely.

A session spent a day establishing two facts and wrote both into
`docs/verifications.md` itself: production is 1.17.4, and the diagnostic surface
shipped in 1.18.0, which is still on staging. It then closed its report by asking
the owner to open production and send a diagnostic. The reply pointed out the
obvious: production could not possibly have the surface being asked about.

One `git ls-tree -r origin/main` would have settled it — `origin/main` carries no
diagnostic source at all, and its only `caches.keys` is the eviction sweep
inside `sw.js`, which no page can read. The check cost seconds and was not run.

**The failure is not missing information. It is not re-reading your own output.**
That is a different and more embarrassing shape than the usual §6 goose chase,
because there is nothing to go and find out — the disproof is already written
down, in the file being edited, by the session doing the asking. A fact you
established an hour ago stops feeling like a claim and starts feeling like
background, and background does not get checked against the next sentence.

**And it survived the gate that exists to stop it.** That session ran
`handoff-check.mjs --ack=...,manual-steps`, whose text reads "Every manual step
I hand over I have either verified end to end, or I have said plainly why I
could not." It said so and it was not true. The gate's own documentation warns that an
`--ack` is an assertion that can be made falsely; this is what that looks like in
practice, and it is the argument for keeping the ack list SHORT enough that each
line is still read as a question rather than a formality.

**The useful half.** Once the step was checked properly, the row got better
rather than worse: the production half of that verification is not waiting on
the owner at all, it is blocked on the promote and unblocks itself the moment the
release carrying the instrument reaches production. A step you cannot perform is
often a step nobody can perform yet, and saying which turns a request into a
sequencing fact.

*(Quietkeep, 2026-08-03.)*

---
