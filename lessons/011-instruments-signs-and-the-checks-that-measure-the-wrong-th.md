## 11 · Instruments, signs, and the checks that measure the wrong thing

**Enforced by:** CHECKLIST two-derivations — derive any geometry or sign-sensitive result a second, independent way and compare before believing either.

**Two independent derivations of the same geometry catch sign errors that
neither catches alone — and both looked completely plausible on screen.**
fauxplane computes aircraft pitch and roll two ways: from the orientation
event's Euler angles through a rotation matrix, and from the accelerometer's
gravity vector. The gravity route had its roll sign inverted, so it returned
**+30 degrees for a 30-degree LEFT bank**. Nothing about that is visible in
isolation: the horizon tilts smoothly, tracks the device, and returns to level.
The test that found it derives the gravity vector *from* the matrix and asserts
the two routes agree across a grid of attitudes — a thing neither implementation
could fake. Two riders, both earned the hard way in the same hour: the first
version of that test took the third **column** of the rotation matrix where the
maths needs the third **row**, and confidently accused correct code of
disagreeing with itself (suspect the instrument first); and self-consistency
between two derivations is *not* the same as being right, so a second test now
pins the aviation convention itself — right wing down is a positive roll — or a
future refactor that mirrors both routes together would still pass.
*(fauxplane, 2026-08-02.)*

**The same session, the same shape, in a different subsystem.** The World
Magnetic Model's north component was 180 degrees out, because X is the
*northward* component while the spherical-coordinate unit vector points *south*.
Y and Z were both right, which put the horizontal field exactly reversed. A pure
axial dipole reported a declination of 180 at every point on earth — a number
that is finite, stable, and varies sensibly with position. **Anywhere a sign
convention crosses a coordinate-frame boundary, find an invariant that does not
depend on the implementation** (a pure axial dipole has zero declination
everywhere; a dipole tilted into the 90E plane has zero declination on that
meridian) rather than checking the output against a remembered real-world value,
which is how a half-remembered constant becomes the thing under test.

**DIMMING A UI WITH A BRIGHTNESS FILTER DESTROYS EVERY CONTRAST PAIR YOU
MEASURED.** This is arithmetic, not opinion: the WCAG formula's `+0.05` term
means scaling foreground and background *together* reduces the ratio. Measured
on fauxplane's palette, a `filter: brightness(0.45)` — the obvious way to dim a
cockpit display at night — takes primary text from **14.5:1 to about 3.7:1**. A
fail state, produced by the one control whose entire purpose is legibility, and
completely invisible to a contrast gate that reads authored token values. The
fix is to make each dim level a **measured palette block** (PALETTES §6 already
has the mechanism: value blocks, no new token names) and run the whole
accessibility sweep in each. Any app that dims, tints, fades or "de-emphasises"
a whole surface is on this hook, not only cockpit panels.
*(fauxplane, 2026-08-02.)*

