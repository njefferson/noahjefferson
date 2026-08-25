## 8 · Pinning

**Enforced by:** GATE hub:.github/workflows/doctrine.yml — `zizmor --offline --strict-collection` audits workflow security (pinning, template injection, credential persistence, cache poisoning) and FAILS rather than skipping a file it cannot parse; zizmor itself is version- and hash-pinned in `hub:.github/requirements-ci.txt`; `pin-check.mjs` covers the npm hygiene zizmor does not.

**Postscript, 2026-08-02 — and this is the sharper lesson.** The first attempt
at enforcing this section was a hand-written regex over `uses:` lines. It
passed both repos. Installing **zizmor**, a maintained off-the-shelf auditor,
took thirty seconds and immediately found 18 template injections and 5
credential-persistence issues — including two in workflows written *that same
afternoon, alongside the bespoke checker that missed them*. Owner, on being
shown the growing pile of hand-rolled infrastructure:
**Reach for the standard tool FIRST. Write a bespoke gate only for what is
genuinely specific to this work** — acceptance criteria, a palette's own roles,
an app's offline behaviour, the handoff. Everything else already exists, is
better, and is somebody else's job to keep correct.

**Postscript to the postscript, 2026-08-03 — the tool you reached for is a
thing that executes, and §16.1 applies to it too.** Having correctly replaced
the bespoke checker with zizmor, the session installed it with
`run: pipx install zizmor || pip install zizmor` — an unpinned fetch of a
binary that then runs next to a deploy token, added *inside the very workflow
whose job is to enforce pinning*, in the change that argued for it. It survived
because the rule was being applied to the *subject* of the audit and not to the
audit. Nothing caught it; a review of the session's own diff a day later did.
Now version- and hash-pinned in `.github/requirements-ci.txt`, installed with
`--require-hashes --only-binary=:all:`, kept current by a `pip` ecosystem in
Dependabot, and canonical in the hub so every sibling repo installs the same
build rather than carrying its own copy. **When you adopt a standard tool, pin
it the same day you adopt it — an off-the-shelf tool is not automatically a
pinned one, and "I just installed the good tool" is the moment the guard is
down.** See §25 for what that same tool did next.

**A pin must match the environment it runs in, and a wrong pin is worse than
none — it looks deliberate.** Adding a first-ever `package.json` to the hub, the
session pinned `playwright-core` to a plausible-looking recent version (1.49.1,
which ships chromium revision **1148**) into a sandbox whose only browser is
`/opt/pw-browsers/chromium-1194`. The eight render/audit scripts all launch that
hardcoded `executablePath`, so the pair must match. Finding the right one took
probing four versions' `browsers.json`: 1.54.0→1181, 1.55.0→1187, **1.56.0→1194**,
1.57.0→1200. The version is now recorded in `package.json` **with the reason**,
so the next person changing it knows what it is married to. Introducing a pin is
not the safe half of the job; verifying it against the thing it must match is.
*(hub, 2026-07-28.)*

**A program that never exits, piped, produces no output at all.** `a11y-scan.mjs`
never calls `browser.close`, and Node block-buffers stdout when it is a pipe —
so `node a11y-scan.mjs | head -30` printed nothing for three minutes and looked
like a hang. Redirected to a file instead, the same run had already produced its
full report. Worse, the empty pipe was used as *evidence* for a specific
diagnosis (a browser protocol mismatch) that was never actually established.
Suspect the instrument BEFORE naming a cause, not after — and when a long-running
process shows no output, redirect to a file before concluding anything about it.
*(hub, 2026-07-28. Same family as the USA-NPN empty body and the Overpass
"cancelled is not zero".)*

**Say a candidate name OUT LOUD before you check a single registry.** A name was
taken all the way to adoption on the strength of five clean checks — npm, GitHub,
the App Store, trademark, and a grep of the app's own spec. Every one of them was
a REGISTRY check, and registries only catch collisions with *products*. The name
was *Wynts*; said aloud it is a near-homophone of **wince**, which for an app
whose stated voice is calm and shame-free is disqualifying. The owner caught it in the
time it took to read it back. The check costs nothing and it runs first now:
say it, say it in a sentence, ask what it rhymes with and what it is one letter
from. A registry cannot hear.
*(planner, 2026-07-28. Fourth name attempt; the previous three died to searches
that were also being run in the wrong order — narrowest and most expensive first,
instead of cheapest and most-likely-to-kill first.)*

**Order your checks by cost times kill-rate, not by how official they feel.** The
same naming exercise ran expensive, authoritative, late-stage checks (trademark
databases, store searches) before free instant ones (say it aloud; grep our own
spec for the word). The free ones killed four candidates between them — *Lens*,
*Gauge*, *Alignment* and *Wynts* — and each would have done so in seconds. An
authoritative check is not a better check if a cheaper one would have answered.
*(planner, 2026-07-28.)*

**Dim text with a token, never with `opacity` — an opacity is invisible to a
contrast gate.** Frame's corner build stamp was `--dim` at `opacity: .65`. The
token pair `--dim` on `--bg` measures 4.79:1, so `contrast-check.mjs` passed it
every single run; what a reader actually saw, once the browser composited that
opacity against the background, was **2.54:1** — a plain WCAG AA failure on the
one element whose entire purpose is being readable in a screenshot. A token-based
gate compares two declared colours. It cannot see `opacity`, and it cannot see a
colour that gets composited at paint time. Photo Pointer hit exactly this in its
1.14.2 (a `--dim` stamp that "photographed as a smudge") and fixed it the same
way. Two apps, same author, same trap, found three days apart — so: if text needs
to be quieter, define a quieter token and add the pair to the gate. Never reach
for `opacity` on text.
*(Frame 3.1.4 / Photo Pointer 1.14.2, 2026-07-28.)*

**A "never re-fix this" entry blesses the PATTERN, not every number in it.**
Studio's audit list records as
audited-correct — right call, it is the non-hue channel someone who cannot
separate the colours depends on. It shipped at **8px**. So the accessibility fix
was real and the thing implementing it was too small to read, and the register
entry made it look settled. When a NEVER-CHURN list protects a pattern, check
that the pattern's own parameters still hold up; raising the size finishes that
fix rather than churning it, and saying so explicitly in the register is what
stops the next session reading it as a regression.
*(Studio, 2026-07-28.)*

**A pure unit conversion is provable; a conversion plus a redesign is not.**
Converting ~435 px font sizes to rem across four apps was verifiable to the
element — render every screen before and after, assert every computed size is
identical, then assert they all scale 1.25× at a raised browser default. That
proof only exists because the pass changed *units and nothing else*. The
temptation each time was to fix the 8px and 9px text in the same commit; doing so
would have destroyed the "pixel-identical" gate and left nothing but assertion.
Ship the mechanical change with its proof, then the judgement calls as their own
release with their own reasoning.
*(cross-app px→rem sweep, 2026-07-28.)*

**The session git relay cannot delete a remote branch, and the GitHub MCP has no
tool that can either.** `git push origin --delete <b>` and the equivalent
`git push origin :refs/heads/<b>` both die the same way — —
then print a misleading `Everything up-to-date`, so a careless read looks like
success. The relay drops the connection on any ref *deletion*; pushes that create
or advance a ref work fine. The GitHub MCP offers `create_branch` and
`list_branches` but nothing to remove one. So deleting a branch is a manual step
for the owner (GitHub → Branches → the bin icon), and it should be handed over as one
rather than retried. Delete the LOCAL branch from the session by all means — that
part works — but verify with `git ls-remote --heads origin` before reporting a
branch gone. This is why stale `claude/*` branches accumulate in every repo.
*(2026-07-28; the same wall was recorded in Frame's CLAUDE.md on 2026-07-18 and
re-hit here, which is the argument for it living in the hub instead.)*

