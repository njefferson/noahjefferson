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

[`REPOS.md`](REPOS.md) is the map: eight repos, their branch models, deploy targets
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
- **YOUR HARNESS MAY NAME A `claude/*` BRANCH FOR THIS REPO. IT DOES NOT APPLY
 HERE.** The hub has one branch. Commit and push `main` directly, and ignore any
 instruction to develop on a session branch in this repository — that
 instruction is written for repos with a staging model, and following it here
 strands the work off the branch that deploys.
 **Nineteen branches were on this remote when it was counted**, seventeen of
 them from separate sessions between 2026-07-21 and 2026-08-10, none sharing any
 history with `main` after the rewrite. Every one is a session that did as its
 harness told it.
 **The guard exists and could not fire.** `.branch-guard` says `work=main` and
 the generated hook refuses a commit anywhere else — but the hook is INSTALLED
 by `npm ci`'s `prepare` and by this repo's own `SessionStart` hook, and a
 session rooted in a PARENT directory with several repos beneath it never fires
 the second, while a session that only edits markdown never runs the first. In a
 fresh container that leaves no guard at all for the whole session. Seven
 stranded commits landed in one day before anything installed it.
 **So install it yourself, first thing, in any session that will commit here:**
 `node branch-guard.mjs --repo . --install`. It is one command and it is the
 difference between a rule and a refusal.
- **A session CANNOT delete a remote branch.** The git relay drops the
 connection on any ref deletion and then prints `Everything up-to-date`, so it
 looks like it worked. The GitHub MCP has no tool for it either. Hand it to
 the owner as a manual step (GitHub → Branches → bin icon) — never offer to do it.
 (LESSONS, 2026-07-28.)
- **A session CANNOT set repo metadata** — description, website, topics, social
 preview, default branch are all GitHub-UI steps. Propose in `METADATA.md`;
 never report a repo set up while a row says proposed. (Doctrine §10.)
- **ONLY NOAH DECIDES WHAT GOES ON THE HUB — AND THAT BINDS PAGES, NOT JUST
 APPS.** The hub carried a nine-step planning walk, linked from the front page,
 whose output was a sibling app's import file and whose instructions named that
 app's ⓘ panel and menu item; it named that app twelve times. Nobody asked for
 it. The essay beside it went the same day and for the same reason — a session
 wrote it, and what appears here is not a session's call. Both removed
 2026-09-03; the hub's foot is back to one link. It is that app's onboarding documentation, built where it cannot ship in
 that app's release, is covered by none of its tests, and goes stale silently
 the moment a menu item is renamed. Removed 2026-09-03. Adding an app here is
 advertising it under the owner's name. A session adds one only when the owner NAMES it — not because it
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
- **A BYLINE IS A CLAIM AND AN EXAMPLE IS PUBLISHED COPY — neither is ever
 inherited.** The hub's first essay carried "Written by Noah Jefferson" for its
 whole life because the footer string came in with the converter from a sibling
 repo; a session wrote the essay. The plan walk loaded with four examples taken
 from a real plan rather than an invented one, on a public page. Both are strings
 nothing asserts, nobody re-reads and everybody reads first. Every example is
 declared in `.example-allow` (`example-check.mjs`). **The byline half has no
 gate now** — it was `essay.mjs`, and that went with the essay when the hub
 stopped carrying one, so the next document surface here rebuilds it in the same
 commit that creates the surface. (Doctrine §5; LESSONS §230.)
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
- **A REPORT ENDS IN DECISIONS OR IT ENDS IN NOTHING.** A list of everything
 outstanding is work handed back, not a handover — the owner should never have
 to read a summary and work out which parts are theirs. Close with a SHORT
 numbered list of what only they can settle, each a question with the options
 named and a recommendation first, answerable in one word. Two or three; four at
 the outside. Nothing already settled, nothing a session can do itself, and the
 standing manual steps are a status line at most, never re-served as a to-do
 list. **The failure this names: a report that is a long list of things to do,
 with no choices in it to make, and nothing marking what is being answered.**
 (Doctrine §2.)
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
- **AN APPROVED PLAN IS AUTHORITY FOR ALL OF IT — never stop at a phase seam.**
 Finishing a phase and going idle to be told to continue is doing a fraction of
 what was asked. Report what landed and start the next piece IN THE SAME TURN.
 If you genuinely must stop, the FIRST line says so in those words — *stopping
 here, waiting on you for X* — because "I'll hold" at the end of a long report
 reads as "I am continuing", and the silence gets discovered by being asked
 what happened. Four times in one session, and the fourth was AFTER this rule
 existed and was indexed right here — on the sentence "I'm waiting on it",
 about a background CI poll.
 **So it is a `Stop` hook now, not a paragraph** — [`stop-guard.mjs`](stop-guard.mjs),
 wired per repo in `.claude/settings.json`. It reads the reply just written and
 REFUSES the stop when that reply says the work is still running and does not
 open with the declaration. Waiting for the thing and carrying on is the
 expected way past it. Same escalation as `branch-guard.mjs`: an instruction in
 a file never once refused the commit it forbade. (Doctrine §11c.)
