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

- **Deploys to:** https://fauxplane.pages.dev, and `staging` to
  https://staging.fauxplane.pages.dev
- **Branches:** `staging` and `main`. Staging is a HARD release gate — every
  product change lands there and waits for the on-device pass; `main` only on an
  explicit promote. The harness's `claude/*` branch is ignored.
- **Branch guard:** installed 2026-08-20. `work=staging`, `promote=main` via
  `FAUXPLANE_PROMOTE=1`. `package.json` reinstalls it on `npm ci`.
- **Gates wired in CI:** `deploy.yml` checks the hub out and runs
  `privacy-check.mjs`, `quote-check.mjs` and `branch-guard.mjs --artefact`. Its
  own `npm test` (583) runs there too; the accessibility gate does NOT — it needs
  a browser the runner would have to download, and is run locally before a push.
- **Known:** the §7e baseline is complete (2026-08-03). Its `checkUpdateStrip`
  drives a REAL second worker and is worth copying. It is the repo that pushed
  four releases which never deployed (LESSONS §53) — and the repo whose privacy
  gate read green while it carried roughly sixty attribution sites, because an
  earlier pass had rewritten the token that gate anchors on (LESSONS §109).
- **Owes:** nothing outstanding on gates.

## njefferson/3d-printing-pal

- **Deploys to:** https://3d-printing-pal.pages.dev, and `staging` to
  https://staging.3d-printing-pal.pages.dev
- **Branches:** `staging` and `main`. Push to `main` deploys production;
  `staging` is the candidate that waits for the on-device pass.
- **Branch guard:** installed 2026-08-20. `work=staging`, `promote=main` via
  `PAL_PROMOTE=1`. `package.json` reinstalls it on `npm ci`.
- **Gates wired in CI:** `gates.yml` checks the hub out and runs
  `privacy-check.mjs` (already there), plus `quote-check.mjs` and
  `branch-guard.mjs --artefact` (added 2026-08-20), beside docs, pins, pwa,
  palette, textsize and this repo's own gates. `security` job runs zizmor.
- **Known:** the only one of the four scanned on 2026-08-20 that was genuinely
  clean of personal material — 17 quotation candidates, every one legitimate.
- **Owes:** the §7e baseline (ask its NOTES first).

## njefferson/Intersecting-parallels

**Note the capital I** — the repo is `njefferson/Intersecting-parallels`; the
Pages project is lowercase. GitHub URLs are case-insensitive, a local clone path
is not.

- **Deploys to:** https://intersecting-parallels.pages.dev, and `staging` to
  https://staging.intersecting-parallels.pages.dev
- **Branches:** `staging` and `main`. Every product change lands on `staging` →
  preview URL → on-device pass → explicit promote → `main`. Docs-only may land on
  `main` directly. The harness's `claude/*` branch is ignored.
- **Branch guard:** installed 2026-08-20. `work=staging`, `promote=main` via
  `IP_PROMOTE=1`. `package.json` reinstalls it on `npm ci`.
- **Gates wired in CI:** five workflows — `tests.yml` (`npm test`, notes:check),
  `a11y.yml`, `walk.yml`, `deploy.yml`, and `security.yml`, which checks the hub
  out at `main` and runs `pin-check.mjs`, `docs-check.mjs` and — added
  2026-08-20 — `privacy-check.mjs`, `quote-check.mjs` and
  `branch-guard.mjs --artefact`.
- **Known:** the §7e baseline is complete (2026-08-03). Patch notes generated
  from CHANGELOG.md with a drift gate, worth copying. Its a11y gate is cited by
  LESSONS §28. The `walk.mjs` app walk is 225 checks, start screen to offline
  relaunch, and is the thing to run when `public/` changes.
- **Owes:** nothing outstanding on gates.

## njefferson/photo-pointer

- **Deploys to:** https://photo-pointer.pages.dev, and `staging` to
  https://staging.photo-pointer.pages.dev
- **Branches:** `staging` and `main` only, and NO pull requests — they are not
  used there. Every build lands on `staging`, waits for the on-device pass, and
  reaches `main` only on an explicit promote. Docs-only may go straight to
  `main`. There is also a long-lived `accessibility` branch.
- **Branch guard:** installed 2026-08-20. `work=staging`, `promote=main` via
  `POINTER_PROMOTE=1`. `package.json` reinstalls it on `npm ci`.
- **Gates wired in CI:** `ci.yml` runs `node --test`, `check-contrast.mjs`,
  `check-etiquette.mjs` and `ingest.mjs validate`, and — added 2026-08-20 — a
  SHA-pinned hub checkout running `privacy-check.mjs`, `quote-check.mjs` and
  `branch-guard.mjs --artefact`.
