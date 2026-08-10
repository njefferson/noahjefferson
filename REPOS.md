# REPOS.md — what exists, and how each one works

**This file did not exist until 2026-08-10, and its absence is why sessions kept
asking questions that had already been answered.**

A session starts with no memory. The only file loaded automatically is
`CLAUDE.md`. Nothing anywhere named the repos in this family, so "which repos are
there" had nothing to be read *from* — the six below were discovered by grepping
`LESSONS.md` for `GATE <repo>:` citations, which is an accident of how lessons
cite their gates rather than a design.

**Keep this current. It is loaded into every session by the SessionStart hook**
(`.claude/hooks/session-start.sh`), which is the difference between a fact being
written down and a fact being known.

Where a line says **unknown**, it is unknown — not assumed. A guess here becomes
a session's confident wrong answer.

---

## njefferson/noahjefferson — the hub

- **What:** the personal link hub, and the home of the shared doctrine, lessons,
  palettes and every cross-repo gate.
- **Branches:** `main` only. There is no staging. Push to `main` redeploys.
- **Deploys to:** https://noahjefferson.pages.dev
- **Owns:** `DOCTRINE.md`, `LESSONS.md`, `PALETTES.md`, `SECURITY.md`,
  `METADATA.md`, and the gates every sibling runs with `--repo ../app`.
- **Branch guard:** installed. `work=main`, nothing else permitted.
- **Also hosts** the shared accessibility statement at `/accessibility`, which
  every app's About screen links to.

## njefferson/Quietkeep

- **What:** a free, local-first planner for neurodivergent users. Static PWA,
  IndexedDB via Dexie, append-only event log, no accounts, no telemetry.
- **Branches:** `staging` and `main`. Every product change lands on `staging` and
  waits for the on-device pass and an explicit "promote" (Doctrine §7).
- **Deploys to:** https://quietkeep.pages.dev (main),
  https://staging.quietkeep.pages.dev (staging).
- **Second edition:** Quietkeep Sync — https://quietkeep-sync.pages.dev and
  https://staging.quietkeep-sync.pages.dev, built from the same tree by
  `tools/editions.mjs`.
- **Branch guard:** installed. `work=staging`, `promote=main` via
  `QUIETKEEP_PROMOTE=1`.
- **Gates wired in CI:** the full Spine, plus the hub's `privacy-check.mjs` and
  `privacy-mirror-check.mjs` checked out and run.
- **The §7e baseline is complete here** — the ⓘ, first-run orientation, patch
  notes from one source, the text diagnostic, and the stale-app offer.

## njefferson/fauxplane

- **Deploys to:** https://fauxplane.pages.dev
- **Branches:** unknown — read that repo's `CLAUDE.md` before assuming.
- **Branch guard:** NOT installed.
- **Known:** the §7e baseline is complete (2026-08-03). Its `checkUpdateStrip`
  drives a REAL second worker and is worth copying. It is the repo that pushed
  four releases which never deployed (LESSONS §53).
- **Owes:** the privacy CI step, and the branch guard.

## njefferson/3d-printing-pal

- **Deploys to:** https://3d-printing-pal.pages.dev
- **Branches:** unknown — read that repo's `CLAUDE.md` before assuming.
- **Branch guard:** NOT installed.
- **Owes:** the §7e baseline (ask its NOTES first), the privacy CI step, and the
  branch guard.

## njefferson/intersecting-parallels

- **Deploys to:** unknown.
- **Branches:** unknown — read that repo's `CLAUDE.md` before assuming.
- **Branch guard:** NOT installed.
- **Known:** the §7e baseline is complete (2026-08-03). Patch notes generated
  from CHANGELOG.md with a drift gate, worth copying. Its a11y gate is cited by
  LESSONS §28.
- **Owes:** the privacy CI step, and the branch guard.

## njefferson/photo-pointer

- **Deploys to:** unknown.
- **Branches:** unknown — read that repo's `CLAUDE.md` before assuming.
- **Branch guard:** NOT installed.
- **Known:** cited by LESSONS as owning `scripts/check-etiquette.mjs`.
- **Owes:** the §7e baseline (ask its NOTES first), the privacy CI step, and the
  branch guard.

---

## What every sibling still owes

One line each, so it is not a memory test:

- **The branch guard** — `node ../noahjefferson/branch-guard.mjs --repo . --install`
  after writing a `.branch-guard`. Four repos are unguarded.
- **The privacy CI step** — the hub's `privacy-check.mjs` and
  `privacy-mirror-check.mjs` run in CI, per Doctrine §9b. Only the hub and
  Quietkeep have it.
- **`doctrine-sync.mjs --repo .`** run FIRST in any sibling session, and
  `--adopt` only after the drift is actually read.

## The rule this file is under

If a session learns a fact about a repo that it had to go looking for — a branch
model, a deploy URL, which gates are wired — **it belongs here**, in the same
session that learned it. The cost of not writing it down is not abstract: it is
the owner being asked the same question again.
