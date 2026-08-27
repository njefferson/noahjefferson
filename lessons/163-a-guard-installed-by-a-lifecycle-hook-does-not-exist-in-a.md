## 163 · A guard installed by a lifecycle hook does not exist in a session rooted somewhere else

**Enforced by:** CHECKLIST install-the-guard-yourself — in any session that will
commit to a repo whose guard is installed by a hook, run the install explicitly
before the first commit rather than assuming a lifecycle event ran it. ·
CHECKLIST guard-present-before-first-commit — `ls .git/hooks/pre-commit`, or run
the repo's plain `branch-guard` check, which fails when it is absent. · GATE
noahjefferson:branch-guard.mjs — refuses the commit, once it exists.

**Smell:** a guard whose installation is wired to an event, plus any reason that
event might not happen. Ask what runs it, then ask what a session that does none
of those things looks like — a docs-only edit, a session rooted one directory
up, a container that never installed dependencies.

The hub refuses commits on any branch but `main`. `.branch-guard` says so, the
generated `pre-commit` hook implements it, and the hook is installed two ways:
by `npm ci` through `prepare`, and by the repo's own `SessionStart` hook.

**Nineteen branches were on that remote when somebody finally counted.**
Seventeen were from separate sessions across three weeks, none sharing any
history with `main`. Every one was a session doing exactly what its harness told
it — the harness assigns each session a `claude/*` branch and says to develop
there, which is right for a repo with a staging model and strands the work in a
repo without one.

**Both installers missed, for different reasons, in the same session.** The
`SessionStart` hook belongs to that repository and fires when that repository is
the session's project; a session rooted in a PARENT directory, with several
repos as siblings beneath it, never fires it. And `npm ci` is not something a
session editing only markdown has any reason to run. Seven commits landed on the
wrong branch in one day before anything installed the hook at all.

**A guard that is usually installed is not a guard, it is a probability.** The
failure is silent in both directions: committing on the wrong branch looks
exactly like committing on the right one, which is the whole reason the hook
exists, and the hook's own absence looks exactly like the hook passing.

Same family as §143 — a guard against an environment hazard, wired to a
lifecycle event, covering an instant while the reasoning covers a session — and
this is a second door into it. There the clone went stale after the check ran;
here the check never ran, because the event it hangs off belongs to a scope the
session was not in.

**The transferable form: a check's INSTALLATION is part of the check.** When
adopting a hook-based gate anywhere, write down what installs it, then name the
session shape in which none of those things happen. If that shape exists — and
with multi-repo session roots it always does — the instruction to install it
explicitly belongs in the file a session reads automatically, not in the file it
would have to think to open.
