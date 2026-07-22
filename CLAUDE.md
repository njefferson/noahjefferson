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
`DOCTRINE.md` is canonical here. When a doctrine rule changes, edit it HERE and
tell the sibling repos to re-point (their `CLAUDE.md` files link to this copy).
Never fork the doctrine into another repo — link to it.

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
