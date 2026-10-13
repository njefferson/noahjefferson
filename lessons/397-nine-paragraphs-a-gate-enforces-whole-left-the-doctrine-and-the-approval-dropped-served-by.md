## 397 · Nine paragraphs a gate enforces whole left the doctrine, and the approval stopped counting the line that maps steps to goals as part of the goals

**Enforced by:** GATE hub:session-guards.test.mjs — a case fails when a line of the doctrine that says a gate enforces a paragraph whole names a file the hub does not have, and two cases on the approval's scope, each watched failing with its plant first, fail when the Goals hash counts the Served by line again, stops counting any other line of the Goals, or stops accepting a marker recorded before the change, and a case fails when the choice popup tool is passed by plan mode, the manager fence, the plan fence or the approval guard

**Recorded 2026-10-13.** The plan that prepared the pruning list (lesson 396) ended with two choices, and the owner took the recommended option of each. This lesson records both, and holds the nine paragraphs the first one took out of the doctrine.

**The first choice: nine paragraphs left the doctrine.** The doctrine is read in full at every startup, and each of these nine was a paragraph whose every demand a gate already refuses, so every start paid for reading text the session does not need in order to be held to it. Each is now one line in its place, `*Enforced whole by:*` and the gate, and the paragraph is below as it stood, with only the indentation it had under its rule taken off. Six other paragraphs that the list held as enforced whole carry a judgement call in the list, and stay as they are: the running agent that does not hold the turn, held work and the messages the harness never delivered, the manager fence and the dispatch gate, the refusals that do not latch, the push rule, and the doctrine read at every start.

