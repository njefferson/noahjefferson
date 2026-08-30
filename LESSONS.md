# Cross-app lessons

Things that turned out to be true, cost real time to find out, and are **not
specific to one app**. Every session on any of the owner's apps should read this
alongside [`DOCTRINE.md`](DOCTRINE.md).

**The difference between the two files:** the Doctrine says what you must do.
This says what has actually gone wrong, with the numbers, so it does not go
wrong again somewhere else. A rule you can restate without knowing why it exists
is a rule that gets waived by whoever is in a hurry.

**This file is append-only in spirit.** Sharpen an entry when new evidence comes
in; do not delete one because it feels obvious now. It felt obvious the second
time too.

**How to add one.** A lesson earns a place here when it is *transferable* — it
would have saved time in a different app, not just a different file. Give it a
one-line rule you could shout across a room, then the concrete evidence: real
numbers, the real symptom, the app and date. A lesson without evidence is an
opinion, and opinions are what this file exists to replace.

## This file is ENFORCED, not just read

The pattern held: 2400 lines that every session read and then
ignored, because reading was all the file ever asked for. §26 is the autopsy:
in one build every **gated** rule held and every **prose** rule lost.

So each lesson now has to say how it is enforced. Run it:

```
node lessons-check.mjs # every lesson declares its enforcement
node lessons-check.mjs --checklist # the steps no script can do — read at handoff
npm run security # §8, §25, Doctrine §16.1 — zizmor, pinned + strict
node pin-check.mjs --repo ../x # §8 — the npm hygiene zizmor does not do
node handoff-check.mjs --repo ../x # §10, §26 — the handoff is a deliverable
```

**Every `## ` section carries an `**Enforced by:**` line**, naming one of:

- **`GATE <repo>:<path>`** — an executable check. `lessons-check.mjs` verifies
 the file EXISTS. A cited gate that is not there is the precise failure §7g and
 Doctrine §4 both describe, so it FAILS rather than reading as coverage.
- **`CHECKLIST <id>`** — a session-time step no script can perform. Printed by
 `--checklist` so it is read at the moment it matters.
- **`JUDGEMENT`** — genuinely not automatable. Must also carry a **`Smell:`**
 line, so the lesson is recognisable when you are standing in it.

**A section with no declaration FAILS.** That is deliberate: it makes the
un-gated lessons countable instead of letting them blend in with the gated ones.
Right now that is 3 judgement calls and 14 checklist items against 6 gate
citations — the honest picture, and the list of what to automate next.

**Adding a lesson?** It does not land without a declaration. If you cannot
gate it, say `CHECKLIST` and give it an id; if you cannot even do that, say
`JUDGEMENT` and write the smell. "Somebody will remember this" is not an option
the file accepts any more.

---

> A repo may also keep its own `LESSONS.md` for **stack contract** detail —
> build, deploy and vendor conventions specific to that codebase (photo-pointer
> has one). That is a different document. This is the shared one.

---

## The lessons

**Every one is its own file in `lessons/`.** This was a single file of 8,697
lines that every session appended to, which meant the LAST LINE was the one line
every writer touched — so two sessions recording two entirely unrelated lessons
conflicted, always, and one of them had to merge by hand. The same shape the
ADRs solved long ago by being one file each.

Two sessions writing two lessons now never touch the same file. What they share
is one line of this index, and a one-line conflict is a thing git can usually
settle by itself.

**Adding one:** write `lessons/<number>-<slug>.md` starting with its own
`## <number> · <title>` heading, then run `node lessons-check.mjs --index` to
regenerate the list below. Take the number off the real end of this list AFTER
fetching — a number chosen from a stale clone leaves a hole where a citation
used to land, and the gate refuses both the hole and the collision.

**Citations do not change.** §104 still means §104; the number is the address
and the filename carries it.

