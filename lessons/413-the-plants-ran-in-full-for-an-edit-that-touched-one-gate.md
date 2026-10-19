## 413 · The plants ran in full for an edit that touched one gate, so a flag narrows them to the guard files a commit touches, and the full run stays the gate

**Enforced by:** GATE hub:session-guards.test.mjs — the case that runs the suite's own plants mode in a copy and reads what it lists (`--files=` lists only the plants of the named guard files, `--touched` only those of the files git shows changed in the checkout, `--dry` runs none, and `--touched` outside a git checkout refuses), with plants in the suite's own flag handling that must fail it

**Recorded 2026-10-19.** The plants are the check that a gate fails when a line of it is taken out, and there is one for nearly every line of every gate, so a run of all of them is the cost of checking one edit. An edit to one guard file waited on plants of every other.

**What is done now.** `--plants --files=a.mjs,b.mjs` runs only the plants whose target is one of those files; `--plants --touched` takes the files from `git status` of the checkout; `--dry` prints which plants would run and runs none; `--case=<words>` narrows the cases a plant runs. A narrowed run prints that it is narrowed and that the plants of the other files were not run. `--touched` outside a git checkout prints that it needs one and exits, because an unreadable status read as "nothing touched" would run no plant and pass.

**What the check cannot see.** A case exercises more than one file, so an edit to one file can break a plant of another. A narrowed run is a quick look at what an edit can have broken; the full run, once, over the integrated change, is the gate (Doctrine §0g).

**The general form.** A narrowing flag is for the quick look and says so on its output, and it refuses when it cannot tell what to narrow to.
