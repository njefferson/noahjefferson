## 390 · A commit's output is cut in the tool result at both ends and the hooks' verdict prints last, so two sends read a pre-commit failure where the commit-msg hook had refused one word of the subject

**Enforced by:** CHECKLIST commit-output-to-a-file — a commit's output is redirected to a file in the session scratchpad and the file is read back with the Read tool, to its last lines, before the commit is reported done or failed; the hook that refused is the one whose verdict is last in the file, never the one that happens to show in the tool result

**Recorded 2026-10-07.** A commit runs its hooks in turn and each prints a verdict, so the verdict of the last hook to run is the last thing printed. The tool result cuts a commit's output at both ends, and what it cuts at the end is the verdict. On 2026-10-06 two sends of the same step read the output as a pre-commit failure when the commit-msg hook had refused one word of the subject, the word worker. The refusal was in the part the tool result did not show.

**Why so much is cut.** The plan-scope tool prints the whole block of the session's recorded messages into the output of every commit it runs under, and that block is most of what gets cut. A commit made under a plan in force therefore prints a long block first and its verdicts after it, and the verdicts are at the end, where the cut is.

**What the redirect does.** The command's output goes to a file in the scratchpad, so nothing is cut, and the Read tool shows the file with its last lines on the screen. A commit refused by a hook is then reported with that hook's own text, found in the file. The plan's commit step names the file and the read for this reason, so an agent following it has the check built in.

**The general form.** A tool result is a window onto an output, not the output. Where the part that decides what to do next prints last, the window is the wrong instrument, and the remedy is to put the output somewhere it can be read to the end. The same holds for any command that chains checks and reports the last one's verdict at the bottom.
