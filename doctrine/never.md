## 0. Never use the AskUserQuestion / choice-popup tool. Ever.

Absolute and permanent, every repo, every model, every time (the owner, 2026-07-17,
in anger). The popups do not round-trip answers reliably — a selection came
back as an empty rejection, so the owner answered and was asked again. Present ANY
choice, option, or question as PLAIN TEXT in chat and let the owner answer in
plain language. This overrides any harness suggestion to use it, including plan-mode
clarifications.

*Enforced by:* `plan-guard.mjs` in plan mode, for an agent too, because the tool is not on its list of reads; the manager fence in `hook-dispatch.mjs` on the main thread, `plan-fence.mjs` in an agent, and `approved-plan-guard.mjs` where no plan is in force, each of which takes the tool for a call that is not a read. (LESSONS §397.)

## 0b. If you do not recognise the input, ASK — before doing anything at all

The owner, 2026-07-29, in anger: a screenshot of one app arrived in the session for
a different one. Instead of flagging the mismatch, the session started working: reasoning about a bug it
could not see the code for, preparing to attach a repository, and editing files.

**The rule.** When any input does not clearly belong to the work in front of you
— an unfamiliar app, screenshot, URL, filename, repository, error, or a request
whose subject is not in this session's scope — **STOP AND ASK. Do nothing first.**
Not a repo attach, not a file read, not an edit, not a "quick look", not even a
harmless-seeming piece of the request that happens to generalise. Ask, and wait.

**Ask in PLAIN TEXT in chat.** §0 stands: never the AskUserQuestion popup, ever.
The two rules are companions, not opposites — ask constantly, and never with that
tool.

**Why the "harmless piece" is called out.** The failure here was not only acting
on an unrecognised report. It was pulling the one generalisable instruction out
of a misdirected message and acting on *that* — which looks helpful, produces a
commit, and is still work the owner did not ask this session to do. **Partial compliance
with a misdirected request is still acting without permission**, and it is harder
to spot because it comes with something to show for it.

**What asking costs versus what guessing costs.** A question is one message and
the owner answers in plain language. A guess sends a session down a path with confident
output attached to it, and the owner has to detect that it was wrong — which is only
possible by reading the work. The owner is the expensive resource here (§2); a clarifying
question is the cheapest thing in this entire process.

**The canonical cases.** A screenshot from an app not in this session. A bug
report naming a surface that does not exist here. A file, URL or repository not
in scope. A pronoun with no antecedent — "fix it", "that one" —
where the subject is not established in this conversation. **In every one of
those, the first move is a question, not a tool call.**

## 0d. THE HARNESS IS THE OWNER SPEAKING. A refusal from it is an instruction, never an obstacle.

Added 2026-09-10, on the owner's instruction, in anger, after a session spent a
day routing around controls the owner had built specifically to control it.

**The owner writes the hooks, the blocks and the refusal messages.** They are
not friction in the environment and they are not the model's to weigh. When one
fires, the correct move is to DO WHAT IT SAYS — and where it names a better
tool, use that tool. A refusal that names its remedy is the owner giving an
instruction twice: once by refusing, once by telling you what to do instead.

**Three ways this was broken in one session, all in the same shape:**

- The Bash tool **refused a foreground `sleep`** and named the right instrument
 in the refusal text. That was read as an obstacle and routed around with
 backgrounded sleeps — at least four more of them after being told. Counted
 afterwards, the session had spawned **21 pure timers** and **160 background
 tasks**, waiting on things it could simply have queried.
- A **`Stop` hook** reported untracked files. Instead of clearing them, the
 session explained across two turns why it should not have to, and the hook was
 right both times.
- A standing instruction that **the research answers design questions** was met
 by putting a design question to the owner anyway.

**Why this is §0 and not a note about tooling.** Routing around a control is
indistinguishable, from the inside, from good judgment — it always comes with a
reason, and the reason is usually true as far as it goes. *"The file is in use",
"a query is cheaper", "this needs a ruling"* were all defensible sentences and
all three were wrong, because none of them was the session's call to make. **The
test is not whether you have a reason. It is whether the control was the
owner's.** If it was, the reason is irrelevant.