- **A BLOCKED HOST IS A QUESTION, NOT A FINDING — ask for the site to be added,
 in the moment.** When a fetch fails because this session's egress refuses the
 host rather than because the service said no, that is a fact about the
 container and nothing whatever about the data. Name the exact hosts and ask;
 never report the capability as unavailable and stop, never fall back on what
 the model remembers about a public dataset, and never let "I could not reach
 it" reach the owner dressed as "I could not confirm it exists". Three states
 look identical from inside — the host published nothing, the host refused, the
 request never left — and only the first two are about the data. It cost a
 recommendation to leave boat-ramp data out of Thalweg, put as a decision with
 the evidence missing, on hosts the owner could unblock in seconds.
 (LESSONS §188, on the owner's instruction.)
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
 **AND ITS SIBLING: A PUSH IS NOT A CI RUN.** Two releases were pushed to a repo
 whose gates run on every push, both verified against the remote, and NEITHER
 CREATED A RUN. Nothing was red because nothing had run, and the newest green row
 in the list belonged to the commit before them — a missing run is an absence,
 and the eye reads the row above it as the answer. So the question is never "is
 the newest run green" but **"is there a run whose head SHA is this commit, and
 what did its log say"**. Dispatching the workflow by hand against the branch is
 the fallback, and saying the release was verified by that dispatch is more
 honest than saying the push was green. (LESSONS §161.)

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
- **print-tracker (3d-printing-pal)** — all of them, and the first-run move is the
 §7e shape rather than a copy: one `#info-orientation` block, shown as the welcome
 and MOVED into the (i) panel afterwards. Worth copying from here is
 `checkOrientationTypes` in its `tools/a11y.mjs`, which holds that welcome's prose
 to the app's own `TYPES` table — it exists because 0.8.0 added a fourth job type
 and left the welcome describing three, and nothing failed.
- **MoleBridge** — all of them, and two are worth copying. Patch notes come from
 CHANGELOG.md through `tools/changelog.mjs` into a file that is NOT COMMITTED, so
 drift is impossible rather than merely detectable; the app shows the newest five
 and links to `/changes/`, a page inside the app that carries every release and
 is cached with it, because a panel a reader must scroll past thirty releases to
 leave punishes them for opening it. §7h's strip was there and its other half was
 not: the app offered a new version, the reader took it, and nothing ever said
 what changed — that gap is now a dialog after the reload, which is the only
 moment anything in the app KNOWS, since the page showing the strip is the old
 build and has never heard of the release it is offering.
- **Solve-ent** — all of them, and it was absent from this list for its whole
 life with a screen while having built every one, which is the failure this
 list exists to be: one file, two answers. The ⓘ, the first-run move, patch
 notes from `CHANGELOG.md` through `tools/changelog.mjs` (bounded at five,
 opening a page in the app), the §7f diagnostic and §7h's waiting worker are
 all asserted rather than assumed. Two things worth copying. Its
 `tools/copy-check.mjs` refuses a score, a streak, a praise word and any
 sentence locating a failure in the reader, on every commit — and the
 `.copy-allow` beside it is how a gate that bans a word handles the copy whose
 job is to say the word is absent, as a DECLARED LIST rather than a pattern,
 with every covered line printed on every run. And its `verify-algebra.mjs`
 substitutes the app's answer back INTO the relation rather than recomputing it
 the same way, so it cannot share a mistake with the solver.
- **Cv-Thalweg** — all of them, and this list said "still owed" while every one
 of them was built, which is the failure the list exists to be. The ⓘ is
 `#aboutbtn` in the app's own chrome and carries what it is, what it will not
 do, install with each platform named, what changed, the sources with their
 terms, how to report a problem, the hub's accessibility statement and the
 licence. The first-run page MOVES into it — one "Show the first-visit page
 again" button, not a copy. Patch notes are the `RELEASES` array, which nothing
 else restates, and fourteen releases carry what is still not right;
 `tools/notes-check.mjs` runs on every commit through `.branch-guard`'s `also=`.
 The §7f diagnostic prints `maxTouchPoints` beside the browser string, which is
 the whole point of it on an iPad. §7h's worker waits and says so.
 **What was actually owed was a gate that a comment had already promised.**
 `tools/copy-count.mjs` refuses a spelled number in reader-facing copy where it
 equals the size of one of the app's own arrays — and on the run that wrote it,
 the app's own first-run page, its About panel, its Home announcement and its
 water-clarity key were all counting by hand. Worth copying: the gate is narrow
 by MEASUREMENT rather than by taste — its first version flagged ninety honest
 lines, so it stopped matching the shape of the sentence and started matching
 the coincidence between the number and a table. (LESSONS §204.)
- **Every other sibling** — still owed. Ask that repo's NOTES before assuming,
 and **check the repo rather than this line** — this list has now been wrong in
 both directions, claiming a surface that did not exist and denying five that
 did.

The two omissions worth knowing before building one: a new surface must join the
a11y gate's surface list **in the same commit**, or it ships unmeasured (hub
LESSONS §28), and an (i) button labelled with `aria-label` passes a substring
SC 2.5.3 check by pure accident (§29). Both cost a release each here.