- **Known:** cited by LESSONS as owning `scripts/check-etiquette.mjs`. Its
  `README.md` still carries a markdown TABLE, which `docs-check.mjs` fails on —
  found 2026-08-20, NOT fixed, and `docs-check` is not in its CI.
- **Owes:** the §7e baseline (ask its NOTES first), the README table, and
  `docs-check.mjs` in CI.

## njefferson/MoleBridge

- **What:** a step-gated stoichiometry trainer for one high school chemistry
  classroom. Students enter every intermediate value; the app attributes a wrong
  number to a conceptual failure and hands the teacher a completion code that
  decodes to a class-wide error histogram. Static PWA, no backend, no accounts,
  no cookies, no network at runtime, and NO student PII — identity is a
  teacher-assigned roster number.
- **Branches:** `staging` and `main`, as of 2026-08-25. Work lands on `staging`;
  `main` is the Cloudflare Pages production branch, so promotion is a merge. The
  harness's `claude/*` branch is kept pointing at the same commit as `staging`
  and gates deliberately do NOT run on it — two runs on one SHA is not twice the
  confidence.
- **Deploys to:** https://molebridge.pages.dev from `main` — **empty today**,
  because nothing has been promoted yet. Every other branch lands as a preview
  on its own URL.
- **Branch guard:** installed 2026-08-25. `work=staging`, `promote=main` via
  `MOLEBRIDGE_PROMOTE=1`, with `also=tools/version-check.mjs` holding the release
  triplet on every commit. `package.json` reinstalls it on `npm ci`.
- **Gates wired in CI:** `gates.yml` checks the hub out SHA-pinned and runs
  `privacy-check.mjs`, `quote-check.mjs`, `docs-check.mjs`, `pin-check.mjs`,
  `branch-guard.mjs --artefact`, `palette-check.mjs` and zizmor — all ahead of
  the browser work, so a Chromium that will not download cannot skip them. Then
  its own journey walk, accessibility gate, and a LIVE header check made from
  the runner after the deploy.
- **No runtime dependencies at all.** Node strips the TypeScript; the only
  package in the tree is the type checker.
- **Promoted 2026-08-25.** 0.4.4 is on `main` and deployed; the promote was a
  clean fast-forward, so no commit was made on production and the guard's escape
  was never needed. Repo metadata is fully applied.
- **Owes:** a Content-Security-Policy, the ViewBoard and Chromebook on-device
  passes, a required reviewer on the `production` environment, and somebody
  actually fetching `https://molebridge.pages.dev` — the deploy job's checks
  passed against the per-deploy host rather than the apex, which is fixed in the
  workflow but is proved by the NEXT promote and not before.

---

## What every sibling still owes

One line each, so it is not a memory test:

- **The branch guard** — installed everywhere as of 2026-08-20. Nothing owed.
- **The privacy CI step** — `privacy-check.mjs` AND `quote-check.mjs` now run in
  every repo listed above, per Doctrine §9b and its second half. Each was watched
  going red on a synthetic plant and green with it removed, and each was
  confirmed to have RUN on a real runner rather than been skipped.
  `privacy-mirror-check.mjs` is still Quietkeep-only, which is correct — it is
  owed only by a repo that mirrors the patterns for an offline test.
- **`docs-check.mjs` in CI** — photo-pointer is the one repo above that neither
  runs it nor passes it.
- **`doctrine-sync.mjs --repo .`** run FIRST in any sibling session, and
  `--adopt` only after the drift is actually read.
- **The third-person sweep — owed by THIS REPO and by Quietkeep, and by nothing
  else.** LESSONS 113's scrub covered four siblings and found the sweep for
  references carrying no name at all — a pronoun, or a possessive naming a
  machine — worth 49 more sites in one and 84 in another after every named
  attribution was already gone. **The two repos it did not cover are the two
  that had been scrubbed earlier for the NAME and QUOTATION halves only**, which
  is exactly why they look done. Measured 2026-08-20 on that scrub's own
  patterns, with each gate's own pattern source excluded: **71 sites in
  Quietkeep** (37 in `NOTES.md`, 10 in `docs/verifications.md`, the rest spread
  one and two at a time through `src/`, `test/`, `tools/` and the ADRs) and
  **60 here** (32 in `LESSONS.md`, 18 in `DOCTRINE.md`, 6 in `CLAUDE.md`).
  Quietkeep's broader third-person count is 418 across 388 tracked files, most
  of which are ROLE references — *the owner decides what is a VERSION* is
  governance and stays; a phrase about how somebody's day goes is a fact about a
  person and does
  not. **The count is not the job; reading them is**, which is the whole reason
  LESSONS 113 files the scan as a checklist and not a gate.

## The rule this file is under

If a session learns a fact about a repo that it had to go looking for — a branch
model, a deploy URL, which gates are wired — **it belongs here**, in the same
session that learned it. The cost of not writing it down is not abstract: it is
the owner being asked the same question again.
