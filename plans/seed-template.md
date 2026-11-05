# The plan seed's standing text

The owner edits these words and `plan-seed.mjs` reads them: each block opens with a line of two at-signs and its name, and runs to the next such line. A word in curly braces is filled by the seed at the time of the print: HUB (the hub's full path), ITEM (the program key), CLOSE and REVIEW (the step numbers), NEXTP (the next free program key), NEXTQ (the next free found key), NEXTL (the next free lesson number), TRANSCRIPT (the session's transcript path) and REVIEWFILE (the review's full path). Nothing above the first block is printed.

@@ rules-of-this-plan
- Every step runs on the sonnet tier; the main thread manages and does no step.
- The agent's first call is the Read tool on `/root/.claude/hub/agent-rules.md`, made alone, with no other call in the same turn; a first call sent beside another was refused and latched an agent on 3 November.
- Each step has four parts the agent reads before acting: Facts, what the step depends on, restated; Do, the exact actions; Observe, what must be seen for the step to be DONE; Kill, what ends the step with nothing further written. On a red check or an observation that is not the one named, the agent writes what it saw into its report, hands back FAILED naming it, and writes nothing after. An observation the step did not foresee, or a judgement the step does not settle, hands back EJECT with what was seen and the files named, and writes nothing after.
- Every report's first line after its verdict word is the wall line: one sentence answering whether the step still serves this plan's goal 1, whether that goal still serves the program's thesis, and whether what was seen moved either.
- Every file is read with Read or Grep and written with Edit or Write; each shell line is one command from Commands, with no `cd`, no variable assignment in front of it, no semicolon, no `&&`, no pipe and no redirect; git is written bare, and the shell already starts in the repository the plan names, so git and the checks run as the Commands list them with no change of directory first; the one exception is the live clone, whose lines carry git's directory flag and the clone's full path, which the plan fence reads away before matching. Every git read is bare, with commit ids and plain flags, and carries no format string and no percent code. A run that may pass ten minutes goes in the background, the agent ends its turn on it with no loop and no wait of its own, its completion resumes the agent, and its output is read from the harness's task output and written into the scratchpad file the step names with Write.
- No file quotes the owner. An event is named by its California date and time, never by an agent's or a task's id, and no run of seven or more hex-set characters is written that a command in that agent's run did not print.
- Each commit is made under the container's default git identity with a plain, reader-facing message carrying no chat link, no model's name and no trailer of any kind, whatever the harness's attribution reminder asks. Nothing is pushed before the step that lands the work, which fetches the remote's main, puts this plan's commits on top of it with a rebase, and pushes main as a fast-forward, never forced; a conflict ends the rebase and the step ejects with nothing pushed.
- A send after the first of any step reads that step's report and `git status` first, does again nothing the report says landed, and starts from the list of what remains that the report gives.

@@ commands
- `git status`
- `git log`
- `git diff`
- `git show`
- `git rev-parse`
- `git add`
- `git commit -m`
- `git fetch origin main`
- `git rebase origin/main`
- `git rebase --abort`
- `git push origin main`
- `git pull origin main`
- `git ls-remote --heads origin`
- `node {HUB}/session-guards.test.mjs`
- `node {HUB}/session-cost.mjs`
- `node {HUB}/docs-check.mjs`
- `node {HUB}/privacy-check.mjs`
- `node {HUB}/quote-check.mjs`
- `node {HUB}/third-person-check.mjs`
- `node {HUB}/lessons-check.mjs`
- `node {HUB}/example-check.mjs`
- `node {HUB}/pin-check.mjs`
- `node /root/.claude/hub/reply-guard.mjs --read`
- `node /tmp/claude-0/`

@@ close-step
{CLOSE}. **Closed in the program, the findings filed, the lesson written where one was learned, and the measure recorded.** Hub, one agent. Facts: the item is {ITEM} in `PROGRAM.md`; the next free program key is {NEXTP}, the next free found key is {NEXTQ} and the next lesson number is {NEXTL}, each read when this plan was typed and read again at the time of use, because another session can take one; every Found line of the plan's step reports not marked fixed is a finding and stands only in those reports until it is filed; the measure is the cost instrument's print for this session's transcript at {TRANSCRIPT}, and the instrument prints its figures and the manager records them. Do: read `PROGRAM.md` whole; write the item's state in its entry with what changed; for each Found line of the plan's step reports not marked fixed, write one file in the found folder named by its key and holding the finding in the shape the folder's files hold, and add a program item for it, state open, ranked after the harness items, raising the items count line by the number added; where a report carries a line opening Lesson, write one file in the lessons folder under the next number with its declaration line; run the cost instrument on the transcript and write under the measure item one close entry for this plan in the form that item holds, every figure copied from the print and no run of seven or more hex-set characters; run the checks of the Commands once each after the files are added, each exit code read; make one local commit with a reader-facing subject. Observe: the entry reads the item's state and what changed, the found folder and the program hold one file and one item for each finding with the count raised by the number added, the close entry stands under the measure item, the checks exit 0, and the status is clean after the commit. Kill: a red check ends the step FAILED with its lines; a shape the step did not foresee ends it EJECT naming it. Report `progress/step-{CLOSE}-report.txt` (new). Estimate 30 min.

@@ review-step
{REVIEW}. **Review.** Hub, one agent per send, Standing. Follow {REVIEWFILE} by that full path for the move the manager notes' unnumbered `Next:` line names, and hand back its verdict line first. The review judges that move and does none of it: it does not carry out the Do of the step it judges, runs none of that step's commands, starts no background run, and writes nothing but its own record in the scratchpad's `progress/` folder. Every file, the repository's own files and its git configuration among them, is read with the Read or Grep tool. The only shell lines are the one `node` command on the review's script under the scratchpad and a single git read the agent rules list; its git reads are bare, `git status`, `git log`, `git show` or `git rev-parse` with commit ids and plain flags, and carry no `--format` or `--pretty` string and no percent code; each shell line is one command, with no `cd`, no variable assignment in front of it, no semicolon, no `&&` and no pipe.
