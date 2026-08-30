# REPOS.md — what exists, and how each one works

**This file did not exist until 2026-08-10, and its absence is why sessions kept
asking questions that had already been answered.**

A session starts with no memory. The only file loaded automatically is
`CLAUDE.md`. Nothing anywhere named the repos in this family, so "which repos are
there" had nothing to be read *from* — the first six were discovered by grepping
`LESSONS.md` for `GATE <repo>:` citations, which is an accident of how lessons
cite their gates rather than a design.

**And the accident kept a repo out.** MoleBridge cites no hub gate by that
spelling, so the grep never saw it and nothing has ever listed it here — it was
added on 2026-08-26 by a session that had to read its `CLAUDE.md` and `NOTES.md`
for another reason. That is the failure this file exists to stop, wearing the
shape of the thing that created it: a list assembled by a side effect is a list
of whatever happens to have that side effect.

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

**Listed here from 2026-08-26.** It had never been in this file: the grep that
assembled the original six keyed on `GATE <repo>:` citations in `LESSONS.md`,
and MoleBridge cites none.

- **What:** a step-gated stoichiometry trainer for one high school chemistry
  classroom. Static PWA, installable, offline after first load, no backend, no
  accounts, no cookies. Students on managed Chromebooks; a board at the front of
  the room running Chromium.
- **Branches:** `staging` and `main`. `main` is the Cloudflare Pages production
  branch, so a commit landing there lands on the address a class opens.
  Promotion is a merge.
- **Deploys to:** https://molebridge.pages.dev — confirmed answering on a real
  device 2026-08-25, along with the iPad pass.
- **Branch guard:** installed. `work=staging`, `promote=main` via
  `MOLEBRIDGE_PROMOTE`, with `also=tools/version-check.mjs`.
- **Gates wired in CI:** `gates.yml` checks the hub out SHA-pinned and runs
  `privacy-check.mjs`, `quote-check.mjs`, `docs-check.mjs`, `pin-check.mjs` and
  `branch-guard.mjs --artefact`, plus its own type check, tests,
  `verify-chemistry.mjs`, `version-check.mjs`, `tokens-check.mjs`,
  `permissions-check.mjs`, the journey walk and the accessibility gate at
  `--all-palettes`. The deploy job takes the GATED build as an artifact rather
  than rebuilding, and fetches the live page to check its headers.
- **Known:** the §7e baseline is complete. Worth copying: `tools/a11y.mjs`'s
  ROLE INVARIANT, which reverse-maps every rendered colour to its token and
  fails on anything mapping to nothing; `tools/verify-chemistry.mjs`, which
  checks the domain from outside the engine; and `src/report/readout.ts`, where
  a student sees their completion code DECODED rather than described.
- **Owes:** the ViewBoard and a Chromebook, which no session can test against.

---

## njefferson/Cv-Thalweg

**Listed here from 2026-08-29**, the day it was named for the hub.

- **What:** depth, tide and flow for the Central Valley fall-run fishery — the
  Sacramento, Feather, American and Mokelumne and the Delta they run into.
  Static, no build step, no framework, no CDN, no account, no analytics.
  Leaflet 1.9.4 is vendored into the repo. Offline after first load.
- **What it deliberately is not:** it does not say where fish are being caught,
  and there is no bite forecast or spot predictor. No live catch feed exists for
  these rivers, and a hunt through SacPAS and CDFW on 2026-08-28 confirmed no
  machine-readable in-season adult count exists either. "Not for navigation" is
  in the header at all times, because DWR's own metadata says the surveys are
  not a navigation aid and that constraint travels with the data.
- **Branches:** `staging` and `main`, since 2026-08-29. Work lands on `staging`
  → https://staging.cv-thalweg.pages.dev → the on-device pass → an explicit
  promote via `THALWEG_PROMOTE=1` → `main`, which is production. It ran on
  `main` alone before that, decided when it was three days old, not deployed
  and not linked anywhere — and the decision was never revisited when both
  halves stopped being true. It is the app that needs the on-device pass MOST:
  it is read one-handed on a riverbank and every defect found in its first week
  appeared only on the real device.
- **Deploys to:** https://cv-thalweg.pages.dev — every release verified by
  `tools/check-deploy.mjs`, which asks the live site which commit it is serving
  through a Pages Function rather than trusting the push.