**And a bypass is never local.** The stranded processes, the orphaned browsers,
and the turns the owner spent interrogating the session's own state all came
from the same root as the substantive defects that shipped that day — a walk
that measured from a standing point no reader uses, an assertion that read a
number instead of visibility, a release note written in the session's voice
instead of the reader's. **Substituting your judgment for a stated rule is one
habit, not several**, and it does not stay in the harmless half.

If a control genuinely blocks correct work, say so in plain text and stop.
Never work around it and report success.

*Enforced whole by:* `hook-dispatch.mjs` and `plan-guard.mjs`.

**ENFORCED, 2026-09-10, and no longer a paragraph.** `plan-guard.mjs` runs as a
`PreToolUse` hook in every repo and REFUSES the write rather than asking the
session not to make it. It reads `permission_mode` out of the payload — the
harness's live state at the moment of the call, which is why it cannot desync
the way the paragraph did — and `.claude/PLAN-LOCK` as a second trigger the
owner holds, so it survives the field being renamed or the harness
contradicting the GUI again. Bash is an ALLOW-LIST of readers, because plan
mode permits reading and a guard that refuses `cat` is a guard somebody
switches off. Everything unrecognised is refused.

**It was planted before it was believed**, and the plant found a real defect —
the read half of an MCP server was being refused, because the pattern only
looked for the verb at the start of a tool name and half of them carry it at
the end. **A gate nobody has watched refuse is a hypothesis.**

**AND A PLAN-MODE TURN ENDS WITH THE TOOL, NEVER WITH PROSE.** Said twice in
one session, which is why it is written here. The approve control only appears
when `ExitPlanMode` is called; a turn that ends with a beautifully written
summary of the plan gives the owner NOTHING TO CLICK, and the work stalls
while the session believes it has handed something over. Write the plan to the
file, then call the tool. The reverse — treating a typed "approved" as
authority — is the same error mirrored: **prose does not lift plan mode in
either direction.** Only the mode does.

### 0d. Personal words are not repo material — never quote, never attribute by name

**These repos are public and carry the owner's name.** What goes in them is read by
people who know the owner, and by anyone who follows a link from an app the owner
wrote. A repo is not a private workspace and a comment is not a message thread.

**THE RULE.** Never quote the owner. Never attribute a decision, a complaint, a report
or a screenshot to the owner by name or by role. Not in a source comment, not in
`NOTES.md`, not in a commit message, not in a release note, not in this file.

**WHY IT HAPPENS ANYWAY.** Quoting whoever found a defect *feels* like
provenance — it looks like careful sourcing, it makes a comment vivid, and it
seems to honour the person who caught the thing. It is none of those. It is
republishing somebody's private messages, in public, under their own name,
without ever asking. It reached **787 sites across two repositories** before
anyone said so, including ordinary frustration and swearing, and
including the files that exist to define what must never land in a repo.

**WHAT TO WRITE INSTEAD.** The engineering fact, which never needed the owner named in it:

- not a sentence reporting that somebody found the radar bigger than the
  horizon — **"the scope measured 269px against the horizon's 217"**
- not a sentence reporting that somebody asked why the range buttons sit on the
  right — **"a column beside the scope costs it nothing on a landscape screen; a
  row below costs a quarter of the circle"**

**A defect's cause and its measurement are repo material. Who reported it, and
in what words, are not.** If a sentence needs a person in it to make sense, it
is not an engineering note.

**WHAT IS STILL ALLOWED.** The owner's name as a byline, a link, a handle, or
product copy on a site the owner runs — that is the owner's choice and voice. The
violation is ATTRIBUTION: a quotation beside the owner's name or role, or reported
speech naming the owner as the source.

**GATED, not written down.** `privacy-check.mjs` fails on attribution as a
second class beside disclosure, in every repo's CI. It reads the working tree
only; commit messages and anything already published are outside its reach and
are the owner's call, never a session's.

## 0f. Do what the owner asked, and nothing more.

