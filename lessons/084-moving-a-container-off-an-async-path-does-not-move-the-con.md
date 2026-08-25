## 84 · Moving a CONTAINER off an async path does not move the controls inside it, and the leftover is invisible on an idle machine

**Enforced by:** CHECKLIST — when a fix makes something appear synchronously "so it is right the moment it is shown", enumerate every element inside it whose visibility is set by the async path you just bypassed. Grep the async painter for assignments to `.hidden`/`.disabled`/`textContent` and check each one has a synchronous counterpart. **Smell:** a container whose visibility is computed in two places and a child whose visibility is computed in one.

A first-run walkthrough handed the reader to a panel section. An earlier release
had already found and fixed the obvious defect: the section's visibility was
computed only inside an async store read, so the panel opened and the section
grew a tick later. The fix learned the answer at boot and applied it
synchronously, with a comment explaining that the handoff is the one moment the
section must already be right.

**The section's only button was left behind.** It shipped `hidden` in the markup
and was unhidden ONLY inside the same async read. So the panel opened with the
question present and nothing to answer it with, until a store read returned. The
container had been rescued and its contents had not.

**Why nobody saw it.** The tick is short on an idle machine, so every local run
won the race. It surfaced as a CI failure on a commit that **changed no
application code at all** — a docs-only commit — while the same assertion had
passed on the commit before it. That is what a timing defect looks like when it
is reporting its rate rather than its presence, and the first instinct is to call
it a flaky runner and re-run.

**Two traps on the way to the fix, both worth naming:**

- **Adding a wait to the failing assertion "fixes" it and destroys it.** The
  claim under test was *the handoff lands on a complete surface*, not *it becomes
  complete shortly afterwards*. A settle, a retry or a `waitForSelector` would
  have measured later than a reader does and gone green over a live defect.
- **A local plant cannot prove this one.** The machine that wins the race wins it
  under the plant too, so planting passes and proves nothing. Say so rather than
  banking it as verified — and add a second, deterministic assertion that CAN be
  planted: that the synchronous value and the async paint AGREE, so the control
  cannot appear and then vanish.

**The general shape:** every "compute it early so it is right on arrival" fix
draws a line between what was rescued and what still waits on the old path, and
the line is invisible in the diff because the leftover code did not change. **Ask
what else that async function writes.** If the answer is "some of the same
surface", the fix is half-applied and the half that is missing is the half that
only fails on somebody else's slower machine.
