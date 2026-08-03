# CLAUDE.md — noahjefferson (the personal hub)

> **Inherits the Universal App Doctrine** — the canonical copy lives in THIS repo
> at [`DOCTRINE.md`](DOCTRINE.md). It is the single source of truth for the rules
> shared across all of Noah's apps: product values, taste, accessibility,
> honesty, verification, release discipline & taxonomy, licensing (PolyForm
> Noncommercial), privacy, the permanent **AskUserQuestion ban** (§0), and the
> **repo-metadata confirm rule** (§10). **Where anything below overlaps the
> Doctrine, the Doctrine wins.** This file keeps only what is specific to this repo.

## The rules that get broken anyway — read these before typing
This is an INDEX, not a fork; the canonical text is in `DOCTRINE.md` and
`LESSONS.md`. It exists because those two files must be OPENED, while this one
is loaded into every session automatically — so a rule that lives only there
gets read once at the start of a long session and broken four hours later.
Every item below has actually happened.

- **NEVER A TABLE OR GRID, anywhere Noah reads** — chat, commits, PR bodies,
  `NOTES.md`, all of it. They do not render on his iPad; the columns are lost
  silently while the prose around them looks fine. Headed lists instead.
  (Doctrine §3. Files are gated by `docs-check.mjs`; chat replies are not, and
  chat is where it happened again on 2026-08-03.)
- **A session CANNOT delete a remote branch.** The git relay drops the
  connection on any ref deletion and then prints `Everything up-to-date`, so it
  looks like it worked. The GitHub MCP has no tool for it either. Hand it to
  Noah as a manual step (GitHub → Branches → bin icon) — never offer to do it.
  (LESSONS, 2026-07-28.)
- **A session CANNOT set repo metadata** — description, website, topics, social
  preview, default branch are all GitHub-UI steps. Propose in `METADATA.md`;
  never report a repo set up while a row says proposed. (Doctrine §10.)
- **AskUserQuestion is permanently banned.** (Doctrine §0.)
- **Verify a push by reading the remote**, not by reading the push output. No
  range line in the output means nothing moved. (LESSONS, 2026-08-02.)

The shape of three of these is the same: **do not offer a capability the
lessons already record as impossible.** Check before promising, not after.

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
says what colour has to clear before taste gets a vote. Append to LESSONS.md
from any app's session whenever something is learned that would have saved time
elsewhere; never fork it into another repo. When a doctrine rule changes, edit it HERE and
tell the sibling repos to re-point (their `CLAUDE.md` files link to this copy).
Never fork the doctrine into another repo — link to it.

## Patch notes are a doctrine rule now (§7d)
Every app that has shipped more than one release SHOWS THE READER WHAT CHANGED,
in the app, reachable from somewhere they already go — the current release at
minimum, written in their words, **including what is still broken**, and
generated from one source rather than typed twice. Added at Noah's instruction
on 2026-08-03. The sibling repos inherit it and each needs the surface built;
none has one yet.

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
token cannot perform. **The values for every app live in
[`METADATA.md`](METADATA.md)** — propose there, Noah applies from there, and
the per-item status flips to `set` only on his say-so. Never report any repo
"set up" while a row says proposed.
