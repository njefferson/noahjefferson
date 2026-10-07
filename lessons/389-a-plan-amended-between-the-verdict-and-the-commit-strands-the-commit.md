## 389 · A plan amended between its scope-verdict step and its commit step strands the commit, because the verdict carries the old hash and the scope step cannot be sent again under its number

**Enforced by:** CHECKLIST amend-gives-the-scope-step-a-new-number — when a plan is amended after its scope-verdict step has handed back DONE and before its commit step has, the amendment gives the scope step a number that was never sent and puts that number in Order ahead of the commit step, so a verdict is minted again against the plan's new hash

**Recorded 2026-10-07.** The scope check compares two hashes, the plan's and the diff's, and a verdict carries both. An amendment changes the plan file, so the plan's hash moves, and a verdict minted before it was minted for a plan that no longer exists. The scope check refuses the commit that rests on it, which is correct.

**Why the plan could not be repaired from inside.** The dispatch gate passes only the step the pointer names, the first step in Order with no DONE hand-back, and the plan's Standing steps. The scope step already has a DONE hand-back, so the pointer has passed it and the gate will not send it again under its number. The step the pointer names is the commit, and the commit is the step the stale verdict refuses.

**Measured on 2026-10-06.** A commit step was refused by the scope check after the plan's hash had moved between the verdict and the commit.

**What the amendment does.** The pointer's identity for a step is its number, so a verdict that has to be minted again is a different step and takes a number with no hand-back under it. It goes into Order before the commit step, and the pointer then reaches it first. Its hand-back is the first DONE under that number, the verdict it records carries the plan's current hash, and the commit step is sent next.

**What a script cannot do for it.** Nothing in the pointer knows that one step replaces another, and a check that tried would have to read the plan's prose to find out. The checklist item is read at the moment of amending. The scope check's refusal at the commit is what finds a missed one, after the verdict step's number has already been spent.