**A scalar field is safe with LWW alone; a mutable field needs three copies or it
aliases history.** Quietkeep's event-sourced fold added `sourceTags: string[]` to
its node state the way it adds scalars — stamp it, last-writer-wins — and shipped
it green. An adversarial audit found it holed copy-on-write in two places at once:
the fold's copy-on-write clone deep-copied the scalars' containers but let the
top-level spread *alias* the array, and the reducer stored the log event's payload
array *by reference*, so a later mutation of live state could rewrite an
"immutable" log event and vice versa. A mutable (array/object) field needs all
three: copy-on-clone, copy-on-store-from-payload, and default-on-deserialise. The
scalars needed none of them, which is exactly why the new field was written as if
it needed none either. When you add the first non-scalar to a reducer that has only
ever held scalars, the whole aliasing discipline is new surface — audit it as such.
*(Quietkeep Phase 2, 2026-07-29.)*

**A single-item test cannot see a bug that needs two, and `Array.sort` is the
classic hiding place.** The same field above also crashed the app on *update*: a
snapshot cut before the field existed deserialised its nodes with the field
`undefined`, and a projection that sorted the inbox by `n.sourceTags.includes(...)`
threw. Every test passed — because every test had one inbox item, and V8's
`Array.sort` skips the comparator entirely for length ≤ 1, so the throwing line
never ran. The crash needed two items. Projections that sort, dedupe, or compare
must be tested with **≥2 elements**, and any "state survives an upgrade" claim must
be tested against a snapshot that is genuinely *missing* the new fields, not one
freshly written by the current code (which can never be missing them). Deserialise
is a migration; migrations are additive-only and must backfill, and the backfill
needs its own made-to-fail-first test.
*(Quietkeep Phase 2, 2026-07-29; found by an adversarial audit run against a fully
green tree — the third time "green is not correct" earned its place at the top of
this file.)*

**`git add -A` is unsafe whenever anything else can write into the working tree —
and during an adversarial audit, something always can.** A Quietkeep release
commit swept up `tools/.pz.mjs`, a probe script an auditing subagent had written
into the repo to test a gate, and pushed it. Nothing referenced it and no gate
noticed, because no gate asks "is every tracked file supposed to be here". The
same session also had to revert an auditor's deliberate `if (false && …)` break
that had been sitting in the tree for eleven minutes after the agent went quiet —
a break which, had it been committed, would have shipped the release's headline
feature silently disabled. Both are the same root cause: **a working tree with
concurrent writers is not a safe thing to stage wholesale.** Stage the paths you
actually changed, and before any release commit, read `git status` as a list of
claims to check rather than a formality to clear. Subagents should write probes to
a scratchpad outside the repo — but assume one will not, because one did.
*(Quietkeep 0.7.1, 2026-07-29.)*

