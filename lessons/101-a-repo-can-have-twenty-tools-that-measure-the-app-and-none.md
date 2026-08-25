## 101 · A repo can have twenty tools that measure the app and none that shows it — and the one you write to fix that will render a state no person can reach

**Enforced by:** CHECKLIST look-at-it — before answering any question about how a
UI reads, render it and look. And a tool that drives the app for a picture uses
REAL input events (`page.tap` / `page.click` with `hasTouch`), never
`element.click()` inside `page.evaluate`: a synthetic click is not a user
interaction, so the browser's focus modality stays wherever it was and the
picture shows focus rings a finger never gets.

An app was asked, in effect, whether the UI it had arrived at by iteration was
the UI a version designed whole would have. The answer came back as pixel
offsets, control counts and screens-to-first-thing. **The app was never rendered
and looked at.** The repo had twenty gates — contrast, targets, separation,
axe, budgets, vocabulary, a full two-theme walk of thirty-three states — and not
one of them produced a picture.

**Every defect reported from the device across seven releases was visible at a
glance and came from none of the numbers.** Text that scaled the letters and not
the boxes. A proof line cut through the middle of its own sentence. Two buttons
touching. A screen showing exactly one task that was still too busy to begin in.
Each was found by a person looking at a screen, and each was green in CI at the
time, correctly — the gates measured what they measured.

**What one picture had that no number did**, on a screen every gate passed:
eleven outlined rounded rectangles of identical visual weight, so nothing led;
the task itself drawn as a bordered box identical to the capture field above it
and the input below it, so the one thing the app exists to hand somebody was
rendered as a form to fill in; six verbs as six full-width boxes stacking one
per line; three dark-filled buttons of equal loudness on one screen. **Visual
weight is not a quantity any of those gates were built to hold**, and "nothing
recedes so nothing leads" has no threshold to fail.

**Then the looking tool did it too, within an hour.** Its first version drove the
app with `element.click()` inside `page.evaluate`. Chromium does not count that
as a user interaction, so the focus modality is left at whatever it was, and the
picture it produced of the app's quietest mode had a 3px focus ring painted
around the heading — the loudest box on a screen whose entire purpose is that
nothing is loud. That ring is not in the app. Probed with a real tap:
`:focus-visible` false, `outline` 0px. Probed with the keyboard: the ring, which
is exactly correct. **A tool built to show the truth about a screen had been
rendering a state no person can reach**, and it nearly bought a "fix" to
behaviour that was already right.

**That is this family's oldest defect wearing a new hat** — the check whose
passing branch measures something other than the thing (§100), the audit that
asked about intersection when the report was about abutment, the target list
that hid four undersized controls for months. The novelty is only that this one
produced a *picture*, and a picture is believed on sight in a way a number is
argued with.

**Three things to take:**

- **A gate suite with no renderer is not complete**, however many gates it has.
  Add the tool that draws the screen, give it a one-word command, and make it
  assert nothing — its output is for a person's eyes, and an exit code would
  only invite somebody to satisfy it instead of looking.
- **Photograph the whole page, not the first screen.** What is below the fold is
  the half nobody looks at and the half that grows without anyone deciding to.
- **Verify before you fix what a picture shows you.** The instrument is part of
  the picture. Reproduce the defect through the route a person takes — with the
  right input modality — before changing a line.
