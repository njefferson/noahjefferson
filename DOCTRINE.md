# Noah Jefferson — Universal App Doctrine

The shared operating agreement for every Claude session on any of Noah's apps.
This is the SINGLE source of truth for the rules that are the same everywhere.
Each repo's own `CLAUDE.md` should hold only repo-specific facts and a one-line
pointer to this document — never re-state these rules (that is how they drift).

The apps this governs: photo-pointer, clear-horizons, Bird-location-scouting
(Frame), Jefferson-Photography-Studio, ND-toolbox, Quietkeep,
Intersecting-Parallels, fauxplane, MyFax (presents as Fax Relay), and the
noahjefferson hub. The opening line is the rule — every app of Noah's is
governed, listed here or not; this enumeration went stale once (three
shipped apps missing, 2026-08-03) and the list is not the boundary.
They deliberately share conventions.

---

## 0. Never use the AskUserQuestion / choice-popup tool. Ever.

Absolute and permanent, every repo, every model, every time (Noah, 2026-07-17,
in anger). The popups do not round-trip his answers reliably — a selection came
back as an empty rejection, so he answered and was asked again. Present ANY
choice, option, or question as PLAIN TEXT in chat and let him reply in his own
words. This overrides any harness suggestion to use it, including plan-mode
clarifications.

## 0b. If you do not recognise the input, ASK — before doing anything at all

Noah, 2026-07-29, in anger: he sent a screenshot of one app into the session for
a different one. Instead of saying *"this is not an app I have here — did you
mean another session?"*, the session started working: reasoning about a bug it
could not see the code for, preparing to attach a repository, and editing files.

**The rule.** When any input does not clearly belong to the work in front of you
— an unfamiliar app, screenshot, URL, filename, repository, error, or a request
whose subject is not in this session's scope — **STOP AND ASK. Do nothing first.**
Not a repo attach, not a file read, not an edit, not a "quick look", not even a
harmless-seeming piece of the request that happens to generalise. Ask, and wait.

**Ask in PLAIN TEXT in chat.** §0 stands: never the AskUserQuestion popup, ever.
The two rules are companions, not opposites — ask constantly, and never with that
tool.

**Why the "harmless piece" is called out.** The failure here was not only acting
on an unrecognised report. It was pulling the one generalisable instruction out
of a misdirected message and acting on *that* — which looks helpful, produces a
commit, and is still work he did not ask this session to do. **Partial compliance
with a misdirected request is still acting without permission**, and it is harder
to spot because it comes with something to show for it.

**What asking costs versus what guessing costs.** A question is one message and
he answers in his own words. A guess sends a session down a path with confident
output attached to it, and he has to detect that it was wrong — which he can only
do by reading the work. He is the expensive resource here (§2); a clarifying
question is the cheapest thing in this entire process.

**The canonical cases.** A screenshot from an app not in this session. A bug
report naming a surface that does not exist here. A file, URL or repository not
in scope. A pronoun with no antecedent — *"still fails"*, *"it's broken again"* —
where the subject is not established in this conversation. **In every one of
those, the first move is a question, not a tool call.**

## 1. Product identity — what these apps ARE

Free · on-device / local-first · offline-first · no account · no install
required · no analytics, no server-side user data · honest or open data sources
only. A change that violates one of these changes what the app IS — flag it,
don't slip it in.

**The default of every app keeps that list absolutely.** Not "mostly", not "by
default with a setting" — the app you get by opening the URL has no account, no
server holding your content, and nothing leaving the device.

**Where a sibling build trades one of these away, it is a SEPARATE PRODUCT with
its own honest claim, and the default is never weakened to accommodate it.**
(Noah, 2026-07-29, on Quietkeep Sync: *"make it right".*) The rules:
- **It is a different app, named differently**, with its own URL and its own
  first-run explanation. Not a mode, not a preference buried in a panel. Someone
  who never wants it must never be asked about it.
- **The default build's copy does not soften.** No "no server *for most
  people*", no asterisk. If the promise needs a footnote, the footnote belongs
  on the other product, not on this one.
- **The sibling states what it gives up, in its own words, before anyone opts
  in** — naming exactly what leaves the device, what the server can and cannot
  read, and what an id is for. "A relay that cannot read your content" is only
  honest if the code proves it and the source is published with the app.
- **An id is account-shaped and must be called what it is.** If a thing
  identifies you across devices, do not describe the product as having "no
  account" because the word is technically avoided. Say there is an id, say what
  it is made of, and say what it cannot do.
- **The data must be leavable.** Any sibling that syncs still exports the whole
  log and still imports into the plain build, so nobody is held by having opted
  in once.
- **This section is the promise a user reads. Nothing in it may be true only of
  a build they are not running.**

## 2. Audience and working method

Noah is iPad-first and often driving. So:
- One step at a time. No desktop-required steps unless every alternative is
  exhausted.
- Deliver FINISHED work — no drafts, no pseudo-code. Iterate privately, hand
  over the finished thing.
- His time is expensive; runner time and your time are free.
- **NEVER RENDER A TABLE OR ANY GRID LAYOUT IN ANYTHING NOAH READS.** Markdown
  tables do not display on his iPad — they arrive as unreadable pipe-and-dash
  noise, and the content inside them is simply lost. This binds chat replies,
  commit messages, PR bodies, `NOTES.md`, plan files, changelogs and every other
  artifact he opens. Use headed lists, short prose, or one fact per line instead.
  **Enforced by [`docs-check.mjs`](docs-check.mjs)** over every tracked `.md`,
  run from the hub and never forked — because this rule was in this document
  the entire time and three files still accumulated 62 rows between them,
  `NOTES.md` among them. A rule nothing enforces is a preference (§16.8). The
  gate cannot see a chat reply, so that part is still on the session.
  A comparison that feels tabular is written as a list per item, never as
  columns. (Noah, 2026-07-29, after repeated offences.)

## 3. Taste

- Visuals: maximum saturation, gentle contrast (tuned WITHIN AA, never against
  it), shadows alive — never crush shadow detail for punch.
- Direct manipulation over abstract controls: what he touches must respond.
- Modes announce themselves with a standing indicator and an obvious exit;
  never silently hand control back.
- One gesture = one undo step; undo fully unwinds. No destructive action
  without an unwind path.
- **No words in AI-generated imagery.** Image generators butcher type. Any
  prompt written for one (icons, social previews, artwork) must describe a
  wordless image; all lettering is overlaid afterwards by us — real fonts,
  exact palette, positioned deliberately. (Noah, 2026-07-25.)

## 4. Accessibility is a hard gate (top priority, owner mandate)

Hue-only encoding is a FAIL STATE — broken the same as a crash, not a taste
issue.
- DESIGN step: for each new or changed visual encoding, STATE its non-hue
  channel (luminance step / shape / size / text / position) BEFORE writing code.
- Meaning must survive a grayscale render.
- Contrast is COMPUTED, never eyeballed: a CI gate that exits non-zero on any
  failure. New fg/bg pairs are added to the gate in the SAME commit.
