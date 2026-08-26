## 150 · A generated file that is gitignored makes CI the first fresh clone the repository has ever had

**Enforced by:** GATE MoleBridge:package.json — the generate step is a
prerequisite of `typecheck` and `build` rather than a thing to remember. ·
CHECKLIST fresh-clone — before pushing a change to what is generated or ignored,
clone into a temporary directory and run the checks there.

MoleBridge generates its in-app patch notes from CHANGELOG.md into
`src/ui/releases.ts`, which is not committed — a build artefact in the tree goes
stale in the tree. A source file imports it.

Every local run passed for hours. The file was sitting there from an earlier
build, so the type check always found it. The first machine that had never built
was the CI runner, and it failed immediately: a source importing a module that
did not exist.

**The trap is that the working tree accumulates state the repository does not
have.** Generated files, installed browsers, caches, a `.env` somebody made
once. Every one of them makes the local checks measure a different repository
from the one anybody else clones — and the gap only ever shows up somewhere
nobody is watching, which by then is a red build in front of a reviewer.

**Two fixes, and the first is the real one.** Make the generation a
PREREQUISITE in the scripts, so `typecheck` and `build` cannot run without it —
then the ordering is enforced rather than remembered. And when the change is to
what is generated or ignored, clone the repository into a temporary directory
and run the checks there before pushing; it takes twenty seconds and it is the
only way to see what a stranger sees.

**A note on what NOT to do.** The first instinct was to add a drift check —
regenerate, compare, fail on difference. Against a file that is never committed
that check can never fail, because whatever it compares against was written a
moment earlier by the same command. It would have been a permanently green step
that reads like coverage. Structurally impossible beats detectable; a gate that
cannot fail is worse than no gate at all.

