# Noah Jefferson — Universal App Doctrine

The shared operating agreement for every Claude session on any of Noah's apps.
This is the SINGLE source of truth for the rules that are the same everywhere.
Each repo's own `CLAUDE.md` should hold only repo-specific facts and a one-line
pointer to this document — never re-state these rules (that is how they drift).

The apps this governs: photo-pointer, clear-horizons, Bird-location-scouting
(Frame), Jefferson-Photography-Studio, ND-toolbox, Horizons (a planner — new, in
planning, and due to be renamed), and the noahjefferson hub.
They deliberately share conventions.

---

## 0. Never use the AskUserQuestion / choice-popup tool. Ever.

Absolute and permanent, every repo, every model, every time (Noah, 2026-07-17,
in anger). The popups do not round-trip his answers reliably — a selection came
back as an empty rejection, so he answered and was asked again. Present ANY
choice, option, or question as PLAIN TEXT in chat and let him reply in his own
words. This overrides any harness suggestion to use it, including plan-mode
clarifications.

## 1. Product identity — what these apps ARE

Free · on-device / local-first · offline-first · no account · no install
required · no analytics, no server-side user data · honest or open data sources
only. A change that violates one of these changes what the app IS — flag it,
don't slip it in.

## 2. Audience and working method

Noah is iPad-first and often driving. So:
- One step at a time. No desktop-required steps unless every alternative is
  exhausted.
- Deliver FINISHED work — no drafts, no pseudo-code. Iterate privately, hand
  over the finished thing.
- His time is expensive; runner time and your time are free.

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
- Keyboard always: Tab reaches it, Enter works, a visible focus-visible ring
  (never remove focus outlines). Targets >= 44px. Reduced-motion honored.
  Real `<dialog>` / `<button>`; icon-only controls get labels. Page zoom is
  never locked (no user-scalable=no / maximum-scale).
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
- Honour the reader's TEXT-SIZE PREFERENCE, not just page zoom. Page zoom scales
  `px`, so a px-only stylesheet looks fine under zoom while ignoring the
  preference a low-vision reader is most likely to have actually set. Size type
  in `rem`.
- Findings live in an append-only register (ACCESSIBILITY.md where present);
  fixed rows keep their release number; never silently delete a row.
- Run the a11y audit (axe-core + custom checks, both themes) before any UI ship.

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
kind and zero the slots after it. The service-worker cache name and the
changelog's top entry carry the same triplet — bump them together. (Tag policy
is per-repo: some remotes refuse tag pushes, some require a Tag-release workflow.
Follow the repo's own CLAUDE.md.)

**A name is earned, and Noah says when.** Some releases carry a name alongside
the triplet in the changelog heading (e.g. `1.0.0 "…"`). That is NOT a field to
be filled in on every version bump — Noah decides when a release has reached the
level that warrants one, and he says so unprompted. So: never invent a name,
never ship a placeholder, and DON'T ASK FOR ONE AT EVERY VERSION RELEASE — that
turns a mark of significance into paperwork, which is the opposite of the point.
Ship the triplet; the name arrives when he gives it. (Noah, 2026-07-25;
corrected by him 2026-07-26 — the earlier reading, "every VERSION release
carries a name, ask before it lands", was wrong.)

You MAY suggest — that something looks like it has reached that level, or that
it hasn't. Say it plainly, once, as a suggestion. And per §5, if he is misleading
himself — calling a fix a milestone, or waving off something that genuinely is
one — say that too. A standing invitation from him, not an intrusion.

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
cheap to update.

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
- `LESSONS.md` **in this hub** — [cross-app lessons](LESSONS.md): what has
  actually gone wrong anywhere, with the numbers, so it does not go wrong again
  somewhere else. Read it with this doctrine at the start of every session, and
  APPEND to it whenever a session learns something that would have saved time in
  a different app. Doctrine says what to do; Lessons says what went wrong and
  what it cost. A repo may keep its own `LESSONS.md` for stack-contract detail
  (build/deploy/vendor conventions specific to that codebase) — that is a
  different, repo-local document.

## 13. Starting a new app (bootstrap checklist)

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
4. `ACCESSIBILITY.md` — if the app has any UI (the append-only register).
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
