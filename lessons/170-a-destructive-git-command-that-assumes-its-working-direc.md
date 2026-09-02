## 170 · A destructive git command that assumes its working directory will eventually run in the wrong repository

**Enforced by:** CHECKLIST git-names-its-repo — every `reset --hard`, `clean
-fd`, `checkout -f` or `restore` names its repository with `git -C <abs path>`,
never by an assumed working directory. · CHECKLIST cd-does-not-persist — in a
harness where the shell's working directory is reset between calls, a `cd` in
call N is not in effect in call N+1; read the tool's own contract rather than
the observed behaviour of the last two calls.

**Smell:** two sibling repositories worked on in one session, plus any command
whose blast radius is "whatever repo I happen to be in". The pair is the danger,
not either one alone — the command is correct, the target is not, and nothing
about the text on screen says which repo it will hit.

A session was moving between an app repo and the hub that holds its shared
gates. One call ran `cd ../noahjefferson && git log …` and correctly reported
the hub's state. The next call opened with `git fetch origin main && git reset
--hard origin/main`, written for the hub and reasoned about as the hub.

**The working directory had been reset between the calls.** Both commands ran in
the APP repo, whose `origin/main` is its own production branch. The reset
succeeded, reported success, and discarded every uncommitted file of a release
in progress — a rename across markup, two manuals, an ADR, a changelog entry, a
service-worker constant and the repo's own record.

**Nothing committed was at risk, and that is the only reason this was cheap.**
The loss was one turn's uncommitted edits, reproducible from the sources they
were derived from. The same mistake against a repo with hours of unstaged work
is unrecoverable, and `reset --hard` has no reflog entry for what it destroys.

**The tell was in the output and was not read.** `git reset --hard origin/main`
printed `HEAD is now at 04562b5 Promote 3.5.2 to production …` — a commit
subject belonging unmistakably to the app, in a command believed to be operating
on the hub. One line, naming the wrong repository, immediately after the
destruction rather than before it.

**Three things would each have prevented it, and the cheapest is the rule.**
Absolute-path `-C` costs nine characters and removes the assumption entirely.
Committing before switching repos removes the blast radius. Reading the reset's
own echo catches it one second late, which is better than not at all but is not
prevention.

**Why the harness's contract matters more than the observed behaviour.** The tool
description says the working directory persists between calls and to prefer
absolute paths anyway. Two calls in a row had behaved as though `cd` persisted,
which is exactly the evidence that produces confidence in the wrong model. A
documented "prefer X" written against a behaviour that *usually* holds is
describing a failure that is rare, silent and expensive — which is the profile of
every rule in this file.
