# Noah Jefferson — Universal App Doctrine

The plans page was retired with the old gates on 12 November 2026 and is kept in the archive as written. The never page and the apps page stand. How work goes is the short page at plans/native/page.md.

The shared operating agreement for every Claude session on any of the owner's apps.
This is the SINGLE source of truth for the rules that are the same everywhere.
Each repo's own `CLAUDE.md` should hold only repo-specific facts and a one-line
pointer to this document — never re-state these rules (that is how they drift).

The apps this governs: photo-pointer, clear-horizons, Bird-location-scouting
(Frame), Jefferson-Photography-Studio, ND-toolbox, Quietkeep (in planning), and
the noahjefferson hub.
They deliberately share conventions.

## Before any work: the start check

- One repository is in this session, the app alone. If more than one is, say so once in the first reply: each repository's own roles, settings and instruction file did not load. Work already under way carries on.
- The hub's copy is at `/root/.claude/hub` and its dispatcher is wired. If it is absent, say so in the first reply: nothing guards a push in this session. Commit and push nothing until the owner has answered.
- What follows either way is on `plans/native/running.md`.

---

## The index

The three files in the `doctrine/` folder are the doctrine, and this file is the
index to them. The never-rules are on one short page, `doctrine/never.md`,
which the hub's instruction file points at. The plan rules are in `archive/doctrine-plans.md`, which the hub's instruction file points at. The rest, the product, taste, accessibility and release sections, are
in `doctrine/apps.md`, read when a plan item points at one. Every section number
cited anywhere in the hub is the number in the lines below.

- 0: Never use the AskUserQuestion / choice-popup tool. Ever. (doctrine/never.md)
- 0b: If you do not recognise the input, ASK — before doing anything at all (doctrine/never.md)
- 0d: THE HARNESS IS THE OWNER SPEAKING. A refusal from it is an instruction, never an obstacle. (doctrine/never.md)
- 0d: Personal words are not repo material — never quote, never attribute by name (doctrine/never.md)
- 0f: Do what the owner asked, and nothing more. (doctrine/never.md)
- 0c: Only NOAH decides what goes on the hub. Never a session. (doctrine/never.md)
- 9b: The owner's person is not repo material — a HARD gate, in EVERY repo (doctrine/never.md)
- 11: Standing facts about the environment (doctrine/never.md)
- 11b: The credit is the owner's money. Spend it like it is. (doctrine/never.md)
- 11d: Never start a process you are not going to manage. Every repo, forever. (doctrine/never.md)
- 0e: PLAN MODE ONLY, AND TALK DURING THE WORK. (archive/doctrine-plans.md)
- 0g: Act from the owner's goal and the record, and verify once. (archive/doctrine-plans.md)
- 2: Audience and working method (archive/doctrine-plans.md)
- 11c: An approved plan is standing authority. Do not stop at its seams. (archive/doctrine-plans.md)
- 11e: STOP BEFORE EACH NEW THING AND GO AND LOOK IT UP (archive/doctrine-plans.md)
- 11f: THREE ALTITUDES, AND THE RETURN TRIP IS THE ONE THAT GETS SKIPPED (archive/doctrine-plans.md)
- 12: Source-of-truth files (naming convention) (archive/doctrine-plans.md)
- 1: Product identity — what these apps ARE (doctrine/apps.md)
- 3: Taste (doctrine/apps.md)
- 4: Accessibility is a hard gate (top priority, owner mandate) (doctrine/apps.md)
- 5: Honesty (doctrine/apps.md)
- 5b: When a tool fails, diagnose it — never hand the owner the blame (doctrine/apps.md)
- 6: Verify before delegating or claiming (doctrine/apps.md)
- 7: Release discipline (doctrine/apps.md)
- 7b: Every app shows its version on screen (doctrine/apps.md)
- 8: Licensing — noncommercial, nobody sells the owner's work (doctrine/apps.md)
- 9: Privacy posture (doctrine/apps.md)
- 10: Repo metadata is a manual step — call it out and confirm, never assume (doctrine/apps.md)
- 13: Starting a new app (bootstrap checklist) (doctrine/apps.md)
- 14: When a fix fails — debugging discipline (the D5300 lessons, 2026-07-24/25) (doctrine/apps.md)
- 15: How we treat the services we depend on (doctrine/apps.md)
- 7c: A PUSH IS NOT DONE UNTIL THE REMOTE REF MOVED. READ THE RECEIPT. (doctrine/apps.md)
- 15b: "I CAN'T REACH THE NETWORK" IS ALMOST ALWAYS FALSE. PROVE IT BEFORE SAYING IT. (doctrine/apps.md)
- 15c: A DENIED HOST IS A QUESTION FOR THE OWNER, NEVER A FINDING. ASK FOR IT BY NAME. (doctrine/apps.md)
- 7d: Every app shows the reader WHAT CHANGED (doctrine/apps.md)
- 7d.1: "You" is the reader. There is no "I". Nobody is asked to send anything. (doctrine/apps.md)
- 7e: Every app has ONE information surface, and this is what is behind it (doctrine/apps.md)
- 7f: Ask for the DIAGNOSTIC, never for a screenshot (doctrine/apps.md)
- 7j: Every app carries a TEST PAGE, and a session BUILDS one rather than guessing (doctrine/apps.md)
- 7h: An app that caches itself CANNOT NOTICE it has gone stale (doctrine/apps.md)
- 7i: Multi-stage work carries a LIVE STATUS PAGE, and its link is handed over every time (doctrine/apps.md)
- 16: Security and the supply chain (doctrine/apps.md)

The web domains the doctrine names, each as it was spelled, and the section that holds it: noahjefferson.pages.dev in section 0c, pages.dev in sections 0c and 11, polyformproject.org in section 8, Recreation.gov in section 15, raw.githubusercontent.com in section 15b, and github.io in section 15b.
