# Hub reference

These sections were moved from the hub's instruction file on 12 November 2026, and the whole file as it stood is at archive/CLAUDE-2026-11-12.md.

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
- **A TEST PAGE beside it** (§7j, standing everywhere from 2026-09-13). The
 diagnostic reports STATE; the test page RUNS things and reports what they cost,
 on the device, because a container answers a different question: it draws
 through a software rasteriser, its disk is a server's, its cores are not the
 reader's. **A session that needs such a number BUILDS the measurement into the
 app rather than guessing or asking the owner to describe a screen** — one
 button, three runs and a median with the spread printed, read-only with respect
 to the reader's work, and the app version in the copied block. Not a last
 resort: it is faster than three rounds of guessing and it leaves an instrument
 behind. The worked example is Jefferson-Photography-Studio's `debug.html`.
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
 **EXCEPT §7j, and this row said "all of them" for three days after that rule
 became standing.** There is no test page. The §7f diagnostic reports state and
 nothing in the app runs anything and reports what it cost — so the numbers this
 app would actually want on a real tablet (a fold over some thousands of events,
 a Dexie commit confirmed rather than queued, a long held list rendering) are
 all container numbers today, which §7j says are measurements of something else.
 Recorded in that repo's NOTES on 2026-09-16 rather than built, because it is a
 surface and a surface here owes the a11y walk, the live-region gate, the manual
 coverage check and the precache list in the commit that creates it.
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
- **Jefferson-Photography-Studio** — §7h landed 2026-09-10 and is the one worth
 copying, because the SHAPE of the fix matters more than the fix. `sw.js` had
 called `skipWaiting()` inside install, so a new worker took over under the open
 page and activate deleted the old cache beneath it. Removing that ALONE makes
 things worse — the update then waits and nothing says so — and the only surface
 was a Settings button, which is a PULL that helps nobody who does not already
 suspect there is a new version. The standing strip had to land in the same
 commit, and did.
 **Its gate lesson is §264 and it is about the hub's own gate:** `pwa-check` was
 GREEN on "the reader is told, in words" for the whole life of the feature,
 matching a string that is shown only AFTER pressing that Settings button. The
 passing label now says it found a string. Its failing check was always honest.
 Worth copying: `tools`-free but real — the walk drives a REAL second worker by
 rewriting the served `sw.js` with a new CACHE name, and asserts the thing that
 actually distinguishes the builds, which is a takeover with NOBODY PRESSING
 ANYTHING after a settle. Three earlier versions of that walk passed against a
 planted defect. The strip's look is one shared `swstrip.css` imported by the
 module that provides the feature, so three app stylesheets did not grow three
 copies; placement stays per-app.
 **AUDITED 2026-09-21, and the row was wrong in both directions.** All six are
 discharged now. The ⓘ is `#infoBtn` in the app's own chrome; patch notes come
 from one source — `vite.config.ts` defines `__CHANGELOG__` and `__ROADMAP__`
 from a filtered git log and NOTES.md, feeding both the ⓘ and the generated
 `notes.html`, with `tools/patch-note-check.mjs` reading vite's own patterns
 rather than copying them; the §7f diagnostic is `src/diagnostic.ts`, whose
 `deviceLine` prints the app's conclusion beside the browser's claim and the
 touch-point count, which is the iPadOS-as-macOS trap §7f names.
 **§7j is DISCHARGED and this list has never said so** — `debug.html` and
 `src/debug.ts` RUN measurements rather than reporting state: graphics, RAW
 decode on the main thread against a worker with an assertion that both produce
 the same picture, IndexedDB commits one photograph at a time, tile build, GPU
 export, threads, with medians and the individual runs printed. That assertion
 is §7j's suspicious-of-its-own-instrument clause implemented, and this is the
 app the doctrine cites as the origin of the rule.
 **§7e's first-run half was the one thing genuinely owed, and landed
 2026-09-21.** The launcher had the textbook shape in `src/chooser.ts` —
 `#welcomeDlg` opens once under `studio-welcome-seen` and `#infoBtn` reopens the
 SAME dialog — and the editor had none: it was deliberately silent on a first
 visit, and "what it is", "what it is NOT" and the per-platform install list
 lived in `#helpDlg` with nothing linking to them from the ⓘ. Both the start
 screen and the ⓘ now open the same Help section through one function, so the
 words are moved rather than copied.
 **The GATE exists now, with gaps, and this line said it was owed for three
 days after it landed.** `tools/a11y-walk.mjs` section 6 (2026-09-21) asserts
 that `#infoBtn` sits in the editor's own chrome with a name of at least twelve
 characters, and that the start card's "What this is" and the ⓘ's route both
 open Help on the same text. Its gaps, read 2026-09-24: it loads only
 `ir.html`, so the launcher's and Macro Studio's ⓘ are unasserted; and it never
 opens a photograph before trying the routes.
 **Its accessibility walk is committed now (2026-09-14) and the part worth
 copying is not the walk but `tools/surfaces.mjs` beside it**: the list of
 screens the walk visits is checked BOTH WAYS against the BUILD rather than the
 source tree, because one page is generated at build time and a
 repository-derived list would miss a page that ships. It was written without
 knowing Quietkeep already had a file of the same name doing the same job for a
 different shape of input (§119) — two now, deliberately not merged, because a
 shared version has to take the enumeration as an input and that is its own
 piece of work. What it found on its first full run is §298: a stylesheet
 comment had excused a narrow fix on the grounds that every other dialog was
 "a measured, shipped surface", and the sweep had been opening three of
 fifteen.
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