**An allowlist of "what counts" turns adding a category into a silent deletion.**
Quietkeep's calendar export picked entries from `new Set(['ready','soon','later'])`
— the group keys of its todo list. A later release added a fourth group for dates
that had gone by, and every one of those items dropped out of the exported `.ics`
without a word: the single thing a reminder is most *for*, gone, with all eight CI
gates green. The gate that should have caught it compared the file against the
count the UI itself promised, so both sides moved together and neither noticed.
**Two things generalise.** First, the failure directions are not symmetric: an
allowlist that forgets a new category silently loses data, while an exclusion that
forgets one merely includes something it shouldn't — so in any app whose promise is
"nothing is lost", write the rule as *what is excluded*. Second, a consistency check
between two projections of the same source proves they agree, not that either is
right; at least one gate must name a concrete expected item ("the passed date is in
the file") rather than compare two derived numbers.
*(Quietkeep 0.9.0, 2026-07-29.)*

**A test that asserts against the constant the code uses can never fail.**
`assert.equal(view.cards.length, REPLAN_CAP)` looked like it pinned a product law
that says "show at most three". It pinned nothing: change the cap to five and both
sides move together. The same audit found `assert.deepEqual(f(s), f(s))` presented
as an ordering guarantee — true of any pure function, including one that never
sorts — and an assertion that a hardcoded `[]` equals `[]`. **A gate must state the
expected value independently of the implementation**: a literal `3`, an explicit
list in the expected order, a table of inputs to expected strings. If the assertion
would still hold after you delete the mechanism it names, it is decoration. The
cheapest way to find out is to delete the mechanism and watch.
*(Quietkeep 0.9.0, 2026-07-29; four such checks in one feature, found by a subagent
whose only brief was "are these checks theatre".)*

**Words that reach a user need tests as much as logic does.** Three functions that
produced every sentence on a new surface — how long ago a date was, how many there
were, what a card's context said — had *no* coverage in any of eight gates. Each
could be replaced with a constant string and everything stayed green, which means a
card thirteen months behind could read "that date was yesterday", and the count line
could say "One" however many there were. Two reasons they slipped: the tests that
existed asserted `length > 0` plus a denylist of forbidden words, which a single
space satisfies; and the browser walk only ever produced *one* item, so every plural
branch was unreachable. **Table-test user-facing strings against expected values, and
make the end-to-end walk carry at least two of anything that can be counted.**
*(Quietkeep 0.9.0, 2026-07-29.)*

**Restore backups by full path, not by basename.** A script that verified fixes by
breaking them saved `src/replan.ts` and `src/ui/replan.ts` into one scratch
directory. Same basename, so the second `cp` silently overwrote the first, and the
next restore wrote the UI module over the projection module. Nothing warned; the
damage showed up as a cascade of unrelated test failures several steps later. If a
throwaway script backs up more than one file, key the copies by the full path
(`src_ui_replan.ts`), or use `git stash`/a worktree — and when a break-and-restore
loop starts failing in files it never touched, suspect the harness before the code.
*(Quietkeep 0.9.0, 2026-07-29.)*

**Feedback rendered above the control that triggers it reads as "nothing
happened".** Quietkeep's calendar button had a live region directly above it,
which is fine on a short surface. That panel had grown past ten thousand pixels,
so the button was reached by scrolling *down* — and the confirmation then updated
off the top of the reader's view. It had worked correctly for three releases;
The owner reported it as doing nothing at all. **On any surface long enough to
scroll, the confirmation goes BELOW the control**, and the same reasoning applies
to error text, counts, and anything else that answers a press. A related finding
in the same session: the only way to close that panel was beneath every release
note, measured at 10,130px down. If a surface grows without bound, its way out
has to be pinned — and once pinned, check it against WCAG 2.2 **2.4.11 Focus Not
Obscured**, because a sticky header that covers the control you just focused is
its own AA failure. At 200% text on a 320px screen the first version of that
header took **99% of the dialog**.
*(Quietkeep 0.10.1, 2026-07-29; found by the owner on device, not by eight green
CI gates.)*

**`rem` inside a media query resolves against the INITIAL root font size, never
the current one.** A `@media (max-height: 32rem)` threshold written specifically
for a 200%-zoom case silently never matched, because the query evaluated `rem`
at 16px while the page was rendering at 32px. Nothing errors; the rule simply
does not apply, and the layout it was meant to fix stays broken. **Use `px` in
media-query thresholds**, and verify a responsive rule by measuring the element
at the viewport it targets rather than by reading the CSS.
*(Quietkeep 0.10.1, 2026-07-29.)*

**A "replace" that clears before it writes will eventually clear and then fail.**
Quietkeep's import validated a file, called it ready, then ran `reset` followed
by `append`. A file with two records sharing an id passed validation — which
never looked at ids — and the append hit the store's unique-id constraint *after*
the clear. The user's real data was gone, replaced by whichever rows happened to
land first, with a raw database error on screen, underneath a shipped patch note
promising that damaged files were refused before anything was touched. **Two
rules.** Validation at a destructive boundary must ask *every question the write
will ask*, not a subset — the storage layer's constraints are part of the
contract. And validation is never enough on its own: make the destructive
operation **atomic** (one transaction, clear-and-refill together), because no
amount of checking can rule out a quota or disk failure halfway through.
*(Quietkeep 0.10.0→0.10.1, 2026-07-29; found by an adversarial audit, rated
CRITICAL, in the feature whose entire purpose was data safety.)*

**Spreading a large discriminated union in TypeScript can hang the compiler.**
`{ ...event, seq: -5 }` in a test, where `AppEvent` is a ~60-member union, took
`tsc --noEmit` from **2 seconds to over three minutes** — no error, no warning,
just a check that never finished, which reads exactly like a hung machine.
`Object.assign({}, base as Record<string, unknown>, over)` sidesteps the
distribution and restores it. **If a typecheck suddenly takes minutes, look for a
spread over a union before you look at your machine.**
*(Quietkeep 0.10.1, 2026-07-29.)*

**A gate that exists only in the CI file is a gate you cannot run.** Quietkeep's
banned-vocabulary check lived as an inline `grep` inside `spine.yml`. Running it
"locally" therefore meant re-typing an approximation of it at a terminal — and
the approximation was wrong, so two consecutive releases were reported green on
all nine gates and both went **red in CI on the tenth**. The failing content was
a source comment that explained a prohibition *by quoting the prohibited word*,
which is a trap the repo's own notes already recorded from an earlier phase; it
recurred because nothing structural stopped it. **Every gate belongs in one
place the developer and CI both invoke** — a package script, a make target, a
committed shell file — with the CI step being a one-line call to it. Two copies
of one rule always drift, and the copy that drifts is the one you type from
memory. The corollary is sharper than "be careful": *"green locally" is a claim
about nothing unless the local thing and the CI thing are the same bytes.*
*(Quietkeep 0.15.0/0.16.0, 2026-07-29 — the same session in which I had written
a commit message criticising a hand-copied constant elsewhere in the codebase.)*

**A projection nobody can reach is a unit test wearing a feature's clothes.**
Quietkeep shipped this shape four separate times: a `parent` field written by the
fold and settable by no control; an interval-setting event with no UI path; a
resume-card tier that ranked **second** in the priority list over a set nothing
could populate; and a project "role" whose documented consequence was never
enforced because the role was never folded. Each looked done — schema present,
fold correct, tests passing — and each did nothing for anyone. **Before calling a
capability built, name the tap that reaches it.** If the answer is a test file, it
is not built. Worse, these are invisible to the usual gates: unit tests pass
because the projection is correct, and end-to-end walks pass because they never
try the path that does not exist.
*(Quietkeep 0.13.0–0.16.0, 2026-07-29.)*

**An exceptions surface must be able to reach zero, and say nothing when it
does.** Quietkeep's review lists only what is structurally broken — a container
with no live work under it, a node whose parent is gone — and when there is
nothing it is **not on the page at all**. No "all clear", no green tick, no
count of zero. The reason is not minimalism: a surface that always renders
something trains you to skim it, and once skimmed it cannot deliver the one
message it exists for. The same rule made the empty state honest rather than
congratulatory — a congratulation is a score, and scores were already banned.
*(Quietkeep 0.13.0, 2026-07-29.)*

**Save the user's context at the moment of interruption, not at the moment of
exit.** Quietkeep's focus feature writes its "here is where you were" card the
instant an interruption is *recorded*, not when the session is *ended*. The
distinction is the whole feature: people do not get to press a button on the way
out of the room, and a design that saves state only on a tidy exit saves it only
in the cases where it was never at risk. The test that proves it writes no
"ended" event at all — it simulates the app being killed — and it is the one test
in that file that a plausible-looking alternative design fails.
*(Quietkeep 0.14.0, 2026-07-29.)*

**Never let a tool grade a third party.** Building a surface for work someone
*else* is doing, every instinct offers a health word — "at risk", "slipping",
amber/red. Each is a judgement about a person, made by software, on evidence it
does not have, and rendered unarguable by being displayed. Quietkeep's portfolio
states only facts joined by middots: who is running it, when an answer is owed,
how many things are outstanding, when anything last moved. The same rule ruled
out any colour keyed to how long someone has had something. **If a product has a
no-shame rule, the place it will first be broken is the screen about somebody who
never agreed to be measured.**
*(Quietkeep 0.16.0, 2026-07-29.)*

**"One concept, two places, one of them checking" is the defect shape to hunt
for first.** An adversarial audit of five Quietkeep releases found four real
bugs, and three were literally the same mistake: a spent resume card was
excluded from the held list but not from the stalled-project check; a let-go
person was filtered out by the function that names who owes you something but
not by the one that names who is running a project; a formula-injection guard
was written for CSV export and not for the Markdown export beside it. In every
case the concept was already understood and written down correctly *somewhere* —
the bug was the second place that had never been told. **When you fix a class of
thing, grep for every other site that asks the same question**, and prefer
collapsing them into one shared predicate over adding a second guard. This is
also the cheapest thing to search for in someone else's code: find any rule
stated in two places and one of them is probably stale.
*(Quietkeep 0.17.1, 2026-07-29.)*

**Free text the user typed will break any document you paste it into.** A
captured item title containing newlines and a `##` turned a Quietkeep status
report into one that read ** while reporting real work —
the title ended the bullet list, opened a heading, and contributed a bare line of
its own. The app stores titles verbatim deliberately (a share-target capture
composes title/text/url with newlines, so multi-line titles are *normal*, not
hostile). The lesson is not about escaping one format: **every export path needs
its own guard, and writing one is the moment to write the others.** CSV had a
formula-injection guard already; Markdown, sitting in the same file, had nothing.
The consequence is worse than a rendering blemish — it is a document handed to
another person that says something untrue.
*(Quietkeep 0.17.1, 2026-07-29.)*

**"Since last time" is a question about what you KNEW, not about the clock.**
Quietkeep's status report computed its delta by cutting the log at the timestamp
of the previous report. Correct until data can arrive out of order — then a
sync/import from another device, carrying work stamped *before* your last report,
lands on the already-reported side of the line and is **silently absent from
every report you ever send again**. You had never seen it and had certainly never
told anyone about it. The fix is to record what the reporting device actually
held at the time: a **per-device high-water mark**, which a log-based system
usually has already for sync. Any "what's new since X" feature in a system that
accepts foreign history has this bug until proven otherwise.
*(Quietkeep 0.17.1, 2026-07-29.)*

**A feature that works exactly once is a re-render eating the focus, not a
broken handler.** Intersecting Parallels shipped arrow-key nudge on its
vanishing-point list — press ArrowRight, the point moves 1px. Press it again
and nothing happens, ever. The handler was fine: every edit called a helper
that rebuilt the whole panel, so the focused `<button>` was destroyed and
replaced by an identical-looking one, and the second keypress went to `<body>`.
The keyboard surface the whole accessibility design rested on was, in practice,
a single keystroke. **No unit test can see this, because no unit test has a
focus** — all 38 passed. It was caught by a headless walk driving real key
events, on its first run. Two things generalise: any list that re-renders on
change must update nodes IN PLACE (rebuild only when the SET of items changes),
and the fix is never "restore focus by id afterwards" — that patches the
symptom while leaving a reader's caret position, text selection, and IME state
still being destroyed on every keystroke. Doctrine §14: the frame was the bug.
*(Intersecting Parallels 0.1.0, 2026-07-29.)*

**An accessibility gate pointed at `file://` cannot test an app made of ES
modules — it measures a blank page and passes.** The gate ported from this hub
loaded pages with `pathToFileURL`, which is correct for a static page and
silently wrong for anything with `<script type="module">`: a file:// origin is
opaque, so every import is blocked by CORS and the app never boots. The gate
would have reported an empty shell as clean, in both themes, at both viewports,
forever. It now serves `public/` over HTTP from inside the gate itself — the
same directory wrangler uploads — and waits for the app to actually finish
booting before measuring anything, failing loudly if it does not. Same family
as the throttled probe reported as "no photos nearby": **an instrument that
cannot reach the thing it is measuring returns a confident pass.** While fixing
it, the same gate gained the app's DIALOGS as scanned surfaces; a closed
`<dialog>` is invisible to axe, so three of the app's four surfaces had been
outside the gate without anyone choosing that.
*(Intersecting Parallels 0.1.0, 2026-07-29.)*

**`actions/upload-artifact` silently skips dot-directories, so the evidence you
collect for failures is missing exactly when you need it.** The app walk writes
screenshots to `.walk-shots/` and uploads them, so a failed CI run shows what
the app looked like at each step. The first run uploaded nothing: v4 excludes
hidden paths unless `include-hidden-files: true`, and it reports that as a
warning in a green run — which nobody reads, because the run was green. The
first time anyone would have noticed is a red run with no pictures attached.
Set `include-hidden-files: true` AND `if-no-files-found: error`, so a missing
artifact fails its own step rather than waiting to disappoint you later. The
general rule: **a diagnostic that only matters on failure must be verified on a
success**, or it is not there at all.
*(Intersecting Parallels 0.1.0, 2026-07-29.)*

**A topological solve written the obvious way is O(n²), and the cost only
appears at the scale the spec actually names.** The perspective solver
re-resolves every constructed point whenever a vanishing point moves. Written
as "a set of pending dependencies per point, rescanned until nothing moves,
with a linear lookup by id inside the loop", it measured 37.2ms per solve+frame
at the 2,000 edges the spec's own acceptance test asks for — against a 16ms
frame — while being instant at the twelve edges every test used. Rewritten as
Kahn's algorithm over an index built once, plus batching canvas strokes by
style instead of one draw call per edge, plus applying drags on rAF rather than
per pointer event: 21.3ms median, 17.7ms on a CI runner. **Put the spec's
stated scale in a gate, or you will only ever measure the toy case** — and when
it fails, fix the shape of the algorithm rather than the threshold in the test.
*(Intersecting Parallels 0.1.0, 2026-07-29.)*

**A gate that checks a LABEL passes while the thing the label describes is
broken.** Intersecting Parallels' browser walk asserted that every drawn stroke
"binds to a guide, not to nothing" — and it was green on the build where the owner
drew four lines at a vanishing point and reported that they did not converge.
Every stroke did carry a binding. The binding was
`horizontal`, which is a **parallel** family: lines bound to it converge
nowhere. The check was reading the app's own word for what it had done instead
of measuring what it had drawn. The replacement computes the perpendicular
distance from the vanishing point to each bound line — 0.000px now, and no
label can satisfy it. **When a property is geometric, physical, or visual,
assert the measurement, not the metadata**; the metadata is written by the same
code you are testing, so it agrees with itself by construction. Same family as
the self-referential assertion (`assert.equal(cards.length, CAP)`) and the
consistency check between two projections of one source: all three compare the
code to itself.
*(Intersecting Parallels 0.1.1, 2026-07-29 — found by the owner on an iPad,
against a walk of 33 green checks.)*

**Two guides that are nearly the same LINE are not nearly the same
CONSTRAINT.** The same defect had a second layer underneath. With both vanishing
points on the horizon, a stroke drawn near the horizon measures within a couple
of degrees of BOTH — a real ranking, taken with a 3° hand tremor, read
`VP2 0.87° | horizontal 1.99° | VP1 3.00°`. Scoring by angle alone therefore let
a tremor choose between two guides whose lines are visually identical but which
converge in OPPOSITE directions, and between a vanishing point and an axis whose
whole meaning is that it never converges. The fix was to notice that the gesture
carried information the geometry had discarded: the direction the hand was
travelling says which vanishing point is being reached for, even though the
binding itself is direction-less. **When two candidates are within measurement
noise of each other, do not break the tie with more precision — break it with a
different signal the user already gave you.**
*(Intersecting Parallels 0.1.1, 2026-07-29.)*

**A `display` rule on a `<dialog>` silently defeats the browser's own hiding.**
Adding `#about { display: flex }` to lay out a dialog beat the user-agent's
`dialog:not([open]) { display: none }` on specificity — so `close` succeeded,
`dialog.open` went false, every handler ran, and **the panel stayed on screen**.
A worse version of the bug being fixed, shipped by the fix. It was caught only
because the check asked the browser `checkVisibility` after the close instead
of trusting that closing had closed it. **Any `display` you set on a `<dialog>`
must be scoped to `[open]`**, and any test of "did it close" must assert the
thing is *gone*, not that its state flag flipped.
*(Quietkeep 0.21.1, 2026-07-29.)*

**`<input type="file">` fires a `cancel` event, and it BUBBLES.** An Escape
handler on an ancestor `<dialog>` therefore fires when the user dismisses the
file chooser — closing the whole panel the instant anybody picks a file to
import. The dialog's own `cancel` is what you want; a descendant's is not.
**Guard every `cancel` listener with `e.target === dialog`.** More generally:
before listening for a named event on a container, check whether any descendant
fires the same name — `cancel`, `close`, `toggle`, `change`, `input`, `error` and
`invalid` all exist on multiple elements and several of them bubble.
*(Quietkeep 0.21.1, 2026-07-29 — introduced and caught within minutes, by the
headless walk rather than by review.)*

**A positioning complaint is often a length problem.** The owner reported twice that
the close control on a panel was in a terrible position and moved during
scrolling. Both true. But the reason it was ever hard to reach by thumb was that the
panel rendered every release note ever written and measured **17,000 to 25,000
pixels** — a number nobody had looked at, on a surface that had grown a little
with each release. Fixing the header's position without fixing the length would
have left the panel exactly as unusable to read. **When a control is hard to
reach, measure the container before you move the control**, and put a bound on
any surface that grows by accumulation.
*(Quietkeep 0.21.1, 2026-07-29.)*

**A feature that produces an artifact needs a gate on the artifact.** A "Print"
button was reachable, operable, correctly labelled, correctly focus-ringed, at
44px, and passed every contrast and axe check in both themes — while sending the
printer the modal dialog it was launched from, the entire app behind that, and no
print stylesheet whatsoever, because the repo had none. **Every check passed on
the day it was broken.** The generalisation is not about printing: if the point of
a control is to make a file, a page, a printout or a message, at least one check
must inspect that output. For print specifically, stub `window.print` and assert
what *would* have gone to paper.
*(Quietkeep 0.16.0→0.21.0, 2026-07-29.)*

**Wire the escape hatch first.** In any modal or blocking flow, attach the
close/cancel handler as the first statement of the setup, before anything that
can throw. A panel's close was attached ~490 lines in, after the content,
storage, import and export wiring — every one of which had to succeed for the
thing to be closeable, with failures swallowed silently by the caller. **A dialog
you cannot leave is the worst failure a dialog has**, and it should never be the
last capability the code makes possible.
*(Quietkeep 0.21.1, 2026-07-29.)*

**Test the property, not the technique.** A check written against `position:
sticky` proves nothing a user cares about and dies at the next refactor. "The way
out is reachable from anywhere in this panel" survives every rewrite of how that
is achieved, and it is the sentence the owner actually said. The same applies to
"there is no progress bar" (assert the rendered markup has no `<progress>`, no
`role="progressbar"`, no percentage width) rather than to any particular CSS.
*(Quietkeep 0.21.1, 2026-07-29.)*

**"Is there a way out" is a product requirement, not a code detail — write it
down as one.** Two separate rules already existed about this: an accessibility
bullet saying a dismiss control must stay reachable (buried inside a clause about
sizing floors and overflow), and an engineering rule about wiring the close
handler first. Neither said the thing a user would say: **every surface that
takes the screen must be closeable, from the first frame, from anywhere in it,
without earning it.** So the same defect shipped twice on the same panel while
both rules were technically on the books. **A requirement scattered across two
sections in two vocabularies is not captured.** If the owner can state it in one
sentence, the doctrine should contain that sentence.
*(Quietkeep 0.21.1, 2026-07-29 — the owner asked whether that was fully captured,
and the honest answer was no.)*

**Acting on unrecognised input is a failure even when the action is correct.**
A screenshot of one app arrived in the session for a different one. The right
first move was one clarifying question — instead the session reasoned about a bug
whose code it could not see and began attaching a repository. Worse, when told to stop, it kept
the one instruction in the message that generalised and committed that, because
that part was genuinely asked for and app-independent. **That is the trap: partial
compliance with a misdirected request looks like helpfulness and produces
something to show for itself, which is exactly why it is harder to notice than
plain disobedience.** The asymmetry is the whole argument — a clarifying question
costs one message and the owner answers directly; a guess produces confident
output that only the owner can evaluate by reading it, and the owner is the
expensive resource. **Unrecognised subject → question first, tool calls never.**
*(Cross-app, 2026-07-29 — the owner, in anger, and correctly.)*

**A test that compares two failures is not a test that a failure says nothing.**
The check asserted that a wrong-key refusal and a tampered-blob refusal produced
the same message. It passed against an implementation that appended the
ciphertext length and the IV to that message — because those two cases happen to
share a length and an IV, so the leak cancelled out inside the very comparison
written to catch it. **Two hand-picked cases agreeing is a much weaker claim than
the value being constant, and the gap between the two is where the defect lives.**
The rewrite proves it across six failures deliberately differing in key, in size
and in which byte was disturbed, and refuses any digit in the message at all,
since any number there is a measurement of the input. *When a property is "does
not depend on X", the test has to vary X.*
*(Quietkeep sync stage 2, 2026-07-29.)*

**A test named for a claim is the one most likely to be theatre, because its name
does the reassuring.** The test called THE CLAIM existed solely to assert — and it passed with the plaintext on the wire. It
searched the base64 envelope for the secret, and base64 of "roofer" does not
contain "roofer". Four unrelated round-trip tests happened to red on the same
break, so it would not have shipped; that is luck, not a gate, and luck does not
survive a refactor. **Encoding is not encryption, and a test that reads the
encoded form is testing the encoding.** Decode first, then look for the content
in the bytes — and assert the bytes do not parse as a document at all, which
plaintext always would and sixteen-plus random bytes never will.
*(Quietkeep sync stage 2, 2026-07-29 — found by deliberately breaking the code
after every gate was already green, which is the only reason it was found.)*

**The deliberate-failure proof is worth more on the tests you are proudest of.**
Three proofs behaved exactly as predicted and taught nothing. The fourth —
against the one test with a capitalised name and a paragraph of justification
above it — found that it had no power over the single break it existed to
prevent. **Confidence in a check is uncorrelated with its detection power, and
the checks carrying the most confidence are the ones nobody re-examines.** Run
the proof against the assertion you would have skipped as obviously fine.
*(Quietkeep sync stage 2, 2026-07-29.)*

**Any number in a refusal message is a measurement of the input.** "Could not be
opened" is a refusal; "could not be opened (28 bytes)" is a refusal plus an
oracle. This generalises past crypto: sizes, counts, indexes, offsets and
durations in error strings all tell whoever supplied the input something about
what happened to it. **A refusal should be a constant.** If it needs detail to be
debuggable, the detail belongs where the owner can see it and a stranger cannot.
*(Quietkeep sync stage 2, 2026-07-29.)*

**A fake that cannot express the failure cannot detect it.** The traversal test
on the relay — percent-encoded `../<other id>/<chunk>` names, five variants,
capitalised name, paragraph of justification — passed with the guard deleted
outright. The fake store was a flat `Map`, and in a flat key-value namespace
there is no traversal at all: the crafted key is a literal string that does not
exist, so the lookup misses for a reason that has nothing to do with the guard.
**The test was verifying the fake.** The rewrite runs it against a store that
resolves keys as a filesystem would — decoding escapes, collapsing `..` — and
asserts FIRST that this store really would hand over the other mailbox, so the
guard is provably the only thing standing in the way. *When a test uses a double,
ask whether the double is even capable of the failure; if it is not, the test's
subject is the double.*
*(Quietkeep sync stage 3, 2026-07-29.)*

**The comment above a guard is a claim, and it can be false while the guard is
fine.** The one above the relay's chunk-name check said that without it a crafted
name "reads a mailbox the caller does not have the id for". That is not true of a
flat store, and believing it meant the wrong thing got tested for an hour. The
guard was worth keeping for a narrower reason — no adapter can ever be handed a
key with structure in it — and the honest narrow reason is the one that told me
which store to test against. **An overclaimed rationale does not just mislead the
next reader; it misdirects the test you write next.**
*(Quietkeep sync stage 3, 2026-07-29.)*

**A denylist has to name the claim, not the letters.** Banning the word "lost"
fired on the correct sentence — the reassurance the rule
existed to protect. The identical mistake had already happened with a check that
banned `"by "` and rejected the right answer . **Twice is a pattern:
substring bans on prose reject correct output at least as often as wrong output,
because the forbidden word is usually forbidden as an ASSERTION and appears
legitimately under negation.** Ban "was lost" and "data loss"; assert the good
sentence positively.
*(Cross-app, 2026-07-29 — second occurrence.)*

**A 204 cannot carry a body, and `JSON.stringify(null)` is not nothing.** It
returns the string `"null"`, and handing that to `new Response` with status 204
throws — so every CORS preflight would have been a 500, on a code path no unit
test would touch unless it deliberately sent OPTIONS. **The near-empty value that
the platform counts as non-empty is a whole family of bug**: `""` vs `null`, `[]`
vs absent, `0` vs unset. Send OPTIONS in the tests.
*(Quietkeep sync stage 3, 2026-07-29.)*

**A gate that measures the wrong thing and is right most of the time is worse
than no gate, because its green is evidence.** Two smoke checks compared the app's
correct LOCAL day against `new Date.toISOString.slice(0, 10)`, which is UTC,
in a browser context deliberately pinned to America/Denver. They passed for
eighteen hours a day and red for the six when the two zones are on different
dates. One reported the app as accepting a date in the past; the other computed
"six days ahead" by adding six times 86,400,000 to a UTC instant — which lands
seven LOCAL days out in the evening — and so made the app's correct arithmetic
look wrong. **Pinning a non-UTC timezone in the harness is only half the job; the
expected values have to be computed in that same zone.** A mixed-zone comparison
is not a flaky test, it is a wrong test with a schedule.
*(Quietkeep, 2026-07-30 — found because a session ran past midnight UTC.)*

**One artifact must not state two dates.** An export's filename was built from the
UTC instant while the file's own contents stated the local day, so a calendar
export taken at seven in the evening west of Greenwich was named 2026-07-30 and
said "as of 2026-07-29". The name is the part a person sees in Files, so it is the
one that has to be right, and the two must come from the same computation. **Any
time a value appears in both a filename and a body, they are one fact with two
writers** — the shape that has produced more defects in this project than any
other. Check it explicitly, in both hemispheres: a fix that only handles negative
offsets is not a fix.
*(Quietkeep, 2026-07-30.)*

**Let a session cross midnight on purpose before shipping anything temporal.** The
date rolling over found a real product defect and two wrong gates in one minute,
none of which nine green gates had ever noticed. A whole class of bug is only
reachable at a boundary the clock crosses once a day, and the cheapest way to find
it is to be there. If a session cannot wait, run the suite with the harness clock
set to 23:55 in the pinned zone.
*(Quietkeep, 2026-07-30.)*

**"The build is stale" is a real explanation and it should be checked second, not
last.** A fix to source did not show up in a browser gate because that gate loads
the built bundle, and the build had not been re-run. Ten seconds of confusion, and
the only reason it was short is that the failing assertion named a date that could
not have come from the new code. **Any gate that consumes a build artifact should
be preceded by the build in the same command**, not merely earlier in the script.
*(Quietkeep, 2026-07-30.)*

**`cancel-in-progress` on a production deploy turns "promoted" into a lie.** A
promote to `main` was pushed, its deploy started, and a Project-facts commit
pushed twenty seconds later cancelled it — GitHub's concurrency group did
exactly what it was told. The run's conclusion was **`cancelled`**, not
`failure`, so nothing was red anywhere: the branch was correct, the previous
checks were green, and production was quietly still serving the previous
release. It only surfaced because the deploy status was read one release at a
time instead of assumed. It also happened to be harmless — the second push
carried the same `public/` tree, so production landed anyway. That is luck, and
luck is not a deploy strategy. **Latest-wins is right for previews and wrong for
production**: `cancel-in-progress: ${{ github.ref_name != 'main' }}`. Two things
generalise beyond the flag. A `cancelled` run reads as neutral to every glance
and every notification, so it is the perfect place for a silent staleness bug to
live — the same shape as "cancelled is not zero" from the Overpass sweep. And
the moment after a release is exactly when a session wants to push
record-keeping commits, which is exactly when the deploy it is recording is
still in flight: **do not push again until the deploy you are claiming has
finished.**
*(Intersecting Parallels 0.5.0, 2026-07-30.)*

**Pushing again cancels the run you were waiting on.** A verification run was
watched through eleven of fourteen steps and then killed at the browser gate,
because a docs commit went up on the same branch and the concurrency group
superseded it. Nothing was wrong with the code and nothing was wrong with the
gate; the evidence was simply destroyed by the next push. **Between "pushed" and
"green", the branch is a held resource.** If a docs change cannot wait, it can go
on the other repo, or after.
*(Quietkeep, 2026-07-30. Two sessions hit this independently within the same hour
— the entry above is the same failure on a production deploy in another app. When
one mistake is found twice in one hour by two people who could not see each
other's work, it is not carelessness, it is a missing guard rail: `staging` and
`main` want `cancel-in-progress` set differently, and every session wants to
commit its record-keeping the moment the thing it is recording is still in
flight.)*

**Assert on the store, not on the sentence.** A button that reported "13 sample
things" while committing nothing left the message assertion passing and reded only
the three checks that read the database. **The copy on screen is written by the
same code that failed, so it agrees with itself.** Every check on an action that
writes should read the thing written — the row count, the log, the file on disk —
and the check on the wording is a separate, weaker claim that must never stand in
for it.
*(Quietkeep, 2026-07-30 — the proof was written expecting all seven checks to red;
four did not, and that was the finding.)*

**Check the invariant against the code that enforces it, not against your memory
of it.** Two consecutive mistakes came from one misremembering: that a container
is kept alive by its clocked children. It is not — containment satisfies the
CHILD, so a parent whose children are all clocked is still silent. Believing the
wrong version produced a sample set that leaned on the gate's cures, and then a
test asserting a state the app cannot reach at all. **A law you can quote is not a
law you have read**; the enforcement function is the specification, and it takes
thirty seconds to open.
*(Quietkeep, 2026-07-30.)*

**When a generated demonstration exists, run it through the real write path.** The
temptation is a fixture that skips validation "because we control the input" — and
that is exactly how a privileged path gets added for a fixture and then quietly
becomes how the feature works. Going through the app's own boundary meant a bug in
the generator surfaced as a plain refusal instead of as a corrupt store, and it
revealed two wrong beliefs about the invariants in the process.
*(Quietkeep, 2026-07-30.)*

**A `git push` that prints nothing alarming can be a no-op, and "I pushed it" is
not evidence.** A workflow fix was committed while the working tree was on
`staging`, then pushed with `git push -u origin main`. That command pushes the
LOCAL `main` — which had not moved — so it succeeded, printed a tracking line,
and sent nothing. The remote kept the old file for another twenty minutes while
being described as fixed, and it only came out because `origin/main`'s copy of
the file was read directly: `git show origin/main:path`. Two rules, both seconds
long. **Check the branch you are ON before committing** (`git branch
--show-current`), because a commit lands where you are standing, not where you
were thinking. And **verify a push by reading the remote, not the push output** —
`git ls-remote --heads origin`, or better, read back the one line you changed.
This is the same family as the deploy lesson directly above: the failure mode of
release plumbing is not an error message, it is a success message about
something other than what you meant.
*(Intersecting Parallels 0.5.0, 2026-07-30 — found while writing the lesson
above, which is its own kind of evidence.)*

**When an owner objects to a behaviour, separate the property they object to
from the mechanism that provides it — then remove only the property.** The owner
objected, forcefully, that endpoint joining was bending lines off their guides.
The response was to delete endpoint joining entirely. Two releases later the
owner was back with screenshots of a cube falling apart, because shared corners
no longer held. Both complaints were right, because the one mechanism
was doing two separable things: joining decided a line's DIRECTION (which was
the objection, because it bent lines off their guides) and also WHERE ALONG that
direction the line ended (which was needed, because shared corners are what hold
a drawing together under an edit). Deleting the mechanism took the wanted half
with the unwanted half, and cost a round trip plus a broken drawing.
**Before deleting a mechanism an owner has complained about, enumerate what else
it provides and say so** — "this also does X; do you want X to stop too?" is one
line, and it is much cheaper than shipping the removal and having the owner
discover X was load-bearing.
*(Intersecting Parallels 0.2.0 → 0.5.0, 2026-07-30.)*

