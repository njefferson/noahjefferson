# How sessions are started and run

This page answers the operating questions, and any session in any repository answers them from here.

## Starting a session

- One repository for each session: the app alone, in its own environment. The hub is not picked beside it.
- The hub's own session is the hub alone.

## Sessions already running with two repositories

- They are left to finish their work. A session's repositories are fixed when it is made, so none is converted.
- The next session for that app is started alone.

## Once for each app, the move

- The move is done at the app's first session started alone, by the procedure plans/native/skills/app-move/SKILL.md. It is done once, not in every session.
- The session offers it when the app's instruction file still describes the retired gates, and being asked to move the app starts it.
- The owner's part is one approval card, which puts the setup script on the app's environment.
- An app not opened for a long time needs nothing until it is next opened.

Where the hub is not in the container yet, this one line starts the move:

```
Move this app to the hub's new way: follow plans/native/skills/app-move/SKILL.md in njefferson/noahjefferson.
```

## A new app

Its first session is started with the new repository alone, and section 13 of doctrine/apps.md places the setup script on its environment by one card.

## When a session is started wrong

- Two repositories in the session: the dispatcher prints one line at the start and at each resume, naming them. None of them loaded its own roles, settings or instruction file. The work under way is finished there, and the next session for that app is started alone.
- The hub absent from the container: the session says so in its first reply, and commits and pushes nothing until the owner has answered, because nothing guards a push there. What follows is the one line above that starts the move, or the session started again in the app's own environment.
- A session with no hub that reads none of its instructions is told by nothing.

## When a session is locked

- There is no stand-down. The hub's hooks run in every session, and nothing frees a session from them; the stand-down file was deleted on 12 November 2026.
- What can still lock a session: when the push guard fails to run, the dispatcher refuses every tool that is not a read, and says so in its refusal line, until the guard is fixed. The hub's copy is brought forward from the hub's main at every start and resume, so a commit on main that breaks the push guard reaches every session at its next start or resume, and a locked session cannot write or push its own fix.
- The way out: revert the hub's commit on GitHub, then resume the session. The resume brings the reverted main into the container, and the session has its tools again.
- The holds below run in every session. Each says in its refusal what it holds and what lifts it.
- The owner's word. A message that is the word stop by itself, or that has it as a whole sentence, holds the main thread and every agent. Any other message that does not end with a go-word holds new starts on the main thread: sending an agent or a workflow, and writing a file. A message that ends with a go-word lifts either, and so does an approval at the button. The go-words are go, ok, continue, approved and yes. Why: without the hold the work goes on over a message and the message is never answered. Only the owner can say it was answered, which is what the go-word is.
  - The hold also reads a message that is still in the queue and not yet delivered, and its refusal prints that message so that it can be answered. While it waits nothing lifts it; a later typed message that ends with a go-word, or an approval at the button, lifts the hold once it is delivered. Why: a message that waits unseen while the work goes on is a message never answered.
  - The session's own entry to plan mode is held under either. A page is drawn after a message that ends with a go-word, or when plan mode is set in the app, which is not held. Why: plan mode set in the app is itself the ask for a page, and a page nobody asked for costs a turn of the top tier.
  - Under the word stop the button is refused, and a plan file can still be written in plan mode. Why: under a stop nothing goes up, and what was being thought is not lost.
  - The word stop holds everything only by itself: as the whole message or as a whole sentence of it, in any case, said once or several times. A sentence ends at a full stop, an exclamation mark, a question mark or the end of a line. With another word beside it in its sentence it is not the word stop, and the message is read as any other. Why: in one session, on 20 and 22 November 2026, messages that held the word among other words held work that was meant to go on, and none of them was the word by itself.
  - A halt asked for in other words is read as any other message with no go-word: the main thread starts nothing new, and agents already running go on. Where the message asks that running work be halted, the session's first call is TaskStop of that work, and its reply says what was stopped. Why: the hold cannot tell a halt from the word used of something else, so the hold takes only the word by itself, and the rest is the session's to read.
  - Under the word stop an agent's write of its own report, a file in the progress folder of the session scratchpad, passes. Why: on 20 November 2026 a step that the hold stopped in its middle could not write what it had made, and its record was behind its work.
- A refusal. After a hook refuses the main thread, only reads pass until the owner writes again. Why: another route to the same end puts the session's judgement above the control that refused it.
- The manager does no work. The main thread cannot edit a repository file, stage, commit or push. A worker does the step. Why: the top tier is paid for judgement, and the cheapest tier that holds the rules does the rest.
  - A write of a file under ~/.claude/plans/ passes only in plan mode, where the button follows, and is refused outside it. Where the harness names no mode for a call, the write passes as before. Why: an approved page is changed only by a change that is written and approved.
