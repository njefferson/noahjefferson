# SECURITY.md — the baseline every repo is held to

Canonical in the hub, like [`DOCTRINE.md`](DOCTRINE.md) and
[`LESSONS.md`](LESSONS.md). **Never fork it — link to it.**

Doctrine §16 says what the posture IS. This says **what to switch on, what
runs automatically, and what only Noah can do**, so "are my repos secure?"
has an answer you can work down rather than a feeling.

No tables — Doctrine §2.

---

## The honest threat model

Nobody is targeting Noah. The realistic path runs the other way: a
compromised package pulled in for a script nobody thinks about, executing on
a runner that is holding a live Cloudflare token. Supply-chain compromise is
indiscriminate; it does not need to have heard of you.

So the things that actually matter, in order:

1. **A token leaking or being over-scoped.** Every deploy runs holding one.
2. **A dependency or Action turning malicious.** It executes next to that token.
3. **A workflow that turns input into code.** Injection in a `run:` block.
4. Everything else.

---

## Part 1 — runs automatically, no thought required

These are wired into CI and exit non-zero. If they pass, that layer is done.

- **`zizmor --offline --strict-collection`** — the maintained GitHub Actions
  auditor. Catches unpinned actions, template injection, credential
  persistence, cache poisoning. **Use this rather than writing one.** A
  hand-rolled pinning checker in this repo passed both apps clean while zizmor
  found 23 real findings in the same files (LESSONS §8 postscript).

  Two things about it are not the defaults and both are deliberate:

  **`--strict-collection` is required.** Without it, a workflow with a YAML
  error is logged at WARN, **skipped, and the run still exits 0 printing "No
  findings to report. Good job!"** — so the file most likely to be wrong is
  the one that never gets audited. This happened here (LESSONS §13).

  **zizmor is itself pinned**, by version *and* hash, in
  [`.github/requirements-ci.txt`](.github/requirements-ci.txt), installed with
  `--require-hashes --only-binary=:all:`. `pip install zizmor` floats on
  whatever PyPI serves that morning — an unpinned binary executing beside a
  deploy token is threat #2 above, and it was live in this repo's own audit
  workflow. That file is canonical in the hub: a sibling repo checks the hub
  out in CI and installs from it, so every app is audited by the same build,
  and Dependabot's `pip` ecosystem bumps the version and the hashes together.

  Locally: `npm run security:install` once, then `npm run security` — and
  `npm run check` runs it, failing with an install hint rather than skipping
  when the tool is absent.
- **[`pin-check.mjs`](pin-check.mjs)** — the npm half zizmor does not do:
  lockfile present, `npm ci` never `npm install`, no undeclared dependencies.
- **`npm audit`** — run it, and do not ship a known-vulnerable tree. If a fix
  needs a major bump, take the major bump.
- **Dependabot** — `.github/dependabot.yml` in every repo, for both
  `github-actions` and `npm`. It is what keeps SHA pins from rotting.

---

## Part 2 — GitHub settings, ONLY NOAH CAN DO THESE

Same class as the repo metadata in Doctrine §10: the session token cannot set
them, so they get listed and confirmed rather than assumed. All are free, all
are a few taps, and all work on an iPad.

**Per repository → Settings → Code security:**

- **Secret scanning: ON**
- **Push protection: ON** — this is the one that matters most. It blocks a
  credential at `git push`, before it is ever in history. A secret that
  reaches GitHub must be treated as burned and rotated, even from a private
  repo, so preventing the push is worth more than any scan afterwards.
- **Dependabot alerts: ON**
- **Dependabot security updates: ON**
- **CodeQL / code scanning: ON** (default setup — one click, free on public
  repos)
- **Private vulnerability reporting: ON** on anything public

**Per repository → Settings → Actions → General:**

- **Workflow permissions → "Read repository contents and packages
  permissions"** — the read-only default. Every workflow here already declares
  `permissions: contents: read` itself, but the repo default is the backstop
  for the next workflow somebody adds in a hurry.
- **"Allow GitHub Actions to create and approve pull requests": OFF**
- **Fork pull request workflows → "Require approval for all external
  contributors"**

**Per repository → Settings → Branches:**

- **Protect `main`** — require the status checks to pass, and no force pushes.
  On a solo repo this is not about other people; it is about a bad afternoon.

**Cloudflare → My Profile → API Tokens:**

- **One token per job, scoped to that job.** The hub already does this right
  and it should stay that way: a Pages-only token for Pages, a Workers-only
  token for the Worker. Never a Global API Key in a repo secret — that one is
  account-wide and cannot be scoped.
- **Set an expiry** on each, and rotate on the calendar rather than after an
  incident.

---

## Part 3 — the current state of the repos in reach

Verified 2026-08-02, by running the checks rather than assuming:

- **photo-field-tools** — zizmor clean, npm audit clean, no credential
  patterns in any tracked file, nothing secret-shaped ever added in history,
  every workflow `contents: read`, lockfile committed, all Actions SHA-pinned.
- **noahjefferson** — same, with one carried exception recorded in
  `.github/zizmor.yml`: 19 template-injection sites in `cf-analytics.yml` and
  `deploy-myfax.yml`. Real, assessed, and not yet fixed — both are
  `workflow_dispatch` only, so triggering one needs repo access you would
  already have. The fix is mechanical and awaits a go-ahead, because rewriting
  live analytics and fax deploys that cannot be tested end to end from a
  session is its own risk.

**Not in reach this session:** photo-pointer, clear-horizons,
Bird-location-scouting, Jefferson-Photography-Studio, ND-toolbox, Quietkeep,
intersecting-parallels. A session can only see the repos picked when it
started (Doctrine §11). **Nothing above should be read as a statement about
them.** Start a session with a repo selected and it takes about ten minutes to
bring it to this line.

---

## The rule that keeps this from growing

**Reach for the maintained tool first.** Every hand-written security check is
one more thing Noah owns, maintains, and has to trust — and the evidence says
the hand-written one is worse. Bespoke gates are for what is genuinely
specific to this work: acceptance criteria, palette roles, offline behaviour,
the handoff. Security tooling is not that. It exists, it is better, and
keeping it correct is somebody else's job.
