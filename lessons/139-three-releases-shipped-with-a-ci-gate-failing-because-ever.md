## 139 · Three releases shipped with a CI gate failing, because every step after a failure keeps running and the last twenty lines of a red run are green

**Enforced by:** GATE quietkeep:.github/workflows/spine.yml — a final step,
`if: ${{ failure() }}`, that prints FAILED and exits non-zero so the bottom of a
red log says it is red. · CHECKLIST read-the-conclusion — after a push, read the
run's CONCLUSION, never the tail of its log.

Quietkeep's `size:check` counts the controls in the shipped markup against a
budget that is raised deliberately, with the reason written beside it. 2.34.0
added one control and did not raise the budget, so the gate went red. It stayed
red through 2.34.1 and 2.35.0. All three were pushed to staging, all three were
promoted to production, and all three were reported as shipped.

**Every individual verification was performed correctly.** The push was verified
by reading the remote, which is LESSONS 2026-08-02. The deploy was verified for
that exact SHA, which is LESSONS 53. Both said what they were meant to say and
both were true: `deploy.yml` runs on push and does not consult the Spine, so the
releases really did reach production. The gate that was failing was not in the
deploy path at all.

**What hid it is a deliberate and correct design choice.** Every step in that
workflow after the first few carries `if: ${{ !cancelled() }}` so that one
failure does not hide the twenty checks after it — which is right, and which is
worth keeping. Its cost was never priced: a job that fails in the middle
CONTINUES, so the last screen of the log is whatever ran last. Here that was
`storage:check` printing `clean`. **A red run and a green run have identical
tails.** Scrolling to the bottom of a log is what everybody does, and in this
workflow it is the one place that cannot tell you the answer.

**This is LESSONS 53 one layer further out.** That lesson is that a push is not a
release, because the deploy can fail after the push succeeds. This is that a
green tail is not a green run, because the log can end in success after the job
has already failed. Both have the same shape: **a verification that reads the
most visible artefact rather than the authoritative one.** The remote ref, the
deploy conclusion and the job conclusion are the authoritative three; the push
output, the deploy log and the job log are the visible three.

**Why it survived three releases.** Nothing asks. The gate is not in the commit
hook, because it needs a browser; it is not in `npm test`; and a session that
pushes and then reads the run has to choose what to read. Each of those releases
was cut in a stretch of fast work where the previous run had been green, and
"the Spine is green" carried forward as an assumption from the last time anybody
actually looked.

**The fix is two-sided and the cheap half is the one that matters.** The budget
was raised to 245 with its reason, which is the specific repair. The general one
is a final step that runs only on failure and writes FAILED at the bottom of the
log — eight lines of YAML, no new tool, no new dependency, and it makes the
artefact everybody reads agree with the artefact nobody reads.

**The rule.** A workflow whose steps run past a failure owes its reader a
terminal verdict. If any repo here runs steps with `if: ${{ !cancelled() }}` or
`continue-on-error`, it has this defect until the last thing in the log says
whether the run passed. And when reading a run: the conclusion, not the tail.