## The shared gates live here and serve every repo
**This heading used to say "Twelve gates".** It listed fourteen, and had for
weeks — a count in a heading is a second answer to a question the list below
already answers, and it is the answer nobody re-derives. Removed rather than
corrected, for the same reason the patch-notes paragraph now points at the
per-app list instead of restating it.

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
 otherwise go stale in the tree**, which an instruction in a file never once managed.
 The hook accepts a commit made inside a rebase of the work branch, because HEAD
 is detached there: it reads the rebase's own head-name record, and a rebase of
 any other branch or of a detached HEAD is still refused (LESSONS §449). A session checks
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
 `node /root/.claude/hub/docs-check.mjs .` from a sibling.
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
 **A HARD CI gate in every repo per Doctrine §9b** . Wired: the hub (`doctrine.yml`), Quietkeep (its Spine checks
 the hub out and runs the canonical copy), and Jefferson-Photography-Studio
 through the shared `hub-gates.yml` (its step "The owner's person is not repo
 material", read green on 2026-09-24). **Every other sibling still owes
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
- [`binary-files.mjs`](binary-files.mjs) — **not a gate; the one list of "this
 file is not prose"**, imported by `privacy-check.mjs` and
 `third-person-check.mjs`. It exists because those two carried two lists for
 the same idea and the lists were NOT the same: one had `otf` and `wasm`, the
 other did not, and NEITHER had `pfb`. A repo vendoring a PDF library brought
 sixteen font files, and one gate reported two finds inside Type 1 glyph data
 while the other did not look at all — both answers wrong, in opposite
 directions. The privacy gate's own header had already written the diagnosis —
 two file lists for one rule is one gate lying about its coverage — directly
 above one of the two lists. It is a DENY-list of binaries, never an allow-list
 of text: an allow-list has to be extended every time a repo grows a file type,
 by somebody who remembers the gate exists. (LESSONS §243.)
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
- [`svg-check.mjs`](svg-check.mjs) — **every tracked `.svg` parses as XML**,
 which is the parser a browser uses when it loads one AS AN IMAGE: a favicon, a
 manifest icon, an `<img src>`, a CSS `url()`. Inlined into a page instead, the
 same file goes through the HTML parser, which forgives what XML refuses — and
 an icon renderer inlines. print-tracker's icon carried two hyphens in a row
 inside a comment, where XML forbids them. Its renderer drew four flawless PNGs
 from it; its drift check held the source and the served copy byte for byte and
 found them identical, because both were equally malformed. Meanwhile the
 manifest offered that file as the app's largest icon, Chromium picked it, could
 not decode it, and **stopped offering to install the app** — never falling back
 to the two correct PNGs in the same list. It is a real well-formedness scanner
 rather than a grep for the last failure, and its verdict was compared against a
 real XML parser over twenty-one files, agreeing in both directions.
 (LESSONS §245.)
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

- [`PROGRAM.md`](PROGRAM.md) — the ranked list of every item of work across the hub and the apps, with each item's goal, acceptance, dependencies, state and plan; a plan serves one item and its close writes the item's state.
- [`program.mjs`](program.mjs) — writes a plan's record into the program and the found folder as one command run as node, the file, a verb and its switches: claim sets items planned, file writes findings with their keys and program items after refusing any text that attributes or discloses, done sets items done, measure writes the plan's cost entry from the cost instrument, and lesson writes a lesson's file and row.

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

**THE SWAP IS NOT DONE, AND THIS PARAGRAPH CLAIMED IT WAS — TWICE.** It read
"all eight repos call this workflow and not one of them still copies the job",
and beneath it "DONE, 2026-09-02: all eight pin `3f2a373`, all eight markers read
the same, and all eight carry the gate that keeps them together." Every workflow
file in all eight was read on 2026-09-04. The counts are:

- **Four call the shared workflow** — Quietkeep from `spine.yml`, Cv-Thalweg
 from `gates.yml`, 3d-printing-pal from its own `gates.yml`, and
 Jefferson-Photography-Studio from its `gates.yml` (read 2026-09-24; this list
 had left it out).
 **That last one is a correction, measured 2026-09-08 by reading the file:** the
 census below had it copying the job at `61a3f9a`, and it has not done that for
 some time. Everything else here is as counted on 2026-09-04 and has not been
 re-read since, so treat the rest as a date rather than as a fact.
- **Three still copy the job**, checking the hub out and running the gates
 directly. MoleBridge pins `a75d92d` (26 Aug) and solve-ent `ac9fcd2` (27 Aug)
 — and **fauxplane passes no `ref` at all**, so `deploy.yml` runs the hub's
 privacy gate out of the MOVING DEFAULT BRANCH. That is §184's failure exactly,
 recorded here as fixed while it was live.
- **Two reference the hub in no workflow** — Intersecting-parallels (its
 `a11y.yml` says it ships the hub's gate rather than calling it) and
 photo-pointer.
- **`tools/hub-pin-check.mjs` is carried by five**, not eight: Quietkeep,
 Cv-Thalweg, solve-ent, 3d-printing-pal (measured 2026-09-08, by the same read
 that corrected its row above) and Jefferson-Photography-Studio (read
 2026-09-24).

**WHAT THAT COSTS RIGHT NOW.** `example-check` was added to `hub-gates.yml` on
2026-09-03 as `042400b`, defaulted on, under a commit saying it runs in every
repo now. It can only reach a repo that CALLS that workflow, and only at a pin
that contains it — and `042400b` is not an ancestor of `3f2a373`. **So it runs in
none of the eight**, while three files say otherwise. Bumping the two callers'
pins is what switches it on; the other six need the swap before the pin means
anything.

**AND EVERY SHA IN THAT CENSUS IS OFF THE LINE NOW, measured 2026-09-19.** The
hub's history was rewritten on 2026-09-18 to take the chat-session trailers out
of every commit message, which gave every commit a new SHA. Of the five hub
commits named above, four are unreachable from `main` — `3f2a373` (2 Sep),
`a75d92d` (26 Aug), `61a3f9a` (22 Aug) and `042400b` (3 Sep), all dated before
the rewrite. **And they still work**, which is why nothing noticed: GitHub keeps
serving a commit no ref reaches, so `actions/checkout` fetches it and the gates
run green out of a tree frozen before the rewrite — one that still carries the
trailers the rewrite existed to remove and can never contain a gate added since.
Fetching `3f2a373` through the API on 2026-09-19 returned it in full, trailers
and all.

So the `042400b` / `3f2a373` comparison above understates it: the question is
not which pin contains `example-check`, it is that **a pre-rewrite pin cannot
contain anything**, and `doctrine-sync --adopt` cannot fix it because the
marker already agrees with the pin. Re-pinning is the whole remedy and it is
per repo. Jefferson-Photography-Studio is re-pinned (`52546b9` since 22 Sep, read
2026-09-24; it was `1f86b51` on 19 Sep) and its
`tools/hub-pin-check.mjs` now REFUSES a pin that is on no branch of the hub,
skipping with a printed line where the hub is not checked out beside it — every
sibling carrying that file owes the same version. **A session that rewrites a
published history owes the sweep of everything pinning it in the same piece of
work**, because afterwards there is no failing signal to find them by.
(LESSONS §334.)

**AND MEASURE IT BY THE CALL.** The first attempt here probed the five workflow
filenames listed above and got "no caller" from six repositories — a fact about
five guesses, in repos carrying between one and eighteen workflows under other
names. `hub-pin-check.mjs` reads every workflow for this reason; a session
checking by hand has to do the same. (LESSONS §240.)

- [`hub-pin-check.mjs`](hub-pin-check.mjs) — **every pin on this hub is a commit
 the hub's `main` reaches.** `node /root/.claude/hub/hub-pin-check.mjs --repo .`
 reads every workflow under `.github/workflows` for a `uses:` line naming this
 hub and refuses a pin that is not a full 40-character commit, one the hub does
 not have, or one `git merge-base --is-ancestor` says its `main` does not reach,
 and refuses a `.doctrine-sync` marker naming a commit the hub does not have. It
 SKIPS, with a printed line, where no hub checkout is found (`--hub`, then
 `../noahjefferson`, then `/root/.claude/hub`). **The copies siblings carry as
 `tools/hub-pin-check.mjs` are superseded by this one**; a sibling stops
 carrying its own. Not wired into `hub-gates.yml` by this step. (LESSONS §334.)
- [`hub-gates-local.mjs`](hub-gates-local.mjs) — **run the hub's gates against a
 sibling from the commit it PINS, which is what its CI checks out.** It reads
 the pin as the pin check does, refuses one the hub's `main` does not reach, adds
 a worktree of the hub at that commit with `git worktree add`, runs the gates
 from there, removes the worktree, and its closing line names the commit the
 gates ran from and never the tree beside it. A gate the pinned commit does not
 have is printed as absent from it. **The sibling copies of the local runner are
 superseded by this one.**
- [`doctrine-sync.mjs`](doctrine-sync.mjs) — **run this FIRST in any sibling
 session**: `node /root/.claude/hub/doctrine-sync.mjs --repo .`. It says what has
 landed in the hub since that repo last reconciled — which files, which commits,
 and **which sections of DOCTRINE.md**, because "DOCTRINE.md changed" sends you
 to re-read 900 lines and "§7e changed" sends you to the paragraph. Each sibling
 records the hub commit it has read in a `.doctrine-sync` file; `--adopt` moves
 it, and that is an ASSERTION the drift was read, like handoff-check's `--ack`.
 What it records is the hub checkout's `HEAD`, never `origin/main`; the fetch
 only prints how far `origin/main` is ahead. A marker naming a commit the hub no
 longer has (the rewrite) exits 1 without `--adopt`, saying the drift cannot be
 listed; with `--adopt` it records `HEAD` and prints that every section of the
 doctrine is unread. Exits non-zero on unreconciled drift.

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

## The cold read is a file now, not a remembered step
[`COLDREAD.md`](COLDREAD.md) carries the method and both prompts verbatim. It is
canonical here like the gates — a sibling opens it and runs it against its own
deployed URL rather than reinventing it.

**The METHOD is canonical here; the RECORDS are not.** This paragraph said
"every run gets a record under `coldreads/`" while neither that directory nor
`COLDREAD.md` itself was tracked — a pointer in the one file every session loads
automatically, aimed at nothing, for as long as it had been written. Each app
keeps its own runs in its own `NOTES.md`, beside the releases that answered
them, which is where a session working on that app actually looks; the hub's
`coldreads/` is for runs of the hub site. Same split as the gates: shared
method, per-repo output.

**Why it is a file.** LESSONS §206 designed the claims walk and §233 found the
half it was missing, and §233's own last paragraph is the diagnosis: a
CHECKLIST that lives inside a lesson is a step somebody has to remember, and it
was a year of nothing in every repo but the one it was written in. The
reasoning was never what was missing.

**Two passes, and run them as two SEPARATE agents in parallel.** §233 states an
ordering rule — the unprompted pass first — because it was written for one
agent doing both in sequence, where order is the only protection there is. Two
independent agents make contamination structurally impossible instead of
promised, and cost one wall-clock run rather than two.

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

## Repo metadata (manual, confirm — see Doctrine §10)
Description / website / topics / social-preview are GitHub-UI steps the session
token cannot perform. **The values for every app live in
[`METADATA.md`](METADATA.md)** — propose there, the owner applies from there, and
the per-item status flips to `set` only on the owner's say-so. Never report any repo
"set up" while a row says proposed.