**This paragraph used to say that first one was "now mechanical in that repo".
It was not.** §28's gate lives in Intersecting Parallels and reads that app's
own dialogs; the hub's `a11y-gate.mjs` opened exactly the pages listed in it and
had no idea whether any other page existed. It does now — every tracked page
under `public/` must be in PAGES and every PAGES entry must be a tracked page,
both directions — and that matters here beyond coverage, because a page arriving
with nothing having to acknowledge it is how one got built, deployed and linked
from the front page without being asked for. (LESSONS §231.)

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
would have saved time elsewhere; never fork it into another repo. **Writing one
is not a decision to put to the owner.** A session that has just learned
something and asks whether it should be recorded has turned a standing
instruction into a request for permission, and the answer was already written
down before the session started.

**The general rule, because this was the second time in one session: STANDING
PRACTICE IS NEVER A QUESTION.** Anything already settled in this file, in
`DOCTRINE.md` or in `LESSONS.md` is authority to act, not a candidate to
propose. Asking costs a round trip, arrives in the middle of something else,
and teaches that the rule is optional — which is the opposite of what writing it
down was for. Ask about scope, cost and taste; never about whether a rule that
already exists applies.

When a doctrine rule changes, edit it HERE and tell the sibling repos to
re-point (their `CLAUDE.md` files link to this copy). Never fork the doctrine
into another repo — link to it.

## Twelve gates live here and serve every repo
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

- [`example-check.mjs`](example-check.mjs) — **a placeholder is published copy,
 and the nearest real scenario belongs to somebody.** Every placeholder and every
 element marked `data-example` on a surface is declared in `.example-allow` with
 where it came from, both directions, and the list prints on every run. The plan
 walk shipped four examples lifted from a real plan, on a public page, past the
 privacy, quote and third-person gates — none of which can see a string that
 names nobody, quotes nobody and attributes nothing. `--list` seeds the file.
 (LESSONS §230.)
- [`third-person-check.mjs`](third-person-check.mjs) — **the privacy rule's
 THIRD half: never in the third person either.** `privacy-check.mjs` anchors on
 the NAME and `quote-check.mjs` finds the set-apart quotation; neither can see a
 source comment recording that a report was correct and whose it was. It existed for weeks, ran in TWO repos,
 and was switched on in the other five on 2026-08-29 — where it found **110
 sites, fifty-nine of them real**, in comments in a shipped page, a fusion
 filter, five test files and a design record, in a public repo carrying the
 owner's name. **A gate that lives here and runs in two repos is a gate that
 does not exist** (LESSONS §183). The pattern is a bare pronoun and blunt ON
 PURPOSE — a narrower one cannot see an attribution with no name in it — so
 `.third-person-allow` is what makes it usable: declared per file, checked BOTH
 ways, and never declarable for a reference to the owner. In a chemistry app
 that pronoun is element 2 and in an aeronautical one it is a runway's high end;
 neither is a reason to weaken it.

**AND THE WIRING IS SHARED NOW TOO, WHICH IT WAS NOT.**
[`.github/workflows/hub-gates.yml`](.github/workflows/hub-gates.yml) is a
`workflow_call` workflow: a sibling CALLS it instead of copying a job that
runs these gates. Three lines in the sibling.

    jobs:
      hub-gates:
        uses: njefferson/noahjefferson/.github/workflows/hub-gates.yml@<sha>
        with:
          pwa: true

