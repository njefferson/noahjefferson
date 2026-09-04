## 240 · The index said the swap was done in all eight repositories; measured, it was two — and the gate that would have caught it is carried by three

**Enforced by:** CHECKLIST count-callers-by-the-call-not-the-filename — to answer
"which repos run the shared workflow", read every workflow file in each repo and
grep for the CALL; a probe of guessed filenames answers a question about the
guesses. · CHECKLIST a-claim-about-other-repos-is-measured-or-it-is-not-written —
a line in one repo asserting the state of eight is stale from the moment it is
typed, and nothing in that repo can fail when it goes wrong. · JUDGEMENT — the
paragraph most likely to be wrong is the one that already corrected itself once.

**Smell:** any sentence of the form "all N repositories now …" in a file that
lives in one of them. Also: a survey whose result is a round number matching the
number of repositories.

**noahjefferson hub, 2026-09-04.** The hub's `CLAUDE.md` carried three counted
claims, each written as a correction of an earlier wrong count: that all eight
sibling repositories call the shared `hub-gates.yml` workflow and not one still
copies the job, that all eight pin the same hub commit, and that all eight carry
the per-repo gate that keeps the pin and the doctrine marker together.

**Measured by reading every workflow file in all eight:**

Two call the shared workflow — one from `spine.yml`, one from `gates.yml` — and
both pin the same commit, which is the commit the paragraph names. That much was
true. Four still check the hub out and run the gates directly, which is the
copied job the paragraph says nobody has left: three pin a hub commit of their
own, dated eleven, nine and thirteen days before the one the callers use, and the
fourth passes no `ref` at all, so it runs the gates out of the hub's moving
default branch — the exact failure §184 was written about and was recorded as
fixed. Two reference the hub in no workflow at all. The per-repo pin gate is
present in three of the eight.

**What it cost immediately.** A gate was added to the shared workflow the day
before, defaulted on, and described in its own commit as running in every repo
now. It reaches only repositories that call that workflow, and only once they
move their pin past it — and the two callers pin a commit from the day before it
existed. So it runs in none of them, while three files say otherwise.

**AND THE FIRST ATTEMPT TO MEASURE IT WAS ALSO WRONG, IN THE SAME DIRECTION.**
The check probed the five workflow filenames the hub's own notes list, and six
repositories came back with no caller found. That is a fact about five guessed
filenames. The repositories carry between one and eighteen workflow files each,
under names the list does not contain. Reporting "six do not call it" from that
probe would have been a second false count published as a correction of the
first — and it would have read as careful work, because it was a measurement.
The hub's own gate for this reads every workflow rather than a named one, for
this reason, and the session reimplementing the check by hand did not.