- **§1** — [Reading data honestly](lessons/001-reading-data-honestly.md)
- **§2** — [Statistics that are right and useless](lessons/002-statistics-that-are-right-and-useless.md)
- **§3** — [Asking a service for something](lessons/003-asking-a-service-for-something.md)
- **§4** — [Building a layer](lessons/004-building-a-layer.md)
- **§5** — [Verifying](lessons/005-verifying.md)
- **§6** — [Interface](lessons/006-interface.md)
- **§7** — [Checking whether a name is free](lessons/007-checking-whether-a-name-is-free.md)
- **§7b** — [Gates you never watched](lessons/007b-gates-you-never-watched.md)
- **§7c** — [Marks, palettes, and what a shape says](lessons/007c-marks-palettes-and-what-a-shape-says.md)
- **§7d** — [Green is not a synonym for correct](lessons/007d-green-is-not-a-synonym-for-correct.md)
- **§7e** — [The comment that made the bug sound principled](lessons/007e-the-comment-that-made-the-bug-sound-principled.md)
- **§7f** — [A security claim is a liability until a test pins it](lessons/007f-a-security-claim-is-a-liability-until-a-test-pins-it.md)
- **§7g** — [A check that cannot fail](lessons/007g-a-check-that-cannot-fail.md)
- **§8** — [Pinning](lessons/008-pinning.md)
- **§9** — [Measuring, and reading the measurement](lessons/009-measuring-and-reading-the-measurement.md)
- **§10** — [Explaining your own failure with the owner's inaction](lessons/010-explaining-your-own-failure-with-the-owner-s-inaction.md)
- **§11** — [Instruments, signs, and the checks that measure the wrong thing](lessons/011-instruments-signs-and-the-checks-that-measure-the-wrong-th.md)
- **§12** — [The network is not down. You tried one host.](lessons/012-the-network-is-not-down-you-tried-one-host.md)
- **§13** — [A write with no reader](lessons/013-a-write-with-no-reader.md)
- **§13b** — [Asking whether a value EXISTS when you meant whether it is GOOD](lessons/013b-asking-whether-a-value-exists-when-you-meant-whether-it-is.md)
- **§14** — [Every gyroscope reads a number while sitting perfectly still](lessons/014-every-gyroscope-reads-a-number-while-sitting-perfectly-sti.md)
- **§15** — [`[hidden]` stops hiding the moment you give the element a `display`](lessons/015-hidden-stops-hiding-the-moment-you-give-the-element-a-disp.md)
- **§16** — [A test harness that edits the working tree must refuse to run twice](lessons/016-a-test-harness-that-edits-the-working-tree-must-refuse-to.md)
- **§17** — [Exactly one source may own a field, and adding a second is silent](lessons/017-exactly-one-source-may-own-a-field-and-adding-a-second-is.md)
- **§18** — [Read the terms from the publisher, then make the gate enforce them](lessons/018-read-the-terms-from-the-publisher-then-make-the-gate-enfor.md)
- **§19** — [Stop diagnosing by screenshot — build the export instead](lessons/019-stop-diagnosing-by-screenshot-build-the-export-instead.md)
- **§20** — [Ask what the standard says BEFORE inventing the convention](lessons/020-ask-what-the-standard-says-before-inventing-the-convention.md)
- **§21** — [A cache that only ever serves its own release can never be replaced](lessons/021-a-cache-that-only-ever-serves-its-own-release-can-never-be.md)
- **§22** — [A hand-written list of files to check goes stale, silently and twice](lessons/022-a-hand-written-list-of-files-to-check-goes-stale-silently.md)
- **§23** — ["The source gave me null" is not the same fact as "this is unknowable"](lessons/023-the-source-gave-me-null-is-not-the-same-fact-as-this-is-un.md)
- **§23b** — [A check on one invariant passes every corruption orthogonal to it](lessons/023b-a-check-on-one-invariant-passes-every-corruption-orthogona.md)
- **§24** — [A failing test can mean the EXPECTATION was wrong](lessons/024-a-failing-test-can-mean-the-expectation-was-wrong.md)
- **§25** — [A guard nobody calls, and other ways a green tree lies](lessons/025-a-guard-nobody-calls-and-other-ways-a-green-tree-lies.md)
- **§26** — [Gated in the code, freelance in the handoff](lessons/026-gated-in-the-code-freelance-in-the-handoff.md)
- **§27** — [Undo a planted fault with a saved copy, never with `git checkout`](lessons/027-undo-a-planted-fault-with-a-saved-copy-never-with-git-chec.md)
- **§28** — [A gate cannot fail on a screen it never opens](lessons/028-a-gate-cannot-fail-on-a-screen-it-never-opens.md)
- **§29** — [A check satisfiable by coincidence reports coverage it does not have](lessons/029-a-check-satisfiable-by-coincidence-reports-coverage-it-doe.md)
- **§30** — [A link is only followed if somebody remembers to follow it](lessons/030-a-link-is-only-followed-if-somebody-remembers-to-follow-it.md)
- **§31** — [An app that caches itself cannot notice it has gone stale](lessons/031-an-app-that-caches-itself-cannot-notice-it-has-gone-stale.md)
- **§32** — [A plant that does not move the measurement is telling you the path is dead](lessons/032-a-plant-that-does-not-move-the-measurement-is-telling-you.md)
- **§33** — [A registry that cannot see a thing reports it MISSING](lessons/033-a-registry-that-cannot-see-a-thing-reports-it-missing.md)
- **§34** — [A gate that reads the wrong file demands a lie to go green](lessons/034-a-gate-that-reads-the-wrong-file-demands-a-lie-to-go-green.md)
- **§35** — [The facts that prove a manual step impossible are usually already in your own notes](lessons/035-the-facts-that-prove-a-manual-step-impossible-are-usually.md)
- **§36** — [The diagnostic already told the owner. Reading it back is nagging.](lessons/036-the-diagnostic-already-told-the-owner-reading-it-back-is-n.md)
- **§37** — [A pixel gate must be asked whether the pixels are the ones it thinks](lessons/037-a-pixel-gate-must-be-asked-whether-the-pixels-are-the-ones.md)
- **§38** — [Fixing one check can blunt another, and the plants you re-run are the ones you suspect](lessons/038-fixing-one-check-can-blunt-another-and-the-plants-you-re-r.md)
- **§39** — [A helper written for a known race protects nothing at the call site that skips it](lessons/039-a-helper-written-for-a-known-race-protects-nothing-at-the.md)
- **§40** — [An absent record of success is not an absent attempt](lessons/040-an-absent-record-of-success-is-not-an-absent-attempt.md)
- **§41** — [A handed-over artifact is FROZEN the moment it leaves](lessons/041-a-handed-over-artifact-is-frozen-the-moment-it-leaves.md)
- **§42** — [A gate on the decision function cannot see the path that never asks it](lessons/042-a-gate-on-the-decision-function-cannot-see-the-path-that-n.md)
- **§43** — [A `title` attribute is not a caveat on a touch screen, and `textContent` cannot tell you that](lessons/043-a-title-attribute-is-not-a-caveat-on-a-touch-screen-and-te.md)
- **§44** — [When a contract cannot be read, ship the probe — a wrong guess that reports itself beats a fourth screenshot](lessons/044-when-a-contract-cannot-be-read-ship-the-probe-a-wrong-gues.md)
- **§45** — [A shared allowance split per feature is not scoping, it is a second consumer](lessons/045-a-shared-allowance-split-per-feature-is-not-scoping-it-is.md)
- **§46** — [A check that drives one input mode is silent about the one your reader has](lessons/046-a-check-that-drives-one-input-mode-is-silent-about-the-one.md)
- **§47** — [A freshness limit belongs to whoever WRITES the field, not to what the field measures](lessons/047-a-freshness-limit-belongs-to-whoever-writes-the-field-not.md)
- **§48** — [An indicator must ask the same question as the control it describes](lessons/048-an-indicator-must-ask-the-same-question-as-the-control-it.md)
- **§49** — [A reason string is a value, and inventing one is the same defect as inventing a number](lessons/049-a-reason-string-is-a-value-and-inventing-one-is-the-same-d.md)
- **§50** — [An old report is not a verdict on a new release](lessons/050-an-old-report-is-not-a-verdict-on-a-new-release.md)
- **§51** — ["Run the whole suite" is a rule about the MEASURING INSTRUMENT, not about every change](lessons/051-run-the-whole-suite-is-a-rule-about-the-measuring-instrume.md)
- **§52** — [The owner's person is not repo material](lessons/052-the-owner-s-person-is-not-repo-material.md)
- **§53** — [A push is not a release, and `git push` succeeding feels exactly like shipping](lessons/053-a-push-is-not-a-release-and-git-push-succeeding-feels-exac.md)
- **§54** — [A new check is measured somewhere, and "somewhere" is a claim nobody checks](lessons/054-a-new-check-is-measured-somewhere-and-somewhere-is-a-claim.md)
- **§55** — [A rule written at the top of the file gets read once; the file is then edited from the bottom](lessons/055-a-rule-written-at-the-top-of-the-file-gets-read-once-the-f.md)
- **§56** — [An accessibility standard is not an authority to overrule the owner with, and "it has to be there" is a claim that must be READ before it is made](lessons/056-an-accessibility-standard-is-not-an-authority-to-overrule.md)
- **§57** — [Quoting the person who found the defect is not provenance — it is republishing their messages in public, under their name](lessons/057-quoting-the-person-who-found-the-defect-is-not-provenance.md)
- **§58** — [A rule that covers the person does not cover the person's LIFE](lessons/058-a-rule-that-covers-the-person-does-not-cover-the-person-s.md)
- **§59** — [A test pinned to a SENTENCE fails on correct work, and the bill it settles is a release nobody receives](lessons/059-a-test-pinned-to-a-sentence-fails-on-correct-work-and-the.md)
- **§60** — [A derived value CACHED by a render is only as fresh as that render, and a page that does not render it reads whatever was left behind](lessons/060-a-derived-value-cached-by-a-render-is-only-as-fresh-as-tha.md)
- **§61** — [A check that measures, mutates, captures and then samples is invalid on anything that re-renders on a timer](lessons/061-a-check-that-measures-mutates-captures-and-then-samples-is.md)
- **§62** — [A height budget that costs the product a sentence every time it binds is measuring a state nobody reads in](lessons/062-a-height-budget-that-costs-the-product-a-sentence-every-ti.md)
- **§63** — [A page that RENDERS correctly can be a page that DOES nothing, and no rendering check will tell you](lessons/063-a-page-that-renders-correctly-can-be-a-page-that-does-noth.md)
- **§64** — [A fixture built to match your heuristic will agree with it forever](lessons/064-a-fixture-built-to-match-your-heuristic-will-agree-with-it.md)
- **§65** — [A check with a FLOOR and no ceiling cannot see "too big", and every property can be individually fine while the product is unusable](lessons/065-a-check-with-a-floor-and-no-ceiling-cannot-see-too-big-and.md)
- **§66** — [A plant AGES OUT of aiming at anything, and fixing the defect it guards is exactly when it happens](lessons/066-a-plant-ages-out-of-aiming-at-anything-and-fixing-the-defe.md)
- **§67** — [When a constant becomes a function, the new bugs live at the EDGES of its domain — never where the motivating story lives](lessons/067-when-a-constant-becomes-a-function-the-new-bugs-live-at-th.md)
- **§68** — [A Content-Security-Policy is served for the service worker too, and `connect-src 'none'` silently gives an offline-first app a worker that can cache nothing](lessons/068-a-content-security-policy-is-served-for-the-service-worker.md)
- **§69** — [The session that draws a mark is the one party that cannot see what it accidentally looks like](lessons/069-the-session-that-draws-a-mark-is-the-one-party-that-cannot.md)
- **§70** — [A version number is a DELIVERY MECHANISM in a cached app, and a release that forgets to bump it publishes something no existing reader can receive](lessons/070-a-version-number-is-a-delivery-mechanism-in-a-cached-app-a.md)
- **§71** — [An intermittent failure is a defect that has told you its reproduction rate, and "re-run it" is how it gets filed as a flake](lessons/071-an-intermittent-failure-is-a-defect-that-has-told-you-its.md)
- **§72** — [A gate that names ONE surface is satisfied by moving the content to a surface it does not name](lessons/072-a-gate-that-names-one-surface-is-satisfied-by-moving-the-c.md)
- **§73** — [Splitting one surface into five re-creates every per-surface obligation five times, and none of them are in the diff](lessons/073-splitting-one-surface-into-five-re-creates-every-per-surfa.md)
- **§74** — [A local server that can only answer 200 or 404 cannot see any defect that needs a redirect, and the gap reads as an engine difference](lessons/074-a-local-server-that-can-only-answer-200-or-404-cannot-see.md)
- **§75** — [Backgrounded waits do not pass time for you, and "it has been half an hour" is a claim that needs a clock](lessons/075-backgrounded-waits-do-not-pass-time-for-you-and-it-has-bee.md)
- **§76** — [Long foreground chains make the person invisible; stopping after every chunk makes you useless. Background the slow thing and keep going](lessons/076-long-foreground-chains-make-the-person-invisible-stopping.md)
- **§77** — [Frustration about HOW you work is not authorisation for WHAT you do](lessons/077-frustration-about-how-you-work-is-not-authorisation-for-wh.md)
- **§78** — [A service-worker defect cannot ship its own cure, and "deployed" answers a different question from "fixed"](lessons/078-a-service-worker-defect-cannot-ship-its-own-cure-and-deplo.md)
- **§79** — [Widening a race is not fixing it, and each attempt gets reported as a fix](lessons/079-widening-a-race-is-not-fixing-it-and-each-attempt-gets-rep.md)
- **§80** — [A four-tap static page found what eleven gates could not](lessons/080-a-four-tap-static-page-found-what-eleven-gates-could-not.md)
- **§81** — [A guard that lives in the working tree cannot protect a branch whose contents exclude it](lessons/081-a-guard-that-lives-in-the-working-tree-cannot-protect-a-br.md)
- **§82** — [Removing an unwanted automatic behaviour means enumerating its TRIGGERS, and the reported one is rarely the only one](lessons/082-removing-an-unwanted-automatic-behaviour-means-enumerating.md)
- **§83** — [Piping a gate to `tail` throws away its exit code, and the run summary then reports success for a failing gate](lessons/083-piping-a-gate-to-tail-throws-away-its-exit-code-and-the-ru.md)
- **§84** — [Moving a CONTAINER off an async path does not move the controls inside it, and the leftover is invisible on an idle machine](lessons/084-moving-a-container-off-an-async-path-does-not-move-the-con.md)
- **§85** — [Designing from the built thing makes every finding a refinement of its frame, and the frame is what is wrong](lessons/085-designing-from-the-built-thing-makes-every-finding-a-refin.md)
- **§86** — [A suite that passes unchanged when you delete the behaviour it guards was never guarding it](lessons/086-a-suite-that-passes-unchanged-when-you-delete-the-behaviou.md)
- **§87** — [A plan records what was wanted; only the record records what is true — and re-asking for something already delivered is its own defect](lessons/087-a-plan-records-what-was-wanted-only-the-record-records-wha.md)
- **§88** — [A gate that covers half a file makes the whole file read as maintained — and the cure is to check the file against ITSELF, not against the truth](lessons/088-a-gate-that-covers-half-a-file-makes-the-whole-file-read-a.md)
- **§89** — [Tests that pin one line each cannot see a seam — drive the thing all the way through, and assert reachability rather than presence](lessons/089-tests-that-pin-one-line-each-cannot-see-a-seam-drive-the-t.md)
- **§90** — [A check that compares two arrays with `===` can never pass — it reads as a real finding while being structurally incapable of going green](lessons/090-a-check-that-compares-two-arrays-with-can-never-pass-it-re.md)
- **§91** — [A modal dialog makes everything behind it INERT, and inert is neither hidden nor disabled — the click times out instead of failing](lessons/091-a-modal-dialog-makes-everything-behind-it-inert-and-inert.md)
- **§92** — [A gate that takes `--repo` and silently ignores a bare path reports GREEN for the repo it was standing in, under that repo's name](lessons/092-a-gate-that-takes-repo-and-silently-ignores-a-bare-path-re.md)
- **§93** — [A decision recorded in an ADR is not a mechanism — and an argument accepted for one surface does not travel to the others by itself](lessons/093-a-decision-recorded-in-an-adr-is-not-a-mechanism-and-an-ar.md)
- **§94** — [A check that hit-tests "is anything on top of it" cannot see a TRANSPARENT control, and a ratchet applied to a value that rotates will eat the product's copy](lessons/094-a-check-that-hit-tests-is-anything-on-top-of-it-cannot-see.md)
- **§95** — [Conformance is defined for input methods in general. Nobody was measuring the one the app is actually used with](lessons/095-conformance-is-defined-for-input-methods-in-general-nobody.md)
- **§96** — [A requirement translated into a mechanism is answered as the mechanism and lost as the requirement — and the search that misses it later is the same translation](lessons/096-a-requirement-translated-into-a-mechanism-is-answered-as-t.md)
- **§97** — [An invariant cited outside its own axis becomes a reason not to fix a defect](lessons/097-an-invariant-cited-outside-its-own-axis-becomes-a-reason-n.md)
- **§98** — ["Not enough evidence yet" is a decision about somebody else's life, and it is not the session's to make](lessons/098-not-enough-evidence-yet-is-a-decision-about-somebody-else.md)
- **§99** — [A question a session cannot answer from taste is not automatically the requester's — check whether the research already answered it](lessons/099-a-question-a-session-cannot-answer-from-taste-is-not-autom.md)
- **§100** — [A check whose passing branch is "the feature is absent" measures nothing, and it is the shape you reach for by reflex](lessons/100-a-check-whose-passing-branch-is-the-feature-is-absent-meas.md)
- **§101** — [A repo can have twenty tools that measure the app and none that shows it — and the one you write to fix that will render a state no person can reach](lessons/101-a-repo-can-have-twenty-tools-that-measure-the-app-and-none.md)
- **§102** — [Quoting the person who reported a defect, in the product's own release notes, is the attribution rule reaching a surface nobody checks](lessons/102-quoting-the-person-who-reported-a-defect-in-the-product-s.md)
- **§103** — [Anything generated FROM the app goes stale in the tree, and only a check at the moment of the change has ever stopped it](lessons/103-anything-generated-from-the-app-goes-stale-in-the-tree-and.md)
- **§104** — [A test whose own cleanup reverts the thing it tested leaves you certain of something that is no longer true](lessons/104-a-test-whose-own-cleanup-reverts-the-thing-it-tested-leave.md)
- **§105** — [A gate nobody has watched fail is a hypothesis — and when you finally test them, most of what you find is broken TESTS, not broken gates](lessons/105-a-gate-nobody-has-watched-fail-is-a-hypothesis-and-when-yo.md)
- **§106** — [A tool that breaks the tree on purpose must write down what it broke BEFORE it breaks it, because every in-process restore dies with the process](lessons/106-a-tool-that-breaks-the-tree-on-purpose-must-write-down-wha.md)
- **§107** — [A check that asserts a fact about ONE CLONE cannot be run in CI, and the session that wires it there will have watched it pass locally](lessons/107-a-check-that-asserts-a-fact-about-one-clone-cannot-be-run.md)
- **§108** — [The rule said never quote the owner and never name the owner; only the NAME half was gated, and five verbatim sentences sat in two repos with every check green](lessons/108-the-rule-said-never-quote-the-owner-and-never-name-the-own.md)
- **§109** — [A fix that names its own scope stops exactly there, and the release note reads as if it were complete](lessons/109-a-fix-that-names-its-own-scope-stops-exactly-there-and-the.md)
- **§110** — [A "hide these" list that grows from chrome to sections has changed class, and setting `hidden` in a loop silently stops working](lessons/110-a-hide-these-list-that-grows-from-chrome-to-sections-has-c.md)
- **§111** — [A both-directions check that filters by a naming convention covers only the members that follow it — and the misfiled entry is exactly the one that does not](lessons/111-a-both-directions-check-that-filters-by-a-naming-conventio.md)
- **§112** — [Both privacy gates returned green on the repo that turned out to be dirtiest, because one keys on a token somebody had already rewritten and the other covers one shape that repo does not use](lessons/112-both-privacy-gates-returned-green-on-the-repo-that-turned.md)
- **§113** — [A control that undoes a state lived inside the thing that state hides, and the comment forbidding exactly that was written above it](lessons/113-a-control-that-undoes-a-state-lived-inside-the-thing-that.md)
- **§114** — [The performance guard that skips the line it was never measured against — a length cap for minified bundles that hid 632 lines of hand-written prose](lessons/114-the-performance-guard-that-skips-the-line-it-was-never-mea.md)
- **§115** — [A document that NAMES a skip marker becomes one, and the region it opens runs to the end of the file](lessons/115-a-document-that-names-a-skip-marker-becomes-one-and-the-re.md)
- **§116** — [Six browser walks served a generated bundle and checked only that it EXISTED, so any of them could measure the previous app and pass](lessons/116-six-browser-walks-served-a-generated-bundle-and-checked-on.md)
- **§117** — [The CI step that runs another repo's gate was pinned to a commit from before that gate existed, and it was watched passing locally, which is the one place a pinned checkout proves nothing](lessons/117-the-ci-step-that-runs-another-repo-s-gate-was-pinned-to-a.md)
- **§118** — [A declared drag alternative satisfied the gate by existing, while doing less than the drag it stood in for](lessons/118-a-declared-drag-alternative-satisfied-the-gate-by-existing.md)
- **§119** — [The gate written because a sheet shipped unmeasured defined a surface as a `<section>`, and every sheet is a `<dialog>`](lessons/119-the-gate-written-because-a-sheet-shipped-unmeasured-define.md)
- **§120** — [Five of a nine-step plan named things missing that were already built, and one named as built was destroying what it touched](lessons/120-five-of-a-nine-step-plan-named-things-missing-that-were-al.md)
- **§121** — [A rule that says "never show X here" is kept by the SHAPE having no X, not by everyone remembering](lessons/121-a-rule-that-says-never-show-x-here-is-kept-by-the-shape-ha.md)
- **§122** — [A settled-decisions list still read "no undo, deliberately, for now" three days after undo shipped, and this is where §120's documents get their wrong content](lessons/122-a-settled-decisions-list-still-read-no-undo-deliberately-f.md)
- **§123** — [`hidden` is a UA rule at zero specificity, so every class that sets `display` silently outbids it — and one of the three controls this exposed had been on screen for eleven releases](lessons/123-hidden-is-a-ua-rule-at-zero-specificity-so-every-class-tha.md)
- **§124** — [Twenty-five static gates and eight browser walks, and not one asked WHERE anything renders — so a filter shipped inside the surface it filters](lessons/124-twenty-five-static-gates-and-eight-browser-walks-and-not-o.md)
- **§125** — [Three gates in one day read commented-out markup as markup, and the third had 7.5KB of prose between it and the tag it was looking for](lessons/125-three-gates-in-one-day-read-commented-out-markup-as-markup.md)
- **§126** — [The gate said "a new surface answers this in the commit that creates it", and the half that could answer at commit time was the half that ran in a browser](lessons/126-the-gate-said-a-new-surface-answers-this-in-the-commit-tha.md)
- **§127** — [Two gates were written, planted red, and passed locally for a release and longer, having never once run on a runner — because the gate list lives in two files and nothing compared them](lessons/127-two-gates-were-written-planted-red-and-passed-locally-for.md)
- **§128** — [The line that says where production is went stale three times in four days, and each time it was found by accident — because a maintained-looking line is the one nobody re-reads](lessons/128-the-line-that-says-where-production-is-went-stale-three-ti.md)
- **§129** — [A gate anchored on the FIRST match measures whichever paragraph happens to sit highest, and adding an unrelated section above it silently moved what it was reading](lessons/129-a-gate-anchored-on-the-first-match-measures-whichever-para.md)
- **§130** — [A measurement state that mutates the fixture charges every check around it, and "put it last" is not the fix, because there is always work after the last thing in a list](lessons/130-a-measurement-state-that-mutates-the-fixture-charges-every.md)
- **§131** — [Three releases were spent making one wrong object quieter, and each fix was a smaller version of the same mistake](lessons/131-three-releases-were-spent-making-one-wrong-object-quieter.md)
- **§132** — [The status page whose whole point is being current at ONE address was structurally always one promotion behind it](lessons/132-the-status-page-whose-whole-point-is-being-current-at-one.md)
- **§133** — [Every gate in this family is built by planting a failure and restoring, and the reflex for restoring is the one command that deletes the gate being built](lessons/133-every-gate-in-this-family-is-built-by-planting-a-failure-a.md)
- **§134** — [Every accessibility check reached the screen by the shortest programmatic path, so the door a finger actually opens had been broken for six releases with every gate green](lessons/134-every-accessibility-check-reached-the-screen-by-the-shorte.md)
- **§135** — [A live commit hook rolled back to before two of its guards existed refused one check loudly and skipped the other two in silence](lessons/135-a-live-commit-hook-rolled-back-to-before-two-of-its-guards.md)
- **§136** — [An accessibility affordance was REPLACED with an unmeasured one, and the check written alongside it asked a question the new design could not fail](lessons/136-an-accessibility-affordance-was-replaced-with-an-unmeasure.md)
- **§137** — [Six screens were moved inside one dialog, which silently removed the gate that had been refusing an unmeasured screen since the app was built](lessons/137-six-screens-were-moved-inside-one-dialog-which-silently-re.md)
- **§138** — [A new check passed a plant of the exact bug it was written for, because every record in the fixture had exactly one child](lessons/138-a-new-check-passed-a-plant-of-the-exact-bug-it-was-written.md)
- **§139** — [Three releases shipped with a CI gate failing, because every step after a failure keeps running and the last twenty lines of a red run are green](lessons/139-three-releases-shipped-with-a-ci-gate-failing-because-ever.md)
- **§140** — [Fourteen correct fixes to one file, all the same shape, and "why are there fourteen" was never asked from inside the work](lessons/140-fourteen-correct-fixes-to-one-file-all-the-same-shape-and.md)
- **§141** — [A check derived its own population from the fix it enforced, so it could only ever confirm the surfaces already fixed](lessons/141-a-check-derived-its-population-from-the-fix-it-enforced.md)
- **§142** — [A visual gate read computed style, where `outline-width` is 3px whether or not one of those pixels reaches the screen](lessons/142-a-visual-gate-read-computed-style-where-outline-width-is.md)
- **§143** — [The stale-clone guard ran at session start, and the clone was replaced four hours later — with the remote-tracking refs stale alongside it](lessons/143-the-stale-clone-guard-ran-at-session-start-and-the-clone.md)
- **§144** — [Two guards covering one condition make each other unplantable, and each reads as load-bearing on its own](lessons/144-two-guards-covering-one-condition-make-each-other-unplant.md)
- **§145** — [A tolerance on a COUNTED quantity has nothing to absorb, and the first thing it does is reject something correct](lessons/145-a-tolerance-on-a-counted-quantity-has-nothing-to-absorb.md)
- **§146** — [A gate that bans a word cannot scan the copy that exists to say the word is absent](lessons/146-a-gate-that-bans-a-word-cannot-scan-the-copy-that-exists.md)
- **§147** — [A validity check applied uniformly across categories silently DELETED a whole category, and the surface it emptied looked healthy](lessons/147-a-validity-check-applied-uniformly-deleted-a-whole-catego.md)
- **§148** — [Node strips TypeScript itself now, so a TypeScript project can carry ZERO runtime dependencies and one build one](lessons/148-node-strips-typescript-itself-so-a-project-can-carry-zero.md)
- **§149** — [A gate placed after an expensive optional step is a gate that stops running when that step breaks](lessons/149-a-gate-after-an-expensive-optional-step-stops-running-whe.md)
- **§150** — [A generated file that is gitignored makes CI the first fresh clone the repository has ever had](lessons/150-a-generated-gitignored-file-makes-ci-the-first-fresh-clon.md)
- **§151** — [Every secondary button in a shipped app was painted by the browser, not by the theme — and every gate was green](lessons/151-every-secondary-button-was-painted-by-the-browser-not-the.md)
- **§152** — [An app offered the reader a new version, they took it, and nothing ever said what changed](lessons/152-an-app-offered-an-update-and-never-said-what-it-changed.md)
- **§153** — [A check's sentence and its predicate are two different things, and only one of them runs](lessons/153-a-checks-sentence-and-its-predicate-are-two-different-thi.md)
- **§154** — [A button class that omits `display` means something else on an `<a>`, and the floor it declares is silently inert](lessons/154-a-button-class-that-omits-display-means-something-else-on.md)
- **§155** — [`exclude` is inherited through `extends`, so a whole directory was checked by neither project while both exited 0](lessons/155-exclude-is-inherited-through-extends-so-a-directory-was.md)
- **§156** — [A drift check regenerates from the same generator, so it can only catch a wrong artefact — never a wrong generator](lessons/156-a-drift-check-regenerates-from-the-same-generator-so-it.md)
- **§157** — [`clients.claim()` fires `controllerchange` exactly as a replacement does, so "reload when the worker changes" reloads every first-time visitor](lessons/157-clients-claim-fires-controllerchange-exactly-as-a-replac.md)
- **§158** — [A stylesheet block that never landed passes every accessibility check, because none of them ask where the words are](lessons/158-a-stylesheet-block-that-never-landed-passes-every-access.md)
- **§159** — [An internal key leaked into the question and asked a reader to rearrange an equation for a letter that was not in it](lessons/159-an-internal-key-leaked-into-the-question-and-asked-a-rea.md)
- **§160** — [A control that had existed since the first release did nothing in six of its fourteen positions, and nothing could have noticed](lessons/160-a-control-that-has-existed-since-release-one-and-never-be.md)
- **§161** — [A push that creates no workflow run at all leaves the last commit's green tick standing in its place](lessons/161-a-push-that-creates-no-workflow-run-at-all-shows-a-green.md)
- **§162** — [A filtered API query served stale results, agreed with itself three times, and a session reported a production outage that was not happening](lessons/162-a-filtered-api-query-served-stale-results-and-a-session-c.md)
- **§163** — [A guard installed by a lifecycle hook does not exist in a session rooted somewhere else](lessons/163-a-guard-installed-by-a-lifecycle-hook-does-not-exist-in-a.md)
- **§164** — [A defect a sibling app already found is one this app probably has, and their NOTES is where it is written down](lessons/164-a-defect-a-sibling-app-already-found-is-one-this-app-pro.md)
- **§165** — [Lengthening a displayed string loosens every substring check that reads it](lessons/165-lengthening-a-displayed-string-loosens-every-substring-c.md)
- **§166** — [A reduced view hides a list of selectors, and with them everything those elements were the only carrier of](lessons/166-a-reduced-view-hides-a-list-of-selectors-and-with-them-e.md)
- **§167** — [A `value` or `placeholder` attribute is copy, and no proofread of the prose reaches it](lessons/167-a-value-or-placeholder-attribute-is-copy-and-no-proofrea.md)
- **§168** — [An author `display` rule silently disables the `hidden` attribute, and the element paints beside the sentence explaining it is not being offered](lessons/168-an-author-display-rule-silently-disables-the-hidden-attri.md)
- **§169** — [Comparing two apps by READING one is not comparison — enumerate both sets, or you find the first difference and stop](lessons/169-comparing-two-apps-by-reading-one-and-picking-things-out.md)
- **§170** — [A destructive git command that assumes its working directory will eventually run in the wrong repository](lessons/170-a-destructive-git-command-that-assumes-its-working-direc.md)
- **§171** — [A new repo was missing the one file every sibling already has, and three round trips were spent asking a person to do what CI does](lessons/171-a-new-repo-was-missing-the-deploy-workflow-every-sibling.md)
- **§172** — [Every gate agreed the label was there, visible and correctly styled, and on a phone it opened outside the frame](lessons/172-no-gate-asked-whether-a-thing-that-opens-can-be-seen.md)
- **§173** — [A 200 from a static host is not evidence the page exists, and the client may be lying about why it cannot reach it](lessons/173-a-200-from-a-static-host-is-not-evidence-the-page-exist.md)
- **§174** — [The geometry gate assumed the screen starts at y = 0, and certified something behind the header](lessons/174-the-geometry-gate-assumed-the-screen-starts-at-y-zero.md)
- **§175** — [A dialog with no focus target of its own opens wherever the engine decides, and the two engines decide differently](lessons/175-a-dialog-with-no-focus-target-opens-wherever-the-engine.md)
- **§176** — [A phone's screen is not its viewport, and a suite that measures the screen is 27% too generous forever](lessons/176-a-phones-screen-is-not-its-viewport-and-the-suite-measu.md)
- **§177** — [A receipt for a long walk is stamped from the tree at the END, and four minutes is long enough to edit the thing it certifies](lessons/177-a-receipt-for-a-long-walk-is-stamped-from-the-tree-at-th.md)
- **§178** — [A failure that names a number instead of a cause sends the next attempt guessing, and a swallowed timeout inside a retry loop spins in silence](lessons/178-a-driven-state-that-cannot-be-reached-and-a-failure-that.md)
- **§179** — [A suite audits STATES; a reader lives through a SEQUENCE — and every defect a walkthrough found was in the seconds between them](lessons/179-a-suite-audits-states-and-a-reader-lives-through-a-seque.md)
- **§180** — [A gate that keys on copy pins the copy — and pins the defect with it](lessons/180-a-gate-that-keys-on-copy-pins-the-copy-and-the-defect.md)
- **§181** — [An observer that writes what another observer watches is a loop, and the loop presents as a timeout somewhere else](lessons/181-an-observer-that-writes-what-another-observer-watches.md)
- **§182** — [A feature that cannot be found reads as missing, and "build it" is the expensive wrong answer](lessons/182-a-feature-that-exists-and-cannot-be-found-reads-as-missin.md)
- **§183** — [A gate that lives in the hub and runs in two repos is a gate that does not exist](lessons/183-a-shared-gate-that-two-repos-run-is-a-gate-that-does-not.md)
- **§184** — [A reusable workflow cannot learn its own commit, and the wrong guess went green](lessons/184-a-reusable-workflow-cannot-learn-its-own-commit-and-the.md)
- **§185** — [An offline suite that waits on a live service has an upstream's uptime in its verdict](lessons/185-a-suite-that-cannot-reach-a-service-is-not-the-same-as.md)