- **Proxy:** the app ships its own bathymetry proxy as a Pages Function
  (`functions/bathy/[[path]].js` over `worker.js`), allow-listed by prefix to
  two upstreams so it cannot be used as an open proxy. 52 checks cover it.
- **Gates:** `tools/a11y.mjs` (182 checks across six viewport geometries and two
  browser engines, including WebKit and a keyboard-raised phone),
  `render-test.mjs`, `test-worker.mjs`, `live-test.mjs` against the real
  services, and the hub's `docs-check`, `privacy-check`, `quote-check`,
  `pin-check` and `pwa-check`.
- **Known:** the §7e baseline is complete. Worth copying: the WebKit pass in
  `tools/a11y.mjs`, which found a first-run defect every Chromium check called
  correct (LESSONS §175); the phone geometries taken from Playwright's device
  registry rather than from spec sheets (§176); and the landing-weight gate,
  which holds a first-time reader's cold open under a megabyte after it was
  measured at 5.56MB.
- **Gates wired in CI:** `gates.yml` CALLS the hub's reusable
  `hub-gates.yml`, pinned by SHA, which runs `branch-guard.mjs --artefact`,
  `privacy-check.mjs`, `quote-check.mjs`, `docs-check.mjs`, `pin-check.mjs`
  and `pwa-check.mjs`. Its own `test-worker.mjs`, `render-test.mjs` and
  `a11y.mjs` stay in its own job. First caller of the reusable workflow. The live
  suite is a SEPARATE job with `continue-on-error`, because it talks to USGS,
  NOAA and DWR and a public agency having a bad morning must not read as this
  repo being broken. Wired 2026-08-29; the first run failed on two things
  invisible from the machine it was written on, and the second was green.
- **Owes:** nothing outstanding on gates. Repo metadata is fully set; see
  METADATA.md.

---

## njefferson/solve-ent

- **What:** an algebra-skills trainer for one high school chemistry classroom,
  and a sibling to MoleBridge — the same teacher, the same students, the same
  board at the front of the room. Static, no backend, no accounts, no cookies.
- **Branches:** `staging` and `main`. Work lands on `staging`; `main` is
  production and deploys.
- **Deploys to:** **solve-ent.pages.dev**, from `main`, via `deploy.yml`. The
  address answers — confirmed by the owner opening it, because this environment's
  egress policy refuses `*.pages.dev` and a session that curls it gets a 403
  from the proxy rather than a page. **That 403 is policy, not an outage.**
- **Branch guard:** installed 2026-08-26. `work=staging`, `promote=main` via
  `SOLVENT_PROMOTE`, with `also=tools/version-check.mjs`. `package.json`
  reinstalls it on `npm ci`.
- **Gates wired in CI:** `gates.yml` checks the hub out SHA-pinned and runs
  `privacy-check.mjs`, `quote-check.mjs`, `docs-check.mjs`, `pin-check.mjs` and
  `branch-guard.mjs --artefact` — all of them AHEAD of the repo's own tests, so
  a broken test run cannot skip the §9b gate. Each of the three doctrine gates
  was watched going red on a LOCAL plant and restored. `zizmor` runs
  `--offline --strict-collection` from the hub's hash-pinned requirements.
- **Known:** the product is ATTRIBUTION, not solving. A taxonomy collision
  fails the build and there is no tiebreak anywhere. Two numbers are printed by
  `npm test` and by `node tools/cli.ts scan`: collisions, which must be 0, and
  the E-UNCLASSIFIED rate, which is reported rather than suppressed. Its
  `verify-algebra.mjs` is worth copying — its strongest check substitutes the
  app's answer back INTO the relation rather than recomputing it the same way,
  so it cannot share a mistake with the solver.
- **Has a screen, and the whole §7e baseline with it:** the ⓘ control, first-run
  orientation that survives the thing a reader presses to begin, patch notes from
  one source (drift-gated, bounded at five, opening a page in this app), the §7f
  text diagnostic, and §7h's waiting worker driven by a real second worker in
  `tools/update-walk.mjs`. The palette is generated from
  `palettes/solve-ent.json` — the file the hub's gate measures — so what was
  measured and what is painted cannot differ. `tools/a11y.mjs` covers every
  state in both modes with the dialogs open, and `tools/walk.mjs` walks the
  primary journey with a step wrong on purpose. The completion code and the
  teacher's page are built.
