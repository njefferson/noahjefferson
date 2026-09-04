## 237 · A gate only CI runs is a gate that reports the defect after it has shipped

**Enforced by:** GATE unlisted-app:tools/hub-gates-local.mjs — a per-repo runner
in `.branch-guard`'s `also=` list that executes the SHARED hub gates at commit
time, with a missing hub clone treated
as a failure rather than a skip. Planted the exact defect that shipped and
watched the commit refuse. · CHECKLIST count-the-gates — for every gate a
repository's CI runs, name what runs it before the push; the answer "the
session will remember" is the finding. · JUDGEMENT — which of a shared
workflow's steps are worth the seconds they cost on every commit.

**Smell:** a shared gate invoked only from a workflow file. Also: any commit
message asserting the gates are green, in a repository where the gates a
session runs and the gates CI runs are two different lists nothing compares.
And the general shape — a comment in a configuration file explaining why
something runs, with nothing after it that makes it run.

**Three releases, 2026-09-03.** A repository pushed 0.37.0, 0.37.1 and 0.37.2 in
one evening. Every one had a red run. Every commit message said the gates were
green, and every one of them was telling the truth: the gates the session ran
were the ones named in `.branch-guard`, and the shared ones — the example,
privacy, quote, third-person, docs, pin and PWA checks — were named only in
`.github/workflows/checks.yml`.

`example-check` had refused an undeclared placeholder from the moment that
placeholder was written. It said so on the first push and on the two after it.
Nothing in the working session was required to look, and nothing did.

**Sharing the gate is not the same as running it.** The whole reason a family of
repositories has one copy of each check, taken with `--repo .`, is that five
divergent copies cannot then exist. That worked. What it left behind is a
category of check that no local run touches — which reads as an absence rather
than a failure, because a list of green results with an entry missing looks like
a list of green results.

**Two ways the miss stayed invisible.** The deploy is a separate workflow, so
red checks stopped nothing and the app went out three times. And the newest run
in the list is the one an eye lands on; three consecutive failures at the top
read as one thing gone wrong just now, not as a wall that has been down since
Tuesday.

**And the same file carried the proof of it.** `.branch-guard` had eight lines
explaining that the staging build must run on every commit, why running it by
hand is not enough, and what it cost the last time nobody did. No `also=` line
followed them. It had never run on a commit. A comment describing a wiring is
indistinguishable, at reading speed, from the wiring.