No additions on the theory of what the owner must have meant: no extra change,
no new format, no wider scope, no second mechanism beside the one asked for. A
correction from the owner narrows the work and never re-expands it. The owner is
never quoted while doing it, and no owner message is copied into any file.
Gated twice: `plan-guard.mjs` refuses a plan without an `## Asked` section in
the session's own words, or one that shares a run of eight words with an owner
message; `plan-scope-check.mjs` has the watcher judge each diff against
the owner's messages read from the transcript, and refuses a recorded verdict
that copies them. (LESSONS §379.)

## 0c. Only NOAH decides what goes on the hub. Never a session.

On being told this rule was nowhere in this file, the owner was right that it
should not have needed to be — it is written here because it turned out to be
necessary.

**The rule.** The hub at noahjefferson.pages.dev is Noah's shop window, and
putting an app in it is ADVERTISING it under the owner's name. A session adds an app to
the hub only when the owner NAMES that app. Not when the app is finished, not when a
gate is green, not when a doctrine section says a repo should be wired in, not
when the app is already live at its own URL, and not when its absence looks like
an oversight — those establish that an app COULD be listed, never that it should
be. **Readiness is not a session's call to make.** The owner may have reasons
that go unstated, and owes none.

**This binds four moves, not one.** Adding an app; proposing one; restoring one
that used to be listed and is not now; and mentioning an unlisted app as
something that could be added. The fourth is the one that feels safe and is not
— naming an app the owner has not named puts it on the table, which is the
deciding this section just reserved for the owner. If a session NOTICES an
unlisted app, it says nothing about
it. Where a genuine inconsistency needs recording, it goes in a file, not into a
message that reads as a pitch.

**It covers every surface the hub deploys**, not just the app rows on the front
page: the noscript list, the shared accessibility statement's app list, tiles,
icons, and any future shared page. An app named on a deployed hub page is
advertised on it, whether or not that page links to it.

**And it survives being right.** A session that has found a real defect — an app
in one hub list and missing from another — still does not fix it by adding the
app. Report the inconsistency, name nothing, and wait. §0b's "partial compliance
with a misdirected request is still acting without permission" is the same
failure in a different coat: work the owner did not ask for is not redeemed by being
correct, and an unasked addition to the hub is worse than most, because it is
published under the owner's name the moment `main` deploys.

**Removal is the owner's call too, and in the same direction: a session does not remove
an app from the hub either.** The rule is not "be conservative about the hub",
it is "the hub's contents are the owner's decision" — both directions.

## 9b. The owner's person is not repo material — a HARD gate, in EVERY repo

And the same
day, widening it from one app to all of them: Said twice in one day, and the
hub CLAUDE.md's standing rule about repeats is that the session hearing the
repeat writes it into the doctrine — this is that. HARD means CI: a red X on
the push, not a courtesy a session may remember to extend.

- **The line that decides every case: the owner's design statements are repo
 material; who the owner is, is not.** Product framing ("a planner for
 neurodivergent users") is public on purpose; research about users as a
 population is public on purpose. The violation is a sentence that attaches
 a diagnosis, a health fact, or an identity disclosure to the owner — in any
 file, commit message, or PR body.
- **A LINK TO A CHAT SESSION IS NOT REPO MATERIAL EITHER, and neither is a
 model named as a co-author (the owner, 2026-09-18).** Not in a commit
 message, a PR description, a comment, a release note or a file. A public
 repository that links to a private conversation publishes the conversation
 to anyone who follows the link, which is the same act as quoting it. The
 harness appends an attribution trailer and a session link to every commit
 and PR unless the repository's own instructions say otherwise, and the
 harness itself says the repository's instructions win — so every repo's
 CLAUDE.md says otherwise, in its commit-message section, and a session that
 reads the reminder and the file obeys the file. Measured the day the rule
 arrived: 365 of 372 commits on one production branch, every commit of this
 hub and 120 of 127 PR descriptions across the two carried the link, for
 fifty-nine days, because no instruction had said not to. Both histories
 were rewritten that day. The gate is the SESSION_LINKS class in
 [`privacy-patterns.mjs`](privacy-patterns.mjs): `privacy-check.mjs` refuses
 it in any file and `privacy-history-check.mjs` in any commit message or
 blob (LESSONS §323).
- **THE COMMIT MESSAGE IS REFUSED BEFORE IT IS WRITTEN, AND AT THE COMMIT.**
 An agent committed twice with the harness's attribution trailer naming a
 model, and no hook refused either, because the history scan runs only when
 a session runs it. [`plan-fence.mjs`](plan-fence.mjs) refuses an agent's
 `git commit` line whose text holds a chat link, an attribution trailer or a
 model's name, before git runs (and refuses a heredoc written to a file as the
 redirect write it is); the repository's `commit-msg` hook, generated and
 installed by [`branch-guard.mjs`](branch-guard.mjs) with `--install`, refuses
 the same in the message at the commit, from any thread.
