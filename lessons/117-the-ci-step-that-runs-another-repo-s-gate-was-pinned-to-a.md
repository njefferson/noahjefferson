## 117 · The CI step that runs another repo's gate was pinned to a commit from before that gate existed, and it was watched passing locally, which is the one place a pinned checkout proves nothing

**Enforced by:** CHECKLIST — adding a step that invokes a hub gate means moving
that workflow's hub pin in the SAME commit, and verifying the named file exists
at the new SHA rather than at the sibling clone's HEAD.

A sibling repo runs the canonical gates by checking the hub out SHA-pinned into
an untracked path, which is right: a cross-repo gate must depend on the other
repo's published history and not on anybody's working copy. A session then
adopted a new hub gate, wired `node .hub/third-person-check.mjs --repo .` into
the workflow, and pushed.

**The step could only ever print `Cannot find module`.** The pin was months old
and predated the file. Locally the same command runs against `../noahjefferson`,
a clone sitting at its own HEAD, where the file is present — so the session saw
it pass, on the only path that says nothing about the runner.

**This is the same shape as running `branch-guard.mjs` without `--artefact`**
(§107): a check that is a fact about ONE CLONE, watched passing in the clone
where it holds. The pinned-checkout version is worse in one way, because the
local spelling and the CI spelling are character-for-character identical — there
is no flag to notice.

**It failed at step three of eighteen and SKIPPED the fifteen after it**, and
Deploy is a separate workflow with no dependency on Gates, so the candidate
deployed having been measured by three gates. A red gate that stops a deploy
would have made this loud; a red gate beside a green deploy made it quiet, which
is the structural gap §53 is about, from the other side.

**The general form: a step that names a file in a pinned checkout has TWO
inputs, and adding the step only supplies one.** The remedy is mechanical and
nobody performs it from memory, so write it beside the pin — which is where a
session adding the next step will be looking. A gate is buildable here and does
not exist yet: parse the workflow for `node .hub/<file>` invocations and the
`ref:` beside them, and assert each file is present at that SHA.

---
