# CLAUDE.md — noahjefferson (the personal hub)

> **Inherits the Universal App Doctrine** — the canonical copy lives in THIS repo
> at [`DOCTRINE.md`](DOCTRINE.md). It is the single source of truth for the rules
> shared across all of Noah's apps: product values, taste, accessibility,
> honesty, verification, release discipline & taxonomy, licensing (PolyForm
> Noncommercial), privacy, the permanent **AskUserQuestion ban** (§0), and the
> **repo-metadata confirm rule** (§10). **Where anything below overlaps the
> Doctrine, the Doctrine wins.** This file keeps only what is specific to this repo.

## What this repo is
The personal link hub at **noahjefferson.pages.dev** — photography accounts and
the free web apps. Static, self-contained, no build step. `public/` is the
deployed site; `.github/workflows/deploy.yml` deploys it to Cloudflare Pages on
every push to `main`.

## This repo is the doctrine's home
`DOCTRINE.md` is canonical here, and so is [`LESSONS.md`](LESSONS.md) — the
cross-app record of what has actually gone wrong, with the numbers — and
[`PALETTES.md`](PALETTES.md), how any app gets reskinned (roles, floors, four
verified families, traps), enforced by [`palette-check.mjs`](palette-check.mjs).
The doctrine says what to do; the lessons say what it cost to find out; palettes
says what colour has to clear before taste gets a vote.

Append to LESSONS.md from any app's session whenever something is learned that
would have saved time elsewhere; never fork it into another repo. When a
doctrine rule changes, edit it HERE and tell the sibling repos to re-point
(their `CLAUDE.md` files link to this copy). Never fork the doctrine into
another repo — link to it.

## Four gates live here and serve every repo
Never fork these either — they take `--repo ../app` so a sibling runs them
without copying them, which is what stops four divergent versions existing.

- [`palette-check.mjs`](palette-check.mjs) — the colour floors (PALETTES.md).
- [`lessons-check.mjs`](lessons-check.mjs) — every lesson in LESSONS.md
  declares `GATE`, `CHECKLIST` or `JUDGEMENT`, and a cited gate that does not
  exist FAILS. `--checklist` prints the steps no script can perform; run it
  before any handoff.
- [`pin-check.mjs`](pin-check.mjs) — nothing that executes floats on a tag
  (Doctrine §16.1), no `npm install` in automation, no package.json without a
  lockfile.
- [`handoff-check.mjs`](handoff-check.mjs) — a staged candidate is recorded in
  NOTES.md with its URL and version, no instruction tells an iPad-first owner to
  fetch a file from a repo, and the four un-automatable handoff obligations are
  acknowledged. LESSONS §14 is why it exists.

`npm run check` runs the hub's own. `.github/workflows/doctrine.yml` runs
lessons, pins and `zizmor` on every push and PR.

[`SECURITY.md`](SECURITY.md) is canonical here too — the baseline every repo
is held to, splitting what CI enforces from the GitHub and Cloudflare settings
only Noah can switch on. Confirm those the same way as repo metadata (§10):
list them, never assume them.

## Cross-app connective tissue
This hub links OUT to every sibling app, and each app links back. It also hosts
the shared **accessibility statement** (`/accessibility`) that every app's About
screen links to. If a new shared statement is added (e.g. a privacy statement),
it belongs here too, with each app linking to it.

## Branches & releases
`main` only (there is no `staging` for the hub). Push to `main` redeploys.
Editing `DOCTRINE.md` or this file is docs-only. Changing anything in `public/`
is a site change — verify the rendered page before pushing.

## Repo metadata (manual, confirm — see Doctrine §10)
Description / website / topics / social-preview are GitHub-UI steps the session
token cannot perform. List the exact values and ask Noah to confirm each; never
report the hub "set up" while any is unconfirmed.
