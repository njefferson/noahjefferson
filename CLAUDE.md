# CLAUDE.md — noahjefferson (the personal hub)

> **Inherits the Universal App Doctrine** — the canonical copy lives in THIS repo
> at [`DOCTRINE.md`](DOCTRINE.md). It is the single source of truth for the rules
> shared across all of the owner's apps: product values, taste, accessibility,
> honesty, verification, release discipline & taxonomy, licensing (PolyForm
> Noncommercial), privacy, the permanent **AskUserQuestion ban** (§0), and the
> **repo-metadata confirm rule** (§10). **Where anything below overlaps the
> Doctrine, the Doctrine wins.** This file keeps only what is specific to this repo.

## Start here: the brief is printed for you
`.claude/hooks/session-start.sh` runs at session start and prints
[`session-brief.mjs`](session-brief.mjs) — which branch this is versus where work
belongs, whether the doctrine has moved since this repo last reconciled, the repo
family, and every LESSONS title. **It exists because all of that was already
written down and none of it was being read.** A session loads exactly one file
automatically, and every other rule here had to be opened by somebody who
remembered it existed.

[`REPOS.md`](REPOS.md) is the map: six repos, their branch models, deploy targets
and what each still owes. It did not exist until 2026-08-10, which is why
sessions kept asking questions that had already been answered — the repo list had
never been written anywhere, so there was nothing to remember it from.

## The rules that get broken anyway — read these before typing
This is an INDEX, not a fork; the canonical text is in `DOCTRINE.md` and
`LESSONS.md`. It exists because those two files must be OPENED, while this one
is loaded into every session automatically — so a rule that lives only there
gets read once at the start of a long session and broken four hours later.
Every item below has actually happened.

- **THE CREDIT IS THE OWNER'S MONEY AND A SESSION CANNOT SEE THE BALANCE.** No warning
 will ever arrive, so the restraint is unconditional. Nothing expensive by
 reflex — a browser walk, an a11y run, a CI poll loop, re-reading a file already
 read — each is a deliberate spend. Say what a long run will cost BEFORE
 starting it. **"Continue" resumes the work in front of you; it is not authority
 to start a sweep of your own** — that is the exact act that burned a $250 grant
 in one session, unannounced, while the owner watched a silent five minutes.
 Hand mechanical work to a cheaper model in a subagent; top tier is for
 judgement. (Doctrine §11b.)
- **NEVER A TABLE OR GRID, anywhere the owner reads** — chat, commits, PR bodies,
 `NOTES.md`, all of it. They do not render on an iPad; the columns are lost
 silently while the prose around them looks fine. Headed lists instead.
 (Doctrine §2. Files are gated by `docs-check.mjs`; chat replies are not, and
 chat is where it happened again on 2026-08-03.)
- **ANYTHING THE OWNER IS MEANT TO PASTE IS ONE FENCED CODE BLOCK** — handoff prompts,
 commands, configs, a message to send on. Not prose, not a blockquote, not
 styled markdown. The test is not "is it readable" but "what happens to
 it next"; if the answer is *copy*, it is a block. (Doctrine §2.
- **A session CANNOT delete a remote branch.** The git relay drops the
 connection on any ref deletion and then prints `Everything up-to-date`, so it
 looks like it worked. The GitHub MCP has no tool for it either. Hand it to
 the owner as a manual step (GitHub → Branches → bin icon) — never offer to do it.
 (LESSONS, 2026-07-28.)
- **A session CANNOT set repo metadata** — description, website, topics, social
 preview, default branch are all GitHub-UI steps. Propose in `METADATA.md`;
 never report a repo set up while a row says proposed. (Doctrine §10.)
- **ONLY NOAH DECIDES WHAT GOES ON THE HUB.** Adding an app here is advertising
 it under the owner's name. A session adds one only when the owner NAMES it — not because it
 is finished, not because it is already live, not because §13.6 says a repo
 gets wired in, not because its absence looks like an oversight. It binds
 proposing and restoring and *mentioning an unlisted app as a candidate*, which
 is the one that feels safe and is not. Every deployed surface counts, not just
 the front page: the noscript list, the accessibility statement's app list,
 tiles, icons. Removal is the owner's call too. (Doctrine §0c — on being told
 this rule was nowhere in this file, the owner was right that it should not
 have needed to be; it is written here because it turned out to be necessary.)
