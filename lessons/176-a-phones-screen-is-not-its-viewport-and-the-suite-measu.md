## 176 · A phone's screen is not its viewport, and a suite that measures the screen is 27% too generous forever

**Enforced by:** GATE cv-thalweg:tools/a11y.mjs — the phone passes run at
Playwright's own device viewports (390x664, 320x568) and at a keyboard-raised
390x364, and assert the readings' share, the furniture's share, and every
band's height budget at each. · CHECKLIST viewport-not-screen — take phone
dimensions from the browser automation library's device registry, never from a
spec sheet or from memory; the two differ by the browser's own chrome and the
difference is always in the direction of flattering the layout.

**Smell:** a test viewport that matches a phone's advertised resolution in CSS
pixels. 390x844, 375x812, 414x896 are SCREENS. No page is ever that tall.

An iPhone 13 is sold as 390 by 844. Safari's chrome takes 180 of those points,
so the page gets **390 by 664** — Playwright's `devices['iPhone 13']` says
exactly this, viewport and screen as separate fields, and it is right there in
the library the suite already imports.

Thalweg's accessibility suite ran its phone pass at 390x844 from its first
commit. Correcting it to 664 turned two passing checks red immediately, and
what they were hiding was a regression of a defect the app had already fixed
once. A river ribbon had been given a width that fits and a height that never
was: four rows at 44px plus its chrome is a 263px band on every screen there
is. On the real viewport that left the readings 237px. On an iPhone SE it left
**125px**. With the software keyboard up — 364px of visual viewport — it left
**twenty-two pixels**, which is the same failure, in the same panel, that had
been found at 34px and fixed, and it came back because the fix was verified
against a phone 27% taller than the one anybody holds.

Three things worth carrying.

**The keyboard case finds what nothing else does.** iOS takes roughly 300
points for the software keyboard. Any panel whose way out sits at the bottom
of a scrolling body has no way out at all under one, and any header that was
merely large becomes most of the screen. It costs one more context in the
suite.

**A budget must cover the BAND, not the drawing.** Bounding the SVG left the
legend, the note and the padding unbounded, and they were two thirds of the
height on a short screen. The reliable shape measures what actually rendered
and makes one corrective pass with the overshoot subtracted, rather than
raising a constant until the number looks better (§174).

**Check what the check calls chrome.** The failing assertion added the ribbon
to the header and required the sum to be under half the screen. The ribbon
plots every gauge on the river coloured by water temperature: it is the
content. Reclassifying it — furniture under a third, ribbon under a third of
its own, readings over 40% — is not moving a goalpost, it is measuring the
thing the rule was always about. And where even a floor will not fit, the band
is dropped and **says** it was dropped: a view that vanishes without a word is
indistinguishable from one that failed to load.

**None of this touches the engine.** These are Chromium at Safari's
measurements, which settles every question of geometry and no question of
behaviour — §175 is a defect no viewport size would have shown. Two different
gaps, and only one of them closes with a number.
