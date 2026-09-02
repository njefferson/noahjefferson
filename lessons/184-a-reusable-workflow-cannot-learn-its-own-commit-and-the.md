## 184 · A reusable workflow cannot learn its own commit, and the wrong guess went green

**Enforced by:** GATE hub:.github/workflows/hub-gates.yml — the pin is read out
of the CALLING workflow file, which the job has already checked out, and a value
that is not one 40-character commit stops the job. · CHECKLIST
print-what-you-read — a step that derives a value from a context prints every
candidate it considered, so one run says what each held instead of another guess.
· JUDGEMENT — a cross-repo checkout that resolves a NAME rather than a commit is
a green run against code nobody chose, and greenness is not evidence.

**Smell:** any `actions/checkout` of another repository whose `ref:` is computed,
defaulted, or absent. Also: a reusable workflow that needs to know where it came
from, which feels like a fact the runtime must obviously have.

`hub-gates.yml` runs the family's shared gates. To run them it has to check the
hub out, and it has to do that at exactly the commit the caller pinned in its
`uses:` line — otherwise the wiring and the gates are two different versions,
which is the whole defect the file was written to end. Three ways were tried.

- **`github.workflow_ref`.** Inside a reusable workflow this is the CALLER's
  entry workflow, not this file. A sibling on `staging` resolved the pin to
  `refs/heads/staging`, which is not a ref in the hub, and the checkout died
  with git exit 128.
- **`github.job_workflow_ref`**, documented as the reusable workflow's own ref.
  Empty on the runner.
- **`github.job_workflow_sha`**, documented as its own commit. Also empty.

**The first one is the lesson and the other two are the cost of learning it.**
It did not fail. The only caller at the time works on `main`, the hub HAS a
`main`, so the ref resolved and the job went green — checking the shared gates
out of the hub's MOVING DEFAULT BRANCH, for days, under a comment in that same
file asserting that a caller could not end up on a different version than it
pinned. A pinned call was running unpinned gates and every run reported success.
It surfaced only when a repo whose branch is not `main` called it.

**What made the next two failures cheap was a guard written before the value was
trusted.** `job_workflow_ref` arriving empty would have checked out the hub's
default branch again — silently, identically, greenly — except that the step
refuses anything that is not a 40-character commit. The empty value produced a
loud red instead of a quiet wrong answer. Write the assertion in the same commit
as the derivation, not after it has worked once.

**The value was never in the runtime; it was on disk.** The job checks the
caller's repository out in its first step, and the pin is a literal string in the
caller's workflow file. Reading it from there is not a workaround for a missing
context — it is better than any context would have been, because the value used
is the one written in the `uses:`, so the gates and the wiring cannot be two
versions even in principle. There is nothing to half-bump because there is only
one place to bump.

**And the general form.** When a value must agree with something a human wrote,
read what they wrote. A parallel derivation that usually agrees is a second
source of truth, and the day it disagrees it will do so silently.