- **THE GIT-HISTORY QUESTION IS SETTLED — never offer "make it private" or
 "contact GitHub Support" again.**
 Quietkeep's history was rewritten
 on the owner's word; the residue that survives is ACCEPTED. A history scan coming back
 red is not new information and is not a reason to re-open it — record the
 locations and carry on. This is the same shape as the branch-deletion and
 metadata items above: a remedy that keeps getting re-offered because the
 record used to say "report it with the options". It no longer does.
 (Doctrine §9b.)
- **NEVER QUOTE THE OWNER, AND NEVER ATTRIBUTE ANYTHING TO THE OWNER BY NAME, IN ANY REPO.**
  Not in a comment, not in `NOTES.md`, not in a commit message, not in a release
  note, not in the doctrine or the lessons. These repos are PUBLIC and carry the owner's
  name; what went in them was ordinary speech, frustration and swearing,
  republished under a real name in a public place.
  787 sites across two repos before it was caught, including inside the files
  that define what must never land in a repo.
  **Write what was wrong and what it measured. Never who reported it, and never
  in what words** — "the scope was 269px against the horizon's 217" is the whole
  engineering fact, and everything else is somebody's message. Quoting the person
  who found a defect FEELS like provenance; it is not provenance.
  TWO HARD GATES, because the rule has two halves and only one was covered.
  `privacy-check.mjs` fails on attribution as well as disclosure, and was watched
  going red on 42 real sites in the pre-scrub tree — but every pattern in it
  anchors on the owner's NAME, so it cannot see a verbatim quotation that carries
  no name at all.
  **Six of those were found by hand in two repos with every gate green.**
  `quote-check.mjs` is the other half: every set-apart quotation is declared as
  *document*, *product-copy* or *analysis* in a repo-local `.quote-allow`.
  It is a LIST rather than a pattern because three pattern rules were measured
  against the real violations and flagged 39, 138 and 227 files of honest prose —
  ordinary speech and the product's voice are the same shape
  (LESSONS §108). **Every sibling repo owes the wiring.**
- **Multi-stage work carries a LIVE STATUS PAGE, and its link goes in EVERY
 progress reply** — not once at creation. Chat scrolls; on an iPad a plan agreed
 on Monday is unreachable by Wednesday. Published once, updated in place at the
 same URL, showing every stage's state, the staging/production versions, the
 last SHA verified green, what is waiting on THE OWNER, and what was found and NOT
 fixed. **The owner having to ask for the link is the signal the rule was broken** —
 which is what happened, twice, during a seven-release run. (Doctrine §7i.)
- **CONFORMANCE IS NOT REACHABLE — ask who takes this route, with what hand.**
 These apps are used on a TABLET, BY TOUCH, and every accessibility gate in the
 family measures conformance, which is defined for input methods in general.
 Quietkeep shipped the textbook skip-link — off-canvas until focused — from its
 first commit, with `autofocus` in the SAME commit putting the document's focus
 after it, so it was never reachable by tabbing forward either. Unreachable by
 finger for 142 releases, with contrast, focus rings, targets and axe green
 throughout in both themes, while the thing it was the only route to sat 4.9
 screens down on a phone. **A feature nobody can reach is worse than a missing
 one** — its presence in the source answers "have we handled this" for everyone
 after. A focus-revealed control is a KEYBOARD route: keep it, and give the same
 destination something a finger can reach. (Doctrine §4; LESSONS §95;
 `quietkeep:tools/touch-check.mjs`.)
- **AskUserQuestion is permanently banned.** (Doctrine §0.)
- **Verify a push by reading the remote**, not by reading the push output. No
 range line in the output means nothing moved. (LESSONS, 2026-08-02.)
- **A PUSH IS NOT A RELEASE — check the DEPLOY for that exact SHA.** fauxplane
 pushed four releases that never deployed; every push was verified against the
 remote, correctly, and every deploy had failed on a CI gate added that
 afternoon. The owner stayed on the old build for four releases while each was
 reported as shipped, and found out by asking about a feature
 that had never left the branch. **A session adding a hard gate to a pipeline
 has just added a new way for its own work to silently not arrive**, and is at
 its least likely to look because it watched that gate pass locally.
 (LESSONS §53; `handoff-check.mjs --ack=deploy-green`.)

The shape of three of these is the same: **do not offer a capability the
lessons already record as impossible.** Check before promising, not after.

## The baseline every app ships without being asked (Doctrine §7e, §7f)
The owner should not have to request these per repo; the owner has, repeatedly, and the
asking was the evidence the doctrine was missing a rule. Build them because the
app exists.