**A probe must print what it measured, never a verdict written in advance.** A
diagnostic script ended with `console.log("edge binding = VP1, but VP1 is Npx
off the line")` — the "binding = VP1" half was a hardcoded string, not a read of
the data. After the fix, the same script printed the same accusation, because
the only live number in the sentence (the distance) is legitimately large for an
UNBOUND line, which is what the edge had correctly become. Half a minute was
spent believing the fix had failed. **Print the field, not your expectation of
the field** — `stored binding = ${...}` — and let the reader compare. Same
family as the diagnostic selector that counted legend swatches and reported
markers: an instrument that can only say one thing will keep saying it.
*(Intersecting Parallels, 2026-07-29.)*

**To trust a test, delete the mechanism it names — and check that your deletion
actually changed the behaviour.** A hysteresis test was written, passed, and was
then run against the hysteresis DELETED — where it passed again, because a
different rule was already pinning the case it had chosen. It was decoration.
Rewritten to sit exactly on the boundary where nothing else breaks the tie, it
failed without the mechanism and passed with it. The subtler trap, hit the same
day: a "nothing moves" test was checked by breaking the code that preserved the
coordinates — and the break was a NO-OP, because the fields were never written
in the first place, so the test could not distinguish. **If your deliberate break
does not turn something red, suspect the break before you trust the test**; make
the break large and obviously behaviour-changing, or reinstate the ORIGINAL
buggy code, which is the only break guaranteed to be real.
*(Intersecting Parallels 0.4.0, 2026-07-29. Sharpens "a test that asserts
against the constant the code uses can never fail".)*

**An indicator people will aim at must lie on the thing they are aiming for.**
Off-screen vanishing points got an edge marker pinned along the ray from the
VIEWPORT CENTRE to the point — correct as a compass, and used by the owner as a
target to draw at. Measured from one stroke's origin: the marker sat at screen
x=834 while the point's true direction left the viewport at x=1819, so aiming at
the marker was several degrees off the actual guide from every origin, and no
amount of scoring could recover an intent the gesture never contained. The fix
was not a better guess — it was to stop requiring aim: the candidate guide lines
are now drawn from the exact point the stroke starts, so a line is FOLLOWED
rather than aimed at. **When a UI element gets repurposed as a target, either put
it where the target is, or remove the need to aim.**
*(Intersecting Parallels 0.2.0, 2026-07-29.)*

**A synthetic input model can manufacture the failure you then go and "fix", so
calibrate it or label it.** A headless repro of finger drawing used ±6px of
high-frequency wobble over a 35px sample — far coarser than a real fingertip —
and produced "5 of 14 strokes stray", which was reported as though it described
a real hand's experience. It described the noise model. The genuine defect
underneath was found only by measuring a POSITION (an affordance 985px away from
where it implied) rather than a rate. **State the model's parameters next to any
number it produces**, and prefer a measurement that does not depend on simulated
human noise at all — a distance, an incidence, a coordinate — because those hold
whatever the hand does.
*(Intersecting Parallels, 2026-07-29.)*

**A guard on a destructive action must test intent, not dexterity.** Hold-to-confirm
is the fashionable pattern and it is a hand-steadiness exam: tremor is a supported
condition in these apps, so a guard a shaking hand cannot pass is a guard that locks
somebody out of their own data at the exact moment they want it gone. Typing a short
word tests the thing actually in question — did this person mean it — and it costs
nothing to forgive case and stray whitespace, because neatness under pressure was
never the property being checked.
*(Quietkeep 0.23.0, 2026-07-30.)*

**Two guarded actions must never share a confirmation token.** If the reversible
"clear the list" and the irreversible "erase everything" both accept the same typed
word, then satisfying the guard for the safe one and switching mode leaves a
satisfied-looking control sitting in front of the dangerous one. **Authorisation
crosses whenever the token is the same and the target can change.** Different words
per action, and switching target clears whatever was entered — the second half
matters as much as the first, and it belongs in the UI test rather than in a habit.
*(Quietkeep 0.23.0, 2026-07-30.)*

**Never reveal a surface before it can say anything.** The confirmation panel was
unhidden and THEN filled in, because the count came from an async store read — so
for as long as that read took, an empty paragraph sat above the go-ahead button, in
the one place where the sentence is the entire safeguard. Compute, write, then
reveal. **A surface that appears before its content is a surface that can be acted
on before it has warned anybody**, and the window is exactly as long as the slowest
device makes it.
*(Quietkeep 0.23.0, 2026-07-30.)*

**A control that only appears after a click is still a control somebody reads.** The
accessibility gate correctly refused a registry entry pointing inside a hidden
block. The tempting fix is to drop the entry; the right fix is to open the block in
the audited state, because otherwise the exemption lands on exactly the surfaces
that are conditional — confirmations, error states, revealed detail — which are the
ones people meet while already under strain.
*(Quietkeep 0.23.0, 2026-07-30.)*

**A share tile with no words on it is an unfinished tile — and the rule to
finish it was already written.** *
The doctrine already said (§3) that AI-generated imagery must be prompted
wordless "and all lettering is overlaid afterwards by us"; the artwork was
generated wordless, the overlay never happened, and the bare gradient shipped as
`og.png` and as the repo's social preview. A card renders at roughly 360px next
to nothing but a bare domain — pretty, and it names nothing. **When a rule has
two halves, the second half is the one that goes missing**, because the first
half produces a file that looks like a finished deliverable. The fix is a
generator committed next to the art (`render-og.mjs`, `npm run render:og`), so
the tile is reproducible instead of being a binary someone hand-made once.
*(Intersecting Parallels 0.5.1, 2026-07-30.)*

**Text over a picture has no background colour, so measure the lightest pixel
under the actual glyphs.** A contrast gate for words baked into an image cannot
read a CSS pair — the background of a letter is whatever pixel happens to be
beneath it, and a sun in the corner is a different background from the navy in
the middle. What worked: render the tile TWICE, once with the text hidden
(`visibility`, not `display`, so the boxes do not move), sample the backdrop
image inside each text run, take the lightest pixel found — worst case for light
text — and compute the real WCAG ratio against the real text colour, printing
the offending pixel's rgb AND coordinates. Two things fell out of it immediately.
First, sample the LINE rects (`Range.getClientRects`), not the element box: a
block is as wide as its container, so the first run failed all three lines on
backdrop out where the sun is and no letter is ever drawn — the instrument was
wrong before the design was. Second, when a line did genuinely fail (a tagline
run out across a wide column onto the horizon glow, 2.92:1), the fix was to
narrow the column, NOT to deepen the wash: a scrim heavy enough to make any
placement safe also erased the left vanishing point, on a picture whose subject
is three of them. **Buying contrast by darkening the artwork is paying for the
gate with the thing the gate exists to protect** (§14: fix the frame, not the
constant). Shipped at 9.97:1, 8.44:1, 5.10:1, and the coordinates in the output
are what made both diagnoses take a minute each.
*(Intersecting Parallels 0.5.1, 2026-07-30. Also: an image containing text needs
its words in the alt attribute — an alt that describes only the scene withholds
the text from the people who cannot see it.)*

**When a generative tool keeps failing a STRUCTURAL requirement, stop prompting
and compute the structure.** Three rounds of increasingly precise prompts asked
an image model for three-point perspective. Every render drew the two horizon
points, drew the third point, and then drew the vertical edges PARALLEL — the
third point was pure decoration, and the prompt was never the problem:
consistency across every line in a picture is not a thing a describe-and-hope
interface can be asked for. The
artwork is now projected through a real camera (~200 lines), and the model's job
shrank to what it is good at — nothing, in this case, since the geometry IS the
art. **The tell is a requirement that is a relationship between many outputs
rather than a property of one.** Wording will not fix those; a solver will.
*(Intersecting Parallels, 2026-07-30.)*

**A convergence check can pass on parallel lines, so measure the SPREAD too.**
Verifying "these lines run to that point" by perpendicular distance is
necessary and not sufficient: a bundle of parallel lines all miss a far-off
point by very little, which is exactly how the bad artwork would have passed. The
second number is the angular spread of the family — parallel means ~0°, genuinely
converging means degrees. Reinstating the bug proved both halves at once: worst
miss went to 208.16px and spread to 0.00°. **When a property is "these things
agree about X", check the agreement AND check that they are not all the same
thing.** Same shape as the earlier lesson about a test that passes with the
mechanism deleted.
*(Intersecting Parallels, 2026-07-30.)*

**Some layouts an owner asks for are not merely ugly, they are impossible — say
which, and name the way out.** the owner's wide social tile put the two horizon
vanishing points 1076px apart and the third 502px below. No real camera has
those three points: the principal point is the orthocentre of their triangle,
f² = -(A-P)·(B-P), and there it comes out NEGATIVE. The constraint is
d > s — the third point must be farther out than half the spread of the other
two — and the owner's hand-drawn reference sits just inside it, at d=835 to s=795.
The useful refusal is not "invalid input" but the two numbers that would fix
it: push the third point farther out, or narrow the spread between the other
two. **A validator that only
says no makes the owner guess; one that says which way is a collaborator.**
*(Intersecting Parallels, 2026-07-30.)*

**A link that exists is not a link that works — count the taps a stranger would
need, and how many of them are invisible.** The apps had been made to "point
both ways", and technically they did: every tool carried "‹ Studio" in its bar
and the Infrared ⓘ dialog carried a line to the hub. But the Studio page itself
had NOTHING pointing up, so the chain dead-ended one rung short, and the single
hub link in the whole app was the fourth of five identical grey text lines
inside a dialog, worded "More free tools by Noah Jefferson" — which describes a
category, not a way back. The owner couldn't find it on device. **Cross-app links
are the easiest thing to mark done and the hardest thing to notice are broken,
because the person who added them always knows where they are.** The check that
would have caught it costs nothing: walk it from the far end, on a phone, and
count how many steps are visible without scrolling or opening something. Here
it went from "one buried line inside a dialog" to one visible control per level.
*(Photography Studio ← the hub, 2026-07-30.)*

**Measuring contrast against a gradient: computed style will confidently tell
you the page is black.** `background: radial-gradient(...)` sets no
background-COLOR, so walking up the tree looking for an opaque one falls through
every ancestor to its fallback. A light-theme page measured against that
fallback returned 1.11:1, which is absurd on its face — and absurdity is the
signal, per "suspect the instrument first". Three more traps sat behind it, each
producing a confident wrong answer: sampling a rail at the tangent of a
999px-radius pill reads pure antialiasing and under-reports by ~0.5; a gradient
backdrop CHANGES with position, so a rail must be compared against the pixel
touching it, not a convenient patch elsewhere; and `:focus-visible` never
matches a scripted `.focus` in Chromium, so a perfectly good focus ring
reports as `outline: 0px none` until the harness presses a real Tab. **If a
visual property is worth asserting, assert it on real painted pixels off a
screenshot, and drive it the way a person would.**
*(Photography Studio, 2026-07-30.)*

**A calibrated token that fails in one place is a finding, not a fix to make in
passing.** The rail token measured 2.87:1 on the launcher's light-theme
gradient, under the 3:1 rule. The tempting move — nudge it, or drop in a
one-off color — would have churned a value defined in five files and calibrated
against a documented surface set, inside a change about navigation. The cheap
test that settled it: measure an ALREADY-SHIPPED, already-audited control
sitting on the same backdrop. It came out worse (2.68:1), which proved the
shortfall belonged to the token on that gradient and not to the new work. It got
recorded with its numbers and left for its own pass. **When something measures
out of spec, first find out whether you brought it — the control group is
usually already on screen.**
*(Photography Studio, 2026-07-30.)*

**Surface colours and text colours are one system — you cannot tune either
alone.** "Cards don't stand out from the page" looks like a one-line fix: move
the surfaces apart. It isn't. Pushing surfaces away from the page pushes the
*pressed* surface toward the text sitting on it, so every naive spread broke
text-on-pressed contrast; and in a dark theme, lifting surfaces also weakens a
light hairline riding on them, so the rail token has to move in the same breath.
Four knobs — surface lift, page move, rail strength, quiet-text strength — and
changing one silently spends the budget of the others. **Solve them together
against the whole matrix, or a fix in one place is a regression somewhere you
weren't looking.** The frontier is worth computing rather than guessing: for the
Studio it turned out to be page→card 1.30:1 dark / 1.27:1 light, and past that
something correct breaks.
*(Photography Studio + the hub, 2026-07-30.)*

**Near-black has no room left underneath it — check which direction is even
available before designing the fix.** The obvious way to separate cards from the
page in a dark theme is to darken the page, leaving every text and rail ratio on
the surfaces untouched. It does nothing: at `#0b0c0f` the page is already at the
luminance floor, so 55% darker moved separation 1.09 → 1.13. The `+0.05` term in
the WCAG contrast formula dominates down there — ratios between two very dark
colours barely move no matter what you do. Light themes are the mirror image
near white. **The cheap direction is often the unavailable one; spend a minute
computing which way has headroom before committing to an approach.**
*(Photography Studio, 2026-07-30.)*

**An optimiser will happily destroy the brand to win the metric.** Asked to
maximise card/page separation on the hub, the search returned a palette that
washed the magenta accent from `#E0619E` to `#F8DAE8` — a pale pink — because
that bought 2.89:1. The spectral accents ARE the hub's identity; the "best"
answer was unusable. Re-run with the brand pinned (accent shift capped at 5%)
and the honest answer appeared: a modest 1.08 → 1.18, plus the genuinely
valuable part, two accents lifted off the 4.5:1 line where they'd been sitting
at 4.52 and 4.68. **Constrain the search by what must not change, or the
objective will quietly eat it — and check the winning output by eye before
believing it.**
*(the hub, 2026-07-30.)*

**A rule can be correct and still be wrong where you applied it — and the
tempting fix is to edit the data until the rule is happy.** A palette gate
enforced "the surface ladder steps monotonically away from the page." True for an
ELEVATION ladder (rest → raised → pressed). False for a STATE ladder: a
light-theme hover legitimately darkens *toward* the page, and the rule failed a
hub hover that was right. What makes this worth writing down is the near-miss:
the first instinct was to reorder the data — list the hover as if it were the
resting surface — so the numbers would line up. That would have left a permanent
lie in a reference file other apps copy from, to protect a rule that was the
thing at fault. **When a gate flags something you believe is correct, establish
whether the rule governs that case before touching the data.** The fix was to
make the rule kind-aware; a state ladder owes only that its states are
perceptible (ΔE ≥ 2.3), not that they ascend.
*(the hub's palette gate, 2026-07-30.)*

**Do not state a UI or platform path as fact unless you have verified it — "I
don't know" beats a confident wrong answer, every time.** Asked where to edit
GitHub repo metadata from an iPhone, the session invented tap-paths ("gear next
to About", "Request Desktop Website"), and when each was refuted it adjusted the
guess rather than establishing the truth — costing the owner minutes of proving each
answer wrong. Then, writing THIS very lesson, it did the same thing again: it
asserted repo metadata "cannot be edited from the mobile site or app at all,"
another unverified absolute — and the owner corrected it, because the GitHub mobile
app *can* edit the description. So the honest state of what is actually known is
small: the description is editable in the app; what else the mobile surfaces
allow was never verified and must not be claimed either way. The failure is the
same shape as the security overclaims (7f): asserting past what is known, which
turns the non-expert owner into the fact-checker for the expert. It is so
ingrained that it survived into the sentence meant to cure it. When you don't
know a platform detail, say so and find it, or scope the claim to exactly what
you have seen — never a sweeping "you can" or "you can't." A wrong direction, in
either direction, spends the other person's time to discover it was empty.
*(Quietkeep, 2026-07-30 — and the entry itself had to be corrected once.)*

**A session CANNOT edit repo metadata. Stop trying, stop hunting for a way,
stop sending the owner on UI expeditions — it is the owner's manual step, full stop.**
Description, website, topics and social-preview are not editable by any tool a
session has: there is no GitHub MCP call for them, and there is no back door.
The owner has said this every time an app is set up, and every time a session tries
anyway — searches for a tool, proposes tap-paths, offers to "just do it" — which
is worse than useless because it burns the owner's time proving the wall is still a wall.
Doctrine §10 already says the values are the owner's to set; this says the behaviour that
rule keeps failing to produce. When metadata comes up: state the exact values
once, in plain text, say they are the owner's to paste in whenever convenient, and
move on. Do NOT attempt it, do NOT re-offer it, do NOT explain where the buttons
are. The owner knows where they are — the app edits the description, and the rest the owner
handles. The only job a session has here is to hand over correct values and drop
it.
*(Quietkeep, 2026-07-30 — logged because it keeps happening despite being told.)*
