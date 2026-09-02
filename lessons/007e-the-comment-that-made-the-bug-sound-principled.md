## 7e · The comment that made the bug sound principled

**Enforced by:** JUDGEMENT

**Smell:** a comment that ARGUES for the design rather than describing it. A rationale is a claim; check the claim, not the prose.

**A comment stating a rationale is a claim, and an unverified one costs more
than no comment at all — because it stops the next reader checking.** Quietkeep's
sync driver ran every arriving event back through the app's write boundary, under
a comment reading That sentence is why the design survived
several passes: it sounds like the careful choice, and each reader in turn
declined to re-examine something already argued.

It was wrong, and the repo already contained the right answer — the import
button's "take in what I don't have" had solved the identical problem correctly
months earlier. **Another device's log is already-gated history**: the boundary
ran on the device that wrote it, and its repairs are in the log beside the
events that needed them. Re-running the boundary on history

- writes a SECOND repair carrying the same derived id as the one already there —
 not rejected, just written, and then refused by the store's unique index at the
 append, so the failure surfaces a layer away from its cause;
- refuses the same shard delivered twice, as a creation landing on a node that
 already exists, which is the ordinary case for anyone using two devices;
- refuses anything whose subject is still in the next chunk — a re-parenting, a
 dependency, a rename — which over a wire is not an error but a Tuesday.

Three lessons, in increasing order of how much time they save.

**Search for prior art by the SHAPE of the problem, not by its vocabulary.** The
correct implementation was not found by reading about "sync"; it was found by
asking who else in the codebase takes in events this device did not write. Two
features can be the same operation arriving by different roads — a file on a
memory stick and a chunk from a relay are both another device's shard — and the
second one written should share the first one's code, not re-derive it worse.

**Verify the failure before you write down the reason for it.** The first draft
of the fix carried its own confident rationale: that the boundary refuses a
creation naming an absent parent. It does not — it repairs it. Every reason above
is now asserted against the real boundary in the test file *before* the test
asserts the fix survives it, so the argument cannot quietly stop being about
anything. Writing "prove it breaks first" as an assertion, not a belief, is what
caught it.

**A hook every caller passes the identity function to is a lie in the type
signature.** The parameter's own docstring claimed it ran the gate while every
call site passed `events => [...events]`. Deleting it was the fix; keeping it
"for flexibility" would have preserved the false claim in the one place a reader
is most likely to trust it.

*(Quietkeep, 2026-07-30. The same commit fixed a second defect of the same
family: identity on the wire was keyed by `device#seq`, but a gate-written repair
deliberately carries its cause's device AND seq so replays stay deterministic —
so the key identified a PAIR, not an event, and silently dropped half of every
capture that crossed. Two tests, red before the fix. Both defects were invisible
to a green tree of 567 passing tests, because nothing had ever run the real data
shape through the real path.)*
