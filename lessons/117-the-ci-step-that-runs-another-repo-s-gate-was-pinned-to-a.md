## 117 · The CI step that runs another repo's gate was pinned to a commit from before that gate existed, and it was watched passing locally, which is the one place a pinned checkout proves nothing

**Enforced by:** GATE solve-ent:tools/hub-pin-check.mjs for the half a script can
see — the reconciliation marker and the workflow's `HUB_SHA` are the same fact
written in two files, and it refuses a commit where they disagree in either
direction. Plus CHECKLIST for the half it cannot: adding a step that invokes a
hub gate means verifying the named file exists AT THAT SHA rather than at the
sibling clone's HEAD.

**It recurred as a checklist and became a gate on 2026-08-26.** Solve-ent adopted
§146, the marker moved to the new hub commit, the pin stayed on the old one, and
it was caught by hand — by somebody grepping the workflow, on the way to
something else. A pin behind the marker is CI running the shared gates from
before the rules the repository has already read: every gate green, the new rule
enforced nowhere, and the marker asserting it was read and applied. **Adopting is
one command and editing a workflow is another, and nothing about the tree looks
different after the second one is skipped.** Every sibling that pins the hub owes
this check — **and it cannot be a hub gate, which is the part worth keeping.**
CI fetches the hub AT that pin, so a shared gate validating the pin would be
fetched at the very commit it is checking; a pin left behind far enough checks
out a hub without the file, and the step fails with a missing module rather than
a diagnosis. That is this lesson one level up, wearing the costume of its own
fix. The check has to be repo-local, read only files in its own repository, and
need the hub for nothing.

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
