## 7f · A security claim is a liability until a test pins it

**Enforced by:** CHECKLIST security-claim — every security sentence in docs or comments names the test that pins it, or it is deleted.

**Three times in two days, a confident security sentence in this codebase was
wrong, and the OWNER caught each one — not a test, not a review.** The pattern is
specific enough to name: a comment or a piece of user-facing copy states a
guarantee that the code *nearly* provides, rounded up to the clean version.

The three, in order:
- True of the request
 BODY; false of the transport, which still exposes the sync id, IP, size and
 timing.
- The first clause is true and the conclusion is
 not: a `?text=` capture endpoint is exactly an injection leg, so the channel
 exists and needed padding to close.
- Padding blurs a
 size into a bucket, so it defeats the fine-grained oracle — but a bigger
 planner is still visibly bigger (more chunks, larger buckets), so "cannot tell
 how much" overstates it.

Each was found by an adversarial audit or by the owner reading the words, never
by the 600-plus passing tests — **because a prose claim has nothing asserting it.**
The code did roughly what the sentence said, so nothing failed; the gap was
between "roughly" and the absolute the sentence promised, and only a human
comparing the sentence to the threat model saw it.

**The rule that falls out: a security guarantee stated in a comment or in UI copy
is not done until a test pins the exact wording to the exact property.** Quietkeep
now does this — `test/seal.test.ts` asserts a wrong key and a matching-guess
produce identical sizes; `test/devices.test.ts` asserts the key-replacement copy
states the backlog window and does NOT claim an instant total cut-off;
`test/security.test.ts` greps the security page for procedural leakage AND for
each overclaimed absolute. A claim with a test behind it is a guarantee; a claim
without one is a hope with good grammar.

**Corollary on who to trust.** The model wrote all three wrong sentences and was
confident in each. The owner, reading them against an understanding of what the
system actually does, was right every time. When a non-expert's read of a claim
does not match their own understanding of the system, that is not a knowledge
gap to reassure away — it is the most reliable detector in the room, and the
correct response is an adversarial re-audit that treats the model's own prior
claims as the prime suspects.

*(Quietkeep, 2026-07-30 — pre-promote audit, 13-agent adversarial pass. The
crypto, cross-household isolation, replay integrity and XSS posture were attacked
and HELD; every finding that survived verification was an honesty overclaim or a
copy correction, not an exploit. The hold-to-promote was for the words, not the
walls.)*
