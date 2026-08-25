## 107 · A check that asserts a fact about ONE CLONE cannot be run in CI, and the session that wires it there will have watched it pass locally

**Enforced by:** GATE noahjefferson:branch-guard.mjs `--artefact` — the mode that
checks the tracked hook against `.branch-guard` and PRINTS which checks it
skipped and why. Any repo running the guard in CI uses it.

`branch-guard.mjs` asserts four things. Two are about the REPO — the tracked
`.githooks/pre-commit` exists, and it matches what `.branch-guard` declares. Two
are about ONE CLONE — `.git/hooks/pre-commit` exists, and it matches the tracked
copy.

A CI runner is a clone nobody commits from. `actions/checkout` leaves
`.git/hooks` empty by definition, so the second pair can NEVER hold there.

**A Spine step was added that ran the plain check, and it has never once been
green.** Counted from the run list rather than estimated: **ten runs since the
step was added — seven concluded FAILURE, three were cancelled by a superseding
push, none succeeded.** Every failure carried the same line,
`.git/hooks/pre-commit is MISSING`. Every one of those pushes was verified
against the remote, correctly, and reported as landed. The gate that was supposed
to protect them was red the whole time.

(This paragraph first said "eight consecutive pushes", which was a count from
memory of a list that was on screen. The list says seven failures and three
cancellations. A lesson that rounds its own evidence is teaching the habit it
exists to correct.)

**AND IT HAPPENED AGAIN IN THE SAME SESSION, AFTER THIS PARAGRAPH WAS WRITTEN.**
A stalling CI step was reported as "25+ minutes on one run and 15+ on the next".
The timestamps say **10m35s and about 3 minutes**, and both ended because the run
was CANCELLED rather than because the step finished — against a healthy baseline
of **24 seconds**, which is the number that made it a finding at all. The
inflated figures reached a commit message, a workflow comment and a repo's NOTES
before the timestamps were read.

Both mistakes have one shape: **a duration or a count that came from how long
something FELT while tool calls went past, presented in the same voice as a
measurement.** There is no warning attached to it — an estimate reads exactly
like a reading, in your own notes, an hour later.

**So: any number that goes into a file, a commit message or a handoff is
COPIED from its source in the same action that writes it.** Not recalled from a
list seen four calls ago. The source was still there both times, and reading it
took one command. The real figures were both more damning than the invented ones,
which is the thing to notice — this is not a bias toward exaggeration, it is the
absence of a check.

**A THIRD TIME, AND IT NAMES THE COMMON CAUSE.** The same slow step was then
called *hanging* and *stalling*, in a workflow comment, a commit message and a
repo's NOTES. It was not hanging: completed observations are 24s, 1m57s and
4m45s, all successful. The one long reading ended because **that run was
cancelled by a subsequent push** — three pushes inside ten minutes cancelled
three runs in a row — so nothing was ever allowed to finish, and the truncated
observations were read as evidence of a fault. They were evidence of the
cancelling. **The pushes were the session's own.**

**That is the shape behind all three: a conclusion drawn from an observation
that was never allowed to complete.** A count read off a list still scrolling, a
duration read off a step still running, a diagnosis read off a run the observer
had just killed. Each was then written in the voice of a measurement, where
nothing distinguishes it from one.

**The check is a question, not a tool: WHAT ENDED THIS OBSERVATION?** If the
answer is "I did", or "I stopped looking", there is no finding yet — only a
reason to look again and let it run. Waiting is cheap; every one of these cost
more to correct than the wait would have.

**The step was watched passing locally, which is the one place it proves nothing
about CI** — because locally the hook IS installed, which is the entire
difference. This is hub LESSONS 53 a second time, in a different repo, in a
different mechanism, and the shape did not change: **a session that adds a hard
gate to a pipeline has just built a new way for its own work to silently not
arrive, and is at its least likely to look because it just watched the tool
succeed.**

**`--install` first is not the fix, and it is the tempting one.** `--install`
WRITES the tracked file, so a drifted artefact would be repaired on the spot and
the check would then pass over the one defect it exists to find. A repair step
standing in for a verification step is a green tick with nothing behind it.

**Print the skipped checks; never drop them.** `--artefact` says which two it did
not run and why, in the passing output. A check that quietly stops applying is
the fail-open this tool's own history is about — the first version pointed at the
tracked directory via `core.hooksPath` and failed open the same way.

**Smell, and it is checkable in a minute:** for any check you are about to put in
CI, ask which of its assertions are about the repository and which are about the
machine it is running on. Then look at the run — not the push, the RUN — and read
the conclusion for that exact SHA. The push output has never once known.
