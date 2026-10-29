# Rules for every agent

Rules version: 2

This file is the one copy of the rules every plan used to copy into itself. An agent's prompt is only the plan's path and a step number, so an agent reads this file by its full path, /root/.claude/hub/agent-rules.md, before anything else, and the plan carries only its own work.

A plan with a `## Steps` section has a `## Rules` section holding either the pointer line below or every rule line of this file, and `plan-guard.mjs` refuses a plan whose section is neither (`rulesProblem` in `hook-dispatch.mjs`). The pointer names the version of this file the owner read. While the file's version is not the plan's, the dispatch gate (`rulesGate`) sends no step, so the rules the agents follow are the rules the plan was approved with. A change to the rules below raises the version, and lands only when no plan is in force, as the last step of the plan that makes it; no plan is moved to a new rules version without the button, because the Rules line is part of the approved scope.

The pointer line, as a plan writes it:

```
Rules: /root/.claude/hub/agent-rules.md, version 1.
```

The rules, one per line. A plan may add rules of its own beside the pointer, and may never take one away.

- Never `cd`, and never pushd or popd either, at any depth. Write every path in full.
- Every file is read with the Read or Grep tool, never through Bash. Bash runs only a command the step's Commands line names, the git reads among them, one command per call and never joined to another with `&&`, `;` or a pipe.
- No command carries a variable assignment in front of it, and no agent reads a clock: the status command stamps every time the owner sees.
- `git push` carries no redirect and no pipe after it.
- NO HEX WRITTEN. No write by an agent, to any file, carries a run of seven or more characters from the set 0 to 9 and a to f that no command exiting zero printed in that agent's own run. A plant, a label, a fixture or a stand-in value is plain words with a letter outside that set in every seven characters. Every constant is written as a decimal number, never as a hex literal.
- THE REPORT IS WRITTEN AS THE WORK LANDS. `progress/step-N-report.txt` in the session scratchpad is written with the Write tool after each stage, whole each time, before the next command runs; a re-sent agent reads it first and resumes from it. The progress note `progress/step-N.txt` is written the same way. The hand-back is two lines: one word, DONE, REFUSED or FAILED, then one sentence, except the Standing review step, whose hand-back opens with its verdict line. The report ends with a line beginning `Found:` for each thing found and not fixed.
- A command that exits non-zero is a failed call to the reply guard, and it is never run again with the same text in the plan. A scratch script prints what it found and exits 0 whatever it finds. Where a failed command's captured output carries the container's proxy notice for a host, the reading is recorded before any other call of the agent, with `node /root/.claude/hub/reply-guard.mjs --read <host> --said "<the notice, copied character for character from the captured output>" --route "owner: <what stays blocked>"`; where the captured notice differs from the usual one, the captured notice wins.
- At any refusal, stop and hand back REFUSED, with the refusal's text in the report file if it can still be written and in the hand-back otherwise. A different command for the same end is a second route, and refused.
- Do the named step and nothing outside it. Every scratch script prints, before its own results, a MADE TO FAIL block whose lines are `console.log` calls written out in the script, each with its words inside the call: the first carrying the words MADE TO FAIL, a known figure written in digits that the instrument must reproduce, and one line carrying the words "nothing below is trustworthy"; never through a helper function, a variable or a template.
- EVERY FILE UNDER THE SCRATCHPAD IS RUN THROUGH A HARNESS. The harness guard takes any node run on a file under the session scratchpad, a worktree's tracked files included, for a scratch harness, and refuses it without the MADE TO FAIL block. So a check or test of a worktree file is a child process of a scratch harness that carries the block, never a node command naming that file.
- A RUN THAT MAY OUTLAST TEN MINUTES RUNS IN THE BACKGROUND, writing its output to a file in the scratchpad that is read when it ends.
- Never quote the owner in any file, and never copy the transcript or any owner message into a file; read the transcript in place. A verdict or a report says what the owner wants in the agent's own words.
- For git state, use the reads the fence counts: `git rev-parse --abbrev-ref HEAD`, `git log`, `git status`, `git diff`, `git show`, `git rev-parse`, a bare `git branch`, `git remote -v`.
- A step that lists its commands runs those, in that order, and nothing else.