**The second choice: the goals the owner approves are the goals, and not the line that maps steps to them.** The approval marker recorded one hash of the whole Goals section, and the `Served by:` line sits inside that section. A step added to the plan, or a step renumbered, has to be named on that line before the dispatch gate will send it, so a plan that needed one more step edited a hashed line and voided its approval, which cost the owner a button for the one change a plan is meant to take in its stride (found after the approval's scope was built, and queued). The Goals hash now reads the section without its first line that begins `Served by:` (`goalsWithoutServedBy` in `report.mjs`). Every other line of the Goals, the numbered goals above all, is still hashed, and so is a second line that begins the same way, so the exemption cannot carry another edit past the approval. A marker recorded before this change holds the hash of the whole section and still matches while the whole section stands, so a plan approved before the change keeps its approval and its amendments; the first amendment records the new kind of hash. Until then an edit of the `Served by:` line under such a marker counts as an edit of the Goals, because the marker has nothing finer to compare it with. The dispatch gate still refuses a step that the line does not name.

**And one gap found on the way: nothing refused the choice popup.** The doctrine's first rule bans the tool, and the pruning list found no gate behind that rule. `plan-guard.mjs` listed it among the reads it passes, and the manager fence, the plan fence and the approval guard all ask `plan-guard.mjs` what a read is, so every one of them passed it: fed the tool on the main thread in plan mode and outside it, and in an agent, with a plan approved and with none, thirteen runs of thirteen passed. The tool is off that list now, so plan mode refuses it, the manager fence refuses it on the main thread, the plan fence in an agent, and the approval guard where no plan is in force. A case holds each of them, with a plant that puts the tool back on the list.

**What each looked like from inside.** Nothing was wrong with a paragraph that described a refusal, and nothing was wrong with hashing the whole section: each was right when written. The doctrine only grew because nobody was asked to carry the cost of removing text, and the approval was only strict about a line because the line was in the section.

**The general form.** Hash what the owner approved and nothing around it, and keep one line for a rule that code holds. Bookkeeping that moves with the work, and prose that restates a refusal, each make the thing they sit in cost more than the thing is worth.

**The nine paragraphs as they stood, with the gate that now holds each:**

**1. A different command, tool or wording for the same end is a second route (section 0d).** Held whole by `hook-dispatch.mjs` and `plan-guard.mjs`. As it stood:

**A different command, tool or wording aimed at the same end as a refused call
is a second route to that end, and it is refused the same way.** The refusal
latch (§0e rule 14) refuses it: after a refusal, every call but the main
thread's status command and `TaskStop` and an agent's own return is refused
until the owner's next message.
A plan's wording is held the same way. `plan-guard.mjs` records each name it
refuses in a plan, with the time, and `ExitPlanMode` stays refused until that
name appears in a tool result read after the refusal or its plan line marks it
"(new)"; rewording the plan or dropping the name clears nothing.

**2. A turn that ends with steps of the approved plan left is a return to the owner, and it is refused (section 0e rule 2).** Held whole by `stop-guard.mjs`. As it stood:

**A turn that ends with steps of the approved plan left is a return to the
owner, and it is refused.** An approved plan is the instruction for all of
it (§11c), and it runs to its end through agents with nothing coming back
to the owner but a status at each agent's end and a choice only the owner
can settle. Measured 2026-10-04: nothing refused a turn that ended with
steps left and no agent running, so the work waited for the owner's next
message. *Enforced by:* `stop-guard.mjs`. With an approved plan in
force (its file still matching the hash recorded at approval), it reads the
pointer N (above) from the plan's `## Order` and the agents the session sent,
each prompt naming its step, and refuses the stop when N is not none, no
agent the session launched is running, and the reply neither opens with a
choice for the owner nor declares the stop in its first line with what is
open, "Stopping here: open for you is" and then what. A REFUSED or FAILED
hand-back leaves N where it is, so the main thread sends the same step
again. A plan with no `## Order` keeps the older count: its `## Steps`
numbers, a step returned when an agent ended by a report for it. The main
thread then sends the next step, or the same step again, instead of ending.
A choice opens a reply when its numbered options carry the recommended
marker within the first two lines (§2). A waiting owner message, a stop
standing (rule 3), a correction standing where the plan has no review step
(rule 3 then refuses every other call, so a refused stop would leave no
move) and a standing latch let the stop through, and a session whose plan or
agents cannot be read is not refused. Where the plan has a review step a
correction leaves a move, the review and then the step it clears, so the
turn that answers the correction does not end the work, and the refusal
names the step the current review cleared, or the review step.

**3. One word stops everything (section 0e rule 3).** Held whole by `hook-dispatch.mjs` and `pending-guard.mjs`. As it stood:

**One word stops everything.** An owner message that carries the whole
word stop ANYWHERE in it, first, second or last, and does not end with a
go-word is a stop, and it holds
every call, the main thread's and every agent's, a step a review cleared
included, until a later message ends with a go-word; what passes is the
status command, `TaskStop`, an agent's own
return and, on the main thread, a read of the record. A plain message typed
after the stop does not lift it, and a message that carries the word and
also ends with a go-word is a go message and not a stop. The refusal does
not latch, and it is lifted by the go-word and nothing else. Only the whole
word counts ("stopped" and "stops" do not). The first version took the
word only as a message's first word, and a halt message that puts it second
would have stopped nothing.
Both holds are read by `ownerHolds` and `holdsIn` in `hook-dispatch.mjs`,
and the stop by `stopStanding`, which the stop guard reads too. A stop used to
stop agents only while its message was still queued
(`pending-guard.mjs`, which still reads a queued message by its first word),
and nothing held them once it had been delivered.

**4. The approval holds the plan's Goals, Asked, Files and Commands, and the Steps and the Order may be amended (section 0e rule 13).** Held whole by `approved-plan-guard.mjs` and `report.mjs`. As it stood:

**The approval holds the plan's Goals, Asked, Files and Commands as the
owner approved them, and the Steps and the Order may be amended without
coming back.** The marker records a hash of each of the four sections
(`scopeHashes` in `report.mjs`, read through the one `planSection` every
gate shares). *Enforced by:* `approved-plan-guard.mjs`. A Write, Edit or
MultiEdit on the approved plan by the main thread passes when the text it
would leave has those four sections unchanged, and its PostToolUse
`--amend` then re-reads the real file and moves the marker's hash to the
file's only if the four still match: if the simulation was wrong, or the
re-read does not run, the marker keeps the old hash and no plan is in force,
which every gate refuses on. An edit to any of the four is refused naming
them, and the plan goes back through plan mode and the owner's button. An
agent never amends the plan, an edit that cannot be simulated is refused,
and a marker written before the scope was recorded keeps the whole-file
rule. The status prints which of the four changed. An amended step is
cleared by a fresh review before it goes (rule 2), because the plan's last
write makes every earlier review stale.

**5. A plan points at one rules file instead of copying it (section 0e rule 13).** Held whole by `hook-dispatch.mjs` and `plan-guard.mjs`. As it stood:

**A plan points at one rules file instead of copying it.** The rules every
agent follows were copied into each plan, and the copies drifted.
`agent-rules.md` at the hub root carries them, with a decimal `Rules version:
N` line, and an agent reads it by the path
`/root/.claude/hub/agent-rules.md`; the main thread can read it too
(`recordPath`). A plan that sends agents has a `## Rules` section that is the
line `Rules: /root/.claude/hub/agent-rules.md, version N.` or holds every
rule line of the file, whole: a copy may add rules and may never take one
away. *Enforced by:* `rulesProblem`, which `plan-guard.mjs` calls at
`ExitPlanMode`, and `rulesGate`, which refuses a step while the version the
plan pins is not the file's. That refusal does not latch (rule 14): the
remedy is to read the file and amend the Rules line, an edit that keeps the
approval because Rules is not one of the four approved sections, so moving to
a new version is the manager's act and the file itself changes only through a
released commit. A decimal version pins the pointer because a hash would have
to be written by an agent, which writes no hex.

**6. Agents are held by the plan fence (section 0e rule 13).** Held whole by `plan-fence.mjs`. As it stood:

Agents are held by `plan-fence.mjs`, over every tool they call. A call
passes only as the agent's own return, its own `TaskStop`, a read, or a
write or Bash line inside the plan. A write lands only under a path the
plan's Files list names for that repo (a line's label, such as Hub or JPS,
ties its entries to one repository), under an absolute path it names, or
in the session scratchpad, and never in the live gate copy at
`~/.claude/hub`. A Bash line is split wherever a new command starts,
inside `$( )`, backticks, `sh -c` and `eval` too. A `cd`, `pushd` or
`popd` at any depth is refused, because every path is written in full; a
leading `git -C <dir>` is set aside; and each segment must then be a
reader or begin with an entry of the plan's Commands. A redirect is held
to the same rule as a write, and process substitution is refused. A write
or a redirect to `/dev/null`, `/dev/stdout` or `/dev/stderr` always
passes.

