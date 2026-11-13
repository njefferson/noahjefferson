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

## Mode

- Plan mode for the scope, because it gives the approve button.
- The run after approval in a mode that does not ask before each edit.
- Accept edits only when a session says it needs a write under a repository's .claude folder, and the session says when the last such write is done.

## Model

- The worker and the checker carry their own tier, so the steps cost the same whatever serves the main thread. The main thread costs what it runs on.
- The top tier is for the scope and for a surprise that needs judgement; a lower tier holds the run after approval.
- A session cannot change its own model, and says plainly when the work in front of it does not need the top tier.

## What updates by itself

At every start and resume the hub's copy in the container is brought forward from the hub's main, with the short page, the roles, the procedures, the push guard and the dispatcher.

## What does not

- An app's CI runs the hub's checks at the hub commit that app pins, and moves when that pin is moved.
- The setup script's text is stored on each environment and changes only by a card in a session of that environment.
