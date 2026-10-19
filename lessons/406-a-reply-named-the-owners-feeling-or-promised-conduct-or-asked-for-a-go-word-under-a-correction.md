## 406 · A reply named the owner's feeling, promised conduct for a later turn, or asked for a go-word under a correction, and the stop guard now refuses each of the three

**Enforced by:** GATE hub:session-guards.test.mjs — the case that feeds the stop guard a reply of each shape and the replies that must pass (a code block quoting the same words, an honest report, a go-word asked for on a later line, and the same open line when no correction stands), with plants that take out the emotion patterns, the promise patterns, the go-word patterns, the standing of the correction, the setting aside of fenced code and the first-line rule, each of which must fail the case

**Recorded 2026-10-19.** A correction is answered by saying what was wrong and what was done about it. Three shapes of reply do something else with the turn: one names what the owner feels, which is not the session's to say and answers nothing the message asked; one promises what the session will do from now on, which is words about a later turn; and one opens by asking for a go-word while a correction stands, which parks the turn for a nod when the work the correction does not touch could have gone on.

**What the guard does now.** In `stop-guard.mjs`, `managingShape` judges the reply with fenced code removed, against three pattern lists that sit between two marker lines so a scratch run can load exactly them (`EMOTION`, `PROMISE`, `GO_ASK`). The go-word pattern is read on the reply's first non-blank line only, and only while the owner's newest message is a correction (`correctionStanding`). It is judged before the declaration, because a declared stop excuses stopping and never the shape of the reply, and it refuses once with the reason named.

**What the check cannot see.** Wording. A reply that names a feeling, promises conduct or asks for a nod in words the lists do not hold passes, and a list is the owner's to extend. The patterns were written from the shapes seen and not measured over a session's replies.

**The general form.** A promise is words about a later turn, and the gates are what hold a later turn: a reply says what was wrong and what was done, and stops there.
