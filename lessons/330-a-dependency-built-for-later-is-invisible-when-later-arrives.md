## 330 · A capability built as a dependency of a LATER one is invisible when that later one arrives, so it gets built twice

**Enforced by:** GATE Jefferson-Photography-Studio:tools/decisions-check.mjs

The top-ranked open record must carry `## Built already` — what EXISTS that
this item will use — and every path it names must exist on disk. Required of
the item at the TOP of the queue, which is the one about to be worked, so it is
a step before starting rather than a backfill across every open record. Any
record carrying the section has its paths checked, top of the queue or not.

**The owner named this gap, 2026-09-19:** *the dependencies were built for a
later capability, then forgotten — so when the capability was reached, the
session thought it had to start over.*

## Why the neighbouring lesson does not cover it

§329 says read the record before touching the thing it is about. That catches a
session ignoring what is written down about ITS item. **This is different and
worse: the thing that already exists was built for a DIFFERENT item, so the
record in front of you has no reason to mention it.** Reading your own record
more carefully will never surface it. Nothing points from "the question I have
now" back to "the instrument somebody built two items ago for another reason".

## What it cost, the day it was named

An item needed the sky mask's EDGE measured — how abruptly the mask falls at a
boundary. The session tried the obvious statistic (edge coverage), got nothing,
differenced two renders to prove the change was real at all, and then built a
sharpness instrument from scratch.

**That instrument already existed.** A probe had been written for an earlier
item to measure exactly this edge, and the research file cites its control
reading — *"a 25 px ramp across a hard edge comes back 4 px wide"* — as
evidence. It was never promoted out of a session scratchpad, so it appears in
the prose as a name and nowhere as a file. Two instruments now answer one
question, and only one of them can be re-run.

**The same day, the same shape went the other way and was only caught by
luck.** The guided filter the item needed had been built for a different
feature entirely; the session found it only because that item's record happened
to name it. Nothing structural made that happen.

## The rule

**Before starting an item, inventory what is already built for it — and when
you build something a later item will need, say so where that later item will
look.** The inventory is the record's `## Built already` section: modules,
tools, walks, and the constraints they carry.

Two properties make it work rather than decorate:

- **It names PATHS and the paths are verified.** A citation pointing at nothing
  is precisely how the second instrument gets written — the prose says a thing
  exists, nobody can find it, and rebuilding looks like the only option. This
  gate caught its own author on its first run, refusing a scratch probe cited
  as though it were in the repo.
- **It is demanded at the TOP of the queue only.** A rule that requires
  nineteen backfills gets switched off. A rule that asks one question of the
  one item about to be started is answered.

**And the corollary, which is the half a gate cannot enforce:** a scratch
harness that produced a number a record CITES is no longer scratch. Promote it
into `tools/` or stop citing it, because a cited instrument nobody can run is
an invitation to write a second one.

## Neighbours

**§329** (read the record before you touch the thing it is about) is the
adjacent failure with a different cause — there the answer was in your own
record; here it was never in it. **§319** (every instrument built after a
diagnosis measures the diagnosis) is what a redundant second instrument tends
to become. **§243** (two lists for one idea and neither was right) is the same
duplication one level down.
