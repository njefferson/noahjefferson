## 28 · A gate cannot fail on a screen it never opens

**Enforced by:** GATE intersecting-parallels:a11y-gate.mjs — the gate reads the app's own markup for every `<dialog id>` and fails if any has no state that opens it, and fails again if a state names a surface the app no longer has.

Intersecting Parallels shipped 1.19.0 with a new release-notes panel and 1.20.0
with a new diagnostic panel. Both went through an accessibility gate that runs
axe, computes contrast, and measures every target across two themes and two
phone widths. Both were **completely unmeasured**, and nothing said so.

The gate keeps a list of surfaces and the control that opens each one. Adding a
screen to the app and adding it to that list are **two separate acts**, and only
the first is forced by wanting the feature. So the second is skipped exactly when
a session is busy — which is always the session that adds a screen.

The proof of how much was missed: the moment the release-notes panel was added to
the list, it failed immediately on `scrollable-region-focusable`. The list scrolls
with a finger and could not be reached from a keyboard at all. That bug shipped,
and would have kept shipping, while the gate reported the app clean.

**This repo already had the rule.** Three days earlier it recorded: *audit what
each gate SELECTS, not what it asserts.* Prose. It was broken twice more, by the
same process that wrote it. That is the whole argument for the mechanical form:

- The **app's markup** is the source of truth for what surfaces exist.
- The gate **derives** the must-audit list from it rather than being told.
- The comparison fails **both ways** — an unaudited surface, and a state pointing
 at a surface that no longer exists, which is coverage that quietly stopped
 applying and looks identical to coverage that works.

**Generalises past dialogs.** Any gate with a hand-maintained list of things to
check — routes, components, locales, breakpoints, config keys — has this defect,
and hub LESSONS §22 is the same lesson about file lists. If the list can be
derived from the artefact, derive it. If it genuinely cannot, the gate should at
least count what it covered and say so out loud, because a silent 6-of-8 reads
exactly like an 8-of-8.

*(Intersecting Parallels 1.20.0 and the tooling commit after 1.21.0, 2026-08-03.)*

---