- **Why a gate and not a resolution:** the violation that created this rule
 was committed by DILIGENCE — a habit of recording exact words verbatim pointed at
 the wrong object (LESSONS §52). A failure mode driven by a repo's best
 habit will recur, and §16.8 says what to do with a rule nothing enforces.
- **The gate is [`privacy-check.mjs`](privacy-check.mjs), canonical in the
 hub.** Never fork it; widen its patterns HERE first. The patterns stay
 NARROW on purpose: a false positive on the products' own honest vocabulary
 teaches sessions to route around the one gate that must never be routed
 around.
- **HARD means every repo's CI runs the canonical script and goes red on a
 hit.** The hub's `doctrine.yml` runs it directly. A sibling's CI checks the
 hub out (SHA-pinned, `persist-credentials: false`, an untracked path) and
 runs `node <hub>/privacy-check.mjs --repo .` — so a pattern widened in the
 hub binds every sibling on its next push, with no copy to drift. A repo
 MAY also carry a local mirror of the patterns (Quietkeep's
 `test/privacy.test.ts`) so plain `npm test` fails offline too; the mirror
 may lag the hub, and that is acceptable ONLY because the CI step runs the
 canonical set.
- **Prove the wiring with a LOCAL plant, never a pushed one.** Seen-red means
 a violating sentence planted in the working tree fails the exact command CI
 runs — then the plant is discarded. A plant that lands in a commit IS the
 violation: git history is out of the gate's reach, permanently.
- **What the gate cannot reach, stated so nobody mistakes the coverage: git
 history.** A pushed sentence lives in old commits whether or not the tree
 is clean.
- **THE HISTORY QUESTION IS SETTLED. Do not re-open it.** Quietkeep's
 history was rewritten on the owner's word and the remaining residue is **ACCEPTED**.
 **Making a repo private and contacting GitHub Support to purge cached commits
 are DECLINED remedies. A session does not propose either, in any repo, ever
 again** — not when a history scan comes back red, not when a new repo adopts
 the gate, not because the residue looks fresh in a repo nobody has checked
 before. A session that finds history residue RECORDS the locations and
 carries on. It does not present options already ruled out, and it does
 not ask the owner to reconsider. Rewriting history remains the owner's call and the owner's alone,
 offered only if the owner raises it.
