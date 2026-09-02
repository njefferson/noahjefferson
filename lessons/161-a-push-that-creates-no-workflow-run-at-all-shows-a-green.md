## 161 · A push that creates no workflow run at all leaves the last commit's green tick standing in its place

**Enforced by:** CHECKLIST run-exists-for-this-sha — after any push, find the run
whose `head_sha` IS the pushed commit before reading any conclusion. · CHECKLIST
verify-by-sha — the same discipline the deploy rule already carries (§53): a
pipeline is checked at a commit, never "recently".

**Smell:** a repository page that looks healthy. The newest run is green, its
message is recognisable, and it is for the commit BEFORE the one just pushed.

Two releases were pushed to a repository whose gates run on every push. Both
pushes were verified against the remote — the range line printed, `git ls-remote`
read back the exact SHA — and **neither created a workflow run at all.** The run
list's newest entry was the commit before them. Nothing was red, because nothing
had run.

The commit before those two had its own failure worth naming: a run created,
concluding `failure` five seconds later with its only job still `queued`. That is
a dispatch that never reached a runner, and it does not read like a gate finding
anything. A hand dispatch of the same workflow queued and passed fifty minutes
later, so whatever it was had passed.

**The trap is the sentence a session says next.** "CI is running" was reported
for both releases, because a push had happened and pushes cause runs. The check
that was actually performed was on the run list, and every green thing in it
belonged to an earlier commit.

**A missing run is invisible in a way a failing run is not.** A red run is on the
page in red. A run that was never created is an absence, and the eye reads the
newest green row as the answer to "did it pass".

So the check is not "is the newest run green" but **"is there a run whose
`head_sha` is this commit, and what did its log say"**. Same shape as the deploy
rule that already exists in this family (§53, four releases reported as shipped
that had failed a gate added that afternoon): a push is evidence about a REF, and
everything downstream of it — a run, a deploy, an artefact — is evidence about a
COMMIT, which has to be looked up by that commit.

**And the fallback is one call.** Where the API allows it, dispatching the
workflow by hand against the branch produces a run on the current head; that run
is what the release was verified by, and saying so is more honest than saying the
push was green.