- **An (i) control in the app's own chrome** — not a tab, not a footer link —
 carrying what the app IS, what it is NOT, how to install it on a home screen
 with every platform NAMED, what changed, where the data comes from with its
 terms, how to report a problem, and the accessibility statement and licence.
- **First-run orientation that SURVIVES whatever the reader presses to begin**,
 and then lives permanently behind the (i). Move it there; never copy it.
- **Patch notes from one source** (§7d), including what is still broken.
- **A text diagnostic report** (§7f). Ask the owner for that, never for a screenshot,
 and make it carry what the browser string HIDES — iPadOS Safari reports itself
 as macOS, so `maxTouchPoints` is what tells an iPad from a Mac.
- **A way to say the app has gone stale** (§7h). Every app here is offline-first,
 so every app here has this defect until it is fixed on purpose: the new version
 waits, the reader is TOLD in a standing indicator, and a newcomer never is.
 Gated by `pwa-check.mjs`.

**And the rule behind them: if the owner says the same thing in two apps, it belongs
in `DOCTRINE.md`, and the session that hears the repeat writes it in.**

**Where each app stands (keep this current — it is the thing a new session
checks before offering to build one of these again):**

- **Intersecting Parallels** — all of them built, 2026-08-03. Patch notes in 1.19.0
 (generated from CHANGELOG.md, drift-gated), the diagnostic in 1.20.0, the (i)
 and the first-run move in 1.21.0; §7h's stale-app offer in 1.22.0, which also
 removed a `skipWaiting` that had been serving a MIXED app — old markup, new
 modules — for twenty-two releases. Each is asserted by the walk, not assumed.
- **fauxplane** — all of them, 2026-08-03. The (i) menu, first-run move, patch
 notes (`releases.js`, one source, version-pinned by a test) and the §7f
 diagnostic were already there; §7h's stale-app offer landed in 1.17.0 and
 removed a `skipWaiting` on install, plus a `boot.js` that had been silently
 reloading the reader whenever it found a stale shell. Its `checkUpdateStrip`
 drives a REAL second worker and is worth copying.
- **Quietkeep** — all of them, and each one is asserted rather than assumed.
 The first-run walkthrough is State 0 of `tools/a11y.mjs` and the (i) panel is
 gated behind it, so the orientation SURVIVES the thing a reader presses to
 begin (§7e); patch notes come from one source, `src/ui/changelog.ts`, which
 the app renders and `tools/changelog.mjs --check` holds identical to
 CHANGELOG.md and to the service-worker triplet; the §7f diagnostic is there
 and is asserted to contain nothing the reader wrote; §7h's waiting worker is
 driven by `tools/update-walk.mjs` against a REAL second worker. Two later
 additions worth copying: the update strip's stuck state is audited as its own
 a11y state (1.20.2 — it shipped unmeasured for a day), and the offline
 privacy-pattern mirror is held to the hub by `privacy-mirror-check.mjs` in
 its Spine.
- **Every other sibling** — still owed. Ask that repo's NOTES before assuming.

The two omissions worth knowing before building one: a new surface must join the
a11y gate's surface list **in the same commit**, or it ships unmeasured (hub
LESSONS §28 — now mechanical in that repo, worth copying), and an (i) button
labelled with `aria-label` passes a substring SC 2.5.3 check by pure accident
(§29). Both cost a release each here.

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

## Eleven gates live here and serve every repo
Never fork these either — they take `--repo ../app` (or a path) so a sibling
runs them without copying them, which is what stops five divergent versions
existing.

