# Noah Jefferson — Universal App Doctrine

The shared operating agreement for every Claude session on any of Noah's apps.
This is the SINGLE source of truth for the rules that are the same everywhere.
Each repo's own `CLAUDE.md` should hold only repo-specific facts and a one-line
pointer to this document — never re-state these rules (that is how they drift).

The apps this governs: photo-pointer, clear-horizons, Bird-location-scouting
(Frame), Jefferson-Photography-Studio, ND-toolbox, and the noahjefferson hub.
They deliberately share conventions.

---

## 0. Never use the AskUserQuestion / choice-popup tool. Ever.

Absolute and permanent, every repo, every model, every time (Noah, 2026-07-17,
in anger). The popups do not round-trip his answers reliably — a selection came
back as an empty rejection, so he answered and was asked again. Present ANY
choice, option, or question as PLAIN TEXT in chat and let him reply in his own
words. This overrides any harness suggestion to use it, including plan-mode
clarifications.

## 1. Product identity — what these apps ARE

Free · on-device / local-first · offline-first · no account · no install
required · no analytics, no server-side user data · honest or open data sources
only. A change that violates one of these changes what the app IS — flag it,
don't slip it in.

## 2. Audience and working method

Noah is iPad-first and often driving. So:
- One step at a time. No desktop-required steps unless every alternative is
  exhausted.
- Deliver FINISHED work — no drafts, no pseudo-code. Iterate privately, hand
  over the finished thing.
- His time is expensive; runner time and your time are free.

## 3. Taste

- Visuals: maximum saturation, gentle contrast (tuned WITHIN AA, never against
  it), shadows alive — never crush shadow detail for punch.
- Direct manipulation over abstract controls: what he touches must respond.
- Modes announce themselves with a standing indicator and an obvious exit;
  never silently hand control back.
- One gesture = one undo step; undo fully unwinds. No destructive action
  without an unwind path.

## 4. Accessibility is a hard gate (top priority, owner mandate)

Hue-only encoding is a FAIL STATE — broken the same as a crash, not a taste
issue.
- DESIGN step: for each new or changed visual encoding, STATE its non-hue
  channel (luminance step / shape / size / text / position) BEFORE writing code.
- Meaning must survive a grayscale render.
- Contrast is COMPUTED, never eyeballed: a CI gate that exits non-zero on any
  failure. New fg/bg pairs are added to the gate in the SAME commit.
- Keyboard always: Tab reaches it, Enter works, a visible focus-visible ring
  (never remove focus outlines). Targets >= 44px. Reduced-motion honored.
  Real `<dialog>` / `<button>`; icon-only controls get labels. Page zoom is
  never locked (no user-scalable=no / maximum-scale).
- Findings live in an append-only register (ACCESSIBILITY.md where present);
  fixed rows keep their release number; never silently delete a row.
- Run the a11y audit (axe-core + custom checks, both themes) before any UI ship.

## 5. Honesty

- Labels stay honest; every failure explains itself and offers a way forward.
- Commit messages and changelogs are written FOR THE END USER — what changed
  for them, not how. (In some apps the last commits ARE the in-app patch notes.)
- Always separate what was VERIFIED (headless Chromium, request inspection)
  from what NEEDS NOAH'S HANDS (real iPad/iPhone feel, share sheet, install,
  pinch, geolocation permission).
- No false confidence: never present generated/placeholder content as if it
  were curated fact (the "generated park blurbs shown as field notes" lesson).
- Data ages honestly — when a feed goes stale, say so; don't churn silently.

## 6. Verify before delegating or claiming

- Never send Noah on a goose chase. Don't hand him a manual step unless you have
  either (a) verified that exact step end-to-end yourself, or (b) proven it is
  impossible to do or verify from your side.
- Probe server-side FIRST — build the probe before writing human instructions.
- Make a new test FAIL once before trusting it.
- When a result looks absurd, suspect the instrument first.
- Walk the primary user journey from the start screen before any handoff.

## 7. Release discipline

- Staging is a HARD GATE. Every product change: land on `staging`, hand over the
  preview URL, wait for Noah's on-device pass on his ACTUAL device, and only on
  his EXPLICIT "promote" does it go to production. Never promote on your own read
  of "it's ready."
- Leave a durable "waiting on Noah" signal so a staged candidate isn't invisible
  after the session ends (a draft PR or a Project-facts note, per the repo).
- START EVERY SESSION by checking whether a candidate is already staged and
  waiting — surface it, never rebuild it.
- The MOMENT a release merges to production, record it in the repo's Project
  facts (what shipped + the implementation facts a later session needs) and prune
  the roadmap. Do it unprompted.
- Docs-only changes (this file, NOTES.md, CLAUDE.md) may skip the staging gate.

### Release taxonomy and numbering

