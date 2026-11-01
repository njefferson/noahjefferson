## 441 · A slash command counted as the person's message and held the session as a correction, because two readers had two tag lists

**Enforced by:** GATE hub:transcript-tail.mjs — `HARNESS_TAG` is defined here once and `isOwnerMessage` returns false for a user entry that opens with a command name, a command message or a local command output; `pending-guard.mjs` imports it and re-exports it, so the correction check, the latch's clearing and every other reader agree
**Enforced by:** GATE hub:session-guards.test.mjs — the slash cases: a model-switch entry as the newest user entry is not a correction and does not clear a latch, a typed message with no go-word still is one, and the pending guard's re-export is the same pattern; plants take out the tag pattern, the test in `isOwnerMessage` and the re-export

**Recorded 2026-11-01.** Measured on 31 October. `hook-dispatch.mjs` already dropped the harness's command tags at prompt time, so a slash command never arrived as a prompt to be judged. `transcript-tail.mjs` excluded only three prefixes and did not know the command tags, so every reader that went through the transcript instead of the prompt took a model switch for the person's newest message. A message with no go-word is a correction, and a correction holds new starts, so a switch of model held the session and cleared nothing.

**What is done now.** One definition of the tag pattern, in the file the readers share. `pending-guard.mjs` already imported from `transcript-tail.mjs`, so the pattern moved to the lower file and the upper one re-exports it, which keeps the imports from running in a circle. The older plant that took the pattern out of `pending-guard.mjs` was moved to its new line.

**The general form.** A fact two readers must agree on is defined once, in the file both already depend on. Two copies of a tag list drift in the one direction nobody tests, which is the reader that is not on the prompt path.
