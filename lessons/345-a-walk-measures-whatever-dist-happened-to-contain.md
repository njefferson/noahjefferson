## 345 · A walk measures whatever `dist` happened to contain, so the run that proves a test can fail can be satisfied by a stale build

**Enforced by:** GATE Jefferson-Photography-Studio:tools/fresh-dist.mjs —
compares the built page's mtime against every tracked file a build reads, and
exits 2 with "npm run build" before the browser launches. Wired into all
thirty-seven walks and into the sweep.
**Enforced by:** CHECKLIST plant-then-build — a fail-first run BUILDS between
the plant and the run, and between the restore and the re-run. Watching the
plant go red is not proof the plant was in the thing that ran.

This is §331 one level down. That lesson says the run proving a test can fail
is also a test of the build. This is what happens when the build under that run
is not the tree's.

**The measurement.** A defect reported from the device was fixed, and the fix
was to be verified the way this family verifies everything: put the defect
back, watch the walk go red, take it out, watch it go green. The walk printed
`all checks passed` with the defect in the source. Five minutes of reading the
walk followed — was the check reaching the right element, was the selector
wrong, was the sampler firing — before the actual answer: the walk serves a
`dist` directory that a python http.server in another shell is holding, and
`dist` was five minutes older than the plant. The walk was right, the plant was
real, and they had never met.

**What it costs beyond the hour.** Every number taken off a walk in that
session was suddenly a number about an unknown build. Not wrong — unknown,
which is worse, because a wrong number can be found. And the discipline this
whole family runs on, that a new check is made to fail once before it is
trusted, had been satisfied by a build that did not contain the thing being
tested. A check "proven" that way is a check nobody has proven.

**Why nothing could see it.** A stale build is not a failure state. It serves,
it renders, it responds, and every assertion in the walk is about the app's
behaviour rather than about the app's version. There is no symptom: the walk
takes exactly as long, prints exactly the same lines, and is exactly as green
as it would be if it were right.

## The fix is one stat, not a hash

mtime, and the limits stated rather than papered over. It catches the whole
real failure — edit, forget to build, run a walk — for a stat per tracked file.
It cannot catch a build made from different CONTENT at the same instant, and a
checkout that rewrites mtimes reads as stale. Both fail toward "go and build",
which costs three seconds and is never the wrong thing to do.

It refuses BEFORE the browser launches, so a stale tree costs a second rather
than a full run, and it exits 2 — the code the walks already use for "this did
not run" — so a sweep reports it as a refusal rather than as a failed check.
Those are different facts and a runner that conflates them teaches everyone to
read red as noise.

**And it was put in every walk rather than in the sweep alone**, because the
failure happened while running ONE walk directly, which is how a walk is run
nine times out of ten. A guard that only fires in the sweep is a guard for the
occasion that was already careful.

## The general shape

**An instrument that reads a BUILT artefact needs a link between the artefact
and the source, or it is measuring an unnamed thing.** It is the same defect as
a committed artefact going stale in the tree while CI stays green, and the same
defect as a pinned workflow running gates from a frozen commit (§334): a thing
that is derived, served without checking, and cannot report its own age.

Any sibling here with a walk that serves a built directory has this today. The
check is: after editing a source file, run one walk — if it runs at all, the
walk cannot tell.
