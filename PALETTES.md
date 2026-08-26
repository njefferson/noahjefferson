# PALETTES.md — how any of the owner's apps gets reskinned

Canonical here in the hub, like [`DOCTRINE.md`](DOCTRINE.md) and
[`LESSONS.md`](LESSONS.md). **Never fork this into another repo — link to it.**
Doctrine §4 says contrast is computed and hue-only encoding is a fail state.
This file is the *how*: the roles, the floors, the method, four palette families
that already clear every floor, and the traps that produce confident wrong
answers along the way.

**Branding is placeholder.** Owner ruling, 2026-07-30: Nothing in any app's colours is protected. Accessibility
designs the palette; taste chooses among the options that already pass.

**The gate:** [`palette-check.mjs`](palette-check.mjs) — exits non-zero on any
hard-floor failure, because a checker that prints FAIL and exits 0 is a reporter.

```
node palette-check.mjs palettes/families.json # the four families
node palette-check.mjs palettes/<yourapp>.json # your reskin
```

---

## 1. Roles, not token names

Every app names its colours differently. The gate and this document speak in
**roles**, so one instrument serves all of them. Map your tokens onto these:

**`page`** — the backdrop everything sits on.
Studio calls it `--bg`; the hub calls it `--bg`.

**`pageAlt`** — the gradient's other stop, if any.
Studio `--bg-2`; hub `--bg2`.

**`surfaces[]`** — the fill ladder: **rest, raised, pressed**.
Studio `--surface`, `--surface-2`, `--surface-3`; hub `--surface`, `--surface-hi`.

**`rail`** — the **load-bearing** control edge, the one that carries boundaries.
Studio `--line-2`; hub `--line`.

**`hairline`** — a decorative separator, never the sole affordance.
Studio `--line`; the hub has none.

**`text[]`** — the voice scale: **primary, secondary, tertiary**.
Studio `--txt`, `--txt-2`, `--txt-3`; hub `--text`, `--muted`.

**`accents{}`** — anything used as coloured **text**, ring or band.
Studio `--accent`; the hub has five categoricals.

**`onAccent`** — text sitting **on** the accent as a fill: the label on a
primary button. MoleBridge `--on-accent`.

Three roles get confused constantly and must not be:

- **`rail` vs `hairline`.** A rail says *this is where the control ends* and is
 held to 3:1 (WCAG 1.4.11). A hairline is decoration between rows and is
 deliberately allowed under it. If a boundary is the only thing telling a card
 from the page, it is a rail no matter what it is called.
- **`accents` are text.** Every accent gets checked at the **text** floor, not
 the ring floor, because these apps use accents for "Open →", link labels and
 counts. An accent that only ever painted a 4px band would be a ring; none of
 ours is.
- **`onAccent` is not one of the `text[]` tokens, and borrowing one is the
 mistake it exists to prevent.** In a light theme with a warm page, the primary
 text token is a warm near-black — and warm near-black lettering on a dark green
 button is a pairing nobody chose, it just falls out of using a token for a job
 it was not for. **It was also unmeasured by anything for months**: MoleBridge
 declared `--on-accent`, painted every primary button with it, and this gate had
 no field for it, so the only thing checking the loudest pairing in the app was
 a per-palette browser run. Declare it. An app that renders it without declaring
 it is caught by its own rendered-pairing list instead, which is the slower way
 to find out.

---

## 2. The floors and the aspirations

**HARD FLOORS — any violation is a failure, the same as a crash.**

**Text on every fill it can land on — ≥ 4.6:1.**
AA is 4.5. A value specced *at* the line drifts under it the first time any
neighbouring token moves.

**Rail on every fill it edges — ≥ 3.4:1.**
1.4.11 is 3.0, but a 1px edge **renders ~0.15 below its arithmetic** because of
antialiasing. Measured, not assumed.

**Accent as focus ring — ≥ 3:1**, on every surface a ring can circle.

**Text hierarchy — strictly ordered on every fill.**
Primary louder than secondary louder than tertiary, everywhere — not just on
the one surface someone checked.