- **Chrome carries three controls** — a calculator, a problem report and the ⓘ —
  plus the §7b version stamp. Two of the three were adopted from MoleBridge, and
  the calculator was adopted only after somebody reported it as ABSENT from a
  screenshot of the screen it was on: it existed, below the fold. Hub LESSONS
  §169.
- **Repo metadata:** every row in `METADATA.md` says `set`, applied by the owner
  on 2026-08-27.
- **`tools/fold-check.mjs` is worth copying into every sibling.** It opens the
  app at 390x380 — a phone with the keyboard up — and holds a declared list of
  MOMENTS to two strengths: the whole box on screen for anything a finger hits,
  the top edge for prose. The usable area is read off the sticky chrome's own
  box rather than assumed to start at zero, which is the mistake its first
  version made. Hub LESSONS §174.
- **Owes:** nothing outstanding as of 1.0.0. What is deliberately NOT built is
  named in that repo's NOTES rather than owed.

---

---

## The gate wiring is called from the hub now, not copied

`.github/workflows/hub-gates.yml` in the hub is a `workflow_call` workflow. A
sibling calls it and gets every hub gate; it does not copy a job that runs them.
**This is the answer to why four repos ran five gates and three ran three: the
gates were shared and the wiring was not.**

    jobs:
      hub-gates:
        uses: njefferson/noahjefferson/.github/workflows/hub-gates.yml@<sha>
        with:
          pwa: true

**Seven repos call it as of 2026-08-29** — Cv-Thalweg, fauxplane,
3d-printing-pal, Intersecting-parallels, photo-pointer, MoleBridge and Solve-ent.
Quietkeep's swap is written and NOT settled: it was pushed to that repo's
`staging` while another session was working there, which it should not have been,
and it waits on the owner.

**The pin is read out of the CALLING workflow file**, not from a context. Three
context properties were tried and all three failed — see LESSONS §184, including
the one that went green for days while running the hub's moving default branch.
The value used is literally the string in the `uses:` line, so the gates and the
wiring cannot be two versions and there is nothing to half-bump.

### The inputs, and what they mean

Each names a FACT about the repo rather than a preference. A repo that has the
fact and leaves the input off is running a smaller gate than it looks like it is.

- **`pwa`** — the repo has a service worker. Runs `pwa-check.mjs`.
- **`mirror`** — the repo carries its own offline copy of the disclosure
  patterns. Quietkeep only. Runs `privacy-mirror-check.mjs`.
- **`third-person`** — defaults ON, and should stay on. Every repo passes it.
- **`palette-path`** — the palette JSON to hold to the colour floors.
- **`textsize-paths`** — CSS/HTML to check for a reader who enlarges only their
  default text size.
- **`zizmor`** — audit the caller's workflows at the hub's version- and
  hash-pinned build.
- **`docs-path`**, **`node-version`** — where the prose is, and which Node.

**Where a flag is off on a repo that has the fact, it is a DEBT and it is
written down twice** — in a comment where the flag would go, carrying the actual
figures, and in the list below. That is the difference between a gate that is
owed and a gate that quietly stopped running. It is not a way to switch a
failing gate off, and two of them are currently open.

### The debts this surfaced

- **photo-pointer's §7h is BUILT (1.21.0) and the gate is on.** The worker
  waits, a standing strip says a new version is ready in words, pressing it is
  what releases it, and the About panel lists the caches the device actually
  holds. Watched against a real second worker before it was pushed — nine
  checks, and the walk caught the first draft reloading the very first visit.
  **What it owes now is the walk itself.** That repo has no browser tooling at
  all, so the check that proved this works is not committed and not gated, and
  the next change to the service worker has nothing standing behind it. Quietkeep
  and Solve-ent both drive a real second worker in CI; this is the third that
  should.
- **The four colour floors are the HUB's, not 3d-printing-pal's.** That repo
  adopted the Instrument family verbatim as recommended, and its palette file is
  byte-identical to the family for every surface, text token, accent and alpha.
  `palette-check.mjs` widened its accent-tint test to the whole text ladder on
  2026-08-25 and the families were never re-run through it: **seventeen
  hard-floor failures across all sixteen palettes**, and PALETTES.md went on
  saying all four clear every floor. Corrected there, with the figures.
  Nothing caught it because no CI runs the gate over `families.json` — only the
  hub's local `npm run check` does, so the hub gates every sibling's copy of the
  data and not the original. **Clearing it is a restyle of all four families** —
  the day palettes need a four-to-seven-step nudge to text-3, the night ones a
  text-3 lift AND a cut to `accentSoftAlpha`, paper-night's roughly halved — so
  it changes how a selected row looks in every app that adopted one, and waits
  on the owner. LESSONS §186. Wiring the gate into the hub's CI waits on the
  same answer, because switching it on today just makes the hub red.