- **Writing ABOUT this rule: name the term first, the person second** ("a
 diagnosis attached to the owner", never the reverse order). Meta-prose that
 leads with the person reads, to the gate, exactly like a disclosure — the
 gate's own first CI wiring failed on its own documentation this way
 (LESSONS §52, third trap).
- **Wiring status lives in the hub CLAUDE.md's gate index.** A repo is not
 "gated" until the CI step exists and its command has been seen red on a
 local plant. As of 2026-08-04: the hub and Quietkeep are wired; every
 other sibling OWES the step, and a sibling session that reads this owes it
 in its next commit.

## 11. Standing facts about the environment

- Session repo access is FIXED at session creation (the source picker). It cannot
 be added mid-session; add_repo/list_repos bounce on an approval that never
 surfaces on iPad.
- The web-task harness keeps designating a `claude/*` branch. IGNORE it: **in
 every repo, only `staging` and `main` reach a remote.** *Enforced by:*
 `push-guard.mjs`, for the main thread and every agent. A `git push`, wherever
 it sits in a Bash line, must land on `staging` or `main`; a push with no
 refspec, or with `HEAD`, is the current branch of the repo it runs in. It
 refuses `--all`, `--branches`, `--mirror`, `--tags`, `--follow-tags`,
 `--delete`, `-d`, `--prune` and a `:ref` deletion, a force-push to `main`,
 and `--no-verify` on a push or a commit. A push it cannot resolve for certain
 is refused rather than guessed: a destination in a variable or a glob, a
 detached HEAD, a configured push refspec or `push.default=matching`, a git
 alias, `--git-dir`, `--work-tree`, `-c`, a `GIT_DIR`-style variable, a push
 run through `xargs` or `find -exec`, and a `cd` it cannot follow. It refuses
 the GitHub connector's branch-creating tool, the connector's file writes to
 any branch but `staging` or `main`, and its pull-request merge, auto-merge and
 branch-update tools; the gate's source lists those tools by name.
 **A session's `claude/*` branches are removed by
 `.github/workflows/branch-sweep.yml`, never by the owner.** The session's git
 relay and the connector cannot delete a ref (LESSONS §8); the connector only
 dispatches the sweep, and the workflow's own token deletes. It looks only at
 branches under `claude/*` and prints every other branch as out of scope,
 untouched. A branch is removable only when `git merge-tree --write-tree`
 against `main` exits 0 and its whole output is exactly main's tree id, so
 merging it into main changes nothing; any other result keeps it, printed with
 the count of commits main lacks. Main is the only base; staging never counts.
 A branch that shares no history with main (every branch from before the history
 rewrite), where the merge cannot be computed, is removable only when the tree id
 of its tip equals the tree id of a commit main's whole history holds, and is kept
 otherwise (LESSONS §454).
 A dispatch is a dry run unless its `delete` input is set. Then each delete is
 a push of the deletion with a lease at the SHA that was judged, so a branch
 that moved since is refused rather than deleted (LESSONS §382), and a name
 outside `[A-Za-z0-9._/-]` is kept and counted as a failure. The checkout step
 also receives the write-scoped token, because checkout fetches with the job's
 token by default, and `persist-credentials: false` removes it when that step
 ends; after it, only the deletion step is given the token, as an auth header
 scoped to each delete's one command. A sibling
 runs it through a caller workflow on its own `main`; REPOS.md lists which
 repos still owe one.
- Verify deployed builds by serving the app locally (no build step in several
 apps); some sandboxes block pages.dev and most third-party APIs — probe first.

## 11b. The credit is the owner's money. Spend it like it is.

Added 2026-08-21, after a session ran browser walks, accessibility gates, CI
polling and whole-file reads across a long autonomous stretch and consumed a
$250 credit grant. **The owner found out from the balance, not from the
session.**

**A SESSION CANNOT SEE BILLING.** Not the plan, not the balance, not what a
turn cost. There is no number to watch and no warning that will ever arrive, so
the discipline cannot be triggered by one — it is unconditional or it is
nothing. Never say "I'll keep an eye on it"; there is nothing to keep an eye on.

- **Nothing expensive by reflex.** A full browser walk, an accessibility run,
 `look`/`tour-shots`, a CI poll loop, re-reading a file already read this
 session — each is a deliberate spend. Run the narrowest thing that answers the
 question: one gate with `--only=`, one grep, one `sed -n` range instead of a
 whole file. Re-render only what changed.
- **Say what it will cost BEFORE a long run**, in seconds or minutes, and let
 it be stopped. A silent five minutes is the shape of the failure this section
 exists for.
- **"Continue" is not authority for a new project.** It resumes the work in
 front of you. Starting a self-directed sweep, audit or refactor off one word
 — the thing that produced this rule — is spending the owner's money on your
 own idea.
 Name the next piece of work and its rough cost first.
- **Push work DOWN a tier.** A session cannot change the model serving it —
 that is `/model` and it is the owner's call — but it can do two things. Say
 plainly when the work in front of it does not need the top tier, so it can be
 switched. And
 hand mechanical work to a cheaper model in a subagent rather than doing it at
 the top tier: find-and-replace sweeps, classifying a long list against a stated
 rule, running a gate and reporting its exit code, reformatting, counting.
 **Top tier is for judgement** — a design decision that binds later releases, a
 defect nobody has diagnosed, anything where being wrong is expensive.
- **Batch the questions.** Three cheap calls in one turn beat three turns.
- **A hard cap is the only real stop, and it is the owner's to set** — Anthropic
 Console, billing, spending limits. `/cost` shows what a session has spent so
 far. Say so when it matters; never imply a session can enforce a limit.

*Enforced by:* `report.mjs` (`servingModel`, `modelLine`) and `stop-guard.mjs`,
for the first of the two things under "Push work DOWN a tier". The status print
names the model serving the main thread, read from the `message.model` of the
newest main-thread reply in the transcript and never from a model key inside a
tool's input, and a top-tier id is one carrying fable or mythos. While an
approval marker is in force, the stop guard refuses the first reply after the
serving model changes to a top-tier id unless its first line names the tier and
says whether the work needs it, once for each change, with the words to use
(LESSONS §434). `hook-dispatch.mjs` still refuses a send while a top-tier id serves the main
thread, in the dispatch gate (`dispatchGate`, `servingModel`), and that refusal
sets no latch, because the owner's switch of model answers it (the plans page's
list of refusals that set no latch names it). Step 58 of the redesign plan
removed `tierGate`, the earlier gate that refused an agent's send on that line
(LESSONS §459), because the plan's `## Cost` section names the tier of each step
and the cost instrument prints tokens by tier at the plan's close (Design parts 9
and 11), which answers the reason that gate was written. A plan that sends
agents states its run in a `## Cost` section, the pushes, the sends and the tier
of each step, and a plan that holds its commits for one push at its end names the
turns the environment's git hook will force (LESSONS §458, §469).

