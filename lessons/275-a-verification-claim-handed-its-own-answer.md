## 275 · A verification claim that names the screen and quotes the words can only fail if a string is missing

**Enforced by:** CHECKLIST outcome-not-answer-key — a directed verification task
states the OUTCOME somebody wanted, names no screen and quotes no expected
wording; the agent reports where it ended up, what it pressed, and what the app
actually said. · JUDGEMENT — when a check cannot fail for any reason other than
a literal absent string, it is measuring the string and not the feature.

**Smell:** a task of the form *"Standing at ⟨screen⟩, you should see ⟨quoted
words⟩"*. Verification tasks written by copying release notes. Any check whose
expected value appears in the instruction given to the checker. A pass rate that
tracks whether text shipped rather than whether anybody could reach it.

**Quietkeep, 2026-09-11, caught before the run rather than after.** `COLDREAD.md`
taught its verification pass as "the claims walk", with each claim written as a
place to stand and a thing that must be visible there, derived from the release
notes. Eleven were written that way for a seventh run. Read back, every one
handed the agent both halves of the answer:

- It NAMED the destination — so it could never test whether the destination was
  findable, which is a large part of what the previous run's worst findings
  were.
- It QUOTED the expected wording — so the agent pattern-matches instead of
  judging. A screen could say the right word inside a sentence that made no
  sense and the claim still passes.

**And the reader does not have the instruction.** A person does not read release
notes and does not know a screen's name, so a claim phrased in release-note
vocabulary tests the app against its own announcements rather than against
anybody's attempt to use it. Rewritten, each line became the outcome somebody
wanted — *"you decided something you already made is really an ongoing area,
not a project; change it"* — with the agent reporting where it ended up, how
many taps it took, and the app's words verbatim. Same coverage, no answer key,
and reachability now inside the measurement.

**The same error in the other direction, and it is the more embarrassing half.**
The session had been recording known shortfalls as "still owed, and said in the
release notes rather than left for a reader to discover", treating disclosure as
mitigation. It is not. Nobody reads them; the reader meets the thing. That
sentence has been struck from the method: release notes are the SOURCE for
writing verification tasks and never the wording, and never a defence.

**The shape.** §266 is a control whose threshold the defect can reach; §273 is
one whose precondition is absent. This is the third: a control whose expected
answer was included in its own instructions. All three produce a pass, and the
pass is indistinguishable from the feature working.