- **zizmor is on in fauxplane and photo-pointer** as of 2026-08-29, and what it
  found is why it was the debt worth taking first. fauxplane expanded
  `${{ github.ref_name }}` into a `run:` block twice — a branch name is written
  by whoever can push a branch, the expansion happens before bash sees the
  script, and the job holds a live Pages:Edit token. photo-pointer had
  THIRTY-FIVE actions on mutable tags, two of them beside the Cloudflare token,
  plus every checkout persisting a git credential, two workflows inheriting the
  repository's default token permissions, and a step output expanding into a
  `git commit -m`. All fixed; the pins used are ones sibling repos already run
  and whose CI went green on them the same day.
  **fauxplane's declaration is gone and the finding with it**: the install and
  the tests are their own job now, so the job holding the token has no
  `setup-node` and no cache to poison. The suppression was deleted rather than
  kept. The one declaration that remains is photo-pointer's sixteen ingest
  workflows keeping their git credential, which they need, since committing what
  they fetch is their whole job.
- **Quietkeep owes zizmor** — template injection and cache poisoning, three high.
  Not touched: a session was working in that repo and the owner said to leave it.
- **Two doctrine markers are dangling.** `fauxplane` and
  `Intersecting-parallels` name hub commits that no longer exist after the
  history rewrite, so `doctrine-sync.mjs` can tell a session in those repos
  nothing at all. **photo-pointer has no `.doctrine-sync`.** Re-adopting is an
  assertion the drift was read, so it is not a session's to do on the way past.

### What the swap actually costs, per repo

It is three lines plus whatever the repo built on top of the old shape, and the
second part is the part that bites. Every one of these was found by a repo-local
tool going red, which is the argument for having them:

- **A `needs:` that stopped covering the gates.** MoleBridge's deploy job said
  `needs: gates`, which covered the doctrine gates while they lived inside that
  job. Moving them out would have let the deploy go ahead with them red.
  fauxplane had the same shape.
- **A parity tool reading the old spelling.** 3d-printing-pal's
  `gates-parity.mjs` found which hub gates CI ran by scanning for
  `node .hub/x.mjs`; after the swap it would have called every hub gate
  in-the-chain-but-not-in-CI. It now reads the call and credits each conditional
  gate only when the flag is passed — and it caught a real mistake in the same
  commit, an `npm audit` step deleted along with the block it sat in.
- **A pin that moved house.** Solve-ent's `hub-pin-check.mjs` held
  `.doctrine-sync` equal to a `HUB_SHA` env var that no longer exists; it reads
  the `uses:` line now.
- **A local tool that ran a hub gate itself.** Solve-ent's `tools/palette.mjs`
  ran the hub's palette gate out of the `.hub` checkout CI stopped making, and
  refused to skip — correctly. It now requires positive evidence in the workflow
  that `palette-path` names its palette, verified by changing the path and
  watching it go red.
- **A local runner of the CI list.** Quietkeep's `tools/spine.mjs` runs what CI
  runs by reading the workflow, so the hub gates would have vanished from the
  local chain. It synthesises them back from the call and its inputs — better
  than before, where they were listed as un-runnable and left to somebody to
  remember.

## What every sibling still owes

One line each, so it is not a memory test:

- **The branch guard** — installed everywhere as of 2026-08-20. Nothing owed.
- **The privacy CI step** — `privacy-check.mjs` AND `quote-check.mjs` run in
  every repo listed above, per Doctrine §9b and its second half. Each was watched
  going red on a synthetic plant and green with it removed, and each was
  confirmed to have RUN on a real runner rather than been skipped.
  **THAT SENTENCE WAS TRUE AND IT WAS NOT THE QUESTION.** It says two gates run
  everywhere; it never said how many of the NINE each repo ran, because nobody
  had counted. Counted on 2026-08-29: two repos ran six, three ran five, two ran
  three. `third-person-check.mjs` ran in two, and switched on in the other five
  it found 110 sites — fifty-nine of them real, in a public repo carrying the
  owner's name. Every repo now calls the whole set. LESSONS §183.
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
