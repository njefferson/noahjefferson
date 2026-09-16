## 311 · A red run goes invisible the moment another push lands on top of it, and "tools-only" is exactly the change that couples two gates

**Enforced by:** CHECKLIST read-the-run-you-made — before pushing again, read
the run whose head SHA is the commit you just pushed, by step-level
conclusions; a later push does not inherit an earlier one's verdict and does
not clear it. · CHECKLIST no-such-thing-as-tools-only — run the whole pipeline
for a change confined to the checkers, because gates check each other and that
coupling is invisible from the diff. · JUDGEMENT — when deciding which gates a
change can possibly have touched, the answer is never derived from which
directory it is in.

**Smell:** a run list where the newest row is pending and the eye stops there.
A commit message explaining that no receipt went stale because only `tools/`
and `docs/` changed. Three consecutive pushes, each verified by reasoning
rather than by a run. A gate that reads another gate's source file.

**Measured 2026-09-16, Quietkeep.**

A commit added one state to the accessibility walk's registry — a name, two
selectors, and the three per-state audits every other state calls. It changed
no shipped file, so the release gate correctly wanted no version bump and the
markup receipt correctly still held. The commit said so, and it was right about
both.

`tools/surfaces.mjs` holds two sets equal: every state audited for contrast is
also audited for focus rings. It reads them out of `tools/a11y.mjs` by regex.
So adding a state to one file created an obligation in a second file, asserted
by a third — and the diff showed none of that. CI step 30 went red.

**And then two more commits were pushed over it.** Each created its own run.
The next time anybody opened the run list, the newest row was pending, the one
below it in progress, and the failure was two positions down on a SHA that had
already been superseded twice. Nothing was hiding it; it had simply stopped
being the row the eye goes to.

The repair was one `auditFocusRings` call and a comment. The cost was three
commits that read as verified and were not.

**This is §161's sibling and it arrives from the opposite direction.** There,
the newest green row belonged to the commit BEFORE the push, because the push
created no run at all — an absence, read as an answer. Here the run exists and
is red, and the same eye movement produces the same wrong conclusion. In both
cases the only reliable question is the one that names the SHA: *is there a run
whose head is this commit, and what did its steps say.* Neither "the newest run
is green" nor "nothing is red at the top of the list" answers it.

**Why the local pipeline did not catch it first, which is the part worth
transferring.** The repo has a runner that executes every step of the CI
workflow locally, precisely so that what a session did not think of still gets
run (§139). It was not used, because the change was judged tools-only — and
that judgment is the same act §139 exists to replace. The categories a session
reaches for (shipped versus not, source versus tooling, code versus docs) are
about deployment risk. Gate coupling does not respect them: a checker reading
another checker's source is a dependency with no import, no type and no
mention in either file's header.

The rule that follows is not "run everything always" — the runner is minutes
of compute and the restraint on that is real. It is narrower and it is
absolute: **a change to any file a gate reads is a change the pipeline has to
see**, and for a repo whose gates read each other's sources, that includes
every file under `tools/`.