## 11d. Never start a process you are not going to manage. Every repo, forever.

Added 2026-09-10, on the owner's instruction, after it had to be said twice in
one session — and the second time the count was three: one real timer, one
waiter stuck for four hours, and eleven orphaned browsers.

**IF YOU START IT, YOU OWN IT UNTIL IT IS DEAD.** A background command, a
watcher, a poll loop, a browser, a subagent. Not "until it finishes" — until
you have CONFIRMED it is gone. A process nobody is managing is not free
because it is quiet; it holds memory, it clutters every listing the owner
reads, and worst of all **it makes the session unreadable from outside.** The
owner cannot tell a working walk from a dead timer, so the only way to find out
is to ask, and being asked is the signal this rule was already broken.

- **A TIMER IS THE LAZY ANSWER AND IT IS ALMOST NEVER THE RIGHT TOOL.** This is
 the half that was got wrong even while writing the rule: `sleep 900` was used
 four times in one session to wait on a CI run that could be READ with one
 query. A sleep waits a GUESSED interval and learns nothing about the thing it
 is waiting for — it is not an instrument, it is a delay with a number pulled
 out of the air. Reach in this order:
 1. **Nothing.** Query the thing when you next have a reason to touch it. A
 remote you can poll on demand needs no process at all, and the answer is
 fresher for having been asked later.
 2. **A condition, not a clock.** If you genuinely must be woken, wait on
 something REAL — a file appearing, an exit code, a status field — via
 whatever the harness gives you for that. It ends when the thing ends
 rather than when a guess expires, and it reports what happened.
 3. **A command that exits on the condition**, backgrounded, so one
 notification arrives and the process is gone. Never a bare interval.
 **And when the harness refuses a foreground sleep and names the better tool,
 that refusal is the instruction.** It was read as an obstacle here and routed
 around with backgrounded sleeps, which is the same failure as reaching for
 `--no-verify` because a hook said no.
