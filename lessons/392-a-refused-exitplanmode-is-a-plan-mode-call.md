## 392 · A refused ExitPlanMode is itself a plan-mode call, so each refusal needs a fresh talk-through turn before the next call

**Enforced by:** JUDGEMENT — after a refusal of `ExitPlanMode`, do not call it again until a new turn of plain talk that asks nothing has been written after anything the refusal sent the session to change, and the owner has written after that turn; the refusal is a call and the next call is judged as a new one

**Smell:** `ExitPlanMode` called a second time in the same turn as its refusal, or in the turn straight after it, with no turn of talk between; a plan edited to answer a refusal and put up again at once.

**Recorded 2026-10-07.** The plan gate judges a turn of talk that asked nothing, ended before the owner's newest message, and was written after the plan file's last write (LESSONS §370, §388). A refusal of the call is not an answer to the plan, and the gate does not count it as one, so the plan-mode anchor does not move. It is a refusal of the main thread all the same, and a refusal on the main thread latches until the owner next writes (Doctrine §0e rule 14). The gate's next judgement therefore needs three things that a repeated call supplies none of: a turn of talk that ended, an owner message after it, and a plan whose last write is older than that talk.

**Measured on 2026-10-06.** The call was refused twice (§388), and each refusal was a plan-mode call that had to be followed by a fresh talk-through turn, and an answer to it, before the next call could pass.

**Why it is judgement.** What a refusal sends the session to change depends on its reason, and whether a turn of talk is fresh enough is a reading of what the talk says against what the plan now says. The gate checks the order of turns and the plan's time, which is why it refuses a repeat, but it cannot write the talk. The smell above is the signature to stop on: a second call with nothing new between it and the first.

**The general form.** A refusal is an event in the conversation and moves it forward. The next move after one is the thing the refusal named, done in a turn of its own, and not the same call made again in the hope that the state has changed.
