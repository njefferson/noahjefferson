# CLAUDE.md — noahjefferson (the personal hub)

@plans/native/page.md

The line above loads the short page, which says what is wanted from a session, how a piece of work goes, and the never-rules. If it did not load, read `plans/native/page.md` first.

## What this repo is
The personal link hub at **noahjefferson.pages.dev** — photography accounts and
the free web apps. Static, self-contained, no build step. `public/` is the
deployed site; `.github/workflows/deploy.yml` deploys it to Cloudflare Pages on
every push to `main`.

## Branches & releases
`main` only (there is no `staging` for the hub). Push to `main` redeploys.
Editing `DOCTRINE.md` or this file is docs-only. Changing anything in `public/`
is a site change — verify the rendered page before pushing.

## What a session's hooks run
- `hook-dispatch.mjs` is the one dispatcher. It refuses the choice popup, runs `push-guard.mjs`, brings the hub's copy forward at a start, runs each repository's own hooks, and prints one line naming the short page and, at a start or a resume of a session that holds more than one repository, one line naming the repositories.
- `push-guard.mjs` lets a push reach only `staging` or `main`, and holds every push of either until a checker that changed nothing has passed that exact commit.
- `plan-guard.mjs`, `session-brief.mjs` and `plan-scope-check.mjs` are shells kept at their paths because other repositories call them.
- The gates that ran before 12 November 2026 are retired. Their pages are in `archive/`, kept as written, and no session loads them.
- The dispatcher also holds the main thread: until the standing pages are read at a start, under the owner's word (the word stop, or a message with no go-word, delivered or still waiting), after a refusal, and from doing the work itself or rewriting an approved page outside plan mode. `plans/native/running.md` says what each holds and what lifts it.
- The dispatcher refuses the button until a checker has walked the page as it stands. On the top tier it passes three calls: the walk, the hub's run script launched for an approved page, and a step of that page once the script has been launched.
- `stop-guard.mjs` refuses a final reply that names a feeling, promises conduct or asks for a go-word, or one that does not end with its state line, and `rules-keep-check.mjs` fails a commit that drops a line from a rules page.
- The dispatcher files every typed message of the session, whole, in the session scratchpad, keeps that file current, and after a compaction holds the main thread to reads until the file as it then stood has been read.

## Where things are
- `plans/the-plan.md`: where the hub's work stands: what is next, what is open, what has landed and what waits on the owner. It is made from `PROGRAM.md` by `node program.mjs stands --write` and is never edited by hand.
- `plans/native-setup.md`: the record of how the hub was rebuilt on 11 and 12 November 2026.
- `plans/hub-analysis.md`: why work kept coming back, the parts of the system that answers it, and the order they land in.
- `plans/native/`: the short page, the page on how sessions are started and run, the worker and checker roles, the three procedures, and what the new way cost.
- `REPOS.md`: the ten repositories, their branches and their deploy targets.
- `PROGRAM.md`: the ranked list of work across the hub and the apps, with the order its pieces are taken in. `program.mjs` writes it and prints where the work stands.
- `DOCTRINE.md`, `doctrine/never.md` and `doctrine/apps.md`: the standing rules in full, and the rules every app is built to.
- `HUB-REFERENCE.md`: the shared checks and how another repository calls them, the baseline every app ships, the cold read, patch notes and repository metadata.
- `LESSONS.md` and `lessons/`: the archive of what went wrong and what it cost. No session loads it; search it when a question is about history.
- `found/`: the record of findings. Nothing reads it as a queue.
- `SECURITY.md`, `PALETTES.md`, `METADATA.md`, `COLDREAD.md` and `ACCESSIBILITY.md`: reference pages.
- `archive/`: the retired pages, as they were written.