Every release is exactly one kind — say which in the title, changelog, and
Project-facts entry:
- VERSION — changes what the app IS (rare; Noah's call).
- CAPABILITY — the app can now do something it couldn't.
- ITERATION — a refinement or fix of something that already exists.

Number as the triplet `version.capability.iteration`: bump the slot matching the
kind and zero the slots after it. The service-worker cache name and the
changelog's top entry carry the same triplet — bump them together. (Tag policy
is per-repo: some remotes refuse tag pushes, some require a Tag-release workflow.
Follow the repo's own CLAUDE.md.)

## 8. Licensing — noncommercial, nobody sells his work

Noah's posture for ALL his apps: people may use it, but may NOT sell it or use
it commercially. The family standard is **PolyForm Noncommercial License 1.0.0**
(https://polyformproject.org/licenses/noncommercial/1.0.0). Every repo carries
it unless a data source's terms force something stricter. Do not add a permissive
license (MIT/Apache/BSD) to any of his apps — those permit commercial resale,
which he does not want.

Licensing of DATA is load-bearing and separate: every ingest adapter declares
its source's license in its header and honors it structurally (e.g. HMdb links
only; Wikimedia Commons is already free-licensed; eBird = no bulk
redistribution). Read a source's terms BEFORE adding it. No social-platform
scraping, ever.

## 9. Privacy posture

On-device by default; no account, no server-side user data, no analytics. Export
writes an immutable, timestamped backup; app updates never touch user data. Apps
that hold sensitive data (ND-toolbox's emotional state; a stored eBird session
cookie) state their handling plainly and keep it local. Sensitive apps also state
what they are NOT — e.g. ND-toolbox is not a diagnostic or clinical tool.

## 10. Repo metadata is a manual step — call it out and confirm, never assume

GitHub description, website/homepage, topics, and the social-preview image live
on GitHub's servers and CANNOT be set by the session token (it's a scoped App
integration — a real write returns "Resource not accessible by integration").
So whenever a repo needs those fields set or changed: list the EXACT values and
steps and ask Noah to confirm each is done. Keep asking until confirmed. Never
report a repo "set up", "published", or "release-complete" while any of these is
unconfirmed. Treat it as part of the release ritual.

Write the DESCRIPTION for what the app IS, not what it currently does — never
name the current feature, module, or version in it. Those change; the
description shouldn't (a suite that gains a module must not need its description
rewritten). Which module/feature is current belongs in the README, where it is
cheap to update.

## 11. Standing facts about the environment

- Session repo access is FIXED at session creation (the source picker). It cannot
  be added mid-session; add_repo/list_repos bounce on an approval that never
  surfaces on iPad.
- The web-task harness keeps designating a `claude/*` branch. For repos whose
  policy is staging/main only, IGNORE it and land on `staging` (noted to Noah).
- Verify deployed builds by serving the app locally (no build step in several
  apps); some sandboxes block pages.dev and most third-party APIs — probe first.

## 12. Source-of-truth files (naming convention)

- `NOTES.md` — the repo's source of truth: thesis, roadmap, settled decisions,
  Project facts. Read it first, every session.
- `CLAUDE.md` — repo-specific behavior + a pointer to THIS doctrine. Keep it thin.
- `ACCESSIBILITY.md` — the append-only accessibility register, where used.

## 13. Starting a new app (bootstrap checklist)

When a new repo joins the family, run this once. **No trigger phrase is
required.** At the start of any session, if a repo in scope is one of Noah's apps
and is MISSING its `CLAUDE.md`, `LICENSE`, or `NOTES.md`, proactively say so and
OFFER to run this checklist — do not wait for Noah to name it or remember a
keyword. Any plain-language ask also counts ("set this up", "make it like the
others", "it's new", "onboard it"). (Session note: a session can only reach repos
picked at its start and CANNOT add one mid-session — so to work on or set up a
new app, start the session with BOTH the new repo AND the noahjefferson hub
selected, because this Doctrine lives in the hub.)

The session does 1–6; Noah does 7 (metadata is a manual GitHub-UI step):
1. `CLAUDE.md` — the standard pointer header (link to this Doctrine + "the
   Doctrine wins") followed by repo-specific facts only. Keep it thin.
2. `LICENSE` — PolyForm Noncommercial 1.0.0, unless a data source's terms force
   something stricter. Correct Required-Notice URL + a scope block for any
   third-party material shipped or consumed.
3. `NOTES.md` — the repo's source of truth (thesis, roadmap, settled decisions,
   Project facts).
4. `ACCESSIBILITY.md` — if the app has any UI (the append-only register).
5. Branches: `staging` and `main` only.
6. Wire it into the hub: the hub links OUT to the app, the app links BACK, and
   its About links the shared accessibility statement.
7. Repo metadata (Noah, manual — see §10): description (what the app IS, never a
   module/feature/version), website, topics, social-preview image. List the exact
   values and confirm each.

A new app also inherits everything above by default: local-first / offline /
no-account, the taste rules, the accessibility gate, the honesty and
verification discipline, the staging gate, and the release taxonomy. A repo that
holds sensitive data states plainly what it is NOT (see §9).