**Adjacent text tokens — ΔE ≥ 2.3.**
Below one JND they are one token wearing two names. Shipped once at ΔE 1.65.

**Fill ladder (*elevation*) — monotonic away from the page.**
Rest, then raised, then pressed, each further than the last, or "higher" stops
meaning anything.

**Surface *states* (hover etc.) — ΔE ≥ 2.3 between states.**
A state ladder carries no elevation order: a light-theme hover legitimately
darkens toward the page. It owes only being seen. See §7.

**Text on an accent-tinted fill — ≥ 4.6:1.**
If the app tints a fill with its accent (active chips), that composite is a
real background. Regressed once.

**ASPIRATIONS — score these, never trade a floor for one.**

- Primary and secondary text **≥ 7:1** (AAA) on their common surfaces; tertiary **≥ 5:1**.
- Page→first-surface fill separation **≥ 1.5:1**, so a card reads as a plane by
 its **fill**, with the rail as reinforcement rather than the only cue.
- Editor chrome near-neutral: **Oklch C < 0.02**. See §4.
- Peak body-text contrast **capped ~13–15:1** — halation. See §4.
- Categorical accents distinguishable under protan/deutan/tritan simulation.
 Under ΔE 10 is a demerit, not a failure — colour is never the sole carrier
 here — but it must be *known*, so those two never encode meaning by hue.

---

## 3. The knobs are coupled — solve them together or not at all

This is the single most expensive thing this family has learned about colour.
**You cannot tune one role in isolation.** Every attempt to fix one breaks another:

- Spreading the **surfaces** away from the page pushes the *pressed* surface
 toward the **text** sitting on it — so every naive attempt to buy fill
 separation broke text-on-pressed contrast.
- Lifting **surfaces** in a dark theme weakens a light **rail** riding on them,
 because the rail's contrast is against the surface it edges.
- Strengthening the **rail** does nothing for the **fill** separation, and vice
 versa — but they trade against the same lightness budget.

Solve `surfaces × text × rail` **as one system against the whole matrix**, and
re-run the gate after every move. A fix verified in one place is a regression
somewhere nobody looked.

**Near-black and near-white have no headroom.** Below about `#0b0c0f`, darkening
the page buys almost nothing: 55% darker moved page→card separation 1.09 → 1.13,
because the `+0.05` term in the contrast formula dominates down there. Dark-theme
fill separation must come from **lifting the surfaces**. Light themes are the
mirror image near white — a pure-white card cannot be lifted, so the **page**
must deepen. Work out which direction has room *before* committing to an
approach; the cheap one is often the unavailable one.

**An optimiser will destroy the brand to win the metric.** Told to maximise
separation on the hub, a search returned a palette with the magenta accent washed
from `#E0619E` to `#F8DAE8` — a pale pink — because it bought 2.89:1. Constrain
the search by what must not change, and look at the winner before believing it.

---

## 4. Why the chrome is mid-dark neutral, not near-black

Lightroom, Capture One and Photoshop converge near **L\* 25–30 neutral grey** for
panels rather than near-black, for measured reasons:

- **Simultaneous contrast** — a near-black surround makes midtones look lighter,
 so people under-lift shadows and over-darken their output.
- **Bartleson–Breneman** — perceived image contrast drops in a dark surround, so
 people add contrast that exports too hot.
- **Chromatic adaptation** — any surround *tint* pulls the eye's white point,
 biasing white-balance judgment toward the tint's complement. ISO 3664/12646
 specify a neutral grey surround for exactly this.

This binds hardest on the infrared editor: false-colour frames carry **no memory
colours** — no skin, foliage or sky to anchor the eye — so surround-induced bias
goes completely unchecked. **The chrome tint IS the reference.** Hence the
Oklch C < 0.02 aspiration for anything surrounding a photo, and hence every
family in §5 lifting the page off near-black.

**Halation and glare.** Astigmatic readers see bright text on a very dark field
bloom. Avoid a `#000` page under near-`#fff` text; soften the *text* rather than
darkening the page, and cap peak body contrast around 13–15:1. In light themes —
The owner works outdoors on an iPad — avoid a full-field `#FFFFFF`: keep the page
below about L\* 92 and let the text carry the contrast.

