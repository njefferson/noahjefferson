## 104 · A test whose own cleanup reverts the thing it tested leaves you certain of something that is no longer true

**Enforced by:** CHECKLIST verify-the-final-state — a capability is confirmed by
exercising it against the tree as it will be COMMITTED, never against an
intermediate state a later step of the same test destroys. `git reset --hard`
inside a test is the specific hazard: it reverts unstaged changes to tracked
files as readily as it undoes the commit, so it can delete the work being
tested while leaving every other sign of it in place.

**Smell:** "I watched it go red, then fixed it, then cleaned up" — where the
cleanup was a hard reset, a checkout, or a stash drop. Also: a capability
described in a header comment, a hook, a release note and a lesson, with nothing
executing it. Grep for the flag or function name in the file that must implement
it, not in the files that mention it.

A pre-commit check was added so an app's generated screenshots could not go
stale. It was tested honestly: a change was planted, the commit was watched
being refused with the right message and the right file named, then the fix
command was run and the commit watched succeeding. Everything a test should do.

**The cleanup was `git reset --hard HEAD~1`, and the tool being tested was a
tracked file with unstaged edits.** The reset reverted it to the version in the
previous commit — the one with none of the new logic. It also reverted the
declaration file that wires the hook up, which WAS noticed and restored, because
the guard's own drift check reported it by name.

**Nothing reported the tool.** So what shipped was: a hook that runs on every
commit; a shell script that execs the tool with a flag the tool no longer
implements; an unknown flag falling through to the default path, which is *do
the main thing* — launch a browser, re-render ten images, exit 0. **Installed,
expensive, and incapable of refusing anything.** It was described as working in
a release note, in the repo's notes, and to the person who asked for it.

**Three things to take:**

- **Verify against the final state.** The question is not "did it work when I
  tried it" but "does it work in the tree I am about to commit". Re-run the
  proof after the cleanup, not before it.
- **`git reset --hard` is not a cleanup, it is a revert of everything.** In a
  test, prefer `--soft` plus an explicit unstage, or a scratch branch, or
  restoring the single planted file from a copy. And after any hard reset, ask
  what ELSE was uncommitted — the answer is rarely nothing.
- **Close the argument list.** An unknown flag that falls through to the default
  behaviour turns a missing feature into a silent no-op with a plausible log.
  Exit non-zero on a flag the tool does not implement, and the same failure
  announces itself on the first run instead of never.

**The general shape, and it is this family's most expensive one:** a mechanism
whose ABSENCE looks identical to its presence from every angle except the one
nobody checked. The hook existed. The script existed. The declaration existed.
The documentation existed. The only missing thing was the twenty lines that do
the work, and every other artefact went on asserting they were there.