- [`branch-guard.mjs`](branch-guard.mjs) — **refuses a commit on the wrong
 branch**, and now also runs whatever repo-local checks `.branch-guard` names
 with `also=` (repeatable, one path per line, each an executable in the repo).
 Those run on EVERY commit including a promote, because they are about WHAT is
 being committed rather than where — and a missing or non-executable one is a
 FAILURE, never a skip, because a declared check that quietly stops running is
 the same fail-open the hook's own history is about. Quietkeep uses it to refuse
 a commit that changes its UI without re-rendering the walkthrough photographs
 it ships; the general shape is **anything generated FROM the app that would
 otherwise go stale in the tree**, which an instruction in a file never once managed. A session checks
 production out to promote, does not switch back, and commits the next release
 onto production; nothing about the act looks different at the time. Each repo
 declares `.branch-guard` (`work=`, optional `promote=` and `escape=`) and this
 GENERATES the hook — a hook has to be a real file in the repo, so the copy in a
 sibling is an artefact like CHANGELOG.md, and running it without `--install`
 fails on drift. **It installs into `.git/hooks`, never `core.hooksPath`**: the
 first version pointed at the tracked directory and failed OPEN, because
 checking out an older branch deletes the hook with it, and the branch most in
 need of protecting is the one most likely to be older. Wire the install into
 whatever the repo runs on setup — `npm ci` via `prepare` where there is a
 package.json.
 **IN CI, RUN IT WITH `--artefact` OR IT WILL FAIL EVERY TIME.** The plain check
 also asserts that `.git/hooks/pre-commit` is installed and current, which is a
 fact about ONE CLONE — and `actions/checkout` leaves `.git/hooks` empty by
 definition, so it can never hold on a runner. Quietkeep's Spine ran the plain
 check and NEVER ONCE went green — ten runs from the commit that added the step,
 seven concluding failure and three cancelled by a superseding push; it had been
 watched passing locally, where the hook is installed, which is
 the one place it proves nothing about CI. `--artefact` checks the tracked hook
 against `.branch-guard` and PRINTS the two checks it skipped. Never `--install`
 in CI instead: that WRITES the tracked file, repairing the drift the step exists
 to find. **If any sibling runs this in CI, check which spelling it uses.**
 (LESSONS §107.)
- [`palette-check.mjs`](palette-check.mjs) — the colour floors (PALETTES.md).
- [`docs-check.mjs`](docs-check.mjs) — the no-grid rule (Doctrine §2) over every
 tracked `.md`. `node docs-check.mjs .` from the hub, or
 `node ../noahjefferson/docs-check.mjs .` from a sibling.
- [`lessons-check.mjs`](lessons-check.mjs) — every lesson in LESSONS.md
 declares `GATE`, `CHECKLIST` or `JUDGEMENT`, and a cited gate that does not
 exist FAILS. `--checklist` prints the steps no script can perform; run it
 before any handoff.
- [`pin-check.mjs`](pin-check.mjs) — npm hygiene only: `npm ci` never
 `npm install`, a lockfile beside every package.json, no undeclared deps.
 **Workflow security is `zizmor`'s job, not this file's** — see SECURITY.md.
- [`handoff-check.mjs`](handoff-check.mjs) — a staged candidate is recorded in
 NOTES.md with its URL and version, no instruction tells an iPad-first owner to
 fetch a file from a repo, and the four un-automatable handoff obligations are
 acknowledged. LESSONS §26 is why it exists.
- [`pwa-check.mjs`](pwa-check.mjs) — Doctrine §7h, for any repo with a service
 worker: the new version WAITS rather than taking over under the open page, the
 reader is told in words a reader can see, the diagnostic can read
 `caches.keys`, and the cache name carries the release. An app that caches
 itself cannot notice it has gone stale — that is what caching means — so this
 is invisible until someone checks. LESSONS §31.
- [`privacy-check.mjs`](privacy-check.mjs) — **nothing personal about the
 owner lands in any repo — a FAIL state** (the owner, 2026-08-04). Product framing
 and population-level research are public on purpose; a sentence attaching a
 diagnosis, health fact, or identity disclosure to the OWNER is the
 violation. Narrow on purpose — a false positive teaches sessions to route
 around it. It reads the working TREE only; git history is out of its reach
 and rewriting public history is the owner's call, never a session's.
 **No file is exempt** — it scans itself and its own Quietkeep test, skipping
 only a sentinel-marked region of pattern source that a second rule holds to
 no proper name and no date. The whole-file exemption it shipped with is where
 the material collected, and green there meant *not looked at*.
 LESSONS §52 is why it exists, the same day the rule was stated.
 **A HARD CI gate in every repo per Doctrine §9b** . Wired: the hub (`doctrine.yml`) and Quietkeep (its Spine checks
 the hub out and runs the canonical copy). **Every other sibling still owes
 the CI step** — wired means the exact CI command was seen red on a LOCAL
 plant, never a pushed one (a pushed plant IS the violation).
- [`privacy-history-check.mjs`](privacy-history-check.mjs) — the same patterns
 over every commit reachable from every ref, plus every commit MESSAGE, which
 no later commit can clean because a message is not a file. **Reports
 locations only — path, short SHA — and never prints the matched text**, because
 on a public repo the Actions log is public and a gate that quotes its find
 republishes it on every failure. **Deliberately NOT in CI**: history does not
 change on a push, so a per-push run measures nothing, and the remedy is
 rewriting published history, which is the owner's call and never a session's or a
 workflow's. Run it when adopting the privacy gate in a new repo, and again
 after any rewrite, to verify. This is the gate that answers "what about the
 history" — the question `privacy-check.mjs` has always had to decline.