**A real Content-Security-Policy will block your own test harness, and that is
the policy working.** The accessibility gate injected axe-core with
Playwright's `addScriptTag({path})`, which inlines the file — and `script-src
'self'` correctly refused it. The available wrong answer is to relax the policy
for the gate, which means testing a policy the deploy does not have. The right
one costs four lines: serve the tool from the harness's own static server so it
is same-origin. Worth knowing before writing the CSP, because the first symptom
looks like the harness being broken. The related win: a CSP is only possible at
all because the app was written with **no inline script and no inline style from
the first commit** — Doctrine §16.6 is right that it is a refactor, not a
header, and the refactor is nearly free if it happens on day one and expensive
ever after.
*(fauxplane, 2026-08-02.)*

**"No console errors" and "this optional file is deliberately absent" are in
direct conflict, and the fix is a committed manifest.** Three data bundles were
knowingly not shipped, each for a good reason. Fetching them produced a 404 on
every boot — which is a console error whatever the intent, and an HTTP status
cannot tell a user the difference between "not generated yet" and "deliberately
not approximated". Putting the reasons in a committed `data/manifest.json` that
the loaders consult *first* cleaned the console and, more usefully, gave the
capability page a sentence somebody wrote on purpose. Anywhere an app probes for
optional content, the probe result is worse documentation than a written answer.
A second turn of the same screw: those written reasons then appeared verbatim on
an instrument face and turned one altitude readout into eight lines of prose, so
each entry now carries a **short reason** for a gauge and a **long detail** for
the page with room for it.
*(fauxplane, 2026-08-02.)*

**A "mark this stale now" flag that the ageing machine re-derives away.**
A store recomputed each field's LIVE/STALE/FAIL from its timestamp on every
publish — a good design, and the reason "kill the network and watch the feeds
decay" needed no per-instrument code. But `markStale`, called on
`visibilitychange` because iOS stops delivering sensor events when backgrounded,
set the flag and was overwritten **40 ms later** by the next publish, which saw
a reading still inside its freshness window and called it LIVE again. The
instruction survived exactly one frame. **Wherever a derived property is
recomputed on a loop, an imperative override needs somewhere sticky to live** —
here a flag on the field that only a genuinely new reading clears. Found by a
test asserting the state 200 ms after the call rather than immediately, which is
the only version of that test that could have failed.
*(fauxplane, 2026-08-02.)*

**§7g again, immediately, on a brand-new check — this is not a rare failure.**
A gate asserted that the built-in-test page "reads the live store" by checking
that *something* on it reported FAIL. Planting the fault — disabling the live
merge entirely — left the gate **green**, because unrelated feed rows were
already FAIL in that build and satisfied the count on their own. Exactly the
roof-plane shape: a total that a pre-existing thing was already satisfying.
Rewritten to name the four specific entries whose status only the merge can
know, it caught the plant immediately. The point worth carrying is that this was
written *by someone who had just read §7g and was actively trying to avoid it*,
in the same session, and it still happened — so **planting is not a discipline
you can replace with care.** Its companion: when the plant script reported "red,
but for a different reason", the check was right and the script's expected
pattern was stale. A planting harness that only asserts non-zero exit will
happily bless a check that fires for the wrong cause; assert the *message*.
*(fauxplane, 2026-08-02 — 10 planted faults, 10 caught, after two rounds.)*

**A plant is anchored to a line of source, so ordinary refactoring disarms it —
and the better-guarded the code, the faster its own guards rot.** A plant
proving "the gyro zero-offset keeps being learned" replaced
`const ki = cfg.biasKi * (gain / (1 - cfg.alpha));` with `const ki = 0;`. Later
work in the same session added an anti-windup gate and rewrote that line to
`const ki = explainable ? … : 0;`. The plant's find-string no longer matched
anything. Nothing about the app was worse; the *evidence* was gone, and the
suite would have gone on reporting a number that no longer included it.

Two things follow, and the second is the transferable one:
- **An injection that cannot find its anchor must be a LOUD FAILURE, never a
 skip.** fauxplane's harness reports `UNPROVEN … this script has gone stale`
 and drops the run to 16/17. A harness that quietly skips an unmatchable plant
 reports 16/16 and reads as a clean sweep — the worst possible output, because
 it is indistinguishable from success.
- **Plant decay is concentrated exactly where the code is most active.** The
 plants that go stale are the ones guarding code someone is currently working
 on, which is the code most likely to break. So the sweep has to be re-run
 after the edits, not before them: a green plant run taken at the start of a
 session is stale by the end of it.

*(fauxplane, 2026-08-02 — 17 plants; one silently disarmed by a two-hour-old
edit to the very line it guarded, caught only because the harness refuses to
skip.)*

**A headless browser has no sensors, so every automated look at a
sensor-driven app sees the same failed screen.** That screen is worth asserting
— it is the all-permissions-denied acceptance criterion — but it is also the one
state in which a mirrored horizon, an upside-down tape or a needle at the wrong
end of its scale is completely invisible. A small script that drives the app's
own state store from outside, through the same public write the sensors use, and
screenshots two or three deliberately opposite scenes (climbing right turn,
descending left turn) costs half an hour and is the only reason the roll-sign
bug above was visually confirmed rather than merely argued. It is a test bench
holding wires to the connector, not a signal generator soldered inside the box —
worth saying plainly in the file header for any app whose whole premise is that
it contains no synthetic data path.
*(fauxplane, 2026-08-02.)*

**A test built from a degenerate case validates the degenerate case — and can be
structurally blind to the bug.** fauxplane's magnetic model was tested with two
synthetic fields: a pure axial dipole (declination must be zero everywhere) and
a dipole tilted into one meridian plane (declination must be zero on it). Both
are good invariants, both passed, and both are **degree 1** — where every
Schmidt normalisation factor happens to be exactly 1. The implementation had the
m=0 normalisation wrong at every degree from 2 to 12, and the tests could not
see it in principle, not by bad luck. The symptom was worse than a crash:
declination came out **three to five degrees wrong** while total intensity and
inclination stayed close, because the dipole term dominates those two. A pilot
reconciling a compass against a GPS track would have been handed a plausible,
stable, wrong number.

Two more bugs in the same file had the same character. The northward component
was negated (theta-hat points *south*, so X = -B_theta), and the
geocentric-to-geodetic rotation had its angle backwards — zero error at the
equator, degrees of it at high latitude. Each was individually invisible: the
output was always finite, stable, and varied sensibly with position.

**The rule: when a published model has published test values, those are the
test.** NOAA ships a 213-row validation table with the World Magnetic Model.
Running against it found all three bugs in one pass and now holds the
implementation to 0.05 degrees at a hundred points including the poles and
100 km altitude. The generalisation past geomagnetism: reference implementations
and conformance suites exist for most standards worth implementing — codecs,
colour spaces, geodesy, date arithmetic, unicode — and reaching for one is
cheaper than deriving your own invariants AND strictly stronger, because the
invariants you can think of are drawn from the same understanding that wrote the
bug.
*(fauxplane, 2026-08-02.)*

**"The proxy blocks it" can be true of the host you tried and false of the
data.** A previous session recorded three data bundles as unobtainable because
the egress proxy denied their hosts, and a later session repeated that to the
owner as an assigned task. The owner pushed back on being handed a vague task,
which prompted an actual re-probe — and two of the three were reachable all
along by a different route: the npm registry is on the proxy's allowlist, and
`raw.githubusercontent.com` served the same publisher's same repository that
`*.github.io` would not. Both files were fetched, verified and committed inside
an hour, and the owner's task list went from three items to zero.

Three things fall out, in increasing order of cost:
- **Re-probe blocks rather than inheriting them.** A recorded block is a
 measurement of one host at one moment, not a property of the data.
- **A blocked host is not a blocked ecosystem.** Package registries, git hosts
 and mirrors are separate allowlist entries, and the data you want is very
 often in a package somebody already made for exactly that reason.
- **Before delegating anything, separate what is blocked from what was merely
 not attempted** — Doctrine §6 already says this, and it was still the owner
 who had to ask.

The honesty rider: one of the three, OurAirports, stayed unbuilt afterwards —
not because it was unreachable (it was), but because its published TERMS page
was not, and nothing in the current release consumes it. **When the reason for
a block changes, rewrite the reason.** The stale "egress denied" note had become
false, and a false reason is worse than no reason: it stops the next person
looking.
*(fauxplane, 2026-08-02.)*

**Do not hand the owner a decision the owner has no basis to make, dressed as routine.**
The same handoff asked the owner to rule on whether the module tree should live at
`public/src/` or at repo-root `/src` with a bundler. That is a technical call
with a correct answer — the deploy root is `public/`, native ES modules need no
bundler, and the repo had already settled against a build step — and the session
had already made it correctly. Presenting a settled, defensible decision as an
open question reads as either fishing for cover or as an admission it was done
wrong, and it costs the owner the effort of reconstructing an argument that was
already complete. **Flag a deviation, state the reason, own it.** Ask only when
the answer genuinely turns on something only the owner knows: taste, priority, risk
appetite, or what the thing is for.
*(fauxplane, 2026-08-02 — the pushback made the point directly: framing it as
routine reads as though asking should not have been necessary at all, when the
actual defect was not doing the work correctly the first time.)*

**A fault-injection harness that is not crash-safe is a saboteur with good
intentions.** fauxplane's planting script backed each file up IN MEMORY and
restored it in a `finally` — correct for every failure mode it was designed for,
and useless for the one that happened. An outer shell timeout killed the run
partway through a plant. The `finally` never executed. The working tree kept the
injected fault, which happened to be the one that disables the built-in-test
page's live merge.

It surfaced twenty minutes later, after a clean commit had already been pushed,
as a gate failure that looked exactly like a real regression in code that had
just been verified. The wasted effort went into re-reading correct code hunting
for a bug that a test harness had written. The tell, missed at first, was that
the *same commit* had passed the same gate minutes earlier: **when a gate flips
without the code changing, suspect the tooling before the code.**

The fix is three cheap parts, and it is worth having before the first
interruption rather than after: write the backup TO DISK before touching the
file, handle SIGINT/SIGTERM/SIGHUP with a synchronous restore, and **restore any
leftover backup at the start of the next run** so a SIGKILL — which no handler
can catch — repairs itself rather than needing a diagnosis. Verified by actually
SIGKILLing a run and watching the next one report "restored from an interrupted
earlier run" and go green.

This generalises to anything that deliberately puts a repo into a broken state
for a moment: migration dry-runs, permission-downgrade tests, chaos scripts,
codemod previews. If the process can be killed — and it can — the repair has to
survive the process.
*(fauxplane, 2026-08-02. Same family as the earlier rule against `git checkout`
to undo a plant: both are about the fact that the undo is the dangerous half.)*