- The run waits for its tier. On the main thread, sending an agent or a workflow is refused while a top-tier model serves, but for three calls: in plan mode, the checker sent a page's path and the word walk; outside plan mode, the hub's run script launched for a page that stands as it was approved; and, once that script has been launched for the page, a worker or a checker sent the page's path, the word step and the step's number. The refusal names the three and gives the line that puts the thread a tier lower, typed alone while the thread is idle. What lifts it: one of the three calls, or the change of model. Why: the top tier is paid for judgement, and a run needs none. The script carries the run on the cheapest tier, so the top tier spends two turns on it and no model command is typed.
- An eject. When a worker's hand-back opens with the word EJECT, nothing more is sent until a plan is approved at the button. The button is refused while the page does not open with a part headed Why it stopped, whose lines open What was met, Why the page was drawn that way and How far it reaches. Why: a page that a finding has made outdated is not run on, and a patch of the page alone is not an answer to an eject.
- The tier of a send. A send that names a model above the sonnet tier is refused, and goes again with none named. Why: the roles carry their tier.
- A walk before the button. In a repository whose checker's role says what a walk is, the button is refused until a checker that changed nothing has walked the page as it stands and answered CHECK PASS with the page's content id. The walk is sent in plan mode, the checker with the page's path and the word walk, and it passes on the top tier, under a typed message with no go-word and while an eject stands. What lifts it: a walk that passes the page as it stands, or a typed message that carries the words without a walk. A repository whose checker's role does not speak of a walk is not held, because its checker could not answer. Why: a page's writer does not find what its worker finds, and between 17 and 19 November 2026 each defect of a page was met by a worker in the middle of a run and cost a return.
- A decision before the button. The button is refused until a typed message that ends with a go-word has come after the page's last write. The session briefs the page in one reply that says what it does and why and asks nothing, ends its turn, and puts the page to the button at the go-word that follows. A page changed after that go-word is briefed again. What lifts it: that go-word, and nothing else. Why: on 20 November 2026 a page went to the button on a go-word given before the page was drawn, and the decision is made on a brief of the page as it stands.
- The reply. A final reply that names a feeling, promises conduct or asks for a go-word is refused. No count sets its length: it holds what the owner needs to see, neither padded nor cut down, with the result first and not what was done or how. Why: a feeling is not the session's to name, a promise is words about a later turn, and a go-word is the owner's to give. Until 23 November 2026 a reply past 150 words was refused, and the count cut what was needed into fragments.
  - A final reply whose last line does not open with State and say finished, paused or running is refused as a fifth fault. Why: the reader must be able to tell at once whether the work is finished, paused on something, or still running.
- Nothing lost. A commit that removes or rewords a line of a rules page fails unless the line stands on another rules page or is listed in plans/rules-released.md with why. Why: on 12 November 2026 a rebuild meant to make the hub lighter dropped rules it was meant to keep, and nothing showed it.
- The read at a start. After a start, a clear or a compaction the main thread may only read until the short page, doctrine/never.md and doctrine/hub.md have each been read whole, in the hub's copy or in a checkout of the hub. After a resume the read is due only where the session has not made it since its last start or compaction. Workers and checkers are not held. Only reads pass, and TaskStop on the main thread. What lifts it: the three reads. Why: a session that has not read the rules cannot follow them, and every other rule rests on this one.
  - After a compaction the typed messages are due as well. The dispatcher files every typed message of the session, whole and in order, at `recall/typed-messages.md` in the session scratchpad, and keeps that file current by adding to its end: at every start, at every typed message, and before an agent or a workflow is sent. A start writes the file whole only where it is not there, and nothing takes a filed message out of it, so a record that no longer holds the session's first messages leaves them in the file. After a compaction only reads pass until the file as it stood at that compaction has been read whole. A message typed later is in the conversation and is never due, and a resume makes nothing due. It holds nothing where the file is not there. Why: a summary loses the intent, and the typed messages are where it is. On 23 November 2026 a start wrote the file again from a record that had been cut, and 168 messages left it.

## Mode

- Plan mode for the scope, because it gives the approve button.
- The run after approval in a mode that does not ask before each edit.
- Accept edits only when a session says it needs a write under a repository's .claude folder, and the session says when the last such write is done.
- Approval is only the button. A typed word approves nothing. A restart of the session's process that closes an approval request nobody answered is the harness's own, and the page is put up again.

## Model

- The worker and the checker carry their own tier, so the steps cost the same whatever serves the main thread. The main thread costs what it runs on.
- The top tier is for the scope and for a surprise that needs judgement; a lower tier holds the run after approval.
- A session cannot change its own model, and says plainly when the work in front of it does not need the top tier.
- No change of tier is needed for a run: the thread stays on the tier it is on, and the run script carries the run on the cheapest tier. A page is drawn on whatever tier serves the thread, which is the owner's switch, and no page waits for a tier. Where the tier is changed, it is by the model command typed alone while the thread is idle. A change made with the app's picker while a message waits can be dropped. A session stops and asks at the one point the hold on a run names, and ends its turn so that the thread is idle.

## What updates by itself

At every start and resume the hub's copy in the container is brought forward from the hub's main, with the short page, the roles, the procedures, the push guard and the dispatcher.

## What does not

- An app's CI runs the hub's checks at the hub commit that app pins, and moves when that pin is moved.
- The setup script's text is stored on each environment and changes only by a card in a session of that environment.