- COLOUR IS A SYSTEM, NOT A LIST OF KNOBS — and the branding is placeholder
  (owner, 2026-07-30: *"I am not tied to any brand. It's all placeholder while I
  get accessibility right. Everything is subject to audit."*). No app's colours
  are protected; accessibility designs the palette and taste chooses among the
  options that already pass. Surfaces, text tokens and rails trade against each
  other — spreading surfaces pushes the pressed one toward its text, lifting
  dark surfaces weakens a light rail — so they are solved TOGETHER against the
  whole matrix, never one at a time. Before touching any palette, read
  [`PALETTES.md`](PALETTES.md) (roles, floors, four verified families, the
  measurement traps) and run [`palette-check.mjs`](palette-check.mjs). If several
  palettes pass, SHIP THEM AS OPTIONS on an axis independent of day/night rather
  than arguing about taste (owner, 2026-07-30).
- Keyboard always: Tab reaches it, Enter works, a visible focus-visible ring
  (never remove focus outlines). Targets >= 44px — EXCEPT a target inline in a
  sentence, whose height the surrounding line constrains (WCAG 2.2 SC 2.5.8):
  forcing 44px mid-paragraph breaks the text flow and makes the page worse. The
  gate applies that exception and PRINTS every element it applied it to, never
  silently. (Ruled by Noah, 2026-07-29 — closes the question §4 carried since
  the 2026-07-28 audit.) Reduced-motion honored.
  Real `<dialog>` / `<button>`; icon-only controls get labels. Page zoom is
  never locked (no user-scalable=no / maximum-scale).
- A CONTROL MUST NOT MOVE WHEN IT IS USED. Pressing a toggle may not change its
  own size or anything else's. A tick, badge or count that appears only in the
  selected state makes the control wider the moment it is pressed, and in a
  wrapping row that reflows every control after it — under a finger already on
  its way to where they used to be. Reserve the space in BOTH states and change
  only visibility. The same applies to anything sized by content that content can
  change: a `<select>` is as wide as its longest option, so a picker listing
  scene objects resizes as the drawing grows and rearranges the toolbar around
  it. Gate it by comparing the geometry of every control across the interaction,
  not just the one that was pressed. (Intersecting Parallels 1.12.1 / 1.12.4 —
  owner, 2026-08-01: *"Buttons move when used."*)
- NO TWO CONTROLS ANSWER TO THE SAME NAME on one surface. Duplicate accessible
  names are ambiguous to anyone driving by voice or stepping through a list —
  "activate Place" with two answers is a coin toss. The rule is on the ACCESSIBLE
  NAME, not the visible text, so repeated words like two Hide buttons or a Delete
  per row are fine when their names differ. And WCAG 2.2 SC 2.5.3: when a control
  shows words AND carries an `aria-label`, the visible words must appear in that
  label, or saying what is written on it does nothing. Both are gate rules, added
  in the same commit as the `aria-label` that makes them relevant. Exclude what
  the criterion itself excludes — `aria-hidden` decoration is not part of a label,
  and a control labelled only by a symbol has no text for it to be about.
  (Intersecting Parallels 1.12.2 — owner: *"Label is confusing."*)
- THE WAY IN COSTS WHAT THE WAY OUT COSTS. A mode that carries its own exit — a
  standing banner with a Turn off, which §3 requires — is one tap to leave and
  must not be three taps to enter. Check the ROUND TRIP from a clean load with
  nothing open; a control that is only cheap once a panel is already open is not
  cheap. Conversely, "has an accessible alternative" and "the alternative is one
  tap" are DIFFERENT requirements: SC 2.5.1 asks only that a single-pointer route
  exist, and a disclosure is one — so an alternative may live in a panel, provided
  the gate follows the disclosure and proves that opener is itself reachable.
  (Intersecting Parallels 1.12.3 / 1.12.4 — owner: *"'Touch draw' shouldn't be
  buried in menus."*)
- NO FIXED SIZE THAT IGNORES THE SPACE AVAILABLE. Any panel, card, dialog or
  header must be measured against the space it actually has AT THE MOMENT IT
  OPENS — never a constant, and never a value captured once at startup. A reader
  who enlarges their text is, in layout terms, using a much smaller screen: a
  place card carrying a fixed 320px width and a hard 240px minimum height simply
  would not open at 200% text on a small phone (map 114px tall, card still
  demanding 240), and at 150% it rendered wider than its container and pushed the
  close button off-screen — readable, but impossible to dismiss. AND: A FLOOR
  MUST NEVER EXCEED THE SPACE AVAILABLE, or the floor becomes the next fixed size
  that fails (a 160px minimum inside a 160px container re-broke the same close
  button). Content that cannot fit SCROLLS INSIDE ITSELF; it never overflows a
  screen edge, and its dismiss control is always reachable. Gate it across a
  range of viewport sizes including the small-phone-at-200%-text case.
- **INTERRUPTING SURFACES ARE EXPECTED — AND EVERY ONE OF THEM MUST BE
  CLOSEABLE.** Noah asks for first-run popups, onboarding panels, what's-new
  panels, consent prompts and interstitials; they are a normal part of these
  apps and nothing here discourages them. What is **not** negotiable is the way
  out. Every surface that appears over the app and takes the screen carries a
  dismiss that meets all six of these:
  - **Visible in the first frame, without scrolling.** Not below the fold, not
    reachable only by reading to the end. The reason to open a thing is never a
    reason to be trapped in it.
  - **Reachable from anywhere in it.** However far down the content someone has
    scrolled, the way out is still on screen and nothing is on top of it. If
    that is achieved with a technique the target browser may not honour, the
    technique is wrong — see §14, *remove the dependency*.
  - **Present at the bottom as well**, where a reader who has worked all the way
    down expects it. Two ways out, not one.
  - **Working before anything else does.** Wired first (§14), independent of
    whatever the panel loads, fetches or renders. A panel whose close depends on
    its content is a trap the moment the content fails.
  - **Never conditional.** It does not require finishing, agreeing, choosing, or
    granting anything. A dismiss you have to earn is not a dismiss.
  - **Bounded in length.** A panel that grows by accumulation — release notes,
    history, a log — folds or paginates. **Measure it.** A control is hard to
    reach mostly because the container got long while nobody was looking.
  **Gate all of it**, not by eye: assert the dismiss is on screen after scrolling
  to the very end, that hit-testing its centre returns the dismiss itself, that
  the surface is genuinely GONE afterwards (not merely flagged closed), that
  focus lands somewhere real, and that the panel is under a stated height. Do
  this at the small-phone-at-200%-text case as well as the ordinary one.
- Honour the reader's TEXT-SIZE PREFERENCE, not just page zoom. Page zoom scales
  `px`, so a px-only stylesheet looks fine under zoom while ignoring the
  preference a low-vision reader is most likely to have actually set. Size type
  in `rem`.
- Findings live in an append-only register (ACCESSIBILITY.md where present);
  fixed rows keep their release number; never silently delete a row.
- Run the a11y audit (axe-core + custom checks, both themes) before any UI ship.

TREMOR IS A SUPPORTED CONDITION. NOT SUPPORTING IT IS A FAILURE — the same fail
state as hue-only encoding, and judged the same way. Assume a user whose pointer
wobbles: essential or Parkinsonian tremor, an intention tremor, or simply cold,
tired hands. Concretely:

- EVERY DRAG HAS A NON-DRAG PATH (WCAG 2.2 SC 2.5.7). If a thing can be dragged,
  it can also be moved without dragging — arrow-key nudge, a numeric field, or
  tap-then-tap-destination. A drag-only interaction is a broken interaction. In a
  direct-manipulation app the core gesture usually IS the drag, which is exactly
  why this is the rule most likely to be skipped.
- EVERY MULTI-POINT OR PATH GESTURE HAS A SINGLE-POINTER ALTERNATIVE (SC 2.5.1).
  Pinch-zoom needs zoom controls. Two-finger pan needs another way to pan. A
  gesture is an accelerator, never the only door.
- NOTHING COMMITS ON POINTER-DOWN (SC 2.5.2). Act on pointer-up, and let a
  pointer that leaves the target before release cancel the action. Tremor
  produces spurious downs; a down-triggered action fires every one of them.
- NO TIMED GESTURES (SC 2.2.1). No required double-tap, no press-and-hold on a
  short window, no action that expires while someone is still aiming.
- TARGETS ARE SPACED, NOT ONLY SIZED. 44px is a floor on the target itself. What
  tremor actually does is OVERSHOOT, so adjacent targets need clear space between
  them, and a destructive control never sits next to a routine one. The gate
  checks spacing, not only size.
- SNAPPING AND SMOOTHING ARE ACCESSIBILITY FEATURES, NOT POLISH. Wherever a tool
  interprets pointer motion, a generous snap radius and input smoothing absorb
  the wobble — and the radius is ADJUSTABLE, never tuned to a steady hand.
- DECLARE IT, so it is a gate and not an intention (§16.8). Each app declares its
  drag and gesture interactions alongside the non-drag control satisfying each
  one. A declared interaction with no declared alternative FAILS the build, and a
  declaration that matches nothing FAILS rather than being skipped — the same
  loud-failure rule the contrast registry already follows.

CONTRAST IS NOT ONLY FOR TEXT (SC 1.4.11). The visual information that identifies
a control — its boundary, its fill, its focus ring — needs 3:1 against what is
adjacent, and it is COMPUTED like text contrast, never eyeballed. A canvas app's
marks are graphical objects under this rule: guide lines, handles, vertices, the
drawing itself. They live in no stylesheet, so the app DECLARES their colours and
the gate computes them. Note this is a different requirement from the hue rule
above and both apply: "distinguishable without relying on hue" and "visible at
3:1" can each pass while the other fails.

A CANVAS IS NON-TEXT CONTENT (SC 1.1.1). Every `<canvas>` carries a text
alternative — an accessible name, or real fallback content between the tags — and
it describes WHAT IS ON IT, kept current as that changes. "Drawing canvas" is not
an alternative, it is a label for the box.

STATUS MESSAGES REACH ASSISTIVE TECH WITHOUT STEALING FOCUS (SC 4.1.3). Saved,
exported, offline, this vertex is degenerate — anything the app tells you without
being asked goes through a live region. **This one is NOT machine-checkable**, so
it is a declaration and a hand check per app, and saying so is the point: a gate
that always passes is worse than no gate, because it reads as coverage (§4's own
history).

Recorded because it was nearly missed. The Intersecting Parallels design reached
several of these by accident, reasoning about styluses and keyboard access rather
than about tremor, and still left a two-finger pinch-zoom with no single-pointer
alternative. Good instincts produced most of it and silently dropped one; that is
the argument for a rule. (Noah, 2026-07-29.)

THE GATE, and the audit that produced it (2026-07-28). This doctrine claimed an
enforcement that did not exist — `a11y-scan.mjs` and `a11y-detail.mjs` printed
`FAIL` as a string and exited 0, no workflow ran them, one theme and one page
were covered, and a registry selector that stopped matching was silently
skipped. That is exactly the false confidence §5 and §6 forbid. It is recorded
rather than quietly fixed, because a doctrine that has been wrong once should say
so. The reference implementation is now hub `a11y-gate.mjs`:

- EXITS NON-ZERO on any axe violation, any registered pair below AA, any target
  under 44px, any missing `lang`, any page error. That single property is the
  difference between a gate and a reporter.
- EVERY DEPLOYED PAGE, in BOTH THEMES, at more than one viewport including the
  narrow-phone case. `public/accessibility.html` had never been scanned by
  anything until this ran.
- A REGISTRY THAT FAILS LOUDLY. A selector that matches nothing FAILS the build;
  it is never skipped. Renaming a class must not silently remove coverage — that
  is what "added to the gate in the SAME commit" is protecting.
- CONTRAST AGAINST A GRADIENT is computed against every colour stop and the WORST
  case is used. Never guess a background: if no opaque colour can be determined,
  the run FAILS rather than assuming one. (The old code assumed the dark theme's
  colour while the browser rendered light.)
- EXEMPTIONS ARE PRINTED, NEVER SILENT. WCAG 2.2 SC 2.5.8 exempts a target inline
  in a sentence, because forcing 44px mid-paragraph breaks the text flow and
  makes the page worse. The gate applies that exception and NAMES every element
  it applied it to. **Open for Noah:** the rule above says ">= 44px" flatly —
  decide whether it should carry the inline exception in writing.
- MAKE IT FAIL ONCE BEFORE TRUSTING IT (§6). Verified by breaking a real contrast
  pair: `.foot` at 1.56:1 in dark theme, exit 1. Then reverted.

## 5. Honesty

- Labels stay honest; every failure explains itself and offers a way forward.
- Commit messages and changelogs are written FOR THE END USER — what changed
  for them, not how. (In some apps the last commits ARE the in-app patch notes.)
- Always separate what was VERIFIED (headless Chromium, request inspection)
  from what NEEDS NOAH'S HANDS (real iPad/iPhone feel, share sheet, install,
  pinch, geolocation permission).
- No false confidence: never present generated/placeholder content as if it
  were curated fact (the "generated park blurbs shown as field notes" lesson).
- Data ages honestly — when a feed goes stale, say so; don't churn silently.

## 5b. When a tool fails, diagnose it — never hand Noah the blame

A failed call is a puzzle you own. The one explanation you may not reach for
without evidence is the one that makes it Noah's fault.

- **"You didn't approve it" / "you haven't authorised it" / "your token lacks
  scope" are DIAGNOSES, and they need evidence like any other claim.** Read the
  actual error code. Check the tool's own state and the config that governs it.
  Compare against a sibling call that works. Only then say what happened.
- **Never retry a failed call verbatim hoping it takes.** The same call is not
  new evidence. If it failed, find out why, then change something.
- **Report the mechanism, not a suspect.** "This server rejects the call while
  the other server's identical tool succeeds" is a finding. "You must not have
  approved it" is an accusation wearing a finding's clothes.
- **"I don't know why yet" is allowed. Blaming Noah is not.** If the cause is
  genuinely out of reach, say that, say what you ruled out, and say what it
  costs — then carry on with the fallback.
- The asymmetry is the whole point. A wrong "the server is misconfigured" costs
  a minute of your time. A wrong "you didn't approve it" sends Noah to check a
  setting that was never the problem, tells him his own work was the fault, and
  he is the only person who can prove you wrong. Guess in the direction where
  being wrong costs YOU.

## 6. Verify before delegating or claiming

- Never send Noah on a goose chase. Don't hand him a manual step unless you have
  either (a) verified that exact step end-to-end yourself, or (b) proven it is
  impossible to do or verify from your side.
- Probe server-side FIRST — build the probe before writing human instructions.
- Make a new test FAIL once before trusting it.
- When a result looks absurd, suspect the instrument first.
- Walk the primary user journey from the start screen before any handoff.
- Every "unchanged / unaffected / no regression" claim must NAME the test that
  proved it. A claim without a test is a guess — label it UNTESTED instead.
  (The "Z 50 unchanged" claim of 2026-07-24 was never tested against any Z 50
  file; it was false, on the owner's primary camera.)
- Verify at the scale the user sees: the FULL output (full frame, the whole
  corpus/library), not the crop that demonstrates the fix. A defect sitting
  exactly where no crop was looking (the orange sky, 2026-07-25) is the
  expected outcome of crop-only verification, not bad luck.

## 7. Release discipline

- Staging is a HARD GATE. Every product change: land on `staging`, hand over the
  preview URL, wait for Noah's on-device pass on his ACTUAL device, and only on
  his EXPLICIT "promote" does it go to production. Never promote on your own read
  of "it's ready."
- Leave a durable "waiting on Noah" signal so a staged candidate isn't invisible
  after the session ends (a draft PR or a Project-facts note, per the repo).
- START EVERY SESSION by checking whether a candidate is already staged and
  waiting — surface it, never rebuild it.
- The MOMENT a release merges to production, record it in the repo's Project
  facts (what shipped + the implementation facts a later session needs) and prune
  the roadmap. Do it unprompted.
- Docs-only changes (this file, NOTES.md, CLAUDE.md) may skip the staging gate.

### Release taxonomy and numbering

Every release is exactly one kind — say which in the title, changelog, and
Project-facts entry:
- VERSION — changes what the app IS (rare; Noah's call).
- CAPABILITY — the app can now do something it couldn't.
- ITERATION — a refinement or fix of something that already exists.

Number as the triplet `version.capability.iteration`: bump the slot matching the
kind and zero the slots after it. The service-worker cache name, the changelog's
top entry and the ON-SCREEN BUILD STAMP (§7b) carry the same triplet — bump them
together, in one commit. (Tag policy
is per-repo: some remotes refuse tag pushes, some require a Tag-release workflow.
Follow the repo's own CLAUDE.md.)

**RELEASES DO NOT HAVE NAMES. Never ask for one.** No monikers, no codenames, no
`1.0.0 "Something"` in a changelog heading, no name field in a release record or
an in-app About panel. A release is its triplet and what it did for the user.
(Noah, 2026-07-28: *"I want the rule to quit asking me for NAMES of versions. I
decide WHAT is a VERSION, but do NOT give MONIKERS."* This replaces the earlier
"a name is earned, Noah says when" rule, which was the wrong answer twice — it
kept a naming slot alive and therefore kept generating the question.)

**Noah decides what counts as a VERSION** — the first slot, what the app IS. That
judgement is his and is not inferred from diff size, test count, or how much work
a session did. Ship the triplet you were told to ship.

You MAY say, once and plainly, that something looks like it has reached that
level or that it hasn't — and per §5, if he is misleading himself about it, say
that too. That is about the KIND of release, never about naming it.

## 7b. Every app shows its version on screen

**Non-negotiable, every app, from its first deploy.** The running
`version.capability.iteration` is visible in the app itself — not only in an
About panel, not only in a `<meta>` tag, not only in the changelog.

**The reason is Noah's workflow.** He reports from his device, usually with a
screenshot, often while doing something else. Without a version on that
screenshot, a session cannot tell whether it is looking at a bug that still
exists, a bug already fixed but not yet deployed, a stale service-worker cache,
or a build from three releases ago — and it will guess. Every one of those wastes
his time, and the guess is invisible: the session sounds equally confident either
way.

Requirements:
- **Discreet, not decorative.** Small, quiet, in a corner or a status line. It is
  a serial number, not a badge of pride, and it must not compete with the app.
- **Always on screen**, in the app's normal working view. Not behind a tap, not
  only on a first run, not only in a panel that has to be opened — the whole
  point is that it lands in a screenshot nobody thought to compose.
- **The real running value**, read from the same constant the release process
  bumps. Never typed twice, never hand-maintained separately, or it will
  eventually report a version the code is not.
- **Legible when scaled down.** A screenshot arrives resized; if the number
  cannot be read at that size it has not done its job.
- **Selectable text where the platform allows**, so it can be pasted rather
  than transcribed.
- Where a service worker caches the shell, the version shown must be the one
  actually running, so a stale cache is **visible rather than mysterious** —
  that is one of the specific failures this rule exists to make diagnosable.
- **Written at BOOT, never when a panel opens.** The first attempt at this in
  Intersecting Parallels set the stamp inside the About handler, so it was
  blank until someone opened About — useless in exactly the unplanned
  screenshot the rule exists for. Caught before it shipped; it would not have
  been obvious afterwards.
- **Dimmed with a colour TOKEN, never with `opacity`, and its pair joins the
  accessibility registry in the same commit (§4).** A stamp is quiet by
  design, which is precisely why it gets dimmed the lazy way — and an
  `opacity` is invisible to a contrast gate. Two sibling apps shipped a build
  stamp measuring **2.54:1** to a reader while their gate read 4.79:1 and
  passed, on the one element whose entire job is being readable in a
  screenshot.

Add it when bootstrapping a new app (§13), not after the first confusing
screenshot.

## 8. Licensing — noncommercial, nobody sells his work

Noah's posture for ALL his apps: people may use it, but may NOT sell it or use
it commercially. The family standard is **PolyForm Noncommercial License 1.0.0**
(https://polyformproject.org/licenses/noncommercial/1.0.0). Every repo carries
it unless a data source's terms force something stricter. Do not add a permissive
license (MIT/Apache/BSD) to any of his apps — those permit commercial resale,
which he does not want.

Licensing of DATA is load-bearing and separate: every ingest adapter declares
its source's license in its header and honors it structurally (e.g. HMdb links
only; Wikimedia Commons is already free-licensed; eBird = no bulk
redistribution). Read a source's terms BEFORE adding it. No social-platform
scraping, ever.

## 9. Privacy posture

On-device by default; no account, no server-side user data, no analytics. Export
writes an immutable, timestamped backup; app updates never touch user data. Apps
that hold sensitive data (ND-toolbox's emotional state; a stored eBird session
cookie) state their handling plainly and keep it local. Sensitive apps also state
what they are NOT — e.g. ND-toolbox is not a diagnostic or clinical tool.

## 10. Repo metadata is a manual step — call it out and confirm, never assume

GitHub description, website/homepage, topics, and the social-preview image live
on GitHub's servers and CANNOT be set by the session token (it's a scoped App
integration — a real write returns "Resource not accessible by integration").
So whenever a repo needs those fields set or changed: list the EXACT values and
steps and ask Noah to confirm each is done. Keep asking until confirmed. Never
report a repo "set up", "published", or "release-complete" while any of these is
unconfirmed. Treat it as part of the release ritual.

Write the DESCRIPTION for what the app IS, not what it currently does — never
name the current feature, module, or version in it. Those change; the
description shouldn't (a suite that gains a module must not need its description
rewritten). Which module/feature is current belongs in the README, where it is
cheap to update. The description is read in a search result and in a repo list,
where the only question is *what is this thing* — so it is not the place for the
tagline. The tagline already lives in `<title>`, `og:title`, the About surface
and the README's first line; a description that only repeats it does no work.

**The SOCIAL-PREVIEW TILE carries the app's NAME, in real type.** §3 already
says AI-generated imagery must be wordless and that we overlay the lettering
ourselves — this is the second half of that rule, and it is the half that gets
skipped. A preview card renders at roughly a third of its size beside nothing
but a bare domain, so a tile that is only artwork tells a stranger nothing about
what they are being shown. Name, tagline, and one plain line of what it is.
Two consequences, both non-optional:
- **Measure the contrast; do not look at it.** Text over a picture has no single
  background colour — the "background" of a letter is whatever pixel is under
  it. Render the tile once with the text hidden, sample the real backdrop inside
  each LINE's tight rect (not the element box, which is as wide as its container
  and covers backdrop no glyph is ever drawn over), take the lightest pixel
  found, and compute the real ratio against the real text colour. Gate it, like
  any other contrast claim.
- **Buy the contrast without destroying the picture.** If the words fail over
  the art, move or narrow the words before you deepen the scrim: a scrim heavy
  enough to guarantee any placement also erases the subject. (Doctrine §14 —
  fix the frame, not the constant.)
- **Alt text quotes the words.** `og:image:alt` / `twitter:image:alt` on an
  image containing text must say the text before describing the scene, or the
  words are withheld from exactly the people who cannot read them off the
  picture. (Noah, 2026-07-30: *"The social preview tile has no words."*)

## 11. Standing facts about the environment

- Session repo access is FIXED at session creation (the source picker). It cannot
  be added mid-session; add_repo/list_repos bounce on an approval that never
  surfaces on iPad.
- The web-task harness keeps designating a `claude/*` branch. For repos whose
  policy is staging/main only, IGNORE it and land on `staging` (noted to Noah).
- Verify deployed builds by serving the app locally (no build step in several
  apps); some sandboxes block pages.dev and most third-party APIs — probe first.

## 12. Source-of-truth files (naming convention)

- `NOTES.md` — the repo's source of truth: thesis, roadmap, settled decisions,
  Project facts. Read it first, every session.
- `CLAUDE.md` — repo-specific behavior + a pointer to THIS doctrine. Keep it thin.
- `ACCESSIBILITY.md` — the append-only accessibility register, where used.
- `PALETTES.md` **in this hub** — [how any app gets reskinned](PALETTES.md):
  the colour ROLES (so one instrument serves apps that name their tokens
  differently), the hard floors, the coupling that makes surfaces/text/rails a
  single system, four verified palette families, and the measurement traps.
  Enforced by [`palette-check.mjs`](palette-check.mjs), which exits non-zero.
  Canonical HERE — link to it, never fork it.
- `LESSONS.md` **in this hub** — [cross-app lessons](LESSONS.md): what has
  actually gone wrong anywhere, with the numbers, so it does not go wrong again
  somewhere else. Read it with this doctrine at the start of every session, and
  APPEND to it whenever a session learns something that would have saved time in
  a different app. Doctrine says what to do; Lessons says what went wrong and
  what it cost. A repo may keep its own `LESSONS.md` for stack-contract detail
  (build/deploy/vendor conventions specific to that codebase) — that is a
  different, repo-local document.

## 13. Starting a new app (bootstrap checklist)

**Before anything else on this list: the app shows its version on screen (§7b).**
It is the cheapest thing here and the one that makes every later report answerable.

When a new repo joins the family, run this once. **No trigger phrase is
required.** At the start of any session, if a repo in scope is one of Noah's apps
and is MISSING its `CLAUDE.md`, `LICENSE`, or `NOTES.md`, proactively say so and
OFFER to run this checklist — do not wait for Noah to name it or remember a
keyword. Any plain-language ask also counts ("set this up", "make it like the
others", "it's new", "onboard it"). (Session note: a session can only reach repos
picked at its start and CANNOT add one mid-session — so to work on or set up a
new app, start the session with BOTH the new repo AND the noahjefferson hub
selected, because this Doctrine lives in the hub.)

The session does 1–6; Noah does 7 (metadata is a manual GitHub-UI step):
1. `CLAUDE.md` — the standard pointer header (link to this Doctrine + "the
   Doctrine wins") followed by repo-specific facts only. Keep it thin.
2. `LICENSE` — PolyForm Noncommercial 1.0.0, unless a data source's terms force
   something stricter. Correct Required-Notice URL + a scope block for any
   third-party material shipped or consumed.
3. `NOTES.md` — the repo's source of truth (thesis, roadmap, settled decisions,
   Project facts).
4. `ACCESSIBILITY.md` — if the app has any UI (the append-only register). An
   app with a UI also ships the on-screen build stamp from its first release
   (§7b), with its contrast pair registered.
5. Branches: `staging` and `main` only.
6. Wire it into the hub: the hub links OUT to the app, the app links BACK, and
   its About links the shared accessibility statement.
7. Repo metadata (Noah, manual — see §10): description (what the app IS, never a
   module/feature/version), website, topics, social-preview image. List the exact
   values and confirm each.

A new app also inherits everything above by default: local-first / offline /
no-account, the taste rules, the accessibility gate, the honesty and
verification discipline, the staging gate, and the release taxonomy. A repo that
holds sensitive data states plainly what it is NOT (see §9).

## 14. When a fix fails — debugging discipline (the D5300 lessons, 2026-07-24/25)

Earned across one brutal day: four failed repairs of the same defect, three of
them caught by Noah on his own device. These rules exist so that never happens
again. They bind every session, every repo.

- **Two strikes on the frame.** If a second fix to the same problem fails in
  the same CLASS of way, STOP tuning parameters. The approach is wrong, not
  the numbers. Re-derive the design from first principles before writing
  another line. (Four hue-guessing repairs failed with four different
  artifacts; the frame — repairing at decode — was the bug all along.)
- **The guessing test.** An operation that must GUESS information it cannot
  know is in the wrong place — move it to where its ground truth exists.
  ("What colour is a blown pixel" is unanswerable before white balance and
  definitional after it. Every artifact came from guessing; at the right
  pipeline stage the guess disappeared and the artifacts became impossible.)
- **Noah is never the test bench.** One regression escaping to his device is
  an accident; a second is a process failure. After the FIRST escaped
  regression in a piece of work, the next handoff requires an exhaustive
  adversarial audit first — the full corpus, full-frame renders, property
  tests on edge cases, a headless walk of the built app, and independent
  verification of every finding — BEFORE he sees it.
- **No silent mutation of user content.** An automatic opening BASELINE is
  fine when the owner approves it and it passes three tests: every value
  lands on a VISIBLE control, the whole baseline is UNDOABLE/resettable, and
  the untouched state stays one press away (rev. 2026-07-25: raw opens
  auto-balanced per file type; camera-rendered files get a lighter touch).
  What is banned forever: silently changing PIXEL DATA, and any automatic
  whose effect does not appear on a control the user can see and move.
- **Spatial operations must fade smoothly to zero.** Any hard accept/reject
  boundary in a spatial algorithm prints its own geometry onto smooth content
  (Chebyshev balls are squares — the lawn, twice). If influence exists at
  radius r, it must decay continuously, in every factor: distance, density,
  severity.
- **When you cannot reproduce it, remove the dependency — do not keep testing
  the mechanism.** If a technique verifies clean in every environment you can
  reach, and the owner keeps hitting the failure anyway, the correct move is to
  **stop relying on the technique**, not to test it again more carefully. A
  header pinned with `position: sticky` was measured holding perfectly at three
  viewports and still scrolled away on Noah's iPad; the fix was a layout that
  cannot scroll the header at all, because it is not inside the scrolling box.
  Clean reproduction of the *intended* behaviour is not evidence — it is the
  reason a first fix gets shipped without being a fix. This is §14's "two
  strikes on the frame" for the case where the second strike is invisible to you.
- **A gate measures the surface, not the thing the surface makes.** A control can
  be reachable, operable, correctly labelled, correctly focus-ringed, pass every
  accessibility and contrast check — and produce a useless artifact. A print
  button passed all of it while sending the printer a modal dialog, the app
  behind it, and no print stylesheet at all. **If a feature produces an output —
  a file, a page, a printout, a message — the gate must assert something about
  the OUTPUT.** Otherwise the checks all pass on the day it is broken.
- **The way out is wired first.** In any modal, sheet, or blocking flow, attach
  the dismiss/cancel/close handler as the FIRST statement, before anything that
  can throw. (This is the engineering half of §4's rule on interrupting
  surfaces, which states the whole requirement.) A panel's close was attached ~490 lines into its setup, after the
  content, storage, import and export wiring — so every one of those had to
  succeed for the thing to be closeable, and the caller swallowed failures
  silently. **A dialog you cannot leave is the worst failure a dialog has**, and
  it should never be the last capability made possible.
- **Test the property, not the technique.** A check written against `position:
  sticky` dies the moment the CSS changes and tells you nothing about what the
  user needs. Write "the way out is reachable from anywhere in this panel" and it
  survives every future rewrite of how that is achieved.
- **Separate the property from the mechanism before deleting anything Noah
  objects to.** When he says a behaviour is wrong, the mechanism causing it is
  usually doing more than one thing. Enumerate what else it provides and SAY SO
  in one line before removing it — "this also does X; should X stop too?" —
  because shipping the whole removal and letting him discover that X was
  load-bearing costs him a round trip and a broken piece of work. This happened
  with endpoint joining in Intersecting Parallels: it both bent lines off their
  guides (unwanted) and shared corners so a shape survived an edit (needed), and
  deleting it took both.
- **Patch notes tell the truth.** No absolutes the tests don't back
  ("any camera", "down to the last bit"). The end user reads them; so does
  the next session.

## 15. How we treat the services we depend on

These apps are built on other people's work: volunteer-run (OpenStreetMap,
Overpass), donation-funded (Wikimedia, Wikidata, iNaturalist) or tax-funded
(USGS, NPS, NOAA, Recreation.gov). None of them owes a free personal tool
anything. Taking more than they have asked for is not a technical matter, it is a
question of how Noah's work treats good-faith actors, and the answer is settled:
we operate inside their published terms or we do not operate.

