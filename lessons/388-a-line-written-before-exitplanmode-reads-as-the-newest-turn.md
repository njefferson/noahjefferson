## 388 · A line written before ExitPlanMode in the same turn read as the newest assistant turn, so the plan gate found no owner message after it and refused the call

**Enforced by:** GATE noahjefferson:plan-guard.mjs — `talkedThrough` judges the newest assistant turn that asked nothing and ended before the owner's newest message since the plan-mode anchor, and text written in the turn of the `ExitPlanMode` call itself is not a turn, so a line before the call no longer displaces the talk
**Enforced by:** GATE noahjefferson:session-guards.test.mjs — a case with a line in the call's own turn after a talk-through turn and an owner message, which passes, and one with no talk-through turn at all, which is refused with the has-not-been-talked-through reason, each with its plants

**Recorded 2026-10-07.** The plan gate refuses `ExitPlanMode` unless a turn of plain talk that asked nothing, written after the plan file's last write, has an owner message after it (LESSONS §370). It took the newest assistant turn that asked nothing as the talk, and then asked for an owner message after it. A session that had talked the plan through and been answered, and then wrote one line of text before the call in the same turn as the call, had made that line the newest turn that asked nothing. The line is newer than any owner message, so the gate found none after it and refused the call.

**Measured on 2026-10-06.** The gate refused `ExitPlanMode` twice after a talk-through and an answer, both times with a line written before the call in the same turn, and passed it once with no such line. Two approvals were lost to it.

**The fix is the bound.** The turn judged is now the newest assistant turn that ended before the owner's newest message since the plan-mode anchor. Text in the turn of the call is after every owner message by construction, so it is not a candidate, and the turn before it is judged. The plan file's last write is still compared with the judged turn's time, so an answer given before an edit is still not the talk of the edited plan.

**The general form.** A check that asks for a message after a turn has to say which turns can have one. A turn still being written cannot, and counting it as the newest turns the habit of writing a sentence before acting into a refusal. A gate keyed on order has to be keyed on turns that have ended.