---

## 5. Four families that already pass

Derived by a design council on 2026-07-30 (four independent proposals, adversarial
verification, three judging lenses), then re-verified on one shared instrument.
**All four clear every hard floor in both modes.** Exact values, including the
tile variants for hub-shaped link pages, are in
[`palettes/families.json`](palettes/families.json).

**Instrument** *(the default)* — exact-neutral night, warm day.
Night `page` → `surface`: `#1a1a1a` → `#3a3a3a`.
Day `page` → `surface`: `#c4bcab` → `#eee6d6`.
Chrome chroma 0.0000 night / 0.025 day.

**Paper** — cool night, warm paper day.
Night `#141519` → `#35373c`. Day `#c8c1b0` → `#f2eee3`.
Chrome chroma 0.009 / 0.025.

**Mono** — neutral in *both* modes.
Night `#131313` → `#363636`. Day `#c5c5c5` → `#efefef`.
Chrome chroma 0.0000 / 0.0000.

**Soft** — lowest glare, capped contrast.
Night `#15161a` → `#36373c`. Day `#bfbab0` → `#e8e4da`.
Chrome chroma 0.010 / 0.015.

**Instrument is the recommended default** — it is the only family whose *worst*
text pairing is ≥ 4.87 across all four palettes, with primary text AAA on every
fill, tertiary ≥ 5:1 everywhere, and a mathematically exact-neutral night chrome.

Known soft spots, all above the fail line, recorded so nobody rediscovers them:
Mono's tiles-day cannot separate magenta from cyan under protan (ΔE 7.5); Soft's
tiles-day fill separation is 1.17.

---

## 6. Offer them as themes, on two independent axes

Owner ruling, 2026-07-30: if several palettes all pass, **ship them as options**
rather than picking one. This also dissolves arguments that have no right answer
(warm versus neutral) — both ship.

**Palette and mode are independent axes.** Keep the existing day/night toggle
exactly as it is and add a second attribute beside it:

```
<html data-theme="dawn" data-palette="instrument">
```

- Both read before first paint by the same inline one-liner, so there is no
 flash of the wrong palette. Have that script set the `theme-color` meta too —
 a static one leaves the status bar wrong in the mode it was not written for.
- CSS is only value blocks: `[data-palette="paper"]` and
 `[data-palette="paper"][data-theme="dawn"]`. **No new token names**, so a
 reskin stays a drop-in value swap.
- The picker labels each option by **name**. A swatch alone is colour as the
 sole carrier — the exact thing Doctrine §4 forbids.
- **Preferences do not cross origins.** An app cannot read a palette chosen on
 the hub, or vice versa. Either each app carries its own picker, or the
 sibling gets the default family and no picker. Do not promise sync.

**Before adding families, consolidate.** If a palette is currently declared in
*N* places, adding *F* families makes it `N × F × 2` blocks that must never
drift — and this family has already been bitten repeatedly by
must-change-together token definitions. Collapse the declarations to **one**
source first. That step is what makes a theme menu maintainable rather than a
drift factory.

---

## 7. Measurement traps

Every one of these produced a confident wrong answer before it was caught. When
a result looks absurd, **suspect the instrument first** (Doctrine §14).

- **Computed style reports a gradient page as transparent.** `background:` with
 only a gradient leaves `background-color` unset, so walking up the tree for an
 opaque ancestor falls through to its fallback — and reported a *light* page at
 1.11:1 against black. Read real pixels off a screenshot.
- **A gradient backdrop changes with position.** Compare a rail against the pixel
 immediately adjacent to it, not a convenient patch elsewhere on the page.
- **Sample a rail on a straight edge.** Scanning across the end of a `999px`
 pill crosses pure curve, where every pixel is antialiased; it under-read by
 ~0.5 and accused a correctly calibrated token of failing.