**7. No cd holds on the main thread either (section 0e rule 13).** Held whole by `hook-dispatch.mjs` and `plan-guard.mjs`. As it stood:

**No `cd` holds on the main thread too.** The manager fence passes a Bash
line there only when `plan-guard.mjs` classifies it as a read, and `cd`,
`pushd` and `popd` are not among its readers, so the fence refuses them;
in plan mode `plan-guard.mjs` refuses them itself.

**8. The latch's enforcement and the approval pressed in the app (section 0e rule 14).** Held whole by `hook-dispatch.mjs` and `approved-plan-guard.mjs`. As it stood:

*Enforced by:* the refusal latch in `hook-dispatch.mjs`. Every PreToolUse
refusal, by the manager fence, a family guard, a repo's hooks or the
dispatcher's own failure, writes a latch, except seven: the status gate's
(`report.mjs --gate`), after which the status stamps the clock and the
refused call may run; `pending-guard.mjs`'s, which holds the call and
prints it at the top of the turn that delivers the message; the stop hold's
and the correction check's (rule 3), which the owner's next message lifts;
the state page gate's (`pageGate`, rule 2), which reading the page clears;
the review gate's (`reviewGate`, rule 2), whose three remedies are a send,
an amendment and entering plan mode; the rules gate's (`rulesGate`, rule 13),
whose remedy is an amendment of the Rules line; and the in-app
approval check's (`approved-plan-guard.mjs --app-exit`, run on the main
thread's `EnterPlanMode`). The latch's own refusal does not write one
either, so it can never move the time an owner message has to come after.
The in-app approval check refuses while the approval recorded from the
owner's exit stands and nothing but reads has happened since.
`approved-plan-guard.mjs` records that approval from the harness's own
plan-mode exit entry when no `ExitPlanMode` call of the session's was
approved since plan mode began, hashing the plan file at that moment, and
records none when the file was written after the exit; each exit entry is
judged once. THE DISPATCHER JUDGES THE OWNER'S NEWEST EXIT FIRST: before
the latch, the manager fence, the dispatch gate or the plan fence reads the
approval marker, `hook-dispatch.mjs` runs `approved-plan-guard.mjs
--judge-exit`, which records the marker from that entry when it is the
owner's and never refuses. Judged only among the family guards below them,
the exit came too late for a first call after it that was the sending of an
agent: the dispatch gate refused on the old marker and the exit was never
judged (measured 2026-10-04 at 05:12).

**9. A refusal cannot take back the reply it refuses (section 11c).** Held whole by `stop-guard.mjs`. As it stood:

**A refusal cannot take back the reply it refuses.** A `Stop` refusal arrives
after the reply was written, and the owner has already seen it, so all the
refusal can do is hand the complaint back: whatever the session writes next
arrives as a SECOND reply. Measured 2026-10-04: two refusals, each for one
sentence, and the whole reply was sent again both times. So every refusal now
ends by saying that what the session writes next is the corrected sentences
only, and that it must not send the reply again. When the guard runs again in
the same turn it refuses a follow-up that repeats lines or sentences of the
refused reply, counting only those of thirty characters or more, because
"Done." and a list marker recur in any two replies. It does that once per turn,
so it cannot loop, and only for a refusal newer than the owner's last message.
Corrected sentences, a follow-up of tool calls with no text, and a repeat from
an earlier turn pass.
