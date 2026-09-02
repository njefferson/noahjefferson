## 5. Verifying

**Enforced by:** CHECKLIST literal-words — when a headless repro will not come, measure the data and read the reporter's words literally before theorising.

**When a headless repro will not come, measure the data and read the user's
words literally.** A card that "opens, pushes down, then closes" was never
reproduced in the harness across synthetic clicks, real touch taps, forced pans,
and twenty cards left alone. The diagnosis came from two exact phrases — "they
are NOT one pin" and "pushes down" — plus measuring the actual data: two places
353 m apart with scores 0.258 and 0.126. An earlier pass guessed from the same
screenshots and was wrong.
*(photo-pointer, 2026-07-26.)*

**A diagnostic selector that matches decoration reports success falsely.**
Counting `.pin` said the map had markers when it had none, because the legend's
swatches use the same class. Count the thing the framework actually mounts.
*(photo-pointer, 2026-07-26.)*

**An automated accessibility audit can silently decline to check.** Leaflet
popups use CSS transforms, so axe cannot resolve their background and drops
colour-contrast into `incomplete` rather than `violations`. An audit that only
reads `violations` will call blue-on-blue clean. Compute the ratio directly for
anything the audit can't reach.
*(photo-pointer, 2026-07-20 — the popup buttons measured 1.26:1.)*

**A CSS rule you did not write can outrank yours.** `.leaflet-container a` beats
a bare class selector, so a white button colour was silently overridden into
blue text on blue. Specificity, not source order.
*(photo-pointer, 2026-07-20.)*

**Headless browsers run in UTC.** Any time-of-day assertion needs the real
timezone set explicitly or sunset reads as 3:21 AM.

**Small samples of a flaky test prove nothing.** A 3-of-6 versus 1-of-6 reading
looked like a real difference and was noise. Also worth knowing: raising a poll
deadline from 6 s to 15 s made a failure *more* frequent, which ruled out
"timeout" entirely.
*(photo-pointer, 2026-07-26.)*
