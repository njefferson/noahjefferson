## 248 · The same tree, two branch-guards, opposite verdicts — and the losing one told the reader to create the drift

**Enforced by:** CHECKLIST run-it-from-the-pin — "run the gate the way CI runs
it" is a claim about WHICH COPY, not only which flag. Before believing a local
hub gate, compare the hub clone's HEAD against the `uses:` pin in the calling
workflow; if they differ, run the gate from the pinned commit
(`git -C ../hub show <pin>:<gate>.mjs > /tmp/g.mjs && node /tmp/g.mjs --repo .`)
and treat that as the answer. Watched: the same unchanged tree returned exit 0
from the pinned copy and a drift failure from the clone's HEAD, minutes apart. ·
CHECKLIST what-did-install-touch — after `npm ci` in any repo whose `prepare`
regenerates a TRACKED file, read `git status` before doing anything else. ·
JUDGEMENT — whether a generated artefact that disagrees with your clone is stale
in the tree or stale in your hand.

**Smell:** a `prepare` script that writes a tracked file. A gate whose failure
message names the command that fixes it, where that command writes something
committed. Any repo-local checker imported from a sibling directory rather than
from a version. And the tell: a dirty working tree immediately after an install
that changed no source.

**2026-09-08.** A repo pins the shared gate workflow by SHA — the pin and the
doctrine marker are asserted to be the same fact, and a check holds them
together, so that half was sound. What nothing held was the clone sitting beside
the repo, which is what every local invocation actually runs.

The generator had changed fifteen commits after the pin: three emitted paths
gained a `./`. So `npm ci` — an install, nothing more — rewrote the tracked
pre-commit hook and printed nothing about it. The tree then answered the same
question two ways. From the pinned commit, the one CI executes: *matches what
`.branch-guard` declares*, exit 0. From the clone's HEAD, which is what the
repo's own instructions tell a session to run: *has DRIFTED — re-run with
`--install`*.

**The advice is what makes it dangerous.** The false red arrives with a remedy
attached, the remedy writes the committed file, and committing that turns CI
red — because CI regenerates from the pinned hub and gets the other form. A
session doing exactly what the failing gate told it to do produces the failure
the gate exists to prevent. The install had already performed that "repair"
unprompted, so the change was staged and waiting before anyone read the message.

**The hub already carried this defect pointing the other way** — never
`--install` in CI, because it writes the tracked file and repairs the drift the
step exists to find. That was written about the runner. Nobody had asked what
the same asymmetry does on a developer's machine, where the artefact is right
and the checker is the thing that is out of date.

**The general shape.** Pinning a dependency by SHA pins what CI runs and says
nothing about what a person runs. Wherever those two are the SAME TOOL reached
by different routes — a workflow pin versus a sibling checkout, a lockfile
versus a global install — the local copy is an unpinned third version, and it is
the one whose verdict gets acted on immediately, by hand, with no review. Its
disagreement with CI is not noise to be resolved in its favour; the pinned copy
is the one production is measured by.