- [`quote-check.mjs`](quote-check.mjs) — the privacy rule's SECOND half: never
 in what words. Finds every set-apart quotation (a `> *"…` blockquote) and
 requires each to be declared in the repo's `.quote-allow`. `--list` prints a
 seed. A quotation of the owner is never declarable — rewrite it as what was
 wrong and what it measured. Both directions, so a scrub cannot silently
 un-cover a file. LESSONS §108 is why it is a list and not a pattern.
- [`privacy-mirror-check.mjs`](privacy-mirror-check.mjs) — a sibling that must
 fail `npm test` OFFLINE has to carry its own copy of the disclosure patterns,
 and that copy is a liability the moment the canon moves. This compares the
 regex literals in the repo's sentinel region against
 [`privacy-patterns.mjs`](privacy-patterns.mjs) — **the one source, which both
 hub gates now import rather than inline** — and fails on any difference.
 Wire it beside the privacy gate in the job that already checks the hub out.
 It exists because a narrowing fix reached one of three copies, and the stale
 ones kept the over-broad pattern that had already blocked four consecutive
 deploys (LESSONS §53). A stale mirror is not a smaller gate, it is a
 DIFFERENT one.

- [`doctrine-sync.mjs`](doctrine-sync.mjs) — **run this FIRST in any sibling
 session**: `node ../noahjefferson/doctrine-sync.mjs --repo .`. It says what has
 landed in the hub since that repo last reconciled — which files, which commits,
 and **which sections of DOCTRINE.md**, because "DOCTRINE.md changed" sends you
 to re-read 900 lines and "§7e changed" sends you to the paragraph. Each sibling
 records the hub commit it has read in a `.doctrine-sync` file; `--adopt` moves
 it, and that is an ASSERTION the drift was read, like handoff-check's `--ack`.
 Exits non-zero on unreconciled drift.

 **Not a CI gate, deliberately.** A sibling's CI going red because the hub moved
 trains everyone to ignore red, and CI cannot tell a *session* what it has not
 read. This blocks the session, which is where the failure actually happens.

`npm run check` runs the hub's own, **including `zizmor`** — run
`npm run security:install` once first; the gate fails with an install hint
rather than skipping when the tool is absent.
`.github/workflows/doctrine.yml` runs lessons, pins and `zizmor` on every push
and PR.

zizmor is always invoked with **`--strict-collection`**, and is itself pinned by
version and hash in [`.github/requirements-ci.txt`](.github/requirements-ci.txt)
— which is canonical here, so every sibling repo installs the same build. Both
of those are load-bearing and neither is a default; SECURITY.md says why, and
LESSONS §8 and §25 say what it cost to find out.

[`SECURITY.md`](SECURITY.md) is canonical here too — the baseline every repo
is held to, splitting what CI enforces from the GitHub and Cloudflare settings
only the owner can switch on. Confirm those the same way as repo metadata (§10):
list them, never assume them.

## Patch notes are a doctrine rule now (§7d)
Every app that has shipped more than one release SHOWS THE READER WHAT CHANGED,
in the app, reachable from somewhere they already go — the current release at
minimum, written in their words, **including what is still broken**, and
generated from one source rather than typed twice. Added at the owner's instruction
on 2026-08-03. The sibling repos inherit it and each needs the surface built.

**THREE HAVE ONE, and this paragraph said otherwise for a week.** Intersecting
Parallels (1.19.0, generated from CHANGELOG.md with a `notes:check` that fails on
drift), fauxplane (`releases.js`, one source, version-pinned by a test) and
Quietkeep (`src/ui/changelog.ts`, held identical to CHANGELOG.md and to the
service-worker triplet by `tools/changelog.mjs --check`). **3d-printing-pal and
photo-pointer still do not.**

This sentence used to read "Intersecting Parallels has one; the others still do
not", which was true when written and was never updated as the other two built
theirs — while the per-app list ninety lines above this said all three had them.
**One file, two answers.** The per-app list is the one that gets maintained,
because it is the one a session checks before offering to build a surface again;
so this paragraph now points at it rather than restating it.

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
[`METADATA.md`](METADATA.md)** — propose there, the owner applies from there, and
the per-item status flips to `set` only on the owner's say-so. Never report any repo
"set up" while a row says proposed.
