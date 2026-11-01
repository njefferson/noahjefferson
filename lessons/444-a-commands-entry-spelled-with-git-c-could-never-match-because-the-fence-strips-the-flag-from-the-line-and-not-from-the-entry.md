## 444 · A Commands entry spelled with `git -C` could never match, because the fence strips the flag and its directory from the agent's line and not from the entry

**Enforced by:** GATE hub:hook-dispatch.mjs — `commandsGitDirProblem`: a Commands entry carrying `-C` directly after `git` is refused at `ExitPlanMode` and by `--check`, with text saying the fence strips `git -C` and its directory from an agent's line, so the entry is written bare and the agent still writes `-C`; the refusal sets no latch
**Enforced by:** GATE hub:session-guards.test.mjs — the plan-gate Commands and Files case: an entry with the flag is refused, a bare entry passes; plants take out the wiring and the flag test

**Recorded 2026-11-01.** Measured on 31 October. `plan-fence.mjs` splits an entry into words and matches them against the agent's line after it has stripped the git directory flag and its directory from that line. An entry written `git -C <path> log` then asks for the word `-C` in a line that no longer has it, and never matches. The plan read well, the approval went through, and every agent that ran the command was refused for a command the plan appeared to allow.

**What is done now.** The refusal is at the plan gate and not in the fence. The alternative, stripping the flag from entries as well, would make two spellings of one entry mean the same, and the plan is read by the person; one spelling keeps it readable and leaves the fence as it is.

**The general form.** A matcher that normalises only one side of a comparison makes the other side's honest spelling unmatchable. Where the normal form is the one the matcher compares, the plan is held to it before the button, since the agent finds out only at the refusal.
