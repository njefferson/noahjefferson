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
- Five holds run in every session. Each says in its refusal what it holds and what lifts it.
- The owner's word. A message with the word stop holds the main thread and every agent. Any other message that does not end with a go-word holds new starts on the main thread: sending an agent or a workflow, and writing a file. A message that ends with a go-word lifts either, and so does an approval at the button. The go-words are go, ok, continue, approved and yes. Why: without the hold the work goes on over a message and the message is never answered. Only the owner can say it was answered, which is what the go-word is.
- A refusal. After a hook refuses the main thread, only reads pass until the owner writes again. Why: another route to the same end puts the session's judgement above the control that refused it.
- The manager does no work. The main thread cannot edit a repository file, stage, commit or push. A worker does the step. Why: the top tier is paid for judgement, and the cheapest tier that holds the rules does the rest.
- The reply. A final reply past 150 words, or one that names a feeling, promises conduct or asks for a go-word, is refused. Why: the reader wants the end result, not what was done or how, and cannot read a long reply. A feeling is not the session's to name, a promise is words about a later turn, and a go-word is the owner's to give.
- Nothing lost. A commit that removes or rewords a line of a rules page fails unless the line stands on another rules page or is listed in plans/rules-released.md with why. Why: on 12 November 2026 a rebuild meant to make the hub lighter dropped rules it was meant to keep, and nothing showed it.

## Mode

- Plan mode for the scope, because it gives the approve button.
- The run after approval in a mode that does not ask before each edit.
- Accept edits only when a session says it needs a write under a repository's .claude folder, and the session says when the last such write is done.
- Approval is only the button. A typed word approves nothing. A restart of the session's process that closes an approval request nobody answered is the harness's own, and the page is put up again.

## Model

- The worker and the checker carry their own tier, so the steps cost the same whatever serves the main thread. The main thread costs what it runs on.
- The top tier is for the scope and for a surprise that needs judgement; a lower tier holds the run after approval.
- A session cannot change its own model, and says plainly when the work in front of it does not need the top tier.

## What updates by itself

At every start and resume the hub's copy in the container is brought forward from the hub's main, with the short page, the roles, the procedures, the push guard and the dispatcher.

## What does not

- An app's CI runs the hub's checks at the hub commit that app pins, and moves when that pin is moved.
- The setup script's text is stored on each environment and changes only by a card in a session of that environment.
