## 249 · Verifying a push by comparing HEAD to the remote passes loudest when the commit never happened

**Enforced by:** CHECKLIST capture-head-first — a push check reads HEAD BEFORE
the commit and asserts it MOVED, then asserts the remote carries the new value;
two assertions, because the second alone is vacuous. Watched: the same pipeline
printed a confident pass on a refused commit, then a real pass on the retry
after the cause was fixed. · CHECKLIST what-does-up-to-date-mean-here —
`Everything up-to-date` from `git push` means nothing to send, which is the same
words for "already pushed" and for "there is nothing here". · JUDGEMENT —
whether a hook that refused is a bug in the hook or the thing it exists to say.

**Smell:** `[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/BRANCH)" ]` as a
success condition. Any `git commit … && git push` chain where the commit's exit
code is swallowed by a pipe to `tail`. A push step that reports MATCH in the same
breath as `Everything up-to-date`. And the general form: a comparison between two
things that are equal both when the work landed and when it never started.

**2026-09-08.** A release was committed and pushed with a verification step
written specifically to follow the standing rule — verify a push by reading the
REMOTE, not the push output. A pre-commit hook refused the commit; a version had
moved and a hand-maintained block naming the deployed versions had not, which is
exactly what that hook exists to catch. Nothing was committed. `git push` then
said `Everything up-to-date`, correctly. And the check compared HEAD to
`origin/staging`, which were the same commit — the previous one — and printed
**MATCH — on the remote**.

Every individual statement was true. The conclusion was the opposite of the
truth, and it was the reassuring direction.

**The rule it was obeying is right and was not enough.** "Read the remote, not
the push output" was written against a push that silently failed; it says where
to look, and says nothing about what to compare. Equality with the remote is
satisfied by a branch that never moved, so the check cannot distinguish *the work
arrived* from *there was no work*. The fix is one line: read HEAD before the
commit, and require it to have changed as well as to match.

**The general shape.** A verification whose passing condition is *these two
values agree* must be asked what happens when NEITHER moved. Where the failure
mode is a step not running at all, agreement is the default state of the world
and the check is measuring nothing. This is the same defect as a gate that diffs
an empty range, or a suite whose subject was never built: the instrument reports
on an absence and the absence looks like success.