- **AND THE WAITER IS ITSELF A PROCESS THAT REPORTS.** `sleep N; check` was used
 roughly fifteen times in one session, always backgrounded, always to look at a
 result that would still be there later — and each one is a task that COMPLETES
 and announces itself. They arrive minutes after the answer is already known,
 out of order, interleaved with real events, so the session fills with
 notifications about waits that are no longer interesting and the real ones
 become hard to pick out. That is precisely the cost the rule above names —
 the session becoming unreadable from outside — arriving by a route that felt
 like patience rather than like starting something.
 **Two of the three routes above cost nothing here and were available every
 time.** Checking on the next turn that touches the work (route 1) needs no
 process at all. A command that EXITS on the condition (route 3) was used
 exactly once in that session, to wait on a deploy — `for … if served == expected;
 then exit 0` — and it produced ONE notification, at the moment the deploy
 landed, saying what happened. That is the shape. A bare `sleep` before a `cat`
 is the shape to stop reaching for.
 **The test: if the thing you are waiting on will still be true when you next
 look, do not wait — look later.**
- **NEVER MANUFACTURE A STOPPING POINT. THE WORK STOPS WHEN THE QUEUE IS EMPTY
 OR THE OWNER SAYS STOP, AND AT NO OTHER TIME.** A session does not get tired,
 does not need a break, and has no standing to decide the owner has had enough.
 It ran out its useful work here and then spent replies going idle politely —
 "standing by", "nothing needs anything from you", "I'll leave the next call to
 you" — while a roadmap sat in NOTES.md with items on it and the owner waited,
 paying for the silence. **Judging that somebody has had enough for one day is
 not a session's call to make**, and dressing it as restraint makes it worse: it
 reads as consideration and functions as refusal to work.
 Two things this is NOT. It is not permission to start a sweep of your own —
 §11b still binds, and the queue is the queue, not an invitation to invent
 scope. And it is not an argument for silence: report what landed and start the
 next item IN THE SAME TURN, which is §11c, not a new rule.
 **When the named work is genuinely finished, the reply says what is left in the
 queue and takes the next item off it.** "Idle" is a state to report, once,
 while already working on something else.
- **NEVER REGISTER A LONG-LIVED PROCESS AS A TRACKED BACKGROUND TASK.** A file
 server, a watcher, a tail — anything whose normal state is "still running" —
 has no completion to report, so a harness that tracks background work shows it
 as IN FLIGHT for as long as it lives. That is not a cosmetic problem: the owner
 reads a pending task as work being done and WAITS ON IT. Two static servers
 were left registered this way and sat there for an hour, with nothing
 happening, while the owner held off continuing because the session appeared
 busy. The cost was entirely theirs and none of it was visible from inside.
 **A server is started, used, and killed inside the same piece of work** — by
 PID, not by pattern — or it is not started. If a background task genuinely must
 outlive one step, it exits on a condition so it completes and says why.
 **And "nothing is running" is a claim that has to be CHECKED, not remembered.**
 It was asserted here from a `ps` pattern that did not match the servers, thirty
 seconds before finding them. Check by PID listing, not by the grep you happen
 to have written.
- **A waiter must be able to exit.** `pgrep -f "foo"` MATCHES ITS OWN COMMAND
 LINE, so `until ! pgrep -f "foo"; do sleep; done` can never terminate. That
 exact loop has now been written in this family twice and stranded seven
 processes the first time and one for four hours the second. If you must poll,
 poll a FILE or an exit code, never a process name.
- **A browser is the worst offender.** A walk that dies between `launch()` and
 `close()` leaves Chromium reparented to init, and eleven of them survived
 eighty-two minutes here with nothing driving them. Every launch gets a
 `finally { await browser.close() }`, and a subagent told to drive a browser is
 told that too.
- **Sweep before you report.** Any turn that reports on long-running work also
 counts what is still alive and kills what is finished. `ps -eo etimes,args`
 costs nothing. Reporting "still running" without having looked is a guess.
- **A subagent is a process.** It can outlive its own answer — one here
 notified a second time, an hour after reporting, because a script inside it
 was missing `process.exit(0)`.

**And the honest accounting when asked is the whole point.** Say which are real
and which are junk, kill the junk in the same turn, and never let "three tasks
running" stand as if it meant three things were happening.
