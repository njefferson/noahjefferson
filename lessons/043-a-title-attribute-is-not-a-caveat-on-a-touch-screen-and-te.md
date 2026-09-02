## 43 · A `title` attribute is not a caveat on a touch screen, and `textContent` cannot tell you that

**Enforced by:** GATE fauxplane:scripts/a11y-gate.mjs — the follow-route check measures a bounding box, not `textContent`; and GATE fauxplane:scripts/plant.mjs — the plant that deletes the caveat while keeping the value.

fauxplane shows a followed flight's route. adsb.lol *infer* that route from the
callsign and call it **plausible**, so the panel is obliged to carry the word:
`KSFO → KJFK` presented bare reads, to the person this app is built for and who
is not a pilot, as the flight plan the crew filed.

The first build put the qualifier in `el.title`.

**On the phone and the iPad this app exists for, that is not a hiding place —
it is a deletion.** There is no hover on a touch screen. The one sentence
stopping a guess being read as a clearance was, on every device that would ever
run it, absent.

**The check that should have caught it would have passed.** A DOM assertion
built the obvious way — read the element, look for the word — finds `title`
just as happily as it finds a text node, because `getAttribute('title')` and
`textContent` are both just strings on the same object. The check would have
gone green about an empty banner. So the assertion is now a
`getBoundingClientRect` with real width and height, plus text that is really
there: the only definition of "on screen" that a `title`, a `visibility:
hidden`, or a zero-height container cannot satisfy.

**And it needed the reader's own path to measure anything at all.** The first
run of that check reported `0x0` for a perfectly visible element: the banner
lives inside the PFD page, which is `[hidden]` while the radar is up, and the
check tapped an aircraft on the radar and measured without going back. The fix
is to make the check walk the path — tap, then return to the panel — and never
to weaken the assertion until the number it reads stops being inconvenient.

**The general shape: "is the text present" and "can a reader read it" are
different questions, and the DOM only answers the first.** Anywhere a value is
qualified — a caveat, a unit, a provenance flag, an "estimated" — the qualifier
has to be measured the way a reader meets it. This is the same failure as hub
§29, where an `aria-label` satisfied a substring check by accident: both are a
check reading the machine's copy of the text instead of the reader's.

*(fauxplane 1.21.0, 2026-08-04.)*

---