- **`getComputedStyle` returns the *authored* border-radius** (`999px`, `50%`),
 not the used one. A corner guard built on it silently skipped every pill and
 circle — precisely the controls under investigation.
- **One sample column through a dashed rail lands in a gap** and reports ~1.1:1.
 Scan across and take the strongest reading; the dash *is* the rail.
- **`:focus-visible` never matches a scripted `.focus`** in Chromium. A
 perfectly good focus ring reports as `outline: 0px none` until the harness
 presses a real Tab.
- **String-comparing colours fails silently.** An authored `.35` serialises as
 `0.35`; matching by string found *nothing* and the audit cheerfully reported a
 clean sweep of zero elements. Compare numerically.
- **A rule can be right and still be over-applied.** The "ladder monotonic away
 from the page" rule is correct for an *elevation* ladder (rest → raised →
 pressed) and wrong for a *state* ladder: a light-theme hover legitimately
 darkens **toward** the page. Applied blindly it failed a correct hub hover —
 and, worse, it tempted a fix by relabelling which surface was "rest" so the
 numbers would line up. When a gate flags something that looks right, check
 whether the rule actually governs that case before editing the data to please
 it. A state ladder owes only one thing: being **seen** (ΔE ≥ 2.3 between
 states — a hover nobody can perceive is not a hover).
- **Measure the effective hit area, not the box** — and know that a hit-expanding
 overlay is the *wrong* tool in a dense bar: at ±21px the ring lands on
 neighbouring controls, which win `elementFromPoint`, so the target never grows
 and would steal their taps if it did.

---

## 7b. Swapping a colour set wholesale, with no browser run

The question this answers: *given a set that already clears every floor here,
can it replace the current one without re-running the app's accessibility gate
against it?*

**Yes — once two things are true, and neither is true by default.**

**One: the app paints only role tokens.** Every colour that reaches a screen has
to resolve from the palette. This is the half that feels obviously true and is
not; grep cannot establish it, because a literal can arrive from a browser
default, an inherited value or a script writing `.style` directly. The way to
establish it is to reverse-map every rendered colour back to the token it came
from and fail on anything that maps to nothing. MoleBridge's a11y gate does this,
and on its first honest run it found every secondary button in the app painted
by Chromium's own default button styling — cold grey, unmoved by the theme,
passing every gate because UA colours are legible and nothing was looking.

**Two: the pairings the app actually makes are recorded from a real run.** This
gate measures the full cross product of roles, which is what makes a palette
*portable*. An app paints a fraction of it — nineteen pairings, in MoleBridge's
case. The two facts are different and both are worth having, so a spec may carry
`_renders`: a list of pairings, in `--text-2 on --accent-soft over --surface-1`
form. A floor missed on a recorded pairing is a **failure**; one missed off the
list is reported as a **forecast** — true about the palette, about a screen
nobody has built.

**The fill is part of the key.** A tint over the page and the same tint over the
top surface are different colours with different contrast. Dropping the fill
from the key turned three real near-misses into three reported defects.

**Never type the list.** It comes out of a run, and the gate that produced it
fails when the recorded list and the observed one differ — in both directions. A
stale list is not a smaller gate, it is a gate pointed at the wrong screens.

**And the list is only authoritative from a full sweep.** Two roles can share a
value in one palette and mask a pairing — a print palette collapsing everything
to black on white does exactly that. Sweep one palette for the fast loop, all of
them in CI.

With both in place the arithmetic changes: the app's browser gate runs one
palette instead of every one, and a new colour set is cleared by this gate alone.
MoleBridge went from 16,586 measurements to 5,526 for its default run, and gave
up nothing — because the two thirds it dropped were re-measuring what `npm run
palette` already proves.

---

## 8. Reskinning your app — the recipe

1. **Read this file and Doctrine §4.** Branding is placeholder; floors are not.
2. **Map your tokens onto the §1 roles.** Write them into
 `palettes/<yourapp>.json` in the shape `palette-check.mjs` documents.
3. **Run the gate on what you have today.** It will usually find something. Fix
 the floors before designing anything new.
4. **Pick a family from §5** (or derive your own — then §3 is mandatory reading,
 and solve the roles as one system).
