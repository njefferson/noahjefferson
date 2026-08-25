## 86 · A suite that passes unchanged when you delete the behaviour it guards was never guarding it

**Enforced by:** CHECKLIST — after any behavioural change, if no existing test failed, that is a FINDING and not a relief. Either the change is inert, or nothing was holding the behaviour. Prove which by reverting the change and watching something go red; if nothing does, write the test before shipping.

The central gate of an app was removed — the single predicate deciding whether a
captured item could ever be offered as work. It was the largest behavioural
change the app had ever had.

**The end-to-end walk passed unmodified.** Thirty-plus sections, hundreds of
assertions, green.

The instinct is to read that as confirmation the change was safe. It is the
opposite: **nothing in the walk was asserting the behaviour in either
direction.** The old rule was not tested, so the new rule was not tested either,
and a silent revert — a merge conflict resolved the wrong way, a stray
`return false` — would also have gone green.

Two tests in the unit suite did fail, which made it easy to believe the change
was covered. They were not covering the rule; they were covering neighbours of
it. One had bundled five unrelated exclusions into a single assertion, so it
would have gone green while any subset still held and could never say which had
moved.

**What the missing test then caught immediately, in its first run:** the item was
offered, but under the wrong reason and therefore at the wrong rank — it would
have sorted level with work the person had actually asked for. That was a real
defect in the change, invisible to every other check, found within seconds of a
gate existing.

**The general shape:** an unchanged green suite after a real change is a
measurement of the suite, not of the change. **Ask what went red. If the answer
is nothing, find out why before shipping** — and prefer one assertion per claim,
because a compound assertion is a gate that reports on the wrong thing.
