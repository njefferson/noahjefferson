# NOTES.md — fax-relay (source of truth)

Read this first, every session. Doctrine: hub repo `DOCTRINE.md`.

## Thesis

Free fax from the phone in your pocket. No fax machine, no Staples run, no
$9.99/month eFax subscription for the two faxes a year that healthcare, legal,
and government offices still demand. One screen: file, number, Send, and a
transmission tape that tells the truth about what happened.

## Architecture (settled)

Static PWA (Cloudflare Pages) → relay Worker (holds the provider key, streams
the document through, stores nothing) → provider adapter. Two adapters behind
one contract (`send`/`status`, normalized statuses `queued | sending |
delivered | failed | unknown`): **faxdrop** (default) and **telnyx** (metered
fallback via R2-staged media URL). Access code header keeps the relay from
being an open fax gun. Offline sends are held in IndexedDB and drained on
reconnect (Background Sync where available, `online` listener otherwise).

## Verified-facts ledger

Promoted only with a locator, per the family evidence discipline.

| # | Fact | Source / locator | Date |
|---|------|------------------|------|
| F1 | FaxDrop is a real service; free tier = 2 faxes/month, each ≤ 5 pages **including a forced cover page**; no card required | faxdrop.com `/free-fax`, `/for-developers` (via search excerpts; site blocks direct fetch from this sandbox) | 2026-07-25 |
| F2 | Send endpoint: `POST /api/send-fax`, multipart, `X-API-Key` auth; accepts PDF/DOCX/JPEG/PNG | faxdrop.com `/for-developers`, `/blog/fax-api-guide` | 2026-07-25 |
| F3 | Status endpoint: `GET /api/v1/fax/{id}`, `X-API-Key`; response has `id`, `status`, `recipientNumber`, `pages`, `completedAt`, `error` on failure | faxdrop.com `/blog/fax-for-ai-agents` (API example) | 2026-07-25 |
| F4 | API rate limits: 10/min, 100/hr, 500/day — status polls count toward them (hence the 8s poll spacing in `app.js`) | same as F3 | 2026-07-25 |
| F5 | Paid price $1.99/fax or volume credits; credits don't expire | faxdrop.com `/for-developers` | 2026-07-25 |
| F6 | Twilio Programmable Fax is dead (sunset 2021-12-17); ignore tutorials built on it | Twilio changelog (well-established) | 2026-07-25 |

## Unverified / needs a live key

- The FaxDrop **send + status round-trip has never been exercised** against a
  real API key. `tools/worker-selftest.mjs` proves the Worker's own logic with
  a stubbed provider; the first live send is the real test. It spends one of
  the month's 2 free faxes — ask Noah before burning one.
- **File-size ceiling**: the relay enforces 10 MB; FaxDrop's free *web* page
  advertises 4 MB. The API's actual limit is unconfirmed — expect the provider
  to reject large files with its own error (surfaced honestly in the tape).
- **Whether the free tier includes API keys at all** (vs. web-only). The
  developer page reads as if it does ("no credit card to get started");
  confirm at signup.
- The **Telnyx adapter** is unexercised end-to-end (needs a paid account,
  R2 bucket, owned number). Treat as scaffolding until proven.
- Exact **status vocabulary** FaxDrop emits mid-flight (`mapStatus` covers the
  plausible set and falls through to `unknown`, never guessing `delivered`).

## Doctrine §1 deviation (accepted, bounded)

Faxing cannot be local-first: the document transits the relay and the carrier.
Bounds: relay stores nothing; FaxDrop deletes on transmission end (their
published claim — F1 source); history/settings live only in the browser; no
analytics, no server-side anything else. Stated in the app footer. Never widen
this.

## Roadmap

- **1.0.0 (staged)** — first release: single send, tape, activity log, offline
  queue, relay settings. Awaiting: repo creation, deploys, live-key test,
  Noah's on-device pass.
- Later, maybe: receive-a-fax (needs a number — monthly cost, Noah's call),
  page-count preflight so the free tier's 5-page cap never surprises,
  cover-note field (FaxDrop accepts `includeCover`).

## Project facts

- Nothing has shipped yet. Session 2026-07-25: app reviewed, corrected, and
  staged on the hub's `claude/free-fax-pwa-c4bzw3` branch (orphan — carries
  this tree only) because the repo did not exist when the session started and
  sessions cannot add repos mid-flight (Doctrine §11).

## Waiting on Noah (the durable signal)

1. **Create the repo** (suggested name `fax-relay`; any name works) with
   branches `main` + `staging`, then start a session with BOTH the new repo and
   the hub selected, and say "move the fax app in". That session copies this
   tree over, fixes the Required-Notice URL in LICENSE.md, wires the hub link,
   and deletes the hub's carrier branch.
2. **FaxDrop account**: sign up at faxdrop.com, grab the API key from the
   dashboard (needed for `wrangler secret put FAXDROP_API_KEY`). Free tier =
   2 faxes/month, ≤ 5 pages each incl. their forced cover page.
3. Accept (or veto) the §1 deviation above — it's inherent to the product.
4. Repo metadata (§10) — after creation, exact values will be listed then.
