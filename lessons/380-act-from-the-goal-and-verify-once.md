## 380 · Act from the owner's goal and the record, and verify once

**Enforced by:** GATE noahjefferson:stop-guard.mjs — refuses a reply that asks the owner for the next work, and one that offers to drop verification to save time · JUDGEMENT

**Smell:** a single item polished for hours while a ranked roadmap waits; every step tested on its own when the steps feed each other and are tested together anyway; the owner asked what to build next; an offer to skip checks presented as speed.

**Recorded 2026-10-02.** A morning went to one audit run whose every group was implemented, then adversarially checked, then gated and rendered on its own, two at a time, while the checks of finished groups queued behind the implementations of unfinished ones. Development on the roadmap stopped behind it. Asked to hurry, the session first kept every step, then offered to drop verification altogether, then asked for the next item to build while NOTES.md ranked fifty-two. The fix was structural: every group and roadmap item is implemented without per-step checks, integrated onto one branch, and verified once over the whole before staging. Doctrine §0g carries the rule. The gate catches the two reply shapes; which checks are per-step and which are the release check stays judgement, because no parser tells them apart.