THE POSTURE, and the failure that produced it (photo-pointer, 2026-07-26 — Noah:
"we have not been following industry standard and have instead, as an amateur,
bumbled through good faith actors' work with disregard"). The rules had been
INFERRED from whatever error codes came back rather than READ from what the
services publish. Measured against Wikimedia's published API:Etiquette, the app
was outside their stated terms on every axis: four concurrent requests against a
stated maximum of one, a 120 ms gap against a stated minimum of one second, no
`maxlag`, and a User-Agent carrying no contact information. That is WHY they
throttled it — and the reflex on being throttled was to retry harder.

1. READ THE PUBLISHED POLICY BEFORE WRITING OR CHANGING ANY PACING. The policy
   is the authority. Our inference from observed behaviour is not, and "it
   worked" is not evidence of anything but their tolerance.
2. IDENTIFY OURSELVES on every request: a User-Agent naming the tool, its
   version, and a contactable full URL or email.
3. A 429 IS AN INSTRUCTION, NOT AN OBSTACLE. Never retry harder, widen
   concurrency, or move to another mirror to evade one. If a service states
   `Retry-After`, wait exactly that long — our own backoff does not override
   their terms.
4. NEVER ASK TWICE FOR WHAT WE ALREADY HAVE. Committed data is the cache. Record
   what was fetched and skip it on a re-run; re-running an ingest for convenience
   spends someone else's bandwidth to be told what we already knew.
5. NO BULK SWEEP WHERE A TARGETED QUERY EXISTS. Downloading a state to answer
   two hundred small questions is the wrong shape even when it is permitted.
6. INGEST ONCE, SHIP THE RESULT. The app must never call these services
   per-user at runtime for bulk data, so usage does not scale with popularity.
7. MAKE IT A GATE, NOT AN INTENTION. Prose in a file loses to whoever is in a
   hurry — that is exactly how the drift above happened. Each networked adapter
   DECLARES the policy it operates under and the pacing it uses, and a CI check
   fails the build when the pacing is looser than the cited policy, when no
   policy is cited, when requests go out unidentified, or when a 429 is handled
   without honouring Retry-After. (Reference implementation:
   photo-pointer `ingest/adapters/http-etiquette.mjs` + `scripts/check-etiquette.mjs`.)

MEASURED, so this is not only manners: the gentler run returned a BETTER answer
than the aggressive one — 51 places found versus 32, and the single most
photographed site in the region went from missing entirely to first. Backing off
cost nothing.

### 7c. A PUSH IS NOT DONE UNTIL THE REMOTE REF MOVED. READ THE RECEIPT.

`git push` prints a RANGE when it transfers anything:

    c4e952c..d1b6d65  staging -> staging

**That range line is the receipt.** If the output has no range — only
`Everything up-to-date`, or just `branch 'x' set up to track` — then NOTHING
MOVED, whatever else it said and whatever exit code it returned.

The way this goes wrong is quiet. `git push -u origin staging` pushes the ref
NAMED `staging`, not whatever HEAD happens to be. Stay on `main` after a
promote, commit twice, push "staging", and both pushes succeed while the remote
sits exactly where it was — and the work is announced as shipped when it is
still only local.

Two rules, both cheap:
- **After any release step that changes branch, return to the working branch**,
  or never leave it: `git push origin staging:main` promotes without a checkout
  and cannot strand commits on the wrong branch.
- **Verify with `git ls-remote --heads origin` before telling Noah anything
  landed.** The push output is a claim; the remote is the fact. This is §5's
  "verify before reporting" applied to the one step that ends every session.

*(fauxplane, 2026-08-02. Two releases were reported to Noah as live on staging,
twice, with instructions to reload. Neither had left the machine. A stop-hook
noticed commits on the wrong branch; nothing in the session did.)*

### 15b. "I CAN'T REACH THE NETWORK" IS ALMOST ALWAYS FALSE. PROVE IT BEFORE SAYING IT.

Noah, 2026-08-02, in anger, about a pattern he has watched **every day**: a
session hits ONE failed request, concludes the internet is unreachable, and
hands him the work. It is nearly always wrong, and the reason it is wrong is
always the same — **the wrong thing was tried first, and nothing else was
tried at all.**

**A failed request is a fact about ONE HOST at ONE MOMENT. It is never a fact
about the network, and it is never a fact about the DATA you wanted.** Saying
"the proxy blocks it" without a probe is the §5b failure — a diagnosis with no
evidence — pointed at the environment instead of at Noah.

**READ THE FAILURE MODE. They mean completely different things:**
- `000` / connection refused / CONNECT rejected → the proxy denied THIS HOST.
  Every other host is still an open question.
- `403` / `404` / `200` → **THE HOST IS REACHABLE.** A 404 is a routing success.
  If you got a status code back, the network is not the problem — your URL is.
- DNS failure → that name, not the network.
- TLS error → see `/root/.ccr/README.md`. Never disable verification.

**THE PROBE ORDER, cheapest and most-likely-to-work first. Run it BEFORE
reporting any block:**
1. **Ask the proxy what it allows.** `curl -sS "$HTTPS_PROXY/__agentproxy/status"`
   prints the allowlist and the recent denials, with reasons. This is the single
   highest-value command and it is routinely skipped.
2. **Package registries are usually open** even when the general web is not —
   npm, PyPI, crates, the Go proxy are commonly on the allowlist by name. An
   enormous amount of public data is already packaged: reference datasets,
   coefficient tables, geodata, dictionaries, test fixtures.
3. **Try the other host serving the same bytes.** `raw.githubusercontent.com`
   versus `*.github.io`; a CDN (jsdelivr, unpkg) versus the origin; a mirror
   versus the canonical site. These are SEPARATE allowlist entries and one being
   denied says nothing about the others.
4. **Separate the DATA from the TERMS.** They live on different hosts and are
   different questions. A reachable dataset whose licence page is blocked is a
   §15.1 problem, not a connectivity one — and vice versa. Say which.
5. **Re-probe an INHERITED block.** A block recorded in NOTES.md is a
   measurement somebody else took, of one host, at one moment. Repeating it as
   current fact without re-testing is how a false blocker survives for weeks.

**WHAT YOU MAY SAY, and it must carry the evidence:** *"aviationweather.gov
answers 403 to CONNECT; raw.githubusercontent.com returns 200; npm is on the
allowlist"* — a mechanism, with status codes, per host. **What you may never
say: "I don't have network access", "the sandbox has no internet", or anything
that makes reaching the data Noah's job before you have run the list above.**

**Delegating a fetch is a last resort and it needs proof of impossibility**
(§6). "I assumed it was blocked" is not that proof. Neither is "a previous
session said so."

*Measured the day this was written: three datasets had been recorded as
unobtainable and handed to Noah as his problem. Two were reachable in under a
minute — one from npm, one from a different GitHub host — and were fetched,
verified against the publisher's own test values, and committed the same hour.
His task list went from three items to zero, and the verification found three
real bugs that would otherwise have shipped.*

## 7d. Every app shows the reader WHAT CHANGED

**A version string tells a reader that something changed. It never tells them
what.** §7b puts the version on screen because Noah reports from his device; the
same argument finishes here. He installs a build, uses it, and has no way to
know whether the thing he complained about last time is the thing he is looking
at now — so he asks, and the answer costs a round trip that the app could have
saved by simply saying.

**The rule.** An app that has shipped more than one release SHOWS ITS PATCH
NOTES, in the app, reachable from a place a reader already goes.

- **Reachable without hunting.** Beside the version, on the About or first-run
  surface, or behind the version stamp itself. Never a sixth tab. If a reader
  has to be told where the notes are, they are in the wrong place.
- **The current release at minimum, and a short history if there is room.**
  BOUNDED, per §-the-panel-rule: a list that grows by accumulation eventually
  becomes the app. Half a dozen entries is a history; forty is an archive, and
  an archive belongs in the repo.
- **Written for the reader, in their words, not the commit's.** §7's rule about
  changelogs applies with more force here, because this copy is on screen. "The
  radar no longer empties when you change range" — not "guard the nearby
  assignment on result.ok".
- **Say what is still broken.** An app that lists only its fixes is an
  advertisement. The open items a reader would otherwise rediscover — the thing
  that still does not work on their platform, the reading that is still coarse —
  belong beside the fixes. This is §-honesty applied to the release itself.
- **GENERATED FROM ONE SOURCE, never typed twice.** The same trap as §7b: notes
  maintained separately from the release drift from it, and the drift is
  invisible. Derive them from whatever the release process already writes —
  `NOTES.md`, the tag body, the commit subjects — or keep one data file that
  both the app and the repo read.

**What this is not.** It is not a modal that interrupts a reader who wanted an
instrument. Show it on request, or once per release at most, and never in front
of something they are trying to use.

*(Added 2026-08-03 at Noah's instruction, after five releases in one evening
that he could only tell apart by asking.)*

## 7e. Every app has ONE information surface, and this is what is behind it

**Noah should not have to ask for this app after app.** He has asked for the
same set of things in enough repos that the asking is itself the evidence: a
rule that has to be requested per-app is a rule that was missing from here. The
list below is the BASELINE. A session builds it because the app exists, not
because anyone said so, and "he did not ask for it" is not a reason it is absent.

**The surface is an (i) control in the app's own chrome** — a letter `i`, in the
header or equivalent, with an accessible name that says what it opens. Not a
tab, because tabs are for the app's actual content and every tab added is width
taken from the thing the reader came for. Not the footer, where it is a link
nobody has ever clicked. One control, obviously information, always in the same
place.

**What must be behind it.** Each of these has been asked for by name at least
once, in at least one app:

1. **What this app IS** — one short paragraph in plain words. What the reader
   gets, not what it was built with.
2. **What it is NOT** — the limits, stated as plainly as the capabilities. The
   disclaimer that keeps the app honest belongs where someone reads it, not only
   in a footer strip.
3. **How to install it** — the home-screen steps, with EVERY PLATFORM NAMED
   rather than detected. iOS fires no `beforeinstallprompt`, so a sniffed
   "Install" button is a button that does not exist for half the readers, and
   naming both menus cannot go stale the way a capability check can.
4. **What changed** — the patch notes required by §7d live here. This is the
   "somewhere they already go" that rule asks for.
5. **Where the numbers come from** — every feed and dataset, with its terms or
   attribution. §15's obligations are discharged on a surface, not in a comment.
6. **How to report a problem** — the diagnostics text (§7f), reachable here as
   well as wherever else it lives.
7. **The accessibility statement**, and the licence.

**What it must NOT do.**

- **Never interrupt.** It opens on request. It is not a launch modal, and it
  does not appear over something a reader is using.
- **Never cost the app height.** Adding one control to a header can wrap a
  toolbar onto a second row and take that space out of the content — measured,
  not theorised: one 44px button cost 51px of header and pushed a panel over its
  own footer. Measure the chrome before and after.
- **MOVE content into it, never COPY.** The first-run text, the release notes
  and the credits each exist once. Two copies of the same prose drift, and the
  one nobody is looking at is the one that goes stale.
- **Never become the app.** Bounded, like §7d's history.

**First-run orientation is part of this and is not optional.** A reader opening
an app for the first time is shown what it is, what it will not do, and how to
install it — and that text SURVIVES whatever they press to get started. It then
lives permanently behind the (i), because the one thing more annoying than an
explanation you did not want is an explanation you cannot find again. The gate a
new reader dismisses must never be the thing that destroys the instructions.

**Make it a gate.** Each app's existing accessibility or build gate asserts that
the control is present, that its accessible name says what it opens, and that
the first-run content survives dismissal. Prose in this file did not stop any of
the omissions that produced this section.

**The rule behind the rule: if Noah says the same thing in two apps, it belongs
in this document, and the session that hears it the second time writes it in.**
Not the session that finishes the feature — the one that hears the repeat. He
has better things to do than be the memory these repos lack.

*(Added 2026-08-03 at Noah's instruction: "I also consistently expect a
first-time run and patch notes and many other things that I'm very, very tired
of having to say over and over again.")*

## 7f. Ask for the DIAGNOSTIC, never for a screenshot

**A photograph of a screen loses every reason string and cannot show internal
state at all.** Noah reports from a phone or an iPad. A screenshot shows what a
gauge reads and nothing about why — not the filter's internals, not the failure
reasons behind a crossed-out value, not what the app tried and could not do.

**So every app that has any internal state worth asking about produces a text
report**: the whole state, as selectable text, with copy / share / save, behind
a control the reader can find (the version stamp is a good home; the (i) menu
lists it too). It leads with the diagnosis — root causes separated from what
they knocked over — and it says what is missing and why, not merely that it is
missing.

**Then ASK FOR THAT, not for a picture.** A session that asks Noah to photograph
his screen is asking him to do worse work on its behalf.

**Privacy is part of it:** anything precise enough to locate him is coarsened by
default, with an explicit opt-in to include it.

*(Stated here 2026-08-03. It was already built in fauxplane and already written
in that repo's CLAUDE.md; being in one app's file is why it had to be asked for
again elsewhere.)*

## 16. Security and the supply chain

These apps are small, free and personal, which changes the threat model but does
not empty it. Nobody is targeting Noah. The realistic path runs the other way: a
compromised package, pulled in for a render script nobody thinks about, executing
on a runner that is holding a live Cloudflare token — and soon, on machines
running a PWA that holds an encrypted personal journal. Supply-chain compromise
is indiscriminate; it does not need to have heard of you.

THE POSTURE, and the exposure that produced it (hub audit, 2026-07-28). Nothing
here is hypothetical — every rule below names something that was true of this
repo when it was written:

1. PIN WHAT EXECUTES. Anything that runs code gets a version that cannot change
   under us: a committed lockfile, `npm ci` and never `npm install` in
   automation, and GitHub Actions referenced BY COMMIT SHA, not by tag. A tag is
   a mutable pointer someone else controls — `cloudflare/wrangler-action@v3`
   floats, and it executes while holding a Pages:Edit token.
2. NEVER PUT AN UNPINNED FETCH NEXT TO A SECRET. `npx wrangler secret put`
   resolves whatever npm serves at that moment and is then handed a live API key
   on stdin. That is the sharpest exposure this repo has had: an unreviewed
   package, fetched at run time, given production credentials.
3. DECLARE EVERY DEPENDENCY, even for a one-file script. Eight `.mjs` scripts
   imported `playwright-core` and two read `node_modules/axe-core/axe.min.js`
   from a hardcoded path, with no `package.json` and no lockfile anywhere. That
   is not "no dependencies", it is undeclared ones: nothing is reproducible,
   nothing is auditable, and Dependabot has nothing to read. An accessibility
   result that depends on whichever axe-core happens to be on disk is not a
   result.
4. A SECRET REACHES EXACTLY THE STEP THAT NEEDS IT. Pass it as `env:` on that
   step. Do not route it through `$GITHUB_OUTPUT`, where every later step in the
   job can read it — including whatever action gets added next year. Masking
   scrubs the log; it does not narrow the blast radius. Prefer the narrowest
   scope the provider offers: the two-token split here (Pages-only for Pages,
   Workers-only for Workers) is the pattern, not the exception.
5. FRICTION IN PROPORTION TO DAMAGE. An irreversible or outward-facing action —
   sending real faxes, deploying production, pushing runtime secrets — must cost
   more than one click. `live` sitting one dropdown position from `test`, with no
   confirmation and no required reviewer, is a UI inviting an expensive
   mis-click. Use a protected `environment:`, or a typed confirmation, or both.
6. EVERY DEPLOYED SITE SHIPS SECURITY HEADERS. At minimum
   `X-Content-Type-Options: nosniff`, `Referrer-Policy`, framing protection and a
   restrictive `Permissions-Policy`. These cost one file and break nothing. A
   Content-Security-Policy is worth more and costs more: it is a REFACTOR, not a
   header, anywhere the page carries inline script — so state honestly whether a
   site has one rather than implying it.
7. NEVER BUILD HTML BY CONCATENATION WHERE `textContent` WILL DO. Interpolating
   into `innerHTML` is safe only while every input is a literal you wrote, and
   that condition expires quietly — the first `&` or `<` in a label mis-renders,
   and the first value that comes from anywhere else is an injection. Build nodes
   and set text; reserve `innerHTML` for inert markup you authored.
8. MAKE IT A GATE, NOT AN INTENTION (§15.7, and it generalises). A rule that
   lives only in prose is a rule that loses to whoever is in a hurry. Lockfiles
   are checked by `npm ci` failing. Pinning is checked by a CI step that rejects
   an unpinned `uses:`. Headers are checked by fetching the deployed page. §4 is
   the standing proof of what happens otherwise: a documented gate that never
   existed, believed for months because nobody ran it.

WHAT IS ALREADY RIGHT HERE, so it does not get "cleaned up" by a later session:
the Cloudflare credential step strips whitespace and masks before use, with a
comment naming the exact failure it prevents (a trailing newline corrupting the
Authorization header, Cloudflare 6111); and the fax deploy runs two separate
tokens on purpose, keeping the long-standing hub token Pages-only while the
Worker deploys under its own Workers-scoped token (Noah, 2026-07-25). Both are
above common professional practice. Neither is an accident.
