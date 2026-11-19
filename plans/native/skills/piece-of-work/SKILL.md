---
name: piece-of-work
description: How the managing session takes a piece of work from the owner's request to a checked result.
---

This is for the session that manages. The session plans, sends and judges; workers do the steps.

1. Scope the work on one page with five parts: the result as something that can be seen, how it is checked, the steps, the cost, and the way back.
2. Put the page to the owner for approval once. After approval the work runs to its end without further asking.
3. Send workers for the steps, each on the cheapest tier that holds the rules. A worker is told the page and its step, nothing more. Steps that touch different files run together. Workers that run together stage nothing and commit nothing, and one worker stages and commits after them.
4. Before anything is pushed, send a checker that did none of the work. It opens the real output and answers CHECK PASS or CHECK FAIL for the exact commit. On a fail, a worker fixes what the checker named and the checker looks again.
5. The first look before a build reaches a device is the checker's, in the container, as the page's result says.
6. Bring back to the owner only a choice that is the owner's, with the recommended option first. A defect with a known fix is fixed, not asked about.
7. At the end give the result and what the check showed, in California time, ending with the state line. A workflow run still running when it was read is named in the state line and read again at the next turn.
8. Where the harness or a hook refuses something, stop that route, say plainly what was refused, and do not try another way to the same end.
9. A question from the owner is answered and changes nothing. The approved page stands until a change to it is written in full and approved.
10. When work stops on something only the owner can do, state it as a need and never as a choice: work is stopped, what is needed and where it is done, why, what it holds up, and what is not known.
11. From the first uncommitted change to the push, the session that manages starts no other work. It ends a turn only while a worker or the checker it sent is still running, and that agent's end brings it back. The commit, the checker and the push follow one another, so a stop hook that asks for a commit and a push is answered by finishing them. Why: the harness moves a long worker to the background and gives no way to wait inside the turn.
12. Write each step as a list that cannot be done wrong: what it depends on, exactly what to do and with which commands, what must be seen for it to be done, and what ends it. Before the page goes up, read each step as its worker will meet it, with only the role's tools, the pages the role sends it to and the step's own words.
13. When a step ejects, or a hand-back names a gap in the page, stop the run and bring it back on the top tier. Before the page is changed, find the cause: what the step met, why the page was drawn that way, and how far that cause reaches, whether to this step, to the whole page or to every page. The changed page opens with those. Where the cause reaches past the page, it carries one recommendation for that cause, to be made a page of its own. A patch of the page alone is not an answer to an eject.
14. Before a page is drawn, read what each gate on its route asks of a step, and draw each step to it. Before the page goes up, read each step against the list below. Why: three stops of one piece of work, on 17 and 18 November 2026, came from a page drawn from what the work needed and not from what its gates ask.
    - A worker is held by the agent rules. Its step gives what it depends on, what to do, every command in the order it runs, what must be seen, and what ends it.
    - A step that edits a file the suite covers searches the suite and the case files for the cases and planted failures that hold the old behaviour, reads the listing that names a stale planted failure, re-points each and runs it by its key, and runs the whole suite once after its last edit. An edit it needs in a file another step owns is named in its report, with the file and the exact words, and the landing step makes it.
    - A landing in the hub follows the hub's own landing procedure: the fetch and the rebase, the eight checks, the suite and every planted failure where code changed, the filing of what was found, and the commit. The fetch and the rebase come before the first edit, because a rebase needs a clean working copy. A landing in another repository follows the shared landing procedure, with the checks that repository's own instruction file names.
    - A checker writes nothing but a file it needs for a check, in the session's scratchpad. Why: the push guard counts a pass only from a checker whose record holds no call of a writing tool on any other file, and no git add, git commit or git push.
    - A push is one worker's step, after the checker's pass for that exact commit, with the remote's head read first.
15. A run starts at a typed message that asks for the run. A message that asks for something else is answered first, and nothing is sent on it. Why: the harness's own check judges a send against the typed messages, and refuses one that was not asked for.
16. A cause found at a stop is filed as a finding by the next worker step, so that it has a key and a place in the ranked list: in the hub with the list's own tool, as the hub's landing procedure gives it, and in another repository as a line of the found queue in its notes. Why: a changed page opens with its cause, and the next change of the page writes over it.
