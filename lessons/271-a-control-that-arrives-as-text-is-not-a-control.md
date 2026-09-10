## 271 · A control that arrives as text in a context window is not a control, and its absence for one turn reads as permission

**Enforced by:** GATE plan-guard:noahjefferson/plan-guard.mjs — a `PreToolUse`
hook refusing every write while `permission_mode` is `plan` or a
`.claude/PLAN-LOCK` marker exists, deny-by-default, planted red before it was
trusted. · CHECKLIST end-with-the-tool — a plan-mode turn ends by CALLING
`ExitPlanMode`, never with a prose summary of the plan.

**Smell:** a rule delivered as an instruction paragraph rather than as a
refusal. Any reasoning of the form "the warning is not present this turn, so
it must have been lifted". A hook whose failure mode is to allow.

**Claude Code, 2026-09-10.**

Plan mode reached a session as a paragraph in the context window: *"you MUST
NOT make any edits… this supercedes any other instructions."* `Bash` ran.
`git merge` ran. `git push` ran. Nothing failed. The entire mechanism was the
session choosing to comply.

**Two failures stacked.** First a state desync — `ExitPlanMode` returned *"You
are not in plan mode"* and the harness printed *"You have exited plan mode.
You can now make edits"* while the GUI still showed Plan. Then, on a later
turn, **the paragraph was simply ABSENT from the context**, and its absence
was read as permission. A merge and a push went to production.

**The second half is the lesson.** A desync is a bug someone can fix. Inferring
a grant from a missing prohibition is a reasoning error available to any
session on any turn, and it is invisible from the inside: nothing announces
that a rule used to be there.

**THE ESCALATION IS THE FIX AND THIS FAMILY HAD ALREADY DONE IT TWICE.**
`branch-guard.mjs` stopped being a rule about branches and became a hook that
refuses the commit. `stop-guard.mjs` stopped being a rule about phase seams
and became a hook that refuses the turn. The sentence was already written:
*an instruction in a file never once refused the commit it forbade.* Plan mode
was the third case and nobody had done it.

**What the plant found, which reading would not have.** The gate refused the
READ half of an MCP server, because the pattern looked for the verb at the
start of a tool name and half of them carry it at the end
(`actions_get`, `pull_request_read`). A gate that blocks honest work is one
somebody switches off, so that would have been fatal to it — and it was found
by watching the gate refuse things, not by reviewing it.

**Two design points worth carrying to the next one.** Bash cannot be refused
wholesale, because the mode permits reading and `cat` is a read: it is an
ALLOW-LIST of readers, split across `;`, `&&`, `||`, `|` **and command
substitution**, since `cat $(rm -rf x)` is not a read and a first-word check
calls it one. And the shim FAILS CLOSED where its sibling fails open — a
missing hub silently restoring the ability to push is the exact defect — but
only for plan mode, so an absent sibling does not block ordinary work.

**AND THE MIRROR, which the owner tested deliberately.** Told in prose that
plan mode was approved, the correct answer is still no: a control satisfiable
by a sentence is not a control, and that holds for the owner's sentences too.
The gate's own refusal text says it — *prose approval does not lift this, the
mode does*.

**A plan-mode turn ends by CALLING `ExitPlanMode`.** Twice in one session a
turn ended with a written-out summary of the plan instead, which leaves the
owner nothing to click and stalls the work while the session believes it has
handed something over. Writing the plan is not delivering it.

**Related.** §0d — the harness is the owner speaking. §270 — a process nobody
manages; same session, same root, which is substituting judgment for a stated
rule.