5. **Consolidate your token declarations to one source** before adding families.
6. **Re-run the gate**, plus your own a11y harness in every palette × mode
 combination. Cheap headless; do not hand-check the matrix.
7. **Record what you chose and what it cost** in your `NOTES.md`, and append
 anything the family should not relearn to [`LESSONS.md`](LESSONS.md).
8. **The owner's on-device pass** covers the default; the gate covers the rest.

Adding a palette, a role or a threshold? Change it **here**, and tell the sibling
repos to re-point. Never fork.

---

## 9. Starting this work in another app — the session prompt

Paste this into a new session, replacing `<APP>` and `<app-repo>`. It front-loads
the things that otherwise get discovered late and expensively.

```
Work on <APP>: bring its colour and accessibility up to the family standard.

SESSION SETUP — do this in the source picker, it cannot be fixed later:
select BOTH njefferson/<app-repo> AND njefferson/noahjefferson. The hub carries
the canonical rules, the four verified palette families and the gate. Without it
in the session you will re-derive all of it, worse.

READ FIRST, IN THIS ORDER. Do not skip to code:
 1. <app-repo>/NOTES.md — the repo's source of truth, every session
 2. <app-repo>/CLAUDE.md — its release flow; the gate differs per repo
 3. hub DOCTRINE.md §4 — accessibility is a hard gate
 4. hub PALETTES.md — all of it: §1 roles, §2 floors, §3 coupling,
 §7 measurement traps, §8 recipe
 5. hub LESSONS.md — what has already gone wrong elsewhere

THE WORK, IN THIS ORDER. The order is load-bearing:
 1. Map this app's colour tokens onto the §1 ROLES (page, surfaces, rail,
 hairline, text scale, accents). Write palettes/<app>.json in the shape
 palette-check.mjs documents.
 2. Run `node palette-check.mjs palettes/<app>.json` against what ships TODAY,
 before designing anything, and report what it finds. It found real
 failures on the hub — a page that had already been audited twice.
 3. Fix the floors it reports. Nothing else until those pass.
 4. Count how many places colour tokens are declared. If more than one,
 CONSOLIDATE TO ONE FIRST. N sites x families x modes is the drift factory
 this family has been bitten by repeatedly; consolidating afterwards is
 much harder.
 5. Only then adopt a family from palettes/families.json (Instrument is the
 default) — or offer several behind a picker if the app has a settings
 surface. Do not invent values. If you must, §3 is mandatory reading and
 the roles get solved as ONE system, not one knob at a time.
 6. Broad a11y sweep: axe-core PLUS the checks axe cannot make — touch targets
 with the inline-in-a-sentence exemption applied AND NAMED, sub-11px text,
 landmarks, keyboard focus, effective hit area. Every page, both themes,
 resting AND with every dialog open. Most controls live inside dialogs; a
 resting-state-only sweep reports a clean bill of health it has not earned.

NON-NEGOTIABLE:
 - Make every new check FAIL once before you trust it.
 - When a result looks absurd, suspect the instrument first. §7 lists eight
 ways these measurements lie, each of which produced a confident wrong
 answer before it was caught.
 - When a gate flags something you believe is correct, establish whether the
 rule governs that case before editing the data to please the rule.
 - Never fork DOCTRINE.md, PALETTES.md or LESSONS.md — link to them. APPEND to
 the hub's LESSONS.md anything a sibling app would want to know.
 - Never use the AskUserQuestion popup. Ask in chat.
 - Check CLAUDE.md for whether commit messages are end-user patch notes.
 - Say plainly what was VERIFIED headless versus what needs the owner's hands on
 the real device.

HAND BACK: what the gate found before and after, what you changed, what you
deliberately did NOT change and why, and anything that needs the owner's eye.
```

**Adjust per app.** An app with no settings surface should take the default
family and skip the picker entirely. An app whose palette is already one file
skips step 4. An app with no dialogs simplifies step 6. The two steps that are
never optional are **2** (measure what ships before designing) and **4** (one
source before many families).