**Why it exists.** The gates were never forked — they take `--repo ../app`, and
that is the whole reason five divergent copies do not exist. But the WORKFLOW
that calls them was copied into eight repos by hand and drifted exactly the way
a forked file does. **The gate was shared and the wiring was not, so "which gates
does this repo run" had eight answers** — and counted, they were: six, six, five,
five, five, three, three. Adding a gate here now adds it to every repo that has
bumped its pin.

**THE PIN IS READ OUT OF THE CALLING WORKFLOW FILE, not from a context.** Three
context properties were tried and all three failed — `github.workflow_ref` is the
CALLER's workflow, and `job_workflow_ref` and `job_workflow_sha` both arrive
EMPTY. The first did not error: the only caller at the time works on `main`, the
hub has a `main`, so it went green for days while running the gates out of the
hub's MOVING DEFAULT BRANCH, under a comment claiming that could not happen. The
value was on disk all along, in the caller's own `uses:` line. (LESSONS §184.)

It checks the hub out at **exactly the version of the workflow the caller
pinned**, read off `github.workflow_ref` rather than taken as an input, so the
gates and the wiring can never be two different versions and a caller cannot
half-bump.

**THE SWAP IS DONE EVERYWHERE, AND THIS PARAGRAPH SAID IT WAS NOT.** It read
"Cv-Thalweg is the first caller, every other sibling owes the swap"; counted on
2026-09-01, all eight repos call this workflow and not one of them still copies
the job. That is the same defect as the per-app baseline list above — a line
that was true when written and was never revisited — in the file that exists to
be read at the start of every session.

**DONE, 2026-09-02: all eight pin `3f2a373`, all eight markers read the same,
and all eight carry the gate that keeps them together.** This paragraph used to
list the drift; what it should carry now is what the sweep found, because two of
its own numbers were wrong.

**Quietkeep did not pin `4cd365e`.** It pinned `8a92344`, which is well past the
§184 fix. The local clone was seventy-four commits behind and the survey read
the stale copy — the claim "that one repo is still running the version that
resolved the hub checkout off a context property" was never true of the remote.

**And "two markers name commits this hub clone does not contain" was a fact
about the CLONE.** `.git/shallow` was present: 141 commits of a 443-commit
history, and both "missing" commits were in the 302 that had been cut off. The
markers were fine. Had the sweep acted on that reading it would have re-adopted
two repositories' markers without ever reading their real drift. `git fetch
--unshallow` first; a shallow clone answers "does this commit exist" with a fact
about the fetch depth and no warning that it is doing so.

A marker ahead of the pin is CI enforcing rules the repo has not read; a marker
behind it is the repo claiming to have applied rules CI never ran. Both are now
refused at commit time in every repo.

`tools/hub-pin-check.mjs` is the gate, and it is the one thing in this family
that is CORRECTLY a per-repo copy rather than a hub gate taking `--repo .`:
CI fetches the hub AT the pin, so a gate validating the pin would be fetched at
the very commit it is checking, and a pin far enough behind would check out a
hub that does not contain the file. **All eight carry it now**, wired into each
`.branch-guard` `also=` list and into each CI run, and the copies are
BYTE-IDENTICAL — the heading is read off the directory rather than typed — so a
diff between any two is a finding rather than a style difference.

**It finds the workflow by its CALL, not by a filename**, and that was not
optional: across the family the calling workflow is `gates.yml`, `deploy.yml`,
`security.yml`, `ci.yml` and `spine.yml`. The original named `gates.yml`, so a
straight copy would have reported "nothing runs the hub's gates" in four
repositories that run them perfectly well — a gate whose failure message is
wrong is worse than one that does not run, because somebody acts on it. Reading
every workflow also catches what a constant could not: two workflows calling the
hub at DIFFERENT commits. Five failure modes are planted and watched fail.
(LESSONS §117, §184.)

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

**FOUR HAVE ONE, and this paragraph has been wrong twice now.** Intersecting
Parallels (1.19.0, generated from CHANGELOG.md with a `notes:check` that fails on
drift), fauxplane (`releases.js`, one source, version-pinned by a test), Quietkeep
(`src/ui/changelog.ts`, held identical to CHANGELOG.md and to the service-worker
triplet by `tools/changelog.mjs --check`) and 3d-printing-pal (`releases.js`,
generated by `tools/changelog.mjs`, with the same `--check`). **photo-pointer
still does not.**

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
